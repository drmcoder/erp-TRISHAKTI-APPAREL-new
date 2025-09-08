import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login as operator
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.waitForSelector('[data-testid="dashboard-content"]');
  });

  test('should display notification center', async ({ page }) => {
    // Click notification bell icon
    await page.click('[data-testid="notification-bell"]');
    
    // Should open notification center
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Should show notification count
    await expect(page.locator('[data-testid="notification-count"]')).toBeVisible();
    
    // Should display notifications list
    await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
  });

  test('should show unread notification badge', async ({ page }) => {
    // Should show unread count badge on bell icon
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();
    
    // Badge should show positive count
    const count = await badge.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
  });

  test('should display notifications with proper categorization', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Should show different types of notifications
    const notifications = page.locator('.notification-item');
    await expect(notifications).toHaveCount.greaterThan(0);
    
    // Check for different notification types
    await expect(page.locator('.notification-item[data-type="assignment"]')).toHaveCount.greaterThan(0);
    
    // Should show priority indicators
    await expect(page.locator('.notification-item [data-testid="priority-badge"]')).toHaveCount.greaterThan(0);
    
    // Should show timestamps
    await expect(page.locator('.notification-item [data-testid="timestamp"]')).toHaveCount.greaterThan(0);
  });

  test('should mark notifications as read', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Get initial unread count
    const initialCount = await page.locator('[data-testid="notification-count"]').textContent();
    const initialUnread = parseInt(initialCount || '0');
    
    // Click mark as read on first unread notification
    const unreadNotification = page.locator('.notification-item[data-read="false"]').first();
    await unreadNotification.locator('[data-testid="mark-read-button"]').click();
    
    // Should update the notification appearance
    await expect(unreadNotification).toHaveAttribute('data-read', 'true');
    
    // Should decrease unread count
    const newCount = await page.locator('[data-testid="notification-count"]').textContent();
    const newUnread = parseInt(newCount || '0');
    expect(newUnread).toBeLessThan(initialUnread);
  });

  test('should mark all notifications as read', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Click mark all as read
    await page.click('[data-testid="mark-all-read"]');
    
    // Should show confirmation or immediately update
    await expect(page.locator('[data-testid="notification-count"]')).toContainText('0');
    
    // All notifications should be marked as read
    await expect(page.locator('.notification-item[data-read="false"]')).toHaveCount(0);
  });

  test('should filter notifications by type', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Open filter dropdown
    await page.click('[data-testid="notification-filter"]');
    
    // Filter by assignments
    await page.click('[data-testid="filter-assignment"]');
    
    // Should only show assignment notifications
    const notifications = page.locator('.notification-item');
    const count = await notifications.count();
    
    for (let i = 0; i < count; i++) {
      await expect(notifications.nth(i)).toHaveAttribute('data-type', 'assignment');
    }
    
    // Filter by all
    await page.click('[data-testid="notification-filter"]');
    await page.click('[data-testid="filter-all"]');
    
    // Should show all types again
    await expect(page.locator('.notification-item')).toHaveCount.greaterThan(count);
  });

  test('should delete individual notifications', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Get initial count
    const initialCount = await page.locator('.notification-item').count();
    
    // Delete first notification
    await page.click('.notification-item:first-child [data-testid="delete-notification"]');
    
    // Should confirm deletion or immediately remove
    await expect(page.locator('.notification-item')).toHaveCount(initialCount - 1);
  });

  test('should execute notification actions', async ({ page }) => {
    await page.click('[data-testid="notification-bell"]');
    
    // Find notification with action button
    const notificationWithAction = page.locator('.notification-item').filter({
      has: page.locator('[data-testid="notification-action"]')
    }).first();
    
    if (await notificationWithAction.count() > 0) {
      // Click action button
      await notificationWithAction.locator('[data-testid="notification-action"]').click();
      
      // Should navigate to related page or perform action
      await page.waitForURL(/.*\/(assignments|work|dashboard).*/);
      
      // Should be on the relevant page
      expect(page.url()).toMatch(/\/(assignments|work|dashboard)/);
    }
  });

  test('should show toast notifications', async ({ page }) => {
    // Trigger an action that generates a toast notification
    // For example, completing a work assignment
    await page.goto('/my-work');
    
    // Perform action that triggers toast
    await page.click('[data-testid="quick-action-button"]');
    
    // Should show toast notification
    await expect(page.locator('.toast-notification')).toBeVisible();
    
    // Toast should auto-dismiss after timeout
    await expect(page.locator('.toast-notification')).not.toBeVisible({ timeout: 6000 });
  });

  test('should handle push notification permission', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    await page.click('[data-testid="notification-bell"]');
    
    // Open notification settings
    await page.click('[data-testid="notification-settings"]');
    
    // Should show push notification toggle
    await expect(page.locator('[data-testid="push-notifications-toggle"]')).toBeVisible();
    
    // Enable push notifications
    await page.click('[data-testid="push-notifications-toggle"]');
    
    // Should show success message
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText(/push notifications enabled/i);
  });
});

