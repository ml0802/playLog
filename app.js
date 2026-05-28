const commonRatings = {
  work_rate: 7,
  decision: 7,
  safe_pass: 7,
  buildup: 7,
  first_touch: 7,
  dribble_impact: 6,
  composure: 8,
  off_the_ball: 6,
  concentration: 8,
  stamina: 7,
};

const positionRatings = { attack: null, cam: 8, cdm: 7, defense: null, free: 8.6 };
const tendencies = { teamwork: 8, aggression: 7, boldness: 7, creativity: 9, vision: 8, anticipation: 7, leadership: 6, competitiveness: 8 };
const tendencyEvaluationCount = 4;
const positionLabels = {
  attack: ["공격", "ST"],
  am: ["공미", "CAM"],
  cam: ["공미", "CAM"],
  dm: ["수미", "CDM"],
  cdm: ["수미", "CDM"],
  defense: ["수비", "CB"],
  free: ["프리롤", "FR"],
};
const playTypeCatalog = {
  attack: [
    ["침투형 공격수", "Advanced Forward · AF"],
    ["골잡이형 포처", "Poacher · P"],
    ["연계형 공격수", "Target Forward · TF"],
    ["압박형 포워드", "Pressing Forward · PF"],
    ["자유형 공격수", "False Nine · F9"],
  ],
  cam: [
    ["창의형 플레이메이커", "Advanced Playmaker · AP"],
    ["자유형 플레이메이커", "Trequartista · T"],
    ["공격 가담형 공미", "Shadow Striker · SS"],
    ["조율형 플레이메이커", "Enganche · EG"],
    ["로밍 플레이메이커", "Roaming Playmaker · RPM"],
  ],
  cdm: [
    ["후방 조율형 미드필더", "Deep Lying Playmaker · DLP"],
    ["압박형 미드필더", "Ball Winning Midfielder · BWM"],
    ["안정형 앵커", "Anchor · A"],
    ["활동형 올라운더", "Box To Box Midfielder · BBM"],
    ["자유 조율형 플레이메이커", "Regista · RGA"],
  ],
  defense: [
    ["안정형 수비수", "Central Defender · CD"],
    ["빌드업형 수비수", "Ball Playing Defender · BPD"],
    ["수비 집중형 수비수", "No-Nonsense Centre-Back · NCB"],
    ["활동형 수비수", "Wide Centre-Back · WCB"],
    ["예측형 수비수", "Predictive Defender"],
  ],
  free: [
    ["전방위 로머", "All-Round Roamer"],
    ["연결형 플레이메이커", "Link Playmaker"],
    ["유동형 플레이어", "Fluid Player"],
    ["에너지형 프리롤", "Energy Freerole"],
    ["올라운드 플레이어", "All-Round Player"],
  ],
};
const avatarSheets = {
  attack: "./assets/preset-attack.png",
  cam: "./assets/preset-cam.png",
  cdm: "./assets/preset-cdm.png",
  defense: "./assets/preset-defense.png",
  free: "./assets/preset-free.png",
};
const evaluationFields = window.PlaylogEngine.EVALUATION_FIELDS;
const currentUserId = "user:seunghyun";
const currentMatchId = window.PlaylogOfficialData?.activeEvaluationMatchId || "match:sangam-2026-05-23";
const observedTraitScore = 8;
const playerIds = {
  "김민수": "user:minsu",
  "이지훈": "user:jihoon",
  "박현우": "user:hyunwoo",
  "정우진": "user:woojin",
  "최성민": "user:sungmin",
};
const userNames = {
  [currentUserId]: "승현",
  ...Object.fromEntries(Object.entries(playerIds).map(([name, id]) => [id, name])),
};
const matchAnalysis = {
  ovr: { previous: 75, current: 78 },
  statChanges: [
    { label: "패스", delta: 3, identityPriority: 3 },
    { label: "게임 센스", delta: 2, identityPriority: 2 },
    { label: "공간 연결", delta: 1, identityPriority: 3 },
    { label: "활동성", delta: 1, identityPriority: 1 },
    { label: "드리블", delta: -1, identityPriority: 1 },
    { label: "슈팅 정확도", delta: -1, identityPriority: 0 },
    { label: "마무리", delta: -1, identityPriority: 0 },
  ],
  styleChanges: [
    {
      label: "연결형 플레이메이커 성향 증가",
      basis: "안정적 패스 + 빌드업 + 팀플레이 상승",
    },
    {
      label: "에너지형 프리롤 강화",
      basis: "활동량 + 체력 + 적극성 상승",
    },
    {
      label: "로밍 움직임 증가",
      basis: "오프더볼 + 활동량 + 공간 연결 상승",
    },
  ],
};
const fallbackPlayers = ["김민수", "이지훈", "박현우", "정우진", "최성민"];
const positions = [
  ["attack", "공격", "골문 앞에서 득점을 맡아요"],
  ["am", "공미", "공격 전개와 연결을 맡아요"],
  ["dm", "수미", "밸런스와 회수를 맡아요"],
  ["defense", "수비", "상대 공격을 막아요"],
  ["free", "프리롤", "정해진 역할보다 흐름을 만들어요"],
];
const flowSteps = ["선수 선택", "포지션 선택", "공통 필수 평가", "포지션 특화 평가", "선택 평가", "한 줄 평", "경기 투표"];
const reflectionSteps = ["포지션 선택", "공통 자가평가", "포지션 자가평가", "성향과 특징", "개인 회고"];

let currentStep = 0;
let selectedPlayer = fallbackPlayers[0];
let selectedPosition = null;
let commonScores = Object.fromEntries(evaluationFields.common.map((field) => [field.key, null]));
let positionScores = {};
let selectedTraits = [];
let traitScores = {};
let selectedHighlights = [];
let overallComment = "";
let lastGeneratedCard = null;
let selectedPOMTargetId = null;
let selectedNextStarTargetId = null;
let pomReason = "";
let nextStarReason = "";
let reflectionStep = 0;
let reflectionMatchId = null;
let reflectionPosition = "free";
let reflectionCommonScores = Object.fromEntries(evaluationFields.common.map((field) => [field.key, 6]));
let reflectionPositionScores = Object.fromEntries(evaluationFields.position.free.map((field) => [field.key, 6]));
let reflectionTraits = [];
let reflectionTraitScores = {};
let reflectionHighlights = [];
let satisfactionScore = 7;
let feltStrength = "";
let feltWeakness = "";
let reflectionGoal = "";
let reflectionMemo = "";
let selectedAvatar = "free-1";
let toastTimer;

function resetEvaluationDraft() {
  selectedPosition = null;
  commonScores = Object.fromEntries(evaluationFields.common.map((field) => [field.key, null]));
  positionScores = {};
  selectedTraits = [];
  traitScores = {};
  selectedHighlights = [];
  overallComment = "";
  lastGeneratedCard = null;
}

