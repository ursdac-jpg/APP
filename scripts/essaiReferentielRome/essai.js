#!/usr/bin/env node
'use strict';
/* ============================================================
   scripts/essaiReferentielRome/essai.js
   Banc d'essai : que change la liste « ce que le métier attend » (ROME officiel) dans la consigne du CV ?
   Aucune dépendance. Deux usages :

     node scripts/essaiReferentielRome/essai.js generer [dossier_des_CSV_ROME]
        -> écrit dans docs/essais_referentiel_rome/ DEUX messages PRÊTS À COLLER par profil fictif :
             <profil>_A_actuel.txt   le message tel que l'application l'envoie AUJOURD'HUI
             <profil>_B_rome.txt     le même message, avec la ligne « compétences attendues » tirée du ROME
           et affiche la taille de chaque message.
           Dossier ROME par défaut : C:/Users/Denis/Documents/ROME_v62_donnees

     node scripts/essaiReferentielRome/essai.js comparer
        -> lit docs/essais_referentiel_rome/<profil>_A_reponse.txt et <profil>_B_reponse.txt
           (les réponses collées de l'assistant) et écrit un tableau de comparaison
           dans docs/essais_referentiel_rome/COMPARAISON.md.

   Le message A est assemblé comme l'application le fait (promptCache : consigne prompts/cv.md avec les
   fragments {{VOIX_HUMAINE}} et {{GARDE_FOU_REPONSE}} insérés, puis le profil). Le profil vient de profils.js.
   La consigne prompts/cv.md N'EST PAS modifiée : seule la ligne du profil change entre A et B.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PROFILS, GENRE } = require('./profils.js');

const RACINE = path.join(__dirname, '..', '..');
const SORTIE = path.join(RACINE, 'docs', 'essais_referentiel_rome');
const ROME_PAR_DEFAUT = 'C:/Users/Denis/Documents/ROME_v62_donnees';

/* ---------- lecture des CSV du ROME ---------- */
function lireCsv(fichier) {
  const t = fs.readFileSync(fichier, 'utf8').replace(/^\uFEFF/, '');
  const lignes = []; let c = '', l = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else { q = false; } } else { c += ch; } }
    else if (ch === '"') { q = true; }
    else if (ch === ',') { l.push(c); c = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') { i++; } l.push(c); c = ''; if (l.length > 1 || l[0] !== '') { lignes.push(l); } l = []; }
    else { c += ch; }
  }
  if (c !== '' || l.length) { l.push(c); lignes.push(l); }
  const h = lignes.shift();
  return lignes.map(function (x) { const o = {}; h.forEach(function (k, i) { o[k] = x[i]; }); return o; });
}

function chargerRome(dossier) {
  const f = function (n) { return path.join(dossier, 'unix_' + n + '_v462_utf8.csv'); };
  const item = {}; lireCsv(f('item')).forEach(function (i) { item[i.code_ogr] = i.libelle; });
  const comp = {}; lireCsv(f('referentiel_competence')).forEach(function (c) { comp[c.code_ogr] = c; });
  const sav = {}; lireCsv(f('referentiel_savoir')).forEach(function (s) { sav[s.code_ogr_savoir] = s; });
  const liens = {}; lireCsv(f('coherence_item')).forEach(function (l) { (liens[l.code_rome] = liens[l.code_rome] || []).push(l); });
  return { item: item, comp: comp, sav: sav, liens: liens };
}

/* Pour un code ROME : le cœur de métier (savoir-faire marqués « Principale ») et quelques savoirs. */
function referentielDuCode(rome, code, maxSavoirs) {
  const l = rome.liens[code] || [];
  const coeur = l.filter(function (x) { return x.coeur_metier === 'Principale' && rome.comp[x.code_ogr] && rome.comp[x.code_ogr].cat_comp === 'Savoir-faire'; })
    .map(function (x) { return rome.item[x.code_ogr]; });
  const savoirs = l.filter(function (x) { return rome.sav[x.code_ogr]; }).slice(0, maxSavoirs || 8)
    .map(function (x) { return rome.item[x.code_ogr]; });
  return { coeur: coeur, savoirs: savoirs };
}

