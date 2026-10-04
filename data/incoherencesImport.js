/* ============================================================
   data/incoherencesImport.js  (2026-09-30, demande de Denis)
   ------------------------------------------------------------
   Détecteurs d'INCOHÉRENCES DE FORME dans un CV importé, communs à tous les parcours (fonctions pures, testées en Node) :
   - pointsDatesIncoherentes(experiences)   : dates d'expérience inversées ou lointaines => question à la personne ;
   - appliquerDatesPrecisees(objet, cible, reponse) : applique sa réponse (deux années) à l'expérience concernée ;
   - pointsCertificationsDansExperience(experiences) / appliquerCertificationPrecisee : une certification citée dans une expérience
                                              => question « obtenue pendant cette expérience ? » + année ;
   - reclasserRubriquesMalRangees(objet)    : un titre de rubrique pris pour un emploi, une attestation courte rangée dans
                                              « Formations » ou « Loisirs » => déplacé au bon endroit (sans rien perdre) ;
   - incoherencesDansTexte(texte)           : mêmes contrôles sur le TEXTE brut d'un CV (étape « Relire et masquer », partagée
                                              par tous les parcours qui reçoivent un CV).
   Règle d'or : le code ne devine jamais le sens. Il repère une forme anormale et pose la question ; la personne décide.
   Dépend de data/certificationsConnues.js (chargé avant).
   ============================================================ */

