import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  address: string;
  rating: string;
  reviews: string;
  price: string;
  checkin: string;
  checkout: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [voosCarrinho, setVoosCarrinho] = useState<Voo[]>([]);
  const [hoteisCarrinho, setHoteisCarrinho] = useState<Hotel[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarCarrinho() {
        try {
          const voosSalvos = await AsyncStorage.getItem('@carrinho_voos');
          const hoteisSalvos = await AsyncStorage.getItem('@carrinho_hoteis');

          setVoosCarrinho(voosSalvos ? JSON.parse(voosSalvos) : []);
          setHoteisCarrinho(hoteisSalvos ? JSON.parse(hoteisSalvos) : []);
        } catch (error) {
          console.error("Erro ao carregar o carrinho:", error);
        }
      }
      carregarCarrinho();
    }, [])
  );

  const removerVoo = async (index: number) => {
    const novaLista = [...voosCarrinho];
    novaLista.splice(index, 1);
    setVoosCarrinho(novaLista);
    await AsyncStorage.setItem('@carrinho_voos', JSON.stringify(novaLista));
  };

  const removerHotel = async (index: number) => {
    const novaLista = [...hoteisCarrinho];
    novaLista.splice(index, 1);
    setHoteisCarrinho(novaLista);
    await AsyncStorage.setItem('@carrinho_hoteis', JSON.stringify(novaLista));
  };

  const realizarViagem = async () => {
    try {
      const userId = "id-do-usuario-logado"; // Substitua pelo ID real

      const response = await fetch("http://192.168.15.9:5000/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, voos: voosCarrinho, hoteis: hoteisCarrinho }),
      });

      if (!response.ok) throw new Error("Erro ao registrar a viagem");

      Alert.alert("Sucesso!", "Viagem registrada com sucesso!");
      setVoosCarrinho([]);
      setHoteisCarrinho([]);
      await AsyncStorage.multiRemove(['@carrinho_voos', '@carrinho_hoteis']);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao registrar viagem");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.content}>
        <Text style={styles.title}>Voos no Carrinho</Text>
        {voosCarrinho.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum voo adicionado.</Text>
        ) : (
          <FlatList
            data={voosCarrinho}
            keyExtractor={(_, index) => `voo-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {item.tipo} - {item.origin} → {item.destination}
                  </Text>
                  <TouchableOpacity onPress={() => removerVoo(index)}>
                    <Text style={styles.removerTexto}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <Text>Companhia: {item.airline}</Text>
                <Text>Partida: {item.departureTime}</Text>
                <Text>Chegada: {item.arrivalTime}</Text>
                <Text style={styles.preco}>{item.price}</Text>
              </View>
            )}
          />
        )}

        <Text style={[styles.title, { marginTop: 24 }]}>Hotéis no Carrinho</Text>
        {hoteisCarrinho.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum hotel adicionado.</Text>
        ) : (
          <FlatList
            data={hoteisCarrinho}
            keyExtractor={(_, index) => `hotel-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removerHotel(index)}>
                    <Text style={styles.removerTexto}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <Text>{item.address}</Text>
                <Text>Avaliação: {item.rating} ({item.reviews})</Text>
                <Text>Check-in: {item.checkin}</Text>
                <Text>Check-out: {item.checkout}</Text>
                <Text style={styles.preco}>{item.price}</Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.botaoViagem} onPress={realizarViagem}>
          <Text style={styles.botaoViagemTexto}>Realizar Viagem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  textoVazio: { color: '#666', marginBottom: 12 },
  item: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removerTexto: {
    color: '#D00',
    fontWeight: 'bold',
  },
  preco: {
    marginTop: 6,
    color: '#5B2FD4',
    fontWeight: 'bold',
  },
  botaoViagem: {
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
  },
  botaoViagemTexto: {
    color: 'white',
    fontWeight: '600',
  },
});
