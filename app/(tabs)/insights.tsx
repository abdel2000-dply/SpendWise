import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../src/components/atoms/Card";
import { StatCard } from "../../src/components/molecules/StatCard";
import { useAppSelector } from "../../src/hooks/useRedux";
import { useSwipeTabs } from "../../src/hooks/useSwipeTabs";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { spacing, typography } from "../../src/theme/theme";
import {
    calculateCategoryBreakdown,
    calculateDailyAverage,
    calculateTotalIncome,
    calculateTotalSpent,
    generateSmartInsights,
    getExpensesByPeriod,
    getIncomesByPeriod,
    getMonthOverMonthChange,
    getSpendingTrend,
} from "../../src/utils/calculations";
import { formatCurrency } from "../../src/utils/formatters";
type InsightTimeFilter = "day" | "week" | "month" | "year";

const screenWidth = Dimensions.get("window").width;

export default function InsightsScreen() {
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.incomes.incomes);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();
  const swipeHandlers = useSwipeTabs();
  const router = useRouter();

  const [timeFilter, setTimeFilter] = useState<InsightTimeFilter>("month");

  const filteredExpenses = getExpensesByPeriod(expenses, timeFilter);
  const filteredIncomes = getIncomesByPeriod(incomes, timeFilter);
  const totalSpent = calculateTotalSpent(filteredExpenses);
  const totalIncome = calculateTotalIncome(filteredIncomes);
  const netBalance = totalIncome - totalSpent;
  const categoryBreakdown = calculateCategoryBreakdown(
    filteredExpenses,
    categories,
  );
  const dailyAverage = calculateDailyAverage(
    filteredExpenses,
    timeFilter === "day"
      ? 1
      : timeFilter === "week"
        ? 7
        : timeFilter === "month"
          ? 30
          : 365,
  );
  const monthChange = getMonthOverMonthChange(expenses);
  const trendData = getSpendingTrend(
    expenses,
    timeFilter === "day"
      ? 24
      : timeFilter === "week"
        ? 7
        : timeFilter === "month"
          ? 4
          : 12,
    timeFilter === "year" ? "month" : timeFilter === "month" ? "week" : "day",
  );
  const insights = useMemo(
    () => generateSmartInsights(expenses, incomes, budgets, categories),
    [expenses, incomes, budgets, categories],
  );

  // Pie chart data computation
  const pieData = categoryBreakdown.slice(0, 6);
  const maxPieAmount = pieData.length > 0 ? pieData[0].amount : 1;

  const filterButtons: { value: InsightTimeFilter; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

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
          <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.reportsBtn,
                {
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/(tabs)/statistics" as any)}
            >
              <Ionicons name="stats-chart" size={16} color={colors.primary} />
              <Text style={[styles.reportsBtnText, { color: colors.primary }]}>
                Statistics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportsBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/reports" as any)}
            >
              <Ionicons name="document-text" size={16} color="#FFF" />
              <Text style={styles.reportsBtnText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Filter */}
        <View style={styles.filterRow}>
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.value}
              style={[
                styles.filterButton,
                timeFilter === btn.value && { backgroundColor: colors.primary },
                timeFilter !== btn.value && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setTimeFilter(btn.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: timeFilter === btn.value ? "#FFF" : colors.text },
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Spent"
              value={formatCurrency(totalSpent, currency)}
              icon="arrow-down-circle"
              iconColor={colors.error}
            />
            <StatCard
              title="Income"
              value={formatCurrency(totalIncome, currency)}
              icon="arrow-up-circle"
              iconColor={colors.success}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Net"
              value={formatCurrency(Math.abs(netBalance), currency)}
              icon={netBalance >= 0 ? "trending-up" : "trending-down"}
              iconColor={netBalance >= 0 ? colors.success : colors.error}
              subtitle={netBalance >= 0 ? "Profit" : "Loss"}
            />
            <StatCard
              title="Daily Avg"
              value={formatCurrency(dailyAverage, currency)}
              icon="calendar"
              iconColor={colors.primary}
            />
          </View>
        </View>

        {/* Month-over-Month */}
        {timeFilter !== "day" && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                vs Last Month
              </Text>
              <View style={styles.comparisonRow}>
                <View
                  style={[
                    styles.changeIndicator,
                    {
                      backgroundColor:
                        monthChange.direction === "down"
                          ? colors.success + "15"
                          : monthChange.direction === "up"
                            ? colors.error + "15"
                            : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      monthChange.direction === "down"
                        ? "trending-down"
                        : monthChange.direction === "up"
                          ? "trending-up"
                          : "remove"
                    }
                    size={20}
                    color={
                      monthChange.direction === "down"
                        ? colors.success
                        : monthChange.direction === "up"
                          ? colors.error
                          : colors.textLight
                    }
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.changePercentage,
                      {
                        color:
                          monthChange.direction === "down"
                            ? colors.success
                            : monthChange.direction === "up"
                              ? colors.error
                              : colors.textLight,
                      },
                    ]}
                  >
                    {monthChange.direction === "same"
                      ? "No change"
                      : `${monthChange.percentage.toFixed(1)}% ${monthChange.direction === "up" ? "more" : "less"}`}
                  </Text>
                  <Text
                    style={[styles.changeAmount, { color: colors.textLight }]}
                  >
                    {formatCurrency(monthChange.amount, currency)} difference
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Spending Trend Chart */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Spending Trend
            </Text>
            <View style={styles.chartContainer}>
              {trendData.map((item, index) => {
                const maxVal = Math.max(...trendData.map((d) => d.amount), 1);
                const barHeight = Math.max(4, (item.amount / maxVal) * 100);
                const isHighest = item.amount === maxVal && item.amount > 0;
                return (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: isHighest
                              ? colors.primary
                              : colors.primaryLight + "60",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.barLabel, { color: colors.textLight }]}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Income vs Expense Bar Chart */}
        {(totalIncome > 0 || totalSpent > 0) && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Income vs Expenses
              </Text>
              <View style={styles.compareContainer}>
                <View style={styles.compareLegend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.success },
                      ]}
                    />
                    <Text
                      style={[styles.legendText, { color: colors.textLight }]}
                    >
                      Income
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: colors.error },
                      ]}
                    />
                    <Text
                      style={[styles.legendText, { color: colors.textLight }]}
                    >
                      Expenses
                    </Text>
                  </View>
                </View>
                {(() => {
                  const maxVal = Math.max(totalIncome, totalSpent, 1);
                  return (
                    <View style={styles.horizontalBars}>
                      <View style={styles.horizontalBarRow}>
                        <Text
                          style={[styles.barRowLabel, { color: colors.text }]}
                        >
                          {formatCurrency(totalIncome, currency)}
                        </Text>
                        <View
                          style={[
                            styles.horizontalBarBg,
                            { backgroundColor: colors.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.horizontalBarFill,
                              {
                                width: `${(totalIncome / maxVal) * 100}%`,
                                backgroundColor: colors.success,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={styles.horizontalBarRow}>
                        <Text
                          style={[styles.barRowLabel, { color: colors.text }]}
                        >
                          {formatCurrency(totalSpent, currency)}
                        </Text>
                        <View
                          style={[
                            styles.horizontalBarBg,
                            { backgroundColor: colors.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.horizontalBarFill,
                              {
                                width: `${(totalSpent / maxVal) * 100}%`,
                                backgroundColor: colors.error,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </View>
          </Card>
        )}

        {/* Donut / Category Breakdown */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Category Breakdown
            </Text>
            {pieData.length > 0 ? (
              <>
                {/* Visual rings */}
                <View style={styles.donutContainer}>
                  {pieData.map((item, index) => {
                    const size = 120 - index * 16;
                    return (
                      <View
                        key={item.category.id}
                        style={[
                          styles.donutRing,
                          {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderColor: item.category.color,
                            borderWidth: 8,
                            opacity: 1 - index * 0.12,
                          },
                        ]}
                      />
                    );
                  })}
                  <View style={styles.donutCenter}>
                    <Text style={[styles.donutTotal, { color: colors.text }]}>
                      {formatCurrency(totalSpent, currency)}
                    </Text>
                    <Text
                      style={[styles.donutLabel, { color: colors.textLight }]}
                    >
                      Total
                    </Text>
                  </View>
                </View>

                {/* Category list */}
                {pieData.map((item) => (
                  <View
                    key={item.category.id}
                    style={[
                      styles.categoryItem,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.category.color },
                        ]}
                      />
                      <Text
                        style={[styles.categoryName, { color: colors.text }]}
                      >
                        {item.category.name}
                      </Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text
                        style={[styles.categoryAmount, { color: colors.text }]}
                      >
                        {formatCurrency(item.amount, currency)}
                      </Text>
                      <Text
                        style={[
                          styles.categoryPercent,
                          { color: colors.textLight },
                        ]}
                      >
                        {item.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons
                  name="pie-chart-outline"
                  size={48}
                  color={colors.textLight}
                />
                <Text
                  style={[styles.emptyChartText, { color: colors.textLight }]}
                >
                  Add expenses to see category breakdown
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionContent}>
              <View style={styles.insightsHeader}>
                <Ionicons name="bulb" size={20} color={colors.warning} />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text, marginBottom: 0 },
                  ]}
                >
                  Smart Insights
                </Text>
              </View>
              {insights.map((insight, index) => (
                <View
                  key={index}
                  style={[
                    styles.insightItem,
                    { borderLeftColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.insightText, { color: colors.text }]}>
                    {insight}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
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
  reportsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  reportsBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    borderRadius: 10,
    alignItems: "center",
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  statsGrid: {
    paddingHorizontal: spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionContent: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  // Comparison section
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  changeIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  changePercentage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  changeAmount: {
    fontSize: typography.fontSize.sm,
  },
  // Trend chart
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 130,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barWrapper: {
    height: 100,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: {
    width: "55%",
    minWidth: 14,
    maxWidth: 32,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  // Income vs Expense comparison
  compareContainer: {
    gap: spacing.md,
  },
  compareLegend: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
  },
  horizontalBars: {
    gap: spacing.md,
  },
  horizontalBarRow: {
    gap: spacing.xs,
  },
  barRowLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  horizontalBarBg: {
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  horizontalBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  // Donut chart
  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    marginBottom: spacing.md,
  },
  donutRing: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  donutCenter: {
    alignItems: "center",
  },
  donutTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  donutLabel: {
    fontSize: typography.fontSize.xs,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryPercent: {
    fontSize: typography.fontSize.xs,
  },
  emptyChart: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyChartText: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  // Smart Insights
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  insightItem: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
