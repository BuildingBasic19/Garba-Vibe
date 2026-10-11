const router = require('express').Router();
const { generate } = require('../services/greetingEngine');
const lib = require('../storage/data/greetings.json');
router.get('/', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().slice(0, 60), cat = String(req.query.category || '');
  const items = lib.items.filter(i => (!cat || i.category === cat) && (!q || i.text.toLowerCase().includes(q)));
  res.json({ ok: true, data: { note: lib.note, categories: lib.categories, items, forms: lib.forms } });
});
router.post('/generate', (req, res, next) => {
  try { res.json({ ok: true, data: { source: 'local-phrase-engine', results: generate(req.body || {}) } }); }
  catch (e) { next(e); }
});
module.exports = router;
