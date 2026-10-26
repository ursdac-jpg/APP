/* ============================================================
   modules/synthese-assistant/logique.js
   ------------------------------------------------------------
   Page « Synthèse » qui précède « Choisir mon assistant » dans « Écrire ma lettre avec l'assistant » et « M'entraîner à un entretien » (maquette validée par Denis le
   25/10/2026 : docs/MAQUETTE_SYNTHESE_AVANT_ASSISTANT_2026-10-25.html). Fonctions pures : elles transforment les données du dossier en lignes lisibles ; l'affichage est
   dans data/metiers.js (htmlSyntheseAvantAssistant). Testées en Node (tests/syntheseAssistant.test.js).
   ============================================================ */

function _synNettoyer(t) { return String(t == null ? '' : t).replace(/\s+/g, ' ').trim(); }

// Dates d'une expérience : « 2021 à 2024 » ; une seule année si l'autre manque ; vide sinon.
function periodeExperienceSynthese(exp) {
  function annee(d) { var m = String(d || '').match(/(19|20)\d{2}/); return m ? m[0] : ''; }
  var a = annee(exp && exp.dateDebut), b = annee(exp && exp.dateFin);
  if (a && b) { return a === b ? a : a + ' à ' + b; }
  return a || b || '';
}

// Ce que la personne voit pour son CV : l'intitulé et trois expériences au plus, de quoi reconnaître son CV d'un coup d'œil.
// Le texte du CV déposé dans le module fait foi (jamais les données d'un autre CV restées dans le dossier) : l'intitulé est la première ligne utile, les expériences sont
// les premières lignes qui portent une année. Sans texte (CV déjà lu et rangé dans le dossier), on prend les expériences structurées.
function resumeCvSynthese(opts) {
  var o = opts || {};
  var texte = String(o.texteCv || '');
  if (_synNettoyer(texte)) {
    var lignes = texte.split(/\r?\n/).map(_synNettoyer).filter(function (l) { return l.length > 3; });
    var datees = lignes.filter(function (l) { return /(19|20)\d{2}/.test(l) && l.length > 8 && !/n[ée]e?\s+le|date de naissance/i.test(l); });
    var intitule = (lignes.filter(function (l) { return !/@|\d{2}[ .]\d{2}[ .]\d{2}/.test(l); })[0] || '').slice(0, 80);
    return { intitule: intitule, experiences: datees.slice(0, 3).map(function (l) { return l.slice(0, 90); }) };
  }
  var titre = _synNettoyer(o.titreCV) || _synNettoyer(o.metierCible);
  var experiences = (Array.isArray(o.experiences) ? o.experiences : []).filter(function (e) { return e && (_synNettoyer(e.poste) || _synNettoyer(e.entreprise)); })
    .slice(0, 3).map(function (e) {
      var tete = [_synNettoyer(e.poste), _synNettoyer(e.entreprise)].filter(Boolean).join(' · ');
      var p = periodeExperienceSynthese(e);
      return p ? tete + ' (' + p + ')' : tete;
    });
  return { intitule: titre, experiences: experiences };
}

// Résumé plus complet du CV, à partir des informations déjà lues par l'assistant (« lecture du CV » de la version rapide) : plusieurs lignes qui disent de quoi parle le CV
// (retour de Denis, 25/10/2026 : valorisant, et on voit d'un coup d'œil que tout est là). d = dossier (titreCV, experiences, formations, competences, langues, certifications, permis).
function lignesResumeCvStructureSynthese(d) {
  var x = d || {};
  var lignes = [];
  function liste(a) { return Array.isArray(a) ? a : []; }
  var titre = _synNettoyer(x.titreCV);
  if (titre) { lignes.push({ libelle: 'Métier', valeur: titre }); }
  var exps = liste(x.experiences).filter(function (e) { return e && (_synNettoyer(e.poste) || _synNettoyer(e.entreprise)); });
  if (exps.length) {
    var det = exps.slice(0, 4).map(function (e) {
      var tete = [_synNettoyer(e.poste), _synNettoyer(e.entreprise)].filter(Boolean).join(' chez ');
      var p = periodeExperienceSynthese(e);
      return p ? tete + ' (' + p + ')' : tete;
    });
    lignes.push({ libelle: exps.length + (exps.length > 1 ? ' expériences' : ' expérience'), valeur: det.join(' ; ') + (exps.length > 4 ? ' ; …' : '') });
  }
  var forms = liste(x.formations).filter(function (f) { return f && _synNettoyer(f.intitule); });
  if (forms.length) {
    lignes.push({ libelle: forms.length > 1 ? 'Formations' : 'Formation', valeur: forms.slice(0, 3).map(function (f) { var a = _synNettoyer(f.annee); return _synNettoyer(f.intitule) + (a ? ' (' + a + ')' : ''); }).join(' ; ') });
  }
  var comp = x.competences || {};
  var cles = liste(comp.savoirFaire).concat(liste(comp.savoirEtre)).map(_synNettoyer).filter(Boolean);
  if (cles.length) { lignes.push({ libelle: 'Compétences', valeur: cles.slice(0, 6).join(', ') + (cles.length > 6 ? ', …' : '') }); }
  var certifs = liste(x.certifications).map(_synNettoyer).filter(Boolean);
  if (certifs.length) { lignes.push({ libelle: 'Certifications', valeur: certifs.slice(0, 4).join(', ') }); }
  var langues = liste(x.langues).filter(function (l) { return l && _synNettoyer(l.langue); }).map(function (l) { return _synNettoyer(l.langue) + (_synNettoyer(l.niveau) ? ' (' + _synNettoyer(l.niveau) + ')' : ''); });
  if (langues.length) { lignes.push({ libelle: 'Langues', valeur: langues.join(', ') }); }
  var cats = x.permis && x.permis.possede ? liste(x.permis.categories).map(_synNettoyer).filter(Boolean) : [];
  if (x.permis && x.permis.possede) { lignes.push({ libelle: 'Permis', valeur: cats.length ? 'catégorie ' + cats.join(', ') : 'oui' }); }
  return lignes;
}

