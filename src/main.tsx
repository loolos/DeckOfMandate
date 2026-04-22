import "./levels/load";
import React from "react";
import ReactDOM from "react-dom/client";
import { Game } from "./app/Game";
import { I18nProvider } from "./locales";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <Game />
    </I18nProvider>
  </React.StrictMode>,
);
