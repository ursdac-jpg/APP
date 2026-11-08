/* ============================================================
   veilleFichesSas.js  --  le « sas des fiches du cadre » : ce que l'assistant propose pour les fiches de « Comprendre le cadre », valide UN PAR UN avant d'etre publie
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance autre que veilleFiche.js (Node seul).
   Regle (decision de Denis, 2026-10-31, maquette du temps 2 de « Mise a jour ») : ce que l'assistant redige (mise a jour d'une fiche, nouvelle fiche, retrait) arrive ici,
   dans un fichier que l'APPLICATION NE LIT JAMAIS (outils/sas/fiches.sas.txt). Rien n'est public tant que la personne n'a pas clique « C'est bon » puis « Enregistrer » :
   la publication elle-meme passe par le circuit qui existe deja (type « fiche-champs » pour une mise a jour ou un retrait, type « fiche » pour une creation),
   avec ses controles, ses tests et son annulation. Ce module ne publie rien : il range, controle et prepare la demande.
   Format du sas : une proposition par ligne, en JSON (les en-tetes commencent par « # »).
   Genres : « maj » (mise a jour d'une fiche), « nouv » (nouvelle fiche), « ret » (retrait), « brut » (information brute gardee en reserve).
   ============================================================ */
'use strict';
const crypto = require('crypto');
const ficheChamps = require('./veilleFiche.js');
const ressemblance = require('./veilleRessemblance.js');

const CHEMIN_SAS = 'outils/sas/fiches.sas.txt';
const GENRES = ['maj', 'nouv', 'ret', 'brut'];
const TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const RE_ID = /^[a-z0-9][a-z0-9-]{2,100}$/;
const TERRITOIRES = ['national', 'region', '24', '87'];
const EN_TETE = ['# Sas des fiches du cadre : propositions de l\'assistant (mise a jour, nouvelle fiche, retrait), PAS ENCORE verifiees. L\'application NE LIT PAS ce fichier.',
  '# Une proposition par ligne (JSON). Elle sort d\'ici quand elle est validee (outil de veille, « Mise a jour », « A valider », bouton « C\'est bon »).', ''].join('\n');
const LIBELLES = { titre: 'Titre', pour_qui: 'Utile si', tags: 'Mots de recherche', territoire: 'Territoire', lexique: 'Mots expliqués', sources: 'Sources', ce_qui_change_souvent: 'Ce qui change souvent', phrase_generale: 'Phrase générale (affichée après six mois)' };
const CLES_LISTES = ['tags', 'sources', 'ce_qui_change_souvent'];
const CLES_BLOC = ['id', 'rayon', 'titre', 'pour_qui', 'territoire', 'verifie_le', 'tags', 'lexique', 'sources', 'ce_qui_change_souvent', 'revisions', 'texte', 'resume', 'fiche', 'structures', 'voir_aussi_lexique', 'phrase_generale'];

