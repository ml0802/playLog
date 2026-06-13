(function attachPlaylogEngine(root, factory) {
  const engine = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = engine;
  if (root) root.PlaylogEngine = engine;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPlaylogEngine() {
  /**
   * @typedef {"attack"|"am"|"dm"|"defense"|"free"} EvaluatedPosition
   * @typedef {"common"|"position"} ScoreCategory
   * @typedef {{id:string,evaluationId:string,category:ScoreCategory,key:string,score:number}} EvaluationScore
   * @typedef {{id:string,evaluationId:string,key:string,score:number}} EvaluationTrait
   * @typedef {{id:string,evaluationId:string,key:string}} EvaluationHighlight
   * @typedef {{
   *   id:string, matchId:string, evaluatorUserId:string, targetUserId:string,
   *   selectedPosition:EvaluatedPosition, overallComment:string, createdAt:string,
   *   version?:number, isActive?:boolean, updatedAt?:string,
   *   scores:EvaluationScore[], traits?:EvaluationTrait[], highlights?:EvaluationHighlight[]
   * }} Evaluation
   * @typedef {{
   *   id:string, matchId:string, userId:string, overallRating:number,
   *   previousOverallRating:number|null, overallChange:number|null,
   *   commonAverage:number, positionAverage:number, matchScore:number,
   *   mainEvaluatedPosition:EvaluatedPosition, selectedPositionSummary:Object,
   *   playStyle:string, playStyleCode:string|null, radarData:Object,
   *   radarChange:Object|null, positionAdaptation:Object,
   *   strengthsTop3:Object[], weaknessesTop3:Object[], matchAnalysisText:string,
   *   analysisScores:Object[], analysisChanges:Object[],
   *   reliabilityLevel:"low"|"medium"|"normal"|"high", evaluatorCount:number,
   *   generatedAt:string
   * }} PlayerMatchCard
   * @typedef {{
   *   userId:string, currentOVR:number, previousOVR:number|null, ovrChange:number|null,
   *   radarData:Object, radarChange:Object|null, currentPlayStyle:string,
   *   previousPlayStyle:string|null, currentMainPosition:EvaluatedPosition|null,
   *   positionAdaptation:Object, reliabilityLevel:"low"|"medium"|"normal"|"high",
   *   recentMatchCount:number, generatedAt:string
   * }} PlayerCurrentStats
   * @typedef {{
   *   userId:string, monthKey:string, monthlyOVR:number,
   *   previousMonthlyOVR:number|null, monthlyOVRChange:number|null,
   *   radarData:Object, mainPlayStyle:string, mainPosition:EvaluatedPosition|null,
   *   positionAdaptation:Object, matchCount:number,
   *   strengthsSummary:Object[], weaknessesSummary:Object[], generatedAt:string
   * }} PlayerMonthlyCard
   */

  const POSITIONS = ["attack", "am", "dm", "defense", "free"];
  const POSITION_ALIASES = { cam: "am", cdm: "dm" };
  const EVALUATION_FIELDS = {
    common: [
      { key: "activity", label: "활동량", description: "경기 내 움직임의 양과 적극성" },
      { key: "decision", label: "판단력", description: "상황에 맞는 선택과 플레이 판단" },
      { key: "stablePass", label: "안정적 패스", description: "안정적으로 연결되는 패스 능력" },
      { key: "buildUp", label: "빌드업 능력", description: "공격 전개 흐름을 만드는 능력" },
      { key: "firstTouch", label: "퍼스트터치", description: "공을 처음 받는 순간의 안정감" },
      { key: "dribbleImpact", label: "드리블 영향력", description: "드리블로 흐름을 바꾸는 능력" },
      { key: "composure", label: "침착성", description: "압박 상황에서도 흔들리지 않는 안정감" },
      { key: "offTheBall", label: "오프더볼", description: "공이 없을 때 움직임과 위치선정" },
      { key: "concentration", label: "집중력", description: "경기 내 집중 유지 능력" },
      { key: "stamina", label: "체력", description: "경기 끝까지 유지되는 활동 에너지" },
    ],
    position: {
      attack: [
        { key: "finishing", label: "골 결정력", description: "득점으로 마무리하는 능력" },
        { key: "attackingPositioning", label: "공격 위치선정", description: "득점 기회를 만드는 움직임" },
        { key: "attackingLinkUp", label: "공격 연계", description: "주변 공격수와 연결되는 플레이" },
        { key: "frontPressure", label: "전방 압박", description: "앞선에서 압박을 시도하는 적극성" },
        { key: "ballKeeping", label: "볼 간수 능력", description: "압박 속에서도 공을 지키는 능력" },
      ],
      am: [
        { key: "chanceMaking", label: "찬스 메이킹", description: "기회를 만들어내는 플레이 능력" },
        { key: "gameControl", label: "경기 조율", description: "경기 흐름과 템포를 조절하는 능력" },
        { key: "creativeBuildUp", label: "창의적 전개", description: "예상하지 못한 공격 전개 능력" },
        { key: "pressureEscape", label: "탈압박", description: "압박 상황을 벗어나는 능력" },
        { key: "forwardProgression", label: "전진 전개", description: "공격 방향으로 흐름을 이어가는 능력" },
      ],
      dm: [
        { key: "interception", label: "인터셉트", description: "상대 패스를 끊어내는 능력" },
        { key: "deepBuildUp", label: "후방 빌드업", description: "뒤에서 공격 전개를 시작하는 능력" },
        { key: "pressureResistance", label: "압박 대응", description: "압박 속에서도 안정적으로 플레이하는 능력" },
        { key: "defensiveCover", label: "수비 커버", description: "동료 수비를 보조하는 움직임" },
        { key: "pressingTiming", label: "압박 타이밍", description: "적절한 순간 압박에 들어가는 판단" },
      ],
      defense: [
        { key: "manMarking", label: "대인 방어", description: "상대 선수를 직접 막아내는 능력" },
        { key: "coverPlay", label: "커버 플레이", description: "위험 공간을 메우는 수비 움직임" },
        { key: "buildUpStability", label: "빌드업 안정감", description: "수비 지역에서 안정적으로 연결하는 능력" },
        { key: "defensivePrediction", label: "예측 수비", description: "상대 움직임을 읽고 대응하는 능력" },
        { key: "pressingTiming", label: "압박 타이밍", description: "적절한 순간 압박에 들어가는 판단" },
      ],
      free: [
        { key: "allAreaInvolvement", label: "전방위 관여도", description: "경기 전반에 폭넓게 관여하는 능력" },
        { key: "spaceConnection", label: "공간 연결", description: "빈 공간과 흐름을 이어주는 움직임" },
        { key: "activityRange", label: "활동 범위", description: "넓은 지역에서 움직이는 활동량" },
        { key: "fluidity", label: "유동성", description: "고정되지 않고 자유롭게 움직이는 플레이" },
        { key: "allRoundContribution", label: "올라운드 기여도", description: "공수 전체에 기여하는 플레이 능력" },
      ],
    },
    traits: [
      { key: "teamwork", label: "팀플레이", description: "동료와 조화를 이루는 플레이 성향" },
      { key: "aggression", label: "적극성", description: "플레이를 먼저 시도하는 적극적인 성향" },
      { key: "boldness", label: "대담성", description: "과감한 선택을 시도하는 성향" },
      { key: "creativity", label: "창의성", description: "예상 밖 플레이를 만들어내는 성향" },
      { key: "vision", label: "시야", description: "넓게 보고 연결을 만드는 성향" },
      { key: "anticipation", label: "예측력", description: "상황을 미리 읽는 플레이 감각" },
      { key: "leadership", label: "리더십", description: "팀 분위기와 흐름을 이끄는 성향" },
      { key: "winningMentality", label: "승부욕", description: "끝까지 승부를 포기하지 않는 성향" },
    ],
    highlights: [
      { key: "ballControl", label: "볼 컨트롤" },
      { key: "pace", label: "주력" },
      { key: "physical", label: "몸싸움" },
      { key: "kickPower", label: "킥력" },
      { key: "agility", label: "민첩성" },
      { key: "balance", label: "밸런스" },
      { key: "passSense", label: "패스 센스" },
    ],
  };
  const COMMON_KEYS = EVALUATION_FIELDS.common.map((field) => field.key);
  const POSITION_KEYS = Object.fromEntries(Object.entries(EVALUATION_FIELDS.position)
    .map(([position, fields]) => [position, fields.map((field) => field.key)]));
  const QUICK_EVALUATION_FIELDS = {
    common: [
      { key: "activity", label: "활동량", mapsTo: ["activity", "stamina"] },
      { key: "pass", label: "패스", mapsTo: ["stablePass", "buildUp"] },
      { key: "ballControl", label: "볼 컨트롤", mapsTo: ["firstTouch", "dribbleImpact"] },
      { key: "decision", label: "판단력", mapsTo: ["decision", "composure"] },
      { key: "gameUnderstanding", label: "경기 이해도", mapsTo: ["offTheBall", "concentration"] },
    ],
    positionPerformance: { key: "positionPerformance", label: "포지션 수행도" },
  };
  const LABELS = {
    activity: "활동량", decision: "판단력", stablePass: "안정적 패스", buildUp: "빌드업 능력",
    firstTouch: "퍼스트터치", dribbleImpact: "드리블 영향력", composure: "침착성",
    offTheBall: "오프더볼", concentration: "집중력", stamina: "체력",
    finishing: "골 결정력", attackingPositioning: "공격 위치선정", attackingLinkUp: "공격 연계",
    frontPressure: "전방 압박", ballKeeping: "볼 간수 능력", chanceMaking: "찬스 메이킹",
    gameControl: "경기 조율", creativeBuildUp: "창의적 전개", pressureEscape: "탈압박",
    forwardProgression: "전진 전개", interception: "인터셉트", deepBuildUp: "후방 빌드업",
    pressureResistance: "압박 대응", defensiveCover: "수비 커버", pressingTiming: "압박 타이밍",
    manMarking: "대인 방어", coverPlay: "커버 플레이", buildUpStability: "빌드업 안정감",
    defensivePrediction: "예측 수비", allAreaInvolvement: "전방위 관여도",
    spaceConnection: "공간 연결", activityRange: "활동 범위", fluidity: "유동성",
    allRoundContribution: "올라운드 기여도",
  };
  const PLAY_STYLE_RULES = {
    attack: [
      { name: "침투형 피니셔", code: "Advanced Forward · AF", metrics: ["attackingPositioning", "finishing", "anticipation", "boldness"] },
      { name: "연계형 스트라이커", code: "Target Forward · TF", metrics: ["attackingLinkUp", "ballKeeping", "teamwork", "vision"] },
      { name: "압박형 포워드", code: "Pressing Forward · PF", metrics: ["frontPressure", "activity", "aggression", "winningMentality"] },
    ],
    am: [
      { name: "창의형 플레이메이커", code: "Advanced Playmaker · AP", metrics: ["chanceMaking", "creativeBuildUp", "creativity", "vision"] },
      { name: "조율형 플레이메이커", code: "Enganche · EG", metrics: ["gameControl", "stablePass", "teamwork", "vision"] },
      { name: "로밍 플레이메이커", code: "Roaming Playmaker · RPM", metrics: ["forwardProgression", "activity", "aggression", "boldness"] },
    ],
    dm: [
      { name: "후방 조율자", code: "Deep Lying Playmaker · DLP", metrics: ["deepBuildUp", "stablePass", "vision", "teamwork"] },
      { name: "압박형 수미", code: "Ball Winning Midfielder · BWM", metrics: ["interception", "pressingTiming", "aggression", "winningMentality"] },
      { name: "안정형 앵커", code: "Anchor · A", metrics: ["defensiveCover", "pressureResistance", "anticipation", "composure"] },
    ],
    defense: [
      { name: "빌드업 수비수", code: "Ball Playing Defender · BPD", metrics: ["buildUpStability", "stablePass", "vision", "composure"] },
      { name: "커버형 수비수", code: "Central Defender · CD", metrics: ["coverPlay", "defensivePrediction", "anticipation", "teamwork"] },
      { name: "대인 집중형 수비수", code: "No-Nonsense Centre-Back · NCB", metrics: ["manMarking", "pressingTiming", "aggression", "winningMentality"] },
    ],
    free: [
      { name: "연결형 프리롤", code: "Link Playmaker", metrics: ["spaceConnection", "stablePass", "teamwork", "vision"] },
      { name: "에너지형 프리롤", code: "Energy Freerole", metrics: ["activityRange", "activity", "aggression", "stamina"] },
      { name: "밸런스형 올라운더", code: "All-Round Player", metrics: ["allRoundContribution", "fluidity", "anticipation", "leadership"] },
    ],
  };
  const POSITION_ANALYSIS_PRIORITY = {
    attack: ["finishing", "attackingPositioning", "attackingLinkUp", "frontPressure", "ballKeeping", "offTheBall", "dribbleImpact", "composure"],
    am: ["chanceMaking", "gameControl", "creativeBuildUp", "pressureEscape", "forwardProgression", "decision", "buildUp", "stablePass", "creativity", "vision"],
    dm: ["interception", "deepBuildUp", "pressureResistance", "defensiveCover", "pressingTiming", "concentration", "decision", "stamina", "anticipation"],
    defense: ["manMarking", "coverPlay", "buildUpStability", "defensivePrediction", "pressingTiming", "concentration", "composure", "decision"],
    free: ["allAreaInvolvement", "spaceConnection", "activityRange", "fluidity", "allRoundContribution", "activity", "offTheBall", "teamwork", "vision"],
  };
  const ANALYSIS_DEFINITION_ORDER = [
    ...COMMON_KEYS,
    ...POSITIONS.flatMap((position) => POSITION_KEYS[position]),
  ];

  function normalizedPosition(position) {
    return POSITION_ALIASES[position] || position;
  }

  function round(value, precision = 2) {
    const multiple = 10 ** precision;
    return Math.round(value * multiple) / multiple;
  }

  function average(values) {
    const valid = values.filter((value) => Number.isFinite(value));
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
  }

  function scoreValues(scores, category) {
    return scores
      .filter((score) => !category || score.category === category)
      .map((score) => score.score);
  }

  function expandQuickEvaluation(evaluation) {
    if (!evaluation || evaluation.evaluationType !== "quick") return evaluation;
    const quickScores = evaluation.quickScores || {};
    const selectedPosition = normalizedPosition(evaluation.selectedPosition) || "free";
    const commonScores = QUICK_EVALUATION_FIELDS.common.flatMap((field) => {
      const value = Number(quickScores[field.key]);
      if (!Number.isFinite(value)) return [];
      return field.mapsTo.map((key) => ({
        id: `${evaluation.id}:common:${key}`,
        evaluationId: evaluation.id,
        category: "common",
        key,
        score: value,
      }));
    });
    const positionValue = Number(quickScores.positionPerformance);
    const positionScores = Number.isFinite(positionValue)
      ? (EVALUATION_FIELDS.position[selectedPosition] || []).map((field) => ({
        id: `${evaluation.id}:position:${field.key}`,
        evaluationId: evaluation.id,
        category: "position",
        key: field.key,
        score: positionValue,
      }))
      : [];
    return {
      ...evaluation,
      selectedPosition,
      scores: [...commonScores, ...positionScores],
    };
  }

  function expandQuickEvaluations(evaluations = []) {
    return evaluations.map(expandQuickEvaluation);
  }

  function calculateCommonAverage(scores) {
    const value = average(scoreValues(scores, "common"));
    return value === null ? null : round(value);
  }

  function calculatePositionAverage(scores) {
    const value = average(scoreValues(scores, "position"));
    return value === null ? null : round(value);
  }

  function calculateMatchScore(commonAverage, positionAverage) {
    if (!Number.isFinite(commonAverage) || !Number.isFinite(positionAverage)) return null;
    return round(commonAverage * 0.7 + positionAverage * 0.3);
  }

  function calculateOverallRating(matchScore) {
    return Number.isFinite(matchScore) ? Math.round(40 + matchScore * 5.5) : null;
  }

  function averagesByKey(scores) {
    const grouped = scores.reduce((result, score) => {
      if (!result[score.key]) result[score.key] = [];
      result[score.key].push(score.score);
      return result;
    }, {});
    return Object.fromEntries(Object.entries(grouped).map(([key, values]) => [key, round(average(values))]));
  }

  function calculateRadar(commonScores) {
    const values = averagesByKey(commonScores.filter((score) => score.category === "common"));
    const activity = average([values.activity, values.stamina]);
    const gameSense = average([values.decision, values.concentration]);
    const pass = average([values.stablePass, values.buildUp]);
    const ballControl = average([values.firstTouch, values.dribbleImpact]);
    const movement = Number.isFinite(values.offTheBall) && Number.isFinite(values.activity)
      ? values.offTheBall * 0.7 + values.activity * 0.3 : null;
    const mentality = Number.isFinite(values.composure) && Number.isFinite(values.concentration)
      ? values.composure * 0.7 + values.concentration * 0.3 : null;
    const toRadar = (value) => Number.isFinite(value) ? Math.round(value * 10) : null;
    return {
      activity: toRadar(activity),
      gameSense: toRadar(gameSense),
      pass: toRadar(pass),
      ballControl: toRadar(ballControl),
      movement: toRadar(movement),
      mentality: toRadar(mentality),
    };
  }

  function calculateReliability(evaluatorCount) {
    if (evaluatorCount >= 5) return "high";
    if (evaluatorCount >= 3) return "normal";
    if (evaluatorCount === 2) return "medium";
    return "low";
  }

  function calculateSelectedPositionSummary(evaluations) {
    const total = evaluations.length;
    return POSITIONS.reduce((summary, position) => {
      const count = evaluations.filter((evaluation) => normalizedPosition(evaluation.selectedPosition) === position).length;
      summary[position] = { count, share: total ? round(count / total, 3) : 0 };
      return summary;
    }, {});
  }

  function calculateMainEvaluatedPosition(evaluations) {
    const summary = calculateSelectedPositionSummary(evaluations);
    return POSITIONS
      .map((position) => ({
        position,
        count: summary[position].count,
        average: calculatePositionAverage(evaluations
          .filter((evaluation) => normalizedPosition(evaluation.selectedPosition) === position)
          .flatMap((evaluation) => evaluation.scores || [])),
      }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count || (right.average || 0) - (left.average || 0))[0]?.position || null;
  }

  function calculatePositionAdaptation(evaluations) {
    const total = evaluations.length;
    return POSITIONS.reduce((adaptation, position) => {
      const selected = evaluations.filter((evaluation) => normalizedPosition(evaluation.selectedPosition) === position);
      if (!selected.length) {
        adaptation[position] = null;
        return adaptation;
      }
      const positionAverage = calculatePositionAverage(selected.flatMap((evaluation) => evaluation.scores || []));
      adaptation[position] = {
        evaluatorCount: selected.length,
        share: round(selected.length / total, 3),
        positionAverage,
        adaptationRating: calculateOverallRating(positionAverage),
      };
      return adaptation;
    }, {});
  }

  function averagedTraits(evaluations) {
    return averagesByKey(evaluations.flatMap((evaluation) =>
      (evaluation.traits || []).map((trait) => ({ key: trait.key, score: trait.score })),
    ));
  }

  function calculatePlayStyle(position, positionScores, traits, commonScores = []) {
    const traitMap = Array.isArray(traits) ? averagesByKey(traits) : traits;
    if (!Object.keys(traitMap || {}).length || !position || !PLAY_STYLE_RULES[position]) {
      return { playStyle: "분석 준비중", playStyleCode: null };
    }
    const metrics = { ...averagesByKey(commonScores), ...averagesByKey(positionScores), ...traitMap };
    const ranked = PLAY_STYLE_RULES[position]
      .map((rule) => ({ ...rule, score: average(rule.metrics.map((key) => metrics[key])) || 0 }))
      .sort((left, right) => right.score - left.score);
    return { playStyle: ranked[0].name, playStyleCode: ranked[0].code };
  }

  function analysisRank(priorityKeys, key) {
    const index = priorityKeys.indexOf(key);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
  }

  function playStyleAnalysisPriority(position, playStyle) {
    const rules = PLAY_STYLE_RULES[position] || [];
    return rules.find((rule) => rule.name === playStyle)?.metrics || [];
  }

  function compareAnalysisTie(left, right, { mainEvaluatedPosition = null, playStyle = null } = {}) {
    const positionPriority = POSITION_ANALYSIS_PRIORITY[mainEvaluatedPosition] || [];
    const stylePriority = playStyleAnalysisPriority(mainEvaluatedPosition, playStyle);
    const priorityGroups = [positionPriority, stylePriority, COMMON_KEYS, ANALYSIS_DEFINITION_ORDER];

    for (const group of priorityGroups) {
      const difference = analysisRank(group, left.key) - analysisRank(group, right.key);
      if (difference) return difference;
    }
    return 0;
  }

  function rankedAnalysisItems(scores, direction, limit, context = {}) {
    const items = analysisScoreItems(scores);
    return items.sort((left, right) => {
      const scoreDifference = direction === "high" ? right.score - left.score : left.score - right.score;
      return scoreDifference || compareAnalysisTie(left, right, context);
    }).slice(0, limit);
  }

  function analysisScoreItems(scores) {
    return Object.entries(averagesByKey(scores)).map(([key, score]) => ({
      key,
      label: LABELS[key] || key,
      score,
      category: COMMON_KEYS.includes(key) ? "common" : "position",
    }));
  }

  function withParticle(text, consonantParticle, vowelParticle) {
    const lastChar = text.charCodeAt(text.length - 1);
    const hasBatchim = lastChar >= 0xac00 && lastChar <= 0xd7a3 && (lastChar - 0xac00) % 28 !== 0;
    return `${text}${hasBatchim ? consonantParticle : vowelParticle}`;
  }

  function formatAnalysisLabels(items) {
    const labels = items.map((item) => item.label);
    if (labels.length < 2) return labels[0];
    const finalLabel = labels.pop();
    return `${labels.slice(0, -1).join(", ")}${labels.length > 1 ? ", " : ""}${withParticle(labels.at(-1), "과", "와")} ${finalLabel}`;
  }

  function generateMatchAnalysis(scores, context = {}) {
    const strengthsTop3 = rankedAnalysisItems(scores, "high", 3, context);
    const weaknessesTop3 = rankedAnalysisItems(scores, "low", 3, context);
    const strengthLabels = formatAnalysisLabels(strengthsTop3);
    const weaknessLabels = formatAnalysisLabels(weaknessesTop3);
    const messages = [];
    if (strengthLabels) messages.push(`${strengthLabels}에서 좋은 평가를 받았습니다.`);
    if (weaknessLabels) messages.push(`${withParticle(weaknessLabels, "은", "는")} 다음 경기에서 보완할 여지가 있습니다.`);
    return { strengthsTop3, weaknessesTop3, matchAnalysisText: messages.join(" ") };
  }

  function calculateAnalysisChanges(latestCard, previousCards) {
    const comparisonCards = (previousCards || [])
      .filter((card) => card
        && card.userId === latestCard.userId
        && card.id !== latestCard.id
        && card.matchId !== latestCard.matchId)
      .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())
      .slice(0, 3);
    if (!comparisonCards.length || !Array.isArray(latestCard.analysisScores)) return [];

    const previousScores = comparisonCards.map((card) =>
      Object.fromEntries((card.analysisScores || []).map((item) => [item.key, item.score])),
    );
    const context = {
      mainEvaluatedPosition: latestCard.mainEvaluatedPosition,
      playStyle: latestCard.playStyle,
    };
    return latestCard.analysisScores
      .flatMap((item) => {
        const scores = previousScores.map((snapshot) => snapshot[item.key]).filter((score) => Number.isFinite(score));
        if (!scores.length) return [];
        const previousRecentAverage = round(average(scores));
        const diff = round(item.score - previousRecentAverage);
        return [{
          key: item.key,
          label: item.label,
          category: item.category,
          currentScore: item.score,
          previousRecentAverage,
          diff,
          comparisonMatchCount: scores.length,
        }];
      })
      .sort((left, right) => {
        const directionDifference = (left.diff < 0 ? 1 : 0) - (right.diff < 0 ? 1 : 0);
        if (directionDifference) return directionDifference;
        const diffOrder = left.diff > 0 ? right.diff - left.diff : left.diff - right.diff;
        return diffOrder || compareAnalysisTie(left, right, context);
      });
  }

  function calculateRadarChange(radarData, previousRadarData) {
    if (!previousRadarData) return null;
    return Object.fromEntries(Object.entries(radarData).map(([key, value]) => [
      key,
      Number.isFinite(value) && Number.isFinite(previousRadarData[key]) ? value - previousRadarData[key] : null,
    ]));
  }

  function recentCardsForUser(userId, cards) {
    return cards
      .filter((card) => card && card.userId === userId)
      .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());
  }

  function recentWindow(cards) {
    const usedCards = cards.length >= 4 ? cards.slice(0, 4) : cards;
    const weights = usedCards.length >= 4
      ? [0.4, 0.3, 0.2, 0.1]
      : usedCards.map(() => 1 / usedCards.length);
    return { cards: usedCards, weights };
  }

  function weightedValues(items, valueSelector) {
    const selected = items.map(({ item, weight }) => ({ value: valueSelector(item), weight }))
      .filter(({ value }) => Number.isFinite(value));
    const weightTotal = selected.reduce((total, entry) => total + entry.weight, 0);
    return weightTotal
      ? selected.reduce((total, entry) => total + entry.value * entry.weight, 0) / weightTotal
      : null;
  }

  function calculateWeightedRecentAverage(cards, valueSelector = (card) => card.overallRating) {
    const window = recentWindow(cards);
    const value = weightedValues(window.cards.map((card, index) => ({ item: card, weight: window.weights[index] })), valueSelector);
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  function calculateRadarAverage(cards) {
    const window = recentWindow(cards);
    const entries = window.cards.map((card, index) => ({ item: card, weight: window.weights[index] }));
    const radarKeys = new Set(window.cards.flatMap((card) => Object.keys(card.radarData || {})));
    return Object.fromEntries([...radarKeys].map((key) => {
      const value = weightedValues(entries, (card) => card.radarData?.[key]);
      return [key, Number.isFinite(value) ? Math.round(value) : null];
    }));
  }

  function calculateCurrentPlayStyle(cards) {
    const window = recentWindow(cards).cards;
    const mainPosition = calculateCurrentMainPosition(cards);
    const positionMatched = mainPosition
      ? window.filter((card) =>
        (card.mainEvaluatedPosition === mainPosition || card.selectedPositionSummary?.[mainPosition]?.count > 0)
        && card.playStyle
        && card.playStyle !== "분석 준비중")
      : [];
    const valid = positionMatched.length
      ? positionMatched
      : window.filter((card) => card.playStyle && card.playStyle !== "분석 준비중");
    if (!valid.length) return "분석 준비중";
    const counts = valid.reduce((summary, card) => {
      summary[card.playStyle] = (summary[card.playStyle] || 0) + 1;
      return summary;
    }, {});
    const maximum = Math.max(...Object.values(counts));
    return valid.find((card) => counts[card.playStyle] === maximum).playStyle;
  }

  function calculateCurrentMainPosition(cards) {
    const window = recentWindow(cards).cards;
    if (!window.length) return null;
    const summary = window.reduce((positions, card, index) => {
      const selectedEntries = Object.entries(card.selectedPositionSummary || {})
        .filter(([position, item]) => POSITIONS.includes(position) && item?.count > 0);
      const entries = selectedEntries.length
        ? selectedEntries
        : [[card.mainEvaluatedPosition, { count: card.mainEvaluatedPosition ? 1 : 0 }]];
      entries.forEach(([position, item]) => {
        if (!POSITIONS.includes(position) || !item?.count) return;
        if (!positions[position]) {
          positions[position] = {
            position,
            count: 0,
            score: 0,
            scoreCount: 0,
            latestIndex: Number.POSITIVE_INFINITY,
          };
        }
        positions[position].count += item.count;
        const positionScore = card.positionAdaptation?.[position]?.adaptationRating
          ?? card.positionAdaptation?.[position]?.positionAverage
          ?? card.overallRating;
        if (Number.isFinite(positionScore)) {
          positions[position].score += positionScore;
          positions[position].scoreCount += 1;
        }
        if (card.mainEvaluatedPosition === position || item.count > 0) {
          positions[position].latestIndex = Math.min(positions[position].latestIndex, index);
        }
      });
      return positions;
    }, {});
    return Object.values(summary).sort((left, right) => {
      const leftScore = left.scoreCount ? left.score / left.scoreCount : 0;
      const rightScore = right.scoreCount ? right.score / right.scoreCount : 0;
      return right.count - left.count
        || rightScore - leftScore
        || left.latestIndex - right.latestIndex;
    })[0]?.position || null;
  }

  function calculateCurrentPositionAdaptation(cards) {
    const window = recentWindow(cards);
    const entries = window.cards.map((card, index) => ({ item: card, weight: window.weights[index] }));
    return POSITIONS.reduce((adaptation, position) => {
      const available = entries.filter(({ item }) => item.positionAdaptation?.[position]);
      if (!available.length) {
        adaptation[position] = null;
        return adaptation;
      }
      const positionAverage = weightedValues(available, (card) => card.positionAdaptation[position].positionAverage);
      const adaptationRating = weightedValues(available, (card) => card.positionAdaptation[position].adaptationRating);
      adaptation[position] = {
        positionAverage: Number.isFinite(positionAverage) ? round(positionAverage) : null,
        adaptationRating: Number.isFinite(adaptationRating) ? Math.round(adaptationRating) : null,
        recentMatchCount: available.length,
      };
      return adaptation;
    }, {});
  }

  function generatePlayerCurrentStats({ userId, cards, previousStats = null, generatedAt = new Date().toISOString() }) {
    const recentCards = recentCardsForUser(userId, cards);
    if (!recentCards.length) return null;
    const window = recentWindow(recentCards);
    const currentOVR = calculateWeightedRecentAverage(recentCards);
    const radarData = calculateRadarAverage(recentCards);
    const averageEvaluatorCount = weightedValues(
      window.cards.map((card, index) => ({ item: card, weight: window.weights[index] })),
      (card) => card.evaluatorCount,
    );
    return {
      userId,
      currentOVR,
      previousOVR: previousStats?.currentOVR ?? null,
      ovrChange: previousStats ? currentOVR - previousStats.currentOVR : null,
      radarData,
      radarChange: calculateRadarChange(radarData, previousStats?.radarData),
      currentPlayStyle: calculateCurrentPlayStyle(recentCards),
      previousPlayStyle: previousStats?.currentPlayStyle ?? null,
      currentMainPosition: calculateCurrentMainPosition(recentCards),
      positionAdaptation: calculateCurrentPositionAdaptation(recentCards),
      reliabilityLevel: calculateReliability(averageEvaluatorCount),
      recentMatchCount: recentCards.length,
      generatedAt,
    };
  }

  function monthlyCardsForUser(userId, monthKey, cards) {
    return cards
      .filter((card) => card
        && card.userId === userId
        && typeof card.generatedAt === "string"
        && card.generatedAt.slice(0, 7) === monthKey)
      .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());
  }

  function calculateMonthlyRadarAverage(cards) {
    const radarKeys = new Set(cards.flatMap((card) => Object.keys(card.radarData || {})));
    return Object.fromEntries([...radarKeys].map((key) => {
      const value = average(cards.map((card) => card.radarData?.[key]));
      return [key, Number.isFinite(value) ? Math.round(value) : null];
    }));
  }

  function monthlyMode(cards, selector, fallback) {
    const valid = cards.filter((card) => selector(card) && selector(card) !== "분석 준비중");
    if (!valid.length) return fallback;
    const counts = valid.reduce((summary, card) => {
      const value = selector(card);
      summary[value] = (summary[value] || 0) + 1;
      return summary;
    }, {});
    const maximum = Math.max(...Object.values(counts));
    return selector(valid.find((card) => counts[selector(card)] === maximum));
  }

  function calculateMonthlyMainPosition(cards) {
    if (!cards.length) return null;
    const summary = cards.reduce((positions, card, index) => {
      const selectedEntries = Object.entries(card.selectedPositionSummary || {})
        .filter(([position, item]) => POSITIONS.includes(position) && item?.count > 0);
      const entries = selectedEntries.length
        ? selectedEntries
        : [[card.mainEvaluatedPosition, { count: card.mainEvaluatedPosition ? 1 : 0 }]];
      entries.forEach(([position, item]) => {
        if (!POSITIONS.includes(position) || !item?.count) return;
        if (!positions[position]) {
          positions[position] = {
            position,
            count: 0,
            score: 0,
            scoreCount: 0,
            latestIndex: Number.POSITIVE_INFINITY,
          };
        }
        positions[position].count += item.count;
        const positionScore = card.positionAdaptation?.[position]?.adaptationRating
          ?? card.positionAdaptation?.[position]?.positionAverage
          ?? card.overallRating;
        if (Number.isFinite(positionScore)) {
          positions[position].score += positionScore;
          positions[position].scoreCount += 1;
        }
        if (card.mainEvaluatedPosition === position || item.count > 0) {
          positions[position].latestIndex = Math.min(positions[position].latestIndex, index);
        }
      });
      return positions;
    }, {});
    return Object.values(summary).sort((left, right) => {
      const leftScore = left.scoreCount ? left.score / left.scoreCount : 0;
      const rightScore = right.scoreCount ? right.score / right.scoreCount : 0;
      return right.count - left.count
        || rightScore - leftScore
        || left.latestIndex - right.latestIndex;
    })[0]?.position || null;
  }

  function cardsForMonthlyPosition(cards, position) {
    if (!position) return [];
    return cards.filter((card) =>
      card.mainEvaluatedPosition === position
      || card.selectedPositionSummary?.[position]?.count > 0);
  }

  function calculateMonthlyPositionAdaptation(cards) {
    return POSITIONS.reduce((adaptation, position) => {
      const available = cards.map((card) => card.positionAdaptation?.[position]).filter(Boolean);
      if (!available.length) {
        adaptation[position] = null;
        return adaptation;
      }
      const positionAverage = average(available.map((item) => item.positionAverage));
      const adaptationRating = average(available.map((item) => item.adaptationRating));
      adaptation[position] = {
        positionAverage: Number.isFinite(positionAverage) ? round(positionAverage) : null,
        adaptationRating: Number.isFinite(adaptationRating) ? Math.round(adaptationRating) : null,
        matchCount: available.length,
      };
      return adaptation;
    }, {});
  }

  function calculateMonthlySummary(cards, key) {
    const entries = cards.flatMap((card) => card[key] || []);
    const counted = entries.reduce((summary, item) => {
      if (!summary[item.key]) {
        summary[item.key] = { key: item.key, label: item.label || LABELS[item.key] || item.key, count: 0 };
      }
      summary[item.key].count += 1;
      return summary;
    }, {});
    const recentOrder = entries.reduce((order, item, index) => {
      if (!(item.key in order)) order[item.key] = index;
      return order;
    }, {});
    return Object.values(counted)
      .sort((left, right) => right.count - left.count || recentOrder[left.key] - recentOrder[right.key])
      .slice(0, 3);
  }

  function generatePlayerMonthlyCard({ userId, monthKey, cards, previousMonthlyCard = null, generatedAt = new Date().toISOString() }) {
    const monthlyCards = monthlyCardsForUser(userId, monthKey, cards);
    if (!monthlyCards.length) return null;
    const monthlyOVR = Math.round(average(monthlyCards.map((card) => card.overallRating)));
    const mainPosition = calculateMonthlyMainPosition(monthlyCards);
    const positionCards = cardsForMonthlyPosition(monthlyCards, mainPosition);
    return {
      userId,
      monthKey,
      monthlyOVR,
      previousMonthlyOVR: previousMonthlyCard?.monthlyOVR ?? null,
      monthlyOVRChange: previousMonthlyCard ? monthlyOVR - previousMonthlyCard.monthlyOVR : null,
      radarData: calculateMonthlyRadarAverage(monthlyCards),
      mainPlayStyle: monthlyMode(positionCards, (card) => card.playStyle, "분석 준비중"),
      mainPosition,
      positionAdaptation: calculateMonthlyPositionAdaptation(monthlyCards),
      matchCount: monthlyCards.length,
      strengthsSummary: calculateMonthlySummary(monthlyCards, "strengthsTop3"),
      weaknessesSummary: calculateMonthlySummary(monthlyCards, "weaknessesTop3"),
      generatedAt,
    };
  }

  function generatePlayerMatchCard({ matchId, userId, evaluations, previousCard = null, previousCards = [], generatedAt = new Date().toISOString() }) {
    const peerEvaluations = evaluations.filter((evaluation) =>
      evaluation.matchId === matchId
      && evaluation.targetUserId === userId
      && evaluation.evaluatorUserId !== userId
      && evaluation.isActive !== false,
    );
    if (!peerEvaluations.length) return null;
    const scores = peerEvaluations.flatMap((evaluation) => evaluation.scores || []);
    const commonScores = scores.filter((score) => score.category === "common");
    const positionScores = scores.filter((score) => score.category === "position");
    const commonAverage = calculateCommonAverage(scores);
    const positionAverage = calculatePositionAverage(scores);
    const matchScore = calculateMatchScore(commonAverage, positionAverage);
    const overallRating = calculateOverallRating(matchScore);
    const mainEvaluatedPosition = calculateMainEvaluatedPosition(peerEvaluations);
    const style = calculatePlayStyle(mainEvaluatedPosition, positionScores, averagedTraits(peerEvaluations), commonScores);
    const radarData = calculateRadar(commonScores);
    const analysis = generateMatchAnalysis(scores, {
      mainEvaluatedPosition,
      playStyle: style.playStyle,
    });
    const evaluatorCount = new Set(peerEvaluations.map((evaluation) => evaluation.evaluatorUserId)).size;
    const card = {
      id: `player-match-card:${matchId}:${userId}`,
      matchId,
      userId,
      overallRating,
      previousOverallRating: previousCard?.overallRating ?? null,
      overallChange: previousCard ? overallRating - previousCard.overallRating : null,
      commonAverage,
      positionAverage,
      matchScore,
      mainEvaluatedPosition,
      selectedPositionSummary: calculateSelectedPositionSummary(peerEvaluations),
      playStyle: style.playStyle,
      playStyleCode: style.playStyleCode,
      radarData,
      radarChange: calculateRadarChange(radarData, previousCard?.radarData),
      positionAdaptation: calculatePositionAdaptation(peerEvaluations),
      strengthsTop3: analysis.strengthsTop3,
      weaknessesTop3: analysis.weaknessesTop3,
      matchAnalysisText: analysis.matchAnalysisText,
      analysisScores: analysisScoreItems(scores),
      reliabilityLevel: calculateReliability(evaluatorCount),
      evaluatorCount,
      generatedAt,
    };
    return { ...card, analysisChanges: calculateAnalysisChanges(card, previousCards) };
  }

  return {
    EVALUATION_FIELDS,
    QUICK_EVALUATION_FIELDS,
    COMMON_KEYS,
    POSITION_KEYS,
    POSITIONS,
    expandQuickEvaluation,
    expandQuickEvaluations,
    calculateCommonAverage,
    calculatePositionAverage,
    calculateMatchScore,
    calculateOverallRating,
    calculateRadar,
    calculateReliability,
    calculateSelectedPositionSummary,
    calculateMainEvaluatedPosition,
    calculatePositionAdaptation,
    calculatePlayStyle,
    generateMatchAnalysis,
    calculateAnalysisChanges,
    calculateWeightedRecentAverage,
    calculateRadarAverage,
    calculateCurrentPlayStyle,
    calculateCurrentMainPosition,
    generatePlayerCurrentStats,
    generatePlayerMonthlyCard,
    generatePlayerMatchCard,
  };
});
