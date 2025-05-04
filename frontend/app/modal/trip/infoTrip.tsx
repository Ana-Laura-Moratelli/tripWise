import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Share } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../../../src/services/api";
import styles from '@/src/styles/global';

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
    const [totalGastos, setTotalGastos] = useState(0);

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes da Viagem",
            headerBackTitle: "Voltar",
        });
    }, [navigation]);

    async function fetchViagem() {
        try {
            const response = await api.get("/api/trip");
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

                // Soma de gastos 
                let total = 0;
                item.voos?.forEach((voo: any) => (total += parseValor(voo.price)));
                item.hoteis?.forEach((hotel: any) => (total += parseValor(hotel.total)));
                item.itinerarios?.forEach((it: any) => (total += parseValor(it.valor)));
                setTotalGastos(total);

                setViagem(item);
            } else {
                setViagem(null);
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar os dados da viagem.");
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchViagem();
        }, [])
    );

    async function cancelarViagem() {
        try {
            await api.delete(`/api/trip/${id}`);
            Alert.alert("Sucesso", "Viagem cancelada.");
            router.back();
        } catch (error: any) {
            const errMessage =
                error instanceof Error ? error.message : "Erro ao cancelar viagem.";
            Alert.alert("Erro", errMessage);
        }
    }

    async function handleShare() {
        if (!viagem) return;

        let message = "Detalhes da Viagem:\n\n";

        if (viagem.voos?.length > 0) {
            message += "Voos:\n";
            viagem.voos.forEach((voo: any, index: number) => {
                message += `Voo ${index + 1}:\n`;
                message += `${voo.tipo} - ${voo.origin} → ${voo.destination}\n`;
                message += `Companhia: ${voo.airline}\n`;
                message += `Partida: ${voo.departureTime}\n`;
                message += `Chegada: ${voo.arrivalTime}\n`;
                message += `Preço: ${voo.price}\n\n`;
            });
        }

        if (viagem.hoteis?.length > 0) {
            message += "Hotéis:\n";
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
            message += "Cronograma:\n";
            viagem.itinerarios.forEach((item: any, index: number) => {
                message += `Item ${index + 1}:\n`;
                message += `Nome: ${item.nomeLocal}\n`;
                message += `Tipo: ${item.tipo}\n`;
                message += `Local: ${item.localizacao}\n`;
                message += `Valor: ${item.valor}\n`;
                message += `Dia: ${item.dia}\n`;
                if (item.descricao) {
                    message += `Descrição: ${item.descricao}\n`;
                }
                message += "\n";
            });
        }

        try {
            await Share.share({ message });
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível compartilhar os dados.");
        }
    }

    if (!viagem) {
        return <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>;
    }

    function renderEndereco(endereco?: any): string {
        if (!endereco) return '';
        return [endereco.rua, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado]
          .filter(Boolean).join(', ');
      }
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[{ paddingBottom: 10 }]}>
                {viagem.voos?.length > 0 && (
                    <>
                        <Text style={styles.cardTitle}>Voos</Text>
                        {viagem.voos.map((voo: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    {voo.tipo} - {voo.origin} → {voo.destination}
                                </Text>
                                <Text style={styles.cardInfo}>Companhia: {voo.airline}</Text>
                                <Text style={styles.cardInfo}>Partida: {voo.departureTime}</Text>
                                <Text style={styles.cardInfo}>Chegada: {voo.arrivalTime}</Text>
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
                                <Text style={styles.cardInfo}>Endereço: {hotel.address}</Text>
                                <Text style={styles.cardInfo}> Avaliação: {hotel.rating} ({hotel.reviews} reviews)</Text>
                                <Text style={styles.cardInfo}>Check-in: {hotel.checkin}</Text>
                                <Text style={styles.cardInfo}>Check-out: {hotel.checkout}</Text>
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
                                <Text style={styles.cardInfo}>Nome: {item.nomeLocal}</Text>
                                <Text style={styles.cardInfo}>Tipo: {item.tipo}</Text>
                                {item.endereco && <Text style={styles.cardInfo}>Endereço: {renderEndereco(item.endereco)}</Text>}
                                <Text style={styles.cardInfoPrimary}>Valor: {item.valor}</Text>
                                <Text style={styles.cardInfo}>Dia: {item.dia}</Text>
                                {item.descricao && <Text style={styles.cardInfo}>Descrição: {item.descricao}</Text>}
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
                    onPress={() =>
                        router.push({
                            pathname: "/modal/infoAdditional/infoAdditionalTrip",
                            params: { id },
                        })
                    }
                >
                    <Text style={styles.buttonText}>Mais informações</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() =>
                        router.push({
                            pathname: "/modal/itinerary/infoItinerary",
                            params: { id },
                        })
                    }
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
