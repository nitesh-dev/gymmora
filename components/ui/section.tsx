import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Section({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
});
