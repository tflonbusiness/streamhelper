# Games Catalog — MVP Library

Eight games for MVP. Each round: **one winner**, **one streamer bonus**. Commands are case-insensitive unless noted. Bot does not reply to individual participants during play.

**Build priority (recommended):** First Reaction → Growing Jackpot → Wheel of Fortune → Marathon → Red vs Black → Tower → Safe Crack → Limit 50.

---

## GAME-1: Wheel of Fortune

| Field | Value |
|-------|-------|
| ID | `wheel` |
| Command | `!1` … `!N` (sector number; N = sector count) |
| Winner rule | Random one among viewers who picked the winning sector |
| Duration | ~2 min |

**Flow:** Streamer launches round → overlay shows wheel and sector labels → viewers pick sector → wheel spins on overlay → winning sector revealed → one random winner from correct picks → CAP-4 confirmation.

**Streamer settings:** Sector count (e.g. 6–12); display prize label (informational).

---

## GAME-2: First Reaction

| Field | Value |
|-------|-------|
| ID | `first-reaction` |
| Command | `!` + word shown on overlay (e.g. `!go`, `!джекпот`) |
| Winner rule | First valid matching command after prompt |
| Duration | ~10 sec per round |

**Flow:** Overlay shows icon/word → viewers type command → first correct wins → optional multi-round series.

**Streamer settings:**
- Mode: Easy (fixed `!go`) / Hard (random casino word) / Mix
- Word theme: casino / general / custom list
- Trap words: on/off (typing trap command disqualifies from next round)
- Cooldown between rounds: 15 / 30 / 60 sec
- Series length: 1 / 3 / 5 rounds

---

## GAME-3: Growing Jackpot

| Field | Value |
|-------|-------|
| ID | `growing-jackpot` |
| Command | `!join` |
| Winner rule | Random one from join pool at timer end |
| Duration | ~5 min (configurable) |

**Flow:** Streamer starts → overlay shows participant count and growing prize display → each unique `!join` increments counters → timer ends → one random winner.

**Rules:** One `!join` per user per round; repeat joins ignored.

**Streamer settings:** Timer length; prize growth step; optional prize cap (display).

---

## GAME-4: Red vs Black

| Field | Value |
|-------|-------|
| ID | `red-vs-black` |
| Command | `!red` or `!black` |
| Winner rule | Random one from winning side's pool; minority side gets weight multiplier |
| Duration | 30 / 60 / 90 sec |

**Flow:** Overlay shows blind vote UI (counts hidden) → viewers pick side once → timer ends → counts revealed with animation → winner selected from majority side's pool; minority picks weighted (underdog bonus).

**Rules:** One pick per user; cannot change side. Tie (50/50): random winner from all participants.

**Streamer settings:** Underdog multiplier ×2 / ×3 / ×5; timer; reveal animation on/off.

---

## GAME-5: Tower

| Field | Value |
|-------|-------|
| ID | `tower` |
| Command | `!join` |
| Winner rule | Last remaining participant after elimination floors |
| Duration | ~1–3 min |

**Flow:** All joiners on tower graphic → each floor eliminates ~30% at random → names fall off overlay → one survivor wins.

**Streamer settings:** Floor count (5 / 10 / 15); elimination % per floor (20 / 30 / 50); optional participant cap.

---

## GAME-6: Safe Crack

| Field | Value |
|-------|-------|
| ID | `safe-crack` |
| Command | `!` + digits (e.g. `!7391`) |
| Winner rule | Exact code match; if none match, no winner |
| Duration | 30 / 60 / 90 sec |

**Flow:** Overlay shows `_ _ _ _` slots → viewers submit one guess → timer ends → code revealed → exact match wins or round void.

**Rules:** One guess per user per round.

**Streamer settings:** Code length 2 / 3 / 4 / 5 digits.

---

## GAME-7: Limit 50

| Field | Value |
|-------|-------|
| ID | `limit-50` |
| Command | `!join` |
| Winner rule | Random one from capped pool after timer |
| Duration | After cap filled + timer |

**Flow:** Overlay `0/N slots` → first N `!join` accepted → `CLOSED` → prize grows on timer → one random winner.

**Streamer settings:** Cap 25 / 50 / 100; timer; prize growth display.

---

## GAME-8: Marathon

| Field | Value |
|-------|-------|
| ID | `marathon` |
| Command | `!go` (configurable) on flash windows only |
| Winner rule | Random one from viewers who reached streak target |
| Duration | Full stream segment (many flashes over 20–60 min) |

**Flow:** Streamer starts Marathon → random flash windows (e.g. 5 sec) show `⚡ CATCH! !go` on overlay → catch increments streak → miss resets streak to 0 → late joiners can still reach target → at end or streamer stop, one random winner from qualified pool.

**Rules:** One command per flash per user. Streak = consecutive catches without miss. API: `chat.message.sent` only.

**Streamer settings:** Streak target 3 / 5 / 7; flash duration 3 / 5 / 10 sec; command word; fixed vs growing prize display.

**Overlay between flashes:** `Marathon | In finale pool: N | Streak needed: X` (aggregate counts only; no per-user bot messages).

---

## Deferred: Spin Prediction (not MVP)

| Field | Value |
|-------|-------|
| ID | `spin-prediction` |
| Status | **Deferred** — pending open question |
| Command | `!bonus` / `!dead` / similar before streamer slot spin |
| Winner rule | Random one from viewers who matched streamer-confirmed outcome |

Streamer taps outcome in dashboard after spin. Not built until workflow validated with pilot streamers.

---

## Rejected (do not implement)

Auction, bingo, hot-cold, trivia, quest room, crash, heist, card games, hybrids, channel points entry, KICK/sub webhook games, symbol-pick duplicates of numeric choice, unofficial API presence tracking.
