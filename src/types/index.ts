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

export interface ExpenseFormData {
  amount: string;
  categoryId: string;
  date: Date;
  note?: string;
}

export interface Statistics {
  totalSpent: number;
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

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type TimeFilter = "day" | "week" | "month" | "year" | "custom";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  icon: string;
  color: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