test.describe('Real-time Notification Updates', () => {
  test('should receive real-time notifications', async ({ browser }) => {
    // Create two pages to simulate real-time updates
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const operatorPage = await context1.newPage();
    const supervisorPage = await context2.newPage();
    
    // Login operator
    await operatorPage.goto('/');
    await operatorPage.click('[data-testid="login-button"]');
    await operatorPage.fill('[data-testid="email-input"]', 'operator@test.com');
    await operatorPage.fill('[data-testid="password-input"]', 'testpass123');
    await operatorPage.click('[data-testid="submit-login"]');
    await operatorPage.waitForSelector('[data-testid="dashboard-content"]');
    
    // Login supervisor
    await supervisorPage.goto('/');
    await supervisorPage.click('[data-testid="login-button"]');
    await supervisorPage.fill('[data-testid="email-input"]', 'supervisor@test.com');
    await supervisorPage.fill('[data-testid="password-input"]', 'testpass123');
    await supervisorPage.click('[data-testid="submit-login"]');
    await supervisorPage.waitForSelector('[data-testid="dashboard-content"]');
    
    // Supervisor assigns work
    await supervisorPage.goto('/assignments');
    await supervisorPage.click('.work-item-card:first-child [data-testid="assign-button"]');
    await supervisorPage.click('[data-testid="operator-option-1"]'); // Assign to test operator
    await supervisorPage.click('[data-testid="submit-assignment"]');
    
    // Operator should receive real-time notification
    await operatorPage.waitForSelector('[data-testid="notification-badge"]', { timeout: 10000 });
    
    // Check notification count increased
    const badge = operatorPage.locator('[data-testid="notification-badge"]');
    const count = await badge.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
    
    await context1.close();
    await context2.close();
  });
});

test.describe('Mobile Notification Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('should display mobile-optimized notification center', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    // Open notification center
    await page.click('[data-testid="notification-bell"]');
    
    // Should be mobile-optimized (full screen or drawer)
    const notificationCenter = page.locator('[data-testid="notification-center"]');
    await expect(notificationCenter).toBeVisible();
    
    // Should be touch-friendly
    await expect(notificationCenter).toHaveCSS('position', 'fixed');
    
    // Touch interactions should work
    const notification = page.locator('.notification-item').first();
    await notification.tap();
    
    // Should respond to swipe gestures for actions
    await notification.hover();
  });

  test('should support pull-to-refresh for notifications', async ({ page }) => {
    await page.goto('/');
    
    // Login and open notifications
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.click('[data-testid="notification-bell"]');
    
    // Simulate pull-to-refresh gesture
    const notificationsList = page.locator('[data-testid="notifications-list"]');
    
    // Touch-based pull down gesture
    await notificationsList.hover();
    await page.mouse.down();
    await page.mouse.move(0, 100); // Pull down
    await page.mouse.up();
    
    // Should show refresh indicator
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
    
    // Should refresh notifications
    await expect(page.locator('[data-testid="refresh-indicator"]')).not.toBeVisible({ timeout: 3000 });
  });
});