import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Tipagem dos voos
interface Voo {
  tipo: string;
  origin: string;
  destination: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [voosCarrinho, setVoosCarrinho] = useState<Voo[]>([]);

  // ✅ Carrega os voos sempre que a tela for reaberta
  useFocusEffect(
    useCallback(() => {
      async function carregarVoos() {
        try {
          const carrinhoSalvo = await AsyncStorage.getItem('@carrinho_voos');
          const dados: Voo[] = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
          setVoosCarrinho(dados);
        } catch (error) {
          console.error("Erro ao carregar o carrinho:", error);
        }
      }

      carregarVoos();
    }, [])
  );

  // ✅ Remove um voo do carrinho
  const removerVoo = async (index: number) => {
    const novaLista = [...voosCarrinho];
    novaLista.splice(index, 1);
    setVoosCarrinho(novaLista);
    await AsyncStorage.setItem('@carrinho_voos', JSON.stringify(novaLista));
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.content}>
        <Text style={styles.title}>Voos no Carrinho</Text>

        {voosCarrinho.length === 0 ? (
          <Text style={{ color: '#666' }}>Nenhum voo adicionado ainda.</Text>
        ) : (
          <FlatList
            data={voosCarrinho}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.vooItem}>
                <View style={styles.vooRow}>
                  <Text style={styles.vooTitle}>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              Alert.alert("Viagem Confirmada!", "Você realizou sua viagem com sucesso.")
            }
          >
            <Text style={styles.removeButtonText}>Realizar Viagem</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ✅ Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vooItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vooRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vooTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  removeButton: {
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
  },
});
