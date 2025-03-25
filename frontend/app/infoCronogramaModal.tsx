// app/ItineraryList.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

interface Itinerario {
  nomeLocal: string;
  tipo: string;
  localizacao: string;
  horario: string;
  descricao?: string;
  dia: number;
  // Se possível, adicione um id único aqui para identificar o item
}

// Função auxiliar para converter o horário em minutos
// Se o horário estiver em formato "HH:MM" ou "HH:MM - HH:MM", utiliza o primeiro valor.
function parseHorarios(horario: string): number {
  const timePart = horario.split('-')[0].trim();
  const [hours, minutes] = timePart.split(':').map(Number);
  return hours * 60 + minutes;
}

export default function ItineraryListScreen() {
  const { id } = useLocalSearchParams(); // id da viagem
  const router = useRouter();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar a viagem pelo id e obter os itinerários
  async function fetchItinerarios() {
    try {
      const response = await fetch('http://192.168.15.9:5000/api/travel');
      if (!response.ok) throw new Error("Erro ao buscar dados");

      const data = await response.json();
      // Filtra a viagem com o id informado
      const viagem = data.find((item: any) => item.id === id);
      if (viagem) {
        // Ordena os itinerários por dia e, para o mesmo dia, pela hora de início
        const sortedItinerarios = (viagem.itinerarios || []).sort((a: Itinerario, b: Itinerario) => {
          if (a.dia !== b.dia) return a.dia - b.dia;
          return parseHorarios(a.horario) - parseHorarios(b.horario);
        });
        setItinerarios(sortedItinerarios);
      } else {
        Alert.alert("Erro", "Viagem não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar itinerários:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  // Executa a busca inicial quando o componente monta
  useEffect(() => {
    fetchItinerarios();
  }, []);

  // Atualiza os itinerários sempre que a tela ficar em foco (ex: após cadastrar um item)
  useFocusEffect(
    React.useCallback(() => {
      fetchItinerarios();
    }, [])
  );

  // Função para deletar um item do cronograma usando seu índice (ou id, se você implementar)
  async function deleteItinerary(itemIndex: number) {
    try {
      const response = await fetch(`http://192.168.15.9:5000/api/travel/${id}/itinerary/${itemIndex}`, {
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

  // Renderiza cada item do cronograma
  function renderItem({ item, index }: { item: Itinerario; index: number }) {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Nome: {item.nomeLocal}</Text>
        <Text style={styles.itemText}>Tipo: {item.tipo}</Text>
        <Text style={styles.itemText}>Local: {item.localizacao}</Text>
        <Text style={styles.itemText}>Horário: {item.horario}</Text>
        <Text style={styles.itemText}>Dia: {item.dia}</Text>
        {item.descricao ? (
          <Text style={styles.itemText}>Descrição: {item.descricao}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItinerary(index)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cronograma</Text>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={itinerarios}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>Nenhum item encontrado.</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.cronogramaButton}
        onPress={() => router.push({ pathname: "/modalCronograma", params: { id } })}
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
    backgroundColor: '#FFF'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  itemContainer: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 10
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5
  },
  deleteButton: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  cronogramaButton: {
    backgroundColor: "#5B2FD4",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  cronogramaButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
