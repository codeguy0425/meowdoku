class MeowdokuSolver {
  constructor(rows, cols, regions, cats, xMarks) {
    this.rows = rows;
    this.cols = cols;
    this.regions = regions;
    this.steps = [];
    this.board = Array.from({length: rows}, (_, r) =>
      Array.from({length: cols}, (_, c) => cats[r][c] ? 1 : xMarks[r][c] ? 2 : 0)
    );
    this.candidates = Array.from({length: rows}, () =>
      Array.from({length: cols}, () => true)
    );
    this.regionCells = {};
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const rid = regions[r][c];
        if (!this.regionCells[rid]) this.regionCells[rid] = [];
        this.regionCells[rid].push([r, c]);
      }
    this.numRegions = Object.keys(this.regionCells).length;
  }

  cloneBoard() { return this.board.map(r => [...r]); }

  addStep(type, explanation, highlight) {
    this.steps.push({
      type, explanation,
      boardState: this.cloneBoard(),
      highlight: highlight || null
    });
  }

  countRowCands(r) {
    let n = 0;
    for (let c = 0; c < this.cols; c++)
      if (this.candidates[r][c] && this.board[r][c] === 0) n++;
    return n;
  }

  countColCands(c) {
    let n = 0;
    for (let r = 0; r < this.rows; r++)
      if (this.candidates[r][c] && this.board[r][c] === 0) n++;
    return n;
  }

  countRegionCands(rid) {
    let n = 0;
    for (const [r, c] of this.regionCells[rid] || [])
      if (this.candidates[r][c] && this.board[r][c] === 0) n++;
    return n;
  }

  rowHasCat(r) {
    for (let c = 0; c < this.cols; c++)
      if (this.board[r][c] === 1) return true;
    return false;
  }

  colHasCat(c) {
    for (let r = 0; r < this.rows; r++)
      if (this.board[r][c] === 1) return true;
    return false;
  }

  regionHasCat(rid) {
    for (const [r, c] of this.regionCells[rid] || [])
      if (this.board[r][c] === 1) return true;
    return false;
  }

  eliminateCandidates(r, c) {
    const cells = [];
    for (let i = 0; i < this.rows; i++)
      if (this.candidates[i][c]) { this.candidates[i][c] = false; cells.push([i, c]); }
    for (let j = 0; j < this.cols; j++)
      if (this.candidates[r][j]) { this.candidates[r][j] = false; cells.push([r, j]); }
    for (const [rr, cc] of this.regionCells[this.regions[r][c]] || [])
      if (this.candidates[rr][cc]) { this.candidates[rr][cc] = false; cells.push([rr, cc]); }
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.candidates[nr][nc]) {
          this.candidates[nr][nc] = false;
          cells.push([nr, nc]);
        }
      }
    this.candidates[r][c] = false;
    return cells;
  }

  placeCatAt(r, c, silent) {
    if (this.board[r][c] === 1) return;
    this.board[r][c] = 1;
    const elimCells = this.eliminateCandidates(r, c);
    if (!silent) {
      const rid = this.regions[r][c];
      const elimUnique = [...new Set(elimCells.map(([ar,ac]) => ar+','+ac))];
      this.addStep(
        'Place Cat',
        `Place cat at (${r},${c}) in region ${rid}. Eliminates ${elimUnique.length} candidate cells (row, column, region, diagonal).`,
        { type: 'cat', cells: [[r, c]] }
      );
      if (elimUnique.length > 0) {
        const parsedCells = elimUnique.map(s => s.split(',').map(Number));
        this.addStep(
          'Eliminate',
          `After placing cat at (${r},${c}): blocked ${parsedCells.length} cells from being cats.`,
          { type: 'elim', cells: parsedCells }
        );
      }
    }
  }

  markXAt(r, c, reason) {
    if (this.board[r][c] !== 0) return;
    this.board[r][c] = 2;
    this.candidates[r][c] = false;
    const rid = this.regions[r][c];
    const rowDone = this.rowHasCat(r);
    const colDone = this.colHasCat(c);
    const regDone = this.regionHasCat(rid);
    const reasons = [];
    if (rowDone) reasons.push('row ' + r + ' has a cat');
    if (colDone) reasons.push('col ' + c + ' has a cat');
    if (regDone) reasons.push('region ' + rid + ' has a cat');
    const why = reason || reasons.join(' and ') || 'no valid cat possible';
    this.addStep(
      'Mark X',
      `Cell (${r},${c}) cannot hold a cat: ${why}.`,
      { type: 'x', cells: [[r, c]] }
    );
  }

  solve() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.board[r][c] === 1) this.placeCatAt(r, c, true);

    if (this.steps.length === 0)
      this.addStep('Init', 'Board loaded with ' + this.rows + 'x' + this.cols + ' grid and ' + this.numRegions + ' regions. Starting analysis...', null);

    let changed = true;
    let iterations = 0;
    const maxIter = this.rows * this.cols * this.numRegions * 2;

    while (changed && iterations < maxIter) {
      changed = false;
      iterations++;

      // Hidden single in row
      for (let r = 0; r < this.rows; r++) {
        if (this.rowHasCat(r)) continue;
        const cands = [];
        for (let c = 0; c < this.cols; c++)
          if (this.candidates[r][c] && this.board[r][c] === 0) cands.push([r, c]);
        if (cands.length === 1) {
          const [cr, cc] = cands[0];
          this.addStep('Deduction', `Row ${r} has only one possible cell for a cat: (${cr},${cc}).`, { type: 'row', cells: [[cr, cc]] });
          this.placeCatAt(cr, cc);
          changed = true;
        }
      }

      // Hidden single in column
      for (let c = 0; c < this.cols; c++) {
        if (this.colHasCat(c)) continue;
        const cands = [];
        for (let r = 0; r < this.rows; r++)
          if (this.candidates[r][c] && this.board[r][c] === 0) cands.push([r, c]);
        if (cands.length === 1) {
          const [cr, cc] = cands[0];
          this.addStep('Deduction', `Column ${c} has only one possible cell for a cat: (${cr},${cc}).`, { type: 'col', cells: [[cr, cc]] });
          this.placeCatAt(cr, cc);
          changed = true;
        }
      }

      // Hidden single in region
      for (const [rid, cells] of Object.entries(this.regionCells)) {
        if (this.regionHasCat(Number(rid))) continue;
        const cands = cells.filter(([r, c]) => this.candidates[r][c] && this.board[r][c] === 0);
        if (cands.length === 1) {
          const [cr, cc] = cands[0];
          this.addStep('Deduction', `Region ${rid} has only one possible cell for a cat: (${cr},${cc}).`, { type: 'region', cells: [[cr, cc]] });
          this.placeCatAt(cr, cc);
          changed = true;
        }
      }

      // Mark forced X
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.board[r][c] !== 0 || !this.candidates[r][c]) continue;
          if (this.rowHasCat(r) || this.colHasCat(c) || this.regionHasCat(this.regions[r][c])) {
            this.markXAt(r, c);
            changed = true;
          }
        }
      }
    }

    const totalCats = this.board.flat().filter(v => v === 1).length;
    const valid = this.validateBoard();
    const solved = totalCats === this.rows && valid.ok;
    if (solved)
      this.addStep('Solved', valid.msg, null);
    else if (!changed && !valid.ok)
      this.addStep('Stuck', `Solver stuck: ${valid.msg} (${totalCats}/${this.rows} cats placed).`, null);
    else if (!changed)
      this.addStep('Stuck', `Solver stuck with ${totalCats}/${this.rows} cats. More hints needed.`, null);

    return { steps: this.steps, solved };
  }

  validateBoard() {
    const cats = [];
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.board[r][c] === 1) cats.push([r, c]);

    if (cats.length !== this.rows)
      return { ok: false, msg: `Expected ${this.rows} cats, found ${cats.length}` };

    const rowSet = new Set(), colSet = new Set(), regSet = new Set();
    for (const [r, c] of cats) {
      if (rowSet.has(r)) return { ok: false, msg: `Two cats in row ${r}` };
      if (colSet.has(c)) return { ok: false, msg: `Two cats in column ${c}` };
      const rid = this.regions[r][c];
      if (regSet.has(rid)) return { ok: false, msg: `Two cats in region ${rid}` };
      rowSet.add(r);
      colSet.add(c);
      regSet.add(rid);
    }

    for (let i = 0; i < cats.length; i++)
      for (let j = i + 1; j < cats.length; j++) {
        const dr = Math.abs(cats[i][0] - cats[j][0]);
        const dc = Math.abs(cats[i][1] - cats[j][1]);
        if (dr <= 1 && dc <= 1)
          return { ok: false, msg: `Cats at (${cats[i]}) and (${cats[j]}) are touching` };
      }

    return { ok: true, msg: `All ${cats.length} cats placed: one per row, column, region, no touching.` };
  }
}
