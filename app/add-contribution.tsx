import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { addContribution } from "../src/store/slices/savingsSlice";
import { spacing, typography } from "../src/theme/theme";
import { SavingsContribution } from "../src/types";
import { formatCurrency, formatPercentage } from "../src/utils/formatters";
import { generateId } from "../src/utils/generateId";
import { hapticSuccess } from "../src/utils/haptics";

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function AddContributionModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const goal = useAppSelector((state) =>
    state.savings.goals.find((g) => g.id === goalId),
  );
  const currency = useAppSelector((state) => state.settings.currency);
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Goal not found
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.goBackText, { color: colors.primary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const remaining = goal.targetAmount - goal.currentAmount;
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const contribution: SavingsContribution = {
      id: generateId(),
      amount: parsedAmount,
      date: new Date(),
      note: note.trim() || undefined,
    };

    dispatch(addContribution({ goalId: goal.id, contribution }));
    hapticSuccess();

    // Check if goal is now reached
    const newTotal = goal.currentAmount + parsedAmount;
    if (newTotal >= goal.targetAmount) {
      setShowConfetti(true);
      confettiRef.current?.start();
      Alert.alert(
        "🎉 Goal Reached!",
        `Congratulations! You've reached your "${goal.name}" savings goal!`,
        [{ text: "Awesome!", onPress: () => router.back() }],
      );
    } else {
      router.back();
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const newProgress = Math.min(
    100,
    ((goal.currentAmount + (parseFloat(amount) || 0)) / goal.targetAmount) *
      100,
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 32, spacing.xxl * 2) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Info */}
        <View
          style={[
            styles.goalCard,
            {
              backgroundColor: goal.color + "10",
              borderColor: goal.color + "30",
            },
          ]}
        >
          <View style={styles.goalHeader}>
            <View
              style={[styles.goalIcon, { backgroundColor: goal.color + "20" }]}
            >
              <Ionicons name={goal.icon as any} size={24} color={goal.color} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalName, { color: colors.text }]}>
                {goal.name}
              </Text>
              <Text style={[styles.goalProgress, { color: colors.textLight }]}>
                {formatCurrency(goal.currentAmount, currency)} of{" "}
                {formatCurrency(goal.targetAmount, currency)}
              </Text>
            </View>
          </View>
          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: goal.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.remainingText, { color: colors.textLight }]}>
            {formatCurrency(remaining, currency)} remaining ·{" "}
            {formatPercentage(progressPercentage)} complete
          </Text>
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
            {currencySymbol}
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

        {/* Quick Amounts */}
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((qa) => (
            <TouchableOpacity
              key={qa}
              style={[
                styles.quickButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => handleQuickAmount(qa)}
            >
              <Text style={[styles.quickText, { color: colors.text }]}>
                {currencySymbol}
                {qa}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fill remaining button */}
        {remaining > 0 && (
          <TouchableOpacity
            style={[
              styles.fillButton,
              {
                backgroundColor: goal.color + "15",
                borderColor: goal.color + "30",
              },
            ]}
            onPress={() => setAmount(remaining.toFixed(2))}
          >
            <Ionicons name="flash" size={16} color={goal.color} />
            <Text style={[styles.fillText, { color: goal.color }]}>
              Fill remaining ({formatCurrency(remaining, currency)})
            </Text>
          </TouchableOpacity>
        )}

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
            placeholder="What's this contribution for?"
            placeholderTextColor={colors.textLight}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Preview */}
        {parseFloat(amount) > 0 && (
          <View style={[styles.previewBar, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewLabel, { color: colors.textLight }]}>
              After this contribution:
            </Text>
            <View
              style={[
                styles.previewProgress,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.previewFill,
                  { width: `${newProgress}%`, backgroundColor: goal.color },
                ]}
              />
            </View>
            <Text style={[styles.previewPercent, { color: goal.color }]}>
              {formatPercentage(newProgress)}
            </Text>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: goal.color }]}
          onPress={handleSave}
        >
          <Ionicons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.saveText}>Add Contribution</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: -10, y: 0 }}
          autoStart
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}
    </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  goBackText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  goalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  goalProgress: {
    fontSize: typography.fontSize.sm,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  remainingText: {
    fontSize: typography.fontSize.xs,
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
  noteInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  fillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  fillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  previewBar: {
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  previewLabel: {
    fontSize: typography.fontSize.xs,
  },
  previewProgress: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  previewFill: {
    height: "100%",
    borderRadius: 4,
  },
  previewPercent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textAlign: "right",
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
