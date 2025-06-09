import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import MaskInput, { Masks } from 'react-native-mask-input';
import styles from '@/app/styles/global';
import { colors } from '@/app/styles/global';

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
        if (!seguradora || !numeroApolice || !dataInicio || !dataFim || !telefoneEmergencia || !valor) {
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

            <MaskInput
                value={dataInicio}
                onChangeText={setDataInicio}
                placeholder="Data de Início"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="numeric"
                mask={[
                    /\d/, /\d/, '/',
                    /\d/, /\d/, '/',
                    /\d/, /\d/, /\d/, /\d/
                ]}
            />

            <MaskInput
                value={dataFim}
                onChangeText={setDataFim}
                placeholder="Data de Fim"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="numeric"
                mask={[
                    /\d/, /\d/, '/',
                    /\d/, /\d/, '/',
                    /\d/, /\d/, /\d/, /\d/
                ]}
            />

            <MaskInput
                value={telefoneEmergencia}
                onChangeText={setTelefoneEmergencia}
                placeholder="Telefone de Emergência"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="phone-pad"
                mask={[
                    '(', /\d/, /\d/, ')', ' ',
                    /\d/, /\d/, /\d/, /\d/, /\d/, '-',
                    /\d/, /\d/, /\d/, /\d/
                ]}
            />

            <MaskInput
                value={valor}
                onChangeText={(masked, _) => setValor(masked)}
                placeholder="Valor"
                placeholderTextColor={colors.mediumGray}
                style={styles.input}
                keyboardType="numeric"
                mask={Masks.BRL_CURRENCY}
            />

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

