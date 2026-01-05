# 🔧 SpendWise - Quick Reference Guide

Quick commands and code snippets for common tasks.

## 🚀 Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Clear cache and start
npm start -- --clear

# Run on Android emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios

# Run on web browser
npm run web

# Check for linting errors
npm run lint

# Kill all Node processes (if port busy)
# Windows PowerShell:
Get-Process node | Stop-Process -Force

# Mac/Linux:
killall node
```

## 📱 Common Development Tasks

### Add a New Category

Edit `src/constants/categories.ts`:

```typescript
{
  id: 'new-category',
  name: 'New Category',
  icon: 'icon-name', // Use Ionicons name
  color: '#FF0000',
  isDefault: true,
}
```

### Change App Colors

Edit `src/constants/colors.ts`:

```typescript
export const Colors = {
  primary: '#YOUR_COLOR',    // Main brand color
  secondary: '#YOUR_COLOR',  // Accent color
  // ... other colors
};
```

### Add New Expense Field

1. Update type in `src/types/index.ts`:
```typescript
export interface Expense {
  // ... existing fields
  newField: string;
}
```

2. Update Redux slice in `src/store/slices/expenseSlice.ts`

3. Update Add Expense form in `app/modal.tsx`

4. Update Expense Card in `src/components/molecules/ExpenseCard.tsx`

### Create New Screen

1. Create file in `app/(tabs)/newscreen.tsx`
2. Add tab in `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="newscreen"
  options={{
    title: 'New Screen',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

## 🎨 Styling Tips

### Use Theme Spacing
```typescript
import { spacing } from '../src/theme/theme';

styles.container = {
  padding: spacing.md,        // 16
  marginTop: spacing.lg,      // 24
};
```

### Use Theme Colors
```typescript
import { Colors } from '../src/constants/colors';

styles.text = {
  color: Colors.text,
  backgroundColor: Colors.card,
};
```

### Use Theme Typography
```typescript
import { typography } from '../src/theme/theme';

styles.title = {
  fontSize: typography.fontSize.xl,      // 24
  fontWeight: typography.fontWeight.bold, // '700'
};
```

## 🔄 Redux Patterns

### Dispatch Action
```typescript
import { useAppDispatch } from '../src/hooks/useRedux';
import { addExpense } from '../src/store/slices/expenseSlice';

const dispatch = useAppDispatch();

dispatch(addExpense(newExpense));
```

### Read State
```typescript
import { useAppSelector } from '../src/hooks/useRedux';

const expenses = useAppSelector((state) => state.expenses.expenses);
const currency = useAppSelector((state) => state.settings.currency);
```

### Add New Action to Slice
```typescript
// In slice file
reducers: {
  newAction: (state, action: PayloadAction<Type>) => {
    // Update state
  },
}

// Export action
export const { newAction } = sliceName.actions;
```

## 📊 Working with Data

### Filter Expenses by Date
```typescript
import { getExpensesByPeriod } from '../src/utils/calculations';

const monthExpenses = getExpensesByPeriod(expenses, 'month');
```

### Calculate Total
```typescript
import { calculateTotalSpent } from '../src/utils/calculations';

const total = calculateTotalSpent(expenses);
```

### Format Currency
```typescript
import { formatCurrency } from '../src/utils/formatters';

const formatted = formatCurrency(123.45, 'USD'); // "$123.45"
```

### Format Date
```typescript
import { formatDate } from '../src/utils/formatters';

const formatted = formatDate(new Date()); // "Today" or "Jan 15"
```

## 🐛 Debugging

### Log Redux State
```typescript
console.log('Current expenses:', expenses);
console.log('Expenses count:', expenses.length);
```

### Check Component Rendering
```typescript
useEffect(() => {
  console.log('Component mounted/updated');
}, []);
```

### Debug Chart Data
```typescript
console.log('Pie data:', pieData);
console.log('Categories:', categoryBreakdown);
```

## 📱 Navigation

### Navigate to Screen
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

router.push('/modal');        // Open modal
router.back();                // Go back
router.replace('/home');      // Replace current
```

### Pass Parameters (for future use)
```typescript
router.push({
  pathname: '/details',
  params: { id: '123' }
});
```

## 🎨 Custom Components

### Create Atom Component Template
```typescript
import React from 'react';
import { StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onPress,
}) => {
  return (
    // JSX here
  );
};

const styles = StyleSheet.create({
  // Styles here
});
```

## 🔔 Alerts

### Show Confirmation
```typescript
import { Alert } from 'react-native';

Alert.alert(
  'Title',
  'Message',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: () => console.log('OK') },
  ]
);
```

### Show Error
```typescript
Alert.alert('Error', 'Something went wrong');
```

## 📦 Asset Management

### Add Icon
Use Ionicons from [@expo/vector-icons](https://icons.expo.fyi/):

```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="heart" size={24} color="red" />
```

### Add Image
```typescript
import { Image } from 'react-native';

<Image 
  source={require('../assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
```

## 🧪 Testing

### Test Component
```typescript
// In your component file
export default function MyScreen() {
  // Add test data
  const testExpenses = [
    {
      id: '1',
      amount: 50,
      category: categories[0],
      // ... other fields
    }
  ];

  return <ExpenseList expenses={testExpenses} />;
}
```

### Clear All Data (for testing)
In Settings screen, add:

```typescript
import { setExpenses } from '../src/store/slices/expenseSlice';

// Clear all expenses
dispatch(setExpenses([]));
```

## 🔧 Performance Tips

### Optimize Lists
```typescript
<FlatList
  data={expenses}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
/>
```

### Memoize Calculations
```typescript
import { useMemo } from 'react';

const total = useMemo(
  () => calculateTotalSpent(expenses),
  [expenses]
);
```

## 📖 Useful Resources

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Ionicons](https://icons.expo.fyi/)
- [Date-fns](https://date-fns.org/)

## 🎯 Next Features to Implement

### Budget Management
1. Create Budget form component
2. Add budget progress component
3. Add budget alerts

### Edit Expense
1. Create Edit screen (copy from Add)
2. Pre-fill form with existing data
3. Update instead of create

### Export Data
1. Install react-native-fs
2. Create CSV formatter
3. Add share functionality

---

**Keep this guide handy while developing! 🚀**
