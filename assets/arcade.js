/* ============================================================
   NetMastery — Game Arcade  (v15 — full visual overhaul)
   Six deeply visual, canvas-powered mini-games.
   ============================================================ */
(function () {
  'use strict';
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));
  const shuffle = a => { a = a.slice(); for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const G = () => window.CN_GAME;
  const GAMES = [];

  /* ── shared helpers ── */
  function xpBurst(shell, xp) {
    if (G()) G().addXP(xp, '');
    const b = el('div', 'game-xp-burst', `+${xp} XP ⚡`);
    shell.appendChild(b);
    setTimeout(() => b.remove(), 1400);
  }

  function resultCard(shell, title, lines, xp) {
    if (G()) { G().bumpDaily('arcade'); if (xp) G().addXP(xp, title); G().checkAch({ type: 'arcade' }); }
    const card = el('div', 'game-result-card');
    card.innerHTML = `
      <div class="grc-glow"></div>
      <div class="grc-icon">${title.split(' ')[0]}</div>
      <div class="grc-title">${title.replace(/^\S+\s/, '')}</div>
      ${lines.map(l => `<div class="grc-line">${l}</div>`).join('')}
      ${xp ? `<div class="grc-xp">+${xp} XP earned!</div>` : ''}
    `;
    shell.appendChild(card);
    setTimeout(() => card.classList.add('show'), 30);
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ================================================================
     1 ▸ BINARY BLITZ — neon speed rounds
  ================================================================ */
  GAMES.push({
    id: 'game-blitz', icon: '🔢', title: 'Binary Blitz',
    desc: '60-second binary speed drill. Convert decimals↔binary as fast as you can. Chain correct answers for combo multipliers — this is THE subnetting superpower.',
    mount(shell) {
      let score = 0, combo = 0, maxCombo = 0, left = 60, timer = null, cur = null, over = false;
      const best = () => (G() && G().G().bests && G().G().bests.blitz) || 0;

      shell.innerHTML = `
        <div class="bz-arena">
          <canvas class="bz-bg" id="bzBg"></canvas>
          <div class="bz-hud">
            <div class="bz-hud-cell">
              <div class="bz-hud-val" id="bzTime">60</div>
              <div class="bz-hud-lbl">seconds</div>
            </div>
            <div class="bz-hud-cell bz-score-cell">
              <div class="bz-hud-val neon-green" id="bzScore">0</div>
              <div class="bz-hud-lbl">score</div>
            </div>
            <div class="bz-hud-cell">
              <div class="bz-hud-val neon-gold" id="bzCombo">×1</div>
              <div class="bz-hud-lbl">combo</div>
            </div>
            <div class="bz-hud-cell">
              <div class="bz-hud-val neon-purple">${best()}</div>
              <div class="bz-hud-lbl">best</div>
            </div>
          </div>
          <div class="bz-timer-bar"><div class="bz-timer-fill" id="bzFill"></div></div>
          <div class="bz-question" id="bzQ">
            <button class="btn primary" id="bzStart" style="font-size:18px;padding:14px 40px">▶ Start Blitz</button>
          </div>
          <div class="bz-opts" id="bzOpts"></div>
        </div>`;

      /* neon particle background */
      const canvas = shell.querySelector('#bzBg');
      const ctx = canvas.getContext('2d');
      let pts = [], W, H, rafId;
      function resizeBz() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        pts = Array.from({length:30}, () => ({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-.5)*.6, vy: (Math.random()-.5)*.6,
          hue: 120+Math.random()*60, r: 1+Math.random()*2
        }));
      }
      function animBz() {
        ctx.clearRect(0,0,W,H);
        pts.forEach(p => {
          p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H;
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*6);
          g.addColorStop(0,`hsla(${p.hue},100%,70%,.7)`);
          g.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        });
        rafId = requestAnimationFrame(animBz);
      }
      resizeBz(); animBz();
      const onBzResize = () => resizeBz();
      window.addEventListener('resize', onBzResize);
      window.addEventListener('route:away', () => window.removeEventListener('resize', onBzResize), { once: true });

      function newQ() {
        const toBin = Math.random() < .5;
        const n = 1 + Math.floor(Math.random()*254);
        const correctAns = toBin ? n.toString(2).padStart(8,'0') : String(n);
        const qText = toBin ? String(n) : n.toString(2).padStart(8,'0');
        cur = { correctAns };
        const wrongs = new Set();
        while(wrongs.size < 3) {
          const w = 1+Math.floor(Math.random()*254);
          const val = toBin ? w.toString(2).padStart(8,'0') : String(w);
          if(val !== correctAns) wrongs.add(val);
        }
        const opts = shuffle([correctAns, ...wrongs]);
        const qEl = $('#bzQ', shell);
        qEl.innerHTML = `
          <div class="bz-qtype">${toBin ? 'decimal → binary' : 'binary → decimal'}</div>
          <div class="bz-qnum">${qText}</div>`;
        const optsEl = $('#bzOpts', shell);
        optsEl.innerHTML = opts.map(o =>
          `<button class="bz-opt" data-v="${o}">${o}</button>`
        ).join('');
        $$('.bz-opt', shell).forEach(b => b.onclick = () => answer(b));
      }

      function answer(btn) {
        if(over) return;
        const ok = btn.getAttribute('data-v') === cur.correctAns;
        $$('.bz-opt', shell).forEach(b => {
          if(b.getAttribute('data-v') === cur.correctAns) b.classList.add('bz-right');
        });
        if(ok) {
          combo++; maxCombo = Math.max(maxCombo, combo);
          score += 10 * Math.min(combo, 8);
          btn.classList.add('bz-right');
          if(G()) G().SFX.correct();
        } else {
          combo = 0;
          btn.classList.add('bz-wrong');
          if(G()) G().SFX.wrong();
        }
        $('#bzScore', shell).textContent = score;
        $('#bzCombo', shell).textContent = '×' + Math.min(combo+1||1, 8);
        if(combo >= 3) $('#bzCombo', shell).style.animation = 'comboPulse .4s ease';
        setTimeout(newQ, ok ? 160 : 420);
      }

      function start() {
        score=0; combo=0; maxCombo=0; left=60; over=false;
        clearInterval(timer);
        timer = setInterval(() => {
          left--;
          const el = $('#bzTime', shell);
          if(el) el.textContent = left;
          const fill = $('#bzFill', shell);
          if(fill) {
            fill.style.width = (left/60*100)+'%';
            fill.style.background = left>20 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f97316)';
          }
          if(left<=10 && left>0 && G()) G().SFX.tick();
          if(left<=0) end();
        }, 1000);
        newQ();
      }

      function end() {
        over=true; clearInterval(timer);
        cancelAnimationFrame(rafId);
        if(G()) {
          const b = Math.max(G().G().bests && G().G().bests.blitz || 0, score);
          if(!G().G().bests) G().G().bests = {};
          G().G().bests.blitz = b; G().save(G().G());
          G().SFX.win(); G().confetti();
          G().checkAch({ type: 'blitz', combo: maxCombo });
        }
        const xp = Math.round(score/8);
        shell.querySelector('.bz-question').innerHTML = '';
        shell.querySelector('.bz-opts').innerHTML = '';
        resultCard(shell, `⏱ Time! ${score} points`,
          [`🔥 Max combo: <b>×${Math.min(maxCombo+1,8)}</b>`,
           `🏆 Personal best: <b>${G() && G().G().bests && G().G().bests.blitz || score}</b>`,
           'Binary fluency = subnetting speed. Run it again!'], xp);
      }

      shell.addEventListener('click', e => {
        if(e.target.id === 'bzStart') start();
      });
    },
  });

  /* ================================================================
     2 ▸ PACKET RUSH — animated canvas graph routing
  ================================================================ */
  GAMES.push({
    id: 'game-rush', icon: '🚦', title: 'Packet Rush',
    desc: 'You ARE the router. A packet appears — click the next hop toward the server. Every correct hop scores points; wrong hops cost TTL. Deliver 8 packets before losing 3.',
    mount(shell) {
      /* graph */
      const nodes = {
        A:{x:.12,y:.15}, B:{x:.35,y:.08}, C:{x:.60,y:.14}, S:{x:.86,y:.10},
        D:{x:.18,y:.42}, E:{x:.43,y:.38}, F:{x:.67,y:.44},
        G:{x:.10,y:.70}, H:{x:.38,y:.68}, I:{x:.64,y:.73},
      };
      const edges = [['A','B'],['A','D'],['A','G'],['B','C'],['B','E'],['C','S'],['C','F'],
        ['D','E'],['D','H'],['E','F'],['E','H'],['F','S'],['F','I'],['G','H'],['H','I'],
        ['I','S'],['G','D'],['S','F']];
      const nbrs = {}; Object.keys(nodes).forEach(k => nbrs[k]=[]);
      edges.forEach(([a,b]) => { nbrs[a].push(b); nbrs[b].push(a); });
      const dist={S:0}, bq=['S'];
      while(bq.length) { const u=bq.shift(); nbrs[u].forEach(v => { if(dist[v]===undefined){dist[v]=dist[u]+1;bq.push(v);} }); }

      let packet=null, delivered=0, lost=0, points=0, busy=false, over=false;
      let trails=[], flashes=[], rafId=null;
      let W=700, H=420;

      shell.innerHTML = `
        <div class="pr-wrap">
          <div class="pr-hud">
            <div class="pr-hud-item"><span class="pr-val neon-green" id="prDel">0</span><span>/8 delivered</span></div>
            <div class="pr-hud-item"><span class="pr-val" id="prPts">0</span><span>pts</span></div>
            <div class="pr-hud-item"><span class="pr-val" id="prTtl">—</span><span>TTL</span></div>
            <div class="pr-hud-item neon-red"><span class="pr-val" id="prLost">0</span><span>/3 lost</span></div>
            <button class="btn primary small" id="prStart">▶ Start shift</button>
          </div>
          <div class="pr-status" id="prStatus">Click ▶ to begin routing packets!</div>
          <div class="pr-canvas-shell">
            <canvas class="pr-canvas" id="prCanvas" style="width:100%;max-height:420px"></canvas>
            <div class="pr-node-buttons" id="prNodeButtons"></div>
          </div>
        </div>`;

      const canvas = shell.querySelector('#prCanvas');
      const nodeButtons = shell.querySelector('#prNodeButtons');
      const ctx = canvas.getContext('2d');
      nodeButtons.innerHTML = Object.keys(nodes).map(k =>
        `<button class="pr-node-btn" data-node="${k}" type="button" aria-label="Route packet to ${k === 'S' ? 'server' : 'router ' + k}">${k === 'S' ? 'SRV' : k}</button>`
      ).join('');
      function resize() {
        const r = canvas.parentElement.clientWidth;
        canvas.width = W = r; canvas.height = H = Math.round(r * 0.6);
        positionNodeButtons();
      }
      const onPrResize = () => resize();
      resize(); window.addEventListener('resize', onPrResize);
      window.addEventListener('route:away', () => window.removeEventListener('resize', onPrResize), { once: true });

      function nx(k) { return nodes[k].x * W; }
      function ny(k) { return nodes[k].y * H; }
      function positionNodeButtons() {
        $$('.pr-node-btn', shell).forEach(btn => {
          const k = btn.getAttribute('data-node');
          btn.style.left = (nodes[k].x * 100) + '%';
          btn.style.top = (nodes[k].y * 100) + '%';
        });
      }
      function updateNodeButtons() {
        $$('.pr-node-btn', shell).forEach(btn => {
          const k = btn.getAttribute('data-node');
          const isAt = packet && packet.at === k;
          const isNext = packet && nbrs[packet.at].includes(k) && dist[k] < dist[packet.at];
          btn.classList.toggle('at', !!isAt);
          btn.classList.toggle('next', !!isNext);
          btn.classList.toggle('server', k === 'S');
          btn.disabled = !packet || busy || over || isAt;
        });
      }

      function draw() {
        ctx.clearRect(0,0,W,H);
        /* dark radial bg */
        const bg = ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);
        bg.addColorStop(0,'rgba(10,18,40,.97)'); bg.addColorStop(1,'rgba(4,8,20,1)');
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

        /* grid */
        ctx.strokeStyle='rgba(99,102,241,.08)'; ctx.lineWidth=1;
        for(let x=0;x<W;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
        for(let y=0;y<H;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

        /* edges */
        edges.forEach(([a,b]) => {
          const onPath = packet && dist[a]!==undefined && dist[b]!==undefined && Math.abs(dist[a]-dist[b])===1;
          ctx.beginPath(); ctx.moveTo(nx(a),ny(a)); ctx.lineTo(nx(b),ny(b));
          if(onPath) {
            ctx.strokeStyle='rgba(99,102,241,.5)'; ctx.lineWidth=2.5;
          } else {
            ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1.5;
          }
          ctx.stroke();
        });

        /* trails */
        trails = trails.filter(t => t.age < 1);
        trails.forEach(t => {
          t.age += 0.05;
          const alpha=(1-t.age)*.8;
          ctx.beginPath(); ctx.arc(t.x,t.y,Math.max(0.1, 5*(1-t.age)),0,Math.PI*2);
          ctx.fillStyle=`hsla(${t.hue},90%,70%,${alpha})`; ctx.fill();
        });

        /* nodes */
        Object.keys(nodes).forEach(k => {
          const isAt = packet && packet.at === k;
          const isS = k==='S';
          const x=nx(k), y=ny(k);
          /* glow */
          const glowR = isAt ? 45 : isS ? 38 : 26;
          const glowHue = isS?140 : isAt?48 : 220;
          const glowA = isAt?.55 : isS?.35 : .12;
          const glow=ctx.createRadialGradient(x,y,0,x,y,glowR);
          glow.addColorStop(0,`hsla(${glowHue},90%,70%,${glowA})`);
          glow.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(x,y,glowR,0,Math.PI*2);
          ctx.fillStyle=glow; ctx.fill();
          /* ring */
          ctx.beginPath(); ctx.arc(x,y,isAt?22:isS?20:16,0,Math.PI*2);
          ctx.strokeStyle = isS?'#10b981':isAt?'#f59e0b':'rgba(99,102,241,.6)';
          ctx.lineWidth=isAt?3:2; ctx.stroke();
          /* fill */
          ctx.beginPath(); ctx.arc(x,y,isAt?20:isS?18:14,0,Math.PI*2);
          ctx.fillStyle=isS?'rgba(16,185,129,.25)':isAt?'rgba(245,158,11,.25)':'rgba(99,102,241,.15)';
          ctx.fill();
          /* label */
          ctx.font=`bold ${isAt||isS?15:13}px 'JetBrains Mono',monospace`;
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle=isS?'#34d399':isAt?'#fbbf24':'#c7d2fe';
          ctx.fillText(isS?'SRV':k,x,y);
        });

        /* animated packet dot */
        if(packet && packet.animX !== undefined) {
          const gd=ctx.createRadialGradient(packet.animX,packet.animY,0,packet.animX,packet.animY,14);
          gd.addColorStop(0,'rgba(251,191,36,.9)'); gd.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(packet.animX,packet.animY,14,0,Math.PI*2);
          ctx.fillStyle=gd; ctx.fill();
          ctx.beginPath(); ctx.arc(packet.animX,packet.animY,7,0,Math.PI*2);
          ctx.fillStyle='#fef3c7'; ctx.fill();
        }

        /* flashes */
        flashes = flashes.filter(f => f.age<1);
        flashes.forEach(f => {
          f.age+=0.08;
          ctx.font=`bold ${16*(1-f.age*.5)}px Inter`;
          ctx.textAlign='center'; ctx.fillStyle=`rgba(${f.rgb},${1-f.age})`;
          ctx.fillText(f.text,f.x,f.y-30*f.age);
        });

        rafId = requestAnimationFrame(draw);
      }
      draw();

      function spawn() {
        const cands=Object.keys(nodes).filter(k=>k!=='S');
        const at=cands[Math.floor(Math.random()*cands.length)];
        packet={at,ttl:7,animX:nx(at),animY:ny(at)};
        $('#prTtl',shell).textContent=packet.ttl;
        $('#prStatus',shell).textContent=`📦 Packet at ${at} — route to SRV (${dist[at]} hops away)`;
        updateHud();
        updateNodeButtons();
      }
      function updateHud() {
        $('#prDel',shell).textContent=delivered;
        $('#prLost',shell).textContent=lost;
        $('#prPts',shell).textContent=points;
        if(packet) $('#prTtl',shell).textContent=packet.ttl;
        updateNodeButtons();
      }

      async function forward(k) {
        if(!packet||busy||over) return;
        if(!nbrs[packet.at].includes(k)||k===packet.at) return;
        busy=true;
        const from=packet.at;
        const good=dist[k]<dist[from];
        packet.ttl--;
        /* animate dot along edge */
        const x0=nx(from),y0=ny(from),x1=nx(k),y1=ny(k);
        const t0=performance.now();
        await new Promise(res=>{
          const iv=setInterval(()=>{
            const kk=Math.min(1,(performance.now()-t0)/300);
            if(packet) { packet.animX=x0+(x1-x0)*kk; packet.animY=y0+(y1-y0)*kk; }
            trails.push({x:packet.animX,y:packet.animY,hue:good?140:0,age:0});
            if(kk>=1){clearInterval(iv);res();}
          },12);
          setTimeout(res,600);
        });
        packet.at=k; if(packet){packet.animX=x1;packet.animY=y1;}
        if(k==='S') {
          delivered++; points+=10+packet.ttl*2;
          flashes.push({x:x1,y:y1,text:'✓ +' +(10+packet.ttl*2),rgb:'52,211,153',age:0});
          if(G()) G().SFX.correct(); packet=null;
          updateHud();
          if(delivered>=8) { busy=false; return end(true); }
          busy=false; spawn(); return;
        }
        if(!good){ points=Math.max(0,points-2); flashes.push({x:x1,y:y1,text:'⚠ wrong hop',rgb:'248,113,113',age:0}); if(G()) G().SFX.wrong(); }
        else { flashes.push({x:x1,y:y1,text:'✓ +2',rgb:'52,211,153',age:0}); if(G()) G().SFX.click(); }
        if(packet.ttl<=0){
          lost++;
          flashes.push({x:x1,y:y1,text:'💀 TTL expired',rgb:'248,113,113',age:0});
          if(G()) G().SFX.wrong(); packet=null;
          updateHud();
          if(lost>=3){ busy=false; return end(false); }
          busy=false; spawn(); return;
        }
        updateHud(); busy=false;
        $('#prStatus',shell).textContent=`📦 At ${k} — ${dist[k]} hop${dist[k]!==1?'s':''} to SRV`;
        updateNodeButtons();
      }

      canvas.addEventListener('click', e=>{
        if(over||!packet||busy) return;
        const rect=canvas.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(W/rect.width);
        const my=(e.clientY-rect.top)*(H/rect.height);
        let best=null,bd=9999;
        Object.keys(nodes).forEach(k=>{
          const d=Math.hypot(nx(k)-mx,ny(k)-my);
          if(d<bd){bd=d;best=k;}
        });
        if(best && bd<48) forward(best);
      });
      $$('.pr-node-btn', shell).forEach(btn => {
        btn.onclick = () => forward(btn.getAttribute('data-node'));
      });

      function end(win) {
        over=true; packet=null;
        updateNodeButtons();
        cancelAnimationFrame(rafId);
        const xp=Math.round(points/5);
        if(G()){ if(win){G().SFX.win();G().confetti();} else G().SFX.wrong(); G().checkAch({type:'rush',delivered}); }
        resultCard(shell, win?'🏆 Shift Complete!':'💀 Too many black-holes',
          [win?`Delivered: <b>${delivered}/8</b> — professional routing!`:
            `Delivered <b>${delivered}</b> — TTL hurt you. Pick shorter paths.`,
           `Points: <b>${points}</b>`,'The shortest path IS the routing table. Study it!'], xp);
      }
      $('#prStart',shell).onclick=()=>{
        if(!packet) { delivered=0;lost=0;points=0;over=false;busy=false; trails=[]; flashes=[]; updateHud(); spawn(); if(G())G().SFX.click(); }
      };
    },
  });

  /* ================================================================
     3 ▸ HEADER BUILDER — neon encapsulation drag-and-drop
  ================================================================ */
  GAMES.push({
    id: 'game-headers', icon: '🧱', title: 'Header Builder',
    desc: 'Encapsulation is an ORDER. Click the fields in the correct wire sequence to build each protocol structure — Ethernet, TCP, IP.',
    mount(shell) {
      const boards = [
        { name:'Ethernet Frame', emoji:'🔌', hue:195,
          fields:['Preamble (7B)','SFD (1B)','Destination MAC','Source MAC','EtherType / Length','Payload (data)','FCS / CRC'] },
        { name:'IP Packet Header', emoji:'🌐', hue:40,
          fields:['Version + IHL','DSCP + ECN','Total Length','Identification','Flags + Fragment Offset','TTL','Protocol','Header Checksum','Source IP','Destination IP'] },
        { name:'TCP Segment Header', emoji:'📡', hue:280,
          fields:['Source Port','Destination Port','Sequence Number','Acknowledgement Number','Data Offset + Reserved','Control Flags (SYN/ACK/FIN)','Window Size','Checksum','Urgent Pointer'] },
      ];
      let bi=0, idx=0, mistakes=0;
      const board=el('div','hb-board');
      shell.appendChild(board);

      function render() {
        if(bi>=boards.length){
          const xp=Math.max(8,40-mistakes*5);
          if(G()){G().SFX.win();G().confetti();G().checkAch({type:'arcade'});}
          resultCard(shell,'🧱 Master Encapsulator!',
            [`Mistakes: <b>${mistakes}</b>`,
             'That order IS the protocol — every byte counts.',
             'Ethernet wraps IP wraps TCP wraps data.'], xp);
          return;
        }
        const b=boards[bi];
        const shuffled=shuffle(b.fields.map((f,i)=>({f,i})));
        board.innerHTML=`
          <div class="hb-title" style="--hue:${b.hue}">
            <span>${b.emoji}</span>
            <div><div class="hb-name">${b.name}</div>
            <div class="hb-sub">Click fields in wire order — field ${idx+1} of ${b.fields.length}</div></div>
            <div class="hb-progress">${bi+1}/${boards.length}</div>
          </div>
          <div class="hb-frame">
            ${b.fields.map((f,i)=>`
              <div class="hb-slot ${i<idx?'hb-done':i===idx?'hb-next':''}">
                <div class="hb-slot-num">${i+1}</div>
                <div class="hb-slot-name">${i<idx?f:'?'}</div>
              </div>`).join('')}
          </div>
          <div class="hb-chips-area">
            ${shuffled.filter(o=>o.i>=idx).map(o=>
              `<button class="hb-chip" data-i="${o.i}">${o.f}</button>`
            ).join('')}
          </div>
          <div class="hb-status" id="hbStatus">
            <span class="hb-mistakes">❌ ${mistakes} mistake${mistakes!==1?'s':''}</span>
            <span>Tap the next field in wire order</span>
          </div>`;
        $$('.hb-chip',board).forEach(ch=>ch.onclick=()=>{
          if(+ch.getAttribute('data-i')===idx){
            if(G())G().SFX.correct();
            ch.classList.add('hb-chip-right');
            setTimeout(()=>{ idx++; if(idx>=b.fields.length){idx=0;bi++;} render(); }, 220);
          } else {
            mistakes++;
            if(G())G().SFX.wrong();
            ch.classList.add('hb-chip-wrong');
            setTimeout(()=>ch.classList.remove('hb-chip-wrong'),400);
            $('#hbStatus',board).innerHTML=`<span class="hb-mistakes">❌ ${mistakes} mistake${mistakes!==1?'s':''}</span><span style="color:var(--err)">Not quite! What comes next in wire order?</span>`;
          }
        });
      }
      render();
    },
  });

  /* ================================================================
     4 ▸ PORT MATCH — neon flip-card memory game
  ================================================================ */
  GAMES.push({
    id: 'game-ports', icon: '🚪', title: 'Port Match',
    desc: 'Flip cards and pair every well-known port number with its protocol. Perfect memory training for exam questions.',
    mount(shell) {
      const POOL=[
        ['80','HTTP'],['443','HTTPS'],['53','DNS'],['22','SSH'],
        ['25','SMTP'],['67','DHCP server'],['21','FTP control'],
        ['110','POP3'],['123','NTP'],['3389','RDP'],
        ['143','IMAP'],['161','SNMP'],['179','BGP'],['520','RIP'],
      ];
      let deck=[], open=[], moves=0, matched=0, lock=false, playing=false;
      const TOTAL=6;

      shell.innerHTML=`
        <div class="pm-arena">
          <div class="pm-hud">
            <button class="btn primary small" id="pmNew">🔄 New round</button>
            <div class="pm-stat"><span id="pmMoves">0</span><small>moves</small></div>
            <div class="pm-stat"><span id="pmPairs" style="color:#10b981">0</span>/<span>${TOTAL}</span><small>pairs</small></div>
          </div>
          <div class="pm-grid" id="pmGrid"></div>
        </div>`;

      function newRound() {
        const pool=shuffle(POOL).slice(0,TOTAL);
        deck=shuffle(pool.flatMap(([p,s])=>[
          {v:p,pair:p+'|'+s,kind:'port'},
          {v:s,pair:p+'|'+s,kind:'svc'}
        ]));
        moves=0;matched=0;open=[];lock=false;playing=true;
        $('#pmMoves',shell).textContent=0; $('#pmPairs',shell).textContent=0;
        const grid=$('#pmGrid',shell);
        grid.innerHTML=deck.map((c,i)=>`
          <button class="pm-card" data-i="${i}">
            <div class="pm-card-inner">
              <div class="pm-card-front">?</div>
              <div class="pm-card-back ${c.kind==='port'?'pm-port':'pm-svc'}">${c.kind==='port'?'#'+c.v:c.v}</div>
            </div>
          </button>`).join('');
        $$('.pm-card',grid).forEach(card=>card.onclick=()=>flip(card));
      }

      function flip(card) {
        if(!playing||lock||card.classList.contains('pm-matched')||card.classList.contains('pm-flipped')) return;
        const i=+card.getAttribute('data-i');
        card.classList.add('pm-flipped');
        open.push({card,c:deck[i]});
        if(open.length===2){
          moves++; $('#pmMoves',shell).textContent=moves; lock=true;
          const [a,b]=open;
          if(a.c.pair===b.c.pair&&a.c.kind!==b.c.kind){
            setTimeout(()=>{
              a.card.classList.add('pm-matched'); b.card.classList.add('pm-matched');
              matched++; $('#pmPairs',shell).textContent=matched;
              if(G())G().SFX.correct();
              open=[];lock=false;
              if(matched===TOTAL){
                playing=false;
                const xp=Math.max(8,28-moves);
                if(G()){G().SFX.win();G().confetti();G().checkAch({type:'arcade'});}
                resultCard(shell,'🚪 All Ports Paired!',
                  [`${moves} moves — ${moves<=10?'photographic memory! 🌟':'keep drilling.'}`,
                   'Know cold: 80·443·53·22·25·67·21·110·123'], xp);
              }
            },350);
          } else {
            if(G())G().SFX.wrong();
            setTimeout(()=>{
              a.card.classList.remove('pm-flipped');
              b.card.classList.remove('pm-flipped');
              open=[];lock=false;
            },900);
          }
        } else { if(G())G().SFX.click(); }
      }
      $('#pmNew',shell).onclick=newRound;
      newRound();
    },
  });

  /* ================================================================
     5 ▸ JOURNEY ORDER — animated story sequencer
  ================================================================ */
  GAMES.push({
    id: 'game-order', icon: '🧩', title: 'Journey Order',
    desc: 'Protocols are stories with a strict plot. Rebuild each sequence in correct order — DNS, DHCP DORA, TCP handshake, encapsulation and more.',
    mount(shell) {
      const STORIES=[
        { name:'DNS resolution', emoji:'🌐',
          steps:['Browser & OS caches miss','Query the recursive resolver (UDP 53)','Resolver asks a root nameserver','Root refers to the .com TLD','TLD refers to example.com nameservers','Authoritative server answers: A 93.184.216.34'] },
        { name:'DHCP DORA — laptop joins', emoji:'💻',
          steps:['Client broadcasts DISCOVER (0.0.0.0→255.255.255.255)','Server OFFERS an IP + mask + gateway + lease time','Client broadcasts REQUEST (accepting the offer)','Server ACKs — lease granted, client is BOUND'] },
        { name:'TCP three-way handshake', emoji:'🤝',
          steps:['Client sends SYN (seq=x)','Server replies SYN-ACK (seq=y, ack=x+1)','Client sends ACK (ack=y+1) — ESTABLISHED'] },
        { name:'Encapsulating a web request', emoji:'📦',
          steps:['App writes: GET / HTTP/1.1','TCP wraps it in a segment (ports 12345→80)','IP wraps in a packet (source→dest IP)','Ethernet wraps in a frame (MACs + FCS)','Physical layer encodes to signals'] },
        { name:'Pressing Enter on a browser', emoji:'⌨',
          steps:['Browser & hosts file cache miss — DNS needed','DNS resolves hostname to IP address','TCP three-way handshake with the server','HTTP GET sent over the connection','Server responds 200 OK + HTML','Browser parses & renders the page'] },
      ];
      let si=0,idx=0,strikes=0;
      const board=el('div','jo-board');
      shell.appendChild(board);
      function render() {
        if(si>=STORIES.length){
          const xp=Math.max(8,35-strikes*5);
          if(G()){G().SFX.win();G().confetti();G().checkAch({type:'arcade'});}
          resultCard(shell,'🧩 Every Story Rebuilt!',
            [`Strikes: <b>${strikes}</b>`,
             'Protocols are precise stories — you now know every plot.',
             'DNS→DHCP→TCP→HTTP: that\'s the internet.'], xp);
          return;
        }
        const s=STORIES[si];
        const remaining=shuffle(s.steps.map((st,i)=>({st,i})).filter(o=>o.i>=idx));
        board.innerHTML=`
          <div class="jo-header">
            <div class="jo-emoji">${s.emoji}</div>
            <div><div class="jo-name">${s.name}</div>
            <div class="jo-meta">Story ${si+1}/${STORIES.length} · Step ${idx+1}/${s.steps.length} · ${strikes} strike${strikes!==1?'s':''}</div></div>
          </div>
          <div class="jo-timeline">
            ${s.steps.map((st,i)=>`
              <div class="jo-step ${i<idx?'jo-done':i===idx?'jo-next':'jo-todo'}">
                <div class="jo-dot"></div>
                <div class="jo-text">${i<idx?st:'?'}</div>
              </div>`).join('')}
          </div>
          <div class="jo-choices">
            ${remaining.map(o=>`<button class="jo-chip" data-i="${o.i}">${o.st}</button>`).join('')}
          </div>`;
        $$('.jo-chip',board).forEach(ch=>ch.onclick=()=>{
          if(+ch.getAttribute('data-i')===idx){
            if(G())G().SFX.correct();
            ch.classList.add('jo-chip-right');
            idx++;
            setTimeout(()=>{
              if(idx>=s.steps.length){idx=0;si++;}
              render();
            },240);
          } else {
            strikes++;
            if(G())G().SFX.wrong();
            ch.classList.add('jo-chip-wrong');
            setTimeout(()=>render(),500);
          }
        });
      }
      render();
    },
  });

  /* ================================================================
     6 ▸ NETWORK DOCTOR — cinematic case files
  ================================================================ */
  GAMES.push({
    id: 'game-doctor', icon: '🩺', title: 'Network Doctor',
    desc: 'A user reports a symptom. You diagnose the cause and pick the fix. Real troubleshooting instincts, case by case.',
    mount(shell) {
      const CASES=[
        { s:'"I can ping 8.8.8.8 but not google.com"', tool:'dig / nslookup',
          opts:['DNS problem','Default gateway missing','Cable unplugged','Firewall blocking ICMP'],a:0,
          why:'IP connectivity works (ping by address) but name resolution fails → the resolver path is broken. Use <code>dig google.com</code> to confirm.' },
        { s:'"I can\'t ping the router at 192.168.1.1 — but Wi-Fi shows connected"', tool:'ip addr / ipconfig',
          opts:['DNS is down','No valid IP — check with ip addr','The website is offline','TTL expired'],a:1,
          why:'Layer 2 is up (associated) but Layer 3 is broken. DHCP may have failed → you may have an APIPA 169.254.x.x address. Start with <code>ip addr</code>.' },
        { s:'"Large uploads hang, small ones succeed fine"', tool:'ping -s / tracepath',
          opts:['Bandwidth exhausted','MTU / PMTUD issue — blocked ICMP kills path discovery','Too many open ports','Weak Wi-Fi signal'],a:1,
          why:'Classic PMTUD death: large packets exceed an intermediate MTU; the "Fragmentation Needed" ICMP is blocked so the sender never shrinks the payload.' },
        { s:'"traceroute shows * * * at hop 3 — but the site loads"', tool:'traceroute / mtr',
          opts:['The network is broken','Hop 3 rate-limits or drops ICMP replies','DNS failure','Server is down'],a:1,
          why:'* * * at a mid-hop usually means ICMP rate-limiting or filtering, not a real failure. The end-to-end path clearly works since the site loads.' },
        { s:'"netstat shows hundreds of CLOSE_WAIT sockets — app is slow"', tool:'netstat -an / ss',
          opts:['Normal TCP behaviour','App never calls close() after the peer sent FIN','SYN flood attack','NAT table overflow'],a:1,
          why:'CLOSE_WAIT = peer closed, YOU haven\'t. A close() leak in the application. TIME_WAIT (normal) is 2×MSL cool-down — that\'s fine.' },
        { s:'"Every office device lost internet — a cable was just plugged into both switches"', tool:'STP / spanning tree',
          opts:['DNS outage','Switching loop — broadcast storm (needs STP)','DHCP pool exhausted','Power cut'],a:1,
          why:'Looping switches multiply broadcast frames forever — a broadcast storm. Spanning Tree Protocol blocks the redundant link to prevent it.' },
        { s:'"Video calls lag badly but file downloads are fine"', tool:'ping -i 0.2 / iperf',
          opts:['High latency/jitter on the link','DNS is slow','NIC is broken','Ports are blocked'],a:0,
          why:'Real-time media cares about latency and jitter, not raw throughput. Download speed is fine but queuing delay spikes crush VoIP/video quality.' },
        { s:'"dig returns NXDOMAIN for our new website"', tool:'dig / whois',
          opts:['Server is down','Domain record not published or not propagated yet','Bad Ethernet cable','NAT loop'],a:1,
          why:'NXDOMAIN = "no such name in DNS". The authoritative zone doesn\'t have the record yet, or old TTL has not expired on caching resolvers.' },
      ];
      let ci=0,correct=0;
      const board=el('div','nd-board');
      shell.appendChild(board);

      function render() {
        if(ci>=CASES.length){
          const xp=12+correct*5;
          if(G()){G().SFX.win();G().confetti();G().checkAch({type:'arcade'});}
          resultCard(shell,'🩺 Rounds Complete!',
            [`Diagnosed correctly: <b>${correct} / ${CASES.length}</b>`,
             'The ladder: <code>ip addr → ping GW → ping 8.8.8.8 → dig → curl</code>',
             'Every case above fits a rung.'], xp);
          return;
        }
        const c=CASES[ci];
        const opts=shuffle(c.opts.map((o,i)=>({o,i})));
        board.innerHTML=`
          <div class="nd-file">
            <div class="nd-file-header">
              <span class="nd-case-no">Case ${ci+1}/${CASES.length}</span>
              <span class="nd-tool">🔧 Tool hint: <code>${c.tool}</code></span>
              <span class="nd-score">✅ ${correct} correct</span>
            </div>
            <div class="nd-symptom">💬 ${c.s}</div>
            <div class="nd-opts">
              ${opts.map(o=>`<button class="nd-opt" data-i="${o.i}">${o.o}</button>`).join('')}
            </div>
            <div class="nd-explanation" id="ndExp" style="display:none"></div>
          </div>`;
        $$('.nd-opt',board).forEach(ch=>ch.onclick=()=>{
          const ok=+ch.getAttribute('data-i')===c.a;
          $$('.nd-opt',board).forEach(b=>b.disabled=true);
          const exp=$('#ndExp',board);
          exp.style.display='block';
          if(ok){
            correct++; if(G())G().SFX.correct();
            ch.classList.add('nd-right');
            exp.innerHTML=`<span class="nd-verdict nd-ok">✅ Correct!</span> ${c.why}`;
          } else {
            if(G())G().SFX.wrong();
            ch.classList.add('nd-wrong');
            board.querySelector(`.nd-opt[data-i="${c.a}"]`).classList.add('nd-right');
            exp.innerHTML=`<span class="nd-verdict nd-bad">❌ Not quite.</span> ${c.why}`;
          }
          const next=el('button','btn primary small',ci===CASES.length-1?'Finish ▶':'Next case →');
          next.style.marginTop='14px';
          next.onclick=()=>{ci++;render();};
          board.appendChild(next);
          exp.scrollIntoView({behavior:'smooth',block:'nearest'});
        });
      }
      render();
    },
  });

  window.CN_GAMES = GAMES;
})();
