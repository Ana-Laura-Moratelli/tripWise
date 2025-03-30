import express from "express";
import { registrarViagem, listarViagens, deletarViagem, adicionarItinerario, atualizarItinerario, deletarItinerario} from "../controllers/travelController";

const router = express.Router();

router.post("/travel", registrarViagem);
router.get("/travel", listarViagens);
router.delete("/travel/:id", deletarViagem); 
router.post("/travel/:id/itinerary", adicionarItinerario); 
router.put("/:id/itinerary/:itemIndex", atualizarItinerario);
router.delete("/travel/:id/itinerary/:itemIndex", deletarItinerario);

export default router;
