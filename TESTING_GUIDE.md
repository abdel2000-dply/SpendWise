# SpendWise Phase 1 - Testing & Verification Guide

## Pre-Testing Setup

### 1. Install Dependencies
```bash
npm install
```

Expected: All dependencies install without errors

### 2. Check TypeScript Compilation
```bash
npx tsc --noEmit
```

Note: Errors about missing node_modules are expected before installation. After installation, check for actual logic errors only.

## Component Testing

### Atoms
1. ✅ **Button** - Verify variants render correctly
2. ✅ **Input** - Test keyboard types and validation
3. ✅ **Typography** - Check different text variants
4. ✅ **Icon** - Verify icons display correctly
5. ✅ **Card** - Test elevation and shadows

### Molecules
1. ✅ **ExpenseCard** - Test display and delete action
2. ✅ **CategoryBadge** - Verify selection state
3. ✅ **StatCard** - Check icon and value display
4. ✅ **AmountInput** - Test input validation and formatting

### Organisms
1. ✅ **ExpenseList** - Test grouping and scrolling
2. ✅ **CategoryGrid** - Verify horizontal scroll
3. ✅ **ChartSection** - Test chart rendering (if enabled)

## Utility Testing

### Formatters
```javascript
// Test in browser console or Node
import { formatCurrency, formatDate } from './src/utils/formatters';

formatCurrency(1234.56, 'USD');  // "$1,234.56"
formatDate(new Date());          // "Today"
```

### Calculations
```javascript
import { calculateTotalSpent } from './src/utils/calculations';

const total = calculateTotalSpent(expenses);
console.log(total);
```

### Validators
```javascript
import { validateAmount, validateExpenseForm } from './src/utils/validators';

validateAmount('25.50');  // true
validateAmount('-5');     // false
```

## Hook Testing

### useExpenses
```tsx
const { expenses, addNewExpense, getTotalSpent } = useExpenses();

// Test adding expense
addNewExpense(newExpense);

// Test calculations
const total = getTotalSpent('month');
```

### useCategories
```tsx
const { categories, getCategoryById } = useCategories();

// Test category lookup
const category = getCategoryById('food');
```

### useBudget
```tsx
const { calculateBudgetProgress } = useBudget();

// Test budget calculation
const progress = calculateBudgetProgress(budget);
console.log(progress.percentage);
```

### useTheme
```tsx
const { toggleTheme, isDarkMode } = useTheme();

// Test theme toggle
<Button onPress={toggleTheme}>Toggle Dark Mode</Button>
```

## Screen Testing

### Home Screen
1. ✅ Launch app - should show home screen
2. ✅ Check if stat cards display (Today, Week, Month)
3. ✅ Verify FAB button appears
4. ✅ Test empty state (no expenses)
5. ✅ Add expense via FAB
6. ✅ Verify expense appears in list
7. ✅ Test delete expense (swipe or tap delete icon)
8. ✅ Confirm deletion alert works

### Add Expense Modal
1. ✅ Tap FAB to open modal
2. ✅ Enter amount (test valid: "25.50", invalid: "-5", "abc")
3. ✅ Select category (tap different categories)
4. ✅ Add note (optional)
5. ✅ Tap Save without amount - should show error
6. ✅ Tap Save without category - should show error
7. ✅ Tap Save with valid data - should save and close
8. ✅ Tap Cancel - should close without saving

### Statistics Screen
1. ✅ Navigate to Statistics tab
2. ✅ Check if filter buttons show (Day/Week/Month/Year)
3. ✅ Toggle between time periods
4. ✅ Verify stats update correctly
5. ✅ Check if top categories list displays
6. ✅ Test empty state (no expenses)

### Settings Screen
1. ✅ Navigate to Settings tab
2. ✅ Check app info displays
3. ✅ Tap currency - dialog should appear
4. ✅ Change currency - verify it persists
5. ✅ Toggle dark mode switch
6. ✅ Test other menu items (alerts expected for placeholders)

## Integration Testing

