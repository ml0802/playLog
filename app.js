const commonRatings = {
  work_rate: 7,
  decision: 7,
  safe_pass: 7,
  buildup: 7,
  first_touch: 7,
  dribble_impact: 6,
  composure: 8,
  off_the_ball: 6,
  concentration: 8,
  stamina: 7,
};

const positionRatings = { attack: null, cam: 8, cdm: 7, defense: null, free: 8.6 };
const tendencies = { teamwork: 8, aggression: 7, boldness: 7, creativity: 9, vision: 8, anticipation: 7, leadership: 6, competitiveness: 8 };
const players = ["김민수", "이지훈", "박현우", "정우진", "최성민"];
const positions = [
  ["attack", "공격", "골문 앞에서 득점을 맡아요"],
  ["cam", "공미", "공격 전개와 연결을 맡아요"],
  ["cdm", "수미", "밸런스와 회수를 맡아요"],
  ["defense", "수비", "상대 공격을 막아요"],
  ["free", "프리롤", "정해진 역할보다 흐름을 만들어요"],
];
const flowSteps = ["선수 선택", "포지션 선택", "공통 필수 평가", "포지션 특화 평가", "선택 평가", "한 줄 평"];

let currentStep = 0;
let selectedPlayer = players[0];
let selectedPosition = "cam";
let commonScore = 7;
let positionScore = 8;
let selectedTraits = ["creativity", "vision"];
let toastTimer;
let friends = [
  ["김민수", "OVR +3 · 창의형 플레이메이커"],
  ["박현우", "최근 상승세 · 수비 참여도 +2"],
  ["이지훈", "안정 연결형 · 패스 성공률 상승"],
];

