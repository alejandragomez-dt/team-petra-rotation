import './styles.css';

const RESTRICTED_POOL = ['Luca', 'Filippo', 'Edu', 'Javi', 'Ale'];
const FULL_POOL       = ['Luca', 'Filippo', 'Edu', 'Javi', 'Ale', 'Rafael'];
const ACTIVITIES      = ['Refinement', 'Planning', 'Internal Review Backlog Round', 'Avocado'];
const START           = 340;
const RAFAEL_FROM     = 343;
const SPRINTS_SHOWN   = 10;

// Fixed Avocado order — Rafael included at 342 as an exception
const AVOCADO_ORDER = ['Javi', 'Filippo', 'Rafael', 'Luca', 'Ale', 'Edu'];

// Starting indices in RESTRICTED_POOL for sprint 340 (Refinement, Planning, IRBR only)
// Refinement → Ale (4), Planning → Luca (0), IRBR → Filippo (1)
const START_IDX_RESTRICTED = [4, 0, 1];

function getStartIdxFull() {
  const delta = RAFAEL_FROM - START;
  return [0, 1, 2].map(i => {
    const name = RESTRICTED_POOL[(START_IDX_RESTRICTED[i] + delta) % RESTRICTED_POOL.length];
    return FULL_POOL.indexOf(name);
  });
}

const START_IDX_FULL = getStartIdxFull();

// Sprint-specific Planning overrides (used when the rotation would double-assign someone)
const PLANNING_OVERRIDES = { 341: 'Ale' };

function assign(sprint) {
  const restricted = sprint < RAFAEL_FROM;
  const pool       = restricted ? RESTRICTED_POOL : FULL_POOL;
  const n          = pool.length;
  const baseIdx    = restricted ? START_IDX_RESTRICTED : START_IDX_FULL;
  const delta      = sprint - (restricted ? START : RAFAEL_FROM);
  const first3     = [0, 1, 2].map(i => pool[(baseIdx[i] + delta + n) % n]);
  const avocado    = AVOCADO_ORDER[(sprint - START) % AVOCADO_ORDER.length];

  // Resolve double-assignment: if Planning == Avocado, swap Planning out
  if (first3[1] === avocado) {
    if (PLANNING_OVERRIDES[sprint]) {
      first3[1] = PLANNING_OVERRIDES[sprint];
    } else {
      const taken = new Set([first3[0], first3[2], avocado]);
      const startIdx = pool.indexOf(first3[1]);
      for (let offset = 1; offset < n; offset++) {
        const candidate = pool[(startIdx + offset) % n];
        if (!taken.has(candidate)) { first3[1] = candidate; break; }
      }
    }
  }

  return [...first3, avocado];
}

const ACT_STYLE = [
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#FAEEDA', text: '#854F0B' },
];

// Sprint 340 started on May 1 2026; each sprint is 15 days
const SPRINT_START_DATE = new Date('2026-05-01');
const SPRINT_DURATION   = 15;

function getCurrentSprint() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today - SPRINT_START_DATE) / (1000 * 60 * 60 * 24));
  return START + Math.max(0, Math.floor(daysSinceStart / SPRINT_DURATION));
}

let current = getCurrentSprint();

function renderCards() {
  const a = assign(current);
  document.getElementById('act-cards').innerHTML = ACTIVITIES.map((act, i) => `
    <div class="card">
      <div class="card-title">${act}</div>
      <div class="card-person">${a[i]}</div>
      <div class="card-badge" style="background:${ACT_STYLE[i].bg};color:${ACT_STYLE[i].text}">Sprint ${current}</div>
    </div>`).join('');
  document.getElementById('sprint-display').textContent = `Sprint ${current}`;
}

function renderTable() {
  const start = Math.max(START, current - 2);
  document.getElementById('table-body').innerHTML =
    Array.from({ length: SPRINTS_SHOWN }, (_, k) => start + k).map(s => {
      const a       = assign(s);
      const cls     = s === current ? 'current' : s < current ? 'past' : '';
      const skipped = s < RAFAEL_FROM;
      const sprintLabel = `${s === current ? '▶ ' : ''}Sprint ${s}${skipped ? '<span class="skip-badge">−Rafael</span>' : ''}`;
      return `<tr class="${cls}">
        <td style="font-weight:${s === current ? '500' : '400'}">${sprintLabel}</td>
        ${a.map(n => `<td>${n}</td>`).join('')}
      </tr>`;
    }).join('');
}

function render() { renderCards(); renderTable(); }

// Expose navigation functions to global scope for onclick handlers in HTML
window.nextSprint  = () => { current++; render(); };
window.prevSprint  = () => { if (current > 1) { current--; render(); } };
window.resetSprint = () => { current = getCurrentSprint(); render(); };

render();
