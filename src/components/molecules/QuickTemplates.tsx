import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { spacing, typography } from "../../theme/theme";
import { QuickTemplate } from "../../types";
import { Icon } from "../atoms/Icon";

interface QuickTemplatesProps {
  templates: QuickTemplate[];
  currencySymbol: string;
  onUseTemplate: (template: QuickTemplate) => void;
  onManage: () => void;
}

export const QuickTemplates: React.FC<QuickTemplatesProps> = ({
  templates,
  currencySymbol,
  onUseTemplate,
  onManage,
}) => {
  const colors = useThemeColors();
  if (templates.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Quick Add</Text>
        <TouchableOpacity onPress={onManage}>
          <Text style={[styles.manage, { color: colors.primary }]}>Manage</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {templates.slice(0, 8).map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.chip,
              {
                backgroundColor: t.color + "15",
                borderColor: t.color + "30",
              },
            ]}
            onPress={() => onUseTemplate(t)}
            activeOpacity={0.7}
          >
            <Icon name={t.icon as any} size={16} color={t.color} />
            <Text
              style={[styles.chipName, { color: colors.text }]}
              numberOfLines={1}
            >
              {t.name}
            </Text>
            <Text style={[styles.chipAmount, { color: colors.textLight }]}>
              {currencySymbol}
              {t.amount}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  manage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    maxWidth: 80,
  },
  chipAmount: {
    fontSize: typography.fontSize.xs,
  },
});
