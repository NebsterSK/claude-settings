# Color

## Roles

Three roles cover every UI:

1. **Neutrals** — backgrounds, text, borders, most elements.
2. **One primary/brand color** — main actions and character.
3. **Semantic colors** — blue trust, red danger, yellow warning, green success.

Red and green belong in the palette even when they aren't brand colors: a delete button in brand purple looks on-brand and fails to communicate destruction.

**Use color for purpose, not decoration.** Icons are recognizable symbols and mostly need no color — reserve it for status, like an active tab.

## Format: never hex or RGB

Three grays that look adjacent have hex codes that look unrelated. Use a format where lightness is a number you can step:

- **HSL** — hue 0–360, saturation 0–100%, lightness 0–100%. Saturation 0 makes hue irrelevant, giving pure neutrals.
- **OKLCH** — lightness 0–1, chroma 0–0.4 (UI rarely exceeds 0.15–0.2), hue 0–360. Newer and better; Tailwind v4's default.

HSL's weakness is lightness handling — dark and light shades lose their saturation. LCH and OKLCH step much more naturally.

## Building the palette

Work in dark mode first, with hue and saturation at **zero**. You are only choosing lightness values.

**Backgrounds** (each step ≈ +5% lightness, or +0.1 in OKLCH):

| Layer | Lightness | Use |
|---|---|---|
| Base | 0% | page background |
| Surface | 5% | cards |
| Raised | 10% | most important / elevated elements |

**Text**: one sharp high-contrast shade for headings, one muted shade for everything else. Don't use 100% lightness for headings — it's harsh.

**Then flip for light mode:** `L_light = 100 − L_dark`. That is a starting point, not the answer. Correct by eye, because inversion puts the darkest color on the raised element, and light comes from above — the raised element should be *lightest*.

**Only now** introduce hue and saturation. With contrast, gradients, highlights and shadows already working, hue is purely the mood dial — cool and vibrant, or warm and neutral. Check every color afterward, especially primary and secondary, since those carry buttons and hover states.

## Naming

Name background tokens by appearance, so they stay true in both themes: `bg-dark` is always the darkest shade, `bg-light` always the lightest. Text tokens can't work that way — give them role names that make sense in either mode.

## Neutral balance

Color has a whitespace equivalent. Backgrounds should stay in the background: **never bright**. Start with a neutral gray background and a light or white foreground; dark mode is the same relationship inverted.

To work color in subtly, tint the neutral gray with a hint of the brand hue rather than using the brand color directly.

In light mode you can reverse background and foreground — useful for small elements like a search bar, often for accessibility reasons.

Sometimes neutral balance means removing backgrounds entirely. Giving cards their own fill adds a layer and clutter; **a simple border is often better.**

## Gray, not black and white

Pure black and white aren't wrong, but there's usually something better, and it comes down to hierarchy: secondary metadata → dark gray; labels → lighter; borders on well-grouped elements → lighter still. In a polished design most text is gray, not black.

Dark mode pushes further, because eye strain is the concern: light grays rather than white, reserving pure white for the most important elements only.

**Comfort with gray is what separates mediocre designers from professionals.**

## Dark mode is not inverted light mode

Build the palette with dark mode's goals in mind. When converting:

- **Brighten borders and the main surface** — dark colors need a bigger delta than light ones to read as different.
- **No shadows to work with** — depth comes from making the card *lighter* than the background.
- **Dim chips and bright accents** in both saturation and brightness, then flip that relationship for their text to keep hierarchy.
- **Desaturate the logo** slightly.
- Deep purples, reds and greens all work — dark mode isn't limited to navy and gray.

## Brand colors you're stuck with

Don't be afraid to adapt them:

- **Rotate slightly** on the wheel for analogous companions.
- **Take the complement** across the wheel for a contrasting accent.
- **Darken** a brand color that fails WCAG with white text until it passes, or pair it with a passing complement.

Mailchimp (yellow + turquoise) and Airbnb (bright pink + deep pink) both do exactly this.

## 60-30-10

60% dominant neutral, 30% secondary, 10% accent. Useful as a sanity check when a screen has five accent colors competing. But applying the brand color at 60% can create the opposite problem — a loud color dominating an unimportant element. Lighten it and darken its text.

## Element states from color alone

- **Hover** — slightly lighter/brighter than base.
- **Active/pressed** — slightly darker.
- **Disabled** — desaturate (light gray fill, white text is enough on its own).
- **Mobile** has no hover: only the press state applies, and a slightly darker gray makes it feel like pressing into something.

## Implementation

```css
:root {
  --bg-dark: hsl(0 0% 0%);
  --bg: hsl(0 0% 5%);
  --bg-light: hsl(0 0% 10%);
  --text: hsl(0 0% 90%);
  --text-muted: hsl(0 0% 60%);
}

:root[data-theme="light"] {
  --bg-dark: hsl(0 0% 90%);   /* corrected by eye, not a pure 100 − L flip */
  --bg: hsl(0 0% 95%);
  --bg-light: hsl(0 0% 100%);
  --text: hsl(0 0% 10%);
  --text-muted: hsl(0 0% 40%);
}
```

Default theme in `:root`, alternate on a `body`/attribute selector toggled with one line of JS, or wrapped in `prefers-color-scheme` to follow the system. The framework choice doesn't matter; defining the colors is the actual work.
