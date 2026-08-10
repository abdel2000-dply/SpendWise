import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { BudgetStatus } from "../../types";
import { Card } from "../atoms/Card";

interface BudgetSummaryCardProps {
  budgetStatuses: BudgetStatus[];
  formatCurrency: (amount: number, currency: string) => string;
  currency: string;
  onSeeAll: () => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  budgetStatuses,
  formatCurrency,
  currency,
  onSeeAll,
}) => {
  const colors = useThemeColors();
  const onTrack = budgetStatuses.filter((b) => !b.isOverBudget);
  const overBudget = budgetStatuses.filter((b) => b.isOverBudget);

  // Find the budget with highest usage
  const highestUsage =
    budgetStatuses.length > 0
      ? budgetStatuses.reduce((a, b) => (a.percentage > b.percentage ? a : b))
      : null;

  if (budgetStatuses.length === 0) {
    return (
      <Card style={styles.card} shadowSize="small">
        <TouchableOpacity
          style={styles.container}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <View style={styles.emptyContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={colors.textLight}
            />
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              No budgets set yet
            </Text>
            <Text style={[styles.emptyAction, { color: colors.primary }]}>
              Tap to create your first budget
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card style={styles.card} shadowSize="small">
      <TouchableOpacity
        style={styles.container}
        onPress={onSeeAll}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Budget Status
          </Text>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            See all
          </Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.success + "15" },
            ]}
          >
            <Text style={[styles.statusCount, { color: colors.success }]}>
              {onTrack.length}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.success }]}>
              On Track
            </Text>
          </View>
          {overBudget.length > 0 && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.error + "15" },
              ]}
            >
              <Text style={[styles.statusCount, { color: colors.error }]}>
                {overBudget.length}
              </Text>
              <Text style={[styles.statusLabel, { color: colors.error }]}>
                Over
              </Text>
            </View>
          )}
        </View>

        {highestUsage && (
          <View style={styles.topBudget}>
            <View style={styles.topBudgetInfo}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: highestUsage.categoryColor },
                ]}
              />
              <Text
                style={[styles.categoryName, { color: colors.text }]}
                numberOfLines={1}
              >
                {highestUsage.categoryName}
              </Text>
              <Text style={[styles.budgetAmount, { color: colors.textLight }]}>
                {formatCurrency(highestUsage.spent, currency)} /{" "}
                {formatCurrency(highestUsage.budget.amount, currency)}
              </Text>
            </View>
            <View
              style={[styles.progressBarBg, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(highestUsage.percentage, 100)}%`,
                    backgroundColor: highestUsage.isOverBudget
                      ? colors.error
                      : highestUsage.isNearLimit
                        ? colors.warning
                        : colors.success,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
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
  statusRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  statusCount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
  },
  topBudget: {
    gap: spacing.xs,
  },
  topBudgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  budgetAmount: {
    fontSize: typography.fontSize.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  emptyAction: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
