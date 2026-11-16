'use strict';
/* ============================================================
   scripts/importRome/comparerRome.js
   VEILLE DU ROME (phase 6, tous les six mois) : compare un NOUVEAU paquet ROME (CSV de France Travail) à l'état gardé dans
   docs/suivi_rome/empreintes_ROME.json (écrit par genererMetiersRome.js) et produit un rapport d'écarts. Rien n'est modifié dans l'application.
   Usage :
     node scripts/importRome/comparerRome.js <dossier du nouveau paquet CSV>                  (affiche le rapport)
     node scripts/importRome/comparerRome.js <dossier du nouveau paquet CSV> --ecrire         (écrit aussi docs/suivi_rome/RAPPORT_VEILLE_<date>.md)
   Ensuite : régénérer les fiches (node scripts/importRome/genererMetiersRome.js <dossier>), relire les fiches détaillées listées « à relire »,
   puis noter la veille dans docs/suivi_rome/JOURNAL_VEILLE_ROME.md. Une fiche écrite à la main n'est JAMAIS modifiée seule : l'écart est affiché, Denis décide.
   Plan : docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md, section 8.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const FICHIER_EMPREINTES = path.join(RACINE, 'docs', 'suivi_rome', 'empreintes_ROME.json');

// Comparaison pure (testée sans fichier) : ancien = contenu d'empreintes_ROME.json ; nouveau = { codes: { CODE: { libelle, empreinte, appellations } } } ;
// codesDetailles = ensemble des codes ROME qui ont une fiche écrite à la main.
function comparer(ancien, nouveau, codesDetailles) {
  const detailles = codesDetailles || new Set();
  const vieux = ancien.codes || {}, neufs = nouveau.codes || {};
  const r = { nouveaux: [], supprimes: [], intituleChange: [], contenuChange: [], appellationsChangees: [], inchanges: 0 };
  Object.keys(neufs).sort().forEach((c) => {
    const n = neufs[c], v = vieux[c];
    if (!v) { r.nouveaux.push({ code: c, libelle: n.libelle }); return; }
    const aLaMain = detailles.has(c);
    if (v.libelle !== n.libelle) { r.intituleChange.push({ code: c, avant: v.libelle, apres: n.libelle, aLaMain }); }
    if (v.empreinte !== n.empreinte) { r.contenuChange.push({ code: c, libelle: n.libelle, aLaMain }); }
    else if (v.libelle === n.libelle) { r.inchanges++; }
    if (v.appellations !== n.appellations) { r.appellationsChangees.push({ code: c, libelle: n.libelle, avant: v.appellations, apres: n.appellations }); }
  });
  Object.keys(vieux).sort().forEach((c) => { if (!neufs[c]) { r.supprimes.push({ code: c, libelle: vieux[c].libelle, aLaMain: detailles.has(c) }); } });
  return r;
}

function rapportTexte(r, infos) {
  const i = infos || {};
  const aRelire = r.contenuChange.filter((x) => x.aLaMain).concat(r.intituleChange.filter((x) => x.aLaMain && !r.contenuChange.some((y) => y.code === x.code)).map((x) => ({ code: x.code, libelle: x.apres })));
  const L = [];
  L.push('# Veille du ROME : rapport d\'écarts');
  L.push('');
  L.push('- Version précédente : ' + (i.versionAvant || []).join(' | '));
  L.push('- Nouvelle version : ' + (i.versionApres || []).join(' | '));
  L.push('- Date du rapport : ' + (i.date || ''));
  L.push('');
  L.push('| Écart | Nombre |');
  L.push('|---|---|');
  L.push('| Codes nouveaux | ' + r.nouveaux.length + ' |');
  L.push('| Codes supprimés | ' + r.supprimes.length + ' |');
  L.push('| Intitulés changés | ' + r.intituleChange.length + ' |');
  L.push('| Contenu changé (compétences, savoirs, contextes, appellations) | ' + r.contenuChange.length + ' |');
  L.push('| Nombre d\'appellations changé | ' + r.appellationsChangees.length + ' |');
  L.push('| Inchangés | ' + r.inchanges + ' |');
  L.push('');
  L.push('## À relire par Denis : fiches écrites à la main dont la fiche du ROME a bougé (' + aRelire.length + ')');
  L.push('');
  L.push(aRelire.length ? aRelire.map((x) => '- ' + x.code + ' ' + x.libelle).join('\n') : 'Aucune.');
  L.push('');
  L.push('## Codes supprimés du ROME (' + r.supprimes.length + ')');
  L.push('');
  L.push(r.supprimes.length ? r.supprimes.map((x) => '- ' + x.code + ' ' + x.libelle + (x.aLaMain ? ' **(fiche écrite à la main : à décider)**' : '')).join('\n') : 'Aucun.');
  L.push('');
  L.push('## Codes nouveaux (' + r.nouveaux.length + ') : une fiche sera générée, l\'enrichissement à la main vient ensuite');
  L.push('');
  L.push(r.nouveaux.length ? r.nouveaux.map((x) => '- ' + x.code + ' ' + x.libelle).join('\n') : 'Aucun.');
  L.push('');
  L.push('## Intitulés changés (' + r.intituleChange.length + ')');
  L.push('');
  L.push(r.intituleChange.length ? r.intituleChange.map((x) => '- ' + x.code + ' : « ' + x.avant + ' » devient « ' + x.apres + ' »' + (x.aLaMain ? ' (fiche écrite à la main)' : '')).join('\n') : 'Aucun.');
  L.push('');
  L.push('## Contenu changé, fiches générées (' + r.contenuChange.filter((x) => !x.aLaMain).length + ') : se mettent à jour en régénérant');
  L.push('');
  L.push('Liste non détaillée ici (régénérer `data/metiersRome.js` suffit).');
  L.push('');
  L.push('## Appellations en nombre différent (' + r.appellationsChangees.length + ') : à regarder pour les synonymes de la recherche');
  L.push('');
  L.push(r.appellationsChangees.length ? r.appellationsChangees.slice(0, 200).map((x) => '- ' + x.code + ' ' + x.libelle + ' : ' + x.avant + ' devient ' + x.apres).join('\n') + (r.appellationsChangees.length > 200 ? '\n- ... et ' + (r.appellationsChangees.length - 200) + ' autres' : '') : 'Aucune.');
  L.push('');
  return L.join('\n');
}

module.exports = { comparer, rapportTexte };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dossier = args.filter((a) => a.indexOf('--') !== 0)[0];
  if (!dossier) { console.error('Usage : node scripts/importRome/comparerRome.js <dossier du nouveau paquet CSV> [--ecrire]'); process.exit(1); }
  const { chargerRome, empreinte } = require('./lireRome.js');
  const ancien = JSON.parse(fs.readFileSync(FICHIER_EMPREINTES, 'utf8'));
  const rome = chargerRome(dossier);
  const nouveau = { codes: {} };
  Object.keys(rome.codes).forEach((c) => { nouveau.codes[c] = { libelle: rome.codes[c].libelle, empreinte: empreinte(rome.codes[c]), appellations: rome.codes[c].appellations.length }; });
  const detailles = new Set(require(path.join(RACINE, 'data', 'metiers.js')).baseMetiersDetaillees.map((m) => m.rome));
  const date = new Date().toISOString().slice(0, 10);
  const texte = rapportTexte(comparer(ancien, nouveau, detailles), { versionAvant: ancien.version, versionApres: rome.version, date });
  console.log(texte);
  if (args.indexOf('--ecrire') !== -1) {
    const sortie = path.join(RACINE, 'docs', 'suivi_rome', 'RAPPORT_VEILLE_' + date + '.md');
    fs.writeFileSync(sortie, texte);
    console.log('Rapport écrit : ' + path.relative(RACINE, sortie));
  }
}
