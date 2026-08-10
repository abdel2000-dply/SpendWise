import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { AnimatedNumber } from "../atoms/AnimatedNumber";
import { Card } from "../atoms/Card";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expenses,
  currency,
  formatCurrency,
}) => {
  const colors = useThemeColors();

  return (
    <Card style={styles.card} shadowSize="large">
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <Text style={styles.label}>Total Balance</Text>
        <AnimatedNumber
          value={balance}
          formatter={(v) => formatCurrency(v, currency)}
          style={styles.balance}
        />

        <View style={styles.row}>
          <View style={styles.metric}>
            <View style={styles.metricIcon}>
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.metricLabel}>Income</Text>
              <AnimatedNumber
                value={income}
                formatter={(v) => formatCurrency(v, currency)}
                style={styles.metricValue}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metric}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: "rgba(255,255,255,0.15)" },
              ]}
            >
              <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.metricLabel}>Expenses</Text>
              <AnimatedNumber
                value={expenses}
                formatter={(v) => formatCurrency(v, currency)}
                style={styles.metricValue}
              />
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  container: {
    padding: spacing.lg,
    borderRadius: 16,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: "rgba(255,255,255,0.7)",
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: spacing.md,
  },
  metric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    color: "rgba(255,255,255,0.7)",
  },
  metricValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#FFFFFF",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.sm,
  },
});