### Data Persistence
1. ✅ Add an expense
2. ✅ Close app completely
3. ✅ Reopen app
4. ✅ Verify expense still exists
5. ✅ Change currency in settings
6. ✅ Close and reopen
7. ✅ Verify currency persisted

### Navigation
1. ✅ Test all bottom tabs
2. ✅ Open and close Add Expense modal
3. ✅ Test back navigation (Android back button)
4. ✅ Verify no navigation errors

### State Management
1. ✅ Add expense - check Redux state updates
2. ✅ Delete expense - verify state changes
3. ✅ Change settings - confirm store updates
4. ✅ Switch tabs - verify state persists

## Performance Testing

### Loading
- ✅ App launch time should be <5 seconds
- ✅ Navigation should be instant
- ✅ Modal should open smoothly

### Scrolling
- ✅ Expense list should scroll smoothly
- ✅ Category grid should scroll horizontally
- ✅ No lag when scrolling large lists

### Memory
- ✅ No memory leaks when navigating
- ✅ App should not crash with many expenses

## Validation Testing

### Amount Input
- ✅ Accept: "25", "25.5", "25.50", "1000"
- ✅ Reject: "-5", "abc", "", "0", "25.555"

### Category Selection
- ✅ Must select category before saving
- ✅ Selected category should be highlighted

### Date
- ✅ Default to today's date
- ✅ (Future: Add date picker test when implemented)

## Error Handling

### Network Errors
- ✅ App works offline (no network required)

### Invalid Data
- ✅ Prevent saving invalid expenses
- ✅ Show appropriate error messages
- ✅ Handle edge cases (0 amount, no category)

### App Crashes
- ✅ App should not crash on any user action
- ✅ Error boundaries should catch errors

## Accessibility Testing

### Screen Readers
- ✅ Test with TalkBack (Android) or VoiceOver (iOS)
- ✅ Verify all buttons are labeled
- ✅ Check navigation is accessible

### Touch Targets
- ✅ All buttons should be ≥44x44 pixels
- ✅ Easy to tap on small screens

### Contrast
- ✅ Text should be readable on all backgrounds
- ✅ Check both light and dark modes

## Platform-Specific Testing

### Android
- ✅ Back button behavior
- ✅ Hardware menu button
- ✅ Status bar color
- ✅ Keyboard handling

### iOS
- ✅ Safe area insets
- ✅ Status bar visibility
- ✅ Swipe gestures
- ✅ Modal presentation

## Known Issues & Limitations

### Current Limitations (Phase 1)
1. ⚠️ Edit expense not implemented (only add/delete)
2. ⚠️ Date picker uses default date (no custom picker)
3. ⚠️ Charts may not render in dev mode (use production build)
4. ⚠️ Dark mode partially implemented (structure in place)
5. ⚠️ Budget features not active (hooks exist for Phase 2)

### Future Enhancements (Phase 2)
1. Edit expense functionality
2. Custom date picker
3. Receipt photo upload
4. Budget management UI
5. Export to CSV/PDF
6. Search and advanced filtering
7. Recurring expenses
8. Onboarding flow

## Testing Checklist

Before marking as complete:
- [ ] All dependencies install successfully
- [ ] No critical TypeScript errors
- [ ] All screens load without crashes
- [ ] Can add expenses successfully
- [ ] Expenses display correctly
- [ ] Statistics calculate correctly
- [ ] Settings persist correctly
- [ ] Navigation works smoothly
- [ ] Delete functionality works
- [ ] Form validation works
- [ ] Empty states display correctly
- [ ] No console errors during normal use

## Reporting Issues

If you find issues during testing:

1. Check IMPLEMENTATION_SUMMARY.md for known limitations
2. Verify you're testing implemented features (not Phase 2 features)
3. Clear cache: `npm start -- --clear`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check that issue is reproducible

## Success Criteria

✅ Phase 1 is complete when:
- All core components render correctly
- Can add and delete expenses
- Statistics display correctly
- Data persists across app restarts
- No critical bugs in core features
- App is ready for Phase 2 development

---

**Current Status**: ✅ Implementation Complete - Ready for Testing
