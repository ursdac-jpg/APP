/* ============================================================
   veilleChoix.js  --  les CHOIX proposés pour modifier une fiche de « Comprendre le cadre » (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Rien n'est écrit ici : des fonctions pures qui préparent les listes affichées à l'écran « Modifier une fiche » (sources du rayon, mots du Lexique liés à
   la fiche, mots de recherche du rayon, première phrase d'un mot du Lexique). Aucune dépendance. Mesures sur les fiches réelles (2026-10-18) :
   97 % des sources d'une fiche sont dans la liste de son rayon ; 76 % des liens « voir aussi » auraient été proposés.
   ============================================================ */
'use strict';

function normaliser(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }

// Les textes proposes finissent dans l'en-tete d'une fiche, ou le guillemet droit est interdit : "x" devient « x », un guillemet isole disparait.
function guillemetsFr(s) { return String(s || '').replace(/"([^"]*)"/g, '« $1 »').replace(/"/g, ''); }

// Les sources du rayon : le fichier de collecte du rayon liste « nom | titre | adresse | date ». Une source n'est gardée que si son nom est dans le
// registre des adresses (jamais une source inventée). registre : [{ nom, date }]. Rend [{ nom, titre, date }].
function sourcesDuRayon(texteCollecte, registre) {
  const date = {};
  (registre || []).forEach(function (r) { date[r.nom] = r.date || ''; });
  const vus = {}, sortie = [];
  const re = /^\s+- "([a-z0-9-]+) \| ([^|]*) \|/gm;
  let m;
  while ((m = re.exec(String(texteCollecte || '')))) {
    if (date[m[1]] === undefined || vus[m[1]]) { continue; }
    vus[m[1]] = true;
    sortie.push({ nom: m[1], titre: guillemetsFr(m[2].trim()), date: date[m[1]] });
  }
  return sortie;
}

// Première phrase d'un texte (40 à 230 caractères), sinon ses 200 premiers caractères.
function premierePhrase(texte) {
  const s = String(texte || '').replace(/\s+/g, ' ').trim();
  const m = /^(.{40,230}?[.!?])(\s|$)/.exec(s);
  return m ? m[1] : s.slice(0, 200);
}

// Les mots du Lexique pour les listes : [{ id, titre, def }].
function motsDuLexique(entrees) {
  return (entrees || []).map(function (e) { return { id: e.id, titre: guillemetsFr(e.titre), def: guillemetsFr(premierePhrase(e.corps)) }; });
}

// Mots du Lexique à proposer pour « voir aussi ». fiche : { id, titre, pour_qui, corps, voir_aussi: [ids] }. autres : les AUTRES fiches du même rayon
// ({ voir_aussi: [ids] }). entrees : le Lexique lu par veilleLexique.lireEntrees. Trois raisons, dans l'ordre de sûreté :
//   « texte »    : le titre du mot (ou une de ses variantes de DEUX MOTS ou plus : un mot isolé comme « garde » est trop général) apparaît dans la fiche ;
//   « rayon »    : une autre fiche du rayon le cite ;
//   « relation » : il est relié à un mot cité par une autre fiche du rayon (via = titre de ce mot).
// Les mots déjà liés à la fiche ne sont pas proposés. Rend [{ id, titre, def, raison, via }].
function propositionsVoirAussi(fiche, autres, entrees) {
  const parId = {};
  (entrees || []).forEach(function (e) { parId[e.id] = e; });
  const deja = {};
  (fiche.voir_aussi || []).forEach(function (i) { deja[i] = true; });
  const trouves = {}, ordre = [];
  function ajouter(id, raison, via) { if (parId[id] && !deja[id] && !trouves[id]) { trouves[id] = { raison: raison, via: via || '' }; ordre.push(id); } }
  const texte = ' ' + normaliser([fiche.titre, fiche.pour_qui, fiche.corps].join(' ')) + ' ';
  (entrees || []).forEach(function (e) {
    const cles = [normaliser(e.titre)].concat((e.variantes || []).map(normaliser).filter(function (x) { return x.indexOf(' ') !== -1; })).filter(function (x) { return x.length > 3; });
    if (cles.some(function (c) { return texte.indexOf(' ' + c + ' ') !== -1; })) { ajouter(e.id, 'texte'); }
  });
  (autres || []).forEach(function (g) { (g.voir_aussi || []).forEach(function (j) { ajouter(j, 'rayon'); }); });
  (autres || []).forEach(function (g) { (g.voir_aussi || []).forEach(function (j) { ((parId[j] || {}).relations || []).forEach(function (k) { ajouter(k, 'relation', (parId[j] || {}).titre); }); }); });
  const rang = { texte: 0, rayon: 1, relation: 2 };
  return ordre.map(function (id) { return { id: id, titre: guillemetsFr(parId[id].titre), def: guillemetsFr(premierePhrase(parId[id].corps)), raison: trouves[id].raison, via: trouves[id].via }; })
    .sort(function (a, b) { return rang[a.raison] - rang[b.raison]; });
}

// Mots de recherche déjà utilisés par les autres fiches du rayon : [{ t, n }] (n = nombre de fiches), les plus employés d'abord. Seuls 14 % des mots
// d'une fiche sont repris ailleurs dans le rayon : c'est une aide, pas une liste fermée.
function motsDeRechercheDuRayon(autres) {
  const n = {};
  (autres || []).forEach(function (g) { (g.tags || []).forEach(function (t) { n[t] = (n[t] || 0) + 1; }); });
  return Object.keys(n).sort(function (a, b) { return n[b] - n[a] || a.localeCompare(b, 'fr'); }).map(function (t) { return { t: t, n: n[t] }; });
}

module.exports = { sourcesDuRayon: sourcesDuRayon, premierePhrase: premierePhrase, motsDuLexique: motsDuLexique, propositionsVoirAussi: propositionsVoirAussi, motsDeRechercheDuRayon: motsDeRechercheDuRayon, normaliser: normaliser, guillemetsFr: guillemetsFr };
