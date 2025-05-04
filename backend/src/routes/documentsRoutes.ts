import express from "express";
import {
  adicionarDocumento,
  listarDocumentos,
  atualizarDocumento,
  deletarDocumento,
} from "../controllers/documentController";

const router = express.Router();

router.post("/:tripId", adicionarDocumento);
router.get("/:tripId", listarDocumentos);
router.put("/:docId", atualizarDocumento);
router.delete("/:docId", deletarDocumento);

export default router;
