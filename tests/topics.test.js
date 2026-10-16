const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path');
const {parseDecision, proposalText, resolveSlate, resolveApprovals, syncTopics} = require('../scripts/telegram.js');
const {splitThread, checkPosts} = require('../scripts/post-format.js');

const msg = (text, replyTo, date = 1760000000) => ({text, date, ...(replyTo ? {reply_to_message: {message_id: replyTo}} : {})});
const map = {42: 'pr-20261011-1', 77: {id: 'day-20261012', kind: 'proposal'}};
const slate = {id: 'day-20261012', date: '2026-10-12', deadline: '19:00 UTC', slots: [
  {slot: 1, time: '08:00', role: 'On this day', genre: 'jazz', candidates: [{n: 1, subject: 'A', calendar: 'Born 12 Oct 1920'}, {n: 2, subject: 'B'}]},
  {slot: 2, time: '13:00', role: 'Who played that?', genre: 'funk', candidates: [{n: 3, subject: 'C'}, {n: 4, subject: 'D', from_backlog: true}]},
  {slot: 3, time: '18:00', role: 'The story', genre: 'afrobeat', candidates: [{n: 5, subject: 'E'}, {n: 6, subject: 'F'}]}]};
const at = d => parseDecision(d).at;

test('numbers replied to a slate pick candidates; ALL takes the first of each', () => {
  assert.deepStrictEqual(parseDecision(msg('1, 4,6', 77), map).picks, [1, 4, 6]);
  assert.deepStrictEqual(parseDecision(msg('2 3 5', 77), map).picks, [2, 3, 5]);
  assert.deepStrictEqual(parseDecision(msg('ALL', 77), map).picks, []);
  assert.strictEqual(parseDecision(msg('2'), map), null);       // not a reply
  assert.strictEqual(parseDecision(msg('2', 42), map), null);   // reply to a draft, not a slate
});

test('TOPIC with a slot, without a slot, and standalone', () => {
  const a = parseDecision(msg('TOPIC 2: Ernesto Djédjé — Gnoantré', 77), map);
  assert.deepStrictEqual([a.id, a.action, a.slot, a.text], ['day-20261012', 'topic', 2, 'Ernesto Djédjé — Gnoantré']);
  assert.strictEqual(parseDecision(msg('topic: Something', 77), map).slot, null);
  const b = parseDecision(msg('topic: Orchestra Baobab, Pirates Choice'), map);
  assert.deepStrictEqual([b.id, b.action, b.text, 'slot' in b], [null, 'topic', 'Orchestra Baobab, Pirates Choice', false]);
});

test('one line, not a reply: "1, 3, TOPIC 3: …" applies to the latest slate', () => {
  const {parseDecisions} = require('../scripts/telegram.js');
  const sent = new Date((1760000000 - 600) * 1000).toISOString();
  const m = {...map, __slates: [{id: 'day-20261012', sent_at: sent}, {id: 'day-20261001', sent_at: '2026-09-30T08:00:00.000Z'}]};
  const ds = parseDecisions(msg('1, 3, TOPIC 3: Rumba congolaise Seben'), m);
  assert.deepStrictEqual(ds.map(d => [d.id, d.action]), [['day-20261012', 'pick'], ['day-20261012', 'topic']]);
  assert.deepStrictEqual([ds[0].picks, ds[1].slot, ds[1].text], [[1, 3], 3, 'Rumba congolaise Seben']);
  const r = resolveSlate(slate, ds);
  assert.deepStrictEqual(r.map(x => x.source), ['owner pick', 'owner pick', 'owner topic']);
  assert.deepStrictEqual([r[0].candidate.n, r[1].candidate.n, r[2].topic], [1, 3, 'Rumba congolaise Seben']);
  // standalone picks and "ALL, SKIP 2" also reach the latest slate; a slate older than 36 h does not count
  assert.deepStrictEqual(parseDecisions(msg('2 4 6'), m)[0].picks, [2, 4, 6]);
  assert.deepStrictEqual(parseDecisions(msg('ALL, SKIP 2'), m).map(d => d.action), ['pick', 'skip']);
  assert.deepStrictEqual(parseDecisions(msg('1,3,5'), {__slates: [{id: 'day-20261001', sent_at: '2026-09-30T08:00:00.000Z'}]}), []);
  // a plain idea with no slot stays a backlog idea even when a slate is open
  assert.deepStrictEqual(parseDecisions(msg('TOPIC: Orchestra Baobab'), m).map(d => d.id), [null]);
});

