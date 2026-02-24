import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Header from '../screens/Header';
import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import AddContactScreen from '../screens/AddContactScreen';
import EditContactScreen from '../screens/EditContactScreen';
import ContactListScreen from '../screens/ContactListScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

// Definição dos tipos de navegação
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AddContact: undefined;
  EditContact: {
    contact: {
      id: string;
      nome: string;
      email: string;
      idade: number;
      telefone: string;
      usuarioId: string;
      criadoEm: any;
    };
  };
  ContactList: undefined;
  Home: undefined;
  Details: undefined;
  UserList: undefined;
  Profile: undefined;
};

// Criação da pilha de navegação
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigationRef = useNavigationContainerRef();
  const previousUserRef = useRef<any>(undefined);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log('🔵 Verificando estado de autenticação...');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔄 Estado de autenticação mudou:', currentUser ? `Logado: ${currentUser.email}` : 'Deslogado');
      console.log('📊 Estado anterior:', previousUserRef.current ? 'tinha usuário' : 'sem usuário');
      console.log('📊 Estado novo:', currentUser ? 'tem usuário' : 'sem usuário');

      // Se estava logado e agora não está mais (LOGOUT)
      if (previousUserRef.current && !currentUser) {
        console.log('🚪 LOGOUT DETECTADO! Redirecionando para Login...');
        setUser(null);

        // Força navegação para Login após um pequeno delay
        setTimeout(() => {
          if (navigationRef.isReady()) {
            console.log('🔄 Navegando para Login via navigationRef');
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' as never }],
            });
          }
        }, 100);
      } else {
        setUser(currentUser);
      }

      previousUserRef.current = currentUser;

      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    console.log('⏳ Carregando estado de autenticação...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  console.log('🎯 Renderizando navegação. Usuário:', user ? 'Autenticado' : 'Não autenticado');

  // Oculta o Header apenas nas rotas de Login e Register
  const shouldShowHeader = !(currentRoute === 'Login' || currentRoute === 'Register');

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
      onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
    >
      {shouldShowHeader && <Header />}

      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366F1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // Telas para usuários autenticados
          <>
            {/* UserList removido da navegação conforme solicitado */}

            <Stack.Screen
              name="ContactList"
              component={ContactListScreen}
              options={{
                title: 'Meus Contatos',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="AddContact"
              component={AddContactScreen}
              options={{
                title: 'Adicionar Contato',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="EditContact"
              component={EditContactScreen}
              options={{
                title: 'Editar Contato',
                headerShown: true,
              }}
            />

            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
          </>
        ) : (
          // Telas para usuários não autenticados
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Criar Conta',
                headerShown: true,
              }}
            />

            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                title: 'Recuperar Senha',
                headerShown: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
