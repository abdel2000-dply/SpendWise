import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { shallowEqual } from "react-redux";

import { differenceInDays } from "date-fns";
import { BalanceCard } from "../../src/components/molecules/BalanceCard";
import { BudgetSummaryCard } from "../../src/components/molecules/BudgetSummaryCard";
import { CoachingTips } from "../../src/components/molecules/CoachingTips";
import { HealthScoreCard } from "../../src/components/molecules/HealthScoreCard";
import { PaydayCard } from "../../src/components/molecules/PaydayCard";
import { QuickActions } from "../../src/components/molecules/QuickActions";
import { QuickTemplates } from "../../src/components/molecules/QuickTemplates";
import { RecentTransactions } from "../../src/components/molecules/RecentTransactions";
import { SavingsProgressCard } from "../../src/components/molecules/SavingsProgressCard";
import { SpendingTrendChart } from "../../src/components/molecules/SpendingTrendChart";
import { UpcomingBills } from "../../src/components/molecules/UpcomingBills";
import { CURRENCY_SYMBOLS } from "../../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../../src/hooks/useRedux";
import { useSwipeTabs } from "../../src/hooks/useSwipeTabs";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { addExpense } from "../../src/store/slices/expenseSlice";
import { addIncome } from "../../src/store/slices/incomeSlice";
import { incrementUsage } from "../../src/store/slices/templateSlice";
import { spacing, typography } from "../../src/theme/theme";
import { QuickTemplate } from "../../src/types";
import {
    calculateBalance,
    calculateFinancialHealthScore,
    detectPaydayPattern,
    getCategoryBudgetStatus,
    getSpendingTrend,
} from "../../src/utils/calculations";
import { formatCurrency } from "../../src/utils/formatters";
import { generateId } from "../../src/utils/generateId";
import { generateGoalCoachingTips } from "../../src/utils/goalCoaching";
import { hapticSuccess } from "../../src/utils/haptics";

