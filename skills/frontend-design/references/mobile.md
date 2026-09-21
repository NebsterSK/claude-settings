# Mobile

Mobile is different enough from desktop that porting a layout directly produces bad design.

## Navigation

The sidebar is gone. Two options:

**Bottom bar** — when links consolidate to a few key icons. Typically floating, with the primary action broken out. **Five links is the hard limit; three or four is much better.** Every target stays above **44px**. These actions are contextual and should change per page.

**Sidebar-as-home-page** — when too many important destinations exist to fit in a bar. Put recent items at the top and actions/counts along the right so it doesn't feel lopsided; the bottom then frees up for a large search bar or action button (Notion's approach).

At the top, a bell and an overflow menu is a reasonable default, also contextual per page.

## Type and density

The instinct is to squish everything in. Wrong direction: **the type scale and spacing stay similar to desktop and often get larger.** iOS's base font is 17px versus macOS's 13px.

The consequence is the hard part. Where desktop had an action bar, a gallery, a calendar, tasks and a scratchpad, mobile gets **one** of them.

## One direction per section

Desktop layouts extend in two directions at once — columns *and* rows. **On mobile, each section picks one:** either stack vertically, or scroll horizontally off the edge. Never both.

That single rule carries most of the work of converting a dashboard to mobile.

## Building blocks

Cards, text/links, images, inputs — and the last three can live inside cards.

Cards dominate because they group content where whitespace is scarce. **Avoid double-nesting them**: padding on padding restricts the little space you have. Group with whitespace instead of another container wherever possible.

## One screen, one job

Settings is settings. The editor is the editor — no "recent items" or "suggested templates" bolted on. The home screen is the only real exception.

**When you need to add something, reach for a different page, not a denser layout.**

**Bottom sheets** cover the exception: picking a template mid-edit shouldn't rip the user away, but there's no room on screen. A sheet with a title, search, confirm and cancel keeps context, works at any height, and is gesture-friendly. The plus button behaves the same way — a small menu or an immediate input.

## Gestures

- **Swipe right to go back** — move the background left ~35% and animate it back for a smooth transition.
- **Bottom sheets** — zoom the background out as the sheet rises, back in on dismissal.
- **Swipe up to search** — used by Slack and, loosely, Apple.
- **Long press** is the mobile right-click: blur the rest of the screen, show the actions, add slight zoom on the element, or go further into a dynamic preview.

Swipes are reliable as long as the user is taught them — so teach them.

## Contextual actions

Space is limited, so actions come and go. Opening a note hides the nav bar and reveals formatting and sharing; selecting a template hides all of it for just confirm and cancel. How they animate in and out is half the effect.

## Empty states

Two distinct kinds, both usually missing:

**First run** — don't fill the screen with cards inviting the user to add things. Draw attention to the primary action with a full-screen empty state and a short popover explaining how it works.

**No results** — acknowledge that nothing matched the query, use some imagery, suggest alternatives in case of a typo, and give an action to exit the empty state.
