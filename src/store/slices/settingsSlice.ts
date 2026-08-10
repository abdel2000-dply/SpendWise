import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_CURRENCY } from "../../constants/categories";

interface SettingsState {
  currency: string;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  // Onboarding
  userName: string;
  hasCompletedOnboarding: boolean;
  // AI Coach
  groqApiKey: string;
  aiCoachEnabled: boolean;
  // Recurring
  recurringEnabled: boolean;
  // Smart defaults
  lastUsedCategoryId: string;
  lastUsedSourceId: string;
  // Privacy & sync
  analyticsEnabled: boolean;
  wifiBackupEnabled: boolean;
}

const initialState: SettingsState = {
  currency: DEFAULT_CURRENCY,
  isDarkMode: false,
  notificationsEnabled: true,
  userName: "",
  hasCompletedOnboarding: false,
  groqApiKey: "",
  aiCoachEnabled: false,
  recurringEnabled: true,
  lastUsedCategoryId: "",
  lastUsedSourceId: "",
  analyticsEnabled: false,
  wifiBackupEnabled: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    setGroqApiKey: (state, action: PayloadAction<string>) => {
      state.groqApiKey = action.payload;
    },
    toggleAiCoach: (state) => {
      state.aiCoachEnabled = !state.aiCoachEnabled;
    },
    toggleRecurring: (state) => {
      state.recurringEnabled = !state.recurringEnabled;
    },
    setLastUsedCategoryId: (state, action: PayloadAction<string>) => {
      state.lastUsedCategoryId = action.payload;
    },
    setLastUsedSourceId: (state, action: PayloadAction<string>) => {
      state.lastUsedSourceId = action.payload;
    },
    toggleAnalytics: (state) => {
      state.analyticsEnabled = !state.analyticsEnabled;
    },
    toggleWifiBackup: (state) => {
      state.wifiBackupEnabled = !state.wifiBackupEnabled;
    },
  },
});

export const {
  setCurrency,
  toggleDarkMode,
  setDarkMode,
  toggleNotifications,
  setUserName,
  completeOnboarding,
  setGroqApiKey,
  toggleAiCoach,
  toggleRecurring,
  setLastUsedCategoryId,
  setLastUsedSourceId,
  toggleAnalytics,
  toggleWifiBackup,
} = settingsSlice.actions;

export default settingsSlice.reducer;
