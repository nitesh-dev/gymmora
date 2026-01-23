import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../themed-text';
import { IconSymbol } from '../icon-symbol';

interface ExerciseCardProps {
  title: string;
  overview?: string;
  gifUrl?: string | null;
  onPress: () => void;
  muscleGroups?: { name: string }[];
}

export function ExerciseCard({ title, overview, gifUrl, onPress, muscleGroups }: ExerciseCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[
        styles.exerciseCard, 
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {gifUrl ? (
          <Image source={{ uri: gifUrl }} style={styles.exerciseImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <IconSymbol name="dumbbell.fill" size={24} color={theme.icon} />
          </View>
        )}
      </View>
      
      <View style={styles.exerciseInfo}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseTitle} numberOfLines={1}>{title}</ThemedText>
          <View style={styles.chevronWrapper}>
            <IconSymbol name="chevron.right" size={12} color={theme.icon} style={{ opacity: 0.3 }} />
          </View>
        </View>

        <View style={styles.metaRow}>
          {muscleGroups && muscleGroups.length > 0 && (
            <View style={[styles.muscleBadge, { backgroundColor: theme.tint + '15' }]}>
              <ThemedText style={[styles.muscleText, { color: theme.tint }]}>{muscleGroups[0].name.toUpperCase()}</ThemedText>
            </View>
          )}
          <ThemedText numberOfLines={2} style={styles.exerciseOverview}>
            {overview || 'No description provided for this exercise.'}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff', // White background for GIFs
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
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  exerciseInfo: {
    flex: 1,
    // height: 72,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  chevronWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  muscleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  exerciseOverview: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.5,
  },
});
