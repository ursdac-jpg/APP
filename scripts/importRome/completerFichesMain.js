'use strict';
/* ============================================================
   scripts/importRome/completerFichesMain.js
   Complète les fiches ÉCRITES À LA MAIN (data/metiers.js) qui ont moins de 3 savoir-faire ou moins de 3 savoir-être, avec la même traduction des compétences du ROME
   que les fiches générées (tablesCompetences.js). Ne retire ni ne réordonne jamais rien : seulement des ajouts à la fin de la liste, jusqu'à 3.
   Usage :
     node scripts/importRome/completerFichesMain.js <dossier CSV ROME>            (essai : affiche ce qui serait ajouté)
     node scripts/importRome/completerFichesMain.js <dossier CSV ROME> --ecrire   (écrit dans data/metiers.js)
   Plan : docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md, section 15.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const FICHIER = path.join(RACINE, 'data', 'metiers.js');
const T = require('./tablesRome.js');
const { calculerFrequences, motsDuCode } = require('./traducteurCompetences.js');
const { chargerRome } = require('./lireRome.js');
const MINIMUM = 3;
// Fiches écrites à la main sans code du ROME : code le plus proche (décision technique, à relire)
// Mots trop généraux pour compléter une fiche écrite à la main (« Bureautique » sortirait pour un chauffeur ou un livreur)
const MOTS_EXCLUS = ['Bureautique'];
const CODE_PAR_FICHE = { webmaster: 'M1805', technicien_son_lumiere: 'L1504' };

function proposer(fiche, rome, categorie) {
  const code = fiche.rome || CODE_PAR_FICHE[fiche.id];
  const f = code && rome.codes[code];
  if (!f) { return null; }
  const cote = categorie === 'Savoir-faire' ? 'sf' : 'se';
  const liste = (cote === 'sf' ? fiche.savoirFaire : fiche.savoirEtre) || [];
  const manque = MINIMUM - liste.length;
  if (manque <= 0) { return []; }
  // Savoir-être : d'abord ceux que le ROME donne lui-même au métier, puis ceux traduits de ses compétences
  const candidats = [];
  if (cote === 'se') { f.savoirEtre.forEach((l) => (T.SAVOIR_ETRE[l] || []).forEach((m) => candidats.push(m))); }
  motsDuCode(f, cote).filter((x) => x.nb >= 2).forEach((x) => candidats.push(x.mot));
  const ajouts = [];
  candidats.forEach((m) => { if (ajouts.length < manque && MOTS_EXCLUS.indexOf(m) === -1 && liste.indexOf(m) === -1 && ajouts.indexOf(m) === -1) { ajouts.push(m); } });
  return ajouts;
}

// Ajoute des mots à la fin de la liste « champ: [...] » de la fiche d'identifiant id, dans le texte du fichier
function ajouterAuTexte(texte, id, champ, mots) {
  const m = new RegExp('id:\\s*(["\'])' + id + '\\1').exec(texte);
  if (!m) { throw new Error('Fiche ' + id + ' introuvable dans data/metiers.js'); }
  const suite = texte.slice(m.index);
  const finFiche = suite.search(/\n  \},?\s*(\n|$)/);
  const bloc = suite.slice(0, finFiche === -1 ? suite.length : finFiche);
  const r = new RegExp(champ + ':\\s*\\[([^\\]]*)\\]').exec(bloc);
  if (!r) { throw new Error('Liste ' + champ + ' introuvable pour ' + id); }
  const guillemet = /["']/.exec(r[1]) ? /["']/.exec(r[1])[0] : '"';
  const echap = (s) => s.split(guillemet).join('\\' + guillemet);
  const nouveaux = mots.map((x) => guillemet + echap(x) + guillemet).join(', ');
  const contenu = r[1].trim() ? r[1].replace(/\s+$/, '') + ', ' + nouveaux : nouveaux;
  const debut = m.index + r.index;
  return texte.slice(0, debut) + champ + ': [' + contenu + ']' + texte.slice(debut + r[0].length);
}

module.exports = { proposer, ajouterAuTexte, CODE_PAR_FICHE };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dossier = args.filter((a) => a.indexOf('--') !== 0)[0];
  if (!dossier) { console.error('Usage : node scripts/importRome/completerFichesMain.js <dossier CSV ROME> [--ecrire]'); process.exit(1); }
  const rome = chargerRome(dossier);
  calculerFrequences(rome);
  const { baseMetiersDetaillees } = require(FICHIER);
  let texte = fs.readFileSync(FICHIER, 'utf8');
  const crlf = texte.indexOf('\r\n') !== -1;
  texte = texte.replace(/\r\n/g, '\n');
  let nb = 0; const sansCode = [];
  baseMetiersDetaillees.forEach((fiche) => {
    [['Savoir-faire', 'savoirFaire'], ['Savoir-etre', 'savoirEtre']].forEach((p) => {
      if ((fiche[p[1]] || []).length >= MINIMUM) { return; }
      const ajouts = proposer(fiche, rome, p[0]);
      if (ajouts === null) { sansCode.push(fiche.id); return; }
      if (!ajouts.length) { return; }
      nb++;
      console.log(fiche.id + ' (' + (fiche.rome || CODE_PAR_FICHE[fiche.id]) + ') ' + p[1] + ' : ' + (fiche[p[1]] || []).join(' ; ') + '  +  ' + ajouts.join(' ; '));
      texte = ajouterAuTexte(texte, fiche.id, p[1], ajouts);
    });
  });
  console.log('\n' + nb + ' listes complétées.' + (sansCode.length ? ' Sans code du ROME : ' + sansCode.join(', ') : ''));
  if (args.indexOf('--ecrire') !== -1) { fs.writeFileSync(FICHIER, crlf ? texte.replace(/\n/g, '\r\n') : texte); console.log('Écrit dans data/metiers.js.'); }
  else { console.log('(Essai : rien n\'a été écrit. Ajouter --ecrire.)'); }
}
