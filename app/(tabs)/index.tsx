import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
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
  const { todayWorkout, weeklyActivity, monthlyActivity, stats, isLoading, refresh } = useHomeViewModel();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = new Date().getDay();

  const isDayCompleted = (date: Date) => {
    return monthlyActivity.some(log => new Date(log.date).toDateString() === date.toDateString());
  };

  // Generate last 7 days with today as the second last item
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    // Today will be at index 5 (second last)
    d.setDate(d.getDate() - 5 + i);
    return d;
  });

  return (
    <ThemedView style={styles.container}>
      <CustomHeader 
        title="Hello, Jarvis 👋" 
        showBackButton={false}
        alignTitle="left"
        variant="rounded"
        rightAction={
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <IconSymbol name="person.fill" size={20} color={theme.icon} />
          </TouchableOpacity>
        }
      >
        <ThemedText style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </ThemedText>
      </CustomHeader>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={theme.tint} />}
      >
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

        {/* Monthly Streak Activity */}
        <Section title="Consistency & Streak">
          <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.streakHeader}>
              <View style={styles.streakInfo}>
                <IconSymbol name="flame.fill" size={20} color="#FF9500" />
                <ThemedText style={styles.streakCount}>{stats.streak} Day Streak</ThemedText>
              </View>
              <ThemedText style={styles.streakSub}>This Week</ThemedText>
            </View>
            
            <View style={styles.weekdayHeader}>
              {calendarDays.map((date, i) => (
                <ThemedText key={i} style={styles.weekdayText}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                </ThemedText>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                const dayNum = date.getDate();
                const completed = isDayCompleted(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <View key={index} style={styles.calendarDay}>
                    <View style={[
                      styles.dayDot, 
                      { backgroundColor: completed ? theme.tint : (colorScheme === 'dark' ? '#333' : '#F5F5F5') },
                      isToday && { borderWidth: 2, borderColor: theme.tint, borderStyle: 'solid' }
                    ]}>
                      <ThemedText style={[
                        styles.dayNumberInside, 
                        { color: completed ? '#FFF' : (isToday ? theme.tint : theme.text + '60') }
                      ]}>
                        {dayNum}
                      </ThemedText>
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
    paddingTop: 8,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: -4,
    marginBottom: 8,
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
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  streakSub: {
    fontSize: 12,
    opacity: 0.5,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: (width - 40 - 40 - 2 - 48) / 7, // Adjusting for 1px borders on card
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  calendarDay: {
    width: (width - 40 - 40 - 2 - 48) / 7, // Adjusting for 1px borders on card
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDot: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNumberInside: {
    fontSize: 12,
    fontWeight: '600',
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
