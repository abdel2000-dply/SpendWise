import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { spacing, typography } from '../../theme/theme';
import { Category } from '../../types';
import { Icon } from '../atoms/Icon';

interface CategoryBadgeProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: category.color + '20' },
        selected && { borderColor: category.color, borderWidth: 2 },
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: category.color },
        ]}
      >
        <Icon name={category.icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.name, selected && { color: category.color }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 24,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: Colors.text,
  },
});
