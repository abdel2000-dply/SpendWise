import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Colors } from "../constants/colors";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLight,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryLight,
    error: Colors.error,
    errorContainer: Colors.errorLight,
    background: Colors.background,
    surface: Colors.card,
    surfaceVariant: Colors.border,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textLight,
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryDark,
    secondary: Colors.secondary,
    secondaryContainer: Colors.secondaryDark,
    error: Colors.error,
    errorContainer: Colors.errorLight,
    background: Colors.backgroundDark,
    surface: Colors.cardDark,
    surfaceVariant: Colors.borderDark,
    onSurface: Colors.textDark,
    onSurfaceVariant: Colors.textLight,
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
    heading: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
