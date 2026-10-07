import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CompactModeToggle } from "./CompactModeToggle";
import styles from "./zhenhuan.module.css";

/** UI pieces shared by the 第一关 and 第二关 screens. */

export function countBy<T extends string>(ids: readonly T[]): [T, number][] {
  const m = new Map<T, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return [...m.entries()];
}

/**
 * Hover / focus popover for a tile (tap focuses it on touch screens). The popover is
 * `position: fixed` (placed from the tile's rect) so the sideways-scrolling strip cannot clip it;
 * it closes when anything scrolls.
 */
function useTilePopover() {
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
  const props = {
    ref,
    tabIndex: 0,
    onMouseEnter: show,
    onMouseLeave: () => {
      if (document.activeElement !== ref.current) setPos(null);
    },
    onFocus: show,
    onBlur: () => setPos(null),
  };
  const popover = (children: ReactNode) =>
    pos ? (
      <div className={styles.popover} role="tooltip" style={pos}>
        {children}
      </div>
    ) : null;
  return { props, popover };
}

/** Pile tile; hover / focus shows what is inside. */
export function Pile({ icon, label, count, children }: { icon: string; label: string; count: number; children: ReactNode }) {
  const { props, popover } = useTilePopover();
  return (
    <div className={`${styles.chip} ${styles.pile}`} {...props}>
      <div className={styles.chipLine}>
        <span aria-hidden="true">{icon}</span>
        <span className={styles.chipLabel}>{label}</span>
        <span className={styles.chipValue}>{count}</span>
      </div>
      {popover(children)}
    </div>
  );
}

/**
 * Resource / counter tile for the top strip: label, hint, number and meter on the desktop layout;
 * in 略缩模式 only the emoji and number stay visible. With `info`, hovering or tapping the tile
 * shows its story line and mechanic notes.
 */
export function StatChip({
  icon,
  label,
  value,
  max,
  hint,
  danger,
  meter = max != null,
  info,
}: {
  icon: string;
  label: string;
  value: number;
  max?: number;
  hint?: string;
  danger?: boolean;
  meter?: boolean;
  info?: { readonly lore: string; readonly rules: readonly string[] };
}) {
  const { props, popover } = useTilePopover();
  const body = (
    <>
      <div className={styles.chipLine}>
        <span aria-hidden="true">{icon}</span>
        <span className={styles.chipLabel}>{label}</span>
        {hint ? <span className={styles.chipHint}>{hint}</span> : null}
        <span className={[styles.chipValue, danger && styles.statDanger].filter(Boolean).join(" ")}>
          {value}
          {max != null ? <span className={styles.chipMax}>/{max}</span> : null}
        </span>
      </div>
      {meter && max != null ? (
        <div className={styles.meter}>
          <div className={styles.meterFill} style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} />
        </div>
      ) : null}
    </>
  );
  const className = [styles.chip, meter && styles.statChip, info && styles.infoChip].filter(Boolean).join(" ");
  if (!info) {
    return (
      <div className={className} title={hint ? `${label}${hint}` : label}>
        {body}
      </div>
    );
  }
  return (
    <div className={className} {...props}>
      {body}
      {popover(
        <>
          <p className={styles.popoverTitle}>
            {icon} {label}
            {hint ?? ""}
          </p>
          <p className={styles.popoverLore}>{info.lore}</p>
          <ul className={styles.popoverRules}>
            {info.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>,
      )}
    </div>
  );
}

export type HeaderBadge = { text: string; brief?: string; gold?: boolean };

/**
 * Page header. Desktop: one line of title, turn / rank badges and the buttons. 略缩模式: stage title,
 * turn and rank name on one line; rank details, rules, restart and menu sit behind ⋯. The 略缩模式 switch is
 * always the last thing on the line.
 */
