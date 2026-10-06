// Extracts lecture content from build/lectureNN.html + master.html into site/data/lectures.json
const { chromium } = require('/Users/saichaitu/Desktop/ComputerNetworks/build/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const BUILD = '/Users/saichaitu/Desktop/ComputerNetworks/build';
const OUT = '/Users/saichaitu/Desktop/ComputerNetworks/site/data/lectures.json';

const files = [
  { src: 'lecture01.html', num: 1 },
  { src: 'lecture02.html', num: 2 },
  { src: 'lecture03.html', num: 3 },
  { src: 'lecture04.html', num: 4 },
  { src: 'lecture05.html', num: 5 },
  { src: 'lecture06.html', num: 6 },
  { src: 'lecture07.html', num: 7 },
  { src: 'lecture08.html', num: 8 },
  { src: 'lecture09.html', num: 9 },
  { src: 'lecture10.html', num: 10 },
  { src: 'lecture11.html', num: 11 },
  { src: 'lecture12.html', num: 12 },
  { src: 'lecture13.html', num: 13 },
  { src: 'master.html', num: 0 },
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const lectures = [];

  for (const f of files) {
    await page.goto('file://' + path.join(BUILD, f.src), { waitUntil: 'networkidle' });
    const data = await page.evaluate(() => {
      const $ = (s, el) => (el || document).querySelector(s);
      const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
      const rootStyle = getComputedStyle(document.documentElement);
      const acc = {
        acc: rootStyle.getPropertyValue('--acc').trim(),
        d: rootStyle.getPropertyValue('--acc-d').trim(),
        l: rootStyle.getPropertyValue('--acc-l').trim(),
        m: rootStyle.getPropertyValue('--acc-m').trim(),
      };
      const cover = $('.cover');
      const h1 = $('.cover h1');
      const title = h1 ? h1.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim() : document.title;
      const tagline = cover ? (cover.querySelector('.tagline') || {}).textContent || '' : '';
      const chips = cover ? $$('.chip', cover).map(c => c.textContent.trim()) : [];
      const summary = cover ? (cover.querySelector('.summary p') || {}).textContent || '' : '';
      const objBand = $('.obj-band');
      const objectives = objBand ? $$('.obj-band li').map(li => li.innerHTML.trim()) : [];

      // Sections in document order (skip cover/obj band)
      const sections = [];
      $$('.sec').forEach(sec => {
        const head = sec.querySelector('.sec-head');
        if (!head) return;
        const num = (head.querySelector('.num') || {}).textContent || '';
        const h2 = (head.querySelector('h2') || {}).textContent || '';
        // clone section, drop the head, keep the rest as html
        const clone = sec.cloneNode(true);
        clone.querySelectorAll('.sec-head').forEach(h => h.remove());
        sections.push({ num, title: h2, html: clone.innerHTML.trim() });
      });

      // Cheat / rapid revision card
      const cheat = $('.cheat');
      const cheatHtml = cheat ? cheat.outerHTML.trim() : null;

      // Questions (structured for the quiz engine)
      const questions = [];
      $$('.q').forEach(q => {
        const no = (q.querySelector('.q-no') || {}).textContent || '';
        const tag = (q.querySelector('.q-tag') || {}).textContent || '';
        const clone = q.cloneNode(true);
        clone.querySelectorAll('.q-no,.q-tag').forEach(e => e.remove());
        const opts = $$('.opts li', q).map(li => li.textContent.trim());
        if (opts.length) clone.querySelectorAll('.opts').forEach(e => e.remove());
        const text = clone.textContent.replace(/\s+/g, ' ').trim();
        questions.push({ no: no.replace(/[^\d]/g, ''), tag: tag.trim(), text, opts });
      });

      // Answer key items
      const answers = [];
      $$('.akey .a-item').forEach(a => {
        const b = a.querySelector('b');
        const key = b ? b.textContent.replace(':', '').trim() : '';
        if (b) b.remove();
        answers.push({ key, text: a.textContent.replace(/\s+/g, ' ').trim() });
      });

      // Explode combined MCQ key lines:  key "MCQ" → "1-c · 2-c · …"
      for (let i = answers.length - 1; i >= 0; i--) {
        const a = answers[i];
        if (/^MCQ$/i.test(a.key) && /\d\s*[-–]\s*[a-d]/i.test(a.text)) {
          a.text.split('·').forEach(pair => {
            const m = pair.trim().match(/^(\d+)\s*[-–]\s*([a-dA-D])/);
            if (m) answers.push({ key: 'A' + m[1], text: m[2].toUpperCase() + ' — correct per the Master Book key' });
          });
          answers.splice(i, 1);
        }
      }

      // MCQs whose options are inline in the text — "(a) … (b) … (c) … (d) …"
      questions.forEach(q => {
        if (q.tag.toUpperCase() === 'MCQ' && q.opts.length === 0) {
          const parts = [];
          const re = /\(([a-d])\)\s*([\s\S]*?)(?=\s*\([a-d]\)|$)/gi;
          let m;
          while ((m = re.exec(q.text))) parts.push({ l: m[1].toLowerCase(), t: m[2].trim().replace(/\s+/g, ' ') });
          if (parts.length === 4) {
            q.opts = parts.map(p => `${p.l}) ${p.t}`);
            const cut = q.text.indexOf('(a)');
            if (cut > 0) q.text = q.text.slice(0, cut).trim();
          }
        }
      });

      // h3 sub-headings stay inside section html — fine.
      return { acc, title, tagline, chips, summary, objectives, sections, cheatHtml, questions, answers };
    });

    lectures.push({ num: f.num, file: f.src, ...data });
    console.log(`✓ ${f.src}: ${data.sections.length} sections, ${data.questions.length} questions, ${data.answers.length} answers`);
  }

  await browser.close();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(lectures, null, 1));
  const size = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`\nWrote ${OUT} (${size} KB), ${lectures.length} lectures`);
})();
