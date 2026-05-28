const assert = require("node:assert/strict");

function createElement() {
  const listeners = {};
  return {
    listeners,
    hidden: false,
    innerHTML: "",
    textContent: "",
    value: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    addEventListener(type, handler) { listeners[type] = handler; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
}

function renderAppWithData(currentStats, matchCards = null, monthlyCards = [], matchFlow = null) {
  const elements = new Map();
  global.window = global;
  global.requestAnimationFrame = (callback) => callback();
  global.document = {
    addEventListener() {},
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, createElement());
      return elements.get(selector);
    },
    querySelectorAll() { return []; },
  };
  global.PlaylogEngine = require("./playlog-engine.js");
  global.PlaylogOfficialData = {
    playerCurrentStats: currentStats ? [currentStats] : [],
    playerMonthlyCards: monthlyCards,
    playerMatchCards: matchCards || (currentStats ? [{
      userId: currentStats.userId,
      matchId: "match:sangam-2026-05-23",
      generatedAt: "2026-05-23T15:00:00.000Z",
      overallRating: currentStats.currentOVR,
      overallChange: currentStats.ovrChange,
      playStyle: "연결형 프리롤",
      playStyleCode: "Link Playmaker",
      mainEvaluatedPosition: "free",
    }] : []),
    activeEvaluationMatchId: matchFlow?.match.id,
    matches: matchFlow ? [matchFlow.match] : [],
    getEvaluationTargets: matchFlow ? () => matchFlow.targets : undefined,
    getRemainingEvaluationTargets: matchFlow ? () => matchFlow.remainingTargets : undefined,
    getEvaluationProgress: matchFlow ? () => matchFlow.progress : undefined,
    getPublishWaitingStatus: matchFlow ? () => matchFlow.waiting : undefined,
  };
  delete require.cache[require.resolve("./app.js")];
  require("./app.js");
  return elements;
}

const liveStats = {
  userId: "user:seunghyun",
  currentOVR: 82,
  previousOVR: null,
  ovrChange: null,
  currentPlayStyle: "연결형 프리롤",
  currentMainPosition: "free",
  radarData: { activity: 73, gameSense: 82, pass: 83, ballControl: 65, movement: 72, mentality: 80 },
  positionAdaptation: {
    attack: null,
    am: { adaptationRating: 84 },
    dm: null,
    defense: null,
    free: { adaptationRating: 85 },
  },
};
const live = renderAppWithData(liveStats);
assert.equal(live.get("#homeOvr").textContent, 82);
assert.equal(live.get(".ovr-line .rise").hidden, true);
assert.equal(live.get("#homePosition").textContent, "프리롤 · FR");
assert.equal(live.get("#homePositionBadge").textContent, "FR");
assert.equal(live.get("#homePlayType").textContent, "연결형 프리롤");
assert.equal(live.get("#homePlayTypeSub").textContent, "Link Playmaker");
assert.ok(live.get("#homeRadar").innerHTML.includes("83"));
assert.ok(live.get("#positionGrid").innerHTML.includes("공미 · CAM"));
assert.ok(live.get("#positionGrid").innerHTML.includes("프리롤 · FR"));
assert.ok(!live.get("#positionGrid").innerHTML.includes("수비 · CB"));

const flow = renderAppWithData(liveStats, null, [], {
  match: {
    id: "match:ui-flow",
    title: "참가자 연결 경기",
    date: "2026-05-28T09:00:00.000Z",
    location: "상암 풋살장",
    status: "evaluating",
    participants: [
      { userId: "user:seunghyun", evaluationCompleted: false },
      { userId: "user:minsu", evaluationCompleted: true },
      { userId: "user:jihoon", evaluationCompleted: false },
    ],
  },
  targets: [{ userId: "user:minsu" }, { userId: "user:jihoon" }],
  remainingTargets: [{ userId: "user:jihoon" }],
  progress: { completedCount: 1, totalCount: 3, remainingCount: 2 },
  waiting: { label: "2명 평가 대기중 · 6시간 후 자동 공개" },
});
assert.equal(flow.get("#activeMatchTitle").textContent, "참가자 연결 경기");
assert.equal(flow.get("#activeMatchProgressValue").textContent, "1/3");
assert.equal(flow.get("#activeMatchWaiting").hidden, false);
assert.ok(flow.get("#activeMatchWaiting").textContent.includes("2명 평가 대기중 · 6시간 후 자동 공개"));
assert.ok(flow.get("#evaluationPane").innerHTML.includes("김민수"));
assert.ok(flow.get("#evaluationPane").innerHTML.includes("이지훈"));
assert.ok(flow.get("#evaluationPane").innerHTML.includes("평가 완료"));
assert.ok(!flow.get("#evaluationPane").innerHTML.includes("박현우"));

