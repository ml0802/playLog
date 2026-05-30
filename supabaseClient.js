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
    id: row.id,
    userId: row.user_id,
    friendUserId: row.friend_user_id,
    status: row.status,
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
  data.friends = data.friends.filter((friend) => friend.userId !== userId);
  data.friends.push(...friends.filter(Boolean));
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
    .upsert(toUserRow(user), { onConflict: "id" })
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
    .eq("user_id", userId)
    .eq("status", "accepted")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const friends = (data || []).map(fromFriendRow);
  replaceFriendsForUser(userId, friends);

  const friendIds = friends.map((friend) => friend.friendUserId).filter(Boolean);
  if (friendIds.length) {
    const { data: friendUsers, error: friendUserError } = await supabase
      .from("users")
      .select("*")
      .in("id", friendIds);
    if (friendUserError) throw friendUserError;
    mergeUsers((friendUsers || []).map(fromUserRow));
  }
  return friends;
}

async function addFriend(friend) {
  assertClient();
  const row = toFriendRow(friend);
  const { data: existing, error: findError } = await supabase
    .from("friends")
    .select("*")
    .eq("user_id", row.user_id)
    .eq("friend_user_id", row.friend_user_id)
    .maybeSingle();
  if (findError) throw findError;

  const query = existing?.id
    ? supabase.from("friends").update({ status: "accepted" }).eq("id", existing.id)
    : supabase.from("friends").insert(row);
  const { data, error } = await query.select("*").single();
  if (error) throw error;

  const saved = fromFriendRow(data);
  const store = officialData();
  const index = store.friends.findIndex((item) =>
    item.userId === saved.userId && item.friendUserId === saved.friendUserId);
  if (index >= 0) store.friends[index] = saved;
  else store.friends.push(saved);
  return saved;
}

async function bootstrapUserData(userId) {
  assertClient();
  await refreshUsers();
  if (userId) await refreshFriends(userId);
}

window.PlaylogSupabase = {
  client: supabase,
  isEnabled: () => Boolean(supabase),
  refreshUsers,
  refreshFriends,
  findUserByPlaylogId,
  saveUserApplication,
  updateUserStatus,
  addFriend,
  bootstrapUserData,
};