function _incNorm(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

function _incCertifs() {
  if (typeof suggestionCertificationConnue === 'function' && typeof estAttestationCourte === 'function') {
    return { suggerer: suggestionCertificationConnue, courte: estAttestationCourte };
  }
  if (typeof require === 'function') {
    var m = require('./certificationsConnues.js');
    return { suggerer: m.suggestionCertificationConnue, courte: m.estAttestationCourte };
  }
  return { suggerer: function () { return null; }, courte: function () { return false; } };
}

function _anneeDe(t) {
  var m = /(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/.exec(String(t || ''));
  return m ? parseInt(m[1], 10) : null;
}

// Dates d'expériences : fin avant le début, ou année lointaine (plus d'un an dans le futur).
function pointsDatesIncoherentes(experiences, pointsExistants, anneeCourante) {
  var courante = anneeCourante || new Date().getFullYear();
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (experiences || []).forEach(function (e) {
    if (!e || !e.poste) { return; }
    var yd = _anneeDe(e.dateDebut), yf = _anneeDe(e.dateFin);
    var inversee = !!(yd && yf && yf < yd);
    var lointaine = (yd && yd > courante + 1) || (yf && yf > courante + 1);
    if (!inversee && !lointaine) { return; }
    var extrait = String(e.poste).trim() + ' (' + (e.dateDebut || '') + ' - ' + (e.dateFin || '') + ')';
    if (deja.indexOf(_incNorm(extrait)) !== -1) { return; }
    deja.push(_incNorm(extrait));
    var consigne = 'Écrivez l’année de début puis l’année de fin (par exemple 2021 à 2024).';
    points.push({
      titre: 'Dates à vérifier',
      extrait: extrait,
      question: inversee
        ? 'Pour « ' + e.poste + ' », la fin (' + yf + ') est avant le début (' + yd + '). Quelles sont les bonnes années ? ' + consigne
        : 'Pour « ' + e.poste + ' », l’année ' + (yd > courante + 1 ? yd : yf) + ' semble lointaine. Quelles sont les bonnes années ? ' + consigne,
      suggestion: inversee ? (yf + ' à ' + yd) : '',
      cible: { type: 'dates', poste: String(e.poste), dateDebut: e.dateDebut || '', dateFin: e.dateFin || '' }
    });
  });
  return points;
}

// Réponse « 2021 à 2024 » : exactement deux années, sinon rien n'est modifié (la réponse reste dans les informations non classées).
function appliquerDatesPrecisees(objet, cible, reponse) {
  if (!objet || !cible || cible.type !== 'dates' || !Array.isArray(objet.experiences)) { return false; }
  var annees = String(reponse || '').match(/(?:19|20)\d{2}/g);
  if (!annees || annees.length !== 2) { return false; }
  var exp = null;
  objet.experiences.forEach(function (e) {
    if (!exp && e && _incNorm(e.poste) === _incNorm(cible.poste) && (e.dateDebut || '') === cible.dateDebut && (e.dateFin || '') === cible.dateFin) { exp = e; }
  });
  if (!exp) { return false; }
  var remplacer = function (ancienne, nouvelle) {
    var m = /(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/.exec(ancienne || '');
    return m ? String(ancienne).replace(m[1], nouvelle) : nouvelle;
  };
  exp.dateDebut = remplacer(exp.dateDebut, annees[0]);
  exp.dateFin = remplacer(exp.dateFin, annees[1]);
  return true;
}

// Certification citée DANS une expérience (retour Denis 2026-09-30) : elle a peut-être été obtenue pendant cette expérience, peut-être pas.
// Le code ne tranche jamais : il pose la question et demande l'année (toute certification doit avoir la sienne).
function _lignesMissions(e) {
  var m = e && e.missions;
  if (Array.isArray(m)) { return m.map(function (x) { return String(x || '').trim(); }).filter(Boolean); }
  return String(m || '').split(/\r?\n|•/).map(function (x) { return x.replace(/^[\s\-–—*]+/, '').trim(); }).filter(Boolean);
}
function _estLigneCertification(ligne) {
  var l = String(ligne || '').trim();
  if (!l || l.length > 90) { return false; }
  return _incCertifs().courte(l) || /^(?:certificat|certification|habilitation|attestation)\b/i.test(l);
}
function pointsCertificationsDansExperience(experiences, pointsExistants) {
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (experiences || []).forEach(function (e) {
    if (!e || !e.poste) { return; }
    _lignesMissions(e).forEach(function (ligne) {
      if (!_estLigneCertification(ligne)) { return; }
      var cle = _incNorm(e.poste + ' ' + ligne);
      if (deja.indexOf(cle) !== -1) { return; }
      deja.push(cle);
      points.push({
        titre: 'Certification à vérifier',
        extrait: ligne,
        question: 'Pour « ' + e.poste + ' », votre CV cite « ' + ligne + ' ». Cette certification a-t-elle été obtenue pendant cette expérience ? ' +
          'Répondez par exemple « Oui, 2022 » ou « Non, 2019 » (l’année d’obtention est importante).',
        suggestion: '',
        cible: { type: 'certifExperience', poste: String(e.poste), certification: ligne }
      });
    });
  });
  return points;
}

// Réponse « Oui, 2022 » / « Non, 2019 » : l'année est ajoutée à la certification (dans l'expérience si « oui », dans la rubrique Certifications
// si « non »). Sans année ni « oui / non » lisible, rien n'est modifié (la réponse reste dans les informations non classées).
function appliquerCertificationPrecisee(objet, cible, reponse) {
  if (!objet || !cible || cible.type !== 'certifExperience' || !Array.isArray(objet.experiences)) { return false; }
  var texte = String(reponse || '');
  var annee = (/(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/.exec(texte) || [])[1] || '';
  var non = /^\s*non\b/i.test(texte);
  var oui = /^\s*oui\b/i.test(texte);
  if (!annee && !non) { return false; }
  var exp = null;
  objet.experiences.forEach(function (e) { if (!exp && e && _incNorm(e.poste) === _incNorm(cible.poste)) { exp = e; } });
  if (!exp) { return false; }
  var intitule = String(cible.certification || '').trim();
  var avecAnnee = function (t) { return annee && !/(?:19|20)\d{2}/.test(t) ? (/\)\s*$/.test(t) ? t.replace(/\)\s*$/, ', ' + annee + ')') : t + ' (' + annee + ')') : t; };
  var certifDatee = avecAnnee(intitule);
  // 1. Dans l'expérience : la ligne reçoit son année (« oui » ou année seule) ou part (« non »).
  var remplacer = function (liste) {
    return liste.map(function (x) { return String(x).trim() === intitule ? (non ? null : certifDatee) : x; }).filter(function (x) { return x !== null; });
  };
  if (Array.isArray(exp.missions)) { exp.missions = remplacer(exp.missions); }
  else if (typeof exp.missions === 'string') {
    var lignes = [];
    exp.missions.split(/\r?\n/).forEach(function (x) {
      var m = /^([\s\-–—*•]*)(.*)$/.exec(x);
      if (m[2].trim() !== intitule) { lignes.push(x); } else if (!non) { lignes.push(m[1] + certifDatee); }
    });
    exp.missions = lignes.join('\n');
  }
  // 2. Rubrique Certifications : une seule entrée, avec l'année.
  if (!Array.isArray(objet.certifications)) { objet.certifications = []; }
  var cle = _incNorm(intitule);
  var trouve = -1;
  objet.certifications.forEach(function (c, i) { if (trouve === -1 && _incNorm(String(c).replace(/\s*\([^()]*\)\s*$/, '')) === cle) { trouve = i; } });
  if (trouve === -1) { if (non || oui || annee) { objet.certifications.push(certifDatee); } }
  else if (annee && !/(?:19|20)\d{2}/.test(String(objet.certifications[trouve]))) { objet.certifications[trouve] = avecAnnee(String(objet.certifications[trouve])); }
  return true;
}

// Certification rattachée à une formation (ou une expérience) : elle n'hérite JAMAIS de ses dates (retour Denis 2026-09-30, CV « Nicolas
// POIROT » : « Habilitation électrique » affichée avec « 2025-2026 », la période du titre professionnel, alors que le CV ne lui donne aucune
// date). Une période (« 2025-2026 ») identique à celle d'une formation ou d'une expérience est retirée de la certification, et la question
// de l'année d'obtention est posée. Une seule année n'est jamais touchée (elle peut être la vraie).
function _periodeDeuxAnnees(t) {
  var m = /((?:19|20)\d{2})\s*(?:-|–|—|à|au|\/)\s*((?:19|20)\d{2})/.exec(String(t || ''));
  return m ? m[1] + '-' + m[2] : '';
}
function retirerDatesHeriteesDesCertifications(jeux, pointsExistants) {
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (jeux || []).forEach(function (j) {
    if (!j || !Array.isArray(j.certifications)) { return; }
    var periodes = {};
    (j.formations || []).forEach(function (f) { var p = _periodeDeuxAnnees((f && f.annee) || ((f && f.dateDebut) + ' - ' + (f && f.dateFin))); if (p) { periodes[p] = true; } });
    (j.experiences || []).forEach(function (e) { var p = _periodeDeuxAnnees((e && e.dateDebut) + ' - ' + (e && e.dateFin)); if (p) { periodes[p] = true; } });
    j.certifications = j.certifications.map(function (c) {
      var t = String(c || '');
      var m = /\(([^()]*)\)\s*$/.exec(t);
      if (!m) { return c; }
      var parties = m[1].split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      var gardees = parties.filter(function (x) { var p = _periodeDeuxAnnees(x); return !(p && periodes[p] && /^[\s\d\-–—à/au]+$/.test(x)); });
      if (gardees.length === parties.length) { return c; }
      var nettoye = t.slice(0, m.index).trim() + (gardees.length ? ' (' + gardees.join(', ') + ')' : '');
      var cle = _incNorm(nettoye);
      if (deja.indexOf(cle) === -1) {
        deja.push(cle);
        points.push({
          titre: 'Année de certification',
          extrait: nettoye,
          question: 'Le CV ne donne pas de date pour « ' + t.slice(0, m.index).trim() + ' » : l’application a retiré celle de la formation. ' +
            'En quelle année l’avez-vous obtenue ? (Vous pouvez passer cette question.)',
          suggestion: '',
          cible: { type: 'certifAnnee', certification: nettoye }
        });
      }
      return nettoye;
    });
  });
  return points;
}
// Toute certification doit avoir son annee (retour Denis 2026-09-30, CV « Nicolas POIROT » : quatre certifications sans date, aucune
// question posee). Question pour chaque certification sans annee, jamais une date devinee ; la personne peut passer la question.
function pointsCertificationsSansAnnee(jeux, pointsExistants) {
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (jeux || []).forEach(function (j) {
    ((j && j.certifications) || []).forEach(function (c) {
      var t = String(typeof c === 'object' && c ? (c.intitule || c.texte || '') : (c || '')).trim();
      if (!t || typeof c !== 'string' || /(?:19|20)\d{2}/.test(t)) { return; }
      var cle = _incNorm(t);
      if (deja.indexOf(cle) !== -1) { return; }
      deja.push(cle);
      points.push({
        titre: 'Année de certification',
        extrait: t,
        question: 'Le CV ne donne pas l’année de « ' + t.replace(/\s*\([^()]*\)\s*$/, '') + ' ». En quelle année l’avez-vous obtenue ? (Vous pouvez passer cette question.)',
        suggestion: '',
        cible: { type: 'certifAnnee', certification: t }
      });
    });
  });
  return points;
}
// Annee(s) SUGGEREE(S) pour une certification sans annee (retour Denis 2026-09-30, CV « Nicolas POIROT » : les certifications sont rangees SOUS le
// titre professionnel dans le CV, donc obtenues pendant cette formation). Le code ne devine pas : il PROPOSE l'annee (ou les deux annees de la
// periode) de la formation sous forme de boutons, la personne choisit ou ecrit la bonne. texteSource = le texte du CV (sans lui, rien n'est propose).
function suggererAnneesCertifications(points, jeux, texteSource) {
  var texte = String(texteSource || '');
  if (!texte.trim()) { return points; }
  var formations = [];
  (jeux || []).forEach(function (j) { ((j && j.formations) || []).forEach(function (f) { if (f && f.intitule) { formations.push(f); } }); });
  if (!formations.length) { return points; }
  var lignes = texte.split(/\r?\n/);
  var norm = lignes.map(_incNorm);
  var anneesDe = function (t) {
    var r = String(t || '').match(/(?:19|20)\d{2}/g) || [];
    return r.filter(function (a, i) { return r.indexOf(a) === i; }).sort();
  };
  (points || []).forEach(function (p) {
    if (!p || !p.cible || p.cible.type !== 'certifAnnee' || (p.suggestions && p.suggestions.length)) { return; }
    var nom = _incNorm(String(p.cible.certification || '').replace(/\s*\([^()]*\)\s*$/, ''));
    if (nom.length < 4) { return; }
    var idx = -1;
    for (var i = 0; i < norm.length && idx === -1; i++) { if (norm[i].indexOf(nom) !== -1) { idx = i; } }
    if (idx === -1) { return; }
    for (var k = idx; k >= Math.max(0, idx - 4); k--) {
      var formation = null;
      formations.forEach(function (f) {
        var n = _incNorm(f.intitule);
        if (!formation && n.length >= 4 && norm[k].indexOf(n) !== -1) { formation = f; }
      });
      if (!formation) { continue; }
      // Entre la ligne de la formation et celle de la certification, aucune autre ligne datee : la certification est bien dans le meme bloc.
      var coupe = false;
      for (var m = k + 1; m <= idx; m++) { if (anneesDe(lignes[m]).length) { coupe = true; } }
      if (coupe) { break; }
      var annees = anneesDe([formation.annee, formation.dateDebut, formation.dateFin].join(' '));
      if (!annees.length) { annees = anneesDe(lignes[k]); }
      if (!annees.length) { break; }
      annees = annees.slice(0, 2);
      p.suggestions = annees;
      p.groupe = formation.intitule;   // les certifications rangees sous la meme formation peuvent recevoir la meme annee d'un seul clic
      p.question = 'Le CV ne donne pas l’année de « ' + String(p.cible.certification || '').replace(/\s*\([^()]*\)\s*$/, '') + ' », mais il la range sous « ' + formation.intitule +
        ' » (' + annees.join(' - ') + '). Est-ce l’année où vous l’avez obtenue ? Cliquez sur une année ci-dessous si c’est la bonne, sinon écrivez la vôtre. (Vous pouvez passer cette question.)';
      break;
    }
  });
  return points;
}
function appliquerAnneeCertification(objet, cible, reponse) {
  if (!objet || !cible || cible.type !== 'certifAnnee' || !Array.isArray(objet.certifications)) { return false; }
  var annee = (/(?:^|[^0-9])((?:19|20)\d{2})(?![0-9])/.exec(String(reponse || '')) || [])[1];
  if (!annee) { return false; }
  var i = objet.certifications.indexOf(cible.certification);
  if (i === -1) { return false; }
  var t = String(objet.certifications[i]);
  objet.certifications[i] = /\)\s*$/.test(t) ? t.replace(/\)\s*$/, ', ' + annee + ')') : t + ' (' + annee + ')';
  return true;
}

