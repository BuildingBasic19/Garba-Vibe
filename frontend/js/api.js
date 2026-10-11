// Shared helpers. Each browser gets an anonymous id so saved designs are private to it (this is not a login).
function clientId() {
  let id = localStorage.getItem('gv_cid');
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
    localStorage.setItem('gv_cid', id);
  }
  return id;
}
async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { ...opts, headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId() } });
  const j = await r.json().catch(() => ({ ok: false, error: 'Bad server response' }));
  if (!j.ok) throw new Error(j.error);
  return j.data;
}
