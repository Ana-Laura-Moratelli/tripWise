import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
export default function InfoAdditionalTripModal() {
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
    { titulo: 'Documentos', rota: 'infoDocumentsModal' },
    { titulo: 'Contatos de Emergência', rota: 'infoEmergencyContactModal' },
    { titulo: 'Informações de Seguro', rota: 'infoInsuranceModal' },
    { titulo: 'Dados de Transporte', rota: 'infoTransportModal' },
    { titulo: 'Fotos', rota: 'infoPhotoModal' },
    { titulo: 'Notas', rota: 'infoNotesModal' },
  ];


  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Selecione uma opção para gerenciar:</Text>
      {botoes.map((botao, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: `/modal/${botao.rota}` as unknown as any,
              params: { id: String(id) },
            })
          }
        >
          <Text style={styles.buttonText}>{botao.titulo}</Text>
        </TouchableOpacity>
      ))}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
    flexGrow: 1,

  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5B2FD4',
    padding: 16,
    borderRadius: 40,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
