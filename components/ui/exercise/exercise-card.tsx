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
}

export function ExerciseCard({ title, overview, gifUrl, onPress }: ExerciseCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[styles.exerciseCard, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' }]}
      onPress={onPress}
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
        <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>{title}</ThemedText>
        <ThemedText numberOfLines={1} style={styles.exerciseOverview}>{overview}</ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={theme.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  exerciseTitle: {
    fontSize: 16,
  },
  exerciseOverview: {
    fontSize: 13,
    opacity: 0.6,
  },
});
