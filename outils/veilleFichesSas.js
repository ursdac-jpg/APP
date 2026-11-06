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

const CHEMIN_SAS = 'outils/sas/fiches.sas.txt';
const GENRES = ['maj', 'nouv', 'ret', 'brut'];
const TIRET_LONG = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));
const RE_ID = /^[a-z0-9][a-z0-9-]{2,100}$/;
const TERRITOIRES = ['national', 'region', '24', '87'];
const EN_TETE = ['# Sas des fiches du cadre : propositions de l\'assistant (mise a jour, nouvelle fiche, retrait), PAS ENCORE verifiees. L\'application NE LIT PAS ce fichier.',
  '# Une proposition par ligne (JSON). Elle sort d\'ici quand elle est validee (outil de veille, « Mise a jour », « A valider », bouton « C\'est bon »).', ''].join('\n');
const LIBELLES = { titre: 'Titre', pour_qui: 'Utile si', tags: 'Mots de recherche', territoire: 'Territoire', lexique: 'Mots expliqués', sources: 'Sources', ce_qui_change_souvent: 'Ce qui change souvent' };
const CLES_LISTES = ['tags', 'sources', 'ce_qui_change_souvent'];
const CLES_BLOC = ['id', 'rayon', 'titre', 'pour_qui', 'territoire', 'verifie_le', 'tags', 'lexique', 'sources', 'ce_qui_change_souvent', 'revisions', 'texte', 'resume', 'fiche', 'structures', 'voir_aussi_lexique'];

