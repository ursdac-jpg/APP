#!/usr/bin/env node
'use strict';
/* ============================================================
   scripts/essaiMesCompetences/essai.js
   Banc d'essai du prompt « Découvrir mes compétences » (prompts/mes-competences.md).
   Aucune dépendance. Trois usages :

     node scripts/essaiMesCompetences/essai.js generer
        -> écrit dans docs/essais_mes_competences/ un fichier .txt PRÊT À COLLER
           par profil fictif (consigne + documents), dans un assistant en ligne.

     node scripts/essaiMesCompetences/essai.js verifier <profil> <fichier_reponse.txt> [reponses_personne.txt [fichier_passe1.txt]]
        -> contrôle la réponse collée dans un fichier texte (voir verifier.js).
           Avec les réponses de la personne = contrôle d'un SECOND passage (lignes seules).

     node scripts/essaiMesCompetences/essai.js passe2 <profil> <fichier_reponse_passe1.txt> <reponses_personne.txt>
        -> écrit le message du SECOND passage (documents + liste déjà établie + réponses
           de la personne), à coller dans une nouvelle conversation.

   Profils : voir profils.js (documents fictifs).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PROFILS } = require('./profils.js');
const { verifier, extraireJson } = require('./verifier.js');

const RACINE = path.join(__dirname, '..', '..');
const SORTIE = path.join(RACINE, 'docs', 'essais_mes_competences');

const L = require('../../modules/mes-competences/logique.js');

function lire(rel) { return fs.readFileSync(path.join(RACINE, rel), 'utf8'); }
function voix() { return lire('prompts/_voix-humaine.md').trim(); }

// Le prompt tel que l'application l'envoie : voix humaine insérée, historique des versions retiré (logique.js).
function consigne() { return L.mesCompNettoyerPrompt(lire('prompts/mes-competences.md').replace(/\{\{VOIX_HUMAINE\}\}/g, function () { return voix(); })); }

// Les messages sont construits par la source unique de l'application (modules/mes-competences/logique.js).
function messagePasse1(profil) {
  return L.mesCompConstruireMessage(consigne(), profil.documents, profil.niveauChoisi || 'auto');
}
function messagePasse2(profil, reponsePasse1, reponsesPersonne) {
  const ext = extraireJson(reponsePasse1);
  if (!ext.json) { throw new Error('Aucun JSON valide dans la réponse du premier passage.'); }
  const aPreciser = (ext.json.competences || []).filter(function (c) { return c.confirmation === 'aPreciser'; });
  if (!aPreciser.length) { throw new Error('Aucune compétence « à préciser » : pas de second passage.'); }
  return L.mesCompConstruireMessageSecondPassage(consigne(), profil.documents, profil.niveauChoisi || 'auto', aPreciser, reponsesPersonne);
}
function libellesAPreciser(reponsePasse1) {
  const ext = extraireJson(reponsePasse1);
  return ((ext.json && ext.json.competences) || []).filter(function (c) { return c.confirmation === 'aPreciser'; }).map(function (c) { return c.libelle; });
}

function profilParId(id) {
  const p = PROFILS.filter(function (x) { return x.id === id; })[0];
  if (!p) { throw new Error('Profil inconnu : ' + id + '. Profils : ' + PROFILS.map(function (x) { return x.id; }).join(', ')); }
  return p;
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'generer') {
    fs.mkdirSync(SORTIE, { recursive: true });
    PROFILS.forEach(function (p, i) {
      const nom = String(i + 1).padStart(2, '0') + '_' + p.id + '.txt';
      fs.writeFileSync(path.join(SORTIE, nom), messagePasse1(p), 'utf8');
      console.log('écrit : docs/essais_mes_competences/' + nom + ' (' + messagePasse1(p).length + ' caractères)');
    });
    return 0;
  }
  if (cmd === 'verifier') {
    const profil = profilParId(argv[1]);
    const reponse = fs.readFileSync(argv[2], 'utf8');
    const reps = argv[3] ? fs.readFileSync(argv[3], 'utf8') : '';
    const questions = argv[4] ? libellesAPreciser(fs.readFileSync(argv[4], 'utf8')) : null;
    const r = verifier(reponse, profil, { reponsesPersonne: reps, secondPassage: !!argv[3], questionsPosees: questions });
    console.log('Profil : ' + profil.titre);
    console.log('Compétences : ' + (r.infos.nbCompetences || 0) + ' ' + JSON.stringify(r.infos.repartition || {}) + ' - motivations : ' + (r.infos.nbMotivations || 0));
    console.log('\nERREURS (' + r.erreurs.length + ')');
    r.erreurs.forEach(function (m) { console.log('  - ' + m); });
    console.log('\nAVERTISSEMENTS À RELIRE (' + r.avertissements.length + ')');
    r.avertissements.forEach(function (m) { console.log('  - ' + m); });
    console.log('\nRappel : ce contrôle ne juge pas la qualité. Relire avec docs/ESSAI_MES_COMPETENCES_FICHE_DE_CONTROLE_2026-10-26.md.');
    return r.erreurs.length ? 1 : 0;
  }
  if (cmd === 'passe2') {
    const profil = profilParId(argv[1]);
    const msg = messagePasse2(profil, fs.readFileSync(argv[2], 'utf8'), fs.readFileSync(argv[3], 'utf8'));
    fs.mkdirSync(SORTIE, { recursive: true });
    const nom = 'passe2_' + profil.id + '.txt';
    fs.writeFileSync(path.join(SORTIE, nom), msg, 'utf8');
    console.log('écrit : docs/essais_mes_competences/' + nom);
    return 0;
  }
  console.log('Usage : generer | verifier <profil> <fichier> [reponses [passe1]] | passe2 <profil> <fichier_passe1> <reponses>');
  return 2;
}

if (require.main === module) { process.exit(main(process.argv.slice(2))); }
module.exports = { messagePasse1, messagePasse2, libellesAPreciser, consigne, profilParId };
