/* ============================================================
   Module « Mettre mon CV en page, sans rien changer » : logique pure (aucun accès au DOM, testée par `npm test`).
   Chantier : docs/CHANTIER_CV_SANS_ASSISTANT_2026-10-22.md ; maquette : docs/MAQUETTE_CV_SANS_ASSISTANT_2026-10-22.html.

   Principe : la personne dépose son CV, on repère ses rubriques (par titre, par contenu), elle corrige, et on écrit la fiche du CV avec le MÊME moteur
   que l'import (fusionnerDonnees + SPECIFICATION_IMPORT, js/app.js). Aucun assistant en ligne, aucun mot n'est reformulé.

   Dépendances (briques existantes, jamais recopiées) : detecterCoordonneesSensibles (data/metiers.js), separerDatesDuTitre, normaliserDateImport,
   formaterDateCourte, estMentionEnCours, dateFinImportee (modules/cv-core/dates.js), detecterPermisDansTexte (modules/cv-core/identiteFormat.js).
   Dans le navigateur ce sont des fonctions globales ; sous Node (tests) elles sont chargées par require().
   ============================================================ */

var _csaDeps = {};
if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
  try {
    _csaDeps.detecterCoordonneesSensibles = require('../../data/metiers.js').detecterCoordonneesSensibles;
    var _csaDates = require('../cv-core/dates.js');
    ['separerDatesDuTitre', 'normaliserDateImport', 'formaterDateCourte', 'estMentionEnCours', 'dateFinImportee'].forEach(function (n) { _csaDeps[n] = _csaDates[n]; });
    _csaDeps.detecterPermisDansTexte = require('../cv-core/identiteFormat.js').detecterPermisDansTexte;
  } catch (e) { /* chargement partiel : les fonctions qui en dépendent le diront */ }
}
function _csa(nom) {
  var f = _csaDeps[nom] || ((typeof window !== 'undefined') ? window[nom] : undefined);
  if (typeof f !== 'function') { throw new Error('Brique manquante : ' + nom); }
  return f;
}

/* Ouverture de la voie 3 de « Reprendre mon CV » (Lot 7) : ouverte depuis le sous-lot 7b (Vérifier, écriture dans le CV, Vos documents). Remettre à faux grise la carte (aucun bouton mort). */
var CSA_OUVERT = true;
/* Un CV déposé en PDF arrive aplati (tout sur une ou deux lignes) dans le texte relu : il faut alors relire le fichier avec le lecteur de lignes. */
function csaTexteAplati(texte) {
  var t = String(texte === undefined || texte === null ? '' : texte);
  var nb = t.split(/\n/).filter(function (l) { return l.trim(); }).length;
  return t.length > 400 && nb <= 3;
}

/* Titres d'origine du CV (F.titres, par rubrique de ce module) -> intitules du CV (choixMq.intitulesPerso). La CLE d'un intitule est le nom d'origine de la rubrique dans la mise en
   page (_PDF_INTITULES, cvPdfTemplateMaquette.js). Seuls les titres differents de ce qui s'affiche par defaut sont gardes ; 40 caracteres au plus.
   libellesDefaut (facultatif) : { nom d'origine: texte affiche par defaut } quand il differe du nom (_mepLibelleDefaut). */
var CSA_NOM_ORIGINE_RUBRIQUE = { competences: 'Compétences professionnelles', qualites: 'Compétences comportementales', experience: 'Expérience professionnelle', formation: 'Formations',
  logiciels: 'Logiciels et outils', langues: 'Langues', certifications: 'Certifications', loisirs: 'Centres d’intérêt', engagements: 'Expérience personnelle', autres: 'Informations complémentaires' };
function csaIntitulesDOrigine(titres, libellesDefaut) {
  var res = {};
  Object.keys(CSA_NOM_ORIGINE_RUBRIQUE).forEach(function (rub) {
    var t = String((titres || {})[rub] || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 40) { return; }
    var nom = CSA_NOM_ORIGINE_RUBRIQUE[rub], affiche = (libellesDefaut && libellesDefaut[nom]) || nom;
    if (csaCompacter(t) === csaCompacter(affiche) || csaCompacter(t) === csaCompacter(nom)) { return; }
    res[nom] = t;
  });
  return res;
}

/* ---------- Rubriques ---------- */
// ic : icône Bootstrap (objets concrets, jamais de visage). titreCV : titre par défaut sur le CV.
var CSA_RUBRIQUES = {
  identite: { nom: 'Identité', ic: 'bi-card-heading', titreCV: '' },
  accroche: { nom: 'Titre et accroche', ic: 'bi-chat-quote', titreCV: 'Profil' },
  experience: { nom: 'Expérience', ic: 'bi-briefcase', titreCV: 'Expérience professionnelle' },
  formation: { nom: 'Formation', ic: 'bi-mortarboard', titreCV: 'Formation' },
  competences: { nom: 'Compétences', ic: 'bi-tools', titreCV: 'Compétences' },
  qualites: { nom: 'Qualités', ic: 'bi-stars', titreCV: 'Compétences comportementales' },
  logiciels: { nom: 'Logiciels et outils', ic: 'bi-laptop', titreCV: 'Logiciels et outils' },
  certifications: { nom: 'Certifications', ic: 'bi-patch-check', titreCV: 'Certifications' },
  langues: { nom: 'Langues', ic: 'bi-translate', titreCV: 'Langues' },
  loisirs: { nom: 'Loisirs', ic: 'bi-bicycle', titreCV: 'Centres d’intérêt' },
  engagements: { nom: 'Engagements', ic: 'bi-flag', titreCV: 'Expérience personnelle' },
  autres: { nom: 'Autres informations', ic: 'bi-collection', titreCV: 'Informations complémentaires' },
  aclasser: { nom: 'À classer', ic: 'bi-question-circle', titreCV: '' }
};
var CSA_ORDRE = ['identite', 'accroche', 'experience', 'formation', 'competences', 'qualites', 'logiciels', 'certifications', 'langues', 'loisirs', 'engagements', 'autres'];

