import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header, HeaderButton } from '../components/Header';
import { confirmDestructive } from '../confirm';
import { todayKey } from '../dates';
import { secondaryLines, titleOf, type Tasbeeh, type TasbeehStore } from '../store';
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
    confirmDestructive('Delete tasbeeh?', `"${titleOf(tasbeeh)}" and all of its history will be deleted.`, 'Delete', () =>
      store.removeTasbeeh(tasbeeh.id),
    );
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
              <Text style={styles.text}>{titleOf(item)}</Text>
              {secondaryLines(item).map((line) => (
                <Text key={line} style={styles.secondary} numberOfLines={2}>
                  {line}
                </Text>
              ))}
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
  secondary: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  today: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
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
