import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    LayoutAnimation,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { shallowEqual } from "react-redux";
import { Card } from "../../src/components/atoms/Card";
import EmptyState from "../../src/components/atoms/EmptyState";
import { Icon } from "../../src/components/atoms/Icon";
import { useAppDispatch, useAppSelector } from "../../src/hooks/useRedux";
import { useSwipeTabs } from "../../src/hooks/useSwipeTabs";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { addExpense, deleteExpense } from "../../src/store/slices/expenseSlice";
import { addIncome, deleteIncome } from "../../src/store/slices/incomeSlice";
import { spacing, typography } from "../../src/theme/theme";
import { Expense, Income } from "../../src/types";
import {
    formatCurrency,
    formatDate,
    formatTime,
} from "../../src/utils/formatters";
import { hapticWarning } from "../../src/utils/haptics";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FilterType = "all" | "expenses" | "income";

interface MergedTransaction {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  note?: string;
  txType: "expense" | "income";
  label: string;
  icon: string;
  color: string;
  receiptPhoto?: string;
  original: Expense | Income;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { expenses, incomes, categories, currency } = useAppSelector(
    (state) => ({
      expenses: state.expenses.expenses,
      incomes: state.incomes.incomes,
      categories: state.categories.categories,
      currency: state.settings.currency,
    }),
    shallowEqual,
  );
  const colors = useThemeColors();
  const swipeHandlers = useSwipeTabs();

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    tx: MergedTransaction | null;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ visible: false, tx: null, timer: null });
  const snackbarAnim = useRef(new Animated.Value(0)).current;

  const transactions: MergedTransaction[] = useMemo(() => {
    const merged: MergedTransaction[] = [];

    if (filter !== "income") {
      expenses.forEach((e) => {
        merged.push({
          id: e.id,
          amount: e.amount,
          currency: e.currency,
          date: e.date,
          note: e.note,
          txType: "expense",
          label: e.category.name,
          icon: e.category.icon,
          color: e.category.color,
          receiptPhoto: e.receiptPhoto,
          original: e,
        });
      });
    }

    if (filter !== "expenses") {
      incomes.forEach((i) => {
        merged.push({
          id: i.id,
          amount: i.amount,
          currency: i.currency,
          date: i.date,
          note: i.note,
          txType: "income",
          label: i.source.name,
          icon: i.source.icon,
          color: i.source.color,
          original: i,
        });
      });
    }

    // Search
    let filtered = searchQuery
      ? merged.filter(
          (tx) =>
            tx.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.note &&
              tx.note.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      : merged;

    // Amount range filter
    const min = parseFloat(amountMin);
    const max = parseFloat(amountMax);
    if (!isNaN(min)) {
      filtered = filtered.filter((tx) => tx.amount >= min);
    }
    if (!isNaN(max)) {
      filtered = filtered.filter((tx) => tx.amount <= max);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((tx) => {
        if (tx.txType === "expense") {
          const exp = tx.original as Expense;
          return selectedCategories.includes(exp.category.id);
        }
        return true; // Don't filter income by category
      });
    }

    // Sort
    switch (sortOrder) {
      case "oldest":
        return filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      case "highest":
        return filtered.sort((a, b) => b.amount - a.amount);
      case "lowest":
        return filtered.sort((a, b) => a.amount - b.amount);
      default:
        return filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    }
  }, [
    expenses,
    incomes,
    filter,
    searchQuery,
    amountMin,
    amountMax,
    selectedCategories,
    sortOrder,
  ]);

  // Group by date
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (amountMin) count++;
    if (amountMax) count++;
    if (selectedCategories.length > 0) count++;
    if (sortOrder !== "newest") count++;
    return count;
  }, [amountMin, amountMax, selectedCategories, sortOrder]);

  const groupedData = useMemo(() => {
    const groups: { date: string; data: MergedTransaction[] }[] = [];
    const map = new Map<string, MergedTransaction[]>();

    transactions.forEach((tx) => {
      const key = new Date(tx.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });

    map.forEach((data, date) => {
      groups.push({ date, data });
    });

    return groups;
  }, [transactions]);

  const handleDelete = (tx: MergedTransaction) => {
    hapticWarning();

    // Delete immediately
    if (tx.txType === "expense") {
      dispatch(deleteExpense(tx.id));
    } else {
      dispatch(deleteIncome(tx.id));
    }

    // Clear any existing snackbar timer
    if (snackbar.timer) clearTimeout(snackbar.timer);

    // Show undo snackbar
    setSnackbar((prev) => ({ ...prev, visible: true, tx }));
    Animated.spring(snackbarAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(snackbarAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSnackbar({ visible: false, tx: null, timer: null });
      });
    }, 5000);

    setSnackbar((prev) => ({ ...prev, timer }));
  };

  const handleUndo = () => {
    if (!snackbar.tx) return;
    if (snackbar.timer) clearTimeout(snackbar.timer);

    const tx = snackbar.tx;
    if (tx.txType === "expense") {
      dispatch(addExpense(tx.original as Expense));
    } else {
      dispatch(addIncome(tx.original as Income));
    }

    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSnackbar({ visible: false, tx: null, timer: null });
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh — in a real app this would sync with server
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleEdit = (tx: MergedTransaction) => {
    if (tx.txType === "expense") {
      router.push(`/modal?expenseId=${tx.id}`);
    } else {
      router.push(`/modal?incomeId=${tx.id}`);
    }
  };

  const renderFilterButton = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && { backgroundColor: colors.primary },
        filter !== type && {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === type ? "#FFF" : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRightActions = (
    tx: MergedTransaction,
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeBtn, styles.swipeEdit]}
          onPress={() => handleEdit(tx)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeBtn, styles.swipeDelete]}
          onPress={() => handleDelete(tx)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash" size={20} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransaction = (tx: MergedTransaction) => {
    const isIncome = tx.txType === "income";

    return (
      <Swipeable
        key={tx.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(tx, progress, dragX)
        }
        overshootRight={false}
        friction={2}
      >
        <Card style={styles.txCard}>
          <TouchableOpacity
            style={styles.txContainer}
            onPress={() => handleEdit(tx)}
            activeOpacity={0.7}
          >
            <View style={[styles.txIcon, { backgroundColor: tx.color + "15" }]}>
              <Icon name={tx.icon as any} size={22} color={tx.color} />
            </View>
            <View style={styles.txInfo}>
              <Text
                style={[styles.txLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {tx.label}
              </Text>
              <Text
                style={[styles.txNote, { color: colors.textLight }]}
                numberOfLines={1}
              >
                {formatTime(new Date(tx.date))}
                {tx.note ? ` · ${tx.note}` : ""}
              </Text>
            </View>
            <View style={styles.txRight}>
              {tx.receiptPhoto && (
                <Ionicons
                  name="camera"
                  size={13}
                  color={colors.textLight}
                  style={{ marginBottom: 2 }}
                />
              )}
              <Text
                style={[
                  styles.txAmount,
                  { color: isIncome ? colors.success : colors.error },
                ]}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount, tx.currency)}
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
      {...swipeHandlers}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterToggle,
            {
              backgroundColor:
                showFilters || activeFilterCount > 0
                  ? colors.primary
                  : colors.card,
              borderColor: colors.border,
              borderWidth: showFilters || activeFilterCount > 0 ? 0 : 1,
            },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons
            name="options"
            size={18}
            color={
              showFilters || activeFilterCount > 0 ? "#FFF" : colors.textLight
            }
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <View
          style={[
            styles.filtersPanel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Sort Order */}
          <View style={styles.filterSection}>
            <Text
              style={[styles.filterSectionTitle, { color: colors.textLight }]}
            >
              Sort by
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {[
                  { value: "newest" as const, label: "Newest" },
                  { value: "oldest" as const, label: "Oldest" },
                  { value: "highest" as const, label: "Highest" },
                  { value: "lowest" as const, label: "Lowest" },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.chip,
                      sortOrder === opt.value
                        ? { backgroundColor: colors.primary }
                        : {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            borderWidth: 1,
                          },
                    ]}
                    onPress={() => setSortOrder(opt.value)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: sortOrder === opt.value ? "#FFF" : colors.text,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Amount Range */}
          <View style={styles.filterSection}>
            <Text
              style={[styles.filterSectionTitle, { color: colors.textLight }]}
            >
              Amount range
            </Text>
            <View style={styles.amountRow}>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={amountMin}
                onChangeText={setAmountMin}
              />
              <Text style={{ color: colors.textLight }}>—</Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={amountMax}
                onChangeText={setAmountMax}
              />
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text
              style={[styles.filterSectionTitle, { color: colors.textLight }]}
            >
              Categories
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        isSelected
                          ? { backgroundColor: cat.color }
                          : {
                              backgroundColor: colors.background,
                              borderColor: colors.border,
                              borderWidth: 1,
                            },
                      ]}
                      onPress={() => {
                        setSelectedCategories((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        );
                      }}
                    >
                      <Icon
                        name={cat.icon as any}
                        size={14}
                        color={isSelected ? "#FFF" : cat.color}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: isSelected ? "#FFF" : colors.text,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => {
                setAmountMin("");
                setAmountMax("");
                setSelectedCategories([]);
                setSortOrder("newest");
              }}
            >
              <Ionicons name="close-circle" size={16} color={colors.error} />
              <Text
                style={{ color: colors.error, fontSize: 13, fontWeight: "600" }}
              >
                Clear all filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("expenses", "Expenses")}
        {renderFilterButton("income", "Income")}
      </View>

      {/* Summary Bar */}
      {transactions.length > 0 && (
        <View
          style={[
            styles.summaryBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
              Income
            </Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              +
              {formatCurrency(
                transactions
                  .filter((t) => t.txType === "income")
                  .reduce((s, t) => s + t.amount, 0),
                currency,
              )}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              -
              {formatCurrency(
                transactions
                  .filter((t) => t.txType === "expense")
                  .reduce((s, t) => s + t.amount, 0),
                currency,
              )}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
              Count
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {transactions.length} txn{transactions.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Transaction List */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <Text style={[styles.dateHeader, { color: colors.textLight }]}>
              {formatDate(new Date(item.date))}
            </Text>
            {item.data.map(renderTransaction)}
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery ? "search-outline" : "receipt-outline"}
            title={searchQuery ? "No Results" : "No Transactions Yet"}
            subtitle={
              searchQuery
                ? "Try a different search term or adjust your filters"
                : "Start tracking your money by adding your first transaction"
            }
            actionLabel={searchQuery ? undefined : "Add Transaction"}
            onAction={searchQuery ? undefined : () => router.push("/modal")}
          />
        }
      />

      {/* Undo Snackbar */}
      {snackbar.visible && (
        <Animated.View
          style={[
            styles.snackbar,
            {
              backgroundColor: colors.text,
              transform: [
                {
                  translateY: snackbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0],
                  }),
                },
              ],
              opacity: snackbarAnim,
            },
          ]}
        >
          <Text style={[styles.snackbarText, { color: colors.background }]}>
            Transaction deleted
          </Text>
          <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
            <Text style={[styles.undoText, { color: colors.primary }]}>
              UNDO
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    paddingVertical: 0,
  },
  filterToggle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3D71",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  filtersPanel: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterSection: {
    gap: 6,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  clearFilters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(128,128,128,0.2)",
    marginVertical: 2,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  txCard: {
    marginBottom: spacing.sm,
  },
  txContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  txNote: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  swipeBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: "100%",
  },
  swipeEdit: {
    backgroundColor: "#2196F3",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  swipeDelete: {
    backgroundColor: "#FF3D71",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  snackbar: {
    position: "absolute",
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  snackbarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  undoButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  undoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
