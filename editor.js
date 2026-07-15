const COLORS = [
  '#fce4ec','#e3f2fd','#e8f5e9','#fff8e1','#f3e5f5',
  '#e0f2f1','#fbe9e7','#ede7f6','#e1f5fe','#f1f8e9',
  '#fff3e0','#e8eaf6','#e0f7fa','#f9fbe7','#dbeafe',
  '#fce4ec','#ede7f6','#e0f2f1','#fff8e1','#f3e5f5',
  '#e8f5e9','#ede7f6','#e1f5fe','#fff3e0','#e0f7fa',
  '#e3f2fd','#f1f8e9','#e0f7fa','#fffde7','#fce4ec'
];

const state = {
  rows: 6, cols: 6,
  regions: [],
  cats: [],
  xMarks: [],
  mode: 'region',
  activeRegion: 0,
  maxRegions: 6,
  modalMode: 'import'
};

const Editor = {
  init() {
    this.resize();
  },

  regionColor(id) {
    return COLORS[((id % COLORS.length) + COLORS.length) % COLORS.length];
  },

  make2D(rows, cols, val) {
    return Array.from({length: rows}, () => Array(cols).fill(val));
  },

  resize() {
    state.rows = Math.max(3, Math.min(20, parseInt(document.getElementById('gridRows').value) || 6));
    state.cols = Math.max(3, Math.min(20, parseInt(document.getElementById('gridCols').value) || 6));
    const nr = this.make2D(state.rows, state.cols, -1);
    const nc = this.make2D(state.rows, state.cols, false);
    const nx = this.make2D(state.rows, state.cols, false);
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++) {
        if (state.regions[r] && state.regions[r][c] != null) nr[r][c] = state.regions[r][c];
        if (state.cats[r] && state.cats[r][c]) nc[r][c] = true;
        if (state.xMarks[r] && state.xMarks[r][c]) nx[r][c] = true;
      }
    state.regions = nr;
    state.cats = nc;
    state.xMarks = nx;
    this.recalcMax();
    this.renderPalette();
    this.renderGrid();
    this.updateLegend();
    this.clearSolver();
    this.status('Board: ' + state.rows + 'x' + state.cols);
  },

  recalcMax() {
    let mx = 0;
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++)
        if (state.regions[r][c] >= mx) mx = state.regions[r][c] + 1;
    state.maxRegions = Math.min(mx + 1, COLORS.length);
  },

  renderPalette() {
    const el = document.getElementById('regionPalette');
    el.innerHTML = '';
    for (let i = 0; i < state.maxRegions; i++) {
      const btn = document.createElement('button');
      btn.style.background = this.regionColor(i);
      if (i === state.activeRegion) btn.classList.add('active');
      btn.title = 'Region ' + i;
      btn.onclick = () => { state.activeRegion = i; this.renderPalette(); };
      el.appendChild(btn);
    }
    const add = document.createElement('button');
    add.style.background = '#ddd';
    add.textContent = '+';
    add.style.fontSize = '.8rem';
    add.style.fontWeight = '700';
    add.title = 'Add region';
    add.onclick = () => { if (state.maxRegions < COLORS.length) { state.maxRegions++; state.activeRegion = state.maxRegions - 1; this.renderPalette(); } };
    el.appendChild(add);
  },

  renderGrid() {
    const w = document.getElementById('gridWrapper');
    let h = '<table class="grid">';
    for (let r = 0; r < state.rows; r++) {
      h += '<tr>';
      for (let c = 0; c < state.cols; c++) {
        const rid = state.regions[r][c];
        const bg = rid >= 0 ? this.regionColor(rid) : '#f5f5f5';
        let cls = '', txt = '';
        if (state.cats[r][c]) { cls = 'cat'; txt = '\uD83D\uDC31'; }
        else if (state.xMarks[r][c]) { cls = 'x-mark'; txt = '\u2715'; }
        h += '<td data-r="' + r + '" data-c="' + c + '" style="background:' + bg + '" class="' + cls + '" onclick="Editor.click(' + r + ',' + c + ')" oncontextmenu="Editor.rightClick(event,' + r + ',' + c + ')">' + txt + '</td>';
      }
      h += '</tr>';
    }
    h += '</table>';
    w.innerHTML = h;
  },

  click(r, c) {
    switch (state.mode) {
      case 'region':
        state.regions[r][c] = state.activeRegion;
        state.cats[r][c] = false;
        state.xMarks[r][c] = false;
        break;
      case 'cat':
        state.cats[r][c] = !state.cats[r][c];
        if (state.cats[r][c]) state.xMarks[r][c] = false;
        break;
      case 'x':
        state.xMarks[r][c] = !state.xMarks[r][c];
        if (state.xMarks[r][c]) state.cats[r][c] = false;
        break;
      case 'erase':
        state.cats[r][c] = false;
        state.xMarks[r][c] = false;
        state.regions[r][c] = -1;
        break;
    }
    this.renderGrid();
  },

  rightClick(e, r, c) {
    e.preventDefault();
    state.xMarks[r][c] = !state.xMarks[r][c];
    if (state.xMarks[r][c]) state.cats[r][c] = false;
    this.renderGrid();
  },

  setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('#editModeBtns button').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  },

  updateLegend() {
    const used = new Set();
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++)
        if (state.regions[r][c] >= 0) used.add(state.regions[r][c]);
    const el = document.getElementById('legendArea');
    let h = '';
    [...used].sort((a,b)=>a-b).forEach(id => {
      h += '<span><span class="dot" style="background:' + this.regionColor(id) + '"></span>R' + id + '</span>';
    });
    el.innerHTML = h;
  },

  clear() {
    state.regions = this.make2D(state.rows, state.cols, -1);
    state.cats = this.make2D(state.rows, state.cols, false);
    state.xMarks = this.make2D(state.rows, state.cols, false);
    this.renderGrid();
    this.clearSolver();
    this.status('Board cleared');
  },

  clearSolver() {
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('solverContent').style.display = 'none';
    document.getElementById('stepList').innerHTML = '';
    document.getElementById('stepCounter').textContent = '0 / 0';
  },

  showImport() {
    state.modalMode = 'import';
    document.getElementById('modalTitle').textContent = 'Import Puzzle (JSON)';
    document.getElementById('modalAction').textContent = 'Import';
    document.getElementById('modalTextarea').value = JSON.stringify({
      rows: state.rows, cols: state.cols,
      regions: state.regions, cats: state.cats, xMarks: state.xMarks
    }, null, 2);
    document.getElementById('importModal').classList.add('show');
  },

  showExport() {
    state.modalMode = 'export';
    document.getElementById('modalTitle').textContent = 'Export Puzzle (JSON)';
    document.getElementById('modalAction').textContent = 'Copy to Clipboard';
    document.getElementById('modalTextarea').value = JSON.stringify({
      rows: state.rows, cols: state.cols,
      regions: state.regions, cats: state.cats, xMarks: state.xMarks
    }, null, 2);
    document.getElementById('importModal').classList.add('show');
  },

  closeModal() {
    document.getElementById('importModal').classList.remove('show');
  },

  modalAction() {
    if (state.modalMode === 'import') {
      try {
        const data = JSON.parse(document.getElementById('modalTextarea').value);
        if (data.rows && data.cols && data.regions) {
          this.importData(data);
          this.closeModal();
        }
      } catch (e) { alert('Invalid JSON: ' + e.message); }
    } else {
      const ta = document.getElementById('modalTextarea');
      navigator.clipboard.writeText(ta.value).then(() => this.status('Copied!')).catch(() => { ta.select(); document.execCommand('copy'); this.status('Copied!'); });
      this.closeModal();
    }
  },

  importData(data) {
    state.rows = data.rows;
    state.cols = data.cols;
    document.getElementById('gridRows').value = data.rows;
    document.getElementById('gridCols').value = data.cols;
    state.regions = data.regions;
    state.cats = data.cats || this.make2D(data.rows, data.cols, false);
    state.xMarks = data.xMarks || this.make2D(data.rows, data.cols, false);
    this.recalcMax();
    this.renderPalette();
    this.renderGrid();
    this.updateLegend();
    this.clearSolver();
    this.status('Puzzle loaded (' + data.rows + 'x' + data.cols + ')');
  },

  status(msg) {
    document.getElementById('statusText').textContent = msg;
  }
};

