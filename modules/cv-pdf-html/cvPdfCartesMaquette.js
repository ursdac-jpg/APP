/* ============================================================
   cvPdfCartesMaquette.js
   ------------------------------------------------------------
   Les 7 cartes du panneau « La mise en page » du CV en PDF, au balisage EXACT de la
   maquette (docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html, cartes cOrg, cExp, cForm,
   cSupp, cTexte, cAvance, cFormat), avec leur câblage.

   TACHE (Denis, 2026-09-25, tranche 3 du chantier « La mise en page » : « la maquette est la
   source de vérité, chaque bloc et chaque bouton comme dans la maquette »). Le style vient de
   css/mise-en-page-maquette.css (porté .mep-mq). Ce fichier ne contient QUE la construction du
   HTML des cartes (functions _htmlSecXxxMiseEnPage, appelées par construireMiseEnPageCV dans
   js/app.js) et leur câblage (_mepCablerCartesMaquette, appelé par _wireCarteSimpleMiseEnPage).

   Le moteur reste dans le panneau (cvPdfPanneauReglages.js) : chaque contrôle parle à lui par
   _mepAppelerIframePdf (js/app.js). Les choix de la maquette qui n'avaient pas encore de variable
   dédiée vivent dans le « sac » _cvPdfChoixMq du panneau (_pdfMqChoix), enregistré avec le CV
   (dossier.pdfReglages.choixMq).

   Les fonctions _mepEtat* (Organisation, Expériences, Formations) restent dans js/app.js.
   ============================================================ */

// ---------- état d'affichage propre au panneau (jamais enregistré avec le CV) ----------
var _mepCartesOuvertes = {};      // id de carte -> ouverte ? (un clic ne referme pas la carte)
var _mepMissionsOuvertes = {};    // index d'expérience -> liste de ses missions ouverte ?
// TACHE (retour Denis 2026-09-28, point 13 : "je dois pouvoir choisir laquelle mission je
// garde, pas juste combien") : meme principe EXACT que _mepMissionsOuvertes ci-dessus, cle
// texte (_mepCleExpPerso) au lieu d'index -- Formations et Expérience personnelle.
var _mepMissionsOuvertesForm = {};
var _mepMissionsOuvertesExpPerso = {};
// TACHE (retour Denis 2026-09-28 : bouton "Modifier" pour changer l'intitulé
// et les missions affichées sur le CV, Expérience personnelle ET Formations)
// : cle (_mepCleExpPerso) -> formulaire d'édition ouvert ?
var _mepEditionExpPersoOuverte = {};
var _mepEditionFormationOuverte = {};
// Mode « Editer les formations » (retour Denis 2026-10-02) : meme interrupteur que « Editer les experiences » ; correction de CE CV seulement (jamais « Vos informations »).
var _mepEditionForm = false;
// Mode « Editer mon experience personnelle » (meme principe).
var _mepEditionPerso = false;
var _mepPickOuvert = { pro: false, comp: false };   // listes « Choisir » des compétences
var _mepCibleTaille = 'texte';    // « Taille de : Texte / Titres »
// TACHE (retour Denis 2026-09-28, carte "En-tête de CV") : bouton "Modifier" à côté du titre/de
// l'accroche - bascule le menu déroulant (propositions de l'assistant) vers un champ texte libre,
// pré-rempli avec la proposition actuellement retenue. Jamais un 2e champ séparé : la même donnée
// (dossier.titreCV / dossier.ia.cv.profil) reste modifiée, que ce soit via le menu ou ce champ.
var _mepEditerTitreCV = false;
var _mepEditerAccrocheCV = false;

function _mepCarteOuverte(id, defaut) {
  return Object.prototype.hasOwnProperty.call(_mepCartesOuvertes, id) ? !!_mepCartesOuvertes[id] : !!defaut;
}

// En-tête d'une carte, structure exacte de la maquette : icône, titre, sous-titre (sous le titre pour
// « Organisation du CV » et « Expériences », à côté du titre pour les autres), chevron.
function _mepEnteteCarteMq(cleIcone, titre, sous, sousSousLeTitre, ouverte) {
  return '<summary><svg class="ic" viewBox="0 0 24 24">' + (_MEP_ICONES_CARTES[cleIcone] || '') + '</svg><div><h3>' + titre +
    ((sous && !sousSousLeTitre) ? ' <span class="sous" style="font-weight:400;margin-left:0.5rem">' + sous + '</span>' : '') + '</h3>' +
    ((sous && sousSousLeTitre) ? '<span class="sous">' + sous + '</span>' : '') +
    '</div><span class="chev">' + (ouverte ? '&#8963;' : '&#8964;') + '</span></summary>';
}

// « Sac » des choix de la maquette sans variable dédiée (voir _pdfMqChoix, cvPdfPanneauReglages.js). Même règle
// de lecture que _mepEtatExperiences : dossier.pdfReglages d'abord (écrit de façon synchrone), l'iframe en repli.
function _mepEtatChoixMq() {
  var pr = dossier.pdfReglages;
  if (pr && typeof pr === 'object' && Object.keys(pr).length) { return pr.choixMq || {}; }
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    return w._cvPdfChoixMq || {};
  } catch (e) { return {}; }
}
function _mepRerendre() {
  var y = window.scrollY;
  pageResultats();
  window.scrollTo(0, y);
}
function _mepDefinirChoixMq(cle, valeur) {
  _mepPousserHistorique('choixMq' + cle);
  _mepAppelerIframePdf('_pdfMqChoix', cle, valeur);
  setTimeout(_mepRerendre, 30);
}
// TACHE (Denis, 2026-09-25, tranche 3) : la liste d'experiences de la carte = celle du MOTEUR (memes indices que le moteur, dans
// l'ordre propose par l'assistant = tri « par pertinence » de la maquette). Le moteur la reordonne quand l'assistant a fait des
// recommandations : lire dossier.experiences ferait cocher / regler une AUTRE experience que celle affichee.
function _mepListeExperiencesMoteur() {
  return (window._mepExperiencesMoteur && window._mepExperiencesMoteur.length) ? window._mepExperiencesMoteur : (dossier.experiences || []);
}
// TACHE (chantier "Experience personnelle", 2026-09-27) : meme principe EXACT
// que _mepListeExperiencesMoteur() juste au-dessus, pour la liste fusionnee
// savoir-faire perso + engagements.
function _mepListeExperiencePersoMoteur() {
  // Une liste VIDE envoyée par l'aperçu ne doit pas cacher la carte quand le dossier a des éléments (retour Denis 2026-10-03 : la carte avait disparu).
  if (window._mepExperiencePersoMoteur && window._mepExperiencePersoMoteur.length) { return window._mepExperiencePersoMoteur; }
  return (dossier.experiencesPerso || []).concat(dossier.engagements || []);
}
// TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout" -- decision : "mettre
// les certificats et tout ce qui est certification, CQP, diplome dans la formation... une seule
// rubrique") : meme principe EXACT que _pdfFormationDepuisCertification/
// _pdfFormationsEtCertifications (cvPdfTemplateA4.js, cote iframe) -- jamais 2 implementations
// paralleles, seul le contexte d'execution differe. dossier.certifications RESTE un texte simple
// (modules/cv-core/certifications.js) : rien n'y change, seul l'affichage ici les traite comme
// des formations.
// Retour Denis 2026-09-30 : les formations dans l'ordre choisi a la main (« Mon ordre »), sinon dans l'ordre habituel. Les formations absentes
// de l'ordre choisi passent apres. Meme rang que cote CV (cvPdfTemplateA4.js, _pdfOrdonnerFormationsMien).
function _mepFormationsOrdonnees() {
  var liste = _mepListeFormationsEtCertifsMoteur();
  var etatOrdre = (typeof _mepEtatFormations === 'function') ? _mepEtatFormations() : {};
  var critere = etatOrdre.ordre || 'pertinence';
  if (critere === 'date-desc' || critere === 'date-asc') {
    // Meme regle que cote CV (cvPdfTemplateA4.js, _pdfOrdonnerFormationsMien) : annee de fin la plus grande ; sans annee, en dernier.
    var annee = function (f) { var m = String((f && f.annee) || '').match(/(?:19|20)\d{2}/g); return m ? Math.max.apply(null, m.map(Number)) : 0; };
    var sens = (critere === 'date-desc') ? -1 : 1;
    return liste.map(function (f, i) { return { f: f, i: i, y: annee(f) }; }).sort(function (a, b) {
      if (!a.y && !b.y) { return a.i - b.i; }
      if (!a.y) { return 1; }
      if (!b.y) { return -1; }
      return (a.y === b.y) ? (a.i - b.i) : sens * (a.y - b.y);
    }).map(function (x) { return x.f; });
  }
  var ordre = (critere === 'mien') ? etatOrdre.ordreMien : null;
  if (!ordre || !ordre.length) { return liste.slice(); }
  var rang = function (f, i) { var r = ordre.indexOf(_mepCleExpPerso(f)); return r === -1 ? 1000 + i : r; };
  return liste.map(function (f, i) { return { f: f, r: rang(f, i) }; }).sort(function (a, b) { return a.r - b.r; }).map(function (x) { return x.f; });
}
function _mepFormationDepuisCertification(texteBrut) {
  var c = (typeof separerCertification === 'function') ? separerCertification(texteBrut) : { intitule: String(texteBrut || ''), organisme: '', lieu: '', date: '' };
  return { niveau: 'Certification', intitule: c.intitule, annee: c.date, etablissement: c.organisme, lieu: c.lieu, missions: '', __certifOriginale: texteBrut };
}
// TACHE (retour Denis 2026-09-28, bug reel confirme : "trous" de captation des missions IA) :
// meme principe EXACT que _mepListeExperiencesMoteur()/_mepListeExperiencePersoMoteur() plus haut
// -- sans ce miroir (pose par _pdfConstruireResultatCourant, cvPdfPanneauReglages.js), le panneau
// lisait dossier.formations BRUT, jamais enrichi des missions IA (formationsAvecMissions/
// certificationsAvecMissions), qui ne sont appliquees qu'au moment du rendu.
function _mepListeFormationsEtCertifsMoteur() {
  if (window._mepFormationsMoteur) { return window._mepFormationsMoteur; }
  return (dossier.formations || []).concat((dossier.certifications || []).map(_mepFormationDepuisCertification));
}
// Identifiant stable d'un item (savoir-faire perso OU engagement) : le texte
// normalise de son intitule/texte (meme fonction que _pdfCleExpPerso,
// cvPdfTemplateA4.js, mais cote panneau -- jamais dupliquer la logique,
// seulement le nom de la fonction differe car les 2 fichiers ne partagent
// pas le meme contexte d'execution, l'un vit dans l'iframe, l'autre non).
function _mepCleExpPerso(item) {
  var texte = (typeof item === 'string') ? item : ((item && (item.intitule || item.texte)) || '');
  return normaliserPourComparaison(texte);
}
function _mepSigExperiences(liste) {
  return (liste || []).map(function (e) { return (e.poste || '') + '|' + (e.entreprise || '') + '|' + (e.dateDebut || '') + '|' + (e.dateFin || ''); }).join('#');
}
function _mepOrdreExperiencesPdf() {
  var pr = dossier.pdfReglages;
  if (pr && typeof pr === 'object' && pr.regOrdreExperiences) { return pr.regOrdreExperiences; }
  try {
    return document.querySelector('#zonePdfInlineCV iframe').contentDocument.getElementById('regOrdreExperiences').value;
  } catch (e) { return 'date-desc'; }
}
// Le modele actif place-t-il lui-meme les dates ? (question posee a l'iframe du CV ; faux si elle n'est pas prete)
function _mepDatesPlaceesParLeModele() {
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    return typeof w._pdfDatesPlaceesParModele === 'function' ? !!w._pdfDatesPlaceesParModele() : false;
  } catch (e) { return false; }
}
// Le modele actif a-t-il sa propre disposition (Colonne et frise, Photo et frise, Rectangles arrondis) ? Faux si l'iframe n'est pas prete.
function _mepListes2ColPossibles() {
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    return typeof w._pdfListesDeuxColonnesPossibles === 'function' ? !!w._pdfListesDeuxColonnesPossibles() : false;
  } catch (e) { return false; }
}
function _mepDispositionPropre() {
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    return typeof w._pdfDispositionPropre === 'function' ? !!w._pdfDispositionPropre() : false;
  } catch (e) { return false; }
}
// Le format choisi est-il un Mini CV A5 ? (rendu par un autre gabarit : plusieurs reglages d'organisation n'y ont aucun effet)
function _mepFormatA5() {
  return /^a5-/.test(String(((dossier.reglagesMiseEnPageCV || {}).format) || ''));
}
var _MEP_RAISON_A5 = 'le Mini CV A5 a sa propre pr&eacute;sentation';

// Mini CV A5 (2026-09-26, demande de Denis : « aucun bouton qui ne fait rien ») : les reglages que le rendu A5 ne lit pas sont GRISES, avec la raison
// (mesure : chacun a ete actionne, le CV A5 ne change pas). Ce qui marche en A5 reste actif : couleurs, allure, icones, style des competences,
// police, choix / ordre / missions / dates / lieu / mois des experiences, fond des colonnes A5, en-tete inversee, « Deux par feuille »...
var _MEP_SANS_EFFET_A5 = [
  '[data-mep-degrade-simple]', '[data-mep-cote]', '[data-mep-org-perso]', '[data-mep-org-deux]', '[data-mep-org-couleursliees]',
  '[data-mep-mode-presentation="B"]', '[data-mep-mode-presentation="C"]', '[data-mep-src-exp]',
  '[data-mep-formations]', '[data-mep-form-missions]', '[data-mep-form-aff]', '[data-mep-form-ligne]',
  '[data-mep-select-accroche]', '[data-mep-sans-accroche-case]',
  '[data-mep-entete-fixe]',
  '[data-mep-fondcolonnes]', '[data-mep-justif-simple]', '[data-mep-densite-large]', '[data-mep-stylecomp="rectangle"]'
];
// Geste UNIQUE de grisage d'un reglage sans effet (Mini CV A5 ET modeles) : desactive, explique au survol, estompe la boite.
function _mepGriserElement(el, raison) {
  if (el.getAttribute('data-sans-effet')) { return; }
  el.setAttribute('data-sans-effet', '1');
  el.disabled = true;
  el.title = raison;
  var boite = el.closest('label, .rad, .champ, .ck, .case') || el;
  boite.classList.add('sans-objet');
  boite.style.opacity = '0.5';
  boite.style.cursor = 'not-allowed';
}
function _mepGriserSansEffetA5() {
  if (!_mepFormatA5()) { return; }
  var zone = document.querySelector('.mep-2col-reglages');
  if (!zone) { return; }
  _MEP_SANS_EFFET_A5.forEach(function (sel) {
    Array.prototype.forEach.call(zone.querySelectorAll(sel), function (el) {
      _mepGriserElement(el, el.matches('[data-mep-select-accroche], [data-mep-sans-accroche-case]') ? 'Sans effet : le Mini CV n’a pas d’accroche' : 'Sans effet : le Mini CV A5 a sa propre présentation');
    });
  });
}
// TACHE (Denis, 2026-09-29, inventaire « bouton x modele ») : cle du modele actif = celle de l'inventaire (scripts/word/matrice_options.js) :
// « standard », « sobre:<variante> », « creatif:<id> ».
function _mepCleModeleActif() {
  try {
    var o = document.querySelector('#zonePdfInlineCV iframe').contentWindow._pdfLireOptions();
    if (o.creatifActif) { return 'creatif:' + (o.creatifVariante || ''); }
    if (o.sobreActif) { return 'sobre:' + (o.sobreVariante || ''); }
    return 'standard';
  } catch (e) { return null; }
}
// Griser, sur le modele ACTIF, les reglages qui ne changent rien au CV (liste mesuree : cvPdfOptionsParModele.js, genere par l'inventaire).
function _mepGriserSansEffetModele() {
  if (_mepFormatA5() || typeof _MEP_SANS_EFFET_PAR_MODELE === 'undefined') { return; }
  var cle = _mepCleModeleActif(), liste = cle && _MEP_SANS_EFFET_PAR_MODELE[cle];
  if (!liste || !liste.length) { return; }
  liste.forEach(function (id) {
    var p = id.split('|'), carte = document.getElementById(p[0]); if (!carte) { return; }
    var m = /^([^=#]+)(?:=([^#]*))?(?:#(\d+))?$/.exec(p[1]); if (!m) { return; }
    var els = carte.querySelectorAll('[data-mep-' + m[1] + (m[2] !== undefined ? '="' + m[2] + '"' : '') + ']');
    var el = els[(m[3] ? parseInt(m[3], 10) : 1) - 1];
    if (el) { _mepGriserElement(el, /^veuves/.test(m[1]) ? 'Ce modèle évite toujours un titre seul en bas de page' : 'Sans effet : ce modèle a sa propre présentation'); }
  });
}
// Réglages qui dépendent d'un AUTRE choix ou des données du CV (mesurés « sans effet » tant que la condition n'est pas remplie) :
// grisés avec la raison, et rendus actifs dès que la condition l'est (le panneau est reconstruit à chaque réglage).
function _mepGriserDependances() {
  if (_mepFormatA5()) { return; }
  var caseMissions = document.querySelector('[data-mep-form-missions]');
  if (caseMissions && !caseMissions.checked) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mep-missionsformations]'), function (el) {
      _mepGriserElement(el, 'Sans effet tant que les missions des formations ne sont pas affichées : cochez « Afficher les missions de la formation »');
    });
  }
  var rec = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations) || {};
  var reg = rec.regroupementExperiences || {};
  // Format lu par composeurAppliquerRegroupementExperiences : { experiencesRetenues: [...], groupes: [...] } ; sans groupe, le réglage ne change rien.
  if (!(reg.groupes && reg.groupes.length)) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mep-regroupement]'), function (el) {
      _mepGriserElement(el, 'Sans effet : l’assistant n’a proposé aucun regroupement d’expériences pour ce CV');
    });
  }
}
// Case sans objet sur ce modele : grisee, jamais cliquable, avec la raison ecrite a cote (meme principe que « Petits carres »).
function _mepCkMqSansObjet(attr, libelle, coche, grise, raison, aide) {
  // Retour Denis 2026-10-03 : toute option de la carte « Organisation du CV » reste VISIBLE. Inutilisable (modele a sa propre disposition, Mini CV A5, sans objet ici), elle est
  // grisee et son « ? » dit pourquoi : plus aucun message entre parentheses. Utilisable, le « ? » explique ce qu'elle fait (meme presentation pour toutes).
  if (!grise) { return aide ? _mepCkMqAide(attr, libelle, coche, aide) : _mepCkMq(attr, libelle, coche); }
  var tmp = document.createElement('textarea'); tmp.innerHTML = raison || 'ce mod&egrave;le a sa propre disposition';
  var pourquoi = (aide ? aide + ' ' : '') + 'Indisponible ici : ' + tmp.value + '.';
  return _mepCkMqAide(attr, libelle, coche, pourquoi).replace('<input ', '<input disabled ').replace('class="ck"', 'class="ck sans-objet"');
}// Experiences du dossier qui ne figurent pas sur le CV (ecartees par un ancien choix de l'assistant, ou absentes du dernier calcul).
function _mepExperiencesAbsentesDuCV() {
  var moteur = (window._mepExperiencesMoteur && window._mepExperiencesMoteur.length) ? window._mepExperiencesMoteur : null;
  if (!moteur) { return []; }
  var cle = function (e) { return String(e.poste || '').trim().toLowerCase() + '|' + String(e.entreprise || '').trim().toLowerCase() + '|' + String(e.dateDebut || ''); };
  var presentes = moteur.map(cle);
  return (dossier.experiences || []).filter(function (e) { return e && e.poste && presentes.indexOf(cle(e)) === -1; });
}
// Retour Denis 2026-09-30 : position des dates des formations et de l'experience personnelle. Par defaut « alignees » sur les experiences ;
// dissociees, chaque rubrique a son propre choix (« Comme le modele » = la position d'origine du modele, comme avant).
// Style d'ecriture commun (retour Denis 2026-10-02) : les trois rubriques s'ecrivent-elles deja pareil ? (style des missions, titre de formation par defaut, pas de titre
// propre a l'experience personnelle). Sert a cocher l'option d'office SEULEMENT quand cocher ne change rien.
function _mepAccordStylesRubriques() {
  var c = dossier.reglagesMiseEnPageCV || {}, choix = _mepEtatChoixMq();
  var m = function (v) { return v === 'condense' ? 'condense' : 'epure'; };
  var memeMissions = m(c.styleProfessionnel) === m(c.stylePersonnel) && m(c.styleProfessionnel) === m(c.styleFormations);
  var st = choix.styleTitreFormation || {};
  return memeMissions && st.gras !== false && !st.italique && !st.souligne && !choix.styleTitrePerso;
}
// Option cochee : choix explicite, sinon cochee d'office quand les trois rubriques s'ecrivent deja pareil.
function _mepStyleCommunActif() {
  var v = _mepEtatChoixMq().styleCommun;
  return v === true || (v !== false && _mepAccordStylesRubriques());
}
// Grise une zone de reglages d'ecriture quand le style commun est actif : boutons desactives, mention de la raison (jamais un bouton actif qui ne fait rien).
function _mepGriserSiStyleCommun(html, suivre) {
  if (!suivre) { return html; }
  return '<span class="suit" style="opacity:.5">' + html.replace(/<button type="button"/g, '<button type="button" disabled').replace(/<input type="range"/g, '<input type="range" disabled') + '</span>' +
    '<span class="note-suit">comme les exp&eacute;riences</span>';
}
function _mepEtatDates() {
  var pr = dossier.pdfReglages;
  if (pr && typeof pr === 'object' && Object.keys(pr).length) {
    return { alignees: pr.datesAlignees === undefined ? true : !!pr.datesAlignees, formations: pr.positionDatesFormations || '', perso: pr.positionDatesPerso || '' };
  }
  try {
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow;
    return { alignees: w._cvPdfDatesAlignees !== false, formations: w._cvPdfPositionDatesFormations || '', perso: w._cvPdfPositionDatesPerso || '' };
  } catch (e) { return { alignees: true, formations: '', perso: '' }; }
}
// Boite « Dates » d'une rubrique qui capte une date (lot 2026-10-04) : « Comme l'ensemble des rubriques » (suit « Dates alignees » et « Afficher les mois » d'Organisation du CV),
// sinon position, forme et mois PROPRES a la rubrique. Valeur enregistree : choixMq.datesParRubrique[rub] = { suit:false, pos, forme, mois } ; absente = suit l'ensemble.
// rub : 'exp' | 'form' | 'cert' | 'perso'. `avecPosition` faux pour les experiences : leur position se regle dans la boite « Position des dates » juste au-dessus (elle sert de reference aux autres).
function _mepEtatDatesRub(rub) {
  var choix = _mepEtatChoixMq().datesParRubrique || {};
  var moisGlobal = !!_mepEtatChoixMq().moisAffiches;
  if (choix[rub]) { return Object.assign({ suit: false, pos: '', forme: 'annees', mois: moisGlobal }, choix[rub]); }
  var ancien = _mepEtatDates();
  var posAncienne = (rub === 'form') ? ancien.formations : (rub === 'perso' ? ancien.perso : '');
  if (posAncienne && !ancien.alignees) { return { suit: false, pos: posAncienne, forme: 'annees', mois: moisGlobal }; }
  return { suit: true, pos: '', forme: 'annees', mois: moisGlobal };
}
var _mepDatesPlusOuvert = {};
// Le bouton seul (ferme) : « Plus d'options pour les dates » ; bleu quand les options sont ouvertes. Les options ne prennent de la place que si la personne les ouvre.
// Nombre de missions CONSEILLE par l'assistant pour une experience (cv.md, point 14 : nombreMissionsSuggere), retrouve par poste / entreprise. Simple suggestion :
// rien ne change tant que la personne ne clique pas sur « Appliquer » (decision de Denis, 2026-10-04) ; 0 = aucun conseil.
function _mepNombreConseilleMissions(e) {
  var reco = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations) || {};
  var retenues = (reco.regroupementExperiences && reco.regroupementExperiences.experiencesRetenues) || [];
  var trouve = retenues.filter(function (r) {
    return r && r.type === 'professionnelle' && r.nombreMissionsSuggere && r.poste && e && e.poste && correspond(e.poste, r.poste) &&
      (!r.entreprise || !e.entreprise || correspond(e.entreprise, r.entreprise));
  })[0];
  return trouve ? trouve.nombreMissionsSuggere : 0;
}
function _mepHtmlDatesBouton(rub) {
  var ouvert = !!_mepDatesPlusOuvert[rub], e = _mepEtatDatesRub(rub);
  return '<span class="dates-plus"><button type="button" class="btn-miss' + (ouvert ? ' actif' : '') + '" data-mep-dates-plus="' + rub + '" aria-expanded="' + ouvert + '">Plus d&rsquo;options' + (ouvert ? ' &#9652;' : ' &#9662;') + '</button>' +
    (e.suit ? '' : ' <span class="sous">choix propres</span>') + '</span>';
}
// Les options elles-memes (visibles seulement si le bouton est ouvert).
function _mepHtmlDatesContenu(rub, avecPosition) {
  if (!_mepDatesPlusOuvert[rub]) { return ''; }
  var e = _mepEtatDatesRub(rub), propre = _mepDispositionPropre();
  var off = e.suit ? ' disabled' : '';
  var rad = function (champ, val, lib, desactive) {
    return '<label class="rad"><input type="radio" name="mepDates' + rub + champ + '" data-mep-dates-' + champ + '="' + rub + ':' + val + '"' + ((e[champ] || (champ === 'pos' ? '' : 'annees')) === val ? ' checked' : '') + (off || (desactive ? ' disabled' : '')) + '> ' + lib + '</label>';
  };
  var position = avecPosition
    ? '<div class="titre-mini" style="margin-top:.4rem">Position</div>' +
      rad('pos', 'droite', '&Agrave; droite') + rad('pos', 'sous', 'Sous le titre') + rad('pos', 'avant', 'Avant le titre') + rad('pos', 'apres', 'Juste apr&egrave;s le titre', propre) +
      (propre ? '<p class="choix-aide" style="margin:.1rem 0">&laquo;&nbsp;Juste apr&egrave;s le titre&nbsp;&raquo; n&rsquo;existe pas dans ce mod&egrave;le : il a sa propre disposition.</p>' : '')
    : '';
  return '<div class="boite" style="margin-top:.4rem">' + (avecPosition ? '' : '<h4>Options des dates</h4>') +
    '<label class="ck"><input type="checkbox" data-mep-dates-suit="' + rub + '"' + (e.suit ? ' checked' : '') + '> Comme l&rsquo;ensemble des rubriques ' + _mepAideBtn('Suit &laquo;&nbsp;Dates align&eacute;es&nbsp;&raquo; et &laquo;&nbsp;Afficher les mois&nbsp;&raquo; de la carte Organisation du CV. D&eacute;cochez pour choisir les dates de cette rubrique seulement.') + '</label>' +
    '<div' + (e.suit ? ' style="opacity:.5"' : '') + '>' + position +
    '<div class="titre-mini" style="margin-top:.4rem">Forme</div>' +
    rad('forme', 'annees', 'Ann&eacute;es (2019 - 2021)') + rad('forme', 'parentheses', 'Entre parenth&egrave;ses (2019 - 2021)') + rad('forme', 'fin', 'Ann&eacute;e de fin seule (2021)') +
    '<label class="ck" style="margin-top:.3rem"><input type="checkbox" data-mep-dates-mois="' + rub + '"' + (e.mois ? ' checked' : '') + off + '> Afficher les mois</label></div>' +
    (e.suit ? '<p class="choix-aide" style="margin:.2rem 0 0">Les choix de cette bo&icirc;te s&rsquo;activent quand la case est d&eacute;coch&eacute;e.</p>' : '') +
    '</div>';
}
function _mepHtmlDatesRubrique(rub, avecPosition) {
  return '<div style="margin-top:.5rem"><div class="boite-titre-bouton"><h4>Dates</h4>' + _mepHtmlDatesBouton(rub) + '</div>' + _mepHtmlDatesContenu(rub, avecPosition) + '</div>';
}
function _mepHtmlPositionDatesRubrique(rub, courant) {
  var choix = [['droite', '&Agrave; droite'], ['sous', 'Sous le titre'], ['avant', 'Avant le titre'], ['', 'Comme le mod&egrave;le']];
  return '<div class="boite" style="margin-top:.6rem"><h4>Position des dates</h4>' +
    choix.map(function (c) {
      return '<label class="rad"><input type="radio" name="mepDatesRub' + rub + '" data-mep-datesrub="' + rub + ':' + c[0] + '"' + ((courant || '') === c[0] ? ' checked' : '') + '> ' + c[1] + '</label>';
    }).join('') + '</div>';
}
function _mepCkMq(attr, libelle, coche, classe) {
  return '<label class="' + (classe || 'ck') + '"><input type="checkbox" ' + attr + (coche ? ' checked' : '') + '> ' + libelle + '</label>';
}
// ============================================================
// Intitulés des rubriques modifiables (retour Denis 2026-10-03, maquette docs/MAQUETTE_INTITULES_RUBRIQUES_2026-10-03.html)
// La CLÉ d'une rubrique reste son nom d'origine (_PDF_INTITULES) : data-rub, réglages par rubrique, retraits, déplacements, ordre. Seul le texte
// AFFICHÉ change (_pdfLibelle, cvPdfTemplateMaquette.js), et le titre de la carte du panneau suit le même texte (_mepIntitule).
// Valeur enregistrée : choixMq.intitulesPerso = { 'Nom d'origine': 'Intitulé choisi' } (40 caractères au plus ; vide = nom d'origine).
// ============================================================
var _MEP_INTITULES_PROPOSITIONS = {
  'Compétences': ['Compétences clés', 'Savoir-faire'],
  'Compétences professionnelles': ['Compétences', 'Savoir-faire', 'Compétences techniques', 'Expertises', 'Domaines de compétences', 'Aptitudes professionnelles', 'Compétences métier'],
  'Compétences comportementales': ['Qualités', 'Savoir-être', 'Aptitudes personnelles', 'Atouts personnels', 'Qualités professionnelles', 'Compétences relationnelles'],
  'Compétences en action': ['Savoir-faire en action', 'Compétences en pratique'],
  'Savoirs': ['Connaissances'],
  'Expérience professionnelle': ['Parcours professionnel', 'Parcours et expériences', 'Parcours et emplois', 'Expérience professionnelle'],
  'Formations': ['Formation', 'Parcours de formation', 'Études', 'Diplômes et formations', 'Cursus', 'Parcours académique'],
  'Expérience personnelle': ['Bénévolat', 'Engagements', 'Projets personnels', 'Activités personnelles', 'Expériences extra-professionnelles', 'Réalisations personnelles', 'Activités associatives', 'Vie associative'],
  'Logiciels et outils': ['Outils', 'Logiciels'],
  'Langues': ['Langues parlées'],
  'Certifications': ['Habilitations', 'Certificats'],
  'Centres d’intérêt': ['Loisirs', 'Centres d’intérêt personnels', 'Passions', 'Activités extra-professionnelles', 'Activités de loisirs'],
  'Informations complémentaires': ['Informations pratiques', 'Autres informations']
};
// Texte affiché par défaut quand il diffère de la clé (« Expériences professionnelles » au pluriel, décision de Denis 2026-10-03).
var _MEP_LIBELLES_DEFAUT = { 'Expérience professionnelle': 'Expériences professionnelles' };
function _mepLibelleDefaut(origine) { return _MEP_LIBELLES_DEFAUT[origine] || origine; }
var _mepIntituleOuvert = {};
// Nom affiché d'un groupe de la liste « Ordre des rubriques » (Organisation du CV) : l'intitulé choisi pour les groupes qui sont UNE rubrique.
function _mepNomGroupeOrganisation(k) {
  var origine = (k === 'exp') ? _PDF_INTITULES.experience : (k === 'form') ? _PDF_INTITULES.formations : '';
  var v = origine ? _mepNettoyerIntitule(_mepIntitulesPerso()[origine]) : '';
  return v ? echapperAttribut(v) : _MEP_NOMS_GROUPES_ORGANISATION[k];
}
function _mepIntitulesPerso() {
  var m = _mepEtatChoixMq().intitulesPerso;
  return (m && typeof m === 'object') ? m : {};
}
// Rubriques réellement présentes sur le CV, lues dans le rendu (data-rub) : seules celles-là peuvent être renommées (retour Denis 2026-10-03).
// null tant que l'aperçu n'est pas prêt.
function _mepClesRubriquesSurLeCv() {
  try {
    var f = document.querySelector('#zonePdfInlineCV iframe'), d = f && f.contentWindow && f.contentWindow.document;
    if (!d || !d.querySelector('#conteneurPage')) { return null; }
    var cles = {};
    d.querySelectorAll('#conteneurPage [data-rub]').forEach(function (e) { cles[e.getAttribute('data-rub')] = true; });
    return cles;
  } catch (e) { return null; }
}
function _mepNettoyerIntitule(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, 40); }
// Texte affiché d'une rubrique : l'intitulé choisi, sinon le nom d'origine.
function _mepIntitule(origine) { return _mepNettoyerIntitule(_mepIntitulesPerso()[origine]) || _mepLibelleDefaut(origine); }
// Titre d'une carte du panneau : l'intitulé choisi s'il y en a un, sinon le titre habituel de la carte.
function _mepTitreCarte(origine, titreHabituel) {
  var v = _mepNettoyerIntitule(_mepIntitulesPerso()[origine]), sur = _mepClesRubriquesSurLeCv();
  return (v && sur && sur[origine]) ? echapperAttribut(v) : titreHabituel;
}
function _mepDefinirIntitule(origine, valeur) {
  var copie = {};
  var actuel = _mepIntitulesPerso();
  Object.keys(actuel).forEach(function (k) { copie[k] = actuel[k]; });
  var v = _mepNettoyerIntitule(valeur);
  if (!v || v === _mepLibelleDefaut(origine)) { delete copie[origine]; } else { copie[origine] = v; }
  _mepDefinirChoixMq('intitulesPerso', Object.keys(copie).length ? copie : null);
}
// Bouton « Changer l'intitulé » + propositions (cachées tant qu'on n'a pas cliqué) + « Autre... » en saisie libre.
function _mepHtmlIntituleMq(origine, avecTitre, note, toujours) {
  var courant = _mepIntitule(origine);
  var libDefaut = _mepLibelleDefaut(origine);
  var props = [libDefaut].concat((_MEP_INTITULES_PROPOSITIONS[origine] || []).filter(function (t) { return t !== libDefaut; }));
  if (origine === _PDF_INTITULES.formations && _mepNbCertifications() && !_mepCertifsRubriqueActive()) { props.push('Formations et certifications'); }
  var ouvert = !!_mepIntituleOuvert[origine];
  var o = echapperAttribut(origine);
  var sur = _mepClesRubriquesSurLeCv();
  var titre = avecTitre ? '<div class="sous-rub"><b>' + echapperAttribut(courant) + '</b>' + (note ? ' <span class="sous">(' + note + ')</span>' : '') + '</div>' : '';
  // Chaque proposition se choisit d'un clic ET reste modifiable (retour Denis 2026-10-03) : le champ est rempli avec l'intitulé en cours, la personne l'ajuste
  // (par exemple « Engagements et autres expériences ») puis valide. Le retour au nom d'origine est un vrai bouton.
  var surCV = !!(sur && sur[origine]);
  // « toujours » : le bouton reste VISIBLE mais grisé tant que la rubrique n'est pas sur le CV (informations complémentaires).
  return '<div class="ligne-intitule" data-mep-intitule-zone="' + o + '"' + (toujours ? ' data-toujours="1"' : '') + ((surCV || toujours) ? '' : ' hidden') + '>' + titre +
    '<div class="ligne-comp" style="flex-wrap:wrap"><button type="button" class="btn-miss' + (ouvert ? ' actif' : '') + '" data-mep-intitule-ouvrir="' + o + '"' + ((toujours && !surCV) ? ' disabled title="Disponible d&egrave;s que cette rubrique est sur le CV"' : '') + ' aria-expanded="' + ouvert + '">&#9998; Changer l&rsquo;intitul&eacute;' + (ouvert ? ' &#9652;' : ' &#9662;') + '</button>' + _mepAideBtn('Change le titre de cette rubrique sur le CV : choisissez une proposition ou &eacute;crivez le v&ocirc;tre. Le m&ecirc;me titre appara&icirc;t aussi dans ce panneau, pour retrouver facilement la rubrique.') +
    (courant !== libDefaut ? '<span class="sous">Sur le CV : &laquo;&nbsp;' + echapperAttribut(courant) + '&nbsp;&raquo;</span>' : '') + '</div>' +
    '<div class="zone-propositions"' + (ouvert ? '' : ' hidden') + '>' +
    '<div class="seg seg-mini">' + props.map(function (t, i) {
      return '<button type="button" data-mep-intitule-choisir="' + o + '" data-valeur="' + echapperAttribut(t) + '"' + (courant === t ? ' class="on"' : '') + '>' + echapperAttribut(t) + (i === 0 ? '<small>nom d&rsquo;origine</small>' : '') + '</button>';
    }).join('') + '</div>' +
    '<div class="libre ligne-comp"><input type="text" maxlength="40" data-mep-intitule-texte="' + o + '" value="' + echapperAttribut(courant) + '" placeholder="Modifiez ou &eacute;crivez votre intitul&eacute; (40 lettres au plus)" aria-label="Modifier l&rsquo;intitul&eacute;"><button type="button" class="btn-miss" data-mep-intitule-valider="' + o + '" disabled title="Écrivez un autre intitulé pour pouvoir valider">Valider</button>' +
    (courant !== libDefaut ? '<button type="button" class="btn-miss" data-mep-intitule-retour="' + o + '">Revenir au nom d&rsquo;origine</button>' : '') + '</div>' +
    '</div></div>';
}
function _mepMajIntitulesVisibles() {
  var sur = _mepClesRubriquesSurLeCv();
  document.querySelectorAll('.ligne-intitule[data-mep-intitule-zone]').forEach(function (z) {
    var surCV = !!(sur && sur[z.getAttribute('data-mep-intitule-zone')]);
    if (z.getAttribute('data-toujours')) {
      var b = z.querySelector('[data-mep-intitule-ouvrir]'); b.disabled = !surCV; b.title = surCV ? '' : 'Disponible dès que cette rubrique est sur le CV';
      if (!surCV) { z.querySelector('.zone-propositions').hidden = true; }
    } else { z.hidden = !surCV; }
  });
  document.querySelectorAll('.autres-titres').forEach(function (g) { g.hidden = !g.querySelector('.ligne-intitule:not([hidden])'); });
}
function _mepBrancherIntitules(racine) {
  racine.querySelectorAll('[data-mep-intitule-ouvrir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var o = b.getAttribute('data-mep-intitule-ouvrir'), z = b.closest('.ligne-intitule').querySelector('.zone-propositions');
      z.hidden = !z.hidden; _mepIntituleOuvert[o] = !z.hidden;
      b.setAttribute('aria-expanded', z.hidden ? 'false' : 'true');
      b.classList.toggle('actif', !z.hidden);
      b.innerHTML = '&#9998; Changer l&rsquo;intitul&eacute;' + (z.hidden ? ' &#9662;' : ' &#9652;');
    });
  });
  racine.querySelectorAll('[data-mep-intitule-choisir]').forEach(function (b) {
    b.addEventListener('click', function () { _mepDefinirIntitule(b.getAttribute('data-mep-intitule-choisir'), b.getAttribute('data-valeur')); });
  });
  racine.querySelectorAll('[data-mep-intitule-valider]').forEach(function (b) {
    var o = b.getAttribute('data-mep-intitule-valider'), champ = b.closest('.libre').querySelector('input'), depart = champ.value;
    // « Valider » n'est actif que s'il y a un texte différent de l'intitulé en cours (retour Denis 2026-10-03) ; vide ou inchangé : grisé.
    champ.addEventListener('input', function () {
      var v = _mepNettoyerIntitule(champ.value);
      b.disabled = !(v && v !== _mepNettoyerIntitule(depart));
      b.title = b.disabled ? 'Écrivez un autre intitulé pour pouvoir valider' : '';
    });
    b.addEventListener('click', function () { if (!b.disabled) { _mepDefinirIntitule(o, champ.value); } });
    champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!b.disabled) { b.click(); } } });
  });
  racine.querySelectorAll('[data-mep-intitule-retour]').forEach(function (b) {
    b.addEventListener('click', function () { _mepDefinirIntitule(b.getAttribute('data-mep-intitule-retour'), ''); });
  });
}

