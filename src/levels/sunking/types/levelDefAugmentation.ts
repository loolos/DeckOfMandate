/**
 * Attaches this campaign's level-configuration fields to the framework `LevelDef`,
 * `LevelContent`, and bootstrap-kind registries. Shapes live in `./levelConfig.ts`.
 */
import type { SunkingLevelContentFields, SunkingLevelDefFields } from "./levelConfig";

declare module "../../../data/levelTypes" {
  interface CampaignLevelBootstrapRegistry {
    chapter2Standalone: true;
    chapter3Standalone: true;
  }

  interface CampaignLevelDefFields extends SunkingLevelDefFields {}

  interface CampaignLevelContentFields extends SunkingLevelContentFields {}
}
