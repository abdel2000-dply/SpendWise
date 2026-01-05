# ✅ SpendWise Setup Checklist

Use this checklist to ensure everything is set up correctly!

## 📋 Pre-Installation

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Expo Go app downloaded on phone
- [ ] Computer and phone on same WiFi network

## 🔧 Installation Steps

- [ ] Run `npm install` in project directory
- [ ] Wait for all dependencies to install (3-5 minutes)
- [ ] Check for any error messages
- [ ] Verify node_modules folder was created

## 🚀 First Run

- [ ] Run `npm start`
- [ ] Metro bundler starts successfully
- [ ] QR code appears in terminal
- [ ] Expo Dev Tools opens in browser (optional)

## 📱 Device Connection

### Option 1: Physical Device
- [ ] Open Expo Go app
- [ ] Scan QR code from terminal
- [ ] App loads successfully
- [ ] No red error screens

### Option 2: Emulator
- [ ] Android emulator is running OR iOS simulator is open
- [ ] Run `npm run android` OR `npm run ios`
- [ ] App builds successfully
- [ ] App opens in emulator

## ✨ Test Basic Features

### Home Screen
- [ ] Home screen loads with "Welcome back!" header
- [ ] Three stat cards visible (Today, This Week, This Month)
- [ ] "Recent Expenses" section visible
- [ ] Purple + button (FAB) visible at bottom right
- [ ] All text readable and styled correctly

### Add Expense
- [ ] Tap the + button
- [ ] Modal opens with "Add Expense" title
- [ ] Amount input field visible
- [ ] Category selector scrolls horizontally
- [ ] Can enter amount (e.g., "25.50")
- [ ] Can select a category (e.g., "Food & Dining")
- [ ] Can type a note (optional)
- [ ] "Save Expense" button works
- [ ] Modal closes and returns to home
- [ ] New expense appears in list

### View Expense
- [ ] Expense shows in "Recent Expenses" list
- [ ] Expense card shows:
  - Category icon with colored background
  - Category name
  - Amount formatted with currency
  - Note (if added)
  - Time added
- [ ] Can swipe left on expense card
- [ ] Delete icon appears
- [ ] Tap delete shows confirmation alert
- [ ] Confirm delete removes expense

### Statistics Screen
- [ ] Tap "Statistics" tab at bottom
- [ ] Statistics screen loads
- [ ] Four filter buttons visible (Day/Week/Month/Year)
- [ ] Can toggle between time periods
- [ ] "Total Spent" and "Daily Average" cards show
- [ ] Pie chart appears (after adding expenses)
- [ ] Top categories list shows breakdown
- [ ] Percentages add up to 100%

### Settings Screen
- [ ] Tap "Settings" tab at bottom
- [ ] Settings screen loads
- [ ] App info card shows "SpendWise"
- [ ] Currency setting visible
- [ ] Tap currency opens selection dialog
- [ ] Can change currency (USD, EUR, GBP, etc.)
- [ ] Dark mode toggle visible
- [ ] All list items are tappable
- [ ] Alerts show for placeholder features

## 🎨 UI/UX Checks

- [ ] All colors match design (purple primary, coral secondary)
- [ ] Icons load correctly
- [ ] Text is readable (not too small/large)
- [ ] Cards have subtle shadows
- [ ] Spacing looks consistent
- [ ] No overlapping elements
- [ ] FAB doesn't cover content
- [ ] Tab bar visible at bottom
- [ ] Safe areas respected (notch, status bar)

## 🔄 Data Persistence

- [ ] Add an expense
- [ ] Close the app completely
- [ ] Reopen the app
- [ ] Expense is still there
- [ ] Statistics updated correctly
- [ ] Settings retained

## 🐛 Common Issues Check

- [ ] No red error screens
- [ ] No "undefined is not an object" errors
- [ ] No "Cannot read property of undefined" errors
- [ ] Console shows no critical errors
- [ ] All imports resolve correctly
- [ ] TypeScript errors only about missing node_modules (before install)

## 📊 Data Validation

- [ ] Can't save expense without amount
- [ ] Can't save expense without category
- [ ] Amount must be positive number
- [ ] Alert shows for validation errors
- [ ] Invalid amounts rejected (e.g., "abc")

## 🎯 Performance Check

- [ ] App loads quickly (<5 seconds)
- [ ] Scrolling is smooth
- [ ] No lag when adding expenses
- [ ] Charts render without delay
- [ ] Navigation is responsive
- [ ] Modal opens/closes smoothly

## 📱 Platform-Specific (Optional)

### Android
- [ ] Back button works correctly
- [ ] Hardware back closes modals
- [ ] Status bar color appropriate
- [ ] Keyboard opens smoothly
- [ ] Keyboard doesn't hide inputs

### iOS
- [ ] Safe area insets correct
- [ ] Status bar visible
- [ ] Keyboard dismisses on scroll
- [ ] Swipe gestures work
- [ ] Modal presentation smooth

## 🔐 Data & Privacy

- [ ] No data sent to external servers
- [ ] All data stored locally
- [ ] No internet connection required
- [ ] Redux Persist working
- [ ] AsyncStorage configured correctly

## 📝 Documentation Check

- [ ] README.md present and readable
- [ ] SETUP.md explains architecture
- [ ] GETTING_STARTED.md has quick start guide
- [ ] PROJECT_SUMMARY.md lists all features
- [ ] Code comments where needed

## 🎓 Learning Verification

### Understand These Concepts:
- [ ] Expo Router file-based routing
- [ ] Redux Toolkit slices
- [ ] Redux Persist configuration
- [ ] React Native Paper components
- [ ] TypeScript interfaces
- [ ] Atomic Design pattern
- [ ] useState and useEffect hooks
- [ ] useDispatch and useSelector
- [ ] SafeAreaView usage
- [ ] KeyboardAvoidingView

## 🚀 Ready to Extend?

Once all checks pass, you can:
- [ ] Add budget management features
- [ ] Implement recurring expenses
- [ ] Add edit expense functionality
- [ ] Create custom categories
- [ ] Add date picker for manual dates
- [ ] Implement search/filter
- [ ] Add more chart types
- [ ] Create onboarding flow
- [ ] Add animations
- [ ] Implement dark mode fully

## 🎉 Final Check

- [ ] All core features working
- [ ] No critical bugs
- [ ] UI looks polished
- [ ] Data persists correctly
- [ ] Ready to demo to others!

---

## ✅ Completion

If you've checked all the boxes above, **congratulations!** 🎊

Your SpendWise MVP is fully functional and ready for:
- User testing
- Feature additions
- UI refinements
- App store submission (after Phase 2)

## 🆘 If Something's Not Working

1. Check the error message carefully
2. Refer to GETTING_STARTED.md troubleshooting section
3. Clear Metro cache: `npm start -- --clear`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check that all files are in correct locations
6. Verify package.json has all dependencies

---

**Happy Building! 💰✨**
