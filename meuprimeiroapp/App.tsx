import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { app, db, auth } from './src/config/firebaseConfig';
import ErrorBoundary from './src/components/ErrorBoundary';

console.log('Firebase connectado:', app.name);
console.log('Firestore instância:', db ? 'Disponível' : 'Indisponível');

// Suprime warning do react-native-web sobre pointerEvents (deprecado)
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

// Global error handlers (ajuda a capturar erros que causam tela branca)
if (typeof globalThis !== 'undefined' && (globalThis as any).ErrorUtils && (globalThis as any).ErrorUtils.setGlobalHandler) {
  const prev = (globalThis as any).ErrorUtils.getGlobalHandler?.();
  (globalThis as any).ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('Global ErrorUtils caught:', error, 'isFatal:', isFatal);
    if (prev) prev(error, isFatal);
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e: any) => {
    console.error('window.error captured:', e.error || e.message, e);
  });
  window.addEventListener('unhandledrejection', (e: any) => {
    console.error('unhandledrejection:', e.reason || e);
  });
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
