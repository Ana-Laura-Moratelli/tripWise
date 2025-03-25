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
  voos: Voo[];
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
                    pathname: "/infoTripModal",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.vooItem}>
                  <Text style={styles.vooTitle}>
                    Viagem de {item.voos[0]?.origin} → {item.voos[item.voos.length - 1]?.destination}
                  </Text>
                  <Text style={{ color: '#666' }}>
                    {item.voos.length} trechos - {item.voos[0]?.departureTime}
                  </Text>
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
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vooTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});