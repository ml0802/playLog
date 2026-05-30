import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function officialData() {
  window.PlaylogOfficialData = window.PlaylogOfficialData || {};
  window.PlaylogOfficialData.users = window.PlaylogOfficialData.users || [];
  window.PlaylogOfficialData.friends = window.PlaylogOfficialData.friends || [];
  window.PlaylogOfficialData.matches = window.PlaylogOfficialData.matches || [];
  window.PlaylogOfficialData.evaluations = window.PlaylogOfficialData.evaluations || [];
  window.PlaylogOfficialData.playerMatchCards = window.PlaylogOfficialData.playerMatchCards || [];
  window.PlaylogOfficialData.playerCurrentStats = window.PlaylogOfficialData.playerCurrentStats || [];
  window.PlaylogOfficialData.playerMonthlyCards = window.PlaylogOfficialData.playerMonthlyCards || [];
  window.PlaylogOfficialData.matchAwardVotes = window.PlaylogOfficialData.matchAwardVotes || [];
  window.PlaylogOfficialData.selfReflections = window.PlaylogOfficialData.selfReflections || [];
  return window.PlaylogOfficialData;
}

function fromUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    playlogId: row.playlog_id,
    name: row.name,
    nickname: row.nickname,
    status: row.status,
    role: row.role,
    mainPosition: row.main_position,
    preferredRole: row.preferred_role,
    profilePreset: row.profile_preset,
    bio: row.bio,
    password: row.password,
    isTestUser: row.is_test_user,
    hiddenFromPublicSearch: row.hidden_from_public_search,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  };
}

function toUserRow(user) {
  return {
    id: user.id,
    playlog_id: user.playlogId,
    name: user.name,
    nickname: user.nickname,
    status: user.status || "pending",
    role: user.role || "user",
    main_position: user.mainPosition || null,
    preferred_role: user.preferredRole || null,
    profile_preset: user.profilePreset || null,
    bio: user.bio || "",
    password: user.password || "1234",
    is_test_user: Boolean(user.isTestUser),
    hidden_from_public_search: Boolean(user.hiddenFromPublicSearch),
    created_at: user.createdAt || new Date().toISOString(),
    approved_at: user.approvedAt || null,
  };
}

function fromFriendRow(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    friendUserId: row.friend_user_id,
    status: row.status || "accepted",
    createdAt: row.created_at,
  };
}

function toFriendRow(friend) {
  return {
    user_id: friend.userId,
    friend_user_id: friend.friendUserId,
    status: friend.status || "accepted",
    created_at: friend.createdAt || new Date().toISOString(),
  };
}

function calculateEvaluationDeadlineAt(matchDate, deadlineHours = 12) {
  const deadline = new Date(matchDate);
  deadline.setTime(deadline.getTime() + deadlineHours * 60 * 60 * 1000);
  return deadline.toISOString();
}

function normalizeMatchParticipants(match) {
  return (match.participants || []).map((participant) => ({
    userId: typeof participant === "string" ? participant : participant.userId,
    joinedAt: typeof participant === "object" && participant.joinedAt ? participant.joinedAt : match.date,
    evaluationCompleted: typeof participant === "object" && participant.evaluationCompleted === true,
  }));
}

function fromMatchRow(row, participantRows = []) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || "",
    date: row.date,
    location: row.location || "",
    participants: participantRows
      .filter((participant) => participant.match_id === row.id)
      .map(fromMatchParticipantRow),
    evaluationDeadlineHours: row.evaluation_deadline_hours || 12,
    evaluationDeadlineAt: row.evaluation_deadline_at,
    awardVotingEnabled: row.award_voting_enabled !== false,
    status: row.status || "evaluating",
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

function toMatchRow(match) {
  const deadlineHours = Number(match.evaluationDeadlineHours) || 12;
  return {
    id: match.id,
    title: match.title || "",
    date: match.date,
    location: match.location || "",
    evaluation_deadline_hours: deadlineHours,
    evaluation_deadline_at: match.evaluationDeadlineAt || calculateEvaluationDeadlineAt(match.date, deadlineHours),
    award_voting_enabled: typeof match.awardVotingEnabled === "boolean"
      ? match.awardVotingEnabled
      : normalizeMatchParticipants(match).length >= 4,
    status: match.status || "evaluating",
    published_at: match.publishedAt || null,
    created_at: match.createdAt || new Date().toISOString(),
  };
}

function fromMatchParticipantRow(row) {
  return {
    userId: row.user_id,
    joinedAt: row.joined_at,
    evaluationCompleted: row.evaluation_completed === true,
  };
}

function toMatchParticipantRows(match) {
  return normalizeMatchParticipants(match).map((participant) => ({
    match_id: match.id,
    user_id: participant.userId,
    joined_at: participant.joinedAt || match.date,
    evaluation_completed: participant.evaluationCompleted === true,
  }));
}

function awardVoteId(vote) {
  return vote.id || `award:${vote.matchId}:${vote.voterUserId}:${vote.type}`;
}

function fromAwardVoteRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    matchId: row.match_id,
    voterUserId: row.voter_user_id,
    targetUserId: row.target_user_id,
    type: row.type,
    reason: row.reason || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAwardVoteRow(vote) {
  const now = new Date().toISOString();
  return {
    id: awardVoteId(vote),
    match_id: vote.matchId,
    voter_user_id: vote.voterUserId,
    target_user_id: vote.targetUserId,
    type: vote.type,
    reason: vote.reason || "",
    created_at: vote.createdAt || now,
    updated_at: vote.updatedAt || now,
  };
}

function fromSelfReflectionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    selectedPosition: row.selected_position,
    selfScores: row.self_scores || [],
    selfTraits: row.self_traits || [],
    selfHighlights: row.self_highlights || [],
    satisfactionScore: Number(row.satisfaction_score),
    feltStrength: row.felt_strength || "",
    feltWeakness: row.felt_weakness || "",
    nextGoal: row.next_goal || "",
    memo: row.memo || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSelfReflectionRow(reflection) {
  const now = new Date().toISOString();
  return {
    id: reflection.id,
    user_id: reflection.userId,
    match_id: reflection.matchId || null,
    selected_position: reflection.selectedPosition || "free",
    self_scores: reflection.selfScores || [],
    self_traits: reflection.selfTraits || [],
    self_highlights: reflection.selfHighlights || [],
    satisfaction_score: reflection.satisfactionScore,
    felt_strength: reflection.feltStrength || "",
    felt_weakness: reflection.feltWeakness || "",
    next_goal: reflection.nextGoal || "",
    memo: reflection.memo || "",
    created_at: reflection.createdAt || now,
    updated_at: reflection.updatedAt || now,
  };
}

function fromEvaluationRow(row, scoreRows = [], traitRows = [], highlightRows = []) {
  if (!row) return null;
  return {
    id: row.id,
    matchId: row.match_id,
    evaluatorUserId: row.evaluator_user_id,
    targetUserId: row.target_user_id,
    selectedPosition: row.selected_position,
    overallComment: row.overall_comment || "",
    version: row.version || 1,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scores: scoreRows.filter((score) => score.evaluation_id === row.id).map(fromEvaluationScoreRow),
    traits: traitRows.filter((trait) => trait.evaluation_id === row.id).map(fromEvaluationTraitRow),
    highlights: highlightRows.filter((highlight) => highlight.evaluation_id === row.id).map(fromEvaluationHighlightRow),
  };
}

function toEvaluationRow(evaluation, { isActive = evaluation.isActive !== false, version = evaluation.version || 1 } = {}) {
  const timestamp = evaluation.updatedAt || evaluation.createdAt || new Date().toISOString();
  return {
    id: evaluation.id,
    match_id: evaluation.matchId,
    evaluator_user_id: evaluation.evaluatorUserId,
    target_user_id: evaluation.targetUserId,
    selected_position: evaluation.selectedPosition,
    overall_comment: evaluation.overallComment || "",
    version,
    is_active: isActive,
    created_at: evaluation.createdAt || timestamp,
    updated_at: timestamp,
  };
}

function fromEvaluationScoreRow(row) {
  return {
    id: row.id,
    evaluationId: row.evaluation_id,
    category: row.category,
    key: row.key,
    score: Number(row.score),
  };
}

function toEvaluationScoreRows(evaluation) {
  return (evaluation.scores || []).map((score) => ({
    id: score.id,
    evaluation_id: evaluation.id,
    category: score.category,
    key: score.key,
    score: score.score,
  }));
}

function fromEvaluationTraitRow(row) {
  return {
    id: row.id,
    evaluationId: row.evaluation_id,
    key: row.key,
    score: Number(row.score),
  };
}

function toEvaluationTraitRows(evaluation) {
  return (evaluation.traits || []).map((trait) => ({
    id: trait.id,
    evaluation_id: evaluation.id,
    key: trait.key,
    score: trait.score,
  }));
}

function fromEvaluationHighlightRow(row) {
  return {
    id: row.id,
    evaluationId: row.evaluation_id,
    key: row.key,
  };
}

function toEvaluationHighlightRows(evaluation) {
  return (evaluation.highlights || []).map((highlight) => ({
    id: highlight.id,
    evaluation_id: evaluation.id,
    key: highlight.key,
  }));
}

function fromPlayerMatchCardRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    overallRating: row.overall_rating,
    previousOverallRating: row.previous_overall_rating,
    overallChange: row.overall_change,
    commonAverage: Number(row.common_average),
    positionAverage: Number(row.position_average),
    matchScore: Number(row.match_score),
    mainEvaluatedPosition: row.main_evaluated_position,
    selectedPositionSummary: row.selected_position_summary || {},
    playStyle: row.play_style,
    playStyleCode: row.play_style_code,
    radarData: row.radar_data || {},
    radarChange: row.radar_change || {},
    positionAdaptation: row.position_adaptation || {},
    strengthsTop3: row.strengths_top3 || [],
    weaknessesTop3: row.weaknesses_top3 || [],
    matchAnalysisText: row.match_analysis_text || "",
    analysisScores: row.analysis_scores || [],
    analysisChanges: row.analysis_changes || [],
    reliabilityLevel: row.reliability_level,
    evaluatorCount: row.evaluator_count,
    generatedAt: row.generated_at,
  };
}

