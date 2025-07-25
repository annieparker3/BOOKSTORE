export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module',
      });

      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates every hour
      setInterval(() => {
        registration.update().catch(err => 
          console.error('Error checking for service worker updates:', err)
        );
      }, 60 * 60 * 1000);

      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return undefined;
    }
  }
  return undefined;
};

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
  // Listen for the 'load' event to ensure the service worker is registered after the page has loaded
  window.addEventListener('load', () => {
    registerServiceWorker().catch(error => {
      console.error('Error during service worker registration:', error);
    });
  });
}
