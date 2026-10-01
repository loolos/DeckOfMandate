import { useCampaignShell } from "../app/CampaignShell";
import { getCampaignEntries } from "../levels/campaignEntries";
import { useI18n } from "../locales";

type CampaignSwitcherProps = {
  labelClassName?: string;
  selectClassName?: string;
};

/** Start-menu campaign picker; hidden when only one campaign is installed. */
export function CampaignSwitcher({ labelClassName, selectClassName }: CampaignSwitcherProps) {
  const { locale, t } = useI18n();
  const { activeCampaignId, selectCampaign } = useCampaignShell();
  const entries = getCampaignEntries();
  if (entries.length < 2) return null;
  return (
    <>
      <label className={labelClassName} htmlFor="start-menu-campaign">
        {t("menu.campaignLabel")}
      </label>
      <select
        id="start-menu-campaign"
        className={selectClassName}
        value={activeCampaignId}
        onChange={(e) => selectCampaign(e.target.value)}
      >
        {entries.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label(locale)}
          </option>
        ))}
      </select>
    </>
  );
}
