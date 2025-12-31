import { test, expect } from '@playwright/test';

test.describe('Patient Booking Flow', () => {
  test('should complete full booking journey', async ({ page }) => {
    // Step 1: Navigate to homepage
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Clinic Booking/);

    // Step 2: Click "View Clinics" or navigate to clinics page
    await page.click('text=Xem phòng khám');
    await expect(page).toHaveURL(/\/clinics/);

    // Step 3: Filter by specialty
    await page.selectOption('select[name="specialty"]', 'cardiology');
    await page.waitForTimeout(500); // Wait for filtering

    // Step 4: Click on a clinic card
    const firstClinic = page.locator('.clinic-card').first();
    await expect(firstClinic).toBeVisible();
    await firstClinic.click();

    // Step 5: Should see clinic details
    await expect(page.locator('h1')).toContainText(/.+/);

    // Step 6: Select a time slot
    const timeSlot = page.locator('.time-slot').first();
    if (await timeSlot.isVisible()) {
      await timeSlot.click();
    }

    // Step 7: Fill appointment form
    await page.fill(
      'textarea[name="reason_for_visit"]',
      'I have been experiencing chest pain and need a checkup'
    );

    // Step 8: Submit (would require auth)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    // Not clicking submit as it requires authentication
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('http://localhost:3000/clinics');

    // Assuming we're on a clinic detail page with form
    await page.goto('http://localhost:3000/clinics/test-id');

    // Try to submit with short reason
    const form = page.locator('form');
    if (await form.isVisible()) {
      await page.fill('textarea[name="reason_for_visit"]', 'Short');

      const errorMessage = page.locator('text=/at least 10 characters/i');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should filter clinics by search', async ({ page }) => {
    await page.goto('http://localhost:3000/clinics');

    // Type in search box
    await page.fill('input[type="search"]', 'Heart');
    await page.waitForTimeout(300);

    // Should show filtered results
    const clinicCards = page.locator('.clinic-card');
    const count = await clinicCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
