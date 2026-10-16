const test = require('node:test'), assert = require('node:assert');
const {parseDecision} = require('../scripts/telegram.js');

const msg = (text, replyTo) => ({text, date: 1760000000, ...(replyTo ? {reply_to_message: {message_id: replyTo}} : {})});
const map = {42: 'wlj-20261013'};

test('approve as a reply to the package', () => {
  assert.deepStrictEqual(parseDecision(msg('APPROVE', 42), map).action, 'approve');
  assert.strictEqual(parseDecision(msg('ok', 42), map).id, 'wlj-20261013');
});

test('approve with an explicit id', () => {
  const d = parseDecision(msg('approve wlj-20261016'), map);
  assert.deepStrictEqual([d.id, d.action], ['wlj-20261016', 'approve']);
});

test('edit carries the new text, as reply or with id', () => {
  assert.strictEqual(parseDecision(msg('EDIT: New text here.', 42), map).text, 'New text here.');
  assert.strictEqual(parseDecision(msg('edit wlj-1: Line one\nline two'), map).text, 'Line one\nline two');
});

test('ambiguous or unrelated messages are ignored', () => {
  assert.strictEqual(parseDecision(msg('approve'), map), null);          // no id, not a reply
  assert.strictEqual(parseDecision(msg('EDIT', 42), map), null);         // edit without text
  assert.strictEqual(parseDecision(msg('approve but change x', 42), map), null);
  assert.strictEqual(parseDecision(msg('nice one!', 42), map), null);
  assert.strictEqual(parseDecision(msg('approve x', 999), map).id, 'x'); // reply to unknown message → treated as standalone
});

test('reject', () => {
  assert.strictEqual(parseDecision(msg('Reject', 42), map).action, 'reject');
});
