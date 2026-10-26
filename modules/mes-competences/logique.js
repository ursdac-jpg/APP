/* ============================================================
   modules/mes-competences/logique.js
   Module « Découvrir mes compétences » : LOGIQUE PURE (aucun accès au navigateur, aucun accès au dossier) :
   documents déposés, message à copier, lecture de la réponse (par le filet de sécurité, filet.js), second passage « lignes seules »,
   état du module (relecture, gestes), document « Mes compétences ». Testée (tests/mesCompetencesLogique.test.js).
   Conception : docs/CHANTIER_DECOUVRIR_MES_COMPETENCES_2026-10-26.md, audit : docs/AUDIT_FINAL_DECOUVRIR_MES_COMPETENCES_2026-10-26.md.
   Chargé comme script classique : noms préfixés MESCOMP_ / mesComp, jamais un nom qui en heurte un autre.
   ============================================================ */

var _mesCompFilet = (typeof module !== 'undefined' && module.exports && typeof require === 'function') ? require('./filet.js') : MesCompFilet;

// ---------- Constantes ----------

// Ordre fixe des documents dans le message : c'est lui qui donne le numéro « DOCUMENT n » que les preuves citent.
var MESCOMP_TYPES = [
  { id: 'cv', titre: 'CV', max: 3, source: 'Mon CV' },
  { id: 'lettreMotivation', titre: 'LETTRE DE MOTIVATION', max: 2, source: 'Ma lettre de motivation' },
  { id: 'recommandation', titre: 'LETTRE DE RECOMMANDATION (écrite par une autre personne)', max: 3, source: 'Ma lettre de recommandation' }
];
var MESCOMP_NIVEAUX = {
  execution: 'Ouvrier ou employé (niveau exécution)',
  technicien: 'Technicien ou agent de maîtrise',
  cadre: 'Cadre ou direction'
};
var MESCOMP_FAMILLES = [
  { id: 'savoirFaire', titre: 'Ce que je sais faire' },
  { id: 'savoirs', titre: 'Ce que je connais' },
  { id: 'savoirEtre', titre: 'Ma façon de travailler' }
];
var MESCOMP_TITRE_ENVIES = 'Ce qui me donne envie';
var MESCOMP_SOURCES = { cv: 'Mon CV', lettreMotivation: 'Ma lettre de motivation', recommandation: 'Ma lettre de recommandation', reponse: 'Ma réponse' };
var MESCOMP_PLAFOND_CARACTERES = 45000;   // taille du message à copier : au-delà, on demande de retirer un document (précédent : lettre-co.md, 56 000)
var MESCOMP_RANG_CONFIRMATION = { confirmee: 0, relevee: 1, aPreciser: 2 };

function _mesCompTexte(v) { return String(v === undefined || v === null ? '' : v); }
function _mesCompTypeInfo(type) { return MESCOMP_TYPES.filter(function (t) { return t.id === type; })[0] || null; }

// ---------- Documents déposés ----------

// Un document = { id, type, texte }. Les textes sont déjà relus et masqués par la personne (fenêtre commune de dépôt).
function mesCompNouvelIdDocument(liste) {
  return (Array.isArray(liste) ? liste : []).reduce(function (m, d) { return Math.max(m, d && d.id ? d.id : 0); }, 0) + 1;
}
function mesCompDocumentsCompter(liste) {
  var c = { cv: 0, lettreMotivation: 0, recommandation: 0, total: 0 };
  (Array.isArray(liste) ? liste : []).forEach(function (d) { if (d && c[d.type] !== undefined) { c[d.type]++; c.total++; } });
  return c;
}
function mesCompPlaceDisponible(liste, type) {
  var info = _mesCompTypeInfo(type);
  return !!info && mesCompDocumentsCompter(liste)[type] < info.max;
}
// Renvoie { liste, ajoute, raison } : raison = '' | 'type' | 'vide' | 'plein'. La liste d'origine n'est jamais modifiée.
function mesCompDocumentsAjouter(liste, type, texte) {
  var l = (Array.isArray(liste) ? liste : []).slice();
  var t = _mesCompTexte(texte).trim();
  if (!_mesCompTypeInfo(type)) { return { liste: l, ajoute: false, raison: 'type' }; }
  if (!t) { return { liste: l, ajoute: false, raison: 'vide' }; }
  if (!mesCompPlaceDisponible(l, type)) { return { liste: l, ajoute: false, raison: 'plein' }; }
  l.push({ id: mesCompNouvelIdDocument(l), type: type, texte: t });
  return { liste: l, ajoute: true, raison: '' };
}
function mesCompDocumentsRetirer(liste, id) {
  return (Array.isArray(liste) ? liste : []).filter(function (d) { return d.id !== id; });
}
// Les documents dans l'ordre d'envoi (CV, puis lettres de motivation, puis recommandations ; l'ordre de dépôt à l'intérieur d'un type).
function mesCompDocumentsPourEnvoi(liste) {
  var res = [];
  MESCOMP_TYPES.forEach(function (t) {
    (Array.isArray(liste) ? liste : []).forEach(function (d) { if (d && d.type === t.id && _mesCompTexte(d.texte).trim()) { res.push({ type: d.type, texte: _mesCompTexte(d.texte).trim() }); } });
  });
  return res;
}
function mesCompRaisonBlocageDocuments(liste) {
  return mesCompDocumentsCompter(liste).total ? '' : 'Déposez au moins un document pour continuer.';
}

