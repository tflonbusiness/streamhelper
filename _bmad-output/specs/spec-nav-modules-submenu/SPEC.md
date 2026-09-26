---
id: SPEC-nav-modules-submenu
companions:
  - submodule-nav.md
  - ../spec-caz-team-dashboard/nav-shell.md
  - ../spec-app-english-only/conventions.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for audit only.

# Modules sidebar — quick links to product modules

## Why

**Pain:** Operators open **Modules** only to tap **Open** on a card — an extra step during a live stream when they already know which tool they need.

**Who:** Account owners and moderators with a selected team. **Opportunity:** Surface **available** modules in the left nav so Bonus Buy and Prize Spin are one click away from anywhere in the shell.

## Capabilities

- **CAP-1**
  - **intent:** An operator with an active account sees **Modules** in the desktop sidebar plus a nested quick link for each **available** catalog module when the sidebar is expanded.
  - **success:** With sidebar expanded and `accountId` set, `AppShell` lists **Modules** and sub-labels **Bonus Buy** and **Prize Spin** only; `coming_soon` rows (e.g. Chat Roll) are omitted from the sub-nav; without an account, the **Modules** group matches today’s disabled behavior.

- **CAP-2**
  - **intent:** Each sub-link jumps directly to that module’s main surface; **Modules** still opens the catalog at `/modules`.
  - **success:** **Bonus Buy** navigates to `/modules/bonus-buy`; **Prize Spin** to `/modules/prize-spin`; parent **Modules** navigates to `/modules`; routes match `MODULE_CATALOG` `widgetRoute` values.

- **CAP-3**
  - **intent:** Coming-soon modules stay discoverable on `/modules` but do not clutter the sidebar until they become available.
  - **success:** No sub-nav row for `status: coming_soon` catalog entries; when a module flips to `available` in `MODULE_CATALOG`, it appears in the sub-nav without a separate nav list.

- **CAP-4**
  - **intent:** Operators see which module they are in while browsing module routes.
  - **success:** On `/modules/bonus-buy` (and nested session paths), **Modules** and **Bonus Buy** show active nav styling; on exact `/modules`, only the parent is active; behavior documented in `submodule-nav.md` for available module prefixes.

## Constraints

- **Catalog sync** — Sub-nav uses `getAvailableNavModules()` (or equivalent filter on `MODULE_CATALOG` with `status === 'available'`); adding a module is one catalog change plus routes.
- **Desktop expanded only** — Collapsed sidebar hides sub-items; mobile nav stays a single **Modules** tab to `/modules`.
- **Account gate** — Same `requiresAccount` rule as current **Modules** nav item.
- **English UI** — Sub-labels use `module.name` from the catalog (`spec-app-english-only`).

## Non-goals

- Backend-driven module entitlements or per-team module toggles in this slice.
- Showing disabled or **Soon** module rows in the sidebar sub-nav.
- Reordering or renaming top-level shell items (Home, Team, Subscription).
- Sub-nav on mobile or flyout menus when the sidebar is collapsed.

## Success signal

Owner selects a team, expands the sidebar — sees **Modules** with **Bonus Buy** and **Prize Spin** only (no **Chat Roll**). Click **Prize Spin** → `/modules/prize-spin`. `/modules` still lists Chat Roll as coming soon. Collapse sidebar → sub-links hidden. `npm run build` in `app/` passes.

## Assumptions

- `MODULE_CATALOG` order defines sub-nav order among **available** modules only.
