import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';

export default function InfoDocumentsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [tipo, setTipo] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function adicionarDocumento() {
    if (!tipo || !numero || !validade) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.post(`/api/trip/${id}/documento`, {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Documento</Text>

      <TextInput
        style={styles.input}
        placeholder="Tipo do Documento (ex: Passaporte)"
        value={tipo}
        onChangeText={setTipo}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Número do Documento"
        value={numero}
        onChangeText={setNumero}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Validade (ex: 2028-10-10)"
        value={validade}
        onChangeText={setValidade}
        placeholderTextColor="#888"
      />

      <TextInput
        style={[styles.input, { height: 100 }]} // para observações mais longas
        placeholder="Observações"
        value={observacoes}
        onChangeText={setObservacoes}
        placeholderTextColor="#888"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={adicionarDocumento}>
        <Text style={styles.buttonText}>Salvar Documento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    padding: 16,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    color: 'black',
  },
  button: {
    backgroundColor: '#5B2FD4',
    padding: 16,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
