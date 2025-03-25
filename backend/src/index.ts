import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import travelRoutes from "./routes/travelRoutes"; // importar a nova rota

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", travelRoutes); 

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "192.168.15.9"; // Use o IP correto da sua máquina
app.listen(PORT, HOST, () => console.log(`🚀 Backend rodando em http://${HOST}:${PORT}`));
