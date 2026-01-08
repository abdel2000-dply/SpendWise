import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { CURRENCY_SYMBOLS } from "../constants/categories";

/**
 * Format currency with symbol and thousands separator
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

/**
 * Format date as "Today", "Yesterday", or short date
 */
export const formatDate = (date: Date | string, formatStr?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return "Today";
  if (isYesterday(dateObj)) return "Yesterday";

  if (formatStr) {
    return format(dateObj, formatStr);
  }

  const today = new Date();
  const isSameYear = dateObj.getFullYear() === today.getFullYear();

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: isSameYear ? undefined : "numeric",
  });
};

/**
 * Format date in long format
 */
export const formatDateLong = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date relative to now (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return "Today";
  if (isYesterday(dateObj)) return "Yesterday";
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format time in 12-hour format
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
