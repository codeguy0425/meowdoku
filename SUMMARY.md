# Meowdoku Solver/Editor/Generator

A client-side HTML/JS tool for Meowdoku — a cat-placement logic puzzle.

## Rules

- One cat per row, per column, per colored region
- No two cats touch (horizontally, vertically, or diagonally)

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main entry — layout with header, grid editor, solver panel, modals |
| `styles.css` | All CSS — region colors, solver highlights, playback controls, completion overlay |
| `editor.js` | Grid editor — click-to-paint regions/cats/X, mode switching, import/export JSON, `GenerateAndLoad()` |
| `solver.js` | `MeowdokuSolver` class — hidden singles (row/col/region), forced X, `validateBoard()` |
| `playback.js` | Step-by-step replay — play/pause, speed slider, step list highlights, completion modal |
| `examples.js` | 3 pre-built puzzles (5x5, 6x6, 7x7) all verified solvable |
| `generator.js` | Puzzle generator — `findSolution()` (backtracking), `growRegions()` (BFS flood-fill), `makeHints()` (~40% starter cats + diagonal X marks) |
| `meowdoku_solver.html` | **Standalone alternative** — dark-themed single-file dashboard with advanced solver (exclusions → singletons → intersection → adjacency trap → backtrack) |

## Solver Techniques

### My version (`solver.js`)

1. **Hidden singles** — if a row/col/region has only 1 empty cell, place cat there
2. **Forced X** — if a row/col/region is full, block remaining cells

### User's version (`meowdoku_solver.html`)

1. **Exclusions** — block row, col, region, and 8 neighbors
2. **Singletons** — same as above but checks region → row → col order
3. **Intersection** — if a region's open cells all sit in one row/col, block that row/col elsewhere
4. **Adjacency trap** — sandbox simulation: placing a cat that starves another region → block it
5. **Backtrack** — MRV heuristic guess + rollback on contradiction with state snapshots

## Features

- **Editor** — paint regions, cats, and blocked cells via click
- **Import/Export** — JSON config paste/load
- **Generate** — BFS region flood-fill + backtracking solver + hint placement
- **Playback** — animated step-by-step replay with speed control
- **Completion modal** — validates all 4 rules before showing success

## Status

- `meowdoku_solver.html` is the new starting point (uploaded by user)
- Multi-file version (index.html + JS/CSS) is the older approach
- Decision pending: enhance standalone file or merge approaches

## Created

July 16, 2026
