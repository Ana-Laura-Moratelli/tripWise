import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';

interface Documento {
  tipo: string;
  numero: string;
  validade: string;
  observacoes?: string;
}

export default function InfoDocumentsModal() {
  const { id } = useLocalSearchParams();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarDocumentos() {
      try {
        const response = await api.get(`/api/trip/${id}/documentos`);
        setDocumentos(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar documentos:', error);

        Alert.alert('Erro', 'Não foi possível carregar os documentos.');
      } finally {
        setLoading(false);
      }
    }

    buscarDocumentos();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentos da Viagem</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#5B2FD4" />
      ) : documentos.length === 0 ? (
        <Text style={styles.textoVazio}>Nenhum documento cadastrado.</Text>
      ) : (
        <ScrollView>
          {documentos.map((doc, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemText}>📄 <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {doc.tipo}</Text>
              <Text style={styles.itemText}><Text style={{ fontWeight: 'bold' }}>Número:</Text> {doc.numero}</Text>
              <Text style={styles.itemText}><Text style={{ fontWeight: 'bold' }}>Validade:</Text> {doc.validade}</Text>
              {doc.observacoes && (
                <Text style={styles.itemText}><Text style={{ fontWeight: 'bold' }}>Observações:</Text> {doc.observacoes}</Text>
              )}
            </View>
          ))}
        </ScrollView>
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
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    itemContainer: {
      padding: 15,
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 20,
      marginBottom: 10,
    },
    itemText: {
      fontSize: 16,
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: 20,
      padding: 10,
      marginBottom: 8,
      fontSize: 16,
      color: '#333',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    editButton: {
      backgroundColor: '#FFA500',
      padding: 10,
      borderRadius: 40,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
    },
    editButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: '#E53935',
      padding: 10,
      borderRadius: 40,
      flex: 1,
      marginLeft: 5,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    editButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    saveButton: {
      backgroundColor: '#34A853',
      padding: 10,
      borderRadius: 40,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
    },
    cancelEditButton: {
      backgroundColor: '#E53935',
      padding: 10,
      borderRadius: 40,
      flex: 1,
      marginLeft: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    cronogramaButton: {
      backgroundColor: '#5B2FD4',
      padding: 14,
      borderRadius: 40,
      alignItems: 'center',
      marginTop: 10,
    },
    cronogramaButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    textoVazio: {
      textAlign: 'center',
      color: '#666',
    },
  });
  