import { test, expect } from '@playwright/test';
import { createEventType } from '../../fixtures';

test.describe('Event Types API', () => {
  test('POST /api/admin/event-types creates an event type', async ({ request }) => {
    const res = await request.post('/api/admin/event-types', {
      data: { name: '30 min', description: 'Quick call', duration: 30 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ name: '30 min', description: 'Quick call', duration: 30 });
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe('string');
  });

  test('GET /api/event-types lists created types', async ({ request }) => {
    await createEventType(request, { name: 'Meeting A' });
    await createEventType(request, { name: 'Meeting B' });

    const res = await request.get('/api/event-types');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
    expect(body.map((e: any) => e.name)).toContain('Meeting A');
    expect(body.map((e: any) => e.name)).toContain('Meeting B');
  });

  test('GET /api/event-types/:id returns a single type', async ({ request }) => {
    const created = await createEventType(request);
    const res = await request.get(`/api/event-types/${created.id}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ id: created.id, name: created.name });
  });

  test('GET /api/event-types/:id returns 404 for unknown id', async ({ request }) => {
    const res = await request.get('/api/event-types/nonexistent');
    expect(res.status()).toBe(404);
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' });
  });

  test('DELETE /api/admin/event-types/:id removes a type', async ({ request }) => {
    const created = await createEventType(request);
    const del = await request.delete(`/api/admin/event-types/${created.id}`);
    expect(del.status()).toBe(204);

    const get = await request.get(`/api/event-types/${created.id}`);
    expect(get.status()).toBe(404);
  });

  test('DELETE /api/admin/event-types/:id returns 404 for unknown', async ({ request }) => {
    const res = await request.delete('/api/admin/event-types/nonexistent');
    expect(res.status()).toBe(404);
  });

  test('POST /api/admin/event-types validates duration range', async ({ request }) => {
    const res = await request.post('/api/admin/event-types', {
      data: { name: 'Bad', description: '', duration: 5 },
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
