import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { ExerciseSelectionCard } from '@/components/ui/exercise/exercise-selection-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/input';
import { SearchBar } from '@/components/ui/search-bar';
import { Select } from '@/components/ui/select';
import { Colors } from '@/constants/theme';
import { Exercise } from '@/db/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCreatePlanViewModel } from '@/view-models/use-create-plan-view-model';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CreatePlanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const planId = id ? parseInt(id as string) : undefined;
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const {
    name,
    setName,
    days,
    toggleRestDay,
    updateDayLabel,
    addExerciseToDay,
    removeExerciseFromDay,
    updateExerciseSetsReps,
    savePlan,
    isSaving,
    isLoading,
    exerciseSearch,
    searchResults,
    isSearching,
    selectedMuscleGroup,
    muscleGroups,
    handleSearchExercises,
    setFilterAndSearch
  } = useCreatePlanViewModel(planId);

  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Default to Mon
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const selectedDay = days[selectedDayIndex];

  const handleAddExercise = (exercise: Exercise) => {
    addExerciseToDay(selectedDayIndex, exercise);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CustomHeader
        title={planId ? (isLoading ? 'Loading Plan...' : 'Edit Plan') : 'Create Plan'}
        rightAction={
          <TouchableOpacity 
            onPress={() => savePlan()}
            disabled={isSaving}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={[
              styles.headerSaveButton, 
              { 
                backgroundColor: name.trim() ? theme.tint : 'rgba(255,255,255,0.05)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              },
              isSaving && { opacity: 0.7 }
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol 
                  name="paperplane.fill" 
                  size={16} 
                  color={name.trim() ? "#FFFFFF" : theme.icon} 
                />
                <ThemedText style={[styles.saveText, { color: name.trim() ? '#FFFFFF' : theme.icon }]}>
                  {planId ? 'Update' : 'Save'}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: 20, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
        {/* Plan Name */}
        <View style={styles.section}>
          <Input
            label="PLAN NAME"
            placeholder="e.g. Tactical Strength 2.0"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Day Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>SCHEDULE</ThemedText>
          <View style={styles.daySelector}>
            {DAYS_SHORT.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDayIndex(index)}
                style={[
                  styles.dayNode,
                  selectedDayIndex === index && { backgroundColor: theme.tint, borderColor: theme.tint },
                  selectedDayIndex !== index && { backgroundColor: theme.card, borderColor: theme.border }
                ]}
              >
                <ThemedText style={[
                  styles.dayNodeText,
                  selectedDayIndex === index && { color: '#FFFFFF' }
                ]}>
                  {day[0]}
                </ThemedText>
                {days[index].isRestDay && (
                  <View style={styles.restDot} />
                )}
                {!days[index].isRestDay && days[index].exercises.length > 0 && (
                  <View style={[styles.activeDot, { backgroundColor: theme.tint }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Day Context */}
        <View style={[styles.dayEditor, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.dayEditorHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.selectedDayName}>{DAYS_SHORT[selectedDayIndex]} Mission</ThemedText>
              <Input
                style={[
                  styles.dayLabelInput, 
                  { 
                    color: theme.text,
                    borderBottomColor: theme.border,
                    borderWidth: 0,
                    backgroundColor: 'transparent',
                  }
                ]}
                placeholder="e.g. Push, Pull, Legs..."
                value={selectedDay.dayLabel}
                onChangeText={(val) => updateDayLabel(selectedDayIndex, val)}
              />
            </View>
            <TouchableOpacity 
              style={[
                styles.restToggle, 
                { backgroundColor: selectedDay.isRestDay ? theme.tint + '15' : 'rgba(255,255,255,0.05)' }
              ]}
              onPress={() => toggleRestDay(selectedDayIndex)}
            >
              <ThemedText style={[
                styles.restToggleText,
                { color: selectedDay.isRestDay ? theme.tint : theme.text }
              ]}>
                {selectedDay.isRestDay ? 'REST DAY' : 'ACTIVE'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {!selectedDay.isRestDay && (
            <View style={styles.exerciseSlotContainer}>
              {selectedDay.exercises.map((ex, idx) => (
                <View key={ex.exerciseId} style={[styles.exerciseSlot, { borderColor: theme.border + '50' }]}>
                  <View style={styles.slotHeader}>
                    <View style={styles.slotTitleGroup}>
                      <View style={[styles.slotIndex, { backgroundColor: theme.tint + '15' }]}>
                        <ThemedText style={[styles.slotIndexText, { color: theme.tint }]}>{idx + 1}</ThemedText>
                      </View>
                      <ThemedText style={styles.slotName} numberOfLines={1}>{ex.title}</ThemedText>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeExerciseFromDay(selectedDayIndex, ex.exerciseId)}
                      style={styles.slotRemove}
                    >
                      <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.slotControls}>
                    <Select
                      label="Sets"
                      options={[1, 2, 3, 4, 5]}
                      value={ex.sets}
                      onSelect={(val) => updateExerciseSetsReps(selectedDayIndex, ex.exerciseId, Number(val), ex.reps)}
                    />
                    <Select
                      label="Reps"
                      options={[8, 12, 16, 20, 24, 28, 32]}
                      value={ex.reps}
                      onSelect={(val) => updateExerciseSetsReps(selectedDayIndex, ex.exerciseId, ex.sets, Number(val))}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                style={[styles.addSlotButton, { borderColor: theme.tint + '30' }]}
                onPress={() => setShowExercisePicker(true)}
              >
                <View style={[styles.addSlotIcon, { backgroundColor: theme.tint }]}>
                  <IconSymbol name="plus" size={18} color="#FFFFFF" />
                </View>
                <ThemedText style={[styles.addSlotText, { color: theme.tint }]}>Add Exercise</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Save Button (Backup) */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <TouchableOpacity 
            onPress={() => {
              console.log('In-page Save button pressed');
              savePlan();
            }}
            style={[
              styles.footerSaveButton, 
              { backgroundColor: name.trim() ? theme.tint : theme.border + '50' }
            ]}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.footerSaveText}>{planId ? 'UPDATE PLAN' : 'SAVE PLAN'}</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
      >
        <ThemedView style={[styles.modalContent, { borderColor: theme.border }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>Add Exercises</ThemedText>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <ThemedText style={{ color: theme.tint, fontWeight: '700' }}>Done</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalSearch}>
            <SearchBar
              value={exerciseSearch}
              onChangeText={handleSearchExercises}
              placeholder="Search 1,200+ exercises..."
            />
          </View>

          <View style={styles.modalFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <FilterChip 
                label="All" 
                active={!selectedMuscleGroup} 
                onPress={() => setFilterAndSearch(null)} 
              />
              {muscleGroups.map(mg => (
                <FilterChip 
                  key={mg} 
                  label={mg} 
                  active={selectedMuscleGroup === mg} 
                  onPress={() => setFilterAndSearch(mg)} 
                />
              ))}
            </ScrollView>
          </View>

          {isSearching ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={theme.tint} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ExerciseSelectionCard
                  title={item.title}
                  muscleGroups={item.muscleGroups}
                  gifUrl={item.gifUrl}
                  onAdd={() => handleAddExercise(item)}
                  isSelected={selectedDay.exercises.some(ex => ex.exerciseId === item.id)}
                />
              )}
              contentContainerStyle={styles.searchList}
              ListEmptyComponent={
                exerciseSearch.length > 0 || selectedMuscleGroup ? (
                  <View style={styles.emptyResults}>
                    <ThemedText style={{ opacity: 0.5 }}>No exercises found.</ThemedText>
                  </View>
                ) : (
                  <View style={styles.emptyResults}>
                    <IconSymbol name="magnifyingglass" size={32} color={theme.icon} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <ThemedText style={{ opacity: 0.4, textAlign: 'center' }}>Search or select a category to find exercises</ThemedText>
                  </View>
                )
              }
            />
          )}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  saveText: {
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.4,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayNode: {
    width: 44,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNodeText: {
    fontSize: 16,
    fontWeight: '900',
  },
  restDot: {
    position: 'absolute',
    bottom: 6,
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#8E8E93',
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  dayEditor: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  dayEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  selectedDayName: {
    fontSize: 12,
    fontWeight: '900',
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  dayLabelInput: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.5,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  restToggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  restToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  exerciseSlotContainer: {
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  exerciseSlot: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  slotIndex: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotIndexText: {
    fontSize: 11,
    fontWeight: '800',
  },
  slotName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  slotRemove: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotControls: {
    flexDirection: 'row',
    gap: 10,
  },
  addSlotButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  addSlotIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSlotText: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // padding: 24,
    paddingVertical: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSearch: {
    // paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalFilters: {
    marginBottom: 16,
  },
  filterScroll: {
    // paddingHorizontal: 20,
    gap: 8,
  },
  searchList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  footerSaveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerSaveText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
