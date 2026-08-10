export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  budget?: number;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: Category;
  date: Date;
  note?: string;
  tags?: string[];
  receiptPhoto?: string;
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface RecurringConfig {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: Date;
}

export interface Budget {
  id: string;
  categoryId?: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  alertThreshold: number;
}

// --- Income Tracking ---

export interface IncomeSource {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Income {
  id: string;
  amount: number;
  currency: string;
  source: IncomeSource;
  date: Date;
  note?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  createdAt: Date;
  updatedAt: Date;
}

// --- Savings Goals ---

export interface SavingsContribution {
  id: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  createdAt: Date;
  contributions: SavingsContribution[];
}

// --- Unified Transaction ---

export type Transaction =
  | (Expense & { type: "expense" })
  | (Income & { type: "income" });

// --- Forms ---

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  date: Date;
  note?: string;
}

export interface IncomeFormData {
  amount: string;
  sourceId: string;
  date: Date;
  note?: string;
}

// --- Statistics ---

export interface Statistics {
  totalSpent: number;
  totalIncome: number;
  balance: number;
  categoryBreakdown: CategorySpending[];
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

export interface CategorySpending {
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetStatus {
  budget: Budget;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type TimeFilter = "day" | "week" | "month" | "year" | "custom";

// --- Onboarding ---

export interface UserProfile {
  name: string;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: Date;
}

// --- Recurring Transactions ---

export interface RecurringTransaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  category?: Category;
  source?: IncomeSource;
  note?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDueDate: Date;
  lastProcessedDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

// --- Quick Add Templates ---

export interface QuickTemplate {
  id: string;
  name: string;
  amount: number;
  type: "expense" | "income";
  categoryId?: string;
  sourceId?: string;
  icon: string;
  color: string;
  usageCount: number;
}

// --- Tags ---

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// --- AI Coach ---

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO string for Redux serializability
}

export interface FinancialHealthScore {
  overall: number;
  budgetAdherence: number;
  savingsRate: number;
  spendingTrend: number;
  consistency: number;
  generatedAt: Date;
}

// --- SMS Parsing ---

export interface ParsedSMSTransaction {
  id: string;
  rawMessage: string;
  amount: number;
  type: "expense" | "income";
  merchant?: string;
  date: Date;
  isPending: boolean;
  isApproved: boolean;
}

// --- Spending Challenges ---

export interface SpendingChallenge {
  id: string;
  title: string;
  description: string;
  type: "no-spend" | "limit" | "save";
  targetAmount?: number;
  categoryId?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
  icon: string;
  color: string;
}
