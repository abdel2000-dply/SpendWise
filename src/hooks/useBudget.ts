import { useCallback } from 'react';
import {
  addBudget,
  deleteBudget,
  updateBudget,
} from '../store/slices/budgetSlice';
import { Budget } from '../types';
import { 
  calculateTotalSpent, 
  getExpensesByPeriod,
  mapBudgetPeriodToTimeFilter 
} from '../utils/calculations';
import { useAppDispatch, useAppSelector } from './useRedux';

/**
 * Custom hook for managing budgets and budget tracking
 */
export const useBudget = () => {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const expenses = useAppSelector((state) => state.expenses.expenses);

  // Add a new budget
  const addNewBudget = useCallback(
    (budget: Budget) => {
      dispatch(addBudget(budget));
    },
    [dispatch]
  );

  // Update an existing budget
  const updateExistingBudget = useCallback(
    (budget: Budget) => {
      dispatch(updateBudget(budget));
    },
    [dispatch]
  );

  // Delete a budget
  const removeBudget = useCallback(
    (budgetId: string) => {
      dispatch(deleteBudget(budgetId));
    },
    [dispatch]
  );

  // Get budget by ID
  const getBudgetById = useCallback(
    (budgetId: string) => {
      return budgets.find((budget) => budget.id === budgetId);
    },
    [budgets]
  );

  // Get budget by category
  const getBudgetByCategory = useCallback(
    (categoryId: string) => {
      return budgets.find((budget) => budget.categoryId === categoryId);
    },
    [budgets]
  );

  // Get overall budget (without specific category)
  const getOverallBudget = useCallback(() => {
    return budgets.find((budget) => !budget.categoryId);
  }, [budgets]);

  // Calculate budget progress for a specific budget
  const calculateBudgetProgress = useCallback(
    (budget: Budget) => {
      let filteredExpenses = expenses;

      // Filter by category if budget is category-specific
      if (budget.categoryId) {
        filteredExpenses = expenses.filter(
          (expense) => expense.category.id === budget.categoryId
        );
      }

      // Filter by budget period
      const periodExpenses = getExpensesByPeriod(
        filteredExpenses,
        mapBudgetPeriodToTimeFilter(budget.period)
      );

      const spent = calculateTotalSpent(periodExpenses);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = Math.max(0, budget.amount - spent);
      const isOverBudget = spent > budget.amount;
      const isNearLimit = percentage >= budget.alertThreshold;

      return {
        spent,
        percentage,
        remaining,
        isOverBudget,
        isNearLimit,
      };
    },
    [expenses]
  );

  // Get all budgets with their progress
  const getBudgetsWithProgress = useCallback(() => {
    return budgets.map((budget) => ({
      budget,
      progress: calculateBudgetProgress(budget),
    }));
  }, [budgets, calculateBudgetProgress]);

  // Check if any budget is exceeded
  const hasExceededBudget = useCallback(() => {
    return budgets.some((budget) => {
      const progress = calculateBudgetProgress(budget);
      return progress.isOverBudget;
    });
  }, [budgets, calculateBudgetProgress]);

  // Check if any budget is near limit
  const hasNearLimitBudget = useCallback(() => {
    return budgets.some((budget) => {
      const progress = calculateBudgetProgress(budget);
      return progress.isNearLimit && !progress.isOverBudget;
    });
  }, [budgets, calculateBudgetProgress]);

  return {
    budgets,
    addNewBudget,
    updateExistingBudget,
    removeBudget,
    getBudgetById,
    getBudgetByCategory,
    getOverallBudget,
    calculateBudgetProgress,
    getBudgetsWithProgress,
    hasExceededBudget,
    hasNearLimitBudget,
  };
};
