/**
 * Set a draft's status in queue/<id>/status.json and log/posts.csv: node scripts/set-status.js <id> <status> [x_url]
 */
const fs = require('fs'), path = require('path');
const [id, status, url] = process.argv.slice(2);
const root = path.join(__dirname, '..'), sf = path.join(root, 'queue', id, 'status.json');
const st = fs.existsSync(sf) ? JSON.parse(fs.readFileSync(sf, 'utf8').replace(/^﻿/, '')) : {};
Object.assign(st, {state: status, updated_at: new Date().toISOString()}, url ? {x_url: url} : {});
fs.writeFileSync(sf, JSON.stringify(st, null, 2) + '\n');
const log = path.join(root, 'log', 'posts.csv');
const lines = fs.readFileSync(log, 'utf8').split('\n').map(l => {
  if (!l.startsWith(id + ',')) return l;
  // status and x_url are the last two columns; earlier quoted fields may contain commas.
  const m = l.match(/^(.*),([^,]*),([^,]*)$/);
  return `${m[1]},${status},${url || m[3]}`;
});
fs.writeFileSync(log, lines.join('\n'));
console.log(`${id} → ${status}${url ? ' ' + url : ''}`);
