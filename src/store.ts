import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { todayKey } from './dates';

export type Tasbeeh = { id: string; text: string };

/** Count per day ("YYYY-MM-DD") for one tasbeeh. */
export type DayCounts = Record<string, number>;

type Data = {
  tasbeehs: Tasbeeh[];
  counts: Record<string, DayCounts>;
  activeId: string | null;
};

const STORAGE_KEY = 'tasbeeh:data:v1';

const DEFAULT_TEXTS = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله'];

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function seed(): Data {
  const tasbeehs = DEFAULT_TEXTS.map((text) => ({ id: newId(), text }));
  return { tasbeehs, counts: {}, activeId: tasbeehs[0].id };
}

export function useTasbeehStore() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setData(raw ? (JSON.parse(raw) as Data) : seed()))
      .catch(() => setData(seed()));
  }, []);

  useEffect(() => {
    if (data) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const update = useCallback((fn: (d: Data) => Data) => {
    setData((d) => (d ? fn(d) : d));
  }, []);

  const setTodayCount = useCallback(
    (id: string, fn: (current: number) => number) => {
      update((d) => {
        const key = todayKey();
        const days = d.counts[id] ?? {};
        const next = Math.max(0, fn(days[key] ?? 0));
        return { ...d, counts: { ...d.counts, [id]: { ...days, [key]: next } } };
      });
    },
    [update],
  );

  const increment = useCallback((id: string) => setTodayCount(id, (c) => c + 1), [setTodayCount]);
  const decrement = useCallback((id: string) => setTodayCount(id, (c) => c - 1), [setTodayCount]);
  const resetToday = useCallback((id: string) => setTodayCount(id, () => 0), [setTodayCount]);

  const setActive = useCallback((id: string) => update((d) => ({ ...d, activeId: id })), [update]);

  const addTasbeeh = useCallback(
    (text: string) => {
      const tasbeeh = { id: newId(), text };
      update((d) => ({ ...d, tasbeehs: [...d.tasbeehs, tasbeeh], activeId: tasbeeh.id }));
    },
    [update],
  );

  const editTasbeeh = useCallback(
    (id: string, text: string) => {
      update((d) => ({ ...d, tasbeehs: d.tasbeehs.map((t) => (t.id === id ? { ...t, text } : t)) }));
    },
    [update],
  );

  const removeTasbeeh = useCallback(
    (id: string) => {
      update((d) => {
        const tasbeehs = d.tasbeehs.filter((t) => t.id !== id);
        const { [id]: _removed, ...counts } = d.counts;
        const activeId = d.activeId === id ? (tasbeehs[0]?.id ?? null) : d.activeId;
        return { tasbeehs, counts, activeId };
      });
    },
    [update],
  );

  return {
    loaded: data !== null,
    tasbeehs: data?.tasbeehs ?? [],
    counts: data?.counts ?? {},
    activeId: data?.activeId ?? null,
    increment,
    decrement,
    resetToday,
    setActive,
    addTasbeeh,
    editTasbeeh,
    removeTasbeeh,
  };
}

export type TasbeehStore = ReturnType<typeof useTasbeehStore>;
