import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/theme';
import { formatUsd, formatPct, relativeDate } from '@/utils/format';
import { analyzeBrrrr } from '@/utils/brrrr';
import { buildActionPlan, groupRehabByTrade, PlanPhase } from '@/utils/actionPlan';
import { usePropertyById } from '@/services/listingsProvider';
import { usePortfolio } from '@/context/PortfolioContext';
import { useSettings } from '@/context/SettingsContext';
import { useContractors, contractorsForTrade } from '@/services/contractorsProvider';
import { lendersForCategory } from '@/services/lendersProvider';
import { ScoreBadge } from '@/components/ScoreBadge';
import { StatusPill } from '@/components/StatusPill';
import { DealStageStepper } from '@/components/DealStageStepper';
import { EditDealModal } from '@/components/EditDealModal';
import { LenderCard } from '@/components/LenderCard';
import { ContractorCard } from '@/screens/ContractorsScreen';
import { applyOverride, RehabItem } from '@/services/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  propertyId: string;
  onBack: () => void;
}

const PHASE_ORDER: PlanPhase[] = ['Buy', 'Rehab', 'Rent', 'Refinance', 'Repeat'];
const PHASE_ICON: Record<PlanPhase, keyof typeof Ionicons.glyphMap> = {
  Buy: 'key-outline',
  Rehab: 'hammer-outline',
  Rent: 'people-outline',
  Refinance: 'sync-outline',
  Repeat: 'repeat-outline',
};

const PRIORITY_LABEL: Record<RehabItem['priority'], string> = {
  critical: 'Critical',
  recommended: 'Recommended',
  cosmetic: 'Cosmetic',
};
const PRIORITY_COLOR: Record<RehabItem['priority'], string> = {
  critical: colors.poor,
  recommended: colors.fair,
  cosmetic: colors.good,
};

