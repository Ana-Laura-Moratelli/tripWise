import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, Text, Image, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import styles from '@/app/styles/global';
import { colors } from '@/app/styles/global';

export default function CreatePhotoNote() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 
    const navigation = useNavigation();
    const [fotoUrl, setFotoUrl] = useState('');
    const [anotacao, setAnotacao] = useState('');

    useEffect(() => {
        navigation.setOptions({
            title: 'Cadastrar Foto',
            headerBackTitle: 'Voltar',
        });

        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Você precisa permitir acesso à câmera para tirar fotos.');
            }
        })();
    }, []);

 async function escolherImagem() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        quality: 0.7,
        base64: false,
    });

    if (!result.canceled) {
        setFotoUrl(result.assets[0].uri);
    }
}

async function tirarFoto() {
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], 
        quality: 0.7,
    });

    if (!result.canceled) {
        setFotoUrl(result.assets[0].uri);
    }
}


    async function adicionarFotoOuNota() {
        if (!fotoUrl && !anotacao) {
            Alert.alert('Atenção', 'Informe uma foto ou escreva uma anotação.');
            return;
        }

        try {
            await api.post(`/api/photoNotes/${id}`, {
                fotoUrl,
                anotacao,
            });

            Alert.alert('Sucesso', 'Foto ou anotação adicionada com sucesso!');
            router.back();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar nota.');
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.containerButtonsPhoto}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={escolherImagem}>
                    <Text style={styles.buttonText}>Escolher da Galeria</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondary} onPress={tirarFoto}>
                    <Text style={styles.buttonText}>Tirar Foto</Text>
                </TouchableOpacity>
            </View>

            {fotoUrl ? (
                <Image
                    source={{ uri: fotoUrl }}
                    style={{ width: '100%', height: 400, borderRadius: 8, marginBottom: 12 }}
                    resizeMode="cover"
                />
            ) : null}

            <TextInput
                style={styles.textarea}
                placeholder="Anotação (opcional)"
                value={anotacao}
                onChangeText={setAnotacao}
                placeholderTextColor={colors.mediumGray}
                multiline
            />

            <TouchableOpacity style={styles.buttonPrimary} onPress={adicionarFotoOuNota}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
