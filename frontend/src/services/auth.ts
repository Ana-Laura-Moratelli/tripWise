import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface RegisterData {
    name: string;
    phoneNumber: string;
    cpf: string;
    email: string;
    password: string;
}

export async function loginUser(email: string, password: string) {
    try {
        console.log("📡 Enviando login para API:", email, password);

        const response = await api.post("/auth/login", { email, password });

        console.log("✅ Resposta da API:", response.status, response.data); // Verificar se a API retornou sucesso

        // Salvar usuário e token no AsyncStorage
        await AsyncStorage.setItem("@user", JSON.stringify(response.data));
        await AsyncStorage.setItem("@token", response.data.token);

        return response.data;
    } catch (error: any) {
        console.error("❌ Erro na requisição:", error.response?.data);
        throw new Error(error.response?.data?.error || "Erro ao fazer login");
    }
}

export async function registerUser(data: RegisterData) {
    try {
      console.log("📡 Enviando requisição de cadastro:", data);
      const response = await api.post("/auth/register", data);
      console.log("✅ Resposta da API:", response.status, response.data);
      return response.data;
    } catch (error: any) {
      // Log completo do erro para depuração
      console.error("❌ Erro na requisição completa:", error);
      if (error.code === "ECONNABORTED") {
        console.error("⏱ Timeout exceeded: A requisição excedeu o tempo limite.");
      }
      if (error.response) {
        console.error("📌 Detalhes da resposta:", error.response.data);
      } else {
        console.error("📌 Erro sem resposta do servidor:", error.message);
      }
      throw new Error(error.response?.data?.error || error.message || "Erro ao cadastrar usuário");
    }
  }
