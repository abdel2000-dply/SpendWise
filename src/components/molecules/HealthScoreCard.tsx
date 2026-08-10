import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { FinancialHealthScore } from "../../types";

interface HealthScoreCardProps {
  score: FinancialHealthScore;
}

const getScoreColor = (
  s: number,
  colors: { success: string; warning: string; error: string },
) => {
  if (s >= 75) return colors.success;
  if (s >= 50) return colors.warning;
  return colors.error;
};

const getScoreLabel = (s: number) => {
  if (s >= 85) return "Excellent";
  if (s >= 70) return "Good";
  if (s >= 50) return "Fair";
  if (s >= 30) return "Needs Work";
  return "Critical";
};

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score }) => {
  const colors = useThemeColors();
  const scoreColor = getScoreColor(score.overall, colors);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Financial Health
        </Text>
        <View style={[styles.badge, { backgroundColor: scoreColor + "20" }]}>
          <Text style={[styles.badgeText, { color: scoreColor }]}>
            {getScoreLabel(score.overall)}
          </Text>
        </View>
      </View>
      <View style={styles.scoreRow}>
        <View style={styles.mainScore}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {score.overall}
          </Text>
          <Text style={[styles.scoreMax, { color: colors.textLight }]}>
            /100
          </Text>
        </View>
        <View style={styles.breakdown}>
          {[
            { label: "Budget", value: score.budgetAdherence },
            { label: "Savings", value: score.savingsRate },
            { label: "Trend", value: score.spendingTrend },
            { label: "Habits", value: score.consistency },
          ].map((item) => (
            <View key={item.label} style={styles.miniScore}>
              <View style={styles.miniBarBg}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: `${item.value}%` as any,
                      backgroundColor: getScoreColor(item.value, colors),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.miniLabel, { color: colors.textLight }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  mainScore: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
  },
  scoreMax: {
    fontSize: typography.fontSize.md,
    marginLeft: 2,
  },
  breakdown: {
    flex: 1,
    gap: 6,
  },
  miniScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  miniBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  miniLabel: {
    fontSize: 10,
    width: 42,
  },
});
