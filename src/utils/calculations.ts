import {
  addDays,
  differenceInDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getDaysInMonth,
  isWeekend,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  Budget,
  BudgetStatus,
  Category,
  CategorySpending,
  Expense,
  FinancialHealthScore,
  Income,
  SavingsGoal,
} from "../types";

export const calculateTotalSpent = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const filterExpensesByDateRange = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date,
): Expense[] => {
  return expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), {
      start: startDate,
      end: endDate,
    }),
  );
};

export const getExpensesByPeriod = (
  expenses: Expense[],
  period: "day" | "week" | "month" | "year",
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
  categories: Category[],
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
  days: number = 30,
): number => {
  const total = calculateTotalSpent(expenses);
  return days > 0 ? total / days : 0;
};

export const groupExpensesByDate = (
  expenses: Expense[],
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
  ascending: boolean = false,
): Expense[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// --- Income Calculations ---

export const calculateTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((total, income) => total + income.amount, 0);
};

export const getIncomesByPeriod = (
  incomes: Income[],
  period: "day" | "week" | "month" | "year",
): Income[] => {
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

  return incomes.filter((income) =>
    isWithinInterval(new Date(income.date), { start, end }),
  );
};

export const calculateBalance = (
  incomes: Income[],
  expenses: Expense[],
  period?: "day" | "week" | "month" | "year",
): { income: number; expenses: number; balance: number } => {
  const filteredIncomes = period
    ? getIncomesByPeriod(incomes, period)
    : incomes;
  const filteredExpenses = period
    ? getExpensesByPeriod(expenses, period)
    : expenses;
  const totalIncome = calculateTotalIncome(filteredIncomes);
  const totalExpenses = calculateTotalSpent(filteredExpenses);
  return {
    income: totalIncome,
    expenses: totalExpenses,
    balance: totalIncome - totalExpenses,
  };
};

// --- Budget Calculations ---

export const calculateBudgetUsage = (
  budget: Budget,
  expenses: Expense[],
): { spent: number; remaining: number; percentage: number } => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (budget.period) {
    case "daily":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "weekly":
      start = startOfWeek(now);
      end = endOfWeek(now);
      break;
    case "monthly":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case "yearly":
      start = startOfYear(now);
      end = endOfYear(now);
      break;
  }

  const periodExpenses = expenses.filter((expense) => {
    const inPeriod = isWithinInterval(new Date(expense.date), { start, end });
    const matchesCategory =
      !budget.categoryId || expense.category.id === budget.categoryId;
    return inPeriod && matchesCategory;
  });

  const spent = calculateTotalSpent(periodExpenses);
  const remaining = Math.max(0, budget.amount - spent);
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return { spent, remaining, percentage };
};

export const getCategoryBudgetStatus = (
  budgets: Budget[],
  expenses: Expense[],
  categories: Category[],
): BudgetStatus[] => {
  return budgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);
    const { spent, remaining, percentage } = calculateBudgetUsage(
      budget,
      expenses,
    );
    return {
      budget,
      categoryName: category?.name || "Overall",
      categoryIcon: category?.icon || "wallet",
      categoryColor: category?.color || "#6C63FF",
      spent,
      remaining,
      percentage,
      isOverBudget: percentage > 100,
      isNearLimit: percentage >= budget.alertThreshold && percentage <= 100,
    };
  });
};

// --- Savings Calculations ---

