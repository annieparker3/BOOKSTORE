/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  
  // Development Settings
  readonly VITE_DEV_SERVER_PORT: string;
  readonly VITE_DEV_HTTPS: string;
  
  // PWA Configuration
  readonly VITE_PWA_MODE: 'generateSW' | 'injectManifest';
  readonly VITE_PWA_REGISTER_TYPE: 'autoUpdate' | 'prompt';
  readonly VITE_PWA_INJECT_MANIFEST: string;
  readonly VITE_PWA_SCOPE: string;
  readonly VITE_PWA_STRATEGIES: 'generateSW' | 'injectManifest';
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_OFFLINE: string;
  
  // API Configuration
  readonly VITE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
  readonly VITE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
