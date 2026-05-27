const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");

const userId = "user:monthly";

function matchCard(id, generatedAt, overallRating, playStyle, mainPosition, radar, adaptations, strengths, weaknesses) {
  return {
    id,
    matchId: `match:${id}`,
    userId,
    generatedAt,
    overallRating,
    playStyle,
    mainEvaluatedPosition: mainPosition,
    radarData: {
      activity: radar, gameSense: radar, pass: radar,
      ballControl: radar, movement: radar, mentality: radar,
    },
    positionAdaptation: {
      attack: null, am: null, dm: null, defense: null, free: null,
      ...adaptations,
    },
    strengthsTop3: strengths.map(([key, label]) => ({ key, label })),
    weaknessesTop3: weaknesses.map(([key, label]) => ({ key, label })),
  };
}

const aprilCard = matchCard(
  "april", "2026-04-20T00:00:00.000Z", 74, "창의형 플레이메이커", "am", 70,
  { am: { positionAverage: 7, adaptationRating: 79 } },
  [["chanceMaking", "찬스 메이킹"]], [["frontPressure", "전방 압박"]],
);
const mayCards = [
  matchCard(
    "may-latest", "2026-05-28T00:00:00.000Z", 84, "연결형 프리롤", "free", 90,
    { free: { positionAverage: 8, adaptationRating: 84 } },
    [["stablePass", "안정적 패스"], ["spaceConnection", "공간 연결"]],
    [["dribbleImpact", "드리블 영향력"]],
  ),
  matchCard(
    "may-middle", "2026-05-18T00:00:00.000Z", 80, "조율형 플레이메이커", "am", 80,
    { am: { positionAverage: 7, adaptationRating: 79 } },
    [["stablePass", "안정적 패스"], ["gameControl", "경기 조율"]],
    [["dribbleImpact", "드리블 영향력"]],
  ),
  matchCard(
    "may-older", "2026-05-08T00:00:00.000Z", 76, "연결형 프리롤", "free", 70,
    { free: { positionAverage: 6, adaptationRating: 73 } },
    [["buildUp", "빌드업 능력"], ["spaceConnection", "공간 연결"]],
    [["firstTouch", "퍼스트터치"]],
  ),
];
const ignoredCard = { ...mayCards[0], id: "other", userId: "user:other", overallRating: 100 };

const previousMonthlyCard = engine.generatePlayerMonthlyCard({
  userId,
  monthKey: "2026-04",
  cards: [aprilCard, ...mayCards],
});
const monthlyCard = engine.generatePlayerMonthlyCard({
  userId,
  monthKey: "2026-05",
  cards: [aprilCard, ...mayCards, ignoredCard],
  previousMonthlyCard,
  generatedAt: "2026-05-31T00:00:00.000Z",
});

assert.equal(monthlyCard.userId, userId);
assert.equal(monthlyCard.monthKey, "2026-05");
assert.equal(monthlyCard.monthlyOVR, 80);
assert.equal(monthlyCard.previousMonthlyOVR, 74);
assert.equal(monthlyCard.monthlyOVRChange, 6);
assert.equal(monthlyCard.matchCount, 3);
assert.equal(monthlyCard.radarData.pass, 80);
assert.equal(monthlyCard.mainPlayStyle, "연결형 프리롤");
assert.equal(monthlyCard.mainPosition, "free");
assert.equal(monthlyCard.positionAdaptation.free.positionAverage, 7);
assert.equal(monthlyCard.positionAdaptation.free.adaptationRating, 79);
assert.equal(monthlyCard.positionAdaptation.free.matchCount, 2);
assert.equal(monthlyCard.positionAdaptation.defense, null);
assert.deepEqual(monthlyCard.strengthsSummary.slice(0, 2), [
  { key: "stablePass", label: "안정적 패스", count: 2 },
  { key: "spaceConnection", label: "공간 연결", count: 2 },
]);
assert.deepEqual(monthlyCard.weaknessesSummary.slice(0, 1), [
  { key: "dribbleImpact", label: "드리블 영향력", count: 2 },
]);

const tiedLatestWins = engine.generatePlayerMonthlyCard({
  userId,
  monthKey: "2026-06",
  cards: [
    matchCard("june-latest", "2026-06-20T00:00:00.000Z", 80, "연결형 프리롤", "free", 80, {}, [], []),
    matchCard("june-older", "2026-06-10T00:00:00.000Z", 80, "창의형 플레이메이커", "am", 80, {}, [], []),
  ],
});
assert.equal(tiedLatestWins.mainPlayStyle, "연결형 프리롤");
assert.equal(tiedLatestWins.mainPosition, "free");
assert.equal(engine.generatePlayerMonthlyCard({ userId, monthKey: "2026-07", cards: mayCards }), null);

console.log("playlog-monthly-card tests passed");
