// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
// @ts-ignore - Metro bundler needs this from firebase/auth even if TS complains
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim()
};

console.log("Firebase Config Initialization:");
console.log("API Key exists:", !!firebaseConfig.apiKey);
console.log("Project ID exists:", !!firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Configurar Auth com persistência nativa explicitamente para evitar network-request-failed
// e problemas de inicialização lenta devido ao AsyncStorage incompleto no SDK 12
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: Platform.OS === 'web'
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  console.warn("Falha ao inicializar auth com persistência, tentando fallback:", e);
  authInstance = initializeAuth(app);
}

export const auth = authInstance;

export { app };