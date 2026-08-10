import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { CoachingTip } from "../../utils/goalCoaching";

interface CoachingTipsProps {
  tips: CoachingTip[];
}

export const CoachingTips: React.FC<CoachingTipsProps> = ({ tips }) => {
  const colors = useThemeColors();
  if (tips.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>
        🎯 Goal Coaching
      </Text>
      {tips.map((tip) => (
        <View
          key={tip.id}
          style={[styles.card, { backgroundColor: colors.card }]}
        >
          <View style={[styles.icon, { backgroundColor: tip.color + "15" }]}>
            <Ionicons name={tip.icon as any} size={18} color={tip.color} />
          </View>
          <Text style={[styles.text, { color: colors.text }]} numberOfLines={3}>
            {tip.text}
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
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 4,
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
  text: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
});
