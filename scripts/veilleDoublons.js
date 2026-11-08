#!/usr/bin/env node
/* ============================================================
   veilleDoublons.js  --  « ces fiches existent-elles déjà ? » (outil de veille)
   Usage : node scripts/veilleDoublons.js <fichier-reponse.md> [rayon]
   Lit une réponse de l'assistant (blocs [FICHE n] ... [/FICHE n]) et, pour chaque fiche, dit si elle est :
     - une MISE À JOUR (identifiant d'une fiche existante : on montre ce qui change),
     - une NOUVELLE fiche qui RESSEMBLE à des fiches déjà publiées (tous rayons confondus),
     - une NOUVELLE fiche sans équivalent.
   Même lecteur et même comparaison que l'outil de veille (outils/veilleFichesSas.js, outils/veilleRessemblance.js). N'écrit rien.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const racine = path.resolve(__dirname, '..');
const { creerDepot } = require(path.join(racine, 'outils', 'veilleDepot.js'));

const fichier = process.argv[2], rayon = process.argv[3] || '';
if (!fichier) { console.log('Usage : node scripts/veilleDoublons.js <fichier-reponse.md> [rayon]'); process.exit(1); }
const texte = fs.readFileSync(path.resolve(fichier), 'utf8');
const depot = creerDepot(racine, {});
const r = depot.lireReponseFichesSas({ texte: texte, rayon: rayon });
if (!r.ok) { console.log(r.erreur); process.exit(1); }
r.items.forEach(function (x, i) {
  const p = x.proposition;
  console.log('\nFiche ' + (i + 1) + ' : ' + p.titre);
  if (p.genre === 'maj') {
    console.log('  MISE À JOUR de « ' + p.fiche + ' » (rayon ' + p.rayon + '). Changements : ' + (x.champsChanges.length ? x.champsChanges.map(function (c) { return c.libelle; }).join(', ') : 'aucun champ') + (x.corps ? ' + le texte' : ''));
    if (!x.champsChanges.length && !x.corps) { console.log('  => rien ne change : la fiche existante couvre déjà tout. Ne rien déposer.'); }
  } else if (p.genre === 'nouv') {
    if (x.ressemble && x.ressemble.length) {
      x.ressemble.forEach(function (s) {
        console.log('  ' + (s.niveau === 'repete' ? 'RÉPÈTE ' + s.partTexte + ' % DU TEXTE DE' : 'MÊME THÈME QUE') + ' : ' + s.id + ' (rayon ' + s.rayon + ') | mots-clés communs : ' + (s.tagsCommuns.join(', ') || 'aucun') + ' | sources communes : ' + (s.sourcesCommunes.join(', ') || 'aucune'));
        (s.passages || []).forEach(function (t) { console.log('      passage répété : ' + t); });
      });
      console.log('  => ' + (x.ressemble.some(function (s) { return s.niveau === 'repete'; }) ? 'redite probable : lire les deux fiches, retirer la redite d\'un côté (mise à jour) ou écarter.' : 'même thème sans redite de texte : à comparer, mais pas un doublon en soi.'));
    } else { console.log('  NOUVELLE, aucune fiche existante ne lui ressemble.'); }
  }
  (x.problemes || []).forEach(function (m) { console.log('  Point à corriger : ' + m); });
});
(r.notes || []).forEach(function (n) { console.log('\nNote : ' + n); });
