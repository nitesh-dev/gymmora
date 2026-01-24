import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../themed-text';
import { IconSymbol } from '../icon-symbol';

interface ExerciseSelectionCardProps {
  title: string;
  muscleGroups?: { name: string }[];
  gifUrl?: string | null;
  onAdd: () => void;
  isSelected?: boolean;
}

export function ExerciseSelectionCard({ title, muscleGroups, gifUrl, onAdd, isSelected }: ExerciseSelectionCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.card,
          borderColor: isSelected ? theme.tint : theme.border,
        }
      ]}
    >
      <View style={styles.imageContainer}>
        {gifUrl ? (
          <Image source={{ uri: gifUrl }} style={styles.exerciseImage} contentFit="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.border + '20' }]}>
            <IconSymbol name="dumbbell.fill" size={20} color={theme.icon} />
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
        {muscleGroups && muscleGroups.length > 0 && (
          <View style={[styles.muscleBadge, { backgroundColor: theme.tint + '10' }]}>
            <ThemedText style={[styles.muscleText, { color: theme.tint }]}>
              {muscleGroups[0].name.toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.addButton, 
          { backgroundColor: isSelected ? '#FF3B3015' : 'rgba(255,255,255,0.05)' }
        ]}
        onPress={onAdd}
      >
        <IconSymbol 
          name={isSelected ? "multiply" : "plus"} 
          size={isSelected ? 16 : 20} 
          color={isSelected ? "#FF3B30" : theme.tint} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
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
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  muscleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
