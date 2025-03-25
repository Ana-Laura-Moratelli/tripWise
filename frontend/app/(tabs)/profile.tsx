import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Profile() {

  const router = useRouter();

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('token'); // ou o nome que você usou
      router.replace('/screens/auth/Login'); // redireciona para tela de login
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout.');
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.input}
        placeholder="Nome"

        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"

        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"

        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"

        placeholderTextColor="#888"
      />


      <TouchableOpacity style={styles.button} >
        <Text style={styles.buttonText}>Atualizar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
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
  logoutButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: "#D00",
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
