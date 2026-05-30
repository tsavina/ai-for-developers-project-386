import { Router } from 'express';
import * as store from '../store.js';

const router = Router();

// GET /api/admin/event-types
router.get('/event-types', (_req, res) => {
  res.json(store.getAllEventTypes());
});

// POST /api/admin/event-types
router.post('/event-types', (req, res, next) => {
  const { name, description, duration } = req.body;

  if (!name || typeof name !== 'string' || name.length > 100) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'name is required (max 100 chars)' });
  }
  if (description && typeof description !== 'string' || (description && description.length > 1000)) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'description max 1000 chars' });
  }
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
    return next({ status: 400, code: 'VALIDATION_ERROR', message: 'duration must be integer 15-480' });
  }

  const et = store.createEventType({ name, description: description || '', duration });
  res.status(200).json(et);
});

// DELETE /api/admin/event-types/:id
router.delete('/event-types/:id', (req, res, next) => {
  const deleted = store.deleteEventType(req.params.id);
  if (!deleted) {
    return next({ status: 404, code: 'NOT_FOUND', message: 'Event type not found' });
  }
  res.status(204).end();
});

// GET /api/admin/bookings
router.get('/bookings', (_req, res) => {
  res.json(store.getAllBookingsSorted());
});

// DELETE /api/admin/reset
router.delete('/reset', (_req, res) => {
  store.reset();
  res.status(204).end();
});

export default router;
