import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@/src/context/auth-context";
import ProfileAvatar from "@/src/components/ProfileAvatar";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";

export default function ProfileScreen() {
  const { user } = useAuth();

  if (!user) return null;

  const userId = "id" in user ? (user as { id?: string }).id : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <ProfileAvatar userId={userId ?? user.email} size={72} />
      </View>
      <View style={styles.infoSection}>
        <ProfileInfoCard email={user.email} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000000",
  },
  avatarSection: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  infoSection: {
    width: "100%",
  },
});
