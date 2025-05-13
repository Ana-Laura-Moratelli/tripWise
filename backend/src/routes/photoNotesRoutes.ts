import express from "express";
import {
  createPhotoNote,
  readPhotoNotes,
  updatePhotoNote,
  deletePhotoNote,
} from "../controllers/photoNoteController";

const router = express.Router();

router.post("/:tripId", createPhotoNote);
router.get("/:tripId", readPhotoNotes);
router.put("/:noteId", updatePhotoNote);
router.delete("/:noteId", deletePhotoNote);

export default router;
