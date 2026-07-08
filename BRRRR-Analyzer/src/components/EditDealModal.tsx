import React, { useEffect, useState } from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { Property, PropertyOverride, RehabItem, TradeCategory } from '@/services/types';

const ALL_TRADES: TradeCategory[] = [
  'General Contractor',
  'Roofing',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Kitchen & Bath',
  'Flooring',
  'Painting',
  'Foundation',
  'Windows & Doors',
  'Landscaping',
];

const PRIORITIES: RehabItem['priority'][] = ['critical', 'recommended', 'cosmetic'];

interface Props {
  visible: boolean;
  property: Property;
  override: PropertyOverride;
  onSave: (override: PropertyOverride) => void;
  onClose: () => void;
}

let nextItemId = 1;

export function EditDealModal({ visible, property, override, onSave, onClose }: Props) {
  const [offerPrice, setOfferPrice] = useState('');
  const [arv, setArv] = useState('');
  const [items, setItems] = useState<RehabItem[]>([]);

  useEffect(() => {
    if (!visible) return;
    setOfferPrice(override.offerPrice != null ? String(override.offerPrice) : String(property.price));
    setArv(override.arvOverride != null ? String(override.arvOverride) : String(property.arvEstimate));
    setItems((override.customRehabItems ?? property.rehabItems).map((i) => ({ ...i })));
  }, [visible, property, override]);

  const updateItem = (id: string, patch: Partial<RehabItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}-${nextItemId++}`,
        trade: 'General Contractor',
        description: '',
        estCostLow: 0,
        estCostHigh: 0,
        priority: 'recommended',
      },
    ]);
  };

  const save = () => {
    onSave({
      offerPrice: Number(offerPrice) || property.price,
      arvOverride: Number(arv) || property.arvEstimate,
      customRehabItems: items,
    });
  };

  const resetToListing = () => {
    setOfferPrice(String(property.price));
    setArv(String(property.arvEstimate));
    setItems(property.rehabItems.map((i) => ({ ...i })));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit deal numbers</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.helper}>
              Correct these once you've actually walked the property or gotten a real offer accepted — the
              analysis, action plan, and contractor scope everywhere else in the app will use these numbers
              instead of the listing's.
            </Text>

            <Text style={styles.label}>Your offer / contract price</Text>
            <TextInput
              style={styles.input}
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
              placeholder={String(property.price)}
              placeholderTextColor={colors.inkFaint}
            />

            <Text style={styles.label}>Your ARV estimate</Text>
            <TextInput
              style={styles.input}
              value={arv}
              onChangeText={setArv}
              keyboardType="numeric"
              placeholder={String(property.arvEstimate)}
              placeholderTextColor={colors.inkFaint}
            />

            <View style={styles.rehabHeaderRow}>
              <Text style={styles.label}>Rehab scope</Text>
              <TouchableOpacity onPress={addItem} style={styles.addBtn}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addBtnText}>Add item</Text>
              </TouchableOpacity>
            </View>

            {items.length === 0 && <Text style={styles.emptyRehab}>No rehab items yet — add one above.</Text>}

            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    {ALL_TRADES.map((t) => (
                      <View key={t} style={{ marginRight: 6 }}>
                        <Chip label={t} active={item.trade === t} onPress={() => updateItem(item.id, { trade: t })} />
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={8} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.poor} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.itemInput}
                  value={item.description}
                  onChangeText={(v) => updateItem(item.id, { description: v })}
                  placeholder="What needs to happen"
                  placeholderTextColor={colors.inkFaint}
                />

                <View style={styles.costRow}>
                  <TextInput
                    style={[styles.itemInput, { flex: 1 }]}
                    value={item.estCostLow ? String(item.estCostLow) : ''}
                    onChangeText={(v) => updateItem(item.id, { estCostLow: Number(v) || 0 })}
                    keyboardType="numeric"
                    placeholder="Low $"
                    placeholderTextColor={colors.inkFaint}
                  />
                  <TextInput
                    style={[styles.itemInput, { flex: 1 }]}
                    value={item.estCostHigh ? String(item.estCostHigh) : ''}
                    onChangeText={(v) => updateItem(item.id, { estCostHigh: Number(v) || 0 })}
                    keyboardType="numeric"
                    placeholder="High $"
                    placeholderTextColor={colors.inkFaint}
                  />
                </View>

                <View style={styles.wrapRow}>
                  {PRIORITIES.map((p) => (
                    <Chip
                      key={p}
                      label={p[0].toUpperCase() + p.slice(1)}
                      active={item.priority === p}
                      onPress={() => updateItem(item.id, { priority: p })}
                    />
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={resetToListing} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
              <Text style={styles.resetLink}>Reset to listing defaults</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={save}>
            <Text style={styles.saveLabel}>Save deal numbers</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  helper: { fontSize: 12, color: colors.inkDim, lineHeight: 17, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginTop: spacing.md, marginBottom: spacing.sm },
  input: {
    minWidth: 0,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  rehabHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  emptyRehab: { fontSize: 12, color: colors.inkFaint, fontStyle: 'italic', marginBottom: spacing.md },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  itemTopRow: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 4, marginLeft: spacing.sm },
  itemInput: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    fontSize: 16,
    color: colors.ink,
    minWidth: 0,
  },
  costRow: { flexDirection: 'row', gap: spacing.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  resetLink: { color: colors.inkFaint, fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  saveLabel: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
