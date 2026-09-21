# Typography

Most UI is text and buttons with a few icons. Typography is the 20% of design that produces 80% of the result — strip the font styles from any familiar interface and it stops working entirely: the active tab becomes unidentifiable, the feed becomes an undifferentiated block.

## Font choice

**One sans-serif, and stop thinking about it.** Two at most, three only with real experience. This is not where your time should go; any popular, legible face works.

## Type scale

**Three sizes are enough for most UI.** Weight and color do the hierarchy work, so perceived size differs far more than actual size — in a real interface almost everything is one size, with only the title and a heading or two differing.

- Pick a base of **14px or 16px**, regular weight.
- Design everything at the base, and step **±2px** only when genuinely forced.
- Landing pages can justify up to ~6 sizes across a wide range.
- **Dashboards compress hard** — rarely anything above 24px, because information density is higher and the size steps sit close together.
- **Mobile goes bigger, not smaller.** iOS's base is 17px against macOS's 13px. Despite the smaller screen, type and spacing grow.

Convert to `rem` by dividing by 16, so user font-size preferences work, and store sizes as global variables.

## Line height is your margin

The gap under a title is usually line height, not margin or padding. Generous line height acts as the bottom margin of text elements, so most vertical spacing between text is already handled.

**Line height is inversely proportional to font size** — smaller text needs more of it to stay legible.

## The large-text trick

On big headings, tighten **letter-spacing to −2% … −3%** and drop **line-height to 110–120%**. This single adjustment is what makes large text read as professional rather than default.

## Hierarchy with type

Ask what the user looks for first, then reach for the smallest lever that works:

1. **Color / contrast.** When contrast is already maxed — white on black — you can't emphasize further, so **de-emphasize the neighbors instead**, dropping their lightness. 60% is a reliable starting point; against a 10% card surface, 90% for the title and 70% for the group works.
2. **Weight.**
3. **Size.** Big and bold together is often harsh — raise the size, then bring the weight back down.

Then zoom out to real size. Font size is effectively relative: two elements at the same size compete, and you can only judge the winner at actual scale and distance.

**Code for document hierarchy, style for visual hierarchy.** Not all `h1` elements share a font style, and an `h3` or a paragraph may legitimately be larger than an `h2`. Use judgment about what the user will focus on.

Also design for *functionality*, not just appearance: if a value is dynamic, the style has to survive its longest and shortest forms.

## Alignment

Text aligns hard left; numbers align hard right, so digits line up by place value. Centered text is for things people aren't really meant to read — avoid it for paragraphs and small text entirely.

Receipts are the extreme case and the clearest illustration: no dividers, almost no whitespace, just two edges holding everything together.

## Grouping with type

Size, weight, color and spacing all group or separate elements, but they are not equally decisive. Given six circles to split into two groups: spacing alone stays ambiguous, size reads as three groups, color stays unclear — but **moving one group down** is instantly unambiguous. Position wins.

A title needs to do two things: stand out, and stand *on its own*, separated from the group it isn't part of.

## Content structure

Design against real content, never perfect placeholder text. Plan for the destination with a very long name and the label that wraps — truncate long strings, and guarantee contrast for text or icons over arbitrary images (a circle behind a save icon, or a gradient under overlay text).
