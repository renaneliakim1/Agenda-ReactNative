// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Platform } from 'react-native';

// Your web app's Firebase configuration
// As credenciais são carregadas do arquivo .env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configurar persistência de autenticação apenas no web
if (Platform.OS === 'web') {
  import('firebase/auth')
    .then(({ setPersistence, browserLocalPersistence }) => {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('✅ Persistência de autenticação configurada');
        })
        .catch((error) => {
          console.error('❌ Erro ao configurar persistência:', error);
        });
    })
    .catch((err) => {
      console.error('❌ Erro ao importar firebase/auth para persistência web:', err);
    });
}

export { app };