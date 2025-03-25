// app/modal.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ModalScreen() {
    const { id } = useLocalSearchParams(); // ID da viagem vinculada
    const router = useRouter();

    const [nomeLocal, setNomeLocal] = useState('');
    const [tipoAtividade, setTipoAtividade] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [horario, setHorario] = useState('');
    const [descricao, setDescricao] = useState('');
    const [dia, setDia] = useState('');

    async function salvarCronograma() {
        try {
            if (!nomeLocal || !tipoAtividade || !localizacao || !horario || !dia) {
                Alert.alert("Preencha todos os campos obrigatórios.");
                return;
            }
    
            const novoItem = {
                nomeLocal,
                tipo: tipoAtividade, // Mapeando para o nome esperado pelo backend
                localizacao,
                horario,
                descricao,
                dia: Number(dia),
            };
            
    
            const response = await fetch(`http://192.168.15.9:5000/api/travel/${id}/itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem),
            });
    
            // Log para depurar a resposta
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
        <View style={styles.container}>
            <Text style={styles.title}>Adicionar ao Cronograma</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome do local"
                value={nomeLocal}
                onChangeText={setNomeLocal}
            />
            <TextInput
                style={styles.input}
                placeholder="Tipo de atividade"
                value={tipoAtividade}
                onChangeText={setTipoAtividade}
            />
            <TextInput
                style={styles.input}
                placeholder="Localização"
                value={localizacao}
                onChangeText={setLocalizacao}
            />
            <TextInput
                style={styles.input}
                placeholder="Horário (ex: 14:00 ou 10:00 - 12:00)"
                value={horario}
                onChangeText={setHorario}
            />
            <TextInput
                style={styles.input}
                placeholder="Dia (ex: 1 para Dia 1)"
                value={dia}
                onChangeText={setDia}
                keyboardType="numeric"
            />
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Descrição opcional"
                multiline
                numberOfLines={4}
                value={descricao}
                onChangeText={setDescricao}
            />

            <TouchableOpacity style={styles.button} onPress={salvarCronograma}>
                <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>

            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        color: '#000',
    },
    button: {
        backgroundColor: '#5B2FD4',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
