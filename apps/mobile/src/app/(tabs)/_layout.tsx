import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Foundation from "@expo/vector-icons/Foundation";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeColor } from "@/src/constants/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: ThemeColor.text.tertiary,
        tabBarStyle: {
          backgroundColor: ThemeColor.background.app,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingTop: 4,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 12),
        },
        tabBarItemStyle: {
          marginHorizontal: 4,
          marginVertical: 4,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: "800", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ size, focused }) => (
            <Octicons
              name={focused ? "home-fill" : "home"}
              size={size}
              color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ size, focused }) => (
            <FontAwesome6
              name="chart-area"
              size={size}
              color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ size, focused }) => (
            <Foundation
              name="dollar-bill"
              size={size}
              color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, focused }) => (
            <FontAwesome
              name={focused ? "user-circle" : "user-circle-o"}
              size={size}
              color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
            />
          ),
        }}
      />
    </Tabs>
  );
}