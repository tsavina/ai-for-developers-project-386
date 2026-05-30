import { test, expect } from '@playwright/test';
import { createEventType, futureDate } from '../../fixtures';

test.describe('Booking flow (E2E)', () => {
  test.beforeEach(async ({ request }) => {
    // Seed: ensure at least one event type exists
    await createEventType(request, { name: '30 min meeting', description: 'Quick video call', duration: 30 });
  });

  test('guest sees event types on the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=30 min meeting')).toBeVisible();
    await expect(page.locator('text=30 мин')).toBeVisible();
    await expect(page.locator('text=Quick video call')).toBeVisible();
  });

  test('guest creates a booking through the UI', async ({ page, request }) => {
    const date = futureDate(3);
    const [year, month, day] = date.split('-');

    // 1. Go to home page
    await page.goto('/');
    await expect(page.locator('text=30 min meeting')).toBeVisible();

    // 2. Click "Записаться"
    await page.click('text=Записаться');
    await expect(page).toHaveURL(/\/event-types\//);

    // 3. Select the future date
    const dateButton = page.locator(`button:has(text="${parseInt(day)}")`).first();
    await dateButton.click();

    // 4. Wait for slots to appear and click first available slot
    await expect(page.locator('button:has(text="09:00")')).toBeVisible({ timeout: 5000 });
    await page.click('text=09:00');

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
    const et = (await request.get('/api/event-types')).then((r) => r.json());

    // book 10:00 slot via API
    await request.post('/api/bookings', {
      data: { eventTypeId: (await et)[0].id, guestName: 'Occupier', date, startTime: '10:00' },
    });

    await page.goto(`/event-types/${(await et)[0].id}`);

    // select date
    const [year, month, day] = date.split('-');
    const dateButton = page.locator(`button:has(text="${parseInt(day)}")`).first();
    await dateButton.click();

    // select 10:00
    await expect(page.locator('button:has(text="10:00")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has(text="10:00")');

    // fill and submit
    await page.fill('input[placeholder="Введите имя"]', 'Latecomer');
    await page.click('text=Забронировать');

    // should see orange toast with suggestion
    await expect(page.locator('text=Слот занят')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Следующий свободный')).toBeVisible();
  });
});