function activeEvaluationForTarget(targetUserId = selectedPlayerId()) {
  return (window.PlaylogOfficialData?.evaluations || [])
    .filter((evaluation) =>
      evaluation.matchId === currentMatchId
      && evaluation.evaluatorUserId === currentUserId
      && evaluation.targetUserId === targetUserId
      && evaluation.isActive !== false,
    )
    .sort((left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime())[0] || null;
}

function loadEvaluationDraft(evaluation) {
  if (!evaluation) {
    resetEvaluationDraft();
    return;
  }
  selectedPosition = evaluation.selectedPosition || null;
  commonScores = Object.fromEntries(evaluationFields.common.map((field) => [field.key, null]));
  positionScores = selectedPosition && evaluationFields.position[selectedPosition]
    ? Object.fromEntries(evaluationFields.position[selectedPosition].map((field) => [field.key, null]))
    : {};
  (evaluation.scores || []).forEach((score) => {
    if (score.category === "common" && score.key in commonScores) commonScores[score.key] = score.score;
    if (score.category === "position" && score.key in positionScores) positionScores[score.key] = score.score;
  });
  selectedTraits = (evaluation.traits || []).map((trait) => trait.key);
  traitScores = Object.fromEntries((evaluation.traits || []).map((trait) => [trait.key, trait.score]));
  selectedHighlights = (evaluation.highlights || []).map((highlight) => highlight.key).slice(0, 2);
  overallComment = evaluation.overallComment || "";
  lastGeneratedCard = null;
}

function resetAwardDraft() {
  selectedPOMTargetId = null;
  selectedNextStarTargetId = null;
  pomReason = "";
  nextStarReason = "";
}

function loadAwardDraft() {
  const pomVote = window.PlaylogOfficialData?.getMatchAwardVote?.(currentMatchId, currentUserId, "pom")
    || window.PlaylogOfficialData?.getPOMVote?.(currentMatchId, currentUserId);
  const nextStarVote = window.PlaylogOfficialData?.getMatchAwardVote?.(currentMatchId, currentUserId, "next_star");
  selectedPOMTargetId = pomVote?.targetUserId || null;
  selectedNextStarTargetId = nextStarVote?.targetUserId || null;
  pomReason = pomVote?.reason || "";
  nextStarReason = nextStarVote?.reason || "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fieldLabel(key) {
  const pools = [
    evaluationFields.common,
    ...Object.values(evaluationFields.position),
    evaluationFields.traits,
    evaluationFields.highlights,
  ];
  return pools.flat().find((field) => field.key === key)?.label || key;
}

function activeMatchRecord() {
  return window.PlaylogOfficialData?.matches?.find((match) => match.id === currentMatchId) || null;
}

function evaluationTargetPlayers() {
  const targets = window.PlaylogOfficialData?.getEvaluationTargets?.(currentMatchId, currentUserId);
  if (!targets?.length) {
    return fallbackPlayers.map((name) => ({ name, userId: playerIds[name] }));
  }
  return targets.map((participant) => ({
    name: userNames[participant.userId] || participant.userId,
    userId: participant.userId,
  }));
}

function selectedPlayerId() {
  return evaluationTargetPlayers().find((player) => player.name === selectedPlayer)?.userId
    || playerIds[selectedPlayer];
}

function matchDisplayMeta(match) {
  const date = new Date(match.date);
  const dateText = Number.isNaN(date.getTime())
    ? match.date
    : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${dateText} · ${match.location}`;
}

function renderActiveMatchProgress() {
  const match = activeMatchRecord();
  const progress = window.PlaylogOfficialData?.getEvaluationProgress?.(currentMatchId);
  if (!match || !progress) return;
  const waiting = window.PlaylogOfficialData.getPublishWaitingStatus?.(currentMatchId);
  const pomResult = match.status === "published"
    ? window.PlaylogOfficialData.calculateMatchAward?.(currentMatchId, "pom")
    : null;
  const nextStarResult = match.status === "published"
    ? window.PlaylogOfficialData.calculateMatchAward?.(currentMatchId, "next_star")
    : null;
  const progressPercent = progress.totalCount ? Math.round((progress.completedCount / progress.totalCount) * 100) : 0;
  document.querySelector("#activeMatchStatus").textContent = match.status === "published" ? "결과 공개" : "결과 공개 대기";
  document.querySelector("#activeMatchTitle").textContent = match.title;
  document.querySelector("#activeMatchMeta").textContent = matchDisplayMeta(match);
  const waitingElement = document.querySelector("#activeMatchWaiting");
  waitingElement.hidden = !waiting;
  if (waiting) {
    waitingElement.textContent = pomResult?.winnerUserIds?.length || nextStarResult?.winnerUserIds?.length
      ? [
        pomResult?.winnerUserIds?.length ? `POM: ${pomResult.winnerUserIds.map((id) => userNames[id] || id).join(" · ")}` : null,
        nextStarResult?.winnerUserIds?.length ? `NEXT STAR: ${nextStarResult.winnerUserIds.map((id) => userNames[id] || id).join(" · ")}` : null,
      ].filter(Boolean).join(" / ")
      : `${waiting.label} · 평가가 끝나면 선수카드가 열립니다`;
  }
  document.querySelector("#activeMatchFaces").setAttribute("aria-label", `참가자 ${progress.totalCount}명 중 ${progress.completedCount}명 완료`);
  document.querySelector("#activeMatchFaces").innerHTML = match.participants.map((participant) => {
    const initial = (userNames[participant.userId] || "?").slice(0, 1);
    return participant.evaluationCompleted ? `<span>${initial}</span>` : "<i></i>";
  }).join("");
  document.querySelector("#activeMatchProgress").setAttribute("style", `--progress: ${progressPercent}`);
  document.querySelector("#activeMatchProgressValue").textContent = `${progress.completedCount}/${progress.totalCount}`;
  document.querySelector("#activeMatchProgressLabel").textContent = match.status === "published" ? "공개" : "평가";
  document.querySelector("#activeMatchAction").textContent = match.status === "published" ? "결과 보기 ›" : "평가 진행 ›";
}
let friends = [
  ["김민수", "OVR +3 · 창의형 플레이메이커"],
  ["박현우", "최근 상승세 · 수비 참여도 +2"],
  ["이지훈", "안정 연결형 · 패스 성공률 상승"],
];

function average(values) {
  const usable = values.filter((value) => typeof value === "number");
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function calculateMatchScore(commonAverage, positionAverage) {
  return commonAverage * 0.7 + positionAverage * 0.3;
}

function toOvr(score) {
  return Math.round(40 + score * 5.5);
}

function radarStats(ratings) {
  return [
    ["활동성", average([ratings.work_rate, ratings.stamina])],
    ["게임 센스", average([ratings.decision, ratings.concentration])],
    ["패스", average([ratings.safe_pass, ratings.buildup])],
    ["볼 컨트롤", average([ratings.first_touch, ratings.dribble_impact])],
    ["움직임", ratings.off_the_ball * 0.75 + ratings.work_rate * 0.25],
    ["멘탈", ratings.composure * 0.7 + ratings.concentration * 0.3],
  ].map(([label, score]) => [label, Math.round(40 + score * 5.5)]);
}

function currentHomeStats() {
  return window.PlaylogOfficialData?.playerCurrentStats
    ?.find((stats) => stats && stats.userId === currentUserId) || null;
}

function latestHomeMonthlyCard() {
  return (window.PlaylogOfficialData?.playerMonthlyCards || [])
    .filter((card) => card && card.userId === currentUserId)
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))[0] || null;
}

function playerCurrentRadarStats(stats) {
  const labels = {
    activity: "활동성",
    gameSense: "게임 센스",
    pass: "패스",
    ballControl: "볼 컨트롤",
    movement: "움직임",
    mentality: "멘탈",
  };
  return Object.entries(labels).map(([key, label]) => [label, stats.radarData[key]]);
}

function currentPlayStyleCode(stats) {
  return window.PlaylogOfficialData?.playerMatchCards
    ?.filter((card) => card && card.userId === stats.userId && card.playStyle === stats.currentPlayStyle)
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())[0]
    ?.playStyleCode || "";
}

function recentHomeMatchCards() {
  return (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.userId === currentUserId)
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())
    .slice(0, 3);
}

function latestHomeAnalysisCard() {
  const card = (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((item) => item && item.userId === currentUserId)
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())[0];
  return card
    && Array.isArray(card.strengthsTop3)
    && Array.isArray(card.weaknessesTop3)
    && card.matchAnalysisText
    ? card
    : null;
}

function matchTitle(card) {
  const knownMatches = { "match:sangam-2026-05-23": "상암 목요일 풋살" };
  return knownMatches[card.matchId] || card.matchId;
}

function matchDate(card) {
  if (!card.generatedAt) return "";
  const date = new Date(card.generatedAt);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function representativePosition() {
  return Object.entries(positionRatings)
    .filter(([, rating]) => typeof rating === "number")
    .sort((a, b) => b[1] - a[1])[0][0];
}

function playType(positionKey, traits, evaluationCount = tendencyEvaluationCount) {
  if (evaluationCount < 2) return null;
  const weightedScores = {
    attack: [traits.anticipation + traits.boldness, traits.boldness + traits.competitiveness, traits.teamwork + traits.vision, traits.aggression + traits.competitiveness, traits.creativity + traits.vision],
    cam: [traits.creativity + traits.vision, traits.creativity + traits.boldness, traits.boldness + traits.anticipation, traits.vision + traits.teamwork, traits.vision + traits.aggression],
    cdm: [traits.vision + traits.teamwork, traits.aggression + traits.competitiveness, traits.teamwork + traits.anticipation, traits.aggression + traits.leadership, traits.creativity + traits.vision],
    defense: [traits.teamwork + traits.leadership, traits.vision + traits.creativity, traits.competitiveness + traits.leadership, traits.aggression + traits.teamwork, traits.anticipation + traits.vision],
    free: [traits.boldness + traits.aggression, traits.vision + traits.teamwork + traits.creativity, traits.creativity + traits.boldness, traits.aggression + traits.competitiveness, traits.teamwork + traits.leadership],
  };
  const rankings = playTypeCatalog[positionKey]
    .map(([name, sub], index) => ({ name, sub, score: weightedScores[positionKey][index] }))
    .sort((a, b) => b.score - a.score);
  return { primary: rankings[0], support: rankings.slice(1, 3) };
}

function avatarPresetItems() {
  return Object.entries(playTypeCatalog).flatMap(([positionKey, types]) =>
    types.map(([name, sub], index) => ({
      key: `${positionKey}-${index}`,
      positionKey,
      name,
      sub,
      index,
      image: avatarSheets[positionKey],
    })),
  );
}

function currentAvatarPreset() {
  return avatarPresetItems().find((preset) => preset.key === selectedAvatar) || avatarPresetItems()[0];
}

function presetStyle(preset) {
  return `--preset-image:url('${preset.image}');--preset-position:${preset.index * 25}%`;
}

function rankedStatChanges(direction) {
  return matchAnalysis.statChanges
    .filter((stat) => (direction === "up" ? stat.delta > 0 : stat.delta < 0))
    .sort((a, b) => {
      const deltaOrder = direction === "up" ? b.delta - a.delta : a.delta - b.delta;
      return deltaOrder || b.identityPriority - a.identityPriority;
    })
    .slice(0, 3);
}

function renderResultStats(direction) {
  return rankedStatChanges(direction)
    .map((change, index) => {
      const width = Math.max(34, Math.round(Math.abs(change.delta) / 3 * 100));
      return `<div class="result-stat ${direction}"><b>${index + 1}</b><small>${change.label}</small><i aria-hidden="true"><span style="width:${width}%"></span></i><strong>${change.delta > 0 ? "+" : ""}${change.delta}</strong></div>`;
    })
    .join("");
}

function analysisItemLabel(item) {
  if (item.label) return item.label;
  const fields = [
    ...evaluationFields.common,
    ...Object.values(evaluationFields.position).flat(),
  ];
  return fields.find((field) => field.key === item.key)?.label || item.key;
}

function renderOfficialResultStats(items, direction) {
  return items.slice(0, 3)
    .map((item, index) => {
      const score = Number(item.score);
      const width = Number.isFinite(score) ? Math.max(18, Math.min(100, Math.round(score * 10))) : 0;
      const displayScore = Number.isFinite(score) ? String(Math.round(score * 10) / 10) : "-";
      return `<div class="result-stat ${direction}"><b>${index + 1}</b><small>${analysisItemLabel(item)}</small><i aria-hidden="true"><span style="width:${width}%"></span></i><strong>${displayScore}</strong></div>`;
    })
    .join("");
}

function splitAnalysisChanges(changes) {
  const available = Array.isArray(changes) ? changes.filter((change) => Number.isFinite(change.diff)) : [];
  return {
    rising: available.filter((change) => change.diff > 0).sort((left, right) => right.diff - left.diff).slice(0, 3),
    falling: available.filter((change) => change.diff < 0).sort((left, right) => left.diff - right.diff).slice(0, 3),
  };
}

function renderAnalysisChanges(items, direction) {
  return items.map((change, index) => {
    const width = Math.max(34, Math.min(100, Math.round(Math.abs(change.diff) / 3 * 100)));
    const displayDiff = `${change.diff > 0 ? "+" : ""}${change.diff}`;
    return `<div class="result-stat ${direction}"><b>${index + 1}</b><small>${analysisItemLabel(change)}</small><i aria-hidden="true"><span style="width:${width}%"></span></i><strong>${displayDiff}</strong></div>`;
  }).join("");
}

function officialAnalysisTemplate(card) {
  const hasPrevious = Number.isFinite(card.previousOverallRating);
  const hasChange = Number.isFinite(card.overallChange);
  const ovrValue = hasPrevious ? `${card.previousOverallRating} → ${card.overallRating}` : `OVR ${card.overallRating}`;
  const trend = hasChange
    ? `${card.overallChange > 0 ? "▲ +" : card.overallChange < 0 ? "▼ " : ""}${card.overallChange}`
    : "-";
  const changes = splitAnalysisChanges(card.analysisChanges);
  const hasAnalysisChanges = changes.rising.length || changes.falling.length;
  const analysisSections = hasAnalysisChanges ? `
      ${changes.rising.length ? `
      <div class="result-section up">
        <div class="result-section-head">상승 스탯 TOP 3 <span>↗</span></div>
        <div class="result-grid">${renderAnalysisChanges(changes.rising, "up")}</div>
      </div>` : ""}
      ${changes.falling.length ? `
      <div class="result-section down">
        <div class="result-section-head">하락 스탯 TOP 3 <span>↘</span></div>
        <div class="result-grid">${renderAnalysisChanges(changes.falling, "down")}</div>
      </div>` : ""}
      <p class="analysis-note">※ 최근 이전 경기 평균 대비 절대 변화량 2 이상인 항목만 표시합니다.</p>
    ` : `
      <div class="result-section up">
        <div class="result-section-head">강점 TOP 3 <span>↗</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.strengthsTop3, "up")}</div>
      </div>
      <div class="result-section down">
        <div class="result-section-head">보완점 TOP 3 <span>↘</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.weaknessesTop3, "down")}</div>
      </div>
      <p class="analysis-note">※ 동점인 경우 대표 포지션과 플레이유형의 핵심 능력을 우선 표시합니다.</p>
    `;
  return `
      <div class="result-title">
        <h3>MATCH ANALYSIS</h3>
        <button data-close-sheet type="button" aria-label="결과창 닫기">×</button>
      </div>
      <p class="result-description">최신 경기 동료 평가 기반 분석입니다.</p>
      <div class="result-overall">
        <div><small>OVR</small><strong>${ovrValue}</strong></div>
        <em>${trend}</em>
      </div>
      ${analysisSections}
      <div class="style-change">
        <small>경기 분석 요약</small>
        <p>${card.matchAnalysisText}</p>
      </div>
      <button class="primary full" data-close-sheet type="button">확인</button>
    `;
}

function renderRadar(target, stats, size = 140) {
  const center = size / 2;
  const detailed = size > 180;
  const maxRadius = size * (detailed ? 0.27 : 0.35);
  const points = stats.map(([, score], index) => {
    const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  });
  const grid = [0.33, 0.66, 1].map((scale) => {
    const ring = stats.map((_, index) => {
      const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
      return `${center + Math.cos(angle) * maxRadius * scale},${center + Math.sin(angle) * maxRadius * scale}`;
    }).join(" ");
    return `<polygon points="${ring}" fill="none" stroke="rgba(151,132,213,.22)" />`;
  }).join("");
  const labels = stats.map(([label, score], index) => {
    const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
      const x = center + Math.cos(angle) * maxRadius * (detailed ? 1.47 : 1.28);
      const y = center + Math.sin(angle) * maxRadius * (detailed ? 1.47 : 1.28);
      return detailed
        ? `<text x="${x}" y="${y}" text-anchor="middle"><tspan x="${x}" dy="-8">${label}</tspan><tspan x="${x}" dy="22">${score}</tspan></text>`
        : `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
  }).join("");

  target.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" role="img">
      <defs><linearGradient id="radarFill" x1="0" x2="1"><stop offset="0" stop-color="#6336e6" /><stop offset="1" stop-color="#a268ff" /></linearGradient></defs>
      ${grid}
      <polygon points="${points.map((point) => point.join(",")).join(" ")}" fill="url(#radarFill)" opacity=".58" stroke="#a268ff" stroke-width="2" />
      ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#b48cff" />`).join("")}
      ${labels}
    </svg>
  `;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openSheet(kind) {
  const overlay = document.querySelector("#overlay");
  const sheet = document.querySelector("#sheet");
  const officialAnalysisCard = latestHomeAnalysisCard();
  const templates = {
    fab: `
      <h3>무엇을 시작할까요?</h3>
      <p>플레이로그의 핵심 행동을 바로 시작합니다.</p>
      <div class="sheet-actions">
        <button class="sheet-action" data-toast-sheet="새 경기 추가는 MVP 다음 단계에서 연결됩니다" type="button">새 경기 추가 <span>＋</span></button>
        <button class="sheet-action" data-go-sheet="evaluate" type="button">평가 진행 <span>›</span></button>
        <button class="sheet-action" data-go-sheet="reflection" type="button">회고 작성 <span>↗</span></button>
      </div>
    `,
    friend: `
      <h3>친구 요청 보내기</h3>
      <p>닉네임을 검색해서 임시 요청을 보낼 수 있어요.</p>
      <input id="friendSearch" placeholder="예: 홍길동" />
      <button class="primary full" id="sendFriendRequest" type="button">친구 요청 보내기</button>
    `,
    card: officialAnalysisCard ? officialAnalysisTemplate(officialAnalysisCard) : `
      <div class="result-title">
        <h3>MATCH ANALYSIS</h3>
        <button data-close-sheet type="button" aria-label="결과창 닫기">×</button>
      </div>
      <p class="result-description">이번 경기에서 가장 큰 변화가 있었던 능력치입니다.</p>
      <div class="result-overall">
        <div><small>OVR 변화</small><strong>${matchAnalysis.ovr.previous} → ${matchAnalysis.ovr.current}</strong></div>
        <em>▲ +${matchAnalysis.ovr.current - matchAnalysis.ovr.previous}</em>
      </div>
      <div class="result-section up">
        <div class="result-section-head">상승 스탯 TOP 3 <span>↗</span></div>
        <div class="result-grid">${renderResultStats("up")}</div>
      </div>
      <div class="result-section down">
        <div class="result-section-head">하락 스탯 TOP 3 <span>↘</span></div>
        <div class="result-grid">${renderResultStats("down")}</div>
      </div>
      <p class="analysis-note">※ 동점인 경우 대표 플레이유형의 핵심 능력을 우선 표시합니다.</p>
      <div class="style-change">
        <small>플레이 성향 변화</small>
        <p>관련 능력치 묶음의 변화로 분석했습니다.</p>
        <div>${matchAnalysis.styleChanges.map((change, index) => `<article class="style-trend tone-${index + 1}"><i aria-hidden="true"></i><strong>${change.label}</strong><span>${change.basis}</span></article>`).join("")}</div>
      </div>
      <button class="primary full" data-close-sheet type="button">확인</button>
    `,
    avatar: `
      <h3>프로필 프리셋 선택</h3>
      <p>플레이유형마다 다른 선수 캐릭터 프리셋을 선택할 수 있어요.</p>
      <div class="preset-scroll">
        ${Object.entries(playTypeCatalog).map(([positionKey, types]) => `
          <section class="preset-group">
            <h4>${positionLabels[positionKey][0]}</h4>
            <div class="preset-grid">
              ${types.map(([name], index) => {
                const preset = { key: `${positionKey}-${index}`, positionKey, name, index, image: avatarSheets[positionKey] };
                return `<button class="preset-card ${selectedAvatar === preset.key ? "selected" : ""}" data-avatar="${preset.key}" type="button"><span class="preset-thumb" style="${presetStyle(preset)}"></span><strong>${name}</strong></button>`;
              }).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `,
  };
  sheet.className = `sheet ${kind === "card" ? "result-sheet" : ""}`;
  sheet.innerHTML = templates[kind];
  overlay.hidden = false;

  sheet.querySelectorAll("[data-go-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      closeSheet();
      if (button.dataset.goSheet === "evaluate") {
        loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
        loadAwardDraft();
        currentStep = 0;
        setView("evaluate");
      } else if (button.dataset.goSheet === "reflection") startReflection(null);
      else setView(button.dataset.goSheet);
      showToast(button.dataset.goSheet === "evaluate" ? "새 평가를 시작합니다" : "개인 회고를 작성합니다");
    });
  });
  sheet.querySelectorAll("[data-toast-sheet]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toastSheet));
  });
  sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  sheet.querySelectorAll("[data-avatar]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedAvatar = button.dataset.avatar;
      applyAvatarPreset();
      closeSheet();
      showToast("프로필 프리셋을 적용했습니다");
    });
  });
  sheet.querySelector("#sendFriendRequest")?.addEventListener("click", () => {
    const input = sheet.querySelector("#friendSearch");
    const name = input.value.trim() || "새 친구";
    friends = [[name, "요청 보냄 · 수락 대기"], ...friends];
    renderFriends();
    closeSheet();
    showToast("친구 요청을 보냈습니다");
  });
}

