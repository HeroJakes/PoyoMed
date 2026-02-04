import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';
import { registerForPushNotificationsAsync, setupNotificationCategories, setupNotificationHandler } from '../utils/notificationUtils';

import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize notification handler
setupNotificationHandler();

function InnerLayout() {
  const router = useRouter();
  const responseListener = useRef();
  const { theme } = useTheme();

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
          // In a real app, we would mark it as taken in the database here.
          // For now, we'll just show a confirmation.
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
    <>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="add-medicine" options={{ headerShown: false }} />
        <Stack.Screen name="medicine-details" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}
