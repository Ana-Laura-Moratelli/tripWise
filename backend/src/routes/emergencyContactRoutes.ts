import express from "express";
import { createEmergencyContact, readEmergencyContact, updateEmergencyContact, deleteEmergencyContact} from "../controllers/emergencyContact";

const router = express.Router();

router.post("/:tripId", createEmergencyContact);
router.get("/:tripId", readEmergencyContact);
router.put("/:emergencyContactId", updateEmergencyContact);
router.delete("/:emergencyContactId", deleteEmergencyContact);

export default router;
