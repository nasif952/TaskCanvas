// PWA Installation Prompt Script
let deferredPrompt;
const installButton = document.getElementById('install-button');
const installBanner = document.getElementById('install-banner');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show the install button or banner
  if (installButton) installButton.style.display = 'block';
  if (installBanner) installBanner.style.display = 'flex';
  
  // Optional: Log the platforms on which the app can be installed
  console.log(`App can be installed on: ${e.platforms}`);
});

// Function to handle the install button click
function installApp() {
  if (!deferredPrompt) {
    // The app is already installed or not available for installation
    console.log('App installation not available');
    return;
  }
  
  // Show the installation prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      // Hide the button/banner after installation
      if (installButton) installButton.style.display = 'none';
      if (installBanner) installBanner.style.display = 'none';
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, discard it
    deferredPrompt = null;
  });
}

// Handle the install success event
window.addEventListener('appinstalled', (event) => {
  console.log('App was successfully installed');
  // Hide the button/banner after installation
  if (installButton) installButton.style.display = 'none';
  if (installBanner) installBanner.style.display = 'none';
  
  // Optional: Send analytics event
  if (typeof gtag === 'function') {
    gtag('event', 'app_installed');
  }
});

// Detect if the app is already installed
window.addEventListener('DOMContentLoaded', () => {
  // iOS doesn't support `navigator.standalone` on iPad in most cases anymore
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (navigator.standalone === true) || 
                      document.referrer.includes('android-app://');
  
  if (isStandalone) {
    console.log('App is running in standalone mode (installed)');
    // Hide installation prompts for already installed app
    if (installButton) installButton.style.display = 'none';
    if (installBanner) installBanner.style.display = 'none';
  }
});

// Expose the install function globally so it can be called from buttons
window.installApp = installApp; 