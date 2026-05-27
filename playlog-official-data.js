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

  const playerMatchCards = [
    engine.generatePlayerMatchCard({
      matchId,
      userId,
      evaluations,
      previousCard,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
  ];
  const playerCurrentStats = [
    engine.generatePlayerCurrentStats({
      userId,
      cards: playerMatchCards,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
  ];
  const playerMonthlyCards = [
    engine.generatePlayerMonthlyCard({
      userId,
      monthKey: "2026-05",
      cards: playerMatchCards,
      generatedAt: "2026-05-23T15:00:00.000Z",
    }),
  ];

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
    status = "evaluating",
  }) {
    const deadlineHours = evaluationDeadlineOptions.includes(evaluationDeadlineHours)
      ? evaluationDeadlineHours
      : 12;
    const match = {
      id,
      title,
      date,
      location,
      participants: participants.map((participant) => ({
        userId: typeof participant === "string" ? participant : participant.userId,
        joinedAt: typeof participant === "object" && participant.joinedAt ? participant.joinedAt : date,
        evaluationCompleted: typeof participant === "object" && participant.evaluationCompleted === true,
      })),
      evaluationDeadlineHours: deadlineHours,
      evaluationDeadlineAt: calculateEvaluationDeadlineAt(date, deadlineHours),
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
    const vote = { matchId: voteMatchId, voterUserId, targetUserId, type, createdAt };
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
  createMatch({
    id: activeEvaluationMatchId,
    title: "상암 목요일 풋살",
    date: "2026-05-28T09:00:00.000Z",
    location: "상암 풋살장",
    participants: [
      { userId: "user:seunghyun", joinedAt: "2026-05-27T13:10:00.000Z" },
      { userId: "user:minsu", joinedAt: "2026-05-27T13:12:00.000Z" },
      { userId: "user:jihoon", joinedAt: "2026-05-27T13:14:00.000Z" },
      { userId: "user:hyunwoo", joinedAt: "2026-05-27T13:16:00.000Z" },
    ],
    evaluationDeadlineHours: 12,
  });

  root.PlaylogOfficialData = {
    evaluationDeadlineOptions,
    activeEvaluationMatchId,
    matches,
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
