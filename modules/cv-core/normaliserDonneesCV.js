/* ============================================================
   modules/cv-core/normaliserDonneesCV.js
   ------------------------------------------------------------
   normaliserDonneesCV(dossier) : transforme "dossier" (etat global de
   l'application, js/app.js) en un objet CV standardise, independant
   de tout rendu.

   "dossier" reste l'unique source de verite : cette fonction ne le
   modifie jamais, elle en derive une structure normalisee.

   Reutilise extraireDonneesCV(dossier) (modules/cv-core/extraireDonneesCV.js)
   comme source commune, partagee avec genererCSVCanva() (js/app.js) --
   une seule lecture de "dossier", jamais deux logiques d'extraction
   paralleles a maintenir.

   Cet objet CV est le "contrat" partage par tous les futurs modules lies
   au CV (editeur, templates, export PDF/DOCX...). Voir docs/SCHEMA_CV.md
   pour la description complete de chaque propriete, son type, son role
   et un exemple.

   IMPORTANT (regle du projet) : AUCUNE logique de presentation ici
   (pas de majuscules, pas de troncature, pas de concatenation de texte
   pour l'affichage...) -- uniquement des donnees propres et completes.
   La mise en forme est entierement du ressort des futurs templates.
   ============================================================ */

// Une mission qui repete mot pour mot le poste ou l'employeur n'apporte aucune information : elle ne s'affiche pas (jamais
// d'information en double sur le CV). Le dossier reste intact ; seul l'objet CV derive est nettoye. Ex. (2026-09-26) : une
// experience « Congé sabbatique / Pause professionnelle volontaire » dont la seule mission etait « Pause professionnelle volontaire ».
function _cvSansMissionsRedondantes(experiences) {
  var nettoyer = function (t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  };
  var separateur = /\r?\n/;
  return (experiences || []).map(function (e) {
    if (!e || typeof e.missions !== 'string' || !e.missions.trim()) { return e; }
    var interdits = [nettoyer(e.poste), nettoyer(e.entreprise)].filter(Boolean);
    var lignes = e.missions.split(separateur);
    var gardees = lignes.filter(function (ligne) {
      var l = nettoyer(ligne);
      return !l || interdits.indexOf(l) === -1;
    });
    if (gardees.length === lignes.length) { return e; }
    var copie = {};
    Object.keys(e).forEach(function (k) { copie[k] = e[k]; });
    copie.missions = gardees.join('\n');
    return copie;
  });
}

// R13 (2026-09-29) : deux phrases de mission sont « la meme » quand elles sont identiques apres normalisation, ou quand elles
// partagent presque tous leurs mots significatifs (quasi-doublon). Prudent volontairement : le rapport se calcule sur la plus
// LONGUE des deux phrases, donc un court intitule de competence (« Bionettoyage ») ne fait jamais disparaitre une mission qui le
// contient. Sert a ne jamais afficher deux fois la meme phrase (competences en action puis experiences, mode Mixte).
var _CV_MOTS_VIDES = ['dans', 'pour', 'avec', 'sans', 'sous', 'selon', 'leur', 'leurs', 'cette', 'entre', 'ainsi', 'vers', 'chez', 'tout', 'tous', 'toute', 'toutes', 'plus', 'tres'];
function _cvNettoyerPhrase(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, ' ').trim();
}
function _cvRacinesPhrase(t) {
  var vues = {}, racines = [];
  _cvNettoyerPhrase(t).split(' ').forEach(function (m) {
    if (m.length < 4 || _CV_MOTS_VIDES.indexOf(m) !== -1) { return; }
    var r = m.slice(0, 4);
    if (!vues[r]) { vues[r] = true; racines.push(r); }
  });
  return racines;
}
function _cvMissionsSimilaires(a, b) {
  var na = _cvNettoyerPhrase(a), nb = _cvNettoyerPhrase(b);
  if (!na || !nb) { return false; }
  if (na === nb) { return true; }
  var ra = _cvRacinesPhrase(a), rb = _cvRacinesPhrase(b);
  if (ra.length < 3 || rb.length < 3) { return false; }
  var commun = ra.filter(function (r) { return rb.indexOf(r) !== -1; }).length;
  return commun / Math.max(ra.length, rb.length) >= 0.75;
}

