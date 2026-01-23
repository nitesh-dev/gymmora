import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <ThemedText style={styles.label}>{label}</ThemedText>}
          {showPercentage && <ThemedText style={styles.percentage}>{progress}%</ThemedText>}
        </View>
      )}
      <View style={styles.background}>
        <View style={[styles.foreground, { width: `${progress}%`, backgroundColor: theme.tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  background: {
    height: 6,
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  foreground: {
    height: '100%',
    borderRadius: 3,
  },
});
