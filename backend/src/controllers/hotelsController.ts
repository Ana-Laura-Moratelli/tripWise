import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = "https://serpapi.com/search.json";

export const listarHoteis = async (req: Request, res: Response): Promise<void> => {
  const { cidade, checkin, checkout } = req.query;

  if (!cidade || !checkin || !checkout) {
    res.status(400).json({ error: 'Parâmetros inválidos.' });
    return;
  }

  try {
    const query = (cidade as string).trim().replace(/\s+/g, "+");
    const url = `${SERPAPI_URL}?engine=google_hotels&q=${query}&check_in_date=${checkin}&check_out_date=${checkout}&adults=2&currency=USD&gl=us&hl=en&api_key=${SERPAPI_KEY}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a API externa:", error);
    res.status(500).json({ error: "Erro ao buscar dados de hotéis" });
  }
};
