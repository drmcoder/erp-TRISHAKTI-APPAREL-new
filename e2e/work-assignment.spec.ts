import { test, expect } from '@playwright/test';

test.describe('Work Assignment Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to be ready
    await page.waitForSelector('[data-testid="app-ready"]');
    
    // Login as supervisor for assignment tests
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'supervisor@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-content"]');
  });

  test('should display work assignment dashboard', async ({ page }) => {
    await page.goto('/assignments');
    
    // Check if main components are visible
    await expect(page.locator('[data-testid="work-assignment-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-work-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="operator-list"]')).toBeVisible();
    
    // Should show work items
    await expect(page.locator('.work-item-card')).toHaveCount.greaterThan(0);
  });

  test('should assign work to operator via drag and drop', async ({ page }) => {
    await page.goto('/assignments');
    
    // Wait for work items and operators to load
    await page.waitForSelector('.work-item-card');
    await page.waitForSelector('.operator-card');
    
    // Get first work item and first operator
    const workItem = page.locator('.work-item-card').first();
    const operator = page.locator('.operator-card').first();
    
    // Perform drag and drop
    await workItem.dragTo(operator);
    
    // Should show assignment confirmation modal
    await expect(page.locator('[data-testid="assignment-confirmation-modal"]')).toBeVisible();
    
    // Confirm assignment
    await page.click('[data-testid="confirm-assignment"]');
    
    // Should show success notification
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Work assigned successfully');
  });

  test('should assign work using assignment modal', async ({ page }) => {
    await page.goto('/assignments');
    
    // Click assign button on first work item
    await page.click('.work-item-card:first-child [data-testid="assign-button"]');
    
    // Should open assignment modal
    await expect(page.locator('[data-testid="assignment-modal"]')).toBeVisible();
    
    // Select operator
    await page.click('[data-testid="operator-select"]');
    await page.click('[data-testid="operator-option-1"]');
    
    // Set priority
    await page.selectOption('[data-testid="priority-select"]', 'high');
    
    // Add notes
    await page.fill('[data-testid="assignment-notes"]', 'Handle with care - premium fabric');
    
    // Submit assignment
    await page.click('[data-testid="submit-assignment"]');
    
    // Should close modal and show success
    await expect(page.locator('[data-testid="assignment-modal"]')).not.toBeVisible();
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should show AI recommendations for work assignment', async ({ page }) => {
    await page.goto('/assignments');
    
    // Click assign button
    await page.click('.work-item-card:first-child [data-testid="assign-button"]');
    
    // Should show AI recommendations section
    await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible();
    
    // Should display recommendation cards
    await expect(page.locator('.recommendation-card')).toHaveCount.greaterThan(0);
    
    // Check recommendation details
    const firstRecommendation = page.locator('.recommendation-card').first();
    await expect(firstRecommendation.locator('[data-testid="confidence-score"]')).toBeVisible();
    await expect(firstRecommendation.locator('[data-testid="reasons-list"]')).toBeVisible();
    
    // Accept first recommendation
    await firstRecommendation.locator('[data-testid="accept-recommendation"]').click();
    
    // Should auto-fill operator selection
    await expect(page.locator('[data-testid="operator-select"]')).not.toHaveValue('');
    
    // Submit assignment
    await page.click('[data-testid="submit-assignment"]');
    
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should perform bulk assignment', async ({ page }) => {
    await page.goto('/assignments');
    
    // Select multiple work items
    await page.check('.work-item-card:nth-child(1) [data-testid="select-checkbox"]');
    await page.check('.work-item-card:nth-child(2) [data-testid="select-checkbox"]');
    await page.check('.work-item-card:nth-child(3) [data-testid="select-checkbox"]');
    
    // Should show bulk action bar
    await expect(page.locator('[data-testid="bulk-action-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('3 selected');
    
    // Click bulk assign
    await page.click('[data-testid="bulk-assign-button"]');
    
    // Should open bulk assignment modal
    await expect(page.locator('[data-testid="bulk-assignment-modal"]')).toBeVisible();
    
    // Select assignment strategy
    await page.selectOption('[data-testid="assignment-strategy"]', 'skill_based');
    
    // Preview assignments
    await page.click('[data-testid="preview-assignments"]');
    
    // Should show assignment preview
    await expect(page.locator('[data-testid="assignment-preview"]')).toBeVisible();
    await expect(page.locator('.assignment-preview-item')).toHaveCount(3);
    
    // Confirm bulk assignment
    await page.click('[data-testid="confirm-bulk-assignment"]');
    
    // Should show success message
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('3 work items assigned');
  });

  test('should filter work items and operators', async ({ page }) => {
    await page.goto('/assignments');
    
    // Test work item filters
    await page.click('[data-testid="work-item-filters"]');
    
    // Filter by operation
    await page.selectOption('[data-testid="operation-filter"]', 'cutting');
    await page.click('[data-testid="apply-filters"]');
    
    // Should only show cutting operations
    await expect(page.locator('.work-item-card')).toHaveCount.greaterThan(0);
    await expect(page.locator('.work-item-card [data-testid="operation"]')).toHaveText(/cutting/i);
    
    // Filter by priority
    await page.selectOption('[data-testid="priority-filter"]', 'high');
    await page.click('[data-testid="apply-filters"]');
    
    // Should show filtered results
    await expect(page.locator('.work-item-card [data-testid="priority-badge"]')).toHaveText(/high/i);
    
    // Clear filters
    await page.click('[data-testid="clear-filters"]');
    
    // Should show all items again
    await expect(page.locator('.work-item-card')).toHaveCount.greaterThan(3);
  });
});

