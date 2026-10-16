/**
 * Post format helpers. A post.md holds one X post, or a thread: posts separated by a line containing only `---`.
 *
 *   node scripts/post-format.js queue/<id>     print each post's length; exit 1 if the package breaks a limit
 *
 * Hashtags never go in post.md: they live in hashtags.json, one list per platform, and the publisher appends them.
 */
const fs = require('fs'), path = require('path');

const MAX_CHARS = 280, MAX_THREAD = 4; // Upload-Post caps X at 10 uploads per 24 h for the whole day
/** Hashtag count allowed per platform (owner decision, 2026-10-16). */
const HASHTAG_LIMITS = {x: [0, 2], instagram: [3, 5], tiktok: [3, 5], facebook: [0, 2]};

/** Append hashtags to a text on their own line (unchanged when there are none). */
function withHashtags(text, tags) {
  return tags && tags.length ? `${text}\n\n${tags.join(' ')}` : text;
}

/** Problems with hashtags.json content, given the first post (X tags must fit in it). */
function checkHashtags(tags, firstPost = '') {
  const out = [];
  for (const [p, [min, max]] of Object.entries(HASHTAG_LIMITS)) {
    const list = tags[p] || [];
    if (!Array.isArray(list)) { out.push(`hashtags.${p} is not a list`); continue; }
    if (list.length < min || list.length > max) out.push(`hashtags.${p} has ${list.length} (allowed ${min}–${max})`);
    list.filter(t => !/^#[\p{L}\p{N}_]+$/u.test(t)).forEach(t => out.push(`hashtags.${p}: "${t}" is not a valid hashtag`));
    if (new Set(list.map(t => t.toLowerCase())).size !== list.length) out.push(`hashtags.${p} has duplicates`);
  }
  const xLen = withHashtags(firstPost, tags.x).length;
  if (xLen > MAX_CHARS) out.push(`first post + X hashtags is ${xLen} chars (max ${MAX_CHARS})`);
  return out;
}

/** Split post.md text into its posts (a single post gives a one-item list). */
function splitThread(text) {
  return text.replace(/^﻿/, '').split(/^\s*---\s*$/m).map(s => s.trim()).filter(Boolean);
}

/** Problems with a list of posts and an optional link, as human-readable strings (empty = fine). */
function checkPosts(posts, link) {
  const out = [];
  if (!posts.length) out.push('post.md is empty');
  if (posts.length > MAX_THREAD) out.push(`thread has ${posts.length} posts (max ${MAX_THREAD})`);
  posts.forEach((p, i) => {
    if (p.length > MAX_CHARS) out.push(`post ${i + 1} is ${p.length} chars (max ${MAX_CHARS})`);
    if (/https?:\/\//.test(p)) out.push(`post ${i + 1} contains a link (links go in link.txt, posted as a reply)`);
    if (/(^|\s)#\w/.test(p)) out.push(`post ${i + 1} contains a hashtag`);
  });
  if (link !== undefined && link !== null && !/^https:\/\/\S+$/.test(link.trim())) out.push('link.txt is not a single https URL');
  return out;
}

if (require.main === module) {
  const bf = path.join(path.resolve(process.argv[2] || ''), 'brief.json');
  if (fs.existsSync(bf)) {
    const b = JSON.parse(fs.readFileSync(bf, 'utf8').replace(/^﻿/, ''));
    const lib = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audio', 'library.json'), 'utf8').replace(/^﻿/, ''));
    for (const p of ['tiktok', 'instagram']) { const n = musicNote(b, lib.tracks, p); if (n) console.log('music note ' + p + ': ' + n.replace(/\n/g, ' | ')); }
  }
  const dir = path.resolve(process.argv[2] || '');
  const posts = splitThread(fs.readFileSync(path.join(dir, 'post.md'), 'utf8'));
  const lf = path.join(dir, 'link.txt'), link = fs.existsSync(lf) ? fs.readFileSync(lf, 'utf8') : undefined;
  posts.forEach((p, i) => console.log(`post ${i + 1}/${posts.length}: ${p.length} chars`));
  if (link) console.log(`link reply: ${link.trim()}`);
  const problems = checkPosts(posts, link);
  const hf = path.join(dir, 'hashtags.json');
  if (fs.existsSync(hf)) {
    const tags = JSON.parse(fs.readFileSync(hf, 'utf8').replace(/^﻿/, ''));
    Object.entries(tags).forEach(([p, l]) => console.log(`hashtags ${p}: ${[].concat(l).join(' ')}`));
    problems.push(...checkHashtags(tags, posts[0]));
  }
  problems.forEach(p => console.error('✗ ' + p));
  process.exit(problems.length ? 1 : 0);
}

module.exports = {splitThread, checkPosts, checkHashtags, withHashtags, MAX_CHARS, MAX_THREAD, HASHTAG_LIMITS};

/**
 * Music note for TikTok, Instagram and Facebook captions (owner, 2026-10-16): what the viewer hears and where the
 * real recording is. `brief.original` = {title, artist} of the recording the post discusses; `tracks` = the
 * entries of audio/library.json. Returns '' when there is nothing to say.
 */
function musicNote(brief, tracks = [], platform = 'tiktok') {
  const v = brief.visual || {}, pa = v.platform_audio || {}, o = brief.original, lines = [];
  const song = platform === 'tiktok' ? pa.tiktok : pa.meta;
  const t = tracks.find(x => x.id === v.audio);
  if (song) lines.push(`Sound: "${song.title}" by ${song.artist}, via the ${platform === 'tiktok' ? 'TikTok' : 'Instagram'} music library.`);
  else if (t) lines.push(`Background music: "${t.title}" by ${t.artist}, a licensed library track, not the recording discussed.`);
  if (o && o.title && o.artist && !(song && song.title === o.title)) lines.push(`Hear the original: "${o.title}" by ${o.artist}, on your streaming service.`);
  return lines.join('\n');
}
module.exports.musicNote = musicNote;
