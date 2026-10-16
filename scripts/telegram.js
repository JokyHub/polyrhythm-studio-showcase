/**
 * Telegram review channel (Bot API, no dependency). Reads TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_ID from the
 * environment; never prints them. Only messages from the owner's user ID are ever read.
 *
 *   node scripts/telegram.js send queue/<id>     send the review package (media + post text, then sources + how to reply)
 *   node scripts/telegram.js propose queue/day-YYYYMMDD   send the daily slate (proposal.json in that folder)
 *   node scripts/telegram.js slate queue/day-YYYYMMDD     print the owner's choice for each slot
 *   node scripts/telegram.js approvals           print the effective decision for every draft awaiting approval
 *   node scripts/telegram.js decisions           print owner decisions as JSON: [{id, action, text?, n?, at}]
 *                                                (also saves standalone TOPIC ideas to log/topics.json)
 *   node scripts/telegram.js handoff queue/<id>  send the Instagram/Facebook "finish in app" package: media,
 *                                                caption and the catalogue song to add with the app's music sticker
 *   node scripts/telegram.js notify "<text>"     plain message to the owner
 *
 * Reply grammar (case-insensitive), either as a reply to the package message or with the id:
 *   APPROVE [id]    EDIT [id]: <new post text>    REJECT [id]
 */
const fs = require('fs'), path = require('path');
const {splitThread, checkPosts, withHashtags, musicNote} = require('./post-format');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN, OWNER = process.env.TELEGRAM_OWNER_ID;
const api = m => `https://api.telegram.org/bot${TOKEN}/${m}`;
const read = f => fs.readFileSync(f, 'utf8').replace(/^﻿/, '');

async function call(method, body) {
  const isForm = body instanceof FormData;
  const res = await fetch(api(method), {method: 'POST', body: isForm ? body : JSON.stringify(body),
    headers: isForm ? {} : {'content-type': 'application/json'}});
  const j = await res.json();
  if (!j.ok) throw new Error(`${method}: ${j.description}`);
  return j.result;
}

/**
 * Parse one owner message into a decision, or null. `replyMap` maps a Telegram message_id to the post id of a
 * review package (string) or of a daily slate (`{id, kind: 'proposal'}`, id = `day-YYYYMMDD`).
 *
 * Replies to a slate:  `1,4,5` → {action:'pick', picks:[1,4,5]}   `ALL` → {action:'pick', picks:[]} (first
 *   candidate of every slot)   `TOPIC 2: <idea>` → own subject for slot 2 (`TOPIC: <idea>` → slot null, the
 *   coordinator chooses the slot)   `SKIP 2` → no post in slot 2.
 * Anywhere:  `TOPIC: <idea>` not replying to a slate → backlog idea (id null)
 *            `APPROVE ALL` → approves every draft awaiting approval that was sent before this message.
 * Replies to a draft package: APPROVE · REJECT · EDIT: <new text>  (or with the id: `APPROVE <id>`).
 */
function parseDecision(msg, replyMap = {}) { return parseDecisions(msg, replyMap)[0] || null; }

/**
 * Like parseDecision, but one message may carry several slate decisions on one line, and need not be a reply:
 * `1, 3, TOPIC 3: Rumba congolaise` → pick [1,3] + own topic for slot 3. A slate answer that is not a reply applies
 * to the latest slate sent before it (within 36 h), listed in `replyMap.__slates` = [{id, sent_at}].
 */
