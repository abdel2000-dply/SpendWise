import { Category } from "../types";
import { Colors } from "./colors";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    icon: "restaurant",
    color: Colors.categories.food,
    isDefault: true,
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "car",
    color: Colors.categories.transportation,
    isDefault: true,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "bag",
    color: Colors.categories.shopping,
    isDefault: true,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "film",
    color: Colors.categories.entertainment,
    isDefault: true,
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    icon: "receipt",
    color: Colors.categories.bills,
    isDefault: true,
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "medkit",
    color: Colors.categories.healthcare,
    isDefault: true,
  },
  {
    id: "education",
    name: "Education",
    icon: "school",
    color: Colors.categories.education,
    isDefault: true,
  },
  {
    id: "travel",
    name: "Travel",
    icon: "airplane",
    color: Colors.categories.travel,
    isDefault: true,
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: "cart",
    color: Colors.categories.groceries,
    isDefault: true,
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: "fitness",
    color: Colors.categories.fitness,
    isDefault: true,
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    icon: "refresh",
    color: Colors.categories.subscriptions,
    isDefault: true,
  },
  {
    id: "other",
    name: "Other",
    icon: "ellipsis-horizontal",
    color: Colors.categories.other,
    isDefault: true,
  },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  MAD: "DH",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
  CNY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  NZD: "NZ$",
};

// Currencies whose symbol goes AFTER the amount (e.g. "100 DH" instead of "DH100")
export const CURRENCY_SYMBOL_RIGHT = new Set(["MAD", "CHF"]);

export const DEFAULT_CURRENCY = "MAD";
