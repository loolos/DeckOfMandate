// 盟友 / 对头
import type { CardId3 } from "./cards";
import type { CrisisId3, OpportunityId3 } from "./events";
import type { StatusId3 } from "./statuses";

export type AllyId = "duanfei" | "jingfei" | "xin";
export type RivalId = "qifei" | "guaerjia";

export const ALLIES: Record<AllyId, { name: string; status: StatusId3 }> = {
  duanfei: { name: "端妃", status: "duanfeiXianghu" },
  jingfei: { name: "敬妃", status: "jingfeiZhiyi" },
  xin: { name: "欣贵人", status: "xinGuirenZhangyi" },
};

export const RIVALS: Record<RivalId, { name: string }> = { qifei: { name: "齐妃" }, guaerjia: { name: "祺贵人" } };

/** The 打压 status each rival leaves behind. */
export const SUPPRESS_STATUS: Record<RivalId, StatusId3> = { qifei: "dayaQifei", guaerjia: "dayaGuaerjia" };

export type PairId = "yuhuayuan" | "xianfu" | "yanqing";

export const PAIRS: Record<PairId, { name: string; emoji: string; opportunity: OpportunityId3; crisis: CrisisId3; shared: CardId3; ally: AllyId; rival: RivalId }> = {
  yuhuayuan: {
    name: "花苑观芳",
    emoji: "🌸",
    opportunity: "yuhuayuanXin",
    crisis: "yuhuayuanQi",
    shared: "jinyanShenxing",
    ally: "xin",
    rival: "qifei",
  },
  xianfu: {
    name: "咸福代笔",
    emoji: "🧵",
    opportunity: "xianfuJing",
    crisis: "xianfuQi",
    shared: "meizhuangXiangzhu",
    ally: "jingfei",
    rival: "guaerjia",
  },
  yanqing: {
    name: "烛影旧话",
    emoji: "🍵",
    opportunity: "yanqingDuan",
    crisis: "yanqingQi",
    shared: "wenTaiyiZhenzhi",
    ally: "duanfei",
    rival: "qifei",
  },
};
