const Generator = {
  generate(rows, cols) {
    const solution = this.findSolution(rows, cols);
    if (!solution) return null;
    const regions = this.growRegions(rows, cols, solution);
    const hints = this.makeHints(rows, cols, solution, regions);
    return { rows, cols, regions, cats: hints.cats, xMarks: hints.xMarks };
  },

  findSolution(rows, cols) {
    const cats = [];
    const usedCols = new Set();
    const placed = [];

    const canPlace = (r, c) => {
      if (usedCols.has(c)) return false;
      for (const [pr, pc] of placed) {
        if (Math.abs(pr - r) <= 1 && Math.abs(pc - c) <= 1) return false;
      }
      return true;
    };

    const solve = (row) => {
      if (row === rows) return true;
      const order = this.shuffle([...Array(cols).keys()]);
      for (const c of order) {
        if (canPlace(row, c)) {
          placed.push([row, c]);
          usedCols.add(c);
          if (solve(row + 1)) return true;
          placed.pop();
          usedCols.delete(c);
        }
      }
      return false;
    };

    return solve(0) ? placed : null;
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  growRegions(rows, cols, solution) {
    const regionMap = Array.from({length: rows}, () => Array(cols).fill(-1));
    const catSet = new Set(solution.map(([r,c]) => r+','+c));

    solution.forEach(([r, c], idx) => {
      regionMap[r][c] = idx;
    });

    const queue = solution.map(([r, c], idx) => [r, c, idx]);
    this.shuffle(queue);

    while (queue.length > 0) {
      const [cr, c, rid] = queue.shift();
      const dirs = this.shuffle([[0,1],[0,-1],[1,0],[-1,0]]);
      for (const [dr, dc] of dirs) {
        const nr = cr + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && regionMap[nr][nc] === -1) {
          regionMap[nr][nc] = rid;
          queue.push([nr, nc, rid]);
        }
      }
    }
    return regionMap;
  },

  makeHints(rows, cols, solution, regions) {
    const cats = Array.from({length: rows}, () => Array(cols).fill(false));
    const xMarks = Array.from({length: rows}, () => Array(cols).fill(false));
    const hintCount = Math.max(2, Math.floor(rows * 0.4));

    const indices = this.shuffle([...Array(rows).keys()]);
    for (let i = 0; i < hintCount && i < indices.length; i++) {
      const [r, c] = solution[indices[i]];
      cats[r][c] = true;
    }

    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (cats[r][c]) continue;
        for (const [sr, sc] of solution) {
          if (cats[sr][sc] && Math.abs(sr - r) <= 1 && Math.abs(sc - c) <= 1 && !(sr===r && sc===c)) {
            xMarks[r][c] = true; break;
          }
        }
      }

    return { cats, xMarks };
  }
};
