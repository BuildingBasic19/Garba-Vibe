const $ = id => document.getElementById(id);
const photoP = { img: null, ox: 0, oy: 0 }; let pan = null;
const cv = $('cv'), ctx = cv.getContext('2d');
const BG = { maroon: ['#4a0e1e', '#8b1a2b'], purple: ['#2d1050', '#7b2d8e'], saffron: ['#ff9933', '#c2410c'], ivory: ['#fff8e7', '#f5deb3'] };
let st, undoS = [], redoS = [], photo = null, sel = null, dragging = false, editingId = null;

const fresh = () => ({ pm: 'circle', w: 1080, h: 1920, bg: 'maroon', color: '#ffd700', objs: [
  { t: 'Happy Navratri', x: 540, y: 700, s: 110, k: 'text' }, { t: 'May Maa Durga bless you', x: 540, y: 860, s: 56, k: 'text' },
  { t: 'Wishing you nine days of joy and strength.', x: 540, y: 1050, s: 48, k: 'text' }, { t: '— With love', x: 540, y: 1560, s: 44, k: 'text' },
  { t: '🪔', x: 540, y: 330, s: 200, k: 'deco' }, { t: '🪷', x: 540, y: 1740, s: 140, k: 'deco' }] });
st = fresh();

const say = (m, bad) => { $('msg').textContent = m; $('msg').style.color = bad ? '#b00020' : '#1b5e20'; };

function wrap(text, maxW) {
  const lines = []; let line = '';
  for (const w of text.split(/\s+/)) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line); return lines;
}
function layout(o) { // returns drawn lines so hit-testing matches rendering
  ctx.font = `600 ${o.s}px 'Playfair Display','Noto Serif Devanagari',Georgia,serif`;
  return o.k === 'deco' ? [o.t] : o.t.split('\n').flatMap(l => wrap(l, o.mw || 920));
}
function draw(forExport) {
  cv.width = st.w; cv.height = st.h;
  const tp = st.tp && TPLX.byId[st.tp];
  if (tp) { ctx.fillStyle = '#8a8a8a'; ctx.fillRect(0, 0, st.w, st.h); const [sx, sy, sw, sh] = tp.slots[0];
    if (photo) { ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip(); photoP.img = photo; TPLX.cover(ctx, photoP, sx, sy, sw, sh); ctx.restore(); }
    else if (!forExport) { ctx.fillStyle = '#fff'; ctx.font = '48px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+ Tap to add photo', sx + sw / 2, sy + sh / 2); }
    const fi = TPLX.image(tp, () => draw()); if (fi) ctx.drawImage(fi, 0, 0, 1080, 1920); }
  else if (st.bg.startsWith('tpl') && TPL.stories[+st.bg.slice(3)]) TPL.stories[+st.bg.slice(3)].d(ctx, st.w, st.h);
  else { const g = ctx.createLinearGradient(0, 0, st.w, st.h); g.addColorStop(0, BG[st.bg][0]); g.addColorStop(1, BG[st.bg][1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, st.w, st.h); ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 8; ctx.strokeRect(40, 40, st.w - 80, st.h - 80);
    ctx.lineWidth = 2; ctx.strokeRect(62, 62, st.w - 124, st.h - 124); }
  if (!tp && photo && st.pm === 'full') { const sc = Math.max(st.w / photo.width, st.h / photo.height); ctx.drawImage(photo, (st.w - photo.width * sc) / 2, (st.h - photo.height * sc) / 2, photo.width * sc, photo.height * sc);
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(0, 0, st.w, st.h); ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 8; ctx.strokeRect(40, 40, st.w - 80, st.h - 80); }
  else if (!tp && photo) { const r = 200, cx = st.w / 2, cy = st.h * 0.66; ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
    const sc = Math.max(2 * r / photo.width, 2 * r / photo.height); ctx.drawImage(photo, cx - photo.width * sc / 2, cy - photo.height * sc / 2, photo.width * sc, photo.height * sc); ctx.restore();
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  st.objs.forEach((o, i) => {
    const lines = layout(o); ctx.fillStyle = st.color; const lh = o.s * 1.25;
    lines.forEach((l, j) => ctx.fillText(l, o.x, o.y + (j - (lines.length - 1) / 2) * lh));
    if (!forExport && i === sel) { const w = Math.max(...lines.map(l => ctx.measureText(l).width)), h = lines.length * lh;
      ctx.save(); ctx.setLineDash([12, 8]); ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 4; ctx.strokeRect(o.x - w / 2 - 10, o.y - h / 2 - 5, w + 20, h + 10); ctx.restore(); }
  });
}
function hit(x, y) {
  for (let i = st.objs.length - 1; i >= 0; i--) { const o = st.objs[i], lines = layout(o), lh = o.s * 1.25;
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)), h = lines.length * lh;
    if (Math.abs(x - o.x) <= w / 2 + 10 && Math.abs(y - o.y) <= h / 2 + 5) return i; }
  return null;
}
const snap = () => { undoS.push(JSON.stringify(st)); if (undoS.length > 50) undoS.shift(); redoS = []; };
const syncPanel = () => { [0, 1, 2, 3].forEach(i => { $('f' + i).value = st.objs[i] && st.objs[i].k === 'text' ? st.objs[i].t : ''; }); $('pm').value = st.pm || 'circle'; $('size').value = st.w + 'x' + st.h; $('bg').value = st.bg; $('color').value = st.color;
  const o = st.objs[sel]; $('txt').value = o ? o.t : ''; $('fs').value = o ? o.s : 100; };
