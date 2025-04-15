import express from "express";
import { registrarViagem, listarViagens, deletarViagem, adicionarItinerario, atualizarItinerario, deletarItinerario} from "../controllers/tripController";
import { adicionarDocumento, listarDocumentos } from "../controllers/documentController";

const router = express.Router();

router.post("/trip", registrarViagem);
router.get("/trip", listarViagens);
router.delete("/trip/:id", deletarViagem); 
router.post("/trip/:id/itinerary", adicionarItinerario); 
router.put("/:id/itinerary/:itemIndex", atualizarItinerario);
router.delete("/trip/:id/itinerary/:itemIndex", deletarItinerario);
router.post("/trip/:id/documento", adicionarDocumento);
router.get('/trip/:id/documentos', listarDocumentos);

export default router;
