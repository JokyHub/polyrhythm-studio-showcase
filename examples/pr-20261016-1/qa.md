# QA — pr-20261016-1

Slot 2026-10-16 08:00 UTC · role "On this day" · jazz · single post + card (TikTok: clip-vertical.mp4).
Reviewed 2026-10-15 by QA editor (not the drafter).

## Checklist
- ✓ Calendar date verified (WebFetch, en.wikipedia.org/wiki/Art_Blakey): "Blakey died at St. Vincent's Hospital and Medical Center in Manhattan, on October 16, 1990, from lung cancer." Second source (EBSCO) listed in sources.md. Present-tense "dies" after the date hook is house style; no anniversary count, as the brief asked.
- ✓ Every fact in the post is in sources.md: death date/place; The African Beat, Blue Note, 1962; Afro-Drum Ensemble; Ilori as singer (personnel: vocals) and percussionist (talking drum); Ilori's penny whistle and Lateef's flute share the opening of "Ife L'ayo" (Blue Note page).
- ✓ Every on-screen fact is in sources.md: title; "Art Blakey and the Afro-Drum Ensemble · Blue Note, 1962"; credits Drums — Art Blakey, Vocals, talking drum — Solomon G. Ilori, Tenor sax, flute — Yusef Lateef (Wikipedia and jazzdisco personnel).
- ✓ WebFetch spot-checks (3): (1) Wikipedia Art Blakey, calendar date confirmed; (2) bluenote.com "Jazz On The Jukebox: Blue Note Singles Of 1962": "Beginning with a folky head shared by Solomon G. Ilori's penny whistle and Lateef's sure-footed flute, 'Ife L'ayo'…", confirmed; (3) Wikipedia The African Beat: Blue Note BLP 4097, recorded January 24, 1962, released November 1962, Ilori "vocals, talking drum, pennywhistle", "Ife L'ayo" credited to Ilori, confirmed. Also checked pan-african-music.com: "Nigerian percussionist Solomon G Ilori", 1962 Blue Note album.
- ✓ No banned pattern (§6): no hype, no bait, no ranking or comparison, no exoticising language. The drafter respected the brief's limits: no "four of seven" claim, no Ilori birthplace or birth year, no length for Blakey's stay in West Africa, and Guy Warren is not mentioned.
- ✓ Opinion labelled: the post has no evaluative claims. Note: "at its centre" is an editorial framing, but the sources back it (Ilori opens the album with "Prayer", leads the opening theme, and is credited as composer on the album page).
- ✓ `node scripts/post-format.js queue/pr-20261016-1` exits 0: 1 post, 271 chars, no hashtags, no links, no emoji.
- ✓ Stands alone / role: a dated calendar event (death) as the hook, then a concrete listening pointer. This fits "On this day". The kicker reads "ON THIS DAY".
- ✓ link.txt: https://music.apple.com/us/album/the-african-beat/724908010 opens (WebFetch): The African Beat, Art Blakey, "℗ 1994 Blue Note Records", 7 songs, ~40 min. This is the official Blue Note release, the right work. The Reborn Recordings reissue on Spotify was correctly rejected.
- ✓ Names and diacritics: Art Blakey, Yusef Lateef, Ife L'ayo, Afro-Drum Ensemble and Blue Note are spelled the same in the post, card, alt text and clip. The post says "Solomon Ilori" and the card says "Solomon G. Ilori". Both refer to the same credited name, so this is acceptable. Optional: use "Solomon G. Ilori" in both places.
- ✓ Place, period and community: Manhattan and 1990 for the death; Blue Note and 1962 for the album. "Nigerian" is supported by Pan African Music. sources.md notes that Wikipedia gives a Gold Coast birth to Nigerian parents, but the weakly cited birthplace was correctly left out. Nothing homogenises the region. "African" appears only in the album's own title. No "first" or "inventor" claim (Blakey's "first time" quote is not used).
- ✓ Visual text matches the post: album, label/year, Blakey, Ilori and Lateef are the same as in the post.
- ✓ Media is render output only: card.png and clip-vertical.mp4/contact-sheet-vertical.png use the house render layout (jazz brass score-bar motif). Footer reads "@polyrhythmzik · Original graphic". No cover, photo or logo.
- ✓ visual.genre = jazz, which matches the subject (Blue Note hard-bop leader's Afro-percussion date, catalogued as jazz).
- ✓ Vertical clip: clip-vertical.mp4 exists. It is 1080x1920, 10 s, with video and audio streams. Contact-sheet stills show the same text as card.png (title, then subtitle and credits) with no overflow or clipping.
- ✓ Clip audio: mixkit-652 "Soul Jazz" (Francisco Alvear) is status "ok" in audio/library.json. Its licence record is complete (source URL, Mixkit Stock Music Free License + URL, retrieved 2026-10-10, evidence PDF present in audio/evidence/). attribution is null, so no credit.txt is needed and none is present. Nothing implies that the library track is The African Beat: the alt text and on-screen text do not mention the music. Note: the library entry is "listened": false. This does not block QA.
- ✓ Alt text present (alt.txt). It describes the card accurately and states that there is no album artwork.
- ✓ Not a repeat: Art Blakey, The African Beat, Ilori and Lateef do not appear in log/posts.csv.
- Note (outside the QA checklist): queue/pr-20261016-1/status.json does not exist yet. The coordinator must create it before sending.

RESULT: PASS
