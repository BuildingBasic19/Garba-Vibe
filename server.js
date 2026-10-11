const express = require('express');
const path = require('path');
const { errorHandler, notFound } = require('./backend/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; script-src 'self'; frame-ancestors 'none'" });
  next();
});
const hits = new Map(); // simple per-IP rate limit: 120 API requests/minute
app.use('/api', (req, res, next) => {
  const n = Date.now(), e = hits.get(req.ip) || { c: 0, t: n };
  if (n - e.t > 60000) { e.c = 0; e.t = n; }
  e.c++; hits.set(req.ip, e);
  if (e.c > 120) return res.status(429).json({ ok: false, error: 'Too many requests. Please slow down.' });
  next();
});
setInterval(() => hits.clear(), 600000).unref();
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ ok: true, data: { status: 'up' } }));
app.use('/api/greetings', require('./backend/routes/greetings'));
app.use('/api/templates', require('./backend/routes/templates'));
app.use('/api/designs', require('./backend/routes/designs'));
app.use('/api', notFound);
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GarbaVibe running at http://localhost:${PORT}`));
