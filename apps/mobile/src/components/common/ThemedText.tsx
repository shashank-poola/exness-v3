import React from "react";
import { StyleSheet, Text, TextProps, TextStyle, StyleProp } from "react-native";
import { ThemeColor } from "@/src/constants/theme";

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  size?: "xxl" | "xl" | "lg" | "md" | "sm" | "xs" | "body" | "button";
  variant?: "primary" | "secondary" | "tertiary" | "success" | "error";
  style?: StyleProp<TextStyle>;
}

const ThemedText: React.FC<ThemedTextProps> = ({ children, size = "md", variant = "primary", style, ...rest }) => {
    const getColor = () => {
      switch (variant) {
        case "primary":
          return ThemeColor.text.primary;
        case "secondary":
          return ThemeColor.text.secondary;
        case "tertiary":
          return ThemeColor.text.tertiary;
        case "success":
          return ThemeColor.status.success;
        case "error":
          return ThemeColor.status.error;
        default:
          return ThemeColor.text.primary;
    }
  };

  return (
    <Text style={[themedTextStyles[size], { color: getColor() }, style]} {...rest}>
      {children}
    </Text>
  );
};

const themedTextStyles = StyleSheet.create({
  xxl: { fontSize: 30, fontFamily: "Sora-Medium" },
  xl: { fontSize: 24, fontFamily: "Sora-Medium" },
  lg: { fontSize: 20, fontFamily: "Sora-Medium" },
  md: { fontSize: 16, fontFamily: "Sora-Medium" },
  sm: { fontSize: 14, fontFamily: "Sora-Regular" },
  xs: { fontSize: 10, fontFamily: "Sora-Regular" },
  body: { fontSize: 16, fontFamily: "Sora-Regular", lineHeight: 24 },
  button: { fontSize: 16, fontFamily: "Sora-Medium" },
});

export default ThemedText;