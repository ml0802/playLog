const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");
require("./playlog-official-data.js");

const store = globalThis.PlaylogOfficialData;

function evaluation(id, matchId, evaluatorUserId, targetUserId, createdAt, score = 7) {
  return {
    id,
    matchId,
    evaluatorUserId,
    targetUserId,
    selectedPosition: "am",
    overallComment: "",
    createdAt,
    scores: [
      ...engine.EVALUATION_FIELDS.common.map((field) => ({
        id: `${id}:common:${field.key}`, evaluationId: id, category: "common", key: field.key, score,
      })),
      ...engine.EVALUATION_FIELDS.position.am.map((field) => ({
        id: `${id}:position:${field.key}`, evaluationId: id, category: "position", key: field.key, score,
      })),
    ],
    traits: [{ id: `${id}:trait:vision`, evaluationId: id, key: "vision", score: 8 }],
    highlights: [],
  };
}

function reflection(id, matchId) {
  return {
    id,
    userId: "user:qa-a",
    matchId,
    selectedPosition: "am",
    selfScores: [
      ...engine.EVALUATION_FIELDS.common.map((field) => ({ category: "common", key: field.key, score: 7 })),
      ...engine.EVALUATION_FIELDS.position.am.map((field) => ({ category: "position", key: field.key, score: 8 })),
    ],
    selfTraits: [{ key: "vision", score: 8 }],
    selfHighlights: [{ key: "passSense" }, { key: "ballControl" }],
    satisfactionScore: 8,
    feltStrength: "연결이 좋았다.",
    feltWeakness: "슈팅이 적었다.",
    nextGoal: "전진 패스 늘리기",
    memo: "QA 회고",
    createdAt: "2026-05-29T03:00:00.000Z",
  };
}

// Prior month card for previousMonthlyOVR and analysisChanges comparison.
store.saveEvaluation(evaluation(
  "evaluation:qa-prior-april",
  "match:qa-prior-april",
  "user:qa-prior-evaluator",
  "user:qa-a",
  "2026-04-20T10:00:00.000Z",
  4,
));

const normalMatch = store.createMatch({
  id: "match:qa-normal-cycle",
  title: "정상 사이클 QA",
  date: "2026-05-29T00:00:00.000Z",
  participants: ["user:qa-a", "user:qa-b", "user:qa-c"],
});

store.saveEvaluation(evaluation("evaluation:qa-a-to-b", normalMatch.id, "user:qa-a", "user:qa-b", "2026-05-29T01:00:00.000Z", 9));
store.saveEvaluation(evaluation("evaluation:qa-a-to-c", normalMatch.id, "user:qa-a", "user:qa-c", "2026-05-29T01:01:00.000Z", 9));
store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-a", targetUserId: "user:qa-b", type: "pom", createdAt: "2026-05-29T01:02:00.000Z" });
store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-a", targetUserId: "user:qa-c", type: "next_star", createdAt: "2026-05-29T01:03:00.000Z" });

store.saveEvaluation(evaluation("evaluation:qa-b-to-a", normalMatch.id, "user:qa-b", "user:qa-a", "2026-05-29T01:10:00.000Z", 9));
store.saveEvaluation(evaluation("evaluation:qa-b-to-c", normalMatch.id, "user:qa-b", "user:qa-c", "2026-05-29T01:11:00.000Z", 9));
store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-b", targetUserId: "user:qa-a", type: "pom", createdAt: "2026-05-29T01:12:00.000Z" });
store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-b", targetUserId: "user:qa-c", type: "next_star", createdAt: "2026-05-29T01:13:00.000Z" });

store.saveEvaluation(evaluation("evaluation:qa-c-to-a", normalMatch.id, "user:qa-c", "user:qa-a", "2026-05-29T01:20:00.000Z", 9));
store.saveEvaluation(evaluation("evaluation:qa-c-to-b", normalMatch.id, "user:qa-c", "user:qa-b", "2026-05-29T01:21:00.000Z", 9));

assert.equal(normalMatch.status, "published");
assert.equal(store.playerMatchCards.filter((card) => card.matchId === normalMatch.id).length, 3);
assert.equal(store.publishMatch(normalMatch.id, "2026-05-29T01:30:00.000Z").status, "published");
assert.equal(store.playerMatchCards.filter((card) => card.matchId === normalMatch.id).length, 3);
assert.equal(store.playerCurrentStats.filter((stats) => ["user:qa-a", "user:qa-b", "user:qa-c"].includes(stats.userId)).length, 3);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:qa-a" && card.monthKey === "2026-05"), true);
assert.equal(store.playerMonthlyCards.find((card) => card.userId === "user:qa-a" && card.monthKey === "2026-05").previousMonthlyOVR !== null, true);
assert.ok(store.playerMatchCards.find((card) => card.matchId === normalMatch.id && card.userId === "user:qa-a").analysisChanges.length > 0);

