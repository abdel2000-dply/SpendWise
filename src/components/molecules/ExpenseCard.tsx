import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing, typography } from '../../theme/theme';
import { Expense } from '../../types';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.container}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: expense.category.color + '20' },
            ]}
          >
            <Icon
              name={expense.category.icon as any}
              size={24}
              color={expense.category.color}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.categoryName}>{expense.category.name}</Text>
            {expense.note && (
              <Text style={styles.note} numberOfLines={1}>
                {expense.note}
              </Text>
            )}
            <Text style={styles.time}>{formatTime(new Date(expense.date))}</Text>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.amount}>
              {formatCurrency(expense.amount, expense.currency)}
            </Text>
            {onDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={styles.deleteButton}
              >
                <Icon name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  note: {
    fontSize: typography.fontSize.sm,
    color: Colors.textLight,
    marginBottom: 2,
  },
  time: {
    fontSize: typography.fontSize.xs,
    color: Colors.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
