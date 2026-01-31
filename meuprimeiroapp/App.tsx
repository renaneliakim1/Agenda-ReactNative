import AppNavigator from "./src/navigation/AppNavigator";
import React from "react";
import { app, db } from './src/config/firebaseConfig';

console.log('Firebase connectado:', app.name);
console.log('Firestore instância:', db ? 'Disponível' : 'Indisponível');

export default function App() {
  return <AppNavigator />;
}


