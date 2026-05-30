const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");

const userId = "user:current";

function card(id, overallRating, generatedAt, playStyle, mainEvaluatedPosition, evaluatorCount, radar, positionAdaptation = {}) {
  return {
    id,
    matchId: `match:${id}`,
    userId,
    overallRating,
    generatedAt,
    playStyle,
    mainEvaluatedPosition,
    evaluatorCount,
    radarData: {
      activity: radar, gameSense: radar, pass: radar,
      ballControl: radar, movement: radar, mentality: radar,
    },
    positionAdaptation: {
      attack: null, am: null, dm: null, defense: null, free: null,
      ...positionAdaptation,
    },
  };
}

function positionSummaryCard(id, overallRating, generatedAt, playStyle, mainEvaluatedPosition, selectedPositionSummary, positionAdaptation = {}) {
  return {
    ...card(id, overallRating, generatedAt, playStyle, mainEvaluatedPosition, 3, 80, positionAdaptation),
    selectedPositionSummary,
  };
}

const twoMatches = [
  card("older", 76, "2026-05-01T00:00:00.000Z", "연결형 프리롤", "free", 2, 70),
  card("latest", 80, "2026-05-02T00:00:00.000Z", "연결형 프리롤", "free", 2, 80),
];
const simpleStats = engine.generatePlayerCurrentStats({ userId, cards: twoMatches });
assert.equal(simpleStats.currentOVR, 78);
assert.equal(simpleStats.radarData.activity, 75);
assert.equal(simpleStats.recentMatchCount, 2);

const weightedCards = [
  card("fifth", 100, "2026-05-01T00:00:00.000Z", "무시할 유형", "attack", 5, 100),
  card("fourth", 60, "2026-05-02T00:00:00.000Z", "창의형 플레이메이커", "am", 1, 60, {
    am: { positionAverage: 6, adaptationRating: 73 },
  }),
  card("third", 70, "2026-05-03T00:00:00.000Z", "연결형 프리롤", "free", 3, 70, {
    free: { positionAverage: 7, adaptationRating: 79 },
  }),
  card("second", 80, "2026-05-04T00:00:00.000Z", "창의형 플레이메이커", "am", 3, 80, {
    am: { positionAverage: 8, adaptationRating: 84 },
  }),
  card("latest", 90, "2026-05-05T00:00:00.000Z", "연결형 프리롤", "free", 5, 90, {
    free: { positionAverage: 9, adaptationRating: 90 },
  }),
];
const previousStats = {
  currentOVR: 77,
  radarData: { activity: 75, gameSense: 75, pass: 75, ballControl: 75, movement: 75, mentality: 75 },
  currentPlayStyle: "창의형 플레이메이커",
};
const weightedStats = engine.generatePlayerCurrentStats({
  userId,
  cards: weightedCards,
  previousStats,
  generatedAt: "2026-05-06T00:00:00.000Z",
});
assert.equal(weightedStats.currentOVR, 80);
assert.equal(weightedStats.previousOVR, 77);
assert.equal(weightedStats.ovrChange, 3);
assert.equal(weightedStats.radarData.activity, 80);
assert.equal(weightedStats.radarChange.activity, 5);
assert.equal(weightedStats.currentPlayStyle, "연결형 프리롤");
assert.equal(weightedStats.previousPlayStyle, "창의형 플레이메이커");
assert.equal(weightedStats.currentMainPosition, "free");
assert.equal(weightedStats.positionAdaptation.free.adaptationRating, 86);
assert.equal(weightedStats.positionAdaptation.defense, null);
assert.equal(weightedStats.reliabilityLevel, "normal");
assert.equal(weightedStats.recentMatchCount, 5);

const summaryBasedStats = engine.generatePlayerCurrentStats({
  userId,
  cards: [
    positionSummaryCard("latest-summary", 82, "2026-05-20T00:00:00.000Z", "연결형 프리롤", "dm", {
      free: { count: 1 },
      am: { count: 1 },
    }, {
      free: { positionAverage: 8, adaptationRating: 84 },
      am: { positionAverage: 7, adaptationRating: 79 },
    }),
    positionSummaryCard("older-summary", 80, "2026-05-10T00:00:00.000Z", "연결형 프리롤", "dm", {
      free: { count: 1 },
    }, {
      free: { positionAverage: 8, adaptationRating: 84 },
    }),
  ],
});
assert.equal(summaryBasedStats.currentMainPosition, "free");
assert.equal(summaryBasedStats.currentPlayStyle, "연결형 프리롤");

console.log("playlog-current-stats tests passed");
