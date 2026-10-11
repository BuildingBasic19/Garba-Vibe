// Built-in story backgrounds and collage templates, all drawn with Canvas code (no image files needed).
const TPL = (() => {
  const R = i => ((i * 9301 + 49297) % 233280) / 233280; // deterministic pseudo-random
  const G = (c, w, h, st) => { const g = c.createLinearGradient(0, 0, w * .4, h); st.forEach((s, i) => g.addColorStop(i / (st.length - 1), s)); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  const FR = (c, w, h, col = '#d4a017') => { c.strokeStyle = col; c.lineWidth = 6; c.strokeRect(36, 36, w - 72, h - 72); c.lineWidth = 2; c.strokeRect(56, 56, w - 112, h - 112); };
  const GLOW = (c, x, y, r, col) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const EM = (c, t, x, y, s) => { c.font = s + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y); };
  const ARCH = (c, w, h, col) => { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(w * .12, h * .92); c.lineTo(w * .12, h * .3); c.arc(w / 2, h * .3, w * .38, Math.PI, 0); c.lineTo(w * .88, h * .92); c.stroke(); };
  const MANDALA = (c, x, y, r, col) => { c.strokeStyle = col; c.lineWidth = 2; for (let i = 0; i < 24; i++) { c.save(); c.translate(x, y); c.rotate(i * Math.PI / 12); c.beginPath(); c.ellipse(0, r * .5, r * .12, r * .5, 0, 0, 7); c.stroke(); c.restore(); } };
  const LIGHTS = (c, w, n) => { for (let i = 0; i < n; i++) GLOW(c, (i + .5) * w / n, 60 + Math.sin(i * 1.7) * 25, 34, 'rgba(255,205,90,.95)'); };
  const MOON = (c, w, h, l) => { GLOW(c, w * .5, h * .17, 280, 'rgba(255,240,200,.45)'); c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(w * .5, h * .17, 90, 0, 7); c.fill(); };
  const STARS = (c, w, h, n) => { c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < n; i++) c.fillRect(R(i) * w, R(i + 99) * h * .5, 3, 3); };
  const FLOWERS = (c, w, h, e) => { [[.12, .08], [.88, .08], [.1, .93], [.9, .93], [.08, .5], [.92, .5]].forEach(([x, y]) => EM(c, e, w * x, h * y, 110)); };

  const stories = [
    { n: 'Jai Mata Di', c: '#ffd700', d: (c, w, h, l) => { G(c, w, h, ['#3b0a17', '#7a1530']); FR(c, w, h); if (!l) { MANDALA(c, w / 2, h * .9, 260, 'rgba(212,160,23,.45)'); EM(c, '🪔', w / 2, h * .92, 130); } } },
    { n: 'Golden Arch', c: '#fff3cf', d: (c, w, h, l) => { G(c, w, h, ['#ff9933', '#b34700', '#5c1f00']); GLOW(c, w / 2, h * .45, 600, 'rgba(255,220,120,.5)'); ARCH(c, w, h, '#ffe08a'); MANDALA(c, w / 2, h * .5, 380, 'rgba(255,230,150,.4)'); if (!l) EM(c, '🪔', w / 2, h * .9, 120); } },
    { n: 'Garba Night', c: '#ffd700', d: (c, w, h, l) => { G(c, w, h, ['#1b0a3a', '#4b1a70', '#8a2b7a']); STARS(c, w, h, 70); MOON(c, w, h); if (!l) { EM(c, '💃', w * .3, h * .85, 190); EM(c, '🕺', w * .7, h * .85, 190); } } },
    { n: 'Lotus Ivory', c: '#8b1a2b', d: (c, w, h, l) => { G(c, w, h, ['#fffaf0', '#f6e6c4']); FR(c, w, h); if (!l) { [.15, .85].forEach(x => EM(c, '🪷', w * x, h * .9, 150)); EM(c, '🪔', w / 2, h * .93, 110); } } },
    { n: 'Moonlit Temple', c: '#ffd700', d: (c, w, h, l) => { G(c, w, h, ['#050b2e', '#142a63']); STARS(c, w, h, 80); MOON(c, w, h); FR(c, w, h); if (!l) { EM(c, '🛕', w / 2, h * .8, 340); for (let i = 0; i < 5; i++) EM(c, '🪔', w * (.18 + i * .16), h * .93, 80); } } },
    { n: 'Dandiya Red', c: '#ffd700', d: (c, w, h, l) => { G(c, w, h, ['#8e0f1c', '#c22a2a', '#7a0c18']); FR(c, w, h); c.lineCap = 'round'; c.lineWidth = 34; c.strokeStyle = '#e0a93b'; [[.62, .72, .9, .2], [.5, .76, .84, .3]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(w * a, h * b); c.lineTo(w * d, h * e); c.stroke(); }); c.lineCap = 'butt'; if (!l) EM(c, '🪔', w * .2, h * .9, 110); } },
    { n: 'Floral Navratri', c: '#c0182e', d: (c, w, h, l) => { G(c, w, h, ['#fff9ee', '#f9e9d0']); FR(c, w, h, '#e48aa0'); FLOWERS(c, w, h, '🌸'); if (!l) EM(c, '🪷', w / 2, h * .92, 110); } },
    { n: 'Lantern Purple', c: '#ffd700', d: (c, w, h, l) => { G(c, w, h, ['#2a0a4a', '#5a1a78']); LIGHTS(c, w, 9); if (!l) MANDALA(c, w / 2, h * .9, 300, 'rgba(255,200,100,.5)'); EM(c, '🏮', w * .12, h * .2, 120); EM(c, '🏮', w * .88, h * .2, 120); } },
    { n: 'Emerald Arch', c: '#ffe08a', d: (c, w, h, l) => { G(c, w, h, ['#063a3a', '#0c5e55']); ARCH(c, w, h, '#d4a017'); FR(c, w, h); if (!l) EM(c, '🪔', w / 2, h * .9, 130); } }
  ];

  function shape(c, s, x, y, w, h, r = 24) {
    c.beginPath();
    if (s === 'circle') c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7);
    else if (s === 'hex') { [[.5, 0], [1, .25], [1, .75], [.5, 1], [0, .75], [0, .25]].forEach(([a, b], i) => c[i ? 'lineTo' : 'moveTo'](x + a * w, y + b * h)); c.closePath(); }
    else if (s === 'arch') { const k = w / 2; c.moveTo(x, y + h); c.lineTo(x, y + k); c.arc(x + k, y + k, k, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }
    else if (c.roundRect) c.roundRect(x, y, w, h, s === 'polaroid' ? 4 : r); else c.rect(x, y, w, h);
  }
  const T = (name, bg, color, slots) => ({ name, bg, color, ty: .9, title: name, slots });
  const P = (a, b, c2, d, r) => [a, b, c2, d, r, 'polaroid'];
  const collage = [
    T('Navratri Vibes', 3, '#8b1a2b', [[.07, .06, .4, .32], [.53, .09, .4, .26], [.07, .4, .4, .34], [.53, .38, .4, .38]]),
    T('Together', 2, '#ffd700', [[.05, .06, .46, .26, 0, 'circle'], [.49, .06, .46, .26, 0, 'circle'], [.05, .3, .46, .26, 0, 'circle'], [.49, .34, .46, .26, 0, 'circle']]),
    T('Jai Maa Durga', 3, '#c0182e', [P(.05, .14, .42, .2, -3), P(.52, .16, .42, .2, 3), P(.06, .4, .4, .2, 2), P(.5, .4, .42, .2, -3), P(.28, .62, .44, .18, 3)]),
    T('Navratri Moments', 4, '#ffd700', [P(.08, .08, .5, .2, -3), P(.42, .22, .5, .2, 3), P(.06, .36, .42, .2, 2), P(.5, .5, .42, .2, -2), P(.2, .62, .5, .18, 3)]),
    T('Garba Night', 7, '#ffd700', [P(.06, .1, .42, .3, -2), P(.52, .1, .42, .3, 2), P(.06, .44, .42, .3, 2), P(.52, .44, .42, .3, -2)]),
    T('Dandiya Nights', 6, '#8b1a2b', [P(.07, .1, .42, .3, -4), P(.52, .12, .42, .3, 3), P(.06, .44, .42, .3, 3), P(.52, .46, .42, .3, -3)]),
    T('Dance with Devotion', 8, '#ffe08a', [[.08, .06, .42, .23, 0, 'circle'], [.5, .06, .42, .23, 0, 'circle'], [.29, .3, .42, .23, 0, 'circle'], [.08, .54, .42, .23, 0, 'circle'], [.5, .54, .42, .23, 0, 'circle']]),
    T('Good Vibes Only', 3, '#c0182e', [[.08, .06, .84, .14], [.08, .21, .84, .14], [.08, .36, .84, .14], [.08, .51, .84, .14], [.08, .66, .84, .14]]),
    T('Maa Durga', 0, '#ffd700', [[.06, .07, .3, .33, 0, 'arch'], [.35, .07, .3, .33, 0, 'arch'], [.64, .07, .3, .33, 0, 'arch'], [.06, .43, .3, .33, 0, 'arch'], [.35, .43, .3, .33, 0, 'arch'], [.64, .43, .3, .33, 0, 'arch']]),
    T('Grateful Moments', 6, '#8b1a2b', [P(.06, .07, .42, .22, -3), P(.52, .08, .42, .22, 3), P(.06, .32, .42, .22, 2), P(.52, .33, .42, .22, -2), P(.06, .57, .42, .22, -2), P(.52, .58, .42, .22, 3)]),
    T('Nine Nights', 3, '#8b1a2b', [[.2, .07, .31, .175, 0, 'hex'], [.52, .07, .31, .175, 0, 'hex'], [.04, .25, .31, .175, 0, 'hex'], [.36, .25, .31, .175, 0, 'hex'], [.68, .25, .31, .175, 0, 'hex'], [.36, .43, .31, .175, 0, 'hex']]),
    T('Garba', 4, '#ffd700', [[.07, .07, .28, .34], [.36, .07, .28, .34], [.65, .07, .28, .34], [.07, .44, .28, .34], [.36, .44, .28, .34], [.65, .44, .28, .34]])
  ];

  // photos[i] = {img, ox, oy}; used by the Collage Maker
  function drawTemplate(c, t, w, h, photos, caption, exp) {
    stories[t.bg].d(c, w, h, true);
    t.slots.forEach(([ux, uy, uw, uh, rot = 0, sh = 'rect'], i) => {
      const bw = uw * w, bh = uh * h; c.save(); c.translate((ux + uw / 2) * w, (uy + uh / 2) * h); c.rotate(rot * Math.PI / 180);
      if (sh === 'polaroid') { c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 20; c.fillRect(-bw / 2 - 14, -bh / 2 - 14, bw + 28, bh + 28); c.shadowBlur = 0; }
      c.save(); shape(c, sh, -bw / 2, -bh / 2, bw, bh); c.clip();
      const p = photos[i];
      if (p) { const sc = Math.max(bw / p.img.width, bh / p.img.height), dw = p.img.width * sc, dh = p.img.height * sc, mx = (dw - bw) / 2, my = (dh - bh) / 2;
        p.ox = Math.max(-mx, Math.min(mx, p.ox)); p.oy = Math.max(-my, Math.min(my, p.oy)); c.drawImage(p.img, -dw / 2 + p.ox, -dh / 2 + p.oy, dw, dh); }
      else if (!exp) { c.fillStyle = 'rgba(128,128,128,.4)'; c.fillRect(-bw / 2, -bh / 2, bw, bh); c.fillStyle = '#fff'; c.font = '40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+ Add photo', 0, 0); }
      c.restore();
      if (sh !== 'polaroid') { shape(c, sh, -bw / 2, -bh / 2, bw, bh); c.strokeStyle = '#d4a017'; c.lineWidth = 6; c.stroke(); }
      c.restore();
    });
    c.fillStyle = t.color; c.font = "600 84px 'Playfair Display','Noto Serif Devanagari',Georgia,serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(caption || t.title, w / 2, t.ty * h);
  }
  return { stories, collage, drawTemplate, shape };
})();
if (typeof module !== 'undefined') module.exports = TPL;
