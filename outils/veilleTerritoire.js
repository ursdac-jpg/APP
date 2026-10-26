/* ============================================================
   veilleTerritoire.js  --  les registres du module « Qui fait quoi » : lire, valider, modifier, supprimer, ajouter
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js (type « territoire » de « Publier »). Aucune dependance. Deux fichiers (une ligne = une fiche, colonnes separees par « | ») :
     - modules/mon-territoire/contenu/lieux.txt       (les structures : logement, mobilite, accompagnement...)
     - modules/mon-territoire/contenu/employeurs.txt  (les employeurs, par secteur)
     - modules/mon-territoire/contenu/offres.txt      (les pages où les employeurs publient eux-mêmes leurs offres ; « à revérifier » dès 6 mois, masquée à 12 mois)
   Les REGLES de verification sont celles de l'application elle-meme (modules/mon-territoire/logique.js : mtVerifierLieux, mtVerifierEmployeurs), jamais une copie :
   le texte obtenu apres les modifications est controle en entier, et refuse s'il est mal ecrit. Seules les lignes TOUCHEES sont reecrites : commentaires,
   lignes vides, ordre et fins de ligne restent exactement comme avant. Une coordonnee (site, telephone, page de recrutement) n'est affichee par l'application
   que si sa ligne est datee de moins de 12 mois : « Valider » = ouvrir le site, constater qu'il est bon, dater d'aujourd'hui.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const L = require('../modules/mon-territoire/logique.js');

const RE_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
const MAX_ACTIONS = 100;

const LIBELLES = {
  id: 'Identifiant', type: 'Type', nom: 'Nom', description: 'Ce qu\'il fait', commune: 'Commune', zone: 'Zone desservie (epci:code ; commune:Nom, vide si pas relevée)', telephone: 'Téléphone',
  site: 'Site (https://...)', mail: 'Mail (adresse de service, jamais celle d’une personne)', portee: 'Portée', rayons: 'Rayons de Comprendre le cadre', source: 'Source', date: 'Dernière vérification',
  nature: 'Nature', secteur: 'Secteur', etablissements: 'Établissements (Commune:adresse ; Commune:adresse)', recrutement: 'Page de recrutement (https://...)',
  modes: 'Modes de candidature',
  famille: 'Famille', territoire: 'Territoire', page: 'Page où l\'employeur publie ses offres (https://...)', employeur: 'Fiche d\'employeur liée (identifiant, vide si aucune)',
  controle: 'Dernier contrôle automatique', stages: 'Stages (réservé)'
};

// Dans l'OUTIL, une structure ou un employeur est « à revérifier » dès 6 mois ; le site public garde sa règle (12 mois, MT_VALIDITE_MOIS) : seul Denis décide de ce qui est affiché.
const REVOIR_MOIS = 6;
const FICHIERS = {
  lieux: { chemin: 'modules/mon-territoire/contenu/lieux.txt', colonnes: L.MT_COLONNES_LIEUX, coordonnees: ['telephone', 'site', 'mail'], verifier: L.mtVerifierLieux, revoirMois: REVOIR_MOIS },
  employeurs: { chemin: 'modules/mon-territoire/contenu/employeurs.txt', colonnes: L.MT_COLONNES_EMPLOYEURS, coordonnees: ['telephone', 'site', 'recrutement'], verifier: L.mtVerifierEmployeurs, revoirMois: REVOIR_MOIS },
  // Une page d'offres ne s'enregistre jamais sans date de vérification à la main (dateObligatoire) ; « controle » et « stages » ne se modifient pas ici.
  offres: { chemin: 'modules/mon-territoire/contenu/offres.txt', colonnes: L.MT_COLONNES_OFFRES, coordonnees: ['page'], verifier: L.mtVerifierOffres, dateObligatoire: true, cachees: ['controle', 'stages'], revoirMois: L.MT_VALIDITE_OFFRES_MOIS, masqueeMois: L.MT_VALIDITE_MOIS }
};

// Noms lisibles des rayons de « Comprendre le cadre » (cases à cocher de l'outil ; l'identifiant écrit dans le registre reste celui de la liste fermée).
const RAYONS_LIBELLES = {
  accompagnement: 'Accompagnement (France Travail, mission locale, insertion)', budget: 'Budget et aides', creer: 'Créer son activité', emploi: 'Contrats et droit du travail',
  employeurs: 'Appui aux employeurs', etranger: 'Venir de l\'étranger', former: 'Se former, se reconvertir', francais: 'Apprendre le français', garde: 'Garde d\'enfant',
  handicap: 'Handicap', jeunes: 'Jeunes', juridique: 'Droit et démarches juridiques', justice: 'Justice', logement: 'Logement', mobilite: 'Mobilité', sante: 'Santé', seniors: 'Seniors'
};

const FAMILLES_OFFRES = [
  { v: 'employeur', l: 'employeur privé ou association (près de chez vous, ou grand employeur si le territoire est « national »)' },
  { v: 'portail-officiel', l: 'fonction publique (employeur public, portail officiel)' },
  { v: 'groupement', l: 'groupement d\'employeurs' },
  { v: 'federation', l: 'chambre ou fédération' }
];

// Ce que le verificateur de l'application a besoin de connaitre : les secteurs (data/secteurs.js) et les communes (contenu/communes-XX.txt, un fichier par departement).
// Un fichier absent (depot de test) laisse simplement le controle correspondant de cote.
function contexteDepuis(racine, aujourdhui) {
  const ctx = { aujourdhui: aujourdhui };
  try {
    const code = fs.readFileSync(path.join(racine, 'data', 'secteurs.js'), 'utf8');
    ctx.secteurs = vm.runInNewContext(code + ';SECTEURS_DETAIL').map(function (s) { return s.cle; });
    ctx.secteursLibelles = vm.runInNewContext(code + ';SECTEURS_DETAIL').map(function (s) { return { cle: s.cle, libelle: s.libelle }; });
  } catch (e) { /* pas de secteurs : controle ignore */ }
  try {
    // Un fichier de communes par departement (communes-24.txt, communes-87.txt...) : le controle accepte les communes de tous les departements du depot.
    const dossier = path.join(racine, 'modules', 'mon-territoire', 'contenu');
    const fichiers = fs.readdirSync(dossier).filter(function (f) { return /^communes-\d+[a-z]?\.txt$/.test(f); }).sort();
    if (!fichiers.length) { throw new Error('pas de communes'); }
    const communes = fichiers.reduce(function (acc, f) { return acc.concat(L.mtParserCommunes(fs.readFileSync(path.join(dossier, f), 'utf8')).lignes); }, []);
    ctx.communes = communes.map(function (c) { return c.cle; });
    ctx.communesNoms = communes.map(function (c) { return c.nom; });
    ctx.communesCodes = {}; communes.forEach(function (c) { ctx.communesCodes[c.cle] = c.code; });
    ctx.epci = communes.map(function (c) { return c.epci; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  } catch (e) { /* pas de communes : controle ignore */ }
  try {
    const emp = L.mtParserEmployeurs(fs.readFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'employeurs.txt'), 'utf8')).lignes;
    ctx.employeurs = emp.map(function (e) { return e.id; });
    ctx.employeursChoix = emp.map(function (e) { return { v: e.id, l: e.nom }; });
  } catch (e) { /* pas d'employeurs : le lien d'une page d'offres avec une fiche n'est pas contrôlé */ }
  return ctx;
}

