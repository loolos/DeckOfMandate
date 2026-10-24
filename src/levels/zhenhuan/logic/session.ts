/**
 * 甄嬛传 sessions: one continuous play-through, 第一关 and (after 进入第二关) 第二关, like the Sun King
 * campaign's session of chapter records (design-stage2.md §3.2). The 第二关 record keeps its own seed
 * and a carry-over snapshot (清誉 / 圣宠), so replaying it never depends on replaying 第一关.
 *
 * Run codes: `ZH1-` (第一关 only, unchanged), `ZH2-` (a session that reached 第二关) and `ZH3-` (第三关,
 * with its own carry-over snapshot from 第二关, design-stage3.md §2).
 */
import { replay, type ZhAction, type ZhState } from "./engine";
import {
  clearSave as clearStage1Save,
  decodeAction,
  decodeRunCode as decodeStage1,
  encodeAction,
  encodeRunCode as encodeStage1,
  loadSave as loadStage1Save,
  saveAtTurnStart as saveStage1,
} from "./persistence";
import { newStage2, replay2, type Carry, type Z2Action, type Z2State } from "./stage2Engine";
import { newStage3, replay3, type Carry3, type Z3Action, type Z3State } from "./stage3Engine";
import type { StoryId2 } from "../data/stage2Content";
import { STAGE2_SECRETS, type Stage2SecretId, type StoryId3 } from "../data/stage3Content";

export type Stage1Record = { readonly seed: number; readonly actions: readonly ZhAction[] };

export type Stage2Record = { readonly seed: number; readonly carry: Carry | null; readonly actions: readonly Z2Action[] };

export type Session =
  | { readonly stage: 1; readonly state: ZhState }
  | { readonly stage: 2; readonly state: Z2State; readonly stage1: Stage1Record | null }
  | { readonly stage: 3; readonly state: Z3State; readonly stage1: Stage1Record | null; readonly stage2: Stage2Record | null };

export type Stage2Session = Extract<Session, { stage: 2 }>;
export type Stage3Session = Extract<Session, { stage: 3 }>;

const SAVE2_KEY = "deck-of-mandate.zhenhuan.save.v2";
const SAVE3_KEY = "deck-of-mandate.zhenhuan.save.v3";
const RUN_CODE2_PREFIX = "ZH2-";
const RUN_CODE3_PREFIX = "ZH3-";

function encodeAction2(a: Z2Action): string {
  switch (a.type) {
    case "playCard":
      return `p${a.cardUid}`;
    case "chooseStory":
      return `s${a.storyId}.${a.optionId}`;
    case "removeStatus":
      return `r${a.statusUid}`;
    case "cancelPending":
      return "x";
    case "endTurn":
      return "e";
    case "explainTag":
      throw new Error("explainTag is never recorded");
  }
}

