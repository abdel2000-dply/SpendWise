import { useCallback } from 'react';
import {
  addExpense,
  deleteExpense,
  updateExpense,
} from '../store/slices/expenseSlice';
import { Expense, TimeFilter } from '../types';
import {
  calculateTotalSpent,
  getExpensesByPeriod,
  sortExpensesByDate,
} from '../utils/calculations';
import { useAppDispatch, useAppSelector } from './useRedux';

/**
 * Custom hook for managing expenses
 */
export const useExpenses = () => {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const loading = useAppSelector((state) => state.expenses.loading);
  const error = useAppSelector((state) => state.expenses.error);

  // Add a new expense
  const addNewExpense = useCallback(
    (expense: Expense) => {
      dispatch(addExpense(expense));
    },
    [dispatch]
  );

  // Update an existing expense
  const updateExistingExpense = useCallback(
    (expense: Expense) => {
      dispatch(updateExpense(expense));
    },
    [dispatch]
  );

  // Delete an expense
  const removeExpense = useCallback(
    (expenseId: string) => {
      dispatch(deleteExpense(expenseId));
    },
    [dispatch]
  );

  // Get expenses filtered by time period
  const getFilteredExpenses = useCallback(
    (period: TimeFilter) => {
      return getExpensesByPeriod(expenses, period);
    },
    [expenses]
  );

  // Get total spent for a period
  const getTotalSpent = useCallback(
    (period: TimeFilter) => {
      const filtered = getExpensesByPeriod(expenses, period);
      return calculateTotalSpent(filtered);
    },
    [expenses]
  );

  // Get sorted expenses
  const getSortedExpenses = useCallback(
    (ascending = false) => {
      return sortExpensesByDate(expenses, ascending);
    },
    [expenses]
  );

  // Get recent expenses (last N)
  const getRecentExpenses = useCallback(
    (count: number = 10) => {
      return sortExpensesByDate(expenses).slice(0, count);
    },
    [expenses]
  );

  // Get expense by ID
  const getExpenseById = useCallback(
    (expenseId: string) => {
      return expenses.find((expense) => expense.id === expenseId);
    },
    [expenses]
  );

  return {
    expenses,
    loading,
    error,
    addNewExpense,
    updateExistingExpense,
    removeExpense,
    getFilteredExpenses,
    getTotalSpent,
    getSortedExpenses,
    getRecentExpenses,
    getExpenseById,
  };
};
