const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const grid = (n, m) => { const a = []; for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) a.push([c / m, r / n, 1 / m, 1 / n]); return a; };
const LAYOUTS = {
  'Grid 2×2': grid(2, 2), 'Grid 3×3': grid(3, 3), 'Rows ×3': grid(3, 1), 'Columns ×3': grid(1, 3),
  'Hero + 2': [[0, 0, 1, .6], [0, .6, .5, .4], [.5, .6, .5, .4]],
  'Hero + 3': [[0, 0, .62, 1], [.62, 0, .38, 1 / 3], [.62, 1 / 3, .38, 1 / 3], [.62, 2 / 3, .38, 1 / 3]],
  'Film strip': [[.18, 0, .64, .25], [.18, .25, .64, .25], [.18, .5, .64, .25], [.18, .75, .64, .25]],
  'Scrapbook': [[.05, .05, .5, .4, -4], [.45, .1, .5, .4, 3], [.08, .5, .5, .4, 3], [.42, .55, .5, .4, -3]]
};
const S = { layout: 'Grid 2×2', w: 1080, h: 1920, gap: 20, radius: 24, bg: '#5a0f24', border: true, caption: '', sticker: '' };
let photos = []; // photos[i] = {img, ox, oy} for slot i
let pickSlot = null, drag = null;
const say = (m, bad) => { $('msg').textContent = m; $('msg').style.color = bad ? '#b00020' : '#1b5e20'; };
Object.keys(LAYOUTS).forEach(k => { const o = document.createElement('option'); o.textContent = k; $('layout').appendChild(o); });
const curI = () => S.layout.startsWith('I:') ? TPLX.byId[S.layout.slice(2)] : null;
const curT = () => S.layout.startsWith('T:') ? TPL.collage[+S.layout.slice(2)] : null;
TPL.collage.forEach((t, i) => { const o = document.createElement('option'); o.value = 'T:' + i; o.textContent = 'Template: ' + t.name + ' (' + t.slots.length + ' photos)'; $('layout').appendChild(o); });

function rects() {
  const ti = curI(); if (ti) return ti.slots.map(([x, y, w, h]) => ({ x, y, w, h, rot: 0 }));
  const tp = curT(); if (tp) return tp.slots.map(([ux, uy, uw, uh, rot = 0]) => ({ x: ux * S.w, y: uy * S.h, w: uw * S.w, h: uh * S.h, rot }));
  const p = S.gap + (S.border ? 30 : 0), band = S.caption || S.sticker ? 130 : 0, g = S.gap / 2;
  const ax = p, ay = p, aw = S.w - 2 * p, ah = S.h - 2 * p - band;
  return LAYOUTS[S.layout].map(([ux, uy, uw, uh, rot = 0]) => ({ x: ax + ux * aw + g, y: ay + uy * ah + g, w: uw * aw - S.gap, h: uh * ah - S.gap, rot }));
}
function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function draw(forExport) {
  cv.width = S.w; cv.height = S.h; const tp = curT(), ti = curI();
  if (ti) { ctx.fillStyle = '#8a8a8a'; ctx.fillRect(0, 0, S.w, S.h);
    rects().forEach((r, i) => { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); const p = photos[i];
      if (p) TPLX.cover(ctx, p, r.x, r.y, r.w, r.h); else if (!forExport) { ctx.fillStyle = '#fff'; ctx.font = '44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+ Add photo', r.x + r.w / 2, r.y + r.h / 2); } ctx.restore(); });
    const fi = TPLX.image(ti, () => draw()); if (fi) ctx.drawImage(fi, 0, 0, 1080, 1920); return; }
  if (tp) { TPL.drawTemplate(ctx, tp, S.w, S.h, photos, S.caption, forExport); if (S.sticker) { ctx.font = '90px serif'; ctx.fillText(S.sticker, S.w - 110, S.h * .96); } return; }
  ctx.fillStyle = S.bg; ctx.fillRect(0, 0, S.w, S.h);
  if (S.border) { ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 8; ctx.strokeRect(24, 24, S.w - 48, S.h - 48); }
  const R = rects();
  if (S.layout === 'Film strip') { const a = R[0], b = R[3]; ctx.fillStyle = '#111'; ctx.fillRect(a.x - 40, a.y - S.gap / 2, a.w + 80, b.y + b.h - a.y + S.gap);
    ctx.fillStyle = '#d9d9d9'; for (let y = a.y; y < b.y + b.h - 20; y += 50) { ctx.fillRect(a.x - 28, y, 14, 24); ctx.fillRect(a.x + a.w + 14, y, 14, 24); } }
  R.forEach((r, i) => {
    ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.rotate(r.rot * Math.PI / 180);
    if (S.layout === 'Scrapbook') { ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 20; ctx.fillRect(-r.w / 2 - 14, -r.h / 2 - 14, r.w + 28, r.h + 28); ctx.shadowBlur = 0; }
    rr(-r.w / 2, -r.h / 2, r.w, r.h, S.radius); ctx.clip();
    const p = photos[i];
    if (p) { const sc = Math.max(r.w / p.img.width, r.h / p.img.height), dw = p.img.width * sc, dh = p.img.height * sc;
      const mx = (dw - r.w) / 2, my = (dh - r.h) / 2; p.ox = Math.max(-mx, Math.min(mx, p.ox)); p.oy = Math.max(-my, Math.min(my, p.oy));
      ctx.drawImage(p.img, -dw / 2 + p.ox, -dh / 2 + p.oy, dw, dh); }
    else if (!forExport) { ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '40px sans-serif'; ctx.fillText('+ Add photo', 0, 14); }
    ctx.restore();
  });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (S.caption) { ctx.fillStyle = '#ffd700'; ctx.font = "600 56px 'Playfair Display','Noto Serif Devanagari',Georgia,serif"; ctx.fillText(S.caption, S.w / 2, S.h - 85); }
  if (S.sticker) { ctx.font = '90px serif'; ctx.fillText(S.sticker, S.w - 110, S.h - 90); }
}
function slots() {
  const box = $('slots'); box.textContent = '';
  rects().forEach((_, i) => { const d = document.createElement('div'); d.className = 'row'; d.style.alignItems = 'center';
    const s = document.createElement('span'); s.textContent = 'Slot ' + (i + 1) + (photos[i] ? ': photo' : ': empty'); s.style.minWidth = '7rem';
    const a = document.createElement('button'); a.className = 'btn alt'; a.textContent = photos[i] ? 'Replace' : 'Add'; a.onclick = () => { pickSlot = i; $('files').multiple = false; $('files').click(); };
    d.append(s, a);
    if (photos[i]) { const x = document.createElement('button'); x.className = 'btn alt'; x.textContent = 'Remove'; x.onclick = () => { photos[i] = null; update(); }; d.appendChild(x); }
    box.appendChild(d); });
}
const update = () => { draw(); slots(); };

