/**
 * TipL — Push Notification Service
 * Registers Expo push token, schedules local notifications,
 * and handles foreground/background notification events.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { upsertPushToken, deletePushToken } from '@/src/services/supabase/pushTokens';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Request permission and register the Expo push token for a user. */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TipL Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4A265',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await upsertPushToken(userId, token, Platform.OS as 'ios' | 'android');

  return token;
}

/** Unregister push token on logout. */
export async function unregisterPushToken(userId: string): Promise<void> {
  await deletePushToken(userId, Platform.OS as 'ios' | 'android');
}

/** Schedule a local notification for a new chat message. */
export async function scheduleNewMessageNotification(
  senderName: string,
  text: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: senderName,
      body: text.length > 80 ? text.slice(0, 77) + '...' : text,
      sound: true,
      data: { type: 'chat' },
    },
    trigger: null,
  });
}

/** Schedule a local notification for an order status change. */
export async function scheduleOrderStatusNotification(
  orderNumber: string,
  statusLabel: string,
  orderId: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Order ${orderNumber}`,
      body: statusLabel,
      sound: true,
      data: { type: 'order', orderId },
    },
    trigger: null,
  });
}

/** Schedule a trip departure reminder for the day before departure. */
export async function scheduleTripDepartureReminder(
  tripId: string,
  destination: string,
  departureDate: number,
): Promise<string> {
  const reminderDate = new Date(departureDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Trip Reminder',
      body: `Your trip to ${destination} departs tomorrow. Bon voyage!`,
      sound: true,
      data: { type: 'trip', tripId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  return identifier;
}

/** Cancel a previously scheduled notification. */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
