import { Ionicons } from "@expo/vector-icons";
import { addDays, addWeeks, isWithinInterval } from "date-fns";
import React, { useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../src/components/atoms/Card";
import EmptyState from "../src/components/atoms/EmptyState";
import { Icon } from "../src/components/atoms/Icon";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    addChallenge,
    completeChallenge,
    removeChallenge,
} from "../src/store/slices/challengeSlice";
import { spacing, typography } from "../src/theme/theme";
import { SpendingChallenge } from "../src/types";
import { formatCurrency } from "../src/utils/formatters";
import { generateId } from "../src/utils/generateId";
import { hapticSuccess, hapticWarning } from "../src/utils/haptics";

const PRESET_CHALLENGES = [
  {
    title: "No-Spend Day",
    description: "Don't spend any money for a full day",
    type: "no-spend" as const,
    duration: 1,
    icon: "ban",
    color: "#E74C3C",
  },
  {
    title: "No-Spend Weekend",
    description: "Zero spending this weekend (Sat-Sun)",
    type: "no-spend" as const,
    duration: 2,
    icon: "today",
    color: "#9B59B6",
  },
  {
    title: "Under Budget Week",
    description: "Spend less than your weekly average",
    type: "limit" as const,
    duration: 7,
    icon: "trending-down",
    color: "#3498DB",
  },
  {
    title: "Coffee-Free Week",
    description: "Skip the cafe for a whole week",
    type: "no-spend" as const,
    duration: 7,
    icon: "cafe",
    color: "#F39C12",
  },
  {
    title: "Pack Lunch Week",
    description: "No dining out for 7 days",
    type: "no-spend" as const,
    duration: 7,
    icon: "restaurant",
    color: "#2ECC71",
  },
  {
    title: "50% Groceries",
    description: "Cut your grocery spending in half this week",
    type: "limit" as const,
    duration: 7,
    icon: "cart",
    color: "#1ABC9C",
  },
  {
    title: "Save Daily",
    description: "Put aside money every day for a week",
    type: "save" as const,
    duration: 7,
    icon: "wallet",
    color: "#E67E22",
  },
  {
    title: "30-Day Challenge",
    description: "Reduce total spending by 20% this month",
    type: "limit" as const,
    duration: 30,
    icon: "trophy",
    color: "#FFD700",
  },
];