const refresh = () => { draw(); syncPanel(); };

function pt(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
cv.addEventListener('pointerdown', e => { const [x, y] = pt(e); const i = hit(x, y);
  const tq = st.tp && TPLX.byId[st.tp];
  if (i === null && tq) { const [sx, sy, sw, sh] = tq.slots[0]; if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) { if (!photo) { $('photo').click(); return; } pan = { x, y }; cv.setPointerCapture(e.pointerId); return; } }
  sel = i; if (i !== null) { snap(); dragging = true; cv.setPointerCapture(e.pointerId); } refresh(); });
cv.addEventListener('pointermove', e => { if (pan) { const [x, y] = pt(e); photoP.ox += x - pan.x; photoP.oy += y - pan.y; pan.x = x; pan.y = y; draw(); return; }
  if (!dragging || sel === null) return; const [x, y] = pt(e); st.objs[sel].x = x; st.objs[sel].y = y; draw(); });
cv.addEventListener('pointerup', () => { dragging = false; pan = null; });

$('size').onchange = e => { snap(); if (st.tp) { st.tp = ''; say('Image templates are Story size only, so the built-in background was restored.'); } [st.w, st.h] = e.target.value.split('x').map(Number); st.objs.forEach(o => { o.y = Math.min(o.y, st.h - 120); }); refresh(); };
$('bg').onchange = e => { snap(); st.tp = ''; st.bg = e.target.value; if (st.bg.startsWith('tpl')) st.color = TPL.stories[+st.bg.slice(3)].c; refresh(); };
TPL.stories.forEach((t, i) => { const o = document.createElement('option'); o.value = 'tpl' + i; o.textContent = 'Template: ' + t.n; $('bg').appendChild(o); });
$('color').onchange = e => { snap(); st.color = e.target.value; refresh(); };
$('txt').oninput = e => { if (sel !== null) { st.objs[sel].t = e.target.value; draw(); } };
$('txt').onfocus = snap;
$('fs').onpointerdown = snap;
$('fs').oninput = e => { if (sel !== null) { st.objs[sel].s = +e.target.value; draw(); } };
$('front').onclick = () => { if (sel === null) return; snap(); st.objs.push(st.objs.splice(sel, 1)[0]); sel = st.objs.length - 1; refresh(); };
$('del').onclick = () => { if (sel === null) return; snap(); st.objs.splice(sel, 1); sel = null; refresh(); };
document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { snap(); st.objs.push({ t: b.dataset.add, x: st.w / 2, y: st.h / 2, s: 120, k: 'deco' }); sel = st.objs.length - 1; refresh(); });
$('undo').onclick = () => { if (!undoS.length) return; redoS.push(JSON.stringify(st)); st = JSON.parse(undoS.pop()); sel = null; refresh(); };
$('redo').onclick = () => { if (!redoS.length) return; undoS.push(JSON.stringify(st)); st = JSON.parse(redoS.pop()); sel = null; refresh(); };
$('reset').onclick = () => { if (confirm('Reset the whole design?')) { snap(); st = fresh(); photo = null; sel = null; editingId = null; refresh(); } };

