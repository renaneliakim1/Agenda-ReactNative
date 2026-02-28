import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Platform, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { db, auth } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = Colors[theme].text;
  const labelColor = Colors[theme].icon;
  const inputBg = isDark ? '#1F2937' : '#F3F4F6';
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const loaderColor = Colors[theme].tint;
  const [userData, setUserData] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [nomeText, setNomeText] = useState('');
  const [telefoneText, setTelefoneText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          if (mounted) setLoading(false);
          return;
        }

        const userRef = doc(db, 'usuarios', currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          if (mounted) {
            setUserData(data);
            setNomeText(data.nome || currentUser.displayName || '');
            setTelefoneText(data.telefone || '');
          }
        } else {
          if (mounted) {
            setUserData(null);
            setNomeText(currentUser.displayName || '');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteAccount = () => {
    console.log('[Profile] handleDeleteAccount pressed');
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('[Profile] Nenhum usuário autenticado');
      if (Platform.OS === 'web') window.alert('Erro: Nenhum usuário autenticado');
      else Alert.alert('Erro', 'Nenhum usuário autenticado');
      return;
    }

    // Fallback para web: usar window.confirm (Alert.alert pode não aparecer em alguns casos)
    if (Platform.OS === 'web') {
      const ok = window.confirm('Apagar conta\n\nTem certeza que deseja apagar sua conta? Esta ação é irreversível.');
      console.log('[Profile] web confirm result=', ok);
      if (ok) performDelete();
      return;
    }

    Alert.alert(
      'Apagar conta',
      'Tem certeza que deseja apagar sua conta? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: performDelete },
      ],
    );
  };

  const performDelete = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Erro', 'Nenhum usuário autenticado');
      return;
    }

    console.log('[Profile] Iniciando exclusão do usuário:', currentUser.uid);
    setDeleting(true);

    let backupData: any = null;
    try {
      const docSnap = await getDoc(doc(db, 'usuarios', currentUser.uid));
      if (docSnap.exists()) {
        backupData = docSnap.data();
      }
    } catch (e) {
      console.warn('Falha ao fazer backup do documento do usuário:', e);
    }

    // tentar dar reload no usuário para garantir estado atualizado
    try {
      if (typeof (currentUser as any).reload === 'function') {
        // @ts-ignore
        await currentUser.reload();
        console.log('[Profile] reload executado com sucesso');
      }
    } catch (reloadErr) {
      console.warn('[Profile] reload falhou (não bloqueante):', reloadErr);
    }

    // 🔥 1) Deletar documento do Firestore primeiro (permite usar credenciais atuais)
    try {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      await deleteDoc(userRef);
      console.log('[Profile] Documento removido do Firestore');
    } catch (firestoreErr) {
      console.warn('[Profile] Erro ao apagar documento do Firestore:', firestoreErr);
      Alert.alert('Erro', `Falha ao apagar dados do usuário: ${String(firestoreErr)}`);
      setDeleting(false);
      return;
    }

    // 🔐 2) Agora deletar usuário do Firebase Auth
    try {
      console.log('[Profile] Chamando deleteUser para', currentUser.uid);
      await deleteUser(currentUser);
      console.log('[Profile] Usuário removido do Auth');
      setDeleting(false);
      Alert.alert('Sucesso', 'Conta apagada com sucesso.');

      // garantir signOut local e redirecionamento
      try {
        console.log('[Profile] Forçando signOut local após deleteUser');
        await signOut(auth);
        console.log('[Profile] signOut executado');
      } catch (signErr) {
        console.warn('[Profile] signOut pós-delete falhou (não crítico):', signErr);
      }

      try {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        console.log('[Profile] navigation.reset para Login chamado');
      } catch (navErr) {
        console.warn('[Profile] navigation.reset falhou:', navErr);
      }

      // fallback: navegar explicitamente após um pequeno delay
      setTimeout(() => {
        try {
          navigation.navigate('Login');
          console.log('[Profile] navigation.navigate para Login (fallback) chamado');
        } catch (navErr) {
          console.warn('[Profile] navigation.navigate falhou:', navErr);
        }
      }, 150);

      return;
    } catch (authErr: any) {
      console.warn('[Profile] Erro ao deletar usuário do Auth:', authErr);
      if (authErr?.code === 'auth/requires-recent-login') {
        // Restaurar o documento do Firestore, pois a exclusão da conta falhou
        if (backupData) {
          try {
            await setDoc(doc(db, 'usuarios', currentUser.uid), backupData);
            console.log('[Profile] Documento restaurado no Firestore devido a falha no Auth');
          } catch (restoreErr) {
            console.error('[Profile] Falha fatal ao restaurar documento:', restoreErr);
          }
        }
        Alert.alert(
          'Reautenticação necessária',
          'Para apagar a conta é necessário entrar novamente. Deseja sair e efetuar o login novamente?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setDeleting(false) },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: async () => {
                try {
                  await signOut(auth);
                } catch (signErr) {
                  console.warn('[Profile] Erro ao deslogar após requerer reautenticação:', signErr);
                  Alert.alert('Erro ao deslogar', String(signErr));
                } finally {
                  setDeleting(false);
                }
              },
            },
          ],
        );
      } else {
        // Tentar restaurar o documento do Firestore em outros erros também
        if (backupData) {
          try {
            await setDoc(doc(db, 'usuarios', currentUser.uid), backupData);
          } catch (e) { }
        }
        Alert.alert('Erro', `Não foi possível apagar o usuário do Auth: ${authErr?.code || ''} ${authErr?.message || String(authErr)}`);
        setDeleting(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    if (!nomeText.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }

    setSaving(true);
    try {
      // 1. Atualizar no Firestore
      const userRef = doc(db, 'usuarios', currentUser.uid);
      await setDoc(userRef, {
        nome: nomeText,
        telefone: telefoneText,
        // preserve email 
      }, { merge: true });

      // 2. Atualizar no Auth (apenas nome)
      // Nota: não atualizamos email ou senha aqui por motivos de complexidade de reautenticação em edição básica.
      if (typeof import('firebase/auth').then === 'function') {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(currentUser, { displayName: nomeText });
      }

      setUserData((prev: any) => ({ ...prev, nome: nomeText, telefone: telefoneText }));
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Houve um erro ao atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={loaderColor} />
        <Text style={[styles.loadingText, { color: labelColor }]}>Carregando perfil...</Text>
      </ThemedView>
    );
  }

  const displayName = userData?.nome || auth.currentUser?.displayName || 'Sem nome';
  const displayEmail = userData?.email || auth.currentUser?.email || 'Sem email';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ width: '100%', flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: cardBg, borderColor, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[styles.cardHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.cardTitle, { color: textColor }]}>Meus Dados</Text>
              <TouchableOpacity
                onPress={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                style={styles.editToggleBtn}
              >
                <Text style={[styles.editToggleText, { color: loaderColor }]}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: labelColor }]}>Nome</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: textColor,
                    borderColor: borderColor,
                  }
                ]}
                value={nomeText}
                onChangeText={setNomeText}
                placeholder="Seu nome"
                placeholderTextColor={labelColor}
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>{displayName}</Text>
            )}

            <Text style={[styles.label, { color: labelColor }]}>E-mail (não editável aqui)</Text>
            <Text style={[styles.value, { color: textColor, opacity: 0.7 }]}>{displayEmail}</Text>

            <Text style={[styles.label, { color: labelColor }]}>Telefone</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: textColor,
                    borderColor: borderColor,
                  }
                ]}
                value={telefoneText}
                onChangeText={(text) => setTelefoneText(text.replace(/\D/g, '').slice(0, 11))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                placeholderTextColor={labelColor}
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>{userData?.telefone || 'Sem telefone'}</Text>
            )}

          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: loaderColor }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <Text style={[styles.saveButtonText, { color: isDark ? '#000' : '#fff' }]}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <Text style={styles.deleteButtonText}>
              {deleting ? 'Apagando...' : 'Apgar conta definitivamente'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  editToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  editToggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  deleteButton: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
