import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InstallAppButtonProps {
  className?: string;
  variant?: 'button' | 'banner';
}

const InstallAppButton: React.FC<InstallAppButtonProps> = ({ 
  className = '', 
  variant = 'button' 
}) => {
  const [showInstall, setShowInstall] = useState(false);
  const [platformInfo, setPlatformInfo] = useState({
    isMobile: false,
    isWindows: false,
    isChrome: false,
    isEdge: false,
    isSafari: false
  });
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  useEffect(() => {
    const ua = navigator.userAgent;
    const isWindows = /Windows/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua);
    const isEdge = /Edge|Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    
    setPlatformInfo({
      isMobile: isAndroid || isIOS,
      isWindows,
      isChrome,
      isEdge,
      isSafari
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store the prompt for all devices that support it
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       ((navigator as any).standalone === true) || 
                       document.referrer.includes('android-app://');
    
    // Only show install prompt if the app isn't already installed
    setShowInstall(!isStandalone);
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Hide button after installation
    const handleAppInstalled = () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (deferredPrompt) {
      // For browsers that support the beforeinstallprompt event
      (deferredPrompt as any).prompt();
      (deferredPrompt as any).userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      // For Safari on iOS or other browsers without beforeinstallprompt support
      const installInstructions = platformInfo.isSafari && !platformInfo.isMobile ? 
        "To install, click 'Share' and then 'Add to Home Screen'" : 
        platformInfo.isWindows && (platformInfo.isChrome || platformInfo.isEdge) ?
        "Click the install icon in the address bar or go to browser menu and select 'Install TaskCanvas'" :
        "Add this app to your home screen for easier access";
      
      alert(installInstructions);
    }
  };
  
  // Don't show anything if the app is already installed
  if (!showInstall) {
    return null;
  }
  
  if (variant === 'banner') {
    return (
      <div 
        id="install-banner"
        className={`fixed bottom-0 left-0 right-0 bg-indigo-600 text-white p-4 flex items-center justify-between z-50 ${className}`}
      >
        <div>
          <p className="font-medium">Install TaskCanvas</p>
          <p className="text-sm opacity-90">Use TaskCanvas even when you're offline</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowInstall(false)} 
            className="px-4 py-2 text-white bg-transparent border border-white/30 rounded-lg hover:bg-white/10"
          >
            Not now
          </button>
          <button
            id="install-button"
            onClick={handleInstallClick}
            className="px-4 py-2 text-indigo-600 bg-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-50"
          >
            <Download size={18} />
            Install
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {(showInstallButton || platformInfo.isSafari) && (
        variant === 'button' ? (
          <Button 
            onClick={handleInstallClick} 
            className={cn("flex items-center gap-2", className)}
            aria-label="Install TaskCanvas app"
          >
            <Download size={16} />
            {platformInfo.isMobile ? "Install App" : "Add to Desktop"}
          </Button>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-3 flex justify-between items-center z-50">
            <div className="flex items-center gap-2">
              <Download size={20} />
              <div>
                <p className="font-medium">Install TaskCanvas</p>
                <p className="text-xs opacity-90">Add to your {platformInfo.isMobile ? "home screen" : "desktop"}</p>
              </div>
            </div>
            <Button onClick={handleInstallClick} variant="secondary" size="sm">
              Install
            </Button>
          </div>
        )
      )}
    </>
  );
};

export default InstallAppButton; 