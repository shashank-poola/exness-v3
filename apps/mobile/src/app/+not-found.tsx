import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { styles } from "../styles/notfound.style";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page not found</Text>
      <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
        <Text style={styles.link}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
}