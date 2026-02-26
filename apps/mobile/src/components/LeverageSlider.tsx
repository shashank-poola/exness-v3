import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";

type LeverageSliderProps = {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
};

const LeverageSlider: React.FC<LeverageSliderProps> = ({ value, onChange, min = 1, max = 100 }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [knobX, setKnobX] = useState(0);

  useEffect(() => {
    if (trackWidth === 0) return;
    const clamped = Math.min(Math.max(value, min), max);
    const ratio = (clamped - min) / (max - min);
    setKnobX(ratio * trackWidth);
  }, [value, min, max, trackWidth]);

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handlePress = (evt: any) => {
    if (!trackWidth) return;
    const { locationX } = evt.nativeEvent;
    const ratio = Math.min(Math.max(locationX / trackWidth, 0), 1);
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw);
    onChange(stepped);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText size="sm" variant="secondary">
          Leverage
        </ThemedText>
        <ThemedText size="sm" variant="primary">
          {Math.round(value)}x
        </ThemedText>
      </View>

      <Pressable onPress={handlePress} style={styles.trackWrapper} onLayout={handleTrackLayout}>
        <View style={styles.trackBackground} />
        <View style={[styles.knob, { transform: [{ translateX: knobX }] }]} />
      </Pressable>

      <View style={styles.labelsRow}>
        <ThemedText size="xs" variant="tertiary">
          {min}x
        </ThemedText>
        <ThemedText size="xs" variant="tertiary">
          50x
        </ThemedText>
        <ThemedText size="xs" variant="tertiary">
          {max}x
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackWrapper: {
    height: 32,
    justifyContent: "center",
  },
  trackBackground: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#27272A",
  },
  knob: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ThemeColor.status.success,
    top: 6,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default LeverageSlider;

