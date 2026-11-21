'use strict';
/* ============================================================
   scripts/importRome/genererMetiersRome.js
   Génère data/metiersRome.js : une fiche « niveau rome » pour chaque code du ROME 4.0 qui n'a pas déjà une fiche détaillée dans data/metiers.js
   (consigne 263, plan : docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md). Écrit aussi :
   - docs/ECHANTILLON_METIERS_ROME_2026-11-12.md : 30 fiches tirées au sort (au moins une par secteur) pour que Denis juge si les listes décrivent bien le métier ;
   - docs/suivi_rome/empreintes_ROME.json : l'empreinte de chaque code, point de départ de la veille de tous les six mois.
   Usage : node scripts/importRome/genererMetiersRome.js <dossier des CSV ROME>
   Aucune fiche n'est écrite à la main ici : data/metiersRome.js ne se modifie JAMAIS à la main (corriger les tables, puis régénérer).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chargerRome, empreinte, libelleSavoirEtre } = require('./lireRome.js');
const T = require('./tablesRome.js');
const TC = require('./tablesCompetences.js');
const { niveauAcces } = require('./niveauxAcces.js');

const RACINE = path.join(__dirname, '..', '..');
const dossierRome = process.argv[2];
if (!dossierRome) { console.error('Usage : node scripts/importRome/genererMetiersRome.js <dossier CSV ROME>'); process.exit(1); }

// ---- Catalogues et vocabulaire de l'application (lus, jamais recopiés)
const ctx = {}; vm.createContext(ctx);
['actionsProfessionnelles', 'personnesMaterielsLieux', 'environnementsTravail'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(RACINE, 'data', f + '.js'), 'utf8') + ';', ctx));
const catalogues = vm.runInContext('({ actions: CATALOGUE_ACTIONS_PRO, pml: CATALOGUE_PERSONNES_MATERIELS_LIEUX, lieux: CATALOGUE_ENVIRONNEMENTS_TRAVAIL })', ctx);
const items = {}; // id -> { id, label, savoirFaire, savoirEtre, famille }
['actions', 'pml', 'lieux'].forEach((cle) => catalogues[cle].forEach((g) => g.items.forEach((i) => { items[cle + ':' + i.id] = Object.assign({ famille: g.categorie }, i); })));
const idsActions = new Set(catalogues.actions.reduce((a, g) => a.concat(g.items.map((i) => i.id)), []));
const idsPml = new Set(catalogues.pml.reduce((a, g) => a.concat(g.items.map((i) => i.id)), []));
const idsLieux = new Set(catalogues.lieux.reduce((a, g) => a.concat(g.items.map((i) => i.id)), []));
const itemPml = (id) => items['pml:' + id];
const competencesData = require(path.join(RACINE, 'data', 'competences.js'));
const metiersData = require(path.join(RACINE, 'data', 'metiers.js'));
const motsSavoirFaire = competencesData.categorieCompetence;
const SECTEURS = metiersData.SECTEURS_APP.map((s) => s.libelle);

// ---- Contrôle des tables : chaque identifiant cité doit exister
const erreursTables = [];
Object.keys(T.SECTEUR_CORRIGE_PAR_CODE).forEach((c) => { if (SECTEURS.indexOf(T.SECTEUR_CORRIGE_PAR_CODE[c]) === -1) { erreursTables.push('SECTEUR_CORRIGE_PAR_CODE : ' + c); } });
Object.keys(T.PUBLICS).forEach((id) => { if (!idsPml.has(id)) { erreursTables.push('PUBLICS : ' + id); } });
Object.keys(T.LIEUX).forEach((id) => { if (!idsLieux.has(id)) { erreursTables.push('LIEUX : ' + id); } });
Object.keys(T.MATIERES).forEach((k) => T.MATIERES[k].forEach((id) => { if (!idsPml.has(id)) { erreursTables.push('MATIERES : ' + id); } }));
T.MOTS_ANIMAUX.forEach((m) => { if (!idsPml.has(m[0])) { erreursTables.push('MOTS_ANIMAUX : ' + m[0]); } });
Object.keys(T.SAVOIR_ETRE_ACTIONS).forEach((k) => T.SAVOIR_ETRE_ACTIONS[k].forEach((id) => { if (!idsActions.has(id)) { erreursTables.push('SAVOIR_ETRE_ACTIONS : ' + id); } }));
Object.keys(T.OBJECTIFS_ACTIVITES_TOUJOURS).forEach((k) => T.OBJECTIFS_ACTIVITES_TOUJOURS[k].forEach((id) => { if (!idsPml.has(id)) { erreursTables.push('OBJECTIFS_ACTIVITES_TOUJOURS : ' + id); } }));
['vegetaux', 'produits_dangereux', 'installations_electriques'].forEach((id) => { if (!idsPml.has(id)) { erreursTables.push('matière : ' + id); } });
Object.keys(T.OBJECTIFS_ACTIONS).forEach((o) => T.OBJECTIFS_ACTIONS[o].forEach((id) => { if (!idsActions.has(id)) { erreursTables.push('OBJECTIFS_ACTIONS ' + o + ' : ' + id); } }));
T.MACROS_ACTIONS.forEach((m) => { if (!idsActions.has(m[1])) { erreursTables.push('MACROS_ACTIONS : ' + m[1]); } });
Object.keys(T.SAVOIR_ETRE).forEach((k) => T.SAVOIR_ETRE[k].forEach((t) => { if (!motsSavoirFaire[t]) { erreursTables.push('SAVOIR_ETRE : ' + t); } }));
if (erreursTables.length) { console.error('Tables de correspondance invalides :\n - ' + erreursTables.join('\n - ')); process.exit(1); }

const inverse = (table) => { const m = {}; Object.keys(table).forEach((id) => table[id].forEach((t) => { m[t] = id; })); return m; };
const publicDe = inverse(T.PUBLICS), lieuDe = inverse(T.LIEUX);

// ---- Secteur de chaque code : domaine le plus fréquent de ses appellations dans le répertoire de l'application
const rep = {}; vm.createContext(rep);
vm.runInContext(fs.readFileSync(path.join(RACINE, 'data', 'repertoireRome.js'), 'utf8') + ';this.R=REPERTOIRE_ROME;', rep);
const secteurParCode = {};
{
  const comptes = {};
  rep.R.metiers.forEach((l) => { const c = (comptes[l[1]] = comptes[l[1]] || {}); c[l[2]] = (c[l[2]] || 0) + 1; });
  Object.keys(comptes).forEach((code) => { const cles = Object.keys(comptes[code]).sort((a, b) => comptes[code][b] - comptes[code][a]); secteurParCode[code] = rep.R.domaines[cles[0]]; });
}

// ---- Règles de texte
const TITRE = /\b(CQP|SSIAP|SST|CACES|BAFA|BAFD|BNSSA|PSC1|AFGSU|FIMO|FCO|Certiphyto|permis\s+[a-e]\b|habilitation|dipl[oô]me|titre professionnel|carte professionnelle|CAP|BEP|BTS|DUT|licence|master|bac pro|bac|brevet professionnel|mention complémentaire)\b/i; // même règle que tests/metiersSavoirsSansTitres.test.js, élargie
// « Conducteur / Conductrice d'engins » donne « Conducteur d'engins » ; « Economiste financier / Economiste financière » donne « Economiste financier » ; « Chef boucher / bouchère » donne « Chef boucher »
function nomMasculin(libelle) {
  const parties = libelle.split(' / ');
  if (parties.length !== 2) { return libelle.trim(); }
  const g = parties[0].trim().split(/\s+/), f = parties[1].trim().split(/\s+/);
  let p = 0;
  while (p < g.length && p < f.length && g[p] === f[p]) { p++; }
  return g.concat(f.slice(p + (g.length - p))).join(' ');
}
// Le fichier du ROME écrit certains intitulés SANS accent sur la majuscule (« Eleveur », « Educateur »...), alors que le répertoire des appellations (data/repertoireRome.js) les écrit correctement.
// Correction de la forme, jamais du sens (défaut trouvé le 18/11/2026, tâche A4a de « Ma synthèse ») : chaque mot de cette table est remis avec son accent dans le nom de la fiche.
// Cas de l'accompagnant éducatif et social (décision Denis 19/11/2026) : le code K1306 porte, une fois accentué, le MÊME nom que la fiche à la main « aes » (code K1301) ; il devient donc un alias de « aes » (règle commune plus bas), comme F1619 pour « couvreur ».
// tests/nomsMetiersAccents.test.js vérifie qu'aucun nom de la base ne s'écarte du répertoire par les seuls accents.
const MOTS_A_ACCENTUER = { "d'eleves": "d'élèves", evenementiel: 'événementiel', Elagueur: 'Élagueur', Eleveur: 'Éleveur', Educateur: 'Éducateur', Educatif: 'Éducatif', Etalagiste: 'Étalagiste', Editeur: 'Éditeur', Economiste: 'Économiste', Echafaudeur: 'Échafaudeur', Etancheur: 'Étancheur', Electricien: 'Électricien', Econome: 'Économe', Ecailler: 'Écailler', Electronicien: 'Électronicien', 'Electromécanicien': 'Électromécanicien', Ecoutant: 'Écoutant', Ecrivain: 'Écrivain', "l'Etat": "l'État", Equipier: 'Équipier', "l'Education": "l'Éducation", 'Etrangère': 'Étrangère', Egoutier: 'Égoutier', Eclairagiste: 'Éclairagiste', Evaluateur: 'Évaluateur', 'Eclusier-barragiste': 'Éclusier-barragiste' };
function corrigerAccentsNom(nom) {
  return nom.split(/(\s+)/).map((mot) => {
    const nu = mot.replace(/^\(+|[),]+$/g, '');
    return MOTS_A_ACCENTUER[nu] ? mot.replace(nu, MOTS_A_ACCENTUER[nu]) : mot;
  }).join('');
}
const dedoublonner = (a) => a.filter((x, i) => a.indexOf(x) === i);
const classer = (compte, ordre) => Object.keys(compte).sort((a, b) => (compte[b] - compte[a]) || (ordre.indexOf(a) - ordre.indexOf(b)));

const MINIMUM_COMPETENCES = 3; // une fiche à moins de 3 savoir-faire ou 3 savoir-être est complétée (voir plus bas)
// ---- PHASE 4 : compétences du ROME traduites en savoir-faire / savoir-être / savoirs de l'application (tables : tablesCompetences.js)
// Contrôle des tables : chaque mot cité existe dans le vocabulaire, du bon côté (savoir-faire ou savoir-être)
{
  const erreurs = [];
  const verifier = (nom, ligne) => ['sf', 'se'].forEach((x) => (ligne[x] || []).forEach((m) => {
    if (!motsSavoirFaire[m]) { erreurs.push(nom + ' : mot absent de data/competences.js : ' + m); }
    else if ((x === 'se') !== (motsSavoirFaire[m] === 'Savoir-etre')) { erreurs.push(nom + ' : « ' + m + ' » rangé du mauvais côté'); }
  }));
  Object.keys(TC.OBJECTIFS).forEach((o) => verifier('OBJECTIFS ' + o, TC.OBJECTIFS[o]));
  TC.MACROS.forEach((r, i) => verifier('MACROS ' + i + ' ' + r[0], r[1]));
  if (erreurs.length) { console.error('Tables de compétences invalides :\n - ' + erreurs.join('\n - ')); process.exit(1); }
}
const { traduireCompetence, calculerFrequences, motsDuCode } = require('./traducteurCompetences.js'); // calcul partagé (aussi utilisé par completerFichesMain.js)
// ---- Déduction des listes d'une fiche
function deduire(f, secteur) {
  // Actions : poids = nombre de compétences du code qui relèvent d'un objectif relié à l'action, ou dont la macro-compétence nomme l'action
  const pa = {}, ordreA = [];
  const compter = (id) => { if (!(id in pa)) { pa[id] = 0; ordreA.push(id); } pa[id]++; };
  const pg = {}, ordreG = []; // actions venues d'un objectif trop général (voir SEUIL_OBJECTIF_GENERAL)
  const compterGeneral = (id) => { if (!(id in pg)) { pg[id] = 0; ordreG.push(id); } pg[id]++; };
  const pv = {}; // actions lues dans le verbe de la compétence (rédiger, installer, monter, découper, imaginer)
  f.competences.forEach((c) => {
    (T.OBJECTIFS_ACTIONS[c.objectif] || []).forEach((id) => {
      if (c.objectif === '1E4' && T.METIERS_SANS_SOINS_ANIMAUX.test(f.libelle)) { return; }
      if (FREQ_OBJECTIF[c.objectif] / NB_CODES > T.SEUIL_OBJECTIF_GENERAL) { compterGeneral(id); } else { compter(id); }
    });
    T.MACROS_ACTIONS.forEach((r) => { if (r[0].test(c.macro)) { compter(r[1]); } });
    T.VERBES_ACTIONS.forEach((r) => { if (r[0].test(c.libelle)) { pv[r[1]] = (pv[r[1]] || 0) + 1; } });
  });
  f.savoirEtre.forEach((l) => (T.SAVOIR_ETRE_ACTIONS[l] || []).forEach((id) => { compter(id); compter(id); }));
  // Les actions d'objectifs trop généraux : un demi-point sur une action déjà précisée ; seules, elles ne servent que s'il n'y a rien d'autre
  if (!ordreA.length) { ordreG.forEach((id) => { pa[id] = pg[id]; ordreA.push(id); }); }
  else { ordreG.forEach((id) => { if (id in pa) { pa[id] += pg[id] * T.POIDS_OBJECTIF_GENERAL; } }); }
  const classees = classer(pa, ordreA);
  const seuil = Math.max(T.SEUIL_ACTION_MIN, T.SEUIL_ACTION_PART * (classees.length ? pa[classees[0]] : 0)); // une action doit peser au moins 2 compétences et 30 % de la première
  let actions = classees.filter((id) => pa[id] >= seuil).slice(0, T.PLAFONDS.actions);
  if (!actions.length) { actions = classer(pa, ordreA).slice(0, 1); }
  // Un verbe précis (installer, monter...) se noie dans « Construire » : il compte dès 2 compétences, sans le seuil de 30 % (dès 3, il prend la dernière place si la liste est pleine)
  Object.keys(pv).sort((a, b) => pv[b] - pv[a]).forEach((id) => { if (pv[id] < 2 || actions.indexOf(id) !== -1) { return; }
    if (actions.length < T.PLAFONDS.actions) { actions.push(id); }
    else if (pv[id] >= 3) { actions[actions.length - 1] = id; } // plus de place : un verbe qui revient 3 fois prend la dernière place (l'action la plus faible)
  });

  // Matières (avec quoi)
  const pm = {}, ordreM = [];
  const ajouterMatiere = (id) => { if (!(id in pm)) { pm[id] = 0; ordreM.push(id); } pm[id]++; };
  f.savoirs.forEach((s) => {
    const cle = s.categorie + ' > ' + s.sousCategorie;
    (T.MATIERES[cle] || []).forEach(ajouterMatiere);
    if (cle === 'Produits, outils et matières > Animaux, végétaux') {
      if (T.MOTS_VEGETAUX.test(s.libelle)) { ajouterMatiere('vegetaux'); }
      else { const a = T.MOTS_ANIMAUX.filter((m) => m[1].test(s.libelle))[0]; if (a) { ajouterMatiere(a[0]); } }
    }
    if (cle === 'Produits, outils et matières > Outils, machines, équipement matériel' && T.MOTS_APPAREILS_NUMERIQUES.test(s.libelle)) { ajouterMatiere('appareils_numeriques'); }
    // Produits dangereux et installations électriques : seulement pour un savoir de technique, de domaine ou de matière (jamais une simple réglementation)
    if (s.categorie !== 'Normes et procédés' && s.categorie !== 'Certifications et habilitations') {
      if (T.MOTS_PRODUITS_DANGEREUX.test(s.libelle)) { ajouterMatiere('produits_dangereux'); }
      if (T.MOTS_INSTALLATIONS_ELECTRIQUES.test(s.libelle)) { ajouterMatiere('installations_electriques'); }
    }
  });
  const matieres = classer(pm, ordreM).filter((id) => pm[id] >= (T.MATIERES_GENERALES.indexOf(id) !== -1 ? T.MIN_SAVOIRS_MATIERE_GENERALE : 1)).slice(0, T.PLAFONDS.matieres);
  const publics = dedoublonner(f.contextes.map((c) => publicDe[c.libelle]).filter(Boolean)).slice(0, T.PLAFONDS.publics);
  let lieux = dedoublonner(f.contextes.map((c) => lieuDe[c.libelle]).filter(Boolean)).filter((id) => !T.LIEUX_SEULEMENT_DANS_SECTEUR[id] || T.LIEUX_SEULEMENT_DANS_SECTEUR[id] === secteur).slice(0, T.PLAFONDS.lieux);

  // COMBLER LES « RIEN » : ce que le ROME ne dit pas, on le déduit des objectifs de compétences (règles de tablesRome.js)
  const poidsObjectif = {};
  f.competences.forEach((c) => { poidsObjectif[c.objectif] = (poidsObjectif[c.objectif] || 0) + 1; });
  const objectifRetenu = (o) => poidsObjectif[o] >= (T.OBJECTIFS_SANS_SEUIL.indexOf(o) !== -1 ? 1 : T.SEUIL_OBJECTIF_IMPLICITE);
  const objectifsTries = Object.keys(poidsObjectif).sort((a, b) => poidsObjectif[b] - poidsObjectif[a]).filter(objectifRetenu);
  const texteMetier = [f.libelle].concat(f.appellations.map((a) => a.libelle), f.competences.map((c) => c.libelle), f.savoirs.map((s) => s.libelle)).join(' ');
  const deja = new Set(matieres.concat(publics));
  const implicites = [];
  const ajouterImplicite = (id) => { if (!deja.has(id) && implicites.indexOf(id) === -1) { implicites.push(id); } };
  // Animaux et végétaux : l'objectif « soigner les animaux » (1E4) ou « cultiver » (3B4) nomme l'objet, on cherche lequel dans le texte de la fiche
  const animalDuTexte = () => { const motifs = [['chevaux', /équin|équid|cheva(l|ux|ls)|poney|équitation/i]].concat(T.MOTS_ANIMAUX), titre = f.libelle + ' ' + f.appellations.map((x) => x.libelle).join(' '); const a = motifs.filter((m) => m[1].test(titre))[0] || motifs.filter((m) => m[1].test(texteMetier))[0]; return a ? a[0] : null; };
  const animalOuNull = animalDuTexte();
  if (poidsObjectif['1E4'] && !(pm.animaux_compagnie || pm.chevaux || pm.elevage_ferme || pm.abeilles || pm.soins_veterinaires)) { ajouterImplicite(animalOuNull || 'animaux_compagnie'); }
  if (poidsObjectif['3B4'] && !pm.vegetaux) { if (animalOuNull && animalOuNull !== 'animaux_compagnie') { ajouterImplicite(animalOuNull); } else if (T.MOTS_VEGETAUX.test(texteMetier) || !animalOuNull) { ajouterImplicite('vegetaux'); } }
  Object.keys(poidsObjectif).forEach((o) => { if (poidsObjectif[o] >= 2) { (T.OBJECTIFS_ACTIVITES_TOUJOURS[o] || []).forEach(ajouterImplicite); } });
  const nbAvant = matieres.length + publics.length;
  if (nbAvant < 2) {
    f.contextes.forEach((c) => (T.CONDITIONS_VERS_ACTIVITES[c.libelle] || []).forEach(ajouterImplicite));
    objectifsTries.forEach((o) => (T.OBJECTIFS_ACTIVITES[o] || []).forEach(ajouterImplicite));
  }
  const activitesFinales = matieres.concat(publics).concat(implicites.slice(0, T.PLAFONDS.implicites + (poidsObjectif['1E4'] || poidsObjectif['3B4'] ? 1 : 0)));
  if (secteur === 'Agriculture, nature et espaces verts' && lieux.indexOf('espaces_verts') === -1 && T.MOTS_ESPACES_VERTS.test(f.libelle + ' ' + f.appellations.map((a) => a.libelle).join(' ')) && idsLieux.has('espaces_verts')) { lieux = ['espaces_verts'].concat(lieux).slice(0, T.PLAFONDS.lieux); }
  if (!lieux.length) {
    objectifsTries.forEach((o) => (T.OBJECTIFS_LIEUX[o] || []).forEach((id) => { if (lieux.indexOf(id) === -1 && idsLieux.has(id)) { lieux.push(id); } }));
    if (!lieux.length && T.LIEU_PAR_DEFAUT_DU_SECTEUR[secteur] && idsLieux.has(T.LIEU_PAR_DEFAUT_DU_SECTEUR[secteur])) { lieux.push(T.LIEU_PAR_DEFAUT_DU_SECTEUR[secteur]); }
    lieux = lieux.slice(0, T.PLAFONDS.lieux);
  }

  // Savoir-faire : ceux des choix retenus (actions et matières), les plus partagés d'abord
  const ps = {}, ordreS = [];
  actions.map((id) => items['actions:' + id]).concat(activitesFinales.map(itemPml)).filter(Boolean).forEach((it) => (it.savoirFaire || []).forEach((t) => { if (!(t in ps)) { ps[t] = 0; ordreS.push(t); } ps[t]++; }));
  const sfActions = classer(ps, ordreS).filter((t) => motsSavoirFaire[t]);
  // PHASE 4 : savoir-faire traduits des compétences du ROME (les plus pesantes d'abord) ; ceux des actions ne servent qu'à compléter jusqu'au minimum
  const sfTous = motsDuCode(f, 'sf'), nbMax = sfTous.length ? Math.max.apply(null, sfTous.map((x) => x.nb)) : 0;
  const sfRome = sfTous.filter((x) => x.nb >= Math.max(2, T.PLAFONDS.partMiniMot * nbMax)).map((x) => x.mot); // un mot qui ne pèse presque rien face au premier n'est pas retenu
  const savoirFaire = sfRome.slice(0, T.PLAFONDS.savoirFaire);
  sfActions.forEach((t) => { if (savoirFaire.length < MINIMUM_COMPETENCES && savoirFaire.indexOf(t) === -1) { savoirFaire.push(t); } });

  // Savoir-être : ceux que le ROME donne lui-même au métier d'abord, puis ceux traduits de ses compétences jusqu'au plafond
  const savoirEtre = dedoublonner([].concat.apply([], f.savoirEtre.map((l) => T.SAVOIR_ETRE[l] || []))).slice(0, T.PLAFONDS.savoirEtre);
  motsDuCode(f, 'se').filter((x) => x.nb >= 3).forEach((x) => { if (savoirEtre.length < T.PLAFONDS.savoirEtre && savoirEtre.indexOf(x.mot) === -1) { savoirEtre.push(x.mot); } });

  // Savoirs : techniques, normes, domaines d'expertise (jamais un titre, un diplôme, un permis ni une habilitation)
  const savoirs = [];
  T.CATEGORIES_SAVOIRS.forEach((cat) => f.savoirs.forEach((s) => {
    if (s.categorie !== cat || T.SOUS_CATEGORIES_SAVOIRS_EXCLUES.indexOf(s.categorie + ' > ' + s.sousCategorie) !== -1) { return; }
    if (TITRE.test(s.libelle) || s.libelle.length > 70 || savoirs.indexOf(s.libelle) !== -1) { return; }
    savoirs.push(s.libelle);
  }));
  // Connaissances traduites (langues étrangères) : seulement s'il reste de la place
  motsDuCode(f, 'sv').filter((x) => x.nb >= 3).forEach((x) => { if (savoirs.length < T.PLAFONDS.savoirs && savoirs.indexOf(x.mot) === -1) { savoirs.push(x.mot); } });
  return { activites: activitesFinales.slice(0, T.PLAFONDS.activites), actions, environnement: lieux, savoirFaire, savoirEtre, savoirs: savoirs.slice(0, T.PLAFONDS.savoirs) };
}

// ---- Génération
const rome = chargerRome(dossierRome);
calculerFrequences(rome);
// Part des codes du ROME qui portent chaque objectif (pour repérer les objectifs trop généraux, consigne 494)
const FREQ_OBJECTIF = {}; Object.keys(rome.codes).forEach((c) => { new Set(rome.codes[c].competences.map((x) => x.objectif)).forEach((o) => { FREQ_OBJECTIF[o] = (FREQ_OBJECTIF[o] || 0) + 1; }); });
const NB_CODES = Object.keys(rome.codes).length;
const codesDetailles = new Set(metiersData.baseMetiersDetaillees.map((m) => m.rome));
const fiches = [], ignores = [], sansSecteur = [], alias = {}, signatures = {};
Object.keys(rome.codes).sort().forEach((code) => {
  const f = rome.codes[code];
  if (codesDetailles.has(code)) {
    ignores.push(code);
    // Signature du ROME d'une fiche à la main : mêmes règles que pour une fiche générée, rangée à part (le classement garde la meilleure des deux signatures)
    const main = metiersData.baseMetiersDetaillees.filter((x) => x.rome === code)[0];
    signatures[code] = deduire(f, main.secteur);
    return;
  }
  const secteur = T.SECTEUR_CORRIGE_PAR_CODE[code] || secteurParCode[code];
  if (!secteur || SECTEURS.indexOf(secteur) === -1) { sansSecteur.push(code); }
  const nom = corrigerAccentsNom(nomMasculin(f.libelle));
  // Même nom qu'une fiche déjà présente (détaillée ou générée avant) : pas de seconde fiche du même nom, le code est noté en alias (la recherche par nom resterait ambiguë)
  const existante = metiersData.baseMetiersDetaillees.filter((m) => m.nom.toLowerCase() === nom.toLowerCase())[0] || fiches.filter((x) => x.nom.toLowerCase() === nom.toLowerCase())[0];
  if (existante) { alias[code] = existante.id; return; }
  fiches.push(Object.assign({ id: 'rome_' + code, nom, rome: code, secteur: secteur || '', niveau: 'rome' }, deduire(f, secteur)));
});
// COMPLÉTER LES LISTES TROP COURTES (retour de Denis, 12/11/2026) : le ROME ne donne pas toujours de savoir-être (5 codes) et nos actions n'ont pas toujours de savoir-faire
// (« Accompagner » n'en a aucun). Une fiche à moins de MINIMUM_COMPETENCES reçoit d'abord ceux des choix retenus (catalogue), puis les plus fréquents des métiers du même
// secteur (détaillés et générés). Ce sont des déductions de notre fait, jamais des données du ROME : à relire.
const frequences = {};
const compterSecteur = (m) => ['savoirFaire', 'savoirEtre'].forEach((champ) => (m[champ] || []).forEach((t) => {
  const k = m.secteur + '|' + champ; frequences[k] = frequences[k] || {}; frequences[k][t] = (frequences[k][t] || 0) + 1;
}));
metiersData.baseMetiersDetaillees.forEach(compterSecteur); fiches.forEach(compterSecteur);
const parFrequence = (secteur, champ) => { const c = frequences[secteur + '|' + champ] || {}; return Object.keys(c).sort((a, b) => c[b] - c[a]); };
const estSavoirEtre = (t) => competencesData.categorieCompetence[t] === 'Savoir-etre';
const completes = { savoirFaire: 0, savoirEtre: 0 };
fiches.forEach((m) => {
  const choix = m.actions.map((id) => items['actions:' + id]).concat(m.activites.map(itemPml)).filter(Boolean);
  [['savoirFaire', (t) => motsSavoirFaire[t]], ['savoirEtre', estSavoirEtre]].forEach((p) => {
    const champ = p[0];
    if (m[champ].length >= MINIMUM_COMPETENCES) { return; }
    const candidats = [].concat.apply([], choix.map((it) => it[champ] || [])).concat(parFrequence(m.secteur, champ));
    candidats.forEach((t) => { if (m[champ].length < MINIMUM_COMPETENCES && p[1](t) && m[champ].indexOf(t) === -1) { m[champ].push(t); } });
    completes[champ]++;
  });
});
console.log('Listes complétées (moins de ' + MINIMUM_COMPETENCES + ') : savoir-faire ' + completes.savoirFaire + ', savoir-être ' + completes.savoirEtre);
if (sansSecteur.length) { console.error('Codes sans secteur reconnu : ' + sansSecteur.join(', ')); process.exit(1); }

const dateJour = new Date().toISOString().slice(0, 10);
const entete = '/* ============================================================\n' +
  '   data/metiersRome.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
  '   Fiches « niveau rome » : un métier par code du ROME 4.0 (France Travail) qui n\'a pas de fiche détaillée dans data/metiers.js.\n' +
  '   Produit par : node scripts/importRome/genererMetiersRome.js <dossier CSV ROME>  (tables : scripts/importRome/tablesRome.js)\n' +
  '   ROME : ' + rome.version.join(' | ') + '. Généré le ' + dateJour + '. ' + fiches.length + ' fiches.\n' +
  '   Pour enrichir un métier à la main : le déplacer dans data/metiers.js (il disparaîtra de ce fichier à la prochaine génération).\n' +
  '   Plan : docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md. Pas encore branché à l\'application (phase 2).\n' +
  '   ============================================================ */\n';
