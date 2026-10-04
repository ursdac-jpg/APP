/* ============================================================
   cvPdfDonnees.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- module ISOLE, jamais utilise par le
   Composeur Word (modules/cv-composeur/, docx.js) et jamais modifie
   par lui (voir modules/cv-pdf-html/README -- architecture voulue :
   toucher a l'un ne doit jamais impacter l'autre).

   Reutilise EN LECTURE SEULE le pipeline de donnees et de decision de
   contenu deja existant : normaliserDonneesCV(), appliquerMoteurDecisionCV()
   (js/app.js), composeurAnalyserProfil()/composeurAppliquerRegles()/
   composeurComposer() (modules/cv-composeur/).

   TACHE (retour utilisateur : "le contenu doit etre identique entre Word
   et PDF, seule la partie graphique change") : theme resolu via
   composeurResoudreThemeGeneration() (js/app.js), le MEME point d'entree
   unique deja partage entre le telechargement Word et l'apercu inline --
   theme.id='projetxxl' avec les VRAIS reglagesProjetXXL de la personne
   (etatApercuInline.cv.reglagesProjetXXL), jamais le theme 'sobre' force
   comme avant. Les DECISIONS de contenu (quelles rubriques, combien
   d'items, missions tronquees, strategie forcee, bonus de capacite...)
   sont donc desormais EXACTEMENT les memes que le Word Projet XXL par
   defaut -- seul le rendu (fichiers cv-pdf-html/cvPdfTemplate*.js) differe,
   jamais la logique de contenu dupliquee ici.
   ============================================================ */

