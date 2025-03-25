import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../../../src/services/auth";

export default function AuthScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    // Estados para Login
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Estados para Register
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [cpf, setCpf] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }
        setLoginLoading(true);
        try {
            const user = await loginUser(email, password);
            console.log("✅ Usuário logado:", user);
            const savedToken = await AsyncStorage.getItem("@token");
            console.log("🔑 Token salvo:", savedToken);
            router.replace("/(tabs)"); // Redireciona para as tabs
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setLoginLoading(false);
        }
    }

    async function handleRegister() {
        if (!name || !phoneNumber || !cpf || !regEmail || !regPassword) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }
        setRegisterLoading(true);
        try {
            const data = { name, phoneNumber, cpf, email: regEmail, password: regPassword };
            console.log("📡 Enviando dados para cadastro:", data);
            const response = await registerUser(data);
            console.log("✅ Cadastro bem-sucedido:", response);
            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
            router.push("/screens/auth/Login");
        } catch (error: any) {
            console.error("❌ Erro ao cadastrar:", error.message);
            Alert.alert("Erro", error.message);
        } finally {
            setRegisterLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" hidden={true} />
            <ImageBackground
                source={require('@/assets/images/header-bg.png')}
                style={styles.headerBackground}
            >
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Melhor App de planejamento de viagens!</Text>
                   
                </View>
            </ImageBackground>

            <View style={styles.loginContainer}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={activeTab === "login" ? styles.activeTab : styles.inactiveTab}
                        onPress={() => setActiveTab("login")}
                    >
                        <Text style={activeTab === "login" ? styles.activeTabText : styles.inactiveTabText}>
                            Login
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={activeTab === "register" ? styles.activeTab : styles.inactiveTab}
                        onPress={() => setActiveTab("register")}
                    >
                        <Text style={activeTab === "register" ? styles.activeTabText : styles.inactiveTabText}>
                            Cadastre-se
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === "login" ? (
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            placeholder="Senha"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholderTextColor="#888"
                        />
                        <TouchableOpacity
                            onPress={handleLogin}
                            style={styles.loginButton}
                            disabled={loginLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loginLoading ? "Entrando..." : "Entrar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Nome"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            placeholder="Telefone"
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            placeholder="CPF"
                            style={styles.input}
                            value={cpf}
                            onChangeText={setCpf}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            placeholder="E-mail"
                            style={styles.input}
                            value={regEmail}
                            onChangeText={setRegEmail}
                            placeholderTextColor="#888"
                        />
                        <TextInput
                            placeholder="Senha"
                            secureTextEntry
                            style={styles.input}
                            value={regPassword}
                            onChangeText={setRegPassword}
                            placeholderTextColor="#888"
                        />
                        <TouchableOpacity
                            onPress={handleRegister}
                            style={styles.loginButton}
                            disabled={registerLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {registerLoading ? "Cadastrando..." : "Cadastre-se"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
    },
    headerBackground: {
        width: "100%",
        height: 300,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        alignItems: "flex-start",
        paddingTop: 32,
    },
    logo: {
        width: 200,
        height: 50,
        resizeMode: "contain",
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        textAlign: "left",
    },
    subtitle: {
        fontSize: 14,
        color: "white",
        textAlign: "left",
        marginBottom: 20,
    },
    loginContainer: {
        width: "100%",
        height: "100%",
        marginTop: -40,
        backgroundColor: "white",
        borderRadius: 40,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 40,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 5,
        width: "100%",
        justifyContent: "center",
    },
    inactiveTab: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 40,
        padding: 16,
        alignItems: "center",
    },
    activeTab: {
        flex: 1,
        backgroundColor: "#EEE",
        borderRadius: 40,
        padding: 16,
        alignItems: "center",
    },
    inactiveTabText: {
        fontWeight: "bold",
    },
    activeTabText: {
        color: "#888",
    },
    inputContainer: {
        width: "100%",
        marginVertical: 16,
    },
    input: {
        padding: 16,
        borderRadius: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        color: "black",
    },
    loginButton: {
        backgroundColor: "#5B2FD4",
        padding: 16,
        borderRadius: 40,
        width: "100%",
        alignItems: "center",
    },
    loginButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
