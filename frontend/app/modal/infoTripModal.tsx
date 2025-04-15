import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Share,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../../src/services/api";

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

export default function InfoViagemScreen() {
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

                // 🧮 Soma de gastos
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
        return <Text style={{ padding: 20 }}>Carregando...</Text>;
    }

    return (
        <View style={styles.container}>
            <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 260 }]}>

                {viagem.voos?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Voos</Text>
                        {viagem.voos.map((voo: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>
                                    {voo.tipo} - {voo.origin} → {voo.destination}
                                </Text>
                                <Text>Companhia: {voo.airline}</Text>
                                <Text>Partida: {voo.departureTime}</Text>
                                <Text>Chegada: {voo.arrivalTime}</Text>
                                <Text style={styles.price}>{voo.price}</Text>
                            </View>
                        ))}
                    </>
                )}

                {viagem.hoteis?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Hotéis</Text>
                        {viagem.hoteis.map((hotel: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{hotel.name}</Text>
                                <Text>Endereço: {hotel.address}</Text>
                                <Text>
                                    Avaliação: {hotel.rating} ({hotel.reviews} reviews)
                                </Text>
                                <Text>Check-in: {hotel.checkin}</Text>
                                <Text>Check-out: {hotel.checkout}</Text>
                                <Text style={styles.price}>{hotel.total}</Text>
                            </View>
                        ))}
                    </>
                )}

                {viagem.itinerarios?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Cronograma</Text>
                        {viagem.itinerarios.map((item: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>Item {index + 1}</Text>
                                <Text>Nome: {item.nomeLocal}</Text>
                                <Text>Tipo: {item.tipo}</Text>
                                <Text>Local: {item.localizacao}</Text>
                                <Text>Valor: {item.valor}</Text>
                                <Text>Dia: {item.dia}</Text>
                                {item.descricao && <Text>Descrição: {item.descricao}</Text>}
                            </View>
                        ))}
                    </>
                )}
                <View style={{ marginTop: 20, padding: 14, backgroundColor: '#F9F9F9', borderRadius: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>💰 Total estimado da viagem:</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#5B2FD4' }}>
                        {totalGastos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                </View>

            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.infoAdditionalButton}
                    onPress={() =>
                        router.push({
                            pathname: "/modal/infoAdditionalTripModal",
                            params: { id },
                        })
                    }
                >
                    <Text style={styles.cronogramaButtonText}>Mais informações</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cronogramaButton}
                    onPress={() =>
                        router.push({
                            pathname: "/modal/infoItineraryModal",
                            params: { id },
                        })
                    }
                >


                    <Text style={styles.cronogramaButtonText}>Cronograma</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>Compartilhar Viagem</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={cancelarViagem}>
                    <Text style={styles.cancelButtonText}>Cancelar Viagem</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        color: "#333",
    },
    card: {
        backgroundColor: "#EFEFEF",
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
    },
    cardTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    price: {
        marginTop: 4,
        color: "#5B2FD4",
        fontWeight: "bold",
    },
    cancelButton: {
        width: "100%",
        backgroundColor: "#D00",
        padding: 14,
        borderRadius: 40,
        alignItems: "center",
    },
    footer: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 10,
        padding: 20,
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#FFF",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    cronogramaButton: {
        backgroundColor: "#F68712",
        width: "100%",
        padding: 14,
        borderRadius: 40,
        alignItems: "center",
    },
    infoAdditionalButton: {
        backgroundColor: "#5B2FD4",
        width: "100%",
        padding: 14,
        borderRadius: 40,
        alignItems: "center",
    },
    cronogramaButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    shareButton: {
        width: "100%",
        backgroundColor: "#34A853",
        padding: 14,
        borderRadius: 40,
        alignItems: "center",
    },
    shareButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    maisinfoButton: {
        backgroundColor: "#5B2FD4",
        width: "100%",
        padding: 14,
        borderRadius: 40,
        alignItems: "center",
    },
});
