import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { spacing, typography } from '../../theme/theme';
import { Expense } from '../../types';
import { groupExpensesByDate, sortExpensesByDate } from '../../utils/calculations';
import { formatDate } from '../../utils/formatters';
import { ExpenseCard } from '../molecules/ExpenseCard';

interface ExpenseListProps {
  expenses: Expense[];
  onExpensePress?: (expense: Expense) => void;
  onExpenseDelete?: (expense: Expense) => void;
  ListHeaderComponent?: React.ReactElement | null;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onExpensePress,
  onExpenseDelete,
  ListHeaderComponent,
}) => {
  const theme = useTheme();
  const sortedExpenses = sortExpensesByDate(expenses);
  const groupedExpenses = groupExpensesByDate(sortedExpenses);
  
  const sections = Array.from(groupedExpenses.entries()).map(([date, items]) => ({
    date,
    data: items,
  }));

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>No expenses yet</Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>Tap + to add your first expense</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.date}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={[styles.dateHeader, { color: theme.colors.onSurface }]}>{formatDate(new Date(item.date))}</Text>
          {item.data.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={() => onExpensePress?.(expense)}
              onDelete={() => onExpenseDelete?.(expense)}
            />
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  emptyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
});
