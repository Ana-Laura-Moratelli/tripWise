import express from "express";
import { registrarViagem, listarViagens, deletarViagem, adicionarItinerario, atualizarItinerario, deletarItinerario} from "../controllers/tripController";

const router = express.Router();

router.post("/trip", registrarViagem);
router.get("/trip", listarViagens);
router.delete("/trip/:id", deletarViagem); 

router.post("/trip/:id/itinerary", adicionarItinerario); 
router.put("/:id/itinerary/:itemIndex", atualizarItinerario);
router.delete("/trip/:id/itinerary/:itemIndex", deletarItinerario);



export default router;
