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
import presetAttackUrl from "./assets/preset-attack.png";
import presetCamUrl from "./assets/preset-cam.png";
import presetCdmUrl from "./assets/preset-cdm.png";
import presetDefenseUrl from "./assets/preset-defense.png";
import presetFreeUrl from "./assets/preset-free.png";

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
const profilePresetLabels = {
  "attack-0": "침투형 골게터",
  "attack-1": "포스트 플레이어",
  "attack-2": "압박형 공격수",
  "attack-3": "연계형 공격수",
  "attack-4": "찬스메이커",
  "cam-0": "플레이메이커",
  "cam-1": "찬스메이커",
  "cam-2": "전진 패서",
  "cam-3": "하프스페이스 침투형",
  "cam-4": "공격 조율자",
  "cdm-0": "후방조율자",
  "cdm-1": "압박형 미드필더",
  "cdm-2": "연결형 미드필더",
  "cdm-3": "박스투박스",
  "cdm-4": "수비형 앵커",
  "defense-0": "압박형 수비수",
  "defense-1": "커버형 수비수",
  "defense-2": "빌드업 수비수",
  "defense-3": "대인마크형",
  "defense-4": "안정형 수비수",
  "free-0": "올라운더",
  "free-1": "연결형 프리롤",
  "free-2": "공간침투형",
  "free-3": "템포 조율형",
  "free-4": "밸런스형",
};
const avatarSheets = {
  attack: presetAttackUrl,
  cam: presetCamUrl,
  cdm: presetCdmUrl,
  defense: presetDefenseUrl,
  free: presetFreeUrl,
};
const evaluationFields = window.PlaylogEngine.EVALUATION_FIELDS;
let currentUserId = null;
const currentMatchId = window.PlaylogOfficialData?.activeEvaluationMatchId || "match:sangam-2026-05-23";
let selectedMatchId = currentMatchId;
const observedTraitScore = 8;
const playerIds = {
  "김민수": "user:minsu",
  "이지훈": "user:jihoon",
  "박현우": "user:hyunwoo",
  "정우진": "user:woojin",
  "최성민": "user:sungmin",
};
const userNames = {
  ...Object.fromEntries((window.PlaylogOfficialData?.users || []).map((user) => [user.id, user.nickname || user.name || user.id])),
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
const signupRoleOptions = {
  attack: ["침투형 골게터", "포스트 플레이어", "압박형 공격수", "연계형 공격수", "찬스메이커"],
  am: ["플레이메이커", "찬스메이커", "전진 패서", "하프스페이스 침투형", "공격 조율자"],
  dm: ["박스투박스", "후방 조율자", "압박형 미드필더", "연결형 미드필더", "수비형 앵커"],
  defense: ["압박형 수비수", "커버형 수비수", "빌드업 수비수", "대인마크형", "안정형 수비수"],
  free: ["올라운더", "연결형 프리롤", "공간 침투형", "템포 조율형", "밸런스형"],
};
const flowSteps = ["선수 선택", "포지션 선택", "공통 필수 평가", "포지션 특화 평가", "선택 평가", "한 줄 평", "경기 투표"];
const reflectionSteps = ["포지션 선택", "공통 자가평가", "포지션 자가평가", "성향과 특징", "개인 회고"];
const evaluationCommentPlaceholder = "압박 속에서도 짧게 연결해줘서 흐름이 살아났어요.";
const pomReasonPlaceholder = "예: 중요한 순간마다 흐름을 살렸어요.";
const nextStarReasonPlaceholder = "예: 다음 경기에서 한 번 터질 것 같아요.";

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
let activeCardTab = "match";
let justCompletedAwards = false;
let matchResultMode = "summary";
let matchResultSelectedCard = null;
let evaluationMode = "list";
let reflectionMode = "list";
let newMatchDraft = null;
let authMode = "landing";
let selectedFriendProfileId = null;
let showingMyProfile = false;
let activeRookieSessionId = null;
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
      evaluation.matchId === selectedMatchId
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
  const pomVote = window.PlaylogOfficialData?.getMatchAwardVote?.(selectedMatchId, currentUserId, "pom")
    || window.PlaylogOfficialData?.getPOMVote?.(selectedMatchId, currentUserId);
  const nextStarVote = window.PlaylogOfficialData?.getMatchAwardVote?.(selectedMatchId, currentUserId, "next_star");
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

function sanitizeOptionalText(value = "", placeholders = []) {
  const text = String(value || "").trim();
  if (!text) return "";
  return placeholders.includes(text) ? "" : text;
}

function appUser(userId = currentUserId) {
  return (window.PlaylogOfficialData?.users || []).find((user) => user.id === userId) || null;
}

function displayUserName(userId) {
  const user = appUser(userId);
  return user?.nickname || user?.name || userNames[userId] || userId;
}

function normalizePlaylogId(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "");
}

function supabaseBridge() {
  return window.PlaylogSupabase?.isEnabled?.() ? window.PlaylogSupabase : null;
}

function requireSupabaseBridge() {
  const bridge = supabaseBridge();
  if (!bridge) throw new Error("Supabase 클라이언트가 준비되지 않았습니다. 환경변수를 확인해주세요.");
  return bridge;
}

function reportSupabaseError(error, fallbackMessage) {
  console.error(fallbackMessage, error);
  const detail = error?.message || error?.details || error?.hint || "";
  showToast(detail ? `${fallbackMessage}: ${detail}` : fallbackMessage);
}

async function findUserByPlaylogIdAsync(playlogId) {
  return requireSupabaseBridge().findUserByPlaylogId(playlogId);
}

async function saveUserApplicationAsync(payload) {
  return requireSupabaseBridge().saveUserApplication(payload);
}

async function addFriendAsync(payload) {
  return requireSupabaseBridge().addFriend(payload);
}

function disableLocalFriendFallback() {
  if (!window.PlaylogOfficialData) return;
  window.PlaylogOfficialData.addFriend = async (payload) => addFriendAsync(payload);
}

async function createMatchAsync(payload) {
  return requireSupabaseBridge().createMatch(payload);
}

function disableLocalMatchFallback() {
  if (!window.PlaylogOfficialData) return;
  window.PlaylogOfficialData.createMatch = async (payload) => createMatchAsync(payload);
}

async function saveEvaluationAsync(payload) {
  return requireSupabaseBridge().saveEvaluation(payload);
}

async function upsertGeneratedCardsAsync(payload) {
  return requireSupabaseBridge().upsertGeneratedCards(payload);
}

async function updateMatchParticipantCompletionAsync(matchId, userId, evaluationCompleted) {
  return requireSupabaseBridge().updateMatchParticipantCompletion(matchId, userId, evaluationCompleted);
}

async function recalculateMatchEvaluationCompletionAsync(matchId) {
  return requireSupabaseBridge().recalculateMatchEvaluationCompletion(matchId);
}

async function publishMatchAsync(matchId, publishedAt) {
  return requireSupabaseBridge().publishMatch(matchId, publishedAt);
}

async function refreshMatchesAsync(userId = currentUserId) {
  return requireSupabaseBridge().refreshMatches(userId);
}

async function refreshPlayerCardsAsync(userId = currentUserId) {
  return requireSupabaseBridge().refreshPlayerCards(userId);
}

async function saveMatchAwardVoteAsync(payload) {
  return requireSupabaseBridge().saveMatchAwardVote(payload);
}

async function saveSelfReflectionAsync(payload) {
  return requireSupabaseBridge().saveSelfReflection(payload);
}

function withUpsertedCard(cards, card) {
  const nextCards = (cards || []).filter((item) => item && item.id !== card.id);
  nextCards.push(card);
  return nextCards;
}

function buildGeneratedCardBundle({ matchId, userId, generatedAt }) {
  const matchCard = window.PlaylogOfficialData?.generateCardFor?.(
    matchId,
    userId,
    generatedAt || new Date().toISOString(),
  );
  if (!matchCard) return null;

  const nextMatchCards = withUpsertedCard(window.PlaylogOfficialData?.playerMatchCards || [], matchCard);
  const previousStats = (window.PlaylogOfficialData?.playerCurrentStats || [])
    .find((stats) => stats && stats.userId === userId) || null;
  const currentStats = window.PlaylogEngine?.generatePlayerCurrentStats?.({
    userId,
    cards: nextMatchCards,
    previousStats,
    generatedAt: matchCard.generatedAt,
  }) || null;
  const monthKey = matchCard.generatedAt.slice(0, 7);
  const previousMonthlyCard = (window.PlaylogOfficialData?.playerMonthlyCards || [])
    .filter((card) => card && card.userId === userId && card.monthKey < monthKey)
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))[0] || null;
  const monthlyCard = window.PlaylogEngine?.generatePlayerMonthlyCard?.({
    userId,
    monthKey,
    cards: nextMatchCards,
    previousMonthlyCard,
    generatedAt: matchCard.generatedAt,
  }) || null;

  return { matchCard, currentStats, monthlyCard };
}

async function saveGeneratedCardsForParticipant(matchId, userId, generatedAt) {
  const match = (window.PlaylogOfficialData?.matches || []).find((item) => item.id === matchId);
  if (match?.status !== "published") {
    throw new Error("공개되지 않은 경기의 선수카드는 저장할 수 없습니다.");
  }
  console.info("Supabase 카드 생성 시작", { matchId, userId, generatedAt });
  const bundle = buildGeneratedCardBundle({ matchId, userId, generatedAt });
  if (!bundle) {
    console.warn("Supabase 카드 생성 bundle 없음", { matchId, userId });
    return null;
  }
  const saved = await upsertGeneratedCardsAsync(bundle);
  console.info("Supabase 카드 upsert 완료", {
    matchId,
    userId,
    matchCardId: saved?.matchCard?.id,
    hasCurrentStats: Boolean(saved?.currentStats),
    hasMonthlyCard: Boolean(saved?.monthlyCard),
  });
  return saved;
}

async function syncMatchCompletionAndPublish(evaluation) {
  const match = (window.PlaylogOfficialData?.matches || []).find((item) => item.id === evaluation.matchId);
  if (!match) return { published: false, generatedCards: [] };

  const completion = await recalculateMatchEvaluationCompletionAsync(evaluation.matchId);
  const timestamp = evaluation.updatedAt || evaluation.createdAt || new Date().toISOString();
  if (!completion.allComplete) return { published: false, generatedCards: [] };

  const publishedAt = timestamp;
  const publishedRow = await publishMatchAsync(evaluation.matchId, publishedAt);
  console.info("Supabase 경기 공개 반환 row", { matchId: evaluation.matchId, publishedRow });
  let refreshedMatches = [];
  try {
    refreshedMatches = await refreshMatchesAsync(currentUserId);
  } catch (error) {
    console.error("Supabase 경기 공개 후 matches 동기화 실패", error);
  }
  const publishedMatch = (refreshedMatches || []).find((item) => item.id === evaluation.matchId)
    || (window.PlaylogOfficialData?.matches || []).find((item) => item.id === evaluation.matchId)
    || publishedRow;
  if (publishedMatch?.status !== "published") {
    throw new Error(`경기 공개 상태 동기화에 실패했습니다: ${evaluation.matchId}`);
  }
  const generatedCards = [];
  const cardParticipants = (completion.participants?.length ? completion.participants : publishedMatch.participants || [])
    .filter((participant) => participant.evaluationCompleted === true);
  console.info("Supabase 공개 후 카드 생성 대상", {
    matchId: evaluation.matchId,
    participants: cardParticipants,
    publishedParticipants: publishedMatch.participants,
    completionParticipants: completion.participants,
  });
  for (const participant of cardParticipants) {
    let savedCards = null;
    try {
      savedCards = await saveGeneratedCardsForParticipant(evaluation.matchId, participant.userId, publishedAt);
    } catch (error) {
      console.error("Supabase 카드 upsert 실패", { matchId: evaluation.matchId, userId: participant.userId, error });
      throw error;
    }
    if (savedCards?.matchCard) generatedCards.push(savedCards.matchCard);
  }
  const refreshedCards = await refreshPlayerCardsAsync(currentUserId);
  console.info("Supabase 카드 refresh 완료", {
    matchId: evaluation.matchId,
    generatedCount: generatedCards.length,
    refreshedMatchCards: refreshedCards?.matchCards?.filter((card) => card.matchId === evaluation.matchId).length || 0,
    localMatchCards: (window.PlaylogOfficialData?.playerMatchCards || []).filter((card) => card.matchId === evaluation.matchId).length,
  });
  return { published: true, generatedCards };
}

function disableLocalEvaluationFallback() {
  if (!window.PlaylogOfficialData) return;
  window.PlaylogOfficialData.saveEvaluation = async (payload) => saveEvaluationAsync(payload);
}

function disableLocalAwardVoteFallback() {
  if (!window.PlaylogOfficialData) return;
  window.PlaylogOfficialData.saveMatchAwardVote = async (payload) => saveMatchAwardVoteAsync(payload);
  window.PlaylogOfficialData.savePOMVote = async (payload) => saveMatchAwardVoteAsync({ ...payload, type: "pom" });
}

function disableLocalSelfReflectionFallback() {
  if (!window.PlaylogOfficialData) return;
  window.PlaylogOfficialData.saveSelfReflection = async (payload) => saveSelfReflectionAsync(payload);
}

async function updateUserStatusAsync(userId, status, approvedAt = null) {
  return requireSupabaseBridge().updateUserStatus(userId, status, approvedAt);
}

async function syncSupabaseUserContext(userId = currentUserId) {
  const bridge = supabaseBridge();
  if (!bridge) return;
  try {
    await bridge.bootstrapUserData(userId);
  } catch (error) {
    reportSupabaseError(error, "Supabase 사용자 동기화 실패");
  }
}

function signupRoleOptionsHtml(positionKey, selectedRole = "") {
  const options = signupRoleOptions[positionKey] || signupRoleOptions.free;
  return `<option value="">선택하세요</option>${options.map((role) => `<option value="${role}" ${selectedRole === role ? "selected" : ""}>${role}</option>`).join("")}`;
}

function isCurrentUserApproved() {
  if (!Array.isArray(window.PlaylogOfficialData?.users)) return true;
  return appUser(currentUserId)?.status === "approved";
}

function isRookieDemoSessionUser(userId = currentUserId) {
  return userId === "user:rookie-demo" || String(userId || "").startsWith("user:rookie-session-");
}

function canSeeTestUsers() {
  return isRookieDemoSessionUser() || Boolean(appUser(currentUserId)?.isTestUser);
}

function isHiddenFromPublicSearch(user) {
  return Boolean(user?.isTestUser || user?.hiddenFromPublicSearch);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function replaceRookieRefs(value, sessionId, token) {
  if (typeof value === "string") {
    return value
      .replaceAll("user:rookie-demo", sessionId)
      .replaceAll("match:rookie-", `match:rookie-session-${token}-`)
      .replaceAll("rookie-demo", `rookie-session-${token}`)
      .replaceAll("rookie-active", `rookie-session-${token}-active`)
      .replaceAll("evaluation:rookie:", `evaluation:rookie-session-${token}:`)
      .replaceAll("trait:rookie:", `trait:rookie-session-${token}:`)
      .replaceAll("highlight:rookie:", `highlight:rookie-session-${token}:`);
  }
  if (Array.isArray(value)) return value.map((item) => replaceRookieRefs(item, sessionId, token));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceRookieRefs(item, sessionId, token)]));
  }
  return value;
}

function cleanupRookieDemoSessions() {
  const data = window.PlaylogOfficialData;
  if (!data) return;
  const isSessionUser = (id = "") => String(id).startsWith("user:rookie-session-");
  const isSessionMatch = (match) =>
    String(match?.id || "").includes("rookie-session-")
    || (match?.participants || []).some((participant) => isSessionUser(participant.userId));
  const sessionMatchIds = new Set((data.matches || [])
    .filter(isSessionMatch)
    .map((match) => match.id));
  const prune = (collection, predicate) => {
    if (!Array.isArray(collection)) return;
    for (let index = collection.length - 1; index >= 0; index -= 1) {
      if (predicate(collection[index])) collection.splice(index, 1);
    }
  };
  prune(data.users, (user) => isSessionUser(user.id));
  prune(data.friends, (friend) => isSessionUser(friend.userId) || isSessionUser(friend.friendUserId));
  prune(data.matchAwardVotes, (vote) => isSessionUser(vote.voterUserId) || isSessionUser(vote.targetUserId) || sessionMatchIds.has(vote.matchId));
  prune(data.evaluations, (evaluation) => isSessionUser(evaluation.evaluatorUserId) || isSessionUser(evaluation.targetUserId) || sessionMatchIds.has(evaluation.matchId));
  prune(data.playerMatchCards, (card) => isSessionUser(card.userId) || sessionMatchIds.has(card.matchId));
  prune(data.playerCurrentStats, (stats) => isSessionUser(stats.userId));
  prune(data.playerMonthlyCards, (card) => isSessionUser(card.userId));
  prune(data.selfReflections, (reflection) => isSessionUser(reflection.userId) || sessionMatchIds.has(reflection.matchId));
  prune(data.matches, isSessionMatch);
  activeRookieSessionId = null;
}

function startRookieDemoSession() {
  const data = window.PlaylogOfficialData;
  if (!data) return loginAs("user:rookie-demo");
  cleanupRookieDemoSessions();
  const token = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const sessionId = `user:rookie-session-${token}`;
  const baseUserId = "user:rookie-demo";
  const baseMatchIds = new Set((data.matches || [])
    .filter((match) => (match.participants || []).some((participant) => participant.userId === baseUserId))
    .map((match) => match.id));
  const copy = (item) => replaceRookieRefs(cloneData(item), sessionId, token);
  const baseUser = data.users.find((user) => user.id === baseUserId);
  if (baseUser) data.users.push(copy(baseUser));
  (data.friends || [])
    .filter((friend) => friend.userId === baseUserId || friend.friendUserId === baseUserId)
    .forEach((friend) => data.friends.push(copy(friend)));
  (data.matches || [])
    .filter((match) => baseMatchIds.has(match.id))
    .forEach((match) => data.matches.push(copy(match)));
  (data.evaluations || [])
    .filter((evaluation) => baseMatchIds.has(evaluation.matchId) || evaluation.evaluatorUserId === baseUserId || evaluation.targetUserId === baseUserId)
    .forEach((evaluation) => data.evaluations.push(copy(evaluation)));
  (data.matchAwardVotes || [])
    .filter((vote) => baseMatchIds.has(vote.matchId) || vote.voterUserId === baseUserId || vote.targetUserId === baseUserId)
    .forEach((vote) => data.matchAwardVotes.push(copy(vote)));
  (data.playerMatchCards || [])
    .filter((card) => baseMatchIds.has(card.matchId) || card.userId === baseUserId)
    .forEach((card) => data.playerMatchCards.push(copy(card)));
  (data.playerCurrentStats || [])
    .filter((stats) => stats.userId === baseUserId)
    .forEach((stats) => data.playerCurrentStats.push(copy(stats)));
  (data.playerMonthlyCards || [])
    .filter((card) => card.userId === baseUserId)
    .forEach((card) => data.playerMonthlyCards.push(copy(card)));
  (data.selfReflections || [])
    .filter((reflection) => reflection.userId === baseUserId || baseMatchIds.has(reflection.matchId))
    .forEach((reflection) => data.selfReflections.push(copy(reflection)));
  activeRookieSessionId = sessionId;
  loginAs(sessionId);
}

