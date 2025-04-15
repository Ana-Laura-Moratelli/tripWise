import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes"; 
import hotels from "./routes/hotelsRoutes"; 
import flightsRoutes from "./routes/flightsRoutes"; 
import userRoutes from "./routes/authRoutes"; 

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", tripRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/users", userRoutes);
app.use('/api/hotels', hotels);
app.use("/api/flights", flightsRoutes);  

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "192.168.15.12"; 
app.listen(PORT, HOST, () => console.log(`🚀 Backend rodando em http://${HOST}:${PORT}`));
