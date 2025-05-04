import { Router } from "express";
import { createTransport, readTransport, updateTransport, deleteTransport } from "../controllers/transportController";

const router = Router();

router.post("/:tripId", createTransport);
router.get("/:tripId", readTransport);
router.put("/:transportId", updateTransport);
router.delete("/:transportId", deleteTransport);

export default router;
