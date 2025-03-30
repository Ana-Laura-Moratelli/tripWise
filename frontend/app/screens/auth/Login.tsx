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
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../../../src/services/auth";
import { TextInputMask } from 'react-native-masked-text';

export default function AuthScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [cpf, setCpf] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Campos obrigatórios", "Preencha todos os campos!");
            return;
        }

        setLoginLoading(true);

        try {
            const response = await loginUser(email, password);

            const { token, user } = response;

            await AsyncStorage.setItem("@token", token);
            await AsyncStorage.setItem("@user_id", user.uid);

            console.log("✅ Usuário logado:", user);
            router.replace("/(tabs)");
        } catch (error: any) {

            const mensagemErro = error?.message?.toLowerCase() || "";

            if (mensagemErro.includes("usuário não encontrado")) {
                Alert.alert("Usuário não encontrado", "Verifique o e-mail digitado.");
            } else if (mensagemErro.includes("senha incorreta")) {
                Alert.alert("Senha incorreta", "A senha informada está errada.");
            } else {
                Alert.alert("Erro no login", "Não foi possível fazer login. Tente novamente.");
            }
        } finally {
            setLoginLoading(false);
        }
    }


    async function handleRegister() {
        const numeroLimpo = phoneNumber.replace(/\D/g, '');
        const telefoneFormatado = `+55${numeroLimpo}`;
        const cpfFormatado = cpf; 
    
        if (!name || !phoneNumber || !cpf || !regEmail || !regPassword) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }
    
        if (regPassword.length < 8) {
            Alert.alert("Erro", "A senha deve ter no mínimo 8 caracteres.");
            return;
        }
    
        setRegisterLoading(true);
    
        try {
            const data = {
                name,
                phoneNumber: telefoneFormatado,
                cpf: cpfFormatado,
                email: regEmail,
                password: regPassword
            };
    
            console.log("📡 Enviando dados para cadastro:", data);
    
            const response = await registerUser(data);
    
            if (response?.error) {
                throw new Error(response.error);
            }
    
            console.log("✅ Cadastro bem-sucedido:", response);
            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
    
            setName('');
            setPhoneNumber('');
            setCpf('');
            setRegEmail('');
            setRegPassword('');
    
            router.push("/screens/auth/Login");
    
        } catch (error: any) {
    
            let mensagemErro = "Erro ao cadastrar. Tente novamente.";
    
            if (typeof error.message === "string") {
                const msg = error.message.toLowerCase();
                if (msg.includes("cpf")) {
                    mensagemErro = "Este CPF já está cadastrado.";
                } else if (msg.includes("e-mail") || msg.includes("email")) {
                    mensagemErro = "Este e-mail já está cadastrado.";
                } else if (msg.includes("telefone") || msg.includes("phone")) {
                    mensagemErro = "Este número de telefone já está cadastrado.";
                }
            }
    
            Alert.alert("Erro no cadastro", mensagemErro);
        } finally {
            setRegisterLoading(false);
        }
    }
    

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white' }}
                keyboardShouldPersistTaps="handled"
            >
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
                                <TextInputMask
                                    type={'cel-phone'}
                                    options={{
                                        maskType: 'BRL',
                                        withDDD: true,
                                        dddMask: '(99) '
                                    }}
                                    placeholder="Telefone"
                                    style={styles.input}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#888"
                                />

                                <TextInputMask
                                    type={'cpf'}
                                    value={cpf}
                                    onChangeText={setCpf}
                                    style={styles.input}
                                    placeholder="CPF"
                                    placeholderTextColor="#888"
                                    keyboardType="numeric"
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
            </ScrollView>
        </KeyboardAvoidingView>
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