function closeSheet() {
  document.querySelector("#overlay").hidden = true;
  document.querySelector("#fab").classList.remove("open");
}

function applyAvatarPreset() {
  const preset = currentAvatarPreset();
  const art = document.querySelector("#profileAvatar");
  art.setAttribute("style", presetStyle(preset));
  art.setAttribute("aria-label", `${preset.name} 캐릭터 프리셋`);
}

function renderHome() {
  const stats = currentHomeStats();
  const analysisCard = latestHomeAnalysisCard();
  const monthlyCard = latestHomeMonthlyCard();
  const matchScore = calculateMatchScore(average(Object.values(commonRatings)), average([6.7]));
  const positionKey = stats?.currentMainPosition || representativePosition();
  const position = positionLabels[positionKey];
  const profileKey = { am: "cam", dm: "cdm" }[positionKey] || positionKey;
  const profile = playType(profileKey, tendencies);
  renderActiveMatchProgress();
  const change = document.querySelector(".ovr-line .rise");
  document.querySelector("#homeOvr").textContent = stats ? stats.currentOVR : toOvr(matchScore);
  if (stats) {
    change.hidden = !Number.isFinite(stats.ovrChange);
    if (Number.isFinite(stats.ovrChange)) {
      change.textContent = stats.ovrChange > 0 ? `▲ +${stats.ovrChange}` : stats.ovrChange < 0 ? `▼ ${stats.ovrChange}` : "- 0";
    }
  } else {
    change.hidden = false;
  }
  document.querySelector("#homePositionBadge").textContent = position[1];
  document.querySelector("#homePosition").textContent = `${position[0]} · ${position[1]}`;
  const identity = document.querySelector("#playIdentity");
  if (stats && stats.currentPlayStyle !== "분석 준비중") {
    identity.classList.remove("pending");
    document.querySelector("#homePlayType").textContent = stats.currentPlayStyle;
    document.querySelector("#homePlayTypeSub").textContent = currentPlayStyleCode(stats);
    const changeWords = ["상승 중", "강화"];
    document.querySelector("#homeSupportTags").innerHTML = profile
      ? profile.support.map((type, index) => `<span>${type.name} <em>${changeWords[index]}</em></span>`).join("")
      : "";
  } else if (stats) {
    identity.classList.add("pending");
    document.querySelector("#homePlayType").textContent = "분석 준비중";
    document.querySelector("#homePlayTypeSub").textContent = "선택 평가가 더 쌓이면 표시됩니다.";
    document.querySelector("#homeSupportTags").innerHTML = "";
  } else if (profile) {
    identity.classList.remove("pending");
    document.querySelector("#homePlayType").textContent = profile.primary.name;
    document.querySelector("#homePlayTypeSub").textContent = profile.primary.sub;
    const changeWords = ["상승 중", "강화"];
    document.querySelector("#homeSupportTags").innerHTML = profile.support.map((type, index) => `<span>${type.name} <em>${changeWords[index]}</em></span>`).join("");
  } else {
    identity.classList.add("pending");
    document.querySelector("#homePlayType").textContent = "플레이유형 분석 준비중";
    document.querySelector("#homePlayTypeSub").textContent = "선택 평가가 더 쌓이면 표시됩니다.";
    document.querySelector("#homeSupportTags").innerHTML = "";
  }
  applyAvatarPreset();
  renderRadar(document.querySelector("#homeRadar"), stats ? playerCurrentRadarStats(stats) : radarStats(commonRatings), 320);
  if (analysisCard) {
    const strengthLabels = analysisCard.strengthsTop3.slice(0, 3).map(analysisItemLabel).join(" · ");
    const weaknessLabels = analysisCard.weaknessesTop3.slice(0, 3).map(analysisItemLabel).join(" · ");
    const changes = splitAnalysisChanges(analysisCard.analysisChanges);
    const risingLabels = changes.rising.map((change) => `${analysisItemLabel(change)} +${change.diff}`).join(" · ");
    const fallingLabels = changes.falling.map((change) => `${analysisItemLabel(change)} ${change.diff}`).join(" · ");
    document.querySelector(".growth-read small").textContent = "MATCH ANALYSIS";
    if (changes.rising.length || changes.falling.length) {
      document.querySelector(".growth-read strong").textContent = risingLabels ? `상승: ${risingLabels}` : "최근 상승 항목 없음";
      document.querySelector(".growth-read p").textContent = fallingLabels ? `하락: ${fallingLabels}` : "최근 하락 항목 없음";
    } else {
      document.querySelector(".growth-read strong").textContent = strengthLabels;
      document.querySelector(".growth-read p").textContent = `${analysisCard.matchAnalysisText} 보완 포인트: ${weaknessLabels}.`;
    }
  }
  if (monthlyCard) {
    const monthlyPosition = positionLabels[monthlyCard.mainPosition]?.[0] || "-";
    const monthlyChange = Number.isFinite(monthlyCard.monthlyOVRChange)
      ? `${monthlyCard.monthlyOVRChange > 0 ? "+" : ""}${monthlyCard.monthlyOVRChange}`
      : "-";
    const monthlyStrengths = (monthlyCard.strengthsSummary || []).slice(0, 3).map((item) => item.label).join(" · ");
    document.querySelector("#homeMonthlyKicker").textContent = `SEASON CARD · ${monthlyCard.monthKey}`;
    document.querySelector("#homeMonthlyTitle").textContent = monthlyCard.mainPlayStyle;
    document.querySelector("#homeMonthlyMeta").hidden = false;
    document.querySelector("#homeMonthlyMeta").innerHTML = `<strong>${monthlyCard.monthlyOVR}</strong><em>지난달 대비 ${monthlyChange}</em><span>${monthlyPosition}</span><span>${monthlyCard.matchCount}경기 기준</span>`;
    document.querySelector("#homeMonthlyRadar").hidden = false;
    renderRadar(document.querySelector("#homeMonthlyRadar"), playerCurrentRadarStats(monthlyCard), 220);
    document.querySelector("#homeMonthlyDescription").textContent = `이번 달 OVR ${monthlyCard.monthlyOVR}의 ${monthlyCard.mainPlayStyle}로 기록되었습니다.`;
    document.querySelector("#homeMonthlyPositionText").textContent = `${monthlyPosition} 역할로 ${monthlyCard.matchCount}경기를 평가받았습니다.`;
    document.querySelector("#homeMonthlyStrengthText").textContent = monthlyStrengths ? `자주 언급된 강점은 ${monthlyStrengths}입니다.` : "월간 강점 데이터가 쌓이는 중입니다.";
    document.querySelector("#homeMonthlyStrengths").innerHTML = (monthlyCard.strengthsSummary || []).slice(0, 3)
      .map((item) => `<span>${item.label}</span>`).join("");
  }
  const recentCards = recentHomeMatchCards();
  if (recentCards.length) {
    document.querySelector("#recentMatches").innerHTML = recentCards.map((card) => {
      const positionName = positionLabels[card.mainEvaluatedPosition]?.[0] || "-";
      const meta = [matchDate(card), positionName, card.playStyle].filter(Boolean).join(" · ");
      const changeText = Number.isFinite(card.overallChange)
        ? ` ${card.overallChange > 0 ? "+" : ""}${card.overallChange}`
        : "";
      return `
        <button class="recent-row" data-toast="경기 카드 상세를 열었습니다" type="button">
          <div><h3>${matchTitle(card)}</h3><p>${meta}</p></div>
          <strong>OVR ${card.overallRating}${changeText}</strong>
        </button>
      `;
    }).join("");
  } else {
    const rows = [
      ["용산 토요 풋살", "2026.05.18 (월)", 76],
      ["망원 수요 풋살", "2026.05.15 (금)", 74],
      ["상암 일요 풋살", "2026.05.12 (화)", 72],
    ];
    document.querySelector("#recentMatches").innerHTML = rows.map(([title, meta, ovr]) => `
      <button class="recent-row" data-toast="경기 카드 상세를 열었습니다" type="button">
        <div><h3>${title}</h3><p>${meta}</p></div>
        <strong>OVR ${ovr}</strong>
      </button>
    `).join("");
  }
}

