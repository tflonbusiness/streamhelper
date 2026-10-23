---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-identify-targets
  - step-03-generate-tests
lastStep: step-03-generate-tests
lastSaved: '2026-10-23'
inputDocuments:
  - e2e/tests/growing-jackpot.spec.ts
  - e2e/tests/growing-jackpot-helpers.ts
  - server/test/growing-jackpot.e2e-spec.ts
---

# Growing Jackpot — automation expansion

## Stack

- Frontend E2E: Playwright (`e2e/`), serial suite with auth setup
- Backend API coverage already exists in `server/test/growing-jackpot.e2e-spec.ts`

## Gap analysis (before)

| Area | API tests | Browser E2E |
|------|-----------|---------------|
| Create session + start round | Yes | Yes |
| Stream widget (accepting) | Yes | Yes |
| Go live gate | Partial | **Added** |
| Edit session title | Yes | **Added** |
| Stop round early + history | Yes | **Added** |
| Settings (join command) | Yes | **Added** |
| Archive (view-only) | Yes | **Added** |
| Widget idle (no live session) | Yes | **Added** |

## New E2E scenarios (P1)

1. Off-air session — Go live visible, start round disabled
2. Edit session title — dialog save + header update
3. Stop round early — history shows "Stopped early"
4. Custom join command — settings save reflected on active round
5. Archive session — view-only banner, no start control
6. Idle overlay — widget shell without Players/title content

## Helpers added

- `createGrowingJackpotSession`
- `stopGrowingJackpotRound`
- `saveGrowingJackpotJoinKeyword`

## Run

```bash
cd e2e && npm test -- tests/growing-jackpot.spec.ts
```