function finDeLigne(t) { return String(t).indexOf('\r\n') !== -1 ? '\r\n' : '\n'; }
function nettoyer(s) { return String(s === undefined || s === null ? '' : s).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function retirerGuillemets(s) { return String(s || '').trim().replace(/^[«"'\s]+|[»"'\s]+$/g, '').trim(); }
function slug(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function empreinte(s) { return crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 6); }
const RE_NOM_SOURCE = /^[a-z0-9][a-z0-9-]{0,80}$/;
// Le détail d'une source telle que la collecte la donne : { nom (court), titre (la ligne complète : texte, article...), url }. Gardé avec la proposition, jamais dans la fiche publiée.
function detailsPropres(liste) {
  const sortie = [];
  (Array.isArray(liste) ? liste : []).slice(0, 40).forEach(function (d) {
    const nom = nettoyer(d && d.nom); if (!RE_NOM_SOURCE.test(nom) || sortie.some(function (x) { return x.nom === nom; })) { return; }
    const url = nettoyer(d && d.url);
    sortie.push({ nom: nom, titre: nettoyer(d && d.titre).slice(0, 400), url: /^https?:\/\/\S+$/.test(url) && url.length <= 600 && url.indexOf('|') === -1 ? url : '' });
  });
  return sortie;
}

// ---------- le fichier du sas ----------
function parserSas(texte) {
  const out = [];
  String(texte || '').split(/\r?\n/).forEach(function (brut) {
    const l = brut.trim();
    if (!l || l.charAt(0) === '#') { return; }
    try { const v = JSON.parse(l); if (v && typeof v === 'object' && GENRES.indexOf(v.genre) !== -1 && v.id) { out.push(v); } } catch (e) { /* ligne illisible : ignoree */ }
  });
  return out;
}
function ecrireSas(recs, fin) {
  return (EN_TETE + recs.map(function (r) { return JSON.stringify(r); }).join('\n') + (recs.length ? '\n' : '')).replace(/\n/g, fin || '\n');
}

// ---------- lire ce que l'assistant a repondu ----------
// Un bloc [FICHE] comme celui du prompt de redaction (cles « id: », « titre: »..., listes a tirets, « texte: » suivi de la prose).
function lireBloc(bloc) {
  const out = { id: '', rayon: '', titre: '', pour_qui: '', territoire: '', verifie_le: '', tags: [], lexique: [], sources: [], ce_qui_change_souvent: [], revisions: [], texte: '', phrase_generale: '', presents: {} };
  const lignes = String(bloc || '').replace(/\r\n/g, '\n').split('\n'), prose = [];
  let cur = null;
  for (const ln of lignes) {
    const mk = /^\s*([a-z_]+)\s*:\s*(.*)$/.exec(ln);
    const cle = mk && (cur !== 'texte' || CLES_BLOC.indexOf(mk[1]) !== -1) ? mk[1] : null;
    if (cle && cle !== 'texte' && cle !== 'resume' && cle !== 'fiche') {
      const val = mk[2].trim();
      if (['id', 'rayon', 'titre', 'pour_qui', 'territoire', 'verifie_le'].indexOf(cle) !== -1) { out[cle] = retirerGuillemets(val); out.presents[cle] = true; cur = cle; continue; }
      if (cle === 'tags') {
        out.presents.tags = true; cur = 'tags';
        const m = /^\[([^\]]*)\]$/.exec(val);
        if (m) { out.tags = m[1].split(',').map(function (x) { return retirerGuillemets(x); }).filter(Boolean); } else if (val) { out.tags = val.split(',').map(function (x) { return retirerGuillemets(x); }).filter(Boolean); }
        continue;
      }
      if (cle === 'phrase_generale') { out.phrase_generale = retirerGuillemets(val); out.presents.phrase_generale = true; cur = 'phrase_generale'; continue; }
      if (CLES_LISTES.indexOf(cle) !== -1 || cle === 'lexique' || cle === 'revisions') { out.presents[cle] = true; cur = cle; continue; }
      cur = null; continue;   // une cle inconnue (collecte:, structures:...) coupe la liste en cours
    }
    if (cle) { cur = 'texte'; out.presents.texte = true; if (mk[2].trim()) { prose.push(mk[2].trim()); } continue; }
    if (cur === 'texte') { prose.push(ln); continue; }
    const item = ln.replace(/^\s*[-*]\s*/, '').trim();
    if (!item) { continue; }
    if (cur === 'phrase_generale') { out.phrase_generale = (out.phrase_generale + ' ' + retirerGuillemets(item)).trim(); }
    else if (cur === 'tags') { out.tags.push(retirerGuillemets(item)); }
    else if (cur === 'sources' || cur === 'ce_qui_change_souvent' || cur === 'revisions') { out[cur].push(retirerGuillemets(item)); }
    else if (cur === 'lexique') {
      const m = /^(?:terme\s*:\s*)?["«]?(.+?)["»]?\s*(?:=|\||:)\s*["«]?(.+?)["»]?$/.exec(item);
      if (m) { out.lexique.push({ terme: retirerGuillemets(m[1]), definition: retirerGuillemets(m[2]) }); }
    }
  }
  out.texte = prose.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');
  return out;
}

// texte : la reponse collee. ctx : { rayon (celui choisi a l'ecran), trouverFiche(id) -> { rayon, texte } | null, aujourdhui }.
// Rend { ok, items: [proposition], notes: [phrases], controle: bool }.
// Le bloc [SOURCES] d'une réponse : une ligne par source, « nom-court | titre complet | https://adresse » (une puce devant est tolérée).
// Il donne l'adresse des sources nouvelles : elles sont alors ajoutées au registre en même temps que la fiche.
function lireBlocSources(texte) {
  const sortie = [], m = /\[SOURCES\]([\s\S]*?)\[\/SOURCES\]/i.exec(String(texte || ''));
  if (!m) { return sortie; }
  m[1].split(/\r?\n/).forEach(function (l) {
    const p = l.replace(/^\s*[-*]\s*/, '').split('|').map(function (x) { return x.trim(); });
    if (p.length >= 3 && RE_NOM_SOURCE.test(p[0])) { sortie.push({ nom: p[0], titre: p[1], url: p[2] }); }
  });
  return sortie;
}
function lireReponse(texte, ctx) {
  const t = String(texte || ''), cx = ctx || {}, items = [], notes = [];
  if (!t.trim()) { return { ok: false, erreur: 'Rien n\'a été collé.' }; }
  const detailsReponse = lireBlocSources(t);
  const controle = /\[CONTROLE[^\]]*\]/i.test(t), avecBlocs = /\[(FICHE|RETRAIT)(?:\s*\d+)?\]/i.test(t);
  let m;
  const reF = /\[FICHE(?:\s*\d+)?\]([\s\S]*?)\[\/FICHE(?:\s*\d+)?\]/gi;
  while ((m = reF.exec(t))) {
    const b = lireBloc(m[1]);
    const titre = b.titre;
    let id = /^[a-z0-9][a-z0-9-]{2,100}$/.test(b.id) ? b.id : '';
    const rayonBloc = b.rayon && (cx.rayons || []).indexOf(b.rayon) !== -1 ? b.rayon : '';
    if (!id) { id = slug((rayonBloc || cx.rayon || '') + '-' + titre).slice(0, 100); }
    const existante = id ? (cx.trouverFiche ? cx.trouverFiche(id) : null) : null;
    const champs = { titre: titre, pour_qui: b.pour_qui, tags: b.tags, territoire: b.territoire, lexique: b.lexique, sources: b.sources, ce_qui_change_souvent: b.ce_qui_change_souvent, texte: b.texte, revisions: b.revisions, phrase_generale: b.phrase_generale };
    let revision = '';
    if (existante) {
      const actuel = ficheChamps.lire(existante.texte), anciennes = actuel.ok ? (ficheChamps.champs(actuel).revisions || []) : [];
      const nouvelles = b.revisions.filter(function (r) { return anciennes.indexOf(r) === -1; });
      if (nouvelles.length) { revision = String(nouvelles[nouvelles.length - 1]).replace(/^\d{4}-\d{2}\s*:\s*/, '').trim(); }
      items.push({ genre: 'maj', rayon: existante.rayon, fiche: id, titre: titre, champs: champs, revision: revision, sourcesDetail: detailsReponse.filter(function (d) { return b.sources.indexOf(d.nom) !== -1; }) });
    } else {
      const rayon = rayonBloc || cx.rayon || '';
      if (!rayon) { notes.push('Une fiche (« ' + (titre || id) + ' ») n\'a pas de rayon : choisissez le rayon avant de coller.'); continue; }
      let revNouv = '';
      if (b.revisions.length) { revNouv = ''; }
      items.push({ genre: 'nouv', rayon: rayon, fiche: id, titre: titre, champs: champs, revision: revNouv, sourcesDetail: detailsReponse.filter(function (d) { return b.sources.indexOf(d.nom) !== -1; }) });
    }
  }
  const reR = /\[RETRAIT(?:\s*\d+)?\]([\s\S]*?)\[\/RETRAIT(?:\s*\d+)?\]/gi;
  while ((m = reR.exec(t))) {
    const get = function (cle) { const k = new RegExp('^\\s*' + cle + '\\s*:\\s*(.*)$', 'im').exec(m[1]); return k ? retirerGuillemets(k[1]) : ''; };
    const id = get('fiche') || get('id'), existante = id && cx.trouverFiche ? cx.trouverFiche(id) : null;
    if (!existante) { notes.push('Un retrait cite une fiche qui n\'existe pas (« ' + (id || 'sans nom') + ' ») : ignoré.'); continue; }
    const ch = ficheChamps.lire(existante.texte), titre = ch.ok ? (ficheChamps.champs(ch).titre || id) : id;
    items.push({ genre: 'ret', rayon: existante.rayon, fiche: id, titre: titre, champs: { raison: get('raison'), remplace_par: get('remplace_par') }, revision: '' });
  }
  if (!items.length && !controle && !avecBlocs) {
    // Ni fiche ni retrait ni rapport de contrôle : une information brute, gardée en réserve (jamais publiée).
    items.push({ genre: 'brut', rayon: cx.rayon || '', fiche: '', titre: nettoyer(t).slice(0, 80), champs: { texte: t.trim().slice(0, 20000) }, revision: '' });
  }
  const nonLu = t.replace(reF, '').replace(reR, '').replace(/\[CONTROLE[^\]]*\][\s\S]*?\[\/CONTROLE\]/gi, '').replace(/\[SOURCES\][\s\S]*?\[\/SOURCES\]/gi, '').trim();
  if (items.length && items[0].genre !== 'brut' && nonLu.length > 80) { notes.push('Un passage du texte n\'a pas pu être rangé dans une fiche : il est ignoré (collez-le à part comme information brute si besoin).'); }
  return { ok: true, items: items, notes: notes, controle: controle };
}

// ---------- evaluer une proposition ----------
function idDe(genre, fiche, titre) { return genre === 'brut' ? 'brut-' + empreinte(titre) : genre + '-' + fiche; }
function chaines(v, sortie) {
  if (typeof v === 'string') { sortie.push(v); } else if (Array.isArray(v)) { v.forEach(function (x) { chaines(x, sortie); }); } else if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { chaines(v[k], sortie); }); }
  return sortie;
}
function formaterValeur(cle, v) {
  if (cle === 'lexique') { return (v || []).map(function (x) { return x.terme + ' = ' + x.definition; }).join('\n'); }
  if (Array.isArray(v)) { return v.join(CLES_LISTES.indexOf(cle) !== -1 && cle !== 'ce_qui_change_souvent' ? ', ' : '\n'); }
  return String(v === undefined || v === null ? '' : v);
}
function paragraphes(corps) { return String(corps || '').replace(/\r\n/g, '\n').split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean); }

