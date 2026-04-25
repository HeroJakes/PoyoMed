import { DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { registerForPushNotificationsAsync, setupNotificationCategories, setupNotificationHandler } from '../utils/notificationUtils';

import { ThemeProvider } from '../context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize notification handler
setupNotificationHandler();

// Force light theme for React Navigation
const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFBF7',
  },
};

function InnerLayout() {
  const router = useRouter();
  const responseListener = useRef();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
    setupNotificationCategories();

    // Handle user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data;

      if (actionIdentifier === 'TAKEN_ACTION') {
        // Navigate to medicine details
        if (data.medicineId) {
          router.push('/(tabs)/medicines');
          setTimeout(() => {
            alert(`Marked ${data.medicineName || 'medicine'} as taken!`);
          }, 500);
        }
      } else if (actionIdentifier === 'SNOOZE_ACTION') {
        // Schedule a new notification for 10 minutes later
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Snoozed Reminder",
            body: `Don't forget to take your ${data.medicineName || 'medicine'}!`,
            sound: true,
            data: data,
            categoryIdentifier: 'MEDICATION_REMINDER',
          },
          trigger: {
            seconds: 60 * 10, // 10 minutes
          },
        });
        alert("Reminder snoozed for 10 minutes.");
      } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        // User tapped the notification body
        router.push('/(tabs)/medicines');
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NavThemeProvider value={LightNavTheme}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFBF7" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="add-medicine" options={{ headerShown: false }} />
        <Stack.Screen name="medicine-details" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  // On web: center the app in a max-width container so it doesn't stretch across the full desktop
  if (Platform.OS === 'web') {
    return (
      <ThemeProvider>
        <View style={styles.webWrapper}>
          <View style={styles.webContainer}>
            <InnerLayout />
          </View>
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#E8E0D8',
    alignItems: 'center',
  },
  webContainer: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    overflow: 'hidden',
  },
});
