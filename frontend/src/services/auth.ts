import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterData } from '../../src/types/registerData'; 

export async function loginUser(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", { email, password });

    await AsyncStorage.setItem("@token", response.data.token);
    await AsyncStorage.setItem("@user", JSON.stringify(response.data.user));
    await AsyncStorage.setItem("@user_id", response.data.user.uid);

    return response.data;
  } catch (error: any) {

    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
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