// Petit « ? » seul (retour Denis 2026-10-03) : à placer dans le texte d'une option ; le complément s'affiche au clic (ligne sous l'option, créée à la demande) et au survol.
function _mepAideBtn(texte) {
  return '<button type="button" class="aide-option" data-mep-aide-option aria-expanded="false" title="' + texte + '" aria-label="Explication : ' + texte + '">?</button>';
}
// Option courte + petit « ? » (retour Denis 2026-10-03) : l'intitule reste court, le complement s'affiche au clic sur « ? » (et au survol, attribut title).
// Composant unique, reutilisable par toutes les cartes ; marche aussi au doigt (pas de survol sur tablette).
function _mepCkMqAide(attr, libelle, coche, aide) {
  // Le « ? » est DANS le texte de l'option, à la fin de sa dernière ligne (dernier mot et « ? » insécables) : jamais séparé de son intitulé,
  // jamais pris pour celui du bouton voisin. (Un bouton dans un label ne coche pas la case.)
  return '<div class="opt-aide">' + _mepCkMq(attr, '<span>' + libelle.replace(/(\S+)$/, '<span class="mot-final">$1') + ' <button type="button" class="aide-option" data-mep-aide-option aria-expanded="false" title="' + echapperAttribut(aide) + '" aria-label="Explication : ' + echapperAttribut(aide) + '">?</button></span></span>', coche) +
    '<p class="aide-option-texte" hidden>' + echapperAttribut(aide) + '</p></div>';
}
// Choix du signe entre missions condensees : UN reglage pour les 3 rubriques (experiences, experience personnelle, formations),
// montre seulement sous un « Style des missions » deja sur Condense.
function _mepHtmlSigneMissionsMq(condenseActif) {
  if (!condenseActif) { return ''; }
  var actuel = (dossier.reglagesMiseEnPageCV || {}).separateurMissions || 'pointvirgule';
  return '<div class="inline" style="margin-top:.4rem"><label>Signe entre les missions ' + _mepAideBtn('Un seul r&eacute;glage pour les 3 rubriques : exp&eacute;riences, exp&eacute;rience personnelle et formations.') + '</label>' +
    _mepSegMq('mep-sepmissions', [['pointvirgule', ';'], ['pointmedian', '&middot;'], ['rond', '&#9679;'], ['carre', '&#9632;'], ['losange', '&#9670;'], ['barre', '|']], actuel, 'seg-mini') + '</div>';
}
// Option grisee mais VISIBLE (retour Denis 2026-10-03) : boutons desactives + « ? » qui dit pourquoi.
function _mepSegGriseMq(attr, options, actuel, classeSeg) {
  return _mepSegMq(attr, options, actuel, classeSeg).replace(/<button type="button"/g, '<button type="button" disabled');
}
// « Competences professionnelles et comportementales » : sur la meme ligne (professionnelles a gauche, comportementales a droite) ou l'une sous l'autre.
function _mepHtmlProCompDispoMq() {
  var choix = _mepEtatChoixMq(), mode = _mepEtatExperiences().mode;
  var actuel = choix.proCompDispo || (choix.blocsCourts === 'dessous' ? 'sous' : 'ligne');
  var opts = [['ligne', 'Sur la m&ecirc;me ligne'], ['sous', 'L&rsquo;une sous l&rsquo;autre']];
  var raison = null;
  if (mode === 'C') { raison = 'En &laquo;&nbsp;Par comp&eacute;tences&nbsp;&raquo;, il n&rsquo;y a pas de bloc &laquo;&nbsp;Comp&eacute;tences professionnelles&nbsp;&raquo; : ce sont les comp&eacute;tences en action.'; }
  else if (String((dossier.reglagesMiseEnPageCV || {}).colonnes) === '2') { raison = 'Avec deux colonnes, chaque bloc a sa colonne.'; }
  else if (_mepDispositionPropre()) { raison = 'Ce mod&egrave;le a sa propre disposition.'; }
  // Boutons sur toute la largeur de la ligne, partagee en deux (retour Denis 2026-10-03) ; le « ? » est dans le libelle.
  return '<div class="champ champ-pleine"><label>Comp&eacute;tences professionnelles et comportementales ' + _mepAideBtn(raison ? 'Indisponible ici : ' + raison : 'Sur la m&ecirc;me ligne : les professionnelles &agrave; gauche, les comportementales &agrave; droite (le regard lit de gauche &agrave; droite). Tant que vous ne choisissez rien ici, ce r&eacute;glage suit &laquo;&nbsp;Blocs courts&nbsp;&raquo; (carte Organisation du CV).') + '</label>' +
    (raison ? _mepSegGriseMq('mep-procomp', opts, actuel) : _mepSegMq('mep-procomp', opts, actuel)) +
    // Retour a l'automatique : seulement quand la personne a fait son propre choix.
    ((!raison && choix.proCompDispo) ? '<div class="inline" style="margin-top:.25rem"><button type="button" class="btn-miss" data-mep-procomp="auto">Revenir au r&eacute;glage g&eacute;n&eacute;ral (&laquo;&nbsp;Blocs courts&nbsp;&raquo;)</button></div>' : '') + '</div>';
}
// Carte Experiences, modes « Par competences » et « Mixte » : disposition du bloc « Competences en action » et style de ses missions.
function _mepHtmlOptionsActionMq() {
  var choix = _mepEtatChoixMq(), mode = _mepEtatExperiences().mode;
  if (mode === 'A') { return ''; }
  var c = dossier.reglagesMiseEnPageCV || {};
  // Sans choix, la disposition suit le style des competences : en pastilles (hors deux colonnes) le bloc est deja sur la ligne des comportementales.
  var coteActuel = (typeof choix.actionCote === 'boolean') ? (choix.actionCote ? 'cote' : 'large') : ((_mepStyleCompGeneral() !== 'texte' && String(c.colonnes) !== '2') ? 'cote' : 'large');
  var dispo = [['large', 'Pleine largeur'], ['cote', '&Agrave; c&ocirc;t&eacute; des comportementales']];
  var aideDispo = (mode === 'B')
    ? 'Indisponible ici : en Mixte, les comp&eacute;tences comportementales sont d&eacute;j&agrave; avec les comp&eacute;tences professionnelles ; &laquo;&nbsp;Comp&eacute;tences en action&nbsp;&raquo; a sa propre ligne.'
    : 'Pleine largeur, bien d&eacute;taill&eacute; ; ou &agrave; gauche, avec les comp&eacute;tences comportementales &agrave; droite (retour &agrave; la ligne si c&rsquo;est long).';
  var disposHtml = (mode === 'B') ? _mepSegGriseMq('mep-action-dispo', dispo, 'large') : _mepSegMq('mep-action-dispo', dispo, coteActuel);
  var m = function (v) { return v === 'condense' ? 'condense' : 'epure'; };
  var styleActuel = (choix.styleMissionsAction === 'condense' || choix.styleMissionsAction === 'epure') ? choix.styleMissionsAction : m(c.styleProfessionnel);
  var miss = [['epure', 'Chaque mission sur une ligne'], ['condense', '&Agrave; la suite, avec un signe']];
  return '<div class="boite options-action" style="margin-top:.5rem"><h4>&laquo;&nbsp;' + _mepNomBlocColonneAfficheEnAction() + '&nbsp;&raquo; sur le CV</h4>' +
    '<div class="champ champ-pleine"><label>Disposition ' + _mepAideBtn(aideDispo) + '</label>' + disposHtml + '</div>' +
    '<div class="champ champ-pleine"><label>Missions ' + _mepAideBtn('M&ecirc;me r&eacute;glage que &laquo;&nbsp;Style des missions&nbsp;&raquo; des exp&eacute;riences, propre &agrave; ce bloc.') + '</label>' + _mepSegMq('mep-action-miss', miss, styleActuel) + '</div>' +
    _mepHtmlSigneMissionsMq(styleActuel === 'condense') + '</div>';
}
function _mepSegMq(attr, options, actuel, classeSeg) {
  return '<div class="seg' + (classeSeg ? ' ' + classeSeg : '') + '">' + options.map(function (o) {
    return '<button type="button" data-' + attr + '="' + o[0] + '"' + (String(actuel) === String(o[0]) ? ' class="on"' : '') + '>' + o[1] + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</button>';
  }).join('') + '</div>';
}
// TACHE (retour Denis 2026-09-28, point 13 : "je dois pouvoir choisir laquelle mission je
// garde, pas juste combien") : bouton "Missions / Choix personnel" + liste a cocher, PARTAGE
// entre Experiences, Formations et Experience personnelle -- meme markup exact, seul le
// prefixe data-mep-<prefixe>-... change. "cle" est l'index (Experiences, nombre) ou le texte
// normalise de l'item (Formations/Experience personnelle, _mepCleExpPerso/_pdfCleFormation) ;
// jamais 3 implementations paralleles a maintenir en parallele (LECONS, regle 13).
function _mepHtmlMissionsPickerMq(prefixe, cle, segments, choisieListe, n, ouvert) {
  var perso = !!choisieListe;
  var cleAttr = echapperAttribut(String(cle));
  var htmlMissions = '';
  if (ouvert) {
    var coches = perso ? choisieListe : segments.slice(0, n).map(function (m, k) { return k; });
    htmlMissions = '<div class="miss-liste"><div class="miss-tete"><span>' + coches.length + ' mission' + (coches.length > 1 ? 's' : '') + ' choisie' + (coches.length > 1 ? 's' : '') + ' sur ' + segments.length + ' propos&eacute;es</span>' +
      '<button type="button" data-mep-' + prefixe + '-raz="' + cleAttr + '">Remettre les premi&egrave;res</button></div>' +
      segments.map(function (m, k) {
        var coche = coches.indexOf(k) !== -1;
        return '<label class="' + (coche ? '' : 'non') + '"><input type="checkbox" data-mep-' + prefixe + '-mission="' + cleAttr + '|' + k + '"' + (coche ? ' checked' : '') + '><span>' + echapperAttribut(m) + '</span></label>';
      }).join('') + '</div>';
  }
  var bouton = '<button type="button" class="btn-miss' + (perso ? ' perso' : '') + '" data-mep-' + prefixe + '-choisir-missions="' + cleAttr + '">' + (perso ? 'Choix personnel' : 'Missions') + (ouvert ? ' &#9652;' : ' &#9662;') + '</button>';
  return { html: htmlMissions, bouton: bouton };
}

// ============================================================
// Carte 1 : Organisation du CV (cOrg)
// ============================================================
function _htmlSecOrganisationMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  _assurerReglagesMiseEnPageCV();
  var c = dossier.reglagesMiseEnPageCV || {};
  var etat = _mepEtatOrganisation();
  var choix = _mepEtatChoixMq();
  var rub = (c.rubriques && typeof c.rubriques === 'object') ? c.rubriques : {};
  var deuxColonnes = String(c.colonnes) === '2';
  var cote = (choix.blocsCourts === 'dessous') ? 'dessous' : 'cote';
  var boutonOrdre = 'border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-strong);border-radius:6px;width:28px;height:26px';
  var htmlPerso = '';
  if (etat.perso) {
    htmlPerso = deuxColonnes
      ? (_mepDispositionPropre() ? 'Ce mod&egrave;le a sa propre disposition : ses blocs ne se d&eacute;placent pas.' : _htmlPersoDeuxColonnesMq(etat, choix, c))
      : '<b>Ordre des rubriques</b>' + etat.ordrePerso.map(function (k, i) {
        return '<div style="display:flex;gap:.4rem;align-items:center;margin-top:.3rem"><span style="flex:1">' + _mepNomGroupeOrganisation(k) + '</span>' +
          '<button type="button" style="' + boutonOrdre + '" data-mep-org-perso-monter="' + i + '"' + (i === 0 ? ' disabled' : '') + '>&#9650;</button>' +
          '<button type="button" style="' + boutonOrdre + '" data-mep-org-perso-descendre="' + i + '"' + (i === etat.ordrePerso.length - 1 ? ' disabled' : '') + '>&#9660;</button></div>';
      }).join('');
    // Denis, 2026-09-29 : deplacer les rubriques a la SOURIS (et les mettre sur la meme ligne) se fait dans le grand apercu : ce bouton y mene directement
    // (une seule facon de faire, pas de doublon ; les fleches restent pour le simple changement d'ordre).
    if (!(deuxColonnes && _mepDispositionPropre())) {
      htmlPerso += '<div style="margin-top:.6rem"><button type="button" class="mep-btn" data-mep-rub-souris>&#10021; Placer les rubriques &agrave; la souris, m&ecirc;me sur une m&ecirc;me ligne (grand aper&ccedil;u)</button></div>';
    }
  }
  return '<details class="mep-carte" id="cOrg"' + (_mepCarteOuverte('cOrg', true) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('organisation', 'Organisation du CV', 'Choisissez l\'organisation g&eacute;n&eacute;rale de votre CV.', true, _mepCarteOuverte('cOrg', true)) +
    '<div class="carte-corps">' +
    '<div class="org-tete">' +
    '<div class="radio-gros"><button type="button" class="' + (etat.perso ? '' : 'on') + '" data-mep-org-standard>&#9673; Standard (recommand&eacute;)</button>' +
    '<button type="button" class="' + (etat.perso ? 'on' : '') + '" data-mep-org-perso>Personnaliser</button></div>' +
    '<div class="cote-inline' + (deuxColonnes ? ' sans-objet' : '') + '"><b>Blocs courts</b>' +
    (deuxColonnes ? _mepSegMq('mep-cote', [['cote', 'C&ocirc;te &agrave; c&ocirc;te'], ['dessous', 'L\'un sous l\'autre']], cote).replace(/<button type="button"/g, '<button type="button" disabled') + _mepAideBtn('Indisponible ici : avec deux colonnes, les blocs courts sont rang&eacute;s dans leur colonne. Repassez &agrave; une colonne pour les placer c&ocirc;te &agrave; c&ocirc;te ou l&rsquo;un sous l&rsquo;autre.')
      : _mepSegMq('mep-cote', [['cote', 'C&ocirc;te &agrave; c&ocirc;te'], ['dessous', 'L\'un sous l\'autre']], cote) + _mepAideBtn('R&egrave;gle les petits blocs : langues, logiciels, certifications, centres d&rsquo;int&eacute;r&ecirc;t. Les comp&eacute;tences ont leur propre r&eacute;glage dans la carte &laquo;&nbsp;Comp&eacute;tences&nbsp;&raquo;.')) + '</div>' +
    '</div>' +
    '<div class="sous-choix"' + (etat.perso ? '' : ' style="display:none"') + '>' + htmlPerso + '</div>' +
    '<h4 class="mini-titre">Options rapides</h4>' +
    '<div class="checks auto">' +
    // Retour Denis 2026-10-03 : TOUTES les options sont presentees pareil (un carre a cocher + un « ? » a cote du texte), toutes visibles ; inutilisables = grisees avec le « ? » qui dit pourquoi.
    // Retour Denis 2026-09-30 : le raccourci « dates a la meme place partout » est ici, avec les options rapides (il etait cache dans la carte Experiences).
    _mepCkMqAide('data-mep-dates-alignees', 'Dates align&eacute;es', _mepEtatDates().alignees, 'Toutes les rubriques placent leurs dates comme les expériences.') +
    // Retour Denis 2026-10-02 : meme principe pour l'ecriture (titre, style des missions, lieu). « Harmoniser » = cocher cette option (plus de bouton a part, 2026-10-03).
    _mepCkMqAide('data-mep-style-commun', 'M&ecirc;me &eacute;criture partout', _mepStyleCommunActif(), 'Les formations et l’expérience personnelle s’écrivent comme les expériences (titre, missions, lieu). Cocher cette option, c’est « harmoniser » : rendre l’écriture identique dans les trois rubriques.') +
    // Retour Denis 2026-09-30 : « Afficher les mois » vaut pour TOUTES les rubriques qui ont des dates (experiences, formations, experience personnelle), decoche par defaut.
    _mepCkMqAide('data-mep-mois-affiches', 'Afficher les mois', !!_mepEtatChoixMq().moisAffiches, 'Exemple : « sept. 2023 », dans toutes les rubriques qui ont des dates.') +
    // Retour Denis 2026-10-03 : meme forme de puce pour tout le CV (cochee d'office) ; decochee, chaque rubrique choisit la sienne (voir _mepHtmlPucesParRubrique).
    _mepCkMqAide('data-mep-puces-memes', 'M&ecirc;mes puces partout', !choix.formesPuces, 'Une seule forme de puce pour tout le CV. Décochez pour choisir une forme différente pour chaque rubrique.') +
    _mepCkMqAide('data-mep-dates-adapter', 'Adapter les dates c&ocirc;te &agrave; c&ocirc;te', _mepEtatChoixMq().adapterDatesCote !== false, 'Quand deux rubriques sont sur la même ligne, la date passe juste après le titre, entre parenthèses, pour que chacune tienne. Un choix fait dans la boîte « Dates » d’une rubrique reste prioritaire.') +
    _mepCkMqSansObjet('data-mep-org-comphaut', 'Comp&eacute;tences en haut', etat.compHaut, _mepFormatA5() || _mepDispositionPropre() || (etat.perso && deuxColonnes), _mepFormatA5() ? _MEP_RAISON_A5 : ((etat.perso && deuxColonnes) ? 'l&rsquo;ordre est r&eacute;gl&eacute; par &laquo;&nbsp;Personnaliser&nbsp;&raquo;' : null), 'Place les compétences avant les expériences.') +
    _mepCkMqSansObjet('data-mep-org-formavant', 'Formations en premier', etat.formAvant, _mepFormatA5() || (etat.perso && deuxColonnes), _mepFormatA5() ? _MEP_RAISON_A5 : 'l&rsquo;ordre est r&eacute;gl&eacute; par &laquo;&nbsp;Personnaliser&nbsp;&raquo;', 'Place les formations avant les expériences professionnelles.') +
    _mepCkMqSansObjet('data-mep-org-formgauche', 'Formations &agrave; gauche', !!_mepEtatChoixMq().formationsAGauche, !deuxColonnes || (etat.perso && deuxColonnes), !deuxColonnes ? 'cette option s&rsquo;applique &agrave; deux colonnes : cochez &laquo;&nbsp;Deux colonnes&nbsp;&raquo;' : 'l&rsquo;ordre est r&eacute;gl&eacute; par &laquo;&nbsp;Personnaliser&nbsp;&raquo;', 'Avec deux colonnes, place les formations dans la colonne de gauche.') +
    _mepCkMqAide('data-mep-org-deux', 'Deux colonnes', deuxColonnes, 'Répartit le CV sur deux colonnes : rubriques courtes à gauche, expériences à droite.') +
    _mepCkMqAide('data-mep-org-reduire', 'R&eacute;duire les espaces', c.densite === 'compact', 'Resserre les espaces entre les rubriques et les lignes, pour gagner de la place.') +
    // Retour Denis 2026-10-01 : le contraire de « Reduire les espaces », juste a cote. Meme reglage (densite : compact / normal / aere) : l'un decoche l'autre.
    _mepCkMqAide('data-mep-org-agrandir-espaces', 'Agrandir les espaces', c.densite === 'aere', 'Aère le CV : plus d’espace entre les rubriques et les lignes.') +
    _mepCkMqAide('data-mep-org-agrandir', 'Agrandir les titres', etat.agrandir, 'Agrandit les titres de rubriques.') +
    _mepCkMqAide('data-mep-org-icones', 'Ic&ocirc;nes des rubriques', !!c.icones, 'Ajoute un petit pictogramme devant chaque titre de rubrique.') +
    _mepCkMqAide('data-mep-org-iconescoord', 'Ic&ocirc;nes des coordonn&eacute;es', !!c.iconesCoordonnees, 'Ajoute un petit pictogramme devant le téléphone, le courriel et l’adresse.') +
    _mepCkMqSansObjet('data-mep-org-pastilles', 'Comp&eacute;tences en pastilles', c.styleCompetences !== 'texte-seul', _mepDispositionPropre(), null, 'Écrit les compétences dans des pastilles (petits cadres) plutôt qu’en simple texte.') +
    // TACHE (Denis, 2026-09-29, couleur par zone) : raccourci « couleurs liees / dissociees » : garder la meme couleur pour le fond du haut
    // (triangle, bandeau...) ET l'ecriture des titres (comportement d'origine), ou les dissocier. Meme reglage que dans la barre des couleurs.
    _mepCkMqAide('data-mep-org-couleursliees', 'Couleurs li&eacute;es', _pdfZonesLieesEffectif(choix.zonesLiees), 'Le fond du haut et les titres gardent la même couleur.') +
    '</div>' + _mepHtmlPucesParRubrique(choix) + _htmlBoutonOptionsSupp('org') + '</div></details>';
}
// Une forme de puce par rubrique (retour Denis 2026-10-03) : visible seulement quand « Mêmes puces partout » est décochée. choixMq.formesPuces = { exp, form, perso, comp } (null = même forme partout).
var _MEP_PUCES_FORMES = [['rond', '&bull;'], ['carre', '&#9642;'], ['triangle', '&#9656;'], ['losange', '&#9670;'], ['tiret', '&ndash;']];
function _mepHtmlPucesParRubrique(choix) {
  if (!choix.formesPuces) { return ''; }
  var lignes = [['exp', _PDF_INTITULES.experience], ['form', _PDF_INTITULES.formations], ['perso', _PDF_INTITULES.experiencePerso], ['comp', _PDF_INTITULES.competences]];
  return '<div class="puces-par-rubrique"><h4 class="mini-titre">Forme des puces, rubrique par rubrique ' + _mepAideBtn('Choisissez la forme de puce de chaque rubrique. Le Word reprend ces choix.') + '</h4>' +
    lignes.map(function (l) {
      return '<div class="inline" data-mep-puce-zone="' + l[0] + '"><label>' + echapperAttribut(_mepIntitule(l[1])) + '</label>' + _mepSegMq('mep-puce-rub', _MEP_PUCES_FORMES, choix.formesPuces[l[0]] || 'rond', 'seg-mini') + '</div>';
    }).join('') + '</div>';
}

