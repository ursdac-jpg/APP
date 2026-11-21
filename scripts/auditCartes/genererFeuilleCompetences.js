'use strict';
/* ============================================================
   scripts/auditCartes/genererFeuilleCompetences.js
   Génère la FEUILLE DES COMPÉTENCES (consigne 509, 21/11/2026) : docs/bancEssai/feuille_competences.html
   Une trentaine de métiers ; pour chacun, les trois compétences que la règle montrerait sur la carte (cœur de métier du ROME d'abord, puis activités
   pondérées par la rareté), les compétences suivantes du ROME pour comparer, et les trois conditions de travail les plus rares.
   Denis note chaque métier : « Bon » (les trois montrent le métier), « Acceptable », « À revoir » (une compétence trompe sur le métier), avec un commentaire possible.
   Lancer depuis la racine du dépôt : node scripts/auditCartes/genererFeuilleCompetences.js
   Lecture seule sur les données ; n'écrit que la feuille.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { competences, conditions, M } = require('./choixCompetences.js');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Métiers déjà examinés à la main (les cas qui avaient montré les défauts de la règle), puis un métier par secteur non couvert, tiré avec une graine fixe.
const FIXES = ['Maçon', 'Agent d\'accueil', 'Boulanger', 'Aide-soignant', 'Développeur informatique', 'Cuisinier', 'Électricien',
  'Agent de propreté de locaux', 'Chauffeur-livreur préparateur de commandes', 'Éducateur spécialisé', 'Mécanicien automobile'];
function graine(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const alea = graine(509);
const utilisables = M.baseMetiers.filter((m) => competences(m.rome).length >= 3);
const choisis = [];
FIXES.forEach((n) => { const f = utilisables.find((m) => m.nom === n); if (f) { choisis.push(f); } else { console.log('métier fixe introuvable ou sans 3 compétences : ' + n); } });
const secteurs = Array.from(new Set(utilisables.map((m) => m.secteur)));
const couverts = new Set(choisis.map((m) => m.secteur));
const aTirer = secteurs.filter((s) => !couverts.has(s));
aTirer.forEach((s) => {
  const liste = utilisables.filter((m) => m.secteur === s && choisis.indexOf(m) === -1);
  choisis.push(liste[Math.floor(alea() * liste.length)]);
});
// Complément jusqu'à 30 avec des métiers au hasard dans les gros secteurs.
const lourds = ['Industrie, production et énergie', 'Administration, gestion et bureau', 'Commerce et vente', 'Bâtiment et travaux publics', 'Communication, culture et événementiel'];
let t = 0;
while (choisis.length < 30 && t < 500) {
  t++;
  const liste = utilisables.filter((m) => m.secteur === lourds[choisis.length % lourds.length] && choisis.indexOf(m) === -1);
  choisis.push(liste[Math.floor(alea() * liste.length)]);
}

let corps = '';
const donnees = choisis.map((m, k) => {
  const id = 'M' + String(k + 1).padStart(2, '0');
  const toutes = competences(m.rome), cond = conditions(m.rome).slice(0, 3);
  corps += '<section class="profil" data-id="' + id + '" data-cle="' + esc(id + '|' + m.nom) + '"><h3>' + esc(id + ' · ' + m.nom) + ' <span class="nb">' + esc(m.secteur) + ' · code ROME ' + esc(m.rome) + '</span></h3>' +
    '<p class="lab">Les trois compétences que la carte montrerait :</p><ul class="trois">' + toutes.slice(0, 3).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    '<p class="lab">Pour comparer, les suivantes dans la fiche du ROME (' + Math.max(0, toutes.length - 3) + ' en tout) :</p><ul class="autres">' + toutes.slice(3, 9).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    '<p class="lab">À savoir sur ce métier (les trois conditions de travail les plus rares) :</p><p class="cond">' + (cond.length ? cond.map((x) => esc(x.lib)).join(' · ') : 'aucune condition particulière') + '</p>' +
    '<div class="notes" role="group" aria-label="Votre avis sur ' + esc(m.nom) + '"><button type="button" data-n="B">Bon</button><button type="button" data-n="A">Acceptable</button><button type="button" data-n="R">À revoir</button></div>' +
    '<label class="manque">Un commentaire (facultatif), par exemple la compétence qui trompe ou celle qui manque : <input type="text" data-comm="' + id + '" autocomplete="off"></label></section>';
  return { id, nom: m.nom, secteur: m.secteur, rome: m.rome, trois: toutes.slice(0, 3), conditions: cond.map((x) => x.lib) };
});

const date = new Date().toISOString().slice(0, 10);
const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Feuille des compétences</title>
<style>
:root { --fond:#f6f7f9; --carte:#ffffff; --texte:#1c2330; --doux:#566074; --trait:#d5dae3; --accent:#1f5fbf; --bon:#1f7a3d; --moyen:#8a6100; --mauvais:#a52a2a; --bonfond:#e3f3e8; --moyenfond:#fff3d6; --mauvaisfond:#fbe3e3; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fond:#12151b; --carte:#1b2029; --texte:#e8ebf1; --doux:#a3adbf; --trait:#343c4b; --accent:#7fb0ff; --bon:#7fd69a; --moyen:#f0c46a; --mauvais:#f19a9a; --bonfond:#173323; --moyenfond:#3a3016; --mauvaisfond:#3b1c1c; } }
body { margin:0; background:var(--fond); color:var(--texte); font:16px/1.5 system-ui, sans-serif; }
main { max-width:860px; margin:0 auto; padding:16px; }
h1 { font-size:1.4rem; } h3 { font-size:1.05rem; margin:.2rem 0; }
.intro, .profil, .barre { background:var(--carte); border:1px solid var(--trait); border-radius:10px; padding:12px 14px; margin:12px 0; }
.nb { color:var(--doux); font-size:.875rem; font-weight:400; }
.lab { margin:.6rem 0 .1rem; color:var(--doux); font-size:.9rem; }
ul { margin:.1rem 0; padding-left:1.2rem; } .trois li { font-weight:700; } .autres li { color:var(--doux); } .cond { margin:.1rem 0; }
.notes { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
button { font:inherit; min-height:44px; padding:0 14px; border:2px solid var(--trait); border-radius:6px; background:var(--carte); color:var(--texte); cursor:pointer; }
.notes button[aria-pressed="true"][data-n="B"] { background:var(--bonfond); border-color:var(--bon); color:var(--bon); font-weight:700; }
.notes button[aria-pressed="true"][data-n="A"] { background:var(--moyenfond); border-color:var(--moyen); color:var(--moyen); font-weight:700; }
.notes button[aria-pressed="true"][data-n="R"] { background:var(--mauvaisfond); border-color:var(--mauvais); color:var(--mauvais); font-weight:700; }
.manque { display:block; margin-top:8px; color:var(--doux); } .manque input { width:100%; box-sizing:border-box; min-height:44px; font:inherit; padding:0 8px; margin-top:4px; background:var(--fond); color:var(--texte); border:1px solid var(--trait); border-radius:6px; }
.barre { position:sticky; bottom:8px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
.barre button.principal { background:var(--accent); color:#fff; border-color:var(--accent); font-weight:700; }
#etat { color:var(--doux); }
</style></head><body><main>
<h1>Feuille des compétences : la carte montre-t-elle bien le métier ?</h1>
<div class="intro">
<p><b>À quoi ça sert.</b> Sur les cartes de métiers, nous voulons montrer trois compétences d'un coup d'œil. Une règle choisit lesquelles dans la fiche du ROME. Cette feuille la met à l'épreuve sur ${donnees.length} métiers, pour savoir si elle montre bien ce que fait le métier.</p>
<p><b>Comment faire.</b> Pour chaque métier, lisez les trois compétences en gras. Cliquez sur <b>Bon</b> (les trois montrent bien le métier), <b>Acceptable</b> (cela passe, mais une compétence est secondaire) ou <b>À revoir</b> (une compétence trompe sur le métier ou n'a rien à y faire). Les compétences en gris, en dessous, sont les suivantes de la fiche : elles vous aident à voir si la règle a oublié mieux. Vous pouvez laisser un métier sans réponse.</p>
<p><b>Quand vous avez fini</b>, cliquez sur « Copier mes notes » (en bas), puis collez le texte dans la conversation avec Claude. Vos réponses restent dans cette page tant que vous ne la fermez pas, mais ne sont enregistrées nulle part ailleurs.</p>
<p class="nb">Feuille générée le ${date} à partir des fiches du ROME. ${donnees.length} métiers à noter.</p>
</div>
${corps}
<div class="barre"><span id="etat" role="status">0 métier noté</span><button type="button" class="principal" id="copier">Copier mes notes</button></div>
</main>
<script>
(function () {
  var CLE = 'feuilleCompetences_${date}';
  var notes = {}, comm = {};
  try { var s = JSON.parse(localStorage.getItem(CLE) || '{}'); notes = s.notes || {}; comm = s.comm || {}; } catch (e) {}
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify({ notes: notes, comm: comm })); } catch (e) {} }
  function majEtat() {
    var n = Object.keys(notes).length, tot = document.querySelectorAll('.profil').length;
    document.getElementById('etat').textContent = n + ' métier' + (n > 1 ? 's' : '') + ' noté' + (n > 1 ? 's' : '') + ' sur ' + tot;
  }
  document.querySelectorAll('.profil').forEach(function (el) {
    var cle = el.getAttribute('data-cle');
    el.querySelectorAll('.notes button').forEach(function (b) {
      b.setAttribute('aria-pressed', notes[cle] === b.getAttribute('data-n') ? 'true' : 'false');
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-n');
        if (notes[cle] === v) { delete notes[cle]; } else { notes[cle] = v; }
        el.querySelectorAll('.notes button').forEach(function (x) { x.setAttribute('aria-pressed', notes[cle] === x.getAttribute('data-n') ? 'true' : 'false'); });
        sauver(); majEtat();
      });
    });
    var inp = el.querySelector('[data-comm]');
    inp.value = comm[cle] || '';
    inp.addEventListener('input', function () { if (inp.value.trim()) { comm[cle] = inp.value.trim(); } else { delete comm[cle]; } sauver(); });
  });
  document.getElementById('copier').addEventListener('click', function () {
    var lignes = ['NOTES COMPÉTENCES (${date})'];
    document.querySelectorAll('.profil').forEach(function (el) {
      var cle = el.getAttribute('data-cle');
      if (notes[cle]) { lignes.push(cle + '|' + notes[cle]); }
      if (comm[cle]) { lignes.push(cle + '|COMMENTAIRE|' + comm[cle]); }
    });
    var texte = lignes.join('\\n');
    function fait(ok) { document.getElementById('etat').textContent = ok ? 'Notes copiées : collez-les dans la conversation.' : 'La copie a échoué : sélectionnez le texte ci-dessous.'; if (!ok) { var t = document.createElement('textarea'); t.value = texte; t.style.width = '100%'; t.rows = 12; document.querySelector('.barre').after(t); t.select(); } }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(function () { fait(true); }, function () { fait(false); }); } else { fait(false); }
  });
  majEtat();
})();
</script></body></html>
`;
const dossier = path.join(__dirname, '..', '..', 'docs', 'bancEssai');
fs.mkdirSync(dossier, { recursive: true });
fs.writeFileSync(path.join(dossier, 'feuille_competences.html'), html, 'utf8');
fs.writeFileSync(path.join(dossier, 'feuille_competences_metiers.json'), JSON.stringify(donnees, null, 1), 'utf8');
console.log('Feuille des compétences : ' + donnees.length + ' métiers. docs/bancEssai/feuille_competences.html');
