import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeColor } from '@/src/constants/theme';

const GREY_CARD = '#25252A';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: ThemeColor.text.tertiary,
        tabBarActiveBackgroundColor: GREY_CARD,
        tabBarStyle: {
          backgroundColor: ThemeColor.background.app,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingTop: 8,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 12),
        },
        tabBarItemStyle: { borderRadius: 20, marginHorizontal: 4, marginVertical: 6 },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Octicons name={focused ? 'home-fill' : 'home'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => <Foundation name="dollar-bill" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome name={focused ? 'user-circle' : 'user-circle-o'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}