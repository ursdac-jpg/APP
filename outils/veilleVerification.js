/* ============================================================
   veilleVerification.js  --  « Faire vérifier par un assistant » : les prompts de vérification de « Qui fait quoi » (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Deux niveaux, voulus par Denis (29/10/2026) :
   - le prompt INDIVIDUEL (une fiche) : c'est lui qui FAIT FOI. Il rend, champ par champ, « confirmé », « corrigé », « non vérifiable » ou « fermée ou absente »,
     avec la page lue et une courte citation. Seul un « corrigé » bien formé peut être mis dans la carte (jamais enregistré, jamais daté).
   - le prompt de GROUPE (8 fiches au plus) : il sert à TRIER. Il rend « confirmé », « à regarder » ou « introuvable » ; il ne propose AUCUNE valeur à recopier.
   Base commune : le complément de vérification qui marche (docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md) : règle de décision par cas,
   aucun annuaire, aucun commentaire. Un seul constructeur pour les trois registres (employeurs, lieux, offres), jamais un prompt écrit à part par écran.
   L'assistant PROPOSE : la personne ouvre la page lue et décide. Ce fichier ne date jamais une fiche et n'écrit rien.
   Aucune dépendance autre que la logique du module (modules/mon-territoire/logique.js). Node seul.
   ============================================================ */
'use strict';
const L = require('../modules/mon-territoire/logique.js');

const MAX_GROUPE = 8;
const MAX_MAGASINS = 10;
const FICHIERS = ['employeurs', 'lieux', 'offres'];
const FICHIERS_GROUPE = FICHIERS.concat(['fiches']);
const MAX_TEXTE_GROUPE = 1200;
// Le tiret long est interdit partout : le motif est écrit avec ses codes pour ne jamais contenir le caractère lui-même.
const RE_TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const LIBELLE_FICHIER = { employeurs: 'employeur', lieux: 'structure', offres: 'page d\'offres', fiches: 'fiche d\'information' };

