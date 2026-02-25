import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import ThemedText from "../common/ThemedText";

interface ActionButtonsProps {
  onBuyPress?: () => void;
  onSellPress?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBuyPress,
  onSellPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.9}
        onPress={onBuyPress}
      >
        <View style={styles.buttonContent}>
          <Octicons name="feed-plus" size={18} color="#000000" />
          <ThemedText size="button" style={styles.buttonLabel}>
            Buy
          </ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.9}
        onPress={onSellPress}
      >
        <View style={styles.buttonContent}>
          <FontAwesome5 name="money-bill-wave" size={18} color="#000000" />
          <ThemedText size="button" style={styles.buttonLabel}>
            Sell
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonLabel: {
    color: "#000000",
  },
});

export default ActionButtons;