store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-c", targetUserId: "user:qa-a", type: "pom", createdAt: "2026-05-29T01:22:00.000Z" });
store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-c", targetUserId: "user:qa-b", type: "next_star", createdAt: "2026-05-29T01:23:00.000Z" });
assert.equal(store.calculateMatchAward(normalMatch.id, "pom").voteCount, 2);
assert.equal(store.calculateMatchAward(normalMatch.id, "next_star").voteCount, 2);

assert.throws(
  () => store.saveEvaluation(evaluation("evaluation:qa-a-to-b-post-publish", normalMatch.id, "user:qa-a", "user:qa-b", "2026-05-29T02:00:00.000Z", 5)),
  /공개된 경기/,
);
assert.throws(
  () => store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-a", targetUserId: "user:qa-c", type: "pom", createdAt: "2026-05-29T02:01:00.000Z" }),
  /공개된 경기의 투표/,
);
assert.throws(
  () => store.saveMatchAwardVote({ matchId: normalMatch.id, voterUserId: "user:qa-a", targetUserId: "user:qa-b", type: "next_star", createdAt: "2026-05-29T02:02:00.000Z" }),
  /공개된 경기의 투표/,
);

const officialCountsBeforeReflection = {
  evaluations: store.evaluations.length,
  cards: store.playerMatchCards.length,
  current: store.playerCurrentStats.length,
  monthly: store.playerMonthlyCards.length,
};
store.saveSelfReflection(reflection("self-reflection:qa-linked", normalMatch.id));
store.saveSelfReflection({ ...reflection("self-reflection:qa-quick", null), matchId: null });
assert.equal(store.selfReflections.some((item) => item.id === "self-reflection:qa-quick" && item.matchId === null), true);
assert.deepEqual({
  evaluations: store.evaluations.length,
  cards: store.playerMatchCards.length,
  current: store.playerCurrentStats.length,
  monthly: store.playerMonthlyCards.length,
}, officialCountsBeforeReflection);

const editMatch = store.createMatch({
  id: "match:qa-edit-before-publish",
  date: "2026-05-29T03:00:00.000Z",
  participants: ["user:qa-edit-a", "user:qa-edit-b"],
});
store.saveEvaluation(evaluation("evaluation:qa-edit-a-to-b:v1", editMatch.id, "user:qa-edit-a", "user:qa-edit-b", "2026-05-29T03:01:00.000Z", 5));
store.saveEvaluation(evaluation("evaluation:qa-edit-a-to-b:v2", editMatch.id, "user:qa-edit-a", "user:qa-edit-b", "2026-05-29T03:02:00.000Z", 9));
assert.equal(store.evaluations.find((item) => item.id === "evaluation:qa-edit-a-to-b:v1").isActive, false);
assert.equal(store.evaluations.find((item) => item.id === "evaluation:qa-edit-a-to-b:v2").isActive, true);
store.saveEvaluation(evaluation("evaluation:qa-edit-b-to-a", editMatch.id, "user:qa-edit-b", "user:qa-edit-a", "2026-05-29T03:03:00.000Z", 8));
assert.equal(editMatch.status, "published");
assert.equal(store.playerMatchCards.find((card) => card.matchId === editMatch.id && card.userId === "user:qa-edit-b").commonAverage, 9);

const deadlineMatch = store.createMatch({
  id: "match:qa-deadline-cycle",
  date: "2026-05-29T04:00:00.000Z",
  participants: ["user:qa-done", "user:qa-partial", "user:qa-waiting"],
  evaluationDeadlineHours: 4,
});
store.saveEvaluation(evaluation("evaluation:qa-done-to-partial", deadlineMatch.id, "user:qa-done", "user:qa-partial", "2026-05-29T04:10:00.000Z", 7));
store.saveEvaluation(evaluation("evaluation:qa-done-to-waiting", deadlineMatch.id, "user:qa-done", "user:qa-waiting", "2026-05-29T04:11:00.000Z", 7));
store.saveEvaluation(evaluation("evaluation:qa-partial-to-done", deadlineMatch.id, "user:qa-partial", "user:qa-done", "2026-05-29T04:12:00.000Z", 7));
store.checkAndPublishMatch(deadlineMatch.id, "2026-05-29T08:00:00.000Z");
assert.equal(deadlineMatch.status, "published");
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:qa-done"), true);
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:qa-partial"), false);
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:qa-waiting"), false);

const fallbackCard = store.saveEvaluation(evaluation(
  "evaluation:qa-fallback-unmanaged",
  "match:qa-fallback-unmanaged",
  "user:qa-fallback-evaluator",
  "user:qa-fallback-target",
  "2026-05-29T09:00:00.000Z",
  7,
));
assert.equal(fallbackCard.userId, "user:qa-fallback-target");
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:qa-fallback-target"), true);

console.log("playlog-cycle-qa tests passed");
