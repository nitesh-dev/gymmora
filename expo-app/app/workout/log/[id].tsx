import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { GroupedExercise } from '@/db/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutLogDetailViewModel } from '@/view-models/use-workout-log-detail-view-model';

export default function WorkoutLogDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { log, isLoading } = useWorkoutLogDetailViewModel(Number(id));

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  if (!log) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Workout log not found.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ color: theme.tint }}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CustomHeader
        title={log.planDay?.dayLabel || 'Workout Summary'}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <ThemedText style={styles.dateText}>{formatDate(log.date)}</ThemedText>
          <TouchableOpacity 
            onPress={() => log.planDay?.plan?.id && router.push(`/plans/${log.planDay.plan.id}`)}
            disabled={!log.planDay?.plan?.id}
          >
            <ThemedText style={[styles.planName, !!log.planDay?.plan?.id && { color: theme.tint }]}>
              {log.planDay?.plan?.name || 'Custom Plan'}
            </ThemedText>
          </TouchableOpacity>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{formatDuration(log.duration)}</ThemedText>
              <ThemedText style={styles.statLabel}>DURATION</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{log.totalVolume.toLocaleString()}</ThemedText>
              <ThemedText style={styles.statLabel}>VOLUME (KG)</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{log.sets.length}</ThemedText>
              <ThemedText style={styles.statLabel}>SETS</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Exercises Performed</ThemedText>
          
          {log.groupedExercises.map((group: GroupedExercise, idx: number) => (
            <View key={idx} style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity 
                style={styles.exerciseHeader}
                onPress={() => router.push(`/exercises/${group.exercise.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseHeaderMain}>
                  <View style={styles.exerciseImageContainer}>
                    {group.exercise.gifUrl ? (
                      <Image 
                        source={{ uri: group.exercise.gifUrl }} 
                        style={styles.exerciseImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.placeholderImage, { backgroundColor: theme.border + '30' }]}>
                        <IconSymbol name="dumbbell.fill" size={20} color={theme.icon} />
                      </View>
                    )}
                  </View>
                  <View style={styles.exerciseTitleContainer}>
                    <ThemedText style={styles.exerciseTitle}>{group.exercise.title}</ThemedText>
                    <ThemedText style={styles.exerciseSubtitle}>{group.sets.length} Sets</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={theme.icon} style={{ opacity: 0.3 }} />
                </View>

                {group.exercise.overview && (
                  <ThemedText style={styles.exerciseOverview} numberOfLines={2}>
                    {group.exercise.overview}
                  </ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.setsTable}>
                <View style={styles.tableHeader}>
                  <ThemedText style={styles.tableHeadLabel}>SET</ThemedText>
                  <ThemedText style={styles.tableHeadLabel}>WEIGHT</ThemedText>
                  <ThemedText style={styles.tableHeadLabel}>REPS</ThemedText>
                </View>
                
                {group.sets.map((set, sIdx: number) => (
                  <View key={sIdx} style={[styles.setRow, sIdx % 2 === 0 && { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                    <ThemedText style={styles.setIndex}>{sIdx + 1}</ThemedText>
                    <ThemedText style={styles.setData}>{set.weight} kg</ThemedText>
                    <ThemedText style={styles.setData}>{set.repsDone}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    gap: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButton: {
    padding: 12,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.4,
    marginTop: 4,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    opacity: 0.8,
  },
  exerciseCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  exerciseHeader: {
    marginBottom: 16,
    gap: 12,
  },
  exerciseHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitleContainer: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseSubtitle: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  exerciseOverview: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  setsTable: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  tableHeadLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    opacity: 0.3,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
  },
  setIndex: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
    textAlign: 'center',
  },
  setData: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