// ============================================================
// Carte 1bis : En-tête de CV (cEntete)
// ============================================================
// TACHE (retour Denis 2026-09-28) : titre du CV et phrase d'accroche vivaient jusqu'ici dans "Mise
// en page et texte" (carte cTexte, plus bas) -- deplaces ici, juste apres "Organisation du CV" et
// avant "Experiences professionnelles" (decision explicite de Denis : "on commence par l'en-tete,
// apres on a experience, formation..."). "Nom a la couleur du metier vise" (lectureGuidee) N'EST PAS
// deplace ici : verifie que ce reglage est pilote par les presets de modele de la galerie
// (cvPdfPanneauReglages.js), pas un choix libre de la personne dans l'ecran actuel -- lui ajouter un
// controle manuel ici risquerait d'entrer en conflit avec le style choisi, a traiter a part si besoin.
function _htmlSecEnteteMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var iaCv = (dossier.ia && dossier.ia.cv) || {};
  var c = dossier.reglagesMiseEnPageCV || {};
  var sansAccroche = !!c.sansAccroche;
  // Titre du CV et phrase d'accroche : les propositions de l'assistant (jamais inventées ici). Sans proposition, une seule
  // ligne : la valeur actuelle.
  var titres = (iaCv.titresProposes || []).filter(Boolean);
  if (dossier.titreCV && titres.indexOf(dossier.titreCV) === -1) { titres = [dossier.titreCV].concat(titres); }
  var accroches = (iaCv.accrochesProposees || []).filter(Boolean);
  if (iaCv.profil && accroches.indexOf(iaCv.profil) === -1) { accroches = [iaCv.profil].concat(accroches); }
  // Repli : si rien n'a encore ete choisi explicitement (dossier.titreCV/ia.cv.profil vides), le
  // <select> retombe nativement sur sa 1re option (deja le cas avant ce chantier) -- le champ texte
  // doit refleter la MEME valeur affichee, jamais un champ vide qui ferait croire a un titre efface.
  var titreActuel = dossier.titreCV || titres[0] || '';
  // R9 : « Version courte » (une phrase) : affichee, choisie et modifiee a la place de la version longue de la MEME proposition.
  // La case n'existe que si l'assistant a fourni une version courte pour la proposition choisie.
  var accrocheCourteDispo = (typeof _cvAccrocheCourteChoisie === 'function') ? _cvAccrocheCourteChoisie(iaCv) : '';
  var modeCourt = !!(c.accrocheCourte && accrocheCourteDispo);
  var accrocheActuelle = modeCourt ? accrocheCourteDispo : (iaCv.profil || accroches[0] || '');
  // TACHE (retour Denis 2026-09-28, cohérence visuelle) : bouton "Modifier"/"Choisir" au même style
  // que "Choisir" des compétences (classe .btn-miss), dans le même conteneur .ligne-comp (flex, même
  // gap) -- jamais un lien texte isolé (classe .mep-lien, réservée aux vraies actions secondaires
  // hors carte, ex. "Revenir au modèle de départ").
  // TACHE (retour Denis 2026-09-28, comportement du bouton) : "Modifier" bascule sur un champ texte
  // -- le bouton devient alors "Annuler" (tant que rien n'a change) ou "Valider" (des la 1re frappe
  // qui differe de la valeur de depart, comparee en direct par l'ecouteur "input" plus bas, jamais
  // un rerendu complet a chaque frappe -- ca ferait perdre le curseur). Rien n'est ecrit sur le
  // dossier avant "Valider" : "Annuler" referme sans rien changer.
  var htmlTitreChamp;
  if (_mepEditerTitreCV) {
    htmlTitreChamp = '<div class="ligne-comp"><input type="text" class="mep-select" style="flex:1" data-mep-titre-texte data-mep-origine="' + echapperAttribut(titreActuel) + '" value="' + echapperAttribut(titreActuel) + '">' +
      '<button type="button" class="btn-miss" data-mep-titre-valider>Annuler</button></div>';
  } else {
    var htmlTitres = titres.map(function (t) { return '<option value="' + echapperAttribut(t) + '"' + (t === dossier.titreCV ? ' selected' : '') + '>' + echapperAttribut(t) + '</option>'; }).join('');
    htmlTitreChamp = '<div class="ligne-comp"><select id="mepSelMetier" class="mep-select" style="flex:1" data-mep-select-titre>' + htmlTitres + '</select>' +
      '<button type="button" class="btn-miss" data-mep-titre-modifier>&#9998; Modifier</button></div>';
  }
  var htmlAccrocheChamp;
  if (_mepEditerAccrocheCV) {
    htmlAccrocheChamp = '<div class="ligne-comp"><textarea class="mep-select" style="flex:1" rows="2" data-mep-accroche-texte data-mep-origine="' + echapperAttribut(accrocheActuelle) + '"' + (sansAccroche ? ' disabled' : '') + '>' + echapperAttribut(accrocheActuelle) + '</textarea>' +
      '<button type="button" class="btn-miss" data-mep-accroche-valider>Annuler</button></div>';
  } else {
    // Retour Denis 2026-10-03 : un menu déroulant natif coupe les phrases, impossible de les lire avant de choisir.
    // La phrase choisie s'affiche donc EN ENTIER, et une zone dépliante liste toutes les propositions en entier (une par ligne,
    // bouton rond). Mêmes attributs et mêmes gestionnaires qu'avant (data-mep-select-accroche), aucun 2e circuit.
    var accrocheChoisie = (iaCv.profil || accroches[0] || '');
    var htmlAccroches = accroches.map(function (t, i) {
      // En mode court, la liste montre la version courte de chaque proposition (sa version longue reste la valeur choisie).
      var rangT = (iaCv.accrochesProposees || []).indexOf(t);
      var courteT = (modeCourt && rangT >= 0 && iaCv.accrochesCourtesProposees) ? String(iaCv.accrochesCourtesProposees[rangT] || '').trim() : '';
      var libelleT = courteT || t;
      return '<label class="rad rad-accroche' + (t === accrocheChoisie ? ' choisie' : '') + '"><input type="radio" name="mepAccroche" data-mep-select-accroche value="' + echapperAttribut(t) + '"' + (t === accrocheChoisie ? ' checked' : '') + (sansAccroche ? ' disabled' : '') + '> ' +
        '<span class="rad-accroche-texte"><b>Proposition ' + (i + 1) + '</b> ' + echapperAttribut(libelleT) + '</span></label>';
    }).join('');
    htmlAccrocheChamp = '<div class="ligne-comp"><div class="accroche-actuelle" id="mepSelAccroche">' + echapperAttribut(modeCourt ? accrocheActuelle : accrocheChoisie) + '</div>' +
      // Sans accroche : le bouton reste visible mais desactive (decision de Denis 2026-09-29), comme le menu.
      '<button type="button" class="btn-miss" data-mep-accroche-modifier' + (sansAccroche ? ' disabled' : '') + '>&#9998; Modifier</button></div>' +
      (accroches.length > 1 ? '<details class="choix-exp' + (sansAccroche ? ' desactivee' : '') + '" id="zoneAccroches"' + ((!sansAccroche && _mepCarteOuverte('zoneAccroches', false)) ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Lire et choisir une autre phrase</span><span class="cb-fermer">Refermer les phrases</span></b>' +
        '<small>' + accroches.length + ' propositions, lisibles en entier</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
        '<div class="choix-corps"><div class="liste-accroches">' + htmlAccroches + '</div></div></details>' : '');
  }
  // TACHE (K6, 2026-09-28, decision de Denis apres avoir vu le cout d'un nouveau reglage) : plutot
  // que construire une taille/un gras/un italique propres au titre/a l'accroche/aux coordonnees, un
  // simple pont vers "Regler l'en-tete" (Apercu a taille reelle, position libre) qui gere deja tout
  // ca, independamment par bloc (nom/coordonnees/titre/accroche) -- deja cable, aucun nouveau code de
  // rendu. Pas de condition sur le modele "Photo et frise" (qui n'a pas d'en-tete a regler, voir
  // cvPdfPleinEcranMaquette.js ~239) : l'outil masque deja lui-meme son propre bouton dans ce cas,
  // inutile de dupliquer cette logique ici -- au pire, la personne ouvre l'Apercu et ne voit pas le
  // bouton, jamais une action qui echoue silencieusement.
  // Denis, 2026-09-29 : à l'arrivée, seule « Organisation du CV » est ouverte ; la personne ouvre les autres cartes une à une.
  return '<details class="mep-carte" id="cEntete"' + (_mepCarteOuverte('cEntete', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('entete', 'En-tête de CV', 'Titre affiché sous votre nom, phrase d’accroche', true, _mepCarteOuverte('cEntete', false)) +
    '<div class="carte-corps">' +
    '<div class="champ"><label>Titre du CV</label>' + htmlTitreChamp + '</div>' +
    // Sans accroche : tout le rectangle de la phrase devient translucide (elle n'apparaitra pas sur le CV).
    '<div class="champ"><div class="bloc-accroche' + (sansAccroche ? ' inactif' : '') + '"><label>Phrase d’accroche</label>' + htmlAccrocheChamp + '</div>' +
    // Denis, 2026-09-29 : les deux choix sur UNE ligne, en grands boutons ; « Version courte » a droite, sous le bouton « Modifier ».
    '<div class="ligne-accroche-options">' +
    _mepCkMq('data-mep-sans-accroche-case', 'Sans accroche', sansAccroche, 'ck ck-marque' + (sansAccroche ? ' on' : '')) +
    // Retour Denis 2026-10-03 : « Version courte » est TOUJOURS visible ; grisée (non cliquable) tant qu'il n'y a pas de phrase d'accroche choisie avec une version courte.
    _mepCkMq('data-mep-accroche-courte' + ((sansAccroche || !accrocheCourteDispo) ? ' disabled title="' + (sansAccroche ? 'Sans accroche : rien à raccourcir' : 'Aucune version courte proposée pour cette phrase') + '"' : ''), 'Version courte (une phrase)', !!c.accrocheCourte && !!accrocheCourteDispo, 'ck ck-marque' + ((sansAccroche || !accrocheCourteDispo) ? ' sans-objet' : (c.accrocheCourte ? ' on' : ''))) +
    '</div></div>' +
    // TACHE (retour Denis 2026-09-28/29, cohérence + compacité) : bouton dans la continuité du
    // texte (une seule ligne par action, jamais une ligne label + une ligne texte + une ligne
    // bouton) -- garde la carte courte. Toujours un vrai bouton bordé (.btn-miss), jamais un lien.
    // Retour Denis 2026-10-01 : mettre en gras le numero de telephone et/ou l'e-mail d'un clic (deux cases bien identifiees).
    '<div class="champ"><label>Coordonnées</label><div class="checks auto">' +
    _mepCkMq('data-mep-coord-gras="telephone"', 'Téléphone en gras', !!(_mepEtatChoixMq().coordGras || {}).telephone) +
    _mepCkMq('data-mep-coord-gras="email"', 'E-mail en gras', !!(_mepEtatChoixMq().coordGras || {}).email) +
    '</div></div>' +
    '<div class="champ"><div class="ligne-comp" style="flex-wrap:wrap">' +
    '<span class="sous-aide" style="margin:0">Taille, gras, italique du titre/de l’accroche/des coordonnées :</span>' +
    '<button type="button" class="btn-miss" data-mep-versgrand>Régler l’en-tête &#8594;</button>' +
    '</div>' +
    // TACHE (retour Denis 2026-09-29, "régression majeure en termes de parcours") : basculer sur
    // "Vos informations" ETAIT le comportement quand aucune photo n'existe encore (repli
    // volontaire, une seule fois) -- mais une fois une photo deja presente, la changer/la retirer
    // doit rester ICI, jamais un aller-retour d'ecran. Reutilise le bloc/cablage DEJA EXISTANT
    // (mepPhotoChanger/mepPhotoInput/mepPhotoInclure/mepPhotoRetirer, js/app.js ~18561-19027,
    // ajouterPhotoAuDossier() redimensionne deja en carre 400x400 et recadre au centre -- meme
    // mecanisme que "Vos informations", jamais une 2e logique d'import) : orphelin depuis la refonte
    // "ecran unique" (vivait dans l'ancien niveau "Simple", plus jamais rendu pour le PDF), mais son
    // cablage JS restait pose sans rien a cibler -- lui redonner un affichage ici le reactive tel quel.
    (function () {
      var aPhoto = !!(dossier.photo && dossier.photo.url);
      var inclurePhoto = !!(dossier.photo && dossier.photo.inclure);
      return '<div class="ligne-comp" style="flex-wrap:wrap;margin-top:.35rem">' +
        (aPhoto
          ? '<label style="display:flex;align-items:center;gap:.3rem;font-size:.8rem"><input type="checkbox" id="mepPhotoInclure"' + (inclurePhoto ? ' checked' : '') + '> Inclure ma photo</label>' +
            ((dossier.photo && dossier.photo.source) ? '<button type="button" class="btn-miss" id="mepPhotoAjuster">Ajuster le cadrage</button>' : '') +
            '<button type="button" class="btn-miss" id="mepPhotoChanger">Changer la photo</button>' +
            '<button type="button" class="btn-miss" id="mepPhotoRetirer">Retirer la photo</button>'
          : '<span class="sous-aide" style="margin:0">Photo :</span><button type="button" class="btn-miss" id="mepPhotoChanger">Ajouter ma photo</button>') +
        '<input type="file" id="mepPhotoInput" accept="image/*" style="display:none">' +
        '</div>';
    })() +
    _htmlBoutonOptionsSupp('entete') + '</div></details>';
}

// ============================================================
// Carte 2 : Expériences professionnelles (cExp)
// ============================================================
function _htmlSecExperiencesMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  _assurerReglagesMiseEnPageCV();
  var c = dossier.reglagesMiseEnPageCV || {};
  var etat = _mepEtatExperiences();
  var choix = _mepEtatChoixMq();
  var experiences = _mepListeExperiencesMoteur();
  window._mepSigCarteExperiences = _mepSigExperiences(experiences);
  var toutes = (etat.tout !== 'pertinentes');
  // TACHE (retour Denis 2026-09-28 : "je peux monter a l'infini... rien ne change sur le CV") :
  // le compteur global montait jusqu'a 10 (valeur arbitraire), meme quand aucune experience du
  // dossier n'a autant de missions -- au-dela du maximum REEL, cliquer sur "+" ne changeait plus
  // rien a l'affichage mais le chiffre continuait de grimper, trompeur. Plafond desormais calcule
  // sur la plus longue experience du dossier (jamais moins de 1).
  var maxMissionsExp = Math.max(1, experiences.reduce(function (max, e) {
    var seg = (typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(e.missions || '') : (e.missions || '').split('\n').filter(function (m) { return m.trim(); });
    return Math.max(max, seg.length);
  }, 1));
  var niveauDetail = (etat.missionsGlobal === 1) ? 'resume' : (etat.missionsGlobal != null && etat.missionsGlobal >= maxMissionsExp) ? 'complet' : 'auto';
  var missionsGlobalAffiche = (niveauDetail === 'resume') ? 1 : Math.min(maxMissionsExp, etat.missionsGlobal || ((typeof _cvMissionsParDefaut === 'function') ? _cvMissionsParDefaut(experiences.length) : 3));
  var ordrePdf = _mepOrdreExperiencesPdf();
  var ordreSelect = (ordrePdf === 'date-desc') ? 'recent' : (ordrePdf === 'date-asc') ? 'ancien' : (ordrePdf === 'mien') ? 'mien' : (ordrePdf === 'pertinence') ? 'pertinent' : 'autre';
  var nbAffichees = (!toutes && etat.choisies) ? etat.choisies.length : experiences.length;
  var nbPerso = 0;
  Object.keys(etat.missionsChoisies || {}).forEach(function (k) { if (etat.missionsChoisies[k]) { nbPerso++; } });
  Object.keys(etat.missionsParExp || {}).forEach(function (k) { if (etat.missionsParExp[k] != null && !(etat.missionsChoisies || {})[k]) { nbPerso++; } });
  var resumeChoix = nbAffichees + ' exp&eacute;rience' + (nbAffichees > 1 ? 's' : '') + ' affich&eacute;e' + (nbAffichees > 1 ? 's' : '') +
    (nbPerso ? ' &middot; ' + nbPerso + ' choix personnel' + (nbPerso > 1 ? 's' : '') : '') + ' &middot; cliquez pour modifier';

  // LIM-4 : missions saisies / missions affichees (experiences cochees), pour le rappel « X sur Y affichees ».
  var totalMissionsExp = 0, totalMissionsAffichees = 0;
  var lignesExp = experiences.map(function (e, i) {
    var estCochee = toutes || !etat.choisies || etat.choisies.indexOf(i) !== -1;
    // TACHE (audit "mise en page", 2026-09-28) : _pdfDecouperMissions (deja utilisee par le
    // rendu, cvPdfTemplateA4.js) au lieu d'un split('\n') nu -- une donnee ancienne encore
    // jointe en paragraphe (avant le correctif joindreMissionsImport/_joindreMissionsIA) reste
    // ainsi decoupable ici aussi, jamais "1 seule mission" par erreur.
    var segments = (typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(e.missions || '') : (e.missions || '').split('\n').map(function (m) { return m.trim(); }).filter(Boolean);
    var choisieListe = etat.missionsChoisies[i];
    var perso = !!choisieListe;
    var auto = window._mepMissionsAuto || {};
    window._mepSigCarteAuto = JSON.stringify(auto);
    // TACHE (retour Denis 2026-09-28, point 10 : "peu importe le mode... je dois toujours pouvoir
    // avoir acces au nombre de missions via le plus et le moins de chaque experience") : un reglage
    // PRECIS par experience (etat.missionsParExp[i]) prime desormais sur le mode "Resume" (comme le
    // fait deja le rendu final, _pdfAppliquerChoixMissions, cvPdfTemplateA4.js -- le panneau ne
    // faisait que forcer "1" a l'affichage, sans jamais refleter un reglage precis deja pose).
    var n = perso ? choisieListe.length : ((etat.missionsParExp[i] != null) ? Math.min(segments.length, etat.missionsParExp[i]) : ((niveauDetail === 'resume') ? 1 : Math.min(segments.length, (auto[i] != null) ? auto[i] : missionsGlobalAffiche)));
    if (estCochee) { totalMissionsExp += segments.length; totalMissionsAffichees += Math.min(segments.length, n); }
    var ouvert = !!_mepMissionsOuvertes[i];
    var periode = (typeof _pdfFormaterPeriode === 'function') ? _pdfFormaterPeriode(e.dateDebut, e.dateFin) : '';
    // TACHE (audit "La mise en page" 2026-09-27, P8/P12 -- bug reel confirme et
    // reproduit) : le compteur affiche "n" ci-dessus est deja plafonne par le
    // nombre REEL de missions de cette experience (segments.length), mais
    // _pdfDefinirMissionsExperience (cvPdfPanneauReglages.js, dans l'iframe)
    // recalculait sa propre base a partir de _cvPdfMissionsGlobal (4 par
    // defaut), sans connaitre ce plafond -- des qu'une experience avait MOINS
    // de missions que le reglage global, le premier clic sur "-" ne changeait
    // rien (4-1=3, deja la valeur affichee/plafonnee), donnant l'impression
    // fausse que le bouton "ne marche pas". Ce data-attribut transmet le "n"
    // REELLEMENT affiche pour que l'iframe reparte de la bonne base.
    var picker = _mepHtmlMissionsPickerMq('exp', i, segments, choisieListe, n, ouvert);
    var htmlMissions = picker.html;
    var conseille = Math.min(segments.length, _mepNombreConseilleMissions(e)), htmlConseil = '';
    if (!perso && conseille > 0 && conseille !== n) {
      htmlConseil = '<div class="conseil-missions">L&rsquo;assistant conseille ' + conseille + ' mission' + (conseille > 1 ? 's' : '') + ' pour cette exp&eacute;rience (vous en montrez ' + n + '). ' +
        '<button type="button" class="btn-miss" data-mep-exp-missions-conseil="' + i + ':' + conseille + ':' + n + '">Appliquer ' + conseille + '</button></div>';
    }
    // TACHE (retour Denis 2026-09-28, point 9 : "clic sur Choix personnel casse la mise en page")
    // : .ligne-bloc.ouvert passe en pleine largeur (grille .mep-liste-choix-exp, 2 colonnes
    // possibles) -- ne dependait que de la liste de missions ouverte (var "ouvert"), jamais du
    // formulaire d'edition (_htmlEditionExperienceMq, ajoute plus bas). Fermer "Choix personnel"
    // en laissant l'edition ouverte retombait donc sur la colonne etroite (300px) pour un
    // formulaire large -- d'ou le retrecissement constate au clic.
    var editionOuverteExp = _mepEditionExp && _mepExpEditee === _mepIndexDossierExperience(e);
    return '<div class="ligne-bloc' + ((ouvert || editionOuverteExp) ? ' ouvert' : '') + '"><label class="ligne-choix' + (estCochee ? '' : ' off') + '">' +
      '<input type="checkbox" data-mep-exp-choisie="' + i + '"' + (estCochee ? ' checked' : '') + (toutes ? ' disabled' : '') + '>' +
      '<span class="nom' + (_mepEditionExp ? ' cliquable' : '') + '"' + (_mepEditionExp && _mepIndexDossierExperience(e) >= 0 ? ' data-mep-exp-ouvrir="' + _mepIndexDossierExperience(e) + '" title="Cliquez pour modifier cette exp&eacute;rience"' : '') + '><b>' + echapperAttribut(e.poste || '') + '</b>' + (e.entreprise ? ' - ' + echapperAttribut(e.entreprise) : '') + (periode ? ' <em>(' + echapperAttribut(periode) + ')</em>' : '') + '</span>' +
      // TACHE (retour Denis 2026-09-28, point 10) : le compteur PAR EXPERIENCE reste accessible
      // meme en mode "Resume" -- seul le compteur GLOBAL (data-mep-missions-global-*, plus bas)
      // se verrouille dans ce mode ; un reglage precis par experience prime toujours (comme
      // "Choix personnel"), jamais bloque par le mode global.
      // « Stage » (retour Denis 2026-10-03) : un clic sur la ligne, sans ouvrir l'expérience. Déjà actif quand le stage a été reconnu dans le CV d'origine (poste « Stage ... »)
      // ou coché plus tôt ; filet de sécurité si on ne l'a pas capté.
      (_mepIndexDossierExperience(e) >= 0 ? '<button type="button" class="btn-stage" data-mep-exp-stage="' + _mepIndexDossierExperience(e) + '" aria-pressed="' + (_pdfEstStage(e) ? 'true' : 'false') + '" title="Cette exp&eacute;rience est un stage : le CV &eacute;crira &laquo;&nbsp;(stage)&nbsp;&raquo; apr&egrave;s le poste">' + (_pdfEstStage(e) ? '&#10003; Stage' : 'Stage') + '</button>' : '') +
      '<span class="pas"><button type="button" data-mep-exp-missions-moins="' + i + '" data-mep-exp-missions-n="' + n + '"' + (n <= 1 ? ' disabled' : '') + '>&minus;</button><span>' + n + '</span>' +
      '<button type="button" data-mep-exp-missions-plus="' + i + '" data-mep-exp-missions-n="' + n + '"' + (n >= segments.length ? ' disabled' : '') + '>+</button></span>' +
      '<span class="sur" title="Missions propos&eacute;es pour cette exp&eacute;rience">/' + segments.length + '</span>' +
      picker.bouton + '</label>' + htmlConseil +
      htmlMissions + (_mepEditionExp ? _htmlEditionExperienceMq(e, i) : '') + '</div>';
  }).join('');

  function radio(nom, attr, valeur, actuel, libelle, petit) {
    return '<label class="rad"><input type="radio" name="' + nom + '" ' + attr + '="' + valeur + '"' + (actuel === valeur ? ' checked' : '') + '> ' + (petit ? '<span class="mot-final">' + libelle + ' ' + _mepAideBtn(petit) + '</span>' : libelle) + '</label>';
  }
  function boutonSI(attr, actif, texte, titre) {
    return '<button type="button" class="btn-g-i' + (actif ? ' on' : '') + '" data-mep-evid-simple="' + attr + '" title="' + titre + '" style="border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-strong);border-radius:7px;padding:.25rem .55rem;font-size:.78rem">' + texte + '</button>';
  }
  var choixExpOuvert = _mepCarteOuverte('zoneChoixExp', false) || _mepEditionExp;
  var absentes = _mepExperiencesAbsentesDuCV();
  return '<details class="mep-carte" id="cExp"' + (_mepCarteOuverte('cExp', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('experiences', _mepTitreCarte(_PDF_INTITULES.experience, 'Exp&eacute;riences professionnelles'), 'Choisissez la fa&ccedil;on de pr&eacute;senter vos exp&eacute;riences.', true, _mepCarteOuverte('cExp', false)) +
    '<div class="carte-corps">' + _mepHtmlIntituleMq(_PDF_INTITULES.experience) +
    '<div class="quatre">' +
    '<div class="boite"><h4>Mode de pr&eacute;sentation</h4>' +
    radio('mepModePresentation', 'data-mep-mode-presentation', 'A', etat.mode, 'Chronologique', 'Pr&eacute;sentation classique.') +
    radio('mepModePresentation', 'data-mep-mode-presentation', 'C', etat.mode, 'Par comp&eacute;tences', 'Vos missions les plus importantes, rang&eacute;es par comp&eacute;tence. Ce ne sont pas des mots-cl&eacute;s.') +
    radio('mepModePresentation', 'data-mep-mode-presentation', 'B', etat.mode, 'Mixte', 'Des mots-cl&eacute;s de comp&eacute;tences, puis vos missions les plus importantes, puis vos exp&eacute;riences.') +
    (etat.mode !== 'A' ? _mepCkMq('data-mep-src-exp', 'Indiquer l\'exp&eacute;rience entre parenth&egrave;ses', !!choix.sourceExperience, 'ck" style="margin-top:.25rem') +
      '<p class="choix-aide" id="mepSrcAide" style="display:none;margin:.15rem 0 0"></p>' : '') +
    '</div>' +
    '<div class="boite"><h4>Exp&eacute;riences &agrave; afficher</h4>' +
    radio('mepExpTout', 'data-mep-exp-tout', 'toutes', etat.tout, 'Toutes les exp&eacute;riences', 'Affiche l\'ensemble de votre parcours.') +
    radio('mepExpTout', 'data-mep-exp-tout', 'pertinentes', etat.tout, 'Les plus pertinentes', 'Met en avant celles en lien avec votre projet.') +
    '</div>' +
    '<div class="boite"><h4>Niveau de d&eacute;tail</h4>' +
    radio('mepNiveauDetail', 'data-mep-niveau-detail', 'auto', niveauDetail, 'Automatique', 'Complet, raccourci seulement si le CV d&eacute;borde.') +
    radio('mepNiveauDetail', 'data-mep-niveau-detail', 'complet', niveauDetail, 'Complet') +
    radio('mepNiveauDetail', 'data-mep-niveau-detail', 'resume', niveauDetail, 'R&eacute;sum&eacute;') +
    '</div>' +
    '<div class="boite"><div class="boite-titre-bouton"><h4>Position des dates</h4>' + _mepHtmlDatesBouton('exp') + '</div>' +
    radio('mepPositionDates', 'data-mep-position-dates', 'droite', etat.positionDates, '&Agrave; droite du poste') +
    radio('mepPositionDates', 'data-mep-position-dates', 'sous', etat.positionDates, 'Sous le poste') +
    radio('mepPositionDates', 'data-mep-position-dates', 'avant', etat.positionDates, 'Avant le poste') +
    (_mepDispositionPropre() ? radio('mepPositionDates', 'data-mep-position-dates', 'apres', etat.positionDates, 'Juste apr&egrave;s le poste', 'Ce mod&egrave;le a sa propre disposition.').replace('<input type="radio"', '<input type="radio" disabled') : radio('mepPositionDates', 'data-mep-position-dates', 'apres', etat.positionDates, 'Juste apr&egrave;s le poste')) +
    '</div>' +
    '</div>' + _mepHtmlDatesContenu('exp', false) +
    // Retour Denis 2026-10-02 : « Editer les experiences » devient un vrai bouton, sous les quatre boites, dans les trois modes (avant : petite case
    // en bas de la carte, jugee quasi invisible). Meme case cochable qu'avant (data-mep-exp-editer, meme gestionnaire) : seul l'habillage change.
    '<label class="bouton-editer' + (_mepEditionExp ? ' on' : '') + '"><input type="checkbox" data-mep-exp-editer' + (_mepEditionExp ? ' checked' : '') + '>' +
    '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
    '<span>&Eacute;diter les exp&eacute;riences <small>(intitul&eacute;, lieu, dates, missions)</small></span></label>' +
    (absentes.length
      ? '<div class="alerte-exp-absentes" style="margin-top:.5rem;padding:.55rem .7rem;border:1px solid var(--warning-border,#e0a800);border-left-width:4px;background:var(--warning-bg,#fff8e1);border-radius:9px;font-size:.78rem">' +
        '<b>' + absentes.length + (absentes.length > 1 ? ' exp&eacute;riences de votre dossier ne sont pas sur le CV' : ' exp&eacute;rience de votre dossier n&rsquo;est pas sur le CV') + ' :</b> ' +
        absentes.map(function (e) { return echapperAttribut(e.poste) + (e.entreprise ? ' (' + echapperAttribut(e.entreprise) + ')' : ''); }).join(', ') + '.' +
        '<div style="margin-top:.4rem"><button type="button" class="mep-btn principal" data-mep-exp-ajouter-absentes>Ajouter au CV</button></div></div>' : '') +
    // Par competences et Mixte : les missions reellement affichees dans les competences (afficher / masquer, modifier, monter / descendre). Remplie apres chaque
    // rendu par _mepRemplirCompetencesMissionsMq (retour Denis 2026-10-02).
    // Retour Denis 2026-10-03 : la liste porte le VRAI NOM de la rubrique du CV (qui suit l'intitule choisi), dit ou elle se trouve, et son intitule se change ici (« Competences en action »,
    // aussi en « Par competences »). Nombre et ordre : cases, fleches monter / descendre, niveau de detail.
    (etat.mode !== 'A' ? _mepHtmlOptionsActionMq() + _mepHtmlIntituleMq(_PDF_INTITULES.competencesEnAction) + '<details class="choix-exp" id="zoneCompMissions"' + (_mepCarteOuverte('zoneCompMissions', false) ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">' +
      'Modifier &laquo;&nbsp;' + _mepNomBlocColonneAfficheEnAction() + '&nbsp;&raquo;</span><span class="cb-fermer">Refermer &laquo;&nbsp;' + _mepNomBlocColonneAfficheEnAction() + '&nbsp;&raquo;</span></b>' +
      '<small id="mepResumeCompMissions"></small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
      '<div class="choix-corps"><p class="choix-aide">Ces missions s&rsquo;affichent en haut du CV, sous &laquo;&nbsp;' + _mepNomBlocColonneAfficheEnAction() + '&nbsp;&raquo;. Pour chacune : la garder ou non, la modifier, la monter ou la descendre. Les autres restent dans vos exp&eacute;riences : une mission n&rsquo;est jamais r&eacute;p&eacute;t&eacute;e.</p>' +
      '<div class="mep-liste-choix-exp" id="mepListeCompMissions" style="grid-template-columns:1fr"></div></div></details>' : '') +
    // Mixte : acces aux competences professionnelles (pastilles) sans quitter la carte. MEME selection que la carte « Competences » (retour Denis 2026-10-02).
    (etat.mode === 'B' ? '<details class="choix-exp" id="zoneProMixte"' + (_mepCarteOuverte('zoneProMixte', false) ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Modifier &laquo;&nbsp;' + echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesPro)) + '&nbsp;&raquo;</span><span class="cb-fermer">Refermer &laquo;&nbsp;' + echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesPro)) + '&nbsp;&raquo;</span></b>' +
      '<small id="mepNbProMixte"></small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
      '<div class="choix-corps"><p class="choix-aide">En Mixte, ces mots-cl&eacute;s s&rsquo;affichent sous &laquo;&nbsp;' + echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesPro)) + '&nbsp;&raquo;, apr&egrave;s les missions de &laquo;&nbsp;' + _mepNomBlocColonneAfficheEnAction() + '&nbsp;&raquo;. D&eacute;cochez celles que vous ne voulez pas montrer. C&rsquo;est la m&ecirc;me s&eacute;lection que dans la carte &laquo;&nbsp;Comp&eacute;tences&nbsp;&raquo;.</p>' +
      '<div id="mepPickProMixte" class="miss-liste mep-pick-pro"></div></div></details>' : '') +
    (experiences.length ? '<details class="choix-exp" id="zoneChoixExp"' + (choixExpOuvert ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Modifier &laquo;&nbsp;' + echapperAttribut(_mepIntitule(_PDF_INTITULES.experience)) + '&nbsp;&raquo;</span><span class="cb-fermer">Refermer &laquo;&nbsp;' + echapperAttribut(_mepIntitule(_PDF_INTITULES.experience)) + '&nbsp;&raquo;</span></b>' +
      '<small>' + (etat.mode !== 'A' ? 'Sous les comp&eacute;tences &middot; ' : '') + resumeChoix + '</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
      '<div class="choix-corps">' +
      '<p class="choix-aide">' + (toutes
        ? (absentes.length ? 'Les exp&eacute;riences ci-dessous sont affich&eacute;es. Pour chacune, choisissez les missions &agrave; garder : la 5e &agrave; la place de la 4e, c&rsquo;est possible.' : 'Toutes vos exp&eacute;riences sont affich&eacute;es. Pour chacune, choisissez les missions &agrave; garder : la 5e &agrave; la place de la 4e, c&rsquo;est possible.')
        : 'Cochez les exp&eacute;riences &agrave; afficher (propos&eacute;es pour le poste vis&eacute; : vous d&eacute;cidez). Pour chacune, choisissez les missions &agrave; garder.') + '</p>' +
      (_mepEditionExp ? '<p class="choix-aide"><b>Mode &eacute;dition :</b> cliquez sur le nom d&rsquo;une exp&eacute;rience pour la modifier, puis sur &laquo;&nbsp;Valider&nbsp;&raquo;. Les autres restent ferm&eacute;es.</p>' : '') +
      '<div class="mep-liste-choix-exp">' + lignesExp + '</div></div></details>' : '') +
    (etat.mode !== 'A' ? _htmlZoneLiensMq(!!choix.sourceExperience) : '') +
    (totalMissionsAffichees < totalMissionsExp
      ? '<p class="rappel-missions" id="mepRappelMissions">' + totalMissionsAffichees + ' mission' + (totalMissionsAffichees > 1 ? 's' : '') + ' sur ' + totalMissionsExp + ' affich&eacute;e' + (totalMissionsAffichees > 1 ? 's' : '') + ' pour que votre CV tienne sur une page. Rien n&rsquo;est supprim&eacute; : utilisez le bouton &laquo;&nbsp;+&nbsp;&raquo; de &laquo;&nbsp;Missions par exp&eacute;rience&nbsp;&raquo;, ou choisissez mission par mission dans chaque exp&eacute;rience.</p>'
      : '') +
    '<div class="ligne-plus">' +
    '<div class="inline"><label for="mepSelOrdre">Ordre</label><select id="mepSelOrdre" data-mep-ordre-select>' +
    '<option value="recent"' + (ordreSelect === 'recent' ? ' selected' : '') + '>Du plus r&eacute;cent au plus ancien</option>' +
    '<option value="ancien"' + (ordreSelect === 'ancien' ? ' selected' : '') + '>Du plus ancien au plus r&eacute;cent</option>' +
    '<option value="mien"' + (ordreSelect === 'mien' ? ' selected' : '') + '>Mon ordre</option>' +
    '<option value="pertinent"' + (ordreSelect === 'pertinent' ? ' selected' : '') + '>Du plus pertinent</option>' +
    (ordreSelect === 'autre' ? '<option value="autre" selected>Autre ordre (choix pr&eacute;c&eacute;dent)</option>' : '') +
    '</select>' + (ordreSelect === 'mien' ? _mepBoutonRangerGrandApercu() : '') + '</div>' +
    '<div class="inline"><label>Missions par exp&eacute;rience</label><div class="pas" data-mep-missions-max="' + maxMissionsExp + '" title="' + (niveauDetail === 'resume' ? 'Niveau &laquo; R&eacute;sum&eacute; &raquo; : une mission par exp&eacute;rience (le + permet d&rsquo;en afficher davantage)' :(niveauDetail === 'auto' ? 'Nombre maximum de missions : r&eacute;duit seulement si le CV d&eacute;borde' : 'Jusqu&rsquo;&agrave; ' + maxMissionsExp + ' (le maximum propos&eacute; par vos exp&eacute;riences)')) + '">' +
    '<button type="button" data-mep-missions-global-moins' + (niveauDetail === 'resume' ? ' disabled' : '') + '>&minus;</button><span>' + missionsGlobalAffiche + '</span><button type="button" data-mep-missions-global-plus' + ((missionsGlobalAffiche >= maxMissionsExp) ? ' disabled' : '') + '>+</button></div></div>' +
    // TACHE (retour Denis 2026-09-28, point 8 : "il doit etre bien plus visible, aujourd'hui il
    // est quasiment invisible") : case a part, mise en avant (bordure + fond), plutot que la
    // meme case discrete que les reglages voisins -- c'est elle qui ouvre l'edition du poste,
    // de l'entreprise, des dates et des missions.
    '<div class="inline"><label>Style des missions</label>' +
    _mepSegMq('mep-missionspro', [['epure', '&Eacute;pur&eacute;es', 'Une par ligne'], ['condense', 'Condens&eacute;es', '&Agrave; la suite']], c.styleProfessionnel === 'condense' ? 'condense' : 'epure', 'seg-mini') + '</div>' +
    _mepHtmlSigneMissionsMq(c.styleProfessionnel === 'condense') +
    '<div class="inline"><label>Dates ' + _mepAideBtn('Le poste reste en gras seul.') + '</label><span class="grp">' +
    boutonSI('souligner|dates', (c.souligner || {}).dates, 'S', 'Soulign&eacute;') + ' ' + boutonSI('italique|dates', (c.italique || {}).dates, 'I', 'Italique') + '</span></div>' +
    '<div class="inline"><label>Entreprise</label><span class="grp">' +
    boutonSI('souligner|entreprise', (c.souligner || {}).entreprise, 'S', 'Soulign&eacute;e') + ' ' + boutonSI('italique|entreprise', (c.italique || {}).entreprise, 'I', 'Italique') + '</span></div>' +
    _mepCkMq('data-mep-afficher-lieu', 'Afficher le lieu', etat.afficherLieu) +
    '<div class="inline"' + (etat.afficherLieu ? '' : ' style="display:none"') + '><label>Style du lieu</label>' +
    _mepSegMq('mep-style-lieu', [['normal', 'Normal'], ['italique', 'Italique'], ['gris', 'Gris']], etat.styleLieu, 'seg-mini') + '</div>' +
    '</div>' +
    _mepBoutonReglerRubrique(_PDF_INTITULES.experience) +
    '<div class="info-auto" id="mepInfoAuto" style="display:none"></div>' +
    _htmlBoutonOptionsSupp('exp') + '</div></details>';
}

// ============================================================
// Carte 3 : Formations (cForm)
// ============================================================
function _htmlSecFormationsMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var formations = dossier.cvOptimiseActif ? 'optimise' : 'complet';
  var etat = _mepEtatFormations();
  var choix = _mepEtatChoixMq();
  var st = choix.styleTitreFormation || {};
  var aff = choix.formationAffiche || {};
  var aDesCentres = _mepListeFormationsEtCertifsMoteur().some(function (f) { return !!f.etablissement; });
  var aDesLieux = _mepListeFormationsEtCertifsMoteur().some(function (f) { return !!f.lieu; });
  function boutonFmt(cle, actif, contenu) {
    return '<button type="button" class="btn-g-i' + (actif ? ' on' : '') + '" data-mep-form-style="' + cle + '" style="border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-strong);border-radius:7px;padding:.25rem .6rem' + (cle === 'gras' ? ';font-weight:700' : '') + '">' + contenu + '</button>';
  }
  // TACHE (chantier "Formations", 2026-09-28, DECISION DE DENIS : "toutes les
  // formations seront visibles et toutes les formations auront des missions",
  // meme comportement que la carte "Experience personnelle") : liste a cocher,
  // une ligne par formation, meme mecanique EXACTE que _htmlSecExperiencePersoMiseEnPage
  // (choix Toutes/Les plus pertinentes + compteur de missions par item, 0 =
  // sans mission). S'ajoute a "Quelles formations montrer" (Complet/Optimise,
  // reglage plus large, partage avec certifications/Word, jamais touche ici).
  // TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout") : Certifications
  // fusionnees ici -- une seule liste, un seul mecanisme (missions, choix personnel, visibilite),
  // jamais 2 rubriques separees. dossier.certifications reste un texte simple, inchange.
  var formationsListe = _mepFormationsOrdonnees();
  var critereForm = etat.ordre || 'pertinence';
  var toutesForm = (etat.tout !== 'pertinentes');
  // TACHE (retour Denis 2026-09-28 : "avoir un bouton pour modifier l'intitule
  // de mes diplomes et les missions") : bouton "Modifier" par formation, ouvre
  // un petit formulaire (titre + missions, une par ligne) qui n'ecrit QUE dans
  // le reglage d'affichage du CV (_cvPdfFormationsTexteParItem, cle =
  // _mepCleExpPerso), jamais dans dossier.formations ("Vos informations").
  var lignesForm = formationsListe.map(function (f) {
    var cle = _mepCleExpPerso(f); // meme fonction : texte normalise de l'intitule.
    var cleAttr = echapperAttribut(cle);
    var estCochee = toutesForm || !etat.choisies || etat.choisies.indexOf(cle) !== -1;
    // TACHE (audit "mise en page", 2026-09-28) : voir meme correctif sur la carte Experiences juste au-dessus.
    var segments = (typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(f.missions || '') : (f.missions || '').split('\n').map(function (m) { return m.trim(); }).filter(Boolean);
    var n = (etat.missionsParItem[cle] != null) ? Math.min(etat.missionsParItem[cle], segments.length) : Math.min(segments.length, 4);
    var diplome = _pdfTexteDiplome(f);
    var override = (etat.texteParItem || {})[cle] || null;
    var editionOuverte = !!_mepEditionFormationOuverte[cle];
    var titreEdit = (override && override.titre) || f.intitule || '';
    var missionsEdit = (override && override.missions) || segments.slice(0, n).join('\n');
    var valForm = function (k) { return (override && typeof override[k] === 'string') ? override[k] : (f[k] || ''); };
    // TACHE (retour Denis 2026-09-28, point 13) : meme bouton "Missions / Choix personnel" que
    // la carte Experiences, pour choisir PRECISEMENT quelle mission garder (pas juste combien).
    var choisieListeForm = (etat.missionsChoisies || {})[cle];
    var ouvertPickerForm = !!_mepMissionsOuvertesForm[cle];
    var pickerForm = segments.length ? _mepHtmlMissionsPickerMq('form', cle, segments, choisieListeForm, n, ouvertPickerForm) : { html: '', bouton: '' };
    return '<div class="ligne-bloc' + ((editionOuverte || ouvertPickerForm) ? ' ouvert' : '') + '"><label class="ligne-choix' + (estCochee ? '' : ' off') + '">' +
      '<input type="checkbox" data-mep-form-choisie="' + cleAttr + '"' + (estCochee ? ' checked' : '') + (toutesForm ? ' disabled' : '') + '>' +
      '<span class="nom' + (_mepEditionForm ? ' cliquable' : '') + '"' + (_mepEditionForm ? ' data-mep-form-ouvrir="' + cleAttr + '" title="Cliquez pour modifier cette formation"' : '') + '><b>' + echapperAttribut(diplome) + '</b>' + (f.annee ? ' <em>(' + echapperAttribut(f.annee) + ')</em>' : '') + (override ? ' <em class="ex">(modifi&eacute;e)</em>' : '') + '</span>' +
      (segments.length
        ? '<span class="pas" title="De 0 &agrave; ' + segments.length + ' missions"><button type="button" data-mep-form-missions-moins="' + cleAttr + '" data-mep-form-missions-n="' + n + '"' + (n <= 0 ? ' disabled' : '') + '>&minus;</button><span>' + n + '</span>' +
          '<button type="button" data-mep-form-missions-plus="' + cleAttr + '" data-mep-form-missions-n="' + n + '"' + (n >= segments.length ? ' disabled' : '') + '>+</button></span><span class="sur" title="Missions propos&eacute;es">/' + segments.length + '</span>' + pickerForm.bouton
        : '<span class="ex">Aucune mission propos&eacute;e</span>') +
      '</label>' +
      pickerForm.html +
      (editionOuverte ? '<div class="exp-edit" data-mep-form-edit="' + cleAttr + '"><div class="grille-el">' +
        _mepChampPourCeCv('data-mep-form-edit-titre', 'Intitul&eacute; du dipl&ocirc;me', titreEdit, f.intitule || '', true) +
        _mepChampPourCeCv('data-mep-form-edit-niveau', 'Niveau', valForm('niveau'), f.niveau || '', false, 'Ex. : Bac Pro') +
        _mepChampPourCeCv('data-mep-form-edit-annee', 'Ann&eacute;e', valForm('annee'), f.annee || '', false, 'Ex. : 2019') +
        _mepChampPourCeCv('data-mep-form-edit-etablissement', 'Centre de formation', valForm('etablissement'), f.etablissement || '', false, 'Ex. : AFPA') +
        _mepChampPourCeCv('data-mep-form-edit-lieu', 'Lieu', valForm('lieu'), f.lieu || '', false, 'Ex. : Limoges') +
        '<div class="champ" style="grid-column:1/-1"><label>Missions <span class="sous" style="font-weight:400">une par ligne : corrigez ou ajoutez ce que vous voulez mettre en avant</span></label>' +
        '<textarea rows="4" data-mep-form-edit-missions>' + echapperAttribut(missionsEdit) + '</textarea></div></div>' +
        '<p class="choix-aide" style="margin:.3rem 0 0">Pour ce CV seulement : votre dossier d&rsquo;origine n&rsquo;est pas modifi&eacute;.</p>' +
        '<div class="exp-edit-pied"><button type="button" class="mep-btn" data-mep-form-texte-annuler="' + cleAttr + '">Annuler</button>' +
        '<button type="button" class="mep-btn principal" data-mep-form-texte-enregistrer="' + cleAttr + '">Enregistrer</button></div></div>' : '') +
      '</div>';
  }).join('');
  var nbAffichesForm = (!toutesForm && etat.choisies) ? etat.choisies.length : formationsListe.length;
  // TACHE (retour Denis 2026-09-28, capture d'ecran a l'appui : "comment
  // agencer et optimiser l'espace vide dans les formations") : "Formations
  // a afficher" rejoint desormais la meme grille 2 colonnes ("trois") que
  // "Quelles formations montrer"/"Detail" -- vient se caser SOUS "Quelles
  // formations montrer" (grille 2 colonnes, ordre naturel des blocs),
  // comblant le vide juste en dessous au lieu de rester une bande a part
  // en pleine largeur. Seule la LISTE (variable en hauteur) reste en
  // pleine largeur, en dehors de la grille.
  var blocFormationsAAfficher = formationsListe.length ? (
    '<div class="boite"><h4>Formations &agrave; afficher</h4>' +
    '<label class="rad"><input type="radio" name="mepFormationsTout" data-mep-formations-tout="toutes"' + (toutesForm ? ' checked' : '') + '> <span class="mot-final">Toutes  ' + _mepAideBtn('Affiche tout votre parcours de formation.') + '</span></label>' +
    '<label class="rad"><input type="radio" name="mepFormationsTout" data-mep-formations-tout="pertinentes"' + (!toutesForm ? ' checked' : '') + '> <span class="mot-final">Les plus pertinentes  ' + _mepAideBtn('Met en avant celles en lien avec votre projet.') + '</span></label>' +
    '</div>'
  ) : '';
  var styleMissionsForm = (dossier.reglagesMiseEnPageCV || {}).styleFormations === 'condense' ? 'condense' : 'epure';
  var styleCommunActif = _mepStyleCommunActif();
  // Retour Denis 2026-10-02 : « Detail » en bandeau compact de trois rangees (au lieu d'une boite haute), sur toute la largeur ; memes reglages qu'avant.
  var detailForm = '<div class="detail-compact"><h4>D&eacute;tail de chaque formation</h4>' +
    '<div class="rangee"><label class="t">Titre</label>' + _mepGriserSiStyleCommun('<span class="grp">' +
    boutonFmt('gras', st.gras !== false, '<b>G</b>') + ' ' + boutonFmt('italique', st.italique, '<i>I</i>') + ' ' + boutonFmt('souligne', st.souligne, '<u>S</u>') + '</span>', styleCommunActif) +
    // TACHE (Denis, 2026-09-25) : la personne choisit ce qui s'affiche pour chaque formation (centre, annee, lieu). Centre et annee
    // sont montres au depart (comme avant). Le lieu aussi des 2026-10-01 (retour Denis : un lieu capte s'affiche toujours) ; la personne peut le decocher.
    '<label class="t">Afficher</label>' +
    _mepCkMq('data-mep-form-aff="centre"', 'Centre' + (aDesCentres ? '' : ' <span class="ex">(non renseign&eacute;)</span>'), aff.centre !== false) +
    _mepCkMq('data-mep-form-aff="annee"', 'Ann&eacute;e', aff.annee !== false) +
    _mepCkMq('data-mep-form-aff="lieu"', 'Lieu' + (aDesLieux ? '' : ' <span class="ex">(non renseign&eacute;)</span>'), aff.lieu !== false) + '</div>' +
    '<div class="rangee"><label class="t">Informations</label>' +
    _mepSegMq('mep-form-ligne', [['', 'Selon le mod&egrave;le'], ['ligne', 'Sur une ligne'], ['dessous', 'En dessous']], _mepEtatChoixMq().formationsLigne || '', 'seg-mini') +
    '<label class="t" for="mepRgEspForm">Espace entre les formations <span id="mepValEspForm" style="font-weight:400;color:var(--text-muted)">' + etat.espacement + ' px</span></label>' +
    '<input type="range" id="mepRgEspForm" data-mep-form-espacement min="0" max="32" step="1" value="' + etat.espacement + '" style="width:9rem;accent-color:var(--accent)"></div>' +
    '<div class="rangee"><label class="t">Missions</label>' + _mepCkMq('data-mep-form-missions', 'Afficher les missions de la formation', etat.afficherMissions) +
    _mepGriserSiStyleCommun(_mepSegMq('mep-missionsformations', [['epure', '&Eacute;pur&eacute;es', 'Une par ligne'], ['condense', 'Condens&eacute;es', '&Agrave; la suite']], styleMissionsForm, 'seg-mini'), styleCommunActif) +
    _mepHtmlSigneMissionsMq(styleMissionsForm === 'condense') + '</div>' +
    (styleCommunActif ? '<p class="choix-aide" style="margin:.2rem 0 0">Le titre et le style des missions suivent les exp&eacute;riences professionnelles. Pour les r&eacute;gler ici, d&eacute;cochez &laquo;&nbsp;M&ecirc;me style d&rsquo;&eacute;criture dans toutes les rubriques&nbsp;&raquo; dans &laquo;&nbsp;Organisation du CV&nbsp;&raquo;.</p>' : '') + '</div>';
  var boutonEditerForm = formationsListe.length ? ('<label class="bouton-editer' + (_mepEditionForm ? ' on' : '') + '"><input type="checkbox" data-mep-form-editer' + (_mepEditionForm ? ' checked' : '') + '>' +
    '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
    '<span>&Eacute;diter les formations <small>(intitul&eacute;, missions)</small></span></label>' +
    (_mepEditionForm ? '<p class="choix-aide"><b>Mode &eacute;dition :</b> cliquez sur le nom d&rsquo;une formation pour la modifier, puis sur &laquo;&nbsp;Enregistrer&nbsp;&raquo;. Vos corrections ne changent que ce CV, jamais &laquo;&nbsp;Vos informations&nbsp;&raquo;.</p>' : '')) : '';
  var zoneFormationsOuverte = _mepCarteOuverte('zoneForm', false) || _mepEditionForm;
  var blocListeFormations = formationsListe.length ? (
    '<details class="choix-exp" id="zoneForm"' + (zoneFormationsOuverte ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Modifier mes formations et leurs missions</span><span class="cb-fermer">Refermer mes formations</span></b>' +
    '<small>' + nbAffichesForm + ' formation' + (nbAffichesForm > 1 ? 's' : '') + ' affich&eacute;e' + (nbAffichesForm > 1 ? 's' : '') + ' &middot; cliquez pour modifier</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
    '<div class="choix-corps"><p class="choix-aide">' + (toutesForm ? 'Toutes vos formations sont affich&eacute;es. Pour chacune, choisissez les missions &agrave; garder.' : 'Cochez les formations &agrave; afficher. Pour chacune, choisissez les missions &agrave; garder.') + '</p>' +
    '<div class="mep-liste-choix-exp">' + lignesForm + '</div></div></details>' +
    _mepHtmlDatesRubrique('form', true) +
    // Retour Denis 2026-09-30 (C20-b) : choix d'ordre, comme pour les experiences.
    '<div class="ligne-plus"><div class="inline"><label for="mepSelOrdreForm">Ordre</label><select id="mepSelOrdreForm" data-mep-ordreform-select>' +
    '<option value="date-desc"' + (critereForm === 'date-desc' ? ' selected' : '') + '>Du plus r&eacute;cent au plus ancien</option>' +
    '<option value="date-asc"' + (critereForm === 'date-asc' ? ' selected' : '') + '>Du plus ancien au plus r&eacute;cent</option>' +
    '<option value="pertinence"' + (critereForm === 'pertinence' ? ' selected' : '') + '>Du plus pertinent</option>' +
    '<option value="mien"' + (critereForm === 'mien' ? ' selected' : '') + '>Mon ordre (fait dans le grand aper&ccedil;u)</option>' +
    '</select>' + (critereForm === 'mien' ? _mepBoutonRangerGrandApercu() : '') + '</div></div>'
  ) : '';
  return '<details class="mep-carte" id="cForm"' + (_mepCarteOuverte('cForm', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('formations', _mepTitreCarte(_PDF_INTITULES.formations, 'Formations'), 'Choisissez quelles formations afficher.', false, _mepCarteOuverte('cForm', false)) +
    '<div class="carte-corps">' + _mepHtmlIntituleMq(_PDF_INTITULES.formations) + '<div class="quatre">' +
    '<div class="boite"><h4>Quelles formations montrer</h4>' +
    '<label class="rad"><input type="radio" name="mepFormSel" data-mep-formations="complet"' + (formations === 'complet' ? ' checked' : '') + '> <span class="mot-final">Complet  ' + _mepAideBtn('Tout votre parcours.') + '</span></label>' +
    '<label class="rad"><input type="radio" name="mepFormSel" data-mep-formations="optimise"' + (formations === 'optimise' ? ' checked' : '') + '> <span class="mot-final">Optimis&eacute;  ' + _mepAideBtn('Le dipl&ocirc;me le plus &eacute;lev&eacute; et les formations les plus utiles.') + '</span></label>' +
    '</div>' + blocFormationsAAfficher + '</div>' +
    detailForm + boutonEditerForm + blocListeFormations + _mepBoutonReglerRubrique(_PDF_INTITULES.formations) + '</div></details>';
}

// ============================================================
// Carte : Expérience personnelle (cExpPerso)
// TACHE (chantier "Experience personnelle", 2026-09-27, maquette
// docs/MAQUETTE_EXPERIENCE_PERSONNELLE_2026-09-27.html, DECISION DE DENIS :
// "meme comportement, aucune distinction de source") : combine
// dossier.experiencesPerso (savoir-faire personnel) et dossier.engagements
// dans une seule liste a cocher, memes reglages pour les 2 (visibilite +
// nombre de missions, jusqu'a 0 = "sans mission", curseur reutilise plutot
// qu'un bouton separe). Rien ne se saisit ici (maquette) : un bouton par
// source renvoie vers "Vos informations", seul endroit ou ajouter/modifier
// une entree. Style/position des dates/missions SYNCHRONISES avec la carte
// "Experiences professionnelles" -- decision de Denis 2026-09-27, jamais de
// bouton synchroniser/dissocier : aucun reglage de style dedie ici.
// ============================================================
function _htmlSecExperiencePersoMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var items = _mepListeExperiencePersoMoteur();
  // Retour Denis 2026-10-03 : la carte est TOUJOURS là (elle disparaissait sans explication quand le dossier n'avait rien) : sans entrée, elle le dit et renvoie à « Vos informations ».
  if (!items.length) {
    return '<details class="mep-carte" id="cExpPerso" data-vide="1"' + (_mepCarteOuverte('cExpPerso', false) ? ' open' : '') + '>' +
      _mepEnteteCarteMq('experiencePerso', _mepTitreCarte(_PDF_INTITULES.experiencePerso, 'Exp&eacute;rience personnelle'), 'Rien n&rsquo;a &eacute;t&eacute; capt&eacute;.', false, _mepCarteOuverte('cExpPerso', false)) +
      '<div class="carte-corps"><p class="aide">Rien n&rsquo;a &eacute;t&eacute; capt&eacute; pour cette rubrique : il n&rsquo;y a rien &agrave; r&eacute;gler ici.</p></div></details>';
  }
  var etat = _mepEtatExperiencePerso();
  var choixPerso = _mepEtatChoixMq();
  var toutes = (etat.tout !== 'pertinentes');
  // TACHE (retour Denis 2026-09-28, point 12, chantier "Citer / Developper") : avant tout le
  // reste, un choix qui change la nature meme de la rubrique -- "Citer seulement" (les titres,
  // sur une ligne, jamais les missions) ou "Developper" (le panneau habituel ci-dessous, avec
  // missions). "Developper" reste le defaut (zero regression).
  var modeCiter = etat.modeAffichage === 'citer';
  var htmlModeAffichage = '<div class="boite"><h4>Mode de pr&eacute;sentation</h4>' +
    // Cote a cote (decision Denis 2026-09-29) : « Citer seulement » a gauche (par defaut), « Developper » a droite.
    '<div class="mep-exp-mode-ligne">' +
    '<label class="rad"><input type="radio" name="mepExpPersoMode" data-mep-expperso-mode="citer"' + (modeCiter ? ' checked' : '') + '> <span class="mot-final">Citer seulement  ' + _mepAideBtn('Juste les titres, sur une ligne (ex. Bricolage, &Eacute;lectricit&eacute;, Peinture...).') + '</span></label>' +
    '<label class="rad"><input type="radio" name="mepExpPersoMode" data-mep-expperso-mode="developper"' + (!modeCiter ? ' checked' : '') + '> <span class="mot-final">D&eacute;velopper  ' + _mepAideBtn('Titre et missions d&eacute;taill&eacute;es : vous pouvez d&eacute;velopper les missions de vos exp&eacute;riences personnelles.') + '</span></label>' +
    '</div>' +

    '</div>';
  var savoirFaire = dossier.experiencesPerso || [];
  var engagements = dossier.engagements || [];
  function nomItem(e) { return (typeof e === 'string') ? e : ((e && (e.intitule || e.texte)) || ''); }
  // TACHE (retour Denis 2026-09-28 : "je ne pense pas que c'est une bonne
  // idee de mettre ces boutons... modifier dans vos informations, cela
  // oblige a faire un passage de plus IA") : un aller-retour vers "Vos
  // informations" pour modifier le texte d'un savoir-faire perso/engagement
  // pourrait rendre perimees les missions deja generees par l'assistant
  // (liees par correspondance de texte, voir engagementsAvecMissions,
  // js/app.js) et pousser vers une nouvelle analyse complete -- bien trop
  // lourd pour un simple reglage d'affichage. Remplace par "Afficher sur
  // mon CV" : coche d'un coup TOUS les items de cette source dans la liste
  // ci-dessous (raccourci, jamais une navigation) -- pour editer/ajouter
  // une entree, la personne passe par "Vos informations" via le menu
  // principal, jamais un raccourci depuis ce panneau.
  // TACHE (retour Denis 2026-09-28 : "l'idee est bonne mais pas trop utile...
  // on va l'appeler plutot 'cacher sur le cv' quand il est active, donc je
  // peux mettre et enlever depuis ce bouton") : vrai bascule -- "Afficher sur
  // mon CV" coche d'un coup toutes les cles de cette source ; une fois toutes
  // affichees, le meme emplacement devient "Cacher sur le CV" et decoche
  // toute la source d'un coup (jamais un simple libelle desactive).
  function boiteSource(titre, liste, source) {
    if (!liste.length) { return ''; }
    var cles = liste.map(_mepCleExpPerso);
    var dejaToutesAffichees = toutes || !etat.choisies || cles.every(function (c) { return etat.choisies.indexOf(c) !== -1; });
    return '<div class="boite"><h4>' + liste.length + ' ' + titre + (liste.length > 1 ? 's' : '') + '</h4>' +
      '<p class="sous" style="margin:0 0 .5rem">' + liste.map(function (e) { return echapperAttribut(nomItem(e)); }).filter(Boolean).join(', ') + '</p>' +
      (dejaToutesAffichees
        ? '<button type="button" class="mep-btn perso" data-mep-expperso-masquer-source="' + source + '">Cacher sur le CV</button>'
        : '<button type="button" class="mep-btn" data-mep-expperso-afficher-source="' + source + '">Afficher sur mon CV</button>') +
      '</div>';
  }
  var rappelSources = boiteSource('savoir-faire personnel', savoirFaire, 'experiencesPerso') + boiteSource('engagement', engagements, 'engagements');
  var nbAffiches = (!toutes && etat.choisies) ? etat.choisies.length : items.length;
  // TACHE (retour Denis 2026-09-28 : bouton "Modifier" par entree) : meme
  // mecanisme EXACT que celui des formations (_htmlSecFormationsMiseEnPage) --
  // ecrase l'affichage CV uniquement, jamais dossier.experiencesPerso/engagements.
  var lignes = items.map(function (item) {
    var cle = _mepCleExpPerso(item);
    var cleAttr = echapperAttribut(cle);
    var estCochee = toutes || !etat.choisies || etat.choisies.indexOf(cle) !== -1;
    // TACHE (retour Denis 2026-09-28, point 12) : en "Citer seulement", juste une case a cocher
    // et le titre -- aucun controle de missions, ca ne developpe jamais.
    if (modeCiter) {
      return '<div class="ligne-bloc"><label class="ligne-choix' + (estCochee ? '' : ' off') + '">' +
        '<input type="checkbox" data-mep-expperso-choisie="' + cleAttr + '"' + (estCochee ? ' checked' : '') + (toutes ? ' disabled' : '') + '>' +
        '<span class="nom"><b>' + echapperAttribut(nomItem(item)) + '</b></span>' +
        '</label></div>';
    }
    var texteMissions = (typeof item === 'string') ? '' : (item.missions || '');
    // TACHE (audit "mise en page", 2026-09-28) : voir meme correctif sur la carte Experiences.
    var segments = (typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(texteMissions) : texteMissions.split('\n').map(function (m) { return m.trim(); }).filter(Boolean);
    var periode = (typeof _pdfFormaterPeriode === 'function') ? _pdfFormaterPeriode(item && item.dateDebut, item && item.dateFin) : '';
    var n = (etat.missionsParItem[cle] != null) ? Math.min(etat.missionsParItem[cle], segments.length) : Math.min(segments.length, 4);
    var override = (etat.texteParItem || {})[cle] || null;
    var editionOuverte = !!_mepEditionExpPersoOuverte[cle];
    var titreEdit = (override && override.titre) || nomItem(item) || '';
    var missionsEdit = (override && override.missions) || segments.slice(0, n).join('\n');
    var objPerso = (typeof item === 'string') ? {} : (item || {});
    var valPerso = function (k) { return (override && typeof override[k] === 'string') ? override[k] : (objPerso[k] || ''); };
    // TACHE (retour Denis 2026-09-28, point 13) : meme bouton "Missions / Choix personnel" que
    // la carte Experiences, pour choisir PRECISEMENT quelle mission garder (pas juste combien).
    var choisieListeEp = (etat.missionsChoisies || {})[cle];
    var ouvertPickerEp = !!_mepMissionsOuvertesExpPerso[cle];
    var pickerEp = segments.length ? _mepHtmlMissionsPickerMq('expperso', cle, segments, choisieListeEp, n, ouvertPickerEp) : { html: '', bouton: '' };
    return '<div class="ligne-bloc' + ((editionOuverte || ouvertPickerEp) ? ' ouvert' : '') + '"><label class="ligne-choix' + (estCochee ? '' : ' off') + '">' +
      '<input type="checkbox" data-mep-expperso-choisie="' + cleAttr + '"' + (estCochee ? ' checked' : '') + (toutes ? ' disabled' : '') + '>' +
      '<span class="nom' + (_mepEditionPerso ? ' cliquable' : '') + '"' + (_mepEditionPerso ? ' data-mep-expperso-ouvrir="' + cleAttr + '" title="Cliquez pour modifier cette entr&eacute;e"' : '') + '><b>' + echapperAttribut(nomItem(item)) + '</b>' + (periode ? ' <em>(' + echapperAttribut(periode) + ')</em>' : '') + (override ? ' <em class="ex">(modifi&eacute;e)</em>' : '') + '</span>' +
      (segments.length
        ? '<span class="pas" title="De 0 &agrave; ' + segments.length + ' missions"><button type="button" data-mep-expperso-missions-moins="' + cleAttr + '" data-mep-expperso-missions-n="' + n + '"' + (n <= 0 ? ' disabled' : '') + '>&minus;</button><span>' + n + '</span>' +
          '<button type="button" data-mep-expperso-missions-plus="' + cleAttr + '" data-mep-expperso-missions-n="' + n + '"' + (n >= segments.length ? ' disabled' : '') + '>+</button></span><span class="sur" title="Missions propos&eacute;es">/' + segments.length + '</span>' + pickerEp.bouton
        : '<span class="ex">Aucune mission propos&eacute;e</span>') +
      '</label>' +
      pickerEp.html +
      (editionOuverte ? '<div class="exp-edit" data-mep-expperso-edit="' + cleAttr + '"><div class="grille-el">' +
        _mepChampPourCeCv('data-mep-expperso-edit-titre', 'Intitul&eacute;', titreEdit, nomItem(item) || '', true) +
        _mepChampPourCeCv('data-mep-expperso-edit-dateDebut', 'D&eacute;but', valPerso('dateDebut'), objPerso.dateDebut || '', false, 'Ex. : 2023-09 ou 2023') +
        _mepChampPourCeCv('data-mep-expperso-edit-dateFin', 'Fin (vide = en cours)', valPerso('dateFin'), objPerso.dateFin || '', false, 'Ex. : 2024-06 ou 2024') +
        _mepChampPourCeCv('data-mep-expperso-edit-entreprise', 'Structure ou entreprise', valPerso('entreprise'), objPerso.entreprise || '', false, 'Ex. : association Les Restos') +
        _mepChampPourCeCv('data-mep-expperso-edit-lieu', 'Lieu', valPerso('lieu'), objPerso.lieu || '', false, 'Ex. : Limoges') +
        '<div class="champ" style="grid-column:1/-1"><label>Missions <span class="sous" style="font-weight:400">une par ligne : corrigez ou ajoutez ce que vous voulez mettre en avant</span></label>' +
        '<textarea rows="4" data-mep-expperso-edit-missions>' + echapperAttribut(missionsEdit) + '</textarea></div></div>' +
        '<p class="choix-aide" style="margin:.3rem 0 0">Pour ce CV seulement : votre dossier d&rsquo;origine n&rsquo;est pas modifi&eacute;.</p>' +
        '<div class="exp-edit-pied"><button type="button" class="mep-btn" data-mep-expperso-texte-annuler="' + cleAttr + '">Annuler</button>' +
        '<button type="button" class="mep-btn principal" data-mep-expperso-texte-enregistrer="' + cleAttr + '">Enregistrer</button></div></div>' : '') +
      '</div>';
  }).join('');
  var stylePersoMissions = (dossier.reglagesMiseEnPageCV || {}).stylePersonnel === 'condense' ? 'condense' : 'epure';
  var styleCommunActifPerso = _mepStyleCommunActif();
  var stT = choixPerso.styleTitrePerso || {};
  var espPersoVal = (typeof choixPerso.espacementPerso === 'number') ? choixPerso.espacementPerso : 8;  // 8 px = l'espace d'origine d'une entree (densite normale)
  function boutonFmtPerso(cle, actif, contenu) {
    return '<button type="button" class="btn-g-i' + (actif ? ' on' : '') + '" data-mep-perso-titre-style="' + cle + '" style="border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-strong);border-radius:7px;padding:.25rem .6rem">' + contenu + '</button>';
  }
  // Retour Denis 2026-10-02 : meme bandeau « Detail » que les formations (titre G / I / S, espace entre les entrees, missions), seulement en mode « Developper ».
  var detailPerso = modeCiter ? '' : ('<div class="detail-compact"><h4>D&eacute;tail de chaque entr&eacute;e</h4>' +
    '<div class="rangee"><label class="t">Titre</label>' + _mepGriserSiStyleCommun('<span class="grp">' + boutonFmtPerso('gras', stT.gras !== false, '<b>G</b>') + ' ' + boutonFmtPerso('italique', !!stT.italique, '<i>I</i>') + ' ' + boutonFmtPerso('souligne', !!stT.souligne, '<u>S</u>') + '</span>', styleCommunActifPerso) +
    '<label class="t" for="mepRgEspPerso">Espace entre les entr&eacute;es <span id="mepValEspPerso" style="font-weight:400;color:var(--text-muted)">' + espPersoVal + ' px</span></label>' +
    '<input type="range" id="mepRgEspPerso" data-mep-perso-espacement min="0" max="32" step="1" value="' + espPersoVal + '" style="width:9rem;accent-color:var(--accent)"></div>' +
    '<div class="rangee"><label class="t">Missions</label>' +
    _mepGriserSiStyleCommun(_mepSegMq('mep-missionsperso', [['epure', '&Eacute;pur&eacute;es', 'Une par ligne'], ['condense', 'Condens&eacute;es', '&Agrave; la suite']], stylePersoMissions, 'seg-mini'), styleCommunActifPerso) +
    _mepHtmlSigneMissionsMq(stylePersoMissions === 'condense') + '</div>' +
    (styleCommunActifPerso ? '<p class="choix-aide" style="margin:.2rem 0 0">Le titre et le style des missions suivent les exp&eacute;riences professionnelles. Pour les r&eacute;gler ici, d&eacute;cochez &laquo;&nbsp;M&ecirc;me style d&rsquo;&eacute;criture dans toutes les rubriques&nbsp;&raquo; dans &laquo;&nbsp;Organisation du CV&nbsp;&raquo;.</p>' : '') + '</div>');
  var boutonEditerPerso = modeCiter ? '' : ('<label class="bouton-editer' + (_mepEditionPerso ? ' on' : '') + '"><input type="checkbox" data-mep-perso-editer' + (_mepEditionPerso ? ' checked' : '') + '>' +
    '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
    '<span>&Eacute;diter mon exp&eacute;rience personnelle <small>(intitul&eacute;, missions)</small></span></label>' +
    (_mepEditionPerso ? '<p class="choix-aide"><b>Mode &eacute;dition :</b> cliquez sur le nom d&rsquo;une entr&eacute;e pour la modifier, puis sur &laquo;&nbsp;Enregistrer&nbsp;&raquo;. Vos corrections ne changent que ce CV, jamais &laquo;&nbsp;Vos informations&nbsp;&raquo;.</p>' : ''));
  var zonePersoOuverte = _mepCarteOuverte('zonePerso', false) || _mepEditionPerso;
  return '<details class="mep-carte" id="cExpPerso"' + (_mepCarteOuverte('cExpPerso', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('experiencePerso', _mepTitreCarte(_PDF_INTITULES.experiencePerso, 'Exp&eacute;rience personnelle'), 'Choisissez ce qui appara&icirc;t dans cette rubrique.', false, _mepCarteOuverte('cExpPerso', false)) +
    '<div class="carte-corps">' + _mepHtmlIntituleMq(_PDF_INTITULES.experiencePerso) +
    '<p class="aide">Cette rubrique rassemble votre savoir-faire personnel et vos engagements. Pour ajouter une nouvelle entr&eacute;e, retournez dans &laquo;&nbsp;Vos informations&nbsp;&raquo;' + (modeCiter ? '.' : ' ; pour changer le titre ou les missions d&rsquo;une entr&eacute;e sur le CV, utilisez &laquo;&nbsp;&Eacute;diter mon exp&eacute;rience personnelle&nbsp;&raquo; ci-dessous.') + '</p>' +
    '<div class="quatre">' + htmlModeAffichage +
    '<div class="boite"><h4>Exp&eacute;riences &agrave; afficher</h4>' +
    '<label class="rad"><input type="radio" name="mepExpPersoTout" data-mep-expperso-tout="toutes"' + (toutes ? ' checked' : '') + '> <span class="mot-final">Toutes  ' + _mepAideBtn('Affiche tout votre savoir-faire personnel et vos engagements.') + '</span></label>' +
    '<label class="rad"><input type="radio" name="mepExpPersoTout" data-mep-expperso-tout="pertinentes"' + (!toutes ? ' checked' : '') + '> <span class="mot-final">Les plus pertinentes  ' + _mepAideBtn('Met en avant celles en lien avec votre projet.') + '</span></label>' +
    '</div>' + rappelSources + '</div>' +
    _mepHtmlDatesRubrique('perso', !modeCiter) +
    detailPerso + boutonEditerPerso +
    '<details class="choix-exp" id="zonePerso"' + (zonePersoOuverte ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Modifier mon exp&eacute;rience personnelle et ses missions</span><span class="cb-fermer">Refermer mon exp&eacute;rience personnelle</span></b>' +
    '<small>' + nbAffiches + ' entr&eacute;e' + (nbAffiches > 1 ? 's' : '') + ' affich&eacute;e' + (nbAffiches > 1 ? 's' : '') + ' &middot; cliquez pour modifier</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
    '<div class="choix-corps"><p class="choix-aide">' + (toutes ? 'Toutes vos entr&eacute;es sont affich&eacute;es.' : 'Cochez les entr&eacute;es &agrave; afficher.') + (modeCiter ? '' : ' Pour chacune, choisissez les missions &agrave; garder.') + '</p>' +
    '<div class="mep-liste-choix-exp">' + lignes + '</div></div></details>' +
    (items.length > 1
      // Retour Denis 2026-09-30 : memes choix d'ordre que les formations ; « Mon ordre » se fait dans le grand apercu (mode « Developper »).
      ? '<div class="ligne-plus"><div class="inline"><label for="mepSelOrdrePerso">Ordre</label><select id="mepSelOrdrePerso" data-mep-ordreperso-select>' +
        '<option value="date-desc"' + (etat.ordre === 'date-desc' ? ' selected' : '') + '>Du plus r&eacute;cent au plus ancien</option>' +
        '<option value="date-asc"' + (etat.ordre === 'date-asc' ? ' selected' : '') + '>Du plus ancien au plus r&eacute;cent</option>' +
        '<option value="pertinence"' + ((etat.ordre !== 'date-desc' && etat.ordre !== 'date-asc' && etat.ordre !== 'mien') ? ' selected' : '') + '>Du plus pertinent</option>' +
        '<option value="mien"' + (etat.ordre === 'mien' ? ' selected' : '') + '>Mon ordre (fait dans le grand aper&ccedil;u, en mode &laquo;&nbsp;D&eacute;velopper&nbsp;&raquo;)</option>' +
        '</select>' + (etat.ordre === 'mien' ? _mepBoutonRangerGrandApercu() : '') + '</div></div>'
      : '') +
    _mepBoutonReglerRubrique(_PDF_INTITULES.experiencePerso) +
    '</div></details>';
}

// ============================================================
// Carte 4 : Éléments supplémentaires (cSupp)
// Les compteurs et les listes « Choisir » sont remplis APRES chaque rendu du CV (_mepMajCompetencesMq),
// à partir des listes réellement affichées (window._mepCompetencesAffichees, posée par le rendu).
// ============================================================
// LOT 3.5 (decision Denis 2026-09-29) : case COCHEE par defaut « qualites attendues pour ce poste » (proposees par l'assistant). Decochee,
// elles disparaissent du CV et de « Choisir » ; recochee, elles reviennent. Masquee tant qu'aucune n'est proposee (pas de metier vise).
function _mepQualitesMetierActives() {
  try {
    var pr = dossier.pdfReglages;
    var iframe = document.querySelector('#zonePdfInlineCV iframe');
    if (iframe && iframe.contentWindow && typeof iframe.contentWindow._cvPdfQualitesMetierActives === 'boolean') { return iframe.contentWindow._cvPdfQualitesMetierActives; }
    return !(pr && pr.qualitesMetierActives === false);
  } catch (e) { return true; }
}
// Cases « Afficher les competences professionnelles / comportementales » (Denis 2026-09-29) : cochees par defaut, lues dans l'iframe du CV
// (ou dans les reglages enregistres), remises a jour apres chaque rendu.
function _mepAfficherCompActif(cle) {
  try {
    var nomVar = (cle === 'pro') ? '_cvPdfAfficherCompPro' : '_cvPdfAfficherCompComp';
    var iframe = document.querySelector('#zonePdfInlineCV iframe');
    if (iframe && iframe.contentWindow && typeof iframe.contentWindow[nomVar] === 'boolean') { return iframe.contentWindow[nomVar]; }
    var pr = dossier.pdfReglages;
    return !(pr && pr[cle === 'pro' ? 'afficherCompPro' : 'afficherCompComp'] === false);
  } catch (e) { return true; }
}
// R.7 : quand le metier vise n'est pas dans notre base, l'assistant rapproche un secteur ; la personne le sait, en une phrase courte.
// Rien n'est dit quand le secteur vient de la fiche du metier ou du choix de la personne (cas ordinaires).
function _mepHtmlMentionSecteurMq() {
  var s = window._mepSecteurReferentiel;
  if (!s || s.origine !== 'assistant' || !s.nom) { return ''; }
  if (!_mepAfficherCompActif('pro') && !_mepAfficherCompActif('comp')) { return ''; }
  return '<p class="mention-secteur">Comp&eacute;tences propos&eacute;es d&rsquo;apr&egrave;s le secteur : ' + echapperAttribut(s.nom) + '.</p>';
}
function _mepHtmlQualitesMetierMq() {
  var qualites = window._mepQualitesMetier || [];
  var mention = _mepHtmlMentionSecteurMq();
  // Les qualites attendues sont des competences comportementales : rubrique masquee = rien a proposer.
  if (!qualites.length || !_mepAfficherCompActif('comp')) { return mention; }
  return mention + '<div class="checks auto">' +
    _mepCkMq('data-mep-qualites-metier', 'Ajouter les qualit&eacute;s attendues pour ce poste (' + qualites.length + ') ' + _mepAideBtn('Propos&eacute;es pour ce m&eacute;tier : gardez ce qui vous ressemble.'), _mepQualitesMetierActives(), 'ck ck-marque' + (_mepQualitesMetierActives() ? ' on' : '')) +
    '</div>';
}
// Nombre de certifications du dossier, et etat reel de la case « Certifications » (rubrique a part) : explicite (vrai / faux) si la personne a choisi,
// sinon automatique (des trois certifications).
function _mepNbCertifications() { return ((typeof dossier !== 'undefined' && dossier.certifications) || []).length; }
function _mepCertifsRubriqueActive() {
  try {
    var iframe = document.querySelector('#zonePdfInlineCV iframe');
    var v = (iframe && iframe.contentWindow && iframe.contentWindow._cvPdfCertifsRubrique !== undefined) ? iframe.contentWindow._cvPdfCertifsRubrique
      : (dossier.pdfReglages ? dossier.pdfReglages.certifsRubrique : null);
    if (v === true || v === false) { return v; }
  } catch (e) { /* automatique */ }
  return _mepNbCertifications() >= 3;
}
// Carte « Compétences » (cComp, retour Denis 2026-10-02) : les compétences professionnelles et comportementales, avec « Les montrer et les choisir » et les
// qualités attendues. Elles étaient avec les autres rubriques dans « Éléments supplémentaires », un titre qui les faisait passer pour un détail ; la carte
// se lit maintenant dans l'ordre du CV (en-tête, compétences, expériences, formations, autres rubriques). Mêmes ids et mêmes attributs qu'avant :
// aucun câblage ne change (_mepMajCompetencesMq, js/app.js).
// Disposition actuelle d'une famille de competences (« suite » / « une » / « deux »), meme regle que le rendu (cvPdfTemplateMaquette.js, dispositionComp) :
// le choix explicite, sinon la case « 2 colonnes » d'un ancien CV, sinon la regle d'avant (professionnelles sur 2 colonnes en Mixte et en style « Texte »).
// Style effectif d'une famille de competences : son choix propre, sinon le style general de « Mise en page et texte » (pastille / rect / texte).
function _mepStyleCompGeneral() {
  var v = (dossier.reglagesMiseEnPageCV || {}).styleCompetences;
  return v === 'rectangle' ? 'rect' : ((v === 'texte-seul' || v === 'texte') ? 'texte' : 'pastille');
}
function _mepStyleCompFamille(famille) {
  var f = (_mepEtatChoixMq().styleCompetencesFamille || {})[famille];
  return (f === 'pastille' || f === 'rect' || f === 'texte') ? f : 'general';
}
function _mepStyleCompEffectif(famille) {
  var f = _mepStyleCompFamille(famille);
  return f === 'general' ? _mepStyleCompGeneral() : f;
}
function _mepDispositionCompActuelle(famille) {
  var choix = _mepEtatChoixMq(), d = (choix.dispositionCompetences || {})[famille];
  if (d === 'suite' || d === 'une' || d === 'deux') { return d; }
  var titre = (famille === 'pro') ? _PDF_INTITULES.competencesPro : _PDF_INTITULES.competencesComp;
  if ((choix.listesDeuxColonnes || []).indexOf(titre) !== -1) { return 'deux'; }
  if (famille === 'pro') {
    var c = dossier.reglagesMiseEnPageCV || {};
    if (_mepEtatExperiences().mode === 'B' || _mepStyleCompEffectif('pro') === 'texte') { return 'deux'; }
  }
  return 'suite';
}
function _mepHtmlDispositionCompMq(famille) {
  // Mini CV A5 et modeles a disposition propre (Rectangles, Photo, Frise...) : ces reglages n'y ont aucun effet. Comme les autres reglages sans objet, ils sont GRISES avec la raison,
  // jamais laisses actifs sans rien faire (regle de Denis : aucun bouton qui ne fait rien).
  var grise = (_mepDispositionPropre() && !_mepListes2ColPossibles()) || _mepFormatA5();
  var html = _mepHtmlDispositionCompBrutMq(famille);
  if (!grise) { return html; }
  return '<div class="sans-objet" style="opacity:.5">' + html.replace(/<button type="button"/g, '<button type="button" disabled') +
    '<p class="sous" style="margin:.2rem 0 0">Sans effet : ' + (_mepFormatA5() ? _MEP_RAISON_A5 : 'ce mod&egrave;le a sa propre disposition') + '.</p></div>';
}
function _mepHtmlDispositionCompBrutMq(famille) {
  var actuel = _mepDispositionCompActuelle(famille), choix = _mepEtatChoixMq();
  var style = _mepStyleCompEffectif(famille), texte = (style === 'texte');
  var sep = (choix.separateurCompetences || {})[famille] || 'rond';
  return '<div class="inline dispo-ligne" style="margin-top:.45rem"><label>Disposition</label>' +
    _mepSegMq('mep-dispcomp-' + famille, [['suite', '&Agrave; la suite'], ['une', 'Une colonne'], ['deux', 'Deux colonnes']], actuel, 'seg-mini') + '</div>' +
    // Style propre a la famille : « G&eacute;n&eacute;ral » = le style de « Mise en page et texte » (par defaut) ; un choix ici est l'exception.
    '<div class="inline" style="margin-top:.45rem"><label>Style</label>' +
    _mepSegMq('mep-stylefam-' + famille, [['general', 'G&eacute;n&eacute;ral'], ['pastille', 'Pastilles'], ['rect', 'Rectangles'], ['texte', 'Texte']], _mepStyleCompFamille(famille), 'seg-mini') + _mepAideBtn('&laquo;&nbsp;G&eacute;n&eacute;ral&nbsp;&raquo; suit le style choisi dans &laquo;&nbsp;Mise en page et texte&nbsp;&raquo; (pastilles, rectangles ou texte). Les trois autres choix ne concernent que cette famille de comp&eacute;tences.') + '</div>' +
    // Signe entre les competences : seulement en style « Texte » a la suite.
    ((texte && actuel === 'suite') ? '<div class="inline" style="margin-top:.45rem"><label>Signe entre les comp&eacute;tences</label>' +
      _mepSegMq('mep-sepcomp-' + famille, [['rond', '&bull;'], ['median', '&middot;'], ['carre', '&#9632;'], ['losange', '&#9670;'], ['barre', '|']], sep, 'seg-mini') + '</div>' : '') +
    // Puces : seulement en style « Texte » en colonnes ; simple rappel du reglage general « Forme des puces » (un seul choix pour toutes les listes).
    ((texte && actuel !== 'suite') ? '<div class="inline" style="margin-top:.45rem"><label>Puces</label><span class="sous">Forme des puces : <b>' +
      ({ carre: 'carr&eacute;', triangle: 'triangle', losange: 'losange', tiret: 'tiret' }[(choix.formesPuces && choix.formesPuces.comp) || choix.formePuce] || 'rond') + '</b> (r&eacute;glage g&eacute;n&eacute;ral)</span> ' +
      '<button type="button" class="btn-miss" data-mep-aller-puces>Changer dans &laquo;&nbsp;Mise en page et texte&nbsp;&raquo; &rarr;</button></div>' : '');
}
// Edition des competences (retour Denis 2026-10-04) : un bouton central « Editer », de la meme forme que « Editer les experiences », pour les deux familles. Le panneau montre
// chaque competence affichee dans un champ ; les corrections valent pour CE CV seulement (meme magasin que « Modifier le texte » du plein ecran : cle « k:<texte d'origine> »),
// le dossier n'est jamais modifie. Un seul bouton : « Valider » s'il y a une modification, « Annuler » sinon. « Revenir aux valeurs par defaut » en bas du panneau.
var _mepEditionComp = false, _mepBrouillonsComp = {};
function _mepCorrectionsCompetences() {
  try { return document.querySelector('#zonePdfInlineCV iframe').contentWindow._cvPdfTextesEditesMq || {}; } catch (e) { return {}; }
}
function _mepNomCompetence(origine) {
  var e = _mepCorrectionsCompetences()['k:' + origine];
  return (e && e.t === origine) ? e.x : origine;
}
function _mepCompetencesModifiees() {
  return Object.keys(_mepBrouillonsComp).some(function (o) { return String(_mepBrouillonsComp[o]).trim() !== _mepNomCompetence(o); });
}
function _mepHtmlEditionCompetences() {
  var aff = window._mepCompetencesAffichees || { pro: [], comp: [] };
  var parComp = (_mepEtatExperiences().mode === 'C');
  var pro = parComp ? [] : aff.pro, comp = aff.comp;
  if (!pro.length && !comp.length && !Object.keys(_mepEtatChoixMq().competencesAjoutees || {}).length) { return ''; }
  var bouton = '<label class="bouton-editer' + (_mepEditionComp ? ' on' : '') + '"><input type="checkbox" data-mep-comp-editer' + (_mepEditionComp ? ' checked' : '') + '>' +
    '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
    '<span>&Eacute;diter les comp&eacute;tences <small>(professionnelles et comportementales)</small></span></label>';
  if (!_mepEditionComp) { return bouton; }
  var ajoutees = _mepEtatChoixMq().competencesAjoutees || {};
  var champs = function (titre, liste, famille) {
    var manuelles = ajoutees[famille] || [];
    return '<div class="champ"><label>' + titre + '</label>' + liste.map(function (o) {
      var val = (_mepBrouillonsComp[o] !== undefined) ? _mepBrouillonsComp[o] : _mepNomCompetence(o);
      var estManuelle = manuelles.indexOf(o) !== -1;
      return '<div class="ligne-comp" style="margin-bottom:.25rem"><input type="text" maxlength="80" data-mep-comp-champ="' + echapperAttribut(o) + '" value="' + echapperAttribut(val) + '" aria-label="' + echapperAttribut(o) + '">' +
        (estManuelle ? '<button type="button" class="btn-miss" data-mep-comp-retirer="' + famille + ':' + echapperAttribut(o) + '" title="Retirer cette comp&eacute;tence ajout&eacute;e">Retirer</button>' : '') + '</div>';
    }).join('') +
      '<div class="ligne-comp" style="margin-top:.3rem"><input type="text" maxlength="80" data-mep-comp-nouvelle="' + famille + '" placeholder="Ajouter une comp&eacute;tence&hellip;" aria-label="Ajouter une comp&eacute;tence">' +
      '<button type="button" class="mep-btn principal" style="white-space:nowrap" data-mep-comp-ajouter="' + famille + '">+ Ajouter</button></div></div>';
  };
  var modifie = _mepCompetencesModifiees();
  var nbCorrections = Object.keys(_mepCorrectionsCompetences()).filter(function (k) { return k.indexOf('k:') === 0; }).length + ((ajoutees.pro || []).length + (ajoutees.comp || []).length);
  return bouton + '<div class="exp-edit" id="mepEditComp" style="margin-top:.4rem"><div class="grille-el">' +
    (parComp ? '' : champs(echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesPro)), pro, 'pro')) + champs(echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesComp)), comp, 'comp') + '</div>' +
    (parComp ? '<p class="choix-aide">Les &laquo;&nbsp;comp&eacute;tences en action&nbsp;&raquo; se modifient dans la carte &laquo;&nbsp;Exp&eacute;riences professionnelles&nbsp;&raquo;.</p>' : '') +
    '<p class="choix-aide" style="margin:.3rem 0 0">Pour ce CV seulement : votre dossier d&rsquo;origine n&rsquo;est pas modifi&eacute;.</p>' +
    '<div class="exp-edit-pied"><span class="exp-edit-etat" aria-live="polite">' + (modifie ? 'Modifications pas encore valid&eacute;es' : '') + '</span>' +
    '<button type="button" class="mep-btn' + (modifie ? ' principal' : '') + '" data-mep-comp-valider>' + (modifie ? 'Valider' : 'Annuler') + '</button></div>' +
    '<div class="pied-options-supp"><button type="button" class="btn-miss" data-mep-comp-defaut' + (nbCorrections ? '' : ' disabled') + '>Revenir aux valeurs par d&eacute;faut</button></div></div>';
}
// Branche le bouton « Editer les competences », ses champs, « Valider / Annuler » et « Revenir aux valeurs par defaut » (appelee au cablage de la page ET apres chaque remplissage de la zone).
function _mepCablerEditionCompetences(racine) {
  racine.querySelectorAll('[data-mep-comp-editer]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepEditionComp = this.checked; if (!this.checked) { _mepBrouillonsComp = {}; } _mepRerendre(); });
  });
  racine.querySelectorAll('[data-mep-comp-champ]').forEach(function (champ) {
    champ.addEventListener('input', function () {
      _mepBrouillonsComp[this.getAttribute('data-mep-comp-champ')] = this.value;
      var modifie = _mepCompetencesModifiees(), bt = document.querySelector('[data-mep-comp-valider]'), et = document.querySelector('#mepEditComp .exp-edit-etat');
      if (bt) { bt.textContent = modifie ? 'Valider' : 'Annuler'; bt.classList.toggle('principal', modifie); }
      if (et) { et.textContent = modifie ? 'Modifications pas encore validées' : ''; }
    });
  });
  racine.querySelectorAll('[data-mep-comp-valider]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!_mepCompetencesModifiees()) { _mepBrouillonsComp = {}; _mepEditionComp = false; _mepRerendre(); return; }
      _mepPousserHistorique('competencesTextes');
      Object.keys(_mepBrouillonsComp).forEach(function (o) {
        var nouveau = String(_mepBrouillonsComp[o]).trim();
        _mepAppelerIframePdf('_pdfMqTexteEdite', 'k:' + o, o, nouveau || o);
      });
      _mepBrouillonsComp = {};
      _mepAppelerIframePdf('_pdfRafraichir');
      setTimeout(_mepRerendre, 80);
    });
  });
  var ajouterCompetence = function (famille) {
    var champ = document.querySelector('[data-mep-comp-nouvelle="' + famille + '"]');
    var v = champ ? champ.value.trim() : '';
    if (!v) { return; }
    var cur = Object.assign({}, _mepEtatChoixMq().competencesAjoutees || {});
    var liste = (cur[famille] || []).slice();
    var deja = ((window._mepCompetencesAffichees || {})[famille] || []).concat(liste).map(function (x) { return String(x).toLowerCase(); });
    if (deja.indexOf(v.toLowerCase()) !== -1) { champ.value = ''; return; }
    liste.push(v); cur[famille] = liste;
    _mepDefinirChoixMq('competencesAjoutees', cur);
  };
  racine.querySelectorAll('[data-mep-comp-ajouter]').forEach(function (b) {
    b.addEventListener('click', function () { ajouterCompetence(this.getAttribute('data-mep-comp-ajouter')); });
  });
  racine.querySelectorAll('[data-mep-comp-nouvelle]').forEach(function (champ) {
    champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); ajouterCompetence(this.getAttribute('data-mep-comp-nouvelle')); } });
  });
  racine.querySelectorAll('[data-mep-comp-retirer]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = this.getAttribute('data-mep-comp-retirer'), i = p.indexOf(':'), famille = p.slice(0, i), nom = p.slice(i + 1);
      var cur = Object.assign({}, _mepEtatChoixMq().competencesAjoutees || {});
      cur[famille] = (cur[famille] || []).filter(function (x) { return x !== nom; });
      if (!cur[famille].length) { delete cur[famille]; }
      delete _mepBrouillonsComp[nom];
      _mepDefinirChoixMq('competencesAjoutees', Object.keys(cur).length ? cur : null);
    });
  });
  racine.querySelectorAll('[data-mep-comp-defaut]').forEach(function (b) {
    b.addEventListener('click', function () {
      _mepPousserHistorique('competencesTextes');
      _mepBrouillonsComp = {};
      _mepAppelerIframePdf('_pdfMqChoix', 'competencesAjoutees', null);
      _mepAppelerIframePdf('_pdfMqRemettreTextesCompetences');
      setTimeout(_mepRerendre, 80);
    });
  });
}

