import React, { useEffect, useState } from "react";
import Constants from 'expo-constants';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from '@/app/styles/global';

export default function InfoHotel() {

  const [fusoHorario, setFusoHorario] = useState<string | null>(null);
  const [horaLocal, setHoraLocal] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  async function buscarFusoHorario(lat: string, long: string) {
    try {
      const timestamp = Math.floor(new Date().getTime() / 1000);
      const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${timestamp}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const totalOffset = data.rawOffset + data.dstOffset;
        const localTime = new Date((timestamp + totalOffset) * 1000);

        const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        }).format(localTime);

        setFusoHorario(data.timeZoneName);
        setHoraLocal(horaFormatada);
      } else {
        setFusoHorario('Fuso horário indisponível');
        setHoraLocal(null);
      }
    } catch (error) {
      setFusoHorario('Erro ao buscar fuso');
      setHoraLocal(null);
    }
  }

  const router = useRouter();
  const {
    name,
    address,
    rating,
    reviews,
    price,
    checkin,
    checkout,
    total,
    latitude,
    longitude
  } = useLocalSearchParams();

  async function adicionarAoCarrinho() {
    try {
      const novoHotel = {
        name,
        address,
        rating,
        reviews,
        price,
        checkin,
        checkout,
        total,
        latitude,
        longitude
      };
      console.log('LAT:', latitude, 'LONG:', longitude);

      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) {
        Alert.alert('Erro', 'Usuário não identificado.');
        return;
      }

      const carrinhoAtual = await AsyncStorage.getItem(`@carrinho_hoteis_${userId}`);
      const carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];

      carrinho.push(novoHotel);
      await AsyncStorage.setItem(`@carrinho_hoteis_${userId}`, JSON.stringify(carrinho));

      Alert.alert('Sucesso', 'Hotel adicionado ao carrinho!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o hotel.');
    }
  }

  useEffect(() => {
    if (latitude && longitude) {
      buscarFusoHorario(latitude as string, longitude as string);
    }

    navigation.setOptions({
      title: 'Detalhes do Hotel',
      headerBackTitle: 'Voltar',
    });
  }, [navigation, latitude, longitude]);


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[{ paddingBottom: 100 }]}>
        <View style={styles.flexColumn}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardInfo}>Avaliação: {rating} • {reviews}</Text>
        <Text style={styles.cardInfo}>{address}</Text>
        <Text style={styles.cardInfo}>Check-in: {checkin}</Text>
        <Text style={styles.cardInfo}>Check-out: {checkout}</Text>
        <Text style={styles.cardInfo}>Fuso horário: {fusoHorario} </Text>
        <Text style={styles.cardInfo}>Horário Local: {horaLocal}</Text>
        <Text style={styles.cardInfo}>Preço diária: {price}</Text>
        <Text style={styles.cardInfoPrimary}>Total: {total}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarAoCarrinho}>
          <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

