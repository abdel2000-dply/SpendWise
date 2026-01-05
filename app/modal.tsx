import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/atoms/Button';
import { TextInput } from '../src/components/atoms/Input';
import { CategoryGrid } from '../src/components/organisms/CategoryGrid';
import { CURRENCY_SYMBOLS } from '../src/constants/categories';
import { useAppDispatch, useAppSelector } from '../src/hooks/useRedux';
import { useThemeColors } from '../src/hooks/useThemeColors';
import { addExpense } from '../src/store/slices/expenseSlice';
import { spacing, typography } from '../src/theme/theme';
import { Category, Expense } from '../src/types';

export default function ModalScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      currency,
      category: selectedCategory,
      date: new Date(),
      note: note || undefined,
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(addExpense(newExpense));
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                mode="outlined"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                left={<TextInput.Affix text={currencySymbol} />}
                style={styles.amountInput}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              <CategoryGrid
                categories={categories}
                selectedCategoryId={selectedCategory?.id}
                onCategorySelect={setSelectedCategory}
              />
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Note (Optional)</Text>
              <TextInput
                mode="outlined"
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            style={styles.button}
          >
            Save Expense
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  amountInput: {
    fontSize: typography.fontSize.xxl,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
});

