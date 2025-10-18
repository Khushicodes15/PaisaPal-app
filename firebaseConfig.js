import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded Firebase config (move to .env later)
const firebaseConfig = {
  apiKey: "AIzaSyDuiIn9OMC4MuCSE7oAGIqdPl82AiCRMA0",
  authDomain: "paisapal-d7583.firebaseapp.com",
  projectId: "paisapal-d7583",
  storageBucket: "paisapal-d7583.firebasestorage.app",
  messagingSenderId: "758965328433",
  appId: "1:758965328433:web:f89375db1fc9020d455310",
};

// Initialize Firebase
let app;
try {
  const apps = getApps();
  app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase init error:', error.message);
  throw error;
}

// Initialize Auth
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error('❌ Auth init error:', error.message);
  throw error;
}

export { auth };
export default app;