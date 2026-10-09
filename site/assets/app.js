/* Computer Networks — interactive site: router, views, quiz, progress. */
(function () {
  'use strict';

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let LECTURES = [];
  let meshStop = null;
  let pendingScroll = null;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('cn_progress') || '{}'); } catch (e) { return {}; } },
    set(d) { localStorage.setItem('cn_progress', JSON.stringify(d)); },
  };
  const prog = () => store.get();
  function markRead(num) {
    const d = prog(); d.l = d.l || {}; d.l[num] = d.l[num] || {};
    if (!d.l[num].read) {
      d.l[num].read = true; store.set(d);
      const g = window.CN_GAME;
      if (g) {
        g.addXP(20, 'Read Lecture ' + (num || '★'));
        g.bumpDaily('read');
        const readCount = LECTURES.filter(l => isRead(l.num)).length;
        g.checkAch({ type: 'read', readCount });
      }
    }
    refreshNav();
  }
  function unmarkRead(num) {
    const d = prog(); d.l = d.l || {};
    if (!d.l[num] || !d.l[num].read) return;
    d.l[num].read = false; store.set(d);
    const g = window.CN_GAME;
    // the read transition granted +20 XP exactly once — take it back on undo
    if (g) g.addXP(-20, 'Undo: read mark removed');
    refreshNav();
  }
  function setBest(num, pct) { const d = prog(); d.l = d.l || {}; d.l[num] = d.l[num] || {}; d.l[num].best = Math.max(d.l[num].best || 0, pct); store.set(d); refreshNav(); }
  function getBest(num) { const d = prog(); return (d.l && d.l[num] && d.l[num].best) || 0; }
  function isRead(num) { const d = prog(); return !!(d.l && d.l[num] && d.l[num].read); }
  function overallPct() {
    if (!LECTURES.length) return 0;
    let done = 0;
    LECTURES.forEach(l => { if (isRead(l.num) && getBest(l.num) >= 60) done++; });
    return Math.round(done / LECTURES.length * 100);
  }

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------------- ANSWER MAP ---------------- */
  // keys like "A3", "A12–A15", "A12/A14/A15" → map each question number to its answer text
  function answerMap(lec) {
    const map = {};
    (lec.answers || []).forEach(a => {
      const key = a.key.replace(/^A/i, '').trim();
      const nums = [];
      key.split('/').forEach(part => {
        const rng = part.match(/(\d+)\s*[–-]\s*(\d+)/);
        if (rng) { for (let i = +rng[1]; i <= +rng[2]; i++) nums.push(i); }
        else { const n = part.match(/\d+/); if (n) nums.push(+n[0]); }
      });
      nums.forEach(n => { map[n] = a.text; });
    });
    return map;
  }
  function correctLetter(ansText) {
    const m = ansText.match(/^([a-dA-D])\b/);
    return m ? m[1].toLowerCase() : null;
  }

  /* ---------------- NAV ---------------- */
  function buildNav() {
    const nav = $('#navList');
    const ICONS = {
      '#/': '🏠', '#/assignments': '📝', '#/arcade': '🕹️',
      '#/labs': '⚡', '#/quiz': '✎', '#/cheats': '📌', '#/achievements': '🏆'
    };
    const item = (href, label, ni, extra) =>
      `<a class="nav-item" href="${href}" data-route="${href}"><span class="ni">${ni}</span>${label}${extra || ''}</a>`;
    let html = `<div class="nav-sec"><div class="nav-label">🚀 Start</div>${item('#/', 'Home', '🏠')}</div>`;
    html += `<div class="nav-sec"><div class="nav-label">📚 Lectures</div>`;
    LECTURES.filter(l => l.num > 0).forEach(l => {
      const done = isRead(l.num);
      const best = getBest(l.num);
      const title = stripTags(l.title);
      html += item(`#/lecture/${l.num}`,
        `${l.num}. ${title.slice(0, 24)}${title.length > 24 ? '…' : ''}`,
        l.num,
        done ? `<span class="done">✓</span>` : (best >= 60 ? `<span class="done" style="color:var(--warn)">★</span>` : ''));
    });
    const m = LECTURES.find(l => l.num === 0);
    if (m) html += item('#/lecture/0', 'Master Revision ★', '⭐', isRead(0) ? '<span class="done">✓</span>' : '');
    html += `</div>`;
    html += `<div class="nav-sec"><div class="nav-label">🎮 Practice</div>
      ${item('#/assignments', 'Assignment Academy', '📝')}
      ${item('#/arcade', 'Game Arcade', '🕹️')}
      ${item('#/labs', 'Interactive Labs', '⚡')}
      ${item('#/quiz', 'Quizzes & Exam', '✎')}
      ${item('#/cheats', 'Cheat Sheets', '📌')}
      ${item('#/achievements', 'Achievements', '🏆')}</div>`;
    nav.innerHTML = html;
    if (window.CN_GAME) nav.insertAdjacentHTML('beforeend', window.CN_GAME.sidebarHTML());
    refreshNav();
  }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, ''); }
  function refreshNav() {
    const pct = overallPct();
    $('#navPct').textContent = pct + '%';
    $('#navBar').style.width = pct + '%';
    $$('.nav-item').forEach(a => {
      const route = a.getAttribute('data-route');
      a.classList.toggle('active', location.hash === route || (route === '#/' && (location.hash === '' || location.hash === '#')));
    });
    buildNavBadges();
  }
  function buildNavBadges() {
    $$('.nav-item').forEach(a => {
      const m = a.getAttribute('data-route').match(/^#\/lecture\/(\d+)$/);
      const badge = a.querySelector('.done');
      if (m && badge) badge.textContent = isRead(+m[1]) ? '✓' : '';
    });
  }
  function staggerCards(container) {
    Array.from(container.querySelectorAll('.lec-card,.lab-card,.ach-card')).forEach((el, i) => {
      el.style.animationDelay = (i * 55) + 'ms';
    });
  }

  /* ---------------- VIEWS ---------------- */
  const view = () => $('#view');

  function stars(l) {
    let s = 0;
    if (isRead(l.num)) s++;
    if (getBest(l.num) >= 60) s++;
    if (getBest(l.num) >= 90) s++;
    return s;
  }

  /* ── inline lab embeds + predict-then-reveal ── */
  /* ── Today's 5 (daily spaced practice) + weak-topic radar ── */
  function daily5Pool() {
    const pool = [];
    LECTURES.filter(l => l.num > 0).forEach(lec => {
      const amap = answerMap(lec);
      lec.questions.forEach(q => {
        if (!q.opts.length) return;
        const ans = amap[+q.no] || '';
        const letter = correctLetter(ans);
        if (!letter) return;
        pool.push({ id: 'L' + lec.num + 'q' + q.no, text: stripTags(q.text), opts: q.opts, letter, ans: stripTags(ans), src: 'Lecture ' + lec.num });
      });
    });
    return pool;
  }
  function todayFive() {
    let seed = 0;
    for (const ch of new Date().toDateString()) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
    const arr = daily5Pool();
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 5);
  }
  function d5State() {
    const g = window.CN_GAME; if (!g) return null;
    const today = new Date().toDateString();
    const d = g.G();
    if (!d.d5 || d.d5.date !== today) { d.d5 = { date: today, res: {} }; g.save(d); }
    return d.d5;
  }
  function daily5Section() {
    const g = window.CN_GAME; if (!g) return '';
    const picks = todayFive();
    const st = d5State();
    const done = picks.filter(p => st.res[p.id] !== undefined).length;
    const right = picks.filter(p => st.res[p.id] === true).length;
    return `<div class="home-sec" id="daily5Sec">
      <h2>⚡ Today's 5 <span class="lab-status" style="vertical-align:middle">${done}/5 answered${done === 5 ? ` · ${right} correct ${right >= 4 ? '🌟' : ''}` : ''}</span></h2>
      <div class="sub">Five questions, chosen fresh today from across the whole course. ~3 minutes.</div>
      <div id="d5Body">${picks.map((p, i) => `
        <div class="qq d5q ${st.res[p.id] !== undefined ? 'answered' : ''}" data-id="${p.id}">
          <div class="qq-meta"><span class="qq-no">${i + 1} / 5</span><span class="qq-tag">${p.src}</span></div>
          <div class="qq-text">${esc(p.text)}</div>
          <div class="qq-opts">${p.opts.map((o, j) => {
            const ol = String.fromCharCode(97 + j);
            return `<div class="opt" data-l="${ol}" role="button"><span class="ol">${ol}</span><span>${esc(o)}</span></div>`;
          }).join('')}</div>
          <div class="qq-fb"></div>
        </div>`).join('')}</div>
    </div>`;
  }
  function bindDaily5() {
    const g = window.CN_GAME; if (!g) return;
    const st = d5State();
    const picks = todayFive();
    $$('#d5Body .d5q').forEach((el, i) => {
      const p = picks[i];
      if (st.res[p.id] !== undefined) { el.classList.add('answered'); el.querySelectorAll('.opt').forEach(o => o.style.pointerEvents = 'none'); return; }
      el.querySelectorAll('.opt').forEach(opt => {
        opt.onclick = (ev) => {
          if (el._done) return;
          el._done = true;
          const chosen = opt.getAttribute('data-l');
          el.querySelectorAll('.opt').forEach(o => { if (o.getAttribute('data-l') === p.letter) o.classList.add('right'); });
          const fb = el.querySelector('.qq-fb');
          const ok = chosen === p.letter;
          if (ok) { fb.className = 'qq-fb show good'; fb.textContent = '✓ Correct — ' + p.ans; }
          else { opt.classList.add('wrong'); fb.className = 'qq-fb show bad'; fb.textContent = '✗ Answer: ' + p.letter.toUpperCase() + ' — ' + p.ans; }
          el.classList.add('answered');
          el.querySelectorAll('.opt').forEach(o => o.style.pointerEvents = 'none');
          st.res[p.id] = ok;
          g.save(Object.assign(g.G(), { d5: st }));
          if (ok) { g.addXP(8, "Today's 5"); g.bumpDaily('correct'); g.floatXP(ev.clientX, ev.clientY - 30, '+8 XP'); }
          const done = picks.filter(pp => st.res[pp.id] !== undefined).length;
          const right = picks.filter(pp => st.res[pp.id] === true).length;
          const badge = document.querySelector('#daily5Sec .lab-status');
          if (badge) badge.textContent = `${done}/5 answered${done === 5 ? ` · ${right} correct ${right >= 4 ? '🌟' : ''}` : ''}`;
          if (done === 5) {
            g.SFX.win();
            if (right >= 4) g.confetti(innerWidth / 2, innerHeight / 3, 80, ['⚡', '⭐', '🎉']);
            const note = document.createElement('p');
            note.className = 'sub';
            note.innerHTML = right >= 4 ? `<b>${right}/5 today</b> — brilliant. Come back tomorrow for five fresh ones!` : `<b>${right}/5 today</b> — tomorrow's five are a fresh draw. Streaks matter more than perfection.`;
            document.getElementById('d5Body').appendChild(note);
          }
        };
      });
    });
  }
  function weakSection() {
    const scored = LECTURES.filter(l => l.num > 0 && getBest(l.num) > 0 && getBest(l.num) < 100)
      .sort((a, b) => getBest(a.num) - getBest(b.num)).slice(0, 3);
    if (!scored.length) return '';
    return `<div class="home-sec"><h2>🎯 Sharpen your weakest</h2>
      <div class="sub">Lowest quiz scores so far — a few minutes here pays off the most.</div>
      <div class="lec-grid">${scored.map(l => `<a class="lec-card" style="--lc:${l.acc.d}" href="#/quiz/${l.num}">
        <span class="lc-no">${String(l.num).padStart(2, '0')}</span>
        <div class="lc-title">${stripTags(l.title)}</div>
        <div class="lc-badges"><span class="badge quiz">Best ${getBest(l.num)}%</span><span class="badge">→ quiz</span></div>
      </a>`).join('')}</div></div>`;
  }

  const LAB_EMBEDS = [
    { lec: 1, rx: /delay|propagation|throughput/i, lab: 'lab-delay', label: 'Delay Lab — push bits down a real link' },
    { lec: 2, rx: /encapsulat|osi|layer/i, lab: 'lab-osi3d', label: 'The OSI tower in 3D — spin it, then encapsulate' },
    { lec: 3, rx: /subnet mask|network address|binary|and operation/i, lab: 'lab-subnet', label: 'Subnet calculator — watch the 32 bits split live' },
    { lec: 5, rx: /dijkstra/i, lab: 'lab-routing', label: 'Step through Dijkstra on a real graph' },
    { lec: 8, rx: /count-to-infinity|distance vector|convergence/i, lab: 'lab-gossip', label: 'Watch routers gossip — count-to-infinity, live' },
    { lec: 9, rx: /dns|resolution|hierarch/i, lab: 'lab-dns', label: 'Climb the DNS hierarchy live' },
    { lec: 10, rx: /handshake|three-way/i, lab: 'lab-tcp', label: 'Play the three-way handshake' },
    { lec: 11, rx: /nat\b|translation/i, lab: 'lab-nat', label: 'Rewrite packets through the NAT table' },
    { lec: 11, rx: /dhcp|dora/i, lab: 'lab-dhcp', label: 'Run the DORA dance' },
    { lec: 13, rx: /journey|press enter|complete/i, lab: 'lab-journey', label: 'The complete packet journey, narrated' },
  ];
  const PREDICTS = [
    { lec: 7, rx: /ttl|time to live/i, q: "A packet's TTL hits 0 at hop 4. What does the router do?", opts: ["Forwards it anyway with TTL = 0", "Drops it and sends an ICMP Time Exceeded message back to the source", "Sends it back to the sender for a retry"], a: 1, why: "TTL = 0 → drop + ICMP Time Exceeded. Traceroute exploits exactly this by sending TTL = 1, 2, 3…" },
    { lec: 2, rx: /encapsulat/i, q: "As data travels down the stack, what does each layer do to the layer above's data?", opts: ["Reads and rewrites its headers", "Wraps it in its own header, treating it as opaque payload", "Strips the previous layer's header"], a: 1, why: "The opaque-payload principle: each layer only adds its own header — that's why TCP runs unchanged over any link layer." },
    { lec: 11, rx: /how nat works|nat translation|what gets rewritten/i, q: "Your laptop has already used public ports 40001–40004. It opens a 5th connection. What source port does NAT pick?", opts: ["40001 again — it's free now", "A fresh unused port, e.g. 40005", "Port 443, to match the website"], a: 1, why: "Each connection gets a unique public port — the port is the discriminator that lets one public IP serve everyone." },
    { lec: 11, rx: /dora/i, q: "Why does the DHCP REQUEST stay broadcast, even after the server was found?", opts: ["The client doesn't know the server's MAC yet", "So the OTHER DHCP servers hear it and withdraw their offers", "Broadcasts are faster than unicasts"], a: 1, why: "Broadcast on purpose: the losing servers hear 'I chose someone else' and cleanly withdraw their offers." },
    { lec: 5, rx: /dijkstra('s)? algorithm/i, q: "Dijkstra finalizes node X at cost 6. Later, a path of cost 4 to X is discovered. What happens?", opts: ["X's distance updates to 4", "X stays at 6 — Dijkstra never revises a finalized node", "Dijkstra restarts from scratch"], a: 1, why: "The greedy freeze — always true, and exactly why negative edges break Dijkstra (Lecture 6)." },
    { lec: 9, rx: /resolution|hierarchy|dns/i, q: "The recursive resolver already holds the answer, and the TTL is still valid. What happens on a new lookup?", opts: ["It still queries root → TLD → authoritative", "It answers from cache instantly — no hierarchy climb", "It asks the browser first"], a: 1, why: "Cache hit → instant answer. That's why the second visit to a site feels instant." },
  ];
  function embedWidget(e) {
    return `<details class="lab-embed"><summary>▶ See it live — ${esc(e.label)}</summary><div class="lab-embed-body" data-lab="${e.lab}"></div></details>`;
  }
  function predictWidget(p) {
    return `<div class="predict-card" data-a="${p.a}"><div class="pc-tag">🎯 Predict before you read on</div>
      <div class="pc-q">${esc(p.q)}</div>
      <div class="pc-opts">${p.opts.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('')}</div>
      <div class="pc-why" style="display:none"></div></div>`;
  }

  function questMapView() {
    const g = window.CN_GAME;
    const li = g ? g.levelInfo(g.G().xp) : { lvl: 1, title: 'Curious Newbie', into: 0, need: 100 };
    const zones = [
      { name: '🧭 Foundations', blurb: 'What a network even is, and why everything arrives wrapped in layers.', color: '#4f46e5', nums: [1, 2] },
      { name: '🏠 The Addressing Zone', blurb: 'Binary superpowers, subnets, masks and the AND trick.', color: '#0e7a55', nums: [3, 4] },
      { name: '🌲 Algorithm Forest', blurb: 'BFS, DFS, Dijkstra, Bellman-Ford — the maths that finds the way.', color: '#8b5cf6', nums: [5, 6] },
      { name: '🛣️ Routing Country', blurb: 'From algorithms to machines: routing tables, RIP, OSPF, BGP.', color: '#d97706', nums: [7, 8] },
      { name: '🏙️ Application Heights', blurb: 'DNS, HTTP, cookies — and the transport layer beneath them all.', color: '#2563eb', nums: [9, 10] },
      { name: '🏡 Home Territory', blurb: 'NAT, DHCP, ARP and the tools to fix any network fault.', color: '#0d9488', nums: [11, 12] },
      { name: '⛰️ The Summit', blurb: 'One packet, one story, thirteen lectures — then face the Boss.', color: '#e11d48', nums: [13, 0] },
    ];
    const lecByNum = {}; LECTURES.forEach(l => lecByNum[l.num] = l);
    let prevDone = true;
    const zoneHtml = zones.map((z, zi) => {
      const nodes = z.nums.map((n, i) => {
        const l = lecByNum[n];
        if (!l) return '';
        const s = stars(l);
        const boss = n === 0;
        const best = getBest(n);
        const ring = best > 0 ? `<svg class="mn-ring" viewBox="0 0 78 78"><circle cx="39" cy="39" r="34" fill="none" stroke="rgba(255,255,255,.0)" stroke-width="5"/>
          <circle class="ring-fill" cx="39" cy="39" r="34" fill="none" stroke="${best >= 90 ? '#fbbf24' : best >= 60 ? '#34d399' : '#93c5fd'}" stroke-width="5" stroke-linecap="round"
            stroke-dasharray="${(2 * Math.PI * 34).toFixed(1)}" stroke-dashoffset="${(2 * Math.PI * 34 * (1 - best / 100)).toFixed(1)}" transform="rotate(-90 39 39)"/></svg>` : '';
        const starHtml = boss
          ? `<span class="mn-crown">${getBest(0) >= 90 ? '👑' : getBest(0) > 0 ? '⚔️' : '🏰'}</span>`
          : `<span class="mn-stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span>`;
        const statusCls = s >= 3 ? ' done' : s > 0 ? ' started' : '';
        return `
          <div class="map-node side${i % 2}${statusCls}" data-num="${n}">
            <a class="mn-circle${boss ? ' boss' : ''}" style="--zc:${z.color}" href="#/lecture/${n}">${ring}${boss ? '👹' : n}</a>
            <div class="mn-info">
              <div class="mn-title">${boss ? 'The Final Boss' : esc(stripTags(l.title))}</div>
              <div class="mn-sub">${starHtml}${best ? `<span class="mn-hint">quiz ${best}%</span>` : ''}${boss ? ' <span class="mn-hint">70 marks, 90 minutes</span>' : !best ? ` <span class="mn-hint">${s >= 3 ? 'mastered!' : s > 0 ? 'in progress' : prevDone ? 'up next!' : 'keep going'}</span>` : ''}</div>
            </div>
          </div>`;
      }).join('');
      const out = `<div class="zone" style="--zc:${z.color}">
        <div class="zone-label"><b>${z.name}</b><span>${z.blurb}</span></div>
        <div class="zone-path">${nodes}</div>
      </div>`;
      prevDone = z.nums.every(n => stars(lecByNum[n] || { num: n }) >= 1);
      return out;
    }).join('');

    const games = (window.CN_GAMES || []).map(gm =>
      `<a class="lab-card" href="#/arcade#${gm.id}"><div class="ico">${gm.icon}</div><div class="t">${gm.title}</div><div class="d">${gm.desc.replace(/<[^>]*>/g, '').slice(0, 92)}…</div></a>`).join('');
    const doneCount = LECTURES.filter(l => l.num > 0 && stars(l) >= 1).length;
    const nextLec = LECTURES.find(l => l.num > 0 && stars(l) === 0) || LECTURES.find(l => l.num === 0);

    const readPct = Math.round(doneCount / 13 * 100);
    view().innerHTML = `
      <div class="map-head">
        <div class="mh-left">
          <div class="mh-lvl">${li.lvl}</div>
          <div>
            <h1>${esc(li.title)}</h1>
            <div class="mh-xp"><b id="mhXpNum">0</b>&thinsp;XP &nbsp;·&nbsp; ${li.need - li.into} XP to Lv.${li.lvl + 1}
              ${g ? `&nbsp;·&nbsp; 🔥&thinsp;<b>${g.G().streak.count || 0}</b>-day streak` : ''}</div>
            <div class="mh-bar"><i style="width:${Math.round(li.into / li.need * 100)}%"></i></div>
          </div>
        </div>
        <div class="mh-actions">
          <a class="btn primary" href="#/lecture/${nextLec ? nextLec.num : 0}">${doneCount ? '▶&ensp;Continue' : '▶&ensp;Start Journey'}</a>
          <a class="btn gold" href="#/arcade">🕹️&ensp;Arcade</a>
          <a class="btn soft" href="#/labs">⚡&ensp;Labs</a>
        </div>
      </div>
      <div class="home-stats-row">
        <div class="hsr-card">
          <div class="hsr-val">${doneCount}<span>/13</span></div>
          <div class="hsr-label">📚 Lectures Read</div>
          <div class="hsr-bar"><i style="width:${readPct}%"></i></div>
        </div>
        <div class="hsr-card">
          <div class="hsr-val">${g ? g.G().xp : 0}<span> XP</span></div>
          <div class="hsr-label">⚡ Total XP Earned</div>
          <div class="hsr-bar" style="--hc:var(--warn)"><i style="width:${Math.min(100,Math.round((g?g.G().xp:0)/1500*100))}%"></i></div>
        </div>
        <div class="hsr-card">
          <div class="hsr-val">${g ? (g.G().ach||[]).length : 0}<span>/15</span></div>
          <div class="hsr-label">🏆 Achievements</div>
          <div class="hsr-bar" style="--hc:#a855f7"><i style="width:${Math.round((g?(g.G().ach||[]).length:0)/15*100)}%"></i></div>
        </div>
        <div class="hsr-card">
          <div class="hsr-val">${g ? g.G().streak.count||0 : 0}<span> days</span></div>
          <div class="hsr-label">🔥 Current Streak</div>
          <div class="hsr-bar" style="--hc:#ef4444"><i style="width:${Math.min(100,Math.round((g?g.G().streak.count||0:0)/7*100))}%"></i></div>
        </div>
      </div>
      ${g ? g.renderDailyHTML() : ''}
      <div class="home-sec">
        <h2>🗺️ Learning Path</h2>
        <div class="sub">Complete each lecture, take its quiz, earn stars — zone by zone towards the Final Boss.</div>
      </div>
      <div class="map-wrap">
        ${zoneHtml}
      </div>
      ${g ? daily5Section() : ''}
      ${weakSection()}
      <div class="home-sec" style="margin-top:44px">
        <h2>🕹️ Game Arcade</h2>
        <div class="sub">Six mini-games that drill real exam skills — binary, routing, headers, memory, DNS &amp; packet forwarding.</div>
        <div class="lab-grid" id="arcadeGrid">${games}</div>
      </div>
      ${g ? g.mascotHTML() : ''}
      ${foot()}`;
    if (g) {
      g.bindMascot(view());
      staggerCards(view());
      const mh = document.querySelector('.map-head');
      if (mh) {
        if (meshStop) meshStop();
        const c = document.createElement('canvas');
        c.className = 'mesh-canvas';
        mh.prepend(c);
        meshStop = g.startMesh(c);
      }
      g.countUp(document.getElementById('mhXpNum'), g.G().xp, 900);
      bindDaily5();
    }
  }

  function arcadeView() {
    const games = window.CN_GAMES || [];
    const g = window.CN_GAME;
    const bests = g ? g.G().bests : {};
    view().className = 'view full';
    view().innerHTML = `
      <div class="page-hero page-hero--arcade">
        <div class="ph-mesh"></div>
        <div class="ph-content">
          <div class="ph-eyebrow">🎮 NetMastery</div>
          <h1>Game Arcade</h1>
          <p>Learning disguised as play. Every game scores XP and trains a real exam skill. Compete, combo, dominate.</p>
          <div class="ph-chips">
            ${games.map(gm => `<span>${gm.icon} ${gm.title}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="lab-wrap" id="arcWrap"></div>${foot()}`;
    const wrap = $('#arcWrap');
    games.forEach(gm => {
      const sec = document.createElement('div');
      sec.id = gm.id;
      const pb = gm.id === 'game-blitz' && bests.blitz ? `<span class="lab-status">🏅 PB&thinsp;${bests.blitz}</span>` : '';
      sec.innerHTML = `<div class="lab-head"><span class="ico">${gm.icon}</span><h2>${gm.title}&ensp;${pb}</h2><div class="rule"></div></div>
        <p class="lab-desc">${gm.desc}</p><div class="lab-shell"></div>`;
      wrap.appendChild(sec);
      try { gm.mount($('.lab-shell', sec)); }
      catch (e) { $('.lab-shell', sec).textContent = 'Game failed to load: ' + e.message; console.error(e); }
    });
  }

  function achievementsView() {
    const g = window.CN_GAME;
    const d = g ? g.G() : { ach: [], xp: 0 };
    const li = g ? g.levelInfo(d.xp) : null;
    const gotCount = d.ach ? d.ach.length : 0;
    const totalAch = g ? Object.keys(g.ACH).length : 15;
    const cards = Object.entries(g ? g.ACH : {}).map(([id, a]) => {
      const got = d.ach.includes(id);
      return `<div class="ach-card${got ? ' got' : ''}" title="${got ? 'Unlocked!' : 'Locked'}">
        <div class="ach-ico">${got ? a.icon : '🔒'}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        ${got ? '<div class="ach-got-badge">✓ Unlocked</div>' : ''}
      </div>`;
    }).join('');
    const readCount = LECTURES.filter(l => isRead(l.num)).length;
    view().innerHTML = `
      <div class="page-hero page-hero--ach">
        <div class="ph-mesh"></div>
        <div class="ph-content">
          <div class="ph-eyebrow">🏆 NetMastery</div>
          <h1>Achievements</h1>
          <p>Every badge is a milestone — keep learning, quizzing and exploring to unlock them all.</p>
          ${li ? `<div class="ph-stats">
            <div><b>${li.lvl}</b><span>Level</span></div>
            <div><b>${d.xp}</b><span>Total XP</span></div>
            <div><b>${gotCount}/${totalAch}</b><span>Unlocked</span></div>
            <div><b>${(d.streak||{}).count||0}</b><span>Day Streak 🔥</span></div>
            <div><b>${readCount}/13</b><span>Lectures Read</span></div>
          </div>` : ''}
        </div>
      </div>
      <div class="ach-grid">${cards}</div>
      <div class="ach-actions">
        <button class="btn ghost small" id="expProg">⬇ Export progress</button>
        <button class="btn ghost small" id="impProg">⬆ Import progress</button>
        <input type="file" id="impFile" accept="application/json" style="display:none">
        <span class="small" style="color:var(--ink-3)">Your XP, streaks, stars and badges — backed up as a file.</span>
      </div>${foot()}`;
    staggerCards(view());
    const exp = $('#expProg');
    if (exp) exp.onclick = () => {
      const data = {};
      ['cn_game', 'cn_progress', 'cn_assign', 'cn_theme'].forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = v; });
      const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cn-progress-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      toast('Progress exported — keep the file safe!');
    };
    const imp = $('#impProg'), file = $('#impFile');
    if (imp) imp.onclick = () => file.click();
    if (file) file.onchange = () => {
      const f = file.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const data = JSON.parse(rd.result);
          Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
          toast('Progress imported! 🎉');
          setTimeout(() => location.reload(), 900);
        } catch (e) { toast('Import failed — not a valid progress file.'); }
      };
      rd.readAsText(f);
    };
  }

  function foot() {
    return `<div class="site-foot">
      <span>🌐 Computer Networks · Master Study Series — Interactive Edition</span>
      <span>PDFs in <span class="mono">CN_Study_Guides/</span> · All progress saved locally in this browser 🔒</span>
    </div>`;
  }

  /* ── Mind Map: per-lecture visual overview ── */
  const LECTURE_MINDMAPS = {
    1: { center: 'Computer Networks', nodes: ['Nodes & Links','LAN/MAN/WAN','Internet Tiers','Network Edge vs Core','Packet Switching','Circuit Switching','Propagation Delay','Transmission Delay','Throughput','Hub/Switch/Router','OSI Model','TCP/IP Model'] },
    2: { center: 'Layered Comms & OSI', nodes: ['7 OSI Layers','Encapsulation','PDU Names','Data/Segment/Packet/Frame','Headers & Trailers','TCP/IP vs OSI','Protocol Stack','Opaque Payload','L2 MAC frame','L3 IP packet','L4 TCP segment','Physical bits'] },
    3: { center: 'IP Addressing & Subnets', nodes: ['IPv4 32-bit','Dotted Decimal','Binary AND','Subnet Mask','CIDR /prefix','Network Address','Broadcast Address','Usable Hosts','Classful A/B/C','Private Ranges','Special IPs','Subnetting'] },
    4: { center: 'Advanced Subnetting', nodes: ['VLSM','Subnet Borrowing','Route Aggregation','Supernetting','IPv6 Basics','128-bit Address','Hexadecimal','CIDR Notation','Network Planning','IP Hierarchy','Address Exhaustion','NAT Need'] },
    5: { center: 'Graph Algorithms', nodes: ['Dijkstra','Greedy Freeze','Priority Queue','Shortest Path','Bellman-Ford','Negative Edges','SSSP','Relaxation','Distance Table','Finalized Set','Edge Weights','Graph BFS'] },
    6: { center: 'Routing Algorithms', nodes: ['Link State','Distance Vector','Convergence','Count-to-Infinity','Split Horizon','Poison Reverse','Triggered Update','Bellman-Ford DV','Flooding','Hierarchy','AS Routing','Path Selection'] },
    7: { center: 'Internet Routing', nodes: ['Routing Table','Forwarding','RIP v1/v2','OSPF','BGP','IGP vs EGP','TTL & ICMP','Traceroute','Next Hop','Default Route','ECMP','Policy Routing'] },
    8: { center: 'Advanced Routing & DV', nodes: ['RIP Timers','OSPF LSA','SPF Tree','Area 0 Backbone','BGP Attributes','AS Path','iBGP/eBGP','Route Redistribution','Distance Vector','Count-to-Infinity','Split Horizon','Bellman-Ford'] },
    9: { center: 'DNS & Application Layer', nodes: ['DNS Hierarchy','Root Servers','.com TLD','Authoritative NS','Recursive Resolver','A/AAAA Records','MX/CNAME/TXT','DNS Cache/TTL','HTTP/1.1 vs HTTP/2','HTTPS & TLS','Cookies','Browser Flow'] },
    10: { center: 'Transport Layer & TCP', nodes: ['TCP 3-Way Handshake','SYN/SYN-ACK/ACK','Sequence Numbers','ACK Numbers','Flow Control','Congestion Control','TCP Termination','UDP Unreliable','Ports','Sockets','Multiplexing','Sliding Window'] },
    11: { center: 'NAT, DHCP & ARP', nodes: ['NAT Table','Port Translation','DORA (DHCP)','IP Lease','ARP Request/Reply','MAC to IP','ARP Cache','Private IP','PAT','APIPA 169.254','Broadcast','DHCP Server'] },
    12: { center: 'Network Tools & Security', nodes: ['ping','traceroute','nslookup','Wireshark','netstat','ipconfig','iptables','Firewall','IDS/IPS','VPN','SSL/TLS','Common Attacks'] },
    13: { center: 'Complete Packet Journey', nodes: ['Browser Enter','DNS Resolution','Root→TLD→Auth','TCP Handshake','HTTP GET','HTTP 200 OK','IP Routing','MAC Rewrite','TTL Decrement','TCP Reassembly','HTML Render','Keep-Alive'] },
    0: { center: 'All 13 Lectures', nodes: ['Networks Basics','OSI / TCP-IP','IP & Subnets','Routing Algos','Internet Routing','DNS & HTTP','TCP & UDP','NAT & DHCP','ARP & Tools','Packet Journey','Exam Prep','Mindmap Overview'] },
  };
  function mindMapHtml(num, acc) {
    const mm = LECTURE_MINDMAPS[num];
    if (!mm) return '';
    const nodes = mm.nodes.map(n => `<span class="mm-node">${esc(n)}</span>`).join('');
    return `<div class="mindmap-wrap">
      <h3>🗺️ Concept Overview</h3>
      <div class="mindmap-nodes">
        <div class="mm-center" style="background:${acc||'var(--acc)'}">${esc(mm.center)}</div>
        ${mm.nodes.map(n => `<div class="mm-spoke"><span class="mm-node">${esc(n)}</span></div>`).join('')}
      </div>
    </div>`;
  }

  function lectureView(num) {
    const lec = LECTURES.find(l => l.num === num);
    if (!lec) { view().innerHTML = '<p>Lecture not found.</p>'; return; }
    const amap = answerMap(lec);
    const next = LECTURES.find(l => l.num === num + 1);
    const prev = LECTURES.find(l => l.num === num - 1) || (num === 0 ? LECTURES.find(l => l.num === 13) : null);

    const chips = lec.chips.map(c => `<span>${esc(c)}</span>`).join('');
    const objHtml = lec.objectives.length ? `
      <div class="obj-band"><div class="ob-title">Learning objectives — after this lecture you can</div>
      <ul>${lec.objectives.map(o => `<li>${o}</li>`).join('')}</ul></div>` : '';

    PREDICTS.forEach(p => p._used = false);
    const usedEmbeds = new Set();
    const secs = lec.sections.map(s => {
      let extra = '';
      const embed = LAB_EMBEDS.find(e => e.lec === num && !usedEmbeds.has(e.lab) && e.rx.test(s.title));
      if (embed) { usedEmbeds.add(embed.lab); extra += embedWidget(embed); }
      const pred = PREDICTS.find(p => p.lec === num && !p._used && p.rx.test(s.title));
      if (pred) { pred._used = true; extra += predictWidget(pred); }
      return `<div class="sec"><div class="sec-head"><div class="num">${esc(s.num)}</div><h2>${esc(s.title)}</h2><div class="rule"></div></div>${s.html}${extra}</div>`;
    }).join('');
    const cheat = lec.cheatHtml || '';

    // inline "test yourself" — interactive MCQs, reveal answers for the rest
    const rendered = lec.questions.map(q => {
      const ans = amap[+q.no] || '';
      const letter = correctLetter(ans);
      const tag = esc(q.tag || 'Question');
      if (q.opts.length && letter) {
        const opts = q.opts.map((o, i) => {
          const ol = String.fromCharCode(97 + i);
          return `<div class="opt" data-l="${ol}" role="button"><span class="ol">${ol}</span><span>${esc(o)}</span></div>`;
        }).join('');
        return `<div class="qq" data-no="${+q.no}" data-letter="${letter}" data-ans="${esc(ans)}" data-kind="mcq">
          <div class="qq-meta"><span class="qq-no">Q${esc(q.no)}</span><span class="qq-tag">${tag}</span></div>
          <div class="qq-text">${esc(q.text)}</div>
          <div class="qq-opts">${opts}</div>
          <div class="qq-fb"></div></div>`;
      }
      return `<div class="qq" data-kind="reveal">
        <div class="qq-meta"><span class="qq-no">Q${esc(q.no)}</span><span class="qq-tag">${tag}</span></div>
        <div class="qq-text">${esc(q.text)}</div>
        <button class="btn ghost small reveal-btn">Show a model answer</button>
        <div class="qq-answer">${ans ? esc(ans) : 'Use the section above — a labelled diagram plus 3–4 crisp points earns the marks.'}</div></div>`;
    });
    const mcqH = rendered.filter(h => h.includes('data-kind="mcq"'));
    const restH = rendered.filter(h => !h.includes('data-kind="mcq"'));
    const quick = mcqH.slice(0, 3).join('');
    const rest = mcqH.slice(3).concat(restH).join('');

    const best = getBest(num);
    const starsN = stars(lec);
    view().innerHTML = `
      <div class="lec-head" style="--acc:${lec.acc.acc};--acc-d:${lec.acc.d};--acc-l:${lec.acc.l};--acc-m:${lec.acc.m}">
        <div class="mesh"></div>
        <div class="lh-no">${num === 0 ? '⭐ Master Book — All 13 Lectures' : `📖 Lecture ${num} of 13`}</div>
        <h1>${lec.title}</h1>
        <div class="lh-tag">${esc(lec.tagline)}</div>
        <div class="lh-chips">${chips}</div>
        <div class="lh-meta">
          ${starsN > 0 ? `<span class="lh-star-badge">${'★'.repeat(starsN)}${'☆'.repeat(3-starsN)} ${starsN>=3?'Mastered!':starsN>=2?'Almost there':'In progress'}</span>` : ''}
          ${best ? `<span class="lh-score-badge">Quiz best: ${best}%</span>` : ''}
        </div>
      </div>
      <div class="lec-toolbar">
        ${isRead(num)
          ? `<span class="lab-status" id="readState">✓ Marked as read</span>`
          : `<span class="lab-status-pending" id="readState">📖 Reading…</span>`}
        <span class="spacer"></span>
        <a class="btn ghost small" href="#/cheats">📌 Cheat Sheets</a>
        <a class="btn ghost small" href="#/quiz/${num}">✎ Quiz this lecture</a>
        ${!isRead(num) ? `<button class="btn primary small" id="markRead">✓ Mark as read</button>` : `<button class="btn ghost small" id="unmarkRead">↩ Undo</button>`}
      </div>
      <div class="lroot" style="--acc:${lec.acc.acc};--acc-d:${lec.acc.d};--acc-l:${lec.acc.l};--acc-m:${lec.acc.m}">
        ${mindMapHtml(num, lec.acc.acc)}
        ${objHtml}
        ${secs}
        ${cheat}
        <details class="lec-details" id="testYourselfSection">
          <summary><span style="font-size:18px">✎</span> Test Yourself <span class="ds-badge">${lec.questions.length} Qs</span><span class="ds-arrow">▶</span></summary>
          <div class="lec-details-body">
            <div class="qc-head"><span class="lab-status">⚡ Quick check — ${Math.min(3, mcqH.length)} questions · ~2 min</span><span class="small">Start here — small wins first.</span></div>
            ${quick}
            ${rest ? `<div class="qc-actions"><button class="btn ghost small" id="qcMore">📚 Show all ${lec.questions.length} questions</button></div>
            <div id="qcRest" style="display:none">${rest}</div>` : ''}
            <p class="small" style="margin-top:10px">Prefer a full scored run? Open the <a href="#/quiz/${num}">quiz view</a>.</p>
          </div>
        </details>
      </div>
      <div class="lec-nav">
        ${prev ? `<a class="btn ghost small" href="#/lecture/${prev.num}">← ${prev.num === 0 ? 'Master Book' : 'Lecture ' + prev.num}</a>` : '<span></span>'}
        ${num === 0 ? '' : `<a class="btn soft small" href="#/quiz/${num}">🎯 Take the quiz</a>`}
        ${next ? `<a class="btn primary small" href="#/lecture/${next.num}">Lecture ${next.num}: ${stripTags(next.title).slice(0, 28)}… →</a>`
               : (num === 13 ? `<a class="btn gold small" href="#/lecture/0">⭐ Master Revision →</a>` : '')}
      </div>
      ${foot()}`;

    const qcMore = $('#qcMore');
    if (qcMore) qcMore.onclick = () => {
      const r = $('#qcRest');
      const open = r.style.display !== 'none';
      r.style.display = open ? 'none' : 'block';
      qcMore.textContent = open ? `📚 Show all ${lec.questions.length} questions` : '⬆ Hide the deeper practice';
    };
    $$('.lab-embed', view()).forEach(d => {
      d.addEventListener('toggle', () => {
        const body = d.querySelector('.lab-embed-body');
        if (d.open && !body._mounted) {
          const lab = (window.CN_LABS || []).find(l => l.id === body.getAttribute('data-lab'));
          if (lab) { try { lab.mount(body); body._mounted = true; } catch (e) { body.textContent = 'Lab failed to load: ' + e.message; } }
        }
      });
    });
    $$('.predict-card', view()).forEach(pc => {
      const why = pc.querySelector('.pc-why');
      pc.querySelectorAll('.pc-opts button').forEach(b => {
        b.onclick = (ev) => {
          pc.querySelectorAll('.pc-opts button').forEach(x => x.disabled = true);
          const ok = +b.getAttribute('data-i') === pc._a;
          b.classList.add(ok ? 'right' : 'wrong');
          why.style.display = 'block';
          const g = window.CN_GAME;
          const cx = ev.clientX, cy = ev.clientY;
          if (ok) {
            why.innerHTML = '✅ ' + esc(pc._why);
            why.className = 'pc-why good';
            if (g) { g.SFX.correct(); g.floatXP(cx, cy - 30, '+4 XP'); g.bumpDaily('correct'); }
          } else {
            why.innerHTML = '❌ Not quite. ' + esc(pc._why);
            why.className = 'pc-why bad';
            if (g) { g.SFX.wrong(); g.floatXP(cx, cy - 30, '🤔', 'miss'); }
          }
        };
      });
      pc._a = +pc.getAttribute('data-a');
      const def = PREDICTS.find(p => p.q === pc.querySelector('.pc-q').textContent);
      pc._why = def ? def.why : '';
    });
    if (pendingScroll && pendingScroll.lec === num) {
      const secEls = $$('.lroot .sec');
      const t = secEls[pendingScroll.sec];
      if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      pendingScroll = null;
    }
    const mr = $('#markRead');
    if (mr) mr.onclick = () => {
      const toolbar = mr.parentNode;
      markRead(num); mr.remove();
      $('#readState').textContent = '✓ Marked as read';
      toast('Marked as read — nice work!');
      const undo = document.createElement('button');
      undo.className = 'btn ghost small'; undo.id = 'unmarkRead'; undo.textContent = '↩ Undo';
      undo.onclick = () => { unmarkRead(num); location.reload(); };
      toolbar.appendChild(undo);
    };
    const ur = $('#unmarkRead');
    if (ur) ur.onclick = () => { unmarkRead(num); toast('Read mark undone — XP returned'); location.reload(); };

    // inline MCQ interactions
    $$('.qq[data-kind="mcq"]', view()).forEach(qq => {
      const letter = qq.getAttribute('data-letter');
      const ans = qq.getAttribute('data-ans');
      const fb = $('.qq-fb', qq);
      $$('.opt', qq).forEach(opt => {
        opt.onclick = (ev) => {
          if (qq._done) return;
          qq._done = true;
          const chosen = opt.getAttribute('data-l');
          const gg = window.CN_GAME;
          const cx = ev && ev.clientX ? ev.clientX : innerWidth / 2;
          const cy = ev && ev.clientY ? ev.clientY : innerHeight / 2;
          $$('.opt', qq).forEach(o => {
            if (o.getAttribute('data-l') === letter) o.classList.add('right');
          });
          if (chosen === letter) {
            fb.className = 'qq-fb show good';
            fb.innerHTML = '✓ Correct! ' + esc(ans);
            if (gg) {
              gg.bumpDaily('correct');
              const combo = gg.comboHit();
              gg.floatXP(cx, cy, '+8 XP');
              if (combo >= 2) gg.floatXP(cx, cy - 46, '🔥 ×' + combo + ' combo', 'combo');
              if (combo === 5) { gg.addXP(15, '🔥 5-question combo!'); gg.confetti(cx, cy, 40, ['⚡', '🔥', '⭐']); }
              if (combo === 8) { gg.addXP(30, '🔥🔥 UNSTOPPABLE ×8!'); gg.confetti(cx, cy, 90, ['⚡', '🔥', '⭐', '🎉']); }
            }
          } else {
            opt.classList.add('wrong');
            fb.className = 'qq-fb show bad';
            fb.innerHTML = '✗ The answer is <b>' + letter + '</b>. ' + esc(ans);
            if (gg) { gg.comboReset(); gg.floatXP(cx, cy, '💔', 'miss'); }
          }
        };
      });
    });
    $$('.reveal-btn', view()).forEach(b => {
      b.onclick = () => {
        const ans = b.nextElementSibling;
        const showing = ans.classList.toggle('show');
        b.textContent = showing ? '⯁ Hide answer' : '▶ Show model answer';
        b.style.background = showing ? 'var(--acc)' : '';
        b.style.color = showing ? '#fff' : '';
      };
    });
    enhanceLectureCodePairs();
    // Code language switcher: find remaining pre/code blocks and add copy controls
    $$('.sec pre, .sec code, .sec .code', view()).forEach(codeEl => {
      if (codeEl.closest('.lecture-code-switch')) return;
      const txt = codeEl.textContent || '';
      const hasJava = /public\s+class|System\.out|import java/i.test(txt);
      const hasCpp  = /#include|cout|int main|std::/i.test(txt);
      if ((hasJava || hasCpp) && codeEl.parentElement && !codeEl.parentElement.classList.contains('code-block-wrap')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrap';
        const hdr = document.createElement('div');
        hdr.className = 'code-block-header';
        const langTag = document.createElement('span');
        langTag.className = 'lang-tag';
        langTag.textContent = hasJava && hasCpp ? 'Java / C++' : (hasJava ? 'Java' : 'C++');
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(codeEl.textContent); copyBtn.textContent = 'Copied!'; setTimeout(() => copyBtn.textContent = 'Copy', 1500); };
        hdr.appendChild(langTag); hdr.appendChild(copyBtn);
        codeEl.parentElement.insertBefore(wrapper, codeEl);
        wrapper.appendChild(hdr); wrapper.appendChild(codeEl);
        codeEl.classList.add('code-styled');
        if (!codeEl.tagName.match(/PRE/i)) {
          const pre = document.createElement('pre');
          pre.className = 'code-styled';
          wrapper.replaceChild(pre, codeEl);
          pre.appendChild(codeEl);
        }
      }
    });
  }

  function enhanceLectureCodePairs() {
    const heads = $$('.lroot .code-head', view());
    heads.forEach(head => {
      if (!head.isConnected || head.dataset.langMerged) return;
      const code = nextElement(head, '.code');
      const nextHead = code && nextElement(code, '.code-head');
      const nextCode = nextHead && nextElement(nextHead, '.code');
      if (!code || !nextHead || !nextCode) return;
      const h1 = head.querySelector('span:first-child');
      const h2 = nextHead.querySelector('span:first-child');
      const l1 = (head.querySelector('span:last-child') || {}).textContent || '';
      const l2 = (nextHead.querySelector('span:last-child') || {}).textContent || '';
      const sameTopic = h1 && h2 && h1.textContent.trim().toLowerCase() === h2.textContent.trim().toLowerCase();
      const javaCpp = /java/i.test(l1) && /c\+\+/i.test(l2);
      if (!sameTopic || !javaCpp) return;

      const card = document.createElement('div');
      card.className = 'lecture-code-switch';
      card.innerHTML = `
        <div class="lecture-code-top">
          <div>
            <div class="lecture-code-kicker">Code walkthrough</div>
            <div class="lecture-code-title">${esc(h1.textContent.trim())}</div>
          </div>
          <div class="lang-switcher" role="tablist">
            <button class="lang-btn active" data-lang="java" type="button">Java</button>
            <button class="lang-btn" data-lang="cpp" type="button">C++</button>
          </div>
        </div>
        <div class="lecture-code-hint">Read the idea first, then switch languages. The algorithm is the same; only containers and syntax change.</div>`;
      const javaPanel = document.createElement('div');
      javaPanel.className = 'code code-panel active';
      javaPanel.setAttribute('data-lang', 'java');
      javaPanel.innerHTML = code.innerHTML;
      const cppPanel = document.createElement('div');
      cppPanel.className = 'code code-panel';
      cppPanel.setAttribute('data-lang', 'cpp');
      cppPanel.innerHTML = nextCode.innerHTML;
      card.appendChild(javaPanel);
      card.appendChild(cppPanel);

      head.parentElement.insertBefore(card, head);
      [head, code, nextHead, nextCode].forEach(el => el.remove());
      $$('.lang-btn', card).forEach(btn => {
        btn.onclick = () => {
          $$('.lang-btn', card).forEach(b => b.classList.toggle('active', b === btn));
          $$('.code-panel', card).forEach(p => p.classList.toggle('active', p.getAttribute('data-lang') === btn.getAttribute('data-lang')));
        };
      });
    });
  }

  function nextElement(el, sel) {
    let n = el.nextElementSibling;
    while (n && !n.matches(sel)) n = n.nextElementSibling;
    return n;
  }

  /* ---------------- QUIZ ---------------- */
  function quizHub() {
    const rows = LECTURES.filter(l => l.num > 0).map(l => {
      const best = getBest(l.num);
      const s = stars(l);
      const qCount = l.questions.filter(q => q.opts.length).length;
      return `<a class="lec-card" style="--lc:${l.acc.acc}" href="#/quiz/${l.num}">
        <span class="lc-no">${String(l.num).padStart(2, '0')}</span>
        <div class="lc-title">${stripTags(l.title)}</div>
        <div class="lc-tag">${qCount} graded MCQs</div>
        <div class="lc-badges">
          ${best >= 90 ? '<span class="badge" style="background:var(--warn-bg);color:var(--warn-tx);border-color:var(--warn-bd)">🏆 ' + best + '%</span>'
            : best >= 60 ? '<span class="badge quiz">💪 ' + best + '%</span>'
            : best ? '<span class="badge quiz">📈 ' + best + '%</span>'
            : '<span class="badge">' + qCount + ' MCQs</span>'}
          ${s >= 3 ? '<span class="badge read">✓ Mastered</span>' : s > 0 ? '<span class="badge" style="background:var(--info-bg);color:var(--info-tx);border-color:var(--info-bd)">In Progress</span>' : ''}
        </div>
      </a>`;
    }).join('');
    view().innerHTML = `
      <div class="page-hero page-hero--quiz">
        <div class="ph-mesh"></div>
        <div class="ph-content">
          <div class="ph-eyebrow">✎ NetMastery</div>
          <h1>Quizzes &amp; Exam</h1>
          <p>Graded MCQs per lecture with instant feedback, model answers for written questions. Each correct answer earns XP. Build combos for bonus rewards!</p>
        </div>
      </div>
      <div class="lec-grid">${rows}
        <a class="lec-card" style="--lc:#e11d48;border-top-color:#e11d48" href="#/quiz/0">
          <span class="lc-no" style="color:#e11d48">👹</span>
          <div class="lc-title">Final Boss — Mock Exam</div>
          <div class="lc-tag">70 marks, 90 minutes — full-course dress rehearsal.</div>
          <div class="lc-badges">
            ${getBest(0) >= 90 ? '<span class="badge" style="background:var(--warn-bg);color:var(--warn-tx);border-color:var(--warn-bd)">👑 Boss Defeated ' + getBest(0) + '%</span>'
              : getBest(0) ? '<span class="badge quiz">⚔️ Best ' + getBest(0) + '%</span>'
              : '<span class="badge" style="background:var(--err-bg);color:var(--err);border-color:var(--err-bd)">Exam Mode</span>'}
          </div>
        </a>
      </div>${foot()}`;
    staggerCards(view());
  }

  function quizView(num) {
    const lec = LECTURES.find(l => l.num === num);
    if (!lec) { view().innerHTML = '<p>Quiz not found.</p>'; return; }
    const amap = answerMap(lec);
    const mcqs = lec.questions.filter(q => q.opts.length && amap[+q.no] && correctLetter(amap[+q.no]));
    const written = lec.questions.filter(q => !(q.opts.length && amap[+q.no] && correctLetter(amap[+q.no])));
    const isExam = num === 0;
    const exam = isExam;

    view().innerHTML = `
      <div class="quiz-head">
        <a class="btn ghost small" href="#/quiz">← All quizzes</a>
        <h1 style="font-family:var(--serif); font-size:26px; margin:0">${exam ? 'Mock Exam' : 'Quiz — Lecture ' + num + ': ' + stripTags(lec.title)}</h1>
        <span class="spacer" style="flex:1"></span>
        <span class="quiz-score" id="quizScore">Score 0 / ${mcqs.length}</span>
      </div>
      <p class="small" style="color:var(--ink-3)">Answer every MCQ — your score updates live. Written questions reveal model answers for self-checking.</p>
      <div id="quizList"></div>
      <div id="quizDone" style="display:none" class="card acc lroot">
        <div class="card acc"><div class="c-title">🎉 Finished!</div>
          <p id="doneMsg"></p>
          <button class="btn ghost small" id="retryQuiz">Retry</button>
          <a class="btn ghost small" href="#/lecture/${num}">Back to the lecture</a>
        </div>
      </div>
      ${foot()}`;

    const list = $('#quizList');
    let answered = 0, correct = 0, maxCombo = 0;
    const scoreEl = () => $('#quizScore');

    // Boss battle chrome for the mock exam
    if (exam) {
      document.querySelector('.quiz-head').classList.add('boss');
      const hp = document.createElement('div');
      hp.className = 'boss-hp';
      hp.innerHTML = `<span class="bh-label">👹 BOSS HP</span><span class="bar"><i id="bossHpFill" style="width:100%"></i></span><b id="bossHpTxt">100%</b>`;
      document.querySelector('.quiz-head').appendChild(hp);
    }
    const hitBoss = () => {
      if (!exam) return;
      const pct = Math.max(0, 100 - Math.round(answered / mcqs.length * 100));
      const f = document.getElementById('bossHpFill');
      if (f) f.style.width = pct + '%';
      const t = document.getElementById('bossHpTxt');
      if (t) t.textContent = pct + '%';
    };

    mcqs.forEach((q, idx) => {
      const ans = amap[+q.no];
      const letter = correctLetter(ans);
      const el = document.createElement('div');
      el.className = 'qq';
      el.innerHTML = `<div class="qq-meta"><span class="qq-no">${idx + 1} / ${mcqs.length}</span><span class="qq-tag">MCQ</span></div>
        <div class="qq-text">${esc(q.text)}</div>
        <div class="qq-opts">${q.opts.map((o, i) => {
          const ol = String.fromCharCode(97 + i);
          return `<div class="opt" data-l="${ol}" role="button"><span class="ol">${ol}</span><span>${esc(o)}</span></div>`;
        }).join('')}</div>
        <div class="qq-fb"></div>`;
      $$('.opt', el).forEach(opt => {
        opt.onclick = (ev) => {
          if (el._done) return;
          el._done = true;
          const chosen = opt.getAttribute('data-l');
          $$('.opt', el).forEach(o => { if (o.getAttribute('data-l') === letter) o.classList.add('right'); });
          const fb = $('.qq-fb', el);
          const gg = window.CN_GAME;
          const cx = ev && ev.clientX ? ev.clientX : innerWidth / 2;
          const cy = ev && ev.clientY ? ev.clientY : innerHeight / 2;
          if (chosen === letter) {
            correct++;
            fb.className = 'qq-fb show good';
            fb.textContent = '✓ Correct — ' + ans;
            if (gg) {
              gg.bumpDaily('correct');
              const combo = gg.comboHit();
              if (combo > maxCombo) maxCombo = combo;
              gg.floatXP(cx, cy, '+8 XP');
              if (combo >= 2) gg.floatXP(cx, cy - 46, '🔥 ×' + combo + ' combo', 'combo');
              if (combo === 5) { gg.addXP(15, '🔥 5-question combo!'); gg.confetti(cx, cy, 40, ['⚡', '🔥', '⭐']); }
              if (combo === 8) { gg.addXP(30, '🔥🔥 UNSTOPPABLE ×8!'); gg.confetti(cx, cy, 90, ['⚡', '🔥', '⭐', '🎉']); }
            }
          } else {
            opt.classList.add('wrong');
            fb.className = 'qq-fb show bad';
            fb.textContent = '✗ Answer: ' + letter.toUpperCase() + ' — ' + ans;
            if (gg) { gg.comboReset(); gg.floatXP(cx, cy, '💔', 'miss'); }
          }
          answered++;
          hitBoss();
          scoreEl().textContent = `Score ${correct} / ${mcqs.length}`;
          if (answered === mcqs.length) finish();
        };
      });
      list.appendChild(el);
    });

    if (written.length) {
      const h = document.createElement('div');
      h.innerHTML = `<div class="lab-head"><h2 style="font-size:19px">Written questions — self-check</h2><div class="rule"></div></div>`;
      list.appendChild(h);
      written.forEach(q => {
        const ans = amap[+q.no] || '';
        const el = document.createElement('div');
        el.className = 'qq';
        el.innerHTML = `<div class="qq-meta"><span class="qq-no">Q${esc(q.no)}</span><span class="qq-tag">${esc(q.tag || 'Long')}</span></div>
          <div class="qq-text">${esc(q.text)}</div>
          <button class="btn ghost small reveal-btn">Show a model answer</button>
          <div class="qq-answer">${ans ? esc(ans) : 'Reproduce the labelled diagram from the lecture and make 3–4 crisp points.'}</div>`;
        list.appendChild(el);
        $('.reveal-btn', el).onclick = e => {
          const a = $('.qq-answer', el); a.classList.toggle('show');
          e.target.textContent = a.classList.contains('show') ? 'Hide answer' : 'Show a model answer';
        };
      });
    }

    function finish() {
      const pct = Math.round(correct / mcqs.length * 100);
      setBest(num, pct);
      const g = window.CN_GAME;
      const xpGain = correct * 8 + (pct >= 100 ? 25 : 0) + (maxCombo >= 5 ? 15 : 0);
      if (g) {
        g.addXP(xpGain, `Quiz ${num === 0 ? 'exam' : num}: ${pct}%`);
        g.checkAch({ type: 'quiz', num, pct });
        g.rewardChest({
          title: exam ? (pct >= 90 ? '👑 BOSS DEFEATED!' : pct >= 60 ? '⚔️ Boss wounded!' : '💀 The boss survives…') :
                 pct >= 90 ? '🏆 Lecture mastered!' : pct >= 60 ? '💪 Solid run!' : '📦 Round complete!',
          lines: [
            `Score <b>${correct} / ${mcqs.length}</b> (${pct}%)`,
            maxCombo >= 2 ? `Best combo: <b>🔥 ×${maxCombo}</b>` : 'Build a 🔥 combo for bonus XP',
            pct >= 90 ? 'You OWN this material.' : pct >= 60 ? 'One more pass and it’s yours.' : 'Re-read the lecture, then crush the retry.',
          ],
          xp: xpGain,
        });
      }
      $('#quizDone').style.display = 'block';
      $('#doneMsg').innerHTML = `You scored <b>${correct} / ${mcqs.length} (${pct}%)</b>. ` +
        (pct >= 80 ? 'Excellent — exam ready on this material! 🌟' : pct >= 60 ? 'Solid. Skim the lecture once more and retry the tricky ones.' :
          'Good start — re-read the lecture sections, then retry; your best score is kept.');
      if (pct >= 100 && g) g.confetti();
      $('#quizDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    $('#retryQuiz').onclick = () => quizView(num);
  }

  /* ---------------- CHEAT SHEETS ---------------- */
  function cheatView() {
    const lecs = LECTURES.filter(l => l.cheatHtml);
    const toc = lecs.map(l =>
      `<a href="#cheat-${l.num}" class="cheat-toc-item" style="--lc:${l.acc.acc}">
        <span class="ct-no">${l.num === 0 ? '⭐' : l.num}</span>
        <span>${l.num === 0 ? 'Master Book' : stripTags(l.title).slice(0, 32)}</span>
      </a>`).join('');
    const cards = lecs.map(l => `
      <div class="lab-head" id="cheat-${l.num}"><span class="ico">📌</span>
        <h2>${l.num === 0 ? '⭐ Master Book' : 'Lecture ' + l.num} — ${stripTags(l.title)}</h2><div class="rule"></div></div>
      <div class="lroot" style="--acc:${l.acc.acc};--acc-d:${l.acc.d};--acc-l:${l.acc.l};--acc-m:${l.acc.m}">${l.cheatHtml}</div>
      <div style="text-align:right;margin:8px 0 32px"><a href="#" class="btn ghost small" style="font-size:11px">↑ Back to top</a></div>`).join('');
    view().innerHTML = `
      <div class="page-hero page-hero--cheat">
        <div class="ph-mesh"></div>
        <div class="ph-content">
          <div class="ph-eyebrow">📌 NetMastery</div>
          <h1>Cheat Sheets</h1>
          <p>Every lecture's rapid-revision card in one place — perfect for the night before the exam. Scan, don't read.</p>
        </div>
      </div>
      <div class="cheat-toc">${toc}</div>
      ${cards}${foot()}`;
  }

  /* ---------------- LABS ---------------- */
  function labsView() {
    const labs = window.CN_LABS || [];
    const g = window.CN_GAME;
    view().className = 'view full';
    view().innerHTML = `
      <div class="page-hero page-hero--labs">
        <div class="ph-mesh"></div>
        <div class="ph-content">
          <div class="ph-eyebrow">⚡ NetMastery</div>
          <h1>Interactive Labs</h1>
          <p>Real network behaviour you can poke, drag, break and watch repair itself — live in your browser. No setup, no installs, just networks doing what networks do.</p>
          <div class="ph-chips">${labs.map(l => `<span>${l.icon} ${l.title}</span>`).join('')}</div>
        </div>
      </div>
      <div class="lab-wrap" id="labWrap"></div>${foot()}`;
    const wrap = $('#labWrap');
    labs.forEach(l => {
      const sec = document.createElement('div');
      sec.id = l.id;
      sec.innerHTML = `<div class="lab-head"><span class="ico">${l.icon}</span><h2>${l.title}</h2><div class="rule"></div></div>
        <p class="lab-desc">${l.desc}</p><div class="lab-shell"></div>`;
      wrap.appendChild(sec);
      try {
        l.mount($('.lab-shell', sec));
        if (g && !g.G().labXP[l.id]) {
          g.G().labXP[l.id] = true; g.save(g.G());
          g.addXP(5, 'Explored a lab');
          const doneCount = Object.keys(g.G().labXP).length;
          g.checkAch({ type: 'lab', doneCount });
        }
      }
      catch (e) { $('.lab-shell', sec).textContent = 'Lab failed to load: ' + e.message; console.error(e); }
    });
  }

  /* ---------------- SEARCH PALETTE (Ctrl/Cmd+K) ---------------- */
  let searchIndex = null;
  function buildSearchIndex() {
    searchIndex = [];
    LECTURES.forEach(l => l.sections.forEach((sec, i) => {
      searchIndex.push({
        type: '📖 ' + (l.num === 0 ? 'Master' : 'Lecture ' + l.num),
        title: sec.num + '. ' + sec.title,
        sub: stripTags(sec.html).replace(/\s+/g, ' ').slice(0, 120),
        go() {
          if (location.hash === '#/lecture/' + l.num) { pendingScroll = { lec: l.num, sec: i }; route(); }
          else { pendingScroll = { lec: l.num, sec: i }; location.hash = '#/lecture/' + l.num; }
        },
      });
    }));
    (window.CN_LABS || []).forEach(l => searchIndex.push({
      type: '⚡ Lab', title: l.title,
      sub: (l.desc || '').replace(/<[^>]*>/g, '').slice(0, 120),
      go() { location.hash = '#/labs'; setTimeout(() => { const t = document.getElementById(l.id); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 250); },
    }));
    (window.CN_ASSIGNMENTS || []).forEach(a => searchIndex.push({
      type: '📝 Assignment', title: a.title,
      sub: a.mcqs.length + ' exam MCQs' + (a.coding ? ' + ' + a.coding.length + ' coding problems' : ''),
      go() { location.hash = '#/assignment/' + a.id; },
    }));
    (window.CN_GAMES || []).forEach(gm => searchIndex.push({
      type: '🕹️ Game', title: gm.title,
      sub: (gm.desc || '').replace(/<[^>]*>/g, '').slice(0, 120),
      go() { location.hash = '#/arcade'; setTimeout(() => { const t = document.getElementById(gm.id); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 250); },
    }));
  }
  function openSearch() {
    if ($('#searchOverlay')) return;
    if (!searchIndex) buildSearchIndex();
    const ov = document.createElement('div');
    ov.id = 'searchOverlay';
    ov.innerHTML = `<div class="search-panel">
      <input id="searchInput" placeholder="Search concepts, labs, games, assignments…" autocomplete="off">
      <div id="searchResults"></div>
      <div class="search-hint">↑ click a result · esc closes · ${searchIndex.length} things indexed</div>
    </div>`;
    document.body.appendChild(ov);
    const input = $('#searchInput', ov), res = $('#searchResults', ov);
    const render = q => {
      const ql = q.trim().toLowerCase();
      const hits = !ql ? searchIndex.slice(0, 8) : searchIndex.map(e => {
        const t = e.title.toLowerCase(), sub = e.sub.toLowerCase();
        const ti = t.indexOf(ql), si = sub.indexOf(ql);
        return { e, score: ti === 0 ? 0 : ti > 0 ? 1 : si >= 0 ? 2 : 99 };
      }).filter(x => x.score < 99).sort((a, b) => a.score - b.score).slice(0, 12).map(x => x.e);
      res.innerHTML = hits.length
        ? hits.map(e => `<div class="search-hit" data-i="${searchIndex.indexOf(e)}"><span class="sh-type">${esc(e.type)}</span><span class="sh-body"><span class="sh-title">${esc(e.title)}</span><span class="sh-sub">${esc(e.sub)}</span></span></div>`).join('')
        : '<div class="search-hint" style="padding:14px">No matches — try "subnet", "DNS", "handshake"…</div>';
      $$('.search-hit', res).forEach(h => h.onclick = () => { ov.remove(); searchIndex[+h.getAttribute('data-i')].go(); });
    };
    input.oninput = () => render(input.value);
    input.onkeydown = e => { if (e.key === 'Enter') { const first = $('.search-hit', res); if (first) first.click(); } };
    ov.onclick = e => { if (e.target === ov) ov.remove(); };
    const escH = e => { if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', escH); } };
    document.addEventListener('keydown', escH);
    render('');
    setTimeout(() => input.focus(), 60);
  }
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  });

  /* ---------------- ROUTER ---------------- */
  function route() {
    const h = location.hash || '#/';
    $('#sidebar').classList.remove('open');
    const view0 = $('#view');
    // teardown running sims & backgrounds
    if (meshStop) { meshStop(); meshStop = null; }
    if (window.BG3D) window.BG3D.stop();
    if (window.CN_LABS) window.CN_LABS.forEach(l => l.teardown && l.teardown());
    view0.className = 'view';

    let m;
    if (h === '#/' || h === '#') { questMapView(); if (window.BG3D) window.BG3D.home(); }
    else if ((m = h.match(/^#\/lecture\/(\d+)$/))) {
      lectureView(+m[1]);
      if (window.BG3D) window.BG3D.lecture(+m[1]);
    }
    else if (h === '#/labs') { labsView(); if (window.BG3D) window.BG3D.labs(); }
    else if (h === '#/arcade') { arcadeView(); if (window.BG3D) window.BG3D.arcade(); }
    else if (h === '#/assignments') { window.CN_ASSIGN_VIEW.hub(); if (window.BG3D) window.BG3D.assignments(); }
    else if ((m = h.match(/^#\/assignment\/(\d+)$/))) { window.CN_ASSIGN_VIEW.section(+m[1]); if (window.BG3D) window.BG3D.assignments(); }
    else if (h === '#/achievements') { achievementsView(); if (window.BG3D) window.BG3D.achievements(); }
    else if (h === '#/quiz') { quizHub(); if (window.BG3D) window.BG3D.quiz(350, 270); }
    else if ((m = h.match(/^#\/quiz\/(\d+)$/))) { quizView(+m[1]); if (window.BG3D) window.BG3D.quiz(350, 20); }
    else if (h === '#/cheats') { cheatView(); if (window.BG3D) window.BG3D.cheats(); }
    else { questMapView(); if (window.BG3D) window.BG3D.home(); }
    refreshNav();
    if (window.CN_GAME) {
      window.CN_GAME.touchStreak();
      const panel = document.querySelector('.game-panel');
      if (panel) panel.outerHTML = window.CN_GAME.sidebarHTML();
      const mb = document.getElementById('muteBtn');
      if (mb) mb.onclick = () => {
        const muted = window.CN_GAME.toggleMute();
        mb.textContent = muted ? '🔇' : '🔊';
      };
    }
    if (!h.includes('#/labs') && !h.includes('#/arcade')) window.scrollTo(0, 0);
  }

  async function boot() {
    try {
      const res = await fetch('data/lectures.json?v=18');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      LECTURES = await res.json();
    } catch (e) {
      $('#view').innerHTML = `<div class="card acc lroot" style="max-width:660px;margin:60px auto">
        <div class="c-title">📡 The site can't reach its files</div>
        <p>This site runs from a tiny local server. Start it in a Terminal:</p>
        <div class="code">cd ~/Desktop/ComputerNetworks/site
python3 -m http.server 8765</div>
        <p class="small">Then refresh this page. Don't worry — your XP, streaks and badges are saved and safe.</p>
      </div>`;
      return;
    }
    LECTURES.sort((a, b) => (a.num === 0 ? 99 : a.num) - (b.num === 0 ? 99 : b.num));
    buildNav();
    window.addEventListener('hashchange', route);
    $('#navToggle').onclick = () => $('#sidebar').classList.toggle('open');
    buildSearchIndex();
    if (window.CN_GAME) window.CN_GAME.onXP(() => {
      const pct = overallPct();
      $('#navPct').textContent = pct + '%';
      $('#navBar').style.width = pct + '%';
    });
    route();
  }
  boot();
})();
