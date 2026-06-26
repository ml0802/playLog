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

const matchId = argValue("--match-id");
const runMode = hasFlag("--run");
const confirmed = hasFlag("--confirm");

if (!matchId) {
  console.error("Usage: node scripts/supabase-match-card-repair.mjs --match-id <match_id> --dry-run");
  console.error("   or: node scripts/supabase-match-card-repair.mjs --match-id <match_id> --run --confirm");
  process.exit(1);
}

if (runMode && !confirmed) {
  console.error("Refusing to mutate data without --confirm. Run dry-run first, then add --run --confirm.");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const engineModule = await import("../playlog-engine.js");
const engine = engineModule.default || engineModule;

async function select(table, columns = "*", build = (query) => query) {
  const { data, error } = await build(supabase.from(table).select(columns));
  if (error) throw error;
  return data || [];
}

async function maybeSingle(table, columns = "*", build = (query) => query) {
  const { data, error } = await build(supabase.from(table).select(columns)).maybeSingle();
  if (error) throw error;
  return data || null;
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
      evaluationId: row.id,
      key: highlight.key,
    })),
  };
}

function fromPlayerMatchCardRow(row) {
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

function isValidOverallRating(value) {
  return typeof value === "number" && Number.isFinite(value);
}

async function fetchEvaluations(type) {
  const tables = type === "quick"
    ? ["quick_evaluations", "quick_evaluation_scores", "quick_evaluation_traits", "quick_evaluation_highlights"]
    : ["evaluations", "evaluation_scores", "evaluation_traits", "evaluation_highlights"];
  const evaluations = await select(tables[0], "*", (query) => query.eq("match_id", matchId));
  const evaluationIds = evaluations.map((row) => row.id);
  if (!evaluationIds.length) return [];
  const [scores, traits, highlights] = await Promise.all([
    select(tables[1], "*", (query) => query.in("evaluation_id", evaluationIds)),
    select(tables[2], "*", (query) => query.in("evaluation_id", evaluationIds)),
    select(tables[3], "*", (query) => query.in("evaluation_id", evaluationIds)),
  ]);
  return evaluations.map((row) => fromEvaluationRow(row, scores, traits, highlights, type));
}

function evaluationCompletion(participants, evaluations) {
  const participantIds = participants.map((participant) => participant.user_id);
  const expectedPerUser = Math.max(participantIds.length - 1, 0);
  return participants.map((participant) => {
    const targetIds = new Set(evaluations
      .filter((evaluation) =>
        evaluation.evaluatorUserId === participant.user_id
        && evaluation.evaluatorUserId !== evaluation.targetUserId
        && evaluation.isActive !== false,
      )
      .map((evaluation) => evaluation.targetUserId));
    return {
      user_id: participant.user_id,
      db_evaluation_completed: participant.evaluation_completed === true,
      submitted_targets: targetIds.size,
      expected_targets: expectedPerUser,
      complete_by_evaluations: expectedPerUser > 0 && targetIds.size >= expectedPerUser,
    };
  });
}

function normalizeComment(comment) {
  return String(comment || "").replace(/\s+/g, " ").trim();
}

function duplicateCommentReport(evaluations) {
  const grouped = new Map();
  evaluations
    .filter((evaluation) => evaluation.isActive !== false)
    .forEach((evaluation) => {
      const comment = normalizeComment(evaluation.overallComment);
      if (!comment) return;
      const key = `${evaluation.targetUserId}::${comment}`;
      const item = grouped.get(key) || {
        targetUserId: evaluation.targetUserId,
        comment,
        count: 0,
        evaluationIds: [],
        evaluatorUserIds: [],
      };
      item.count += 1;
      item.evaluationIds.push(evaluation.id);
      item.evaluatorUserIds.push(evaluation.evaluatorUserId);
      grouped.set(key, item);
    });
  return Array.from(grouped.values()).filter((item) => item.count > 1);
}

function positionIdentityDiagnostics(cards, participantsCount) {
  const maxPositionEvaluations = Math.max(participantsCount - 1, 0);
  return cards.map((card) => {
    const entries = Object.entries(card.selectedPositionSummary || {})
      .filter(([, item]) => Number(item?.count) > 0)
      .map(([position, item]) => ({ position, count: Number(item.count) }));
    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
    return {
      cardId: card.id,
      userId: card.userId,
      evaluatorCount: card.evaluatorCount,
      maxPositionEvaluations,
      totalPositionCount: totalCount,
      exceedsParticipantLimit: totalCount > maxPositionEvaluations,
      entries,
    };
  });
}

async function main() {
  const match = await maybeSingle("matches", "*", (query) => query.eq("id", matchId));
  if (!match) throw new Error(`No match found for match_id=${matchId}`);
  const matchType = match.match_type === "quick" ? "quick" : "official";
  const matchCardTable = matchType === "quick" ? "quick_player_match_cards" : "player_match_cards";
  const otherCardTable = matchType === "quick" ? "player_match_cards" : "quick_player_match_cards";

  const participants = await select("match_participants", "*", (query) => query.eq("match_id", matchId).order("joined_at"));
  const evaluations = await fetchEvaluations(matchType);
  const allVotes = await select("award_votes", "*", (query) => query.eq("match_id", matchId));
  const existingCards = await select(matchCardTable, "*", (query) => query.eq("match_id", matchId));
  const otherCards = await select(otherCardTable, "id,match_id,user_id,overall_rating", (query) => query.eq("match_id", matchId));
  const participantIds = participants.map((participant) => participant.user_id);
  const publishedAt = match.published_at || new Date().toISOString();
  const completion = evaluationCompletion(participants, evaluations);
  const targetParticipants = participants.filter((participant) =>
    participant.evaluation_completed === true
    || completion.find((item) => item.user_id === participant.user_id)?.complete_by_evaluations,
  );

  const generatedCards = [];
  const payloads = [];
  const invalidGeneratedCards = [];
  for (const participant of targetParticipants) {
    const previousRows = await select(matchCardTable, "*", (query) =>
      query
        .eq("user_id", participant.user_id)
        .neq("match_id", matchId)
        .order("generated_at", { ascending: true }),
    );
    const previousCards = previousRows.map(fromPlayerMatchCardRow);
    const previousCard = previousCards[previousCards.length - 1] || null;
    const engineEvaluations = matchType === "quick" ? engine.expandQuickEvaluations(evaluations) : evaluations;
    const card = engine.generatePlayerMatchCard({
      matchId,
      userId: participant.user_id,
      evaluations: engineEvaluations,
      previousCard,
      previousCards,
      participantUserIds: participantIds,
      generatedAt: publishedAt,
    });
    if (!card) {
      console.warn("[repair] card generation returned null", { matchId, userId: participant.user_id });
      continue;
    }
    if (matchType === "quick") {
      card.cardType = "quick";
      card.id = `quick-player-match-card:${matchId}:${participant.user_id}`;
    }
    const payload = toPlayerMatchCardRow(card);
    console.log("[repair] generated card payload", {
      match_id: payload.match_id,
      user_id: payload.user_id,
      overall_rating: payload.overall_rating,
      evaluator_count: payload.evaluator_count,
      payload,
    });
    if (!isValidOverallRating(payload.overall_rating)) {
      invalidGeneratedCards.push({
        userId: participant.user_id,
        overallRating: payload.overall_rating,
        commonAverage: payload.common_average,
        positionAverage: payload.position_average,
        matchScore: payload.match_score,
        evaluatorCount: payload.evaluator_count,
        activeSourceEvaluations: evaluations
          .filter((evaluation) =>
            evaluation.isActive !== false
            && evaluation.matchId === matchId
            && evaluation.targetUserId === participant.user_id,
          )
          .map((evaluation) => ({
            id: evaluation.id,
            evaluatorUserId: evaluation.evaluatorUserId,
            targetUserId: evaluation.targetUserId,
            selectedPosition: evaluation.selectedPosition,
            updatedAt: evaluation.updatedAt,
            createdAt: evaluation.createdAt,
            hasRatings: Boolean(evaluation.ratings && Object.keys(evaluation.ratings).length),
            hasPositionScores: Boolean(evaluation.positionScores && Object.keys(evaluation.positionScores).length),
          })),
        payload,
      });
      continue;
    }
    generatedCards.push(card);
    payloads.push(payload);
  }

  const summary = {
    mode: runMode ? "run" : "dry-run",
    match: {
      id: match.id,
      type: matchType,
      status: match.status,
      published_at: match.published_at,
    },
    participantsCount: participants.length,
    evaluationsCount: evaluations.length,
    activeEvaluationsCount: evaluations.filter((evaluation) => evaluation.isActive !== false).length,
    duplicateComments: duplicateCommentReport(evaluations),
    positionIdentityDiagnostics: positionIdentityDiagnostics(generatedCards, participants.length),
    pomVotesCount: allVotes.filter((vote) => vote.type === "pom").length,
    nextStarVotesCount: allVotes.filter((vote) => vote.type === "next_star").length,
    playerMatchCardsCount: matchType === "official" ? existingCards.length : otherCards.length,
    quickPlayerMatchCardsCount: matchType === "quick" ? existingCards.length : otherCards.length,
    completion,
    existingCards: existingCards.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      overall_rating: row.overall_rating,
    })),
    invalidGeneratedCards,
    generatedCards: generatedCards.map((card) => ({
      id: card.id,
      userId: card.userId,
      overallRating: card.overallRating,
      evaluatorCount: card.evaluatorCount,
    })),
  };
  console.log(JSON.stringify(summary, null, 2));

  if (!runMode) {
    console.log("[repair] dry-run only. Add --run --confirm to upsert generated cards.");
    return;
  }

  if (invalidGeneratedCards.length) {
    throw new Error(`Invalid generated cards found; refusing to run. Count=${invalidGeneratedCards.length}`);
  }
  const hasEnoughExistingCards = existingCards.length >= targetParticipants.length && targetParticipants.length > 0;
  if (!payloads.length && !hasEnoughExistingCards) throw new Error("No card payloads generated and existing cards are not enough; refusing to run.");
  if (payloads.length) {
    const { data, error } = await supabase
      .from(matchCardTable)
      .upsert(payloads, { onConflict: "id" })
      .select("id,match_id,user_id,overall_rating");
    if (error) throw error;
    console.log("[repair] upserted cards", data);
  } else {
    console.log("[repair] existing cards are enough; skipping card upsert", {
      existingCardsCount: existingCards.length,
      expectedCardsCount: targetParticipants.length,
    });
  }
  const { data: publishedRows, error: publishError } = await supabase
    .from("matches")
    .update({ status: "published", published_at: publishedAt })
    .eq("id", matchId)
    .select("id,status,published_at");
  if (publishError) throw publishError;
  const publishedRow = Array.isArray(publishedRows) ? publishedRows[0] : publishedRows;
  if (!publishedRow || publishedRow.status !== "published") {
    throw new Error(`Failed to publish match ${matchId}; check matches UPDATE RLS/policies.`);
  }
  console.log("[repair] published match", publishedRow);
}

main().catch((error) => {
  console.error("[repair] failed", error);
  process.exit(1);
});