// Ligne d'identification de la lettre de motivation déposée : son objet si on le trouve, sinon sa première ligne utile.
function objetLettreSynthese(texte) {
  var lignes = String(texte || '').split(/\r?\n/).map(_synNettoyer).filter(Boolean);
  for (var i = 0; i < lignes.length; i++) {
    var m = lignes[i].match(/^(?:objet|object)\s*:?\s*(.+)$/i);
    if (m && m[1]) { return m[1].slice(0, 100); }
  }
  var utile = lignes.filter(function (l) { return !/^(madame|monsieur|bonjour|à l.attention)/i.test(l) && l.length > 8; })[0] || '';
  return utile.slice(0, 100);
}

// Les « jetons » de la candidature : tout ce que la personne a choisi dans la page « Préparer » (type de candidature, métier ou domaine, entreprise, offre...).
// o : { libelleObjectif, metierCible, secteurLibelle, intituleDomaine, entreprise, lienOffre, texteOffre, typeStructure, civiliteRecruteur, nomRecruteur, disponibilite }
function jetonsCandidatureSynthese(o) {
  var j = [];
  function ajouter(lib, val) { var v = _synNettoyer(val); if (v) { j.push(lib + ' : ' + v); } }
  var x = o || {};
  ajouter('Type', x.libelleObjectif);
  ajouter('Métier visé', x.metierCible);
  ajouter('Domaine', x.secteurLibelle);
  ajouter('Intitulé', x.intituleDomaine);
  ajouter('Entreprise', x.entreprise);
  ajouter('Structure', x.typeStructure);
  var offre = _synNettoyer(x.texteOffre) ? _synNettoyer(x.texteOffre).slice(0, 70) + (_synNettoyer(x.texteOffre).length > 70 ? '…' : '') : _synNettoyer(x.lienOffre);
  ajouter('Offre', offre);
  ajouter('Destinataire', [x.civiliteRecruteur, x.nomRecruteur].map(_synNettoyer).filter(Boolean).join(' '));
  ajouter('Disponibilité', x.disponibilite);
  return j;
}

// Les « jetons » des choix d'écriture : une phrase courte par réglage renseigné. groupes = GROUPES_STYLE_CV, prefs = préférences du document, defauts = STYLE_CV_DEFAUTS.
function jetonsChoixSynthese(prefs, groupes, defauts, situationLibelle) {
  var p = prefs || {}, d = defauts || {};
  var abreges = { niveauPoste: 'Niveau du poste', niveauLangage: 'Langage', adaptationMetier: 'Vocabulaire', ton: 'Ton', longueur: 'Longueur' };
  var j = [];
  (groupes || []).forEach(function (g) {
    var v = p[g.champ] || d[g.champ];
    var nom = abreges[g.champ] || g.titre;
    if (!v) { j.push(nom + ' : à choisir'); return; }   // tous les choix se voient, y compris celui qui reste à faire (niveau du poste)
    var opt = (g.options || []).filter(function (o) { return o[0] === v; })[0];
    if (opt) { j.push(nom + ' : ' + opt[1].toLowerCase()); }
  });
  j.push(_synNettoyer(situationLibelle) ? 'Situation : ' + _synNettoyer(situationLibelle).toLowerCase() : 'Situation : à indiquer');
  return j;
}

// Une lettre de recommandation ajoutée : « Lettre d'un ancien employeur (1 page) » ; le nom du signataire n'est jamais repris ici.
function descriptionAppuiSynthese(reco) {
  if (!reco) { return ''; }
  var role = _synNettoyer(reco.role);
  var mots = _synNettoyer(reco.texte).split(' ').filter(Boolean).length;
  var taille = mots ? (mots < 150 ? 'lettre courte' : 'une page environ') : '';
  return ['Lettre de recommandation', role ? '(' + role.toLowerCase() + ')' : '', taille ? ': ' + taille : ''].filter(Boolean).join(' ').replace(' :', ' :');
}

if (typeof module !== 'undefined') {
  module.exports = {
    periodeExperienceSynthese: periodeExperienceSynthese,
    resumeCvSynthese: resumeCvSynthese,
    objetLettreSynthese: objetLettreSynthese,
    lignesResumeCvStructureSynthese: lignesResumeCvStructureSynthese,
    jetonsCandidatureSynthese: jetonsCandidatureSynthese,
    jetonsChoixSynthese: jetonsChoixSynthese,
    descriptionAppuiSynthese: descriptionAppuiSynthese
  };
}