// TACHE (bandeau de disponibilite, port depuis le Word) : bandeauDisponibilite
// est le SEUL reglage du theme neutre qu'on autorise a faire varier ici --
// explicite et borde (jamais un passthrough generique d'options de theme),
// pour ne jamais risquer d'activer par erreur une branche Projet XXL. Ce
// reglage influence une vraie DECISION de contenu prise par composeurComposer()
// (contenuRetenu.langues devient vide quand actif, voir composeurComposition.js) :
// on le lit donc a la source plutot que de re-decider nous-memes cote PDF.
// TACHE (bouton "Mettre en avant + regrouper", port depuis le Word,
// point 14 cv.md) : `regroupementActif` (defaut false) -- 5e parametre,
// jamais un passthrough generique d'options de theme (meme principe que
// `bandeauDisponibilite` juste au-dessus). A4 uniquement (formatPage ne
// commence jamais par "A5" dans ce cas -- meme scope que le Word, ou ce
// reglage est deja masque en A5, voir js/app.js:16493) : verifie ici pour
// ne jamais l'appliquer par erreur au pipeline A5 (composeurComposerA5Portrait
// gere ses experiences tout autrement, jamais teste avec ces
// pseudo-experiences regroupees).
// TACHE (Denis, 2026-09-25, tranche 3, carte « Elements supplementaires ») : reservoir COMPLET des competences du CV,
// avant tout plafonnage (meme source que composeurComposition.js : objetCV.competences.savoirFaire + savoirs pour les
// professionnelles, savoirEtre + competencesPersonnelles pour les comportementales). Sert au bouton « Choisir » : la
// personne coche elle-meme les competences a garder. Aucun contenu invente : seulement ce que le dossier contient deja.
// R.7 : quel secteur du referentiel (data/competencesSecteurs.js) fournit les competences attendues ? Ordre de fiabilite : le secteur de
// la fiche du metier vise (sur), puis le secteur choisi par la personne, puis celui que l'assistant rapproche d'un metier ABSENT de la base
// (secteurProche). Un nom qui n'est pas l'un des 21 secteurs est ignore : jamais bloquant, jamais une competence inventee.
// Retourne { nom (libelle exact du referentiel), ref, origine: 'fiche' | 'choix' | 'assistant' } ou null.
function cvResoudreSecteurReferentiel(ficheVisee, secteurCible, secteurProche) {
  if (typeof COMPETENCES_SECTEURS === 'undefined') { return null; }
  var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); };
  var cles = Object.keys(COMPETENCES_SECTEURS);
  var candidats = [
    { libelle: ficheVisee && ficheVisee.secteur, origine: 'fiche' },
    { libelle: secteurCible, origine: 'choix' },
    { libelle: secteurProche, origine: 'assistant' }
  ];
  for (var i = 0; i < candidats.length; i++) {
    var voulu = norm(candidats[i].libelle);
    if (!voulu) { continue; }
    var cle = cles.filter(function (k) { return norm(k) === voulu; })[0];
    if (cle) { return { nom: cle, ref: COMPETENCES_SECTEURS[cle], origine: candidats[i].origine }; }
  }
  return null;
}
function construireReservoirCompetencesPdf(objetCV, qualitesAssemblees, proAttendues) {
  var brutes = (objetCV && objetCV.competences) || {};
  function texte(c) { return (typeof c === 'string') ? c : ((c && (c.competence || c.texte)) || ''); }
  function sansDoublon(liste) {
    var vus = {}, sortie = [];
    liste.forEach(function (x) {
      var t = String(texte(x)).trim();
      if (!t) { return; }
      var cle = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (vus[cle]) { return; }
      vus[cle] = true;
      sortie.push(t);
    });
    return sortie;
  }
  // LIM-3 (2026-09-29) : les competences REGROUPEES PAR THEME par l'assistant (modes « Par competences » et « Mixte ») sont tronquees
  // a la capacite du Composeur ; celles qui depassent n'etaient dans aucune liste, donc INTROUVABLES pour la personne (constate :
  // 17 proposees, 11 affichees, 6 perdues). Elles rejoignent le reservoir : « Choisir » permet de les remettre.
  var themees = [];
  ((objetCV && objetCV.competencesGroupeesParTheme) || []).forEach(function (g) {
    (g.items || []).forEach(function (it) { themees.push(it); });
  });
  return {
    // R.4 (option A, decision Denis) : les savoir-faire ATTENDUS (fiche du metier, secteur) sont proposes dans « Choisir » avec la mention
    // « attendu dans ce secteur », JAMAIS affiches d'office : ce serait affirmer un fait sur la personne.
    pro: sansDoublon((brutes.savoirFaire || []).concat(brutes.savoirs || [], themees, proAttendues || [])),
    // LOT 3.4 : les qualites ATTENDUES POUR LE POSTE VISE sont dans le reservoir (« Choisir » peut les proposer) ; le gabarit les retire
    // si la personne decoche l'option (3.5).
    comportementales: sansDoublon((brutes.savoirEtre || []).concat((objetCV && objetCV.competencesPersonnelles) || [], (objetCV && objetCV.competencesPersonnellesProposees) || [], qualitesAssemblees || ((objetCV && objetCV.competencesAttenduesMetier) || [])))
  };
}

