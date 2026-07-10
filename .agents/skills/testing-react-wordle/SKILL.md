---
name: testing-react-wordle
description: >-
  How to test the react-wordle app end-to-end after making changes: run the
  build/format checks, start the dev server, drive the UI in a browser, and
  verify persisted settings survive a page reload. Use after adding or changing
  any UI feature (e.g. a new Settings toggle, stat display, or dialog).
---

# Testing react-wordle end-to-end

Follow these steps to validate a change before opening a PR. They combine the
static checks with a real browser walkthrough of the affected UI.

## 1. Static checks

Run these from the repo root and confirm both pass:

```bash
npm run check   # prettier --check src (formatting)
npm run build   # react-scripts production build must compile
```

If `npm run check` fails, run `npm run fix` (prettier --write) and re-run
`npm run check`. Do not open a PR until both commands are clean.

## 2. Start the dev server

```bash
BROWSER=none npm run start   # serves http://localhost:3000
```

Run it in the background and wait until it responds:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000   # expect 200
```

The dev server can take 15-30s to come up on a cold start.

## 3. Drive the UI in the browser

Open `http://localhost:3000` in the browser and exercise the feature you
changed. Common entry points:

- **Settings modal**: click the gear icon in the top-right header.
- **Stats modal**: click the bar-chart icon in the top-right header.
- **Info modal**: click the `i` icon in the top-left header.
- **Gameplay**: type letters via the on-screen keyboard (or physical keys) and
  press `ENTER` to submit a guess.

Interact with the new UI (toggle the switch, open the dialog, submit a guess)
and confirm it behaves as described.

## 4. Verify persisted state (for settings-type features)

Settings are stored in `localStorage` via the `useLocalStorage` hook in
`App.jsx` and, for theme-like flags, mirrored onto the `<body>` as a
`data-*` attribute (e.g. `data-theme`, `data-colorblind`,
`data-reduced-motion`). Verify both are written when you toggle the control:

```js
// run in the browser console after toggling the setting on
JSON.stringify({
  ls: localStorage.getItem('<storage-key>'),        // e.g. 'reduced-motion'
  attr: document.body.getAttribute('data-<attr>'),  // e.g. 'data-reduced-motion'
});
// expect: {"ls":"true","attr":"true"}
```

Then **reload the page** and re-run the same snippet. The values must still be
present — this proves the setting survives a refresh and is re-applied on mount.

## Notes

- The repo has **no CI configured**; these local checks are the only gate.
- Storage keys are the first argument to `useLocalStorage(...)` in `App.jsx`
  (e.g. `'hard-mode'`, `'colorblind-mode'`, `'reduced-motion'`, `'theme'`,
  `'gameStats'`, `'boardState'`). The body attribute (if any) is set in the
  matching `useEffect` in `App.jsx`.
- Only flags that are mirrored to a `data-*` attribute have an `attr` to check;
  purely stateful settings only need the `localStorage` check.
