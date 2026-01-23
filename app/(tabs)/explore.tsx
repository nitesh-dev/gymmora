import { ActivityIndicator, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Exercise, useExercisesViewModel } from '@/view-models/use-exercises-view-model';

export default function TabTwoScreen() {
  const { exerciseList, isLoading, searchQuery, setSearchQuery } = useExercisesViewModel();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="dumbbell.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Exercises
        </ThemedText>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <ThemedView style={styles.listContainer}>
          {exerciseList.map((exercise: Exercise) => (
            <ThemedView key={exercise.id} style={styles.exerciseCard}>
              <ThemedText type="defaultSemiBold">{exercise.title}</ThemedText>
              <ThemedText type="default" numberOfLines={2}>
                {exercise.overview}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ParallaxScrollView>
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
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
    gap: 4,
  },
});
