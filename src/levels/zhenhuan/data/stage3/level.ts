// level
import type { RankId, ResourceInfo } from "../content";

export type Resource3 = "qingyu" | "shengchong" | "shenzi";
export type Delta3 = { readonly resource: Resource3; readonly amount: number };
export type Act = 1 | 2 | 3;

export const RESOURCE3_LABEL: Record<Resource3, string> = { qingyu: "清誉", shengchong: "圣宠", shenzi: "身子" };
export const RESOURCE3_EMOJI: Record<Resource3, string> = { qingyu: "🪷", shengchong: "👑", shenzi: "🌱" };

export const STAGE3 = {
  title: "第三关 · 青灯凤阙",
  totalTurns: 33,
  /** 第二幕（甘露寺）从这一回合开始。 */
  act2Start: 11,
  /** 第三幕（移花接木）从这一回合开始。 */
  act3Start: 26,
  confrontTurn: 10,
  /** 寺中阶段（静白嚣张计数、静白刁难）到这一回合为止。 */
  templeLastTurn: 18,
  /** 果郡王翻船（舟覆噩耗）这一回合起，果郡王相助不再是任何事件的解牌。 */
  zhoufuTurn: 25,
  /** 单独开始第三关：嫔、已有孕。 */
  standaloneRank: "pin" as RankId,
  standalonePregnant: true,
  standaloneQingyu: 15,
  standaloneShengchong: 15,
  standaloneShenzi: 4,
  /** 单独开始第三关：从第二关的 6 种把柄里随机带入几种。 */
  standaloneSecrets: 4,
  /** 第 13、16……31 回合末【暗香盈袖】🌱+1。 */
  fragranceTurns: [13, 16, 19, 22, 25, 28, 31] as readonly number[],
  /** 🌟完美：三步在这一回合之前完成。 */
  perfectBefore: 31,
};

export const ACT_TITLE: Record<Act, string> = { 1: "第一幕 · 凤仪之下", 2: "第二幕 · 青灯古佛", 3: "第三幕 · 移花接木" };

/** 第一幕「盛宠招妒」线：圣宠不低于它时，部分事件了结后另扣清誉。 */
export const ENVY_LINE3 = 14;

/** 修行身份（第二、三幕）：比答应还低。 */
export const XIUXING = { name: "修行", draw: 2, plays: 1, cap: 8 };

/** 召幸门槛（同第二关的贵人 / 嫔）。 */
export const SUMMON_THRESHOLD3 = 8;

export const RESOURCE_INFO3: Record<Resource3, ResourceInfo> = {
  qingyu: {
    lore: "宫里宫外，人人都在看你的言行。名声一坏，便再没有回头的路。",
    rules: ["降到 0 立即失败。", "第一幕上限随位分（贵人 15、嫔 18）；进寺后上限 8。"],
  },
  shengchong: {
    lore: "皇上的恩宠。出宫之后，它就被留在了紫禁城里。",
    rules: ["第一幕降到 0 立即失败；达到 8 才有召幸，越高召幸越勤。", "第二、三幕冻结不显示；移花接木的「偶遇」完成时按出宫时的数值恢复。"],
  },
  shenzi: {
    lore: "凤体康泰，方能承雨露、育龙裔。到了寺里，它就是你的命。",
    rules: [
      "范围 0–6。侍寝后按身子 ÷ 5 判定有喜（≥ 5 必定有孕）。",
      "第一幕降到 0 须卧床静养；第二幕降到 0 病死寺中（失败）；第三幕降到 0 小产（失败）。",
    ],
  },
};

export const PLAYS_INFO3: ResourceInfo = {
  lore: "一日里能办的事有限，先办哪件、留哪件，全凭你拿主意。",
  rules: [
    "第一幕由位分决定（贵人 2、嫔 3）；进寺后修行身份只能打 1 张。",
    "【静观其变】【静心忍耐】本回合 +1；【果郡王相助】作为事件的解牌打出时本回合 +1；【槿汐相助】的【诸事妥帖】下回合 +1。",
  ],
};

export const DOUBT = { start: 1, max: 5 };