// LOT 3.3 (2026-09-29) : deux qualites sont « les memes » quand elles sont identiques apres normalisation, ou quand tous les mots
// significatifs de la plus courte se retrouvent dans l'autre (« Ecoute » et « Ecoute active », « Esprit d'equipe » et « Travail en
// equipe », « Organise » et « Organisation »). Les mots trop generiques (sens, capacite, esprit) ne comptent pas, pour ne pas
// confondre « Sens de la hierarchie » et « Sens du service ». Filet CODE derriere la consigne du prompt (10 bis) : jamais deux
// qualites quasi identiques sur le CV entre le savoir-etre connu et les qualites attendues pour le poste. Un synonyme sans mot commun
// (« Endurance » et « Perseverance ») n'est evite que par le prompt.
var _CV_MOTS_QUALITE_VIDES = ['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux', 'sens', 'capacite', 'esprit', 'goût', 'gout'];
function _cvRacinesQualite(t) {
  var vues = {}, racines = [];
  _cvNettoyerPhrase(t).split(' ').forEach(function (m) {
    if (m.length < 3 || _CV_MOTS_QUALITE_VIDES.indexOf(m) !== -1) { return; }
    var r = m.slice(0, 5);
    if (!vues[r]) { vues[r] = true; racines.push(r); }
  });
  return racines;
}
// R9 (2026-09-29) : phrase d'accroche AFFICHEE sur le CV. Par defaut la version longue choisie (dossier.ia.cv.profil). Quand la personne a
// active « Version courte » (dossier.reglagesMiseEnPageCV.accrocheCourte), la version courte de la MEME proposition (l'assistant en fournit
// une par proposition, meme rang : accrochesCourtesProposees[i] pour accrochesProposees[i]) ; sans version courte pour cette proposition
// (ancienne reponse, proposition ecrite a la main), la version longue reste affichee : jamais une accroche inventee ni raccourcie par le code.
// Le rang de la proposition choisie est accrocheIdx (memorise au choix), a defaut le rang du texte dans accrochesProposees.
// Le rang memorise (accrocheIdx) n'est cru que si le texte de l'accroche n'a pas ete change par un AUTRE circuit depuis (Bilan, import...) :
// accrocheIdxProfil garde le texte au moment ou le rang a ete memorise ; s'il differe du texte actuel, on retombe sur le rang du texte.
function _cvMemoriserRangAccroche(iaCv, rang) {
  if (!iaCv) { return; }
  iaCv.accrocheIdx = (typeof rang === 'number' && rang >= 0) ? rang : null;
  iaCv.accrocheIdxProfil = iaCv.profil || '';
}
function _cvRangAccrocheChoisie(iaCv) {
  var cv = iaCv || {};
  if (typeof cv.accrocheIdx === 'number' && cv.accrocheIdx >= 0 && (cv.accrocheIdxProfil === undefined || cv.accrocheIdxProfil === (cv.profil || ''))) { return cv.accrocheIdx; }
  return (cv.accrochesProposees || []).indexOf(cv.profil);
}
// Bilan (« Analyser ma candidature ») : ajoute ses propositions (avec leur version courte, meme rang) a celles deja connues, sans rien perdre,
// et memorise le rang de celle que la personne vient de choisir. texteChoisi peut avoir ete retouche a la main : il devient alors une entree
// a part, portant la version courte de la proposition d'origine (rangOrigine).
function _cvAjouterAccrochesAvecCourtes(iaCv, propositions, courtes, texteChoisi, rangOrigine) {
  if (!iaCv) { return; }
  var longues = Array.isArray(iaCv.accrochesProposees) ? iaCv.accrochesProposees.slice() : [];
  var shorts = Array.isArray(iaCv.accrochesCourtesProposees) ? iaCv.accrochesCourtesProposees.slice() : [];
  while (shorts.length < longues.length) { shorts.push(''); }
  (propositions || []).forEach(function (t, i) {
    var c = String((courtes || [])[i] || '').trim();
    var k = longues.indexOf(t);
    if (k === -1) { longues.push(t); shorts.push(c); } else if (!shorts[k] && c) { shorts[k] = c; }
  });
  var kChoisi = longues.indexOf(texteChoisi);
  if (kChoisi === -1 && texteChoisi) {
    longues.push(texteChoisi); shorts.push(String((courtes || [])[rangOrigine] || '').trim()); kChoisi = longues.length - 1;
  }
  iaCv.accrochesProposees = longues;
  iaCv.accrochesCourtesProposees = shorts;
  iaCv.profil = texteChoisi || iaCv.profil || '';
  _cvMemoriserRangAccroche(iaCv, kChoisi);
}
function _cvAccrocheCourteChoisie(iaCv) {
  var cv = iaCv || {};
  var rang = _cvRangAccrocheChoisie(cv);
  var courte = (rang >= 0 && Array.isArray(cv.accrochesCourtesProposees)) ? cv.accrochesCourtesProposees[rang] : '';
  return String(courte || '').trim();
}
function _cvAccrocheAffichee(dossierSource) {
  var cv = (dossierSource && dossierSource.ia && dossierSource.ia.cv) || {};
  var longue = cv.profil || '';
  if (!longue) { return ''; }
  var reglages = (dossierSource && dossierSource.reglagesMiseEnPageCV) || {};
  return (reglages.accrocheCourte && _cvAccrocheCourteChoisie(cv)) || longue;
}
function _cvQualitesSimilaires(a, b) {
  var na = _cvNettoyerPhrase(a), nb = _cvNettoyerPhrase(b);
  if (!na || !nb) { return false; }
  if (na === nb) { return true; }
  var ra = _cvRacinesQualite(a), rb = _cvRacinesQualite(b);
  if (!ra.length || !rb.length) { return false; }
  var petit = ra.length <= rb.length ? ra : rb, grand = ra.length <= rb.length ? rb : ra;
  return petit.every(function (r) { return grand.indexOf(r) !== -1; });
}

