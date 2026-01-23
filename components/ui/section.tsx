import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';

import { IconSymbol, IconSymbolName } from './icon-symbol';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  icon?: IconSymbolName;
}

export function Section({ title, children, style, icon }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        {icon && <IconSymbol name={icon} size={18} color="#2C9AFF" style={styles.icon} />}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
