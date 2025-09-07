import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    
    // Wait for service worker registration
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    
    // Check service worker is registered
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should show install prompt when available', async ({ page, context }) => {
    // Mock beforeinstallprompt event
    await page.addInitScript(() => {
      let deferredPrompt;
      
      window.addEventListener('load', () => {
        // Simulate beforeinstallprompt event after a delay
        setTimeout(() => {
          const event = new CustomEvent('beforeinstallprompt');
          event.preventDefault = () => {};
          event.prompt = () => Promise.resolve();
          event.userChoice = Promise.resolve({ outcome: 'accepted' });
          
          window.dispatchEvent(event);
        }, 1000);
      });
    });
    
    await page.goto('/');
    
    // Should show install button
    await expect(page.locator('[data-testid="pwa-install-button"]')).toBeVisible({ timeout: 5000 });
    
    // Click install button
    await page.click('[data-testid="pwa-install-button"]');
    
    // Should show install confirmation
    await expect(page.locator('[data-testid="install-success"]')).toBeVisible();
  });

  test('should work offline with cached content', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for initial load and service worker
    await page.waitForSelector('[data-testid="app-ready"]');
    await page.waitForTimeout(2000); // Wait for caching
    
    // Login and navigate to cache some pages
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    // Navigate to other pages to cache them
    await page.goto('/my-work');
    await page.waitForSelector('[data-testid="work-list"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Should still be able to navigate to cached pages
    await page.goto('/');
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible();
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Should still load cached dashboard
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should sync any offline changes
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });

  test('should queue actions when offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Perform an action that would normally require network
    await page.goto('/my-work');
    await page.click('[data-testid="update-status-button"]');
    
    // Should show queued action indicator
    await expect(page.locator('[data-testid="action-queued"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should process queued actions
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="action-queued"]')).not.toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.describe('Mobile Phone', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
    
    test('should display mobile-optimized layout', async ({ page }) => {
      await page.goto('/');
      
      // Should show mobile navigation
      await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
      
      // Desktop navigation should be hidden
      await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      // Should show mobile dashboard
      await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
    });

    test('should support touch gestures', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      // Test swipe to open sidebar
      await page.touchscreen.tap(10, 100); // Start from left edge
      await page.touchscreen.tap(200, 100); // Swipe right
      
      // Should open sidebar
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
      
      // Test swipe to close
      await page.touchscreen.tap(300, 100); // Start from right
      await page.touchscreen.tap(50, 100); // Swipe left
      
      // Should close sidebar
      await expect(page.locator('[data-testid="mobile-sidebar"]')).not.toBeVisible();
    });

    test('should handle touch-friendly interactions', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      await page.goto('/my-work');
      
      // Test long press for context menu
      const workCard = page.locator('.work-card').first();
      await workCard.tap();
      await page.waitForTimeout(500);
      await workCard.tap(); // Long press simulation
      
      // Should show context menu
      await expect(page.locator('[data-testid="context-menu"]')).toBeVisible();
      
      // Test swipe actions on cards
      await workCard.hover();
      // Simulate swipe left for actions
      const box = await workCard.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
        await page.touchscreen.tap(box.x + 10, box.y + box.height / 2);
      }
      
      // Should show swipe actions
      await expect(page.locator('[data-testid="swipe-actions"]')).toBeVisible();
    });

    test('should use mobile-optimized modals and forms', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      await page.goto('/my-work');
      
      // Open work completion modal
      await page.click('.work-card:first-child [data-testid="complete-button"]');
      
      // Modal should be full-screen on mobile
      const modal = page.locator('[data-testid="completion-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveCSS('position', 'fixed');
      
      // Form inputs should be mobile-optimized
      const input = page.locator('[data-testid="pieces-input"]');
      await expect(input).toHaveCSS('font-size', /1[6-8]px/); // At least 16px for iOS
      
      // Should have proper input types for mobile keyboards
      await expect(input).toHaveAttribute('inputmode', 'numeric');
    });
  });

  test.describe('Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad
    
    test('should display tablet-optimized layout', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      // Should show tablet layout with sidebar
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      
      // Should use grid layouts for content
      await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
    });

    test('should support split-screen interactions', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'supervisor@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      await page.goto('/assignments');
      
      // Should show split view for work assignment
      await expect(page.locator('[data-testid="work-list-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="operator-panel"]')).toBeVisible();
      
      // Selecting work item should update detail panel
      await page.click('.work-item:first-child');
      await expect(page.locator('[data-testid="assignment-detail-panel"]')).toBeVisible();
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle orientation changes gracefully', async ({ page, browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }
      });
      
      const mobilePage = await context.newPage();
      await mobilePage.goto('/');
      
      // Login
      await mobilePage.click('[data-testid="login-button"]');
      await mobilePage.fill('[data-testid="email-input"]', 'operator@test.com');
      await mobilePage.fill('[data-testid="password-input"]', 'testpass123');
      await mobilePage.click('[data-testid="submit-login"]');
      
      // Portrait mode layout
      await expect(mobilePage.locator('[data-testid="portrait-layout"]')).toBeVisible();
      
      // Rotate to landscape
      await mobilePage.setViewportSize({ width: 667, height: 375 });
      
      // Should adapt to landscape layout
      await expect(mobilePage.locator('[data-testid="landscape-layout"]')).toBeVisible();
      
      // Content should remain accessible
      await expect(mobilePage.locator('[data-testid="dashboard-content"]')).toBeVisible();
      
      await context.close();
    });
  });

  test.describe('Accessibility on Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should maintain accessibility on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for proper ARIA labels on interactive elements
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        expect(ariaLabel || text).toBeTruthy();
      }
      
      // Check for proper focus management
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
      
      // Touch targets should be at least 44px
      const touchTargets = await page.locator('button, a, input').all();
      for (const target of touchTargets.slice(0, 5)) { // Check first 5
        const box = await target.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Performance on Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should load quickly on mobile networks', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', route => {
        return new Promise(resolve => {
          setTimeout(() => resolve(route.continue()), 100);
        });
      });
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Should show loading state quickly
      await expect(page.locator('[data-testid="app-loading"]')).toBeVisible();
      
      // Should load within reasonable time
      await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // 10 seconds max for slow network
    });

    test('should use lazy loading for images and components', async ({ page }) => {
      await page.goto('/');
      
      // Login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'operator@test.com');
      await page.fill('[data-testid="password-input"]', 'testpass123');
      await page.click('[data-testid="submit-login"]');
      
      // Images should have loading="lazy" attribute
      const images = await page.locator('img').all();
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        if (loading) {
          expect(loading).toBe('lazy');
        }
      }
      
      // Components should load as needed
      await page.goto('/analytics');
      
      // Analytics components should load lazily
      await expect(page.locator('[data-testid="analytics-skeleton"]')).toBeVisible();
      await expect(page.locator('[data-testid="analytics-content"]')).toBeVisible();
    });
  });
});