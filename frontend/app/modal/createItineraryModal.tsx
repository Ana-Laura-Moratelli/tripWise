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

        const partes = dataHoraBR.split(' ');
        const dataPart = partes[0]; 

        if (partes.length > 1 && partes[1].trim() !== "") {
            const timePart = partes[1].trim().substring(0, 5);
            return `${dataPart} ${timePart}`;
        } else {
            return dataPart;
        }
    }

    async function salvarCronograma() {
        try {
            if (!nomeLocal || !tipoAtividade || !localizacao || !dia) {
                Alert.alert("Preencha todos os campos obrigatórios.");
                return;
            }

            const dataFormatada = formatarDataAtividade(dia);
            if (!dataFormatada) {
                Alert.alert("Data inválida", "Informe uma data válida no formato DD/MM/AAAA [HH:mm].");
                return;
            }

            const novoItem = {
                nomeLocal,
                tipo: tipoAtividade,
                localizacao,
                valor, // Campo de valor com máscara de dinheiro
                descricao,
                dia: dataFormatada,
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

                {/* Campo de data com máscara para "DD/MM/YYYY HH:mm". O horário não é obrigatório. */}
                <TextInputMask
                    type={'datetime'}
                    options={{ format: 'DD/MM/YYYY HH:mm' }}
                    style={styles.input}
                    value={dia}
                    onChangeText={setDia}
                    placeholder="Data da atividade (dd/mm/aaaa [hh:mm])"
                    placeholderTextColor="#888"
                />

                {/* Campo de Valor com máscara de dinheiro em R$ */}
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
