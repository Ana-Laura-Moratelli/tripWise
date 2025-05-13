import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../../src/services/api';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';

type PhotoNote = {
    id: string;
    tripId: string;
    fotoUrl?: string;
    anotacao?: string;
    criadoEm?: string;
};

export default function InfoPhotoNote() {
    const { id } = useLocalSearchParams(); // tripId
    const [notas, setNotas] = useState<PhotoNote[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Partial<PhotoNote>>({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            title: 'Fotos e Anotações',
            headerBackTitle: 'Voltar',
        });
        buscarNotas();
    }, [id]);

    useFocusEffect(
        React.useCallback(() => {
            buscarNotas();
        }, [id])
    );

    async function buscarNotas() {
        try {
            const response = await api.get(`/api/photoNotes/${id}`);
            setNotas(response.data);
        } catch {
            Alert.alert('Erro', 'Erro ao buscar notas.');
        } finally {
            setLoading(false);
        }
    }

    async function atualizarNota(noteId: string) {
        try {
            if (!editingItem.fotoUrl && !editingItem.anotacao) {
                Alert.alert('Atenção', 'Informe uma foto ou uma anotação.');
                return;
            }

            await api.put(`/api/photoNotes/${noteId}`, editingItem);
            Alert.alert('Sucesso', 'Nota atualizada com sucesso.');
            setEditingIndex(null);
            setEditingItem({});
            buscarNotas();
        } catch {
            Alert.alert('Erro', 'Erro ao atualizar nota.');
        }
    }

    async function excluirNota(noteId: string) {
        try {
            await api.delete(`/api/photoNotes/${noteId}`);
            setNotas((prev) => prev.filter(item => item.id !== noteId));
            Alert.alert('Sucesso', 'Nota excluída com sucesso.');
        } catch {
            Alert.alert('Erro', 'Erro ao excluir nota.');
        }
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <Text style={styles.loading}>Carregando...</Text>
            ) : (
                <FlatList
                    data={notas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => {
                        const isEditing = editingIndex === index;

                        if (isEditing) {
                            return (
                                <View style={styles.cardEditing}>
                                    <Text style={styles.cardLabel}><Text style={styles.bold}>Anotação</Text></Text>
                                    <TextInput
                                        style={styles.textarea}
                                        value={editingItem.anotacao ?? item.anotacao}
                                        onChangeText={(text) => setEditingItem({ ...editingItem, anotacao: text })}
                                        placeholder="Anotação"
                                        placeholderTextColor={colors.mediumGray}
                                        multiline
                                    />

                                    <View style={styles.flexRow}>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity style={styles.buttonThird} onPress={() => atualizarNota(item.id)}>
                                                <Text style={styles.buttonText}>Salvar</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                style={styles.buttonFourth}
                                                onPress={() => {
                                                    setEditingIndex(null);
                                                    setEditingItem({});
                                                }}
                                            >
                                                <Text style={styles.buttonText}>Cancelar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <View style={styles.card}>
                                {item.fotoUrl && (
                                    <Image
                                        source={{ uri: item.fotoUrl }}
                                        style={{ width: '100%', height: 400, borderRadius: 8, marginBottom: 10 }}
                                        resizeMode="cover"
                                    />
                                )}
                                {item.anotacao && (
                                    <Text style={styles.cardInfo}>
                                        <Text style={styles.bold}>Anotação:</Text> {item.anotacao}
                                    </Text>
                                )}
                                <View style={styles.flexRow}>
                                    <View style={{ flex: 1 }}>
                                        <TouchableOpacity
                                            style={styles.buttonSecondary}
                                            onPress={() => {
                                                setEditingIndex(index);
                                                setEditingItem({ ...item });
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Editar</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <TouchableOpacity style={styles.buttonFourth} onPress={() => excluirNota(item.id)}>
                                            <Text style={styles.buttonText}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.noitens}>Nenhuma nota cadastrada.</Text>}
                />
            )}

            {!loading && editingIndex === null && (
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() =>
                        router.push({
                            pathname: "/modal/photoNote/createPhotoNote", params: { id }
                        })
                    }
                >
                    <Text style={styles.buttonText}>Cadastrar Foto/Anotação</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