export function GameHeader({
  compact,
  campaignTitle,
  stageTitle,
  turn,
  totalTurns,
  rankName,
  rankDetail,
  badges = [],
  onRules,
  onRestart,
  onMenu,
}: {
  compact: boolean;
  campaignTitle: string;
  stageTitle: string;
  turn: number;
  totalTurns: number;
  rankName: string;
  rankDetail: string;
  badges?: readonly HeaderBadge[];
  onRules: () => void;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const badgeClass = (b: HeaderBadge) => (b.gold ? `${styles.badge} ${styles.badgeGold}` : styles.badge);
  if (compact) {
    return (
      <header className={`${styles.header} ${styles.headerCompact}`}>
        <h1 className={styles.title}>{stageTitle}</h1>
        <span className={`${styles.badge} ${styles.badgeGold}`} title={`第 ${turn} / ${totalTurns} 回合`}>
          {turn}/{totalTurns}
        </span>
        <span className={styles.badge} title={`位分：${rankName}（${rankDetail}）`}>
          {rankName}
        </span>
        {badges.map((b) => (
          <span key={b.text} className={badgeClass(b)} title={b.text}>
            {b.brief ?? b.text}
          </span>
        ))}
        <HeaderMenu rankLine={`位分：${rankName}（${rankDetail}）`} onRules={onRules} onRestart={onRestart} onMenu={onMenu} />
        <CompactModeToggle />
      </header>
    );
  }
  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>
          {campaignTitle} · {stageTitle}
        </h1>
        <span className={`${styles.badge} ${styles.badgeGold}`}>
          第 {turn} / {totalTurns} 回合
        </span>
        <span className={styles.badge}>
          位分：{rankName}（{rankDetail}）
        </span>
        {badges.map((b) => (
          <span key={b.text} className={badgeClass(b)}>
            {b.text}
          </span>
        ))}
      </div>
      <div className={styles.headerMeta}>
        <button type="button" className={styles.btn} onClick={onRules}>
          规则说明
        </button>
        <button type="button" className={styles.btn} onClick={() => confirmRestart(onRestart)}>
          重新开始
        </button>
        <button type="button" className={styles.btn} onClick={onMenu}>
          主菜单
        </button>
        <CompactModeToggle />
      </div>
    </header>
  );
}

/** Restarting throws the current run away, so ask first. */
function confirmRestart(onRestart: () => void) {
  if (window.confirm("重新开始本关？当前进度将丢失。")) onRestart();
}

function HeaderMenu({
  rankLine,
  onRules,
  onRestart,
  onMenu,
}: {
  rankLine: string;
  onRules: () => void;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className={styles.headerMenu} ref={ref}>
      <button
        type="button"
        className={`${styles.btn} ${styles.menuButton}`}
        aria-label="菜单"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      {open ? (
        <div className={styles.headerMenuPanel}>
          <p className={styles.muted}>{rankLine}</p>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false);
              onRules();
            }}
          >
            规则说明
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false);
              confirmRestart(onRestart);
            }}
          >
            重新开始
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setOpen(false);
              onMenu();
            }}
          >
            主菜单
          </button>
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
 * moment so a double-click plays the card instead. An expanded card opens as a centered panel over
 * the page (a same-size placeholder keeps its slot in the row), so the page itself never grows;
 * tapping outside it or pressing Escape folds it again.
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
  const box = useRef<HTMLDivElement>(null);
  const slot = useRef<{ width: number; height: number } | null>(null);
  const toggleRef = useRef(fold.onToggle);
  toggleRef.current = fold.onToggle;
  const sheetOpen = fold.compact && fold.expanded;
  useEffect(() => {
    if (!sheetOpen) return;
    box.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") toggleRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);
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
  const toggle = () => {
    if (!fold.expanded && box.current) {
      const r = box.current.getBoundingClientRect();
      slot.current = { width: r.width, height: r.height };
    }
    fold.onToggle();
  };
  const card = (
    <div
      ref={box}
      className={`${className} ${fold.expanded ? `${styles.expandedCard} ${styles.sheet}` : styles.compactCard}`}
      role={fold.expanded ? "dialog" : "button"}
      aria-modal={fold.expanded || undefined}
      tabIndex={0}
      aria-expanded={fold.expanded ? undefined : false}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
        if (!onDouble) {
          toggle();
          return;
        }
        clearTimer();
        timer.current = window.setTimeout(() => {
          timer.current = null;
          toggle();
        }, 220);
      }}
      onDoubleClick={(e) => {
        if (!onDouble || (e.target as HTMLElement).closest(INTERACTIVE)) return;
        clearTimer();
        onDouble();
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget) activateOnKey(e, toggle);
      }}
    >
      {children}
    </div>
  );
  if (!fold.expanded) return card;
  return (
    <>
      <div className={styles.foldSlot} style={slot.current ?? undefined} aria-hidden="true" />
      <div
        className={styles.sheetLayer}
        // keep the row underneath from treating presses in the sheet as a drag
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          if (e.target === e.currentTarget) fold.onToggle();
        }}
      >
        {card}
      </div>
    </>
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

/**
 * Full-screen chapter backdrop behind `.root` (renders nothing until the picture exists).
 * The start menu gets the light Sun King-style dimming; a run gets a deeper one so the cards stay readable.
 */
export function Backdrop({ src, variant = "play" }: { src: string | null; variant?: "menu" | "play" }) {
  return src ? (
    <div
      className={[styles.backdrop, variant === "menu" && styles.backdropMenu].filter(Boolean).join(" ")}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  ) : null;
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
