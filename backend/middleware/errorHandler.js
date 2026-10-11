function httpError(status, message) { const e = new Error(message); e.status = status; return e; }
function notFound(req, res) { res.status(404).json({ ok: false, error: 'Not found' }); }
function errorHandler(err, req, res, next) {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ ok: false, error: status === 500 ? 'Server error' : err.message });
}
module.exports = { httpError, notFound, errorHandler };
