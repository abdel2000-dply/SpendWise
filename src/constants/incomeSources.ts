import { IncomeSource } from "../types";

export const DEFAULT_INCOME_SOURCES: IncomeSource[] = [
  {
    id: "salary",
    name: "Salary",
    icon: "briefcase",
    color: "#4CAF50",
    isDefault: true,
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "laptop",
    color: "#2196F3",
    isDefault: true,
  },
  {
    id: "investment",
    name: "Investment",
    icon: "trending-up",
    color: "#9C27B0",
    isDefault: true,
  },
  {
    id: "gift",
    name: "Gift",
    icon: "gift",
    color: "#E91E63",
    isDefault: true,
  },
  {
    id: "refund",
    name: "Refund",
    icon: "arrow-undo",
    color: "#FF9800",
    isDefault: true,
  },
  {
    id: "side-hustle",
    name: "Side Hustle",
    icon: "flash",
    color: "#FFC107",
    isDefault: true,
  },
  {
    id: "rental",
    name: "Rental",
    icon: "home",
    color: "#795548",
    isDefault: true,
  },
  {
    id: "other-income",
    name: "Other",
    icon: "ellipsis-horizontal",
    color: "#607D8B",
    isDefault: true,
  },
];
