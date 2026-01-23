import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function PlansScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Workout Plans</ThemedText>
      <ThemedText>This is where you will manage your weekly workout schedules.</ThemedText>
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