// ---------- Message à copier ----------

// Le prompt envoyé ne porte pas l'historique des versions (lignes « ### VERSION ... ») : c'est une note de travail, pas une consigne.
function mesCompNettoyerPrompt(texte) {
  return _mesCompTexte(texte).split('\n').filter(function (l) { return !/^###\s*VERSION\b/.test(l); }).join('\n').replace(/\n{3,}/g, '\n\n');
}
function _mesCompSectionsDocuments(documents) {
  return (Array.isArray(documents) ? documents : []).map(function (d, i) {
    var info = _mesCompTypeInfo(d.type);
    return 'DOCUMENT ' + (i + 1) + ' - ' + (info ? info.titre : _mesCompTexte(d.type).toUpperCase()) + '\n\n' + _mesCompTexte(d.texte).trim() + '\n';
  }).join('\n');
}
function _mesCompSectionNiveau(niveau) {
  return MESCOMP_NIVEAUX[niveau] ? '\nNIVEAU DU POSTE CHOISI PAR LA PERSONNE\n\n' + MESCOMP_NIVEAUX[niveau] + '\n' : '';
}
// promptPret : le texte de prompts/mes-competences.md, déjà nettoyé, voix humaine déjà insérée par l'application.
// documents : [{ type, texte }] dans l'ordre d'envoi. niveau : 'auto' (l'outil propose) ou execution / technicien / cadre.
function mesCompConstruireMessage(promptPret, documents, niveau) {
  return _mesCompTexte(promptPret).trimEnd() + '\n\n' + _mesCompSectionsDocuments(documents) + _mesCompSectionNiveau(niveau);
}
// Une compétence à préciser, sous la forme que le prompt décrit.
function mesCompLigneVersSchema(ligne) {
  return {
    libelle: ligne.libelle, famille: ligne.famille, enMotsSimples: ligne.enMotsSimples || '', preuves: ligne.preuves || [],
    confirmation: 'aPreciser', pourLeCV: '', pourLOral: '', pourPreparer: '', synonymes: [], question: ligne.question || ''
  };
}
// « Question sur « libellé » : question / Réponse : texte » pour chaque ligne répondue (reponses : { idLigne: texte }).
function mesCompFormaterReponses(lignes, reponses) {
  return (Array.isArray(lignes) ? lignes : []).filter(function (l) { return _mesCompTexte(reponses && reponses[l.id]).trim(); }).map(function (l) {
    return 'Question sur « ' + l.libelle + ' » : ' + (l.question || '') + '\nRéponse : ' + _mesCompTexte(reponses[l.id]).trim();
  }).join('\n\n');
}
// Second passage « lignes seules » : l'assistant ne reçoit que les lignes qui avaient une question (au format du prompt), jamais la liste entière.
function mesCompConstruireMessageSecondPassage(promptPret, documents, niveau, lignesSchema, reponsesTexte) {
  return mesCompConstruireMessage(promptPret, documents, niveau) +
    '\nCOMPÉTENCES À PRÉCISER\n\n```json\n' + JSON.stringify(lignesSchema, null, 2) + '\n```\n' +
    '\nRÉPONSES DE LA PERSONNE AUX QUESTIONS DE PRÉCISION\n\n' + _mesCompTexte(reponsesTexte).trim() + '\n';
}
function mesCompMessageTropLong(message) { return _mesCompTexte(message).length > MESCOMP_PLAFOND_CARACTERES; }

// ---------- État du module ----------

function mesCompEtatInitial() {
  return {
    version: 1, ecran: 'documents', documents: [], niveau: 'auto', lignes: [], envies: [],
    niveauPropose: null, niveauIndices: '', nbEcartees: 0, reponses: {}, prochainId: 1,
    options: { preuves: true, oral: true, nom: false, nomTexte: '' }, passages: {}, termine: false
  };
}
function _mesCompListeObjets(v) { return (Array.isArray(v) ? v : []).filter(function (x) { return x && typeof x === 'object'; }); }
// Remet en forme un état relu de la disquette (ou null) : jamais d'exception, jamais un champ manquant.
function mesCompNormaliserEtat(brut) {
  var e = mesCompEtatInitial();
  if (!brut || typeof brut !== 'object') { return e; }
  e.ecran = ['documents', 'assistant', 'relecture', 'document'].indexOf(brut.ecran) >= 0 ? brut.ecran : 'documents';
  e.documents = _mesCompListeObjets(brut.documents).filter(function (d) { return _mesCompTypeInfo(d.type) && _mesCompTexte(d.texte).trim(); })
    .map(function (d, i) { return { id: typeof d.id === 'number' ? d.id : i + 1, type: d.type, texte: _mesCompTexte(d.texte) }; });
  e.niveau = (MESCOMP_NIVEAUX[brut.niveau] || brut.niveau === 'auto') ? brut.niveau : 'auto';
  e.lignes = _mesCompListeObjets(brut.lignes).map(_mesCompNormaliserLigne).filter(function (l) { return l.libelle; });
  e.envies = _mesCompListeObjets(brut.envies).map(function (x, j) {
    return { id: _mesCompTexte(x.id) || 'e' + (j + 1), libelle: _mesCompTexte(x.libelle), extrait: _mesCompTexte(x.extrait), typeDocument: _mesCompTexte(x.typeDocument), numeroDocument: typeof x.numeroDocument === 'number' ? x.numeroDocument : 0, geste: ['ok', 'non'].indexOf(x.geste) >= 0 ? x.geste : '' };
  }).filter(function (x) { return x.libelle; });
  e.niveauPropose = MESCOMP_NIVEAUX[brut.niveauPropose] ? brut.niveauPropose : null;
  e.niveauIndices = _mesCompTexte(brut.niveauIndices);
  e.nbEcartees = typeof brut.nbEcartees === 'number' ? brut.nbEcartees : 0;
  e.reponses = {};
  if (brut.reponses && typeof brut.reponses === 'object') { Object.keys(brut.reponses).forEach(function (k) { e.reponses[k] = _mesCompTexte(brut.reponses[k]); }); }
  e.prochainId = typeof brut.prochainId === 'number' && brut.prochainId > 0 ? brut.prochainId : e.lignes.length + 1;
  if (brut.options && typeof brut.options === 'object') {
    e.options = { preuves: brut.options.preuves !== false, oral: brut.options.oral !== false, nom: !!brut.options.nom, nomTexte: _mesCompTexte(brut.options.nomTexte) };
  }
  e.passages = (brut.passages && typeof brut.passages === 'object') ? JSON.parse(JSON.stringify(brut.passages)) : {};
  e.termine = !!brut.termine;
  return e;
}
function _mesCompNormaliserLigne(c) {
  return {
    id: _mesCompTexte(c.id), famille: _mesCompFilet.FAMILLES.indexOf(c.famille) >= 0 ? c.famille : 'savoirFaire',
    libelle: _mesCompTexte(c.libelle).trim(), enMotsSimples: _mesCompTexte(c.enMotsSimples),
    preuves: _mesCompListeObjets(c.preuves).map(function (p) { return { typeDocument: _mesCompTexte(p.typeDocument), numeroDocument: typeof p.numeroDocument === 'number' ? p.numeroDocument : 0, extrait: _mesCompTexte(p.extrait) }; }),
    confirmation: _mesCompFilet.CONFIRMATIONS.indexOf(c.confirmation) >= 0 ? c.confirmation : 'relevee',
    pourLeCV: _mesCompTexte(c.pourLeCV), pourLOral: _mesCompTexte(c.pourLOral), pourPreparer: _mesCompTexte(c.pourPreparer),
    synonymes: (Array.isArray(c.synonymes) ? c.synonymes : []).map(_mesCompTexte), question: _mesCompTexte(c.question),
    geste: ['ok', 'part', 'non'].indexOf(c.geste) >= 0 ? c.geste : '', texteCorrige: _mesCompTexte(c.texteCorrige),
    passee: !!c.passee, retrogradee: !!c.retrogradee
  };
}
function _mesCompLigneDepuisReponse(c, id, retrogradee) {
  return _mesCompNormaliserLigne(Object.assign({}, c, { id: id, geste: '', texteCorrige: '', passee: false, retrogradee: !!retrogradee }));
}

// Premier passage : remplace les lignes par celles que le filet garde. `filtre` = résultat de filtrerReponse (ok). Renvoie un NOUVEL état.
function mesCompIntegrerPremierPassage(etat, filtre) {
  var e = mesCompNormaliserEtat(JSON.parse(JSON.stringify(etat || mesCompEtatInitial())));
  if (!filtre || !filtre.ok) { return e; }
  var tri = (filtre.competences || []).map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) {
    var ra = MESCOMP_RANG_CONFIRMATION[a.c.confirmation], rb = MESCOMP_RANG_CONFIRMATION[b.c.confirmation];
    return (ra === rb) ? a.i - b.i : ra - rb;
  });
  var id = 1;
  e.lignes = tri.map(function (x) { return _mesCompLigneDepuisReponse(x.c, 'c' + (id++), (filtre.retrogradees || []).indexOf(x.c.libelle) >= 0); });
  e.envies = (filtre.motivations || []).map(function (m, j) {
    var p = m.preuve || {};
    return { id: 'e' + (j + 1), libelle: _mesCompTexte(m.libelle), extrait: _mesCompTexte(p.extrait), typeDocument: _mesCompTexte(p.typeDocument), numeroDocument: typeof p.numeroDocument === 'number' ? p.numeroDocument : 0, geste: '' };
  });
  e.prochainId = id;
  e.niveauPropose = filtre.niveauPoste || null;
  e.niveauIndices = filtre.niveauPosteIndices || '';
  e.nbEcartees = (filtre.ecartees || []).length + (filtre.motivationsEcartees || []).length;
  e.reponses = {};
  e.termine = false;
  e.ecran = 'relecture';
  return e;
}

