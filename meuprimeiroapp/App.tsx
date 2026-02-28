import { Platform } from 'react-native';
if (Platform.OS !== 'web') {
  require('cross-fetch/polyfill');
}
import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { app, db, auth } from './src/config/firebaseConfig';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/context/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  if (typeof (window as any).addEventListener === 'function') {
    try {
      window.addEventListener('error', (e: any) => {
        console.error('window.error captured:', e.error || e.message, e);
      });
      window.addEventListener('unhandledrejection', (e: any) => {
        console.error('unhandledrejection:', e.reason || e);
      });
    } catch (err) {
      console.warn('Browser hooks addEventListener failed:', err);
    }
  } else {
    console.warn('window.addEventListener is not available in this environment');
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
