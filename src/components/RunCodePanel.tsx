import { useCallback, useState } from "react";
import { useI18n } from "../locales";
import styles from "./RunCodePanel.module.css";

export type RunCodePanelProps = {
  /** `startMenu`: only paste + load (no current code / copy). Default `inGame`. */
  variant?: "inGame" | "startMenu";
  code: string;
  onLoad: (rawHex: string) => { ok: true } | { ok: false; error: string };
};

export function RunCodePanel({ variant = "inGame", code, onLoad }: RunCodePanelProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors silently; user can still select and copy manually
    }
  }, [code]);

  const handleLoad = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const result = onLoad(trimmed);
    if (result.ok) {
      setError(null);
      setDraft("");
    } else {
      setError(result.error);
    }
  }, [draft, onLoad]);

  const isStartMenu = variant === "startMenu";
  const codeLength = code.length;
  const previewSuffix = codeLength > 0 ? `${codeLength}` : "0";

  return (
    <section
      className={isStartMenu ? `${styles.runCodeSection} ${styles.runCodeSectionStartMenu}` : styles.runCodeSection}
      aria-label={isStartMenu ? t("menu.runCodeLoad") : t("runCode.label")}
    >
      <button
        type="button"
        className={isStartMenu ? `${styles.runCodeToggle} ${styles.runCodeToggleStartMenu}` : styles.runCodeToggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.runCodeToggleLabel}>
          {isStartMenu ? t("menu.runCodeLoad") : t("runCode.label")}
        </span>
        {!isStartMenu ? (
          <span className={styles.runCodeToggleMeta}>
            {t("runCode.charCount", { count: previewSuffix })}
            <span aria-hidden="true">{open ? " ▾" : " ▸"}</span>
          </span>
        ) : (
          <span className={styles.runCodeToggleMeta} aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
        )}
      </button>
      {open ? (
        <div className={styles.runCodeBody}>
          {!isStartMenu ? (
            <div className={styles.runCodeRow}>
              <textarea
                className={styles.runCodeOutput}
                readOnly
                value={code}
                spellCheck={false}
                wrap="soft"
                aria-label={t("runCode.label")}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                className={styles.runCodeButton}
                onClick={handleCopy}
                disabled={!code}
              >
                {copied ? t("runCode.copied") : t("runCode.copy")}
              </button>
            </div>
          ) : null}
          <div className={styles.runCodeRow}>
            <textarea
              className={styles.runCodeInput}
              value={draft}
              spellCheck={false}
              wrap="soft"
              placeholder={t("runCode.loadPlaceholder")}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleLoad();
                }
              }}
            />
            <button
              type="button"
              className={styles.runCodeButton}
              onClick={handleLoad}
              disabled={draft.trim().length === 0}
            >
              {t("runCode.load")}
            </button>
          </div>
          {error ? (
            <p className={styles.runCodeError} role="alert">
              {t("runCode.invalid", { error })}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
