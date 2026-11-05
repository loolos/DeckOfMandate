// resources
import type { RankId, ResourceInfo } from "../content";

/** 清誉 / 圣宠 are capped by rank; 身子 has its own fixed range; 恨意 is 华妃's meter. */
export type Resource2 = "qingyu" | "shengchong" | "shenzi" | "hate";

export const RESOURCE2_LABEL: Record<Resource2, string> = { qingyu: "清誉", shengchong: "圣宠", shenzi: "身子", hate: "恨意" };
export const RESOURCE2_EMOJI: Record<Resource2, string> = { qingyu: "🪷", shengchong: "👑", shenzi: "🌱", hate: "🔥" };

export type Delta2 = { readonly resource: Resource2; readonly amount: number };

export const SHENZI = { start: 2, max: 6, /** 喜脉概率 = 身子 ÷ divisor（≥ divisor 必定有孕） */ divisor: 5 };
export const HATE = { max: 10, fananResetTo: 6 };

export const STAGE2 = {
  title: "第二关 · 年华未央",
  totalTurns: 30,
  startRank: "changzai" as RankId,
  /** 从主菜单单独开始第二关时的清誉 / 圣宠。 */
  standaloneQingyu: 8,
  standaloneShengchong: 8,
};

/** 贵人考验 (design-stage2.md §12.5). */
export const GUIREN_TRIAL = {
  name: "晋封考验：贵人",
  emoji: "🏮",
  flavor: "宫里要晋一批位分，皇上也问起了碎玉轩。能不能更进一步，就看这几日：圣宠与清誉都要够分量，更要有一回承恩侍寝，让皇上亲眼看一看你。",
  firstTurn: 5,
  lastTurn: 9,
  minShengchong: 9,
  minQingyu: 9,
  promoteTo: "guiren" as RankId,
};

/** 第二关贵人考验通过的剧情文本（日志与晋封弹窗展示）。 */
export const GUIREN_PROMOTION_STORY =
  "晋封的旨意颁下，碎玉轩上下跪了一地谢恩。那一夜的恩宠没有白费，皇上亲口说你“进退有度”。华妃在席间执着酒盏，笑意不达眼底。你垂眸受了贵人的册宝，只觉得那金册沉甸甸的，压着的不是荣光，而是翊坤宫更紧的目光。";

/** Story line and mechanic notes shown on a resource tile (hover / tap); keep in sync with design-stage2.md. */
export const RESOURCE_INFO2: Record<Resource2, ResourceInfo> = {
  qingyu: {
    lore: "宫里人人都盯着你的言行。名声一坏，再得宠也立不住脚。",
    rules: ["降到 0 立即失败。", "上限随位分提高（常在 12、贵人 15、嫔 18）。"],
  },
  shengchong: {
    lore: "皇上的恩宠，是你在后宫里最要紧的依仗，也最招华妃的眼。",
    rules: [
      "降到 0 立即失败。上限同清誉。",
      "达到召幸门槛（常在 6、贵人 / 嫔 8）才有召幸，越高召幸越勤。",
      "到上限时华妃恨意 +1，≤ 4 时 -1（回合开始时判定）。",
    ],
  },
  shenzi: {
    lore: "凤体康泰，方能承雨露、育龙裔；一身安危，皆系于此。",
    rules: ["范围 0–6。", "侍寝后按身子判定有喜，≥ 5 必有。", "降到 0 须卧床静养；有孕则小产。"],
  },
  hate: {
    lore: "你入了华妃的眼。她恨你越深，翊坤宫的手段就来得越密、越狠。",
    rules: [
      "范围 0–10，每回合开始时按当时的恨意决定华妃事件的数量和种类。",
      "到 10 时华妃当场发难，触发【殿前风雨】。",
      "侍寝、晋封、身怀龙裔（每回合）、圣宠到上限会让她更恨你。",
      "失宠（圣宠 ≤ 4）、称病避宠、让她出了气、小产会让她消气。",
    ],
  },
};

/** Notes for the 本回合出牌 tile. */
export const PLAYS_INFO2: ResourceInfo = {
  lore: "一日里能办的事有限，先办哪件、留哪件，全凭你拿主意。",
  rules: [
    "每回合最多打出的手牌数，由位分决定（常在 2、贵人 2、嫔 3）。",
    "【静观其变】本回合 +1；【槿汐相助】的【诸事妥帖】下回合 +1；陵容的联袂可让邻牌不占名额。",
    "【卧床静养】期间每回合最多 1 张。",
  ],
};

/** 召幸 thresholds by rank (§10.1). No 召幸 before the 贵人考验 begins (第 5 回合). */
export const SUMMON_THRESHOLD: Partial<Record<RankId, number>> = { changzai: 6, guiren: 8, pin: 8 };

/** 召幸 interval by how far 圣宠 is above the threshold (§10.1). */
export function summonInterval(excess: number): number {
  if (excess >= 4) return 2;
  if (excess >= 2) return 3;
  return 4;
}