// TACHE (Denis, 2026-09-25, tranche 3, carte « Experiences professionnelles ») : `strategieForcee` (facultatif, defaut null)
// = « parCompetences » quand la personne choisit « Par competences » ou « Mixte » : le Composeur produit alors
// contenuRetenu.competencesGroupees (competences regroupees par theme, avec l'experience qui les illustre quand elle existe).
// Passe par le reglage DEJA existant du Composeur (theme.strategieForcee), jamais une 2e logique de decision.
// ============================================================
// Contenu du bloc « Competences en action » (retour Denis 2026-10-03, maquette docs/MAQUETTE_COMPETENCES_EN_ACTION_2026-10-03.html, etape 1)
// - « Par competences » (variante 'C') : de VRAIES missions, prises dans les experiences LIEES au metier vise (l'assistant, la fiche du metier, le titre). Par experience liee :
//   3 missions si elles sont 1 a 2, 2 si 3 a 4, 1 si 5 et plus ; au moins 2 en tout. Les premieres missions de chaque experience sont les plus importantes. Une experience sans
//   rapport avec le metier ne fait PAS remonter de missions (elle reste dans la liste des experiences, trace du parcours). Manque de matiere : on complete avec les competences
//   regroupees par theme de l'assistant, jamais avec des missions sans rapport.
// - « Mixte » (variante 'B') : les competences regroupees par theme de l'assistant ; s'il y en a moins de 4, completees par les competences professionnelles.
// Sans choix de la personne ailleurs, aucune ecriture : ce sont des lectures du dossier, rien n'est invente.
// ============================================================
function _pdfCompetencesEnAction(variante, composition, objetCV, dossierSource, recoIA) {
  var cr = composition.contenuRetenu;
  var texteDe = function (x) { return (typeof x === 'string') ? x : ((x && (x.competence || x.texte)) || ''); };
  var norme = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); };
  // Seules les VRAIES competences regroupees de l'assistant comptent ici : le repli du Composeur (missions mises a la suite) n'est pas une recommandation de l'assistant.
  var groupesAssistant = (objetCV.competencesGroupeesParTheme || []).length ? (cr.competencesGroupees || []) : [];
  var nbItems = function (gs) { return gs.reduce(function (t, g) { return t + ((g.items || []).length); }, 0); };
  if (variante === 'B') {
    var n = nbItems(groupesAssistant);
    if (n >= 4) { return groupesAssistant; }
    var deja = {}; groupesAssistant.forEach(function (g) { (g.items || []).forEach(function (it) { deja[norme(it.texte)] = true; }); });
    var pool = (cr.competences || []).map(texteDe).filter(function (t) { return t && !deja[norme(t)]; });
    var complement = pool.slice(0, Math.max(0, (n ? 4 : 6) - n)).map(function (t) { return { texte: t, illustrePar: [] }; });
    var gb = complement.length ? groupesAssistant.concat([{ theme: '', items: complement }]) : groupesAssistant;
    // Ni competences regroupees ni competences professionnelles a montrer : dernier recours, les missions des experiences (comme « Par competences »).
    return nbItems(gb) ? gb : _pdfCompetencesEnAction('C', composition, objetCV, dossierSource, recoIA);
  }
  // variante 'C'
  var exps = (cr.experiences || []).filter(function (e) { return e && String(e.missions || '').trim(); });
  if (!exps.length) { return groupesAssistant; }
  var fiche = (dossierSource.metierCible && typeof metierParNom === 'function') ? metierParNom(dossierSource.metierCible) : null;
  var mots = fiche ? [].concat(fiche.savoirFaire || [], fiche.savoirEtre || [], fiche.savoirs || []) : [];
  var misesEnAvant = (recoIA && recoIA.experiencesAMettreEnAvant) || [];
  var ok = (typeof correspond === 'function');
  var signal = !!(mots.length || misesEnAvant.length || dossierSource.metierCible);
  function missionsDe(e) { return String(e.missions || '').split('\n').map(function (m) { return m.trim(); }).filter(Boolean); }
  function estLiee(e) {
    if (!signal) { return true; }
    if (misesEnAvant.some(function (m) { return ok && ((m.poste && e.poste && correspond(e.poste, m.poste)) || (m.entreprise && e.entreprise && correspond(e.entreprise, m.entreprise) && (!m.poste || !e.poste || correspond(e.poste, m.poste)))); })) { return true; }
    if (ok && dossierSource.metierCible && e.poste && correspond(e.poste, dossierSource.metierCible)) { return true; }
    return ok && mots.length > 0 && missionsDe(e).some(function (m) { return mots.some(function (k) { return correspond(m, k); }); });
  }
  var liees = exps.filter(estLiee);
  var autres = exps.filter(function (e) { return liees.indexOf(e) === -1; });
  var q = liees.length <= 2 ? 3 : (liees.length <= 4 ? 2 : 1);
  var vues = {}, items = [];
  var ajouter = function (texte, e) {
    var cle = norme(texte); if (!cle || vues[cle]) { return false; }
    vues[cle] = true; items.push({ texte: texte, illustrePar: [e.entreprise || e.poste].filter(Boolean) }); return true;
  };
  for (var rang = 0; rang < q; rang++) { liees.forEach(function (e) { var m = missionsDe(e)[rang]; if (m) { ajouter(m, e); } }); }
  // au moins 2 missions : d'abord la suite des experiences liees, puis (a defaut) la premiere mission des autres experiences
  for (var plus = q; items.length < 2 && plus < 6; plus++) { liees.forEach(function (e) { var m = missionsDe(e)[plus]; if (m && items.length < 2) { ajouter(m, e); } }); }
  if (items.length < 2 && !groupesAssistant.length) { autres.forEach(function (e) { var m = missionsDe(e)[0]; if (m && items.length < 2) { ajouter(m, e); } }); }
  if (items.length < 2) {
    groupesAssistant.forEach(function (g) { (g.items || []).forEach(function (it) { if (items.length < 2 && !vues[norme(it.texte)]) { vues[norme(it.texte)] = true; items.push({ texte: it.texte, illustrePar: it.illustrePar || [] }); } }); });
  }
  // Missions EN RESERVE (retour Denis 2026-10-03) : la suite des missions des experiences liees. Elles ne sont pas sur le CV ; la liste du panneau les propose (decochees) pour
  // remplacer ou ajouter une mission. Jamais celles d'une experience sans rapport avec le metier.
  // Phrases PROPOSEES par l'assistant (cv.md point 20, 2026-10-04) : en tete de la reserve, decochees, avec leur etiquette. Jamais une phrase vide, une phrase deja affichee,
  // ni une phrase dont les experiences citees n'existent pas sur ce CV (lien invente) ; une liste citee vide reste acceptee (aucun lien affirme).
  var propositions = [];
  ((recoIA && recoIA.missionsEnActionProposees) || []).forEach(function (p) {
    var texte = String((p && p.texte) || '').trim(), cle = norme(texte);
    if (!cle || vues[cle] || propositions.length >= 10) { return; }
    var citees = (p.illustrePar || []).filter(Boolean);
    var valides = citees.filter(function (nom) { return ok && (cr.experiences || []).some(function (e) { return (e.poste && correspond(e.poste, nom)) || (e.entreprise && correspond(e.entreprise, nom)); }); });
    if (citees.length && !valides.length) { return; }
    vues[cle] = true;
    propositions.push({ texte: texte, illustrePar: valides, reserve: true, proposition: true, etiquette: String(p.competence || '').trim() });
  });
  var nbAffichees = items.length, reserveMissions = [];
  for (var rg = 0; rg < 6; rg++) { liees.forEach(function (e) { var m = missionsDe(e)[rg]; if (m && !vues[norme(m)] && reserveMissions.length < 8) { vues[norme(m)] = true; reserveMissions.push({ texte: m, illustrePar: [e.entreprise || e.poste].filter(Boolean), reserve: true }); } }); }
  items = items.concat(propositions, reserveMissions);
  if (typeof experiencesQuiDemontrent === 'function') {
    items.forEach(function (it) {
      experiencesQuiDemontrent(it.texte, cr.experiences || []).forEach(function (e) { var nom = e.entreprise || e.poste; if (nom && it.illustrePar.indexOf(nom) === -1) { it.illustrePar.push(nom); } });
    });
  }
  return items.length ? [{ theme: '', items: items }] : groupesAssistant;
}

