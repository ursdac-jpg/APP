/* ============================================================
   Module « Un CV, plusieurs métiers » : LOGIQUE PURE des pages 4 (accroches) et 6 (lettres) : construction des demandes à l'assistant et lecture
   des réponses (aucun DOM). Chargé après logiqueMetiers.js. Testé par tests/unCvPlusieursMetiersCv.test.js.
   Les formats des blocs reprennent EXACTEMENT ceux des essais de prompts (scripts/essai_prompts_ucpm.js), testés sur de vrais assistants.
   ============================================================ */

// Apostrophes : l'assistant mélange apostrophes droites et typographiques ; l'application écrit avec l'apostrophe typographique.
function ucpmNormaliserApostrophes(t) {
  return String(t == null ? '' : t).replace(/(\S)'(\S)/g, '$1\u2019$2').replace(/^'/, '\u2019');
}

// Phrase de genre transmise aux prompts 3 et 4 (mêmes mots que dans les essais). sexe : 'f', 'm' ou '' (non précisé : aucun mot qui s'accorde).
function ucpmGenreTexte(sexe) {
  if (sexe === 'f') { return 'Féminin : la personne est une femme. Accorde tous les adjectifs et participes au féminin (habituée, motivée...).'; }
  if (sexe === 'm') { return 'Masculin : la personne est un homme. Accorde tous les adjectifs et participes au masculin (habitué, motivé...).'; }
  return 'Non précisé : n’emploie aucun mot qui s’accorde au masculin ou au féminin ; tourne les phrases avec des noms.';
}

// Ligne directrice d'une démarche : la table de l'application (LIGNES_DIRECTRICES_SITUATION, js/app.js) en navigateur, ou une table passée par le test.
function ucpmLigneDirectrice(demarche, lignes) {
  var table = lignes || ((typeof LIGNES_DIRECTRICES_SITUATION !== 'undefined') ? LIGNES_DIRECTRICES_SITUATION : {});
  return table[demarche] || '';
}

// ---------------- Profil validé (CV de référence) ----------------

function _ucpmDateCourte(v) { var m = String(v || '').match(/^(\d{4})/); return m ? m[1] : String(v || '').trim(); }

// Le profil validé envoyé aux prompts 3 et 4 : le CV de référence tel que la personne l'a réglé, en lignes courtes (jamais le CV brut, jamais de coordonnées).
// d = le dossier de l'application (le CV de référence). Même forme que le profil des essais.
function ucpmConstruireProfilValide(d) {
  d = d || {};
  var cv = (d.ia && d.ia.cv) || {};
  var titre = String(d.titreCV || '').trim();
  var accroche = String(cv.profil || '').trim();
  var l = [];
  if (titre) { l.push('Titre du CV de référence : ' + titre); }
  if (accroche) { l.push('Accroche retenue : ' + accroche); }
  var comps = [].concat(d.competencesCV || []).map(function (c) { return String((c && c.nom) || c || '').trim(); }).filter(Boolean);
  if (comps.length) { l.push('Compétences clés : ' + comps.join(', ') + '.'); }
  var exps = (d.experiences || []).filter(function (e) { return e && (e.poste || e.entreprise); });
  if (exps.length) {
    l.push('Expériences :');
    exps.forEach(function (e) {
      var debut = _ucpmDateCourte(e.dateDebut), fin = _ucpmDateCourte(e.dateFin);
      var periode = debut ? debut + (fin ? '-' + fin : '-aujourd’hui') : '';
      var missions = Array.isArray(e.missions) ? e.missions : String(e.missions || '').split(/\n+/);
      var m = missions.map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(', ');
      l.push('- ' + (periode ? periode + ', ' : '') + String(e.poste || '').trim() + (e.entreprise ? ' (' + String(e.entreprise).trim() + ')' : '') + (m ? ' : ' + m : '') + '.');
    });
  }
  var forms = (d.formations || []).filter(function (f) { return f && (f.intitule || f.niveau); });
  var certifs = (d.certifications || []).map(function (c) { return String((c && c.intitule) || c || '').trim(); }).filter(Boolean);
  var fl = forms.map(function (f) { return [f.niveau, f.intitule].filter(Boolean).join(' ') + (f.annee ? ' (' + f.annee + ')' : ''); }).concat(certifs);
  if (fl.length) { l.push('Formations : ' + fl.join(' ; ') + '.'); }
  var autres = [];
  if (Array.isArray(d.engagements) && d.engagements.length) { autres.push('Engagement : ' + d.engagements.map(function (e) { return String((e && e.texte) || e || '').trim(); }).filter(Boolean).join(' ; ')); }
  if (d.permis && d.permis.possede === true) { autres.push('Permis ' + ((d.permis.categories || []).join(', ') || 'B')); }
  if (Array.isArray(d.langues) && d.langues.length) { autres.push('Langues : ' + d.langues.map(function (x) { return x.langue + (x.niveau ? ' (' + x.niveau + ')' : ''); }).join(', ')); }
  if (Array.isArray(d.loisirs) && d.loisirs.length) { autres.push('Loisirs : ' + d.loisirs.join(', ')); }
  if (autres.length) { l.push(autres.join('. ') + '.'); }
  return l.join('\n');
}

