import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/src/services/notification';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then(async (token) => {
        if (token) {
          await registerForPushNotificationsAsync();
          // já logado → vai pras tabs
          router.push('/');
        } else {
          // não logado → vai pra tela de Login
          router.replace('/screens/auth/Login');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
