import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/src/services/api';
import MaskInput, { Masks } from 'react-native-mask-input';
import { Insurance } from '@/src/types/insurance';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function InfoInsurance() {
  const { id } = useLocalSearchParams();
  const [seguros, setSeguros] = useState<Insurance[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Insurance>>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: 'Seguros',
      headerBackTitle: 'Voltar',
    });
    buscarSeguros();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      buscarSeguros();
    }, [id])
  );

  async function buscarSeguros() {
    try {
      const response = await api.get(`/api/insurance/${id}`);
      setSeguros(response.data);
    } catch {
      Alert.alert('Erro', 'Erro ao buscar seguros.');
    } finally {
      setLoading(false);
    }
  }

  async function atualizarSeguro(insuranceId: string) {
    try {
      const { seguradora, numeroApolice, dataInicio, dataFim, telefoneEmergencia } = editingItem;
      if (!seguradora || !numeroApolice || !dataInicio || !dataFim || !telefoneEmergencia) {
        Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
        return;
      }

      await api.put(`/api/insurance/${insuranceId}`, editingItem);
      Alert.alert('Sucesso', 'Seguro atualizado com sucesso.');
      setEditingIndex(null);
      setEditingItem({});
      buscarSeguros();
    } catch {
      Alert.alert('Erro', 'Erro ao atualizar seguro.');
    }
  }

  async function excluirSeguro(insuranceId: string) {
    try {
      await api.delete(`/api/insurance/${insuranceId}`);
      setSeguros((prev) => prev.filter(item => item.id !== insuranceId));
      Alert.alert('Sucesso', 'Seguro excluído com sucesso.');
    } catch {
      Alert.alert('Erro', 'Erro ao excluir seguro.');
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.container}>
          <Text style={styles.loading}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={seguros}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <View style={styles.cardEditing}>
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Seguradora</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.seguradora ?? item.seguradora}
                    onChangeText={(text) => setEditingItem({ ...editingItem, seguradora: text })}
                    placeholder="Seguradora"
                    placeholderTextColor={colors.mediumGray}
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Número da Apólice</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.numeroApolice ?? item.numeroApolice}
                    onChangeText={(text) => setEditingItem({ ...editingItem, numeroApolice: text })}
                    placeholder="Número da Apólice"
                    placeholderTextColor={colors.mediumGray}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Data Início</Text></Text>
                  <MaskInput
                    value={editingItem.dataInicio ?? item.dataInicio}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, dataInicio: text })
                    }
                    placeholder="Data Início"
                    placeholderTextColor={colors.mediumGray}
                    style={styles.input}
                    keyboardType="numeric"
                    mask={[
                      /\d/, /\d/, '/',
                      /\d/, /\d/, '/',
                      /\d/, /\d/, /\d/, /\d/
                    ]}
                  />

                  <Text style={styles.cardLabel}>
                    <Text style={styles.bold}>Data Fim</Text>
                  </Text>

                  <MaskInput
                    value={editingItem.dataFim ?? item.dataFim}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, dataFim: text })
                    }
                    placeholder="Data Fim"
                    placeholderTextColor={colors.mediumGray}
                    style={styles.input}
                    keyboardType="numeric"
                    mask={[
                      /\d/, /\d/, '/',
                      /\d/, /\d/, '/',
                      /\d/, /\d/, /\d/, /\d/
                    ]}
                  />

                  <Text style={styles.cardLabel}>
                    <Text style={styles.bold}>Telefone de Emergência</Text>
                  </Text>

                  <MaskInput
                    value={editingItem.telefoneEmergencia ?? item.telefoneEmergencia}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, telefoneEmergencia: text })
                    }
                    placeholder="Telefone de Emergência"
                    placeholderTextColor={colors.mediumGray}
                    style={styles.input}
                    keyboardType="phone-pad"
                    mask={[
                      '(', /\d/, /\d/, ')', ' ',
                      /\d/, /\d/, /\d/, /\d/, /\d/, '-',
                      /\d/, /\d/, /\d/, /\d/
                    ]}
                  />

                  <Text style={styles.cardLabel}><Text style={styles.bold}>Valor</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Valor"
                    value={editingItem.valor ?? item.valor}
                    onChangeText={(text) => setEditingItem({ ...editingItem, valor: text })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Observações</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.observacoes ?? item.observacoes}
                    onChangeText={(text) => setEditingItem({ ...editingItem, observacoes: text })}
                    placeholder="Observações"
                    placeholderTextColor={colors.mediumGray}
                  />
                  <View style={styles.flexRow}>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity style={styles.buttonThird} onPress={() => atualizarSeguro(item.id)}>
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
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Seguradora:</Text> {item.seguradora}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Apólice:</Text> {item.numeroApolice}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Início:</Text> {item.dataInicio}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Fim:</Text> {item.dataFim}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Tel Emergência:</Text> {item.telefoneEmergencia}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Valor:</Text> {item.valor}
                </Text>
                {item.observacoes && (
                  <Text style={styles.cardInfo}>
                    <Text style={styles.bold}>Observações:</Text> {item.observacoes}
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
                    <TouchableOpacity style={styles.buttonFourth} onPress={() => excluirSeguro(item.id)}>
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.noitens}>Nenhum seguro cadastrado.</Text>}
        />
      )}
      {!loading && editingIndex === null && (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() =>
            router.push({
              pathname: '/modal/insurance/createInsurance',
              params: { id },
            })
          }
        >
          <Text style={styles.buttonText}>Cadastrar Seguro</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}