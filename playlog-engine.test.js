const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");

const matchId = "match:test";
const userId = "user:target";
const common = {
  activity: 6, decision: 6, stablePass: 6, buildUp: 6, firstTouch: 6,
  dribbleImpact: 6, composure: 6, offTheBall: 6, concentration: 6, stamina: 6,
};

function evaluation(id, evaluatorUserId, selectedPosition, commonScores, positionScores, traits = []) {
  return {
    id, matchId, evaluatorUserId, targetUserId: userId, selectedPosition, overallComment: "", createdAt: "",
    scores: [
      ...Object.entries(commonScores).map(([key, score]) => ({ id: `${id}:${key}`, evaluationId: id, category: "common", key, score })),
      ...Object.entries(positionScores).map(([key, score]) => ({ id: `${id}:${key}`, evaluationId: id, category: "position", key, score })),
    ],
    traits: traits.map(([key, score]) => ({ id: `${id}:trait:${key}`, evaluationId: id, key, score })),
  };
}

const peerEvaluations = [
  evaluation("e1", "user:a", "free", common, {
    allAreaInvolvement: 6, spaceConnection: 8, activityRange: 6, fluidity: 6, allRoundContribution: 6,
  }, [["teamwork", 9], ["vision", 9]]),
  evaluation("e2", "user:b", "free", common, {
    allAreaInvolvement: 6, spaceConnection: 8, activityRange: 6, fluidity: 6, allRoundContribution: 6,
  }, [["teamwork", 8], ["vision", 8]]),
  evaluation("self", userId, "attack", { ...common, activity: 10 }, {
    finishing: 10, attackingPositioning: 10, attackingLinkUp: 10, frontPressure: 10, ballKeeping: 10,
  }, [["boldness", 10]]),
];
const snapshot = JSON.stringify(peerEvaluations);
const card = engine.generatePlayerMatchCard({
  matchId,
  userId,
  evaluations: peerEvaluations,
  previousCard: { overallRating: 72, radarData: { activity: 50, gameSense: 50, pass: 50, ballControl: 50, movement: 50, mentality: 50 } },
  generatedAt: "2026-05-27T00:00:00.000Z",
});

assert.equal(engine.calculateMatchScore(6, 6), 6);
assert.equal(engine.calculateOverallRating(6), 73);
assert.equal(card.commonAverage, 6);
assert.equal(card.positionAverage, 6.4);
assert.equal(card.matchScore, 6.12);
assert.equal(card.overallRating, 74);
assert.equal(card.overallChange, 2);
assert.equal(card.mainEvaluatedPosition, "free");
assert.equal(card.positionAdaptation.attack, null);
assert.equal(card.positionAdaptation.free.evaluatorCount, 2);
assert.equal(card.evaluatorCount, 2);
assert.equal(card.reliabilityLevel, "medium");
assert.deepEqual(card.radarData, { activity: 60, gameSense: 60, pass: 60, ballControl: 60, movement: 60, mentality: 60 });
assert.equal(card.playStyle, "연결형 프리롤");
assert.equal(card.playStyleCode, "Link Playmaker");
assert.ok(card.strengthsTop3.some((item) => item.key === "spaceConnection"));
assert.equal(card.weaknessesTop3.length, 3);
assert.equal(card.analysisScores.length, 15);
assert.deepEqual(card.analysisChanges, []);
assert.ok(card.strengthsTop3.every((item) => card.matchAnalysisText.includes(item.label)));
assert.ok(card.weaknessesTop3.every((item) => card.matchAnalysisText.includes(item.label)));
assert.ok(card.matchAnalysisText.includes("보완할 여지가 있습니다"));
assert.equal(JSON.stringify(peerEvaluations), snapshot);

const tiedAnalysis = engine.generateMatchAnalysis([
  { category: "common", key: "firstTouch", score: 9 },
  { category: "position", key: "chanceMaking", score: 8 },
  { category: "position", key: "gameControl", score: 8 },
  { category: "common", key: "decision", score: 8 },
  { category: "common", key: "firstTouch", score: 4 },
  { category: "position", key: "pressureEscape", score: 4 },
  { category: "position", key: "creativeBuildUp", score: 4 },
], { mainEvaluatedPosition: "am", playStyle: "창의형 플레이메이커" });
assert.deepEqual(tiedAnalysis.strengthsTop3.map((item) => item.key), [
  "chanceMaking", "gameControl", "decision",
]);
assert.deepEqual(tiedAnalysis.weaknessesTop3.map((item) => item.key), [
  "creativeBuildUp", "pressureEscape", "firstTouch",
]);

const scoreBeforeRelevance = engine.generateMatchAnalysis([
  { category: "common", key: "stamina", score: 10 },
  { category: "position", key: "chanceMaking", score: 9 },
  { category: "position", key: "gameControl", score: 8 },
], { mainEvaluatedPosition: "am", playStyle: "창의형 플레이메이커" });
assert.equal(scoreBeforeRelevance.strengthsTop3[0].key, "stamina");

