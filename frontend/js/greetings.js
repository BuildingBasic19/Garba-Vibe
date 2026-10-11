const $ = id => document.getElementById(id);
let LIB = null;
const say = m => { $('msg').textContent = m; };
const favs = () => JSON.parse(localStorage.getItem('gv_fav') || '[]');
async function copy(t) { try { await navigator.clipboard.writeText(t); say('Copied!'); } catch { say('Could not copy. Please select the text and copy it manually.'); } }
async function share(t) {
  if (navigator.share) { try { await navigator.share({ text: t }); } catch {} }
  else { copy(t); say('Sharing is not supported in this browser, so the text was copied instead.'); }
}
function blockParts(text) {
  const p = document.createElement('p'); p.textContent = text; const r = document.createElement('div'); r.className = 'row';
  [['Copy', () => copy(text)], ['Share', () => share(text)], ['Use in story', () => { localStorage.setItem('gv_pending_text', text); location.href = 'story-maker.html'; }]]
    .forEach(([l, f]) => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = l; b.onclick = f; r.appendChild(b); });
  return [p, r];
}
function card(it, withFav) {
  const c = document.createElement('div'); c.className = 'card';
  const p = document.createElement('p'); p.textContent = it.text;
  const r = document.createElement('div'); r.className = 'row';
  const mk = (label, fn) => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = label; b.onclick = fn; r.appendChild(b); };
  mk('Copy', () => copy(it.text)); mk('Share', () => share(it.text));
  mk('Use in story', () => { localStorage.setItem('gv_pending_text', it.text); location.href = 'story-maker.html'; });
  if (withFav) mk(favs().includes(it.id) ? '★ Saved' : '☆ Save', () => {
    const a = favs(); localStorage.setItem('gv_fav', JSON.stringify(a.includes(it.id) ? a.filter(x => x !== it.id) : [...a, it.id])); render(); });
  c.append(p, r); return c;
}
function render() {
  const q = $('q').value.toLowerCase(), cat = $('cat').value, onlyFav = $('onlyfav').checked, f = favs();
  const items = LIB.items.filter(i => (!cat || i.category === cat) && (!q || i.text.toLowerCase().includes(q)) && (!onlyFav || f.includes(i.id)));
  const box = $('list'); box.textContent = '';
  if (!items.length) { box.textContent = 'No greetings match. Try a different search.'; return; }
  items.forEach(i => { const c = card(i, true); const t = document.createElement('small'); t.textContent = i.category; c.prepend(t); box.appendChild(c); });
}
(async () => {
  try {
    LIB = window.GV_DATA || await api('/greetings');
    $('note').textContent = LIB.note;
    LIB.categories.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; $('cat').appendChild(o); });
    const day = Math.floor(Date.now() / 86400000), d = LIB.items[day % LIB.items.length];
    const h = document.createElement('h3'); h.textContent = 'Greeting of the day';
    $('daily').append(h, card(d, false));
    LIB.forms.forEach(f => { const c = document.createElement('div'); c.className = 'card';
      const t = document.createElement('h3'); t.textContent = 'Day ' + f.day + ': ' + f.name + ' (' + f.name_hi + ')';
      const dsc = document.createElement('p'); dsc.textContent = f.description; c.append(t, dsc);
      [['English', f.en], ['हिंदी', f.hi]].forEach(([lab, arr]) => arr.forEach(tx => { const l = document.createElement('small'); l.textContent = lab; c.append(l, ...blockParts(tx)); }));
      $('forms').appendChild(c); });
    ['q', 'cat', 'onlyfav'].forEach(i => $(i).addEventListener('input', render)); render();
  } catch (e) { say('Could not load greetings: ' + e.message); }
})();