function parseDecisions(msg, replyMap = {}) {
  const text = (msg.text || '').trim();
  const at = new Date(msg.date * 1000).toISOString();
  const target = msg.reply_to_message && replyMap[msg.reply_to_message.message_id];
  const proposal = target && typeof target === 'object' && target.kind === 'proposal' ? target.id : null;
  if (/^(approve|ok)\s+all$/i.test(text)) return [{id: null, action: 'approve_all', at}];

  // Slate answer: optional picks / ALL / SKIP n, then optional "TOPIC [n]: idea".
  const tm = text.match(/^([\s\S]*?)\btopic\s*(\d)?\s*:\s*([\s\S]+)$/i);
  const head = (tm ? tm[1] : text).trim().replace(/[,;&\s]+$/, '');
  const topic = tm ? {slot: tm[2] ? +tm[2] : null, text: tm[3].trim()} : null;
  const headOk = head === '' || /^(?:(?:skip\s+\d|all|#?\d+)(?:\s*[,;&\s]\s*|$))+$/i.test(head);
  if (headOk && (head !== '' || topic) && typeof target !== 'string') {
    const latest = (replyMap.__slates || []).filter(s => s.sent_at <= at && Date.parse(at) - Date.parse(s.sent_at) < 36 * 3600e3)
      .sort((a, b) => a.sent_at.localeCompare(b.sent_at)).pop();
    const slate = proposal || ((head !== '' || (topic && topic.slot)) && latest ? latest.id : null);
    if (!slate) return topic && head === '' ? [{id: null, action: 'topic', text: topic.text, at}] : []; // backlog idea
    const out = [], skips = [...head.matchAll(/skip\s+(\d)/gi)].map(m => +m[1]);
    const nums = (head.replace(/skip\s+\d/gi, ' ').match(/\d+/g) || []).map(Number);
    if (nums.length || /\ball\b/i.test(head)) out.push({id: slate, action: 'pick', picks: /\ball\b/i.test(head) ? [] : nums, at});
    for (const s of skips) out.push({id: slate, action: 'skip', slot: s, at});
    if (topic) out.push({id: slate, action: 'topic', slot: topic.slot, text: topic.text, at});
    return out;
  }
  if (proposal) return [];
  const replied = typeof target === 'string' ? target : null;
  if (topic && head === '') return [{id: null, action: 'topic', text: topic.text, at}];
  // As a reply: "APPROVE" / "REJECT" / "EDIT: text". Standalone: "APPROVE <id>" / "EDIT <id>: text".
  const m = replied ? text.match(/^(approve|ok|reject|edit)\b\s*:?\s*([\s\S]*)$/i)
    : text.match(/^(approve|ok|reject|edit)\s+([A-Za-z0-9_-]+)\s*(?::\s*([\s\S]*))?$/i);
  if (!m) return [];
  const action = {ok: 'approve'}[m[1].toLowerCase()] || m[1].toLowerCase();
  const id = replied || m[2], rest = ((replied ? m[2] : m[3]) || '').trim();
  if (action === 'edit' && !rest) return [];
  if (action !== 'edit' && replied && rest) return []; // "approve but…" is ambiguous: ignore
  return [{id, action, ...(action === 'edit' ? {text: rest} : {}), at}];
}

function replyMapFromQueue(root = 'queue') {
  const map = {};
  if (!fs.existsSync(root)) return map;
  for (const id of fs.readdirSync(root)) {
    const f = path.join(root, id, 'status.json'), p = path.join(root, id, 'proposal.json');
    if (fs.existsSync(f)) for (const mid of JSON.parse(read(f)).telegram_message_ids || []) map[mid] = id;
    if (fs.existsSync(p)) {
      const prop = JSON.parse(read(p));
      for (const mid of prop.telegram_message_ids || []) map[mid] = {id, kind: 'proposal'};
      if (prop.sent_at) (map.__slates = map.__slates || []).push({id, sent_at: prop.sent_at});
    }
  }
  return map;
}

/** Build the daily slate message from a proposal object: slots, each with numbered candidates (pure, testable). */
function proposalText(p) {
  const lines = [`${process.env.STUDIO_NAME || 'Polyrhythm'} — slate for ${p.date}`, ''];
  for (const s of p.slots) {
    lines.push(`▸ Slot ${s.slot} · ${s.time} UTC · ${s.role} (${s.genre})`);
    for (const c of s.candidates) {
      lines.push(`${c.n}. ${c.subject}${c.from_backlog ? '  (your idea)' : ''}`);
      if (c.angle) lines.push(`   ${c.angle}`);
      if (c.calendar) lines.push(`   📅 ${c.calendar}`);
    }
    lines.push('');
  }
  const firsts = p.slots.map(s => s.candidates[0].n).join(',');
  lines.push(`Reply to this message: one number per slot (e.g. ${firsts}) · ALL = first of each · SKIP 2 = no post in slot 2`,
    `Your own subject: TOPIC 3: <idea>`,
    `No reply by ${p.deadline || 'drafting time'} → first candidate of each slot. You still approve every draft.`);
  return lines.join('\n');
}

/** Resolve the owner's slate decisions into one choice per slot (pure, testable). Later decisions win. */
function resolveSlate(p, decisions) {
  const mine = decisions.filter(d => d.id === p.id).sort((a, b) => a.at.localeCompare(b.at));
  const out = {};
  for (const s of p.slots) out[s.slot] = {slot: s.slot, source: 'auto (no reply)', candidate: s.candidates[0]};
  for (const d of mine) {
    if (d.action === 'pick') for (const s of p.slots) {
      const c = d.picks.length ? s.candidates.find(c => d.picks.includes(c.n)) : s.candidates[0];
      if (c) out[s.slot] = {slot: s.slot, source: 'owner pick', candidate: c};
      else if (out[s.slot].source === 'auto (no reply)') out[s.slot].source = 'auto (slot not picked)';
    }
    if (d.action === 'skip' && out[d.slot]) out[d.slot] = {slot: d.slot, source: 'owner skip', candidate: null};
    if (d.action === 'topic') {
      const slot = d.slot && out[d.slot] ? d.slot : p.slots[p.slots.length - 1].slot; // unspecified → the story slot
      out[slot] = {slot, source: 'owner topic', candidate: null, topic: d.text};
    }
  }
  return p.slots.map(s => out[s.slot]);
}

/**
 * The effective decision for each draft awaiting approval (pure, testable). `drafts` = [{id, sent_at}].
 * An explicit APPROVE/EDIT/REJECT for the draft and an `APPROVE ALL` sent after the draft compete; the latest wins.
 */
function resolveApprovals(drafts, decisions) {
  return drafts.map(d => {
    const mine = decisions.filter(x => (x.id === d.id && ['approve', 'edit', 'reject'].includes(x.action)) ||
      (x.action === 'approve_all' && x.at > d.sent_at)).sort((a, b) => a.at.localeCompare(b.at));
    const last = mine[mine.length - 1];
    if (!last) return {id: d.id, action: 'none'};
    return {id: d.id, action: last.action === 'approve_all' ? 'approve' : last.action, ...(last.text ? {text: last.text} : {}), at: last.at};
  });
}

/** Print the effective decision for every draft in queue/ whose status is awaiting_approval. */
async function approvals() {
  const drafts = [];
  for (const id of fs.existsSync('queue') ? fs.readdirSync('queue') : []) {
    const f = path.join('queue', id, 'status.json');
    if (!fs.existsSync(f)) continue;
    const s = JSON.parse(read(f));
    if (s.state === 'awaiting_approval') drafts.push({id, sent_at: s.sent_at || ''});
  }
  const list = await fetchDecisions();
  syncTopics(list);
  console.log(JSON.stringify(resolveApprovals(drafts, list), null, 2));
}

/** Send queue/<id>/proposal.json to the owner and record the message id in it. */
async function propose(dir) {
  const f = path.join(dir, 'proposal.json'), p = JSON.parse(read(f));
  const mid = (await call('sendMessage', {chat_id: OWNER, text: proposalText(p).slice(0, 4096), disable_web_page_preview: true})).message_id;
  Object.assign(p, {telegram_message_ids: [mid], sent_at: new Date().toISOString()});
  fs.writeFileSync(f, JSON.stringify(p, null, 2) + '\n');
  console.log(`proposed ${path.basename(dir)} (${p.slots.length} slots)`);
}

/** Print the per-slot choices for a slate, from the owner's latest replies. */
async function slate(dir) {
  const p = JSON.parse(read(path.join(dir, 'proposal.json'))), list = await fetchDecisions();
  syncTopics(list);
  console.log(JSON.stringify(resolveSlate(p, list), null, 2));
}

/** Keep standalone TOPIC ideas in log/topics.json (Telegram only retains updates for ~24 h). Returns the count added. */
function syncTopics(list, file = path.join('log', 'topics.json')) {
  const store = fs.existsSync(file) ? JSON.parse(read(file)) : {topics: []};
  const known = new Set(store.topics.map(t => `${t.at}|${t.text}`));
  const fresh = list.filter(d => d.action === 'topic' && !d.id && !known.has(`${d.at}|${d.text}`))
    .map(d => ({text: d.text, at: d.at, status: 'open'}));
  if (fresh.length) { store.topics.push(...fresh); fs.writeFileSync(file, JSON.stringify(store, null, 2) + '\n'); }
  return fresh.length;
}

/** One line per platform listing the hashtags of hashtags.json (empty when the file is missing). */
function hashtagLines(dir) {
  const f = path.join(dir, 'hashtags.json');
  if (!fs.existsSync(f)) return [];
  return Object.entries(JSON.parse(read(f))).filter(([, l]) => l && l.length).map(([p, l]) => `Hashtags ${p}: ${l.join(' ')}`);
}

/** Lines describing the platform catalogue songs chosen in `visual.platform_audio` (empty when none). */
function platformAudioLines(visual = {}) {
  const pa = visual.platform_audio || {}, out = [];
  if (pa.tiktok) out.push(`TikTok sound: ${pa.tiktok.title} — ${pa.tiktok.artist} (id ${pa.tiktok.id}` +
    `${pa.tiktok.start_ms ? ', from ' + Math.round(pa.tiktok.start_ms / 1000) + ' s' : ''})`);
  if (pa.meta) out.push(`Instagram/Facebook song (add in app): ${pa.meta.title} — ${pa.meta.artist}` +
    `${pa.meta.start ? ', from ' + pa.meta.start : ''}`);
  return out;
}

/** Text of the "finish in app" message for Instagram and Facebook. */
function handoffText(id, caption, meta) {
  return [`Finish in app: ${id} (Instagram @polyrhythmzik + Facebook page Polyrhythm)`, '',
    `1. Post the attached media from the app, with the caption below.`,
    `2. Add the song with the music sticker: ${meta.title} — ${meta.artist}${meta.start ? ', from ' + meta.start : ''}.`,
    `   Check it is the original recording, not a cover. Set the clip's own sound to 0.`,
    `3. Not in the catalogue? Post as is: the clip keeps its library track.`, '','Caption:', caption].join('\n');
}

async function handoff(dir) {
  const id = path.basename(dir), brief = JSON.parse(read(path.join(dir, 'brief.json')));
  const meta = brief.visual && brief.visual.platform_audio && brief.visual.platform_audio.meta;
  if (!meta) throw new Error(`${id}: no visual.platform_audio.meta, nothing to hand off`);
  const credit = fs.existsSync(path.join(dir, 'credit.txt')) ? read(path.join(dir, 'credit.txt')).trim() : '';
  const hf = path.join(dir, 'hashtags.json'), tags = fs.existsSync(hf) ? JSON.parse(read(hf)).instagram : [];
  const lib = JSON.parse(read(path.join(__dirname, '..', 'audio', 'library.json')));
  const note = musicNote(brief, lib.tracks, 'instagram'); // announces the catalogue song the owner adds in the app
  const caption = withHashtags([...splitThread(read(path.join(dir, 'post.md'))), credit, note].filter(Boolean).join('\n\n'), tags);
  const media = ['clip.mp4', 'card.png'].find(f => fs.existsSync(path.join(dir, f)));
  if (!media) throw new Error(`${id}: no clip.mp4 or card.png`);
  const fd = new FormData();
  fd.set('chat_id', OWNER);
  fd.set(media.endsWith('.mp4') ? 'video' : 'photo', new Blob([fs.readFileSync(path.join(dir, media))]), media);
  await call(media.endsWith('.mp4') ? 'sendVideo' : 'sendPhoto', fd);
  await call('sendMessage', {chat_id: OWNER, text: handoffText(id, caption, meta).slice(0, 4096), disable_web_page_preview: true});
  console.log(`handoff sent for ${id} (${media})`);
}

async function send(dir) {
  const id = path.basename(dir), posts = splitThread(read(path.join(dir, 'post.md'))), post = posts[0];
  const lf = path.join(dir, 'link.txt'), link = fs.existsSync(lf) ? read(lf).trim() : '';
  const problems = checkPosts(posts, link || undefined);
  if (problems.length) throw new Error(`${id} not sent: ${problems.join('; ')}`);
  const ids = [];
  const media = ['clip.mp4', 'card.png'].find(f => fs.existsSync(path.join(dir, f)));
  if (media) {
    const fd = new FormData();
    fd.set('chat_id', OWNER);
    fd.set('caption', post.slice(0, 1024));
    fd.set(media.endsWith('.mp4') ? 'video' : 'photo', new Blob([fs.readFileSync(path.join(dir, media))]), media);
    ids.push((await call(media.endsWith('.mp4') ? 'sendVideo' : 'sendPhoto', fd)).message_id);
  } else {
    ids.push((await call('sendMessage', {chat_id: OWNER, text: post})).message_id);
  }
  const brief = JSON.parse(read(path.join(dir, 'brief.json')));
  const alt = fs.existsSync(path.join(dir, 'alt.txt')) ? read(path.join(dir, 'alt.txt')).trim() : '';
  const sources = fs.existsSync(path.join(dir, 'sources.md')) ? read(path.join(dir, 'sources.md')).trim() : '(none)';
  const credit = fs.existsSync(path.join(dir, 'credit.txt')) ? read(path.join(dir, 'credit.txt')).trim() : '';
  const thread = posts.length > 1
    ? ['', `Thread (${posts.length} posts):`, ...posts.map((p, i) => `${i + 1}/${posts.length} (${p.length}) ${p}`)] : [];
  const info = [`${process.env.STUDIO_NAME || 'Polyrhythm'} draft ${id}`,
    `Slot: ${brief.slot || '?'} · ${brief.role || ''} · ${brief.genre || ''} · ${posts.length > 1 ? posts.length + ' posts' : post.length + ' chars'}`,
    brief.topic_source ? `Topic: ${brief.topic_source}` : null,
    brief.visual && brief.visual.audio ? `Music: ${brief.visual.audio}${credit ? ' (credit reply: ' + credit + ')' : ''}` : null,
    ...platformAudioLines(brief.visual),
    ...hashtagLines(dir),
    link ? `Link reply: ${link}` : null,
    alt ? `Alt text: ${alt}` : null, ...thread, '', 'Sources:', sources, '',
    `Reply to this message with: APPROVE · REJECT · EDIT: <new text>${posts.length > 1 ? ' (separate posts with a line ---)' : ''}`,
    `(or APPROVE ${id} · APPROVE ALL for every waiting draft). Not approved at its slot time → it expires.`].filter(x => x !== null).join('\n');
  ids.push((await call('sendMessage', {chat_id: OWNER, text: info.slice(0, 4096), disable_web_page_preview: true})).message_id);
  const sf = path.join(dir, 'status.json');
  const status = fs.existsSync(sf) ? JSON.parse(read(sf)) : {};
  Object.assign(status, {state: 'awaiting_approval', telegram_message_ids: ids, sent_at: new Date().toISOString()});
  fs.writeFileSync(sf, JSON.stringify(status, null, 2) + '\n');
  console.log(`sent ${id} (${media || 'text only'})`);
}

async function fetchDecisions() {
  const updates = await call('getUpdates', {allowed_updates: ['message'], timeout: 0});
  const map = replyMapFromQueue();
  return updates.map(u => u.message).filter(m => m && String(m.from && m.from.id) === String(OWNER))
    .flatMap(m => parseDecisions(m, map));
}

async function decisions() {
  const list = await fetchDecisions();
  syncTopics(list); // every run saves new backlog ideas so none is lost
  console.log(JSON.stringify(list, null, 2));
}

/** Print each new decision as one JSON line, polling every `sec` seconds (for a monitor process). */
async function watch(sec = 45) {
  const seen = new Set();
  for (;;) {
    try {
      for (const d of await fetchDecisions()) {
        const k = `${d.id}|${d.action}|${d.at}`;
        if (!seen.has(k)) { seen.add(k); console.log(JSON.stringify(d)); }
      }
    } catch (e) { console.log(JSON.stringify({error: e.message.replace(TOKEN, '***')})); }
    await new Promise(r => setTimeout(r, sec * 1000));
  }
}

if (require.main === module) {
  const [cmd, arg] = process.argv.slice(2);
  if (!TOKEN || !OWNER) { console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_OWNER_ID must be set'); process.exit(1); }
  const run = {send: () => send(path.resolve(arg)), propose: () => propose(path.resolve(arg)),
    slate: () => slate(path.resolve(arg)), handoff: () => handoff(path.resolve(arg)), approvals, decisions,
    watch: () => watch(+arg || 45),
    notify: () => call('sendMessage', {chat_id: OWNER, text: arg}).then(() => console.log('notified'))}[cmd];
  if (!run) { console.error('usage: send <dir> | propose <dir> | handoff <dir> | decisions | notify <text>'); process.exit(1); }
  run().catch(e => { console.error(e.message.replace(TOKEN, '***')); process.exit(1); });
}

module.exports = {parseDecision, parseDecisions, proposalText, resolveSlate, resolveApprovals, syncTopics,
  platformAudioLines, handoffText, hashtagLines};
