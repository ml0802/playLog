(function attachOfficialData(root) {
  const engine = root.PlaylogEngine;
  if (!engine) return;

  const matchId = "match:sangam-2026-05-23";
  const userId = "user:seunghyun";
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

  function generateCardFor(match, targetUserId, generatedAt) {
    return engine.generatePlayerMatchCard({
      matchId: match,
      userId: targetUserId,
      evaluations,
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

  function saveEvaluation(evaluation) {
    const storedById = evaluations.find((item) => item.id === evaluation.id);
    if (storedById) return generateCardFor(storedById.matchId, storedById.targetUserId, storedById.updatedAt);

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
    const card = generateCardFor(versionedEvaluation.matchId, versionedEvaluation.targetUserId, versionedEvaluation.updatedAt);
    if (!card) return null;
    const cardIndex = playerMatchCards.findIndex((item) => item && item.id === card.id);
    if (cardIndex >= 0) playerMatchCards[cardIndex] = card;
    else playerMatchCards.push(card);
    generateCurrentStatsFor(versionedEvaluation.targetUserId, versionedEvaluation.updatedAt);
    return card;
  }

  root.PlaylogOfficialData = {
    evaluations,
    playerMatchCards,
    playerCurrentStats,
    selfReviews: [],
    generateCardFor,
    generateCurrentStatsFor,
    saveEvaluation,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
