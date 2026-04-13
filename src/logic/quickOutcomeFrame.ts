import type { LevelId } from "../data/levels";
import { getStatusTemplate } from "../data/statusTemplates";
import { findScriptedCalendarConfig } from "./scriptedCalendar";
import { getResourceIcon } from "./icons";
import type { MessageKey } from "../locales";
import type { CardTemplate } from "../types/card";
import type { Effect } from "../types/effect";
import type { EventTemplate } from "../types/event";

/** Compact emoji + signed numbers for one effect (no prose). */
export function formatEffectChips(effects: readonly Effect[]): string {
  if (effects.length === 0) return "";
  return effects.map(formatSingleEffectChip).join(" · ");
}

function formatSingleEffectChip(e: Effect): string {
  switch (e.kind) {
    case "modResource":
      return `${getResourceIcon(e.resource)}${signedInt(e.delta)}`;
    case "gainFunding":
      return `${getResourceIcon("funding")}+${e.amount}`;
    case "drawCards":
      return `🃏+${e.count}`;
    case "scheduleNextTurnDrawModifier":
      return `📜${signedInt(e.delta)}`;
    case "addPlayerStatus": {
      const st = getStatusTemplate(e.templateId);
      if (st.kind === "drawAttemptsDelta") {
        return `📜${signedInt(st.delta ?? 0)}×${e.turns}⌛`;
      }
      if (st.kind === "retentionCapacityDelta") {
        return `🖐️${signedInt(st.delta ?? 0)}×${e.turns}⌛`;
      }
      if (st.kind === "blockCardTag") {
        return `🚫👑×${e.turns}⌛`;
      }
      return `⚠️×${e.turns}⌛`;
    }
    default: {
      const _ex: never = e;
      return _ex;
    }
  }
}

function signedInt(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function eventPayChips(tmpl: EventTemplate): string {
  const sk = tmpl.solve;
  if (sk.kind === "funding") {
    return `${getResourceIcon("funding")}${sk.amount}`;
  }
  if (sk.kind === "fundingOrCrackdown") {
    return `${getResourceIcon("funding")}${sk.amount} | 🛡️`;
  }
  if (sk.kind === "scriptedAttack") {
    return `⚔️`;
  }
  return `🛡️ · ${getResourceIcon("funding")}1`;
}

function eventSolveOutcomeChips(tmpl: EventTemplate): string {
  const solvedEffects = tmpl.onFundSolveEffects ?? [];
  const chips = formatEffectChips(solvedEffects);
  if (chips !== "") return chips;
  return "✅";
}

function eventYearEndChips(tmpl: EventTemplate): string | null {
  if (!tmpl.harmful) {
    return "∅";
  }
  if (tmpl.id === "powerVacuum") {
    return "🚨+1⌛";
  }
  if (tmpl.id === "grainReliefCrisis") {
    return `👑-2`;
  }
  const p = formatEffectChips(tmpl.penaltiesIfUnresolved);
  return p === "" ? "—" : p;
}

export type QuickFrameRow = { labelKey: MessageKey; value: string; muted?: boolean };

export function buildCardQuickFrameRows(tmpl: CardTemplate): QuickFrameRow[] {
  const cost: QuickFrameRow = {
    labelKey: "ui.quickFrame.cost",
    value: `${getResourceIcon("funding")} ${tmpl.cost}`,
  };
  if (tmpl.id === "crackdown") {
    return [
      cost,
      {
        labelKey: "ui.quickFrame.onPlay",
        value: `🛡️1 · 🚫🤝`,
      },
    ];
  }
  const fx = formatEffectChips(tmpl.effects);
  return [
    cost,
    {
      labelKey: "ui.quickFrame.onPlay",
      value: fx === "" ? "—" : fx,
      muted: fx === "",
    },
  ];
}

/** Uses level scripted calendar config when `tmpl` is a scripted attack row. */
export function buildScriptedEventQuickFrameRows(levelId: LevelId, tmpl: EventTemplate): QuickFrameRow[] | null {
  if (tmpl.solve.kind !== "scriptedAttack") return null;
  const cfg = findScriptedCalendarConfig(levelId, tmpl.id);
  if (!cfg?.attack || !cfg.antiCoalition) return null;
  const pctTreasury = Math.round(cfg.attack.extraTreasuryProbability * 100);
  const pctCoalition = Math.round(cfg.antiCoalition.drawPenaltyProbability * 100);
  const pay: QuickFrameRow = {
    labelKey: "ui.quickFrame.pay",
    value: `${getResourceIcon("funding")}${cfg.attack.fundingCost} · ⚔️`,
  };
  const solvedRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.ifSolved",
    value: `${getResourceIcon("power")}+${cfg.attack.powerDelta} · ~${pctTreasury}% ${getResourceIcon("treasuryStat")}+${cfg.attack.extraTreasuryDelta} · ~${pctCoalition}%📜-1`,
  };
  const yearRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.yearEnd",
    value: `${cfg.presenceStartYear}–${cfg.presenceEndYear}`,
    muted: true,
  };
  return [pay, solvedRow, yearRow];
}

export function buildEventQuickFrameRows(tmpl: EventTemplate): QuickFrameRow[] {
  const pay: QuickFrameRow = {
    labelKey: "ui.quickFrame.pay",
    value: eventPayChips(tmpl),
  };
  const solvedRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.ifSolved",
    value: eventSolveOutcomeChips(tmpl),
  };
  const yEnd = eventYearEndChips(tmpl);
  const yearRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.yearEnd",
    value: yEnd ?? "—",
    muted: yEnd === "∅",
  };
  return [pay, solvedRow, yearRow];
}