// Les lignes qui attendent une réponse : « à préciser », ni passées ni déjà répondues vides.
function mesCompLignesAPreciser(etat) {
  return (etat && Array.isArray(etat.lignes) ? etat.lignes : []).filter(function (l) { return l.confirmation === 'aPreciser' && !l.passee; });
}
function mesCompPoserReponse(etat, idLigne, texte) {
  var e = JSON.parse(JSON.stringify(etat));
  e.reponses = e.reponses || {};
  var t = _mesCompTexte(texte).trim();
  if (t) { e.reponses[idLigne] = t; } else { delete e.reponses[idLigne]; }
  return e;
}
function mesCompPasserLigne(etat, idLigne) {
  var e = JSON.parse(JSON.stringify(etat));
  e.lignes.forEach(function (l) { if (l.id === idLigne) { l.passee = true; } });
  return e;
}
// Les lignes répondues, prêtes à partir au second passage : { lignesSchema, reponsesTexte, libelles }. null s'il n'y en a aucune.
function mesCompPreparerSecondPassage(etat) {
  var repondues = mesCompLignesAPreciser(etat).filter(function (l) { return _mesCompTexte(etat.reponses && etat.reponses[l.id]).trim(); });
  if (!repondues.length) { return null; }
  return {
    lignesSchema: repondues.map(mesCompLigneVersSchema),
    reponsesTexte: mesCompFormaterReponses(repondues, etat.reponses),
    libelles: repondues.map(function (l) { return l.libelle; })
  };
}
// Second passage : seules les lignes qui avaient une question changent (rapprochées par leur libellé). `filtre` = filtrerReponse(..., { secondPassage }).
function mesCompIntegrerSecondPassage(etat, filtre) {
  var e = mesCompNormaliserEtat(JSON.parse(JSON.stringify(etat)));
  if (!filtre || !filtre.ok) { return e; }
  var norm = _mesCompFilet.normaliser;
  (filtre.competences || []).forEach(function (c) {
    for (var i = 0; i < e.lignes.length; i++) {
      if (e.lignes[i].confirmation === 'aPreciser' && norm(e.lignes[i].libelle) === norm(c.libelle)) {
        e.lignes[i] = _mesCompLigneDepuisReponse(Object.assign({}, c, { question: '' }), e.lignes[i].id, false);
        delete e.reponses[e.lignes[i].id];
        return;
      }
    }
  });
  (filtre.retirees || []).forEach(function (l) {
    e.lignes = e.lignes.filter(function (x) { if (x.confirmation === 'aPreciser' && norm(x.libelle) === norm(l)) { delete e.reponses[x.id]; return false; } return true; });
  });
  return e;
}

