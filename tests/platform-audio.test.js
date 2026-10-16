const test = require('node:test'), assert = require('node:assert');
const {platformAudioLines, handoffText} = require('../scripts/telegram.js');

test('no platform audio → no lines', () => {
  assert.deepStrictEqual(platformAudioLines({}), []);
  assert.deepStrictEqual(platformAudioLines(undefined), []);
});

test('TikTok and Meta songs are listed for the draft', () => {
  const lines = platformAudioLines({platform_audio: {
    tiktok: {id: '7123', title: 'Water No Get Enemy', artist: 'Fela Kuti', start_ms: 42000},
    meta: {title: 'Water No Get Enemy', artist: 'Fela Kuti', start: '0:42'}}});
  assert.strictEqual(lines[0], 'TikTok sound: Water No Get Enemy — Fela Kuti (id 7123, from 42 s)');
  assert.match(lines[1], /add in app\): Water No Get Enemy — Fela Kuti, from 0:42/);
});

test('handoff message names the song, the steps and the caption', () => {
  const t = handoffText('pr-20261020-2', 'Post one\n\nPost two', {title: 'Oye Como Va', artist: 'Tito Puente'});
  assert.match(t, /music sticker: Oye Como Va — Tito Puente\./);
  assert.match(t, /^Finish in app: pr-20261020-2/);
  assert.ok(t.endsWith('Caption:\nPost one\n\nPost two'));
});

const {musicNote} = require('../scripts/post-format.js');
const tracks = [{id: 'mixkit-842', title: 'Ahead of Time', artist: 'Michael Ramir C.'}];

test('music note: library track + original', () => {
  const n = musicNote({visual: {audio: 'mixkit-842'}, original: {title: 'Use Me', artist: 'Bill Withers'}}, tracks);
  assert.strictEqual(n, 'Background music: "Ahead of Time" by Michael Ramir C., a licensed library track, not the recording discussed.\n' +
    'Hear the original: "Use Me" by Bill Withers, on your streaming service.');
});

test('music note: platform sound of the original needs no second line', () => {
  const b = {visual: {audio: 'mixkit-842', platform_audio: {tiktok: {id: '1', title: 'Use Me', artist: 'Bill Withers'}}},
    original: {title: 'Use Me', artist: 'Bill Withers'}};
  assert.strictEqual(musicNote(b, tracks, 'tiktok'), 'Sound: "Use Me" by Bill Withers, via the TikTok music library.');
  assert.match(musicNote(b, tracks, 'instagram'), /^Background music: .*\nHear the original: "Use Me"/);
});

test('music note: nothing known → empty', () => assert.strictEqual(musicNote({visual: {}}, tracks), ''));