export function PropertyDetailScreen({ propertyId, onBack }: Props) {
  const property = usePropertyById(propertyId);
  const { isSaved, toggleSaved, getStage, setStage, isStepChecked, toggleStep, getOverride, setOverride } =
    usePortfolio();
  const { assumptions, preferences } = useSettings();
  const [editOpen, setEditOpen] = useState(false);

  const override = property ? getOverride(property.id) : {};
  const effectiveProperty = useMemo(
    () => (property ? applyOverride(property, override) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [property, JSON.stringify(override)]
  );
  const analysis = useMemo(
    () => (effectiveProperty ? analyzeBrrrr(effectiveProperty, assumptions) : null),
    [effectiveProperty, assumptions]
  );
  const plan = useMemo(
    () => (effectiveProperty && analysis ? buildActionPlan(effectiveProperty, analysis) : []),
    [effectiveProperty, analysis]
  );
  const tradeGroups = useMemo(() => (effectiveProperty ? groupRehabByTrade(effectiveProperty) : []), [effectiveProperty]);
  const tradesNeeded = useMemo(() => tradeGroups.map((g) => g.trade), [tradeGroups]);
  const { contractors } = useContractors(tradesNeeded);

  const bridgeLenders = useMemo(() => lendersForCategory('Hard Money / Bridge', preferences.state).slice(0, 2), [preferences.state]);
  const dscrLenders = useMemo(() => lendersForCategory('DSCR Refinance', preferences.state).slice(0, 2), [preferences.state]);

  if (!property || !effectiveProperty || !analysis) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>This listing is no longer available.</Text>
          <TouchableOpacity onPress={onBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const saved = isSaved(property.id);
  const stage = getStage(property.id) ?? 'watching';
  const hasOfferOverride = override.offerPrice != null && override.offerPrice !== property.price;
  const hasArvOverride = override.arvOverride != null && override.arvOverride !== property.arvEstimate;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.photoWrap}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {property.photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: SCREEN_WIDTH, height: 280 }} />
            ))}
          </ScrollView>
          <SafeAreaView edges={['top']} style={styles.photoNav}>
            <TouchableOpacity style={styles.navBtn} onPress={onBack} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => toggleSaved(property.id)} hitSlop={8}>
              <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? colors.poor : colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.price}>{formatUsd(property.price)}</Text>
            <ScoreBadge score={analysis.score} size="lg" />
          </View>
          {(hasOfferOverride || hasArvOverride) && (
            <View style={styles.overrideNote}>
              <Ionicons name="pencil" size={11} color={colors.primaryTint} />
              <Text style={styles.overrideNoteText}>
                {hasOfferOverride ? `Your offer ${formatUsd(override.offerPrice!)}` : ''}
                {hasOfferOverride && hasArvOverride ? ' · ' : ''}
                {hasArvOverride ? `Your ARV ${formatUsd(override.arvOverride!)}` : ''}
              </Text>
            </View>
          )}
          <Text style={styles.address}>
            {property.address}
            {property.unit ? ` ${property.unit}` : ''}
          </Text>
          <Text style={styles.cityLine}>
            {property.neighborhood}, {property.city} {property.state} {property.zip}
          </Text>
          <View style={styles.statusRow}>
            <StatusPill status={property.status} daysOnMarket={property.daysOnMarket} />
            <Text style={styles.listedDate}>Listed {relativeDate(property.listedDate)}</Text>
          </View>

          <View style={styles.factsGrid}>
            <Fact label="Type" value={property.propertyType} />
            <Fact label="Units" value={String(property.unitCount)} />
            <Fact label="Sqft" value={property.sqftTotal.toLocaleString()} />
            <Fact label="Built" value={String(property.yearBuilt)} />
          </View>

          {saved ? (
            <>
              <SectionTitle icon="git-branch-outline" title="Deal stage" />
              <View style={{ marginBottom: spacing.lg }}>
                <DealStageStepper stage={stage} onChange={(s) => setStage(property.id, s)} />
              </View>
            </>
          ) : (
            <View style={styles.trackHint}>
              <Ionicons name="heart-outline" size={14} color={colors.inkFaint} />
              <Text style={styles.trackHintText}>Save this property to track its stage and keep notes.</Text>
            </View>
          )}

          <SectionTitle icon="layers-outline" title="Also listed on" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            {property.sources.map((s) => (
              <TouchableOpacity
                key={s.site + s.url}
                style={styles.sourceChip}
                onPress={() => s.url && Linking.openURL(s.url)}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceChipSite}>{s.site}</Text>
                <Text style={styles.sourceChipMeta}>
                  {formatUsd(s.listPrice)} · seen {relativeDate(s.lastSeen)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <SectionTitle icon="navigate-outline" title="Neighborhood & transit" />
          <View style={styles.transitRow}>
            <TransitStat label="Walk" score={property.transit.walkScore} />
            <TransitStat label="Transit" score={property.transit.transitScore} />
            <TransitStat label="Bike" score={property.transit.bikeScore} />
          </View>
          <Text style={styles.transitDetail}>
            Nearest: {property.transit.nearestStop} · ~{property.transit.commuteMinutesDowntown} min to downtown
          </Text>

          <Text style={styles.description}>{property.description}</Text>

          {/* BRRRR Analysis */}
          <View style={styles.analysisHeaderRow}>
            <SectionTitle icon="calculator-outline" title="BRRRR analysis" />
            <TouchableOpacity style={styles.editDealBtn} onPress={() => setEditOpen(true)} activeOpacity={0.75}>
              <Ionicons name="pencil-outline" size={13} color={colors.primary} />
              <Text style={styles.editDealBtnText}>Edit deal numbers</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.analysisCard}>
            <AnalysisRow label="Purchase price" value={formatUsd(analysis.purchasePrice)} />
            <AnalysisRow
              label="Rehab budget"
              value={`${formatUsd(analysis.rehabBudget.low)} – ${formatUsd(analysis.rehabBudget.high)}`}
            />
            <AnalysisRow label="Closing + holding costs" value={formatUsd(analysis.closingCosts + analysis.holdingCosts)} />
            <AnalysisRow label="Total cash invested" value={formatUsd(analysis.totalCashInvested)} emphasize />
            <View style={styles.divider} />
            <AnalysisRow label="After-repair value (ARV)" value={formatUsd(analysis.arv)} />
            <AnalysisRow label="Refinance loan (75% LTV)" value={formatUsd(analysis.refiLoanAmount)} />
            <AnalysisRow label="Cash out at refinance" value={formatUsd(analysis.cashOutAtRefi)} />
            <AnalysisRow
              label="Cash left in deal"
              value={analysis.cashLeftInDeal <= 0 ? 'All cash returned' : formatUsd(analysis.cashLeftInDeal)}
              emphasize
              good={analysis.cashLeftInDeal <= 0}
            />
            <View style={styles.divider} />
            <AnalysisRow
              label="Monthly cash flow"
              value={formatUsd(analysis.monthlyCashFlow)}
              good={analysis.monthlyCashFlow >= 0}
              emphasize
            />
            <AnalysisRow
              label="Cash-on-cash return"
              value={analysis.cashOnCashReturn === null ? '∞ (no cash left in)' : formatPct(analysis.cashOnCashReturn)}
              good
            />
            <AnalysisRow label="Cap rate" value={formatPct(analysis.capRate)} />
            <AnalysisRow label="DSCR" value={analysis.dscr.toFixed(2)} good={analysis.dscr >= 1.2} />
            <View style={styles.divider} />
            <RuleRow label="1% rule" actual={`${analysis.onePercentRuleActual.toFixed(2)}%`} pass={analysis.onePercentRulePass} />
            <RuleRow label="50% expense rule" actual={`${analysis.fiftyPercentRuleActual.toFixed(0)}%`} pass={analysis.fiftyPercentRulePass} />
          </View>

          <View style={styles.scoreBreakdownCard}>
            <Text style={styles.scoreBreakdownTitle}>What drives the {analysis.score} score</Text>
            {analysis.scoreBreakdown.map((b) => (
              <View key={b.label} style={styles.scoreBar}>
                <Text style={styles.scoreBarLabel}>{b.label}</Text>
                <View style={styles.scoreBarTrack}>
                  <View style={[styles.scoreBarFill, { width: `${b.score}%` }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Financing */}
          <SectionTitle icon="cash-outline" title="Financing — recommended lenders" />
          <Text style={styles.lenderGroupLabel}>Hard money / bridge, for the purchase + rehab</Text>
          {bridgeLenders.length === 0 ? (
            <Text style={styles.noContractors}>No bridge lenders on file for {preferences.state} yet.</Text>
          ) : (
            bridgeLenders.map((l, idx) => <LenderCard key={l.id} lender={l} highlight={idx === 0} />)
          )}
          <Text style={styles.lenderGroupLabel}>DSCR refinance, to pull your cash back out</Text>
          {dscrLenders.length === 0 ? (
            <Text style={styles.noContractors}>No DSCR lenders on file for {preferences.state} yet.</Text>
          ) : (
            dscrLenders.map((l, idx) => <LenderCard key={l.id} lender={l} highlight={idx === 0} />)
          )}

          {/* Action plan */}
          <SectionTitle icon="checkbox-outline" title="Step-by-step action plan" />
          {PHASE_ORDER.map((phase) => {
            const steps = plan.filter((s) => s.phase === phase);
            if (steps.length === 0) return null;
            return (
              <View key={phase} style={styles.phaseBlock}>
                <View style={styles.phaseHeader}>
                  <Ionicons name={PHASE_ICON[phase]} size={16} color={colors.primary} />
                  <Text style={styles.phaseTitle}>{phase}</Text>
                </View>
                {steps.map((step) => {
                  const checked = isStepChecked(property.id, step.id);
                  return (
                    <TouchableOpacity
                      key={step.id}
                      style={styles.stepRow}
                      activeOpacity={0.7}
                      onPress={() => toggleStep(property.id, step.id)}
                    >
                      <Ionicons
                        name={checked ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={checked ? colors.great : colors.inkFaint}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.stepTitle, checked && styles.stepTitleDone]}>{step.title}</Text>
                        <Text style={styles.stepDetail}>{step.detail}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {/* Rehab scope + contractors */}
          <SectionTitle icon="construct-outline" title="Rehab scope & recommended contractors" />
          {tradeGroups.map((group) => {
            const picks = contractorsForTrade(contractors, group.trade, property.neighborhood).slice(0, 2);
            return (
              <View key={group.trade} style={styles.tradeGroup}>
                <View style={styles.tradeGroupHeader}>
                  <Text style={styles.tradeGroupTitle}>{group.trade}</Text>
                  <View style={[styles.priorityTag, { backgroundColor: PRIORITY_COLOR[group.topPriority] + '1F' }]}>
                    <Text style={[styles.priorityTagText, { color: PRIORITY_COLOR[group.topPriority] }]}>
                      {PRIORITY_LABEL[group.topPriority]}
                    </Text>
                  </View>
                  <Text style={styles.tradeGroupCost}>
                    {formatUsd(group.costLow)}–{formatUsd(group.costHigh)}
                  </Text>
                </View>
                {group.items.map((item) => (
                  <Text key={item.id} style={styles.tradeItemDesc}>• {item.description}</Text>
                ))}
                {picks.length === 0 ? (
                  <Text style={styles.noContractors}>No contractors on file for this trade yet.</Text>
                ) : (
                  picks.map((c, idx) => <ContractorCard key={c.id} contractor={c} highlight={idx === 0} />)
                )}
              </View>
            );
          })}

          <SectionTitle icon="home-outline" title="Units" />
          <View style={styles.unitsCard}>
            {property.units.map((u) => (
              <View key={u.label} style={styles.unitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitLabel}>{u.label}</Text>
                  <Text style={styles.unitMeta}>
                    {u.bedrooms}bd / {u.bathrooms}ba · {u.sqft} sqft · {u.occupied ? 'Occupied' : 'Vacant'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.unitRentNow}>{u.currentRent > 0 ? formatUsd(u.currentRent) : '—'}/mo now</Text>
                  <Text style={styles.unitRentPost}>{formatUsd(u.marketRentPostRehab)}/mo post-rehab</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: spacing.xxl }} />
        </View>
      </ScrollView>

      <EditDealModal
        visible={editOpen}
        property={property}
        override={override}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          setOverride(property.id, patch);
          setEditOpen(false);
        }}
      />
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

function TransitStat({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.transitStat}>
      <Text style={styles.transitScore}>{score}</Text>
      <Text style={styles.transitLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function AnalysisRow({
  label,
  value,
  emphasize,
  good,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  good?: boolean;
}) {
  return (
    <View style={styles.analysisRow}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <Text
        style={[
          styles.analysisValue,
          emphasize && styles.analysisValueEmphasize,
          good === true && { color: colors.great },
          good === false && { color: colors.poor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function RuleRow({ label, actual, pass }: { label: string; actual: string; pass: boolean }) {
  return (
    <View style={styles.analysisRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons
          name={pass ? 'checkmark-circle' : 'close-circle'}
          size={15}
          color={pass ? colors.great : colors.poor}
        />
        <Text style={styles.analysisLabel}>{label}</Text>
      </View>
      <Text style={[styles.analysisValue, { color: pass ? colors.great : colors.poor }]}>{actual}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  missingText: { color: colors.inkDim, fontSize: 15 },
  backLink: { padding: spacing.sm },
  backLinkText: { color: colors.primary, fontWeight: '700' },
  photoWrap: { height: 280, backgroundColor: colors.bgAlt },
  photoNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  price: { fontSize: 28, fontWeight: '800', color: colors.ink },
  overrideNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  overrideNoteText: { fontSize: 11, fontWeight: '700', color: colors.primaryTint },
  trackHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
  },
  trackHintText: { fontSize: 12, color: colors.inkFaint },
  analysisHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editDealBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editDealBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  lenderGroupLabel: { fontSize: 12, fontWeight: '700', color: colors.inkDim, marginBottom: spacing.sm, marginTop: spacing.xs },
  address: { fontSize: 17, fontWeight: '700', color: colors.ink, marginTop: spacing.sm },
  cityLine: { fontSize: 13, color: colors.inkDim, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  listedDate: { fontSize: 12, color: colors.inkFaint },
  factsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  fact: { alignItems: 'center' },
  factValue: { fontSize: 15, fontWeight: '800', color: colors.ink },
  factLabel: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionTitleText: { fontSize: 15, fontWeight: '800', color: colors.ink },
  sourceChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 140,
  },
  sourceChipSite: { fontSize: 13, fontWeight: '700', color: colors.primary },
  sourceChipMeta: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  transitRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  transitStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  transitScore: { fontSize: 18, fontWeight: '800', color: colors.primary },
  transitLabel: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  transitDetail: { fontSize: 12, color: colors.inkDim, marginTop: spacing.sm, marginBottom: spacing.lg },
  description: { fontSize: 14, color: colors.inkDim, lineHeight: 21, marginBottom: spacing.lg },
  analysisCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  analysisRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  analysisLabel: { fontSize: 13, color: colors.inkDim },
  analysisValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
  analysisValueEmphasize: { fontSize: 15, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  scoreBreakdownCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreBreakdownTitle: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginBottom: spacing.md },
  scoreBar: { marginBottom: spacing.sm },
  scoreBarLabel: { fontSize: 12, color: colors.ink, marginBottom: 4 },
  scoreBarTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  scoreBarFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  phaseBlock: { marginBottom: spacing.lg },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  phaseTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  stepTitleDone: { textDecorationLine: 'line-through', color: colors.inkFaint },
  stepDetail: { fontSize: 12, color: colors.inkDim, marginTop: 3, lineHeight: 17 },
  tradeGroup: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  tradeGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs, flexWrap: 'wrap' },
  tradeGroupTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  priorityTagText: { fontSize: 10, fontWeight: '800' },
  tradeGroupCost: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginLeft: 'auto' },
  tradeItemDesc: { fontSize: 12, color: colors.inkDim, marginBottom: 3 },
  noContractors: { fontSize: 12, color: colors.inkFaint, marginTop: spacing.sm, fontStyle: 'italic' },
  unitsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  unitLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  unitMeta: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  unitRentNow: { fontSize: 12, color: colors.inkDim },
  unitRentPost: { fontSize: 12, fontWeight: '700', color: colors.great, marginTop: 2 },
});
