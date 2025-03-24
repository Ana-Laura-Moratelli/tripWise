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

export default function CartScreen() {
  const router = useRouter();


  return (
    <View style={styles.container}>
      {/* StatusBar: no iOS, use "light" para ficar visível no espaço acima */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


      {/* Conteúdo principal do modal */}
      <View style={styles.content}>
          <TouchableOpacity 
                     style={styles.hotelsContainer}
                     onPress={() => router.push("/infoHotelModal")} // outro hotel
                   >
                                       <View style={styles.hotelItem}>

                     <View style={styles.hotelRow}>
                       <Text style={styles.hotelName}>Hotel 1</Text>
                       <Text style={styles.hotelRating}>4.87 (71)</Text>
                     </View>
                     <Text style={styles.hotelDistance}>1,669 kilometers</Text>
                     <Text style={styles.hotelDate}>Jul 2 - Jul 7</Text>
                     <Text style={styles.hotelPrice}>$360 night</Text>
                  </View>
                   </TouchableOpacity>

        {/* Área inferior com preço, datas e botões */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Realizar Viagem</Text>
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
  hotelsContainer: {
    width: '100%',
    // Caso deseje limitar a altura da rolagem, adicione: height: 300,
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
    backgroundColor: '#5B2FD4',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Rodapé com preço, datas e botões
  footer: {
   
    marginTop: 'auto',
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


  hotelItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hotelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  hotelRating: {
    fontSize: 14,
    color: '#666',
  },
  hotelDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  hotelDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B2FD4',
    marginTop: 4,
  },
});
