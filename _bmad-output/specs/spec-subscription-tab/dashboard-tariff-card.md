# Dashboard tariff card — `/dashboard` home mode

Improved summary card on the main page. Full subscription management and Telegram activation live on `/subscription` (owners only).

**When shown:** home mode only (`accountId` set). Hidden in picker mode.

## Layout (`Card`)

```
┌─────────────────────────────────────────────────────┐
│ Тариф                                    [Бесплатный]│  ← title row: H3 + plan Badge
│ Текущий план подписки команды                        │  ← CardDescription
│                                                      │
│ Базовый доступ к панели и модулям.                   │  ← plan blurb (see table)
│                                                      │
│ [Управление подпиской →]          (owner only)       │  ← Button asChild + Link
└─────────────────────────────────────────────────────┘
```

## Plan display

| `subscriptionPlan` | Badge label | Blurb (RU) |
|--------------------|-------------|------------|
| `free` (default) | Бесплатный | Базовый доступ к панели и модулям. |
| other | raw value | Расширенные возможности команды. |

Map `free` → «Бесплатный»; unknown strings shown as badge text verbatim.

## Role visibility

| Element | Owner | Admin |
|---------|-------|-------|
| Card (plan + blurb) | yes | yes |
| «Управление подпиской →» link to `/subscription` | yes | **no** |

Admins see the improved card read-only — no link to `/subscription` (they cannot access that route).

## Component reuse

Extract shared plan label + badge logic into a small helper or `PlanBadge` used by dashboard card and `/subscription` plan card — avoid duplicated `free` → «Бесплатный» mapping.

## Styling

- Match existing dashboard `Card` patterns (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`)
- Plan badge: `variant="secondary"` in header row, right-aligned on `sm+` (`flex items-start justify-between`)
- CTA: `Button variant="link"` or `variant="outline" size="sm"` with `asChild` + `react-router` `Link` to `/subscription`
