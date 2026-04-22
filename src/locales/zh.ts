import type { MessageKey } from "./en";
import { messagesZhCore } from "./zh.core";
import { campaignMessagesZh } from "../levels/load";

/** 合并中文：框架核心 + 太阳王战役关卡文案。 */
export const messagesZh: Record<MessageKey, string> = {
  ...messagesZhCore,
  ...campaignMessagesZh,
};
