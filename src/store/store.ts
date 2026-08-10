import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import aiCoachReducer from "./slices/aiCoachSlice";
import budgetReducer from "./slices/budgetSlice";
import categoryReducer from "./slices/categorySlice";
import challengeReducer from "./slices/challengeSlice";
import expenseReducer from "./slices/expenseSlice";
import incomeReducer from "./slices/incomeSlice";
import incomeSourcesReducer from "./slices/incomeSourcesSlice";
import recurringReducer from "./slices/recurringSlice";
import savingsReducer from "./slices/savingsSlice";
import settingsReducer from "./slices/settingsSlice";
import tagReducer from "./slices/tagSlice";
import templateReducer from "./slices/templateSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  whitelist: [
    "expenses",
    "categories",
    "budgets",
    "settings",
    "incomes",
    "savings",
    "recurring",
    "templates",
    "aiCoach",
    "tags",
    "challenges",
    "incomeSources",
  ],
};

const rootReducer = combineReducers({
  expenses: expenseReducer,
  categories: categoryReducer,
  budgets: budgetReducer,
  settings: settingsReducer,
  incomes: incomeReducer,
  savings: savingsReducer,
  recurring: recurringReducer,
  templates: templateReducer,
  aiCoach: aiCoachReducer,
  tags: tagReducer,
  challenges: challengeReducer,
  incomeSources: incomeSourcesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: [
          "expenses.expenses",
          "incomes.incomes",
          "budgets.budgets",
          "recurring.transactions",
          "savings.goals",
          "challenges.challenges",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
