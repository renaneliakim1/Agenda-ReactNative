import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { mostrarAlertaConfirmacao, mostrarSucesso, mostrarErro } from '../utils/alertHelper';

interface Contact {
  id: string;
  nome: string;
  email: string;
  idade: number;
  telefone: string;
  usuarioId: string;
  criadoEm: any;
}

export default function UserListScreen({ navigation }: { navigation: any }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Usuário não autenticado');
      setLoading(false);
      return;
    }

    console.log('📋 Carregando contatos do usuário:', user.email);

    const q = query(
      collection(db, 'contatos'),
      where('usuarioId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Contact[];

        // Ordena no cliente para evitar necessidade de índice composto
        contactsList.sort((a, b) => {
          const dateA = a.criadoEm?.toMillis?.() || 0;
          const dateB = b.criadoEm?.toMillis?.() || 0;
          return dateB - dateA; // Ordem decrescente (mais recente primeiro)
        });

        console.log('✅ Contatos carregados:', contactsList.length);
        setContacts(contactsList);
        setFilteredContacts(contactsList);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erro ao buscar contatos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Função de busca
  const handleSearch = (text: string) => {
    setSearchText(text);
    
    if (text.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        const searchLower = text.toLowerCase();
        return (
          contact.nome.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.telefone.includes(text) ||
          contact.idade.toString().includes(text)
        );
      });
      setFilteredContacts(filtered);
    }
  };

  const handleDelete = (id: string, nome: string) => {
    mostrarAlertaConfirmacao(
      'Excluir Contato',
      `Deseja realmente excluir ${nome}?`,
      async () => {
        try {
          console.log('🗑️ Deletando contato:', id);
          await deleteDoc(doc(db, 'contatos', id));
          mostrarSucesso('Contato excluído com sucesso!');
          console.log('✅ Contato deletado');
        } catch (error) {
          console.error('❌ Erro ao excluir contato:', error);
          mostrarErro('Não foi possível excluir o contato. Tente novamente.');
        }
      },
      undefined,
      'Excluir',
      'Cancelar'
    );
  };

  const handleEdit = (contact: Contact) => {
    console.log('✏️ Editando contato:', contact.id);
    navigation.navigate('EditContact', { contact });
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Deseja realmente sair da sua conta?');
      
      if (!confirmLogout) {
        return;
      }
      
      try {
        console.log('🔄 Fazendo logout...');
        await signOut(auth);
        console.log('✅ Logout realizado');
        // A navegação será tratada automaticamente pelo onAuthStateChanged no AppNavigator
      } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        window.alert('Erro ao sair. Tente novamente.');
      }
    } else {
      Alert.alert(
        'Sair',
        'Deseja realmente sair da sua conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔄 Fazendo logout...');
                await signOut(auth);
                console.log('✅ Logout realizado');
                // A navegação será tratada automaticamente pelo onAuthStateChanged no AppNavigator
              } catch (error) {
                console.error('❌ Erro ao fazer logout:', error);
                Alert.alert('Erro', 'Não foi possível sair');
              }
            },
          },
        ]
      );
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nome}</Text>
        <Text style={styles.userDetail}>📧 {item.email}</Text>
        <Text style={styles.userDetail}>📱 {item.telefone}</Text>
        <Text style={styles.userDetail}>🎂 {item.idade} anos</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.nome)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Contatos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Carregando contatos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Contatos</Text>
        <Text style={styles.subtitle}>Total: {contacts.length}</Text>
       {/*  <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account" size={24} color="#fff" />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {contacts.length > 0 && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email ou telefone..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📱</Text>
          <Text style={styles.emptyMessage}>Nenhum contato cadastrado ainda.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddContact')}
          >
            <Text style={styles.addButtonText}>Adicionar Contato</Text>
          </TouchableOpacity>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptyMessage}>Nenhum contato encontrado com "{searchText}"</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSearch('')}
          >
            <Text style={styles.addButtonText}>Limpar Busca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigation.navigate('AddContact')}
          >
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366F1',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    position: 'relative',
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
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
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
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
