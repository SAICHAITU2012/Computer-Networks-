/* Assignment Academy — views + interactive algorithm visualisations.
   Depends on window.CN_ASSIGNMENTS (assignment.js) and window.CN_GAME. */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs, parent) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------- HUB ---------------- */
  function hub() {
    const data = window.CN_ASSIGNMENTS;
    const g = window.CN_GAME;
    const total = data.reduce((s, x) => s + x.mcqs.length + (x.coding ? x.coding.length : 0), 0);
    const solved = data.reduce((s, x) => s + x.mcqs.filter(q => window.CN_ASSIGN.isSolved(q.id)).length, 0);
    const cards = data.map(sec => {
      const done = sec.mcqs.filter(q => window.CN_ASSIGN.isSolved(q.id)).length;
      return `<a class="lec-card" style="--lc:${sec.color}" href="#/assignment/${sec.id}">
        <span class="lc-no">${sec.id}</span>
        <div class="lc-title">${esc(sec.title)}</div>
        <div class="lc-tag">${sec.mcqs.length} MCQs with verified answers${sec.coding ? ` · ${sec.coding.length} coding problems + visualisations` : ''}</div>
        <div class="lc-badges"><span class="badge ${done === sec.mcqs.length ? 'read' : ''}">${done}/${sec.mcqs.length} cracked</span>
        <span class="badge">↪ Lecture ${sec.lecture}</span></div>
      </a>`;
    }).join('');
    $('#view').innerHTML = `
      <div class="map-head" style="background:linear-gradient(135deg,#1e3a5f,#274156,#1e3a5f);background-size:300% 300%">
        <div class="mh-left"><div class="mh-lvl" style="background:radial-gradient(circle at 30% 25%,#93c5fd,#2563eb)">📝</div>
          <div><h1>Assignment Academy</h1>
          <div class="mh-xp">Every MCQ from the assignment PDF — verified answer key + per-option reasoning. Coding problems with given + optimal solutions.</div></div></div>
        <div class="mh-actions"><span class="lab-status">${solved}/${total} solved</span></div>
      </div>
      <div class="callout co-info lroot" style="margin-bottom:16px"><span class="tag">How</span><div class="body">
        Each question is a <b>select-all-that-apply</b> drill: tick what you believe, hit <b>Check my answer</b>, and every statement turns
        green/red with a one-line reason. Perfect checks earn <b>+6 XP</b>. Coding problems include the PDF's given solution,
        a cleaner optimal one, and a <b>step-through visualisation</b>.</div></div>
      <div class="lec-grid">${cards}</div>${foot()}`;
  }
  const foot = () => `<div class="site-foot"><span>Assignment Academy — answers verified & explained</span><span>Perfect answers earn +6 XP</span></div>`;

  /* ---------------- SECTION ---------------- */
  function section(id) {
    const sec = window.CN_ASSIGNMENTS.find(s => s.id === id);
    if (!sec) { $('#view').innerHTML = '<p>Not found.</p>'; return; }
    const view = $('#view');
    const wrap = document.createElement('div');
    view.innerHTML = `<div class="lec-head" style="--acc:${sec.color};--acc-d:${sec.color};--acc-l:#fff;--acc-m:${sec.color}">
        <div class="mesh"></div><div class="lh-no">Assignment ${sec.id}</div><h1>${esc(sec.title)}</h1>
        <div class="lh-tag">${sec.mcqs.length} multi-select MCQs${sec.coding ? ' + ' + sec.coding.length + ' coding problems' : ''} · <a href="#/lecture/${sec.lecture}" style="color:#fff">↩ the matching lecture</a></div>
      </div>
      <div class="lroot" id="asBody" style="--acc:${sec.color};--acc-d:${sec.color};--acc-l:color-mix(in srgb, ${sec.color} 8%, #fffdf8);--acc-m:color-mix(in srgb, ${sec.color} 30%, #fff)"></div>${foot()}`;
    const body = $('#asBody');
    sec.mcqs.forEach(q => window.CN_ASSIGN.renderMCQ(body, sec, q));
    if (sec.coding) {
      const h = document.createElement('div');
      h.className = 'sec-head';
      h.innerHTML = `<div class="num">&lt;/&gt;</div><h2>Coding problems — given vs optimal</h2><div class="rule"></div>`;
      body.appendChild(h);
      sec.coding.forEach(p => renderCoding(body, p));
    }
    window.scrollTo(0, 0);
  }

  function renderCoding(body, p) {
    const card = document.createElement('div');
    card.className = 'as-code-card';
    card.innerHTML = `
      <div class="qq-meta"><span class="qq-no">${p.num}. ${esc(p.title)}</span><span class="qq-tag">CODING</span></div>
      <p class="as-problem">${esc(p.problem)}</p>
      <div class="callout co-ok"><span class="tag">Key insight</span><div class="body">${esc(p.insight)}</div></div>
      <div class="as-tabs">
        <button class="hot" data-t="opt">⚡ Optimal solution</button>
        <button data-t="given">📖 Given solution (PDF)</button>
        <button data-t="why">🧠 Why it's better</button>
        <button data-t="viz">▶ Visualisation</button>
      </div>
      <div class="as-tabbody"></div>`;
    body.appendChild(card);
    const tabbody = $('.as-tabbody', card);
    const tabs = $$('.as-tabs button', card);
    function show(t) {
      tabs.forEach(b => b.classList.toggle('hot', b.getAttribute('data-t') === t));
      tabbody.innerHTML = '';
      if (t === 'opt') {
        tabbody.innerHTML = `<div class="c-title" style="color:var(--acc-d)">${esc(p.optimalTitle)}</div>`;
        const code = document.createElement('div');
        code.className = 'code';
        code.textContent = p.optimal;
        tabbody.appendChild(code);
      } else if (t === 'given') {
        tabbody.innerHTML = `<div class="small" style="color:var(--ink-3);margin:2px 0 6px">${esc(p.givenNote)}</div>`;
        const code = document.createElement('div');
        code.className = 'code';
        code.textContent = p.given;
        tabbody.appendChild(code);
      } else if (t === 'why') {
        tabbody.innerHTML = `<p style="font-size:13.6px">${esc(p.optimalWhy)}</p>
          <table class="t small"><tr><th>Approach</th><th>Complexity</th></tr>
          ${p.complexity.map(c => `<tr><td>${esc(c[0])}</td><td class="mono">${esc(c[1])}</td></tr>`).join('')}</table>`;
      } else if (t === 'viz') {
        const host = document.createElement('div');
        host.className = 'as-viz';
        tabbody.appendChild(host);
        VIZ[p.viz](host);
      }
    }
    tabs.forEach(b => b.onclick = () => show(b.getAttribute('data-t')));
    show('opt');
  }

  /* ================= SHARED VIZ HELPERS ================= */
  function vizShell(host, h) {
    host.innerHTML = `<div class="lab-controls">
      <button class="btn primary small v-play">▶ Play</button>
      <button class="btn ghost small v-step">Step →</button>
      <button class="btn ghost small v-reset">⟲ Reset</button>
      <span class="v-presets"></span></div>
      <div class="v-stage"></div>
      <div class="lab-log v-log" style="max-height:150px"></div>`;
    const stage = $('.v-stage', host);
    const svg = svgEl('svg', { viewBox: `0 0 560 ${h || 340}`, class: 'lab-canvas' });
    stage.appendChild(svg);
    return { svg, log: $('.v-log', host), play: $('.v-play', host), step: $('.v-step', host), reset: $('.v-reset', host), presets: $('.v-presets', host) };
  }
  function vNode(svg, x, y, r, label, id) {
    const g = svgEl('g', { 'data-id': id }, svg);
    const c = svgEl('circle', { cx: x, cy: y, r: r || 22, fill: '#fffdf8', stroke: '#c9c3b6', 'stroke-width': 2.5, class: 'vn-c' }, g);
    const t = svgEl('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, g);
    t.textContent = label;
    return g;
  }
  function vEdge(svg, x1, y1, x2, y2, label, directed, id) {
    const g = svgEl('g', { 'data-e': id || '' }, svg);
    const line = svgEl('line', { x1, y1, x2, y2, stroke: '#d9d5f0', 'stroke-width': 2.5, class: 've-l' }, g);
    if (directed) svgEl('polygon', { points: `${x2},${y2} ${x2 - 10},${y2 - 5} ${x2 - 10},${y2 + 5}`, fill: '#d9d5f0', class: 've-a' }, g);
    if (label != null) {
      const t = svgEl('text', { x: (x1 + x2) / 2 + 8, y: (y1 + y2) / 2 - 7, 'font-size': 12, 'font-weight': 800, fill: '#737a8c', class: 'svg-t' }, g);
      t.textContent = label;
    }
    return g;
  }
  function runViz(ui, steps, resetPaint) {
    let i = 0, timer = null;
    const doReset = () => { clearInterval(timer); timer = null; i = 0; ui.log.innerHTML = ''; resetPaint(); ui.play.textContent = '▶ Play'; };
    const advance = () => { if (i < steps.length) { steps[i].paint(); const l = document.createElement('div'); l.className = 'll'; l.innerHTML = `<span class="lln">${i + 1}</span><span class="llt">${steps[i].d}</span>`; ui.log.appendChild(l); ui.log.scrollTop = ui.log.scrollHeight; i++; } };
    ui.play.onclick = () => {
      if (timer) { clearInterval(timer); timer = null; ui.play.textContent = '▶ Play'; return; }
      ui.play.textContent = '⏸ Pause';
      timer = setInterval(() => { if (i >= steps.length) { clearInterval(timer); timer = null; ui.play.textContent = '▶ Play'; } else advance(); }, 900);
    };
    ui.step.onclick = advance;
    ui.reset.onclick = doReset;
    doReset();
    return { doReset };
  }

  /* ---------------- VIZ 1: parent-pointer climb (Q16) ---------------- */
  function vizClimb(host) {
    const A = [1, 1, 2, 2, 4];                    // edges A[i] -> i+1
    const parent = k => A[k - 1];
    const pos = { 1: [90, 50], 2: [210, 120], 3: [150, 220], 4: [300, 200], 5: [400, 290] };
    const ui = vizShell(host, 340);
    const presets = [[5, 2], [3, 4], [1, 4], [5, 1]];
    let B, C, sel = 0;
    const edges = [];
    for (let i = 1; i < A.length; i++) edges.push([A[i], i + 1]);
    function paint(mark, arrows, verdict) {
      ui.svg.innerHTML = '';
      edges.forEach(([a, b]) => vEdge(ui.svg, pos[a][0], pos[a][1], pos[b][0], pos[b][1], null, true, a + '-' + b));
      for (let k = 1; k <= 5; k++) {
        const g = vNode(ui.svg, pos[k][0], pos[k][1], 24, k, k);
        const c = g.querySelector('.vn-c');
        if (mark === k) { c.setAttribute('fill', '#fbbf24'); c.setAttribute('stroke', '#d97706'); }
        else if (k === C) { c.setAttribute('fill', '#a2ce9d'); c.setAttribute('stroke', '#0e7a55'); }
      }
      (arrows || []).forEach(([a, b]) => {
        const l = svgEl('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[b][0], y2: pos[b][1], stroke: '#e11d48', 'stroke-width': 4 }, ui.svg);
        l.style.opacity = 0.9;
      });
      const t = svgEl('text', { x: 280, y: 40, 'font-size': 14, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, ui.svg);
      t.textContent = `Is ${B} reachable from ${C}?  →  ${verdict == null ? 'climbing…' : verdict}`;
    }
    function build() {
      [B, C] = presets[sel];
      const steps = [];
      let cur = B; const arrows = [];
      steps.push({ d: `Start at B = ${B}. ${B > C ? 'B > C → climb one parent.' : B === C ? 'B == C already — trivially reachable, return 1.' : 'B < C → impossible: every edge points upward, return 0.'}`, paint: () => paint(B, [], null) });
      let v = null;
      while (cur > C) { const from = cur; const p = parent(cur); cur = p; arrows.push([from, cur]); const cc = cur, aa = arrows.slice(); steps.push({ d: `Climb: parent(${from}) = ${cur} — move up the tree.`, paint: () => paint(cc, aa, null) }); }
      v = cur === C ? 1 : 0;
      steps.push({ d: v ? `Landed on C = ${C} → B is a descendant of C → return 1 ✔` : `Climbed to ${cur} ≠ C → B is not below C → return 0 ✘`, paint: () => paint(cur, arrows, v) });
      runViz(ui, steps, () => paint(B, [], null));
    }
    presets.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'btn ghost small';
      b.textContent = `B=${p[0]}, C=${p[1]}`;
      b.onclick = () => { sel = i; build(); };
      ui.presets.appendChild(b);
    });
    build();
  }

  /* ---------------- VIZ 2: BFS reachability (Q17) ---------------- */
  function vizReach(host) {
    const graphs = [
      { name: 'A=5, path 1→2→3→4→5 (reachable)', edges: [[1, 2], [2, 3], [3, 4], [4, 5]], pos: { 1: [60, 80], 2: [180, 60], 3: [300, 80], 4: [420, 60], 5: [510, 100] }, ans: 1 },
      { name: 'A=5, assignment input 1 (NOT reachable)', edges: [[1, 2], [4, 1], [2, 4], [3, 4], [5, 2], [1, 3]], pos: { 1: [70, 70], 2: [230, 45], 3: [70, 210], 4: [235, 185], 5: [410, 110] }, ans: 0 },
    ];
    const ui = vizShell(host, 300);
    let sel = 0;
    function paint(G, visited, cur, done, verdict) {
      ui.svg.innerHTML = '';
      G.edges.forEach(([a, b]) => vEdge(ui.svg, G.pos[a][0], G.pos[a][1], G.pos[b][0], G.pos[b][1], null, true, a + '-' + b));
      for (let k = 1; k <= 5; k++) {
        const g = vNode(ui.svg, G.pos[k][0], G.pos[k][1], 24, k, k);
        const c = g.querySelector('.vn-c');
        if (cur === k) { c.setAttribute('fill', '#fbbf24'); c.setAttribute('stroke', '#d97706'); }
        else if (visited.includes(k)) { c.setAttribute('fill', '#a2ce9d'); c.setAttribute('stroke', '#0e7a55'); }
        if (k === 5) { const s = svgEl('text', { x: G.pos[k][0], y: G.pos[k][1] - 34, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 900, fill: '#e11d48', class: 'svg-t' }, ui.svg); s.textContent = '★ target A'; }
      }
      if (verdict != null) { const t = svgEl('text', { x: 280, y: 282, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: verdict ? '#16a34a' : '#be123c', class: 'svg-t' }, ui.svg); t.textContent = verdict ? 'path found → return 1 ✔' : 'queue empty, A never touched → return 0 ✘'; }
    }
    function build() {
      const G = graphs[sel];
      const adj = {}; for (let k = 1; k <= 5; k++) adj[k] = [];
      G.edges.forEach(([a, b]) => adj[a].push(b));
      const visited = [], steps = [];
      const dq = [1]; visited.push(1);
      let reached = false;
      steps.push({ d: 'BFS from node 1 — visit 1, enqueue its neighbours.', paint: () => paint(G, visited.slice(), 1, false, null) });
      while (dq.length) {
        const u = dq.shift();
        for (const v of adj[u]) {
          if (!visited.includes(v)) {
            visited.push(v); dq.push(v);
            const vv = v, uu = u;
            steps.push({ d: `Dequeued ${uu} → visiting ${vv}${vv === 5 ? ' — that\'s the target A! ✔' : ''}`, paint: () => paint(G, visited.slice(), vv, false, vv === 5 ? 1 : null) });
            if (v === 5) { reached = true; break; }
          }
        }
        if (reached) break;
      }
      if (!reached) steps.push({ d: 'Queue is empty and 5 was never visited → 1 cannot reach A → return 0.', paint: () => paint(G, visited.slice(), null, true, 0) });
      const r = runViz(ui, steps, () => paint(G, [], null, false, null));
    }
    graphs.forEach((G, i) => {
      const b = document.createElement('button');
      b.className = 'btn ghost small' + (i === 0 ? '' : '');
      b.textContent = G.name.split('(')[0].trim();
      b.onclick = () => { sel = i; build(); };
      ui.presets.appendChild(b);
    });
    build();
  }

  /* ---------------- VIZ 3: Kahn's peeling (Q18) ---------------- */
  function vizPeel(host) {
    const graphs = [
      { name: 'DAG — no cycle (peels fully)', edges: [[1, 2], [2, 4], [3, 4], [1, 3], [4, 5]], pos: { 1: [70, 70], 2: [220, 45], 3: [70, 210], 4: [230, 180], 5: [400, 220] } },
      { name: 'With cycle 1→2→4→1', edges: [[1, 2], [2, 4], [4, 1], [3, 4], [1, 3], [5, 2]], pos: { 1: [90, 90], 2: [240, 50], 3: [90, 230], 4: [250, 190], 5: [420, 90] } },
    ];
    const ui = vizShell(host, 300);
    let sel = 0;
    function paint(G, peeled, indeg, verdict) {
      ui.svg.innerHTML = '';
      G.edges.forEach(([a, b]) => vEdge(ui.svg, G.pos[a][0], G.pos[a][1], G.pos[b][0], G.pos[b][1], null, true, a + '-' + b));
      for (let k = 1; k <= 5; k++) {
        const g = vNode(ui.svg, G.pos[k][0], G.pos[k][1], 24, k, k);
        const c = g.querySelector('.vn-c');
        if (peeled.includes(k)) { c.setAttribute('fill', '#a2ce9d'); c.setAttribute('stroke', '#0e7a55'); }
        else if (verdict === 1) { c.setAttribute('fill', '#fbcfe8'); c.setAttribute('stroke', '#be123c'); }
        else if (indeg[k] === 0) { c.setAttribute('fill', '#fde68a'); c.setAttribute('stroke', '#d97706'); }
        const b = svgEl('text', { x: G.pos[k][0] + 20, y: G.pos[k][1] - 20, 'font-size': 11, 'font-weight': 900, fill: '#737a8c', class: 'svg-t' }, ui.svg);
        b.textContent = peeled.includes(k) ? '✓' : 'in:' + indeg[k];
      }
      if (verdict != null) { const t = svgEl('text', { x: 280, y: 285, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: verdict ? '#be123c' : '#16a34a', class: 'svg-t' }, ui.svg); t.textContent = verdict ? `${5 - peeled.length} nodes never peeled → CYCLE exists → return 1` : 'all 5 peeled → DAG → return 0'; }
    }
    function build() {
      const G = graphs[sel];
      const adj = {}; const indeg = {};
      for (let k = 1; k <= 5; k++) { adj[k] = []; indeg[k] = 0; }
      G.edges.forEach(([a, b]) => { adj[a].push(b); indeg[b]++; });
      const peeled = []; const steps = [];
      const dq = []; for (let k = 1; k <= 5; k++) if (indeg[k] === 0) dq.push(k);
      steps.push({ d: 'Kahn\'s: repeatedly peel any node with in-degree 0 (amber).', paint: () => paint(G, [], { ...indeg }, null) });
      while (dq.length) {
        const u = dq.shift(); peeled.push(u);
        const snap = { ...indeg };
        adj[u].forEach(v => { indeg[v]--; if (indeg[v] === 0) dq.push(v); });
        steps.push({ d: `Peel ${u} → decrement its neighbours${dq.length ? '; next candidates: ' + dq.join(', ') : '; queue empty'}.`, paint: ((pp, ss) => () => paint(G, pp.slice(), ss, null))(peeled.slice(), snap) });
      }
      const verdict = peeled.length === 5 ? 0 : 1;
      steps.push({ d: verdict ? `Only ${peeled.length}/5 peeled — the rest are on/behind a cycle → return 1.` : 'All 5 peeled → the graph is a DAG → return 0.', paint: () => paint(G, peeled.slice(), { ...indeg }, verdict) });
      runViz(ui, steps, () => paint(G, [], { ...indeg }, null));
    }
    graphs.forEach((G, i) => {
      const b = document.createElement('button');
      b.className = 'btn ghost small';
      b.textContent = G.name;
      b.onclick = () => { sel = i; build(); };
      ui.presets.appendChild(b);
    });
    build();
  }

  /* ---------------- VIZ 4: Dijkstra trace (Q19) ---------------- */
  function vizDijkstra(host) {
    const pos = { 0: [80, 70], 1: [230, 40], 2: [390, 80], 3: [110, 230], 4: [255, 160], 5: [430, 220] };
    const edges = [[0, 4, 9], [3, 4, 6], [1, 2, 1], [2, 5, 1], [2, 4, 5], [0, 3, 7], [0, 1, 1], [4, 5, 7], [0, 5, 1]];
    const C = 4, N = 6;
    const ui = vizShell(host, 320);
    function paint(dist, finalized, cur, hotEdges, done) {
      ui.svg.innerHTML = '';
      edges.forEach(([a, b, w]) => {
        const hot = hotEdges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
        const g = vEdge(ui.svg, pos[a][0], pos[a][1], pos[b][0], pos[b][1], w, false, a + '-' + b);
        if (hot) g.querySelector('.ve-l').setAttribute('stroke', '#e11d48');
      });
      for (let k = 0; k < N; k++) {
        const g = vNode(ui.svg, pos[k][0], pos[k][1], 24, k, k);
        const c = g.querySelector('.vn-c');
        if (cur === k) { c.setAttribute('fill', '#fbbf24'); c.setAttribute('stroke', '#d97706'); }
        else if (finalized.includes(k)) { c.setAttribute('fill', '#a2ce9d'); c.setAttribute('stroke', '#0e7a55'); }
        if (k === C) { const s = svgEl('text', { x: pos[k][0], y: pos[k][1] - 34, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 900, fill: '#0e7a55', class: 'svg-t' }, ui.svg); s.textContent = 'source C'; }
        const d = svgEl('text', { x: pos[k][0] + 26, y: pos[k][1] + 18, 'font-size': 11.5, 'font-weight': 900, fill: dist[k] === Infinity ? '#c9c3b6' : '#4f46e5', class: 'svg-t' }, ui.svg);
        d.textContent = 'd=' + (dist[k] === Infinity ? '∞' : dist[k]);
      }
      // distance array row
      const boxes = svgEl('g', {}, ui.svg);
      dist.forEach((d, i) => {
        svgEl('rect', { x: 130 + i * 52, y: 292, width: 44, height: 26, rx: 5, fill: d === Infinity ? '#f5f2ea' : '#eef2ff', stroke: i === C ? '#16a34a' : '#d9d5f0', 'stroke-width': 1.5 }, boxes);
        const t = svgEl('text', { x: 152 + i * 52, y: 309, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: d === Infinity ? '#c9c3b6' : '#312e81', class: 'svg-t' }, boxes);
        t.textContent = d === Infinity ? '∞' : d;
        const lbl = svgEl('text', { x: 152 + i * 52, y: 288, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#737a8c', class: 'svg-t' }, boxes);
        lbl.textContent = 'D[' + i + ']';
      });
      if (done) { const t = svgEl('text', { x: 470, y: 305, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 900, fill: '#16a34a', class: 'svg-t' }, ui.svg); t.textContent = '✓ = expected output'; }
    }
    function build() {
      const adj = {}; for (let k = 0; k < N; k++) adj[k] = [];
      edges.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
      const INF = Infinity;
      const dist = Array(N).fill(INF); dist[C] = 0;
      const finalized = [], pq = [[0, C]], steps = [];
      const fmtPQ = () => pq.map(p => p[1] + '(' + p[0] + ')').join(', ');
      steps.push({ d: 'dist[] = ∞ everywhere, dist[C=4] = 0. PQ = [(0, 4)].', paint: () => paint(dist.slice(), [], null, [], false) });
      while (pq.length) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, u] = pq.shift();
        if (d > dist[u]) continue;
        finalized.push(u);
        const hot = [];
        const snapDist = dist.slice();
        let note = `Pop closest node ${u} (d=${d}) — finalise it. Relax edges: `;
        adj[u].forEach(([v, w]) => {
          const nd = d + w;
          if (nd < dist[v]) { dist[v] = nd; pq.push([nd, v]); hot.push([u, v]); note += `${u}→${v} improves to ${nd}; `; }
        });
        if (!hot.length) note += 'nothing improves.';
        steps.push({ d: note, paint: ((dd, ff, uu, hh) => () => paint(dd, ff.slice(), uu, hh, false))(snapDist, finalized, u, hot) });
      }
      const final = dist.map(d => d === INF ? -1 : d);
      steps.push({ d: `Done. D = [${final.join(', ')}] — matches the assignment's expected output.`, paint: () => paint(final, finalized.slice(), null, [], true) });
      runViz(ui, steps, () => paint(Array(N).fill(INF), [], null, [], false));
    }
    build();
  }

  const VIZ = { climb: vizClimb, reach: vizReach, peel: vizPeel, dijkstra: vizDijkstra };

  window.CN_ASSIGN_VIEW = { hub, section };
})();
