(function attachOfficialData(root) {
  const engine = root.PlaylogEngine;
  if (!engine) return;

  const matchId = "match:sangam-2026-05-23";
  const userId = "user:seunghyun";
  const evaluationDeadlineOptions = [4, 6, 12, 24];
  const matches = [];
  const matchAwardVotes = [];
  const matchAwardTypes = ["pom", "next_star"];
  const selfReflections = [];
  const testUserFlags = { isTestUser: true, hiddenFromPublicSearch: true };
  const users = [
    { id: "user:admin-ahdfla0802", playlogId: "ahdfla0802", password: "0820", name: "승현", nickname: "승현", status: "approved", role: "admin", mainPosition: "dm", preferredRole: "박스투박스", profilePreset: "cdm-3", bio: "PLAYLOG 운영 관리자", createdAt: "2026-05-30T09:00:00.000Z", approvedAt: "2026-05-30T09:01:00.000Z" },
    { id: "user:seunghyun", playlogId: "seunghyun", password: "1234", name: "이승현", nickname: "승현", status: "approved", role: "user", mainPosition: "dm", preferredRole: "활동형 올라운더", profilePreset: "cdm-3", bio: "중원에서 연결과 압박을 함께 가져가는 플레이어", createdAt: "2026-05-20T08:00:00.000Z", approvedAt: "2026-05-20T08:05:00.000Z", ...testUserFlags },
    { id: "user:minsu", playlogId: "minsu10", password: "1234", name: "김민수", nickname: "김민수", status: "approved", role: "user", mainPosition: "am", preferredRole: "창의형 플레이메이커", profilePreset: "cam-0", bio: "찬스 메이킹을 즐기는 공미", createdAt: "2026-05-20T08:10:00.000Z", approvedAt: "2026-05-20T08:15:00.000Z", ...testUserFlags },
    { id: "user:jihoon", playlogId: "jihoon10", password: "1234", name: "이지훈", nickname: "이지훈", status: "approved", role: "user", mainPosition: "free", preferredRole: "연결형 플레이메이커", profilePreset: "free-1", bio: "흐름을 이어주는 프리롤", createdAt: "2026-05-20T08:20:00.000Z", approvedAt: "2026-05-20T08:25:00.000Z", ...testUserFlags },
    { id: "user:hyunwoo", playlogId: "hyunwoo10", password: "1234", name: "박현우", nickname: "박현우", status: "approved", role: "user", mainPosition: "defense", preferredRole: "빌드업형 수비수", profilePreset: "defense-1", bio: "차분하게 빌드업을 시작하는 수비수", createdAt: "2026-05-20T08:30:00.000Z", approvedAt: "2026-05-20T08:35:00.000Z", ...testUserFlags },
    { id: "user:woojin", playlogId: "woojin10", password: "1234", name: "정우진", nickname: "정우진", status: "approved", role: "user", mainPosition: "attack", preferredRole: "침투형 공격수", profilePreset: "attack-0", bio: "라인 뒤 공간을 노리는 공격수", createdAt: "2026-05-20T08:40:00.000Z", approvedAt: "2026-05-20T08:45:00.000Z", ...testUserFlags },
    { id: "user:sungmin", playlogId: "sungmin10", password: "1234", name: "최성민", nickname: "최성민", status: "approved", role: "user", mainPosition: "dm", preferredRole: "압박형 미드필더", profilePreset: "cdm-1", bio: "활동량과 압박으로 팀 밸런스를 잡는 선수", createdAt: "2026-05-20T08:50:00.000Z", approvedAt: "2026-05-20T08:55:00.000Z", ...testUserFlags },
    { id: "user:rookie-demo", playlogId: "rookie10", password: "1234", name: "김루키", nickname: "루키", status: "approved", role: "user", mainPosition: "attack", preferredRole: "침투형 골게터", profilePreset: "attack-0", bio: "PLAYLOG를 체험 중인 루키입니다.", createdAt: "2026-05-29T09:00:00.000Z", approvedAt: "2026-05-29T09:01:00.000Z", ...testUserFlags },
    { id: "user:qa-pending", playlogId: "pending10", password: "1234", name: "QA 대기", nickname: "테스트루키", status: "pending", role: "user", mainPosition: "free", preferredRole: "연결형 플레이메이커", profilePreset: "free-1", bio: "승인/친구 추가 QA를 위한 대기 유저", createdAt: "2026-05-29T09:00:00.000Z", approvedAt: null, ...testUserFlags },
    { id: "user:qa-first-card", playlogId: "firstcard", password: "1234", name: "QA 첫카드", nickname: "첫카드", status: "approved", role: "user", mainPosition: "dm", preferredRole: "후방 조율자", profilePreset: "cdm-0", bio: "첫 공식 카드 생성 QA 계정", createdAt: "2026-05-29T12:00:00.000Z", approvedAt: "2026-05-29T12:01:00.000Z", ...testUserFlags },
    { id: "user:qa-second-card", playlogId: "secondcard", password: "1234", name: "QA 두번째카드", nickname: "두번째카드", status: "approved", role: "user", mainPosition: "free", preferredRole: "연결형 프리롤", profilePreset: "free-1", bio: "두 번째 카드 누적 QA 계정", createdAt: "2026-05-29T12:05:00.000Z", approvedAt: "2026-05-29T12:06:00.000Z", ...testUserFlags },
  ];
  const friends = [
    { userId, friendUserId: "user:minsu", status: "accepted", createdAt: "2026-05-20T09:00:00.000Z" },
    { userId, friendUserId: "user:jihoon", status: "accepted", createdAt: "2026-05-20T09:05:00.000Z" },
    { userId, friendUserId: "user:hyunwoo", status: "accepted", createdAt: "2026-05-20T09:10:00.000Z" },
    { userId, friendUserId: "user:woojin", status: "accepted", createdAt: "2026-05-20T09:15:00.000Z" },
    { userId, friendUserId: "user:sungmin", status: "accepted", createdAt: "2026-05-20T09:20:00.000Z" },
    { userId: "user:rookie-demo", friendUserId: "user:minsu", status: "accepted", createdAt: "2026-05-29T09:10:00.000Z" },
    { userId: "user:rookie-demo", friendUserId: "user:jihoon", status: "accepted", createdAt: "2026-05-29T09:11:00.000Z" },
    { userId: "user:rookie-demo", friendUserId: "user:hyunwoo", status: "accepted", createdAt: "2026-05-29T09:12:00.000Z" },
  ];
  const baseCommon = {
    activity: 8, decision: 8, stablePass: 8, buildUp: 8, firstTouch: 7,
    dribbleImpact: 6, composure: 8, offTheBall: 7, concentration: 8, stamina: 7,
  };

  function scores(evaluationId, selectedPosition, commonAdjustments, positionValues) {
    const common = { ...baseCommon, ...commonAdjustments };
    return [
      ...Object.entries(common).map(([key, score]) => ({ id: `${evaluationId}:common:${key}`, evaluationId, category: "common", key, score })),
      ...Object.entries(positionValues).map(([key, score]) => ({ id: `${evaluationId}:${selectedPosition}:${key}`, evaluationId, category: "position", key, score })),
    ];
  }

  const evaluations = [
    {
      id: "evaluation:1", matchId, evaluatorUserId: "user:minsu", targetUserId: userId, selectedPosition: "free",
      overallComment: "압박 속에서도 짧게 연결하며 공간을 잘 이어줬다.", createdAt: "2026-05-23T13:04:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-23T13:04:00.000Z",
      scores: scores("evaluation:1", "free", { stablePass: 9, buildUp: 9 }, { allAreaInvolvement: 8, spaceConnection: 9, activityRange: 8, fluidity: 8, allRoundContribution: 8 }),
      traits: [
        { id: "trait:1:teamwork", evaluationId: "evaluation:1", key: "teamwork", score: 9 },
        { id: "trait:1:vision", evaluationId: "evaluation:1", key: "vision", score: 9 },
        { id: "trait:1:creativity", evaluationId: "evaluation:1", key: "creativity", score: 8 },
      ],
      highlights: [{ id: "highlight:1:passSense", evaluationId: "evaluation:1", key: "passSense" }],
    },
    {
      id: "evaluation:2", matchId, evaluatorUserId: "user:jihoon", targetUserId: userId, selectedPosition: "free",
      overallComment: "프리롤 위치에서 패스 선택이 안정적이었다.", createdAt: "2026-05-23T13:08:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-23T13:08:00.000Z",
      scores: scores("evaluation:2", "free", { activity: 7, stablePass: 8 }, { allAreaInvolvement: 8, spaceConnection: 9, activityRange: 7, fluidity: 8, allRoundContribution: 8 }),
      traits: [
        { id: "trait:2:teamwork", evaluationId: "evaluation:2", key: "teamwork", score: 8 },
        { id: "trait:2:vision", evaluationId: "evaluation:2", key: "vision", score: 8 },
      ],
      highlights: [{ id: "highlight:2:ballControl", evaluationId: "evaluation:2", key: "ballControl" }],
    },
    {
      id: "evaluation:3", matchId, evaluatorUserId: "user:hyunwoo", targetUserId: userId, selectedPosition: "am",
      overallComment: "공미로 볼 때도 조율과 연결에서 장점이 있었다.", createdAt: "2026-05-23T13:10:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-23T13:10:00.000Z",
      scores: scores("evaluation:3", "am", { decision: 9, dribbleImpact: 6 }, { chanceMaking: 8, gameControl: 9, creativeBuildUp: 8, pressureEscape: 7, forwardProgression: 8 }),
      traits: [
        { id: "trait:3:creativity", evaluationId: "evaluation:3", key: "creativity", score: 8 },
        { id: "trait:3:vision", evaluationId: "evaluation:3", key: "vision", score: 9 },
      ],
      highlights: [{ id: "highlight:3:passSense", evaluationId: "evaluation:3", key: "passSense" }],
    },
  ];

  const previousCard = {
    overallRating: 78,
    radarData: { activity: 73, gameSense: 76, pass: 79, ballControl: 70, movement: 70, mentality: 78 },
  };
  const rookieCardMatchId1 = "match:rookie-demo-2026-05-18";
  const rookieCardMatchId2 = "match:rookie-demo-2026-05-25";
  const rookieEvaluations = [
    {
      id: "evaluation:rookie:1", matchId: rookieCardMatchId1, evaluatorUserId: "user:minsu", targetUserId: "user:rookie-demo", selectedPosition: "attack",
      overallComment: "침투 타이밍이 좋아서 공격 흐름이 살아났다.", createdAt: "2026-05-18T12:00:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-18T12:00:00.000Z",
      scores: scores("evaluation:rookie:1", "attack", { activity: 8, offTheBall: 8, dribbleImpact: 7 }, { finishing: 8, attackingPositioning: 8, attackingLinkUp: 7, frontPressure: 7, ballKeeping: 7 }),
      traits: [
        { id: "trait:rookie:1:aggression", evaluationId: "evaluation:rookie:1", key: "aggression", score: 8 },
        { id: "trait:rookie:1:boldness", evaluationId: "evaluation:rookie:1", key: "boldness", score: 8 },
      ],
      highlights: [{ id: "highlight:rookie:1:pace", evaluationId: "evaluation:rookie:1", key: "pace" }],
    },
    {
      id: "evaluation:rookie:2", matchId: rookieCardMatchId1, evaluatorUserId: "user:jihoon", targetUserId: "user:rookie-demo", selectedPosition: "attack",
      overallComment: "라인 뒤로 빠지는 움직임이 눈에 띄었다.", createdAt: "2026-05-18T12:05:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-18T12:05:00.000Z",
      scores: scores("evaluation:rookie:2", "attack", { offTheBall: 8, stamina: 8 }, { finishing: 7, attackingPositioning: 8, attackingLinkUp: 7, frontPressure: 8, ballKeeping: 6 }),
      traits: [{ id: "trait:rookie:2:anticipation", evaluationId: "evaluation:rookie:2", key: "anticipation", score: 8 }],
      highlights: [{ id: "highlight:rookie:2:agility", evaluationId: "evaluation:rookie:2", key: "agility" }],
    },
    {
      id: "evaluation:rookie:3", matchId: rookieCardMatchId2, evaluatorUserId: "user:minsu", targetUserId: "user:rookie-demo", selectedPosition: "attack",
      overallComment: "결정력과 전방 압박이 지난 경기보다 좋아졌다.", createdAt: "2026-05-25T12:00:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-25T12:00:00.000Z",
      scores: scores("evaluation:rookie:3", "attack", { activity: 8, decision: 8, offTheBall: 9, stamina: 8 }, { finishing: 9, attackingPositioning: 9, attackingLinkUp: 7, frontPressure: 8, ballKeeping: 7 }),
      traits: [
        { id: "trait:rookie:3:aggression", evaluationId: "evaluation:rookie:3", key: "aggression", score: 9 },
        { id: "trait:rookie:3:boldness", evaluationId: "evaluation:rookie:3", key: "boldness", score: 9 },
      ],
      highlights: [{ id: "highlight:rookie:3:pace", evaluationId: "evaluation:rookie:3", key: "pace" }],
    },
    {
      id: "evaluation:rookie:4", matchId: rookieCardMatchId2, evaluatorUserId: "user:hyunwoo", targetUserId: "user:rookie-demo", selectedPosition: "attack",
      overallComment: "득점 위치를 잡는 감각이 좋았다.", createdAt: "2026-05-25T12:05:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-25T12:05:00.000Z",
      scores: scores("evaluation:rookie:4", "attack", { composure: 8, offTheBall: 9 }, { finishing: 8, attackingPositioning: 9, attackingLinkUp: 8, frontPressure: 8, ballKeeping: 7 }),
      traits: [{ id: "trait:rookie:4:anticipation", evaluationId: "evaluation:rookie:4", key: "anticipation", score: 9 }],
      highlights: [{ id: "highlight:rookie:4:ballControl", evaluationId: "evaluation:rookie:4", key: "ballControl" }],
    },
  ];
  evaluations.push(...rookieEvaluations);
  const qaSecondBaseMatchId = "match:qa-second-card-base-2026-05-20";
  const qaSecondBaseEvaluations = [
    {
      id: "evaluation:qa-second-base:1", matchId: qaSecondBaseMatchId, evaluatorUserId: "user:minsu", targetUserId: "user:qa-second-card", selectedPosition: "dm",
      overallComment: "후방에서 연결과 압박 대응이 안정적이었다.", createdAt: "2026-05-20T12:00:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-20T12:00:00.000Z",
      scores: scores("evaluation:qa-second-base:1", "dm", { stablePass: 8, buildUp: 8, concentration: 8 }, { interception: 7, deepBuildUp: 8, pressureResistance: 8, defensiveCover: 7, pressingTiming: 7 }),
      traits: [{ id: "trait:qa-second-base:1:teamwork", evaluationId: "evaluation:qa-second-base:1", key: "teamwork", score: 8 }],
      highlights: [{ id: "highlight:qa-second-base:1:passSense", evaluationId: "evaluation:qa-second-base:1", key: "passSense" }],
    },
    {
      id: "evaluation:qa-second-base:2", matchId: qaSecondBaseMatchId, evaluatorUserId: "user:jihoon", targetUserId: "user:qa-second-card", selectedPosition: "dm",
      overallComment: "수미 자리에서 공수 밸런스가 좋았다.", createdAt: "2026-05-20T12:03:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-20T12:03:00.000Z",
      scores: scores("evaluation:qa-second-base:2", "dm", { activity: 8, stamina: 8, decision: 8 }, { interception: 8, deepBuildUp: 8, pressureResistance: 7, defensiveCover: 8, pressingTiming: 8 }),
      traits: [{ id: "trait:qa-second-base:2:aggression", evaluationId: "evaluation:qa-second-base:2", key: "aggression", score: 8 }],
      highlights: [{ id: "highlight:qa-second-base:2:physical", evaluationId: "evaluation:qa-second-base:2", key: "physical" }],
    },
    {
      id: "evaluation:qa-second-base:3", matchId: qaSecondBaseMatchId, evaluatorUserId: "user:hyunwoo", targetUserId: "user:qa-second-card", selectedPosition: "free",
      overallComment: "프리롤처럼 넓게 움직이며 연결을 도왔다.", createdAt: "2026-05-20T12:06:00.000Z",
      version: 1, isActive: true, updatedAt: "2026-05-20T12:06:00.000Z",
      scores: scores("evaluation:qa-second-base:3", "free", { offTheBall: 8, stablePass: 8 }, { allAreaInvolvement: 8, spaceConnection: 8, activityRange: 8, fluidity: 7, allRoundContribution: 8 }),
      traits: [{ id: "trait:qa-second-base:3:vision", evaluationId: "evaluation:qa-second-base:3", key: "vision", score: 8 }],
      highlights: [{ id: "highlight:qa-second-base:3:ballControl", evaluationId: "evaluation:qa-second-base:3", key: "ballControl" }],
    },
  ];
  evaluations.push(...qaSecondBaseEvaluations);
  const rookieCard1 = engine.generatePlayerMatchCard({
    matchId: rookieCardMatchId1,
    userId: "user:rookie-demo",
    evaluations,
    generatedAt: "2026-05-18T13:00:00.000Z",
  });
  Object.assign(rookieCard1, {
    playStyle: "침투형 골게터",
    playStyleCode: "Advanced Forward · AF",
  });
  const rookieCard2 = engine.generatePlayerMatchCard({
    matchId: rookieCardMatchId2,
    userId: "user:rookie-demo",
    evaluations,
    previousCards: [rookieCard1],
    generatedAt: "2026-05-25T13:00:00.000Z",
  });
  Object.assign(rookieCard2, {
    playStyle: "침투형 골게터",
    playStyleCode: "Advanced Forward · AF",
  });
  const qaSecondExistingCard = engine.generatePlayerMatchCard({
    matchId: qaSecondBaseMatchId,
    userId: "user:qa-second-card",
    evaluations,
    generatedAt: "2026-05-20T13:00:00.000Z",
  });
  Object.assign(qaSecondExistingCard, {
    playStyle: "연결형 프리롤",
    playStyleCode: "Link Playmaker",
  });

  const playerMatchCards = [
    engine.generatePlayerMatchCard({
      matchId,
      userId,
      evaluations,
      previousCard,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
    rookieCard1,
    rookieCard2,
    qaSecondExistingCard,
  ];
  Object.assign(playerMatchCards[0], {
    mainEvaluatedPosition: "dm",
    playStyle: "활동형 올라운더",
    playStyleCode: "Box To Box Midfielder · BBM",
  });
  const playerCurrentStats = [
    engine.generatePlayerCurrentStats({
      userId,
      cards: playerMatchCards,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
    engine.generatePlayerCurrentStats({
      userId: "user:rookie-demo",
      cards: playerMatchCards,
      generatedAt: "2026-05-25T13:00:00.000Z",
    }),
    engine.generatePlayerCurrentStats({
      userId: "user:qa-second-card",
      cards: playerMatchCards,
      generatedAt: "2026-05-20T13:00:00.000Z",
    }),
  ];
  Object.assign(playerCurrentStats[0], {
    currentPlayStyle: "활동형 올라운더",
    currentMainPosition: "dm",
  });
  Object.assign(playerCurrentStats[1], {
    currentPlayStyle: "침투형 골게터",
    currentMainPosition: "attack",
  });
  Object.assign(playerCurrentStats[2], {
    currentPlayStyle: "연결형 프리롤",
    currentMainPosition: "dm",
  });
  const playerMonthlyCards = [
    engine.generatePlayerMonthlyCard({
      userId,
      monthKey: "2026-05",
      cards: playerMatchCards,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
    engine.generatePlayerMonthlyCard({
      userId: "user:rookie-demo",
      monthKey: "2026-05",
      cards: playerMatchCards,
      generatedAt: "2026-05-25T13:00:00.000Z",
    }),
    engine.generatePlayerMonthlyCard({
      userId: "user:qa-second-card",
      monthKey: "2026-05",
      cards: playerMatchCards,
      generatedAt: "2026-05-20T13:00:00.000Z",
    }),
  ];
  Object.assign(playerMonthlyCards[0], {
    mainPlayStyle: "활동형 올라운더",
    mainPosition: "dm",
  });
  Object.assign(playerMonthlyCards[1], {
    mainPlayStyle: "침투형 골게터",
    mainPosition: "attack",
  });
  Object.assign(playerMonthlyCards[2], {
    mainPlayStyle: "연결형 프리롤",
    mainPosition: "dm",
  });

  function generateCardFor(match, targetUserId, generatedAt) {
    const previousCards = playerMatchCards.filter((card) =>
      card && card.userId === targetUserId && card.matchId !== match,
    );
    return engine.generatePlayerMatchCard({
      matchId: match,
      userId: targetUserId,
      evaluations,
      previousCards,
      generatedAt,
    });
  }

  function generateCurrentStatsFor(targetUserId, generatedAt) {
    const previousStats = playerCurrentStats.find((stats) => stats && stats.userId === targetUserId) || null;
    const stats = engine.generatePlayerCurrentStats({
      userId: targetUserId,
      cards: playerMatchCards,
      previousStats,
      generatedAt,
    });
    if (!stats) return null;
    const statsIndex = playerCurrentStats.findIndex((item) => item && item.userId === targetUserId);
    if (statsIndex >= 0) playerCurrentStats[statsIndex] = stats;
    else playerCurrentStats.push(stats);
    return stats;
  }

  function generateMonthlyCardFor(targetUserId, monthKey, generatedAt) {
    const previousMonthlyCard = playerMonthlyCards
      .filter((card) => card && card.userId === targetUserId && card.monthKey < monthKey)
      .sort((left, right) => right.monthKey.localeCompare(left.monthKey))[0] || null;
    const card = engine.generatePlayerMonthlyCard({
      userId: targetUserId,
      monthKey,
      cards: playerMatchCards,
      previousMonthlyCard,
      generatedAt,
    });
    if (!card) return null;
    const cardIndex = playerMonthlyCards.findIndex((item) =>
      item && item.userId === targetUserId && item.monthKey === monthKey,
    );
    if (cardIndex >= 0) playerMonthlyCards[cardIndex] = card;
    else playerMonthlyCards.push(card);
    return card;
  }

  function calculateEvaluationDeadlineAt(matchDate, deadlineHours = 12) {
    const deadline = new Date(matchDate);
    deadline.setTime(deadline.getTime() + deadlineHours * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  function createMatch({
    id,
    title = "",
    date,
    location = "",
    participants = [],
    evaluationDeadlineHours = 12,
    awardVotingEnabled,
    status = "evaluating",
  }) {
    const deadlineHours = evaluationDeadlineOptions.includes(evaluationDeadlineHours)
      ? evaluationDeadlineHours
      : 12;
    const normalizedParticipants = participants.map((participant) => ({
      userId: typeof participant === "string" ? participant : participant.userId,
      joinedAt: typeof participant === "object" && participant.joinedAt ? participant.joinedAt : date,
      evaluationCompleted: typeof participant === "object" && participant.evaluationCompleted === true,
    }));
    const match = {
      id,
      title,
      date,
      location,
      participants: normalizedParticipants,
      evaluationDeadlineHours: deadlineHours,
      evaluationDeadlineAt: calculateEvaluationDeadlineAt(date, deadlineHours),
      awardVotingEnabled: typeof awardVotingEnabled === "boolean" ? awardVotingEnabled : normalizedParticipants.length >= 4,
      status,
      publishedAt: status === "published" ? date : null,
    };
    const index = matches.findIndex((item) => item.id === id);
    if (index >= 0) matches[index] = match;
    else matches.push(match);
    return match;
  }

  function managedMatch(match) {
    return matches.find((item) => item.id === match) || null;
  }

  function normalizePlaylogId(value = "") {
    return String(value).trim().toLowerCase().replace(/\s+/g, "");
  }

  function findUserByPlaylogId(playlogId) {
    const normalized = normalizePlaylogId(playlogId);
    return users.find((user) => user.playlogId === normalized) || null;
  }

  function addFriend({ userId: ownerUserId, friendUserId, createdAt = new Date().toISOString() }) {
    console.error("PlaylogOfficialData.addFriend local fallback is disabled. Use PlaylogSupabase.addFriend().", {
      userId: ownerUserId,
      friendUserId,
      createdAt,
    });
    throw new Error("친구 추가는 Supabase public.friends insert로만 처리됩니다.");
  }

  function saveUserApplication({
    id = `user:pending:${Date.now()}`,
    playlogId = "",
    name = "",
    nickname = "",
    mainPosition = "free",
    preferredRole = "",
    profilePreset = "free-1",
    bio = "",
    password = "1234",
    createdAt = new Date().toISOString(),
  }) {
    const normalizedPlaylogId = normalizePlaylogId(playlogId);
    if (!normalizedPlaylogId || !/^[a-z0-9_]+$/.test(normalizedPlaylogId)) return null;
    if (users.some((item) => item.playlogId === normalizedPlaylogId && item.id !== id)) return null;
    const user = {
      id,
      playlogId: normalizedPlaylogId,
      password,
      name,
      nickname,
      status: "pending",
      role: "user",
      mainPosition,
      preferredRole,
      profilePreset,
      bio,
      createdAt,
      approvedAt: null,
    };
    const index = users.findIndex((item) => item.id === id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    return user;
  }

  function approveUser(userIdToApprove, approvedAt = new Date().toISOString()) {
    const user = users.find((item) => item.id === userIdToApprove);
    if (!user) return null;
    user.status = "approved";
    user.approvedAt = approvedAt;
    return user;
  }

  function rejectUser(userIdToReject) {
    const user = users.find((item) => item.id === userIdToReject);
    if (!user) return null;
    user.status = "rejected";
    return user;
  }

  function activeEvaluationsForMatch(match) {
    return evaluations.filter((evaluation) =>
      evaluation.matchId === match && evaluation.isActive !== false,
    );
  }

  function getEvaluationTargets(match, currentUserId) {
    const record = managedMatch(match);
    if (!record) return [];
    return record.participants.filter((participant) => participant.userId !== currentUserId);
  }

  function getRemainingEvaluationTargets(match, currentUserId) {
    const submittedTargets = new Set(activeEvaluationsForMatch(match)
      .filter((evaluation) => evaluation.evaluatorUserId === currentUserId)
      .map((evaluation) => evaluation.targetUserId));
    return getEvaluationTargets(match, currentUserId)
      .filter((participant) => !submittedTargets.has(participant.userId));
  }

  function isParticipantEvaluationComplete(match, participantUserId) {
    const record = managedMatch(match);
    if (!record || !record.participants.some((participant) => participant.userId === participantUserId)) return false;
    const expectedTargets = record.participants
      .map((participant) => participant.userId)
      .filter((targetUserId) => targetUserId !== participantUserId);
    const submittedTargets = new Set(activeEvaluationsForMatch(match)
      .filter((evaluation) => evaluation.evaluatorUserId === participantUserId)
      .map((evaluation) => evaluation.targetUserId));
    return expectedTargets.every((targetUserId) => submittedTargets.has(targetUserId));
  }

  function markParticipantEvaluationCompleted(match, participantUserId) {
    const record = managedMatch(match);
    if (!record) return false;
    const participant = record.participants.find((item) => item.userId === participantUserId);
    if (!participant) return false;
    participant.evaluationCompleted = isParticipantEvaluationComplete(match, participantUserId);
    return participant.evaluationCompleted;
  }

  function areAllParticipantsEvaluationsComplete(match) {
    const record = managedMatch(match);
    if (!record || !record.participants.length) return false;
    record.participants.forEach((participant) => markParticipantEvaluationCompleted(match, participant.userId));
    return record.participants.every((participant) => participant.evaluationCompleted);
  }

  function getEvaluationProgress(match) {
    const record = managedMatch(match);
    if (!record) return null;
    record.participants.forEach((participant) => markParticipantEvaluationCompleted(match, participant.userId));
    const completedCount = record.participants.filter((participant) => participant.evaluationCompleted).length;
    return {
      completedCount,
      totalCount: record.participants.length,
      remainingCount: record.participants.length - completedCount,
    };
  }

  function getRemainingParticipantCount(match) {
    return getEvaluationProgress(match)?.remainingCount ?? null;
  }

  function getPublishWaitingStatus(match, now = new Date().toISOString()) {
    const record = managedMatch(match);
    if (!record) return null;
    const remainingParticipantCount = getRemainingParticipantCount(match);
    if (record.status === "published") {
      return { remainingParticipantCount: 0, remainingHours: 0, label: "결과가 공개되었습니다." };
    }
    const timestamp = typeof now === "string" ? now : now.toISOString();
    const remainingMs = Math.max(0, new Date(record.evaluationDeadlineAt).getTime() - new Date(timestamp).getTime());
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    return {
      remainingParticipantCount,
      remainingHours,
      label: `${remainingParticipantCount}명 평가 대기중 · ${remainingHours}시간 후 자동 공개`,
    };
  }

  function getMatchAwardVote(match, voterUserId, type) {
    return matchAwardVotes.find((vote) =>
      vote.matchId === match && vote.voterUserId === voterUserId && vote.type === type,
    ) || null;
  }

  function saveMatchAwardVote({
    matchId: voteMatchId,
    voterUserId,
    targetUserId,
    type,
    reason = "",
    createdAt = new Date().toISOString(),
  }) {
    if (!matchAwardTypes.includes(type)) throw new Error("지원하지 않는 경기 투표 타입입니다.");
    const record = managedMatch(voteMatchId);
    if (!record) throw new Error("등록된 경기만 투표를 저장할 수 있습니다.");
    const participantIds = record.participants.map((participant) => participant.userId);
    if (!participantIds.includes(voterUserId) || !participantIds.includes(targetUserId)) {
      throw new Error("경기 참가자만 투표 대상이 될 수 있습니다.");
    }
    if (voterUserId === targetUserId) {
      throw new Error("본인에게는 투표를 할 수 없습니다.");
    }
    if (!isParticipantEvaluationComplete(voteMatchId, voterUserId)) {
      throw new Error("평가를 완료한 후 투표를 할 수 있습니다.");
    }
    const existingIndex = matchAwardVotes.findIndex((vote) =>
      vote.matchId === voteMatchId && vote.voterUserId === voterUserId && vote.type === type,
    );
    if (record.status === "published" && existingIndex >= 0) {
      throw new Error("공개된 경기의 투표는 수정할 수 없습니다.");
    }
    const vote = { matchId: voteMatchId, voterUserId, targetUserId, type, reason: String(reason).trim(), createdAt };
    if (existingIndex >= 0) matchAwardVotes[existingIndex] = vote;
    else matchAwardVotes.push(vote);
    return vote;
  }

  function calculateMatchAward(match, type) {
    if (!matchAwardTypes.includes(type)) throw new Error("지원하지 않는 경기 투표 타입입니다.");
    const record = managedMatch(match);
    if (!record || record.status !== "published") return null;
    const votes = matchAwardVotes.filter((vote) => vote.matchId === match && vote.type === type);
    if (!votes.length) return { type, winnerUserIds: [], voteCount: 0 };
    const counts = votes.reduce((summary, vote) => {
      summary[vote.targetUserId] = (summary[vote.targetUserId] || 0) + 1;
      return summary;
    }, {});
    const highestVoteCount = Math.max(...Object.values(counts));
    return {
      type,
      winnerUserIds: Object.entries(counts)
        .filter(([, count]) => count === highestVoteCount)
        .map(([targetUserId]) => targetUserId),
      voteCount: votes.length,
    };
  }

  function getPOMVote(match, voterUserId) {
    return getMatchAwardVote(match, voterUserId, "pom");
  }

  function savePOMVote(vote) {
    return saveMatchAwardVote({ ...vote, type: "pom" });
  }

  function calculateMatchPOM(match) {
    const result = calculateMatchAward(match, "pom");
    if (!result) return null;
    return { winnerUserIds: result.winnerUserIds, voteCount: result.voteCount };
  }

  function saveSelfReflection(reflection) {
    const selectedPosition = engine.EVALUATION_FIELDS.position[reflection.selectedPosition]
      ? reflection.selectedPosition
      : "free";
    const commonKeys = new Set(engine.EVALUATION_FIELDS.common.map((field) => field.key));
    const positionKeys = new Set(engine.EVALUATION_FIELDS.position[selectedPosition].map((field) => field.key));
    const traitKeys = new Set(engine.EVALUATION_FIELDS.traits.map((field) => field.key));
    const highlightKeys = new Set(engine.EVALUATION_FIELDS.highlights.map((field) => field.key));
    const savedReflection = {
      id: reflection.id,
      userId: reflection.userId,
      matchId: reflection.matchId || null,
      selectedPosition,
      selfScores: (reflection.selfScores || []).filter((score) =>
        (score.category === "common" && commonKeys.has(score.key))
        || (score.category === "position" && positionKeys.has(score.key)),
      ).map((score) => ({ category: score.category, key: score.key, score: Number(score.score) })),
      selfTraits: (reflection.selfTraits || []).filter((trait) => traitKeys.has(trait.key))
        .map((trait) => ({ key: trait.key, score: Number(trait.score) })),
      selfHighlights: (reflection.selfHighlights || []).filter((highlight) => highlightKeys.has(highlight.key))
        .slice(0, 2).map((highlight) => ({ key: highlight.key })),
      satisfactionScore: Number(reflection.satisfactionScore),
      feltStrength: reflection.feltStrength || "",
      feltWeakness: reflection.feltWeakness || "",
      nextGoal: reflection.nextGoal || "",
      memo: reflection.memo || "",
      createdAt: reflection.createdAt || new Date().toISOString(),
    };
    const existingIndex = selfReflections.findIndex((item) => item.id === savedReflection.id);
    if (existingIndex >= 0) selfReflections[existingIndex] = savedReflection;
    else selfReflections.push(savedReflection);
    return savedReflection;
  }

  function isMatchPublished(match) {
    return managedMatch(match)?.status === "published";
  }

  function canEditEvaluation(match) {
    return !isMatchPublished(match);
  }

  function upsertOfficialCard(match, targetUserId, generatedAt) {
    const card = generateCardFor(match, targetUserId, generatedAt);
    if (!card) return null;
    const cardIndex = playerMatchCards.findIndex((item) => item && item.id === card.id);
    if (cardIndex >= 0) playerMatchCards[cardIndex] = card;
    else playerMatchCards.push(card);
    generateCurrentStatsFor(targetUserId, generatedAt);
    generateMonthlyCardFor(targetUserId, card.generatedAt.slice(0, 7), generatedAt);
    return card;
  }

  function publishMatch(match, now = new Date().toISOString()) {
    const record = managedMatch(match);
    if (!record) return null;
    if (record.status === "published") return record;
    record.participants.forEach((participant) => markParticipantEvaluationCompleted(match, participant.userId));
    record.status = "published";
    record.publishedAt = typeof now === "string" ? now : now.toISOString();
    record.participants
      .filter((participant) => participant.evaluationCompleted)
      .forEach((participant) => upsertOfficialCard(match, participant.userId, record.publishedAt));
    return record;
  }

  function checkAndPublishMatch(match, now = new Date().toISOString()) {
    const record = managedMatch(match);
    if (!record || record.status === "published") return record;
    const timestamp = typeof now === "string" ? now : now.toISOString();
    const allComplete = areAllParticipantsEvaluationsComplete(match);
    if (allComplete || new Date(timestamp).getTime() >= new Date(record.evaluationDeadlineAt).getTime()) {
      return publishMatch(match, timestamp);
    }
    return record;
  }

  function saveEvaluation(evaluation) {
    const record = managedMatch(evaluation.matchId);
    if (record && !canEditEvaluation(evaluation.matchId)) {
      throw new Error("공개된 경기의 평가는 수정할 수 없습니다.");
    }
    const storedById = evaluations.find((item) => item.id === evaluation.id);
    if (storedById) {
      if (!record) return generateCardFor(storedById.matchId, storedById.targetUserId, storedById.updatedAt);
      checkAndPublishMatch(storedById.matchId, storedById.updatedAt);
      return playerMatchCards.find((item) => item && item.matchId === storedById.matchId && item.userId === storedById.targetUserId) || null;
    }

    const sameSubmission = evaluations.filter((item) =>
      item.matchId === evaluation.matchId
      && item.evaluatorUserId === evaluation.evaluatorUserId
      && item.targetUserId === evaluation.targetUserId,
    );
    const timestamp = evaluation.updatedAt || evaluation.createdAt || new Date().toISOString();
    const version = sameSubmission.length
      ? Math.max(...sameSubmission.map((item) => item.version || 1)) + 1
      : 1;
    sameSubmission.filter((item) => item.isActive !== false).forEach((item) => {
      item.isActive = false;
      item.updatedAt = timestamp;
    });
    const versionedEvaluation = { ...evaluation, version, isActive: true, updatedAt: timestamp };
    evaluations.push(versionedEvaluation);
    if (record) {
      markParticipantEvaluationCompleted(versionedEvaluation.matchId, versionedEvaluation.evaluatorUserId);
      checkAndPublishMatch(versionedEvaluation.matchId, versionedEvaluation.updatedAt);
      return playerMatchCards.find((item) =>
        item && item.matchId === versionedEvaluation.matchId && item.userId === versionedEvaluation.targetUserId,
      ) || null;
    }
    const card = generateCardFor(versionedEvaluation.matchId, versionedEvaluation.targetUserId, versionedEvaluation.updatedAt);
    if (!card) return null;
    const cardIndex = playerMatchCards.findIndex((item) => item && item.id === card.id);
    if (cardIndex >= 0) playerMatchCards[cardIndex] = card;
    else playerMatchCards.push(card);
    generateCurrentStatsFor(versionedEvaluation.targetUserId, versionedEvaluation.updatedAt);
    generateMonthlyCardFor(versionedEvaluation.targetUserId, card.generatedAt.slice(0, 7), versionedEvaluation.updatedAt);
    return card;
  }

  const activeEvaluationMatchId = "match:sangam-evaluating-2026-05-28";
  const qaAwardOnMatchId = "match:qa-award-on-2026-05-29";
  const qaAwardOffMatchId = "match:qa-award-off-2026-05-29";
  const rookieActiveMatchId = "match:rookie-active-2026-05-29";
  const qaFirstCardMatchId = "match:qa-first-card-2026-05-29";
  const qaSecondCardMatchId = "match:qa-second-card-2026-05-29";
  function seedLastEvaluatorQA(match, minuteOffset = 0) {
    ["user:seunghyun", "user:minsu", "user:jihoon", "user:hyunwoo"]
      .filter((evaluatorUserId) => evaluatorUserId !== "user:seunghyun")
      .forEach((evaluatorUserId, evaluatorIndex) => {
        ["user:seunghyun", "user:minsu", "user:jihoon", "user:hyunwoo"]
          .filter((targetUserId) => targetUserId !== evaluatorUserId)
          .forEach((targetUserId, targetIndex) => {
            const evaluationId = `evaluation:qa:${match}:${evaluatorUserId}:${targetUserId}`;
            const createdAt = `2026-05-28T09:${String(10 + minuteOffset + evaluatorIndex).padStart(2, "0")}:${String(targetIndex).padStart(2, "0")}.000Z`;
            evaluations.push({
              id: evaluationId,
              matchId: match,
              evaluatorUserId,
              targetUserId,
              selectedPosition: "dm",
              overallComment: "중원에서 활동량과 공수 연결이 안정적이었다.",
              createdAt,
              version: 1,
              isActive: true,
              updatedAt: createdAt,
              scores: scores(evaluationId, "dm", { activity: 8, stamina: 8, decision: 7 }, {
                interception: 7,
                deepBuildUp: 8,
                pressureResistance: 8,
                defensiveCover: 7,
                pressingTiming: 8,
              }),
              traits: [
                { id: `${evaluationId}:trait:aggression`, evaluationId, key: "aggression", score: 8 },
                { id: `${evaluationId}:trait:leadership`, evaluationId, key: "leadership", score: 7 },
                { id: `${evaluationId}:trait:winningMentality`, evaluationId, key: "winningMentality", score: 8 },
              ],
              highlights: [{ id: `${evaluationId}:highlight:physical`, evaluationId, key: "physical" }],
            });
          });
      });
  }
  seedLastEvaluatorQA(activeEvaluationMatchId, 0);
  seedLastEvaluatorQA(qaAwardOnMatchId, 10);
  seedLastEvaluatorQA(qaAwardOffMatchId, 20);
  function seedLastEvaluatorForPendingUser(match, pendingUserId, positionByEvaluator = {}, minuteOffset = 0) {
    const participantIds = [pendingUserId, "user:minsu", "user:jihoon", "user:hyunwoo"];
    participantIds
      .filter((evaluatorUserId) => evaluatorUserId !== pendingUserId)
      .forEach((evaluatorUserId, evaluatorIndex) => {
        participantIds
          .filter((targetUserId) => targetUserId !== evaluatorUserId)
          .forEach((targetUserId, targetIndex) => {
            const targetPosition = targetUserId === pendingUserId
              ? (positionByEvaluator[evaluatorUserId] || "dm")
              : "free";
            const evaluationId = `evaluation:qa-pending:${match}:${evaluatorUserId}:${targetUserId}`;
            const createdAt = `2026-05-29T12:${String(10 + minuteOffset + evaluatorIndex).padStart(2, "0")}:${String(targetIndex).padStart(2, "0")}.000Z`;
            evaluations.push({
              id: evaluationId,
              matchId: match,
              evaluatorUserId,
              targetUserId,
              selectedPosition: targetPosition,
              overallComment: targetUserId === pendingUserId ? "여러 역할을 오가며 팀 흐름에 관여했다." : "연결 플레이가 안정적이었다.",
              createdAt,
              version: 1,
              isActive: true,
              updatedAt: createdAt,
              scores: targetPosition === "attack"
                ? scores(evaluationId, targetPosition, { offTheBall: 8, dribbleImpact: 8, composure: 7 }, { finishing: 8, attackingPositioning: 8, attackingLinkUp: 7, frontPressure: 8, ballKeeping: 7 })
                : targetPosition === "dm"
                  ? scores(evaluationId, targetPosition, { activity: 8, decision: 8, concentration: 8 }, { interception: 8, deepBuildUp: 8, pressureResistance: 8, defensiveCover: 7, pressingTiming: 8 })
                  : scores(evaluationId, targetPosition, { activity: 8, stablePass: 8, buildUp: 8 }, { allAreaInvolvement: 8, spaceConnection: 8, activityRange: 8, fluidity: 8, allRoundContribution: 8 }),
              traits: [
                { id: `${evaluationId}:trait:teamwork`, evaluationId, key: "teamwork", score: 8 },
                { id: `${evaluationId}:trait:vision`, evaluationId, key: "vision", score: 8 },
              ],
              highlights: [{ id: `${evaluationId}:highlight:passSense`, evaluationId, key: "passSense" }],
            });
          });
      });
  }
  seedLastEvaluatorForPendingUser(qaFirstCardMatchId, "user:qa-first-card", {
    "user:minsu": "dm",
    "user:jihoon": "dm",
    "user:hyunwoo": "dm",
  }, 0);
  seedLastEvaluatorForPendingUser(qaSecondCardMatchId, "user:qa-second-card", {
    "user:minsu": "attack",
    "user:jihoon": "dm",
    "user:hyunwoo": "free",
  }, 10);
  ["user:minsu", "user:jihoon", "user:hyunwoo"].forEach((evaluatorUserId, evaluatorIndex) => {
    ["user:rookie-demo", "user:minsu", "user:jihoon", "user:hyunwoo"]
      .filter((targetUserId) => targetUserId !== evaluatorUserId)
      .forEach((targetUserId, targetIndex) => {
        const selectedPosition = targetUserId === "user:rookie-demo" ? "attack" : "free";
        const evaluationId = `evaluation:${rookieActiveMatchId}:${evaluatorUserId}:${targetUserId}`;
        evaluations.push({
          id: evaluationId,
          matchId: rookieActiveMatchId,
          evaluatorUserId,
          targetUserId,
          selectedPosition,
          overallComment: targetUserId === "user:rookie-demo" ? "전방 움직임이 가볍고 침투 타이밍이 좋았다." : "",
          createdAt: `2026-05-29T11:${String(10 + evaluatorIndex * 4 + targetIndex).padStart(2, "0")}:00.000Z`,
          updatedAt: `2026-05-29T11:${String(10 + evaluatorIndex * 4 + targetIndex).padStart(2, "0")}:00.000Z`,
          version: 1,
          isActive: true,
          scores: selectedPosition === "attack"
            ? scores(evaluationId, selectedPosition, { activity: 8, offTheBall: 8, stamina: 8 }, { finishing: 8, attackingPositioning: 9, attackingLinkUp: 7, frontPressure: 8, ballKeeping: 7 })
            : scores(evaluationId, selectedPosition, { activity: 7, stablePass: 8, buildUp: 8 }, { allAreaInvolvement: 7, spaceConnection: 8, activityRange: 7, fluidity: 7, allRoundContribution: 8 }),
          traits: [
            { id: `${evaluationId}:trait:aggression`, evaluationId, key: "aggression", score: 8 },
            { id: `${evaluationId}:trait:boldness`, evaluationId, key: "boldness", score: 8 },
          ],
          highlights: [{ id: `${evaluationId}:highlight:pace`, evaluationId, key: "pace" }],
        });
      });
  });
  createMatch({
    id: rookieCardMatchId1,
    title: "루키 데뷔전",
    date: "2026-05-18T10:00:00.000Z",
    location: "상암 풋살장",
    status: "published",
    participants: ["user:rookie-demo", "user:minsu", "user:jihoon", "user:hyunwoo"],
    awardVotingEnabled: false,
  });
  createMatch({
    id: rookieCardMatchId2,
    title: "루키 성장 경기",
    date: "2026-05-25T10:00:00.000Z",
    location: "망원 풋살장",
    status: "published",
    participants: ["user:rookie-demo", "user:minsu", "user:jihoon", "user:hyunwoo"],
    awardVotingEnabled: false,
  });
  createMatch({
    id: rookieActiveMatchId,
    title: "루키 체험 평가 경기",
    date: "2026-05-31T11:00:00.000Z",
    location: "플레이로그 풋살파크",
    participants: [
      { userId: "user:rookie-demo", joinedAt: "2026-05-31T10:50:00.000Z", evaluationCompleted: false },
      { userId: "user:minsu", joinedAt: "2026-05-31T10:51:00.000Z", evaluationCompleted: true },
      { userId: "user:jihoon", joinedAt: "2026-05-31T10:52:00.000Z", evaluationCompleted: true },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T10:53:00.000Z", evaluationCompleted: true },
    ],
    awardVotingEnabled: true,
  });
  createMatch({
    id: activeEvaluationMatchId,
    title: "상암 목요일 풋살",
    date: "2026-05-31T09:00:00.000Z",
    location: "상암 풋살장",
    participants: [
      { userId: "user:seunghyun", joinedAt: "2026-05-31T08:50:00.000Z" },
      { userId: "user:minsu", joinedAt: "2026-05-31T08:51:00.000Z" },
      { userId: "user:jihoon", joinedAt: "2026-05-31T08:52:00.000Z" },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T08:53:00.000Z" },
    ],
    evaluationDeadlineHours: 12,
    awardVotingEnabled: true,
  });
  createMatch({
    id: qaAwardOnMatchId,
    title: "QA 투표 ON 경기",
    date: "2026-05-31T10:00:00.000Z",
    location: "QA 테스트 풋살장",
    participants: [
      { userId: "user:seunghyun", joinedAt: "2026-05-31T09:50:00.000Z" },
      { userId: "user:minsu", joinedAt: "2026-05-31T09:51:00.000Z" },
      { userId: "user:jihoon", joinedAt: "2026-05-31T09:52:00.000Z" },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T09:53:00.000Z" },
    ],
    evaluationDeadlineHours: 12,
    awardVotingEnabled: true,
  });
  createMatch({
    id: qaAwardOffMatchId,
    title: "QA 투표 OFF 경기",
    date: "2026-05-31T09:30:00.000Z",
    location: "QA 테스트 풋살장",
    participants: [
      { userId: "user:seunghyun", joinedAt: "2026-05-31T09:20:00.000Z" },
      { userId: "user:minsu", joinedAt: "2026-05-31T09:21:00.000Z" },
      { userId: "user:jihoon", joinedAt: "2026-05-31T09:22:00.000Z" },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T09:23:00.000Z" },
    ],
    evaluationDeadlineHours: 12,
    awardVotingEnabled: false,
  });
  createMatch({
    id: qaFirstCardMatchId,
    title: "QA 첫 카드 생성 경기",
    date: "2026-05-31T12:30:00.000Z",
    location: "QA 데이터 풋살장",
    participants: [
      { userId: "user:qa-first-card", joinedAt: "2026-05-31T12:20:00.000Z", evaluationCompleted: false },
      { userId: "user:minsu", joinedAt: "2026-05-31T12:21:00.000Z", evaluationCompleted: true },
      { userId: "user:jihoon", joinedAt: "2026-05-31T12:22:00.000Z", evaluationCompleted: true },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T12:23:00.000Z", evaluationCompleted: true },
    ],
    evaluationDeadlineHours: 12,
    awardVotingEnabled: false,
  });
  createMatch({
    id: qaSecondCardMatchId,
    title: "QA 두 번째 카드 생성 경기",
    date: "2026-05-31T12:50:00.000Z",
    location: "QA 데이터 풋살장",
    participants: [
      { userId: "user:qa-second-card", joinedAt: "2026-05-31T12:40:00.000Z", evaluationCompleted: false },
      { userId: "user:minsu", joinedAt: "2026-05-31T12:41:00.000Z", evaluationCompleted: true },
      { userId: "user:jihoon", joinedAt: "2026-05-31T12:42:00.000Z", evaluationCompleted: true },
      { userId: "user:hyunwoo", joinedAt: "2026-05-31T12:43:00.000Z", evaluationCompleted: true },
    ],
    evaluationDeadlineHours: 12,
    awardVotingEnabled: false,
  });

  root.PlaylogOfficialData = {
    evaluationDeadlineOptions,
    users,
    activeEvaluationMatchId,
    matches,
    friends,
    matchAwardVotes,
    get pomVotes() { return matchAwardVotes.filter((vote) => vote.type === "pom"); },
    evaluations,
    playerMatchCards,
    playerCurrentStats,
    playerMonthlyCards,
    selfReflections,
    generateCardFor,
    generateCurrentStatsFor,
    generateMonthlyCardFor,
    calculateEvaluationDeadlineAt,
    createMatch,
    addFriend,
    findUserByPlaylogId,
    saveUserApplication,
    approveUser,
    rejectUser,
    getEvaluationTargets,
    getRemainingEvaluationTargets,
    getEvaluationProgress,
    getRemainingParticipantCount,
    getPublishWaitingStatus,
    getMatchAwardVote,
    saveMatchAwardVote,
    calculateMatchAward,
    getPOMVote,
    savePOMVote,
    calculateMatchPOM,
    saveSelfReflection,
    markParticipantEvaluationCompleted,
    isParticipantEvaluationComplete,
    areAllParticipantsEvaluationsComplete,
    publishMatch,
    checkAndPublishMatch,
    isMatchPublished,
    canEditEvaluation,
    saveEvaluation,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
