/**
 * Render a post's visuals from its brief: node render/render.js queue/<id> [--stills]
 * Reads queue/<id>/brief.json (`visual` field) and writes, depending on visual.format:
 *   card → card.png              clip → clip.mp4 (H.264, 30 fps) + contact-sheet.png
 * --vertical renders the same brief at 1080x1920 for TikTok, always as a video: clip-vertical.mp4 +
 *   contact-sheet-vertical.png. A card is animated (title, then subtitle and credits) over a library track of its genre.
 * --stills renders only the contact sheet (clip) or the card, for a quick visual check.
 * Needs: npm install (puppeteer-core, ffmpeg-static) and a Chrome/Chromium (CHROME_PATH or auto-detected).
 */
const fs = require('fs'), path = require('path'), {spawn, execFileSync} = require('child_process');
const puppeteer = require('puppeteer-core'), ffmpeg = require('ffmpeg-static');

const dir = path.resolve(process.argv[2] || '');
const stillsOnly = process.argv.includes('--stills');
const brief = JSON.parse(fs.readFileSync(path.join(dir, 'brief.json'), 'utf8').replace(/^﻿/, '')).visual;
if (!brief || brief.format === 'none') { console.log('No visual requested.'); process.exit(0); }
const garbled = require('./text-check').findMojibake(brief);
if (garbled.length) { console.error('Garbled text (encoding error) in brief: ' + garbled.join(' | ')); process.exit(1); }
// --en (with --vertical): the English vertical for YouTube Shorts, from the main brief → clip-vertical-en.mp4.
const vertical = process.argv.includes('--vertical'), en = vertical && process.argv.includes('--en');
const sfx = vertical ? (en ? '-vertical-en' : '-vertical') : '';
if (vertical) brief.size = '1080x1920';
// TikTok version of the brief (owner, 2026-10-16): `visual.tiktok` = {card?, scenes?} in French, 7–10 s. Its card
// fields replace the card's; its scenes make the vertical video a short clip, whatever the post's format.
if (vertical && !en && brief.tiktok) {
  if (brief.tiktok.card) brief.card = {...brief.card, ...brief.tiktok.card};
  if (brief.tiktok.scenes && brief.tiktok.scenes.length) { brief.format = 'clip'; brief.scenes = brief.tiktok.scenes; }
}
if (vertical && brief.format === 'card') {
  brief.animate = true;
  if (!brief.audio) {
    const lib = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audio', 'library.json'), 'utf8').replace(/^﻿/, ''));
    const t = lib.tracks.find(t => t.status !== 'blocked' && [].concat(t.genres || t.genre || []).includes(brief.genre || 'jazz'));
    if (t) brief.audio = t.id;
  }
}
const [W, H] = (brief.size || '1080x1350').split('x').map(Number);
const FPS = 30;

