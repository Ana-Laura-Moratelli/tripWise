import express from "express";
import { listarHoteis } from "../controllers/hotelsController";

const router = express.Router();

router.get("/", listarHoteis);

export default router;
