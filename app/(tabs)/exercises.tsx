import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseCard } from '@/components/ui/exercise/exercise-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { SearchBar } from '@/components/ui/search-bar';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Exercise, useExercisesViewModel } from '@/view-models/use-exercises-view-model';

export default function ExercisesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { 
    exerciseList, 
    isLoading, 
    searchQuery, 
    setSearchQuery, 
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    muscleGroups,
    equipmentList,
  } = useExercisesViewModel();

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <ExerciseCard
      title={item.title}
      overview={item.overview ?? undefined}
      gifUrl={item.gifUrl}
      onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: item.id } })}
    />
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Exercises</ThemedText>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterChip 
            label="All Muscles" 
            active={!selectedMuscleGroup} 
            onPress={() => setSelectedMuscleGroup(null)} 
          />
          {muscleGroups.map(mg => (
            <FilterChip 
              key={mg} 
              label={mg} 
              active={selectedMuscleGroup === mg} 
              onPress={() => setSelectedMuscleGroup(mg)} 
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterChip 
            label="All Equipment" 
            active={!selectedEquipment} 
            onPress={() => setSelectedEquipment(null)} 
          />
          {equipmentList.map(eq => (
            <FilterChip 
              key={eq} 
              label={eq} 
              active={selectedEquipment === eq} 
              onPress={() => setSelectedEquipment(eq)} 
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={exerciseList}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No exercises found matching your filters.</ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  headerTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
  },
  filterContainer: {
    gap: 12,
    marginVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
  },
});
