/* ============================================================
   veillePreuve.js  --  la « preuve par ligne » des rapports de contrôle (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Décision de Denis (2026-10-31, idée n° 1 de l'amélioration de l'outil de veille) : pour chaque fiche, l'assistant donne la page qu'il a lue,
   la date affichée sur cette page et un passage recopié mot pour mot. Ce n'est pas une garantie de vérité : c'est ce qui rend un « à jour »
   invérifiable visible, et ce qui permet à Denis d'ouvrir la page en quelques secondes.
   Règle de l'outil : « A JOUR » sans preuve utilisable (aucune page, ou aucun passage) devient « INCERTAIN ». Jamais l'inverse.
   Fichier chargé par veille.html (navigateur) ET par les tests (Node). Aucune dépendance, aucune écriture, aucun accès réseau.
   ============================================================ */
(function (racine) {
  'use strict';

  const MIN_MOTS = 4, MAX_MOTS = 30;

  function mots(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
  function adresse(s) { const m = String(s || '').match(/https:\/\/[^\s)\]|"'<>]+/); return m ? m[0].replace(/[.,;:]+$/, '') : ''; }
  function pageAccueil(url) {
    try { const u = new URL(url); return (u.pathname === '/' || u.pathname === '') && !u.search; } catch (e) { return false; }
  }
  function sansGuillemets(s) { return String(s || '').replace(/^[\s«»"'“”‘’*_`-]+|[\s«»"'“”‘’*_`]+$/g, '').replace(/\s+/g, ' ').trim(); }

  // Les trois éléments de la ligne « preuve: adresse | date | passage » d'une entrée de rapport. Tolère l'ordre approximatif et les liens en markdown.
  function lire(entree) {
    const m = /^[ \t]*[-*]?[ \t]*preuve[ \t]*:[ \t]*(.*)$/im.exec(String(entree || ''));
    if (!m) { return { presente: false, adresse: '', date: '', sansDate: false, passage: '', brut: '' }; }
    const brut = m[1].trim();
    if (/^(aucune?|non|n\/a|néant|neant)\b[ .]*$/i.test(sansGuillemets(brut)) || !brut) { return { presente: true, aucune: true, adresse: '', date: '', sansDate: false, passage: '', brut: brut }; }
    const parts = brut.split('|').map(function (x) { return x.trim(); });
    const dm = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(brut) || null;
    const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(brut);
    const date = dm ? (('0' + dm[1]).slice(-2) + '/' + ('0' + dm[2]).slice(-2) + '/' + dm[3]) : (iso ? iso[3] + '/' + iso[2] + '/' + iso[1] : '');
    const sansDate = !date && /sans\s+date|date\s+non\s+(indiqu|affich|visible)/i.test(brut);
    const passage = parts.length >= 3 ? sansGuillemets(parts.slice(2).join(' | ')) : '';
    return { presente: true, aucune: false, adresse: adresse(parts[0]) || adresse(brut), date: date, sansDate: sansDate, passage: passage, brut: brut };
  }

  // Le niveau de la preuve : « solide » (adresse précise, passage de taille utile, date ou « sans date »), « faible » (utilisable mais imparfaite), « absente » (inutilisable).
  function evaluer(p) {
    const preuve = p || {};
    if (!preuve.presente || preuve.aucune) { return { niveau: 'absente', problemes: ['aucune preuve donnée'] }; }
    const nb = mots(preuve.passage), pb = [];
    if (!preuve.adresse) { pb.push('l\'adresse de la page lue manque'); }
    if (nb < MIN_MOTS) { pb.push('aucun passage recopié (ou trop court pour être retrouvé)'); }
    if (pb.length) { return { niveau: 'absente', problemes: pb }; }
    if (nb > MAX_MOTS) { pb.push('le passage est trop long : ce n\'est plus un repère'); }
    if (pageAccueil(preuve.adresse)) { pb.push('l\'adresse est celle de la page d\'accueil, pas de la page précise'); }
    if (!preuve.date && !preuve.sansDate) { pb.push('la date de la page n\'est pas indiquée'); }
    return { niveau: pb.length ? 'faible' : 'solide', problemes: pb };
  }

  // Règle de l'outil : « A JOUR » sans preuve utilisable, ou dont le passage n'est pas dans la page citée (ou dont la page n'existe pas), devient « INCERTAIN ».
  // Les autres états ne changent pas. verif : le verdict de la lecture de la page par l'outil (phase 2), absent tant que Denis ne l'a pas demandée.
  const VERDICTS_CONTRAIRES = ['non-retrouve', 'adresse-introuvable'];
  function etatRetenu(etat, evaluation, verif) {
    if (etat === 'A_JOUR' && ((evaluation && evaluation.niveau === 'absente') || (verif && VERDICTS_CONTRAIRES.indexOf(verif.verdict) !== -1))) { return { etat: 'INCERTAIN', declasse: true }; }
    return { etat: etat, declasse: false };
  }

  // Les lignes d'un rapport dont l'outil peut aller lire la page : [{ id, adresse, passage }] (preuve utilisable, adresse et passage présents).
  function lignesAVerifier(parId) {
    return Object.keys(parId || {}).filter(function (k) { const p = parId[k]; return p && p.preuve && p.preuveNiveau !== 'absente' && p.preuve.adresse && p.preuve.passage && /^[a-z0-9][a-z0-9-]{0,120}$/.test(k); })
      .map(function (k) { return { id: k, adresse: parId[k].preuve.adresse, passage: parId[k].preuve.passage }; });
  }

  // La consigne ajoutée au message de contrôle, et la ligne du gabarit de réponse.
  const LIGNE_GABARIT = 'preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot';
  function consigne() {
    return 'PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : '
      + '(1) l\'adresse exacte et complète de la page précise que tu as lue, jamais la page d\'accueil du site ; '
      + '(2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n\'en affiche pas ; '
      + '(3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l\'information vérifiée. '
      + 'Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. '
      + 'Si tu n\'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l\'état INCERTAIN. '
      + 'Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l\'outil.';
  }

  // La preuve d'une entrée (un changement, un signal) d'un message qui n'est pas le contrôle d'un rayon : mêmes champs que les lignes du rapport de contrôle.
  function examiner(entree) {
    const p = lire(entree), ev = evaluer(p);
    return { preuve: { adresse: p.adresse, date: p.date, sansDate: p.sansDate, passage: p.passage }, preuveNiveau: ev.niveau, preuveProblemes: ev.problemes };
  }

  // La consigne des messages dont la réponse est une liste d'entrées (veille rapide, balayage, confronter). regleSansPreuve : ce que l'assistant fait quand il n'a pas de page à citer.
  function consigneEntrees(regleSansPreuve) {
    return 'PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l\'entrée une ligne « preuve: » avec trois éléments séparés par « | » : '
      + '(1) l\'adresse exacte et complète de la page précise que tu as lue, jamais la page d\'accueil du site ; '
      + '(2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n\'en affiche pas ; '
      + '(3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l\'information rapportée. '
      + 'Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. ' + regleSansPreuve + ' '
      + 'L\'outil ouvrira les pages citées pour y retrouver ces passages.';
  }

  const api = { examiner: examiner, consigneEntrees: consigneEntrees, lire: lire, evaluer: evaluer, etatRetenu: etatRetenu, lignesAVerifier: lignesAVerifier, consigne: consigne, LIGNE_GABARIT: LIGNE_GABARIT, MIN_MOTS: MIN_MOTS, MAX_MOTS: MAX_MOTS };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { racine.VeillePreuve = api; }
})(typeof window !== 'undefined' ? window : this);
