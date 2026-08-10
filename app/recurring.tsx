import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { format } from "date-fns";
import { Card } from "../src/components/atoms/Card";
import EmptyState from "../src/components/atoms/EmptyState";
import { Icon } from "../src/components/atoms/Icon";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    deleteRecurring,
    toggleRecurringActive,
} from "../src/store/slices/recurringSlice";
import { spacing, typography } from "../src/theme/theme";
import { RecurringTransaction } from "../src/types";
import { formatCurrency } from "../src/utils/formatters";

export default function RecurringScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const router = useRouter();
  const transactions = useAppSelector((state) => state.recurring.transactions);
  const currency = useAppSelector((state) => state.settings.currency);

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Remove this recurring transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(deleteRecurring(id)),
      },
    ]);
  };

  const handleAdd = () => {
    router.push("/add-recurring");
  };

  const frequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return freq;
    }
  };

  const renderItem = ({ item }: { item: RecurringTransaction }) => {
    const isExpense = item.type === "expense";
    const iconName = item.category?.icon || item.source?.icon || "repeat";
    const iconColor =
      item.category?.color || item.source?.color || colors.primary;
    const label = item.category?.name || item.source?.name || "Unknown";
    const isPastDue = item.isActive && new Date(item.nextDueDate) < new Date();
    const cardOpacity = item.isActive ? 1 : 0.55;

    return (
      <Card style={[styles.card, { opacity: cardOpacity }]}>
        {isPastDue && (
          <View
            style={[
              styles.pastDueBanner,
              { backgroundColor: colors.error + "15" },
            ]}
          >
            <Ionicons name="alert-circle" size={14} color={colors.error} />
            <Text style={[styles.pastDueText, { color: colors.error }]}>
              Past due · was due {format(new Date(item.nextDueDate), "MMM d")}
            </Text>
          </View>
        )}
        {!item.isActive && (
          <View
            style={[
              styles.pausedBanner,
              { backgroundColor: colors.textLight + "20" },
            ]}
          >
            <Ionicons name="pause-circle" size={14} color={colors.textLight} />
            <Text style={[styles.pausedText, { color: colors.textLight }]}>
              Paused
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: iconColor + "15" }]}>
            <Icon name={iconName as any} size={22} color={iconColor} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Text
              style={[
                styles.meta,
                { color: isPastDue ? colors.error : colors.textLight },
              ]}
            >
              {frequencyLabel(item.frequency)} · Next:{" "}
              {format(new Date(item.nextDueDate), "MMM d, yyyy")}
            </Text>
            {item.note ? (
              <Text
                style={[styles.note, { color: colors.textLight }]}
                numberOfLines={1}
              >
                {item.note}
              </Text>
            ) : null}
          </View>
          <View style={styles.right}>
            <Text
              style={[
                styles.amount,
                { color: isExpense ? colors.error : colors.success },
              ]}
            >
              {isExpense ? "-" : "+"}
              {formatCurrency(item.amount, item.currency)}
            </Text>
            <View style={styles.actions}>
              <Switch
                value={item.isActive}
                onValueChange={() => {
                  dispatch(toggleRecurringActive(item.id));
                }}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={item.isActive ? colors.primary : colors.textLight}
              />
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
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
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="repeat-outline"
            title="No Recurring Transactions"
            subtitle="Set up recurring transactions for bills, subscriptions, or regular income to automate your tracking."
            actionLabel="Add Recurring"
            onAction={handleAdd}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerSubtext, { color: colors.textLight }]}>
              Manage your recurring bills, subscriptions, and regular income.
            </Text>
          </View>
        }
      />

      {/* Add FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  header: {
    marginBottom: spacing.md,
  },
  headerSubtext: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.sm,
  },
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
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  note: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  pastDueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  pastDueText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pausedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  pausedText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 40,
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
});
