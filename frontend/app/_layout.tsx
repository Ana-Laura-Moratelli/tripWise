// app/_layout.tsx
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  // se o primeiro segmento for "(tabs)", estamos dentro do BottomTabs
  const insideTabs = segments[0] === '(tabs)';

  const content = (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        {/* Tabs principais */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modais externos aos tabs */}
        <Stack.Screen
          name="modal/travelTips/travelTips"
          options={{ presentation: 'modal', title: 'Dicas de Viagem' }}
        />
        <Stack.Screen
          name="modal/hotel/infoHotel"
          options={{ presentation: 'modal', title: 'Informações do Hotel' }}
        />
        <Stack.Screen
          name="modal/flight/infoFlight"
          options={{ presentation: 'modal', title: 'Informações do Voo' }}
        />

        {/* Login / Register ficam fora do tabs */}
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="screens/auth/Login" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );

  // só envolver em KeyboardAvoidingView se NÃO estivermos dentro dos tabs
  if (!insideTabs) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}
