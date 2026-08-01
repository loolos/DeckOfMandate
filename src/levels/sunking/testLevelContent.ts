import { getLevelContent } from "../../data/levelContent";

/** Test / tooling access to Sun King chapters by stable id. */
export const levelContentByLevelId = {
  get firstMandate() {
    return getLevelContent("firstMandate");
  },
  get secondMandate() {
    return getLevelContent("secondMandate");
  },
};