const corps = 'var METIERS_ROME = [\n' + fiches.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n];\n\n' +
  '// Codes du ROME dont le nom est celui d\'une fiche déjà présente : code -> identifiant de cette fiche (pas de seconde fiche du même nom)\n' +
  'var METIERS_ROME_ALIAS = ' + JSON.stringify(alias) + ';\n\n' +
  'if (typeof module !== "undefined" && module.exports) { module.exports = { METIERS_ROME: METIERS_ROME, METIERS_ROME_ALIAS: METIERS_ROME_ALIAS }; }\n';
// Niveau d'accès de TOUS les codes du ROME (fiches à la main comprises) : code -> niveau (2 sans diplôme, 3 CAP, 4 Bac, 5 Bac+2, 6 Bac+3, 7 Bac+5, 8 doctorat). Code absent = le ROME ne dit rien (neutre). Règles : scripts/importRome/niveauxAcces.js
const niveauxAcces = {}; Object.keys(rome.codes).sort().forEach((c) => { const n = niveauAcces(rome.codes[c]); if (n !== null) { niveauxAcces[c] = n; } });
console.log('Niveaux d’accès : ' + Object.keys(niveauxAcces).length + ' codes sur ' + Object.keys(rome.codes).length);
const corpsSignatures = '// Listes déduites du ROME pour les codes qui ont une fiche à la main (deuxième signature de choix de la fiche).\nvar METIERS_ROME_SIGNATURES = ' + JSON.stringify(signatures) + ';\n\n';
const corpsNiveaux = '// Niveau d’accès par code du ROME (2 sans diplôme, 3 CAP/BEP, 4 Bac, 5 Bac+2, 6 Bac+3, 7 Bac+5, 8 doctorat). Absent = non précisé.\nvar METIERS_ROME_NIVEAUX = ' + JSON.stringify(niveauxAcces) + ';\n\n';
const corpsFinal = corps.replace('if (typeof module', corpsNiveaux + corpsSignatures + 'if (typeof module').replace('METIERS_ROME_ALIAS: METIERS_ROME_ALIAS }', 'METIERS_ROME_ALIAS: METIERS_ROME_ALIAS, METIERS_ROME_NIVEAUX: METIERS_ROME_NIVEAUX, METIERS_ROME_SIGNATURES: METIERS_ROME_SIGNATURES }');
fs.writeFileSync(path.join(RACINE, 'data', 'metiersRome.js'), entete + corpsFinal);

