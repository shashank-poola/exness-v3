import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle, TextStyle } from "react-native";

import ThemedText from "../common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";

interface TimeframeSelectorProps {
  options: string[];
  selected: string;
  onChange?: (value: string) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  options,
  selected,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option === selected;

        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange?.(option)}
            activeOpacity={0.8}
          >
            <ThemedText
              size="sm"
              style={[styles.label, isActive && styles.labelActive]}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface TimeframeStyles {
  container: ViewStyle;
  chip: ViewStyle;
  chipActive: ViewStyle;
  label: TextStyle;
  labelActive: TextStyle;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  chipActive: {
    backgroundColor: "#3F3F46",
    borderColor: "#52525B",
  },
  label: {
    color: "#E5E7EB",
  },
  labelActive: {
    color: "#FFFFFF",
  },
}) as TimeframeStyles;

export default TimeframeSelector;
