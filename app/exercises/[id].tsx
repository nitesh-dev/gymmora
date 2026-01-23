import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InstructionStep } from '@/components/ui/exercise/instruction-step';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Section } from '@/components/ui/section';
import { Tag } from '@/components/ui/tag';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExerciseDetailViewModel } from '@/view-models/use-exercise-detail-view-model';

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { exercise, isLoading } = useExerciseDetailViewModel(Number(id));

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
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.headerCircleButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
              <IconSymbol name="chevron.left" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }} 
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

        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>{exercise.title}</ThemedText>
          
          <View style={styles.tagsContainer}>
            {exercise.muscleGroups?.map((mg: any) => (
              <Tag key={mg.id} label={mg.name} type="primary" />
            ))}
            {exercise.equipment?.map((e: any) => (
              <Tag key={e.id} label={e.name} />
            ))}
          </View>

          <ThemedText style={styles.overview}>{exercise.overview}</ThemedText>

          <Section title="Instructions">
            {exercise.content
              ?.filter((c: any) => c.contentType === 'step')
              .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
              .map((c: any) => (
                <InstructionStep 
                  key={c.id} 
                  stepNumber={c.orderIndex + 1} 
                  text={c.contentText} 
                />
              ))}
          </Section>

          {exercise.musclesWorked && exercise.musclesWorked.length > 0 && (
            <Section title="Muscles Targeted">
              <View style={styles.musclesGrid}>
                {exercise.musclesWorked.map((m: any) => (
                  <ProgressBar 
                    key={m.id} 
                    progress={m.percentage} 
                    label={m.name} 
                  />
                ))}
              </View>
            </Section>
          )}

          {exercise.variations && exercise.variations.length > 0 && (
            <Section title="Variations">
              {exercise.variations.map((v: any) => (
                <TouchableOpacity 
                  key={v.variation.id} 
                  style={[styles.variationCard, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' }]}
                  onPress={() => router.push({ pathname: '/exercises/[id]', params: { id: v.variation.id } })}
                >
                  <ThemedText style={styles.variationName}>{v.variation.title}</ThemedText>
                  <IconSymbol name="chevron.right" size={16} color={theme.icon} />
                </TouchableOpacity>
              ))}
            </Section>
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
  headerCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mediaContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    width: '100%',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.rounded,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  overview: {
    lineHeight: 22,
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 24,
  },
  musclesGrid: {
    gap: 16,
  },
  variationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  variationName: {
    fontSize: 15,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 16,
    padding: 10,
  },
});