function finDeLigne(t) { return String(t).indexOf('\r\n') !== -1 ? '\r\n' : '\n'; }
function nettoyer(s) { return String(s === undefined || s === null ? '' : s).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function retirerGuillemets(s) { return String(s || '').trim().replace(/^[«"'\s]+|[»"'\s]+$/g, '').trim(); }
function slug(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function empreinte(s) { return crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 6); }

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
  const out = { id: '', rayon: '', titre: '', pour_qui: '', territoire: '', verifie_le: '', tags: [], lexique: [], sources: [], ce_qui_change_souvent: [], revisions: [], texte: '', presents: {} };
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
      if (CLES_LISTES.indexOf(cle) !== -1 || cle === 'lexique' || cle === 'revisions') { out.presents[cle] = true; cur = cle; continue; }
      cur = null; continue;   // une cle inconnue (collecte:, structures:...) coupe la liste en cours
    }
    if (cle) { cur = 'texte'; out.presents.texte = true; if (mk[2].trim()) { prose.push(mk[2].trim()); } continue; }
    if (cur === 'texte') { prose.push(ln); continue; }
    const item = ln.replace(/^\s*[-*]\s*/, '').trim();
    if (!item) { continue; }
    if (cur === 'tags') { out.tags.push(retirerGuillemets(item)); }
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
function lireReponse(texte, ctx) {
  const t = String(texte || ''), cx = ctx || {}, items = [], notes = [];
  if (!t.trim()) { return { ok: false, erreur: 'Rien n\'a été collé.' }; }
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
    const champs = { titre: titre, pour_qui: b.pour_qui, tags: b.tags, territoire: b.territoire, lexique: b.lexique, sources: b.sources, ce_qui_change_souvent: b.ce_qui_change_souvent, texte: b.texte, revisions: b.revisions };
    let revision = '';
    if (existante) {
      const actuel = ficheChamps.lire(existante.texte), anciennes = actuel.ok ? (ficheChamps.champs(actuel).revisions || []) : [];
      const nouvelles = b.revisions.filter(function (r) { return anciennes.indexOf(r) === -1; });
      if (nouvelles.length) { revision = String(nouvelles[nouvelles.length - 1]).replace(/^\d{4}-\d{2}\s*:\s*/, '').trim(); }
      items.push({ genre: 'maj', rayon: existante.rayon, fiche: id, titre: titre, champs: champs, revision: revision });
    } else {
      const rayon = rayonBloc || cx.rayon || '';
      if (!rayon) { notes.push('Une fiche (« ' + (titre || id) + ' ») n\'a pas de rayon : choisissez le rayon avant de coller.'); continue; }
      let revNouv = '';
      if (b.revisions.length) { revNouv = ''; }
      items.push({ genre: 'nouv', rayon: rayon, fiche: id, titre: titre, champs: champs, revision: revNouv });
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
  const nonLu = t.replace(reF, '').replace(reR, '').replace(/\[CONTROLE[^\]]*\][\s\S]*?\[\/CONTROLE\]/gi, '').trim();
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
    ficheChamps.ecrireBloc('ce_qui_change_souvent', c.ce_qui_change_souvent || []), ficheChamps.ecrireBloc('revisions', c.revisions || []), 'collecte: ' + rayon + '.collecte.md'
  ];
  return '---\n' + blocs.join('\n') + '\n---\n\n' + String(c.texte || '').replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
}

// ctx : { aujourdhui, trouverFiche(id) -> { rayon, texte } | null, sourcesConnues: [] | null, lexiqueIds: [] | null }
// Rend { problemes: [phrases], exigeRevision, demande: { fichier a envoyer a « Publier » } | null, champsChanges: [{ cle, libelle, avant, apres }], corps: { avant: [paragraphes], apres: [paragraphes] } | null }.
function evaluer(rec, ctx) {
  const cx = ctx || {}, pb = [], c = rec.champs || {};
  const sortie = { problemes: pb, exigeRevision: false, demande: null, champsChanges: [], corps: null, sources: [] };
  if (rec.genre === 'brut') { return sortie; }
  if (!RE_ID.test(String(rec.fiche || ''))) { pb.push('L\'identifiant de la fiche est illisible (lettres minuscules, chiffres et tirets, 3 caractères au moins).'); return sortie; }
  if (TIRET_LONG.test(chaines(c, []).join(' '))) { pb.push('Un tiret long ou demi-long s\'est glissé dans le texte (interdit dans l\'application).'); }
  if (chaines(c, []).some(function (s) { return s.indexOf('"') !== -1; })) { pb.push('Un guillemet droit (") s\'est glissé dans le texte : utilisez les guillemets français « et ».'); }
  const existante = cx.trouverFiche ? cx.trouverFiche(rec.fiche) : null;

  if (rec.genre === 'nouv') {
    sortie.sources = c.sources || [];
    if (existante) { pb.push('Une fiche porte déjà cet identifiant (« ' + rec.fiche + ' »).'); }
    if (!String(c.titre || '').trim()) { pb.push('Le titre est vide.'); }
    if (!String(c.pour_qui || '').trim()) { pb.push('Le « Utile si » est vide.'); }
    if (!String(c.texte || '').trim()) { pb.push('Le texte de la fiche est vide.'); }
    if (!(c.sources || []).length) { pb.push('Aucune source : une fiche doit citer au moins une adresse du registre.'); }
    if (Array.isArray(cx.sourcesConnues)) {
      const inconnues = (c.sources || []).filter(function (s) { return cx.sourcesConnues.indexOf(s) === -1; });
      if (inconnues.length) { pb.push('Source absente du registre des adresses : ' + inconnues.join(', ') + '. Ajoutez-la d\'abord dans « Les adresses des fiches ».'); }
    }
    if (c.territoire && TERRITOIRES.indexOf(c.territoire) === -1) { pb.push('Territoire inconnu (« ' + c.territoire + ' ») : « national » sera utilisé.'); }
    const texte = construireFicheNouvelle(rec, cx.aujourdhui);
    const relu = ficheChamps.lire(texte);
    if (!relu.ok) { pb.push('La fiche ainsi construite n\'a pas la forme attendue : ' + relu.erreur); }
    ['titre', 'pour_qui', 'tags', 'territoire', 'lexique', 'sources', 'ce_qui_change_souvent'].forEach(function (k) {
      const v = k === 'territoire' ? (TERRITOIRES.indexOf(c.territoire) !== -1 ? c.territoire : 'national') : c[k];
      sortie.champsChanges.push({ cle: k, libelle: LIBELLES[k], avant: '', apres: formaterValeur(k, v) });
    });
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
  if (!Object.keys(ch).length) { pb.push('Cette proposition ne change rien à la fiche actuelle.'); return sortie; }
  const r = ficheChamps.appliquerModification(existante.texte, { changements: ch, revision: String(rec.revision || '').trim() || 'a preciser', formeSeule: false, datation: 'garder' },
    { aujourdhui: cx.aujourdhui, sourcesConnues: cx.sourcesConnues, lexiqueIds: cx.lexiqueIds });
  if (!r.ok) { pb.push(r.erreur); }
  else { sortie.demande = { type: 'fiche-champs', rayon: existante.rayon, nom: rec.fiche + '.md', changements: ch, revision: String(rec.revision || '').trim(), formeSeule: false, datation: 'garder' }; }
  return sortie;
}

// ---------- actions du sas (appliquees par le depot) ----------
// actions : { op: 'importer', items: [propositions] } | { op: 'retirer', id }
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
        if (JSON.stringify(rec).length > 120000) { return { ok: false, erreur: 'Une proposition est trop longue.' }; }
        const i = recs.findIndex(function (x) { return x.id === rec.id; });
        if (i >= 0) { recs[i] = rec; resume.remplaces++; } else { recs.push(rec); resume.importes++; }
      }
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
    return { id: r.id, genre: r.genre, rayon: r.rayon, fiche: r.fiche, titre: r.titre, creeLe: r.cree_le, origine: r.origine, prev: (ctx && ctx.prevDe) ? ctx.prevDe(r) : '', revision: r.revision || '', problemes: ev.problemes, exigeRevision: ev.exigeRevision, demande: ev.demande, champsChanges: ev.champsChanges, corps: ev.corps, sources: ev.sources.map(function (nom) { return { nom: nom, adresse: (ctx && ctx.adresseDe) ? ctx.adresseDe(nom) : '' }; }), texteBrut: r.genre === 'brut' ? String((r.champs && r.champs.texte) || '') : '' };
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
    .concat(['texte:', c.texte || '', '[/FICHE]']).join('\n');
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
    '3. Aucun montant ni date figée dans le texte de la fiche (la fiche dit où les trouver) ; phrases courtes, mots du quotidien, aucun tiret long, jamais le mot « IA ».',
    '4. Réponds d\'abord par une ligne « Verdict : confirmé », « Verdict : à corriger » ou « Verdict : introuvable », puis la liste des points vérifiés (une ligne par point, avec l\'adresse de la page).',
    '5. Si une correction est nécessaire, termine par la fiche COMPLÈTE corrigée, dans un seul bloc [FICHE] ... [/FICHE] au même format que ci-dessus, sans rien d\'autre dans ce bloc.'
  ].join('\n');
}

// Empreinte d'une proposition : le repere « pre-verifie » (garde sur le poste, hors Git) ne vaut que pour CETTE version de la proposition.
function empreinteProposition(r) { return empreinte(JSON.stringify([r.genre, r.fiche, r.revision, r.champs])); }

module.exports = {
  empreinteProposition: empreinteProposition, CHEMIN_SAS: CHEMIN_SAS, GENRES: GENRES, EN_TETE: EN_TETE, LIBELLES: LIBELLES, parserSas: parserSas, ecrireSas: ecrireSas, lireBloc: lireBloc, lireReponse: lireReponse,
  evaluer: evaluer, appliquer: appliquer, lister: lister, construirePrompt: construirePrompt, construireFicheNouvelle: construireFicheNouvelle, idDe: idDe, slug: slug
};
