import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '../components/Header';
import { Heatmap } from '../components/Heatmap';
import { dateKey, formatDay, HISTORY_DAYS, lastNDays, todayKey } from '../dates';
import type { DayCounts, Tasbeeh } from '../store';
import { colors } from '../theme';

type Props = {
  tasbeeh: Tasbeeh;
  counts: DayCounts;
  onBack: () => void;
};

export function HistoryScreen({ tasbeeh, counts, onBack }: Props) {
  const [selectedKey, setSelectedKey] = useState(todayKey());

  const days = lastNDays(HISTORY_DAYS).map((date) => {
    const key = dateKey(date);
    return { key, date, count: counts[key] ?? 0 };
  });
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const best = Math.max(...days.map((d) => d.count));
  const selected = days.find((d) => d.key === selectedKey) ?? days[days.length - 1];

  return (
    <View style={styles.screen}>
      <Header title="History" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.tasbeehText}>{tasbeeh.text}</Text>
        <Text style={styles.subtitle}>Last {HISTORY_DAYS} days</Text>

        <View style={styles.stats}>
          <Stat label="Total" value={total} />
          <Stat label="Active days" value={activeDays} />
          <Stat label="Best day" value={best} />
        </View>

        <View style={styles.panel}>
          <Heatmap counts={counts} selectedKey={selected.key} onSelect={setSelectedKey} />
          <View style={styles.selectedRow}>
            <Text style={styles.selectedDate}>{formatDay(selected.date)}</Text>
            <Text style={styles.selectedCount}>{selected.count}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Day by day</Text>
        <View style={styles.panel}>
          {[...days].reverse().map((d, i) => (
            <View key={d.key} style={[styles.dayRow, i > 0 && styles.dayRowBorder]}>
              <Text style={[styles.dayDate, d.count === 0 && styles.dim]}>
                {d.key === todayKey() ? 'Today' : formatDay(d.date)}
              </Text>
              <Text style={[styles.dayCount, d.count === 0 && styles.dim]}>{d.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  dayRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  dayDate: {
    color: colors.text,
    fontSize: 15,
  },
  dayCount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dim: {
    color: colors.textMuted,
    opacity: 0.6,
    fontWeight: '400',
  },
});
