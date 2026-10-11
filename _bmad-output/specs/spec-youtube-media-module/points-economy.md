# Channel points and burned points

## Viewer order flow

1. Viewer redeems a mapped **Kick channel reward**; Kick debits points on the platform.
2. **`channel.reward.redemption.updated`** webhook creates or updates the module row per `kick-redemption-webhook.md`.
3. System validates URL and metadata (title, duration) before queue placement.
4. Failed validation → `rejected` queue row; **points still count as burned** (Kick does not auto-refund in MVP).

## Burned points (operator visibility)

**Burned** = sum of `points_charged` on **all viewer orders** (`source = viewer`) in the selected scope, **regardless of queue status** (`queued`, `playing`, `played`, `skipped`, `rejected`, `failed`, etc.).

| Metric | Definition |
|--------|------------|
| **Today burned (UTC)** | Sum of `points_charged` for every viewer order row created since UTC midnight today (`scope: utc_day` in API). No module sessions — one persistent account workspace. |
| **Ledger** | Every viewer row: nick, title, points, **status** (status is informational; it does not exclude the row from burned total) |

Staff rows (`points_charged = 0`) never contribute to burned totals.

## Pricing

- Point cost comes from the **Kick reward** configuration at redemption time (`points_charged` snapshot on the row).
- Staff queue additions: **0** points.

## Refunds

- No automatic Kick point refunds in MVP when a mod skips or rejects after webhook.
- Operator may handle goodwill refunds manually on Kick outside this module.

## Anti-abuse (MVP light)

- Max queue length per account
- Reject duplicate same URL already in queue
- Enforce `max_viewer_track_duration_seconds` before enqueue (see settings companion)

## Integration

Production viewer orders **only** via signed Kick redemption webhooks (`kick-redemption-webhook.md`).
