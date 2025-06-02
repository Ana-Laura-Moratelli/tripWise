import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from '@/src/services/api';
import { Viagem } from '@/src/types/travel';
import { Voo } from '@/src/types/flight'
import { Hotel } from '@/src/types/hotel';
import styles from '@/src/styles/global';
import { Stack } from "expo-router";
import { useIsFocused } from '@react-navigation/native';

export default function Trip() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const router = useRouter();
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      async function carregarViagens() {
        try {
          const userId = await AsyncStorage.getItem("@user_id");
          if (!userId) return;

          const response = await api.get("/api/trip", {
            params: { userId }
          });


          setViagens(response.data);
        } catch (error) {
          console.error("Erro ao carregar viagens:", error);
        }
      }
      if (isFocused) {
        carregarViagens();
      }

    }, [isFocused])
  );


  const renderVoo = (voos: Voo[]) => {
    const origem = voos[0]?.origin;
    const destino = voos[0]?.destination;
    const data = voos[0]?.departureTime;
    const trechos = voos.length;

    return (
      <View>
        <Text style={styles.cardTitle}>✈️ Voo: {origem} → {destino}</Text>
        <Text style={styles.cardInfo}>{trechos} trecho{trechos > 1 ? 's' : ''} - {data}</Text>
      </View>
    );
  };

  const renderHotel = (hoteis: Hotel[]) => {
    return hoteis.map((hotel, index) => (
      <View key={index}>
        <Text style={styles.cardTitle}>🏨 Hotel: {hotel.name}</Text>
        <Text style={styles.cardInfo}>Check-in: {hotel.checkin}</Text>
      </View>
    ));
  };


  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          title: "Viagens",
        }}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Text style={styles.title}>Histórico de Viagens</Text>

      {viagens.length === 0 ? (
        <Text style={styles.noitens}>Nenhuma viagem realizada ainda.</Text>
      ) : (
        <FlatList
          data={viagens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(modals)/trip/infoTrip",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.card}>
                {item.voos && item.voos.length > 0 && renderVoo(item.voos)}
                {item.hoteis && item.hoteis.length > 0 && renderHotel(item.hoteis)}
                {item.origem === 'Importados' && (
                  <View style={styles.importedBadgeContainer}>
                    <Text style={styles.importedBadgeText}>Importado via e-mail</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
