import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutSessionViewModel } from '@/view-models/use-workout-session-view-model';

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { 
    planDay, 
    isLoading, 
    duration, 
    isPaused, 
    setIsPaused, 
    workoutData, 
    toggleSet, 
    updateSet, 
    finishWorkout 
  } = useWorkoutSessionViewModel(Number(id));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Finish', 
          onPress: async () => {
            const success = await finishWorkout();
            if (success) {
              router.replace('/(tabs)/history');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: planDay?.dayLabel || 'Workout',
        }}
      />

      <View style={[styles.headerSection, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.timerWrapper} 
          onPress={() => setIsPaused(!isPaused)}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.timerText, isPaused && { color: theme.icon }]}>{formatTime(duration)}</ThemedText>
          <View style={[styles.statusPill, { backgroundColor: isPaused ? 'rgba(255,159,10,0.1)' : theme.tint + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: isPaused ? '#FF9F0A' : theme.tint }]} />
            <ThemedText style={[styles.statusText, { color: isPaused ? '#FF9F0A' : theme.tint }]}>
              {isPaused ? 'PAUSED' : 'LIVE'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {planDay?.exercises.sort((a: any, b: any) => a.exerciseOrder - b.exerciseOrder).map((ex: any) => (
          <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
                  {ex.exercise.title}
                </ThemedText>
                <ThemedText style={styles.exerciseMeta}>
                  {ex.sets} sets • {ex.reps} reps
                </ThemedText>
              </View>
              <TouchableOpacity 
                onPress={() => router.push(`/exercises/${ex.exerciseId}` as any)}
                style={[styles.infoButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
              >
                <IconSymbol name="magnifyingglass" size={18} color={theme.icon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.setsTable}>
              <View style={styles.setsHeader}>
                <ThemedText style={styles.setHeaderLabel}>SET</ThemedText>
                <ThemedText style={styles.setHeaderLabel}>KG</ThemedText>
                <ThemedText style={styles.setHeaderLabel}>REPS</ThemedText>
                <View style={{ width: 44 }} />
              </View>

              {workoutData[ex.exerciseId]?.map((set, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.setRow, 
                    set.isCompleted && { backgroundColor: theme.tint + '08' }
                  ]}
                >
                  <View style={[styles.setIndexCircle, set.isCompleted && { backgroundColor: theme.tint }]}>
                    <ThemedText style={[styles.setIndexText, set.isCompleted && { color: '#FFF' }]}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  
                  <TextInput
                    style={[styles.setInput, { color: theme.text, backgroundColor: 'rgba(255,255,255,0.03)' }]}
                    placeholder="0"
                    placeholderTextColor={theme.icon + '60'}
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={(text) => updateSet(ex.exerciseId, index, { weight: text })}
                    editable={!set.isCompleted}
                  />

                  <TextInput
                    style={[styles.setInput, { color: theme.text, backgroundColor: 'rgba(255,255,255,0.03)' }]}
                    placeholder={set.reps.toString()}
                    placeholderTextColor={theme.icon + '60'}
                    keyboardType="numeric"
                    value={set.reps.toString()}
                    onChangeText={(text) => updateSet(ex.exerciseId, index, { reps: parseInt(text) || 0 })}
                    editable={!set.isCompleted}
                  />

                  <TouchableOpacity 
                    onPress={() => toggleSet(ex.exerciseId, index)}
                    style={[
                      styles.checkButton, 
                      { 
                        backgroundColor: set.isCompleted ? theme.tint : 'transparent', 
                        borderColor: set.isCompleted ? theme.tint : theme.border,
                        borderWidth: 1.5,
                      }
                    ]}
                  >
                    <IconSymbol name="checkmark" size={14} color={set.isCompleted ? '#FFF' : theme.icon} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.finishButton, { backgroundColor: theme.tint }]}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
        </TouchableOpacity>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  timerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 42,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    lineHeight: 52,
    paddingVertical: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  exerciseCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseMeta: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsTable: {
    gap: 4,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  setHeaderLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingRight: 0,
    borderRadius: 12,
  },
  setIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  setIndexText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.7,
  },
  setInput: {
    flex: 1,
    height: 38,
    marginHorizontal: 4,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  checkButton: {
    width: 44,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  finishButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

