import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatCard } from '../../src/components/molecules/StatCard';
import { ExpenseList } from '../../src/components/organisms/ExpenseList';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { deleteExpense } from '../../src/store/slices/expenseSlice';
import { spacing, typography } from '../../src/theme/theme';
import { Expense } from '../../src/types';
import {
    calculateTotalSpent,
    getExpensesByPeriod,
    sortExpensesByDate
} from '../../src/utils/calculations';
import { formatCurrency, formatDate } from '../../src/utils/formatters';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const todayExpenses = getExpensesByPeriod(expenses, 'day');
  const weekExpenses = getExpensesByPeriod(expenses, 'week');
  const monthExpenses = getExpensesByPeriod(expenses, 'month');

  const todayTotal = calculateTotalSpent(todayExpenses);
  const weekTotal = calculateTotalSpent(weekExpenses);
  const monthTotal = calculateTotalSpent(monthExpenses);

  const handleAddExpense = () => {
    router.push('/modal');
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteExpense(expense.id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ExpenseList
        expenses={sortExpensesByDate(expenses).slice(0, 20)}
        onExpenseDelete={handleDeleteExpense}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.text }]}>Welcome back!</Text>
                <Text style={[styles.date, { color: colors.textLight }]}>{ formatDate(new Date())}</Text>
              </View>
            </View>

            {/* Stats Cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsContainer}
            >
              <StatCard
                title="Today"
                value={formatCurrency(todayTotal, currency)}
                icon="today"
                iconColor={colors.primary}
              />
              <StatCard
                title="This Week"
                value={formatCurrency(weekTotal, currency)}
                icon="calendar"
                iconColor={colors.secondary}
              />
              <StatCard
                title="This Month"
                value={formatCurrency(monthTotal, currency)}
                icon="trending-up"
                iconColor={colors.success}
              />
            </ScrollView>

            {/* Recent Expenses Title */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            </View>
          </>
        }
      />

      {/* Floating Action Button */}
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.md,
  },
  statsContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});