function average(values) {
  const usable = values.filter((value) => typeof value === "number");
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function calculateMatchScore(commonAverage, positionAverage) {
  return commonAverage * 0.7 + positionAverage * 0.3;
}

function toOvr(score) {
  return Math.round(40 + score * 5.5);
}

function radarStats(ratings) {
  return [
    ["활동성", average([ratings.work_rate, ratings.stamina])],
    ["게임 센스", average([ratings.decision, ratings.concentration])],
    ["패스", average([ratings.safe_pass, ratings.buildup])],
    ["볼 컨트롤", average([ratings.first_touch, ratings.dribble_impact])],
    ["움직임", ratings.off_the_ball * 0.75 + ratings.work_rate * 0.25],
    ["멘탈", ratings.composure * 0.7 + ratings.concentration * 0.3],
  ].map(([label, score]) => [label, Math.round(40 + score * 5.5)]);
}

function playType(positionKey, traits) {
  if (!Object.keys(traits).length) return ["분석 준비중", "More data needed"];
  if (positionKey === "cam" && traits.creativity >= 8 && traits.vision >= 8) return ["창의형 플레이메이커", "Advanced Playmaker · AP"];
  if (positionKey === "free" && traits.boldness >= 7) return ["흐름을 바꾸는 프리롤", "Free Role · FR"];
  if (traits.aggression >= 8) return ["압박형 수비수", "Pressing Defender · PD"];
  if (traits.teamwork >= 8) return ["안정 연결형", "Support Link · SL"];
  return ["균형형 플레이어", "Balanced Role · BR"];
}

function renderRadar(target, stats, size = 140) {
  const center = size / 2;
  const maxRadius = size * 0.35;
  const points = stats.map(([, score], index) => {
    const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  });
  const grid = [0.33, 0.66, 1].map((scale) => {
    const ring = stats.map((_, index) => {
      const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
      return `${center + Math.cos(angle) * maxRadius * scale},${center + Math.sin(angle) * maxRadius * scale}`;
    }).join(" ");
    return `<polygon points="${ring}" fill="none" stroke="rgba(151,132,213,.22)" />`;
  }).join("");
  const labels = stats.map(([label, score], index) => {
    const angle = Math.PI * 2 * (index / stats.length) - Math.PI / 2;
    const x = center + Math.cos(angle) * maxRadius * 1.28;
    const y = center + Math.sin(angle) * maxRadius * 1.28;
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${label}${size > 180 ? ` ${score}` : ""}</text>`;
  }).join("");

  target.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" role="img">
      <defs><linearGradient id="radarFill" x1="0" x2="1"><stop offset="0" stop-color="#6336e6" /><stop offset="1" stop-color="#a268ff" /></linearGradient></defs>
      ${grid}
      <polygon points="${points.map((point) => point.join(",")).join(" ")}" fill="url(#radarFill)" opacity=".58" stroke="#a268ff" stroke-width="2" />
      ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#b48cff" />`).join("")}
      ${labels}
    </svg>
  `;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openSheet(kind) {
  const overlay = document.querySelector("#overlay");
  const sheet = document.querySelector("#sheet");
  const templates = {
    fab: `
      <h3>무엇을 시작할까요?</h3>
      <p>플레이로그의 핵심 행동을 바로 시작합니다.</p>
      <div class="sheet-actions">
        <button class="sheet-action" data-go-sheet="evaluate" type="button">새 평가 시작 <span>›</span></button>
        <button class="sheet-action" data-toast-sheet="경기 추가는 MVP 다음 단계에서 연결됩니다" type="button">경기 추가 <span>＋</span></button>
        <button class="sheet-action" data-go-sheet="reflection" type="button">회고 작성 <span>↗</span></button>
      </div>
    `,
    friend: `
      <h3>친구 요청 보내기</h3>
      <p>닉네임을 검색해서 임시 요청을 보낼 수 있어요.</p>
      <input id="friendSearch" placeholder="예: 홍길동" />
      <button class="primary full" id="sendFriendRequest" type="button">친구 요청 보내기</button>
    `,
    card: `
      <h3>최근 변화</h3>
      <p>지난 경기 대비 OVR +3. 패스 선택이 늘고 멘탈 지표가 안정적으로 올라왔어요.</p>
      <div class="change-strip"><span>패스 +2</span><span>멘탈 +1</span><span>프리롤 +7%</span></div>
      <button class="primary full" data-close-sheet type="button">확인</button>
    `,
  };
  sheet.innerHTML = templates[kind];
  overlay.hidden = false;

  sheet.querySelectorAll("[data-go-sheet]").forEach((button) => {
    button.addEventListener("click", () => {
      closeSheet();
      setView(button.dataset.goSheet);
      showToast(button.dataset.goSheet === "evaluate" ? "새 평가를 시작합니다" : "개인 회고를 작성합니다");
    });
  });
  sheet.querySelectorAll("[data-toast-sheet]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toastSheet));
  });
  sheet.querySelector("[data-close-sheet]")?.addEventListener("click", closeSheet);
  sheet.querySelector("#sendFriendRequest")?.addEventListener("click", () => {
    const input = sheet.querySelector("#friendSearch");
    const name = input.value.trim() || "새 친구";
    friends = [[name, "요청 보냄 · 수락 대기"], ...friends];
    renderFriends();
    closeSheet();
    showToast("친구 요청을 보냈습니다");
  });
}

function closeSheet() {
  document.querySelector("#overlay").hidden = true;
  document.querySelector("#fab").classList.remove("open");
}

function renderHome() {
  const matchScore = calculateMatchScore(average(Object.values(commonRatings)), average([6.7]));
  document.querySelector("#homeOvr").textContent = toOvr(matchScore);
  renderRadar(document.querySelector("#homeRadar"), radarStats(commonRatings));
  const rows = [
    ["W", "용산 토요 풋살", "2026.05.18 (월) · 용산 더베이스", 76],
    ["W", "망원 수요 풋살", "2026.05.15 (금) · 망원 풋살장", 74],
    ["D", "상암 일요 풋살", "2026.05.12 (화) · 상암 풋살장", 72],
  ];
  document.querySelector("#recentMatches").innerHTML = rows.map(([result, title, meta, ovr]) => `
    <button class="recent-row" data-toast="경기 카드 상세를 열었습니다" type="button">
      <span class="result-dot ${result === "D" ? "draw" : ""}">${result}</span>
      <div><h3>${title}</h3><p>${meta}</p></div>
      <strong>OVR ${ovr} ›</strong>
    </button>
  `).join("");
}

function renderStepper() {
  document.querySelector("#stepper").innerHTML = flowSteps.map((_, index) => `<span class="${index < currentStep ? "done" : index === currentStep ? "current" : ""}"></span>`).join("");
}

function renderEvaluation() {
  document.querySelector("#currentTarget").textContent = selectedPlayer;
  document.querySelector(".eval-target").classList.remove("pulse");
  requestAnimationFrame(() => document.querySelector(".eval-target").classList.add("pulse"));
  document.querySelector("#stepTitle").textContent = flowSteps[currentStep];
  document.querySelector("#stepHelp").textContent = currentStep === 2 ? "6점은 평균적인 플레이입니다. 못했다는 의미가 아닙니다." : "평가 데이터는 공식 선수카드에만 반영됩니다.";
  renderStepper();

  const pane = document.querySelector("#evaluationPane");
  if (currentStep === 0) {
    pane.innerHTML = `<div class="selector-grid">${players.map((player) => `<button class="choice-card ${player === selectedPlayer ? "selected" : ""}" data-player="${player}" type="button">${player}<br><small>평가하기</small></button>`).join("")}</div>${actions()}`;
  } else if (currentStep === 1) {
    pane.innerHTML = `<div class="selector-grid">${positions.map(([key, label, desc]) => `<button class="choice-card ${key === selectedPosition ? "selected" : ""}" data-position="${key}" type="button"><strong>${label}</strong><br><small>${desc}</small></button>`).join("")}</div>${actions()}`;
  } else if (currentStep === 2 || currentStep === 3) {
    const score = currentStep === 2 ? commonScore : positionScore;
    pane.innerHTML = `<h3>${currentStep === 2 ? "활동량" : "경기 조율"}</h3><p class="muted">경기 내 움직임과 영향력을 1~10점으로 평가해주세요.</p><div class="score-grid">${Array.from({ length: 10 }, (_, index) => index + 1).map((value) => `<button class="score-button ${value === score ? "selected" : ""}" data-score="${value}" type="button">${value}</button>`).join("")}</div>${actions()}`;
  } else if (currentStep === 4) {
    const labels = [["teamwork", "팀플레이"], ["aggression", "적극성"], ["boldness", "대담성"], ["creativity", "창의성"], ["vision", "시야"], ["leadership", "리더십"], ["pass_sense", "패스 센스"], ["ball_control", "볼 컨트롤"]];
    pane.innerHTML = `<div class="chip-grid">${labels.map(([key, label]) => `<button class="chip ${selectedTraits.includes(key) ? "selected" : ""}" data-trait="${key}" type="button">${label}</button>`).join("")}</div>${actions("건너뛰기")}`;
  } else if (currentStep === 5) {
    const matchOvr = toOvr(calculateMatchScore(commonScore, positionScore));
    pane.innerHTML = `<label>이 선수 한 줄 평<textarea rows="4">넓은 시야와 정교한 패스로 경기 흐름을 바꾸는 플레이어.</textarea></label><div class="self-result"><span>${selectedPlayer} 예상 OVR</span><strong>${matchOvr}</strong></div>${actions("이전", "완료하고 다음 선수")}`;
  } else {
    pane.innerHTML = `<div class="complete-card"><div class="checkmark">✓</div><h2>평가 저장 완료!</h2><p>오늘의 플레이 성향은 패스 중심 · 안정 연결형으로 수집 중입니다.</p><div class="self-result"><span>예상 OVR 변화</span><strong>+2</strong></div><button class="primary full" data-go="cards" type="button">결과 카드 미리보기</button></div>`;
    pane.querySelector("[data-go]")?.addEventListener("click", () => setView("cards"));
    return;
  }

  pane.querySelectorAll("[data-player]").forEach((button) => button.addEventListener("click", () => {
    selectedPlayer = button.dataset.player;
    showToast(`${selectedPlayer} 선수를 평가합니다`);
    renderEvaluation();
  }));
  pane.querySelectorAll("[data-position]").forEach((button) => button.addEventListener("click", () => {
    selectedPosition = button.dataset.position;
    showToast(`${button.querySelector("strong").textContent} 역할로 저장`);
    renderEvaluation();
  }));
  pane.querySelectorAll("[data-score]").forEach((button) => button.addEventListener("click", () => {
    if (currentStep === 2) commonScore = Number(button.dataset.score);
    if (currentStep === 3) positionScore = Number(button.dataset.score);
    showToast(`${button.dataset.score}점 저장됨`);
    renderEvaluation();
  }));
  pane.querySelectorAll("[data-trait]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.trait;
    selectedTraits = selectedTraits.includes(key) ? selectedTraits.filter((item) => item !== key) : [...selectedTraits, key].slice(-2);
    showToast("눈에 띈 특징을 반영했어요");
    renderEvaluation();
  }));
  pane.querySelector("[data-prev]")?.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    renderEvaluation();
  });
  pane.querySelector("[data-next]")?.addEventListener("click", () => {
    if (currentStep === flowSteps.length - 1) {
      showToast("평가가 자동 저장되었습니다");
      currentStep = 6;
    } else {
      currentStep += 1;
    }
    renderEvaluation();
  });
}

function actions(prevLabel = "이전", nextLabel = "다음") {
  return `<div class="eval-actions"><button class="secondary" data-prev type="button">${prevLabel}</button><button class="primary" data-next type="button">${nextLabel}</button></div>`;
}

function renderCards() {
  renderRadar(document.querySelector("#cardRadar"), radarStats(commonRatings), 280);
  const positionNames = { attack: ["공격", "ST"], cam: ["공미", "CAM"], cdm: ["수미", "CDM"], defense: ["수비", "CB"], free: ["프리롤", "FR"] };
  document.querySelector("#positionGrid").innerHTML = Object.entries(positionRatings).map(([key, value]) => {
    const score = value === null ? "-" : toOvr(value);
    return `<button class="position-card" data-toast="${positionNames[key][0]} 적응도 상세를 열었습니다" type="button"><span>${positionNames[key][0]} · ${positionNames[key][1]}</span><strong>${score}</strong><progress max="100" value="${value === null ? 0 : score}"></progress></button>`;
  }).join("");
  document.querySelector("#styleTags").innerHTML = ["창의형 플레이메이커", "템포 조율형", "안정 연결형", "공간 침투형", "직선 돌파형"].map((tag) => `<span>${tag}</span>`).join("");
  document.querySelector("#quotes").innerHTML = [
    ["넓은 시야와 정교한 패스로 경기 흐름을 바꿨어요.", 4],
    ["압박이 들어와도 침착하게 공을 지켜줬어요.", 3],
    ["다음 경기에는 슈팅 선택지만 조금 더 늘리면 좋겠어요.", 2],
  ].map(([quote, count]) => `<article><p>“<strong>${quote.split(" ")[0]}</strong> ${quote.split(" ").slice(1).join(" ")}”</p><button data-like type="button">공감 ${count}</button></article>`).join("");
  document.querySelectorAll("[data-like]").forEach((button) => button.addEventListener("click", () => {
    const count = Number(button.textContent.replace(/\D/g, "")) + 1;
    button.textContent = `공감 ${count}`;
    showToast("공감이 반영되었습니다");
  }));
}

function renderFriends() {
  document.querySelector("#friendList").innerHTML = friends.map(([name, meta]) => `
    <article><div><strong>${name}</strong><p>${meta}</p></div><button data-toast="${name} 카드 비교를 열었습니다" type="button">비교</button></article>
  `).join("");
}

function setView(view) {
  document.querySelectorAll(".content-view").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll(".tabbar button").forEach((button) => button.classList.toggle("active", button.dataset.go === view));
  document.querySelector(".hero").hidden = view !== "home";
  document.querySelector(".fab").hidden = view !== "home";
  window.scrollTo({ top: 0, behavior: "instant" });
  if (view === "evaluate") renderEvaluation();
  if (view === "cards") renderCards();
  if (view === "friends") renderFriends();
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) showToast(toastButton.dataset.toast);
  });
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
  document.querySelector("#fab").addEventListener("click", () => {
    document.querySelector("#fab").classList.add("open");
    openSheet("fab");
  });
  document.querySelector("#friendRequestOpen").addEventListener("click", () => openSheet("friend"));
  document.querySelector("#homePlayerCard").addEventListener("click", () => {
    document.querySelector("#homePlayerCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#homePlayerCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#officialCard").addEventListener("click", () => {
    document.querySelector("#officialCard").classList.add("expanded");
    openSheet("card");
    setTimeout(() => document.querySelector("#officialCard").classList.remove("expanded"), 700);
  });
  document.querySelector("#overlay").addEventListener("click", (event) => {
    if (event.target.id === "overlay") closeSheet();
  });
  document.querySelector("#selfScore").addEventListener("input", (event) => {
    document.querySelector("#selfOvr").textContent = toOvr(Number(event.target.value));
  });
  document.querySelector("#saveReflection").addEventListener("click", () => showToast("개인 회고가 저장되었습니다"));
}

renderHome();
renderEvaluation();
renderCards();
renderFriends();
bindInteractions();
