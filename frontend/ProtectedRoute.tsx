// ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        setIsAuthenticated(false);
        // Redireciona para a tela de login se não houver token
        router.replace('/screens/auth/Login');
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Enquanto a verificação está em andamento, mostra um indicador de carregamento
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5B2FD4" />
      </View>
    );
  }

  if (!isAuthenticated) {
    // Se não autenticado, não renderiza os componentes protegidos
    return null;
  }

  return children;
}
