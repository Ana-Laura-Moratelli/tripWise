import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { differenceInDays, parseISO, isBefore } from 'date-fns';
import MaskInput, { Masks } from 'react-native-mask-input';
import { api } from '../../src/services/api';
import { Hotel } from '../../src/types/hotel';
import Constants from 'expo-constants';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';
import { Stack } from "expo-router";

export default function HotelSearch() {
  const [cidade, setCidade] = useState('');
  const [checkinMask, setCheckinMask] = useState('');
  const [checkoutMask, setCheckoutMask] = useState('');
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

  function formatarParaISO(data: string) {
    const partes = data.split('/');
    if (partes.length === 3) {
      const [diaStr, mesStr, anoStr] = partes;
      const dia = parseInt(diaStr, 10);
      const mes = parseInt(mesStr, 10);
      const ano = parseInt(anoStr, 10);

      if (isNaN(mes) || mes < 1 || mes > 12) {
        throw new Error("Mês inválido. Use valores de 01 a 12.");
      }

      const maxDiasPorMes = [31, (ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (isNaN(dia) || dia < 1 || dia > maxDiasPorMes[mes - 1]) {
        throw new Error("Dia inválido para o mês informado.");
      }

      const mm = mesStr.padStart(2, '0');
      const dd = diaStr.padStart(2, '0');
      return `${anoStr}-${mm}-${dd}`;
    }
    return data;
  }

  function validarCampos(checkin: string, checkout: string) {
    if (!cidade) throw new Error("Informe a cidade para busca.");
    if (!/\d{4}-\d{2}-\d{2}/.test(checkin)) throw new Error("Data de entrada inválida.");
    if (!/\d{4}-\d{2}-\d{2}/.test(checkout)) throw new Error("Data de saída inválida.");
  }

  async function converterCoordenadasParaEndereco(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return 'Endereço não encontrado';
      }
    } catch (error) {
      return 'Endereço não disponível';
    }
  }

  async function buscarHoteis() {
    setLoading(true);
    try {
      const checkin = formatarParaISO(checkinMask);
      const checkout = formatarParaISO(checkoutMask);

      validarCampos(checkin, checkout);

      const now = new Date();
      const hojeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const dataCheckin = parseISO(checkin);
      const dataCheckout = parseISO(checkout);

      if (isBefore(dataCheckin, hojeStart)) {
        throw new Error("A data de ida não pode ser anterior ao dia de hoje.");
      }

      if (isBefore(dataCheckout, hojeStart)) {
        throw new Error("A data de check-out não pode ser anterior ao dia de hoje.");
      }

      const diasHospedagem = differenceInDays(parseISO(checkout), parseISO(checkin));
      if (diasHospedagem <= 0) throw new Error("A data de check-out deve ser após a de check-in.");

      const response = await api.get('/api/hotels', {
        params: {
          cidade: cidade,
          checkin: checkin,
          checkout: checkout,
        }
      });

      const resultados = response.data.properties || [];

      if (!resultados.length) {
        Alert.alert("Nenhum hotel encontrado.");
        setHoteis([]);
        return;
      }

      const BRL_EXCHANGE_RATE = 5.71;

      const formatados: Hotel[] = await Promise.all(
        resultados.map(async (hotel: any) => {
          const precoUSD = Number(hotel?.rate_per_night?.extracted_lowest || 0);
          const totalUSD = precoUSD * diasHospedagem;

          const precoBRL = precoUSD * BRL_EXCHANGE_RATE;
          const totalBRL = totalUSD * BRL_EXCHANGE_RATE;

          const formatarReal = (valor: number) =>
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

          let endereco = 'Localização não disponível';

          const latitude = hotel.gps_coordinates?.latitude?.toString() ?? '';
          const longitude = hotel.gps_coordinates?.longitude?.toString() ?? '';

          if (hotel.gps_coordinates) {
            endereco = await converterCoordenadasParaEndereco(
              hotel.gps_coordinates.latitude,
              hotel.gps_coordinates.longitude
            );
          }


          return {
            name: hotel.name ?? 'Nome não disponível',
            price: precoUSD ? formatarReal(precoBRL) : 'Preço não informado',
            rating: hotel.overall_rating?.toString() ?? 'Sem avaliação',
            address: endereco,
            reviews: hotel.reviews?.toString() ?? '0 avaliações',
            total: totalUSD ? formatarReal(totalBRL) : 'Total não disponível',
            latitude,
            longitude,
          };
        })
      );

      setHoteis(formatados);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao buscar hotéis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          title: "Hotéis",
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Destino"
        value={cidade}
        onChangeText={setCidade}
        placeholderTextColor={colors.mediumGray}
      />

      <MaskInput
        mask={Masks.DATE_DDMMYYYY}
        style={styles.input}
        placeholder="Check-in"
        value={checkinMask}
        onChangeText={setCheckinMask}
        placeholderTextColor={colors.mediumGray}
      />

      <MaskInput
        mask={Masks.DATE_DDMMYYYY}
        style={styles.input}
        placeholder="Check-out"
        value={checkoutMask}
        onChangeText={setCheckoutMask}
        placeholderTextColor={colors.mediumGray}
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={buscarHoteis}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      <View style={styles.content}>
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
                    pathname: "/modal/hotel/infoHotel",
                    params: {
                      name: item.name,
                      price: item.price,
                      address: item.address,
                      rating: item.rating,
                      reviews: item.reviews,
                      checkin: checkinMask,
                      checkout: checkoutMask,
                      total: item.total,
                      latitude: item.latitude?.toString() ?? '',
                      longitude: item.longitude?.toString() ?? '',
                    },
                  })
                }
              >
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardInfo}>{item.address}</Text>
                  <Text style={styles.cardInfo}>Avaliação: {item.rating} ({item.reviews})</Text>
                  <Text style={styles.cardInfo}>Diária: {item.price}</Text>
                  <Text style={styles.cardInfoPrimary}>Total: {item.total}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
