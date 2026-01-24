import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomHeader } from '@/components/ui/custom-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlansViewModel } from '@/view-models/use-plans-view-model';

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { plans, isLoading, refreshPlans, importPlans, exportAllPlans, getTemplate } = usePlansViewModel();

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      
      await importPlans(content);
      Alert.alert('Success', 'Plans imported successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to import plans');
    }
  };

  const handleExportAll = async () => {
    try {
      const jsonContent = await exportAllPlans();
      const fileName = `gymmora_plans_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonContent);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export All Custom Plans',
        UTI: 'public.json',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export plans');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const template = getTemplate();
      const fileName = 'gymmora_plan_template.json';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, template);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Download Plan Template',
        UTI: 'public.json',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate template');
    }
  };

  const showManagementMenu = () => {
    Alert.alert(
      'Manage Plans',
      'Select an action',
      [
        { text: 'Import Plans', onPress: handleImport },
        { text: 'Export All Custom Plans', onPress: handleExportAll },
        { text: 'Download Template', onPress: handleDownloadTemplate },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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
        
        <View style={styles.cardActions}>
          <IconSymbol name="chevron.right" size={16} color={theme.icon} style={{ opacity: 0.3 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <CustomHeader 
        title="Training Plans" 
        showBackButton={false}
        alignTitle="left"
        variant="rounded"
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={showManagementMenu}
            >
              <IconSymbol name="ellipsis" size={24} color={theme.icon} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: theme.tint }]}
              onPress={() => router.push('/plans/create' as any)}
            >
              <IconSymbol name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
