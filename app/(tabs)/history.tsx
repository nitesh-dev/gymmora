import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHistoryViewModel } from '@/view-models/use-history-view-model';
import { useRouter } from 'expo-router';
import { RefreshControl, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { history, isLoading, refresh } = useHistoryViewModel();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <CustomHeader 
        title="History" 
        showBackButton={false} 
        alignTitle="left"
        variant="rounded"
      />

      <SectionList
        sections={history}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={theme.tint} />
        }
        renderSectionHeader={({ section: { title } }) => (
          <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
              router.push(`/workout/log/${item.id}` as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.workoutName}>
                  {item.planDay?.dayLabel || 'Workout'}
                </ThemedText>
                <ThemedText style={styles.planName}>
                  {item.planDay?.plan?.name || 'Custom Session'}
                </ThemedText>
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.durationBadge, { backgroundColor: theme.tint + '10' }]}>
                  <ThemedText style={[styles.durationText, { color: theme.tint }]}>
                    {formatDuration(item.duration)}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={14} color={theme.icon} style={{ opacity: 0.2 }} />
              </View>
            </View>

            <View style={styles.timeRow}>
              <ThemedText style={styles.dateTime}>
                {formatDate(item.date)} • {formatTime(item.date)}
              </ThemedText>
            </View>

            <View style={styles.exercisesList}>
              {item.exercisesPerformed?.map((exName: string, idx: number) => (
                <View key={idx} style={styles.exerciseRow}>
                  <View style={[styles.bullet, { backgroundColor: theme.tint }]} />
                  <ThemedText style={styles.exerciseItemName} numberOfLines={1}>
                    {exName}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{item.totalSets}</ThemedText>
                <ThemedText style={styles.statLabel}>SETS</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {item.totalVolume > 1000 ? `${(item.totalVolume / 1000).toFixed(1)}k` : item.totalVolume}
                </ThemedText>
                <ThemedText style={styles.statLabel}>KG</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{item.exercisesPerformed?.length || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>EXERCISES</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.tint + '10' }]}>
                <IconSymbol name="clock.arrow.circlepath" size={40} color={theme.tint} />
              </View>
              <ThemedText style={styles.emptyTitle}>No workouts yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Your fitness journey starts with the first session.
              </ThemedText>
              <TouchableOpacity 
                style={[styles.startTodayButton, { backgroundColor: theme.tint }]}
                onPress={() => router.push('/(tabs)')}
              >
                <ThemedText style={styles.startTodayText}>Start Today's Workout</ThemedText>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 32,
    marginBottom: 16,
    marginLeft: 4,
  },
  historyCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
  },
  planName: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timeRow: {
    marginBottom: 12,
  },
  dateTime: {
    fontSize: 12,
    opacity: 0.4,
    fontWeight: '600',
  },
  exercisesList: {
    marginBottom: 20,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  exerciseItemName: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.4,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 20,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startTodayButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  startTodayText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

