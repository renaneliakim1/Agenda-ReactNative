import React, { useState, useEffect } from 'react';
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
	BackHandler,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen({ navigation }: any) {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [loading, setLoading] = useState(false);
	const [mostrarSenha, setMostrarSenha] = useState(false);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.popToTop();
			return true;
		});

		return () => backHandler.remove();
	}, [navigation]);

	const validarEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email.trim());
	};

	const mostrarAlerta = (titulo: string, mensagem: string, botoes?: any[]) => {
		if (Platform.OS === 'web') {
			window.alert(`${titulo}\n\n${mensagem}`);
		} else {
			Alert.alert(titulo, mensagem, botoes || [{ text: 'OK' }]);
		}
	};

	const mostrarAlertaComOpcoes = (titulo: string, mensagem: string, onConfirm: () => void) => {
		if (Platform.OS === 'web') {
			const confirmacao = window.confirm(`${titulo}\n\n${mensagem}`);
			if (confirmacao) {
				onConfirm();
			}
		} else {
			Alert.alert(titulo, mensagem, [
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Criar Conta', onPress: onConfirm },
			]);
		}
	};

	const handleLogin = async () => {
		// Validação de campos vazios
		if (!email || !senha) {
			mostrarAlerta(
				'Campos Obrigatórios',
				'Por favor, preencha seu email e senha para continuar.'
			);
			return;
		}

		// Validação de formato do email
		if (!validarEmail(email)) {
			mostrarAlerta(
				'Email Inválido',
				'Por favor, insira um endereço de email válido.\n\nExemplo: usuario@email.com'
			);
			return;
		}

		// Validação de tamanho mínimo da senha
		if (senha.length < 6) {
			mostrarAlerta(
				'Senha Inválida',
				'A senha deve ter no mínimo 6 caracteres.'
			);
			return;
		}

		setLoading(true);

		try {
			console.log('🔐 Tentando fazer login...');
			const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha);
			const user = userCredential.user;
			
			console.log('✅ Login bem-sucedido:', user.email);
			
			if (Platform.OS === 'web') {
				window.alert(`Login Realizado\n\nBem-vindo(a), ${user.email}!`);
				navigation.navigate('UserList');
			} else {
				Alert.alert(
					'Login Realizado',
					`Bem-vindo(a), ${user.email}!`,
					[
						{
							text: 'OK',
							onPress: () => navigation.navigate('UserList'),
						},
					]
				);
			}
		} catch (error: any) {
			console.error('❌ Erro no login:', error);
			console.error('Código do erro:', error?.code);
			
			let titulo = 'Erro no Login';
			let mensagem = 'Não foi possível realizar o login. Tente novamente.';
			
			if (error && error.code) {
				switch (error.code) {
					case 'auth/invalid-email':
						titulo = 'Email Inválido';
						mensagem = 'O formato do email está incorreto. Verifique e tente novamente.';
						break;
					case 'auth/user-not-found':
						titulo = 'Usuário Não Encontrado';
						mensagem = 'Não existe uma conta com este email.\n\nDeseja criar uma nova conta?';
						mostrarAlertaComOpcoes(titulo, mensagem, () => navigation.navigate('Register'));
						setLoading(false);
						return;
					case 'auth/wrong-password':
						titulo = 'Senha Incorreta';
						mensagem = 'A senha digitada está incorreta.\n\nVerifique sua senha e tente novamente.';
						break;
					case 'auth/invalid-credential':
						titulo = 'Credenciais Inválidas';
						mensagem = 'Email ou senha incorretos.\n\nVerifique seus dados e tente novamente.';
						break;
					case 'auth/user-disabled':
						titulo = 'Conta Desativada';
						mensagem = 'Esta conta foi desativada. Entre em contato com o suporte.';
						break;
					case 'auth/too-many-requests':
						titulo = 'Muitas Tentativas';
						mensagem = 'Você fez muitas tentativas de login.\n\nPor segurança, aguarde alguns minutos antes de tentar novamente.';
						break;
					case 'auth/network-request-failed':
						titulo = 'Erro de Conexão';
						mensagem = 'Não foi possível conectar ao servidor.\n\nVerifique sua conexão com a internet.';
						break;
					case 'auth/timeout':
						titulo = 'Tempo Esgotado';
						mensagem = 'A conexão com o servidor demorou muito.\n\nTente novamente.';
						break;
					default:
						titulo = 'Erro Inesperado';
						mensagem = error.message || 'Ocorreu um erro desconhecido. Tente novamente mais tarde.';
				}
			}

			mostrarAlerta(titulo, mensagem);
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
						<MaterialCommunityIcons name="lock" size={56} color="#6366F1" />
						<Text style={styles.title}>Login</Text>
						<Text style={styles.subtitle}>Acesse sua conta</Text>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								placeholder="seu@email.com"
								placeholderTextColor="#9CA3AF"
								keyboardType="email-address"
								autoCapitalize="none"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Senha</Text>
							<View style={styles.passwordContainer}>
								<TextInput
									style={styles.passwordInput}
									placeholder="••••••••"
									placeholderTextColor="#9CA3AF"
									secureTextEntry={!mostrarSenha}
									value={senha}
									onChangeText={setSenha}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setMostrarSenha(!mostrarSenha)}
								>
									<MaterialCommunityIcons
										name={mostrarSenha ? 'eye-off' : 'eye'}
										size={24}
										color="#6B7280"
									/>
								</TouchableOpacity>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleLogin}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Entrar</Text>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.footer}>
						<Text style={styles.footerText}>Não tem conta?</Text>
						<TouchableOpacity onPress={() => navigation.navigate('Register')}>
							<Text style={styles.registerLink}>Cadastre-se aqui</Text>
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
		marginBottom: 40,
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
		marginBottom: 32,
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
	passwordContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		backgroundColor: '#FFFFFF',
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: '#1F2937',
		fontWeight: '500',
	},
	eyeButton: {
		paddingHorizontal: 12,
		paddingVertical: 14,
		justifyContent: 'center',
		alignItems: 'center',
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
	footer: {
		alignItems: 'center',
		gap: 4,
	},
	footerText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '400',
	},
	registerLink: {
		fontSize: 14,
		color: '#6366F1',
		fontWeight: '700',
		letterSpacing: 0.3,
	},
});

