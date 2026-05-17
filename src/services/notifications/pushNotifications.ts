/**
 * TipL — Push Notification Service
 * expo-notifications static import crash di Expo Go SDK 53+.
 * Semua usage dibungkus lazy require yang di-guard isExpoGo,
 * sehingga module effect (PushTokenAutoRegistration) tidak pernah jalan di Expo Go.
 */

import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { upsertPushToken, deletePushToken } from '@/src/services/supabase/pushTokens';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

type N = typeof import('expo-notifications');

function notifs(): N {
  return require('expo-notifications') as N;
}

/** Setup foreground notification handler — panggil sekali di app init (dev build only). */
export function setupNotificationHandler(): void {
  if (isExpoGo) return;
  notifs().setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Request permission dan register Expo push token untuk user. */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice || isExpoGo) return null;

  const N = notifs();

  const { status: existingStatus } = await N.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'TipL Notifications',
      importance: N.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4A265',
    });
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    const tokenData = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = tokenData.data;
    await upsertPushToken(userId, token, Platform.OS as 'ios' | 'android');
    return token;
  } catch {
    return null;
  }
}

/** Hapus push token saat logout. */
export async function unregisterPushToken(userId: string): Promise<void> {
  if (isExpoGo) return;
  await deletePushToken(userId, Platform.OS as 'ios' | 'android').catch(() => {});
}

/** Local notification untuk pesan chat baru. */
export async function scheduleNewMessageNotification(
  senderName: string,
  text: string,
): Promise<void> {
  if (isExpoGo) return;
  await notifs().scheduleNotificationAsync({
    content: {
      title: senderName,
      body: text.length > 80 ? text.slice(0, 77) + '...' : text,
      sound: true,
      data: { type: 'chat' },
    },
    trigger: null,
  });
}

/** Local notification untuk perubahan status order. */
export async function scheduleOrderStatusNotification(
  orderNumber: string,
  statusLabel: string,
  orderId: string,
): Promise<void> {
  if (isExpoGo) return;
  await notifs().scheduleNotificationAsync({
    content: {
      title: `Order ${orderNumber}`,
      body: statusLabel,
      sound: true,
      data: { type: 'order', orderId },
    },
    trigger: null,
  });
}

/** Jadwalkan reminder trip H-1 keberangkatan. */
export async function scheduleTripDepartureReminder(
  tripId: string,
  destination: string,
  departureDate: number,
): Promise<string | null> {
  if (isExpoGo) return null;
  const N = notifs();
  const reminderDate = new Date(departureDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);
  return await N.scheduleNotificationAsync({
    content: {
      title: 'Trip Reminder',
      body: `Trip ke ${destination} berangkat besok!`,
      sound: true,
      data: { type: 'trip', tripId },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

/** Batalkan scheduled notification. */
export async function cancelNotification(identifier: string): Promise<void> {
  if (isExpoGo) return;
  await notifs().cancelScheduledNotificationAsync(identifier);
}
