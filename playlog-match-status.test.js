const assert = require("node:assert/strict");
const engine = require("./playlog-engine.js");
require("./playlog-official-data.js");

const store = globalThis.PlaylogOfficialData;

function evaluation(id, matchId, evaluatorUserId, targetUserId, createdAt, score = 7) {
  return {
    id,
    matchId,
    evaluatorUserId,
    targetUserId,
    selectedPosition: "am",
    overallComment: "",
    createdAt,
    scores: [
      ...engine.EVALUATION_FIELDS.common.map((field) => ({
        id: `${id}:common:${field.key}`, evaluationId: id, category: "common", key: field.key, score,
      })),
      ...engine.EVALUATION_FIELDS.position.am.map((field) => ({
        id: `${id}:position:${field.key}`, evaluationId: id, category: "position", key: field.key, score,
      })),
    ],
    traits: [{ id: `${id}:trait:vision`, evaluationId: id, key: "vision", score: 8 }],
    highlights: [],
  };
}

assert.deepEqual(store.evaluationDeadlineOptions, [4, 6, 12, 24]);
assert.equal(
  store.calculateEvaluationDeadlineAt("2026-05-28T00:00:00.000Z", 12),
  "2026-05-28T12:00:00.000Z",
);

const uxMatch = store.createMatch({
  id: "match:ux-progress",
  title: "참가자 기반 평가 경기",
  date: "2026-05-28T00:00:00.000Z",
  participants: [
    { userId: "user:ux-a", joinedAt: "2026-05-27T10:00:00.000Z" },
    { userId: "user:ux-b", joinedAt: "2026-05-27T10:01:00.000Z" },
    { userId: "user:ux-c", joinedAt: "2026-05-27T10:02:00.000Z" },
  ],
  evaluationDeadlineHours: 12,
});
assert.equal(uxMatch.participants[0].joinedAt, "2026-05-27T10:00:00.000Z");
assert.deepEqual(
  store.getEvaluationTargets(uxMatch.id, "user:ux-a").map((participant) => participant.userId),
  ["user:ux-b", "user:ux-c"],
);
assert.deepEqual(
  store.getRemainingEvaluationTargets(uxMatch.id, "user:ux-a").map((participant) => participant.userId),
  ["user:ux-b", "user:ux-c"],
);
assert.deepEqual(store.getEvaluationProgress(uxMatch.id), {
  completedCount: 0, totalCount: 3, remainingCount: 3,
});
assert.equal(
  store.getPublishWaitingStatus(uxMatch.id, "2026-05-28T06:00:00.000Z").label,
  "3명 평가 대기중 · 6시간 후 자동 공개",
);
store.saveEvaluation(evaluation(
  "evaluation:ux-a-to-b", uxMatch.id, "user:ux-a", "user:ux-b", "2026-05-28T06:10:00.000Z",
));
assert.deepEqual(
  store.getRemainingEvaluationTargets(uxMatch.id, "user:ux-a").map((participant) => participant.userId),
  ["user:ux-c"],
);
store.saveEvaluation(evaluation(
  "evaluation:ux-a-to-c", uxMatch.id, "user:ux-a", "user:ux-c", "2026-05-28T06:20:00.000Z",
));
assert.equal(store.getRemainingEvaluationTargets(uxMatch.id, "user:ux-a").length, 0);
assert.deepEqual(store.getEvaluationProgress(uxMatch.id), {
  completedCount: 1, totalCount: 3, remainingCount: 2,
});
assert.equal(store.getRemainingParticipantCount(uxMatch.id), 2);
store.savePOMVote({
  matchId: uxMatch.id,
  voterUserId: "user:ux-a",
  targetUserId: "user:ux-b",
  createdAt: "2026-05-28T06:30:00.000Z",
});
store.savePOMVote({
  matchId: uxMatch.id,
  voterUserId: "user:ux-a",
  targetUserId: "user:ux-c",
  createdAt: "2026-05-28T06:40:00.000Z",
});
assert.deepEqual(store.pomVotes.filter((vote) => vote.matchId === uxMatch.id), [{
  matchId: uxMatch.id,
  voterUserId: "user:ux-a",
  targetUserId: "user:ux-c",
  type: "pom",
  reason: "",
  createdAt: "2026-05-28T06:40:00.000Z",
}]);
store.saveMatchAwardVote({
  matchId: uxMatch.id,
  voterUserId: "user:ux-a",
  targetUserId: "user:ux-b",
  type: "next_star",
  createdAt: "2026-05-28T06:50:00.000Z",
});
assert.equal(store.matchAwardVotes.filter((vote) =>
  vote.matchId === uxMatch.id && vote.voterUserId === "user:ux-a",
).length, 2);
assert.equal(store.getMatchAwardVote(uxMatch.id, "user:ux-a", "pom").targetUserId, "user:ux-c");
assert.equal(store.getMatchAwardVote(uxMatch.id, "user:ux-a", "next_star").targetUserId, "user:ux-b");

