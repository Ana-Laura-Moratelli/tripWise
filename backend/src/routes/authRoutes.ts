import express from "express";
import { register, login, updateProfile} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/:id", updateProfile);

// Em authRoutes.ts ou em um novo arquivo de rotas
router.get("/ping", (req, res) => {
    res.status(200).json({ message: "Backend funcionando" });
  });
  
export default router;
