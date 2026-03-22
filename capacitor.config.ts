import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buddy.app',
  appName: 'Buddy',
  webDir: 'public',
  server: {
    // THIS IS THE KEY - point to your LIVE URL
    url: 'https://buddy-phi-azure.vercel.app/', // REPLACE WITH YOUR ACTUAL VERCEL URL
    cleartext: false, // For production, use HTTPS
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false // Disable for production
  }
};

export default config;