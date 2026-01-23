import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Workout History</ThemedText>
      <ThemedText>View your past performance and consistency here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
});
