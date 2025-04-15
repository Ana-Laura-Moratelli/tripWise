import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';
import { api } from '../../src/services/api';

function formatPhoneForDisplay(phone: string): string {
  if (phone.startsWith('+55')) phone = phone.substring(3);
  else if (phone.startsWith('55') && phone.length > 11) phone = phone.substring(2);

  if (phone.length === 11)
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  if (phone.length === 10)
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  return phone;
}

function transformPhoneNumber(maskedPhone: string): string {
  const digits = maskedPhone.replace(/\D/g, '');
  return `+55${digits}`;
}

function formatPhoneForEditing(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('55') ? digits.substring(2) : digits;
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

    const phoneTransformed = transformPhoneNumber(user.phoneNumber);
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
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitial(user.name)}</Text>
        </View>
      </View>

      {editing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholderTextColor="#888"
          />
          <TextInputMask
            type={'cpf'}
            value={user.cpf}
            onChangeText={(text) => setUser({ ...user, cpf: text })}
            style={styles.input}
            placeholder="CPF"
            placeholderTextColor="#888"
          />
          <TextInputMask
            type={'cel-phone'}
            options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
            value={formatPhoneForEditing(user.phoneNumber)}
            onChangeText={(text) => setUser({ ...user, phoneNumber: text })}
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={styles.input} value={user.name} editable={false} placeholder="Nome" placeholderTextColor="#888" />
          <TextInput style={styles.input} value={user.email} editable={false} placeholder="E-mail" placeholderTextColor="#888" />
          <TextInput
            style={styles.input}
            value={user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}
            editable={false}
            placeholder="CPF"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={formatPhoneForDisplay(user.phoneNumber)}
            editable={false}
            placeholder="Telefone"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    backgroundColor: '#5B2FD4',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  
  input: {
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: 'black',
  },
  editButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: '#34A853',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: '#E53935',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: '#D00',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
