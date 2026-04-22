import type { LevelId } from "../data/levels";
import { getStatusTemplate } from "../data/statusTemplates";
import { findScriptedCalendarConfig } from "./scriptedCalendar";
import { getResourceIcon } from "./icons";
import type { MessageKey } from "../locales";
import type { CardTemplate } from "../levels/types/card";
import type { Effect } from "../levels/types/effect";
import type { EventTemplate } from "../levels/types/event";

/** Compact emoji + signed numbers for one effect (no prose). */
export function formatEffectChips(effects: readonly Effect[]): string {
  if (effects.length === 0) return "";
  return effects.map(formatSingleEffectChip).join(" · ");
}

function formatSingleEffectChip(e: Effect): string {
  switch (e.kind) {
    case "modResource":
      return `${getResourceIcon(e.resource)}${signedInt(e.delta)}`;
    case "modSuccessionTrack":
      return `⚖️${signedInt(e.delta)}`;
    case "gainFunding":
      return `${getResourceIcon("funding")}+${e.amount}`;
    case "drawCards":
      return `🃏+${e.count}`;
    case "scheduleNextTurnDrawModifier":
      return `📜${signedInt(e.delta)}`;
    case "scheduleNextTurnFundingIncomeModifier":
      return `💰⌛${signedInt(e.delta)}`;
    case "opponentNextTurnDrawModifier":
      return `👊🃏${signedInt(e.delta)}`;
    case "opponentHandDiscardNow":
      return `👊🃏−${e.count}`;
    case "modOpponentStrength":
      return `👊${signedInt(e.delta)}`;
    case "scheduleDrawModifiers":
      return `📜${e.deltas.map((d) => signedInt(d)).join("/")}`;
    case "addCardsToDeck":
      return `🧩+${e.count}`;
    case "addPlayerStatus": {
      const st = getStatusTemplate(e.templateId);
      if (st.kind === "drawAttemptsDelta") {
        return `📜${signedInt(st.delta ?? 0)}×${e.turns}⌛`;
      }
      if (st.kind === "beginYearResourceDelta") {
        const resource = st.resource ?? "legitimacy";
        return `${getResourceIcon(resource)}${signedInt(st.delta ?? 0)}×${e.turns}⌛`;
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
  if (sk.kind === "nantesPolicyChoice") {
    return `☯️ | ⚔️`;
  }
  if (sk.kind === "localWarChoice") {
    return `⚔️ | 🕊️`;
  }
  if (sk.kind === "dualFrontCrisisChoice") {
    return "—";
  }
  if (sk.kind === "louisXivLegacyChoice") {
    return "—";
  }
  return `🛡️ · ${getResourceIcon("funding")}1`;
}

function eventSolveOutcomeChips(tmpl: EventTemplate): string {
  if (tmpl.solve.kind === "localWarChoice") {
    return `${getResourceIcon("power")}+1/${signedInt(-1)} · ${getResourceIcon("legitimacy")}+1/${signedInt(-1)}`;
  }
  if (tmpl.id === "bavarianCourtRealignment" || tmpl.id === "imperialElectorsMood") {
    const solvedEffects = tmpl.onFundSolveEffects ?? [];
    const chips = formatEffectChips(solvedEffects);
    const drawChip = "👊🃏+1";
    return chips ? `${chips} · ${drawChip}` : drawChip;
  }
  const solvedEffects = tmpl.onFundSolveEffects ?? [];
  const chips = formatEffectChips(solvedEffects);
  if (chips !== "") return chips;
  return "✅";
}

function eventYearEndChips(tmpl: EventTemplate): string | null {
  if (!tmpl.harmful && tmpl.penaltiesIfUnresolved.length === 0) {
    return "∅";
  }
  if (tmpl.id === "powerVacuum") {
    return "🚨+1⌛";
  }
  if (tmpl.id === "localWar") {
    return `${getResourceIcon("funding")}-2`;
  }
  const p = formatEffectChips(tmpl.penaltiesIfUnresolved);
  return p === "" ? "—" : p;
}

export type QuickFrameRow = { labelKey: MessageKey; value: string; muted?: boolean };

export function buildCardQuickFrameRows(tmpl: CardTemplate, costValue = tmpl.cost): QuickFrameRow[] {
  const cost: QuickFrameRow = {
    labelKey: "ui.quickFrame.cost",
    value: `${getResourceIcon("funding")} ${costValue}`,
  };
  if (tmpl.id === "crackdown" || tmpl.id === "diplomaticIntervention") {
    return [
      cost,
      {
        labelKey: "ui.quickFrame.onPlay",
        value: `🛡️1 · 🚫🤝`,
      },
    ];
  }
  if (tmpl.id === "jansenistReservation") {
    return [
      cost,
      {
        labelKey: "ui.quickFrame.onPlay",
        value: "🏷️←",
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
  const turnSpanRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.yearEnd",
    value: `${cfg.presenceStartYear}–${cfg.presenceEndYear}`,
    muted: true,
  };
  return [pay, solvedRow, turnSpanRow];
}

export function buildEventQuickFrameRows(tmpl: EventTemplate): QuickFrameRow[] {
  if (tmpl.id === "localizedSuccessionWar") {
    const yEnd = eventYearEndChips(tmpl);
    return [
      { labelKey: "ui.quickFrame.pay", value: `${getResourceIcon("funding")}4` },
      {
        labelKey: "ui.quickFrame.ifSolved",
        value: "~25% ⚖️−1 · ~25% ⚖️0 · ~25% ⚖️+1 · ~25% ⚖️+2",
      },
      {
        labelKey: "ui.quickFrame.yearEnd",
        value: yEnd ?? "—",
        muted: yEnd === "∅",
      },
    ];
  }
  if (tmpl.id === "dualFrontCrisis") {
    const yEnd = eventYearEndChips(tmpl);
    return [
      { labelKey: "ui.quickFrame.pay", value: "—" },
      {
        labelKey: "ui.quickFrame.ifSolved",
        value: "⚖️−3 · 👊+1 │ ⚖️+1 · 👑−1 · ⛓️+3 · 👊+1",
      },
      {
        labelKey: "ui.quickFrame.yearEnd",
        value: yEnd ?? "—",
        muted: yEnd === "∅",
      },
    ];
  }
  if (tmpl.id === "louisXivLegacy1715") {
    const yEnd = eventYearEndChips(tmpl);
    return [
      { labelKey: "ui.quickFrame.pay", value: "—" },
      {
        labelKey: "ui.quickFrame.ifSolved",
        value: `Regency custody: ${getResourceIcon("power")}-1 · ${getResourceIcon("legitimacy")}-1 · 🧩+1 │ Young king direct rule: ${getResourceIcon("power")}+1 · 🧩+3 · 📜−1×99⌛`,
      },
      {
        labelKey: "ui.quickFrame.yearEnd",
        value: yEnd ?? "—",
        muted: yEnd === "∅",
      },
    ];
  }
  const pay: QuickFrameRow = {
    labelKey: "ui.quickFrame.pay",
    value: eventPayChips(tmpl),
  };
  const solvedRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.ifSolved",
    value: eventSolveOutcomeChips(tmpl),
  };
  const yEnd = eventYearEndChips(tmpl);
  const turnEndRow: QuickFrameRow = {
    labelKey: "ui.quickFrame.yearEnd",
    value: yEnd ?? "—",
    muted: yEnd === "∅",
  };
  return [pay, solvedRow, turnEndRow];
}
