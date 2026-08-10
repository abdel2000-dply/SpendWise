import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "../src/components/atoms/Icon";
import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addBudget } from "../src/store/slices/budgetSlice";
import { spacing, typography } from "../src/theme/theme";
import { Budget } from "../src/types";
import { generateId } from "../src/utils/generateId";

type BudgetPeriod = "daily" | "weekly" | "monthly" | "yearly";

export default function AddBudgetModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const currency = useAppSelector((state) => state.settings.currency);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [alertThreshold, setAlertThreshold] = useState(80);

  // Filter out categories that already have a budget
  const existingBudgetCategoryIds = budgets.map((b) => b.categoryId);
  const availableCategories = categories.filter(
    (c) => !existingBudgetCategoryIds.includes(c.id),
  );

  const handleSave = () => {
    if (!selectedCategoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const budget: Budget = {
      id: generateId(),
      categoryId: selectedCategoryId,
      amount: parsedAmount,
      period,
      startDate: new Date(),
      alertThreshold: alertThreshold / 100,
    };

    dispatch(addBudget(budget));
    router.back();
  };

  const periods: { value: BudgetPeriod; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const thresholds = [60, 70, 80, 90];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom + 32, spacing.xxl) },
      ]}
    >
      {/* Category Selection */}
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      {availableCategories.length > 0 ? (
        <View style={styles.categoryGrid}>
          {availableCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor:
                    selectedCategoryId === cat.id
                      ? cat.color + "20"
                      : colors.card,
                  borderColor:
                    selectedCategoryId === cat.id ? cat.color : colors.border,
                  borderWidth: selectedCategoryId === cat.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Icon name={cat.icon as any} size={22} color={cat.color} />
              <Text
                style={[styles.categoryName, { color: colors.text }]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            All categories already have budgets
          </Text>
        </View>
      )}

      {/* Amount */}
      <Text style={[styles.label, { color: colors.text }]}>Budget Amount</Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.currencySymbol, { color: colors.textLight }]}>
          {currencySymbol}
        </Text>
        <TextInput
          style={[styles.amountInput, { color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Period */}
      <Text style={[styles.label, { color: colors.text }]}>Period</Text>
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.periodButton,
              period === p.value && { backgroundColor: colors.primary },
              period !== p.value && {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setPeriod(p.value)}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === p.value ? "#FFF" : colors.text },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alert Threshold */}
      <Text style={[styles.label, { color: colors.text }]}>Alert at</Text>
      <View style={styles.thresholdRow}>
        {thresholds.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.thresholdButton,
              alertThreshold === t && {
                backgroundColor: colors.warning + "20",
                borderColor: colors.warning,
              },
              alertThreshold !== t && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setAlertThreshold(t)}
          >
            <Text
              style={[
                styles.thresholdText,
                {
                  color: alertThreshold === t ? colors.warning : colors.text,
                  fontWeight: alertThreshold === t ? "700" : "500",
                },
              ]}
            >
              {t}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.helperText, { color: colors.textLight }]}>
        You'll see a warning when spending reaches {alertThreshold}% of budget
      </Text>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Ionicons name="checkmark" size={22} color="#FFF" />
        <Text style={styles.saveText}>Create Budget</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.sm,
    minWidth: "45%",
    maxWidth: "48%",
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  emptyBox: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    paddingVertical: spacing.md,
  },
  periodRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: "center",
  },
  periodText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  thresholdRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  thresholdButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  thresholdText: {
    fontSize: typography.fontSize.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 14,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  saveText: {
    color: "#FFF",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
