import "./styles.css";

// Sprint 341: Javi absent (IRBR removed, was his task) + Rafa not yet in
const RESTRICTED_POOL = ["Luca", "Filippo", "Edu", "Ale"];
const FULL_POOL = ["Luca", "Filippo", "Edu", "Javi", "Ale", "Rafa"];
const ACTIVITIES = ["Refinement", "Planning", "Avocado"];
const START = 341;
const RAFA_FROM = 342; // also when Javi returns
const SPRINTS_SHOWN = 10;

// Double-length sprints, split into two regular halves ("a" and "b") that rotate normally.
// 352: Oct 16 – Nov 13 2026 · 355: Dec 11 2026 – Jan 8 2027
const SPLIT_SPRINTS = [352, 355];

// A slot is one regular 2-week sprint (or half of a split sprint), counted from START.
function sprintLabel(slot) {
  const labels = [];
  for (let s = START; labels.length <= slot; s++)
    labels.push(...(SPLIT_SPRINTS.includes(s) ? [`${s}a`, `${s}b`] : [`${s}`]));
  return labels[slot];
}

const RAFA_SLOT = RAFA_FROM - START; // no split sprints before RAFA_FROM

// Avocado 6-cycle from sprint 341. Javi gets it at sprint 346.
const AVOCADO_ORDER = ["Filippo", "Rafa", "Luca", "Ale", "Edu", "Javi"];

// Restricted (sprint 341 only): Ref=Luca(0), Plan=Ale(3)
const REF_IDX_RESTRICTED = 0;
const PLAN_IDX_RESTRICTED = 3;

// Full pool (342+): start indices chosen to be conflict-free with the Avocado sequence.
// Verified: no same-sprint collision and no back-to-back repeat across the full 6-sprint cycle.
const REF_IDX_FULL = 1; // Filippo
const PLAN_IDX_FULL = 0; // Luca

// Manual swaps for specific sprint labels (only override the listed activity index).
// 0=Refinement, 1=Planning, 2=Avocado
const OVERRIDES = {
  343: { 0: "Javi" },
  344: { 0: "Edu", 1: "Rafa" },
  351: { 0: "Rafa" },
  "352a": { 0: "Ale", 1: "Rafa" },
  "352b": { 1: "Ale" },
};

function assign(slot) {
  const restricted = slot < RAFA_SLOT;
  const pool = restricted ? RESTRICTED_POOL : FULL_POOL;
  const n = pool.length;
  const delta = slot - (restricted ? 0 : RAFA_SLOT);
  const refStart = restricted ? REF_IDX_RESTRICTED : REF_IDX_FULL;
  const planStart = restricted ? PLAN_IDX_RESTRICTED : PLAN_IDX_FULL;

  const ref = pool[(refStart + delta + n) % n];
  const plan = pool[(planStart + delta + n) % n];
  const avocado = AVOCADO_ORDER[slot % AVOCADO_ORDER.length];

  const result = [ref, plan, avocado];
  const ov = OVERRIDES[sprintLabel(slot)];
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

// Sprint 341 started on May 15 2026; each slot is 14 days (every other Friday)
const SPRINT_START_DATE = new Date(2026, 4, 15); // local time to avoid UTC offset issues
const SPRINT_DURATION = 14;

function getCurrentSlot() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor(
    (today - SPRINT_START_DATE) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, Math.floor(daysSinceStart / SPRINT_DURATION));
}

let current = getCurrentSlot();

function renderCards() {
  const a = assign(current);
  document.getElementById("act-cards").innerHTML = ACTIVITIES.map(
    (act, i) => `
    <div class="card">
      <div class="card-title">${act}</div>
      <div class="card-person">${a[i]}</div>
      <div class="card-badge" style="background:${ACT_STYLE[i].bg};color:${ACT_STYLE[i].text}">Sprint ${sprintLabel(current)}</div>
    </div>`,
  ).join("");
  document.getElementById("sprint-display").textContent = `Sprint ${sprintLabel(current)}`;
}

function renderTable() {
  const start = Math.max(0, current - 2);
  document.getElementById("table-body").innerHTML = Array.from(
    { length: SPRINTS_SHOWN },
    (_, k) => start + k,
  )
    .map((s) => {
      const a = assign(s);
      const cls = s === current ? "current" : s < current ? "past" : "";
      const skipped = s < RAFA_SLOT;
      const label = `${s === current ? "▶ " : ""}Sprint ${sprintLabel(s)}${skipped ? '<span class="skip-badge">−Javi −Rafa</span>' : ""}`;
      return `<tr class="${cls}">
        <td style="font-weight:${s === current ? "500" : "400"}">${label}</td>
        ${a.map((n) => `<td>${n}</td>`).join("")}
      </tr>`;
    })
    .join("");
}

function render() {
  renderCards();
  renderTable();
  document.getElementById("btn-prev").disabled = current <= 0;
}

// Expose navigation functions to global scope for onclick handlers in HTML
window.nextSprint = () => {
  current++;
  render();
};
window.prevSprint = () => {
  if (current > 0) {
    current--;
    render();
  }
};
window.resetSprint = () => {
  current = getCurrentSlot();
  render();
};

render();
