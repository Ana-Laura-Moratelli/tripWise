import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';

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
        headerShown: true,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="Index"
        options={{
          title: 'Hotéis',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="hotel" color={color} />
          ),
          headerRight: () => (
            <Link href="/(modals)/travelTips/TravelTips" asChild>
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
        name="Flight"
        options={{
          title: 'Voos',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="plane" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="shopping-cart" color={color} />
          ), 
        }}
      />

      <Tabs.Screen
        name="Trip"
        options={{
          title: 'Viagens',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="globe" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="map" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Notification"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="bell" color={color} />
          ),
        
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabBarIcon name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
