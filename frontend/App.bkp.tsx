import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './app/screens/auth/Login';
import TabNavigator from './app/(tabs)';
import { ProtectedRoute } from './ProtectedRoute';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela pública de login */}
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Tela protegida - somente acessível se houver token */}
        <Stack.Screen name="Main">
          {() => (
            <ProtectedRoute>
              <TabNavigator />
            </ProtectedRoute>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
