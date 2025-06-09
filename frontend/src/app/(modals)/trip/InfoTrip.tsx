import React, { useState, useCallback, useEffect } from "react";
import Constants from 'expo-constants';
import { View, Text, TouchableOpacity, Alert, ScrollView, Share } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "@/services/api";
import styles from '@/app/styles/global';

function parseDate(dateStr: string): Date {
    const [dataPart, timePart] = dateStr.split(" ");
    const [day, month, year] = dataPart.split("/");
    const hours = timePart ? timePart.split(":")[0] : "00";
    const minutes = timePart ? timePart.split(":")[1] : "00";
    const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
    return new Date(isoString);
}

function parseValor(valorStr: string): number {
    if (!valorStr) return 0;
    return Number(valorStr.replace(/[^\d,]/g, "").replace(",", "."));
}

export default function InfoTrip() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [viagem, setViagem] = useState<any>(null);
    const [transportes, setTransportes] = useState<any[]>([]);
    const [seguros, setSeguros] = useState<any[]>([]);
    const [totalGastos, setTotalGastos] = useState(0);
    const [fusoHorario, setFusoHorario] = useState<string | null>(null);
    const [horaLocal, setHoraLocal] = useState<string | null>(null);

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes da Viagem",
            headerBackTitle: "Voltar",
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            fetchViagem();
            fetchTransportes();
            fetchSeguros();
        }, [])
    );

    async function fetchViagem() {
        try {
            const userId = await AsyncStorage.getItem("@user_id");
            if (!userId) return;

            const response = await api.get("/api/trip", {
                params: { userId }
            });

            const data = response.data;
            const item = data.find((v: any) => v.id === id);

            if (item) {
                if (item.itinerarios && item.itinerarios.length > 0) {
                    item.itinerarios.sort((a: any, b: any) => {
                        const dateA = parseDate(a.dia);
                        const dateB = parseDate(b.dia);
                        return dateA.getTime() - dateB.getTime();
                    });
                }

                setViagem(item);
            } else {
                setViagem(null);
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar os dados da viagem.");
        }
    }

    async function fetchTransportes() {
        try {
            const response = await api.get(`/api/transport/${id}`);
            setTransportes(response.data);
        } catch (error) {
            Alert.alert("Erro", "Erro ao buscar transportes.");
        }
    }

    async function fetchSeguros() {
        try {
            const response = await api.get(`/api/insurance/${id}`);
            setSeguros(response.data);
        } catch (error) {
            Alert.alert("Erro", "Erro ao buscar seguros.");
        }
    }

    useEffect(() => {
        if (!viagem) return;

        let total = 0;
        viagem.voos?.forEach((voo: any) => total += parseValor(voo.price));
        viagem.hoteis?.forEach((hotel: any) => total += parseValor(hotel.total));
        viagem.itinerarios?.forEach((it: any) => total += parseValor(it.valor));
        transportes?.forEach((tr: any) => total += parseValor(tr.valor));
        seguros?.forEach((tr: any) => total += parseValor(tr.valor));

        setTotalGastos(total);

        if (viagem?.hoteis?.length > 0) {
            const { latitude, longitude } = viagem.hoteis[0];
            buscarFusoHorario(latitude, longitude);
        }
    }, [viagem, transportes, seguros]);

    async function cancelarViagem() {
        try {
            await api.delete(`/api/trip/${id}`);
            Alert.alert("Sucesso", "Viagem cancelada.");
            router.back();
        } catch (error: any) {
            const errMessage = error instanceof Error ? error.message : "Erro ao cancelar viagem.";
            Alert.alert("Erro", errMessage);
        }
    }

    function renderEndereco(endereco?: any): string {
        if (!endereco) return '';
        return [endereco.rua, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado]
            .filter(Boolean).join(', ');
    }

    if (!viagem) {
        return <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>;
    }

    async function buscarFusoHorario(lat: string, long: string) {
        try {
            const timestamp = Math.floor(new Date().getTime() / 1000);
            const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
            const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${timestamp}&key=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                const totalOffset = data.rawOffset + data.dstOffset;
                const localTime = new Date((timestamp + totalOffset) * 1000);

                const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC',
                }).format(localTime);

                setFusoHorario(data.timeZoneName);
                setHoraLocal(horaFormatada);
            } else {
                setFusoHorario('Fuso horário indisponível');
                setHoraLocal(null);
            }
        } catch (error) {
            setFusoHorario('Erro ao buscar fuso');
            setHoraLocal(null);
        }
    }

    async function handleShare() {
        if (!viagem) return;

        let message = "📋 Detalhes da Viagem:\n\n";

        if (viagem.voos?.length > 0) {
            message += "✈️ Voos:\n";
            viagem.voos.forEach((voo: any, index: number) => {
                message += `Voo ${index + 1}:\n`;
                message += `${voo.tipo} - ${voo.origin} → ${voo.destination}\n`;
                message += `Companhia: ${voo.airline}\n`;
                message += `Classe: ${voo.travel_class}\n`;
                message += `Voo nº: ${voo.flight_number}\n`;
                message += `Partida: ${voo.departureTime}\n`;
                message += `Chegada: ${voo.arrivalTime}\n`;
                message += `Preço: ${voo.price}\n\n`;
            });
        }

        if (viagem.hoteis?.length > 0) {
            message += "🏨 Hotéis:\n";
            viagem.hoteis.forEach((hotel: any, index: number) => {
                message += `Hotel ${index + 1}:\n`;
                message += `Nome: ${hotel.name}\n`;
                message += `Endereço: ${hotel.address}\n`;
                message += `Avaliação: ${hotel.rating} (${hotel.reviews} reviews)\n`;
                message += `Check-in: ${hotel.checkin}\n`;
                message += `Check-out: ${hotel.checkout}\n`;
                message += `Preço: ${hotel.total}\n\n`;
            });
        }

        if (viagem.itinerarios?.length > 0) {
            message += "📅 Cronograma:\n";
            viagem.itinerarios.forEach((item: any, index: number) => {
                message += `Item ${index + 1}:\n`;
                message += `Nome: ${item.nomeLocal}\n`;
                message += `Tipo: ${item.tipo}\n`;
                if (item.endereco) {
                    const enderecoCompleto = [
                        item.endereco?.rua,
                        item.endereco?.numero,
                        item.endereco?.bairro,
                        item.endereco?.cidade,
                        item.endereco?.estado
                    ].filter(Boolean).join(', ');
                    message += `Local: ${enderecoCompleto}\n`;
                } else if (item.localizacao) {
                    message += `Local: ${item.localizacao}\n`;
                }
                message += `Valor: ${item.valor}\n`;
                message += `Dia: ${item.dia}\n`;
                if (item.descricao) {
                    message += `Descrição: ${item.descricao}\n`;
                }
                message += "\n";
            });
        }

        if (transportes?.length > 0) {
            message += "🚗 Transportes:\n";
            transportes.forEach((transporte: any, index: number) => {
                message += `Transporte ${index + 1}:\n`;
                message += `Tipo: ${transporte.tipoTransporte === 'aluguel'
                    ? 'Aluguel de Carro'
                    : transporte.tipoTransporte === 'transferencia'
                        ? 'Transferência'
                        : 'Transporte Público'}\n`;
                message += `Empresa: ${transporte.empresa}\n`;
                message += `Partida: ${transporte.dataHoraPartida}\n`;
                message += `Chegada: ${transporte.dataHoraChegada}\n`;
                message += `Valor: ${transporte.valor}\n`;
                if (transporte.modeloVeiculo) message += `Modelo: ${transporte.modeloVeiculo}\n`;
                if (transporte.placaVeiculo) message += `Placa: ${transporte.placaVeiculo}\n`;
                if (transporte.numeroLinha) message += `Linha: ${transporte.numeroLinha}\n`;
                if (transporte.observacoes) message += `Obs: ${transporte.observacoes}\n`;
                message += "\n";
            });


        }

        if (seguros?.length > 0) {
            message += "🛡️ Seguros:\n";
            seguros.forEach((item: any, index: number) => {
                message += `Seguro ${index + 1}:\n`;
                message += `Seguradora: ${item.seguradora}\n`;
                message += `Apólice: ${item.numeroApolice}\n`;
                message += `Início: ${item.dataInicio}\n`;
                message += `Fim: ${item.dataFim}\n`;
                message += `Telefone de Emergência: ${item.telefoneEmergencia}\n`;
                message += `Valor: ${item.valor}\n`;
                if (item.observacoes) {
                    message += `Observações: ${item.observacoes}\n`;
                }
                message += "\n";
            });
        }


        message += `💰 Total estimado da viagem: ${totalGastos.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })}`;

        try {
            await Share.share({ message });
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível compartilhar os dados.");
        }
    }


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>

                {viagem.voos?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Voos</Text>
                        {viagem.voos.map((voo: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    {voo.tipo} - {voo.origin} → {voo.destination}
                                </Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Companhia:</Text> {voo.airline}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Classe:</Text> {voo.travel_class}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Voo nº:</Text> {voo.flight_number}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Partida:</Text> {voo.departureTime}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Chegada:</Text> {voo.arrivalTime}</Text>
                                <Text style={styles.cardInfoPrimary}>{voo.price}</Text>
                            </View>
                        ))}
                    </>
                )}

                {viagem.hoteis?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Hotéis</Text>
                        {viagem.hoteis.map((hotel: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{hotel.name}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Endereço:</Text> {hotel.address}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Avaliação:</Text> {hotel.rating} ({hotel.reviews} reviews)</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Check-in:</Text> {hotel.checkin}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Check-out:</Text> {hotel.checkout}</Text>
                                {viagem.origem !== "Importados" && (
                                    <>
                                        <Text style={styles.cardInfo}><Text style={styles.bold}>Fuso Horário:</Text> {fusoHorario}</Text>
                                        <Text style={styles.cardInfo}><Text style={styles.bold}>Hora Local:</Text> {horaLocal}</Text>
                                    </>
                                )}
                                <Text style={styles.cardInfoPrimary}>{hotel.total}</Text>
                            </View>
                        ))}
                    </>
                )}

                {viagem.itinerarios?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Cronograma</Text>
                        {viagem.itinerarios.map((item: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>Item {index + 1}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Nome:</Text> {item.nomeLocal}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Tipo:</Text> {item.tipo}</Text>
                                {item.endereco && <Text style={styles.cardInfo}><Text style={styles.bold}>Endereço:</Text> {renderEndereco(item.endereco)}</Text>}
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Dia:</Text> {item.dia}</Text>
                                {item.descricao && <Text style={styles.cardInfo}>Descrição: {item.descricao}</Text>}
                                <Text style={styles.cardInfoPrimary}>{item.valor}</Text>

                            </View>
                        ))}
                    </>
                )}

                {transportes?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Transportes</Text>
                        {transportes.map((transporte: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    {transporte.tipoTransporte === 'aluguel'
                                        ? 'Aluguel de Carro'
                                        : transporte.tipoTransporte === 'transferencia'
                                            ? 'Transferência'
                                            : 'Transporte Público'}
                                </Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Empresa:</Text> {transporte.empresa}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Partida:</Text> {transporte.dataHoraPartida}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Chegada:</Text> {transporte.dataHoraChegada}</Text>
                                {transporte.modeloVeiculo && <Text style={styles.cardInfo}><Text style={styles.bold}>Modelo:</Text> {transporte.modeloVeiculo}</Text>}
                                {transporte.placaVeiculo && <Text style={styles.cardInfo}><Text style={styles.bold}>Placa:</Text> {transporte.placaVeiculo}</Text>}
                                {transporte.numeroLinha && <Text style={styles.cardInfo}><Text style={styles.bold}>Linha:</Text> {transporte.numeroLinha}</Text>}
                                {transporte.observacoes && <Text style={styles.cardInfo}><Text style={styles.bold}>Observações:</Text> {transporte.observacoes}</Text>}
                                <Text style={styles.cardInfoPrimary}>{transporte.valor}</Text>

                            </View>
                        ))}
                    </>
                )}

                {seguros?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Seguros</Text>
                        {seguros.map((item: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Seguradora:</Text> {item.seguradora}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Apólice:</Text> {item.numeroApolice}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Início:</Text> {item.dataInicio}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Fim:</Text> {item.dataFim}</Text>
                                <Text style={styles.cardInfo}><Text style={styles.bold}>Tel Emergência:</Text> {item.telefoneEmergencia}</Text>

                                {item.observacoes && (
                                    <Text style={styles.cardInfo}><Text style={styles.bold}>Observações:</Text> {item.observacoes}</Text>
                                )}
                                <Text style={styles.cardInfoPrimary}>{item.valor}</Text>
                            </View>
                        ))}
                    </>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💰 Total estimado da viagem:</Text>
                    <Text style={styles.cardInfoPrimary}>
                        {totalGastos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => router.push({ pathname: "/(modals)/infoAdditional/InfoAdditionalTrip", params: { id } })}
                >
                    <Text style={styles.buttonText}>Mais informações</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => router.push({ pathname: "/(modals)/itinerary/InfoItinerary", params: { id } })}
                >
                    <Text style={styles.buttonText}>Cronograma</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonThird} onPress={handleShare}>
                    <Text style={styles.buttonText}>Compartilhar Viagem</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonFourth} onPress={cancelarViagem}>
                    <Text style={styles.buttonText}>Cancelar Viagem</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
