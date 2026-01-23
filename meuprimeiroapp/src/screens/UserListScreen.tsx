import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';

interface User {
  id: string;
  nome: string;
  email: string;
  idade: string;
  phone: string;
}

export default function UserListScreen({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      console.log('Carregando usuários...');
      const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
        console.log('Usuários carregados:', parsedUsers.length);
      } else {
        console.log('Nenhum usuário encontrado');
        setUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedUsers = users.filter(u => u.id !== userId);
              await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
              setUsers(updatedUsers);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o usuário.');
            }
          }
        }
      ]
    );
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nome}</Text>
        <Text style={styles.userDetail}>📧 {item.email}</Text>
        <Text style={styles.userDetail}>📱 {item.phone}</Text>
        <Text style={styles.userDetail}>🎂 {item.idade} anos</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteUser(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuários Cadastrados</Text>
        <Text style={styles.subtitle}>Total: {users.length}</Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📝</Text>
          <Text style={styles.emptyMessage}>Nenhum usuário cadastrado ainda.</Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Cadastrar Usuário</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
