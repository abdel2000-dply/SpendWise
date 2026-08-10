import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { Card } from "../atoms/Card";

const screenWidth = Dimensions.get("window").width;

interface SpendingTrendChartProps {
  data: { label: string; amount: number }[];
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currency,
  formatCurrency,
}) => {
  const colors = useThemeColors();
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Card style={styles.card} shadowSize="small">
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Spending Trend
        </Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Last 7 days
        </Text>

        <View style={styles.chartContainer}>
          {data.map((item, index) => {
            const barHeight = Math.max(4, (item.amount / maxAmount) * 120);
            const isHighest = item.amount === maxAmount && item.amount > 0;
            return (
              <View key={index} style={styles.barGroup}>
                <Text style={[styles.barValue, { color: colors.textLight }]}>
                  {item.amount > 0 ? formatCurrency(item.amount, currency) : ""}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isHighest
                          ? colors.primary
                          : colors.primaryLight + "60",
                        borderRadius: 6,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textLight }]}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  container: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
    paddingTop: spacing.lg,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barWrapper: {
    height: 120,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: {
    width: "60%",
    minWidth: 20,
    maxWidth: 36,
  },
  barValue: {
    fontSize: 9,
    marginBottom: 4,
    textAlign: "center",
  },
  barLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
