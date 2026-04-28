import { initializeApp } from 'firebase/app';
import { getToken, onMessage, getMessaging } from 'firebase/messaging';

// Same Firebase project as the user app
const firebaseConfig = {
  apiKey: 'AIzaSyCaWSRgKaqd0P__owf8MtZLhdInskytXKo',
  authDomain: 'tikmool-app-3241.firebaseapp.com',
  projectId: 'tikmool-app-3241',
  storageBucket: 'tikmool-app-3241.firebasestorage.app',
  messagingSenderId: '786190897596',
  appId: '1:786190897596:web:5a3eaba811e0f45141dbb9',
  measurementId: 'G-BFM25BQN9N',
};

const app = initializeApp(firebaseConfig);

// Messaging only works in browsers (not SSR)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// VAPID key — get this from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY =
  'BHxJpYUIBrVTZYt1h7wGONqoB5MZLIRDzWLU0K2lmq08-qOS2Ncy3TTldaowqkWDka7Zh2jVQr6DIaL63FAgfuk';

/**
 * Requests notification permission and returns the FCM token.
 * Returns null if permission denied or not supported.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.warn('[FCM] messaging not available');
      return null;
    }

    console.log('[FCM] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('[FCM] Permission result:', permission);

    if (permission !== 'granted') {
      console.warn('[FCM] Permission denied — go to browser settings and allow notifications for this site');
      return null;
    }

    console.log('[FCM] Registering service worker...');
    const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] Service worker registered:', sw.scope);

    console.log('[FCM] Getting token...');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });
    console.log('[FCM] Token:', token ? token.slice(0, 20) + '...' : 'null');

    return token || null;
  } catch (error) {
    console.error('[FCM] Error:', error);
    return null;
  }
}

/**
 * Listen for foreground messages (when the app is open).
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { app };
