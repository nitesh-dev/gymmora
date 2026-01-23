import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseCard } from '@/components/ui/exercise/exercise-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { Colors, Fonts } from '@/constants/theme';
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
        <View style={styles.titleRow}>
          <View>
            <ThemedText style={styles.greetingText}>Explore Moves</ThemedText>
            <ThemedText type="title" style={styles.headerTitle}>Exercises</ThemedText>
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.tint + '15' }]}>
            <ThemedText style={[styles.countText, { color: theme.tint }]}>
              {exerciseList.length}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.searchWrapper}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, muscle or equipment..."
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
        
        <View style={styles.filterRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScroll}
            decelerationRate="fast"
          >
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
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
    marginBottom: -4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 34,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  filterSection: {
    paddingBottom: 16,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.4,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    opacity: 0.4,
    textAlign: 'center',
    lineHeight: 22,
  },
});
