import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { decodeSession, encodeSession, type SessionRecord } from "./runCode";

/** Minimal wire-format smoke; full session specs live under `src/levels/sunking/logic/runCode.test.ts`. */
describe("runCode façade", () => {
  it("round-trips an empty standalone session", () => {
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: 1, removedIndices: [], actions: [] },
    ];
    const decoded = decodeSession(encodeSession(session));
    expect(decoded.session).toEqual(session);
    expect(decoded.finalState.runSeed).toBe(createInitialState(1, "firstMandate").runSeed);
  });
});
