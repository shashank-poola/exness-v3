import { StyleSheet, Text, View } from 'react-native';

export default function MarketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Markets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  text: { color: '#fff' },
});