import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import ScreenHeader from "@/src/components/common/ScreenHeader";
import { ThemeColor } from "@/src/constants/theme";
import PriceMarquee from "@/src/components/home/PriceMarquee";
import HomePortfolioCard from "@/src/components/home/HomePortfolioCard";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <ScreenHeader
        onBackPress={() => router.push("/(tabs)/home")}
        onSearchPress={() => router.push("/(tabs)/markets/search")}
      />

      <View style={styles.content}>
        <PriceMarquee />
        <HomePortfolioCard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColor.background.app,
  },
  content: {
    flex: 1,
  },
});
