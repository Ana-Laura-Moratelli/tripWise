import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Itinerario {
  nomeLocal: string;
  tipo: string;
  localizacao: string;
  valor: string;
  descricao?: string;
  dia: string;
  originalIndex?: number;
}


function parseDate(dateStr: string): Date {
  const [dataPart, timePart] = dateStr.split(' ');
  const [day, month, year] = dataPart.split('/');
  const hours = timePart ? timePart.split(':')[0] : '00';
  const minutes = timePart ? timePart.split(':')[1] : '00';
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
  return new Date(isoString);
}

export default function ItineraryListScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    navigation.setOptions({
      title: 'Cronograma',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);

  const { id } = useLocalSearchParams(); // id da viagem
  const router = useRouter();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Itinerario>>({});


  async function fetchItinerarios() {
    try {
      const response = await fetch('http://192.168.15.9:5000/api/travel');
      if (!response.ok) throw new Error("Erro ao buscar dados");

      const data = await response.json();
      const viagem = data.find((item: any) => item.id === id);
      if (viagem) {
        if (!viagem.itinerarios || viagem.itinerarios.length === 0) {
          setItinerarios([]);
        } else {
          const itinerariosComIndex: Itinerario[] = viagem.itinerarios.map(
            (item: Itinerario, idx: number) => ({ ...item, originalIndex: idx })
          );
          const sortedItinerarios = itinerariosComIndex.sort((a, b) => {
            return parseDate(a.dia).getTime() - parseDate(b.dia).getTime();
          });
          setItinerarios(sortedItinerarios);
        }
      } else {
        Alert.alert("Erro", "Viagem não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar itinerários:", error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchItinerarios();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchItinerarios();
    }, [])
  );

  async function deleteItinerary(itemIndex: number, originalIndex?: number) {
    const indexToUse = originalIndex !== undefined ? originalIndex : itemIndex;
    try {
      const response = await fetch(`http://192.168.15.9:5000/api/travel/${id}/itinerary/${indexToUse}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Erro ao deletar item");

      Alert.alert("Sucesso", "Item deletado com sucesso!");
      fetchItinerarios();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      Alert.alert("Erro", "Não foi possível deletar o item.");
    }
  }

  async function updateItinerary(itemIndex: number, originalIndex?: number) {
    const indexToUse = originalIndex !== undefined ? originalIndex : itemIndex;
    try {
      const { originalIndex, ...dadosParaAtualizar } = editingItem;
      const response = await fetch(`http://192.168.15.9:5000/api/travel/${id}/itinerary/${indexToUse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaAtualizar),
      });
      if (!response.ok) throw new Error("Erro ao atualizar o item");

      Alert.alert("Sucesso", "Item atualizado com sucesso!");
      setEditingIndex(null);
      setEditingItem({});
      fetchItinerarios();
    } catch (error: any) {
      console.error("Erro ao atualizar item:", error);
      Alert.alert("Erro", error.message || "Não foi possível atualizar o item.");
    }
  }


  function renderItem({ item, index }: { item: Itinerario; index: number }) {
    const origIndex = item.originalIndex;
    if (editingIndex === index) {
      return (
        <View style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            value={editingItem.nomeLocal ?? item.nomeLocal}
            onChangeText={(text) => setEditingItem({ ...editingItem, nomeLocal: text })}
            placeholder="Nome do local"
          />
          <TextInput
            style={styles.input}
            value={editingItem.tipo ?? item.tipo}
            onChangeText={(text) => setEditingItem({ ...editingItem, tipo: text })}
            placeholder="Tipo de atividade"
          />
          <TextInput
            style={styles.input}
            value={editingItem.localizacao ?? item.localizacao}
            onChangeText={(text) => setEditingItem({ ...editingItem, localizacao: text })}
            placeholder="Localização"
          />
          {/* Input para Valor com máscara de dinheiro */}
          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$',
              suffixUnit: ''
            }}
            style={styles.input}
            value={editingItem.valor ?? item.valor}
            onChangeText={(text) => setEditingItem({ ...editingItem, valor: text })}
            placeholder="Valor"
          />
          {/* Input para Data com máscara */}
          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY HH:mm' }}
            style={styles.input}
            value={editingItem.dia ?? item.dia}
            onChangeText={(text) => setEditingItem({ ...editingItem, dia: text })}
            placeholder="Dia (DD/MM/YYYY [HH:mm])"
          />
          <TextInput
            style={styles.input}
            value={editingItem.descricao ?? item.descricao}
            onChangeText={(text) => setEditingItem({ ...editingItem, descricao: text })}
            placeholder="Descrição (opcional)"
          />
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={() => updateItinerary(index, origIndex)}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelEditButton} onPress={() => { setEditingIndex(null); setEditingItem({}); }}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>Nome: {item.nomeLocal}</Text>
          <Text style={styles.itemText}>Tipo: {item.tipo}</Text>
          <Text style={styles.itemText}>Local: {item.localizacao}</Text>
          <Text style={styles.itemText}>Valor: {item.valor}</Text>
          <Text style={styles.itemText}>Dia: {item.dia}</Text>
          {item.descricao ? (
            <Text style={styles.itemText}>Descrição: {item.descricao}</Text>
          ) : null}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => { setEditingIndex(index); setEditingItem({ ...item }); }}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteItinerary(index, origIndex)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={itinerarios}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum item encontrado.</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.cronogramaButton}
        onPress={() => router.push({ pathname: "/modal/createItineraryModal", params: { id } })}
      >
        <Text style={styles.cronogramaButtonText}>Criar Cronograma</Text>
      </TouchableOpacity>
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
