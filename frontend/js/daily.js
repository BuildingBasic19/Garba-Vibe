const $ = id => document.getElementById(id);
const TASKS = ['Prayer or quiet moment', 'Reflection', 'Help someone', 'Share a greeting'];
const MSG = ['Stand firm in what matters.', 'Small steady effort adds up.', 'Meet today with grace.', 'Let your warmth spread.', 'Care for someone close to you.', 'Be brave in one small way.', 'Let go of one worry.', 'Find peace in the present.', 'Celebrate how far you have come.'];
let forms = [], cur = 1;
function dayFromStart(start) { if (!start) return null; const t = new Date(); t.setHours(0, 0, 0, 0); const n = Math.round((t - new Date(start + 'T00:00:00')) / 864e5) + 1; return n >= 1 && n <= 9 ? n : null; }
const load = () => JSON.parse(localStorage.getItem('gv_daily') || '{"checks":{},"notes":{},"start":""}');
const save = s => localStorage.setItem('gv_daily', JSON.stringify(s));

function progress(s) {
  const done = Object.values(s.checks).reduce((a, v) => a + v.filter(Boolean).length, 0), pct = Math.round(done / (9 * TASKS.length) * 100);
  $('pfill').style.width = pct + '%'; $('pbar').setAttribute('aria-valuenow', pct); $('ptxt').textContent = done + ' of ' + (9 * TASKS.length) + ' items done (' + pct + '%)';
}
function countdown(s) {
  if (!s.start) { $('count').textContent = 'Pick a date to see a countdown.'; return; }
  const t = new Date(); t.setHours(0, 0, 0, 0); const d = Math.round((new Date(s.start + 'T00:00:00') - t) / 86400000);
  $('count').textContent = d > 0 ? d + ' day(s) to go!' : d === 0 ? 'The festival starts today!' : 'Your chosen date was ' + (-d) + ' day(s) ago.';
}
function tabs() {
  $('tabs').textContent = '';
  forms.forEach(f => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = 'Day ' + f.day; b.setAttribute('aria-pressed', f.day === cur);
    b.onclick = () => { cur = f.day; tabs(); day(); }; $('tabs').appendChild(b); });
}
function day() {
  const s = load(), f = forms[cur - 1], box = $('day'); box.textContent = '';
  const mk = (tag, txt) => { const e = document.createElement(tag); e.textContent = txt; box.appendChild(e); return e; };
  mk('h2', 'Day ' + f.day + ': ' + f.name + ' (' + f.name_hi + ')'); mk('p', f.description); mk('p', 'Today\'s thought: ' + MSG[cur - 1]);
  mk('h3', 'Greetings (English and हिंदी)');
  [['English', f.en], ['हिंदी', f.hi]].forEach(([lab, arr]) => arr.forEach(tx => { mk('small', lab); mk('p', tx).style.fontStyle = 'italic';
    const r = document.createElement('div'); r.className = 'row';
    const cp = document.createElement('button'); cp.className = 'btn alt'; cp.textContent = 'Copy'; cp.onclick = async () => { try { await navigator.clipboard.writeText(tx); cp.textContent = 'Copied!'; } catch { cp.textContent = 'Copy failed'; } };
    const us = document.createElement('button'); us.className = 'btn alt'; us.textContent = 'Use in Story Maker'; us.onclick = () => { localStorage.setItem('gv_pending_text', tx); location.href = 'story-maker.html'; };
    r.append(cp, us); box.appendChild(r); }));
  mk('h3', 'Checklist (all optional)');
  const checks = s.checks[cur] || TASKS.map(() => false);
  TASKS.forEach((t, i) => { const l = document.createElement('label'); l.className = 'check'; const c = document.createElement('input'); c.type = 'checkbox'; c.checked = checks[i];
    c.onchange = () => { const st = load(); const a = st.checks[cur] || TASKS.map(() => false); a[i] = c.checked; st.checks[cur] = a; save(st); progress(st); };
    l.append(c, document.createTextNode(' ' + t)); box.appendChild(l); });
  const lb = mk('label', 'Gratitude or reflection note'); lb.htmlFor = 'note'; lb.style.cssText = 'display:block;font-weight:600;margin-top:1rem';
  const n = document.createElement('textarea'); n.id = 'note'; n.rows = 4; n.maxLength = 1000; n.style.cssText = 'width:100%;padding:.5rem;border-radius:8px;border:1px solid #c9b79a;font:inherit'; n.value = s.notes[cur] || '';
  n.oninput = () => { const st = load(); st.notes[cur] = n.value; save(st); }; box.appendChild(n);
  mk('small', 'Notes stay in this browser only.');
}
(async () => {
  try { forms = (window.GV_DATA || await api('/greetings')).forms; } catch (e) { $('day').textContent = 'Could not load: ' + e.message; return; }
  const s = load(); $('start').value = s.start;
  $('start').onchange = () => { const st = load(); st.start = $('start').value; save(st); countdown(st); const n = dayFromStart(st.start); if (n) { cur = n; tabs(); day(); } };
  const n0 = dayFromStart(s.start); if (n0) cur = n0;
  countdown(s); progress(s); tabs(); day();
})();
