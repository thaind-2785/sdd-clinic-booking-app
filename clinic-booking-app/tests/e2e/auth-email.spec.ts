import { test, expect } from '@playwright/test';

test.describe('Email/Password Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePass123!@#',
    fullName: 'Test User',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText(/sign in|login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(
      page.locator('text=/invalid.*credentials|incorrect.*password/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should successfully sign up with email/password', async ({ page }) => {
    await page.goto('/login');

    // Switch to sign up mode if exists
    const signUpLink = page.locator('text=/sign up|create account/i');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
    }

    // Fill sign up form
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill(
      'input[name="password"], input[type="password"]',
      testUser.password
    );

    // Fill full name if field exists
    const nameInput = page.locator(
      'input[name="fullName"], input[name="name"]'
    );
    if (await nameInput.isVisible()) {
      await nameInput.fill(testUser.fullName);
    }

    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show success message
    await expect(async () => {
      const url = page.url();
      const hasSuccessMessage = await page
        .locator('text=/success|check.*email/i')
        .isVisible();
      expect(url.includes('/dashboard') || hasSuccessMessage).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });

  test('should successfully sign in with email/password', async ({ page }) => {
    // Use a known test account
    const existingUser = {
      email: 'patient@example.com',
      password: 'password123',
    };

    await page.goto('/login');

    await page.fill('input[type="email"]', existingUser.email);
    await page.fill('input[type="password"]', existingUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(patient-)?dashboard/, { timeout: 15000 });
  });

  test('should maintain session after login', async ({ page, context }) => {
    const existingUser = {
      email: 'patient@example.com',
      password: 'password123',
    };

    await page.goto('/login');
    await page.fill('input[type="email"]', existingUser.email);
    await page.fill('input[type="password"]', existingUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/patient-dashboard');

    // Should be authenticated without login
    await expect(newPage).not.toHaveURL(/login/);
    await expect(
      newPage.locator('text=/appointments|dashboard/i')
    ).toBeVisible();
  });

  test('should successfully sign out', async ({ page }) => {
    const existingUser = {
      email: 'patient@example.com',
      password: 'password123',
    };

    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', existingUser.email);
    await page.fill('input[type="password"]', existingUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Find and click sign out button
    const signOutButton = page.locator(
      'button:has-text("Sign Out"), a:has-text("Sign Out"), button:has-text("Logout")'
    );
    await signOutButton.click();

    // Should redirect to home or login
    await expect(async () => {
      const url = page.url();
      expect(url === '/' || url.includes('/login')).toBeTruthy();
    }).toPass({ timeout: 10000 });

    // Should not be able to access protected routes
    await page.goto('/patient-dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('should protect patient routes from unauthenticated access', async ({
    page,
  }) => {
    await page.goto('/patient-dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('should protect clinic routes from unauthenticated access', async ({
    page,
  }) => {
    await page.goto('/clinic-dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('should show password reset option', async ({ page }) => {
    await page.goto('/login');

    const resetLink = page.locator('text=/forgot.*password|reset.*password/i');
    await expect(resetLink).toBeVisible();
  });

  test('should validate password strength on signup', async ({ page }) => {
    await page.goto('/login');

    // Switch to sign up
    const signUpLink = page.locator('text=/sign up|create account/i');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
    }

    // Try weak password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.blur();

    // Should show validation error
    await expect(
      page.locator(
        'text=/password.*weak|password.*short|at least.*characters/i'
      )
    ).toBeVisible();
  });

  test('should persist user role after authentication', async ({ page }) => {
    const patientUser = {
      email: 'patient@example.com',
      password: 'password123',
    };

    await page.goto('/login');
    await page.fill('input[type="email"]', patientUser.email);
    await page.fill('input[type="password"]', patientUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    // Should have access to patient-specific features
    await page.goto('/clinics');
    await expect(
      page.locator('text=/browse.*clinics|find.*clinic/i')
    ).toBeVisible();
  });
});