const completionMatch = store.createMatch({
  id: "match:completion",
  title: "전원 완료 경기",
  date: "2026-05-28T00:00:00.000Z",
  participants: ["user:a", "user:b"],
});
assert.equal(completionMatch.evaluationDeadlineHours, 12);
assert.equal(completionMatch.status, "evaluating");
assert.throws(
  () => store.savePOMVote({
    matchId: completionMatch.id,
    voterUserId: "user:a",
    targetUserId: "user:b",
    createdAt: "2026-05-28T00:30:00.000Z",
  }),
  /평가를 완료한 후/,
);
assert.equal(store.saveEvaluation(evaluation(
  "evaluation:a-to-b", completionMatch.id, "user:a", "user:b", "2026-05-28T01:00:00.000Z",
)), null);
assert.equal(store.isParticipantEvaluationComplete(completionMatch.id, "user:a"), true);
assert.equal(store.isParticipantEvaluationComplete(completionMatch.id, "user:b"), false);
assert.equal(completionMatch.status, "evaluating");
assert.equal(store.playerMatchCards.some((card) => card.matchId === completionMatch.id), false);
assert.throws(
  () => store.savePOMVote({
    matchId: completionMatch.id,
    voterUserId: "user:a",
    targetUserId: "user:a",
    createdAt: "2026-05-28T01:10:00.000Z",
  }),
  /본인에게는/,
);
assert.deepEqual(store.savePOMVote({
  matchId: completionMatch.id,
  voterUserId: "user:a",
  targetUserId: "user:b",
  createdAt: "2026-05-28T01:20:00.000Z",
}), {
  matchId: completionMatch.id,
  voterUserId: "user:a",
  targetUserId: "user:b",
  type: "pom",
  reason: "",
  createdAt: "2026-05-28T01:20:00.000Z",
});
assert.equal(store.pomVotes.filter((vote) => vote.matchId === completionMatch.id).length, 1);
assert.equal(store.calculateMatchPOM(completionMatch.id), null);
assert.throws(
  () => store.saveMatchAwardVote({
    matchId: completionMatch.id,
    voterUserId: "user:a",
    targetUserId: "user:a",
    type: "next_star",
    createdAt: "2026-05-28T01:25:00.000Z",
  }),
  /본인에게는/,
);
store.saveMatchAwardVote({
  matchId: completionMatch.id,
  voterUserId: "user:a",
  targetUserId: "user:b",
  type: "next_star",
  reason: "다음 경기에서 기대되는 움직임",
  createdAt: "2026-05-28T01:30:00.000Z",
});
assert.equal(store.getMatchAwardVote(completionMatch.id, "user:a", "next_star").reason, "다음 경기에서 기대되는 움직임");
assert.equal(store.calculateMatchAward(completionMatch.id, "next_star"), null);

