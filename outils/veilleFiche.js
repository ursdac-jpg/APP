/* ============================================================
   veilleFiche.js  --  lire et réécrire UNE fiche de « Comprendre le cadre » champ par champ (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Principe : le fichier est découpé en blocs d'en-tête (un bloc = une clé et ses lignes) et un corps. Un bloc que la personne n'a pas touché est
   recopié tel quel, octet pour octet ; un bloc modifié est réécrit sous sa forme canonique (celle de toutes les autres fiches). L'identifiant, le rayon
   et le fichier de collecte ne se modifient jamais ici. Aucune dépendance (Node seul). L'application NE lit PAS ce fichier.
   Le test tests/veilleFiche.test.js relit les fiches réelles du dépôt et prouve que la forme canonique redonne chaque bloc à l'identique.
   ============================================================ */
'use strict';

// Clés dont la valeur s'écrit entre guillemets, clés en liste (une ligne « - » par élément, éléments entre guillemets ou non).
const CLES_TEXTE_GUILLEMETS = ['titre', 'pour_qui', 'periode', 'voir_aussi_chiffres', 'retire_raison'];
const CLES_TEXTE_BRUT = ['id', 'rayon', 'territoire', 'statut', 'verifie_le', 'collecte', 'type', 'publie_le', 'retire_le', 'remplace_par', 'frein'];
const CLES_LISTES = { sources: false, structures: false, voir_aussi_lexique: false, ce_qui_change_souvent: true, revisions: true };
// Clés qu'une personne peut modifier depuis l'outil (id, rayon, collecte restent verrouillés).
const CLES_MODIFIABLES = ['titre', 'pour_qui', 'tags', 'territoire', 'statut', 'frein', 'verifie_le', 'lexique', 'voir_aussi_lexique', 'voir_aussi_chiffres', 'sources', 'structures', 'ce_qui_change_souvent', 'revisions', 'retire_le', 'retire_raison', 'remplace_par'];
const CLES_VERROUILLEES = ['id', 'rayon', 'collecte'];

