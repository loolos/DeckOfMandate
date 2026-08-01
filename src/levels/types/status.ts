import type { ResourceStat } from "./effect";
import type { CardTag } from "./tags";
import type { MessageKey } from "../../locales/en";

/**
 * Runtime row shown in the status bar. Start-of-year kinds tick down inside `beginYear`
 * once the draw has consumed them; action-phase kinds (`blockCardTag`,
 * `retentionCapacityDelta`) tick at the end of the year instead, so a status granted by an
 * unresolved event penalty still covers the whole of the following year. See
 * `logic/playerStatusTick.ts`.
 */
export type PlayerStatusKind =
  | "drawAttemptsDelta"
  | "retentionCapacityDelta"
  | "handCapDelta"
  | "blockCardTag"
  | "beginYearResourceDelta";

export type BeginYearStatusResource = ResourceStat;

/** Registry of status template ids; campaign packs merge their ids in via `declare module`. */
export interface StatusTemplateIdRegistry {}
export type StatusTemplateId = keyof StatusTemplateIdRegistry & string;

/** Static definition for a player status template (drives UI keys and effect shape). */
export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: BeginYearStatusResource;
  blockedTag?: CardTag;
  titleKey: MessageKey;
  /** Historical-background copy; required for every status (enforced by `contentCompleteness.test.ts`). */
  historyKey: MessageKey;
  /**
   * Mechanics-only copy (`status.<id>.desc` or an existing detail/hint key). Shown in the
   * status bar; must state the concrete gameplay effect even when the template's numeric
   * delta is 0 and the real effect lives in engine hooks.
   */
  descKey: MessageKey;
};

export type PlayerStatusInstance = {
  instanceId: string;
  templateId: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: BeginYearStatusResource;
  blockedTag?: CardTag;
  turnsRemaining: number;
};
