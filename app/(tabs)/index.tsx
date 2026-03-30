import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseList } from '../../src/components/organisms/ExpenseList';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { deleteExpense } from '../../src/store/slices/expenseSlice';
import { spacing, typography } from '../../src/theme/theme';
import { Expense } from '../../src/types';
import {
  calculateCategoryBreakdown,
  calculateTotalSpent,
  getBudgetSpent,
  getBudgetUsagePercent,
  getExpensesByPeriod,
  sortExpensesByDate,
} from '../../src/utils/calculations';
import { formatCurrency, formatDate } from '../../src/utils/formatters';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const categories = useAppSelector((state) => state.categories.categories);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const savings = useAppSelector((state) => state.savings.goals);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const monthExpenses = getExpensesByPeriod(expenses, 'month');
  const weekExpenses = getExpensesByPeriod(expenses, 'week');
  const todayExpenses = getExpensesByPeriod(expenses, 'day');

  const monthTotal = calculateTotalSpent(monthExpenses);
  const weekTotal = calculateTotalSpent(weekExpenses);
  const todayTotal = calculateTotalSpent(todayExpenses);

  const topCategories = calculateCategoryBreakdown(monthExpenses, categories).slice(0, 3);

  // Show at most 2 budgets in snapshot (those closest to limit)
  const budgetSnapshot = budgets
    .map((b) => ({
      budget: b,
      spent: getBudgetSpent(b, expenses),
      pct: getBudgetUsagePercent(b, expenses),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2);

  // First savings goal (if any)
  const topGoal = savings[0];

  const handleAddExpense = () => {
    router.push('/modal');
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteExpense(expense.id)),
      },
    ]);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ExpenseList
        expenses={sortExpensesByDate(expenses).slice(0, 20)}
        onExpenseDelete={handleDeleteExpense}
        ListHeaderComponent={
          <>
            {/* ── Header ─────────────────────────────────────── */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.text }]}>{greeting}! 👋</Text>
                <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(new Date())}</Text>
              </View>
            </View>

            {/* ── Monthly Overview Card ──────────────────────── */}
            <View style={[styles.overviewCard, { backgroundColor: colors.primary }]}>
              <Text style={styles.overviewLabel}>Spent this month</Text>
              <Text style={styles.overviewAmount}>{formatCurrency(monthTotal, currency)}</Text>
              <View style={styles.overviewRow}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatLabel}>This week</Text>
                  <Text style={styles.overviewStatValue}>{formatCurrency(weekTotal, currency)}</Text>
                </View>
                <View style={[styles.overviewDivider]} />
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatLabel}>Today</Text>
                  <Text style={styles.overviewStatValue}>{formatCurrency(todayTotal, currency)}</Text>
                </View>
              </View>
            </View>

            {/* ── Top Spending Categories ────────────────────── */}
            {topCategories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
                  <TouchableOpacity onPress={() => router.push('/statistics')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  {topCategories.map((item, index) => (
                    <View key={item.category.id}>
                      <View style={styles.categoryRow}>
                        <View style={styles.categoryLeft}>
                          <View style={[styles.categoryDot, { backgroundColor: item.category.color }]} />
                          <Text style={[styles.categoryName, { color: colors.text }]}>
                            {item.category.name}
                          </Text>
                        </View>
                        <View style={styles.categoryRight}>
                          <Text style={[styles.categoryAmount, { color: colors.text }]}>
                            {formatCurrency(item.amount, currency)}
                          </Text>
                          <Text style={[styles.categoryPct, { color: colors.textLight }]}>
                            {item.percentage.toFixed(0)}%
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
                            },
                          ]}
                        />
                      </View>
                      {index < topCategories.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Budget Snapshot ────────────────────────────── */}
            {budgetSnapshot.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Snapshot</Text>
                  <TouchableOpacity onPress={() => router.push('/budget')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  {budgetSnapshot.map((item, index) => {
                    const label = item.budget.categoryId
                      ? (categories.find((c) => c.id === item.budget.categoryId)?.name ?? 'Category')
                      : `Overall (${item.budget.period})`;
                    const isOver = item.pct >= 100;
                    const isWarning = item.pct >= item.budget.alertThreshold;
                    const barColor = isOver
                      ? colors.error
                      : isWarning
                      ? colors.warning
                      : colors.success;
                    return (
                      <View key={item.budget.id}>
                        <View style={styles.budgetRow}>
                          <Text style={[styles.budgetLabel, { color: colors.text }]}>{label}</Text>
                          <Text style={[styles.budgetAmount, { color: isOver ? colors.error : colors.text }]}>
                            {formatCurrency(item.spent, currency)} / {formatCurrency(item.budget.amount, currency)}
                          </Text>
                        </View>
                        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.barFill,
                              { backgroundColor: barColor, width: `${Math.min(item.pct, 100)}%` },
                            ]}
                          />
                        </View>
                        {index < budgetSnapshot.length - 1 && (
                          <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Savings Goal Teaser ────────────────────────── */}
            {topGoal ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings Goal</Text>
                  <TouchableOpacity onPress={() => router.push('/budget')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>View all</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.card, styles.goalCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/budget')}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalIcon}>{topGoal.icon}</Text>
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={[styles.goalName, { color: colors.text }]}>{topGoal.name}</Text>
                      <Text style={[styles.goalProgress, { color: colors.textLight }]}>
                        {formatCurrency(topGoal.currentAmount, currency)} of{' '}
                        {formatCurrency(topGoal.targetAmount, currency)}
                      </Text>
                    </View>
                    <Text style={[styles.goalPct, { color: topGoal.color }]}>
                      {Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.border, marginTop: spacing.sm }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: topGoal.color,
                          width: `${Math.min((topGoal.currentAmount / topGoal.targetAmount) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.card, styles.goalEmptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/budget')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.goalEmptyIcon}>🎯</Text>
                  <Text style={[styles.goalEmptyText, { color: colors.text }]}>Set a savings goal</Text>
                  <Text style={[styles.goalEmptySub, { color: colors.textLight }]}>
                    Start saving toward your dreams
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Recent Expenses Title ──────────────────────── */}
            <View style={styles.sectionHeader2}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            </View>
          </>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddExpense}
        color="#FFFFFF"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  date: { fontSize: typography.fontSize.sm },

  // Monthly overview card
  overviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 20,
    padding: spacing.lg,
  },
  overviewLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  overviewAmount: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: { flex: 1 },
  overviewStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.fontSize.xs,
    marginBottom: 2,
  },
  overviewStatValue: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  overviewDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },

  // Sections
  section: { marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeader2: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  seeAll: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },

  // Card
  card: {
    marginHorizontal: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Category rows
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  categoryName: { fontSize: typography.fontSize.sm },
  categoryRight: { alignItems: 'flex-end' },
  categoryAmount: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  categoryPct: { fontSize: typography.fontSize.xs },

  // Budget rows
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  budgetLabel: { fontSize: typography.fontSize.sm, flex: 1 },
  budgetAmount: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },

  // Bar
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  divider: { height: 1, marginVertical: spacing.sm },

  // Savings goal
  goalCard: { padding: spacing.md },
  goalHeader: { flexDirection: 'row', alignItems: 'center' },
  goalIcon: { fontSize: 28 },
  goalName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  goalProgress: { fontSize: typography.fontSize.xs, marginTop: 2 },
  goalPct: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  goalEmptyCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  goalEmptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  goalEmptyText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  goalEmptySub: { fontSize: typography.fontSize.sm, marginTop: 4 },

  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});


