import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes"; 
import hotels from "./routes/hotelsRoutes"; 
import flightsRoutes from "./routes/flightsRoutes"; 
import userRoutes from "./routes/authRoutes"; 
import documentRoutes from "./routes/documentsRoutes";
import emergencyContactRoutes from "./routes/emergencyContactRoutes";
import insuranceRoutes from "./routes/insuranceRoutes";
import transportRoutes from "./routes/transportRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", tripRoutes);
app.use("/api/users", userRoutes);
app.use('/api/hotels', hotels);
app.use("/api/flights", flightsRoutes);  
app.use("/api/trip", tripRoutes);
app.use("/api/documents", documentRoutes); 
app.use("/api/emergencyContact", emergencyContactRoutes); 
app.use("/api/insurance", insuranceRoutes);
app.use("/api/transport", transportRoutes);

const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "192.168.15.9"; 
app.listen(PORT, HOST, () => console.log(`🚀 Backend rodando em http://${HOST}:${PORT}`));
