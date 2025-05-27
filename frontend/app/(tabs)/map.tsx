import React, { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, Platform, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../src/services/api';
import Constants from 'expo-constants';
import styles from '@/src/styles/map';
import AsyncStorage from '@react-native-async-storage/async-storage';


/*
import { Itinerario } from '../../src/types/itinerary';
import { Hotel } from '../../src/types/hotel';
*/

interface Hotel {
  name: string;
  latitude: string;
  longitude: string;
}

interface Itinerario {
  nomeLocal: string;
  endereco: {
    latitude: string;
    longitude: string;
  };
}

export default function MapModal() {
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rotaCoords, setRotaCoords] = useState<any[]>([]);
  const [tempo, setTempo] = useState('');
  const [destino, setDestino] = useState<{ latitude: string; longitude: string } | null>(null);
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey;


  async function obterLocalizacao() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão negada", "Ative o GPS para usar o mapa.");
      return;
    }

    const local = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: local.coords.latitude,
      longitude: local.coords.longitude,
    });
  }

 async function carregarDados() {
  try {
    const userId = await AsyncStorage.getItem("@user_id");
    if (!userId) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    const response = await api.get('/api/trip', {
      params: { userId }
    });

    const viagens = response.data;
    const todosHoteis: Hotel[] = [];
    const todosItinerarios: Itinerario[] = [];

    viagens.forEach((viagem: any) => {
      viagem.hoteis?.forEach((hotel: any) => {
        if (hotel.latitude && hotel.longitude) {
          todosHoteis.push({
            name: hotel.name,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          });
        }
      });

      viagem.itinerarios?.forEach((item: any) => {
        if (item.endereco?.latitude && item.endereco?.longitude) {
          todosItinerarios.push({
            nomeLocal: item.nomeLocal,
            endereco: {
              latitude: item.endereco.latitude,
              longitude: item.endereco.longitude,
            },
          });
        }
      });
    });

    setHoteis(todosHoteis);
    setItinerarios(todosItinerarios);
  } catch (error) {
    Alert.alert("Erro", "Erro ao carregar dados do mapa.");
  } finally {
    setLoading(false);
  }
}

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      obterLocalizacao();
      carregarDados();
      setRotaCoords([]);
      setTempo('');
    }, [])
  );  


  async function calcularRota(destLat: string, destLng: string) {
    try {
      if (!location) return;
      

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destLat},${destLng}&key=${apiKey}`
      );

      const data = await response.json();
      if (data.routes.length) {
        const pontos = decodePolyline(data.routes[0].overview_polyline.points);
        const tempoTexto = data.routes[0].legs[0].duration.text;

        setRotaCoords(pontos);
        setTempo(tempoTexto);
        setDestino({ latitude: String(destLat), longitude: String(destLng) });
      } else {
        Alert.alert('Erro', 'Não foi possível traçar a rota.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível traçar a rota.');
    }
  }

  function iniciarRotaExterna() {
    if (!location || !destino) return;
    const url = Platform.select({
      ios: `http://maps.apple.com/?saddr=${location.latitude},${location.longitude}&daddr=${destino.latitude},${destino.longitude}`,
      android: `http://maps.google.com/maps?saddr=${location.latitude},${location.longitude}&daddr=${destino.latitude},${destino.longitude}`,
    });
    Linking.openURL(url as string);
  }

  function decodePolyline(encoded: string) {
    let points: any[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  if (loading || !location) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5B2FD4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {hoteis.map((hotel, index) => (
          <Marker
            key={`hotel-${index}`}
            coordinate={{
              latitude: parseFloat(hotel.latitude),
              longitude: parseFloat(hotel.longitude),
            }}
            title={hotel.name}
            pinColor="purple"
            onCalloutPress={() => calcularRota(hotel.latitude, hotel.longitude)}
          />
        ))}

        {itinerarios.map((item, index) => (
          <Marker
            key={`itinerario-${index}`}
            coordinate={{
              latitude: parseFloat(item.endereco.latitude),
              longitude: parseFloat(item.endereco.longitude),
            }}
            title={item.nomeLocal}
            description="Itinerário"
            pinColor="purple"
            onCalloutPress={() => calcularRota(String(item.endereco.latitude), String(item.endereco.longitude))}
          />
        ))}

        {rotaCoords.length > 0 && (
          <Polyline
            coordinates={rotaCoords}
            strokeWidth={5}
            strokeColor="#5B2FD4"
          />
        )}
      </MapView>

      {tempo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Tempo estimado: {tempo}</Text>
          <TouchableOpacity style={styles.button} onPress={iniciarRotaExterna}>
            <Text style={styles.buttonText}>Iniciar Rota</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
