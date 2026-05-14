/**
 * TipL — Calendar Service
 * Adds delivery reminders (Tiper) and trip departure events (Triper)
 * to the device's native calendar via expo-calendar.
 */

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

async function getOrCreateTipLCalendar(): Promise<string> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Calendar permission denied');

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === 'TipL');
  if (existing) return existing.id;

  const defaultSource =
    Platform.OS === 'ios'
      ? (await Calendar.getDefaultCalendarAsync()).source
      : { isLocalAccount: true, name: 'TipL', type: '' };

  return Calendar.createCalendarAsync({
    title: 'TipL',
    color: '#C4A265',
    entityType: Calendar.EntityTypes.EVENT,
    source: defaultSource as Calendar.Source,
    name: 'tipl',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

/** Add a delivery reminder for the Tiper (buyer). Called when order → IN_TRANSIT. */
export async function addDeliveryReminderEvent(
  orderNumber: string,
  itemName: string,
  estimatedDeliveryMs: number,
): Promise<string | null> {
  try {
    const calendarId = await getOrCreateTipLCalendar();
    const start = new Date(estimatedDeliveryMs);
    const end = new Date(estimatedDeliveryMs + 60 * 60 * 1000); // 1 hour duration

    return Calendar.createEventAsync(calendarId, {
      title: `📦 TipL Delivery — ${orderNumber}`,
      notes: `Your item "${itemName}" is estimated to arrive today.`,
      startDate: start,
      endDate: end,
      alarms: [
        { relativeOffset: -60 },  // 1 hour before
        { relativeOffset: -1440 }, // day before
      ],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    return null;
  }
}

/** Add a trip departure event for the Triper (traveler). Called on trip creation. */
export async function addTripDepartureEvent(
  destination: string,
  origin: string,
  departureDateMs: number,
  returnDateMs: number,
): Promise<string | null> {
  try {
    const calendarId = await getOrCreateTipLCalendar();
    const start = new Date(departureDateMs);
    const end = new Date(returnDateMs);

    return Calendar.createEventAsync(calendarId, {
      title: `✈️ TipL Trip — ${origin} → ${destination}`,
      notes: `Your jastip trip to ${destination}. Remember to check your TipL orders!`,
      startDate: start,
      endDate: end,
      allDay: true,
      alarms: [
        { relativeOffset: -1440 }, // 1 day before departure
        { relativeOffset: -10080 }, // 1 week before
      ],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    return null;
  }
}

/** Delete a previously created calendar event. */
export async function removeCalendarEvent(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch {
    // ignore
  }
}
