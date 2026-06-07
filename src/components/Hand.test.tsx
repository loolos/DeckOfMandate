import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createInitialState } from "../app/initialState";
import { I18nProvider } from "../locales";
import { Hand } from "./Hand";

import "../test/setupLevels";

describe("Hand", () => {
  it("adds localized hover text to resource emoji in hand cards", () => {
    const state = createInitialState(20_001, "firstMandate");

    const html = renderToStaticMarkup(
      <I18nProvider>
        <Hand state={state} dispatch={() => undefined} />
      </I18nProvider>,
    );

    expect(html).toContain('title="Pays cards &amp; events."');
  });
});
