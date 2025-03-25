import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function InfoViagemScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [viagem, setViagem] = useState<any>(null);

    useEffect(() => {
        fetch(`http://192.168.15.9:5000/api/travel`)
            .then((res) => res.json())
            .then((data) => {
                const item = data.find((v: any) => v.id === id);
                setViagem(item);
            });
    }, []);

    async function cancelarViagem() {
        try {
            await fetch(`http://192.168.15.9:5000/api/travel/${id}`, {
                method: "DELETE",
            });
            Alert.alert("Sucesso", "Viagem cancelada.");
            router.back();
        } catch (error) {
            const errMessage =
                error instanceof Error ? error.message : "Erro ao cancelar viagem.";
            Alert.alert("Erro", errMessage);
        }
    }

    async function handleShare() {
        if (!viagem) return;

        let message = "Detalhes da Viagem:\n\n";

        // Seção de Voos
        if (viagem.voos && viagem.voos.length > 0) {
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

        // Seção de Hotéis
        if (viagem.hoteis && viagem.hoteis.length > 0) {
            message += "Hotéis:\n";
            viagem.hoteis.forEach((hotel: any, index: number) => {
                message += `Hotel ${index + 1}:\n`;
                message += `Nome: ${hotel.name}\n`;
                message += `Endereço: ${hotel.address}\n`;
                message += `Avaliação: ${hotel.rating} (${hotel.reviews} reviews)\n`;
                message += `Check-in: ${hotel.checkin}\n`;
                message += `Check-out: ${hotel.checkout}\n`;
                message += `Preço: ${hotel.price}\n\n`;
            });
        }

        // Seção de Cronograma (itinerário), se existir
        if (viagem.itinerarios && viagem.itinerarios.length > 0) {
            message += "Cronograma:\n";
            viagem.itinerarios.forEach((item: any, index: number) => {
                message += `Item ${index + 1}:\n`;
                message += `Nome: ${item.nomeLocal}\n`;
                message += `Tipo: ${item.tipo}\n`;
                message += `Local: ${item.localizacao}\n`;
                message += `Horário: ${item.horario}\n`;
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

    if (!viagem) return <Text style={{ padding: 20 }}>Carregando...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Detalhes da Viagem</Text>

            {/* Seção de Voos */}
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

            {/* Seção de Hotéis */}
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
                            <Text style={styles.price}>{hotel.price}</Text>
                        </View>
                    ))}
                </>
            )}

            {/* Seção de Cronograma */}
            {viagem.itinerarios?.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Cronograma</Text>
                    {viagem.itinerarios.map((item: any, index: number) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.cardTitle}>Item {index + 1}</Text>
                            <Text>Nome: {item.nomeLocal}</Text>
                            <Text>Tipo: {item.tipo}</Text>
                            <Text>Local: {item.localizacao}</Text>
                            <Text>Horário: {item.horario}</Text>
                            <Text>Dia: {item.dia}</Text>
                            {item.descricao && (
                                <Text>Descrição: {item.descricao}</Text>
                            )}
                        </View>
                    ))}
                </>
            )}

            <TouchableOpacity
                style={styles.cronogramaButton}
                onPress={() =>
                    router.push({
                        pathname: "/infoCronogramaModal",
                        params: { id },
                    })
                }
            >
                <Text style={styles.cronogramaButtonText}>Cronograma</Text>
            </TouchableOpacity>

            {/* Botão de Compartilhar */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareButtonText}>Compartilhar Viagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={cancelarViagem}>
                <Text style={styles.cancelButtonText}>Cancelar Viagem</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#FFF",
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
        borderRadius: 10,
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
        backgroundColor: "#D00",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    cancelButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    cronogramaButton: {
        backgroundColor: "#5B2FD4",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 30,
    },
    cronogramaButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    shareButton: {
        backgroundColor: "#34A853",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    shareButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
});
