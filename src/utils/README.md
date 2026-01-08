# SpendWise Utilities Documentation

This directory contains utility functions for formatting, calculations, and validation.

## Formatters (`formatters.ts`)

Functions to format currency, dates, and numbers.

### formatCurrency
Format currency with symbol and thousands separator.

```tsx
import { formatCurrency } from '@/src/utils/formatters';

formatCurrency(1234.56, 'USD');  // "$1,234.56"
formatCurrency(1234.56, 'EUR');  // "€1,234.56"
formatCurrency(1234.56, 'MAD');  // "DH1,234.56"
```

### formatDate
Format date as "Today", "Yesterday", or short date.

```tsx
import { formatDate } from '@/src/utils/formatters';

formatDate(new Date());              // "Today"
formatDate(yesterday);               // "Yesterday"
formatDate(new Date('2024-01-15'));  // "Jan 15"
formatDate(new Date('2023-12-25'));  // "Dec 25, 2023"

// With custom format
formatDate(new Date(), 'MMM dd, yyyy');  // "Jan 15, 2024"
```

### formatDateLong
Format date in long format.

```tsx
import { formatDateLong } from '@/src/utils/formatters';

formatDateLong(new Date());  // "Monday, January 15, 2024"
```

### formatRelativeDate
Format date relative to now (e.g., "2 days ago").

```tsx
import { formatRelativeDate } from '@/src/utils/formatters';

formatRelativeDate(new Date());           // "Today"
formatRelativeDate(yesterday);            // "Yesterday"
formatRelativeDate(threeDaysAgo);         // "3 days ago"
formatRelativeDate(nextWeek);             // "in 7 days"
```

### formatTime
Format time in 12-hour format.

```tsx
import { formatTime } from '@/src/utils/formatters';

formatTime(new Date('2024-01-15 14:30'));  // "2:30 PM"
formatTime(new Date('2024-01-15 09:00'));  // "9:00 AM"
```

### formatNumber
Format number with thousands separator.

```tsx
import { formatNumber } from '@/src/utils/formatters';

formatNumber(1234567);  // "1,234,567"
formatNumber(1000);     // "1,000"
```

### truncateText
Truncate text to specified length.

```tsx
import { truncateText } from '@/src/utils/formatters';

truncateText('Hello World', 5);  // "Hello..."
truncateText('Short', 10);       // "Short"
```

## Calculations (`calculations.ts`)

Functions for expense calculations.

### calculateTotalSpent
Calculate total amount from expenses.

```tsx
import { calculateTotalSpent } from '@/src/utils/calculations';

const total = calculateTotalSpent(expenses);  // 1234.56
```

### calculateTotalByPeriod
Calculate total spent for a specific time period.

```tsx
import { calculateTotalByPeriod } from '@/src/utils/calculations';

const dayTotal = calculateTotalByPeriod(expenses, 'day');
const weekTotal = calculateTotalByPeriod(expenses, 'week');
const monthTotal = calculateTotalByPeriod(expenses, 'month');
const yearTotal = calculateTotalByPeriod(expenses, 'year');
```

### calculateCategoryBreakdown
Calculate spending breakdown by category.

```tsx
import { calculateCategoryBreakdown } from '@/src/utils/calculations';

const breakdown = calculateCategoryBreakdown(expenses, categories);
// Returns array of CategorySpending with amount, percentage, transactionCount
```

### calculateDailyAverage
Calculate daily average spending.

```tsx
import { calculateDailyAverage } from '@/src/utils/calculations';

const avgLast30Days = calculateDailyAverage(expenses, 30);
const avgLast7Days = calculateDailyAverage(expenses, 7);
```

### groupExpensesByDate
Group expenses by date.

```tsx
import { groupExpensesByDate } from '@/src/utils/calculations';

const grouped = groupExpensesByDate(expenses);
// Returns Map<string, Expense[]>

// Usage
for (const [date, expensesOnDate] of grouped.entries()) {
  console.log(date, expensesOnDate.length);
}
```

### sortExpensesByDate
Sort expenses by date.

```tsx
import { sortExpensesByDate } from '@/src/utils/calculations';

const sortedDesc = sortExpensesByDate(expenses);         // newest first
const sortedAsc = sortExpensesByDate(expenses, true);    // oldest first
```

