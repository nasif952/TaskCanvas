// TaskCanvas Service Worker
const CACHE_NAME = 'taskcanvas-cache-v1';

// Assets to cache immediately when the service worker installs
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add critical CSS and JS files here
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request is for a page/route
const isRouteRequest = (request) => {
  const url = new URL(request.url);
  // If it's same origin and doesn't have a file extension or ends with '/', it's a route
  return request.mode === 'navigate' || 
    (url.origin === self.location.origin && 
     !url.pathname.includes('.') || 
     url.pathname.endsWith('/'));
};

// Helper function to determine if we should cache this request
const shouldCache = (url) => {
  // Don't cache API requests
  if (url.includes('/api/')) return false;
  
  // Cache static assets (images, fonts, css, js)
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
  return cacheableExtensions.some(ext => url.endsWith(ext));
};

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For page/route requests, use network first strategy with cache fallback
  if (isRouteRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          // If network fails, try to serve from cache, or serve fallback HTML
          return caches.match(event.request)
            .then((cacheResponse) => {
              return cacheResponse || caches.match('/index.html');
            });
        })
    );
    return;
  }

  // For other assets, use cache first, then network
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      if (cacheResponse) {
        // Asset in cache, return it
        return cacheResponse;
      }

      // Not in cache, get from network
      return fetch(event.request).then((networkResponse) => {
        // Check if we should cache this
        const url = event.request.url;
        
        if (!shouldCache(url) || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Clone the response as we're going to use it and put it in the cache
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return networkResponse;
      }).catch(() => {
        // Network failed, no cached response exists
        console.log('Service Worker: Fetch failed for', event.request.url);
        
        // For image requests, potentially return a placeholder
        if (event.request.destination === 'image') {
          return caches.match('/placeholder.svg');
        }
        
        // No fallback available
        return new Response('Network error occurred', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// Additional feature - background sync for failed requests
// Only enabled in browsers that support it
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
      event.waitUntil(syncTasks());
    }
  });
}

// Helper function to sync tasks
async function syncTasks() {
  try {
    const db = await openDatabase();
    const pendingTasks = await getPendingTasks(db);
    
    for (const task of pendingTasks) {
      try {
        // Try to sync the task with server
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task.data)
        });
        
        if (response.ok) {
          // Task synced successfully, remove from pending
          await removePendingTask(db, task.id);
        }
      } catch (error) {
        console.log('Failed to sync task', error);
        // Will retry on next sync event
      }
    }
  } catch (error) {
    console.log('Sync failed', error);
  }
}

// Helper functions for handling offline data (IndexedDB)
// These would be implemented based on your app's needs
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('taskcanvas-offline', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTasks')) {
        db.createObjectStore('pendingTasks', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function getPendingTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTasks'], 'readonly');
    const store = transaction.objectStore('pendingTasks');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removePendingTask(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTasks'], 'readwrite');
    const store = transaction.objectStore('pendingTasks');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/notification-badge.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'TaskCanvas Notification', 
        options
      )
    );
  } catch (error) {
    console.error('Error showing notification', error);
  }
});

// Notification click handler - open the app to the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Get the URL from the notification data or default to root
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window client is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
}); 