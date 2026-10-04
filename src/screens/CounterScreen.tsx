import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Header, HeaderButton } from '../components/Header';
import { dateKey, HISTORY_DAYS, lastNDays, todayKey } from '../dates';
import type { TasbeehStore } from '../store';
import { colors } from '../theme';

type Props = {
  store: TasbeehStore;
  onOpenHistory: () => void;
  onOpenList: () => void;
  onAdd: () => void;
};

const SWIPE_DISTANCE = 50;

export function CounterScreen({ store, onOpenHistory, onOpenList, onAdd }: Props) {
  const { tasbeehs, counts, activeId, setActive } = store;
  const { width } = useWindowDimensions();
  const index = tasbeehs.findIndex((t) => t.id === activeId);
  const active = tasbeehs[index];

  const step = (delta: number) => {
    if (tasbeehs.length < 2 || index < 0) return;
    setActive(tasbeehs[(index + delta + tasbeehs.length) % tasbeehs.length].id);
  };

  // Swipe the tasbeeh card sideways to switch, in addition to the arrows.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderRelease: (_, g) => {
          if (g.dx <= -SWIPE_DISTANCE) step(1);
          else if (g.dx >= SWIPE_DISTANCE) step(-1);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, tasbeehs],
  );

  if (!active) {
    return (
      <View style={styles.screen}>
        <Header title="Tasbeeh" />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tasbeeh yet</Text>
          <Pressable onPress={onAdd} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>+ Add tasbeeh</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const days = counts[active.id] ?? {};
  const today = days[todayKey()] ?? 0;
  const monthTotal = lastNDays(HISTORY_DAYS).reduce((sum, d) => sum + (days[dateKey(d)] ?? 0), 0);
  const circle = Math.min(width * 0.62, 280);

  const count = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    store.increment(active.id);
  };

  const confirmReset = () => {
    Alert.alert('Reset today?', `Today's count for "${active.text}" will go back to 0.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => store.resetToday(active.id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header
        title="Tasbeeh"
        right={
          <>
            <HeaderButton label="History" onPress={onOpenHistory} />
            <HeaderButton label="List" onPress={onOpenList} />
          </>
        }
      />

      <View style={styles.card} {...pan.panHandlers}>
        <Pressable onPress={() => step(-1)} hitSlop={12} disabled={tasbeehs.length < 2}>
          <Text style={[styles.arrow, tasbeehs.length < 2 && styles.arrowDisabled]}>‹</Text>
        </Pressable>
        <View style={styles.cardBody}>
          <Text style={styles.tasbeehText} numberOfLines={3} adjustsFontSizeToFit>
            {active.text}
          </Text>
          <Text style={styles.position}>
            {index + 1} / {tasbeehs.length}
          </Text>
        </View>
        <Pressable onPress={() => step(1)} hitSlop={12} disabled={tasbeehs.length < 2}>
          <Text style={[styles.arrow, tasbeehs.length < 2 && styles.arrowDisabled]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.counterArea}>
        <Pressable
          onPress={count}
          style={({ pressed }) => [
            styles.circle,
            { width: circle, height: circle, borderRadius: circle / 2 },
            pressed && styles.circlePressed,
          ]}
        >
          <Text style={styles.count} numberOfLines={1} adjustsFontSizeToFit>
            {today}
          </Text>
          <Text style={styles.countLabel}>today · tap to count</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={() => store.decrement(active.id)}
            disabled={today === 0}
            style={({ pressed }) => [styles.action, (pressed || today === 0) && styles.pressed]}
          >
            <Text style={styles.actionText}>− Undo</Text>
          </Pressable>
          <Pressable
            onPress={confirmReset}
            disabled={today === 0}
            style={({ pressed }) => [styles.action, (pressed || today === 0) && styles.pressed]}
          >
            <Text style={styles.actionText}>Reset today</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={onOpenHistory} style={({ pressed }) => [styles.summary, pressed && styles.pressed]}>
        <Text style={styles.summaryLabel}>Last {HISTORY_DAYS} days</Text>
        <Text style={styles.summaryValue}>{monthTotal}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.accentDark,
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 20,
    minHeight: 150,
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tasbeehText: {
    color: colors.gold,
    fontSize: 32,
    lineHeight: 50,
    fontWeight: '600',
    textAlign: 'center',
  },
  position: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  arrow: {
    color: colors.accent,
    fontSize: 44,
    lineHeight: 48,
    paddingHorizontal: 6,
  },
  arrowDisabled: {
    opacity: 0.25,
  },
  counterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 4,
    borderColor: colors.accent,
    paddingHorizontal: 24,
  },
  circlePressed: {
    backgroundColor: colors.border,
    transform: [{ scale: 0.97 }],
  },
  count: {
    color: colors.text,
    fontSize: 80,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.5,
  },
});
