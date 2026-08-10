import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { SavingsGoal } from "../../types";
import { Card } from "../atoms/Card";

interface SavingsProgressCardProps {
  goals: SavingsGoal[];
  formatCurrency: (amount: number, currency: string) => string;
  currency: string;
  onSeeAll: () => void;
}

export const SavingsProgressCard: React.FC<SavingsProgressCardProps> = ({
  goals,
  formatCurrency,
  currency,
  onSeeAll,
}) => {
  const colors = useThemeColors();

  if (goals.length === 0) {
    return (
      <Card style={styles.card} shadowSize="small">
        <TouchableOpacity
          style={styles.container}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={32} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              No savings goals yet
            </Text>
            <Text style={[styles.emptyAction, { color: colors.primary }]}>
              Tap to create your first goal
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  // Show the top goal (closest to completion or most recent)
  const topGoal = goals.reduce((best, goal) => {
    const bestPct =
      best.targetAmount > 0 ? best.currentAmount / best.targetAmount : 0;
    const goalPct =
      goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
    return goalPct > bestPct ? goal : best;
  });

  const percentage =
    topGoal.targetAmount > 0
      ? Math.min((topGoal.currentAmount / topGoal.targetAmount) * 100, 100)
      : 0;

  return (
    <Card style={styles.card} shadowSize="small">
      <TouchableOpacity
        style={styles.container}
        onPress={onSeeAll}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Savings Goals
          </Text>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            See all ({goals.length})
          </Text>
        </View>

        <View style={styles.goalRow}>
          <View
            style={[styles.goalIcon, { backgroundColor: topGoal.color + "20" }]}
          >
            <Ionicons
              name={topGoal.icon as any}
              size={24}
              color={topGoal.color}
            />
          </View>
          <View style={styles.goalInfo}>
            <Text
              style={[styles.goalName, { color: colors.text }]}
              numberOfLines={1}
            >
              {topGoal.name}
            </Text>
            <View style={styles.goalAmounts}>
              <Text style={[styles.goalCurrent, { color: colors.primary }]}>
                {formatCurrency(topGoal.currentAmount, currency)}
              </Text>
              <Text style={[styles.goalTarget, { color: colors.textLight }]}>
                {" "}
                / {formatCurrency(topGoal.targetAmount, currency)}
              </Text>
            </View>
          </View>
          <Text style={[styles.percentage, { color: colors.primary }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>

        <View
          style={[styles.progressBarBg, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: topGoal.color,
              },
            ]}
          />
        </View>
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
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  goalAmounts: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalCurrent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  goalTarget: {
    fontSize: typography.fontSize.sm,
  },
  percentage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
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
