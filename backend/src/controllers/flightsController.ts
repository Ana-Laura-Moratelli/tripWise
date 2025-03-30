import { Request, Response } from 'express';
import axios from 'axios';

const SERPAPI_KEY = "ad5fc2187f55ec89675e6630529688fc5de9de87bae04f185a8a42c7d6994956";
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

  // Define o tipo de busca: '1' para ida e volta, '2' para somente ida.
  const type = isIdaEVolta ? "1" : "2";

  // Monta a URL para a SERPAPI com os parâmetros recebidos
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
    // Retorna os dados brutos da API de voos para o frontend processar
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a API de voos:", error);
    res.status(500).json({ error: "Erro ao buscar dados de voos" });
  }
};