// ---------------- Page 4 : accroches ----------------

// Les entrées pour lesquelles on demande des accroches : toutes les entrées cochées SAUF le CV de référence (il a déjà son accroche, choisie à la page 3).
function ucpmEntreesPourAccroches(etat) {
  var ref = ucpmRefCourante(etat);
  return ucpmEntreesCochees(etat).filter(function (e) { return !ref || e.id !== ref.id; });
}

// Bloc {METIERS} du prompt des accroches : « 1. Métier : ... / Objectif : ... / Ligne directrice ... / Détails : ... », dans l'ordre des entrées.
function ucpmBlocMetiersAccroches(entrees, sexe, lignes) {
  return entrees.map(function (e, i) {
    var o = ucpmNormaliserObjectif(e.objectif) || ucpmObjectifVide('');
    return (i + 1) + '. Métier : ' + (sexe === 'f' ? (e.feminin || e.masculin) : e.masculin) +
      '\n   Objectif : ' + ucpmTitreDemarche(o.demarche) +
      '\n   Ligne directrice de cet objectif : ' + ucpmLigneDirectrice(o.demarche, lignes) +
      '\n   Détails : ' + (ucpmDetailsObjectif(o) || 'aucun détail donné');
  }).join('\n\n');
}

function ucpmConstruirePromptAccroches(template, valeurs) {
  var v = valeurs || {};
  var t = { GENRE: ucpmGenreTexte(v.sexe), PROFIL: String(v.profil || '').trim() || 'Non fourni', METIERS: String(v.metiers || '').trim() };
  return String(template == null ? '' : template).replace(/\{(GENRE|PROFIL|METIERS)\}/g, function (m, nom) { return t[nom]; });
}

// Lit la réponse des accroches : un tableau [{ id, metier, accroches: [deux phrases] }], un élément par métier demandé, même ordre, même id.
// Renvoie { succes, accroches: { id: [a1, a2] }, manquants: [ids], erreur, coupe }. Un métier sans accroche valide n'empêche pas les autres (la personne peut écrire la sienne).
function ucpmLireReponseAccroches(texte, ids) {
  var brut = String(texte == null ? '' : texte);
  if (!brut.trim()) { return { succes: false, erreur: 'Aucun texte n’a été collé.', coupe: false }; }
  var r = ucpmExtraireJson(brut);
  if (r.erreur) { return { succes: false, coupe: !!r.coupe, erreur: r.coupe ? UCPM_MSG_REPONSE_COUPEE : UCPM_MSG_REPONSE_ILLISIBLE }; }
  var liste = Array.isArray(r.json) ? r.json : (r.json && Array.isArray(r.json.accroches) ? r.json.accroches : null);
  if (!liste) { return { succes: false, coupe: false, erreur: UCPM_MSG_REPONSE_ILLISIBLE }; }
  var parId = {};
  liste.forEach(function (x, i) {
    if (!x || typeof x !== 'object') { return; }
    var id = parseInt(x.id, 10); if (isNaN(id)) { id = i + 1; }
    var acc = (Array.isArray(x.accroches) ? x.accroches : []).map(function (a) { return ucpmNormaliserApostrophes(ucpmNettoyerTexte(a)); }).filter(Boolean).slice(0, 2);
    if (acc.length) { parId[id] = acc; }
  });
  var attendus = ids || Object.keys(parId).map(Number);
  var accroches = {};
  var manquants = [];
  attendus.forEach(function (id, i) { var cle = i + 1; if (parId[cle]) { accroches[id] = parId[cle]; } else { manquants.push(id); } });
  if (!Object.keys(accroches).length) { return { succes: false, coupe: false, erreur: 'La réponse est lisible, mais elle ne contient aucune accroche. Redemandez-la à l’assistant.' }; }
  return { succes: true, accroches: accroches, manquants: manquants };
}

