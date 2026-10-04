import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dateKey, HISTORY_DAYS, lastNDays, WEEKDAYS } from '../dates';
import type { DayCounts } from '../store';
import { colors, heatLevels } from '../theme';

const CELL = 38;
const GAP = 5;
// Weeks run Saturday → Friday.
const WEEK_START = 6;

type Props = {
  counts: DayCounts;
  selectedKey: string;
  onSelect: (key: string) => void;
};

function level(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

export function Heatmap({ counts, selectedKey, onSelect }: Props) {
  const days = lastNDays(HISTORY_DAYS);
  const max = Math.max(0, ...days.map((d) => counts[dateKey(d)] ?? 0));

  // One column per week, one row per weekday; pad so the first day lands on its weekday row.
  const offset = (days[0].getDay() - WEEK_START + 7) % 7;
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View>
      <View style={styles.grid}>
        <View style={styles.column}>
          {Array.from({ length: 7 }, (_, row) => (
            <View key={row} style={styles.weekdayCell}>
              <Text style={styles.weekday}>{WEEKDAYS[(WEEK_START + row) % 7]}</Text>
            </View>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={w} style={styles.column}>
            {week.map((day, row) => {
              if (!day) return <View key={row} style={styles.cell} />;
              const key = dateKey(day);
              const lvl = level(counts[key] ?? 0, max);
              return (
                <Pressable
                  key={row}
                  onPress={() => onSelect(key)}
                  style={[
                    styles.cell,
                    { backgroundColor: heatLevels[lvl] },
                    key === selectedKey && styles.selected,
                  ]}
                >
                  <Text style={[styles.dayNumber, lvl >= 3 && styles.dayNumberOnBright]}>
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {heatLevels.map((color) => (
          <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP,
  },
  column: {
    gap: GAP,
  },
  weekdayCell: {
    height: CELL,
    justifyContent: 'center',
    paddingRight: 4,
  },
  weekday: {
    color: colors.textMuted,
    fontSize: 11,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
  dayNumber: {
    color: colors.textMuted,
    fontSize: 12,
  },
  dayNumberOnBright: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 11,
    marginHorizontal: 4,
  },
});
