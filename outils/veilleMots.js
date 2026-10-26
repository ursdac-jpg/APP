/* ============================================================
   veilleMots.js  --  les regles de l'ecran « Le Lexique » de l'outil de veille (chantier du 20 octobre 2026)
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance autre que veilleLexique.js et les listes de scripts/checkLexique.js (une seule source de verite :
   familles, registres, plafonds). Des fonctions pures : rien n'est ecrit ici.
   - verifierMot : les controles d'un mot (bloquants, et avertissements qui ne bloquent pas) ; l'ecran les demande au serveur, il n'en recopie aucun.
   - lignesPourInsertion : un mot neuf, ecrit dans la forme stricte que veilleDepot.js sait inserer dans data/lexique.js.
   - evolution : l'avant et l'apres de chaque champ modifie (un mot, une ligne par champ), pour suivre comment les mots evoluent.
   ============================================================ */
'use strict';
const regles = require('../scripts/checkLexique.js');
const reperesChiffres = require('../scripts/reperesChiffres.js');

const CHEMIN_EVOLUTION = 'outils/evolution_lexique.txt';
const EN_TETE_EVOLUTION = '# Evolution des mots du Lexique : une ligne (JSON) par champ modifie, avec l\'avant et l\'apres. L\'application NE LIT PAS ce fichier.\n';
const RE_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
const TIRET = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const NOMS_CHAMPS = { titre: 'titre', titreDeTri: 'titre de tri', type: 'type de fiche', gabarit: 'présentation', univers: 'famille', registres: 'registres', variantes: 'mots de recherche', corps: 'texte', relations: 'renvois', details: 'chiffres à jour' };
const CHAMPS = Object.keys(NOMS_CHAMPS);

function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function nbPhrases(t) { return (String(t).match(/[.!?](\s|$)/g) || []).length; }
function estProjete(id) { return /^(urgence-|freins-)/.test(id); }   // fiches ajoutees au Lexique par data/urgences.js et data/freins.js : valides comme destination d'un renvoi

