# SpendWise Components Documentation

This directory contains all reusable UI components following the Atomic Design pattern.

## Structure

```
components/
├── atoms/          # Basic building blocks
├── molecules/      # Simple combinations of atoms
├── organisms/      # Complex UI sections
└── index.ts        # Centralized exports
```

## Atoms

### Button
Customizable button with variants (primary, secondary, outline, text).

```tsx
import { Button } from '@/src/components/atoms/Button';

<Button variant="primary" onPress={handlePress}>
  Save
</Button>
```

### TextInput
Text input field with label, error state, and icon support.

```tsx
import { TextInput } from '@/src/components/atoms/Input';

<TextInput
  label="Amount"
  value={value}
  onChangeText={setValue}
  keyboardType="decimal-pad"
/>
```

### Icon
Wrapper for Ionicons with size presets.

```tsx
import { Icon } from '@/src/components/atoms/Icon';

<Icon name="wallet" size={24} color={Colors.primary} />
```

### Card
Container with elevation and rounded corners.

```tsx
import { Card } from '@/src/components/atoms/Card';

<Card shadowSize="medium">
  {children}
</Card>
```

### Typography
Text component with consistent styling variants.

```tsx
import { Typography } from '@/src/components/atoms/Typography';

<Typography variant="heading" weight="bold">
  Hello World
</Typography>
```

## Molecules

### ExpenseCard
Card displaying expense information with swipe actions.

```tsx
import { ExpenseCard } from '@/src/components/molecules/ExpenseCard';

<ExpenseCard
  expense={expense}
  onPress={handlePress}
  onDelete={handleDelete}
/>
```

### CategoryBadge
Colored badge showing category icon and name.

```tsx
import { CategoryBadge } from '@/src/components/molecules/CategoryBadge';

<CategoryBadge
  category={category}
  selected={isSelected}
  onPress={handleSelect}
/>
```

### StatCard
Card showing statistics with icon.

```tsx
import { StatCard } from '@/src/components/molecules/StatCard';

<StatCard
  title="Total Spent"
  value="$1,234.56"
  icon="wallet"
  iconColor={Colors.primary}
/>
```

### AmountInput
Specialized input for currency amounts with formatting.

```tsx
import { AmountInput } from '@/src/components/molecules/AmountInput';

<AmountInput
  value={amount}
  onChangeText={setAmount}
  currency="USD"
  error={error}
/>
```

## Organisms

### ExpenseList
Grouped list of expenses by date with section headers.

```tsx
import { ExpenseList } from '@/src/components/organisms/ExpenseList';

<ExpenseList
  expenses={expenses}
  onExpensePress={handlePress}
  onExpenseDelete={handleDelete}
  ListHeaderComponent={<Header />}
/>
```

### CategoryGrid
Horizontal scrollable grid of category badges for selection.

```tsx
import { CategoryGrid } from '@/src/components/organisms/CategoryGrid';

<CategoryGrid
  categories={categories}
  selectedCategoryId={selectedId}
  onCategorySelect={handleSelect}
/>
```

### ChartSection
Container for statistics charts (pie chart for categories).

```tsx
import { ChartSection } from '@/src/components/organisms/ChartSection';

<ChartSection
  title="Spending by Category"
  categoryBreakdown={breakdown}
  currency={currency}
/>
```

## Usage

Import components individually or use the centralized export:

```tsx
// Individual import
import { Button } from '@/src/components/atoms/Button';

// Or from index
import { Button, Card, Icon } from '@/src/components';
```

## Styling

All components use:
- Theme colors from `src/constants/colors.ts`
- Spacing from `src/theme/theme.ts`
- Typography from `src/theme/theme.ts`

## Accessibility

All components follow accessibility best practices:
- Touch targets ≥44x44
- Proper contrast ratios
- Semantic labels
- Screen reader support
