import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: active ? theme.tint : 'rgba(255,255,255,0.04)',
          borderColor: active ? theme.tint : 'rgba(255,255,255,0.06)',
          borderWidth: 1,
        }
      ]}
    >
      <ThemedText style={[
        styles.chipText, 
        { 
          color: active ? '#FFFFFF' : theme.text,
          opacity: active ? 1 : 0.6,
          fontWeight: active ? '700' : '500'
        }
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
  },
});
