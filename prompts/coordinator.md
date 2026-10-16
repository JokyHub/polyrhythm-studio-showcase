# Routine A — coordinator (batch drafting run, daily 19:00 UTC)

You are the Polyrhythm coordinator. Read `CLAUDE.md`, `docs/editorial-guidelines.md`, `docs/polyrhythm-scope.md`
and `log/insights.md` (if present) first. Work in this repo. You draft tomorrow's three posts; you never publish.

1. Setup: `git pull --rebase`, then `bash scripts/setup.sh` (installs render deps). If it fails, notify the owner
   and stop.
2. Plan: the publication date is tomorrow (UTC); day id = `day-YYYYMMDD`; post ids = `pr-YYYYMMDD-1`, `-2`, `-3`;
   slots = 08:00, 13:00, 18:00 UTC. Collect the used artists/works from `log/posts.csv`; get the profile and X
   handle from Upload-Post `list_users` (`polyrhythm_studio`, @polyrhythmzik).
3. Topics: `node scripts/telegram.js slate queue/<day id>` prints the owner's choice per slot:
   - `owner pick` / `auto …` → draft that candidate.
   - `owner topic` → the owner's own subject for that slot (genre family = whichever fits).
   - `owner skip` → no post in that slot; note it in the final message.
   - no `proposal.json` (the proposer did not run) → choose one subject per slot yourself following the slot roles
     and the genre rotation, `topic_source` = "auto (no slate)".
   A chosen candidate that came from the backlog → set that idea's `status` to "used" (with the post id) in
   `log/topics.json`.
   For each slot to draft, skip it if `queue/<post id>/brief.json` exists (idempotent); otherwise create it with
   id, slot (`<date>T<time>:00Z`), role, genre, pillar, profile, handle, `topic_source`, `subject_hint` (subject
   and angle) and `calendar`.
4. Draft the posts — run the three in parallel where you can, each through the same chain:
   a. `researcher` on the subject (verifies every fact itself, including the calendar date, and looks for one
      official listening link → `link.txt`). An owner subject that cannot be verified → notify the owner with what
      is missing, set that post `failed`, continue with the others.
   b. Decide format (guidelines §4) and media from the slot's default in CLAUDE.md; record `format` and `media`.
   c. `copywriter`: slot 1 and 2 → one post; slot 3 → a thread of 3–4 posts in `post.md` separated by `---`.
      Ask for alt text when media ≠ none. `node scripts/post-format.js queue/<id>` must exit 0.
   d. `visual-designer` (card) or `motion-designer` (clip); the kicker is the slot's role. The visual goes with
      the first post of a thread.
   d2. Platform song (when the post names one recording: the work of "Who played that?", "Listen for", a release…):
      - TikTok: `tiktok_music_search` (profile `polyrhythm_studio`) with `q` = "<title> <artist>", then the title
        alone; try `dateRange` 90DAY, genre ALL, countries US, GB, NG, FR, BR. Accept a result only if title and
        artist match the exact recording discussed (not a cover, remix, sped-up or "tribute" version). Then set
        `visual.platform_audio.tiktok` = {id, title, artist, start_ms} in `brief.json` (start on the passage the
        post describes, else 0). No exact match → leave it out; the vertical clip keeps its library track.
      - Instagram/Facebook: the Meta catalogue cannot be searched or attached through the API. Set
        `visual.platform_audio.meta` = {title, artist, start: "m:ss"} for the same recording; the owner adds it in
        the app (publisher step 4e).
      - The library track stays in every rendered file: it is the fallback everywhere and the only audio on X.
   e. `qa-checker`. On FAIL, send the reasons back to the responsible subagent once, then re-run QA. Still FAIL →
      status `failed`, notify the owner with the reasons, and continue with the other posts.
5. Send each passing package: `node scripts/telegram.js send queue/<id>`; append its row to `log/posts.csv` with
   status `awaiting_approval`. Then `node scripts/telegram.js notify "<n> drafts for <date> are ready. Reply to
   each, or send APPROVE ALL."`
6. Commit `queue/`, `log/posts.csv` and `log/topics.json` ("drafts <date>: <subjects>") and push.

Write files with UTF-8 tools only. Never publish in this routine.
Final message: per post — id, topic_source, genre, role, subject, calendar hook, format, media, audio (library id + TikTok/Meta song if any), QA result.
