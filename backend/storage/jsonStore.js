// JSON-file store. Designs are scoped to an anonymous browser id (owner). Swap for a database later.
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const FILE = path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'designs.json');
let queue = Promise.resolve();
const lock = fn => { const r = queue.then(fn); queue = r.catch(() => {}); return r; };
const strip = ({ owner, ...d }) => d;
const fail = (s, m) => Object.assign(new Error(m), { status: s });
async function read() {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}
async function write(list) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}
module.exports = {
  all: async owner => (await read()).filter(d => d.owner === owner).map(strip),
  get: async (id, owner) => { const d = (await read()).find(x => x.id === id && x.owner === owner); return d ? strip(d) : null; },
  create: (owner, input) => lock(async () => {
    const list = await read();
    if (list.length >= 5000 || list.filter(d => d.owner === owner).length >= 50) throw fail(400, 'Design limit reached. Delete some designs first.');
    const now = new Date().toISOString();
    const d = { id: crypto.randomUUID(), owner, ...input, createdAt: now, updatedAt: now };
    list.push(d); await write(list); return strip(d);
  }),
  update: (id, owner, input) => lock(async () => {
    const list = await read(); const i = list.findIndex(d => d.id === id && d.owner === owner);
    if (i < 0) return null;
    list[i] = { ...list[i], ...input, updatedAt: new Date().toISOString() };
    await write(list); return strip(list[i]);
  }),
  remove: (id, owner) => lock(async () => {
    const list = await read(); const next = list.filter(d => !(d.id === id && d.owner === owner));
    if (next.length === list.length) return false;
    await write(next); return true;
  })
};
