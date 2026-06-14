import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex <= 0) return;
    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    if (process.env[key]) return;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  });
}

[".env.local", ".env.production", ".env"].forEach(loadEnvFile);

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const argValue = (name) => {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

const runMode = hasFlag("--run");
const confirmed = hasFlag("--confirm");
const allUsers = hasFlag("--all");
const verbose = hasFlag("--verbose");
const userIdArg = argValue("--user-id");
const playlogIdArg = argValue("--playlog-id");
const includeEvaluations = !hasFlag("--keep-evaluations");
const includeVotes = !hasFlag("--keep-votes");

if (!allUsers && !userIdArg && !playlogIdArg) {
  console.error("Usage: node scripts/supabase-derived-maintenance.mjs --dry-run --user-id <id>");
  console.error("   or: node scripts/supabase-derived-maintenance.mjs --run --confirm --playlog-id <playlog_id>");
  console.error("   or: node scripts/supabase-derived-maintenance.mjs --dry-run --all");
  process.exit(1);
}

if (runMode && !confirmed) {
  console.error("Refusing to mutate data without --confirm. Run dry-run first, then add --run --confirm.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const engineModule = await import("../playlog-engine.js");
const engine = engineModule.default || engineModule;

const chunk = (items, size = 200) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
};

async function selectAll(table, columns = "*", build = (query) => query) {
  let from = 0;
  const pageSize = 1000;
  const rows = [];
  while (true) {
    const query = build(supabase.from(table).select(columns).range(from, from + pageSize - 1));
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function selectByIds(table, ids, columns = "*", column = "id") {
  if (!ids.length) return [];
  const rows = [];
  for (const idsChunk of chunk([...new Set(ids)].filter(Boolean))) {
    const { data, error } = await supabase.from(table).select(columns).in(column, idsChunk);
    if (error) throw error;
    rows.push(...(data || []));
  }
  return rows;
}

async function deleteByIds(table, ids, column = "id") {
  if (!ids.length) return 0;
  let count = 0;
  for (const idsChunk of chunk([...new Set(ids)].filter(Boolean))) {
    const { data, error } = await supabase.from(table).delete().in(column, idsChunk).select(column);
    if (error) throw error;
    count += data?.length || 0;
  }
  return count;
}

async function upsertRows(table, rows, onConflict) {
  if (!rows.length) return 0;
  let count = 0;
  for (const rowsChunk of chunk(rows, 200)) {
    const { data, error } = await supabase.from(table).upsert(rowsChunk, { onConflict }).select();
    if (error) throw error;
    count += data?.length || 0;
  }
  return count;
}

async function resolveTargetUserIds() {
  if (userIdArg) return [userIdArg];
  if (playlogIdArg) {
    const { data, error } = await supabase.from("users").select("id").eq("playlog_id", playlogIdArg).maybeSingle();
    if (error) throw error;
    if (!data?.id) throw new Error(`No user found for playlog_id=${playlogIdArg}`);
    return [data.id];
  }
  const users = await selectAll("users", "id");
  return users.map((user) => user.id).filter(Boolean);
}

function rowTouchesUsers(row, userIds) {
  if (allUsers) return true;
  const set = new Set(userIds);
  return [row.user_id, row.target_user_id, row.evaluator_user_id, row.voter_user_id].some((id) => set.has(id));
}

async function findOrphans(targetUserIds) {
  const matches = await selectAll("matches", "id,match_type,status,date,published_at");
  const existingMatchIds = new Set(matches.map((match) => match.id));
  const orphan = {
    player_match_cards: [],
    quick_player_match_cards: [],
    evaluations: [],
    quick_evaluations: [],
    award_votes: [],
    match_participants: [],
  };

  const officialCards = await selectAll("player_match_cards", "id,match_id,user_id");
  orphan.player_match_cards = officialCards.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));

  const quickCards = await selectAll("quick_player_match_cards", "id,match_id,user_id");
  orphan.quick_player_match_cards = quickCards.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));

  if (includeEvaluations) {
    const evaluations = await selectAll("evaluations", "id,match_id,evaluator_user_id,target_user_id");
    orphan.evaluations = evaluations.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));
    const quickEvaluations = await selectAll("quick_evaluations", "id,match_id,evaluator_user_id,target_user_id");
    orphan.quick_evaluations = quickEvaluations.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));
  }

  if (includeVotes) {
    const votes = await selectAll("award_votes", "id,match_id,voter_user_id,target_user_id");
    orphan.award_votes = votes.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));
  }

  const participants = await selectAll("match_participants", "match_id,user_id");
  orphan.match_participants = participants.filter((row) => !existingMatchIds.has(row.match_id) && rowTouchesUsers(row, targetUserIds));

  return { matches, orphan };
}

