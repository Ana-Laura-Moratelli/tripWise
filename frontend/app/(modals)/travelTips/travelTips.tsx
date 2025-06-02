import React, { useState } from 'react';
import Constants from 'expo-constants';
import { View, TextInput, FlatList, Text, Alert, ActivityIndicator, Linking, Platform, TouchableOpacity, ActionSheetIOS } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Stack } from 'expo-router';
import styles from '@/src/styles/global';
import { colors } from '@/src/styles/global';


export default function SearchGeoapify() {
    const API_KEY = Constants.expoConfig?.extra?.GEOAPIFY_API_KEY;
    const [query, setQuery] = useState('');
    const [categoria, setCategoria] = useState('catering.restaurant');
    const [resultados, setResultados] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setsearch] = useState(false);

    const buscarLocais = async () => {
        if (!query.trim()) {
            Alert.alert('Atenção', 'Digite o nome da cidade, estado ou país.');
            return;
        }

        setLoading(true);
        try {
            console.log('🔍 Buscando coordenadas para:', query);
            const geocodeResponse = await axios.get('https://api.geoapify.com/v1/geocode/search', {
                params: {
                    text: query,
                    lang: 'pt',
                    limit: 1,
                    apiKey: API_KEY,
                },
            });

            const geo = geocodeResponse.data.features[0]?.geometry;
            if (!geo) {
                Alert.alert('Erro', 'Localidade não encontrada.');
                setLoading(false);
                return;
            }

            const lat = geo.coordinates[1];
            const lon = geo.coordinates[0];

            console.log('📍 Coordenadas obtidas:', geo.coordinates);
            const filtro = `circle:${lon},${lat},5000`;

            const placesResponse = await axios.get('https://api.geoapify.com/v2/places', {
                params: {
                    categories: categoria,
                    filter: filtro,
                    limit: 20,
                    lang: 'pt',
                    apiKey: API_KEY,
                },
            });
            setResultados(placesResponse.data.features || []);
        } catch (error: any) {
            console.log('❌ Erro ao buscar locais:', error.response?.data || error.message);
        } finally {
            setLoading(false);
            setsearch(true);
        }
    };
    const categorias = [
        { label: '🍽️ Restaurantes', value: 'catering.restaurant' },
        { label: '☕ Cafés', value: 'catering.cafe' },
        { label: '🍸 Bares', value: 'catering.bar' },
        { label: '📸 Atrações turísticas', value: 'tourism.attraction' },
        { label: '🖼️ Galerias de Arte', value: 'entertainment.culture.gallery' },
        { label: '🎭 Teatros', value: 'entertainment.culture.theatre' },
        { label: '🐒 Zoológicos', value: 'entertainment.zoo' },
        { label: '🐠 Aquários', value: 'entertainment.aquarium' },
        { label: '🌌 Planetários', value: 'entertainment.planetarium' },
        { label: '🌳 Parques', value: 'leisure.park' },
        { label: '💊 Farmácias', value: 'healthcare.pharmacy' },
        { label: '🛍️ Mercados/Feiras', value: 'commercial.marketplace' },
        { label: 'ℹ️ Escritórios de turismo', value: 'tourism.information.office' },
    ];
    function abrirSelecaoCategoria() {
        const options = categorias.map((cat) => cat.label);
        options.push('Cancelar');

        ActionSheetIOS.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex: options.length - 1,
            },
            (buttonIndex) => {
                if (buttonIndex < categorias.length) {
                    setCategoria(categorias[buttonIndex].value);
                }
            }
        );
    }
    return (

        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Dicas de Viagem' }} />
            

            <TextInput
                placeholder="Digite cidade, estado ou país"
                value={query}
                onChangeText={setQuery}
                style={styles.input}
                placeholderTextColor={colors.mediumGray}
            />

            <Text style={styles.label}>Selecione uma categoria:</Text>

            {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.input} onPress={abrirSelecaoCategoria}>
                    <Text style={{ color: 'black' }}>
                        {categoria ? categorias.find((c) => c.value === categoria)?.label : 'Escolha uma categoria'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={categoria}
                        style={styles.picker}
                        onValueChange={(itemValue) => setCategoria(itemValue)}
                    >
                        {categorias.map((cat) => (
                            <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                        ))}
                    </Picker>
                </View>
            )}
            <View style={styles.flexColumn}>

                <TouchableOpacity style={styles.buttonPrimary} onPress={buscarLocais}>
                    <Text style={styles.buttonText}>Buscar Locais</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#5B2FD4" />
                ) : (

                    <FlatList
                        data={resultados.filter((item) => item.properties?.name && item.properties.name !== 'Nome não disponível')}
                        keyExtractor={(item) => item.properties.place_id}
                        renderItem={({ item }) => (

                            <View style={styles.card}>

                                <Text style={styles.cardTitle}>
                                    {item.properties.name}
                                </Text>

                                {/* Endereço */}
                                {item.properties.formatted && (
                                    <Text>
                                        📍 <Text style={styles.bold}>Endereço:</Text> {item.properties.formatted}
                                    </Text>
                                )}

                                {/* Horário de funcionamento */}
                                {item.properties.opening_hours && (
                                    <Text>
                                        🕒 <Text style={styles.bold}>Horário:</Text> {item.properties.opening_hours}
                                    </Text>
                                )}

                                {/* Site */}
                                {item.properties.website && (
                                    <Text
                                        style={{ color: 'blue' }}
                                        onPress={() => Linking.openURL(item.properties.website)}
                                    >
                                        🌐 <Text style={styles.bold}>Site:</Text> {item.properties.website}
                                    </Text>
                                )}

                                {/* E-mail */}
                                {item.properties.email && (
                                    <Text style={styles.cardTitle}>
                                        ✉️ <Text style={styles.bold}>E-mail:</Text> {item.properties.email}
                                    </Text>
                                )}

                                {/* Descrição  */}
                                {item.properties.datasource?.raw?.description && (
                                    <Text style={styles.cardTitle}>
                                        📝 <Text style={styles.bold}>Descrição:</Text>{' '}
                                        {item.properties.datasource.raw.description}
                                    </Text>
                                )}
                            </View>
                        )}
                        ListEmptyComponent={
                            search ? (
                                <Text style={styles.noitens}>
                                    Nenhum local encontrado para essa busca.
                                </Text>
                            ) : null
                        }

                    />


                )}
            </View>
        </View>
    );
}
