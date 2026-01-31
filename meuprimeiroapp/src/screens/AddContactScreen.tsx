import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AddContactScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddContact'>;

type Props = {
  navigation: AddContactScreenNavigationProp;
};

export default function AddContactScreen({ navigation }: Props) {
	const [nome, setNome] = useState('');
	const [email, setEmail] = useState('');
	const [idade, setIdade] = useState('');
	const [telefone, setTelefone] = useState('');
	const [loading, setLoading] = useState(false);

	// Validação de e-mail
	function isValidEmail(email: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Validação de telefone (10 ou 11 dígitos)
	function isValidPhone(phone: string) {
		const phoneNumbers = phone.replace(/\D/g, '');
		const phoneRegex = /^\d{10,11}$/;
		return phoneRegex.test(phoneNumbers);
	}

	const handleAddContact = async () => {
		console.log('🔵 Botão Adicionar Contato clicado!');
		console.log('Dados:', { nome, email, idade, telefone });
		
		// Validações
		if (!nome || !email || !idade || !telefone) {
			console.log('❌ Campos vazios detectados');
			Alert.alert('Erro', 'Por favor, preencha todos os campos');
			return;
		}

		if (!isValidEmail(email)) {
			console.log('❌ Email inválido:', email);
			Alert.alert('Erro', 'E-mail inválido');
			return;
		}

		const idadeNum = parseInt(idade);
		if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 150) {
			console.log('❌ Idade inválida:', idade);
			Alert.alert('Erro', 'Idade inválida');
			return;
		}

		if (!isValidPhone(telefone)) {
			console.log('❌ Telefone inválido:', telefone);
			Alert.alert('Erro', 'Telefone deve conter 10 ou 11 dígitos');
			return;
		}

		const user = auth.currentUser;
		console.log('Usuário atual:', user ? user.uid : 'NÃO AUTENTICADO');
		
		if (!user) {
			console.log('❌ Usuário não está logado');
			Alert.alert('Erro', 'Você precisa estar logado para adicionar contatos');
			navigation.navigate('Login');
			return;
		}

		console.log('✅ Todas as validações passaram, salvando contato...');
		setLoading(true);

		try {
			const contatoData = {
				nome,
				email,
				idade: idadeNum,
				telefone,
				usuarioId: user.uid,
				criadoEm: serverTimestamp(),
			};
			
			console.log('📤 Salvando contato no Firestore:', contatoData);
			
			// Salvar contato no Firestore
			const docRef = await addDoc(collection(db, 'contatos'), contatoData);
			
			console.log('✅ Contato salvo com sucesso! ID:', docRef.id);

			Alert.alert(
				'Sucesso!',
				'Contato adicionado com sucesso!',
				[
					{
						text: 'OK',
						onPress: () => {
							console.log('Limpando formulário...');
							// Limpar formulário
							setNome('');
							setEmail('');
							setIdade('');
							setTelefone('');
						},
					},
				]
			);

		} catch (error: any) {
			console.error('❌ ERRO AO ADICIONAR CONTATO:', error);
			console.error('Código do erro:', error?.code);
			console.error('Mensagem:', error?.message);
			
			let message = 'Não foi possível adicionar o contato.';
			
			if (error?.code === 'permission-denied') {
				message = 'Erro de permissão no Firestore.\n\n' +
					'Verifique as regras de segurança:\n' +
					'1. Acesse console.firebase.google.com\n' +
					'2. Vá em Firestore Database > Regras\n' +
					'3. Certifique-se de que contatos permite escrita para usuários autenticados';
			}
			
			Alert.alert('Erro', message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView 
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<ScrollView 
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.headerContainer}>
						<MaterialCommunityIcons name="account-plus" size={56} color="#6366F1" />
						<Text style={styles.title}>Novo Contato</Text>
						<Text style={styles.subtitle}>Adicione um contato à sua agenda</Text>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Nome Completo</Text>
							<TextInput
								style={styles.input}
								placeholder="Nome do contato"
								placeholderTextColor="#9CA3AF"
								value={nome}
								onChangeText={setNome}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								placeholder="email@exemplo.com"
								placeholderTextColor="#9CA3AF"
								keyboardType="email-address"
								autoCapitalize="none"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Idade</Text>
							<TextInput
								style={styles.input}
								placeholder="Idade"
								placeholderTextColor="#9CA3AF"
								keyboardType="numeric"
								value={idade}
								onChangeText={setIdade}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Telefone</Text>
							<TextInput
								style={styles.input}
								placeholder="(00) 00000-0000"
								placeholderTextColor="#9CA3AF"
								keyboardType="phone-pad"
								value={telefone}
								onChangeText={setTelefone}
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleAddContact}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Adicionar Contato</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.secondaryButton}
							onPress={() => navigation.navigate('ContactList')}
						>
							<Text style={styles.secondaryButtonText}>Ver Meus Contatos</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
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
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 40,
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 32,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#1F2937',
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		fontWeight: '400',
	},
	formContainer: {
		marginBottom: 24,
		gap: 12,
	},
	inputGroup: {
		marginBottom: 4,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
		color: '#1F2937',
		letterSpacing: 0.3,
	},
	input: {
		borderWidth: 1.5,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		backgroundColor: '#FFFFFF',
		color: '#1F2937',
		fontWeight: '500',
	},
	button: {
		backgroundColor: '#6366F1',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 12,
		shadowColor: '#6366F1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonDisabled: {
		backgroundColor: '#C4B5FD',
		shadowOpacity: 0.1,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	secondaryButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: '#6366F1',
		paddingVertical: 16,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 8,
	},
	secondaryButtonText: {
		color: '#6366F1',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
});