function renderStepper() {
  document.querySelector("#stepper").innerHTML = flowSteps.map((_, index) => `<span class="${index < currentStep ? "done" : index === currentStep ? "current" : ""}"></span>`).join("");
}

function renderEvaluation() {
  const targetPlayers = evaluationTargetPlayers();
  const remainingIds = new Set(
    (window.PlaylogOfficialData?.getRemainingEvaluationTargets?.(currentMatchId, currentUserId) || targetPlayers)
      .map((player) => player.userId),
  );
  const match = activeMatchRecord();
  const remaining = window.PlaylogOfficialData?.getRemainingEvaluationTargets?.(currentMatchId, currentUserId) || [];
  const storedPOMVote = window.PlaylogOfficialData?.getMatchAwardVote?.(currentMatchId, currentUserId, "pom")
    || window.PlaylogOfficialData?.getPOMVote?.(currentMatchId, currentUserId);
  const storedNextStarVote = window.PlaylogOfficialData?.getMatchAwardVote?.(currentMatchId, currentUserId, "next_star");
  const pomSelection = selectedPOMTargetId || storedPOMVote?.targetUserId || null;
  const nextStarSelection = selectedNextStarTargetId || storedNextStarVote?.targetUserId || null;
  if (!selectedPOMTargetId && pomSelection) selectedPOMTargetId = pomSelection;
  if (!selectedNextStarTargetId && nextStarSelection) selectedNextStarTargetId = nextStarSelection;
  if (!pomReason && storedPOMVote?.reason) pomReason = storedPOMVote.reason;
  if (!nextStarReason && storedNextStarVote?.reason) nextStarReason = storedNextStarVote.reason;
  const isAwardStep = currentStep === 6 && Boolean(match) && remaining.length === 0
    && (!storedPOMVote || !storedNextStarVote);
  if (!targetPlayers.some((player) => player.name === selectedPlayer)) {
    selectedPlayer = targetPlayers[0]?.name || "";
  }
  document.querySelector("#currentTarget").textContent = selectedPlayer;
  document.querySelector(".eval-target").classList.remove("pulse");
  requestAnimationFrame(() => document.querySelector(".eval-target").classList.add("pulse"));
  document.querySelector("#stepTitle").textContent = isAwardStep ? "경기 투표" : currentStep >= 6 ? "평가 저장 완료" : flowSteps[currentStep];
  document.querySelector("#stepHelp").textContent = isAwardStep
    ? "두 선택은 OVR에 영향 없이 결과 공개 때 함께 보여집니다."
    : currentStep === 2 ? "6점은 평균입니다. 눈에 띈 장면만 빠르게 올려주세요." : "공식 선수카드는 동료 평가만 반영합니다.";
  renderStepper();

  const pane = document.querySelector("#evaluationPane");
  if (match?.status === "published") {
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>결과가 공개되었습니다.</h2><p>공개된 경기는 평가를 수정할 수 없습니다.<br>결과 상세에서 선수카드를 확인해주세요.</p><button class="primary full" data-view-published-result type="button">결과 상세 보기</button></div>`;
    pane.querySelector("[data-view-published-result]")?.addEventListener("click", () => openSheet("card"));
    return;
  }
  if (currentStep === 0) {
    pane.innerHTML = `<div class="selector-grid">${targetPlayers.map((player) => `<button class="choice-card ${player.name === selectedPlayer ? "selected" : ""}" data-player="${player.name}" type="button">${player.name}<br><small>${remainingIds.has(player.userId) ? "평가하기" : "평가 완료"}</small></button>`).join("")}</div>${actions()}`;
  } else if (currentStep === 1) {
    pane.innerHTML = `<div class="selector-grid">${positions.map(([key, label, desc]) => `<button class="choice-card ${key === selectedPosition ? "selected" : ""}" data-position="${key}" type="button"><strong>${label}</strong><br><small>${desc}</small></button>`).join("")}</div>${actions()}`;
  } else if (currentStep === 2) {
    pane.innerHTML = `<div class="rating-list">${renderRatingFields(evaluationFields.common, "common", commonScores)}</div>${actions()}`;
  } else if (currentStep === 3) {
    const positionLabel = positions.find(([key]) => key === selectedPosition)?.[1] || "포지션";
    const positionFields = selectedPosition ? evaluationFields.position[selectedPosition] : [];
    pane.innerHTML = `<h3 class="eval-subtitle focus-title">${positionLabel} 평가 <small>선택한 역할 기준</small></h3><div class="rating-list">${renderRatingFields(positionFields, "position", positionScores)}</div>${actions()}`;
  } else if (currentStep === 4) {
    pane.innerHTML = `
      <h3 class="eval-subtitle">플레이 성향 <small>선택 입력 · 1~10점</small></h3>
      <div class="rating-list trait-rating-list">${renderTraitRatingFields(evaluationFields.traits, selectedTraits, traitScores, "trait")}</div>
      <h3 class="eval-subtitle observation">오늘 눈에 띈 특징 <small>최대 2개</small></h3>
      <div class="highlight-grid">${evaluationFields.highlights.map((field) => `<button class="chip compact ${selectedHighlights.includes(field.key) ? "selected" : ""}" data-highlight="${field.key}" type="button">${field.label}</button>`).join("")}</div>
      ${selectionActions()}`;
  } else if (currentStep === 5) {
    const previewCard = window.PlaylogEngine.generatePlayerMatchCard({
      matchId: currentMatchId,
      userId: selectedPlayerId(),
      evaluations: [buildEvaluation("evaluation:preview")],
    });
    pane.innerHTML = `<label class="field-label evaluation-comment"><span>이 선수 한 줄 평</span><textarea id="evaluationComment" rows="4" placeholder="압박 속에서도 짧게 연결해줘서 흐름이 살아났어요.">${escapeHtml(overallComment)}</textarea></label><div class="self-result"><span>${selectedPlayer} 예상 OVR</span><strong>${previewCard.overallRating}</strong></div>${actions("이전", "평가 저장 완료")}`;
  } else if (isAwardStep) {
    const candidates = targetPlayers;
    pane.innerHTML = `<div class="complete-card award-card"><h2>오늘 가장 인상 깊었던 선수</h2><p>POM은 OVR에 영향을 주지 않으며 결과 공개 시 함께 공개됩니다.</p><div class="selector-grid">${candidates.map((player) => `<button class="choice-card ${pomSelection === player.userId ? "selected" : ""}" data-pom-target="${player.userId}" type="button">${player.name}<br><small>선택하기</small></button>`).join("")}</div><label class="field-label award-reason"><span>POM 선정 이유</span><input id="pomReason" value="${escapeHtml(pomReason)}" placeholder="예: 중요한 순간마다 흐름을 살렸어요." /></label><h2>다음 경기 주인공</h2><p>다음 경기에서 기대되는 선수를 참가자 중 한 명 선택해주세요.</p><div class="selector-grid">${candidates.map((player) => `<button class="choice-card ${nextStarSelection === player.userId ? "selected" : ""}" data-next-star-target="${player.userId}" type="button">${player.name}<br><small>선택하기</small></button>`).join("")}</div><label class="field-label award-reason"><span>다음 경기 주인공 선정 이유</span><input id="nextStarReason" value="${escapeHtml(nextStarReason)}" placeholder="예: 다음 경기에서 한 번 터질 것 같아요." /></label><button class="primary full" data-submit-awards type="button" ${pomSelection && nextStarSelection ? "" : "disabled"}>투표 저장</button><button class="secondary full" data-start-match-reflection type="button">자가 회고도 남길까요? <small>선택</small></button></div>`;
    pane.querySelectorAll("[data-pom-target]").forEach((button) => button.addEventListener("click", () => {
      selectedPOMTargetId = button.dataset.pomTarget;
      updateChoiceSelection(pane, "[data-pom-target]", button);
      updateAwardSubmitState(pane);
    }));
    pane.querySelectorAll("[data-next-star-target]").forEach((button) => button.addEventListener("click", () => {
      selectedNextStarTargetId = button.dataset.nextStarTarget;
      updateChoiceSelection(pane, "[data-next-star-target]", button);
      updateAwardSubmitState(pane);
    }));
    pane.querySelector("#pomReason")?.addEventListener("input", (event) => { pomReason = event.target.value; });
    pane.querySelector("#nextStarReason")?.addEventListener("input", (event) => { nextStarReason = event.target.value; });
    pane.querySelector("[data-submit-awards]")?.addEventListener("click", () => {
      const finalPomSelection = selectedPOMTargetId || pomSelection;
      const finalNextStarSelection = selectedNextStarTargetId || nextStarSelection;
      if (!storedPOMVote || storedPOMVote.targetUserId !== finalPomSelection || (storedPOMVote.reason || "") !== pomReason.trim()) {
        window.PlaylogOfficialData.saveMatchAwardVote({
          matchId: currentMatchId,
          voterUserId: currentUserId,
          targetUserId: finalPomSelection,
          type: "pom",
          reason: pomReason.trim(),
          createdAt: new Date().toISOString(),
        });
      }
      if (!storedNextStarVote || storedNextStarVote.targetUserId !== finalNextStarSelection || (storedNextStarVote.reason || "") !== nextStarReason.trim()) {
        window.PlaylogOfficialData.saveMatchAwardVote({
          matchId: currentMatchId,
          voterUserId: currentUserId,
          targetUserId: finalNextStarSelection,
          type: "next_star",
          reason: nextStarReason.trim(),
          createdAt: new Date().toISOString(),
        });
      }
      showToast("경기 투표가 저장되었습니다");
      currentStep = 7;
      renderEvaluation();
    });
    pane.querySelector("[data-start-match-reflection]")?.addEventListener("click", () => startReflection(currentMatchId));
    return;
  } else {
    const resultReady = !match || match.status === "published";
    const actionLabel = remaining.length ? "다음 선수 평가하기" : resultReady ? "결과 상세 보기" : "공개 대기 상태 보기";
    const awardNote = storedPOMVote && storedNextStarVote ? "<p>투표가 저장되었습니다.<br>결과 공개 시 함께 확인할 수 있습니다.</p>" : "";
    const completeTitle = storedPOMVote && storedNextStarVote ? "경기 평가가 완료되었습니다." : "평가 저장 완료!";
    const completeCopy = resultReady
      ? "공식 선수카드 결과에 반영되었습니다."
      : "평가가 저장되었습니다.<br>결과 공개를 기다리는 중입니다.";
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>${completeTitle}</h2><p>${completeCopy}</p>${awardNote}<div class="self-result"><span>${selectedPlayer} ${resultReady ? "생성 OVR" : "결과 상태"}</span><strong>${resultReady ? (lastGeneratedCard?.overallRating || "-") : "대기"}</strong></div><button class="primary full" data-complete-action type="button">${actionLabel}</button>${match && remaining.length === 0 ? '<button class="secondary full" data-start-match-reflection type="button">자가 회고도 남길까요?</button>' : ""}</div>`;
    pane.querySelector("[data-complete-action]")?.addEventListener("click", () => {
      if (remaining.length) {
        selectedPlayer = userNames[remaining[0].userId] || remaining[0].userId;
        loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
        resetAwardDraft();
        currentStep = 0;
        renderEvaluation();
        return;
      }
      if (resultReady) openSheet("card");
      else setView("home");
    });
    pane.querySelector("[data-start-match-reflection]")?.addEventListener("click", () => startReflection(currentMatchId));
    return;
  }

  pane.querySelectorAll("[data-player]").forEach((button) => button.addEventListener("click", () => {
    if (selectedPlayer !== button.dataset.player) {
      selectedPlayer = button.dataset.player;
      loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
      resetAwardDraft();
    }
    showToast(`${selectedPlayer} 선수를 평가합니다`);
    renderEvaluation();
  }));
  pane.querySelectorAll("[data-position]").forEach((button) => button.addEventListener("click", () => {
    selectedPosition = button.dataset.position;
    positionScores = Object.fromEntries(evaluationFields.position[selectedPosition].map((field) => [field.key, null]));
    showToast(`${button.querySelector("strong").textContent} 역할로 저장`);
    renderEvaluation();
  }));
  pane.querySelectorAll("[data-rating-key]").forEach((select) => select.addEventListener("change", () => {
    const store = select.dataset.ratingCategory === "common" ? commonScores : positionScores;
    store[select.dataset.ratingKey] = Number(select.value);
    showToast(`${select.dataset.ratingLabel} ${select.value}점 저장됨`);
  }));
  pane.querySelectorAll("[data-rating-value]").forEach((button) => button.addEventListener("click", () => {
    const store = button.dataset.ratingCategory === "common" ? commonScores : positionScores;
    store[button.dataset.ratingKey] = Number(button.dataset.ratingValue);
    showToast(`${button.dataset.ratingLabel} ${button.dataset.ratingValue}점`);
    updateRatingSelection(button, "[data-rating-value]");
    button.closest(".rating-card")?.classList.add("selected");
  }));
  pane.querySelectorAll("[data-trait-value]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.traitKey;
    if (!selectedTraits.includes(key)) selectedTraits = [...selectedTraits, key];
    traitScores[key] = Number(button.dataset.traitValue);
    showToast(`${button.dataset.traitLabel} ${button.dataset.traitValue}점`);
    updateRatingSelection(button, "[data-trait-value]");
    button.closest(".rating-card")?.classList.add("selected");
  }));
  pane.querySelectorAll("[data-highlight]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.highlight;
    if (!selectedHighlights.includes(key) && selectedHighlights.length >= 2) {
      showToast("추가 관찰 능력치는 최대 2개까지 선택할 수 있어요");
      return;
    }
    selectedHighlights = selectedHighlights.includes(key)
      ? selectedHighlights.filter((item) => item !== key)
      : [...selectedHighlights, key];
    showToast("추가 관찰 능력치를 반영했어요");
    button.classList.toggle("selected", selectedHighlights.includes(key));
  }));
  pane.querySelector("#evaluationComment")?.addEventListener("input", (event) => {
    overallComment = event.target.value;
  });
  pane.querySelector("[data-prev]")?.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    renderEvaluation();
  });
  pane.querySelector("[data-skip]")?.addEventListener("click", () => {
    currentStep += 1;
    renderEvaluation();
  });
  pane.querySelector("[data-next]")?.addEventListener("click", () => {
    if (currentStep === 1 && !selectedPosition) {
      showToast("포지션을 먼저 선택해주세요.");
      return;
    }
    if (currentStep === 2 && !hasAllScores(evaluationFields.common, commonScores)) {
      showToast("공통 평가를 모두 선택해주세요.");
      return;
    }
    if (currentStep === 3 && (!selectedPosition || !hasAllScores(evaluationFields.position[selectedPosition], positionScores))) {
      showToast("포지션 평가를 모두 선택해주세요.");
      return;
    }
    if (currentStep === 5) {
      const evaluation = buildEvaluation(`evaluation:ui:${Date.now()}`);
      lastGeneratedCard = window.PlaylogOfficialData.saveEvaluation(evaluation);
      showToast("평가가 자동 저장되었습니다");
      currentStep = activeMatchRecord() ? 6 : 7;
    } else {
      currentStep += 1;
    }
    renderEvaluation();
  });
}