// ---------------- Page 6 : lettres ----------------

// Bloc {CVS} : une entrée par CV, avec titre, accroche retenue, objectif complet, ligne directrice, détails, et ce que la personne a donné (employeur, recruteur, poste,
// extrait d'offre, « autre chose à dire »). items = [{ titre, accroche, objectif }].
function ucpmBlocCvLettres(items, lignes) {
  return items.map(function (it, i) {
    var o = ucpmNormaliserObjectif(it.objectif) || ucpmObjectifVide('');
    var l = (i + 1) + '. Titre du CV : ' + it.titre +
      '\n   Accroche retenue : ' + (it.accroche || '') +
      '\n   Objectif : ' + ucpmTitreDemarche(o.demarche) +
      '\n   Ligne directrice de cet objectif : ' + ucpmLigneDirectrice(o.demarche, lignes) +
      '\n   Détails : ' + (ucpmDetailsObjectif(o) || 'aucun détail donné');
    if (o.employeur) { l += '\n   Employeur : ' + o.employeur; }
    var recruteur = [o.civiliteRecruteur, o.nomRecruteur].filter(Boolean).join(' ');
    if (o.nomRecruteur) { l += '\n   Recruteur : ' + recruteur; }
    if (o.posteOffre) { l += '\n   Poste visé : ' + o.posteOffre; }
    if (o.texteOffre) { l += '\n   Extrait de l’offre : ' + String(o.texteOffre).replace(/\s+/g, ' ').trim().slice(0, 600); }
    if (o.autreChose) { l += '\n   Autre chose à dire (à reprendre avec les mots de la personne, sans rien inventer autour) : ' + o.autreChose; }
    return l;
  }).join('\n\n');
}

function ucpmConstruirePromptLettres(template, valeurs) {
  var v = valeurs || {};
  var t = { GENRE: ucpmGenreTexte(v.sexe), PROFIL: String(v.profil || '').trim() || 'Non fourni', CVS: String(v.cvs || '').trim() };
  return String(template == null ? '' : template).replace(/\{(GENRE|PROFIL|CVS)\}/g, function (m, nom) { return t[nom]; });
}

// Formule d'appel IMPOSÉE par l'application (l'assistant l'écrit parfois à l'envers) : « Madame Martin, » quand le recruteur est connu, sinon « Madame, Monsieur, ».
function ucpmFormuleAppel(objectif) {
  var o = ucpmNormaliserObjectif(objectif) || ucpmObjectifVide('');
  if (o.nomRecruteur) { return (o.civiliteRecruteur ? o.civiliteRecruteur + ' ' : '') + o.nomRecruteur + ','; }
  return 'Madame, Monsieur,';
}

// Remplace la première ligne de la lettre si c'est une formule d'appel (courte, finissant par une virgule), sinon l'ajoute en tête.
function ucpmImposerFormuleAppel(lettre, objectif) {
  var formule = ucpmFormuleAppel(objectif);
  var t = String(lettre == null ? '' : lettre).replace(/\r\n/g, '\n').trim();
  var lignes = t.split('\n');
  var premiere = (lignes[0] || '').trim();
  var estAppel = premiere.length > 0 && premiere.length <= 60 && /,$/.test(premiere) && /^(Madame|Monsieur|Mesdames|Messieurs|Chère|Cher)/i.test(premiere);
  if (estAppel) { lignes[0] = formule; return lignes.join('\n'); }
  return formule + '\n\n' + t;
}

