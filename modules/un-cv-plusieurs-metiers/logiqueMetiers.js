/* ============================================================
   Module « Un CV, plusieurs métiers » : LOGIQUE PURE de la page 2 « Métiers » (aucun DOM). Chargé après logique.js, avant index.js.
   Testé par tests/unCvPlusieursMetiers.test.js.

   Vocabulaire : une ENTRÉE est un métier proposé (colonne de gauche = autres noms du même métier, colonne de droite = autres métiers qui
   utilisent les mêmes compétences). Chaque entrée porte son OBJECTIF (une démarche et ses détails), obligatoire pour les entrées cochées.
   Règles de Denis : 10 entrées cochées au plus ; « Créer mes CV » dès 2 cochées, chacune avec son objectif ; aucun nom d'entreprise par défaut.
   ============================================================ */

// Les sept démarches du panneau d'objectif (même vocabulaire que la liste OBJECTIF_CHOIX_CANDIDATURE de l'application + l'immersion).
var UCPM_DEMARCHES = [
  { id: 'spontanee', titre: 'Candidature spontanée', desc: 'Vous écrivez à une structure sans offre précise.', famille: 'emploi' },
  { id: 'offre', titre: 'Réponse à une offre', desc: 'Vous répondez à une offre d’emploi publiée.', famille: 'emploi' },
  { id: 'reconversion', titre: 'Changement de métier', desc: 'Vous voulez exercer un autre métier.', famille: 'emploi' },
  { id: 'stage', titre: 'Stage de formation', desc: 'Un stage prévu dans votre formation.', famille: 'periode' },
  { id: 'pmsmp', titre: 'Stage d’immersion (PMSMP)', desc: 'Vous découvrez un métier en structure, pour tester votre projet.', famille: 'periode' },
  { id: 'alternance', titre: 'Alternance', desc: 'Vous apprenez un métier en alternant formation et entreprise.', famille: 'periode' },
  { id: 'formation', titre: 'Entrée en formation', desc: 'Vous candidatez à une formation.', famille: 'periode' }
];

// Démarches pour lesquelles on peut renseigner l'employeur et le recruteur (décision de Denis du 2026-10-08) ; le poste et l'offre : réponse à une offre.
var UCPM_DEMARCHES_AVEC_EMPLOYEUR = ['offre', 'stage', 'alternance', 'pmsmp'];
var UCPM_UNITES_DUREE = ['jours', 'semaines', 'mois', 'ans'];
// Objectifs d'une immersion (PMSMP) a cliquer (plusieurs choix possibles), decision de Denis du 2026-10-10.
var UCPM_OBJECTIFS_PMSMP = ['Découvrir le métier', 'Confirmer mon projet professionnel', 'Valider mon entrée en formation', 'Tester mes capacités et le rythme du poste', 'Découvrir un secteur ou une entreprise', 'Me faire connaître d’un employeur', 'Préparer mon retour à l’emploi'];
var UCPM_CIVILITES_RECRUTEUR = ['', 'Madame', 'Monsieur'];

function ucpmDemarche(id) {
  for (var i = 0; i < UCPM_DEMARCHES.length; i++) { if (UCPM_DEMARCHES[i].id === id) { return UCPM_DEMARCHES[i]; } }
  return null;
}
function ucpmTitreDemarche(id) { var d = ucpmDemarche(id); return d ? d.titre : ''; }

// Un objectif vide (aucune démarche choisie) ; les détails se remplissent dans le panneau.
function ucpmObjectifVide(demarche) {
  return {
    demarche: demarche || '',
    typeStructure: '', typeStructureAutre: '', cible: '', metierVise: '', secteur: '',   // cible : 'metier' (la personne vise un métier précis) ou 'secteur' (elle choisit un secteur de la liste de l'application)
    contrat: [], tempsTravail: [],
    dureeQuantite: '', dureeUnite: '', dateDebut: '', dateFin: '', heures: '', formationVisee: '',
    disponibleA: '', autreChose: '',
    ancienType: '', ancienValeur: '', organisme: '', objectifsPmsmp: [], objectifPmsmpAutre: '',
    employeur: '', civiliteRecruteur: '', nomRecruteur: '', posteOffre: '', texteOffre: ''
  };
}