function loginAs(userId) {
  currentUserId = userId;
  selectedAvatar = appUser(userId)?.profilePreset || "free-1";
  selectedFriendProfileId = null;
  showingMyProfile = false;
  const nextMatch = (window.PlaylogOfficialData?.matches || [])
    .filter((match) => (match.participants || []).some((participant) => participant.userId === userId))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())[0];
  if (nextMatch) selectedMatchId = nextMatch.id;
  authMode = "landing";
  if (isCurrentUserApproved()) {
    renderHome();
    renderEvaluation();
    renderReflection();
    renderCards();
    renderFriends();
    setView("home");
  } else {
    setView("auth");
  }
}

function logout() {
  const shouldCleanupRookieSession = activeRookieSessionId && currentUserId === activeRookieSessionId;
  currentUserId = null;
  selectedAvatar = "free-1";
  selectedFriendProfileId = null;
  showingMyProfile = false;
  authMode = "landing";
  closeSheet();
  if (shouldCleanupRookieSession) cleanupRookieDemoSessions();
  setView("auth");
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
  const match = window.PlaylogOfficialData?.matches?.find((item) => item.id === selectedMatchId) || null;
  if (!match) return null;
  return (match.participants || []).some((participant) => participant.userId === currentUserId) ? match : null;
}

function evaluationTargetPlayers() {
  const targets = window.PlaylogOfficialData?.getEvaluationTargets?.(selectedMatchId, currentUserId);
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

function currentUserMatches() {
  return (window.PlaylogOfficialData?.matches || [])
    .filter((match) => (match.participants || []).some((participant) => participant.userId === currentUserId))
    .sort((left, right) => new Date(right.date || right.createdAt || 0).getTime() - new Date(left.date || left.createdAt || 0).getTime());
}

function matchRemainingTargets(match) {
  return window.PlaylogOfficialData?.getRemainingEvaluationTargets?.(match.id, currentUserId) || [];
}

function matchProgress(match) {
  const progress = window.PlaylogOfficialData?.getEvaluationProgress?.(match.id);
  if (progress) return progress;
  const targets = Math.max((match.participants || []).length - 1, 0);
  return { completedCount: 0, totalCount: targets, remainingCount: targets };
}

function currentUserMatchState(match) {
  if (match.status === "published") return "평가완료";
  const participant = (match.participants || []).find((item) => item.userId === currentUserId);
  const hasTargets = (match.participants || []).some((item) => item.userId !== currentUserId);
  const evaluationCompleted = participant?.evaluationCompleted || (hasTargets && matchRemainingTargets(match).length === 0);
  if (evaluationCompleted && !hasRequiredAwardVotes(match.id)) return "투표 필요";
  if (evaluationCompleted) return "평가완료";
  const progress = matchProgress(match);
  return progress.completedCount > 0 ? "평가중" : "미평가";
}

function matchStatusBadge(match) {
  if (match.status === "published") return "결과공개";
  if (currentUserMatchState(match) === "투표 필요") return "투표 필요";
  if (currentUserMatchState(match) === "평가완료") return "결과공개대기";
  if (match.status === "closed") return "경기완료";
  return "진행중";
}

function matchActionLabel(match) {
  if (match.status === "published") return "결과 보기";
  if (currentUserMatchState(match) === "투표 필요") return "투표 진행";
  if (currentUserMatchState(match) === "평가완료") return "공개 대기";
  return "평가 진행";
}

function hasRequiredAwardVotes(matchId = selectedMatchId) {
  const match = window.PlaylogOfficialData?.matches?.find((item) => item.id === matchId) || null;
  if (!isAwardVotingEnabled(match)) return true;
  const pomVote = window.PlaylogOfficialData?.getMatchAwardVote?.(matchId, currentUserId, "pom")
    || window.PlaylogOfficialData?.getPOMVote?.(matchId, currentUserId);
  const nextStarVote = window.PlaylogOfficialData?.getMatchAwardVote?.(matchId, currentUserId, "next_star");
  return Boolean(pomVote && nextStarVote);
}

function isAwardVotingEnabled(match = activeMatchRecord()) {
  if (!match) return true;
  return match.awardVotingEnabled !== false;
}

function toDatetimeLocalValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function matchParticipantCandidates() {
  const friendIds = (window.PlaylogOfficialData?.friends || [])
    .filter((friend) => friend.userId === currentUserId && friend.status === "accepted")
    .map((friend) => friend.friendUserId);
  return [
    { userId: currentUserId, name: displayUserName(currentUserId), locked: true },
    ...friendIds.map((userId) => ({ userId, name: displayUserName(userId), locked: false })),
  ];
}

function sampleUserOptions() {
  const officialUsers = window.PlaylogOfficialData?.users;
  const approvedUsers = (officialUsers || [])
    .filter((user) =>
      user.id !== currentUserId
      && user.status === "approved"
      && (canSeeTestUsers() || !isHiddenFromPublicSearch(user)))
    .map((user) => ({ name: displayUserName(user.id), userId: user.id }));
  if (Array.isArray(officialUsers)) return approvedUsers;
  return Object.entries(playerIds).map(([name, userId]) => ({ name: displayUserName(userId) || name, userId }));
}

function friendUsers() {
  const acceptedFriendIds = new Set((window.PlaylogOfficialData?.friends || [])
    .filter((friend) => friend.userId === currentUserId && friend.status === "accepted")
    .map((friend) => friend.friendUserId));
  return sampleUserOptions().filter((user) => acceptedFriendIds.has(user.userId));
}

function nonFriendUsers() {
  const acceptedFriendIds = new Set(friendUsers().map((user) => user.userId));
  return sampleUserOptions().filter((user) => !acceptedFriendIds.has(user.userId));
}

function isAcceptedFriend(userId) {
  return (window.PlaylogOfficialData?.friends || []).some((friend) =>
    friend.userId === currentUserId && friend.friendUserId === userId && friend.status === "accepted",
  );
}

function friendProfileSummary(userId) {
  const cards = userMatchCards(userId);
  const latestCard = cards[0];
  const currentStats = currentStatsForUser(userId);
  return {
    position: positionLabels[currentStats?.currentMainPosition || latestCard?.mainEvaluatedPosition]?.[0] || "포지션 분석 준비중",
    ovr: currentStats?.currentOVR ? `OVR ${currentStats.currentOVR}` : latestCard?.overallRating ? `OVR ${latestCard.overallRating}` : "OVR 분석 준비중",
    style: currentStats?.currentPlayStyle || latestCard?.playStyle || "플레이유형 분석 준비중",
    recentTogether: (window.PlaylogOfficialData?.matches || []).some((match) =>
      (match.participants || []).some((participant) => participant.userId === currentUserId)
      && (match.participants || []).some((participant) => participant.userId === userId),
    ),
  };
}

function friendCurrentFormProfile(userId) {
  const user = appUser(userId) || {};
  const stats = currentStatsForUser(userId);
  const cards = currentFormWindowCardsForUser(userId);
  const monthlyCard = latestMonthlyCardForUser(userId);
  const mainPosition = stats?.currentMainPosition || user.mainPosition;
  const position = positionLabels[mainPosition] || ["포지션 분석 준비중", "-"];
  return {
    user,
    stats,
    cards,
    monthlyCard,
    position,
    playStyle: stats?.currentPlayStyle || user.preferredRole || "플레이유형 분석 준비중",
    ovr: stats?.currentOVR ?? null,
  };
}

function friendPositionDistribution(userId) {
  const cards = currentFormWindowCardsForUser(userId);
  return positionSummaryEntries(currentFormPositionSummary(cards));
}

function friendMatchCardSummary(card) {
  const identity = representativeMatchIdentity(card);
  const tags = cardTagItems(card).slice(0, 2);
  return `
    <button class="friend-profile-match" data-friend-profile-match="${card.matchId}" data-card-user="${card.userId}" type="button">
      <span>OVR ${card.overallRating}</span>
      <div>
        <strong>${identity.label}</strong>
        <p>${identity.playStyle}</p>
      </div>
      ${tags.length ? `<small>${tags.map((tag) => `<i>${tag}</i>`).join("")}</small>` : ""}
    </button>
  `;
}

function friendMonthlyCardSummary(card) {
  const [year, month] = card.monthKey.split("-");
  const position = positionLabels[card.mainPosition]?.[0] || "-";
  const change = changeLabel(card.monthlyOVRChange);
  return `
    <button class="friend-profile-monthly" data-friend-profile-monthly="${card.monthKey}" data-card-user="${card.userId}" type="button">
      <div>
        <span>MONTHLY CARD</span>
        <strong>${year}년 ${Number(month)}월 평균</strong>
        <p>${position} · ${card.mainPlayStyle || "분석 준비중"} · ${card.matchCount}경기</p>
      </div>
      <b>OVR ${card.monthlyOVR}<em>${change}</em></b>
    </button>
  `;
}

function renderProfileView(userId, options = {}) {
  const isMine = options.isMine === true;
  const profile = friendCurrentFormProfile(userId);
  const displayName = displayUserName(userId);
  const preset = avatarPresetForUser(userId);
  const positionDistribution = friendPositionDistribution(userId);
  const recentCards = userMatchCards(userId).slice(0, 3);
  const monthlyCard = profile.monthlyCard;
  const hasOfficialData = recentCards.length || monthlyCard;
  document.querySelector(".friend-highlight").innerHTML = `
    <div class="friend-profile-nav">
      <button class="friend-profile-back" data-profile-back type="button">← 친구 목록</button>
    </div>
    <article class="friend-profile-hero">
      <div class="friend-profile-avatar" aria-hidden="true">
        <span class="preset-thumb mini" style="${presetStyle(preset)}"></span>
        <em>${profile.position[1]}</em>
      </div>
      <div>
        <small>${isMine ? "MY PROFILE" : "FRIEND PROFILE"}</small>
        <h3>${escapeHtml(displayName)}</h3>
        <p>@${escapeHtml(profile.user.playlogId || "-")}</p>
        <strong>${profile.position[0]} · ${profile.playStyle}</strong>
        <b>${profile.ovr ? `OVR ${profile.ovr}` : "OVR -"}</b>
      </div>
    </article>
  `;
  document.querySelector("#friendList").innerHTML = `
    <section class="friend-profile">
      ${hasOfficialData ? "" : `<article class="friend-profile-empty"><strong>아직 공식 경기 기록이 없습니다.</strong><p>친구가 공식 경기를 완료하면 CURRENT FORM과 카드 기록이 이곳에 표시됩니다.</p></article>`}
      <article class="friend-profile-section">
        <div class="friend-profile-section-head"><div class="section-title-group"><strong>CURRENT FORM 요약</strong><span>최근 60일 기준</span></div></div>
        <div class="friend-profile-summary-grid">
          <span>현재 OVR<strong>${profile.ovr ?? "-"}</strong></span>
          <span>대표 포지션<strong>${profile.position[0]}</strong></span>
          <span>플레이유형<strong>${profile.playStyle}</strong></span>
          <span>최근 경기 수<strong>${profile.stats?.recentMatchCount || recentCards.length || 0}경기</strong></span>
        </div>
      </article>
      <article class="friend-profile-section">
        <div class="friend-profile-section-head"><div class="section-title-group"><strong>포지션 분포</strong><span>CURRENT FORM</span></div></div>
        <div class="friend-position-list">
          ${positionDistribution.length
            ? positionDistribution.map((entry) => `<span>${entry.label}<strong>${entry.count}회</strong></span>`).join("")
            : `<span>포지션 기록<strong>-</strong></span>`}
        </div>
      </article>
      <article class="friend-profile-section">
        <div class="friend-profile-section-head"><div class="section-title-group"><strong>최근 경기 카드</strong><span>최대 3개</span></div></div>
        <div class="friend-profile-match-list">
          ${recentCards.length ? recentCards.map(friendMatchCardSummary).join("") : `<p class="friend-profile-note">아직 완료된 경기 카드가 없습니다.</p>`}
        </div>
      </article>
      <article class="friend-profile-section">
        <div class="friend-profile-section-head"><div class="section-title-group"><strong>월 카드</strong><span>최신 1개</span></div></div>
        ${monthlyCard ? friendMonthlyCardSummary(monthlyCard) : `<p class="friend-profile-note">아직 월 카드가 없습니다.</p>`}
      </article>
      ${isMine ? `
        <div class="my-profile-actions">
          <button class="primary full" data-edit-my-profile type="button">프로필 수정</button>
          <button class="secondary full" data-my-profile-logout type="button">로그아웃</button>
        </div>
      ` : ""}
    </section>
  `;
  document.querySelector("[data-profile-back]")?.addEventListener("click", () => {
    selectedFriendProfileId = null;
    showingMyProfile = false;
    renderFriends();
  });
  document.querySelector("[data-edit-my-profile]")?.addEventListener("click", () => {
    openSheet("profileEdit");
  });
  document.querySelector("[data-my-profile-logout]")?.addEventListener("click", logout);
}

function renderFriendProfile(userId) {
  renderProfileView(userId, { isMine: false });
}

function renderMyProfile() {
  renderProfileView(currentUserId, { isMine: true });
}

function resetNewMatchDraft() {
  newMatchDraft = {
    title: "",
    date: toDatetimeLocalValue(new Date()),
    location: "",
    participantIds: [currentUserId],
    deadlineHours: 12,
    awardVotingEnabled: false,
    awardVotingTouched: false,
  };
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
  const progress = window.PlaylogOfficialData?.getEvaluationProgress?.(selectedMatchId);
  const activeMatches = currentUserMatches().filter((item) => item.status !== "published");
  const allButton = document.querySelector("#activeMatchAllButton");
  if (!match || !progress) {
    document.querySelector("#activeMatchStatus").textContent = "대기";
    document.querySelector("#activeMatchTitle").textContent = "진행 중인 평가가 없습니다.";
    document.querySelector("#activeMatchMeta").textContent = "새로운 경기에 참여해 평가를 받아보세요.";
    document.querySelector("#activeMatchWaiting").hidden = true;
    document.querySelector("#activeMatchFaces").innerHTML = "";
    document.querySelector("#activeMatchProgress").setAttribute("style", "--progress: 0");
    document.querySelector("#activeMatchProgressValue").textContent = "-";
    document.querySelector("#activeMatchProgressLabel").textContent = "대기";
    document.querySelector("#activeMatchAction").hidden = true;
    if (allButton) allButton.dataset.toast = "진행 중인 평가가 없습니다.";
    return;
  }
  if (allButton) allButton.dataset.toast = activeMatches.length
    ? `진행 중인 평가 ${activeMatches.length}개가 있어요`
    : "진행 중인 평가가 없습니다.";
  document.querySelector("#activeMatchAction").hidden = false;
  const waiting = window.PlaylogOfficialData.getPublishWaitingStatus?.(selectedMatchId);
  const pomResult = match.status === "published"
    ? window.PlaylogOfficialData.calculateMatchAward?.(selectedMatchId, "pom")
    : null;
  const nextStarResult = match.status === "published"
    ? window.PlaylogOfficialData.calculateMatchAward?.(selectedMatchId, "next_star")
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

function currentStatsForUser(userId = currentUserId) {
  const existingStats = window.PlaylogOfficialData?.playerCurrentStats
    ?.find((stats) => stats && stats.userId === userId) || null;
  const cards = recentOfficialCardsForUser(userId, 60);
  if (cards.length && window.PlaylogEngine?.generatePlayerCurrentStats) {
    const currentFormStats = window.PlaylogEngine.generatePlayerCurrentStats({
      userId,
      cards,
      generatedAt: existingStats?.generatedAt || new Date().toISOString(),
    });
    if (currentFormStats) {
      return {
        ...currentFormStats,
        previousOVR: existingStats?.previousOVR ?? currentFormStats.previousOVR,
        ovrChange: existingStats?.ovrChange ?? currentFormStats.ovrChange,
        previousPlayStyle: existingStats?.previousPlayStyle ?? currentFormStats.previousPlayStyle,
        radarChange: existingStats?.radarChange ?? currentFormStats.radarChange,
      };
    }
  }
  const monthlyCard = latestMonthlyCardForUser(userId);
  if (!monthlyCard) return null;
  return {
    userId,
    currentOVR: monthlyCard.monthlyOVR,
    previousOVR: monthlyCard.previousMonthlyOVR,
    ovrChange: monthlyCard.monthlyOVRChange,
    radarData: monthlyCard.radarData,
    radarChange: null,
    currentPlayStyle: monthlyCard.mainPlayStyle,
    previousPlayStyle: null,
    currentMainPosition: monthlyCard.mainPosition,
    positionAdaptation: monthlyCard.positionAdaptation,
    reliabilityLevel: null,
    recentMatchCount: 0,
    sourceType: "monthlyFallback",
    monthKey: monthlyCard.monthKey,
  };
}

function currentHomeStats() {
  return currentStatsForUser(currentUserId);
}

function isPublishedMatchId(matchId) {
  return (window.PlaylogOfficialData?.matches || [])
    .some((match) => match.id === matchId && match.status === "published");
}

function isPublishedMatchCard(card) {
  return Boolean(card?.matchId) && isPublishedMatchId(card.matchId);
}

function recentOfficialCardsForUser(userId = currentUserId, days = 60) {
  const now = new Date("2026-05-28T00:00:00.000Z").getTime();
  const windowMs = days * 24 * 60 * 60 * 1000;
  return (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.userId === userId && card.generatedAt && isPublishedMatchCard(card))
    .filter((card) => now - new Date(card.generatedAt).getTime() <= windowMs)
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());
}

function recentOfficialCards(days = 60) {
  return recentOfficialCardsForUser(currentUserId, days);
}

function currentFormWindowCardsForUser(userId = currentUserId) {
  return recentOfficialCardsForUser(userId, 60).slice(0, 4);
}

function currentFormWindowCards() {
  return currentFormWindowCardsForUser(currentUserId);
}

function currentFormBasisLabel(stats) {
  if (!stats) return "분석 준비중 · 아직 공식 경기 기록이 없습니다.";
  if (stats.sourceType === "monthlyFallback") {
    const [year, month] = stats.monthKey.split("-");
    return `최근 공식 기록 없음 · 마지막 월간 카드 기준: ${year}년 ${Number(month)}월`;
  }
  const count = stats.recentMatchCount || recentOfficialCards(60).length;
  const basis = count >= 4 ? "최근 4경기 가중 평균" : `최근 ${count}경기 ${count === 1 ? "기준" : "단순 평균"}`;
  return `${basis} · 최근 60일 기준`;
}

function latestMonthlyCardForUser(userId = currentUserId) {
  return (window.PlaylogOfficialData?.playerMonthlyCards || [])
    .filter((card) => card && card.userId === userId)
    .filter((card) => monthlyMatchCards(card).length > 0)
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))[0] || null;
}