// Construit le texte complet d'une NOUVELLE fiche (forme canonique de toutes les fiches du depot).
function construireFicheNouvelle(rec, aujourdhui) {
  const c = rec.champs || {}, id = rec.fiche, rayon = rec.rayon;
  const terr = TERRITOIRES.indexOf(c.territoire) !== -1 ? c.territoire : 'national';
  const blocs = [
    ficheChamps.ecrireBloc('id', id), ficheChamps.ecrireBloc('rayon', rayon), ficheChamps.ecrireBloc('titre', c.titre), ficheChamps.ecrireBloc('pour_qui', c.pour_qui),
    ficheChamps.ecrireBloc('tags', c.tags || []), ficheChamps.ecrireBloc('territoire', terr), 'statut: actif', 'frein: false', 'verifie_le: ' + aujourdhui,
    ficheChamps.ecrireBloc('lexique', c.lexique || []), ficheChamps.ecrireBloc('voir_aussi_lexique', []), ficheChamps.ecrireBloc('sources', c.sources || []),
    ficheChamps.ecrireBloc('ce_qui_change_souvent', c.ce_qui_change_souvent || []), ficheChamps.ecrireBloc('revisions', c.revisions || [])
  ];
  if (String(c.phrase_generale || '').trim()) { blocs.push(ficheChamps.ecrireBloc('phrase_generale', String(c.phrase_generale).trim())); }
  blocs.push('collecte: ' + rayon + '.collecte.md');
  return '---\n' + blocs.join('\n') + '\n---\n\n' + String(c.texte || '').replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
}

