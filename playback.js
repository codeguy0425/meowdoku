const Playback = {
  steps: [],
  current: -1,
  playing: false,
  timer: null,
  cols: 6,

  init(steps, cols) {
    this.steps = steps;
    this.cols = cols;
    this.current = -1;
    this.playing = false;
    if (this.timer) clearTimeout(this.timer);
    document.getElementById('btnPlay').textContent = '\u25B6';
    document.getElementById('emptyState').style.display = 'none';
    const sc = document.getElementById('solverContent');
    sc.style.display = 'flex';
    this.renderStepList();
    this.updateUI();
  },

  renderStepList() {
    const el = document.getElementById('stepList');
    el.innerHTML = '';
    this.steps.forEach((step, i) => {
      const div = document.createElement('div');
      div.className = 'step-item';
      div.innerHTML = '<span class="step-num">#' + (i+1) + '</span><span class="step-type">' + step.type + '</span><div class="step-desc">' + step.explanation + '</div>';
      div.onclick = () => this.goTo(i);
      el.appendChild(div);
    });
  },

  goTo(idx) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.current = idx;
    this.renderGrid(idx);
    this.updateUI();
    document.querySelectorAll('.step-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    const active = document.querySelector('.step-item.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const step = this.steps[idx];
    if (step && step.type === 'Solved') {
      setTimeout(() => this.showComplete(step.explanation), 400);
    }
  },

  renderGrid(idx) {
    const step = this.steps[idx];
    const board = step.boardState;
    const tds = document.querySelectorAll('table.grid td');
    tds.forEach(td => {
      td.className = '';
      const r = parseInt(td.dataset.r), c = parseInt(td.dataset.c);
      const val = board[r][c];
      if (val === 1) td.className = 'solved-cat';
      else if (val === 2) td.className = 'solved-x';
      td.textContent = val === 1 ? '\uD83D\uDC31' : val === 2 ? '\u2715' : '';
      td.style.background = Editor.regionColor(state.regions[r][c]);
    });
    if (step.highlight) {
      step.highlight.cells.forEach(([r, c]) => {
        const td = tds[r * this.cols + c];
        if (!td) return;
        if (step.highlight.type === 'cat') td.className = 'solved-cat highlight-cat';
        else if (step.highlight.type === 'x') td.className = 'solved-x highlight-x';
        else td.classList.add('highlight-' + step.highlight.type);
      });
    }
  },

  updateUI() {
    const total = this.steps.length;
    const cur = this.current + 1;
    document.getElementById('stepCounter').textContent = cur + ' / ' + total;
    document.getElementById('btnFirst').disabled = this.current <= 0;
    document.getElementById('btnPrev').disabled = this.current <= 0;
    document.getElementById('btnNext').disabled = this.current >= total - 1;
    document.getElementById('btnLast').disabled = this.current >= total - 1;
  },

  first() { this.goTo(0); },
  last() { this.goTo(this.steps.length - 1); },
  prev() { this.goTo(this.current - 1); },
  next() { this.goTo(this.current + 1); },

  toggle() {
    this.playing = !this.playing;
    document.getElementById('btnPlay').textContent = this.playing ? '\u23F8' : '\u25B6';
    if (this.playing) this.playStep();
    else if (this.timer) clearTimeout(this.timer);
  },

  playStep() {
    if (!this.playing) return;
    if (this.current >= this.steps.length - 1) {
      this.playing = false;
      document.getElementById('btnPlay').textContent = '\u25B6';
      return;
    }
    this.next();
    const speed = 11 - parseInt(document.getElementById('speedSlider').value);
    this.timer = setTimeout(() => this.playStep(), speed * 180);
  },

  showComplete(msg) {
    document.getElementById('completeMsg').textContent = msg || 'All cats placed. No two cats touch!';
    document.getElementById('completeModal').classList.add('show');
  },

  dismissComplete() {
    document.getElementById('completeModal').classList.remove('show');
  }
};
