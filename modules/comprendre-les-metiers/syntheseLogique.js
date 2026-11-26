/* ============================================================
   Module « Explorer les métiers » : « Ma synthèse », LOGIQUE PURE (aucun DOM, aucun stockage).
   Testé par tests/syntheseLogique.test.js. Créé le 18/11/2026 (tâche A1 de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md).

   Ce fichier ne fait que RECOUPER des résultats que le code a déjà calculés (il ne note jamais la personne, ne désigne jamais « le » métier fait pour elle) :
   1. classement VISUEL des six lettres (fort, moyen, discret) : deux premières en fort, ex aequo tous en fort, troisième seulement si elle se démarque ;
   2. métiers qui REVIENNENT d'un passage à l'autre (comparaison par nom sans accent ni majuscule) ;
   3. compétences COMMUNES à plusieurs fiches ;
   4. lettres d'un métier comparées à celles de la personne ;
   5. écart de niveau d'accès (jamais un barrage, seulement une information) ;
   6. plafonds de longueur de tout ce qui part vers l'assistant.

   Les départages (tâches A1b, A1c, A1d) et l'analyse de la réponse (A11) viendront dans ce même fichier ; le calcul parcours / transférables / à acquérir
   (étape B) aussi. Données lues : les seuils et les lettres de logique.js (navigateur : globales ; Node : require).
   ============================================================ */

var _synBase = (typeof CML_LETTRES !== 'undefined')
  ? { lettres: CML_LETTRES, seuilProches: CMQ_SEUIL_PROCHES, seuilLettre: CMQ_SEUIL_LETTRE, groupe: cmlGroupeNiveau }
  : (function () { var l = require('./logique.js'); return { lettres: l.CML_LETTRES, seuilProches: l.CMQ_SEUIL_PROCHES, seuilLettre: l.CMQ_SEUIL_LETTRE, groupe: l.cmlGroupeNiveau }; })();

// Plafonds : rien ne part vers l'assistant sans limite. Chaque liste est coupée à ce nombre (les premiers éléments sont gardés).
var SYN_PLAFONDS = {
  metiersParPassage: 8,        // métiers d'un passage donnés à l'assistant
  metiersQuiReviennent: 8,
  competences: 12,             // compétences citées pour un métier
  competencesCommunes: 10,
  libre: 600,                  // caractères du texte libre de la personne
  complements: 10,
  suivi: 6,
  demande: 22000               // caractères de toute la demande, consignes comprises (tâche A9 ; 9000, 12000, 14000, 16000 puis 20000 étaient trop justes : la version 3 du prompt, en deux messages, fait plus de 10 000 signes à elle seule, consigne 529 : les consignes en font déjà plus de 9000 depuis la version 2 du prompt, consigne 525). Les demandes des autres modules font déjà 23 000 signes sans problème.
};