// Applique la réponse à un point précis (dates ou certification), selon son type.
function appliquerPrecisionCible(objet, cible, reponse) {
  if (cible && cible.type === 'certifExperience') { return appliquerCertificationPrecisee(objet, cible, reponse); }
  if (cible && cible.type === 'certifAnnee') { return appliquerAnneeCertification(objet, cible, reponse); }
  return appliquerDatesPrecisees(objet, cible, reponse);
}

// Qualités (savoir-être) écrites avec un code collé (« Rigueur NI », « Organisation A ») : abréviation de niveau probable. Question à la
// personne, suggestion = le mot seul. Jamais de correction automatique (on ne sait pas ce que « NI » veut dire pour elle).
function pointsQualitesDouteuses(listesDeQualites, pointsExistants) {
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (listesDeQualites || []).forEach(function (liste) {
    (liste || []).forEach(function (q) {
      var t = String(q || '').trim();
      var m = /^(\S.*?[A-Za-zÀ-ÿ]{3,})\s+([A-Z]{1,3})$/.exec(t);
      if (!m || deja.indexOf(_incNorm(t)) !== -1) { return; }
      deja.push(_incNorm(t));
      points.push({
        titre: 'Qualité à vérifier', extrait: t, suggestion: m[1],
        question: '« ' + t + ' » : « ' + m[2] + ' » ressemble à une abréviation (un niveau ?). Voulez-vous écrire seulement « ' + m[1] + ' » ?'
      });
    });
  });
  return points;
}

