import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LEVEL_TUTORIAL_STEPS } from "../data/tutorialCopy";
import { useI18n } from "../locales";
import styles from "./LevelTutorialOverlay.module.css";

type Props = {
  open: boolean;
  onDismiss: () => void;
};

const PADDING = 6;

function measureTarget(targetId: string): DOMRect | null {
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function LevelTutorialOverlay({ open, onDismiss }: Props) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<readonly (typeof LEVEL_TUTORIAL_STEPS)[number][]>(LEVEL_TUTORIAL_STEPS);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardTop, setCardTop] = useState(80);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef(0);

  const refreshLayout = useCallback(() => {
    if (!open || steps.length === 0) return;
    const s = steps[Math.min(stepIndex, steps.length - 1)];
    if (!s) return;
    const r = measureTarget(s.targetId);
    setRect(r);
    if (r) {
      const gap = 12;
      const cardH = 220;
      const below = r.bottom + gap;
      const preferBelow = below + cardH < window.innerHeight - 16;
      const top = preferBelow ? below : Math.max(16, r.top - gap - cardH);
      setCardTop(top);
    } else {
      setCardTop(80);
    }
  }, [open, stepIndex, steps]);

  useLayoutEffect(() => {
    if (!open) {
      setStepIndex(0);
      setSteps(LEVEL_TUTORIAL_STEPS);
      return;
    }
    const resolved = LEVEL_TUTORIAL_STEPS.filter((st) => document.getElementById(st.targetId));
    setSteps(resolved);
    setStepIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    refreshLayout();
    primaryBtnRef.current?.focus();
  }, [open, stepIndex, steps, refreshLayout]);

  useEffect(() => {
    if (open && steps.length === 0) onDismiss();
  }, [open, steps.length, onDismiss]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(refreshLayout);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, refreshLayout]);

  const step = useMemo(() => {
    if (steps.length === 0) return null;
    return steps[Math.min(stepIndex, steps.length - 1)] ?? null;
  }, [stepIndex, steps]);

  const isLast = steps.length > 0 && stepIndex >= steps.length - 1;

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onDismiss();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [onDismiss, stepIndex, steps.length]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  if (!open || steps.length === 0 || !step) {
    return null;
  }

  const spotStyle: CSSProperties =
    rect != null
      ? {
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
        }
      : { top: "20%", left: "10%", width: "80%", height: "30%" };

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby="level-tutorial-title">
      <div className={styles.dim} aria-hidden />
      <div className={styles.spot} style={spotStyle} />
      <div className={styles.card} style={{ top: cardTop }}>
        <h2 id="level-tutorial-title">{t("tutorial.title")}</h2>
        <p className={styles.body} aria-live="polite">
          {t(step.bodyKey)}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.skip} onClick={onDismiss}>
            {t("tutorial.skip")}
          </button>
          {stepIndex > 0 ? (
            <button type="button" className={styles.btn} onClick={goBack}>
              {t("tutorial.back")}
            </button>
          ) : null}
          <button ref={primaryBtnRef} type="button" className={styles.btnPrimary} onClick={goNext}>
            {isLast ? t("tutorial.done") : t("tutorial.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
