import  { View, Text, Button , StyleSheet } from 'react-native';
import { ThemedView } from '../../components/themed-view';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';


export default function DetailsScreen({ navigation }: { navigation: any }) {
    useEffect(() => {
        console.log('DetailsScreen montado');
        return () => {
            console.log('DetailsScreen desmontado');
        };
    }, []);

    return (
        <ThemedView style={styles.container}>
            <Text style={styles.title}>Tela de Detalhes</Text>
            <Text style={styles.text}>Aqui estão mais informações sobre o aplicativo.</Text>
            <Button
                title="Voltar para Início"
                onPress={() => navigation.navigate('Home')}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
});

