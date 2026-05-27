const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");
require("./playlog-official-data.js");

const store = globalThis.PlaylogOfficialData;
const before = {
  evaluations: store.evaluations.length,
  matchCards: store.playerMatchCards.length,
  currentStats: store.playerCurrentStats.length,
  monthlyCards: store.playerMonthlyCards.length,
};

function reflection(id, matchId = null) {
  return {
    id,
    userId: "user:seunghyun",
    matchId,
    selectedPosition: "am",
    selfScores: [
      ...engine.EVALUATION_FIELDS.common.map((field) => ({ category: "common", key: field.key, score: 7 })),
      ...engine.EVALUATION_FIELDS.position.am.map((field) => ({ category: "position", key: field.key, score: 8 })),
      { category: "position", key: "finishing", score: 10 },
    ],
    selfTraits: [{ key: "vision", score: 8 }, { key: "creativity", score: 8 }],
    selfHighlights: [{ key: "passSense" }, { key: "ballControl" }, { key: "pace" }],
    satisfactionScore: 8,
    feltStrength: "패스 연결이 안정적이었다.",
    feltWeakness: "슈팅 선택이 부족했다.",
    nextGoal: "전방 패스를 한 번 더 시도하기",
    memo: "개인 기록",
    createdAt: "2026-05-28T12:00:00.000Z",
  };
}

const quick = store.saveSelfReflection(reflection("self-reflection:quick"));
assert.equal(quick.matchId, null);
assert.equal(quick.selectedPosition, "am");
assert.equal(quick.selfScores.filter((score) => score.category === "common").length, 10);
assert.equal(quick.selfScores.filter((score) => score.category === "position").length, 5);
assert.equal(quick.selfScores.some((score) => score.key === "finishing"), false);
assert.deepEqual(quick.selfTraits.map((trait) => trait.key), ["vision", "creativity"]);
assert.deepEqual(quick.selfHighlights.map((highlight) => highlight.key), ["passSense", "ballControl"]);
assert.equal(quick.satisfactionScore, 8);

const publishedMatch = store.createMatch({
  id: "match:reflection-published",
  date: "2026-05-28T00:00:00.000Z",
  participants: ["user:seunghyun", "user:minsu"],
  status: "published",
});
assert.equal(publishedMatch.status, "published");
const linked = store.saveSelfReflection(reflection("self-reflection:linked", publishedMatch.id));
assert.equal(linked.matchId, publishedMatch.id);
assert.equal(store.selfReflections.length, 2);

assert.equal(store.evaluations.length, before.evaluations);
assert.equal(store.playerMatchCards.length, before.matchCards);
assert.equal(store.playerCurrentStats.length, before.currentStats);
assert.equal(store.playerMonthlyCards.length, before.monthlyCards);

console.log("playlog-self-reflection tests passed");
