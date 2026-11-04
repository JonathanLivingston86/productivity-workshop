/* Slide workshop AI: motore del deck. Nessuna dipendenza esterna, funziona anche da file://.
   I moduli opzionali (moduli/*.js) si caricano PRIMA di questo file e si registrano in window.DECK_MODULES:
   { init(), enter(slide), step(slide, n), handout(), key(event, slide) -> true se gestito } */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const mods = window.DECK_MODULES || [];
const each = (fn, ...a) => mods.forEach(m => { if (m[fn]) m[fn](...a); });

/* ================= MOTORE ================= */
let slides = [], cur = 0, step = 0, mode = 'presenter';
const maxStep = s => +(s.dataset.steps || 0);

function applySteps(slide, n) {
  $$('[data-step]', slide).forEach(e => e.classList.toggle('on', +e.dataset.step <= n));
  $$('[data-until]', slide).forEach(e => e.classList.toggle('off', n >= +e.dataset.until));
  // didascalia che cambia a ogni passaggio: <p class="stepcap"><span>passo 0</span><span>passo 1</span>...</p>
  $$('.stepcap', slide).forEach(c => { const sp = $$(':scope > span', c); sp.forEach((x, i) => x.classList.toggle('on', i === Math.min(n, sp.length - 1))); });
  each('step', slide, n);
}

function visibleSlides() { return slides.filter(s => !(mode === 'handout' && s.hasAttribute('data-po'))); }

function show(i, st = 0) {
  const list = visibleSlides();
  cur = Math.max(0, Math.min(list.length - 1, i));
  const s = list[cur];
  slides.forEach(x => x.classList.remove('active'));
  s.classList.add('active');
  step = Math.max(0, Math.min(maxStep(s), st));
  applySteps(s, step);
  $('#progress').style.width = ((cur + 1) / list.length * 100) + '%';
  if (mode === 'presenter') history.replaceState(null, '', '#' + (cur + 1));
  each('enter', s);
}

function next() {
  if (mode !== 'presenter') return;
  const s = visibleSlides()[cur];
  if (step < maxStep(s)) { step++; applySteps(s, step); return; }
  show(cur + 1);
}
function prev() {
  if (mode !== 'presenter') return;
  const s = visibleSlides()[cur];
  if (step > 0) { step--; applySteps(s, step); return; }
  if (cur > 0) { const p = visibleSlides()[cur - 1]; show(cur - 1, maxStep(p)); }
}

function setMode(m) {
  mode = m;
  body.classList.toggle('presenter', m === 'presenter');
  body.classList.toggle('handout', m === 'handout');
  $('#bMode').textContent = m === 'presenter' ? 'Dispensa' : 'Presenta';
  $('#bFs').style.display = m === 'presenter' ? '' : 'none';
  $('#bIndex').style.display = m === 'presenter' ? '' : 'none';
  $('#bPrint').style.display = m === 'handout' ? '' : 'none';
  if (m === 'handout') {
    slides.forEach(s => { s.classList.remove('active'); applySteps(s, maxStep(s)); });
    history.replaceState(null, '', '#dispensa');
    each('handout');
  } else {
    show(Math.min(cur, visibleSlides().length - 1));
  }
}

