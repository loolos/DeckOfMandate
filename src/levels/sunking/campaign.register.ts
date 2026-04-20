import { registerChapter2StandaloneFactory } from "../../data/levelBootstrap";
import { registerLevel, setDefaultLevelId } from "../../data/levelRegistry";
import { createStandaloneLevel2Draft } from "./chapter2Transition";
import {
  sunkingFirstMandateContent,
  sunkingFirstMandateDef,
  sunkingSecondMandateContent,
  sunkingSecondMandateDef,
} from "./levelData";

function registerSunkingCampaign(): void {
  registerLevel(sunkingFirstMandateDef, sunkingFirstMandateContent);
  registerLevel(sunkingSecondMandateDef, sunkingSecondMandateContent);
  setDefaultLevelId("firstMandate");
  registerChapter2StandaloneFactory("secondMandate", createStandaloneLevel2Draft);
}

registerSunkingCampaign();
