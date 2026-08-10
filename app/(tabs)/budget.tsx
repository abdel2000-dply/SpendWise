import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../src/components/atoms/Card";
import EmptyState from "../../src/components/atoms/EmptyState";
import { Icon } from "../../src/components/atoms/Icon";
import { useAppDispatch, useAppSelector } from "../../src/hooks/useRedux";
import { useSwipeTabs } from "../../src/hooks/useSwipeTabs";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { deleteBudget } from "../../src/store/slices/budgetSlice";
import { deleteGoal } from "../../src/store/slices/savingsSlice";
import { spacing, typography } from "../../src/theme/theme";
import { BudgetStatus, SavingsGoal } from "../../src/types";
import {
    calculateSavingsProgress,
    getCategoryBudgetStatus,
} from "../../src/utils/calculations";
import { formatCurrency, formatPercentage } from "../../src/utils/formatters";
import { hapticWarning } from "../../src/utils/haptics";

type TabType = "budgets" | "savings";

export default function BudgetScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const categories = useAppSelector((state) => state.categories.categories);
  const savingsGoals = useAppSelector((state) => state.savings.goals);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();
  const swipeHandlers = useSwipeTabs();

  const [activeTab, setActiveTab] = useState<TabType>("budgets");

  const budgetStatuses = getCategoryBudgetStatus(budgets, expenses, categories);

  const handleDeleteBudget = (budgetId: string) => {
    hapticWarning();
    Alert.alert("Delete Budget", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteBudget(budgetId)),
      },
    ]);
  };

  const handleDeleteGoal = (goalId: string) => {
    hapticWarning();
    Alert.alert("Delete Goal", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteGoal(goalId)),
      },
    ]);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return colors.error;
    if (percentage >= 80) return colors.warning;
    return colors.success;
  };

  const renderBudgetCard = (status: BudgetStatus) => (
    <Card style={styles.itemCard} key={status.budget.id}>
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <View
            style={[
              styles.itemIcon,
              { backgroundColor: status.categoryColor + "15" },
            ]}
          >
            <Icon
              name={status.categoryIcon as any}
              size={22}
              color={status.categoryColor}
            />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {status.categoryName}
            </Text>
            <Text style={[styles.itemPeriod, { color: colors.textLight }]}>
              {status.budget.period.charAt(0).toUpperCase() +
                status.budget.period.slice(1)}{" "}
              budget
            </Text>
          </View>
          <View style={styles.itemAmounts}>
            <Text
              style={[
                styles.itemSpent,
                { color: getProgressColor(status.percentage) },
              ]}
            >
              {formatCurrency(status.spent, currency)}
            </Text>
            <Text style={[styles.itemTotal, { color: colors.textLight }]}>
              of {formatCurrency(status.budget.amount, currency)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={[styles.progressBarBg, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(status.percentage, 100)}%`,
                backgroundColor: getProgressColor(status.percentage),
              },
            ]}
          />
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.percentageRow}>
            {status.isOverBudget && (
              <View
                style={[
                  styles.alertBadge,
                  { backgroundColor: colors.error + "15" },
                ]}
              >
                <Ionicons name="warning" size={12} color={colors.error} />
                <Text style={[styles.alertText, { color: colors.error }]}>
                  Over budget
                </Text>
              </View>
            )}
            {status.isNearLimit && !status.isOverBudget && (
              <View
                style={[
                  styles.alertBadge,
                  { backgroundColor: colors.warning + "15" },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={12}
                  color={colors.warning}
                />
                <Text style={[styles.alertText, { color: colors.warning }]}>
                  Near limit
                </Text>
              </View>
            )}
            <Text style={[styles.percentageText, { color: colors.textLight }]}>
              {formatPercentage(status.percentage)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteBudget(status.budget.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderSavingsCard = (goal: SavingsGoal) => {
    const progress = calculateSavingsProgress(goal);
    const daysLeft = goal.deadline
      ? Math.max(
          0,
          Math.ceil(
            (new Date(goal.deadline).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null;

    return (
      <Card style={styles.itemCard} key={goal.id}>
        <View style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <View
              style={[styles.itemIcon, { backgroundColor: goal.color + "15" }]}
            >
              <Ionicons name={goal.icon as any} size={22} color={goal.color} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {goal.name}
              </Text>
              {daysLeft !== null && (
                <Text style={[styles.itemPeriod, { color: colors.textLight }]}>
                  {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </Text>
              )}
            </View>
            <View style={styles.itemAmounts}>
              <Text style={[styles.itemSpent, { color: goal.color }]}>
                {formatCurrency(goal.currentAmount, currency)}
              </Text>
              <Text style={[styles.itemTotal, { color: colors.textLight }]}>
                of {formatCurrency(goal.targetAmount, currency)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress.percentage}%`,
                  backgroundColor: goal.color,
                },
              ]}
            />
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.percentageRow}>
              {!progress.onTrack && (
                <View
                  style={[
                    styles.alertBadge,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={12}
                    color={colors.warning}
                  />
                  <Text style={[styles.alertText, { color: colors.warning }]}>
                    Behind schedule
                  </Text>
                </View>
              )}
              <Text
                style={[styles.percentageText, { color: colors.textLight }]}
              >
                {formatPercentage(progress.percentage)}
              </Text>
            </View>
            <View style={styles.goalActions}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/add-contribution?goalId=${goal.id}` as any)
                }
                style={[
                  styles.addFundsBtn,
                  { backgroundColor: goal.color + "15" },
                ]}
              >
                <Ionicons name="add" size={14} color={goal.color} />
                <Text style={[styles.addFundsText, { color: goal.color }]}>
                  Add funds
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteGoal(goal.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
      {...swipeHandlers}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Budget & Goals
        </Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "budgets" && { backgroundColor: colors.primary },
            activeTab !== "budgets" && {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => setActiveTab("budgets")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "budgets" ? "#FFF" : colors.text },
            ]}
          >
            Budgets ({budgets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "savings" && { backgroundColor: colors.primary },
            activeTab !== "savings" && {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => setActiveTab("savings")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "savings" ? "#FFF" : colors.text },
            ]}
          >
            Savings ({savingsGoals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {activeTab === "budgets" ? (
          <>
            {budgetStatuses.length > 0 ? (
              <>
                {/* Summary */}
                <View style={styles.summaryRow}>
                  <Card style={styles.summaryCard}>
                    <View style={styles.summaryContent}>
                      <Text
                        style={[styles.summaryValue, { color: colors.success }]}
                      >
                        {budgetStatuses.filter((b) => !b.isOverBudget).length}
                      </Text>
                      <Text
                        style={[
                          styles.summaryLabel,
                          { color: colors.textLight },
                        ]}
                      >
                        On Track
                      </Text>
                    </View>
                  </Card>
                  <Card style={styles.summaryCard}>
                    <View style={styles.summaryContent}>
                      <Text
                        style={[styles.summaryValue, { color: colors.warning }]}
                      >
                        {budgetStatuses.filter((b) => b.isNearLimit).length}
                      </Text>
                      <Text
                        style={[
                          styles.summaryLabel,
                          { color: colors.textLight },
                        ]}
                      >
                        Near Limit
                      </Text>
                    </View>
                  </Card>
                  <Card style={styles.summaryCard}>
                    <View style={styles.summaryContent}>
                      <Text
                        style={[styles.summaryValue, { color: colors.error }]}
                      >
                        {budgetStatuses.filter((b) => b.isOverBudget).length}
                      </Text>
                      <Text
                        style={[
                          styles.summaryLabel,
                          { color: colors.textLight },
                        ]}
                      >
                        Over
                      </Text>
                    </View>
                  </Card>
                </View>
                {budgetStatuses.map(renderBudgetCard)}
              </>
            ) : (
              <>
                <EmptyState
                  icon="shield-checkmark-outline"
                  title="No Budgets Yet"
                  subtitle="Set category budgets to track and control your spending habits"
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    styles.addButtonLarge,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => router.push("/add-budget" as any)}
                >
                  <Ionicons name="add-circle" size={22} color="#FFF" />
                  <Text style={styles.addButtonText}>
                    Create Your First Budget
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/add-budget" as any)}
            >
              <Ionicons name="add" size={22} color="#FFF" />
              <Text style={styles.addButtonText}>Add Budget</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {savingsGoals.length > 0 ? (
              savingsGoals.map(renderSavingsCard)
            ) : (
              <EmptyState
                icon="flag-outline"
                title="No Savings Goals Yet"
                subtitle="Create goals to start saving for what matters most to you"
              />
            )}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/add-goal" as any)}
            >
              <Ionicons name="add" size={22} color="#FFF" />
              <Text style={styles.addButtonText}>New Savings Goal</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
  },
  summaryContent: {
    padding: spacing.md,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemContainer: {
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  itemPeriod: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  itemAmounts: {
    alignItems: "flex-end",
  },
  itemSpent: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  itemTotal: {
    fontSize: typography.fontSize.xs,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  percentageText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  alertText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  goalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addFundsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  addFundsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  deleteBtn: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 14,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  addButtonLarge: {
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.sm,
    borderRadius: 16,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
