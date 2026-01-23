import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseCard } from '@/components/ui/exercise/exercise-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExercisesViewModel } from '@/view-models/use-exercises-view-model';

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

  const renderExerciseItem = ({ item }: { item: any }) => (
    <ExerciseCard
      title={item.title}
      overview={item.overview ?? undefined}
      gifUrl={item.gifUrl}
      muscleGroups={item.muscleGroups}
      onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: item.id } })}
    />
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.greetingText}>Build your</ThemedText>
            <ThemedText style={styles.headerTitle}>Exercise Library</ThemedText>
          </View>
          <View style={[styles.profileButton, { backgroundColor: theme.card }]}>
            <IconSymbol name="person.fill" size={20} color={theme.tint} />
          </View>
        </View>
        
        <View style={styles.searchWrapper}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 1,200+ exercises..."
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScroll}
            decelerationRate="fast"
          >
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
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={styles.loadingText}>Hydrating library...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={exerciseList}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.tint + '05' }]}>
                <IconSymbol name="magnifyingglass" size={32} color={theme.tint} />
              </View>
              <ThemedText style={styles.emptyText}>No results found</ThemedText>
              <ThemedText style={styles.emptySubText}>Try adjusting your filters to find what you're looking for.</ThemedText>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    opacity: 0.6,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchWrapper: {
    marginTop: 4,
  },
  filterSection: {
    paddingBottom: 16,
  },
  filterRow: {
    marginBottom: 0,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 20,
  },
});
