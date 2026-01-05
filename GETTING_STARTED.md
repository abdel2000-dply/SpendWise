# 🎉 Getting Started with SpendWise

Welcome to SpendWise! This guide will help you get the app running on your device in just a few minutes.

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ **npm** (comes with Node.js) or **yarn**
- ✅ **Expo Go** app on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

### Step 2: Start the Development Server

```bash
npm start
```

You'll see a QR code in your terminal.

### Step 3: Open on Your Phone

#### For iOS:
1. Open the **Camera** app
2. Point it at the QR code
3. Tap the notification to open in Expo Go

#### For Android:
1. Open **Expo Go** app
2. Tap **Scan QR Code**
3. Point at the QR code

**That's it!** The app should now be running on your device. 🎊

## 🖥️ Alternative: Run on Emulator/Simulator

### Android Emulator
```bash
npm run android
```

### iOS Simulator (Mac only)
```bash
npm run ios
```

## 🎯 First Time Using the App?

### Try These Actions:

1. **Add Your First Expense**
   - Tap the purple **+** button at the bottom right
   - Enter an amount (e.g., "25.50")
   - Select a category (e.g., "Food & Dining")
   - Optionally add a note
   - Tap "Save Expense"

2. **View Your Statistics**
   - Tap the **Statistics** tab at the bottom
   - See your spending breakdown by category
   - Switch between Day/Week/Month/Year views

3. **Customize Settings**
   - Tap the **Settings** tab
   - Change your currency
   - Toggle dark mode

## 🔧 Troubleshooting

### Metro Bundler Issues
If you see errors, try clearing the cache:
```bash
npm start -- --clear
```

### Port Already in Use
Kill the process and restart:
```bash
# Windows
npx kill-port 8081 19000 19001
npm start

# Mac/Linux
killall -9 node
npm start
```

### Dependencies Not Installing
Delete node_modules and reinstall:
```bash
# Windows
rmdir /s /q node_modules
npm install

# Mac/Linux
rm -rf node_modules
npm install
```

### Can't Connect to Server
Make sure your phone and computer are on the **same WiFi network**.

## 📱 App Navigation

### Home Screen
- View recent expenses grouped by date
- See quick stats (Today, This Week, This Month)
- Tap **+** to add new expense
- Swipe left on any expense to delete

### Statistics Screen
- Time filter buttons (Day/Week/Month/Year)
- Total spent and daily average cards
- Pie chart showing category breakdown
- List of top spending categories with percentages

### Settings Screen
- App info (name, version)
- Currency selection
- Dark mode toggle
- Data management options

## 🎨 Built-in Features

### 12 Default Categories
1. 🍽️ Food & Dining
2. 🚗 Transportation
3. 🛍️ Shopping
4. 🎬 Entertainment
5. 📄 Bills & Utilities
6. 🏥 Healthcare
7. 📚 Education
8. ✈️ Travel
9. 🛒 Groceries
10. 💪 Fitness
11. 🔄 Subscriptions
12. 📦 Other

### Supported Currencies
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- JPY (¥) - Japanese Yen
- INR (₹) - Indian Rupee
- And more...

## 💾 Data Storage

Your data is stored **locally** on your device using:
- **Redux Persist** with AsyncStorage for app state
- **MMKV** for fast key-value storage

**No internet connection required!** All features work offline.

## 🔜 Coming Soon (Phase 2)

- 💰 Budget Management
- 🔄 Recurring Expenses
- 📊 Export to CSV/PDF
- ☁️ Cloud Backup & Sync
- 📸 Receipt Scanning

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## 💡 Tips for Best Experience

1. **Add expenses regularly** to get accurate statistics
2. **Use descriptive notes** to remember what you spent on
3. **Check statistics weekly** to stay aware of your spending
4. **Set up dark mode** if you use the app at night

## 🆘 Need Help?

If you encounter any issues:
1. Check the [Troubleshooting](#-troubleshooting) section above
2. Read the full [SETUP.md](./SETUP.md) documentation
3. Check for typos in your code changes
4. Make sure all dependencies are installed

## 🎓 Project Structure Quick Reference

```
app/
  (tabs)/
    index.tsx          → Home screen
    statistics.tsx     → Statistics screen
    settings.tsx       → Settings screen
  modal.tsx            → Add expense form

src/
  components/          → UI components
  store/              → Redux state management
  utils/              → Helper functions
  constants/          → App configuration
  types/              → TypeScript types
```

## ✨ You're All Set!

Start tracking your expenses and take control of your finances with SpendWise!

**Happy Spending (Wisely)! 💰**

---

Made with ❤️ using React Native & Expo
