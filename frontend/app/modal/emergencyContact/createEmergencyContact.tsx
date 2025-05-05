import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInputMask } from 'react-native-masked-text';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function CreateEmergencyContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function adicionarContato() {
    if (!name || !phone || !relation) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.post(`/api/emergencyContact/${id}`, {
        name,
        phone,
        relation,
        observacoes,
      });

      Alert.alert('Sucesso', 'Contato de emergência adicionado com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar contato de emergência.');
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Cadastrar Contato de Emergência',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do Contato"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.mediumGray}
      />

      <TextInputMask
        type={'cel-phone'}
        options={{
          maskType: 'BRL',
          withDDD: true,
          dddMask: '(99) '
        }}
        value={phone}
        onChangeText={setPhone}
        placeholder="Telefone"
        placeholderTextColor={colors.mediumGray}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Relação com o contato"
        value={relation}
        onChangeText={setRelation}
        placeholderTextColor={colors.mediumGray}
      />

      <TextInput
        style={styles.textarea}
        placeholder="Observações"
        value={observacoes}
        onChangeText={setObservacoes}
        placeholderTextColor={colors.mediumGray}
        multiline
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarContato}>
        <Text style={styles.buttonText}>Cadastrar Contato</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
