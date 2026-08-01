import type { Ref } from "react";
import type { GameAction } from "../app/gameReducer";
import type { GameState } from "../types/game";
import { getCampaignUiComponent } from "../levels/campaignUiRegistry";

/** Delegates to the campaign-registered hand panel (costs, tags, and play flow are campaign-defined). */
export function Hand(props: {
  state: GameState;
  dispatch: (a: GameAction) => void;
  scrollContainerRef?: Ref<HTMLDivElement>;
}) {
  const Impl = getCampaignUiComponent("Hand");
  return Impl ? <Impl {...props} /> : null;
}