function construireDonneesPdfCV(dossierSource, formatPage, bandeauDisponibilite, regroupementActif, strategieForcee, varianteCompetences) {
  var objetCVBrut = normaliserDonneesCV(dossierSource);
  var recommandationsIACV = (dossierSource.ia && dossierSource.ia.cv && dossierSource.ia.cv.recommandations) || {};
  var objetCV = (typeof appliquerMoteurDecisionCV === 'function')
    ? appliquerMoteurDecisionCV(objetCVBrut, recommandationsIACV, {})
    : objetCVBrut;

  // TACHE (bouton "Mettre en avant + regrouper") : reutilise EN LECTURE
  // SEULE composeurAppliquerRegroupementExperiences (composeurMoteur.js,
  // deja charge -- module Word, mais fonction pure sans dependance a
  // docx.js) -- applique APRES appliquerMoteurDecisionCV (qui a deja
  // selectionne/ordonne/complete objetCV.experiences), EXACTEMENT comme
  // le fait genererDocxComposeur() cote Word. Repli silencieux sur objetCV
  // inchange si l'IA n'a rien propose d'exploitable (deja gere par la
  // fonction elle-meme) ou si le format est A5.
  if (regroupementActif && String(formatPage || '').indexOf('A5') !== 0 && typeof composeurAppliquerRegroupementExperiences === 'function') {
    objetCV = composeurAppliquerRegroupementExperiences(objetCV, recommandationsIACV.regroupementExperiences);
  }

  // 'projetxxl-bleu-7_2col' : id neutre fixe -- seul theme.id==='projetxxl'
  // + reglagesProjetXXL comptent pour le CONTENU decide par
  // composeurComposition.js ; couleur/nuance/colonnes de cet id sont
  // ignores par le rendu PDF (son propre panneau de style les pilote
  // independamment, voir cvPdfPanneauReglages.js), jamais lus ici.
  var reglagesProjetXXLActuels = (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv && etatApercuInline.cv.reglagesProjetXXL) || {};
  if (strategieForcee) {
    reglagesProjetXXLActuels = Object.assign({}, reglagesProjetXXLActuels, { strategieForcee: strategieForcee });
  }
  var themeResolu = (typeof composeurResoudreThemeGeneration === 'function')
    ? composeurResoudreThemeGeneration('projetxxl-bleu-7_2col', reglagesProjetXXLActuels)
    : null;
  var theme = (themeResolu && typeof themeResolu === 'object') ? themeResolu : composeurObtenirTheme('projetxxl');
  theme.bandeauDisponibilite = !!bandeauDisponibilite;

  var profil = composeurAnalyserProfil(objetCV, dossierSource.objectif);
  var decisions = composeurAppliquerRegles(profil);
  var composition = composeurComposer(objetCV, profil, decisions, {}, formatPage || 'A4-detaille', theme, dossierSource, recommandationsIACV);

  // TACHE (retour utilisateur : "ne pas perdre le contenu Projet XXL") :
  // 2 trous de contenu trouves en activant reellement ce theme cote PDF --
  // aucun des 2 n'existait avant (theme 'sobre' ne peuplait jamais ces
  // champs) :
  // 1) contenuRetenu.experiencesPersonnelles ({intitule, detail, dates,
  //    missions}, exclusif Projet XXL) n'est lu par aucun fabricant du
  //    template PDF -- fusionne ici dans la meme liste que "engagements"
  //    (meme bloc "Experience personnelle" que le Word Projet XXL,
  //    composeurRender.js), _pdfBlocExperiencePersonnelle (cvPdfTemplateA4.js)
  //    sait deja rendre ce genre de forme (titre + detail + missions).
  // 2) quand une recommandation IA "mise en avant" existe,
  //    composeurComposition.js deplace les elements NON retenus vers
  //    contenuRetenu.savoirFairePersonnelNonRetenu/engagementNonRetenu --
  //    2 cles que le template PDF ne connait pas du tout : reconcatenees
  //    ici pour ne jamais les perdre (le PDF n'a pas la distinction
  //    visuelle "mis en avant" que fait le Word, tout s'affiche ensemble).
  // C2 (Denis, 2026-09-26) : aucun plafond sur les rubriques du PDF en A4 detaille et A4 complet : la personne en met autant qu'elle veut
  // (les plafonds 3 / 5 du Composeur restent pour l'Essentiel, dont c'est le principe, et pour le Word). Quand un format en
  // retire quand meme (A4 essentiel), la liste est gardee dans composition.rubriquesTronquees : le panneau le dit clairement.
  if (composition && composition.contenuRetenu && String(formatPage || '').indexOf('A5') !== 0) {
    var crC2 = composition.contenuRetenu;
    var essentielC2 = (formatPage === 'A4-essentiel');
    var nomsC2 = { formations: 'formations', langues: 'langues', loisirs: 'centres d’intérêt', logiciels: 'logiciels', certifications: 'certifications', engagements: 'engagements', experiencesPersonnelles: 'expériences personnelles' };
    composition.rubriquesTronquees = [];
    Object.keys(nomsC2).forEach(function (k) {
      var total = (objetCV[k] || []).length;
      var retenu = (crC2[k] || []);
      if (k === 'langues' && !retenu.length) { return; }   // bandeau de disponibilite : les langues sont volontairement absentes
      if (total > retenu.length) {
        if (essentielC2) { composition.rubriquesTronquees.push({ nom: nomsC2[k], affiche: retenu.length, total: total }); }
        else { crC2[k] = (objetCV[k] || []).slice(); }
      }
    });
  }
  // Contenu de « Competences en action » selon le mode (Par competences / Mixte) : voir _pdfCompetencesEnAction ci-dessus.
  if (strategieForcee === 'parCompetences' && (varianteCompetences === 'B' || varianteCompetences === 'C') && composition && composition.contenuRetenu && String(formatPage || '').indexOf('A5') !== 0) {
    try { composition.contenuRetenu.competencesGroupees = _pdfCompetencesEnAction(varianteCompetences, composition, objetCV, dossierSource, recommandationsIACV); }
    catch (e) { /* repli : le contenu du Composeur reste en place */ }
  }
  if (composition && composition.contenuRetenu) {
    var contenuRetenuPDF = composition.contenuRetenu;
    // Sans doublon : quand le plafond est leve (C2), la liste contient deja ces elements.
    var sansDoublonPDF = function (base, extra) {
      var deja = (base || []).map(function (x) { return JSON.stringify(x); });
      return (base || []).concat((extra || []).filter(function (x) { return deja.indexOf(JSON.stringify(x)) === -1; }));
    };
    contenuRetenuPDF.engagements = sansDoublonPDF(contenuRetenuPDF.engagements, contenuRetenuPDF.engagementNonRetenu);
    contenuRetenuPDF.experiencesPersonnelles = sansDoublonPDF(contenuRetenuPDF.experiencesPersonnelles, contenuRetenuPDF.savoirFairePersonnelNonRetenu);
  }

  // TACHE (bandeau de competences cles, port depuis le Word) : COMPOSEUR_REGLE_R006
  // (composeurStrategies.js) est une VRAIE selection editoriale deja ecrite
  // et testee (equilibre technique/savoir-etre, priorisee par pertinence
  // avec le metier vise) -- jamais invoquee par composeurComposer() a ce
  // jour (cohabitation explicite, voir en-tete du fichier), mais appelable
  // isolement sans aucune modification. Reutilisee ici EN LECTURE SEULE,
  // sur les competences BRUTES (objetCV.competences, categorisees --
  // jamais composition.contenuRetenu.competences, deja fusionnee/aplatie,
  // que R006 ne saurait pas re-categoriser). Repli sur tableau vide si le
  // fichier n'est pas charge (garde defensive, meme principe que le reste
  // de ce fichier).
  var competencesCles = (typeof COMPOSEUR_REGLE_R006 !== 'undefined')
    ? COMPOSEUR_REGLE_R006.appliquer(objetCV.competences, dossierSource.metierCible).valeur
    : [];

  // TACHE (retour utilisateur : "compétences professionnelles et
  // comportementales séparées, comme le Word Projet XXL") : desormais que
  // le theme reel 'projetxxl' est actif (plus haut), composeurComposition.js
  // separe DEJA correctement composition.contenuRetenu.competences
  // (professionnelles, savoirFaire+savoirs) et .competencesPersonnelles
  // (comportementales, savoirEtre+Decouverte, forme {competence: texte}) --
  // memes plafonds que le Word, memes constantes globales, EXACTEMENT
  // equivalent a l'ancien calcul manuel fait ici du temps du theme 'sobre'
  // force (verifie en test : sorties identiques) -- lecture directe
  // desormais, jamais une 2e logique de separation dupliquee.
  var competencesProfessionnelles = (composition && composition.contenuRetenu && composition.contenuRetenu.competences) || [];
  var competencesComportementales = (composition && composition.contenuRetenu && composition.contenuRetenu.competencesPersonnelles) || [];

  // LOT 3.4 (decision Denis 2026-09-29) : qualites attendues pour le poste visé (assistant, deja debarrassees des doublons par le moteur),
  // placees APRES les comportementales connues et dans la limite de la place laissee par le format (9 en A4 detaille, sans limite en A4
  // complet, aucune par defaut en A4 essentiel et A5 : place comptee, elles restent proposees dans « Choisir »).
  // R.4 : sources par priorite = savoir-etre connus de la personne, puis fiche du metier vise, puis secteur, puis liste de l'assistant.
  var ficheVisee = (dossierSource.metierCible && typeof metierParNom === 'function') ? metierParNom(dossierSource.metierCible) : null;
  var secteurRetenu = cvResoudreSecteurReferentiel(ficheVisee, dossierSource.secteurCible, objetCV.secteurProche);
  var refSecteur = secteurRetenu ? secteurRetenu.ref : null;
  var assembler = (typeof _cvAssemblerParPriorite === 'function') ? _cvAssemblerParPriorite : null;
  var texteComp = function (c) { return (typeof c === 'string') ? c : ((c && (c.competence || c.texte)) || ''); };
  var qualitesConnues = ((objetCV.competences && objetCV.competences.savoirEtre) || []).concat(objetCV.competencesPersonnelles || [], competencesComportementales).map(texteComp);
  var qualitesAssemblees = assembler
    ? assembler(qualitesConnues, [
        { origine: 'fiche', liste: (ficheVisee && ficheVisee.savoirEtre) || [] },
        { origine: 'secteur', liste: (refSecteur && refSecteur.savoirEtre) || [] },
        { origine: 'assistant', liste: objetCV.competencesAttenduesMetier || [] }
      ])
    : ((objetCV.competencesAttenduesMetier) || []).map(function (c) { return { competence: c.competence, origine: 'assistant' }; });
  var qualitesAttenduesMetier = qualitesAssemblees.map(function (c) { return c.competence; }).filter(Boolean);
  var proConnues = ((objetCV.competences && objetCV.competences.savoirFaire) || []).concat((objetCV.competences && objetCV.competences.savoirs) || [], competencesProfessionnelles).map(texteComp);
  var proAttendues = assembler
    ? assembler(proConnues, [
        { origine: 'fiche', liste: [].concat((ficheVisee && ficheVisee.savoirFaire) || [], (ficheVisee && ficheVisee.savoirs) || []) },
        { origine: 'secteur', liste: [].concat((refSecteur && refSecteur.savoirFaire) || [], (refSecteur && refSecteur.savoirs) || []) }
      ]).map(function (c) { return c.competence; })
    : [];
  var capaciteComportementales = (formatPage === 'A4-detaille' && typeof COMPOSEUR_CAPACITES_A4_DETAILLE_CV !== 'undefined') ? COMPOSEUR_CAPACITES_A4_DETAILLE_CV.competencesPersonnelles
    : (formatPage === 'A4-integral' ? 99 : 0);
  var placesQualitesMetier = Math.max(0, capaciteComportementales - competencesComportementales.length);

  return {
    objetCV: objetCV,
    composition: composition,
    qualitesAttenduesMetier: qualitesAttenduesMetier,
    placesQualitesMetier: placesQualitesMetier,
    competencesCles: competencesCles,
    competencesProfessionnelles: competencesProfessionnelles,
    competencesComportementales: competencesComportementales,
    competencesProAttendues: proAttendues,
    secteurReferentiel: secteurRetenu ? { nom: secteurRetenu.nom, origine: secteurRetenu.origine } : null,
    reservoirCompetences: construireReservoirCompetencesPdf(objetCV, qualitesAttenduesMetier, proAttendues)
  };
}
