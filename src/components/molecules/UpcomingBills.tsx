import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { RecurringTransaction } from "../../types";
import { Icon } from "../atoms/Icon";

type BillItem = RecurringTransaction & { daysUntilDue: number };

interface UpcomingBillsProps {
  bills: BillItem[];
  formatCurrency: (amount: number, currency: string) => string;
  currency: string;
  onSeeAll: () => void;
}

export const UpcomingBills: React.FC<UpcomingBillsProps> = ({
  bills,
  formatCurrency,
  currency,
  onSeeAll,
}) => {
  const colors = useThemeColors();
  if (bills.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          🔔 Upcoming Bills
        </Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      {bills.map((bill) => (
        <View
          key={bill.id}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.icon,
              {
                backgroundColor: (bill.category?.color || colors.error) + "15",
              },
            ]}
          >
            <Icon
              name={(bill.category?.icon || "cash") as any}
              size={18}
              color={bill.category?.color || colors.error}
            />
          </View>
          <View style={styles.info}>
            <Text style={[styles.billName, { color: colors.text }]}>
              {bill.note || bill.category?.name || "Bill"}
            </Text>
            <Text
              style={[
                styles.dueText,
                {
                  color:
                    bill.daysUntilDue === 0
                      ? colors.error
                      : bill.daysUntilDue <= 2
                        ? colors.warning
                        : colors.textLight,
                },
              ]}
            >
              {bill.daysUntilDue === 0
                ? "Due today!"
                : bill.daysUntilDue === 1
                  ? "Due tomorrow"
                  : `Due in ${bill.daysUntilDue} days`}
            </Text>
          </View>
          <Text style={[styles.amount, { color: colors.error }]}>
            {formatCurrency(bill.amount, currency)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: 12,
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  billName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  dueText: {
    fontSize: typography.fontSize.xs,
    marginTop: 1,
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
