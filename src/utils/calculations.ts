import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { Budget, Category, CategorySpending, Expense } from "../types";

export const calculateTotalSpent = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const filterExpensesByDateRange = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): Expense[] => {
  return expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), {
      start: startDate,
      end: endDate,
    })
  );
};

export const getExpensesByPeriod = (
  expenses: Expense[],
  period: "day" | "week" | "month" | "year"
): Expense[] => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case "day":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "week":
      start = startOfWeek(now);
      end = endOfWeek(now);
      break;
    case "month":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case "year":
      start = startOfYear(now);
      end = endOfYear(now);
      break;
  }

  return filterExpensesByDateRange(expenses, start, end);
};

export const calculateCategoryBreakdown = (
  expenses: Expense[],
  categories: Category[]
): CategorySpending[] => {
  const total = calculateTotalSpent(expenses);

  const categoryMap = new Map<string, CategorySpending>();

  expenses.forEach((expense) => {
    const categoryId = expense.category.id;
    const existing = categoryMap.get(categoryId);

    if (existing) {
      existing.amount += expense.amount;
      existing.transactionCount += 1;
    } else {
      categoryMap.set(categoryId, {
        category: expense.category,
        amount: expense.amount,
        percentage: 0,
        transactionCount: 1,
      });
    }
  });

  const breakdown = Array.from(categoryMap.values());

  // Calculate percentages
  breakdown.forEach((item) => {
    item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
  });

  // Sort by amount descending
  return breakdown.sort((a, b) => b.amount - a.amount);
};

export const calculateDailyAverage = (
  expenses: Expense[],
  days: number = 30
): number => {
  const total = calculateTotalSpent(expenses);
  return days > 0 ? total / days : 0;
};

export const groupExpensesByDate = (
  expenses: Expense[]
): Map<string, Expense[]> => {
  const grouped = new Map<string, Expense[]>();

  expenses.forEach((expense) => {
    const dateKey = new Date(expense.date).toDateString();
    const existing = grouped.get(dateKey);

    if (existing) {
      existing.push(expense);
    } else {
      grouped.set(dateKey, [expense]);
    }
  });

  return grouped;
};

export const sortExpensesByDate = (
  expenses: Expense[],
  ascending: boolean = false
): Expense[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/** Returns spent amount for a given budget in the current period. */
export const getBudgetSpent = (
  budget: Budget,
  expenses: Expense[]
): number => {
  const periodExpenses = getExpensesByPeriod(expenses, budget.period);
  if (budget.categoryId) {
    return calculateTotalSpent(
      periodExpenses.filter((e) => e.category.id === budget.categoryId)
    );
  }
  return calculateTotalSpent(periodExpenses);
};

/** Returns the percentage of budget used (0–100+). */
export const getBudgetUsagePercent = (
  budget: Budget,
  expenses: Expense[]
): number => {
  if (budget.amount <= 0) return 0;
  return (getBudgetSpent(budget, expenses) / budget.amount) * 100;
};