// ---- Conditions de travail (« À savoir sur ce métier ») : un fichier pour TOUS les codes du ROME, fiches détaillées comprises (data/conditionsRome.js)
const parCode = {};
Object.keys(rome.codes).sort().forEach((code) => {
  const libelles = rome.codes[code].contextes.map((c) => c.libelle);
  const ids = T.CONDITIONS_REGLES.filter((r) => libelles.some((l) => r[1].test(l))).map((r) => r[0]);
  if (ids.length) { parCode[code] = ids; }
});
const enteteCond = '/* ============================================================\n' +
  '   data/conditionsRome.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
  '   « À savoir sur ce métier » : conditions de travail du ROME (horaires, déplacements, charges, tenue, statuts) par code ROME, en phrases simples.\n' +
  '   Affichées seulement dans la fiche d\'un métier (js/app.js, ouvrirDescriptifMetier) ; jamais un critère de score, sauf pour départager des égalités à la demande de la personne (Ma synthèse, questions « Affiner mes métiers »).\n' +
  '   Produit par : node scripts/importRome/genererMetiersRome.js <dossier CSV ROME>  (règles : CONDITIONS_REGLES, scripts/importRome/tablesRome.js)\n' +
  '   ============================================================ */\n';
const libellesCond = {}; T.CONDITIONS_REGLES.forEach((r) => { libellesCond[r[0]] = r[2]; });
fs.writeFileSync(path.join(RACINE, 'data', 'conditionsRome.js'), enteteCond + 'var CONDITIONS_ROME = ' + JSON.stringify({ libelles: libellesCond, ordre: T.CONDITIONS_REGLES.map((r) => r[0]), parCode }) + ';\n\n' +
  'if (typeof module !== "undefined" && module.exports) { module.exports = { CONDITIONS_ROME: CONDITIONS_ROME }; }\n');
