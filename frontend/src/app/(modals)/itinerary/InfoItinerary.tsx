import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import MaskInput, { Masks } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '@/services/api';
import { Itinerario } from '@/types/itinerary';
import styles from '@/app/styles/global';
import { colors } from '@/app/styles/global';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [editingItem, setEditingItem] = useState<Partial<Itinerario> & {
    endereco?: {
      cep?: string;
      rua?: string;
      numero?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    }
  }>({});

  async function buscarEnderecoPorCEP(cepDigitado: string) {
    const cepNum = cepDigitado.replace(/\D/g, '');
    setEditingItem(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: cepDigitado }
    }));
    if (cepNum.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEditingItem(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }
        }));
      }
    } catch {
      console.warn('Via CEP falhou');
    }
  }

  function validarDataAtividade(dataHoraBR: string): string | null {
    if (!dataHoraBR || dataHoraBR.length < 10) return null;

    const [datePart, timePart] = dataHoraBR.trim().split(' ');
    const [d, m, y] = datePart.split('/');
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);

    if ([day, month, year].some(isNaN)) return null;
    if (month < 1 || month > 12) return null;
    const daysInMonth = [
      31,
      new Date(year, 2, 0).getDate(),
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];
    if (day < 1 || day > daysInMonth[month - 1]) return null;

    if (timePart && timePart.trim() !== '') {
      const horaValida = /^([01]?\d|2[0-3]):[0-5]\d$/.test(timePart.trim());
      if (!horaValida) return null;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y} ${timePart.trim()}`;
    }

    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  async function fetchItinerarios() {
  try {
    const userId = await AsyncStorage.getItem("@user_id");
    if (!userId) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    const response = await api.get('/api/trip', {
      params: { userId }
    });

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

      const endObj = editingItem.endereco || {};
      const fullAddress = `${endObj.rua}, ${endObj.numero}, ${endObj.bairro}, ${endObj.cidade}, ${endObj.estado}`;
      const coordsRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=AIzaSyBpmchWTIClePxMh-US0DCEe4ZzoVmA5Ms`
      );
      const coordsJson = await coordsRes.json();
      if (coordsJson.status === 'OK') {
        endObj.latitude = coordsJson.results[0].geometry.location.lat.toString();
        endObj.longitude = coordsJson.results[0].geometry.location.lng.toString();
      }
      dadosParaAtualizar.endereco = endObj;

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
        <View style={styles.cardEditing}>
          <Text style={styles.cardLabel}><Text style={styles.bold}>Nome do local</Text></Text>
          <TextInput
            style={styles.input}
            value={editingItem.nomeLocal ?? item.nomeLocal}
            onChangeText={(text) => setEditingItem({ ...editingItem, nomeLocal: text })}
            placeholder="Nome do local"
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Tipo de atividade</Text></Text>
          <TextInput
            style={styles.input}
            value={editingItem.tipo ?? item.tipo}
            onChangeText={(text) => setEditingItem({ ...editingItem, tipo: text })}
            placeholder="Tipo de atividade"
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Valor</Text></Text>
          <MaskInput
            style={styles.input}
            value={editingItem.valor ?? item.valor}
            onChangeText={(text) =>
              setEditingItem({ ...editingItem, valor: text })
            }
            placeholder="Valor"
            placeholderTextColor={colors.mediumGray}
            keyboardType="numeric"
            mask={[
              'R', '$', ' ',
              /\d/, /\d/, '.',
              /\d/, /\d/, /\d/, ',',
              /\d/, /\d/
            ]}
          />

          <Text style={styles.cardLabel}>
            <Text style={styles.bold}>Dia</Text>
          </Text>

          <MaskInput
            style={styles.input}
            value={editingItem.dia ?? item.dia}
            onChangeText={(text) =>
              setEditingItem({ ...editingItem, dia: text })
            }
            placeholder="Dia (dd/mm/aaaa hh:mm)"
            placeholderTextColor={colors.mediumGray}
            keyboardType="numeric"
            mask={[
              /\d/, /\d/, '/',
              /\d/, /\d/, '/',
              /\d/, /\d/, /\d/, /\d/, ' ',
              /\d/, /\d/, ':',
              /\d/, /\d/
            ]}
          />

          <Text style={styles.cardLabel}>
            <Text style={styles.bold}>CEP</Text>
          </Text>

          <MaskInput
            style={styles.input}
            placeholder="CEP"
            value={editingItem.endereco?.cep}
            onChangeText={buscarEnderecoPorCEP}
            keyboardType="numeric"
            placeholderTextColor={colors.mediumGray}
            mask={[
              /\d/, /\d/, /\d/, /\d/, /\d/, '-',
              /\d/, /\d/, /\d/
            ]}
          />

          <Text style={styles.cardLabel}><Text style={styles.bold}>Rua</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Rua"
            value={editingItem.endereco?.rua}
            onChangeText={text => setEditingItem(prev => ({
              ...prev,
              endereco: { ...prev.endereco, rua: text }
            }))}
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Número</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Número"
            value={editingItem.endereco?.numero}
            onChangeText={text => setEditingItem(prev => ({
              ...prev,
              endereco: { ...prev.endereco, numero: text }
            }))}
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Bairro</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={editingItem.endereco?.bairro}
            onChangeText={text => setEditingItem(prev => ({
              ...prev,
              endereco: { ...prev.endereco, bairro: text }
            }))}
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Cidade</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={editingItem.endereco?.cidade}
            onChangeText={text => setEditingItem(prev => ({
              ...prev,
              endereco: { ...prev.endereco, cidade: text }
            }))}
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Estado</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Estado"
            value={editingItem.endereco?.estado}
            onChangeText={text => setEditingItem(prev => ({
              ...prev,
              endereco: { ...prev.endereco, estado: text }
            }))}
            placeholderTextColor={colors.mediumGray}
          />
          <Text style={styles.cardLabel}><Text style={styles.bold}>Descrição</Text></Text>
          <TextInput
            style={styles.input}
            value={editingItem.descricao ?? item.descricao}
            onChangeText={(text) => setEditingItem({ ...editingItem, descricao: text })}
            placeholder="Descrição"
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
      {!loading && editingIndex === null && (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push({ pathname: "/(modals)/itinerary/CreateItinerary", params: { id } })}
        >
          <Text style={styles.buttonText}>Criar Cronograma</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