function analyser(texte, colonnes) {
  const fin = texte.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  const lignes = texte.split(/\r?\n/).map(function (brut) {
    if (!brut.trim() || /^\s*#/.test(brut)) { return { brut: brut }; }
    const p = brut.trim().split(/\s*\|\s*/).map(function (x) { return x.trim(); });
    // Anciennes lignes des structures : la colonne « mail » (la dernière) peut manquer.
    if (p.length === colonnes.length - 1 && colonnes[colonnes.length - 1] === 'mail') { p.push(''); }
    // Anciennes lignes des structures : la colonne « mail » (la dernière) peut manquer.
    if (p.length === colonnes.length - 1 && colonnes[colonnes.length - 1] === 'mail') { p.push(''); }
    if (p.length !== colonnes.length) { return { brut: brut }; }
    const v = {};
    colonnes.forEach(function (c, k) { v[c] = p[k]; });
    return { brut: brut, id: v.id, valeurs: v };
  });
  return { lignes: lignes, fin: fin };
}

// Une ligne d'enregistrement : colonnes separees par « | », une colonne vide s'ecrit « | | », la derniere peut rester vide.
function formater(colonnes, v) {
  // La colonne « mail » (la dernière des structures) est omise quand elle est vide : les lignes sans mail gardent leurs 12 colonnes d'origine.
  if (colonnes[colonnes.length - 1] === 'mail' && !String(v.mail == null ? '' : v.mail).trim()) { colonnes = colonnes.slice(0, -1); }
  let t = colonnes.map(function (c) { return String(v[c] == null ? '' : v[c]).trim(); }).join(' | ');
  while (t.indexOf(' |  | ') !== -1) { t = t.replace(' |  | ', ' | | '); }
  return t.replace(/ \| $/, ' |');
}

function valeurPropre(x) { return typeof x === 'string' && x.indexOf('|') === -1 && !/[\r\n\u0000]/.test(x) && x.length <= 800; }

// Fraîcheur d'une ligne : 'sans-date' | 'recente' | 'a-reverifier' (au-delà du seuil propre au registre : 12 mois, ou 6 mois pour les pages d'offres).
function fraicheurDe(f, date, aujourdhui) {
  if (!f.revoirMois) { return L.mtFraicheur(date, aujourdhui); }
  const m = L.mtMoisEcoules(date, aujourdhui);
  if (m === null) { return 'sans-date'; }
  return (m < 0 || m >= f.revoirMois) ? 'a-reverifier' : 'recente';
}

// Liste pour l'ecran : les colonnes (avec leurs choix quand la liste est fermee) et chaque ligne avec sa fraicheur.
function lister(fichier, texte, aujourdhui, ctx) {
  const f = FICHIERS[fichier];
  if (!f) { return { ok: false, erreur: 'Registre inconnu : ' + String(fichier).slice(0, 30) + '.' }; }
  const choixDe = function (c) {
    if (c === 'type') { return Object.keys(L.MT_TYPES).map(function (k) { return { v: k, l: L.MT_TYPES[k] }; }); }
    if (c === 'famille') { return FAMILLES_OFFRES; }
    if (c === 'portee' || c === 'territoire') { return L.MT_PORTEES.map(function (k) { return { v: k, l: ({ national: 'national', region: 'région', '24': 'Dordogne (24)', '87': 'Haute-Vienne (87)' })[k] }; }); }
    if (c === 'nature') { return [{ v: 'enseigne', l: 'enseigne (une fiche, plusieurs magasins)' }, { v: 'local', l: 'employeur local (un établissement)' }, { v: 'interim', l: 'agence d’intérim (une agence, son numéro, sans secteur)' }]; }
    if (c === 'secteur' && ctx && ctx.secteursLibelles) { return ctx.secteursLibelles.map(function (s) { return { v: s.cle, l: s.libelle }; }); }
    return null;
  };
  const colonnes = f.colonnes.map(function (c) { return { cle: c, libelle: LIBELLES[c] || c, choix: choixDe(c), cachee: (f.cachees || []).indexOf(c) !== -1 }; });
  const a = analyser(texte, f.colonnes);
  const lignes = a.lignes.filter(function (l) { return l.id; }).map(function (l) {
    return { id: l.id, nom: l.valeurs.nom, valeurs: l.valeurs, fraicheur: fraicheurDe(f, l.valeurs.date, aujourdhui), mois: L.mtMoisEcoules(l.valeurs.date, aujourdhui) };
  });
  return { ok: true, colonnes: colonnes, lignes: lignes, aujourdhui: aujourdhui, modesPossibles: Object.keys(L.MT_MODES), modesLibelles: L.MT_MODES, rayonsLibelles: RAYONS_LIBELLES,
    communesNoms: ctx && ctx.communesNoms ? ctx.communesNoms.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a.localeCompare(b, 'fr'); }) : [],
    employeursChoix: (ctx && ctx.employeursChoix) || [], rayonsPossibles: L.MT_RAYONS,
    regle: { revoirMois: f.revoirMois || L.MT_VALIDITE_MOIS, masqueeMois: f.masqueeMois || L.MT_VALIDITE_MOIS }, controlable: fichier === 'offres', controleRegistre: fichier !== 'offres' };
}

