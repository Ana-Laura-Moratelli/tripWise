import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5B2FD4',
        tabBarInactiveTintColor: '#aaa',
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hotéis',
          tabBarIcon: ({ color }) => <TabBarIcon name="hotel" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color="black" 
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="voo"
        options={{
          title: 'Voos',
          tabBarIcon: ({ color }) => <TabBarIcon name="plane" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />

      <Tabs.Screen
        name="trip"
        options={{
          title: 'Viagens',
          tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />
         <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          tabBarLabelStyle: { marginTop: 4 },
        }}
      />
    </Tabs>
  );
}
