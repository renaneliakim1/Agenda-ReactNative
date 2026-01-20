import  { View, Text, Button , StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>Tela de Detalhes</Text>
            <Text style={styles.text}>Aqui estão mais informações sobre o aplicativo.</Text>
            <Button
                title="Voltar para Início"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    );
}

