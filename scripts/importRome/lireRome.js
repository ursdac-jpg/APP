'use strict';
/* ============================================================
   scripts/importRome/lireRome.js
   Lit le paquet officiel du ROME 4.0 (France Travail, fichiers CSV « unix_* ») et en tire, pour chacun des codes (fiches métier) :
   libellé, appellations, compétences (avec leur objectif et leur macro-compétence), savoir-être, savoirs, contextes de travail.
   Sert à la génération de data/metiersRome.js (genererMetiersRome.js) ET, plus tard, à la veille de tous les six mois
   (comparaison de deux versions du ROME : empreinte de chaque code). Rien n'est écrit ici : lecture seule.
   Usage : const { chargerRome, empreinte } = require('./lireRome.js'); const rome = chargerRome('<dossier des CSV>');
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Lecteur CSV (guillemets, virgules et retours à la ligne dans les champs). Seule copie du dépôt pour les scripts du ROME.
function lireCsv(dossier, nom) {
  const texte = fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/^﻿/, '');
  const lignes = [];
  let champ = '', ligne = [], guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"') { if (texte[i + 1] === '"') { champ += '"'; i++; } else { guillemets = false; } } else { champ += c; }
    } else if (c === '"') { guillemets = true; }
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') { i++; }
      ligne.push(champ); champ = '';
      if (ligne.length > 1 || ligne[0] !== '') { lignes.push(ligne); }
      ligne = [];
    } else { champ += c; }
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  const entete = lignes.shift();
  return lignes.map((l) => { const o = {}; entete.forEach((k, i) => { o[k] = l[i]; }); return o; });
}

function chargerRome(dossier) {
  const csv = (nom) => lireCsv(dossier, nom);
  const codesCsv = csv('unix_referentiel_code_rome_v462_utf8.csv');
  const appellationsCsv = csv('unix_referentiel_appellation_v462_utf8.csv');
  const liens = csv('unix_liens_rome_referentiels_v462_utf8.csv');
  const arbo = csv('unix_arborescence_competences_v462_utf8.csv');
  const competencesCsv = csv('unix_referentiel_competence_v462_utf8.csv');
  const savoirsCsv = csv('unix_referentiel_savoir_v462_utf8.csv');
  const contextesCsv = csv('unix_referentiel_contexte_travail_v462_utf8.csv');
  const textesCsv = csv('unix_texte_v462_utf8.csv');
  const coherenceCsv = csv('unix_coherence_item_v462_utf8.csv');   // « cœur de métier » : éléments marqués « Principale » pour un code
  const mobiliteCsv = csv('unix_rubrique_mobilite_v462_utf8.csv'); // métiers proches (passerelles), classés
  const riasecCsv = csv('unix_referentiel_code_rome_riasec_v462_utf8.csv'); // lettres RIASEC du métier : majeure et parfois mineure

  const coeur = new Set(coherenceCsv.filter((x) => x.coeur_metier === 'Principale').map((x) => x.code_rome + '|' + x.code_ogr));
  const parCompetence = {}; arbo.forEach((a) => { parCompetence[a.code_ogr_competence] = a; });
  const referentielCompetence = {}; competencesCsv.forEach((c) => { referentielCompetence[c.code_ogr] = c; });
  const parSavoir = {}; savoirsCsv.forEach((s) => { parSavoir[s.code_ogr_savoir] = s; });
  const parContexte = {}; contextesCsv.forEach((c) => { parContexte[c.code_ogr] = c; });
  const objectifsLibelles = {}; arbo.forEach((a) => { objectifsLibelles[a.code_objectif] = a.objectif; });

  const codes = {};
  codesCsv.forEach((c) => {
    codes[c.code_rome] = { code: c.code_rome, libelle: c.libelle_rome, parent: c.code_rome_parent, appellations: [], competences: [], savoirEtre: [], savoirs: [], contextes: [], intro: '', missions: [], acces: '', reglemente: c.emploi_reglemente === 'O', proches: [] };
  });
  riasecCsv.forEach((r) => { if (codes[r.code_rome]) { codes[r.code_rome].riasec = (r.riasec_majeur || '') + (r.riasec_mineur || ''); } });
  appellationsCsv.forEach((a) => {
    const f = codes[a.code_rome];
    if (f) { f.appellations.push({ libelle: a.libelle_appellation_court || a.libelle_appellation_long, peuUsite: a.peu_usite === 'O' }); }
  });
  // Textes en langage courant de la fiche (définition : phrase 1 = présentation, les suivantes = missions ; accès au métier). Les apostrophes y sont doublées (échappement SQL).
  const proprete = (s) => String(s).replace(/''/g, '’').replace(/\s+/g, ' ').trim();
  textesCsv.slice().sort((a, b) => Number(a.position_phrase) - Number(b.position_phrase)).forEach((x) => {
    const f = codes[x.code_rome];
    if (!f) { return; }
    if (x.libelle_type_texte === 'definition') { if (Number(x.position_phrase) === 1) { f.intro = proprete(x.libelle_texte); } else { f.missions.push(proprete(x.libelle_texte)); } }
    else if (x.libelle_type_texte === 'acces_metier') { f.acces = proprete(x.libelle_texte); }
  });
  liens.forEach((l) => {
    const f = codes[l.code_rome];
    if (!f) { return; }
    if (l.code_compo_bloc === '5' && l.code_rubrique === '1') {
      const a = parCompetence[l.code_ogr];
      if (a) { f.competences.push({ objectif: a.code_objectif, macro: a.libelle_macro_competence, libelle: a.libelle_competence, coeur: coeur.has(l.code_rome + '|' + l.code_ogr) }); }
    } else if (l.code_compo_bloc === '5' && l.code_rubrique === '2') {
      const c = referentielCompetence[l.code_ogr];
      if (c && c.cat_comp === 'Savoir-être professionnel' && f.savoirEtre.indexOf(c.libelle_competence) === -1) { f.savoirEtre.push(c.libelle_competence); }
    } else if (l.code_compo_bloc === '5' && l.code_rubrique === '3') {
      const s = parSavoir[l.code_ogr];
      if (s) { f.savoirs.push({ libelle: s.libelle_savoir, categorie: s.categorie_savoir, sousCategorie: s.sous_categorie_savoir, coeur: coeur.has(l.code_rome + '|' + l.code_ogr) }); }
    } else if (l.code_compo_bloc === '6') {
      const c = parContexte[l.code_ogr];
      if (c) { f.contextes.push({ libelle: c.libelle_cont_travail, type: c.libelle_type_cont_trav }); }
    }
  });
  mobiliteCsv.slice().sort((a, b) => Number(a.numero_ordre) - Number(b.numero_ordre)).forEach((m) => { const f = codes[m.code_rome]; if (f && codes[m.code_rome_cible] && f.proches.indexOf(m.code_rome_cible) === -1) { f.proches.push(m.code_rome_cible); } });
  let version = [];
  try { version = fs.readFileSync(path.join(dossier, 'version.txt'), 'utf8').split(/\r?\n/).filter(Boolean).slice(0, 3); } catch (e) { /* version.txt facultatif */ }
  return { version, codes, objectifsLibelles };
}

// Empreinte d'un code : change si le libellé, les appellations, les compétences, les savoir-être, les savoirs ou les contextes changent.
function empreinte(f) {
  const tri = (a) => a.slice().sort();
  const canon = JSON.stringify([
    f.libelle,
    tri(f.appellations.map((a) => a.libelle)),
    tri(f.competences.map((c) => c.macro + '|' + c.libelle)),
    tri(f.savoirEtre),
    tri(f.savoirs.map((s) => s.categorie + '|' + s.libelle)),
    tri(f.contextes.map((c) => c.type + '|' + c.libelle)),
    f.intro, f.missions, f.acces, f.reglemente, f.proches,
    f.competences.filter((c) => c.coeur).length, f.savoirs.filter((s) => s.coeur).length
  ]);
  return crypto.createHash('sha1').update(canon).digest('hex').slice(0, 12);
}

module.exports = { lireCsv, chargerRome, empreinte };