function renderRatingFields(fields, category, ratings) {
  return fields.map((field) => `
    <article class="rating-card ${Number.isFinite(ratings[field.key]) ? "selected" : ""}">
      <div class="rating-copy"><strong>${field.label}</strong><small>${field.description}</small></div>
      <div class="rating-picks" role="group" aria-label="${field.label} 평가">
        ${Array.from({ length: 10 }, (_, index) => index + 1).map((value) => `<button class="${value === ratings[field.key] ? "selected" : ""}" data-rating-category="${category}" data-rating-key="${field.key}" data-rating-label="${field.label}" data-rating-value="${value}" type="button">${value}</button>`).join("")}
      </div>
    </article>
  `).join("");
}

function hasAllScores(fields, ratings) {
  return fields.every((field) => Number.isFinite(ratings[field.key]));
}

function renderTraitRatingFields(fields, selectedKeys, ratings, prefix) {
  return fields.map((field) => `
    <article class="rating-card ${selectedKeys.includes(field.key) ? "selected" : ""}">
      <div class="rating-copy"><strong>${field.label}</strong><small>${field.description}</small></div>
      <div class="rating-picks" role="group" aria-label="${field.label} 성향 평가">
        ${Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
          const selected = selectedKeys.includes(field.key) && value === (ratings[field.key] || observedTraitScore);
          return `<button class="${selected ? "selected" : ""}" data-${prefix}-key="${field.key}" data-${prefix}-label="${field.label}" data-${prefix}-value="${value}" type="button">${value}</button>`;
        }).join("")}
      </div>
    </article>
  `).join("");
}

