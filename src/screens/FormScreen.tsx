import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '../components/Header';
import type { TasbeehFields } from '../store';
import { colors } from '../theme';

type Props = {
  /** Existing tasbeeh when editing; omitted when adding. */
  initial?: TasbeehFields;
  onSave: (fields: TasbeehFields) => void;
  onCancel: () => void;
};

export function FormScreen({ initial, onSave, onCancel }: Props) {
  const [text, setText] = useState(initial?.text ?? '');
  const [transliteration, setTransliteration] = useState(initial?.transliteration ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');

  const fields: TasbeehFields = {
    text: text.trim(),
    transliteration: transliteration.trim(),
    translation: translation.trim(),
  };
  const canSave = !!(fields.text || fields.transliteration || fields.translation);

  return (
    <View style={styles.screen}>
      <Header title={initial ? 'Edit tasbeeh' : 'New tasbeeh'} onBack={onCancel} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Write it in any of these three ways. Fill in at least one; the rest are optional.</Text>

        <Text style={styles.label}>Arabic</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="سُبْحَانَ اللَّهِ"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.arabicInput]}
          multiline
          maxLength={200}
        />

        <Text style={styles.label}>Transliteration</Text>
        <TextInput
          value={transliteration}
          onChangeText={setTransliteration}
          placeholder="SubhanAllah"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          maxLength={200}
        />

        <Text style={styles.label}>Meaning</Text>
        <TextInput
          value={translation}
          onChangeText={setTranslation}
          placeholder="Glory be to Allah."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          maxLength={200}
        />

        <Pressable
          onPress={() => onSave(fields)}
          disabled={!canSave}
          style={({ pressed }) => [styles.save, (pressed || !canSave) && styles.pressed]}
        >
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </ScrollView>
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
    gap: 8,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    marginLeft: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  arabicInput: {
    color: colors.gold,
    fontSize: 24,
    lineHeight: 40,
    minHeight: 90,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  save: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 24,
    marginTop: 16,
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