function toPlayerMatchCardRow(card) {
  return {
    id: card.id,
    match_id: card.matchId,
    user_id: card.userId,
    overall_rating: card.overallRating,
    previous_overall_rating: card.previousOverallRating,
    overall_change: card.overallChange,
    common_average: card.commonAverage,
    position_average: card.positionAverage,
    match_score: card.matchScore,
    main_evaluated_position: card.mainEvaluatedPosition,
    selected_position_summary: card.selectedPositionSummary || {},
    play_style: card.playStyle,
    play_style_code: card.playStyleCode,
    radar_data: card.radarData || {},
    radar_change: card.radarChange || {},
    position_adaptation: card.positionAdaptation || {},
    strengths_top3: card.strengthsTop3 || [],
    weaknesses_top3: card.weaknessesTop3 || [],
    match_analysis_text: card.matchAnalysisText || "",
    analysis_scores: card.analysisScores || [],
    analysis_changes: card.analysisChanges || [],
    reliability_level: card.reliabilityLevel,
    evaluator_count: card.evaluatorCount,
    generated_at: card.generatedAt,
  };
}

function fromPlayerCurrentStatsRow(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    currentOVR: row.current_ovr,
    previousOVR: row.previous_ovr,
    ovrChange: row.ovr_change,
    radarData: row.radar_data || {},
    radarChange: row.radar_change || {},
    currentPlayStyle: row.current_play_style,
    previousPlayStyle: row.previous_play_style,
    currentMainPosition: row.current_main_position,
    positionAdaptation: row.position_adaptation || {},
    reliabilityLevel: row.reliability_level,
    recentMatchCount: row.recent_match_count,
    generatedAt: row.generated_at,
  };
}

function toPlayerCurrentStatsRow(stats) {
  return {
    user_id: stats.userId,
    current_ovr: stats.currentOVR,
    previous_ovr: stats.previousOVR,
    ovr_change: stats.ovrChange,
    radar_data: stats.radarData || {},
    radar_change: stats.radarChange || {},
    current_play_style: stats.currentPlayStyle,
    previous_play_style: stats.previousPlayStyle,
    current_main_position: stats.currentMainPosition,
    position_adaptation: stats.positionAdaptation || {},
    reliability_level: stats.reliabilityLevel,
    recent_match_count: stats.recentMatchCount,
    generated_at: stats.generatedAt,
  };
}

function fromPlayerMonthlyCardRow(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    monthKey: row.month_key,
    monthlyOVR: row.monthly_ovr,
    previousMonthlyOVR: row.previous_monthly_ovr,
    monthlyOVRChange: row.monthly_ovr_change,
    radarData: row.radar_data || {},
    mainPlayStyle: row.main_play_style,
    mainPosition: row.main_position,
    positionAdaptation: row.position_adaptation || {},
    matchCount: row.match_count,
    strengthsSummary: row.strengths_summary || [],
    weaknessesSummary: row.weaknesses_summary || [],
    generatedAt: row.generated_at,
  };
}

function toPlayerMonthlyCardRow(card) {
  return {
    user_id: card.userId,
    month_key: card.monthKey,
    monthly_ovr: card.monthlyOVR,
    previous_monthly_ovr: card.previousMonthlyOVR,
    monthly_ovr_change: card.monthlyOVRChange,
    radar_data: card.radarData || {},
    main_play_style: card.mainPlayStyle,
    main_position: card.mainPosition,
    position_adaptation: card.positionAdaptation || {},
    match_count: card.matchCount,
    strengths_summary: card.strengthsSummary || [],
    weaknesses_summary: card.weaknessesSummary || [],
    generated_at: card.generatedAt,
  };
}

function mergeUsers(users = []) {
  const data = officialData();
  users.filter(Boolean).forEach((user) => {
    const index = data.users.findIndex((item) => item.id === user.id);
    if (index >= 0) data.users[index] = { ...data.users[index], ...user };
    else data.users.push(user);
  });
}

function replaceFriendsForUser(userId, friends = []) {
  const data = officialData();
  for (let index = data.friends.length - 1; index >= 0; index -= 1) {
    const friend = data.friends[index];
    if (friend.userId === userId || friend.friendUserId === userId) data.friends.splice(index, 1);
  }
  friends.filter(Boolean).forEach((friend) => data.friends.push(friend));
}

function mergeFriends(friends = []) {
  const data = officialData();
  friends.filter(Boolean).forEach((friend) => {
    const index = data.friends.findIndex((item) =>
      item.userId === friend.userId && item.friendUserId === friend.friendUserId,
    );
    if (index >= 0) data.friends[index] = { ...data.friends[index], ...friend };
    else data.friends.push(friend);
  });
}

function replaceMatchesForUser(userId, matches = []) {
  const data = officialData();
  for (let index = data.matches.length - 1; index >= 0; index -= 1) {
    const match = data.matches[index];
    if ((match.participants || []).some((participant) => participant.userId === userId)) {
      data.matches.splice(index, 1);
    }
  }
  matches.filter(Boolean).forEach((match) => data.matches.push(match));
}

function mergeMatches(matches = []) {
  const data = officialData();
  matches.filter(Boolean).forEach((match) => {
    const index = data.matches.findIndex((item) => item.id === match.id);
    if (index >= 0) data.matches[index] = { ...data.matches[index], ...match };
    else data.matches.push(match);
  });
}

function replaceEvaluationsForMatches(matchIds = [], evaluations = []) {
  const data = officialData();
  const matchIdSet = new Set(matchIds);
  for (let index = data.evaluations.length - 1; index >= 0; index -= 1) {
    if (matchIdSet.has(data.evaluations[index].matchId)) data.evaluations.splice(index, 1);
  }
  evaluations.filter(Boolean).forEach((evaluation) => data.evaluations.push(evaluation));
}

function mergeEvaluations(evaluations = []) {
  const data = officialData();
  evaluations.filter(Boolean).forEach((evaluation) => {
    const sameSubmission = data.evaluations.filter((item) =>
      item.matchId === evaluation.matchId
      && item.evaluatorUserId === evaluation.evaluatorUserId
      && item.targetUserId === evaluation.targetUserId,
    );
    sameSubmission
      .filter((item) => item.id !== evaluation.id && item.isActive !== false)
      .forEach((item) => { item.isActive = false; item.updatedAt = evaluation.updatedAt; });
    const index = data.evaluations.findIndex((item) => item.id === evaluation.id);
    if (index >= 0) data.evaluations[index] = { ...data.evaluations[index], ...evaluation };
    else data.evaluations.push(evaluation);
  });
}

function replaceAwardVotesForMatches(matchIds = [], votes = []) {
  const data = officialData();
  const matchIdSet = new Set(matchIds);
  for (let index = data.matchAwardVotes.length - 1; index >= 0; index -= 1) {
    if (matchIdSet.has(data.matchAwardVotes[index].matchId)) data.matchAwardVotes.splice(index, 1);
  }
  votes.filter(Boolean).forEach((vote) => data.matchAwardVotes.push(vote));
}

function mergeAwardVotes(votes = []) {
  const data = officialData();
  votes.filter(Boolean).forEach((vote) => {
    const index = data.matchAwardVotes.findIndex((item) =>
      item.matchId === vote.matchId
      && item.voterUserId === vote.voterUserId
      && item.type === vote.type,
    );
    if (index >= 0) data.matchAwardVotes[index] = { ...data.matchAwardVotes[index], ...vote };
    else data.matchAwardVotes.push(vote);
  });
}

function replaceSelfReflectionsForUser(userId, reflections = []) {
  const data = officialData();
  for (let index = data.selfReflections.length - 1; index >= 0; index -= 1) {
    if (data.selfReflections[index]?.userId === userId) data.selfReflections.splice(index, 1);
  }
  reflections.filter(Boolean).forEach((reflection) => data.selfReflections.push(reflection));
}

function mergeSelfReflections(reflections = []) {
  const data = officialData();
  reflections.filter(Boolean).forEach((reflection) => {
    const index = data.selfReflections.findIndex((item) => item.id === reflection.id);
    if (index >= 0) data.selfReflections[index] = { ...data.selfReflections[index], ...reflection };
    else data.selfReflections.push(reflection);
  });
}

function replaceCardsForUsers(userIds = [], { matchCards = [], currentStats = [], monthlyCards = [] } = {}) {
  const data = officialData();
  const userIdSet = new Set(userIds);
  const pruneByUser = (collection) => {
    if (!Array.isArray(collection)) return;
    for (let index = collection.length - 1; index >= 0; index -= 1) {
      if (userIdSet.has(collection[index]?.userId)) collection.splice(index, 1);
    }
  };
  pruneByUser(data.playerMatchCards);
  pruneByUser(data.playerCurrentStats);
  pruneByUser(data.playerMonthlyCards);
  matchCards.filter(Boolean).forEach((card) => data.playerMatchCards.push(card));
  currentStats.filter(Boolean).forEach((stats) => data.playerCurrentStats.push(stats));
  monthlyCards.filter(Boolean).forEach((card) => data.playerMonthlyCards.push(card));
}

function mergePlayerMatchCards(cards = []) {
  const data = officialData();
  cards.filter(Boolean).forEach((card) => {
    const index = data.playerMatchCards.findIndex((item) => item.id === card.id);
    if (index >= 0) data.playerMatchCards[index] = { ...data.playerMatchCards[index], ...card };
    else data.playerMatchCards.push(card);
  });
}

function mergePlayerCurrentStats(statsItems = []) {
  const data = officialData();
  statsItems.filter(Boolean).forEach((stats) => {
    const index = data.playerCurrentStats.findIndex((item) => item.userId === stats.userId);
    if (index >= 0) data.playerCurrentStats[index] = { ...data.playerCurrentStats[index], ...stats };
    else data.playerCurrentStats.push(stats);
  });
}

function mergePlayerMonthlyCards(cards = []) {
  const data = officialData();
  cards.filter(Boolean).forEach((card) => {
    const index = data.playerMonthlyCards.findIndex((item) =>
      item.userId === card.userId && item.monthKey === card.monthKey,
    );
    if (index >= 0) data.playerMonthlyCards[index] = { ...data.playerMonthlyCards[index], ...card };
    else data.playerMonthlyCards.push(card);
  });
}

function assertClient() {
  if (!supabase) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
}

function reportSupabaseQueryError(context, error) {
  if (error) console.error(`[PlaylogSupabase] ${context}`, error);
}

function firstReturnedRow(data, context) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error(`${context}: Supabase returned no rows`);
  return row;
}

async function refreshUsers() {
  assertClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const users = (data || []).map(fromUserRow);
  mergeUsers(users);
  return users;
}

async function findUserByPlaylogId(playlogId) {
  assertClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("playlog_id", playlogId)
    .maybeSingle();
  if (error) throw error;
  const user = fromUserRow(data);
  if (user) mergeUsers([user]);
  return user;
}

async function saveUserApplication(user) {
  assertClient();
  const { data, error } = await supabase
    .from("users")
    .insert(toUserRow(user))
    .select("*")
    .single();
  if (error) throw error;
  const saved = fromUserRow(data);
  mergeUsers([saved]);
  return saved;
}

async function updateUserStatus(userId, status, approvedAt = null) {
  assertClient();
  const patch = {
    status,
    approved_at: status === "approved" ? (approvedAt || new Date().toISOString()) : null,
  };
  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  const saved = fromUserRow(data);
  mergeUsers([saved]);
  return saved;
}

async function refreshFriends(userId) {
  assertClient();
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const friends = (data || []).map(fromFriendRow);
  replaceFriendsForUser(userId, friends);
  return friends;
}

async function addFriend(friend) {
  assertClient();
  const { data, error } = await supabase
    .from("friends")
    .insert(toFriendRow(friend))
    .select("*")
    .single();
  if (error) throw error;
  const saved = fromFriendRow(data);
  mergeFriends([saved]);
  return saved;
}

async function refreshMatches(userId) {
  assertClient();
  const { data: ownParticipantRows, error: ownParticipantsError } = await supabase
    .from("match_participants")
    .select("*")
    .eq("user_id", userId);
  if (ownParticipantsError) throw ownParticipantsError;
  const matchIds = [...new Set((ownParticipantRows || []).map((participant) => participant.match_id).filter(Boolean))];
  if (!matchIds.length) {
    replaceMatchesForUser(userId, []);
    return [];
  }
  const { data: matchRows, error: matchesError } = await supabase
    .from("matches")
    .select("*")
    .in("id", matchIds)
    .order("date", { ascending: false });
  if (matchesError) throw matchesError;
  const { data: participantRows, error: participantsError } = await supabase
    .from("match_participants")
    .select("*")
    .in("match_id", matchIds);
  if (participantsError) throw participantsError;
  const matches = (matchRows || []).map((row) => fromMatchRow(row, participantRows || []));
  replaceMatchesForUser(userId, matches);
  return matches;
}

async function createMatch(match) {
  assertClient();
  const normalizedMatch = {
    ...match,
    participants: normalizeMatchParticipants(match),
  };
  const { data: savedMatchRow, error: matchError } = await supabase
    .from("matches")
    .insert(toMatchRow(normalizedMatch))
    .select("*")
    .single();
  if (matchError) throw matchError;

  const participantRows = toMatchParticipantRows(normalizedMatch);
  const { data: savedParticipantRows, error: participantsError } = await supabase
    .from("match_participants")
    .insert(participantRows)
    .select("*");
  if (participantsError) throw participantsError;

  const saved = fromMatchRow(savedMatchRow, savedParticipantRows || []);
  mergeMatches([saved]);
  return saved;
}

async function updateMatchParticipantCompletion(matchId, userId, evaluationCompleted) {
  assertClient();
  const { data, error } = await supabase
    .from("match_participants")
    .update({ evaluation_completed: evaluationCompleted === true })
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .select("*");
  if (error) {
    reportSupabaseQueryError("updateMatchParticipantCompletion", error);
    throw error;
  }

  const row = firstReturnedRow(data, "updateMatchParticipantCompletion");
  const appMatch = officialData().matches.find((match) => match.id === matchId);
  const participant = appMatch?.participants?.find((item) => item.userId === userId);
  if (participant) participant.evaluationCompleted = row.evaluation_completed === true;
  return fromMatchParticipantRow(row);
}

async function recalculateMatchEvaluationCompletion(matchId) {
  assertClient();
  const { data: participantRows, error: participantsError } = await supabase
    .from("match_participants")
    .select("*")
    .eq("match_id", matchId);
  if (participantsError) {
    reportSupabaseQueryError("recalculateMatchEvaluationCompletion:selectParticipants", participantsError);
    throw participantsError;
  }

  const participantUserIds = (participantRows || []).map((participant) => participant.user_id).filter(Boolean);
  const expectedActiveEvaluationCount = participantUserIds.length * Math.max(participantUserIds.length - 1, 0);

  const { data: activeEvaluationRows, error: evaluationsError } = await supabase
    .from("evaluations")
    .select("evaluator_user_id,target_user_id")
    .eq("match_id", matchId)
    .eq("is_active", true);
  if (evaluationsError) {
    reportSupabaseQueryError("recalculateMatchEvaluationCompletion:selectActiveEvaluations", evaluationsError);
    throw evaluationsError;
  }

  const activePairs = new Set((activeEvaluationRows || [])
    .filter((evaluation) =>
      participantUserIds.includes(evaluation.evaluator_user_id)
      && participantUserIds.includes(evaluation.target_user_id)
      && evaluation.evaluator_user_id !== evaluation.target_user_id,
    )
    .map((evaluation) => `${evaluation.evaluator_user_id}:${evaluation.target_user_id}`));

  const completionByUserId = new Map(participantUserIds.map((userId) => {
    const expectedTargets = participantUserIds.filter((targetUserId) => targetUserId !== userId);
    const evaluationCompleted = expectedTargets.every((targetUserId) => activePairs.has(`${userId}:${targetUserId}`));
    return [userId, evaluationCompleted];
  }));

  await Promise.all(participantUserIds.map((userId) =>
    supabase
      .from("match_participants")
      .update({ evaluation_completed: completionByUserId.get(userId) === true })
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) {
          reportSupabaseQueryError("recalculateMatchEvaluationCompletion:updateParticipant", error);
          throw error;
        }
      }),
  ));

  const appMatch = officialData().matches.find((match) => match.id === matchId);
  if (appMatch) {
    appMatch.participants = (appMatch.participants || []).map((participant) => ({
      ...participant,
      evaluationCompleted: completionByUserId.get(participant.userId) === true,
    }));
  }

  const participants = (participantRows || []).map((row) => ({
    ...fromMatchParticipantRow(row),
    evaluationCompleted: completionByUserId.get(row.user_id) === true,
  }));
  return {
    participants,
    activeEvaluationCount: activePairs.size,
    expectedActiveEvaluationCount,
    allComplete: participantUserIds.length > 1 && participantUserIds.every((userId) => completionByUserId.get(userId) === true),
  };
}

async function publishMatch(matchId, publishedAt = new Date().toISOString()) {
  assertClient();
  console.info("[PlaylogSupabase] publishMatch", { matchId, publishedAt });
  const { data, error } = await supabase
    .from("matches")
    .update({ status: "published", published_at: publishedAt })
    .eq("id", matchId)
    .select("*");
  if (error) {
    reportSupabaseQueryError("publishMatch", error);
    throw error;
  }

  let row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.warn("[PlaylogSupabase] publishMatch update returned no rows; selecting by id", { matchId, publishedAt, data });
    const { data: selectedRows, error: selectError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId);
    if (selectError) {
      reportSupabaseQueryError("publishMatch:selectAfterUpdate", selectError);
      throw selectError;
    }
    console.info("[PlaylogSupabase] publishMatch selectAfterUpdate", { matchId, rows: selectedRows });
    row = Array.isArray(selectedRows) ? selectedRows[0] : selectedRows;
  }
  if (!row) throw new Error(`publishMatch: no match row found for id ${matchId}`);
  if (row.status !== "published") {
    throw new Error(`publishMatch: match ${matchId} status is still ${row.status || "empty"} after update. Check public.matches UPDATE RLS policy.`);
  }
  const appMatch = officialData().matches.find((match) => match.id === matchId);
  if (appMatch) {
    appMatch.status = row.status || "published";
    appMatch.publishedAt = row.published_at;
  }
  return fromMatchRow(row, appMatch?.participants?.map((participant) => ({
    match_id: matchId,
    user_id: participant.userId,
    joined_at: participant.joinedAt,
    evaluation_completed: participant.evaluationCompleted,
  })) || []);
}

async function refreshEvaluations(userId) {
  assertClient();
  const { data: participantRows, error: participantsError } = await supabase
    .from("match_participants")
    .select("match_id")
    .eq("user_id", userId);
  if (participantsError) throw participantsError;
  const matchIds = [...new Set((participantRows || []).map((participant) => participant.match_id).filter(Boolean))];
  if (!matchIds.length) {
    replaceEvaluationsForMatches([], []);
    return [];
  }

  const { data: evaluationRows, error: evaluationsError } = await supabase
    .from("evaluations")
    .select("*")
    .in("match_id", matchIds);
  if (evaluationsError) throw evaluationsError;
  const evaluationIds = (evaluationRows || []).map((evaluation) => evaluation.id);
  if (!evaluationIds.length) {
    replaceEvaluationsForMatches(matchIds, []);
    return [];
  }

  const { data: scoreRows, error: scoresError } = await supabase
    .from("evaluation_scores")
    .select("*")
    .in("evaluation_id", evaluationIds);
  if (scoresError) throw scoresError;
  const { data: traitRows, error: traitsError } = await supabase
    .from("evaluation_traits")
    .select("*")
    .in("evaluation_id", evaluationIds);
  if (traitsError) throw traitsError;
  const { data: highlightRows, error: highlightsError } = await supabase
    .from("evaluation_highlights")
    .select("*")
    .in("evaluation_id", evaluationIds);
  if (highlightsError) throw highlightsError;

  const evaluations = (evaluationRows || []).map((row) =>
    fromEvaluationRow(row, scoreRows || [], traitRows || [], highlightRows || []),
  );
  replaceEvaluationsForMatches(matchIds, evaluations);
  return evaluations;
}

