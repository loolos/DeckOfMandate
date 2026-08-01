/**
 * Sun King chapter refit screen: the pre-run deck-adjust step for chapters 2 and 3
 * (standalone starts and post-victory continuations alike). Registered through
 * `registerCampaignPreRunScreen`; the app shell only routes to it and takes back the
 * built opening state. All draft state, validation, and layout live here.
 */
import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { getCardTemplate } from "../../../data/cards";
import { getLevelDef } from "../../../data/levels";
import { useI18n, type MessageKey } from "../../../locales";
import { useSmallScreen } from "../../../logic/useSmallScreen";
import { OutcomeQuickFrame } from "../../../components/OutcomeQuickFrame";
import { LanguageToggle } from "../../../components/LanguageToggle";
import type { CardTag } from "../../types/tags";
import type { CardTemplateId } from "../../types/card";
import {
  getCampaignLevelTheme,
  type CampaignPreRunConfirm,
  type CampaignPreRunScreenProps,
} from "../../campaignUiRegistry";
import { cardLabelWithIcon } from "../logic/icons";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import { ResourceTooltipText } from "./SunkingResourceTooltipText";
import {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  getLevel2RefitNewCardsLabelKey,
  getLevel2RefitNewCardsTemplateOrder,
  LEVEL2_CONTINUITY_MAX_REMOVALS,
  SUNKING_CH2_ID,
  toggleContinuityCardRemoval,
  validateLevel2Draft,
  type Level2CarryoverCard,
  type Level2StartDraft,
} from "../chapter2Transition";
import {
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  getLevel3RefitNewCardsLabelKey,
  getLevel3RefitNewCardsTemplateOrder,
  SUNKING_CH3_ID,
  validateLevel3Draft,
  type Level3StartDraft,
} from "../chapter3Transition";
import styles from "../../../app/Game.module.css";

const LEVEL2_REFIT_NEW_CARDS = getLevel2RefitNewCardsTemplateOrder();
const LEVEL3_REFIT_NEW_CARDS = getLevel3RefitNewCardsTemplateOrder();
const CHAPTER3_REFIT_NEW_CARDS_LABEL_KEY: MessageKey = getLevel3RefitNewCardsLabelKey() as MessageKey;
const LEVEL2_REFIT_NEW_CARDS_LABEL_KEY: MessageKey = getLevel2RefitNewCardsLabelKey() as MessageKey;

function backdropStyle(levelId: string): CSSProperties | undefined {
  return getCampaignLevelTheme(levelId)?.backdropStyle;
}

function displayRefitTags(_mode: Level2StartDraft["mode"], tags: readonly CardTag[]): readonly CardTag[] {
  return tags;
}

function cloneLevel2Draft(draft: Level2StartDraft): Level2StartDraft {
  return {
    ...draft,
    resources: { ...draft.resources },
    carryoverCards: draft.carryoverCards.map((card) => ({ ...card })),
    removedCarryoverIds: [...draft.removedCarryoverIds],
  };
}

function cloneLevel3Draft(draft: Level3StartDraft): Level3StartDraft {
  return {
    ...draft,
    resources: { ...draft.resources },
    carryoverCards: draft.carryoverCards.map((card) => ({ ...card })),
    removedCarryoverIds: [...draft.removedCarryoverIds],
  };
}

/** Indices of carryover cards the player removed, in carryover order (recorded in the run code). */
function removedIndicesOf(draft: Level2StartDraft | Level3StartDraft): number[] {
  const removed = new Set(draft.removedCarryoverIds);
  const out: number[] = [];
  draft.carryoverCards.forEach((card, idx) => {
    if (removed.has(card.instanceId)) out.push(idx);
  });
  return out;
}

