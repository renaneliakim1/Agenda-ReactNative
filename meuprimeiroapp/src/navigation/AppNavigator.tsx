import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';

// Criação da pilha de navegação

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName = "Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{title: 'Detalhes'}}/>

      <Stack.Screen
        name='Register'
        component = {RegisterScreen}
        options={{ title: 'Cadastro' }}
      />  
    </Stack.Navigator>
  );
}