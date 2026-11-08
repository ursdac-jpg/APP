/* ============================================================
   veilleRessemblance.js  --  « cette fiche existe-t-elle déjà ? » (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Décision de Denis (2026-11-08) : l'assistant qui rédige les fiches ne voyait que les fiches de SON rayon ; une fiche sur l'ASS (rayon « budget »)
   a donc été refaite alors qu'elle existait, depuis un matériau choisi dans le rayon « handicap ». Ce module compare une fiche proposée
   à TOUTES les fiches publiées, tous rayons confondus, et dit lesquelles lui ressemblent.
   Deux niveaux (décision de Denis, 2026-11-08) : « repete » = le TEXTE se recoupe (suites de mots identiques : un vrai doublon en partage près de 17 %,
   des fiches voisines moins de 3 %) ; « theme » = seulement le même thème (mots-clés rares, sources, mots du titre en commun) : simple note, pas d'alerte.
   Il ne décide rien : il signale, la personne tranche (mise à jour, fiche distincte, « ce n'est pas un doublon »).
   Fichier chargé par veille.html (navigateur) ET par le serveur et les tests (Node). Aucune dépendance, aucune écriture, aucun accès réseau.
   Une fiche existante : { id, rayon, titre, tags: [..], sources: [..], statut, texte (facultatif : le corps de la fiche) }.
   ============================================================ */
