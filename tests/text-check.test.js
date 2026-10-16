const test = require('node:test'), assert = require('node:assert');
const {findMojibake} = require('../render/text-check.js');

test('clean typography passes', () => {
  assert.deepStrictEqual(findMojibake({t: 'Miles Davis’s “Blues for Pablo” · Fela Aníkúlápó Kútì — Ernesto Djédjé'}), []);
});

test('UTF-8 read as Windows-1252 is caught', () => {
  assert.strictEqual(findMojibake({t: 'Miles Davisâ€™s name'}).length, 1);
  assert.strictEqual(findMojibake({a: ['Miles Ahead Â· Columbia']}).length, 1);
  assert.strictEqual(findMojibake({t: 'Ã©tÃ©'}).length, 1);
});