const recent = renderAppWithData(liveStats, [
  { userId: "user:other", matchId: "match:other", generatedAt: "2026-05-30T00:00:00.000Z", overallRating: 99, overallChange: 9, playStyle: "무관", mainEvaluatedPosition: "attack" },
  { userId: "user:seunghyun", matchId: "match:older", generatedAt: "2026-05-21T00:00:00.000Z", overallRating: 74, overallChange: null, playStyle: "조율형 플레이메이커", mainEvaluatedPosition: "am" },
  { userId: "user:seunghyun", matchId: "match:sangam-2026-05-23", generatedAt: "2026-05-23T15:00:00.000Z", overallRating: 82, overallChange: 4, playStyle: "연결형 프리롤", playStyleCode: "Link Playmaker", mainEvaluatedPosition: "free" },
  { userId: "user:seunghyun", matchId: "match:newest", generatedAt: "2026-05-27T00:00:00.000Z", overallRating: 80, overallChange: -1, playStyle: "창의형 플레이메이커", mainEvaluatedPosition: "am" },
  { userId: "user:seunghyun", matchId: "match:oldest-hidden", generatedAt: "2026-05-20T00:00:00.000Z", overallRating: 70, overallChange: 0, playStyle: "분석 준비중", mainEvaluatedPosition: "dm" },
]);
const recentHtml = recent.get("#recentMatches").innerHTML;
assert.ok(recentHtml.indexOf("match:newest") < recentHtml.indexOf("상암 목요일 풋살"));
assert.ok(recentHtml.includes("2026.05.27 · 공미 · 창의형 플레이메이커"));
assert.ok(recentHtml.includes("OVR 80 -1"));
assert.ok(recentHtml.includes("OVR 82 +4"));
assert.ok(!recentHtml.includes("match:oldest-hidden"));
assert.ok(!recentHtml.includes("match:other"));

const monthly = renderAppWithData(liveStats, null, [
  {
    userId: "user:seunghyun",
    monthKey: "2026-04",
    monthlyOVR: 76,
    monthlyOVRChange: null,
    mainPlayStyle: "조율형 플레이메이커",
    mainPosition: "am",
    matchCount: 3,
    radarData: { activity: 71, gameSense: 75, pass: 78, ballControl: 70, movement: 72, mentality: 74 },
    strengthsSummary: [{ key: "stablePass", label: "이전 패스", count: 2 }],
  },
  {
    userId: "user:seunghyun",
    monthKey: "2026-05",
    monthlyOVR: 82,
    previousMonthlyOVR: 76,
    monthlyOVRChange: 6,
    mainPlayStyle: "연결형 프리롤",
    mainPosition: "free",
    matchCount: 5,
    radarData: { activity: 79, gameSense: 81, pass: 84, ballControl: 76, movement: 78, mentality: 82 },
    strengthsSummary: [
      { key: "stablePass", label: "안정적 패스", count: 4 },
      { key: "spaceConnection", label: "공간 연결", count: 3 },
      { key: "buildUp", label: "빌드업 능력", count: 2 },
    ],
  },
  {
    userId: "user:other",
    monthKey: "2026-06",
    monthlyOVR: 99,
    mainPlayStyle: "무관",
    mainPosition: "attack",
    matchCount: 9,
    radarData: {},
    strengthsSummary: [],
  },
]);
assert.equal(monthly.get("#homeMonthlyKicker").textContent, "SEASON CARD · 2026-05");
assert.equal(monthly.get("#homeMonthlyTitle").textContent, "연결형 프리롤");
assert.equal(monthly.get("#homeMonthlyMeta").hidden, false);
assert.ok(monthly.get("#homeMonthlyMeta").innerHTML.includes("82"));
assert.ok(monthly.get("#homeMonthlyMeta").innerHTML.includes("지난달 대비 +6"));
assert.ok(monthly.get("#homeMonthlyMeta").innerHTML.includes("프리롤"));
assert.ok(monthly.get("#homeMonthlyMeta").innerHTML.includes("5경기 기준"));
assert.ok(monthly.get("#homeMonthlyRadar").innerHTML.includes("84"));
assert.ok(monthly.get("#homeMonthlyStrengths").innerHTML.includes("안정적 패스"));
assert.ok(monthly.get("#homeMonthlyStrengths").innerHTML.includes("공간 연결"));
assert.ok(monthly.get("#homeMonthlyStrengths").innerHTML.includes("빌드업 능력"));

