import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function InfoHotelModal() {
  const router = useRouter();

  // Exemplo de dados do hotel (fixos para demonstração)
  const hotelName = "Hotel 1";
  const reviews = "5.0 • 3 reviews";
  const location = "Yonkers, New York, United States";
  const price = "$32 night";
  const dates = "Feb 13 - 14";

  return (
    <View style={styles.container}>
      {/* StatusBar: no iOS, use "light" para ficar visível no espaço acima */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


      {/* Conteúdo principal do modal */}
      <View style={styles.content}>
        {/* Informações do hotel */}
        <Text style={styles.hotelName}>{hotelName}</Text>
        <Text style={styles.reviews}>{reviews}</Text>
        <Text style={styles.location}>{location}</Text>


        {/* Botões de ação */}

        {/* Área inferior com preço, datas e botões */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remover hotel</Text>
          </TouchableOpacity>
          <View style={styles.footercart}>
            <View>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.dates}>{dates}</Text>
            </View>


            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Adicionar carrinho</Text>
            </TouchableOpacity>
          </View>
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
  // Cabeçalho
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // Ajuste se quiser espaço extra no iOS
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Conteúdo principal
  content: {
    flex: 1,
    padding: 20,
  },
  hotelName: {
    fontSize: 18,
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
  // Rodapé com preço, datas e botões
  footer: {
   
    marginTop: 'auto',
    marginBottom: 12,
   
  },
  footercart: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 'auto',
    marginBottom: 12,
    borderTopWidth: 1,       // Largura da borda superior
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