export const calculateSavingsProgress = (
  goal: SavingsGoal,
): { percentage: number; remaining: number; onTrack: boolean } => {
  const percentage =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  let onTrack = true;
  if (goal.deadline) {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const created = new Date(goal.createdAt);
    const totalDays = Math.max(
      1,
      (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    const elapsedDays = Math.max(
      0,
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    const expectedPercentage = (elapsedDays / totalDays) * 100;
    onTrack = percentage >= expectedPercentage * 0.8; // 80% tolerance
  }

  return { percentage: Math.min(percentage, 100), remaining, onTrack };
};

// --- Trend & Insight Calculations ---

export const getSpendingTrend = (
  expenses: Expense[],
  periodCount: number = 7,
  granularity: "day" | "week" | "month" = "day",
): { label: string; amount: number }[] => {
  const now = new Date();
  const result: { label: string; amount: number }[] = [];

  for (let i = periodCount - 1; i >= 0; i--) {
    let start: Date;
    let end: Date;
    let label: string;

    switch (granularity) {
      case "day":
        start = startOfDay(subDays(now, i));
        end = endOfDay(subDays(now, i));
        label = format(start, "EEE");
        break;
      case "week":
        start = startOfWeek(subWeeks(now, i));
        end = endOfWeek(subWeeks(now, i));
        label = format(start, "MMM d");
        break;
      case "month":
        start = startOfMonth(subMonths(now, i));
        end = endOfMonth(subMonths(now, i));
        label = format(start, "MMM");
        break;
    }

    const periodExpenses = filterExpensesByDateRange(expenses, start, end);
    result.push({ label, amount: calculateTotalSpent(periodExpenses) });
  }

  return result;
};

export const getIncomeTrend = (
  incomes: Income[],
  periodCount: number = 6,
  granularity: "month" = "month",
): { label: string; amount: number }[] => {
  const now = new Date();
  const result: { label: string; amount: number }[] = [];

  for (let i = periodCount - 1; i >= 0; i--) {
    const start = startOfMonth(subMonths(now, i));
    const end = endOfMonth(subMonths(now, i));
    const label = format(start, "MMM");

    const periodIncomes = incomes.filter((income) =>
      isWithinInterval(new Date(income.date), { start, end }),
    );
    result.push({ label, amount: calculateTotalIncome(periodIncomes) });
  }

  return result;
};

export const getMonthOverMonthChange = (
  expenses: Expense[],
): {
  amount: number;
  percentage: number;
  direction: "up" | "down" | "same";
} => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisMonthTotal = calculateTotalSpent(
    filterExpensesByDateRange(expenses, thisMonthStart, thisMonthEnd),
  );
  const lastMonthTotal = calculateTotalSpent(
    filterExpensesByDateRange(expenses, lastMonthStart, lastMonthEnd),
  );

  const diff = thisMonthTotal - lastMonthTotal;
  const percentage = lastMonthTotal > 0 ? (diff / lastMonthTotal) * 100 : 0;

  return {
    amount: Math.abs(diff),
    percentage: Math.abs(percentage),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
  };
};

export const getTopCategories = (
  expenses: Expense[],
  limit: number = 5,
): CategorySpending[] => {
  const breakdown = calculateCategoryBreakdown(expenses, []);
  return breakdown.slice(0, limit);
};

export const generateSmartInsights = (
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  categories: Category[],
): string[] => {
  const insights: string[] = [];
  const now = new Date();

  // Month-over-month change
  const monthChange = getMonthOverMonthChange(expenses);
  if (monthChange.direction === "up" && monthChange.percentage > 10) {
    insights.push(
      `You're spending ${monthChange.percentage.toFixed(0)}% more this month compared to last month.`,
    );
  } else if (monthChange.direction === "down" && monthChange.percentage > 10) {
    insights.push(
      `Great job! Spending is down ${monthChange.percentage.toFixed(0)}% from last month.`,
    );
  }

  // Biggest category this month
  const monthExpenses = getExpensesByPeriod(expenses, "month");
  const topCategories = getTopCategories(monthExpenses, 1);
  if (topCategories.length > 0) {
    insights.push(
      `Your biggest expense category is ${topCategories[0].category.name} at ${topCategories[0].percentage.toFixed(0)}% of spending.`,
    );
  }

  // Budget status
  const budgetStatuses = getCategoryBudgetStatus(budgets, expenses, categories);
  const overBudget = budgetStatuses.filter((b) => b.isOverBudget);
  const onTrack = budgetStatuses.filter(
    (b) => !b.isOverBudget && !b.isNearLimit,
  );
  if (budgetStatuses.length > 0) {
    if (overBudget.length > 0) {
      insights.push(
        `${overBudget.length} of ${budgetStatuses.length} budgets are over limit. Watch your ${overBudget[0].categoryName} spending.`,
      );
    } else if (onTrack.length === budgetStatuses.length) {
      insights.push(
        `You're on track with all ${budgetStatuses.length} budgets this period!`,
      );
    }
  }

  // Income vs Expense balance
  const monthBalance = calculateBalance(incomes, expenses, "month");
  if (monthBalance.income > 0) {
    const savingsRate = (monthBalance.balance / monthBalance.income) * 100;
    if (savingsRate > 0) {
      insights.push(
        `You're saving ${savingsRate.toFixed(0)}% of your income this month.`,
      );
    } else {
      insights.push(
        `You're spending more than you earn this month. Consider cutting back.`,
      );
    }
  }

  // --- Spending Anomaly Detection ---
  const todayExpenses = getExpensesByPeriod(expenses, "day");
  const todayTotal = calculateTotalSpent(todayExpenses);
  const dayOfMonth = now.getDate();
  if (monthExpenses.length > 3 && dayOfMonth > 1) {
    const dailyAvg = calculateTotalSpent(monthExpenses) / dayOfMonth;
    if (todayTotal > dailyAvg * 2.5 && todayTotal > 0) {
      insights.push(
        `Heads up — you've spent ${(todayTotal / dailyAvg).toFixed(1)}x your daily average today.`,
      );
    }
  }

  // --- Weekend vs Weekday Analysis ---
  if (monthExpenses.length >= 5) {
    let weekendTotal = 0;
    let weekdayTotal = 0;
    let weekendDays = 0;
    let weekdayDays = 0;

    const dayTotals = new Map<string, { amount: number; isWeekend: boolean }>();
    for (const exp of monthExpenses) {
      const d = new Date(exp.date);
      const key = format(d, "yyyy-MM-dd");
      const existing = dayTotals.get(key);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        dayTotals.set(key, { amount: exp.amount, isWeekend: isWeekend(d) });
      }
    }

    for (const { amount, isWeekend: isWknd } of dayTotals.values()) {
      if (isWknd) {
        weekendTotal += amount;
        weekendDays++;
      } else {
        weekdayTotal += amount;
        weekdayDays++;
      }
    }

    if (weekendDays > 0 && weekdayDays > 0) {
      const weekendAvg = weekendTotal / weekendDays;
      const weekdayAvg = weekdayTotal / weekdayDays;
      if (weekendAvg > weekdayAvg * 1.3) {
        const pctMore = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
        insights.push(
          `You spend ${pctMore.toFixed(0)}% more on weekends than weekdays.`,
        );
      }
    }
  }

  // --- Budget Forecasting ---
  if (budgetStatuses.length > 0 && dayOfMonth > 3) {
    const daysInMonth = getDaysInMonth(now);
    const daysRemaining = daysInMonth - dayOfMonth;

    for (const status of budgetStatuses) {
      if (status.isOverBudget) continue; // already reported
      const dailyBurnRate = status.spent / dayOfMonth;
      const projectedTotal = dailyBurnRate * daysInMonth;
      if (
        projectedTotal > status.budget.amount &&
        status.spent < status.budget.amount
      ) {
        const exceedDate = Math.ceil(status.budget.amount / dailyBurnRate);
        if (exceedDate <= daysInMonth) {
          insights.push(
            `At current pace, you'll exceed your ${status.categoryName} budget by the ${exceedDate}${getOrdinalSuffix(exceedDate)}.`,
          );
        }
        break; // Only show one forecast
      }
    }
  }

  // --- Payday Pattern Detection ---
  const paydayPattern = detectPaydayPattern(incomes);
  if (paydayPattern.detected && paydayPattern.nextPayday) {
    const daysUntil = differenceInDays(paydayPattern.nextPayday, now);
    if (daysUntil > 0 && daysUntil <= 14) {
      insights.push(
        `Next payday expected in ${daysUntil} day${daysUntil > 1 ? "s" : ""} (~${paydayPattern.averageAmount.toFixed(0)}).`,
      );
    }
  }

  return insights.slice(0, 6); // Max 6 insights
};

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// --- Financial Health Score ---

export const calculateFinancialHealthScore = (
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  categories: Category[],
  savingsGoals: SavingsGoal[],
): FinancialHealthScore => {
  // 1. Budget Adherence (0-100)
  // How well the user stays within their budgets
  let budgetAdherence = 100;
  if (budgets.length > 0) {
    const statuses = getCategoryBudgetStatus(budgets, expenses, categories);
    const adherenceScores = statuses.map((s) => {
      if (s.percentage <= 80) return 100;
      if (s.percentage <= 100) return 80 - (s.percentage - 80);
      // Over budget: penalize proportionally
      return Math.max(0, 60 - (s.percentage - 100) * 0.5);
    });
    budgetAdherence =
      adherenceScores.reduce((a, b) => a + b, 0) / adherenceScores.length;
  }

  // 2. Savings Rate (0-100)
  // Based on monthly income vs expenses ratio
  const monthBalance = calculateBalance(incomes, expenses, "month");
  let savingsRate = 50; // default if no income
  if (monthBalance.income > 0) {
    const rate = (monthBalance.balance / monthBalance.income) * 100;
    if (rate >= 30) savingsRate = 100;
    else if (rate >= 20) savingsRate = 85;
    else if (rate >= 10) savingsRate = 70;
    else if (rate >= 0) savingsRate = 50;
    else savingsRate = Math.max(0, 30 + rate); // negative = overspending
  }

  // 3. Spending Trend (0-100)
  // Reward decreasing or stable spending; penalize increasing
  const monthChange = getMonthOverMonthChange(expenses);
  let spendingTrend = 70; // neutral default
  if (monthChange.direction === "down") {
    spendingTrend = Math.min(100, 70 + monthChange.percentage * 0.5);
  } else if (monthChange.direction === "up") {
    spendingTrend = Math.max(20, 70 - monthChange.percentage * 0.5);
  }

  // 4. Consistency (0-100)
  // Having budgets set, tracking regularly, savings goals active
  let consistency = 0;
  if (budgets.length > 0) consistency += 25;
  if (budgets.length >= 3) consistency += 10;
  const monthExpenses = getExpensesByPeriod(expenses, "month");
  if (monthExpenses.length >= 10) consistency += 25;
  else if (monthExpenses.length >= 3) consistency += 15;
  if (incomes.length > 0) consistency += 15;
  const activeGoals = savingsGoals.filter(
    (g) => g.currentAmount < g.targetAmount,
  );
  if (activeGoals.length > 0) consistency += 15;
  if (activeGoals.some((g) => g.currentAmount > 0)) consistency += 10;
  consistency = Math.min(100, consistency);

  // Overall: weighted average
  const overall = Math.round(
    budgetAdherence * 0.3 +
      savingsRate * 0.25 +
      spendingTrend * 0.2 +
      consistency * 0.25,
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    budgetAdherence: Math.round(budgetAdherence),
    savingsRate: Math.round(savingsRate),
    spendingTrend: Math.round(spendingTrend),
    consistency: Math.round(consistency),
    generatedAt: new Date(),
  };
};

// --- Payday Pattern Detection ---

export interface PaydayPattern {
  detected: boolean;
  dayOfMonth: number | null;
  averageAmount: number;
  confidence: "high" | "medium" | "low";
  nextPayday: Date | null;
  frequency: "monthly" | "biweekly" | "weekly" | null;
}

export const detectPaydayPattern = (incomes: Income[]): PaydayPattern => {
  const noPattern: PaydayPattern = {
    detected: false,
    dayOfMonth: null,
    averageAmount: 0,
    confidence: "low",
    nextPayday: null,
    frequency: null,
  };

  if (incomes.length < 2) return noPattern;

  // Sort incomes by date
  const sorted = [...incomes]
    .map((i) => ({ ...i, date: new Date(i.date) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by source to find recurring salary-like incomes
  const sourceGroups = new Map<string, typeof sorted>();
  for (const inc of sorted) {
    const key = inc.source.id;
    const group = sourceGroups.get(key) || [];
    group.push(inc);
    sourceGroups.set(key, group);
  }

  // Find the most frequent source with 2+ entries
  let bestSource: typeof sorted = [];
  for (const group of sourceGroups.values()) {
    if (group.length > bestSource.length) {
      bestSource = group;
    }
  }

  if (bestSource.length < 2) {
    // Fallback: use all incomes with similar amounts
    const amounts = sorted.map((i) => i.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    bestSource = sorted.filter(
      (i) => Math.abs(i.amount - avgAmount) / avgAmount < 0.3,
    );
    if (bestSource.length < 2) return noPattern;
  }

  // Check for monthly pattern (same day of month)
  const daysOfMonth = bestSource.map((i) => i.date.getDate());
  const dayFrequency = new Map<number, number>();
  for (const d of daysOfMonth) {
    // Allow ±2 days tolerance
    for (let offset = -2; offset <= 2; offset++) {
      const key = d + offset;
      if (key >= 1 && key <= 31) {
        dayFrequency.set(key, (dayFrequency.get(key) || 0) + 1);
      }
    }
  }

  let mostCommonDay = 0;
  let maxFreq = 0;
  for (const [day, freq] of dayFrequency) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mostCommonDay = day;
    }
  }

  const avgAmount =
    bestSource.reduce((sum, i) => sum + i.amount, 0) / bestSource.length;

  // Check intervals between payments
  const intervals: number[] = [];
  for (let i = 1; i < bestSource.length; i++) {
    intervals.push(
      differenceInDays(bestSource[i].date, bestSource[i - 1].date),
    );
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  let frequency: "monthly" | "biweekly" | "weekly" | null = null;
  if (avgInterval >= 25 && avgInterval <= 35) frequency = "monthly";
  else if (avgInterval >= 12 && avgInterval <= 16) frequency = "biweekly";
  else if (avgInterval >= 5 && avgInterval <= 9) frequency = "weekly";

  const matchRate = maxFreq / bestSource.length;
  const confidence: "high" | "medium" | "low" =
    matchRate >= 0.8 && bestSource.length >= 3
      ? "high"
      : matchRate >= 0.5
        ? "medium"
        : "low";

  // Predict next payday
  const now = new Date();
  let nextPayday: Date | null = null;

  if (frequency === "monthly" && mostCommonDay > 0) {
    const thisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      mostCommonDay,
    );
    if (thisMonth > now) {
      nextPayday = thisMonth;
    } else {
      nextPayday = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        mostCommonDay,
      );
    }
  } else if (frequency && bestSource.length > 0) {
    const lastPay = bestSource[bestSource.length - 1].date;
    nextPayday = addDays(lastPay, Math.round(avgInterval));
    if (nextPayday <= now) {
      nextPayday = addDays(
        now,
        Math.round(
          avgInterval - (differenceInDays(now, lastPay) % avgInterval),
        ),
      );
    }
  }

  return {
    detected: frequency !== null && matchRate >= 0.4,
    dayOfMonth: frequency === "monthly" ? mostCommonDay : null,
    averageAmount: Math.round(avgAmount * 100) / 100,
    confidence,
    nextPayday,
    frequency,
  };
};
