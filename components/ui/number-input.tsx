import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: any;
}

export function NumberInput({ label, value, onChangeText, containerStyle }: NumberInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        keyboardType="numeric"
        style={[
          styles.input,
          { 
            color: theme.text, 
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: theme.border,
            borderWidth: 1.5,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        maxLength={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    minWidth: 32,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    height: 30,
    borderRadius: 6,
  },
});
