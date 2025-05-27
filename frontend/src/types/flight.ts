export interface Voo {
  tipo: 'Ida' | 'Volta';
  origin: string;
  destination: string;
  airline: string;
  travel_class: string;     
  flight_number: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

