import express from "express";
import {
  createInsurance,
  readInsurance,
  updateInsurance,
  deleteInsurance,
} from "../controllers/insuranceController";

const router = express.Router();

router.post("/:tripId", createInsurance);
router.get("/:tripId", readInsurance);
router.put("/:insuranceId", updateInsurance);
router.delete("/:insuranceId", deleteInsurance);

export default router;
