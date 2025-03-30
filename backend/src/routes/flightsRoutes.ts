// routes/flightsRoutes.ts
import express from 'express';
import { callFlightAPI } from '../controllers/flightsController';

const router = express.Router();

// Como este router será montado em '/api/flights', aqui basta definir a rota relativa "/"
router.get("/", callFlightAPI);

export default router;
