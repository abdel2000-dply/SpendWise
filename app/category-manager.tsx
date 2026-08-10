import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
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
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    addCategory,
    deleteCategory,
    updateCategory,
} from "../src/store/slices/categorySlice";
import { spacing, typography } from "../src/theme/theme";
import { Category } from "../src/types";
import { generateId } from "../src/utils/generateId";
import { hapticSuccess, hapticWarning } from "../src/utils/haptics";

const ICON_OPTIONS = [
  "restaurant",
  "car",
  "cart",
  "film",
  "receipt",
  "medkit",
  "school",
  "airplane",
  "fitness",
  "refresh",
  "gift",
  "home",
  "paw",
  "musical-notes",
  "game-controller",
  "shirt",
  "brush",
  "construct",
  "cafe",
  "wine",
  "bicycle",
  "bus",
  "train",
  "boat",
  "pizza",
  "ice-cream",
  "beer",
  "briefcase",
  "laptop",
  "phone-portrait",
];

const COLOR_OPTIONS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#FF8B94",
  "#C7CEEA",
  "#B4A7D6",
  "#FFA07A",
  "#98D8C8",
  "#6BCF7F",
  "#FB8B24",
  "#95A5A6",
  "#6C63FF",
  "#FF6584",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#00BCD4",
  "#E91E63",
  "#4CAF50",
];

export default function CategoryManagerScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const categories = useAppSelector((state) => state.categories.categories);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("restaurant");
  const [selectedColor, setSelectedColor] = useState("#6C63FF");

  const openAdd = () => {
    setEditingCategory(null);
    setName("");
    setSelectedIcon("restaurant");
    setSelectedColor("#6C63FF");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setShowModal(true);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    if (editingCategory) {
      dispatch(
        updateCategory({
          ...editingCategory,
          name: trimmed,
          icon: selectedIcon,
          color: selectedColor,
        }),
      );
    } else {
      dispatch(
        addCategory({
          id: generateId(),
          name: trimmed,
          icon: selectedIcon,
          color: selectedColor,
          isDefault: false,
        }),
      );
    }
    hapticSuccess();
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) {
      Alert.alert("Cannot Delete", "Default categories cannot be deleted.");
      return;
    }
    hapticWarning();
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteCategory(cat.id)),
      },
    ]);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.categoryRow}
        onPress={() => openEdit(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
          <Icon name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.isDefault && (
            <Text style={[styles.defaultBadge, { color: colors.textLight }]}>
              Default
            </Text>
          )}
        </View>
        <View style={styles.categoryActions}>
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          {!item.isDefault && (
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Tap to edit, or add new custom categories.
          </Text>
        }
      />

      {/* Add FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAdd}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingCategory ? "Edit Category" : "New Category"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Name
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Category name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />

              {/* Icon Picker */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Icon
              </Text>
              <View style={styles.pickerGrid}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor:
                          selectedIcon === icon
                            ? selectedColor + "20"
                            : colors.card,
                        borderColor:
                          selectedIcon === icon ? selectedColor : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Icon
                      name={icon as any}
                      size={22}
                      color={
                        selectedIcon === icon ? selectedColor : colors.textLight
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color Picker */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Color
              </Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorItemSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Preview
              </Text>
              <View style={styles.previewRow}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: selectedColor + "15" },
                  ]}
                >
                  <Icon
                    name={selectedIcon as any}
                    size={28}
                    color={selectedColor}
                  />
                </View>
                <Text style={[styles.previewName, { color: colors.text }]}>
                  {name || "Category Name"}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                variant="outline"
                onPress={() => setShowModal(false)}
                style={styles.modalBtn}
              >
                Cancel
              </Button>
              <Button onPress={handleSave} style={styles.modalBtn}>
                {editingCategory ? "Update" : "Create"}
              </Button>
            </View>
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
    paddingBottom: 100,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  defaultBadge: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: "row",
    gap: spacing.md,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  fieldLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.fontSize.md,
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorItem: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  previewName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  modalFooter: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
});
