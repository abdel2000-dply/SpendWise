import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { format } from "date-fns";
import { Button } from "../src/components/atoms/Button";
import { Card } from "../src/components/atoms/Card";
import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { parseSMS, suggestCategory } from "../src/services/smsParser";
import { addExpense } from "../src/store/slices/expenseSlice";
import { addIncome } from "../src/store/slices/incomeSlice";
import { spacing, typography } from "../src/theme/theme";
import { ParsedSMSTransaction } from "../src/types";
import { formatCurrency } from "../src/utils/formatters";
import { generateId } from "../src/utils/generateId";
import { hapticSelection, hapticSuccess } from "../src/utils/haptics";

export default function SMSParserScreen() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const [smsInput, setSmsInput] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<
    ParsedSMSTransaction[]
  >([]);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const categoryMap: Record<string, string> = {};
  categories.forEach((c) => {
    categoryMap[c.name.toLowerCase()] = c.id;
  });

  const handleParse = () => {
    const trimmed = smsInput.trim();
    if (!trimmed) {
      Alert.alert("Empty", "Please paste an SMS message first.");
      return;
    }

    // Split by double newline or process as single message
    const messages = trimmed
      .split(/\n{2,}/)
      .map((m) => m.trim())
      .filter(Boolean);

    const results: ParsedSMSTransaction[] = [];
    for (const msg of messages) {
      const parsed = parseSMS(msg);
      if (parsed) {
        results.push(parsed);
      }
    }

    if (results.length === 0) {
      Alert.alert(
        "No Transactions Found",
        "Could not detect any transaction data in this message. Try pasting a bank notification SMS.",
      );
      return;
    }

    setParsedTransactions((prev) => [...results, ...prev]);
    setSmsInput("");
    hapticSelection();
  };

  const handlePasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setSmsInput(text);
    } else {
      Alert.alert("Empty Clipboard", "Nothing to paste from clipboard.");
    }
  };

  const handleApprove = (tx: ParsedSMSTransaction) => {
    const suggestedCatId = suggestCategory(tx.merchant, categoryMap);
    const category =
      categories.find((c) => c.id === suggestedCatId) ||
      categories.find(
        (c) => c.name.toLowerCase() === suggestedCatId?.toLowerCase(),
      ) ||
      categories[0];

    if (tx.type === "expense") {
      if (!category) {
        Alert.alert("Error", "No categories available.");
        return;
      }
      dispatch(
        addExpense({
          id: generateId(),
          amount: tx.amount,
          currency,
          category,
          date: tx.date,
          note: tx.merchant || "From SMS",
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    } else {
      dispatch(
        addIncome({
          id: generateId(),
          amount: tx.amount,
          currency,
          source: {
            id: "sms-import",
            name: tx.merchant || "SMS Import",
            icon: "mail",
            color: "#4ECDC4",
            isDefault: false,
          },
          date: tx.date,
          note: tx.merchant || "From SMS",
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    setApprovedIds((prev) => new Set(prev).add(tx.id));
    hapticSuccess();
  };

  const handleApproveAll = () => {
    const pending = parsedTransactions.filter((tx) => !approvedIds.has(tx.id));
    if (pending.length === 0) return;

    Alert.alert(
      "Approve All",
      `Add ${pending.length} transaction${pending.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve All",
          onPress: () => {
            pending.forEach((tx) => handleApprove(tx));
          },
        },
      ],
    );
  };

  const handleDismiss = (id: string) => {
    setParsedTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const renderTransaction = ({ item }: { item: ParsedSMSTransaction }) => {
    const isApproved = approvedIds.has(item.id);
    const suggestedCatId = suggestCategory(item.merchant, categoryMap);

    return (
      <Card style={[styles.txCard, isApproved && { opacity: 0.5 }]}>
        <View style={styles.txRow}>
          <View
            style={[
              styles.txIcon,
              {
                backgroundColor:
                  item.type === "expense"
                    ? colors.error + "15"
                    : colors.success + "15",
              },
            ]}
          >
            <Ionicons
              name={item.type === "expense" ? "arrow-down" : "arrow-up"}
              size={20}
              color={item.type === "expense" ? colors.error : colors.success}
            />
          </View>
          <View style={styles.txInfo}>
            <Text style={[styles.txMerchant, { color: colors.text }]}>
              {item.merchant || "Unknown"}
            </Text>
            <Text style={[styles.txDate, { color: colors.textLight }]}>
              {format(new Date(item.date), "MMM d, yyyy")}
              {suggestedCatId ? ` · ${suggestedCatId}` : ""}
            </Text>
          </View>
          <Text
            style={[
              styles.txAmount,
              {
                color: item.type === "expense" ? colors.error : colors.success,
              },
            ]}
          >
            {item.type === "expense" ? "-" : "+"}
            {formatCurrency(item.amount, currency)}
          </Text>
        </View>
        {!isApproved && (
          <View style={styles.txActions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: colors.success + "15" },
              ]}
              onPress={() => handleApprove(item)}
            >
              <Ionicons name="checkmark" size={16} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: colors.error + "15" },
              ]}
              onPress={() => handleDismiss(item.id)}
            >
              <Ionicons name="close" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {isApproved && (
          <View style={styles.approvedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
            />
            <Text style={[styles.approvedText, { color: colors.success }]}>
              Added
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const pendingCount = parsedTransactions.filter(
    (tx) => !approvedIds.has(tx.id),
  ).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <FlatList
        data={parsedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Info */}
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.infoText, { color: colors.textLight }]}>
                  Paste bank SMS notifications below. We'll extract the
                  transaction details automatically. Separate multiple messages
                  with blank lines.
                </Text>
              </View>
            </Card>

            {/* Input Area */}
            <TextInput
              placeholder="Paste bank SMS here..."
              placeholderTextColor={colors.textLight}
              value={smsInput}
              onChangeText={setSmsInput}
              multiline
              numberOfLines={4}
              style={[
                styles.smsInput,
                {
                  color: colors.text,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={[
                  styles.pasteBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={handlePasteFromClipboard}
              >
                <Ionicons name="clipboard" size={16} color={colors.primary} />
                <Text style={[styles.pasteBtnText, { color: colors.primary }]}>
                  Paste
                </Text>
              </TouchableOpacity>
              <Button
                variant="primary"
                onPress={handleParse}
                style={styles.parseBtn}
              >
                Parse SMS
              </Button>
            </View>

            {/* Results header */}
            {parsedTransactions.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  Parsed Transactions ({parsedTransactions.length})
                </Text>
                {pendingCount > 0 && (
                  <TouchableOpacity onPress={handleApproveAll}>
                    <Text
                      style={[styles.approveAll, { color: colors.primary }]}
                    >
                      Approve All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          parsedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="mail-outline"
                size={48}
                color={colors.textLight}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Parsed Messages
              </Text>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                Paste your bank SMS messages above and tap "Parse SMS" to
                extract transactions automatically.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  smsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: spacing.sm,
  },
  inputActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  pasteBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },
  parseBtn: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  resultsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  approveAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  txCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txMerchant: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  txDate: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  txAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  txActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },
  approvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  approvedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
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
});