function chromePath() {
  const saved = path.join(__dirname, '..', '.chrome-path');
  const c = [process.env.CHROME_PATH, fs.existsSync(saved) && fs.readFileSync(saved, 'utf8').trim(), 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  for (const p of c) if (fs.existsSync(p)) return p;
  try { // chrome-headless-shell installed by scripts/setup.sh
    const out = execFileSync('npx', ['--yes', '@puppeteer/browsers', 'list'], {encoding: 'utf8', shell: true});
    const m = out.match(/(\/\S+chrome-headless-shell)\s*$/m) || out.match(/(\S+chrome(?:-headless-shell)?(?:\.exe)?)\s*$/m);
    if (m) return m[1];
  } catch {}
  throw new Error('No Chrome found: set CHROME_PATH or run scripts/setup.sh');
}

/**
 * Lay a loop from audio/library.json under the clip: looped to length, faded in/out, normalised to −16 LUFS.
 * Only tracks listed in the library (own productions with recorded provenance) are accepted.
 */
function muxAudio(video, trackId, seconds) {
  const lib = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audio', 'library.json'), 'utf8').replace(/^﻿/, ''));
  const track = lib.tracks.find(t => t.id === trackId);
  if (!track) throw new Error(`Audio "${trackId}" is not in audio/library.json`);
  const missing = ['file', 'source_url', 'licence', 'licence_url', 'retrieved', 'evidence'].filter(k => !track[k]);
  if (missing.length) throw new Error(`Audio "${trackId}" lacks licence record: ${missing.join(', ')}`);
  if (track.status === 'blocked') throw new Error(`Audio "${trackId}" is blocked: ${track.blocked_reason || ''}`);
  const src = path.join(__dirname, '..', 'audio', track.file), tmp = video.replace(/\.mp4$/, '.tmp.mp4');
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', video, '-stream_loop', '-1', '-i', src,
    '-filter_complex', `[1:a]atrim=0:${seconds},afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, seconds - 1.5)}:d=1.5,` +
      'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]',
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(seconds),
    '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, video);
}

(async () => {
  const browser = await puppeteer.launch({executablePath: chromePath(), headless: true,
    args: ['--force-color-profile=srgb', '--hide-scrollbars', '--no-sandbox', '--allow-file-access-from-files']});
  // --carousel: Instagram carousel for a thread, one 1080x1350 card per `visual.carousel` slide → carousel-<n>.png.
  // Slide 1 is the post's own card (card.png); slides only carry kicker/title/sub; credits show on the last one.
  if (process.argv.includes('--carousel')) {
    const slides = brief.carousel || [];
    if (!slides.length) throw new Error('visual.carousel is empty');
    for (const [i, s] of slides.entries()) {
      const b = {...brief, format: 'card', size: '1080x1350', animate: false,
        card: {...brief.card, ...s, credits: i === slides.length - 1 ? brief.card.credits : []}};
      const p = await browser.newPage(), errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.setViewport({width: 1080, height: 1350});
      await p.evaluateOnNewDocument(b => { window.BRIEF = b; }, b);
      await p.goto('file:///' + path.join(__dirname, 'template.html').split(path.sep).join('/'), {waitUntil: 'networkidle0'});
      await p.evaluate(() => document.fonts.ready);
      if (errs.length) throw new Error(errs.join('\n'));
      await p.evaluate(() => new Promise(r => { R.seek(R.duration - .01); requestAnimationFrame(() => requestAnimationFrame(r)); }));
      fs.writeFileSync(path.join(dir, `carousel-${i + 2}.png`), await p.screenshot({type: 'png', clip: {x: 0, y: 0, width: 1080, height: 1350}}));
      await p.close();
    }
    console.log(`carousel-2..${slides.length + 1}.png written`);
    return browser.close();
  }
  const page = await browser.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport({width: W, height: H});
  await page.evaluateOnNewDocument(b => { window.BRIEF = b; }, brief);
  await page.goto('file:///' + path.join(__dirname, 'template.html').split(path.sep).join('/'), {waitUntil: 'networkidle0'});
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(errors.join('\n'));
  const info = await page.evaluate(() => ({d: R.duration, stills: R.stills}));
  const shot = async t => {
    await page.evaluate(t => new Promise(r => { R.seek(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
    return page.screenshot({type: 'png', clip: {x: 0, y: 0, width: W, height: H}});
  };

  if (brief.format === 'card' && !vertical) {
    fs.writeFileSync(path.join(dir, 'card' + sfx + '.png'), await shot(info.d - .01));
    console.log('card' + sfx + '.png written');
  } else {
    // Contact sheet: one still per scene, tiled horizontally at 1/3 scale.
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'wlj-'));
    for (const [i, t] of info.stills.entries()) fs.writeFileSync(path.join(tmp, `s${i}.png`), await shot(t));
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', path.join(tmp, 's%d.png'), '-vf',
      `scale=${Math.round(W / 3)}:-1,tile=${info.stills.length}x1:padding=8:color=0x333333`, '-frames:v', '1',
      path.join(dir, 'contact-sheet' + sfx + '.png')]);
    console.log('contact-sheet' + sfx + '.png written');
    if (!stillsOnly) {
      const out = path.join(dir, 'clip' + sfx + '.mp4');
      const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', out]);
      const done = new Promise((ok, ko) => ff.on('close', c => c ? ko(new Error('ffmpeg exit ' + c)) : ok()));
      const n = Math.round(info.d * FPS);
      for (let f = 0; f < n; f++) {
        const buf = await shot(f / FPS);
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end(); await done;
      if (brief.audio) muxAudio(out, brief.audio, info.d);
      console.log(`clip${sfx}.mp4 written (${info.d.toFixed(1)} s, ${n} frames, ${brief.audio ? 'audio: ' + brief.audio : 'silent'})`);
    }
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