function buildEvaluation(id) {
  return {
    id,
    matchId: currentMatchId,
    evaluatorUserId: currentUserId,
    targetUserId: selectedPlayerId(),
    selectedPosition,
    overallComment: overallComment.trim(),
    createdAt: new Date().toISOString(),
    version: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
    scores: [
      ...evaluationFields.common.map((field) => ({ id: `${id}:common:${field.key}`, evaluationId: id, category: "common", key: field.key, score: commonScores[field.key] })),
      ...evaluationFields.position[selectedPosition].map((field) => ({ id: `${id}:position:${field.key}`, evaluationId: id, category: "position", key: field.key, score: positionScores[field.key] })),
    ],
    traits: selectedTraits.map((key) => ({ id: `${id}:trait:${key}`, evaluationId: id, key, score: traitScores[key] || observedTraitScore })),
    highlights: selectedHighlights.slice(0, 2).map((key) => ({ id: `${id}:highlight:${key}`, evaluationId: id, key })),
  };
}

function updateRatingSelection(button, selector) {
  button.closest(".rating-picks")?.querySelectorAll(selector).forEach((item) => {
    item.classList.toggle("selected", item === button);
  });
}

function updateChoiceSelection(scope, selector, selectedButton) {
  scope.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("selected", button === selectedButton);
  });
}

function updateAwardSubmitState(scope) {
  const submitButton = scope.querySelector("[data-submit-awards]");
  if (submitButton) submitButton.disabled = !(selectedPOMTargetId && selectedNextStarTargetId);
}

function actions(prevLabel = "이전", nextLabel = "다음") {
  return `<div class="eval-actions"><button class="secondary" data-prev type="button">${prevLabel}</button><button class="primary" data-next type="button">${nextLabel}</button></div>`;
}

