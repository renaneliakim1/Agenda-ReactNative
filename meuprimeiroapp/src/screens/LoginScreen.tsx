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
import { ThemedView } from '../../components/themed-view';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen({ navigation }: any) {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [loading, setLoading] = useState(false);
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const { theme, toggleTheme } = useTheme();

	const textColor = Colors[theme].text;
	const subtitleColor = Colors[theme].icon;
	const inputBg = theme === 'light' ? '#F8FAFC' : '#0f1415';
	const inputBorderColor = theme === 'light' ? '#D1D5DB' : Colors[theme].icon;
	const buttonBg = theme === 'light' ? Colors[theme].tint : Colors.light.tint;
	const buttonTextColor = '#fff';
	const infoCardBg = theme === 'light' ? '#F0F4FF' : '#0f1415';
	const infoCardBorder = theme === 'light' ? '#E0E7FF' : Colors[theme].icon;


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
			console.log('🔄 Aguardando redirecionamento automático...');
			
			// A navegação será tratada automaticamente pelo onAuthStateChanged no AppNavigator
			// Não é necessário navegar manualmente
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
							<MaterialCommunityIcons name="lock" size={56} color={Colors[theme].tint} />
							<Text style={[styles.title, { color: textColor }]}>Login</Text>
							<Text style={[styles.subtitle, { color: subtitleColor }]}>Acesse sua conta</Text>
							<TouchableOpacity
								style={[styles.themeButton, { borderColor: subtitleColor, backgroundColor: Colors[theme].background }]}
								onPress={toggleTheme}
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							>
								<MaterialCommunityIcons
									name={theme === 'light' ? 'weather-night' : 'white-balance-sunny'}
									size={20}
									color={Colors[theme].tint}
								/>
							</TouchableOpacity>
						</View>
				<View style={styles.infoContainer}>
					<View style={[styles.infoCard, { backgroundColor: infoCardBg, borderColor: infoCardBorder }]}>
						<MaterialCommunityIcons name="contacts" size={32} color={Colors[theme].tint} style={styles.infoIcon} />
						<Text style={[styles.infoTitle, { color: textColor }]}>Sistema de Gerenciamento de Contatos</Text>
						<Text style={[styles.infoDescription, { color: subtitleColor }] }>
							Organize e gerencie seus contatos pessoais de forma simples e segura. 
							Adicione, edite e pesquise contatos com informações como nome, email, 
							telefone e idade. Todos os seus dados são armazenados de forma 
							segura na nuvem e sincronizados em tempo real.
						</Text>
					</View>
				</View>
					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
								<Text style={[styles.label, { color: textColor }]}>Email</Text>
								<TextInput
									style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
									placeholder="seu_email@email.com"
									placeholderTextColor={subtitleColor}
									keyboardType="email-address"
									autoCapitalize="none"
									value={email}
									onChangeText={setEmail}
								/>
							</View>

						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: textColor }]}>Senha</Text>
							<View style={[styles.passwordContainer, { backgroundColor: inputBg, borderColor: inputBorderColor }] }>
								<TextInput
									style={[styles.passwordInput, { color: textColor }]}
									placeholder="••••••••"
									placeholderTextColor={subtitleColor}
									secureTextEntry={!mostrarSenha}
									value={senha}
									onChangeText={setSenha}
								/>
								<TouchableOpacity
									style={styles.eyeButton}
									onPress={() => setMostrarSenha(!mostrarSenha)}
								>
									<MaterialCommunityIcons
										name={mostrarSenha ? 'eye' : 'eye-off'}
										size={24}
										color={subtitleColor}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: buttonBg }]}
							onPress={handleLogin}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color={buttonTextColor} />
							) : (
								<Text style={[styles.buttonText, { color: buttonTextColor }]}>Entrar</Text>
							)}
						</TouchableOpacity>
					</View>

					<View style={styles.footer}>
						<TouchableOpacity 
							style={styles.forgotPasswordContainer}
							onPress={() => navigation.navigate('ForgotPassword')}
						>
							<Text style={[styles.forgotPasswordLink, { color: Colors[theme].tint }]}>Esqueci minha senha</Text>
						</TouchableOpacity>

						<View style={styles.registerContainer}>
							<Text style={styles.footerText}>Não tem conta?</Text>
							<TouchableOpacity onPress={() => navigation.navigate('Register')}>
								<Text style={[styles.registerLink, { color: Colors[theme].tint }]}>Cadastre-se aqui</Text>
							</TouchableOpacity>
						</View>
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
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 40,
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 30,
		position: 'relative',
	},
	themeButton: {
		position: 'absolute',
		right: 12,
		top: 8,
		padding: 6,
		borderRadius: 20,
		borderWidth: 1,
	},
	infoContainer: {
		marginBottom: 30,
	},
	infoCard: {
		backgroundColor: '#F0F4FF',
		borderRadius: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: '#E0E7FF',
		alignItems: 'center',
	},
	infoIcon: {
		marginBottom: 12,
	},
	infoTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#22223B',
		marginBottom: 10,
		textAlign: 'center',
	},
	infoDescription: {
		fontSize: 14,
		color: '#4B5563',
		textAlign: 'center',
		lineHeight: 20,
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
		color: '#22223B',
		letterSpacing: 0.3,
	},
	input: {
		borderWidth: 1.2,
		borderColor: '#D1D5DB',
		borderRadius: 4, // quadrado
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: '#F8FAFC', // cinza muito claro
		color: '#22223B',
		fontWeight: '500',
	},
	passwordContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.2,
		borderColor: '#D1D5DB',
		borderRadius: 4,
		backgroundColor: '#F8FAFC',
		position: 'relative',
		paddingRight: 48,
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		color: '#22223B',
		fontWeight: '500',
	},
	eyeButton: {
		position: 'absolute',
		right: 16,
		top: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		backgroundColor: '#2563EB', // azul
		borderRadius: 4, // quadrado
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
	buttonRed: {
		backgroundColor: '#DC2626', // vermelho
		borderRadius: 4,
		paddingVertical: 14,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 12,
		elevation: 2,
	},
	buttonGreen: {
		backgroundColor: '#16A34A', // verde
		borderRadius: 4,
		paddingVertical: 14,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 12,
		elevation: 2,
	},
	footer: {
		alignItems: 'center',
		gap: 12,
	},
	forgotPasswordContainer: {
		marginBottom: 8,
	},
	forgotPasswordLink: {
		fontSize: 14,
		color: '#6366F1',
		fontWeight: '600',
		letterSpacing: 0.3,
	},
	registerContainer: {
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
		color: '#2563EB', // azul
		fontWeight: '700',
		letterSpacing: 0.3,
	},
});
