/* Modulo: gara tra tastiera e voce. Ogni [data-crono] ha un display .tempo e un pulsante .via (Via / Stop / Azzera).
   Se la slide ha un campo [data-prova], Via lo svuota e ci mette il cursore.
   Alla fine mostra quante volte la voce è stata più veloce in [data-esito]. */
(() => {
'use strict';
const fmt = ms => (ms / 1000).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' s';
function init() {
  document.querySelectorAll('[data-gara]').forEach(gara => {
    const esito = (gara.closest('.slide') || document).querySelector('[data-esito]');
    const prova = (gara.closest('.slide') || document).querySelector('[data-prova]');
    const tempi = {};
    const aggiornaEsito = () => {
      if (!esito) return;
      const { tastiera, voce } = tempi;
      if (!tastiera || !voce) esito.textContent = '';
      else if (voce >= tastiera) esito.textContent = 'Questa volta ha vinto la tastiera.';
      else esito.textContent = `La voce è stata ${(tastiera / voce).toLocaleString('it-IT', { maximumFractionDigits: 1 })} volte più veloce.`;
    };
    gara.querySelectorAll('[data-crono]').forEach(c => {
      const nome = c.dataset.crono, disp = c.querySelector('.tempo'), btn = c.querySelector('.via');
      let t0 = 0, timer = null, stato = 'pronto';
      btn.addEventListener('click', () => {
        if (stato === 'pronto') {
          if (prova) { prova.value = ''; prova.focus(); }
          t0 = performance.now(); stato = 'corre'; btn.textContent = 'Stop'; c.classList.add('corre');
          timer = setInterval(() => { disp.textContent = fmt(performance.now() - t0); }, 100);
        } else if (stato === 'corre') {
          clearInterval(timer); const ms = performance.now() - t0; disp.textContent = fmt(ms);
          tempi[nome] = ms; stato = 'fermo'; btn.textContent = 'Azzera'; c.classList.remove('corre'); aggiornaEsito();
        } else {
          disp.textContent = fmt(0); delete tempi[nome]; stato = 'pronto'; btn.textContent = 'Via'; aggiornaEsito();
        }
      });
    });
  });
}
(window.DECK_MODULES = window.DECK_MODULES || []).push({ init });
})();
