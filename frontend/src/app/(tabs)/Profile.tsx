import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import MaskInput, { Masks } from 'react-native-mask-input';
import { api } from '@/services/api';
import styles from '@/app/styles/global';
import stylesProfile from '@/app/styles/profile';
import { colors } from '@/app/styles/global';
import { Stack } from "expo-router";

function formatPhoneForDisplay(phone: string): string {
  if (phone.length === 11)
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  if (phone.length === 10)
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  return phone;
}

function getInitial(name: string): string {
  return name?.trim()?.charAt(0)?.toUpperCase() || '';
}


export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({ name: '', email: '', cpf: '', phoneNumber: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUser({
            name: userObj.name || '',
            email: userObj.email || '',
            cpf: userObj.cpf || '',
            phoneNumber: userObj.phoneNumber || '',
          });
        }
      } catch (error) { }
    }
    carregarUsuario();
  }, []);

  async function verificarDuplicidade(campo: string, valor: string): Promise<boolean> {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      const response = await api.get('/api/users');
      const usuarios = response.data;

      return usuarios.some((u: any) => u.id !== userId && u[campo] === valor);
    } catch (error) {
      return false;
    }
  }

  async function handleSave() {
    const userId = await AsyncStorage.getItem('@user_id');
    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    const phoneTransformed = formatPhoneForDisplay(user.phoneNumber);
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    if (!cpfRegex.test(user.cpf)) {
      Alert.alert('Erro', 'CPF inválido. Use o formato 999.999.999-99.');
      return;
    }

    const [emailDuplicado, telefoneDuplicado, cpfDuplicado] = await Promise.all([
      verificarDuplicidade('email', user.email),
      verificarDuplicidade('phoneNumber', phoneTransformed),
      verificarDuplicidade('cpf', user.cpf),
    ]);

    if (emailDuplicado || telefoneDuplicado || cpfDuplicado) {
      let msg = 'Erro ao salvar:\n';
      if (emailDuplicado) msg += '- E-mail já cadastrado\n';
      if (telefoneDuplicado) msg += '- Telefone já cadastrado\n';
      if (cpfDuplicado) msg += '- CPF já cadastrado\n';
      Alert.alert('Duplicidade', msg);
      return;
    }

    const payload = { ...user, phoneNumber: phoneTransformed };

    try {
      const response = await api.put(`/api/users/${userId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));
      setEditing(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erro ao atualizar perfil.';
      Alert.alert('Erro', errorMessage);
    }
  }

  async function handleLogout() {
    try {
      await AsyncStorage.multiRemove(['@user_id', '@token', '@user']);
      router.replace('/screens/auth/Login');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout.');
    }
  }

  return (
    <View style={styles.container}>

      
        <Stack.Screen
        options={{
          title: "Perfil",
        }}
      />
      <View style={stylesProfile.avatarContainer}>
        <View style={stylesProfile.avatarCircle}>
          <Text style={stylesProfile.avatarText}>{getInitial(user.name)}</Text>
        </View>
      </View>

      {editing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholderTextColor={colors.mediumGray}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholderTextColor={colors.mediumGray}
          />
          <MaskInput
            value={user.cpf}
            onChangeText={(text) => setUser({ ...user, cpf: text })}
            style={styles.input}
            placeholder="CPF"
            keyboardType="numeric"
            placeholderTextColor={colors.mediumGray}
            mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
          />
          <MaskInput
            value={user.phoneNumber}
            onChangeText={(text) => setUser({ ...user, phoneNumber: text })}
            style={styles.input}
            placeholder="Telefone"
            keyboardType="numeric"
            placeholderTextColor={colors.mediumGray}
            mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
          />

          <View style={styles.flexColumn}>
            <TouchableOpacity style={styles.buttonThird} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonFourth} onPress={() => setEditing(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TextInput style={styles.input} value={user.name} editable={false} placeholder="Nome" placeholderTextColor={colors.mediumGray} />
          <TextInput style={styles.input} value={user.email} editable={false} placeholder="E-mail" placeholderTextColor={colors.mediumGray} />
          <TextInput
            style={styles.input}
            value={user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}
            editable={false}
            placeholder="CPF"
            placeholderTextColor={colors.mediumGray}
          />
          <TextInput
            style={styles.input}
            value={formatPhoneForDisplay(user.phoneNumber)}
            editable={false}
            placeholder="Telefone"
            placeholderTextColor={colors.mediumGray}
          />
          <View style={styles.flexColumn}>

            <TouchableOpacity style={styles.buttonSecondary} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonFourth} onPress={handleLogout}>
              <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>
          </View>

        </>
      )}
    </View>
  );
}
