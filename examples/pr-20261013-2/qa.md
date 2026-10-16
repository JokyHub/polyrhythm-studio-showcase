# QA — pr-20261013-2

Slot 2 (2026-10-13 13:00 UTC), role "Who played that?", genre funk, single post + clip. QA run 2026-10-12.

- ✓ Facts in post are in sources.md: Withers / "Use Me" / Still Bill / Sussex / 1972; Gadson drums, Dunlap bass, Jackson clavinet (song page personnel); all three credited co-producers (album page, producers on tracks 1–10, "Use Me" is track 4; Sessiondays lists the same five producers).
- ✓ On-screen facts are in sources.md: scene 1 (Still Bill, Sussex Records, 1972); scene 2 "Drums and percussion, recorded at Record Plant, Los Angeles" (song personnel; Record Plant LA from Wikipedia + Sessiondays); scene 3 "Ray Jackson on clavinet and Withers on vocals and acoustic guitar" (song page: "lead vocals, acoustic guitar"); scene 4 five producers incl. Withers and Benorce Blackmon (album page + Sessiondays); scene 5 credits card. Nothing unsourced; no single-release month, length, death or Watts-band claim used (conflicts respected).
- ✓ Spot-check 1 (WebFetch): https://en.wikipedia.org/wiki/Use_Me_(Bill_Withers_song) confirms personnel (Withers lead vocals + acoustic guitar, Jackson clavinet, Dunlap bass guitar, Gadson drums and percussion), Sussex, No. 2 Hot 100 and Soul; Aug/Sept release conflict present, as noted.
- ✓ Spot-check 2 (WebFetch): https://en.wikipedia.org/wiki/Still_Bill confirms Record Plant, Los Angeles; Sussex, 1 May 1972; "Use Me" is side one track 4; producers Withers and Jackson 1–12, Blackmon, Dunlap, Gadson 1–10.
- ✓ Extra check (WebFetch): Sessiondays confirms "Recorded At Record Plant, LA" and the five producers (Jackson listed as "Clarinet", a mistranscription flagged in sources.md; both Wikipedia pages say clavinet).
- ✓ No calendar date in brief (calendar: null) — not applicable.
- ✓ No banned pattern: no hype, no bait, no ranking, no stereotyping; Gadson referred to in the past tense.
- ✓ Opinion labelled: "To my ear, Gadson's trick was how little he played"; listening angle concrete (clavinet and bass answering between vocal lines).
- ✓ `node scripts/post-format.js queue/pr-20261013-2` exits 0 (1 post, 276 chars; no hashtags, no links, no emoji).
- ✓ Thread first-post rule: single post, stands alone.
- ✓ Slot role: credit spotlight on one track, matches "Who played that?"; kicker "Who played that?" on every scene.
- ✓ link.txt: https://music.apple.com/us/album/still-bill/989376986 opens (WebFetch): Apple Music album page for Still Bill by Bill Withers, 1 May 1972, 10 songs, mentions "Use Me"; linked from billwithers.com. Official streaming album page for the right work.
- ✓ Names and diacritics consistent across post, brief, scenes, card, alt text, sources (Bill Withers, James Gadson, Melvin Dunlap, Ray Jackson, Benorce Blackmon, Still Bill, Sussex).
- ✓ Place/period precise: Record Plant, Los Angeles; Sussex, 1972. No "first/inventor" claims, no homogenising.
- ✓ Visual text matches post (contact-sheet.png checked): same personnel, same album/label/year, producer claim consistent.
- ✓ Vertical version: clip-vertical.mp4 exists (1080x1920, 19.5 s, video + audio); contact-sheet-vertical.png shows the same five scenes and text, no overflow or clipping (title wraps cleanly in scene 2).
- ✓ Media is render output only: abstract funk bass-line motif, no covers, photos, logos; footer "Original graphic" and @polyrhythmzik.
- ✓ visual.genre = funk, matches subject (soul/funk, orange #ef6a3a stepped bass-line motif).
- ✓ Clip audio: mixkit-842 "Ahead of Time" (Michael Ramir C.), status "ok" in audio/library.json, licence Mixkit Stock Music Free License with URL, retrieval date and evidence file (audio/evidence/mixkit-stock-music-free-license-2026-10-10.pdf present); attribution null, so no credit.txt needed. Note: library record has "listened": false (not a QA criterion).
- ✓ Nothing implies the background music is the work: on-screen text makes no audio claim; alt text says "The music is not the recording discussed; background music: Ahead of Time, library track."
- ✓ Alt text present and complete (all five scenes, kicker, footer).
- ✓ No repeat in log/posts.csv (no Withers, Gadson, Dunlap, Jackson or Still Bill rows). Genre rotation: previous row jazz (pr-20261013-1) → funk, correct.

RESULT: PASS
