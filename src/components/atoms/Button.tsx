import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';

interface ButtonProps extends PaperButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  style,
  mode,
  ...props
}) => {
  const getMode = (): PaperButtonProps['mode'] => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  return (
    <PaperButton
      mode={mode || getMode()}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      contentStyle={styles.content}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    paddingVertical: 8,
  },
  fullWidth: {
    width: '100%',
  },
});