// R.4 (decision Denis 2026-09-29) : assemble les competences attendues venant de plusieurs sources, par PRIORITE. Ordre des sources =
// ordre du tableau (personne d'abord via `connues`, puis fiche du metier, secteur, assistant). Une competence qui double (meme sens, meme
// filet que le Lot 3, _cvQualitesSimilaires) une competence deja connue OU deja prise par une source plus haute n'apparait qu'une fois,
// celle de la source la plus haute. Retourne [{ competence, origine }] dans l'ordre d'affichage.
function _cvAssemblerParPriorite(connues, sources) {
  var texte = function (c) { return (typeof c === 'string') ? c : ((c && (c.competence || c.texte)) || ''); };
  var vues = (connues || []).map(texte).filter(Boolean);
  var resultat = [];
  (sources || []).forEach(function (src) {
    (src.liste || []).forEach(function (c) {
      var nom = String(texte(c)).trim();
      if (!nom) { return; }
      if (vues.some(function (v) { return _cvQualitesSimilaires(nom, v); })) { return; }
      vues.push(nom);
      resultat.push({ competence: nom, origine: src.origine });
    });
  });
  return resultat;
}

// LOT 2 (2026-09-29) : lignes du PROFIL envoye a l'assistant (texteProfil, js/app.js) pour les experiences personnelles et les
// engagements. Avant, une experience personnelle n'envoyait que son intitule et son detail (ni dates ni missions) et un engagement
// que son texte et sa periode : l'assistant inventait alors des missions generiques (constate sur les 3 assistants testes, dont
// « Participer a l'accueil... » pour un benevolat dont la personne avait saisi ses vraies missions). Meme convention que les
// experiences professionnelles : « (periode) - Missions : ... », l'assistant sait deja la lire.
function _cvPeriodeProfil(dateDebut, dateFin) {
  return dateDebut ? (dateDebut + ' à ' + (dateFin || 'en cours')) : '';
}
function _cvProfilLignesExperiencesPerso(experiencesPerso) {
  return (experiencesPerso || []).map(function (e) {
    var periode = _cvPeriodeProfil(e.dateDebut, e.dateFin);
    var lieu = e.lieu ? e.lieu : '';
    var entreprise = e.entreprise ? e.entreprise : '';
    var parenthese = [entreprise, lieu, periode].filter(Boolean).join(', ');
    return '   . ' + e.intitule + (parenthese ? ' (' + parenthese + ')' : '') + (e.detail ? ' : ' + e.detail : '') +
      (e.missions ? ' - Missions : ' + e.missions : '');
  });
}
// Engagements : l'ancien format d'une seule ligne (« texte (periode), texte ») est CONSERVE tant qu'aucun engagement n'a de missions
// (aucun changement pour qui n'en a pas saisi) ; des qu'un engagement a des missions, liste a puces comme les experiences.
function _cvProfilEngagements(engagements) {
  var liste = (engagements || []).filter(Boolean);
  if (!liste.length) { return ''; }
  var periodeDe = function (e) { return (typeof e === 'string' || !e.dateDebut) ? '' : (' (' + e.dateDebut + (e.dateFin ? '-' + e.dateFin : ' - en cours') + ')'); };
  var aDesMissions = liste.some(function (e) { return typeof e !== 'string' && e.missions && String(e.missions).trim(); });
  if (!aDesMissions) {
    return '- Engagements : ' + liste.map(function (e) { return (typeof e === 'string') ? e : ((e.texte || '') + periodeDe(e)); }).filter(Boolean).join(', ') + String.fromCharCode(10);
  }
  return '- Engagements :' + String.fromCharCode(10) + liste.map(function (e) {
    if (typeof e === 'string') { return '   . ' + e; }
    return '   . ' + (e.texte || '') + periodeDe(e) + ((e.missions && String(e.missions).trim()) ? ' - Missions : ' + e.missions : '');
  }).join(String.fromCharCode(10)) + String.fromCharCode(10);
}

