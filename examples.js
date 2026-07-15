const EXAMPLES = {
  5: {
    rows: 5, cols: 5,
    regions: [
      [0, 0, 1, 1, 2],
      [0, 0, 1, 2, 2],
      [3, 3, 1, 2, 2],
      [3, 3, 4, 4, 2],
      [3, 4, 4, 4, 4]
    ],
    cats: [
      [true,false,false,false,false],
      [false,false,false,false,false],
      [false,false,false,false,false],
      [false,false,false,false,false],
      [false,false,false,true,false]
    ],
    xMarks: false
  },
  6: {
    rows: 6, cols: 6,
    regions: [
      [0, 0, 0, 1, 1, 2],
      [0, 0, 0, 1, 1, 2],
      [0, 3, 3, 1, 2, 2],
      [3, 3, 3, 4, 2, 2],
      [3, 5, 5, 4, 4, 2],
      [5, 5, 5, 4, 4, 4]
    ],
    cats: [
      [false,false,true,false,false,false],
      [false,false,false,false,true,false],
      [false,false,false,false,false,false],
      [false,false,false,false,false,true],
      [false,false,false,false,false,false],
      [true,false,false,false,false,false]
    ],
    xMarks: false
  },
  7: {
    rows: 7, cols: 7,
    regions: [
      [0, 0, 0, 1, 1, 2, 2],
      [0, 5, 0, 1, 1, 2, 2],
      [5, 5, 3, 3, 4, 4, 2],
      [5, 5, 3, 3, 4, 4, 6],
      [5, 5, 3, 3, 4, 4, 6],
      [5, 5, 3, 6, 6, 6, 6],
      [5, 5, 6, 6, 6, 6, 6]
    ],
    cats: [
      [true,false,false,false,false,false,false],
      [false,false,false,true,false,false,false],
      [false,false,false,false,false,false,false],
      [false,false,true,false,false,false,false],
      [false,false,false,false,true,false,false],
      [false,false,false,false,false,false,false],
      [false,false,false,false,false,true,false]
    ],
    xMarks: false
  }
};

function make2D(rows, cols, val) {
  return Array.from({length: rows}, () => Array(cols).fill(val));
}

const Examples = {
  load(size) {
    const ex = EXAMPLES[size];
    if (!ex) return;
    const rows = ex.rows, cols = ex.cols;
    const data = {
      rows, cols,
      regions: ex.regions,
      cats: ex.cats ? ex.cats : make2D(rows, cols, false),
      xMarks: ex.xMarks ? ex.xMarks : make2D(rows, cols, false)
    };
    Editor.importData(data);
  }
};
