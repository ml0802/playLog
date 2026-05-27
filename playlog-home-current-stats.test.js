const assert = require("node:assert/strict");

function createElement() {
  return {
    hidden: false,
    innerHTML: "",
    textContent: "",
    value: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {},
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
}

function renderAppWithData(currentStats, matchCards = null) {
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

console.log("playlog-home-current-stats tests passed");
