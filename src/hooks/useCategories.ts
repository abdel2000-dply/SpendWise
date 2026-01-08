import { useCallback } from 'react';
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from '../store/slices/categorySlice';
import { Category } from '../types';
import { useAppDispatch, useAppSelector } from './useRedux';

/**
 * Custom hook for managing categories
 */
export const useCategories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);

  // Add a new category
  const addNewCategory = useCallback(
    (category: Category) => {
      dispatch(addCategory(category));
    },
    [dispatch]
  );

  // Update an existing category
  const updateExistingCategory = useCallback(
    (category: Category) => {
      dispatch(updateCategory(category));
    },
    [dispatch]
  );

  // Delete a category
  const removeCategory = useCallback(
    (categoryId: string) => {
      dispatch(deleteCategory(categoryId));
    },
    [dispatch]
  );

  // Get category by ID
  const getCategoryById = useCallback(
    (categoryId: string) => {
      return categories.find((category) => category.id === categoryId);
    },
    [categories]
  );

  // Get default categories
  const getDefaultCategories = useCallback(() => {
    return categories.filter((category) => category.isDefault);
  }, [categories]);

  // Get custom categories
  const getCustomCategories = useCallback(() => {
    return categories.filter((category) => !category.isDefault);
  }, [categories]);

  // Get categories sorted by name
  const getSortedCategories = useCallback(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  return {
    categories,
    addNewCategory,
    updateExistingCategory,
    removeCategory,
    getCategoryById,
    getDefaultCategories,
    getCustomCategories,
    getSortedCategories,
  };
};