function echapGuillemets(v) { return String(v).replace(/"/g, '\\"'); }
function ouvrirGuillemets(v) { return String(v).replace(/\\"/g, '"'); }

// Découpe le texte en { eol, entete: [{ cle, brut, valeur }], corpsBrut, ok }. `brut` = les lignes du bloc, sans fin de ligne finale.
function lire(texte) {
  let t = String(texte);
  if (t.charCodeAt(0) === 0xFEFF) { return { ok: false, erreur: 'Fichier avec marque d\'ordre des octets : non pris en charge.' }; }
  const crlf = t.indexOf('\r\n') !== -1;
  if (crlf && t.split('\r\n').length !== t.split('\n').length) { return { ok: false, erreur: 'Fins de ligne mélangées : non pris en charge.' }; }
  const eol = crlf ? '\r\n' : '\n';
  if (crlf) { t = t.replace(/\r\n/g, '\n'); }
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(t);
  if (!m) { return { ok: false, erreur: 'En-tête introuvable (la fiche doit commencer par « --- » et le fermer par « --- »).' }; }
  const lignes = m[1].split('\n'), blocs = [];
  for (const l of lignes) {
    const k = /^([a-z_]+):(.*)$/.exec(l);
    if (k) { blocs.push({ cle: k[1], lignes: [l] }); }
    else if (blocs.length && (/^\s/.test(l) || l === '')) { blocs[blocs.length - 1].lignes.push(l); }
    else { return { ok: false, erreur: 'Ligne d\'en-tête inattendue : « ' + l.slice(0, 40) + ' ».' }; }
  }
  const entete = blocs.map(function (b) { return { cle: b.cle, brut: b.lignes.join('\n'), valeur: valeurDuBloc(b.cle, b.lignes) }; });
  return { ok: true, eol: eol, entete: entete, corpsBrut: m[2] };
}

function valeurDuBloc(cle, lignes) {
  const premiere = lignes[0], reste = /^[a-z_]+:\s*(.*)$/.exec(premiere)[1].trim();
  if (cle === 'tags') {
    const m = /^\[([^\]]*)\]$/.exec(reste);
    return m ? m[1].split(',').map(function (x) { return x.trim(); }).filter(Boolean) : null;
  }
  if (cle === 'lexique') {
    if (reste === '[]') { return []; }
    const sortie = [], corps = lignes.slice(1).join('\n');
    const re = /^  - terme: "((?:[^"\\\n]|\\.)*)"\n    definition: "((?:[^"\\\n]|\\.)*)"$/gm;
    let mm;
    while ((mm = re.exec(corps))) { sortie.push({ terme: ouvrirGuillemets(mm[1]), definition: ouvrirGuillemets(mm[2]) }); }
    return sortie;
  }
  if (Object.prototype.hasOwnProperty.call(CLES_LISTES, cle)) {
    if (reste === '[]') { return []; }
    if (reste !== '') { return null; }
    const sortie = [];
    for (const l of lignes.slice(1)) {
      const mm = /^  - (.*)$/.exec(l);
      if (!mm) { return null; }
      const v = mm[1];
      sortie.push(CLES_LISTES[cle] ? (/^"(.*)"$/.test(v) ? ouvrirGuillemets(/^"(.*)"$/.exec(v)[1]) : null) : v);
      if (sortie[sortie.length - 1] === null) { return null; }
    }
    return sortie;
  }
  if (CLES_TEXTE_GUILLEMETS.indexOf(cle) !== -1) {
    const mm = /^"(.*)"$/.exec(reste);
    return mm ? ouvrirGuillemets(mm[1]) : reste;
  }
  return reste;
}

// Forme canonique d'un bloc : { cle, valeur } -> lignes séparées par « \n ». Rend null si la valeur n'a pas la forme attendue.
function ecrireBloc(cle, valeur) {
  if (cle === 'tags') { return 'tags: [' + valeur.join(', ') + ']'; }
  if (cle === 'lexique') {
    if (!valeur.length) { return 'lexique: []'; }
    return 'lexique:\n' + valeur.map(function (x) { return '  - terme: "' + echapGuillemets(x.terme) + '"\n    definition: "' + echapGuillemets(x.definition) + '"'; }).join('\n');
  }
  if (Object.prototype.hasOwnProperty.call(CLES_LISTES, cle)) {
    if (!valeur.length) { return cle + ': []'; }
    return cle + ':\n' + valeur.map(function (x) { return '  - ' + (CLES_LISTES[cle] ? '"' + echapGuillemets(x) + '"' : x); }).join('\n');
  }
  if (CLES_TEXTE_GUILLEMETS.indexOf(cle) !== -1) { return cle + ': "' + echapGuillemets(valeur) + '"'; }
  return cle + ': ' + valeur;
}

// Valeurs modifiables lues dans une fiche : { cle: valeur } (clés présentes seulement) + corps.
// Texte d'un champ modifié : jamais de guillemet droit (aucune fiche réelle n'en porte, et le lecteur de l'application ne sait pas les décoder : il
// afficherait une barre oblique) ni de saut de ligne dans une valeur d'une seule ligne. Rend un message ou null.
function refuserTexte(cle, valeur) {
  const textes = [];
  (function ramasser(v) {
    if (typeof v === 'string') { textes.push(v); }
    else if (Array.isArray(v)) { v.forEach(ramasser); }
    else if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { ramasser(v[k]); }); }
  })(valeur);
  for (const t of textes) {
    if (t.indexOf('"') !== -1) { return 'Le champ « ' + cle + ' » contient un guillemet droit ("). Utilisez les guillemets français « et ».'; }
    if (/[\r\n]/.test(t)) { return 'Le champ « ' + cle + ' » ne peut pas contenir de saut de ligne.'; }
  }
  return null;
}

function champs(fiche) {
  const c = {};
  fiche.entete.forEach(function (b) { c[b.cle] = b.valeur; });
  return c;
}

function corpsDe(fiche) { return fiche.corpsBrut.replace(/^\n+/, '').replace(/\s+$/, ''); }

// Réécrit la fiche. `changements` : { cle: nouvelleValeur, corps: nouveauTexte }. Les blocs non touchés restent tels quels.
// Option `toutCanonique` (essais) : réécrit TOUS les blocs et le corps sous la forme canonique, pour mesurer les écarts.
function ecrire(fiche, changements, options) {
  const ch = changements || {}, opt = options || {};
  const sortie = [];
  for (const b of fiche.entete) {
    const modifie = Object.prototype.hasOwnProperty.call(ch, b.cle);
    if (modifie && CLES_VERROUILLEES.indexOf(b.cle) !== -1) { return { ok: false, erreur: 'Le champ « ' + b.cle + ' » ne se modifie pas ici.' }; }
    if (opt.supprimer && opt.supprimer.indexOf(b.cle) !== -1) { continue; }
    if (modifie) { const refus = refuserTexte(b.cle, ch[b.cle]); if (refus) { return { ok: false, erreur: refus }; } }
    if (modifie || opt.toutCanonique) {
      const v = modifie ? ch[b.cle] : b.valeur;
      if (v === null || v === undefined) { sortie.push(b.brut); continue; }
      sortie.push(ecrireBloc(b.cle, v));
    } else { sortie.push(b.brut); }
  }
  // Champs absents de l'en-tête et ajoutés (par exemple « structures », « retire_le ») : placés avant « collecte » pour garder l'ordre habituel.
  const ajoutes = Object.keys(ch).filter(function (k) { return k !== 'corps' && !fiche.entete.some(function (b) { return b.cle === k; }); }).sort(function (a, b) { return CLES_MODIFIABLES.indexOf(a) - CLES_MODIFIABLES.indexOf(b); });
  for (const k of ajoutes) {
    if (CLES_MODIFIABLES.indexOf(k) === -1) { return { ok: false, erreur: 'Champ inconnu : « ' + k + ' ».' }; }
    const refusA = refuserTexte(k, ch[k]); if (refusA) { return { ok: false, erreur: refusA }; }
    const i = sortie.findIndex(function (l) { return /^collecte:/.test(l); });
    sortie.splice(i === -1 ? sortie.length : i, 0, ecrireBloc(k, ch[k]));
  }
  let corps;
  if (Object.prototype.hasOwnProperty.call(ch, 'corps') || opt.toutCanonique) {
    corps = '\n' + (Object.prototype.hasOwnProperty.call(ch, 'corps') ? String(ch.corps) : corpsDe(fiche)).replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n';
  } else { corps = fiche.corpsBrut; }
  let texte = '---\n' + sortie.join('\n') + '\n---\n' + corps;
  if (fiche.eol === '\r\n') { texte = texte.replace(/\n/g, '\r\n'); }
  return { ok: true, texte: texte };
}

// ---------- Une demande de modification complète (appelée par le dépôt de l'outil de veille) ----------
const TIRETS = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');
const TERRITOIRES = ['national', 'region', '24', '87'];
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Longueur maximale de la phrase du bouton « Pour aller plus loin » vers Comprendre les chiffres (la plus longue phrase actuelle fait 85 caractères).
const LONGUEUR_MAX_PHRASE_CHIFFRES = 100;
// Champs que la demande ne fixe jamais directement : la date passe par « redater », les révisions par la phrase « ce que j'ai changé ».
const CHAMPS_GERES_A_PART = ['verifie_le', 'revisions', 'retire_le'];

function toutesLesChaines(v, sortie) {
  if (typeof v === 'string') { sortie.push(v); }
  else if (Array.isArray(v)) { v.forEach(function (x) { toutesLesChaines(x, sortie); }); }
  else if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { toutesLesChaines(v[k], sortie); }); }
  return sortie;
}

