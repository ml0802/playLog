const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");
require("./playlog-official-data.js");

const store = globalThis.PlaylogOfficialData;
const evaluationId = "evaluation:ui:test";
const evaluation = {
  id: evaluationId,
  matchId: "match:ui-test",
  evaluatorUserId: "user:seunghyun",
  targetUserId: "user:teammate",
  selectedPosition: "am",
  overallComment: "흐름을 잘 읽고 연결했다.",
  createdAt: "2026-05-27T08:00:00.000Z",
  scores: [
    ...engine.EVALUATION_FIELDS.common.map((field) => ({
      id: `${evaluationId}:common:${field.key}`, evaluationId, category: "common", key: field.key, score: 7,
    })),
    ...engine.EVALUATION_FIELDS.position.am.map((field) => ({
      id: `${evaluationId}:position:${field.key}`, evaluationId, category: "position", key: field.key, score: 8,
    })),
  ],
  traits: [{ id: `${evaluationId}:trait:vision`, evaluationId, key: "vision", score: 8 }],
  highlights: [
    { id: `${evaluationId}:highlight:ballControl`, evaluationId, key: "ballControl" },
    { id: `${evaluationId}:highlight:passSense`, evaluationId, key: "passSense" },
  ],
};

const before = store.evaluations.length;
const card = store.saveEvaluation(evaluation);
const saved = store.evaluations.find((item) => item.id === evaluationId);

assert.equal(store.evaluations.length, before + 1);
assert.notEqual(saved, evaluation);
assert.equal(saved.version, 1);
assert.equal(saved.isActive, true);
assert.equal(saved.updatedAt, evaluation.createdAt);
assert.equal(saved.scores.filter((score) => score.category === "common").length, 10);
assert.equal(saved.scores.filter((score) => score.category === "position").length, 5);
assert.deepEqual(saved.traits.map((trait) => trait.key), ["vision"]);
assert.deepEqual(saved.highlights.map((highlight) => highlight.key), ["ballControl", "passSense"]);
assert.equal(card.userId, "user:teammate");
assert.equal(card.mainEvaluatedPosition, "am");
assert.equal(card.playStyleCode !== null, true);
assert.equal(store.playerMatchCards.some((item) => item.id === card.id), true);
assert.equal(store.playerCurrentStats.some((item) => item.userId === card.userId), true);
const initialMonthlyCard = store.playerMonthlyCards.find((item) => item.userId === card.userId && item.monthKey === "2026-05");
assert.equal(initialMonthlyCard.matchCount, 1);
assert.equal(initialMonthlyCard.previousMonthlyOVR, null);
assert.equal(initialMonthlyCard.monthlyOVRChange, null);
const firstStats = { ...store.playerCurrentStats.find((item) => item.userId === card.userId), radarData: { ...store.playerCurrentStats.find((item) => item.userId === card.userId).radarData } };
assert.equal(firstStats.currentOVR, card.overallRating);
assert.equal(firstStats.previousOVR, null);
assert.equal(firstStats.ovrChange, null);
assert.equal(firstStats.radarChange, null);

const duplicateByIdCard = store.saveEvaluation({ ...evaluation, overallComment: "중복 전송" });
assert.equal(store.evaluations.length, before + 1);
assert.equal(duplicateByIdCard.id, card.id);

const nextMatch = {
  ...evaluation,
  id: `${evaluationId}:next-match`,
  matchId: "match:ui-test-next",
  createdAt: "2026-05-27T08:05:00.000Z",
  updatedAt: "2026-05-27T08:05:00.000Z",
  scores: evaluation.scores.map((score) => ({ ...score, evaluationId: `${evaluationId}:next-match`, score: 9 })),
};
const nextCard = store.saveEvaluation(nextMatch);
const nextStats = { ...store.playerCurrentStats.find((item) => item.userId === nextCard.userId), radarData: { ...store.playerCurrentStats.find((item) => item.userId === nextCard.userId).radarData } };

assert.equal(store.playerMatchCards.filter((item) => item.userId === nextCard.userId).length, 2);
assert.equal(nextStats.previousOVR, firstStats.currentOVR);
assert.equal(nextStats.currentOVR, Math.round((card.overallRating + nextCard.overallRating) / 2));
assert.equal(nextStats.ovrChange, nextStats.currentOVR - firstStats.currentOVR);
assert.equal(nextStats.radarChange.activity, nextStats.radarData.activity - firstStats.radarData.activity);
assert.equal(store.playerMonthlyCards.find((item) => item.userId === nextCard.userId && item.monthKey === "2026-05").matchCount, 2);