function latestHomeMonthlyCard() {
  return latestMonthlyCardForUser(currentUserId);
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
  return Object.entries(labels).map(([key, label]) => [label, stats.radarData?.[key] ?? "-"]);
}

function radarLabel(key) {
  return {
    activity: "활동성",
    gameSense: "게임 센스",
    pass: "패스",
    ballControl: "볼 컨트롤",
    movement: "움직임",
    mentality: "멘탈",
  }[key] || key;
}

function currentPlayStyleCode(stats) {
  return recentOfficialCards(60)
    .filter((card) => card && card.playStyle === stats.currentPlayStyle && (!stats.currentMainPosition || card.mainEvaluatedPosition === stats.currentMainPosition))
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())[0]
    ?.playStyleCode || "";
}

function recentHomeMatchCards() {
  return (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.userId === currentUserId && isPublishedMatchCard(card))
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())
    .slice(0, 3);
}

function userMatchCards(userId = currentUserId) {
  return (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.userId === userId && isPublishedMatchCard(card))
    .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());
}

function userMonthlyCards(userId = currentUserId) {
  return (window.PlaylogOfficialData?.playerMonthlyCards || [])
    .filter((card) => card && card.userId === userId)
    .filter((card) => monthlyMatchCards(card).length > 0)
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey));
}

function latestHomeAnalysisCard() {
  const card = recentOfficialCards(60)[0];
  return card
    && Array.isArray(card.strengthsTop3)
    && Array.isArray(card.weaknessesTop3)
    && card.matchAnalysisText
    ? card
    : null;
}

function currentFormPositionSummary(cards) {
  return cards.reduce((summary, card) => {
    Object.entries(card.selectedPositionSummary || {}).forEach(([position, item]) => {
      if (!item?.count) return;
      summary[position] = summary[position] || { count: 0 };
      summary[position].count += item.count;
    });
    return summary;
  }, {});
}

function currentFormRepresentativePosition(cards, fallbackPosition = null) {
  const summary = currentFormPositionSummary(cards);
  const candidates = Object.entries(summary)
    .map(([position, item]) => {
      const relatedCards = cards.filter((card) =>
        card.selectedPositionSummary?.[position]?.count > 0 || card.mainEvaluatedPosition === position);
      const scoreValues = relatedCards
        .map((card) => card.positionAdaptation?.[position]?.adaptationRating ?? card.positionAdaptation?.[position]?.positionAverage ?? card.overallRating)
        .filter((value) => Number.isFinite(value));
      const latestIndex = cards.findIndex((card) =>
        card.selectedPositionSummary?.[position]?.count > 0 || card.mainEvaluatedPosition === position);
      return {
        position,
        count: item?.count || 0,
        score: scoreValues.length ? average(scoreValues) : 0,
        latestIndex: latestIndex >= 0 ? latestIndex : Number.POSITIVE_INFINITY,
      };
    })
    .filter((item) => item.count > 0)
    .sort((left, right) =>
      right.count - left.count
      || right.score - left.score
      || left.latestIndex - right.latestIndex);
  return candidates[0]?.position || fallbackPosition || null;
}

function currentFormWeightedEntries(cards) {
  const formCards = cards.slice(0, 4);
  const weights = formCards.length >= 4
    ? [0.4, 0.3, 0.2, 0.1]
    : formCards.map(() => 1 / formCards.length);
  return formCards.map((card, index) => ({ card, weight: weights[index] }));
}

function weightedCurrentFormAnalysisScores(cards) {
  const groups = {};
  currentFormWeightedEntries(cards).forEach(({ card, weight }) => {
    (card.analysisScores || []).forEach((item) => {
      if (!groups[item.key]) {
        groups[item.key] = { key: item.key, label: analysisItemLabel(item), weightedTotal: 0, weightTotal: 0 };
      }
      if (Number.isFinite(item.score)) {
        groups[item.key].weightedTotal += item.score * weight;
        groups[item.key].weightTotal += weight;
      }
    });
  });
  return Object.values(groups).map((item) => ({
    key: item.key,
    label: item.label,
    score: item.weightTotal ? Math.round((item.weightedTotal / item.weightTotal) * 10) / 10 : null,
  }));
}

function weightedCurrentFormTraitItems(cards) {
  const groups = {};
  currentFormWeightedEntries(cards).forEach(({ card, weight }) => {
    activeEvaluationsForCard(card).flatMap((evaluation) => evaluation.traits || []).forEach((trait) => {
      if (!groups[trait.key]) {
        groups[trait.key] = {
          key: trait.key,
          label: evaluationFields.traits.find((field) => field.key === trait.key)?.label || trait.key,
          weightedTotal: 0,
          weightTotal: 0,
        };
      }
      if (Number.isFinite(trait.score)) {
        groups[trait.key].weightedTotal += trait.score * weight;
        groups[trait.key].weightTotal += weight;
      }
    });
  });
  return Object.values(groups).map((item) => ({
    key: item.key,
    label: item.label,
    score: item.weightTotal ? Math.round((item.weightedTotal / item.weightTotal) * 10) / 10 : null,
  }));
}

function currentFormRadarHighlights(radarData, mode) {
  const items = playerCurrentRadarStats({ radarData })
    .map(([label, value]) => ({
      key: label,
      label,
      score: Number.isFinite(value) ? Math.round((value / 10) * 10) / 10 : null,
    }))
    .filter((item) => Number.isFinite(item.score));
  return items
    .sort((left, right) => mode === "high" ? right.score - left.score : left.score - right.score)
    .slice(0, 3);
}

function aggregateCurrentFormItems(cards, key) {
  const counted = cards.flatMap((card) => card[key] || []).reduce((summary, item) => {
    const itemKey = item.key || item.label;
    if (!itemKey) return summary;
    summary[itemKey] = summary[itemKey] || {
      key: item.key,
      label: analysisItemLabel(item),
      scoreTotal: 0,
      scoreCount: 0,
      count: 0,
    };
    summary[itemKey].count += 1;
    if (Number.isFinite(item.score)) {
      summary[itemKey].scoreTotal += item.score;
      summary[itemKey].scoreCount += 1;
    }
    return summary;
  }, {});
  return Object.values(counted)
    .map((item) => ({
      key: item.key,
      label: item.label,
      score: item.scoreCount ? Math.round((item.scoreTotal / item.scoreCount) * 10) / 10 : item.count,
      count: item.count,
    }))
    .sort((left, right) => right.count - left.count || (right.score || 0) - (left.score || 0))
    .slice(0, 3);
}

function currentFormAnalysisCard() {
  const stats = currentHomeStats();
  const cards = currentFormWindowCards();
  if (!stats || stats.sourceType === "monthlyFallback" || !cards.length) return null;
  const latest = cards[0];
  const selectedPositionSummary = currentFormPositionSummary(cards);
  const mainEvaluatedPosition = currentFormRepresentativePosition(cards, stats.currentMainPosition);
  return {
    ...latest,
    id: `current-form:${currentUserId}`,
    matchId: "current-form",
    userId: currentUserId,
    overallRating: stats.currentOVR,
    previousOverallRating: stats.previousOVR,
    overallChange: stats.ovrChange,
    playStyle: stats.currentPlayStyle,
    playStyleCode: currentPlayStyleCode(stats),
    mainEvaluatedPosition,
    radarData: stats.radarData,
    selectedPositionSummary,
    positionAdaptation: stats.positionAdaptation,
    strengthsTop3: currentFormRadarHighlights(stats.radarData, "high"),
    weaknessesTop3: currentFormRadarHighlights(stats.radarData, "low"),
    analysisScores: weightedCurrentFormAnalysisScores(cards),
    traitItems: weightedCurrentFormTraitItems(cards),
    matchAnalysisText: "최근 공식 경기들을 기준으로 현재 폼을 요약했습니다.",
    sourceType: "currentForm",
    recentMatchCount: Math.min(cards.length, 4),
  };
}

function matchTitle(card) {
  const knownMatches = { "match:sangam-2026-05-23": "상암 목요일 풋살" };
  const managed = (window.PlaylogOfficialData?.matches || []).find((match) => match.id === card.matchId);
  return managed?.title || knownMatches[card.matchId] || card.matchId;
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

function changeLabel(value) {
  if (!Number.isFinite(value)) return "";
  if (value > 0) return `+${value}`;
  if (value < 0) return String(value);
  return "0";
}

function radarPreviewMarkup(stats, detailed = false) {
  const items = playerCurrentRadarStats(stats);
  const size = detailed ? 300 : 118;
  const center = size / 2;
  const radius = detailed ? 78 : 34;
  const points = items.map(([, score], index) => {
    const safeScore = Number.isFinite(score) ? score : 55;
    const angle = Math.PI * 2 * (index / items.length) - Math.PI / 2;
    const valueRadius = Math.max(0, Math.min(100, safeScore)) / 100 * radius;
    return [center + Math.cos(angle) * valueRadius, center + Math.sin(angle) * valueRadius];
  });
  const grid = [0.5, 1].map((scale) => {
    const ring = items.map((_, index) => {
      const angle = Math.PI * 2 * (index / items.length) - Math.PI / 2;
      return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
    }).join(" ");
    return `<polygon points="${ring}" fill="none" stroke="rgba(255,255,255,.14)" />`;
  }).join("");
  const labels = detailed ? items.map(([label, score], index) => {
    const angle = Math.PI * 2 * (index / items.length) - Math.PI / 2;
    const x = center + Math.cos(angle) * radius * 1.42;
    const y = center + Math.sin(angle) * radius * 1.42;
    return `<text x="${x}" y="${y}" text-anchor="middle"><tspan x="${x}" dy="-8">${label}</tspan><tspan x="${x}" dy="22">${score}</tspan></text>`;
  }).join("") : "";
  return `<svg viewBox="0 0 ${size} ${size}" aria-label="핵심 능력 분석">${grid}<polygon points="${points.map((point) => point.join(",")).join(" ")}" fill="rgba(126,86,255,.48)" stroke="#b08cff" stroke-width="2" />${labels}</svg>`;
}

function emptyRadarStats() {
  return [["활동성", null], ["게임 센스", null], ["패스", null], ["볼 컨트롤", null], ["움직임", null], ["멘탈", null]];
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
      label: profilePresetLabels[`${positionKey}-${index}`] || name,
      sub,
      index,
      image: avatarSheets[positionKey],
    })),
  );
}

function currentAvatarPreset() {
  return avatarPresetItems().find((preset) => preset.key === selectedAvatar) || avatarPresetItems()[0];
}

function avatarPresetForUser(userId) {
  const presetKey = appUser(userId)?.profilePreset || "free-1";
  return avatarPresetItems().find((preset) => preset.key === presetKey) || avatarPresetItems()[0];
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
    const displayDiff = `${change.diff > 0 ? "+" : ""}${Number(change.diff).toFixed(1)}`;
    return `<div class="result-stat ${direction}"><b>${index + 1}</b><small>${analysisItemLabel(change)}</small><i aria-hidden="true"><span style="width:${width}%"></span></i><strong>${displayDiff}</strong></div>`;
  }).join("");
}

function renderAnalysisChangeSection(items, direction, emptyText) {
  return items.length
    ? renderAnalysisChanges(items, direction)
    : `<p class="result-empty">${emptyText}</p>`;
}

function cardTagItems(card) {
  const changes = splitAnalysisChanges(card.analysisChanges);
  const changeTags = [...changes.rising, ...changes.falling].slice(0, 3).map((item) => `${analysisItemLabel(item)} ${item.diff > 0 ? "+" : ""}${item.diff}`);
  if (changeTags.length) return changeTags;
  return (card.strengthsTop3 || []).slice(0, 3).map(analysisItemLabel);
}

