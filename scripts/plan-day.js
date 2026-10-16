/**
 * Create queue folders for a batch of posts from a plan file: node scripts/plan-day.js <plan.json>
 * plan.json: {"date": "YYYY-MM-DD", "posts": [{"time": "HH:MM", "genre", "pillar", "media", "subject_hint"}]}
 * Ids are pr-YYYYMMDD-NN. Existing folders are left untouched (idempotent).
 */
const fs = require('fs'), path = require('path');
const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^﻿/, ''));
if (!plan.profile || !plan.handle) { console.error('plan.json needs "profile" (Upload-Post profile) and "handle"'); process.exit(1); }
const day = plan.date.replace(/-/g, '');
plan.posts.forEach((p, i) => {
  const id = `pr-${day}-${String(i + 1).padStart(2, '0')}`, dir = path.join(__dirname, '..', 'queue', id);
  if (fs.existsSync(path.join(dir, 'brief.json'))) return console.log(`${id} exists, skipped`);
  fs.mkdirSync(dir, {recursive: true});
  const brief = {id, slot: `${plan.date}T${p.time}:00Z`, genre: p.genre, pillar: p.pillar, media: p.media,
    subject_hint: p.subject_hint || null, profile: plan.profile, handle: plan.handle};
  fs.writeFileSync(path.join(dir, 'brief.json'), JSON.stringify(brief, null, 2) + '\n');
  console.log(`${id} ${brief.slot} ${p.genre} · ${p.pillar} · ${p.media}`);
});