console.log('Conditions de travail : ' + Object.keys(parCode).length + ' codes sur ' + Object.keys(rome.codes).length);

// ---- Ce que fait le métier, en phrases simples (phase 4, étape 2) : les 489 macro-compétences du ROME réécrites (phrasesMacros.js), rattachées à chaque code ROME
// et classées par poids (nombre de compétences du code dans la macro). Un fichier pour TOUS les codes, fiches détaillées comprises (data/competencesRome.js).
{
  const { PHRASES_MACROS } = require('./phrasesMacros.js');
  const toutesLesCles = new Set(); Object.keys(rome.codes).forEach((c) => rome.codes[c].competences.forEach((x) => toutesLesCles.add(x.objectif + '|' + x.macro)));
  const cles = Array.from(toutesLesCles).sort();
  const sansPhrase = cles.filter((k) => !PHRASES_MACROS[k]);
  const phraseInutile = Object.keys(PHRASES_MACROS).filter((k) => !toutesLesCles.has(k));
  if (sansPhrase.length) { console.error('Macro-compétences du ROME sans phrase simple (à ajouter dans scripts/importRome/phrasesMacros.js) :\n - ' + sansPhrase.join('\n - ')); process.exit(1); }
  if (phraseInutile.length) { console.log('Phrases de phrasesMacros.js qui ne correspondent plus à aucune macro-compétence du ROME (à retirer ou à vérifier) : ' + phraseInutile.join(' ; ')); }
  const numero = {}; cles.forEach((k, i) => { numero[k] = i; });
  const parCodePhrases = {};
  Object.keys(rome.codes).sort().forEach((code) => {
    const n = {}; rome.codes[code].competences.forEach((x) => { const k = x.objectif + '|' + x.macro; n[k] = (n[k] || 0) + 1; });
    parCodePhrases[code] = Object.keys(n).sort((a, b) => (n[b] - n[a]) || (numero[a] - numero[b])).map((k) => numero[k]);
  });
  // Les compétences des CARTES de métiers (consigne 509, règle ajustée le 21/11/2026 après la feuille de Denis sur 30 métiers) : pour chaque code, les 6 phrases qui comptent le plus
  // d'activités du code, pondérées par leur RARETÉ dans toute la base (ln(nombre de codes / nombre de codes qui ont la phrase)). Les phrases très répandues (« s'adapter », « gérer les stocks »)
  // ne distinguent aucun métier et passent après. Le « cœur de métier » du ROME n'est plus prioritaire : il mettait en tête des compétences trompeuses (mesuré sur la feuille de Denis).
  const codesPar = {}; Object.keys(rome.codes).forEach((code) => { new Set(rome.codes[code].competences.map((x) => x.objectif + '|' + x.macro)).forEach((k) => { codesPar[k] = (codesPar[k] || 0) + 1; }); });
  const nbCodes = Object.keys(rome.codes).length, cartes = {};
  Object.keys(rome.codes).sort().forEach((code) => {
    const n = {}; rome.codes[code].competences.forEach((x) => { const k = x.objectif + '|' + x.macro; n[k] = (n[k] || 0) + 1; });
    const sc = (k) => n[k] * Math.log(nbCodes / codesPar[k]);
    const ids = Object.keys(n).sort((a, b) => (sc(b) - sc(a)) || (numero[a] - numero[b])).slice(0, 6).map((k) => numero[k]);
    if (ids.length) { cartes[code] = ids; }
  });
  const enteteCp = '/* ============================================================\n' +
    '   data/competencesRome.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
    '   « Ce que fait ce métier » : les 489 macro-compétences du ROME en phrases simples (scripts/importRome/phrasesMacros.js, écrit à la main) et, pour chaque code ROME,\n' +
    '   les numéros de ses phrases classés du plus au moins important. Rattaché à la fiche par le code ROME (fiche.rome), jamais une seconde base de métiers.\n' +
    '   phrases[i] = phrase simple ; objectifs[i] = objectif du ROME (83) de la phrase ; categories[i] = nom affiché de la catégorie de savoirs i ; parCode[code] = numéros de phrases ; cartes[code] = les 6 phrases montrées sur les cartes de métiers (rareté, voir genererMetiersRome.js).\n' +
    '   Produit par : node scripts/importRome/genererMetiersRome.js <dossier CSV ROME>\n' +
    '   ============================================================ */\n';
  fs.writeFileSync(path.join(RACINE, 'data', 'competencesRome.js'), enteteCp + 'var COMPETENCES_ROME = ' + JSON.stringify({ phrases: cles.map((k) => PHRASES_MACROS[k]), objectifs: cles.map((k) => k.split('|')[0]), categories: TC.CATEGORIES_SAVOIRS.map((c) => c[1]), parCode: parCodePhrases, cartes: cartes }) + ';\n\n' +
    'if (typeof module !== "undefined" && module.exports) { module.exports = { COMPETENCES_ROME: COMPETENCES_ROME }; }\n');
  console.log('Phrases simples : ' + cles.length + ' macro-compétences, ' + Object.keys(parCodePhrases).length + ' codes');
}

