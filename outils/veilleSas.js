/* ============================================================
   veilleSas.js  --  le « sas » du module « Qui fait quoi » : importer plusieurs fiches d'un coup, sans rien publier
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance autre que la logique du module (modules/mon-territoire/logique.js) et veilleTerritoire.js.
   Pourquoi un sas : les fiches proposees par un assistant (ChatGPT...) sont des CANDIDATES. Elles sont rangees dans un fichier que l'APPLICATION NE LIT JAMAIS
   (outils/sas/*.sas.txt) et ne deviennent publiques qu'une par une, quand la personne a ouvert le site et cliqué « C'est bon » (date du jour).
   Trois sas : lieux (structures), employeurs, complements (numeros de telephone a ajouter a des fiches deja connues).
   Les REGLES de verification sont celles de l'application elle-meme (mtVerifierLieux / mtVerifierEmployeurs) : jamais une copie.
   L'analyse d'un lot ne modifie JAMAIS le sens d'une ligne : elle ne corrige que la FORME (https, tirets longs, espaces, majuscules des listes fermees,
   format du numero) et montre chaque correction ; le reste est propose sous forme de suggestions a accepter.
   ============================================================ */
'use strict';
const L = require('../modules/mon-territoire/logique.js');
const T = require('./veilleTerritoire.js');

const CHEMINS = { lieux: 'outils/sas/lieux.sas.txt', employeurs: 'outils/sas/employeurs.sas.txt', complements: 'outils/sas/complements.sas.txt', offres: 'outils/sas/offres.sas.txt' };
const COLONNES = { lieux: T.FICHIERS.lieux.colonnes, employeurs: T.FICHIERS.employeurs.colonnes, complements: ['cible', 'registre', 'telephone', 'source'], offres: T.FICHIERS.offres.colonnes };
const MAX_LIGNES = 100;
const RE_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;
const SOURCE_ABSENTE = 'proposée par un assistant, source non donnée';
const TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014), 'g');

const EN_TETES = {
  lieux: ['# Sas des structures : fiches PROPOSEES (par exemple par un assistant) et pas encore verifiees. L\'application NE LIT PAS ce fichier.',
    '# Format : celui de modules/mon-territoire/contenu/lieux.txt, colonne date vide. Une fiche sort d\'ici quand elle est verifiee (outil de veille, bouton « C\'est bon »).', ''].join('\n'),
  employeurs: ['# Sas des employeurs : fiches PROPOSEES (par exemple par un assistant) et pas encore verifiees. L\'application NE LIT PAS ce fichier.',
    '# Format : celui de modules/mon-territoire/contenu/employeurs.txt, colonne date vide. Une fiche sort d\'ici quand elle est verifiee (outil de veille, bouton « C\'est bon »).', ''].join('\n'),
  offres: ['# Sas des pages d\'offres : pages de recrutement PROPOSEES (par exemple par un assistant) et pas encore verifiees a la main. L\'application NE LIT PAS ce fichier.',
    '# Format : celui de modules/mon-territoire/contenu/offres.txt, colonne date vide. Une page sort d\'ici quand vous l\'avez ouverte et verifiee (outil de veille, bouton « C\'est bon »).', ''].join('\n'),
  complements: ['# Sas des telephones : numeros PROPOSES pour des fiches deja publiees. L\'application NE LIT PAS ce fichier.',
    '# Format : cible (identifiant de la fiche) | registre (lieux ou employeurs) | telephone | source (page ou le numero figure).', ''].join('\n')
};

function norm(s) { return L.mtNormaliser(s); }
function finDeLigne(texte) { return String(texte).indexOf('\r\n') !== -1 ? '\r\n' : '\n'; }

