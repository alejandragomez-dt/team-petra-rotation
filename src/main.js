import "./styles.css";

// Sprint 341: Javi absent (IRBR removed, was his task) + Rafael not yet in
const RESTRICTED_POOL = ["Luca", "Filippo", "Edu", "Ale"];
const FULL_POOL = ["Luca", "Filippo", "Edu", "Javi", "Ale", "Rafael"];
const ACTIVITIES = ["Refinement", "Planning", "Avocado"];
const START = 341;
const RAFAEL_FROM = 342; // also when Javi returns
const SPRINTS_SHOWN = 10;

// Avocado 6-cycle from sprint 341. Javi gets it at sprint 346.
const AVOCADO_ORDER = ["Filippo", "Rafael", "Luca", "Ale", "Edu", "Javi"];

// Restricted (sprint 341 only): Ref=Luca(0), Plan=Ale(3)
const REF_IDX_RESTRICTED = 0;
const PLAN_IDX_RESTRICTED = 3;

// Full pool (342+): start indices chosen to be conflict-free with the Avocado sequence.
// Verified: no same-sprint collision and no back-to-back repeat across the full 6-sprint cycle.
const REF_IDX_FULL = 1; // Filippo
const PLAN_IDX_FULL = 0; // Luca

// Manual swaps for specific sprints (only override the listed activity index).
// 0=Refinement, 1=Planning, 2=Avocado
const OVERRIDES = {
  343: { 0: "Javi" },
  344: { 0: "Edu", 1: "Rafael" },
};

function assign(sprint) {
  const restricted = sprint < RAFAEL_FROM;
  const pool = restricted ? RESTRICTED_POOL : FULL_POOL;
  const n = pool.length;
  const delta = sprint - (restricted ? START : RAFAEL_FROM);
  const refStart = restricted ? REF_IDX_RESTRICTED : REF_IDX_FULL;
  const planStart = restricted ? PLAN_IDX_RESTRICTED : PLAN_IDX_FULL;

  const ref = pool[(refStart + delta + n) % n];
  const plan = pool[(planStart + delta + n) % n];
  const avocado = AVOCADO_ORDER[(sprint - START) % AVOCADO_ORDER.length];

  const result = [ref, plan, avocado];
  const ov = OVERRIDES[sprint];
  if (ov)
    Object.entries(ov).forEach(([i, name]) => {
      result[i] = name;
    });
  return result;
}

const ACT_STYLE = [
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAEEDA", text: "#854F0B" },
];

// Sprint 341 started on May 15 2026; each sprint is 14 days (every other Friday)
const SPRINT_START_DATE = new Date(2026, 4, 15); // local time to avoid UTC offset issues
const SPRINT_DURATION = 14;

function getCurrentSprint() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor(
    (today - SPRINT_START_DATE) / (1000 * 60 * 60 * 24),
  );
  return START + Math.max(0, Math.floor(daysSinceStart / SPRINT_DURATION));
}

let current = getCurrentSprint();

function renderCards() {
  const a = assign(current);
  document.getElementById("act-cards").innerHTML = ACTIVITIES.map(
    (act, i) => `
    <div class="card">
      <div class="card-title">${act}</div>
      <div class="card-person">${a[i]}</div>
      <div class="card-badge" style="background:${ACT_STYLE[i].bg};color:${ACT_STYLE[i].text}">Sprint ${current}</div>
    </div>`,
  ).join("");
  document.getElementById("sprint-display").textContent = `Sprint ${current}`;
}

function renderTable() {
  const start = Math.max(START, current - 2);
  document.getElementById("table-body").innerHTML = Array.from(
    { length: SPRINTS_SHOWN },
    (_, k) => start + k,
  )
    .map((s) => {
      const a = assign(s);
      const cls = s === current ? "current" : s < current ? "past" : "";
      const skipped = s < RAFAEL_FROM;
      const sprintLabel = `${s === current ? "▶ " : ""}Sprint ${s}${skipped ? '<span class="skip-badge">−Javi −Rafael</span>' : ""}`;
      return `<tr class="${cls}">
        <td style="font-weight:${s === current ? "500" : "400"}">${sprintLabel}</td>
        ${a.map((n) => `<td>${n}</td>`).join("")}
      </tr>`;
    })
    .join("");
}

function render() {
  renderCards();
  renderTable();
  document.getElementById("btn-prev").disabled = current <= START;
}

// Expose navigation functions to global scope for onclick handlers in HTML
window.nextSprint = () => {
  current++;
  render();
};
window.prevSprint = () => {
  if (current > START) {
    current--;
    render();
  }
};
window.resetSprint = () => {
  current = getCurrentSprint();
  render();
};

render();