const Solve = {
  run() {
    const regions = state.regions.map(r => [...r]);
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++)
        if (regions[r][c] < 0) { alert('Cell (' + r + ',' + c + ') has no region. Paint all cells first.'); return; }
    const regionSet = new Set();
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++)
        regionSet.add(regions[r][c]);
    if (regionSet.size !== state.rows)
      if (!confirm('Board is ' + state.rows + 'x' + state.cols + ' with ' + regionSet.size + ' regions (expected ' + state.rows + '). Continue?')) return;
    const solver = new MeowdokuSolver(state.rows, state.cols, regions, state.cats, state.xMarks);
    const result = solver.solve();
    Playback.init(result.steps, state.cols);
    const info = document.getElementById('statusInfo');
    info.textContent = result.solved ? '\u2713 Solved in ' + result.steps.length + ' steps' : '\u2717 Stuck (' + result.steps.length + ' steps)';
    Editor.status(result.solved ? 'Puzzle solved!' : 'Solver stuck');
  }
};

document.addEventListener('DOMContentLoaded', () => Editor.init());

function GenerateAndLoad() {
  const rows = state.rows, cols = state.cols;
  Editor.status('Generating puzzle...');
  setTimeout(() => {
    const puzzle = Generator.generate(rows, cols);
    if (!puzzle) { Editor.status('Generation failed — try a smaller board'); return; }
    Editor.importData(puzzle);
    Editor.status('Puzzle generated! Hit Solve to see the solution.');
  }, 50);
}
