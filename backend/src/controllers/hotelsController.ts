import { Request, Response } from 'express';
import axios from 'axios';

const SERPAPI_KEY = "b33e15aaa1eb27d47a52f29004190353fbe535af3acc6bee2a8eaacf5c4c2a6c";
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
