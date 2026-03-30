import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    timeFilter === 'day' ? 1 : timeFilter === 'week' ? 7 : timeFilter === 'year' ? 365 : 30
  );

  // Transaction count
  const txCount = filteredExpenses.length;

  // Top category
  const topCategory = categoryBreakdown[0];

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
                secondaryContainer: Colors.primary,
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

        {/* Extra stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Transactions"
            value={txCount.toString()}
            icon="receipt"
            iconColor={Colors.secondary}
          />
          <StatCard
            title="Top Category"
            value={topCategory ? topCategory.category.name.split(' ')[0] : '—'}
            icon="pricetag"
            iconColor={Colors.warning}
          />
        </View>

        {/* Spending Breakdown — custom horizontal bar chart */}
        {categoryBreakdown.length > 0 ? (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Where Your Money Goes</Text>

            {categoryBreakdown.map((item, index) => (
              <View key={item.category.id} style={styles.barRow}>
                {/* Label row */}
                <View style={styles.barLabelRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={[styles.dot, { backgroundColor: item.category.color }]} />
                    <Text style={[styles.barLabel, { color: colors.text }]} numberOfLines={1}>
                      {item.category.name}
                    </Text>
                    <Text style={[styles.barTx, { color: colors.textLight }]}>
                      {item.transactionCount}×
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.barAmount, { color: colors.text }]}>
                      {formatCurrency(item.amount, currency)}
                    </Text>
                    <Text style={[styles.barPct, { color: colors.textLight }]}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: item.category.color,
                        width: `${Math.min(item.percentage, 100)}%`,
                        opacity: 0.75 + 0.25 * (1 - index / Math.max(categoryBreakdown.length, 1)),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Where Your Money Goes</Text>
            <View style={styles.emptyChart}>
              <Text style={{ fontSize: 40 }}>📊</Text>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                No expenses for this period
              </Text>
            </View>
          </Card>
        )}

        {/* Donut-style summary */}
        {categoryBreakdown.length > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Summary</Text>
            {/* Color legend row */}
            <View style={styles.legendRow}>
              {categoryBreakdown.slice(0, 5).map((item) => (
                <View key={item.category.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.category.color }]} />
                  <Text style={[styles.legendLabel, { color: colors.textLight }]} numberOfLines={1}>
                    {item.category.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
              {categoryBreakdown.length > 5 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.textLight }]} />
                  <Text style={[styles.legendLabel, { color: colors.textLight }]}>Other</Text>
                </View>
              )}
            </View>

            {/* Segmented bar */}
            <View style={styles.segBar}>
              {categoryBreakdown.slice(0, 6).map((item, i) => (
                <View
                  key={item.category.id}
                  style={{
                    width: `${item.percentage}%`,
                    height: 16,
                    backgroundColor: item.category.color,
                    borderRadius: i === 0 ? 8 : i === Math.min(categoryBreakdown.length, 6) - 1 ? 8 : 0,
                    borderTopLeftRadius: i === 0 ? 8 : 0,
                    borderBottomLeftRadius: i === 0 ? 8 : 0,
                    borderTopRightRadius: i === Math.min(categoryBreakdown.length, 6) - 1 ? 8 : 0,
                    borderBottomRightRadius: i === Math.min(categoryBreakdown.length, 6) - 1 ? 8 : 0,
                  }}
                />
              ))}
            </View>

            {/* Total */}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.textLight }]}>Total spending</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatCurrency(totalSpent, currency)}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold },
  filterContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.xs },

  // Chart card
  chartCard: { margin: spacing.md, padding: spacing.md },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },

  // Bar rows
  barRow: { marginBottom: spacing.md },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  barLabel: { fontSize: typography.fontSize.sm, flex: 1 },
  barTx: { fontSize: typography.fontSize.xs, marginLeft: spacing.xs },
  barAmount: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  barPct: { fontSize: typography.fontSize.xs },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  // Summary card
  summaryCard: { margin: spacing.md, marginTop: 0, padding: spacing.md },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', minWidth: 60 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendLabel: { fontSize: typography.fontSize.xs },
  segBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: typography.fontSize.sm },
  totalValue: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },

  // Empty
  emptyChart: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { fontSize: typography.fontSize.md, marginTop: spacing.sm },
});

