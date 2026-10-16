# QA — pr-20261013-3

Reviewer: Polyrhythm QA editor (independent of the drafter). Date: 2026-10-12.
Slot 3 "The story", 2026-10-13 18:00 UTC. Genre afrobeat. Pillar: Scenes, lineage, and context. 5-post thread, card.png on post 1, clip-vertical.mp4 for TikTok.

## Checklist

- ✓ **Format script:** `node scripts/post-format.js queue/pr-20261013-3` exits 0. Post lengths are 264/276/254/227/239. That is 5 posts, with no hashtags, links or numbering. No emoji.
- ✓ **Slot role:** "The story" is a lineage and scene thread of 3–5 posts with the card on the first post. The card kicker is "THE STORY".
- ✓ **First post stands alone:** it names the band, the place, the year, the label and the double-session story. It works as a hook without the rest of the thread.
- ✓ **Rotation / repetition:** slot 2 (pr-20261013-2) is funk, so afrobeat comes next in rotation. Neither the band nor the work appears in `log/posts.csv`.
- ✓ **Facts, post 1:** sources.md item 4 covers Lagos, Albarika Store and the better studios. Items 4 and 6 (worldmusic.co.uk, Rush Hour) cover the 1973 date and the rejection for background noise. Minor note: "Dahomey (now Benin)" is backed only by the subject line and the diacritics note, with no URL. It is common historical knowledge and The Quietus refers to Dahomey, so this is not blocking. Next time, add a URL.
- ✓ **Facts, post 2:** item 1 covers the late 1960s date, which is the recommended hedge given the 1964/1966/1968 conflict. Item 5 covers Daho Jazz and all four songs. The influences are attributed to "Critics", per item 3 (Austin Chronicle, The Quietus).
- ✓ **Facts, post 3:** "Hundreds of recordings" follows the recommended unattributed wording (item 7). The Soundway 2004 and Analog Africa 2008 reissues are item 8. First playing outside Africa in 2009 is item 9. Cotonou Club on Strut in 2011 is item 10.
- ✓ **Facts, post 4:** the 2011 reissue with two tracks from the rejected session released for the first time is item 6. December 2012, aged 67, is item 11. Madjafalao on Because Music in 2016 is item 12.
- ✓ **Facts, post 5:** the opener "Ou C'est Lui Ou C'est Moi" is item 6 (Rush Hour tracklist). The listening note is labelled "To my ear". "Decades later" (1973 to 2011) is accurate.
- ✓ **On-screen text:** the title, the subtitle "The 1st Album · cut twice in Lagos, 1973" and the credits "Bandleader — Mélomé Clément" and "Songs — Vincent Ahéhéhinnou" are all in sources.md and match the thread. "Bandleader" avoids the disputed instrument.
- ✓ **Spot-check 1 (WebFetch, worldmusic.co.uk/orchestre_poly-rythmo_the_1st_album_1973):** the page confirms Adissa Seidou's Albarika Store label, the "superior recording facilities in Lagos", "recorded twice", the first session rejected for "too much background noise", Ahehehinnou poached from Daho Jazz, all four tracks his, two tracks from each session, and release on 13 June 2011. The page gives "after five years of existence" rather than the year 1973. Rush Hour, fetched as a cross-check, gives 1973, the two rejected-session tracks "released for the very first time", and "Ou C'est Lui Ou C'est Moi" as track 1.
- ✓ **Spot-check 2 (WebFetch, worldmusic.net obituary):** the page confirms a heart attack on 17 December (post dated 2 Jan 2013), aged sixty-seven, and a career that started in 1968.
- ✓ **Spot-check 3 (WebFetch, Austin Chronicle 2009-12-18):** the page confirms James Brown, Nigerian highlife, Afro-Cuban jazz, Fela and Vodoun, Soundway's Kings of Benin (2004), and Vol. One The Vodoun Effect as "last year's", i.e. 2008. It ties Analog Africa to the two anthologies, and the Vol. 1 link is implicit. Splinters & Candy, also fetched, confirms "didn't play outside of Africa until 2009" and Strut.
- ✓ **Calendar date:** `calendar` is null, so there is no date to check.
- ✓ **Banned patterns:** none found. There is no hype, bait, superlative, stereotyping or "authentic Africa" framing. The vodun rhythms are tied specifically to Dahomey and attributed to critics.
- ✓ **Opinion labelled:** "To my ear" in post 5. The Quietus's Tony Allen comparison is correctly left out.
- ✓ **Cultural precision:** the thread names Cotonou, Dahomey (now Benin) and Lagos, Nigeria, and the period is precise. It makes no "first/inventor" claim. "First time outside Africa" is a sourced fact about the band, not a genre-origin claim. The thread shows several circulations (vodun, highlife, Afro-Cuban jazz, US funk, Afrobeat) instead of a single origin.
- ✓ **Names and diacritics:** Mélomé Clément, Vincent Ahéhéhinnou, Orchestre Poly-Rythmo de Cotonou and Albarika Store are consistent across post.md, brief.json, card, vertical clip and alt.txt. The brief title uses a non-breaking hyphen (U+2011), which renders the same as a hyphen.
- ✓ **link.txt:** https://orchestrepoly-rythmo.bandcamp.com/album/cotonou-club. WebFetch opened the band's own Bandcamp ("Contact Orchestre Poly-Rythmo", linked to Strut). It shows Cotonou Club with 11 tracks, including the Kidjo, Diawara and Franz Ferdinand features. This is a different work from The 1st Album, but post 5 explicitly sends the reader to Cotonou Club, so the link fits. sources.md records that no official page for The 1st Album was found. Bandcamp's "released January 1, 2011" is a placeholder-style date; the post says only "2011", which matches.
- ✓ **Media is render output only:** card.png is 1080x1350 and clip-vertical.mp4 is 1080x1920, 10 s, with an audio stream. Both are original rhythm-grid graphics with the "Original graphic" footer. There are no photos, covers or logos.
- ✓ **visual.genre:** afrobeat (green 12-pulse grid), which matches a Beninese band (Afro-funk/vodun, West African music).
- ✓ **Vertical clip / TikTok:** contact-sheet-vertical.png and a frame extracted at 9.5 s show the same title, subtitle and credits with no overflow. The title wraps on three lines inside the margins.
- ✓ **Clip audio:** mixkit-735 "Percussions 03" (Lily J) has status "ok" in `audio/library.json`. Its record is complete: source URL, Mixkit Stock Music Free License and URL, retrieved 2026-10-10, and the evidence PDF exists in audio/evidence/. Attribution is null, so no credit.txt is needed and its absence is correct. Note: `listened: false`. Its mood says "not Afrobeat proper", which is acceptable as a neutral bed.
- ✓ **Background music not implied as the work:** alt.txt states "library track (not the recording discussed)". No on-screen text refers to the music.
- ✓ **Alt text:** present and accurate for the card and the vertical video.

RESULT: PASS
