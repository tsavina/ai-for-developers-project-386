import type { APIRequestContext } from '@playwright/test';

export interface EventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
}

let callCounter = 0;

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function futureDate(daysFromNow = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function uniqueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7 + callCounter);
  callCounter++;
  return d.toISOString().slice(0, 10);
}

export async function createEventType(
  request: APIRequestContext,
  overrides: Partial<{ name: string; description: string; duration: number }> = {},
): Promise<EventType> {
  const payload = {
    name: 'Test Meeting',
    description: 'Test description',
    duration: 30,
    ...overrides,
  };
  const res = await request.post('/api/admin/event-types', { data: payload });
  if (!res.ok()) throw new Error(`createEventType failed: ${res.status()} ${await res.text()}`);
  return res.json();
}

export async function createBooking(
  request: APIRequestContext,
  overrides: Partial<{ eventTypeId: string; guestName: string; date: string; startTime: string }> = {},
): Promise<Booking> {
  let eventTypeId = overrides.eventTypeId;
  if (!eventTypeId) {
    const et = await createEventType(request);
    eventTypeId = et.id;
  }
  const payload = {
    eventTypeId,
    guestName: 'Test User',
    date: uniqueDate(),
    startTime: '10:00',
    ...overrides,
  };
  const res = await request.post('/api/bookings', { data: payload });
  if (!res.ok()) throw new Error(`createBooking failed: ${res.status()} ${await res.text()}`);
  return res.json();
}

export { today, futureDate, uniqueDate };
