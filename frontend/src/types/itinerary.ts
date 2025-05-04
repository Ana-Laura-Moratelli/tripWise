export interface Itinerario {
    nomeLocal: string;
    tipo: string;
    valor: string;
    descricao?: string;
    dia: string;
    endereco?: {
        rua?: string;
        numero?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
        latitude?: string;
        longitude?: string;
    };
    originalIndex?: number;
}
