import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';

interface SelectProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  onSelect: (value: any) => void;
  containerStyle?: any;
}

export function Select({ label, value, options, onSelect, containerStyle }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity 
        style={[
          styles.trigger, 
          { 
            borderColor: theme.border, 
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1.5,
          }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <ThemedText style={[styles.value, { color: theme.text }]}>{value}</ThemedText>
        <IconSymbol name="chevron.down" size={10} color={theme.icon} style={{ opacity: 0.4 }} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>{label}</ThemedText>
            <View style={styles.optionsGrid}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.toString()}
                  style={[
                    styles.option,
                    { borderColor: theme.border },
                    value.toString() === opt.toString() && { 
                      backgroundColor: theme.tint, 
                      borderColor: theme.tint 
                    }
                  ]}
                  onPress={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    { color: theme.text },
                    value.toString() === opt.toString() && { color: '#FFFFFF', fontWeight: '900' }
                  ]}>
                    {opt}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
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
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '900',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  option: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
