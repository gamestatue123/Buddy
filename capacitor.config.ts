import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buddy.app',
  appName: 'Buddy',
  webDir: 'public',
  server: {
    url: 'https://buddy-git-main-gamestatue123s-projects.vercel.app/', // Your deployed URL
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
    // Important: Add custom URL scheme for redirect
    customURLSchemes: ['com.buddy.app']
  }
};

export default config;
