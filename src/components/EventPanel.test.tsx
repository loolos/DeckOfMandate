import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "../locales";
import { createInitialState } from "../app/initialState";
import { EMPTY_EVENT_SLOTS } from "../levels/types/event";
import { EventPanel } from "./EventPanel";

import "../test/setupLevels";

describe("EventPanel", () => {
  it("renders a continued-turns badge for continued3-tagged war of devolution", () => {
    const state = {
      ...createInitialState(20_001, "firstMandate"),
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: {
          instanceId: "e_war_of_devolution",
          templateId: "warOfDevolution" as const,
          resolved: false,
          remainingTurns: 3,
        },
      },
    };

    const html = renderToStaticMarkup(
      <I18nProvider>
        <EventPanel state={state} dispatch={() => undefined} />
      </I18nProvider>,
    );

    expect(html).toContain("Continued 3");
    expect(html).toContain('title="Pays cards &amp; events."');
  });
});
