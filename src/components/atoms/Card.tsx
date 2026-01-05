import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { CardProps, Card as PaperCard, useTheme } from 'react-native-paper';
import { shadows } from '../../theme/theme';

interface CustomCardProps extends Omit<CardProps, 'children'> {
  shadowSize?: 'small' | 'medium' | 'large';
  children?: ReactNode;
}

export const Card: React.FC<CustomCardProps> = ({
  shadowSize = 'small',
  style,
  children,
  elevation,
  ...props
}) => {
  const theme = useTheme();
  const elevationStyle: ViewStyle = shadows[shadowSize];
  
  // Map shadowSize to numeric elevation if not provided
  const defaultElevation = shadowSize === 'large' ? 4 : shadowSize === 'medium' ? 2 : 1;
  const cardElevation = typeof elevation === 'number' ? elevation : defaultElevation;

  return (
    <PaperCard
      elevation={cardElevation}
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        elevationStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
