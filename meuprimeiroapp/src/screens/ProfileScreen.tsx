import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { db, auth } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../../constants/theme';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const textColor = Colors[theme].text;
  const labelColor = Colors[theme].icon;
  const cardBg = theme === 'light' ? '#fff' : '#0f1415';
  const loaderColor = Colors[theme].tint;
  const [userData, setUserData] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          if (mounted) setUserData(snap.data());
        } else {
          if (mounted) setUserData(null);
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
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.label, { color: labelColor }]}>Nome</Text>
        <Text style={[styles.value, { color: textColor }]}>{displayName}</Text>

        <Text style={[styles.label, { color: labelColor }]}>E-mail</Text>
        <Text style={[styles.value, { color: textColor }]}>{displayEmail}</Text>

        <Text style={[styles.label, { color: labelColor }]}>Telefone</Text>
        <Text style={[styles.value, { color: textColor }]}>{userData?.telefone || 'Sem telefone'}</Text>
      </View>

      <View style={{ height: 16 }} />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        <Text style={styles.deleteButtonText}>
          {deleting ? 'Apagando...' : 'Apagar conta'}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});






