export interface Transport {
    id: string;
    tipoTransporte: string;
    empresa: string;
    dataHoraPartida: string;
    dataHoraChegada: string;
    observacoes?: string;
    valor: string;
    modeloVeiculo?: string;
    placaVeiculo?: string;
    numeroLinha?: string;
}