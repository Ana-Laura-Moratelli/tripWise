import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Alert,
  ScrollView,
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
          const userId = await AsyncStorage.getItem('@user_id');
          if (!userId) return;
  
          const voosSalvos = await AsyncStorage.getItem(`@carrinho_voos_${userId}`);
          const hoteisSalvos = await AsyncStorage.getItem(`@carrinho_hoteis_${userId}`);
  
          setVoosCarrinho(voosSalvos ? JSON.parse(voosSalvos) : []);
          setHoteisCarrinho(hoteisSalvos ? JSON.parse(hoteisSalvos) : []);
        } catch (error) {
        }
      }
      carregarCarrinho();
    }, [])
  );
  

  const removerVoo = async (index: number) => {
    const userId = await AsyncStorage.getItem('@user_id');
    if (!userId) return;
  
    const novaLista = [...voosCarrinho];
    novaLista.splice(index, 1);
    setVoosCarrinho(novaLista);
    await AsyncStorage.setItem(`@carrinho_voos_${userId}`, JSON.stringify(novaLista));
  };
  
  const removerHotel = async (index: number) => {
    const userId = await AsyncStorage.getItem('@user_id');
    if (!userId) return;
  
    const novaLista = [...hoteisCarrinho];
    novaLista.splice(index, 1);
    setHoteisCarrinho(novaLista);
    await AsyncStorage.setItem(`@carrinho_hoteis_${userId}`, JSON.stringify(novaLista));
  };
  

  const realizarViagem = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');

      const response = await fetch("http://192.168.15.7:5000/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, voos: voosCarrinho, hoteis: hoteisCarrinho }),
      });

      if (!response.ok) throw new Error("Erro ao registrar a viagem");

      Alert.alert("Sucesso!", "Viagem registrada com sucesso!");
      setVoosCarrinho([]);
      setHoteisCarrinho([]);
      await AsyncStorage.multiRemove([
        `@carrinho_voos_${userId}`,
        `@carrinho_hoteis_${userId}`
      ]);
          } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao registrar viagem");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        <Text style={styles.title}>Voos no Carrinho</Text>
        {voosCarrinho.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum voo adicionado.</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
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
            scrollEnabled={false}
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
      </ScrollView>

      {(voosCarrinho.length > 0 || hoteisCarrinho.length > 0) && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.botaoViagem} onPress={realizarViagem}>
            <Text style={styles.botaoViagemTexto}>Realizar Viagem</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  textoVazio: {
    color: '#666',
    marginBottom: 12
  },
  item: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitle: {
    width: '70%',
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
    borderRadius: 40,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
    width: '90%',
  },
  botaoViagemTexto: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
