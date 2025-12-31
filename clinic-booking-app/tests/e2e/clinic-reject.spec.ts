import { test, expect } from '@playwright/test';

test.describe('Clinic Reject Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as clinic staff
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'staff@clinic.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should reject appointment with reason', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Click on first pending appointment
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Click reject button
    await page.click('button:has-text("Từ chối")');

    // Fill rejection reason
    await page.fill(
      '[data-testid="rejection-reason"]',
      'Bác sĩ không có mặt vào thời gian này'
    );

    // Confirm rejection
    await page.click('button:has-text("Xác nhận từ chối")');

    // Wait for success message
    await expect(page.locator('text=Đã từ chối lịch hẹn')).toBeVisible();

    // Status should update to Rejected
    await expect(page.locator('text=Đã từ chối')).toBeVisible();
  });

  test('should require rejection reason', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Click reject button
    await page.click('button:has-text("Từ chối")');

    // Try to confirm without reason
    await page.click('button:has-text("Xác nhận từ chối")');

    // Should show validation error
    await expect(
      page.locator('text=Vui lòng nhập lý do từ chối')
    ).toBeVisible();
  });

  test('should release time slot after rejection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Get appointment time slot info
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    const timeSlot = await firstAppointment
      .locator('[data-testid="appointment-time"]')
      .textContent();

    await firstAppointment.click();

    // Reject appointment
    await page.click('button:has-text("Từ chối")');
    await page.fill('[data-testid="rejection-reason"]', 'Test rejection');
    await page.click('button:has-text("Xác nhận từ chối")');
    await page.waitForSelector('text=Đã từ chối lịch hẹn');

    // Logout and login as patient
    await page.click('button:has-text("Đăng xuất")');
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'patient@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to book the same time slot
    await page.goto('http://localhost:3000/clinics');
    await page.locator('[data-testid="clinic-card"]').first().click();

    // The rejected time slot should be available again
    const availableSlot = page.locator(`text=${timeSlot}`);
    await expect(availableSlot).toBeVisible();
    await expect(availableSlot).not.toHaveClass(/disabled|booked/);
  });

  test('should update appointment list after rejection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Get initial count of pending appointments
    const initialCount = await page
      .locator('[data-testid="appointment-card"]')
      .count();

    // Reject first appointment
    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();
    await page.click('button:has-text("Từ chối")');
    await page.fill('[data-testid="rejection-reason"]', 'Test rejection');
    await page.click('button:has-text("Xác nhận từ chối")');
    await page.waitForSelector('text=Đã từ chối lịch hẹn');

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

  test('should allow canceling rejection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    const firstAppointment = page
      .locator('[data-testid="appointment-card"]')
      .first();
    await firstAppointment.click();

    // Click reject button
    await page.click('button:has-text("Từ chối")');

    // Fill reason
    await page.fill('[data-testid="rejection-reason"]', 'Test');

    // Cancel rejection
    await page.click('button:has-text("Hủy")');

    // Modal should close, status should remain Pending
    await expect(
      page.locator('[data-testid="rejection-modal"]')
    ).not.toBeVisible();
    await expect(page.locator('text=Chờ xác nhận')).toBeVisible();
  });
});
