import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { differenceInDays, parseISO } from 'date-fns';
import { TextInputMask } from 'react-native-masked-text';

const SERPAPI_KEY = "ad5fc2187f55ec89675e6630529688fc5de9de87bae04f185a8a42c7d6994956";
const SERPAPI_URL = "https://serpapi.com/search.json";

interface Hotel {
  name: string;
  price: string;
  rating: string;
  address: string;
  reviews: string;
  total: string;
}

export default function HotelSearchScreen() {
  const [cidade, setCidade] = useState('');
  const [checkinMask, setCheckinMask] = useState('');
  const [checkoutMask, setCheckoutMask] = useState('');
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function formatarParaISO(dataBR: string) {
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  function validarCampos(checkin: string, checkout: string) {
    if (!cidade) throw new Error("Informe a cidade para busca.");
    if (!/\d{4}-\d{2}-\d{2}/.test(checkin)) throw new Error("Data de entrada inválida (YYYY-MM-DD).");
    if (!/\d{4}-\d{2}-\d{2}/.test(checkout)) throw new Error("Data de saída inválida (YYYY-MM-DD).");
  }

  async function buscarHoteis() {
    setLoading(true);
    try {
      const checkin = formatarParaISO(checkinMask);
      const checkout = formatarParaISO(checkoutMask);

      validarCampos(checkin, checkout);

      const diasHospedagem = differenceInDays(parseISO(checkout), parseISO(checkin));
      if (diasHospedagem <= 0) throw new Error("A data de check-out deve ser após a de check-in.");

      const query = `${cidade.trim().replace(/\s+/g, "+")}`;
      const url = `${SERPAPI_URL}?engine=google_hotels&q=${query}&check_in_date=${checkin}&check_out_date=${checkout}&adults=2&currency=USD&gl=us&hl=en&api_key=${SERPAPI_KEY}`;

      const response = await axios.get(url);
      const resultados = response.data.properties || [];

      if (!resultados.length) {
        Alert.alert("Nenhum hotel encontrado.");
        setHoteis([]);
        return;
      }

      const BRL_EXCHANGE_RATE = 5.71;

      const formatados: Hotel[] = resultados.map((hotel: any) => {
        const precoUSD = Number(hotel?.rate_per_night?.extracted_lowest || 0);
        const totalUSD = precoUSD * diasHospedagem;

        const precoBRL = precoUSD * BRL_EXCHANGE_RATE;
        const totalBRL = totalUSD * BRL_EXCHANGE_RATE;

        const formatarReal = (valor: number) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

        return {
          name: hotel.name ?? 'Nome não disponível',
          price: precoUSD ? formatarReal(precoBRL) : 'Preço não informado',
          rating: hotel.overall_rating?.toString() ?? 'Sem avaliação',
          address: hotel.gps_coordinates
            ? `Lat: ${hotel.gps_coordinates.latitude}, Long: ${hotel.gps_coordinates.longitude}`
            : 'Localização não disponível',
          reviews: hotel.reviews?.toString() ?? '0 avaliações',
          total: totalUSD ? formatarReal(totalBRL) : 'Total não disponível',
        };
      });

      setHoteis(formatados);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao buscar hotéis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
       <TextInput
        style={styles.input}
        placeholder="Cidade (ex: Bali)"
        value={cidade}
        onChangeText={setCidade}
        placeholderTextColor="#888"
      />

      <TextInputMask
        type={'datetime'}
        options={{ format: 'DD/MM/YYYY' }}
        style={styles.input}
        placeholder="Check-in (dd/mm/aaaa)"
        value={checkinMask}
        onChangeText={setCheckinMask}
        placeholderTextColor="#888"
      />

      <TextInputMask
        type={'datetime'}
        options={{ format: 'DD/MM/YYYY' }}
        style={styles.input}
        placeholder="Check-out (dd/mm/aaaa)"
        value={checkoutMask}
        onChangeText={setCheckoutMask}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.searchButton} onPress={buscarHoteis}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#5B2FD4" />
      ) : (
        <FlatList
          data={hoteis}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/infoHotelModal",
                  params: {
                    name: item.name,
                    price: item.price,
                    address: item.address,
                    rating: item.rating,
                    reviews: item.reviews,
                    checkin: checkinMask,
                    checkout: checkoutMask,
                    total: item.total,
                  },
                })
              }
            >
              <View style={styles.hotelItem}>
                <Text style={styles.hotelTitle}>{item.name}</Text>
                <Text>{item.address}</Text>
                <Text>Avaliação: {item.rating} ({item.reviews})</Text>
                <Text style={styles.hotelPrice}>Diária: {item.price}</Text>
                <Text style={styles.hotelTotal}>Total: {item.total}</Text>
              </View>
            </TouchableOpacity>
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
  input: {
    padding: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    color: 'black',
  },
  searchButton: {
    backgroundColor: '#5B2FD4',
    padding: 15,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  hotelItem: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  hotelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hotelPrice: {
    marginTop: 6,
    color: '#5B2FD4',
    fontWeight: 'bold',
  },
  hotelTotal: {
    marginTop: 4,
    color: '#333',
    fontWeight: '600',
  },
});
