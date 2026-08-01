/**
 * Sun King game-over narrative and in-run goals line. Registered through
 * `registerCampaignOutcomeCopyBuilder` / `registerCampaignTargetsLineBuilder`;
 * the framework shell renders whatever strings come back.
 */
import { getLevelDef, tryGetLevelDef } from "../../../data/levels";
import type { MessageKey } from "../../../locales";
import type { GameState } from "../../../types/game";
import type { CampaignOutcomeCopy, UiTranslator } from "../../campaignUiRegistry";
import { continuityEndingBodyKeys } from "../logic/endingCopy";

function outcomeHeadline(state: GameState, t: UiTranslator): string {
  if (state.outcome === "victory") return t("outcome.victory");
  if (state.outcome === "defeatLegitimacy") return t("outcome.defeatLegitimacy");
  if (state.outcome === "defeatSuccession") return t("outcome.defeatSuccession");
  return t("outcome.defeatTime");
}

export function buildSunkingOutcomeCopy(state: GameState, t: UiTranslator): CampaignOutcomeCopy {
  const headline = outcomeHeadline(state, t);
  const level = tryGetLevelDef(state.levelId);
  const ending = level?.ending;
  if (!ending) return { headline, paragraphs: [] };

  const successionLevel = level.victoryRule.kind === "successionWar";
  const paragraphs: string[] = [];

  if (state.outcome === "victory") {
    const continuityKeys = continuityEndingBodyKeys(ending, state);
    const successionTrackCapVictory =
      successionLevel && state.successionTrack >= 10 && ending.victorySuccessionTrackCapBodyKey != null;
    const settlementTier = state.utrechtSettlementTier ?? state.successionOutcomeTier;
    const tierVictoryKey =
      successionLevel && !successionTrackCapVictory && settlementTier && ending.victoryBodyByTierKeys?.[settlementTier]
        ? ending.victoryBodyByTierKeys[settlementTier]
        : null;
    const victoryMainKey =
      successionTrackCapVictory && ending.victorySuccessionTrackCapBodyKey
        ? ending.victorySuccessionTrackCapBodyKey
        : tierVictoryKey ?? ending.victoryBodyKey;

    if (successionLevel && !successionTrackCapVictory && settlementTier) {
      paragraphs.push(t(`outcome.utrechtVictoryEpilogue.${settlementTier}` as MessageKey));
    }
    paragraphs.push(t(victoryMainKey as MessageKey));
    if (successionLevel && !successionTrackCapVictory && state.successionOutcomeTier) {
      const tier = state.utrechtSettlementTier ?? state.successionOutcomeTier;
      paragraphs.push(t(`outcome.successionCalendar1720Extra.${tier}` as MessageKey));
    }
    if (continuityKeys.length > 0) {
      for (const key of continuityKeys) paragraphs.push(t(key as MessageKey));
    } else if (state.warOfDevolutionAttacked) {
      paragraphs.push(t(ending.victoryWarDevolutionExtraKey as MessageKey));
    }
    return { headline, paragraphs };
  }

  const hasHuguenotContainment = state.playerStatuses.some((s) => s.templateId === "huguenotContainment");
  const defeatMainKey =
    state.outcome === "defeatTime" && hasHuguenotContainment && ending.defeatTimeWithHuguenotContainmentBodyKey
      ? ending.defeatTimeWithHuguenotContainmentBodyKey
      : successionLevel && state.outcome === "defeatSuccession" && ending.defeatSuccessionTrackFloorBodyKey
        ? ending.defeatSuccessionTrackFloorBodyKey
        : ending.defeatBodyKey;
  paragraphs.push(t(defeatMainKey as MessageKey));
  for (const key of continuityEndingBodyKeys(ending, state)) {
    paragraphs.push(t(key as MessageKey));
  }
  return { headline, paragraphs };
}

export function buildSunkingTargetsLine(state: GameState, turnLimit: number, t: UiTranslator): string {
  const level = getLevelDef(state.levelId);
  const vars = {
    limit: turnLimit,
    tT: level.winTargets.treasuryStat,
    tP: level.winTargets.power,
    tL: level.winTargets.legitimacy,
  };
  return t((level.targetsUiKey ?? "ui.targets") as MessageKey, vars);
}
