import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getCampaignEntry, getDefaultCampaignId } from "../levels/campaignEntries";

type CampaignShellContextValue = {
  activeCampaignId: string;
  selectCampaign: (id: string) => void;
};

const CampaignShellContext = createContext<CampaignShellContextValue | null>(null);

export function useCampaignShell(): CampaignShellContextValue {
  const ctx = useContext(CampaignShellContext);
  if (!ctx) throw new Error("useCampaignShell must be used inside <CampaignShell>");
  return ctx;
}

/** Renders the active campaign's root; campaigns switch from their own start menus. */
export function CampaignShell(): ReactNode {
  const [activeCampaignId, setActiveCampaignId] = useState(getDefaultCampaignId);
  const value = useMemo(
    () => ({
      activeCampaignId,
      selectCampaign: (id: string) => {
        if (getCampaignEntry(id)) setActiveCampaignId(id);
      },
    }),
    [activeCampaignId],
  );
  const entry = getCampaignEntry(activeCampaignId);
  if (!entry) return null;
  const Root = entry.Root;
  return (
    <CampaignShellContext.Provider value={value}>
      <Root key={entry.id} />
    </CampaignShellContext.Provider>
  );
}
