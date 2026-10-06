/* Computer Networks — Interactive Labs.
   Each lab: { id, icon, title, desc, mount(shellEl), teardown() }  */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const svgEl = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* shared: animated travel of a dot along an SVG path.
     Uses setInterval (not rAF) so animations still finish in occluded/hidden panes. */
  function travel(svg, pathEl, color, opts) {
    return new Promise(resolve => {
      opts = opts || {};
      const dur = opts.dur || 700;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearInterval(timer); clearTimeout(guard);
        try { dot.remove(); if (dot._label) dot._label.remove(); } catch (e) {}
        resolve();
      };
      const dot = svgEl('circle', { r: opts.r || 7, fill: color, stroke: '#fff', 'stroke-width': 2, cx: -20, cy: -20 }, svg);
      if (opts.label) {
        const t = svgEl('text', { x: -40, y: -40, 'font-size': 11, 'font-weight': 800, fill: color, class: 'svg-t' }, svg);
        t.textContent = opts.label;
        dot._label = t;
      }
      const len = pathEl.getTotalLength();
      const t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / dur);
        const e = 0.25 * k * k * (3 - 2 * k); // ease
        const at = opts.reverse ? 1 - e : e;
        try {
          const pt = pathEl.getPointAtLength(len * at);
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
          if (dot._label) { dot._label.setAttribute('x', pt.x + 10); dot._label.setAttribute('y', pt.y - 10); }
        } catch (err) { finish(); return; }
        if (k >= 1) finish();
      };
      const timer = setInterval(tick, 16);
      const guard = setTimeout(finish, dur + 1500); // absolute fallback
    });
  }
  function logTo(box, n, html) {
    const line = el('div', 'll', `<span class="lln">${n}</span><span class="llt">${html}</span>`);
    box.appendChild(line); box.scrollTop = box.scrollHeight;
  }
  function controlsHTML(shell, inner) {
    shell.appendChild(el('div', 'lab-controls', inner));
  }

  const LABS = [];

  /* ================================================================
     1. 3D OSI STACK
  ================================================================ */
  LABS.push({
    id: 'lab-osi3d', icon: '🧊', title: 'The OSI Stack in 3D',
    desc: 'Drag to spin the seven layers, click a slab to inspect what each layer really does, then press <b>Encapsulate</b> to watch your data travel down the tower, gaining a header at every layer.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; };
      shell.appendChild(el('div', 'lab-controls', `
        <button class="btn primary small" id="osiEnc">▶ Encapsulate</button>
        <button class="btn ghost small" id="osiDec">◀ Decapsulate</button>
        <button class="btn ghost small" id="osiReset">Reset view</button>
        <span class="small" style="color:var(--ink-3)">drag to rotate · scroll wheel tilts · click a layer</span>`));
      const two = el('div', 'lab-two');
      const stage = el('div', 'osi3d-stage');
      const detail = el('div', 'lab-side osi-detail');
      two.appendChild(stage); two.appendChild(detail);
      shell.appendChild(two);

      const layers = [
        { n: 7, name: 'Application', proto: 'HTTP · DNS · SMTP · SSH', pdu: 'Data', col: '#8b5cf6', role: 'Where your app lives — web pages, mail, name lookups. Produces the raw data you actually care about.', dev: 'Browsers, servers, apps' },
        { n: 6, name: 'Presentation', proto: 'TLS · JPEG · UTF-8', pdu: 'Data', col: '#7d74ee', role: 'Translates, compresses and encrypts — TLS lives here in practice, turning plaintext into ciphertext.', dev: 'Crypto libraries, codecs' },
        { n: 5, name: 'Session', proto: 'RPC · NetBIOS · sockets API', pdu: 'Data', col: '#6f83e2', role: 'Opens, maintains and tears down the conversation between two machines.', dev: 'OS session layer' },
        { n: 4, name: 'Transport', proto: 'TCP · UDP', pdu: 'Segment', col: '#5f8ed6', role: 'End-to-end delivery: ports multiplex apps, TCP adds reliability, ordering and flow control.', dev: 'Hosts, firewalls (L4)' },
        { n: 3, name: 'Network', proto: 'IP · ICMP · OSPF', pdu: 'Packet', col: '#4f9db8', role: 'Logical addressing and routing — gets a packet across many networks to the right host.', dev: 'Routers' },
        { n: 2, name: 'Data Link', proto: 'Ethernet · ARP · Wi-Fi', pdu: 'Frame', col: '#41ab97', role: 'Delivers a frame across ONE local link using MAC addresses; detects bit errors with the FCS.', dev: 'Switches, NICs' },
        { n: 1, name: 'Physical', proto: 'Cables · radio · fibre', pdu: 'Bits', col: '#35b97b', role: 'Turns bits into electrons, light or radio — and back. No meaning, just signals.', dev: 'Hubs, cables, antennas' },
      ];
      const tower = el('div', 'osi3d');
      stage.appendChild(tower);
      const labels = {};
      layers.forEach((L, i) => {
        const slab = el('div', 'osi-slab');
        slab.style.setProperty('--slab', L.col);
        slab.style.transform = `translateZ(${(6 - i) * 40}px)`;
        slab.innerHTML = `<div class="slab-label"><span class="n">LAYER ${L.n}</span><span class="nm">${L.name}</span><span class="pd">${L.pdu} · ${L.proto}</span></div>`;
        tower.appendChild(slab);
        labels[L.n] = slab;
        slab.onclick = () => {
          $$('.osi-slab', tower).forEach(s => s.classList.remove('sel', 'showlabel'));
          slab.classList.add('sel', 'showlabel');
          detail.innerHTML = `<h4>Layer ${L.n} — ${L.name}</h4>
            <p style="margin:4px 0 8px">${L.role}</p>
            <table class="kv-table">
              <tr><td>Protocols</td><td>${L.proto}</td></tr>
              <tr><td>PDU name</td><td>${L.pdu}</td></tr>
              <tr><td>Devices</td><td>${L.dev}</td></tr>
            </table>`;
        };
        slab.addEventListener('mouseenter', () => { tower.classList.add('focused'); slab.classList.add('showlabel'); });
        slab.addEventListener('mouseleave', () => {
          slab.classList.remove('showlabel');
          if (!$$('.osi-slab.sel', tower).some(s => s.classList.contains('showlabel'))) tower.classList.remove('focused');
        });
      });
      // default selection
      labels[7].onclick();

      // rotate logic
      let rx = 62, rz = 45, dragging = false, lx = 0, ly = 0;
      const apply = () => { tower.style.transform = `rotateX(${rx}deg) rotateZ(${rz}deg)`; };
      apply();
      stage.onpointerdown = e => { dragging = true; lx = e.clientX; ly = e.clientY; stage.setPointerCapture(e.pointerId); };
      stage.onpointermove = e => {
        if (!dragging) return;
        rz += (e.clientX - lx) * 0.4; rx -= (e.clientY - ly) * 0.3;
        rx = Math.max(20, Math.min(85, rx));
        lx = e.clientX; ly = e.clientY; apply();
      };
      stage.onpointerup = () => { dragging = false; };
      stage.onwheel = e => { e.preventDefault(); rx = Math.max(15, Math.min(88, rx - e.deltaY * 0.05)); apply(); };
      $('#osiReset', shell).onclick = () => { rx = 62; rz = 45; apply(); };

      // encapsulate / decapsulate: payload descends the Z axis
      const payload = el('div', 'osi-payload', 'DATA');
      tower.appendChild(payload);
      let busy = false;
      const steps7to1 = [
        ['DATA', 'Your app writes: “GET / HTTP/1.1”'],
        ['+TCP', 'L4 wraps a segment: ports 52311 → 443, sequence number'],
        ['+IP', 'L3 wraps a packet: src 192.168.1.5 → dst 142.250.195.46'],
        ['+ETH', 'L2 wraps a frame: src MAC → gateway MAC, FCS trailer'],
        ['BITS', 'L1 encodes to signals onto the wire 📡'],
      ];
      $('#osiEnc', shell).onclick = async () => {
        if (busy) return; busy = true;
        const zTop = 6 * 40, zBot = 0;
        for (let i = 0; i < steps7to1.length && alive.v; i++) {
          payload.textContent = steps7to1[i][0];
          payload.style.transform = `translateZ(${zTop - (zTop - zBot) * (i / 4)}px)`;
          detail.innerHTML = `<h4>Going down…</h4><p>${steps7to1[i][1]}</p>`;
          await sleep(700);
        }
        await sleep(300);
        if (alive.v) detail.innerHTML = `<h4>On the wire!</h4><p>The frame crosses one link, then decapsulation climbs back up at the next hop — headers are read and stripped, one layer at a time.</p>`;
        busy = false;
      };
      $('#osiDec', shell).onclick = async () => {
        if (busy) return; busy = true;
        for (let i = steps7to1.length - 1; i >= 0 && alive.v; i--) {
          payload.textContent = steps7to1[i][0];
          payload.style.transform = `translateZ(${(i / 4) * 6 * 40}px)`;
          await sleep(500);
        }
        busy = false;
      };
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     2. PACKET JOURNEY
  ================================================================ */
  LABS.push({
    id: 'lab-journey', icon: '🛰️', title: 'The Complete Packet Journey',
    desc: 'Type a URL and watch everything happen: DNS resolution climbing root → TLD → authoritative, the TCP three-way handshake, the HTTP request and the response riding back — with every step narrated.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; svg._dead = true; };
      controlsHTML(shell, `
        <label>URL <input type="text" id="jUrl" value="www.example.com"></label>
        <button class="btn primary small" id="jGo">▶ Send it</button>
        <select id="jMode"><option value="run">Run</option><option value="step">Step-by-step</option></select>
        <span class="lab-status" id="jState">idle</span>`);
      const two = el('div', 'lab-two');
      const svgWrap = el('div');
      const logBox = el('div', 'lab-log');
      const side = el('div', 'lab-side', `<h4>Live commentary</h4>`);
      side.appendChild(logBox);
      two.appendChild(svgWrap); two.appendChild(side);
      shell.appendChild(two);

      const svg = svgEl('svg', { viewBox: '0 0 940 430', class: 'lab-canvas' });
      svgWrap.appendChild(svg);

      function node(x, y, w, h, label, sub, col) {
        const g = svgEl('g', {}, svg);
        svgEl('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 12, fill: col || '#fffdf8', stroke: '#d9d5f0', 'stroke-width': 1.5, id: 'n' + label.replace(/\W/g, '') }, g);
        const t = svgEl('text', { x, y: y + (sub ? -2 : 4), 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, g);
        t.textContent = label;
        if (sub) { const s = svgEl('text', { x, y: y + 14, 'text-anchor': 'middle', 'font-size': 10, fill: '#737a8c', class: 'svg-t' }, g); s.textContent = sub; }
        return g;
      }
      function link(x1, y1, x2, y2, id, dashed) {
        const p = svgEl('path', { id, d: `M${x1},${y1} L${x2},${y2}`, stroke: dashed ? '#c9c3b6' : '#d9d5f0', 'stroke-width': 2.5, fill: 'none', 'stroke-dasharray': dashed ? '5 6' : 'none' }, svg);
        return p;
      }
      node(80, 330, 130, 64, 'Your laptop', '192.168.1.5');
      node(265, 330, 110, 58, 'Router', 'home gateway');
      node(450, 330, 120, 58, 'ISP', 'edge router');
      node(800, 330, 150, 64, 'Web server', '93.184.216.34');
      node(450, 175, 150, 58, 'DNS resolver', 'ISP recursive', '#f1effb');
      node(235, 85, 120, 52, 'Root server', '.', '#f1effb');
      node(450, 62, 120, 48, '.com TLD', '', '#f1effb');
      node(665, 85, 150, 52, 'Authoritative', 'example.com', '#f1effb');
      const seg1 = link(145, 330, 210, 330, 'pSeg1');
      const seg2 = link(320, 330, 390, 330, 'pSeg2');
      const seg3 = link(510, 330, 725, 330, 'pSeg3');
      const upRes = link(450, 301, 450, 204, 'pUp', true);
      const r1 = link(415, 155, 292, 104, 'pR1', true);
      const r2 = link(450, 146, 450, 86, 'pR2', true);
      const r3 = link(485, 155, 600, 100, 'pR3', true);

      const state = () => $('#jState', shell);
      const steps = [];
      const S = (path, color, label, rev, dur, log) => steps.push({ path, color, label, rev, dur, log });

      // journey steps
      S(null, 0, 0, 0, 0, '<b>Enter pressed.</b> The browser wants <b>http(s)://$(URL)</b> — but it can only talk to an <b>IP address</b>. First: resolve the name.');
      S(null, 0, 0, 0, 0, '<b>Browser cache</b> — miss. <span class="mono">/etc/hosts</span> — miss. Time for the real thing: a <b>DNS lookup</b>.');
      S('pSeg1', '#2563eb', 'DNS', 0, 600, 'A DNS query is just a UDP packet: <b>src 192.168.1.5:53xx → dst 192.168.1.1:53</b>. The gateway forwards it to the ISP resolver.');
      S('pUp', '#2563eb', '→ resolver', 0, 450, 'The <b>recursive resolver</b> takes over — its cache is empty (cold start), so it will climb the hierarchy for you.');
      S('pR1', '#8a5cf6', 'root', 0, 600, '→ <b>Root server</b>: “Who handles <b>.com</b>?” Root answers with the .com TLD servers (that answer gets cached for next time).');
      S('pR2', '#8a5cf6', '.com TLD', 0, 500, '→ <b>.com TLD</b>: “Who handles <b>example.com</b>?” TLD answers: the domain’s authoritative nameservers.');
      S('pR3', '#8a5cf6', 'auth', 0, 600, '→ <b>Authoritative server</b> for example.com — it holds the actual records.');
      S('pR3', '#16a34a', 'A 93.184.216.34', true, 600, '✅ Answer: <b>A 93.184.216.34, TTL 3600</b>. The resolver caches it and passes it back down.');
      S('pUp', '#16a34a', 'IP!', true, 450, 'The resolver returns the IP to your laptop. Your OS caches it too — the next visit will be instant.');
      S('pSeg1', '#e2b95d', 'SYN', 0, 500, 'Now the <b>TCP three-way handshake</b>. ① SYN — “let’s talk, my sequence number is x”. Client → SYN_SENT.');
      S('pSeg2', '#e2b95d', 'SYN', 0, 500, '');
      S('pSeg3', '#e2b95d', 'SYN', 0, 600, '');
      S('pSeg3', '#16a34a', 'SYN-ACK', true, 600, '② SYN-ACK — server agrees, “my sequence is y, I got x+1”.');
      S('pSeg2', '#16a34a', 'SYN-ACK', true, 500, '');
      S('pSeg1', '#16a34a', 'SYN-ACK', true, 500, '');
      S('pSeg1', '#e2b95d', 'ACK', 0, 500, '③ ACK — both sides are <b>ESTABLISHED</b>. A reliable, ordered byte pipe now exists end-to-end.');
      S('pSeg2', '#e2b95d', 'ACK', 0, 450, '');
      S('pSeg3', '#2c6b46', 'GET /', 0, 600, '<b>HTTP GET /</b> rides inside the TCP pipe. Layers wrap it: data → segment → packet → frame.');
      S('pSeg3', '#e2b95d', '200 OK', true, 700, 'The server thinks, then answers: <b>200 OK + HTML</b> — possibly thousands of bytes over many packets (TCP reassembles and re-orders them).');
      S('pSeg2', '#e2b95d', '200 OK', true, 500, '');
      S('pSeg1', '#e2b95d', '200 OK', true, 500, 'Browser parses the HTML, fetches CSS/JS/images (more journeys like this one)… and paints the page. 🎉');

      async function run(startIdx) {
        const mode = $('#jMode', shell).value;
        const url = $('#jUrl', shell).value.trim() || 'www.example.com';
        svg._dead = false;
        for (let i = startIdx; i < steps.length && alive.v; i++) {
          const st = steps[i];
          const text = st.log.replace('$(URL)', esc(url));
          state().textContent = 'step ' + (i + 1) + '/' + steps.length;
          if (st.path) await travel(svg, $('#' + st.path, svg), st.color, { label: st.label, reverse: st.rev, dur: st.dur });
          else await sleep(650);
          if (!alive.v) return;
          logTo(logBox, i + 1, text);
          if (mode === 'step') {
            const btn = document.createElement('button');
            btn.className = 'btn primary small'; btn.textContent = 'Next step →'; btn.style.margin = '6px 0';
            const holder = el('div'); holder.appendChild(btn);
            logBox.appendChild(holder); logBox.scrollTop = logBox.scrollHeight;
            await new Promise(res => { btn.onclick = () => { btn.remove(); res(); }; });
            if (!alive.v) return;
          }
        }
        state().textContent = 'done ✓';
      }
      $('#jGo', shell).onclick = () => {
        logBox.innerHTML = '';
        run(0);
      };
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     3. SUBNET CALCULATOR
  ================================================================ */
  LABS.push({
    id: 'lab-subnet', icon: '🧮', title: 'Subnet Calculator — see the bits',
    desc: 'Type any IPv4 address, slide the prefix, and watch the network/host split move through the 32 bits. Borrow host bits to carve subnets and get the full four-subnet table.',
    mount(shell) {
      const controls = el('div', 'lab-controls', `
        <label>IP <input type="text" id="sbIp" value="192.168.10.130" style="width:150px"></label>
        <label>Prefix /<input type="range" id="sbPfx" min="8" max="30" value="25" style="width:170px"><span class="val" id="sbPfxV">/25</span></label>
        <label>Borrow <input type="range" id="sbBorrow" min="0" max="4" value="1" style="width:110px"><span class="val" id="sbBorrowV">1 bits</span></label>`);
      shell.appendChild(controls);
      const out = el('div');
      shell.appendChild(out);

      function parseIP(s) {
        const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
        if (!m) return null;
        const o = m.slice(1).map(Number);
        if (o.some(x => x > 255)) return null;
        return o;
      }
      function calc() {
        const ip = parseIP($('#sbIp', shell).value) || [192, 168, 10, 130];
        const pfx = +$('#sbPfx', shell).value;
        const borrow = +$('#sbBorrow', shell).value;
        $('#sbPfxV', shell).textContent = '/' + pfx;
        $('#sbBorrowV', shell).textContent = borrow + ' bit' + (borrow === 1 ? '' : 's');
        const bits = [];
        for (let i = 0; i < 32; i++) bits.push((ip[Math.floor(i / 8)] >> (7 - (i % 8))) & 1);
        const bitHtml = bits.map((b, i) =>
          `<span class="bit ${i < pfx ? 'net' : 'host'} ${i % 8 === 0 && i > 0 ? 'sep' : ''}">${b}</span>`).join('');
        const ipInt = ((ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3]) >>> 0;
        const mask = pfx === 0 ? 0 : (0xFFFFFFFF << (32 - pfx)) >>> 0;
        const net = (ipInt & mask) >>> 0;
        const bc = (net | (~mask >>> 0)) >>> 0;
        const fmt = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
        const hosts = Math.pow(2, 32 - pfx) - 2;
        const newPfx = pfx + borrow;
        const subnets = Math.pow(2, borrow);
        const block = Math.pow(2, 32 - newPfx);
        let rows = '';
        if (borrow > 0) {
          const show = Math.min(subnets, 16);
          let segs = '';
          for (let i = 0; i < show; i++) {
            const sNet = (net + i * block) >>> 0;
            const mine = ipInt >= sNet && ipInt < (sNet + block) >>> 0;
            segs += `<div class="sb-seg${mine ? ' you' : ''}" title="Subnet ${i + 1}: ${fmt(sNet)}/${newPfx}"></div>`;
          }
          rows = `<div class="space-bar">${segs}</div>
            <div class="legend" style="margin:4px 0 10px"><span class="l-item"><span class="sw" style="background:var(--acc)"></span>the subnet your IP lives in</span>
            <span class="l-item">each block = ${block} addresses</span></div>
            <table class="nat-table"><tr><th>Subnet</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>`;
          for (let i = 0; i < Math.min(subnets, 16); i++) {
            const sNet = (net + i * block) >>> 0;
            const sBc = (sNet + block - 1) >>> 0;
            const mine = ipInt >= sNet && ipInt <= sBc;
            rows += `<tr ${mine ? 'class="new"' : ''}><td>${i + 1}${mine ? ' ← yours' : ''}</td><td>${fmt(sNet)}/${newPfx}</td>
              <td>${fmt(sNet + 1)} – ${fmt(sBc - 1)}</td><td>${fmt(sBc)}</td></tr>`;
          }
          rows += `</table><p class="small">New prefix /${newPfx} → ${subnets} subnets × ${Math.pow(2, 32 - newPfx) - 2} usable hosts each.</p>`;
        }
        out.innerHTML = `
          <div class="fig"><b style="font-size:13px">The 32 bits of ${fmt(ipInt)} /${pfx}</b>
            <div class="bitrow">${bitHtml}</div>
            <div class="legend"><span class="l-item"><span class="sw" style="background:var(--acc)"></span>network (${pfx} bits)</span>
            <span class="l-item"><span class="sw" style="background:#edf6ec;border:1px solid #a2ce9d"></span>host (${32 - pfx} bits)</span></div>
          </div>
          <div class="lab-two" style="margin-top:10px">
            <div class="lab-side">
              <h4>Answers</h4>
              <table class="kv-table">
                <tr><td>Network</td><td>${fmt(net)} /${pfx}</td></tr>
                <tr><td>Subnet mask</td><td>${fmt(mask)}</td></tr>
                <tr><td>Broadcast</td><td>${fmt(bc)}</td></tr>
                <tr><td>First usable</td><td>${hosts > 0 ? fmt(net + 1) : '—'}</td></tr>
                <tr><td>Last usable</td><td>${hosts > 0 ? fmt(bc - 1) : '—'}</td></tr>
                <tr><td>Usable hosts</td><td>${hosts} (2^${32 - pfx} − 2)</td></tr>
                <tr><td>IP is…</td><td>${ipInt === net ? 'the network address ✗' : ipInt === bc ? 'the broadcast ✗' : 'a normal host ✓'}</td></tr>
              </table>
            </div>
            <div class="lab-side"><h4>Borrow ${borrow} host bit${borrow === 1 ? '' : 's'} → ${subnets} subnets</h4>${rows || 'Slide <b>Borrow</b> to split this network into subnets.'}</div>
          </div>`;
      }
      ['sbIp', 'sbPfx', 'sbBorrow'].forEach(id => { $('#' + id, shell).addEventListener('input', calc); });
      calc();
    },
    teardown() {},
  });

  /* ================================================================
     4. ROUTING VISUALIZER
  ================================================================ */
  LABS.push({
    id: 'lab-routing', icon: '🗺️', title: 'Routing Algorithms — step through them',
    desc: 'A real weighted topology. <b>Drag the routers</b>, pick an algorithm and a source, then step: watch BFS flood layer by layer, DFS dive, Dijkstra greedily finalise, and Bellman-Ford relax every edge.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; };
      controlsHTML(shell, `
        <label>Algorithm <select id="rAlg">
          <option value="dijkstra">Dijkstra (shortest path)</option>
          <option value="bfs">BFS (fewest hops)</option>
          <option value="dfs">DFS (dive deep)</option>
          <option value="bellman">Bellman-Ford (relax all)</option>
        </select></label>
        <label>Source <select id="rSrc"></select></label>
        <label>Target <select id="rDst"></select></label>
        <button class="btn primary small" id="rStep">Step →</button>
        <button class="btn ghost small" id="rPlay">▶ Play</button>
        <button class="btn ghost small" id="rReset">Reset</button>`);
      const two = el('div', 'lab-two');
      const svgWrap = el('div');
      const side = el('div', 'lab-side', `<h4>Distance table</h4><div id="rTable"></div><div id="rExplain" style="margin-top:8px;color:var(--ink-2);font-size:12.6px">Press <b>Step</b> to begin.</div>`);
      two.appendChild(svgWrap); two.appendChild(side);
      shell.appendChild(two);

      const nodes = [
        { id: 'Delhi', x: 210, y: 80 }, { id: 'Kolkata', x: 520, y: 110 },
        { id: 'Jaipur', x: 130, y: 200 }, { id: 'Mumbai', x: 190, y: 350 },
        { id: 'Hyderabad', x: 390, y: 330 }, { id: 'Chennai', x: 560, y: 400 },
        { id: 'Bengaluru', x: 420, y: 440 }, { id: 'Pune', x: 300, y: 430 },
      ];
      const edges = [
        ['Delhi', 'Kolkata', 9], ['Delhi', 'Jaipur', 3], ['Delhi', 'Hyderabad', 8],
        ['Kolkata', 'Chennai', 10], ['Kolkata', 'Hyderabad', 9],
        ['Jaipur', 'Mumbai', 7], ['Mumbai', 'Pune', 2], ['Mumbai', 'Hyderabad', 6],
        ['Pune', 'Bengaluru', 6], ['Hyderabad', 'Bengaluru', 4], ['Hyderabad', 'Chennai', 5],
        ['Bengaluru', 'Chennai', 3],
      ];
      const svg = svgEl('svg', { viewBox: '0 0 700 500', class: 'lab-canvas' });
      svgWrap.appendChild(svg);
      const nodeEls = {}, edgeEls = {};
      edges.forEach(([a, b, w]) => {
        const g = svgEl('g', {}, svg);
        const line = svgEl('line', { stroke: '#d9d5f0', 'stroke-width': 2.5 }, g);
        const mid = svgEl('text', { 'font-size': 12, 'font-weight': 800, fill: '#737a8c', 'text-anchor': 'middle', class: 'svg-t' }, g);
        mid.textContent = w;
        edgeEls[a + '|' + b] = { g, line, mid, w };
      });
      nodes.forEach(n => {
        const g = svgEl('g', { class: 'rnode' }, svg);
        const c = svgEl('circle', { r: 24, fill: '#fffdf8', stroke: '#c9c3b6', 'stroke-width': 2.5 }, g);
        const t = svgEl('text', { 'text-anchor': 'middle', y: 5, 'font-size': 10.5, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, g);
        t.textContent = n.id;
        const badge = svgEl('text', { 'text-anchor': 'middle', y: -32, 'font-size': 12, 'font-weight': 800, fill: '#4f46e5', class: 'svg-t' }, g);
        nodeEls[n.id] = { g, c, t, badge, x: n.x, y: n.y };
        const pos = () => { g.setAttribute('transform', `translate(${n.x},${n.y})`); };
        pos();
        g.addEventListener('pointerdown', e => {
          e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
          const move = ev => {
            const r = svg.getBoundingClientRect();
            n.x = Math.max(30, Math.min(670, (ev.clientX - r.left) / r.width * 700));
            n.y = Math.max(30, Math.min(470, (ev.clientY - r.top) / r.height * 500));
            pos(); redrawEdges();
          };
          const up = () => { svg.removeEventListener('pointermove', move); svg.removeEventListener('pointerup', up); };
          svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up);
        });
      });
      function redrawEdges() {
        edges.forEach(([a, b]) => {
          const A = nodeEls[a], B = nodeEls[b], E = edgeEls[a + '|' + b];
          E.line.setAttribute('x1', A.x); E.line.setAttribute('y1', A.y);
          E.line.setAttribute('x2', B.x); E.line.setAttribute('y2', B.y);
          E.mid.setAttribute('x', (A.x + B.x) / 2); E.mid.setAttribute('y', (A.y + B.y) / 2 - 6);
        });
      }
      redrawEdges();

      const nbrs = id => edges.filter(e => e[0] === id || e[1] === id).map(e => [e[0] === id ? e[1] : e[0], e[2]]);

      const desc = $('#rExplain', side);
      let algo = [], dist = {}, prev = {}, visited = {}, order = {}, stepIdx = 0, src = 'Delhi', dst = 'Bengaluru';

      function buildPlan() {
        algo = []; dist = {}; prev = {}; visited = {}; order = {};
        nodes.forEach(n => dist[n.id] = Infinity);
        dist[src] = 0;
        const kind = $('#rAlg', shell).value;
        if (kind === 'dijkstra') {
          const vis = new Set();
          algo.push(() => { desc.innerHTML = `Start: dist[${src}] = 0, everything else ∞.`; });
          while (vis.size < nodes.length) {
            let u = null, best = Infinity;
            nodes.forEach(n => { if (!vis.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; } });
            if (u === null || u === dst && false) break;
            const snapshot = { u, relax: [] };
            algo.push(() => {
              visited[u] = 'final'; order[u] = Object.keys(order).length + 1;
              desc.innerHTML = `<b>Finalise ${u}</b> (dist ${dist[u]}) — Dijkstra greedily picks the closest unfinalised router. It will never revisit it.`;
            });
            nbrs(u).forEach(([v, w]) => {
              if (vis.has(v)) return;
              algo.push(() => {
                desc.innerHTML = `Relax ${u} → ${v}: ${dist[u]} + ${w} = ${dist[u] + w} vs current ${dist[v] === Infinity ? '∞' : dist[v]}.`;
                if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; visited[v] = 'frontier'; desc.innerHTML += ` <b>Improve → ${dist[v]}</b>`; }
                else desc.innerHTML += ' — no improvement.';
              });
            });
            vis.add(u);
          }
          algo.push(() => {
            const path = []; let cur = dst;
            while (cur !== undefined) { path.unshift(cur); cur = prev[cur]; }
            desc.innerHTML = path[0] === src
              ? `✅ Shortest path <b>${path.join(' → ')}</b> = <b>${dist[dst]}</b>. Total cost is what routing protocols minimise.`
              : `${dst} unreachable from ${src}.`;
          });
        } else if (kind === 'bfs' || kind === 'dfs') {
          const orderArr = []; const seen = new Set([src]);
          if (kind === 'bfs') {
            const q = [src];
            while (q.length) {
              const u = q.shift(); orderArr.push(u);
              nbrs(u).forEach(([v]) => { if (!seen.has(v)) { seen.add(v); q.push(v); algo.push(() => { desc.innerHTML = `BFS discovers <b>${v}</b> from ${u} — everything one hop away is found before anything two hops away.`; }); } });
            }
          } else {
            const st = [src];
            while (st.length) {
              const u = st.pop();
              if (seen.has(u) && orderArr.includes(u)) continue;
              seen.add(u); orderArr.push(u);
              nbrs(u).forEach(([v]) => { if (!seen.has(v)) { algo.push(() => { desc.innerHTML = `DFS dives to <b>${v}</b> from ${u} — depth first, backtrack later.`; }); st.push(v); } });
            }
          }
          orderArr.forEach((u, i) => {
            algo.push(() => { visited[u] = 'final'; order[u] = i + 1; desc.innerHTML = `<b>${u}</b> visited (#${i + 1}). ${kind.toUpperCase()} order so far: ${orderArr.slice(0, i + 1).join(' → ')}.`; });
          });
        } else { // bellman-ford
          const orderN = nodes.map(n => n.id);
          for (let pass = 1; pass <= nodes.length - 1; pass++) {
            algo.push(() => { desc.innerHTML = `Pass ${pass}: relax <b>every edge once</b> — this is what a distance-vector protocol does between its neighbours.`; });
            orderN.forEach(u => {
              nbrs(u).forEach(([v, w]) => {
                algo.push(() => {
                  if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; visited[v] = 'frontier'; desc.innerHTML += ` ${u}→${v} improved to ${dist[v]}.`; }
                });
              });
            });
          }
          algo.push(() => {
            desc.innerHTML = `After V−1 passes the tables converge. One more pass with no change proves there is no negative cycle — <b>count-to-infinity</b> is what happens in DV when they don't.`;
          });
        }
      }
      function render() {
        nodes.forEach(n => {
          const ne = nodeEls[n.id];
          ne.c.setAttribute('fill', n.id === src ? '#a2ce9d' : n.id === dst ? '#ffd98a' : visited[n.id] === 'final' ? '#4f46e5' : visited[n.id] === 'frontier' ? '#c5d5ee' : '#fffdf8');
          ne.c.setAttribute('stroke', visited[n.id] ? '#4f46e5' : '#c9c3b6');
          ne.badge.textContent = dist[n.id] === Infinity ? '' : (dist[n.id] + (order[n.id] ? ' #' + order[n.id] : ''));
        });
        edges.forEach(([a, b]) => {
          const E = edgeEls[a + '|' + b];
          const onPath = visited[a] === 'final' && visited[b] === 'final' && Math.abs((dist[a] ?? 0) - (dist[b] ?? 0)) === E.w;
          E.line.setAttribute('stroke', onPath ? '#4f46e5' : '#d9d5f0');
          E.line.setAttribute('stroke-width', onPath ? 4.5 : 2.5);
        });
        $('#rTable', side).innerHTML = `<table class="rtable"><tr><th>Router</th><th>Dist</th><th>Via</th><th>#</th></tr>` +
          nodes.map(n => `<tr><td>${n.id}</td><td class="mono">${dist[n.id] === Infinity ? '∞' : dist[n.id]}</td><td>${prev[n.id] || '—'}</td><td>${order[n.id] || '—'}</td></tr>`).join('') + '</table>';
      }
      // selects
      const srcSel = $('#rSrc', shell), dstSel = $('#rDst', shell);
      nodes.forEach(n => { srcSel.add(new Option(n.id, n.id)); dstSel.add(new Option(n.id, n.id)); });
      srcSel.value = src; dstSel.value = dst;
      srcSel.onchange = () => { src = srcSel.value; reset(); };
      dstSel.onchange = () => { dst = dstSel.value; reset(); };
      let playTimer = null;
      function reset() { buildPlan(); stepIdx = 0; visited = {}; order = {}; nodes.forEach(n => dist[n.id] = Infinity); dist[src] = 0; prev = {}; desc.innerHTML = 'Press <b>Step</b>.'; render(); }
      $('#rStep', shell).onclick = () => { if (playTimer) { clearInterval(playTimer); playTimer = null; } if (stepIdx < algo.length) { algo[stepIdx++](); render(); } };
      $('#rPlay', shell).onclick = () => {
        if (playTimer) { clearInterval(playTimer); playTimer = null; return; }
        playTimer = setInterval(() => { if (stepIdx < algo.length) { algo[stepIdx++](); render(); } else { clearInterval(playTimer); playTimer = null; } }, 550);
      };
      $('#rReset', shell).onclick = reset;
      reset();
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     5. TCP HANDSHAKE
  ================================================================ */
  LABS.push({
    id: 'lab-tcp', icon: '🤝', title: 'TCP Handshake & Teardown',
    desc: 'The famous three-way handshake, then data, then the four-step close — with sequence numbers, acknowledgement maths and each side’s TCP state shown as it changes.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; };
      controlsHTML(shell, `<button class="btn primary small" id="tPlay">▶ Play</button>
        <button class="btn ghost small" id="tStep">Step →</button>
        <button class="btn ghost small" id="tReset">Reset</button>
        <span class="lab-status" id="tState">closed</span>`);
      const wrap = el('div');
      shell.appendChild(wrap);
      const svg = svgEl('svg', { viewBox: '0 0 760 480', class: 'lab-canvas' });
      wrap.appendChild(svg);
      svgEl('rect', { x: 40, y: 14, width: 130, height: 46, rx: 12, fill: '#4f46e5' }, svg);
      let t = svgEl('text', { x: 105, y: 42, 'text-anchor': 'middle', fill: '#fff', 'font-size': 14, 'font-weight': 800, class: 'svg-t' }, svg); t.textContent = 'CLIENT';
      svgEl('rect', { x: 590, y: 14, width: 130, height: 46, rx: 12, fill: '#0e7a55' }, svg);
      t = svgEl('text', { x: 655, y: 42, 'text-anchor': 'middle', fill: '#fff', 'font-size': 14, 'font-weight': 800, class: 'svg-t' }, svg); t.textContent = 'SERVER';
      svgEl('line', { x1: 105, y1: 60, x2: 105, y2: 460, stroke: '#d9d5f0', 'stroke-width': 2 }, svg);
      svgEl('line', { x1: 655, y1: 60, x2: 655, y2: 460, stroke: '#d9d5f0', 'stroke-width': 2 }, svg);
      const stateC = svgEl('text', { x: 105, y: 475, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#737a8c', class: 'svg-t' }, svg);
      const stateS = svgEl('text', { x: 655, y: 475, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: '#737a8c', class: 'svg-t' }, svg);
      stateC.textContent = 'CLOSED'; stateS.textContent = 'LISTEN';

      const steps = [
        { from: 'c', label: 'SYN  seq = x', c: '#e2b95d', sc: 'SYN_SENT', ss: 'LISTEN', log: '① <b>SYN</b>: “I want to talk; my sequence starts at random <b>x</b>.” The SYN consumes one sequence number.' },
        { from: 's', label: 'SYN-ACK  seq = y, ack = x+1', c: '#e2b95d', sc: 'SYN_SENT', ss: 'SYN_RCVD', log: '② <b>SYN-ACK</b>: server agrees and sends its own random <b>y</b>, acking client’s x+1.' },
        { from: 'c', label: 'ACK  ack = y+1', c: '#16a34a', sc: 'ESTABLISHED', ss: 'ESTABLISHED', log: '③ <b>ACK</b>: connection <b>ESTABLISHED</b> both ways. Three messages — that’s why it’s the three-way handshake.' },
        { from: 'c', label: 'HTTP GET  (seq x+1…)', c: '#2563eb', sc: 'ESTABLISHED', ss: 'ESTABLISHED', log: 'Application data now flows as a reliable byte stream — TCP slices it into segments and numbers every byte.' },
        { from: 's', label: '200 OK  (bytes acked)', c: '#16a34a', sc: 'ESTABLISHED', ss: 'ESTABLISHED', log: 'Server answers; every byte is ACKed, lost ones are retransmitted, order is restored at the receiver.' },
        { from: 'c', label: 'FIN, ACK', c: '#e0a29c', sc: 'FIN_WAIT_1', ss: 'ESTABLISHED', log: 'Client finished: <b>FIN</b>. Each direction closes <b>independently</b> — that’s the half-close.' },
        { from: 's', label: 'ACK', c: '#e0a29c', sc: 'FIN_WAIT_2', ss: 'CLOSE_WAIT', log: 'Server acks the FIN — it may still have data to send (that’s why close needs four steps, not three).' },
        { from: 's', label: 'FIN, ACK', c: '#e0a29c', sc: 'FIN_WAIT_2', ss: 'LAST_ACK', log: 'Server is done too: its own <b>FIN</b>.' },
        { from: 'c', label: 'ACK  → TIME_WAIT (2×MSL)', c: '#16a34a', sc: 'TIME_WAIT', ss: 'CLOSED', log: 'Final ACK. Client waits <b>2×MSL</b> in TIME_WAIT so a lost final ACK can still be re-sent, then everything is CLOSED.' },
      ];
      let idx = 0, timer = null;
      async function doStep() {
        if (idx >= steps.length || !alive.v) return;
        const s = steps[idx];
        const y = 90 + idx * 42;
        const x1 = s.from === 'c' ? 115 : 645, x2 = s.from === 'c' ? 645 : 115;
        const g = svgEl('g', {}, svg);
        svgEl('line', { x1, y1: y, x2, y2: y, stroke: s.c, 'stroke-width': 2.5, 'marker-end': '' }, g);
        const head = svgEl('polygon', { points: `${x2},${y} ${x2 - (s.from === 'c' ? 11 : -11)},${y - 5} ${x2 - (s.from === 'c' ? 11 : -11)},${y + 5}`, fill: s.c }, g);
        const lt = svgEl('text', { x: (x1 + x2) / 2, y: y - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, g);
        lt.textContent = s.label;
        stateC.textContent = s.sc; stateS.textContent = s.ss;
        const logs = $('#tLog', shell);
        logTo(logs, idx + 1, s.log);
        idx++;
        if (idx === steps.length) $('#tState', shell).textContent = 'connection closed ✓';
        else $('#tState', shell).textContent = 'step ' + idx + '/9';
      }
      controlsHTML(shell, '');
      const logs = el('div', 'lab-log'); logs.id = 'tLog';
      shell.appendChild(logs);
      $('#tStep', shell).onclick = doStep;
      $('#tPlay', shell).onclick = () => { if (timer) return; timer = setInterval(() => { if (idx >= steps.length) { clearInterval(timer); timer = null; return; } doStep(); }, 1100); };
      $('#tReset', shell).onclick = () => { location.hash = '#/labs'; setTimeout(() => { location.hash = '#/labs#lab-tcp'; }, 0); };
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     6. CONGESTION CONTROL
  ================================================================ */
  LABS.push({
    id: 'lab-congestion', icon: '📉', title: 'TCP Congestion Control — the sawtooth',
    desc: 'Slow start doubles every RTT, congestion avoidance climbs +1, and loss resets the story — halving on three duplicate ACKs (fast recovery), crashing to 1 MSS on a timeout. Inject loss yourself.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; };
      controlsHTML(shell, `
        <button class="btn primary small" id="cRun">▶ Run</button>
        <button class="btn ghost small" id="cPause">⏸ Pause</button>
        <button class="btn ghost small" id="cDup">Inject 3 dup-ACKs</button>
        <button class="btn ghost small" id="cTimeout">Inject timeout</button>
        <button class="btn ghost small" id="cReset">Reset</button>
        <label>loss chance <input type="range" id="cLoss" min="0" max="20" value="4" style="width:120px"><span class="val" id="cLossV">4%</span></label>`);
      const canvas = el('canvas', 'lab-canvas'); canvas.width = 880; canvas.height = 352;
      shell.appendChild(canvas);
      const status = el('div', 'small', '');
      status.style.marginTop = '8px';
      shell.appendChild(status);

      const ctx = canvas.getContext('2d');
      let cwnd = 1, ssthresh = 16, round = 0, mode = 'slow', history = [], timer = null;
      const maxC = 64, maxR = 80;
      function reset() { cwnd = 1; ssthresh = 16; round = 0; mode = 'slow'; history = [{ r: 0, c: 1, ev: '' }]; draw(); status.innerHTML = 'Slow start: cwnd doubles <b>every RTT</b> until it reaches ssthresh (16).'; }
      function step() {
        round++;
        let ev = '';
        const lossP = +$('#cLoss', shell).value / 100;
        $('#cLossV', shell).textContent = $('#cLoss', shell).value + '%';
        if (Math.random() < lossP) {
          if (Math.random() < 0.5) { ssthresh = Math.max(2, Math.floor(cwnd / 2)); cwnd = ssthresh; ev = 'dup-ACK'; mode = 'avoid'; }
          else { ssthresh = Math.max(2, Math.floor(cwnd / 2)); cwnd = 1; ev = 'timeout'; mode = 'slow'; }
        } else if (mode === 'slow') {
          cwnd = Math.min(cwnd * 2, maxC); ev = '×2';
          if (cwnd >= ssthresh) { mode = 'avoid'; ev += ' → hit ssthresh, now +1/RTT'; }
        } else { cwnd = Math.min(cwnd + 1, maxC); ev = '+1'; }
        history.push({ r: round, c: cwnd, ev });
        draw();
        status.innerHTML = `Round ${round}: <b>cwnd = ${cwnd} MSS</b> (${mode === 'slow' ? 'slow start' : 'congestion avoidance'}), ssthresh = ${ssthresh} ${ev ? '· ' + ev : ''}`;
      }
      function draw() {
        ctx.clearRect(0, 0, 880, 352);
        ctx.fillStyle = '#fbf9f4'; ctx.fillRect(0, 0, 880, 352);
        ctx.strokeStyle = '#e7e2d8';
        for (let c = 8; c <= maxC; c += 8) { const y = 300 - c / maxC * 270; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(870, y); ctx.stroke(); ctx.fillStyle = '#9b937f'; ctx.font = '11px Menlo'; ctx.fillText(c, 10, y + 4); }
        ctx.strokeStyle = '#b9a26b'; ctx.setLineDash([6, 5]);
        const sy = 300 - ssthresh / maxC * 270;
        ctx.beginPath(); ctx.moveTo(40, sy); ctx.lineTo(870, sy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#7a5a12'; ctx.fillText('ssthresh ' + ssthresh, 780, sy - 6);
        ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(79,70,229,.55)'; ctx.shadowBlur = 10;
        ctx.beginPath();
        history.forEach((h, i) => {
          const x = 40 + h.r / maxR * 820, y = 300 - h.c / maxC * 270;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        // glow fill under the sawtooth
        const lastX = 40 + history[history.length - 1].r / maxR * 820;
        ctx.save();
        ctx.lineTo(lastX, 300); ctx.lineTo(40, 300); ctx.closePath();
        const gr = ctx.createLinearGradient(0, 30, 0, 300);
        gr.addColorStop(0, 'rgba(99,102,241,.30)'); gr.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = gr; ctx.fill();
        ctx.restore();
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.lineWidth = 1;
        // packets in flight — one box per MSS of window at the current round
        const boxes = Math.min(Math.round(cwnd), 42);
        for (let i = 0; i < boxes; i++) {
          const bx = 60 + i * 19, by = 312 + Math.sin(round * 1.7 + i) * 2;
          ctx.fillStyle = i < boxes * 0.6 ? '#6366f1' : '#a5b4fc';
          ctx.fillRect(bx, by, 13, 8);
        }
        ctx.fillStyle = '#454b5c'; ctx.font = '11px Menlo';
        ctx.fillText(boxes + ' segments in flight →', 60 + Math.min(boxes, 42) * 19 + 8, 343);
        history.forEach(h => {
          if (h.ev.includes('dup-ACK')) { ctx.fillStyle = '#e0a29c'; ctx.fillRect(40 + h.r / maxR * 820 - 3, 300 - h.c / maxC * 270 - 3, 6, 6); }
          if (h.ev.includes('timeout')) { ctx.fillStyle = '#8a3b34'; ctx.fillRect(40 + h.r / maxR * 820 - 4, 300 - h.c / maxC * 270 - 4, 8, 8); }
        });
        ctx.fillStyle = '#454b5c'; ctx.font = '12px Menlo';
        ctx.fillText('RTTs →', 800, 318); ctx.fillText('cwnd (MSS) ↑', 44, 18);
      }
      $('#cRun', shell).onclick = () => { if (timer) return; timer = setInterval(() => { if (!alive.v || round >= maxR) { clearInterval(timer); timer = null; return; } step(); }, 420); };
      $('#cPause', shell).onclick = () => { clearInterval(timer); timer = null; };
      $('#cDup', shell).onclick = () => { ssthresh = Math.max(2, Math.floor(cwnd / 2)); cwnd = ssthresh; mode = 'avoid'; history.push({ r: ++round, c: cwnd, ev: 'dup-ACK' }); draw(); status.innerHTML = `<b>Fast recovery:</b> 3 dup-ACKs → ssthresh = cwnd/2 = ${ssthresh}, resume from there (no crash).`; };
      $('#cTimeout', shell).onclick = () => { ssthresh = Math.max(2, Math.floor(cwnd / 2)); cwnd = 1; mode = 'slow'; history.push({ r: ++round, c: 1, ev: 'timeout' }); draw(); status.innerHTML = `<b>Timeout:</b> the retransmit timer fired — the network gave no hint at all, so TCP restarts from cwnd = 1, ssthresh = ${ssthresh}.`; };
      $('#cReset', shell).onclick = reset;
      $('#cLoss', shell).addEventListener('input', () => { $('#cLossV', shell).textContent = $('#cLoss', shell).value + '%'; });
      reset();
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     7. DHCP DORA
  ================================================================ */
  LABS.push({
    id: 'lab-dhcp', icon: '📡', title: 'DHCP — the DORA dance',
    desc: 'A laptop with no IP joins the network. Watch Discover → Offer → Request → Ack, note which messages are <b>broadcast</b> and why, then run the 24-hour lease clock with its T1/T2/T3 renewals.',
    mount(shell) {
      const alive = { v: true }; this._teardown = () => { alive.v = false; };
      controlsHTML(shell, `
        <button class="btn primary small" id="dRun">▶ Run DORA</button>
        <button class="btn ghost small" id="dLease">▶ Run 24-hour lease</button>
        <button class="btn ghost small" id="dReset2">Reset</button>
        <span class="lab-status" id="dState">client: INIT (no IP)</span>`);
      const wrap = el('div');
      shell.appendChild(wrap);
      const svg = svgEl('svg', { viewBox: '0 0 760 330', class: 'lab-canvas' });
      wrap.appendChild(svg);
      svgEl('rect', { x: 50, y: 40, width: 170, height: 56, rx: 12, fill: '#4f46e5' }, svg);
      let tx = svgEl('text', { x: 135, y: 63, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13.5, 'font-weight': 800, class: 'svg-t' }, svg); tx.textContent = 'NEW CLIENT';
      tx = svgEl('text', { x: 135, y: 82, 'text-anchor': 'middle', fill: '#dcd8ff', 'font-size': 11, class: 'svg-t' }, svg); tx.textContent = '0.0.0.0 → 255.255.255.255';
      svgEl('rect', { x: 540, y: 40, width: 180, height: 56, rx: 12, fill: '#0e7a55' }, svg);
      tx = svgEl('text', { x: 630, y: 63, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13.5, 'font-weight': 800, class: 'svg-t' }, svg); tx.textContent = 'DHCP SERVER';
      tx = svgEl('text', { x: 630, y: 82, 'text-anchor': 'middle', fill: '#c8ecda', 'font-size': 11, class: 'svg-t' }, svg); tx.textContent = '192.168.1.1 · pool .100-.199';
      svgEl('line', { x1: 135, y1: 96, x2: 135, y2: 280, stroke: '#d9d5f0', 'stroke-width': 2 }, svg);
      svgEl('line', { x1: 630, y1: 96, x2: 630, y2: 280, stroke: '#d9d5f0', 'stroke-width': 2 }, svg);
      const leaseBar = el('div', 'fig', `
        <b style="font-size:13px">Lease clock — 24 h</b>
        <div style="position:relative;height:34px;background:linear-gradient(90deg,#e9f2fb,#edf6ec);border:1px solid var(--line);border-radius:9px;margin-top:8px">
          <div id="dMarker" style="position:absolute;top:-6px;left:0;width:14px;height:14px;border-radius:50%;background:#4f46e5;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.3);transition:left .2s"></div>
          <span style="position:absolute;left:50%;top:8px;font-size:10.5px;font-weight:800;color:#2f5c85">T1 50%</span>
          <span style="position:absolute;left:87.5%;top:8px;font-size:10.5px;font-weight:800;color:#7a5a12">T2 87.5%</span>
          <span style="position:absolute;left:3px;top:8px;font-size:10.5px;color:#737a8c">0 h</span>
          <span style="position:absolute;right:3px;top:8px;font-size:10.5px;color:#8a3b34">T3 24 h</span>
        </div><div id="dLeaseLog" class="small" style="margin-top:6px;color:var(--ink-2)">Lease not started.</div>`);
      const logs = el('div', 'lab-log'); logs.id = 'dLog';
      shell.appendChild(leaseBar); shell.appendChild(logs);

      const msgs = [
        { from: 'c', label: '① DISCOVER — broadcast 📣', bcast: true, c: '#2563eb', log: 'Client has no IP and doesn’t know the server — so <b>DISCOVER goes to 255.255.255.255</b>. UDP 68 → 67, source IP 0.0.0.0. <i>“Any DHCP server out there?”</i>' },
        { from: 's', label: '② OFFER — “take 192.168.1.150 /24”', bcast: false, c: '#8a5cf6', log: 'A server <b>OFFERS</b> an address, mask, gateway, DNS and lease time. Client state → SELECTING.' },
        { from: 'c', label: '③ REQUEST — still broadcast 📣', bcast: true, c: '#e2b95d', log: 'Client <b>REQUESTS the chosen offer — broadcast on purpose</b>: other servers that offered hear they lost and withdraw theirs.' },
        { from: 's', label: '④ ACK — “yours for 86400 s”', bcast: false, c: '#16a34a', log: '<b>ACK</b> confirms the lease (24 h). Client → <b>BOUND</b>, sends a gratuitous ARP to double-check no one else has the IP. Networking can start! 🎉' },
      ];
      let busy = false;
      async function runDora() {
        if (busy) return; busy = true;
        $$('.msg', svg).forEach(m => m.remove());
        for (let i = 0; i < msgs.length; i++) {
          if (!alive.v) { busy = false; return; }
          const m = msgs[i];
          $('#dState', shell).textContent = ['client: SELECTING…', 'client: SELECTING', 'client: REQUESTING', 'client: BOUND ✓'][i];
          await travel(svg, mkPath(m.from), m.c, { label: m.label, dur: 1000 });
          logTo(logs, i + 1, m.log);
        }
        busy = false;
      }
      function mkPath(from) {
        const y = 130 + msgs.filter((_, j) => j <= idxOf(from)).length * 34; // unused fallback
        return { getTotalLength: () => 100, getPointAtLength: l => ({ x: from === 'c' ? 135 + l * 4.95 : 630 - l * 4.95, y: 150 }) };
      }
      function idxOf() { return 0; }
      async function runLease() {
        const marker = $('#dMarker', shell), ll = $('#dLeaseLog', shell);
        for (const [pct, txt] of [[0, 'Lease starts — 192.168.1.150 valid for 24 h.'], [50, '<b>T1 (12 h):</b> client <b>unicasts</b> REQUEST straight to its server — “renew me?” → server ACKs, clock restarts.'], [87.5, '<b>T2 (21 h):</b> still no answer → client <b>broadcasts</b> — any DHCP server may extend.'], [100, '<b>T3 (24 h):</b> lease expired — the IP is gone. Full DORA restarts (brief outage).']]) {
          if (!alive.v) return;
          marker.style.left = `calc(${pct}% - 7px)`;
          ll.innerHTML = txt;
          await sleep(1400);
        }
      }
      $('#dRun', shell).onclick = runDora;
      $('#dLease', shell).onclick = runLease;
      $('#dReset2', shell).onclick = () => { $$('.msg', svg).forEach(m => m.remove()); logs.innerHTML = ''; $('#dState', shell).textContent = 'client: INIT (no IP)'; };
    },
    teardown() { if (this._teardown) this._teardown(); },
  });

  /* ================================================================
     8. NAT TRANSLATOR
  ================================================================ */
  LABS.push({
    id: 'lab-nat', icon: '🔁', title: 'NAT — the router’s magic table',
    desc: 'Three laptops share one public IP. Send packets and watch the router rewrite IP:port pairs going out, and reverse the translation coming back. Then add a port-forwarding rule and see a stranger reach IN.',
    mount(shell) {
      controlsHTML(shell, `
        <label>host <select id="nHost"><option value="10">192.168.1.10</option><option value="11">192.168.1.11</option><option value="12">192.168.1.12</option></select></label>
        <button class="btn primary small" id="nSend">Send packet → internet</button>
        <button class="btn ghost small" id="nFwd">${'Add port-forward :80 → .10:8080'}</button>
        <button class="btn ghost small" id="nStranger">Stranger → 203.0.113.7:80</button>
        <button class="btn ghost small" id="nClear">Clear table</button>`);
      const svgWrap = el('div');
      shell.appendChild(svgWrap);
      const svg = svgEl('svg', { viewBox: '0 0 860 190', class: 'lab-canvas' });
      svgWrap.appendChild(svg);
      const box = (x, y, w, h, label, sub, fill) => {
        svgEl('rect', { x, y, width: w, height: h, rx: 11, fill: fill || '#fffdf8', stroke: '#d9d5f0', 'stroke-width': 1.5 }, svg);
        const t = svgEl('text', { x: x + w / 2, y: y + h / 2 - (sub ? 2 : -5), 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#2c3242', class: 'svg-t' }, svg);
        t.textContent = label;
        if (sub) { const s = svgEl('text', { x: x + w / 2, y: y + h / 2 + 15, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#737a8c', class: 'svg-t' }, svg); s.textContent = sub; }
      };
      box(30, 60, 180, 70, 'Private LAN', '192.168.1.0/24', '#f1effb');
      ['10', '11', '12'].forEach((h, i) => box(48 + i * 56, 80, 44, 32, '.' + h, null, '#dcd8ff'));
      box(370, 55, 130, 80, 'NAT router', '203.0.113.7', '#e2b95d');
      box(650, 60, 170, 70, 'The Internet', '8.8.8.8 · 1.1.1.1 …', '#edf6ec');
      const path1 = svgEl('path', { d: 'M215,95 L365,95', stroke: '#d9d5f0', 'stroke-width': 3, fill: 'none' }, svg);
      const path2 = svgEl('path', { d: 'M505,95 L645,95', stroke: '#d9d5f0', 'stroke-width': 3, fill: 'none' }, svg);
      const pathIn = svgEl('path', { d: 'M645,120 L505,120', stroke: '#c9c3b6', 'stroke-width': 2.5, 'stroke-dasharray': '5 5', fill: 'none' }, svg);

      const table = el('div');
      shell.appendChild(table);
      let maps = [], nextPort = 40001, fwd = null;
      function renderTable() {
        table.innerHTML = `<table class="nat-table"><tr><th>Inside (private)</th><th></th><th>Outside (public)</th></tr>` +
          maps.map(m => `<tr class="new"><td>${m.priv}</td><td>⇄</td><td>${m.pub}</td></tr>`).join('') +
          (fwd ? `<tr><td colspan="3" style="font-family:inherit">📌 <b>Static port-forward (DNAT):</b> 203.0.113.7:<b>80</b> always → 192.168.1.10:<b>8080</b></td></tr>` : '') +
          `</table><p class="small">No matching table entry → the router <b>drops</b> the packet. NAT is the accidental firewall of every home network.</p>`;
      }
      $('#nSend', shell).onclick = async () => {
        const host = '192.168.1.' + $('#nHost', shell).value;
        const port = nextPort++;
        maps.push({ priv: `${host}:${50000 - nextPort % 3}`, pub: `203.0.113.7:${port}` });
        renderTable();
        await travel(svg, path1, '#4f46e5', { label: `${host} → 8.8.8.8:443`, dur: 600 });
        await travel(svg, path2, '#b8860b', { label: `203.0.113.7:${port} → 8.8.8.8:443`, dur: 600 });
        await travel(svg, path2, '#16a34a', { label: 'reply → 203.0.113.7:' + port, reverse: true, dur: 650 });
        await travel(svg, path1, '#16a34a', { label: '→ ' + host, reverse: true, dur: 600 });
      };
      $('#nFwd', shell).onclick = () => {
        if (fwd) return toast('Rule already added.');
        fwd = true; renderTable(); toast('Port-forward added — outside :80 now reaches .10:8080.');
      };
      $('#nStranger', shell).onclick = async () => {
        if (!fwd) return toast('Add the port-forwarding rule first — otherwise NAT drops inbound :80.');
        await travel(svg, pathIn, '#8a3b34', { label: 'stranger → 203.0.113.7:80', dur: 800 });
        await travel(svg, path1, '#8a3b34', { label: '→ 192.168.1.10:8080', dur: 700 });
        logLine(table, '✉️ Inbound :80 matched the static rule → DNAT to 192.168.1.10:8080. This is how game servers and CCTV are reachable from outside.');
      };
      $('#nClear', shell).onclick = () => { maps = []; fwd = null; nextPort = 40001; renderTable(); };
      function logLine(box, html) {
        const p = el('p', 'small', html); p.style.margin = '6px 0 0';
        box.appendChild(p);
      }
      renderTable();
    },
    teardown() {},
  });

  /* ================================================================
     9. DNS RESOLVER
  ================================================================ */
  LABS.push({
    id: 'lab-dns', icon: '🔍', title: 'DNS — climb the hierarchy',
    desc: 'Watch a name become an address: caches first, then root → TLD → authoritative. Then resolve again inside the TTL and watch the caches answer instead — that’s why DNS feels instant.',
    mount(shell) {
      controlsHTML(shell, `
        <button class="btn primary small" id="dnsCold">Resolve (cold caches)</button>
        <button class="btn ghost small" id="dnsWarm">Resolve again (within TTL)</button>
        <button class="btn ghost small" id="dnsExpired">Resolve (TTL expired)</button>
        <label>TTL <input type="range" id="dnsTtl" min="30" max="3600" value="3600" step="30" style="width:130px"><span class="val" id="dnsTtlV">3600 s</span></label>`);
      const row = el('div', 'grid2 grid3');
      row.style.gridTemplateColumns = 'repeat(6, 1fr)';
      shell.appendChild(row);
      const stages = [
        { k: 'browser', name: 'Browser cache', icon: '🌐' },
        { k: 'os', name: 'OS + hosts file', icon: '💻' },
        { k: 'resolver', name: 'Recursive resolver', icon: '🏢' },
        { k: 'root', name: 'Root (. )', icon: '🌍' },
        { k: 'tld', name: '.com TLD', icon: '📮' },
        { k: 'auth', name: 'Authoritative', icon: '🗄️' },
      ];
      const cards = {};
      stages.forEach(s => {
        const c = el('div', 'lab-card');
        c.id = 'dns-' + s.k;
        c.innerHTML = `<div class="ico">${s.icon}</div><div class="t" style="font-size:12.5px">${s.name}</div><div class="d" id="dnsState-${s.k}">idle</div>`;
        row.appendChild(c);
        cards[s.k] = c;
      });
      const logBox = el('div', 'lab-log'); logBox.style.maxHeight = '240px';
      shell.appendChild(logBox);
      const setState = (k, txt, hot) => { $('#dnsState-' + k, shell).innerHTML = txt; cards[k].style.borderColor = hot ? '#16a34a' : 'var(--line)'; };
      const resetAll = () => stages.forEach(s => setState(s.k, 'idle'));
      const q = 'www.example.com → ?';

      async function resolve(cold) {
        let n = 0; resetAll();
        const put = (k, txt, hit) => setState(k, hit ? '⚡ cache HIT — ' + txt : 'miss', hit);
        const step = async (k, hit, txt, ms) => {
          if (!window._dnsAlive) return;
          cards[k].style.borderColor = 'var(--acc)';
          logTo(logBox, ++n, txt);
          put(k, txt, hit);
          await sleep(ms || 750);
          if (!window._dnsAlive) return;
          cards[k].style.borderColor = 'var(--line)';
        };
        await step('browser', !cold, '<b>Browser cache?</b> ' + (cold ? 'miss — first visit.' : '<b>HIT!</b> Same tab, same name — no network needed.'), 700);
        if (!cold) return done(true);
        await step('os', false, '<b>OS stub resolver + /etc/hosts:</b> miss → forward to the configured recursive resolver.');
        await step('resolver', false, '<b>Recursive resolver</b> (your ISP or 8.8.8.8): cache empty → walk the hierarchy. <b>UDP 53</b>.');
        await step('root', false, '<b>Root server</b> (a–m.root-servers.net): “ask the <b>.com</b> TLD servers — here are their addresses.” (Roots don’t know example.com; they know who does.)');
        await step('tld', false, '<b>.com TLD</b> (e.g. a.gtld-servers.net): “example.com’s nameservers are <b>ns1.example.com</b>.”');
        await step('auth', false, '<b>Authoritative server</b> holds the zone: <b>A 93.184.216.34, TTL ' + $('#dnsTtl', shell).value + '</b>.');
        logTo(logBox, ++n, '⬅️ The answer travels back: auth → resolver (caches it) → OS (caches it) → browser (caches it). Done!');
        done(false);
      }
      function done(hit) {
        logTo(logBox, '✓', hit ? '<b>Answered from cache — 0 hierarchy queries.</b> That’s the internet’s speed secret: every hop caches, and TTL decides how long each answer lives.' :
          '<b>Cached at every level for the TTL.</b> Try “Resolve again (within TTL)” — then let the TTL expire and watch the climb happen again.');
      }
      $('#dnsCold', shell).onclick = () => resolve(true);
      $('#dnsWarm', shell).onclick = () => resolve(false);
      $('#dnsExpired', shell).onclick = () => resolve(true);
      $('#dnsTtl', shell).addEventListener('input', e => { $('#dnsTtlV', shell).textContent = e.target.value + ' s'; });
      window._dnsAlive = true;
    },
    teardown() { window._dnsAlive = false; },
  });

  /* ================================================================
     10. DELAY CALCULATOR
  ================================================================ */
  LABS.push({
    id: 'lab-delay', icon: '⏱️', title: 'Delay Lab — where does time go?',
    desc: 'Push bits down a real link: transmission delay (L/R — how fast you can push) and propagation delay (d/s — how fast the signal travels). Watch which one dominates, and find the bandwidth-delay product.',
    mount(shell) {
      controlsHTML(shell, `
        <label>Packet size L <input type="range" id="dlL" min="64" max="12000" value="1000" step="8" style="width:150px"><span class="val" id="dlLv">1000 B</span></label>
        <label>Link rate R <input type="range" id="dlR" min="1" max="100" value="10" style="width:150px"><span class="val" id="dlRv">10 Mbps</span></label>
        <label>Distance d <input type="range" id="dlD" min="10" max="3000" value="1000" step="10" style="width:150px"><span class="val" id="dlDv">1000 km</span></label>`);
      const canvas = el('canvas', 'lab-canvas'); canvas.width = 880; canvas.height = 250;
      shell.appendChild(canvas);
      const out = el('div');
      shell.appendChild(out);
      function calc() {
        const L = +$('#dlL', shell).value, R = +$('#dlR', shell).value, D = +$('#dlD', shell).value;
        $('#dlLv', shell).textContent = L + ' B'; $('#dlRv', shell).textContent = R + ' Mbps'; $('#dlDv', shell).textContent = D + ' km';
        const dtrans = L * 8 / (R * 1e6) * 1e3;               // ms
        const dprop = D * 1e3 / 2e8 * 1e3;                    // ms (s = 2e8 m/s)
        const total = dtrans + dprop;
        const bdp = R * 1e6 * (dprop / 1e3) / 8 / 1024;       // KB in flight
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 880, 250);
        ctx.fillStyle = '#fbf9f4'; ctx.fillRect(0, 0, 880, 250);
        // sender / receiver
        ctx.fillStyle = '#4f46e5'; ctx.fillRect(40, 100, 70, 50); ctx.fillStyle = '#fff'; ctx.font = '12px -apple-system'; ctx.fillText('sender', 52, 130);
        ctx.fillStyle = '#0e7a55'; ctx.fillRect(770, 100, 70, 50); ctx.fillStyle = '#fff'; ctx.fillText('receiver', 782, 130);
        // link
        ctx.strokeStyle = '#c9c3b6'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(110, 125); ctx.lineTo(770, 125); ctx.stroke(); ctx.lineWidth = 1;
        // propagation visual: wave position
        const frac = Math.min(1, dprop / 12);
        const wx = 110 + frac * 660;
        ctx.strokeStyle = '#e2b95d'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(wx, 95); ctx.lineTo(wx, 155); ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = '#7a5a12'; ctx.font = '11.5px Menlo'; ctx.fillText('signal front: ' + dprop.toFixed(2) + ' ms across', Math.min(660, wx + 6), 90);
        // transmission visual: block of bits being pushed
        const bfrac = Math.min(1, dtrans / 12);
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(110, 165, bfrac * 660, 22);
        ctx.fillStyle = '#fff'; ctx.font = '11.5px Menlo';
        if (bfrac > 0.08) ctx.fillText('time to push all L bits onto the link: ' + dtrans.toFixed(2) + ' ms (L/R)', 118, 180);
        ctx.fillStyle = '#454b5c';
        const verdict = dtrans > dprop * 2 ? 'Transmission dominates — the link is SLOW, distance doesn’t matter.' :
          dprop > dtrans * 2 ? 'Propagation dominates — the pipe is LONG; adding bandwidth barely helps.' :
            'Balanced — both contribute ≈ equally.';
        ctx.fillText(verdict, 110, 230);
        out.innerHTML = `<div class="grid2" style="margin-top:10px">
          <div class="lab-side"><h4>The numbers</h4><table class="kv-table">
            <tr><td>d_trans = L/R</td><td>${dtrans.toFixed(3)} ms</td></tr>
            <tr><td>d_prop = d/s</td><td>${dprop.toFixed(3)} ms (s = 2×10⁸ m/s)</td></tr>
            <tr><td>one-link total</td><td>${total.toFixed(3)} ms</td></tr>
            <tr><td>bandwidth-delay product</td><td>${bdp.toFixed(1)} KB in flight</td></tr></table></div>
          <div class="lab-side"><h4>Read it like an exam question</h4><p style="font-size:12.8px;margin:4px 0 0">
            d_nodal = d_proc + d_queue + <b>d_trans + d_prop</b>. Processing and queueing vary per hop; these two are physics.
            Notice: doubling distance doubles propagation; halving R doubles transmission. ${bdp > 32 ? 'A fat pipe × long pipe = many KB in flight — that’s why TCP needs a big <b>window</b> (L10).' : ''}</p></div>
        </div>`;
      }
      ['dlL', 'dlR', 'dlD'].forEach(id => $('#' + id, shell).addEventListener('input', calc));
      calc();
    },
    teardown() {},
  });

  window.CN_LABS = LABS;
})();
