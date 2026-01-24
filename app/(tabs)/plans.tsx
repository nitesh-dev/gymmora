import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlansViewModel } from '@/view-models/use-plans-view-model';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { plans, isLoading, refreshPlans } = usePlansViewModel();

  const renderPlanItem = ({ item }: { item: any }) => {
    const workoutDays = item.days?.filter((d: any) => !d.isRestDay).length || 0;
    
    return (
      <TouchableOpacity 
        style={[
          styles.planCard, 
          { backgroundColor: theme.card, borderColor: theme.border },
          item.status === 'active' && { borderColor: theme.tint, borderWidth: 1.5 }
        ]}
        onPress={() => router.push(`/plans/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.planInfo}>
          <View style={styles.planHeader}>
            <ThemedText style={styles.planName}>{item.name}</ThemedText>
            <View style={styles.badgeContainer}>
              {item.status === 'active' && (
                <View style={[styles.badge, { backgroundColor: theme.tint + '15' }]}>
                  <ThemedText style={[styles.badgeText, { color: theme.tint }]}>
                    ACTIVE
                  </ThemedText>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: item.type === 'SYSTEM' ? theme.tint + '15' : 'rgba(255,255,255,0.05)' }]}>
                <ThemedText style={[styles.badgeText, { color: item.type === 'SYSTEM' ? theme.tint : theme.text }]}>
                  {item.type}
                </ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <IconSymbol name="calendar.badge.plus" size={14} color={theme.icon} style={{ opacity: 0.6 }} />
              <ThemedText style={styles.statText}>{workoutDays} Workout Days</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol name="clock.arrow.circlepath" size={14} color={theme.icon} style={{ opacity: 0.6 }} />
              <ThemedText style={styles.statText}>
                Created {new Date(item.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={16} color={theme.icon} style={{ opacity: 0.3 }} />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greetingText}>Optimize your</ThemedText>
          <ThemedText style={styles.headerTitle}>Training Plans</ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/plans/create' as any)}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading && plans.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refreshPlans}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.tint + '05' }]}>
                <IconSymbol name="calendar.badge.plus" size={32} color={theme.tint} />
              </View>
              <ThemedText style={styles.emptyText}>No plans found</ThemedText>
              <ThemedText style={styles.emptySubText}>Create your first custom workout plan to start tracking your progress.</ThemedText>
              <TouchableOpacity 
                style={[styles.emptyAction, { backgroundColor: theme.tint }]}
                onPress={() => router.push('/plans/create' as any)}
              >
                <ThemedText style={styles.emptyActionText}>Create New Plan</ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    opacity: 0.6,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  filterSection: {
    paddingBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C9AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  planInfo: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
