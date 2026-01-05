import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider, List, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../src/components/atoms/Card';
import { CURRENCY_SYMBOLS } from '../../src/constants/categories';
import { Colors } from '../../src/constants/colors';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { setCurrency, toggleDarkMode } from '../../src/store/slices/settingsSlice';
import { spacing, typography } from '../../src/theme/theme';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.settings.isDarkMode);
  const currency = useAppSelector((state) => state.settings.currency);
  const colors = useThemeColors();

  const handleCurrencyChange = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      Object.keys(CURRENCY_SYMBOLS).map((curr) => ({
        text: `${curr} (${CURRENCY_SYMBOLS[curr]})`,
        onPress: () => dispatch(setCurrency(curr)),
      }))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* App Info */}
        <Card style={styles.card}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>SpendWise</Text>
            <Text style={[styles.appTagline, { color: colors.text }]}>Smart spending, Better saving</Text>
            <Text style={[styles.appVersion, { color: colors.text }]}>Version 1.0.0 MVP</Text>
          </View>
        </Card>

        {/* General Settings */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>General</List.Subheader>
            
            <List.Item
              title="Currency"
              description={`${currency} (${CURRENCY_SYMBOLS[currency]})`}
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
              onPress={handleCurrencyChange}
              titleStyle={{ color: Colors.text }}
            />
            
            <Divider />
            
            <List.Item
              title="Dark Mode"
              description="Toggle dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={(value) => dispatch(toggleDarkMode())}
                />
              )}
              titleStyle={{ color: Colors.text }}
            />
          </List.Section>
        </Card>

        {/* Data & Privacy */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>Data & Privacy</List.Subheader>
            
            <List.Item
              title="Export Data"
              description="Export your expenses to CSV"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={() => Alert.alert('Coming Soon', 'Export feature will be available soon!')}
              titleStyle={{ color: Colors.text }}
            />
            
            <Divider />
            
            <List.Item
              title="Clear All Data"
              description="Delete all expenses"
              left={(props) => <List.Icon {...props} icon="delete" color={Colors.error} />}
              titleStyle={{ color: Colors.error }}
              onPress={() => {
                Alert.alert(
                  'Clear All Data',
                  'Are you sure? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => Alert.alert('Feature', 'This will be implemented in next version'),
                    },
                  ]
                );
              }}
            />
          </List.Section>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.text }}>About</List.Subheader>
            
            <List.Item
              title="Rate App"
              left={(props) => <List.Icon {...props} icon="star" />}
              onPress={() => Alert.alert('Thank You!', 'Rate us on the App Store')}
              titleStyle={{ color: Colors.text }}
            />
            
            <Divider />
            
            <List.Item
              title="Help & Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() => Alert.alert('Support', 'Contact us at support@spendwise.app')}
              titleStyle={{ color: Colors.text }}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              onPress={() => Alert.alert('Privacy', 'Your data is stored locally on your device')}
              titleStyle={{ color: Colors.text }}
            />
          </List.Section>
        </Card>
      </ScrollView>
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
    alignItems: 'center',
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: spacing.xs,
  },
  appTagline: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  appVersion: {
    fontSize: typography.fontSize.sm,
  },
});
