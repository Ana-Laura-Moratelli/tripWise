import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { parse } from 'date-fns';
import { api } from '@/services/api';
import { Voo } from '@/types/flight';
import { Hotel } from '@/types/hotel';
import styles from '@/app/styles/global';
import { Stack } from "expo-router";

export default function Cart() {
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
        } catch (error) { }
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
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Autorize o acesso ao calendário para criar lembretes.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
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
    } catch (error: any) {
      Alert.alert('Erro ao adicionar ao calendário', error?.message || 'Erro desconhecido');
    }
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

      for (const hotel of hoteisCarrinho) {
        const checkinDate = new Date(hotel.checkin.split('/').reverse().join('-') + 'T14:00:00');
        const checkoutDate = new Date(hotel.checkout.split('/').reverse().join('-') + 'T12:00:00');
        await criarEventoCalendario(`Check-in no hotel ${hotel.name}`, checkinDate);
        await criarEventoCalendario(`Check-out do hotel ${hotel.name}`, checkoutDate);
      }

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

      <Stack.Screen
        options={{
          title: "Carrinho",
        }}
      />
      <ScrollView contentContainerStyle={[{ paddingBottom: 80 }]}>
        <Text style={styles.title}>Voos no Carrinho</Text>
        {voosCarrinho.length === 0 ? (
          <Text style={styles.noitens}>Nenhum voo adicionado.</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={voosCarrinho}
            keyExtractor={(_, index) => `voo-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <View style={styles.flexRow}>
                  <View style={styles.width70}>
                    <Text style={styles.cardTitle}>
                      {item.tipo} - {item.origin} → {item.destination}
                    </Text>
                    <Text style={styles.cardInfo}>Companhia: {item.airline}</Text>
                    <Text style={styles.cardInfo}>Classe: {item.travel_class}</Text>
                    <Text style={styles.cardInfo}>Voo nº: {item.flight_number}</Text>
                    <Text style={styles.cardInfo}>Partida: {item.departureTime}</Text>
                    <Text style={styles.cardInfo}>Chegada: {item.arrivalTime}</Text>
                    <Text style={styles.cardInfoPrimary}>{item.price}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removerVoo(index)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <Text style={styles.title}>Hotéis no Carrinho</Text>
        {hoteisCarrinho.length === 0 ? (
          <Text style={styles.noitens}>Nenhum hotel adicionado.</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={hoteisCarrinho}
            keyExtractor={(_, index) => `hotel-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <View style={styles.flexRow}>
                  <View style={styles.width70}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardInfo}>{item.address}</Text>
                    <Text style={styles.cardInfo}>Avaliação: {item.rating} ({item.reviews})</Text>
                    <Text style={styles.cardInfo}>Check-in: {item.checkin}</Text>
                    <Text style={styles.cardInfo}>Check-out: {item.checkout}</Text>
                    <Text style={styles.cardInfoPrimary}>{item.total}</Text>
                  </View>

                  <TouchableOpacity onPress={() => removerHotel(index)}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>

      {(voosCarrinho.length > 0 || hoteisCarrinho.length > 0) && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={realizarViagem}>
            <Text style={styles.buttonText}>Realizar Viagem</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
