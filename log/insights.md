# Insights — 2026-10-16 (first report, run by hand)

Period: from the launch of the series, the first @polyrhythmzik post (2026-10-10 09:00 UTC), to 2026-10-16.
The weekly analyst routine was disabled until today, so this is the first report. Numbers from Upload-Post
(`get_analytics`, `get_post_analytics`), read 2026-10-16. Too few posts for per-slot or per-genre averages.

**Owner's own accounts** (their follows and interactions are not audience): two personal X accounts, one TikTok account and one Facebook profile (names withheld). The API does not say who liked or who follows, so each owner account is
counted as at most one like and one repost per post, and organic figures are given as ranges.

## Accounts
| Platform | Followers now | Owner accounts among them | Audience followers | Views (period) | Likes |
|---|---|---|---|---|---|
| X | 10 | 2 | ≤ 8 (followers at launch not recorded: gain since launch unknown) | 37 impressions | 6 |
| TikTok | 3 | 1 (owner) | 2, both gained since launch | 4,564 | 31 (≥ 23 organic) |
| Instagram | 1 | not stated | ≤ 1 | 390 | 2 |
| Facebook page | 1 | 1 (owner) | 0 | 473 | n/a |

From next week the analyst compares followers with this report, so the gain becomes measurable on X too.

## TikTok, per video
Views are almost all strangers (93–100% new viewers, ≥ 97% non-followers), so one owner view changes nothing.
| Post | Views | Likes (organic) | Avg watched | Still watching at 1 s / 3 s | Full watch |
|---|---|---|---|---|---|
| 11/10 Ranglin, My Boy Lollipop (clip) | 872 | 4 (3–4) | 2.0 s | 55% / 12% | 1.0% |
| 11/10 Ayra Starr, Starrgirl (card) | 410 | 9 (8–9) | 1.9 s | 52% / 12% | 3.2% |
| 13/10 Ray Brown (card) | 918 | 4 (3–4) | 1.6 s | 47% / 9% | 1.4% |
| 13/10 Use Me players (clip) | 902 | 3 (2–3) | 5.4 s | 47% / 16% | 1.2% |
| 13/10 Poly-Rythmo (card) | 258 | 2 (1–2) | 1.5 s | 44% / 7% | 1.1% |
| 14/10 Joe Harriott, Free Form (card) | 256 | 1 (0–1) | 1.9 s | 49% / 8% | 0.8% |
| 15/10 Les Fleur (clip) | 243 | 3 (2–3) | 1.7 s | 51% / 10% | 1.2% |
| 16/10 Art Blakey (card, same day) | 87 | 0 | 1.5 s | 48% / 11% | 1.2% |
(The Billy Higgins video of 11/10 has no stored TikTok id: no per-post numbers.)

- Reach is real: 98–100% of views come from the For You feed, to people who do not follow the account.
- Retention is the problem: about half the viewers leave within 1 s, nine in ten within 3 s. Cause found in the
  renderer: the first scene faded in over 0.6 s, so frame 0 was an empty dark screen. Fixed today, with a hook
  rule for scene 1.
- Organic likes are about 0.3–2% of views. Ayra Starr is the clear outlier (8–9 likes on 410 views, 2 saves,
  1 new follower, 17% of views from search): the only current artist of the week. Guess: a named artist people
  search for.
- Audience: 45–85% of viewers are in France (plus Martinique, Guadeloupe, Réunion, Belgium), while the text is
  in English.

## X, first posts
| Post | Impressions | Likes | Reposts | Replies |
|---|---|---|---|---|
| 13/10 Ray Brown | 12 | 1 | 1 | 0 |
| 13/10 Use Me players | 9 | 0 | 2 | 0 |
| 13/10 Poly-Rythmo (thread) | 24 | 1 | 1 | 1 |
| 14/10 Free Form (thread) | 7 | 1 | 0 | 1 |
| 15/10 Les Fleur | 9 | 2 | 2 | 0 |
| 16/10 Art Blakey | 10 | 2 | 2 | 0 |

- With two owner accounts able to like and repost each post, every like and repost above can be the owner's:
  **organic X engagement this week is somewhere between 0 and 2 interactions per post, most likely near 0.**
- 7–24 impressions per post: X shows the posts to almost nobody, and part of those impressions are the owner's
  accounts. The real X audience has not started yet.

## Recommendations for this week
1. TikTok/Instagram: scene 1 is a sourced hook of ≤ 6 words at size 120, on screen from frame 0 (rules updated
   today). Target next Monday: more than 60% still watching at 1 s and 20% at 3 s.
2. Every post gets hashtags.json with the artist and genre (rule added today); named, searchable subjects
   look like the best lever for TikTok search.
3. At least one post a week on a current or widely known artist (new releases pillar), beside the deep cuts.
4. X: reach will come from activity, not from posting alone. The owner (by hand) replies usefully to larger
   jazz, Afrobeat and Latin accounts 10–15 minutes a day, from @polyrhythmzik.
5. Owner likes and reposts from personal accounts make X numbers unreadable; if kept, the analyst can only give
   ranges. Test closing listening questions (allowed from today) on about half the posts and compare replies.