### getExpensesByPeriod
Filter expenses by time period.

```tsx
import { getExpensesByPeriod } from '@/src/utils/calculations';

const todayExpenses = getExpensesByPeriod(expenses, 'day');
const weekExpenses = getExpensesByPeriod(expenses, 'week');
const monthExpenses = getExpensesByPeriod(expenses, 'month');
const yearExpenses = getExpensesByPeriod(expenses, 'year');
```

### filterExpensesByDateRange
Filter expenses by custom date range.

```tsx
import { filterExpensesByDateRange } from '@/src/utils/calculations';

const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const januaryExpenses = filterExpensesByDateRange(expenses, startDate, endDate);
```

## Validators (`validators.ts`)

Form validation functions.

### validateAmount
Validate if amount is valid positive number.

```tsx
import { validateAmount } from '@/src/utils/validators';

validateAmount('25.50');   // true
validateAmount('0');       // false
validateAmount('-5');      // false
validateAmount('abc');     // false
validateAmount('');        // false
```

### validateCategory
Validate if category ID is provided.

```tsx
import { validateCategory } from '@/src/utils/validators';

validateCategory('food');  // true
validateCategory('');      // false
```

### validateDate
Validate if date is valid and not in future.

```tsx
import { validateDate } from '@/src/utils/validators';

validateDate(new Date());           // true
validateDate(yesterday);            // true
validateDate(nextWeek);             // false (future date)
validateDate(new Date('invalid'));  // false
```

### validateExpenseForm
Validate entire expense form data.

```tsx
import { validateExpenseForm } from '@/src/utils/validators';

const formData = {
  amount: '25.50',
  categoryId: 'food',
  date: new Date(),
  note: 'Lunch'
};

const result = validateExpenseForm(formData);
// Returns: { isValid: boolean, errors: Record<string, string> }

if (!result.isValid) {
  console.log(result.errors.amount);      // Error message if invalid
  console.log(result.errors.categoryId);  // Error message if invalid
  console.log(result.errors.date);        // Error message if invalid
}
```

### validateBudgetAmount
Validate budget amount.

```tsx
import { validateBudgetAmount } from '@/src/utils/validators';

validateBudgetAmount(100);   // true
validateBudgetAmount(0);     // false
validateBudgetAmount(-50);   // false
```

### validateThreshold
Validate threshold percentage (0-100).

```tsx
import { validateThreshold } from '@/src/utils/validators';

validateThreshold(80);   // true
validateThreshold(0);    // true
validateThreshold(100);  // true
validateThreshold(150);  // false
validateThreshold(-10);  // false
```

## Usage

Import utilities individually or use the centralized export:

```tsx
// Individual import
import { formatCurrency } from '@/src/utils/formatters';
import { calculateTotalSpent } from '@/src/utils/calculations';
import { validateAmount } from '@/src/utils/validators';

// Or from index
import { formatCurrency, calculateTotalSpent, validateAmount } from '@/src/utils';
```

## Examples

### Complete Expense Display Example

```tsx
import {
  formatCurrency,
  formatDate,
  formatTime,
  calculateTotalSpent,
  groupExpensesByDate,
} from '@/src/utils';

function ExpenseList({ expenses }) {
  const total = calculateTotalSpent(expenses);
  const grouped = groupExpensesByDate(expenses);

  return (
    <View>
      <Text>Total: {formatCurrency(total, 'USD')}</Text>
      {Array.from(grouped.entries()).map(([date, items]) => (
        <View key={date}>
          <Text>{formatDate(new Date(date))}</Text>
          {items.map((expense) => (
            <View key={expense.id}>
              <Text>{formatCurrency(expense.amount, expense.currency)}</Text>
              <Text>{formatTime(expense.date)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
```

### Form Validation Example

```tsx
import { validateExpenseForm } from '@/src/utils';

function AddExpenseForm() {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    date: new Date(),
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const result = validateExpenseForm(formData);
    
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    // Submit form
    saveExpense(formData);
  };

  return (
    <View>
      <TextInput
        value={formData.amount}
        onChangeText={(text) => setFormData({ ...formData, amount: text })}
        error={errors.amount}
      />
      {errors.amount && <Text>{errors.amount}</Text>}
      <Button onPress={handleSubmit}>Save</Button>
    </View>
  );
}
```
