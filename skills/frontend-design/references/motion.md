# Motion and micro-interactions

## When motion is justified

**Animation must add clarity or functionality.** A portfolio full of animations that do nothing is just noise.

The test: does the motion explain a change of state, a change of place, or a change of context? Consolidating nav links into a menu that animates open is justified — the animation explains where the links went. Shrinking a search bar that expands on click is justified for the same reason.

General rules:

- **Buttons should almost always have a small animation.**
- **Scroll-jacking should be used very sparingly, if ever.**
- Dashboard motion stays tame and user-focused; landing pages can afford more.
- **Motion belongs to the visual identity.** Pick one or two motifs — a pull-away on scroll, a gradient wipe between sections — and repeat them across the whole site, rather than giving each section its own idea.
- **Animate section transitions, not just elements.** A hard break between two sections is a defect: slide the outgoing content off and blur its text while the next section moves over the top, so the first reads as background.
- A **delay is part of the design** — a tooltip that waits ~1000ms is a different component from one that fires instantly.
- **Custom easing is what separates a good version from a cheap one.** Spring-like easing (roughly 500ms, high stiffness, low damping) reads as deliberate; linear or default easing reads as unfinished.

## Feedback vs. micro-interaction

**Feedback** is the minimum: the element acknowledges that something happened. Four button states, input focus, a spinner while data loads.

**A micro-interaction goes one step further and confirms the outcome.** A copy button with hover and press states still leaves you unsure anything was copied; a chip sliding up to say "Copied" resolves it. Likewise, filling in a save icon is a good first step, but a dot appearing on the saved-items tab is what tells the user where the thing went.

When a transition takes a moment, the absence of feedback reads as a broken click. Graying out the button on press fixes it; a spinner covers the genuinely slow case.

## Patterns worth stealing

**Button hover/press.** Instead of inventing hover and click *colors*, animate: text sliding up on hover, the button scaling down on press. Motion can replace color for state changes.

**Delayed tooltip.** Mouse-enter trigger, mouse-leave to reverse, ~1000ms delay so only deliberate hovers fire. The highest-value pattern here — it's how you label a dense icon UI without spending space.

**Name tag on hover.** A small tilted label popping out of an avatar. Costs nothing and adds information.

**Text hover pop-out.** Hovering a phrase reveals an illustration of what it describes — showing without spending words or image space.

**Toast.** Slide up, then carry more than text: loading progress, or a celebratory success state.

**Progress bar.** Mask a stroke to a colored rectangle and slide the rectangle, so the stroke appears to draw itself; everything else fades.

**Card stack swipe.** Rotate the top card away at zero opacity while scaling and shifting the cards behind. **The detail that completes it:** the cards below must move up to fill the space as the top one is dragged, otherwise the stack doesn't feel like it's advancing.

**Search expansion.** Collapse the search bar into a magnifying glass, then animate the expansion on click — compressing an element into an icon is what creates the opportunity for the interaction.

**Hover for upgrade details.** Revealing what a paid plan would give. Slide the new value in rather than crossing the old one out.

**Shimmer stroke.** An angular gradient rotating behind a masked outline. Modern, and worth a pause control since the shimmer moves at uneven speed around the perimeter.

**Chart hover.** Show the value plus a percentage bubble, or dim every other bar in the series.

## Implementing transitions: the platform does most of it

Before reaching for an animation library, check whether **CSS View Transitions** cover the case — they handle the two hardest kinds of motion (element continuity across a navigation, and animating an arbitrary DOM change) with very little code.

- **Between pages:** `@view-transition { navigation: auto; }` in a stylesheet both documents share. Same-origin only. You get a crossfade immediately.
- **Element continuity:** give the "same" element on both pages an identical `view-transition-name` and the browser tweens size, position and color between them. The name is arbitrary; only the pairing matters.
- **Any DOM change:** wrap the mutation in `document.startViewTransition(() => { ... })`. Only named elements animate, so for dynamic lists assign `style.viewTransitionName` in JS with an index suffix.
- **Fine control** lives in `::view-transition-old()` (a static snapshot) and `::view-transition-new()` (the live element), inside `::view-transition-group()`. Kill the default page crossfade with `::view-transition-group(root) { animation: none; }`.
- An element present on only **one** page can still enter or leave gracefully — matching counterparts aren't required.
- **Firefox doesn't support it yet.** Cross-document transitions degrade harmlessly; `startViewTransition` needs a guard.
- Debug in DevTools → More tools → **Animations**, at 10% speed. Paused inspection is the only way to see what's really happening.

Full walkthrough, including the image-pair `object-fit` fixes: `_yt/camelcase/css-view-transitions-will-change-web-design-forever.md`.

## Progressive disclosure through motion

Motion is how progressive disclosure becomes legible: the element that appears on hover, the sheet that rises, the menu that expands. Prefer a **"load more" button over infinite scroll** — it gives the user control and, crucially, lets them reach the footer, which infinite scroll often makes impossible.
