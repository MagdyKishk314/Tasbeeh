import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '../components/Header';
import { Heatmap } from '../components/Heatmap';
import { dateKey, formatDay, HISTORY_DAYS, lastNDays, todayKey } from '../dates';
import { titleOf, type DayCounts, type Tasbeeh } from '../store';
import { colors } from '../theme';

type Props = {
  tasbeehs: Tasbeeh[];
  counts: Record<string, DayCounts>;
  /** Tasbeeh to show first; null shows all tasbeehat combined. */
  initialId: string | null;
  onBack: () => void;
};

export function HistoryScreen({ tasbeehs, counts, initialId, onBack }: Props) {
  const [filterId, setFilterId] = useState(initialId);
  const [selectedKey, setSelectedKey] = useState(todayKey());

  const filtered = tasbeehs.find((t) => t.id === filterId);
  const shown = filtered ? [filtered] : tasbeehs;

  // Per-day totals across the shown tasbeehat.
  const totals: DayCounts = {};
  for (const t of shown) {
    for (const [key, count] of Object.entries(counts[t.id] ?? {})) {
      totals[key] = (totals[key] ?? 0) + count;
    }
  }

  const days = lastNDays(HISTORY_DAYS).map((date) => {
    const key = dateKey(date);
    return { key, date, count: totals[key] ?? 0 };
  });
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const best = Math.max(...days.map((d) => d.count));
  const selected = days.find((d) => d.key === selectedKey) ?? days[days.length - 1];
  const breakdown = filtered
    ? []
    : tasbeehs
        .map((t) => ({ tasbeeh: t, count: counts[t.id]?.[selected.key] ?? 0 }))
        .filter((b) => b.count > 0);

  return (
    <View style={styles.screen}>
      <Header title="History" onBack={onBack} />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={!filtered} onPress={() => setFilterId(null)} />
          {tasbeehs.map((t) => (
            <Chip key={t.id} label={titleOf(t)} active={t.id === filtered?.id} onPress={() => setFilterId(t.id)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.tasbeehText}>{filtered ? titleOf(filtered) : 'All tasbeehat'}</Text>
        <Text style={styles.subtitle}>Last {HISTORY_DAYS} days</Text>

        <View style={styles.stats}>
          <Stat label="Total" value={total} />
          <Stat label="Active days" value={activeDays} />
          <Stat label="Best day" value={best} />
        </View>

        <View style={styles.panel}>
          <Heatmap counts={totals} selectedKey={selected.key} onSelect={setSelectedKey} />
          <View style={styles.selectedRow}>
            <Text style={styles.selectedDate}>{formatDay(selected.date)}</Text>
            <Text style={styles.selectedCount}>{selected.count}</Text>
          </View>
          {breakdown.map((b) => (
            <View key={b.tasbeeh.id} style={styles.breakdownRow}>
              <Text style={styles.breakdownText} numberOfLines={1}>
                {titleOf(b.tasbeeh)}
              </Text>
              <Text style={styles.breakdownCount}>{b.count}</Text>
            </View>
          ))}
          {selected.count === 0 && <Text style={styles.noneText}>No tasbeeh on this day</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    maxWidth: 200,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.accent,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tasbeehText: {
    color: colors.gold,
    fontSize: 26,
    lineHeight: 42,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
  },
  statValue: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 12,
  },
  selectedDate: {
    color: colors.text,
    fontSize: 15,
  },
  selectedCount: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  breakdownText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'left',
  },
  breakdownCount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  noneText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});
