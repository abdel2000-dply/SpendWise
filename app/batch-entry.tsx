import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/atoms/Button";
import { Card } from "../src/components/atoms/Card";
import { Icon } from "../src/components/atoms/Icon";
import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addExpense } from "../src/store/slices/expenseSlice";
import { spacing, typography } from "../src/theme/theme";
import { Category, Expense } from "../src/types";
import { generateId } from "../src/utils/generateId";
import { hapticLight, hapticSuccess } from "../src/utils/haptics";

interface BatchItem {
  id: string;
  amount: string;
  note: string;
  category: Category | null;
}

export default function BatchEntryScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const currencySymbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;

  const [items, setItems] = useState<BatchItem[]>([
    { id: "1", amount: "", note: "", category: null },
  ]);
  const [showCategoryPicker, setShowCategoryPicker] = useState<string | null>(
    null,
  );

  const addRow = () => {
    hapticLight();
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        amount: "",
        note: "",
        category: null,
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof BatchItem, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  };

  const validItems = items.filter(
    (i) => parseFloat(i.amount) > 0 && i.category,
  );

  const totalAmount = validItems.reduce(
    (sum, i) => sum + parseFloat(i.amount),
    0,
  );

  const handleSaveAll = () => {
    if (validItems.length === 0) {
      Alert.alert(
        "No Valid Entries",
        "Add at least one entry with an amount and category.",
      );
      return;
    }

    Alert.alert(
      "Add Transactions",
      `Add ${validItems.length} expense${validItems.length > 1 ? "s" : ""} totaling ${currencySymbol}${totalAmount.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add All",
          onPress: () => {
            const now = new Date();
            validItems.forEach((item, index) => {
              const expense: Expense = {
                id: `${now.getTime()}-${index}`,
                amount: parseFloat(item.amount),
                currency,
                category: item.category!,
                date: now,
                note: item.note || undefined,
                isRecurring: false,
                createdAt: now,
                updatedAt: now,
              };
              dispatch(addExpense(expense));
            });
            hapticSuccess();
            router.back();
          },
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: BatchItem; index: number }) => (
    <Card style={styles.rowCard}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowNum, { color: colors.textLight }]}>
          #{index + 1}
        </Text>
        {items.length > 1 && (
          <TouchableOpacity onPress={() => removeRow(item.id)}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Amount + Note row */}
      <View style={styles.inputRow}>
        <View style={styles.amountBox}>
          <Text style={[styles.currencyLabel, { color: colors.textLight }]}>
            {currencySymbol}
          </Text>
          <TextInput
            style={[
              styles.amountInput,
              { color: colors.text, borderColor: colors.border },
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
            value={item.amount}
            onChangeText={(v) => updateItem(item.id, "amount", v)}
          />
        </View>
        <TextInput
          style={[
            styles.noteInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Note..."
          placeholderTextColor={colors.textLight}
          value={item.note}
          onChangeText={(v) => updateItem(item.id, "note", v)}
        />
      </View>

      {/* Category selector */}
      {showCategoryPicker === item.id ? (
        <View style={styles.catGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catOption,
                {
                  backgroundColor:
                    item.category?.id === cat.id
                      ? cat.color + "25"
                      : colors.background,
                  borderColor:
                    item.category?.id === cat.id ? cat.color : colors.border,
                },
              ]}
              onPress={() => {
                updateItem(item.id, "category", cat);
                setShowCategoryPicker(null);
              }}
            >
              <Icon name={cat.icon as any} size={16} color={cat.color} />
              <Text
                style={[styles.catOptionText, { color: colors.text }]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.catButton,
            {
              backgroundColor: item.category
                ? item.category.color + "15"
                : colors.background,
              borderColor: item.category
                ? item.category.color + "40"
                : colors.border,
            },
          ]}
          onPress={() => setShowCategoryPicker(item.id)}
        >
          {item.category ? (
            <>
              <Icon
                name={item.category.icon as any}
                size={16}
                color={item.category.color}
              />
              <Text style={[styles.catBtnText, { color: colors.text }]}>
                {item.category.name}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="folder-outline"
                size={16}
                color={colors.textLight}
              />
              <Text style={[styles.catBtnText, { color: colors.textLight }]}>
                Select category
              </Text>
            </>
          )}
          <Ionicons name="chevron-down" size={14} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Info bar */}
        <View style={[styles.infoBar, { backgroundColor: colors.card }]}>
          <View style={styles.infoLeft}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>
              {validItems.length} valid
            </Text>
            <Text style={[styles.infoTotal, { color: colors.text }]}>
              Total: {currencySymbol}
              {totalAmount.toFixed(2)}
            </Text>
          </View>
          <Button
            variant="primary"
            onPress={handleSaveAll}
            disabled={validItems.length === 0}
          >
            Add All ({validItems.length})
          </Button>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addRowBtn, { borderColor: colors.primary + "40" }]}
              onPress={addRow}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addRowText, { color: colors.primary }]}>
                Add another entry
              </Text>
            </TouchableOpacity>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  infoLeft: { gap: 2 },
  infoLabel: { fontSize: typography.fontSize.xs },
  infoTotal: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  rowCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  rowNum: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 120,
  },
  currencyLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  amountInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 6,
    fontSize: typography.fontSize.lg,
    fontWeight: "600",
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: typography.fontSize.sm,
  },
  catButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  catBtnText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  catOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  catOptionText: {
    fontSize: 11,
    maxWidth: 70,
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  addRowText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
