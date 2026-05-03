const { customAlphabet } = require("nanoid");

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const DEFAULT_LENGTH = 6;

const _nanoid = customAlphabet(ALPHABET, DEFAULT_LENGTH);

function generateId(length) {
  if (!length || length === DEFAULT_LENGTH) return _nanoid();
  return customAlphabet(ALPHABET, length)();
}

module.exports = { generateId };
