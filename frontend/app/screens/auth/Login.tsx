import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { loginUser } from "../../../src/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }
    
        setLoading(true);
        try {
            const user = await loginUser(email, password);
            console.log("✅ Usuário logado:", user);
    
            // Verificar se o token foi salvo corretamente
            const savedToken = await AsyncStorage.getItem("@token");
            console.log("🔑 Token salvo:", savedToken);
    
            console.log("🔀 Redirecionando para as tabs...");
            router.replace("/(tabs)"); // Certifique-se de que este é o caminho certo!
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <View style={styles.container}>
            <StatusBar style="light" hidden={true} />
            <ImageBackground source={require('@/assets/images/header-bg.png')} style={styles.headerBackground}>
                <View style={styles.header}>
                    <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
                    <Text style={styles.title}>Melhor App de planejamento de viagens!</Text>
                    <Text style={styles.subtitle}>Acesse sua conta para desfrutar da melhor experiência de gerenciamento</Text>
                </View>
            </ImageBackground>

            <View style={styles.loginContainer}>
                <View style={styles.tabs}>
                    <TouchableOpacity style={styles.activeTab}>
                        <Text style={styles.activeTabText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.inactiveTab} onPress={() => router.push('/screens/auth/Register')}>
                        <Text style={styles.inactiveTabText}>Register</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#888" />
                    <TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor="#888" />
                </View>

                <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={loading}>
                    <Text style={styles.loginButtonText}>{loading ? "Carregando..." : "Entrar"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    headerBackground: {
        width: '100%',
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'flex-start',
        paddingTop: 16,
    },
    logo: {
        width: 200,
        height: 50,
        resizeMode: 'contain',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 14,
        color: 'white',
        textAlign: 'left',
        marginBottom: 20,
    },
    loginContainer: {
        width: '100%',
        height: '100%',
        marginTop: -40,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 5,
        width: '100%',
        justifyContent: 'center',
    },
    inactiveTab: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 16,
        alignItems: 'center',
    },
    activeTab: {
        flex: 1,
        backgroundColor: '#EEE',
        borderRadius: 40,
        padding: 16,
        alignItems: 'center',
    },
    inactiveTabText: {
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#888',
    },
    inputContainer: {
        width: '100%',
        marginVertical: 16,
    },
    input: {
        padding: 16,
        borderRadius: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        color: 'black',
    },
    loginButton: {
        backgroundColor: '#5B2FD4',
        padding: 16,
        borderRadius: 40,
        width: '100%',
        alignItems: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