function texte(x, max) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, max || 300); }
function sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
// Les dates s'affichent en français (jour/mois/année) : le prompt est lisible à l'écran.
function dateFr(d) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || '')); return m ? m[3] + '/' + m[2] + '/' + m[1] : texte(d, 12); }
function adresseHttps(s) { return /^https:\/\/[^\s|]+$/.test(String(s || '').trim()) ? String(s).trim() : ''; }
function premiereAdresse(s) { const m = String(s || '').match(/https:\/\/[^\s)\]|"'<>]+/); return m ? m[0].replace(/[.,;:]+$/, '') : ''; }

// Les cases d'une fiche à vérifier : { cle, libelle, genre, valeur }. `cle` est le mot que l'assistant doit recopier tel quel en tête de ligne.
function champsDe(fichier, valeurs, etabs) {
  const v = valeurs || {}, c = [];
  if (fichier === 'employeurs') {
    c.push({ cle: 'site', libelle: 'Site officiel', genre: 'url', valeur: texte(v.site) });
    c.push({ cle: 'recrutement', libelle: 'Page de recrutement', genre: 'url', valeur: texte(v.recrutement) });
    c.push({ cle: 'telephone', libelle: (etabs && etabs.length) ? 'Numéro général de l\'enseigne' : 'Téléphone', genre: 'tel', valeur: texte(v.telephone) });
    (etabs || []).slice(0, MAX_MAGASINS).forEach(function (e, i) {
      c.push({ cle: 'magasin-' + (i + 1), libelle: 'Magasin de ' + texte(e.commune, 80), genre: 'magasin', valeur: [texte(e.adresse), texte(e.telephone, 40)].filter(Boolean).join(' ; ') });
    });
  } else if (fichier === 'lieux') {
    c.push({ cle: 'site', libelle: 'Site officiel', genre: 'url', valeur: texte(v.site) });
    c.push({ cle: 'telephone', libelle: 'Téléphone', genre: 'tel', valeur: texte(v.telephone) });
    c.push({ cle: 'mail', libelle: 'Mail (adresse de service)', genre: 'mail', valeur: texte(v.mail) });
  } else if (fichier === 'offres') {
    c.push({ cle: 'page', libelle: 'Page des offres', genre: 'url', valeur: texte(v.page) });
  }
  return c;
}

function ouChercher(fichier, v) {
  if (fichier === 'offres') { return 'la page officielle des offres d\'emploi de CET employeur, sur son propre site. Aucun portail intermédiaire (Indeed, Hellowork, France Travail, LinkedIn, etc.).'; }
  if (fichier === 'lieux') { return 'le site officiel de CETTE structure ; à défaut, la page qui la présente sur le site de sa commune ou de l\'organisme dont elle dépend. Aucun annuaire.'; }
  return (v && v.nature === 'enseigne')
    ? 'le site officiel de l\'enseigne, la page de CE magasin quand elle existe, puis sa page de recrutement.'
    : 'le site officiel de CET employeur, puis sa page de recrutement.';
}

function qui(fichier, nom, v) {
  const lieu = texte((v && v.commune) || '', 80);
  return texte(nom, 160) + (lieu ? ' (commune : ' + lieu + ')' : '') + ', ' + LIBELLE_FICHIER[fichier];
}

const REGLES_INDIVIDUEL = [
  'Lis uniquement ce qui est affiché sur les pages officielles. N\'utilise aucun annuaire, comparateur, PagesJaunes, Indeed, France Travail, etc.',
  'N\'invente jamais une information. Si tu ne peux pas ouvrir la page officielle : « non vérifiable ».',
  'Si cet employeur, cette structure ou cette page n\'existe plus sur le site officiel : « fermée ou absente ».',
  'Si la valeur lue diffère de la valeur actuelle : « corrigé », et tu donnes uniquement la valeur lue sur la page officielle.',
  'Si tout correspond exactement : « confirmé ».',
  'Si un numéro ou une adresse appartient en réalité à un autre établissement ou à un autre réseau, dis-le dans la dernière colonne.',
  'Pour chaque ligne, donne l\'adresse EXACTE et complète de la page où tu as lu l\'information (https://...). Sans cette adresse, écris « non vérifiable ».'
];

// Le prompt d'UNE fiche. d = { fichier, nom, valeurs, etabs } ; rend { ok, prompt, champs } ou { ok: false, erreur }.
function construireIndividuel(d) {
  const fichier = d && d.fichier;
  if (FICHIERS.indexOf(fichier) === -1) { return { ok: false, erreur: 'Registre inconnu.' }; }
  const v = (d && d.valeurs) || {}, champs = champsDe(fichier, v, d.etabs);
  if (!texte(d.nom)) { return { ok: false, erreur: 'La fiche n\'a pas de nom.' }; }
  const lignes = [
    '@Recherche sur le Web', '',
    'Vérifie UNE seule fiche, UNIQUEMENT sur les sites OFFICIELS.', '',
    'Fiche : ' + qui(fichier, d.nom, v),
    'Où chercher : ' + ouChercher(fichier, v)
  ];
  champs.forEach(function (ch) { lignes.push(ch.libelle + ' actuel (réponds avec le mot « ' + ch.cle + ' ») : ' + (ch.valeur || '(aucun, à chercher)')); });
  lignes.push('', 'Règles :');
  REGLES_INDIVIDUEL.forEach(function (r, i) { lignes.push((i + 1) + '. ' + r); });
  lignes.push('', 'Réponds uniquement sous cette forme, une ligne par case, avec ces mots exacts en début de ligne (' + champs.map(function (ch) { return ch.cle; }).join(', ') + ') :', '',
    'mot | statut | valeur lue | adresse exacte de la page lue | courte citation de ce que tu as lu', '',
    'Statuts possibles : confirmé, corrigé, non vérifiable, fermée ou absente.',
    champs.some(function (ch) { return ch.genre === 'magasin'; }) ? 'Pour un magasin, la valeur lue est « adresse ; téléphone ».' : '',
    'Ne fais aucun commentaire. Ne mets rien avant ni après les lignes.');
  return { ok: true, prompt: lignes.filter(function (l, i, t) { return !(l === '' && t[i - 1] === ''); }).join('\n'), champs: champs };
}

// Une ligne de réponse nettoyée : sans ```, sans puce, sans numéro de liste, sans barres de tableau aux bords.
function nettoyerLigne(l) {
  return String(l || '').replace(/```[a-z]*/g, '').replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '').replace(/^\s*\|/, '').replace(/\|\s*$/, '').trim();
}
function decouper(l) { return l.split('|').map(function (x) { return x.trim(); }); }

const STATUTS = { 'obsolete': 'obsolète', 'confirme': 'confirmé', 'corrige': 'corrigé', 'non verifiable': 'non vérifiable', 'fermee ou absente': 'fermée ou absente', 'fermee': 'fermée ou absente', 'absente': 'fermée ou absente' };
function statutDe(s) { const k = sansAccent(s).replace(/[*_`.]/g, '').trim(); return STATUTS[k] || ''; }

