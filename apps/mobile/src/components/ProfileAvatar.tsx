import React from "react";
import { Image, StyleSheet, View, ImageSourcePropType } from "react-native";

const AVATAR_IMAGES: ImageSourcePropType[] = [
  require("../../assets/images/avatars/profile_1.jpg"),
  require("../../assets/images/avatars/profile_2.jpg"),
  require("../../assets/images/avatars/profile_3.jpg"),
  require("../../assets/images/avatars/profile_4.png"),
];

const AVATAR_COUNT = AVATAR_IMAGES.length;

function getAvatarIndexFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_COUNT;
}

interface ProfileAvatarProps {
  avatarIndex?: number;
  userId?: string;
  size?: number;
  rounded?: boolean;
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    backgroundColor: "#333",
  },
});

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarIndex,
  userId = "",
  size = 64,
  rounded = true,
}) => {
  const index =
    avatarIndex != null && avatarIndex >= 0 && avatarIndex < AVATAR_COUNT
      ? avatarIndex
      : getAvatarIndexFromId(userId);

  const dimensionStyle = {
    width: size,
    height: size,
    ...(rounded ? { borderRadius: size / 2 } : null),
  };

  return (
    <View style={[styles.container, dimensionStyle]}>
      <Image
        source={AVATAR_IMAGES[index]}
        style={[styles.image, dimensionStyle]}
        resizeMode="cover"
      />
    </View>
  );
};

export default ProfileAvatar;
export { AVATAR_IMAGES, AVATAR_COUNT, getAvatarIndexFromId };