import type { TutorialOverlayCustom } from "../../../components/LevelTutorialOverlay";

/**
 * 界面教程：只介绍各区域的用途，不涉及任何事件、剧情或后续回合的内容（避免剧透）。
 * 三关共用同一套区域 id（见各关 Game 组件里的 zh-tut-*）；当前关卡里不存在的区域会被自动跳过。
 */
export const ZH_TUTORIAL: TutorialOverlayCustom = {
  copy: { title: "界面教程", skip: "跳过教程", back: "上一步", next: "下一步", done: "完成" },
  steps: [
    {
      targetId: "zh-tut-header",
      body: "顶部是关卡信息：当前回合、位分，以及每回合抓牌、出牌的数量。右侧可以随时查看规则、重新开始或返回菜单。",
    },
    {
      targetId: "zh-tut-stats",
      body: "这一排是你的资源与牌堆：清誉、圣宠等数值归零会导致失败；还能看到本回合已出的牌数。悬浮或点按抽牌堆、弃牌堆与各事件牌池，可以查看里面的内容。下方一行是你身上的状态。",
    },
    {
      targetId: "zh-tut-events",
      body: "这里是本回合的事件。每张事件牌上写明了处理方式与不处理的后果，需要用手牌来应对；点按卡片可以展开细读。",
    },
    {
      targetId: "zh-tut-hand",
      body: "这是你的手牌。双击一张牌即可打出，每回合能打出的数量有限。卡面会提示它能处理哪些事件。",
    },
    {
      targetId: "zh-tut-endturn",
      body: "出完牌后点这里（或按空格）结束回合。若还有提示文字，会说明此刻为何不能结束。",
    },
    {
      targetId: "zh-tut-log",
      body: "最下方是行动记录，按顺序写着每回合发生的事与数值变化；这里还可以复制或读取存档码，换设备接着玩。",
    },
  ],
};

const KEY = "deck-of-mandate.zhenhuan.tutorialOnEntry.v1";

/** 默认开启：从未设置过时返回 true（第一次玩自动显示），看完一次后会写入 false。 */
export function readZhTutorialOnEntry(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

export function writeZhTutorialOnEntry(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    /* ignore quota / privacy mode */
  }
}
