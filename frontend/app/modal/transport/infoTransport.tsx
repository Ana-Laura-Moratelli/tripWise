import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../../src/services/api';
import { TextInputMask } from 'react-native-masked-text';
import { Transport } from '../../../src/types/transport';
import styles from '@/src/styles/global';

export default function InfoTransport() {
  const { id } = useLocalSearchParams();
  const [transportes, setTransportes] = useState<Transport[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Transport>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  const tipos = [
    { label: 'Aluguel de Carro', value: 'aluguel' },
    { label: 'Transferência', value: 'transferencia' },
    { label: 'Transporte Público', value: 'publico' },
  ];

  async function buscarTransportes() {
    try {
      const response = await api.get(`/api/transport/${id}`);
      setTransportes(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar transportes.');
    } finally {
      setLoading(false);
    }
  }

  async function atualizarTransporte(transportId: string) {
    try {
      if (!editingItem.tipoTransporte || !editingItem.empresa || !editingItem.dataHoraPartida || !editingItem.dataHoraChegada || !editingItem.valor) {
        Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
        return;
      }

      await api.put(`/api/transport/${transportId}`, editingItem);
      Alert.alert('Sucesso', 'Transporte atualizado com sucesso.');
      setEditingIndex(null);
      setEditingItem({});
      buscarTransportes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o transporte.');
    }
  }

  async function excluirTransporte(transportId: string) {
    try {
      await api.delete(`/api/transport/${transportId}`);
      setTransportes((prev) => prev.filter((item) => item.id !== transportId));
      Alert.alert('Sucesso', 'Transporte excluído com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao excluir transporte.');
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Transportes',
      headerBackTitle: 'Voltar',
    });
    buscarTransportes();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      buscarTransportes();
    }, [id])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.container}>
          <Text style={styles.loading}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={transportes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <View style={styles.cardEditing}>
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Empresa</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Empresa"
                    value={editingItem.empresa ?? item.empresa}
                    onChangeText={(text) => setEditingItem({ ...editingItem, empresa: text })}
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Data/Hora Partida</Text></Text>
                  <TextInputMask
                    type={'datetime'}
                    options={{ format: 'DD/MM/YYYY HH:mm' }}
                    style={styles.input}
                    placeholder="Data/Hora Partida"
                    value={editingItem.dataHoraPartida ?? item.dataHoraPartida}
                    onChangeText={(text) => setEditingItem({ ...editingItem, dataHoraPartida: text })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Data/Hora Chegada</Text></Text>
                  <TextInputMask
                    type={'datetime'}
                    options={{ format: 'DD/MM/YYYY HH:mm' }}
                    style={styles.input}
                    placeholder="Data/Hora Chegada"
                    value={editingItem.dataHoraChegada ?? item.dataHoraChegada}
                    onChangeText={(text) => setEditingItem({ ...editingItem, dataHoraChegada: text })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Valor</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Valor"
                    value={editingItem.valor ?? item.valor}
                    onChangeText={(text) => setEditingItem({ ...editingItem, valor: text })}
                    keyboardType="numeric"
                  />

                  {editingItem.tipoTransporte === 'aluguel' && (
                    <>
                      <Text style={styles.cardLabel}><Text style={styles.bold}>Modelo do Veículo</Text></Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Modelo do Veículo"
                        value={editingItem.modeloVeiculo ?? item.modeloVeiculo}
                        onChangeText={(text) => setEditingItem({ ...editingItem, modeloVeiculo: text })}
                      />
                      <Text style={styles.cardLabel}><Text style={styles.bold}>Placa do Veículo</Text></Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Placa do Veículo"
                        value={editingItem.placaVeiculo ?? item.placaVeiculo}
                        onChangeText={(text) => setEditingItem({ ...editingItem, placaVeiculo: text })}
                      />
                    </>
                  )}

                  {editingItem.tipoTransporte === 'publico' && (
                    <>
                      <Text style={styles.cardLabel}><Text style={styles.bold}>Número da Linha</Text></Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Número da Linha"
                        value={editingItem.numeroLinha ?? item.numeroLinha}
                        onChangeText={(text) => setEditingItem({ ...editingItem, numeroLinha: text })}
                        keyboardType="numeric"
                      />
                    </>
                  )}
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Observações</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Observações"
                    value={editingItem.observacoes ?? item.observacoes}
                    onChangeText={(text) => setEditingItem({ ...editingItem, observacoes: text })}
                  />

                  <View style={styles.flexRow}>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity style={styles.buttonThird} onPress={() => atualizarTransporte(item.id)}>
                        <Text style={styles.buttonText}>Salvar</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        style={styles.buttonFourth}
                        onPress={() => {
                          setEditingIndex(null);
                          setEditingItem({});
                        }}
                      >
                        <Text style={styles.buttonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }

            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {tipos.find((t) => t.value === item.tipoTransporte)?.label}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Empresa:</Text> {item.empresa}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Partida:</Text> {item.dataHoraPartida}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Chegada:</Text> {item.dataHoraChegada}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Valor:</Text> R$ {item.valor}
                </Text>
                {item.modeloVeiculo && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Modelo:</Text> {item.modeloVeiculo}
                  </Text>
                )}
                {item.placaVeiculo && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Placa:</Text> {item.placaVeiculo}
                  </Text>
                )}
                {item.numeroLinha && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Linha:</Text> {item.numeroLinha}
                  </Text>
                )}
                {item.observacoes && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Obs:</Text> {item.observacoes}
                  </Text>
                )}
                <View style={styles.flexRow}>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      style={styles.buttonSecondary}
                      onPress={() => {
                        setEditingIndex(index);
                        setEditingItem({ ...item });
                      }}
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity style={styles.buttonFourth} onPress={() => excluirTransporte(item.id)}>
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.noitens}>Nenhum transporte cadastrado.</Text>}
        />
      )}
      {!loading && editingIndex === null && (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push({ pathname: '/modal/transport/createTransport', params: { id } })}
        >
          <Text style={styles.buttonText}>Cadastrar Transporte</Text>
        </TouchableOpacity>
      )}
    </View>
  );

}

