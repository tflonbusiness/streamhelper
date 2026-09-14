# CasinoStream — Interactive Chat Games Library

**Source:** Brainstorming session 2026-09-09  
**Product:** CasinoStream — B2B SaaS for Kick casino streamers ($50/mo)  
**Goal:** Maximize chat engagement; games on streamer overlay; viewers interact via chat bot  

---

## Business Model (confirmed)

- Streamers pay subscription (~$50/mo)
- Prizes = casino promo codes/bonuses; **streamer distributes manually** (v1)
- Platform: winner selection, overlay, proof of win (screen + bot tag + optional DM)
- Platform: **Kick only**, **official Kick API only** (no unofficial endpoints)

---

## Library Rules (design constraints)

1. **One winner = one bonus** per round (streamer cannot afford multiple payouts)
2. **One command per user per phase** where applicable (anti-spam)
3. **Bot stays silent** during play; only announce winner at end (+ tag in chat)
4. **Overlay is the show** — primary UX, not chat bot replies
5. **Streamer-configurable** settings per game (difficulty, timers, modes)
6. **No card games** in library
7. **No hybrid games** in MVP
8. **Transparent RNG** with public seed / participant log

---

## Approved Games (MVP Library)

### 1. Wheel of Fortune 🎡
- **Command:** `!1`–`!12` (sector pick)
- **Flow:** Overlay spins wheel; winners among those who guessed the sector; one random winner
- **Settings:** Sector count, prize value

### 2. First Reaction 🏃 *(user idea)*
- **Command:** `!` + word shown on overlay
- **Flow:** Icon/word appears; first correct command wins
- **Settings:** Easy (`!go` fixed) / Hard (random casino word) / Mix; trap words on/off; cooldown; series length

### 3. Growing Jackpot 📈 *(user idea)*
- **Command:** `!join` only (not all chat messages)
- **Flow:** Counter and prize grow with joins; timer ends → one random winner from pool
- **Settings:** Timer, prize cap, growth step; one join per user per round

### 4. Red vs Black ⚔️
- **Command:** `!red` or `!black` (one pick, no change)
- **Flow:** Blind vote (score hidden until timer ends); majority side wins pool; **underdog ×3** weight for minority
- **Settings:** Underdog multiplier (×2/×3/×5); timer; reveal animation

### 5. Tower 🏗️
- **Command:** `!join`
- **Flow:** Elimination rounds on overlay (e.g. 30% out per floor); **one survivor** wins
- **Settings:** Floors, elimination %, participant cap

### 6. Safe Crack 🔐
- **Command:** `!1234` (one guess, digit count set by streamer)
- **Flow:** Overlay shows code slots; exact match = sole winner; no match = reveal code, no prize
- **Settings:** 2/3/4/5 digits; timer

### 7. Limit 50 ⏱️
- **Command:** `!join` (first N only)
- **Flow:** Overlay `47/50… CLOSED`; timer + growing prize; one random winner from capped pool
- **Settings:** Cap (25/50/100); timer; prize growth

### 8. Marathon 🏃 *(streak retention game)*
- **Command:** `!go` on flash windows only
- **Flow:** Random flashes during stream; **streak** of N consecutive catches (default 5); miss resets streak; late joiners can still win; one random winner from qualified pool at end
- **API:** `chat.message.sent` webhook only; no watchtime APIs
- **Settings:** Streak target (3/5/7); flash duration; command word; fixed vs growing prize

---

## Tentative

### Spin Prediction 🎰
- **Command:** `!bonus` / `!dead` / etc. before streamer's slot spin
- **Flow:** Streamer taps outcome in dashboard after spin; random winner from correct guessers
- **Status:** Under review — depends on streamer workflow comfort

---

## Winner Fulfillment Flow

1. Overlay: winner name + game + timestamp
2. Bot: `@winner` tag in chat (one message)
3. Optional: DM with proof token if Kick API allows
4. Dashboard: pending payout reminder for streamer
5. Streamer gives promo code/bonus manually

---

## Rejected Patterns (do not revisit without new constraints)

- Auction / unclear stakes
- Bingo, hot-cold (chat spam)
- Trivia, quest room (weak)
- Crash, heist (too many qualifiers / bonus confusion)
- Card games
- Hybrid combo games (v1)
- Pop-culture reskins of lottery (goblet, golden ticket)
- Symbol pick = disguised number pick (slot arena)
- Channel points redemption entry
- KICK-boom, VIP-only, KICKs leaderboard, sub-bomb (API event games — rejected at wrap-up)
- Unofficial Kick APIs (active-chatters, watchtime proxy)

---

## Suggested Build Priority

1. **First Reaction** — fastest wow, simple
2. **Growing Jackpot** — mass engagement
3. **Wheel of Fortune** — familiar casino visual
4. **Marathon** — retention differentiator for paying streamers
5. Remaining library + overlay polish

---

## Next Steps (BMad)

- `bmad-prd` or `bmad-spec` — per-game specs + Kick integration
- `bmad-architecture` — chat bot, overlay, dashboard, RNG audit log