// Le titre de tri propose pour un mot neuf : le titre sans « ? » final, sans guillemets, sans parentheses (le contenu reste), espaces simples. Les accents restent.
function titreDeTriPropose(titre) {
  return String(titre || '').replace(/[?!"«»]/g, ' ').replace(/[()]/g, ' ').replace(/\s*:\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

// L'identifiant propose pour un mot neuf : le titre en minuscules, sans accents, avec des traits d'union (jamais une valeur imposee : l'ecran le montre et on peut le changer).
function idPropose(titre) {
  return String(titre || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// Le premier chiffre ou la premiere date du texte, avec un peu de contexte (vide s'il n'y en a pas).
function extraitChiffre(corps) { return reperesChiffres.extrait(corps); }   // le detecteur partage (scripts/reperesChiffres.js), jamais une copie ici

// Les libelles lus dans le module du Lexique (source unique des noms de familles et de registres) : { cle: libelle }. cles = les cles autorisees.
function libellesDepuis(texteModule, nomVariable, cles) {
  const t = String(texteModule || ''), d = t.indexOf('var ' + nomVariable + ' = {');
  const sortie = {};
  if (d >= 0) {
    const f = t.indexOf('\n};', d), bloc = t.slice(d, f > d ? f : t.length);
    const re = /(?:'([a-z0-9-]+)'|\b([a-z0-9]+))\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g; let m;
    while ((m = re.exec(bloc))) { const cle = m[1] || m[2], v = m[3] !== undefined ? m[3] : m[4]; if (cles.indexOf(cle) !== -1) { sortie[cle] = v.replace(/\\(.)/g, '$1'); } }
  }
  cles.forEach(function (c) { if (!sortie[c]) { sortie[c] = c; } });
  return sortie;
}

// Le nombre de fiches de « Comprendre le cadre » qui citent chaque mot (data/lexique-renvois-cadre.js, genere par scripts/genererRenvoisCadre.js) : { id: n }.
function citationsDuCadre(texte) {
  const t = String(texte || ''), d = t.indexOf('var LEXIQUE_RENVOIS_CADRE = ');
  if (d < 0) { return {}; }
  const debut = t.indexOf('{', d), fin = t.lastIndexOf('};');
  try { const o = JSON.parse(t.slice(debut, fin + 1)), s = {}; Object.keys(o).forEach(function (k) { s[k] = Array.isArray(o[k]) ? o[k].length : 0; }); return s; } catch (e) { return {}; }
}

// Ce qui differe entre deux mots, par champ : [{ champ, avant, apres }] (valeurs en texte lisible, les listes separees par « ; »).
function valeurLisible(champ, mot) {
  if (champ === 'details') {
    const d = mot.details;
    if (!d || d.illisible) { return ''; }
    return 'vérifié le ' + (d.verifieLe || '(jamais)') + ' ; source : ' + ((d.source && d.source.nom) || '') + ' ; ' + (d.lignes || []).map(function (l) { return l.libelle + ' : ' + l.valeur + (l.peutChanger ? '' : ' (fait passé)'); }).join(' ; ');
  }
  if (champ === 'registres') { return (mot.registres || []).join(', '); }
  if (champ === 'variantes') { return (mot.variantes || []).join(' ; '); }
  if (champ === 'relations') { return (mot.relations || []).map(function (r) { return (r[1] === 'a-ne-pas-confondre' ? 'à ne pas confondre avec ' : 'voir aussi ') + r[0]; }).join(' ; '); }
  return String(mot[champ] === undefined ? '' : mot[champ]);
}
function differences(avant, apres) {
  const d = [];
  CHAMPS.forEach(function (c) {
    if ((c === 'type' || c === 'gabarit') && !avant.type) { return; }   // un mot neuf : pas de ligne « type » dans son evolution
    const a = valeurLisible(c, avant), b = valeurLisible(c, apres);
    if (c === 'titre' || c === 'titreDeTri' || c === 'corps' ? a.trim() !== b.trim() : a !== b) { d.push({ champ: c, avant: a, apres: b }); }
  });
  return d;
}

// Les controles d'un mot. mot : { id, titre, titreDeTri, type, gabarit, univers, registres, variantes, corps, relations }.
// existants : les mots du fichier (sans le mot en cours s'il existe deja). options : { nouveau, original (le mot tel qu'il est dans le fichier), phrase }.
// Rend { erreurs: [], avertissements: [], modifies: [champs] }.
function verifierMot(mot, existants, options) {
  const opt = options || {}, erreurs = [], avertissements = [];
  const ko = function (m) { erreurs.push(m); }, av = function (m) { avertissements.push(m); };
  const ids = {}; existants.forEach(function (e) { ids[e.id] = e; });
  const titre = String(mot.titre || '').trim(), corps = String(mot.corps || '').trim();
  if (!titre) { ko('Le titre est vide.'); }
  if (!String(mot.titreDeTri || '').trim()) { ko('Le titre de tri est vide (il sert à classer la liste par ordre alphabétique).'); }
  if (!corps) { ko('Le texte du mot est vide.'); }
  if (opt.nouveau) {
    if (!RE_ID.test(String(mot.id || ''))) { ko('L\'identifiant s\'écrit en minuscules, chiffres et traits d\'union (2 caractères au moins).'); }
    else if (ids[mot.id]) { ko('Cet identifiant existe déjà : ' + mot.id + '.'); }
    const tn = norm(titre), meme = existants.filter(function (e) { return norm(e.titre) === tn; })[0];
    if (tn && meme) { ko('Un mot porte déjà ce titre : ' + meme.id + '.'); }
  }
  if (mot.type === 'notion') { if (regles.GABARITS_CONNUS.indexOf(mot.gabarit) === -1) { ko('Choisissez la présentation de la notion.'); } }
  else if (mot.gabarit) { ko('Un mot simple n\'a pas de présentation : choisissez « notion » ou retirez-la.'); }
  if (!opt.nouveau && opt.original && opt.original.type && mot.type !== opt.original.type) { av('Vous changez le type de la fiche : elle s\'affichera autrement dans l\'application (une notion a une présentation choisie, un mot non).'); }
  if (regles.UNIVERS_CONNUS.indexOf(mot.univers) === -1) { ko('Choisissez une famille.'); }
  const reg = mot.registres || [];
  if (!reg.length) { ko('Choisissez 1 à 3 registres.'); } else if (reg.length > 3) { ko('Pas plus de 3 registres.'); }
  reg.forEach(function (r) { if (regles.REGISTRES_CONNUS.indexOf(r) === -1) { ko('Registre inconnu : ' + r + '.'); } });
  const vars = (mot.variantes || []).map(function (v) { return String(v).trim(); });
  if (vars.some(function (v) { return !v; })) { ko('Un mot de recherche est vide.'); }
  if (vars.length > regles.MAX_VARIANTES) { ko(regles.MAX_VARIANTES + ' mots de recherche au plus.'); }
  const vus = {};
  vars.filter(Boolean).forEach(function (v) {
    const k = norm(v);
    if (vus[k]) { ko('Mot de recherche répété : ' + v + '.'); }
    vus[k] = true;
    existants.forEach(function (e) { if (e.id !== mot.id && (e.variantes.some(function (x) { return norm(x) === k; }) || norm(e.titre) === k)) { av('« ' + v + ' » est déjà un mot de recherche (ou le titre) de « ' + e.titre + ' » : la recherche mènera à deux mots.'); } });
  });
  const rel = mot.relations || [], cibles = {};
  const anciennes = (opt.original && opt.original.relations || []).map(function (r) { return r[0]; });
  rel.forEach(function (r) {
    if (r[1] !== 'voir-aussi' && r[1] !== 'a-ne-pas-confondre') { ko('Type de renvoi inconnu : ' + r[1] + '.'); return; }
    if (r[0] === mot.id) { ko('Un mot ne peut pas renvoyer vers lui-même.'); return; }
    if (!ids[r[0]] && !(estProjete(r[0]) && anciennes.indexOf(r[0]) !== -1)) { ko('Renvoi vers un mot inconnu : ' + r[0] + '.'); }
    if (cibles[r[0]]) { ko('Renvoi en double vers ' + r[0] + '.'); }
    cibles[r[0]] = true;
  });
  if (rel.filter(function (r) { return r[1] === 'voir-aussi'; }).length > regles.MAX_VOIR_AUSSI) { ko(regles.MAX_VOIR_AUSSI + ' « voir aussi » au plus.'); }
  if (rel.filter(function (r) { return r[1] === 'a-ne-pas-confondre'; }).length > regles.MAX_A_NE_PAS_CONFONDRE) { ko(regles.MAX_A_NE_PAS_CONFONDRE + ' « à ne pas confondre » au plus.'); }
  if (mot.details) {
    if (mot.details.illisible) { ko('Le bloc des chiffres à jour de cette fiche ne se lit pas (' + mot.details.illisible + ').'); }
    else { regles.verifierDetails(mot.details).forEach(ko); }
  }
  if (!rel.length) { av('Aucun renvoi : un mot ne doit pas rester sans prolongement (doctrine du Lexique, principe 7).'); }
  if ([titre, corps, mot.titreDeTri].concat(vars).some(function (x) { return TIRET.test(String(x || '')); })) { ko('Un tiret long ou demi-long s\'est glissé dans le texte (interdit dans l\'application).'); }
  if (/à vérifier|a verifier/i.test(corps)) { ko('Le texte contient « à vérifier » : une information incertaine ne se publie pas.'); }
  if (/[\r\n]/.test(String(mot.corps || '').trim())) { av('Le texte contient des retours à la ligne : ils seront remplacés par des espaces (un mot = un seul paragraphe).'); }
  if (corps) {
    const np = nbPhrases(corps);
    if (np < 2) { av('Le texte tient en ' + np + ' phrase : le Lexique en demande 2 à 4.'); } else if (np > 4) { av('Le texte fait ' + np + ' phrases : le Lexique en demande 2 à 4.'); }
    const ch = extraitChiffre(corps), cats = reperesChiffres.categoriesDe(corps).map(function (k) { return reperesChiffres.CATEGORIES[k].toLowerCase(); });
    if (ch) {
      // Un mot neuf, ou une fiche qui n'est pas sur la liste de transition, ne peut pas avoir de chiffre dans son texte (scripts/checkLexique.js le refuserait). Une fiche encore sur la liste : simple avertissement.
      const surLaListe = Array.isArray(opt.transition) ? opt.transition.indexOf(mot.id) !== -1 : false;
      const msg = 'Chiffre ou date repéré dans le texte (' + cats.join(', ') + ' : « ' + ch + ' »). ';
      if (opt.nouveau || (Array.isArray(opt.transition) && !surLaListe)) { ko(msg + 'Placez-le dans le bloc « Les chiffres à jour » de la fiche, ou reformulez sans chiffre (doctrine du Lexique, principe 1).'); }
      else { av(msg + 'Cette fiche est sur la liste de transition : ses chiffres seront déplacés dans le bloc « Les chiffres à jour » (doctrine du Lexique, principe 1).'); }
    }
  }
  let modifies = [];
  if (!opt.nouveau && opt.original) {
    modifies = differences(opt.original, Object.assign({}, mot, { titre: titre, corps: corps, variantes: vars.filter(Boolean) })).map(function (x) { return x.champ; });
    if (modifies.length && !String(opt.phrase || '').trim()) { ko('Dites en une phrase ce que vous avez changé (elle sert à suivre l\'évolution du mot).'); }
    if (/[|\n\r]/.test(String(opt.phrase || ''))) { ko('La phrase tient en une seule ligne, sans barre verticale.'); }
    if (TIRET.test(String(opt.phrase || ''))) { ko('Un tiret long ou demi-long s\'est glissé dans la phrase.'); }
  }
  return { erreurs: erreurs, avertissements: avertissements, modifies: modifies };
}

// Un mot neuf, dans la forme stricte attendue par analyserCandidatsLexique (veilleDepot.js) : lignes « { ... }, ».
function echapDouble(s) { return String(s).replace(/\r?\n/g, ' ').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }
function lignesPourInsertion(mot) {
  const l = ['{', '  id: \'' + mot.id + '\',', '  titre: "' + echapDouble(String(mot.titre).trim()) + '",', '  titreDeTri: "' + echapDouble(String(mot.titreDeTri).trim()) + '", type: \'' + (mot.type === 'notion' ? 'notion' : 'terme') + '\','];
  if (mot.type === 'notion' && mot.gabarit) { l.push('  gabarit: \'' + mot.gabarit + '\','); }
  l.push('  univers: \'' + mot.univers + '\',');
  l.push('  registres: [' + mot.registres.map(function (r) { return '\'' + r + '\''; }).join(', ') + '],');
  l.push('  variantesRecherche: [' + (mot.variantes || []).map(function (v) { return String(v).trim(); }).filter(Boolean).map(function (v) { return '"' + echapDouble(v) + '"'; }).join(', ') + '],');
  l.push('  corps: "' + echapDouble(String(mot.corps).trim()) + '",');
  if (mot.relations && mot.relations.length) {
    l.push('  relations: [');
    mot.relations.forEach(function (r, i) { l.push('    { ficheId: \'' + r[0] + '\', type: \'' + r[1] + '\' }' + (i < mot.relations.length - 1 ? ',' : '')); });
    l.push('  ]');
  } else { l.push('  relations: []'); }
  l.push('},');
  return l;
}

// ---------- l'evolution des mots (un fichier, une ligne JSON par champ modifie) ----------
function lignesEvolution(quand, id, titre, action, phrase, diffs) {
  const p = String(phrase || '').replace(/[\r\n]+/g, ' ').trim();
  return diffs.map(function (d) { return JSON.stringify({ quand: quand, id: id, titre: titre, action: action, champ: d.champ, avant: d.avant, apres: d.apres, phrase: p }); });
}
function ajouterEvolution(texteActuel, lignes) {
  const base = texteActuel && texteActuel.length ? texteActuel.replace(/\s*$/, '\n') : EN_TETE_EVOLUTION;
  return base + lignes.join('\n') + '\n';
}
// Lit le fichier : [{ quand, id, titre, action, champ, avant, apres, phrase }], du plus recent au plus ancien.
function lireEvolution(texte) {
  const sortie = [];
  String(texte || '').split(/\r?\n/).forEach(function (l, i) {
    if (!l.trim() || l.charAt(0) === '#') { return; }
    try { const o = JSON.parse(l); if (o && o.id && o.champ) { o.n = i; sortie.push(o); } } catch (e) { /* ligne illisible : ignoree */ }
  });
  sortie.sort(function (a, b) { return a.quand < b.quand ? 1 : (a.quand > b.quand ? -1 : b.n - a.n); });
  sortie.forEach(function (o) { delete o.n; });
  return sortie;
}

// ---------- L'etat du bloc « Les chiffres a jour » d'une fiche, cote OUTIL (chantier du 20 octobre 2026) ----------
// MEME regle que _lexiqueEtatDetails (modules/lexique/index.js, ce que voit la personne), avec un etat de plus pour l'outil : 'bientot' (le dernier mois avant la fin).
// Le seuil est LU dans le module de l'application (une seule valeur) ; un essai compare les deux fonctions sur une grille de dates pour qu'elles ne derivent jamais.
// Etats : sans (pas de bloc), stable (aucune ligne ne peut changer), ajour, bientot, perime (message general), jamais (jamais verifie : message general).
function lireSeuilDetails(texteModule) { const m = /var LEXIQUE_SEUIL_MOIS_DETAILS = (\d+);/.exec(String(texteModule || '')); return m ? parseInt(m[1], 10) : 6; }
function jourVersTemps(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; }
function etatDetails(d, aujourdhui, seuilMois) {
  if (!d || typeof d !== 'object' || d.illisible || !Array.isArray(d.lignes) || !d.lignes.length || !d.source || !d.source.nom) { return 'sans'; }
  if (!d.lignes.some(function (l) { return l && l.peutChanger !== false; })) { return 'stable'; }
  if (!d.verifieLe) { return 'jamais'; }
  const jours = Math.round((jourVersTemps(aujourdhui) - jourVersTemps(d.verifieLe)) / 86400000);
  if (isNaN(jours)) { return 'jamais'; }
  if (jours < 0) { return 'ajour'; }
  const mois = jours / 30.4375, seuil = seuilMois || 6;
  return mois < seuil - 1 ? 'ajour' : (mois < seuil ? 'bientot' : 'perime');
}

// ---------- Faire verifier les chiffres de plusieurs fiches d'un coup (case M6 du chantier « des chiffres a jour ») ----------
// Le prompt reprend la structure du complement qui MARCHE (docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md, valide par Denis le 17 octobre 2026) :
// regle de decision par cas, sites interdits, suite en PARTIE 2, aucun commentaire. L'assistant en ligne PROPOSE : il n'ecrit rien ; Denis ouvre la source et decide.
// fiches : [{ id, titre, details: { source, lignes } }]. Rend le texte du prompt.
function promptVerificationChiffres(fiches, aujourdhui) {
  const jour = String(aujourdhui || '').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
  const liste = fiches.map(function (f) {
    return 'FICHE ' + f.id + ' (' + f.titre + ') ; source officielle attendue : ' + f.details.source.nom + ' ' + f.details.source.url + '\n'
      + f.details.lignes.map(function (l) { return '  - ' + l.libelle + ' : ' + l.valeur; }).join('\n');
  }).join('\n\n');
  return '@Recherche sur le Web\n\nNous sommes le ' + jour + '.\n\n'
    + 'Je vais te donner une liste de chiffres (dates, montants, durées) tirés de fiches d\'un lexique d\'insertion professionnelle. Tu dois vérifier chacun UNIQUEMENT sur les sites OFFICIELS (administration, organisme qui verse l\'aide, texte de loi).\n\n'
    + 'Tu peux traiter autant de lignes que possible en une réponse, mais tu privilégies toujours la fiabilité plutôt que la quantité.\n\n'
    + 'Pour chaque ligne :\n'
    + '1. Ouvre la page officielle qui donne cette valeur.\n'
    + '2. Lis uniquement ce qui est affiché sur cette page.\n'
    + '3. N\'utilise aucun forum, aucun blog, aucun comparateur, aucun article de presse, aucun annuaire, et aucun autre assistant.\n'
    + '4. N\'invente jamais une information. Si tu ne peux pas ouvrir la page officielle, indique « non vérifiable ».\n'
    + '5. Si la valeur affichée est la même, indique « confirmé ».\n'
    + '6. Si la valeur affichée est différente, indique « corrigé » et donne UNIQUEMENT la valeur lue sur la page officielle, avec les mêmes unités.\n'
    + '7. Si le dispositif n\'existe plus, indique « corrigé » et écris ce que dit la page officielle (par exemple « supprimé le ... »).\n\n'
    + 'Réponds uniquement sous cette forme, une ligne par valeur, entre les marqueurs [LEXIQUE-CHIFFRES] et [/LEXIQUE-CHIFFRES] :\n\n'
    + '[LEXIQUE-CHIFFRES]\nidentifiant de la fiche | libellé | statut | valeur lue sur la page officielle | URL exacte de la page lue | ce que tu as lu\n[/LEXIQUE-CHIFFRES]\n\n'
    + 'Recopie l\'identifiant de la fiche et le libellé EXACTEMENT comme ci-dessous. Ne fais aucun commentaire.\n\n'
    + 'Si toutes les lignes ne tiennent pas dans une réponse, continue automatiquement avec PARTIE 2, PARTIE 3, etc., jusqu\'à avoir traité toute la liste. Ne t\'arrête jamais après quelques lignes.\n\n'
    + liste + '\n';
}
const STATUTS_VERIF = { confirme: 'confirme', confirmee: 'confirme', inchange: 'confirme', inchangee: 'confirme', corrige: 'corrige', corrigee: 'corrige', modifie: 'corrige', modifiee: 'corrige', 'non verifiable': 'introuvable', introuvable: 'introuvable', 'fermee ou absente': 'introuvable' };
// Lit la reponse de l'assistant : { fiches: [{ id, titre, lignes: [{ libelle, actuelle, statut, nouvelle, url, lu }], manquantes: [libelle] }], inconnues: [texte brut des lignes non reconnues] }.
// Rien n'est ecrit : ce ne sont que des propositions. fiches : celles qui ont un bloc ([{ id, titre, details }]).
function lireVerificationChiffres(texte, fiches) {
  const m = /\[LEXIQUE-CHIFFRES\]([\s\S]*?)\[\/LEXIQUE-CHIFFRES\]/i.exec(String(texte || ''));
  const bloc = m ? m[1] : String(texte || '');
  const parId = {}, parTitre = {}; fiches.forEach(function (f) { parId[f.id] = f; parTitre[norm(f.titre)] = f; });
  const trouves = {}, inconnues = [];
  bloc.split(/\r?\n/).forEach(function (brut) {
    let l = brut.trim(); if (!l || /^PARTIE\s+\d+/i.test(l) || /^[-|\s:]+$/.test(l)) { return; }
    l = l.replace(/^\|/, '').replace(/\|$/, '');
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length < 3) { inconnues.push(brut.trim()); return; }
    if (/^identifiant/i.test(c[0])) { return; }   // la ligne d'en-tete recopiee
    const fiche = parId[c[0]] || parTitre[norm(c[0])];
    if (!fiche) { inconnues.push(brut.trim()); return; }
    const ligne = fiche.details.lignes.filter(function (x) { return norm(x.libelle) === norm(c[1]); })[0];
    const statut = STATUTS_VERIF[norm(c[2])];
    if (!ligne || !statut) { inconnues.push(brut.trim()); return; }
    const nouvelle = String(c[3] || '').replace(/\s+/g, ' ').trim(), url = /^https:\/\/[^\s"'<>]+$/.test(c[4] || '') ? c[4] : '';
    let st = statut;
    if (st === 'corrige' && (!nouvelle || norm(nouvelle) === norm(ligne.valeur))) { st = nouvelle ? 'confirme' : 'introuvable'; }
    if (nouvelle.length > 200 || /[–—]/.test(nouvelle)) { inconnues.push(brut.trim()); return; }
    (trouves[fiche.id] = trouves[fiche.id] || {})[ligne.libelle] = { libelle: ligne.libelle, actuelle: ligne.valeur, statut: st, nouvelle: st === 'corrige' ? nouvelle : '', url: url, lu: String(c.slice(5).join(' | ') || '').slice(0, 300) };
  });
  return {
    fiches: Object.keys(trouves).map(function (id) {
      const f = parId[id], t = trouves[id];
      return { id: id, titre: f.titre, lignes: f.details.lignes.map(function (l) { return t[l.libelle]; }).filter(Boolean), manquantes: f.details.lignes.filter(function (l) { return !t[l.libelle]; }).map(function (l) { return l.libelle; }) };
    }),
    inconnues: inconnues
  };
}

module.exports = { promptVerificationChiffres: promptVerificationChiffres, lireVerificationChiffres: lireVerificationChiffres, lireSeuilDetails: lireSeuilDetails, etatDetails: etatDetails, idPropose: idPropose, verifierMot: verifierMot, differences: differences, lignesPourInsertion: lignesPourInsertion, titreDeTriPropose: titreDeTriPropose, libellesDepuis: libellesDepuis, citationsDuCadre: citationsDuCadre,
  lignesEvolution: lignesEvolution, ajouterEvolution: ajouterEvolution, lireEvolution: lireEvolution, extraitChiffre: extraitChiffre, nbPhrases: nbPhrases, norm: norm,
  CHEMIN_EVOLUTION: CHEMIN_EVOLUTION, NOMS_CHAMPS: NOMS_CHAMPS, CHAMPS: CHAMPS, REGLES: regles };
