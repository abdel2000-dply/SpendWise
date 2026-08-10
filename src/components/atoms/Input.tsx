import React from "react";
import { StyleSheet } from "react-native";
import {
    TextInput as PaperTextInput,
    TextInputProps as PaperTextInputProps,
} from "react-native-paper";
import { useThemeColors } from "../../hooks/useThemeColors";

interface TextInputProps extends PaperTextInputProps {
  fullWidth?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  fullWidth = true,
  mode = "outlined",
  style,
  ...props
}) => {
  const colors = useThemeColors();

  return (
    <PaperTextInput
      mode={mode}
      style={[styles.input, fullWidth && styles.fullWidth, style]}
      textColor={colors.text}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
  },
  fullWidth: {
    width: "100%",
  },
});
