import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// Temporarily removed reanimated to fix Worklets error
// import 'react-native-reanimated';

import { persistor, RootState, store } from '../src/store/store';
import { darkTheme, lightTheme } from '../src/theme/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const isDarkMode = useSelector((state: RootState) => state.settings.isDarkMode);
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'Add Expense',
              headerShown: true,
            }} 
          />
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </PaperProvider>
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
