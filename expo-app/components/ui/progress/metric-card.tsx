import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../themed-text';
import { ThemedView } from '../../themed-view';
import { IconSymbol, IconSymbolName } from '../icon-symbol';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconSymbolName;
  color: string;
}

export function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={styles.value} type="defaultSemiBold">
        {value}
      </ThemedText>
      <ThemedText style={styles.label}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    opacity: 0.6,
    marginTop: 2,
    fontSize: 12,
    textAlign: 'center',
  },
});
