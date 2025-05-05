import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActionSheetIOS } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInputMask } from 'react-native-masked-text';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function CreateDocuments() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [tipo, setTipo] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
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
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex: number) => {
        if (buttonIndex < tiposDoc.length) {
          setTipo(tiposDoc[buttonIndex].value);
        }
      }
    );
  }

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

      {Platform.OS === 'ios' ? (
        <TouchableOpacity style={styles.input} onPress={abrirSelecaoTipoDocumento}>
          <Text>
            {tipo
              ? tiposDoc.find(o => o.value === tipo)?.label
              : 'Escolha um tipo'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipo}
            style={styles.picker}
            onValueChange={(itemValue) => setTipo(itemValue)}
          >
            <Picker.Item label="Selecione um tipo" value="" />
            {tiposDoc.map(o => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        </View>
      )}



      {/* Número do Documento */}
      {tipo === 'CPF' && (
        <TextInputMask
          type="cpf"
          style={styles.input}
          value={numero}
          onChangeText={setNumero}
          placeholder="Número do CPF"
          placeholderTextColor={colors.mediumGray}
          keyboardType="numeric"
        />
      )}
      {tipo === 'RG' && (
        <TextInputMask
          type="custom"
          options={{ mask: '99.999.999-9' }}
          style={styles.input}
          value={numero}
          onChangeText={setNumero}
          placeholder="Número do RG"
          placeholderTextColor={colors.mediumGray}
          keyboardType="numeric"
        />
      )}
      {tipo === 'Passaporte' && (
        <TextInputMask
          type="custom"
          options={{ mask: 'AA 999999' }}
          style={styles.input}
          value={numero}
          onChangeText={setNumero}
          placeholder="Passaporte (AA 000001)"
          placeholderTextColor={colors.mediumGray}
          autoCapitalize="characters"
        />
      )}

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

     

      <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarDocumento}>
        <Text style={styles.buttonText}>Cadastrar Documento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
