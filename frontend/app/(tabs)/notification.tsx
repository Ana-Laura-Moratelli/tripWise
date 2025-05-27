import React, { useState, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { parse, format, isAfter, isBefore, endOfTomorrow } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../src/services/api';
import styles from '@/src/styles/global';
import { Stack } from "expo-router";

export default function Notification() {
  const [alertas, setAlertas] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const carregarAlertas = async () => {
        try {
          const userId = await AsyncStorage.getItem("@user_id");
          if (!userId) return;

          const response = await api.get("/api/trip", { params: { userId } });
          const viagens = response.data.filter((v: any) => v.userId === userId);

          const agora = new Date();
          const limite = endOfTomorrow(); // Até amanhã às 23:59

          const listaAlertas: any[] = [];

          viagens.forEach((viagem: any) => {
            // 🔔 Hoteis
            viagem.hoteis?.forEach((hotel: any) => {
              const checkinData = parse(hotel.checkin + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
              if (isAfter(checkinData, agora) && isBefore(checkinData, limite)) {
                listaAlertas.push({
                  tipo: 'Check-in no hotel',
                  data: format(checkinData, 'dd/MM/yyyy'),
                  local: hotel.name,
                  timestamp: checkinData.getTime(),
                });
              }

              const checkoutData = parse(hotel.checkout + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
              if (isAfter(checkoutData, agora) && isBefore(checkoutData, limite)) {
                listaAlertas.push({
                  tipo: 'Check-out do hotel',
                  data: format(checkoutData, 'dd/MM/yyyy'),
                  local: hotel.name,
                  timestamp: checkoutData.getTime(),
                });
              }
            });

            // 🔔 Voos
            viagem.voos?.forEach((voo: any) => {
              const partida = parse(voo.departureTime, 'dd/MM/yyyy, HH:mm', new Date());
              if (isAfter(partida, agora) && isBefore(partida, limite)) {
                listaAlertas.push({
                  tipo: `Voo (${voo.tipo})`,
                  data: format(partida, 'dd/MM/yyyy'),
                  hora: format(partida, 'HH:mm'),
                  local: `${voo.origin} → ${voo.destination}`,
                  timestamp: partida.getTime(),
                });
              }
            });
          });

          listaAlertas.sort((a, b) => a.timestamp - b.timestamp);
          setAlertas(listaAlertas);
        } catch (error) {
          console.error('Erro ao carregar alertas:', error);
        }
      };

      carregarAlertas();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notificações",
        }}
      />
      {alertas.length === 0 ? (
        <Text style={styles.noitens}>Nenhuma viagem nas próximas 24 horas.</Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.typeAlert}>{item.tipo}</Text>
              <Text>{item.local}</Text>
              <Text>📅 {item.data}{item.hora ? ` - 🕒 ${item.hora}` : ''}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
