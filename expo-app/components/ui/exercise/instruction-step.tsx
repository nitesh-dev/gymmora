import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../../themed-text';

interface InstructionStepProps {
  stepNumber: number;
  text: string;
}

export function InstructionStep({ stepNumber, text }: InstructionStepProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNumberContainer, { backgroundColor: theme.tint }]}>
        <ThemedText style={styles.stepNumber}>{stepNumber}</ThemedText>
      </View>
      <ThemedText style={styles.stepText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