const publishedTargetCard = store.saveEvaluation(evaluation(
  "evaluation:b-to-a", completionMatch.id, "user:b", "user:a", "2026-05-28T02:00:00.000Z",
));
assert.equal(completionMatch.status, "published");
assert.equal(completionMatch.publishedAt, "2026-05-28T02:00:00.000Z");
assert.equal(store.areAllParticipantsEvaluationsComplete(completionMatch.id), true);
assert.equal(store.isMatchPublished(completionMatch.id), true);
assert.equal(store.canEditEvaluation(completionMatch.id), false);
assert.equal(publishedTargetCard.userId, "user:a");
assert.equal(store.playerMatchCards.filter((card) => card.matchId === completionMatch.id).length, 2);
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:a"), true);
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:b"), true);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:a" && card.monthKey === "2026-05"), true);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:b" && card.monthKey === "2026-05"), true);
assert.equal(store.selfReflections.length, 0);
store.savePOMVote({
  matchId: completionMatch.id,
  voterUserId: "user:b",
  targetUserId: "user:a",
  createdAt: "2026-05-28T02:10:00.000Z",
});
assert.deepEqual(store.calculateMatchPOM(completionMatch.id), {
  winnerUserIds: ["user:b", "user:a"],
  voteCount: 2,
});
store.saveMatchAwardVote({
  matchId: completionMatch.id,
  voterUserId: "user:b",
  targetUserId: "user:a",
  type: "next_star",
  createdAt: "2026-05-28T02:12:00.000Z",
});
assert.deepEqual(store.calculateMatchAward(completionMatch.id, "next_star"), {
  type: "next_star",
  winnerUserIds: ["user:b", "user:a"],
  voteCount: 2,
});
assert.equal(store.selfReflections.length, 0);
assert.equal(store.playerMatchCards.filter((card) => card.matchId === completionMatch.id).length, 2);
assert.throws(
  () => store.savePOMVote({
    matchId: completionMatch.id,
    voterUserId: "user:a",
    targetUserId: "user:b",
    createdAt: "2026-05-28T02:20:00.000Z",
  }),
  /공개된 경기의 투표/,
);
assert.throws(
  () => store.saveMatchAwardVote({
    matchId: completionMatch.id,
    voterUserId: "user:a",
    targetUserId: "user:b",
    type: "next_star",
    createdAt: "2026-05-28T02:30:00.000Z",
  }),
  /공개된 경기의 투표/,
);
assert.throws(
  () => store.saveEvaluation(evaluation(
    "evaluation:a-to-b:v2", completionMatch.id, "user:a", "user:b", "2026-05-28T03:00:00.000Z", 9,
  )),
  /공개된 경기/,
);

const unmanagedCardAfterPublish = store.saveEvaluation(evaluation(
  "evaluation:legacy-open", "match:legacy-unmanaged", "user:legacy-evaluator", "user:legacy-target", "2026-05-28T03:30:00.000Z",
));
assert.equal(unmanagedCardAfterPublish.matchId, "match:legacy-unmanaged");
assert.equal(unmanagedCardAfterPublish.userId, "user:legacy-target");
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:legacy-target"), true);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:legacy-target" && card.monthKey === "2026-05"), true);

const deadlineMatch = store.createMatch({
  id: "match:deadline",
  title: "마감 공개 경기",
  date: "2026-05-28T00:00:00.000Z",
  participants: ["user:done", "user:partial", "user:waiting"],
  evaluationDeadlineHours: 4,
});
store.saveEvaluation(evaluation(
  "evaluation:done-to-partial", deadlineMatch.id, "user:done", "user:partial", "2026-05-28T01:00:00.000Z",
));
store.saveEvaluation(evaluation(
  "evaluation:done-to-waiting", deadlineMatch.id, "user:done", "user:waiting", "2026-05-28T01:10:00.000Z",
));
store.saveEvaluation(evaluation(
  "evaluation:partial-to-done", deadlineMatch.id, "user:partial", "user:done", "2026-05-28T01:20:00.000Z",
));
assert.equal(store.isParticipantEvaluationComplete(deadlineMatch.id, "user:done"), true);
assert.equal(store.isParticipantEvaluationComplete(deadlineMatch.id, "user:partial"), false);
assert.equal(store.checkAndPublishMatch(deadlineMatch.id, "2026-05-28T03:59:59.000Z").status, "evaluating");
store.checkAndPublishMatch(deadlineMatch.id, "2026-05-28T04:00:00.000Z");
assert.equal(deadlineMatch.status, "published");
assert.equal(deadlineMatch.publishedAt, "2026-05-28T04:00:00.000Z");
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:done"), true);
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:partial"), false);
assert.equal(store.playerMatchCards.some((card) => card.matchId === deadlineMatch.id && card.userId === "user:waiting"), false);
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:done"), true);
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:partial"), false);
assert.equal(store.playerCurrentStats.some((stats) => stats.userId === "user:waiting"), false);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:done" && card.monthKey === "2026-05"), true);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:partial" && card.monthKey === "2026-05"), false);
assert.equal(store.playerMonthlyCards.some((card) => card.userId === "user:waiting" && card.monthKey === "2026-05"), false);

const defaultDeadlineMatch = store.createMatch({
  id: "match:default-deadline",
  date: "2026-05-28T00:00:00.000Z",
  participants: ["user:one", "user:two"],
  evaluationDeadlineHours: 99,
});
assert.equal(defaultDeadlineMatch.evaluationDeadlineHours, 12);
assert.equal(defaultDeadlineMatch.evaluationDeadlineAt, "2026-05-28T12:00:00.000Z");

console.log("playlog-match-status tests passed");
