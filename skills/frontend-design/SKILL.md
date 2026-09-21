---
name: frontend-design
description: "WIP — manual invocation only (/nebster:frontend-design). Build or improve UI: layouts, dashboards, landing pages, components, color palettes, dark mode, typography, spacing, depth, states, and micro-interactions."
disable-model-invocation: true
---

> **🚧 WORK IN PROGRESS — do not invoke automatically.**
> This skill is an unfinished draft distilled from YouTube transcripts and has not been reviewed or validated by Lukas. It runs **only when the user explicitly types `/nebster:frontend-design`**. Never load or apply it on your own initiative, and don't treat its rules as settled house style until this banner is removed.

Design decisions here are **mechanical, not artistic**. Every rule below produces a concrete value you can put in CSS. Work through the process in order; skip nothing, because most bad UI comes from starting at step 4.

## Doctrine

1. **Design is not art — it solves a problem.** If the goal is traffic, sales or task completion, functional beats beautiful. Dribbble designs look amazing and stop making sense when you zoom in.
2. **Nobody reads a screen.** Users arrive with a question and hunt until they find the answer. Every technique here exists to make scanning faster.
3. **Remove first — but minimal is not the same as simple.** Removing is valuable because it forces the question *does this earn its place?*, not because fewer elements are inherently better. Element count and ease of use are unrelated: a screen with four colors and three sizes can read as simpler than plain text, because hierarchy gives the eye somewhere to land. Don't let "less" become a style that strips out context, color and character.
4. **Emphasis is a difference, not a property.** An element stands out because of how it differs from its neighbors — often the fix is de-emphasizing the competition, not amplifying the target.
5. **Everything locks to an edge.** Compact UI feels "perfect" because every element borders at least two edges. Manufacture new edges rather than hiding content.
6. **Density isn't the problem — undifferentiated content is.** Group and vary before you add whitespace.
7. **Show, don't tell.** A recognizable visual registers before text is read. Making a screen harder to *read* in order to make it easier to *understand* is a bad trade.
8. **Let the data drive the form.** The shape of the UI follows the shape of the data — including whether it should be a table at all.
9. **Every action gets a response.** Hover, press, disabled, loading, focus, error, empty, success.
10. **Average → good is cheap; good → excellent is expensive.** Know when to stop.

## Process

### 1. Intent before interface

Ask what the user came to do, not how the page should look. A vacation rental flow starts as a search bar plus destination, travelers, dates — not icons and card layouts. **Functionality expands only as user intent expands.** Adding a header and a hero image on top of that changes aesthetics, not function.

Then decide *what content to display* before *how*. Users scan location, rating, price; the long description belongs on the detail page.

### 2. Structure — boxes, rows, columns

Everything is a box, and every design breaks into rows and columns. Responsiveness is largely moving boxes between them as width changes. Draw the parent/child tree before writing markup.

- **Default to flexbox.** Reach for grid only when you want a rigid, structured layout with equal-sized children.
- Sketch the responsive behavior first, including the awkward middle sizes — deciding this in the editor leads to settling for a bad layout out of sunk cost.
- Section by section, starting with the hero. Users decide in seconds.

See `references/layout.md` for the flex/grid decision table, the gotchas, and positioning.

### 3. Tokens before components

Never write a fixed value. Define variables first, then build against them.

- **Spacing: multiples of 4.** Not because 4 looks better, but because it always halves cleanly, which produces consistency. 8, 12, 16, 20, 24, 32 — never 30.
- **Type: one sans-serif font, ~3 sizes.** Pick a 14px or 16px base, design everything at it, and step ±2px only when forced. Weight and color create the hierarchy, not size.
- **Color: neutrals + one primary + semantic.** Build it in HSL or OKLCH so shades are arithmetic. Never hex or RGB for a palette.
- Convert px to `rem` (divide by 16) so user font-size preferences work.
- Same values as global variables → theme switching and later tweaks are one edit.

### 4. Hierarchy

Ask what the user looks for first, then make it win — starting with the *smallest* lever:

1. **Color / contrast.** If contrast is already maxed (white on black), de-emphasize the neighbors by dropping their lightness (60% is a reliable starting point).
2. **Weight.**
3. **Size.**
4. **Position** — important things higher and further left.

