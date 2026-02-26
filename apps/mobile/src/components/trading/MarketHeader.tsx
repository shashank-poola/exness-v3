import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import ThemedText from "../common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";

interface MarketHeaderProps {
  baseSymbol: string;
  pair: string;
  price?: number;
  changePercent?: number;
  iconSource?: ImageSourcePropType;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({
  baseSymbol,
  pair,
  price,
  changePercent,
  iconSource,
}) => {
  const numericPrice = typeof price === "number" ? price : undefined;
  const formattedPrice =
    numericPrice != null && numericPrice > 0
      ? numericPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "--";

  const pct = changePercent ?? 0;
  const isNegative = pct < 0;
  const formattedChange = `${isNegative ? "" : "+"}${pct.toFixed(2)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.rowTop}>
        <View style={styles.assetWrapper}>
          <View style={styles.assetIcon}>
            {iconSource ? (
              <Image source={iconSource} style={styles.assetImage} />
            ) : (
              <ThemedText size="lg">{baseSymbol[0]}</ThemedText>
            )}
          </View>
          <View style={styles.chevronStack}>
            <Ionicons
              name="chevron-up-outline"
              size={12}
              color={ThemeColor.text.secondary}
            />
            <Ionicons
              name="chevron-down-outline"
              size={12}
              color={ThemeColor.text.secondary}
            />
          </View>
        </View>

        <View style={styles.rightIcons}>
          <Ionicons
            name="star-outline"
            size={22}
            color={ThemeColor.text.secondary}
            style={styles.rightIcon}
          />
          <FontAwesome5
            name="chart-line"
            size={20}
            color={ThemeColor.text.secondary}
          />
        </View>
      </View>

      <View style={styles.symbolInfo}>
        <ThemedText size="lg" variant="secondary" style={styles.pairLabel}>
          {pair}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText
            size="xxl"
            variant="primary"
            style={styles.priceFont}
          >
            {formattedPrice}
          </ThemedText>
          <View
            style={[
              styles.changePill,
              isNegative ? styles.changePillNegative : styles.changePillPositive,
            ]}
          >
            <ThemedText size="xs" style={styles.changeText}>
              {formattedChange}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  assetWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7931A",
    alignItems: "center",
    justifyContent: "center",
  },
  assetImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "cover",
  },
  chevronStack: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightIcon: {
    marginRight: 16,
  },
  symbolInfo: {
    gap: 4,
  },
  pairLabel: {
    letterSpacing: 0.5,
    fontFamily: "Sora-SemiBold",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  priceFont: {
    fontFamily: "Sora-SemiBold",
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  changePillNegative: {
    backgroundColor: "rgba(198,72,72,0.18)",
  },
  changePillPositive: {
    backgroundColor: "rgba(67,152,99,0.18)",
  },
  changeText: {
    fontFamily: "Sora-SemiBold",
    color: "#FFFFFF",
  },
});

export default MarketHeader;

