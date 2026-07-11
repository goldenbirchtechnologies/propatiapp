(function () {
  if (!('serviceWorker' in navigator)) return;

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[Push] Service worker registered', registration.scope);

      // Request notification permission (no UI override)
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Subscribe for push if supported
      if ('pushManager' in registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const vapidPublicKey = window.__NEXT_PUBLIC_VAPID_PUBLIC_KEY__;
          // If no VAPID key is configured, skip push subscription to avoid 4xx errors.
          if (!vapidPublicKey) {
            console.log('[Push] No VAPID public key configured; skipping subscription');
            return;
          }

          const convertedKey = vapidPublicKey.replace(/\s/g, '');
          const applicationServerKey = new Uint8Array(
            convertedKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
          );

          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }
      }
    } catch (error) {
      console.error('[Push] Registration failed:', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    register();
  }
})();
