import React from "react";
import { StyleSheet, View } from "react-native";

import CardContainer from "../common/CardContainer";
import ThemedText from "../common/ThemedText";

interface HoldingsSectionProps {
  hasPosition?: boolean;
}

const HoldingsSection: React.FC<HoldingsSectionProps> = ({ hasPosition }) => {
  return (
    <View style={styles.wrapper}>
      <ThemedText size="xl" variant="primary" style={styles.title}>
        Holdings
      </ThemedText>

      <CardContainer>
        {hasPosition ? (
          <View>
            <ThemedText variant="secondary" size="sm">
              Position summary
            </ThemedText>
            {/* Placeholder for real holdings data */}
            <ThemedText variant="primary" size="md" style={styles.placeholder}>
              You have an open position in this market.
            </ThemedText>
          </View>
        ) : (
          <View>
            <ThemedText variant="secondary" size="sm">
              No holdings yet
            </ThemedText>
            <ThemedText variant="primary" size="sm" style={styles.placeholder}>
              Start by opening a Buy or Sell position.
            </ThemedText>
          </View>
        )}
      </CardContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
  },
  placeholder: {
    marginTop: 8,
  },
});

export default HoldingsSection;

