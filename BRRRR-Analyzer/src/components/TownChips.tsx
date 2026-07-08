import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TownChips({ values, onChange, suggestions = [], placeholder = 'Add a nearby town' }: Props) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (values.some((v) => v.toLowerCase() === name.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, name]);
    setDraft('');
  };

  const remove = (name: string) => onChange(values.filter((v) => v !== name));

  const unusedSuggestions = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={colors.inkFaint}
          onSubmitEditing={() => add(draft)}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => add(draft)} hitSlop={8}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {values.length > 0 && (
        <View style={styles.chipRow}>
          {values.map((v) => (
            <View key={v} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {v}
              </Text>
              <TouchableOpacity onPress={() => remove(v)} hitSlop={8}>
                <Ionicons name="close" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {unusedSuggestions.length > 0 && (
        <View style={styles.suggestWrap}>
          <Text style={styles.suggestLabel}>Suggestions</Text>
          <View style={styles.chipRow}>
            {unusedSuggestions.map((s) => (
              <TouchableOpacity key={s} style={styles.suggestChip} onPress={() => add(s)}>
                <Ionicons name="add" size={11} color={colors.inkDim} />
                <Text style={styles.suggestChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 200,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
  },
  chipText: { color: colors.primaryTint, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  suggestWrap: { marginTop: spacing.md },
  suggestLabel: { fontSize: 11, fontWeight: '700', color: colors.inkFaint, marginBottom: 6 },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  suggestChipText: { fontSize: 12, color: colors.inkDim, fontWeight: '600' },
});
