'use strict';
/* ============================================================
   scripts/essaiReferentielRome/fichierUnique.js
   Génère UN SEUL fichier à ouvrir dans le navigateur, qui regroupe les 6 messages du banc d'essai
   (un bouton « Copier ce message » par message) et 6 cases pour y coller les réponses des
   assistants, avec un bouton qui copie toutes les réponses déjà étiquetées « p1 A », « p1 B »...

   Usage : node scripts/essaiReferentielRome/fichierUnique.js
   Sortie : docs/essais_referentiel_rome/ESSAI_6_MESSAGES.html
   Les messages sont lus tels quels dans les fichiers *_A_actuel.txt et *_B_rome.txt : si le banc est
   régénéré (essai.js), relancer ce script.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, '..', '..', 'docs', 'essais_referentiel_rome');

const MESSAGES = [
  { etiquette: 'p1 A', personnage: 'Employé libre-service', version: 'A, message actuel', fichier: 'p1_libre_service_A_actuel.txt' },
  { etiquette: 'p1 B', personnage: 'Employé libre-service', version: 'B, avec le ROME', fichier: 'p1_libre_service_B_rome.txt' },
  { etiquette: 'p2 A', personnage: 'Conducteur de ligne de conditionnement', version: 'A, message actuel', fichier: 'p2_conducteur_ligne_A_actuel.txt' },
  { etiquette: 'p2 B', personnage: 'Conducteur de ligne de conditionnement', version: 'B, avec le ROME', fichier: 'p2_conducteur_ligne_B_rome.txt' },
  { etiquette: 'p3 A', personnage: 'Ancien serveur qui vise plâtrier', version: 'A, message actuel', fichier: 'p3_serveur_vers_platrier_A_actuel.txt' },
  { etiquette: 'p3 B', personnage: 'Ancien serveur qui vise plâtrier', version: 'B, avec le ROME', fichier: 'p3_serveur_vers_platrier_B_rome.txt' }
];

function echapper(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const blocs = MESSAGES.map((m, i) => {
  const texte = fs.readFileSync(path.join(DOSSIER, m.fichier), 'utf8');
  return `
<section class="essai" id="essai${i}">
  <h2>Message ${i + 1} sur 6 : « ${m.etiquette} »</h2>
  <p class="sous-titre">${echapper(m.personnage)} · ${echapper(m.version)} · ${Math.round(texte.length / 1000)} 000 caractères environ</p>
  <ol class="etapes">
    <li>Ouvre <strong>une conversation neuve</strong> chez l'assistant.</li>
    <li><button type="button" class="bouton-principal" data-copier="msg${i}">Copier ce message</button> <span class="retour" id="retour-msg${i}" role="status"></span></li>
    <li>Colle (Ctrl+V) dans la conversation, envoie, attends la réponse complète.</li>
    <li>Copie la réponse de l'assistant et colle-la dans la case ci-dessous.</li>
  </ol>
  <details>
    <summary>Voir le message (pour vérifier, pas obligatoire)</summary>
    <textarea id="msg${i}" class="message" readonly rows="10">${echapper(texte)}</textarea>
  </details>
  <label for="rep${i}"><strong>Réponse de l'assistant pour « ${m.etiquette} »</strong> (si elle s'est arrêtée en plein milieu, écris « coupée » au début)</label>
  <textarea id="rep${i}" class="reponse" rows="6" placeholder="Colle ici la réponse complète."></textarea>
</section>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Essai : 6 messages à envoyer à l'assistant</title>
<style>
  :root { --fond: #fbfaf7; --texte: #222; --discret: #5a5a5a; --carte: #ffffff; --bord: #cfcac0; --accent: #1f5f8b; --accent-texte: #ffffff; --ok: #1d6b3a; }
  [data-theme="sombre"] { --fond: #1c1d1f; --texte: #eee; --discret: #b4b4b4; --carte: #26282b; --bord: #4a4d52; --accent: #7fb6dd; --accent-texte: #10202c; --ok: #7fd09a; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="clair"]) { --fond: #1c1d1f; --texte: #eee; --discret: #b4b4b4; --carte: #26282b; --bord: #4a4d52; --accent: #7fb6dd; --accent-texte: #10202c; --ok: #7fd09a; } }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; background: var(--fond); color: var(--texte); font: 17px/1.5 system-ui, "Segoe UI", sans-serif; }
  main { max-width: 860px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 8px; }
  h2 { font-size: 1.2rem; margin: 0 0 4px; }
  .sous-titre { margin: 0 0 12px; color: var(--discret); }
  .intro, .essai { background: var(--carte); border: 1px solid var(--bord); border-radius: 6px; padding: 16px; margin: 0 0 16px; }
  .etapes { padding-left: 22px; margin: 0 0 12px; }
  .etapes li { margin: 6px 0; }
  button { font: inherit; padding: 10px 16px; border-radius: 4px; border: 1px solid var(--accent); background: transparent; color: var(--accent); cursor: pointer; }
  .bouton-principal { background: var(--accent); color: var(--accent-texte); font-weight: 600; }
  button:focus-visible, textarea:focus-visible, summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
  .retour { color: var(--ok); font-weight: 600; margin-left: 8px; }
  textarea { width: 100%; font: 14px/1.4 Consolas, monospace; background: var(--fond); color: var(--texte); border: 1px solid var(--bord); border-radius: 4px; padding: 8px; }
  textarea.reponse { margin-top: 6px; }
  details { margin: 0 0 12px; }
  summary { cursor: pointer; color: var(--accent); }
  .final { position: sticky; bottom: 0; background: var(--carte); border: 1px solid var(--bord); border-radius: 6px; padding: 12px 16px; margin-top: 16px; }
  .final p { margin: 0 0 8px; }
</style>
</head>
<body>
<main>
  <h1>Essai : 6 messages à envoyer à l'assistant</h1>
  <div class="intro">
    <p>Cette page regroupe les 6 messages de l'essai. Les personnages sont entièrement fictifs. Pour chaque message, tu fais la même chose : une <strong>conversation neuve</strong> chez l'assistant (ChatGPT sans compte, de préférence), tu colles le message, tu attends la réponse, tu la colles dans la case de cette page.</p>
    <p>Tu peux faire les messages en plusieurs fois : ce que tu colles dans les cases est gardé dans ce navigateur sur cet ordinateur. À la fin, le bouton tout en bas copie toutes les réponses déjà étiquetées, et tu les colles en une seule fois dans la discussion avec Claude.</p>
  </div>
${blocs}
  <div class="final">
    <p><button type="button" class="bouton-principal" id="copierToutes">Copier toutes les réponses</button> <span class="retour" id="retour-toutes" role="status"></span></p>
    <p class="sous-titre">Les cases vides sont signalées « pas encore faite ». Tu peux aussi en copier une partie seulement et compléter plus tard.</p>
  </div>
</main>
<script>
(function () {
  var ETIQUETTES = ${JSON.stringify(MESSAGES.map(function (m) { return m.etiquette; }))};
  var CLE = 'essaiRome_reponses_2026-11-08';

  function lireMemoire() {
    try { return JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { return {}; }
  }
  function ecrireMemoire(obj) {
    try { localStorage.setItem(CLE, JSON.stringify(obj)); } catch (e) { /* la page marche sans mémoire */ }
  }

  function copier(texte, zoneRetour, secours) {
    function ok() { zoneRetour.textContent = 'Copié.'; setTimeout(function () { zoneRetour.textContent = ''; }, 3000); }
    function echec() {
      zoneRetour.textContent = 'La copie automatique n\\'a pas marché : ouvre « Voir le message », clique dans la case, Ctrl+A puis Ctrl+C.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok, function () { secours() ? ok() : echec(); });
    } else {
      secours() ? ok() : echec();
    }
  }

  function copierViaZone(zone) {
    return function () {
      try { zone.removeAttribute('readonly'); zone.select(); var r = document.execCommand('copy'); zone.setAttribute('readonly', ''); return r; }
      catch (e) { return false; }
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-copier]'), function (b) {
    b.addEventListener('click', function () {
      var zone = document.getElementById(b.getAttribute('data-copier'));
      var retour = document.getElementById('retour-' + b.getAttribute('data-copier'));
      var details = zone.closest('details');
      if (details) { details.open = true; }
      copier(zone.value, retour, copierViaZone(zone));
    });
  });

  var memoire = lireMemoire();
  ETIQUETTES.forEach(function (etiquette, i) {
    var zone = document.getElementById('rep' + i);
    if (memoire[etiquette]) { zone.value = memoire[etiquette]; }
    zone.addEventListener('input', function () {
      var m = lireMemoire(); m[etiquette] = zone.value; ecrireMemoire(m);
    });
  });

  document.getElementById('copierToutes').addEventListener('click', function () {
    var parties = ETIQUETTES.map(function (etiquette, i) {
      var v = document.getElementById('rep' + i).value.trim();
      return '===== ' + etiquette + ' =====\\n' + (v || '(pas encore faite)');
    });
    var texte = parties.join('\\n\\n');
    var retour = document.getElementById('retour-toutes');
    var tampon = document.createElement('textarea');
    tampon.value = texte; tampon.style.position = 'fixed'; tampon.style.opacity = '0';
    document.body.appendChild(tampon);
    copier(texte, retour, function () { try { tampon.select(); return document.execCommand('copy'); } catch (e) { return false; } });
    setTimeout(function () { document.body.removeChild(tampon); }, 500);
  });
})();
</script>
</body>
</html>
`;

const sortie = path.join(DOSSIER, 'ESSAI_6_MESSAGES.html');
fs.writeFileSync(sortie, html, 'utf8');
console.log('Écrit : ' + sortie + ' (' + Math.round(html.length / 1000) + ' Ko)');
