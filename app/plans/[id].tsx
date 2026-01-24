import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { planService } from '@/services/plan-service';
import { usePlanDetailViewModel } from '@/view-models/use-plan-detail-view-model';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { plan, isLoading, refresh } = usePlanDetailViewModel(Number(id));

  const handleActivatePlan = async () => {
    await planService.activatePlan(Number(id));
    Alert.alert('Plan Activated', `${plan?.name} is now your active workout plan.`);
    refresh();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CustomHeader
        title={plan?.name}
        rightAction={plan && plan.type === 'CUSTOM' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  'Delete Plan',
                  'Are you sure you want to delete this plan?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: async () => {
                        await planService.deletePlan(plan.id);
                        router.back();
                      }
                    },
                  ]
                );
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.headerCircleButton, { backgroundColor: 'rgba(255,59,48,0.1)', marginRight: 8 }]}
            >
              <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/plans/create',
                params: { id: plan.id }
              })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.headerCircleButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            >
              <IconSymbol name="pencil.fill" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        ) : null}
      />

      {isLoading ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
        </ThemedView>
      ) : !plan ? (
        <ThemedView style={styles.center}>
          <ThemedText>Plan not found.</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={{ color: theme.tint }}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: 20, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {plan.status === 'active' && (
                <View style={[styles.typeBadge, { backgroundColor: theme.tint + '15' }]}>
                  <ThemedText style={[styles.typeText, { color: theme.tint }]}>
                    ACTIVE
                  </ThemedText>
                </View>
              )}
              <View style={[styles.typeBadge, { backgroundColor: plan.type === 'SYSTEM' ? theme.tint + '15' : 'rgba(255,255,255,0.05)' }]}>
                <ThemedText style={[styles.typeText, { color: plan.type === 'SYSTEM' ? theme.tint : theme.text }]}>
                  {plan.type} PLAN
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.createdAt}>
              Created on {new Date(plan.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>

          <View style={styles.daysList}>
            {plan.days?.sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek).map((day: any) => (
              <TouchableOpacity 
                key={day.id} 
                activeOpacity={day.isRestDay ? 1 : 0.7}
                onPress={() => {
                  if (!day.isRestDay) {
                    router.push(`/workout/details/${day.id}` as any);
                  }
                }}
                style={[
                  styles.dayCard, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  day.isRestDay && { opacity: 0.6 }
                ]}
              >
                <View style={styles.dayHeader}>
                  <View style={styles.dayLabelContainer}>
                    <ThemedText style={styles.dayName}>{DAYS_OF_WEEK[day.dayOfWeek]}</ThemedText>
                    {day.dayLabel && (
                      <ThemedText style={styles.dayTitle}>{day.dayLabel}</ThemedText>
                    )}
                  </View>
                  {day.isRestDay ? (
                    <View style={[styles.restBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                      <ThemedText style={styles.restText}>REST DAY</ThemedText>
                    </View>
                  ) : (
                    <View style={styles.exerciseCountContainer}>
                      <ThemedText style={styles.exerciseCount}>
                        {day.exercises?.length || 0} Exercises
                      </ThemedText>
                      <IconSymbol name="chevron.right" size={14} color={theme.icon} style={{ opacity: 0.3 }} />
                    </View>
                  )}
                </View>

                {!day.isRestDay && day.exercises?.length > 0 && (
                  <View style={styles.exercisePreview}>
                    {day.exercises.sort((a: any, b: any) => a.exerciseOrder - b.exerciseOrder).map((ex: any, idx: number) => (
                      <View key={ex.id} style={styles.exerciseItem}>
                        <ThemedText style={styles.exerciseIndex}>{idx + 1}</ThemedText>
                        <View style={styles.exerciseMeta}>
                          <ThemedText style={styles.exerciseName} numberOfLines={1}>
                            {ex.exercise?.title}
                          </ThemedText>
                          <ThemedText style={styles.exerciseSets}>
                            {ex.sets} sets × {ex.reps} reps
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {plan && plan.status !== 'active' && (
        <TouchableOpacity 
          style={[
            styles.startButton, 
            { 
              backgroundColor: theme.tint, 
              bottom: insets.bottom + 20 
            }
          ]}
          onPress={handleActivatePlan}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name="bolt.fill" 
            size={20} 
            color="#FFFFFF" 
          />
          <ThemedText style={styles.startButtonText}>
            Set as Active Plan
          </ThemedText>
        </TouchableOpacity>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  createdAt: {
    fontSize: 12,
    opacity: 0.4,
  },
  daysList: {
    gap: 16,
  },
  dayCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayLabelContainer: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseCount: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  restBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  restText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exercisePreview: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseIndex: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.3,
    width: 20,
  },
  exerciseMeta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  exerciseSets: {
    fontSize: 13,
    opacity: 0.5,
  },
  startButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2C9AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
});
