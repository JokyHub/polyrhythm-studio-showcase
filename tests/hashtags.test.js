const test = require('node:test'), assert = require('node:assert');
const {checkHashtags, withHashtags} = require('../scripts/post-format.js');

const ok = {x: ['#jazz'], instagram: ['#jazz', '#bluenote', '#hardbop'], tiktok: ['#jazz', '#jazztok', '#vinyl'], facebook: []};

test('valid hashtags pass', () => assert.deepStrictEqual(checkHashtags(ok, 'Short post.'), []));

test('counts per platform are enforced', () => {
  const p = checkHashtags({...ok, x: ['#a', '#b', '#c'], tiktok: ['#a']}, 'x');
  assert.ok(p.some(s => s.startsWith('hashtags.x has 3')));
  assert.ok(p.some(s => s.startsWith('hashtags.tiktok has 1')));
});

test('malformed and duplicate tags are refused', () => {
  const p = checkHashtags({...ok, instagram: ['#jazz', 'funk', '#Jazz']}, 'x');
  assert.ok(p.some(s => s.includes('"funk" is not a valid')));
  assert.ok(p.some(s => s.includes('duplicates')));
});

test('X hashtags must fit in the first post', () => {
  const p = checkHashtags({...ok, x: ['#jazz', '#afrobeat']}, 'a'.repeat(270));
  assert.ok(p.some(s => s.startsWith('first post + X hashtags')));
});

test('accented tags are valid; withHashtags adds a line', () => {
  assert.deepStrictEqual(checkHashtags({...ok, instagram: ['#música', '#salsa', '#fania']}, 'x'), []);
  assert.strictEqual(withHashtags('Post', ['#jazz', '#soul']), 'Post\n\n#jazz #soul');
  assert.strictEqual(withHashtags('Post', []), 'Post');
});
