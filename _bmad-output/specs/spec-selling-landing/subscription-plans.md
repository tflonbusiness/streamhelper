# Subscription plans — landing presentation

Marketing tiers shown on the landing page. Activation is via Telegram — no prices or checkout on landing. Plan IDs align with future `accounts.subscription_plan` values where noted.

## Tiers (3 cards)

| Tier | Display name | `subscription_plan` ID | Positioning |
|------|--------------|------------------------|-------------|
| 1 | Free | `free` | Try the dashboard and core workflow at no cost |
| 2 | Pro | `pro` | Solo streamers — full module access and OBS widgets |
| 3 | Studio | `studio` | Production teams — multiple moderators and priority support |

## Per-tier copy (landing cards)

### Free

| Element | Copy |
|---------|------|
| Badge | Free |
| Tagline | Get started at no cost |
| Features | Team dashboard · Module catalog · Kick channel stats |
| CTA note | Included when you sign in |

### Pro

| Element | Copy |
|---------|------|
| Badge | Pro |
| Tagline | Full engagement toolkit for solo streamers |
| Features | All modules (Bonus Buy, Prize Spin, Chat Roll) · OBS browser-source widgets · Extended session limits |
| CTA note | Contact us to activate |

### Studio

| Element | Copy |
|---------|------|
| Badge | Studio |
| Tagline | For teams running daily streams |
| Features | Everything in Pro · Multiple moderator seats · Priority Telegram support · Highest session limits |
| CTA note | Contact us to activate |

## Section framing

| Element | Copy |
|---------|------|
| H2 | Plans for every stream size |
| Lead | Start free, then upgrade when you need more modules, overlays, or team seats. All paid plans are activated via Telegram — no checkout on this page. |
| Shared footnote | Prices are quoted individually. Message us to pick the right plan for your channel. |

## Display rules

- Render as **3 cards** in a row (≥768px) or stacked (mobile).
- **Free** card may use muted border; **Pro** card is visually emphasized (amber border or "Popular" chip — optional).
- Do **not** show dollar amounts, monthly rates, or fake discounts.
- Paid tiers link to `#contact` (Telegram), not to `../app/`.
- Claims must stay consistent with `app/src/lib/subscription-plan.ts` free-tier features where they overlap.
