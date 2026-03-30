import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { addBudget, deleteBudget } from '../../src/store/slices/budgetSlice';
import { addContribution, addGoal, deleteGoal } from '../../src/store/slices/savingsSlice';
import { spacing, typography } from '../../src/theme/theme';
import { Budget, SavingsGoal } from '../../src/types';
import { getBudgetSpent, getBudgetUsagePercent } from '../../src/utils/calculations';
import { formatCurrency } from '../../src/utils/formatters';

// ─── helpers ─────────────────────────────────────────────────────────────────
const GOAL_ICONS = ['🏠', '🚗', '✈️', '🎓', '💍', '💻', '📱', '🏖️', '🏋️', '🎯'];
const GOAL_COLORS = ['#6C63FF', '#FF6584', '#00D68F', '#FFAB00', '#4ECDC4', '#FF8B94'];
const PERIOD_OPTIONS: Budget['period'][] = ['daily', 'weekly', 'monthly', 'yearly'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function BudgetScreen() {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const categories = useAppSelector((state) => state.categories.categories);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const goals = useAppSelector((state) => state.savings.goals);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const [tab, setTab] = useState<'budgets' | 'savings'>('budgets');

  // ── Budget form state ────────────────────────────────────────────────────
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<Budget['period']>('monthly');
  const [budgetCategoryId, setBudgetCategoryId] = useState<string | undefined>(undefined);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState('80');

  // ── Savings form state ───────────────────────────────────────────────────
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [goalColor, setGoalColor] = useState(GOAL_COLORS[0]);

  // ── Contribution modal ───────────────────────────────────────────────────
  const [showContribModal, setShowContribModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddBudget = () => {
    const amount = parseFloat(budgetAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }
    const budget: Budget = {
      id: Date.now().toString(),
      amount,
      period: budgetPeriod,
      categoryId: budgetCategoryId,
      startDate: new Date(),
      alertThreshold: parseFloat(budgetAlertThreshold) || 80,
    };
    dispatch(addBudget(budget));
    resetBudgetForm();
    setShowBudgetModal(false);
  };

  const resetBudgetForm = () => {
    setBudgetAmount('');
    setBudgetPeriod('monthly');
    setBudgetCategoryId(undefined);
    setBudgetAlertThreshold('80');
  };

  const handleDeleteBudget = (id: string) => {
    Alert.alert('Delete Budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteBudget(id)) },
    ]);
  };

  const handleAddGoal = () => {
    const target = parseFloat(goalTarget);
    const current = parseFloat(goalCurrent) || 0;
    if (!goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (!target || target <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: Math.min(current, target),
      currency,
      icon: goalIcon,
      color: goalColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch(addGoal(goal));
    resetGoalForm();
    setShowGoalModal(false);
  };

  const resetGoalForm = () => {
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalIcon('🎯');
    setGoalColor(GOAL_COLORS[0]);
  };

  const handleDeleteGoal = (id: string) => {
    Alert.alert('Delete Goal', 'Remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteGoal(id)) },
    ]);
  };

  const handleContribute = () => {
    const amount = parseFloat(contribAmount);
    if (!selectedGoalId || !amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    dispatch(addContribution({ goalId: selectedGoalId, amount }));
    setContribAmount('');
    setShowContribModal(false);
    setSelectedGoalId(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Budget & Savings</Text>
      </View>

      {/* ── Segment Tabs ────────────────────────────────────── */}
      <View style={[styles.segmentWrapper, { backgroundColor: colors.card }]}>
        {(['budgets', 'savings'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.segmentTab,
              tab === t && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.segmentText,
                { color: tab === t ? '#FFFFFF' : colors.textLight },
              ]}
            >
              {t === 'budgets' ? '📊 Budgets' : '🎯 Savings Goals'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ════════════════════════ BUDGETS TAB ════════════════════════ */}
        {tab === 'budgets' && (
          <>
            {budgets.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No budgets yet</Text>
                <Text style={[styles.emptySub, { color: colors.textLight }]}>
                  Set spending limits to stay on track
                </Text>
              </View>
            ) : (
              budgets.map((budget) => {
                const spent = getBudgetSpent(budget, expenses);
                const pct = getBudgetUsagePercent(budget, expenses);
                const isOver = pct >= 100;
                const isWarn = pct >= budget.alertThreshold;
                const barColor = isOver ? colors.error : isWarn ? colors.warning : colors.success;
                const catName = budget.categoryId
                  ? (categories.find((c) => c.id === budget.categoryId)?.name ?? 'Category')
                  : `Overall`;

                return (
                  <View key={budget.id} style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{catName}</Text>
                        <Text style={[styles.cardSub, { color: colors.textLight }]}>
                          {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteBudget(budget.id)}>
                        <Text style={{ color: colors.error, fontSize: 18 }}>🗑</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.amountRow}>
                      <Text style={[styles.spentAmount, { color: isOver ? colors.error : colors.text }]}>
                        {formatCurrency(spent, currency)}
                      </Text>
                      <Text style={[styles.totalAmount, { color: colors.textLight }]}>
                        {' '}/ {formatCurrency(budget.amount, currency)}
                      </Text>
                    </View>

                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          { backgroundColor: barColor, width: `${Math.min(pct, 100)}%` },
                        ]}
                      />
                    </View>

                    <Text style={[styles.pctText, { color: isOver ? colors.error : colors.textLight }]}>
                      {pct.toFixed(0)}% used
                      {isOver && '  ⚠️ Over budget!'}
                      {!isOver && isWarn && '  ⚠️ Approaching limit'}
                    </Text>
                  </View>
                );
              })
            )}

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowBudgetModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Budget</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ════════════════════════ SAVINGS TAB ════════════════════════ */}
        {tab === 'savings' && (
          <>
            {/* Savings tips card */}
            <View style={[styles.tipsCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
              <Text style={[styles.tipsTitle, { color: colors.primary }]}>💡 Saving Tips</Text>
              <Text style={[styles.tipsText, { color: colors.text }]}>
                • Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings{'\n'}
                • Automate savings on payday{'\n'}
                • Review subscriptions monthly
              </Text>
            </View>

            {goals.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No savings goals</Text>
                <Text style={[styles.emptySub, { color: colors.textLight }]}>
                  Create a goal and start saving today
                </Text>
              </View>
            ) : (
              goals.map((goal) => {
                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const remaining = goal.targetAmount - goal.currentAmount;
                return (
                  <View key={goal.id} style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 28, marginRight: spacing.sm }}>{goal.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardTitle, { color: colors.text }]}>{goal.name}</Text>
                          <Text style={[styles.cardSub, { color: colors.textLight }]}>
                            {formatCurrency(remaining, currency)} remaining
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
                        <Text style={{ color: colors.error, fontSize: 18 }}>🗑</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.amountRow}>
                      <Text style={[styles.spentAmount, { color: goal.color }]}>
                        {formatCurrency(goal.currentAmount, currency)}
                      </Text>
                      <Text style={[styles.totalAmount, { color: colors.textLight }]}>
                        {' '}/ {formatCurrency(goal.targetAmount, currency)}
                      </Text>
                      <Text style={[styles.goalPct, { color: goal.color }]}>
                        {pct.toFixed(0)}%
                      </Text>
                    </View>

                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          { backgroundColor: goal.color, width: `${pct}%` },
                        ]}
                      />
                    </View>

                    {pct < 100 && (
                      <TouchableOpacity
                        style={[styles.contribBtn, { borderColor: goal.color }]}
                        onPress={() => {
                          setSelectedGoalId(goal.id);
                          setShowContribModal(true);
                        }}
                      >
                        <Text style={[styles.contribBtnText, { color: goal.color }]}>+ Add money</Text>
                      </TouchableOpacity>
                    )}

                    {pct >= 100 && (
                      <Text style={[styles.completedText, { color: colors.success }]}>
                        🎉 Goal achieved!
                      </Text>
                    )}
                  </View>
                );
              })
            )}

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowGoalModal(true)}
            >
              <Text style={styles.addButtonText}>+ New Savings Goal</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* ═══════════════════ ADD BUDGET MODAL ═══════════════════ */}
      <Modal visible={showBudgetModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Budget</Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Budget Amount</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Period</Text>
            <View style={styles.chipRow}>
              {PERIOD_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    budgetPeriod === p && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setBudgetPeriod(p)}
                >
                  <Text style={[styles.chipText, { color: budgetPeriod === p ? '#FFF' : colors.textLight }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Category (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  !budgetCategoryId && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setBudgetCategoryId(undefined)}
              >
                <Text style={[styles.chipText, { color: !budgetCategoryId ? '#FFF' : colors.textLight }]}>
                  Overall
                </Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    budgetCategoryId === c.id && { backgroundColor: c.color, borderColor: c.color },
                  ]}
                  onPress={() => setBudgetCategoryId(c.id)}
                >
                  <Text style={[styles.chipText, { color: budgetCategoryId === c.id ? '#FFF' : colors.textLight }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Alert at (% of budget)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="80"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={budgetAlertThreshold}
              onChangeText={setBudgetAlertThreshold}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => { resetBudgetForm(); setShowBudgetModal(false); }}
              >
                <Text style={{ color: colors.textLight }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddBudget}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════ ADD GOAL MODAL ═══════════════════ */}
      <Modal visible={showGoalModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Savings Goal</Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Goal Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Emergency Fund"
              placeholderTextColor={colors.textLight}
              value={goalName}
              onChangeText={setGoalName}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Target Amount</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              value={goalTarget}
              onChangeText={setGoalTarget}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Already Saved (optional)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              value={goalCurrent}
              onChangeText={setGoalCurrent}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {GOAL_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconPicker,
                    { borderColor: goalIcon === ic ? colors.primary : colors.border },
                    goalIcon === ic && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => setGoalIcon(ic)}
                >
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Color</Text>
            <View style={styles.chipRow}>
              {GOAL_COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.colorDot,
                    { backgroundColor: col },
                    goalColor === col && styles.colorDotSelected,
                  ]}
                  onPress={() => setGoalColor(col)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => { resetGoalForm(); setShowGoalModal(false); }}
              >
                <Text style={{ color: colors.textLight }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddGoal}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════ CONTRIBUTION MODAL ═══════════════════ */}
      <Modal visible={showContribModal} animationType="fade" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheetSmall, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Money</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Amount"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
              value={contribAmount}
              onChangeText={setContribAmount}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => { setContribAmount(''); setShowContribModal(false); }}
              >
                <Text style={{ color: colors.textLight }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleContribute}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold },
  scroll: { flex: 1 },

  // Segment tabs
  segmentWrapper: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs },
  emptySub: { fontSize: typography.fontSize.sm, textAlign: 'center' },

  // Card
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
  cardSub: { fontSize: typography.fontSize.xs, marginTop: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  spentAmount: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  totalAmount: { fontSize: typography.fontSize.sm },
  pctText: { fontSize: typography.fontSize.xs, marginTop: spacing.xs },
  goalPct: { marginLeft: 'auto', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },

  // Bar
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },

  // Contribution button
  contribBtn: {
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  contribBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  completedText: { marginTop: spacing.sm, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, textAlign: 'center' },

  // Add button
  addButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },

  // Tips card
  tipsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
  },
  tipsTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  tipsText: { fontSize: typography.fontSize.sm, lineHeight: 22 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  modalSheetSmall: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xs,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  chipScroll: { marginBottom: spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  chipText: { fontSize: typography.fontSize.sm },
  iconPicker: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
});
