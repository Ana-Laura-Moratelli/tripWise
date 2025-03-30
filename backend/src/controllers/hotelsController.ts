import { Request, Response } from 'express';
import axios from 'axios';

const SERPAPI_KEY = "ad5fc2187f55ec89675e6630529688fc5de9de87bae04f185a8a42c7d6994956";
const SERPAPI_URL = "https://serpapi.com/search.json";

export const listarHoteis = async (req: Request, res: Response): Promise<void> => {
  const { cidade, checkin, checkout } = req.query;

  // Validação simples dos parâmetros
  if (!cidade || !checkin || !checkout) {
    res.status(400).json({ error: 'Parâmetros inválidos.' });
    return;
  }

  try {
    const query = (cidade as string).trim().replace(/\s+/g, "+");
    const url = `${SERPAPI_URL}?engine=google_hotels&q=${query}&check_in_date=${checkin}&check_out_date=${checkout}&adults=2&currency=USD&gl=us&hl=en&api_key=${SERPAPI_KEY}`;
    
    const response = await axios.get(url);
    // Retorna os dados da API externa sem processamento adicional
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a API externa:", error);
    res.status(500).json({ error: "Erro ao buscar dados de hotéis" });
  }
};
