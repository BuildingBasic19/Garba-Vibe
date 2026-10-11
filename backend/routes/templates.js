const router = require('express').Router();
router.get('/', (req, res) => res.json({ ok: true, data: [
  { id: 'maroon', name: 'Royal Maroon' }, { id: 'purple', name: 'Royal Purple' },
  { id: 'saffron', name: 'Saffron Glow' }, { id: 'ivory', name: 'Warm Ivory' }] }));
module.exports = router;
