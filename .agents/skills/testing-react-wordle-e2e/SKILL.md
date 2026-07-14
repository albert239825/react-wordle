---
name: testing-react-wordle-e2e
description: >-
  Verify the react-wordle app end-to-end in a real browser: start the dev
  server, play a guess to confirm the reveal/keyboard flow, exercise a Settings
  toggle, and confirm state persists across a page refresh. Use this after any
  UI change (new setting, animation, grid/keyboard/modal tweak) to validate
  behavior beyond `npm run build` / `npm run check`.
---

# Testing react-wordle end-to-end

`npm run build` and `npm run check` only catch compile/format errors. Use this
procedure to verify actual runtime behavior in the browser.

## 1. Start the dev server

Run it in a background shell (Create React App serves on port 3000):

```bash
cd <repo> && BROWSER=none PORT=3000 npm run start
```

Wait for `Compiled successfully!` before continuing. Leave it running.

## 2. Open the app

Navigate the browser to `http://localhost:3000`. On first load a "How to play"
welcome modal appears after ~1s — close it (the X button) before interacting
with the board.

## 3. Play a guess (verifies the core loop + animations)

- Type a valid 5-letter word. `crane` is always valid (it's in both
  `src/constants/wordList.js` and `validGuesses.js`). Send letters as
  individual key presses (`c`, `r`, `a`, `n`, `e`), then press `Enter`.
- Expected: the row runs the tile-flip **reveal** animation and settles into
  per-letter colors (correct = green, present = yellow, absent = dark), and the
  matching on-screen keyboard keys recolor.
- To check the **jiggle** animation, submit an invalid or too-short word and
  confirm the current row shakes and an alert toast appears.

## 4. Exercise the relevant Setting

Open Settings (gear icon in the header) and toggle the setting under test
(Hard Mode / Dark Mode / Colorblind Mode / Reduced Motion, etc.). Confirm the
toggle switch flips and the visual effect applies immediately.

## 5. Verify state + persistence via the console

Settings persist to `localStorage` and are mirrored onto `document.body` data
attributes (`data-theme`, `data-colorblind`, `data-reduced-motion`). Assert
both the stored value and the resulting computed style, e.g. for Reduced
Motion:

```js
JSON.stringify({
  bodyAttr: document.body.getAttribute('data-reduced-motion'),
  localStorage: localStorage.getItem('reduced-motion'),
  // a completed-row tile carries the CSS-module `reveal` class
  revealDur: (() => {
    const el = [...document.querySelectorAll('div')]
      .find(d => d.className.includes('reveal'));
    return el ? getComputedStyle(el).animationDuration : 'none';
  })(),
})
```

With Reduced Motion on this returns `{bodyAttr:"true", localStorage:"true",
revealDur:"0s"}` — the animation is neutralized via `animation-duration: 0s`
(not `animation: none`), so tiles still snap to their final keyframe colors.

## 6. Confirm persistence across refresh

Reload `http://localhost:3000` and re-run the console assertion from step 5.
The setting must survive the reload (read back from `localStorage` on mount),
and the completed guess row is restored from the persisted `boardState`.

## Notes

- Use npm only (never yarn/pnpm).
- The daily solution comes from a date-based index in `src/lib/words.js`
  (`getWordOfDay`), so the winning word changes by day — don't hardcode it;
  just submit any valid guess to exercise the reveal.
- Board progress persists under the `boardState` localStorage key and resets
  when the day's `solutionIndex` changes.
