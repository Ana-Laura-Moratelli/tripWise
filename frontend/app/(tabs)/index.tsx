import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ImageBackground,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<'hoteis' | 'voos'>('hoteis');
  const router = useRouter();

  return (
    <View style={styles.container}>
     

      {/* Conteúdo principal */}
      <View style={styles.loginContainer}>
        {/* Campos de busca */}
        <View style={styles.inputContainer}>
        <TextInput 
            placeholder="Ponto de Origem" 
            style={styles.input} 
            placeholderTextColor="#888"
          />
          <TextInput 
            placeholder="Destino" 
            style={styles.input} 
            placeholderTextColor="#888"
          />
          <TextInput 
            placeholder="Data de ida" 
            style={styles.input} 
            placeholderTextColor="#888"
          />
          <TextInput 
            placeholder="Data de volta" 
            style={styles.input} 
            placeholderTextColor="#888"
          />
        </View>

        <Text style={styles.noteText}>
          Selecione uma data local que irá aparecer os hotéis disponíveis
        </Text>

        {/* Tabs: Hotéis e Voos */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={activeTab === 'hoteis' ? styles.activeTab : styles.inactiveTab}
            onPress={() => setActiveTab('hoteis')}
          >
            <Text 
              style={
                activeTab === 'hoteis' ? styles.activeTabText : styles.inactiveTabText
              }
            >
              Hotéis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={activeTab === 'voos' ? styles.activeTab : styles.inactiveTab}
            onPress={() => setActiveTab('voos')}
          >
            <Text 
              style={
                activeTab === 'voos' ? styles.activeTabText : styles.inactiveTabText
              }
            >
              Voos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo condicional baseado na tab ativa */}
        {activeTab === 'hoteis' ? (
          <ScrollView style={styles.hotelsContainer}>
            {/* Exemplo de item de hotel */}
            <TouchableOpacity 
              style={styles.hotelItem}
              onPress={() => router.push("/infoHotelModal")} // outro hotel
            >
           
              <View style={styles.hotelRow}>
                <Text style={styles.hotelName}>Hotel 1</Text>
                <Text style={styles.hotelRating}>4.87 (71)</Text>
              </View>
              <Text style={styles.hotelDistance}>1,669 kilometers</Text>
              <Text style={styles.hotelDate}>Jul 2 - Jul 7</Text>
              <Text style={styles.hotelPrice}>$360 night</Text>
           
            </TouchableOpacity>

            <View style={styles.hotelItem}>
              <View style={styles.hotelRow}>
                <Text style={styles.hotelName}>Kintamani, Indonesia</Text>
                <Text style={styles.hotelRating}>4.91 (89)</Text>
              </View>
              <Text style={styles.hotelDistance}>971 kilometers</Text>
              <Text style={styles.hotelDate}>Jul 6 - 11</Text>
              <Text style={styles.hotelPrice}>$268 night</Text>
            </View>

            {/* Adicione outros itens de hotel conforme necessário */}
          </ScrollView>
        ) : (
          <View style={styles.hotelsContainer}>
            <Text style={{ color: '#333' }}>
              Seção de voos em breve...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  // Cabeçalho com imagem de fundo
  headerBackground: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Conteúdo principal
  loginContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  // Campos de busca
  inputContainer: {
    width: '100%',
    marginVertical: 16,
  },
  input: {
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: 'black',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Tabs para seleção entre Hotéis e Voos
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 5,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#EEE',
    borderRadius: 40,
    padding: 16,
    alignItems: 'center',
  },
  inactiveTabText: {
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#888',
  },
  // Lista de Hotéis e Voos
  hotelsContainer: {
    width: '100%',
    // Caso deseje limitar a altura da rolagem, adicione: height: 300,
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
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
