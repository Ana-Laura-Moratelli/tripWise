import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterData } from '@/types/registerData'; 
import { registerForPushNotificationsAsync } from './notification';

export async function loginUser(email: string, password: string) {
  try {
    console.log("📩 Enviando dados de login:", { email, password });

    const response = await api.post("/auth/login", { email, password });

    console.log("✅ Resposta da API (login):", JSON.stringify(response.data, null, 2));

    const { token, user } = response.data;

    if (!token || !user) {
      console.warn("⚠️ Token ou usuário ausente na resposta:", response.data);
      throw new Error("Resposta inválida do servidor");
    }

    await AsyncStorage.setItem("@token", token);
    await AsyncStorage.setItem("@user", JSON.stringify(user));
    await AsyncStorage.setItem("@user_id", user.uid);

    console.log("💾 Dados salvos no AsyncStorage com sucesso.");

    await registerForPushNotificationsAsync();

    return response.data;

  } catch (error: any) {
    console.error("❌ Erro na função loginUser:", error);

    const serverError = error?.response?.data?.error || error?.response?.data?.message;
    if (serverError) {
      throw new Error(serverError);
    }

    throw new Error("Erro ao fazer login. Tente novamente.");
  }
}


export async function registerUser(data: RegisterData) {
  try {
    console.log("📡 Enviando requisição de cadastro:", data);
    const response = await api.post("/auth/register", data);
    console.log("✅ Resposta da API:", response.status, response.data);
    return response.data;
  } catch (error: any) {
    const serverError = error.response?.data?.error;
    throw new Error(serverError || "Erro ao cadastrar usuário");
  }
}
