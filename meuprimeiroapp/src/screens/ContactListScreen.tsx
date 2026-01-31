import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	SafeAreaView,
	ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { signOut } from 'firebase/auth';

type ContactListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ContactList'>;

type Props = {
  navigation: ContactListScreenNavigationProp;
};

interface Contact {
	id: string;
	nome: string;
	email: string;
	idade: number;
	telefone: string;
}

export default function ContactListScreen({ navigation }: Props) {
	const [contatos, setContatos] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const user = auth.currentUser;
		if (!user) {
			Alert.alert('Erro', 'Você precisa estar logado');
			navigation.navigate('Login');
			return;
		}

		// Listener em tempo real dos contatos do usuário
		const q = query(
			collection(db, 'contatos'),
			where('usuarioId', '==', user.uid)
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const contatosData: Contact[] = [];
				snapshot.forEach((doc) => {
					contatosData.push({
						id: doc.id,
						...doc.data(),
					} as Contact);
				});

				// Ordena no cliente para evitar necessidade de índice composto
				contatosData.sort((a: any, b: any) => {
					const dateA = a.criadoEm?.toMillis?.() || 0;
					const dateB = b.criadoEm?.toMillis?.() || 0;
					return dateB - dateA; // Ordem decrescente
				});

				setContatos(contatosData);
				setLoading(false);
			},
			(error) => {
				console.error('Erro ao buscar contatos:', error);
				Alert.alert('Erro', 'Não foi possível carregar os contatos');
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const handleDeleteContact = (id: string, nome: string) => {
		Alert.alert(
			'Confirmar Exclusão',
			`Deseja realmente excluir ${nome}?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteDoc(doc(db, 'contatos', id));
							Alert.alert('Sucesso', 'Contato excluído com sucesso');
						} catch (error) {
							console.error('Erro ao excluir contato:', error);
							Alert.alert('Erro', 'Não foi possível excluir o contato');
						}
					},
				},
			]
		);
	};

	const handleLogout = async () => {
		console.log('🔵 Botão de logout clicado');
		
		// Confirmação via window.confirm para web
		const confirmLogout = window.confirm('Deseja realmente sair da sua conta?');
		console.log('🔵 Resposta do usuário:', confirmLogout ? 'Sim' : 'Não');
		
		if (!confirmLogout) {
			console.log('❌ Logout cancelado pelo usuário');
			return;
		}
		
		try {
			console.log('🔄 Fazendo logout...');
			const currentUserId = auth.currentUser?.uid;
			console.log('👤 Usuário antes do logout:', currentUserId);
			
			// Faz o signOut
			await signOut(auth);
			console.log('✅ Logout realizado com sucesso');
			console.log('👤 Usuário após logout:', auth.currentUser);
			
		} catch (error) {
			console.error('❌ Erro ao fazer logout:', error);
			Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
		}
	};

	const renderContact = ({ item }: { item: Contact }) => (
		<View style={styles.contactCard}>
			<View style={styles.contactHeader}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>
						{item.nome.charAt(0).toUpperCase()}
					</Text>
				</View>
				<View style={styles.contactInfo}>
					<Text style={styles.contactName}>{item.nome}</Text>
					<Text style={styles.contactDetail}>
						<MaterialCommunityIcons name="email" size={14} color="#6B7280" /> {item.email}
					</Text>
					<Text style={styles.contactDetail}>
						<MaterialCommunityIcons name="phone" size={14} color="#6B7280" /> {item.telefone}
					</Text>
					<Text style={styles.contactDetail}>
						<MaterialCommunityIcons name="cake-variant" size={14} color="#6B7280" /> {item.idade} anos
					</Text>
				</View>
			</View>
			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => handleDeleteContact(item.id, item.nome)}
			>
				<MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
			</TouchableOpacity>
		</View>
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6366F1" />
					<Text style={styles.loadingText}>Carregando contatos...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.header}>
					<View>
						<Text style={styles.title}>Meus Contatos</Text>
						<Text style={styles.subtitle}>
							{contatos.length} {contatos.length === 1 ? 'contato' : 'contatos'}
						</Text>
					</View>
					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
					</TouchableOpacity>
				</View>

				{contatos.length === 0 ? (
					<View style={styles.emptyContainer}>
						<MaterialCommunityIcons name="account-off" size={80} color="#D1D5DB" />
						<Text style={styles.emptyTitle}>Nenhum contato ainda</Text>
						<Text style={styles.emptySubtitle}>
							Adicione seu primeiro contato para começar
						</Text>
					</View>
				) : (
					<FlatList
						data={contatos}
						keyExtractor={(item) => item.id}
						renderItem={renderContact}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
					/>
				)}

				<TouchableOpacity
					style={styles.fab}
					onPress={() => navigation.navigate('AddContact')}
				>
					<MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1F2937',
	},
	subtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 4,
	},
	logoutButton: {
		padding: 8,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: '#6B7280',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#1F2937',
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 8,
		textAlign: 'center',
	},
	listContent: {
		padding: 16,
		paddingBottom: 80,
	},
	contactCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	contactHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#6366F1',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	avatarText: {
		fontSize: 20,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	contactInfo: {
		flex: 1,
	},
	contactName: {
		fontSize: 18,
		fontWeight: '600',
		color: '#1F2937',
		marginBottom: 4,
	},
	contactDetail: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 2,
	},
	deleteButton: {
		padding: 8,
	},
	fab: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#6366F1',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#6366F1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 8,
		elevation: 6,
	},
});
