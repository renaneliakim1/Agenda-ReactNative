import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '../../components/themed-view';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mostrarAlerta, mostrarSucesso, mostrarErro } from '../utils/alertHelper';

type EditContactScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditContact'>;
type EditContactScreenRouteProp = RouteProp<RootStackParamList, 'EditContact'>;

type Props = {
	navigation: EditContactScreenNavigationProp;
	route: EditContactScreenRouteProp;
};

export default function EditContactScreen({ navigation, route }: Props) {
	const { contact } = route.params;
	const { theme } = useTheme();
	const textColor = Colors[theme].text;
	const subtitleColor = Colors[theme].icon;
	const inputBg = theme === 'light' ? '#FFFFFF' : Colors.dark.background;
	const inputBorder = theme === 'light' ? '#E5E7EB' : '#374151';
	const cardBg = theme === 'light' ? '#FFFFFF' : Colors.dark.background;

	const [nome, setNome] = useState(contact.nome || '');
	const [email, setEmail] = useState(contact.email || '');
	const [idade, setIdade] = useState(contact.idade?.toString() || '');
	const [telefone, setTelefone] = useState(contact.telefone || '');
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

	const handleUpdateContact = async () => {
		console.log('📝 Atualizando contato:', contact.id);

		// Validações
		if (!nome || !email || !idade || !telefone) {
			mostrarErro('Por favor, preencha todos os campos');
			return;
		}

		if (!isValidEmail(email)) {
			mostrarErro('E-mail inválido');
			return;
		}

		const idadeNum = parseInt(idade);
		if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 150) {
			mostrarErro('Idade inválida');
			return;
		}

		if (!isValidPhone(telefone)) {
			mostrarErro('Telefone deve conter 10 ou 11 dígitos');
			return;
		}

		setLoading(true);

		try {
			const contatoRef = doc(db, 'contatos', contact.id);

			await updateDoc(contatoRef, {
				nome,
				email,
				idade: idadeNum,
				telefone,
			});

			console.log('✅ Contato atualizado com sucesso!');
			mostrarSucesso('Contato atualizado com sucesso!');

			setTimeout(() => {
				navigation.goBack();
			}, 500);

		} catch (error: any) {
			console.error('❌ Erro ao atualizar contato:', error);
			mostrarErro('Não foi possível atualizar o contato. Tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedView style={styles.safeArea}>
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
						<MaterialCommunityIcons name="account-edit" size={56} color="#6366F1" />
						<Text style={[styles.title, { color: textColor }]}>Editar Contato</Text>
						<Text style={[styles.subtitle, { color: subtitleColor }]}>Atualize as informações do contato</Text>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Nome Completo</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
								placeholder="Ex: João Silva"
								placeholderTextColor={subtitleColor}
								value={nome}
								onChangeText={setNome}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Email</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
								placeholder="seu@email.com"
								placeholderTextColor={subtitleColor}
								keyboardType="email-address"
								autoCapitalize="none"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Idade</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
								placeholder="Ex: 25"
								placeholderTextColor={subtitleColor}
								keyboardType="numeric"
								value={idade}
								onChangeText={setIdade}
								maxLength={3}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Telefone</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
								placeholder="(11) 98765-4321"
								placeholderTextColor={subtitleColor}
								keyboardType="phone-pad"
								value={telefone}
								onChangeText={setTelefone}
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleUpdateContact}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<>
									<MaterialCommunityIcons name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
									<Text style={styles.buttonText}>Salvar Alterações</Text>
								</>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.cancelButton, { backgroundColor: cardBg, borderColor: inputBorder }]}
							onPress={() => navigation.goBack()}
							disabled={loading}
						>
							<Text style={[styles.cancelButtonText, { color: textColor }]}>Cancelar</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 30,
		marginTop: 10,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1F2937',
		marginBottom: 8,
		textAlign: 'center',
		marginTop: 16,
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		fontWeight: '400',
	},
	formContainer: {
		gap: 16,
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
		flexDirection: 'row',
		justifyContent: 'center',
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
	cancelButton: {
		borderWidth: 2,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 20,
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
	},
	cancelButtonText: {
		color: '#6B7280',
		fontSize: 16,
		fontWeight: '600',
		letterSpacing: 0.3,
	},
});
