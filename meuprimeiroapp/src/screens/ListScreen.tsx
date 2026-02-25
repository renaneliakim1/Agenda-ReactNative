import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { collection, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
}

export default function ListScreen() {
  const navigation = useNavigation<any>();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    
    // Listener em tempo real - atualiza automaticamente quando há mudanças no Firestore
    const q = query(collection(db, 'usuarios'), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usuariosCarregados: Usuario[] = [];
        querySnapshot.forEach((doc) => {
          usuariosCarregados.push({
            id: doc.id,
            ...doc.data(),
          } as Usuario);
        });
        
        setUsuarios(usuariosCarregados);
        setCarregando(false);
        console.log(`✅ ${usuariosCarregados.length} usuários carregados do Firebase (tempo real)`);
      },
      (erro) => {
        console.error('❌ Erro no listener do Firebase:', erro);
        setCarregando(false);
        Alert.alert(
          'Erro', 
          'Não foi possível conectar ao Firebase. Verifique sua conexão e as configurações.'
        );
      }
    );

    // Cleanup: desinscreve o listener quando o componente desmonta
    return () => unsubscribe();
  }, []);

  const deletarUsuario = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este cadastro?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              // Deleta o documento do Firestore
              await deleteDoc(doc(db, 'usuarios', id));
              
              // Remove da lista local
              const usuariosFiltrados = usuarios.filter((u) => u.id !== id);
              setUsuarios(usuariosFiltrados);
              
              Alert.alert('Sucesso', 'Cadastro deletado com sucesso!');
              console.log('Usuário deletado:', id);
              
            } catch (erro) {
              console.error('Erro ao deletar usuário:', erro);
              console.error('Código do erro:', (erro as any)?.code);
              const codigo = (erro as any)?.code;
              if (codigo === 'permission-denied') {
                Alert.alert('Erro', 'Permissão negada: verifique as regras do Firestore para a coleção "usuarios"');
              } else {
                Alert.alert('Erro', 'Não foi possível deletar o cadastro');
              }
            }
          },
        },
      ]
    );
  };

  const limparTodos = async () => {
    Alert.alert(
      'Limpar todos',
      'Tem certeza que deseja deletar TODOS os cadastros?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Deletar Tudo',
          onPress: async () => {
            try {
              // Deleta todos os documentos da coleção
              const querySnapshot = await getDocs(collection(db, 'usuarios'));
              const deletePromises = querySnapshot.docs.map((documento) =>
                deleteDoc(doc(db, 'usuarios', documento.id))
              );
              
              await Promise.all(deletePromises);
              
              setUsuarios([]);
              Alert.alert('Sucesso', 'Todos os cadastros foram deletados!');
              console.log('Todos os usuários foram deletados');
              
            } catch (erro) {
              console.error('Erro ao limpar dados:', erro);
              console.error('Código do erro:', (erro as any)?.code);
              const codigo = (erro as any)?.code;
              if (codigo === 'permission-denied') {
                Alert.alert('Erro', 'Permissão negada: verifique as regras do Firestore para a coleção "usuarios"');
              } else {
                Alert.alert('Erro', 'Não foi possível limpar os dados');
              }
            }
          },
        },
      ]
    );
  };

  const renderizarUsuario = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Email:</Text> {item.email}
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Telefone:</Text> {item.telefone}
        </Text>
        <Text style={styles.cardTexto}>
          <Text style={styles.label}>Data:</Text> {item.data}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.botaoDeletar}
        onPress={() => deletarUsuario(item.id)}
      >
        <Text style={styles.textoBotaoDeletar}>Deletar</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.titulo}>Carregando...</Text>
        <ActivityIndicator size="large" color="#2c82c9" />
      </ThemedView>
    );
  }

  const mostrarFlatList = usuarios.length > 0;
  const mostrarBotaoLimpar = usuarios.length > 0;

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.titulo}>Usuários Cadastrados</Text>
      <Text style={styles.contador}>{usuarios.length} cadastro(s)</Text>

      {mostrarFlatList ? (
        <FlatList
          data={usuarios}
          renderItem={renderizarUsuario}
          keyExtractor={(item) => item.id}
          style={styles.lista}
        />
      ) : (
        <View style={styles.vazioContainer}>
          <Text style={styles.textoVazio}>Nenhum cadastro realizado ainda</Text>
        </View>
      )}

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botaoNovo}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.botaoTexto}>NOVO CADASTRO</Text>
        </TouchableOpacity>

        {mostrarBotaoLimpar ? (
          <TouchableOpacity
            style={styles.botaoLimpar}
            onPress={limparTodos}
          >
            <Text style={styles.botaoTexto}>LIMPAR TODOS</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  contador: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  botaoDeletar: {
    backgroundColor: '#f44336',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textoBotaoDeletar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  vazioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVazio: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
  },
  botoesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 16,
    paddingBottom: 20,
  },
  botaoWrapper: {
    marginBottom: 12,
  },
  botaoNovo: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoLimpar: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoVoltar: {
    backgroundColor: '#757575',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.1)', // fundo levemente esmaecido
},
loadingBox: {
  padding: 20,
  backgroundColor: '#fff',
  borderRadius: 12,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 5, // para Android
},
loadingText: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},

});