// texte : la fiche actuelle. demande : { changements: {champ: valeur, corps}, revision, formeSeule, datation: 'garder'|'redater' }.
// contexte : { aujourdhui: 'AAAA-MM-JJ', sourcesConnues: [noms du registre des adresses], lexiqueIds: [identifiants du Lexique] | null }.
// Rend { ok, texte, resume: { champs, action, phrase } } ou { ok: false, erreur }. N'écrit rien nulle part.
function appliquerModification(texte, demande, contexte) {
  const d = demande || {}, cx = contexte || {};
  const fi = lire(texte);
  if (!fi.ok) { return { ok: false, erreur: fi.erreur }; }
  const actuels = champs(fi);
  const brut = d.changements && typeof d.changements === 'object' && !Array.isArray(d.changements) ? d.changements : null;
  if (!brut) { return { ok: false, erreur: 'Aucune modification de la fiche à enregistrer.' }; }
  const revision = String(d.revision || '').trim(), datation = d.datation === 'redater' ? 'redater' : 'garder';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(cx.aujourdhui || ''))) { return { ok: false, erreur: 'Date du jour illisible.' }; }

  // 1. Ne garder que ce qui change réellement.
  const ch = {};
  let retirerChiffres = false;
  for (const k of Object.keys(brut)) {
    if (CLES_VERROUILLEES.indexOf(k) !== -1) { return { ok: false, erreur: 'Le champ « ' + k + ' » ne se modifie pas ici.' }; }
    if (CHAMPS_GERES_A_PART.indexOf(k) !== -1) { return { ok: false, erreur: 'Le champ « ' + k + ' » se règle avec les cases de date et « ce que j\'ai changé », jamais directement.' }; }
    if (k === 'corps') { if (String(brut.corps).replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '') !== corpsDe(fi).replace(/\r\n/g, '\n')) { ch.corps = brut.corps; } continue; }
    if (CLES_MODIFIABLES.indexOf(k) === -1) { return { ok: false, erreur: 'Champ inconnu : « ' + k + ' ».' }; }
    if (k === 'voir_aussi_chiffres') {
      // Phrase du bouton vers « Comprendre les chiffres » : vide = pas de bouton (le champ est retiré de la fiche).
      if (typeof brut[k] !== 'string') { return { ok: false, erreur: 'La phrase du bouton vers Comprendre les chiffres est un texte.' }; }
      const phrase = brut[k].trim();
      if (!phrase) { if (actuels[k] !== undefined && actuels[k] !== '') { retirerChiffres = true; } continue; }
      if (actuels[k] === undefined || actuels[k] !== phrase) { ch[k] = phrase; }
      continue;
    }
    if (actuels[k] === undefined || JSON.stringify(actuels[k]) !== JSON.stringify(brut[k])) { ch[k] = brut[k]; }
  }
  if (toutesLesChaines(ch, []).concat([revision]).some(function (t) { return TIRETS.test(t); })) {
    return { ok: false, erreur: 'Un tiret long ou demi-long s\'est glissé dans un texte (interdit dans l\'application) : utilisez une virgule, deux-points ou un trait d\'union.' };
  }

  // 2. Contrôles champ par champ.
  if (ch.titre !== undefined && !String(ch.titre).trim()) { return { ok: false, erreur: 'Le titre ne peut pas être vide.' }; }
  if (ch.pour_qui !== undefined && !String(ch.pour_qui).trim()) { return { ok: false, erreur: 'Le « Utile si... » ne peut pas être vide.' }; }
  if (ch.corps !== undefined && !String(ch.corps).trim()) { return { ok: false, erreur: 'Le texte de la fiche ne peut pas être vide.' }; }
  if (ch.territoire !== undefined && TERRITOIRES.indexOf(ch.territoire) === -1) { return { ok: false, erreur: 'Territoire inconnu : « ' + ch.territoire + ' ».' }; }
  if (ch.voir_aussi_chiffres !== undefined) {
    const p = String(ch.voir_aussi_chiffres);
    if (p.length > LONGUEUR_MAX_PHRASE_CHIFFRES) { return { ok: false, erreur: 'La phrase du bouton vers Comprendre les chiffres est trop longue : ' + p.length + ' caractères (' + LONGUEUR_MAX_PHRASE_CHIFFRES + ' au plus).' }; }
    // L'application écrit cette phrase TELLE QUELLE dans la page (modules/comprendre-le-cadre/index.js) : ces signes la casseraient.
    if (/[<>&]/.test(p)) { return { ok: false, erreur: 'La phrase du bouton ne peut pas contenir « < », « > » ni « & » : l\'application l\'écrit telle quelle dans la page.' }; }
  }
  if (ch.frein !== undefined && ch.frein !== 'true' && ch.frein !== 'false') { return { ok: false, erreur: 'Le champ « frein » vaut true ou false.' }; }
  if (ch.statut !== undefined && ch.statut !== 'actif' && ch.statut !== 'retire') { return { ok: false, erreur: 'État de la fiche inconnu : « ' + ch.statut + ' ».' }; }
  if (ch.tags !== undefined && (!Array.isArray(ch.tags) || ch.tags.some(function (t) { return !String(t).trim() || String(t).indexOf(',') !== -1; }))) { return { ok: false, erreur: 'Les mots de recherche sont des mots non vides, sans virgule à l\'intérieur.' }; }
  if (ch.lexique !== undefined && (!Array.isArray(ch.lexique) || ch.lexique.some(function (x) { return !x || !String(x.terme || '').trim() || !String(x.definition || '').trim(); }))) { return { ok: false, erreur: 'Un mot du Lexique a son mot ou sa définition vide.' }; }
  if (ch.ce_qui_change_souvent !== undefined && (!Array.isArray(ch.ce_qui_change_souvent) || ch.ce_qui_change_souvent.some(function (t) { return !String(t).trim(); }))) { return { ok: false, erreur: 'Une ligne de « Ce qui change souvent » est vide.' }; }
  for (const cle of ['sources', 'structures', 'voir_aussi_lexique']) {
    if (ch[cle] !== undefined && (!Array.isArray(ch[cle]) || ch[cle].some(function (t) { return !/^[a-z0-9][a-z0-9-]*$/.test(String(t)); }))) { return { ok: false, erreur: 'Le champ « ' + cle + ' » est une liste d\'identifiants (lettres minuscules, chiffres, traits d\'union).' }; }
  }
  if (ch.sources !== undefined && Array.isArray(cx.sourcesConnues)) {
    const inconnues = ch.sources.filter(function (s) { return (actuels.sources || []).indexOf(s) === -1 && cx.sourcesConnues.indexOf(s) === -1; });
    if (inconnues.length) { return { ok: false, erreur: 'Source absente du registre des adresses : ' + inconnues.join(', ') + '. Ajoutez-la d\'abord dans « Les adresses des fiches ».' }; }
  }
  if (ch.voir_aussi_lexique !== undefined && Array.isArray(cx.lexiqueIds)) {
    const inconnus = ch.voir_aussi_lexique.filter(function (s) { return (actuels.voir_aussi_lexique || []).indexOf(s) === -1 && cx.lexiqueIds.indexOf(s) === -1; });
    if (inconnus.length) { return { ok: false, erreur: 'Fiche du Lexique introuvable : ' + inconnus.join(', ') + '.' }; }
  }

  // 3. Retrait et réactivation (le texte de la fiche est gardé dans les deux cas).
  const supprimer = retirerChiffres ? ['voir_aussi_chiffres'] : [];
  const etaitRetiree = actuels.statut === 'retire';
  let action = 'modifiée';
  if (ch.statut === 'retire' && !etaitRetiree) {
    const raison = String(ch.retire_raison !== undefined ? ch.retire_raison : '').trim();
    if (!raison) { return { ok: false, erreur: 'Pour retirer une fiche, dites pourquoi (champ « retire_raison »).' }; }
    if (ch.remplace_par !== undefined && ch.remplace_par !== '' && !/^[a-z0-9][a-z0-9-]*$/.test(ch.remplace_par)) { return { ok: false, erreur: 'La fiche de remplacement est un identifiant de fiche.' }; }
    if (ch.remplace_par === '') { delete ch.remplace_par; }
    ch.retire_le = cx.aujourdhui;
    action = 'retirée';
  } else if (ch.statut === 'actif' && etaitRetiree) {
    ['retire_le', 'retire_raison', 'remplace_par'].forEach(function (k) { if (actuels[k] !== undefined) { supprimer.push(k); } });
    action = 'réactivée';
  } else if (!etaitRetiree && (ch.retire_raison !== undefined || ch.remplace_par !== undefined)) {
    return { ok: false, erreur: 'La raison du retrait et la fiche de remplacement n\'ont de sens que pour une fiche retirée.' };
  }

  // 4. Phrase « ce que j'ai changé », date, ligne de révision.
  const contenuChange = ch.titre !== undefined || ch.corps !== undefined || ch.sources !== undefined;
  if (contenuChange && !revision && !d.formeSeule) { return { ok: false, erreur: 'Dites en une phrase ce que vous avez changé (ou cochez « simple correction de forme »).' }; }
  if (revision && !d.formeSeule) {
    const anciennes = actuels.revisions === undefined ? [] : actuels.revisions;
    if (!Array.isArray(anciennes)) { return { ok: false, erreur: 'Les révisions de cette fiche n\'ont pas la forme habituelle : modification refusée par prudence.' }; }
    ch.revisions = anciennes.concat([cx.aujourdhui.slice(0, 7) + ' : ' + revision]);
  }
  if (datation === 'redater') {
    if (!RE_DATE.test(cx.aujourdhui)) { return { ok: false, erreur: 'Date du jour illisible.' }; }
    if (actuels.verifie_le !== cx.aujourdhui) { ch.verifie_le = cx.aujourdhui; }
  }
  if (!Object.keys(ch).length && !supprimer.length) { return { ok: false, erreur: 'Ces modifications ne changent rien à la fiche.' }; }

  const r = ecrire(fi, ch, { supprimer: supprimer });
  if (!r.ok) { return r; }
  if (r.texte === String(texte)) { return { ok: false, erreur: 'Ces modifications ne changent rien à la fiche.' }; }
  const touches = Object.keys(ch).filter(function (k) { return k !== 'revisions' && k !== 'retire_le' && k !== 'verifie_le'; });
  if (action === 'modifiée' && !touches.length && ch.verifie_le !== undefined) { action = 'redatée'; }
  return { ok: true, texte: r.texte, resume: { champs: Object.keys(ch).concat(supprimer), action: action, phrase: d.formeSeule ? 'simple correction de forme' : revision } };
}

module.exports = { lire: lire, ecrire: ecrire, ecrireBloc: ecrireBloc, champs: champs, corpsDe: corpsDe, appliquerModification: appliquerModification, CLES_MODIFIABLES: CLES_MODIFIABLES, CLES_VERROUILLEES: CLES_VERROUILLEES, TERRITOIRES: TERRITOIRES, LONGUEUR_MAX_PHRASE_CHIFFRES: LONGUEUR_MAX_PHRASE_CHIFFRES };
