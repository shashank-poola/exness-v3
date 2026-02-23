import { useEffect } from "react";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/src/context/auth-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace("/(tabs)/home" as Href);
    } else {
      router.replace("/(auth)/signin");
    }
  }, [user, isLoading]);

  if (isLoading) return null; // or a splash/loading screen

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = Font.useFonts({
    "Sora-Bold": require("../../assets/fonts/Sora-Bold.ttf"),
    "Sora-ExtraBold": require("../../assets/fonts/Sora-ExtraBold.ttf"),
    "Sora-ExtraLight": require("../../assets/fonts/Sora-ExtraLight.ttf"),
    "Sora-Light": require("../../assets/fonts/Sora-Light.ttf"),
    "Sora-Regular": require("../../assets/fonts/Sora-Regular.ttf"),
    "Sora-Medium": require("../../assets/fonts/Sora-Medium.ttf"),
    "Sora-SemiBold": require("../../assets/fonts/Sora-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}