$('photo').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return say('Please choose a JPG, PNG or WebP image.', true);
  if (f.size > 8 * 1024 * 1024) return say('That image is over 8 MB. Please choose a smaller one.', true);
  const img = new Image(), url = URL.createObjectURL(f);
  img.onload = () => { photo = img; photoP.ox = photoP.oy = 0; URL.revokeObjectURL(url); draw(); say('Photo added.'); };
  img.onerror = () => say('Could not read that image.', true); img.src = url;
};

$('gen').onclick = async () => {
  $('results').textContent = 'Generating…';
  try {
    const d = await api('/greetings/generate', { method: 'POST', body: JSON.stringify({ language: $('lang').value, length: $('len').value, count: 3 }) });
    $('results').textContent = '';
    d.results.forEach(r => { const b = document.createElement('button'); b.className = 'btn alt'; b.style.cssText = 'display:block;width:100%;margin:.4rem 0;text-align:left;white-space:pre-line;border-radius:12px';
      b.textContent = r.text; b.title = 'Use in story'; b.onclick = () => { snap(); const o = st.objs[2]; o.t = r.text.replace(/\n/g, ' '); refresh(); say('Greeting added to your story.'); }; $('results').appendChild(b); });
  } catch (e) { $('results').textContent = ''; say(e.message, true); }
};

$('dl').onclick = () => {
  sel = null; draw(true);
  cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'garbavibe-story.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    draw(); say('Downloaded! Share it manually on WhatsApp or Instagram.'); setTimeout(showSupport, 600); }, 'image/png');
};

async function loadList() {
  try { const list = await api('/designs'); const box = $('designs'); box.textContent = list.length ? '' : 'Nothing saved yet.';
    list.forEach(d => { const row = document.createElement('div'); const n = document.createElement('span'); n.textContent = d.title; n.style.flex = 1;
      const o = document.createElement('button'); o.className = 'btn alt'; o.textContent = 'Open'; o.onclick = () => { snap(); st = d.data; editingId = d.id; $('title').value = d.title; sel = null; refresh(); };
      const x = document.createElement('button'); x.className = 'btn alt'; x.textContent = 'Delete';
      x.onclick = async () => { if (confirm('Delete "' + d.title + '"?')) { await api('/designs/' + d.id, { method: 'DELETE' }); loadList(); } };
      row.append(n, o, x); box.appendChild(row); });
  } catch (e) { say(e.message, true); }
}
$('save').onclick = async () => {
  try { const body = JSON.stringify({ title: $('title').value, type: 'story', data: st });
    if (editingId) await api('/designs/' + editingId, { method: 'PUT', body }); else editingId = (await api('/designs', { method: 'POST', body })).id;
    say('Saved.'); loadList(); } catch (e) { say(e.message, true); }
};
if (document.fonts) document.fonts.ready.then(refresh);
refresh(); loadList();

const pend = localStorage.getItem('gv_pending_text');
if (pend) { st.objs[2].t = pend.replace(/\n/g, ' '); localStorage.removeItem('gv_pending_text'); refresh(); }

