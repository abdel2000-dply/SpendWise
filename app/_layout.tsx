import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useRef } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { Colors } from "../src/constants/colors";
import { scheduleAllBillReminders } from "../src/services/notificationService";
import { persistor, RootState, store } from "../src/store/store";
import { darkTheme, lightTheme } from "../src/theme/theme";

// Suppress non-fatal serialisation warnings from redux-persist
LogBox.ignoreLogs([
  "A non-serializable value was detected in an action",
  "Method writeAsStringAsync imported from",
  "is deprecated",
]);

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const isDarkMode = useSelector(
    (state: RootState) => state.settings.isDarkMode,
  );
  const hasCompletedOnboarding = useSelector(
    (state: RootState) => state.settings.hasCompletedOnboarding,
  );
  const notificationsEnabled = useSelector(
    (state: RootState) => state.settings.notificationsEnabled,
  );
  const recurringTransactions = useSelector(
    (state: RootState) => state.recurring.transactions,
  );
  const currency = useSelector((state: RootState) => state.settings.currency);
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Sync Android navigation bar color with theme to prevent bottom color mismatch
  useEffect(() => {
    const navBarColor = isDarkMode ? Colors.cardDark : Colors.card;
    SystemUI.setBackgroundColorAsync(navBarColor).catch(() => {});
  }, [isDarkMode]);

  useEffect(() => {
    if (!hasCompletedOnboarding && segments[0] !== "onboarding") {
      router.replace("/onboarding");
    }
  }, [hasCompletedOnboarding, segments]);

  // Set up notification listeners
  useEffect(() => {
    try {
      notificationListener.current =
        Notifications.addNotificationReceivedListener(() => {});

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          if (data?.type === "bill-reminder") {
            router.push("/recurring");
          }
        });
    } catch (e) {
      console.warn("Notifications not supported:", e);
    }

    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch (e) {
        // removeNotificationSubscription removed in SDK 53 Expo Go
      }
    };
  }, []);

  // Schedule bill reminders when recurring transactions change
  useEffect(() => {
    if (notificationsEnabled && recurringTransactions.length > 0) {
      try {
        scheduleAllBillReminders(recurringTransactions, currency);
      } catch (e) {
        // Notifications not fully supported in Expo Go
      }
    }
  }, [recurringTransactions, notificationsEnabled, currency]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Add Transaction",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="add-budget"
              options={{
                presentation: "modal",
                title: "Add Budget",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="add-goal"
              options={{
                presentation: "modal",
                title: "New Savings Goal",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="add-contribution"
              options={{
                presentation: "modal",
                title: "Add Contribution",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="ai-coach"
              options={{
                presentation: "modal",
                title: "AI Coach",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="recurring"
              options={{
                presentation: "modal",
                title: "Recurring Transactions",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="export"
              options={{
                presentation: "modal",
                title: "Export Data",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="category-manager"
              options={{
                presentation: "modal",
                title: "Manage Categories",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="income-sources-manager"
              options={{
                presentation: "modal",
                title: "Manage Income Sources",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="templates"
              options={{
                presentation: "modal",
                title: "Quick Templates",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="sms-parser"
              options={{
                presentation: "modal",
                title: "Import from SMS",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="reports"
              options={{
                presentation: "modal",
                title: "Reports",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="batch-entry"
              options={{
                presentation: "modal",
                title: "Batch Entry",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="challenges"
              options={{
                presentation: "modal",
                title: "Spending Challenges",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="currency-converter"
              options={{
                presentation: "modal",
                title: "Currency Converter",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="add-recurring"
              options={{
                presentation: "modal",
                title: "Add Recurring Transaction",
                headerShown: true,
              }}
            />
          </Stack>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
