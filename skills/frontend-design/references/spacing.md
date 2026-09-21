# Spacing

Spacing is not decoration. Its job is **grouping and separating**, which is how users navigate an interface. Three actions with equal gaps between them force the user to stop and work out which button belongs to which group.

## The scale

Use **`rem`, not pixels**, so spacing scales with font size and one system works for any UI. Step in **0.25rem (4px)** increments. Most elements are 1rem font size, so **1rem is the workhorse value**.

| Purpose | Value |
|---|---|
| Closely related elements | < 1rem (0.5rem is the common case) |
| Padding; gaps between buttons in a group | 1rem |
| Separating distinct groups | 1.5–2rem |
| Separating whole sections | 2rem |

Those three values cover most gaps, margins and padding on a typical screen. They also produce harmonious border radii — 1rem padding with a matching radius reads as optically balanced.

Treat the table as a starting point, not a rule. Spacing always depends on context, which is why you should never design against lorem ipsum or vague data: spacing that's perfect on one card is a disaster on another.

## Start big, then reduce

**Never start at 0.5rem and grow.** Start at ~1.5rem and come down until the grouping reads correctly.

While focused on one element the space always looks excessive, but users scan the whole screen before focusing on anything. A little extra whitespace only makes things easier to read; **tight spacing actively hurts usability.** If you have the room, use it.

## Inner must be smaller than outer

The space *inside* a group must be smaller than the space *around* it.

In a button, the icon-to-text gap must be smaller than the horizontal padding. Equal is tolerable. Larger is never acceptable — the button looks broken and confusing.

The one exception is when inner elements serve genuinely different purposes: in a like/dislike pair, the gap between the two buttons may exceed the group's outer padding, while each button's own icon-to-text gap still stays under its own padding.

## Optical weight

Vertical padding on text elements should be **smaller than horizontal padding**.

Text carries more visual noise left and right, because letter widths vary wildly (`i` versus `W`), while vertically it's constrained by cap height and descenders. Equal padding on all sides therefore *looks* like too much vertically, and the element reads as bloated.

- **Buttons:** a small vertical value, with 2–3× that horizontally.
- **Containers stacking many elements:** the opposite — generous vertical padding (1.25rem+) so the contents have room to breathe.

## Consistency beats correctness

A UI where every gap, padding and inset is the same wrong value still reads as *okay*, because consistency alone lets people parse what belongs to what. Get consistency and the design is passable; get the values right too and it's good.

Match the outer gap to the inner padding when laying out cards — equal values read as balanced.

## Method

1. **Set generous padding** on the section (2rem), and tighten later if it's too much.
2. **Break the section into groups** — heading + text, the options, the actions.
3. **Separate the groups** with 1.5rem.
4. **Tighten within each group** to 0.5rem for closely related elements.
5. **Equalize heights** where mixed controls make a row look unbalanced — a toggle is shorter than a dropdown, so set its height explicitly.
6. **Apply optical weight** — more horizontal padding on left-to-right elements; `space-between` where it makes scanning easier.
7. **Put the main action on the right**, where people expect it.
8. **Grid repeated cards** so widths are equal.
9. **Zoom back to real size** and compare against where you started.

## Where whitespace isn't the answer

Adding whitespace to fix a dense screen helps a little and makes everything longer. If the content is genuinely dense, the problem is usually that it's **undifferentiated**, not that it's tight — group it, vary it, and add visual anchors (avatars, icons, chips) before reaching for more space.
