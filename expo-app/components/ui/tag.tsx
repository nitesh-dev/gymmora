import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface TagProps {
  label: string;
  type?: 'primary' | 'secondary';
}

export function Tag({ label, type = 'secondary' }: TagProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const backgroundColor = type === 'primary' 
    ? theme.tint + '15' 
    : (colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA');
    
  const textColor = type === 'primary' ? theme.tint : theme.text;

  return (
    <View style={[styles.tag, { backgroundColor }]}>
      <ThemedText style={[styles.tagText, { color: textColor }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
