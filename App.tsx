import { StatusBar } from 'expo-status-bar';
import { useEffect, useReducer, useState } from 'react';
import { AppState, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { CounterScreen } from './src/screens/CounterScreen';
import { FormScreen } from './src/screens/FormScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ListScreen } from './src/screens/ListScreen';
import { useTasbeehStore, type Tasbeeh } from './src/store';
import { colors } from './src/theme';

type Screen =
  | { name: 'counter' }
  | { name: 'history'; tasbeehId: string | null }
  | { name: 'list' }
  | { name: 'form'; editing?: Tasbeeh; returnTo: 'counter' | 'list' };

function Root() {
  const store = useTasbeehStore();
  const [screen, setScreen] = useState<Screen>({ name: 'counter' });
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  const goBack = () => {
    setScreen((s) => (s.name === 'form' ? { name: s.returnTo } : { name: 'counter' }));
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'counter') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [screen.name]);

  // Re-render when the app comes back to the foreground so "today" rolls over after midnight.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, []);

  if (!store.loaded) return null;

  if (screen.name === 'history') {
    return (
      <HistoryScreen tasbeehs={store.tasbeehs} counts={store.counts} initialId={screen.tasbeehId} onBack={goBack} />
    );
  }

  if (screen.name === 'list') {
    return (
      <ListScreen
        store={store}
        onBack={goBack}
        onAdd={() => setScreen({ name: 'form', returnTo: 'list' })}
        onEdit={(editing) => setScreen({ name: 'form', editing, returnTo: 'list' })}
      />
    );
  }

  if (screen.name === 'form') {
    const { editing } = screen;
    return (
      <FormScreen
        initial={editing}
        onCancel={goBack}
        onSave={(fields) => {
          if (editing) store.editTasbeeh(editing.id, fields);
          else store.addTasbeeh(fields);
          goBack();
        }}
      />
    );
  }

  return (
    <CounterScreen
      store={store}
      onOpenHistory={(tasbeehId) => setScreen({ name: 'history', tasbeehId })}
      onOpenList={() => setScreen({ name: 'list' })}
      onAdd={() => setScreen({ name: 'form', returnTo: 'counter' })}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Root />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
