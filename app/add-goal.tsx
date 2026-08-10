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

import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addGoal } from "../src/store/slices/savingsSlice";
import { spacing, typography } from "../src/theme/theme";
import { SavingsGoal } from "../src/types";
import { generateId } from "../src/utils/generateId";

const GOAL_ICONS = [
  "home",
  "car",
  "airplane",
  "laptop",
  "gift",
  "school",
  "medkit",
  "briefcase",
  "diamond",
  "trophy",
  "musical-notes",
  "camera",
];

const GOAL_COLORS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#FF9800",
  "#00BCD4",
  "#795548",
  "#607D8B",
  "#F44336",
  "#3F51B5",
  "#009688",
  "#FFC107",
];

export default function AddGoalModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.settings.currency);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("flag");
  const [selectedColor, setSelectedColor] = useState("#4CAF50");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineMonths, setDeadlineMonths] = useState("6");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }
    const parsedAmount = parseFloat(targetAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }

    const deadline = hasDeadline
      ? new Date(
          Date.now() + parseInt(deadlineMonths) * 30 * 24 * 60 * 60 * 1000,
        )
      : undefined;

    const goal: SavingsGoal = {
      id: generateId(),
      name: name.trim(),
      targetAmount: parsedAmount,
      currentAmount: 0,
      deadline,
      icon: selectedIcon,
      color: selectedColor,
      createdAt: new Date(),
      contributions: [],
    };

    dispatch(addGoal(goal));
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom + 32, spacing.xxl * 2) },
      ]}
    >
      {/* Name */}
      <Text style={[styles.label, { color: colors.text }]}>Goal Name</Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          placeholder="e.g., New Laptop, Vacation, Emergency Fund"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Target Amount */}
      <Text style={[styles.label, { color: colors.text }]}>Target Amount</Text>
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
          value={targetAmount}
          onChangeText={setTargetAmount}
        />
      </View>

      {/* Icon Selection */}
      <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
      <View style={styles.iconGrid}>
        {GOAL_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconItem,
              {
                backgroundColor:
                  selectedIcon === icon ? selectedColor + "20" : colors.card,
                borderColor:
                  selectedIcon === icon ? selectedColor : colors.border,
                borderWidth: selectedIcon === icon ? 2 : 1,
              },
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons
              name={icon as any}
              size={24}
              color={selectedIcon === icon ? selectedColor : colors.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Selection */}
      <Text style={[styles.label, { color: colors.text }]}>Color</Text>
      <View style={styles.colorGrid}>
        {GOAL_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorItem,
              { backgroundColor: color },
              selectedColor === color && styles.colorSelected,
            ]}
            onPress={() => setSelectedColor(color)}
          >
            {selectedColor === color && (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Deadline */}
      <View style={styles.deadlineToggle}>
        <Text
          style={[
            styles.label,
            { color: colors.text, marginTop: 0, marginBottom: 0 },
          ]}
        >
          Set Deadline
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: hasDeadline ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setHasDeadline(!hasDeadline)}
        >
          <View
            style={[
              styles.toggleKnob,
              { backgroundColor: "#FFF" },
              hasDeadline && styles.toggleKnobActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {hasDeadline && (
        <View style={styles.deadlineOptions}>
          {["3", "6", "12", "24"].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.deadlineButton,
                deadlineMonths === m && { backgroundColor: colors.primary },
                deadlineMonths !== m && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setDeadlineMonths(m)}
            >
              <Text
                style={[
                  styles.deadlineText,
                  { color: deadlineMonths === m ? "#FFF" : colors.text },
                ]}
              >
                {m} months
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Preview */}
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: selectedColor + "10",
            borderColor: selectedColor + "30",
          },
        ]}
      >
        <View
          style={[
            styles.previewIcon,
            { backgroundColor: selectedColor + "20" },
          ]}
        >
          <Ionicons
            name={selectedIcon as any}
            size={28}
            color={selectedColor}
          />
        </View>
        <Text style={[styles.previewName, { color: colors.text }]}>
          {name || "Your Goal"}
        </Text>
        <Text style={[styles.previewTarget, { color: colors.textLight }]}>
          Target: {currencySymbol}
          {targetAmount || "0.00"}
          {hasDeadline ? ` · ${deadlineMonths} months` : ""}
        </Text>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: selectedColor }]}
        onPress={handleSave}
      >
        <Ionicons name="flag" size={22} color="#FFF" />
        <Text style={styles.saveText}>Create Goal</Text>
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
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deadlineToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  deadlineOptions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  deadlineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: "center",
  },
  deadlineText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  previewName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  previewTarget: {
    fontSize: typography.fontSize.sm,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 14,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  saveText: {
    color: "#FFF",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
