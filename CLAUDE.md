# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla HTML/CSS/JS tool in two files: `index.html` (all logic and UI) plus `db-flotte.js` (the data: aircraft performance, airfields, SVG icons — loaded via `<script src>`, must sit next to the HTML). It calculates takeoff/landing performance (ground roll, distance to clear 15 m, margin vs. runway length) for the aircraft fleet of the Aéroclub de Haguenau, for personal flight planning by the pilot. There is no build system, package manager, or test suite; it's meant to be opened directly in a browser (double-click) or served from a static file server.

The rest of the folder is reference material the tool's data was manually transcribed from — aircraft flight manuals (PDF), VAC chart PDFs (`AD-2.*.pdf`, from the SIA eAIP) for LFSH and the surrounding airfields in the database, cropped performance-table screenshots, and aircraft photo thumbnails in `images avions/`. None of it is consumed programmatically at runtime; treat it as source documentation, not app assets, except for the `images avions/*.png` files which the HTML does load directly.

## Running / previewing

No build step.

- Open `index.html` directly in a browser (`file://`).
- Or serve the folder statically, e.g. `python -m http.server 8744`, then browse to `http://localhost:8744/` — more reliable for the relative `images avions/...` paths and needed if testing in a sandboxed browser tool that blocks `file://` navigation.

The entry point is named `index.html` (rather than something descriptive) because the repo is deployed on Vercel, which serves `index.html` by default at the site root. Don't rename it. (GitHub Pages is not enabled on the repo; it would have the same requirement if it ever were.)

There is no linter or automated test suite. Verify changes by opening the file in a browser, exercising the UI (change aircraft/airport/weather inputs, check the recomputed results and the runway SVG), and checking the browser console for errors.

## Architecture

Single-page app, no framework, no external JS dependencies. **All data lives in `db-flotte.js`**, which defines `window.PERF_DB = { aircraft, airfields, icons }` and carries a documented field-by-field format header (including "how to add an aircraft/airfield"). It is deliberately a `.js` file, not `.json`: `fetch()` of a local JSON is blocked under `file://`, whereas `<script src>` works both double-clicked and served. The `aircraft` and `airfields` sections are kept strictly JSON-pure (double-quoted, no comments) so they could migrate to a real `.json` if the tool ever goes server-only; `icons` uses JS template literals (multi-line SVG). The HTML's main script computes a `DB_OK` guard at startup: if `db-flotte.js` is missing/invalid, a red banner is injected and `recompute()`/`onAirportChange()` no-op instead of throwing.

Structure of the HTML `<script>` block, top to bottom:

