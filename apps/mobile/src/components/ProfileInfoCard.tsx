import React from "react";
import { View, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CardContainer from "./CardContainer";
import ThemedText from "./common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { ProfileInfoCardProps } from "../types/utils.type";

function maskUid(uid: string): string {
  if (!uid || uid.length <= 10) return uid;
  return uid.slice(0, 5) + "....." + uid.slice(-5);
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ email, uid }) => {
  const displayUid = maskUid(uid ?? "");

  return (
    <CardContainer>
      <View style={styles.verifiedRow}>
        <ThemedText variant="primary" size="lg" style={styles.verifiedLabel}>
          Verified Account
        </ThemedText>
        <FontAwesome5 name="check-circle" size={16} color={ThemeColor.status.success} />
      </View>

      <View style={styles.uidRow}>
        <ThemedText variant="secondary" size="sm">
          UID: {displayUid}
        </ThemedText>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <ThemedText variant="tertiary" size="sm">
          Email Account
        </ThemedText>
        <ThemedText variant="primary" size="md" style={styles.email}>
          {email}
        </ThemedText>
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  verifiedLabel: {
    fontWeight: "600",
  },
  uidRow: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#27272A",
    marginVertical: 8,
  },
  content: {
    gap: 4,
  },
  email: {
    marginTop: 2,
  },
});

export default ProfileInfoCard;