/* ---------- Outils de texte ---------- */
function csaSansAccent(s) { return String(s === undefined || s === null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function csaPhrase(t) { var m = String(t).replace(/\s+/g, ' ').trim().toLowerCase(); return m.charAt(0).toUpperCase() + m.slice(1); }
function csaCompacter(s) { return csaSansAccent(s).replace(/[^a-z0-9]/g, ''); }
function csaSansPuce(l) { return String(l).replace(/^\s*[-•*•▪■\u2013\u2014]\s*/, '').trim(); }
function csaCases(l) { return String(l).split('\t').map(function (x) { return x.trim(); }).filter(Boolean); }

/* ---------- Titres de rubriques reconnus (comparés sans accent, sans espace ni ponctuation : « C O M P É T E N C E S » est lu comme « COMPÉTENCES ») ---------- */
var CSA_TITRES = {
  experience: ['experience', 'experiences', 'experience professionnelle', 'experiences professionnelles', 'mon experience', 'parcours', 'mon parcours', 'parcours professionnel', 'emploi', 'emplois', 'historique professionnel'],
  formation: ['formation', 'formations', 'formation et diplomes', 'formations et diplomes', 'diplome', 'diplomes', 'diplomes et formations', 'etudes', 'etudes et diplomes', 'ecole et diplomes', 'cursus', 'cursus scolaire', 'parcours scolaire et diplomes'],
  competences: ['competence', 'competences', 'competences cles', 'competences professionnelles', 'savoir faire', 'aptitudes'],
  qualites: ['savoir etre', 'qualites', 'qualites personnelles', 'qualites professionnelles', 'atouts', 'competences comportementales', 'points forts'],
  logiciels: ['logiciel', 'logiciels', 'logiciels et outils', 'outils', 'outils informatiques', 'informatique', 'bureautique', 'competences informatiques'],
  certifications: ['certification', 'certifications', 'certificat', 'certificats', 'habilitation', 'habilitations', 'habilitations et certifications', 'attestations', 'attestation'],
  langues: ['langue', 'langues'],
  loisirs: ['centres d interet', 'centre d interet', 'loisirs', 'interets', 'hobbies'],
  engagements: ['benevolat', 'engagement', 'engagements', 'engagements associatifs', 'vie associative', 'experience personnelle', 'experiences personnelles', 'activites extra professionnelles'],
  accroche: ['profil', 'presentation', 'a propos', 'a propos de moi', 'objectif', 'objectif professionnel'],
  identite: ['permis', 'permis de conduire', 'informations personnelles', 'etat civil', 'contact', 'coordonnees'],
  autres: ['informations complementaires', 'information complementaire', 'informations pratiques', 'divers', 'autres informations', 'disponibilite', 'disponibilites', 'mobilite']
};
var _csaTitresIndex = null;
function _csaIndexTitres() {
  if (_csaTitresIndex) { return _csaTitresIndex; }
  _csaTitresIndex = {};
  Object.keys(CSA_TITRES).forEach(function (rub) { CSA_TITRES[rub].forEach(function (t) { _csaTitresIndex[csaCompacter(t)] = rub; }); });
  return _csaTitresIndex;
}
// Un titre en majuscules, court, sans chiffre (même s'il n'est pas reconnu : « CE QUE JE SAIS FAIRE »).
function csaCapsTitre(t) {
  var s = String(t).trim(), mots = s.split(/\s+/);
  return s === s.toUpperCase() && /[A-ZÀ-Ý]{3}/.test(s) && !/\d/.test(s) && mots.length <= 6 && s.length <= 42;
}
// Retourne { rub } (rubrique reconnue, ou 'aclasser' pour un titre inconnu en majuscules) ou null si la ligne n'est pas un titre.
function csaTypeTitre(t) {
  var s = String(t).trim(), lettresEspacees = /^(?:\S ){3,}\S(?: \S)*$/.test(s);
  if (!s || /\d/.test(s) || /^[-•*•]/.test(s) || (!lettresEspacees && s.split(/\s+/).length > 6)) { return null; }
  var rub = _csaIndexTitres()[csaCompacter(s)];
  if (rub) { return { rub: rub }; }
  return csaCapsTitre(s) ? { rub: 'aclasser' } : null;
}

/* ---------- Repérage par le contenu (simples listes de mots, sur le texte sans accent) : une PROPOSITION, jamais une certitude ---------- */
var CSA_RE = {
  langue: /^(francais|anglais|espagnol|arabe|allemand|italien|portugais|turc|russe|chinois|creole|berbere|kabyle|polonais|roumain)\b/,
  permis: /permis\s+[a-e]\b|permis de conduire|vehicule/,
  dispo: /disponib|rqth|travailleur handicape|mobilite|preavis/,
  certif: /\b(caces|sst|pix|toeic|toefl|bafa|bafd|afps|psc1|habilitation|certificat|certification|attestation)\b/,
  logiciel: /\b(word|excel|powerpoint|outlook|photoshop|canva|sage|autocad|libreoffice|pack office|logiciels?|wordpress)\b/,
  engagement: /\b(benevol\w*|association|associatif|croix[- ]rouge|restos du coeur|banque alimentaire)\b/,
  qualite: /\b(serieu\w*|ponctuel\w*|rigoureu\w*|autonom\w*|motive\w*|dynamique|organise\w*|adaptab\w*|curieu\w*|polyvalen\w*|esprit d.equipe|patien\w*|sociable|fiable|consciencieu\w*|volontaire)\b/,
  loisir: /\b(football|rugby|basket|handball|tennis|natation|randonnee|course a pied|velo|cyclisme|lecture|cinema|musique|dessin|photographie|voyages?|cuisine|jardinage|bricolage|peche|chasse|echecs|jeux video|theatre|danse|yoga)\b/
};
var _CSA_ICONES = { tel: String.fromCodePoint(0x1F4DE), mail: String.fromCodePoint(0x1F4E7), cpv: String.fromCodePoint(0x1F4CD), reseau: String.fromCodePoint(0x1F517) };
// Ce que le repérage existant trouve dans UNE ligne : { tel, mail, cpv, reseau } (valeurs, ou chaîne vide).
function csaCoordonnees(ligne) {
  var res = { tel: '', mail: '', cpv: '', reseau: '' };
  _csa('detecterCoordonneesSensibles')(String(ligne)).forEach(function (e) {
    Object.keys(_CSA_ICONES).forEach(function (k) { if (e.icone === _CSA_ICONES[k] && !res[k]) { res[k] = e.valeur; } });
  });
  return res;
}
function csaLigneContact(l) { var c = csaCoordonnees(l); return !!(c.tel || c.mail || c.reseau); }
function csaClasserLigne(l) {
  var n = csaSansAccent(l);
  if (csaLigneContact(l)) { return 'identite'; }
  if (CSA_RE.langue.test(n)) { return 'langues'; }
  if (CSA_RE.permis.test(n)) { return 'identite'; }
  if (CSA_RE.dispo.test(n)) { return 'autres'; }
  if (CSA_RE.certif.test(n)) { return 'certifications'; }
  if (CSA_RE.logiciel.test(n)) { return 'logiciels'; }
  if (CSA_RE.engagement.test(n)) { return 'engagements'; }
  if (CSA_RE.qualite.test(n)) { return 'qualites'; }
  if (CSA_RE.loisir.test(n)) { return 'loisirs'; }
  return null;
}
// Deux sortes de lignes sont toujours reconnues, même sous un titre qui ne leur correspond pas : le permis (identité) et la disponibilité (autres informations).
function csaLigneSure(l) {
  var n = csaSansAccent(l);
  if (CSA_RE.permis.test(n)) { return 'identite'; }
  if (CSA_RE.dispo.test(n)) { return 'autres'; }
  return null;
}

/* ---------- Découpage en blocs et classement ---------- */
// Un bloc : { id, lignes[], rub, auto: 'titre'|'contenu'|'choix'|'aucun', origine (titre d'origine), avant (avant tout titre), prop (rubrique proposée), nomLibre }.
var _csaUid = 0;
function csaNouvelId() { return ++_csaUid; }

function csaDecouper(texte) {
  var lignes = String(texte === undefined || texte === null ? '' : texte).replace(/\r/g, '').split('\n'), brut = [], cur = null, rubC = null, orig = '', premier = false, avant = true, titreVu = false;
  function ouvrir(rub, auto, entete) { cur = { id: csaNouvelId(), lignes: [], rub: rub, auto: auto, origine: '', avant: avant, entete: !!entete }; brut.push(cur); return cur; }
  var lignesNettes = lignes.map(function (l) { return l.trim(); });
  lignesNettes.forEach(function (t, idx) {
    if (t === null) { return; }   // recollée au titre de la ligne d'avant
    if (!t) { cur = null; return; }
    if (/^[^A-Za-z0-9À-ÿ]+$/.test(t)) { return; }   // « ■ », « • » seuls : décoration
    // Titre écrit sur deux lignes : on essaie de recoller la ligne suivante (« COMPÉTENCES » + « COMPORTEMENTALES »).
    var suivante = lignesNettes[idx + 1];
    if (suivante && csaCapsTitre(t) && csaCapsTitre(suivante)) {
      var hh = csaTypeTitre(t + ' ' + suivante);
      if (hh && hh.rub !== 'aclasser') { lignesNettes[idx + 1] = null; t = t + ' ' + suivante; }
    }
    var h = csaTypeTitre(t);
    // Avant tout titre reconnu, une ligne en majuscules fait partie de l'en-tête (le métier visé écrit en capitales, par exemple), pas d'un titre inconnu.
    if (h && h.rub === 'aclasser' && !titreVu) { h = null; }
    if (h) {
      avant = false;
      if (h.rub === 'aclasser') { ouvrir('aclasser', 'aucun', true).lignes.push(t); rubC = null; return; }
      titreVu = true; rubC = h.rub; orig = t; premier = true; cur = null; return;
    }
    if (!cur) {
      if (rubC) { ouvrir(rubC, 'titre'); if (premier) { cur.origine = orig; premier = false; } } else { ouvrir('aclasser', 'aucun'); }
    }
    cur.lignes.push(t);
  });
  var sortie = [];
  brut.forEach(function (b) {
    var texteB = b.lignes.join('\n');
    if (b.auto === 'titre') {
      // Sous un titre, le permis et la disponibilité restent reconnus pour ce qu'ils sont.
      var rubTitre = b.rub, origineTitre = b.origine, sures = b.lignes.map(csaLigneSure);
      if (['loisirs', 'competences', 'qualites', 'langues', 'logiciels', 'certifications', 'engagements'].indexOf(rubTitre) === -1 || sures.every(function (x) { return x === null; })) { sortie.push(b); return; }
      var coupes = [];
      b.lignes.forEach(function (l, k) { var d = coupes[coupes.length - 1]; if (d && d.rub === sures[k]) { d.lignes.push(l); } else { coupes.push({ rub: sures[k], lignes: [l] }); } });
      coupes.forEach(function (run, k) {
        var nb = k === 0 ? b : { id: csaNouvelId(), avant: b.avant };
        nb.lignes = run.lignes;
        if (run.rub) { nb.rub = run.rub; nb.auto = 'contenu'; nb.origine = ''; }
        else { nb.rub = rubTitre; nb.auto = 'titre'; nb.origine = origineTitre; origineTitre = ''; }
        sortie.push(nb);
      });
      return;
    }
    if (b.entete) { sortie.push(b); return; }
    if (b.lignes.some(csaLigneContact)) { b.rub = 'identite'; b.auto = 'contenu'; sortie.push(b); return; }
    if (b.avant && b.lignes.length === 1 && b.lignes[0].length >= 50) { b.rub = 'accroche'; b.auto = 'contenu'; sortie.push(b); return; }
    // Sinon : ligne par ligne, en regroupant les lignes voisines de même nature.
    var runs = [];
    b.lignes.forEach(function (l) {
      var r = csaClasserLigne(l), dernier = runs[runs.length - 1];
      if (dernier && dernier.rub === r) { dernier.lignes.push(l); } else { runs.push({ rub: r, lignes: [l] }); }
    });
    runs.forEach(function (run, k) {
      var nb = k === 0 ? b : { id: csaNouvelId(), origine: '', avant: b.avant };
      nb.lignes = run.lignes;
      nb.rub = run.rub || 'aclasser';
      nb.auto = run.rub ? 'contenu' : 'aucun';
      sortie.push(nb);
    });
  });
  // Une idée de rubrique pour un bloc encore incertain : proposée d'un toucher, jamais appliquée toute seule.
  sortie.forEach(function (b) {
    if (b.rub !== 'aclasser') { return; }
    var corps = (b.lignes.length > 1 && b.entete) ? b.lignes.slice(1) : b.lignes;
    var classes = corps.map(csaClasserLigne);
    if (classes.length && classes[0] && classes.every(function (c) { return c === classes[0]; })) { b.prop = classes[0]; }
  });
  return sortie;
}

// Le titre d'un bloc (celui du CV d'origine, ou le nom choisi par la personne) et l'index de la ligne qui est ce titre, s'il est resté dans le bloc.
function csaAnalyserBloc(b) {
  var titre = b.nomLibre || b.origine || '', idx = -1;
  if (!titre && b.rub !== 'aclasser' && b.lignes.length > 1 && b.entete) { titre = b.lignes[0]; idx = 0; }
  return { titre: titre, idx: idx, libre: !!b.nomLibre };
}

/* Gestes de la personne sur les blocs (retournent le nouveau tableau, sans toucher l'ancien). */
function csaChoisirRubrique(blocs, i, rub) {
  return blocs.map(function (b, k) { if (k !== i) { return b; } var c = Object.assign({}, b); c.rub = rub; c.auto = 'choix'; return c; });
}
function csaFusionnerAvecLeDessus(blocs, i) {
  if (i < 1 || i >= blocs.length) { return blocs; }
  var res = blocs.slice(), haut = Object.assign({}, res[i - 1]);
  haut.lignes = haut.lignes.concat(res[i].lignes);
  res.splice(i - 1, 2, haut);
  return res;
}
function csaCouperApres(blocs, i, k) {
  var b = blocs[i];
  if (!b || k < 0 || k >= b.lignes.length - 1) { return blocs; }
  var res = blocs.slice(), haut = Object.assign({}, b), bas = { id: csaNouvelId(), lignes: b.lignes.slice(k + 1), rub: b.rub, auto: 'choix', origine: '', avant: b.avant };
  haut.lignes = b.lignes.slice(0, k + 1);
  res.splice(i, 1, haut, bas);
  return res;
}

/* ---------- Fiches : lire poste / entreprise / dates d'après la position des mots (une supposition : marquée « à vérifier ») ---------- */
function csaRetirerBords(r) { return String(r).replace(/^[\s\-\u2013\u2014|,;]+|[\s\-\u2013\u2014|,;]+$/g, '').trim(); }

var _CSA_MOIS = '(?:janv|fevr|mars|avr|mai|juin|juil|aout|sept|oct|nov|dec)[a-z.]*';
var _CSA_ANNEE = '(?:' + _CSA_MOIS + '\\s+)?(?:19|20)\\d{2}';
var _CSA_RE_PLAGE_SEULE = new RegExp('^(?:(?:de|depuis|du|en)\\s+)?(' + _CSA_ANNEE + ')(?:(?:\\s*(?:-|\\u2013|\\u2014)\\s*|\\s+(?:a|au)\\s+)(' + _CSA_ANNEE + "|aujourd.?hui|present|actuel|actuellement|en cours))?$");
// Une ligne qui n'est qu'une période (« Mars 2019 - Juin 2024 », « 2015 - 2019 », « 2018 ») : { debut, fin, enCours } en dates normalisées, sinon null.
function csaPlageSeule(ligne) {
  var m = _CSA_RE_PLAGE_SEULE.exec(csaSansAccent(csaRetirerBords(ligne)));
  if (!m) { return null; }
  var norm = _csa('normaliserDateImport'), debut = norm(m[1]), fin = m[2] ? norm(m[2]) : '';
  return { debut: debut, fin: fin, enCours: !!m[2] && !fin };
}
// Affichage d'une date normalisée telle que l'application la montre (« mars 2019 »), et retour (le texte tapé est relu par normaliserDateImport).
function csaDateAffichee(norm) { return norm ? _csa('formaterDateCourte')(norm) : ''; }

function csaParserExperience(lignes) {
  var e = { poste: '', entreprise: '', lieu: '', debut: '', fin: '', enCours: false, missions: [], devine: {} };
  var restes = [], sep = _csa('separerDatesDuTitre'), trouve = false;
  lignes.forEach(function (l) {
    var propre = csaCases(l).join(' ');
    if (!trouve) {
      var seule = csaPlageSeule(propre);
      if (seule) { e.debut = csaDateAffichee(seule.debut); e.fin = csaDateAffichee(seule.fin); e.enCours = seule.enCours; trouve = true; return; }
      var d = sep(propre);
      if (d.trouve) { e.debut = csaDateAffichee(d.dateDebut); e.fin = csaDateAffichee(d.dateFin); e.enCours = d.enCours; trouve = true; propre = d.titre; }
    }
    propre = csaRetirerBords(propre);
    if (trouve && csaPlageSeule(propre)) { return; }   // une 2e période seule n'est ni un poste ni une mission
    if (propre) { restes.push(propre); }
  });
  var premiere = restes.shift() || '';
  var lieuP = premiere.match(/\(([^)]+)\)/);
  if (lieuP) { e.lieu = lieuP[1].trim(); premiere = premiere.replace(lieuP[0], ' '); }
  var parts = premiere.split(/\s+-\s+|\s+\u2013\s+|,\s+|\s{2,}/).map(function (x) { return x.trim(); }).filter(Boolean);
  e.poste = parts[0] || ''; e.entreprise = parts[1] || ''; if (!e.lieu) { e.lieu = parts[2] || ''; }
  if (!e.entreprise && restes.length && !/^\s*[-•*•]/.test(restes[0]) && restes[0].length < 60) { e.entreprise = restes.shift(); }
  e.missions = restes.map(csaSansPuce).filter(Boolean);
  ['poste', 'entreprise', 'lieu'].forEach(function (c) { if (e[c]) { e.devine[c] = true; } });
  return e;
}

/* Une formation par bloc. Une 2e ligne qui porte une année commence sans doute une autre formation : elle n'est pas mélangée avec la première, elle est
   rangée ailleurs (certification, sinon « Autres informations ») avec une alerte. rangeur(ligne) reçoit chaque ligne en trop. */
function csaParserFormation(lignes, rangeur) {
  var f = { intitule: '', annee: '', etablissement: '', lieu: '', devine: {} }, toutes = lignes.map(function (l) { return csaCases(l).join(' '); }), reste = [], vues = 0, coupe = -1;
  toutes.forEach(function (l, k) { if (/(?:19|20)\d{2}/.test(l)) { vues++; if (vues === 2 && coupe === -1) { coupe = k; } } });
  if (coupe !== -1) { reste = toutes.slice(coupe); toutes = toutes.slice(0, coupe); }
  var sep = _csa('separerDatesDuTitre');
  var propres = toutes.map(function (l) {
    var d = sep(l);
    if (d.trouve && !f.annee) { f.annee = (d.dateFin && d.dateFin !== d.dateDebut) ? d.dateFin.slice(0, 4) : d.dateDebut.slice(0, 4); l = d.titre; }
    else if (!f.annee) {
      var m = l.match(/(?:^|[\s,(])((?:19|20)\d{2})(?!\d)/);
      if (m) { f.annee = m[1]; l = l.replace(m[1], ' '); }
    }
    return csaRetirerBords(l.replace(/\(\s*\)/g, ' '));
  }).filter(Boolean);
  f.intitule = propres[0] || '';
  var suite = propres.slice(1), prem = (suite.shift() || '').split(/,\s*/);
  f.etablissement = prem[0] || ''; f.lieu = prem.slice(1).join(', ');
  suite = suite.concat(reste.map(csaRetirerBords).filter(Boolean));
  var rangees = [];
  if (suite.length && typeof rangeur === 'function') { suite.forEach(function (x) { rangees.push({ ligne: x, rubrique: rangeur(x) }); }); }
  ['intitule', 'etablissement', 'lieu'].forEach(function (c) { if (f[c]) { f.devine[c] = true; } });
  return { formation: f, rangees: rangees };
}

var _CSA_RE_DEBUT_DATE = new RegExp('^\\s*\\(?\\s*(?:(?:de|depuis|du|en)\\s+)?(?:' + _CSA_ANNEE + ')');
function _csaEstPuce(l) { return /^\s*[-•*\u2022\u25aa\u25a0]/.test(l); }
/* Un PDF n'a pas de ligne vide entre deux expériences : on repère le début de chacune (une ligne de poste qui porte sa période, ou une période seule, qui
   appartient alors à la ligne de poste juste au-dessus). Retourne une liste de groupes de lignes. */
function csaScinderExperiences(lignes) {
  var sep = _csa('separerDatesDuTitre'), debuts = [];
  var propres = lignes.map(function (l) { return csaCases(l).join(' '); });
  propres.forEach(function (l, i) {
    if (_csaEstPuce(l)) { return; }
    if (csaPlageSeule(l)) {
      var d = -1;
      if (i === 0) { d = 0; }
      else if (!_csaEstPuce(propres[i - 1]) && !csaPlageSeule(propres[i - 1]) && debuts.indexOf(i - 1) === -1) { d = i - 1; }
      if (d !== -1 && debuts.indexOf(d) === -1) { debuts.push(d); }
      return;
    }
    var r = sep(l);
    if (r.trouve && csaRetirerBords(r.titre)) { if (debuts.indexOf(i) === -1) { debuts.push(i); } }
  });
  if (debuts.length < 2) { return [lignes]; }
  debuts.sort(function (a, b) { return a - b; });
  return debuts.map(function (d, k) { return lignes.slice(k === 0 ? 0 : d, k + 1 < debuts.length ? debuts[k + 1] : lignes.length); });
}
/* Formations sans ligne vide entre elles. Une ligne d'établissement (« Lycée X, 2015 », « Centre de formation Y ») complète la formation en cours ; une ligne qui
   porte une année alors que la formation en cours en a déjà une, ou une ligne de titre après une formation déjà datée, ouvre la suivante ; une année en début de
   ligne (« 2015 BTS Z ») ouvre aussi la suivante. */
var _CSA_RE_ETABLISSEMENT = /\b(lycee|college|ecole|universite|institut|centre|cfa|greta|afpa|iut|faculte|campus|academie|organisme)\b/;
function csaScinderFormations(lignes) {
  var annees = lignes.filter(function (l) { return /(?:19|20)\d{2}/.test(l); }).length;
  if (annees < 2) { return [lignes]; }
  var groupes = [], cur = [], curAnnee = false;
  lignes.forEach(function (l) {
    var propre = csaCases(l).join(' '), sans = csaSansAccent(propre), aAnnee = /(?:19|20)\d{2}/.test(propre);
    var ouvre = aAnnee && _CSA_RE_DEBUT_DATE.test(sans), etab = _CSA_RE_ETABLISSEMENT.test(sans) || _csaEstPuce(propre);
    var nouveau;
    if (!cur.length) { nouveau = false; }
    else if (ouvre) { nouveau = true; }
    else if (etab) { nouveau = false; }
    else if (aAnnee) { nouveau = curAnnee; }
    else { nouveau = curAnnee; }
    if (nouveau) { groupes.push(cur); cur = []; curAnnee = false; }
    cur.push(l);
    if (aAnnee) { curAnnee = true; }
  });
  if (cur.length) { groupes.push(cur); }
  return groupes;
}

function csaListe(lignes, virgules) {
  var res = [];
  lignes.forEach(function (l) {
    csaCases(l).forEach(function (cellule) {
      (virgules ? csaSansPuce(cellule).split(/[,;•·\u2022]\s*/) : [csaSansPuce(cellule)]).forEach(function (x) { x = x.trim(); if (x) { res.push(x); } });
    });
  });
  return res;
}

var _CSA_RE_ADRESSE = /^\d{1,3}\s*(bis|ter)?[, ]+\s*(rue|avenue|av\.|chemin|impasse|place|boulevard|bd|route|allee|allée|lotissement|residence|résidence)\b/i;
/* Nom et prénom d'une ligne « BENALI Karim » : les mots tout en majuscules sont le nom, les autres le prénom. Une supposition (marquée « à vérifier »). */
function csaSeparerNomPrenom(texte, email) {
  var mots = String(texte).trim().split(/\s+/).filter(Boolean), nom = [], prenom = [];
  if (mots.length === 1) {   // un seul mot : c'est le prénom si le courriel commence par lui (« camille.martin »), sinon le nom
    var premierJeton = csaSansAccent(String(email || '').split('@')[0]).split(/[._\-+]+/)[0];
    return (premierJeton && premierJeton === csaSansAccent(mots[0])) ? { nom: '', prenom: mots[0] } : { nom: mots[0], prenom: '' };
  }
  mots.forEach(function (m) { (m === m.toUpperCase() && /[A-ZÀ-Ý]/.test(m) ? nom : prenom).push(m); });
  if (!nom.length) { nom = prenom.splice(prenom.length - 1, 1); }   // « Camille Martin » : on prend le dernier mot pour le nom
  return { nom: nom.join(' '), prenom: prenom.join(' ') };
}

/* Construit les fiches d'après les blocs classés. Retourne :
   { identite{civilite,nom,prenom,telephone,email,adresse,codePostal,ville,lien,permis}, titre, accroche, experience[], formation[], competences[], qualites[], logiciels[],
     certifications[], langues[], loisirs[], engagements[], autres[], titres{rubrique: titre d'origine}, devine{chemin: true}, alertes[{cle,texte}] } */
function csaConstruireFiches(blocs) {
  var F = { identite: { civilite: '', nom: '', prenom: '', telephone: '', email: '', adresse: '', codePostal: '', ville: '', lien: '', permis: '' }, titre: '', accroche: '',
    experience: [], formation: [], competences: [], qualites: [], logiciels: [], certifications: [], langues: [], loisirs: [], engagements: [], autres: [], titres: {}, devine: {}, alertes: [] };
  blocs.forEach(function (b) {
    var a = csaAnalyserBloc(b), lignes = b.lignes.slice(a.idx === 0 ? 1 : 0);
    if (b.rub === 'aclasser') { b.lignes.forEach(function (l) { F.autres.push(csaCases(l).join(' ')); }); return; }
    if (a.titre && b.rub === 'autres' && F.titres.autres && F.titres.autres !== csaPhrase(a.titre)) {
      // Une seule rubrique libre sur le CV : un 2e titre différent n'est pas perdu, il reste écrit comme une ligne.
      lignes = b.lignes.slice();
      F.alertes.push({ cle: 'autres', texte: 'Deux rubriques différentes (« ' + F.titres.autres + ' » et « ' + csaPhrase(a.titre) + ' ») sont regroupées sous le même nom sur le CV. Le titre « ' + csaPhrase(a.titre) + ' » est gardé comme première ligne de ses informations.' });
    } else if (a.titre && !F.titres[b.rub]) { F.titres[b.rub] = csaPhrase(a.titre); }
    switch (b.rub) {
      case 'identite': csaLireIdentite(lignes, F); break;
      case 'accroche': F.accroche = (F.accroche ? F.accroche + ' ' : '') + lignes.map(function (l) { return csaCases(l).join(' '); }).join(' '); break;
      case 'experience': csaScinderExperiences(lignes).forEach(function (g) {
        var e = csaParserExperience(g);
        if (e.poste || e.entreprise || e.missions.length) { F.experience.push(e); } else { g.forEach(function (x) { F.autres.push(csaCases(x).join(' ')); }); }
      }); break;
      case 'formation':
        var rangees = [];
        csaScinderFormations(lignes).forEach(function (g) {
          // Un groupe qui parle d'une certification (CACES, SST...) va dans « Certifications », même rangé sous « Formation ».
          if (csaClasserLigne(csaCases(g[0]).join(' ')) === 'certifications') {
            var texteCertif = g.map(function (l) { return csaCases(l).join(' '); }).join(' ');
            F.certifications.push(texteCertif); rangees.push({ ligne: texteCertif, rubrique: 'certifications' });
            return;
          }
          var r = csaParserFormation(g, function (x) { var c = csaClasserLigne(x); var cible = (c && c !== 'identite' && Array.isArray(F[c])) ? c : 'autres'; F[cible].push(x); return cible; });
          F.formation.push(r.formation);
          r.rangees.forEach(function (x) { rangees.push(x); });
        });
        if (rangees.length) {
          F.alertes.push({ cle: 'formation', texte: 'Des lignes de ce bloc ne sont pas des formations. Elles ont été rangées ailleurs pour ne rien perdre : ' +
            rangees.map(function (x) { return '« ' + x.ligne + ' » : ' + CSA_RUBRIQUES[x.rubrique].nom; }).join(' ; ') + '. Pour les ranger autrement, revenez au classement et utilisez les ciseaux.' });
        }
        break;
      case 'competences': F.competences = F.competences.concat(csaListe(lignes, true)); break;
      case 'qualites': F.qualites = F.qualites.concat(csaListe(lignes, true)); break;
      case 'logiciels': F.logiciels = F.logiciels.concat(csaListe(lignes, true)); break;
      case 'certifications': F.certifications = F.certifications.concat(csaListe(lignes, false)); break;
      case 'langues': F.langues = F.langues.concat(csaListe(lignes, false)); break;
      case 'loisirs': F.loisirs = F.loisirs.concat(csaListe(lignes, true)); break;
      case 'engagements': F.engagements = F.engagements.concat(csaListe(lignes, false)); break;
      default: F.autres = F.autres.concat(csaListe(lignes, false));
    }
  });
  return F;
}

function csaLireIdentite(lignes, F) {
  var id = F.identite, restes = [];
  lignes.forEach(function (l) {
    var propre = csaSansPuce(csaCases(l).join(' '));
    if (CSA_RE.permis.test(csaSansAccent(propre)) && !csaLigneContact(propre)) { id.permis = (id.permis ? id.permis + ', ' : '') + csaRetirerBords(propre); return; }
    var c = csaCoordonnees(propre), r = propre;
    if (c.tel && !id.telephone) { id.telephone = c.tel; r = r.replace(c.tel, ' '); }
    if (c.mail && !id.email) { id.email = c.mail; r = r.replace(c.mail, ' '); }
    if (c.reseau && !id.lien) { id.lien = c.reseau; r = r.replace(c.reseau, ' '); }
    if (c.cpv && !id.codePostal) { var p = c.cpv.split(/\s+/); id.codePostal = p[0]; id.ville = p.slice(1).join(' '); r = r.replace(c.cpv, ' '); }
    r = csaRetirerBords(r); if (r) { restes.push(r); }
  });
  var suite = [];
  restes.forEach(function (r) {
    var inv = r.match(/^([A-Za-zÀ-ÿ' -]+?)[,\s]+(\d{5})$/);   // « Limoges 87000 » ou « Limoges, 87000 » : la ville avant le code postal
    if (!id.adresse && _CSA_RE_ADRESSE.test(r)) { id.adresse = r; }
    else if (!id.codePostal && inv) { id.ville = inv[1].trim(); id.codePostal = inv[2]; F.devine['identite.ville'] = true; F.devine['identite.codePostal'] = true; }
    else { suite.push(r); }
  });
  var iNom = (id.nom || id.prenom) ? -1 : csaIndexNom(suite, id.email), iNom2 = -1, resteTitre = '';
  if (iNom !== -1) {
    var np0 = csaSeparerNomPrenom(suite[iNom], id.email);
    // Le prénom seul sur sa ligne : le nom est sur une autre ligne qui reprend l'autre mot du courriel (« MARTIN » ou « MARTIN DE SÉCURITÉ » : le reste est la suite du titre).
    if (np0.prenom && !np0.nom) {
      var autreJeton = csaSansAccent(String(id.email || '').split('@')[0]).split(/[._\-+]+/).filter(function (j) { return j.length >= 2 && !/\d/.test(j); }).filter(function (j) { return j !== csaSansAccent(np0.prenom); })[0];
      suite.forEach(function (r, k) {
        if (iNom2 !== -1 || k === iNom || !autreJeton) { return; }
        var mots = r.split(/\s+/);
        if (csaSansAccent(mots[0]) === autreJeton) { iNom2 = k; id.nom = mots[0]; resteTitre = mots.slice(1).join(' '); }
      });
    }
  }
  suite.forEach(function (r, k) {
    if (k === iNom) { var np = csaSeparerNomPrenom(r, id.email); id.nom = id.nom || np.nom; id.prenom = np.prenom; F.devine['identite.nom'] = true; F.devine['identite.prenom'] = true; }
    else if (k === iNom2) { /* déjà lu */ }
    else if (!F.titre) { F.titre = r; F.devine['titre'] = true; }
    else { F.autres.push(r); }
  });
  if (resteTitre) { F.titre = (F.titre ? F.titre + ' ' : '') + resteTitre; F.devine['titre'] = true; }
}
/* Quelle ligne est le nom ? Celle qui reprend le plus de mots du courriel (« camille.martin@... ») ; sans courriel, la première ligne courte. -1 s'il n'y en a pas. */
function csaIndexNom(lignes, email) {
  var cand = [];
  lignes.forEach(function (l, k) { if (l.split(/\s+/).length <= 4 && !/\d/.test(l)) { cand.push(k); } });
  if (!cand.length) { return -1; }
  var jetons = csaSansAccent(String(email || '').split('@')[0]).split(/[._\-+]+/).filter(function (j) { return j.length >= 2 && !/\d/.test(j); });
  if (!jetons.length) { return cand[0]; }
  var meilleur = -1, score = 0;
  cand.forEach(function (k) {
    var n = csaSansAccent(lignes[k]), sc = jetons.filter(function (j) { return n.indexOf(j) !== -1; }).length;
    if (sc > score) { score = sc; meilleur = k; }
  });
  return meilleur !== -1 ? meilleur : cand[0];
}

/* ---------- Saisie à la main (« Je n'ai pas de CV ») : les MÊMES fiches, vides, avec une carte d'expérience et une de formation prêtes à remplir ---------- */
function csaExperienceVide() { return { poste: '', entreprise: '', lieu: '', debut: '', fin: '', enCours: false, missions: [], devine: {} }; }
function csaFormationVide() { return { intitule: '', annee: '', etablissement: '', lieu: '', devine: {} }; }
function csaFicheVide() {
  var F = csaConstruireFiches([]);
  F.experience.push(csaExperienceVide()); F.formation.push(csaFormationVide());
  return F;
}

/* ---------- Comptage (pour « X informations sur X sont sur le CV ») ---------- */
function csaCompter(F) {
  var n = 0, plein = function (x) { return String(x === undefined || x === null ? '' : x).trim() !== ''; };
  Object.keys(F.identite).forEach(function (c) { if (plein(F.identite[c])) { n++; } });
  if (plein(F.titre)) { n++; }
  if (plein(F.accroche)) { n++; }
  F.experience.forEach(function (e) { ['poste', 'entreprise', 'lieu', 'debut', 'fin'].forEach(function (c) { if (plein(e[c])) { n++; } }); n += e.missions.filter(plein).length; });
  F.formation.forEach(function (f) { ['intitule', 'annee', 'etablissement', 'lieu'].forEach(function (c) { if (plein(f[c])) { n++; } }); });
  ['competences', 'qualites', 'logiciels', 'certifications', 'langues', 'loisirs', 'engagements', 'autres'].forEach(function (r) { n += F[r].filter(plein).length; });
  return n;
}

/* ---------- Vers la fiche du CV : décisions au format de fusionnerDonnees(dossier, decisions, SPECIFICATION_IMPORT) (js/app.js) ---------- */
function csaDecoupeLangue(texte) {
  var t = String(texte).trim(), m = t.match(/^(.+?)\s*(?::|\s-\s|\u2013|\()\s*(.+?)\)?$/);
  return m ? { langue: m[1].trim(), niveau: m[2].trim() } : { langue: t, niveau: '' };
}
function csaVersDecisions(F) {
  var plein = function (x) { return String(x === undefined || x === null ? '' : x).trim() !== ''; };
  var norm = _csa('normaliserDateImport'), finImportee = _csa('dateFinImportee'), id = F.identite, champsId = {};
  ['civilite', 'nom', 'prenom', 'adresse', 'codePostal', 'ville', 'lien'].forEach(function (c) { if (plein(id[c])) { champsId[c] = id[c].trim(); } });
  if (plein(id.telephone)) { champsId.telephone = id.telephone.trim(); }
  if (plein(id.email)) { champsId.email = id.email.trim(); }
  var pres = {};
  if (plein(F.titre)) { pres.titre = F.titre.trim(); }
  if (plein(F.accroche)) { pres.accroche = F.accroche.trim(); }
  var decisions = {
    identite: { champsAAppliquer: champsId },
    presentation: { champsAAppliquer: pres },
    experiences: { elementsAAjouter: F.experience.filter(function (e) { return plein(e.poste) || plein(e.entreprise) || e.missions.length; }).map(function (e) {
      var debut = norm(e.debut), fin = e.enCours ? '' : (plein(e.fin) ? finImportee(debut, e.fin, false) : (debut && plein(e.debut) ? debut : ''));
      return { poste: e.poste.trim(), entreprise: e.entreprise.trim(), lieu: e.lieu.trim(), dateDebut: debut, dateFin: fin, stage: null, missions: e.missions.filter(plein) };
    }) },
    formations: { elementsAAjouter: F.formation.filter(function (f) { return plein(f.intitule); }).map(function (f) {
      return { niveau: '', intitule: f.intitule.trim(), annee: String(f.annee || '').trim(), etablissement: f.etablissement.trim(), lieu: f.lieu.trim(), missions: [] };
    }) },
    competences: { savoirFaire: { elementsAAjouter: F.competences.filter(plein) }, savoirEtre: { elementsAAjouter: F.qualites.filter(plein) }, savoirs: { elementsAAjouter: [] } },
    langues: { elementsAAjouter: F.langues.filter(plein).map(csaDecoupeLangue) },
    certifications: { elementsAAjouter: F.certifications.filter(plein) },
    logiciels: { elementsAAjouter: F.logiciels.filter(plein) },
    loisirs: { elementsAAjouter: F.loisirs.filter(plein) },
    engagements: { elementsAAjouter: F.engagements.filter(plein).map(function (t) { return { texte: t, dateDebut: '', dateFin: '', missions: [] }; }) },
    experiencesPerso: { elementsAAjouter: [] },
    informationsNonClassees: { elementsAAjouter: F.autres.filter(plein) }
  };
  if (plein(id.permis)) {
    var p = _csa('detecterPermisDansTexte')(id.permis) || { possede: true, categories: [], vehicule: null };
    var champsPermis = { possede: p.possede };
    if (p.categories && p.categories.length) { champsPermis.categories = p.categories; }
    if (p.vehicule !== null && p.vehicule !== undefined) { champsPermis.vehicule = p.vehicule; }
    decisions.permis = { champsAAppliquer: champsPermis };
  }
  return decisions;
}

/* Le moteur d'import ajoute un point final à chaque mission : ce module garde les mots EXACTS de la personne. Après la fusion, on réécrit les missions
   telles quelles (une par ligne). dossierCible.experiences est retriée par la fusion : on retrouve chaque expérience par poste + entreprise + début. */
function csaRestituerMissions(dossierCible, F) {
  var norm = _csa('normaliserDateImport'), rendu = 0;
  F.experience.forEach(function (e) {
    var cible = (dossierCible.experiences || []).filter(function (x) { return x.poste === e.poste.trim() && x.entreprise === e.entreprise.trim() && x.dateDebut === norm(e.debut); })[0];
    if (cible && e.missions.length) { cible.missions = e.missions.map(function (m) { return m.trim(); }).filter(Boolean).join('\n'); rendu++; }
  });
  return rendu;
}

/* Écrit la fiche du CV : fusion avec le moteur de l'import, puis missions restituées. Retourne le résumé de la fusion. À appeler dans le navigateur (fusionnerDonnees est dans js/app.js). */
function csaAppliquerAuDossier(dossierCible, F) {
  var fusion = _csa('fusionnerDonnees')(dossierCible, csaVersDecisions(F), SPECIFICATION_IMPORT);
  csaRestituerMissions(dossierCible, F);
  return fusion;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CSA_OUVERT: CSA_OUVERT, csaTexteAplati: csaTexteAplati, csaIntitulesDOrigine: csaIntitulesDOrigine, CSA_NOM_ORIGINE_RUBRIQUE: CSA_NOM_ORIGINE_RUBRIQUE, CSA_RUBRIQUES: CSA_RUBRIQUES, CSA_ORDRE: CSA_ORDRE, csaTypeTitre: csaTypeTitre, csaClasserLigne: csaClasserLigne, csaDecouper: csaDecouper, csaAnalyserBloc: csaAnalyserBloc,
    csaChoisirRubrique: csaChoisirRubrique, csaFusionnerAvecLeDessus: csaFusionnerAvecLeDessus, csaCouperApres: csaCouperApres, csaPlageSeule: csaPlageSeule,
    csaParserExperience: csaParserExperience, csaConstruireFiches: csaConstruireFiches, csaCompter: csaCompter, csaVersDecisions: csaVersDecisions, csaRestituerMissions: csaRestituerMissions,
    csaFicheVide: csaFicheVide, csaExperienceVide: csaExperienceVide, csaFormationVide: csaFormationVide, csaSeparerNomPrenom: csaSeparerNomPrenom, csaIndexNom: csaIndexNom, csaScinderExperiences: csaScinderExperiences, csaScinderFormations: csaScinderFormations, csaDecoupeLangue: csaDecoupeLangue, csaCapsTitre: csaCapsTitre
  };
}