// Distance d'édition entre deux mots (insertion, retrait, remplacement d'une lettre), pour tolérer une faute de lecture d'image (« Gestlon » / « Gestion »).
function _distanceMots(a, b) {
  var prec = [], cour, i, j;
  for (j = 0; j <= b.length; j++) { prec[j] = j; }
  for (i = 1; i <= a.length; i++) {
    cour = [i];
    for (j = 1; j <= b.length; j++) {
      cour[j] = Math.min(prec[j] + 1, cour[j - 1] + 1, prec[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    }
    prec = cour;
  }
  return prec[b.length];
}

// Tous les mots de la qualité se retrouvent dans le texte source, à une ou deux lettres près (mot de 3 lettres ou moins : identique).
function _qualiteRetrouveeDansSource(cle, motsSource) {
  return cle.split(' ').every(function (mot) {
    var seuil = mot.length <= 3 ? 0 : (mot.length <= 7 ? 1 : 2);
    return motsSource.some(function (m) { return Math.abs(m.length - mot.length) <= seuil && _distanceMots(mot, m) <= seuil; });
  });
}

// Qualités renvoyées par l'assistant mais introuvables dans le texte du CV (ni dans ce que la personne a saisi) : question « la retirer ? ».
// Ne se déclenche que si le texte source est assez long pour comparer. Jamais de retrait automatique.
// Une faute de lecture d'image corrigée par l'assistant (« Gestlon du temps » devenu « Gestion du temps ») n'est pas une invention.
function pointsQualitesAbsentes(listesDeQualites, texteSource, pointsExistants) {
  var source = ' ' + _incNorm(texteSource) + ' ';
  if (source.length < 150) { return []; }
  var motsSource = source.trim().split(' ');
  var deja = (pointsExistants || []).map(function (p) { return _incNorm(p && p.extrait); });
  var points = [];
  (listesDeQualites || []).forEach(function (liste) {
    (liste || []).forEach(function (q) {
      var t = String(q || '').trim();
      var cle = _incNorm(t);
      if (!cle || source.indexOf(' ' + cle) !== -1 || deja.indexOf(cle) !== -1 || _qualiteRetrouveeDansSource(cle, motsSource)) { return; }
      deja.push(cle);
      points.push({ titre: 'Qualité à vérifier', extrait: t, suggestion: '', retirer: true, question: '« ' + t + ' » ne figure pas dans votre CV. Voulez-vous la retirer ?' });
    });
  });
  return points.slice(0, 3);
}

var _TITRES_RUBRIQUES = {
  loisirs: ['loisirs', 'loisir', 'centres d interet', 'centre d interet', 'centres d interets', 'loisirs et centres d interet', 'hobbies'],
  certifications: ['certifications', 'certification', 'habilitations', 'attestations'],
  logiciels: ['logiciels', 'informatique', 'outils informatiques', 'outils numeriques']
};

function _versListeTextes(v) {
  if (Array.isArray(v)) { return v.map(function (x) { return String(x || '').trim(); }).filter(Boolean); }
  return String(v || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean);
}
function _sansParenthese(t) { return String(t || '').replace(/\s*\([^()]*\)\s*$/, ''); }
// Ajoute sans doublon ; « SST » déjà présent et « SST (2024) » proposé => la version détaillée remplace la simple.
function _ajouterSansDoublon(liste, texte) {
  var cle = _incNorm(_sansParenthese(texte));
  if (!cle) { return; }
  for (var i = 0; i < liste.length; i++) {
    var existant = typeof liste[i] === 'string' ? liste[i] : (liste[i] && liste[i].texte);
    if (_incNorm(_sansParenthese(existant)) === cle) {
      if (typeof liste[i] === 'string' && String(texte).length > String(liste[i]).length && _sansParenthese(liste[i]) === String(liste[i])) { liste[i] = texte; }
      return;
    }
  }
  liste.push(texte);
}

// Modifie `objet` en place ({ experiences, formations, certifications, loisirs, logiciels }). Renvoie le nombre d'éléments déplacés.
function reclasserRubriquesMalRangees(objet) {
  if (!objet) { return 0; }
  var certifs = _incCertifs();
  var deplaces = 0;
  ['certifications', 'loisirs', 'logiciels'].forEach(function (k) { if (!Array.isArray(objet[k])) { objet[k] = []; } });
  // 1. Un titre de rubrique pris pour un emploi (sans entreprise ni date) : ses lignes rejoignent la bonne liste.
  if (Array.isArray(objet.experiences)) {
    objet.experiences = objet.experiences.filter(function (e) {
      if (!e) { return true; }
      var titre = _incNorm(e.poste);
      var cible = null;
      Object.keys(_TITRES_RUBRIQUES).forEach(function (k) { if (_TITRES_RUBRIQUES[k].indexOf(titre) !== -1) { cible = k; } });
      var entreprise = _incNorm(e.entreprise);
      if (!cible || (entreprise && entreprise !== titre) || e.dateDebut || e.dateFin) { return true; }
      _versListeTextes(e.missions).forEach(function (m) { _ajouterSansDoublon(objet[cible], m.replace(/[.\s]+$/, '')); });
      deplaces++;
      return false;
    });
  }
  // 2. Une attestation courte (SST, CACES, HACCP...) rangée dans « Formations » ou « Loisirs » va dans « Certifications ».
  if (Array.isArray(objet.formations)) {
    objet.formations = objet.formations.filter(function (f) {
      if (!f || !f.intitule || f.etablissement || !certifs.courte(f.intitule)) { return true; }
      _ajouterSansDoublon(objet.certifications, String(f.intitule).trim() + (f.annee ? ' (' + f.annee + ')' : ''));
      deplaces++;
      return false;
    });
  }
  objet.loisirs = objet.loisirs.filter(function (l) {
    if (typeof l !== 'string' || !certifs.courte(l)) { return true; }
    _ajouterSansDoublon(objet.certifications, l.trim());
    deplaces++;
    return false;
  });
  return deplaces;
}

// Contrôles sur le texte brut d'un CV. Chaque résultat : { type, trouve, suggestion, message } ; `trouve` est le passage exact à remplacer.
// Qualités courantes (savoir-être) : servent à reconnaître une ligne comme « Rigueur NI » sans jamais toucher à un intitulé inconnu.
// L'appelant peut ajouter celles du référentiel de l'application (categorieCompetence, data/competences.js).
var QUALITES_USUELLES = ['Rigueur', 'Créativité', 'Organisation', 'Écoute', 'Bienveillance', 'Gestion du temps', 'Autonomie', 'Adaptabilité',
  'Curiosité', 'Dynamisme', 'Ponctualité', 'Polyvalence', 'Réactivité', 'Sérieux', 'Motivation', 'Discrétion', 'Persévérance', 'Initiative',
  'Fiabilité', 'Patience', 'Empathie', 'Sens du contact', "Sens de l'organisation", "Esprit d'équipe", 'Travail en équipe', 'Politesse', 'Courtoisie'];

function incoherencesDansTexte(texte, anneeCourante, qualitesSupplementaires) {
  var t = String(texte || '');
  var courante = anneeCourante || new Date().getFullYear();
  var certifs = _incCertifs();
  var resultats = [];
  var vus = {};
  var ajouter = function (r) { if (!vus[r.trouve]) { vus[r.trouve] = true; resultats.push(r); } };
  // Certification à l'écriture irrégulière mais proche d'un intitulé connu (« sSsT » => « SST »).
  var motRegex = /(?<![A-Za-zÀ-ÿ0-9])[A-Za-zÀ-ÿ]{3,8}(?![A-Za-zÀ-ÿ0-9])/g;
  var m;
  while ((m = motRegex.exec(t)) !== null) {
    if (!/[a-zà-ÿ][A-ZÀ-Ý]/.test(m[0])) { continue; }
    var sug = certifs.suggerer(m[0]);
    if (sug) {
      ajouter({ type: 'certification', trouve: m[0], suggestion: sug, message: '« ' + m[0] + ' » : vouliez-vous dire « ' + sug + ' » ?' });
    }
  }
  // Qualité suivie d'un code parasite de lecture (« Rigueur NI », « Organisation A ») : ligne courte, mot connu, 1 à 3 majuscules.
  var connues = {};
  QUALITES_USUELLES.concat(qualitesSupplementaires || []).forEach(function (q) { connues[_incNorm(q)] = true; });
  t.split(/\r?\n/).forEach(function (ligne) {
    var l = ligne.trim();
    var q = /^(\S.*?[A-Za-zÀ-ÿ]{3,})\s+([A-Z]{1,3})$/.exec(l);
    if (l.length <= 45 && q && connues[_incNorm(q[1])]) {
      ajouter({ type: 'qualite', trouve: l, suggestion: q[1], message: '« ' + l + ' » : « ' + q[2] + ' » semble un parasite de lecture. Vouliez-vous dire « ' + q[1] + ' » ?' });
    }
  });
  // Période dont la fin est avant le début (« 2024 - 2021 »), ou dont une année est lointaine.
  var periode = /((?:0?[1-9]|1[0-2])[\/.])?((?:19|20)\d{2})(\s*(?:-|–|—|à|au|jusqu['’]à)\s*)((?:0?[1-9]|1[0-2])[\/.])?((?:19|20)\d{2})(?![0-9])/g;
  while ((m = periode.exec(t)) !== null) {
    var y1 = parseInt(m[2], 10), y2 = parseInt(m[5], 10);
    if (y2 < y1) {
      var corrige = (m[4] || '') + m[5] + m[3] + (m[1] || '') + m[2];
      ajouter({ type: 'dates', trouve: m[0], suggestion: corrige, message: '« ' + m[0] + ' » : la fin est avant le début. Vouliez-vous dire « ' + corrige + ' » ?' });
    } else if (y1 > courante + 1 || y2 > courante + 1) {
      ajouter({ type: 'dates', trouve: m[0], suggestion: '', message: '« ' + m[0] + ' » : une de ces années semble lointaine. Est-ce bien la bonne ?' });
    }
  }
  return resultats.slice(0, 6);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    pointsDatesIncoherentes: pointsDatesIncoherentes,
    pointsQualitesDouteuses: pointsQualitesDouteuses,
    pointsQualitesAbsentes: pointsQualitesAbsentes,
    appliquerDatesPrecisees: appliquerDatesPrecisees,
    pointsCertificationsDansExperience: pointsCertificationsDansExperience,
    appliquerCertificationPrecisee: appliquerCertificationPrecisee,
    appliquerPrecisionCible: appliquerPrecisionCible,
    retirerDatesHeriteesDesCertifications: retirerDatesHeriteesDesCertifications,
    pointsCertificationsSansAnnee: pointsCertificationsSansAnnee,
    suggererAnneesCertifications: suggererAnneesCertifications,
    reclasserRubriquesMalRangees: reclasserRubriquesMalRangees,
    incoherencesDansTexte: incoherencesDansTexte
  };
}
