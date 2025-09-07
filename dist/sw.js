// Service Worker for TSA ERP PWA
// Provides offline functionality and caching strategies

const CACHE_NAME = 'tsa-erp-v1';
const API_CACHE_NAME = 'tsa-erp-api-v1';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/operators',
  '/work-assignments',
  '/dashboard'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/operators',
  '/api/work-assignments',
  '/api/dashboard/stats'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      // Cache API resources
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching API resources');
        // Pre-cache important API endpoints
        return Promise.allSettled(
          API_CACHE_URLS.map(url => {
            return fetch(url)
              .then(response => response.ok ? cache.put(url, response) : null)
              .catch(() => null); // Ignore failures during install
          })
        );
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static resources with Cache First strategy
  if (isStaticResource(url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests with Network First, falling back to cache
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: try network first, fall back to cache
  event.respondWith(handleDefaultRequest(request));
});

// Network First strategy for API requests
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone());
      return response;
    }
    
    // If network response is not ok, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving API from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    // Return network response even if not ok (let app handle errors)
    return response;
    
  } catch (error) {
    console.log('[SW] Network failed for API request:', request.url);
    
    // Try to serve from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving API from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    if (isCriticalEndpoint(request.url)) {
      return createOfflineResponse(request.url);
    }
    
    throw error;
  }
}

// Cache First strategy for static resources
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Serving static from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', request.url);
    throw error;
  }
}

// Network First strategy for navigation
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Network failed for navigation:', request.url);
  }
  
  // Fall back to cache
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request) || await cache.match('/');
  
  if (cachedResponse) {
    console.log('[SW] Serving navigation from cache:', request.url);
    return cachedResponse;
  }
  
  // Return offline page
  return createOfflinePage();
}

// Default request handler
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions
function isStaticResource(url) {
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  );
}

function isCriticalEndpoint(url) {
  const criticalEndpoints = [
    '/api/operators',
    '/api/work-assignments',
    '/api/dashboard/stats'
  ];
  
  return criticalEndpoints.some(endpoint => url.includes(endpoint));
}

function createOfflineResponse(url) {
  const offlineData = {
    operators: {
      data: [],
      message: 'Offline mode - data may be outdated',
      cached: true
    },
    assignments: {
      data: [],
      message: 'Offline mode - data may be outdated', 
      cached: true
    },
    stats: {
      totalOperators: 0,
      activeAssignments: 0,
      completedToday: 0,
      efficiency: 0,
      message: 'Offline mode',
      cached: true
    }
  };

  let responseData = offlineData.operators;
  
  if (url.includes('/work-assignments')) {
    responseData = offlineData.assignments;
  } else if (url.includes('/dashboard/stats')) {
    responseData = offlineData.stats;
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Offline': 'true'
    }
  });
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TSA ERP - Offline</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
            text-align: center;
          }
          .container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 40px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          h1 { margin: 0 0 20px 0; color: #2563eb; }
          p { margin: 0 0 20px 0; color: #666; }
          button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1>You're Offline</h1>
          <p>It looks like you've lost your internet connection. Don't worry, TSA ERP works offline too!</p>
          <p>Some features may be limited while offline. Your data will sync when you're back online.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
    </html>
  `;

  return new Response(offlineHTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  });
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  switch (event.tag) {
    case 'sync-assignments':
      event.waitUntil(syncOfflineAssignments());
      break;
    case 'sync-production-data':
      event.waitUntil(syncProductionData());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  let notificationData = {
    title: 'TSA ERP Notification',
    body: 'You have a new update',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'general'
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click event:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      // If app is already open, focus it
      for (const client of clientsList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Sync offline assignments
async function syncOfflineAssignments() {
  console.log('[SW] Syncing offline assignments');
  
  try {
    // Get pending assignments from IndexedDB
    const pendingAssignments = await getPendingAssignments();
    
    for (const assignment of pendingAssignments) {
      try {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignment)
        });
        
        if (response.ok) {
          await removePendingAssignment(assignment.id);
          console.log('[SW] Synced assignment:', assignment.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync assignment:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Sync production data
async function syncProductionData() {
  console.log('[SW] Syncing production data');
  
  try {
    // Implementation for syncing production data
    const pendingData = await getPendingProductionData();
    
    for (const data of pendingData) {
      try {
        const response = await fetch('/api/production/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await removePendingProductionData(data.id);
          console.log('[SW] Synced production data:', data.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync production data:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Production sync failed:', error);
    throw error;
  }
}

// IndexedDB helper functions (simplified)
async function getPendingAssignments() {
  // Implementation would use IndexedDB to get pending assignments
  return [];
}

async function removePendingAssignment(id) {
  // Implementation would remove assignment from IndexedDB
  console.log('[SW] Removed pending assignment:', id);
}

async function getPendingProductionData() {
  // Implementation would use IndexedDB to get pending production data
  return [];
}

async function removePendingProductionData(id) {
  // Implementation would remove production data from IndexedDB
  console.log('[SW] Removed pending production data:', id);
}

// Log service worker messages
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded');