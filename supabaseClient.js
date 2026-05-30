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

function assertClient() {
  if (!supabase) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
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

async function bootstrapUserData(userId) {
  assertClient();
  await refreshUsers();
  await refreshFriends(userId);
  await refreshMatches(userId);
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
  bootstrapUserData,
};