const styleTieAnalysis = engine.generateMatchAnalysis([
  { category: "common", key: "activity", score: 7 },
  { category: "common", key: "stablePass", score: 7 },
], { mainEvaluatedPosition: "dm", playStyle: "후방 조율자" });
assert.equal(styleTieAnalysis.strengthsTop3[0].key, "stablePass");

const commonFallbackAnalysis = engine.generateMatchAnalysis([
  { category: "common", key: "decision", score: 7 },
  { category: "common", key: "stamina", score: 7 },
], { mainEvaluatedPosition: "attack", playStyle: "침투형 피니셔" });
assert.equal(commonFallbackAnalysis.strengthsTop3[0].key, "decision");

const analysisSnapshot = (id, generatedAt, scoreByKey) => ({
  id,
  matchId: `match:${id}`,
  userId,
  generatedAt,
  mainEvaluatedPosition: "am",
  playStyle: "조율형 플레이메이커",
  analysisScores: Object.entries(scoreByKey).map(([key, score]) => ({
    key,
    label: key,
    category: "common",
    score,
  })),
});
const priorAnalysisCards = [
  analysisSnapshot("recent-1", "2026-05-03T00:00:00.000Z", { stablePass: 6, buildUp: 8, composure: 7 }),
  analysisSnapshot("recent-2", "2026-05-02T00:00:00.000Z", { stablePass: 6, buildUp: 7, composure: 7 }),
  analysisSnapshot("recent-3", "2026-05-01T00:00:00.000Z", { stablePass: 6, buildUp: 6, composure: 7 }),
];
const latestAnalysisCard = analysisSnapshot("latest", "2026-05-04T00:00:00.000Z", {
  stablePass: 9,
  buildUp: 5,
  composure: 8,
});
assert.deepEqual(engine.calculateAnalysisChanges(latestAnalysisCard, priorAnalysisCards), [
  {
    key: "stablePass", label: "stablePass", category: "common",
    currentScore: 9, previousRecentAverage: 6, diff: 3, comparisonMatchCount: 3,
  },
  {
    key: "buildUp", label: "buildUp", category: "common",
    currentScore: 5, previousRecentAverage: 7, diff: -2, comparisonMatchCount: 3,
  },
]);
assert.deepEqual(engine.calculateAnalysisChanges(latestAnalysisCard, priorAnalysisCards.slice(0, 2)), [
  {
    key: "stablePass", label: "stablePass", category: "common",
    currentScore: 9, previousRecentAverage: 6, diff: 3, comparisonMatchCount: 2,
  },
  {
    key: "buildUp", label: "buildUp", category: "common",
    currentScore: 5, previousRecentAverage: 7.5, diff: -2.5, comparisonMatchCount: 2,
  },
]);
assert.deepEqual(engine.calculateAnalysisChanges(latestAnalysisCard, priorAnalysisCards.slice(0, 1)), [
  {
    key: "stablePass", label: "stablePass", category: "common",
    currentScore: 9, previousRecentAverage: 6, diff: 3, comparisonMatchCount: 1,
  },
  {
    key: "buildUp", label: "buildUp", category: "common",
    currentScore: 5, previousRecentAverage: 8, diff: -3, comparisonMatchCount: 1,
  },
]);

const withoutTraits = engine.generatePlayerMatchCard({
  matchId,
  userId,
  evaluations: [evaluation("e3", "user:c", "am", common, {
    chanceMaking: 6, gameControl: 6, creativeBuildUp: 6, pressureEscape: 6, forwardProgression: 6,
  })],
});
assert.equal(withoutTraits.playStyle, "분석 준비중");
assert.equal(withoutTraits.playStyleCode, null);
assert.equal(withoutTraits.reliabilityLevel, "low");

const activeOnly = engine.generatePlayerMatchCard({
  matchId,
  userId,
  evaluations: [
    { ...evaluation("version:1", "user:a", "free", { ...common, activity: 10 }, {
      allAreaInvolvement: 10, spaceConnection: 10, activityRange: 10, fluidity: 10, allRoundContribution: 10,
    }), version: 1, isActive: false },
    { ...evaluation("version:2", "user:a", "free", common, {
      allAreaInvolvement: 6, spaceConnection: 6, activityRange: 6, fluidity: 6, allRoundContribution: 6,
    }), version: 2, isActive: true },
  ],
});
assert.equal(activeOnly.commonAverage, 6);
assert.equal(activeOnly.evaluatorCount, 1);

assert.equal(engine.EVALUATION_FIELDS.common.length, 10);
assert.deepEqual(engine.EVALUATION_FIELDS.common.map((field) => field.key), [
  "activity", "decision", "stablePass", "buildUp", "firstTouch",
  "dribbleImpact", "composure", "offTheBall", "concentration", "stamina",
]);
assert.equal(engine.EVALUATION_FIELDS.position.am[0].key, "chanceMaking");
assert.equal(engine.EVALUATION_FIELDS.position.free.length, 5);
assert.ok(engine.EVALUATION_FIELDS.traits.every((field) => field.description));
assert.deepEqual(engine.EVALUATION_FIELDS.highlights.map((field) => field.key), [
  "ballControl", "pace", "physical", "kickPower", "agility", "balance", "passSense",
]);

console.log("playlog-engine tests passed");
