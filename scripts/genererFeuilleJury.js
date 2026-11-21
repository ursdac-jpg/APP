'use strict';
/* ============================================================
   scripts/genererFeuilleJury.js
   Génère la FEUILLE DU JURY du moteur de « Explorer les métiers » (consigne 491, 19/11/2026) : docs/bancEssai/feuille_jury.html
   Une page à cocher, avec les 5 premiers métiers proposés pour chaque profil type des trois chemins ; chaque métier est noté
   « Pertinent », « Acceptable » ou « Absurde », et un champ permet d'écrire le métier évident qui manque.
   Lancer : node scripts/genererFeuilleJury.js
   Les notes se retrouvent par le nom du métier : après une correction du moteur, on régénère la feuille et seuls les métiers nouveaux sont à noter.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const B = require('./bancEssaiMoteur.js');
const L = require('../modules/comprendre-les-metiers/logique.js');
const C = require('../modules/comprendre-les-metiers/parMetierCalcul.js');
const { pmdDonnees } = require('../modules/comprendre-les-metiers/parMetierDonnees.js');

const NOMS_LETTRES = { R: 'Réaliste', I: 'Investigateur', A: 'Artistique', S: 'Social', E: 'Entreprenant', C: 'Conventionnel' };
const libelles = {};
B.tousLesChoix().forEach((c) => { libelles[c.cle + ':' + c.id] = c.label; });
const lib = (cle, id) => libelles[cle + ':' + id] || id;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const profils = [];

// Chemin 2 : les profils types puis les profils difficiles retenus pour le jury.
const retenusDifficiles = ['Contradictoire : bureau et extérieur, programmer et soigner', 'Contradictoire : animaux, bureau, usine', 'Très général : bureau seul'];
B.PERSONAS.concat(B.DIFFICILES.filter((d) => retenusDifficiles.indexOf(d.titre) !== -1)).forEach((p) => {
  const res = L.cmlEntree2Metiers(p.choix, 5000);
  const dits = [];
  ['activites', 'actions', 'environnement'].forEach((k) => (p.choix[k] || []).forEach((id) => dits.push(lib(k, id))));
  profils.push({
    chemin: 'Chemin 2 : ce que vous aimez faire', titre: p.titre,
    description: 'La personne choisit : ' + dits.join(' ; ') + '.',
    nb: res.length,
    metiers: res.slice(0, 5).map((m) => ({ nom: m.nom, secteur: m.secteur, detail: m.score + ' % de ressemblance, ' + m.choixRetrouves + ' de ses ' + m.choixTotal + ' choix retrouvés' }))
  });
});

// Chemin 3 : six codes du questionnaire.
['RIA', 'SA', 'IE', 'AIS', 'RC', 'CSE'].forEach((code) => {
  const res = L.cmlMetiersPourLettres(code.split(''));
  profils.push({
    chemin: 'Chemin 3 : questionnaire de préférences', titre: 'Code ' + code,
    description: 'Le questionnaire donne le code ' + code + ' (' + code.split('').map((l) => NOMS_LETTRES[l]).join(', ') + ').',
    nb: res.length,
    metiers: res.slice(0, 5).map((e) => ({ nom: e.metier.nom, secteur: e.metier.secteur, detail: 'lettres du métier : ' + e.lettres }))
  });
});

// Chemin 1 : quatre combinaisons, puis trois pour la rareté.
const D = pmdDonnees();
const idx = (t, re) => D[t].findIndex((x) => re.test(x.lib));
const combos = [
  { titre: 'Autonomie et nature', comp: [{ t: 'se', i: idx('se', /autonomie/i) }], secteurs: [1] },
  { titre: 'Préparer des plats, en hôtellerie-restauration', comp: [{ t: 'sf', i: idx('sf', /Préparer des plats/) }], secteurs: [9] },
  { titre: 'Conduire sur la route et esprit d’équipe, dans le transport', comp: [{ t: 'sf', i: idx('sf', /Conduire un véhicule sur la route/) }, { t: 'se', i: idx('se', /esprit d’équipe/) }], secteurs: [20] },
  { titre: 'Donner des soins médicaux, niveau CAP ou BEP', comp: [{ t: 'sf', i: idx('sf', /Donner des soins médicaux/) }], niveau: 3, secteurs: [] },
  // Consigne 497 (rareté, 21/11/2026) : une compétence très répandue avec une compétence rare. Numéros P28 à P30, à noter par Denis.
  { titre: 'Autonomie et soigner des animaux', comp: [{ t: 'se', i: idx('se', /autonomie/i) }, { t: 'sf', i: idx('sf', /^Soigner des animaux$/) }], secteurs: [] },
  { titre: 'Autonomie, esprit d’équipe et conduire sur la route', comp: [{ t: 'se', i: idx('se', /autonomie/i) }, { t: 'se', i: idx('se', /esprit d’équipe/) }, { t: 'sf', i: idx('sf', /^Conduire un véhicule sur la route$/) }], secteurs: [] },
  { titre: 'Rigueur, accueillir le public et soigner des animaux', comp: [{ t: 'se', i: idx('se', /rigueur et de précision/) }, { t: 'sf', i: idx('sf', /^Accueillir, orienter et renseigner le public$/) }, { t: 'sf', i: idx('sf', /^Soigner des animaux$/) }], secteurs: [] }
];
combos.forEach((c) => {
  const S = C.pmcEtatInitial();
  S.comp = c.comp; S.secteurs = c.secteurs; S.niveau = c.niveau || 0;
  const res = C.pmcCalculer(D, S);
  const dits = c.comp.map((x) => D[x.t][x.i].lib).concat(c.niveau ? ['niveau ' + C.PMC_LIB_NIVEAU[c.niveau]] : [], c.secteurs.map((s) => 'secteur ' + D.secteurs[s]));
  profils.push({
    chemin: 'Chemin 1 : par un métier', titre: c.titre,
    description: 'La personne choisit : ' + dits.join(' ; ') + '.',
    nb: res.retenus.length,
    metiers: res.retenus.slice(0, 5).map((o) => ({ nom: D.m[o.i][0], secteur: D.secteurs[D.m[o.i][1]], detail: o.sc.pct + ' % de ressemblance (plafond de ' + o.sc.plafond + ' % avec ce nombre de choix)' }))
  });
});

// Audit du 21/11/2026 (consigne 503) : 22 cas surprenants du chemin 2 (P31 à P52). Les trois choix sont tirés de la fiche d'un métier d'origine ; on demande au jury si les cinq métiers
// proposés sont raisonnables pour ces choix, et si le métier d'origine est à sa place. Liste fixée dans scripts/auditAtteignabilite/cas_jury_503.json.
const parId = {}; B.tousLesChoix().forEach((c) => { parId[c.id] = c.cle; });
require('./auditAtteignabilite/cas_jury_503.json').forEach((cas) => {
  const choix = { activites: [], actions: [], environnement: [] }; cas.choix.forEach((id) => choix[parId[id]].push(id));
  const res = L.cmlEntree2Metiers(choix, 5000), rang = res.findIndex((m) => m.nom === cas.origine);
  profils.push({
    chemin: 'Chemin 2 : cas surprenants (audit du 21/11/2026)', titre: 'Choix tirés de « ' + cas.origine + ' »',
    description: 'La personne choisit : ' + cas.choix.map((id) => lib(parId[id], id)).join(' ; ') + '. Ces trois choix viennent de la fiche du métier « ' + cas.origine + ' » (' + cas.secteur + '), qui arrive en position ' + (rang + 1) + ' sur ' + res.length + '.',
    nb: res.length,
    metiers: res.slice(0, 5).map((m) => ({ nom: m.nom, secteur: m.secteur, detail: m.score + ' % de ressemblance, ' + m.choixRetrouves + ' de ses ' + m.choixTotal + ' choix retrouvés' }))
  });
});

const donnees = profils.map((p, k) => Object.assign({ id: 'P' + String(k + 1).padStart(2, '0') }, p));
const date = new Date().toISOString().slice(0, 10);

let corps = '';
let chemin = '';
donnees.forEach((p) => {
  if (p.chemin !== chemin) { chemin = p.chemin; corps += '<h2>' + esc(chemin) + '</h2>'; }
  corps += '<section class="profil" id="profil-' + p.id + '" data-id="' + p.id + '"><h3>' + esc(p.id + ' · ' + p.titre) + '</h3><p class="desc">' + esc(p.description) + ' <span class="nb">(' + p.nb + ' métiers proposés au total ; les 5 premiers sont ci-dessous)</span></p>';
  p.metiers.forEach((m, j) => {
    corps += '<div class="metier" data-cle="' + esc(p.id + '|' + m.nom) + '"><div class="nom"><b>' + esc(m.nom) + '</b><span>' + esc(m.secteur || '') + ' · ' + esc(m.detail) + '</span></div>' +
      '<div class="notes" role="group" aria-label="Votre avis sur ' + esc(m.nom) + '">' +
      '<button type="button" data-n="P">Pertinent</button><button type="button" data-n="A">Acceptable</button><button type="button" data-n="X">Absurde</button></div></div>';
  });
  corps += '<label class="manque">Un métier évident qui manque dans cette liste (facultatif) : <input type="text" data-manque="' + p.id + '" autocomplete="off"></label></section>';
});

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Feuille du jury</title>
<style>
:root { --fond:#f6f7f9; --carte:#ffffff; --texte:#1c2330; --doux:#566074; --trait:#d5dae3; --accent:#1f5fbf; --bon:#1f7a3d; --moyen:#8a6100; --mauvais:#a52a2a; --bonfond:#e3f3e8; --moyenfond:#fff3d6; --mauvaisfond:#fbe3e3; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --fond:#12151b; --carte:#1b2029; --texte:#e8ebf1; --doux:#a3adbf; --trait:#343c4b; --accent:#7fb0ff; --bon:#7fd69a; --moyen:#f0c46a; --mauvais:#f19a9a; --bonfond:#173323; --moyenfond:#3a3016; --mauvaisfond:#3b1c1c; } }
body { margin:0; background:var(--fond); color:var(--texte); font:16px/1.5 system-ui, sans-serif; }
main { max-width:860px; margin:0 auto; padding:16px; }
h1 { font-size:1.4rem; } h2 { font-size:1.15rem; margin-top:2rem; border-bottom:2px solid var(--trait); padding-bottom:.3rem; } h3 { font-size:1.05rem; margin:.2rem 0; }
.intro, .profil, .barre { background:var(--carte); border:1px solid var(--trait); border-radius:10px; padding:12px 14px; margin:12px 0; }
.desc { margin:.2rem 0 .6rem; } .nb, .nom span { color:var(--doux); font-size:.875rem; }
.metier { display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid var(--trait); }
.nom { display:flex; flex-direction:column; flex:1 1 320px; }
.notes { display:flex; gap:6px; }
button { font:inherit; min-height:44px; padding:0 12px; border:2px solid var(--trait); border-radius:6px; background:var(--carte); color:var(--texte); cursor:pointer; }
.notes button[aria-pressed="true"][data-n="P"] { background:var(--bonfond); border-color:var(--bon); color:var(--bon); font-weight:700; }
.notes button[aria-pressed="true"][data-n="A"] { background:var(--moyenfond); border-color:var(--moyen); color:var(--moyen); font-weight:700; }
.notes button[aria-pressed="true"][data-n="X"] { background:var(--mauvaisfond); border-color:var(--mauvais); color:var(--mauvais); font-weight:700; }
.manque { display:block; margin-top:8px; color:var(--doux); } .manque input { width:100%; box-sizing:border-box; min-height:44px; font:inherit; padding:0 8px; margin-top:4px; background:var(--fond); color:var(--texte); border:1px solid var(--trait); border-radius:6px; }
.barre { position:sticky; bottom:8px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }
.barre button.principal { background:var(--accent); color:#fff; border-color:var(--accent); font-weight:700; }
#etat { color:var(--doux); }
</style></head><body><main>
<h1>Feuille du jury : les métiers proposés sont-ils pertinents ?</h1>
<div class="intro">
<p><b>À quoi ça sert.</b> Pour chaque personne imaginaire ci-dessous, l'application propose des métiers. Votre avis dit si la liste est juste. Il n'y a pas de bonne ou de mauvaise réponse : c'est votre regard de professionnel qui compte.</p>
<p><b>Comment faire.</b> Pour chaque métier, cliquez sur <b>Pertinent</b> (c'est une piste qui a du sens pour cette personne), <b>Acceptable</b> (pourquoi pas, mais ce n'est pas évident) ou <b>Absurde</b> (cela n'a aucun rapport avec ce qu'elle a choisi). Vous pouvez laisser un métier sans réponse. Si un métier évident manque, écrivez-le dans la case sous la liste.</p>
<p><b>Quand vous avez fini</b>, cliquez sur « Copier mes notes » (en bas), puis collez le texte dans la conversation avec Claude. Vos réponses restent dans cette page tant que vous ne la fermez pas, mais ne sont enregistrées nulle part ailleurs.</p>
<p class="nb">Feuille générée le ${date} à partir du moteur actuel. ${donnees.length} profils, ${donnees.reduce((n, p) => n + p.metiers.length, 0)} métiers à noter.</p>
</div>
<p><button type="button" id="aller28" onclick="document.getElementById('profil-P28').scrollIntoView({behavior:'smooth'})">Aller directement à P28 (les profils déjà notés le 19/11 sont P01 à P27)</button></p>
<label class="manque">Votre fonction (facultatif, par exemple « conseiller en insertion ») : <input type="text" id="fonction" autocomplete="off"></label>
${corps}
<div class="barre"><span id="etat" role="status">0 métier noté</span><button type="button" class="principal" id="copier">Copier mes notes</button></div>
</main>
<script>
(function () {
  var CLE = 'feuilleJuryMoteur_${date}';
  var notes = {}, manque = {}, fonction = '';
  try { var s = JSON.parse(localStorage.getItem(CLE) || '{}'); notes = s.notes || {}; manque = s.manque || {}; fonction = s.fonction || ''; } catch (e) {}
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify({ notes: notes, manque: manque, fonction: fonction })); } catch (e) {} }
  function majEtat() {
    var n = Object.keys(notes).length, tot = document.querySelectorAll('.metier').length;
    document.getElementById('etat').textContent = n + ' métier' + (n > 1 ? 's' : '') + ' noté' + (n > 1 ? 's' : '') + ' sur ' + tot;
  }
  document.querySelectorAll('.metier').forEach(function (el) {
    var cle = el.getAttribute('data-cle');
    el.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', notes[cle] === b.getAttribute('data-n') ? 'true' : 'false');
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-n');
        if (notes[cle] === v) { delete notes[cle]; } else { notes[cle] = v; }
        el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', notes[cle] === x.getAttribute('data-n') ? 'true' : 'false'); });
        sauver(); majEtat();
      });
    });
  });
  document.querySelectorAll('[data-manque]').forEach(function (inp) {
    var id = inp.getAttribute('data-manque'); inp.value = manque[id] || '';
    inp.addEventListener('input', function () { if (inp.value.trim()) { manque[id] = inp.value.trim(); } else { delete manque[id]; } sauver(); });
  });
  var f = document.getElementById('fonction'); f.value = fonction;
  f.addEventListener('input', function () { fonction = f.value.trim(); sauver(); });
  document.getElementById('copier').addEventListener('click', function () {
    var lignes = ['NOTES DU JURY (${date})' + (fonction ? ' - ' + fonction : '')];
    document.querySelectorAll('.metier').forEach(function (el) {
      var cle = el.getAttribute('data-cle');
      if (notes[cle]) { lignes.push(cle + '|' + notes[cle]); }
    });
    Object.keys(manque).forEach(function (id) { lignes.push(id + '|MANQUE|' + manque[id]); });
    var texte = lignes.join('\\n');
    function fait(ok) { document.getElementById('etat').textContent = ok ? 'Notes copiées : collez-les dans la conversation.' : 'La copie a échoué : sélectionnez le texte ci-dessous.'; if (!ok) { var t = document.createElement('textarea'); t.value = texte; t.style.width = '100%'; t.rows = 12; document.querySelector('.barre').after(t); t.select(); } }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(function () { fait(true); }, function () { fait(false); }); } else { fait(false); }
  });
  majEtat();
})();
</script></body></html>
`;
fs.mkdirSync(B.DOSSIER, { recursive: true });
fs.writeFileSync(path.join(B.DOSSIER, 'feuille_jury.html'), html, 'utf8');
fs.writeFileSync(path.join(B.DOSSIER, 'feuille_jury_profils.json'), JSON.stringify(donnees, null, 1), 'utf8');
console.log('Feuille du jury : ' + donnees.length + ' profils, ' + donnees.reduce((n, p) => n + p.metiers.length, 0) + ' métiers. docs/bancEssai/feuille_jury.html');
