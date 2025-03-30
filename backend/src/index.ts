import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import travelRoutes from "./routes/travelRoutes"; 
import hotels from "./routes/hotelsRoutes"; 
import flightsRoutes from "./routes/flightsRoutes"; 
import userRoutes from "./routes/authRoutes"; 

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", travelRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/users", userRoutes);
app.use('/api/hotels', hotels);
app.use("/api/flights", flightsRoutes);  

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "192.168.15.9"; // Use o IP correto da sua máquina
app.listen(PORT, HOST, () => console.log(`🚀 Backend rodando em http://${HOST}:${PORT}`));