// ctx : { aujourdhui, trouverFiche(id) -> { rayon, texte } | null, sourcesConnues: [] | null, lexiqueIds: [] | null }
// Rend { problemes: [phrases], exigeRevision, demande: { fichier a envoyer a « Publier » } | null, champsChanges: [{ cle, libelle, avant, apres }], corps: { avant: [paragraphes], apres: [paragraphes] } | null }.
// Les sources citées par une proposition et pas encore au registre des adresses. Décision de Denis (07/11/2026) : celles dont la collecte (ou l'assistant, bloc [SOURCES])
// a donné l'adresse en https sont AJOUTÉES AUTOMATIQUEMENT au registre en même temps que la fiche : la personne vérifie l'adresse, elle ne la saisit pas.
// Seules bloquent : une source sans aucune adresse, ou dont l'adresse est en http (l'application n'affiche pas ces adresses).
function sourcesAClasser(noms, rec, cx) {
  const sortie = { aAjouter: [], sansAdresse: [], enHttp: [] };
  if (!Array.isArray(cx.sourcesConnues)) { return sortie; }
  const champs = rec.champs || {}, portee = TERRITOIRES.indexOf(champs.territoire) !== -1 ? champs.territoire : 'national';
  (noms || []).forEach(function (nom) {
    if (cx.sourcesConnues.indexOf(nom) !== -1 || sortie.aAjouter.some(function (x) { return x.nom === nom; }) || sortie.sansAdresse.indexOf(nom) !== -1 || sortie.enHttp.indexOf(nom) !== -1) { return; }
    const d = (rec.sources_detail || []).filter(function (x) { return x.nom === nom; })[0];
    if (d && /^https:\/\/\S+$/.test(d.url || '')) { sortie.aAjouter.push({ nom: nom, titre: d.titre || nom, adresse: d.url, portee: portee }); }
    else if (d && d.url) { sortie.enHttp.push(nom); }
    else { sortie.sansAdresse.push(nom); }
  });
  return sortie;
}
function problemesDeSources(cl, pb) {
  if (cl.sansAdresse.length) { pb.push('Source sans adresse : ' + cl.sansAdresse.join(', ') + '. Donnez son adresse avec « Ajouter une source à la main » dans la carte (elle est ajoutée au registre à l\'enregistrement).'); }
  if (cl.enHttp.length) { pb.push('L\'adresse de la source ' + cl.enHttp.join(', ') + ' est en http : l\'application n\'affiche que les adresses https. Cherchez la version https de la page et corrigez-la avec « Ajouter une source à la main ».'); }
}
// La phrase générale : affichée à la place du texte quand la fiche a six mois ou plus. Obligatoire dès que la fiche cite des chiffres, des dates ou des durées (contrôle automatique de l'application).
function problemesDePhrase(phrase, exigee, pb) {
  if (!phrase) { if (exigee) { pb.push('Cette fiche cite des chiffres, des dates ou des durées : il faut sa phrase générale (une phrase sans aucun chiffre, affichée à la place du texte après six mois). Écrivez-la dans le champ « Phrase générale » de la carte.'); } return; }
  if (ficheChamps.aChiffres(phrase)) { pb.push('La phrase générale ne doit contenir aucun chiffre, ni en chiffres ni en lettres devant une unité (« deux ans », « trente jours »).'); }
  if (phrase.length > 500) { pb.push('La phrase générale est trop longue : ' + phrase.length + ' caractères (500 au plus).'); }
  if (/[<>&]/.test(phrase)) { pb.push('La phrase générale ne peut pas contenir « < », « > » ni « & ».'); }
}
function evaluer(rec, ctx) {
  const cx = ctx || {}, pb = [], c = rec.champs || {};
  const sortie = { problemes: pb, exigeRevision: false, demande: null, champsChanges: [], corps: null, sources: [], sourcesAAjouter: [], ressemble: [] };
  if (rec.genre === 'brut') { return sortie; }
  if (!RE_ID.test(String(rec.fiche || ''))) { pb.push('L\'identifiant de la fiche est illisible (lettres minuscules, chiffres et tirets, 3 caractères au moins).'); return sortie; }
  if (TIRET_LONG.test(chaines(c, []).join(' '))) { pb.push('Un tiret long ou demi-long s\'est glissé dans le texte (interdit dans l\'application).'); }
  if (chaines(c, []).some(function (s) { return s.indexOf('"') !== -1; })) { pb.push('Un guillemet droit (") s\'est glissé dans le texte : utilisez les guillemets français « et ».'); }
  const existante = cx.trouverFiche ? cx.trouverFiche(rec.fiche) : null;

  if (rec.genre === 'nouv') {
    sortie.sources = c.sources || [];
    // Une nouvelle fiche qui ressemble à une fiche déjà publiée (n'importe quel rayon) : signalé, jamais bloquant, la personne tranche.
    if (typeof cx.fichesExistantes === 'function') { sortie.ressemble = ressemblance.chercher({ id: rec.fiche, titre: c.titre, tags: c.tags, sources: c.sources, texte: c.texte }, cx.fichesExistantes(), rec.pas_doublon); }
    if (existante) { pb.push('Une fiche porte déjà cet identifiant (« ' + rec.fiche + ' »).'); }
    if (!String(c.titre || '').trim()) { pb.push('Le titre est vide.'); }
    if (!String(c.pour_qui || '').trim()) { pb.push('Le « Utile si » est vide.'); }
    if (!String(c.texte || '').trim()) { pb.push('Le texte de la fiche est vide.'); }
    if (!(c.sources || []).length) { pb.push('Aucune source : une fiche doit citer au moins une adresse du registre.'); }
    const clN = sourcesAClasser(c.sources, rec, cx); sortie.sourcesAAjouter = clN.aAjouter; problemesDeSources(clN, pb);
    if (c.territoire && TERRITOIRES.indexOf(c.territoire) === -1) { pb.push('Territoire inconnu (« ' + c.territoire + ' ») : « national » sera utilisé.'); }
    problemesDePhrase(String(c.phrase_generale || '').trim(), ficheChamps.aChiffres(String(c.texte || '')), pb);
    sortie.phrase = { valeur: String(c.phrase_generale || '').trim(), exigee: ficheChamps.aChiffres(String(c.texte || '')) };
    const texte = construireFicheNouvelle(rec, cx.aujourdhui);
    const relu = ficheChamps.lire(texte);
    if (!relu.ok) { pb.push('La fiche ainsi construite n\'a pas la forme attendue : ' + relu.erreur); }
    ['titre', 'pour_qui', 'tags', 'territoire', 'lexique', 'sources', 'ce_qui_change_souvent'].forEach(function (k) {
      const v = k === 'territoire' ? (TERRITOIRES.indexOf(c.territoire) !== -1 ? c.territoire : 'national') : c[k];
      sortie.champsChanges.push({ cle: k, libelle: LIBELLES[k], avant: '', apres: formaterValeur(k, v) });
    });
    if (String(c.phrase_generale || '').trim()) { sortie.champsChanges.push({ cle: 'phrase_generale', libelle: LIBELLES.phrase_generale, avant: '', apres: String(c.phrase_generale).trim() }); }
    sortie.corps = { avant: [], apres: paragraphes(c.texte) };
    if (!pb.length) { sortie.demande = { type: 'fiche', rayon: rec.rayon, nom: rec.fiche + '.md', texte: texte }; }
    return sortie;
  }

  if (!existante) { pb.push('Cette fiche n\'existe pas (« ' + rec.fiche + ' »).'); return sortie; }
  const fi = ficheChamps.lire(existante.texte);
  if (!fi.ok) { pb.push('La fiche actuelle n\'a pas pu être lue : ' + fi.erreur); return sortie; }
  const actuels = ficheChamps.champs(fi);
  sortie.sources = (c.sources && c.sources.length) ? c.sources : (Array.isArray(actuels.sources) ? actuels.sources : []);

  if (rec.genre === 'ret') {
    if (actuels.statut === 'retire') { pb.push('Cette fiche est déjà retirée.'); }
    if (!String(c.raison || '').trim()) { pb.push('Dites pourquoi la fiche est retirée (raison obligatoire).'); }
    if (c.remplace_par && (!RE_ID.test(c.remplace_par) || !(cx.trouverFiche && cx.trouverFiche(c.remplace_par)))) { pb.push('La fiche de remplacement n\'existe pas (« ' + c.remplace_par + ' »).'); }
    const ch = { statut: 'retire', retire_raison: String(c.raison || '').trim() };
    if (c.remplace_par) { ch.remplace_par = c.remplace_par; }
    sortie.champsChanges.push({ cle: 'retire_raison', libelle: 'Raison du retrait', avant: '', apres: ch.retire_raison });
    if (!pb.length) {
      const r = ficheChamps.appliquerModification(existante.texte, { changements: ch, revision: '', formeSeule: true, datation: 'garder' }, { aujourdhui: cx.aujourdhui, sourcesConnues: null, lexiqueIds: null });
      if (!r.ok) { pb.push(r.erreur); } else { sortie.demande = { type: 'fiche-champs', rayon: existante.rayon, nom: rec.fiche + '.md', changements: ch, revision: '', formeSeule: true, datation: 'garder' }; }
    }
    return sortie;
  }

  // maj : ne garder que ce que l'assistant a renseigne, le dépôt écartera ce qui ne change pas.
  const ch = {};
  ['titre', 'pour_qui', 'territoire'].forEach(function (k) { if (String(c[k] || '').trim()) { ch[k] = String(c[k]).trim(); } });
  if (ch.territoire && TERRITOIRES.indexOf(ch.territoire) === -1) { pb.push('Territoire inconnu (« ' + ch.territoire + ' ») : ignoré.'); delete ch.territoire; }
  ['tags', 'sources', 'ce_qui_change_souvent'].forEach(function (k) { if ((c[k] || []).length) { ch[k] = c[k]; } });
  if ((c.lexique || []).length) { ch.lexique = c.lexique; }
  if (String(c.phrase_generale || '').trim()) { ch.phrase_generale = String(c.phrase_generale).trim(); }
  if (String(c.texte || '').trim()) { ch.corps = String(c.texte).replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, ''); }
  const avantCorps = ficheChamps.corpsDe(fi).replace(/\r\n/g, '\n');
  Object.keys(ch).forEach(function (k) {
    if (k === 'corps') { return; }
    if (JSON.stringify(actuels[k]) === JSON.stringify(ch[k])) { delete ch[k]; return; }
    sortie.champsChanges.push({ cle: k, libelle: LIBELLES[k] || k, avant: formaterValeur(k, actuels[k]), apres: formaterValeur(k, ch[k]) });
  });
  if (ch.corps !== undefined) {
    if (ch.corps.trim() === avantCorps.trim()) { delete ch.corps; } else { sortie.corps = { avant: paragraphes(avantCorps), apres: paragraphes(ch.corps) }; }
  }
  sortie.exigeRevision = ch.titre !== undefined || ch.corps !== undefined || ch.sources !== undefined;
  {
    const corpsFinal = ch.corps !== undefined ? ch.corps : avantCorps, phraseFinale = ch.phrase_generale !== undefined ? ch.phrase_generale : String(actuels.phrase_generale || '').trim();
    sortie.phrase = { valeur: phraseFinale, exigee: ficheChamps.aChiffres(corpsFinal) };
    problemesDePhrase(phraseFinale, sortie.phrase.exigee, pb);
  }
  if (!Object.keys(ch).length) { pb.push('Cette proposition ne change rien à la fiche actuelle.'); return sortie; }
  const clM = sourcesAClasser((ch.sources || []).filter(function (s) { return (actuels.sources || []).indexOf(s) === -1; }), rec, cx);
  sortie.sourcesAAjouter = clM.aAjouter; problemesDeSources(clM, pb);
  // Le contrôle de la fiche connaît déjà ces sources (ajoutées au registre en même temps, ou signalées plus haut) : pas de second message.
  const connuesM = Array.isArray(cx.sourcesConnues) ? cx.sourcesConnues.concat(clM.aAjouter.map(function (x) { return x.nom; }), clM.sansAdresse, clM.enHttp) : cx.sourcesConnues;
  const r = ficheChamps.appliquerModification(existante.texte, { changements: ch, revision: String(rec.revision || '').trim() || 'a preciser', formeSeule: false, datation: 'garder' },
    { aujourdhui: cx.aujourdhui, sourcesConnues: connuesM, lexiqueIds: cx.lexiqueIds });
  if (!r.ok) { pb.push(String(r.erreur)); }
  else { sortie.demande = { type: 'fiche-champs', rayon: existante.rayon, nom: rec.fiche + '.md', changements: ch, revision: String(rec.revision || '').trim(), formeSeule: false, datation: 'garder' }; }
  return sortie;
}

