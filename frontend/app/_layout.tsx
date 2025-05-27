import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setLogado(!!token);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const content = (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* Header controlado pelas tabs */}

        <Stack.Screen
          name="modal/travelTips/travelTips"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Dicas de Viagem',
          }}
        />
        <Stack.Screen
          name="modal/hotel/infoHotel"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Informações do Hotel',
            headerBackTitle: 'Voltar',
          }}
        />

        <Stack.Screen
          name="modal/flight/infoFlight"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Informações do Voo',
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack>

    </ThemeProvider>
  );

  return !logado ? (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );
}
