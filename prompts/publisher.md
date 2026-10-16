# Routine B — publisher (daily at 07:00, 08:00, 13:00 and 18:00 UTC)

You are the Polyrhythm publisher. Read `CLAUDE.md`. Work in this repo. Never publish anything the owner has not
approved on Telegram. Never publish to the personal profile `jeaneudes`.

Posts go out **immediately at their slot time** (no Upload-Post scheduling), so a thread and its link reply can be
chained. The 07:00 run is a pre-check; the 08:00, 13:00 and 18:00 runs publish the post of that slot.

1. `git pull --rebase`, `npm ci --silent`. Run `node scripts/telegram.js approvals` — it prints the effective
   decision for every draft awaiting approval (`approve`, `edit`, `reject` or `none`) and saves new owner ideas to
   `log/topics.json`.
2. For every awaiting draft, whatever its slot:
   - `reject` → `node scripts/set-status.js <id> rejected`.
   - `edit` → replace `post.md` with the owner's text exactly (posts of a thread are separated by `---`); run
     `node scripts/post-format.js queue/<id>` and the `qa-checker` subagent. If the edit contradicts on-screen
     text, run `bash scripts/setup.sh` and re-render through the matching designer subagent. QA fails → notify the
     owner with the reasons and leave it awaiting; QA passes → treat as approved.
   - `approve` (or a passing edit) → mark `status.json` with `"approved": true` (keep state `awaiting_approval`
     until it is published).
3. Due posts: a draft is due when its `brief.json` slot is at or before now (UTC) and it is still awaiting.
   - approved → publish it now (step 4).
   - not approved and its slot is more than 30 minutes past, or this is the run of its slot → `expired`; notify
     "Draft <id> expired, not published".
   The 07:00 run publishes nothing unless a slot is already due. It sends one reminder when today's drafts are
   still unapproved: `notify "Not approved yet for today: <id> (<slot> UTC, <subject>) … Reply APPROVE ALL or answer
   each draft before its slot, or it expires."`. The 13:00 run sends the same reminder for the 18:00 draft.
