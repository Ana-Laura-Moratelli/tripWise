import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaskInput, { Masks } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '@/services/api';
import styles from '@/app/styles/global';
import { colors } from '@/app/styles/global';

export default function CreateItinerary() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    navigation.setOptions({
      title: 'Adicionar ao Cronograma',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nomeLocal, setNomeLocal] = useState('');
  const [tipoAtividade, setTipoAtividade] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dia, setDia] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  async function buscarEnderecoPorCEP(cepDigitado: string) {
    const cepNumerico = cepDigitado.replace(/\D/g, '');
    if (cepNumerico.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setRua(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      }
    } catch (error) {
      console.log('Erro ao buscar endereço:', error);
    }
  }

  async function obterCoordenadas(endereco: string): Promise<{ latitude: string; longitude: string } | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=AIzaSyBpmchWTIClePxMh-US0DCEe4ZzoVmA5Ms`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return {
          latitude: lat.toString(),
          longitude: lng.toString(),
        };
      }

      console.log("Nenhum resultado encontrado para o endereço");
      return null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas no Google Maps:', error);
      return null;
    }
  }

  function formatarDataAtividade(dataHoraBR: string): string | null {
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

  function converterParaISO(dataHoraBR: string): string | null {
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

    const hora = timePart && /^([01]?\d|2[0-3]):[0-5]\d$/.test(timePart.trim())
      ? timePart.trim()
      : '00:00';

    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hora}:00`;
  }


  async function salvarCronograma() {
    try {
      if (!nomeLocal || !tipoAtividade || !dia) {
        Alert.alert("Preencha todos os campos obrigatórios.");
        return;
      }

      const dataFormatada = formatarDataAtividade(dia);
      const dataISO = converterParaISO(dia);
      if (!dataFormatada || !dataISO) {
        Alert.alert("Data inválida", "Formato de data inválido. Use dd/mm/aaaa hh:mm.");
        return;
      }

      const dataSelecionada = new Date(dataISO);
      if (dataSelecionada < new Date()) {
        Alert.alert("Data inválida", "A data não pode ser anterior ao momento atual.");
        return;

      }

      let enderecoCompleto = `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}`.trim();
      const coordenadas = await obterCoordenadas(enderecoCompleto);

      const endereco: any = {
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado,
      };

      if (coordenadas?.latitude && coordenadas?.longitude) {
        endereco.latitude = coordenadas.latitude;
        endereco.longitude = coordenadas.longitude;
      }

      const novoItem = {
        nomeLocal,
        tipo: tipoAtividade,
        valor,
        descricao,
        dia: dataFormatada,
        endereco,
      };

      await api.post(`/api/trip/${id}/itinerary`, novoItem, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert("Sucesso", "Item adicionado ao cronograma!");
      router.back();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar cronograma.";
      Alert.alert("Erro", errorMessage);
    }
  }

  return (
    <ScrollView style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Nome do local"
        value={nomeLocal}
        onChangeText={setNomeLocal}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.input}
        placeholder="Tipo de atividade"
        value={tipoAtividade}
        onChangeText={setTipoAtividade}
        placeholderTextColor={colors.mediumGray} />
      <MaskInput
        style={styles.input}
        value={dia}
        onChangeText={setDia}
        placeholder="Data"
        keyboardType="numeric"
        placeholderTextColor={colors.mediumGray}
        mask={[
          /\d/, /\d/, '/',
          /\d/, /\d/, '/',
          /\d/, /\d/, /\d/, /\d/, ' ',
          /\d/, /\d/, ':',
          /\d/, /\d/
        ]}
      />

      <MaskInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
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


      <MaskInput
        style={styles.input}
        value={cep}
        onChangeText={(text) => {
          setCep(text);
          buscarEnderecoPorCEP(text);
        }}
        placeholder="CEP"
        placeholderTextColor={colors.mediumGray}
        keyboardType="numeric"
        mask={[
          /\d/, /\d/, /\d/, /\d/, /\d/, '-',
          /\d/, /\d/, /\d/
        ]}
      />


      <TextInput
        style={styles.input}
        placeholder="Rua"
        value={rua}
        onChangeText={setRua}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.input}
        placeholder="Número"
        value={numero}
        keyboardType="numeric"
        onChangeText={setNumero}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={bairro}
        onChangeText={setBairro}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={cidade}
        onChangeText={setCidade}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={estado}
        onChangeText={setEstado}
        placeholderTextColor={colors.mediumGray} />

      <TextInput
        style={styles.textarea}
        placeholder="Descrição"
        multiline numberOfLines={4}
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor={colors.mediumGray} />

      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarCronograma}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
