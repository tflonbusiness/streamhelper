# Kick channel reward redemption (viewer orders)

Viewer song orders are created **only** from Kick webhooks — no dashboard form and no ad-hoc chat parser in MVP.

## Event

Handle Kick **`channel.reward.redemption.updated`** (or the platform’s current equivalent for completed redemptions) for rewards mapped to this module.

## Account binding

- Each account configures one or more **reward IDs** (Kick channel point rewards) that enqueue a YouTube track.
- Webhook handler resolves `reward_id` → `account_id` + module config; unknown reward IDs are ignored (logged).

## Payload expectations

| Input | Rule |
|-------|------|
| Redeemer | Platform user id + **username** → `requester_nick` |
| Redemption cost | Reward point cost → `points_charged` (immutable for that row) |
| YouTube URL | Parsed from redemption **user input** field (exact field name per Kick API docs at implementation) |
| Idempotency | Store `kick_redemption_id`; duplicate webhook deliveries do not duplicate queue rows |

## Processing pipeline

1. Verify webhook signature (same pattern as other Kick integrations).
2. Normalize and validate **single-video** YouTube URL.
3. Fetch metadata (`title`, `duration_seconds`).
4. Reject if `duration_seconds` > account `max_viewer_track_duration_seconds` (no queue row; redemption already spent on Kick — see burned points).
5. Insert queue item `source = viewer`, `status = queued`, link `kick_redemption_id`.

## Failure after Kick debit

Kick debits points when the viewer redeems. If validation fails (bad URL, too long, embed blocked), the queue row is **`rejected`** with reason; points remain counted in **burned** totals (no automatic Kick refund in MVP).

## Local development

Non-production may inject synthetic webhook payloads; production traffic must use signed Kick webhooks only.
