# 💰 SpendWise - Smart Spending, Better Saving

A modern expense tracking mobile app built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Development Server**
```bash
npm start
```

3. **Run on Device**
- Scan the QR code with Expo Go (Android) or Camera (iOS)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

## 📱 Features (MVP)

### ✅ Implemented
- **Add Expenses**: Quick expense entry with amount, category, and notes
- **Expense List**: View all expenses grouped by date with swipe-to-delete
- **Categories**: 12 pre-defined categories with custom colors and icons
- **Statistics**: 
  - Total spending by day/week/month/year
  - Category breakdown with pie charts
  - Top spending categories
- **Settings**: Currency selection, dark mode, data management

### 🎨 Design Highlights
- Material Design 3 (Material You)
- Smooth animations with Reanimated
- Clean, modern UI with custom color scheme
- Responsive layout for all screen sizes

## 📂 Project Structure

```
spendwise/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── statistics.tsx   # Statistics screen
│   │   └── settings.tsx     # Settings screen
│   ├── _layout.tsx          # Root layout with providers
│   └── modal.tsx            # Add expense modal
├── src/
│   ├── components/
│   │   ├── atoms/           # Basic components (Button, Input, Card, Icon)
│   │   ├── molecules/       # Composite components (ExpenseCard, CategoryBadge, StatCard)
│   │   └── organisms/       # Complex components (ExpenseList, CategoryGrid)
│   ├── constants/
│   │   ├── categories.ts    # Default categories & currency
│   │   └── colors.ts        # Color scheme
│   ├── hooks/
│   │   └── useRedux.ts      # Redux hooks
│   ├── store/
│   │   ├── slices/          # Redux slices (expenses, categories, budgets, settings)
│   │   └── store.ts         # Store configuration with persistence
│   ├── theme/
│   │   └── theme.ts         # Theme configuration
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   └── utils/
│       ├── calculations.ts  # Expense calculations
│       └── formatters.ts    # Currency & date formatting
└── assets/                   # Images, icons, fonts
```

## 🛠️ Tech Stack

### Core
- **React Native**: 0.81.5
- **Expo**: ~54.0
- **TypeScript**: ~5.9

### State Management
- **Redux Toolkit**: ^2.2
- **React Redux**: ^9.1
- **Redux Persist**: ^6.0 (with AsyncStorage)

### UI Components
- **React Native Paper**: ^5.12 (Material Design)
- **React Native Vector Icons**: ^10.0
- **React Native Chart Kit**: ^6.12
- **Victory Native**: ^37.0 (Advanced charts)

### Navigation
- **Expo Router**: ~6.0
- **React Navigation**: ^7.1

### Utilities
- **React Hook Form**: ^7.51 (Form validation)
- **Zod**: ^3.22 (Schema validation)
- **date-fns**: ^3.3 (Date manipulation)
- **React Native MMKV**: ^2.12 (Fast key-value storage)

## 🎯 Usage Guide

### Adding an Expense
1. Tap the **+** button (FAB) on the home screen
2. Enter the amount
3. Select a category
4. Optionally add a note
5. Tap **Save Expense**

### Viewing Statistics
1. Navigate to the **Statistics** tab
2. Use the segment control to filter by Day/Week/Month/Year
3. View pie chart for category breakdown
4. Scroll down to see top spending categories

### Managing Settings
1. Navigate to the **Settings** tab
2. Change currency (USD, EUR, GBP, etc.)
3. Toggle dark mode
4. Access export and data management options

## 🔧 Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint

# Reset project (clear cache)
npm run reset-project
```

## 📦 Building for Production

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build for Play Store
eas build --platform android --profile production
```

### iOS
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## 🗺️ Roadmap

### Phase 2 (Planned)
- [ ] Budget Management
- [ ] Recurring Expenses
- [ ] Export to CSV/PDF
- [ ] Cloud Backup (Supabase)

### Phase 3 (Future)
- [ ] Multi-currency Support with Auto-conversion
- [ ] Shared Expenses (for groups/families)
- [ ] Financial Insights & AI Tips
- [ ] Receipt Scanning with OCR
- [ ] Goal-Based Saving

## 🎨 Design System

### Colors
- **Primary**: #6C63FF (Purple-blue)
- **Secondary**: #FF6584 (Coral pink)
- **Success**: #00D68F
- **Warning**: #FFAB00
- **Error**: #FF3D71

### Typography
- **Font**: System default (Inter/SF Pro)
- **Sizes**: xs(12), sm(14), md(16), lg(18), xl(24), xxl(32), xxxl(40)

## 🐛 Known Issues

- Dark mode needs full implementation across all components
- Charts need optimization for smaller screens
- Need to add haptic feedback for better UX

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ using React Native & Expo

---

**Happy Tracking! 💰**
