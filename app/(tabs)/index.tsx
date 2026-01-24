import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Section } from '@/components/ui/section';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHomeViewModel } from '@/view-models/use-home-view-model';
import { useRouter } from 'expo-router';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { todayWorkout, weeklyActivity, stats, isLoading, refresh } = useHomeViewModel();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = new Date().getDay();

  const isDayCompleted = (dayIndex: number) => {
    return weeklyActivity.some(log => new Date(log.date).getDay() === dayIndex);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={theme.tint} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Hello, Jarvis 👋</ThemedText>
            <ThemedText style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="person.fill" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Hero Card: Today's Workout */}
        <Section title="Today's Workout">
          {todayWorkout ? (
            <TouchableOpacity 
              style={[styles.heroCard, { backgroundColor: theme.tint }]}
              activeOpacity={0.9}
              onPress={() => router.push(`/workout/details/${todayWorkout.id}` as any)}
            >
              <View style={styles.heroContent}>
                <View>
                  <ThemedText style={styles.heroWorkoutName}>{todayWorkout.dayLabel || 'Workout'}</ThemedText>
                  <ThemedText style={styles.heroSubtitle}>
                    {todayWorkout.plan?.name || 'Active Plan'} • {todayWorkout.exercises?.length || 0} Exercises
                  </ThemedText>
                </View>
                <View style={[styles.playButton, { backgroundColor: '#FFFFFF' }]}>
                  <IconSymbol name="play.fill" size={24} color={theme.tint} />
                </View>
              </View>
              
              <View style={styles.musclesHint}>
                {todayWorkout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                  <ThemedText key={i} style={styles.muscleTag}>
                    {ex.exercise?.title}{i < 2 && todayWorkout.exercises.length > i + 1 ? ' • ' : ''}
                  </ThemedText>
                ))}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.emptyHeroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <IconSymbol name="calendar.badge.plus" size={32} color={theme.icon} style={{ opacity: 0.5 }} />
              <ThemedText style={styles.emptyHeroText}>No workout scheduled for today</ThemedText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/plans')}>
                <ThemedText type="link">Switch workout plan</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Section>

        {/* Weekly Activity */}
        <Section title="Weekly Activity">
          <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.daysRow}>
              {daysOfWeek.map((day, index) => {
                const isToday = index === todayIndex;
                const completed = isDayCompleted(index);
                return (
                  <View key={index} style={styles.dayColumn}>
                    <ThemedText style={[styles.dayLetter, isToday && { color: theme.tint, fontWeight: 'bold' }]}>
                      {day}
                    </ThemedText>
                    <View style={[
                      styles.dayDot, 
                      { backgroundColor: completed ? theme.tint : (colorScheme === 'dark' ? '#333' : '#EEE') },
                      isToday && !completed && { borderWidth: 2, borderColor: theme.tint }
                    ]}>
                      {completed && <IconSymbol name="checkmark" size={12} color="#FFF" />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Section>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border, flex: 1 }]}>
            <ThemedText style={styles.statValue}>{stats.totalWorkouts}</ThemedText>
            <ThemedText style={styles.statLabel}>Workouts</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border, flex: 1 }]}>
            <ThemedText style={styles.statValue}>{Math.round(stats.totalDuration / 60)}</ThemedText>
            <ThemedText style={styles.statLabel}>Minutes</ThemedText>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroWorkoutName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginTop: 4,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musclesHint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  emptyHeroCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyHeroText: {
    opacity: 0.5,
    fontSize: 16,
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLetter: {
    fontSize: 12,
    opacity: 0.5,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 4,
  },
});
