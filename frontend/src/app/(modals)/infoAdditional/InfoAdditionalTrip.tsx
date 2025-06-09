import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from '@/app/styles/global';

export default function InfoAdditionalTrip() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    navigation.setOptions({
      title: 'Informações Adicionais',
      headerBackTitle: 'Voltar',
    });
  }, [navigation]);

  const botoes = [
    { titulo: 'Documentos', rota: 'documents/InfoDocuments' },
    { titulo: 'Contatos de Emergência', rota: 'emergencyContact/InfoEmergencyContact' },
    { titulo: 'Informações de Seguro', rota: 'insurance/InfoInsurance' },
    { titulo: 'Dados de Transporte', rota: 'transport/InfoTransport' },
    { titulo: 'Fotos', rota: '/photoNote/InfoPhotoNote' },
  ];


  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Selecione uma opção para gerenciar</Text>
      <View style={styles.flexColumn}>
      {botoes.map((botao, index) => (
        <TouchableOpacity
          key={index}
          style={styles.buttonPrimary}
          onPress={() =>
            router.push({
              pathname: `/(modals)/${botao.rota}` as unknown as any,
              params: { id: String(id) },
            })
          }
        >
          <Text style={styles.buttonText}>{botao.titulo}</Text>
        </TouchableOpacity>
      ))}
    </View>

    </View >
  );
}