type Period = "week" | "month";

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // #19 — single combined selector with shallowEqual avoids multiple subscriptions
  const {
    expenses,
    incomes,
    budgets,
    categories,
    savingsGoals,
    currency,
    userName,
    aiCoachEnabled,
    templates,
    recurringTxs,
  } = useAppSelector(
    (state) => ({
      expenses: state.expenses.expenses,
      incomes: state.incomes.incomes,
      budgets: state.budgets.budgets,
      categories: state.categories.categories,
      savingsGoals: state.savings.goals,
      currency: state.settings.currency,
      userName: state.settings.userName,
      aiCoachEnabled: state.settings.aiCoachEnabled,
      templates: state.templates.templates,
      recurringTxs: state.recurring.transactions,
    }),
    shallowEqual,
  );
  const colors = useThemeColors();
  const swipeHandlers = useSwipeTabs();

  const [period, setPeriod] = useState<Period>("month");

  const balance = useMemo(
    () => calculateBalance(incomes, expenses, period),
    [incomes, expenses, period],
  );
  const trendData = useMemo(
    () => getSpendingTrend(expenses, 7, "day"),
    [expenses],
  );
  const budgetStatuses = useMemo(
    () => getCategoryBudgetStatus(budgets, expenses, categories),
    [budgets, expenses, categories],
  );
  const healthScore = useMemo(
    () =>
      calculateFinancialHealthScore(
        expenses,
        incomes,
        budgets,
        categories,
        savingsGoals,
      ),
    [expenses, incomes, budgets, categories, savingsGoals],
  );

  const coachingTips = useMemo(
    () => generateGoalCoachingTips(savingsGoals, balance.balance, currency),
    [savingsGoals, balance.balance, currency],
  );

  const upcomingBills = useMemo(
    () =>
      recurringTxs
        .filter((tx) => tx.isActive && tx.type === "expense")
        .map((tx) => ({
          ...tx,
          daysUntilDue: differenceInDays(new Date(tx.nextDueDate), new Date()),
        }))
        .filter((tx) => tx.daysUntilDue >= 0 && tx.daysUntilDue <= 7)
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue),
    [recurringTxs],
  );

  const paydayPattern = useMemo(() => detectPaydayPattern(incomes), [incomes]);

  const quickActions = [
    {
      icon: "remove-circle" as const,
      label: "Expense",
      color: colors.error,
      onPress: () => router.push("/modal"),
    },
    {
      icon: "add-circle" as const,
      label: "Income",
      color: colors.success,
      onPress: () => router.push("/modal?mode=income"),
    },
    {
      icon: "shield-checkmark" as const,
      label: "Budget",
      color: colors.primary,
      onPress: () => router.push("/add-budget"),
    },
    {
      icon: "flag" as const,
      label: "Goal",
      color: colors.warning,
      onPress: () => router.push("/add-goal"),
    },
    {
      icon: "layers" as const,
      label: "Batch",
      color: "#9B59B6",
      onPress: () => router.push("/batch-entry" as any),
    },
    {
      icon: "trophy" as const,
      label: "Challenge",
      color: "#E74C3C",
      onPress: () => router.push("/challenges" as any),
    },
  ];

  const currencySymbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;

  const handleUseTemplate = (template: QuickTemplate) => {
    const category = categories.find((c) => c.id === template.categoryId);
    if (template.type === "expense") {
      if (!category) {
        Alert.alert("Error", "Template category not found.");
        return;
      }
      dispatch(
        addExpense({
          id: generateId(),
          amount: template.amount,
          currency,
          category,
          date: new Date(),
          note: template.name,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    } else {
      dispatch(
        addIncome({
          id: generateId(),
          amount: template.amount,
          currency,
          source: {
            id: template.sourceId || "other",
            name: template.name,
            icon: template.icon,
            color: template.color,
          },
          date: new Date(),
          note: template.name,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }
    dispatch(incrementUsage(template.id));
    hapticSuccess();
  };

  const sortedTemplates = [...templates].sort(
    (a, b) => b.usageCount - a.usageCount,
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
      {...swipeHandlers}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {userName ? `Hey, ${userName} 👋` : "Hello 👋"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {userName
                ? "Your financial overview"
                : "Set your name in Settings"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/insights" as any)}
              style={[styles.settingsButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="analytics" size={22} color={colors.primary} />
            </TouchableOpacity>
            {aiCoachEnabled && (
              <TouchableOpacity
                onPress={() => router.push("/ai-coach")}
                style={[
                  styles.settingsButton,
                  { backgroundColor: colors.card },
                ]}
              >
                <Ionicons name="sparkles" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Period Toggle */}
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "week" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPeriod("week")}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === "week" ? "#FFF" : colors.textLight },
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === "month" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPeriod("month")}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === "month" ? "#FFF" : colors.textLight },
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <BalanceCard
          balance={balance.balance}
          income={balance.income}
          expenses={balance.expenses}
          currency={currency}
          formatCurrency={formatCurrency}
        />

        {/* Financial Health Score */}
        <HealthScoreCard score={healthScore} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Quick Templates */}
        <QuickTemplates
          templates={sortedTemplates}
          currencySymbol={currencySymbol}
          onUseTemplate={handleUseTemplate}
          onManage={() => router.push("/templates" as any)}
        />

        {/* Spending Trend */}
        <SpendingTrendChart
          data={trendData}
          currency={currency}
          formatCurrency={formatCurrency}
        />

        {/* Budget Summary */}
        <BudgetSummaryCard
          budgetStatuses={budgetStatuses}
          formatCurrency={formatCurrency}
          currency={currency}
          onSeeAll={() => router.push("/budget" as any)}
        />

        {/* Savings Goals */}
        <SavingsProgressCard
          goals={savingsGoals}
          formatCurrency={formatCurrency}
          currency={currency}
          onSeeAll={() => router.push("/budget" as any)}
        />

        {/* Goal Coaching Tips */}
        <CoachingTips tips={coachingTips} />

        {/* Payday Prediction */}
        <PaydayCard
          pattern={paydayPattern}
          formatCurrency={formatCurrency}
          currency={currency}
        />

        {/* Upcoming Bills */}
        <UpcomingBills
          bills={upcomingBills}
          formatCurrency={formatCurrency}
          currency={currency}
          onSeeAll={() => router.push("/recurring" as any)}
        />

        {/* Recent Transactions */}
        <RecentTransactions
          expenses={expenses}
          incomes={incomes}
          currency={currency}
          onSeeAll={() => router.push("/transactions" as any)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  periodToggle: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: 4,
    backgroundColor: "transparent",
    borderRadius: 12,
    gap: spacing.sm,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 10,
  },
  periodText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