/** Which chapter draft this request needs; chapter 3 continues from chapter 2, chapter 2 from chapter 1. */
function initialDrafts(request: CampaignPreRunScreenProps["request"]): {
  level2: Level2StartDraft | null;
  level3: Level3StartDraft | null;
} {
  if (request.kind === "standaloneStart") {
    const bootstrap = getLevelDef(request.levelId).bootstrap;
    if (bootstrap === "chapter2Standalone") {
      return { level2: createStandaloneLevel2Draft(request.seed), level3: null };
    }
    if (bootstrap === "chapter3Standalone") {
      return { level2: null, level3: createStandaloneLevel3Draft(request.seed) };
    }
    return { level2: null, level3: null };
  }
  const draftKind = getLevelDef(request.state.levelId).postVictoryContinuity?.draftKind;
  if (draftKind === "level2FromPrior") {
    return { level2: createContinuityLevel2Draft(request.state), level3: null };
  }
  if (draftKind === "level3FromPrior") {
    return { level2: null, level3: createContinuityLevel3Draft(request.state) };
  }
  return { level2: null, level3: null };
}

export function ChapterRefitScreen({ request, onConfirm, onCancel }: CampaignPreRunScreenProps) {
  const { t } = useI18n();
  const isSmallRefitViewport = useSmallScreen();
  const [expandedRefitCardId, setExpandedRefitCardId] = useState<string | null>(null);
  const mobileRefitRowLastTapAt = useRef<Record<string, number>>({});

  const [initial] = useState(() => initialDrafts(request));
  const [level2Draft, setLevel2Draft] = useState<Level2StartDraft | null>(() =>
    initial.level2 ? cloneLevel2Draft(initial.level2) : null,
  );
  const [level3Draft, setLevel3Draft] = useState<Level3StartDraft | null>(() =>
    initial.level3 ? cloneLevel3Draft(initial.level3) : null,
  );

  const level2Validation = useMemo(() => (level2Draft ? validateLevel2Draft(level2Draft) : null), [level2Draft]);
  const level3Validation = useMemo(() => (level3Draft ? validateLevel3Draft(level3Draft) : null), [level3Draft]);

  const toggleRefitRemoval = useCallback((cardId: string) => {
    setLevel2Draft((prev) => (prev ? toggleContinuityCardRemoval(prev, cardId) : prev));
  }, []);

  const toggleRefitRemovalLevel3 = useCallback((cardId: string) => {
    setLevel3Draft((prev) => (prev ? toggleContinuityCardRemoval(prev, cardId) : prev));
  }, []);

  const maybeToggleRemovalBySmallScreenDoubleTap = useCallback(
    (cardId: string) => {
      if (!isSmallRefitViewport) return;
      const now = Date.now();
      const lastTapAt = mobileRefitRowLastTapAt.current[cardId] ?? 0;
      mobileRefitRowLastTapAt.current[cardId] = now;
      if (now - lastTapAt <= 320) {
        mobileRefitRowLastTapAt.current[cardId] = 0;
        toggleRefitRemoval(cardId);
      }
    },
    [isSmallRefitViewport, toggleRefitRemoval],
  );

  const maybeToggleRemovalBySmallScreenDoubleTapLevel3 = useCallback(
    (cardId: string) => {
      if (!isSmallRefitViewport) return;
      const now = Date.now();
      const lastTapAt = mobileRefitRowLastTapAt.current[cardId] ?? 0;
      mobileRefitRowLastTapAt.current[cardId] = now;
      if (now - lastTapAt <= 320) {
        mobileRefitRowLastTapAt.current[cardId] = 0;
        toggleRefitRemovalLevel3(cardId);
      }
    },
    [isSmallRefitViewport, toggleRefitRemovalLevel3],
  );

  const resetLevel2Refit = () => {
    if (!initial.level2) return;
    setLevel2Draft(cloneLevel2Draft(initial.level2));
    setExpandedRefitCardId(null);
  };

  const resetLevel3Refit = () => {
    if (!initial.level3) return;
    setLevel3Draft(cloneLevel3Draft(initial.level3));
    setExpandedRefitCardId(null);
  };

  const confirmDraft = (
    draft: Level2StartDraft | Level3StartDraft,
    nextState: CampaignPreRunConfirm["state"],
  ) => {
    onConfirm({
      state: nextState,
      removedIndices: removedIndicesOf(draft),
      continuitySnapshot:
        draft.mode === "continuity"
          ? {
              resources: draft.resources,
              warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
              nantesPolicyCarryover: "nantesPolicyCarryover" in draft ? draft.nantesPolicyCarryover : null,
              carryoverCards: draft.carryoverCards,
            }
          : null,
    });
  };

  const confirmLevel2Refit = () => {
    if (!level2Draft || !validateLevel2Draft(level2Draft).isValid) return;
    confirmDraft(level2Draft, buildLevel2StateFromDraft(level2Draft));
  };

  const confirmLevel3Refit = () => {
    if (!level3Draft || !validateLevel3Draft(level3Draft).isValid) return;
    confirmDraft(level3Draft, buildLevel3StateFromDraft(level3Draft));
  };

  const renderContinuityCardRow = (card: Level2CarryoverCard) => {
    if (!level2Draft) return null;
    const tmpl = getCardTemplate(card.templateId);
    const visibleTags = displayRefitTags(level2Draft.mode, tmpl.tags);
    const visibleInflationDelta = card.inflationDelta;
    const effectiveCost = tmpl.cost + visibleInflationDelta;
    const title = cardLabelWithIcon(card.templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl, effectiveCost);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === card.instanceId;
    const removed = level2Draft.removedCarryoverIds.includes(card.instanceId);
    const tagChips =
      visibleTags.length > 0 || (card.remainingUses != null && card.totalUses != null) ? (
        <div className={styles.badgeRow}>
          {card.remainingUses != null && card.totalUses != null ? (
            <span key={`${card.instanceId}_remaining_uses`} className={`${styles.badge} ${styles.tagButton}`}>
              {t("card.tag.remainingUses", {
                remaining: card.remainingUses,
                total: card.totalUses,
              })}
            </span>
          ) : null}
          {visibleTags.map((tag) => (
            <span key={`${card.instanceId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={card.instanceId}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId));
          }
        }}
        onDoubleClick={() => {
          if (!isSmallRefitViewport) return;
          toggleRefitRemoval(card.instanceId);
        }}
        onTouchEnd={() => maybeToggleRemovalBySmallScreenDoubleTap(card.instanceId)}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>
            <ResourceTooltipText text={compactSummary} resources={level2Draft.resources} />
          </span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} resources={level2Draft.resources} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
        <div
          className={styles.retainCounterControls}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <label className={styles.startMenuMuted} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <input
              type="checkbox"
              checked={removed}
              onChange={() => toggleRefitRemoval(card.instanceId)}
            />
            {t("menu.refit.removeToggle")}
          </label>
        </div>
      </div>
    );
  };

  const renderFixedNewCardPreviewRow = (id: CardTemplateId) => {
    if (!level2Draft) return null;
    const tmpl = getCardTemplate(id);
    const visibleTags = displayRefitTags(level2Draft.mode, tmpl.tags);
    const title = cardLabelWithIcon(id, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const rowId = `preview-${id}`;
    const expanded = expandedRefitCardId === rowId;
    const tagChips =
      visibleTags.length > 0 ? (
        <div className={styles.badgeRow}>
          {visibleTags.map((tag) => (
            <span key={`${rowId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={id}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === rowId ? null : rowId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === rowId ? null : rowId));
          }
        }}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>
            <ResourceTooltipText text={compactSummary} resources={level2Draft.resources} />
          </span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} resources={level2Draft.resources} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderLevel3RefitCardRow = (card: Level2CarryoverCard) => {
    if (!level3Draft) return null;
    const tmpl = getCardTemplate(card.templateId);
    const visibleTags = displayRefitTags("continuity", tmpl.tags);
    const visibleInflationDelta = card.inflationDelta;
    const effectiveCost = tmpl.cost + visibleInflationDelta;
    const title = cardLabelWithIcon(card.templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl, effectiveCost);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === card.instanceId;
    const removed = level3Draft.removedCarryoverIds.includes(card.instanceId);
    const tagChips =
      visibleTags.length > 0 || (card.remainingUses != null && card.totalUses != null) ? (
        <div className={styles.badgeRow}>
          {card.remainingUses != null && card.totalUses != null ? (
            <span key={`${card.instanceId}_remaining_uses`} className={`${styles.badge} ${styles.tagButton}`}>
              {t("card.tag.remainingUses", {
                remaining: card.remainingUses,
                total: card.totalUses,
              })}
            </span>
          ) : null}
          {visibleTags.map((tag) => (
            <span key={`${card.instanceId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={card.instanceId}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId));
          }
        }}
        onDoubleClick={() => {
          if (!isSmallRefitViewport) return;
          toggleRefitRemovalLevel3(card.instanceId);
        }}
        onTouchEnd={() => maybeToggleRemovalBySmallScreenDoubleTapLevel3(card.instanceId)}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>
            <ResourceTooltipText text={compactSummary} resources={level3Draft.resources} />
          </span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} resources={level3Draft.resources} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
        <div
          className={styles.retainCounterControls}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <label className={styles.startMenuMuted} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <input
              type="checkbox"
              checked={removed}
              onChange={() => toggleRefitRemovalLevel3(card.instanceId)}
            />
            {t("menu.refit.removeToggle")}
          </label>
        </div>
      </div>
    );
  };

  const renderLevel3FixedNewCardPreviewRow = (templateId: CardTemplateId, rowKey: string) => {
    if (!level3Draft) return null;
    const tmpl = getCardTemplate(templateId);
    const visibleTags = displayRefitTags("continuity", tmpl.tags);
    const title = cardLabelWithIcon(templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === rowKey;
    const tagChips =
      visibleTags.length > 0 ? (
        <div className={styles.badgeRow}>
          {visibleTags.map((tag) => (
            <span key={`${rowKey}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={rowKey}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === rowKey ? null : rowKey))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === rowKey ? null : rowKey));
          }
        }}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>
            <ResourceTooltipText text={compactSummary} resources={level3Draft.resources} />
          </span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} resources={level3Draft.resources} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const level3RefitScreen = level3Draft ? (
    <div
      className={styles.startMenuScreen}
      style={backdropStyle(SUNKING_CH3_ID)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level3-refit-title"
    >
      <div className={`${styles.modal} ${styles.modalGlass}`}>
        <div className={styles.startMenuHeader}>
          <h2 id="level3-refit-title" className={styles.startMenuTitle}>
            {t("menu.refit.titleChapter3")}
          </h2>
          <LanguageToggle />
        </div>
        <div className={styles.startMenuForm}>
          <p className={styles.startMenuMuted}>{t("menu.refit.subtitle")}</p>
          <p className={styles.startMenuMuted}>
            {level3Draft.mode === "continuity"
              ? t("menu.refit.mode.continuityChapter3")
              : t("menu.refit.mode.standaloneChapter3")}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.resources", {
              treasury: level3Draft.resources.treasuryStat,
              power: level3Draft.resources.power,
              legitimacy: level3Draft.resources.legitimacy,
            })}
          </p>
          <p className={styles.startMenuMuted}>{t("menu.refit.startYear", { year: level3Draft.calendarStartYear })}</p>
          <>
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.adjustable")}</h3>
            <p className={styles.startMenuMuted}>
              {t("menu.refit.continuityRuleChapter3", { max: LEVEL2_CONTINUITY_MAX_REMOVALS })}
            </p>
            {isSmallRefitViewport ? (
              <p className={styles.startMenuMuted}>{t("menu.refit.mobileDoubleToggleHint")}</p>
            ) : null}
            {level3Draft.carryoverCards.map((card) => renderLevel3RefitCardRow(card))}
            <h3 className={styles.statusSectionTitle}>{t(CHAPTER3_REFIT_NEW_CARDS_LABEL_KEY)}</h3>
            {LEVEL3_REFIT_NEW_CARDS.map((id, idx) =>
              renderLevel3FixedNewCardPreviewRow(id, `preview-ch3-${idx}-${id}`),
            )}
          </>
          {level3Validation ? (
            <>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.totalCards.simple", { current: level3Validation.totalCards })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.newCardTotal", {
                  current: level3Validation.totalNewCards,
                  max: LEVEL3_REFIT_NEW_CARDS.length,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.baseAdjustTotal", {
                  current: level3Validation.adjustableChanges,
                  max: level3Validation.maxAdjustableChanges,
                })}
              </p>
              {!level3Validation.isValid ? (
                <p className={styles.startMenuError}>{t("menu.refit.invalid")}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className={styles.btn} onClick={resetLevel3Refit}>
              {t("menu.refit.reset")}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!level3Validation?.isValid}
              onClick={confirmLevel3Refit}
            >
              {t("menu.refit.startChapter3")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                onCancel();
              }}
            >
              {t("menu.refit.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const level2RefitScreen = level2Draft ? (
    <div
      className={styles.startMenuScreen}
      style={backdropStyle(SUNKING_CH2_ID)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level2-refit-title"
    >
      <div className={`${styles.modal} ${styles.modalGlass}`}>
        <div className={styles.startMenuHeader}>
          <h2 id="level2-refit-title" className={styles.startMenuTitle}>
            {t("menu.refit.title")}
          </h2>
          <LanguageToggle />
        </div>
        <div className={styles.startMenuForm}>
          <p className={styles.startMenuMuted}>{t("menu.refit.subtitle")}</p>
          <p className={styles.startMenuMuted}>
            {level2Draft.mode === "continuity"
              ? t("menu.refit.mode.continuity")
              : t("menu.refit.mode.standalone")}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.resources", {
              treasury: level2Draft.resources.treasuryStat,
              power: level2Draft.resources.power,
              legitimacy: level2Draft.resources.legitimacy,
            })}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.startYear", { year: level2Draft.calendarStartYear })}
          </p>
          <p className={styles.startMenuMuted}>
            {level2Draft.mode === "continuity" && !level2Draft.warOfDevolutionAttacked
              ? t("menu.refit.europeAlertOnLow")
              : t("menu.refit.europeAlertOn")}
          </p>
          <>
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.adjustable")}</h3>
            <p className={styles.startMenuMuted}>
              {t("menu.refit.continuityRule", { max: LEVEL2_CONTINUITY_MAX_REMOVALS })}
            </p>
            {isSmallRefitViewport ? (
              <p className={styles.startMenuMuted}>{t("menu.refit.mobileDoubleToggleHint")}</p>
            ) : null}
            {level2Draft.carryoverCards.map((card) => renderContinuityCardRow(card))}
            <h3 className={styles.statusSectionTitle}>{t(LEVEL2_REFIT_NEW_CARDS_LABEL_KEY)}</h3>
            {LEVEL2_REFIT_NEW_CARDS.map((id) => renderFixedNewCardPreviewRow(id))}
          </>
          {level2Validation ? (
            <>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.totalCards.simple", { current: level2Validation.totalCards })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.newCardTotal", {
                  current: level2Validation.totalNewCards,
                  max: LEVEL2_REFIT_NEW_CARDS.length,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.baseAdjustTotal", {
                  current: level2Validation.adjustableChanges,
                  max: level2Validation.maxAdjustableChanges,
                })}
              </p>
              {!level2Validation.isValid ? (
                <p className={styles.startMenuError}>{t("menu.refit.invalid")}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className={styles.btn} onClick={resetLevel2Refit}>
              {t("menu.refit.reset")}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!level2Validation?.isValid}
              onClick={confirmLevel2Refit}
            >
              {t("menu.refit.start")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                onCancel();
              }}
            >
              {t("menu.refit.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
  return level2RefitScreen ?? level3RefitScreen ?? null;
}
