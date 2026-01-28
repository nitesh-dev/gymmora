import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MetricCard } from '@/components/ui/progress/metric-card';
import { Section } from '@/components/ui/section';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProgressViewModel } from '@/view-models/use-progress-view-model';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { summary, volumeHistory, muscleStats, prs, consistencyLogs, isLoading } = useProgressViewModel();

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isDayCompleted = (date: Date) => {
    return consistencyLogs.some(log => new Date(log.date).toDateString() === date.toDateString());
  };

  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d;
  });

  const chartConfig = {
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => `rgba(44, 154, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.text + '80', // semi-transparent text
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.background,
    },
  };

  const volumeData = {
    labels: volumeHistory.slice(-6).map(v => 
      new Date(v.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      data: volumeHistory.slice(-6).map(v => v.volume),
    }]
  };

  const muscleData = {
    labels: muscleStats.slice(0, 5).map(m => m.name),
    datasets: [{
      data: muscleStats.slice(0, 5).map(m => m.value),
    }]
  };

  return (
    <ThemedView style={styles.container}>
      <CustomHeader 
        title="Progress" 
        showBackButton={false} 
        alignTitle="left"
        variant="rounded"
      />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <MetricCard 
            label="Workouts" 
            value={summary.totalWorkouts} 
            icon="dumbbell.fill" 
            color="#2C9AFF"
          />
          <MetricCard 
            label="Streak" 
            value={`${summary.activeStreak}d`} 
            icon="flame.fill" 
            color="#FF9500"
          />
          <MetricCard 
            label="Total Vol." 
            value={`${(summary.totalVolume / 1000).toFixed(1)}k`} 
            icon="bolt.fill" 
            color="#34C759"
          />
        </View>

        {/* Monthly Consistency */}
        <Section title="Monthly Consistency" icon="flame.fill">
          <View style={[styles.consistencyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <View style={styles.weekdayHeader}>
              {calendarDays.slice(0, 7).map((date, i) => (
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

        {/* Volume Chart */}
        <Section title="Volume Trend" icon="chart.bar.fill">
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {volumeHistory.length > 0 ? (
              <LineChart
                data={volumeData}
                width={screenWidth - 64} // Adjusted for card padding
                height={200}
                chartConfig={{
                  ...chartConfig,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
              />
            ) : (
              <ThemedText style={styles.emptyText}>No volume data yet</ThemedText>
            )}
          </View>
        </Section>

        {/* Muscle Distribution */}
        <Section title="Muscle Distribution" icon="chart.bar.fill">
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
             {muscleStats.length > 0 ? (
              <BarChart
                data={muscleData}
                width={screenWidth - 64} // Adjusted for card padding
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                }}
                verticalLabelRotation={20}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
              />
            ) : (
              <ThemedText style={styles.emptyText}>No workout data yet</ThemedText>
            )}
          </View>
        </Section>

        {/* Personal Records */}
        <Section title="Personal Records" icon="trophy.fill">
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {prs.length > 0 ? (
              prs.map((pr, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.prItem, index === prs.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: pr.exerciseId } })}
                >
                  <View>
                    <ThemedText type="defaultSemiBold">{pr.exercise}</ThemedText>
                    <ThemedText style={styles.prDate}>
                      {new Date(pr.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.prAction}>
                    <ThemedText type="defaultSemiBold" style={styles.prWeight}>
                      {pr.maxWeight} kg
                    </ThemedText>
                    <IconSymbol name="chevron.right" size={14} color={theme.icon} style={{ opacity: 0.3, marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedText style={styles.emptyText}>No PRs recorded yet</ThemedText>
            )}
          </View>
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  consistencyCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: (screenWidth - 32 - 32 - 2 - 48) / 7, // Adjusting for 1px borders on card
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
    width: (screenWidth - 32 - 32 - 2 - 48) / 7, // Adjusting for 1px borders on card
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -16, // Offset padding for chart alignment
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
    marginVertical: 20,
  },
  prItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  prDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  prWeight: {
    color: '#2C9AFF',
  },
  prAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