test('SKIP and APPROVE ALL', () => {
  assert.deepStrictEqual(parseDecision(msg('skip 2', 77), map).slot, 2);
  assert.strictEqual(parseDecision(msg('APPROVE ALL'), map).action, 'approve_all');
  assert.strictEqual(parseDecision(msg('ok all', 42), map).action, 'approve_all');
  assert.strictEqual(parseDecision(msg('APPROVE', 77), map), null); // approve does not apply to a slate
});

test('slate resolution: defaults, picks, skip, own topic', () => {
  const d = (text, sec) => parseDecision(msg(text, 77, 1760000000 + sec), map);
  assert.deepStrictEqual(resolveSlate(slate, []).map(x => x.candidate.n), [1, 3, 5]);
  const r = resolveSlate(slate, [d('2,6', 1)]);
  assert.deepStrictEqual(r.map(x => x.candidate.n), [2, 3, 6]);
  assert.deepStrictEqual(r.map(x => x.source), ['owner pick', 'auto (slot not picked)', 'owner pick']);
  const r2 = resolveSlate(slate, [d('ALL', 1), d('SKIP 1', 2), d('TOPIC 2: My idea', 3), d('TOPIC: Story idea', 4)]);
  assert.deepStrictEqual(r2.map(x => x.source), ['owner skip', 'owner topic', 'owner topic']);
  assert.deepStrictEqual([r2[1].topic, r2[2].topic], ['My idea', 'Story idea']);
});

test('slate text shows slots, calendar flags, backlog marks and how to reply', () => {
  const t = proposalText(slate);
  assert.match(t, /▸ Slot 1 · 08:00 UTC · On this day \(jazz\)/);
  assert.match(t, /📅 Born 12 Oct 1920/);
  assert.match(t, /4\. D {2}\(your idea\)/);
  assert.match(t, /one number per slot \(e\.g\. 1,3,5\)/);
  assert.match(t, /No reply by 19:00 UTC → first candidate of each slot/);
});

test('approvals: explicit decisions and APPROVE ALL, latest wins', () => {
  const drafts = [{id: 'p1', sent_at: '2026-10-11T19:10:00.000Z'}, {id: 'p2', sent_at: '2026-10-11T19:12:00.000Z'}, {id: 'p3', sent_at: '2026-10-11T22:00:00.000Z'}];
  const dec = [{id: null, action: 'approve_all', at: '2026-10-11T20:00:00.000Z'},
    {id: 'p2', action: 'reject', at: '2026-10-11T20:05:00.000Z'},
    {id: 'p1', action: 'edit', text: 'New', at: '2026-10-11T19:30:00.000Z'},
    {id: 'p9', action: 'pick', picks: [1], at: '2026-10-11T21:00:00.000Z'}];
  assert.deepStrictEqual(resolveApprovals(drafts, dec).map(x => x.action), ['approve', 'reject', 'none']); // p3 was sent after APPROVE ALL
});

test('threads: split, limits, no links or hashtags in posts', () => {
  const posts = splitThread('First post.\n\n---\nSecond post.\n---\n\nThird.\n');
  assert.deepStrictEqual(posts, ['First post.', 'Second post.', 'Third.']);
  assert.deepStrictEqual(checkPosts(posts, 'https://example.org/listen'), []);
  assert.strictEqual(checkPosts(['x'.repeat(281)]).length, 1);
  assert.match(checkPosts(['See https://a.b'])[0], /contains a link/);
  assert.match(checkPosts(['Great #jazz'])[0], /hashtag/);
  assert.match(checkPosts(['ok'], 'not a url')[0], /link\.txt/);
  assert.strictEqual(checkPosts(Array(7).fill('a')).length, 1);
});

test('backlog ideas are saved once and only when standalone', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pr-')), 'topics.json');
  const list = [{id: null, action: 'topic', text: 'Idea A', at: 't1'}, {id: 'day-1', action: 'topic', slot: 2, text: 'For a slot', at: 't2'},
    {id: null, action: 'approve_all', at: 't3'}];
  assert.strictEqual(syncTopics(list, file), 1);
  assert.strictEqual(syncTopics(list, file), 0);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(file, 'utf8')).topics, [{text: 'Idea A', at: 't1', status: 'open'}]);
});
