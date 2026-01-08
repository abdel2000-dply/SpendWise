# SpendWise Custom Hooks Documentation

This directory contains custom React hooks for managing application state and logic.

## Hooks

### useExpenses
Hook for managing expenses (add, update, delete, filter).

```tsx
import { useExpenses } from '@/src/hooks/useExpenses';

const {
  expenses,
  loading,
  error,
  addNewExpense,
  updateExistingExpense,
  removeExpense,
  getFilteredExpenses,
  getTotalSpent,
  getSortedExpenses,
  getRecentExpenses,
  getExpenseById,
} = useExpenses();

// Add expense
addNewExpense(newExpense);

// Get total spent for a period
const total = getTotalSpent('month');

// Get recent expenses
const recent = getRecentExpenses(10);
```

### useCategories
Hook to get and manage categories.

```tsx
import { useCategories } from '@/src/hooks/useCategories';

const {
  categories,
  addNewCategory,
  updateExistingCategory,
  removeCategory,
  getCategoryById,
  getDefaultCategories,
  getCustomCategories,
  getSortedCategories,
} = useCategories();

// Get all categories
console.log(categories);

// Get specific category
const category = getCategoryById('food');
```

### useBudget
Hook for budget calculations and tracking.

```tsx
import { useBudget } from '@/src/hooks/useBudget';

const {
  budgets,
  addNewBudget,
  updateExistingBudget,
  removeBudget,
  getBudgetById,
  getBudgetByCategory,
  getOverallBudget,
  calculateBudgetProgress,
  getBudgetsWithProgress,
  hasExceededBudget,
  hasNearLimitBudget,
} = useBudget();

// Calculate progress for a budget
const progress = calculateBudgetProgress(budget);
console.log(progress.spent, progress.percentage, progress.remaining);

// Check if over budget
if (hasExceededBudget()) {
  showAlert('You have exceeded your budget!');
}
```

### useTheme
Hook to access theme and toggle dark mode.

```tsx
import { useTheme } from '@/src/hooks/useTheme';

const {
  theme,
  colors,
  isDarkMode,
  toggleTheme,
  setTheme,
} = useTheme();

// Toggle theme
<Button onPress={toggleTheme}>
  Toggle Dark Mode
</Button>

// Use theme colors
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```

### useThemeColors
Hook to get theme-aware colors (simpler alternative to useTheme).

```tsx
import { useThemeColors } from '@/src/hooks/useThemeColors';

const colors = useThemeColors();

// Use colors
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Content</Text>
</View>
```

### useRedux (useAppDispatch, useAppSelector)
Typed Redux hooks for type-safe state management.

```tsx
import { useAppDispatch, useAppSelector } from '@/src/hooks/useRedux';

// Select state
const expenses = useAppSelector((state) => state.expenses.expenses);
const isDarkMode = useAppSelector((state) => state.settings.isDarkMode);

// Dispatch actions
const dispatch = useAppDispatch();
dispatch(addExpense(newExpense));
dispatch(toggleDarkMode());
```

## Usage

Import hooks individually or use the centralized export:

```tsx
// Individual import
import { useExpenses } from '@/src/hooks/useExpenses';

// Or from index
import { useExpenses, useCategories, useBudget } from '@/src/hooks';
```

## Best Practices

1. **Use hooks only in functional components**: Don't call hooks in class components or regular functions
2. **Call hooks at the top level**: Don't call hooks inside loops, conditions, or nested functions
3. **Follow the Rules of Hooks**: Use ESLint plugin `eslint-plugin-react-hooks` for enforcement
4. **Memoize callbacks**: Use `useCallback` when passing callbacks to child components
5. **Optimize selectors**: Use `useAppSelector` with specific selectors to avoid unnecessary re-renders

## Examples

### Complete Expense Management Example

```tsx
import { useExpenses, useCategories } from '@/src/hooks';

function ExpenseManager() {
  const { expenses, addNewExpense, removeExpense, getTotalSpent } = useExpenses();
  const { categories } = useCategories();

  const handleAddExpense = () => {
    const newExpense = {
      id: Date.now().toString(),
      amount: 50,
      currency: 'USD',
      category: categories[0],
      date: new Date(),
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addNewExpense(newExpense);
  };

  const totalMonth = getTotalSpent('month');

  return (
    <View>
      <Text>Total this month: ${totalMonth}</Text>
      <Button onPress={handleAddExpense}>Add Expense</Button>
    </View>
  );
}
```

### Budget Tracking Example

```tsx
import { useBudget } from '@/src/hooks';

function BudgetTracker() {
  const { getBudgetsWithProgress, hasExceededBudget } = useBudget();

  const budgetsWithProgress = getBudgetsWithProgress();

  return (
    <View>
      {hasExceededBudget() && (
        <Alert>You have exceeded your budget!</Alert>
      )}
      {budgetsWithProgress.map(({ budget, progress }) => (
        <View key={budget.id}>
          <Text>{budget.amount}</Text>
          <ProgressBar progress={progress.percentage} />
        </View>
      ))}
    </View>
  );
}
```
