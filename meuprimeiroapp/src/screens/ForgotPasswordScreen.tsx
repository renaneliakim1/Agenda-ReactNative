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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function ForgotPasswordScreen({ navigation }: any) {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

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

	const handleResetPassword = async () => {
		// Validação de campo vazio
		if (!email) {
			mostrarAlerta(
				'Campo Obrigatório',
				'Por favor, insira seu email para continuar.'
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

		setLoading(true);

		try {
			console.log('📧 Enviando email de redefinição de senha...');
			
			// Configurar URL de redirecionamento após redefinir senha
			let redirectUrl = 'https://react-native-ebon.vercel.app/';
			
			// Para web, detecta automaticamente a URL (localhost ou produção)
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				redirectUrl = window.location.origin + '/';
			}
			
			const actionCodeSettings = {
				url: redirectUrl,
				handleCodeInApp: false,
			};

			console.log('🔗 URL de redirecionamento:', redirectUrl);
			await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
			
			console.log('✅ Email enviado com sucesso!');
			
			if (Platform.OS === 'web') {
				window.alert(
					'Email Enviado!\n\n' +
					`Um link para redefinir sua senha foi enviado para:\n\n${email}\n\n` +
					'Verifique sua caixa de entrada e também a pasta de spam.\n\n' +
					'Após redefinir sua senha, você será redirecionado automaticamente de volta ao app para fazer login.'
				);
				// Redirecionar após fechar o alert no web
				navigation.navigate('Login');
			} else {
				Alert.alert(
					'Email Enviado!',
					`Um link para redefinir sua senha foi enviado para:\n\n${email}\n\nVerifique sua caixa de entrada e também a pasta de spam.\n\nApós alterar sua senha, volte ao app para fazer login novamente.`,
					[
						{
							text: 'OK',
							onPress: () => navigation.navigate('Login')
						}
					]
				);
			}
		} catch (error: any) {
			console.error('❌ Erro ao enviar email:', error);
			console.error('Código do erro:', error?.code);
			
			let titulo = 'Erro ao Enviar Email';
			let mensagem = 'Não foi possível enviar o email de redefinição. Tente novamente.';
			
			if (error && error.code) {
				switch (error.code) {
					case 'auth/invalid-email':
						titulo = 'Email Inválido';
						mensagem = 'O formato do email está incorreto. Verifique e tente novamente.';
						break;
					case 'auth/user-not-found':
						titulo = 'Usuário Não Encontrado';
						mensagem = 'Não existe uma conta cadastrada com este email.\n\nVerifique o email digitado ou crie uma nova conta.';
						break;
					case 'auth/unauthorized-continue-uri':
						titulo = 'Erro de Configuração';
						mensagem = 'A URL de redirecionamento não está autorizada. Entre em contato com o suporte.';
						break;
					case 'auth/network-request-failed':
						titulo = 'Erro de Conexão';
						mensagem = 'Não foi possível conectar ao servidor.\n\nVerifique sua conexão com a internet.';
						break;
					case 'auth/too-many-requests':
						titulo = 'Muitas Tentativas';
						mensagem = 'Você fez muitas tentativas.\n\nPor segurança, aguarde alguns minutos antes de tentar novamente.';
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
						<MaterialCommunityIcons name="lock-reset" size={56} color="#6366F1" />
						<Text style={styles.title}>Esqueci Minha Senha</Text>
						<Text style={styles.subtitle}>
							Digite seu email para receber um link de redefinição
						</Text>
					</View>

					<View style={styles.infoContainer}>
						<View style={styles.infoCard}>
							<MaterialCommunityIcons name="information" size={24} color="#2563EB" style={styles.infoIcon} />
							<Text style={styles.infoText}>
								Você receberá um email com instruções para criar uma nova senha.
								O link expira em 1 hora.
							</Text>
						</View>
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

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleResetPassword}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text style={styles.buttonText}>Enviar link de redefinição</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.buttonSecondary}
							onPress={() => navigation.navigate('Login')}
						>
							<MaterialCommunityIcons name="arrow-left" size={20} color="#2563EB" />
							<Text style={styles.buttonSecondaryText}>Voltar para o Login</Text>
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
		marginBottom: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#22223B',
		marginBottom: 8,
		textAlign: 'center',
		marginTop: 16,
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		fontWeight: '400',
		paddingHorizontal: 20,
	},
	infoContainer: {
		marginBottom: 30,
	},
	infoCard: {
		backgroundColor: '#EFF6FF',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: '#DBEAFE',
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	infoIcon: {
		marginRight: 12,
		marginTop: 2,
	},
	infoText: {
		flex: 1,
		fontSize: 14,
		color: '#1E40AF',
		lineHeight: 20,
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
	buttonSecondary: {
		backgroundColor: '#FFF',
		borderRadius: 4,
		paddingVertical: 14,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 8,
		borderWidth: 1.5,
		borderColor: '#2563EB',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	buttonSecondaryText: {
		color: '#2563EB',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	footer: {
		alignItems: 'center',
		gap: 4,
	},
	backLink: {
		fontSize: 14,
		color: '#2563EB',
		fontWeight: '700',
		letterSpacing: 0.3,
	},
});
