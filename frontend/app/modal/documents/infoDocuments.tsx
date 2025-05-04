import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../src/services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Documento } from '../../../src/types/document';
import { TextInputMask } from 'react-native-masked-text';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function InfoDocuments() {
  const { id } = useLocalSearchParams();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Documento>>({});
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  async function atualizarDocumento(docId: string) {
    try {
      if (!editingItem.tipo || !editingItem.numero || !editingItem.validade) {
        Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
        return;
      }

      await api.put(`/api/documents/${docId}`, editingItem);
      Alert.alert('Sucesso', 'Documento atualizado com sucesso.');
      setEditingIndex(null);
      setEditingItem({});
      buscarDocumentos();
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o documento.');
    }
  }

  async function excluirDocumento(docId: string) {
    try {
      await api.delete(`/api/documents/${docId}`);
      Alert.alert('Sucesso', 'Documento excluído com sucesso.');
      setDocumentos((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao excluir documento.');
    }
  }


  async function buscarDocumentos() {
    try {
      const response = await api.get(`/api/documents/${id}`);
      setDocumentos(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os documentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {

    navigation.setOptions({
      title: 'Documentos',
      headerBackTitle: 'Voltar',
    });

    buscarDocumentos();
  }, [id, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      buscarDocumentos();
    }, [id])
  );


  return (
    <View style={styles.container}>

      {loading ? (
        <View style={styles.container}><Text style={styles.loading}>Carregando...</Text></View>
      ) : (
        <FlatList
          data={documentos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const isEditing = editingIndex === index;

            return (
              <View style={styles.card}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editingItem.tipo ?? item.tipo}
                      onChangeText={(text) => setEditingItem({ ...editingItem, tipo: text })}
                      placeholder="Tipo de documento"
                      placeholderTextColor={colors.mediumGray}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingItem.numero ?? item.numero}
                      onChangeText={(text) => setEditingItem({ ...editingItem, numero: text })}
                      placeholder="Número"
                      placeholderTextColor={colors.mediumGray}
                    />
                    <TextInputMask
                      type={'datetime'}
                      options={{ format: 'DD/MM/YYYY' }}
                      value={editingItem.validade ?? item.validade}
                      onChangeText={(text) => setEditingItem({ ...editingItem, validade: text })}
                      placeholder="Validade (dd/mm/aaaa)"
                      placeholderTextColor={colors.mediumGray}
                      style={styles.input}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      value={editingItem.observacoes ?? item.observacoes}
                      onChangeText={(text) => setEditingItem({ ...editingItem, observacoes: text })}
                      placeholder="Observações"
                      placeholderTextColor={colors.mediumGray}
                    />

                    <View style={styles.flexRow}>
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity
                          style={styles.buttonThird}
                          onPress={() => atualizarDocumento(item.id)}
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
                  </>
                ) : (
                  <>
                    <Text style={styles.cardInfo}>
                      <Text style={styles.bold}>Tipo:</Text> {item.tipo}
                    </Text>
                    <Text style={styles.cardInfo}>
                      <Text style={styles.bold}>Número:</Text> {item.numero}
                    </Text>
                    <Text style={styles.cardInfo}>
                      <Text style={styles.bold}>Validade:</Text> {item.validade}
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
                          onPress={() => excluirDocumento(item.id)}>
                          <Text style={styles.buttonText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.noitens}>Nenhum documento cadastrado.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() =>
          router.push({
            pathname: '/modal/documents/createDocuments',
            params: { id },
          })
        }
      >
        <Text style={styles.buttonText}>Cadastrar Documento</Text>
      </TouchableOpacity>
    </View>


  );
}