function loadFile(f) { // validates, then downsizes big images to keep memory low
  return new Promise((ok, no) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return no(new Error(f.name + ': only JPG, PNG or WebP allowed.'));
    if (f.size > 10 * 1024 * 1024) return no(new Error(f.name + ' is over 10 MB.'));
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => { URL.revokeObjectURL(url); const m = Math.max(img.width, img.height);
      if (m <= 1600) return ok(img);
      const c = document.createElement('canvas'), k = 1600 / m; c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c); };
    img.onerror = () => no(new Error(f.name + ' could not be read.')); img.src = url;
  });
}
async function addFiles(files) {
  const n = rects().length; let skipped = 0, err = '';
  for (const f of files) {
    let i = pickSlot !== null ? pickSlot : photos.findIndex((p, k) => k < n && !p); if (i < 0 && photos.length < n) i = photos.length;
    if (i < 0 || i >= n) { skipped++; continue; }
    try { photos[i] = { img: await loadFile(f), ox: 0, oy: 0 }; } catch (e) { err = e.message; }
    pickSlot = null;
  }
  update(); if (err) say(err, true); else say(skipped ? skipped + ' photo(s) skipped: this layout has only ' + n + ' slots.' : 'Photos added.', !!skipped);
}
$('files').onchange = e => { addFiles([...e.target.files]); e.target.value = ''; $('files').multiple = true; };
$('drop').addEventListener('dragover', e => { e.preventDefault(); $('drop').classList.add('over'); });
$('drop').addEventListener('dragleave', () => $('drop').classList.remove('over'));
$('drop').addEventListener('drop', e => { e.preventDefault(); $('drop').classList.remove('over'); pickSlot = null; addFiles([...e.dataTransfer.files]); });

function pt(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
cv.addEventListener('pointerdown', e => { const [x, y] = pt(e); const i = rects().findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  if (i < 0) return; if (!photos[i]) { pickSlot = i; $('files').multiple = false; $('files').click(); return; }
  drag = { i, x, y }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = pt(e), p = photos[drag.i]; p.ox += x - drag.x; p.oy += y - drag.y; drag.x = x; drag.y = y; draw(); });
cv.addEventListener('pointerup', () => { drag = null; });

$('layout').onchange = e => { S.layout = e.target.value; update(); };
$('size').onchange = e => { if (curI()) { S.layout = 'Grid 2×2'; $('layout').value = S.layout; say('Image templates are Story size only, so a built-in layout was selected.'); } [S.w, S.h] = e.target.value.split('x').map(Number); update(); };
$('gap').oninput = e => { S.gap = +e.target.value; draw(); };
$('radius').oninput = e => { S.radius = +e.target.value; draw(); };
$('bg').oninput = e => { S.bg = e.target.value; draw(); };
$('border').onchange = e => { S.border = e.target.checked; draw(); };
$('caption').oninput = e => { S.caption = e.target.value; draw(); };
$('sticker').onchange = e => { S.sticker = e.target.value; draw(); };
$('dl').onclick = () => {
  if (!photos.some(Boolean)) return say('Add at least one photo first.', true);
  { const t0 = curI(); if (t0 && !TPLX.isReady(t0)) return say('Template is still loading. Try again in a moment.', true); }
  draw(true);
  cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'garbavibe-collage.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    draw(); say('Downloaded! Share it from your gallery to WhatsApp or Instagram.'); setTimeout(showSupport, 600); }, 'image/png');
};
if (document.fonts) document.fonts.ready.then(update);
update();

if (document.fonts) document.fonts.load("600 40px 'Noto Serif Devanagari'", 'अ').then(() => update()).catch(() => {});

TPLX.load().then(() => { TPLX.mount({ tabs: $('tstyle'), gal: $('gal'), kind: 'collage',
  onBuiltin: () => { if (curI()) { S.layout = 'Grid 2×2'; $('layout').value = S.layout; update(); } },
  onPick: t => { S.layout = 'I:' + t.id; S.w = 1080; S.h = 1920; $('size').value = '1080x1920'; update(); say(t.name + ' selected. Add ' + t.photos + ' photos.'); },
  onLoaded: () => draw() }); update(); });