// Lit la réponse des lettres : [{ id, metier, lettre }], une par CV demandé. Renvoie { succes, lettres: { id: texte }, manquants, erreur, coupe }.
function ucpmLireReponseLettres(texte, ids) {
  var brut = String(texte == null ? '' : texte);
  if (!brut.trim()) { return { succes: false, erreur: 'Aucun texte n’a été collé.', coupe: false }; }
  var r = ucpmExtraireJson(brut);
  if (r.erreur) { return { succes: false, coupe: !!r.coupe, erreur: r.coupe ? UCPM_MSG_REPONSE_COUPEE : UCPM_MSG_REPONSE_ILLISIBLE }; }
  var liste = Array.isArray(r.json) ? r.json : (r.json && Array.isArray(r.json.lettres) ? r.json.lettres : null);
  if (!liste) { return { succes: false, coupe: false, erreur: UCPM_MSG_REPONSE_ILLISIBLE }; }
  var parId = {};
  liste.forEach(function (x, i) {
    if (!x || typeof x !== 'object') { return; }
    var id = parseInt(x.id, 10); if (isNaN(id)) { id = i + 1; }
    var t = String(x.lettre == null ? '' : x.lettre).replace(/[\u2013\u2014]/g, '-').replace(/\r\n/g, '\n').trim();
    if (t) { parId[id] = ucpmNormaliserApostrophes(t); }
  });
  var attendus = ids || Object.keys(parId).map(Number);
  var lettres = {};
  var manquants = [];
  attendus.forEach(function (id, i) { var cle = i + 1; if (parId[cle]) { lettres[id] = parId[cle]; } else { manquants.push(id); } });
  if (!Object.keys(lettres).length) { return { succes: false, coupe: false, erreur: 'La réponse est lisible, mais elle ne contient aucune lettre. Redemandez-la à l’assistant.' }; }
  return { succes: true, lettres: lettres, manquants: manquants };
}

// La lettre prête à être lue : formule d'appel imposée, signature (prénom et nom de la personne) ajoutée si elle n'y est pas déjà. L'assistant ne signe pas : l'application le fait.
function ucpmFinaliserLettre(lettre, objectif, nomComplet) {
  var t = ucpmImposerFormuleAppel(lettre, objectif).replace(/\s+$/, '');
  var nom = String(nomComplet == null ? '' : nomComplet).replace(/\s+/g, ' ').trim();
  if (!nom) { return t; }
  var derniere = t.split('\n').pop().trim();
  if (derniere.toLowerCase() === nom.toLowerCase()) { return t; }
  return t + '\n\n' + nom;
}

// Prénom et nom de la personne (signature des lettres), tels qu'ils figurent dans l'identité du dossier.
function ucpmNomComplet(identite) {
  var i = identite || {};
  return [i.prenom, i.nom].map(function (x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim(); }).filter(Boolean).join(' ');
}

// Les lettres reçues de l'assistant, prêtes à être lues : formule d'appel imposée et signature pour chaque CV.
// recues = { id : texte }, entrees = les entrées (CV) choisies avec leur objectif. Renvoie { id : texte }.
function ucpmPreparerLettresRecues(recues, entrees, nomComplet) {
  var sortie = {};
  (entrees || []).forEach(function (e) {
    if (recues && recues[e.id]) { sortie[e.id] = ucpmFinaliserLettre(recues[e.id], e.objectif, nomComplet); }
  });
  return sortie;
}

// Nouvelle série de lettres après une demande : les lettres reçues remplacent celles des mêmes CV ; aucune autre lettre n'est touchée (rien n'est supprimé).
function ucpmFusionnerLettres(anciennes, recues) {
  var sortie = {};
  Object.keys(anciennes || {}).forEach(function (id) { sortie[id] = anciennes[id]; });
  Object.keys(recues || {}).forEach(function (id) { sortie[id] = recues[id]; });
  return sortie;
}

// Texte tapé ou collé par la personne : aucun tiret long (cadratin ou demi-cadratin) ne reste dans l'application.
function ucpmSansTiretLong(t) { return String(t == null ? '' : t).replace(/[\u2013\u2014]/g, '-'); }

// Au-delà de ce nombre de mots, la lettre risque de passer sur une deuxième page A4 (information seulement, jamais bloquant).
var UCPM_LETTRE_LONGUE_MOTS = 330;
function ucpmLettreLongue(t) { return ucpmNombreMots(t) > UCPM_LETTRE_LONGUE_MOTS; }

// ---------------- Pages périmées (règle de Retour, décision de Denis du 2026-10-09) ----------------
// Revenir en arrière ne supprime rien. Mais si la personne change quelque chose en amont (métier, objectif, identité, CV de référence, titre ou phrase d'accroche d'un CV),
// ce que l'assistant a écrit pour une page suivante peut ne plus correspondre : cette page le dit et propose de refaire la demande (rien n'est effacé tant que la personne n'a pas confirmé).
// À chaque réponse reçue, on garde l'empreinte de ce qui avait été envoyé pour chaque métier ; on la compare ensuite à l'état actuel.

