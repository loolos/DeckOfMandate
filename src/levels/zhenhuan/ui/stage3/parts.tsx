import { TIER_LABEL } from "../../data/stage2Content";
import { CARDS3, type CardId3, EVENTS3, type EventId3, PAIRS, RIVALS, type TagId3 } from "../../data/stage3Content";
import type { EventInst3, Z3Action, Z3State } from "../../logic/stage3Engine";
import { TagChip, countBy } from "../common";
import styles from "../zhenhuan.module.css";
import type { ReactNode } from "react";

// ---------------------------------------------------------------- shared parts

export type Dispatch = (a: Z3Action) => void;

export type Props = {
  state: Z3State;
  dispatch: Dispatch;
  runCode: string;
  showRules: boolean;
  onShowRules: (open: boolean) => void;
  onRestart: () => void;
  onMenu: () => void;
  onLoadCode: (raw: string) => { ok: true } | { ok: false; error: string };
};

export function Tag({ tag, tone, dispatch, dim, children }: { tag: TagId3; tone?: string; dispatch: Dispatch; dim?: boolean; children: ReactNode }) {
  return (
    <TagChip tone={[tone, dim && styles.tagDim].filter(Boolean).join(" ")} onExplain={() => dispatch({ type: "explainTag", tag })}>
      {children}
    </TagChip>
  );
}

export function CardList({ ids, empty }: { ids: readonly CardId3[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {CARDS3[id].emoji} {CARDS3[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

export function EventList({ ids, empty }: { ids: readonly EventId3[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {EVENTS3[id].emoji} {EVENTS3[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

export function Chips({ ids, lit }: { ids: readonly CardId3[]; lit: (id: CardId3) => boolean }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} className={[styles.matchChip, lit(id) && styles.matchChipInHand].filter(Boolean).join(" ")}>
          {CARDS3[id].emoji} {CARDS3[id].name}
        </span>
      ))}
    </>
  );
}

export const KIND_TONE = { opportunity: styles.kindOpportunity, crisis: styles.kindCrisis, huanghou: styles.kindHuanghou };
export const CARD_TONE = { opportunity: styles.cardOpportunity, crisis: styles.cardCrisis, huanghou: styles.cardHuanghou };

/** 连环事件的两半在手牌上只列一项：共同前缀（如「花苑观芳」）。 */
export function collapsePairs<T extends { id: EventId3 }>(items: readonly T[]): { key: string; emoji: string; name: string; items: T[] }[] {
  const out: { key: string; emoji: string; name: string; items: T[] }[] = [];
  for (const it of items) {
    const pair = EVENTS3[it.id].pair;
    const key = pair ? `pair:${pair}` : it.id;
    const hit = out.find((o) => o.key === key);
    if (hit) hit.items.push(it);
    else out.push({ key, emoji: pair ? PAIRS[pair].emoji : EVENTS3[it.id].emoji, name: pair ? PAIRS[pair].name : EVENTS3[it.id].name, items: [it] });
  }
  return out;
}


export function resolvedDetail(inst: EventInst3): string {
  const def = EVENTS3[inst.id];
  const by = inst.resolvedBy ? `由【${CARDS3[inst.resolvedBy].name}】` : "";
  const tier = inst.lingrong && inst.resolvedBy === "lingrongXiangzhu" ? `（陵容·${TIER_LABEL[inst.lingrong]}）` : "";
  const suppressed = inst.suppressed && def.rival ? `；打压了${RIVALS[def.rival].name}` : "";
  if (def.kind === "huanghou") return `${by}领受${tier}。`;
  if (def.kind !== "opportunity") return `${by}化解${tier}，回合末不受惩罚${suppressed}。`;
  return `${by}把握${tier}${inst.rewardDoubled ? "（眉庄相助：奖励翻倍）" : ""}。`;
}
