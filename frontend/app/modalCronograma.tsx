import React, { useState } from 'react';
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

export default function ModalScreen() {
    const { id } = useLocalSearchParams(); // ID da viagem vinculada
    const router = useRouter();

    const [nomeLocal, setNomeLocal] = useState('');
    const [tipoAtividade, setTipoAtividade] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [horario, setHorario] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dia, setDia] = useState('');

    function formatarDataHoraParaISO(dataHoraBR: string): string | null {
        if (!dataHoraBR || dataHoraBR.length < 10) return null;

        const [data, hora] = dataHoraBR.split(' ');
        const [dia, mes, ano] = data.split('/');

        const horaFormatada = hora || '00:00:00';
        return `${ano}-${mes}-${dia}T${horaFormatada}`;
    }

    async function salvarCronograma() {
        try {
            if (!nomeLocal || !tipoAtividade || !localizacao || !horario || !dia) {
                Alert.alert("Preencha todos os campos obrigatórios.");
                return;
            }

            const dataISO = formatarDataHoraParaISO(dia);
            if (!dataISO) {
                Alert.alert("Data inválida", "Informe uma data válida no formato dd/mm/aaaa hh:mm:ss");
                return;
            }

            const novoItem = {
                nomeLocal,
                tipo: tipoAtividade,
                localizacao,
                horario,
                descricao,
                dia: dataISO,
            };

            const response = await fetch(`http://192.168.15.9:5000/api/travel/${id}/itinerary`, {
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
            console.error("Erro no salvarCronograma:", error);
            Alert.alert("Erro", errorMessage);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100} // Ajuste conforme sua barra superior
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: 'white' }}
                keyboardShouldPersistTaps="handled"
            >

                <Text style={styles.title}>Adicionar ao Cronograma</Text>
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
                    options={{ format: 'DD/MM/YYYY HH:mm:ss' }}
                    style={styles.input}
                    value={dia}
                    onChangeText={setDia}
                    placeholder="Data da atividade (dd/mm/aaaa hh:mm)"
                    placeholderTextColor="#888"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Valor"
                    value={horario}
                    onChangeText={setHorario}
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
