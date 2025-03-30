import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export default function ModalScreen() {

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
    const [localizacao, setLocalizacao] = useState('');
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dia, setDia] = useState('');


    function formatarDataAtividade(dataHoraBR: string): string | null {
        if (!dataHoraBR || dataHoraBR.length < 10) return null;

        const partes = dataHoraBR.trim().split(' ');
        const dataPart = partes[0];
        const [dia, mes, ano] = dataPart.split('/');
        if (!dia || !mes || !ano) return null;

        // Validação de hora se estiver presente
        if (partes.length > 1 && partes[1].trim() !== '') {
            const horaPart = partes[1].trim();
            const horaValida = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horaPart);
            if (!horaValida) return null;

            return `${dia}/${mes}/${ano} ${horaPart}`;        }

            return `${dia}/${mes}/${ano}`;
        }

        function converterParaISO(dataHoraBR: string): string | null {
            const partes = dataHoraBR.trim().split(' ');
            const [dia, mes, ano] = partes[0].split('/');
          
            if (!dia || !mes || !ano) return null;
          
            const hora = partes[1] || '00:00';
            const iso = `${ano}-${mes}-${dia}T${hora}:00`;
            return iso;
          }
          

    async function salvarCronograma() {
        try {
            if (!nomeLocal || !tipoAtividade || !localizacao || !dia) {
                Alert.alert("Preencha todos os campos obrigatórios.");
                return;
            }

            const agora = new Date();
            const dataFormatada = formatarDataAtividade(dia);
            const dataISO = converterParaISO(dia);

            if (!dataFormatada || !dataISO) {
              Alert.alert("Data inválida", "Informe uma data válida no formato (dd/mm/aaaa hh:mm).");
              return;
            }
            
            const dataSelecionada = new Date(dataISO);
            if (dataSelecionada < new Date()) {
              Alert.alert("Data inválida", "A data da atividade não pode ser anterior ao momento atual.");
              return;
            }

            const novoItem = {
                nomeLocal,
                tipo: tipoAtividade,
                localizacao,
                valor, 
                descricao,
                dia: dataFormatada,
            };

            const response = await fetch(`http://192.168.15.7:5000/api/trip/${id}/itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem),
            });

            console.log("Status da resposta:", response.status);
            const responseText = await response.text();
            console.log("Corpo da resposta:", responseText);

            if (!response.ok) throw new Error("Erro ao salvar cronograma");

            Alert.alert("Sucesso", "Item adicionado ao cronograma!");
            router.back();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar cronograma.";
            Alert.alert("Erro", errorMessage);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={{ backgroundColor: "#fff", padding: 20, flex: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <TextInput
                    style={styles.input}
                    placeholder="Nome do local"
                    value={nomeLocal}
                    onChangeText={setNomeLocal}
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tipo de atividade"
                    value={tipoAtividade}
                    onChangeText={setTipoAtividade}
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Localização"
                    value={localizacao}
                    onChangeText={setLocalizacao}
                    placeholderTextColor="#888"
                />
                <TextInputMask
                    type={'datetime'}
                    options={{ format: 'DD/MM/YYYY HH:mm' }}
                    style={styles.input}
                    value={dia}
                    onChangeText={setDia}
                    placeholder="Data da atividade (dd/mm/aaaa hh:mm)"
                    placeholderTextColor="#888"
                />
                <TextInputMask
                    type={'money'}
                    options={{
                        precision: 2,
                        separator: ',',
                        delimiter: '.',
                        unit: 'R$',
                        suffixUnit: ''
                    }}
                    style={styles.input}
                    placeholder="Valor"
                    value={valor}
                    onChangeText={setValor}
                    placeholderTextColor="#888"
                />

                <TextInput
                    style={[styles.textarea, { height: 80 }]}
                    placeholder="Descrição opcional"
                    multiline
                    numberOfLines={4}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholderTextColor="#888"
                />

                <TouchableOpacity style={styles.button} onPress={salvarCronograma}>
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>

                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        padding: 16,
        borderRadius: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        color: "black",
    },
    textarea: {
        padding: 16,
        borderRadius: 30,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        color: "black",
    },
    button: {
        backgroundColor: '#5B2FD4',
        padding: 15,
        borderRadius: 40,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
