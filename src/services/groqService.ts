import { Budget, Category, Expense, Income, SavingsGoal } from "../types";
import {
  calculateBalance,
  calculateCategoryBreakdown,
  generateSmartInsights,
  getCategoryBudgetStatus,
  getMonthOverMonthChange,
} from "../utils/calculations";
import { formatCurrency } from "../utils/formatters";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

// Priority: .env key > in-app settings key
export function getApiKey(settingsKey?: string): string | null {
  const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  if (settingsKey && settingsKey.trim().length > 0) return settingsKey.trim();
  return null;
}

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function buildFinancialContext(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  categories: Category[],
  savingsGoals: SavingsGoal[],
  currency: string,
): string {
  const balance = calculateBalance(incomes, expenses, "month");
  const breakdown = calculateCategoryBreakdown(expenses, categories);
  const budgetStatuses = getCategoryBudgetStatus(budgets, expenses, categories);
  const monthChange = getMonthOverMonthChange(expenses);
  const insights = generateSmartInsights(
    expenses,
    incomes,
    budgets,
    categories,
  );

  const topCategories = breakdown
    .slice(0, 5)
    .map(
      (c) =>
        `${c.category.name}: ${formatCurrency(c.amount, currency)} (${c.percentage.toFixed(0)}%)`,
    )
    .join(", ");

  const overBudget = budgetStatuses
    .filter((b) => b.isOverBudget)
    .map((b) => `${b.categoryName} (${b.percentage.toFixed(0)}% used)`)
    .join(", ");

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return `User's financial snapshot (this month):
- Monthly income: ${formatCurrency(balance.income, currency)}
- Monthly expenses: ${formatCurrency(balance.expenses, currency)}
- Net balance: ${formatCurrency(balance.balance, currency)}
- Month-over-month spending change: ${monthChange.direction === "up" ? "+" : "-"}${monthChange.percentage.toFixed(0)}%
- Top spending categories: ${topCategories || "No data yet"}
- Over-budget categories: ${overBudget || "None"}
- Savings progress: ${formatCurrency(totalSaved, currency)} of ${formatCurrency(totalTarget, currency)} target
- Smart insights: ${insights.join("; ") || "Not enough data"}
- Total transactions this month: ${expenses.length} expenses, ${incomes.length} incomes
- Currency: ${currency}`;
}

const SYSTEM_PROMPT = `You are SpendWise AI Coach, a friendly and knowledgeable personal finance assistant. You help users understand their spending habits, create better budgets, and reach their savings goals.

Guidelines:
- Be concise and practical. Give actionable advice.
- Use the financial context provided to personalize your responses.
- When discussing amounts, use the user's currency.
- Be encouraging but honest about overspending.
- Suggest specific, achievable steps.
- Don't make up data — only reference what's in the context.
- Keep responses under 200 words unless the user asks for detail.
- Use simple language, no financial jargon unless explaining it.`;

export async function sendMessage(
  apiKey: string,
  userMessage: string,
  conversationHistory: GroqMessage[],
  financialContext: string,
): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n${financialContext}`,
    },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: "user", content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 1,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    if (response.status === 401) {
      throw new Error(
        "Invalid API key. Please check your Groq API key in Settings.",
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Rate limit reached. Please wait a moment and try again.",
      );
    }
    throw new Error(`API error (${response.status}): ${errorData}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || "I couldn't generate a response.";
}

export function getFinancialContext(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  categories: Category[],
  savingsGoals: SavingsGoal[],
  currency: string,
): string {
  return buildFinancialContext(
    expenses,
    incomes,
    budgets,
    categories,
    savingsGoals,
    currency,
  );
}

export const SUGGESTED_QUESTIONS = [
  "How am I doing this month?",
  "Where can I cut spending?",
  "Am I on track with my budgets?",
  "Tips to save more money?",
  "Analyze my spending habits",
];
