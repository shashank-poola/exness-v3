import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react';

import { ThemeColor } from '@/src/constants/theme';

const GREY_CARD = '#25252A';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: ThemeColor.text.tertiary,
        tabBarActiveBackgroundColor: GREY_CARD,
        tabBarStyle: { backgroundColor: ThemeColor.background.app },
        tabBarItemStyle: { borderRadius: 12, marginHorizontal: 4, marginVertical: 6 },
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
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
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}