function _htmlSecCompetencesMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var choix = _mepEtatChoixMq();
  var aff = window._mepCompetencesAffichees || { pro: [], comp: [] };
  function bloc(cle, libelle, attrMoins, attrPlus, nb, extra) {
    var perso = !!(cle === 'pro' ? choix.competencesProChoisies : choix.competencesCompChoisies);
    var actif = _mepAfficherCompActif(cle);
    var parComp = (cle === 'pro' && _mepEtatExperiences().mode === 'C');
    var origineFam = (cle === 'pro') ? (parComp ? _PDF_INTITULES.competencesEnAction : _PDF_INTITULES.competencesPro) : _PDF_INTITULES.competencesComp;
    var renomme = _mepIntitule(origineFam) !== origineFam;
    // Les libellés du panneau suivent l'intitulé choisi (retour Denis 2026-10-03) : on retrouve tout de suite la rubrique.
    var caseAfficher = _mepCkMq('data-mep-afficher-comp="' + cle + '"', renomme ? 'Afficher &laquo;&nbsp;' + echapperAttribut(_mepIntitule(origineFam)) + '&nbsp;&raquo;' : 'Afficher les comp&eacute;tences ' + (cle === 'pro' ? (parComp ? 'en action' : 'professionnelles') : 'comportementales'), actif, 'ck ck-marque' + (actif ? ' on' : ''));
    // Case decochee : la rubrique n'apparait pas sur le CV, donc plus rien a regler ni a choisir : tout le reste du bloc disparait
    // (compteur, bouton, liste). Recochee, le bloc revient tel qu'il etait.
    if (!actif) { return '<div class="champ">' + caseAfficher + '</div>'; }
    // « Changer l'intitule » PILE sous la case « Afficher ... » (retour Denis 2026-10-03).
    return '<div class="champ">' + caseAfficher + _mepHtmlIntituleMq(origineFam) + '<label>' + (renomme ? echapperAttribut(_mepIntitule(origineFam)) + ' &agrave; afficher' : (parComp ? 'Comp&eacute;tences en action &agrave; afficher' : libelle)) + '</label><div class="ligne-comp"><div class="pas"><button type="button" ' + attrMoins + '>&minus;</button><span id="mepNb' + (cle === 'pro' ? 'Pro' : 'Comp') + '">' + nb + '</span><button type="button" ' + attrPlus + '>+</button></div>' +
      '<button type="button" class="btn-miss' + (perso ? ' perso' : '') + '" data-mep-pick="' + cle + '">' + (perso ? 'Ma s&eacute;lection' : 'Les montrer et les choisir') + (_mepPickOuvert[cle] ? ' &#9652;' : ' &#9662;') + '</button></div>' +
      _mepHtmlDispositionCompMq(cle) +
      // La liste s'ouvre DANS sa colonne, sous sa rubrique (professionnelles a gauche, comportementales a droite) : elle ne se deplace plus.
      '<div id="mepPick' + (cle === 'pro' ? 'Pro' : 'Comp') + '" class="miss-liste mep-pick-' + cle + '" style="display:none"></div>' + (extra || '') + '</div>';
  }
  return '<details class="mep-carte" id="cComp"' + (_mepCarteOuverte('cComp', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('competences', _mepTitreCarte(_PDF_INTITULES.competences, 'Comp&eacute;tences'), 'Professionnelles et comportementales : lesquelles montrer, et dans quel ordre.', false, _mepCarteOuverte('cComp', false)) +
    '<div class="carte-corps">' +
    // Titres modifiables EN HAUT (retour Denis 2026-10-03) : seulement ceux qui sont réellement sur le CV (selon le mode et le modèle).
    '<div class="autres-titres" hidden>' + _mepHtmlIntituleMq(_PDF_INTITULES.competences, true, 'titre g&eacute;n&eacute;ral, aussi celui du bandeau &laquo;&nbsp;Comp&eacute;tences&nbsp;&raquo; du mod&egrave;le Rectangles arrondis') +
    _mepHtmlIntituleMq(_PDF_INTITULES.savoirs, true, 'bo&icirc;te du mod&egrave;le Rectangles arrondis') + '</div>' +
    '<div class="grille-el">' +
    bloc('pro', 'Comp&eacute;tences professionnelles &agrave; afficher', 'data-mep-comp-pro-moins', 'data-mep-comp-pro-plus', aff.pro.length) +
    bloc('comp', 'Comp&eacute;tences comportementales &agrave; afficher', 'data-mep-comp-comportementales-moins', 'data-mep-comp-comportementales-plus', aff.comp.length) +
    '</div>' +
    // Disposition des deux blocs (retour Denis 2026-10-03) : avec les options de disposition, sous les deux colonnes.
    _mepHtmlProCompDispoMq() +
    '<div id="mepZoneEditComp">' + _mepHtmlEditionCompetences() + '</div>' +
    // Ligne a part sous les deux colonnes (elles gardent la meme hauteur : plus de grand vide sous les competences professionnelles).
    '<div id="mepZoneQualitesMetier">' + _mepHtmlQualitesMetierMq() + '</div>' +
    _htmlBoutonOptionsSupp('comp') + '</div></details>';
}
// Carte « Autres rubriques » (cSupp, ex « Éléments supplémentaires ») : ce qui n'est pas une compétence.
function _htmlSecSupplementairesMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var c = dossier.reglagesMiseEnPageCV || {};
  var rub = (c.rubriques && typeof c.rubriques === 'object') ? c.rubriques : {};
  var choix = _mepEtatChoixMq();
  return '<details class="mep-carte" id="cSupp"' + (_mepCarteOuverte('cSupp', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('supplementaires', 'Autres rubriques', 'Certifications, logiciels, langues, centres d&rsquo;int&eacute;r&ecirc;t, informations compl&eacute;mentaires.', false, _mepCarteOuverte('cSupp', false)) +
    '<div class="carte-corps">' +
    '<div class="grille-el">' + _htmlZoneCertificationsMq() + _htmlBoiteInfosCompMq() + '</div>' + (_mepNbCertifications() ? _mepHtmlDatesRubrique('cert', true) : '') +
    '<h4 class="mini-titre">Rubriques &agrave; afficher</h4>' +
    '<div class="checks auto">' +
    // Retour Denis 2026-10-03 : le bouton « Changer l'intitulé » est JUSTE SOUS l'option cochée (visible seulement si la rubrique est sur le CV).
    '<div class="opt-rub">' + _mepCkMq('data-mep-rubrique-simple="logiciels"', echapperAttribut(_mepIntitule(_PDF_INTITULES.logiciels)), rub.logiciels !== false) + _mepHtmlIntituleMq(_PDF_INTITULES.logiciels) + '</div>' +
    '<div class="opt-rub">' + _mepCkMq('data-mep-rubrique-simple="loisirs"', echapperAttribut(_mepIntitule(_PDF_INTITULES.loisirs)), rub.loisirs !== false) + _mepHtmlIntituleMq(_PDF_INTITULES.loisirs) + '</div>' +
    '<div class="opt-rub">' + _mepCkMq('data-mep-rubrique-simple="langues"', echapperAttribut(_mepIntitule(_PDF_INTITULES.langues)), rub.langues !== false) + _mepHtmlIntituleMq(_PDF_INTITULES.langues) + '</div>' +
    // « Certifications » : rubrique a part (decision de Denis, 2026-09-30). Automatique des trois ; coche ou decoche au choix de la personne.
    (_mepNbCertifications() ? '<div class="opt-rub">' + _mepCkMq('data-mep-certifs-rubrique', echapperAttribut(_mepIntitule(_PDF_INTITULES.certifications)) + ' ' + _mepAideBtn('Rubrique &agrave; part, automatique d&egrave;s trois ; d&eacute;cochez pour les remettre dans les formations.'), _mepCertifsRubriqueActive()) + _mepHtmlIntituleMq(_PDF_INTITULES.certifications) + '</div>' : '') +
    // Informations complémentaires : la case n'existe que si la personne en a saisi ; cochée d'office dès qu'elle en affiche (retour Denis 2026-10-03).
    '<div class="opt-rub opt-rub-large">' + (_mepInfosSaisies().length
      ? _mepCkMq('data-mep-infos-rubrique', '<span class="mot-final">' + echapperAttribut(_mepIntitule(_PDF_INTITULES.infos)) + ' ' + _mepAideBtn('Cette rubrique se remplit avec les informations que vous ajoutez plus bas, avec &laquo;&nbsp;Ajouter une information&nbsp;&raquo;. D&egrave;s que vous en ajoutez une, la case se coche toute seule et la rubrique appara&icirc;t sur le CV.') + '</span>', (choix.infosCompAffichees || []).length > 0)
      : _mepCkMq('data-mep-infos-rubrique disabled title="Aucune information ajout&eacute;e pour le moment"', '<span class="mot-final">' + echapperAttribut(_mepIntitule(_PDF_INTITULES.infos)) + ' ' + _mepAideBtn('Cette rubrique se remplit avec les informations que vous ajoutez plus bas, avec &laquo;&nbsp;Ajouter une information&nbsp;&raquo;. D&egrave;s que vous en ajoutez une, la case se coche toute seule et la rubrique appara&icirc;t sur le CV.') + '</span>', false, 'ck sans-objet')) +
    _mepHtmlIntituleMq(_PDF_INTITULES.infos, false, '', true) + '</div>' +
    '</div>' +
    // TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout") : "Certifications"
    // retiree de ces 2 listes -- plus une rubrique a part a afficher/masquer ou a mettre sur 2
    // colonnes, chaque certification se choisit desormais individuellement dans la carte
    // Formations (comme une formation), jamais un reglage global en double.
    '<h4 class="mini-titre">Listes courtes sur 2 colonnes ' + _mepAideBtn('Gagne de la place.') + '</h4>' +
    '<div class="checks auto">' + [['logiciels', 'Logiciels et outils'], ['langues', 'Langues'], ['certifications', 'Certifications'], ['loisirs', 'Centres d&rsquo;int&eacute;r&ecirc;t']].map(function (r) {
      var titre = _PDF_INTITULES[r[0]];
      r = [r[0], echapperAttribut(_mepIntitule(titre))];
      // Les modeles a disposition propre grisent ces cases, sauf Rectangles arrondis (ses listes courtes, pleine largeur, passent sur 2 colonnes ;
      // ses competences sont dans leurs rectangles).
      return _mepCkMqSansObjet('data-mep-liste-2col="' + titre + '"', r[1], (choix.listesDeuxColonnes || []).indexOf(titre) !== -1,
        (_mepDispositionPropre() && !_mepListes2ColPossibles()) || _mepFormatA5());
    }).join('') + '</div>' + _htmlRubriquesMasqueesMep() + _htmlBoutonOptionsSupp('autres') + '</div></details>';
}

// Informations complementaires : lien (LinkedIn, site) de l'identite, et lignes libres (disponibilite, RQTH, mobilite...) captees a l'import
// ou ajoutees ici. Rien n'est affiche d'office, sauf le lien renseigne par la personne dans son identite.
function _htmlSuggestionsInfosCompMq(dejaLa) {
  return '<div class="sugg-infos">' + _MEP_SUGGESTIONS_INFOS.map(function (g, gi) {
    return '<div class="sugg-groupe"><b>' + g.groupe + '</b><div class="sugg-liste">' + g.items.map(function (it, ii) {
      var present = dejaLa.indexOf(it.t) !== -1;
      return '<button type="button" class="mep-btn sugg-item' + (present ? ' deja' : '') + '" data-mep-info-sugg="' + gi + ':' + ii + '"' + (present ? ' disabled' : '') + '>' +
        echapperAttribut(it.modele ? 'Plus de \u2026 ans d\u2019exp\u00e9rience en \u2026' : it.t) + (it.sensible ? ' <span class="ex">(sensible : &agrave; cocher vous-m&ecirc;me)</span>' : '') + (present ? ' <span class="ex">(d&eacute;j&agrave; dans la liste)</span>' : '') + '</button>';
    }).join('') + '</div></div>';
  }).join('') + '<p class="sous" style="margin:.2rem 0 0">Un clic ajoute la phrase et la coche. Rien ne s&rsquo;affiche sur le CV sans que la case soit coch&eacute;e.</p></div>';
}
// Suggestions d'informations complementaires (pour eviter de tout taper, donc les fautes) : un clic = ajoutee ET cochee.
// Le statut RQTH est une information sensible : proposee, ajoutee a la liste, mais JAMAIS cochee a la place de la personne.
// Le permis et le vehicule ne sont pas proposes ici : ils figurent deja dans les coordonnees du CV (jamais deux fois la meme information).
var _MEP_SUGGESTIONS_INFOS = [
  { groupe: 'Disponibilit&eacute;', items: [{ t: 'Disponible imm\u00e9diatement' }, { t: 'Disponible sous 15 jours' }, { t: 'Disponibilit\u00e9 \u00e0 convenir' }] },
  { groupe: 'Mobilit&eacute;', items: [{ t: 'Mobile sur toute la France' }, { t: 'Mobile dans la r\u00e9gion' }, { t: 'Mobile dans le d\u00e9partement' }] },
  { groupe: 'Statut', items: [{ t: 'Reconnu travailleur handicap\u00e9 (RQTH)', sensible: true }] },
  { groupe: 'Exp&eacute;rience', items: [{ t: 'Plus de 5 ans d\u2019exp\u00e9rience en ', modele: true }] }
];
var _mepSuggInfosOuvert = false;
function _mepInfosSaisies() { return (dossier.informationsNonClassees || []).filter(function (x) { return typeof x === 'string' && x.trim(); }); }
function _htmlBoiteInfosCompMq() {
  var choix = _mepEtatChoixMq();
  var lien = (dossier.identite && dossier.identite.lien) || '';
  var infos = (dossier.informationsNonClassees || []).filter(function (x) { return typeof x === 'string' && x.trim(); });
  var cochees = choix.infosCompAffichees || [];
  var nbSurCv = (cochees || []).length + ((lien && choix.afficherLien !== false) ? 1 : 0);
  var corps = (lien ? '<div class="checks auto">' + _mepCkMq('data-mep-info-lien', 'Afficher mon lien <span class="ex">(' + echapperAttribut(lien) + ')</span>', choix.afficherLien !== false) + '</div>'
          : '<p style="font-size:.8rem;color:var(--text-muted);margin:.2rem 0">Votre lien LinkedIn ou site se renseigne dans votre identit&eacute; (&laquo; Vos informations &raquo;).</p>') +
    (infos.length ? '<div class="checks auto" style="grid-template-columns:1fr">' + infos.map(function (t, i) {
      return _mepCkMq('data-mep-info-comp="' + i + '"', echapperAttribut(t), cochees.indexOf(t) !== -1);
    }).join('') + '</div>' : '<p style="font-size:.8rem;color:var(--text-muted);margin:.2rem 0">Aucune information ajout&eacute;e (disponibilit&eacute;, mobilit&eacute;, RQTH&hellip;). Rien ne s&rsquo;affiche sans que vous le cochiez.</p>') +
    '<div class="champ" style="margin-top:.4rem"><label for="mepInfoNouvelle">Ajouter une information</label>' +
    '<div style="display:flex;gap:.4rem"><input type="text" id="mepInfoNouvelle" maxlength="120" placeholder="Ex. : Disponible imm&eacute;diatement" style="flex:1;min-width:0">' +
    '<button type="button" class="mep-btn principal" style="white-space:nowrap" data-mep-info-ajouter>+ Ajouter</button>' +
    '<button type="button" class="mep-btn" style="white-space:nowrap" data-mep-info-sugg-ouvrir aria-expanded="' + (_mepSuggInfosOuvert ? 'true' : 'false') + '">Suggestions ' + (_mepSuggInfosOuvert ? '&#9652;' : '&#9662;') + '</button></div>' +
    (_mepSuggInfosOuvert ? _htmlSuggestionsInfosCompMq(infos) : '') + '</div>';
  // Meme forme que « Modifier mes certifications » (retour Denis 2026-10-04) : un bouton depliant, sur la meme ligne que les certifications, qui ne prend de la place que s'il est ouvert.
  return '<details class="choix-exp" id="zoneInfos"' + (_mepCarteOuverte('zoneInfos', false) ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Informations compl&eacute;mentaires</span></b>' +
    '<small>' + nbSurCv + ' sur le CV &middot; cliquez pour modifier</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary><div class="choix-corps">' + corps + '</div></details>';
}

// Champ d'un formulaire d'edition « pour ce CV seulement » (formations, experiences personnelles) : `data-orig` garde la valeur du dossier, pour n'enregistrer que ce qui change.
function _mepChampPourCeCv(attr, libelle, valeur, orig, large, placeholder) {
  return '<div class="champ"' + (large ? ' style="grid-column:1/-1"' : '') + '><label>' + libelle + '</label><input type="text" ' + attr + ' value="' + echapperAttribut(valeur) + '" data-orig="' + echapperAttribut(orig) + '"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + '></div>';
}

// Liste « Modifier mes competences et leurs missions » (carte Experiences, modes Par competences et Mixte) : lue dans window._mepGroupesCompTous, posee par le rendu
// du CV (cvPdfTemplateMaquette.js, groupesAffiches). Chaque action ecrit dans le CV par les fonctions de l'iframe (retrait existant, correction de texte existante,
// ordre : choix « ordreCompetences »), jamais dans le dossier.
function _mepRemplirCompetencesMissionsMq() {
  var zone = document.getElementById('mepListeCompMissions');
  if (!zone) { return; }
  var groupes = window._mepGroupesCompTous || [];
  var nb = 0;
  var html = groupes.map(function (g, gi) {
    var lignes = g.items.map(function (it, ii) {
      if (it.affichee) { nb++; }
      var noteProposition = it.proposition ? ' <em>(proposition de l&rsquo;assistant' + (it.etiquette ? ' : ' + echapperAttribut(it.etiquette) : '') + (it.affichee ? '' : ', non affich&eacute;e') + ')</em>' : '';
      var note = it.proposition ? noteProposition
        : (it.reserve && !it.affichee) ? ' <em>(en r&eacute;serve : reste dans votre exp&eacute;rience)</em>'
        : it.coupe === 'resume' ? ' <em>(non affich&eacute;e en niveau &laquo;&nbsp;R&eacute;sum&eacute;&nbsp;&raquo;)</em>'
        : (it.coupe === 'auto' ? ' <em>(retir&eacute;e automatiquement pour que le CV tienne sur une page)</em>'
        : ((!it.affichee && !it.retiree && !it.ecartee) ? ' <em>(dans votre exp&eacute;rience, pas en action)</em>' : ''));
      var coche = it.affichee || (!it.retiree && !it.ecartee);
      return '<div class="ligne-bloc"><label class="ligne-choix' + (it.retiree || it.ecartee ? ' off' : '') + '" style="padding-left:1rem">' +
        '<input type="checkbox" data-mep-cm-ck="' + gi + ':' + ii + '"' + (coche ? ' checked' : '') + '>' +
        '<span class="nom" data-mep-cm-nom="' + gi + ':' + ii + '">' + echapperAttribut(it.texteAffiche) + '</span>' +
        (it.source ? ' <em>(' + echapperAttribut(it.source) + ')</em>' : '') + note +
        '<button type="button" class="btn-miss" data-mep-cm-ed="' + gi + ':' + ii + '">Modifier</button>' +
        '<button type="button" class="btn-miss" data-mep-cm-mh="' + gi + ':' + ii + '" title="Monter"' + (ii === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button type="button" class="btn-miss" data-mep-cm-mb="' + gi + ':' + ii + '" title="Descendre"' + (ii === g.items.length - 1 ? ' disabled' : '') + '>&darr;</button></label></div>';
    }).join('');
    var tete = (g.theme && groupes.length > 1)
      ? '<div class="ligne-bloc"><label class="ligne-choix"><span class="nom" style="font-weight:700">' + echapperAttribut(g.theme) + '</span>' +
        '<button type="button" class="btn-miss" data-mep-cm-gh="' + gi + '" title="Monter cette comp&eacute;tence"' + (gi === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button type="button" class="btn-miss" data-mep-cm-gb="' + gi + '" title="Descendre cette comp&eacute;tence"' + (gi === groupes.length - 1 ? ' disabled' : '') + '>&darr;</button></label></div>' : '';
    return tete + lignes;
  }).join('');
  zone.innerHTML = html || '<p class="choix-aide">Aucune mission &agrave; afficher pour le moment.</p>';
  var resume = document.getElementById('mepResumeCompMissions');
  if (resume) { resume.innerHTML = 'En haut du CV &middot; ' + nb + ' mission' + (nb > 1 ? 's' : '') + ' affich&eacute;e' + (nb > 1 ? 's' : '') + ' &middot; cliquez pour modifier'; }
  function ref(attr, el) { var q = el.getAttribute(attr).split(':'); var g = groupes[+q[0]]; return { g: g, gi: +q[0], ii: +q[1], it: g && g.items[+q[1]] }; }
  // l'ordre complet (tous les themes, toutes les missions, y compris decochees) est ecrit a chaque deplacement
  function ordreActuel() {
    var o = { themes: groupes.map(function (g) { return g.cleTheme; }), items: {} };
    groupes.forEach(function (g) { o.items[g.cleTheme] = g.items.map(function (it) { return it.cle; }); });
    return o;
  }
  function ecrireOrdre(o) { _mepPousserHistorique('ordreCompetences'); _mepAppelerIframePdf('_pdfMqChoix', 'ordreCompetences', o); setTimeout(_mepRerendre, 30); }
  zone.querySelectorAll('[data-mep-cm-mh],[data-mep-cm-mb]').forEach(function (b) {
    b.addEventListener('click', function () {
      var haut = this.hasAttribute('data-mep-cm-mh'), r = ref(haut ? 'data-mep-cm-mh' : 'data-mep-cm-mb', this), o = ordreActuel(), l = o.items[r.g.cleTheme], j = haut ? r.ii - 1 : r.ii + 1;
      if (j < 0 || j >= l.length) { return; }
      l.splice(j, 0, l.splice(r.ii, 1)[0]); ecrireOrdre(o);
    });
  });
  zone.querySelectorAll('[data-mep-cm-gh],[data-mep-cm-gb]').forEach(function (b) {
    b.addEventListener('click', function () {
      var haut = this.hasAttribute('data-mep-cm-gh'), gi = parseInt(this.getAttribute(haut ? 'data-mep-cm-gh' : 'data-mep-cm-gb'), 10), o = ordreActuel(), j = haut ? gi - 1 : gi + 1;
      if (j < 0 || j >= o.themes.length) { return; }
      o.themes.splice(j, 0, o.themes.splice(gi, 1)[0]); ecrireOrdre(o);
    });
  });
  zone.querySelectorAll('[data-mep-cm-ck]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var r = ref('data-mep-cm-ck', this); if (!r.it) { return; }
      _mepPousserHistorique('compMissionsAffichage');
      // Une mission en reserve entre dans le CV (ou en sort) via la liste des reserves choisies ; les autres via les retraits.
      if (r.it.reserve) {
        var choisies = (_mepEtatChoixMq().reservesChoisies || []).slice(), pos = choisies.indexOf(r.it.texte);
        if (this.checked && pos === -1) { choisies.push(r.it.texte); } else if (!this.checked && pos !== -1) { choisies.splice(pos, 1); }
        _mepAppelerIframePdf('_pdfMqChoix', 'reservesChoisies', choisies.length ? choisies : null);
        if (this.checked) { _mepAppelerIframePdf('_pdfMqRemettreCompetence', r.it.texte); }
      } else if (this.checked) {
        _mepAppelerIframePdf('_pdfMqRemettreCompetence', r.it.texte);
        if (r.it.ecartee) { _mepBasculerCompetenceChoisie('pro', r.it.texte, true); }
      } else {
        _mepAppelerIframePdf('_pdfMqRetirerCompetence', r.it.texte);
      }
      setTimeout(_mepRerendre, 30);
    });
  });
  zone.querySelectorAll('[data-mep-cm-ed]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      var r = ref('data-mep-cm-ed', this), nom = zone.querySelector('[data-mep-cm-nom="' + r.gi + ':' + r.ii + '"]');
      if (!r.it || !nom) { return; }
      if (nom.getAttribute('contenteditable') !== 'true') { nom.setAttribute('contenteditable', 'true'); nom.focus(); this.textContent = 'Valider'; return; }
      var nouveau = nom.textContent.trim();
      _mepPousserHistorique('compMissionsTexte');
      _mepAppelerIframePdf('_pdfMqTexteEdite', r.it.cle, r.it.texte, nouveau || r.it.texte);
      setTimeout(_mepRerendre, 30);
    });
  });
}
// Liste « Les montrer et les choisir » d'une famille de competences (cases a cocher + « Remettre l'ordre automatique »), dans la zone donnee.
function _mepRemplirListeChoixMq(zone, cle, affichees, pool) {
  // Retour Denis 2026-10-03 : chaque competence porte un SIGNE (point plein = tiree du CV ; losange vide = attendue dans le metier) ; la legende n'est PAS
  // affichee d'office (annoncer d'entree « attendu par le secteur » pourrait faire sentir la personne moins legitime a la choisir) : elle s'ouvre
  // seulement si la personne clique sur le petit « ? ».
  var nbAttendues = pool.filter(function (x) { return _mepEstCompetenceAttendue(cle, x); }).length;
  // Bas de liste (comme la maquette validee) : un petit « ? » + sa phrase ; la legende s'ouvre juste en dessous, seulement au clic.
  var aideLegende = nbAttendues ? '<div class="pied-legende"><button type="button" class="aide-option" data-mep-legende="' + cle + '" aria-expanded="false" title="L&eacute;gende" aria-label="L&eacute;gende des signes devant les comp&eacute;tences">?</button><span class="sous">L&eacute;gende</span></div>' : '';
  var legende = nbAttendues
    ? '<div class="legende" data-mep-legende-zone="' + cle + '" hidden>' +
      '<div><span class="sg cv" aria-hidden="true">\u25CF</span><span>Tir&eacute;e de votre CV.</span></div>' +
      '<div><span class="sg att" aria-hidden="true">\u25C7</span><span>' + (cle === 'pro' ? 'Attendue dans ce secteur' : 'Attendue dans ce m&eacute;tier') + ' : si vous la reconnaissez, cochez-la.</span></div></div>'
    : '';
  // Le nom suit l'intitule choisi ; en « Par competences » la liste des competences « pro » est celle des competences en action (retour Denis 2026-10-03).
  var parCompetences = (cle === 'pro' && _mepEtatExperiences().mode === 'C');
  var nomListe = echapperAttribut(_mepIntitule(cle === 'pro' ? (parCompetences ? _PDF_INTITULES.competencesEnAction : _PDF_INTITULES.competencesPro) : _PDF_INTITULES.competencesComp));
  zone.innerHTML = '<div class="miss-tete"><span><b>' + nomListe + '</b> : ' + affichees.length + ' sur ' + pool.length + ' affich&eacute;es</span><button type="button" data-mep-pick-raz="' + cle + '">Remettre la s&eacute;lection automatique</button></div><div class="cols">' +
    // Les competences affichees d'abord, dans leur ordre ; les autres ensuite. Fleches « monter / descendre » sur les affichees (retour Denis 2026-10-03) : nombre ET ordre.
    affichees.concat(pool.filter(function (x) { return affichees.indexOf(x) === -1; })).map(function (x) {
      var coche = affichees.indexOf(x) !== -1;
      var posA = affichees.indexOf(x);
      var att = _mepEstCompetenceAttendue(cle, x);
      return '<label class="' + (coche ? '' : 'non') + '"><input type="checkbox" data-mep-pick-item="' + cle + '" data-nom="' + echapperAttribut(x) + '"' + (coche ? ' checked' : '') + '><span class="sg ' + (att ? 'att' : 'cv') + '" aria-hidden="true">' + (att ? '\u25C7' : '\u25CF') + '</span><span>' + echapperAttribut(x) + '</span>' +
        (coche ? '<button type="button" class="btn-miss" data-mep-pick-haut="' + cle + '" data-nom="' + echapperAttribut(x) + '" title="' + (parCompetences ? 'L&rsquo;ordre se r&egrave;gle dans la liste &laquo;&nbsp;Modifier ' + nomListe + '&nbsp;&raquo; de la carte Exp&eacute;riences.' : 'Monter') + '"' + ((parCompetences || posA === 0) ? ' disabled' : '') + '>&uarr;</button>' +
          '<button type="button" class="btn-miss" data-mep-pick-bas="' + cle + '" data-nom="' + echapperAttribut(x) + '" title="' + (parCompetences ? 'L&rsquo;ordre se r&egrave;gle dans la liste &laquo;&nbsp;Modifier ' + nomListe + '&nbsp;&raquo; de la carte Exp&eacute;riences.' : 'Descendre') + '"' + ((parCompetences || posA === affichees.length - 1) ? ' disabled' : '') + '>&darr;</button>' : '') + '</label>';
    }).join('') + '</div>' + aideLegende + legende;
  var bLeg = zone.querySelector('[data-mep-legende]');
  if (bLeg) {
    var basculerLegende = function () {
      var z = zone.querySelector('[data-mep-legende-zone]');
      _mepOuvrirBulleAide(bLeg, z.innerHTML);
    };
    bLeg.addEventListener('click', basculerLegende);
    var phrase = bLeg.parentElement.querySelector('.sous'); if (phrase) { phrase.style.cursor = 'pointer'; phrase.addEventListener('click', basculerLegende); }
  }
  zone.querySelectorAll('[data-mep-pick-item]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepBasculerCompetenceChoisie(cle, this.getAttribute('data-nom'), this.checked); });
  });
  zone.querySelectorAll('[data-mep-pick-haut], [data-mep-pick-bas]').forEach(function (b) {
    b.addEventListener('click', function (ev) { ev.preventDefault(); _mepDeplacerCompetence(cle, this.getAttribute('data-nom'), this.hasAttribute('data-mep-pick-haut') ? -1 : 1, affichees, pool); });
  });
  var raz = zone.querySelector('[data-mep-pick-raz]');
  if (raz) { raz.addEventListener('click', function () { _mepRemettreCompetencesAuto(cle); }); }
}
// Monte ou descend une competence affichee d'un cran : l'ordre complet (affichees dans leur nouvel ordre, puis les autres) est ecrit dans choixMq.ordreMotsCles[cle].
function _mepDeplacerCompetence(cle, nom, sens, affichees, pool) {
  var i = affichees.indexOf(nom), j = i + sens;
  if (i === -1 || j < 0 || j >= affichees.length) { return; }
  var ordre = affichees.slice(); ordre[i] = ordre[j]; ordre[j] = nom;
  var complet = ordre.concat(pool.filter(function (x) { return ordre.indexOf(x) === -1; }));
  var tous = Object.assign({}, _mepEtatChoixMq().ordreMotsCles || {}); tous[cle] = complet;
  _mepPousserHistorique('ordreMotsCles' + cle);
  _mepAppelerIframePdf('_pdfMqChoix', 'ordreMotsCles', tous);
  setTimeout(_mepRerendre, 30);
}
// Après chaque rendu du CV : compteurs, boutons « Choisir » et listes des compétences (maquette : majPickers).
var _mepDerniereReprisePerso = 0;
function _mepMajCompetencesMq() {
  if (typeof _mepMajIntitulesVisibles === 'function') { _mepMajIntitulesVisibles(); }
  // La carte « Expérience personnelle » se construit avec la liste du rendu PRÉCÉDENT : quand le dossier devient vide (ou se remplit), elle montrait l'ancien état jusqu'au rendu suivant.
  // Une fois le CV rendu, si la carte ne correspond pas à la liste réelle, le panneau est reconstruit UNE fois (jamais en boucle).
  try {
    var cartePerso = document.getElementById('cExpPerso');
    if (cartePerso && (!!cartePerso.getAttribute('data-vide')) !== (_mepListeExperiencePersoMoteur().length === 0) && Date.now() - _mepDerniereReprisePerso > 1500) {
      _mepDerniereReprisePerso = Date.now(); setTimeout(_mepRerendre, 50);
    }
  } catch (e) { /* panneau pas prêt */ }
  _mepRemplirCompetencesMissionsMq();
  // LOT 3.5 : la case des qualites attendues est remplie apres chaque rendu (l'apercu calcule les qualites APRES la construction de la carte).
  var zoneQualites = document.getElementById('mepZoneQualitesMetier');
  if (zoneQualites) {
    zoneQualites.innerHTML = _mepHtmlQualitesMetierMq();
    _mepBrancherAidesOptions(zoneQualites);
    var caseQualites = zoneQualites.querySelector('[data-mep-qualites-metier]');
    if (caseQualites) {
      caseQualites.addEventListener('click', function () {
        _mepPousserHistorique('qualitesMetier');
        _mepAppelerIframePdf('_pdfBasculerQualitesMetier');
      });
    }
  }
  // Edition des competences : la zone est (re)remplie apres chaque rendu, quand la liste des competences affichees est connue.
  var zoneEditComp = document.getElementById('mepZoneEditComp');
  if (zoneEditComp && !(zoneEditComp.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) { zoneEditComp.innerHTML = _mepHtmlEditionCompetences(); _mepCablerEditionCompetences(zoneEditComp); }
  var aff = window._mepCompetencesAffichees;
  if (!aff) { return; }
  var choix = _mepEtatChoixMq();
  [['pro', aff.pro, aff.poolPro || [], choix.competencesProChoisies, 'Pro', 'pro'],
   ['comp', aff.comp, aff.poolComp || [], choix.competencesCompChoisies, 'Comp', 'comportementales']].forEach(function (d) {
    var cle = d[0], affichees = d[1], pool = d[2], perso = !!d[3];
    var nb = document.getElementById('mepNb' + d[4]);
    if (nb) { nb.textContent = affichees.length; }
    var moins = document.querySelector('[data-mep-comp-' + d[5] + '-moins]');
    var plus = document.querySelector('[data-mep-comp-' + d[5] + '-plus]');
    if (moins) { moins.disabled = affichees.length <= 3; }
    if (plus) { plus.disabled = affichees.length >= pool.length; }
    var btn = document.querySelector('[data-mep-pick="' + cle + '"]');
    if (btn) { btn.className = 'btn-miss' + (perso ? ' perso' : ''); btn.innerHTML = (perso ? 'Ma s&eacute;lection' : 'Les montrer et les choisir') + (_mepPickOuvert[cle] ? ' &#9652;' : ' &#9662;'); }
    var zone = document.getElementById('mepPick' + d[4]);
    if (!zone) { return; }
    zone.style.display = _mepPickOuvert[cle] ? 'block' : 'none';
    if (!_mepPickOuvert[cle]) { zone.innerHTML = ''; return; }
    _mepRemplirListeChoixMq(zone, cle, affichees, pool);
  });
  // Mixte (retour Denis 2026-10-02) : la carte « Experiences » montre la MEME liste des competences professionnelles (meme selection, meme etat) ;
  // la zone depliante est remplie ici, apres chaque rendu, comme la liste de la carte « Competences ».
  var zoneMixte = document.getElementById('mepPickProMixte');
  if (zoneMixte) {
    var nbMixte = document.getElementById('mepNbProMixte');
    if (nbMixte) { nbMixte.textContent = aff.pro.length + ' sur ' + (aff.poolPro || []).length + ' affichés · mots-clés en pastilles, après les missions en action'; }
    _mepRemplirListeChoixMq(zoneMixte, 'pro', aff.pro, aff.poolPro || []);
  }
  // (Decision Denis 2026-09-29) : plus de message « N competences ne sont pas affichees » : la personne n'a pas a compter ; notre role est de
  // TOUT montrer (les deux listes « Choisir »), le sien de reconnaitre et de choisir.
}
// R.4 (decision Denis 2026-09-29) : dans « Choisir », une competence qui vient du referentiel (fiche du metier, secteur) ou de l'assistant le dit,
// pour que la personne sache qu'elle est PROPOSEE et non deduite de son parcours.
function _mepEstCompetenceAttendue(cle, nom) {
  var liste = (cle === 'pro') ? (window._mepProAttendues || []) : (window._mepQualitesMetier || []);
  var cleTexte = function (t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  return liste.some(function (x) { return cleTexte(x) === cleTexte(nom); });
}
function _mepBasculerCompetenceChoisie(cle, nom, coche) {
  var aff = window._mepCompetencesAffichees;
  if (!aff) { return; }
  var courante = (cle === 'pro' ? aff.pro : aff.comp).slice();
  var pos = courante.indexOf(nom);
  if (coche && pos === -1) { courante.push(nom); } else if (!coche && pos !== -1) { courante.splice(pos, 1); }
  _mepPousserHistorique('competencesChoisies' + cle);
  _mepAppelerIframePdf('_pdfMqChoixCompetences', cle === 'pro' ? 'competencesProChoisies' : 'competencesCompChoisies', courante, cle === 'pro' ? aff.poolPro : aff.poolComp);
  setTimeout(_mepRerendre, 30);
}
function _mepRemettreCompetencesAuto(cle) {
  var aff = window._mepCompetencesAffichees || {};
  _mepPousserHistorique('competencesAuto' + cle);
  var ordres = Object.assign({}, _mepEtatChoixMq().ordreMotsCles || {}); delete ordres[cle];
  _mepAppelerIframePdf('_pdfMqChoix', 'ordreMotsCles', Object.keys(ordres).length ? ordres : null);
  _mepAppelerIframePdf('_pdfMqChoixCompetences', cle === 'pro' ? 'competencesProChoisies' : 'competencesCompChoisies', null, cle === 'pro' ? aff.poolPro : aff.poolComp);
  setTimeout(_mepRerendre, 30);
}

// Message sous les options de détail (maquette : #infoAuto), lu APRÈS le rendu, à partir de faits mesurés
// (nombre de pages) : jamais une promesse « les missions ont été raccourcies » sans preuve.
function _mepMajInfoAutoMq(pages) {
  var zone = document.getElementById('mepInfoAuto');
  if (!zone) { return; }
  var etat = _mepEtatExperiences();
  var niveau = (etat.missionsGlobal === 1) ? 'resume' : (etat.missionsGlobal === 10) ? 'complet' : 'auto';
  var complet = (dossier.reglagesMiseEnPageCV && dossier.reglagesMiseEnPageCV.format === 'a4-integral');
  var nbFixes = Object.keys(etat.missionsChoisies || {}).filter(function (k) { return etat.missionsChoisies[k]; }).length +
    Object.keys(etat.missionsParExp || {}).filter(function (k) { return etat.missionsParExp[k] != null; }).length;
  var raccourcies = window._mepAutoRaccourcies || 0;
  var texte = '';
  // Messages de la maquette (rendreUnique) : seulement des FAITS mesures (nombre de missions raccourcies, nombre de pages).
  if (niveau === 'auto' && raccourcies) {
    if (pages < 2) { texte = 'Pour tout faire tenir sur une page, les missions des exp\u00e9riences les moins pertinentes ont \u00e9t\u00e9 raccourcies : aucune exp\u00e9rience n\u2019est retir\u00e9e.'; }
    else if (nbFixes) { texte = 'Le CV d\u00e9passe une page : vous avez fix\u00e9 le nombre de missions de certaines exp\u00e9riences, elles ne sont pas raccourcies.'; }
    else if (complet) { texte = 'Votre CV est complet : format A4, sur plusieurs pages.'; }
    else { texte = 'M\u00eame avec une mission par exp\u00e9rience, le CV d\u00e9passe une page : choisissez 2 colonnes ou r\u00e9duisez le nombre d\u2019exp\u00e9riences.'; }
  } else if (niveau === 'resume') { texte = 'Pour tout faire tenir, les exp\u00e9riences sont r\u00e9sum\u00e9es : une seule mission par exp\u00e9rience.'; }
  else if (pages >= 2 && etat.tout === 'toutes') {
    texte = complet ? 'Votre CV est complet : format A4, sur plusieurs pages.' : 'Le CV occupe environ 2 pages. Vous pouvez passer en \u00ab R\u00e9sum\u00e9 \u00bb pour tout faire tenir sur une page : aucune exp\u00e9rience ne sera retir\u00e9e.';
  }
  var caseSrc = document.querySelector('[data-mep-src-exp]');
  var aideSrc = document.getElementById('mepSrcAide');
  if (caseSrc && aideSrc) {
    // La case est TOUJOURS cliquable : une competence vient forcement d'une experience, on ne demande pas « s'il y a un lien ».
    caseSrc.disabled = false;
    aideSrc.style.display = 'none';
    _mepRemplirZoneLiens();
  }
  // C2 : un format qui n'affiche pas tout le contenu le dit (aujourd'hui : A4 essentiel), au lieu de retirer des lignes en silence.
  var tronquees = window._mepRubriquesTronquees || [];
  if (tronquees.length) {
    texte = (texte ? texte + ' ' : '') + 'En A4 essentiel, tout n’est pas affiché : ' + tronquees.map(function (r) { return r.affiche + ' ' + r.nom + ' sur ' + r.total; }).join(', ') + '. Choisissez « A4 » ou « A4 complet » dans la carte Format pour tout afficher.';
  }
  if (etat.mode && etat.mode !== 'A' && !window._mepGroupesCompetences) {
    texte = 'Aucune comp\u00e9tence regroup\u00e9e par th\u00e8me n\u2019est disponible pour ce CV : la pr\u00e9sentation chronologique est conserv\u00e9e.';
  }
  zone.style.display = texte ? 'block' : 'none';
  zone.textContent = texte;
}

// ============================================================
// Carte 5 : Mise en page et texte (cTexte)
// ============================================================
var _MEP_POLICES_MAQUETTE = [['arial', 'Arial (recommandée)'], ['calibri', 'Calibri'], ['georgia', 'Georgia'], ['verdana', 'Verdana']];
function _htmlSecTexteSimplifieeMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  _assurerReglagesMiseEnPageCV();
  var c = dossier.reglagesMiseEnPageCV || {};
  var choix = _mepEtatChoixMq();
  var policeActuelle = c.police || 'arial';
  var policeDansMaquette = _MEP_POLICES_MAQUETTE.some(function (p) { return p[0] === policeActuelle; });
  var htmlPolice = '<select id="mepSelPolice" data-mep-police>' + _MEP_POLICES_MAQUETTE.map(function (p) {
    return '<option value="' + p[0] + '"' + (policeActuelle === p[0] ? ' selected' : '') + '>' + p[1] + '</option>';
  }).join('') + (policeDansMaquette ? '' : '<option value="" selected>Autre police (voir R&eacute;glages suppl&eacute;mentaires)</option>') + '</select>';
  var echelle = (dossier.pdfReglages && typeof dossier.pdfReglages.echelle === 'number') ? dossier.pdfReglages.echelle : 1;
  // Taille REELLE du texte (12,5 px x reglage x echelle automatique du moteur), arrondie au demi-point : c'est ce que la personne voit.
  var echelleAutoMoteur = (typeof window._pdfMqEchelleAuto === 'number' && window._pdfMqEchelleAuto > 0) ? window._pdfMqEchelleAuto : 1;
  var tailleTexte = Math.round(echelle * 12.5 * echelleAutoMoteur * 2) / 2;
  var tailleTitres = (typeof choix.tailleTitres === 'number') ? choix.tailleTitres : 13;
  var titres_ = (_mepCibleTaille === 'titres');
  var valeur = titres_ ? tailleTitres : tailleTexte;
  var marge = (typeof choix.margePage === 'number') ? choix.margePage : 10;
  var styleComp = ['pastille', 'rectangle', 'texte-seul'].indexOf(c.styleCompetences) !== -1 ? c.styleCompetences : 'pastille';
  var fondCol = ['aucun', 'gauche', 'droite'].indexOf(c.fondColonnes) !== -1 ? c.fondColonnes : 'aucun';
  var interligne = ['serre', 'normal', 'aere'].indexOf(c.interligne) !== -1 ? c.interligne : 'normal';
  return '<details class="mep-carte" id="cTexte"' + (_mepCarteOuverte('cTexte', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('texte', 'Mise en page et texte', 'Taille de la police, espacements, colonnes, ic&ocirc;nes...', false, _mepCarteOuverte('cTexte', false)) +
    '<div class="carte-corps">' +
    '<div class="grille-el">' +
    '<div class="champ"><label for="mepSelPolice">Police</label>' + htmlPolice + '</div>' +
    '<div class="champ"><label>Taille de</label><div class="seg seg-mini" style="margin-bottom:.3rem">' +
    '<button type="button" data-mep-cible-taille="texte"' + (titres_ ? '' : ' class="on"') + '>Texte</button><button type="button" data-mep-cible-taille="titres"' + (titres_ ? ' class="on"' : '') + '>Titres</button></div>' +
    '<div class="curseur"><input type="range" data-mep-rg-taille min="10" max="' + (titres_ ? 30 : 16) + '" step="0.5" value="' + valeur + '"><span data-mep-val-taille style="min-width:3.2rem">' + String(valeur).replace('.', ',') + ' px</span></div>' +
    (titres_ ? '' : _mepCkMq('data-mep-entete-fixe', 'Garder l&rsquo;en-t&ecirc;te &agrave; taille fixe ' + _mepAideBtn('Par d&eacute;faut, le nom, le m&eacute;tier et les coordonn&eacute;es suivent la taille du texte.'), !!choix.enteteTailleFixe, 'ck" style="margin-top:.35rem')) + '</div>' +
    '<div class="champ"><label>Espacement</label>' + _mepSegMq('mep-interligne', [['serre', 'Serr&eacute;'], ['normal', 'Normal'], ['aere', 'A&eacute;r&eacute;']], interligne) + '</div>' +
    '<div class="champ"><label>Marges de la page</label>' + _mepSegMq('mep-marge-mm', [['6', '6 mm'], ['8', '8 mm'], ['10', '10 mm'], ['14', '14 mm']], String(marge)) + '</div>' +
    '<div class="champ"><label>Comp&eacute;tences</label>' + _mepSegMq('mep-stylecomp', [['pastille', 'Pastilles'], ['rectangle', 'Rectangles'], ['texte-seul', 'Texte']], styleComp) + '</div>' +
    // Forme des puces (retour Denis 2026-10-02) : un seul choix pour toutes les listes a puces (missions epurees, listes de competences, formations).
    '<div class="champ"><label>Forme des puces ' + _mepAideBtn(choix.formesPuces ? 'Indisponible ici : chaque rubrique a sa propre forme de puce (Organisation du CV, option « Mêmes puces partout » décochée).' : 'Pour toutes les listes.') + '</label>' + (choix.formesPuces ? _mepSegMq('mep-formepuce', _MEP_PUCES_FORMES, choix.formePuce || 'rond', 'seg-mini').replace(/<button type="button"/g, '<button type="button" disabled') : _mepSegMq('mep-formepuce', _MEP_PUCES_FORMES, choix.formePuce || 'rond', 'seg-mini')) + '</div>' +
    '<div class="champ"><label>Fond de la colonne</label>' + _mepSegMq('mep-fondcolonnes', [['aucun', 'Aucun'], ['gauche', 'Gauche'], ['droite', 'Droite']], fondCol) + '</div>' +
    '</div>' + _htmlBoutonOptionsSupp('texte') + '</div></details>';
}

// ============================================================
// Carte 6 : Réglages avancés (cAvance)
// ============================================================
function _htmlSecAvanceMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  var c = dossier.reglagesMiseEnPageCV || {};
  var choix = _mepEtatChoixMq();
  return '<details class="mep-carte" id="cAvance"' + (_mepCarteOuverte('cAvance', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('avance', 'R&eacute;glages avanc&eacute;s', 'Pour aller plus loin : vous pouvez ne rien changer', false, _mepCarteOuverte('cAvance', false)) +
    '<div class="carte-corps">' +
    _mepCkMq('data-mep-justif-simple', 'Texte justifi&eacute; ' + _mepAideBtn('Les bords droits des lignes sont align&eacute;s.'), c.alignement === 'justifie', 'case') +
    _mepCkMq('data-mep-sepcol-simple', 'Trait entre les deux colonnes', !!c.separateurColonnes, 'case') +
    (c.iconesCoordonnees
      ? _mepCkMq('data-mep-petits-carres', 'Petits carr&eacute;s devant les coordonn&eacute;es ' + _mepAideBtn('Inutile : les ic&ocirc;nes des coordonn&eacute;es sont allum&eacute;es.'), choix.petitsCarresCoordonnees !== false, 'case').replace('<input ', '<input disabled ')
      : _mepCkMq('data-mep-petits-carres', 'Petits carr&eacute;s devant les coordonn&eacute;es', choix.petitsCarresCoordonnees !== false, 'case')) +
    '</div></details>';
}

// ============================================================
// Carte 7 : Format (cFormat)
// ============================================================
function _htmlSecFormatMiseEnPage() {
  if (!_cvEcranUniqueMiseEnPage()) { return ''; }
  _assurerReglagesMiseEnPageCV();
  var c = dossier.reglagesMiseEnPageCV || {};
  var fmt = _MEP_FORMATS.some(function (f) { return f[0] === c.format; }) ? c.format : 'a4-detaille';
  var nomsFormats = { 'a4-detaille': 'A4', 'a4-integral': 'A4 complet', 'a4-essentiel': 'A4 essentiel', 'a5-portrait': 'Mini CV A5 portrait', 'a5-paysage': 'Mini CV A5 paysage' };
  var phrasesFormats = {
    'a4-detaille': 'Une page, tout le n&eacute;cessaire.', 'a4-integral': 'Plusieurs pages, tout le contenu.', 'a4-essentiel': 'Une page resserr&eacute;e : l&rsquo;essentiel.',
    'a5-portrait': 'Demi-page &agrave; la verticale, version poche.', 'a5-paysage': 'Demi-page &agrave; l&rsquo;horizontale.'
  };
  var tuiles = ['a4-detaille', 'a4-integral', 'a4-essentiel', 'a5-portrait', 'a5-paysage'].map(function (id) {
    return '<button type="button" class="fmt-tuile' + (fmt === id ? ' on' : '') + '" data-mep-format-simple="' + id + '"><b>' + nomsFormats[id] + '</b><span>' + phrasesFormats[id] + '</span></button>';
  }).join('');
  return '<details class="mep-carte" id="cFormat"' + (_mepCarteOuverte('cFormat', false) ? ' open' : '') + '>' +
    _mepEnteteCarteMq('format', 'Format', 'Une page, plusieurs pages, ou un Mini CV A5', false, _mepCarteOuverte('cFormat', false)) +
    '<div class="carte-corps">' +
    '<div class="fmt-tuiles">' + tuiles + '</div>' +
    (/^a5-/.test(fmt) ? '<h4 class="mini-titre">R&eacute;glages du Mini CV A5</h4>' + _htmlReglagesA5MiseEnPage(c) : '') +
    '</div></details>';
}

// ============================================================
// Câblage des contrôles propres à ces cartes (appelé par _wireCarteSimpleMiseEnPage, js/app.js).
// Les autres contrôles (Standard / Personnaliser, cases d'organisation, modes, dates, missions, formations,
// compteurs de compétences, police...) gardent les gestionnaires existants : mêmes attributs data-mep-*.
// ============================================================
// Branche les petits « ? » d'une zone (aussi appelée sur les zones reconstruites après coup : sans cela leur « ? » ne répond pas).
// Infobulle flottante (retour Denis 2026-10-03, meme principe que les infobulles des cartes d'accueil) : un clic sur un « ? » ouvre une petite fenetre posee PAR-DESSUS la page
// (position fixe) : le texte et les boutons ne bougent jamais. Elle se ferme par la petite croix, par un clic ailleurs, par Echap, ou en recliquant sur le « ? ».
var _mepBulleOrigine = null;
function _mepBulleAide() {
  var b = document.getElementById('mepBulleAide');
  if (b) { return b; }
  b = document.createElement('div'); b.id = 'mepBulleAide'; b.className = 'mep-bulle-aide'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Explication'); b.hidden = true;
  b.innerHTML = '<button type="button" class="mep-bulle-fermer" aria-label="Fermer l&rsquo;explication">&times;</button><div class="mep-bulle-texte"></div>';
  document.body.appendChild(b);
  b.querySelector('.mep-bulle-fermer').addEventListener('click', _mepFermerBulleAide);
  document.addEventListener('click', function (ev) {
    if (b.hidden || b.contains(ev.target) || (ev.target.closest && ev.target.closest('[data-mep-aide-option], [data-mep-legende]'))) { return; }
    _mepFermerBulleAide();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { _mepFermerBulleAide(); } });
  window.addEventListener('resize', _mepFermerBulleAide);
  return b;
}
function _mepFermerBulleAide() {
  var b = document.getElementById('mepBulleAide');
  if (!b || b.hidden) { return; }
  b.hidden = true;
  if (_mepBulleOrigine && _mepBulleOrigine.setAttribute) { _mepBulleOrigine.setAttribute('aria-expanded', 'false'); }
  _mepBulleOrigine = null;
}
// html : le texte (deja protege) a afficher. Meme « ? » recliqué : la bulle se referme.
function _mepOuvrirBulleAide(bouton, html) {
  var b = _mepBulleAide();
  if (!b.hidden && _mepBulleOrigine === bouton) { _mepFermerBulleAide(); return; }
  _mepFermerBulleAide();
  b.querySelector('.mep-bulle-texte').innerHTML = html;
  b.hidden = false; _mepBulleOrigine = bouton; bouton.setAttribute('aria-expanded', 'true');
  var r = bouton.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
  var w = Math.min(320, W - 24); b.style.width = w + 'px'; b.style.maxHeight = (H - 16) + 'px';
  b.style.left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, W - w - 12)) + 'px';
  var h = b.offsetHeight;
  b.style.top = ((r.bottom + 8 + h <= H - 8) ? r.bottom + 8 : Math.max(8, r.top - 8 - h)) + 'px';
}
// Branche les petits « ? » d'une zone (aussi appelee sur les zones reconstruites apres coup : sans cela leur « ? » ne repond pas).
function _mepBrancherAidesOptions(racine) {
  racine.querySelectorAll('[data-mep-aide-option]').forEach(function (bt) {
    if (bt.getAttribute('data-aide-branche')) { return; }
    bt.setAttribute('data-aide-branche', '1');
    bt.addEventListener('click', function (ev) {
      ev.preventDefault();
      var w = bt.closest('.opt-aide'), t = w ? w.querySelector('.aide-option-texte') : null;
      var texte = t ? t.textContent : (bt.getAttribute('title') || '');
      if (!texte) { return; }
      _mepOuvrirBulleAide(bt, echapperAttribut(texte));
    });
  });
}
function _mepCablerCartesMaquette() {
  // Une carte ouverte le reste après un clic (le panneau est reconstruit à chaque réglage).
  document.querySelectorAll('.mep-mq details.mep-carte[id], .mep-mq details.choix-exp[id]').forEach(function (d) {
    d.addEventListener('toggle', function () { _mepCartesOuvertes[d.id] = d.open; if (d.id === 'zoneLiens') { _mepRemplirZoneLiens(); } });
  });
  _mepRemplirZoneLiens();
  _mepBrancherAidesOptions(document);
  _mepBrancherIntitules(document);
  document.querySelectorAll('[data-mep-exp-stage]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      var e = (dossier.experiences || [])[parseInt(b.getAttribute('data-mep-exp-stage'), 10)];
      if (!e) { return; }
      e.stage = !_pdfEstStage(e);
      _mepRerendre();
    });
  });

  // Experiences du dossier absentes du CV : les ajouter (elles rejoignent la liste des experiences retenues par l'assistant).
  var btnAbsentes = document.querySelector('[data-mep-exp-ajouter-absentes]');
  if (btnAbsentes) {
    btnAbsentes.addEventListener('click', function () {
      _mepPousserHistorique('expAbsentes');
      dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {};
      var reco = dossier.ia.cv.recommandations = dossier.ia.cv.recommandations || {};
      reco.experiencesAMettreEnAvant = reco.experiencesAMettreEnAvant || [];
      reco.savoirFaireParExperienceProposees = reco.savoirFaireParExperienceProposees || [];
      _mepExperiencesAbsentesDuCV().forEach(function (e) {
        reco.experiencesAMettreEnAvant.push({ poste: e.poste, entreprise: e.entreprise || '', justification: 'Ajoutée depuis La mise en page.', dateDebut: e.dateDebut || '', dateFin: e.dateFin || '' });
        reco.savoirFaireParExperienceProposees.push({ poste: e.poste, entreprise: e.entreprise || '', missions: [] });
      });
      setTimeout(_mepRerendre, 30);
    });
  }
  document.querySelectorAll('[data-mep-mois-affiches]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepDefinirChoixMq('moisAffiches', this.checked ? true : null); });
  });
  _mepCablerEditionExperiences();
  _mepCablerCertifications();
  _mepCablerPersoColonnes();
  // Organisation : formations dans la colonne de gauche (2 colonnes ; par defaut elles restent a droite).
  var cbFormGauche = document.querySelector('[data-mep-org-formgauche]');
  if (cbFormGauche) { cbFormGauche.addEventListener('change', function () { _mepDefinirChoixMq('formationsAGauche', this.checked); }); }
  // Organisation : Blocs courts.
  document.querySelectorAll('[data-mep-cote]').forEach(function (b) {
    b.addEventListener('click', function () { _mepDefinirChoixMq('blocsCourts', this.getAttribute('data-mep-cote')); });
  });
  // Expériences : « Indiquer l'expérience entre parenthèses ».
  document.querySelectorAll('[data-mep-src-exp]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepDefinirChoixMq('sourceExperience', this.checked ? true : null); });
  });
  // Expériences : ordre (liste déroulante de la maquette).
  document.querySelectorAll('[data-mep-ordre-select]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var v = this.value;
      if (v === 'autre') { return; }
      var pdf = (v === 'recent') ? 'date-desc' : (v === 'ancien') ? 'date-asc' : (v === 'pertinent') ? 'pertinence' : 'mien';
      _mepPousserHistorique('ordreExperiences');
      try {
        var d = document.querySelector('#zonePdfInlineCV iframe').contentDocument;
        var champ = d.getElementById('regOrdreExperiences');
        if (champ) { champ.value = pdf; champ.dispatchEvent(new Event('change', { bubbles: true })); }
        if (!dossier.pdfReglages) { dossier.pdfReglages = {}; }
        dossier.pdfReglages.regOrdreExperiences = pdf;
        if (v !== 'mien') { _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.ordreExperiences = (v === 'recent') ? 'recentes' : (v === 'ancien') ? 'anciennes' : 'pertinence'; }
      } catch (e) { /* iframe pas prete */ }
      setTimeout(_mepRerendre, 30);
    });
  });
  // Réglages supplémentaires : autres ordres des expériences (absents de la liste de la maquette).
  document.querySelectorAll('[data-mep-ordre-autre]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var pdf = this.value;
      if (!pdf) { return; }
      _mepPousserHistorique('ordreExperiences');
      try {
        var d = document.querySelector('#zonePdfInlineCV iframe').contentDocument;
        var champ = d.getElementById('regOrdreExperiences');
        if (champ) { champ.value = pdf; champ.dispatchEvent(new Event('change', { bubbles: true })); }
        if (!dossier.pdfReglages) { dossier.pdfReglages = {}; }
        dossier.pdfReglages.regOrdreExperiences = pdf;
        _assurerReglagesMiseEnPageCV();
        dossier.reglagesMiseEnPageCV.ordreExperiences = (pdf === 'date-asc') ? 'anciennes' : 'poste-az';
      } catch (e) { /* iframe pas prete */ }
      setTimeout(_mepRerendre, 30);
    });
  });
  // Expériences : « Missions ▾ » d'une expérience = ouvre / ferme la liste (aucun réglage n'est touché).
  document.querySelectorAll('[data-mep-exp-choisir-missions]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var i = parseInt(this.getAttribute('data-mep-exp-choisir-missions'), 10);
      _mepMissionsOuvertes[i] = !_mepMissionsOuvertes[i];
      _mepRerendre();
    });
  });
  document.querySelectorAll('[data-mep-exp-raz]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      _mepPousserHistorique('missionsRaz');
      _mepAppelerIframePdf('_pdfMqRemettrePremieresMissions', parseInt(this.getAttribute('data-mep-exp-raz'), 10));
      setTimeout(_mepRerendre, 30);
    });
  });
  // Formations : titre en gras / italique / souligné.
  document.querySelectorAll('[data-mep-form-style]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cle = this.getAttribute('data-mep-form-style');
      var actuel = _mepEtatChoixMq().styleTitreFormation || {};
      var nouveau = { gras: actuel.gras !== false, italique: !!actuel.italique, souligne: !!actuel.souligne };
      nouveau[cle] = !nouveau[cle];
      _mepDefinirChoixMq('styleTitreFormation', nouveau);
    });
  });
  // Informations complementaires : lien, lignes a afficher, ajout d'une ligne.
  var cbLien = document.querySelector('[data-mep-info-lien]');
  if (cbLien) { cbLien.addEventListener('change', function () { _mepDefinirChoixMq('afficherLien', this.checked); }); }
  document.querySelectorAll('[data-mep-infos-rubrique]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepDefinirChoixMq('infosCompAffichees', this.checked ? _mepInfosSaisies() : []); });
  });
  document.querySelectorAll('[data-mep-info-comp]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var infos = (dossier.informationsNonClassees || []).filter(function (x) { return typeof x === 'string' && x.trim(); });
      var coches = [];
      document.querySelectorAll('[data-mep-info-comp]').forEach(function (c) { if (c.checked) { coches.push(infos[parseInt(c.getAttribute('data-mep-info-comp'), 10)]); } });
      _mepDefinirChoixMq('infosCompAffichees', coches);
    });
  });
  var btnInfoAjout = document.querySelector('[data-mep-info-ajouter]');
  var champInfo = document.getElementById('mepInfoNouvelle');
  if (btnInfoAjout && champInfo) {
    var ajouterInfo = function () {
      var t = champInfo.value.trim();
      if (!t) { return; }
      dossier.informationsNonClassees = dossier.informationsNonClassees || [];
      if (dossier.informationsNonClassees.indexOf(t) === -1) { dossier.informationsNonClassees.push(t); }
      var actuelles = _mepEtatChoixMq().infosCompAffichees || [];
      if (actuelles.indexOf(t) === -1) { actuelles = actuelles.concat([t]); }
      _mepDefinirChoixMq('infosCompAffichees', actuelles);
    };
    btnInfoAjout.addEventListener('click', ajouterInfo);
    champInfo.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ajouterInfo(); } });
  }
  var btnSuggOuvrir = document.querySelector('[data-mep-info-sugg-ouvrir]');
  if (btnSuggOuvrir) { btnSuggOuvrir.addEventListener('click', function () { _mepSuggInfosOuvert = !_mepSuggInfosOuvert; _mepRerendre(); }); }
  document.querySelectorAll('[data-mep-info-sugg]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ref = this.getAttribute('data-mep-info-sugg').split(':');
      var it = _MEP_SUGGESTIONS_INFOS[parseInt(ref[0], 10)].items[parseInt(ref[1], 10)];
      if (it.modele) {
        // Phrase a completer : elle est posee dans le champ de saisie, la personne modifie le chiffre et le domaine.
        var champ = document.getElementById('mepInfoNouvelle');
        if (champ) { champ.value = it.t; champ.focus(); }
        return;
      }
      dossier.informationsNonClassees = dossier.informationsNonClassees || [];
      if (dossier.informationsNonClassees.indexOf(it.t) === -1) { dossier.informationsNonClassees.push(it.t); }
      var actuelles = _mepEtatChoixMq().infosCompAffichees || [];
      if (!it.sensible && actuelles.indexOf(it.t) === -1) { actuelles = actuelles.concat([it.t]); }
      _mepDefinirChoixMq('infosCompAffichees', actuelles);
    });
  });
  document.querySelectorAll('[data-mep-form-ligne]').forEach(function (b) {
    b.addEventListener('click', function () { _mepDefinirChoixMq('formationsLigne', this.getAttribute('data-mep-form-ligne') || null); });
  });
  document.querySelectorAll('[data-mep-liste-2col]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var titre = this.getAttribute('data-mep-liste-2col');
      var liste = (_mepEtatChoixMq().listesDeuxColonnes || []).slice();
      var i = liste.indexOf(titre);
      if (this.checked && i === -1) { liste.push(titre); }
      if (!this.checked && i !== -1) { liste.splice(i, 1); }
      _mepDefinirChoixMq('listesDeuxColonnes', liste.length ? liste : null);
    });
  });
  document.querySelectorAll('[data-mep-reafficher]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var cle = this.getAttribute('data-mep-reafficher');
      _mepPousserHistorique('reafficher' + cle);
      var l = (dossier.rubriquesReaffichees || []).slice();
      var i = l.indexOf(cle);
      if (this.checked && i === -1) { l.push(cle); }
      if (!this.checked && i !== -1) { l.splice(i, 1); }
      dossier.rubriquesReaffichees = l;
      if (typeof sauvegarderSession === 'function') { try { sauvegarderSession(); } catch (e) { /* */ } }
      _mepAppelerIframePdf('_pdfRafraichir');
      setTimeout(_mepRerendre, 60);
    });
  });
  // Formations : centre, annee, lieu (montrer ou non).
  document.querySelectorAll('[data-mep-form-aff]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var cle = this.getAttribute('data-mep-form-aff');
      var actuel = _mepEtatChoixMq().formationAffiche || {};
      var nouveau = { centre: actuel.centre !== false, annee: actuel.annee !== false, lieu: actuel.lieu !== false };
      nouveau[cle] = this.checked;
      _mepDefinirChoixMq('formationAffiche', nouveau);
    });
  });
  // « Regler sur le CV » : ouvre le grand apercu sur la rubrique de la carte (retour Denis 2026-10-01).
  document.querySelectorAll('[data-mep-regler-rubrique]').forEach(function (b) {
    b.addEventListener('click', function () { _mepOuvrirReglageRubrique(this.getAttribute('data-mep-regler-rubrique')); });
  });
  // En-tete : telephone et e-mail en gras (retour Denis 2026-10-01).
  document.querySelectorAll('[data-mep-coord-gras]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var cle = this.getAttribute('data-mep-coord-gras');
      var actuel = _mepEtatChoixMq().coordGras || {};
      var nouveau = { telephone: !!actuel.telephone, email: !!actuel.email };
      nouveau[cle] = this.checked;
      _mepDefinirChoixMq('coordGras', nouveau);
    });
  });
  // Mise en page et texte : titre du CV et phrase d'accroche (choix parmi les propositions de l'assistant).
  document.querySelectorAll('[data-mep-select-titre]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      _mepPousserHistorique('titreCV');
      dossier.titreCV = this.value;
      setTimeout(_mepRerendre, 30);
    });
  });
  document.querySelectorAll('[data-mep-select-accroche]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      if (!this.checked) { return; }
      _mepPousserHistorique('accrocheCV');
      if (!dossier.ia) { dossier.ia = {}; }
      if (!dossier.ia.cv) { dossier.ia.cv = {}; }
      dossier.ia.cv.profil = this.value;
      // R9 : le rang de la proposition choisie rattache sa version courte (le texte choisi peut avoir ete modifie a la main).
      var rangChoisi = (dossier.ia.cv.accrochesProposees || []).indexOf(this.value);
      if (rangChoisi >= 0) { _cvMemoriserRangAccroche(dossier.ia.cv, rangChoisi); }
      setTimeout(_mepRerendre, 30);
    });
  });
  document.querySelectorAll('[data-mep-accroche-courte]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      _mepPousserHistorique('accrocheCourte');
      _assurerReglagesMiseEnPageCV();
      dossier.reglagesMiseEnPageCV.accrocheCourte = this.checked;
      _mepEditerAccrocheCV = false;
      setTimeout(_mepRerendre, 30);
    });
  });
  document.querySelectorAll('[data-mep-sans-accroche-case]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepDefinirSansAccroche(this.checked); });
  });
  // En-tête de CV : bouton "Modifier" -- bascule le menu déroulant vers un champ texte libre, MÊME
  // largeur (flex:1, plus de rétrécissement). Le bouton devient "Annuler" (rien écrit tant que la
  // valeur n'a pas changé) puis "Valider" dès la 1re frappe différente de la valeur de départ
  // (comparaison en direct, écouteur "input" -- jamais un rerendu par frappe, ça ferait perdre le
  // curseur). Écrit sur les mêmes champs que les menus déroulants (dossier.titreCV /
  // dossier.ia.cv.profil), jamais un 2e circuit.
  function _mepBrancherEditionEntete(prefixe, definirEdition, appliquer) {
    var btnModifier = document.querySelector('[data-mep-' + prefixe + '-modifier]');
    if (btnModifier) { btnModifier.addEventListener('click', function () { definirEdition(true); _mepRerendre(); }); }
    var champ = document.querySelector('[data-mep-' + prefixe + '-texte]');
    var btnValider = document.querySelector('[data-mep-' + prefixe + '-valider]');
    if (!champ || !btnValider) { return; }
    var origine = champ.getAttribute('data-mep-origine') || '';
    champ.addEventListener('input', function () {
      btnValider.textContent = (this.value === origine) ? 'Annuler' : 'Valider';
    });
    btnValider.addEventListener('click', function () {
      if (champ.value !== origine) { appliquer(champ.value); }
      definirEdition(false);
      setTimeout(_mepRerendre, 30);
    });
  }
  _mepBrancherEditionEntete('titre', function (v) { _mepEditerTitreCV = v; }, function (v) {
    _mepPousserHistorique('titreCV');
    dossier.titreCV = v;
  });
  _mepBrancherEditionEntete('accroche', function (v) { _mepEditerAccrocheCV = v; }, function (v) {
    _mepPousserHistorique('accrocheCV');
    if (!dossier.ia) { dossier.ia = {}; }
    if (!dossier.ia.cv) { dossier.ia.cv = {}; }
    var cvIa = dossier.ia.cv;
    // R9 : « Modifier » agit sur la version AFFICHEE. Version courte : on remplace la courte de cette proposition (meme rang) ;
    // version longue : comme avant, en gardant le rang pour que la version courte reste rattachee.
    var rang = _cvRangAccrocheChoisie(cvIa);
    var courteAffichee = !!((dossier.reglagesMiseEnPageCV || {}).accrocheCourte && _cvAccrocheCourteChoisie(cvIa));
    if (courteAffichee) {
      var courtes = Array.isArray(cvIa.accrochesCourtesProposees) ? cvIa.accrochesCourtesProposees.slice() : [];
      courtes[rang] = v;
      cvIa.accrochesCourtesProposees = courtes;
    } else {
      cvIa.profil = v;
    }
    // Le texte a change par CE circuit, le rang reste valable : on le memorise avec le nouveau texte.
    _cvMemoriserRangAccroche(cvIa, rang);
  });
  // Taille : un seul curseur, deux cibles (Texte / Titres).
  document.querySelectorAll('[data-mep-cible-taille]').forEach(function (b) {
    b.addEventListener('click', function () { _mepCibleTaille = this.getAttribute('data-mep-cible-taille'); _mepRerendre(); });
  });
  var cbEnteteFixe = document.querySelector('[data-mep-entete-fixe]');
  if (cbEnteteFixe) { cbEnteteFixe.addEventListener('change', function () { _mepDefinirChoixMq('enteteTailleFixe', this.checked ? true : null); }); }
  var rgTaille = document.querySelector('[data-mep-rg-taille]');
  if (rgTaille) {
    rgTaille.addEventListener('input', function () {
      var s = document.querySelector('[data-mep-val-taille]');
      if (s) { s.textContent = String(this.value).replace('.', ',') + ' px'; }
    });
    rgTaille.addEventListener('change', function () {
      var v = parseFloat(this.value);
      if (!isFinite(v)) { return; }
      _mepPousserHistorique('taille' + _mepCibleTaille);
      if (_mepCibleTaille === 'titres') { _mepAppelerIframePdf('_pdfMqChoix', 'tailleTitres', v); }
      else {
        var autoMoteur = (typeof window._pdfMqEchelleAuto === 'number' && window._pdfMqEchelleAuto > 0) ? window._pdfMqEchelleAuto : 1;
        _mepAppelerIframePdf('_pdfMqTailleTexte', v / autoMoteur);
      }
      setTimeout(_mepRerendre, 30);
    });
  }
  // Marges de la page (8 / 10 / 14 mm).
  document.querySelectorAll('[data-mep-marge-mm]').forEach(function (b) {
    b.addEventListener('click', function () { _mepDefinirChoixMq('margePage', parseInt(this.getAttribute('data-mep-marge-mm'), 10)); });
  });
  // Éléments supplémentaires : « Choisir ▾ » (ouvre / ferme la liste des compétences).
  document.querySelectorAll('[data-mep-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      // Retour Denis 2026-10-03 : les deux listes (professionnelles et comportementales) s'ouvrent et se ferment ensemble.
      var ouvrir = !_mepPickOuvert[this.getAttribute('data-mep-pick')];
      _mepPickOuvert.pro = ouvrir; _mepPickOuvert.comp = ouvrir;
      _mepMajCompetencesMq();
    });
  });
  // Réglages avancés : petits carrés devant les coordonnées.
  document.querySelectorAll('[data-mep-petits-carres]').forEach(function (cb) {
    cb.addEventListener('change', function () { _mepDefinirChoixMq('petitsCarresCoordonnees', this.checked ? null : false); });
  });
  _mepMajCompetencesMq();
}