- **`PERF_DB.aircraft`** (in `db-flotte.js`, aliased to `AIRCRAFT`) — one entry per fleet aircraft (`wt9_ulm`, `wt9_lsa`, `ps28`, `c172`, `pa28`, `tetras`, `savannah`). Each entry has: reference performance (`takeoff`/`landing`, each split by `paved`/`grass`, `null` when the source manual doesn't cover that surface), the manual's reference *condition* (`ref: {elevFt, tempC, headwindKt}` — **not always sea-level/ISA/zero-wind**: the WT9 LSA and PA-28 entries are anchored to a worked example lifted from their manual instead of a clean reference table), flap settings, MTOW, a `source` citation, an optional `note` shown in the UI as a caveat, an `icon` key (into `PERF_DB.icons`), and a `photo` path (into `images avions/`). The aircraft `<select>` is built dynamically from these keys (`buildAircraftPicker`).
- **Correction model (`conditionFactor` / `correctionFactor`)** — one generic multiplicative model (pressure altitude, ISA temperature deviation, headwind/tailwind) applied to every aircraft, computed *relative to that aircraft's own reference condition*, not always sea level. This is a deliberate simplification: only the WT9 ULM manual provides real correction factors (from its aerotow section, extrapolated to solo flight), so the same factors are reused for every other aircraft and this is disclosed to the user in the in-page "Méthode de calcul" panel (built in `recompute()`). Keep that disclosure in sync if the model changes.
- **Slope correction (`slopeFactor`)** — separate from the model above and applied to the **ground roll only**, since the airborne part of the 15 m distance doesn't care about the gradient of the asphalt; `computeSide` therefore rebuilds `dist15` as *corrected roll + airborne segment* instead of scaling it. `roll = V²/2a`, and a gradient shifts the acceleration by `g·sin θ ≈ 0.1·slope%`, giving `1.5/(1.5 − 0.1·slope)` for takeoff and `1.5/(1.5 + 0.1·slope)` for landing. The `1.5` (`ACCEL`) is one assumed m/s² for every aircraft and both manoeuvres — the weakest assumption in the tool, and the only correction that *shortens* distances, so it is disclosed at length in the method panel. Driven by the per-runway `slopePct` in the DB, signed uphill-positive in the direction of travel; the two thresholds of one runway carry the same figure with opposite signs.
- **`PERF_DB.airfields`** (in `db-flotte.js`, aliased to `AIRFIELDS`) — per-airfield data keyed by ICAO code (LFSH plus the surrounding Alsace/Lorraine fields, each transcribed from its SIA VAC chart cited in the entry's documentary `source` field; `remarks` holds non-displayed caveats like "usage restreint"): `name`, `elevFt`, optional `preferredRunway`/`preferredNote` (drives the "(QFU préférentiel bruit)" suffix on the wind-based runway suggestion), and `runways` as an **array** of `{num, recip, qfu, surface, toda, lda, slopePct?}`. It must stay an array: with an object, integer-like keys such as `"21"` get reordered before `"03"` by JS property-ordering rules. Array order = display order, and suggestion ties go to the first declared runway. The runway `<select>` uses the **array index** as its value, not `num` — `num` is not unique (LFGA has a paved 01/19 and a grass 01/19). `toda`/`lda` of `0` means the manoeuvre is not authorized on that QFU (e.g. LFSB RWY 07 has no published LDA): `recompute()` then renders a red "non autorisé" badge via `renderProhibited` instead of computing. Airport and runway `<select>`s are built dynamically (`buildAirportPicker`/`buildRunwayPicker`); adding an airfield to the DB is enough to surface it in the UI. "Terrain personnalisé" mode bypasses all of it with free-form fields and derives runway numbers from the entered QFU (`runwayNumbersFromQFU`) — it has no slope field, so a custom field is always assumed flat. An `altiport: true` flag (LFLJ Courchevel, LFHM Megève) swaps the wind-based suggestion for the VAC's imposed direction — which those `toda`/`lda` zeros already encode, so it is derived, not restated — and shows the orange `renderAltiportBanner` warning. On a sloping runway `elevFt` is the VAC's ALT SUP (the highest, hence most penalizing, end).
- **METAR block (`METAR_SOURCES` / `fetchMetar` / `parseMetar` / `copyMetarToForm`)** — fetches raw METAR text for a user-entered ICAO code by trying each entry of `METAR_SOURCES` in order: NOAA Aviation Weather Center (`aviationweather.gov/api/data/metar` — authoritative, but as of July 2026 it no longer sends CORS headers so browser fetches fail; kept first in case CORS is restored) then `metar.vatsim.net` (real-time rebroadcast of the same NOAA METARs, `Access-Control-Allow-Origin: *`). The block is intentionally independent of the LFSH/custom airport selector (LFSH itself has no METAR station). `parseMetar` extracts wind/temp/QNH via regex over whitespace-split tokens (order-tolerant). `copyMetarToForm` pushes parsed values into the calc inputs but deliberately never auto-copies gust speed (shown as an info note instead) or a `VRB` wind direction (left for manual entry) — preserve that behavior if touched.
- **`buildRunwaySvg`** — builds the runway diagram (asphalt/grass texture, threshold markings, centerline, runway numbers, filled bar for the corrected distance, dashed marker for distance-with-margin, red hatching if it exceeds the runway) as an SVG string injected via `innerHTML`. A non-zero `slopePct` tilts the runway to its true angle inside a rotated `<g>`, growing the viewBox height to fit the swing; labels inside that group are counter-rotated about their own anchor so they ride the runway but stay horizontal.
- **`PERF_DB.icons`** (in `db-flotte.js`, aliased to `ICONS`) — hand-drawn schematic SVG side-view silhouettes (low-wing / high-wing tricycle / high-wing STOL-taildragger / WT9), used for compact card-header icons and as the aircraft marker inside the runway SVG. The larger per-aircraft photos in `images avions/` are separate and only used in the aircraft picker's preview panel.
- **`recompute()`** — the single entry point that re-reads every input field, recomputes both takeoff and landing, and re-renders all derived DOM. All `oninput`/`onchange` handlers call it directly — there's no framework-level reactivity to route through.

## Conventions specific to this tool

- Units are mixed on purpose to match how French GA pilots read POHs and METARs: distances in **meters**, altitudes in **feet**, speeds in **knots**. Don't silently normalize a field to a different unit.
- Every number surfaced to the user should trace back to a manual citation (`source` field) or be explicitly flagged as an approximation (`note` field, or a line in the "Méthode de calcul" `<details>` panel). When adding an aircraft or a correction, prefer citing the manual section over inventing a figure — this is a real flight-planning aid, not a demo.
- Image paths use `images%20avions/...` (percent-encoded space) because the folder `images avions` has a literal space in its name.

## Working with the repo owner

The owner is a pilot and a nurse, not a professional developer, and is learning the whole toolchain through this project. Two consequences for how to work here:

- **Explain, don't just execute.** Introduce a technical term the first time it comes up (one or two sentences, concrete analogy), say what a command will do before running it and what happened after, and propose the next step rather than waiting to be asked. Keep it brief — the goal is comprehension, not a tutorial.
- **The process is part of the goal.** This project is deliberately small so that it can go the full route: code → git → GitHub → Vercel → a smartphone app. Don't skip a step because it looks trivial, and don't do it silently.

## Roadmap

The tool itself works; what remains is the rest of the chain.

1. ~~Publish on GitHub~~ — done, <https://github.com/Xavier-ctrl24/Perf-Avions>.
2. ~~Deploy on Vercel~~ — done, <https://perf-avions-3skt.vercel.app/>, auto-redeployed on every push to `main`. GitHub Pages is *not* enabled; Vercel is the only thing serving this site.
3. **Smartphone app** — not started. Intended direction: make the page installable (PWA) rather than rebuild it natively, since it's already a self-contained static page.
