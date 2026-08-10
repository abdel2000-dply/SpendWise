import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { Card } from "../atoms/Card";
import { Icon } from "../atoms/Icon";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  subtitle,
}) => {
  const colors = useThemeColors();
  const resolvedIconColor = iconColor || colors.primary;

  return (
    <Card style={styles.card} shadowSize="medium">
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: resolvedIconColor + "20" },
          ]}
        >
          <Icon name={icon} size={24} color={resolvedIconColor} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textLight }]}>
            {title}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  container: {
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
  },
});
