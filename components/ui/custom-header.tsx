import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  alignTitle?: 'center' | 'left';
  variant?: 'normal' | 'rounded';
}

export function CustomHeader({ 
  title, 
  showBackButton = true, 
  onBackPress, 
  rightAction, 
  transparent = false,
  style,
  children,
  alignTitle = 'center',
  variant = 'normal'
}: CustomHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const isRounded = variant === 'rounded';

  return (
    <>
      <StatusBar style={transparent ? 'light' : 'auto'} />
      <View style={[
        styles.container, 
        { paddingTop: insets.top + (isRounded ? 4 : 8) },
        !transparent && !isRounded && { 
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        !transparent && isRounded && {
          backgroundColor: theme.card,
          borderBottomRightRadius: 24,
          borderBottomLeftRadius: 24,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          borderLeftWidth: 1,
          borderLeftColor: theme.border,
          borderRightWidth: 1,
          borderRightColor: theme.border,
        },
        style
      ]}>
        <View style={styles.content}>
          <View style={styles.leftContainer}>
            {showBackButton && (
              <TouchableOpacity 
                onPress={handleBack} 
                style={[
                  styles.backButton, 
                  transparent ? styles.transparentButton : { backgroundColor: isRounded ? theme.background : theme.card, borderColor: theme.border }
                ]}
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name="chevron.left" 
                  size={22} 
                  color={transparent ? "#FFFFFF" : theme.text} 
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={[
            styles.titleContainer, 
            alignTitle === 'left' && styles.titleContainerLeft,
            !showBackButton && alignTitle === 'left' && { paddingLeft: 16 }
          ]} pointerEvents="none">
            {title && (
              <ThemedText style={[
                styles.title, 
                alignTitle === 'left' && styles.titleLeft,
                transparent && { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
              ]} numberOfLines={1}>
                {title}
              </ThemedText>
            )}
          </View>

          <View style={styles.rightContainer}>
            {rightAction}
          </View>
        </View>
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',

  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 10,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 60,
  },
  titleContainerLeft: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 64, // Space for back button if present
    paddingRight: 60,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  childrenContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  titleLeft: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  transparentButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
});