function selectionActions() {
  return `<div class="eval-actions three"><button class="secondary" data-prev type="button">이전</button><button class="secondary" data-skip type="button">건너뛰기</button><button class="primary" data-next type="button">다음</button></div>`;
}

function resetReflection(matchId = null) {
  reflectionStep = 0;
  reflectionMatchId = matchId;
  reflectionPosition = null;
  reflectionCommonScores = Object.fromEntries(evaluationFields.common.map((field) => [field.key, null]));
  reflectionPositionScores = {};
  reflectionTraits = [];
  reflectionTraitScores = {};
  reflectionHighlights = [];
  satisfactionScore = 7;
  feltStrength = "";
  feltWeakness = "";
  reflectionGoal = "";
  reflectionMemo = "";
}

function startReflection(matchId = null) {
  resetReflection(matchId);
  setView("reflection");
}

function reflectionActions(nextLabel = "다음") {
  return `<div class="eval-actions"><button class="secondary" data-reflection-prev type="button">이전</button><button class="primary" data-reflection-next type="button">${nextLabel}</button></div>`;
}

function buildSelfReflection(id) {
  const position = reflectionPosition || "free";
  return {
    id,
    userId: currentUserId,
    matchId: reflectionMatchId,
    selectedPosition: position,
    selfScores: [
      ...evaluationFields.common.map((field) => ({ category: "common", key: field.key, score: reflectionCommonScores[field.key] })),
      ...evaluationFields.position[position].map((field) => ({ category: "position", key: field.key, score: reflectionPositionScores[field.key] })),
    ],
    selfTraits: reflectionTraits.map((key) => ({ key, score: reflectionTraitScores[key] || observedTraitScore })),
    selfHighlights: reflectionHighlights.slice(0, 2).map((key) => ({ key })),
    satisfactionScore,
    feltStrength: feltStrength.trim(),
    feltWeakness: feltWeakness.trim(),
    nextGoal: reflectionGoal.trim(),
    memo: reflectionMemo.trim(),
    createdAt: new Date().toISOString(),
  };
}