function valeurDeGenre(genre, brut) {
  const b = texte(brut);
  if (genre === 'url') { const a = premiereAdresse(b); return a ? { valeur: a } : { probleme: 'une adresse en https est attendue' }; }
  if (genre === 'tel') { const t = L.mtFormaterTelephone(b); return t ? { valeur: t } : { probleme: 'numéro illisible : ' + b.slice(0, 40) }; }
  if (genre === 'mail') { return /^[^\s@|]+@[^\s@|]+\.[a-z]{2,}$/i.test(b) ? { valeur: b.toLowerCase() } : { probleme: 'adresse mail illisible' }; }
  return { valeur: b };
}

// La réponse à un prompt individuel. champs = ceux rendus par construireIndividuel. Rend { ok, lignes, manquantes, inconnues }.
function lireIndividuel(reponse, champs) {
  const attendus = champs || [], lignes = [], inconnues = [], vus = {};
  String(reponse || '').split(/\r?\n/).forEach(function (brut) {
    const l = nettoyerLigne(brut); if (!l || l.indexOf('|') === -1) { if (l) { inconnues.push(l.slice(0, 80)); } return; }
    const c = decouper(l), mot = sansAccent(c[0]).replace(/[*_`]/g, '');
    const ch = attendus.filter(function (x) { return x.cle === mot; })[0];
    if (!ch) { if (!/^mot$/.test(mot)) { inconnues.push(l.slice(0, 80)); } return; }
    if (vus[ch.cle]) { return; }
    vus[ch.cle] = true;
    const statut = statutDe(c[1]), page = premiereAdresse(c[3]);
    const r = { cle: ch.cle, libelle: ch.libelle, genre: ch.genre, actuelle: ch.valeur, statut: statut, valeur: '', page: page, citation: texte(c.slice(4).join(' | '), 240), probleme: '', identique: false, peutMettre: false };
    if (!statut) { r.probleme = 'statut illisible : « ' + texte(c[1], 40) + ' »'; lignes.push(r); return; }
    if (statut === 'confirmé' || statut === 'corrigé') {
      if (!page) { r.probleme = 'la page lue n\'est pas indiquée : ouvrez la source vous-même avant de vous fier à cette ligne'; }
    }
    if (statut === 'corrigé') {
      const g = valeurDeGenre(ch.genre, c[2]);
      if (g.probleme) { r.probleme = g.probleme; }
      else {
        r.valeur = g.valeur;
        if (RE_TIRET_LONG.test(r.valeur)) { r.probleme = 'tiret long interdit dans la valeur'; }
        else if (ch.genre === 'url' && ch.cle === 'page' && L.MT_ADRESSES_INTERDITES_OFFRES && L.MT_ADRESSES_INTERDITES_OFFRES.test(r.valeur)) { r.probleme = 'page d\'un intermédiaire : interdite dans cette rubrique'; }
        else if (sansAccent(r.valeur) === sansAccent(ch.valeur)) { r.identique = true; r.statut = 'confirmé'; }
        else if (ch.genre !== 'magasin' && !r.probleme) { r.peutMettre = true; }
      }
    }
    lignes.push(r);
  });
  const manquantes = attendus.filter(function (x) { return !vus[x.cle]; }).map(function (x) { return x.libelle; });
  return { ok: lignes.length > 0, lignes: lignes, manquantes: manquantes, inconnues: inconnues, erreur: lignes.length ? '' : 'Aucune ligne reconnue. Collez la réponse de l\'assistant telle quelle.' };
}

// ---------- Le prompt de GROUPE (pour trier) ----------
function ligneDeGroupe(f, n) {
  if (f.fichier === 'fiches') {
    return [n, texte(f.nom, 120), 'vérifiée le ' + (dateFr(f.verifieLe) || 'jamais'), 'texte de la fiche : ' + texte(f.corps, MAX_TEXTE_GROUPE)].join(' | ');
  }
  const v = f.valeurs || {}, p = [n, texte(f.nom, 120)];
  if (v.commune) { p.push('commune : ' + texte(v.commune, 60)); }
  champsDe(f.fichier, v, null).forEach(function (ch) { if (ch.valeur) { p.push(ch.libelle.toLowerCase() + ' actuel : ' + ch.valeur); } });
  return p.join(' | ');
}

// fiches = [{ fichier, nom, valeurs }] (8 au plus, les suivantes sont ignorées). Rend { ok, prompt, nb, fiches }.
function construireGroupe(fiches) {
  const liste = (fiches || []).filter(function (f) { return f && FICHIERS_GROUPE.indexOf(f.fichier) !== -1 && texte(f.nom); }).slice(0, MAX_GROUPE);
  if (!liste.length) { return { ok: false, erreur: 'Aucune fiche à vérifier dans la liste affichée.' }; }
  const lignes = [
    '@Recherche sur le Web', '',
    'Je vais te donner une liste de ' + liste.length + ' fiche' + (liste.length > 1 ? 's' : '') + ' (employeurs, structures, pages d\'offres ou fiches d\'information).', '',
    'Tu dois TRIER ces fiches : vérifier UNIQUEMENT sur les sites OFFICIELS, et me dire lesquelles sont à regarder de plus près. Tu ne proposes aucune valeur à recopier.', '',
    'Pour chaque fiche :',
    '1. Ouvre le site officiel (l\'adresse actuelle est donnée ; si elle ne répond plus, cherche le site officiel).',
    '2. Lis uniquement ce qui est affiché sur les pages officielles. Aucun annuaire, comparateur, PagesJaunes, Indeed, France Travail, etc.',
    '3. N\'invente jamais une information.',
    '4. Si tout ce qui est donné correspond à ce que tu lis : « confirmé ».',
    '5. Si une adresse, un numéro ou une page diffère, ou si tu as un doute : « à regarder », et tu dis en quelques mots ce qui diffère.',
    '6. Si tu ne trouves pas de page officielle : « introuvable ».',
    '7. Pour une fiche d\'information : si le dispositif décrit n\'existe plus ou a été remplacé : « obsolète ».', '',
    '--- LISTE ---'
  ];
  liste.forEach(function (f, i) { lignes.push(ligneDeGroupe(f, i + 1)); });
  lignes.push('', 'Réponds uniquement sous cette forme, une ligne par fiche :', '',
    'numéro | nom | statut | ce qui diffère (en quelques mots, vide si confirmé) | adresse exacte de la page officielle lue', '',
    'Statuts possibles : confirmé, à regarder, introuvable, obsolète.',
    'Ne fais aucun commentaire. Traite toutes les fiches de la liste.',
    'Si toutes les fiches ne tiennent pas dans une réponse, arrête-toi à la fin d\'une ligne complète puis écris la ligne « SUITE DISPONIBLE : il reste les numéros [numéros restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au numéro suivant, sans répéter les lignes déjà données. Ne saute jamais un numéro en silence.');
  return { ok: true, prompt: lignes.join('\n'), nb: liste.length, fiches: liste.map(function (f, i) { return { numero: i + 1, id: f.id || '', nom: texte(f.nom, 120), fichier: f.fichier }; }) };
}

const STATUTS_GROUPE = { 'confirme': 'confirmé', 'a regarder': 'à regarder', 'introuvable': 'introuvable', 'obsolete': 'obsolète' };

// La réponse à un prompt de groupe. fiches = celles rendues par construireGroupe. Rend { ok, lignes, manquantes, inconnues }.
function lireGroupe(reponse, fiches) {
  const attendues = fiches || [], lignes = [], inconnues = [], vus = {};
  String(reponse || '').split(/\r?\n/).forEach(function (brut) {
    const l = nettoyerLigne(brut); if (!l) { return; }
    const c = decouper(l), n = parseInt(String(c[0]).replace(/\D/g, ''), 10), f = attendues.filter(function (x) { return x.numero === n; })[0];
    if (!f || c.length < 3 || vus[n]) { if (c.length > 1 && !/^num/i.test(sansAccent(c[0]))) { inconnues.push(l.slice(0, 80)); } return; }
    vus[n] = true;
    const st = STATUTS_GROUPE[sansAccent(c[2]).replace(/[*_`.]/g, '').trim()] || '';
    lignes.push({ numero: n, id: f.id, nom: f.nom, fichier: f.fichier, statut: st, diff: texte(c[3], 200), page: premiereAdresse(c.slice(4).join(' ') || ''), probleme: st ? '' : 'statut illisible : « ' + texte(c[2], 40) + ' »' });
  });
  const manquantes = attendues.filter(function (x) { return !vus[x.numero]; }).map(function (x) { return x.nom; });
  return { ok: lignes.length > 0, lignes: lignes, manquantes: manquantes, inconnues: inconnues, erreur: lignes.length ? '' : 'Aucune ligne reconnue. Collez la réponse de l\'assistant telle quelle.' };
}


