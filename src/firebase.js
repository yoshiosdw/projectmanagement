// src/firebase.js

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Konfigurasi Firebase dari Firebase Console kamu
const firebaseConfig = {
  apiKey: "AIzaSyCxc2YiDLLAapSEiCJDppZ-8yke7EUs32Q",
  authDomain: "vehicle-13496.firebaseapp.com",
  projectId: "vehicle-13496",
  storageBucket: "vehicle-13496.firebasestorage.app",
  messagingSenderId: "214582753434",
  appId: "1:214582753434:web:144d2e85b5a334d0a20723",
  measurementId: "G-ZS7NHRTB4L",
}


// Inisialisasi Firebase App
const firebaseApp = initializeApp(firebaseConfig)

// ✅ Inisialisasi FCM Messaging
const messaging = getMessaging(firebaseApp)

// ✅ Export semua yang dibutuhkan
export {
  messaging,
  getToken,
  onMessage,
}
