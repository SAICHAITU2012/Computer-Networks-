/* Computer Networks — Gamification engine: XP, levels, streaks, achievements,
   sounds (WebAudio), confetti and the Pax mascot. No dependencies. */
(function () {
  'use strict';
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  /* ---------------- store ---------------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('cn_game') || '{}'); } catch (e) { return {}; } },
    set(d) { localStorage.setItem('cn_game', JSON.stringify(d)); },
  };
  const G = () => {
    const d = store.get();
    d.xp = d.xp || 0;
    d.ach = d.ach || [];
    d.labXP = d.labXP || {};
    d.bests = d.bests || {};
    d.streak = d.streak || { count: 0, last: '' };
    return d;
  };
  const save = d => store.set(d);

  /* ---------------- levels ---------------- */
  const TITLES = [
    'Curious Newbie', 'Frame Cadet', 'Segment Scout', 'Packet Pilot', 'Route Rookie',
    'Subnet Sensei', 'Protocol Paladin', 'TCP Titan', 'DNS Detective', 'Net Navigator',
    'Internet Legend',
  ];
  // cumulative XP needed to *reach* level n (level 1 = 0 XP)
  function levelInfo(xp) {
    let lvl = 1, need = 100, base = 0;
    while (xp >= base + need && lvl < 99) { base += need; lvl++; need = Math.round(need * 1.35); }
    return { lvl, into: xp - base, need, title: TITLES[Math.min(lvl - 1, TITLES.length - 1)] };
  }

  /* ---------------- XP ---------------- */
  const listeners = [];
  function onXP(fn) { listeners.push(fn); }
  function addXP(amount, reason) {
    const d = G();
    const before = levelInfo(d.xp).lvl;
    d.xp += amount;
    const after = levelInfo(d.xp).lvl;
    save(d);
    xpToast(amount, reason);
    listeners.forEach(f => f(d));
    if (after > before) {
      levelUp(after, levelInfo(d.xp).title);
      unlock('level5', after >= 5);
    }
    checkAch();
    return after > before;
  }

  /* ---------------- streak ---------------- */
  function touchStreak() {
    const d = G();
    const today = new Date().toDateString();
    if (d.streak.last === today) return d.streak.count;
    const yest = new Date(Date.now() - 864e5).toDateString();
    d.streak.count = d.streak.last === yest ? d.streak.count + 1 : 1;
    d.streak.last = today;
    save(d);
    if (d.streak.count >= 3) unlock('streak3', true);
    if (d.streak.count >= 7) unlock('streak7', true);
    listeners.forEach(f => f(d));
    return d.streak.count;
  }

  /* ---------------- achievements ---------------- */
  const ACH = {
    firstRead:   { icon: '📖', name: 'Bookworm I',          desc: 'Read your first lecture' },
    allRead:     { icon: '📚', name: 'Library Legend',      desc: 'Read all 13 lectures' },
    firstQuiz:   { icon: '✎', name: 'Quiz Starter',         desc: 'Finish your first quiz' },
    perfectQuiz: { icon: '💯', name: 'Flawless',            desc: 'Score 100% on any quiz' },
    subnetPro:   { icon: '🧮', name: 'Subnet Sensei',       desc: 'Score 90%+ on a subnetting quiz' },
    allLabs:     { icon: '⚡', name: 'Lab Explorer',        desc: 'Try every interactive lab' },
    arcadeFirst: { icon: '🕹️', name: 'Arcade Rookie',       desc: 'Finish any arcade game' },
    blitzCombo:  { icon: '🔢', name: 'Binary Whisperer',    desc: 'Reach a 12× combo in Binary Blitz' },
    routerPro:   { icon: '🚦', name: 'Traffic Controller',  desc: 'Deliver 10 packets in Packet Rush' },
    streak3:     { icon: '🔥', name: 'On Fire',             desc: 'Learn 3 days in a row' },
    streak7:     { icon: '🌋', name: 'Unstoppable',         desc: 'Learn 7 days in a row' },
    level5:      { icon: '🚀', name: 'Halfway Hero',        desc: 'Reach level 5' },
    bossSlain:   { icon: '👑', name: 'Boss Slayer',         desc: 'Finish the mock exam' },
    bossPerfect: { icon: '🌐', name: 'Network Deity',       desc: 'Score 90%+ on the mock exam' },
  };
  function unlock(id, condition) {
    if (!condition || !ACH[id]) return false;
    const d = G();
    if (d.ach.includes(id)) return false;
    d.ach.push(id);
    save(d);
    achToast(id);
    addXP(30, null); // silent-ish bonus (xpToast suppressed below)
    return true;
  }
  // event-driven checks (call after quiz / read / lab events)
  function checkAch(ctx) {
    ctx = ctx || {};
    const d = G();
    if (ctx.type === 'read') {
      const readCount = ctx.readCount != null ? ctx.readCount : 0;
      unlock('firstRead', readCount >= 1);
      unlock('allRead', readCount >= 13);
    }
    if (ctx.type === 'quiz') {
      unlock('firstQuiz', true);
      unlock('perfectQuiz', ctx.pct >= 100);
      if ((ctx.num === 3 || ctx.num === 4) && ctx.pct >= 90) unlock('subnetPro', true);
      if (ctx.num === 0) {
        unlock('bossSlain', true);
        unlock('bossPerfect', ctx.pct >= 90);
      }
    }
    if (ctx.type === 'lab') {
      unlock('allLabs', ctx.doneCount >= 10);
    }
    if (ctx.type === 'arcade') unlock('arcadeFirst', true);
    if (ctx.type === 'blitz' && ctx.combo >= 12) unlock('blitzCombo', true);
    if (ctx.type === 'rush' && ctx.delivered >= 10) unlock('routerPro', true);
  }

  /* ---------------- sound (WebAudio, lazy) ---------------- */
  let actx = null;
  let muted = localStorage.getItem('cn_muted') === '1';
  function beep(freq, dur, type, gain, when) {
    if (muted) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + (when || 0);
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }
  const SFX = {
    click:  () => beep(520, 0.06, 'sine', 0.06),
    correct: () => { beep(660, 0.1, 'sine', 0.1); beep(880, 0.14, 'sine', 0.1, 0.09); },
    wrong:  () => beep(180, 0.22, 'sawtooth', 0.07),
    levelup: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.16, 'triangle', 0.12, i * 0.11)),
    ach:    () => [784, 988, 1175].forEach((f, i) => beep(f, 0.14, 'sine', 0.11, i * 0.09)),
    win:    () => [523, 659, 784, 659, 784, 1046].forEach((f, i) => beep(f, 0.13, 'triangle', 0.11, i * 0.1)),
    tick:   () => beep(340, 0.04, 'square', 0.04),
  };
  function toggleMute() {
    muted = !muted;
    localStorage.setItem('cn_muted', muted ? '1' : '0');
    return muted;
  }

  /* ---------------- confetti ---------------- */
  function confetti(x, y, n, emojis) {
    const cvs = document.getElementById('confettiCvs') || (() => {
      const c = document.createElement('canvas');
      c.id = 'confettiCvs';
      c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:300';
      document.body.appendChild(c);
      return c;
    })();
    const dpr = window.devicePixelRatio || 1;
    cvs.width = innerWidth * dpr; cvs.height = innerHeight * dpr;
    const ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);
    const cols = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    const parts = [];
    for (let i = 0; i < (n || 90); i++) {
      const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 7;
      parts.push({
        x: x != null ? x : innerWidth / 2, y: y != null ? y : innerHeight / 3,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6,
        w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        col: cols[i % cols.length], life: 70 + Math.random() * 40,
        ch: emojis ? emojis[i % emojis.length] : null,
      });
    }
    let alive = true;
    window.__confettiKill = () => { alive = false; };
    (function frame() {
      if (!alive) { ctx.clearRect(0, 0, innerWidth, innerHeight); return; }
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let any = false;
      parts.forEach(p => {
        if (p.life <= 0) return;
        any = true;
        p.life--; p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 30);
        if (p.ch) { ctx.font = `${16 + (p.w)}px serif`; ctx.fillText(p.ch, -10, 6); }
        else { ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        ctx.restore();
      });
      if (any) requestAnimationFrame(frame); else { alive = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    })();
  }

  /* ---------------- floating +XP chips & combo ---------------- */
  function floatXP(x, y, text, cls) {
    const t = document.createElement('div');
    t.className = 'float-xp ' + (cls || '');
    t.textContent = text;
    t.style.left = x + 'px'; t.style.top = y + 'px';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('go'), 20);
    setTimeout(() => t.remove(), 1300);
  }
  let comboN = 0;
  function comboHit() { return ++comboN; }
  function comboReset() { comboN = 0; return 0; }
  function comboVal() { return comboN; }

  /* ---------------- reward chest ---------------- */
  function rewardChest(opts) {
    $$('.chest-overlay').forEach(o => o.remove());
    const ov = document.createElement('div');
    ov.className = 'chest-overlay';
    ov.innerHTML = `<div class="chest-card">
      <div class="chest-icon">🎁</div>
      <div class="chest-body" style="display:none">
        <div class="ch-title">${opts.title}</div>
        ${(opts.lines || []).map(l => `<div class="ch-line">${l}</div>`).join('')}
        ${opts.xp ? `<div class="ch-xp">+${opts.xp} XP</div>` : ''}
        <button class="btn primary small ch-collect">Collect ✨</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    const icon = ov.querySelector('.chest-icon');
    setTimeout(() => icon.classList.add('wiggle'), 350);
    setTimeout(() => {
      icon.classList.remove('wiggle'); icon.classList.add('open');
      SFX.win(); confetti(innerWidth / 2, innerHeight / 2 - 60, 70, ['✨', '⭐', '💫', '🎯', '📡', '🚀']);
      ov.querySelector('.chest-body').style.display = 'block';
    }, 1250);
    const close = () => { ov.classList.add('bye'); setTimeout(() => ov.remove(), 350); };
    ov.querySelector('.ch-collect').onclick = close;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
  }

  /* ---------------- animated counter ---------------- */
  function countUp(el, to, dur) {
    if (!el) return;
    const t0 = performance.now();
    (function frame(now) {
      const k = Math.min(1, ((now || performance.now()) - t0) / (dur || 800));
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(frame);
    })(performance.now());
  }

  /* ---------------- living network mesh (decorative) ---------------- */
  function startMesh(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, raf = 0, spawner = 0, dead = false;
    const nodes = [], packets = [];
    const PAL = ['rgba(139,92,246,', 'rgba(245,158,11,', 'rgba(16,185,129,', 'rgba(96,165,250,'];
    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = Math.max(300, r.width);
      H = canvas.height = Math.max(160, r.height);
    }
    resize();
    const N = Math.max(14, Math.min(26, Math.floor(W / 46)));
    for (let i = 0; i < N; i++) nodes.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 1.6 + Math.random() * 2.2, c: PAL[i % PAL.length],
    });
    function spawnPacket() {
      if (dead || nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let b = null, best = 1e9;
      nodes.forEach(n => { if (n !== a) { const d = Math.hypot(n.x - a.x, n.y - a.y); if (d < best) { best = d; b = n; } } });
      if (b) packets.push({ a, b, t: 0, sp: 0.012 + Math.random() * 0.02, c: PAL[Math.floor(Math.random() * PAL.length)] });
    }
    spawner = setInterval(spawnPacket, 620);
    for (let i = 0; i < 4; i++) spawnPacket();
    (function frame() {
      if (dead) return;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 130) {
          ctx.strokeStyle = 'rgba(120,110,200,' + (0.32 * (1 - d / 130)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]; p.t += p.sp;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = p.c + '0.9)';
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
        ctx.fillStyle = p.c + '0.25)';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
      }
      nodes.forEach(n => {
        ctx.fillStyle = n.c + '0.75)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    })();
    return () => { dead = true; cancelAnimationFrame(raf); clearInterval(spawner); ctx.clearRect(0, 0, W, H); };
  }

  /* ---------------- toasts ---------------- */
  function xpToast(amount, reason) {
    if (!reason) return;
    const t = document.createElement('div');
    t.className = 'xp-toast';
    t.innerHTML = `<b>${amount >= 0 ? '+' : ''}${amount} XP</b><span>${reason}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 30);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 2300);
  }
  function levelUp(lvl, title) {
    SFX.levelup();
    confetti();
    const t = document.createElement('div');
    t.className = 'big-toast level';
    t.innerHTML = `<div class="bt-icon">🎉</div><div><b>Level ${lvl}!</b><span>${title}</span></div>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 30);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 3600);
  }
  function achToast(id) {
    const a = ACH[id]; if (!a) return;
    SFX.ach();
    const t = document.createElement('div');
    t.className = 'big-toast ach';
    t.innerHTML = `<div class="bt-icon">${a.icon}</div><div><b>Achievement unlocked!</b><span>${a.name} — ${a.desc}</span></div>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 30);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 3600);
  }

  /* ---------------- mascot ---------------- */
  const TIPS = [
    'MAC gets you across one hop — IP gets you across the world!',
    'Subnetting in 5 seconds: block size = 256 − mask octet.',
    'TCP = promise every byte arrives. UDP = throw it and hope.',
    'DHCP DORA: Discover, Offer, Request, Ack — Request is STILL broadcast!',
    'Three dup-ACKs → fast retransmit. Timeout → back to 1 MSS. Ouch.',
    'DNS caches everywhere — that TTL decides how long the answer lives.',
    'Traceroute = ICMP trickery with TTL 1, 2, 3…',
    'NAT table full? Your router silently drops — it’s an accidental firewall.',
    'Throughput ≈ the slowest link on the path. Find the bottleneck!',
    'Everything AND 0 is 0 — that’s how masks find the network.',
  ];
  function mascotHTML() {
    return `<div class="pax" id="pax" title="Pax the Packet">
      <div class="pax-bubble" id="paxBubble"></div>
      <div class="pax-body">📨</div>
    </div>`;
  }
  function bindMascot(scope) {
    const pax = (scope || document).querySelector('#pax');
    if (!pax) return;
    const bub = pax.querySelector('#paxBubble');
    const say = () => {
      bub.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
      bub.classList.add('show');
      clearTimeout(bub._h);
      bub._h = setTimeout(() => bub.classList.remove('show'), 4200);
    };
    pax.onclick = say;
    setTimeout(say, 900);
    pax._interval = setInterval(() => { if (document.contains(pax)) say(); else clearInterval(pax._interval); }, 16000);
  }

  /* ---------------- sidebar widget ---------------- */
  function sidebarHTML() {
    const d = G();
    const li = levelInfo(d.xp);
    return `<div class="game-panel">
      <div class="gp-top">
        <span class="gp-lvl">${li.lvl}</span>
        <span class="gp-name">${li.title}</span>
        <button class="gp-mute" id="muteBtn" title="${muted ? 'Unmute' : 'Mute'} sounds">${muted ? '🔇' : '🔊'}</button>
      </div>
      <div class="gp-xpbar"><i style="width:${Math.round(li.into / li.need * 100)}%"></i></div>
      <div class="gp-meta"><span>${d.xp} XP</span><span>${li.need - li.into} to L${li.lvl + 1}</span><span>🔥 ${d.streak.count || 0}</span></div>
    </div>`;
  }

  /* ---------------- daily missions ---------------- */
  const DAILY = [
    { id: 'correct', label: 'Nail 8 questions', target: 8, xp: 30, icon: '🎯' },
    { id: 'arcade', label: 'Finish 2 arcade games', target: 2, xp: 25, icon: '🕹️' },
    { id: 'read', label: 'Mark a lecture as read', target: 1, xp: 20, icon: '📖' },
  ];
  function dailyState() {
    const d = G();
    const today = new Date().toDateString();
    if (!d.daily || d.daily.date !== today) { d.daily = { date: today, p: {} }; save(d); }
    return d.daily;
  }
  function bumpDaily(key, amt) {
    amt = amt || 1;
    const q = DAILY.find(q => q.id === key);
    if (!q) return;
    const d = G();
    const dd = dailyState();
    const before = dd.p[key] || 0;
    if (before >= q.target) return;
    dd.p[key] = Math.min(q.target, before + amt);
    save(d);
    const done = dd.p[key] >= q.target;
    if (done && before < q.target) { addXP(q.xp, 'Daily mission: ' + q.label); SFX.win(); }
    const box = document.getElementById('dailyBox');
    if (box) box.outerHTML = renderDailyHTML();
  }
  function renderDailyHTML() {
    const dd = dailyState();
    const all = DAILY.every(q => (dd.p[q.id] || 0) >= q.target);
    return `<div class="daily-box" id="dailyBox">
      <div class="daily-head"><b>⚡ Today's Missions</b><span>${all ? 'ALL DONE! 🎉' : 'resets at midnight'}</span></div>
      <div class="daily-rows">${DAILY.map(q => {
        const p = Math.min(q.target, dd.p[q.id] || 0);
        const done = p >= q.target;
        return `<div class="daily-row${done ? ' done' : ''}">
          <span class="dr-ico">${done ? '✅' : q.icon}</span>
          <span class="dr-label">${q.label}</span>
          <span class="dr-prog">${done ? 'DONE' : p + ' / ' + q.target}</span>
          <span class="dr-xp">+${q.xp} XP</span></div>`;
      }).join('')}</div></div>`;
  }

  /* ---------------- exports ---------------- */
  window.CN_GAME = {
    G, save, addXP, levelInfo, touchStreak, unlock, checkAch, ACH,
    SFX, toggleMute, isMuted: () => muted, confetti,
    onXP, sidebarHTML, mascotHTML, bindMascot, TIPS,
    DAILY, dailyState, bumpDaily, renderDailyHTML,
    floatXP, comboHit, comboReset, comboVal, rewardChest, countUp, startMesh,
  };
})();
