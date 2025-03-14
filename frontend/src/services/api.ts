import axios from "axios";

// Defina a URL do seu backend
const API_URL = "http://192.168.56.1:5000"; // Altere para a URL do servidor

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
