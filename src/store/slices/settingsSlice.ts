import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_CURRENCY } from "../../constants/categories";

interface SettingsState {
  currency: string;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  currency: DEFAULT_CURRENCY,
  isDarkMode: false,
  notificationsEnabled: true,
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
  },
});

export const { setCurrency, toggleDarkMode, setDarkMode, toggleNotifications } =
  settingsSlice.actions;

export default settingsSlice.reducer;
