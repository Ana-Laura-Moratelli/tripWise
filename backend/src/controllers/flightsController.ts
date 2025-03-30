import { Request, Response } from 'express';
import axios from 'axios';

const SERPAPI_KEY = "b33e15aaa1eb27d47a52f29004190353fbe535af3acc6bee2a8eaacf5c4c2a6c";
const SERPAPI_URL = "https://serpapi.com/search.json";

export const callFlightAPI = async (req: Request, res: Response): Promise<void> => {
  const { iataOrigem, iataDestino, dataPartida, dataVolta, idaEVolta } = req.query;

  const isIdaEVolta: boolean = typeof idaEVolta === 'string' && idaEVolta.toLowerCase() === 'true';

  if (!iataOrigem || !iataDestino || !dataPartida) {
    res.status(400).json({ error: 'Parâmetros obrigatórios: iataOrigem, iataDestino e dataPartida.' });
    return;
  }
  
  if (isIdaEVolta && !dataVolta) {
    res.status(400).json({ error: 'Para ida e volta, dataVolta é obrigatória.' });
    return;
  }

  const type = isIdaEVolta ? "1" : "2";

  let flightUrl = `${SERPAPI_URL}?engine=google_flights`;
  flightUrl += `&departure_id=${(iataOrigem as string).toUpperCase()}`;
  flightUrl += `&arrival_id=${(iataDestino as string).toUpperCase()}`;
  flightUrl += `&outbound_date=${dataPartida}`;
  if (isIdaEVolta) {
    flightUrl += `&return_date=${dataVolta}`;
  }
  flightUrl += `&type=${type}`;
  flightUrl += `&currency=USD&hl=en&api_key=${SERPAPI_KEY}`;

  try {
    const response = await axios.get(flightUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a API de voos:", error);
    res.status(500).json({ error: "Erro ao buscar dados de voos" });
  }
};
