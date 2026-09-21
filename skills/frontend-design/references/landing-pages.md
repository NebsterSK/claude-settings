# Landing pages

A landing page is judged on trust and flow, not on polish. A site can be clean, modern and animated and still feel soulless — usually because it never depicts the person it claims to serve.

## The skeleton

Landing pages that look nothing alike decompose into the same four zones: **the text block, the navbar, the visual, and the supporting stats or logos.**

### The text block, measured

| Relationship | Distance |
|---|---|
| Heading → subtext | 8px |
| Eyebrow → heading | 12px |
| Buttons → text block | 32px |

Those distances encode the relationships: heading and subtext bind most tightly, then the eyebrow, then the buttons. The block should not dominate the page.

**Length is part of the design:** roughly **7 words in the headline, ~14 in the subtext**. A large heading already carries visual space between its baseline and its apparent bottom, so buttons need roughly twice the distance you'd expect from the subtext.

### The visual

The single highest-leverage element on the page.

- **Never obstruct the focal point.** Put text above, below, or to the left, leaving the center and right open.
- **The background must not be busy**, or the overlaid text becomes unreadable.
- **Stock imagery unrelated to the product is worse than none.** Use the actual product, or the actual context the product lives in.

### The nav

Flat navs where every item looks identical are a level-one tell. Give the primary action an outline or fill, center the remaining links to balance the bar, and add dropdowns on the links that have depth.

**Matching labels matter:** if the nav button and the page CTA go to the same place, they should say the same thing. That's how the correct mental model gets built.

### Secondary hierarchy

Two lines at the same font size still form a hierarchy if the second sits at ~55% opacity. **Size is not the only lever.**

## The four levels

A diagnostic ladder — identify the level, fix the next thing.

| | Imagery | Copy | Motion | Flow |
|---|---|---|---|---|
| **1** | Stock, unrelated | Vague, too long | None | Sections stacked |
| **2** | Real product screenshot | Shorter, punchier | Simple load animations | Logical top-to-bottom |
| **3** | Curated crop of the product | Describes the product | Subtle hover, fluid sliders | Sections segue |
| **4** | Crafted to show exactly what it does | *How it helps*, not what it does | Blur transitions, hover-revealed CTAs | Immaculate |

Other markers along the way:

- **Level 2** swaps a side-by-side hero for a stacked one, letting the page breathe; color starts coming from the product screenshot rather than being applied to anything that will take it.
- **Level 3** frames content with vertical lines that also solve very large screens, replaces card rows with **bento grids**, adds a click-through multi-select, and introduces a mega menu that signals the product has depth. This is where a UI designer becomes a product designer — badges, logo sets, social proof.
- **Level 4** is attention to detail, not spectacle: no custom illustration, no 3D. A blur on an existing transition, a mega menu that stays open and shifts its content sideways instead of closing and reopening, a CTA that appears on hover only when needed.

**The copy shift is the subtle one.** "Collect and analyze data quickly" describes the product. "Turn your data into decisions" describes what the user gets. Level four is the second one.

## Building a visual identity

Identity comes from a feeling, and **none of it comes from a formula.**

1. **Start from one image** that carries the mood. Crop it, darken it, add noise, set the brand name over it.
2. **Gather a few more** in the same register.
3. **Pull the palette out of those images** rather than inventing one, then add one or two accents.
4. **Add texture from the domain** — the objects the user actually works with.
5. **Mix a serif into the sans** for personality, if the brand supports it.
6. **Derive icons** in the accent colors for the main features.

Noise over a background image is doing double duty: texture, and contrast for the text on top of it.

## Frankensteining the wireframe

To work out message and flow, assemble a wireframe from sections of sites you admire, noting what you'd change about each — *this hero, but with domain objects scattered around; these feature tabs, but with a bigger image and 90% of the text cut.*

Zoom out and it looks stitched together, which is fine, because **you only want the boxes.** Pull the wireframe out and throw the rest away.

**Layout and identity are separable.** Once both are defined, a different identity dropped into the same layout produces a completely different feeling — which is the actual skill.

## Layering imagery

Scattered arrangements should feel random and never be:

- **Larger elements below, smaller on top.**
- **Always maintain a margin of safety around the text.**
- **Darken the edges** to pull attention to the center.

## Flow and motion

**Page flow is a property of the whole page.** Sections should lead into one another; a hard break between the hero and what follows is a defect.

Fix it by sliding the hero elements off-screen and blurring the text while the next section slides over the top, so the hero reads as part of the background. Apply the reverse at the CTA.

**Motion belongs to the identity.** Pick one or two motifs — a pull-away on scroll, a gradient transition between sections — and repeat them throughout, rather than animating each section differently.

For a section where several images all matter, rotate them on a timer with a slight zoom on hover, so the user sees all of them.

## Learning the eye

Before opening a design tool, take a page you like and pull it apart: measure the spacing, name the groupings, identify the hierarchy.

Then **copy it — don't redesign it.** Redesigning lets you skip the details; copying forces you to answer how far apart the cards are, how tall the nav is, what the button padding is. After a few sites the patterns emerge, and it becomes clear that at any point there are only a handful of layout options:

- **Hero:** text left / image right; image full-screen beneath the text; text above and image below; rarely, text beneath the image.
- **Text:** centered, left-aligned, or body and CTA pushed right.
- **Visual:** bordered, full-bleed into the background, or a carousel.

**Content picks the branch.** A profound statement wants centered text, larger type and space. A features list makes text the supporting cast. Features that would run off-screen become a bento grid so nothing is lost.