test.describe('Operator Self-Assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login as operator
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.waitForSelector('[data-testid="dashboard-content"]');
  });

  test('should display available work for self-assignment', async ({ page }) => {
    await page.goto('/self-assignment');
    
    // Should show available work interface
    await expect(page.locator('[data-testid="self-assignment-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-work-list"]')).toBeVisible();
    
    // Should show work items with compatibility scores
    const workCards = page.locator('.available-work-card');
    await expect(workCards).toHaveCount.greaterThan(0);
    
    // Check for compatibility indicators
    await expect(workCards.first().locator('[data-testid="compatibility-score"]')).toBeVisible();
    await expect(workCards.first().locator('[data-testid="skill-match"]')).toBeVisible();
  });

  test('should request work assignment', async ({ page }) => {
    await page.goto('/self-assignment');
    
    // Find a compatible work item
    const compatibleWork = page.locator('.available-work-card').first();
    await compatibleWork.locator('[data-testid="request-work-button"]').click();
    
    // Should open request modal
    await expect(page.locator('[data-testid="work-request-modal"]')).toBeVisible();
    
    // Fill request details
    await page.fill('[data-testid="request-reason"]', 'I have extensive experience with this operation');
    await page.fill('[data-testid="estimated-completion"]', '2024-12-31T17:00');
    
    // Submit request
    await page.click('[data-testid="submit-request"]');
    
    // Should show success message
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Request sent for approval');
    
    // Work should now show as requested
    await expect(compatibleWork.locator('[data-testid="status-badge"]')).toContainText('Requested');
  });

  test('should show work eligibility restrictions', async ({ page }) => {
    await page.goto('/self-assignment');
    
    // Look for work items that are not eligible
    const ineligibleWork = page.locator('.available-work-card[data-eligible="false"]').first();
    
    if (await ineligibleWork.count() > 0) {
      // Should show eligibility reasons
      await expect(ineligibleWork.locator('[data-testid="ineligible-reasons"]')).toBeVisible();
      
      // Request button should be disabled
      await expect(ineligibleWork.locator('[data-testid="request-work-button"]')).toBeDisabled();
      
      // Should show restrictions clearly
      await expect(ineligibleWork.locator('[data-testid="restriction-badge"]')).toBeVisible();
    }
  });
});

test.describe('Work Completion Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login as operator
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'operator@test.com');
    await page.fill('[data-testid="password-input"]', 'testpass123');
    await page.click('[data-testid="submit-login"]');
    
    await page.waitForSelector('[data-testid="dashboard-content"]');
  });

  test('should display current work assignments', async ({ page }) => {
    await page.goto('/my-work');
    
    // Should show work completion interface
    await expect(page.locator('[data-testid="work-completion-interface"]')).toBeVisible();
    
    // Should display current work items
    await expect(page.locator('[data-testid="current-work-list"]')).toBeVisible();
    
    // Should show work progress
    const workCard = page.locator('.current-work-card').first();
    await expect(workCard.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(workCard.locator('[data-testid="pieces-completed"]')).toBeVisible();
  });

  test('should complete work without damage', async ({ page }) => {
    await page.goto('/my-work');
    
    // Click complete on first work item
    await page.click('.current-work-card:first-child [data-testid="complete-work-button"]');
    
    // Should open completion modal
    await expect(page.locator('[data-testid="work-completion-modal"]')).toBeVisible();
    
    // Fill completion details
    await page.fill('[data-testid="pieces-completed"]', '50');
    await page.selectOption('[data-testid="quality-grade"]', 'A');
    await page.fill('[data-testid="completion-notes"]', 'Work completed successfully, good quality');
    
    // Submit completion
    await page.click('[data-testid="submit-completion"]');
    
    // Should show success message with earnings
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText(/completed.*earned/i);
    
    // Work should be removed from current work list
    await expect(page.locator('.current-work-card')).toHaveCount.lessThan(3);
  });

  test('should complete work with damage reporting', async ({ page }) => {
    await page.goto('/my-work');
    
    // Click complete on work item
    await page.click('.current-work-card:first-child [data-testid="complete-work-button"]');
    
    // Indicate damage occurred
    await page.check('[data-testid="damage-occurred-checkbox"]');
    
    // Should show damage reporting section
    await expect(page.locator('[data-testid="damage-report-section"]')).toBeVisible();
    
    // Fill damage details
    await page.selectOption('[data-testid="damage-type"]', 'cutting_error');
    await page.fill('[data-testid="damaged-pieces"]', '3');
    await page.fill('[data-testid="damage-description"]', 'Fabric tore due to material weakness');
    
    // Fill completion details
    await page.fill('[data-testid="pieces-completed"]', '47'); // 50 - 3 damaged
    await page.selectOption('[data-testid="quality-grade"]', 'B');
    
    // Submit completion with damage
    await page.click('[data-testid="submit-completion"]');
    
    // Should show payment hold warning
    await expect(page.locator('.toast-warning')).toBeVisible();
    await expect(page.locator('.toast-warning')).toContainText(/payment.*held/i);
  });

  test('should prevent completion with invalid data', async ({ page }) => {
    await page.goto('/my-work');
    
    // Click complete on work item
    await page.click('.current-work-card:first-child [data-testid="complete-work-button"]');
    
    // Try to submit without required fields
    await page.click('[data-testid="submit-completion"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="pieces-completed-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-grade-error"]')).toBeVisible();
    
    // Modal should remain open
    await expect(page.locator('[data-testid="work-completion-modal"]')).toBeVisible();
    
    // Fill pieces with invalid value (more than target)
    await page.fill('[data-testid="pieces-completed"]', '200'); // Assuming target is 50
    await page.click('[data-testid="submit-completion"]');
    
    // Should show validation error for exceeding target
    await expect(page.locator('[data-testid="pieces-completed-error"]')).toContainText(/exceed/i);
  });
});