/* La ligne du profil, même style que la ligne existante « Compétences typiquement attendues pour ce métier ». */
function lignePourLeProfil(ref) {
  return 'Compétences typiquement attendues pour ce métier (fiche officielle du ROME, France Travail) : ' + ref.coeur.join(' ; ') +
    '. Savoirs du métier : ' + ref.savoirs.join(' ; ') + '. Cette liste décrit le métier, pas la personne : ne retiens que ce que son parcours prouve réellement.';
}

/* ---------- assemblage du message ---------- */
function lire(rel) { return fs.readFileSync(path.join(RACINE, rel), 'utf8'); }
function consigneCv() {
  return lire('prompts/cv.md').trim()
    .replace(/\{\{VOIX_HUMAINE\}\}/g, function () { return lire('prompts/_voix-humaine.md').trim(); })
    .replace(/\{\{GARDE_FOU_REPONSE\}\}/g, function () { return lire('prompts/_garde-fou-reponse.md').trim(); });
}
function profilA(p) { return p.profilTexte.replace('@@GENRE@@', GENRE); }
function profilB(p, ref) {
  let t = p.profilTexte;
  const ancienne = /Compétences typiquement attendues pour ce métier : [^\n]*?\.\n/;
  const ligne = lignePourLeProfil(ref);
  if (ancienne.test(t)) { t = t.replace(ancienne, function () { return ligne + '\n'; }); }
  else { t = t.replace('plutôt qu’un CV générique.\n', function (m) { return 'plutôt qu’un CV générique. ' + ligne + '\n'; }); }
  return t.replace('@@GENRE@@', GENRE);
}
function message(profil) { return consigneCv() + '\n\n' + profil; }

function generer(dossierRome) {
  const rome = chargerRome(dossierRome);
  fs.mkdirSync(SORTIE, { recursive: true });
  const lignes = [];
  PROFILS.forEach(function (p) {
    const ref = referentielDuCode(rome, p.codeRome, 8);
    if (!ref.coeur.length) { throw new Error('Aucun cœur de métier trouvé pour ' + p.codeRome); }
    const a = message(profilA(p)), b = message(profilB(p, ref));
    fs.writeFileSync(path.join(SORTIE, p.id + '_A_actuel.txt'), a, 'utf8');
    fs.writeFileSync(path.join(SORTIE, p.id + '_B_rome.txt'), b, 'utf8');
    fs.writeFileSync(path.join(SORTIE, p.id + '_referentiel.json'), JSON.stringify({ code: p.codeRome, coeur: ref.coeur, savoirs: ref.savoirs }, null, 1), 'utf8');
    lignes.push(p.id + ' : A = ' + a.length + ' caractères, B = ' + b.length + ' caractères (écart ' + (b.length - a.length >= 0 ? '+' : '') + (b.length - a.length) + '), cœur ROME = ' + ref.coeur.length + ' savoir-faire, ' + ref.savoirs.length + ' savoirs');
  });
  console.log(lignes.join('\n'));
}