// LIM-4 (decision Denis 2026-09-29) : nombre de missions AFFICHEES par experience quand la personne n'a rien choisi. Un CV fourni
// (3 experiences ou plus) : 2 ; un CV plus mince : 3. C'est un point de depart, jamais un plafond : la personne peut afficher
// plus (boutons − / +, « Choisir »), et la mise en page automatique ne reduit que si le CV deborde. Source UNIQUE de cette regle
// (le panneau parent et l'iframe du PDF la lisent ici, plus de « 4 » ecrit en dur).
function _cvMissionsParDefaut(nombreExperiences) {
  return (typeof nombreExperiences === 'number' && nombreExperiences >= 3) ? 2 : 3;
}

// R8-3 (decision Denis 2026-09-29) : une experience personnelle reste TOUJOURS personnelle, sauf si la personne clique
// « Afficher dans l'expérience professionnelle » sur cette experience (jamais automatique). Elle passe alors dans les
// experiences professionnelles du CV (titre = intitule personnel, entreprise et lieu facultatifs) et disparait de la
// rubrique personnelle du CV (ni ligne, ni missions) ; dans le dossier elle reste dans le panneau des experiences
// personnelles. La date de debut est OBLIGATOIRE (sans elle l'experience reste personnelle). Fin vide = en cours.
// Source unique pour le PDF et le Word (le Word lit le rendu du PDF).
function _cvRepartirExperiencesPersonnelles(experiencesPro, experiencesPerso) {
  var pro = (experiencesPro || []).slice(), perso = [];
  (experiencesPerso || []).forEach(function (e) {
    if (e && e.remonteeEnPro === true && String(e.dateDebut || '').trim() && String(e.intitule || '').trim()) {
      pro.push({
        poste: e.intitule, entreprise: e.entreprise || '', lieu: e.lieu || '',
        dateDebut: e.dateDebut, dateFin: e.dateFin || '', missions: e.missions || '',
        contrat: '', competencesDemontrees: [], remonteeEnPro: true
      });
    } else {
      perso.push(e);
    }
  });
  return { experiences: pro, experiencesPersonnelles: perso };
}

