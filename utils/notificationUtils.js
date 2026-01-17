import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        // token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        // alert('Must use physical device for Push Notifications');
    }

    return token;
}

export function setupNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export async function setupNotificationCategories() {
    await Notifications.setNotificationCategoryAsync('MEDICATION_REMINDER', [
        {
            identifier: 'TAKEN_ACTION',
            buttonTitle: 'Taken',
            options: {
                opensAppToForeground: true,
            },
        },
        {
            identifier: 'SNOOZE_ACTION',
            buttonTitle: 'Snooze 10m',
            options: {
                opensAppToForeground: false,
            },
        },
    ]);
}

export async function scheduleMedicationReminder(medicine) {
    // Cancel existing notifications for this medicine (simple approach: cancel all and reschedule, 
    // or better: store notification IDs. For now, we'll just schedule new ones. 
    // In a real app, you'd want to track IDs to cancel specific ones.)

    // Note: To properly manage cancellations, we should ideally store notification IDs in Firestore.
    // For this implementation, we will assume the user is adding/editing and we just schedule.
    // A robust solution would require fetching existing IDs and cancelling them first.

    if (!medicine.times || medicine.times.length === 0) return;

    for (const timeStr of medicine.times) {
        const match = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (!match) continue;

        let [_, hours, minutes, modifier] = match;
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        modifier = modifier.toUpperCase();

        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours !== 12 && modifier === 'PM') hours += 12;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Medication Reminder",
                body: `Time to take your ${medicine.name} (${medicine.dosage})`,
                sound: true,
                data: {
                    medicineId: medicine.id,
                    medicineName: medicine.name,
                    scheduledTime: timeStr // Pass the time string (e.g., "08:00 AM")
                },
                categoryIdentifier: 'MEDICATION_REMINDER',
                // Required for Android
                channelId: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: hours,
                minute: minutes,
            },
        });
    }
}
