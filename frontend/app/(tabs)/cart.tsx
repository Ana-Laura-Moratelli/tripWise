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
import * as Calendar from 'expo-calendar';
import { parse } from 'date-fns';
import { api } from '../../src/services/api';

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
  total: string;
  checkin: string;
  checkout: string;
  latitude: string;
  longitude: string;
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
        } catch (error) {}
      }
      carregarCarrinho();
    }, [])
  );

  function parseDataHora(dataHora: string) {
    return parse(dataHora, 'dd/MM/yyyy, HH:mm', new Date());
  }

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


  async function criarEventoCalendario(titulo: string, startDate: Date, endDate?: Date) {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Autorize o acesso ao calendário para criar lembretes.');
      return;
    }
  
    const calendars = await Calendar.getCalendarsAsync();
    const calendarioPadrao = calendars.find(cal => cal.allowsModifications);
  
    if (!calendarioPadrao) {
      Alert.alert('Erro', 'Não foi encontrado um calendário modificável no dispositivo.');
      return;
    }
  
    await Calendar.createEventAsync(calendarioPadrao.id, {
      title: titulo,
      startDate,
      endDate: endDate ?? startDate,
      timeZone: 'America/Sao_Paulo',
      allDay: !endDate || startDate.toDateString() === endDate.toDateString()
    });
  }
  
  const realizarViagem = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) throw new Error("Usuário não autenticado");
  
      const hoteisComGeo = hoteisCarrinho.map(hotel => ({
        ...hotel,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      }));
  
      const response = await api.post("/api/trip", {
        userId,
        voos: voosCarrinho,
        hoteis: hoteisComGeo,
      });
  
      if (response.status < 200 || response.status >= 300) {
        throw new Error("Erro ao registrar a viagem");
      }
  
      // Adiciona check-in e check-out como eventos separados
      for (const hotel of hoteisCarrinho) {
        const checkinDate = new Date(hotel.checkin.split('/').reverse().join('-') + 'T14:00:00');
        const checkoutDate = new Date(hotel.checkout.split('/').reverse().join('-') + 'T12:00:00');
        await criarEventoCalendario(`Check-in no hotel ${hotel.name}`, checkinDate);
        await criarEventoCalendario(`Check-out do hotel ${hotel.name}`, checkoutDate);
      }
  
      // Adiciona partidas e chegadas dos voos separadamente
      for (const voo of voosCarrinho) {
        const partida = parseDataHora(voo.departureTime);
        const chegada = parseDataHora(voo.arrivalTime);
        await criarEventoCalendario(`Voo: ${voo.origin} → ${voo.destination}`, partida, chegada);
      }
  
      Alert.alert("Sucesso!", "Viagem registrada e eventos adicionados ao calendário!");
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
                <Text style={styles.preco}>{item.total}</Text>
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
