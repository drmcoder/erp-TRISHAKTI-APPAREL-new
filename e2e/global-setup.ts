import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Setup test data and authentication if needed
    console.log('🚀 Setting up E2E test environment...');
    
    // Navigate to the application
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173');
    
    // Wait for app to be ready
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });
    
    // Setup test users and data
    await setupTestData(page);
    
    console.log('✅ E2E test environment setup complete');
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  // Mock Firebase authentication for testing
  await page.addInitScript(() => {
    // Mock Firebase auth state
    window.mockAuth = {
      currentUser: {
        uid: 'test-operator-1',
        email: 'operator@test.com',
        displayName: 'Test Operator',
      }
    };

    // Mock localStorage data
    const mockNotifications = [
      {
        id: 'test-notif-1',
        type: 'assignment',
        title: 'New Work Assignment',
        message: 'Bundle B001 assigned for cutting',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      }
    ];

    localStorage.setItem('tsa-erp-notifications', JSON.stringify(mockNotifications));
    localStorage.setItem('tsa-erp-user', JSON.stringify(window.mockAuth.currentUser));
  });

  // Add test data markers
  await page.addInitScript(() => {
    window.testDataReady = true;
  });
}

export default globalSetup;