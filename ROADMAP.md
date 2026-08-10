# SpendWise — Next-Level Roadmap

> From personal tracker to AI-powered financial coach

---

## Current State (v1.0 — Complete)

| Feature                                                           | Status |
| ----------------------------------------------------------------- | ------ |
| 5-tab navigation (Dashboard, Transactions, Add, Budget, Insights) | ✅     |
| Expense & Income tracking with categories                         | ✅     |
| Budget management per category with alerts                        | ✅     |
| Savings goals with contributions                                  | ✅     |
| Dashboard with balance, trends, quick actions                     | ✅     |
| Insights with charts, category breakdown, smart text insights     | ✅     |
| Dark mode + 11 currencies                                         | ✅     |
| Persistent storage (Redux + AsyncStorage)                         | ✅     |

---

## Phase 1 — UX Polish & Micro-Interactions (v1.1) ✅

**Goal:** Make the app feel premium and delightful to use daily.

- [x] **Haptic feedback** on add transaction, delete, button taps (expo-haptics already installed)
- [x] **Animated transitions** — smooth number counting on balance card, progress bar animations
- [x] **Swipe-to-delete** on transaction cards (react-native-gesture-handler)
- [x] **Pull-to-refresh** on transaction list
- [x] **Onboarding flow** — 3-screen walkthrough for first launch (set name, currency, first budget)
- [ ] **Empty state illustrations** — custom SVG illustrations instead of just icons
- [x] **Confetti/celebration** when savings goal is reached
- [x] **Date picker** for transactions instead of auto-today (expo-date-picker or custom)
- [x] **Category management** — add/edit/delete custom categories with icon+color picker
- [x] **Smart defaults** — remember last used category, auto-suggest amounts based on history

---

## Phase 2 — Recurring Transactions & Automation (v1.2) ✅

**Goal:** Reduce manual input. Money moves on schedule, so should tracking.

- [x] **Recurring expense/income engine** — daily/weekly/monthly auto-generation using expo-notifications + background tasks
- [x] **Bill reminders** — push notifications before recurring bills are due
- [x] **Auto-categorization** — learn from past entries (if note contains "uber" → Transportation)
- [x] **Quick-add templates** — "Coffee $4.50" one-tap entries for frequent expenses
- [x] **Batch entry** — add multiple transactions at once (from a trip, shopping spree, etc.)
- [x] **Undo/snackbar** — "Transaction deleted" with 5-second undo option

---

## Phase 3 — AI Financial Coach (v2.0) 🧠 ✅

**Goal:** Transform from a passive tracker into an active financial advisor.

### 3a. Local AI Insights (no API needed)

- [x] **Spending anomaly detection** — "You spent 3x more on Food today than your daily average"
- [x] **Weekend vs weekday analysis** — "You spend 40% more on weekends"
- [ ] **Payday pattern detection** — detect income patterns and predict next payday
- [x] **Budget forecasting** — "At current pace, you'll exceed your Food budget by the 22nd"
- [x] **Savings pace calculator** — "Save $X/day to reach your goal on time"
- [x] **Monthly financial health score** (0-100) based on budget adherence, savings rate, spending trends

### 3b. AI Chat Coach (API-powered)

- [x] **Chat interface** — conversational UI to ask questions about your finances
- [x] **Groq integration** — send anonymized spending summaries to LLM (llama-3.1-8b-instant)
- [x] Example queries supported
- [ ] **Weekly AI digest** — push notification with personalized financial summary
- [x] **Goal coaching** — AI suggests micro-actions on dashboard
- [x] **Spending challenges** — personalized challenges: "No-spend Wednesday", "Under $50 groceries this week"

### 3c. Implementation Notes

```
Tech stack for AI coach:
- expo-notifications for weekly digests
- React Native Gifted Chat for chat UI
- OpenAI API (gpt-4o-mini) — cheap, fast, good for financial advice
- Local prompt engineering with spending context injection
- Privacy: only send aggregated stats, never raw transaction data
- Fallback: offline smart insights when no internet
```

---

## Phase 4 — Data & Reports (v2.1) ✅

**Goal:** Users need to see their progress and export their data.

- [x] **CSV/PDF export** — export transactions to CSV with sharing
- [x] **Monthly/yearly report screen** — visual summary with charts, top categories, savings progress
- [x] **Compare periods** — side-by-side month vs month, year vs year with % change
- [x] **Receipt photo capture** — camera integration, attach photos to expenses
- [x] **Search with filters** — date range, amount range, category multi-select, sort options
- [x] **Tags system** — custom tags on transactions (e.g., "vacation", "work-related", "tax-deductible")

---

## Phase 5 — Social & Shared Finance (v2.5)

**Goal:** Money is social. Roommates, couples, and families need shared tools.

- [ ] **Shared budgets** — invite someone to co-track a budget (e.g., household expenses)
- [ ] **Split expenses** — "Split $120 dinner 3 ways" with tracking of who owes what
- [ ] **Family mode** — shared dashboard for household with individual + joint views
- [ ] **Leaderboard/challenges** — compete with friends on savings goals
- [ ] **Supabase/Firebase backend** — cloud sync, authentication, multi-device

---

## Phase 6 — Financial Integrations (v3.0)

**Goal:** Reduce manual entry to near-zero.

- [ ] **Bank connection** (Plaid API) — auto-import transactions from bank accounts
- [x] **SMS parsing** (Android) — read bank SMS notifications and auto-create entries
- [x] **Currency conversion** — real-time exchange rates for multi-currency users
- [ ] **Crypto wallet tracking** — connect wallets, track portfolio alongside fiat
- [ ] **Investment tracking** — basic portfolio value tracking

---

## Phase 7 — Monetization & Growth (v3.5)

- [ ] **Freemium model:**
  - Free: core tracking, 3 budgets, 2 savings goals, basic insights
  - Pro ($2.99/mo): unlimited everything, AI coach, export, bank sync
- [ ] **App Store & Play Store** launch with ASO
- [ ] **Referral program** — invite friends for free Pro month
- [ ] **Widget** — iOS/Android home screen widget showing today's spending + balance
- [ ] **Apple Watch / Wear OS** — quick-add from wrist

---

## Priority Matrix

| Impact  | Effort  | Feature                                                    |
| ------- | ------- | ---------------------------------------------------------- |
| 🔴 High | 🟢 Low  | Haptic feedback, swipe-to-delete, date picker              |
| 🔴 High | 🟡 Med  | Recurring transactions, onboarding flow, AI local insights |
| 🔴 High | 🔴 High | AI chat coach, bank connection, export                     |
| 🟡 Med  | 🟢 Low  | Quick-add templates, pull-to-refresh, undo snackbar        |
| 🟡 Med  | 🟡 Med  | Category management, tags, receipt photos                  |
| 🟡 Med  | 🔴 High | Shared budgets, family mode, cloud sync                    |

---

## Recommended Next Sprint (2 weeks)

1. **Haptic feedback** across all interactive elements
2. **Onboarding flow** (name + currency + first budget)
3. **Swipe-to-delete** on transactions
4. **Date picker** for transaction entry
5. **Local AI insights v1** (anomaly detection + budget forecasting + health score)
6. **Category management** screen (add/edit custom categories)

This sprint alone will make the app feel production-ready and differentiated from basic trackers.