export default function ChallengesScreen() {
  const dispatch = useAppDispatch();
  const challenges = useAppSelector((state) => state.challenges.challenges);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const [showPresets, setShowPresets] = useState(false);

  const now = new Date();

  const activeChallenges = useMemo(
    () => challenges.filter((c) => c.isActive && !c.isCompleted),
    [challenges],
  );

  const completedChallenges = useMemo(
    () => challenges.filter((c) => c.isCompleted),
    [challenges],
  );

  const getChallengeProgress = (challenge: SpendingChallenge) => {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    const totalDays = Math.max(
      1,
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const elapsed = Math.max(
      0,
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const timeProgress = Math.min(1, elapsed / totalDays);

    // Check spending during challenge period
    const challengeExpenses = expenses.filter((e) => {
      const eDate = new Date(e.date);
      return isWithinInterval(eDate, { start, end });
    });

    const totalSpent = challengeExpenses.reduce((s, e) => s + e.amount, 0);
    const isExpired = now > end;

    if (challenge.type === "no-spend") {
      return {
        timeProgress,
        spent: totalSpent,
        success: totalSpent === 0,
        isExpired,
        label:
          totalSpent === 0
            ? "No spending!"
            : `Spent ${formatCurrency(totalSpent, currency)}`,
      };
    }

    if (challenge.type === "limit" && challenge.targetAmount) {
      const pct =
        challenge.targetAmount > 0 ? totalSpent / challenge.targetAmount : 0;
      return {
        timeProgress,
        spent: totalSpent,
        success: totalSpent <= challenge.targetAmount,
        isExpired,
        label: `${formatCurrency(totalSpent, currency)} / ${formatCurrency(challenge.targetAmount, currency)}`,
        spendProgress: Math.min(1, pct),
      };
    }

    return {
      timeProgress,
      spent: totalSpent,
      success: true,
      isExpired,
      label: `${Math.round(timeProgress * 100)}% complete`,
    };
  };

  const handleStartChallenge = (preset: (typeof PRESET_CHALLENGES)[0]) => {
    const start = new Date();
    const end =
      preset.duration === 1
        ? addDays(start, 1)
        : preset.duration <= 7
          ? addWeeks(start, 1)
          : addDays(start, preset.duration);

    const challenge: SpendingChallenge = {
      id: generateId(),
      title: preset.title,
      description: preset.description,
      type: preset.type,
      startDate: start,
      endDate: end,
      isActive: true,
      isCompleted: false,
      icon: preset.icon,
      color: preset.color,
    };

    dispatch(addChallenge(challenge));
    hapticSuccess();
    setShowPresets(false);
  };

  const handleComplete = (id: string) => {
    dispatch(completeChallenge(id));
    hapticSuccess();
  };

  const handleRemove = (id: string) => {
    hapticWarning();
    Alert.alert("Remove Challenge", "Remove this challenge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => dispatch(removeChallenge(id)),
      },
    ]);
  };

  const renderChallenge = ({ item }: { item: SpendingChallenge }) => {
    const progress = getChallengeProgress(item);
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (new Date(item.endDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    return (
      <Card style={styles.challengeCard}>
        <View style={styles.challengeRow}>
          <View
            style={[styles.iconBox, { backgroundColor: item.color + "15" }]}
          >
            <Icon name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.challengeDesc, { color: colors.textLight }]}>
              {item.description}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item.id)}>
            <Ionicons name="close" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress.timeProgress * 100}%`,
                  backgroundColor: progress.success
                    ? colors.success
                    : colors.error,
                },
              ]}
            />
          </View>
          <View style={styles.progressMeta}>
            <Text
              style={[
                styles.progressLabel,
                {
                  color: progress.success ? colors.success : colors.error,
                },
              ]}
            >
              {progress.label}
            </Text>
            <Text style={[styles.daysLeft, { color: colors.textLight }]}>
              {progress.isExpired ? "Ended" : `${daysLeft}d left`}
            </Text>
          </View>
        </View>

        {/* Auto-complete expired challenges */}
        {progress.isExpired && !item.isCompleted && (
          <TouchableOpacity
            style={[
              styles.completeBtn,
              {
                backgroundColor: progress.success
                  ? colors.success + "15"
                  : colors.error + "15",
                opacity: progress.success ? 1 : 0.6,
              },
            ]}
            onPress={() => {
              if (!progress.success) return; // can't mark a failed challenge complete
              handleComplete(item.id);
            }}
            activeOpacity={progress.success ? 0.7 : 1}
          >
            <Ionicons
              name={progress.success ? "trophy" : "close-circle"}
              size={16}
              color={progress.success ? colors.success : colors.error}
            />
            <Text
              style={{
                color: progress.success ? colors.success : colors.error,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {progress.success ? "Mark Complete!" : "Challenge Failed"}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={[...activeChallenges, ...completedChallenges]}
        keyExtractor={(item) => item.id}
        renderItem={renderChallenge}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Challenge yourself to build better spending habits
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="trophy-outline"
            title="No Active Challenges"
            subtitle="Start a spending challenge to build better financial habits and save more money!"
            actionLabel="Start Challenge"
            onAction={() => setShowPresets(true)}
          />
        }
      />

      {/* Start Challenge FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowPresets(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Preset Challenges Modal */}
      <Modal visible={showPresets} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Start a Challenge
              </Text>
              <TouchableOpacity onPress={() => setShowPresets(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PRESET_CHALLENGES.map((preset, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.presetCard,
                    {
                      backgroundColor: preset.color + "10",
                      borderColor: preset.color + "30",
                    },
                  ]}
                  onPress={() => handleStartChallenge(preset)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.presetIcon,
                      { backgroundColor: preset.color + "20" },
                    ]}
                  >
                    <Icon
                      name={preset.icon as any}
                      size={24}
                      color={preset.color}
                    />
                  </View>
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetTitle, { color: colors.text }]}>
                      {preset.title}
                    </Text>
                    <Text
                      style={[styles.presetDesc, { color: colors.textLight }]}
                    >
                      {preset.description}
                    </Text>
                    <Text
                      style={[styles.presetDuration, { color: preset.color }]}
                    >
                      {preset.duration} day{preset.duration > 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={28} color={preset.color} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  challengeCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  challengeDesc: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  daysLeft: {
    fontSize: typography.fontSize.xs,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
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
    maxHeight: "75%",
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
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  presetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  presetInfo: {
    flex: 1,
  },
  presetTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  presetDesc: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  presetDuration: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 4,
  },
});
