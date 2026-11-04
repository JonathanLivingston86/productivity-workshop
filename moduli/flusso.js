/* Modulo opzionale: flusso a riquadri disegnato in SVG da una configurazione JSON. Si carica prima di deck.js.
   In index.html:
     <svg class="vis flow" id="flusso1" role="img" aria-label="..."></svg>
     <script type="application/json" data-flow-for="flusso1">{ ...configurazione... }</script>
   Configurazione:
     cols: numero di colonne (default 5)
     groups: { chiave: { label, fill, stroke, text } }   colori e voce di legenda
     boxes:  [{ id, col, row, title, sub, group, step }]  row 0, 1, 2 dall'alto; step = passaggio in cui compare
     arrows: [{ from, to, step, dashed, label }]          dashed: freccia di ritorno, passa sotto i riquadri
   I riquadri sono larghi 166 su 1000: titoli di 1-2 parole, sottotitoli entro 20 caratteri. */
(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const svg = (name, attrs, parent) => { const el = document.createElementNS(NS, name); for (const k in attrs) el.setAttribute(k, attrs[k]); if (parent) parent.appendChild(el); return el; };
const DEF_GROUPS = {
  ai: { label: 'intelligenza artificiale', fill: '#eeedfc', stroke: '#5a4fd1', text: '#3a2fa8' },
  tool: { label: 'strumento', fill: '#e3f4ed', stroke: '#0f8a65', text: '#0b6a4e' },
  out: { label: 'risultato', fill: '#fbede6', stroke: '#c4521f', text: '#8f3a14' },
  me: { label: 'tu', fill: '#f5f5f7', stroke: '#a1a1a6', text: '#1d1d1f' }
};

function draw(el, cfg) {
  el.innerHTML = '';
  const W = 1000, BW = 166, BH = 76, ROWH = 106, cols = cfg.cols || 5;
  const groups = Object.assign({}, DEF_GROUPS, cfg.groups || {});
  const colX = i => 2 + i * ((W - 4 - BW) / Math.max(1, cols - 1));
  const rowY = r => 12 + r * ROWH;
  const rows = Math.max(...cfg.boxes.map(b => b.row || 0)) + 1;
  const hasLoop = (cfg.arrows || []).some(a => a.dashed);
  const loopY = rowY(rows - 1) + BH + 26;
  const legendY = (hasLoop ? loopY + 44 : rowY(rows - 1) + BH + 34);
  el.setAttribute('viewBox', `0 0 ${W} ${legendY + 16}`);
  const defs = svg('defs', {}, el);
  [['fa', '#6e6e73'], ['fad', '#c4521f']].forEach(([id, col]) => {
    const m = svg('marker', { id: el.id + id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    svg('path', { d: 'M0 0L10 5L0 10z', fill: col }, m);
  });
  const B = {};
  cfg.boxes.forEach(b => {
    const g = groups[b.group] || groups.me, x = colX(b.col), y = rowY(b.row || 0);
    B[b.id] = { x, y, w: BW, h: BH };
    const gg = svg('g', b.step ? { 'data-step': b.step } : {}, el);
    svg('rect', { x, y, width: BW, height: BH, rx: 16, fill: g.fill, stroke: g.stroke, 'stroke-width': 1.6 }, gg);
    svg('text', { x: x + BW / 2, y: y + BH / 2 - (b.sub ? 2 : -7), 'text-anchor': 'middle', style: `font-size:21px;font-weight:700;fill:${g.text}` }, gg).textContent = b.title;
    if (b.sub) svg('text', { x: x + BW / 2, y: y + BH / 2 + 20, 'text-anchor': 'middle', style: `font-size:14px;fill:${g.stroke}` }, gg).textContent = b.sub;
  });
  (cfg.arrows || []).forEach(a => {
    const p = B[a.from], q = B[a.to]; if (!p || !q) return;
    let d;
    if (a.dashed) {
      const x1 = p.x + p.w / 2, x2 = q.x + q.w / 2;
      d = `M${x1} ${p.y + p.h + 2} L${x1} ${loopY} L${x2} ${loopY} L${x2} ${q.y + q.h + 6}`;
    } else if (p.x === q.x) {
      const x = p.x + p.w / 2, down = q.y > p.y;
      d = down ? `M${x} ${p.y + p.h + 4} L${x} ${q.y - 4}` : `M${x} ${p.y - 4} L${x} ${q.y + q.h + 4}`;
    } else if (p.y === q.y) {
      d = `M${p.x + p.w + 4} ${p.y + p.h / 2} L${q.x - 4} ${q.y + q.h / 2}`;
    } else {
      const bus = p.x + p.w + (q.x - p.x - p.w) / 2;
      d = `M${p.x + p.w + 2} ${p.y + p.h / 2} L${bus} ${p.y + p.h / 2} L${bus} ${q.y + q.h / 2} L${q.x - 4} ${q.y + q.h / 2}`;
    }
    const attrs = { d, fill: 'none', stroke: a.dashed ? '#c4521f' : '#6e6e73', 'stroke-width': 2, 'marker-end': `url(#${el.id}${a.dashed ? 'fad' : 'fa'})` };
    if (a.dashed) attrs['stroke-dasharray'] = '7 6';
    if (a.step) attrs['data-step'] = a.step;
    svg('path', attrs, el);
    if (a.label && a.dashed) {
      const t = svg('text', { x: (p.x + p.w / 2 + q.x + q.w / 2) / 2, y: loopY + 22, 'text-anchor': 'middle', style: 'font-size:16px;font-weight:600;fill:#c4521f' }, el);
      if (a.step) t.setAttribute('data-step', a.step);
      t.textContent = a.label;
    }
  });
  // legenda: solo i gruppi usati, centrata
  const used = [...new Set(cfg.boxes.map(b => b.group))].filter(k => groups[k] && k !== 'me');
  const widths = used.map(k => 30 + groups[k].label.length * 8.2 + 40);
  let x = (W - widths.reduce((s, v) => s + v, 0)) / 2;
  used.forEach((k, i) => {
    const g = groups[k];
    svg('rect', { x, y: legendY - 13, width: 20, height: 20, rx: 5, fill: g.fill, stroke: g.stroke, 'stroke-width': 1.6 }, el);
    svg('text', { x: x + 30, y: legendY + 3, style: 'font-size:15px;fill:#6e6e73' }, el).textContent = g.label;
    x += widths[i];
  });
}

(window.DECK_MODULES = window.DECK_MODULES || []).push({
  init() {
    document.querySelectorAll('script[data-flow-for]').forEach(s => {
      const el = document.getElementById(s.dataset.flowFor);
      if (el) draw(el, JSON.parse(s.textContent));
    });
  }
});
})();
