import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../src/services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInputMask } from 'react-native-masked-text';
import { EmergencyContact } from '../../../src/types/emergencyContact';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function InfoEmergencyContacts() {
  const { id } = useLocalSearchParams();
  const [contatos, setContatos] = useState<EmergencyContact[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<EmergencyContact>>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: 'Contatos de Emergência',
      headerBackTitle: 'Voltar',
    });

    buscarContatos();
  }, [id, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      buscarContatos();
    }, [id])
  );

  async function buscarContatos() {
    try {
      const response = await api.get(`/api/emergencyContact/${id}`);
      setContatos(response.data);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao buscar contatos.');
    } finally {
      setLoading(false);
    }
  }


  async function atualizarContato(contactEmergencyId: string) {
    try {
      if (!editingItem.name || !editingItem.phone || !editingItem.relation) {
        Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
        return;
      }

      await api.put(`/api/emergencyContact/${contactEmergencyId}`, editingItem);
      Alert.alert('Sucesso', 'Contato atualizado com sucesso.');
      setEditingIndex(null);
      setEditingItem({});
      buscarContatos();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o contato.');
    }
  }

  async function excluirContato(contactEmergencyId: string) {
    try {
      await api.delete(`/api/emergencyContact/${contactEmergencyId}`);
      setContatos((prev) => prev.filter((item) => item.id !== contactEmergencyId));
      Alert.alert('Sucesso', 'Contato excluído com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao excluir contato.');
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
          data={contatos}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <View style={styles.cardEditing}>
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Nome</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.name ?? item.name}
                    onChangeText={text => setEditingItem({ ...editingItem, name: text })}
                    placeholder="Nome"
                    placeholderTextColor={colors.mediumGray}
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Telefone</Text></Text>
                  <TextInputMask
                    type="custom"
                    options={{ mask: '(99) 99999-9999' }}
                    value={editingItem.phone ?? item.phone}
                    onChangeText={text => setEditingItem({ ...editingItem, phone: text })}
                    placeholder="Telefone"
                    style={styles.input}
                    placeholderTextColor={colors.mediumGray}
                    keyboardType="numeric"
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Relação</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.relation ?? item.relation}
                    onChangeText={text => setEditingItem({ ...editingItem, relation: text })}
                    placeholder="Relação"
                    placeholderTextColor={colors.mediumGray}
                  />
                  <Text style={styles.cardLabel}><Text style={styles.bold}>Observações</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.observacoes ?? item.observacoes}
                    onChangeText={text => setEditingItem({ ...editingItem, observacoes: text })}
                    placeholder="Observações"
                    placeholderTextColor={colors.mediumGray}
                  />

                  <View style={styles.flexRow}>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        style={styles.buttonThird}
                        onPress={() => atualizarContato(item.id)}
                      >
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

            // Modo leitura
            return (
              <View style={styles.card}>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Nome:</Text> {item.name}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Telefone:</Text> {item.phone}
                </Text>
                <Text style={styles.cardInfo}>
                  <Text style={styles.bold}>Relação:</Text> {item.relation}
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
                    <TouchableOpacity
                      style={styles.buttonFourth}
                      onPress={() => excluirContato(item.id)}
                    >
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.noitens}>Nenhum contato cadastrado.</Text>}
        />
      )}

      {!loading && editingIndex === null && (
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() =>
            router.push({
              pathname: '/modal/emergencyContact/createEmergencyContact',
              params: { id },
            })
          }
        >
          <Text style={styles.buttonText}>Cadastrar Contato</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

