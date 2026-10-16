/**
 * Detect mojibake: UTF-8 text that was decoded as Windows-1252/Latin-1 (e.g. "’" → "â€™", "·" → "Â·").
 * Returns the offending strings found anywhere in a JSON-like value.
 */
const PATTERN = /Ã[\u0080-¿ƒ‘-›]|â€|Â[ -¿]|�/;

function findMojibake(value, out = []) {
  if (typeof value === 'string') { if (PATTERN.test(value)) out.push(value.slice(0, 60)); }
  else if (value && typeof value === 'object') Object.values(value).forEach(v => findMojibake(v, out));
  return out;
}

module.exports = {findMojibake};