async function saveEvaluation(evaluation) {
  assertClient();
  const { data: sameRows, error: sameRowsError } = await supabase
    .from("evaluations")
    .select("*")
    .eq("match_id", evaluation.matchId)
    .eq("evaluator_user_id", evaluation.evaluatorUserId)
    .eq("target_user_id", evaluation.targetUserId);
  if (sameRowsError) throw sameRowsError;

  const version = sameRows?.length
    ? Math.max(...sameRows.map((row) => row.version || 1)) + 1
    : 1;
  const timestamp = evaluation.updatedAt || evaluation.createdAt || new Date().toISOString();
  const versioned = { ...evaluation, version, isActive: true, updatedAt: timestamp };

  const { data: savedEvaluationRow, error: insertEvaluationError } = await supabase
    .from("evaluations")
    .insert(toEvaluationRow(versioned, { isActive: false, version }))
    .select("*");
  if (insertEvaluationError) {
    reportSupabaseQueryError("saveEvaluation:insertEvaluation", insertEvaluationError);
    throw insertEvaluationError;
  }
  const savedEvaluation = firstReturnedRow(savedEvaluationRow, "saveEvaluation:insertEvaluation");

  const scoreRows = toEvaluationScoreRows(versioned);
  if (scoreRows.length) {
    const { error } = await supabase.from("evaluation_scores").insert(scoreRows);
    if (error) {
      reportSupabaseQueryError("saveEvaluation:insertScores", error);
      throw error;
    }
  }
  const traitRows = toEvaluationTraitRows(versioned);
  if (traitRows.length) {
    const { error } = await supabase.from("evaluation_traits").insert(traitRows);
    if (error) {
      reportSupabaseQueryError("saveEvaluation:insertTraits", error);
      throw error;
    }
  }
  const highlightRows = toEvaluationHighlightRows(versioned);
  if (highlightRows.length) {
    const { error } = await supabase.from("evaluation_highlights").insert(highlightRows);
    if (error) {
      reportSupabaseQueryError("saveEvaluation:insertHighlights", error);
      throw error;
    }
  }

  const activeIds = (sameRows || []).filter((row) => row.is_active !== false).map((row) => row.id);
  if (activeIds.length) {
    const { error } = await supabase
      .from("evaluations")
      .update({ is_active: false, updated_at: timestamp })
      .in("id", activeIds);
    if (error) {
      reportSupabaseQueryError("saveEvaluation:deactivatePrevious", error);
      throw error;
    }
  }

  const { data: activatedEvaluationRow, error: activateError } = await supabase
    .from("evaluations")
    .update({ is_active: true, updated_at: timestamp })
    .eq("id", savedEvaluation.id)
    .select("*");
  if (activateError) {
    reportSupabaseQueryError("saveEvaluation:activateCurrent", activateError);
    throw activateError;
  }

  const saved = fromEvaluationRow(firstReturnedRow(activatedEvaluationRow, "saveEvaluation:activateCurrent"), scoreRows, traitRows, highlightRows);
  mergeEvaluations([saved]);
  return saved;
}

async function refreshAwardVotes(userId) {
  assertClient();
  const { data: participantRows, error: participantsError } = await supabase
    .from("match_participants")
    .select("match_id")
    .eq("user_id", userId);
  if (participantsError) {
    reportSupabaseQueryError("refreshAwardVotes:selectParticipantMatches", participantsError);
    throw participantsError;
  }
  const matchIds = [...new Set((participantRows || []).map((participant) => participant.match_id).filter(Boolean))];
  if (!matchIds.length) {
    replaceAwardVotesForMatches([], []);
    return [];
  }
  const { data, error } = await supabase
    .from("award_votes")
    .select("*")
    .in("match_id", matchIds);
  if (error) {
    reportSupabaseQueryError("refreshAwardVotes:selectAwardVotes", error);
    throw error;
  }
  const votes = (data || []).map(fromAwardVoteRow);
  replaceAwardVotesForMatches(matchIds, votes);
  return votes;
}

async function saveMatchAwardVote(vote) {
  assertClient();
  const data = officialData();
  const match = data.matches.find((item) => item.id === vote.matchId);
  if (!match) throw new Error("등록된 경기만 투표를 저장할 수 있습니다.");
  const participantIds = (match.participants || []).map((participant) => participant.userId);
  if (!participantIds.includes(vote.voterUserId) || !participantIds.includes(vote.targetUserId)) {
    throw new Error("경기 참가자만 투표 대상이 될 수 있습니다.");
  }
  if (vote.voterUserId === vote.targetUserId) {
    throw new Error("본인에게는 투표를 할 수 없습니다.");
  }
  if (typeof data.isParticipantEvaluationComplete === "function"
    && !data.isParticipantEvaluationComplete(vote.matchId, vote.voterUserId)) {
    throw new Error("평가를 완료한 후 투표를 할 수 있습니다.");
  }
  if (!["pom", "next_star"].includes(vote.type)) {
    throw new Error("지원하지 않는 경기 투표 타입입니다.");
  }
  const existingVote = data.matchAwardVotes.find((item) =>
    item.matchId === vote.matchId
    && item.voterUserId === vote.voterUserId
    && item.type === vote.type,
  );
  if (match.status === "published" && existingVote) {
    throw new Error("공개된 경기의 투표는 수정할 수 없습니다.");
  }

  const { data: savedRows, error } = await supabase
    .from("award_votes")
    .upsert(toAwardVoteRow(vote), { onConflict: "match_id,voter_user_id,type" })
    .select("*");
  if (error) {
    reportSupabaseQueryError("saveMatchAwardVote:upsertAwardVote", error);
    throw error;
  }
  const saved = fromAwardVoteRow(firstReturnedRow(savedRows, "saveMatchAwardVote:upsertAwardVote"));
  mergeAwardVotes([saved]);
  return saved;
}

async function refreshSelfReflections(userId) {
  assertClient();
  const { data, error } = await supabase
    .from("self_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    reportSupabaseQueryError("refreshSelfReflections:selectSelfReflections", error);
    throw error;
  }
  const reflections = (data || []).map(fromSelfReflectionRow);
  replaceSelfReflectionsForUser(userId, reflections);
  return reflections;
}

