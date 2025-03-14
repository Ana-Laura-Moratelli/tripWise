import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Backend rodando na porta ${PORT}`));
