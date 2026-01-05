import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../../theme/theme';
import { Category } from '../../types';
import { CategoryBadge } from '../molecules/CategoryBadge';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          selected={selectedCategoryId === category.id}
          onPress={() => onCategorySelect(category)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
