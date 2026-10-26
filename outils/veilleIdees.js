/* ============================================================
   veilleIdees.js  --  « Ma liste » du Lexique : les mots a proposer, et le reperage des mots qui reviennent (chantier du 20 octobre 2026)
   ------------------------------------------------------------
   Utilise par outils/veilleDepot.js. Aucune dependance autre que veilleMots.js (normalisation) et le systeme de fichiers (lecture seule pour le reperage).
   - Le fichier de la liste (outils/sas/mots.sas.txt) est un SAS : l'APPLICATION NE LE LIT JAMAIS. Une ligne par idee de mot, avec son etat :
       trier (a regarder), redaction (retenu, a rediger), plustard (mis de cote), ecarte (ne reviendra pas), publie (est dans le Lexique).
     Un brouillon (titre, famille, registres, mots de recherche, texte, renvois) peut y etre ecrit par Denis dans l'ecran ou, a sa demande, par Claude.
     Aucune date « Verifie le » : ce sont de purs textes.
   - Le reperage (porte A) lit le depot et PROPOSE : jamais d'ecriture, jamais de texte de mot ; chaque idee arrive avec sa raison d'etre.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const motsLexique = require('./veilleMots.js');

const CHEMIN_LISTE = 'outils/sas/mots.sas.txt';
const COLONNES = ['k', 'etat', 'mot', 'porte', 'origine', 'matiere', 'motif', 'cree_le', 'titre', 'titreDeTri', 'univers', 'registres', 'variantes', 'corps', 'relations', 'type', 'gabarit'];
const NB_COLONNES_ANCIEN = 15;   // les lignes ecrites avant l'ajout de type et gabarit restent lisibles
const ETATS = ['trier', 'redaction', 'plustard', 'ecarte', 'publie'];
const PORTES = ['revient', 'umami', 'assistant', 'saisie'];
const MOTIFS = ['pas un mot du Lexique', 'déjà couvert par une autre fiche', 'trop pointu ou éphémère', 'un nom propre'];
const EN_TETE = ['# Ma liste du Lexique : mots PROPOSES (repérage, saisie, assistant en ligne), pas encore dans le Lexique. L\'application NE LIT PAS ce fichier.',
  '# Format : k | etat | mot | porte | origine | matiere | motif | cree_le | titre | titreDeTri | univers | registres | variantes | corps | relations | type | gabarit',
  '# etat : trier, redaction, plustard, ecarte, publie. Un mot sort de « redaction » quand il est publié dans le Lexique (outil de veille, bouton « Publier »). Aucune date de vérification : ce sont de purs textes.', ''].join('\n');
const norm = motsLexique.norm;

function nettoyer(s) { return String(s === undefined || s === null ? '' : s).replace(/\|/g, '/').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function cle(mot) { return 'i' + crypto.createHash('sha1').update(norm(mot)).digest('hex').slice(0, 8); }

// ---------- le fichier ----------
function parser(texte) {
  const lignes = [];
  String(texte || '').split(/\r?\n/).forEach(function (brut) {
    const l = brut.trim();
    if (!l || l.charAt(0) === '#') { return; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length < NB_COLONNES_ANCIEN) { return; }
    const v = {}; COLONNES.forEach(function (nom, i) { v[nom] = c[i] || ''; });
    lignes.push(v);
  });
  return lignes;
}
function ecrire(lignes, fin) {
  return (EN_TETE + lignes.map(function (v) { return COLONNES.map(function (nom) { return nettoyer(v[nom]); }).join(' | '); }).join('\n') + '\n').replace(/\n/g, fin || '\n');
}
// Une ligne du fichier -> l'objet que l'ecran manipule (listes decoupees).
function versObjet(v) {
  return {
    k: v.k, etat: v.etat, mot: v.mot, porte: v.porte, origine: v.origine, matiere: v.matiere, motif: v.motif, creeLe: v.cree_le,
    brouillon: { titre: v.titre, titreDeTri: v.titreDeTri, univers: v.univers, registres: v.registres ? v.registres.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : [],
      variantes: v.variantes ? v.variantes.split(' ; ').map(function (x) { return x.trim(); }).filter(Boolean) : [], corps: v.corps,
      relations: v.relations ? v.relations.split(',').map(function (x) { const p = x.trim().split(':'); return [p[0], p[1] === 'n' ? 'a-ne-pas-confondre' : 'voir-aussi']; }).filter(function (r) { return r[0]; }) : [],
      type: v.type === 'notion' ? 'notion' : 'terme', gabarit: v.type === 'notion' ? (v.gabarit || '') : '' }
  };
}
function depuisBrouillon(b) {
  const x = b || {};
  return { titre: x.titre, titreDeTri: x.titreDeTri, univers: x.univers, registres: (x.registres || []).join(','), variantes: (x.variantes || []).join(' ; '), corps: x.corps,
    relations: (x.relations || []).map(function (r) { return r[0] + ':' + (r[1] === 'a-ne-pas-confondre' ? 'n' : 'v'); }).join(','),
    type: x.type === 'notion' ? 'notion' : '', gabarit: x.type === 'notion' ? x.gabarit : '' };
}

// ---------- ce que le Lexique connait deja ----------
// existants : les mots lus (veilleLexique.lireMots). Rend { exact: { id, titre } | null, proche: { id, titre } | null }.
function chercherDansLexique(mot, existants) {
  const n = norm(mot);
  if (!n) { return { exact: null, proche: null }; }
  const formes = function (m) {
    const f = [m.id.replace(/-/g, ' '), m.titre, m.titreDeTri].concat(m.variantes || []).map(norm);
    const p = /^(.*?)\s*\((.*?)\)\s*$/.exec(m.titre || ''); if (p) { f.push(norm(p[1]), norm(p[2])); }
    return f;
  };
  for (const m of existants) { if (formes(m).indexOf(n) !== -1) { return { exact: { id: m.id, titre: m.titre }, proche: null }; } }
  if (n.length >= 4) {
    for (const m of existants) {
      if (formes(m).some(function (f) { return f.length >= 5 && ((' ' + f + ' ').indexOf(' ' + n + ' ') !== -1 || (' ' + n + ' ').indexOf(' ' + f + ' ') !== -1); })) { return { exact: null, proche: { id: m.id, titre: m.titre } }; }
    }
  }
  return { exact: null, proche: null };
}

// ---------- les actions sur la liste ----------
// actions : { op: 'ajouter', mot, origine?, matiere?, porte?, etat? } | { op: 'etat', k, etat, motif? } | { op: 'brouillon', k, champs } | { op: 'publie', k }.
// ctx : { existants (mots du Lexique), aujourdhui }. Rend { ok, texte, resume } ou { ok:false, erreur }.
function appliquer(texte, actions, ctx) {
  const lignes = parser(texte), fin = String(texte || '').indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  const resume = { ajoutees: [], ignorees: [], changees: 0, brouillons: 0 };
  const par = function (k) { return lignes.filter(function (l) { return l.k === k; })[0]; };
  for (const a of actions || []) {
    if (!a || typeof a !== 'object') { return { ok: false, erreur: 'Action mal formee.' }; }
    if (a.op === 'ajouter') {
      const mot = nettoyer(a.mot);
      if (!mot) { return { ok: false, erreur: 'Le mot est vide.' }; }
      if (mot.length > 120) { return { ok: false, erreur: 'Le mot est trop long (120 caractères au plus) : « ' + mot.slice(0, 30) + '... ».' }; }
      if (/[–—]/.test(mot + (a.origine || '') + (a.matiere || ''))) { return { ok: false, erreur: 'Un tiret long ou demi-long s\'est glissé dans « ' + mot.slice(0, 30) + ' » (interdit).' }; }
      const connu = chercherDansLexique(mot, ctx.existants || []);
      if (connu.exact) { resume.ignorees.push({ mot: mot, raison: 'existe', id: connu.exact.id, titre: connu.exact.titre }); continue; }
      const deja = lignes.filter(function (l) { return norm(l.mot) === norm(mot); })[0];
      if (deja) { resume.ignorees.push({ mot: mot, raison: 'deja-dans-la-liste', etat: deja.etat }); continue; }
      const etat = ETATS.indexOf(a.etat) !== -1 && a.etat !== 'publie' ? a.etat : 'trier';
      const porte = PORTES.indexOf(a.porte) !== -1 ? a.porte : 'saisie';
      lignes.push({ k: cle(mot), etat: etat, mot: mot, porte: porte, origine: nettoyer(a.origine), matiere: nettoyer(a.matiere), motif: etat === 'ecarte' ? nettoyer(a.motif) : '', cree_le: ctx.aujourdhui || '',
        titre: '', titreDeTri: '', univers: '', registres: '', variantes: '', corps: '', relations: '' });
      resume.ajoutees.push({ mot: mot, k: cle(mot), proche: connu.proche });
    } else if (a.op === 'etat') {
      const l = par(a.k);
      if (!l) { return { ok: false, erreur: 'Idée introuvable dans la liste.' }; }
      if (ETATS.indexOf(a.etat) === -1 || a.etat === 'publie') { return { ok: false, erreur: 'État inconnu : ' + a.etat + '.' }; }
      if (a.etat === 'ecarte' && MOTIFS.indexOf(nettoyer(a.motif)) === -1) { return { ok: false, erreur: 'Dites pourquoi vous écartez cette idée (choisissez un motif).' }; }
      if (l.etat === 'publie') { return { ok: false, erreur: '« ' + l.mot + ' » est déjà dans le Lexique : on ne le remet pas en liste.' }; }
      l.etat = a.etat; l.motif = a.etat === 'ecarte' ? nettoyer(a.motif) : ''; resume.changees++;
    } else if (a.op === 'brouillon') {
      const l = par(a.k);
      if (!l) { return { ok: false, erreur: 'Idée introuvable dans la liste.' }; }
      if (l.etat === 'publie') { return { ok: false, erreur: '« ' + l.mot + ' » est déjà dans le Lexique.' }; }
      Object.assign(l, depuisBrouillon(a.champs)); if (l.etat === 'trier' || l.etat === 'plustard') { l.etat = 'redaction'; }
      resume.brouillons++;
    } else if (a.op === 'publie') {
      const l = par(a.k);
      if (!l) { return { ok: false, erreur: 'Idée introuvable dans la liste.' }; }
      l.etat = 'publie'; l.motif = ''; resume.changees++;
    } else { return { ok: false, erreur: 'Action inconnue sur la liste : ' + String(a.op).slice(0, 20) + '.' }; }
  }
  return { ok: true, texte: ecrire(lignes, fin), resume: resume };
}

// ---------- le reperage des mots qui reviennent (porte A) : lecture seule ----------
function parcourir(dossier, sortie) {
  let entrees = [];
  try { entrees = fs.readdirSync(dossier, { withFileTypes: true }); } catch (e) { return sortie; }
  entrees.forEach(function (e) { const p = path.join(dossier, e.name); if (e.isDirectory()) { parcourir(p, sortie); } else if (/\.md$/.test(e.name)) { sortie.push(p); } });
  return sortie;
}
function titreDeFiche(texte, repli) { const m = /^titre:\s*"?(.*?)"?\s*$/m.exec(texte); return m ? m[1] : repli; }

// existants : les mots du Lexique ; dejaVus : [mots deja dans la liste, quel que soit l'etat]. Rend { idees: [...30 au plus], lus: { fichiers }, total }
function repererIdees(racine, existants, dejaVus, options) {
  const max = (options && options.max) || 30;
  const formes = new Set();
  existants.forEach(function (m) {
    [m.id.replace(/-/g, ' '), m.titre, m.titreDeTri].concat(m.variantes || []).forEach(function (t) { formes.add(norm(t)); });
    const p = /^(.*?)\s*\((.*?)\)\s*$/.exec(m.titre || ''); if (p) { formes.add(norm(p[1])); formes.add(norm(p[2])); }
  });
  const longues = Array.from(formes).filter(function (x) { return x.length >= 5; });
  const couvert = function (t) {
    const n = norm(t);
    if (formes.has(n)) { return true; }
    const p = /^(.*?)\s*\((.*?)\)\s*$/.exec(t);
    if (p && (formes.has(norm(p[1])) || formes.has(norm(p[2])))) { return true; }
    for (const f of longues) { if ((n.length >= 5 && (' ' + f + ' ').indexOf(' ' + n + ' ') !== -1) || (' ' + n + ' ').indexOf(' ' + f + ' ') !== -1) { return true; } }
    return false;
  };
  const vus = new Set((dejaVus || []).map(norm));
  const dossierCadre = path.join(racine, 'modules', 'comprendre-le-cadre', 'contenu'), dossierChiffres = path.join(racine, 'modules', 'comprendre-les-chiffres', 'contenu');
  const cadre = parcourir(dossierCadre, []).filter(function (p) { return !/[\\/]balayage[\\/]/.test(p) && !/\.collecte\.md$/.test(p); });
  const autres = parcourir(dossierChiffres, []).concat(parcourir(path.join(dossierCadre, 'balayage'), []));
  const corpus = cadre.concat(autres).map(function (p) {
    let t = ''; try { t = fs.readFileSync(p, 'utf8'); } catch (e) { /* fichier illisible : ignore */ }
    const corps = t.replace(/^---[\s\S]*?\n---/, '');
    return { chemin: p, brut: t, corps: corps, n: norm(corps) };
  });
  const idees = [];
  // 1. les mots EXPLIQUES dans le bloc « lexique: » d'une fiche du cadre mais sans fiche du Lexique
  const termes = {};
  corpus.slice(0, cadre.length).forEach(function (c) {
    const m = /^---\n([\s\S]*?)\n---/.exec(c.brut);
    if (!m) { return; }
    const re = /- terme: "((?:[^"\\\n]|\\.)*)"\n    definition: "((?:[^"\\\n]|\\.)*)"/g; let x;
    while ((x = re.exec(m[1]))) {
      const mot = x[1].replace(/\\"/g, '"');
      if (couvert(mot) || /^niveau [a-c][12]$/i.test(mot) || vus.has(norm(mot))) { continue; }
      const k = norm(mot);
      (termes[k] = termes[k] || { mot: mot, definition: x[2].replace(/\\"/g, '"'), fiches: [] }).fiches.push(titreDeFiche(c.brut, path.basename(c.chemin, '.md')));
    }
  });
  Object.keys(termes).forEach(function (k) {
    const o = termes[k], n = norm(o.mot), sigle = /^[A-Z0-9]{2,6}$/.test(o.mot), re = sigle ? new RegExp('\\b' + o.mot + '\\b') : null;
    const nb = corpus.filter(function (c) { return sigle ? re.test(c.corps) : (' ' + c.n + ' ').indexOf(' ' + n + ' ') !== -1; }).length;
    idees.push({ mot: o.mot, porte: 'revient', signal: 1, nbFichiers: Math.max(nb, o.fiches.length), matiere: o.definition,
      origine: 'expliqué dans la fiche du cadre « ' + o.fiches[0] + ' »' + (nb > 1 ? ', écrit dans ' + nb + ' fichiers' : '') + ', mais sans fiche du Lexique' });
  });
  // 2. les sigles presents dans au moins 3 fichiers, sans fiche
  const comptes = {};
  corpus.forEach(function (c) {
    const dejaCe = new Set();
    (c.corps.match(/\b[A-Z][A-Z0-9]{2,6}\b/g) || []).forEach(function (s) { if (dejaCe.has(s)) { return; } dejaCe.add(s); (comptes[s] = comptes[s] || []).push(c); });
  });
  Object.keys(comptes).forEach(function (s) {
    const l = comptes[s];
    if (l.length < 3 || /^[ABC][12]$/.test(s) || couvert(s) || vus.has(norm(s)) || idees.some(function (i) { return i.mot === s; })) { return; }
    if (existants.some(function (m) { return new RegExp('\\b' + s + '\\b').test(m.titre); })) { return; }
    idees.push({ mot: s, porte: 'revient', signal: 2, nbFichiers: l.length, matiere: '', origine: 'sigle présent dans ' + l.length + ' fichiers (ex. « ' + titreDeFiche(l[0].brut, path.basename(l[0].chemin, '.md')) + ' »), sans fiche du Lexique' });
  });
  // 3. les sigles de structures de « Qui fait quoi »
  let lieux = '';
  try { lieux = fs.readFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), 'utf8'); } catch (e) { /* absent : ignore */ }
  const structures = {};
  lieux.split(/\r?\n/).filter(function (l) { return l && l.charAt(0) !== '#'; }).forEach(function (l) {
    const nom = (l.split('|')[1] || l.split('|')[0] || '').trim();
    (l.match(/\b[A-Z][A-Z0-9]{3,7}\b/g) || []).forEach(function (s) { (structures[s] = structures[s] || []).push(nom); });
  });
  Object.keys(structures).forEach(function (s) {
    const l = structures[s];
    if (l.length < 2 || couvert(s) || vus.has(norm(s)) || idees.some(function (i) { return i.mot === s; })) { return; }
    idees.push({ mot: s, porte: 'revient', signal: 3, nbFichiers: l.length, matiere: '', origine: 'sigle présent dans ' + l.length + ' structures de « Qui fait quoi » (ex. « ' + l[0] + ' »), sans fiche du Lexique' });
  });
  // Les plus fortes preuves d'abord : le nombre de fichiers ou le mot revient ; a egalite, un mot deja explique dans une fiche passe avant un sigle.
  idees.sort(function (a, b) { return b.nbFichiers - a.nbFichiers || a.signal - b.signal || a.mot.localeCompare(b.mot, 'fr'); });
  return { idees: idees.slice(0, max), total: idees.length, lus: { fichiers: corpus.length } };
}

// ---------- Porte B : les recherches sans resultat de la barre du Lexique (export Umami colle dans l'ecran) ----------
// L'application envoie a Umami l'evenement « lexique_recherche_sans_resultat » avec le texte tape. L'outil ne lit JAMAIS Umami : Denis colle ici ce qu'il y a copie
// (la liste des valeurs de la propriete « texte » de cet evenement, ou un fichier CSV). Tout texte qui pourrait identifier une personne est ecarte avant d'etre montre.
const EVENEMENT_SANS_RESULTAT = 'lexique_recherche_sans_resultat';
const SEUIL_RECHERCHES = 2, PLAFOND_RECHERCHES = 30;
const FORME_COURTE = /^[a-zàâäçéèêëîïôöùûüÿœæ'’ -]+$/i;
function decouperCsv(ligne, sep) {
  const c = []; let cur = '', guill = false;
  for (let i = 0; i < ligne.length; i++) {
    const x = ligne[i];
    if (x === '"') { if (guill && ligne[i + 1] === '"') { cur += '"'; i++; } else { guill = !guill; } }
    else if (x === sep && !guill) { c.push(cur); cur = ''; } else { cur += x; }
  }
  c.push(cur); return c.map(function (v) { return v.trim(); });
}
// existants : les mots du Lexique ; dejaVus : les mots deja en liste. Rend { ok, idees: [{ mot, nb, origine }], total, lus, seuil, ecartees: { vieprivee, rare, existe, dejaVu } }.
function lireRecherches(texte, existants, dejaVus, options) {
  const opt = options || {}, seuil = opt.seuil || SEUIL_RECHERCHES;
  const lignes = String(texte || '').split(/\r?\n/).filter(function (l) { return l.trim(); });
  const bruts = []; let colEvt = -1, colTxt = -1, sep = ',';
  if (lignes.length) {
    const premiere = lignes[0], seps = [',', ';', '\t'].filter(function (x) { return premiere.indexOf(x) !== -1; });
    if (seps.length) {
      const entete = decouperCsv(premiere, seps[0]).map(function (x) { return norm(x).replace(/ /g, '_'); });
      const iT = entete.findIndex(function (x) { return ['texte', 'string_value', 'value', 'data_value', 'valeur'].indexOf(x) !== -1; });
      if (iT !== -1) { sep = seps[0]; colTxt = iT; colEvt = entete.findIndex(function (x) { return x === 'event_name' || x === 'event' || x === 'evenement'; }); lignes.shift(); }
    }
  }
  lignes.forEach(function (l) {
    if (colTxt !== -1) {
      const c = decouperCsv(l, sep);
      if (colEvt !== -1 && c[colEvt] !== EVENEMENT_SANS_RESULTAT) { return; }
      bruts.push({ t: c[colTxt] || '', n: 1 }); return;
    }
    const m = /^(.*?)(?:\t|;|,|\s{2,})\s*(\d+)\s*$/.exec(l.trim()) || /^(.*?)\s*\((\d+)\)\s*$/.exec(l.trim());
    bruts.push(m ? { t: m[1], n: parseInt(m[2], 10) } : { t: l, n: 1 });
  });
  const connus = {}; (existants || []).forEach(function (e) { connus[norm(e.titre)] = true; (e.variantes || []).forEach(function (v) { connus[norm(v)] = true; }); });
  const vus = {}; (dejaVus || []).forEach(function (m) { vus[norm(m)] = true; });
  const groupes = {}, ecartees = { vieprivee: 0, rare: 0, existe: 0, dejaVu: 0 };
  bruts.forEach(function (b) {
    const t = String(b.t || '').replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
    if (!t) { return; }
    const mots = t.split(' ');
    if (t.length < 2 || t.length > 40 || mots.length > 4 || /\d|@/.test(t) || !FORME_COURTE.test(t)) { ecartees.vieprivee += b.n; return; }
    const k = norm(t); if (!groupes[k]) { groupes[k] = { mot: t, nb: 0 }; }
    groupes[k].nb += b.n;
  });
  const idees = [];
  Object.keys(groupes).forEach(function (k) {
    const g = groupes[k];
    if (connus[k]) { ecartees.existe++; return; }
    if (vus[k]) { ecartees.dejaVu++; return; }
    if (g.nb < seuil) { ecartees.rare++; return; }
    idees.push({ mot: g.mot, nb: g.nb, origine: 'cherché ' + g.nb + ' fois sans résultat dans la recherche du Lexique (export Umami)', matiere: '' });
  });
  idees.sort(function (a, b) { return b.nb - a.nb || (a.mot < b.mot ? -1 : 1); });
  return { ok: true, idees: idees.slice(0, PLAFOND_RECHERCHES), total: idees.length, lus: bruts.length, seuil: seuil, ecartees: ecartees };
}
module.exports = { lireRecherches: lireRecherches, EVENEMENT_SANS_RESULTAT: EVENEMENT_SANS_RESULTAT, CHEMIN_LISTE: CHEMIN_LISTE, ETATS: ETATS, MOTIFS: MOTIFS, PORTES: PORTES, parser: parser, ecrire: ecrire, versObjet: versObjet, appliquer: appliquer, chercherDansLexique: chercherDansLexique, repererIdees: repererIdees, cle: cle };