const resubmission = {
  ...nextMatch,
  id: `${evaluationId}:next-match:v2`,
  overallComment: "재제출한 평가",
  createdAt: "2026-05-27T08:10:00.000Z",
  updatedAt: "2026-05-27T08:10:00.000Z",
  scores: nextMatch.scores.map((score) => ({ ...score, evaluationId: `${evaluationId}:next-match:v2`, score: 6 })),
};
const resubmittedCard = store.saveEvaluation(resubmission);
const historical = store.evaluations.find((item) => item.id === `${evaluationId}:next-match`);
const active = store.evaluations.find((item) => item.id === `${evaluationId}:next-match:v2`);

assert.equal(store.evaluations.length, before + 3);
assert.equal(historical.isActive, false);
assert.equal(historical.version, 1);
assert.equal(historical.updatedAt, resubmission.updatedAt);
assert.equal(active.isActive, true);
assert.equal(active.version, 2);
assert.equal(resubmittedCard.evaluatorCount, 1);
assert.equal(resubmittedCard.commonAverage, 6);
const currentStats = store.playerCurrentStats.find((item) => item.userId === resubmittedCard.userId);
assert.equal(store.playerMatchCards.filter((item) => item.userId === resubmittedCard.userId).length, 2);
assert.equal(currentStats.previousOVR, nextStats.currentOVR);
assert.equal(currentStats.currentOVR, Math.round((card.overallRating + resubmittedCard.overallRating) / 2));
assert.equal(currentStats.ovrChange, currentStats.currentOVR - nextStats.currentOVR);
assert.equal(currentStats.radarChange.activity, currentStats.radarData.activity - nextStats.radarData.activity);

const thirdMatch = {
  ...evaluation,
  id: `${evaluationId}:third-match`,
  matchId: "match:ui-test-third",
  createdAt: "2026-05-27T08:15:00.000Z",
  updatedAt: "2026-05-27T08:15:00.000Z",
  scores: evaluation.scores.map((score) => ({ ...score, evaluationId: `${evaluationId}:third-match`, score: 6 })),
};
const fourthMatch = {
  ...evaluation,
  id: `${evaluationId}:fourth-match`,
  matchId: "match:ui-test-fourth",
  createdAt: "2026-05-27T08:20:00.000Z",
  updatedAt: "2026-05-27T08:20:00.000Z",
  scores: evaluation.scores.map((score) => ({ ...score, evaluationId: `${evaluationId}:fourth-match`, score: 10 })),
};
store.saveEvaluation(thirdMatch);
const fourthCard = store.saveEvaluation(fourthMatch);
const stablePassChange = fourthCard.analysisChanges.find((item) => item.key === "stablePass");

assert.ok(Array.isArray(fourthCard.analysisScores));
assert.ok(Array.isArray(fourthCard.analysisChanges));
assert.equal(stablePassChange.previousRecentAverage, 6.33);
assert.equal(stablePassChange.currentScore, 10);
assert.equal(stablePassChange.diff, 3.67);
assert.equal(stablePassChange.comparisonMatchCount, 3);
const monthlyCard = store.playerMonthlyCards.find((item) => item.userId === nextCard.userId && item.monthKey === "2026-05");
assert.equal(monthlyCard.userId, nextCard.userId);
assert.equal(monthlyCard.monthKey, "2026-05");
assert.equal(monthlyCard.matchCount, 4);
assert.ok(store.playerMonthlyCards.some((item) => item.userId === nextCard.userId && item.monthKey === "2026-05"));

const juneMatch = {
  ...evaluation,
  id: `${evaluationId}:june-match`,
  matchId: "match:ui-test-june",
  createdAt: "2026-06-03T08:00:00.000Z",
  updatedAt: "2026-06-03T08:00:00.000Z",
  scores: evaluation.scores.map((score) => ({ ...score, evaluationId: `${evaluationId}:june-match`, score: 8 })),
};
const juneCard = store.saveEvaluation(juneMatch);
const juneMonthlyCard = store.playerMonthlyCards.find((item) => item.userId === juneCard.userId && item.monthKey === "2026-06");
assert.equal(juneMonthlyCard.matchCount, 1);
assert.equal(juneMonthlyCard.previousMonthlyOVR, monthlyCard.monthlyOVR);
assert.equal(juneMonthlyCard.monthlyOVRChange, juneMonthlyCard.monthlyOVR - monthlyCard.monthlyOVR);

console.log("playlog-official-data tests passed");
