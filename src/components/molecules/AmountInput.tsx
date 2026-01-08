import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { CURRENCY_SYMBOLS } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { spacing, typography } from '../../theme/theme';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currency?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  currency = 'USD',
  error,
  label = 'Amount',
  placeholder = '0.00',
  autoFocus = false,
}) => {
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleChangeText = (text: string) => {
    // Allow only numbers and decimal point
    let cleaned = text.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const firstDecimalIndex = cleaned.indexOf('.');
    if (firstDecimalIndex !== -1) {
      // Keep everything before first decimal, the decimal itself, and up to 2 digits after
      const beforeDecimal = cleaned.substring(0, firstDecimalIndex);
      const afterDecimal = cleaned.substring(firstDecimalIndex + 1).replace(/\./g, ''); // Remove any additional decimals
      cleaned = beforeDecimal + '.' + afterDecimal.substring(0, 2);
    }
    
    onChangeText(cleaned);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: Colors.text }]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <Text style={[styles.currencySymbol, { color: Colors.primary }]}>
          {currencySymbol}
        </Text>
        <PaperTextInput
          mode="outlined"
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          error={!!error}
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineStyle={styles.outline}
          theme={{
            colors: {
              primary: Colors.primary,
              error: Colors.error,
            },
          }}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: Colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
  },
  outline: {
    borderRadius: 12,
    borderWidth: 2,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});
