import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InfoVooModal() {
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

      const carrinhoAtual = await AsyncStorage.getItem('@carrinho_voos');
      const carrinho = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];

      carrinho.push(voo);
      await AsyncStorage.setItem('@carrinho_voos', JSON.stringify(carrinho));

      Alert.alert('Sucesso', `Voo de ${tipo} adicionado ao carrinho.`);
      router.back(); // volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o voo ao carrinho.');
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={styles.content}>
        <Text style={styles.titulo}>Detalhes do Voo ({tipo})</Text>
        <Text style={styles.info}>Origem: {origin}</Text>
        <Text style={styles.info}>Destino: {destination}</Text>
        <Text style={styles.info}>Companhia: {airline}</Text>
        <Text style={styles.info}>Partida: {departureTime}</Text>
        <Text style={styles.info}>Chegada: {arrivalTime}</Text>
        <Text style={styles.info}>Preço: {price}</Text>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={adicionarAoCarrinho}>
            <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
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
  footer: {
    marginTop: 'auto',
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