// Applique des actions et rend { ok, texte, resume } ou { ok:false, erreur }.
//   { op: 'valider', id }  |  { op: 'modifier', id, valeurs: { colonne: texte }, dater? }  |  { op: 'supprimer', id }  |  { op: 'ajouter', id, valeurs, dater? }
function appliquer(fichier, texte, actions, aujourdhui, ctx) {
  const f = FICHIERS[fichier];
  if (!f) { return { ok: false, erreur: 'Registre inconnu.' }; }
  if (!Array.isArray(actions) || !actions.length) { return { ok: false, erreur: 'Aucune modification a enregistrer.' }; }
  if (actions.length > MAX_ACTIONS) { return { ok: false, erreur: 'Trop de modifications d\'un coup (' + MAX_ACTIONS + ' au plus).' }; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(aujourdhui))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const a = analyser(texte, f.colonnes);
  const lignes = a.lignes.slice();
  const index = function (id) { for (let i = 0; i < lignes.length; i++) { if (lignes[i].id === id) { return i; } } return -1; };
  const resume = { valides: 0, modifies: 0, supprimes: 0, ajoutes: 0 };
  const aSupprimer = {};
  const dejaVu = {};
  const colonnesModifiables = f.colonnes.filter(function (c) { return c !== 'id' && c !== 'date' && (f.cachees || []).indexOf(c) === -1; });
  const lireValeurs = function (id, v) {
    const sortie = {};
    for (const c of Object.keys(v || {})) {
      if (colonnesModifiables.indexOf(c) === -1) { return { erreur: id + ' : colonne inconnue ou non modifiable (« ' + c + ' »).' }; }
      if (!valeurPropre(v[c])) { return { erreur: id + ' : « ' + (LIBELLES[c] || c) + ' » ne peut pas contenir de barre verticale ni de retour a la ligne.' }; }
      sortie[c] = v[c].trim();
    }
    return { valeurs: sortie };
  };
  for (const ac of actions) {
    if (!ac || typeof ac !== 'object' || !RE_ID.test(String(ac.id || ''))) { return { ok: false, erreur: 'Identifiant non reconnu : ' + String(ac && ac.id).slice(0, 40) + '.' }; }
    const id = ac.id;
    if (dejaVu[id]) { return { ok: false, erreur: id + ' : deux modifications sur la meme fiche (une seule par fiche).' }; }
    dejaVu[id] = true;
    const i = index(id);
    if (ac.op === 'ajouter') {
      if (i !== -1) { return { ok: false, erreur: id + ' : cet identifiant existe deja (choisissez-en un autre).' }; }
      const r = lireValeurs(id, ac.valeurs); if (r.erreur) { return { ok: false, erreur: r.erreur }; }
      const v = { id: id, date: ac.dater ? aujourdhui : '' };
      f.colonnes.forEach(function (c) { if (c !== 'id' && c !== 'date') { v[c] = r.valeurs[c] || ''; } });
      if (f.dateObligatoire && !v.date) { return { ok: false, erreur: id + ' : cochez « J\'ai ouvert la page » : une page d\'offres ne s\'enregistre jamais sans date de vérification à la main.' }; }
      lignes.push({ id: id, valeurs: v, brut: null });
      resume.ajoutes++; continue;
    }
    if (i === -1) { return { ok: false, erreur: id + ' : fiche introuvable dans le registre.' }; }
    if (ac.op === 'valider') {
      lignes[i] = { id: id, valeurs: Object.assign({}, lignes[i].valeurs, { date: aujourdhui }), brut: null }; resume.valides++; continue;
    }
    if (ac.op === 'modifier') {
      const r = lireValeurs(id, ac.valeurs); if (r.erreur) { return { ok: false, erreur: r.erreur }; }
      const v = Object.assign({}, lignes[i].valeurs, r.valeurs);
      // La marque « Via prospection » (debut de la source) ne se perd ni ne s'ajoute par une modification : la fiche passerait en silence d'une rubrique a l'autre.
      if (f.colonnes.indexOf('source') !== -1 && L.mtViaProspection(lignes[i].valeurs) !== L.mtViaProspection(v)) { return { ok: false, erreur: id + ' : le début de la source (« Via prospection ; ») ne peut pas être changé ici : la fiche changerait de rubrique.' }; }
      // Les numeros PAR MAGASIN (colonne « etablissements », « Commune:adresse:05 53 00 00 00 ») sont aussi des coordonnees : un numero qui change demande une nouvelle verification.
      // La marque « Petite structure » (début de la source) suit la même règle : on ne la pose ni ne la retire en modifiant la fiche.
      if (f.colonnes.indexOf('source') !== -1 && L.mtPetiteStructure(lignes[i].valeurs) !== L.mtPetiteStructure(v)) { return { ok: false, erreur: id + ' : le début de la source (« Petite structure ; ») ne peut pas être changé ici : la fiche changerait de catégorie.' }; }
      const numerosMagasins = function (x) { return f.colonnes.indexOf('etablissements') !== -1 ? L.mtParserEtablissements(x.etablissements).map(function (e) { return e.telephone; }).join('|') : ''; };
      const coordonneeChangee = f.coordonnees.some(function (c) { return String(lignes[i].valeurs[c] || '') !== String(v[c] || ''); }) || numerosMagasins(lignes[i].valeurs) !== numerosMagasins(v);
      v.date = ac.dater === true ? aujourdhui : (coordonneeChangee ? '' : lignes[i].valeurs.date);
      if (f.dateObligatoire && !v.date) { return { ok: false, erreur: id + ' : cochez « J\'ai ouvert la page » : une page d\'offres ne s\'enregistre jamais sans date de vérification à la main.' }; }
      lignes[i] = { id: id, valeurs: v, brut: null }; resume.modifies++; continue;
    }
    if (ac.op === 'supprimer') { aSupprimer[i] = true; resume.supprimes++; continue; }
    return { ok: false, erreur: id + ' : action inconnue (« ' + String(ac.op) + ' »).' };
  }
  // Reecriture : seules les lignes touchees changent ; les nouvelles fiches s'ajoutent apres la derniere fiche d'origine.
  const n = a.lignes.length;
  let derniere = -1;
  for (let k = 0; k < n; k++) { if (a.lignes[k].id) { derniere = k; } }
  const ajoutees = lignes.slice(n);
  const sortie = [];
  for (let k = 0; k < n; k++) {
    if (!Object.prototype.hasOwnProperty.call(aSupprimer, k)) { sortie.push(lignes[k].brut === null ? formater(f.colonnes, lignes[k].valeurs) : a.lignes[k].brut); }
    if (k === derniere) { ajoutees.forEach(function (l) { sortie.push(formater(f.colonnes, l.valeurs)); }); }
  }
  if (derniere === -1) { ajoutees.forEach(function (l) { sortie.push(formater(f.colonnes, l.valeurs)); }); }
  const nouveauTexte = sortie.join(a.fin);
  // Controle de l'ensemble avec les regles de l'application elle-meme.
  const erreurs = f.verifier(nouveauTexte, Object.assign({}, ctx || {}, { aujourdhui: aujourdhui }));
  if (erreurs.length) { return { ok: false, erreur: erreurs.slice(0, 3).join(' ; ') + (erreurs.length > 3 ? ' (et ' + (erreurs.length - 3) + ' autre(s))' : '') }; }
  return { ok: true, texte: nouveauTexte, resume: resume };
}

module.exports = { FICHIERS: FICHIERS, contexteDepuis: contexteDepuis, analyser: analyser, formater: formater, lister: lister, appliquer: appliquer };