// ============================================================
// « Relier mes competences a mes experiences » (2026-09-26, point 7 de Denis) : zone DEPLIANTE DANS LA CARTE, jamais une fenetre.
// Le lien competence -> experience est IMPLICITE (une competence vient d'une experience) : ce n'est pas une question de savoir s'il
// existe, mais un endroit ou la PERSONNE l'etablit. Le lien confirme est ecrit dans experience.competencesDemontrees (source unique,
// deja lue par le CV, la lettre et l'entretien via experiencesQuiDemontrent()). Les suggestions (liens deja proposes par l'assistant,
// correspondance avec le texte des missions) sont pre-cochees mais JAMAIS appliquees sans le bouton « Enregistrer ».
// ============================================================
var _mepLiensModifs = {};   // « competence|indexExperience » -> true / false : coches de la personne pas encore enregistres
function _mepSuggestionsLiens(competence, experience) {
  // 1. Lien deja propose par l'assistant (illustrePar), verifie contre les vraies experiences.
  var reco = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations) || {};
  var propose = false;
  (reco.competencesGroupeesParTheme || []).forEach(function (g) {
    (g.items || []).forEach(function (it) {
      if (!correspond(it.texte, competence)) { return; }
      (it.illustrePar || []).forEach(function (nom) {
        if ((experience.entreprise && correspond(experience.entreprise, nom)) || (experience.poste && correspond(experience.poste, nom))) { propose = true; }
      });
    });
  });
  if (propose) { return true; }
  // 2. Correspondance avec le texte de l'experience (poste + missions) : au moins la moitie des mots significatifs de la competence.
  var mots = (typeof motsCles === 'function') ? motsCles(competence) : [];
  if (!mots.length) { return false; }
  var texte = normaliserTexte((experience.poste || '') + ' ' + (experience.missions || ''));
  var trouves = mots.filter(function (m) { return texte.indexOf(String(m).slice(0, 5)) !== -1; }).length;
  return trouves >= Math.max(1, Math.ceil(mots.length / 2));
}
function _mepDonneesLiens() {
  var competences = [];
  (window._mepCompetencesPourLiens || []).forEach(function (c) { if (competences.indexOf(c) === -1) { competences.push(c); } });
  var experiences = (dossier.experiences || []).map(function (e, i) { return { e: e, i: i }; }).filter(function (x) { return x.e && x.e.poste; });
  var etat = competences.map(function (c) {
    return experiences.map(function (x) {
      var lie = (x.e.competencesDemontrees || []).some(function (d) { return correspond(d, c); });
      var suggere = !lie && _mepSuggestionsLiens(c, x.e);
      var cle = c + '|' + x.i;
      var coche = Object.prototype.hasOwnProperty.call(_mepLiensModifs, cle) ? !!_mepLiensModifs[cle] : (lie || suggere);
      return { cle: cle, lie: lie, suggere: suggere, coche: coche };
    });
  });
  return { competences: competences, experiences: experiences, etat: etat };
}
function _htmlZoneLiensMq(actif) {
  // Toujours visible (2026-09-26, demande de Denis) ; cliquable seulement quand « Indiquer l'experience entre parentheses » est cochee.
  return '<details class="choix-exp' + (actif ? '' : ' desactivee') + '" id="zoneLiens"' + ((actif && _mepCarteOuverte('zoneLiens', false)) ? ' open' : '') + '>' +
    '<summary class="choix-titre choix-bouton"' + (actif ? '' : ' aria-disabled="true" tabindex="-1"') + '><span class="cb-texte"><b><span class="cb-ouvrir">Relier mes comp&eacute;tences &agrave; mes exp&eacute;riences</span><span class="cb-fermer">Refermer cette zone</span></b>' +
    '<small>' + (actif ? 'Indiquez o&ugrave; vous avez acquis chaque comp&eacute;tence' : 'Cochez d&rsquo;abord &laquo;&nbsp;Indiquer l&rsquo;exp&eacute;rience entre parenth&egrave;ses&nbsp;&raquo;') + '</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
    '<div id="zoneLiensCorps" class="choix-corps"></div></details>';
}
// Remplit (ou met a jour) le contenu de la zone ; appelee a l'ouverture, apres chaque rendu du panneau et apres chaque coche.
function _mepRemplirZoneLiens() {
  var zone = document.getElementById('zoneLiens');
  var corps = document.getElementById('zoneLiensCorps');
  if (!zone || !corps || !zone.open) { return; }
  var d = _mepDonneesLiens();
  if (!d.experiences.length) { corps.innerHTML = '<p class="choix-aide">Vous n&rsquo;avez pas encore d&rsquo;exp&eacute;rience dans votre dossier.</p>'; return; }
  if (!d.competences.length) { corps.innerHTML = '<p class="choix-aide">Aucune comp&eacute;tence professionnelle n&rsquo;est affich&eacute;e sur ce CV.</p>'; return; }
  var nbSugg = 0, nbModifs = Object.keys(_mepLiensModifs).length;
  d.etat.forEach(function (l) { l.forEach(function (s) { if (s.suggere && !Object.prototype.hasOwnProperty.call(_mepLiensModifs, s.cle)) { nbSugg++; } }); });
  corps.innerHTML =
    '<p class="choix-aide">Pour chaque comp&eacute;tence, cochez les exp&eacute;riences o&ugrave; vous l&rsquo;avez acquise. Ce lien s&rsquo;affiche entre parenth&egrave;ses sur le CV ' +
    '(case &laquo;&nbsp;Indiquer l&rsquo;exp&eacute;rience entre parenth&egrave;ses&nbsp;&raquo;) et sert aussi &agrave; votre lettre et &agrave; votre entretien.</p>' +
    (nbSugg ? '<p class="choix-aide lien-sugg"><b>' + nbSugg + ' lien' + (nbSugg > 1 ? 's' : '') + ' sugg&eacute;r&eacute;' + (nbSugg > 1 ? 's' : '') + '</b> (bordure en pointill&eacute;s) : &agrave; v&eacute;rifier. Rien n&rsquo;est enregistr&eacute; tant que vous ne cliquez pas sur &laquo;&nbsp;Enregistrer&nbsp;&raquo;.</p>' : '') +
    '<div class="liens-liste">' + d.competences.map(function (c, ci) {
      return '<div class="lien-ligne"><div class="lien-comp">' + echapperAttribut(c) + '</div><div class="lien-exps">' + d.experiences.map(function (x, xi) {
        var s = d.etat[ci][xi];
        return '<button type="button" class="lien-exp' + (s.coche ? ' on' : '') + ((s.suggere && !s.lie) ? ' suggere' : '') + '" data-lien-exp="' + ci + ':' + xi + '" aria-pressed="' + (s.coche ? 'true' : 'false') + '">' +
          echapperAttribut(x.e.poste) + (x.e.entreprise ? ' <span>(' + echapperAttribut(x.e.entreprise) + ')</span>' : '') + '</button>';
      }).join('') + '</div></div>';
    }).join('') + '</div>' +
    '<div class="lien-actions"><button type="button" class="mep-btn" data-lien-annuler>Annuler mes coches</button>' +
    '<button type="button" class="mep-btn principal" data-lien-enregistrer>Enregistrer</button></div>';
  corps.querySelectorAll('[data-lien-exp]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = this.getAttribute('data-lien-exp').split(':');
      var s = d.etat[parseInt(r[0], 10)][parseInt(r[1], 10)];
      _mepLiensModifs[s.cle] = !s.coche;
      _mepRemplirZoneLiens();
    });
  });
  var annuler = corps.querySelector('[data-lien-annuler]');
  if (annuler) { annuler.addEventListener('click', function () { _mepLiensModifs = {}; _mepRemplirZoneLiens(); }); }
  var enregistrer = corps.querySelector('[data-lien-enregistrer]');
  if (enregistrer) {
    enregistrer.addEventListener('click', function () {
      _mepPousserHistorique('liensCompetences');
      d.experiences.forEach(function (x, xi) {
        // On retire d'abord les liens que la zone gere (competences affichees), puis on ajoute les coches : les autres liens
        // (competences non affichees, parcours Decouverte) restent intacts.
        var reste = (x.e.competencesDemontrees || []).filter(function (dd) { return !d.competences.some(function (c) { return correspond(dd, c); }); });
        var ajoutes = d.competences.filter(function (c, ci) { return d.etat[ci][xi].coche; });
        var nouvelle = reste.concat(ajoutes);
        if (nouvelle.length || (x.e.competencesDemontrees && x.e.competencesDemontrees.length)) { x.e.competencesDemontrees = nouvelle; }
      });
      _mepLiensModifs = {};
      if (typeof sauvegarderSession === 'function') { try { sauvegarderSession(); } catch (e) { /* */ } }
      setTimeout(_mepRerendre, 60);
    });
  }
}