function renderReflection() {
  renderReflectionHistory();
  document.querySelector("#reflectionContext").textContent = reflectionMatchId
    ? "경기 후 회고 · 현재 경기와 연결됨"
    : "빠른 회고 · 경기 연결 없음";
  document.querySelector("#reflectionStepTitle").textContent = reflectionSteps[reflectionStep] || "저장 완료";
  document.querySelector("#reflectionStepHelp").textContent = reflectionStep === 4
    ? "짧게 남겨도 충분해요. 다음 경기의 나에게 보내는 메모입니다."
    : "내가 느낀 플레이를 가볍게 체크해주세요. 공식 카드에는 섞이지 않습니다.";
  document.querySelector("#reflectionStepper").innerHTML = reflectionSteps
    .map((_, index) => `<span class="${index < reflectionStep ? "done" : index === reflectionStep ? "current" : ""}"></span>`).join("");
  const pane = document.querySelector("#reflectionPane");
  if (reflectionStep === 0) {
    pane.innerHTML = `<div class="selector-grid">${positions.map(([key, label, desc]) => `<button class="choice-card ${key === reflectionPosition ? "selected" : ""}" data-reflection-position="${key}" type="button"><strong>${label}</strong><br><small>${desc}</small></button>`).join("")}</div>${reflectionActions()}`;
  } else if (reflectionStep === 1) {
    pane.innerHTML = `<div class="rating-list">${renderSelfRatingFields(evaluationFields.common, "common", reflectionCommonScores)}</div>${reflectionActions()}`;
  } else if (reflectionStep === 2) {
    const positionLabel = positions.find(([key]) => key === reflectionPosition)?.[1] || "포지션";
    const positionFields = reflectionPosition ? evaluationFields.position[reflectionPosition] : [];
    pane.innerHTML = `<h3 class="eval-subtitle focus-title">오늘의 ${positionLabel} 느낌 <small>자가 기준</small></h3><div class="rating-list">${renderSelfRatingFields(positionFields, "position", reflectionPositionScores)}</div>${reflectionActions()}`;
  } else if (reflectionStep === 3) {
    pane.innerHTML = `<h3 class="eval-subtitle">플레이 성향 <small>선택 입력 · 1~10점</small></h3><div class="rating-list trait-rating-list">${renderTraitRatingFields(evaluationFields.traits, reflectionTraits, reflectionTraitScores, "reflection-trait")}</div><h3 class="eval-subtitle observation">오늘 눈에 띈 특징 <small>최대 2개</small></h3><div class="highlight-grid">${evaluationFields.highlights.map((field) => `<button class="chip compact ${reflectionHighlights.includes(field.key) ? "selected" : ""}" data-reflection-highlight="${field.key}" type="button">${field.label}</button>`).join("")}</div>${reflectionActions()}`;
  } else if (reflectionStep === 4) {
    pane.innerHTML = `<label>오늘 만족도<input id="reflectionSatisfaction" type="range" min="1" max="10" value="${satisfactionScore}" /></label><div class="self-result"><span>만족도</span><strong id="reflectionSatisfactionValue">${satisfactionScore}</strong></div><label>가장 만족한 점<textarea id="reflectionStrength" rows="2" placeholder="예: 오늘은 압박을 받기 전에 먼저 패스를 선택했다.">${feltStrength}</textarea></label><label>가장 아쉬운 점<textarea id="reflectionWeakness" rows="2" placeholder="예: 좋은 위치에서 슈팅 타이밍을 한 번 놓쳤다.">${feltWeakness}</textarea></label><label>다음 경기 목표<input id="reflectionGoal" value="${reflectionGoal}" placeholder="예: 첫 터치 후 전방을 한 번 더 보기" /></label><label>자유 메모<textarea id="reflectionMemo" rows="3" placeholder="오늘 경기에서 기억하고 싶은 장면을 짧게 남겨보세요.">${reflectionMemo}</textarea></label>${reflectionActions("회고 저장하기")}`;
  } else {
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>자가 회고 저장 완료!</h2><p>공식 선수카드와 분리된 개인 기록으로 저장되었습니다.</p><button class="primary full" data-go-reflection-home type="button">홈으로 돌아가기</button></div>`;
    pane.querySelector("[data-go-reflection-home]")?.addEventListener("click", () => setView("home"));
    return;
  }
  pane.querySelectorAll("[data-reflection-position]").forEach((button) => button.addEventListener("click", () => {
    reflectionPosition = button.dataset.reflectionPosition;
    reflectionPositionScores = Object.fromEntries(evaluationFields.position[reflectionPosition].map((field) => [field.key, null]));
    renderReflection();
  }));
  pane.querySelectorAll("[data-self-rating-value]").forEach((button) => button.addEventListener("click", () => {
    const scores = button.dataset.selfRatingCategory === "common" ? reflectionCommonScores : reflectionPositionScores;
    scores[button.dataset.selfRatingKey] = Number(button.dataset.selfRatingValue);
    updateRatingSelection(button, "[data-self-rating-value]");
    button.closest(".rating-card")?.classList.add("selected");
  }));
  pane.querySelectorAll("[data-reflection-trait-value]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.reflectionTraitKey;
    if (!reflectionTraits.includes(key)) reflectionTraits = [...reflectionTraits, key];
    reflectionTraitScores[key] = Number(button.dataset.reflectionTraitValue);
    updateRatingSelection(button, "[data-reflection-trait-value]");
    button.closest(".rating-card")?.classList.add("selected");
  }));
  pane.querySelectorAll("[data-reflection-highlight]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.reflectionHighlight;
    if (!reflectionHighlights.includes(key) && reflectionHighlights.length >= 2) {
      showToast("추가 관찰 능력치는 최대 2개까지 선택할 수 있어요");
      return;
    }
    reflectionHighlights = reflectionHighlights.includes(key)
      ? reflectionHighlights.filter((item) => item !== key)
      : [...reflectionHighlights, key];
    button.classList.toggle("selected", reflectionHighlights.includes(key));
  }));
  pane.querySelector("#reflectionSatisfaction")?.addEventListener("input", (event) => {
    satisfactionScore = Number(event.target.value);
    document.querySelector("#reflectionSatisfactionValue").textContent = satisfactionScore;
  });
  pane.querySelector("#reflectionStrength")?.addEventListener("input", (event) => { feltStrength = event.target.value; });
  pane.querySelector("#reflectionWeakness")?.addEventListener("input", (event) => { feltWeakness = event.target.value; });
  pane.querySelector("#reflectionGoal")?.addEventListener("input", (event) => { reflectionGoal = event.target.value; });
  pane.querySelector("#reflectionMemo")?.addEventListener("input", (event) => { reflectionMemo = event.target.value; });
  pane.querySelector("[data-reflection-prev]")?.addEventListener("click", () => {
    reflectionStep = Math.max(0, reflectionStep - 1);
    renderReflection();
  });
  pane.querySelector("[data-reflection-next]")?.addEventListener("click", () => {
    if (reflectionStep === 0 && !reflectionPosition) {
      showToast("회고 포지션을 먼저 선택해주세요.");
      return;
    }
    if (reflectionStep === 1 && !hasAllScores(evaluationFields.common, reflectionCommonScores)) {
      showToast("공통 자가평가를 모두 선택해주세요.");
      return;
    }
    if (reflectionStep === 2 && (!reflectionPosition || !hasAllScores(evaluationFields.position[reflectionPosition], reflectionPositionScores))) {
      showToast("포지션 자가평가를 모두 선택해주세요.");
      return;
    }
    if (reflectionStep === reflectionSteps.length - 1) {
      window.PlaylogOfficialData.saveSelfReflection(buildSelfReflection(`self-reflection:${Date.now()}`));
      showToast("개인 회고가 저장되었습니다");
      reflectionStep = reflectionSteps.length;
      renderReflectionHistory();
    } else {
      reflectionStep += 1;
    }
    renderReflection();
  });
}

function renderSelfRatingFields(fields, category, ratings) {
  return fields.map((field) => `<article class="rating-card ${Number.isFinite(ratings[field.key]) ? "selected" : ""}"><div class="rating-copy"><strong>${field.label}</strong><small>${field.description}</small></div><div class="rating-picks" role="group" aria-label="${field.label} 자가 평가">${Array.from({ length: 10 }, (_, index) => index + 1).map((value) => `<button class="${value === ratings[field.key] ? "selected" : ""}" data-self-rating-category="${category}" data-self-rating-key="${field.key}" data-self-rating-value="${value}" type="button">${value}</button>`).join("")}</div></article>`).join("");
}

function renderReflectionHistory() {
  const history = document.querySelector("#reflectionHistory");
  if (!history) return;
  const reflections = (window.PlaylogOfficialData?.selfReflections || [])
    .filter((item) => item.userId === currentUserId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  if (!reflections.length) {
    history.innerHTML = `<h3>회고 히스토리</h3><p>아직 저장된 개인 회고가 없습니다.</p>`;
    return;
  }
  history.innerHTML = `
    <h3>회고 히스토리</h3>
    <div class="reflection-history-list">
      ${reflections.map((item) => {
        const date = new Date(item.createdAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
        const matchText = item.matchId ? "경기 연결" : "빠른 회고";
        const summary = item.nextGoal || item.memo || "아직 다음 목표를 정리하지 않았어요.";
        return `<button class="reflection-history-card" data-reflection-detail="${item.id}" type="button"><div><strong>${date} · 만족도 ${item.satisfactionScore || "-"}</strong><span>${matchText}</span></div><p>${escapeHtml(summary)}</p></button>`;
      }).join("")}
    </div>
  `;
  history.querySelectorAll("[data-reflection-detail]").forEach((button) => {
    button.addEventListener("click", () => openReflectionDetail(button.dataset.reflectionDetail));
  });
}

function openReflectionDetail(reflectionId) {
  const reflection = (window.PlaylogOfficialData?.selfReflections || []).find((item) => item.id === reflectionId);
  if (!reflection) return;
  const overlay = document.querySelector("#overlay");
  const sheet = document.querySelector("#sheet");
  const date = new Date(reflection.createdAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  const position = positionLabels[reflection.selectedPosition]?.[0] || reflection.selectedPosition;
  const scoreSummary = (reflection.selfScores || [])
    .map((score) => `<span>${fieldLabel(score.key)} ${score.score}</span>`)
    .join("");
  const traits = (reflection.selfTraits || []).map((trait) => `<span>${fieldLabel(trait.key)} ${trait.score || "-"}</span>`).join("") || "<span>선택 없음</span>";
  const highlights = (reflection.selfHighlights || []).map((item) => `<span>${fieldLabel(item.key)}</span>`).join("") || "<span>선택 없음</span>";
  sheet.className = "sheet reflection-detail-sheet";
  sheet.innerHTML = `
    <div class="result-title reflection-detail-title">
      <h3>회고 상세</h3>
      <button data-close-sheet type="button" aria-label="회고 상세 닫기">×</button>
    </div>
    <div class="reflection-detail-meta">
      <span>${date}</span>
      <span>${reflection.matchId ? `경기 연결 · ${reflection.matchId}` : "빠른 회고"}</span>
    </div>
    <div class="reflection-detail-grid">
      <article><small>포지션</small><strong>${position}</strong></article>
      <article><small>만족도</small><strong>${reflection.satisfactionScore || "-"}</strong></article>
    </div>
    <section class="reflection-detail-block"><small>가장 만족한 점</small><p>${escapeHtml(reflection.feltStrength || "작성 없음")}</p></section>
    <section class="reflection-detail-block"><small>가장 아쉬운 점</small><p>${escapeHtml(reflection.feltWeakness || "작성 없음")}</p></section>
    <section class="reflection-detail-block"><small>다음 경기 목표</small><p>${escapeHtml(reflection.nextGoal || "작성 없음")}</p></section>
    <section class="reflection-detail-block"><small>자유 메모</small><p>${escapeHtml(reflection.memo || "작성 없음")}</p></section>
    <section class="reflection-detail-block"><small>자가 점수 요약</small><div class="detail-chip-list">${scoreSummary}</div></section>
    <section class="reflection-detail-block"><small>성향 / 특징</small><div class="detail-chip-list">${traits}${highlights}</div></section>
    <button class="primary full" data-close-sheet type="button">확인</button>
  `;
  sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  overlay.hidden = false;
}

function renderCards() {
  const stats = currentHomeStats();
  renderRadar(document.querySelector("#cardRadar"), radarStats(commonRatings), 280);
  if (stats) {
    document.querySelector("#positionGrid").innerHTML = Object.entries(stats.positionAdaptation)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => `<button class="position-card" data-toast="${positionLabels[key][0]} 적응도 상세를 열었습니다" type="button"><span>${positionLabels[key][0]} · ${positionLabels[key][1]}</span><strong>${value.adaptationRating}</strong><progress max="100" value="${value.adaptationRating}"></progress></button>`)
      .join("");
  } else {
    document.querySelector("#positionGrid").innerHTML = Object.entries(positionRatings).map(([key, value]) => {
      const score = value === null ? "-" : toOvr(value);
      return `<button class="position-card" data-toast="${positionLabels[key][0]} 적응도 상세를 열었습니다" type="button"><span>${positionLabels[key][0]} · ${positionLabels[key][1]}</span><strong>${score}</strong><progress max="100" value="${value === null ? 0 : score}"></progress></button>`;
    }).join("");
  }
  document.querySelector("#styleTags").innerHTML = ["창의형 플레이메이커", "템포 조율형", "안정 연결형", "공간 침투형", "직선 돌파형"].map((tag) => `<span>${tag}</span>`).join("");
  document.querySelector("#quotes").innerHTML = [
    ["넓은 시야와 정교한 패스로 경기 흐름을 바꿨어요.", 4],
    ["압박이 들어와도 침착하게 공을 지켜줬어요.", 3],
    ["다음 경기에는 슈팅 선택지만 조금 더 늘리면 좋겠어요.", 2],
  ].map(([quote, count]) => `<article><p>“<strong>${quote.split(" ")[0]}</strong> ${quote.split(" ").slice(1).join(" ")}”</p><button data-like type="button">공감 ${count}</button></article>`).join("");
  document.querySelectorAll("[data-like]").forEach((button) => button.addEventListener("click", () => {
    const count = Number(button.textContent.replace(/\D/g, "")) + 1;
    button.textContent = `공감 ${count}`;
    showToast("공감이 반영되었습니다");
  }));
}

function renderFriends() {
  document.querySelector("#friendList").innerHTML = friends.map(([name, meta]) => `
    <article><div><strong>${name}</strong><p>${meta}</p></div><button data-toast="${name} 카드 비교를 열었습니다" type="button">비교</button></article>
  `).join("");
}

function setView(view) {
  document.querySelectorAll(".content-view").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll(".tabbar button").forEach((button) => button.classList.toggle("active", button.dataset.go === view));
  document.querySelector(".hero").hidden = view !== "home";
  document.querySelector(".fab").hidden = view !== "home";
  window.scrollTo({ top: 0, behavior: "instant" });
  if (view === "home") renderHome();
  if (view === "evaluate") renderEvaluation();
  if (view === "cards") renderCards();
  if (view === "reflection") renderReflection();
  if (view === "friends") renderFriends();
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) showToast(toastButton.dataset.toast);
  });
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => {
    if (button.id === "activeMatchAction" && activeMatchRecord()?.status === "published") {
      openSheet("card");
      return;
    }
    if (button.dataset.go === "evaluate") {
      loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
      loadAwardDraft();
      currentStep = 0;
    }
    if (button.dataset.go === "reflection") startReflection(null);
    else setView(button.dataset.go);
  }));
  document.querySelector("#fab").addEventListener("click", () => {
    document.querySelector("#fab").classList.add("open");
    openSheet("fab");
  });
  document.querySelector("#friendRequestOpen").addEventListener("click", () => openSheet("friend"));
  document.querySelector("#avatarPicker").addEventListener("click", (event) => {
    event.stopPropagation();
    openSheet("avatar");
  });
  document.querySelector("#homePlayerCard").addEventListener("click", (event) => {
    if (event.target.closest("#avatarPicker")) return;
    document.querySelector("#homePlayerCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#homePlayerCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#homePlayerCard").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSheet("card");
    }
  });
  document.querySelector("#officialCard").addEventListener("click", () => {
    document.querySelector("#officialCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#officialCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#overlay").addEventListener("click", (event) => {
    if (event.target.id === "overlay") closeSheet();
  });
}

renderHome();
renderEvaluation();
renderReflection();
renderCards();
renderFriends();
bindInteractions();
