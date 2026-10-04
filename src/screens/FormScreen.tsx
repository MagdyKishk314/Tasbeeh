import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '../components/Header';
import { colors } from '../theme';

type Props = {
  /** Existing text when editing; omitted when adding. */
  initialText?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
};

export function FormScreen({ initialText, onSave, onCancel }: Props) {
  const [text, setText] = useState(initialText ?? '');
  const trimmed = text.trim();

  return (
    <View style={styles.screen}>
      <Header title={initialText === undefined ? 'New tasbeeh' : 'Edit tasbeeh'} onBack={onCancel} />
      <View style={styles.content}>
        <Text style={styles.label}>Tasbeeh text</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="سبحان الله وبحمده"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          autoFocus
          maxLength={200}
        />
        <Pressable
          onPress={() => onSave(trimmed)}
          disabled={!trimmed}
          style={({ pressed }) => [styles.save, (pressed || !trimmed) && styles.pressed]}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.gold,
    fontSize: 24,
    lineHeight: 38,
    minHeight: 120,
    padding: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  save: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingVertical: 14,
  },
  saveText: {
    color: colors.accentDark,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.5,
  },
});
