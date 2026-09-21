# Layout, spacing and responsiveness

## Think inside the box

Everything is a box, and layout is the parent/child tree of those boxes. Draw the tree top to bottom before writing markup — it becomes the reference document when something breaks. Grouping exists because boxes have properties that act on their children; that's why a parent has two children rather than five.

## Rows and columns

Every design decomposes into rows and columns, and responsiveness is mostly moving boxes between them as width changes. Three cards in one row on desktop → two rows on tablet → three rows of one on mobile.

## Flex vs. grid

**Default to flexbox. Use grid when you want a rigid, structured layout.**

| Want | Use |
|---|---|
| Items sized by their content, filling space naturally | flex |
| Equal-sized children regardless of column count | grid |
| Wrapping cards of varying width | flex + `wrap` |
| Repeating galleries, tables of cards, dashboards | grid |
| A sidebar plus a main area that fills the rest | flex |

> Flex is the parent whose children choose their own room size; grid is the parent whose children do as they're told.

A rigid structure costs three lines in grid, all on the parent. The same thing in flex takes four, split across parent and child selectors.

### Flex properties that matter

Defaults are `flex: 0 1 auto`.

- **`flex-grow`** — fill leftover space. Not a boolean: it's a *proportional* unit, so `2` on the most important child is a legitimate responsive lever.
- **`flex-shrink: 0`** — stop shrinking when space runs out.
- **`flex-basis`** — starting size, like a min-width. At `0`, everything starts at zero and `flex-grow` distributes proportionally.
- `flex: 1 1 auto` is the everyday flexible layout: natural size, then grow or shrink.
- **`justify-content: space-between`** distributes leftover space evenly — very handy responsively.

**Gotcha:** room to grow doesn't mean all items grow equally. With `flex-basis: auto` the algorithm hands leftover space to the largest child. Set an explicit `flex-basis` to make growth even.

### Grid essentials

```css
display: grid;
gap: 16px;
grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr));
```

`1fr 2fr` gives proportional columns; percentages give fixed ones. The `min()` wrapper prevents overflow on narrow screens. Grid's payoff: equal-sized cards whether the layout resolves to one, two or three columns.

## Spacing

**Every size and space is divisible by 4.** Not because multiples of four look inherently better, but because they always halve cleanly, which enforces consistency. 8, 12, 16, 20, 24, 32, 40 — never 30.

Consistency is the point: one gap value between columns, reused everywhere. Good design repeats itself, and the system exists so you pick from a list quickly instead of trying random values.

**Full system in `spacing.md`** — the rem scale, start-big-and-reduce, inner-smaller-than-outer, and optical weight.

## Whitespace vs. grids

A 12-column grid and an 8px rhythm are guidelines, not law. Custom landing pages routinely ignore the columns. Grids earn their keep on structured, repeating content — galleries, blogs, tables — where they define responsive behavior (12 / 8 / 4 columns).

Whitespace matters more. A simple hero: ~32px between items, tighter between things that belong together (announcement + heading, heading + subtext). That tightening *is* visual hierarchy.

## Edges

Compact UI feels right because every element borders at least two edges. When something floats:

- **Move content** to clear an edge, or
- **Manufacture a new edge** — align a row of buttons with an avatar to form a line the content below can sit against.

Hiding elements behind a menu is not the fix. Note that every list row creates a new edge for the next row to stack onto; replacing rows with larger icons destroys the bottom edge, so a subline is needed to restore it.

## Cards

Cards hand you four edges for free, which is why they're the default. But nobody actually builds just a card — people fill a canvas with containers until there are borders on borders and three stacked radii.

- **A single line can dissolve a card into the interface.** A column edge does what the card border did.
- **Never double-nest cards.** Padding on padding cramps everything; group with whitespace instead.
- Choose border *or* background, not both. Outlines suit dark mode, background fills suit light mode.

## Positioning

- **`static`** — normal flow.
- **`relative`** — same flow, unlocks offsets, and makes the element an anchor for absolute children.
- **`absolute`** — out of flow, positioned against the nearest non-static ancestor. **The classic bug: the parent is still static.**
- **`fixed`** — like absolute, no positioned parent needed, doesn't move on scroll.
- **`sticky`** — flows and scrolls, then sticks. **Set `align-self: flex-start` when the parent is a flex container**, or it won't stick.

## Media queries

Flex and grid can only go so far; some behavior needs explicit breakpoints. Put **all media queries at the end of the stylesheet** so the cascade doesn't silently overwrite them.

Typical mobile adjustments: reset `flex-grow` to 0, `margin-left: auto` to push an element right, `display: none` for decorative text, and move a sidebar out of flow to sit above the content rather than beside it.

## Naming

You have to name things to style them, so make the names unique and descriptive. It prevents conflicts and makes debugging tractable later.

## Sections

Break the page into sections and solve one at a time.

**Hero** — the highest-value section, because users decide in seconds. Heading answers *what problem do you solve that the user has*; two or three sentences expand it; an image, video or demo complements it; then one call to action. Two-column is easier to make responsive than one-column, but either works if you actually test the small sizes.

**Every later section** — ask what its purpose is, then serve only that. A good heading is often an offer competitors don't have, or the answer to a question everyone in the industry asks.

## Components

Most marketing pages are two or three components repeated. A feature section with icon + heading + details is one component with three props; the image-and-text section reversing its flex direction is one component, not two.

Copy-pasted markup is not a component — each copy drifts, and one change means hunting down every instance. Give every repeated pattern a single source of truth, whether that's a framework component or a native custom element.
