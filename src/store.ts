import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { todayKey } from './dates';
import { DEFAULT_TASBEEHS } from './defaults';

/** The three ways a tasbeeh can be written. Any of them may be empty, but not all. */
export type TasbeehFields = {
  /** Arabic text. */
  text: string;
  transliteration?: string;
  translation?: string;
};

export type Tasbeeh = TasbeehFields & { id: string };

/** Count per day ("YYYY-MM-DD") for one tasbeeh. */
export type DayCounts = Record<string, number>;

type Data = {
  tasbeehs: Tasbeeh[];
  counts: Record<string, DayCounts>;
  activeId: string | null;
  /** Version of the default list this data was last seeded from. */
  seedVersion?: number;
};

const STORAGE_KEY = 'tasbeeh:data:v1';
const SEED_VERSION = 2;

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Arabic text without harakat, for comparing and measuring. */
export function stripMarks(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The main line to show for a tasbeeh: Arabic if present, otherwise whichever form was typed. */
export function titleOf(t: TasbeehFields): string {
  return t.text || t.transliteration || t.translation || '';
}

/** The remaining forms, shown under the title. */
export function secondaryLines(t: TasbeehFields): string[] {
  const title = titleOf(t);
  return [t.transliteration, t.translation].filter((line): line is string => !!line && line !== title);
}

function seed(): Data {
  const tasbeehs = DEFAULT_TASBEEHS.map((fields) => ({ id: newId(), ...fields }));
  return { tasbeehs, counts: {}, activeId: tasbeehs[0].id, seedVersion: SEED_VERSION };
}

/** Brings data saved by an older version up to the current default list, keeping ids and counts. */
function migrate(data: Data): Data {
  if ((data.seedVersion ?? 1) >= SEED_VERSION) return data;
  const tasbeehs = data.tasbeehs.map((t) => ({ ...t }));
  for (const fields of DEFAULT_TASBEEHS) {
    const existing = tasbeehs.find((t) => stripMarks(t.text) === stripMarks(fields.text));
    if (existing) {
      existing.text = fields.text;
      existing.transliteration ||= fields.transliteration;
      existing.translation ||= fields.translation;
    } else {
      tasbeehs.push({ id: newId(), ...fields });
    }
  }
  return { ...data, tasbeehs, seedVersion: SEED_VERSION };
}

export function useTasbeehStore() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setData(raw ? migrate(JSON.parse(raw) as Data) : seed()))
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
    (fields: TasbeehFields) => {
      const tasbeeh = { id: newId(), ...fields };
      update((d) => ({ ...d, tasbeehs: [...d.tasbeehs, tasbeeh], activeId: tasbeeh.id }));
    },
    [update],
  );

  const editTasbeeh = useCallback(
    (id: string, fields: TasbeehFields) => {
      update((d) => ({ ...d, tasbeehs: d.tasbeehs.map((t) => (t.id === id ? { id, ...fields } : t)) }));
    },
    [update],
  );

  const removeTasbeeh = useCallback(
    (id: string) => {
      update((d) => {
        const tasbeehs = d.tasbeehs.filter((t) => t.id !== id);
        const { [id]: _removed, ...counts } = d.counts;
        const activeId = d.activeId === id ? (tasbeehs[0]?.id ?? null) : d.activeId;
        return { ...d, tasbeehs, counts, activeId };
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