function decodeAction2(raw: string): Z2Action {
  const head = raw[0];
  const body = raw.slice(1);
  switch (head) {
    case "p":
      return { type: "playCard", cardUid: body };
    case "s": {
      const [storyId, optionId] = body.split(".");
      if (!storyId || !optionId) throw new Error(`未知操作：${raw}`);
      return { type: "chooseStory", storyId: storyId as StoryId2, optionId };
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

function encodeAction3(a: Z3Action): string {
  switch (a.type) {
    case "playCard":
      return `p${a.cardUid}`;
    case "chooseStory":
      return `s${a.storyId}.${a.optionId}`;
    case "removeStatus":
      return `r${a.statusUid}`;
    case "relicChoice":
      return a.choice === "burn" ? "b" : "h";
    case "cancelPending":
      return "x";
    case "endTurn":
      return "e";
    case "explainTag":
      throw new Error("explainTag is never recorded");
  }
}

function decodeAction3(raw: string): Z3Action {
  const head = raw[0];
  const body = raw.slice(1);
  switch (head) {
    case "p":
      return { type: "playCard", cardUid: body };
    case "s": {
      const [storyId, optionId] = body.split(".");
      if (!storyId || !optionId) throw new Error(`未知操作：${raw}`);
      return { type: "chooseStory", storyId: storyId as StoryId3, optionId };
    }
    case "r":
      return { type: "removeStatus", statusUid: body };
    case "b":
      return { type: "relicChoice", choice: "burn" };
    case "h":
      return { type: "relicChoice", choice: "hide" };
    case "x":
      return { type: "cancelPending" };
    case "e":
      return { type: "endTurn" };
    default:
      throw new Error(`未知操作：${raw}`);
  }
}

/** `q.s.z.rank.pregnant.relation.secrets.returned`, or `-` for a standalone 第三关. */
function encodeCarry3(c: Carry3 | null): string {
  if (!c) return "-";
  const ret = c.returned === "meizhuangXiangzhu" ? "m" : c.returned === "wenTaiyiZhenzhi" ? "w" : "_";
  return [c.qingyu, c.shengchong, c.shenzi, c.rank === "pin" ? "p" : "g", c.pregnant ? 1 : 0, c.relation, c.secrets.join("+") || "_", ret].join(".");
}

function decodeCarry3(raw: string): Carry3 | null {
  if (raw === "-") return null;
  const [q, sc, z, rank, preg, rel, secrets, ret] = raw.split(".");
  const nums = [q, sc, z, rel].map(Number);
  if (nums.some((n) => !Number.isInteger(n)) || (rank !== "p" && rank !== "g") || ret == null) throw new Error("对局码格式错误");
  const ids = secrets === "_" || !secrets ? [] : secrets.split("+");
  if (!ids.every((id) => (STAGE2_SECRETS as readonly string[]).includes(id))) throw new Error("对局码格式错误");
  return {
    qingyu: nums[0]!,
    shengchong: nums[1]!,
    shenzi: nums[2]!,
    rank: rank === "p" ? "pin" : "guiren",
    pregnant: preg === "1",
    relation: nums[3]!,
    secrets: ids as Stage2SecretId[],
    returned: ret === "m" ? "meizhuangXiangzhu" : ret === "w" ? "wenTaiyiZhenzhi" : null,
  };
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

/** Text body: `1 <seed> <actions…> | 2 <seed> <q|-> <s|-> <actions…> | 3 <seed> <carry|-> <actions…>`. */
function sessionBody(stage1: Stage1Record | null, s2: Stage2Record | null, s3?: { seed: number; carry: Carry3 | null; actions: readonly Z3Action[] }): string {
  const parts: string[] = [];
  if (stage1) parts.push(["1", String(stage1.seed), ...stage1.actions.map(encodeAction)].join(" "));
  if (s2) {
    const carry = s2.carry ? [String(s2.carry.qingyu), String(s2.carry.shengchong)] : ["-", "-"];
    parts.push(["2", String(s2.seed), ...carry, ...s2.actions.map(encodeAction2)].join(" "));
  }
  if (s3) parts.push(["3", String(s3.seed), encodeCarry3(s3.carry), ...s3.actions.map(encodeAction3)].join(" "));
  return parts.join(" | ");
}

type ParsedSession = {
  stage1: Stage1Record | null;
  stage2: Stage2Record | null;
  stage3: { seed: number; carry: Carry3 | null; actions: Z3Action[] } | null;
};

function parseBody(body: string): ParsedSession {
  const out: ParsedSession = { stage1: null, stage2: null, stage3: null };
  for (const part of body.split("|").map((p) => p.trim()).filter(Boolean)) {
    const [tag, seedText, ...rest] = part.split(" ").filter(Boolean);
    const seed = Number(seedText);
    if (!Number.isInteger(seed)) throw new Error("对局码格式错误");
    if (tag === "1") out.stage1 = { seed, actions: rest.map(decodeAction) };
    else if (tag === "2") {
      const [q, sc, ...acts] = rest;
      const carry = q === "-" || q == null ? null : { qingyu: Number(q), shengchong: Number(sc) };
      if (carry && (!Number.isInteger(carry.qingyu) || !Number.isInteger(carry.shengchong))) throw new Error("对局码格式错误");
      out.stage2 = { seed, carry, actions: acts.map(decodeAction2) };
    } else if (tag === "3") {
      const [carry, ...acts] = rest;
      if (carry == null) throw new Error("对局码格式错误");
      out.stage3 = { seed, carry: decodeCarry3(carry), actions: acts.map(decodeAction3) };
    } else throw new Error("对局码格式错误");
  }
  return out;
}

export function encodeSessionCode(session: Session): string {
  if (session.stage === 1) return encodeStage1(session.state);
  if (session.stage === 3) {
    const st = session.state;
    return RUN_CODE3_PREFIX + toBase64Url(sessionBody(session.stage1, session.stage2, { seed: st.seed, carry: st.carry, actions: st.actions }));
  }
  const st = session.state;
  return RUN_CODE2_PREFIX + toBase64Url(sessionBody(session.stage1, { seed: st.seed, carry: st.carry, actions: st.actions }));
}

export function decodeSessionCode(code: string): { ok: true; session: Session } | { ok: false; error: string } {
  const trimmed = code.trim();
  if (trimmed.startsWith(RUN_CODE3_PREFIX)) {
    try {
      const p = parseBody(fromBase64Url(trimmed.slice(RUN_CODE3_PREFIX.length)));
      if (!p.stage3) throw new Error("对局码格式错误");
      if (p.stage1) replay(p.stage1.seed, p.stage1.actions); // validates the earlier parts
      if (p.stage2) replay2(p.stage2.seed, p.stage2.carry, p.stage2.actions);
      const state = replay3(p.stage3.seed, p.stage3.carry, p.stage3.actions);
      return { ok: true, session: { stage: 3, state, stage1: p.stage1, stage2: p.stage2 } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "对局码格式错误" };
    }
  }
  if (trimmed.startsWith(RUN_CODE2_PREFIX)) {
    try {
      const p = parseBody(fromBase64Url(trimmed.slice(RUN_CODE2_PREFIX.length)));
      if (!p.stage2 || p.stage3) throw new Error("对局码格式错误");
      if (p.stage1) replay(p.stage1.seed, p.stage1.actions); // validates the 第一关 part
      return { ok: true, session: { stage: 2, state: replay2(p.stage2.seed, p.stage2.carry, p.stage2.actions), stage1: p.stage1 } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "对局码格式错误" };
    }
  }
  const r = decodeStage1(trimmed);
  return r.ok ? { ok: true, session: { stage: 1, state: r.state } } : r;
}

/** 第一关 won → 第二关 with the carried 清誉 / 圣宠. */
export function continueToStage2(stage1: ZhState, seed: number): Stage2Session {
  const carry: Carry = { qingyu: stage1.qingyu, shengchong: stage1.shengchong };
  return { stage: 2, state: newStage2(seed, carry), stage1: { seed: stage1.seed, actions: stage1.actions } };
}

export function startStage2Standalone(seed: number): Stage2Session {
  return { stage: 2, state: newStage2(seed, null), stage1: null };
}

/** What a won 第二关 hands to 第三关 (design-stage3.md §2.1–2.4). */
export function carry3FromStage2(s: Z2State): Carry3 {
  return {
    qingyu: s.qingyu,
    shengchong: s.shengchong,
    shenzi: s.shenzi,
    rank: s.rank === "pin" || s.rank === "fei" ? "pin" : "guiren",
    pregnant: s.pregnant,
    relation: s.relation ?? 0,
    secrets: [...s.lingrongSecrets],
    returned: s.xibie,
  };
}

/** 第二关 won → 第三关. */
export function continueToStage3(session: Stage2Session, seed: number): Stage3Session {
  const st = session.state;
  return {
    stage: 3,
    state: newStage3(seed, carry3FromStage2(st)),
    stage1: session.stage1,
    stage2: { seed: st.seed, carry: st.carry, actions: st.actions },
  };
}

export function startStage3Standalone(seed: number): Stage3Session {
  return { stage: 3, state: newStage3(seed, null), stage1: null, stage2: null };
}

/** Autosave at turn start. Only one save exists at a time (the latest play-through). */
export function saveSession(session: Session): void {
  if (session.stage === 1) {
    clearSave2();
    clearSave3();
    saveStage1(session.state);
    return;
  }
  if (session.stage === 3) {
    const st = session.state;
    const body = sessionBody(session.stage1, session.stage2, { seed: st.seed, carry: st.carry, actions: st.actions.slice(0, st.turnStartActionCount) });
    try {
      clearStage1Save();
      clearSave2();
      localStorage.setItem(SAVE3_KEY, body);
    } catch {
      /* ignore quota / privacy mode */
    }
    return;
  }
  const st = session.state;
  const body = sessionBody(session.stage1, { seed: st.seed, carry: st.carry, actions: st.actions.slice(0, st.turnStartActionCount) });
  try {
    clearStage1Save();
    clearSave3();
    localStorage.setItem(SAVE2_KEY, body);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SAVE3_KEY);
    if (raw) {
      const p = parseBody(raw);
      if (!p.stage3) throw new Error("bad save");
      const state = replay3(p.stage3.seed, p.stage3.carry, p.stage3.actions);
      if (state.outcome === "playing") return { stage: 3, state, stage1: p.stage1, stage2: p.stage2 };
    }
  } catch {
    clearSave3();
  }
  try {
    const raw = localStorage.getItem(SAVE2_KEY);
    if (raw) {
      const p = parseBody(raw);
      if (!p.stage2) throw new Error("bad save");
      const state = replay2(p.stage2.seed, p.stage2.carry, p.stage2.actions);
      if (state.outcome === "playing") return { stage: 2, state, stage1: p.stage1 };
    }
  } catch {
    clearSave2();
  }
  const s1 = loadStage1Save();
  return s1 ? { stage: 1, state: s1 } : null;
}

function clearSave2(): void {
  try {
    localStorage.removeItem(SAVE2_KEY);
  } catch {
    /* ignore */
  }
}

function clearSave3(): void {
  try {
    localStorage.removeItem(SAVE3_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  clearSave3();
  clearSave2();
  clearStage1Save();
}
