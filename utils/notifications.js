import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder() {
  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily at 8 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Log your expenses!',
      body: 'Keep your streak going! Add today\'s transactions.',
      sound: true,
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

export async function sendStreakNotification(days) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔥 ${days} Day Streak!`,
      body: 'Amazing! Keep tracking your expenses daily.',
      sound: true,
    },
    trigger: null, // Send immediately
  });
}