import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

type State = { hasError: boolean; error?: any; info?: any };

export default class ErrorBoundary extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, info: any) {
    // Loga no console para debugar (Metro / Browser)
    console.error('ErrorBoundary captured error:', error);
    console.error('ErrorBoundary info:', info);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message = this.state.error?.toString?.() || 'Erro desconhecido';
    const stack = this.state.error?.stack || this.state.info?.componentStack || '';

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ocorreu um erro</Text>
        <Text style={styles.message}>{message}</Text>
        <ScrollView style={styles.stack}>
          <Text selectable>{stack}</Text>
        </ScrollView>
        <Button title="Recarregar app" onPress={() => {
          if (typeof window !== 'undefined' && window.location) window.location.reload();
        }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  message: { color: '#b91c1c', marginBottom: 12 },
  stack: { width: '100%', maxHeight: 300, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 },
});
