# Surfaces — dashboard, team, and modules routes

English copy, shadcn components, hierarchy per adopted UI spec.

## `/dashboard` — two modes

`/dashboard` is the only team-selection surface. There is no `/picker` route.

### Picker mode

**When:** authenticated user has 2+ active memberships and no `accountId` in session (post-login or after **Switch team**).

- **Shell:** `nav-shell.md` with **Home** active; **Team** and **Modules** disabled until account selected; top bar shows email only (no team meta)
- **H1:** Choose a team
- **Lead:** You have access to multiple teams
- **Content:** one `Card` per membership — name, role `Badge`, primary `Button` **Enter**; calls `select-account` then transitions to home mode or redirects to contact-to-pay if inactive
- **Hidden:** team card, stats, modules quick link

### Home mode

**When:** `accountId` set and `accountIsActive=true`.

- **Shell:** `nav-shell.md` with **Home** active
- **H1:** Home (page title inside main, not duplicate logo H1 in content)
- **Lead:** Team overview and activity

### Sections (top to bottom)

1. **Subscription card** (`Card`)
   - Title: Plan
   - Badge: plan name (`subscriptionPlan`, e.g. **Free**)
   - Team name and role **not** repeated here — shown once in shell `SessionContext`

2. **Stats grid** (`mock-stats.md`)
   - Section heading: Statistics
   - Muted hint under heading: "Demo data for preview"
   - Responsive grid: 2 cols mobile, 4 cols desktop

3. **Quick link**
   - Secondary `Button` or `Link`: "Manage modules →" to `/modules`

**Not on dashboard home:** moderator roster, add-moderator form, revoke controls — those live on `/team`.

## `/team` — TeamPage

- **Shell:** `nav-shell.md` with **Team** active
- **H1:** Team
- **Lead:** Members with dashboard access

### Content

1. **Members roster** (`Card`)
   - Table or stacked rows: name, role badge (**Owner** / **Moderator**), status badge, action
   - Owner only: form "Moderator name" + submit "Create link"
   - Owner and moderator: **Revoke** per active moderator row (not owner row)
   - Deactivated moderators stay in list with badge **Revoked** and no revoke button
   - Empty state (only owner): "Only the owner so far"
   - On create success: Alert with join link for the new moderator

### States

- Loading members: skeleton or "Loading…"
- API error on members: `Alert variant="destructive"`
- Add moderator success/error: existing Alert pattern
- Revoke success/error: Alert pattern

## `/modules` — ModulesPage

- **Shell:** `nav-shell.md` with **Modules** active
- **H1:** Modules
- **Lead:** Tools for your team's streamers

### Content

- **No** connected-modules summary banner or toggle-count strip — `PageHeader` then card grid only
- Grid of **exactly two** module cards from `modules-catalog.md` (1 col mobile, 2 cols md+)
- **Bonus Buy:** **Available** badge; primary **Open** button → `/bonus-buy`; no toggle
- **Wheel of Fortune:** **Soon** badge; muted card; **Coming soon** chip in footer; no navigation
- No mock games section; no cards for retired catalog rows

### Card behavior

- Available row with route: shadcn `Button` **Open** (not a toggle `Switch`)
- Coming soon row: no switch or button; badge **Soon** + footer chip **Coming soon**

## Role visibility

| UI element | Owner | Moderator |
|------------|-------|-----------|
| Team card (dashboard) | yes | yes |
| Mock stats (dashboard) | yes | yes |
| Member list (`/team`) | yes | yes |
| Add moderator form (`/team`) | yes | **no** |
| Revoke moderator (`/team`) | yes | yes |
| Module catalog (`/modules`) | yes | yes |
| Switch team (if multi) | yes | yes |