4. Publish with Upload-Post, `user` = `polyrhythm_studio` (verify with `list_users`), platforms `["x"]`,
   **no `scheduledDate`**, `asyncUpload: false` when the tool accepts it:
   a. First post: text only → `upload_text` (title = first post + `hashtags.json` `x` tags on a new line, after a blank line). With media → stage the file:
      `create_media_upload` (filename, contentType image/png or video/mp4, contentLength from `stat`),
      `curl -sS -X PUT -H "Content-Type: <type>" --data-binary @queue/<id>/<file> "<upload_url>"`,
      `complete_media_upload` → `media_url`; then `upload_photos` (photosPathsOrUrls [media_url], altText = alt.txt)
      or `upload_video` (videoPathOrUrl = media_url), title = first post + the `x` hashtags (same rule). Further thread posts get no hashtags.
      If a `request_id` comes back without a post id, poll `get_status` until success; take the X `post_id` and `url`.
   b. Thread: for each further post in order, `upload_text` with `platformOptions.xReplyToId` = the id of the
      previous post (chain), waiting for each post id before the next.
   0. X budget, before the first upload of a post: count this profile's X uploads in the last 24 h with
      `get_history` (X allows 10). Needed = number of posts + 1 if a credit reply is needed. If needed > what is left,
      do not start: `failed` with "X daily cap: n left, m needed", notify the owner. Never publish half a thread.
   c. `credit.txt` (music attribution): append it to the last post of the chain on a new line when the result
      stays ≤ 280 characters; otherwise one more reply at the end of the chain, text = the file's content.
      `link.txt` is **not** posted on X: Upload-Post strips links from X posts and replies unless the account has
      the paid X Links add-on. The link goes to Facebook only (step e).
   d. `node scripts/set-status.js <id> published <url of the first post>`.
   Any refusal (quota, auth, X error) → do not retry another way: `failed` with the reason, notify the owner. If a
   thread fails midway, say exactly which posts are live.
   e. Instagram and Facebook, only after X succeeded and only when the post has media (`card.png` or `clip.mp4`):
      one more call with the same `media_url`, platforms `["instagram","facebook"]`, still no `scheduledDate`.
      - Caption (`title`) = every post of `post.md` in order, joined by a blank line, then the content of
        `credit.txt` if it exists, then a blank line and the **music note** (`musicNote(brief, tracks, 'instagram')`
        from `scripts/post-format.js`, as printed by `node scripts/post-format.js queue/<id>`), then a blank line and
        the `instagram` hashtags. No link. Facebook gets its own
        `facebook` hashtags instead: set `platformOptions.facebookTitle` (caption with the `facebook` tags).
      - `platformOptions.facebookPageId` = the `facebook_page_id` that `list_users` returns for `polyrhythm_studio`,
        and only if its `facebook_page_name` is `Polyrhythm`. Never publish to a personal Facebook profile: if the
        page id is missing, publish to `["instagram"]` only and tell the owner.
      - When `link.txt` exists: `platformOptions.facebookTitle` = the posts (+ credit) + a blank line + `Listen: <url>`,
        then a blank line and the `facebook` hashtags.
      - **In-app song**: when `brief.json` has `visual.platform_audio.meta`, do not upload to Instagram or Facebook.
        Run `node scripts/telegram.js handoff queue/<id>` (the owner posts from the app with the catalogue song)
        and record `"instagram": "handoff"` in `status.json`. TikTok below still goes out as usual.
      - Card → `upload_photos` (altText = alt.txt, `instagramMediaType: "IMAGE"`); when `carousel-*.png` exist,
        stage each and pass `[card, carousel-2, carousel-3, …]` in order (an Instagram/Facebook carousel). Clip → `upload_video`
        (`instagramMediaType: "REELS"`, `instagramShareToFeed: true`, `facebookMediaType: "VIDEO"`).
      - If Instagram or Facebook is not connected or needs reauth in `list_users`, skip that platform.
      - TikTok **@polyrhythmzik** (same profile): one separate call, platforms `["tiktok"]`, same caption as
        Instagram. Media = `clip-vertical.mp4` (1080x1920; a card is an animated video there), staged with
        its own `create_media_upload` → PUT → `complete_media_upload`. The vertical files go to TikTok only, never
        to X, Instagram or Facebook. If the vertical file is missing, run `bash scripts/setup.sh` and
        `node render/render.js queue/<id> --vertical`; if that fails, skip TikTok for this post and say so. `platformOptions.tiktokPostMode: "DIRECT_POST"` and
        `tiktokPrivacyLevel: "PUBLIC_TO_EVERYONE"`. When `visual.platform_audio.tiktok` exists, add
        `tiktokMusicId` = its `id`, `tiktokMusicStart` = `start_ms`, `tiktokMusicEnd` = start + clip length in ms,
        `tiktokMusicVolume: 100`, `tiktokOriginalSoundVolume: 0` (the real song replaces the library track). If
        `get_status` warns that the music was ignored, the post stays live with its library track: say so in the
        notification and record `tiktok_music: "ignored"` — published directly, with its caption (owner decision,
        2026-10-11: a draft sent to the TikTok inbox loses its caption). Always `upload_video`, `title` = the caption with the TikTok music note (`musicNote(..., 'tiktok')`) and the `tiktok` hashtags
        instead of the Instagram ones. Record
        `tiktok_url` or `tiktok_error` in `status.json`, and always `tiktok_request_id`. TikTok often finishes
        processing after the run: poll `get_status` up to 10 minutes; if there is still no URL, leave
        `tiktok_url` empty. **Every run** first re-checks posts of the last 3 days that have `tiktok_request_id` but
        no `tiktok_url` or `tiktok_error` (`get_status`, else `get_history` by request id) and fills them in.
      - Poll `get_status`; write `instagram_url` / `facebook_url` (or `instagram_error` / `facebook_error`) into
        `status.json`. A failure here never changes the post's `published` status and is never retried another way:
        report it in the run's notification.
4f. Optional platforms, each only when `list_users` shows it connected for `polyrhythm_studio` **and** its handle
    is in the approved list of CLAUDE.md ("Optional platforms"); a connected account not on that list is a personal
    account: skip it and say so in the notification (skip silently when not connected), after X succeeded; record `<platform>_url` or `<platform>_error` in `status.json`; a failure
    never changes the post's status and is never retried another way:
    - **YouTube Shorts**: `clip-vertical-en.mp4` (render it with `--vertical --en` if missing) via `upload_video`,
      platforms `["youtube"]`, `title` = the first sentence of post 1 (≤ 100 chars), `description` = the
      Instagram caption, `youtubePrivacyStatus: "public"`, `youtubeSelfDeclaredMadeForKids: false`.
    - **Threads**: same media and caption as Instagram (posts, music note, `instagram` hashtags limited to 1),
      platforms `["threads"]`.
    - **Bluesky**: post 1 with the card or clip, platforms `["bluesky"]`, then each further post as a reply
      (`platformOptions.replyToId` = the previous Bluesky post URL). No hashtags. Skip any post over 300 chars.
5. Notify the owner once per run with what was published (URL), expired or failed. Commit `queue/`,
   `log/posts.csv`, `log/topics.json`; push.
