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
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
          borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
          <IconSymbol name="chevron.right" size={14} color={theme.icon} style={{ opacity: 0.3 }} />
        </View>

        <View style={styles.metaRow}>
          {muscleGroups && muscleGroups.length > 0 && (
            <View style={[styles.muscleBadge, { backgroundColor: theme.tint + '10' }]}>
              <ThemedText style={[styles.muscleText, { color: theme.tint }]}>{muscleGroups[0].name}</ThemedText>
            </View>
          )}
          {overview ? (
            <ThemedText numberOfLines={2} style={styles.exerciseOverview}>{overview}</ThemedText>
          ) : (
            <ThemedText style={[styles.exerciseOverview, { fontStyle: 'italic' }]}>No description available</ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    gap: 16,
    borderWidth: 1,
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9F9FB',
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
  },
  exerciseInfo: {
    flex: 1,
    height: 80,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    gap: 6,
  },
  muscleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  muscleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseOverview: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.5,
  },
  chevronContainer: {
    display: 'none', // Removed in favor of chevron in title row
  },
});
