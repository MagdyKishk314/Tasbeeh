import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header, HeaderButton } from '../components/Header';
import { todayKey } from '../dates';
import type { Tasbeeh, TasbeehStore } from '../store';
import { colors } from '../theme';

type Props = {
  store: TasbeehStore;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (tasbeeh: Tasbeeh) => void;
};

export function ListScreen({ store, onBack, onAdd, onEdit }: Props) {
  const { tasbeehs, counts, activeId } = store;
  const today = todayKey();

  const select = (id: string) => {
    store.setActive(id);
    onBack();
  };

  const confirmDelete = (tasbeeh: Tasbeeh) => {
    Alert.alert('Delete tasbeeh?', `"${tasbeeh.text}" and all of its history will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => store.removeTasbeeh(tasbeeh.id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header title="My tasbeeh" onBack={onBack} right={<HeaderButton label="+ Add" onPress={onAdd} />} />
      <FlatList
        data={tasbeehs}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tasbeeh yet. Tap “+ Add” to create one.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => select(item.id)}
            style={({ pressed }) => [styles.row, item.id === activeId && styles.rowActive, pressed && styles.pressed]}
          >
            <View style={styles.rowBody}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.today}>Today: {counts[item.id]?.[today] ?? 0}</Text>
            </View>
            <Pressable onPress={() => onEdit(item)} hitSlop={8} style={styles.rowButton}>
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => confirmDelete(item)} hitSlop={8} style={styles.rowButton}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 14,
    gap: 6,
  },
  rowActive: {
    borderColor: colors.accent,
  },
  rowBody: {
    flex: 1,
  },
  text: {
    color: colors.gold,
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
  },
  today: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  rowButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  edit: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  delete: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
