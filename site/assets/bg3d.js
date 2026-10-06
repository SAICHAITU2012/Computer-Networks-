/* ============================================================
   bg3d.js — Unique vivid animated 3D canvas backgrounds v16
   Every page gets its own distinct, colourful, animated wallpaper.
   ============================================================ */
(function () {
  'use strict';

  let _raf = null, _canvas = null, _mouseX = 0.5, _mouseY = 0.5;

  document.addEventListener('mousemove', e => {
    _mouseX = e.clientX / window.innerWidth;
    _mouseY = e.clientY / window.innerHeight;
  });

  function stop() {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    if (_canvas) { _canvas.remove(); _canvas = null; }
  }

  function makeCanvas() {
    stop();
    const c = document.createElement('canvas');
    c.className = 'bg3d-canvas';
    c.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;';
    document.body.prepend(c);
    _canvas = c;
    return c;
  }

  function loop(fn) { _raf = requestAnimationFrame(fn); }

  /* ──────────────────────────────────────────────────────────
     1. HOME — Neural Network  (vivid indigo/violet)
  ────────────────────────────────────────────────────────── */
  function startNeural() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let nodes = [], W, H, t = 0;
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      nodes = Array.from({ length: 60 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55,
        r: 1.5 + Math.random() * 3.5, hue: 200 + Math.random() * 100,
        pulse: Math.random() * Math.PI * 2, s: .018 + Math.random() * .02
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(6,9,20,.18)'; ctx.fillRect(0, 0, W, H);
      t += .01;
      const mx = _mouseX * W, my = _mouseY * H;
      nodes.forEach(n => {
        n.x = (n.x + n.vx + .4 * (_mouseX - .5)) % W;
        n.y = (n.y + n.vy + .4 * (_mouseY - .5)) % H;
        if (n.x < 0) n.x += W; if (n.y < 0) n.y += H;
        n.pulse += n.s;
      });
      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d = Math.hypot(dx, dy);
          if (d < 180) {
            const a = (1 - d / 180) * .75;
            const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            g.addColorStop(0, `hsla(${nodes[i].hue},90%,70%,${a})`);
            g.addColorStop(1, `hsla(${nodes[j].hue},90%,70%,${a})`);
            ctx.beginPath(); ctx.strokeStyle = g; ctx.lineWidth = 1.4;
            ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      // Nodes
      nodes.forEach(n => {
        const p = .6 + .4 * Math.sin(n.pulse);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4 * p);
        g.addColorStop(0, `hsla(${n.hue},100%,85%,.95)`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4 * p, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      // Mouse glow
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
      mg.addColorStop(0, 'rgba(139,92,246,.08)'); mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
      loop(draw);
    }
    ctx.fillStyle = '#060914'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     2. ARCADE — Matrix rain (vivid green/cyan/purple)
  ────────────────────────────────────────────────────────── */
  function startMatrixRain() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, drops = [];
    const CHARS = '01 10 DNS TCP UDP ARP BGP OSI TTL NAT MTU IP MAC STP RIP'.split(' ');
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      const cols = Math.floor(W / 18);
      drops = Array.from({ length: cols }, (_, i) => ({
        y: Math.random() * -H, speed: 1.8 + Math.random() * 3.5,
        len: 8 + Math.floor(Math.random() * 22),
        hue: [140, 170, 260, 300][Math.floor(Math.random() * 4)],
        chars: []
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(2,8,15,.12)'; ctx.fillRect(0, 0, W, H);
      drops.forEach((d, i) => {
        for (let k = 0; k < Math.min(d.len, 35); k++) {
          const alpha = k === 0 ? 1 : (1 - k / d.len) * .9;
          ctx.font = `bold ${k === 0 ? 14 : 12}px 'JetBrains Mono',monospace`;
          ctx.fillStyle = k === 0 ? `hsla(${d.hue},100%,92%,${alpha})`
            : `hsla(${d.hue},85%,60%,${alpha * .85})`;
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(ch, i * 18, d.y - k * 16);
        }
        d.y += d.speed;
        if (d.y > H + d.len * 16) {
          d.y = -60 - Math.random() * 300;
          d.hue = [140, 170, 260, 300][Math.floor(Math.random() * 4)];
        }
      });
      loop(draw);
    }
    ctx.fillStyle = '#020a0f'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     3. LABS — DNA Helix (vivid cyan/purple)
  ────────────────────────────────────────────────────────── */
  function startDnaHelix() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0;
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(4,8,24,.15)'; ctx.fillRect(0, 0, W, H);
      t += .016;
      const mx = _mouseX, numH = Math.ceil(W / 320);
      for (let hi = 0; hi < numH; hi++) {
        const ox = (hi + .5) * (W / numH) + mx * 30 - 15;
        const amp = 70, step = 20, rows = Math.ceil(H / step) + 4;
        for (let i = -2; i < rows; i++) {
          const y = i * step, ph = t + i * .26;
          const x1 = ox + Math.sin(ph) * amp, x2 = ox - Math.sin(ph) * amp;
          const alpha = .5 + .5 * Math.sin(ph * .5);
          if (i > -2) {
            const pph = ph - .26;
            const px1 = ox + Math.sin(pph) * amp, px2 = ox - Math.sin(pph) * amp;
            ctx.beginPath(); ctx.moveTo(px1, (i - 1) * step); ctx.lineTo(x1, y);
            ctx.strokeStyle = `hsla(185,95%,65%,${alpha * .9})`; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px2, (i - 1) * step); ctx.lineTo(x2, y);
            ctx.strokeStyle = `hsla(285,95%,72%,${alpha * .9})`; ctx.lineWidth = 2.5; ctx.stroke();
          }
          if (i % 3 === 0 && Math.abs(Math.sin(ph)) > .1) {
            ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
            const lg = ctx.createLinearGradient(x1, y, x2, y);
            lg.addColorStop(0, `hsla(185,100%,70%,${alpha * .8})`);
            lg.addColorStop(.5, `rgba(255,255,255,${alpha * .5})`);
            lg.addColorStop(1, `hsla(285,100%,72%,${alpha * .8})`);
            ctx.strokeStyle = lg; ctx.lineWidth = 2.2; ctx.stroke();
          }
          [[x1, 185], [x2, 285]].forEach(([x, h]) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
            g.addColorStop(0, `hsla(${h},100%,88%,${alpha})`);
            g.addColorStop(1, 'transparent');
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          });
        }
      }
      loop(draw);
    }
    ctx.fillStyle = '#04081a'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     4. ACHIEVEMENTS — Gold Starfield + shooting stars
  ────────────────────────────────────────────────────────── */
  function startStarfield() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, stars = [], shooters = [], stimer = 0;
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      stars = Array.from({ length: 160 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: .5 + Math.random() * 2.8,
        hue: 28 + Math.random() * 50,
        tw: Math.random() * Math.PI * 2, s: .015 + Math.random() * .04
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(6,6,18,.12)'; ctx.fillRect(0, 0, W, H);
      t += .01; stimer++;
      if (stimer > 80 + Math.random() * 100) {
        shooters.push({ x: Math.random() * W * .7, y: 0, vx: 3 + Math.random() * 5, vy: 1.5 + Math.random() * 2.5, tail: [] });
        stimer = 0;
      }
      const mx = _mouseX * W, my = _mouseY * H;
      stars.forEach(s => {
        s.tw += s.s;
        const a = .3 + .7 * Math.sin(s.tw);
        // subtle mouse parallax
        const px = s.x + (_mouseX - .5) * s.r * 8;
        const py = s.y + (_mouseY - .5) * s.r * 8;
        const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 4);
        g.addColorStop(0, `hsla(${s.hue},100%,92%,${a})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(px, py, s.r * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      });
      shooters = shooters.filter(sh => sh.y < H + 20 && sh.x < W + 30);
      shooters.forEach(sh => {
        sh.tail.push({ x: sh.x, y: sh.y });
        if (sh.tail.length > 28) sh.tail.shift();
        sh.x += sh.vx; sh.y += sh.vy;
        sh.tail.forEach((pt, i) => {
          const a = (i / sh.tail.length) * .9;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(48,100%,88%,${a})`; ctx.fill();
        });
        ctx.beginPath(); ctx.arc(sh.x, sh.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,248,200,.95)'; ctx.fill();
      });
      // Mouse glow
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
      mg.addColorStop(0, 'rgba(251,191,36,.07)'); mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
      loop(draw);
    }
    ctx.fillStyle = '#060612'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     5. QUIZ — Particle vortex (red/pink/magenta)
  ────────────────────────────────────────────────────────── */
  function startParticleVortex(h1, h2) {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, pts = [];
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      pts = Array.from({ length: 90 }, () => ({
        angle: Math.random() * Math.PI * 2,
        r: 60 + Math.random() * (Math.min(W, H) * .38),
        speed: (.003 + Math.random() * .006) * (Math.random() < .5 ? 1 : -1),
        hue: Math.random() > .5 ? h1 : h2,
        size: 1 + Math.random() * 3,
        tw: Math.random() * Math.PI * 2, ts: .02 + Math.random() * .04
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(8,4,18,.14)'; ctx.fillRect(0, 0, W, H);
      t += .008;
      const cx = W * .5 + (_mouseX - .5) * 80, cy = H * .5 + (_mouseY - .5) * 60;
      // Central glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      cg.addColorStop(0, `hsla(${h1},90%,60%,.12)`);
      cg.addColorStop(.5, `hsla(${h2},80%,55%,.06)`);
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
      pts.forEach(p => {
        p.angle += p.speed * (1 + Math.abs(_mouseX - .5) * .5);
        p.tw += p.ts;
        const x = cx + Math.cos(p.angle) * p.r, y = cy + Math.sin(p.angle) * p.r;
        const a = .5 + .5 * Math.sin(p.tw);
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,78%,${a})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      loop(draw);
    }
    ctx.fillStyle = '#080412'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     6. HEX GRID — Lecture pages (different hue per lecture)
  ────────────────────────────────────────────────────────── */
  function startHexGrid(hue) {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0;
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    function hexPoly(cx, cy, r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 3 * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
          : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
    }
    function draw() {
      ctx.fillStyle = 'rgba(6,8,20,.16)'; ctx.fillRect(0, 0, W, H);
      t += .005;
      const R = 44, cols = Math.ceil(W / (R * 1.73)) + 2, rows = Math.ceil(H / (R * 1.5)) + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * R * 1.73 + (row % 2 ? R * .865 : 0) + _mouseX * 12 - 6;
          const cy = row * R * 1.5 + _mouseY * 10 - 5;
          const wave = Math.sin(t + col * .38 + row * .28) * .5 + .5;
          const h2 = hue + wave * 40;
          hexPoly(cx, cy, R - 2);
          ctx.strokeStyle = `hsla(${h2},80%,65%,${wave * .65})`; ctx.lineWidth = 1.8; ctx.stroke();
          if (wave > .68) {
            ctx.fillStyle = `hsla(${h2},80%,65%,${(wave - .68) * .45})`; ctx.fill();
          }
        }
      }
      loop(draw);
    }
    ctx.fillStyle = `hsl(${hue},40%,5%)`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     7. ASSIGNMENTS — Circuit Board (gold/amber traces)
  ────────────────────────────────────────────────────────── */
  function startCircuitBoard() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, traces = [], pulses = [];
    function buildTraces() {
      traces = []; pulses = [];
      const STEP = 52;
      const cols = Math.ceil(W / STEP) + 2, rows = Math.ceil(H / STEP) + 2;
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          const x = cc * STEP, y = r * STEP;
          if (Math.random() < .55) traces.push({ x1: x, y1: y, x2: x + STEP, y2: y, h: 'h' });
          if (Math.random() < .55) traces.push({ x1: x, y1: y, x2: x, y2: y + STEP, h: 'v' });
          if (Math.random() < .22) {
            const seg = traces[Math.floor(Math.random() * traces.length)];
            if (seg) pulses.push({ trace: seg, pos: Math.random(), speed: .003 + Math.random() * .007, hue: 38 + Math.random() * 30 });
          }
        }
      }
    }
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight; buildTraces();
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(6,10,4,.16)'; ctx.fillRect(0, 0, W, H);
      t += .006;
      // Draw static traces
      ctx.lineWidth = 1.5;
      traces.forEach(tr => {
        const wave = Math.sin(t + tr.x1 * .04 + tr.y1 * .04) * .5 + .5;
        ctx.beginPath(); ctx.moveTo(tr.x1, tr.y1); ctx.lineTo(tr.x2, tr.y2);
        ctx.strokeStyle = `hsla(44,80%,50%,${.1 + wave * .2})`; ctx.stroke();
      });
      // Draw pad circles at intersections
      const STEP = 52;
      const cols = Math.ceil(W / STEP) + 2, rows = Math.ceil(H / STEP) + 2;
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          const x = cc * STEP, y = r * STEP;
          const wave = Math.sin(t + cc * .4 + r * .35) * .5 + .5;
          if (wave > .5) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
            g.addColorStop(0, `hsla(44,90%,70%,${wave * .9})`);
            g.addColorStop(1, 'transparent');
            ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          }
        }
      }
      // Animated signal pulses
      pulses.forEach(p => {
        p.pos = (p.pos + p.speed) % 1;
        const tr = p.trace;
        const x = tr.x1 + (tr.x2 - tr.x1) * p.pos;
        const y = tr.y1 + (tr.y2 - tr.y1) * p.pos;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, `hsla(${p.hue},100%,85%,.95)`);
        g.addColorStop(.5, `hsla(${p.hue},90%,60%,.5)`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      });
      // Mouse glow
      const mx = _mouseX * W, my = _mouseY * H;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 180);
      mg.addColorStop(0, 'rgba(251,191,36,.1)'); mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
      loop(draw);
    }
    ctx.fillStyle = '#060a04'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     8. CHEAT SHEETS — Grid Wave (teal/green flowing grid)
  ────────────────────────────────────────────────────────── */
  function startGridWave() {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0;
    function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(4,12,10,.15)'; ctx.fillRect(0, 0, W, H);
      t += .007;
      const G = 48;
      const cols = Math.ceil(W / G) + 2, rows = Math.ceil(H / G) + 2;
      const mx = _mouseX, my = _mouseY;
      for (let r = -1; r < rows; r++) {
        for (let cc = -1; cc < cols; cc++) {
          const x = cc * G + mx * 12 - 6, y = r * G + my * 10 - 5;
          const wave = Math.sin(t + cc * .32 + r * .32) * .5 + .5;
          const hue = 155 + wave * 50;
          ctx.strokeStyle = `hsla(${hue},75%,58%,${.15 + wave * .55})`; ctx.lineWidth = 1.4;
          ctx.strokeRect(x, y, G - 2, G - 2);
          if (wave > .72) {
            ctx.fillStyle = `hsla(${hue},75%,58%,${(wave - .72) * .38})`;
            ctx.fillRect(x + 2, y + 2, G - 6, G - 6);
          }
          if (wave > .85) {
            const g = ctx.createRadialGradient(x + G / 2, y + G / 2, 0, x + G / 2, y + G / 2, G / 2);
            g.addColorStop(0, `hsla(${hue},100%,80%,.4)`); g.addColorStop(1, 'transparent');
            ctx.fillStyle = g; ctx.fillRect(x, y, G, G);
          }
        }
      }
      loop(draw);
    }
    ctx.fillStyle = '#040c0a'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     9. Per-lecture unique backgrounds (13 distinct styles)
     Each lecture gets a different animation variant.
  ────────────────────────────────────────────────────────── */
  // Floating orbs (warm aurora tones)
  function startOrbs(h1, h2, h3) {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, orbs = [];
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      orbs = Array.from({ length: 8 }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 80 + Math.random() * 220, hue: [h1, h2, h3][i % 3],
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .35,
        pulse: Math.random() * Math.PI * 2, ps: .008 + Math.random() * .01
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(5,7,18,.22)'; ctx.fillRect(0, 0, W, H);
      t += .008;
      orbs.forEach(o => {
        o.x += o.vx + (_mouseX - .5) * .3; o.y += o.vy + (_mouseY - .5) * .25;
        if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
        o.pulse += o.ps;
        const pr = o.r * (.75 + .25 * Math.sin(o.pulse));
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, pr);
        g.addColorStop(0, `hsla(${o.hue},85%,65%,.25)`);
        g.addColorStop(.5, `hsla(${o.hue},75%,55%,.12)`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(o.x, o.y, pr, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      });
      loop(draw);
    }
    ctx.fillStyle = '#050712'; ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  // Flowing lines (like light streaks)
  function startFlowLines(hue) {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, lines = [];
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      lines = Array.from({ length: 25 }, () => ({
        y: Math.random() * H, vy: (Math.random() - .5) * .5,
        len: 80 + Math.random() * 300, x: Math.random() * W,
        speed: .5 + Math.random() * 2,
        hue: hue + (Math.random() - .5) * 60, alpha: .4 + Math.random() * .5
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(4,6,18,.18)'; ctx.fillRect(0, 0, W, H);
      t += .008;
      lines.forEach(l => {
        l.x = (l.x + l.speed) % (W + l.len);
        l.y += l.vy + (_mouseY - .5) * .15;
        if (l.y < 0) l.y = H; if (l.y > H) l.y = 0;
        const wave = Math.sin(t + l.y * .01) * .5 + .5;
        const lg = ctx.createLinearGradient(l.x - l.len, l.y, l.x, l.y);
        lg.addColorStop(0, 'transparent');
        lg.addColorStop(.5, `hsla(${l.hue},90%,70%,${l.alpha * wave})`);
        lg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.moveTo(l.x - l.len, l.y); ctx.lineTo(l.x, l.y);
        ctx.strokeStyle = lg; ctx.lineWidth = 1.5 + wave; ctx.stroke();
      });
      loop(draw);
    }
    ctx.fillStyle = `hsl(${hue},35%,5%)`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  // Constellation (lecture 3+4 - subnetting)
  function startConstellation(hue) {
    const c = makeCanvas(); const ctx = c.getContext('2d');
    let W, H, t = 0, pts = [];
    function resize() {
      W = c.width = innerWidth; H = c.height = innerHeight;
      pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: .8 + Math.random() * 2.5, hue: hue + (Math.random() - .5) * 50,
        vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
        tw: Math.random() * Math.PI * 2, ts: .01 + Math.random() * .02
      }));
    }
    resize(); window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(4,6,20,.18)'; ctx.fillRect(0, 0, W, H);
      t += .008;
      pts.forEach(p => {
        p.x = (p.x + p.vx + (_mouseX - .5) * .4 + W) % W;
        p.y = (p.y + p.vy + (_mouseY - .5) * .35 + H) % H;
        p.tw += p.ts;
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `hsla(${hue},80%,65%,${(1 - d / 140) * .6})`;
            ctx.lineWidth = 1.1; ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        const a = .5 + .5 * Math.sin(p.tw);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,85%,${a * .9})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      });
      loop(draw);
    }
    ctx.fillStyle = `hsl(${hue},35%,5%)`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    draw();
  }

  /* ──────────────────────────────────────────────────────────
     Per-lecture colour tables
  ────────────────────────────────────────────────────────── */
  const LECTURE_STYLES = {
    1:  () => startOrbs(220, 260, 190),          // Intro — indigo/violet
    2:  () => startFlowLines(195),               // Packets — cyan flows
    3:  () => startConstellation(210),           // IP/Subnetting I — blue constellation
    4:  () => startHexGrid(220),                 // IP/Subnetting II — blue hexgrid
    5:  () => startOrbs(140, 170, 100),          // Graph Algos — green orbs
    6:  () => startConstellation(145),           // Graph Algos II — green constellation
    7:  () => startFlowLines(35),                // Routing I — amber flows
    8:  () => startOrbs(30, 55, 15),             // Routing II — warm orbs
    9:  () => startConstellation(265),           // DNS — purple constellation
    10: () => startFlowLines(185),               // TCP/UDP — cyan flows
    11: () => startHexGrid(175),                 // NAT/DHCP — teal hexgrid
    12: () => startOrbs(0, 340, 20),             // Troubleshooting — red/rose orbs
    13: () => startFlowLines(280),               // Internet Journey — purple flows
  };

  /* ── PUBLIC API ── */
  window.BG3D = {
    stop,
    home: startNeural,
    arcade: startMatrixRain,
    labs: startDnaHelix,
    achievements: startStarfield,
    quiz(h1, h2) { startParticleVortex(h1 || 350, h2 || 270); },
    assignments: startCircuitBoard,
    cheats: startGridWave,
    lecture(num) {
      const fn = LECTURE_STYLES[num];
      if (fn) fn(); else startHexGrid(220);
    },
  };
})();
