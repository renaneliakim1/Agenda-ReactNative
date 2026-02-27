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
import { ThemedView } from '../../components/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
	navigation: RegisterScreenNavigationProp;
};

export default function RegisterScreen({ navigation }: Props) {
	const [nome, setNome] = useState('');
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [telefone, setTelefone] = useState('');
	const [loading, setLoading] = useState(false);
	const [showSenha, setShowSenha] = useState(true);
	const [showConfirmarSenha, setShowConfirmarSenha] = useState(true);

	const { theme, toggleTheme } = useTheme();
	const tint = Colors[theme].text;

	const textColor = Colors[theme].text;
	const subtitleColor = Colors[theme].icon;
	const inputBg = theme === 'light' ? '#F8FAFC' : '#0f1415';
	const inputBorderColor = theme === 'light' ? '#D1D5DB' : Colors[theme].icon;
	const buttonBg = theme === 'light' ? Colors[theme].tint : Colors.light.tint;
	const buttonTextColor = '#fff';

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

	const handleRegister = async () => {
		console.log('🔵 Botão Criar Conta clicado!');
		console.log('Dados:', { nome, email, telefone, senha: senha ? '***' : '', confirmarSenha: confirmarSenha ? '***' : '' });

		// Validações
		if (!nome || !email || !senha || !confirmarSenha || !telefone) {
			console.log('❌ Campos vazios detectados');
			Alert.alert('Erro', 'Por favor, preencha todos os campos');
			return;
		}

		if (!isValidEmail(email)) {
			console.log('❌ Email inválido:', email);
			Alert.alert('Erro', 'E-mail inválido');
			return;
		}

		if (senha.length < 6) {
			console.log('❌ Senha muito curta:', senha.length);
			Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
			return;
		}

		if (senha !== confirmarSenha) {
			console.log('❌ Senhas não coincidem');
			Alert.alert('Erro', 'As senhas não coincidem');
			return;
		}

		if (!isValidPhone(telefone)) {
			console.log('❌ Telefone inválido:', telefone);
			Alert.alert('Erro', 'Telefone deve conter 10 ou 11 dígitos');
			return;
		}

		console.log('✅ Todas as validações passaram, iniciando cadastro...');
		setLoading(true);

		try {
			console.log('1️⃣ Criando usuário no Firebase Auth...');
			// 1. Criar usuário no Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
			const user = userCredential.user;
			console.log('✅ Usuário criado com sucesso! UID:', user.uid);

			console.log('2️⃣ Atualizando perfil...');
			// 2. Atualizar o perfil com o nome
			await updateProfile(user, {
				displayName: nome,
			});
			console.log('✅ Perfil atualizado!');

			console.log('3️⃣ Salvando dados no Firestore...');
			// 3. Salvar dados adicionais no Firestore
			await setDoc(doc(db, 'usuarios', user.uid), {
				nome,
				email,
				telefone,
				criadoEm: serverTimestamp(),
				uid: user.uid,
			});
			console.log('✅ Dados salvos no Firestore!');

			Alert.alert(
				'Sucesso!',
				'Cadastro realizado com sucesso!',
				[
					{
						text: 'OK',
						onPress: () => {
							console.log('Cadastro concluído, redirecionamento automático pelo AppNavigator.');
						},
					},
				]
			);

		} catch (error: any) {
			console.error('❌ ERRO NO CADASTRO:', error);
			console.error('Código do erro:', error?.code);
			console.error('Mensagem:', error?.message);

			let message = 'Erro ao realizar cadastro';

			if (error && error.code) {
				switch (error.code) {
					case 'permission-denied':
						message = 'Erro de permissão no Firestore.\n\n' +
							'Para resolver:\n' +
							'1. Acesse console.firebase.google.com\n' +
							'2. Vá em Firestore Database > Regras\n' +
							'3. Substitua as regras por:\n\n' +
							'allow read, write: if request.auth != null;\n\n' +
							'4. Publique as alterações';
						break;
					case 'auth/configuration-not-found':
						message = 'Firebase Authentication não está configurado.\n\n' +
							'Para resolver:\n' +
							'1. Acesse console.firebase.google.com\n' +
							'2. Vá em Authentication > Sign-in method\n' +
							'3. Habilite "Email/Password"\n' +
							'4. Salve as alterações';
						break;
					case 'auth/email-already-in-use':
						// Tratamento especial para email já cadastrado
						Alert.alert(
							'Email Já Cadastrado',
							`O email ${email} já possui uma conta cadastrada.\n\nDeseja fazer login?`,
							[
								{
									text: 'Cancelar',
									style: 'cancel',
								},
								{
									text: 'Fazer Login',
									onPress: () => navigation.navigate('Login'),
								},
							]
						);
						setLoading(false);
						return; // Retorna aqui para não mostrar o alert padrão
					case 'auth/invalid-email':
						message = 'E-mail inválido';
						break;
					case 'auth/weak-password':
						message = 'Senha muito fraca';
						break;
					case 'auth/network-request-failed':
						message = 'Erro de conexão. Verifique sua internet.';
						break;
					default:
						message = error.message || message;
				}
			} else if (error && error.message) {
				message = error.message;
			}

			Alert.alert('Erro no Cadastro', message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
			<KeyboardAvoidingView
				style={[styles.container, { backgroundColor: Colors[theme].background }]}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.headerContainer}>
						<MaterialCommunityIcons name="account-plus" size={56} color={tint} />
						<Text style={[styles.title, { color: Colors[theme].text }]}>Cadastre-se</Text>
						<Text style={[styles.subtitle, { color: Colors[theme].icon }]}>Crie sua conta gratuitamente</Text>
						<TouchableOpacity
							style={[styles.themeButton, { borderColor: Colors[theme].icon, backgroundColor: Colors[theme].background }]}
							onPress={toggleTheme}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						>
							<MaterialCommunityIcons name={theme === 'light' ? 'weather-night' : 'white-balance-sunny'} size={20} color={tint} />
						</TouchableOpacity>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Nome Completo</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
								placeholder="Seu nome completo"
								placeholderTextColor={subtitleColor}
								value={nome}
								onChangeText={setNome}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Email</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
								placeholder="seu@email.com"
								placeholderTextColor={subtitleColor}
								keyboardType="email-address"
								autoCapitalize="none"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Telefone</Text>
							<TextInput
								style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
								placeholder="(00) 00000-0000"
								placeholderTextColor={subtitleColor}
								keyboardType="phone-pad"
								value={telefone}
								onChangeText={setTelefone}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Senha</Text>
							<View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorderColor }]}>
								<TextInput
									style={[styles.inputInline, { color: textColor }]}
									placeholder="Mínimo 6 caracteres"
									placeholderTextColor={subtitleColor}
									secureTextEntry={showSenha}
									value={senha}
									onChangeText={setSenha}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setShowSenha((prev) => !prev)}
								>
									<MaterialCommunityIcons
										name={showSenha ? 'eye-off' : 'eye'}
										size={22}
										color={subtitleColor}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Confirmar Senha</Text>
							<View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorderColor }]}>
								<TextInput
									style={[styles.inputInline, { color: textColor }]}
									placeholder="Digite a senha novamente"
									placeholderTextColor={subtitleColor}
									secureTextEntry={showConfirmarSenha}
									value={confirmarSenha}
									onChangeText={setConfirmarSenha}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setShowConfirmarSenha((prev) => !prev)}
								>
									<MaterialCommunityIcons
										name={showConfirmarSenha ? 'eye-off' : 'eye'}
										size={22}
										color={subtitleColor}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: buttonBg }]}
							onPress={handleRegister}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={buttonTextColor} />
							) : (
								<Text style={[styles.buttonText, { color: buttonTextColor }]}>Criar Conta</Text>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.footer}>
						<Text style={styles.footerText}>Já tem uma conta?</Text>
						<TouchableOpacity onPress={() => navigation.navigate('Login')}>
							<Text style={[styles.loginLink, { color: Colors[theme].text }]}>Faça login aqui</Text>
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
		backgroundColor: '#F4F4F5',
	},
	container: {
		flex: 1,
		backgroundColor: '#FFF',
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
		color: '#22223B',
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
		color: '#22223B',
		letterSpacing: 0.3,
	},
	input: {
		borderWidth: 1.2,
		borderColor: '#D1D5DB',
		borderRadius: 4,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: '#F8FAFC',
		color: '#22223B',
		fontWeight: '500',
	},
	button: {
		backgroundColor: '#2563EB',
		borderRadius: 4,
		paddingVertical: 14,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 12,
		elevation: 2,
	},
	buttonDisabled: {
		backgroundColor: '#A5B4FC',
		opacity: 0.7,
	},
	buttonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	footer: {
		alignItems: 'center',
		gap: 4,
	},
	footerText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '400',
	},
	loginLink: {
		fontSize: 14,
		color: '#2563EB',
		fontWeight: '700',
		letterSpacing: 0.3,
	},
	themeButton: {
		position: 'absolute',
		right: 12,
		top: 8,
		padding: 6,
		borderRadius: 20,
		borderWidth: 1,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.2,
		borderRadius: 4,
		paddingHorizontal: 14,
		paddingVertical: 12,
		marginBottom: 8,
	},
	inputInline: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 0,
	},
	eyeButton: {
		padding: 6,
		justifyContent: 'center',
		alignItems: 'center',
	},
});