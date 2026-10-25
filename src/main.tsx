import "./levels/load";
import "./levels/loadUi";
import React from "react";
import ReactDOM from "react-dom/client";
import { CampaignShell } from "./app/CampaignShell";
import { I18nProvider } from "./locales";
import "./styles/global.css";
import { startVersionCheck } from "./app/versionCheck";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <CampaignShell />
    </I18nProvider>
  </React.StrictMode>,
);
startVersionCheck();
