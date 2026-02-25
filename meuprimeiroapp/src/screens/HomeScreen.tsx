import { View, Text, Button, StyleSheet } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {

  useEffect(() => {
    console.log('HomeScreen montado');
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Bem Vindo ao Meu Primeiro App</Text>

      <Text style = { styles.text }> Escolha uma opção abaixo: </Text>
        <Button
            title="Ir para Detalhes"    
            onPress={() => navigation.navigate('Details')}
        />

        <View style = {{ marginTop: 10 }} />

        <Button 
          title="Ir para Cadastro"
          onPress={() => navigation.navigate('Register')} 
        />

        <View style = {{ marginTop: 10 }} />

        <Button 
          title="Ver Usuários Cadastrados"
          color="green"
          onPress={() => navigation.navigate('UserList')} 
        />

        <View style = {{ marginTop: 10 }} />

        <Button
          title="Ver Perfil"
          onPress={() => navigation.navigate('Profile')}
        />
    </ThemedView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },    
    title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  text:{
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',

  }
});