// ---------- actions du sas (appliquees par le depot) ----------
// actions : { op: 'importer', items: [propositions] } | { op: 'retirer', id } | { op: 'pas-doublon', id, fiche, retablir? }
function appliquer(texteSas, actions, ctx) {
  const fin = finDeLigne(texteSas || '\n'), cx = ctx || {};
  let recs = parserSas(texteSas);
  const resume = { importes: 0, remplaces: 0, retires: 0 };
  for (const act of actions) {
    const a = act || {};
    if (a.op === 'importer') {
      const liste = Array.isArray(a.items) ? a.items : [];
      if (!liste.length) { return { ok: false, erreur: 'Rien à ranger dans le sas des fiches.' }; }
      for (const it of liste) {
        if (!it || GENRES.indexOf(it.genre) === -1) { return { ok: false, erreur: 'Une proposition n\'a pas de genre connu.' }; }
        const rec = { id: idDe(it.genre, nettoyer(it.fiche), nettoyer(it.champs && it.champs.texte)), genre: it.genre, rayon: nettoyer(it.rayon), fiche: nettoyer(it.fiche), titre: nettoyer(it.titre), cree_le: cx.aujourdhui || '', origine: nettoyer(it.origine) || 'assistant', revision: nettoyer(it.revision), champs: (it.champs && typeof it.champs === 'object') ? it.champs : {} };
        const det = detailsPropres(it.sourcesDetail); if (det.length) { rec.sources_detail = det; }
        if (JSON.stringify(rec).length > 120000) { return { ok: false, erreur: 'Une proposition est trop longue.' }; }
        const i = recs.findIndex(function (x) { return x.id === rec.id; });
        if (i >= 0 && Array.isArray(recs[i].sources_detail)) {
          // La réponse qui remplace une proposition garde les sources déjà complètes (titre, adresse) tant qu'elle les cite encore : rien à ressaisir.
          const cites = (rec.champs && rec.champs.sources) || [], deja = (rec.sources_detail || []).map(function (d) { return d.nom; });
          const gardees = recs[i].sources_detail.filter(function (d) { return cites.indexOf(d.nom) !== -1 && deja.indexOf(d.nom) === -1; });
          if (gardees.length) { rec.sources_detail = (rec.sources_detail || []).concat(gardees); }
        }
        if (i >= 0) { recs[i] = rec; resume.remplaces++; } else { recs.push(rec); resume.importes++; }
      }
    } else if (a.op === 'sources') {
      // La personne complète les sources d'une proposition à la main : { op: 'sources', id, ajouter: [{ nom, titre, url }], retirer: [nom] }.
      const i = recs.findIndex(function (x) { return x.id === a.id; });
      if (i < 0) { return { ok: false, erreur: 'Proposition introuvable dans le sas des fiches (« ' + String(a.id).slice(0, 60) + ' »).' }; }
      const r = recs[i];
      if (r.genre === 'ret' || r.genre === 'brut') { return { ok: false, erreur: 'Cette proposition n\'a pas de sources à modifier.' }; }
      r.champs = r.champs || {};
      const noms = Array.isArray(r.champs.sources) ? r.champs.sources.slice() : [];
      let detail = Array.isArray(r.sources_detail) ? r.sources_detail.slice() : [];
      const aRetirer = (Array.isArray(a.retirer) ? a.retirer : []).map(String);
      aRetirer.forEach(function (n) { const k = noms.indexOf(n); if (k !== -1) { noms.splice(k, 1); } });
      detail = detail.filter(function (d) { return aRetirer.indexOf(d.nom) === -1; });
      const ajout = Array.isArray(a.ajouter) ? a.ajouter : [];
      for (const s of ajout) {
        const nom = String((s && s.nom) || '').trim();
        if (!RE_NOM_SOURCE.test(nom)) { return { ok: false, erreur: 'Le nom court d\'une source ne peut contenir que des lettres minuscules sans accent, des chiffres et des tirets (« ' + nom.slice(0, 40) + ' »).' }; }
        if (noms.indexOf(nom) === -1) { noms.push(nom); }
        const d = detailsPropres([{ nom: nom, titre: s.titre, url: s.url }])[0] || { nom: nom, titre: '', url: '' };
        detail = detail.filter(function (x) { return x.nom !== nom; }); detail.push(d);
      }
      r.champs.sources = noms; if (detail.length) { r.sources_detail = detail; } else { delete r.sources_detail; }
      resume.remplaces++;
    } else if (a.op === 'phrase') {
      // La personne écrit ou corrige la phrase générale d'une proposition : { op: 'phrase', id, phrase }.
      const i = recs.findIndex(function (x) { return x.id === a.id; });
      if (i < 0) { return { ok: false, erreur: 'Proposition introuvable dans le sas des fiches (« ' + String(a.id).slice(0, 60) + ' »).' }; }
      if (recs[i].genre === 'ret' || recs[i].genre === 'brut') { return { ok: false, erreur: 'Cette proposition n\'a pas de phrase générale.' }; }
      const ph = String(a.phrase || '').replace(/\s+/g, ' ').trim();
      if (TIRET_LONG.test(ph) || ph.indexOf('"') !== -1) { return { ok: false, erreur: 'La phrase ne peut contenir ni tiret long ni guillemet droit (utilisez « et »).' }; }
      recs[i].champs = recs[i].champs || {}; recs[i].champs.phrase_generale = ph;
      resume.remplaces++;
    } else if (a.op === 'pas-doublon') {
      // La personne a comparé : cette proposition n'est PAS un doublon de la fiche publiée `fiche` (ou, avec `retablir`, elle revient sur sa décision). { op, id, fiche, retablir? }.
      const i = recs.findIndex(function (x) { return x.id === a.id; });
      if (i < 0) { return { ok: false, erreur: 'Proposition introuvable dans le sas des fiches (« ' + String(a.id).slice(0, 60) + ' »).' }; }
      const cible = String(a.fiche || '').trim();
      if (!RE_ID.test(cible)) { return { ok: false, erreur: 'Identifiant de fiche non valide.' }; }
      const liste = Array.isArray(recs[i].pas_doublon) ? recs[i].pas_doublon.filter(function (x) { return x !== cible; }) : [];
      if (!a.retablir) { liste.push(cible); }
      if (liste.length) { recs[i].pas_doublon = liste; } else { delete recs[i].pas_doublon; }
      resume.remplaces++;
    } else if (a.op === 'retirer') {
      const n = recs.length; recs = recs.filter(function (x) { return x.id !== a.id; });
      if (recs.length === n) { return { ok: false, erreur: 'Proposition introuvable dans le sas des fiches (« ' + String(a.id).slice(0, 60) + ' »).' }; }
      resume.retires++;
    } else { return { ok: false, erreur: 'Action inconnue sur le sas des fiches.' }; }
  }
  return { ok: true, texte: ecrireSas(recs, fin), resume: resume };
}

