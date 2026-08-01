/**
 * Sun King status-bar rows: succession track, Europe Alert pressure, Anti-French League,
 * and per-status template rendering. Registered through `registerCampaignStatusRowsBuilder`;
 * the framework `StatusBar` only renders the rows produced here.
 */
import { getStatusTemplate } from "../../../data/statusTemplates";
import { tryGetLevelDef } from "../../../data/levels";
import type { MessageKey } from "../../../locales";
import type { GameState } from "../../../types/game";
import type { PlayerStatusInstance } from "../../types/status";
import type { CampaignStatusRow, UiTranslator } from "../../campaignUiRegistry";
import { antiFrenchSentimentEmotionValue } from "../logic/antiFrenchSentiment";
import styles from "../../../app/Game.module.css";

type EuropeAlertStage = "eased" | "alert" | "containment" | "hostile" | "conflict";

function signedValue(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function europeAlertStage(progress: number): EuropeAlertStage {
  if (progress <= 2) return "eased";
  if (progress <= 4) return "alert";
  if (progress <= 6) return "containment";
  if (progress <= 8) return "hostile";
  return "conflict";
}

function statusDetail(status: PlayerStatusInstance, t: UiTranslator): string {
  if (status.kind === "drawAttemptsDelta") {
    const delta = status.delta ?? 0;
    if (delta === 0) return "";
    return t("ui.statusDetail.drawAttemptsDelta", { delta: signedValue(delta) });
  }
  if (status.kind === "retentionCapacityDelta") {
    const delta = status.delta ?? 0;
    if (delta === 0) return "";
    return t("ui.statusDetail.retentionCapacityDelta", { delta: signedValue(delta) });
  }
  if (status.kind === "handCapDelta") {
    const delta = status.delta ?? 0;
    if (delta === 0) return "";
    return t("ui.statusDetail.handCapDelta", { delta: signedValue(delta) });
  }
  if (status.kind === "beginYearResourceDelta") {
    const delta = status.delta ?? 0;
    if (delta === 0) return "";
    const resource = status.resource ?? "legitimacy";
    return t("ui.statusDetail.beginYearResourceDelta", {
      resource: t(`resource.${resource}` as MessageKey),
      delta: signedValue(delta),
    });
  }
  const tagKey = `card.tag.${status.blockedTag ?? "royal"}` as MessageKey;
  return t("ui.statusDetail.blockCardTag", { tag: t(tagKey) });
}

export function buildSunkingStatusRows(state: GameState, t: UiTranslator): CampaignStatusRow[] {
  const levelDef = tryGetLevelDef(state.levelId);
  const gatedEuropePressureChapter =
    levelDef?.victoryRule.kind === "gated" && levelDef.features.europeAlertMechanics;
  const containmentHintKey = gatedEuropePressureChapter
    ? ("status.huguenotContainment.hint" as MessageKey)
    : ("status.huguenotContainment.hintGeneral" as MessageKey);
  const antiFrenchSentimentEmotion = antiFrenchSentimentEmotionValue(state);
  const next: CampaignStatusRow[] = [];

  const successionTrackUiActive =
    levelDef?.victoryRule.kind === "successionWar" && state.outcome === "playing" && !state.warEnded;
  if (successionTrackUiActive) {
    const clamped = Math.max(-10, Math.min(10, Math.floor(state.successionTrack)));
    const signed = clamped > 0 ? `+${clamped}` : `${clamped}`;
    next.push({
      id: "successionTrack",
      title: t("ui.successionStatus.title"),
      compactMeta: signed,
      meta: `${signed} / ±10`,
      detail: t("ui.successionStatus.detail"),
      hideMetaWhenExpandedOnMobile: true,
      progress: {
        pct: Math.max(0, Math.min(100, ((clamped + 10) / 20) * 100)),
        trackClassName: styles.successionProgressTrack ?? "",
        fillClassName: styles.successionProgressFill ?? "",
      },
    });
  }

  if (state.europeAlert && state.outcome === "playing") {
    const progress = Math.max(1, Math.min(10, state.europeAlertProgress ?? 3));
    const stage = europeAlertStage(progress);
    const hint = t("status.europeAlert.hint");
    const history = t("status.europeAlert.history");
    const stageName = t(`status.europeAlert.stage.${stage}.name` as MessageKey);
    const stageDesc = t(`status.europeAlert.stage.${stage}.desc` as MessageKey);
    next.push({
      id: "europeAlert",
      title: `${t("status.europeAlert.name")} ${progress}/10`,
      compactMeta: "",
      meta: "",
      detail: `${stageName}：${stageDesc} ${hint} ${history}`.trim(),
      hideMetaWhenExpandedOnMobile: true,
      progress: {
        pct: progress * 10,
        trackClassName: styles.europeAlertProgressTrack ?? "",
        fillClassName: styles.europeAlertProgressFill ?? "",
      },
    });
  }

  const coalitionActive =
    !!state.antiFrenchLeague && state.turn <= state.antiFrenchLeague.untilTurn && state.outcome === "playing";
  if (coalitionActive) {
    const pct = state.antiFrenchLeague ? Math.round(state.antiFrenchLeague.drawPenaltyProbability * 100) : 0;
    const hint = t("status.antiFrenchLeague.hint", { pct });
    const history = t("status.antiFrenchLeague.history");
    next.push({
      id: "antiFrenchLeague",
      title: t("status.antiFrenchLeague.name"),
      compactMeta: hint,
      meta: hint,
      detail: `${hint} ${history}`.trim(),
    });
  }

  for (const row of state.playerStatuses) {
    const tmpl = getStatusTemplate(row.templateId);
    const turnsText =
      row.templateId === "religiousTolerance"
        || row.templateId === "antiFrenchSentiment"
        || row.templateId === "greatPowerEncirclement"
        ? t("ui.statusPermanent")
        : row.templateId === "huguenotContainment"
          ? t("ui.statusHuguenotRemaining", { n: row.turnsRemaining })
          : t("ui.statusTurnsRemaining", { n: row.turnsRemaining });
    const history = t(tmpl.historyKey);
    const effectDetail = statusDetail(row, t);
    // Authored mechanics copy (`descKey`) covers statuses whose numeric delta is 0 and the
    // real effect lives in engine hooks; the two special-cased statuses below keep their
    // parameterized detail rendering instead.
    const mechanics =
      row.templateId === "huguenotContainment" || row.templateId === "antiFrenchSentiment"
        ? effectDetail
        : t(tmpl.descKey) || effectDetail;
    const antiFrenchEmotionLabel =
      row.templateId === "antiFrenchSentiment"
        ? t("status.antiFrenchSentiment.emotionLabel", { x: antiFrenchSentimentEmotion })
        : "";
    next.push({
      id: row.instanceId,
      title:
        row.templateId === "antiFrenchSentiment"
          ? `${t(tmpl.titleKey)} ${antiFrenchEmotionLabel}`.trim()
          : t(tmpl.titleKey),
      compactMeta: turnsText,
      meta: turnsText,
      detail:
        row.templateId === "huguenotContainment"
          ? `${effectDetail} ${history} ${t(containmentHintKey)}`.trim()
          : row.templateId === "antiFrenchSentiment"
            ? `${t("status.antiFrenchSentiment.detail", { x: antiFrenchSentimentEmotion, n: antiFrenchSentimentEmotion * 2 })} ${history}`.trim()
          : `${mechanics} ${history}`.trim(),
    });
  }
  return next;
}
