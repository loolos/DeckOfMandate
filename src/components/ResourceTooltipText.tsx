import type { ReactNode } from "react";
import { getResourceIcon } from "../logic/icons";
import { drawAttemptsFromPower } from "../logic/drawScaling";
import { useI18n, type MessageKey } from "../locales";
import type { Resources } from "../types/game";
import styles from "../app/Game.module.css";

type ResourceKey = keyof Resources;

const RESOURCE_KEYS = ["funding", "treasuryStat", "power", "legitimacy"] as const satisfies readonly ResourceKey[];
const HINT_FOR_KEY: Record<ResourceKey, MessageKey> = {
  funding: "resource.funding.hint",
  treasuryStat: "resource.treasuryStat.hint",
  power: "resource.power.hint",
  legitimacy: "resource.legitimacy.hint",
};
const RESOURCE_ICON_ENTRIES = RESOURCE_KEYS.map((key) => [getResourceIcon(key), key] as const);

function powerThresholdForDraw(draws: number): number {
  if (draws <= 1) return 1;
  return 1 + ((draws - 1) * draws) / 2;
}

function powerHint(
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  resources: Resources | undefined,
): string {
  const powerDraws = drawAttemptsFromPower(resources?.power ?? 1);
  const nextPower = powerThresholdForDraw(powerDraws + 1);
  const dropPower = powerDraws <= 1 ? null : powerThresholdForDraw(powerDraws) - 1;
  return dropPower === null
    ? t("resource.power.hint.min", { current: powerDraws, next: nextPower })
    : t("resource.power.hint", { current: powerDraws, next: nextPower, prev: dropPower });
}

function resourceHint(
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  resource: ResourceKey,
  resources: Resources | undefined,
): string {
  return resource === "power" ? powerHint(t, resources) : t(HINT_FOR_KEY[resource]);
}

function resourceForIconAt(text: string, index: number, icon: string, resource: ResourceKey): ResourceKey | null {
  if (resource !== "legitimacy") return resource;
  const before = text.slice(index - "🚫".length, index);
  const after = text.slice(index + icon.length, index + icon.length + "×".length);
  return before === "🚫" || after === "×" ? null : resource;
}

export function ResourceTooltipIcon({
  resource,
  resources,
  className,
}: {
  resource: ResourceKey;
  resources?: Resources;
  className?: string;
}) {
  const { t } = useI18n();
  const hint = resourceHint(t, resource, resources);
  return (
    <span className={[styles.resourceIcon, className].filter(Boolean).join(" ")} title={hint} aria-label={hint}>
      {getResourceIcon(resource)}
    </span>
  );
}

export function ResourceTooltipText({ text, resources }: { text: string; resources?: Resources }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    let nextIndex = -1;
    let nextIcon = "";
    let nextResource: ResourceKey | null = null;

    for (const [icon, resource] of RESOURCE_ICON_ENTRIES) {
      const index = text.indexOf(icon, cursor);
      if (index === -1 || (nextIndex !== -1 && index >= nextIndex)) continue;
      nextIndex = index;
      nextIcon = icon;
      nextResource = resourceForIconAt(text, index, icon, resource);
    }

    if (nextIndex === -1) {
      nodes.push(text.slice(cursor));
      break;
    }

    if (nextIndex > cursor) nodes.push(text.slice(cursor, nextIndex));
    if (nextResource) {
      nodes.push(<ResourceTooltipIcon key={`resource-icon-${key++}`} resource={nextResource} resources={resources} />);
    } else {
      nodes.push(nextIcon);
    }
    cursor = nextIndex + nextIcon.length;
  }

  return <>{nodes}</>;
}
