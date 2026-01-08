import { ExpenseFormData } from '../types';

/**
 * Validates if the amount is a valid positive number
 */
export const validateAmount = (amount: string): boolean => {
  if (!amount || amount.trim() === '') {
    return false;
  }

  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount)) {
    return false;
  }

  if (numericAmount <= 0) {
    return false;
  }

  return true;
};

/**
 * Validates if the category ID is provided
 */
export const validateCategory = (categoryId: string): boolean => {
  return !!(categoryId && categoryId.trim() !== '');
};

/**
 * Validates if the date is a valid date object
 */
export const validateDate = (date: Date): boolean => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  if (isNaN(date.getTime())) {
    return false;
  }

  // Don't allow future dates more than 1 day
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  if (date > tomorrow) {
    return false;
  }

  return true;
};

/**
 * Validates the entire expense form data
 */
export const validateExpenseForm = (
  data: ExpenseFormData
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate amount
  if (!validateAmount(data.amount)) {
    if (!data.amount || data.amount.trim() === '') {
      errors.amount = 'Amount is required';
    } else if (parseFloat(data.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else {
      errors.amount = 'Please enter a valid amount';
    }
  }

  // Validate category
  if (!validateCategory(data.categoryId)) {
    errors.categoryId = 'Please select a category';
  }

  // Validate date
  if (!validateDate(data.date)) {
    if (!data.date || !(data.date instanceof Date)) {
      errors.date = 'Date is required';
    } else if (isNaN(data.date.getTime())) {
      errors.date = 'Invalid date';
    } else {
      errors.date = 'Date cannot be in the future';
    }
  }

  // Note is optional, no validation needed

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates budget amount
 */
export const validateBudgetAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0;
};

/**
 * Validates threshold percentage (0-100)
 */
export const validateThreshold = (threshold: number): boolean => {
  return !isNaN(threshold) && threshold >= 0 && threshold <= 100;
};
