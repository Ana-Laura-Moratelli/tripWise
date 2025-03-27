import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Telas
import LoginScreen from '@/app/screens/auth/Login';
import TabNavigator from './app/(tabs)';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const userId = await AsyncStorage.getItem('@user_id');
      setIsAuthenticated(!!userId);
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Ainda verificando o login
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5B2FD4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Usuário logado → vai para as tabs
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // Usuário não logado → vai para o login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