// Empreinte courte d'un texte (même calcul partout : le module s'en sert aussi pour savoir si le rendu d'un CV est à jour).
function ucpmHachage(texte) {
  var h = 5381, s = String(texte);
  for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
  return s.length + ':' + (h >>> 0).toString(36);
}

// Ce qui, pour un métier, a été envoyé : son nom (selon l'identité), son objectif, l'identité, le profil validé du CV de référence, et des éléments en plus (titre, accroche, nom).
function ucpmSignatureEntree(entree, sexe, profil, supplement) {
  return ucpmHachage(JSON.stringify([ucpmNomMetier(entree, sexe), ucpmNormaliserObjectif(entree && entree.objectif), sexe || '', String(profil || ''), supplement || '']));
}

// Empreintes à garder quand les accroches viennent d'être reçues : { identifiant : empreinte }.
function ucpmSignaturesAccroches(etat, profil) {
  var s = {};
  ucpmEntreesPourAccroches(etat).forEach(function (e) { s[e.id] = ucpmSignatureEntree(e, etat.sexe, profil, ''); });
  return s;
}

// Accroches reçues qui ne correspondent plus (empreinte différente), et métiers ajoutés depuis la demande (aucune proposition, aucune phrase choisie).
function ucpmAccrochesPerimees(etat, profil) {
  var res = { perimees: [], nouveaux: [] };
  if (!etat || !etat.accroches) { return res; }
  var sigs = etat.accrochesSig || {};
  var manquantes = etat.accrochesManquantes || [];
  ucpmEntreesPourAccroches(etat).forEach(function (e) {
    if (etat.accroches[e.id]) {
      if (sigs[e.id] && sigs[e.id] !== ucpmSignatureEntree(e, etat.sexe, profil, '')) { res.perimees.push(e); }
    } else if (manquantes.indexOf(e.id) < 0 && !(etat.cvs && etat.cvs[e.id] && etat.cvs[e.id].accrocheChoisie)) {
      res.nouveaux.push(e);
    }
  });
  return res;
}

function _ucpmSupplementLettre(etat, entree, nomComplet) {
  var cv = (etat.cvs && etat.cvs[entree.id]) || {};
  return JSON.stringify([cv.titre || '', cv.accroche || '', nomComplet || '']);
}

// Empreintes à garder quand des lettres viennent d'être reçues, pour les entrées données : { identifiant : empreinte }.
function ucpmSignaturesLettres(etat, entrees, profil, nomComplet) {
  var s = {};
  (entrees || []).forEach(function (e) { s[e.id] = ucpmSignatureEntree(e, etat.sexe, profil, _ucpmSupplementLettre(etat, e, nomComplet)); });
  return s;
}

// Les entrées dont la lettre ne correspond plus à ce qui a été envoyé (une lettre sans empreinte, écrite à la main ou venue d'une ancienne sauvegarde, n'est jamais déclarée périmée).
function ucpmLettresPerimees(etat, profil, nomComplet) {
  var sigs = (etat && etat.lettresSig) || {};
  return ucpmEntreesCochees(etat).filter(function (e) {
    return !!(etat.lettres && String(etat.lettres[e.id] || '').trim()) && !!sigs[e.id] &&
      sigs[e.id] !== ucpmSignatureEntree(e, etat.sexe, profil, _ucpmSupplementLettre(etat, e, nomComplet));
  });
}

// Nombre de mots d'une lettre (repère de longueur, avertissement « lettre longue » au-delà de 330 mots environ pour une page A4).
function ucpmNombreMots(t) { var m = String(t == null ? '' : t).trim().match(/\S+/g); return m ? m.length : 0; }

// ---------------- Page 6 : retravailler une lettre (2026-10-15) ----------------
// La personne relit sa lettre, la modifie, puis la renvoie à l'assistant avec ses remarques (prompt prompts/ucpm-lettres-retravail.md). Même format de réponse que les lettres.

