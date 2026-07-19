import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { Card } from '@/components/Card';
import { LedgerEntry } from '@/types';
import { formatCurrency, formatPercent, formatSigned } from '@/utils/format';
import { formatDateShort } from '@/utils/dates';

const COLS = {
  day: 44,
  date: 92,
  earnings: 96,
  reinvest: 74,
  cashOut: 96,
  principal: 106,
  cash: 96,
  end: 106,
};
const TOTAL_WIDTH = Object.values(COLS).reduce((a, b) => a + b, 0);

function Row({ entry, index }: { entry: LedgerEntry; index: number }) {
  const isLoss = entry.earnings < 0;
  return (
    <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.cell, { width: COLS.day, color: colors.inkFaint }]}>{entry.day}</Text>
      <Text style={[styles.cell, { width: COLS.date }]}>{formatDateShort(entry.date)}</Text>
      <Text style={[styles.cell, { width: COLS.earnings, color: isLoss ? colors.rose : colors.mint, fontWeight: '700' }]}>
        {entry.kind === 'manual' ? formatSigned(entry.earnings) : formatCurrency(entry.earnings)}
      </Text>
      <Text style={[styles.cell, { width: COLS.reinvest }]}>{formatPercent(entry.reinvestPct, 0)}</Text>
      <Text style={[styles.cell, { width: COLS.cashOut, color: colors.inkDim }]}>{formatCurrency(entry.cashOut)}</Text>
      <Text style={[styles.cell, { width: COLS.principal }]}>{formatCurrency(entry.totalPrincipal)}</Text>
      <Text style={[styles.cell, { width: COLS.cash }]}>{formatCurrency(entry.totalCash)}</Text>
      <Text style={[styles.cell, { width: COLS.end, fontWeight: '800', color: colors.ink }]}>{formatCurrency(entry.endBalance)}</Text>
    </View>
  );
}

export function LedgerScreen() {
  const insets = useSafeAreaInsets();
  const { ledger, settings, balance } = useAppState();
  const [newestFirst, setNewestFirst] = useState(true);

  const rows = useMemo(() => (newestFirst ? [...ledger].reverse() : ledger), [ledger, newestFirst]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top + spacing.lg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Ledger</Text>
        <Pressable style={styles.sortButton} onPress={() => setNewestFirst((v) => !v)}>
          <Text style={styles.sortLabel}>{newestFirst ? 'Newest first' : 'Oldest first'}</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard} padded={false}>
          <View style={styles.summaryInner}>
            <Text style={styles.summaryLabel}>Total Principal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(ledger.length ? ledger[ledger.length - 1].totalPrincipal : settings.startingBalance)}</Text>
          </View>
        </Card>
        <Card style={styles.summaryCard} padded={false}>
          <View style={styles.summaryInner}>
            <Text style={styles.summaryLabel}>Total Cash</Text>
            <Text style={styles.summaryValue}>{formatCurrency(ledger.length ? ledger[ledger.length - 1].totalCash : 0)}</Text>
          </View>
        </Card>
        <Card style={styles.summaryCard} padded={false}>
          <View style={styles.summaryInner}>
            <Text style={styles.summaryLabel}>End Balance</Text>
            <Text style={[styles.summaryValue, { color: colors.mint }]}>{formatCurrency(balance)}</Text>
          </View>
        </Card>
      </View>

      {ledger.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📒</Text>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySubtitle}>Log your first trade from the Home tab to start your ledger.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator style={{ paddingHorizontal: spacing.lg }}>
          <View style={{ width: TOTAL_WIDTH }}>
            <View style={styles.headRow}>
              <Text style={[styles.headCell, { width: COLS.day }]}>Day</Text>
              <Text style={[styles.headCell, { width: COLS.date }]}>Date</Text>
              <Text style={[styles.headCell, { width: COLS.earnings }]}>Earnings</Text>
              <Text style={[styles.headCell, { width: COLS.reinvest }]}>Reinvest</Text>
              <Text style={[styles.headCell, { width: COLS.cashOut }]}>Cash Out</Text>
              <Text style={[styles.headCell, { width: COLS.principal }]}>Total Principal</Text>
              <Text style={[styles.headCell, { width: COLS.cash }]}>Total Cash</Text>
              <Text style={[styles.headCell, { width: COLS.end }]}>End Balance</Text>
            </View>
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => <Row entry={item} index={index} />}
              contentContainerStyle={{ paddingBottom: 140 }}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  sortButton: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sortLabel: { color: colors.inkDim, fontSize: 11, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  summaryCard: { flex: 1 },
  summaryInner: { padding: spacing.md, alignItems: 'center' },
  summaryLabel: { color: colors.inkFaint, fontSize: 10, fontWeight: '700' },
  summaryValue: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 2 },
  headRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  headCell: { color: colors.inkFaint, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', paddingVertical: spacing.sm + 2, borderRadius: radius.sm },
  rowEven: { backgroundColor: 'transparent' },
  rowOdd: { backgroundColor: colors.card },
  cell: { color: colors.ink, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  emptySubtitle: { color: colors.inkFaint, fontSize: 13, textAlign: 'center', marginTop: spacing.sm },
});
