import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { InstructionStep } from '@/components/ui/exercise/instruction-step';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Section } from '@/components/ui/section';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExerciseDetailViewModel } from '@/view-models/use-exercise-detail-view-model';

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { exercise, history, isLoading, refresh } = useExerciseDetailViewModel(Number(id));
  const [activeTab, setActiveTab] = React.useState<'instructions' | 'stats'>('instructions');

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  if (!exercise) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Exercise not found.</ThemedText>
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
        transparent
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
        rightAction={
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              onPress={() => setActiveTab('instructions')}
              style={[styles.tabButton, activeTab === 'instructions' && styles.activeTabButton]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}
            >
              <ThemedText style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>Guide</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('stats')}
              style={[styles.tabButton, activeTab === 'stats' && styles.activeTabButton]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 10 }}
            >
              <ThemedText style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Stats</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
      
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.mediaContainer}>
          {exercise.gifUrl ? (
            <Image 
              source={{ uri: exercise.gifUrl }} 
              style={styles.gif} 
              contentFit="contain"
            />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <IconSymbol name="dumbbell.fill" size={60} color={theme.icon} />
            </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={styles.titleSection}>
            <ThemedText style={styles.title}>{exercise.title}</ThemedText>
            <View style={styles.tagsContainer}>
              {exercise.muscleGroups?.map((mg) => (
                <View key={mg.id} style={[styles.tag, { backgroundColor: theme.tint + '15' }]}>
                  <ThemedText style={[styles.tagText, { color: theme.tint }]}>{mg.name.toUpperCase()}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {activeTab === 'instructions' ? (
            <>
              {exercise.overview && (
                <ThemedText style={styles.overview}>{exercise.overview}</ThemedText>
              )}

              <Section title="Muscles Targeted" icon="bolt.fill">
                {exercise.musclesWorkedImg && (
                    <View style={[styles.musclesImageView, { backgroundColor: '#FFFFFF' }]}>
                      <Image 
                        source={{ uri: exercise.musclesWorkedImg }} 
                        style={styles.muscleImage} 
                        contentFit="contain"
                      />
                    </View>
                  )}
                <View style={styles.musclesSectionContainer}>
                  <View style={styles.musclesWorkedGrid}>
                    {exercise.musclesWorked && exercise.musclesWorked.length > 0 ? (
                      exercise.musclesWorked.map((m) => (
                        <View key={m.id} style={styles.muscleWorkedItem}>
                          <ProgressBar 
                            progress={m.percentage} 
                            label={m.name} 
                          />
                        </View>
                      ))
                    ) : (
                      <ThemedText style={styles.emptyText}>No muscle data available.</ThemedText>
                    )}
                  </View>
                </View>
              </Section>

              <Section title="How to Perform" icon="bolt.fill">
                {exercise.content?.filter((c) => c.contentType === 'step').length > 0 ? (
                  exercise.content
                    ?.filter((c) => c.contentType === 'step')
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((c) => (
                      <InstructionStep 
                        key={c.id} 
                        stepNumber={c.orderIndex + 1} 
                        text={c.contentText} 
                      />
                    ))
                ) : (
                  <ThemedText style={styles.emptyText}>No instructions provided.</ThemedText>
                )}
              </Section>

              <Section title="Tips for Success" icon="bolt.fill">
                {exercise.content?.filter((c) => c.contentType === 'tip').length > 0 ? (
                  <View style={[styles.infoCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                    <View style={styles.infoCardHeader}>
                      <IconSymbol name="bolt.fill" size={20} color="#0284C7" />
                      <ThemedText style={[styles.infoCardTitle, { color: '#0369A1' }]}>Tips</ThemedText>
                    </View>
                    {exercise.content
                      ?.filter((c) => c.contentType === 'tip')
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((c) => (
                        <View key={c.id} style={styles.listItem}>
                          <View style={[styles.bullet, { backgroundColor: '#0284C7' }]} />
                          <ThemedText style={[styles.listText, { color: '#0C4A6E' }]}>{c.contentText}</ThemedText>
                        </View>
                      ))}
                  </View>
                ) : null}

                {exercise.content?.filter((c) => c.contentType === 'mistake').length > 0 ? (
                  <View style={[styles.infoCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <View style={styles.infoCardHeader}>
                      <IconSymbol name="multiply" size={20} color="#DC2626" />
                      <ThemedText style={[styles.infoCardTitle, { color: '#991B1B' }]}>Common Mistakes</ThemedText>
                    </View>
                    {exercise.content
                      ?.filter((c) => c.contentType === 'mistake')
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((c) => (
                        <View key={c.id} style={styles.listItem}>
                          <View style={[styles.bullet, { backgroundColor: '#DC2626' }]} />
                          <ThemedText style={[styles.listText, { color: '#7F1D1D' }]}>{c.contentText}</ThemedText>
                        </View>
                      ))}
                  </View>
                ) : null}
              </Section>

              {exercise.variations && exercise.variations.length > 0 && (
                <View style={styles.variationsSection}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Variations</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variationsScroll}>
                    {exercise.variations.map((v) => (
                      <TouchableOpacity 
                        key={v.variationId} 
                        style={[styles.variationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => router.push(`/exercises/${v.variationId}`)}
                      >
                        <ThemedText style={styles.variationTitle}>{v.variation.title}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          ) : (
            <View style={styles.statsView}>
              <Section title="Weight Progression" icon="chart.bar.fill">
                {history.length > 1 ? (
                  <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <LineChart
                      data={{
                        labels: history.slice(-6).map(h => new Date(h.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })),
                        datasets: [{ data: history.slice(-6).map(h => h.weight) }]
                      }}
                      width={width - 64}
                      height={200}
                      chartConfig={{
                        backgroundGradientFrom: theme.card,
                        backgroundGradientTo: theme.card,
                        color: (opacity = 1) => `rgba(44, 154, 255, ${opacity})`,
                        labelColor: (opacity = 1) => theme.text + '80',
                        decimalPlaces: 1,
                      }}
                      bezier
                      style={styles.chart}
                    />
                  </View>
                ) : (
                  <View style={[styles.emptyStats, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <IconSymbol name="chart.bar.fill" size={40} color={theme.icon} style={{ opacity: 0.2 }} />
                    <ThemedText style={styles.emptyText}>Need at least 2 sessions to show progression</ThemedText>
                  </View>
                )}
              </Section>

              <Section title="History" icon="clock.arrow.circlepath">
                {history.length > 0 ? (
                  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {history.slice().reverse().map((item, index) => (
                      <View key={index} style={[styles.historyRow, index !== 0 && { borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' }]}>
                        <View>
                          <ThemedText type="defaultSemiBold">{new Date(item.date).toLocaleDateString()}</ThemedText>
                          <ThemedText style={styles.historySub}>{item.reps} Reps</ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={{ color: theme.tint }}>{item.weight} kg</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={styles.emptyText}>No history found for this exercise.</ThemedText>
                )}
              </Section>
            </View>
          )}
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
    padding: 20,
  },
  mediaContainer: {
    width: width,
    height: width * 0.9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  gif: {
    width: '90%',
    height: '90%',
  },
  mediaPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    width: '100%',
  },
  content: {
    padding: 24,
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  overview: {
    lineHeight: 24,
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 8,
  },
  musclesImageView: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleImage: {
    width: '100%',
    height: '100%',
  },
  musclesSectionContainer: {
    width: '100%',
  },
  musclesWorkedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  muscleWorkedItem: {
    flex: 1,
    minWidth: 120,
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  variationsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  variationsScroll: {
    paddingVertical: 8,
  },
  variationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 120,
    marginRight: 12,
  },
  variationTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    opacity: 0.4,
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: '#000000',
  },
  statsView: {
    paddingBottom: 20,
  },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historySub: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyStats: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  chart: {
    marginLeft: -16,
  },
});
