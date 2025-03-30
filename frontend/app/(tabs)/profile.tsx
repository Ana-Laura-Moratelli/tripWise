import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TextInputMask } from 'react-native-masked-text';

function formatPhoneForDisplay(phone: string): string {
  // Se o número começa com "+55", remove os 3 primeiros caracteres.
  if (phone.startsWith('+55')) {
    phone = phone.substring(3);
  }
  // Se o número começa com "55" (sem o "+") e possui mais dígitos do que o esperado, remove os 2 primeiros.
  else if (phone.startsWith('55') && phone.length > 11) {
    phone = phone.substring(2);
  }
  
  // Se o número possui 11 dígitos, formata como (12) 99999-9999
  if (phone.length === 11) {
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  } 
  // Se o número possui 10 dígitos, formata como (12) 9999-9999
  else if (phone.length === 10) {
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  } 
  else {
    return phone;
  }
}


function transformPhoneNumber(maskedPhone: string): string {
  // Remove todos os caracteres não numéricos e antepõe +55
  const digits = maskedPhone.replace(/\D/g, '');
  return `+55${digits}`;
}

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState({
    name: '',
    email: '',
    cpf: '',
    phoneNumber: '',
  });
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
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
    carregarUsuario();
  }, []);

  async function handleSave() {
    const phoneTransformed = transformPhoneNumber(user.phoneNumber);
    const payload = {
      ...user,
      phoneNumber: phoneTransformed,
    };

    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }
      const response = await fetch(`http://192.168.15.9:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Erro ao atualizar perfil.');

      const updatedData = await response.json();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
      // Atualiza o AsyncStorage com os novos dados do usuário
      await AsyncStorage.setItem('@user', JSON.stringify(updatedData.user));
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil.');
      console.error(error);
    }
  }

  async function handleLogout() {
    try {
      await AsyncStorage.multiRemove(['@user_id', '@token', '@user']);
      router.replace('/screens/auth/Login');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout.');
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
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
          {/* CPF com máscara */}
          <TextInputMask
            type={'cpf'}
            value={user.cpf}
            onChangeText={(text) => setUser({ ...user, cpf: text })}
            style={styles.input}
            placeholder="CPF"
            placeholderTextColor="#888"
          />
          {/* Telefone com máscara: exibe (12)99999-9999 */}
          <TextInputMask
            type={'cel-phone'}
            options={{
              maskType: 'BRL',
              withDDD: true,
              dddMask: '(99) '
            }}
            value={user.phoneNumber}
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
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={user.name}
            editable={false}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={user.email}
            editable={false}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={user.cpf}
            editable={false}
            placeholderTextColor="#888"
          />
          {/* Exibe o telefone formatado sem o +55 */}
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={formatPhoneForDisplay(user.phoneNumber)}
            editable={false}
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
    marginTop: 20,
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