// Un objectif est utilisable dès qu'une démarche connue est choisie (le reste est facultatif).
function ucpmObjectifValide(obj) { return !!(obj && obj.demarche && ucpmDemarche(obj.demarche)); }

function _ucpmTexte(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
function _ucpmListe(v) { return Array.isArray(v) ? v.map(_ucpmTexte).filter(Boolean) : []; }

// Remet un objectif venant d'ailleurs (disquette, copie) dans une forme sûre ; null si ce n'est pas un objectif.
function ucpmNormaliserObjectif(brut) {
  if (!brut || typeof brut !== 'object') { return null; }
  var o = ucpmObjectifVide(brut.demarche && ucpmDemarche(brut.demarche) ? brut.demarche : '');
  ['typeStructure', 'typeStructureAutre', 'cible', 'metierVise', 'secteur', 'dureeQuantite', 'dureeUnite', 'dateDebut', 'dateFin', 'heures', 'formationVisee', 'disponibleA', 'autreChose',
    'employeur', 'civiliteRecruteur', 'nomRecruteur', 'posteOffre', 'ancienType', 'ancienValeur', 'organisme', 'objectifPmsmpAutre'].forEach(function (k) { o[k] = _ucpmTexte(brut[k]); });
  o.objectifsPmsmp = _ucpmListe(brut.objectifsPmsmp);
  o.texteOffre = String(brut.texteOffre == null ? '' : brut.texteOffre).trim();
  o.contrat = _ucpmListe(brut.contrat);
  o.tempsTravail = _ucpmListe(brut.tempsTravail);
  return o;
}

// Les détails d'un objectif en une ligne, à la manière des essais de prompts : « type de structure : ... ; secteur : ... ; contrat : CDI ; durée : 2 ans ».
function ucpmDetailsObjectif(obj) {
  var o = ucpmNormaliserObjectif(obj);
  if (!o) { return ''; }
  var morceaux = [];
  var type = o.typeStructure === 'Autre' && o.typeStructureAutre ? o.typeStructureAutre : o.typeStructure;
  if (type) { morceaux.push('type de structure : ' + type); }
  if (o.metierVise) { morceaux.push('métier visé : ' + o.metierVise); }
  if (o.secteur) { morceaux.push('secteur : ' + o.secteur); }
  if (o.contrat.length) { morceaux.push('contrat : ' + o.contrat.join(', ')); }
  if (o.tempsTravail.length) { morceaux.push(o.tempsTravail.join(' ou ').toLowerCase()); }
  if (o.dureeQuantite) { morceaux.push('durée : ' + o.dureeQuantite + (o.dureeUnite ? ' ' + o.dureeUnite : '')); }
  if (o.dateDebut) { morceaux.push('début souhaité : ' + o.dateDebut); }
  if (o.dateFin) { morceaux.push('fin souhaitée : ' + o.dateFin); }
  if (o.heures) { morceaux.push('heures par semaine : ' + o.heures); }
  if (o.formationVisee) { morceaux.push('formation visée : ' + o.formationVisee); }
  if (o.disponibleA) { morceaux.push('disponible à partir de : ' + o.disponibleA); }
  if (o.ancienValeur) { morceaux.push((o.ancienType === 'secteur' ? 'ancien secteur d’activité : ' : 'ancien métier : ') + o.ancienValeur); }
  if (o.organisme) { morceaux.push('organisme de formation : ' + o.organisme); }
  if (o.objectifsPmsmp.length || o.objectifPmsmpAutre) { morceaux.push('objectif de l’immersion : ' + o.objectifsPmsmp.concat(o.objectifPmsmpAutre ? [o.objectifPmsmpAutre] : []).join(' ; ')); }
  return morceaux.join(' ; ');
}

// Étiquette courte affichée sur la carte du métier (démarche, et secteur ou structure s'ils sont connus).
function ucpmEtiquetteObjectif(obj) {
  var o = ucpmNormaliserObjectif(obj);
  if (!o || !o.demarche) { return ''; }
  var t = ucpmTitreDemarche(o.demarche);
  var type = o.typeStructure === 'Autre' && o.typeStructureAutre ? o.typeStructureAutre : '';
  var plus = [o.metierVise, o.secteur, type].filter(Boolean)[0];
  return plus ? t + ' (' + plus + ')' : t;
}

// ---------------- Listes de métiers ----------------

// Construit les deux colonnes à partir de la réponse lue (ucpmLireReponseMetiers). Rien n'est coché au départ.
function ucpmCreerListes(valeurs) {
  var v = valeurs || {};
  var intitules = (v.intitulesMemeMetier || []).map(function (x, i) {
    return { id: 'g' + (i + 1), masculin: x.masculin, feminin: x.feminin, retrouveDansLeCV: x.retrouveDansLeCV || '', source: 'assistant', coche: false, objectif: null };
  });
  var autres = (v.autresMetiers || []).map(function (x, i) {
    return { id: 'd' + (i + 1), masculin: x.masculin, feminin: x.feminin, retrouveDansLeCV: x.retrouveDansLeCV || [], aVerifier: x.aVerifier || '', source: 'assistant', coche: false, objectif: null };
  });
  return { intitules: intitules, autres: autres };
}

// Nom à afficher : la forme du sexe connu ; tant que l'identité est inconnue, les deux formes réunies (« Électricien / Électricienne d'entretien »).
// sexe : 'f', 'm' ou '' (inconnu).
function ucpmNomMetier(entree, sexe) {
  if (!entree) { return ''; }
  var m = _ucpmTexte(entree.masculin), f = _ucpmTexte(entree.feminin) || m;
  if (!m) { m = f; }
  if (sexe === 'f') { return f; }
  if (sexe === 'm') { return m; }
  if (m === f) { return m; }
  var mm = m.split(' '), ff = f.split(' ');
  var c = 0;
  while (c < mm.length - 1 && c < ff.length - 1 && mm[mm.length - 1 - c] === ff[ff.length - 1 - c]) { c++; }
  // les mots communs de la fin (au moins un) : « d'entretien » ; sinon on réunit les deux formes en entier
  var queue = c ? ' ' + mm.slice(mm.length - c).join(' ') : '';
  var teteM = mm.slice(0, mm.length - c).join(' '), teteF = ff.slice(0, ff.length - c).join(' ');
  if (!c) { return m + ' / ' + f; }
  return teteM + ' / ' + teteF + queue;
}

// Toutes les entrées, colonne de gauche puis de droite.
function ucpmToutesEntrees(etat) { return ((etat && etat.intitules) || []).concat((etat && etat.autres) || []); }
function ucpmEntreesCochees(etat) { return ucpmToutesEntrees(etat).filter(function (e) { return e.coche; }); }
function ucpmTrouverEntree(etat, id) {
  var toutes = ucpmToutesEntrees(etat);
  for (var i = 0; i < toutes.length; i++) { if (toutes[i].id === id) { return toutes[i]; } }
  return null;
}
function ucpmCompterCoches(etat) {
  var g = ((etat && etat.intitules) || []).filter(function (e) { return e.coche; }).length;
  var d = ((etat && etat.autres) || []).filter(function (e) { return e.coche; }).length;
  return { gauche: g, droite: d, total: g + d };
}

// Coche ou décoche. Refuse de dépasser 10 entrées cochées ; renvoie { ok, raison }.
function ucpmBasculerCoche(etat, id, valeur) {
  var e = ucpmTrouverEntree(etat, id);
  if (!e) { return { ok: false, raison: 'introuvable' }; }
  var vouloir = (valeur === undefined) ? !e.coche : !!valeur;
  if (vouloir && !e.coche && ucpmCompterCoches(etat).total >= UCPM_MAX_METIERS) { return { ok: false, raison: 'plein' }; }
  e.coche = vouloir;
  return { ok: true };
}

// Écrit un intitulé : un nouvel intitulé écrit par la personne (colonne de gauche), ou la correction d'un existant. Les deux formes reçoivent le texte.
function ucpmAjouterIntitule(etat, texte) {
  var t = _ucpmTexte(String(texte == null ? '' : texte).replace(/[\u2013\u2014]/g, '-'));
  if (!t) { return { ok: false, raison: 'vide' }; }
  if (t.length > 80) { return { ok: false, raison: 'trop-long' }; }
  var existe = ucpmToutesEntrees(etat).some(function (e) { return _ucpmTexte(e.masculin).toLowerCase() === t.toLowerCase() || _ucpmTexte(e.feminin).toLowerCase() === t.toLowerCase(); });
  if (existe) { return { ok: false, raison: 'doublon' }; }
  var n = 1;
  while (ucpmTrouverEntree(etat, 'p' + n)) { n++; }
  var entree = { id: 'p' + n, masculin: t, feminin: t, retrouveDansLeCV: '', source: 'perso', coche: false, objectif: null };
  etat.intitules.push(entree);
  if (ucpmCompterCoches(etat).total < UCPM_MAX_METIERS) { entree.coche = true; }
  return { ok: true, entree: entree };
}
function ucpmCorrigerIntitule(etat, id, texte) {
  var e = ucpmTrouverEntree(etat, id);
  var t = _ucpmTexte(String(texte == null ? '' : texte).replace(/[\u2013\u2014]/g, '-'));
  if (!e || e.id.charAt(0) === 'd') { return { ok: false, raison: 'introuvable' }; }
  if (!t) { return { ok: false, raison: 'vide' }; }
  if (t.length > 80) { return { ok: false, raison: 'trop-long' }; }
  e.masculin = t; e.feminin = t; e.source = e.source === 'perso' ? 'perso' : 'corrige';
  return { ok: true };
}
function ucpmRetirerIntitule(etat, id) {
  var e = ucpmTrouverEntree(etat, id);
  if (!e || id.charAt(0) === 'd') { return { ok: false }; }
  etat.intitules = etat.intitules.filter(function (x) { return x.id !== id; });
  return { ok: true };
}

// ---------------- Objectifs : portée ----------------

// portee : 'tous' | 'gauche' | 'droite' | 'un' (avec id). Applique l'objectif à TOUTES les entrées de la portée (cochées ou non : une entrée cochée plus tard
// a déjà son objectif). Les champs propres à un seul métier (employeur, recruteur, poste, offre) ne sont recopiés que pour 'un'.
function ucpmAppliquerObjectif(etat, portee, id, objectif) {
  var o = ucpmNormaliserObjectif(objectif);
  if (!ucpmObjectifValide(o)) { return { ok: false, raison: 'demarche', nb: 0 }; }
  var cibles;
  if (portee === 'un') { var e = ucpmTrouverEntree(etat, id); cibles = e ? [e] : []; }
  else if (portee === 'gauche') { cibles = etat.intitules; }
  else if (portee === 'droite') { cibles = etat.autres; }
  else { cibles = ucpmToutesEntrees(etat); }
  cibles.forEach(function (e) {
    var copie = ucpmNormaliserObjectif(o);
    if (portee !== 'un') { copie.employeur = ''; copie.civiliteRecruteur = ''; copie.nomRecruteur = ''; copie.posteOffre = ''; copie.texteOffre = ''; copie.metierVise = ''; if (copie.cible === 'metier') { copie.cible = ''; } }
    e.objectif = copie;
  });
  if (portee === 'tous' || portee === 'gauche' || portee === 'droite') {
    var memo = ucpmNormaliserObjectif(o);
    memo.employeur = ''; memo.civiliteRecruteur = ''; memo.nomRecruteur = ''; memo.posteOffre = ''; memo.texteOffre = ''; memo.metierVise = '';
    etat.objectifsPortee = etat.objectifsPortee || {};
    etat.objectifsPortee[portee] = memo;
  }
  return { ok: true, nb: cibles.length, nbCoches: cibles.filter(function (e) { return e.coche; }).length };
}

// ---------------- Règles de la page ----------------

// Entrées cochées sans objectif (il en faut un par case cochée).
function ucpmCochesSansObjectif(etat) { return ucpmEntreesCochees(etat).filter(function (e) { return !ucpmObjectifValide(e.objectif); }); }

// « Créer mes CV » : au moins 2 cochées, 10 au plus, chacune avec son objectif. Renvoie { ok, raison } (raison en français pour la barre du bas).
function ucpmPeutCreerCV(etat) {
  var n = ucpmCompterCoches(etat).total;
  if (n < UCPM_MIN_METIERS_POUR_CREER) { return { ok: false, raison: 'Cochez au moins ' + UCPM_MIN_METIERS_POUR_CREER + ' métiers pour continuer.' }; }
  if (n > UCPM_MAX_METIERS) { return { ok: false, raison: 'Dix métiers au plus : décochez-en pour continuer.' }; }
  var sans = ucpmCochesSansObjectif(etat);
  if (sans.length) { return { ok: false, raison: 'Choisissez votre objectif pour chaque métier coché (' + sans.length + ' sans objectif).' }; }
  return { ok: true, raison: '' };
}

// ---------------- Pur : choix du métier de référence ----------------

function _ucpmSansAccents(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// Par défaut : le métier de votre CV (celui que l'assistant a lu), sinon le premier métier coché de la colonne de gauche, sinon le premier coché.
function ucpmRefParDefaut(etat) {
  var cochees = ucpmEntreesCochees(etat);
  if (!cochees.length) { return null; }
  var metierCV = _ucpmSansAccents(etat.reponseMetiers && etat.reponseMetiers.synthese && etat.reponseMetiers.synthese.metier);
  if (metierCV) {
    for (var i = 0; i < cochees.length; i++) {
      if (_ucpmSansAccents(cochees[i].masculin) === metierCV || _ucpmSansAccents(cochees[i].feminin) === metierCV) { return cochees[i]; }
    }
  }
  var gauche = cochees.filter(function (e) { return e.id.charAt(0) !== 'd'; });
  return gauche.length ? gauche[0] : cochees[0];
}

// L'entrée de référence réellement choisie (toujours une entrée encore cochée), sinon la valeur par défaut.
function ucpmRefCourante(etat) {
  var e = etat.refId ? ucpmTrouverEntree(etat, etat.refId) : null;
  if (e && e.coche) { return e; }
  return ucpmRefParDefaut(etat);
}

// ---------------- Recherche d'offres (simple repère : l'application n'importe rien de la réponse) ----------------

// Libellé d'objectif dans la demande d'offres (mêmes mots que ceux des essais, docs/essais_prompts_ucpm).
var UCPM_OBJECTIF_POUR_OFFRES = {
  spontanee: 'candidature spontanée',
  offre: 'emploi',
  reconversion: 'emploi dans un nouveau métier',
  stage: 'stage de formation',
  pmsmp: 'stage d’immersion (PMSMP)',
  alternance: 'alternance',
  formation: 'entrée en formation'
};

// Ligne de la demande pour une entrée : « 1. Électricien d'entretien : entrée en formation (formation visée : ... ; durée : ...) ».
function ucpmLigneOffres(entree, rang, sexe) {
  var o = ucpmNormaliserObjectif(entree && entree.objectif);
  var obj = o && o.demarche ? UCPM_OBJECTIF_POUR_OFFRES[o.demarche] : '';
  var details = o ? ucpmDetailsObjectif(o) : '';
  return rang + '. ' + ucpmNomMetier(entree, sexe) + (obj ? ' : ' + obj : '') + (details ? ' (' + details + ')' : '');
}

// Remplit le prompt des offres. entrees = les entrées COCHÉES de la colonne ; dateTexte = « 10 octobre 2026 » ; departement = « Haute-Vienne (87) » ou texte libre.
function ucpmConstruireDemandeOffres(template, entrees, departement, dateTexte, sexe) {
  var modele = String(template == null ? '' : template).replace(/<!--[\s\S]*?-->\s*/, '');
  var lignes = (entrees || []).map(function (e, i) { return ucpmLigneOffres(e, i + 1, sexe); }).join('\n');
  return modele.replace('{DATE}', dateTexte).replace('{DEPARTEMENT}', departement).replace('{METIERS}', lignes).trim() + '\n';
}

// Nom du département pour la demande : 24, 87 ou un texte libre (« ailleurs »).
function ucpmNomDepartement(code, libre) {
  if (code === '24') { return 'Dordogne (24)'; }
  if (code === '87') { return 'Haute-Vienne (87)'; }
  return _ucpmTexte(libre);
}

// TEXTE D'AVERTISSEMENT des offres, VALIDE PAR DENIS (2026-10-08, commits 3bd4add9 et e05d285e) : affiche AU CLIC, juste avant l'ouverture de
// l'assistant. Il dit que ce sont seulement les offres publiees, que le marche cache existe, et que l'application n'importe, ne verifie et
// ne reprend rien de la reponse. NE PAS annoncer le module suivant (repertoire des employeurs du territoire). Quatre paragraphes.
var UCPM_AVERTISSEMENT_OFFRES = [
  'Ce que vous trouverez en ligne, ce sont seulement les offres d’emploi publiées en ce moment. Cela vous donne une idée de la réalité de l’emploi sur votre territoire, mais cela ne veut pas dire qu’il n’y a pas d’autres offres : il en existe aussi par d’autres moyens, et elles ne sont pas toutes publiées. C’est ce qu’on appelle le marché caché.',
  'Nous vous encourageons à chercher aussi les structures qui vous intéressent et à leur proposer votre candidature.',
  'Votre demande est envoyée à l’assistant en ligne que vous choisissez. Ce qu’il vous répond reste dans sa propre fenêtre : cette application ne le reprend pas, ne le vérifie pas et n’en est pas responsable.',
  'Les offres, les dates et les noms de structures peuvent être inexacts ou dépassés : vérifiez toujours auprès de la source. Vous faites de ces informations ce que vous voulez : vous pouvez les consulter, en tirer des pistes de réflexion, ou ne pas les regarder.'
];

var UCPM_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function ucpmDateEnTexte(date) {
  var d = date instanceof Date ? date : new Date();
  return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + UCPM_MOIS[d.getMonth()] + ' ' + d.getFullYear();
}

if (typeof module !== 'undefined' && module.exports) {
  // Les constantes de logique.js (UCPM_MAX_METIERS...) sont globales en navigateur ; ici on les fournit au test via global.
  module.exports = {
    UCPM_DEMARCHES: UCPM_DEMARCHES, UCPM_DEMARCHES_AVEC_EMPLOYEUR: UCPM_DEMARCHES_AVEC_EMPLOYEUR, UCPM_UNITES_DUREE: UCPM_UNITES_DUREE, UCPM_OBJECTIFS_PMSMP: UCPM_OBJECTIFS_PMSMP,
    UCPM_OBJECTIF_POUR_OFFRES: UCPM_OBJECTIF_POUR_OFFRES,
    ucpmDemarche: ucpmDemarche, ucpmTitreDemarche: ucpmTitreDemarche, ucpmObjectifVide: ucpmObjectifVide, ucpmObjectifValide: ucpmObjectifValide,
    ucpmNormaliserObjectif: ucpmNormaliserObjectif, ucpmDetailsObjectif: ucpmDetailsObjectif, ucpmEtiquetteObjectif: ucpmEtiquetteObjectif,
    ucpmCreerListes: ucpmCreerListes, ucpmNomMetier: ucpmNomMetier, ucpmToutesEntrees: ucpmToutesEntrees, ucpmEntreesCochees: ucpmEntreesCochees,
    ucpmTrouverEntree: ucpmTrouverEntree, ucpmCompterCoches: ucpmCompterCoches, ucpmBasculerCoche: ucpmBasculerCoche,
    ucpmAjouterIntitule: ucpmAjouterIntitule, ucpmCorrigerIntitule: ucpmCorrigerIntitule, ucpmRetirerIntitule: ucpmRetirerIntitule,
    ucpmAppliquerObjectif: ucpmAppliquerObjectif, ucpmCochesSansObjectif: ucpmCochesSansObjectif, ucpmPeutCreerCV: ucpmPeutCreerCV,
    ucpmLigneOffres: ucpmLigneOffres, ucpmConstruireDemandeOffres: ucpmConstruireDemandeOffres, ucpmNomDepartement: ucpmNomDepartement,
    ucpmDateEnTexte: ucpmDateEnTexte, UCPM_AVERTISSEMENT_OFFRES: UCPM_AVERTISSEMENT_OFFRES,
    ucpmRefParDefaut: ucpmRefParDefaut, ucpmRefCourante: ucpmRefCourante
  };
}
