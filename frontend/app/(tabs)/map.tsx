import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../src/services/api';

interface Hotel {
  name: string;
  latitude: string;
  longitude: string;
}

export default function MapModal() {
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rotaCoords, setRotaCoords] = useState<any[]>([]);
  const [tempo, setTempo] = useState('');
  const [destino, setDestino] = useState<{ latitude: string; longitude: string } | null>(null);

  useEffect(() => {
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

    async function carregarHoteis() {
      try {
        const response = await api.get('/api/trip');
        const viagens = response.data;
        const todosHoteis: Hotel[] = [];

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
        });

        setHoteis(todosHoteis);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os hotéis no mapa.");
      } finally {
        setLoading(false);
      }
    }

    obterLocalizacao();
    carregarHoteis();
  }, []);

  async function calcularRota(destLat: string, destLng: string) {
    try {
      if (!location) return;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destLat},${destLng}&key=AIzaSyBpmchWTIClePxMh-US0DCEe4ZzoVmA5Ms`
      );

      const data = await response.json();
      if (data.routes.length) {
        const pontos = decodePolyline(data.routes[0].overview_polyline.points);
        const tempoTexto = data.routes[0].legs[0].duration.text;

        setRotaCoords(pontos);
        setTempo(tempoTexto);
        setDestino({ latitude: destLat, longitude: destLng });
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
       // provider={PROVIDER_GOOGLE}
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
            key={index}
            coordinate={{
              latitude: parseFloat(hotel.latitude),
              longitude: parseFloat(hotel.longitude),
            }}
            title={hotel.name}
            onCalloutPress={() => calcularRota(hotel.latitude, hotel.longitude)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  infoBox: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#5B2FD4',
    padding: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
