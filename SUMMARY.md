# Meowdoku Solver/Editor/Generator

A client-side HTML/JS tool for Meowdoku — a cat-placement logic puzzle.

## Rules

- One cat per row, per column, per colored region
- No two cats touch (horizontally, vertically, or diagonally)

## Files

| File | Purpose |
|------|---------|
| `index.html` | **Active file** — dark-themed single-file dashboard with advanced solver, color palette editor, import/export, back button, step highlights |
| `prompt.html` | AI import prompt page — copy-paste prompt for Galaxy S25 / Gemini to analyze screenshots |
| `legacy_solver.html` | Original multi-file entry (legacy) |
| `styles.css` | Legacy CSS — region colors, solver highlights, playback controls, completion overlay |
| `editor.js` | Legacy grid editor — click-to-paint regions/cats/X, mode switching |
| `solver.js` | Legacy `MeowdokuSolver` class — hidden singles, forced X, `validateBoard()` |
| `playback.js` | Legacy step-by-step replay — play/pause, speed slider, completion modal |
| `examples.js` | Legacy 3 pre-built puzzles (5x5, 6x6, 7x7) |
| `generator.js` | Legacy puzzle generator — BFS region flood-fill + backtracking solver |
| `SUMMARY.md` | This file |

## Solver Techniques (`index.html`)

1. **Exclusions** — block row, col, region, and 8 neighbors of each cat
2. **Singletons** — if a region/row/col has only 1 open cell, place cat there
3. **Intersection** — if a region's open cells all sit in one row/col, block that row/col outside the region
4. **Reverse Intersection** — if a row/col's open cells all belong to one region, block that region outside the row/col
5. **Confined Group** — if N consecutive columns (or rows) are fully confined to exactly N regions, block other regions within those columns/rows
6. **Adjacency Trap** — sandbox simulation: placing a cat that starves another region → block it
7. **Backtrack** — MRV heuristic guess + rollback on contradiction with state snapshots

## Editor Features (`index.html`)

- **Color palette toolbar** — clickable region color swatches (0-9) + Inspect/Cat/Block tools
- **Active tool highlight** — indigo outline on selected tool, label shown in toolbar
- **Import/Export JSON** — paste config to load, export current state to clipboard + textarea
- **Auto-converter** — detects Gemini color-name format (e.g. `"orange"`, `"light_green"`) and maps to numeric IDs
- **Back button** — undo last solve step with full grid snapshot history
- **Step highlights** — cells changed in the last solve step get a pulsing indigo glow

## Deployment

- **GitHub repo**: https://github.com/codeguy0425/meowdoku
- **Live site**: https://codeguy0425.github.io/meowdoku/
- **Branch**: `master` (pushes auto-deploy to GitHub Pages)
- **NOTE**: Do NOT create a `gh-pages` branch — Pages is configured to deploy from `master`

## Status

- `index.html` is the active development file
- Legacy multi-file version preserved but not actively used

## Created

July 16, 2026
