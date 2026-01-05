export const Colors = {
  // Primary Colors
  primary: "#6C63FF",
  primaryLight: "#8B85FF",
  primaryDark: "#5449E0",

  // Secondary Colors
  secondary: "#FF6584",
  secondaryLight: "#FF8BA3",
  secondaryDark: "#E04D6F",

  // Status Colors
  success: "#00D68F",
  successLight: "#33DEAA",
  warning: "#FFAB00",
  warningLight: "#FFD666",
  error: "#FF3D71",
  errorLight: "#FF6B95",

  // Neutral Colors
  background: "#F7F9FC",
  backgroundDark: "#1A1A2E",
  card: "#FFFFFF",
  cardDark: "#252541",
  text: "#2E3A59",
  textLight: "#8F9BB3",
  textDark: "#FFFFFF",
  border: "#E4E9F2",
  borderDark: "#3A3A5C",

  // Category Colors
  categories: {
    food: "#FF6B6B",
    transportation: "#4ECDC4",
    shopping: "#FFE66D",
    entertainment: "#A8E6CF",
    bills: "#FF8B94",
    healthcare: "#C7CEEA",
    education: "#B4A7D6",
    travel: "#FFA07A",
    groceries: "#98D8C8",
    fitness: "#6BCF7F",
    subscriptions: "#FB8B24",
    other: "#95A5A6",
  },

  // Gradient Colors
  gradients: {
    primary: ["#6C63FF", "#8B85FF"],
    success: ["#00D68F", "#33DEAA"],
    warning: ["#FFAB00", "#FFD666"],
    pink: ["#FF6584", "#FF8BA3"],
  },
};

export type ColorScheme = "light" | "dark";
