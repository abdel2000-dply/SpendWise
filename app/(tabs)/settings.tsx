import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Divider, List, Snackbar, Switch } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../src/components/atoms/Card";
import { CURRENCY_SYMBOLS } from "../../src/constants/categories";
import { useAppDispatch, useAppSelector } from "../../src/hooks/useRedux";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import {
    downloadLatestBackup,
    isCloudBackupConfigured,
    pruneOldBackups,
    uploadBackup,
} from "../../src/services/cloudBackup";
import { getDeviceId } from "../../src/services/deviceId";
import { getApiKey } from "../../src/services/groqService";
import {
    deleteGroqApiKey,
    loadGroqApiKey,
    saveGroqApiKey,
} from "../../src/services/secureStorage";
import { setBudgets } from "../../src/store/slices/budgetSlice";
import { setCategories } from "../../src/store/slices/categorySlice";
import { setChallenges } from "../../src/store/slices/challengeSlice";
import { setExpenses } from "../../src/store/slices/expenseSlice";
import { setIncomes } from "../../src/store/slices/incomeSlice";
import { setTransactions as setRecurring } from "../../src/store/slices/recurringSlice";
import { setGoals } from "../../src/store/slices/savingsSlice";
import {
    setCurrency,
    setUserName,
    toggleAiCoach,
    toggleAnalytics,
    toggleDarkMode,
    toggleNotifications,
    toggleRecurring,
    toggleWifiBackup,
} from "../../src/store/slices/settingsSlice";
import { setTags } from "../../src/store/slices/tagSlice";
import { setTemplates } from "../../src/store/slices/templateSlice";
import { spacing, typography } from "../../src/theme/theme";

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isDarkMode = useAppSelector((state) => state.settings.isDarkMode);
  const currency = useAppSelector((state) => state.settings.currency);
  const groqApiKey = useAppSelector((state) => state.settings.groqApiKey); // kept for redux-persist migration only, UI uses SecureStore
  const aiCoachEnabled = useAppSelector(
    (state) => state.settings.aiCoachEnabled,
  );
  const recurringEnabled = useAppSelector(
    (state) => state.settings.recurringEnabled,
  );
  const notificationsEnabled = useAppSelector(
    (state) => state.settings.notificationsEnabled,
  );
  const analyticsEnabled = useAppSelector(
    (state) => state.settings.analyticsEnabled,
  );
  const wifiBackupEnabled = useAppSelector(
    (state) => state.settings.wifiBackupEnabled,
  );
  const userName = useAppSelector((state) => state.settings.userName);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.incomes.incomes);
  const categories = useAppSelector((state) => state.categories.categories);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const savingsGoals = useAppSelector((state) => state.savings.goals);
  const recurringTxs = useAppSelector((state) => state.recurring.transactions);
  const templates = useAppSelector((state) => state.templates.templates);
  const tags = useAppSelector((state) => state.tags.tags);
  const challenges = useAppSelector((state) => state.challenges.challenges);
  const colors = useThemeColors();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [nameInput, setNameInput] = useState(userName || "");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const hasEnvKey = !!getApiKey();
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Load API key from SecureStore on mount
  React.useEffect(() => {
    loadGroqApiKey().then((key) => {
      if (key) setApiKeyInput(key);
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
  };

  const handleCurrencyChange = () => {
    setCurrencyModalVisible(true);
  };

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      await saveGroqApiKey(trimmed);
      showToast("API key saved securely");
    } else {
      await deleteGroqApiKey();
      showToast("API key removed");
    }
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    dispatch(setUserName(trimmed));
    showToast(trimmed ? `Name updated to "${trimmed}"` : "Name cleared");
  };

  const handleBackup = async () => {
    try {
      const data = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        expenses,
        incomes,
        categories,
        budgets,
        savingsGoals,
        recurringTxs,
        templates,
        tags,
        challenges,
      };
      const json = JSON.stringify(data, null, 2);
      const date = new Date().toISOString().split("T")[0];
      const file = new File(Paths.cache, `spendwise_backup_${date}.json`);
      file.write(json);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, { mimeType: "application/json" });
        showToast("Backup shared successfully");
      } else {
        Alert.alert("Backup saved", `File saved to: ${file.uri}`);
      }
    } catch (e: any) {
      Alert.alert("Error", `Backup failed: ${e.message}`);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const fileUri = result.assets[0].uri;
      const restoreFile = new File(fileUri);
      const json = await restoreFile.text();
      const data = JSON.parse(json);
      Alert.alert(
        "Restore Data",
        "This will overwrite your current expenses, incomes, categories, and budgets. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Restore",
            style: "destructive",
            onPress: () => {
              try {
                if (!data.version || !Array.isArray(data.expenses)) {
                  Alert.alert("Error", "Invalid backup file format");
                  return;
                }
                if (Array.isArray(data.expenses))
                  dispatch(setExpenses(data.expenses));
                if (Array.isArray(data.incomes))
                  dispatch(setIncomes(data.incomes));
                if (Array.isArray(data.categories))
                  dispatch(setCategories(data.categories));
                if (Array.isArray(data.budgets))
                  dispatch(setBudgets(data.budgets));
                if (Array.isArray(data.savingsGoals))
                  dispatch(setGoals(data.savingsGoals));
                if (Array.isArray(data.recurringTxs))
                  dispatch(setRecurring(data.recurringTxs));
                if (Array.isArray(data.templates))
                  dispatch(setTemplates(data.templates));
                if (Array.isArray(data.tags)) dispatch(setTags(data.tags));
                if (Array.isArray(data.challenges))
                  dispatch(setChallenges(data.challenges));
                showToast("Data restored successfully");
              } catch {
                Alert.alert("Error", "Failed to apply restore data");
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert("Error", `Restore failed: ${e.message}`);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* App Info */}
        <Card style={styles.card}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>SpendWise</Text>
            <Text style={[styles.appTagline, { color: colors.text }]}>
              Smart spending, Better saving
            </Text>
            <Text style={[styles.appVersion, { color: colors.textLight }]}>
              Version 1.0.0
            </Text>
          </View>
        </Card>

        {/* Profile */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              Profile
            </List.Subheader>
            <View style={styles.nameContainer}>
              <Text style={[styles.apiKeyLabel, { color: colors.text }]}>
                Your Name
              </Text>
              <View style={styles.nameRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g., Alex"
                  placeholderTextColor={colors.textLight}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                  onBlur={handleSaveName}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveName}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </List.Section>
        </Card>

        {/* General Settings */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              General
            </List.Subheader>

            <List.Item
              title="Currency"
              description={`${currency} (${CURRENCY_SYMBOLS[currency]})`}
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
              onPress={handleCurrencyChange}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Currency Converter"
              description="Convert between supported currencies"
              left={(props) => <List.Icon {...props} icon="swap-horizontal" />}
              onPress={() => router.push("/currency-converter")}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Dark Mode"
              description="Toggle dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={() => {
                    dispatch(toggleDarkMode());
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Manage Categories"
              description="Add, edit, or remove expense categories"
              left={(props) => <List.Icon {...props} icon="shape" />}
              onPress={() => router.push("/category-manager")}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Manage Income Sources"
              description="Add, edit, or remove income sources"
              left={(props) => <List.Icon {...props} icon="cash-multiple" />}
              onPress={() => router.push("/income-sources-manager" as any)}
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>

        {/* Notifications */}
        <Card
          style={[
            styles.card,
            {
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              backgroundColor: colors.primary + "0D",
            },
          ]}
        >
          <List.Section>
            <List.Subheader style={{ color: colors.primary }}>
              Notifications
            </List.Subheader>
            <List.Item
              title="Bill Reminders & Alerts"
              description="Get notified about upcoming bills and budget limits"
              left={(props) => (
                <List.Icon {...props} icon="bell-ring" color={colors.primary} />
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={async () => {
                    if (!notificationsEnabled) {
                      const { requestNotificationPermissions } =
                        await import("../../src/services/notificationService");
                      const granted = await requestNotificationPermissions();
                      if (!granted) {
                        showToast(
                          "Permission denied — enable notifications in device Settings",
                        );
                        return;
                      }
                    }
                    dispatch(toggleNotifications());
                    showToast(
                      !notificationsEnabled
                        ? "Notifications enabled"
                        : "Notifications disabled",
                    );
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>

        {/* AI Coach */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              AI Coach
            </List.Subheader>

            <List.Item
              title="AI Coach"
              description="Get personalized financial advice"
              left={(props) => <List.Icon {...props} icon="robot" />}
              right={() => (
                <Switch
                  value={aiCoachEnabled}
                  onValueChange={() => {
                    dispatch(toggleAiCoach());
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <View style={styles.apiKeyContainer}>
              <Text style={[styles.apiKeyLabel, { color: colors.text }]}>
                Groq API Key
              </Text>
              <View style={styles.apiKeyRow}>
                <TextInput
                  style={[
                    styles.apiKeyInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="gsk_..."
                  placeholderTextColor={colors.textLight}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text
                style={[styles.apiKeyHint, { color: colors.primary }]}
                onPress={handleSaveApiKey}
              >
                Save Key
              </Text>
              {hasEnvKey && (
                <Text style={[styles.apiKeyHint, { color: colors.success }]}>
                  ✓ Using API key from .env file
                </Text>
              )}
              {!hasEnvKey && !apiKeyInput && (
                <Text style={[styles.apiKeyHint, { color: colors.textLight }]}>
                  You can also set EXPO_PUBLIC_GROQ_API_KEY in .env
                </Text>
              )}
            </View>

            <Divider />

            <List.Item
              title="Open AI Coach"
              description="Chat with your financial advisor"
              left={(props) => <List.Icon {...props} icon="chat" />}
              onPress={() => router.push("/ai-coach")}
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>

        {/* Automation */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              Automation
            </List.Subheader>

            <List.Item
              title="Recurring Transactions"
              description="Auto-track bills & subscriptions"
              left={(props) => <List.Icon {...props} icon="repeat" />}
              right={() => (
                <Switch
                  value={recurringEnabled}
                  onValueChange={() => {
                    dispatch(toggleRecurring());
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Manage Recurring"
              description="View and edit recurring transactions"
              left={(props) => <List.Icon {...props} icon="calendar-clock" />}
              onPress={() => router.push("/recurring")}
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              Data & Privacy
            </List.Subheader>

            <List.Item
              title="Export Data"
              description="Export transactions to CSV"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={() => router.push("/export")}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Backup Data"
              description="Save all data as a JSON backup file"
              left={(props) => <List.Icon {...props} icon="backup-restore" />}
              onPress={handleBackup}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Restore Data"
              description="Restore from a JSON backup file"
              left={(props) => <List.Icon {...props} icon="upload" />}
              onPress={handleRestore}
              titleStyle={{ color: colors.text }}
            />

            {isCloudBackupConfigured() && (
              <>
                <Divider />
                <List.Item
                  title="Backup to Cloud"
                  description="Upload all data to your Supabase backup"
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="cloud-upload"
                      color={colors.primary}
                    />
                  )}
                  titleStyle={{ color: colors.text }}
                  onPress={async () => {
                    try {
                      const userId = await getDeviceId();
                      const backupData = {
                        version: "1.0.0",
                        exportedAt: new Date().toISOString(),
                        expenses,
                        incomes,
                        categories,
                        budgets,
                        savingsGoals,
                        recurringTxs,
                        templates,
                        tags,
                        challenges,
                      };
                      const ok = await uploadBackup(backupData, userId);
                      showToast(
                        ok
                          ? "Cloud backup successful ✓"
                          : "Cloud backup failed",
                      );
                      if (ok) pruneOldBackups(userId);
                    } catch {
                      showToast("Cloud backup failed");
                    }
                  }}
                />
                <Divider />
                <List.Item
                  title="Restore from Cloud"
                  description="Download your latest cloud backup"
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="cloud-download"
                      color={colors.primary}
                    />
                  )}
                  titleStyle={{ color: colors.text }}
                  onPress={async () => {
                    try {
                      const userId = await getDeviceId();
                      const data = await downloadLatestBackup(userId);
                      if (!data) {
                        Alert.alert(
                          "No Backup Found",
                          "No cloud backup exists for this device.",
                        );
                        return;
                      }
                      Alert.alert(
                        "Restore from Cloud",
                        `Backup from ${new Date((data as any).exportedAt || Date.now()).toLocaleDateString()}. This will overwrite your current data.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Restore",
                            style: "destructive",
                            onPress: () => {
                              try {
                                if (
                                  !data.version ||
                                  !Array.isArray(data.expenses)
                                ) {
                                  Alert.alert("Error", "Invalid backup format");
                                  return;
                                }
                                if (Array.isArray(data.expenses))
                                  dispatch(setExpenses(data.expenses as any));
                                if (Array.isArray(data.incomes))
                                  dispatch(setIncomes(data.incomes as any));
                                if (Array.isArray(data.categories))
                                  dispatch(
                                    setCategories(data.categories as any),
                                  );
                                if (Array.isArray(data.budgets))
                                  dispatch(setBudgets(data.budgets as any));
                                if (Array.isArray(data.savingsGoals))
                                  dispatch(setGoals(data.savingsGoals as any));
                                if (Array.isArray(data.recurringTxs))
                                  dispatch(
                                    setRecurring(data.recurringTxs as any),
                                  );
                                if (Array.isArray(data.templates))
                                  dispatch(setTemplates(data.templates as any));
                                if (Array.isArray(data.tags))
                                  dispatch(setTags(data.tags as any));
                                if (Array.isArray(data.challenges))
                                  dispatch(
                                    setChallenges(data.challenges as any),
                                  );
                                showToast("Cloud data restored successfully ✓");
                              } catch {
                                Alert.alert(
                                  "Error",
                                  "Failed to apply cloud backup",
                                );
                              }
                            },
                          },
                        ],
                      );
                    } catch {
                      showToast("Failed to download cloud backup");
                    }
                  }}
                />
              </>
            )}

            <Divider />

            <List.Item
              title="Import from SMS"
              description="Parse bank SMS to add transactions"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              onPress={() => router.push("/sms-parser")}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Clear All Data"
              description="Permanently delete all expenses and incomes"
              left={(props) => (
                <List.Icon {...props} icon="delete" color={colors.error} />
              )}
              titleStyle={{ color: colors.error }}
              onPress={() => {
                // Step 1: initial warning
                Alert.alert(
                  "Clear All Data",
                  "This will permanently delete ALL your expenses, incomes, budgets, and savings goals. This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Continue",
                      style: "destructive",
                      onPress: () => {
                        // Step 2: final confirmation
                        Alert.alert(
                          "Are you absolutely sure?",
                          "Tap DELETE to permanently erase all financial data from this device.",
                          [
                            { text: "Go Back", style: "cancel" },
                            {
                              text: "DELETE",
                              style: "destructive",
                              onPress: () => {
                                dispatch(setExpenses([]));
                                dispatch(setIncomes([]));
                                dispatch(setBudgets([]));
                                dispatch(setCategories([]));
                                // hasCompletedOnboarding intentionally NOT cleared
                                // so user doesn't get sent back to onboarding
                                showToast("All data cleared");
                              },
                            },
                          ],
                        );
                      },
                    },
                  ],
                );
              }}
            />
          </List.Section>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              Privacy & Sync
            </List.Subheader>

            <List.Item
              title="Share anonymous usage data"
              description="Help improve SpendWise by sending crash reports and usage stats. No financial data is ever shared."
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
              right={() => (
                <Switch
                  value={analyticsEnabled}
                  onValueChange={() => {
                    dispatch(toggleAnalytics());
                    showToast(
                      !analyticsEnabled
                        ? "Anonymous analytics enabled — thank you!"
                        : "Analytics disabled",
                    );
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Auto-backup on Wi-Fi"
              description={
                isCloudBackupConfigured()
                  ? "Backs up your data to the cloud when on Wi-Fi"
                  : "Requires EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
              }
              left={(props) => <List.Icon {...props} icon="wifi" />}
              right={() => (
                <Switch
                  value={wifiBackupEnabled}
                  onValueChange={async () => {
                    const enabling = !wifiBackupEnabled;
                    dispatch(toggleWifiBackup());
                    if (enabling && isCloudBackupConfigured()) {
                      try {
                        const userId = await getDeviceId();
                        const backupData = {
                          version: "1.0.0",
                          exportedAt: new Date().toISOString(),
                          expenses,
                          incomes,
                          categories,
                          budgets,
                          savingsGoals,
                          recurringTxs,
                          templates,
                          tags,
                          challenges,
                        };
                        const ok = await uploadBackup(backupData, userId);
                        showToast(
                          ok ? "Backed up to cloud ✓" : "Cloud backup failed",
                        );
                        if (ok) pruneOldBackups(userId);
                      } catch {
                        showToast("Cloud backup failed");
                      }
                    } else {
                      showToast(
                        enabling
                          ? "Auto Wi-Fi backup enabled"
                          : "Auto Wi-Fi backup disabled",
                      );
                    }
                  }}
                />
              )}
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>
              About
            </List.Subheader>

            <List.Item
              title="Spending Challenges"
              description="Set and track financial goals"
              left={(props) => <List.Icon {...props} icon="trophy" />}
              onPress={() => router.push("/challenges")}
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Help & Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() =>
                Alert.alert("Support", "Contact us at support@spendwise.app")
              }
              titleStyle={{ color: colors.text }}
            />

            <Divider />

            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              onPress={() =>
                Alert.alert(
                  "Privacy",
                  "Your data is stored locally on your device. Nothing is shared.",
                )
              }
              titleStyle={{ color: colors.text }}
            />
          </List.Section>
        </Card>
      </ScrollView>

      <Snackbar
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
        duration={2200}
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
        theme={{ colors: { inversePrimary: colors.primary } }}
      >
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>
          {toast}
        </Text>
      </Snackbar>

      {/* Currency Picker Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
        />
        <View
          style={[
            styles.currencySheet,
            {
              backgroundColor: isDarkMode ? "#1C1C1E" : "#FFFFFF",
              borderTopColor: colors.primary,
              borderTopWidth: 3,
            },
          ]}
        >
          <Text style={[styles.currencySheetTitle, { color: colors.text }]}>
            Select Currency
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyRow,
                  currency === curr && {
                    backgroundColor: colors.primary + "15",
                    borderRadius: 10,
                  },
                ]}
                onPress={() => {
                  dispatch(setCurrency(curr));
                  setCurrencyModalVisible(false);
                  showToast(
                    `Currency changed to ${curr} (${CURRENCY_SYMBOLS[curr]})`,
                  );
                }}
              >
                <Text style={[styles.currencyCode, { color: colors.text }]}>
                  {curr}
                </Text>
                <Text
                  style={[styles.currencySymbol, { color: colors.textLight }]}
                >
                  {CURRENCY_SYMBOLS[curr]}
                </Text>
                {currency === curr && (
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 18,
                      marginLeft: "auto",
                    }}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.currencyCancel, { borderTopColor: colors.border }]}
            onPress={() => setCurrencyModalVisible(false)}
          >
            <Text
              style={{ color: colors.primary, fontWeight: "600", fontSize: 15 }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  appInfo: {
    padding: spacing.lg,
    alignItems: "center",
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: "#6C63FF",
    marginBottom: spacing.xs,
  },
  appTagline: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  appVersion: {
    fontSize: typography.fontSize.sm,
  },
  nameContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: typography.fontSize.md,
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: typography.fontSize.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  currencySheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    maxHeight: "60%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  currencySheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: "600",
    width: 52,
  },
  currencySymbol: {
    fontSize: 15,
  },
  currencyCancel: {
    borderTopWidth: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  apiKeyContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  apiKeyLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  apiKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: typography.fontSize.sm,
  },
  apiKeyHint: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
    textAlign: "right",
  },
});
