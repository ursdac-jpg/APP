'use strict';
// Découverte des chaînes présentes sur le territoire (consigne 303) : LECTURE SEULE, n'écrit rien dans le module ni dans les sas.
// Pour chaque commune de la Dordogne et de la Haute-Vienne, liste les établissements ouverts du commerce (section G), de l'hébergement et de la restauration (I) et de la coiffure
// et des soins de beauté (96.02), les regroupe par enseigne déclarée dans le registre des entreprises (Sirene), et signale les enseignes présentes dans plusieurs communes.
// C'est la méthode employée à la main sur Montpon-Ménestérol (13 chaînes trouvées), appliquée à toutes les communes.
// Résultat : un rapport texte et un fichier JSON dans le dossier de cache. Denis valide ensuite chaque enseigne une fois (site, page de recrutement) ; ses magasins viennent du relevé.
//
// Usage : node scripts/decouvrirEnseignesSirene.js [--cache dossier] [--sections G,I,S] [--limite N] [--min-communes 2]
const fs = require('fs');
const os = require('os');
const path = require('path');
const L = require('../modules/mon-territoire/logique.js');
const G = require('./genererMagasinsSirene.js');
const { ENSEIGNES } = require('./magasinsSireneConfig.js');

const norm = (s) => L.mtNormaliser(s);
// Filtres de requête par section ; la coiffure et la beauté sont une classe de la section S.
const FILTRES = { G: 'section_activite_principale=G', I: 'section_activite_principale=I', S: 'activite_principale=96.02A,96.02B' };

// Les établissements ouverts d'une réponse, avec leur marque déclarée (première enseigne, sinon nom commercial). Sans marque déclarée : écartés (indépendants).
function marques(reponse, communes) {
  const sortie = [];
  (reponse.results || []).forEach((ent) => {
    const lots = (ent.matching_etablissements || []).slice();
    if (ent.siege) { lots.push(ent.siege); }
    const vus = {};
    lots.forEach((e) => {
      if (!e || vus[e.siret] || !communes[e.commune] || e.etat_administratif !== 'A' || e.date_fermeture) { return; }
      vus[e.siret] = true;
      if (/non[- ]?diffusible/i.test(String(ent.nom_complet || ''))) { return; }
      const marque = (e.liste_enseignes && e.liste_enseignes[0]) || e.nom_commercial || '';
      if (!marque) { return; }
      sortie.push({ marque: marque, cle: norm(marque), siret: e.siret, commune: communes[e.commune], adresse: e.adresse, naf: e.activite_principale, societe: ent.nom_complet, nbEtablissements: ent.nombre_etablissements_ouverts || 0, personne: String(ent.nature_juridique || '') === '1000' });
    });
  });
  return sortie;
}

// Regroupe par marque : une marque est une chaîne candidate quand elle apparaît dans au moins N communes différentes.
function regrouper(lignes) {
  const groupes = {};
  lignes.forEach((l) => {
    if (l.personne) { return; }
    const g = (groupes[l.cle] = groupes[l.cle] || { cle: l.cle, noms: {}, communes: {}, sirets: {}, societes: {}, naf: {}, exemples: [], maxEtab: 0 });
    g.noms[l.marque] = (g.noms[l.marque] || 0) + 1;
    g.communes[l.commune] = true; g.sirets[l.siret] = true; g.societes[l.societe] = true;
    g.naf[l.naf] = (g.naf[l.naf] || 0) + 1;
    g.maxEtab = Math.max(g.maxEtab, l.nbEtablissements);
    if (g.exemples.length < 3) { g.exemples.push(l.commune + ' : ' + l.adresse); }
  });
  return groupes;
}

// Où en est cette marque ? « configuree » (relevée par le script de magasins), « registre » (une fiche porte ce nom), « sas » (fiche proposée), sinon « nouvelle ».
function situation(cle, registre, lignesSas) {
  for (const id of Object.keys(ENSEIGNES)) { if (ENSEIGNES[id].alias.some((a) => cle.indexOf(norm(a)) !== -1 && norm(a).length >= 4)) { return 'configuree'; } }
  const contient = (texte) => { const t = ' ' + norm(texte) + ' '; return t.indexOf(' ' + cle + ' ') !== -1 || (cle.length >= 6 && norm(texte).indexOf(cle) !== -1); };
  if (Object.values(registre).some((e) => contient(e.nom))) { return 'registre'; }
  if (lignesSas.some((nom) => contient(nom))) { return 'sas'; }
  return 'nouvelle';
}

