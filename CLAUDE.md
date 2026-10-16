# Polyrhythm Studio — agent contract

Polyrhythm is an English music media on X covering **jazz, funk & soul, Afrobeat & West African music, and Latin &
Caribbean music**. Goal (owner, 2026-10-10): become a trusted source of music knowledge and grow a following.
A multi-agent pipeline proposes topics, drafts sourced posts with original visuals, sends them to the owner on
Telegram, and publishes **only after the owner approves**. WeLoveJazz is the jazz series inside Polyrhythm.
Cadence Afrique (French, TikTok) is a separate project: do not reuse its files or identity.

Read before editorial work: `docs/editorial-guidelines.md` (binding standard: voice, pillars, formats, banned
patterns, checklist; written for jazz, applies to every genre) and `docs/polyrhythm-scope.md` (genres, cultural care,
music licensing).

## Fixed decisions (owner, 2026-10-10)
- Account: X **@polyrhythmzik** via Upload-Post profile **`polyrhythm_studio`** (verify with `list_users` before
  publishing; stop and notify if it is missing or needs reauth). Never post from `jeaneudes` (the owner's personal
  account). Since 2026-10-10 every post with media is also published to Instagram **@polyrhythmzik** and to the
  Facebook page **Polyrhythm** (same profile; one caption holding the whole thread; never a personal Facebook
  profile). X stays the reference: its result decides the post's status. TikTok **@polyrhythmzik** (dedicated account, connected 2026-10-10)
  receives each media post as a vertical video, **published directly** (owner decision, 2026-10-11: drafts sent
  to the TikTok inbox lose their caption). Threads comes later.
- Language: English. **Three posts a day**, every day, each slot with a fixed role:

  | Slot | Time (UTC) | Role (card/clip kicker) | What it is | Default format |
  |---|---|---|---|---|
  | 1 | 08:00 | **On this day** | A verified calendar event for that date (birth, session, release, concert) | Single post + card |
  | 2 | 13:00 | **Who played that?** / **Listen for** | A credit spotlight or a listening note on one track | Single post + clip |
  | 3 | 18:00 | **The story** | Lineage, scene, deep cut, selection or new release, told in depth | Thread of 3–4 posts + card or clip on the first |

  No verified calendar event for the date → slot 1 becomes a short "Start here" entry point instead.
- A day in the studio (posts on day D): D−1 08:00 UTC the proposer sends one **slate** (2 candidates per slot);
  the owner replies with one number per slot, `ALL`, `SKIP n` or `TOPIC n: <own idea>`; D−1 19:00 UTC the
  coordinator drafts the three posts as a batch (no reply → first candidate of each slot); the owner answers each
  draft (`APPROVE`, `EDIT: …`, `REJECT`) or `APPROVE ALL`; on D the publisher posts each approved draft **at its
  slot time**. A draft without approval at its slot time expires and is not published.
- A standalone `TOPIC: …` message at any time is an idea for the backlog (`log/topics.json`), offered in later slates.
- Genre families rotate jazz → funk → afrobeat → latin post by post, continuing from the last row of
  `log/posts.csv`; an owner subject may override the genre and the rotation continues from it. Slot 1 follows the
  calendar event's genre. Pillars (guidelines §3) are chosen to fit the slot's role; vary them through the week.
- Never repeat an artist or work already in `log/posts.csv` (a different work by the same artist is allowed after
  14 days).
- Threads: `post.md` holds the posts separated by a line `---`; each ≤ 280 characters, at most 4 (Upload-Post caps X at 10
  uploads per 24 h; on 2026-10-11 and 10-15 five-post threads lost their last post). The first post
  must stand alone and carry the hook; no "1/5" numbering, no "thread 🧵".
- Listening link: when a verified official page exists (artist, label, Bandcamp, official YouTube or a streaming
  album page), put that single https URL in `link.txt`; it is never in a post. It goes at the end of the Facebook
  caption only: Upload-Post strips links on X without the paid X Links add-on, and Instagram captions do not link.
- Visuals: **only** original graphics rendered by `render/` with the post's `genre` (no album covers, artist photos,
  logos, or AI-generated images). Footer note: "Original graphic". The kicker carries the slot's role.
