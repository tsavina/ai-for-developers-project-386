import { test, expect } from '@playwright/test';
import { createEventType, createBooking, uniqueDate } from '../../fixtures';

test.describe('Slots API', () => {
  test('GET /api/event-types/:id/slots returns slots for 30-min type', async ({ request }) => {
    const et = await createEventType(request, { duration: 30 });
    const date = uniqueDate();
    const res = await request.get(`/api/event-types/${et.id}/slots?date=${date}`);
    expect(res.status()).toBe(200);
    const slots = await res.json();
    expect(slots.length).toBe(16); // 09:00-17:00, 30 min step → 16 slots
    expect(slots[0]).toMatchObject({ startTime: '09:00', endTime: '09:30' });
    expect(slots[slots.length - 1]).toMatchObject({ startTime: '16:30', endTime: '17:00' });
  });

  test('GET /api/event-types/:id/slots returns slots for 60-min type', async ({ request }) => {
    const et = await createEventType(request, { duration: 60 });
    const date = uniqueDate();
    const res = await request.get(`/api/event-types/${et.id}/slots?date=${date}`);
    expect(res.status()).toBe(200);
    const slots = await res.json();
    expect(slots.length).toBe(15); // 09:00-17:00, 30 min step → 15 slots for 60-min duration
    expect(slots[0]).toMatchObject({ startTime: '09:00', endTime: '10:00' });
  });

  test('booked slot is excluded from slots list', async ({ request }) => {
    const et = await createEventType(request, { duration: 30 });
    const date = uniqueDate();

    // book 10:00-10:30
    await createBooking(request, { eventTypeId: et.id, date, startTime: '10:00' });

    const res = await request.get(`/api/event-types/${et.id}/slots?date=${date}`);
    const slots = await res.json();
    const times = slots.map((s: any) => s.startTime);
    expect(times).not.toContain('10:00');
  });

  test('GET /api/event-types/:id/slots returns 400 without date param', async ({ request }) => {
    const et = await createEventType(request);
    const res = await request.get(`/api/event-types/${et.id}/slots`);
    expect(res.status()).toBe(400);
  });

  test('GET /api/event-types/:id/slots returns 404 for unknown type', async ({ request }) => {
    const res = await request.get('/api/event-types/nonexistent/slots?date=2026-06-01');
    expect(res.status()).toBe(404);
  });
});