function positionSummaryEntries(summary = {}) {
  return Object.entries(summary)
    .map(([position, item]) => ({
      position,
      count: item?.count || 0,
      label: positionLabels[position]?.[0] || position,
      code: positionLabels[position]?.[1] || "-",
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
}

function roleMatchInfo(card) {
  const entries = positionSummaryEntries(card.selectedPositionSummary);
  const isMulti = entries.length > 1;
  return {
    type: isMulti ? "MULTI ROLE MATCH" : "SINGLE ROLE MATCH",
    description: isMulti
      ? "이번 경기에서 동료들은 당신을 여러 포지션으로 평가했습니다."
      : "이번 경기에서 동료들은 당신을 모두 같은 포지션으로 평가했습니다.",
    entries,
  };
}

function positionIdentityTemplate(card) {
  const info = roleMatchInfo(card);
  const representative = representativeMatchIdentity(card);
  const representativeLabel = representative.label || positionLabels[card.mainEvaluatedPosition]?.[0] || "-";
  const otherLabels = info.entries
    .filter((entry) => entry.position !== representative.position)
    .map((entry) => entry.label);
  const interpretation = otherLabels.length
    ? `동료들은 이번 경기에서 당신을 주로 ${representativeLabel}로 평가했지만, ${otherLabels.join("와 ")} 역할도 수행했다고 인식했습니다.`
    : `동료들은 이번 경기에서 당신을 ${representativeLabel}로 일관되게 평가했습니다.`;
  return `
    <section class="report-block position-identity">
      <div class="result-section-head">POSITION IDENTITY<span>${info.type}</span></div>
      <div class="report-score-grid">
        ${info.entries.length ? info.entries.map((entry) => `<span>${entry.label}<strong>${entry.count}명</strong></span>`).join("") : `<span>포지션 데이터<strong>-</strong></span>`}
      </div>
      <p><b>대표 포지션: ${representativeLabel}</b><br>${interpretation}</p>
    </section>
  `;
}

function currentPositionIdentityTemplate(card) {
  const entries = positionSummaryEntries(card.selectedPositionSummary);
  const representative = representativeMatchIdentity(card);
  const representativeLabel = representative.label || positionLabels[card.mainEvaluatedPosition]?.[0] || "-";
  const otherLabels = entries
    .filter((entry) => entry.position !== representative.position)
    .map((entry) => entry.label);
  const interpretation = otherLabels.length
    ? `최근 공식 경기에서 동료들은 당신을 주로 ${representativeLabel}로 봤고, ${otherLabels.join("와 ")} 역할도 함께 수행했다고 인식했습니다.`
    : `최근 공식 경기에서 동료들은 당신을 ${representativeLabel}로 일관되게 평가했습니다.`;
  return `
    <section class="report-block position-identity">
      <div class="result-section-head">CURRENT POSITION IDENTITY<span>최근 폼 기준</span></div>
      <div class="report-score-grid">
        ${entries.length ? entries.map((entry) => `<span>${entry.label}<strong>${entry.count}회</strong></span>`).join("") : `<span>포지션 데이터<strong>-</strong></span>`}
      </div>
      <p><b>대표 포지션: ${representativeLabel}</b><br>${interpretation}</p>
    </section>
  `;
}

function monthlyPositionDistribution(card) {
  const counts = monthlyMatchCards(card).reduce((summary, matchCard) => {
    positionSummaryEntries(matchCard.selectedPositionSummary).forEach((entry) => {
      summary[entry.position] = (summary[entry.position] || 0) + entry.count;
    });
    return summary;
  }, {});
  return Object.entries(counts)
    .map(([position, count]) => ({ position, count, label: positionLabels[position]?.[0] || position }))
    .sort((left, right) => right.count - left.count);
}

function monthlyPositionIdentityText(card) {
  const entries = monthlyPositionDistribution(card);
  if (!entries.length) return "포지션 분포 분석 준비중";
  const main = entries[0]?.label;
  const sub = entries.find((entry) => entry.position !== card.mainPosition)?.label || entries[1]?.label;
  return sub ? `${main} 중심 · ${sub} 보조` : `${main} 중심`;
}

function monthlyPositionDistributionTemplate(card) {
  const entries = monthlyPositionDistribution(card);
  const representative = positionLabels[card.mainPosition]?.[0] || "-";
  return `
    <section class="report-block">
      <div class="result-section-head">${Number(card.monthKey.split("-")[1])}월 포지션 분포<span>대표 ${representative}</span></div>
      <div class="report-score-grid">
        ${entries.length ? entries.map((entry) => `<span>${entry.label}<strong>${entry.count}회</strong></span>`).join("") : `<span>포지션 기록<strong>-</strong></span>`}
      </div>
    </section>
  `;
}

function monthlyPositionAdaptationTemplate(card) {
  const distributionCounts = monthlyPositionDistribution(card).reduce((summary, entry) => {
    summary[entry.position] = entry.count;
    return summary;
  }, {});
  const entries = Object.entries(positionLabels)
    .filter(([key]) => ["attack", "am", "dm", "defense", "free"].includes(key))
    .map(([position, label]) => {
      const adaptation = card.positionAdaptation?.[position];
      return {
        position,
        label: label[0],
        rating: adaptation?.adaptationRating ?? null,
        count: distributionCounts[position] || 0,
      };
    });
  return `
    <section class="report-block">
      <div class="result-section-head">포지션 적응도<span>월간 기준</span></div>
      <div class="report-score-grid">
        ${entries.map((entry) => `<span>${entry.label}<strong>${Number.isFinite(entry.rating) ? entry.rating : "-"} · ${entry.count}회</strong></span>`).join("")}
      </div>
    </section>
  `;
}

function matchCardPreview(card, compact = false) {
  const position = positionLabels[card.mainEvaluatedPosition] || ["-", "-"];
  const change = changeLabel(card.overallChange);
  const tags = cardTagItems(card).slice(0, compact ? 2 : 3);
  return `
    <button class="card-preview match-preview" data-match-card="${card.matchId}" data-card-user="${card.userId}" type="button">
      <div class="card-preview-head">
        <span>MATCH CARD</span>
        <small>${matchDate(card)}</small>
      </div>
      <div class="card-preview-main">
        <div><strong>${matchTitle(card)}</strong><p>${position[0]} · ${position[1]} · ${card.playStyle || "분석 준비중"}</p></div>
        <b>OVR ${card.overallRating}<em>${change}</em></b>
      </div>
      <div class="card-preview-tags">${tags.map((tag) => `<i>${tag}</i>`).join("")}</div>
    </button>
  `;
}

function monthlyCardPreview(card) {
  const [year, month] = card.monthKey.split("-");
  const position = positionLabels[card.mainPosition]?.[0] || "-";
  const change = changeLabel(card.monthlyOVRChange);
  const tags = [
    `${Number(month)}월 ${card.matchCount}경기 기준`,
    position,
    ...(card.strengthsSummary || []).slice(0, 1).map((item) => item.label),
  ];
  return `
    <button class="card-preview monthly-preview" data-monthly-card="${card.monthKey}" type="button">
      <div class="card-preview-head">
        <span>MONTHLY CARD</span>
        <small>${year}년 ${Number(month)}월 평균</small>
      </div>
      <div class="card-preview-main">
        <div><strong>${card.monthKey}</strong><p>${position} · ${card.mainPlayStyle || "분석 준비중"}</p></div>
        <b>OVR ${card.monthlyOVR}<em>${change}</em></b>
      </div>
      <div class="card-preview-tags">${tags.filter(Boolean).map((tag) => `<i>${tag}</i>`).join("")}</div>
    </button>
  `;
}

function homeMatchSummary(card) {
  const position = positionLabels[card.mainEvaluatedPosition] || ["-", "-"];
  const change = changeLabel(card.overallChange);
  return `
    <button class="recent-row" data-match-card="${card.matchId}" data-card-user="${card.userId}" type="button">
      <div>
        <h3>${matchTitle(card)}</h3>
        <p>${matchDate(card)} · ${position[0]} · ${position[1]} · ${card.playStyle || "분석 준비중"}</p>
      </div>
      <strong>OVR ${card.overallRating}${change ? ` <em>${change}</em>` : ""}</strong>
    </button>
  `;
}

function receivedComments(matchId, userId) {
  return (window.PlaylogOfficialData?.evaluations || [])
    .filter((evaluation) => evaluation.matchId === matchId && evaluation.targetUserId === userId)
    .map((evaluation) => sanitizeOptionalText(evaluation.overallComment, [evaluationCommentPlaceholder]))
    .filter(Boolean);
}

function activeEvaluationsForCard(card) {
  if (!isPublishedMatchCard(card)) return [];
  return (window.PlaylogOfficialData?.evaluations || [])
    .filter((evaluation) => evaluation.matchId === card.matchId && evaluation.targetUserId === card.userId && evaluation.isActive !== false);
}

function averagedTraitItems(evaluations) {
  const groups = {};
  evaluations.flatMap((evaluation) => evaluation.traits || []).forEach((trait) => {
    if (!groups[trait.key]) groups[trait.key] = [];
    groups[trait.key].push(trait.score);
  });
  return Object.entries(groups).map(([key, scores]) => ({
    key,
    label: evaluationFields.traits.find((field) => field.key === key)?.label || key,
    score: Math.round(average(scores) * 10) / 10,
  }));
}

function scoreItemsForFields(sourceItems, fields) {
  return fields.map((field) => ({
    key: field.key,
    label: field.label,
    score: sourceItems.find((item) => item.key === field.key)?.score,
  }));
}

function reportScoreBlock(title, items) {
  return `
    <section class="report-block">
      <div class="result-section-head">${title}<span>${items.length}</span></div>
      <div class="report-score-grid">
        ${items.map((item) => `<span>${item.label}<strong>${Number.isFinite(item.score) ? item.score : "-"}</strong></span>`).join("")}
      </div>
    </section>
  `;
}

function monthlyMatchCards(card) {
  return userMatchCards(card.userId).filter((matchCard) => (matchCard.generatedAt || "").slice(0, 7) === card.monthKey);
}

function averagedAnalysisScores(cards) {
  const groups = {};
  cards.flatMap((card) => card.analysisScores || []).forEach((item) => {
    if (!groups[item.key]) groups[item.key] = [];
    groups[item.key].push(item.score);
  });
  return Object.entries(groups).map(([key, scores]) => ({
    key,
    label: analysisItemLabel({ key }),
    score: Math.round(average(scores) * 10) / 10,
  }));
}

function monthlyComparisonTemplate(card) {
  const cards = userMonthlyCards(card.userId);
  const currentIndex = cards.findIndex((item) => item.monthKey === card.monthKey);
  const previous = cards[currentIndex + 1];
  if (!previous) return `<div class="style-change"><small>월간 비교</small><p>비교할 이전 월카드가 없습니다.</p></div>`;
  const radarDiffs = Object.keys(card.radarData || {}).map((key) => {
    const diff = (card.radarData?.[key] ?? 0) - (previous.radarData?.[key] ?? 0);
    return `${radarLabel(key)} ${diff > 0 ? "+" : ""}${diff}`;
  }).slice(0, 3);
  return `
    <div class="style-change">
      <small>월간 비교</small>
      <p>${card.monthKey} vs ${previous.monthKey}</p>
      <div class="card-preview-tags">
        <i>OVR ${changeLabel(card.monthlyOVR - previous.monthlyOVR)}</i>
        <i>${positionLabels[previous.mainPosition]?.[0] || "-"} → ${positionLabels[card.mainPosition]?.[0] || "-"}</i>
        <i>${previous.mainPlayStyle || "-"} → ${card.mainPlayStyle || "-"}</i>
        ${radarDiffs.map((item) => `<i>${item}</i>`).join("")}
      </div>
    </div>
  `;
}

function representativeMatchIdentity(card) {
  const evaluations = activeEvaluationsForCard(card);
  const previousCards = userMatchCards(card.userId).filter((item) => item.matchId !== card.matchId);
  const latestEvaluationPosition = evaluations
    .slice()
    .sort((left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime())[0]
    ?.selectedPosition;
  const groups = evaluations.reduce((summary, evaluation) => {
    const position = evaluation.selectedPosition || card.mainEvaluatedPosition;
    if (!summary[position]) {
      summary[position] = {
        position,
        count: 0,
        adaptation: card.positionAdaptation?.[position]?.adaptationRating ?? card.overallRating ?? 0,
        previousCount: previousCards.filter((item) => item.mainEvaluatedPosition === position).length,
        latestAt: 0,
      };
    }
    summary[position].count += 1;
    summary[position].latestAt = Math.max(summary[position].latestAt, new Date(evaluation.updatedAt || evaluation.createdAt).getTime());
    return summary;
  }, {});
  const candidates = Object.values(groups);
  const selected = candidates.length
    ? candidates.sort((left, right) =>
      right.count - left.count
      || right.adaptation - left.adaptation
      || right.previousCount - left.previousCount
      || right.latestAt - left.latestAt,
    )[0]
    : { position: latestEvaluationPosition || card.mainEvaluatedPosition };
  const label = positionLabels[selected.position] || ["-", "-"];
  return {
    position: selected.position,
    label: label[0],
    code: label[1],
    playStyle: card.playStyle || "분석 준비중",
    playStyleCode: card.playStyleCode || "",
  };
}

function participantCommentPreview(card, limit = 3) {
  return receivedComments(card.matchId, card.userId).slice(0, limit);
}

function participantStrengthTags(card, limit = 3) {
  return (card.strengthsTop3 || []).slice(0, limit).map(analysisItemLabel);
}

function largeCardShell({ type, name = "승현", preset = currentAvatarPreset(), kicker, title, subtitle, playStyle, playStyleCode, ovr, change, positionCode, radarData, tags, basis, detailLabel, detailKind, payloadKey, allowDetail = true, showHeader = true }) {
  return `
    ${showHeader ? `<div class="result-title">
      <h3>${type}</h3>
      <button data-close-sheet type="button" aria-label="카드 보기 닫기">×</button>
    </div>` : ""}
    <article class="large-player-card">
      <div class="large-card-identity">
        <div class="large-card-avatar" aria-hidden="true">
          <span class="preset-thumb mini" style="${presetStyle(preset)}"></span>
          <em>${positionCode}</em>
        </div>
        <div class="large-card-copy">
          <p>${kicker}</p>
          <h2>${name}</h2>
          <span>${title}</span>
          <span>${subtitle}</span>
          <strong>${playStyle}</strong>
          <small>${playStyleCode || subtitle}</small>
          <b>OVR ${ovr}<em>${change}</em></b>
        </div>
      </div>
      <div class="large-card-radar">
        <div><strong>핵심 능력 분석</strong><span>${basis}</span></div>
        ${radarPreviewMarkup({ radarData }, true)}
      </div>
      <div class="card-preview-tags">${tags.map((tag) => `<i>${tag}</i>`).join("")}</div>
    </article>
    <div class="large-card-actions">
      ${allowDetail ? `<button class="primary full" data-open-detail="${detailKind}" data-detail-key="${payloadKey}" type="button">${detailLabel}</button>` : ""}
      <button class="secondary full" data-close-sheet type="button">닫기</button>
    </div>
  `;
}

function matchCardViewTemplate(card, options = {}) {
  const identity = representativeMatchIdentity(card);
  const roleInfo = roleMatchInfo(card);
  return largeCardShell({
    type: "MATCH CARD",
    name: displayUserName(card.userId),
    preset: avatarPresetForUser(card.userId),
    kicker: "MATCH CARD",
    title: `${matchTitle(card)} · ${matchDate(card)}`,
    subtitle: `${identity.label} · ${identity.code}`,
    playStyle: identity.playStyle,
    playStyleCode: identity.playStyleCode || "해당 경기 기준",
    ovr: card.overallRating,
    change: changeLabel(card.overallChange),
    positionCode: identity.code,
    radarData: card.radarData || {},
    tags: [roleInfo.type, ...cardTagItems(card)].slice(0, 3),
    basis: "해당 경기 기준",
    detailLabel: "상세 리포트 보기",
    detailKind: "card",
    payloadKey: `${card.matchId}::${card.userId}`,
    allowDetail: options.allowDetail !== false,
    showHeader: options.showHeader !== false,
  });
}

function monthlyCardViewTemplate(card) {
  const [year, month] = card.monthKey.split("-");
  const position = positionLabels[card.mainPosition] || ["-", "-"];
  return largeCardShell({
    type: "MONTHLY CARD",
    name: displayUserName(card.userId),
    preset: avatarPresetForUser(card.userId),
    kicker: "MONTHLY CARD",
    title: `${year}년 ${Number(month)}월 평균`,
    subtitle: `${position[0]} · ${position[1]}`,
    playStyle: card.mainPlayStyle || "분석 준비중",
    playStyleCode: monthlyPositionIdentityText(card),
    ovr: card.monthlyOVR,
    change: changeLabel(card.monthlyOVRChange),
    positionCode: position[1],
    radarData: card.radarData || {},
    tags: [
      `${Number(month)}월 ${card.matchCount}경기`,
      monthlyPositionIdentityText(card),
      ...(card.strengthsSummary || []).slice(0, 2).map((item) => item.label),
    ].slice(0, 3),
    basis: `${year}년 ${Number(month)}월 전체 경기 단순 평균 · 가중치 없음`,
    detailLabel: "월간 리포트 보기",
    detailKind: "monthlyReport",
    payloadKey: `${card.userId}::${card.monthKey}`,
  });
}

function officialAnalysisTemplate(card) {
  const hasPrevious = Number.isFinite(card.previousOverallRating);
  const hasChange = Number.isFinite(card.overallChange);
  const ovrValue = hasPrevious ? `${card.previousOverallRating} → ${card.overallRating}` : `OVR ${card.overallRating}`;
  const trend = hasChange
    ? `${card.overallChange > 0 ? "▲ +" : card.overallChange < 0 ? "▼ " : ""}${card.overallChange}`
    : "-";
  const changes = splitAnalysisChanges(card.analysisChanges);
  const hasAnalysisComparison = Array.isArray(card.analysisChanges) && card.analysisChanges.length > 0;
  const hasSmallOnlyChanges = hasAnalysisComparison
    && Math.max(...card.analysisChanges.map((change) => Math.abs(change.diff || 0))) < 2;
  const evaluations = activeEvaluationsForCard(card);
  const commonItems = scoreItemsForFields(card.analysisScores || [], evaluationFields.common);
  const positionFields = evaluationFields.position[card.mainEvaluatedPosition] || [];
  const positionItems = scoreItemsForFields(card.analysisScores || [], positionFields);
  const traitItems = averagedTraitItems(evaluations);
  const analysisSections = hasAnalysisComparison ? `
      ${hasSmallOnlyChanges ? `<p class="analysis-note">전 경기 대비 큰 변화는 없지만, 세부 항목의 소폭 변화를 표시합니다.</p>` : ""}
      <div class="result-section up">
        <div class="result-section-head">전 경기 대비 상승 TOP3 <span>↗</span></div>
        <div class="result-grid">${renderAnalysisChangeSection(changes.rising, "up", "뚜렷한 상승 항목이 없습니다.")}</div>
      </div>
      <div class="result-section down">
        <div class="result-section-head">전 경기 대비 하락 TOP3 <span>↘</span></div>
        <div class="result-grid">${renderAnalysisChangeSection(changes.falling, "down", "뚜렷한 하락 항목이 없습니다.")}</div>
      </div>
      <p class="analysis-note">※ 최근 60일 내 최근 ${Math.min(4, Math.max(1, (card.analysisChanges?.[0]?.comparisonMatchCount || 1)))}경기 평균 대비 변화량입니다. 경기 카드는 가중 평균을 쓰지 않습니다.</p>
    ` : `
      <p class="analysis-note">비교할 이전 경기 기록이 없어 이번 경기의 주요 강점과 보완점을 표시합니다.</p>
      <div class="result-section up">
        <div class="result-section-head">이번 경기 강점 TOP3 <span>↗</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.strengthsTop3, "up")}</div>
      </div>
      <div class="result-section down">
        <div class="result-section-head">이번 경기 보완점 TOP3 <span>↘</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.weaknessesTop3, "down")}</div>
      </div>
      <p class="analysis-note">※ 동점인 경우 대표 포지션과 플레이유형의 핵심 능력을 우선 표시합니다.</p>
    `;
  return `
      <div class="result-title">
        <h3>POST MATCH REPORT</h3>
        <button data-close-sheet type="button" aria-label="결과창 닫기">×</button>
      </div>
      <p class="result-description">이번 경기 변화 분석 · 최근 60일 내 최근 경기 평균 대비</p>
      <div class="result-overall">
        <div><small>OVR</small><strong>${ovrValue}</strong></div>
        <em>${trend}</em>
      </div>
      <div class="report-summary">
        <span>${positionLabels[card.mainEvaluatedPosition]?.[0] || "-"} · ${positionLabels[card.mainEvaluatedPosition]?.[1] || "-"}</span>
        <strong>${card.playStyle || "분석 준비중"}</strong>
        <small>${matchTitle(card)} · ${matchDate(card)}</small>
      </div>
      <div class="report-radar">${playerCurrentRadarStats(card).map(([label, value]) => `<span>${label}<strong>${value ?? "-"}</strong></span>`).join("")}</div>
      ${reportScoreBlock("공통 평가 전체", commonItems)}
      ${reportScoreBlock("포지션 평가 전체", positionItems)}
      ${reportScoreBlock("선택 평가 전체", traitItems.length ? traitItems : [{ label: "선택 평가 없음", score: null }])}
      ${positionIdentityTemplate(card)}
      ${analysisSections}
      <div class="style-change">
        <small>익명 한 줄 평</small>
        <p>${receivedComments(card.matchId, card.userId).slice(0, 3).map(escapeHtml).join("<br>") || "입력된 한 줄 평이 없습니다."}</p>
      </div>
      <div class="style-change">
        <small>경기 분석 요약</small>
        <p>${card.matchAnalysisText}</p>
      </div>
      <button class="primary full" data-close-sheet type="button">확인</button>
    `;
}

function currentFormAnalysisTemplate(card) {
  const stats = currentHomeStats();
  const position = positionLabels[card.mainEvaluatedPosition] || ["-", "-"];
  const hasPrevious = Number.isFinite(card.previousOverallRating);
  const hasChange = Number.isFinite(card.overallChange);
  const ovrValue = hasPrevious ? `${card.previousOverallRating} → ${card.overallRating}` : `OVR ${card.overallRating}`;
  const trend = hasChange
    ? `${card.overallChange > 0 ? "▲ +" : card.overallChange < 0 ? "▼ " : ""}${card.overallChange}`
    : "-";
  const commonItems = scoreItemsForFields(card.analysisScores || [], evaluationFields.common);
  const positionItems = scoreItemsForFields(card.analysisScores || [], evaluationFields.position[card.mainEvaluatedPosition] || []);
  const traitItems = card.traitItems || [];
  return `
      <div class="result-title">
        <h3>CURRENT FORM ANALYSIS</h3>
        <button data-close-sheet type="button" aria-label="결과창 닫기">×</button>
      </div>
      <p class="result-description">현재 폼 분석 · ${currentFormBasisLabel(stats)}</p>
      <div class="result-overall">
        <div><small>OVR</small><strong>${ovrValue}</strong></div>
        <em>${trend}</em>
      </div>
      <div class="report-summary">
        <span>${position[0]} · ${position[1]}</span>
        <strong>${card.playStyle || "분석 준비중"}</strong>
        <small>최근 60일 내 최대 최근 4경기 기준</small>
      </div>
      <div class="report-radar">${playerCurrentRadarStats(card).map(([label, value]) => `<span>${label}<strong>${value ?? "-"}</strong></span>`).join("")}</div>
      ${reportScoreBlock("최근 폼 공통 평가", commonItems)}
      ${reportScoreBlock("최근 폼 포지션 평가", positionItems)}
      ${reportScoreBlock("최근 폼 선택 성향", traitItems.length ? traitItems : [{ label: "선택 평가 없음", score: null }])}
      ${currentPositionIdentityTemplate(card)}
      <div class="result-section up">
        <div class="result-section-head">현재 폼 강점 TOP3 <span>↗</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.strengthsTop3, "up")}</div>
      </div>
      <div class="result-section down">
        <div class="result-section-head">현재 폼 보완점 TOP3 <span>↘</span></div>
        <div class="result-grid">${renderOfficialResultStats(card.weaknessesTop3, "down")}</div>
      </div>
      <div class="style-change">
        <small>현재 폼 요약</small>
        <p>${card.matchAnalysisText}</p>
      </div>
      <button class="primary full" data-close-sheet type="button">확인</button>
    `;
}

function monthlyReportTemplate(card) {
  const [year, month] = card.monthKey.split("-");
  const change = changeLabel(card.monthlyOVRChange) || "-";
  const position = positionLabels[card.mainPosition]?.[0] || "-";
  const strengths = (card.strengthsSummary || []).slice(0, 3).map((item) => `<i>${item.label}</i>`).join("");
  const matchCards = monthlyMatchCards(card);
  const monthlyScores = averagedAnalysisScores(matchCards);
  const commonItems = scoreItemsForFields(monthlyScores, evaluationFields.common);
  const positionItems = scoreItemsForFields(monthlyScores, evaluationFields.position[card.mainPosition] || []);
  const monthlyEvaluations = matchCards.flatMap((matchCard) => activeEvaluationsForCard(matchCard));
  const traitItems = averagedTraitItems(monthlyEvaluations);
  const weaknesses = (card.weaknessesSummary || []).slice(0, 3).map((item) => `<i>${item.label}</i>`).join("");
  return `
    <div class="result-title">
      <h3>MONTHLY REPORT</h3>
      <button data-close-sheet type="button" aria-label="월 카드 닫기">×</button>
    </div>
    <p class="result-description">MONTHLY CARD · ${year}년 ${Number(month)}월 평균 · 해당 월 경기 단순 평균</p>
    <div class="result-overall">
      <div><small>월간 OVR</small><strong>${card.monthlyOVR}</strong></div>
      <em>${change}</em>
    </div>
    <div class="report-summary">
      <span>${Number(month)}월 ${card.matchCount}경기 기준</span>
      <strong>${card.mainPlayStyle || "분석 준비중"}</strong>
      <small>${position} · 월 단위 누적 평균 · 가중치 없음</small>
    </div>
    <div class="report-radar">${playerCurrentRadarStats(card).map(([label, value]) => `<span>${label}<strong>${value ?? "-"}</strong></span>`).join("")}</div>
    ${reportScoreBlock("월간 공통평가 평균", commonItems)}
    ${reportScoreBlock("월간 포지션평가 평균", positionItems)}
    ${reportScoreBlock("월간 선택평가 평균", traitItems.length ? traitItems : [{ label: "선택 평가 없음", score: null }])}
    ${monthlyPositionDistributionTemplate(card)}
    ${monthlyPositionAdaptationTemplate(card)}
    <div class="style-change">
      <small>월간 강점 요약</small>
      <div class="card-preview-tags">${strengths || "<i>월간 강점 데이터가 쌓이는 중입니다.</i>"}</div>
    </div>
    <div class="style-change">
      <small>월간 보완점 요약</small>
      <div class="card-preview-tags">${weaknesses || "<i>월간 보완점 데이터가 쌓이는 중입니다.</i>"}</div>
    </div>
    ${monthlyComparisonTemplate(card)}
    <p class="analysis-note">${year}년 ${Number(month)}월 전체 경기 단순 평균 기준입니다. 가중치 없음.</p>
    <button class="primary full" data-close-sheet type="button">확인</button>
  `;
}

function matchResultTemplate() {
  const match = activeMatchRecord();
  const pom = window.PlaylogOfficialData?.calculateMatchAward?.(selectedMatchId, "pom");
  const nextStar = window.PlaylogOfficialData?.calculateMatchAward?.(selectedMatchId, "next_star");
  const votes = window.PlaylogOfficialData?.matchAwardVotes || [];
  const awardsEnabled = isAwardVotingEnabled(match);
  const awardBlock = (title, result, type) => {
    const reasons = votes
      .filter((vote) => vote.matchId === selectedMatchId && vote.type === type && vote.reason)
      .map((vote) => `<li>${escapeHtml(vote.reason)}</li>`)
      .join("");
    const winners = result?.winnerUserIds?.length
      ? result.winnerUserIds.map((id) => userNames[id] || id).join(" · ")
      : "공개 후 집계";
    return `<section class="result-section"><div class="result-section-head">${title}<span>${result?.voteCount || 0}표</span></div><p>${winners}</p>${reasons ? `<ul class="result-reasons">${reasons}</ul>` : ""}</section>`;
  };
  const matchDateText = match ? matchDisplayMeta(match) : "경기 정보 없음";
  return `
    <div class="result-title">
      <h3>MATCH RESULT</h3>
      <button data-close-sheet type="button" aria-label="경기 전체 결과 닫기">×</button>
    </div>
    <p class="result-description">오늘 경기 결과 요약입니다. 개인 카드와 상세 분석은 다음 단계에서 확인합니다.</p>
    <section class="match-result-info">
      <small>경기 정보</small>
      <strong>${match?.title || "경기"}</strong>
      <span>${matchDateText}</span>
    </section>
    ${awardsEnabled
      ? `${awardBlock("POM", pom, "pom")}${awardBlock("NEXT STAR · 다음 경기 주인공", nextStar, "next_star")}`
      : `<section class="result-section"><p>이 경기는 POM / 다음 경기 주인공 투표를 사용하지 않았습니다.</p></section>`}
    <button class="primary full" data-open-match-result-detail type="button">경기 상세 결과 보기</button>
  `;
}

function matchResultDetailTemplate() {
  const match = activeMatchRecord();
  const participantIds = match?.participants?.map((participant) => participant.userId) || [];
  const participantCards = (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.matchId === selectedMatchId && isPublishedMatchCard(card))
    .sort((left, right) => {
      const leftIndex = participantIds.indexOf(left.userId);
      const rightIndex = participantIds.indexOf(right.userId);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
  return `
    <div class="result-title">
      <h3>경기 상세 결과</h3>
      <button data-close-sheet type="button" aria-label="경기 상세 결과 닫기">×</button>
    </div>
    <p class="result-description">참가자별 경기 카드를 모바일 리스트로 확인합니다.</p>
    <section class="result-section">
      <div class="result-section-head">참가자 경기 카드 <span>${participantCards.length}</span></div>
      <div class="match-result-cards">${participantCards.map((card) => {
        const identity = representativeMatchIdentity(card);
        return `<button class="match-result-player" data-match-result-card="${card.matchId}" data-card-user="${card.userId}" type="button"><i>${(userNames[card.userId] || "?").slice(0, 1)}</i><span><strong>${userNames[card.userId] || card.userId}</strong><small>${identity.label} · ${identity.code} · ${identity.playStyle}</small></span><b>OVR ${card.overallRating}</b></button>`;
      }).join("") || "<p>공개된 참가자 카드가 아직 없습니다.</p>"}</div>
    </section>
    <button class="secondary full" data-open-match-result-summary type="button">결과 요약으로 돌아가기</button>
  `;
}

function awardSummaryCard(title, result, type) {
  const votes = window.PlaylogOfficialData?.matchAwardVotes || [];
  const winnerIds = result?.winnerUserIds || [];
  const winnerCards = winnerIds.map((winnerId) => (window.PlaylogOfficialData?.playerMatchCards || [])
    .find((card) => card.matchId === selectedMatchId && card.userId === winnerId && isPublishedMatchCard(card))).filter(Boolean);
  const identity = winnerCards[0] ? representativeMatchIdentity(winnerCards[0]) : null;
  const winnerNames = winnerIds.length
    ? winnerIds.map((winnerId) => userNames[winnerId] || winnerId).join(" · ")
    : "공개 후 집계";
  const winnerMeta = identity
    ? `${identity.label} · ${identity.code} · ${identity.playStyle}`
    : "";
  const winnerOvr = winnerCards.length ? winnerCards.map((card) => `OVR ${card.overallRating}`).join(" · ") : "";
  const reasons = votes
    .filter((vote) => vote.matchId === selectedMatchId && vote.type === type)
    .map((vote) => sanitizeOptionalText(vote.reason, [pomReasonPlaceholder, nextStarReasonPlaceholder]))
    .filter(Boolean);
  return `
    <article class="result-award-card">
      <div class="result-award-title">
        <strong>${title}</strong>
        <span>${result?.voteCount || 0}표</span>
      </div>
      <div class="result-award-player">
        <i>${winnerNames.slice(0, 1)}</i>
        <div>
          <b>${winnerNames}</b>
          ${winnerMeta ? `<small>${winnerMeta}</small>` : ""}
          ${winnerOvr ? `<em>${winnerOvr}</em>` : ""}
        </div>
      </div>
      ${reasons.length ? `<div class="result-award-reasons"><small>선정 이유</small>${reasons.map((reason) => `<p>${escapeHtml(reason)}</p>`).join("")}</div>` : ""}
    </article>
  `;
}

function matchResultParticipantCards() {
  const match = activeMatchRecord();
  const participantIds = match?.participants?.map((participant) => participant.userId) || [];
  const cards = (window.PlaylogOfficialData?.playerMatchCards || [])
    .filter((card) => card && card.matchId === selectedMatchId && isPublishedMatchCard(card))
    .sort((left, right) => {
      const leftIndex = participantIds.indexOf(left.userId);
      const rightIndex = participantIds.indexOf(right.userId);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
  if (!cards.length) {
    console.warn("MATCH RESULT 참가자 카드 없음", {
      selectedMatchId,
      matchStatus: match?.status,
      participantIds,
      localCardsForMatch: (window.PlaylogOfficialData?.playerMatchCards || [])
        .filter((card) => card?.matchId === selectedMatchId),
    });
  }
  return cards;
}

function openMatchResultView(mode = "summary", card = null) {
  matchResultMode = mode;
  matchResultSelectedCard = card;
  closeSheet();
  setView("matchResult");
}

function renderMatchResult() {
  const pane = document.querySelector("#matchResultPane");
  const match = activeMatchRecord();
  const pom = window.PlaylogOfficialData?.calculateMatchAward?.(selectedMatchId, "pom");
  const nextStar = window.PlaylogOfficialData?.calculateMatchAward?.(selectedMatchId, "next_star");
  const awardsEnabled = isAwardVotingEnabled(match);
  if (matchResultMode === "card" && matchResultSelectedCard) {
    pane.innerHTML = `
      <div class="match-result-page-head">
        <button class="secondary" data-match-result-mode="detail" type="button">‹ 경기 상세</button>
        <h2>MATCH CARD</h2>
        <p>해당 선수의 경기 카드입니다.</p>
      </div>
      ${matchCardViewTemplate(matchResultSelectedCard, { allowDetail: false, showHeader: false })}
    `;
    bindMatchResultControls(pane);
    return;
  }
  if (matchResultMode === "detail") {
    const cards = matchResultParticipantCards();
    pane.innerHTML = `
      <div class="match-result-page-head">
        <button class="secondary" data-match-result-mode="summary" type="button">‹ 결과 요약</button>
        <h2>경기 결과 상세</h2>
        <p>참가자별 경기 카드를 확인할 수 있습니다.</p>
      </div>
      <div class="match-result-list">
        ${cards.map((card) => {
          const identity = representativeMatchIdentity(card);
          const strengths = participantStrengthTags(card, 3);
          const comments = participantCommentPreview(card, 3);
          return `<button class="match-result-row" data-match-result-page-card="${card.matchId}" data-card-user="${card.userId}" type="button">
            <div class="match-result-row-top"><i>${(userNames[card.userId] || "?").slice(0, 1)}</i><span><strong>${userNames[card.userId] || card.userId}</strong><small>${identity.label} · ${identity.code} · ${identity.playStyle}</small></span><b>OVR ${card.overallRating}</b></div>
            ${strengths.length ? `<div class="match-result-strengths"><small>대표 강점</small>${strengths.map((tag) => `<em>${tag}</em>`).join("")}</div>` : ""}
            ${comments.length ? `<div class="match-result-row-comments">${comments.map((comment) => `<p>${escapeHtml(comment)}</p>`).join("")}</div>` : ""}
          </button>`;
        }).join("") || `<article class="empty-card"><strong>공개된 참가자 카드가 아직 없습니다.</strong></article>`}
      </div>
      <div class="match-result-bottom-actions">
        <button class="primary full" data-go-evaluation-list type="button">경기 선택으로 이동</button>
      </div>
    `;
    bindMatchResultControls(pane);
    return;
  }
  pane.innerHTML = `
    <div class="match-result-page-head center">
      <button class="secondary" data-match-result-back type="button">‹ 돌아가기</button>
      <h2>${match?.title || "경기 결과"}</h2>
      <p>${match ? matchDisplayMeta(match) : "경기 정보 없음"}</p>
    </div>
    ${awardsEnabled
      ? `<div class="match-result-awards">${awardSummaryCard("🏆 POM", pom, "pom")}${awardSummaryCard("★ 다음 경기 주인공", nextStar, "next_star")}</div>`
      : `<article class="result-award-card"><div class="result-award-title"><strong>경기 투표 미사용</strong></div><p>이 경기는 POM / 다음 경기 주인공 투표를 사용하지 않았습니다.</p></article>`}
    <button class="primary full" data-match-result-mode="detail" type="button">경기 결과 상세 보기</button>
    <p class="match-result-footnote">상세 창에서 모든 선수의 경기 카드를 확인할 수 있어요.</p>
  `;
  bindMatchResultControls(pane);
}

function bindMatchResultControls(scope) {
  scope.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      if (matchResultMode === "card") {
        matchResultMode = "detail";
        matchResultSelectedCard = null;
        renderMatchResult();
      }
    });
  });
  scope.querySelectorAll("[data-match-result-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      matchResultMode = button.dataset.matchResultMode;
      renderMatchResult();
    });
  });
  scope.querySelector("[data-match-result-back]")?.addEventListener("click", () => {
    evaluationMode = "list";
    setView("evaluate");
  });
  scope.querySelector("[data-go-evaluation-list]")?.addEventListener("click", () => {
    evaluationMode = "list";
    setView("evaluate");
  });
  scope.querySelectorAll("[data-match-result-page-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = matchResultParticipantCards()
        .find((item) => item.matchId === button.dataset.matchResultPageCard && item.userId === button.dataset.cardUser);
      if (card) {
        matchResultSelectedCard = card;
        matchResultMode = "card";
        renderMatchResult();
      }
    });
  });
}

