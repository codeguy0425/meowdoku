---
version: 0.3
name: meowdoku-solver-design
description: Deterministic logical solver for Meowdoku (one cat per row, column, and colored region; no diagonal adjacency). Single-file HTML/JS implementation with 7+ logical rule types and fallback backtracking.
---

## Overview

Meowdoku is a constraint puzzle on an N×N grid (typically 9×9 or 10×10). Each cell belongs to a colored **region**. The solver must place exactly one **cat** per row, per column, and per region, with the additional constraint that no two cats touch — horizontally, vertically, or diagonally.

The solver applies a cascade of deterministic logical rules, each implemented as a pure function that scans the grid for a specific pattern and either places a cat or blocks a cell. Rules are ordered by cheapness (fast scans first). After each rule fires, control returns to the top of the chain. When all logical rules fail to make progress, a backtracking guess is made using the Minimum Remaining Values (MRV) heuristic — specifically, the cell minimizing `open_in_row × open_in_col × open_in_region`.

## Solver Chain

Each call to `solveNextStep()` fires exactly **one** rule from the priority-ordered chain below. If the rule returns `true` (something changed), the next call restarts from the top. If it returns `false`, the next rule in the chain is tried. When all rules return `false`, backtracking triggers.

### 0. Exclusion (from placed cats)

When a cat is placed at (r,c):
- Entire row `r` is blocked
- Entire column `c` is blocked
- Entire region `regions[r][c]` is blocked
- All 8 neighboring cells are blocked (horizontal, vertical, diagonal)

This is the most basic rule and runs first every step.

### 1. Singleton

Three independent scans:

- **Region singleton**: if any region has exactly 1 open cell left → place a cat there
- **Row singleton**: if any row has exactly 1 open cell left → place a cat there
- **Column singleton**: if any column has exactly 1 open cell left → place a cat there

### 2. Intersection

For each region: if all remaining open cells lie in a **single row** (or column), the cat for that region must be in that row. Therefore, all **other** regions can be blocked from that row — the row can't also host their cats.

### 3. Reverse Intersection

For each row (or column): if all remaining open cells belong to the **same region**, the cat for that region must be in this row/column. Therefore, that region can be blocked from all other rows/columns.

### 4. Confined Group (contiguous)

If N consecutive columns (or rows) **fully contain** exactly N regions — meaning no cell of those regions exists outside those columns — then those N regions must occupy those N columns. All **other** regions are blocked from those columns.

### 5. Confined Group (disjoint, non-contiguous)

Same logic as `#4` but for any set of N columns (not necessarily consecutive). If exactly N regions are entirely within any N columns, block other regions from those columns. Computed via bitmask iteration over all column/row subsets (2^N, trivially fast for N≤10).

### 6. Adjacent Pair Block (region-based)

If a region's remaining 2–3 open cells form a contiguous line (2×1 or 3×1, horizontally or vertically), both/all possible cat placements share certain neighbor cells. Those cells are blocked unconditionally:

| Shape | Orientation | Cells blocked |
|---|---|---|
| 2×1 | Horizontal | Row above (both cols), row below (both cols) — 4 cells |
| 2×1 | Vertical | Left col (both rows), right col (both rows) — 4 cells |
| 3×1 | Horizontal | Middle col, row above and below — 2 cells |
| 3×1 | Vertical | Middle row, left and right col — 2 cells |

### 7. Adjacent Pair Block (row/col-based)

If a row (or column) has exactly 2–3 adjacent open cells (regardless of their regions), same neighbor-blocking logic applies. This catches pairs the region-based check misses because the two cells belong to different regions.

### 8. Adjacency Trap

For each open cell, simulate placing a cat there and running basic exclusions. If any unfinished region ends up with zero open cells, that placement is impossible → block the tested cell. Named "adjacency trap" because placing a cat affects its neighbors, potentially strangling an adjacent region.

### 9. Backtrack Guess

When all logical rules stall, pick the open cell with the smallest score = `open_in_row × open_in_col × open_in_region` (MRV product heuristic). Save state, place a cat, continue. If contradiction is detected later, roll back, block that cell, and retry.

## Rule Ordering Principles

- **Cheapest first**: singleton scans (~100 cells) before intersection (~1000 cells with per-region loops) before confined group (~10K subsets) before adjacency trap (~10K simulations)
- **Most effective first**: intersection and singleton catch the majority of deductions in most puzzles
- **Restart on change**: after any rule fires, the next step starts from rule 0 — this handles cascading effects naturally

## Cost Profile (10×10 grid)

| Rule | Approximate cost per call |
|---|---|
| Exclusion | O(N²) = 100 |
| Singleton | O(N²) = 100 |
| Intersection | O(R × N²) ≈ 10 × 100 = 1,000 |
| Reverse intersection | O(N × N²) ≈ 10 × 100 = 1,000 |
| Confined group (contiguous) | O(N² × N²) ≈ 100 × 100 = 10,000 |
| Confined group (disjoint) | O(2^N × N²) ≈ 1,024 × 100 = 102,400 |
| Adjacent pair (region) | O(R × N²) ≈ 10 × 100 = 1,000 |
| Adjacent pair (row/col) | O(N × N) ≈ 20 × 10 = 200 |
| Adjacency trap | O(N² × R × N²) ≈ 100 × 10 × 100 = 100,000 |
| Backtrack guess | O(N²) = 100 |

Most puzzles solve in 10–50 logical steps. Backtracking is rarely needed (observed only on puzzles with weak initial constraints), and when needed, typically completes within 1–3 guesses.

## Architecture

Single-file implementation (`index.html`):

- **State**: 2D array `grid[N][N]` where values are `0` (open), `1` (cat), `2` (blocked)
- **Regions**: 2D array `regions[N][N]` of integer region IDs (immutable after load)
- **Rules**: each is a `function run*()` returning `boolean` (true if grid was modified)
- **UI**: `renderGrid()` redraws the board, `logMessage()` appends to the step log
- **Step history**: `stepHistory[]` stores past grid states for undo
- **Backtrack stack**: `historyStack[]` stores pre-guess snapshots for rollback

## Do's and Don'ts

### Do
- Keep each rule as a pure scan — no shared state between rules
- Order rules by cheapness; singleton first, adjacency trap last
- Restart from the top after any change — cascading effects matter
- Use MRV product heuristic for backtrack guesses (row × col × region open counts)

### Don't
- Don't nest rule calls inside each other — each step fires one rule
- Don't skip singleton re-checks after a block — a single block often creates a singleton
- Don't merge contiguous and disjoint confined groups without the subset iteration logic — the contiguous-only check misses valid deductions
- Don't let adjacent pair block starve below adjacency trap — the trap is expensive and should be last
