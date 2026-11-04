# Productivity deck: istruzioni per gli agenti

## Obiettivo e confini

- Deck web statico, senza build e senza dipendenze, che funziona anche offline. Creato e mantenuto con la Skill `slide-workshop-ai`.
- È una risorsa del progetto `workshop-ai-per-architette`, con il proprio repository Git e la propria pubblicazione (GitHub Pages, ramo `main`, indirizzo previsto `jonathanlivingston86.github.io/productivity-workshop/`).
- Sostituisce il vecchio mini-sito `prompt-productivity` (giugno 2026), che va spento solo con l'ok esplicito di Andrea.
- Leggi `docs/STATUS.md` per lo stato.

## Regole di scrittura

- Segui `references/02-scrittura.md` della Skill `slide-workshop-ai`: frasi corte, del tu, niente trattino lungo, fatto più caso più azione, dettagli nel blocco `.extra`.
- Strumenti presentati come esempi di categoria, mai sponsorizzati. Piani, prezzi e disponibilità vanno nella dispensa con l'invito a controllare la pagina ufficiale.

## Mappa

- `index.html`: slide. `data-po` = solo presentatore; `data-steps` e `data-step` = passaggi.
- `deck.js`: motore (non modificare). `moduli/flusso.js`: flussi. `moduli/conto.js`: conto delle ore. `moduli/gara.js`: gara tastiera contro voce.
- `style.css`: stile comune; gli stili su misura sono in fondo.
- `assets/loghi/`: loghi SVG dei prodotti citati (Simple Icons CC0, Wispr Flow dal sito ufficiale).
- `esempi/`: zip delle due cartelle di prova scaricabili dalla slide dei file, con `FONTI.md`.
- `kit-presentatore/`: scaletta con tempi, controlli prima dell'aula e cartelle di prova scompattate per la demo, escluso da Git.
- Fondi: nero = slide filtro e soglie, bianco = spiegazione, grigio = prompt e pratica.

## Cose da non fare

- Non creare repository, fare push o modificare il sito live senza l'ok esplicito di Andrea.
- Non inserire dati personali, credenziali, percorsi locali o materiali senza diritto di pubblicazione: il repository è pubblico.
- Esempi nei prompt solo inventati: nessun dato reale di clienti o corsisti.

## Verifiche minime

Segui `references/04-verifica.md` della Skill: sintassi, nessun trattino lungo, controllo impaginazione a tre risoluzioni, dispensa, telefono, PDF.