// ---------- Le prompt d'UNE fiche d'information (« Comprendre le cadre ») : l'assistant relève les points qui comptent et les compare aux sources officielles ----------
// d = { rayon, id, titre, verifieLe, territoire, corps, change: [..], sources: [..] }. Rend { ok, prompt }. Aucune valeur n'est « mise dans la carte » : le texte d'une fiche se corrige à la main.
function construireFiche(d) {
  if (!d || !texte(d.titre) || !texte(d.corps, 100000)) { return { ok: false, erreur: 'La fiche n\'a pas de titre ou pas de texte.' }; }
  const sources = (d.sources || []).slice(0, 8).map(function (x) { return '- ' + texte(x, 200); });
  const change = (d.change || []).slice(0, 8).map(function (x) { return '- ' + texte(x, 200); });
  const lignes = [
    '@Recherche sur le Web', '',
    'Vérifie UNE seule fiche d\'information, UNIQUEMENT sur les sites OFFICIELS (services de l\'État, organismes publics).', '',
    'Fiche : ' + texte(d.titre, 160) + ' (rayon : ' + texte(d.rayon, 40) + ', territoire : ' + (texte(d.territoire, 40) || 'national') + ')',
    'Dernière vérification : ' + (dateFr(d.verifieLe) || 'jamais'),
    'Où chercher : les sources officielles de la fiche, puis les sites de l\'organisme concerné.'
  ];
  if (sources.length) { lignes.push('Sources actuelles de la fiche :'); sources.forEach(function (x) { lignes.push(x); }); }
  if (change.length) { lignes.push('Ce qui change souvent :'); change.forEach(function (x) { lignes.push(x); }); }
  lignes.push('', '--- TEXTE DE LA FICHE ---', String(d.corps).replace(/\r\n/g, '\n').trim().slice(0, 12000), '--- FIN ---', '', 'Règles :',
    '1. Relève toi-même les points qui comptent (montants, durées, âges, conditions, noms de dispositifs, organismes, délais), six au plus, les plus importants d\'abord.',
    '2. Pour chaque point, ouvre la page officielle et lis uniquement ce qui y est affiché. Aucun annuaire, blog, forum, comparateur.',
    '3. N\'invente jamais. Si tu ne peux pas ouvrir la page officielle : « non vérifiable ».',
    '4. Si le point est exact tel qu\'écrit dans la fiche : « confirmé ». S\'il diffère : « corrigé », avec ce que dit la page officielle.',
    '5. Si le dispositif décrit n\'existe plus ou a été remplacé : « obsolète », et dis par quoi.',
    '6. Pour chaque ligne, donne l\'adresse EXACTE et complète de la page lue (https://...). Sans cette adresse, écris « non vérifiable ».', '',
    'Réponds uniquement sous cette forme, une ligne par point :', '',
    'point | statut | ce que dit la fiche | ce que tu as lu | adresse exacte de la page lue | courte citation', '',
    'Statuts possibles : confirmé, corrigé, non vérifiable, obsolète.', 'Ne fais aucun commentaire. Ne mets rien avant ni après les lignes.');
  return { ok: true, prompt: lignes.join('\n') };
}