function lister(texteSas, ctx) {
  const lignes = parserSas(texteSas).map(function (r) {
    const ev = evaluer(r, ctx);
    return { id: r.id, genre: r.genre, rayon: r.rayon, fiche: r.fiche, titre: r.titre, creeLe: r.cree_le, origine: r.origine, prev: (ctx && ctx.prevDe) ? ctx.prevDe(r) : '', revision: r.revision || '', problemes: ev.problemes, sourcesAAjouter: ev.sourcesAAjouter, phrase: ev.phrase || null, exigeRevision: ev.exigeRevision, demande: ev.demande, ressemble: ev.ressemble || [], champsChanges: ev.champsChanges, corps: ev.corps, sources: ev.sources.map(function (nom) {
      const d = (r.sources_detail || []).filter(function (x) { return x.nom === nom; })[0] || {}, reg = (ctx && ctx.adresseDe) ? ctx.adresseDe(nom) : '';
      // adresse : celle du registre quand la source y est ; adressePropose : celle donnée par la collecte, à ajouter au registre après vérification
      return { nom: nom, adresse: reg || d.url || '', auRegistre: !!reg, titre: d.titre || '', adressePropose: reg ? '' : (d.url || ''), aAjouter: ev.sourcesAAjouter.some(function (x) { return x.nom === nom; }) };
    }), texteBrut: r.genre === 'brut' ? String((r.champs && r.champs.texte) || '') : '' };
  });
  return { ok: true, lignes: lignes, total: lignes.length };
}

