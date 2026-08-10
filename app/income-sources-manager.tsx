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
    addIncomeSource,
    deleteIncomeSource,
    updateIncomeSource,
} from "../src/store/slices/incomeSourcesSlice";
import { spacing, typography } from "../src/theme/theme";
import { IncomeSource } from "../src/types";
import { generateId } from "../src/utils/generateId";
import { hapticSuccess, hapticWarning } from "../src/utils/haptics";

const ICON_OPTIONS = [
  "briefcase",
  "laptop",
  "trending-up",
  "gift",
  "arrow-undo",
  "flash",
  "home",
  "car",
  "cash",
  "card",
  "business",
  "school",
  "medical",
  "restaurant",
  "musical-notes",
  "camera",
  "construct",
  "storefront",
  "cart",
  "barbell",
  "brush",
  "calculator",
  "people",
  "newspaper",
  "leaf",
  "planet",
  "trophy",
  "star",
  "heart",
  "rocket",
];

const COLOR_OPTIONS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#FF9800",
  "#FFC107",
  "#795548",
  "#607D8B",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#C7CEEA",
  "#B4A7D6",
  "#FFA07A",
  "#98D8C8",
  "#6BCF7F",
  "#FB8B24",
  "#95A5A6",
  "#6C63FF",
  "#FF6584",
  "#00BCD4",
  "#F44336",
  "#3F51B5",
];

export default function IncomeSourcesManagerScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const sources = useAppSelector((state) => state.incomeSources.sources);

  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("cash");
  const [selectedColor, setSelectedColor] = useState("#6C63FF");

  const openAdd = () => {
    setEditingSource(null);
    setName("");
    setSelectedIcon("cash");
    setSelectedColor("#6C63FF");
    setShowModal(true);
  };

  const openEdit = (source: IncomeSource) => {
    setEditingSource(source);
    setName(source.name);
    setSelectedIcon(source.icon);
    setSelectedColor(source.color);
    setShowModal(true);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a source name.");
      return;
    }

    if (editingSource) {
      dispatch(
        updateIncomeSource({
          ...editingSource,
          name: trimmed,
          icon: selectedIcon,
          color: selectedColor,
        }),
      );
    } else {
      dispatch(
        addIncomeSource({
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

  const handleDelete = (source: IncomeSource) => {
    if (source.isDefault) {
      Alert.alert("Cannot Delete", "Default income sources cannot be deleted.");
      return;
    }
    hapticWarning();
    Alert.alert("Delete Source", `Delete "${source.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteIncomeSource(source.id)),
      },
    ]);
  };

  const renderSource = ({ item }: { item: IncomeSource }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
          <Icon name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.sourceName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.isDefault && (
            <Text style={[styles.defaultBadge, { color: colors.textLight }]}>
              Default
            </Text>
          )}
        </View>
        <View style={styles.actions}>
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
        data={sources}
        keyExtractor={(item) => item.id}
        renderItem={renderSource}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Tap to edit, or add new custom income sources.
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
                {editingSource ? "Edit Source" : "New Income Source"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                placeholder="Source name"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />

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
                  {name || "Source Name"}
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
                {editingSource ? "Update" : "Create"}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 100 },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  card: { marginBottom: spacing.sm },
  row: {
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
  info: { flex: 1 },
  sourceName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  defaultBadge: { fontSize: typography.fontSize.xs, marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing.md },
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
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: spacing.md,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  previewIcon: {
    width: 52,
    height: 52,
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
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalBtn: { flex: 1 },
});
