// Loads the Classic / Gen Z image templates (assets/templates/manifest.json) and builds the picker gallery.
const TPLX = (() => {
  const T = { list: [], byId: {}, imgs: {}, base: 'assets/templates/' };
  T.load = () => fetch(T.base + 'manifest.json').then(r => r.json()).then(l => { T.list = l; l.forEach(t => { T.byId[t.id] = t; }); return l; }).catch(() => []);
  T.image = (t, cb) => { let c = T.imgs[t.id]; if (!c) { c = T.imgs[t.id] = new Image(); c.onload = () => cb && cb(); c.src = T.base + t.file; } return c.complete && c.naturalWidth ? c : null; };
  T.isReady = t => { const c = T.imgs[t.id]; return !!(c && c.complete && c.naturalWidth); };
  T.cover = (c, p, x, y, w, h) => { // draw p.img covering the rectangle, with panning offsets p.ox / p.oy
    const sc = Math.max(w / p.img.width, h / p.img.height), dw = p.img.width * sc, dh = p.img.height * sc, mx = (dw - w) / 2, my = (dh - h) / 2;
    p.ox = Math.max(-mx, Math.min(mx, p.ox)); p.oy = Math.max(-my, Math.min(my, p.oy));
    c.drawImage(p.img, x + w / 2 - dw / 2 + p.ox, y + h / 2 - dh / 2 + p.oy, dw, dh);
  };
  // o = { tabs, gal, kind: 'story'|'collage', onBuiltin(), onPick(t), onLoaded() }
  T.mount = o => {
    let pack = 'builtin', count = 0;
    const btn = (txt, fn, on) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn alt'; b.textContent = txt; b.setAttribute('aria-pressed', on); b.onclick = fn; return b; };
    function render() {
      o.tabs.textContent = ''; o.gal.textContent = '';
      [['builtin', 'Built-in'], ['classic', 'Classic'], ['genz', 'Gen Z']].forEach(([k, l]) => o.tabs.appendChild(btn(l, () => { pack = k; count = 0; if (k === 'builtin') o.onBuiltin(); render(); }, pack === k)));
      if (pack === 'builtin') return;
      if (o.kind === 'collage') { const row = document.createElement('div'); row.className = 'tabs'; [[0, 'All'], [4, '4 photos'], [5, '5 photos'], [6, '6 photos']].forEach(([n, l]) => row.appendChild(btn(l, () => { count = n; render(); }, count === n))); o.gal.appendChild(row); }
      const grid = document.createElement('div'); grid.className = 'gallery';
      T.list.filter(t => t.pack === pack && t.kind === o.kind && (!count || t.photos === count)).forEach(t => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'thumb'; b.setAttribute('aria-label', t.name);
        const im = document.createElement('img'); im.src = T.base + t.thumb; im.alt = ''; im.loading = 'lazy';
        const s = document.createElement('span'); s.textContent = t.name; b.append(im, s);
        b.onclick = () => { T.image(t, o.onLoaded); o.onPick(t); }; grid.appendChild(b); });
      if (!grid.children.length) grid.textContent = 'No templates found. Check that frontend/assets/templates exists.';
      o.gal.appendChild(grid);
    }
    render();
  };
  return T;
})();
