import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { Expense, Income } from "../../types";
import { formatCurrency, formatTime } from "../../utils/formatters";
import { Card } from "../atoms/Card";

interface RecentTransactionsProps {
  expenses: Expense[];
  incomes: Income[];
  currency: string;
  onSeeAll: () => void;
  limit?: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  expenses,
  incomes,
  currency,
  onSeeAll,
  limit = 5,
}) => {
  const colors = useThemeColors();

  // Merge and sort by date
  const transactions = [
    ...expenses.map((e) => ({ ...e, txType: "expense" as const })),
    ...incomes.map((i) => ({ ...i, txType: "income" as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  if (transactions.length === 0) {
    return (
      <Card style={styles.card} shadowSize="small">
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>
            Recent Transactions
          </Text>
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={32}
              color={colors.textLight}
            />
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              No transactions yet
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card} shadowSize="small">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        {transactions.map((tx) => {
          const isIncome = tx.txType === "income";
          const iconName = isIncome
            ? (tx as Income).source.icon
            : (tx as Expense).category.icon;
          const iconColor = isIncome
            ? (tx as Income).source.color
            : (tx as Expense).category.color;
          const label = isIncome
            ? (tx as Income).source.name
            : (tx as Expense).category.name;

          return (
            <View
              key={tx.id}
              style={[styles.txRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[styles.txIcon, { backgroundColor: iconColor + "15" }]}
              >
                <Ionicons name={iconName as any} size={20} color={iconColor} />
              </View>
              <View style={styles.txInfo}>
                <Text
                  style={[styles.txLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text style={[styles.txTime, { color: colors.textLight }]}>
                  {formatTime(new Date(tx.date))}
                  {tx.note ? ` · ${tx.note}` : ""}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: isIncome ? colors.success : colors.error },
                ]}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount, currency)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    gap: spacing.md,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  txTime: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  txAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
  },
});