function buildIndex() {
  const ol = $('#overlayList'); ol.innerHTML = '';
  visibleSlides().forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<small>${i + 1}</small>`;
    b.appendChild(document.createTextNode(s.dataset.title || 'Slide'));
    b.onclick = () => { $('#overlay').classList.remove('open'); show(i); };
    li.appendChild(b); ol.appendChild(li);
  });
}

/* ================= COPIA PROMPT ================= */
async function copyText(btn, text) {
  let ok = false;
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch (_) {}
  if (!ok) {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select(); try { ok = document.execCommand('copy'); } catch (_) {} ta.remove();
  }
  if (!ok) window.prompt('Copia il testo:', text);
  btn.textContent = ok ? 'Copiato' : 'Copia a mano'; btn.classList.toggle('done', ok);
  setTimeout(() => { btn.textContent = 'Copia'; btn.classList.remove('done'); }, 1400);
}

/* ================= PRIMA E DOPO ================= */
function initCompare() {
  $$('.cmp').forEach(box => {
    let drag = false;
    const move = e => { const r = box.getBoundingClientRect(); let p = ((e.clientX - r.left) / r.width) * 100; p = Math.max(2, Math.min(98, p)); $('.top', box).style.clipPath = `inset(0 0 0 ${p}%)`; $('.bar', box).style.left = p + '%'; };
    box.addEventListener('pointerdown', e => { drag = true; box.setPointerCapture(e.pointerId); move(e); });
    box.addEventListener('pointermove', e => { if (drag) move(e); });
    box.addEventListener('pointerup', () => { drag = false; });
  });
}

/* ================= SCHEDE (tab con pannelli) =================
   <div class="tabs" data-tabs="nome"><button class="tab">A</button>...</div> e pannelli <div data-tabpanel="nome">...</div> nello stesso ordine */
function initTabs() {
  $$('[data-tabs]').forEach(t => {
    const name = t.dataset.tabs, btns = $$('.tab', t), panels = $$(`[data-tabpanel="${name}"]`);
    const pick = i => { btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i)); panels.forEach((p, k) => { p.hidden = k !== i; }); };
    btns.forEach((b, i) => { b.onclick = () => pick(i); });
    pick(0);
  });
}

/* ================= AVVIO ================= */
function init() {
  each('init');
  slides = $$('#deck > .slide');
  initCompare(); initTabs();
  document.addEventListener('click', e => {
    const b = e.target.closest('.copy'); if (!b) return;
    const src = b.dataset.copyFrom ? document.getElementById(b.dataset.copyFrom) : $('pre', b.parentElement);
    copyText(b, src.textContent);
  });
  $('#bMode').onclick = () => setMode(mode === 'presenter' ? 'handout' : 'presenter');
  $('#bIndex').onclick = () => { buildIndex(); $('#overlay').classList.add('open'); };
  $('#overlay').onclick = e => { if (e.target.id === 'overlay') $('#overlay').classList.remove('open'); };
  $('#bFs').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); };
  $('#bPrint').onclick = () => window.print();
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea')) return;
    if ($('#overlay').classList.contains('open')) { if (e.key === 'Escape' || e.key.toLowerCase() === 'g') $('#overlay').classList.remove('open'); return; }
    const k = e.key;
    if (mode === 'presenter') {
      const s = visibleSlides()[cur];
      if (mods.some(m => m.key && m.key(e, s))) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
      else if (k === 'Home') show(0);
      else if (k === 'End') show(visibleSlides().length - 1);
    }
    if (k.toLowerCase() === 'g' && mode === 'presenter') { buildIndex(); $('#overlay').classList.add('open'); }
    if (k.toLowerCase() === 'h') setMode(mode === 'presenter' ? 'handout' : 'presenter');
    if (k.toLowerCase() === 'f' && mode === 'presenter') $('#bFs').click();
  });
  let sx = 0, sy = 0;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => { if (mode !== 'presenter') return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)(); }, { passive: true });
  document.addEventListener('click', e => {
    if (mode !== 'presenter' || e.target.closest('button,a,input,.cmp,.ui,.overlay,canvas,.tab,.chip,.copy,.prompt,[data-interactive]')) return;
    const x = e.clientX / window.innerWidth; if (x > .5) next(); else if (x < .2) prev();
  });
  window.addEventListener('hashchange', () => {
    const v = location.hash.replace('#', '');
    if (v === 'dispensa') { if (mode !== 'handout') setMode('handout'); }
    else if (/^\d+$/.test(v)) { if (mode !== 'presenter') setMode('presenter'); if (+v - 1 !== cur) show(+v - 1); }
  });
  let hideT; document.addEventListener('mousemove', () => { body.classList.add('ui-on'); clearTimeout(hideT); hideT = setTimeout(() => body.classList.remove('ui-on'), 2200); });
  // usato dallo script di controllo dell'impaginazione
  window.__deck = { show, list: () => visibleSlides(), maxStep, setMode, mode: () => mode };
  const h = location.hash.replace('#', '');
  const small = window.innerWidth < 900;
  if (h === 'dispensa' || (small && !/^\d+$/.test(h))) setMode('handout');
  else { setMode('presenter'); const n = parseInt(h, 10); show(isNaN(n) ? 0 : n - 1); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
