import { Category, Expense } from "../types";

// Keyword-to-category mapping for auto-categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    "restaurant",
    "cafe",
    "coffee",
    "lunch",
    "dinner",
    "breakfast",
    "pizza",
    "burger",
    "sushi",
    "mcdonalds",
    "starbucks",
    "kfc",
    "subway",
    "dominos",
    "uber eats",
    "deliveroo",
    "grubhub",
    "doordash",
    "takeout",
    "takeaway",
    "snack",
    "bakery",
    "deli",
  ],
  transportation: [
    "uber",
    "lyft",
    "taxi",
    "cab",
    "bus",
    "train",
    "metro",
    "subway",
    "gas",
    "fuel",
    "petrol",
    "parking",
    "toll",
    "careem",
    "bolt",
    "grab",
    "transit",
  ],
  shopping: [
    "amazon",
    "walmart",
    "target",
    "zara",
    "h&m",
    "nike",
    "adidas",
    "clothes",
    "clothing",
    "shoes",
    "fashion",
    "mall",
    "store",
    "ebay",
    "aliexpress",
    "shein",
  ],
  entertainment: [
    "netflix",
    "spotify",
    "cinema",
    "movie",
    "concert",
    "game",
    "gaming",
    "playstation",
    "xbox",
    "steam",
    "youtube",
    "hulu",
    "disney",
    "hbo",
    "twitch",
    "theater",
    "theatre",
    "museum",
  ],
  bills: [
    "electric",
    "electricity",
    "water",
    "internet",
    "wifi",
    "phone",
    "mobile",
    "rent",
    "mortgage",
    "insurance",
    "utility",
    "utilities",
    "cable",
    "gas bill",
  ],
  healthcare: [
    "doctor",
    "hospital",
    "pharmacy",
    "medicine",
    "dental",
    "dentist",
    "clinic",
    "medical",
    "health",
    "prescription",
    "therapy",
    "optician",
    "glasses",
    "contacts",
  ],
  education: [
    "school",
    "university",
    "college",
    "course",
    "udemy",
    "coursera",
    "book",
    "textbook",
    "tuition",
    "class",
    "training",
    "tutorial",
    "skillshare",
    "masterclass",
  ],
  travel: [
    "flight",
    "hotel",
    "airbnb",
    "booking",
    "hostel",
    "vacation",
    "trip",
    "luggage",
    "passport",
    "visa",
    "travel",
    "airline",
  ],
  groceries: [
    "grocery",
    "groceries",
    "supermarket",
    "market",
    "carrefour",
    "whole foods",
    "costco",
    "aldi",
    "lidl",
    "tesco",
    "kroger",
    "vegetables",
    "fruits",
    "meat",
  ],
  fitness: [
    "gym",
    "fitness",
    "yoga",
    "workout",
    "protein",
    "supplement",
    "running",
    "sports",
    "swimming",
    "peloton",
    "crossfit",
  ],
  subscriptions: [
    "subscription",
    "monthly",
    "annual",
    "premium",
    "pro plan",
    "membership",
    "apple music",
    "icloud",
    "google one",
    "dropbox",
  ],
};

/**
 * Suggests a category based on the transaction note using keyword matching.
 * Also learns from past transactions with similar notes.
 */
export const suggestCategory = (
  note: string,
  categories: Category[],
  pastExpenses?: Expense[],
): Category | null => {
  if (!note || note.trim().length === 0) return null;

  const normalizedNote = note.toLowerCase().trim();

  // 1. Check past transactions for exact/similar notes
  if (pastExpenses && pastExpenses.length > 0) {
    const matchingExpense = pastExpenses.find((e) => {
      if (!e.note) return false;
      const pastNote = e.note.toLowerCase().trim();
      return (
        pastNote === normalizedNote ||
        normalizedNote.includes(pastNote) ||
        pastNote.includes(normalizedNote)
      );
    });
    if (matchingExpense) {
      const matchedCategory = categories.find(
        (c) => c.id === matchingExpense.category.id,
      );
      if (matchedCategory) return matchedCategory;
    }
  }

  // 2. Keyword matching
  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedNote.includes(keyword)) {
        const matched = categories.find((c) => c.id === categoryId);
        if (matched) return matched;
      }
    }
  }

  return null;
};

/**
 * Returns the most frequently used category from recent expenses.
 */
export const getMostUsedCategory = (
  expenses: Expense[],
  limit: number = 30,
): string | null => {
  const recent = expenses.slice(0, limit);
  if (recent.length === 0) return null;

  const counts = new Map<string, number>();
  for (const expense of recent) {
    const id = expense.category.id;
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  let maxId: string | null = null;
  let maxCount = 0;
  for (const [id, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxId = id;
    }
  }

  return maxId;
};
