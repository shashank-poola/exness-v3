import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import ScreenHeader from "@/src/components/common/ScreenHeader";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import {
  SUPPORTED_SYMBOLS,
  SYMBOL_ICON_MAP,
  SYMBOL_TO_PAIR,
  SYMBOL_TO_WS_SYMBOL,
  type SupportedSymbol,
} from "@/src/constants/markets";

export default function MarketsSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const prices = useMarketPrices();

  const filteredSymbols = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUPPORTED_SYMBOLS;
    return SUPPORTED_SYMBOLS.filter((s) => {
      const pair = SYMBOL_TO_PAIR[s];
      return (
        s.toLowerCase().includes(q) ||
        pair.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScreenHeader
        activeSearch
        searchValue={query}
        onChangeSearchText={setQuery}
        onBackPress={() => router.back()}
      />

      <FlatList
        data={filteredSymbols}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const wsSymbol = SYMBOL_TO_WS_SYMBOL[item];
          const priceInfo = prices[wsSymbol];
          const midPrice =
            priceInfo && (priceInfo.ask || priceInfo.bid)
              ? (priceInfo.ask + priceInfo.bid) / 2
              : undefined;

          const formattedPrice =
            midPrice != null
              ? midPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "--";

          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/markets",
                  params: { symbol: item },
                })
              }
            >
              <View style={styles.left}>
                <Image
                  source={SYMBOL_ICON_MAP[item]}
                  style={styles.icon}
                />
                <View>
                  <ThemedText size="md" variant="primary">
                    {item}
                  </ThemedText>
                  <ThemedText size="sm" variant="secondary">
                    {SYMBOL_TO_PAIR[item]}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.right}>
                <ThemedText size="md" variant="primary">
                  {formattedPrice}
                </ThemedText>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColor.background.app,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#18181B",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    alignItems: "flex-end",
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

