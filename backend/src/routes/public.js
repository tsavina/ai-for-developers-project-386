import { Router } from 'express';
import * as store from '../store.js';
import { getFreeSlots, findNextFreeSlot } from '../slotService.js';

const router = Router();

// GET /api/event-types
router.get('/event-types', (_req, res) => {
  res.json(store.getAllEventTypes());
});

// GET /api/event-types/:id
router.get('/event-types/:id', (req, res, next) => {
  const et = store.getEventTypeById(req.params.id);
  if (!et) {
    return next({ status: 404, code: 'NOT_FOUND', message: 'Event type not found' });
  }
  res.json(et);
});

// GET /api/event-types/:id/slots?date=YYYY-MM-DD
router.get('/event-types/:id/slots', (req, res, next) => {
  const et = store.getEventTypeById(req.params.id);
  if (!et) {
    return next({ status: 404, code: 'NOT_FOUND', message: 'Event type not found' });
  }

  const { date } = req.query;
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid or missing date query param (YYYY-MM-DD)' });
  }

  const slots = getFreeSlots(et, date, store.getAllBookings());
  res.json(slots);
});

// POST /api/bookings
router.post('/bookings', (req, res, next) => {
  const { eventTypeId, guestName, date, startTime } = req.body;

  // Валидация полей
  if (!guestName || typeof guestName !== 'string' || guestName.length > 200) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'guestName is required (max 200 chars)' });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid date (YYYY-MM-DD)' });
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid startTime (HH:MM)' });
  }

  const et = store.getEventTypeById(eventTypeId);
  if (!et) {
    return next({ status: 404, code: 'NOT_FOUND', message: 'Event type not found' });
  }

  // Вычисляем endTime
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + et.duration;
  const endH = Math.floor(totalMin / 60);
  const endM = totalMin % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

  // Проверка пересечения
  const dayBookings = store.getBookingsByDate(date);
  const overlap = dayBookings.some((b) => {
    const [bh, bm] = b.startTime.split(':').map(Number);
    const [beh, bem] = b.endTime.split(':').map(Number);
    const bStart = bh * 60 + bm;
    const bEnd = beh * 60 + bem;
    const aStart = h * 60 + m;
    const aEnd = totalMin;
    return aStart < bEnd && bStart < aEnd;
  });

  if (overlap) {
    const allBookings = store.getAllBookings();
    const suggested = findNextFreeSlot(et, date, startTime, allBookings);
    const msg = suggested
      ? `Это время занято. Следующий свободный: ${suggested.date} в ${suggested.startTime}`
      : 'Это время занято. Свободных слотов в ближайшие 14 дней нет.';
    return next({ status: 409, code: 'CONFLICT', message: msg, suggestedNext: suggested });
  }

  const booking = store.createBooking({ eventTypeId, guestName, date, startTime, endTime });
  res.status(200).json(booking);
});

// GET /api/bookings/:id
router.get('/bookings/:id', (req, res, next) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return next({ status: 404, code: 'NOT_FOUND', message: 'Booking not found' });
  }
  res.json(booking);
});

export default router;
