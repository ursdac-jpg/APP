'use strict';
/* ============================================================
   scripts/importRome/promouvoirFiche.js
   Passe une fiche générée du ROME (data/metiersRome.js) en fiche ÉCRITE À LA MAIN (data/metiers.js), pour l'enrichir.
   Une seule base : la fiche quitte le fichier généré, elle ne peut jamais être aux deux endroits (tests/metiersRome.test.js).
   Usage :
     node scripts/importRome/promouvoirFiche.js <identifiant ou code ROME ou nom>            (essai : affiche le bloc, n'écrit rien)
     node scripts/importRome/promouvoirFiche.js <identifiant ou code ROME ou nom> --ecrire    (écrit dans les deux fichiers)
   La fiche promue garde ses listes de départ (activités, actions, lieux, savoir-faire, savoir-être, savoirs) ; les listes d'accroches
   (argumentsCV, argumentsLettre, pistesEntretien, synonymes, motsCles) sont vides, à écrire à la main. Un commentaire dans la fiche rappelle son origine.
   Plan : docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md, section 12.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const FICHIER_MANUEL = path.join(RACINE, 'data', 'metiers.js');
const FICHIER_GENERE = path.join(RACINE, 'data', 'metiersRome.js');
const MARQUE_FIN_MANUEL = '/* ------------------------------------------------------------\n   UNE SEULE BASE';

const chaine = (x) => "'" + String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const liste = (a) => '[' + (a || []).map(chaine).join(', ') + ']';
const sansAccents = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
const identifiantDepuisNom = (nom) => sansAccents(nom).replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

// Retrouve une fiche générée par identifiant (rome_X1234), code (X1234) ou nom exact (sans tenir compte des accents ni de la casse)
function trouverFiche(fiches, cle) {
  const c = sansAccents(cle).trim();
  return fiches.filter((m) => sansAccents(m.id) === c || sansAccents(m.rome) === c || sansAccents(m.nom) === c)[0] || null;
}

// Texte de la fiche écrite à la main (même présentation que les fiches existantes de data/metiers.js)
function construireBloc(f, idChoisi, dateJour) {
  return [
    '  {',
    '    id: ' + chaine(idChoisi) + ', nom: ' + chaine(f.nom) + ', secteur: ' + chaine(f.secteur) + ',',
    '    rome: ' + chaine(f.rome) + ', fap: null,',
    '    // TACHE (promue depuis le ROME le ' + dateJour + ', fiche officielle https://candidat.francetravail.fr/metierscope/fiche-metier/' + f.rome + ') :',
    "    // listes de départ générées par l'import (scripts/importRome), à relire et à enrichir à la main ; les listes d'accroches restent à écrire.",
    '    activites: ' + liste(f.activites) + ', actions: ' + liste(f.actions) + ',',
    '    environnement: ' + liste(f.environnement) + ',',
    '    savoirFaire: ' + liste(f.savoirFaire) + ', savoirEtre: ' + liste(f.savoirEtre) + ',',
    '    savoirs: ' + liste(f.savoirs) + ',',
    '    argumentsCV: [], argumentsLettre: [], pistesEntretien: [],',
    '    synonymes: [], motsCles: [], conceptsAssocies: [],',
    '    niveauPertinence: null',
    '  }'
  ].join('\n');
}

// Insère le bloc à la fin du tableau des fiches détaillées (juste avant le commentaire « UNE SEULE BASE »). Les fins de ligne du fichier sont respectées.
function insererDansManuel(texte, bloc) {
  const crlf = texte.indexOf('\r\n') !== -1;
  const t = texte.replace(/\r\n/g, '\n');
  const marque = '\n];\n\n' + MARQUE_FIN_MANUEL;
  const i = t.indexOf(marque);
  if (i === -1) { throw new Error('Fin du tableau des fiches détaillées introuvable dans data/metiers.js (commentaire « UNE SEULE BASE » absent).'); }
  const resultat = t.slice(0, i) + ',\n' + bloc + t.slice(i);
  return crlf ? resultat.replace(/\n/g, '\r\n') : resultat;
}

// Retire la fiche du fichier généré (une fiche par ligne, séparées par des virgules) ; remet les virgules en ordre si c'était la dernière
function retirerDuGenere(texte, id) {
  const crlf = texte.indexOf('\r\n') !== -1;
  const lignes = texte.replace(/\r\n/g, '\n').split('\n');
  const debut = '  {"id":"' + id + '"';
  const i = lignes.findIndex((l) => l.indexOf(debut) === 0);
  if (i === -1) { throw new Error('Fiche ' + id + ' introuvable dans data/metiersRome.js.'); }
  const etaitDerniere = !/,$/.test(lignes[i]);
  lignes.splice(i, 1);
  if (etaitDerniere && i > 0) { lignes[i - 1] = lignes[i - 1].replace(/,$/, ''); }
  const resultat = lignes.join('\n').replace(/\. (\d+) fiches\./, (m, n) => '. ' + (Number(n) - 1) + ' fiches.');
  return crlf ? resultat.replace(/\n/g, '\r\n') : resultat;
}

function promouvoir(cle, options) {
  const o = options || {};
  const { METIERS_ROME } = require(FICHIER_GENERE);
  const f = trouverFiche(METIERS_ROME, cle);
  if (!f) { throw new Error('Aucune fiche générée ne correspond à « ' + cle + ' » (identifiant, code ROME ou nom exact). Elle est peut-être déjà écrite à la main.'); }
  const { baseMetiersDetaillees } = require(FICHIER_MANUEL);
  let idChoisi = identifiantDepuisNom(f.nom) || f.id.replace(/^rome_/, '').toLowerCase();
  if (baseMetiersDetaillees.some((m) => m.id === idChoisi)) { idChoisi = idChoisi + '_' + f.rome.toLowerCase(); }
  const dateJour = o.date || new Date().toISOString().slice(0, 10);
  const bloc = construireBloc(f, idChoisi, dateJour);
  const nouveauManuel = insererDansManuel(fs.readFileSync(FICHIER_MANUEL, 'utf8'), bloc);
  const nouveauGenere = retirerDuGenere(fs.readFileSync(FICHIER_GENERE, 'utf8'), f.id);
  if (o.ecrire) {
    fs.writeFileSync(FICHIER_MANUEL, nouveauManuel);
    fs.writeFileSync(FICHIER_GENERE, nouveauGenere);
  }
  return { fiche: f, id: idChoisi, bloc, nouveauManuel, nouveauGenere };
}

module.exports = { trouverFiche, construireBloc, insererDansManuel, retirerDuGenere, identifiantDepuisNom, promouvoir };

if (require.main === module) {
  const args = process.argv.slice(2);
  const cle = args.filter((a) => a.indexOf('--') !== 0).join(' ');
  if (!cle) { console.error('Usage : node scripts/importRome/promouvoirFiche.js <identifiant, code ROME ou nom> [--ecrire]'); process.exit(1); }
  try {
    const r = promouvoir(cle, { ecrire: args.indexOf('--ecrire') !== -1 });
    console.log(r.bloc);
    console.log(args.indexOf('--ecrire') !== -1
      ? '\nFiche « ' + r.fiche.nom + ' » promue : écrite dans data/metiers.js (id ' + r.id + ') et retirée de data/metiersRome.js. Lancer npm test.'
      : '\n(Essai : rien n\'a été écrit. Ajouter --ecrire pour promouvoir la fiche « ' + r.fiche.nom + ' ».)');
  } catch (e) { console.error(e.message); process.exit(1); }
}
