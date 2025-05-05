import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActionSheetIOS } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../../src/services/api';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function CreateTransport() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [tipoTransporte, setTipoTransporte] = useState('aluguel');
  const [empresa, setEmpresa] = useState('');
  const [dataHoraPartida, setDataHoraPartida] = useState('');
  const [dataHoraChegada, setDataHoraChegada] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [numeroLinha, setNumeroLinha] = useState('');

  const opcoes = [
    { label: 'Aluguel de Carro', value: 'aluguel' },
    { label: 'Transferência', value: 'transferencia' },
    { label: 'Transporte Público', value: 'publico' },
  ];

  function abrirSelecaoTipoTransporte() {
    const options = opcoes.map((o) => o.label);
    options.push('Cancelar');

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex < opcoes.length) {
          setTipoTransporte(opcoes[buttonIndex].value);
        }
      }
    );
  }

  useEffect(() => {
    navigation.setOptions({
      title: 'Cadastrar Transporte',
      headerBackTitle: 'Voltar',
    });
  }, []);

  async function adicionarTransporte() {
    if (!empresa || !dataHoraPartida || !dataHoraChegada || !valor) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    try {
      const payload: any = {
        tripId: id,
        tipoTransporte,
        empresa,
        dataHoraPartida,
        dataHoraChegada,
        valor,
        observacoes,
      };

      if (tipoTransporte === 'aluguel') {
        payload.modeloVeiculo = modeloVeiculo;
        payload.placaVeiculo = placaVeiculo;
      }

      if (tipoTransporte === 'publico') {
        payload.numeroLinha = numeroLinha;
      }

      await api.post(`/api/transport/${id}`, payload);

      Alert.alert('Sucesso', 'Transporte adicionado com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar transporte.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Empresa"
        value={empresa}
        onChangeText={setEmpresa}
        placeholderTextColor={colors.mediumGray}
      />

      <Text style={styles.label}>Tipo de Transporte:</Text>

      {Platform.OS === 'ios' ? (
        <TouchableOpacity style={styles.input} onPress={abrirSelecaoTipoTransporte}>
          <Text style={{ color: 'black' }}>
            {tipoTransporte
              ? opcoes.find((o) => o.value === tipoTransporte)?.label
              : 'Escolha um tipo'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoTransporte}
            style={styles.picker}
            onValueChange={(itemValue) => setTipoTransporte(itemValue)}
          >
            {opcoes.map((o) => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        </View>
      )}

      <TextInputMask
        type={'datetime'}
        options={{ format: 'DD/MM/YYYY HH:mm' }}
        style={styles.input}
        placeholder="Data e Hora de Partida"
        value={dataHoraPartida}
        onChangeText={setDataHoraPartida}
        placeholderTextColor={colors.mediumGray}
        keyboardType="numeric"
      />

      <TextInputMask
        type={'datetime'}
        options={{ format: 'DD/MM/YYYY HH:mm' }}
        style={styles.input}
        placeholder="Data e Hora de Chegada"
        value={dataHoraChegada}
        onChangeText={setDataHoraChegada}
        placeholderTextColor={colors.mediumGray}
        keyboardType="numeric"
      />


      <TextInputMask
        type={'money'}
        options={{ precision: 2, separator: ',', delimiter: '.', unit: 'R$', suffixUnit: '' }}
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="Valor"
        placeholderTextColor={colors.mediumGray} />

      {tipoTransporte === 'aluguel' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Modelo do Veículo"
            value={modeloVeiculo}
            onChangeText={setModeloVeiculo}
            placeholderTextColor={colors.mediumGray}
          />

          <TextInput
            style={styles.input}
            placeholder="Placa do Veículo"
            value={placaVeiculo}
            onChangeText={setPlacaVeiculo}
            placeholderTextColor={colors.mediumGray}
          />
        </>
      )}

      {tipoTransporte === 'publico' && (
        <TextInput
          style={styles.input}
          placeholder="Número da Linha"
          value={numeroLinha}
          onChangeText={setNumeroLinha}
          placeholderTextColor={colors.mediumGray}
        />
      )}

      <TextInput
        style={styles.textarea}
        placeholder="Observação"
        value={observacoes}
        multiline numberOfLines={4}
        onChangeText={setObservacoes}
        placeholderTextColor={colors.mediumGray}
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarTransporte}>
        <Text style={styles.buttonText}>Salvar Transporte</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

