import type { MessageKey } from "./en";
import { messagesZhCore } from "./zh.core";
import { sunkingMessagesZh } from "../levels/sunking/sunkingLocales";

/** 合并中文：框架核心 + 太阳王战役关卡文案。 */
export const messagesZh: Record<MessageKey, string> = {
  ...messagesZhCore,
  ...sunkingMessagesZh,
};
