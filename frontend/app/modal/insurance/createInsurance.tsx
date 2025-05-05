import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/services/api';
import { useNavigation } from '@react-navigation/native';
import { TextInputMask } from 'react-native-masked-text';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

export default function CreateInsurance() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const [seguradora, setSeguradora] = useState('');
    const [numeroApolice, setNumeroApolice] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [telefoneEmergencia, setTelefoneEmergencia] = useState('');
    const [valor, setValor] = useState('');
    const [observacoes, setObservacoes] = useState('');

    async function adicionarSeguro() {
        if (!seguradora || !numeroApolice || !dataInicio || !dataFim || !telefoneEmergencia || !valor)  {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            await api.post(`/api/insurance/${id}`, {
                seguradora,
                numeroApolice,
                dataInicio,
                dataFim,
                telefoneEmergencia,
                valor,
                observacoes,
            });

            Alert.alert('Sucesso', 'Seguro adicionado com sucesso!');
            router.back();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar seguro.');
        }
    }

    useEffect(() => {
        navigation.setOptions({
            title: 'Cadastrar Seguro',
            headerBackTitle: 'Voltar',
        });
    }, []);

    return (
        <ScrollView style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Seguradora"
                value={seguradora}
                onChangeText={setSeguradora}
                placeholderTextColor={colors.mediumGray}
            />

            <TextInput
                style={styles.input}
                placeholder="Número da Apólice"
                value={numeroApolice}
                onChangeText={setNumeroApolice}
                placeholderTextColor={colors.mediumGray}
                keyboardType="numeric"
            />

            <TextInputMask
                type={'datetime'}
                options={{ format: 'DD/MM/YYYY' }}
                value={dataInicio}
                onChangeText={setDataInicio}
                placeholder="Data de Início"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="numeric"
            />

            <TextInputMask
                type={'datetime'}
                options={{ format: 'DD/MM/YYYY' }}
                value={dataFim}
                onChangeText={setDataFim}
                placeholder="Data de Fim"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="numeric"
            />

            <TextInputMask
                type={'custom'}
                options={{ mask: '(99) 99999-9999' }}
                value={telefoneEmergencia}
                onChangeText={setTelefoneEmergencia}
                placeholder="Telefone de Emergência"
                style={styles.input}
                placeholderTextColor={colors.mediumGray}
                keyboardType="phone-pad"
            />


            <TextInputMask
                type={'money'}
                options={{ precision: 2, separator: ',', delimiter: '.', unit: 'R$', suffixUnit: '' }}
                style={styles.input}
                value={valor}
                onChangeText={setValor}
                placeholder="Valor"
                placeholderTextColor={colors.mediumGray} />


            <TextInput
                style={styles.textarea}
                placeholder="Observações"
                value={observacoes}
                onChangeText={setObservacoes}
                placeholderTextColor={colors.mediumGray}
                multiline
            />

            <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarSeguro}>
                <Text style={styles.buttonText}>Cadastrar Seguro</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

