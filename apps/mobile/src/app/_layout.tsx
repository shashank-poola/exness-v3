import { useEffect } from "react";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter, type Href } from "expo-router";
import { AuthProvider, useAuth } from "@/src/context/auth-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace("/(tabs)" as Href);
    } else {
      router.replace("/(auth)/signin");
    }
  }, [user, isLoading]);

  if (isLoading) return null; // or a splash/loading screen

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = Font.useFonts({
    "Sora-Regular": require("../../assets/fonts/Sora-Regular.ttf"),
    "Sora-Medium": require("../../assets/fonts/Sora-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}