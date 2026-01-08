import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { typography } from '../../theme/theme';

interface TypographyProps extends TextProps {
  variant?: 'heading' | 'title' | 'body' | 'caption' | 'label';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight = 'regular',
  color = Colors.text,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = getVariantStyle(variant);
  const weightStyle = getWeightStyle(weight);
  const textStyle: TextStyle = {
    color,
    textAlign: align,
  };

  return (
    <Text
      style={[variantStyle, weightStyle, textStyle, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const getVariantStyle = (variant: TypographyProps['variant']): TextStyle => {
  switch (variant) {
    case 'heading':
      return styles.heading;
    case 'title':
      return styles.title;
    case 'body':
      return styles.body;
    case 'caption':
      return styles.caption;
    case 'label':
      return styles.label;
    default:
      return styles.body;
  }
};

const getWeightStyle = (weight: TypographyProps['weight']): TextStyle => {
  return {
    fontWeight: typography.fontWeight[weight],
  };
};

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.fontSize.xxxl,
    lineHeight: typography.fontSize.xxxl * 1.2,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.fontSize.xxl * 1.2,
  },
  body: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * 1.5,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  label: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.fontSize.xs * 1.3,
    letterSpacing: 0.5,
  },
});
