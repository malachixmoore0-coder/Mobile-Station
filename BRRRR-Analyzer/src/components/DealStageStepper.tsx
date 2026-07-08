import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { DEAL_STAGES, DEAL_STAGE_LABEL, DealStage } from '@/services/types';

interface Props {
  stage: DealStage;
  onChange: (stage: DealStage) => void;
}

export function DealStageStepper({ stage, onChange }: Props) {
  const activeIdx = DEAL_STAGES.indexOf(stage);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {DEAL_STAGES.map((s, i) => {
        const isActive = s === stage;
        const isPast = i < activeIdx;
        return (
          <TouchableOpacity
            key={s}
            style={[styles.pill, isActive && styles.pillActive, isPast && styles.pillPast]}
            onPress={() => onChange(s)}
            activeOpacity={0.75}
          >
            {isPast && <Ionicons name="checkmark" size={12} color={colors.great} style={{ marginRight: 3 }} />}
            <Text style={[styles.label, isActive && styles.labelActive, isPast && styles.labelPast]}>
              {DEAL_STAGE_LABEL[s]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillPast: { backgroundColor: colors.greatSoft, borderColor: colors.greatSoft },
  label: { fontSize: 12, fontWeight: '700', color: colors.inkDim },
  labelActive: { color: colors.white },
  labelPast: { color: colors.great },
});