// ---------- 1. Nettoyage du texte colle ----------
// Retire ce que les assistants ajoutent autour des lignes (blocs de code, numeros, puces, barres de tableau, lignes de titre, listes de sources).
// Une ligne est une ligne de DONNEES si elle contient assez de barres verticales ; le reste (phrases, listes « a verifier ») est ignore et compte.
// Marques que l'interface de ChatGPT glisse dans le texte copié : références d'entité (entity["turn0business0","Nom"]), références de contenu, paramètre de suivi des liens.
function sansMarquesDeChatbot(l) {
  return l.replace(/\s*entity\[\s*"[^"]*"\s*,\s*"[^"]*"\s*\]/g, '').replace(/\s*:?chatgpt-content-reference\{[^}]*\}/g, '').replace(/\s*cite(?:turn\d+(?:business|search|view|news|image|file)\d+)+/g, '').replace(/\?utm_source=chatgpt\.com/g, '').replace(/\s+$/, '');
}
function nettoyer(texte, nbColonnes) {
  const seuil = Math.max(2, nbColonnes - 3);
  const lignes = []; const ignoreesListe = []; let ignorees = 0, numero = 0;
  String(texte || '').split(/\r?\n/).forEach(function (brut) {
    numero++;
    let l = sansMarquesDeChatbot(brut.replace(/ /g, ' ')).trim();
    if (!l || /^```/.test(l) || /^#/.test(l)) { return; }
    l = l.replace(/^(\d+\s*[.)]|[-*•])\s+/, '');
    if (/^\|?[\s:|-]+\|?$/.test(l) && l.indexOf('-') !== -1) { return; }
    if (/^\|.*\|$/.test(l)) { l = l.replace(/^\|\s*/, '').replace(/\s*\|$/, ''); }
    if ((l.match(/\|/g) || []).length < seuil) { ignorees++; if (ignoreesListe.length < 12) { ignoreesListe.push(l.slice(0, 90)); } return; }
    if (/^(id|nom|cible)\s*\|\s*(type|nature|t[ée]l[ée]phone|registre|nom)\b/i.test(l)) { return; }
    lignes.push({ numero: numero, brut: l });
  });
  return { lignes: lignes, ignorees: ignorees, ignoreesListe: ignoreesListe };
}

// ---------- 2. Outils de proximite (suggestions) ----------
function distance(a, b) {
  if (a === b) { return 0; }
  const m = a.length, n = b.length;
  if (!m || !n) { return Math.max(m, n); }
  let prec = []; for (let j = 0; j <= n; j++) { prec[j] = j; }
  for (let i = 1; i <= m; i++) {
    const cour = [i];
    for (let j = 1; j <= n; j++) { cour[j] = Math.min(prec[j] + 1, cour[j - 1] + 1, prec[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); }
    prec = cour;
  }
  return prec[n];
}
// candidats : [{ v: valeur a ecrire, l: libelle }] ; rend au plus 3 candidats proches de `valeur`.
function plusProches(valeur, candidats) {
  const q = norm(valeur), tolere = Math.max(2, Math.floor(q.length * 0.3));
  if (!q) { return []; }
  return candidats.map(function (c) {
    const dv = distance(q, norm(c.v)), dl = c.l ? distance(q, norm(c.l)) : 99;
    const contient = q.length >= 4 && (norm(c.v).indexOf(q) !== -1 || (c.l && norm(c.l).indexOf(q) !== -1));
    return { c: c, d: Math.min(dv, dl, contient ? 1 : 99) };
  }).filter(function (x) { return x.d <= tolere; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 3).map(function (x) { return x.c; });
}

const ALIAS_PORTEE = { 'dordogne': '24', 'perigord': '24', 'haute vienne': '87', 'limousin': '87', 'france': 'national', 'nationale': 'national', 'national': 'national', 'regionale': 'region', 'region': 'region', 'nouvelle aquitaine': 'region', 'departementale': '' };

// ---------- 3. Corrections de FORME ----------
function slugId(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[_\s]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}
// Un numéro à 10 chiffres (05 53 00 00 00) ou un numéro court national (115, 3919, 116 006) : la règle est celle de l'application (logique.js).
function formatTelephone(t) { return L.mtFormaterTelephone(t); }
function corrigerForme(valeurs, colonnes, ctx) {
  const v = Object.assign({}, valeurs), corrections = [];
  const noter = function (champ, de, vers, raison) { if (de !== vers) { corrections.push({ champ: champ, de: de, vers: vers, raison: raison }); } };
  colonnes.forEach(function (c) {
    if (v[c] == null) { v[c] = ''; }
    let x = String(v[c]).replace(TIRET_LONG, '-').replace(/\s{2,}/g, ' ').trim();
    if (x !== String(v[c]).trim() && TIRET_LONG.test(String(v[c]))) { noter(c, v[c], x, 'tiret long remplacé par un tiret simple'); }
    TIRET_LONG.lastIndex = 0;
    v[c] = x;
  });
  if (colonnes.indexOf('id') !== -1 && v.id && !RE_ID.test(v.id)) { const s = slugId(v.id); if (s && s !== v.id) { noter('id', v.id, s, 'identifiant écrit en minuscules, sans accent, avec des tirets'); v.id = s; } }
  ['site', 'recrutement', 'page'].forEach(function (c) {
    if (colonnes.indexOf(c) === -1 || !v[c]) { return; }
    let x = v[c].replace(/^<|>$/g, '').replace(/[)\].,;]+$/, '');
    if (/^http:\/\//i.test(x)) { x = x.replace(/^http:\/\//i, 'https://'); }
    else if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i.test(x)) { x = 'https://' + x; }
    if (x !== v[c]) { noter(c, v[c], x, 'adresse mise en https://'); v[c] = x; }
  });
  if (colonnes.indexOf('telephone') !== -1 && v.telephone) {
    const f = formatTelephone(v.telephone);
    if (f && f !== v.telephone) { noter('telephone', v.telephone, f, 'numéro mis au format 05 53 00 00 00'); v.telephone = f; }
  }
  // Communes : le fichier officiel Sirene (donc la prospection) les ecrit sans accent et avec des majuscules (« SARLAT-LA-CANEDA », « Saint-Laurent-Des-Vignes »). Une commune qui ne differe de
  // la liste officielle que par les accents, les majuscules ou les tirets prend l'ecriture officielle (correspondance exacte sur la cle de mtNormaliser : aucune collision sur les 698 communes).
  if (ctx && ctx.communesNoms && ctx.communesNoms.length) {
    const officiel = {}; ctx.communesNoms.forEach(function (n) { officiel[norm(n)] = n; });
    const officielle = function (nom) { const o = officiel[norm(nom)]; return (o && o !== String(nom).trim()) ? o : null; };
    if (colonnes.indexOf('commune') !== -1 && v.commune) { const o = officielle(v.commune); if (o) { noter('commune', v.commune, o, 'commune écrite comme dans la liste officielle'); v.commune = o; } }
    if (colonnes.indexOf('etablissements') !== -1 && v.etablissements) {
      const de = v.etablissements;
      const vers = de.split(';').map(function (e) {
        const i = e.indexOf(':'); if (i === -1) { return e; }
        const o = officielle(e.slice(0, i)); return o ? (/^\s/.test(e) ? ' ' : '') + o + e.slice(i) : e;
      }).join(';');
      if (vers !== de) { noter('etablissements', de, vers, 'commune écrite comme dans la liste officielle'); v.etablissements = vers; }
    }
  }
  // Listes fermees : mise en minuscules, tirets bas et espaces en tirets, SEULEMENT si cela donne une valeur connue.
  const connue = { type: Object.keys(L.MT_TYPES), nature: ['enseigne', 'local', 'interim'], famille: ['employeur', 'portail-officiel', 'groupement', 'federation'], territoire: ['24', '87', 'region', 'national'], portee: L.MT_PORTEES, secteur: (ctx && ctx.secteurs) || [] };
  Object.keys(connue).forEach(function (c) {
    if (colonnes.indexOf(c) === -1 || !v[c] || connue[c].indexOf(v[c]) !== -1) { return; }
    const x = v[c].toLowerCase().replace(/[_\s]+/g, '-');
    if (connue[c].indexOf(x) !== -1) { noter(c, v[c], x, 'écrit comme dans la liste'); v[c] = x; }
  });
  [['rayons', L.MT_RAYONS], ['modes', Object.keys(L.MT_MODES)]].forEach(function (p) {
    const c = p[0]; if (colonnes.indexOf(c) === -1 || !v[c]) { return; }
    // Les rayons et les modes ne contiennent jamais d'espace : une liste séparée par des espaces ou des points-virgules (« former accompagnement ») est lue comme une liste séparée par des virgules.
    const x = v[c].split(/[,;\s]+/).map(function (s) { const t = s.trim().toLowerCase().replace(/_/g, '-'); return p[1].indexOf(t) !== -1 ? t : s.trim(); }).filter(Boolean).join(',');
    if (x !== v[c].replace(/\s*,\s*/g, ',')) { noter(c, v[c], x, 'liste séparée par des virgules, écrite comme dans la liste'); }
    v[c] = x;
  });
  if (colonnes.indexOf('date') !== -1 && v.date) { noter('date', v.date, '', 'la date est celle de VOTRE vérification : elle est laissée vide'); v.date = ''; }
  // Structure nationale ou régionale : la commune n'est que celle du siège, sans intérêt pour la personne ; si elle n'est dans aucune liste de communes (Paris, Bordeaux...), on la vide.
  if (colonnes.indexOf('portee') !== -1 && (v.portee === 'national' || v.portee === 'region') && v.commune && ctx && ctx.communes && ctx.communes.indexOf(norm(v.commune)) === -1) {
    noter('commune', v.commune, '', 'commune du siège vidée (structure nationale ou régionale)'); v.commune = '';
  }
  // Une carte ou un moteur de recherche n'est pas une source : on le traite comme une source absente.
  if (colonnes.indexOf('source') !== -1 && /^https?:\/\/(www\.)?(google\.[a-z.]+\/(maps|search)|maps\.google\.|bing\.com\/(maps|search))/i.test(v.source)) { noter('source', v.source, '', 'une carte ou un moteur de recherche ne sert pas de source'); v.source = ''; }
  // Aucune source donnée : on le dit, on n'invente rien. La vérification (ouvrir le site) reste à faire.
  if (colonnes.indexOf('source') !== -1 && !v.source) { noter('source', '', SOURCE_ABSENTE, 'aucune source donnée : mention honnête ajoutée'); v.source = SOURCE_ABSENTE; }
  return { valeurs: v, corrections: corrections };
}

// ---------- 4. Problemes et suggestions ----------
function snippet(champ, valeur) { return champ + ':' + valeur; }
function suggestionsPour(champ, valeur, colonnes, ctx) {
  const entre = function (x) { return ' | ' + x + ' | '; };
  const sug = [];
  if (champ === 'type') {
    plusProches(valeur, Object.keys(L.MT_TYPES).map(function (k) { return { v: k, l: L.MT_TYPES[k] }; })).forEach(function (c) { sug.push({ libelle: c.v + ' (' + c.l + ')', de: entre(valeur), vers: entre(c.v) }); });
  } else if (champ === 'secteur') {
    plusProches(valeur, ((ctx && ctx.secteursLibelles) || []).map(function (s) { return { v: s.cle, l: s.libelle }; })).forEach(function (c) { sug.push({ libelle: c.v + ' (' + c.l + ')', de: entre(valeur), vers: entre(c.v) }); });
  } else if (champ === 'portee') {
    const a = ALIAS_PORTEE[norm(valeur)];
    if (a) { sug.push({ libelle: a, de: entre(valeur), vers: entre(a) }); }
  } else if (champ === 'commune' || champ === 'commune-zone') {
    plusProches(valeur, ((ctx && ctx.communesNoms) || []).map(function (n) { return { v: n, l: '' }; })).forEach(function (c) {
      sug.push({ libelle: c.v, de: champ === 'commune-zone' ? 'commune:' + valeur : (colonnes.indexOf('etablissements') !== -1 ? valeur + ':' : entre(valeur)), vers: champ === 'commune-zone' ? 'commune:' + c.v : (colonnes.indexOf('etablissements') !== -1 ? c.v + ':' : entre(c.v)) });
    });
  }
  return sug;
}
function traduire(message, colonnes, ctx, v) {
  let m;
  if ((m = /^type inconnu : (.*)$/.exec(message))) { return { champ: 'type', message: 'Le type « ' + m[1] + ' » n\'existe pas dans la liste.', suggestions: suggestionsPour('type', m[1], colonnes, ctx) }; }
  if ((m = /^secteur inconnu : (.*)$/.exec(message))) { return { champ: 'secteur', message: 'Le secteur « ' + m[1] + ' » n\'existe pas dans la liste.', suggestions: suggestionsPour('secteur', m[1], colonnes, ctx) }; }
  if ((m = /^portée inconnue : (.*)$/.exec(message))) { return { champ: 'portee', message: 'La portée « ' + m[1] + ' » n\'existe pas (national, region, 24 ou 87).', suggestions: suggestionsPour('portee', m[1], colonnes, ctx) }; }
  if ((m = /^commune inconnue dans la zone : (.*)$/.exec(message))) { return { champ: 'zone', message: 'La commune « ' + m[1] + ' » (colonne zone) n\'est dans aucune liste de communes.', suggestions: suggestionsPour('commune-zone', m[1], colonnes, ctx) }; }
  if ((m = /^commune inconnue : (.*)$/.exec(message))) { return { champ: 'commune', message: 'La commune « ' + m[1] + ' » n\'est dans aucune liste de communes (Dordogne, Haute-Vienne).', suggestions: suggestionsPour('commune', m[1], colonnes, ctx) }; }
  if ((m = /^rayon inconnu : (.*)$/.exec(message))) {
    const x = m[1], jetons = String((v && v.rayons) || '').split(','), pos = jetons.indexOf(x), sug = [];
    const inter = function (a) { return ' | ' + a + ' | '; };
    // Proposer le rayon le plus proche, ou retirer le mot (souvent un TYPE écrit à la place d'un rayon : « soutien-aux-familles »).
    plusProches(x, L.MT_RAYONS.map(function (r) { return { v: r, l: '' }; })).forEach(function (c) {
      if (jetons.indexOf(c.v) === -1) { sug.push({ libelle: c.v, de: pos > 0 ? ',' + x + ' | ' : (jetons.length > 1 ? ' | ' + x + ',' : inter(x)), vers: pos > 0 ? ',' + c.v + ' | ' : (jetons.length > 1 ? ' | ' + c.v + ',' : inter(c.v)) }); }
    });
    if (jetons.length > 1) { sug.push({ libelle: 'retirer « ' + x + ' » des rayons', de: pos > 0 ? ',' + x + ' | ' : ' | ' + x + ',', vers: pos > 0 ? ' | ' : ' | ' }); }
    const type = L.MT_TYPES[x] ? ' C\'est un TYPE de structure, pas un rayon : il va dans la colonne « type ».' : '';
    return { champ: 'rayons', message: 'Le rayon « ' + x + ' » n\'existe pas.' + type + ' Rayons possibles : ' + L.MT_RAYONS.join(', ') + '.', suggestions: sug };
  }
  if ((m = /^mode inconnu : (.*)$/.exec(message))) { return { champ: 'modes', message: 'Le mode de candidature « ' + m[1] + ' » n\'existe pas. Possibles : ' + Object.keys(L.MT_MODES).join(', ') + '.', suggestions: [] }; }
  if (message === 'source vide') { return { champ: 'source', message: 'La colonne « source » est vide : mettez l\'adresse de la page où l\'information a été trouvée.', suggestions: [] }; }
  if (message === 'téléphone mal écrit') { return { champ: 'telephone', message: 'Le numéro de téléphone est mal écrit (format attendu : 05 53 00 00 00).', suggestions: [] }; }
  if (/^site : une adresse https/.test(message)) { return { champ: 'site', message: 'Le site doit être une adresse complète commençant par https://.', suggestions: [] }; }
  if (/^page de recrutement : une adresse https/.test(message)) { return { champ: 'recrutement', message: 'La page de recrutement doit être une adresse complète commençant par https://.', suggestions: [] }; }
  if (message === 'nom vide') { return { champ: 'nom', message: 'Le nom est vide.', suggestions: [] }; }
  if (message === 'au moins un rayon') { return { champ: 'rayons', message: 'Aucun rayon n\'est indiqué. Rayons possibles : ' + L.MT_RAYONS.join(', ') + '.', suggestions: [] }; }
  if (/^au moins un établissement/.test(message)) { return { champ: 'etablissements', message: 'Aucun établissement : écrivez Commune:adresse (par exemple Bergerac:12 rue de la Paix).', suggestions: [] }; }
  if (/^le nom ressemble à celui d/.test(message)) { return { champ: 'nom', message: 'Le nom ressemble à celui d\'une personne : le module ne montre que des organismes.', suggestions: [] }; }
  if (/^tiret long interdit/.test(message)) { return { champ: '', message: 'Un tiret long est interdit (remplacez-le par un tiret simple).', suggestions: [] }; }
  return { champ: '', message: message, suggestions: [] };
}

// ---------- 5. Index de doublons ----------
// Lit un fichier du sas : pour les numeros, l'identifiant d'une ligne est la fiche visee (colonne « cible »).
function lireSas(texte, colonnes) {
  const a = T.analyser(texte || '', colonnes);
  if (colonnes.indexOf('cible') !== -1) { a.lignes.forEach(function (l) { if (l.valeurs) { l.id = l.valeurs.cible; } }); }
  return a;
}
function siteNorm(s) { return String(s || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[?#].*$/, '').replace(/\/+$/, ''); }
function indexer(texte, colonnes, ou) {
  return lireSas(texte, colonnes).lignes.filter(function (l) { return l.id; }).map(function (l) {
    return { ou: ou, id: l.id, nom: l.valeurs.nom, nomNorm: norm(l.valeurs.nom), site: siteNorm(l.valeurs.site || l.valeurs.page), valeurs: l.valeurs };
  });
}
// Mots trop généraux pour dire que deux noms désignent le même organisme.
const MOTS_GENERAUX = ['association', 'nouvelle', 'aquitaine', 'centre', 'service', 'services', 'departement', 'departemental', 'france', 'national', 'nationale', 'region', 'regional', 'regionale',
  'dordogne', 'vienne', 'haute', 'limousin', 'perigord', 'mission', 'locale', 'maison', 'groupe', 'agence', 'union', 'reseau', 'antenne', 'delegation', 'direction', 'conseil', 'accompagnement', 'justice', 'droit', 'droits', 'point', 'tribunal', 'judiciaire', 'bureau', 'ordre', 'barreau', 'comite', 'federation', 'fondation', 'caisse', 'cites'];
function motsSignificatifs(nomNorm, communes) { return String(nomNorm || '').split(' ').filter(function (m) { return m.length >= 4 && MOTS_GENERAUX.indexOf(m) === -1 && !(communes && communes[m]); }); }
function partageUnMot(a, b, communes) { const m = motsSignificatifs(b, communes); return motsSignificatifs(a, communes).some(function (x) { return m.indexOf(x) !== -1; }); }
// Les mots qui sont des noms de communes (« perigueux », « limoges »...) : ils ne disent rien de l'organisme.
function motsDeCommunes(ctx) { const o = {}; ((ctx && ctx.communes) || []).forEach(function (c) { String(c).split(' ').forEach(function (m) { if (m.length >= 4) { o[m] = true; } }); }); return o; }

// Une fiche est « déjà connue » si son identifiant ou son nom existe déjà, ou si son adresse est celle d'une fiche déjà publiée ou déjà dans le sas ET qu'elles sont de la MEME portée (une association de la Haute-Vienne et celle de la Dordogne partagent parfois le site de leur fédération) ET que les deux noms ont un mot fort
// en commun (hors mots généraux et noms de communes : deux structures d'une même ville ne sont pas le même organisme) (le Conseil départemental de l'accès au droit et le CDAD de la Dordogne partagent un site et un nom proche ; la DREETS et l'inspection du travail partagent un site, pas un nom).
// Une même adresse sans nom proche, ou dans le MEME lot, n'est qu'un avertissement : un organisme a souvent plusieurs services sur une seule page.
// Les communes d'une fiche : la commune (structures) ou celles des etablissements (employeurs : « Limoges:adresse ; Boisseuil »).
function communesDe(v) {
  const liste = [];
  if (v && v.commune) { liste.push(norm(v.commune)); }
  if (v && v.etablissements) { String(v.etablissements).split(';').forEach(function (e) { const c = norm(String(e).split(':')[0]); if (c) { liste.push(c); } }); }
  return liste;
}
// Deux fiches de meme nom ou de meme site mais dont les communes n'ont RIEN en commun sont deux etablissements differents
// (Leroy Merlin de Chancelade et celui de Limoges, deux antennes d'un meme organisme) : jamais un doublon.
function lieuxDifferents(v, x) {
  if (!x.valeurs) { return false; }
  const a = communesDe(v), b = communesDe(x.valeurs);
  return a.length > 0 && b.length > 0 && !a.some(function (c) { return b.indexOf(c) !== -1; });
}
function doublon(index, v, ctx) {
  const nom = norm(v.nom), site = siteNorm(v.site || v.page), communes = motsDeCommunes(ctx);
  for (let i = 0; i < index.length; i++) {
    const x = index[i];
    if (x.id === v.id) { return { ou: x.ou, id: x.id, nom: x.nom, raison: 'identifiant' }; }
    if (lieuxDifferents(v, x)) { continue; }
    if (nom && x.nomNorm === nom) { return { ou: x.ou, id: x.id, nom: x.nom, raison: 'nom' }; }
    if (site && x.site && x.site === site && x.ou !== 'lot' && String((x.valeurs && x.valeurs.portee) || v.portee) === String(v.portee) && partageUnMot(nom, x.nomNorm, communes)) { return { ou: x.ou, id: x.id, nom: x.nom, raison: 'site' }; }
  }
  return null;
}
function memeAdresse(index, v) {
  const site = siteNorm(v.site || v.page);
  if (!site) { return null; }
  for (let i = 0; i < index.length; i++) { if (index[i].site && index[i].site === site) { return index[i]; } }
  return null;
}

// ---------- 6. Analyse d'UNE ligne (structures ou employeurs) ----------
function decouper(brut, colonnes) {
  let p = brut.split(/\s*\|\s*/).map(function (x) { return x.trim(); });
  if (p.length === colonnes.length + 1 && p[p.length - 1] === '') { p.pop(); }
  // Les anciennes lignes des structures n'ont pas la colonne « mail » (la dernière) : elle est alors vide.
  if (colonnes[colonnes.length - 1] === 'mail' && p.length === colonnes.length - 2) { p.push(''); }
  if (colonnes[colonnes.length - 1] === 'mail' && p.length === colonnes.length - 1) { p.push(''); }
  if (p.length === colonnes.length - 1) { p.push(''); }
  if (p.length !== colonnes.length) { return { ok: false, message: 'Cette ligne a ' + p.length + ' colonnes au lieu de ' + colonnes.length + ' (' + colonnes.join(' | ') + '). Une colonne vide s\'écrit « | | ».' }; }
  const v = {}; colonnes.forEach(function (c, k) { v[c] = p[k]; });
  return { ok: true, valeurs: v };
}
function analyserLigne(fichier, brut, numero, ctx, index, texteRegistre, aujourdhui) {
  const f = T.FICHIERS[fichier], colonnes = f.colonnes;
  const sortie = { numero: numero, brut: brut, statut: 'corriger', corrections: [], problemes: [], connue: null, ligneFinale: '', valeurs: null, nom: '' };
  const d = decouper(brut, colonnes);
  if (!d.ok) { sortie.problemes.push({ champ: '', message: d.message, suggestions: [] }); return sortie; }
  const c = corrigerForme(d.valeurs, colonnes, ctx);
  const v = c.valeurs; sortie.corrections = c.corrections; sortie.valeurs = v; sortie.nom = v.nom;
  sortie.ligneFinale = T.formater(colonnes, v);
  sortie.avertissements = [];
  const dbl = doublon(index, v, ctx);
  if (dbl) { sortie.statut = 'connue'; sortie.connue = dbl; return sortie; }
  if (!RE_ID.test(v.id || '')) { sortie.problemes.push({ champ: 'id', message: 'L\'identifiant est vide ou invalide (minuscules, chiffres et tirets, 2 caractères au moins).', suggestions: [] }); return sortie; }
  const fin = finDeLigne(texteRegistre);
  const essai = Object.assign({}, v, { date: aujourdhui });
  const texte = String(texteRegistre || '').replace(/\s*$/, '') + fin + T.formater(colonnes, essai);
  const n = texte.split(/\r?\n/).length, motif = 'ligne ' + n + ' (';
  const erreurs = f.verifier(texte, Object.assign({}, ctx || {}, { aujourdhui: aujourdhui })).filter(function (e) { return e.indexOf(motif) === 0; }).map(function (e) { return e.replace(/^ligne \d+ \([^)]*\) : /, ''); });
  erreurs.forEach(function (e) { sortie.problemes.push(traduire(e, colonnes, ctx, v)); });
  // Cohérence entre la portée et la commune : une commune de l'autre département est une vraie erreur ; un nom qui cite un département alors que la portée est régionale ou nationale est signalé.
  const dep = L.mtDepartement(v.portee), codeCommune = v.commune && ctx && ctx.communesCodes ? ctx.communesCodes[norm(v.commune)] : '';
  if (dep && codeCommune && String(codeCommune).indexOf(dep.code) !== 0) {
    const autre = L.mtDepartement(String(codeCommune).slice(0, 2));
    sortie.problemes.push({ champ: 'commune', message: 'La commune « ' + v.commune + ' » est ' + (autre ? autre.en : 'dans un autre département') + ', mais la portée indiquée est ' + dep.code + ' (' + dep.nom + ').', suggestions: [] });
  }
  if (v.portee === 'region' || v.portee === 'national') {
    Object.keys(L.MT_DEPARTEMENTS).forEach(function (k) {
      const d = L.MT_DEPARTEMENTS[k];
      if (norm(v.nom).indexOf(norm(d.nom)) !== -1) { sortie.avertissements.push('Le nom cite « ' + d.nom + ' » alors que la portée est « ' + v.portee + ' » : est-ce plutôt ' + d.code + ' ?'); }
    });
  }
  const meme = memeAdresse(index, v);
  if (meme) { sortie.avertissements.push('Même adresse que « ' + (meme.nom || meme.id) + ' » (' + ({ registre: 'déjà publiée', sas: 'déjà dans le sas', lot: 'autre ligne de ce lot' })[meme.ou] + ') : plusieurs services d\'un même organisme, ou un doublon ?'); }
  if (!sortie.problemes.length) { sortie.statut = 'prete'; }
  return sortie;
}

// ---------- 7. Analyse d'un lot de numeros de telephone ----------
// Format de la reponse a demander : nom | telephone | page ou le numero figure | a verifier
function analyserComplement(brut, numero, registres, index) {
  const cases = brut.split(/\s*\|\s*/).map(function (x) { return x.trim(); });
  const nom = cases[0] || '', tel = cases[1] || '', page = cases[2] || '';
  const sortie = { numero: numero, brut: brut, statut: 'corriger', corrections: [], problemes: [], connue: null, ligneFinale: '', valeurs: null, nom: nom };
  const candidats = [];
  Object.keys(registres).filter(function (r) { return r === 'lieux' || r === 'employeurs'; }).forEach(function (r) {
    T.analyser(registres[r] || '', T.FICHIERS[r].colonnes).lignes.filter(function (l) { return l.id; }).forEach(function (l) { candidats.push({ registre: r, id: l.id, nom: l.valeurs.nom, telephone: l.valeurs.telephone }); });
  });
  const exact = candidats.filter(function (x) { return norm(x.nom) === norm(nom); });
  if (!nom) { sortie.problemes.push({ champ: 'nom', message: 'Le nom de la fiche est vide.', suggestions: [] }); return sortie; }
  if (exact.length > 1) { sortie.problemes.push({ champ: 'nom', message: 'Plusieurs fiches portent ce nom (' + exact.map(function (x) { return x.id; }).join(', ') + ') : précisez laquelle.', suggestions: [] }); return sortie; }
  if (!exact.length) {
    const proches = plusProches(nom, candidats.map(function (x) { return { v: x.nom, l: '' }; }));
    sortie.problemes.push({ champ: 'nom', message: 'Aucune fiche de ce nom au répertoire.' + (proches.length ? ' Vouliez-vous dire :' : ''), suggestions: proches.map(function (c) { return { libelle: c.v, de: nom, vers: c.v }; }) });
    return sortie;
  }
  const cible = exact[0];
  sortie.nom = cible.nom;
  if (!tel || /^(non trouv|aucun|introuvable|n\/a|-)/i.test(tel)) { sortie.statut = 'rien'; sortie.problemes = []; sortie.message = 'Pas de numéro trouvé : rien à ajouter.'; return sortie; }
  const f = formatTelephone(tel);
  if (!f) { sortie.problemes.push({ champ: 'telephone', message: 'Le numéro « ' + tel + ' » n’est ni un numéro à 10 chiffres ni un numéro court national (15, 115, 3919, 116 006...).', suggestions: [] }); return sortie; }
  if (f !== tel) { sortie.corrections.push({ champ: 'telephone', de: tel, vers: f, raison: 'numéro mis au format 05 53 00 00 00' }); }
  if (!/^https:\/\/\S+$/.test(page.replace(/^http:\/\//i, 'https://'))) { sortie.problemes.push({ champ: 'source', message: 'La page où le numéro figure est absente ou n\'est pas une adresse complète : sans elle, impossible de vérifier.', suggestions: [] }); return sortie; }
  const source = page.replace(/^http:\/\//i, 'https://');
  if (source !== page) { sortie.corrections.push({ champ: 'source', de: page, vers: source, raison: 'adresse mise en https://' }); }
  if (cible.telephone === f) { sortie.statut = 'rien'; sortie.message = 'Cette fiche porte déjà ce numéro.'; return sortie; }
  const dejaAttente = index.filter(function (x) { return x.id === cible.id; })[0];
  if (dejaAttente) { sortie.statut = 'connue'; sortie.connue = { ou: dejaAttente.ou, id: cible.id, nom: cible.nom, raison: 'identifiant' }; return sortie; }
  sortie.valeurs = { cible: cible.id, registre: cible.registre, telephone: f, source: source, ancienTelephone: cible.telephone || '' };
  sortie.ligneFinale = cible.nom + ' | ' + f + ' | ' + source + ' | non';
  sortie.statut = 'prete';
  return sortie;
}

// ---------- 8. Analyse d'un lot ----------
// registres : { lieux: texte, employeurs: texte } (le registre du fichier analyse sert aux verifications ; les deux servent aux complements)
function analyserLot(fichier, texteColle, registres, texteSas, ctx, aujourdhui) {
  if (!CHEMINS[fichier]) { return { ok: false, erreur: 'Registre inconnu.' }; }
  const colonnes = fichier === 'complements' ? ['nom', 'telephone', 'source', 'verifier'] : T.FICHIERS[fichier].colonnes;
  const net = nettoyer(texteColle, colonnes.length);
  if (!net.lignes.length) { return { ok: false, erreur: 'Aucune ligne reconnue. Collez des lignes dont les colonnes sont séparées par « | ».' }; }
  if (net.lignes.length > MAX_LIGNES) { return { ok: false, erreur: 'Trop de lignes d\'un coup (' + MAX_LIGNES + ' au plus). Faites plusieurs imports.' }; }
  const lignes = [];
  let index;
  if (fichier === 'complements') { index = indexer(texteSas, COLONNES.complements, 'sas').map(function (x) { return { ou: x.ou, id: x.id }; }); }
  else { index = indexer(registres[fichier], T.FICHIERS[fichier].colonnes, 'registre').concat(indexer(texteSas, T.FICHIERS[fichier].colonnes, 'sas')); }
  net.lignes.forEach(function (l) {
    const r = fichier === 'complements' ? analyserComplement(l.brut, l.numero, registres, index) : analyserLigne(fichier, l.brut, l.numero, ctx, index, registres[fichier], aujourdhui);
    // Deux lignes du meme lot qui se ressemblent : la seconde est « deja dans ce lot ».
    if (r.statut === 'prete') {
      if (fichier === 'complements') { index.push({ ou: 'lot', id: r.valeurs.cible }); }
      else { index.push({ ou: 'lot', id: r.valeurs.id, nom: r.valeurs.nom, nomNorm: norm(r.valeurs.nom), site: siteNorm(r.valeurs.site), valeurs: r.valeurs }); }
    }
    lignes.push(r);
  });
  const resume = { lues: lignes.length, pretes: 0, connues: 0, acorriger: 0, rien: 0, ignorees: net.ignorees, ignoreesListe: net.ignoreesListe };
  lignes.forEach(function (r) { if (r.statut === 'prete') { resume.pretes++; } else if (r.statut === 'connue') { resume.connues++; } else if (r.statut === 'rien') { resume.rien++; } else { resume.acorriger++; } });
  return { ok: true, fichier: fichier, lignes: lignes, resume: resume, aujourdhui: aujourdhui };
}

// ---------- 9. Le sas lui-meme ----------
function lister(fichier, texteSas, registres) {
  if (!CHEMINS[fichier]) { return { ok: false, erreur: 'Registre inconnu.' }; }
  const lignes = lireSas(texteSas, COLONNES[fichier]).lignes.filter(function (l) { return l.id; }).map(function (l) {
    const o = { id: l.id, valeurs: l.valeurs, nom: l.valeurs.nom || '' };
    if (fichier === 'complements') {
      const r = (registres && registres[l.valeurs.registre]) || '';
      const fiche = T.analyser(r, T.FICHIERS[l.valeurs.registre] ? T.FICHIERS[l.valeurs.registre].colonnes : []).lignes.filter(function (x) { return x.id === l.valeurs.cible; })[0];
      o.nom = fiche ? fiche.valeurs.nom : l.valeurs.cible; o.fiche = fiche ? fiche.valeurs : null;
    }
    return o;
  });
  return { ok: true, fichier: fichier, colonnes: COLONNES[fichier], lignes: lignes };
}

function cleDeLigne(fichier, v) { return fichier === 'complements' ? v.cible : v.id; }

// Applique des actions au sas : { op:'importer', lignes:[texte des lignes finales] } | { op:'retirer', id } | { op:'modifier', id, ligne }
// Rend { ok, texte, resume } ou { ok:false, erreur }.
function appliquer(fichier, texteSas, actions, registres, ctx, aujourdhui) {
  if (!CHEMINS[fichier]) { return { ok: false, erreur: 'Sas inconnu.' }; }
  if (!Array.isArray(actions) || !actions.length) { return { ok: false, erreur: 'Aucune modification à enregistrer dans le sas.' }; }
  if (actions.length > MAX_LIGNES + 20) { return { ok: false, erreur: 'Trop de modifications d\'un coup.' }; }
  const colonnes = COLONNES[fichier];
  const fin = finDeLigne(texteSas || '');
  let texte = String(texteSas || '').trim() ? String(texteSas) : EN_TETES[fichier];
  const resume = { importes: 0, retires: 0, modifies: 0 };
  const lignesDe = function (t) { return lireSas(t, colonnes); };
  const retirerLigne = function (t, id) {
    const a = lignesDe(t); let trouve = false;
    const sortie = a.lignes.filter(function (l) { if (l.id && l.id === id) { trouve = true; return false; } return true; }).map(function (l) { return l.brut; });
    return { texte: sortie.join(a.fin), trouve: trouve };
  };
  const vus = {};
  for (const ac of actions) {
    if (!ac || typeof ac !== 'object') { return { ok: false, erreur: 'Modification du sas mal formée.' }; }
    if (ac.op === 'importer') {
      if (!Array.isArray(ac.lignes) || !ac.lignes.length) { return { ok: false, erreur: 'Aucune ligne à importer.' }; }
      const r = analyserLot(fichier, ac.lignes.join('\n'), registres, texte, ctx, aujourdhui);
      if (!r.ok) { return { ok: false, erreur: r.erreur }; }
      const pasPretes = r.lignes.filter(function (l) { return l.statut !== 'prete'; });
      if (pasPretes.length) { return { ok: false, erreur: 'La ligne ' + pasPretes[0].numero + ' n\'est pas prête (« ' + (pasPretes[0].nom || pasPretes[0].brut.slice(0, 40)) + ' ») : rien n\'a été importé.' }; }
      const ajoutees = r.lignes.map(function (l) {
        return fichier === 'complements' ? [l.valeurs.cible, l.valeurs.registre, l.valeurs.telephone, l.valeurs.source].join(' | ') : T.formater(colonnes, Object.assign({}, l.valeurs, { date: '' }));
      });
      texte = texte.replace(/\s*$/, '') + fin + ajoutees.join(fin) + fin;
      resume.importes += ajoutees.length; continue;
    }
    const id = String(ac.id || '');
    if (!id || vus[id]) { return { ok: false, erreur: 'Identifiant manquant ou répété dans les modifications du sas : ' + id.slice(0, 40) + '.' }; }
    vus[id] = true;
    if (ac.op === 'retirer') {
      const r = retirerLigne(texte, id);
      if (!r.trouve) { return { ok: false, erreur: id + ' : fiche introuvable dans le sas.' }; }
      texte = r.texte; resume.retires++; continue;
    }
    if (ac.op === 'modifier') {
      if (fichier === 'complements') { return { ok: false, erreur: 'Un numéro du sas ne se corrige pas : retirez-le et réimportez-le.' }; }
      const sans = retirerLigne(texte, id);
      if (!sans.trouve) { return { ok: false, erreur: id + ' : fiche introuvable dans le sas.' }; }
      const r = analyserLot(fichier, String(ac.ligne || ''), registres, sans.texte, ctx, aujourdhui);
      if (!r.ok) { return { ok: false, erreur: id + ' : ' + r.erreur }; }
      if (r.lignes.length !== 1 || r.lignes[0].statut !== 'prete') { return { ok: false, erreur: id + ' : la ligne corrigée n\'est pas valide (' + ((r.lignes[0] && r.lignes[0].problemes[0] && r.lignes[0].problemes[0].message) || (r.lignes[0] && r.lignes[0].statut) || 'illisible') + ').' }; }
      // Les marques « Via prospection ; » et « Petite structure ; » (début de la source) ne se perdent ni ne s'ajoutent en corrigeant une carte du sas : la fiche changerait de rubrique en silence.
      const avant = (lireSas(texte, colonnes).lignes.filter(function (l) { return l.id === id; })[0] || {}).valeurs || {}, apres = r.lignes[0].valeurs || {};
      if (colonnes.indexOf('source') !== -1) {
        if (L.mtViaProspection(avant) !== L.mtViaProspection(apres)) { return { ok: false, erreur: id + ' : le début de la source (« Via prospection ; ») ne peut pas être changé ici : la fiche changerait de rubrique.' }; }
        if (L.mtPetiteStructure(avant) !== L.mtPetiteStructure(apres)) { return { ok: false, erreur: id + ' : le début de la source (« Petite structure ; ») ne peut pas être changé ici : la fiche changerait de catégorie.' }; }
      }
      const nouvelle = T.formater(colonnes, Object.assign({}, r.lignes[0].valeurs, { date: '' }));
      const a = lignesDe(texte);
      texte = a.lignes.map(function (l) { return (l.id && l.id === id) ? nouvelle : l.brut; }).join(a.fin);
      resume.modifies++; continue;
    }
    return { ok: false, erreur: 'Action inconnue sur le sas (« ' + String(ac.op).slice(0, 20) + ' »).' };
  }
  return { ok: true, texte: texte.replace(/\s*$/, '') + fin, resume: resume };
}

module.exports = { CHEMINS: CHEMINS, COLONNES: COLONNES, MAX_LIGNES: MAX_LIGNES, nettoyer: nettoyer, corrigerForme: corrigerForme, formatTelephone: formatTelephone, plusProches: plusProches, analyserLot: analyserLot, lister: lister, appliquer: appliquer, traduire: traduire };