const analysis = renderAppWithData(liveStats, [
  {
    userId: "user:seunghyun",
    matchId: "match:older-analysis",
    generatedAt: "2026-05-21T00:00:00.000Z",
    overallRating: 74,
    previousOverallRating: 73,
    overallChange: 1,
    playStyle: "조율형 플레이메이커",
    mainEvaluatedPosition: "am",
    strengthsTop3: [{ key: "stablePass", label: "이전 패스", score: 7 }],
    weaknessesTop3: [{ key: "firstTouch", label: "이전 터치", score: 5 }],
    matchAnalysisText: "이전 경기 분석입니다.",
  },
  {
    userId: "user:seunghyun",
    matchId: "match:latest-analysis",
    generatedAt: "2026-05-27T00:00:00.000Z",
    overallRating: 82,
    previousOverallRating: 78,
    overallChange: 4,
    playStyle: "연결형 프리롤",
    mainEvaluatedPosition: "free",
    strengthsTop3: [
      { key: "stablePass", score: 9 },
      { key: "buildUp", score: 8.5 },
      { key: "spaceConnection", score: 8 },
    ],
    weaknessesTop3: [
      { key: "dribbleImpact", score: 5 },
      { key: "firstTouch", score: 5.5 },
      { key: "activity", score: 6 },
    ],
    analysisChanges: [
      { key: "buildUp", diff: 3, comparisonMatchCount: 2 },
      { key: "gameControl", diff: 2, comparisonMatchCount: 2 },
      { key: "stablePass", diff: 2.5, comparisonMatchCount: 2 },
      { key: "composure", diff: -2, comparisonMatchCount: 2 },
      { key: "concentration", diff: -3, comparisonMatchCount: 2 },
      { key: "firstTouch", diff: -2.5, comparisonMatchCount: 2 },
    ],
    matchAnalysisText: "안정적 패스, 빌드업 능력과 공간 연결에서 좋은 평가를 받았습니다.",
  },
]);
analysis.get("#officialCard").listeners.click();
const analysisHtml = analysis.get("#sheet").innerHTML;
assert.equal(analysis.get(".growth-read small").textContent, "MATCH ANALYSIS");
assert.equal(analysis.get(".growth-read strong").textContent, "상승: 빌드업 능력 +3 · 안정적 패스 +2.5 · 경기 조율 +2");
assert.equal(analysis.get(".growth-read p").textContent, "하락: 집중력 -3 · 퍼스트터치 -2.5 · 침착성 -2");
assert.ok(analysisHtml.includes("상승 스탯 TOP 3"));
assert.ok(analysisHtml.includes("하락 스탯 TOP 3"));
assert.ok(analysisHtml.includes("안정적 패스"));
assert.ok(analysisHtml.includes("빌드업 능력"));
assert.ok(analysisHtml.includes("경기 조율"));
assert.ok(analysisHtml.includes("집중력"));
assert.ok(analysisHtml.includes("퍼스트터치"));
assert.ok(analysisHtml.includes("침착성"));
assert.ok(analysisHtml.includes("+3"));
assert.ok(analysisHtml.includes("+2.5"));
assert.ok(analysisHtml.includes("-2.5"));
assert.ok(analysisHtml.includes("-3"));
assert.ok(analysisHtml.includes("78 → 82"));
assert.ok(analysisHtml.includes("안정적 패스, 빌드업 능력과 공간 연결에서 좋은 평가를 받았습니다."));
assert.ok(!analysisHtml.includes("이전 경기 분석입니다."));

const noChangeAnalysis = renderAppWithData(liveStats, [{
  userId: "user:seunghyun",
  matchId: "match:no-changes",
  generatedAt: "2026-05-27T00:00:00.000Z",
  overallRating: 82,
  playStyle: "연결형 프리롤",
  mainEvaluatedPosition: "free",
  strengthsTop3: [{ key: "stablePass", score: 9 }, { key: "buildUp", score: 8 }, { key: "spaceConnection", score: 8 }],
  weaknessesTop3: [{ key: "dribbleImpact", score: 5 }, { key: "firstTouch", score: 6 }, { key: "activity", score: 6 }],
  analysisChanges: [],
  matchAnalysisText: "기존 강점 분석입니다.",
}]);
noChangeAnalysis.get("#officialCard").listeners.click();
assert.ok(noChangeAnalysis.get("#sheet").innerHTML.includes("강점 TOP 3"));
assert.equal(noChangeAnalysis.get(".growth-read strong").textContent, "안정적 패스 · 빌드업 능력 · 공간 연결");

const amLive = renderAppWithData({
  userId: "user:seunghyun",
  currentOVR: 80,
  previousOVR: 78,
  ovrChange: 2,
  currentPlayStyle: "창의형 플레이메이커",
  currentMainPosition: "am",
  radarData: { activity: 70, gameSense: 80, pass: 82, ballControl: 71, movement: 72, mentality: 77 },
  positionAdaptation: { attack: null, am: { adaptationRating: 84 }, dm: null, defense: null, free: null },
});
assert.equal(amLive.get("#homePosition").textContent, "공미 · CAM");
assert.equal(amLive.get("#homePositionBadge").textContent, "CAM");

const fallback = renderAppWithData(null);
assert.equal(fallback.get("#homeOvr").textContent, 78);
assert.equal(fallback.get(".ovr-line .rise").hidden, false);
assert.ok(fallback.get("#homeRadar").innerHTML.includes("활동성"));
assert.ok(fallback.get("#recentMatches").innerHTML.includes("용산 토요 풋살"));
assert.ok(fallback.get("#evaluationPane").innerHTML.includes("김민수"));
assert.ok(fallback.get("#evaluationPane").innerHTML.includes("최성민"));
assert.equal(fallback.has("#homeMonthlyMeta"), false);
assert.equal(fallback.has("#homeMonthlyRadar"), false);
fallback.get("#officialCard").listeners.click();
assert.ok(fallback.get("#sheet").innerHTML.includes("상승 스탯 TOP 3"));

console.log("playlog-home-current-stats tests passed");
