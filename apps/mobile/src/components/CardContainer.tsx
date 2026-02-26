import React from "react";
import { StyleSheet, View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { ThemeColor } from "@/src/constants/theme";

interface CardContainerProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  height?: number;
  minHeight?: number;
}

const CardContainer: React.FC<CardContainerProps> = ({ children, style, height, minHeight, ...rest }) => {
  return (
    <View
      style={[
        styles.card,
        height != null && { height },
        minHeight != null && { minHeight },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ThemeColor.background.card,
    borderRadius: 14,
    padding: 20,
  },
});

export default CardContainer;