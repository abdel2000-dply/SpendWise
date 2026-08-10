import { Ionicons } from "@expo/vector-icons";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
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

import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addRecurring } from "../src/store/slices/recurringSlice";
import { spacing, typography } from "../src/theme/theme";
import { RecurringTransaction } from "../src/types";
import { generateId } from "../src/utils/generateId";

const FREQUENCIES = [
  { key: "daily", label: "Daily", icon: "today" },
  { key: "weekly", label: "Weekly", icon: "calendar" },
  { key: "monthly", label: "Monthly", icon: "calendar-outline" },
  { key: "yearly", label: "Yearly", icon: "globe" },
] as const;

export default function AddRecurringScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const categories = useAppSelector((state) => state.categories.categories);
  const incomeSources = useAppSelector((state) => state.incomeSources.sources);
  const currency = useAppSelector((state) => state.settings.currency);

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (type === "expense" && !selectedCategoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (type === "income" && !selectedSourceId) {
      Alert.alert("Error", "Please select an income source");
      return;
    }

    const category =
      type === "expense"
        ? categories.find((c) => c.id === selectedCategoryId)
        : undefined;
    const source =
      type === "income"
        ? incomeSources.find((s) => s.id === selectedSourceId)
        : undefined;

    const getNextDueDate = (): Date => {
      const now = new Date();
      switch (frequency) {
        case "daily":
          return addDays(now, 1);
        case "weekly":
          return addWeeks(now, 1);
        case "monthly":
          return addMonths(now, 1);
        case "yearly":
          return addYears(now, 1);
      }
    };

    const newRecurring: RecurringTransaction = {
      id: generateId(),
      type,
      amount: parsedAmount,
      currency,
      category,
      source,
      note: note.trim() || undefined,
      frequency,
      nextDueDate: getNextDueDate(),
      isActive: true,
      createdAt: new Date(),
    };

    dispatch(addRecurring(newRecurring));
    router.back();
  };

  const items = type === "expense" ? categories : incomeSources;
  const selectedId = type === "expense" ? selectedCategoryId : selectedSourceId;
  const setSelectedId =
    type === "expense" ? setSelectedCategoryId : setSelectedSourceId;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom + 32, spacing.xxl * 2) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Type Toggle */}
      <View style={[styles.typeToggle, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && {
              backgroundColor: colors.error + "15",
              borderColor: colors.error,
            },
          ]}
          onPress={() => {
            setType("expense");
            setSelectedSourceId(null);
          }}
        >
          <Ionicons
            name="arrow-down-circle"
            size={18}
            color={type === "expense" ? colors.error : colors.textLight}
          />
          <Text
            style={[
              styles.typeText,
              { color: type === "expense" ? colors.error : colors.textLight },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && {
              backgroundColor: colors.success + "15",
              borderColor: colors.success,
            },
          ]}
          onPress={() => {
            setType("income");
            setSelectedCategoryId(null);
          }}
        >
          <Ionicons
            name="arrow-up-circle"
            size={18}
            color={type === "income" ? colors.success : colors.textLight}
          />
          <Text
            style={[
              styles.typeText,
              { color: type === "income" ? colors.success : colors.textLight },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.currencySymbol, { color: colors.textLight }]}>
          {currency}
        </Text>
        <TextInput
          style={[styles.amountInput, { color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.textLight}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />
      </View>

      {/* Frequency */}
      <Text style={[styles.label, { color: colors.text }]}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.frequencyButton,
              {
                backgroundColor:
                  frequency === f.key ? colors.primary + "15" : colors.card,
                borderColor:
                  frequency === f.key ? colors.primary : colors.border,
                borderWidth: frequency === f.key ? 2 : 1,
              },
            ]}
            onPress={() => setFrequency(f.key)}
          >
            <Ionicons
              name={f.icon as any}
              size={18}
              color={frequency === f.key ? colors.primary : colors.textLight}
            />
            <Text
              style={[
                styles.frequencyText,
                {
                  color:
                    frequency === f.key ? colors.primary : colors.textLight,
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category / Source */}
      <Text style={[styles.label, { color: colors.text }]}>
        {type === "expense" ? "Category" : "Source"}
      </Text>
      <View style={styles.categoryGrid}>
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: isSelected ? item.color + "20" : colors.card,
                  borderColor: isSelected ? item.color : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedId(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={isSelected ? item.color : colors.textLight}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? item.color : colors.textLight },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Note */}
      <Text style={[styles.label, { color: colors.text }]}>
        Note (optional)
      </Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.noteInput, { color: colors.text }]}
          placeholder="e.g., Netflix, Rent, Gym membership"
          placeholderTextColor={colors.textLight}
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Ionicons name="checkmark-circle" size={22} color="#FFF" />
        <Text style={styles.saveText}>Add Recurring Transaction</Text>
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
    paddingBottom: spacing.xxl * 2,
  },
  typeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm + 2,
    borderRadius: 10,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  currencySymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    paddingVertical: spacing.md,
  },
  noteInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    gap: spacing.xs,
  },
  frequencyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryItem: {
    width: "30%",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
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
