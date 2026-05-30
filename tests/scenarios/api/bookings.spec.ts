import { test, expect } from '@playwright/test';
import { createEventType, createBooking, uniqueDate } from '../../fixtures';

test.describe('Bookings API', () => {
  test('POST /api/bookings creates a booking', async ({ request }) => {
    const et = await createEventType(request, { duration: 30 });
    const date = uniqueDate();
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, guestName: 'Alice', date, startTime: '10:00' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      eventTypeId: et.id,
      guestName: 'Alice',
      date,
      startTime: '10:00',
      endTime: '10:30',
    });
    expect(body.id).toBeDefined();
  });

  test('POST /api/bookings computes endTime correctly for 60-min type', async ({ request }) => {
    const et = await createEventType(request, { duration: 60 });
    const date = uniqueDate();
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, guestName: 'Bob', date, startTime: '14:00' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.endTime).toBe('15:00');
  });

  test('POST /api/bookings returns 409 on duplicate slot', async ({ request }) => {
    const et = await createEventType(request, { duration: 30 });
    const date = uniqueDate();

    // first booking
    await createBooking(request, { eventTypeId: et.id, date, startTime: '10:00' });

    // second booking — same time
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, guestName: 'Charlie', date, startTime: '10:00' },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('CONFLICT');
  });

  test('POST /api/bookings returns suggestedNext on conflict', async ({ request }) => {
    const et = await createEventType(request, { duration: 30 });
    const date = uniqueDate();

    await createBooking(request, { eventTypeId: et.id, date, startTime: '10:00' });

    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, guestName: 'Dave', date, startTime: '10:00' },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.suggestedNext).toBeDefined();
    expect(body.suggestedNext.date).toBe(date);
    expect(body.suggestedNext.startTime).toBe('10:30');
    expect(body.suggestedNext.endTime).toBe('11:00');
  });

  test('POST /api/bookings returns suggestedNext=null when no free slots in 14 days', async ({ request }) => {
    const et = await createEventType(request, { duration: 480 }); // 8 hours, fills whole day
    const date = uniqueDate();

    // book the only slot (09:00-17:00)
    await createBooking(request, { eventTypeId: et.id, date, startTime: '09:00' });

    // try to book the same slot
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, guestName: 'Eve', date, startTime: '09:00' },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.suggestedNext).toBeNull();
  });

  test('POST /api/bookings returns 400 without guestName', async ({ request }) => {
    const et = await createEventType(request);
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: et.id, date: uniqueDate(), startTime: '10:00' },
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  test('POST /api/bookings returns 404 for unknown eventTypeId', async ({ request }) => {
    const res = await request.post('/api/bookings', {
      data: { eventTypeId: 'nonexistent', guestName: 'Test', date: uniqueDate(), startTime: '10:00' },
    });
    expect(res.status()).toBe(404);
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' });
  });

  test('GET /api/bookings/:id returns a booking', async ({ request }) => {
    const booking = await createBooking(request);
    const res = await request.get(`/api/bookings/${booking.id}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: booking.id });
  });

  test('GET /api/bookings/:id returns 404 for unknown id', async ({ request }) => {
    const res = await request.get('/api/bookings/nonexistent');
    expect(res.status()).toBe(404);
  });

  test('GET /api/admin/bookings returns all bookings sorted', async ({ request }) => {
    // create two bookings on different dates
    const et1 = await createEventType(request, { name: 'Type A', duration: 30 });
    const et2 = await createEventType(request, { name: 'Type B', duration: 30 });

    const date1 = uniqueDate(3);
    const date2 = uniqueDate(5);

    await createBooking(request, { eventTypeId: et1.id, date: date1, startTime: '11:00' });
    await createBooking(request, { eventTypeId: et2.id, date: date2, startTime: '09:00' });

    const res = await request.get('/api/admin/bookings');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
    // earlier date comes first
    const idx1 = body.findIndex((b: any) => b.date === date1);
    const idx2 = body.findIndex((b: any) => b.date === date2);
    expect(idx1).toBeLessThan(idx2);
  });
});