// ============================================================
// « Editer » les experiences a la main (2026-09-26, demande de Denis) : poste, entreprise, lieu, dates et missions de chaque
// experience, DANS la carte. Une fois le PDF cree on ne peut plus le modifier : la personne doit pouvoir mettre en avant ce que
// l'assistant ne connaissait pas. Les modifications s'ecrivent dans dossier.experiences (source unique : elles se retrouvent dans
// l'apercu plein ecran, a l'impression, en Word, dans la lettre et l'entretien) et sont ENREGISTREES AUTOMATIQUEMENT a chaque champ
// valide (sortie du champ ou Entree), avec un message « Enregistre ». « Annuler » de la barre du haut les defait.
// ============================================================
var _mepEditionExp = false;
var _mepFocusEdition = null;        // dernier champ d'edition actif (le panneau est reconstruit apres un enregistrement : on y remet le curseur)
var _mepDernierEnregistrement = null;
function _mepCleExp(e) {
  var n = function (t) { return String(t || '').trim().toLowerCase(); };
  return n(e.poste) + '|' + n(e.entreprise) + '|' + n(e.dateDebut) + '|' + n(e.dateFin);
}
// Les indices de la carte sont ceux du MOTEUR : on retrouve l'experience du dossier qui leur correspond.
function _mepIndexDossierExperience(expMoteur) {
  var ds = dossier.experiences || [];
  for (var k = 0; k < ds.length; k++) { if (ds[k] && _mepCleExp(ds[k]) === _mepCleExp(expMoteur)) { return k; } }
  return -1;
}
function _mepNormaliserDateSaisie(t) {
  t = String(t || '').trim();
  var m;
  if ((m = t.match(/^(\d{1,2})[\/.\-](\d{4})$/))) { return m[2] + '-' + ('0' + m[1]).slice(-2); }
  if ((m = t.match(/^(\d{4})[\/.\-](\d{1,2})$/))) { return m[1] + '-' + ('0' + m[2]).slice(-2); }
  return t;
}
// Si le poste ou l'entreprise change, les recommandations de l'assistant qui la citent suivent : sinon le moteur ne la reconnaitrait plus.
function _mepRenommerReferencesExperience(ancien, nouveau) {
  var reco = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations) || null;
  if (!reco) { return; }
  var egal = function (a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); };
  var nomAncien = ancien.entreprise || ancien.poste, nomNouveau = nouveau.entreprise || nouveau.poste;
  (function parcourir(o) {
    if (!o || typeof o !== 'object') { return; }
    if (Array.isArray(o)) {
      o.forEach(function (x, i) { if (typeof x === 'string') { if (nomAncien && egal(x, nomAncien)) { o[i] = nomNouveau; } } else { parcourir(x); } });
      return;
    }
    if (typeof o.poste === 'string' && egal(o.poste, ancien.poste) && (o.entreprise === undefined || egal(o.entreprise, ancien.entreprise))) {
      o.poste = nouveau.poste;
      if (o.entreprise !== undefined) { o.entreprise = nouveau.entreprise; }
    }
    Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') { parcourir(o[k]); } });
  })(reco);
}
function _mepEnregistrerChampExperience(k, champ, brut, zoneMessage) {
  var e = (dossier.experiences || [])[k];
  if (!e) { return false; }
  var valeur = String(brut === undefined || brut === null ? '' : brut);
  if (champ === 'missions') { valeur = valeur.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).join('\n'); }
  else if (champ === 'dateDebut' || champ === 'dateFin') { valeur = _mepNormaliserDateSaisie(valeur); }
  else { valeur = valeur.trim(); }
  if (champ === 'poste' && !valeur) { return false; }
  if (champ === 'poste' && typeof separerDatesDuTitre === 'function') {
    var sepP = separerDatesDuTitre(valeur);
    if (sepP.trouve) {
      valeur = sepP.titre;
      if (!e.dateDebut && sepP.dateDebut) { e.dateDebut = sepP.dateDebut; }
      if (!e.dateFin && sepP.dateFin) { e.dateFin = sepP.dateFin; }
    }
  }
  if ((e[champ] || '') === valeur) { return true; }
  _mepPousserHistorique('editionExp' + k + champ);
  // TACHE (audit "mise en page", 2026-09-28) : _pdfDecouperMissions ici aussi -- doit rester
  // coherent avec ce que le textarea a reellement affiche (voir _htmlEditionExperienceMq),
  // jamais un split('\n') nu qui verrait "1 seul texte" sur une donnee encore en paragraphe.
  var decouperMissionsExp = function (t) { return (typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(t || '') : String(t || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); };
  var anciensTextes = [];
  if (champ === 'poste' || champ === 'entreprise') { anciensTextes = [e[champ]]; }
  else if (champ === 'missions') { anciensTextes = decouperMissionsExp(e.missions); }
  else if (champ === 'dateDebut' || champ === 'dateFin') { anciensTextes = [typeof _pdfFormaterPeriode === 'function' ? _pdfFormaterPeriode(e.dateDebut, e.dateFin) : '']; }
  var nbCorrectionsRemplacees = anciensTextes.length ? _mepRetirerCorrectionsDeTextes(anciensTextes) : 0;
  var ancien = { poste: e.poste, entreprise: e.entreprise };
  var segmentsAvant = decouperMissionsExp(e.missions);
  e[champ] = valeur;
  if (champ === 'poste' || champ === 'entreprise') { _mepRenommerReferencesExperience(ancien, { poste: e.poste, entreprise: e.entreprise }); }
  if (champ === 'missions') {
    // Chaque mission que la personne voit dans l'editeur est affichee sur le CV (elle peut en decocher dans « Missions »).
    var segmentsApres = valeur ? valeur.split('\n') : [];
    var tous = segmentsApres.map(function (m, j) { return j; });
    if (segmentsApres.length !== segmentsAvant.length || segmentsApres.some(function (m, j) { return m !== segmentsAvant[j]; })) {
      var liste = _mepListeExperiencesMoteur(), indexMoteur = -1;
      liste.forEach(function (x, j) { if (indexMoteur === -1 && _mepCleExp(x) === _mepCleExp(e)) { indexMoteur = j; } });
      if (indexMoteur !== -1) { _mepAppelerIframePdf('_pdfMqDefinirMissionsChoisies', indexMoteur, tous); }
    }
  }
  if (typeof sauvegarderSession === 'function') { try { sauvegarderSession(); } catch (err) { /* */ } }
  _mepAppelerIframePdf('_pdfRafraichir');
  _mepDernierEnregistrement = { k: k, t: Date.now() };
  if (zoneMessage) { zoneMessage.textContent = 'Enregistré ✓' + (nbCorrectionsRemplacees ? ' Votre correction faite directement sur le CV pour ce texte est remplacée par cette saisie.' : ''); }
  return true;
}
// ============================================================
// « Corrections faites sur le CV » (2026-09-26, demande de Denis) : les textes corriges directement sur le CV, dans l'apercu en plein ecran
// (« Modifier le texte »), sont des textes libres PROPRES A CE CV EN PDF : ils ne changent pas le dossier (donc ni Word, ni la lettre, ni
// l'entretien). Cette liste, placee au-dessus de « Valider le CV », les rend visibles et annulables ; elle lit l'etat du panneau
// (_cvPdfTextesEditesMq), sans rien dupliquer. Une correction n'est listee que si elle s'applique encore (texte d'origine inchange).
// ============================================================
var _mepCorrectionsOuvert = false;
function _mepCorrectionsActives() {
  var f, w, d;
  try { f = document.querySelector('#zonePdfInlineCV iframe'); w = f.contentWindow; d = f.contentDocument; } catch (e) { return []; }
  var tous = (w && w._cvPdfTextesEditesMq) || {};
  var presents = {};
  Array.prototype.forEach.call(d.querySelectorAll('[data-ed]'), function (el) { presents[el.getAttribute('data-ed') + '\u0001' + el.getAttribute('data-t')] = true; });
  var liste = [];
  Object.keys(tous).forEach(function (id) {
    var c = tous[id];
    if (c && typeof c.t === 'string' && presents[id + '\u0001' + c.t]) { liste.push({ id: id, avant: c.t, apres: String(c.x) }); }
  });
  return liste;
}
function _mepMajCorrectionsCV() {
  var zone = document.getElementById('mepCorrections');
  if (!zone) { return; }
  var liste = _mepCorrectionsActives();
  if (!liste.length) { zone.style.display = 'none'; zone.innerHTML = ''; return; }
  var abr = function (t) { t = String(t); return echapperAttribut(t.length > 60 ? t.slice(0, 57) + '…' : t); };
  zone.style.display = '';
  zone.open = _mepCorrectionsOuvert;
  zone.innerHTML = '<summary>&#9998; ' + liste.length + ' correction' + (liste.length > 1 ? 's' : '') + ' faite' + (liste.length > 1 ? 's' : '') + ' directement sur le CV</summary>' +
    '<p class="sous-aide">Ces corrections sont propres &agrave; ce CV en PDF : elles ne changent pas votre dossier (ni le fichier Word, ni la lettre, ni l&rsquo;entretien).</p>' +
    liste.map(function (c) {
      return '<div class="corr-ligne"><span>&laquo;&nbsp;' + abr(c.avant) + '&nbsp;&raquo; &rarr; <b>&laquo;&nbsp;' + abr(c.apres) + '&nbsp;&raquo;</b></span>' +
        '<button type="button" class="mep-btn" data-mep-corr-annuler="' + echapperAttribut(c.id) + '">Annuler</button></div>';
    }).join('') +
    (liste.length > 1 ? '<div class="corr-ligne"><span></span><button type="button" class="mep-btn" data-mep-corr-tout>Tout annuler</button></div>' : '');
  zone.ontoggle = function () { _mepCorrectionsOuvert = zone.open; };
  Array.prototype.forEach.call(zone.querySelectorAll('[data-mep-corr-annuler]'), function (b) {
    b.addEventListener('click', function () { _mepAnnulerCorrectionsCV([this.getAttribute('data-mep-corr-annuler')]); });
  });
  var tout = zone.querySelector('[data-mep-corr-tout]');
  if (tout) { tout.addEventListener('click', function () { _mepAnnulerCorrectionsCV(null); }); }
}
function _mepAnnulerCorrectionsCV(ids) {
  var w;
  try { w = document.querySelector('#zonePdfInlineCV iframe').contentWindow; } catch (e) { return; }
  _mepCorrectionsActives().forEach(function (c) {
    if (!ids || ids.indexOf(c.id) !== -1) { w._pdfMqTexteEdite(c.id, c.avant, c.avant); }
  });
  _mepAppelerIframePdf('_pdfRafraichir');
}
// Une saisie faite dans « Editer les experiences » REMPLACE une correction faite sur le CV pour le meme texte : la correction est retiree
// (jamais perdue en silence) et la carte le dit. Retourne le nombre de corrections remplacees.
function _mepRetirerCorrectionsDeTextes(anciens) {
  var w;
  try { w = document.querySelector('#zonePdfInlineCV iframe').contentWindow; } catch (e) { return 0; }
  var norm = function (x) { x = String(x || '').trim(); return (typeof _pdfSansPonctuationFinale === 'function') ? _pdfSansPonctuationFinale(x) : x.replace(/[.;:,\s]+$/, ''); };
  var cibles = anciens.map(norm).filter(Boolean);
  var n = 0;
  _mepCorrectionsActives().forEach(function (c) {
    if (cibles.indexOf(norm(c.avant)) !== -1) { w._pdfMqTexteEdite(c.id, c.avant, c.avant); n++; }
  });
  return n;
}

