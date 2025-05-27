import { Voo } from './flight';
import { Hotel } from './hotel';

export interface Viagem {
  id: string;
  userId: string; 
  voos?: Voo[];
  hoteis?: Hotel[];
  origem: string;
}