// La lettre sans la signature (le nom de la personne, ajouté par l'application) : le nom ne part jamais chez l'assistant. La formule d'appel et la formule de politesse restent.
function ucpmRetirerSignature(lettre, nomComplet) {
  var t = String(lettre == null ? '' : lettre).replace(/\r\n/g, '\n').replace(/\s+$/, '');
  var nom = String(nomComplet == null ? '' : nomComplet).replace(/\s+/g, ' ').trim();
  if (!nom) { return t; }
  var lignes = t.split('\n');
  var derniere = (lignes[lignes.length - 1] || '').replace(/\s+/g, ' ').trim();
  if (derniere.toLowerCase() === nom.toLowerCase()) { lignes.pop(); }
  return lignes.join('\n').replace(/\s+$/, '');
}

// Bloc {LETTRES} : comme {CVS} des lettres, avec en plus, pour chaque CV, la lettre actuelle (sans signature) et la remarque de la personne.
// items = [{ titre, accroche, objectif, lettre, remarque }].
function ucpmBlocLettresRetravail(items, lignes) {
  return (items || []).map(function (it, i) {
    var base = ucpmBlocCvLettres([it], lignes).replace(/^1\./, (i + 1) + '.');
    var remarque = String(it.remarque == null ? '' : it.remarque).replace(/\s+/g, ' ').trim();
    return base + '\n   Lettre actuelle (texte de la personne, à retravailler) :\n"""\n' + String(it.lettre || '').trim() + '\n"""' +
      '\n   Ce que la personne veut changer ou ajouter : ' + (remarque || 'aucune remarque');
  }).join('\n\n');
}

function ucpmConstruirePromptRetravail(template, valeurs) {
  var v = valeurs || {};
  var t = { GENRE: ucpmGenreTexte(v.sexe), PROFIL: String(v.profil || '').trim() || 'Non fourni', LETTRES: String(v.lettres || '').trim() };
  return String(template == null ? '' : template).replace(/\{(GENRE|PROFIL|LETTRES)\}/g, function (m, nom) { return t[nom]; });
}

// Les CV dont la lettre est retravaillée : la lettre choisie, ou toutes les lettres qui existent. retravail = { id, toutes, remarque } (état du module), entreesAvecLettre = les entrées cochées qui ont une lettre.
function ucpmCiblesRetravail(retravail, entreesAvecLettre) {
  var liste = entreesAvecLettre || [];
  if (!retravail) { return []; }
  if (retravail.toutes) { return liste.slice(); }
  return liste.filter(function (e) { return e.id === retravail.id; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ucpmRetirerSignature: ucpmRetirerSignature, ucpmBlocLettresRetravail: ucpmBlocLettresRetravail, ucpmConstruirePromptRetravail: ucpmConstruirePromptRetravail, ucpmCiblesRetravail: ucpmCiblesRetravail,
    ucpmNormaliserApostrophes: ucpmNormaliserApostrophes, ucpmGenreTexte: ucpmGenreTexte, ucpmLigneDirectrice: ucpmLigneDirectrice,
    ucpmConstruireProfilValide: ucpmConstruireProfilValide, ucpmEntreesPourAccroches: ucpmEntreesPourAccroches,
    ucpmBlocMetiersAccroches: ucpmBlocMetiersAccroches, ucpmConstruirePromptAccroches: ucpmConstruirePromptAccroches, ucpmLireReponseAccroches: ucpmLireReponseAccroches,
    ucpmBlocCvLettres: ucpmBlocCvLettres, ucpmConstruirePromptLettres: ucpmConstruirePromptLettres, ucpmFormuleAppel: ucpmFormuleAppel,
    ucpmImposerFormuleAppel: ucpmImposerFormuleAppel, ucpmLireReponseLettres: ucpmLireReponseLettres, ucpmNombreMots: ucpmNombreMots, ucpmFinaliserLettre: ucpmFinaliserLettre,
    ucpmNomComplet: ucpmNomComplet, ucpmPreparerLettresRecues: ucpmPreparerLettresRecues, ucpmFusionnerLettres: ucpmFusionnerLettres,
    ucpmHachage: ucpmHachage, ucpmSignatureEntree: ucpmSignatureEntree, ucpmSignaturesAccroches: ucpmSignaturesAccroches, ucpmAccrochesPerimees: ucpmAccrochesPerimees,
    ucpmSignaturesLettres: ucpmSignaturesLettres, ucpmLettresPerimees: ucpmLettresPerimees,
    ucpmLettreLongue: ucpmLettreLongue, ucpmSansTiretLong: ucpmSansTiretLong, UCPM_LETTRE_LONGUE_MOTS: UCPM_LETTRE_LONGUE_MOTS
  };
}