(function (racine) {
  'use strict';

  const SEUIL_THEME = 2.0, SEUIL_TEXTE = 0.08, TAILLE_SUITE = 4, MAX = 3;
  const VIDES = ['pour', 'avec', 'dans', 'mon', 'mes', 'une', 'les', 'des', 'que', 'qui', 'comment', 'quand', 'sur', 'ses', 'son', 'aux', 'par', 'est', 'cest', 'quoi', 'peut', 'puis', 'plus', 'tout', 'fait', 'quel', 'quelle', 'quels', 'faut', 'sont', 'vous', 'nous', 'elle', 'etre', 'avoir', 'depuis', 'cette', 'mon', 'ma', 'ton', 'ta'];

  function norm(s) { return String(s === undefined || s === null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function mots(s) { return norm(s).split(' ').filter(function (w) { return w.length > 2 && VIDES.indexOf(w) === -1; }); }
  function liste(v) { return Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',') : []); }
  function propres(existantes) {
    return (Array.isArray(existantes) ? existantes : []).filter(function (e) { return e && e.id && e.statut !== 'retire'; }).map(function (e) {
      return { id: String(e.id), rayon: String(e.rayon || ''), titre: String(e.titre || ''), texte: String(e.texte || ''), tags: liste(e.tags).map(function (t) { return String(t).replace(/^["'\s]+|["'\s]+$/g, ''); }).filter(Boolean), sources: liste(e.sources).map(function (t) { return String(t).trim(); }).filter(Boolean) };
    });
  }
  // Un mot-clé partagé par beaucoup de fiches (« France Travail », « CAF ») dit peu ; un mot-clé rare (« ASS », « RAPO ») dit beaucoup.
  function frequences(ex) {
    const t = {}, s = {};
    ex.forEach(function (e) {
      new Set(e.tags.map(norm)).forEach(function (k) { t[k] = (t[k] || 0) + 1; });
      new Set(e.sources).forEach(function (k) { s[k] = (s[k] || 0) + 1; });
    });
    return { tags: t, sources: s };
  }

  // Les suites de TAILLE_SUITE mots d'un texte (sans accents ni ponctuation) : un même passage recopié ou à peine reformulé donne les mêmes suites.
  function suites(texte) {
    const m = norm(texte).split(' ').filter(Boolean), s = new Set();
    for (let i = 0; i + TAILLE_SUITE <= m.length; i++) { s.add(m.slice(i, i + TAILLE_SUITE).join(' ')); }
    return s;
  }
  // Part des suites de A qui se retrouvent dans B, et les phrases de A qui en contiennent (les passages répétés, à montrer à la personne).
  function recoupement(texteA, texteB) {
    const a = suites(texteA), b = suites(texteB);
    if (!a.size || !b.size) { return { part: 0, passages: [] }; }
    let communes = 0; a.forEach(function (x) { if (b.has(x)) { communes++; } });
    const partA = communes / a.size, partB = communes / b.size, passages = [];
    String(texteA).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).forEach(function (ph) {
      const sp = suites(ph); let n = 0; sp.forEach(function (x) { if (b.has(x)) { n++; } });
      if (n >= 2) { passages.push({ n: n, texte: ph.length > 220 ? ph.slice(0, 217) + '...' : ph }); }
    });
    passages.sort(function (x, y) { return y.n - x.n; });
    return { part: Math.max(partA, partB), passages: passages.slice(0, 3).map(function (p) { return p.texte; }) };
  }

  // candidat : { id, titre, tags, sources, texte }. `ecartes` : identifiants de fiches que la personne a déjà dit « ce n'est pas un doublon » pour ce candidat.
  // Rend au plus 3 fiches, les plus ressemblantes d'abord :
  // { id, rayon, titre, score, niveau: 'repete' | 'theme', partTexte (0 à 100), passages: [phrases répétées], tagsCommuns: [], sourcesCommunes: [] }.
  function chercher(candidat, existantes, ecartes) {
    const c = candidat || {}, ex = propres(existantes), f = frequences(ex), ignores = Array.isArray(ecartes) ? ecartes : [];
    const ct = {}; liste(c.tags).forEach(function (t) { const k = norm(t); if (k) { ct[k] = String(t).trim(); } });
    const cs = liste(c.sources).map(function (x) { return String(x).trim(); }).filter(Boolean), cw = mots(c.titre);
    const sortie = [];
    ex.forEach(function (e) {
      if (e.id === c.id || ignores.indexOf(e.id) !== -1) { return; }
      const et = {}; e.tags.forEach(function (t) { et[norm(t)] = true; });
      const tagsCommuns = Object.keys(ct).filter(function (k) { return et[k]; });
      const tw = tagsCommuns.reduce(function (n, k) { return n + 1 / Math.sqrt(f.tags[k] || 1); }, 0);
      const sourcesCommunes = cs.filter(function (s) { return e.sources.indexOf(s) !== -1; });
      const sw = sourcesCommunes.reduce(function (n, s) { return n + 1 / Math.sqrt(f.sources[s] || 1); }, 0);
      const ew = mots(e.titre), communs = cw.filter(function (w) { return ew.indexOf(w) !== -1; });
      const tit = communs.length / Math.max(1, Math.min(cw.length, ew.length));
      const score = tw + 0.6 * sw + 2 * tit;
      const rec = (c.texte && e.texte) ? recoupement(c.texte, e.texte) : { part: 0, passages: [] }, repete = rec.part >= SEUIL_TEXTE;
      if (repete || score >= SEUIL_THEME) {
        sortie.push({ id: e.id, rayon: e.rayon, titre: e.titre, score: Math.round(score * 100) / 100, niveau: repete ? 'repete' : 'theme', partTexte: Math.round(rec.part * 100), passages: repete ? rec.passages : [], tagsCommuns: tagsCommuns.map(function (k) { return ct[k]; }), sourcesCommunes: sourcesCommunes });
      }
    });
    return sortie.sort(function (a, b) { return (b.niveau === 'repete') - (a.niveau === 'repete') || b.partTexte - a.partTexte || b.score - a.score; }).slice(0, MAX);
  }

  // Pour le message de rédaction : les fiches des AUTRES rayons dont les mots-clés se retrouvent dans le matériau collecté.
  // Les fiches du rayon choisi sont déjà toutes listées par l'écran. Rend au plus `max` fiches, les plus proches du matériau d'abord.
  function autresRayonsProches(materiau, rayon, existantes, max) {
    const ex = propres(existantes), f = frequences(ex), texte = ' ' + norm(materiau) + ' ', sortie = [];
    ex.forEach(function (e) {
      if (e.rayon === rayon) { return; }
      const trouves = e.tags.filter(function (t) { const k = norm(t); return k.length >= 3 && texte.indexOf(' ' + k + ' ') !== -1; });
      const poids = trouves.reduce(function (n, t) { return n + 1 / Math.sqrt(f.tags[norm(t)] || 1); }, 0);
      if (trouves.length >= 2 && poids >= 1.0) { sortie.push({ id: e.id, rayon: e.rayon, titre: e.titre, poids: poids }); }
    });
    return sortie.sort(function (a, b) { return b.poids - a.poids; }).slice(0, max || 25);
  }

  const api = { chercher: chercher, autresRayonsProches: autresRayonsProches, recoupement: recoupement, SEUIL_THEME: SEUIL_THEME, SEUIL_TEXTE: SEUIL_TEXTE };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { racine.VeilleRessemblance = api; }
})(typeof window !== 'undefined' ? window : this);
