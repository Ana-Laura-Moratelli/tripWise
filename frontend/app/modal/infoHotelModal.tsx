import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export default function InfoHotelModal() {

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
    
        useEffect(() => {
          navigation.setOptions({
            title: 'Detalhes do Hotel',
            headerBackTitle: 'Voltar',
          });
        }, [navigation]);

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
      };
  
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
      router.back(); // Volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o hotel.');
      console.error(error);
    }
  }
  

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={styles.content}>
        <Text style={styles.titulo}>{name}</Text>
        <Text style={styles.info}>Avaliação: {rating} • {reviews}</Text>
        <Text style={styles.info}>{address}</Text>
        <Text style={styles.info}>Check-in: {checkin}</Text>
        <Text style={styles.info}>Check-out: {checkout}</Text>
        <Text style={styles.info}>Preço diária: {price}</Text>
        <Text style={styles.info}>Total: {total}</Text>
        <View style={styles.footer}>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButton} onPress={adicionarAoCarrinho}>
              <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  hotelName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  removeButton: {
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#EEE',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 12,
  },
  footercart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B2FD4',
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    padding: 16,
    borderRadius: 40,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});
