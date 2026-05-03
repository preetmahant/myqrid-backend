const _store = new Map();

function key(collection, id) {
  return `${collection}:${id}`;
}

async function saveToDB(collection, id, doc) {
  _store.set(key(collection, id), { ...doc });
}

async function getFromDB(collection, id) {
  const doc = _store.get(key(collection, id));
  return doc ? { ...doc } : null;
}

async function updateInDB(collection, id, partial) {
  const existing = _store.get(key(collection, id));
  if (!existing) {
    throw Object.assign(new Error("Document not found"), { status: 404 });
  }
  const updated = { ...existing, ...partial };
  _store.set(key(collection, id), updated);
  return { ...updated };
}

async function pushToDB(collection, id, field, item) {
  const existing = _store.get(key(collection, id));
  if (!existing) {
    throw Object.assign(new Error("Document not found"), { status: 404 });
  }
  const list = Array.isArray(existing[field]) ? existing[field] : [];
  existing[field] = [...list, item];
  _store.set(key(collection, id), existing);
}

module.exports = {
  saveToDB,
  getFromDB,
  updateInDB,
  pushToDB,
};