function renderRadar(target, stats, size = 140) {
  const center = size / 2;
  const detailed = size > 180;
  const maxRadius = size * (detailed ? 0.27 : 0.35);
  const points = stats.map(([, score], index) => {
    const safeScore = Number.isFinite(score) ? score : 0;
    const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
    const radius = (safeScore / 100) * maxRadius;
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
      const displayScore = Number.isFinite(score) ? score : "-";
      return detailed
        ? `<text x="${x}" y="${y}" text-anchor="middle"><tspan x="${x}" dy="-8">${label}</tspan><tspan x="${x}" dy="22">${displayScore}</tspan></text>`
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

function openSheet(kind, payload = null) {
  const overlay = document.querySelector("#overlay");
  const sheet = document.querySelector("#sheet");
  const me = appUser(currentUserId) || {};
  const officialAnalysisCard = payload?.overallRating ? payload : latestHomeAnalysisCard();
  const currentFormCard = currentFormAnalysisCard();
  const monthlyReportCard = payload?.monthKey ? payload : latestHomeMonthlyCard();
  const cardViewCard = payload?.overallRating ? payload : latestHomeAnalysisCard();
  const monthlyViewCard = payload?.monthKey ? payload : latestHomeMonthlyCard();
  const templates = {
    fab: `
      <h3>무엇을 시작할까요?</h3>
      <p>플레이로그의 핵심 행동을 바로 시작합니다.</p>
      <div class="sheet-actions">
        <button class="sheet-action" data-go-sheet="newMatch" type="button">새 경기 추가 <span>＋</span></button>
        <button class="sheet-action" data-go-sheet="evaluate" type="button">평가 진행 <span>›</span></button>
        <button class="sheet-action" data-go-sheet="reflection" type="button">회고 작성 <span>↗</span></button>
      </div>
    `,
    friend: `
      <h3>Playlog ID로 친구 추가</h3>
      <p>친구 추가는 Playlog ID로 검색합니다.</p>
      <label class="field-label"><span>Playlog ID</span><input id="friendPlaylogIdSearch" placeholder="예: rookie10" /></label>
      <button class="primary full" id="searchFriendById" type="button">검색</button>
      <div class="friend-search-result" id="friendSearchResult"></div>
    `,
    profileEdit: `
      <h3>내 프로필 수정</h3>
      <p>플레이로그에서 보이는 내 선수 정보를 수정합니다.</p>
      <label class="field-label"><span>닉네임</span><input id="profileEditNickname" value="${escapeHtml(me.nickname || me.name || "")}" placeholder="닉네임" /></label>
      <label class="field-label"><span>주 포지션</span><select id="profileEditPosition">
        ${Object.entries(positionLabels)
          .filter(([key]) => ["attack", "am", "dm", "defense", "free"].includes(key))
          .map(([key, label]) => `<option value="${key}" ${me.mainPosition === key ? "selected" : ""}>${label[0]} · ${label[1]}</option>`).join("")}
      </select></label>
      <label class="field-label"><span>선호 역할</span><select id="profileEditRole">${signupRoleOptionsHtml(me.mainPosition || "free", me.preferredRole || "")}</select></label>
      <label class="field-label"><span>프로필 프리셋</span><select id="profileEditPreset">
        ${avatarPresetItems().map((preset) => `<option value="${preset.key}" ${me.profilePreset === preset.key ? "selected" : ""}>${preset.label}</option>`).join("")}
      </select></label>
      <div class="profile-edit-actions">
        <button class="secondary full" data-close-sheet type="button">취소</button>
        <button class="primary full" id="saveProfileEdit" type="button">저장</button>
      </div>
    `,
    card: payload?.overallRating ? officialAnalysisTemplate(officialAnalysisCard) : currentFormCard ? currentFormAnalysisTemplate(currentFormCard) : `
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
    cardView: cardViewCard ? matchCardViewTemplate(cardViewCard) : "<h3>MATCH CARD</h3><p>경기 카드 데이터가 아직 없습니다.</p><button class=\"primary full\" data-close-sheet type=\"button\">확인</button>",
    matchResultCardView: cardViewCard ? matchCardViewTemplate(cardViewCard, { allowDetail: false }) : "<h3>MATCH CARD</h3><p>경기 카드 데이터가 아직 없습니다.</p><button class=\"primary full\" data-close-sheet type=\"button\">확인</button>",
    monthlyCardView: monthlyViewCard ? monthlyCardViewTemplate(monthlyViewCard) : "<h3>MONTHLY CARD</h3><p>월 카드 데이터가 아직 없습니다.</p><button class=\"primary full\" data-close-sheet type=\"button\">확인</button>",
    monthlyReport: monthlyReportCard ? monthlyReportTemplate(monthlyReportCard) : "<h3>MONTHLY REPORT</h3><p>월 카드 데이터가 아직 없습니다.</p><button class=\"primary full\" data-close-sheet type=\"button\">확인</button>",
    matchResult: matchResultTemplate(),
    matchResultDetail: matchResultDetailTemplate(),
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
                return `<button class="preset-card ${selectedAvatar === preset.key ? "selected" : ""}" data-avatar="${preset.key}" type="button"><span class="preset-thumb" style="${presetStyle(preset)}"></span><strong>${profilePresetLabels[preset.key] || name}</strong></button>`;
              }).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `,
  };
  sheet.className = `sheet ${["card", "matchResult", "matchResultDetail", "matchResultCardView", "monthlyReport", "cardView", "monthlyCardView"].includes(kind) ? "result-sheet" : ""}`;
  sheet.innerHTML = templates[kind];
  overlay.hidden = false;

  sheet.querySelectorAll("[data-go-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      closeSheet();
      if (button.dataset.goSheet === "evaluate") {
        evaluationMode = "list";
        setView("evaluate");
      } else if (button.dataset.goSheet === "newMatch") {
        resetNewMatchDraft();
        setView("newMatch");
      } else if (button.dataset.goSheet === "reflection") {
        reflectionMode = "list";
        setView("reflection");
      }
      else setView(button.dataset.goSheet);
      showToast(button.dataset.goSheet === "evaluate" ? "경기 평가 리스트로 이동합니다" : button.dataset.goSheet === "newMatch" ? "새 경기를 추가합니다" : "회고 히스토리로 이동합니다");
    });
  });
  sheet.querySelectorAll("[data-toast-sheet]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toastSheet));
  });
  sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  sheet.querySelector("#profileEditPosition")?.addEventListener("change", (event) => {
    const roleSelect = sheet.querySelector("#profileEditRole");
    if (roleSelect) roleSelect.innerHTML = signupRoleOptionsHtml(event.target.value);
  });
  sheet.querySelector("#saveProfileEdit")?.addEventListener("click", () => {
    const user = appUser(currentUserId);
    if (!user) return;
    const nickname = sheet.querySelector("#profileEditNickname")?.value.trim();
    const mainPosition = sheet.querySelector("#profileEditPosition")?.value;
    const preferredRole = sheet.querySelector("#profileEditRole")?.value;
    const profilePreset = sheet.querySelector("#profileEditPreset")?.value;
    if (!nickname) {
      showToast("닉네임을 입력해주세요.");
      return;
    }
    if (!preferredRole) {
      showToast("선호 역할을 선택해주세요.");
      return;
    }
    user.nickname = nickname;
    user.mainPosition = mainPosition;
    user.preferredRole = preferredRole;
    user.profilePreset = profilePreset;
    selectedAvatar = profilePreset;
    closeSheet();
    showToast("프로필을 저장했습니다.");
    renderHome();
    renderFriends();
  });
  sheet.querySelector("[data-open-match-result-detail]")?.addEventListener("click", () => openSheet("matchResultDetail"));
  sheet.querySelector("[data-open-match-result-summary]")?.addEventListener("click", () => openSheet("matchResult"));
  sheet.querySelectorAll("[data-open-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.openDetail === "card") {
        const [matchId, userId] = button.dataset.detailKey.split("::");
        const card = (window.PlaylogOfficialData?.playerMatchCards || [])
          .find((item) => item.matchId === matchId && item.userId === userId && isPublishedMatchCard(item));
        if (card) openSheet("card", card);
      }
      if (button.dataset.openDetail === "monthlyReport") {
        const [userId, monthKey] = button.dataset.detailKey.includes("::")
          ? button.dataset.detailKey.split("::")
          : [currentUserId, button.dataset.detailKey];
        const card = userMonthlyCards(userId).find((item) => item.monthKey === monthKey);
        if (card) openSheet("monthlyReport", card);
      }
    });
  });
  sheet.querySelectorAll("[data-match-result-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = (window.PlaylogOfficialData?.playerMatchCards || [])
        .find((item) => item.matchId === button.dataset.matchResultCard && item.userId === button.dataset.cardUser && isPublishedMatchCard(item));
      if (card) openSheet("matchResultCardView", card);
    });
  });
  sheet.querySelectorAll("[data-avatar]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedAvatar = button.dataset.avatar;
      const user = appUser(currentUserId);
      if (user) user.profilePreset = selectedAvatar;
      applyAvatarPreset();
      closeSheet();
      showToast("프로필 프리셋을 적용했습니다");
      renderHome();
      renderFriends();
    });
  });
  const renderFriendSearchResult = (message) => {
    const result = sheet.querySelector("#friendSearchResult");
    if (result) result.innerHTML = message;
  };
  sheet.querySelector("#searchFriendById")?.addEventListener("click", async () => {
    const query = normalizePlaylogId(sheet.querySelector("#friendPlaylogIdSearch")?.value || "");
    if (!query) {
      renderFriendSearchResult(`<p class="search-message">Playlog ID를 입력해주세요.</p>`);
      return;
    }
    let user = null;
    try {
      user = await findUserByPlaylogIdAsync(query);
    } catch (error) {
      reportSupabaseError(error, "Supabase 사용자 검색 실패");
      renderFriendSearchResult(`<p class="search-message">Supabase 사용자 검색에 실패했습니다. 콘솔 로그를 확인해주세요.</p>`);
      return;
    }
    if (!user || (!canSeeTestUsers() && isHiddenFromPublicSearch(user))) {
      renderFriendSearchResult(`<p class="search-message">해당 Playlog ID의 사용자를 찾을 수 없습니다.</p>`);
      return;
    }
    if (user.id === currentUserId) {
      renderFriendSearchResult(`<p class="search-message">본인은 친구로 추가할 수 없습니다.</p>`);
      return;
    }
    if (user.status !== "approved") {
      renderFriendSearchResult(`<p class="search-message">아직 승인되지 않은 사용자입니다.</p>`);
      return;
    }
    if (isAcceptedFriend(user.id)) {
      renderFriendSearchResult(`<p class="search-message">이미 친구입니다.</p>`);
      return;
    }
    const summary = friendProfileSummary(user.id);
    const positionLabel = positionLabels[user.mainPosition]?.[0] || user.mainPosition || "포지션 준비중";
    const roleLabel = user.preferredRole || summary.style;
    renderFriendSearchResult(`
      <article class="friend-card search-card enhanced-search-card">
        <i>${displayUserName(user.id).slice(0, 1)}</i>
        <div class="search-card-body">
          <strong>${displayUserName(user.id)}</strong>
          <p>@${user.playlogId} · ${positionLabel}</p>
          <div class="search-card-tags"><span>${positionLabel}</span><span>${roleLabel}</span></div>
          <small>${summary.ovr} · ${summary.style}</small>
        </div>
        <button data-confirm-add-friend="${user.id}" type="button"><span>＋</span> 친구 추가</button>
      </article>
    `);
    sheet.querySelector("[data-confirm-add-friend]")?.addEventListener("click", async (event) => {
      const friendUserId = event.currentTarget.dataset.confirmAddFriend;
      try {
        await addFriendAsync({
          userId: currentUserId,
          friendUserId,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        reportSupabaseError(error, "Supabase 친구 추가 실패");
        return;
      }
      renderFriends();
      closeSheet();
      showToast("친구 목록에 추가되었습니다.");
    });
  });
  sheet.querySelectorAll("[data-add-friend]").forEach((button) => button.addEventListener("click", async () => {
    const friendUserId = button.dataset.addFriend;
    try {
      await addFriendAsync({
        userId: currentUserId,
        friendUserId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      reportSupabaseError(error, "Supabase 친구 추가 실패");
      return;
    }
    renderFriends();
    closeSheet();
    showToast("친구 목록에 추가되었습니다.");
  }));
}

function closeSheet() {
  document.querySelector("#overlay").hidden = true;
  document.querySelector("#fab").classList.remove("open");
}

function applyAvatarPreset() {
  const preset = currentAvatarPreset();
  const art = document.querySelector("#profileAvatar");
  art.setAttribute("style", presetStyle(preset));
  art.setAttribute("aria-label", `${preset.label} 캐릭터 프리셋`);
}

function renderHome() {
  const stats = currentHomeStats();
  const analysisCard = currentFormAnalysisCard();
  const monthlyCard = latestHomeMonthlyCard();
  const matchScore = calculateMatchScore(average(Object.values(commonRatings)), average([6.7]));
  const user = appUser(currentUserId);
  const positionKey = stats?.currentMainPosition || user?.mainPosition || representativePosition();
  const position = positionLabels[positionKey];
  const profileKey = { am: "cam", dm: "cdm" }[positionKey] || positionKey;
  const profile = playType(profileKey, tendencies);
  document.querySelector("#homeGreeting").textContent = `안녕하세요, ${displayUserName(currentUserId)}님!`;
  document.querySelector("#profile-title").textContent = displayUserName(currentUserId);
  document.querySelector("#homeCardKicker").textContent = stats?.sourceType === "monthlyFallback" ? "CURRENT FORM · 월카드 대체" : "CURRENT FORM";
  document.querySelector("#homeFormBasis").textContent = currentFormBasisLabel(stats);
  renderActiveMatchProgress();
  document.querySelector("#avatarPicker").classList.toggle("empty-profile", !stats && !user?.profilePreset);
  const change = document.querySelector(".ovr-line .rise");
  document.querySelector("#homeOvr").textContent = stats ? stats.currentOVR : "-";
  if (stats) {
    change.hidden = !Number.isFinite(stats.ovrChange);
    if (Number.isFinite(stats.ovrChange)) {
      change.textContent = stats.ovrChange > 0 ? `▲ +${stats.ovrChange}` : stats.ovrChange < 0 ? `▼ ${stats.ovrChange}` : "- 0";
    }
  } else {
    change.hidden = true;
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
  } else {
    identity.classList.add("pending");
    document.querySelector("#homePlayType").textContent = "분석 준비중";
    document.querySelector("#homePlayTypeSub").textContent = "공식 경기 기록이 쌓이면 표시됩니다.";
    document.querySelector("#homeSupportTags").innerHTML = "";
  }
  applyAvatarPreset();
  renderRadar(document.querySelector("#homeRadar"), stats ? playerCurrentRadarStats(stats) : emptyRadarStats(), 320);
  if (analysisCard) {
    const strengthLabels = analysisCard.strengthsTop3.slice(0, 3).map(analysisItemLabel).join(" · ");
    const weaknessLabels = analysisCard.weaknessesTop3.slice(0, 3).map(analysisItemLabel).join(" · ");
    document.querySelector(".growth-read small").textContent = "CURRENT FORM ANALYSIS";
    document.querySelector(".growth-read strong").textContent = strengthLabels || "현재 폼 분석 준비중";
    document.querySelector(".growth-read p").textContent = `${analysisCard.matchAnalysisText} 보완 포인트: ${weaknessLabels || "추가 데이터 수집 중"}.`;
  } else if (!stats) {
    document.querySelector(".growth-read small").textContent = "CURRENT FORM ANALYSIS";
    document.querySelector(".growth-read strong").textContent = "기록 없음";
    document.querySelector(".growth-read p").textContent = "아직 공식 경기 기록이 없습니다.";
  } else if (stats.sourceType === "monthlyFallback") {
    document.querySelector(".growth-read small").textContent = "CURRENT FORM ANALYSIS";
    document.querySelector(".growth-read strong").textContent = "최근 공식 기록 없음";
    document.querySelector(".growth-read p").textContent = currentFormBasisLabel(stats);
  }
  if (monthlyCard) {
    const monthlyPosition = positionLabels[monthlyCard.mainPosition]?.[0] || "-";
    const monthlyChange = Number.isFinite(monthlyCard.monthlyOVRChange)
      ? `${monthlyCard.monthlyOVRChange > 0 ? "+" : ""}${monthlyCard.monthlyOVRChange}`
      : "-";
    const monthlyStrengths = (monthlyCard.strengthsSummary || []).slice(0, 3).map((item) => item.label).join(" · ");
    const [year, month] = monthlyCard.monthKey.split("-");
    document.querySelector("#homeMonthlyKicker").textContent = `MONTHLY CARD · ${year}년 ${Number(month)}월 평균`;
    document.querySelector("#homeMonthlyTitle").textContent = monthlyCard.mainPlayStyle;
    document.querySelector("#homeMonthlyMeta").hidden = false;
    document.querySelector("#homeMonthlyMeta").innerHTML = `<strong>${monthlyCard.monthlyOVR}</strong><em>지난달 대비 ${monthlyChange}</em><span>${monthlyPosition}</span><span>${Number(month)}월 ${monthlyCard.matchCount}경기 기준</span>`;
    document.querySelector("#homeMonthlyRadar").hidden = true;
    document.querySelector("#homeMonthlyRadar").innerHTML = "";
    document.querySelector("#homeMonthlyPositionText").hidden = false;
    document.querySelector("#homeMonthlyStrengthText").hidden = false;
    document.querySelector("#homeMonthlyDescription").textContent = `이번 달 OVR ${monthlyCard.monthlyOVR}의 ${monthlyCard.mainPlayStyle}로 기록되었습니다.`;
    document.querySelector("#homeMonthlyPositionText").textContent = `${monthlyPosition} 역할로 ${monthlyCard.matchCount}경기를 평가받았습니다.`;
    document.querySelector("#homeMonthlyStrengthText").textContent = monthlyStrengths ? `자주 언급된 강점은 ${monthlyStrengths}입니다.` : "월간 강점 데이터가 쌓이는 중입니다.";
    document.querySelector("#homeMonthlyStrengths").innerHTML = (monthlyCard.strengthsSummary || []).slice(0, 3)
      .map((item) => `<span>${item.label}</span>`).join("");
  } else {
    document.querySelector("#homeMonthlyKicker").textContent = "MONTHLY CARD";
    document.querySelector("#homeMonthlyTitle").textContent = "이번 달 기록이 없습니다.";
    document.querySelector("#homeMonthlyMeta").hidden = true;
    document.querySelector("#homeMonthlyRadar").hidden = true;
    document.querySelector("#homeMonthlyRadar").innerHTML = "";
    document.querySelector("#homeMonthlyDescription").textContent = "공식 경기 카드가 생성되면 월간 요약이 표시됩니다.";
    document.querySelector("#homeMonthlyPositionText").hidden = true;
    document.querySelector("#homeMonthlyStrengthText").hidden = true;
    document.querySelector("#homeMonthlyPositionText").textContent = "";
    document.querySelector("#homeMonthlyStrengthText").textContent = "";
    document.querySelector("#homeMonthlyStrengths").innerHTML = "";
  }
  const recentCards = recentHomeMatchCards();
  if (recentCards.length) {
    document.querySelector("#recentMatches").innerHTML = recentCards.map(homeMatchSummary).join("");
  } else {
    document.querySelector("#recentMatches").innerHTML = `
      <article class="recent-row empty-state-row">
        <div><h3>아직 완료된 경기가 없습니다.</h3><p>첫 경기에 참여하면 기록이 이곳에 쌓입니다.</p></div>
      </article>
    `;
  }
}

function renderStepper() {
  document.querySelector("#stepper").innerHTML = flowSteps.map((_, index) => `<span class="${index < currentStep ? "done" : index === currentStep ? "current" : ""}"></span>`).join("");
}

function enterEvaluationFlow(match) {
  evaluationMode = "flow";
  selectedMatchId = match.id;
  const remaining = matchRemainingTargets(match);
  if (match.status === "published") {
    openMatchResultView("summary");
    return;
  }
  if (currentUserMatchState(match) === "평가완료") {
    loadAwardDraft();
    justCompletedAwards = false;
    currentStep = 7;
    setView("evaluate");
    return;
  }
  if (currentUserMatchState(match) === "투표 필요") {
    loadAwardDraft();
    justCompletedAwards = false;
    currentStep = 6;
    setView("evaluate");
    return;
  }
  if (remaining.length) {
    selectedPlayer = userNames[remaining[0].userId] || remaining[0].userId;
  }
  loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
  loadAwardDraft();
  justCompletedAwards = false;
  currentStep = 0;
  setView("evaluate");
}

function renderEvaluationList() {
  const pane = document.querySelector("#evaluationPane");
  const matches = currentUserMatches();
  document.querySelector(".eval-target").hidden = true;
  document.querySelector("#currentTarget").textContent = "경기 선택";
  document.querySelector(".eval-target").classList.remove("pulse");
  document.querySelector("#stepTitle").textContent = "경기 평가 리스트";
  document.querySelector("#stepHelp").textContent = "참가한 경기의 평가 상태를 확인하고 이어서 진행하세요.";
  document.querySelector("#stepper").innerHTML = "";
  if (!matches.length) {
    pane.innerHTML = `
      <div class="empty-panel evaluation-empty">
        <strong>진행 중인 평가가 없습니다.</strong>
        <p>새 경기에 참여하면 평가를 받을 수 있습니다.</p>
      </div>
    `;
    return;
  }
  pane.innerHTML = `
    <div class="evaluation-match-list">
      ${matches.map((match) => {
        const progress = matchProgress(match);
        const state = currentUserMatchState(match);
        const badge = matchStatusBadge(match);
        const progressText = progress.totalCount ? `${progress.completedCount}/${progress.totalCount} 평가 완료` : "평가 대상 확인 중";
        return `
          <article class="evaluation-match-card">
            <button class="evaluation-match-main" data-evaluation-match="${match.id}" type="button">
              <div>
                <span class="status-badge">${badge}</span>
                <h3>${escapeHtml(match.title || match.id)}</h3>
                <p>${escapeHtml(matchDisplayMeta(match))}</p>
              </div>
              <strong>${state}</strong>
            </button>
            <div class="evaluation-match-footer">
              <span>${progressText}</span>
              <button class="primary small" data-evaluation-match="${match.id}" type="button">${matchActionLabel(match)}</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
  pane.querySelectorAll("[data-evaluation-match]").forEach((button) => {
    button.addEventListener("click", () => {
      const match = matches.find((item) => item.id === button.dataset.evaluationMatch);
      if (match) enterEvaluationFlow(match);
    });
  });
}

function renderEvaluation() {
  if (evaluationMode === "list") {
    renderEvaluationList();
    return;
  }
  document.querySelector(".eval-target").hidden = false;
  const targetPlayers = evaluationTargetPlayers();
  const remainingIds = new Set(
    (window.PlaylogOfficialData?.getRemainingEvaluationTargets?.(selectedMatchId, currentUserId) || targetPlayers)
      .map((player) => player.userId),
  );
  const match = activeMatchRecord();
  const remaining = window.PlaylogOfficialData?.getRemainingEvaluationTargets?.(selectedMatchId, currentUserId) || [];
  const storedPOMVote = window.PlaylogOfficialData?.getMatchAwardVote?.(selectedMatchId, currentUserId, "pom")
    || window.PlaylogOfficialData?.getPOMVote?.(selectedMatchId, currentUserId);
  const storedNextStarVote = window.PlaylogOfficialData?.getMatchAwardVote?.(selectedMatchId, currentUserId, "next_star");
  const hasStoredAwards = Boolean(storedPOMVote && storedNextStarVote);
  const pomSelection = selectedPOMTargetId || storedPOMVote?.targetUserId || null;
  const nextStarSelection = selectedNextStarTargetId || storedNextStarVote?.targetUserId || null;
  if (!selectedPOMTargetId && pomSelection) selectedPOMTargetId = pomSelection;
  if (!selectedNextStarTargetId && nextStarSelection) selectedNextStarTargetId = nextStarSelection;
  if (!pomReason && storedPOMVote?.reason) pomReason = storedPOMVote.reason;
  if (!nextStarReason && storedNextStarVote?.reason) nextStarReason = storedNextStarVote.reason;
  const isAwardStep = currentStep === 6 && Boolean(match) && isAwardVotingEnabled(match) && remaining.length === 0
    && !hasStoredAwards;
  const isJustCompletedAwardStep = currentStep >= 7 && justCompletedAwards;
  if (!targetPlayers.some((player) => player.name === selectedPlayer)) {
    selectedPlayer = targetPlayers[0]?.name || "";
  }
  document.querySelector("#currentTarget").textContent = selectedPlayer;
  document.querySelector(".eval-target").classList.remove("pulse");
  requestAnimationFrame(() => document.querySelector(".eval-target").classList.add("pulse"));
  document.querySelector("#stepTitle").textContent = isAwardStep ? "경기 투표" : currentStep >= 6 ? "평가 저장 완료" : flowSteps[currentStep];
  document.querySelector("#stepHelp").textContent = isAwardStep
    ? "두 선택은 OVR에 영향 없이 결과 공개 때 함께 보여집니다."
    : currentStep === 2 ? "평균은 6점입니다." : "공식 선수카드는 동료 평가만 반영합니다.";
  renderStepper();

  const pane = document.querySelector("#evaluationPane");
  if (match?.status === "published" && !isAwardStep && !isJustCompletedAwardStep) {
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>결과가 공개되었습니다.</h2><p>공개된 경기는 평가를 수정할 수 없습니다.<br>경기 전체 결과에서 선수카드를 확인해주세요.</p><button class="primary full" data-view-published-result type="button">경기 전체 결과 보기</button></div>`;
    pane.querySelector("[data-view-published-result]")?.addEventListener("click", () => openMatchResultView("summary"));
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
      matchId: selectedMatchId,
      userId: selectedPlayerId(),
      evaluations: [buildEvaluation("evaluation:preview")],
    });
    pane.innerHTML = `<label class="field-label evaluation-comment"><span>이 선수 한 줄 평</span><textarea id="evaluationComment" rows="4" placeholder="${evaluationCommentPlaceholder}">${escapeHtml(overallComment)}</textarea></label><div class="self-result"><span>${selectedPlayer} 예상 OVR</span><strong>${previewCard.overallRating}</strong></div>${actions("이전", "평가 저장 완료")}`;
  } else if (isAwardStep) {
    const candidates = targetPlayers;
    pane.innerHTML = `<div class="complete-card award-card"><h2>오늘 가장 인상 깊었던 선수</h2><p>POM은 OVR에 영향을 주지 않으며 결과 공개 시 함께 공개됩니다.</p><div class="selector-grid">${candidates.map((player) => `<button class="choice-card ${pomSelection === player.userId ? "selected" : ""}" data-pom-target="${player.userId}" type="button">${player.name}<br><small>선택하기</small></button>`).join("")}</div><label class="field-label award-reason"><span>POM 선정 이유</span><input id="pomReason" value="${escapeHtml(pomReason)}" placeholder="${pomReasonPlaceholder}" /></label><h2>다음 경기 주인공</h2><p>다음 경기에서 기대되는 선수를 참가자 중 한 명 선택해주세요.</p><div class="selector-grid">${candidates.map((player) => `<button class="choice-card ${nextStarSelection === player.userId ? "selected" : ""}" data-next-star-target="${player.userId}" type="button">${player.name}<br><small>선택하기</small></button>`).join("")}</div><label class="field-label award-reason"><span>다음 경기 주인공 선정 이유</span><input id="nextStarReason" value="${escapeHtml(nextStarReason)}" placeholder="${nextStarReasonPlaceholder}" /></label><button class="primary full" data-submit-awards type="button" ${pomSelection && nextStarSelection ? "" : "disabled"}>투표 저장</button></div>`;
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
    pane.querySelector("[data-submit-awards]")?.addEventListener("click", async () => {
      const finalPomSelection = selectedPOMTargetId || pomSelection;
      const finalNextStarSelection = selectedNextStarTargetId || nextStarSelection;
      const cleanedPomReason = sanitizeOptionalText(pomReason, [pomReasonPlaceholder]);
      const cleanedNextStarReason = sanitizeOptionalText(nextStarReason, [nextStarReasonPlaceholder]);
      try {
        if (!storedPOMVote || storedPOMVote.targetUserId !== finalPomSelection || (storedPOMVote.reason || "") !== cleanedPomReason) {
          await saveMatchAwardVoteAsync({
            matchId: selectedMatchId,
            voterUserId: currentUserId,
            targetUserId: finalPomSelection,
            type: "pom",
            reason: cleanedPomReason,
            createdAt: new Date().toISOString(),
          });
        }
        if (!storedNextStarVote || storedNextStarVote.targetUserId !== finalNextStarSelection || (storedNextStarVote.reason || "") !== cleanedNextStarReason) {
          await saveMatchAwardVoteAsync({
            matchId: selectedMatchId,
            voterUserId: currentUserId,
            targetUserId: finalNextStarSelection,
            type: "next_star",
            reason: cleanedNextStarReason,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        reportSupabaseError(error, "Supabase 경기 투표 저장 실패");
        return;
      }
      showToast("경기 투표가 저장되었습니다");
      justCompletedAwards = true;
      currentStep = 7;
      renderEvaluation();
    });
    return;
  } else {
    const resultReady = !match || match.status === "published";
    const actionLabel = remaining.length ? "다음 선수 평가하기" : resultReady ? "경기 전체 결과 보기" : "공개 대기 상태 보기";
    const awardNote = hasStoredAwards ? "<p>결과 공개 시 선수카드와 투표 결과를 함께 확인할 수 있습니다.</p>" : "";
    const completeTitle = hasStoredAwards ? "경기 평가가 완료되었습니다." : "평가 저장 완료!";
    const completeCopy = resultReady
      ? "결과가 공개되었습니다."
      : "평가가 저장되었습니다.<br>결과 공개를 기다리는 중입니다.";
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>${completeTitle}</h2><p>${completeCopy}</p>${awardNote}<div class="self-result"><span>${selectedPlayer} ${resultReady ? "생성 OVR" : "결과 상태"}</span><strong>${resultReady ? (lastGeneratedCard?.overallRating || "-") : "대기"}</strong></div><button class="primary full" data-complete-action type="button">${actionLabel}</button>${match && remaining.length === 0 ? '<button class="secondary full" data-start-match-reflection type="button">자가 회고도 남길까요?</button>' : ""}</div>`;
    pane.querySelector("[data-complete-action]")?.addEventListener("click", () => {
      if (remaining.length) {
        selectedPlayer = userNames[remaining[0].userId] || remaining[0].userId;
        loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
        resetAwardDraft();
        justCompletedAwards = false;
        currentStep = 0;
        renderEvaluation();
        return;
      }
      if (resultReady) openMatchResultView("summary");
      else setView("home");
    });
    pane.querySelector("[data-start-match-reflection]")?.addEventListener("click", () => startReflection(selectedMatchId));
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
    if (currentStep === 0) {
      evaluationMode = "list";
      renderEvaluation();
      return;
    }
    currentStep = Math.max(0, currentStep - 1);
    renderEvaluation();
  });
  pane.querySelector("[data-skip]")?.addEventListener("click", () => {
    currentStep += 1;
    renderEvaluation();
  });
  pane.querySelector("[data-next]")?.addEventListener("click", async () => {
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
      let savedEvaluation = null;
      try {
        savedEvaluation = await saveEvaluationAsync(evaluation);
        const publishResult = await syncMatchCompletionAndPublish(savedEvaluation);
        lastGeneratedCard = publishResult.generatedCards
          .find((card) => card.userId === savedEvaluation.targetUserId) || null;
      } catch (error) {
        reportSupabaseError(error, "Supabase 평가 완료/공개 처리 실패");
        return;
      }
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
    matchId: selectedMatchId,
    evaluatorUserId: currentUserId,
    targetUserId: selectedPlayerId(),
    selectedPosition,
    overallComment: sanitizeOptionalText(overallComment, [evaluationCommentPlaceholder]),
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
  reflectionMode = "form";
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
  const card = document.querySelector(".reflection-card");
  if (reflectionMode === "list") {
    card.innerHTML = `
      <div class="reflection-list-head">
        <p class="eyebrow purple">개인 회고 카드</p>
        <h2>회고 히스토리</h2>
        <p>내가 생각한 나를 최신순으로 모아봅니다.</p>
        <button class="primary full" data-start-reflection-form type="button">회고 작성하기</button>
      </div>
      <div class="reflection-history list-mode" id="reflectionHistory"></div>
    `;
    renderReflectionHistory();
    card.querySelector("[data-start-reflection-form]")?.addEventListener("click", () => startReflection(null));
    return;
  }
  card.innerHTML = `
    <p class="eyebrow purple">개인 회고 카드</p>
    <h2>내가 생각한 나</h2>
    <p>공식 선수카드와 분리된 자가 기록입니다.</p>
    <p id="reflectionContext">빠른 회고 · 경기 연결 없음</p>
    <h2 id="reflectionStepTitle">포지션 선택</h2>
    <p id="reflectionStepHelp">오늘 내가 수행한 역할을 선택해주세요.</p>
    <div class="stepper" id="reflectionStepper"></div>
    <div id="reflectionPane"></div>
  `;
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
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>자가 회고 저장 완료!</h2><p>공식 선수카드와 분리된 개인 기록으로 저장되었습니다.</p><button class="primary full" data-go-reflection-history type="button">회고 히스토리 보기</button></div>`;
    pane.querySelector("[data-go-reflection-history]")?.addEventListener("click", () => {
      reflectionMode = "list";
      renderReflection();
    });
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
    if (reflectionStep === 0) {
      reflectionMode = "list";
      renderReflection();
      return;
    }
    reflectionStep = Math.max(0, reflectionStep - 1);
    renderReflection();
  });
  pane.querySelector("[data-reflection-next]")?.addEventListener("click", async () => {
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
      try {
        await saveSelfReflectionAsync(buildSelfReflection(`self-reflection:${Date.now()}`));
      } catch (error) {
        reportSupabaseError(error, "Supabase 회고 저장 실패");
        return;
      }
      showToast("개인 회고가 저장되었습니다");
      reflectionStep = reflectionSteps.length;
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
        const positionText = positionLabels[item.selectedPosition]?.[0] || item.selectedPosition || "-";
        const summary = item.nextGoal || item.memo || "아직 다음 목표를 정리하지 않았어요.";
        return `<button class="reflection-history-card" data-reflection-detail="${item.id}" type="button"><div><strong>${date} · ${positionText} · 만족도 ${item.satisfactionScore || "-"}</strong><span>${matchText}</span></div><p>${escapeHtml(summary)}</p></button>`;
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

function renderAuth() {
  const pane = document.querySelector("#authPane");
  if (!pane) return;
  const user = appUser(currentUserId);
  const sampleCard = `
    <article class="landing-player-card">
      <div class="landing-card-art"><span class="preset-thumb mini" style="${presetStyle({ image: avatarSheets.attack, index: 1 })}"></span><em>ST</em></div>
      <div>
        <p>PLAYLOG SAMPLE</p>
        <h2>루키</h2>
        <span>공격수 · ST</span>
        <strong>침투형 공격수</strong>
        <b>OVR 82</b>
        <div class="card-preview-tags"><i>득점력</i><i>침투</i><i>결정력</i></div>
      </div>
    </article>
  `;
  if (!currentUserId && authMode !== "signup") {
    pane.innerHTML = `
      <div class="landing-copy">
        <h1>PLAYLOG</h1>
        <p>경기의 기억을 기록하고,<br>동료들의 평가를 통해 성장하세요.</p>
      </div>
      ${sampleCard}
      <div class="auth-login-box">
        <label>Playlog ID<input id="loginPlaylogId" placeholder="예: rookie10" /></label>
        <label>비밀번호<input id="loginPassword" type="password" inputmode="numeric" maxlength="4" placeholder="숫자 4자리" /></label>
        <button class="primary full" id="loginByPlaylogId" type="button">로그인</button>
        <button class="secondary full" id="openSignup" type="button">회원가입 신청</button>
        <button class="ghost-button" id="quickLoginSeunghyun" type="button">루키 계정으로 로그인 없이 둘러보기</button>
      </div>
    `;
    pane.querySelector("#loginByPlaylogId")?.addEventListener("click", async () => {
      const playlogId = normalizePlaylogId(pane.querySelector("#loginPlaylogId").value);
      const password = pane.querySelector("#loginPassword").value;
      let found = null;
      try {
        found = await findUserByPlaylogIdAsync(playlogId);
      } catch (error) {
        reportSupabaseError(error, "Supabase 로그인 조회 실패");
        return;
      }
      if (!found) {
        showToast("해당 Playlog ID의 사용자를 찾을 수 없습니다.");
        return;
      }
      if ((found.password || "1234") !== password) {
        showToast("비밀번호가 일치하지 않습니다.");
        return;
      }
      await syncSupabaseUserContext(found.id);
      loginAs(found.id);
    });
    pane.querySelector("#openSignup")?.addEventListener("click", () => {
      authMode = "signup";
      renderAuth();
    });
    pane.querySelector("#quickLoginSeunghyun")?.addEventListener("click", startRookieDemoSession);
    return;
  }
  if (user?.status === "pending") {
    pane.innerHTML = `
      <h2>승인 대기 중입니다.</h2>
      <p>관리자 승인 후 PLAYLOG를 사용할 수 있습니다.</p>
      <div class="auth-summary">
        <span>이름 <strong>${escapeHtml(user.name || "-")}</strong></span>
        <span>닉네임 <strong>${escapeHtml(user.nickname || "-")}</strong></span>
        <span>Playlog ID <strong>@${escapeHtml(user.playlogId || "-")}</strong></span>
        <span>주 포지션 <strong>${positionLabels[user.mainPosition]?.[0] || user.mainPosition || "-"}</strong></span>
        <span>선호 역할 <strong>${escapeHtml(user.preferredRole || "-")}</strong></span>
        <span>신청일 <strong>${new Date(user.createdAt).toLocaleDateString("ko-KR")}</strong></span>
      </div>
      ${sampleCard}
      <button class="secondary full" id="backToLanding" type="button">로그인 화면으로</button>
    `;
    pane.querySelector("#backToLanding")?.addEventListener("click", logout);
    return;
  }
  const rejectedCopy = user?.status === "rejected"
    ? `<p class="auth-warning">이전 신청이 거절되었습니다. 정보를 수정해 다시 신청할 수 있습니다.</p>`
    : "";
  pane.innerHTML = `
    <button class="ghost-button auth-back" id="backToLandingFromSignup" type="button">← 이전</button>
    <h2>플레이로그 가입 신청</h2>
    <p>폐쇄형 풋살 커뮤니티에 사용할 선수 프로필을 먼저 만들어주세요.</p>
    ${rejectedCopy}
    <div class="new-match-form auth-form">
      <label>이름<input id="signupName" value="${escapeHtml(user?.name || "")}" placeholder="예: 김루키" /></label>
      <label>닉네임<input id="signupNickname" value="${escapeHtml(user?.nickname || "")}" placeholder="예: 루키" /></label>
      <label>Playlog ID<input id="signupPlaylogId" value="${escapeHtml(user?.playlogId || "")}" placeholder="예: rookie10" /></label>
      <label>비밀번호<input id="signupPassword" type="password" inputmode="numeric" maxlength="4" placeholder="숫자 4자리" /></label>
      <label>주 포지션<select id="signupPosition">${positions.map(([key, label]) => `<option value="${key}" ${user?.mainPosition === key ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <label>선호 역할<select id="signupRole">${signupRoleOptionsHtml(user?.mainPosition || "attack", user?.preferredRole || "")}</select></label>
      <label>한 줄 소개<textarea id="signupBio" rows="3" placeholder="내 플레이 스타일을 짧게 적어주세요.">${escapeHtml(user?.bio || "")}</textarea></label>
      <label>프로필 프리셋<select id="signupPreset">${avatarPresetItems().map((preset) => `<option value="${preset.key}" ${user?.profilePreset === preset.key ? "selected" : ""}>${preset.label}</option>`).join("")}</select></label>
      <button class="primary full" id="submitSignup" type="button">가입 신청하기</button>
    </div>
  `;
  pane.querySelector("#backToLandingFromSignup")?.addEventListener("click", () => {
    currentUserId = null;
    authMode = "landing";
    renderAuth();
  });
  pane.querySelector("#signupPosition")?.addEventListener("change", (event) => {
    const roleSelect = pane.querySelector("#signupRole");
    roleSelect.innerHTML = signupRoleOptionsHtml(event.target.value);
  });
  pane.querySelector("#submitSignup")?.addEventListener("click", async () => {
    const name = pane.querySelector("#signupName").value.trim();
    const nickname = pane.querySelector("#signupNickname").value.trim();
    const playlogId = normalizePlaylogId(pane.querySelector("#signupPlaylogId").value);
    const password = pane.querySelector("#signupPassword").value.trim();
    const preferredRole = pane.querySelector("#signupRole").value;
    if (!name || !nickname) {
      showToast("이름과 닉네임을 입력해주세요.");
      return;
    }
    if (!playlogId) {
      showToast("Playlog ID를 입력해주세요.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(playlogId)) {
      showToast("Playlog ID는 영문, 숫자, 언더바만 사용할 수 있어요.");
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      showToast("비밀번호는 숫자 4자리로 입력해주세요.");
      return;
    }
    let duplicatedUser = null;
    try {
      duplicatedUser = await findUserByPlaylogIdAsync(playlogId);
    } catch (error) {
      reportSupabaseError(error, "Supabase Playlog ID 중복 확인 실패");
      return;
    }
    const duplicated = duplicatedUser && duplicatedUser.id !== currentUserId;
    if (duplicated) {
      showToast("이미 사용 중인 Playlog ID입니다.");
      return;
    }
    if (!preferredRole) {
      showToast("선호 역할을 선택해주세요.");
      return;
    }
    const newUserId = currentUserId || `user:${playlogId}`;
    let saved = null;
    try {
      saved = await saveUserApplicationAsync({
        id: newUserId,
        playlogId,
        name,
        nickname,
        mainPosition: pane.querySelector("#signupPosition").value,
        preferredRole,
        profilePreset: pane.querySelector("#signupPreset").value,
        bio: pane.querySelector("#signupBio").value.trim(),
        password,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      reportSupabaseError(error, "Supabase 회원가입 저장 실패");
      return;
    }
    if (!saved) {
      showToast("이미 사용 중인 Playlog ID입니다.");
      return;
    }
    currentUserId = saved.id;
    selectedAvatar = saved.profilePreset || "free-1";
    authMode = "landing";
    showToast("가입 신청이 완료되었습니다.");
    renderAuth();
  });
}

function renderNewMatch() {
  if (!newMatchDraft) resetNewMatchDraft();
  const pane = document.querySelector("#newMatchPane");
  const candidates = matchParticipantCandidates();
  const friendCandidates = candidates.filter((candidate) => !candidate.locked);
  if (!newMatchDraft.awardVotingTouched) {
    newMatchDraft.awardVotingEnabled = newMatchDraft.participantIds.length >= 4;
  }
  pane.innerHTML = `
    <div class="new-match-form">
      <label>경기명<input id="newMatchTitle" value="${escapeHtml(newMatchDraft.title)}" placeholder="예: 상암 목요 풋살" /></label>
      <label>날짜/시간<input id="newMatchDate" type="datetime-local" value="${escapeHtml(newMatchDraft.date)}" /></label>
      <label>장소<input id="newMatchLocation" value="${escapeHtml(newMatchDraft.location)}" placeholder="예: 상암 풋살장" /></label>
      <section class="new-match-section">
        <strong>친구 선택</strong>
        <p>${candidates.length > 1 ? "친구 목록에서 이번 경기 참가자를 추가합니다. 현재 사용자는 기본 포함됩니다." : "친구를 추가하면 경기 참가자로 선택할 수 있습니다."}</p>
        <div class="participant-select-grid">
          ${candidates.map((candidate) => {
            const selected = newMatchDraft.participantIds.includes(candidate.userId);
            const summary = candidate.locked ? { position: "나", ovr: "기본 포함", style: "PLAYLOG" } : friendProfileSummary(candidate.userId);
            return `<button class="participant-friend-chip ${selected ? "selected" : ""}" data-new-match-participant="${candidate.userId}" type="button" ${candidate.locked ? "disabled" : ""}><i>${candidate.name.slice(0, 1)}</i><span><strong>${candidate.name}${candidate.locked ? " · 나" : ""}</strong><small>${summary.position} · ${summary.ovr}</small></span></button>`;
          }).join("")}
          ${friendCandidates.length ? "" : `<div class="new-match-empty">친구를 1명 이상 추가해야 새 경기를 만들 수 있습니다.</div>`}
        </div>
      </section>
      <section class="new-match-section">
        <strong>평가 마감 시간</strong>
        <div class="deadline-select-grid">
          ${[4, 6, 12, 24].map((hour) => `<button class="chip compact ${newMatchDraft.deadlineHours === hour ? "selected" : ""}" data-new-match-deadline="${hour}" type="button">${hour}시간</button>`).join("")}
        </div>
      </section>
      <section class="new-match-section">
        <div class="new-match-toggle-row">
          <div>
            <strong>POM / 다음 경기 주인공 투표 사용</strong>
            <p>평가 완료 후 오늘의 POM과 다음 경기 주인공을 함께 선택합니다.</p>
          </div>
          <button class="toggle-pill ${newMatchDraft.awardVotingEnabled ? "on" : ""}" data-new-match-awards type="button">${newMatchDraft.awardVotingEnabled ? "ON" : "OFF"}</button>
        </div>
      </section>
      <div class="eval-actions">
        <button class="secondary" data-cancel-new-match type="button">취소</button>
        <button class="primary" data-create-new-match type="button" ${friendCandidates.length ? "" : "disabled"}>경기 생성</button>
      </div>
    </div>
  `;
  pane.querySelector("#newMatchTitle")?.addEventListener("input", (event) => { newMatchDraft.title = event.target.value; });
  pane.querySelector("#newMatchDate")?.addEventListener("input", (event) => { newMatchDraft.date = event.target.value; });
  pane.querySelector("#newMatchLocation")?.addEventListener("input", (event) => { newMatchDraft.location = event.target.value; });
  pane.querySelectorAll("[data-new-match-participant]").forEach((button) => button.addEventListener("click", () => {
    const userId = button.dataset.newMatchParticipant;
    if (userId === currentUserId) return;
    newMatchDraft.participantIds = newMatchDraft.participantIds.includes(userId)
      ? newMatchDraft.participantIds.filter((id) => id !== userId)
      : [...newMatchDraft.participantIds, userId];
    if (!newMatchDraft.awardVotingTouched) {
      newMatchDraft.awardVotingEnabled = newMatchDraft.participantIds.length >= 4;
    }
    renderNewMatch();
  }));
  pane.querySelectorAll("[data-new-match-deadline]").forEach((button) => button.addEventListener("click", () => {
    newMatchDraft.deadlineHours = Number(button.dataset.newMatchDeadline);
    renderNewMatch();
  }));
  pane.querySelector("[data-new-match-awards]")?.addEventListener("click", () => {
    newMatchDraft.awardVotingEnabled = !newMatchDraft.awardVotingEnabled;
    newMatchDraft.awardVotingTouched = true;
    renderNewMatch();
  });
  pane.querySelector("[data-cancel-new-match]")?.addEventListener("click", () => {
    evaluationMode = "list";
    setView("evaluate");
  });
  pane.querySelector("[data-create-new-match]")?.addEventListener("click", async () => {
    const title = newMatchDraft.title.trim();
    const location = newMatchDraft.location.trim();
    const date = fromDatetimeLocalValue(newMatchDraft.date);
    if (!title) {
      showToast("경기명을 입력해주세요.");
      return;
    }
    if (!date) {
      showToast("날짜/시간을 선택해주세요.");
      return;
    }
    if (!friendCandidates.length || newMatchDraft.participantIds.length < 2) {
      showToast("친구를 1명 이상 추가해야 새 경기를 만들 수 있습니다.");
      return;
    }
    if (![4, 6, 12, 24].includes(newMatchDraft.deadlineHours)) {
      showToast("평가 마감 시간을 다시 선택해주세요.");
      return;
    }
    const id = `match:custom:${Date.now()}`;
    let match = null;
    try {
      match = await createMatchAsync({
        id,
        title,
        date,
        location,
        participants: newMatchDraft.participantIds.map((userId) => ({
          userId,
          joinedAt: date,
          evaluationCompleted: false,
        })),
        evaluationDeadlineHours: newMatchDraft.deadlineHours,
        awardVotingEnabled: newMatchDraft.awardVotingEnabled,
        status: "evaluating",
      });
    } catch (error) {
      reportSupabaseError(error, "Supabase 경기 생성 실패");
      return;
    }
    selectedMatchId = match.id;
    newMatchDraft = null;
    evaluationMode = "list";
    showToast("새 경기가 추가되었습니다.");
    setView("evaluate");
  });
}

function renderCards() {
  document.querySelectorAll("[data-card-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.cardTab === activeCardTab);
  });
  const list = document.querySelector("#cardList");
  if (activeCardTab === "monthly") {
    const monthlyCards = userMonthlyCards();
    list.innerHTML = monthlyCards.length
      ? monthlyCards.map(monthlyCardPreview).join("")
      : `<article class="empty-card"><strong>MONTHLY CARD 준비중</strong><p>월간 카드가 생성되면 이곳에 쌓입니다.</p></article>`;
    return;
  }
  const cards = userMatchCards();
  list.innerHTML = cards.length
    ? cards.map((card) => matchCardPreview(card)).join("")
    : `<article class="empty-card"><strong>MATCH CARD 준비중</strong><p>공식 경기 카드가 생성되면 이곳에 쌓입니다.</p></article>`;
}

function renderFriends() {
  if (showingMyProfile) {
    renderMyProfile();
    return;
  }
  if (selectedFriendProfileId) {
    renderFriendProfile(selectedFriendProfileId);
    return;
  }
  const list = friendUsers();
  const pendingUsers = appUser(currentUserId)?.role === "admin"
    ? (window.PlaylogOfficialData?.users || []).filter((user) => user.status === "pending" && !isHiddenFromPublicSearch(user))
    : [];
  const me = appUser(currentUserId);
  const myStats = currentHomeStats();
  const myPosition = positionLabels[me?.mainPosition]?.[0] || "포지션 준비중";
  const highlight = document.querySelector(".friend-highlight");
  highlight.innerHTML = `
    <article class="my-friend-profile">
      <div><span>내 Playlog ID</span><strong>${displayUserName(currentUserId)}</strong><p>@${me?.playlogId || "-"}</p><small>${myPosition} · ${me?.preferredRole || "선호 역할 준비중"} · ${myStats?.currentOVR ? `OVR ${myStats.currentOVR}` : "분석 준비중"}</small><small class="friend-count-line">친구 ${list.length}명</small></div>
      <div class="my-friend-actions">
        <button type="button" id="myProfileOpen">내 프로필 보기</button>
        <button type="button" id="logoutButton">로그아웃</button>
      </div>
    </article>
  `;
  document.querySelector("#myProfileOpen")?.addEventListener("click", () => {
    showingMyProfile = true;
    selectedFriendProfileId = null;
    renderFriends();
  });
  document.querySelector("#logoutButton")?.addEventListener("click", logout);
  document.querySelector("#friendList").innerHTML = `
    ${appUser(currentUserId)?.role === "admin" ? `
      <div class="friend-section-label">관리자 승인</div>
      ${pendingUsers.length
        ? pendingUsers.map((user) => `<article class="friend-card admin-user-card"><i>${displayUserName(user.id).slice(0, 1)}</i><div><strong>${escapeHtml(user.nickname || user.name)}</strong><p>${positionLabels[user.mainPosition]?.[0] || user.mainPosition} · ${escapeHtml(user.preferredRole || "선호 역할 없음")}</p><small>${escapeHtml(user.bio || "소개 없음")}</small></div><div class="admin-actions"><button data-approve-user="${user.id}" type="button">승인</button><button data-reject-user="${user.id}" type="button">거절</button></div></article>`).join("")
        : `<article class="friend-card admin-user-card"><i>✓</i><div><strong>승인 대기 없음</strong><p>현재 pending 사용자가 없습니다.</p></div></article>`}
    ` : ""}
    <div class="friend-section-label">친구 목록</div>
      ${list.length
      ? list.map((friend) => {
        const summary = friendProfileSummary(friend.userId);
        return `<button class="friend-card friend-card-button" data-friend-profile="${friend.userId}" type="button"><i>${friend.name.slice(0, 1)}</i><div><strong>${friend.name}</strong><p>${summary.position} · ${summary.ovr}</p><small>${summary.style}${summary.recentTogether ? " · 최근 함께 경기" : ""}</small></div><span class="friend-profile-arrow" aria-hidden="true">›</span></button>`;
      }).join("")
      : `<article class="friend-card empty-friend-card"><i>＋</i><div><strong>친구가 아직 없습니다.</strong><p>친구를 추가하면 새 경기 참가자로 선택할 수 있어요.</p></div></article>`}
  `;
  document.querySelectorAll("[data-approve-user]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await updateUserStatusAsync(button.dataset.approveUser, "approved", new Date().toISOString());
    } catch (error) {
      reportSupabaseError(error, "Supabase 사용자 승인 실패");
      return;
    }
    showToast("사용자를 승인했습니다.");
    renderFriends();
  }));
  document.querySelectorAll("[data-reject-user]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await updateUserStatusAsync(button.dataset.rejectUser, "rejected");
    } catch (error) {
      reportSupabaseError(error, "Supabase 사용자 거절 실패");
      return;
    }
    showToast("사용자를 거절했습니다.");
    renderFriends();
  }));
  document.querySelectorAll("[data-friend-profile]").forEach((button) => button.addEventListener("click", () => {
    selectedFriendProfileId = button.dataset.friendProfile;
    renderFriends();
  }));
}

function setView(view) {
  document.querySelectorAll(".content-view").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll(".tabbar button").forEach((button) => button.classList.toggle("active", button.dataset.go === view));
  document.querySelector(".hero").hidden = view !== "home";
  document.querySelector(".fab").hidden = view !== "home";
  document.querySelector(".tabbar").hidden = view === "auth";
  if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "instant" });
  if (view === "auth") renderAuth();
  if (view === "home") renderHome();
  if (view === "evaluate") renderEvaluation();
  if (view === "newMatch") renderNewMatch();
  if (view === "cards") renderCards();
  if (view === "matchResult") renderMatchResult();
  if (view === "reflection") renderReflection();
  if (view === "friends") renderFriends();
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const friendProfileMatchButton = event.target.closest("[data-friend-profile-match]");
    if (friendProfileMatchButton) {
      const card = (window.PlaylogOfficialData?.playerMatchCards || [])
        .find((item) => item.matchId === friendProfileMatchButton.dataset.friendProfileMatch && item.userId === friendProfileMatchButton.dataset.cardUser && isPublishedMatchCard(item));
      if (card) openSheet("cardView", card);
      return;
    }
    const friendProfileMonthlyButton = event.target.closest("[data-friend-profile-monthly]");
    if (friendProfileMonthlyButton) {
      const card = userMonthlyCards(friendProfileMonthlyButton.dataset.cardUser)
        .find((item) => item.monthKey === friendProfileMonthlyButton.dataset.friendProfileMonthly);
      if (card) openSheet("monthlyCardView", card);
      return;
    }
    const matchCardButton = event.target.closest("[data-match-card]");
    if (matchCardButton) {
      const card = (window.PlaylogOfficialData?.playerMatchCards || [])
        .find((item) => item.matchId === matchCardButton.dataset.matchCard && item.userId === matchCardButton.dataset.cardUser && isPublishedMatchCard(item));
      if (card) openSheet("cardView", card);
      return;
    }
    const monthlyCardButton = event.target.closest("[data-monthly-card]");
    if (monthlyCardButton) {
      const card = userMonthlyCards().find((item) => item.monthKey === monthlyCardButton.dataset.monthlyCard);
      if (card) openSheet("monthlyCardView", card);
      return;
    }
    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) showToast(toastButton.dataset.toast);
  });
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => {
    if (button.id === "activeMatchAction" && activeMatchRecord()?.status === "published") {
      openMatchResultView("summary");
      return;
    }
    if (button.id === "activeMatchAction" && activeMatchRecord()) {
      enterEvaluationFlow(activeMatchRecord());
      return;
    }
    if (button.dataset.go === "evaluate") {
      evaluationMode = button.id === "activeMatchAction" ? "flow" : "list";
      if (evaluationMode === "flow") {
        loadEvaluationDraft(activeEvaluationForTarget(selectedPlayerId()));
        loadAwardDraft();
        justCompletedAwards = false;
        currentStep = 0;
      }
    }
    if (button.dataset.go === "reflection") {
      reflectionMode = "list";
      setView("reflection");
      return;
    }
    setView(button.dataset.go);
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
    if (!recentOfficialCards(60).length) {
      showToast("아직 분석할 경기 기록이 없습니다.");
      return;
    }
    document.querySelector("#homePlayerCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#homePlayerCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#homePlayerCard").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!recentOfficialCards(60).length) {
        showToast("아직 분석할 경기 기록이 없습니다.");
        return;
      }
      openSheet("card");
    }
  });
  document.querySelectorAll("[data-card-tab]").forEach((button) => button.addEventListener("click", () => {
    activeCardTab = button.dataset.cardTab;
    renderCards();
  }));
  document.querySelector("#officialCard")?.addEventListener("click", () => {
    if (!recentOfficialCards(60).length) {
      showToast("아직 분석할 경기 기록이 없습니다.");
      return;
    }
    document.querySelector("#officialCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#officialCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#overlay").addEventListener("click", (event) => {
    if (event.target.id === "overlay") closeSheet();
  });
}

window.PlaylogApp = {
  loginAs,
  logout,
  renderAuth,
  renderHome,
  renderFriends,
  setView,
};

disableLocalFriendFallback();
disableLocalMatchFallback();
disableLocalEvaluationFallback();
disableLocalAwardVoteFallback();
disableLocalSelfReflectionFallback();
bindInteractions();
if (isCurrentUserApproved()) {
  renderHome();
  renderEvaluation();
  renderReflection();
  renderCards();
  renderFriends();
} else {
  setView("auth");
}

