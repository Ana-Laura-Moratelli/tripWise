import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInputMask } from 'react-native-masked-text';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function CreateDocuments() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tipo, setTipo] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  async function adicionarDocumento() {
    if (!tipo || !numero || !validade) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.post(`/api/documents/${id}/`, {
        tipo,
        numero,
        validade,
        observacoes,
      });

      Alert.alert('Sucesso', 'Documento adicionado com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar documento.');
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Cadastrar Documento',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);



  return (
    <ScrollView style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Tipo do Documento"
        value={tipo}
        onChangeText={setTipo}
        placeholderTextColor={colors.mediumGray}
      />

      <TextInput
        style={styles.input}
        placeholder="Número do Documento"
        value={numero}
        onChangeText={setNumero}
        placeholderTextColor={colors.mediumGray}
      />

      <TextInputMask
        type={'datetime'}
        options={{ format: 'DD/MM/YYYY' }}
        value={validade}
        onChangeText={setValidade}
        placeholder="Validade"
        placeholderTextColor={colors.mediumGray}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.textarea}
        placeholder="Observações"
        value={observacoes}
        onChangeText={setObservacoes}
        placeholderTextColor={colors.mediumGray}
        multiline
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarDocumento}>
        <Text style={styles.buttonText}>Salvar Documento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
