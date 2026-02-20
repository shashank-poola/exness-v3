import React from "react";
import { View, StyleSheet } from "react-native";
import CardContainer from "./common/CardContainer";
import ThemedText from "./common/ThemedText";

interface ProfileInfoCardProps {
  email: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ email }) => {
  return (
    <CardContainer>
      <View style={styles.content}>
        <ThemedText variant="tertiary" size="sm">
          Email
        </ThemedText>
        <ThemedText variant="primary" size="md" style={styles.email}>
          {email}
        </ThemedText>
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 4,
  },
  email: {
    marginTop: 2,
  },
});

export default ProfileInfoCard;
