import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from '@/src/styles/global';

export default function InfoFlight() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    navigation.setOptions({
      title: 'Detalhes do Voo',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);




  const router = useRouter();
  const {
    tipo,
    origin,
    destination,
    airline,
    departureTime,
    arrivalTime,
    price,
  } = useLocalSearchParams();

  async function adicionarAoCarrinho() {
    try {
      const voo = {
        tipo,
        origin,
        destination,
        airline,
        departureTime,
        arrivalTime,
        price,
      };

      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) {
        Alert.alert('Erro', 'Usuário não identificado.');
        return;
      }

      const carrinhoAtual = await AsyncStorage.getItem(`@carrinho_voos_${userId}`);
      const carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];

      carrinho.push(voo);
      await AsyncStorage.setItem(`@carrinho_voos_${userId}`, JSON.stringify(carrinho));

      Alert.alert('Sucesso', `Voo de ${tipo} adicionado ao carrinho.`);
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o voo ao carrinho.');
    }
  }


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[{ paddingBottom: 100 }]}>
        <View style={styles.flexColumn}>
          <Text style={styles.cardTitle}>Detalhes do Voo ({tipo})</Text>
          <Text style={styles.cardInfo}>Origem: {origin}</Text>
          <Text style={styles.cardInfo}>Destino: {destination}</Text>
          <Text style={styles.cardInfo}>Companhia: {airline}</Text>
          <Text style={styles.cardInfo}>Partida: {departureTime}</Text>
          <Text style={styles.cardInfo}>Chegada: {arrivalTime}</Text>
          <Text style={styles.cardInfoPrimary}>Preço: {price}</Text>
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
