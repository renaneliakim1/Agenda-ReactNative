import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BREAKPOINT = 769;

const Header: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT;
  const navigation = useNavigation<any>();

  return (
    <>
      <SafeAreaView style={[styles.container, isMobile ? styles.bottom : styles.top]}>
        <View style={styles.menu}>
          {[
            { key: 'home', label: 'Home', icon: '🏠' },
            { key: 'profile', label: 'Perfil', icon: '👤' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.item}
              onPress={() => {
                if (item.key === 'profile') navigation.navigate('Profile');
                else if (item.key === 'home') navigation.navigate('ContactList');
              }}
              accessibilityLabel={item.label}
            >
              {isMobile ? (
                <Text style={styles.icon}>{item.icon}</Text>
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
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