function fromEvaluationRow(row, scores = [], traits = [], highlights = [], matchType = "official") {
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
    evaluationType: matchType,
    scores: scores.filter((score) => score.evaluation_id === row.id).map((score) => ({
      id: score.id,
      evaluationId: score.evaluation_id,
      category: score.category,
      key: score.key,
      score: Number(score.score),
    })),
    traits: traits.filter((trait) => trait.evaluation_id === row.id).map((trait) => ({
      id: trait.id,
      evaluationId: trait.evaluation_id,
      key: trait.key,
      score: Number(trait.score),
    })),
    highlights: highlights.filter((highlight) => highlight.evaluation_id === row.id).map((highlight) => ({
      id: highlight.id,
      evaluationId: highlight.evaluation_id,
      key: highlight.key,
    })),
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

async function fetchEvaluations(matchIds, matchType) {
  if (!matchIds.length) return [];
  const tables = matchType === "quick"
    ? ["quick_evaluations", "quick_evaluation_scores", "quick_evaluation_traits", "quick_evaluation_highlights"]
    : ["evaluations", "evaluation_scores", "evaluation_traits", "evaluation_highlights"];
  const evaluationRows = await selectByIds(tables[0], matchIds, "*", "match_id");
  const evaluationIds = evaluationRows.map((row) => row.id);
  const [scoreRows, traitRows, highlightRows] = await Promise.all([
    selectByIds(tables[1], evaluationIds, "*", "evaluation_id"),
    selectByIds(tables[2], evaluationIds, "*", "evaluation_id"),
    selectByIds(tables[3], evaluationIds, "*", "evaluation_id"),
  ]);
  return evaluationRows.map((row) => fromEvaluationRow(row, scoreRows, traitRows, highlightRows, matchType));
}

function matchDateValue(match) {
  return new Date(match.published_at || match.date || match.created_at || 0).getTime();
}

function monthKeyForCard(card) {
  return (card.generatedAt || new Date().toISOString()).slice(0, 7);
}

function recalculateForUsers({ targetUserIds, matches, participants, officialEvaluations, quickEvaluations }) {
  const targetSet = new Set(targetUserIds);
  const publishedMatches = matches
    .filter((match) => match.status === "published")
    .sort((left, right) => matchDateValue(left) - matchDateValue(right));
  const participantsByMatch = new Map();
  participants.forEach((participant) => {
    if (!participantsByMatch.has(participant.match_id)) participantsByMatch.set(participant.match_id, []);
    participantsByMatch.get(participant.match_id).push(participant.user_id);
  });

  const generated = {
    officialMatchCards: [],
    quickMatchCards: [],
    currentStats: [],
    monthlyCards: [],
    quickMonthlyCards: [],
  };

  const perUserOfficialCards = new Map(targetUserIds.map((userId) => [userId, []]));
  const perUserQuickCards = new Map(targetUserIds.map((userId) => [userId, []]));

  for (const match of publishedMatches) {
    const matchType = match.match_type === "quick" ? "quick" : "official";
    const userIds = (participantsByMatch.get(match.id) || []).filter((userId) => targetSet.has(userId));
    const evaluations = matchType === "quick" ? quickEvaluations : officialEvaluations;
    for (const userId of userIds) {
      const previousCards = matchType === "quick" ? perUserQuickCards.get(userId) : perUserOfficialCards.get(userId);
      const previousCard = previousCards[previousCards.length - 1] || null;
      const card = engine.generatePlayerMatchCard({
        matchId: match.id,
        userId,
        evaluations,
        previousCard,
        previousCards,
        generatedAt: match.published_at || match.date || new Date().toISOString(),
      });
      if (!card) continue;
      if (matchType === "quick") {
        card.cardType = "quick";
        card.id = `quick-player-match-card:${match.id}:${userId}`;
        generated.quickMatchCards.push(card);
        previousCards.push(card);
      } else {
        generated.officialMatchCards.push(card);
        previousCards.push(card);
      }
    }
  }

  for (const userId of targetUserIds) {
    const officialCards = perUserOfficialCards.get(userId) || [];
    if (officialCards.length) {
      const currentStats = engine.generatePlayerCurrentStats({
        userId,
        cards: officialCards,
        generatedAt: new Date().toISOString(),
      });
      if (currentStats) generated.currentStats.push(currentStats);
    }
    for (const [cards, output, quick] of [
      [officialCards, generated.monthlyCards, false],
      [perUserQuickCards.get(userId) || [], generated.quickMonthlyCards, true],
    ]) {
      const monthKeys = [...new Set(cards.map(monthKeyForCard))].sort();
      let previousMonthlyCard = null;
      for (const monthKey of monthKeys) {
        const monthlyCard = engine.generatePlayerMonthlyCard({
          userId,
          monthKey,
          cards,
          previousMonthlyCard,
          generatedAt: new Date().toISOString(),
        });
        if (!monthlyCard) continue;
        if (quick) {
          monthlyCard.cardType = "quick";
          monthlyCard.id = `quick-player-monthly-card:${userId}:${monthKey}`;
        }
        output.push(monthlyCard);
        previousMonthlyCard = monthlyCard;
      }
    }
  }
  return generated;
}

async function deleteExistingDerivedForUsers(targetUserIds) {
  let deleted = 0;
  for (const userId of targetUserIds) {
    for (const [table, column] of [
      ["player_match_cards", "user_id"],
      ["quick_player_match_cards", "user_id"],
      ["player_monthly_cards", "user_id"],
      ["quick_player_monthly_cards", "user_id"],
      ["player_current_stats", "user_id"],
    ]) {
      const { data, error } = await supabase.from(table).delete().eq(column, userId).select(column);
      if (error) throw error;
      deleted += data?.length || 0;
    }
  }
  return deleted;
}

async function applyOrphanCleanup(orphan) {
  let deleted = 0;
  deleted += await deleteByIds("player_match_cards", orphan.player_match_cards.map((row) => row.id));
  deleted += await deleteByIds("quick_player_match_cards", orphan.quick_player_match_cards.map((row) => row.id));
  deleted += await deleteByIds("award_votes", orphan.award_votes.map((row) => row.id));
  if (orphan.evaluations.length) {
    const ids = orphan.evaluations.map((row) => row.id);
    deleted += await deleteByIds("evaluation_scores", ids, "evaluation_id");
    deleted += await deleteByIds("evaluation_traits", ids, "evaluation_id");
    deleted += await deleteByIds("evaluation_highlights", ids, "evaluation_id");
    deleted += await deleteByIds("evaluations", ids);
  }
  if (orphan.quick_evaluations.length) {
    const ids = orphan.quick_evaluations.map((row) => row.id);
    deleted += await deleteByIds("quick_evaluation_scores", ids, "evaluation_id");
    deleted += await deleteByIds("quick_evaluation_traits", ids, "evaluation_id");
    deleted += await deleteByIds("quick_evaluation_highlights", ids, "evaluation_id");
    deleted += await deleteByIds("quick_evaluations", ids);
  }
  for (const participant of orphan.match_participants) {
    const { data, error } = await supabase
      .from("match_participants")
      .delete()
      .eq("match_id", participant.match_id)
      .eq("user_id", participant.user_id)
      .select("match_id");
    if (error) throw error;
    deleted += data?.length || 0;
  }
  return deleted;
}

async function applyGenerated(generated) {
  const counts = {};
  counts.officialMatchCards = await upsertRows("player_match_cards", generated.officialMatchCards.map(toPlayerMatchCardRow), "id");
  counts.quickMatchCards = await upsertRows("quick_player_match_cards", generated.quickMatchCards.map(toPlayerMatchCardRow), "id");
  counts.currentStats = await upsertRows("player_current_stats", generated.currentStats.map(toPlayerCurrentStatsRow), "user_id");
  counts.monthlyCards = await upsertRows("player_monthly_cards", generated.monthlyCards.map(toPlayerMonthlyCardRow), "user_id,month_key");
  counts.quickMonthlyCards = await upsertRows("quick_player_monthly_cards", generated.quickMonthlyCards.map(toPlayerMonthlyCardRow), "user_id,month_key");
  return counts;
}

const targetUserIds = await resolveTargetUserIds();
const { matches, orphan } = await findOrphans(targetUserIds);
const participants = await selectAll("match_participants", "match_id,user_id");
const targetMatchIds = [...new Set(participants
  .filter((participant) => targetUserIds.includes(participant.user_id))
  .map((participant) => participant.match_id))];
const targetMatches = matches.filter((match) => targetMatchIds.includes(match.id));
const officialMatchIds = targetMatches.filter((match) => match.match_type !== "quick").map((match) => match.id);
const quickMatchIds = targetMatches.filter((match) => match.match_type === "quick").map((match) => match.id);
const [officialEvaluations, quickEvaluations] = await Promise.all([
  fetchEvaluations(officialMatchIds, "official"),
  fetchEvaluations(quickMatchIds, "quick"),
]);
const generated = recalculateForUsers({
  targetUserIds,
  matches: targetMatches,
  participants,
  officialEvaluations,
  quickEvaluations,
});

const summary = {
  mode: runMode ? "run" : "dry-run",
  targetUserIds,
  orphanRows: Object.fromEntries(Object.entries(orphan).map(([key, rows]) => [key, rows.length])),
  orphanMatchIds: [...new Set(Object.values(orphan).flat().map((row) => row.match_id).filter(Boolean))],
  recalculationInput: {
    remainingMatchesForTargets: targetMatches.length,
    officialEvaluations: officialEvaluations.length,
    quickEvaluations: quickEvaluations.length,
  },
  willRegenerate: {
    officialMatchCards: generated.officialMatchCards.length,
    quickMatchCards: generated.quickMatchCards.length,
    currentStats: generated.currentStats.length,
    monthlyCards: generated.monthlyCards.length,
    quickMonthlyCards: generated.quickMonthlyCards.length,
  },
};

if (verbose) {
  summary.orphanDetails = Object.fromEntries(Object.entries(orphan).map(([key, rows]) => [
    key,
    rows.map((row) => ({
      id: row.id || null,
      match_id: row.match_id,
      user_id: row.user_id || null,
      evaluator_user_id: row.evaluator_user_id || null,
      target_user_id: row.target_user_id || null,
      voter_user_id: row.voter_user_id || null,
    })),
  ]));
}

console.log(JSON.stringify(summary, null, 2));

if (!runMode) {
  console.log("Dry-run only. Add --run --confirm to delete orphan rows and replace derived rows for the target users.");
  process.exit(0);
}

const orphanDeleted = await applyOrphanCleanup(orphan);
const derivedDeleted = await deleteExistingDerivedForUsers(targetUserIds);
const upserted = await applyGenerated(generated);

console.log(JSON.stringify({
  completed: true,
  orphanDeleted,
  derivedDeleted,
  upserted,
}, null, 2));
