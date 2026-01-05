import { Colors } from "../constants/colors";
import { useAppSelector } from "./useRedux";

export const useThemeColors = () => {
  const isDarkMode = useAppSelector((state) => state.settings.isDarkMode);

  return {
    background: isDarkMode ? Colors.backgroundDark : Colors.background,
    card: isDarkMode ? Colors.cardDark : Colors.card,
    text: isDarkMode ? Colors.textDark : Colors.text,
    textLight: Colors.textLight,
    border: isDarkMode ? Colors.borderDark : Colors.border,
    primary: Colors.primary,
    primaryLight: Colors.primaryLight,
    primaryDark: Colors.primaryDark,
    secondary: Colors.secondary,
    secondaryLight: Colors.secondaryLight,
    secondaryDark: Colors.secondaryDark,
    success: Colors.success,
    successLight: Colors.successLight,
    warning: Colors.warning,
    warningLight: Colors.warningLight,
    error: Colors.error,
    errorLight: Colors.errorLight,
    isDark: isDarkMode,
  };
};
