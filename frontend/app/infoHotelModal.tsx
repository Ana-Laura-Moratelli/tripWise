import React from 'react';
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

export default function InfoHotelModal() {
  const router = useRouter();
  const {
    name,
    address,
    rating,
    reviews,
    price,
    checkin,
    checkout,
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
      };

      const carrinhoAtual = await AsyncStorage.getItem('@carrinho_hoteis');
      const carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];

      carrinho.push(novoHotel);
      await AsyncStorage.setItem('@carrinho_hoteis', JSON.stringify(carrinho));

      Alert.alert('Sucesso', 'Hotel adicionado ao carrinho!');
      router.back(); // voltar para a tela anterior
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o hotel.');
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={styles.content}>
        <Text style={styles.hotelName}>{name}</Text>
        <Text style={styles.reviews}>{rating} • {reviews}</Text>
        <Text style={styles.location}>{address}</Text>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              Alert.alert('Aviso', 'Ainda não implementado remover hotel.');
            }}
          >
            <Text style={styles.removeButtonText}>Remover hotel</Text>
          </TouchableOpacity>

          <View style={styles.footercart}>
            <View>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.dates}>{checkin} - {checkout}</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={adicionarAoCarrinho}>
              <Text style={styles.addButtonText}>Adicionar carrinho</Text>
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
    borderRadius: 8,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