// ---- custom text fields, photo options, and day-based suggestions ----
[0, 1, 2, 3].forEach(i => { $('f' + i).addEventListener('focus', snap);
  $('f' + i).addEventListener('input', e => { if (st.objs[i] && st.objs[i].k === 'text') { st.objs[i].t = e.target.value; draw(); } }); });
$('clr').onclick = () => { snap(); [0, 1, 2, 3].forEach(i => { if (st.objs[i] && st.objs[i].k === 'text') st.objs[i].t = ''; }); sel = null; refresh(); };
$('pm').onchange = e => { snap(); st.pm = e.target.value; draw(); };
$('rmphoto').onclick = () => { photo = null; $('photo').value = ''; draw(); say('Photo removed. The template fills the design.'); };
const FORMS = window.GV_DATA ? GV_DATA.forms : [];
function dayFromStart() { try { const s = JSON.parse(localStorage.getItem('gv_daily') || '{}'); if (!s.start) return null; const t = new Date(); t.setHours(0, 0, 0, 0);
  const n = Math.round((t - new Date(s.start + 'T00:00:00')) / 864e5) + 1; return n >= 1 && n <= 9 ? n : null; } catch { return null; } }
function setText(i, v) { if (st.objs[i] && st.objs[i].k === 'text') st.objs[i].t = v; }
function sugs() {
  const f = FORMS[$('sugDay').value - 1]; const box = $('sugs'); box.textContent = ''; if (!f) return;
  const add = (label, fn) => { const b = document.createElement('button'); b.className = 'btn alt'; b.style.cssText = 'display:block;width:100%;margin:.3rem 0;text-align:left;white-space:pre-line;border-radius:12px'; b.textContent = label; b.onclick = () => { snap(); fn(); refresh(); say('Added to your story. You can still edit it.'); }; box.appendChild(b); };
  add('Heading: Jai Maa ' + f.name, () => { setText(0, 'Jai Maa ' + f.name); setText(1, 'Day ' + f.day + ' · Shubh Navratri'); });
  add('Heading: जय माँ ' + f.name_hi, () => { setText(0, 'जय माँ ' + f.name_hi); setText(1, 'दिन ' + f.day + ' · शुभ नवरात्रि'); });
  f.en.concat(f.hi).forEach(tx => add(tx, () => setText(2, tx)));
}
FORMS.forEach(f => { const o = document.createElement('option'); o.value = f.day; o.textContent = 'Day ' + f.day + ': ' + f.name + ' (' + f.name_hi + ')'; $('sugDay').appendChild(o); });
const autoDay = dayFromStart(); $('sugDay').value = autoDay || 1;
$('sugNote').textContent = autoDay ? 'Picked automatically from your festival start date in Daily Companion.' : 'Choose the day being celebrated. Tip: set your festival start date in Daily Companion to pick it automatically.';
$('sugDay').onchange = sugs; sugs();
if (document.fonts) document.fonts.load("600 40px 'Noto Serif Devanagari'", 'अ').then(() => refresh()).catch(() => {});

// ---- Classic / Gen Z image templates ----
function pickTpl(t) {
  snap(); st.tp = t.id; st.w = 1080; st.h = 1920; st.objs = st.objs.filter(o => o.k !== 'deco');
  const [px, py, pw, ph] = t.panel; setText(0, ''); setText(1, '');
  const g = st.objs[2], s = st.objs[3];
  if (g) { g.x = px + pw / 2; g.y = py + ph * .42; g.s = 40; g.mw = pw - 90; }
  if (s) { s.x = px + pw / 2; s.y = py + ph * .84; s.s = 30; }
  st.color = t.textColor; sel = null; refresh(); say(t.name + ' selected. Add your photo and write your message.');
}
TPLX.load().then(() => { TPLX.mount({ tabs: $('tstyle'), gal: $('gal'), kind: 'story', onBuiltin: () => { if (st.tp) { snap(); st.tp = ''; refresh(); } }, onPick: pickTpl, onLoaded: () => draw() }); refresh(); });