// ---------- Relecture : les trois gestes ----------

// Pose un geste sur une ligne ou une envie. Même geste deux fois = geste retiré (retour à « pas encore relu »). Texte : version écrite par la personne (« en partie exact »).
function mesCompBasculerGeste(etat, id, geste, texte) {
  var e = JSON.parse(JSON.stringify(etat));
  var cible = e.lignes.filter(function (l) { return l.id === id; })[0] || e.envies.filter(function (x) { return x.id === id; })[0];
  if (!cible || ['ok', 'part', 'non'].indexOf(geste) < 0) { return e; }
  if (cible.geste === geste) { cible.geste = ''; if ('texteCorrige' in cible) { cible.texteCorrige = ''; } return e; }
  if (geste === 'part' && !('texteCorrige' in cible)) { return e; }   // une envie n'a que « exact » et « je retire »
  cible.geste = geste;
  if ('texteCorrige' in cible) { cible.texteCorrige = geste === 'part' ? (_mesCompTexte(texte).trim() || cible.pourLeCV) : ''; }
  return e;
}
function mesCompCorrigerTexte(etat, id, texte) {
  var e = JSON.parse(JSON.stringify(etat));
  e.lignes.forEach(function (l) { if (l.id === id && l.geste === 'part') { l.texteCorrige = _mesCompTexte(texte); } });
  return e;
}
// { gardees, retirees, reste } sur les compétences relevées et les envies ; une ligne « à préciser » ni répondue ni passée compte dans « reste ».
function mesCompCompter(etat) {
  var c = { gardees: 0, retirees: 0, reste: 0 };
  (etat.lignes || []).forEach(function (l) {
    if (l.confirmation === 'aPreciser') { if (!l.passee) { c.reste++; } return; }
    if (l.geste === 'ok' || l.geste === 'part') { c.gardees++; } else if (l.geste === 'non') { c.retirees++; } else { c.reste++; }
  });
  (etat.envies || []).forEach(function (x) { if (x.geste === 'ok') { c.gardees++; } else if (x.geste === 'non') { c.retirees++; } else { c.reste++; } });
  return c;
}
function mesCompPeutContinuerRelecture(etat) { return mesCompCompter(etat).gardees > 0; }
function mesCompPhraseRelecture(etat) {
  var c = mesCompCompter(etat);
  if (c.gardees === 0) { return 'Gardez au moins une ligne pour continuer.'; }
  if (c.reste > 0) { return 'Il vous reste ' + c.reste + ' ligne' + (c.reste > 1 ? 's' : '') + ' à relire ou à passer.'; }
  return 'Vous avez gardé ' + c.gardees + ' ligne' + (c.gardees > 1 ? 's' : '') + '.';
}

