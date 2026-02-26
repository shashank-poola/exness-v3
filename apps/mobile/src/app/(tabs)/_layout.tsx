import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Foundation from "@expo/vector-icons/Foundation";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeColor } from "@/src/constants/theme";

const GREY_CARD = "#25252A";

function IconPill({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  if (!focused) return <>{children}</>;

  return (
    <View
      style={{
        paddingHorizontal: 26,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: GREY_CARD,
      }}
    >
      {children}
    </View>
  );
}

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
          paddingTop: 8,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 12),
        },
        tabBarItemStyle: { marginHorizontal: 4, marginVertical: 4 },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: "600", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ size, focused }) => (
            <IconPill focused={focused}>
              <Octicons
                name={focused ? "home-fill" : "home"}
                size={size}
                color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
              />
            </IconPill>
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ size, focused }) => (
            <IconPill focused={focused}>
              <FontAwesome6
                name="chart-area"
                size={size}
                color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
              />
            </IconPill>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ size, focused }) => (
            <IconPill focused={focused}>
              <Foundation
                name="dollar-bill"
                size={size}
                color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
              />
            </IconPill>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, focused }) => (
            <IconPill focused={focused}>
              <FontAwesome
                name={focused ? "user-circle" : "user-circle-o"}
                size={size}
                color={focused ? "#FFFFFF" : ThemeColor.text.tertiary}
              />
            </IconPill>
          ),
        }}
      />
    </Tabs>
  );
}