import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ReportsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Reports History</ThemedText>
      <View style={styles.separator} />
      <ThemedText>Your uploaded lab reports will appear here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
  },
});