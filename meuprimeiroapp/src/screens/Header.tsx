import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BREAKPOINT = 768;

const Header: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT;
  const navigation = useNavigation<any>();
  // menu base
  const itemsBase = [
    { key: 'home', label: 'Início', icon: 'home' },
    { key: 'profile', label: 'Perfil', icon: 'account' },
  ];

  // adiciona o botão de logout apenas em mobile
  const items = isMobile
    ? [...itemsBase, { key: 'logout', label: 'Sair', icon: 'logout' }]
    : itemsBase;

  const handleItemPress = (key: string) => {
    if (key === 'profile') return navigation.navigate('Profile');
    if (key === 'home') return navigation.navigate('ContactList');

    if (key === 'logout') {
      // confirmação e logout
      if (Platform.OS === 'web') {
        const ok = window.confirm('Deseja realmente sair da sua conta?');
        if (!ok) return;
        // import dinâmico do auth/signOut para não adicionar side-effects se não precisar
        import('../config/firebaseConfig')
          .then(({ auth }) => import('firebase/auth').then(({ signOut }) => signOut(auth)))
          .catch(() => window.alert('Erro ao sair.'));
      } else {
        Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              import('../config/firebaseConfig')
                .then(({ auth }) => import('firebase/auth').then(({ signOut }) => signOut(auth)))
                .catch(() => Alert.alert('Erro', 'Não foi possível sair.'));
            },
          },
        ]);
      }
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, isMobile ? styles.bottom : styles.top]}>
        <View style={[styles.menu, isMobile ? styles.menuMobile : styles.menuDesktop]}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, !isMobile && styles.itemDesktop]}
              onPress={() => handleItemPress(item.key)}
              accessibilityLabel={item.label}
            >
              {isMobile ? (
                <View style={styles.mobileItemInner}>
                  <MaterialCommunityIcons name={item.icon} size={28} color="#6366F1" />
                  <Text style={styles.mobileLabel}>{item.label}</Text>
                </View>
              ) : (
                <Text style={styles.text}>{item.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* no modal - header apenas navega para Profile */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation for Android
    elevation: 4,
  },
  top: {
    top: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  bottom: {
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 56,
  },
  menuMobile: {
    justifyContent: 'center',
  },
  menuDesktop: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemDesktop: {
    marginRight: 12,
    paddingHorizontal: 8,
  },
  mobileItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLabel: {
    fontSize: 11,
    color: '#444',
    marginTop: 2,
  },
  text: {
    fontSize: 16,
    color: '#222',
  },
  icon: {
    fontSize: 22,
  },
  // modal removed
});

export default Header;
