const router = require('express').Router();
const store = require('../storage/jsonStore');
const { httpError } = require('../middleware/errorHandler');
const TYPES = ['story', 'collage'];
const UUID = /^[0-9a-f-]{36}$/i;

// Every request must carry the anonymous browser id; designs are only visible to that browser.
router.use((req, res, next) => {
  const o = req.get('X-Client-Id');
  if (!o || !UUID.test(o)) return next(httpError(400, 'Missing or invalid X-Client-Id header'));
  req.owner = o; next();
});
function validate(req, res, next) {
  const { title, type, data } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || title.length > 80) return next(httpError(400, 'title must be 1-80 characters'));
  if (!TYPES.includes(type)) return next(httpError(400, 'type must be story or collage'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) return next(httpError(400, 'data must be an object'));
  const json = JSON.stringify(data);
  if (json.length > 50000) return next(httpError(400, 'design data too large'));
  if (json.includes('data:image')) return next(httpError(400, 'embedded images are not allowed'));
  req.clean = { title: title.trim(), type, data };
  next();
}
const wrap = fn => (req, res, next) => fn(req, res).catch(next);
router.get('/', wrap(async (req, res) => res.json({ ok: true, data: await store.all(req.owner) })));
router.get('/:id', wrap(async (req, res) => {
  const d = await store.get(req.params.id, req.owner);
  if (!d) throw httpError(404, 'Design not found');
  res.json({ ok: true, data: d });
}));
router.post('/', validate, wrap(async (req, res) => res.status(201).json({ ok: true, data: await store.create(req.owner, req.clean) })));
router.put('/:id', validate, wrap(async (req, res) => {
  const d = await store.update(req.params.id, req.owner, req.clean);
  if (!d) throw httpError(404, 'Design not found');
  res.json({ ok: true, data: d });
}));
router.delete('/:id', wrap(async (req, res) => {
  if (!(await store.remove(req.params.id, req.owner))) throw httpError(404, 'Design not found');
  res.json({ ok: true, data: { deleted: true } });
}));
module.exports = router;