// Edition d'UNE experience a la fois (2026-09-26, demande de Denis) : la case « Editer les experiences » ouvre le panneau des experiences, toutes
// FERMEES ; un clic sur le nom d'une experience ouvre son formulaire (les autres se referment). Rien n'est enregistre au fil de la frappe : les
// saisies sont gardees en brouillon (`_mepBrouillonsExp`, par experience du dossier) et le bouton « Valider », en bas a droite du formulaire,
// enregistre l'ensemble ; tant que rien n'a change, ce meme bouton s'appelle « Annuler » et ferme le formulaire.
var _mepExpEditee = null;        // indice DOSSIER de l'experience dont le formulaire est ouvert
var _mepBrouillonsExp = {};      // indice dossier -> { champ: valeur saisie }
var _mepMessageEnregExp = 'Enregistré ✓';
function _mepValeurNormaliseeChamp(champ, brut) {
  var v = String(brut === undefined || brut === null ? '' : brut);
  if (champ === 'missions') { return v.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).join('\n'); }
  if (champ === 'dateDebut' || champ === 'dateFin') { return _mepNormaliserDateSaisie(v); }
  return v.trim();
}
function _mepBrouillonModifie(k) {
  var b = _mepBrouillonsExp[k], d = (dossier.experiences || [])[k];
  if (!b || !d) { return false; }
  return Object.keys(b).some(function (champ) { return _mepValeurNormaliseeChamp(champ, b[champ]) !== _mepValeurNormaliseeChamp(champ, d[champ]); });
}
// ============================================================
// Certifications structurees (2026-09-26, demande de Denis) : intitule, organisme, lieu, date. `dossier.certifications` reste une liste de
// textes « Intitule (organisme, lieu, date) » (lus tels quels partout : Word, lettre, entretien...) ; modules/cv-core/certifications.js fait le
// pont. Edition comme les experiences : un clic sur le nom ouvre le formulaire de CETTE certification (les autres restent fermees), les
// saisies restent en brouillon, le bouton s'appelle « Annuler » tant que rien n'a change puis devient « Valider ». Ce qui n'a pas ete capte
// reste vide : rien n'est invente.
// ============================================================
var _mepCertifEditee = null;
var _mepBrouillonsCertif = {};
var _mepCertifDernier = null;
function _mepChampsCertif(k) {
  var brut = (dossier.certifications || [])[k];
  var champs = separerCertification(brut);
  var b = _mepBrouillonsCertif[k] || {};
  ['intitule', 'organisme', 'lieu', 'date'].forEach(function (nom) { if (b[nom] !== undefined) { champs[nom] = b[nom]; } });
  return champs;
}
// Missions facultatives d'une certification (lot N1, 2026-10-04) : ce que le CV montre aujourd'hui pour elle (la correction de la personne si elle en a fait une,
// sinon la proposition de l'assistant), une mission par ligne. Rien n'est invente : vide = aucune mission ecrite.
function _mepTexteMissionsCertif(k) {
  var t = String((dossier.certifications || [])[k] || '').trim();
  var egal = function (e) { return e && String(e.certification || '').trim() === t; };
  var manuelle = (dossier.certificationsAvecMissions || []).filter(function (e) { return egal(e) && e.manuel; })[0];
  var liste = manuelle ? manuelle.missions : null;
  if (!manuelle) {
    var reco = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations && dossier.ia.cv.recommandations.certificationsAvecMissions) || [];
    var autre = reco.filter(egal)[0] || (dossier.certificationsAvecMissions || []).filter(egal)[0];
    liste = autre ? autre.missions : null;
  }
  return Array.isArray(liste) ? liste.join('\n') : String(liste || '');
}
function _mepMissionsCertifSaisies(k) {
  var b = _mepBrouillonsCertif[k];
  return (b && b.missions !== undefined) ? b.missions : _mepTexteMissionsCertif(k);
}
function _mepEnregistrerMissionsCertification(k, texte) {
  var t = String((dossier.certifications || [])[k] || '').trim();
  if (!t) { return; }
  var missions = String(texte || '').split(/\r?\n/).map(function (m) { return m.trim(); }).filter(Boolean);
  dossier.certificationsAvecMissions = (dossier.certificationsAvecMissions || []).filter(function (e) { return !(e && String(e.certification || '').trim() === t); });
  dossier.certificationsAvecMissions.push({ certification: t, missions: missions, manuel: true });
}
function _mepCertifModifiee(k) {
  var brut = (dossier.certifications || [])[k];
  if (brut === undefined || !_mepBrouillonsCertif[k]) { return false; }
  var missionsChangees = _mepBrouillonsCertif[k].missions !== undefined && _mepBrouillonsCertif[k].missions.trim() !== _mepTexteMissionsCertif(k).trim();
  return missionsChangees || composerCertification(_mepChampsCertif(k)) !== String(brut).trim();
}
// Les recommandations de l'assistant qui citent cette certification suivent son nouveau texte (sinon le moteur ne la reconnaitrait plus).
function _mepRenommerReferenceTexte(ancien, nouveau) {
  var reco = (dossier.ia && dossier.ia.cv && dossier.ia.cv.recommandations) || null;
  if (!reco) { return; }
  var egal = function (a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); };
  (function parcourir(o) {
    if (!o || typeof o !== 'object') { return; }
    Object.keys(o).forEach(function (cle) {
      if (typeof o[cle] === 'string') { if (egal(o[cle], ancien)) { o[cle] = nouveau; } }
      else { parcourir(o[cle]); }
    });
  })(reco);
}
function _mepEnregistrerCertification(k, champs) {
  var liste = dossier.certifications || [];
  var ancien = liste[k];
  if (ancien === undefined) { return false; }
  var nouveau = composerCertification(champs);
  if (!nouveau) { return false; }
  if (nouveau === String(ancien).trim()) { return true; }
  _mepPousserHistorique('editionCertif' + k);
  _mepRetirerCorrectionsDeTextes([afficherCertification(ancien, false), afficherCertification(ancien, true)]);
  liste[k] = nouveau;
  var det = dossier.detailsCatalogue && dossier.detailsCatalogue.certifications;
  if (det && det[ancien] !== undefined && det[nouveau] === undefined) { det[nouveau] = det[ancien]; delete det[ancien]; }
  _mepRenommerReferenceTexte(ancien, nouveau);
  (dossier.certificationsAvecMissions || []).forEach(function (e) { if (e && String(e.certification || '').trim() === String(ancien).trim()) { e.certification = nouveau; } });
  if (typeof sauvegarderSession === 'function') { try { sauvegarderSession(); } catch (err) { /* */ } }
  _mepAppelerIframePdf('_pdfRafraichir');
  return true;
}
function _htmlZoneCertificationsMq() {
  var liste = dossier.certifications || [];
  if (!liste.length) { return ''; }
  var lignes = liste.map(function (brut, k) {
    var c = separerCertification(brut);
    var resume = [c.organisme, c.lieu, c.date].filter(Boolean).join(', ');
    var ouvert = (_mepCertifEditee === k);
    var form = '';
    if (ouvert) {
      var ch = _mepChampsCertif(k), modifie = _mepCertifModifiee(k);
      var champ = function (nom, libelle, placeholder, large) {
        return '<div class="champ"' + (large ? ' style="grid-column:1/-1"' : '') + '><label>' + libelle + '</label><input type="text" data-certif-champ="' + nom + '" value="' + echapperAttribut(ch[nom] || '') + '"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + '></div>';
      };
      var message = (_mepCertifDernier && _mepCertifDernier.k === k && Date.now() - _mepCertifDernier.t < 4000 && !modifie) ? 'Enregistré ✓' : (modifie ? 'Modifications pas encore validées' : '');
      form = '<div class="exp-edit" data-certif-edit="' + k + '"><div class="grille-el">' +
        champ('intitule', 'Intitul&eacute; de la certification', '', true) +
        champ('organisme', 'Organisme', 'Ex. : AFPA') + champ('lieu', 'Lieu', 'Ex. : Limoges') +
        champ('date', 'Date', 'Ex. : 2023 ou juin 2023') +
        '<div class="champ" style="grid-column:1/-1"><label>Missions (facultatif) <span class="sous" style="font-weight:400">une par ligne : laissez vide si vous n&rsquo;en avez pas, rien ne sera &eacute;crit</span></label>' +
        '<textarea rows="3" data-certif-missions>' + echapperAttribut(_mepMissionsCertifSaisies(k)) + '</textarea></div></div>' +
        '<div class="exp-edit-pied"><span class="exp-edit-etat" aria-live="polite">' + message + '</span>' +
        '<button type="button" class="mep-btn' + (modifie ? ' principal' : '') + '" data-certif-valider>' + (modifie ? 'Valider' : 'Annuler') + '</button></div></div>';
    }
    return '<div class="ligne-bloc' + (ouvert ? ' ouvert' : '') + '"><div class="ligne-choix"><span class="nom cliquable" data-mep-certif-ouvrir="' + k + '" title="Cliquez pour modifier cette certification"><b>' + echapperAttribut(c.intitule) + '</b>' +
      (resume ? ' <em>(' + echapperAttribut(resume) + ')</em>' : '') + '</span></div>' + form + '</div>';
  }).join('');
  return '<details class="choix-exp" id="zoneCertifs"' + ((_mepCarteOuverte('zoneCertifs', false) || _mepCertifEditee !== null) ? ' open' : '') + '><summary class="choix-titre choix-bouton"><span class="cb-texte"><b><span class="cb-ouvrir">Modifier mes certifications</span></b>' +
    '<small>' + liste.length + ' certification' + (liste.length > 1 ? 's' : '') + ' &middot; cliquez pour modifier</small></span><span class="chev" aria-hidden="true">&#8964;</span></summary>' +
    '<div class="choix-corps"><p class="choix-aide">Cliquez sur une certification pour corriger son intitul&eacute;, son organisme, son lieu ou sa date. Ce qui n&rsquo;a pas &eacute;t&eacute; trouv&eacute; reste vide : rien n&rsquo;est invent&eacute;.</p>' +
    '<div class="mep-liste-choix-exp">' + lignes + '</div></div></details>';
}
function _mepCablerCertifications() {
  document.querySelectorAll('[data-mep-certif-ouvrir]').forEach(function (el) {
    el.addEventListener('click', function () {
      var k = parseInt(this.getAttribute('data-mep-certif-ouvrir'), 10);
      _mepCertifEditee = (_mepCertifEditee === k) ? null : k;
      _mepCartesOuvertes.zoneCertifs = true;
      _mepRerendre();
    });
  });
  document.querySelectorAll('[data-certif-edit]').forEach(function (bloc) {
    var k = parseInt(bloc.getAttribute('data-certif-edit'), 10);
    var etat = bloc.querySelector('.exp-edit-etat'), bouton = bloc.querySelector('[data-certif-valider]');
    var majEtat = function () {
      var modifie = _mepCertifModifiee(k);
      if (bouton) { bouton.textContent = modifie ? 'Valider' : 'Annuler'; bouton.classList.toggle('principal', modifie); }
      if (etat) { etat.textContent = modifie ? 'Modifications pas encore validées' : ''; }
    };
    var zoneMissions = bloc.querySelector('[data-certif-missions]');
    if (zoneMissions) {
      zoneMissions.addEventListener('input', function () {
        if (!_mepBrouillonsCertif[k]) { _mepBrouillonsCertif[k] = {}; }
        _mepBrouillonsCertif[k].missions = this.value;
        majEtat();
      });
    }
    bloc.querySelectorAll('[data-certif-champ]').forEach(function (champ) {
      champ.addEventListener('input', function () {
        if (!_mepBrouillonsCertif[k]) { _mepBrouillonsCertif[k] = {}; }
        _mepBrouillonsCertif[k][this.getAttribute('data-certif-champ')] = this.value;
        majEtat();
      });
    });
    if (bouton) {
      bouton.addEventListener('click', function () {
        if (!_mepCertifModifiee(k)) { delete _mepBrouillonsCertif[k]; _mepCertifEditee = null; _mepRerendre(); return; }
        var missionsSaisies = _mepMissionsCertifSaisies(k), missionsAvant = _mepTexteMissionsCertif(k);
        if (!_mepEnregistrerCertification(k, _mepChampsCertif(k))) { if (etat) { etat.textContent = 'L’intitulé de la certification ne peut pas être vide.'; } return; }
        if (missionsSaisies.trim() !== missionsAvant.trim()) { _mepPousserHistorique('missionsCertif' + k); _mepEnregistrerMissionsCertification(k, missionsSaisies); if (typeof sauvegarderSession === 'function') { try { sauvegarderSession(); } catch (err) { /* */ } } _mepAppelerIframePdf('_pdfRafraichir'); }
        delete _mepBrouillonsCertif[k];
        _mepCertifDernier = { k: k, t: Date.now() };
        setTimeout(_mepRerendre, 60);
      });
    }
  });
}

