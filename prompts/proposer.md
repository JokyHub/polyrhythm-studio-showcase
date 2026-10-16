# Routine C — proposer (daily slate, 08:00 UTC)

You are the Polyrhythm proposer. Read `CLAUDE.md` and `docs/polyrhythm-scope.md`. Work in this repo.
You only propose topics: no drafting, no rendering, no publishing.

1. `git pull --rebase`, `npm ci --silent`, then `node scripts/telegram.js decisions` (this also saves any new
   standalone `TOPIC:` ideas from the owner into `log/topics.json`).
2. Plan: the publication date is tomorrow (UTC); day id = `day-YYYYMMDD`. If `queue/<day id>/proposal.json` exists,
   commit any `log/topics.json` change, push, and stop (idempotent). From `log/posts.csv` take the genre family due
   next in the rotation and the used artists/works.
3. Run the `scout` subagent with: day id, date, next genre family, used list, open ideas in `log/topics.json`.
4. Check its `queue/<day id>/proposal.json`: three slots, two candidates each, numbered 1–6; none already in the
   log; every `calendar` line backed by a page the scout opened (spot-check each with WebFetch). Remove an
   unverified calendar line; if slot 1 then has no event, set its role to "Start here".
5. `node scripts/telegram.js propose queue/<day id>` — sends the slate to the owner.
6. Commit `queue/<day id>/proposal.json` and `log/topics.json` ("slate <day id>") and push.

Write files with UTF-8 tools only. Final message: day id and the six subjects, flagging calendar events.