// La réponse à un prompt de fiche : une ligne par point. Rend { ok, lignes, manquantes, inconnues }, au même format que lireIndividuel (sans proposition à recopier).
function lireFiche(reponse) {
  const lignes = [], inconnues = [];
  String(reponse || '').split(/\r?\n/).forEach(function (brut) {
    const l = nettoyerLigne(brut); if (!l) { return; }
    const c = decouper(l);
    if (c.length < 3 || /^point$/.test(sansAccent(c[0]).replace(/[*_`]/g, ''))) { if (c.length < 3) { inconnues.push(l.slice(0, 80)); } return; }
    const statut = statutDe(c[1]), page = premiereAdresse(c[4]);
    const r = { cle: 'p' + (lignes.length + 1), libelle: texte(c[0], 200), genre: 'point', statut: statut, actuelle: texte(c[2], 300), valeur: texte(c[3], 300), page: page, citation: texte(c.slice(5).join(' | '), 240), probleme: '', identique: false, peutMettre: false };
    if (!statut) { r.probleme = 'statut illisible : « ' + texte(c[1], 40) + ' »'; }
    else if ((statut === 'confirmé' || statut === 'corrigé' || statut === 'obsolète') && !page) { r.probleme = 'la page lue n\'est pas indiquée : ouvrez la source vous-même avant de vous fier à cette ligne'; }
    if (RE_TIRET_LONG.test(r.valeur + r.citation)) { r.probleme = 'tiret long interdit dans le texte rendu'; }
    lignes.push(r);
  });
  return { ok: lignes.length > 0, lignes: lignes, manquantes: [], inconnues: inconnues, erreur: lignes.length ? '' : 'Aucune ligne reconnue. Collez la réponse de l\'assistant telle quelle.' };
}

// ---------- Le prompt d'UN mot du Lexique : l'assistant relève ce qui peut vieillir (chiffres, noms de dispositifs, pratiques) et le compare aux sources officielles ----------
// d = { id, titre, corps, variantes: [..], verifieLe, details: [..] }. Rend { ok, prompt }. Rien n'est « mis dans la carte » : le texte d'un mot se corrige à la main, après lecture de la source.
function construireMot(d) {
  if (!d || !texte(d.titre) || !texte(d.corps, 100000)) { return { ok: false, erreur: 'Le mot n\'a pas de titre ou pas de texte.' }; }
  const variantes = (d.variantes || []).slice(0, 12).map(function (x) { return texte(x, 80); }).filter(Boolean);
  const lignes = [
    '@Recherche sur le Web', '',
    'Vérifie UN seul mot d\'un lexique destiné à des personnes en recherche d\'emploi en France, UNIQUEMENT sur les sites OFFICIELS (services de l\'État, organismes publics, textes de loi).', '',
    'Mot : ' + texte(d.titre, 160),
    'Dernière vérification : ' + (dateFr(d.verifieLe) || 'jamais')
  ];
  if (variantes.length) { lignes.push('Autres façons de le dire : ' + variantes.join(', ')); }
  lignes.push('', '--- TEXTE DU MOT ---', String(d.corps).replace(/\r\n/g, '\n').trim().slice(0, 12000), '--- FIN ---', '', 'Règles :',
    '1. Relève toi-même ce qui peut avoir changé : définition, nom officiel, sigle, montants, durées, âges, conditions, démarches, pratiques en cours, six points au plus, les plus importants d\'abord.',
    '2. Pour chaque point, ouvre la page officielle et lis uniquement ce qui y est affiché. Aucun annuaire, blog, forum, comparateur.',
    '3. N\'invente jamais. Si tu ne peux pas ouvrir la page officielle : « non vérifiable ».',
    '4. Si le point est exact tel qu\'écrit : « confirmé ». S\'il diffère : « corrigé », avec ce que dit la page officielle.',
    '5. Si le dispositif, le terme ou la pratique décrits n\'existent plus ou ont été remplacés : « obsolète », et dis par quoi.',
    '6. Pour chaque ligne, donne l\'adresse EXACTE et complète de la page lue (https://...). Sans cette adresse, écris « non vérifiable ».',
    '7. Utilise un français simple, sans tiret long.', '',
    'Réponds uniquement sous cette forme, une ligne par point :', '',
    'point | statut | ce que dit le mot | ce que tu as lu | adresse exacte de la page lue | courte citation', '',
    'Statuts possibles : confirmé, corrigé, non vérifiable, obsolète.', 'Ne fais aucun commentaire. Ne mets rien avant ni après les lignes.');
  return { ok: true, prompt: lignes.join('\n') };
}

// ---------- Le prompt d'UNE adresse du registre des liens (« Les adresses des fiches ») : la page répond-elle, est-ce la bonne page officielle ? ----------
// d = { nom, adresse, date, portee, fiches: [..] }. Rend { ok, prompt }. Une adresse corrigée est seulement PROPOSÉE : elle remplit le champ « Modifier », Denis valide ensuite lui-même.
function construireAdresse(d) {
  if (!d || !texte(d.nom) || !adresseHttps(d.adresse)) { return { ok: false, erreur: 'L\'adresse n\'a pas de nom ou n\'est pas une adresse https.' }; }
  const fiches = (d.fiches || []).slice(0, 5).map(function (x) { return texte(x, 80); });
  const lignes = [
    '@Recherche sur le Web', '',
    'Vérifie UNE seule adresse internet, utilisée comme source officielle dans des fiches d\'information destinées à des personnes en recherche d\'emploi en France.', '',
    'Nom court de l\'adresse : ' + texte(d.nom, 80) + ' (portée : ' + (texte(d.portee, 20) || 'national') + ')',
    'Adresse actuelle : ' + adresseHttps(d.adresse),
    'Dernière vérification : ' + (dateFr(d.date) || 'jamais')
  ];
  if (fiches.length) { lignes.push('Utilisée par les fiches : ' + fiches.join(', ')); }
  lignes.push('', 'Règles :',
    '1. Ouvre réellement l\'adresse actuelle. Dis si la page s\'affiche, si c\'est bien une page OFFICIELLE (service de l\'État, organisme public, collectivité) et si son sujet correspond au nom court.',
    '2. Si la page s\'affiche et convient : « confirmé ».',
    '3. Si la page a déménagé ou si une page officielle plus précise ou plus récente existe : « corrigé », avec l\'adresse exacte de la bonne page.',
    '4. Si la page n\'existe plus, ou si l\'organisme ou le service a disparu : « obsolète », et dis par quoi il est remplacé.',
    '5. N\'invente jamais d\'adresse. Si tu ne peux pas ouvrir de page : « non vérifiable ». Aucun annuaire, blog, forum, comparateur.',
    '6. Donne l\'adresse EXACTE et complète de la page lue (https://...). Sans cette adresse, écris « non vérifiable ».', '',
    'Réponds uniquement sous cette forme, une seule ligne :', '',
    'adresse | statut | ' + adresseHttps(d.adresse) + ' | ce que tu as lu | adresse exacte de la page lue | courte citation', '',
    'Statuts possibles : confirmé, corrigé, non vérifiable, obsolète.', 'Ne fais aucun commentaire. Ne mets rien avant ni après la ligne.');
  return { ok: true, prompt: lignes.join('\n') };
}

// La réponse : une ligne. « corrigé » avec une autre adresse https valide : proposée (peutMettre) ; identique à l'actuelle : « confirmé ».
function lireAdresse(reponse, courante) {
  const r = lireFiche(reponse);
  if (!r.ok) { return r; }
  r.lignes.forEach(function (l) {
    l.peutMettre = false;
    if (l.statut !== 'corrigé') { return; }
    const nouvelle = l.page;
    if (!nouvelle) { l.probleme = l.probleme || 'aucune adresse proposée'; return; }
    if (nouvelle === adresseHttps(courante)) { l.statut = 'confirmé'; l.identique = true; return; }
    if (RE_TIRET_LONG.test(nouvelle) || /[\s|]/.test(nouvelle)) { return; }
    l.libelle = 'adresse'; l.valeur = nouvelle; l.actuelle = adresseHttps(courante); l.peutMettre = !l.probleme;
  });
  return r;
}

// ---------- Le prompt d'UN chiffre de « Comprendre les chiffres » : valeur, période, source, comparés à la page officielle ----------
// d = { nom, valeurs: { libellé: valeur }, verifieLe }. Les valeurs sont celles de l'écran. Rien n'est « mis dans la carte » : un chiffre se corrige à la main, après ouverture de la source.
function construireChiffre(d) {
  const v = (d && d.valeurs) || {}, cles = Object.keys(v).filter(function (k) { return texte(v[k], 300); }).slice(0, 12);
  if (!d || !texte(d.nom) || !cles.length) { return { ok: false, erreur: 'Ce chiffre n\'a ni nom ni valeur à vérifier.' }; }
  const lignes = [
    '@Recherche sur le Web', '',
    'Vérifie UN seul chiffre d\'une page « Comprendre les chiffres », UNIQUEMENT sur le site OFFICIEL qui le publie (INSEE, DARES, France Travail, Eurostat, services de l\'État).', '',
    'Chiffre : ' + texte(d.nom, 200),
    'Date de vérification du fichier : ' + (dateFr(d.verifieLe) || 'aucune'),
    'Valeurs écrites aujourd\'hui :'
  ];
  cles.forEach(function (k) { lignes.push('- ' + texte(k, 80) + ' : ' + texte(v[k], 300)); });
  lignes.push('', 'Règles :',
    '1. Ouvre la page officielle qui publie ce chiffre et lis uniquement ce qui y est affiché (valeur, période couverte, date de publication). Aucun annuaire, blog, forum, comparateur, article de presse.',
    '2. Une ligne par valeur écrite ci-dessus : « confirmé » si la page donne exactement cette valeur pour cette période ; « corrigé » si elle diffère, avec la valeur et la période de la page ; « obsolète » si une publication plus récente existe pour ce chiffre.',
    '3. N\'invente jamais. Si tu ne peux pas ouvrir la page officielle : « non vérifiable ».',
    '4. Pour chaque ligne, donne l\'adresse EXACTE et complète de la page lue (https://...). Sans cette adresse, écris « non vérifiable ».', '',
    'Réponds uniquement sous cette forme, une ligne par valeur :', '',
    'point | statut | ce qui est écrit | ce que tu as lu (valeur et période) | adresse exacte de la page lue | courte citation', '',
    'Statuts possibles : confirmé, corrigé, non vérifiable, obsolète.', 'Ne fais aucun commentaire. Ne mets rien avant ni après les lignes.');
  return { ok: true, prompt: lignes.join('\n') };
}

module.exports = { FICHIERS: FICHIERS, MAX_GROUPE: MAX_GROUPE, champsDe: champsDe, construireIndividuel: construireIndividuel, lireIndividuel: lireIndividuel, construireGroupe: construireGroupe, lireGroupe: lireGroupe, construireFiche: construireFiche, lireFiche: lireFiche, construireMot: construireMot, construireChiffre: construireChiffre, construireAdresse: construireAdresse, lireAdresse: lireAdresse };
