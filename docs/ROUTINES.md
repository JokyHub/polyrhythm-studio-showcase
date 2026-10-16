# Cloud routines

Four routines run the studio (three posts a day). All are on Opus 5.5, in the `Default` environment
(`<cloud environment id>`, which holds `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID` and network access), against
the private production repository, with the Upload-Post connector
attached. As of 2026-10-10 all four are **paused**.

| Routine | Cron (UTC) | Follows | What it does |
|---|---|---|---|
| Polyrhythm propose — `<routine id>` | `0 8 * * *` | `prompts/proposer.md` | Sends tomorrow's slate: 3 slots × 2 candidates, calendar events flagged |
| Polyrhythm draft — `<routine id>` | `0 19 * * *` | `prompts/coordinator.md` | Drafts tomorrow's three posts as a batch and sends them for approval |
| Polyrhythm publish — `<routine id>` | `0 7,8,13,18 * * *` | `prompts/publisher.md` | Publishes each approved draft at its slot (thread + link reply); expires the rest |
| Polyrhythm analyst — `<routine id>` | `0 6 * * 1` | `prompts/analyst.md` | Weekly numbers and recommendations in `log/insights.md` |

A day in the studio (posts on day D):
D−1 08:00 slate → owner replies `1,4,5` / `ALL` / `SKIP n` / `TOPIC n: …` →
D−1 19:00 three drafts → owner replies to each (`APPROVE`, `EDIT: …`, `REJECT`) or `APPROVE ALL` →
D 08:00 "On this day", 13:00 "Who played that?", 18:00 "The story" (thread).

Manage them at https://claude.ai/code/routines (enable, pause, edit; routines cannot be deleted from the CLI).

Before enabling:
- Upload-Post plan: every post and every reply counts as an upload — about 8–9 a day, roughly 250 a month.
- Not yet exercised in the cloud: the scout and slate, batch drafting of three posts, thread publishing by chained
  replies, the link reply, the analyst. Do one supervised day (run propose, then draft, then publish by hand with
  `run`, reading `list_runs` → `get_run_log`) before leaving them on their schedule.
- Cloud rendering works (first cloud draft, 2026-10-10, rendered a card on Linux).
