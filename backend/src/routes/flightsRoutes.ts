import express from 'express';
import { callFlightAPI } from '../controllers/flightsController';

const router = express.Router();

router.get("/", callFlightAPI);

export default router;
