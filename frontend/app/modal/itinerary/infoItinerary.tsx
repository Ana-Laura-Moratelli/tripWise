import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../../src/services/api';
import { Itinerario } from '../../../src/types/itinerary';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

function parseDate(dateStr: string): Date {
  const [dataPart, timePart] = dateStr.split(' ');
  const [day, month, year] = dataPart.split('/');
  const hours = timePart ? timePart.split(':')[0] : '00';
  const minutes = timePart ? timePart.split(':')[1] : '00';
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
  return new Date(isoString);
}

export default function infoItinerary() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    navigation.setOptions({
      title: 'Cronograma',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Itinerario>>({});

  function validarDataAtividade(dataStr: string): string | null {
    if (!dataStr || dataStr.length < 10) return null;

    const partes = dataStr.trim().split(' ');
    const [dia, mes, ano] = partes[0].split('/');
    if (!dia || !mes || !ano) return null;

    const hora = partes[1] || '00:00';
    const [h, m] = hora.split(':');
    if (isNaN(Number(h)) || isNaN(Number(m))) return null;

    const dataISO = `${ano}-${mes}-${dia}T${hora}:00`;
    const dataSelecionada = new Date(dataISO);

    if (isNaN(dataSelecionada.getTime())) return null;
    if (dataSelecionada < new Date()) return null;

    return `${dia}/${mes}/${ano}` + (partes[1] ? ` ${partes[1]}` : '');
  }

  async function fetchItinerarios() {
    try {
      const response = await api.get('/api/trip');
      const data = response.data;
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
      await api.delete(`/api/trip/${id}/itinerary/${indexToUse}`);
      Alert.alert("Sucesso", "Item deletado com sucesso!");
      fetchItinerarios();
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.error || "Não foi possível deletar o item.");
    }
  }

  async function updateItinerary(itemIndex: number, originalIndex?: number) {
    const indexToUse = originalIndex !== undefined ? originalIndex : itemIndex;
    try {
      const { originalIndex, ...dadosParaAtualizar } = editingItem;

      if (!dadosParaAtualizar.nomeLocal || !dadosParaAtualizar.tipo || !dadosParaAtualizar.dia) {
        Alert.alert("Preencha todos os campos obrigatórios.");
        return;
      }

      const dataValidada = validarDataAtividade(dadosParaAtualizar.dia || '');
      if (!dataValidada) {
        Alert.alert("Data inválida", "A data não pode ser anterior ao momento atual e deve estar no formato (dd/mm/aaaa hh:mm).");
        return;
      }

      dadosParaAtualizar.dia = dataValidada;

      await api.put(`/api/trip/${id}/itinerary/${indexToUse}`, dadosParaAtualizar, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert("Sucesso", "Item atualizado com sucesso!");
      setEditingIndex(null);
      setEditingItem({});
      fetchItinerarios();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível atualizar o item.");
    }
  }

  function renderEndereco(endereco?: any): string {
    if (!endereco) return '';
    return [endereco.rua, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado]
      .filter(Boolean).join(', ');
  }

  function renderItem({ item, index }: { item: Itinerario; index: number }) {
    const origIndex = item.originalIndex;
    if (editingIndex === index) {
      return (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={editingItem.nomeLocal ?? item.nomeLocal}
            onChangeText={(text) => setEditingItem({ ...editingItem, nomeLocal: text })}
            placeholder="Nome do local"
            placeholderTextColor={colors.mediumGray}
          />
          <TextInput
            style={styles.input}
            value={editingItem.tipo ?? item.tipo}
            onChangeText={(text) => setEditingItem({ ...editingItem, tipo: text })}
            placeholder="Tipo de atividade"
            placeholderTextColor={colors.mediumGray}
          />
          <TextInputMask
            type={'money'}
            options={{ precision: 2, separator: ',', delimiter: '.', unit: 'R$', suffixUnit: '' }}
            style={styles.input}
            value={editingItem.valor ?? item.valor}
            onChangeText={(text) => setEditingItem({ ...editingItem, valor: text })}
            placeholder="Valor"
            placeholderTextColor={colors.mediumGray}
          />
          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY HH:mm' }}
            style={styles.input}
            value={editingItem.dia ?? item.dia}
            onChangeText={(text) => setEditingItem({ ...editingItem, dia: text })}
            placeholder="Dia (dd/mm/aaaa hh:mm)"
            placeholderTextColor={colors.mediumGray}
          />
          <TextInput
            style={styles.input}
            value={editingItem.descricao ?? item.descricao}
            onChangeText={(text) => setEditingItem({ ...editingItem, descricao: text })}
            placeholder="Descrição (opcional)"
            placeholderTextColor={colors.mediumGray}
          />
          <View style={styles.flexRow}>
          <View style={{ flex: 1 }}>

            <TouchableOpacity style={styles.buttonThird} onPress={() => updateItinerary(index, origIndex)}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>

            <TouchableOpacity style={styles.buttonFourth} onPress={() => { setEditingIndex(null); setEditingItem({}); }}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            </View>

          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.card}>
          <Text style={styles.cardInfo}><Text style={styles.bold}>Nome:</Text> {item.nomeLocal}</Text>
          <Text style={styles.cardInfo}><Text style={styles.bold}>Tipo:</Text> {item.tipo}</Text>
          <Text style={styles.cardInfo}><Text style={styles.bold}>Valor:</Text> {item.valor}</Text>
          <Text style={styles.cardInfo}><Text style={styles.bold}>Dia:</Text> {item.dia}</Text>
          {item.descricao ? <Text style={styles.cardInfo}><Text style={styles.bold}>Descrição:</Text> {item.descricao}</Text> : null}
          {item.endereco && <Text style={styles.cardInfo}><Text style={styles.bold}>Endereço:</Text> {renderEndereco(item.endereco)}</Text>}
          <View style={styles.flexRow}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => { setEditingIndex(index); setEditingItem({ ...item }); }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.buttonFourth}
                onPress={() => deleteItinerary(index, origIndex)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>
      ) : (
        <FlatList
          data={itinerarios}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noitens}>Nenhum item encontrado.</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push({ pathname: "/modal/itinerary/createItinerary", params: { id } })}
      >
        <Text style={styles.buttonText}>Criar Cronograma</Text>
      </TouchableOpacity>
    </View>
  );
}