// ---------- Document « Mes compétences » ----------

// Seules les lignes que la personne a gardées (« exact » ou « en partie exact ») entrent dans le document. Une ligne à préciser n'y entre jamais.
function mesCompDocumentFinal(etat, options) {
  var opt = Object.assign({ preuves: true, oral: true, nom: false, nomTexte: '' }, (etat && etat.options) || {}, options || {});
  var sections = MESCOMP_FAMILLES.map(function (f) {
    var lignes = (etat.lignes || []).filter(function (l) { return l.famille === f.id && l.confirmation !== 'aPreciser' && (l.geste === 'ok' || l.geste === 'part'); }).map(function (l) {
      return {
        libelle: l.libelle,
        pourLeCV: (l.geste === 'part' && _mesCompTexte(l.texteCorrige).trim()) ? _mesCompTexte(l.texteCorrige).trim() : l.pourLeCV,
        ecritParMoi: l.geste === 'part' && !!_mesCompTexte(l.texteCorrige).trim(),
        confirmation: l.confirmation,
        preuves: (l.preuves || []).map(function (p) { return { source: MESCOMP_SOURCES[p.typeDocument] || 'Mes documents', extrait: p.extrait }; }),
        pourLOral: l.pourLOral
      };
    });
    return { id: f.id, titre: f.titre, lignes: lignes };
  }).filter(function (s) { return s.lignes.length; });
  var envies = (etat.envies || []).filter(function (x) { return x.geste === 'ok'; }).map(function (x) {
    return { libelle: x.libelle, preuve: { source: MESCOMP_SOURCES[x.typeDocument] || 'Mes documents', extrait: x.extrait } };
  });
  return {
    titre: 'Mes compétences', nom: (opt.nom && _mesCompTexte(opt.nomTexte).trim()) ? _mesCompTexte(opt.nomTexte).trim() : '',
    sections: sections, envies: envies, vide: !sections.length && !envies.length, preuves: !!opt.preuves, oral: !!opt.oral
  };
}
// Le même document en texte simple (bouton « Copier le texte »).
function mesCompTexteDocument(doc) {
  var l = [];
  l.push(doc.titre);
  if (doc.nom) { l.push(doc.nom); }
  l.push('Relevées dans mes documents, relues et gardées par moi.');
  doc.sections.forEach(function (s) {
    l.push('', s.titre.toUpperCase());
    s.lignes.forEach(function (x) {
      l.push('- ' + x.libelle + (x.confirmation === 'confirmee' ? ' (confirmé par une autre personne)' : '') + (x.ecritParMoi ? ' (écrit par moi)' : ''));
      if (x.pourLeCV) { l.push('  Pour mon CV : ' + x.pourLeCV); }
      if (doc.preuves) { x.preuves.forEach(function (p) { l.push('  ' + p.source + ' : « ' + p.extrait + ' »'); }); }
      if (doc.oral && x.pourLOral) { l.push('  À l’oral : « ' + x.pourLOral + ' »'); }
    });
  });
  if (doc.envies.length) {
    l.push('', MESCOMP_TITRE_ENVIES.toUpperCase());
    doc.envies.forEach(function (x) { l.push('- ' + x.libelle); if (doc.preuves && x.preuve.extrait) { l.push('  ' + x.preuve.source + ' : « ' + x.preuve.extrait + ' »'); } });
  }
  return l.join('\n');
}
// Lecture du document final par d'autres modules (plus tard, après essais comparatifs) : null tant que la personne n'a pas terminé.
function mesCompObtenirDocument(etat) {
  if (!etat || !etat.termine) { return null; }
  var d = mesCompDocumentFinal(etat);
  return d.vide ? null : d;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MESCOMP_TYPES: MESCOMP_TYPES, MESCOMP_NIVEAUX: MESCOMP_NIVEAUX, MESCOMP_FAMILLES: MESCOMP_FAMILLES, MESCOMP_PLAFOND_CARACTERES: MESCOMP_PLAFOND_CARACTERES,
    mesCompDocumentsCompter: mesCompDocumentsCompter, mesCompPlaceDisponible: mesCompPlaceDisponible, mesCompDocumentsAjouter: mesCompDocumentsAjouter,
    mesCompDocumentsRetirer: mesCompDocumentsRetirer, mesCompDocumentsPourEnvoi: mesCompDocumentsPourEnvoi, mesCompRaisonBlocageDocuments: mesCompRaisonBlocageDocuments,
    mesCompNettoyerPrompt: mesCompNettoyerPrompt, mesCompConstruireMessage: mesCompConstruireMessage, mesCompLigneVersSchema: mesCompLigneVersSchema,
    mesCompFormaterReponses: mesCompFormaterReponses, mesCompConstruireMessageSecondPassage: mesCompConstruireMessageSecondPassage, mesCompMessageTropLong: mesCompMessageTropLong,
    mesCompEtatInitial: mesCompEtatInitial, mesCompNormaliserEtat: mesCompNormaliserEtat, mesCompIntegrerPremierPassage: mesCompIntegrerPremierPassage,
    mesCompLignesAPreciser: mesCompLignesAPreciser, mesCompPoserReponse: mesCompPoserReponse, mesCompPasserLigne: mesCompPasserLigne,
    mesCompPreparerSecondPassage: mesCompPreparerSecondPassage, mesCompIntegrerSecondPassage: mesCompIntegrerSecondPassage,
    mesCompBasculerGeste: mesCompBasculerGeste, mesCompCorrigerTexte: mesCompCorrigerTexte, mesCompCompter: mesCompCompter,
    mesCompPeutContinuerRelecture: mesCompPeutContinuerRelecture, mesCompPhraseRelecture: mesCompPhraseRelecture,
    mesCompDocumentFinal: mesCompDocumentFinal, mesCompTexteDocument: mesCompTexteDocument, mesCompObtenirDocument: mesCompObtenirDocument
  };
}
