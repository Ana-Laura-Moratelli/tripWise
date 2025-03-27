import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';

interface Viagem {
  id: string;
  voos?: Voo[];
  hoteis?: Hotel[];
}

interface Voo {
  tipo: string;
  origin: string;
  destination: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

interface Hotel {
  name: string;
  checkin: string;
  checkout: string;
  preco: string;
}

export default function ViagemRealizadaScreen() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function carregarViagens() {
        try {
          const response = await fetch("http://192.168.15.9:5000/api/travel");
          const json = await response.json();
          setViagens(json);
        } catch (error) {
          console.error("Erro ao buscar viagens realizadas:", error);
        }
      }
      carregarViagens();
    }, [])
  );

  const renderVoo = (voos: Voo[]) => {
    const origem = voos[0]?.origin;
    const destino = voos[0]?.destination;
    const data = voos[0]?.departureTime;
    const trechos = voos.length;

    return (
      <View style={styles.subItem}>
        <Text style={styles.vooTitle}>✈️ Voo: {origem} → {destino}</Text>
        <Text style={styles.vooInfo}>{trechos} trecho{trechos > 1 ? 's' : ''} - {data}</Text>
      </View>
    );
  };

  const renderHotel = (hoteis: Hotel[]) => {
    return hoteis.map((hotel, index) => (
      <View key={index} style={styles.subItem}>
        <Text style={styles.vooTitle}>🏨 Hotel: {hotel.name}</Text>
        <Text style={styles.vooInfo}>Check-in: {hotel.checkin}</Text>
      </View>
    ));
  };
  

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.content}>
        <Text style={styles.title}>Histórico de Viagens</Text>

        {viagens.length === 0 ? (
          <Text style={{ color: '#666' }}>Nenhuma viagem realizada ainda.</Text>
        ) : (
          <FlatList
            data={viagens}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/modal/infoTripModal",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.vooItem}>
                  {item.voos && item.voos.length > 0 && renderVoo(item.voos)}
                  {item.hoteis && item.hoteis.length > 0 && renderHotel(item.hoteis)}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vooItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  subItem: {
  },
  vooTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vooInfo: {
    color: '#666',
  },
});