// Texte sans accent, sans majuscule, espaces simples : pour comparer des noms de métiers écrits parfois sans accent dans la base.
function synNormaliser(texte) {
  return String(texte === null || texte === undefined ? '' : texte)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Coupe une liste (jamais une erreur si ce n'est pas une liste).
function synPlafonner(liste, maximum) {
  return Array.isArray(liste) ? liste.slice(0, Math.max(0, maximum)) : [];
}

// Coupe un texte libre : espaces nettoyés, longueur plafonnée, jamais de coupure au milieu d'un mot si on peut l'éviter.
function synPlafonnerTexte(texte, maximum) {
  var t = String(texte === null || texte === undefined ? '' : texte).replace(/\s+/g, ' ').trim();
  if (t.length <= maximum) { return t; }
  var coupe = t.slice(0, maximum);
  var espace = coupe.lastIndexOf(' ');
  return (espace > maximum * 0.7 ? coupe.slice(0, espace) : coupe).trim();
}

/* ------------------------------------------------------------
   1. Classement visuel des six lettres
   ------------------------------------------------------------ */

// resultat = résultat du questionnaire (cmqResultatDepuisPourcentages) : valeurs (non arrondies), classement, etat, pourcentages.
// Retourne { R: 'fort' | 'moyen' | 'discret', ... }.
// - peu de réponses (aucun code) : tout est « discret », jamais une mise en avant sans base ;
// - les deux premières lettres sont « fort » ; une lettre à égalité avec la deuxième (ou avec la première) l'est aussi ;
// - la suivante est « moyen » seulement si elle vaut au moins le seuil d'une lettre du code et se démarque de la suivante d'au moins le seuil des lettres proches ;
// - tout le reste est « discret ».
function synClasserLettres(resultat) {
  var sortie = {};
  _synBase.lettres.forEach(function (L) { sortie[L] = 'discret'; });
  if (!resultat || !resultat.valeurs || !Array.isArray(resultat.classement) || resultat.etat === 'peu_reponses') { return sortie; }
  var v = resultat.valeurs, c = resultat.classement;
  var egal = function (a, b) { return Math.abs(v[a] - v[b]) < 1e-9; };
  var limiteFort = v[c[1]];
  var i = 0;
  while (i < c.length && (i < 2 || v[c[i]] >= limiteFort - 1e-9)) { sortie[c[i]] = 'fort'; i++; }
  // Troisième lettre (seulement si les égalités n'ont pas déjà rempli les trois premières places) : « moyen » si elle compte dans le code et se démarque de celle qui la suit.
  if (i === 2) {
    var L3 = c[i], suivante = c[i + 1];
    var arrondie = typeof resultat.pourcentages === 'object' && resultat.pourcentages ? resultat.pourcentages[L3] : Math.round(v[L3]);
    var seDemarque = !suivante || (v[L3] - v[suivante]) >= _synBase.seuilProches - 1e-9;
    var aucuneEgale = !suivante || !egal(L3, suivante);
    if (arrondie >= _synBase.seuilLettre && seDemarque && aucuneEgale) { sortie[L3] = 'moyen'; }
  }
  return sortie;
}

/* ------------------------------------------------------------
   2. Métiers qui reviennent
   ------------------------------------------------------------ */

// passages = { p1: [noms], p2: [noms], p3: [noms] } (noms de métiers : texte ou objet { nom }). Un passage non fait = liste absente ou vide.
// Retourne [{ nom, cle, passages: ['p1','p3'] }] des métiers présents dans AU MOINS DEUX passages, les plus répétés d'abord, puis l'ordre alphabétique.
// Le nom affiché est celui du premier passage où le métier apparaît.
function synMetiersQuiReviennent(passages) {
  var nomsPassages = ['p1', 'p2', 'p3'];
  var table = {};
  nomsPassages.forEach(function (p) {
    var vus = {};
    (passages && Array.isArray(passages[p]) ? passages[p] : []).forEach(function (m) {
      var nom = typeof m === 'string' ? m : (m && m.nom) || '';
      var cle = synNormaliser(nom);
      if (!cle || vus[cle]) { return; }
      vus[cle] = true;
      if (!table[cle]) { table[cle] = { nom: nom, cle: cle, passages: [] }; }
      table[cle].passages.push(p);
    });
  });
  var liste = Object.keys(table).map(function (k) { return table[k]; }).filter(function (e) { return e.passages.length >= 2; });
  liste.sort(function (a, b) {
    if (a.passages.length !== b.passages.length) { return b.passages.length - a.passages.length; }
    return a.nom.localeCompare(b.nom, 'fr');
  });
  return synPlafonner(liste, SYN_PLAFONDS.metiersQuiReviennent);
}

/* ------------------------------------------------------------
   3. Compétences communes
   ------------------------------------------------------------ */

// listes = tableau de listes de compétences ({ t: 'se' | 'sf' | 'sv', i: indice } ou texte). Retourne celles présentes dans AU MOINS DEUX listes,
// dans l'ordre de première apparition, avec le nombre de listes où elles se trouvent.
function synCompetencesCommunes(listes) {
  var table = {}, ordre = [];
  (Array.isArray(listes) ? listes : []).forEach(function (liste) {
    var vues = {};
    (Array.isArray(liste) ? liste : []).forEach(function (c) {
      var cle = (c && typeof c === 'object') ? (c.t + ':' + c.i) : synNormaliser(c);
      if (!cle || vues[cle]) { return; }
      vues[cle] = true;
      if (!table[cle]) { table[cle] = { competence: c, fois: 0 }; ordre.push(cle); }
      table[cle].fois++;
    });
  });
  var communes = ordre.map(function (k) { return table[k]; }).filter(function (e) { return e.fois >= 2; });
  return synPlafonner(communes, SYN_PLAFONDS.competencesCommunes);
}

/* ------------------------------------------------------------
   4. Lettres d'un métier comparées à celles de la personne
   ------------------------------------------------------------ */

// lettresPersonne : le code de la personne (une à trois lettres, ou plus avec les lettres proches) ; lettresMetier : « SA », « ESC »...
// Retourne { communes: [{ lettre, rangMetier, rangPersonne }], absentes: [lettres du métier que la personne n'a pas dans son code], memes: bool }.
// Jamais un jugement : « absentes » veut seulement dire « pas dans votre code ».
function synComparerLettres(lettresPersonne, lettresMetier) {
  var p = Array.isArray(lettresPersonne) ? lettresPersonne : String(lettresPersonne || '').split('');
  var m = String(lettresMetier || '').split('').filter(function (L) { return _synBase.lettres.indexOf(L) !== -1; });
  var communes = [], absentes = [];
  m.forEach(function (L, i) {
    var r = p.indexOf(L);
    if (r === -1) { absentes.push(L); } else { communes.push({ lettre: L, rangMetier: i + 1, rangPersonne: r + 1 }); }
  });
  return { communes: communes, absentes: absentes, memes: m.length > 0 && absentes.length === 0 };
}

/* ------------------------------------------------------------
   5. Écart de niveau d'accès
   ------------------------------------------------------------ */

// niveauPersonne et niveauMetier : 2 à 8 (comme le ROME), ou absent. Retourne
// { connu: bool, ecart: nombre de niveaux (positif = le métier demande plus que le niveau de la personne), taille: 'aucun' | 'un' | 'grand' }.
// « grand » = deux niveaux ou plus. Information seulement : jamais un métier retiré ni abaissé (consignes 468 et 470).
function synEcartNiveau(niveauPersonne, niveauMetier) {
  var ok = function (n) { return typeof n === 'number' && isFinite(n) && n >= 2 && n <= 8; };
  if (!ok(niveauPersonne) || !ok(niveauMetier)) { return { connu: false, ecart: 0, taille: 'aucun' }; }
  var ecart = niveauMetier - niveauPersonne;
  return { connu: true, ecart: ecart, taille: ecart >= 2 ? 'grand' : (ecart === 1 ? 'un' : 'aucun') };
}

/* ------------------------------------------------------------
   6. Ce qui diffère : les choix de la personne que le métier ne retrouve pas
   ------------------------------------------------------------ */

// choix = { actions: [ids], activites: [ids], environnement: [ids] } ; fiche = la fiche du métier (mêmes trois listes d'identifiants).
// Retourne [{ cle, id }] : les choix qui ne figurent pas dans la fiche. Jamais un défaut du métier ni de la personne : seulement ce qui ne se recoupe pas.
function synChoixNonRetrouves(choix, fiche) {
  var sortie = [];
  if (!choix || !fiche) { return sortie; }
  ['activites', 'actions', 'environnement'].forEach(function (cle) {
    var chez = Array.isArray(fiche[cle]) ? fiche[cle] : [];
    (Array.isArray(choix[cle]) ? choix[cle] : []).forEach(function (id) {
      if (chez.indexOf(id) === -1) { sortie.push({ cle: cle, id: id }); }
    });
  });
  return sortie;
}

// Phrase de comparaison des lettres de la personne (son code) et de celles d'un métier : 'memes' | 'partie' | 'differentes' (jamais un jugement).
function synRecouvrementLettres(codePersonne, lettresMetier) {
  var c = synComparerLettres(codePersonne, lettresMetier);
  if (c.communes.length === 0 && c.absentes.length === 0) { return 'inconnu'; }
  if (c.memes) { return 'memes'; }
  return c.communes.length > 0 ? 'partie' : 'differentes';
}

// Honnêteté sur les listes courtes (tâche A1c, consigne 467) : parmi les métiers classés par lettres (chacun avec .lettres, ex. 'SA'), ceux qui ont
// les deux premières lettres de la personne, dans le même ordre (une seule lettre si son code n'en a qu'une). Sur la base : SA 4 métiers, IA 4, AS 5. Quand il y en a moins que « minimum », la liste est dite courte :
// l'écran le dit et n'est pas complété par des métiers qui n'ont qu'une des deux lettres. Retourne { lettres, proches, nb, courte, aucun }.
function synListeHonnete(liste, codePersonne, minimum) {
  var code = (typeof codePersonne === 'string' ? codePersonne.split('') : (Array.isArray(codePersonne) ? codePersonne : [])).filter(function (l) { return typeof l === 'string' && l; }).slice(0, 2);
  var seuil = (typeof minimum === 'number' && minimum > 0) ? minimum : 1;
  var proches = code.length ? (Array.isArray(liste) ? liste : []).filter(function (x) {
    var l = x && typeof x.lettres === 'string' ? x.lettres : '';
    return l.indexOf(code.join('')) === 0;   // dans le même ordre : « SA » et « AS » ne sont pas le même code
  }) : [];
  return { lettres: code, proches: proches, nb: proches.length, courte: proches.length < seuil, aucun: proches.length === 0 };
}

/* ------------------------------------------------------------
   6 bis. Départager les métiers aux mêmes lettres (tâches A1b et A1d, consignes 465, 466, 470, maquette V8)
   Ordre : lettres exactes d'abord, puis nombre de réponses de la personne que le métier retrouve, puis égalité montrée ENSEMBLE (jamais d'ordre alphabétique
   présenté comme un classement). Le niveau d'études n'entre JAMAIS dans l'ordre. Une question n'est posée que si elle sépare réellement des métiers en lice.
   ------------------------------------------------------------ */

function _synA(tags, t) { return Array.isArray(tags) && tags.indexOf(t) !== -1; }
// Banque de questions : chaque option a un test sur les conditions de travail du métier (identifiants de data/conditionsRome.js) et une raison au ton prudent.
var SYN_QUESTIONS_DEPARTAGE = [
  { cle: 'corps', titre: 'Votre façon de travailler', options: [
    { id: 'debout', lib: 'Plutôt debout, en mouvement', test: function (g) { return _synA(g, 'debout') || _synA(g, 'charges') || _synA(g, 'precision'); }, raison: 'Ce métier est décrit comme se pratiquant plutôt debout ou en mouvement.' },
    { id: 'assis', lib: 'Plutôt assis ou assise', test: function (g) { return _synA(g, 'assis'); }, raison: 'Ce métier est décrit comme se pratiquant plutôt assis.' }] },
  { cle: 'lieu', titre: 'Où aimeriez-vous travailler ?', options: [
    { id: 'ext', lib: 'En extérieur', test: function (g) { return _synA(g, 'exterieur'); }, raison: 'Ce métier est décrit comme pouvant s’exercer en extérieur.' },
    { id: 'dom', lib: 'Chez les gens, à leur domicile', test: function (g) { return _synA(g, 'domicile'); }, raison: 'Ce métier est décrit comme pouvant s’exercer au domicile des personnes.' }] },
  { cle: 'dep', titre: 'Les déplacements', options: [
    { id: 'dep', lib: 'Avec des déplacements', test: function (g) { return _synA(g, 'deplacements'); }, raison: 'Ce métier est décrit comme comportant des déplacements.' },
    { id: 'fixe', lib: 'Sans déplacement', test: function (g) { return !_synA(g, 'deplacements'); }, raison: 'Aucun déplacement n’est mentionné dans la description de ce métier.' }] },
  { cle: 'autres', titre: 'Avec les autres', options: [
    { id: 'public', lib: 'Beaucoup de contact avec le public', test: function (g) { return _synA(g, 'public'); }, raison: 'Ce métier est décrit comme demandant un contact régulier avec le public.' },
    { id: 'calme', lib: 'Peu de contact avec le public', test: function (g) { return !_synA(g, 'public'); }, raison: 'Aucun contact régulier avec le public n’est mentionné dans la description de ce métier.' },
    { id: 'seul', lib: 'Plutôt seul ou seule', test: function (g) { return _synA(g, 'isole'); }, raison: 'Ce métier est décrit comme comportant des moments de travail seul.' }] },
  { cle: 'horaires', titre: 'Les horaires', options: [
    { id: 'reg', lib: 'Plutôt réguliers, sans nuit ni week-end', test: function (g) { return !_synA(g, 'nuit') && !_synA(g, 'weekend') && !_synA(g, 'horaires'); }, raison: 'Aucun horaire décalé, ni travail de nuit ou de week-end, n’est mentionné dans la description de ce métier.' }] }
];
var SYN_MAX_SECTEURS_DEPARTAGE = 3;
var SYN_GROUPE_MIN = 3, SYN_GROUPE_MAX = 8;

function synOptionDe(question, id) {
  var o = (question && question.options) || [];
  for (var i = 0; i < o.length; i++) { if (o[i].id === id) { return o[i]; } }
  return null;
}
// entrees : [{ nom, lettres, tags, secteur, niveau, rome }] (les métiers en lice). Rend la liste classée avec, pour chacun, ses raisons écrites.
// reponses : { cle: idOption } ; secteurs : liste de noms de secteurs choisis. codePersonne : ses lettres (ex. ['S','A','E']).
function synClasserDepartage(entrees, codePersonne, reponses, secteurs) {
  var code = (Array.isArray(codePersonne) ? codePersonne : []).filter(function (l) { return typeof l === 'string' && l; }).slice(0, 2).join('');
  var rep = (reponses && typeof reponses === 'object') ? reponses : {};
  var sect = Array.isArray(secteurs) ? secteurs : [];
  var liste = (Array.isArray(entrees) ? entrees : []).filter(function (e) { return e && typeof e.nom === 'string'; }).map(function (e) {
    var raisons = [], pts = 0;
    SYN_QUESTIONS_DEPARTAGE.forEach(function (q) {
      var o = synOptionDe(q, rep[q.cle]);
      if (o && o.test(e.tags || [])) { pts++; raisons.push(o.raison); }
    });
    if (sect.length && e.secteur && sect.indexOf(e.secteur) !== -1) { pts++; raisons.push('Il fait partie du secteur « ' + e.secteur + ' » que vous avez choisi.'); }
    var l = typeof e.lettres === 'string' ? e.lettres : '';
    return { nom: e.nom, rome: e.rome, lettres: l, secteur: e.secteur || '', niveau: (typeof e.niveau === 'number') ? e.niveau : null, tags: e.tags || [], exact: !!code && l.indexOf(code) === 0, pts: pts, raisons: raisons };
  });
  liste.sort(function (a, b) {
    if (a.exact !== b.exact) { return a.exact ? -1 : 1; }
    if (a.pts !== b.pts) { return b.pts - a.pts; }
    return a.nom.localeCompare(b.nom, 'fr');
  });
  return liste;
}
// Les options à proposer pour une question : celles qui retrouvent au moins un métier en lice et pas tous (ou celle déjà choisie). Jamais un nombre de métiers affiché.
function synOptionsProposees(question, enLice, choisie) {
  var n = Array.isArray(enLice) ? enLice.length : 0;
  return ((question && question.options) || []).filter(function (o) {
    var k = (enLice || []).filter(function (e) { return o.test(e.tags || []); }).length;
    return (k >= 1 && k < n) || choisie === o.id;
  });
}
// Les secteurs des métiers en lice (pour la question « secteurs »), sans doublon, en ordre alphabétique.
function synSecteursEnLice(enLice) {
  var s = [];
  (enLice || []).forEach(function (e) { if (e && e.secteur && s.indexOf(e.secteur) === -1) { s.push(e.secteur); } });
  return s.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
}
// Groupes d'égalité : même caractère « lettres exactes » et même nombre de réponses retrouvées. Montrés ENTIERS (huit métiers au plus par groupe, le reste dans la liste
// complète), jusqu'à ce qu'au moins trois métiers soient montrés. Retourne { montres: [{ exact, pts, items, tous }], reste }.
function synGroupesEgalite(liste) {
  var groupes = [];
  (Array.isArray(liste) ? liste : []).forEach(function (x) {
    var g = groupes[groupes.length - 1];
    if (g && g.exact === x.exact && g.pts === x.pts) { g.tous.push(x); } else { groupes.push({ exact: x.exact, pts: x.pts, tous: [x] }); }
  });
  var montres = [], n = 0, i = 0;
  while (i < groupes.length && n < SYN_GROUPE_MIN) {
    var g = groupes[i];
    montres.push({ exact: g.exact, pts: g.pts, tous: g.tous, items: g.tous.slice(0, SYN_GROUPE_MAX) });
    n += Math.min(g.tous.length, SYN_GROUPE_MAX);
    i++;
  }
  return { montres: montres, reste: (Array.isArray(liste) ? liste.length : 0) - n };
}
// Phrase de la demande à l'assistant : les réponses de départage de la personne (jamais un nombre, jamais « Peu importe »).
function synTexteReponsesDepartage(reponses, secteurs) {
  var rep = (reponses && typeof reponses === 'object') ? reponses : {}, t = [];
  SYN_QUESTIONS_DEPARTAGE.forEach(function (q) { var o = synOptionDe(q, rep[q.cle]); if (o) { t.push(o.lib.toLowerCase()); } });
  var sect = Array.isArray(secteurs) ? secteurs.filter(function (s) { return typeof s === 'string' && s; }).slice(0, SYN_MAX_SECTEURS_DEPARTAGE) : [];
  if (sect.length) { t.push('secteurs : ' + sect.join(', ')); }
  return t.join(' ; ');
}

/* ------------------------------------------------------------
   6 ter. Ce que les tests ne disent pas (A6) et « Chez moi » (A7)
   ------------------------------------------------------------ */

// Niveau d'études de la personne : mêmes valeurs que le ROME (2 à 7 ici ; 8 = études longues, non proposé). Rien n'est obligatoire.
var SYN_NIVEAUX = [[2, 'Sans diplôme'], [3, 'CAP ou BEP'], [4, 'Bac'], [5, 'Bac + 2'], [6, 'Bac + 3'], [7, 'Bac + 5']];
// Accompagnement : une seule réponse (rangée dans la liste « suivi » de l'état, plafonnée à une valeur).
var SYN_ACCOMPAGNEMENTS = [['oui', 'Oui'], ['non', 'Pas pour l’instant'], ['jamais', 'Non, jamais']];
// Ce qui compte pour la personne en ce moment (plusieurs réponses possibles).
var SYN_COMPLEMENTS = [
  ['deplacer', 'Je peux me déplacer'], ['former', 'Je peux me former'], ['vite', 'Je cherche vite un emploi'], ['changer', 'Je veux changer complètement'],
  ['rester', 'Je veux rester dans mon secteur'], ['horaires', 'Des horaires fixes sont nécessaires'], ['permis', 'J’ai le permis B'], ['creer', 'J’ai envie de créer mon activité']
];
function synLibelleDe(table, id) {
  for (var i = 0; i < table.length; i++) { if (table[i][0] === id) { return table[i][1]; } }
  return '';
}
// Ajoute ou retire un identifiant d'une liste (sans modifier l'originale), seulement s'il existe dans la table ; plafonné.
function synBasculerDansListe(liste, id, table, maximum) {
  var base = (Array.isArray(liste) ? liste : []).filter(function (x, i, t) { return typeof x === 'string' && t.indexOf(x) === i; });
  if (!synLibelleDe(table, id)) { return base; }
  var i = base.indexOf(id);
  if (i !== -1) { base.splice(i, 1); return base; }
  base.push(id);
  return synPlafonner(base, maximum);
}
// Une seule réponse parmi plusieurs : la même touchée une seconde fois l'efface. Retourne la liste à une valeur (ou vide).
function synChoisirUnique(liste, id, table) {
  var actuel = (Array.isArray(liste) ? liste : []).filter(function (x) { return !!synLibelleDe(table, x); })[0];
  if (!synLibelleDe(table, id) || actuel === id) { return []; }
  return [id];
}
// La situation écrite pour la demande à l'assistant (jamais le texte libre ici : il a son propre champ) ; rien n'est dit de ce qui n'est pas rempli.
function synTexteSituation(s) {
  var e = s || {}, t = [];
  var niv = synLibelleDe(SYN_NIVEAUX, e.niveau);
  if (niv) { t.push('niveau d’études : ' + niv); }
  var acc = (Array.isArray(e.suivi) ? e.suivi : []).map(function (x) { return synLibelleDe(SYN_ACCOMPAGNEMENTS, x); }).filter(Boolean)[0];
  if (acc) { t.push({ oui: 'accompagnement par un professionnel', non: 'pas d’accompagnement pour l’instant', jamais: 'jamais d’accompagnement' }[(e.suivi || [])[0]] || acc.toLowerCase()); }
  var comp = (Array.isArray(e.complements) ? e.complements : []).map(function (x) { return synLibelleDe(SYN_COMPLEMENTS, x); }).filter(Boolean);
  if (comp.length) { t.push('ce qui compte en ce moment : ' + comp.join(' ; ').toLowerCase()); }
  var form = synFormationValide(e.formation);
  if (form !== 'tous') { t.push('formation qu’elle se dit prête à faire : ' + synLibelleDe(SYN_FORMATIONS, form).toLowerCase()); }
  return t.join(' ; ');
}
// « Chez moi » : parmi les pistes (noms de métiers), celles dont la fiche est rattachée à un métier de l'enquête du territoire.
// idDe(nom) → identifiant de la fiche ; table : { 'Nom de l'enquête': [ids de fiches] } ; metiersEnquete : [{ nom, met, s }] du département.
// Rend [{ piste, enquete: { nom, met, s, saisonnier } }] pour les pistes retrouvées, jamais une supposition.
function synPistesDansEnquete(pistes, idDe, table, metiersEnquete) {
  var res = [], vus = {};
  (Array.isArray(pistes) ? pistes : []).forEach(function (nom) {
    if (typeof nom !== 'string' || !nom) { return; }
    var cle = synNormaliser(nom);
    if (vus[cle]) { return; }
    vus[cle] = true;
    var id = typeof idDe === 'function' ? idDe(nom) : null;
    if (!id || !table) { return; }
    var lie = Object.keys(table).filter(function (k) { return (table[k] || []).indexOf(id) !== -1; })[0];
    if (!lie) { return; }
    var o = (Array.isArray(metiersEnquete) ? metiersEnquete : []).filter(function (x) { return x && synNormaliser(x.nom) === synNormaliser(lie); })[0];
    if (!o || !(o.met > 0)) { return; }
    res.push({ piste: nom, enquete: { nom: lie, met: o.met, s: o.s || 0, saisonnier: (o.s || 0) / o.met >= 0.5 } });
  });
  return res;
}

/* ------------------------------------------------------------
   7. Vers la disquette et depuis elle (tâche A8)
   ------------------------------------------------------------ */

var SYN_VERSION_FICHIER = 1;

// Ce que la disquette reçoit de la synthèse : seulement si la personne l'a gardée (gardee), jamais une réponse du questionnaire.
// Le texte libre et la lecture n'y sont PAS : ils auront chacun leur propre accord (tâches A6 et A11).
// Le parcours professionnel (étape B) a sa logique à part : syntheseParcoursLogique.js (navigateur : globales ; Node : require).
function _synParcoursLib() { return (typeof synpPourFichier === 'function') ? { pour: synpPourFichier, depuis: synpNormaliserDepuisFichier } : (function () { var p = require('./syntheseParcoursLogique.js'); return { pour: p.synpPourFichier, depuis: p.synpNormaliserDepuisFichier }; })(); }
// Les interprétations par chemin et les réponses cliquées (étape 2b) : interpretationLogique.js (navigateur : globales ; Node : require, à la demande pour éviter un cycle).
function _synInterpLib() {
  if (typeof intPourFichier === 'function') { return { pour: intPourFichier, depuis: intNormaliserDepuisFichier }; }
  try { var l = require('./interpretationLogique.js'); return { pour: l.intPourFichier, depuis: l.intNormaliserDepuisFichier }; } catch (e) { return null; }
}
function synPourFichier(s) {
  if (!s || !s.gardee) { return null; }
  var retenu = function (r) { return r && typeof r.nom === 'string' && r.nom ? { nom: synPlafonnerTexte(r.nom, 140), rome: String(r.rome || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 10) } : null; };
  var ids = function (liste, max) { return synPlafonner((Array.isArray(liste) ? liste : []).filter(function (x) { return typeof x === 'string' && x.length > 0 && x.length <= 60; }), max); };
  var interp = (function () { var L = _synInterpLib(); return L ? L.pour(s.interpretations, s.reponsesQ) : null; })();
  var sortie = {
    version: SYN_VERSION_FICHIER,
    retenu1: retenu(s.retenu1), retenu2: retenu(s.retenu2), retenu3: retenu(s.retenu3),
    niveau: (typeof s.niveau === 'number' && s.niveau >= 2 && s.niveau <= 8) ? s.niveau : null,
    suivi: ids(s.suivi, SYN_PLAFONDS.suivi), complements: ids(s.complements, SYN_PLAFONDS.complements),
    parcours: _synParcoursLib().pour(s.parcours)
  };
  if (interp) { sortie.interpretations = interp; }
  return sortie;
}

// Relit avec méfiance ce qui vient d'un fichier. resoudre(nom) rend le métier connu { nom, rome } (nom écrit comme aujourd'hui dans la base) ou null :
// un métier inconnu est ignoré. Retourne l'état de la synthèse (gardee = vrai), ou null si le fichier ne contient rien d'utilisable.
function synNormaliserDepuisFichier(brut, resoudre) {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) { return null; }
  var metier = function (r) {
    if (!r || typeof r !== 'object' || typeof r.nom !== 'string' || !r.nom || r.nom.length > 200) { return null; }
    var m = typeof resoudre === 'function' ? resoudre(r.nom, typeof r.rome === 'string' ? r.rome.replace(/[^A-Za-z0-9]/g, '').slice(0, 10) : '') : null;
    return m && typeof m.nom === 'string' && m.nom ? { nom: synPlafonnerTexte(m.nom, 140), rome: String(m.rome || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 10) } : null;
  };
  var ids = function (liste, max) { return synPlafonner((Array.isArray(liste) ? liste : []).filter(function (x, i, t) { return typeof x === 'string' && x.length > 0 && x.length <= 60 && t.indexOf(x) === i; }), max); };
  var sortie = {
    retenu1: metier(brut.retenu1), retenu2: metier(brut.retenu2), retenu3: metier(brut.retenu3),
    niveau: (typeof brut.niveau === 'number' && brut.niveau >= 2 && brut.niveau <= 8 && Math.floor(brut.niveau) === brut.niveau) ? brut.niveau : null,
    suivi: ids(brut.suivi, SYN_PLAFONDS.suivi), complements: ids(brut.complements, SYN_PLAFONDS.complements),
    parcours: _synParcoursLib().depuis(brut.parcours),
    libre: '', lecture: null, gardee: true
  };
  var interp = (function () { var L = _synInterpLib(); return L ? L.depuis(brut.interpretations) : null; })();
  var vide = !sortie.retenu1 && !sortie.retenu2 && !sortie.retenu3 && sortie.niveau === null && !sortie.suivi.length && !sortie.complements.length && !sortie.parcours.length;
  if (interp && !vide) { sortie.interpretations = interp.interpretations; sortie.reponsesQ = interp.reponsesQ; }
  return vide ? null : sortie;
}

/* ------------------------------------------------------------
   8. Filtre « formation que je suis prêt ou prête à faire » (tâche A4b, maquette V7, consigne 468)
   ------------------------------------------------------------ */

// Un réglage commandé par la personne qui MONTRE ou CACHE des métiers selon leur niveau d'accès (les trois groupes de logique.js). Il ne CLASSE jamais :
// l'ordre des métiers ne change pas. Jamais appliqué par défaut ('tous'). Le métier retenu et les métiers au niveau non précisé restent toujours visibles.
var SYN_FORMATIONS = [['tous', 'Tous les métiers'], ['court', 'Sans diplôme, CAP ou BEP, au plus'], ['moyen', 'Jusqu’au bac + 2, au plus']];
function synFormationValide(choix) { return SYN_FORMATIONS.some(function (f) { return f[0] === choix; }) ? choix : 'tous'; }
function synFormationCachee(niveau, choix) {
  var g = _synBase.groupe(typeof niveau === 'number' ? niveau : null), c = synFormationValide(choix);
  if (c === 'tous' || g === 'non_precise') { return false; }
  return c === 'court' ? g !== 'court' : g === 'long';
}
// liste = métiers dans l'ordre ({ nom, niveau }) ; retourne { visibles (n au plus), caches } : « caches » = les métiers cachés qui auraient pris place parmi les n premiers.
function synAppliquerFormation(liste, choix, n, nomRetenu) {
  var visibles = [], caches = [], k = synNormaliser(nomRetenu || '');
  (Array.isArray(liste) ? liste : []).forEach(function (m) {
    if (visibles.length >= n) { return; }
    if (synFormationCachee(m.niveau, choix) && !(k && synNormaliser(m.nom) === k)) { caches.push(m); } else { visibles.push(m); }
  });
  return { visibles: visibles, caches: caches };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    synPourFichier: synPourFichier, synNormaliserDepuisFichier: synNormaliserDepuisFichier, SYN_VERSION_FICHIER: SYN_VERSION_FICHIER,
    SYN_NIVEAUX: SYN_NIVEAUX, SYN_ACCOMPAGNEMENTS: SYN_ACCOMPAGNEMENTS, SYN_COMPLEMENTS: SYN_COMPLEMENTS, synLibelleDe: synLibelleDe,
    synBasculerDansListe: synBasculerDansListe, synChoisirUnique: synChoisirUnique, synTexteSituation: synTexteSituation, synPistesDansEnquete: synPistesDansEnquete,
    synListeHonnete: synListeHonnete, SYN_QUESTIONS_DEPARTAGE: SYN_QUESTIONS_DEPARTAGE, SYN_MAX_SECTEURS_DEPARTAGE: SYN_MAX_SECTEURS_DEPARTAGE,
    synOptionDe: synOptionDe, synClasserDepartage: synClasserDepartage, synOptionsProposees: synOptionsProposees, synSecteursEnLice: synSecteursEnLice,
    synGroupesEgalite: synGroupesEgalite, SYN_GROUPE_MIN: SYN_GROUPE_MIN, SYN_GROUPE_MAX: SYN_GROUPE_MAX, synTexteReponsesDepartage: synTexteReponsesDepartage, synChoixNonRetrouves: synChoixNonRetrouves, synRecouvrementLettres: synRecouvrementLettres,
    SYN_PLAFONDS: SYN_PLAFONDS, synNormaliser: synNormaliser, synPlafonner: synPlafonner, synPlafonnerTexte: synPlafonnerTexte,
    synClasserLettres: synClasserLettres, synMetiersQuiReviennent: synMetiersQuiReviennent, synCompetencesCommunes: synCompetencesCommunes,
    synComparerLettres: synComparerLettres, synEcartNiveau: synEcartNiveau,
    SYN_FORMATIONS: SYN_FORMATIONS, synFormationValide: synFormationValide, synFormationCachee: synFormationCachee, synAppliquerFormation: synAppliquerFormation
  };
}
