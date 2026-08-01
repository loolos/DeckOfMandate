import type { Ref } from "react";
import type { GameAction } from "../app/gameReducer";
import type { GameState } from "../types/game";
import { getCampaignUiComponent } from "../levels/campaignUiRegistry";

/** Delegates to the campaign-registered event panel (solve actions and layouts are campaign-defined). */
export function EventPanel(props: {
  state: GameState;
  dispatch: (a: GameAction) => void;
  scrollContainerRef?: Ref<HTMLDivElement>;
}) {
  const Impl = getCampaignUiComponent("EventPanel");
  return Impl ? <Impl {...props} /> : null;
}
