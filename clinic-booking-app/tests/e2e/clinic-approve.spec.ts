import { test, expect } from '@playwright/test';

test.describe('Clinic Approve Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as clinic staff
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'staff@clinic.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display pending appointments', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Wait for appointments to load
    await page.waitForSelector('[data-testid="appointment-card"]');

    // Check if pending badge is visible
    const pendingBadge = page.locator('text=Chờ xác nhận').first();
    await expect(pendingBadge).toBeVisible();
  });

  test('should approve appointment successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Click on first pending appointment
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Click approve button
    await page.click('button:has-text("Xác nhận")');

    // Wait for confirmation modal or success message
    await expect(page.locator('text=Xác nhận thành công')).toBeVisible();

    // Status should update to Confirmed
    await expect(page.locator('text=Đã xác nhận')).toBeVisible();
  });

  test('should show appointment details before approving', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Verify patient information is displayed
    await expect(page.locator('[data-testid="patient-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-phone"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="reason-for-visit"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="appointment-time"]')
    ).toBeVisible();
  });

  test('should update appointment list after approval', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Get initial count of pending appointments
    const initialCount = await page
      .locator('[data-testid="appointment-card"]')
      .count();

    // Approve first appointment
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();
    await page.click('button:has-text("Xác nhận")');
    await page.waitForSelector('text=Xác nhận thành công');

    // Go back to dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Filter to show only pending
    await page.click('button:has-text("Chờ xác nhận")');

    // Count should decrease
    const newCount = await page
      .locator('[data-testid="appointment-card"]')
      .count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should handle double-booking prevention', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Try to approve two appointments with same time slot
    const appointments = page.locator('[data-testid="appointment-card"]');

    // Approve first one
    await appointments.nth(0).click();
    await page.click('button:has-text("Xác nhận")');
    await page.waitForSelector('text=Xác nhận thành công');

    // Try to approve second one with same time slot
    await page.goto('http://localhost:3000/dashboard');
    await appointments.nth(1).click();
    await page.click('button:has-text("Xác nhận")');

    // Should show error about time slot being taken
    await expect(page.locator('text=Khung giờ đã được đặt')).toBeVisible();
  });
});
