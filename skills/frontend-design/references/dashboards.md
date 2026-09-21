# Dashboards

Dashboards fail from disorganization, not ugliness. If it looks like someone emptied a drawer onto the screen, or needs a PhD to operate, it's too complex. **Do one thing well.**

## How dashboards differ from landing pages

1. **Everything is smaller.** The type scale has many small sizes with little space between the steps; nothing much above 24px.
2. **Grids are followed strictly**, because you're using most or all of the available space.
3. **The main section defines what matters to the user** — project status for a PM tool, investments at the top of a finance tool.

## The sidebar

The spine of the product: persistent, globally relevant elements.

- **Profile management at the top** is often better than the logo — a profile picture is instantly identifiable, and a chevron signals it's clickable.
- **Links** are a recognizable icon plus a short title, which pays off when the sidebar collapses and leaves room for notification counts and "new" chips.
- **Group by relevance**; push settings and help to the bottom. Navigation is about reducing cognitive load.
- **Nest into dropdowns** as links multiply.
- **An active state is mandatory** — a rectangle indicator is enough.
- Leftover space can carry feature highlights or notifications.

Don't put globally irrelevant data in it — per-page counts belong on the page, not in navigation.

## The four components

Every dashboard page is built from these, so mastering them covers everything:

**1. Lists and tables.** The most common. List quality comes down to separation, achieved three ways: space, dividers, or color. Table quality is about *functionality* — displaying data is half of it; search, filter and sort make it a tool.

**2. Cards.** Charts and toasts included. Keep margins generous so content isn't packed. Border or background fill, not both — outlines for dark mode, fills for light.

**3. User inputs.** Modals, settings pages, sometimes forms inside cards.

**4. Tabs.** New pages without cluttering the sidebar, keeping related views in context.

## Let the data drive the form

A logically laid-out table where nothing drives the form improves immediately with:

- **Chips** for fields with a fixed set of values (status, department).
- **Right-aligned numbers**, so digits align by place value.
- **Truncated long text**, giving other columns breathing room.
- **Shaded rows** for inactive or deactivated records.

Then question the table itself. Time-delineated data *works* in a table but belongs on a **timeline** — tucked into a sidebar pop-out or widened into a second column.

**Color comes from the data too.** A red chip icon draws the eye because the action is urgent. An avatar appears because the eye associates who-did-what far faster than reading a name. From there it's a short step to a chart that summarizes what the timestamp column makes you hunt for.

## Containers: popover, modal, page

| Container | When | Blocking? |
|---|---|---|
| **Popover** | Simple context — display settings, quick pickers | No; clicking away is free |
| **Modal** | Complex context still tied to this page — create/edit | Yes; must confirm or cancel |
| **New page** | Large or permanent context — opening a record | Requires a back button or breadcrumb |

Because a modal hides the page while changes are made, follow it with a **toast** confirming the result.

**Toasts** are the notification system: anything the user should know without taking over the screen, plus the warning and error states that most designs forget.

## Progressive disclosure

Hierarchy based on what you show versus what you hide.

Infrequent functionality — sharing, for instance — goes in a popover rather than being permanently embedded beside the table. Inside that popover, the primary action (search) is immediately visible; a secondary action (remove user) appears on hover with a tooltip.

This is the **spectrum of explicitness**: an always-visible global button sits high on it, a hover-only copy icon sits low. Place each action deliberately.

**Onboarding is the same idea across time.** A first-time user shouldn't face a fully loaded dashboard. Start with one tooltip on the most important action; once done, show the next, or a small checklist in the corner. You aren't hiding functionality, you're sequencing it — unlike a six-bullet modal that's forgotten the instant it's dismissed.

## The invisible UI

**UI is as much what you can't see as what you can** — and this is exactly what gets skipped.

For a dense table, the extra functionality lives in things that aren't visible at rest: copy chips on cell hover, comment indicators, row actions, bulk-action bars revealed by selection. Laid side by side, the hidden UI is not a small fraction of the whole, and none of it is optional if the table is meant to work.

The most universally missing piece is **tooltips**. Assume users won't recognize every icon and will want detail on ambiguous labels.

Other rarely-seen-but-necessary states: feature announcements, onboarding popups, empty states, error states.

## Charts

- Grid lines and axis numbers — everyone forgets them, and without labels the numbers mean nothing.
- A **time-scale selector**, and a compare control if multiple series are plausible.
- An icon to open a full-screen version.
- Favicons or avatars beside bars for identification.
- **Don't** curve data lines, fade them out, round bar tops, or plot more bars than there are data points.
- Hover interactions are where charts can be creative: show the value plus a percentage bubble, or dim the other bars.

Simple, informative and aesthetic are not in conflict — the pretty Dribbble chart with no axis is simply unreadable.

## Interaction

Dashboard motion is tame and user-focused. What people actually want is speed, which means **optimistic UI**: apply the change instantly and assume the request succeeds, the way deleting an email works.

**Bulk actions** deserve special mention — selecting multiple rows revealing a contextual action bar is the difference between a list you look at and a list you manage.

## Layout by priority

Treat the page as a grid where more important information sits higher and further left. Rank each module as you build it, then place high-priority modules first, medium next, low last. When two arrangements are possible, take the one that doesn't leave an awkward gap.

If a gap remains, it usually means a module is genuinely missing from the product — not that you need filler.
