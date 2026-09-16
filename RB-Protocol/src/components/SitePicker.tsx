import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { INJECTION_SITES } from '@/data/stack';
import { useLog } from '@/context/LogContext';

/** Site log + rotation hint for one syringe on the active day. */
export function SitePicker({ syringeId }: { syringeId: string }) {
  const { getSite, setSite, lastSite } = useLog();
  const [open, setOpen] = useState(false);
  const current = getSite(syringeId);
  const previous = lastSite(syringeId);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.header} activeOpacity={0.7} onPress={() => setOpen((o) => !o)}>
        <Ionicons name="body-outline" size={14} color={colors.injection} />
        <Text style={styles.headerText}>
          {current ? `Site: ${current}` : 'Log injection site'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.inkFaint} />
      </TouchableOpacity>

      {!!previous && (
        <Text style={styles.hint}>
          Last pinned {previous.site} · {previous.daysAgo === 1 ? 'yesterday' : `${previous.daysAgo} days ago`}
        </Text>
      )}

      {open && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {INJECTION_SITES.map((site) => {
            const active = site === current;
            const stale = previous?.site === site;
            return (
              <TouchableOpacity
                key={site}
                activeOpacity={0.8}
                style={[styles.chip, active && styles.chipActive, stale && !active && styles.chipStale]}
                onPress={() => {
                  setSite(syringeId, site);
                  setOpen(false);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{site}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.inkDim },
  hint: { fontSize: 11, color: colors.inkFaint, marginTop: 4, marginLeft: 20 },
  chips: { gap: 6, paddingTop: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.injectionSoft, borderColor: colors.injection },
  chipStale: { opacity: 0.45 },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.inkDim },
  chipTextActive: { color: colors.injection },
});
