import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { LEVEL_TUTORIAL_STEPS } from "../data/tutorialCopy";
import { useI18n } from "../locales";
import styles from "./LevelTutorialOverlay.module.css";

/** Literal-text steps and labels, for campaigns whose copy is not routed through i18n (e.g. 甄嬛传, Chinese only). */
export type TutorialOverlayCustom = {
  steps: readonly { targetId: string; body: string }[];
  copy: { title: string; skip: string; back: string; next: string; done: string };
};

type Props = {
  open: boolean;
  onDismiss: () => void;
  custom?: TutorialOverlayCustom;
};

type ResolvedStep = { targetId: string; body: string };

const PADDING = 6;

function measureTarget(targetId: string): DOMRect | null {
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function LevelTutorialOverlay({ open, onDismiss, custom }: Props) {
  const { t } = useI18n();
  const allSteps = useMemo<readonly ResolvedStep[]>(
    () => custom?.steps ?? LEVEL_TUTORIAL_STEPS.map((st) => ({ targetId: st.targetId, body: t(st.bodyKey) })),
    [custom, t],
  );
  const label = (key: "title" | "skip" | "back" | "next" | "done") => (custom ? custom.copy[key] : t(`tutorial.${key}`));
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<readonly ResolvedStep[]>(allSteps);
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
      setSteps(allSteps);
      return;
    }
    const resolved = allSteps.filter((st) => document.getElementById(st.targetId));
    setSteps(resolved);
    setStepIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- steps are resolved once per opening
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
        <h2 id="level-tutorial-title">{label("title")}</h2>
        <p className={styles.body} aria-live="polite">
          {step.body}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.skip} onClick={onDismiss}>
            {label("skip")}
          </button>
          {stepIndex > 0 ? (
            <button type="button" className={styles.btn} onClick={goBack}>
              {label("back")}
            </button>
          ) : null}
          <button ref={primaryBtnRef} type="button" className={styles.btnPrimary} onClick={goNext}>
            {isLast ? label("done") : label("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
