import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Temporarily removed heavy chart imports for faster bundling
// import { PieChart, LineChart } from 'react-native-chart-kit';

import { Card } from '../../src/components/atoms/Card';
import { StatCard } from '../../src/components/molecules/StatCard';
import { Colors } from '../../src/constants/colors';
import { useAppSelector } from '../../src/hooks/useRedux';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing, typography } from '../../src/theme/theme';
import { TimeFilter } from '../../src/types';
import {
    calculateCategoryBreakdown,
    calculateDailyAverage,
    calculateTotalSpent,
    getExpensesByPeriod,
} from '../../src/utils/calculations';
import { formatCurrency } from '../../src/utils/formatters';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const currency = useAppSelector((state) => state.settings.currency);
  const categories = useAppSelector((state) => state.categories.categories);
  const colors = useThemeColors();
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const filteredExpenses = getExpensesByPeriod(expenses, timeFilter);
  const totalSpent = calculateTotalSpent(filteredExpenses);
  const categoryBreakdown = calculateCategoryBreakdown(filteredExpenses, categories);
  const dailyAverage = calculateDailyAverage(
    filteredExpenses,
    timeFilter === 'week' ? 7 : 30
  );

  // Pie Chart Data - Temporarily simplified for faster loading
  const pieData = categoryBreakdown.slice(0, 5).map((item, index) => ({
    name: item.category.name,
    amount: item.amount,
    color: item.category.color,
    legendFontColor: Colors.text,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={timeFilter}
            onValueChange={(value) => setTimeFilter(value as TimeFilter)}
            buttons={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            style={{ backgroundColor: colors.card }}
            theme={{
              colors: {
                secondaryContainer: Colors.secondary,
                onSecondaryContainer: '#FFFFFF',
                onSurface: colors.text,
              },
            }}
          />
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Total Spent"
            value={formatCurrency(totalSpent, currency)}
            icon="wallet"
            iconColor={Colors.primary}
          />
          <StatCard
            title="Daily Average"
            value={formatCurrency(dailyAverage, currency)}
            icon="trending-up"
            iconColor={Colors.success}
          />
        </View>

        {/* Category Breakdown - Simplified without heavy chart */}
        {pieData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending by Category</Text>
            <Text style={[styles.infoText, { color: colors.textLight }]}>
              📊 Charts will load faster in production build
            </Text>
            {/* PieChart removed for faster dev bundling - add back for production */}
          </Card>
        )}

        {/* Top Categories List */}
        <Card style={styles.categoriesCard}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Top Categories</Text>
          {categoryBreakdown.slice(0, 5).map((item, index) => (
            <View key={item.category.id} style={[styles.categoryItem, { borderBottomColor: colors.border }]}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: item.category.color },
                  ]}
                />
                <Text style={[styles.categoryName, { color: colors.text }]}>{item.category.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount, currency)}
                </Text>
                <Text style={[styles.categoryPercentage, { color: colors.textLight }]}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
          {categoryBreakdown.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textLight }]}>No expenses yet</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  chartCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  categoriesCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: typography.fontSize.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
