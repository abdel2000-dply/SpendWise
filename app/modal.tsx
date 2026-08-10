import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Button } from "../src/components/atoms/Button";
import { TextInput } from "../src/components/atoms/Input";
import { CategoryGrid } from "../src/components/organisms/CategoryGrid";
import {
    CURRENCY_SYMBOL_RIGHT,
    CURRENCY_SYMBOLS,
} from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addExpense, updateExpense } from "../src/store/slices/expenseSlice";
import { addIncome, updateIncome } from "../src/store/slices/incomeSlice";
import {
    setLastUsedCategoryId,
    setLastUsedSourceId,
} from "../src/store/slices/settingsSlice";
import { spacing, typography } from "../src/theme/theme";
import { Category, Expense, Income, IncomeSource } from "../src/types";
import { suggestCategory } from "../src/utils/autoCategorize";
import { generateId } from "../src/utils/generateId";
import { hapticSelection, hapticSuccess } from "../src/utils/haptics";

type TransactionMode = "expense" | "income";

export default function ModalScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { expenseId, incomeId, mode: paramMode } = useLocalSearchParams();
  const categories = useAppSelector((state) => state.categories.categories);
  const incomeSources = useAppSelector((state) => state.incomeSources.sources);
  const currency = useAppSelector((state) => state.settings.currency);
  const lastUsedCategoryId = useAppSelector(
    (state) => state.settings.lastUsedCategoryId,
  );
  const lastUsedSourceId = useAppSelector(
    (state) => state.settings.lastUsedSourceId,
  );
  const allExpenses = useAppSelector((state) => state.expenses.expenses);
  const availableTags = useAppSelector((state) => state.tags.tags);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const expenseToEdit = useAppSelector((state) =>
    expenseId ? state.expenses.expenses.find((e) => e.id === expenseId) : null,
  );
  const incomeToEdit = useAppSelector((state) =>
    incomeId ? state.incomes.incomes.find((i) => i.id === incomeId) : null,
  );
  const isEditMode = !!expenseId || !!incomeId;

  const [transactionMode, setTransactionMode] = useState<TransactionMode>(
    paramMode === "income" || !!incomeId ? "income" : "expense",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedSource, setSelectedSource] = useState<IncomeSource | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(
    undefined,
  );

  const currencySymbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;

  useEffect(() => {
    const title = isEditMode
      ? transactionMode === "income"
        ? "Edit Income"
        : "Edit Expense"
      : transactionMode === "income"
        ? "Add Income"
        : "Add Expense";
    navigation.setOptions({ title });
  }, [isEditMode, transactionMode, navigation]);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setNote(expenseToEdit.note || "");
      setSelectedCategory(expenseToEdit.category);
      setSelectedDate(new Date(expenseToEdit.date));
      setSelectedTags(expenseToEdit.tags || []);
      setReceiptPhoto(expenseToEdit.receiptPhoto);
      setTransactionMode("expense");
    }
  }, [expenseToEdit]);

  useEffect(() => {
    if (incomeToEdit) {
      setAmount(incomeToEdit.amount.toString());
      setNote(incomeToEdit.note || "");
      setSelectedSource(incomeToEdit.source);
      setSelectedDate(new Date(incomeToEdit.date));
      setSelectedTags(incomeToEdit.tags || []);
      setTransactionMode("income");
    }
  }, [incomeToEdit]);

  // Smart defaults: pre-select last used category/source
  useEffect(() => {
    if (isEditMode) return;
    if (
      transactionMode === "expense" &&
      !selectedCategory &&
      lastUsedCategoryId
    ) {
      const cat = categories.find((c) => c.id === lastUsedCategoryId);
      if (cat) setSelectedCategory(cat);
    }
    if (transactionMode === "income" && !selectedSource && lastUsedSourceId) {
      const src = incomeSources.find((s) => s.id === lastUsedSourceId);
      if (src) setSelectedSource(src);
    }
  }, [transactionMode, isEditMode]);

  // Auto-suggest category from note text
  const handleNoteChange = (text: string) => {
    setNote(text);
    if (
      transactionMode === "expense" &&
      text.length >= 3 &&
      !selectedCategory
    ) {
      const suggested = suggestCategory(text, categories, allExpenses);
      if (suggested) {
        setSelectedCategory(suggested);
        hapticSelection();
      }
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (transactionMode === "expense") {
      if (!selectedCategory) {
        Alert.alert("Error", "Please select a category");
        return;
      }

      if (isEditMode && expenseToEdit) {
        const updatedExpense: Expense = {
          ...expenseToEdit,
          amount: parseFloat(amount),
          currency,
          category: selectedCategory,
          date: selectedDate,
          note: note || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          receiptPhoto,
          updatedAt: new Date(),
        };
        dispatch(updateExpense(updatedExpense));
      } else {
        const newExpense: Expense = {
          id: generateId(),
          amount: parseFloat(amount),
          currency,
          category: selectedCategory,
          date: selectedDate,
          note: note || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          receiptPhoto,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch(addExpense(newExpense));
      }
      dispatch(setLastUsedCategoryId(selectedCategory.id));
    } else {
      if (!selectedSource) {
        Alert.alert("Error", "Please select an income source");
        return;
      }

      if (isEditMode && incomeToEdit) {
        const updatedIncome: Income = {
          ...incomeToEdit,
          amount: parseFloat(amount),
          currency,
          source: selectedSource,
          date: selectedDate,
          note: note || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          updatedAt: new Date(),
        };
        dispatch(updateIncome(updatedIncome));
      } else {
        const newIncome: Income = {
          id: generateId(),
          amount: parseFloat(amount),
          currency,
          source: selectedSource,
          date: selectedDate,
          note: note || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch(addIncome(newIncome));
      }
      dispatch(setLastUsedSourceId(selectedSource.id));
    }

    hapticSuccess();
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={[]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Transaction Type Toggle */}
            {!isEditMode && (
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    styles.toggleButtonLeft,
                    transactionMode === "expense" && {
                      backgroundColor: colors.error,
                    },
                    transactionMode !== "expense" && {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    hapticSelection();
                    setTransactionMode("expense");
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color:
                          transactionMode === "expense"
                            ? "#FFFFFF"
                            : colors.text,
                      },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    styles.toggleButtonRight,
                    transactionMode === "income" && {
                      backgroundColor: colors.success,
                    },
                    transactionMode !== "income" && {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => {
                    hapticSelection();
                    setTransactionMode("income");
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color:
                          transactionMode === "income"
                            ? "#FFFFFF"
                            : colors.text,
                      },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                mode="outlined"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                left={
                  !CURRENCY_SYMBOL_RIGHT.has(currency) ? (
                    <TextInput.Affix text={currencySymbol} />
                  ) : undefined
                }
                right={
                  CURRENCY_SYMBOL_RIGHT.has(currency) ? (
                    <TextInput.Affix text={currencySymbol} />
                  ) : undefined
                }
                style={styles.amountInput}
              />
            </View>

            {/* Date Picker */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateButtonIcon]}>📅</Text>
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setSelectedDate(date);
                  }}
                  maximumDate={new Date()}
                  themeVariant={
                    colors.background === "#121212" ? "dark" : "light"
                  }
                />
              )}
            </View>

            {/* Category / Source Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                {transactionMode === "expense" ? "Category" : "Source"}
              </Text>
              {transactionMode === "expense" ? (
                <CategoryGrid
                  categories={categories}
                  selectedCategoryId={selectedCategory?.id}
                  onCategorySelect={setSelectedCategory}
                />
              ) : (
                <CategoryGrid
                  categories={incomeSources.map((s) => ({
                    id: s.id,
                    name: s.name,
                    icon: s.icon,
                    color: s.color,
                    isDefault: s.isDefault,
                  }))}
                  selectedCategoryId={selectedSource?.id}
                  onCategorySelect={(cat) => {
                    const source = incomeSources.find((s) => s.id === cat.id);
                    if (source) setSelectedSource(source);
                  }}
                />
              )}
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Note (Optional)
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Tags (Optional)
              </Text>
              <View style={styles.tagsContainer}>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: isSelected ? tag.color : colors.card,
                          borderColor: isSelected ? tag.color : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedTags((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id],
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: isSelected ? "#FFFFFF" : colors.textLight },
                        ]}
                      >
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Receipt Photo (Expense only) */}
            {transactionMode === "expense" && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Receipt Photo (Optional)
                </Text>
                {receiptPhoto ? (
                  <View style={styles.receiptContainer}>
                    <Image
                      source={{ uri: receiptPhoto }}
                      style={styles.receiptImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={[
                        styles.receiptRemove,
                        { backgroundColor: colors.error },
                      ]}
                      onPress={() => setReceiptPhoto(undefined)}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.receiptButtons}>
                    <TouchableOpacity
                      style={[
                        styles.receiptButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={async () => {
                        const result = await ImagePicker.launchCameraAsync({
                          mediaTypes: ["images"],
                          quality: 0.7,
                          allowsEditing: true,
                        });
                        if (!result.canceled && result.assets[0]) {
                          setReceiptPhoto(result.assets[0].uri);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="camera"
                        size={22}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.receiptButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Camera
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.receiptButton,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={async () => {
                        const result =
                          await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ["images"],
                            quality: 0.7,
                            allowsEditing: true,
                          });
                        if (!result.canceled && result.assets[0]) {
                          setReceiptPhoto(result.assets[0].uri);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="images"
                        size={22}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.receiptButtonText,
                          { color: colors.text },
                        ]}
                      >
                        Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.card,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button onPress={handleSave} style={styles.button}>
            {isEditMode
              ? transactionMode === "income"
                ? "Update Income"
                : "Update Expense"
              : transactionMode === "income"
                ? "Save Income"
                : "Save Expense"}
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
  toggleContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  toggleButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  toggleText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dateButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
  receiptContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  receiptRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptButtons: {
    flexDirection: "row",
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