async function main() {
  const args = process.argv.slice(2);
  const val = (nom) => { const k = args.indexOf(nom); return k >= 0 ? args[k + 1] : null; };
  const dossier = val('--cache') || path.join(os.tmpdir(), 'magasins-sirene');
  const sections = (val('--sections') || 'G,I,S').split(',');
  const limite = val('--limite') ? Number(val('--limite')) : null;
  const minCommunes = val('--min-communes') ? Number(val('--min-communes')) : 2;
  const communes = G.lireCommunes();
  const seuls = val('--communes') ? val('--communes').split(',') : null;
  const codes = Object.keys(communes).filter((c) => !seuls || seuls.indexOf(c) !== -1).slice(0, limite || undefined);
  const registre = G.lireRegistre();
  const sas = fs.readFileSync(path.join(__dirname, '..', 'outils', 'sas', 'employeurs.sas.txt'), 'utf8').split(/\r?\n/).filter((l) => l && l[0] !== '#').map((l) => l.split(' | ')[2] || '');
  const cache = G.ouvrirCache(dossier);
  const lignes = [];
  for (const s of sections) {
    console.log('Section', s, ':', codes.length, 'communes');
    await G.enParallele(codes, 3, async (code) => {
      const reps = await G.pagesDe(cache, 'code_commune=' + code + '&' + FILTRES[s] + '&etat_administratif=A&per_page=25', 300);
      reps.forEach((r) => marques(r, communes).forEach((m) => lignes.push(m)));
    });
  }
  cache.fermer();
  // Une même établissement peut sortir de deux sections : un seul compte par SIRET.
  const vus = {}; const uniques = lignes.filter((l) => (vus[l.siret] ? false : (vus[l.siret] = true)));
  const groupes = regrouper(uniques);
  const liste = Object.values(groupes).map((g) => {
    const nomsTries = Object.keys(g.noms).sort((a, b) => g.noms[b] - g.noms[a]);
    return { marque: nomsTries[0], nbCommunes: Object.keys(g.communes).length, nbEtablissements: Object.keys(g.sirets).length, naf: Object.keys(g.naf).sort((a, b) => g.naf[b] - g.naf[a])[0],
      societes: Object.keys(g.societes).slice(0, 2).join(' / '), exemples: g.exemples, communes: Object.keys(g.communes), situation: situation(g.cle, registre, sas), maxEtab: g.maxEtab };
  }).filter((g) => g.nbCommunes >= minCommunes || g.maxEtab >= 20).sort((a, b) => (b.nbCommunes - a.nbCommunes) || (b.maxEtab - a.maxEtab));
  const nouvelles = liste.filter((g) => g.situation === 'nouvelle');
  const rapport = ['Découverte des chaînes : ' + uniques.length + ' établissements avec une marque déclarée, ' + liste.length + ' marques présentes dans ' + minCommunes + ' communes ou plus (ou dont la société a 20 établissements ouverts ou plus), dont ' + nouvelles.length + ' nouvelles.', ''];
  ['nouvelle', 'sas', 'registre', 'configuree'].forEach((s) => {
    const sel = liste.filter((g) => g.situation === s);
    rapport.push('=== ' + s.toUpperCase() + ' (' + sel.length + ') ===');
    sel.forEach((g) => rapport.push(g.marque + ' | ' + g.nbCommunes + ' communes | ' + g.nbEtablissements + ' établissements | NAF ' + g.naf + ' | société : ' + g.societes + ' (' + g.maxEtab + ' établissements ouverts au total) | ex. ' + g.exemples[0]));
    rapport.push('');
  });
  fs.writeFileSync(path.join(dossier, 'decouverte.txt'), rapport.join('\n'));
  fs.writeFileSync(path.join(dossier, 'decouverte.json'), JSON.stringify(liste, null, 1));
  console.log(rapport.slice(0, 1).join('\n'));
  console.log('Rapport :', path.join(dossier, 'decouverte.txt'));
}

module.exports = { marques, regrouper, situation };
if (require.main === module) { main().catch((e) => { console.error('ERREUR', e.message); process.exit(1); }); }