// ---------- « Faire verifier par un assistant » ----------
// Le message redonne a l'assistant la proposition et les adresses de ses sources ; s'il corrige, il rend une fiche complete dans un bloc [FICHE], a recoller telle quelle (elle remplace la proposition).
function construirePrompt(rec, ctx, socle) {
  const cx = ctx || {}, c = rec.champs || {};
  const bloc = ['[FICHE]', 'id: ' + rec.fiche, 'titre: ' + (c.titre || ''), 'pour_qui: ' + (c.pour_qui || ''), 'tags: [' + (c.tags || []).join(', ') + ']', 'sources:'].concat((c.sources || []).map(function (s) { return '  - ' + s; }))
    .concat(['lexique:']).concat((c.lexique || []).map(function (x) { return '  - ' + x.terme + ' = ' + x.definition; }))
    .concat(['ce_qui_change_souvent:']).concat((c.ce_qui_change_souvent || []).map(function (s) { return '  - ' + s; }))
    .concat(['phrase_generale: ' + (c.phrase_generale || ''), 'texte:', c.texte || '', '[/FICHE]']).join('\n');
  const adr = (c.sources || []).map(function (s) { const a = cx.adresseDe ? cx.adresseDe(s) : ''; return '- ' + s + (a ? ' : ' + a : ''); }).join('\n') || '(aucune source indiquée)';
  const quoi = rec.genre === 'nouv' ? 'une NOUVELLE fiche' : (rec.genre === 'ret' ? 'le RETRAIT d\'une fiche' : 'une MISE À JOUR de fiche');
  const retrait = rec.genre === 'ret' ? ['', 'Fiche à retirer : ' + rec.fiche + ' (' + rec.titre + ')', 'Raison proposée : ' + (c.raison || '(aucune)'), 'Fiche de remplacement proposée : ' + (c.remplace_par || '(aucune)')].join('\n') : '';
  return [
    String(socle || '').trim(), '',
    'Je tiens des fiches d\'information destinées à des personnes en insertion professionnelle (public peu à l\'aise avec l\'informatique). Je dois contrôler ' + quoi + ' avant de la publier.',
    rec.genre === 'ret' ? retrait : 'Voici la proposition :\n\n' + bloc, '',
    'Adresses des sources citées :', adr, '',
    'Ta mission :',
    '1. Ouvre chaque adresse. Pour chaque affirmation importante de la proposition (durée, montant, condition, démarche), dis si la page la confirme, la contredit ou ne la mentionne pas.',
    '2. N\'écris rien que tu n\'aies lu sur une page que tu as ouverte. Si une page est illisible, dis-le : ne devine pas.',
    '3. Aucun montant ni date figée dans le texte de la fiche (la fiche dit où les trouver) ; phrases courtes, mots du quotidien, aucun tiret long, jamais le mot « IA ». La fiche sert la Dordogne ET la Haute-Vienne : une règle nationale n\'est jamais présentée comme propre à un département. Aucune adresse, aucun téléphone ni courriel dans le texte : pour une structure (Agefiph, Cap emploi, MDPH...), son nom seul, l\'application renvoie d\'un clic vers sa fiche.',
    '4. Réponds d\'abord par une ligne « Verdict : confirmé », « Verdict : à corriger » ou « Verdict : introuvable », puis la liste des points vérifiés (une ligne par point, avec l\'adresse de la page).',
    '5. Si une correction est nécessaire, termine par la fiche COMPLÈTE corrigée, dans un seul bloc [FICHE] ... [/FICHE] au même format que ci-dessus, sans rien d\'autre dans ce bloc.',
    '6. Si la fiche corrigée cite une source qui ne figure pas dans la liste « Adresses des sources citées » ci-dessus, donne-la APRÈS le bloc [FICHE], dans un bloc [SOURCES] ... [/SOURCES], une ligne par source nouvelle : nom-court | titre complet de la page | https://adresse exacte de la page que tu as ouverte. Le nom-court est celui écrit dans le champ « sources » de la fiche (lettres minuscules sans accent, chiffres et tirets). Toute adresse commence par https://.',
    '7. Dans le bloc [FICHE], garde la ligne « phrase_generale: » : une ou deux phrases SANS AUCUN chiffre (ni en chiffres, ni en lettres devant une unité comme « deux ans » ou « trente jours »), 500 caractères au plus, qui résument la règle et disent où trouver les montants et les dates. Elle remplace le texte de la fiche quand celle-ci a six mois ou plus. Elle est obligatoire si le texte de la fiche cite un chiffre, une date ou une durée.'
  ].join('\n');
}

// Empreinte d'une proposition : le repere « pre-verifie » (garde sur le poste, hors Git) ne vaut que pour CETTE version de la proposition.
function empreinteProposition(r) { return empreinte(JSON.stringify([r.genre, r.fiche, r.revision, r.champs])); }

module.exports = {
  empreinteProposition: empreinteProposition, CHEMIN_SAS: CHEMIN_SAS, GENRES: GENRES, EN_TETE: EN_TETE, LIBELLES: LIBELLES, parserSas: parserSas, ecrireSas: ecrireSas, lireBloc: lireBloc, lireReponse: lireReponse,
  evaluer: evaluer, appliquer: appliquer, lister: lister, lireBlocSources: lireBlocSources, construirePrompt: construirePrompt, construireFicheNouvelle: construireFicheNouvelle, idDe: idDe, slug: slug
};
