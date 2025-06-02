import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity, Platform, ActionSheetIOS } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/src/services/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Documento } from '@/src/types/document';
import MaskInput, { Masks } from 'react-native-mask-input';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';
import { Picker } from '@react-native-picker/picker';

export default function InfoDocuments() {
  const { id } = useLocalSearchParams();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<Documento>>({});
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const tiposDoc = [
    { label: 'CPF', value: 'CPF' },
    { label: 'RG', value: 'RG' },
    { label: 'Passaporte', value: 'Passaporte' },
  ];

  function abrirSelecaoTipoDocumento() {
    const options = tiposDoc.map(o => o.label);
    options.push('Cancelar');
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (buttonIndex: number) => {
        if (buttonIndex < tiposDoc.length) {
          setEditingItem(prev => ({ ...prev, tipo: tiposDoc[buttonIndex].value }));
        }
      }
    );
  }

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
        <View style={styles.container}>
          <Text style={styles.loading}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={documentos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const isEditing = editingIndex === index;

            if (isEditing) {
              return (
                <View style={styles.cardEditing}>
                  {/* Tipo de documento */}
                  {Platform.OS === 'ios' ? (
                    <TouchableOpacity style={styles.input} onPress={abrirSelecaoTipoDocumento}>
                      <Text style={{ color: editingItem.tipo ? 'black' : colors.mediumGray }}>
                        {editingItem.tipo
                          ? tiposDoc.find(o => o.value === editingItem.tipo)?.label
                          : 'Escolha um tipo'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editingItem.tipo}
                        style={styles.picker}
                        onValueChange={(value) => setEditingItem(prev => ({ ...prev, tipo: value }))}
                      >
                        <Picker.Item label="Selecione um tipo" value="" />
                        {tiposDoc.map(o => (
                          <Picker.Item key={o.value} label={o.label} value={o.value} />
                        ))}
                      </Picker>
                    </View>
                  )}

                  {/* Número do documento com máscara conforme tipo */}
                  {editingItem.tipo === 'CPF' && (
                    <MaskInput
                      style={styles.input}
                      value={editingItem.numero}
                      onChangeText={(text) =>
                        setEditingItem((prev) => ({ ...prev, numero: text }))
                      }
                      placeholder="Número do CPF"
                      placeholderTextColor={colors.mediumGray}
                      keyboardType="numeric"
                      mask={[
                        /\d/, /\d/, /\d/, '.',
                        /\d/, /\d/, /\d/, '.',
                        /\d/, /\d/, /\d/, '-',
                        /\d/, /\d/
                      ]}
                    />
                  )}

                  {editingItem.tipo === 'RG' && (
                    <MaskInput
                      style={styles.input}
                      value={editingItem.numero}
                      onChangeText={(text) =>
                        setEditingItem((prev) => ({ ...prev, numero: text }))
                      }
                      placeholder="Número do RG"
                      placeholderTextColor={colors.mediumGray}
                      keyboardType="numeric"
                      mask={[
                        /\d/, /\d/, '.',
                        /\d/, /\d/, /\d/, '.',
                        /\d/, /\d/, /\d/, '-',
                        /\d/
                      ]}
                    />
                  )}

                  {editingItem.tipo === 'Passaporte' && (
                    <MaskInput
                      style={styles.input}
                      value={editingItem.numero}
                      onChangeText={(text) =>
                        setEditingItem((prev) => ({ ...prev, numero: text }))
                      }
                      placeholder="Passaporte (AA 000001)"
                      placeholderTextColor={colors.mediumGray}
                      autoCapitalize="characters"
                      mask={[
                        /[A-Z]/, /[A-Z]/, ' ',
                        /\d/, /\d/, /\d/, /\d/, /\d/, /\d/
                      ]}
                    />
                  )}

                  <Text style={styles.cardLabel}>
                    <Text style={styles.bold}>Validade</Text>
                  </Text>

                  <MaskInput
                    style={styles.input}
                    value={editingItem.validade ?? item.validade}
                    onChangeText={(text) =>
                      setEditingItem({ ...editingItem, validade: text })
                    }
                    placeholder="Validade (dd/mm/aaaa)"
                    placeholderTextColor={colors.mediumGray}
                    keyboardType="numeric"
                    mask={[
                      /\d/, /\d/, '/',
                      /\d/, /\d/, '/',
                      /\d/, /\d/, /\d/, /\d/
                    ]}
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
                </View>
              );
            }

            return (
              <View style={styles.card}>
                <Text style={styles.cardInfo}><Text style={styles.bold}>Tipo:</Text> {item.tipo}</Text>
                <Text style={styles.cardInfo}><Text style={styles.bold}>Número:</Text> {item.numero}</Text>
                <Text style={styles.cardInfo}><Text style={styles.bold}>Validade:</Text> {item.validade}</Text>
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
                      onPress={() => excluirDocumento(item.id)}
                    >
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.noitens}>Nenhum documento cadastrado.</Text>
          }
        />
      )}

      {!loading && editingIndex === null && (
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
      )}
    </View>
  );
}

