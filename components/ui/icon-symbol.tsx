import { CalendarPlus, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Code2, Dumbbell, History, Home, Pencil, Plus, Search, Send, Trash2, User, X, Zap } from 'lucide-react-native';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

/**
 * An icon component that uses Lucide icons for a consistent tactical look across platforms.
 */
const MAPPING = {
  'house.fill': Home,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code2,
  'chevron.right': ChevronRight,
  'chevron.left': ChevronLeft,
  'chevron.down': ChevronDown,
  'dumbbell.fill': Dumbbell,
  'calendar.badge.plus': CalendarPlus,
  'clock.arrow.circlepath': History,
  'magnifyingglass': Search,
  'bolt.fill': Zap,
  'checkmark.circle.fill': CheckCircle2,
  'person.fill': User,
  'plus': Plus,
  'trash.fill': Trash2,
  'multiply': X,
  'pencil.fill': Pencil,
} as const;

export type IconSymbolName = keyof typeof MAPPING;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: any; // Kept for compatibility with existing code
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: IconSymbolProps) {
  const Icon = MAPPING[name];
  if (!Icon) return null;
  return <Icon color={color as string} size={size} style={style} />;
}
