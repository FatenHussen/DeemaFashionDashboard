// firebase-messaging-sw.js
// This file MUST be in /public so it's served from the root URL

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCaWSRgKaqd0P__owf8MtZLhdInskytXKo',
  authDomain: 'tikmool-app-3241.firebaseapp.com',
  projectId: 'tikmool-app-3241',
  storageBucket: 'tikmool-app-3241.firebasestorage.app',
  messagingSenderId: '786190897596',
  appId: '1:786190897596:web:5a3eaba811e0f45141dbb9',
});

const messaging = firebase.messaging();

// Handle background messages (when the app is closed/minimized)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'Tikmool Admin', {
    body: body ?? '',
    icon: icon ?? '/favicon.ico',
  });
});
