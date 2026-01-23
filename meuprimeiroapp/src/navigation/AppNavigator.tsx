import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import React from 'react';
import RegisterScreen from '../screens/RegisterScreen';
import UserListScreen from '../screens/UserListScreen';

// Definição dos tipos de navegação
export type RootStackParamList = {
  Home: undefined;
  Details: undefined;
  Register: undefined;
  UserList: undefined;
};

// Criação da pilha de navegação

const Stack = createNativeStackNavigator<RootStackParamList>();

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

      <Stack.Screen
        name='UserList'
        component = {UserListScreen}
        options={{ title: 'Lista de Usuários' }}
      />
    </Stack.Navigator>
  );
}