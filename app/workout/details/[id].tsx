import { Image } from 'expo-image';
import { Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { PlanDayWithExercises } from '@/db/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { workoutService } from '@/services/workout-service';
import { useEffect, useState } from 'react';

export default function WorkoutDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [planDay, setPlanDay] = useState<PlanDayWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await workoutService.getPlanDayById(Number(id));
      setPlanDay(data || null);
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CustomHeader
        transparent
        title={planDay?.dayLabel || undefined}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.header, { backgroundColor: theme.tint }]}>
          <ThemedText style={styles.headerTitle}>{planDay?.dayLabel}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{planDay?.plan?.name}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>{planDay?.exercises?.length || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Exercises</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>
                {planDay?.exercises?.reduce((acc: number, ex) => acc + ex.sets, 0)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Sets</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Exercises</ThemedText>
          {planDay?.exercises?.sort((a, b) => a.exerciseOrder - b.exerciseOrder).map((ex) => (
            <TouchableOpacity 
              key={ex.id} 
              style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/exercises/${ex.exerciseId}` as Href)}
            >
              <View style={styles.exerciseImageContainer}>
                {ex.exercise.gifUrl ? (
                  <Image source={{ uri: ex.exercise.gifUrl }} style={styles.exerciseImage} contentFit="cover" />
                ) : (
                  <IconSymbol name="dumbbell.fill" size={24} color={theme.icon} />
                )}
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseTitle}>{ex.exercise.title}</ThemedText>
                <ThemedText style={styles.exerciseMeta}>{ex.sets} sets • {ex.reps} reps</ThemedText>
                {ex.exercise.overview && (
                  <ThemedText style={styles.exerciseOverview} numberOfLines={1}>
                    {ex.exercise.overview}
                  </ThemedText>
                )}
              </View>
              <IconSymbol name="chevron.right" size={16} color={theme.icon} style={{ opacity: 0.3 }} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.startButton, { backgroundColor: theme.tint }]}
          onPress={() => router.replace(`/workout/${id}` as Href)}
        >
          <ThemedText style={styles.startButtonText}>Start Workout</ThemedText>
          <IconSymbol name="play.fill" size={20} color="#FFF" />
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
  headerCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  header: {
    padding: 32,
    paddingTop: 100,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  exerciseImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseMeta: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  exerciseOverview: {
    fontSize: 12,
    opacity: 0.4,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  startButton: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
});