// ---- Fiche complète en langage courant (phase 4, suite ; demande de Denis : récupérer le plus possible, sans limite, pour que les prompts inventent le moins possible)
// Par code ROME, pour TOUS les codes : présentation, missions, accès au métier, emploi réglementé, TOUTES les compétences détaillées regroupées par macro-compétence
// (celles du « cœur de métier » d'abord), TOUS les savoirs par catégorie, métiers proches. Un fichier par lettre de domaine (data/rome/fiche_A.js ... fiche_N.js),
// chargé À LA DEMANDE quand une fiche est ouverte. Le mot « IA » n'est jamais affiché dans l'application : les rares textes qui l'emploient sont réécrits ici.
const CATEGORIES_SAVOIRS = TC.CATEGORIES_SAVOIRS; // [libellé du ROME, libellé affiché], voir tablesCompetences.js
const clesMacros = [];
{ const s = new Set(); Object.keys(rome.codes).forEach((c) => rome.codes[c].competences.forEach((x) => s.add(x.objectif + '|' + x.macro))); Array.from(s).sort().forEach((k) => clesMacros.push(k)); }
{
  // Réécriture du mot « IA » (jamais affiché) : du plus précis au plus général
  const IA = 'intelligence artificielle';
  const sansIA = (s) => s
    .replace(/\s*\(IA\)/g, '')
    .replace(/\s*\((IA-DSDEN|IPR-IA)\)/g, '')   // sigles d'inspecteurs d'académie (noms de métiers)
    .replace(/^IA Product Manager\b/, 'Product Manager en ' + IA)
    .replace(/\b(Développeuse|Développeur|Ingénieure|Ingénieur) IA\b/g, '$1 en ' + IA)
    .replace(/\bIA\/IAG\b/g, IA)
    .replace(/\bIA\/Data\b/g, IA + ' et Data')
    .replace(/\b([ld])’IA\b/g, (m, l) => (l === 'l' ? 'l’' + IA : 'd’' + IA))
    .replace(/\bdes IA\b/g, 'des intelligences artificielles')
    .replace(/\bpour IA\b/g, 'pour l’' + IA)
    .replace(/\b(systèmes|projets|modèles|solutions|outils|agent) IA\b/g, (m, n) => n + ' d’' + IA)
    .replace(/Spécialiste IA\b/g, 'Spécialiste de l’' + IA)
    .replace(/\ben IA\b/g, 'en ' + IA)
    .replace(/\bIA\b/g, IA);
  const net = (s) => sansIA(String(s).replace(/'/g, '’'));
  const numeroCategorie = {}; CATEGORIES_SAVOIRS.forEach((c, i) => { numeroCategorie[c[0]] = i; });
  const numeroMacro = {}; clesMacros.forEach((k, i) => { numeroMacro[k] = i; });
  // Phrases prêtes à cocher pour le CV (consigne 285) : missions à l'infinitif (champ mi) et activités remises en forme (champ k), voir phrasesCV.js
  const PCV = require('./phrasesCV.js');
  { const ms = [], as = []; Object.keys(rome.codes).forEach((c) => { const f = rome.codes[c]; f.missions.forEach((m) => ms.push(net(m))); f.competences.forEach((x) => as.push(net(x.libelle))); }); PCV.preparer(ms, as); }
  const parLettre = {};
  const compte = { intro: 0, missions: 0, reglementes: 0, competences: 0, savoirs: 0, proches: 0 };
  Object.keys(rome.codes).sort().forEach((code) => {
    const f = rome.codes[code];
    const e = {};
    if (f.intro) { e.d = net(f.intro); compte.intro++; }
    if (f.missions.length) { e.m = f.missions.map(net); compte.missions += e.m.length; }
    if (f.acces) { e.a = net(f.acces); }
    if (f.reglemente) { e.r = 1; compte.reglementes++; }
    // Compétences détaillées regroupées par macro-compétence : [numéro de la macro, nombre de « cœur de métier » (placés en premier), [libellés]], macros classées par poids
    const groupes = {};
    f.competences.forEach((c) => { const k = numeroMacro[c.objectif + '|' + c.macro]; (groupes[k] = groupes[k] || []).push(c); });
    e.k = Object.keys(groupes).sort((a, b) => (groupes[b].length - groupes[a].length) || (a - b)).map((k) => {
      const liste = groupes[k].slice().sort((a, b) => (b.coeur ? 1 : 0) - (a.coeur ? 1 : 0));
      compte.competences += liste.length;
      return [Number(k), liste.filter((c) => c.coeur).length, liste.map((c) => net(c.libelle))];
    });
    // Savoirs par catégorie : [numéro de catégorie, nombre de « cœur de métier », [libellés]]
    const gs = {};
    f.savoirs.forEach((s) => { const k = numeroCategorie[s.categorie]; if (k === undefined) { throw new Error('Catégorie de savoirs inconnue : ' + s.categorie); } (gs[k] = gs[k] || []).push(s); });
    e.s = Object.keys(gs).map(Number).sort((a, b) => a - b).map((k) => {
      const liste = gs[k].slice().sort((a, b) => (b.coeur ? 1 : 0) - (a.coeur ? 1 : 0));
      compte.savoirs += liste.length;
      return [k, liste.filter((s) => s.coeur).length, liste.map((s) => net(s.libelle))];
    });
    if (f.proches.length) { e.p = f.proches; compte.proches += f.proches.length; }
    const noms = f.appellations.filter((a) => !a.peuUsite).map((a) => net(a.libelle)).filter((x, i, l) => l.indexOf(x) === i);
    if (noms.length) { e.n = noms; }   // tous les autres noms usuels, les plus courants d'abord (13/11/2026 : plus de plafond à 8, la fiche en montre 8 puis un bouton)
    if (f.riasec) { e.ri = f.riasec; }   // lettres RIASEC du ROME : majeure puis mineure
    if (f.savoirEtre.length) { e.e = f.savoirEtre.map(libelleSavoirEtre); }   // savoir-être officiels du ROME (au plus 5), voir ajouterSavoirEtreFiches.js
    PCV.enrichirFiche(e);
    (parLettre[code[0]] = parLettre[code[0]] || {})[code] = e;
  });
  // Les lettres RIASEC (champ ri, par exemple « IA » pour Investigateur et Artistique) ne sont pas le mot « IA » : elles sont ignorées par ce contrôle, et jamais affichées accolées.
  const reste = JSON.stringify(parLettre).replace(/"ri":"[RIASEC]{1,2}"/g, '').match(/\bIA\b/g);
  if (reste) { console.error('Le mot « IA » reste dans les textes du ROME : ' + reste.length + ' fois, à traiter dans sansIA().'); process.exit(1); }
  fs.mkdirSync(path.join(RACINE, 'data', 'rome'), { recursive: true });
  let tailleTotale = 0, plusGros = 0;
  Object.keys(parLettre).sort().forEach((lettre) => {
    const entete = '/* ============================================================\n' +
      '   data/rome/fiche_' + lettre + '.js -- FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.\n' +
      '   Fiches complètes en langage courant des métiers du ROME (France Travail) dont le code commence par ' + lettre + ' : d = présentation, m = missions, mi = missions à l’infinitif prêtes à cocher pour le CV (phrasesCV.js), a = accès au métier, r = emploi réglementé,\n' +
      '   k = compétences détaillées [numéro de macro-compétence, nombre de « cœur de métier », libellés], s = savoirs [numéro de catégorie, nombre de « cœur de métier », libellés], p = métiers proches (codes), n = autres noms du métier (tous, les plus courants d’abord), ri = lettres RIASEC du métier (majeure puis mineure), e = savoir-être professionnels officiels du ROME (au plus 5, libellés du ROME, orthographe corrigée).\n' +
      '   Numéros de macro-compétence et de catégorie : data/competencesRome.js. Chargé À LA DEMANDE (js/app.js, chargerFicheRome). Produit par : node scripts/importRome/genererMetiersRome.js <dossier CSV ROME>\n' +
      '   ============================================================ */\n';
    const corps = '(function (g) {\n  var P = g.FICHES_ROME = g.FICHES_ROME || {};\n  var donnees = ' + JSON.stringify(parLettre[lettre]) + ';\n  Object.keys(donnees).forEach(function (c) { P[c] = donnees[c]; });\n  if (typeof module !== "undefined" && module.exports) { module.exports = { FICHES_ROME_LETTRE: donnees }; }\n})(typeof window !== "undefined" ? window : globalThis);\n';
    const chemin = path.join(RACINE, 'data', 'rome', 'fiche_' + lettre + '.js');
    fs.writeFileSync(chemin, entete + corps);
    const ko = fs.statSync(chemin).size / 1024; tailleTotale += ko; plusGros = Math.max(plusGros, ko);
  });
  console.log('Fiches complètes : ' + Object.keys(parLettre).length + ' fichiers (' + Math.round(tailleTotale) + ' Ko au total, le plus gros ' + Math.round(plusGros) + ' Ko) ; ' + compte.intro + ' présentations, ' + compte.missions + ' missions, ' + compte.competences + ' compétences détaillées, ' + compte.savoirs + ' savoirs, ' + compte.proches + ' métiers proches, ' + compte.reglementes + ' emplois réglementés');
}

// ---- Empreintes (veille de tous les six mois)
fs.mkdirSync(path.join(RACINE, 'docs', 'suivi_rome'), { recursive: true });
const emp = { version: rome.version, genereLe: dateJour, codes: {} };
Object.keys(rome.codes).sort().forEach((c) => { emp.codes[c] = { libelle: rome.codes[c].libelle, empreinte: empreinte(rome.codes[c]), appellations: rome.codes[c].appellations.length }; });
fs.writeFileSync(path.join(RACINE, 'docs', 'suivi_rome', 'empreintes_ROME.json'), JSON.stringify(emp, null, 1));

// ---- Statistiques et échantillon
const nb = (pred) => fiches.filter(pred).length;
const parSecteur = {}; fiches.forEach((x) => { parSecteur[x.secteur] = (parSecteur[x.secteur] || 0) + 1; });
const nomsAvecBarre = fiches.filter((x) => x.nom.indexOf(' / ') !== -1);
const stats = {
  codesRome: Object.keys(rome.codes).length, fichesGenerees: fiches.length, codesDejaDetailles: ignores.length,
  sansAction: nb((x) => !x.actions.length), uneOuDeuxActions: nb((x) => x.actions.length >= 1 && x.actions.length <= 2), sansActivite: nb((x) => !x.activites.length), sansLieu: nb((x) => !x.environnement.length),
  sansSavoirEtre: nb((x) => !x.savoirEtre.length), sansSavoirs: nb((x) => !x.savoirs.length), sansSavoirFaire: nb((x) => !x.savoirFaire.length),
  codesEnAliasCarMemeNom: Object.keys(alias).length, nomsAvecBarreRestante: nomsAvecBarre.length,
  tailleFichierKo: Math.round(fs.statSync(path.join(RACINE, 'data', 'metiersRome.js')).size / 1024)
};
console.log(JSON.stringify(stats, null, 1));
console.log('Par secteur : ' + Object.keys(parSecteur).sort().map((s) => s + ' ' + parSecteur[s]).join(' | '));
if (Object.keys(alias).length) { console.log('Codes en alias (même nom qu\'une fiche présente) : ' + Object.keys(alias).map((c) => c + ' -> ' + alias[c]).join(' ; ')); }
if (nomsAvecBarre.length) { console.log('Noms avec « / » restant (extrait) : ' + nomsAvecBarre.slice(0, 8).map((x) => x.nom).join(' ; ')); }

// Échantillon de 30 fiches : une par secteur d'abord (tirage reproductible), puis complété au hasard
function alea(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hasard = alea(20261112);
const melanger = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
const echantillon = [];
SECTEURS.forEach((s) => { const c = melanger(fiches.filter((x) => x.secteur === s))[0]; if (c) { echantillon.push(c); } });
melanger(fiches).forEach((x) => { if (echantillon.length < 30 && echantillon.indexOf(x) === -1) { echantillon.push(x); } });
echantillon.sort((a, b) => (a.secteur + a.nom).localeCompare(b.secteur + b.nom, 'fr'));

const lib = (cle, id) => (items[cle + ':' + id] ? items[cle + ':' + id].label : id);
const lignes = [];
lignes.push('# Échantillon de 30 fiches du ROME générées par le code (consigne 263, phase 1)');
lignes.push('');
lignes.push('Généré le ' + dateJour + ' à partir du ROME 4.0 (' + rome.version.join(' | ') + '). **Rien n\'est encore branché à l\'application.**');
lignes.push('');
lignes.push('**Comment lire** : pour chaque métier, « Ce que dit le ROME » rappelle les grands thèmes de la fiche officielle ; « Ce que le code en déduit » est ce que l\'application utiliserait. Il suffit de répondre pour chaque fiche : **juste**, **à peu près** ou **faux** (et ce qui manque ou gêne). Les listes sont plafonnées exprès (actions 6, publics 3, matières 3, lieux 3, savoir-faire 6, savoir-être 4, savoirs 6).');
lignes.push('');
lignes.push('## Chiffres sur les ' + fiches.length + ' fiches générées');
lignes.push('');
lignes.push('| Mesure | Fiches |');
lignes.push('|---|---|');
lignes.push('| Codes du ROME | ' + stats.codesRome + ' (dont ' + stats.codesDejaDetailles + ' déjà détaillés à la main, non régénérés) |');
lignes.push('| Sans aucune action déduite | ' + stats.sansAction + ' |');
lignes.push('| Une ou deux actions seulement | ' + stats.uneOuDeuxActions + ' |');
lignes.push('| Sans « avec qui / avec quoi » | ' + stats.sansActivite + ' |');
lignes.push('| Sans lieu de travail | ' + stats.sansLieu + ' |');
lignes.push('| Sans savoir-être | ' + stats.sansSavoirEtre + ' |');
lignes.push('| Sans savoirs | ' + stats.sansSavoirs + ' |');
lignes.push('| Codes non générés car leur nom est celui d\'une fiche déjà présente (rattachés à celle-ci) | ' + stats.codesEnAliasCarMemeNom + ' |');
lignes.push('| Poids du fichier généré | ' + stats.tailleFichierKo + ' Ko |');
lignes.push('');
lignes.push('## Les 30 fiches');
echantillon.forEach((x, n) => {
  const f = rome.codes[x.rome];
  const po = {}; f.competences.forEach((c) => { po[c.objectif] = (po[c.objectif] || 0) + 1; });
  const themes = Object.keys(po).sort((a, b) => po[b] - po[a]).slice(0, 4).map((o) => rome.objectifsLibelles[o] + ' (' + po[o] + ')');
  lignes.push('');
  lignes.push('### ' + (n + 1) + '. ' + x.nom + ' (' + x.rome + ') : ' + x.secteur);
  lignes.push('- **Ce que dit le ROME** : ' + themes.join(' ; ') + '. Contextes : ' + dedoublonner(f.contextes.map((c) => c.libelle)).slice(0, 5).join(' ; ') + '.');
  lignes.push('- **Ce que le code en déduit**');
  lignes.push('  - Avec qui, avec quoi : ' + (x.activites.map((id) => lib('pml', id)).join(' ; ') || '(rien)'));
  lignes.push('  - Ce que vous faisiez : ' + (x.actions.map((id) => lib('actions', id)).join(' ; ') || '(rien)'));
  lignes.push('  - Où vous travailliez : ' + (x.environnement.map((id) => lib('lieux', id)).join(' ; ') || '(rien)'));
  lignes.push('  - Savoir-faire : ' + (x.savoirFaire.join(' ; ') || '(rien)'));
  lignes.push('  - Savoir-être : ' + (x.savoirEtre.join(' ; ') || '(rien)'));
  lignes.push('  - Savoirs : ' + (x.savoirs.join(' ; ') || '(rien)'));
});
fs.writeFileSync(path.join(RACINE, 'docs', 'ECHANTILLON_METIERS_ROME_2026-11-12.md'), lignes.join('\n') + '\n');
console.log('Échantillon écrit : docs/ECHANTILLON_METIERS_ROME_2026-11-12.md');