Then zoom out. If the target doesn't pop at real size and real distance, adjust. **Code for document hierarchy, style for visual hierarchy** — not every `h1` looks the same, and an `h3` may legitimately be larger than an `h2`.

### 5. Depth

The cheapest upgrade available, and the fix for "clean but boring":

- Three to four shades of one color, layered. Lighter = closer = more important.
- **Two shadows, never one:** a light inset/glow on top, a dark shadow at the bottom.
- **Light comes from above** — every gradient, highlight and inset must agree with that.
- Once shades separate elements, **delete the borders**.
- If the shadow is the first thing you notice, it's wrong.

### 6. States, feedback, disclosure

- Buttons: default, hover (lighter), active (darker), disabled (desaturated), plus loading where relevant.
- Inputs: focus, error with message, sometimes warning.
- Empty states, both kinds: first-run (point at the primary action) and no-results (acknowledge the query, suggest fixes, offer an exit).
- **Progressive disclosure** is hierarchy in time. Place each action on the spectrum of explicitness: always-visible global action at one end, hover-only cell action at the other.
- Optimistic UI for anything the server will almost certainly accept.

### 7. Polish

Motion must add clarity or functionality. Buttons get a small animation; scroll-jacking almost never. Tooltips need a ~1000ms delay so only deliberate hovers fire them. See `references/motion.md`.

## Quick checks

Run these against any screen before calling it done:

- [ ] Does every element border at least two edges?
- [ ] Squint at it — does the one thing that matters most still pop?
- [ ] Is every spacing value divisible by 4, and reused consistently?
- [ ] More than ~3 font sizes, or more than one font family? Cut.
- [ ] Any hex/RGB literal in the CSS instead of a token?
- [ ] Icons colored for decoration rather than status? Strip the color.
- [ ] Pure black or pure white where gray would do?
- [ ] Every interactive element: hover, active, disabled, focus?
- [ ] Empty, loading and error states designed, not just the happy path?
- [ ] Dark mode built deliberately, not inverted?
- [ ] Tooltips on every ambiguous icon?
- [ ] Does it work at 375px without horizontal scroll?

## Tells of beginner or AI-generated UI

Useful both when building and when reviewing someone else's work:

- **No images anywhere.** The clearest tell of a vibe-coded site, and the reason it feels robotic — it names its audience and then never depicts them.
- Stock imagery with nothing to do with the product (worse than none).
- Emojis used as interface icons; mismatched icon sets (different fill, stroke width, corner radius).
- Bright, clashing accent colors that fail WCAG — AI reaches for these every time.
- The same KPI row repeated on three different pages; cards that do nothing.
- Mixed corner radii, and two functionally identical buttons drawn differently.
- Everything packed too tight, especially on mobile.
- Harsh default drop shadows; multi-hue gradients.
- Charts with no axis, no grid lines, rounded bar tops, or more bars than data points.
- Cards nested inside cards, borders on borders, three radii stacked.
- No tooltips, no empty states, no hover feedback anywhere.
- Every value shown in its default state, so nothing reads as important.

## Reference files

Load the relevant one when working in that area:

- `references/color.md` — building a palette by lightness, dark mode, semantic color, brand color adaptation.
- `references/layout.md` — flex vs. grid, responsive mechanics, positioning, edges, cards.
- `references/spacing.md` — the rem scale, grouping distances, inner-vs-outer, optical weight.
- `references/landing-pages.md` — hero anatomy with real numbers, the four maturity levels, visual identity, page flow.
- `references/typography.md` — type scale, the letter-spacing trick, line height as margin.
- `references/dashboards.md` — sidebar, density, the four components, popover/modal/page, tables, charts.
- `references/mobile.md` — navigation, one-direction layout, bottom sheets, gestures, touch targets.
- `references/motion.md` — micro-interaction patterns and when motion is justified.

## Provenance

Distilled from the recurring, repeated-across-videos material of **Sajid** (`@whosajid`) and **Kole Jain**, plus implementation detail from **camelCase** (`@camelCaseDev`). Cleaned transcripts live in `_yt/` (gitignored — local only). Repetition across videos was the filter: one-off opinions were dropped, principles the channels arrived at independently were kept. This is a personal, tactical complement to Anthropic's built-in `frontend-design` skill, not a replacement for it.