/* ---------- comparaison des réponses ---------- */
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function motsUtiles(s) { return norm(s).split(' ').filter(function (m) { return m.length > 3; }); }
function dernierJson(texte) {
  const re = /```json\s*([\s\S]*?)```/gi; let m, dernier = null;
  while ((m = re.exec(texte)) !== null) { dernier = m[1]; }
  if (!dernier) { return { json: null, motif: 'aucun bloc JSON' }; }
  try { return { json: JSON.parse(dernier), motif: '' }; } catch (e) { return { json: null, motif: 'JSON invalide : ' + e.message }; }
}
function analyser(p, texte, refJson) {
  const r = dernierJson(texte);
  if (!r.json) { return { ok: false, motif: r.motif }; }
  const rec = r.json.recommandations || {};
  const comps = (rec.competencesAValoriser || []).map(function (c) { return { competence: c.competence || '', justification: c.justification || '' }; });
  const coeurNorm = refJson.coeur.map(norm);
  const preuves = p.preuves.map(norm);
  const lignes = comps.map(function (c) {
    const n = norm(c.competence);
    const identique = coeurNorm.indexOf(n) !== -1;
    const mots = motsUtiles(c.competence);
    const proche = coeurNorm.some(function (x) { const mx = x.split(' '); return mots.length > 0 && mots.filter(function (w) { return mx.indexOf(w) !== -1; }).length >= Math.min(3, mots.length); });
    const textePreuve = norm(c.competence + ' ' + c.justification);
    const preuve = preuves.some(function (x) { return textePreuve.indexOf(x) !== -1; });
    return { competence: c.competence, justification: c.justification, identique: identique, proche: proche, preuve: preuve };
  });
  return {
    ok: true, nbComp: comps.length, nbMotsCles: (r.json.motsCles || []).length, nbPointsForts: (r.json.pointsForts || []).length,
    nbPostes: ((rec.postesRecommandes) || []).length, secteurProche: rec.secteurProche || '',
    nbExpAvecMissions: ((r.json.savoirFaireParExperience || []).length),
    identiques: lignes.filter(function (l) { return l.identique; }).length, proches: lignes.filter(function (l) { return l.proche && !l.identique; }).length,
    sansPreuve: lignes.filter(function (l) { return !l.preuve; }).length, lignes: lignes,
    pointsForts: r.json.pointsForts || [], motsCles: r.json.motsCles || [], titres: r.json.titresProposes || []
  };
}
function comparer() {
  const out = ['# Comparaison A (message actuel) et B (avec le ROME)', '', 'Générée par `node scripts/essaiReferentielRome/essai.js comparer`. Les compteurs sont des repères, pas un verdict : la lecture humaine (grille du LISEZMOI) décide.', ''];
  PROFILS.forEach(function (p) {
    out.push('## ' + p.titre, '');
    const refJson = JSON.parse(fs.readFileSync(path.join(SORTIE, p.id + '_referentiel.json'), 'utf8'));
    const res = {};
    ['A', 'B'].forEach(function (v) {
      const f = path.join(SORTIE, p.id + '_' + v + '_reponse.txt');
      res[v] = fs.existsSync(f) ? analyser(p, fs.readFileSync(f, 'utf8'), refJson) : { ok: false, motif: 'fichier de réponse absent' };
    });
    out.push('| Repère | A (actuel) | B (ROME) |', '|---|---|---|');
    const cell = function (v, k) { return res[v].ok ? String(res[v][k]) : res[v].motif; };
    [['nbComp', 'Compétences à valoriser'], ['sansPreuve', 'dont sans preuve apparente dans le profil'], ['identiques', 'dont recopiées mot pour mot du ROME'], ['proches', 'dont très proches d\'une ligne du ROME'], ['nbMotsCles', 'Mots-clés'], ['nbPointsForts', 'Points forts'], ['nbPostes', 'Postes recommandés'], ['nbExpAvecMissions', 'Expériences avec missions proposées'], ['secteurProche', 'secteurProche']].forEach(function (x) {
      out.push('| ' + x[1] + ' | ' + cell('A', x[0]) + ' | ' + cell('B', x[0]) + ' |');
    });
    out.push('');
    ['A', 'B'].forEach(function (v) {
      if (!res[v].ok) { return; }
      out.push('**' + v + ' : compétences à valoriser** (✔ preuve apparente, ✘ sans preuve ; ROME = recopiée ou très proche)', '');
      res[v].lignes.forEach(function (l) { out.push('- ' + (l.preuve ? '✔' : '✘') + (l.identique ? ' [ROME identique]' : l.proche ? ' [ROME proche]' : '') + ' ' + l.competence + ' : ' + l.justification); });
      out.push('', '**' + v + ' : mots-clés** : ' + res[v].motsCles.join(', '), '');
    });
  });
  fs.writeFileSync(path.join(SORTIE, 'COMPARAISON.md'), out.join('\n'), 'utf8');
  console.log('Écrit : docs/essais_referentiel_rome/COMPARAISON.md');
}

const cmd = process.argv[2];
if (cmd === 'generer') { generer(process.argv[3] || ROME_PAR_DEFAUT); }
else if (cmd === 'comparer') { comparer(); }
else { console.log('Usage : node scripts/essaiReferentielRome/essai.js generer [dossier_ROME] | comparer'); }
