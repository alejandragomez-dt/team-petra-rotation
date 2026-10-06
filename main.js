const RESTRICTED_POOL = ['Luca', 'Filippo', 'Edu', 'Javi', 'Ale'];
const FULL_POOL       = ['Luca', 'Filippo', 'Edu', 'Javi', 'Ale', 'Rafa'];
const ACTIVITIES      = ['Refinement', 'Planning', 'Internal Review Backlog Round', 'Avocado'];
const START           = 340;
const RAFA_FROM     = 343;
const SPRINTS_SHOWN   = 10;

// Fixed Avocado order — Rafa included at 342 as an exception
const AVOCADO_ORDER = ['Javi', 'Filippo', 'Rafa', 'Luca', 'Ale', 'Edu'];

// Starting indices in RESTRICTED_POOL for sprint 340 (Refinement, Planning, IRBR only)
// Refinement → Ale (4), Planning → Luca (0), IRBR → Filippo (1)
const START_IDX_RESTRICTED = [4, 0, 1];

function getStartIdxFull() {
  const delta = RAFA_FROM - START;
  return [0, 1, 2].map(i => {
    const name = RESTRICTED_POOL[(START_IDX_RESTRICTED[i] + delta) % RESTRICTED_POOL.length];
    return FULL_POOL.indexOf(name);
  });
}

const START_IDX_FULL = getStartIdxFull();

function assign(sprint) {
  const restricted = sprint < RAFA_FROM;
  const pool       = restricted ? RESTRICTED_POOL : FULL_POOL;
  const n          = pool.length;
  const baseIdx    = restricted ? START_IDX_RESTRICTED : START_IDX_FULL;
  const delta      = sprint - (restricted ? START : RAFA_FROM);
  const first3     = [0, 1, 2].map(i => pool[(baseIdx[i] + delta + n) % n]);
  const avocado    = AVOCADO_ORDER[(sprint - START) % AVOCADO_ORDER.length];
  return [...first3, avocado];
}

const ACT_STYLE = [
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#FAEEDA', text: '#854F0B' },
];

let current = START;

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
      const a      = assign(s);
      const cls    = s === current ? 'current' : s < current ? 'past' : '';
      const skipped = s < RAFA_FROM;
      const sprintLabel = `${s === current ? '▶ ' : ''}Sprint ${s}${skipped ? '<span class="skip-badge">−Rafa</span>' : ''}`;
      return `<tr class="${cls}">
        <td style="font-weight:${s === current ? '500' : '400'}">${sprintLabel}</td>
        ${a.map(n => `<td>${n}</td>`).join('')}
      </tr>`;
    }).join('');
}

function render() { renderCards(); renderTable(); }
function nextSprint() { current++; render(); }
function prevSprint() { if (current > 1) { current--; render(); } }
function resetSprint() { current = START; render(); }

render();
