import React from "react";
import { StyleSheet, View, Pressable, TextInput, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ThemedText from "./ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { ScreenHeaderProps } from "@/src/cache";

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ activeSearch = false, searchValue, onChangeSearchText, onBackPress, onSearchPress, onInfoPress }) => {
  return (
    <View style={styles.container}>
      <Pressable
        hitSlop={12}
        style={styles.iconButton}
        onPress={onBackPress}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={ThemeColor.text.primary}
        />
      </Pressable>

      {activeSearch ? (
        <View style={styles.searchActiveWrapper}>
          <Ionicons
            name="search"
            size={18}
            color={ThemeColor.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={ThemeColor.text.tertiary}
            value={searchValue}
            onChangeText={onChangeSearchText}
            autoFocus
          />
        </View>
      ) : (
        <Pressable
          style={styles.searchWrapper}
          onPress={onSearchPress}
          hitSlop={8}
        >
          <Ionicons
            name="search"
            size={18}
            color={ThemeColor.text.secondary}
            style={styles.searchIcon}
          />
          <ThemedText
            size="sm"
            variant="tertiary"
            style={styles.searchPlaceholder}
          >
            Search
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        hitSlop={12}
        style={styles.iconButton}
        onPress={onInfoPress}
      >
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={ThemeColor.text.primary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 4, android: 8 }),
    paddingBottom: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  searchActiveWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    color: ThemeColor.text.primary,
    fontSize: 14,
  },
});

export default ScreenHeader;