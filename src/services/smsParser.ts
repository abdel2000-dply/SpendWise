import { ParsedSMSTransaction } from "../types";
import { generateId } from "../utils/generateId";

// Common bank SMS patterns for different banks
// These patterns extract amount, merchant/description, and transaction type

interface SMSPattern {
  name: string;
  regex: RegExp;
  type: "expense" | "income";
  amountGroup: number;
  merchantGroup?: number;
}

const SMS_PATTERNS: SMSPattern[] = [
  // Generic debit patterns
  {
    name: "debit_generic",
    regex:
      /(?:debited|deducted|spent|paid|purchased|withdrawn|charged)\s*(?:of\s+)?(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)/i,
    type: "expense",
    amountGroup: 1,
  },
  // Generic credit patterns
  {
    name: "credit_generic",
    regex:
      /(?:credited|received|deposited|refund|cashback|salary)\s*(?:of\s+)?(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)/i,
    type: "income",
    amountGroup: 1,
  },
  // Amount first patterns: "MAD 500.00 debited"
  {
    name: "amount_first_debit",
    regex:
      /(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)\s*([\d,]+\.?\d*)\s*(?:has been |was |is )?(?:debited|deducted|spent|charged)/i,
    type: "expense",
    amountGroup: 1,
  },
  // Amount first patterns: "MAD 500.00 credited"
  {
    name: "amount_first_credit",
    regex:
      /(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)\s*([\d,]+\.?\d*)\s*(?:has been |was |is )?(?:credited|received|deposited)/i,
    type: "income",
    amountGroup: 1,
  },
  // "Your a/c ...debited by Rs.500"
  {
    name: "account_debit",
    regex:
      /(?:a\/c|account|acct).*?(?:debited|deducted)\s*(?:by|with|for)?\s*(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)/i,
    type: "expense",
    amountGroup: 1,
  },
  // "Your a/c ...credited with Rs.500"
  {
    name: "account_credit",
    regex:
      /(?:a\/c|account|acct).*?(?:credited)\s*(?:by|with|for)?\s*(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)/i,
    type: "income",
    amountGroup: 1,
  },
  // POS/ATM transaction
  {
    name: "pos_atm",
    regex:
      /(?:POS|ATM|UPI|NEFT|IMPS)\s*.*?(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)/i,
    type: "expense",
    amountGroup: 1,
  },
  // "Transaction of Rs.500 at Merchant"
  {
    name: "transaction_at",
    regex:
      /(?:transaction|txn|purchase)\s+(?:of\s+)?(?:MAD|USD|EUR|GBP|INR|Rs\.?|₹|\$|€|£)?\s*([\d,]+\.?\d*)\s+(?:at|for|to)\s+(.+?)(?:\.|,|$)/i,
    type: "expense",
    amountGroup: 1,
    merchantGroup: 2,
  },
];

// Extract merchant/description from SMS
const MERCHANT_PATTERNS = [
  /(?:at|to|for|@)\s+(.+?)(?:\s+on|\s+dated|\s+ref|\.|,|$)/i,
  /(?:Info:\s*)(.+?)(?:\.|$)/i,
  /(?:towards|VPA)\s+(.+?)(?:\s+on|\.|,|$)/i,
];

// Extract date from SMS
const DATE_PATTERNS = [
  /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
  /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})/i,
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s+\d{2,4})/i,
];

export const parseSMS = (message: string): ParsedSMSTransaction | null => {
  const trimmed = message.trim();
  if (!trimmed) return null;

  // Try each pattern
  for (const pattern of SMS_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const amountStr = match[pattern.amountGroup]?.replace(/,/g, "");
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) continue;

      // Try to extract merchant
      let merchant: string | undefined;
      if (pattern.merchantGroup && match[pattern.merchantGroup]) {
        merchant = match[pattern.merchantGroup].trim();
      } else {
        for (const mp of MERCHANT_PATTERNS) {
          const mMatch = trimmed.match(mp);
          if (mMatch?.[1]) {
            merchant = mMatch[1].trim().substring(0, 50);
            break;
          }
        }
      }

      // Try to extract date
      let date = new Date();
      for (const dp of DATE_PATTERNS) {
        const dMatch = trimmed.match(dp);
        if (dMatch?.[1]) {
          const parsed = new Date(dMatch[1]);
          if (!isNaN(parsed.getTime())) {
            date = parsed;
            break;
          }
        }
      }

      return {
        id: generateId(),
        rawMessage: trimmed,
        amount,
        type: pattern.type,
        merchant,
        date,
        isPending: true,
        isApproved: false,
      };
    }
  }

  return null;
};

export const parseBulkSMS = (messages: string[]): ParsedSMSTransaction[] => {
  return messages
    .map(parseSMS)
    .filter((result): result is ParsedSMSTransaction => result !== null);
};

// Auto-categorize based on merchant name
export const suggestCategory = (
  merchant: string | undefined,
  categoryMap: Record<string, string>,
): string | undefined => {
  if (!merchant) return undefined;

  const lower = merchant.toLowerCase();

  // Built-in keyword to category mapping
  const keywordMap: Record<string, string> = {
    uber: "transport",
    lyft: "transport",
    taxi: "transport",
    bus: "transport",
    metro: "transport",
    fuel: "transport",
    gas: "transport",
    petrol: "transport",
    restaurant: "food",
    cafe: "food",
    coffee: "food",
    starbucks: "food",
    mcdonalds: "food",
    pizza: "food",
    food: "food",
    grocery: "food",
    supermarket: "food",
    carrefour: "food",
    marjane: "food",
    walmart: "food",
    amazon: "shopping",
    shop: "shopping",
    mall: "shopping",
    store: "shopping",
    zara: "shopping",
    hm: "shopping",
    netflix: "entertainment",
    spotify: "entertainment",
    cinema: "entertainment",
    movie: "entertainment",
    game: "entertainment",
    gym: "health",
    pharmacy: "health",
    hospital: "health",
    doctor: "health",
    medical: "health",
    rent: "housing",
    electricity: "utilities",
    water: "utilities",
    internet: "utilities",
    phone: "utilities",
    school: "education",
    university: "education",
    tuition: "education",
    course: "education",
    salary: "salary",
    transfer: "transfer",
  };

  for (const [keyword, categoryKey] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      // Check user's custom mapping first
      return categoryMap[categoryKey] || categoryKey;
    }
  }

  return undefined;
};
