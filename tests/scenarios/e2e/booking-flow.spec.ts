import { test, expect } from '@playwright/test';
import { createEventType, futureDate } from '../../fixtures';

test.describe('Booking flow (E2E)', () => {
  test.beforeEach(async ({ request }) => {
    // Wipe all state left from previous tests/retries
    await request.delete('/api/admin/reset');
    // Seed: ensure at least one event type exists
    await createEventType(request, { name: '30 min meeting', description: 'Quick video call', duration: 30 });
  });

  test('guest sees event types on the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=30 min meeting').first()).toBeVisible();
    await expect(page.locator('text=30 мин').first()).toBeVisible();
    await expect(page.locator('text=Quick video call').first()).toBeVisible();
  });

  test('guest creates a booking through the UI', async ({ page, request }) => {
    const date = futureDate(3);
    const [year, month, day] = date.split('-');

    // 1. Go to home page
    await page.goto('/');
    await expect(page.locator('text=30 min meeting').first()).toBeVisible();

    // 2. Click "Записаться"
    await page.locator('text=Записаться').first().click();
    await expect(page).toHaveURL(/\/event-types\//);

    // 3. Select the future date
    const dateButton = page.locator('button').filter({ hasText: `${parseInt(day)}` }).first();
    await dateButton.click();

    // 4. Wait for slots to appear and click first available slot
    await expect(page.locator('button').filter({ hasText: '09:00' }).first()).toBeVisible({ timeout: 5000 });
    await page.locator('text=09:00').first().click();

    // 5. Fill in guest name
    await page.fill('input[placeholder="Введите имя"]', 'Иван Петров');

    // 6. Submit
    await page.click('text=Забронировать');

    // 7. Confirmation page
    await expect(page).toHaveURL(/\/bookings\//);
    await expect(page.locator('text=Вы записаны!')).toBeVisible();
    await expect(page.locator('text=Иван Петров')).toBeVisible();
  });

  test('guest sees conflict toast when booking taken slot', async ({ page, request }) => {
    const date = futureDate(3);
    const [year, month, day] = date.split('-');

    const etRes = await request.get('/api/event-types');
    const ets = await etRes.json();
    const eventTypeId = ets[0].id;

    // 1. Go to event type page while slot is free
    await page.goto(`/event-types/${eventTypeId}`);

    // 2. Select the future date
    const dateButton = page.locator('button').filter({ hasText: `${parseInt(day)}` }).first();
    await dateButton.click();

    // 3. Wait for 10:00 slot to appear (it's free)
    await expect(page.locator('button').filter({ hasText: '10:00' }).first()).toBeVisible({ timeout: 5000 });
    await page.locator('button').filter({ hasText: '10:00' }).first().click();

    // 4. Fill in name
    await page.fill('input[placeholder="Введите имя"]', 'Latecomer');

    // 5. Simulate race: another user books the same slot via API
    await request.post('/api/bookings', {
      data: { eventTypeId, guestName: 'Occupier', date, startTime: '10:00' },
    });

    // 6. Submit — server returns 409 CONFLICT
    await page.click('text=Забронировать');

    // 7. Should see orange toast with suggestion
    await expect(page.locator('text=Слот занят').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Следующий свободный')).toBeVisible();
  });
});