function _htmlEditionExperienceMq(e, i) {
  var k = _mepIndexDossierExperience(e);
  if (k < 0 || k !== _mepExpEditee) { return ''; }
  var d = dossier.experiences[k];
  var b = _mepBrouillonsExp[k] || {};
  var val = function (nom) { return (b[nom] !== undefined) ? b[nom] : (d[nom] || ''); };
  var champ = function (nom, libelle, placeholder, large) {
    return '<div class="champ"' + (large ? ' style="grid-column:1/-1"' : '') + '><label>' + libelle + '</label><input type="text" data-exp-champ="' + nom + '" value="' + echapperAttribut(val(nom)) + '"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + '></div>';
  };
  // TACHE (audit "mise en page", 2026-09-28) : une donnee ancienne encore jointe en
  // paragraphe (avant le correctif joindreMissionsImport/_joindreMissionsIA) doit quand meme
  // s'afficher une mission par ligne ici -- jamais le paragraphe brut tel quel dans le textarea.
  var valMissions = (b.missions !== undefined) ? b.missions : ((typeof _pdfDecouperMissions === 'function') ? _pdfDecouperMissions(d.missions || '').join('\n') : (d.missions || ''));
  return '<div class="exp-edit" data-exp-edit="' + i + '" data-exp-dossier="' + k + '"><div class="grille-el">' +
    champ('poste', 'Intitul&eacute; du poste', '', true) +
    champ('entreprise', 'Entreprise', '') + champ('lieu', 'Lieu', 'Ex. : Paris') +
    champ('dateDebut', 'D&eacute;but', 'Ex. : 2023-09 ou 2023') + champ('dateFin', 'Fin (vide = en cours)', 'Ex. : 2024-06 ou 2024') +
    // Stage (retour Denis 2026-10-03) : le MEME bouton et le MEME etat que sur la ligne de l'experience (data-mep-exp-stage, meme gestionnaire).
    '<div class="champ" style="grid-column:1/-1"><label>Type d&rsquo;exp&eacute;rience</label><div class="ligne-comp"><button type="button" class="btn-stage" data-mep-exp-stage="' + k + '" aria-pressed="' + (_pdfEstStage(d) ? 'true' : 'false') + '" title="Cette exp&eacute;rience est un stage : le CV &eacute;crira &laquo;&nbsp;(stage)&nbsp;&raquo; apr&egrave;s le poste">' + (_pdfEstStage(d) ? '&#10003; Stage' : 'Stage') + '</button>' + _mepAideBtn('Cochez si cette exp&eacute;rience est un stage : le CV &eacute;crira &laquo;&nbsp;(stage)&nbsp;&raquo; apr&egrave;s le poste. C&rsquo;est le m&ecirc;me r&eacute;glage que le bouton &laquo;&nbsp;Stage&nbsp;&raquo; de la liste.') + '</div></div>' +
    '<div class="champ" style="grid-column:1/-1"><label>Missions <span class="sous" style="font-weight:400">une par ligne : ajoutez ou corrigez ce que vous voulez mettre en avant</span></label>' +
    '<textarea rows="5" data-exp-champ="missions">' + echapperAttribut(valMissions) + '</textarea></div>' +
    '</div><div class="exp-edit-pied"><span class="exp-edit-etat" aria-live="polite">' + (_mepBrouillonModifie(k) ? 'Modifications pas encore valid&eacute;es' : '') + '</span>' +
    '<button type="button" class="mep-btn' + (_mepBrouillonModifie(k) ? ' principal' : '') + '" data-exp-valider>' + (_mepBrouillonModifie(k) ? 'Valider' : 'Annuler') + '</button></div></div>';
}
function _mepCablerEditionExperiences() {
  // Apres une reconstruction du panneau, le curseur revient dans le champ ou la personne etait, tant qu'elle n'a pas choisi elle-meme un autre champ.
  var restaurerFocus = function () {
    if (!_mepEditionExp || !_mepFocusEdition || Date.now() - _mepFocusEdition.t > 5000) { return; }
    var actif = document.activeElement;
    if (actif && actif.getAttribute && actif.getAttribute('data-exp-champ') && actif.isConnected) { return; }
    var cibleFocus = document.querySelector('[data-exp-edit="' + _mepFocusEdition.i + '"] [data-exp-champ="' + _mepFocusEdition.champ + '"]');
    if (cibleFocus) { cibleFocus.focus(); try { cibleFocus.setSelectionRange(cibleFocus.value.length, cibleFocus.value.length); } catch (err) { /* */ } }
  };
  restaurerFocus();
  setTimeout(restaurerFocus, 500);
  var cb = document.querySelector('[data-mep-exp-editer]');
  if (cb) {
    cb.addEventListener('change', function () {
      _mepEditionExp = this.checked;
      if (this.checked) { _mepCartesOuvertes.zoneChoixExp = true; }
      else { _mepExpEditee = null; _mepBrouillonsExp = {}; }
      _mepRerendre();
    });
  }
  // Un clic sur le nom d'une experience ouvre (ou referme) son formulaire, sans cocher / decocher l'experience.
  document.querySelectorAll('[data-mep-exp-ouvrir]').forEach(function (nomEl) {
    nomEl.addEventListener('click', function (ev) {
      ev.preventDefault();
      var k = parseInt(this.getAttribute('data-mep-exp-ouvrir'), 10);
      _mepExpEditee = (_mepExpEditee === k) ? null : k;
      _mepRerendre();
    });
  });
  document.querySelectorAll('[data-exp-edit]').forEach(function (bloc) {
    var i = parseInt(bloc.getAttribute('data-exp-edit'), 10);
    var kDossier = parseInt(bloc.getAttribute('data-exp-dossier'), 10);
    var etat = bloc.querySelector('.exp-edit-etat');
    var bouton = bloc.querySelector('[data-exp-valider]');
    if (_mepDernierEnregistrement && _mepDernierEnregistrement.k === kDossier && Date.now() - _mepDernierEnregistrement.t < 4000 && etat && !_mepBrouillonModifie(kDossier)) { etat.textContent = _mepMessageEnregExp; }
    var majEtat = function () {
      var modifie = _mepBrouillonModifie(kDossier);
      if (bouton) { bouton.textContent = modifie ? 'Valider' : 'Annuler'; bouton.classList.toggle('principal', modifie); }
      if (etat) { etat.textContent = modifie ? 'Modifications pas encore validées' : ''; }
    };
    bloc.querySelectorAll('[data-exp-champ]').forEach(function (champ) {
      champ.addEventListener('focusin', function () { _mepFocusEdition = { i: i, champ: this.getAttribute('data-exp-champ'), t: Date.now() }; });
      champ.addEventListener('input', function () {
        if (!_mepBrouillonsExp[kDossier]) { _mepBrouillonsExp[kDossier] = {}; }
        _mepBrouillonsExp[kDossier][this.getAttribute('data-exp-champ')] = this.value;
        majEtat();
      });
    });
    if (bouton) {
      bouton.addEventListener('click', function () {
        // Rien n'a change : le bouton est « Annuler » et ferme simplement le formulaire.
        if (!_mepBrouillonModifie(kDossier)) { delete _mepBrouillonsExp[kDossier]; _mepExpEditee = null; _mepRerendre(); return; }
        var b = _mepBrouillonsExp[kDossier] || {};
        var ordre = ['entreprise', 'lieu', 'dateDebut', 'dateFin', 'missions', 'poste'];
        var refuse = false;
        var zm = { textContent: '' };
        var remplacee = false;
        ordre.forEach(function (nom) {
          if (b[nom] === undefined) { return; }
          var d = dossier.experiences[kDossier];
          if (!d || _mepValeurNormaliseeChamp(nom, b[nom]) === _mepValeurNormaliseeChamp(nom, d[nom])) { return; }
          if (!_mepEnregistrerChampExperience(kDossier, nom, b[nom], zm)) { refuse = true; }
          if (/remplac/.test(zm.textContent)) { remplacee = true; }
        });
        if (refuse) { if (etat) { etat.textContent = 'L’intitulé du poste ne peut pas être vide.'; } return; }
        delete _mepBrouillonsExp[kDossier];
        _mepDernierEnregistrement = { k: kDossier, t: Date.now() };
        _mepMessageEnregExp = 'Enregistré ✓' + (remplacee ? ' Votre correction faite directement sur le CV pour ce texte est remplacée par cette saisie.' : '');
        if (etat) { etat.textContent = _mepMessageEnregExp; }
        setTimeout(_mepRerendre, 60);
      });
    }
  });
}

// ============================================================
// Personnaliser en 2 colonnes (lot 5, 2026-09-26) : ordre des blocs dans chaque colonne, passage d'une colonne a l'autre, deux blocs
// cote a cote dans la colonne large. « Experience professionnelle » reste a droite (cadenas).
// ============================================================
var _MEP_TITRES_COLONNES = { pro: 'competencesPro', comp: 'competencesComp', logi: 'logiciels', langues: 'langues', certifs: 'certifications', centres: 'loisirs',
  infos: 'infos', perso: 'experiencePerso', exp: 'experience', form: 'formations' };
// Retour Denis 2026-10-03 : en « Par competences », le bloc de competences du CV (les missions rangees par competence) s'appelle « Competences en action » ; la cle « pro » le designe
// alors (ordre des colonnes, grand apercu, noms du panneau). Lecture seule, toujours a jour avec le mode choisi.
try { Object.defineProperty(_MEP_TITRES_COLONNES, 'pro', { enumerable: true, configurable: true, get: function () { try { return (_mepEtatExperiences().mode === 'C') ? 'competencesEnAction' : 'competencesPro'; } catch (e) { return 'competencesPro'; } } }); } catch (e) { /* le titre d'origine reste utilise */ }
function _mepNomBlocColonne(k) { return _PDF_INTITULES[_MEP_TITRES_COLONNES[k]] || k; }
function _mepNomBlocColonneAfficheEnAction() { return echapperAttribut(_mepIntitule(_PDF_INTITULES.competencesEnAction)); }
// Nom AFFICHÉ d'un bloc dans le panneau : l'intitulé choisi par la personne (la clé _mepNomBlocColonne, elle, reste le nom d'origine).
function _mepNomBlocColonneAffiche(k) { var o = _mepNomBlocColonne(k); return echapperAttribut(_mepIntitule(o)); }
function _mepBlocPresentSurCV(k) {
  if (k === 'exp') { return true; }
  try {
    var d = document.querySelector('#zonePdfInlineCV iframe').contentDocument;
    return !!d.querySelector('.page-a4 [data-rub="' + _mepNomBlocColonne(k).replace(/"/g, '') + '"]');
  } catch (e) { return true; }
}
function _mepDispositionColonnesActuelle(etat, choix, c) {
  var depart = _pdfDispositionDepartColonnes(!!etat.compHaut, !!choix.formationsAGauche, !!etat.formAvant);
  var largeur = (c && c.largeurColonneGauche) || 35;
  return _pdfNormaliserDispositionColonnes(choix.ordreColonnes || depart, depart, largeur);
}
function _htmlPersoDeuxColonnesMq(etat, choix, c) {
  var dispo = _mepDispositionColonnesActuelle(etat, choix, c);
  var large = _pdfColonneLarge((c && c.largeurColonneGauche) || 35);
  var bouton = 'border:1px solid var(--border-strong);background:var(--bg-card);color:var(--text-strong);border-radius:6px;min-width:28px;height:26px;padding:0 .35rem;font-size:.7rem';
  var colonne = function (col, titre) {
    var lignes = dispo[col].map(function (ligne, ri) {
      var visibles = ligne.filter(_mepBlocPresentSurCV);
      if (!visibles.length) { return ''; }
      var estPaire = ligne.length === 2;
      return '<div class="perso-ligne' + (estPaire ? ' paire-perso' : '') + '">' + ligne.map(function (k, ki) {
        if (!_mepBlocPresentSurCV(k)) { return ''; }
        var attr = ' data-mep-col-c="' + col + '" data-mep-col-r="' + ri + '" data-mep-col-k="' + k + '"';
        var verrou = (k === 'exp');
        var autre = col === 'gauche' ? 'droite' : 'gauche';
        var b = '<button type="button" style="' + bouton + '"' + attr + ' data-mep-col-act="monter" title="Monter"' + ((ri === 0) ? ' disabled' : '') + '>&#9650;</button>' +
          '<button type="button" style="' + bouton + '"' + attr + ' data-mep-col-act="descendre" title="Descendre"' + ((ri === dispo[col].length - 1) ? ' disabled' : '') + '>&#9660;</button>';
        if (!verrou) { b += '<button type="button" style="' + bouton + '"' + attr + ' data-mep-col-act="autre" title="Passer dans la colonne de ' + autre + '">' + (col === 'gauche' ? '&#8594; droite' : '&#8592; gauche') + '</button>'; }
        if (!verrou && col === large) {
          if (estPaire) { b += '<button type="button" style="' + bouton + '"' + attr + ' data-mep-col-act="separer" title="Remettre ce bloc sur sa propre ligne">S&eacute;parer</button>'; }
          else if (ri > 0 && dispo[col][ri - 1].length === 1 && dispo[col][ri - 1][0] !== 'exp') { b += '<button type="button" style="' + bouton + '"' + attr + ' data-mep-col-act="cote" title="Mettre ce bloc &agrave; c&ocirc;t&eacute; du bloc du dessus">&#8596; &Agrave; c&ocirc;t&eacute; du dessus</button>'; }
        }
        return '<div class="perso-bloc"><span class="perso-nom">' + (verrou ? '&#128274; ' : '') + _mepNomBlocColonneAffiche(k) + '</span><span class="perso-btns">' + b + '</span></div>';
      }).join('') + '</div>';
    }).join('');
    return '<div class="perso-col"><b>' + titre + (col === large ? ' <span class="ex">(colonne large : 2 blocs c&ocirc;te &agrave; c&ocirc;te possibles)</span>' : '') + '</b>' + lignes + '</div>';
  };
  return '<p class="sous" style="margin:0 0 .4rem">Ordre des blocs dans chaque colonne. &laquo;&nbsp;Exp&eacute;rience professionnelle&nbsp;&raquo; reste toujours dans la colonne de droite (cadenas). ' +
    'La colonne de gauche est &eacute;troite : deux blocs c&ocirc;te &agrave; c&ocirc;te n&rsquo;y sont pas propos&eacute;s.</p>' +
    '<div class="perso-cols">' + colonne('gauche', 'Colonne de gauche') + colonne('droite', 'Colonne de droite') + '</div>' +
    '<div style="margin-top:.5rem"><button type="button" class="mep-btn" data-mep-col-raz>Remettre la disposition de d&eacute;part</button></div>';
}
// Retour Denis 2026-10-01 : la taille du texte, l'interligne et l'espace d'une rubrique ne se reglent pas dans la carte mais DIRECTEMENT SUR LE CV (grand apercu). Ce
// bouton y mene : le grand apercu s'ouvre sur « Regler le corps du CV », a la rubrique d'ou vient la personne, avec sa barre deja ouverte (taille, interligne, espace).
// Absent quand le modele n'a pas de grand apercu a rubriques (modeles heritage).
function _mepBoutonReglerRubrique(titreRubrique) {
  if (typeof ouvrirPleinEcranMaquette !== 'function' || (typeof _mepModeleMaquetteActif === 'function' && !_mepModeleMaquetteActif())) { return ''; }
  return '<div class="champ"><div class="ligne-comp" style="flex-wrap:wrap">' +
    '<span class="sous-aide" style="margin:0">Taille du texte, interligne et espace de cette rubrique : directement sur le CV.</span>' +
    '<button type="button" class="btn-miss" data-mep-regler-rubrique="' + echapperAttribut(titreRubrique) + '">Régler sur le CV &#8594;</button>' +
    '</div></div>';
}
function _mepOuvrirReglageRubrique(titreRubrique) {
  if (typeof ouvrirPleinEcranMaquette !== 'function') { return; }
  ouvrirPleinEcranMaquette({ rubrique: titreRubrique, regler: true });
}
// Raccourci affiche a cote de « Mon ordre » (retour Denis 2026-09-30) : un clic et on est dans le grand apercu, sur le deplacement des elements.
function _mepBoutonRangerGrandApercu() {
  return ' <button type="button" class="mep-btn" data-mep-ordre-grand-apercu title="Ouvre le grand aper&ccedil;u : glissez chaque &eacute;l&eacute;ment par sa poign&eacute;e">&#8597; Ranger dans le grand aper&ccedil;u</button>';
}
function _mepOuvrirDeplacementElements() {
  if (typeof ouvrirPleinEcranMaquette !== 'function') { return; }
  ouvrirPleinEcranMaquette();
  setTimeout(function () { var b = document.getElementById('mqTDeplacer'); if (b && !b.disabled) { b.click(); } }, 400);
}
function _mepOuvrirDeplacementRubriques() {
  if (typeof ouvrirPleinEcranMaquette !== 'function') { return; }
  ouvrirPleinEcranMaquette();
  setTimeout(function () { var b = document.getElementById('mqTRubriques'); if (b && !b.disabled) { b.click(); } }, 400);
}
function _mepCablerPersoColonnes() {
  var bSouris = document.querySelector('[data-mep-rub-souris]');
  if (bSouris) { bSouris.addEventListener('click', _mepOuvrirDeplacementRubriques); }
  var zone = document.querySelector('.perso-cols');
  var raz = document.querySelector('[data-mep-col-raz]');
  if (raz) { raz.addEventListener('click', function () { _mepDefinirChoixMq('ordreColonnes', null); }); }
  if (!zone) { return; }
  document.querySelectorAll('[data-mep-col-act]').forEach(function (b) {
    b.addEventListener('click', function () {
      var etat = _mepEtatOrganisation(), choix = _mepEtatChoixMq(), c = dossier.reglagesMiseEnPageCV || {};
      var dispo = JSON.parse(JSON.stringify(_mepDispositionColonnesActuelle(etat, choix, c)));
      var col = this.getAttribute('data-mep-col-c'), ri = parseInt(this.getAttribute('data-mep-col-r'), 10), k = this.getAttribute('data-mep-col-k');
      var act = this.getAttribute('data-mep-col-act');
      var liste = dispo[col];
      if (act === 'monter' && ri > 0) { var t = liste[ri]; liste[ri] = liste[ri - 1]; liste[ri - 1] = t; }
      else if (act === 'descendre' && ri < liste.length - 1) { var t2 = liste[ri]; liste[ri] = liste[ri + 1]; liste[ri + 1] = t2; }
      else if (act === 'autre') {
        liste[ri] = liste[ri].filter(function (x) { return x !== k; });
        if (!liste[ri].length) { liste.splice(ri, 1); }
        dispo[col === 'gauche' ? 'droite' : 'gauche'].push([k]);
      } else if (act === 'cote' && ri > 0) { liste[ri - 1] = liste[ri - 1].concat([k]); liste.splice(ri, 1); }
      else if (act === 'separer') {
        liste[ri] = liste[ri].filter(function (x) { return x !== k; });
        liste.splice(ri + 1, 0, [k]);
      }
      _mepDefinirChoixMq('ordreColonnes', dispo);
    });
  });
}
