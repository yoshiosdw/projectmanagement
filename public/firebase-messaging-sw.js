// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// Inisialisasi Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCxc2YiDLLAapSEiCJDppZ-8yke7EUs32Q",
  authDomain: "vehicle-13496.firebaseapp.com",
  projectId: "vehicle-13496",
  storageBucket: "vehicle-13496.firebasestorage.app",
  messagingSenderId: "214582753434",
  appId: "1:214582753434:web:144d2e85b5a334d0a20723",
  measurementId: "G-ZS7NHRTB4L",
})

const messaging = firebase.messaging()

// ✅ Untuk pesan FCM saat di background
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received FCM background message:', payload)

  const title = payload.notification?.title || 'Notifikasi dari FCM'

  const options = {
    body: payload.notification?.body || 'Tidak ada isi pesan',
    icon: '/sjb.png',
    data: {
      link: payload.fcmOptions?.link || '/',
    },
  }

  self.registration.showNotification(title, options)
})

// ✅ Untuk test push dari DevTools
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.', event)

  let data = {}

  try {
    data = event.data?.json() || {}
  } catch (e) {
    console.warn('❌ Push payload bukan JSON')
  }

  const title = data.notification?.title || 'Tes Notifikasi DevTools'

  const options = {
    body: data.notification?.body || 'Body kosong',
    icon: '/sjb.png',
  }

  event.waitUntil(
    self.registration.showNotification(title, options),
  )
})

// Buka tab saat klik notifikasi
self.addEventListener('notificationclick', function (event) {
  const link = event.notification?.data?.link || '/'

  event.notification.close()
  event.waitUntil(
    clients.openWindow(link),
  )
})
