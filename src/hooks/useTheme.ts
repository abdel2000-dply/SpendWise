import { useCallback } from 'react';
import {
  setDarkMode,
  toggleDarkMode,
} from '../store/slices/settingsSlice';
import { darkTheme, lightTheme } from '../theme/theme';
import { useAppDispatch, useAppSelector } from './useRedux';

/**
 * Custom hook for managing theme and accessing theme values
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.settings.isDarkMode);

  // Get the current theme object
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Toggle between light and dark mode
  const toggleTheme = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  // Set theme explicitly
  const setTheme = useCallback(
    (isDark: boolean) => {
      dispatch(setDarkMode(isDark));
    },
    [dispatch]
  );

  // Get colors from current theme
  const colors = theme.colors;

  return {
    theme,
    colors,
    isDarkMode,
    toggleTheme,
    setTheme,
  };
};
