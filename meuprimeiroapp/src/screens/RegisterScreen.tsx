import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

export default function RegisterScreen({ navigation }: Props) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [idade, setIdade] = useState('');
    const [phone, setPhone] = useState('');

    // Validação de e-mail com REGEX
    function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validação de telefone (10 ou 11 dígitos)
    function isValidPhone(phone: string) {
        const phoneNumbers = phone.replace(/\D/g, '');
        const phoneRegex = /^\d{10,11}$/;
        return phoneRegex.test(phoneNumbers);
    }

    //  CREATE - salvar no AsyncStorage
    async function saveUser() {
        try {
            console.log('=== INICIANDO SALVAMENTO ===');
            const newUser = {
                id: Date.now().toString(),
                nome,
                email,
                idade,
                phone,
            };
            console.log('Novo usuário:', JSON.stringify(newUser, null, 2));

            console.log('Buscando usuários existentes com chave:', STORAGE_KEYS.USERS);
            const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
            console.log('Dados brutos do storage:', storedUsers);
            
            let users = storedUsers ? JSON.parse(storedUsers) : [];
            console.log('Total de usuários antes:', users.length);

            users.push(newUser);
            console.log('Total de usuários depois:', users.length);
            
            const dataToSave = JSON.stringify(users);
            console.log('Salvando no AsyncStorage...');
            await AsyncStorage.setItem(STORAGE_KEYS.USERS, dataToSave);
            console.log('✅ SALVO COM SUCESSO no AsyncStorage!');
            console.log('Chave usada:', STORAGE_KEYS.USERS);
            console.log('Dados salvos:', dataToSave);

            // Na web, também mostra no console de forma visual
            if (Platform.OS === 'web') {
                console.log('%c✅ USUÁRIO SALVO COM SUCESSO!', 'color: green; font-size: 16px; font-weight: bold;');
                console.table([newUser]);
            }

            Alert.alert(
                'Sucesso',
                `Usuário salvo com sucesso!\n\nTotal de usuários: ${users.length}\n\nChave: ${STORAGE_KEYS.USERS}`
            );

            // Limpa formulário
            setNome('');
            setEmail('');
            setIdade('');
            setPhone('');

        } catch (error) {
            console.error('❌ ERRO AO SALVAR:', error);
            Alert.alert('Erro', `Não foi possível salvar o usuário.\n\nDetalhes: ${error}`);
        }
    }

    // Fluxo principal
    function handleSave() {

        if (!nome || !email || !idade || !phone) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Erro', 'E-mail inválido.');
            return;
        }

        if (!isValidPhone(phone)) {
            Alert.alert('Erro', 'Telefone deve conter 10 ou 11 dígitos.');
            return;
        }

        saveUser();
    }

    // Visualizar dados salvos
    async function viewSavedData() {
        try {
            console.log('=== LENDO DADOS SALVOS ===');
            console.log('Chave de busca:', STORAGE_KEYS.USERS);
            
            const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
            console.log('Dados brutos:', storedUsers);
            
            if (!storedUsers) {
                console.log('⚠️ Nenhum dado encontrado');
                Alert.alert('Aviso', 'Nenhum usuário foi salvo ainda.');
                return;
            }

            const users = JSON.parse(storedUsers);
            console.log('✅ Usuários encontrados:', users.length);
            
            if (Platform.OS === 'web') {
                console.log('%c📋 LISTA DE USUÁRIOS', 'color: blue; font-size: 16px; font-weight: bold;');
                console.table(users);
            }
            
            const userList = users.map((u: any, index: number) => 
                `${index + 1}. ${u.nome} - ${u.email} - Tel: ${u.phone}`
            ).join('\n');

            const storageInfo = Platform.OS === 'web' 
                ? '\n\nLocal: AsyncStorage (Armazenamento Local do Navegador)'
                : `\n\nLocal: AsyncStorage (${Platform.OS})`;

            Alert.alert(
                'Usuários Salvos',
                `Total: ${users.length}\n\n${userList}${storageInfo}\n\nChave: ${STORAGE_KEYS.USERS}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Erro ao ler dados:', error);
            Alert.alert('Erro', `Não foi possível ler os dados.\n\nDetalhes: ${error}`);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastro</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Idade"
                value={idade}
                onChangeText={setIdade}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <View style={styles.buttonContainer}>
                <Button title="Salvar" onPress={handleSave} />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Cancelar"
                    color="red"
                    onPress={() => {
                        setNome('');
                        setEmail('');
                        setIdade('');
                        setPhone('');
                    }}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Ver Lista de Usuários"
                    color="green"
                    onPress={() => navigation.navigate('UserList')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    buttonContainer: {
        marginBottom: 10,
    },
});
