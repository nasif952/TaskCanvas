# TaskCanvas Progressive Web App (PWA)

TaskCanvas has been enhanced with Progressive Web App capabilities, allowing users to install it on their devices and use it offline.

## Features

- **Offline Access**: Access your tasks and projects even without an internet connection
- **Install on Device**: Install TaskCanvas on your computer, phone, or tablet
- **App-like Experience**: Enjoy a full-screen, app-like experience without browser chrome
- **Fast Loading**: Cached resources load quickly, improving performance
- **Update Notifications**: Automatic notifications when new app versions are available

## Installation

### Desktop (Chrome, Edge, etc.)

1. Visit TaskCanvas in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install TaskCanvas"
4. The app will open in its own window

### iOS (Safari)

1. Visit TaskCanvas in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Confirm by tapping "Add"
5. TaskCanvas will appear on your home screen

### Android (Chrome)

1. Visit TaskCanvas in Chrome
2. Tap the menu (⋮)
3. Tap "Add to Home screen"
4. Confirm by tapping "Add"
5. TaskCanvas will appear on your home screen

## Offline Usage

Once installed, TaskCanvas will cache essential resources. When offline:

- You can view previously loaded content
- Create new tasks that will sync when you're back online
- Edit existing projects
- Use all core functionality

Note: Some features that require real-time data may be limited or unavailable offline.

## Service Worker

The app uses a service worker to manage caching and offline functionality. Key capabilities:

- Cache-first strategy for static assets
- Network-first strategy for API requests
- Background sync for offline task creation
- Push notifications support

## For Developers

### Implementation Details

The PWA implementation includes:

- **Web Manifest**: Defines the app's appearance and behavior when installed
- **Service Worker**: Manages caching and offline functionality
- **App Install Banner**: Prompts users to install TaskCanvas
- **Offline Page**: Custom page shown when a user is offline and requests uncached content

### Generating Icons

To generate icons for the PWA:

1. Install the Sharp library:
   ```
   npm install sharp
   ```

2. Run the icon generation script:
   ```
   node public/icons/generate-icons.js
   ```

### Testing Service Worker

Use Chrome DevTools to test service worker functionality:

1. Open DevTools (F12)
2. Go to Application tab > Service Workers
3. Check "Offline" to simulate offline conditions
4. Use "Update on reload" to force service worker updates during development

## Troubleshooting

### App Not Installing

- Ensure you're using a supported browser (Chrome, Edge, Safari, Firefox)
- Visit the site directly (not in an iframe)
- Make sure you're using HTTPS
- Try clearing browser cache and reloading

### Offline Mode Not Working

- Check if the service worker is registered properly
- Visit several pages while online to cache them
- Ensure your browser supports service workers

### Updates Not Appearing

- Force reload the app (Ctrl+Shift+R)
- Check for "Update available" notifications
- Uninstall and reinstall the app 