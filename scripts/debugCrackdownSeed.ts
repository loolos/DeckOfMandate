import { simulateSecondMandateStandaloneEndState } from "../src/logic/aiStrategySimulation";

const seed = Number(process.argv[2] ?? 1);
const choice = (process.argv[3] ?? "crackdown") as "crackdown" | "tolerance";

const end = simulateSecondMandateStandaloneEndState(seed, { nantesChoice: choice });

console.log(`seed=${seed} choice=${choice}`);
console.log(`outcome=${end.outcome} endTurn=${end.turn}`);
console.log(`resources=`, end.resources);
console.log(`playerStatuses=`, end.playerStatuses.map((s) => `${s.templateId}:${s.turnsRemaining}`));

let suppressInPlay = 0;
for (const id of Object.keys(end.cardsById)) {
  if (end.cardsById[id]?.templateId === "suppressHuguenots") suppressInPlay++;
}
console.log(`suppressHuguenots cards still in play: ${suppressInPlay}`);
console.log(`hand size: ${end.hand.length}, deck size: ${end.deck.length}, discard size: ${end.discard.length}`);

console.log("\n=== last 50 log entries ===");
for (const entry of end.actionLog.slice(-50)) {
  console.log(JSON.stringify(entry));
}
