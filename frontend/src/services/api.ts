import axios from "axios";

const API_URL = "http://192.168.15.10:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});
