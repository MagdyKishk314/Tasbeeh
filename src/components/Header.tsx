import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function Header({ title, onBack, right }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export function HeaderButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  back: {
    paddingRight: 8,
  },
  backText: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
