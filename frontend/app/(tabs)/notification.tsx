import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { parse, subDays, format, isAfter, isBefore } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../src/services/api';

export default function NotificationScreen() {
  const [alertas, setAlertas] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const carregarAlertas = async () => {
        try {
          const userId = await AsyncStorage.getItem("@user_id");
          if (!userId) return;

          const response = await api.get("/api/trip", { params: { userId } });
          const viagens = response.data.filter((v: any) => v.userId === userId);

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0); // considera só a data

          const daqui24h = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
          const listaAlertas: any[] = [];

          viagens.forEach((viagem: any) => {
            viagem.hoteis?.forEach((hotel: any) => {
              const checkinData = parse(hotel.checkin + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
              const alertaCheckin = subDays(checkinData, 1);
              alertaCheckin.setHours(0, 0, 0, 0);

              if (isAfter(alertaCheckin, hoje) && isBefore(alertaCheckin, daqui24h)) {
                listaAlertas.push({
                  tipo: 'Check-in no hotel',
                  data: format(alertaCheckin, 'dd/MM/yyyy'),
                  hora: null,
                  local: hotel.name,
                  timestamp: alertaCheckin.getTime()
                });
              }

              if (hotel.checkout) {
                const checkoutData = parse(hotel.checkout + ' 10:00', 'dd/MM/yyyy HH:mm', new Date());
                const alertaCheckout = subDays(checkoutData, 1);
                alertaCheckout.setHours(0, 0, 0, 0);

                if (isAfter(alertaCheckout, hoje) && isBefore(alertaCheckout, daqui24h)) {
                  listaAlertas.push({
                    tipo: 'Check-out do hotel',
                    data: format(alertaCheckout, 'dd/MM/yyyy'),
                    hora: null,
                    local: hotel.name,
                    timestamp: alertaCheckout.getTime()
                  });
                }
              }
            });

            viagem.voos?.forEach((voo: any) => {
              const partida = parse(voo.departureTime, 'dd/MM/yyyy, HH:mm', new Date());
              const alertaVoo = subDays(partida, 1);

              if (isAfter(alertaVoo, new Date()) && isBefore(alertaVoo, new Date(Date.now() + 24 * 60 * 60 * 1000))) {
                listaAlertas.push({
                  tipo: `Voo (${voo.tipo})`,
                  data: format(alertaVoo, 'dd/MM/yyyy'),
                  hora: format(partida, 'HH:mm'),
                  local: `${voo.origin} → ${voo.destination}`,
                  timestamp: alertaVoo.getTime()
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
      {alertas.length === 0 ? (
        <Text style={styles.semAlerta}>Nenhum alerta para as próximas 24 horas.</Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.alertaItem}>
              <Text style={styles.alertaTipo}>{item.tipo}</Text>
              <Text>{item.local}</Text>
              <Text>📅 {item.data}{item.hora ? ` - 🕒 ${item.hora}` : ''}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  semAlerta: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
  },
  alertaItem: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  alertaTipo: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
