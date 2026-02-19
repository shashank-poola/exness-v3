import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View>
      Home with something
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
