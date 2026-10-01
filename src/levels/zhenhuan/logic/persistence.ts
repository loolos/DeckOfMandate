/**
 * 甄嬛传 autosave + run codes. Both store only seed + action list and rebuild the state with
 * `replay`, so a save or code always reproduces the exact run. Kept separate from Sun King saves.
 */
import { replay, type ZhAction, type ZhState } from "./engine";

const SAVE_KEY = "deck-of-mandate.zhenhuan.save.v1";
const RUN_CODE_PREFIX = "ZH1-";

type RunRecord = { readonly seed: number; readonly actions: readonly ZhAction[] };

function encodeAction(a: ZhAction): string {
  switch (a.type) {
    case "playCard":
      return `p${a.cardUid}`;
    case "chooseStory":
      return a.cardUid ? `s${a.optionId}.${a.cardUid}` : `s${a.optionId}`;
    case "removeStatus":
      return `r${a.statusUid}`;
    case "cancelPending":
      return "x";
    case "endTurn":
      return "e";
  }
}

function decodeAction(raw: string): ZhAction {
  const head = raw[0];
  const body = raw.slice(1);
  switch (head) {
    case "p":
      return { type: "playCard", cardUid: body };
    case "s": {
      const [optionId, cardUid] = body.split(".");
      return cardUid ? { type: "chooseStory", optionId: optionId!, cardUid } : { type: "chooseStory", optionId: optionId! };
    }
    case "r":
      return { type: "removeStatus", statusUid: body };
    case "x":
      return { type: "cancelPending" };
    case "e":
      return { type: "endTurn" };
    default:
      throw new Error(`未知操作：${raw}`);
  }
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeRunCode(state: ZhState): string {
  const body = [String(state.seed), ...state.actions.map(encodeAction)].join(" ");
  return RUN_CODE_PREFIX + toBase64Url(body);
}

export function decodeRunCode(code: string): { ok: true; state: ZhState } | { ok: false; error: string } {
  const trimmed = code.trim();
  if (!trimmed.startsWith(RUN_CODE_PREFIX)) return { ok: false, error: "不是甄嬛传战役的对局码" };
  try {
    const [seedText, ...rest] = fromBase64Url(trimmed.slice(RUN_CODE_PREFIX.length)).split(" ").filter(Boolean);
    const seed = Number(seedText);
    if (!Number.isInteger(seed)) return { ok: false, error: "对局码格式错误" };
    return { ok: true, state: replay(seed, rest.map(decodeAction)) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "对局码格式错误" };
  }
}

/** Autosave at turn start: only the actions up to the current turn's start. */
export function saveAtTurnStart(state: ZhState): void {
  const record: RunRecord = { seed: state.seed, actions: state.actions.slice(0, state.turnStartActionCount) };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(record));
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function loadSave(): ZhState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as RunRecord;
    const state = replay(record.seed, record.actions);
    return state.outcome === "playing" ? state : null;
  } catch {
    clearSave();
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
