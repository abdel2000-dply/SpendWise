import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/atoms/Button";
import { Card } from "../src/components/atoms/Card";
import EmptyState from "../src/components/atoms/EmptyState";
import { Icon } from "../src/components/atoms/Icon";
import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addTemplate, deleteTemplate } from "../src/store/slices/templateSlice";
import { spacing, typography } from "../src/theme/theme";
import { QuickTemplate } from "../src/types";
import { generateId } from "../src/utils/generateId";
import { hapticSuccess, hapticWarning } from "../src/utils/haptics";

const ICON_OPTIONS = [
  "cafe",
  "restaurant",
  "car",
  "cart",
  "bus",
  "home",
  "receipt",
  "film",
  "fitness",
  "shirt",
  "gift",
  "medkit",
  "school",
  "laptop",
  "phone-portrait",
  "pizza",
  "beer",
  "briefcase",
  "cash",
  "card",
];

const COLOR_OPTIONS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#F39C12",
  "#2ECC71",
  "#3498DB",
  "#E74C3C",
  "#9B59B6",
  "#1ABC9C",
];

export default function TemplatesScreen() {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.templates.templates);
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const currencySymbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("cafe");
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [selectedType, setSelectedType] = useState<"expense" | "income">(
    "expense",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const resetForm = () => {
    setName("");
    setAmount("");
    setSelectedIcon("cafe");
    setSelectedColor("#FF6B6B");
    setSelectedType("expense");
    setSelectedCategoryId("");
  };

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a template name.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (selectedType === "expense" && !selectedCategoryId) {
      Alert.alert("Error", "Please select a category for expense templates.");
      return;
    }

    const template: QuickTemplate = {
      id: generateId(),
      name: name.trim(),
      amount: parseFloat(amount),
      type: selectedType,
      categoryId: selectedType === "expense" ? selectedCategoryId : undefined,
      icon: selectedIcon,
      color: selectedColor,
      usageCount: 0,
    };

    dispatch(addTemplate(template));
    hapticSuccess();
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string, templateName: string) => {
    hapticWarning();
    Alert.alert("Delete Template", `Delete "${templateName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteTemplate(id)),
      },
    ]);
  };

  const sortedTemplates = [...templates].sort(
    (a, b) => b.usageCount - a.usageCount,
  );

  const renderTemplate = ({ item }: { item: QuickTemplate }) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return (
      <Card style={styles.card}>
        <View style={styles.templateRow}>
          <View
            style={[styles.iconBox, { backgroundColor: item.color + "15" }]}
          >
            <Icon name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={styles.templateInfo}>
            <Text style={[styles.templateName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.templateMeta, { color: colors.textLight }]}>
              {item.type === "expense" ? "Expense" : "Income"}
              {category ? ` · ${category.name}` : ""}
              {item.usageCount > 0 ? ` · Used ${item.usageCount}x` : ""}
            </Text>
          </View>
          <Text
            style={[
              styles.templateAmount,
              {
                color: item.type === "expense" ? colors.error : colors.success,
              },
            ]}
          >
            {item.type === "expense" ? "-" : "+"}
            {currencySymbol}
            {item.amount}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={sortedTemplates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplate}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="flash-outline"
            title="No Templates Yet"
            subtitle="Create quick templates for expenses you add frequently, like coffee, lunch, or transit. One tap to add!"
            actionLabel="Create Template"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        }
      />

      {/* Add FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Template Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                New Template
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Type Toggle */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "expense" && {
                    backgroundColor: colors.error,
                  },
                  selectedType !== "expense" && {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setSelectedType("expense")}
              >
                <Text
                  style={{
                    color: selectedType === "expense" ? "#FFF" : colors.text,
                    fontWeight: "600",
                  }}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === "income" && {
                    backgroundColor: colors.success,
                  },
                  selectedType !== "income" && {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setSelectedType("income")}
              >
                <Text
                  style={{
                    color: selectedType === "income" ? "#FFF" : colors.text,
                    fontWeight: "600",
                  }}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <TextInput
              placeholder="Template name (e.g., Coffee)"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              maxLength={30}
            />

            {/* Amount */}
            <TextInput
              placeholder={`Amount (${currencySymbol})`}
              placeholderTextColor={colors.textLight}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />

            {/* Category Picker (expense only) */}
            {selectedType === "expense" && (
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                  Category
                </Text>
                <View style={styles.categoryRow}>
                  {categories.slice(0, 8).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor:
                            selectedCategoryId === cat.id
                              ? cat.color + "30"
                              : colors.background,
                          borderColor:
                            selectedCategoryId === cat.id
                              ? cat.color
                              : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Icon
                        name={cat.icon as any}
                        size={14}
                        color={cat.color}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color:
                            selectedCategoryId === cat.id
                              ? cat.color
                              : colors.text,
                        }}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Icon Picker */}
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor:
                        selectedIcon === icon
                          ? selectedColor + "20"
                          : colors.background,
                      borderColor:
                        selectedIcon === icon ? selectedColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons
                    name={icon as any}
                    size={20}
                    color={
                      selectedIcon === icon ? selectedColor : colors.textLight
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Picker */}
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              variant="primary"
              fullWidth
              onPress={handleAdd}
              style={{ marginTop: spacing.md }}
            >
              Create Template
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  templateMeta: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  templateAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  deleteBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 6,
    marginTop: spacing.xs,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.sm,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm,
  },
  iconOption: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
