# Audio library

Music for clips. Two kinds of track are allowed (rules: `docs/polyrhythm-scope.md` § Music licensing):
free licensed library tracks whose licence allows social-media video, and the owner's own productions.

Files go in `tracks/`, licence evidence (PDF or PNG of the track page + licence page, dated) in `evidence/`.
`render/render.js` refuses any track without a complete record or marked `blocked`.

```json
{"id": "pixabay-slow-highlife-guitar",
 "file": "tracks/pixabay-slow-highlife-guitar.mp3",
 "title": "<track title>", "artist": "<uploader / composer>",
 "genres": ["afrobeat"], "mood": "laid-back, guitar-led", "tempo": 98, "length_s": 120,
 "source_url": "https://pixabay.com/music/...",
 "licence": "Pixabay Content License", "licence_url": "https://pixabay.com/service/license-summary/",
 "retrieved": "YYYY-MM-DD", "evidence": "evidence/pixabay-slow-highlife-guitar.pdf",
 "attribution": null,
 "status": "ok"}
```

- `attribution`: exact credit text when the licence requires it (CC BY), else `null`. It is posted as the first reply.
- Own productions: `licence: "Owner production"`, `source_url`/`licence_url`: a short note in `evidence/`, and
  `made_with` describing tools and sample packs (sample-pack licences must allow use in own productions).
- Never commit raw sample-pack files; their licences usually forbid redistribution.
- If a track gets a claim: `"status": "blocked", "blocked_reason": "...", "blocked_on": "YYYY-MM-DD"`.
## Sources in use (2026-10-16)
- **Mixkit** (Mixkit Stock Music Free License, no credit): jazz, funk/soul, some Latin.
- **Incompetech** (Kevin MacLeod, CC BY 4.0): Afrobeat/West African-style percussion and Latin. Kept as the first
  120 s with a 4 s fade (`edited`). Credit required: `attribution` goes to `credit.txt`, posted as an extra reply
  (one more upload), so prefer a no-credit track when two fit equally.
- Pixabay blocks scripted downloads; add its tracks by hand if needed, with the same record and evidence.
- `listened: false` until the owner has listened; a track that sounds wrong for its genre → `status: "blocked"`.

## Real recordings
Never stored here. Real songs reach TikTok, Instagram and Facebook only through the platforms' own catalogues
(`visual.platform_audio` in the brief; see `docs/polyrhythm-scope.md`). Every rendered file keeps a library track.