async function saveSelfReflection(reflection) {
  assertClient();
  const { data, error } = await supabase
    .from("self_reflections")
    .upsert(toSelfReflectionRow(reflection), { onConflict: "id" })
    .select("*");
  if (error) {
    reportSupabaseQueryError("saveSelfReflection:upsertSelfReflection", error);
    throw error;
  }
  const saved = fromSelfReflectionRow(firstReturnedRow(data, "saveSelfReflection:upsertSelfReflection"));
  mergeSelfReflections([saved]);
  return saved;
}

async function refreshPlayerCards(userId) {
  assertClient();
  const { data: participantRows, error: participantsError } = await supabase
    .from("match_participants")
    .select("match_id")
    .eq("user_id", userId);
  if (participantsError) throw participantsError;
  const matchIds = [...new Set((participantRows || []).map((participant) => participant.match_id).filter(Boolean))];

  const { data: ownMatchCardRows, error: ownMatchCardsError } = await supabase
    .from("player_match_cards")
    .select("*")
    .eq("user_id", userId);
  if (ownMatchCardsError) throw ownMatchCardsError;
  let matchCardRows = ownMatchCardRows || [];
  if (matchIds.length) {
    const { data: participantMatchCardRows, error: participantMatchCardsError } = await supabase
      .from("player_match_cards")
      .select("*")
      .in("match_id", matchIds);
    if (participantMatchCardsError) throw participantMatchCardsError;
    const rowsById = new Map(matchCardRows.map((row) => [row.id, row]));
    (participantMatchCardRows || []).forEach((row) => rowsById.set(row.id, row));
    matchCardRows = [...rowsById.values()];
  }

  const cardUserIds = [...new Set([userId, ...matchCardRows.map((row) => row.user_id)].filter(Boolean))];
  const { data: currentStatsRows, error: currentStatsError } = await supabase
    .from("player_current_stats")
    .select("*")
    .in("user_id", cardUserIds);
  if (currentStatsError) throw currentStatsError;
  const { data: monthlyCardRows, error: monthlyCardsError } = await supabase
    .from("player_monthly_cards")
    .select("*")
    .in("user_id", cardUserIds);
  if (monthlyCardsError) throw monthlyCardsError;

  const matchCards = matchCardRows.map(fromPlayerMatchCardRow);
  const currentStats = (currentStatsRows || []).map(fromPlayerCurrentStatsRow);
  const monthlyCards = (monthlyCardRows || []).map(fromPlayerMonthlyCardRow);
  replaceCardsForUsers(cardUserIds, { matchCards, currentStats, monthlyCards });
  return { matchCards, currentStats, monthlyCards };
}

async function upsertGeneratedCards({ matchCard = null, currentStats = null, monthlyCard = null }) {
  assertClient();
  let savedMatchCard = null;
  let savedCurrentStats = null;
  let savedMonthlyCard = null;

  if (matchCard) {
    const { data, error } = await supabase
      .from("player_match_cards")
      .upsert(toPlayerMatchCardRow(matchCard), { onConflict: "id" })
      .select("*");
    if (error) {
      reportSupabaseQueryError("upsertGeneratedCards:player_match_cards", error);
      throw error;
    }
    savedMatchCard = fromPlayerMatchCardRow(firstReturnedRow(data, "upsertGeneratedCards:player_match_cards"));
  }

  if (currentStats) {
    const { data, error } = await supabase
      .from("player_current_stats")
      .upsert(toPlayerCurrentStatsRow(currentStats), { onConflict: "user_id" })
      .select("*");
    if (error) {
      reportSupabaseQueryError("upsertGeneratedCards:player_current_stats", error);
      throw error;
    }
    savedCurrentStats = fromPlayerCurrentStatsRow(firstReturnedRow(data, "upsertGeneratedCards:player_current_stats"));
  }

  if (monthlyCard) {
    const { data, error } = await supabase
      .from("player_monthly_cards")
      .upsert(toPlayerMonthlyCardRow(monthlyCard), { onConflict: "user_id,month_key" })
      .select("*");
    if (error) {
      reportSupabaseQueryError("upsertGeneratedCards:player_monthly_cards", error);
      throw error;
    }
    savedMonthlyCard = fromPlayerMonthlyCardRow(firstReturnedRow(data, "upsertGeneratedCards:player_monthly_cards"));
  }

  mergePlayerMatchCards([savedMatchCard]);
  mergePlayerCurrentStats([savedCurrentStats]);
  mergePlayerMonthlyCards([savedMonthlyCard]);
  return { matchCard: savedMatchCard, currentStats: savedCurrentStats, monthlyCard: savedMonthlyCard };
}

async function bootstrapUserData(userId) {
  assertClient();
  await refreshUsers();
  await refreshFriends(userId);
  await refreshMatches(userId);
  await refreshEvaluations(userId);
  await refreshAwardVotes(userId);
  await refreshSelfReflections(userId);
  await refreshPlayerCards(userId);
}

window.PlaylogSupabase = {
  client: supabase,
  isEnabled: () => Boolean(supabase),
  refreshUsers,
  findUserByPlaylogId,
  saveUserApplication,
  updateUserStatus,
  refreshFriends,
  addFriend,
  refreshMatches,
  createMatch,
  updateMatchParticipantCompletion,
  recalculateMatchEvaluationCompletion,
  publishMatch,
  refreshEvaluations,
  saveEvaluation,
  refreshAwardVotes,
  saveMatchAwardVote,
  refreshSelfReflections,
  saveSelfReflection,
  refreshPlayerCards,
  upsertGeneratedCards,
  bootstrapUserData,
};
