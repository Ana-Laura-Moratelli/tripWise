export interface Insurance {
    id: string;
    seguradora: string;
    numeroApolice: string;
    dataInicio: string;
    dataFim: string;
    telefoneEmergencia: string;
    valor: string;
    observacoes?: string;
  }