- Clip audio: only tracks listed in `audio/library.json` (free licensed library tracks or owner productions, each
  with recorded licence evidence). Never excerpts of commercial recordings. No suitable track → silent.
  Real recordings (owner, 2026-10-16) only through platform catalogues, never in our files: TikTok sound by id
  when the exact recording is found (`visual.platform_audio.tiktok`); Instagram/Facebook song added by the owner
  in the app (`visual.platform_audio.meta`, sent with `telegram.js handoff`). Otherwise the library track stays.
  Music note (owner, 2026-10-16) in TikTok/Instagram/Facebook captions: what is heard (library track and its
  author, or the platform sound) and the original recording to look up (`brief.original`). Never a "no copyright
  intended" disclaimer: our audio is licensed, and such a line suggests otherwise.
- Human approval is mandatory: nothing is published without an APPROVE, EDIT or APPROVE ALL from the owner.
- Learning loop: every Monday the analyst writes `log/insights.md` from X results; the scout and coordinator read
  it and follow its recommendations when choosing topics and formats.
- Upload-Post counts every post and every reply as an upload (about 8–9 a day). If an upload is refused for quota,
  set `failed` with the reason and notify the owner; never retry another way.

## Files
- `queue/day-YYYYMMDD/proposal.json`: the day's slate and the owner's reply ids.
- `queue/<id>/` (id = `pr-YYYYMMDD-<slot>`): `brief.json`, `sources.md`, `post.md`, `link.txt`, `alt.txt`,
  `credit.txt` (music credit, when the licence requires one), `card.png` | `clip.mp4` + `contact-sheet.png`,
  `qa.md`, `status.json`.
- `log/posts.csv`: `id,date,genre,pillar,format,media,artist,work,audio,status,x_url`. Statuses:
  awaiting_approval, scheduled, published, rejected, expired, failed, reserve.
- `queue/reserve/<name>/`: finished packages (QA passed) that were not used on their day. A `reserve` row does not
  count as "already used": the scout may offer a reserve package again as a candidate (say "ready-made" in its
  angle), and the coordinator then moves it back to `queue/<new id>/`, updates its slot, re-runs QA and sends it.
- `log/topics.json`: owner ideas (`open` / `used`). `log/insights.md`: weekly analysis.
- `render/render.js queue/<id> [--stills] [--vertical]`: renders `brief.json.visual` (schemas in the designer
  agents). `--vertical` renders the same brief at 1080x1920 as a video, `clip-vertical.mp4` (a card is animated
  over a library track of its genre), used for TikTok only; every draft has both versions. Its text comes from `visual.tiktok` when present: French
  on-screen text, 7–10 s (owner, 2026-10-16: the TikTok audience is mostly French-speaking).
- `render/render.js queue/<id> --vertical --en` → `clip-vertical-en.mp4` (English vertical, YouTube Shorts);
  `--carousel` → `carousel-2.png`… from `visual.carousel` (Instagram/Facebook carousel for a thread).
- Optional platforms (2026-10-16): YouTube Shorts, Threads, Bluesky — published only when connected in
  Upload-Post **and** the handle is approved here (publisher step 4f). Approved handles (owner, 2026-10-16: the owner's own accounts, by explicit choice):
  the owner's Threads and Bluesky accounts. YouTube @polyrhythmzik (dedicated channel, connected 2026-10-16).
- `prompts/reply-kit.md` (daily 09:30 UTC): Telegram list of news, official handles and sourced reply ideas for
  the owner to reply by hand on X; it never posts. `log/reply-kit.md`, `log/playlist.md` (weekly, analyst).
- `docs/profile.md`: bios, pinned post and playlist, applied by the owner.
- `audio/library.json` + `audio/tracks/`: vetted music; see `audio/README.md`.
- `scripts/post-format.js queue/<id>`: checks post lengths, thread size, link.
- `scripts/telegram.js send|propose|slate|approvals|decisions|handoff|notify`: review channel. Secrets come from env vars
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID`. Never print, log or commit them.
- `scripts/set-status.js <id> <status> [x_url]`: updates status.json and the log row.

## Rules
- Every factual claim in post text or on-screen text has a line in `sources.md` (URL + retrieval date). Opinion is
  labelled ("To my ear…"). No hashtags in `post.md` (owner, 2026-10-16: they live in
  `hashtags.json`, one list per platform — X 0–2, Instagram 3–5, TikTok 3–5, Facebook 0–2 — and the publisher
  appends them), no links in posts, at most one emoji (prefer none), no engagement bait.
- Accuracy beats volume: a draft that fails QA twice is dropped (status `failed`), never patched to fill a slot.
- Write files with UTF-8 tools only. Commit and push all queue/log changes at the end of each run with a clear
  message; pull with rebase first; never force-push.
- If anything is uncertain or a step fails, stop that post, set status `failed` with the reason, and `notify` the
  owner; continue with the day's other posts.
- `npm test` must pass before committing code changes.
