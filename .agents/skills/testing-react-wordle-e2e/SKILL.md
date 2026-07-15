---
name: testing-react-wordle-e2e
description: >-
  Verify the react-wordle app end-to-end in a real browser: start the dev
  server, drive the UI with Playwright over the running Chrome's CDP endpoint,
  and assert a Settings toggle sets its body attribute, persists to
  localStorage, survives a reload, and affects gameplay. Use when validating a
  UI feature (especially a Settings toggle) in this repo before/after a PR.
---

# Testing react-wordle end-to-end

Drives the app in Devin's already-running Chrome (no separate browser install)
and asserts behavior + persistence. The helper script lives next to this file:
`verify_e2e.mjs`.

## Prerequisites / gotchas
- Use **npm only** (per AGENTS.md).
- Devin's Chrome runs with `--remote-debugging-port=0` (random port). Do NOT
  assume `localhost:29229` — read the real port from
  `~/.browser_data_dir/DevToolsActivePort` (first line). The script does this
  automatically and falls back to `CDP_URL` if set.
- `playwright-core` exports CommonJS; import via `createRequire`, not a named
  ESM import (`import { chromium } from 'playwright-core'` fails).
- A welcome/info modal auto-opens on a fresh board and intercepts clicks — close
  any open modal (button matching `[class*="modalContainer"] [class*="close"]`)
  before interacting.
- The Settings gear is the **last** `header button`. Each setting is a row whose
  `Switch` is a hidden checkbox + `<label>`; click the `<label>` to toggle.
- `aback` is a valid guess word (from `src/constants/validGuesses.js`) — handy
  to trigger a completed row / reveal.

## Procedure
1. Start the dev server (leave it running in the background):
   ```bash
   cd /home/ubuntu/repos/react-wordle && BROWSER=none npm run start
   ```
   Wait until `http://localhost:3000` returns 200.
2. Install the Playwright client in a scratch dir (not the repo):
   ```bash
   cd /tmp && npm init -y >/dev/null && npm install playwright-core
   ```
3. Run the verifier from the scratch dir so it resolves `playwright-core`:
   ```bash
   node /home/ubuntu/repos/react-wordle/.agents/skills/testing-react-wordle-e2e/verify_e2e.mjs
   ```
   Expect `ALL CHECKS PASSED`. Screenshots are written to
   `/tmp/e2e_01_settings.png`, `/tmp/e2e_02_on.png`, `/tmp/e2e_03_guess.png` —
   read them to visually confirm and attach to the user.
4. Stop the dev server when done (`pkill -f "react-scripts start"`).

## Adapting to a different feature
Override via env vars (defaults target the Reduced Motion feature):
- `SETTING_LABEL` — the row's visible text (e.g. `"Hard Mode"`).
- `SETTING_KEY` — the localStorage key (e.g. `hard-mode`, `colorblind-mode`, `theme`).
- `BODY_ATTR` — the `document.body` attribute the setting toggles
  (e.g. `data-colorblind`, `data-theme`); omit/adjust the gameplay assertions in
  step 3 of the script if the feature doesn't touch cell reveal.
Example:
```bash
SETTING_LABEL="Colorblind Mode" SETTING_KEY=colorblind-mode BODY_ATTR=data-colorblind node verify_e2e.mjs
```

## What it asserts (Reduced Motion default)
- The toggle row renders in the Settings modal.
- Toggling ON → `body[data-reduced-motion]="true"` and
  `localStorage["reduced-motion"]="true"`.
- After a guess, a `Cell_reveal` cell has `animationName: none` but a non-transparent
  background (flip disabled, status color preserved).
- Setting survives a full page reload.
- Toggling OFF → attribute removed, `localStorage` value `"false"`.
