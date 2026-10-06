/* Computer Networks — interactive site: router, views, quiz, progress. */
(function () {
  'use strict';

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let LECTURES = [];
  let meshStop = null;
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
      <div class="ach-grid">${cards}</div>${foot()}`;
    staggerCards(view());
  }

  function foot() {
    return `<div class="site-foot">
      <span>🌐 Computer Networks · Master Study Series — Interactive Edition</span>
      <span>PDFs in <span class="mono">CN_Study_Guides/</span> · All progress saved locally in this browser 🔒</span>
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

    const secs = lec.sections.map(s => `<div class="sec"><div class="sec-head"><div class="num">${esc(s.num)}</div><h2>${esc(s.title)}</h2><div class="rule"></div></div>${s.html}</div>`).join('');
    const cheat = lec.cheatHtml || '';

    // inline "test yourself" — interactive MCQs, reveal answers for the rest
    const qsHtml = lec.questions.map(q => {
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
    }).join('');

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
        ${!isRead(num) ? `<button class="btn primary small" id="markRead">✓ Mark as read</button>` : ''}
      </div>
      <div class="lroot" style="--acc:${lec.acc.acc};--acc-d:${lec.acc.d};--acc-l:${lec.acc.l};--acc-m:${lec.acc.m}">
        ${objHtml}
        ${secs}
        ${cheat}
        <div class="sec"><div class="sec-head"><div class="num">✎</div><h2>Test yourself</h2><div class="rule"></div></div>
          <p class="small">MCQs grade instantly — earn +8 XP each. Build combos for bonus XP! Prefer a full scored run? Open the <a href="#/quiz/${num}">quiz view</a>.</p>
          ${qsHtml}
        </div>
      </div>
      <div class="lec-nav">
        ${prev ? `<a class="btn ghost small" href="#/lecture/${prev.num}">← ${prev.num === 0 ? 'Master Book' : 'Lecture ' + prev.num}</a>` : '<span></span>'}
        ${num === 0 ? '' : `<a class="btn soft small" href="#/quiz/${num}">🎯 Take the quiz</a>`}
        ${next ? `<a class="btn primary small" href="#/lecture/${next.num}">Lecture ${next.num}: ${stripTags(next.title).slice(0, 28)}… →</a>`
               : (num === 13 ? `<a class="btn gold small" href="#/lecture/0">⭐ Master Revision →</a>` : '')}
      </div>
      ${foot()}`;

    const mr = $('#markRead');
    if (mr) mr.onclick = () => { markRead(num); mr.remove(); $('#readState').textContent = '✓ Marked as read'; toast('Marked as read — nice work!'); };

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
      b.onclick = () => { b.nextElementSibling.classList.toggle('show'); b.textContent = b.textContent.includes('Show') ? 'Hide answer' : 'Show a model answer'; };
    });
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
    const res = await fetch('data/lectures.json?v=17');
    LECTURES = await res.json();
    LECTURES.sort((a, b) => (a.num === 0 ? 99 : a.num) - (b.num === 0 ? 99 : b.num));
    buildNav();
    window.addEventListener('hashchange', route);
    $('#navToggle').onclick = () => $('#sidebar').classList.toggle('open');
    if (window.CN_GAME) window.CN_GAME.onXP(() => {
      const pct = overallPct();
      $('#navPct').textContent = pct + '%';
      $('#navBar').style.width = pct + '%';
    });
    route();
  }
  boot();
})();
