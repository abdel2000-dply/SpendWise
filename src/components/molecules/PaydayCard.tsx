import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { PaydayPattern } from "../../utils/calculations";

interface PaydayCardProps {
  pattern: PaydayPattern;
  formatCurrency: (amount: number, currency: string) => string;
  currency: string;
}

export const PaydayCard: React.FC<PaydayCardProps> = ({
  pattern,
  formatCurrency,
  currency,
}) => {
  const colors = useThemeColors();
  if (!pattern.detected || !pattern.nextPayday) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.success + "15" }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.success} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Next Payday
          </Text>
          <Text style={[styles.date, { color: colors.textLight }]}>
            {format(pattern.nextPayday, "EEEE, MMM d")}
            {" · "}~{formatCurrency(pattern.averageAmount, currency)}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                pattern.confidence === "high"
                  ? colors.success + "20"
                  : colors.warning + "20",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color:
                pattern.confidence === "high" ? colors.success : colors.warning,
            }}
          >
            {pattern.confidence === "high" ? "Reliable" : "Estimated"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  date: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
