/* Modulo: conto delle ore. Un cursore (ore a settimana) aggiorna ore all'anno, giornate e settimane di lavoro.
   In index.html: <div data-conto> con <input type="range"> e elementi [data-out="h|anno|gg|sett"]. */
(() => {
'use strict';
const SETTIMANE = 46, ORE_GIORNO = 8, ORE_SETTIMANA = 40;
function init() {
  document.querySelectorAll('[data-conto]').forEach(box => {
    const r = box.querySelector('input');
    const out = k => box.querySelector(`[data-out="${k}"]`);
    const upd = () => {
      const h = +r.value, anno = h * SETTIMANE;
      out('h').textContent = h;
      out('anno').textContent = anno.toLocaleString('it-IT');
      out('gg').textContent = Math.round(anno / ORE_GIORNO);
      out('sett').textContent = (anno / ORE_SETTIMANA).toLocaleString('it-IT', { maximumFractionDigits: 1 });
    };
    r.addEventListener('input', upd);
    upd();
  });
}
(window.DECK_MODULES = window.DECK_MODULES || []).push({ init });
})();