function normaliserDonneesCV(dossierSource) {
  var brut = extraireDonneesCV(dossierSource);
  var repartition = _cvRepartirExperiencesPersonnelles(brut.experiences, brut.experiencesPersonnelles);

  return {
    meta: {
      version: 1,
      dateGeneration: new Date().toISOString(),
      modele: null
    },
    identite: brut.identite,
    // TACHE (photo optionnelle) : lit desormais dossier.photo (upload
    // + case "inclure" separee, voir contenuIdentite()/wireIdentite(),
    // js/app.js). "inclure" est un choix EXPLICITE et distinct du simple
    // fait d'avoir televerse une photo -- jamais d'inclusion automatique
    // (public sensible aux CV avec photo, retour utilisateur explicite).
    // Si "inclure" est faux, url reste null : les templates/generateurs
    // n'ont rien de special a gerer, le meme {{#if photo.url}} (ou
    // equivalent DOCX) continue de fonctionner tel quel.
    photo: {
      url: (dossierSource.photo && dossierSource.photo.inclure && dossierSource.photo.url) || null
    },
    objectifProfessionnel: brut.titreCV,
    // TACHE (demande) : deux champs distincts plutot qu'un seul "profil" --
    // profilUtilisateur permet a la personne de personnaliser son accroche
    // sans jamais perdre la proposition de l'IA.
    // TACHE (V2 IA, etape 1 : lien assistant IA -> moteur de rendu) :
    // profilIA est desormais alimente par dossier.ia.cv.profil (voir
    // docs/ARCHITECTURE_V2_IA.md), jamais par dossier.texteAmelioreCanva
    // (qui contient un CV entier, pas une accroche : detourner ce champ
    // creerait une confusion semantique durable). Lecture defensive :
    // dossier.ia reste TOUJOURS optionnel, son absence ne doit jamais faire
    // echouer la normalisation.
    profil: {
      profilIA: _cvAccrocheAffichee(dossierSource),
      profilUtilisateur: ''
    },
    // TACHE (V2 IA, etape 1) : exposes des maintenant dans l'objet CV
    // standardise (rien ne les affiche encore dans les templates existants
    // -- une future tache pourra les y ajouter -- mais le lien de bout en
    // bout dossier.ia -> objet CV est ainsi deja complet et verifiable).
    pointsForts: (dossierSource.ia && dossierSource.ia.cv && dossierSource.ia.cv.pointsForts) || [],
    motsCles: (dossierSource.ia && dossierSource.ia.cv && dossierSource.ia.cv.motsCles) || [],
    competences: brut.competences,
    experiences: _cvSansMissionsRedondantes(repartition.experiences),
    experiencesPersonnelles: repartition.experiencesPersonnelles,
    // TACHE (Tache 1 : formations en tableau) : "dossier" stocke desormais
    // un veritable tableau de formations (dossier.formations), plus besoin
    // d'envelopper artificiellement une valeur unique.
    // TACHE (retour utilisateur) : "Sans diplome" n'est jamais valorisant a
    // afficher sur un CV -- filtre uniquement ici (rendu CV), la donnee
    // reste intacte dans dossier.formations (toujours utilisee ailleurs :
    // Mon Projet, texteProfil()/IA).
    formations: (brut.formations || []).filter(function (f) { return f.niveau !== 'Sans diplôme'; }),
    certifications: brut.certifications,
    // TACHE (J3, 2026-09-28) : missions d'une certification captees a l'import d'un CV (extraction-cv.md)
    // -- dossier.certifications RESTE une liste de simples chaines (decision du 2026-09-26, voir
    // modules/cv-core/certifications.js), les missions vivent donc a part ici, sur un champ dossier
    // dedie et PERSISTANT (contrairement a reco.certificationsAvecMissions, qui ne vit que le temps
    // d'une reformulation IA -- voir moteurDecisionCV.js, qui fusionne les 2 sources).
    certificationsAvecMissions: dossierSource.certificationsAvecMissions || [],
    langues: brut.langues,
    permis: brut.permis,
    loisirs: brut.loisirs,
    competencesPersonnellesDecouverte: brut.competencesPersonnellesDecouverte,
    engagements: brut.engagements,
    logiciels: brut.logiciels,
    // Informations complementaires (texte libre : disponibilite, RQTH, mobilite...) captees a l'import : proposees au CV,
    // jamais affichees sans choix de la personne (case a cocher dans La mise en page).
    informationsComplementaires: (dossierSource.informationsNonClassees || []).filter(function (x) { return typeof x === 'string' && x.trim(); })
  };
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { _cvMemoriserRangAccroche: _cvMemoriserRangAccroche, _cvAjouterAccrochesAvecCourtes: _cvAjouterAccrochesAvecCourtes, _cvAccrocheAffichee: _cvAccrocheAffichee, _cvAccrocheCourteChoisie: _cvAccrocheCourteChoisie, _cvRangAccrocheChoisie: _cvRangAccrocheChoisie, _cvSansMissionsRedondantes: _cvSansMissionsRedondantes, _cvRepartirExperiencesPersonnelles: _cvRepartirExperiencesPersonnelles, _cvMissionsSimilaires: _cvMissionsSimilaires, _cvMissionsParDefaut: _cvMissionsParDefaut, _cvQualitesSimilaires: _cvQualitesSimilaires, _cvAssemblerParPriorite: _cvAssemblerParPriorite, _cvProfilLignesExperiencesPerso: _cvProfilLignesExperiencesPerso, _cvProfilEngagements: _cvProfilEngagements, _cvPeriodeProfil: _cvPeriodeProfil }; }
