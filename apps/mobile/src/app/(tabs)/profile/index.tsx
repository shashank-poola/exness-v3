import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useAuth } from "@/src/context/auth-context";
import ProfileAvatar from "@/src/components/ProfileAvatar";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import ThemedText from "@/src/components/common/ThemedText";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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
      <Pressable style={styles.logoutButton} onPress={logout}>
        <ThemedText size="button" style={styles.logoutLabel}>
          Logout
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#000000",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  infoSection: {
    width: "100%",
  },
  logoutButton: {
    marginTop: 32,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoutLabel: {
    color: "#000000",
  },
});
