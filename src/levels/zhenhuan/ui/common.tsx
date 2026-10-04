import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./zhenhuan.module.css";

/** UI pieces shared by the 第一关 and 第二关 screens. */

export function countBy<T extends string>(ids: readonly T[]): [T, number][] {
  const m = new Map<T, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return [...m.entries()];
}

/**
 * Pile tile with a hover/focus popover. The popover is `position: fixed` (placed from the tile's
 * rect) so the sideways-scrolling pile row cannot clip it; it closes when anything scrolls.
 */
export function Pile({ icon, label, count, children }: { icon: string; label: string; count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 328)) });
  };
  useEffect(() => {
    if (!pos) return;
    const hide = () => setPos(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [pos]);
  return (
    <div
      ref={ref}
      className={styles.pile}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={() => {
        if (document.activeElement !== ref.current) setPos(null);
      }}
      onFocus={show}
      onBlur={() => setPos(null)}
    >
      <div className={styles.statLabel}>
        <span className={styles.pileIcon}>{icon} </span>
        {label}
      </div>
      <div className={styles.statValue}>{count}</div>
      {pos ? (
        <div className={styles.popover} role="tooltip" style={pos}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * One horizontal row of cards. Overflow scrolls sideways: swipe on touch, trackpad/shift+wheel,
 * or press-and-drag with a mouse (a drag never counts as a click on the card under it).
 */
export function ScrollRow({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      ref={ref}
      className={[styles.scrollRow, className, dragging && styles.scrollRowDragging].filter(Boolean).join(" ")}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
        drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false, id: e.pointerId };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !ref.current) return;
        const dx = e.clientX - d.x;
        if (!d.moved && Math.abs(dx) < 6) return;
        if (!d.moved) {
          d.moved = true;
          setDragging(true);
          ref.current.setPointerCapture(d.id);
        }
        ref.current.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => {
        if (!drag.current?.moved) {
          drag.current = null;
          return;
        }
        setDragging(false);
        // keep the drag marker until the trailing click (same task) has been swallowed
        window.setTimeout(() => {
          drag.current = null;
        }, 0);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onClickCapture={(e) => {
        // swallow the click that ends a drag
        if (drag.current?.moved) {
          e.stopPropagation();
          e.preventDefault();
        }
        drag.current = null;
      }}
    >
      {children}
    </div>
  );
}

/** 略缩模式 (thumbnail mode): cards collapse to a one-line strip; tap to expand. */
export type Fold = { compact: boolean; expanded: boolean; onToggle: () => void };

export function activateOnKey(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

export const INTERACTIVE = "button, a, input, textarea, select, label";

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
}

/**
 * Card container. In 略缩模式 the whole card toggles collapsed/expanded with a single click
 * (clicks on its own buttons don't toggle). With `onDouble` (hand cards) the toggle waits a
 * moment so a double-click plays the card instead.
 */
export function FoldBox({
  fold,
  className,
  onDouble,
  children,
}: {
  fold: Fold;
  className: string;
  onDouble?: () => void;
  children: ReactNode;
}) {
  const timer = useRef<number | null>(null);
  if (!fold.compact) {
    // Desktop layout: double-click a hand card to play it (same as the Sun King campaign).
    return (
      <div
        className={onDouble ? `${className} ${styles.playableByDouble}` : className}
        onDoubleClick={
          onDouble
            ? (e) => {
                if (!(e.target as HTMLElement).closest(INTERACTIVE)) onDouble();
              }
            : undefined
        }
      >
        {children}
      </div>
    );
  }
  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  return (
    <div
      className={`${className} ${fold.expanded ? styles.expandedCard : styles.compactCard}`}
      role="button"
      tabIndex={0}
      aria-expanded={fold.expanded}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
        if (!onDouble) {
          fold.onToggle();
          return;
        }
        clearTimer();
        timer.current = window.setTimeout(() => {
          timer.current = null;
          fold.onToggle();
        }, 220);
      }}
      onDoubleClick={(e) => {
        if (!onDouble || (e.target as HTMLElement).closest(INTERACTIVE)) return;
        clearTimer();
        onDouble();
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget) activateOnKey(e, fold.onToggle);
      }}
    >
      {children}
    </div>
  );
}

/**
 * 4:3 picture under a hand / event card's header (docs/art-spec.md). Until the art exists it shows
 * a placeholder with the card's emoji, so cards keep the same height either way.
 */
export function CardArt({ src, emoji }: { src: string | null; emoji: string }) {
  return (
    <div className={styles.cardArt} aria-hidden="true">
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
      ) : (
        <span className={styles.cardArtPlaceholder}>{emoji}</span>
      )}
    </div>
  );
}

/** Full-screen chapter backdrop behind `.root` (renders nothing until the picture exists). */
export function Backdrop({ src }: { src: string | null }) {
  return src ? <div className={styles.backdrop} style={{ backgroundImage: `url(${src})` }} aria-hidden="true" /> : null;
}

/** Resolved banner: distinct mark per event kind, plus which card handled it. */
export function ResolvedBanner({ icon, label, detail, story }: { icon: string; label: string; detail: string; story?: string }) {
  return (
    <div className={styles.resolvedBanner} role="status">
      <span className={styles.resolvedBadge}>
        {icon} {label}
      </span>
      {story ? <span className={styles.resolvedStory}>{story}</span> : null}
      <span className={styles.resolvedDetail}>{detail}</span>
    </div>
  );
}

export type LogLine = { readonly text: string; readonly tone: "info" | "good" | "bad" };

export function LogView({ entries }: { entries: readonly LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);
  return (
    <div className={styles.log} ref={ref} aria-label="日志">
      {entries.map((entry, i) => (
        <p
          key={i}
          className={[
            styles.logLine,
            entry.text.startsWith("——") && styles.logTurn,
            entry.tone === "good" && styles.logGood,
            entry.tone === "bad" && styles.logBad,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {entry.text}
        </p>
      ))}
    </div>
  );
}

/** Clickable tag chip: writes its explanation to the log. */
export function TagChip({ tone, onExplain, children }: { tone?: string; onExplain: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={[styles.cardKind, tone, styles.tagButton].filter(Boolean).join(" ")}
      title="点击在日志中查看说明"
      onClick={(e) => {
        e.stopPropagation();
        onExplain();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {children}
    </button>
  );
}
