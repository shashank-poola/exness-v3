import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useAuth } from "@/src/context/auth-context";
import ProfileAvatar from "@/src/components/ProfileAvatar";
import ProfileInfoCard from "@/src/components/ProfileInfoCard";
import ThemedText from "@/src/components/common/ThemedText";
import CardContainer from "@/src/components/common/CardContainer";
import { ThemeColor } from "@/src/constants/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userId = "id" in user ? (user as { id?: string }).id : undefined;
  const uid = userId ?? user.email;

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <ProfileAvatar userId={uid} size={100} />
      </View>
      <View style={styles.infoSection}>
        <ProfileInfoCard email={user.email} uid={uid} />
        <CardContainer style={styles.accountCard}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="secondary" size="xl">
              Account
            </ThemedText>
          </View>

          <View style={styles.accountList}>
            <View style={styles.accountRow}>
              <View style={styles.accountLeft}>
                <FontAwesome5 name="history" size={16} color={ThemeColor.text.primary} />
                <ThemedText variant="primary" size="md">
                  Transaction History
                </ThemedText>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color={ThemeColor.text.secondary} />
            </View>

            <View style={styles.accountRow}>
              <View style={styles.accountLeft}>
                <FontAwesome5 name="clipboard-list" size={16} color={ThemeColor.text.primary} />
                <ThemedText variant="primary" size="md">
                  Trading Fees & Limits
                </ThemedText>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color={ThemeColor.text.secondary} />
            </View>

            <View style={styles.accountRow}>
              <View style={styles.accountLeft}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={18}
                  color={ThemeColor.text.primary}
                />
                <ThemedText variant="primary" size="md">
                  Crypto Wallets
                </ThemedText>
              </View>
              <FontAwesome5 name="chevron-right" size={12} color={ThemeColor.text.secondary} />
            </View>
          </View>
        </CardContainer>
      </View>
      <View style={styles.spacer} />
      <Pressable style={styles.logoutButton} onPress={logout}>
        <FontAwesome5 name="sign-out-alt" size={16} color="#000000" />
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
    paddingTop: 32,
    backgroundColor: "#000000",
  },
  avatarSection: {
    alignItems: "flex-start",
    marginTop: 60,
    marginBottom: 16,
  },
  infoSection: {
    width: "100%",
  },
  accountCard: {
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 6,
  },
  accountList: {
    borderRadius: 12,
    backgroundColor: "#050509",
    overflow: "hidden",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#18181B",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 24,
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: ThemeColor.text.primary,
  },
  logoutLabel: {
    color: "#000000",
  },
});
