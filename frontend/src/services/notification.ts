import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export async function registerForPushNotificationsAsync() {
  // 2) Peça permissão explicitamente
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // se ainda não concedeu, peça agora
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Sem permissão',
      'Para receber lembretes de viagem, habilite notificações nas configurações do sistema.'
    );
    return;
  }

  // 3) Agora sim pegue o token e salve no backend
  const { data: token } = await Notifications.getExpoPushTokenAsync();
  console.log('📱 Expo Push Token:', token);

  const userId = await AsyncStorage.getItem('@user_id');
  if (!userId) {
    console.warn('Usuário não está logado, não salvei pushToken');
    return;
  }

  await api.post('/api/savePushToken', {
    userId,
    token,
  });

  return token;
}
