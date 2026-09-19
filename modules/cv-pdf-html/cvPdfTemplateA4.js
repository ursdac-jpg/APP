/* ============================================================
   cvPdfTemplateA4.js
   ------------------------------------------------------------
   Moteur "CV design (PDF)" -- construit un DOCUMENT HTML COMPLET
   (chaine de caracteres autonome, <!DOCTYPE>...</html>) pour le
   premier modele demo (A4, 1 ou 2 colonnes, bandeau en-tete +
   degrades optionnels) valide avec l'utilisateur dans
   modules/cv-pdf-html/prototype-a4.html.

   Isolation : ce fichier ne depend QUE de la forme de donnees
   generique retournee par construireDonneesPdfCV() (cvPdfDonnees.js)
   -- jamais de docx.js, jamais de composeurRender.js/composeurTheme.js
   (rendu Word). Consomme composition.contenuRetenu (deja tronque/
   decide par le moteur partage) : aucune re-decision de contenu ici,
   uniquement de la mise en forme HTML/CSS. L'ORDRE des rubriques est
   lui aussi repris tel quel de composition.strategieCV.ordreRubriques
   (meme moteur de decision que le Word, jamais recalcule ici).

   IMPORTANT : `options.bandeauDisponibilite` doit toujours correspondre
   EXACTEMENT a la valeur deja passee a construireDonneesPdfCV() pour
   batir `composition` (cvPdfDonnees.js) -- ce reglage influence a la
   fois la DECISION de contenu (langues videes par le moteur partage) et
   le RENDU (bandeau separe telephone/permis) : les 2 doivent rester
   synchronises, voir cvPdfExport.js qui porte cette responsabilite.
   ============================================================ */

function _pdfEscaperHtml(valeur) {
  return String(valeur === null || valeur === undefined ? '' : valeur).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// TACHE (retour utilisateur : "pouvoir souligner le poste, les dates,
// l'entreprise... et pareil pour l'italique") : mise en evidence GLOBALE
// par TYPE d'information (jamais par item individuel -- les experiences
// n'ont pas d'identifiant stable, un reglage par item casserait des qu'on
// trie/reordonne, voir _pdfConstruireStyleEtPage) -- des qu'un type est
// souligne/italique, il l'est PARTOUT ou il apparait (experience pro,
// experience personnelle, formations), jamais un sous-ensemble
// incoherent. `style` = { souligne: bool, italique: bool } (voir
// _PDF_STYLE_PARTIES_DEFAUT, construit une seule fois dans
// _pdfConstruireStyleEtPage/_pdfConstruireStyleEtPageA5). Le gras reste
// gere tel quel via le <strong> englobant deja existant, jamais duplique
// ici.
function _pdfSpanStylePartie(texte, style) {
  if (!texte) { return ''; }
  if (!style || (!style.souligne && !style.italique)) { return _pdfEscaperHtml(texte); }
  var classes = [];
  if (style.souligne) { classes.push('style-partie-souligne'); }
  if (style.italique) { classes.push('style-partie-italique'); }
  return '<span class="' + classes.join(' ') + '">' + _pdfEscaperHtml(texte) + '</span>';
}

// TACHE (retour utilisateur : "icônes... ça date de 1995, je veux quelque
// chose de plus moderne, en lien avec la thématique -- étoile, ça ne parle
// pas") : set de pictogrammes "trait fin" (style Feather/Lucide -- viewBox
// 24x24, stroke="currentColor", AUCUNE couleur en dur) -- currentColor est
// ce qui garantit la meme charte graphique que le texte qu'ils accompagnent
// (h2 de rubrique DEJA colore via var(--degrade-debut)/var(--texte-fond)
// selon le style de titre actif, voir CSS .rubrique h2 plus bas -- les
// icones suivent automatiquement, jamais une 2e couleur a synchroniser a la
// main). Cle = theme de la rubrique (jamais l'emoji lui-meme, contrairement
// a avant) ; "competencesCles" reprend litteralement le mot "clé" (icone
// clé), le seul champ ou "étoile" avait un sens vaguement defendable mais
// que l'utilisateur a explicitement rejete comme trop generique.
var _PDF_ICONES_SVG = {
  experience: '<path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="12" x2="21" y2="12"/>',
  formations: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/><line x1="22" y1="8" x2="22" y2="14"/>',
  competences: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="18" r="2"/>',
  competencesComportementales: '<rect x="3" y="4" width="18" height="12" rx="3"/><path d="M8 16l-3 4v-4"/>',
  langues: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3c2.8 2.4 4.4 5.6 4.4 9s-1.6 6.6-4.4 9"/><path d="M12 3c-2.8 2.4-4.4 5.6-4.4 9s1.6 6.6 4.4 9"/>',
  loisirs: '<path d="M12 21s-7-4.3-9.5-8.8C1 8.6 2.1 4.6 6 4.6c2 0 3.5 1 6 3.4 2.5-2.4 4-3.4 6-3.4 3.9 0 5 4 3.5 7.6C19 16.7 12 21 12 21z"/>',
  engagements: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M15.2 20c.3-2.5 1.9-4.5 4.1-5.3"/>',
  certifications: '<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5"/>',
  competencesCles: '<circle cx="7" cy="15" r="4"/><line x1="10.5" y1="11.5" x2="20" y2="2"/><line x1="16" y1="6" x2="19" y2="9"/><line x1="13" y1="9" x2="15.5" y2="11.5"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/>',
  telephone: '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>',
  localisation: '<path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  permis: '<rect x="2" y="11" width="20" height="6" rx="2"/><path d="M6 11l2-4h8l2 4"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'
};
function _pdfIconeSvg(cle) {
  var interieur = _PDF_ICONES_SVG[cle];
  if (!interieur) { return ''; }
  return '<svg class="icone-ligne" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + interieur + '</svg>';
}

// TACHE (chantier "2 nouveaux modeles Créatif", modele "Pastille") : icone
// TOUJOURS enveloppee dans un <span class="icone-titre"> (jamais nue comme
// avant) -- ce wrapper generique ne change RIEN au rendu par defaut (CSS
// display:contents, voir plus bas) mais donne un crochet pour habiller
// l'icone en rond colore quand .style-titres-pastille est actif sur un
// ancetre, sans jamais avoir a faire connaitre styleTitres a cette
// fonction (qui reste appelee identiquement partout, jamais un parametre
// supplementaire a threader dans tous ses appelants).
function _pdfTitreH2(icone, texte, iconesActives) {
  var iconeHtml = iconesActives ? '<span class="icone-titre">' + _pdfIconeSvg(icone) + '</span>' : '';
  return '<h2>' + iconeHtml + _pdfEscaperHtml(texte) + '</h2>';
}

// TACHE (retour utilisateur, bug reel confirme : "ce n'est pas normal que
// ce soit dans les parentheses -- je ne sais pas si c'est jusqu'a
// aujourd'hui... cote Word c'est tres clair, de X a aujourd'hui") : port
// EXACT de _formaterPeriode (composeurRender.js:329-332, cote Word) --
// dateFin absente = poste toujours en cours, jamais une simple annee de
// debut isolee (ambigue : depuis quand jusqu'a quand ?). Reutilise par A4
// ET A5 (charge apres ce fichier, meme convention que _pdfEscaperHtml).
// TACHE (retour utilisateur : "je ne veux pas les mois, seulement les
// annees") : dates stockees en AAAA-MM -- seule l'annee (4 premiers
// caracteres) est affichee desormais, jamais le mois. Debut===fin (une
// experience commencee et terminee la meme annee) affiche une seule
// annee, jamais "2020 - 2020".
function _pdfAnneeSeule(dateAAAAMM) {
  return (dateAAAAMM || '').slice(0, 4);
}
function _pdfFormaterPeriode(dateDebut, dateFin) {
  var anneeDebut = _pdfAnneeSeule(dateDebut);
  var anneeFin = _pdfAnneeSeule(dateFin);
  if (anneeDebut && !anneeFin) { return anneeDebut + ' - en cours'; }
  if (anneeDebut && anneeFin && anneeDebut === anneeFin) { return anneeDebut; }
  return [anneeDebut, anneeFin].filter(Boolean).join(' - ');
}

// TACHE (retour utilisateur, bug reel confirme -- degrade de colonne trop
// dilue : "en bas on ne voit plus rien du tout") : couleurFin (choisie
// libre, ou tiree par le style aleatoire -- ex. "#d9e8f2", tres pale) sert
// d'extremite au degrade PLEINE HAUTEUR d'une colonne (.colonne.degrade-actif,
// plus bas), pendant que la couleur du texte reste FIXE sur toute la
// colonne (decidee une seule fois d'apres la luminance de couleurDebut
// SEUL, voir regTexteFondColonnes). Un couleurFin trop clair (texte blanc)
// ou trop fonce (texte noir) rend donc l'extremite opposee a couleurDebut
// illisible. Repli SIMPLE : on ramene "fin" vers "debut" par petits pas
// (10%) jusqu'a ce que sa luminance reste du meme cote du seuil que
// couleurDebut -- jamais une 2e couleur inventee, jamais un calcul de
// contraste WCAG complet, juste le meme seuil (0.6) deja utilise pour
// choisir blanc/noir. Coincide avec couleurFin telle quelle (ratio 1) des
// que le contraste est deja bon sur toute la hauteur -- jamais de
// changement visible dans ce cas.
function _pdfHexVersRgb(hex) {
  var h = String(hex || '#000000').replace('#', '');
  return { r: parseInt(h.substr(0, 2), 16) || 0, g: parseInt(h.substr(2, 2), 16) || 0, b: parseInt(h.substr(4, 2), 16) || 0 };
}
function _pdfRgbVersHex(r, g, b) {
  function composante(n) { return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'); }
  return '#' + composante(r) + composante(g) + composante(b);
}
function _pdfMelangerHex(hexA, hexB, ratio) {
  var a = _pdfHexVersRgb(hexA), b = _pdfHexVersRgb(hexB);
  return _pdfRgbVersHex(a.r + (b.r - a.r) * ratio, a.g + (b.g - a.g) * ratio, a.b + (b.b - a.b) * ratio);
}
// Copie locale de _pdfLuminanceHex (cvPdfPanneauReglages.js) -- CE fichier
// (cvPdfTemplateA4.js) s'execute dans la fenetre PARENTE (charge par
// <script src>, index.html), alors que _pdfLuminanceHex n'existe QUE dans
// le SCOPE DE CHAQUE IFRAME (elle vit a l'interieur de la grosse chaine
// HTML retournee par construirePageInteractivePdfA4(), evaluee uniquement
// au document.write() -- jamais un identifiant global partage entre les 2
// fenetres). Y faire reference directement ici leverait un ReferenceError
// (bug reel trouve en testant) -- copie minimaliste, jamais une
// dependance cross-fenetre fragile.
function _pdfLuminanceHexA4(hex) {
  var rgb = _pdfHexVersRgb(hex);
  return 0.2126 * (rgb.r / 255) + 0.7152 * (rgb.g / 255) + 0.0722 * (rgb.b / 255);
}
function _pdfFinDegradeLisible(couleurDebut, couleurFin, texteNoir) {
  var seuil = 0.6;
  for (var ratio = 1; ratio >= 0; ratio -= 0.1) {
    var candidat = _pdfMelangerHex(couleurDebut, couleurFin, ratio);
    if (texteNoir ? _pdfLuminanceHexA4(candidat) > seuil : _pdfLuminanceHexA4(candidat) <= seuil) { return candidat; }
  }
  return couleurDebut;
}

function _pdfLignesMissions(texteMissions) {
  return (texteMissions || '')
    .split('\n')
    .map(function (l) { return l.trim(); })
    .filter(Boolean)
    .map(function (l) { return '<div class="ligne-mission">' + _pdfEscaperHtml(l) + '</div>'; })
    .join('');
}

// Port EXACT du Word (composeurRender.js:_decouperMissions) : 3 formats
// geres, jamais melanges -- \n en priorite (saisie manuelle), repli sur
// « ; » si un seul morceau ET presence reelle de « ; » (format
// Decouverte), sinon repli sur des phrases jointes par ". " + majuscule
// (format IA/import, savoirFaireParExperience). Decoupe sur un point
// suivi d'un espace ET d'une majuscule pour eviter de couper a tort une
// abreviation ou un nombre decimal.
function _pdfDecouperMissions(texteMissions) {
  var brut = (texteMissions || '').trim();
  if (!brut) { return []; }
  var morceaux = brut.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  if (morceaux.length <= 1 && brut.indexOf(';') !== -1) {
    morceaux = brut.split(';').map(function (l) { return l.trim(); }).filter(Boolean);
  }
  if (morceaux.length <= 1 && /\.\s+[A-ZÀ-Ý]/.test(brut)) {
    morceaux = brut.split(/\.\s+(?=[A-ZÀ-Ý])/).map(function (l) { return l.trim(); }).filter(Boolean);
  }
  return morceaux;
}
// Port EXACT du Word (composeurRender.js:_sansPonctuationFinale).
function _pdfSansPonctuationFinale(segment) {
  return (segment || '').replace(/[;.\s]+$/, '').replace(/^[;.\s]+/, '');
}
// TACHE (retour utilisateur : "avoir deux options d'affichage exactement
// comme dans le Word -- épuré ou condensé... condensé, à la fin de la
// mission je n'ai pas le point, mais le gros point pour distinguer une
// mission de l'autre... épuré, chaque mission sur une ligne à part") :
// port EXACT de composeurRender.js (theme.styleProfessionnel/stylePersonnel,
// 'epure' par defaut) -- jamais une 3e logique de mise en forme des
// missions, reutilise EXACTEMENT le meme decoupage/nettoyage que le mode
// "compact" (Essentiel) ci-dessus, juste sans fusionner le poste/entreprise.
function _pdfRenduMissions(texteMissions, styleMissions) {
  var segments = _pdfDecouperMissions(texteMissions);
  if (!segments.length) { return ''; }
  if (styleMissions === 'condense') {
    var missionsCondensees = segments.map(_pdfSansPonctuationFinale).filter(Boolean).join(' · ');
    return missionsCondensees ? '<div class="ligne-mission">' + _pdfEscaperHtml(missionsCondensees) + '</div>' : '';
  }
  return segments.map(function (segment) {
    var texteMission = _pdfSansPonctuationFinale(segment);
    return texteMission ? '<div class="ligne-mission">' + _pdfEscaperHtml(texteMission + '.') + '</div>' : '';
  }).join('');
}

// `compact` (defaut false) : port du Word (composeurRender.js:935,
// composition.formatEssentiel) -- 1 seule ligne par experience ("poste --
// entreprise (dates) : missions jointes par ' · '"), jamais de puces de
// missions detaillees. Decide par l'appelant (_pdfConstruireStyleEtPage),
// jamais recalcule ici.
// TACHE (retour utilisateur : "je puisse facilement identifier le poste,
// la date et l'entreprise -- lisible et clair") : `formatExperiences`
// (defaut 'standard') -- 'ameliore' met l'entreprise en couleur d'accent
// sur sa propre ligne et la periode alignee a droite du poste, jamais un
// 3e format invente au-dela de ces 2 (voir CSS .item-experience-ameliore,
// _pdfConstruireStyleEtPage). Ignore en mode `compact` (Essentiel), qui
// reste sur son propre format 1 ligne quel que soit ce reglage.
function _pdfBlocExperiences(experiences, iconesActives, compact, styleMissions, formatExperiences, styleParties) {
  if (!experiences || !experiences.length) { return ''; }
  var stylePoste = styleParties && styleParties.poste;
  var styleDates = styleParties && styleParties.dates;
  var styleEntreprise = styleParties && styleParties.entreprise;
  var items = experiences.map(function (e) {
    var periode = _pdfFormaterPeriode(e.dateDebut, e.dateFin);
    if (compact) {
      // TACHE (retour utilisateur : "souligner le poste, les dates,
      // l'entreprise... et pareil pour l'italique") : le mode compact
      // (Essentiel) construisait sa ligne en 1 seule chaine echappee d'un
      // bloc -- desormais poste/entreprise/periode passent chacun par
      // _pdfSpanStylePartie AVANT d'etre joints, jamais le reste de la
      // ligne (separateurs, missions) qui n'a pas de "type" a mettre en
      // evidence.
      var posteSpanC = _pdfSpanStylePartie(e.poste, stylePoste);
      var entrepriseSpanC = _pdfSpanStylePartie(e.entreprise, styleEntreprise);
      var periodeSpanC = _pdfSpanStylePartie(periode, styleDates);
      var infosLigne = [entrepriseSpanC, periodeSpanC].filter(Boolean).join(' · ');
      var missionsCompactes = _pdfDecouperMissions(e.missions).map(_pdfSansPonctuationFinale).filter(Boolean).join(' · ');
      var ligne = posteSpanC + (infosLigne ? ' - ' + infosLigne : '') + (missionsCompactes ? ' : ' + _pdfEscaperHtml(missionsCompactes) : '');
      return '<div class="item">' + ligne + '</div>';
    }
    if (formatExperiences === 'ameliore') {
      return '<div class="item item-experience-ameliore">' +
        '<div class="ligne-titre-experience">' +
        '<span class="poste-experience">' + _pdfSpanStylePartie(e.poste, stylePoste) + '</span>' +
        (periode ? '<span class="periode-experience">' + _pdfSpanStylePartie(periode, styleDates) + '</span>' : '') +
        '</div>' +
        (e.entreprise ? '<div class="entreprise-experience">' + _pdfSpanStylePartie(e.entreprise, styleEntreprise) + '</div>' : '') +
        _pdfRenduMissions(e.missions, styleMissions) +
        '</div>';
    }
    // TACHE (retour utilisateur : "souligner le poste... l'entreprise")
    // : poste/entreprise passent desormais SEPAREMENT par
    // _pdfSpanStylePartie (jamais joints puis echappes comme une seule
    // chaine) pour pouvoir styler l'un sans l'autre -- le separateur
    // ' - ' entre eux reste, lui, toujours neutre.
    var titreHtml = [_pdfSpanStylePartie(e.poste, stylePoste), _pdfSpanStylePartie(e.entreprise, styleEntreprise)].filter(Boolean).join(' - ');
    // TACHE (retour utilisateur : "je ne veux pas Carrelage (2017-2022)
    // mais Carrelage : 2017-2022") : deux-points au lieu de parentheses,
    // jamais un 2e format de periode invente (voir _pdfFormaterPeriode).
    // TACHE (retour utilisateur : "je ne peux pas modifier le parcours en
    // mode edition" -- bug reel confirme) : classe DEDIEE sur le titre,
    // distincte des missions qui suivent -- sans elle, _PDF_SELECTEUR_EDITABLE
    // (cvPdfPanneauReglages.js) ne voit que le .item englobant, qui perd
    // son id d'edition des qu'il contient au moins une .ligne-mission (regle
    // "seul le plus petit element compte") : le titre entier devenait alors
    // non editable des qu'il y avait des missions, alors qu'un item SANS
    // mission restait, lui, editable -- incoherence exactement signalee.
    return '<div class="item">' +
      '<strong class="titre-item-avec-detail">' + titreHtml + (periode ? ' : ' + _pdfSpanStylePartie(periode, styleDates) : '') + '</strong>' +
      _pdfRenduMissions(e.missions, styleMissions) +
      '</div>';
  }).join('');
  // TACHE (retour utilisateur : "j'aimerais que ce soit comme le Word --
  // Expérience professionnelle") : renomme depuis "Expériences" pour
  // rester coherent avec composeurRender.js:916 ("Expérience
  // professionnelle") et se distinguer clairement de "Compétences
  // professionnelles", jamais confondues.
  return '<div class="rubrique">' + _pdfTitreH2('experience', 'Expérience professionnelle', iconesActives) + items + '</div>';
}

function _pdfBlocFormations(formations, iconesActives, styleParties) {
  if (!formations || !formations.length) { return ''; }
  var stylePoste = styleParties && styleParties.poste;
  var styleDates = styleParties && styleParties.dates;
  var styleEntreprise = styleParties && styleParties.entreprise;
  // TACHE (retour utilisateur : "CQP/Titre professionnel/Bac général --
  // faire apparaître ça sur le CV, c'est important") : f.niveau (qui porte
  // désormais le type -- "CQP", "Titre professionnel", "Bac général" --
  // voir niveauFormationAffiche(), js/app.js) manquait entièrement ici,
  // contrairement à tous les autres modèles -- seuls intitulé/établissement
  // apparaissaient. Même convention "Type - Intitulé" que partout ailleurs
  // (' - ', jamais le tiret cadratin) -- établissement rejoint la MÊME
  // chaîne avec le MÊME séparateur (retour utilisateur, bug réel trouvé en
  // testant : mélanger ' - ' et ' -- ' sur une seule ligne était
  // incohérent), jamais deux séparateurs différents sur la même ligne.
  var items = formations.map(function (f) {
    // TACHE (retour utilisateur : "souligner... tout ce qui est formation
    // et année et le lycée ou l'école") : niveau+intitule = equivalent
    // "poste" (le diplome), etablissement = equivalent "entreprise",
    // annee = equivalent "dates" -- MEME 3 reglages globaux que les
    // experiences (styleParties), jamais un 4e type invente pour les
    // formations.
    var diplomeTexte = [f.niveau, f.intitule].filter(Boolean).join(' - ');
    var titreHtml = [_pdfSpanStylePartie(diplomeTexte, stylePoste), _pdfSpanStylePartie(f.etablissement, styleEntreprise)].filter(Boolean).join(' - ');
    return '<div class="item">' +
      // TACHE (retour utilisateur : "jamais BTS (2015) mais plutot
      // BTS - 2015") : tiret simple au lieu de parentheses, meme
      // convention que les periodes d'experience (_pdfFormaterPeriode).
      // TACHE (retour utilisateur : "Bac bloque en mode edition, mais CAP
      // Maconnerie modifiable" -- bug reel confirme) : classe titre-item-
      // avec-detail (voir _pdfBlocExperiences plus haut, meme correctif)
      // -- sans elle, une formation AVEC missions perdait l'edition de son
      // titre entier, alors qu'une formation SANS mission restait editable.
      '<strong class="titre-item-avec-detail">' + titreHtml + (f.annee ? ' - ' + _pdfSpanStylePartie(f.annee, styleDates) : '') + '</strong>' +
      _pdfLignesMissions(f.missions) +
      '</div>';
  }).join('');
  return '<div class="rubrique">' + _pdfTitreH2('formations', 'Formations', iconesActives) + items + '</div>';
}

// `styleCompetences` (defaut 'pastille') : port du retour utilisateur
// ("pastille, rectangle ou juste du texte, + couleurs separees fond/texte")
// -- 'texte' n'a pas de fond du tout, jamais un cas particulier de
// 'rectangle' avec un rayon a 0 (rendu radicalement different : puces
// separees par ' • ', un seul <p>, jamais un <span> par competence).
// `titre`/`icone` (defaut 'Compétences'/'🛠️') : port de la separation
// Projet XXL (professionnelles/comportementales, cvPdfDonnees.js) --
// meme fabricant de rendu pour les 2 blocs, jamais 2 fonctions dupliquees.
function _pdfBlocCompetences(competences, iconesActives, styleCompetences, titre, icone) {
  if (!competences || !competences.length) { return ''; }
  var style = styleCompetences || 'pastille';
  var puces;
  if (style === 'texte') {
    puces = '<p class="texte-competences">' + competences.map(function (c) { return _pdfEscaperHtml(c); }).join(' • ') + '</p>';
  } else if (style === 'barre') {
    // TACHE (chantier "10 nouveaux modeles Créatif", modele "Losange &
    // bandeau vert") : AUCUNE donnee de niveau reelle n'existe nulle part
    // pour les competences (juste un tableau de libelles, voir
    // docs/SCHEMA_CV.md) -- une barre a longueur VARIABLE inventerait donc
    // un faux niveau de maitrise jamais declare par la personne (meme
    // categorie de probleme que les etoiles interdites pour les langues,
    // voir memoire [[project_regle_niveau_langue_texte]]). Barre PLEINE
    // largeur uniforme sur toutes les competences -- purement decorative
    // (un simple soulignement epais colore), jamais une fausse mesure.
    puces = '<div class="liste-barres-competences">' + competences.map(function (c) {
      return '<div class="barre-competence"><span>' + _pdfEscaperHtml(c) + '</span><div class="barre-trait"></div></div>';
    }).join('') + '</div>';
  } else {
    var classeStyle = style === 'rectangle' ? ' style-rectangle' : '';
    // TACHE (retour utilisateur, bug reel confirme : "les competences sont
    // dans la continuite du titre, normalement c'est comme les centres
    // d'interet plus bas") : les pastilles etaient des <span> juts a la
    // suite du <h2>, sans wrapper -- invisible la plupart du temps (le h2
    // est block par defaut, force donc un retour a la ligne tout seul),
    // MAIS des que "Titres de rubrique" = Bandeau (h2 en display:inline-block,
    // .style-titres-bandeau .rubrique h2), plus rien ne separe les 2 :
    // les pastilles continuaient sur la MEME ligne que le badge du titre.
    // <div> englobant (toujours block, quel que soit le style du h2 qui
    // precede) : force desormais le retour a la ligne dans tous les cas,
    // comme .item pour les autres rubriques (formations, loisirs...).
    puces = '<div class="liste-puces-competences">' + competences.map(function (c) {
      return '<span class="puce-competence' + classeStyle + '">' + _pdfEscaperHtml(c) + '</span>';
    }).join('') + '</div>';
  }
  return '<div class="rubrique">' + _pdfTitreH2(icone || 'competences', titre || 'Compétences', iconesActives) + puces + '</div>';
}

function _pdfBlocLangues(langues, iconesActives) {
  if (!langues || !langues.length) { return ''; }
  var items = langues.map(function (l) {
    return '<div class="item">' + _pdfEscaperHtml(l.langue) + (l.niveau ? ' - niveau ' + _pdfEscaperHtml(l.niveau) : '') + '</div>';
  }).join('');
  return '<div class="rubrique">' + _pdfTitreH2('langues', 'Langues', iconesActives) + items + '</div>';
}

function _pdfBlocListeSimple(titre, items, icone, iconesActives) {
  if (!items || !items.length) { return ''; }
  var lignes = items.map(function (texte) {
    return '<div class="item">' + _pdfEscaperHtml(texte) + '</div>';
  }).join('');
  return '<div class="rubrique">' + _pdfTitreH2(icone, titre, iconesActives) + lignes + '</div>';
}

// Port de composeurRender.js:_texteEngagement, etendu au format
// {intitule, detail} de contenuRetenu.experiencesPersonnelles (exclusif
// Projet XXL, fusionne avec "engagements" dans le meme bloc "Experience
// personnelle" cote cvPdfDonnees.js -- meme bloc que le Word Projet XXL).
// contenu.engagements peut aussi contenir des objets {texte, missions,
// retenuMiseEnAvant} (produits par appliquerMoteurDecisionCV, js/app.js) ;
// sans cette normalisation, _pdfEscaperHtml afficherait l'objet brut
// ("[object Object]").
// TACHE (retour utilisateur, bug reel trouve : "il manque les lignes de
// mission pour Expérience personnelle -- juste bricolage, bénévolat
// associatif") : port de _pdfBlocExperiences (missions via
// _pdfLignesMissions, deja utilisee pour les experiences pro) -- couvre
// les 2 formes fusionnees par cvPdfDonnees.js : experiencesPersonnelles
// ({intitule, detail, dateDebut, dateFin, missions}, module manuel/
// catalogue) ET engagements (chaine simple, ou objet {texte, missions}
// quand l'IA "met en avant" -- js/app.js:13187-13201, memes champs).
function _pdfBlocExperiencePersonnelle(items, iconesActives, styleMissions, styleParties) {
  if (!items || !items.length) { return ''; }
  var stylePoste = styleParties && styleParties.poste;
  var styleDates = styleParties && styleParties.dates;
  var htmlItems = items.map(function (item) {
    if (typeof item === 'string') { return '<div class="item">' + _pdfEscaperHtml(item) + '</div>'; }
    var titre = (item && item.intitule) || (item && item.texte) || '';
    var periode = _pdfFormaterPeriode(item && item.dateDebut, item && item.dateFin);
    var detail = (item && item.detail) || '';
    // TACHE (retour utilisateur : "Carrelage : 2017-2022", pas de
    // parentheses) : meme convention deux-points que _pdfBlocExperiences.
    // TACHE (retour utilisateur : "souligner... pour l'experience
    // personnelle aussi") : pas d'equivalent "entreprise" ici (jamais
    // invente), seuls poste/dates s'appliquent -- memes 3 reglages
    // globaux que les experiences pro/formations, styleEntreprise
    // simplement inutilise pour cette rubrique.
    // TACHE (retour utilisateur : titre bloque en mode edition des qu'il y
    // a un detail/des missions -- bug reel confirme, meme correctif que
    // _pdfBlocExperiences/_pdfBlocFormations) : classe titre-item-avec-detail.
    return '<div class="item">' +
      '<strong class="titre-item-avec-detail">' + _pdfSpanStylePartie(titre, stylePoste) + (periode ? ' : ' + _pdfSpanStylePartie(periode, styleDates) : '') + '</strong>' +
      (detail ? '<div class="ligne-mission">' + _pdfEscaperHtml(detail) + '</div>' : '') +
      _pdfRenduMissions(item && item.missions, styleMissions) +
      '</div>';
  }).join('');
  return '<div class="rubrique">' + _pdfTitreH2('engagements', 'Expérience personnelle', iconesActives) + htmlItems + '</div>';
}

// Port de composeurRender.js:_premiereMajuscule -- ne touche que la 1ere
// lettre de chaque segment (jamais un sigle deja correct, ex. "VTT").
function _pdfPremiereMajuscule(texte) {
  if (!texte) { return texte; }
  return texte.split(', ').map(function (segment) {
    return segment ? (segment.charAt(0).toUpperCase() + segment.slice(1)) : segment;
  }).join(', ');
}
// TACHE (retour utilisateur : "pour la ville, que la 1ere lettre en
// majuscule, les autres en minuscule") : DISTINCT de _pdfPremiereMajuscule
// ci-dessus (qui ne touche jamais le reste du mot, pense pour les sigles) --
// ici la ville est le plus souvent saisie tout en majuscules (ex.
// "BEAUPOUYET"), il faut donc explicitement rabaisser le reste, pas
// seulement capitaliser un 1er caractere deja majuscule.
function _pdfFormaterVille(texte) {
  return texte ? (texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase()) : texte;
}

// Fabrique un HTML par rubrique "supportee" -- cle = meme nom que
// composition.strategieCV.ordreRubriques (composeurComposition.js), pour
// pouvoir reprendre TEL QUEL l'ordre decide par le moteur partage, jamais
// un ordre invente ici.
// TACHE (retour utilisateur : "compétences professionnelles et
// comportementales séparées, comme le Word Projet XXL") : `competences`
// consomme desormais competencesProfessionnelles (deja separee/plafonnee
// par cvPdfDonnees.js, plus contenu.competences qui reste la fusion des 3
// listes -- jamais utilisee ici) ; `competencesComportementales` est une
// rubrique nouvelle, meme fabricant de rendu (_pdfBlocCompetences), items
// {competence: texte} -- .competence extrait avant affichage, jamais un
// objet brut passe a _pdfEscaperHtml (meme piege que le bug engagements).
// TACHE (retour utilisateur : "en Word il n'y a pas de rubrique Profil,
// je veux le titre de poste vise et juste en dessous la phrase
// d'accroche") : port EXACT de construireBlocObjectif (composeurRender.js,
// Projet XXL) -- l'accroche (objetCV.profil) n'est JAMAIS une rubrique du
// corps pour ce theme, elle vit uniquement dans l'en-tete, juste sous le
// metier vise (voir _pdfConstruireStyleEtPage plus bas, innerMetier).
// Plus de fabricant 'profil' ici -- supprime le doublon "titre Profil"
// que le PDF affichait a tort (jamais present cote Word Projet XXL).
function _pdfFabricantsRubriques(contenu, iconesActives, experiencesCompact, styleCompetences, competencesProfessionnelles, competencesComportementales, resoudreStylePuce, styleProfessionnel, stylePersonnel, formatExperiences, styleParties) {
  // TACHE (retour utilisateur : "cliquer sur les competences pour choisir
  // pastille/rectangle/texte juste pour CETTE rubrique") : `resoudreStylePuce`
  // (optionnel, voir _pdfStylePuceEffectif plus haut) retombe sur le
  // reglage global si absent -- jamais un 2e defaut duplique ici.
  var resoudre = resoudreStylePuce || function () { return styleCompetences; };
  return {
    experiences: function () { return _pdfBlocExperiences(contenu.experiences, iconesActives, experiencesCompact, styleProfessionnel, formatExperiences, styleParties); },
    formations: function () { return _pdfBlocFormations(contenu.formations, iconesActives, styleParties); },
    competences: function () { return _pdfBlocCompetences(competencesProfessionnelles, iconesActives, resoudre('competences'), 'Compétences professionnelles', 'competences'); },
    competencesComportementales: function () {
      return _pdfBlocCompetences((competencesComportementales || []).map(function (c) { return (typeof c === 'string') ? c : ((c && c.competence) || ''); }), iconesActives, resoudre('competencesComportementales'), 'Compétences comportementales', 'competencesComportementales');
    },
    langues: function () { return _pdfBlocLangues(contenu.langues, iconesActives); },
    // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
    // dossier.logiciels (Excel, Canva...) n'apparaissait sur aucun CV. Rendu
    // « liste simple » (comme certifications) -- rien affiché si la liste est
    // vide (_pdfBlocListeSimple retourne '' -> filtré par fabricants[r] plus
    // bas). Icône réutilisée ('competences'), jamais un pictogramme dessiné.
    logiciels: function () { return _pdfBlocListeSimple('Logiciels et outils', contenu.logiciels, 'competences', iconesActives); },
    // TACHE (retour utilisateur : "centre d'interet, experience perso et
    // certifications sont liees, je veux les separer") : 3 rubriques
    // INDEPENDANTES (chacune son propre bloc glissable), la ou le Word/le
    // moteur partage les traite comme un seul groupe "loisirsEngagements"
    // (composition.strategieCV.ordreRubriques) -- l'eclatement se fait
    // plus bas, au moment de consommer cet ordre (_pdfEtendreOrdreRubriques),
    // jamais une redecision de contenu ici (les 3 restent identiques a
    // avant, juste rendues separement).
    loisirs: function () { return _pdfBlocListeSimple('Centres d\'intérêt', (contenu.loisirs || []).map(_pdfPremiereMajuscule), 'loisirs', iconesActives); },
    engagements: function () {
      var itemsExperiencePerso = (contenu.experiencesPersonnelles || []).concat(contenu.engagements || []);
      return _pdfBlocExperiencePersonnelle(itemsExperiencePerso, iconesActives, stylePersonnel, styleParties);
    },
    certifications: function () { return _pdfBlocListeSimple('Certifications', contenu.certifications, 'certifications', iconesActives); }
  };
}

// TACHE (retour utilisateur : separer loisirs/engagements/certifications) :
// composition.strategieCV.ordreRubriques (moteur partage avec le Word) ne
// connait qu'UN seul emplacement "loisirsEngagements" -- eclate ici en 3
// cles independantes, INSEREES A LA MEME POSITION (jamais deplacees
// ailleurs dans l'ordre global), pour que le reste du fichier (filtre par
// fabricants[], garde-fou, enveloppe glisser-depose) n'ait besoin de
// connaitre qu'une liste de cles "a plat", plus jamais ce cas group).
function _pdfEtendreOrdreRubriques(ordre) {
  var etendu = [];
  ordre.forEach(function (r) {
    if (r === 'loisirsEngagements') { etendu.push('loisirs', 'engagements', 'certifications'); }
    else { etendu.push(r); }
  });
  return etendu;
}

// TACHE ("Mise en page", agrandissement par rubrique) : formules de taille
// EXTRAITES ici (identiques a celles utilisees jusque-la en dur dans
// _pdfConstruireStyleEtPage) pour etre reutilisees a la fois par le CSS
// GLOBAL (echelle = echelleContenu) et par les surcharges CSS PAR
// RUBRIQUE (echelle = echelleContenu * echelleRubrique[cle], voir plus
// bas) -- jamais 2 formules paralleles a maintenir en cas d'ajustement.
// TACHE (retour utilisateur : "la police du CV, minimum 11, pas moins,
// sinon ce n'est pas confortable -- les variations entre 9 et 14") : base
// du corps de texte 11.5px -> 11px pile (echelle=1, curseur "Taille du
// texte" au milieu de sa nouvelle plage 9-14, voir cvPdfPanneauReglages.js
// -- min/max du curseur convertis en echelle la-bas : 9/11 et 14/11).
// Titres/puces/marges restent des MULTIPLES de ce meme echelle, jamais
// une 2e base a maintenir en parallele.
// TACHE (retour utilisateur, bug reel confirme en testant l'extreme
// combine -- curseur global au max (14px) + boost par rubrique au max
// (140%) : "le boost au max, ca fait la police 14 ? il ne faut pas se
// retrouver avec un titre de rubrique plus petit que le contenu") :
// tailleTitreRubrique croissait deliberement MOINS vite que le contenu
// (echelleTitres, coefficient 0.5 -- un titre n'a pas besoin de grossir
// aussi vite, deja distinct par sa couleur/soulignement) -- mais aux DEUX
// echelles cumulees (curseur global x boost rubrique, multiplicatif),
// cet ecart s'inversait : mesure reelle, titre 18.08px < contenu
// (tailleItemStrong) 19.6px -- exactement le defaut redoute. Filet de
// securite : le titre ne descend JAMAIS sous 108% du plus grand texte de
// contenu (tailleItemStrong), quelle que soit la combinaison d'echelles.
// TACHE (retour utilisateur : "le Word remplit la page automatiquement,
// je veux le meme ressenti cote PDF") : echelleEspacement (optionnel,
// defaut = echelle) permet de faire grandir l'ESPACEMENT (margeRubrique/
// margeItem) plus vite que la POLICE -- meme decouplage que le Word
// (composeurComposition.js : taillePoliceCorps et espacementExtra sont 2
// leviers INDEPENDANTS), voir l'appel plus bas qui les derive tous les 2
// de `composition`.
function _pdfCalculerTaillesRubrique(echelle, echelleEspacement) {
  if (echelleEspacement === undefined) { echelleEspacement = echelle; }
  var echelleTitres = 1 + (echelle - 1) * 0.5;
  var itemStrongPx = 12 * echelle;
  var titreRubriquePx = Math.max(13 * echelleTitres, itemStrongPx * 1.08);
  return {
    tailleItem: (11 * echelle).toFixed(2) + 'px',
    tailleItemStrong: itemStrongPx.toFixed(2) + 'px',
    tailleTitreRubrique: titreRubriquePx.toFixed(2) + 'px',
    tailleCompetence: (10.5 * echelle).toFixed(2) + 'px',
    margeRubrique: Math.round(16 * echelleEspacement) + 'px',
    margeItem: Math.round(6 * echelleEspacement) + 'px'
  };
}

// TACHE (glisser-deposer des rubriques) : enveloppe le HTML d'UNE rubrique
// dans un conteneur portant `data-rubrique` (identifiant lu par le
// panneau, cvPdfPanneauReglages.js, pour reconnaitre quel bloc a ete
// glisse) et `draggable="true"`. Le conteneur n'ajoute aucun style propre
// (`.groupe-rubrique` ci-dessous est vide) : les marges/espacements
// existants des .rubrique internes restent inchanges.
function _pdfEnvelopperRubriqueDrag(html, cle) {
  if (!html) { return ''; }
  return '<div class="groupe-rubrique" draggable="true" data-rubrique="' + cle + '">' + html + '</div>';
}

// TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
// 'logiciels' inséré après les 2 blocs de compétences, avant 'langues' --
// même position que dans les stratégies (composeurStrategies.js). Ce repli
// ne sert que quand aucune stratégie n'a été calculée (appel isolé/test) ET
// pour le garde-fou "rubrique gérée mais absente de l'ordre" (voir plus bas).
var _PDF_ORDRE_RUBRIQUES_PAR_DEFAUT = ['experiences', 'formations', 'competences', 'competencesComportementales', 'logiciels', 'langues', 'loisirs', 'engagements', 'certifications'];

// Port du Word (theme.police) : un seul choix applique a la fois aux
// titres et au corps (les themes de base du Word utilisent deja la meme
// police pour les deux -- jamais une distinction inventee ici qui
// n'existe pas cote Word). Polices systeme uniquement (aucune police
// externe chargee) : l'appli n'a pas de serveur, un CV doit rester
// generable et imprimable hors ligne.
// TACHE (retour utilisateur : "en rajouter parmi les styles les plus
// utilises + une ecriture plus artistique") : ajout de choix courants
// (Arial/Calibri/Times New Roman/Tahoma/Trebuchet MS/Book Antiqua, tous
// preinstalles Windows/Mac, jamais telecharges) + UNE option decorative
// ("artistique", police script) -- reservee a un usage ponctuel (accroche/
// nom), jamais recommandee pour le corps d'un CV professionnel, mais le
// choix reste a la personne. Chaque valeur est deja une PILE de secours
// (plusieurs polices separees par virgule) : si la police preferee est
// absente du systeme d'impression, le navigateur retombe sur la suivante,
// jamais un CV avec du texte manquant.
var _PDF_POLICES = {
  segoe: '"Segoe UI", Arial, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  verdana: 'Verdana, Geneva, sans-serif',
  garamond: '"Garamond", "Times New Roman", serif',
  arial: 'Arial, Helvetica, sans-serif',
  calibri: '"Calibri", "Trebuchet MS", sans-serif',
  times: '"Times New Roman", Times, serif',
  tahoma: 'Tahoma, Geneva, sans-serif',
  trebuchet: '"Trebuchet MS", sans-serif',
  palatino: '"Book Antiqua", "Palatino Linotype", Palatino, serif',
  artistique: '"Segoe Script", "Brush Script MT", cursive'
};

// Construit { css, pageHtml } -- le coeur du rendu, REUTILISE a la fois
// par construireHtmlPdfA4() (export/impression statique) et par le
// panneau de reglages interactif (cvPdfPanneauReglages.js, qui rappelle
// cette fonction a chaque changement de reglage, jamais une 2e logique
// de rendu ecrite pour l'aperçu live). `options` (toutes optionnelles,
// valeurs par defaut = premier modele demo valide avec l'utilisateur) :
//   colonnes: 1 | 2 (defaut 2)
//   fondColonnes: 'aucun' | 'gauche' | 'droite' | 'lesDeux' (defaut 'droite' -- cote VISUEL reel, apres colonnesInversees)
//   degradeColonnes: 'aucun' | 'fonce-clair' | 'clair-fonce' (defaut 'fonce-clair')
//   bandeauEnTete: bool (defaut true)
//   degradeBandeau: 'aucun' | 'fonce-clair' | 'clair-fonce' (defaut 'fonce-clair')
//   couleurDebut / couleurFin: couleurs du degrade (defaut bleu du prototype valide)
//   styleTitres: 'souligne' | 'bandeau' | 'aucun' (defaut 'souligne') --
//     'aucun' (retour utilisateur : "la possibilite de souligner ou pas
//     le titre des rubriques") retire le trait bas SANS ajouter le fond
//     colore de 'bandeau' -- juste le texte du titre, aucune decoration.
//   lectureGuidee: bool (defaut false) -- port de l'intention de "Lecture
//     guidee" (Projet XXL, Word) : le nom rejoint la couleur accent + les
//     majuscules deja utilisees (inconditionnellement) par le metier vise
//     et les titres de rubrique, pour que les 3 se lisent comme un seul
//     fil visuel. Ignore automatiquement si bandeauEnTete est colore
//     (le nom suit alors deja la couleur de lisibilite du fond).
//   styleBordures: 'fine' | 'epaisse' (defaut 'fine')
//   iconesRubriques: bool (defaut false) -- pictogrammes devant les titres
//     de rubrique (Expérience, Formations...)
//   iconesCoordonnees: bool (defaut false) -- pictogrammes devant email/
//     téléphone/ville/permis, INDEPENDANT de iconesRubriques (2 reglages
//     distincts, meme famille visuelle -- voir _PDF_ICONES_SVG plus haut)
//   separateurColonnes: bool (defaut false, ignore si colonnes=1)
//   colonnesInversees: bool (defaut false)
//   bandeauDisponibilite: bool (defaut false -- DOIT correspondre a la
//     valeur deja utilisee pour construire `composition`, voir en-tete)
//   police: 'segoe' | 'georgia' | 'verdana' | 'garamond' (defaut 'segoe')
//   texteFondColonnes: 'blanc' | 'noir' (defaut 'blanc' -- couleur du
//     texte sur TOUT fond colore : bandeau en-tete, colonne en degrade,
//     titres en bandeau -- a choisir 'noir' si une couleur claire rend
//     le blanc illisible, meme principe que le Word)
//   fondColonnesEffet: 'fondSeul' | 'titres' (defaut 'fondSeul') -- port
//     du Word : 'fondSeul' remplit tout le fond de la/les colonne(s)
//     designee(s) par fondColonnes (comportement actuel) ; 'titres' ne
//     colore QUE les titres de rubrique de cette/ces colonne(s), fond
//     blanc conserve -- variante plus legere, independante du reglage
//     GLOBAL styleTitres (qui colore TOUS les titres, partout).
//   bandeauCompetencesCles: bool (defaut false) -- port du Word
//     (COMPOSEUR_REGLE_R006, deja calculee par cvPdfDonnees.js dans
//     `options.competencesCles`, jamais recalculee ici) : affiche un
//     bandeau plein-largeur sous l'en-tete au lieu de la rubrique
//     "Compétences" habituelle (jamais les deux a la fois, jamais un
//     doublon de contenu).
//   competencesCles: string[] -- fourni par l'appelant (cvPdfDonnees.js),
//     utilise uniquement si bandeauCompetencesCles est actif.
//   echelleContenu: nombre, 0.75 a 1.15 (defaut 1) -- port du Word
//     ("Mise en page"/ajustement automatique), mais implemente ICI par un
//     simple facteur d'echelle applique aux tailles de police et aux
//     espacements du CORPS (jamais l'en-tete, jamais une re-decision de
//     contenu) : contrairement au Word (qui ne peut qu'ESTIMER un nombre
//     de lignes, docx.js ne mesurant jamais le rendu reel), le panneau
//     interactif (cvPdfPanneauReglages.js) mesure la VRAIE hauteur DOM de
//     `.page-a4` et ajuste ce facteur iterativement jusqu'a tenir sur
//     1 page (ou remplir une page trop vide) -- voir _pdfAjusterMiseEnPage()
//     la-bas. Ce fichier ne fait qu'appliquer le facteur deja decide,
//     jamais la mesure elle-meme (separation des responsabilites).
//   formeEnTete: 'rectangle' | 'diagonale' (defaut 'rectangle') -- port de
//     la vraie promesse de depart de ce chantier (formes impossibles en
//     docx.js, PresetGeometry fige sur "rect") : 'diagonale' coupe le bas
//     du bandeau en-tete par un clip-path oblique au lieu d'un bord droit.
//     Ignore si bandeauEnTete est desactive (rien a decouper sans fond).
//   formeColonnes: 'rectangle' | 'diagonale' | 'vague' (defaut 'rectangle') --
//     meme mecanique clip-path que formeEnTete, appliquee cette fois au bord
//     INTERIEUR (cote qui fait face a l'autre colonne) de la/les colonne(s)
//     qui portent un fond plein (fondColonnes + fondColonnesEffet
//     'fondSeul' + degradeColonnes actif -- memes conditions que la classe
//     'degrade-actif' plus bas, jamais une 2e condition inventee). Ignore
//     si colonnes=1 (pas de bord interieur sans 2e colonne) ou si la
//     colonne concernee n'a pas de fond plein (rien a decouper). 'vague'
//     (chantier "CV Créatif") : meme principe que 'diagonale' mais un
//     clip-path a plusieurs points (2 renflements) au lieu d'une seule
//     ligne oblique -- voir .colonne-vague-droite/.colonne-vague-gauche
//     plus bas, jamais une 3e forme inventee au-dela de ces 2.
//   pilluleExperiences: bool (defaut false) -- chantier "CV Créatif" :
//     habille la ligne titre+date de formatExperiences='ameliore' (voir
//     plus bas) d'un fond plein arrondi en pilule au lieu d'un texte nu.
//     Ignore si formatExperiences n'est pas 'ameliore' (rien a habiller,
//     la ligne titre+date dediee n'existe pas dans les 2 autres formats).
//   policesRubriques: { cle: idPolice } (defaut {}) -- port du retour
//     utilisateur ("le corps de texte de la rubrique, meme police ou une
//     autre au choix"), regle via la mini-barre flottante (clic sur une
//     rubrique). idPolice = une des cles de _PDF_POLICES. Absence de cle
//     = suit la police globale (`police` ci-dessous), comportement inchange.
//   ordrePersonnalise: { gauche: string[], droite: string[] } (defaut
//     absent/null -- ordre AUTOMATIQUE, decide par composition.strategieCV,
//     inchange) -- port du glisser-deposer des rubriques (panneau
//     interactif, cvPdfPanneauReglages.js) : quand present, REMPLACE
//     entierement la repartition automatique (alternee + colonnesInversees)
//     par ces 2 listes explicites de cles de rubrique (memes cles que
//     _PDF_ORDRE_RUBRIQUES_PAR_DEFAUT). colonnesInversees est alors
//     ignore (les 2 colonnes sont deja explicites, rien a inverser).
//     Etat gere entierement cote panneau (jamais recalcule/valide ici) :
//     une cle absente des 2 listes ne s'affiche simplement pas -- l'appelant
//     (cvPdfPanneauReglages.js) est responsable de ne jamais en perdre.
//   largeurColonneGauche: nombre, 30 a 70 (defaut 50) -- largeur de la
//     colonne PHYSIQUEMENT gauche en pourcentage du corps (la droite prend
//     le reste, jamais les 2 pilotees independamment -- eviterait tout
//     desequilibre style "50%+50% ne fait pas 100%"). Ignore si colonnes=1
//     (aucune 2e colonne a mettre en rapport).
//   styleCompetences: 'pastille' | 'rectangle' | 'texte' (defaut 'pastille')
//     -- port du retour utilisateur : 'texte' n'a aucun fond (puces
//     separees par ' • ', jamais un rectangle a rayon 0).
//   couleurFondCompetences: couleur du fond des puces (defaut '#e9e9e9')
//     -- ignore en styleCompetences='texte' (aucun fond dans ce style).
//   couleurTextePuces: couleur du texte des competences (defaut '#1b1b1b'),
//     s'applique dans les 3 styles. Les 2 couleurs restent ECRASEES sur une
//     colonne en degrade (meme filet de securite contraste que le reste du
//     theme, voir .colonne.degrade-actif plus bas -- jamais illisible).
//   anneauPhoto: bool (defaut false) -- anneau colore decale ("halo") en
//     fond de la photo circulaire, un peu plus grand qu'elle et offset en
//     bas a droite. Ignore si aucune photo. Couleur : var(--texte-fond)
//     (meme variable que les autres textes sur fond colore) si l'en-tete
//     est en bandeau, sinon var(--degrade-debut) -- jamais une 3e couleur
//     inventee, toujours les memes variables que le reste du theme.
//   coinsArrondis: bool (defaut false) -- arrondit les coins des colonnes
//     (rayon plus prononce que le leger 6px de base, toujours applique) et
//     des bandeaux plein-largeur lies a l'en-tete (bandeau principal,
//     bandeau de disponibilite, bandeau de competences cles). Ignore sur
//     l'en-tete si bandeauEnTete est desactive (rien a arrondir sans fond)
//     ou si formeEnTete='diagonale' (le clip-path de la diagonale prime
//     deja sur tout border-radius, combiner les deux ne changerait rien
//     visuellement -- jamais 2 formes en meme temps sur le meme element).
// TACHE (retour utilisateur : "A4 Detaille + choix A5 dans Mise en page,
// ca porte a confusion, il ne faut pas melanger A4 et A5") : l'ancien
// reglage `taillePage` (retirer un contenu A4 sur une page A5 PHYSIQUE,
// jamais la vraie composition Mini CV A5) est supprime -- il cohabitait
// mal avec le vrai choix "Mini CV A5 Portrait/Paysage" du selecteur
// "Format du CV" (celui-la route vers cvPdfTemplateA5.js, composition
// dediee composeurComposerA5Portrait()). Ce template reste desormais
// TOUJOURS en page A4 physique (210x297mm) -- l'A5 n'existe plus que via
// le vrai moteur A5, jamais un melange des deux.
function _pdfConstruireStyleEtPage(objetCV, composition, options) {
  var opts = options || {};
  var colonnes = opts.colonnes || 2;
  var formeEnTete = opts.formeEnTete || 'rectangle';
  var formeColonnes = opts.formeColonnes || 'rectangle';
  var anneauPhoto = !!opts.anneauPhoto;
  // TACHE (chantier "10 nouveaux modeles Créatif") : nouveaux champs
  // partages par plusieurs des nouvelles recettes, meme patron que les
  // champs existants juste au-dessus -- jamais une logique a part par
  // modele, toujours un champ generique reutilisable par d'autres futurs
  // modeles.
  var photoForme = opts.photoForme || 'rond';
  var blocsCompetencesEncadres = !!opts.blocsCompetencesEncadres;
  var cadrePage = !!opts.cadrePage;
  var enteteCentree = !!opts.enteteCentree;
  var nomVertical = !!opts.nomVertical;
  // TACHE (chantier "2 nouveaux modeles Créatif", modeles "Pastille"/
  // "Médaillon") : memes 2 nouveaux champs partages, meme patron exact que
  // les 5 juste au-dessus -- aucun controle DOM dedie (jamais exposes au
  // panneau), donc toujours forces par la recette (voir _pdfLireOptions).
  var filetHaut = !!opts.filetHaut;
  var photoMedaillon = !!opts.photoMedaillon;
  var coinsArrondis = !!opts.coinsArrondis;
  var radiusColonne = coinsArrondis ? '14px' : '6px';
  var largeurColonneGaucheBrute = parseInt(opts.largeurColonneGauche, 10);
  var largeurColonneGauche = isNaN(largeurColonneGaucheBrute) ? 50 : Math.min(70, Math.max(30, largeurColonneGaucheBrute));
  var largeurPage = '210mm';
  var hauteurPage = '297mm';
  var fondColonnes = opts.fondColonnes || 'droite';
  var degradeColonnes = opts.degradeColonnes || 'fonce-clair';
  var fondColonnesEffet = opts.fondColonnesEffet || 'fondSeul';
  var bandeauEnTete = opts.bandeauEnTete !== undefined ? opts.bandeauEnTete : true;
  // TACHE (retour utilisateur : "le fond de colonne, sa couleur, remonter
  // jusqu'en haut de la page -- pouvoir mettre coordonnees/photo dessus")
  // : bande verticale INDEPENDANTE du "fond de colonne" habituel (limite
  // au corps), qui s'etend elle du haut de la PAGE jusqu'en bas. Choix
  // explicite de l'utilisateur (voir echange precedent) : mutuellement
  // exclusive avec le bandeau d'en-tete colore (bandeauEnTete) -- calculer
  // ou positionner un espace fiable entre les 2 est impossible sans
  // connaitre a l'avance la hauteur reelle de l'en-tete (mise en page "au
  // fil du texte", jamais mesuree a la generation du HTML/CSS) -- "pas
  // d'effet si le bandeau est actif" plutot qu'un calcul fragile.
  var fondColonnePleineHauteur = !!opts.fondColonnePleineHauteur;
  var degradeBandeau = opts.degradeBandeau || 'fonce-clair';
  var couleurDebut = opts.couleurDebut || '#2f6690';
  var couleurFin = opts.couleurFin || '#d9e8f2';
  var styleTitres = opts.styleTitres || 'souligne';
  var styleBordures = opts.styleBordures || 'fine';
  var iconesRubriques = !!opts.iconesRubriques;
  var iconesCoordonnees = !!opts.iconesCoordonnees;
  var separateurColonnes = !!opts.separateurColonnes && colonnes === 2;
  var colonnesInversees = !!opts.colonnesInversees;
  var ordrePersonnalise = opts.ordrePersonnalise || null;
  // TACHE (retour utilisateur, bug reel confirme : "Experience
  // professionnelle toujours seule dans sa colonne") : { cle: 'gauche'|
  // 'droite' } -- rubriques deplacees par le mecanisme de reequilibrage
  // automatique (_pdfEssayerRequilibrageColonnes, cvPdfPanneauReglages.js),
  // jamais un choix manuel de la personne (ordrePersonnalise ci-dessus,
  // le glisser-depose, reste prioritaire et desactive completement ce
  // mecanisme -- voir plus bas).
  var rubriquesForceesColonne = opts.rubriquesForceesColonne || {};
  var bandeauDisponibilite = !!opts.bandeauDisponibilite;
  var bandeauCompetencesCles = !!opts.bandeauCompetencesCles;
  var competencesCles = opts.competencesCles || [];
  var police = _PDF_POLICES[opts.police] || _PDF_POLICES.segoe;
  var texteFondNoir = opts.texteFondColonnes === 'noir';
  var texteFond = texteFondNoir ? '#1b1b1b' : '#fff';
  var texteFondAttenue = texteFondNoir ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
  var bordureFondAttenuee = texteFondNoir ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)';
  var couleurFinLisible = _pdfFinDegradeLisible(couleurDebut, couleurFin, texteFondNoir);
  var fondTitreBandeauSurDegrade = texteFondNoir ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.28)';
  var fondPuceSurDegrade = texteFondNoir ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)';
  // TACHE (retour utilisateur : "Sobre ne veut pas dire zero couleur -- une
  // couleur pale, jamais flashy, sur le bandeau OU sur la colonne, jamais
  // les 2") : --fond-accent-debut/fin (voir :root plus bas) sont des
  // variables DEDIEES au remplissage du bandeau/colonne en Sobre -- jamais
  // --degrade-debut/--degrade-fin eux-memes, qui restent la couleur
  // d'accent normale PARTOUT AILLEURS (titres de rubrique, bordures, metier
  // vise...) : Sobre garde deja cet accent-la (voir _pdfLireOptions,
  // cvPdfPanneauReglages.js), seul le remplissage de fond change ici.
  // couleurFin volontairement PROCHE de couleurDebut (meme ratio de
  // melange vers le blanc) : un dégradé entre 2 tons quasi identiques rend
  // visuellement une couleur unie -- seule facon d'obtenir un fond plat
  // avec l'architecture CSS existante (.degrade-actif exige un vrai
  // degrade pour s'appliquer, voir gaucheAvecFondPlein/droiteAvecFondPlein
  // plus bas -- "Couleur unie" (degradeColonnes="aucun") retire la classe
  // entierement, ne rend jamais un fond plat).
  var sobreVariante = opts.sobreActif ? (opts.sobreVariante || 'aucune') : 'aucune';
  var fondAccentDebut = couleurDebut;
  var fondAccentFin = couleurFinLisible;
  if (sobreVariante === 'colonne' || sobreVariante === 'bandeau') {
    fondAccentDebut = _pdfMelangerHex(couleurDebut, '#ffffff', 0.78);
    fondAccentFin = _pdfMelangerHex(couleurFinLisible, '#ffffff', 0.82);
    // Un fond eclairci a ~80% vers le blanc reste TOUJOURS clair, quel que
    // soit l'accent d'origine -- texte fonce systematiquement lisible
    // par-dessus, meme si "Texte foncé/clair" avait ete choisi pour
    // l'accent VIF d'origine (jamais pense pour une teinte pale).
    texteFondNoir = true;
    texteFond = '#1b1b1b';
    texteFondAttenue = 'rgba(0,0,0,0.8)';
    bordureFondAttenuee = 'rgba(0,0,0,0.35)';
    fondTitreBandeauSurDegrade = 'rgba(0,0,0,0.12)';
    fondPuceSurDegrade = 'rgba(0,0,0,0.12)';
  }
  // TACHE ("Mise en page") : le corps (texte/espacements) suit l'echelle,
  // les titres bougent 2x moins vite (garder une hierarchie visuelle
  // stable meme resserre/elargi), l'en-tete ne bouge JAMAIS.
  // TACHE (retour utilisateur : "le Word remplit la page automatiquement
  // si le contenu est leger -- je veux le meme ressenti cote PDF, sans
  // rien reduire du Word") : composition.taillePoliceCorps/espacementExtra
  // (composeurComposition.js) codent DEJA ce mecanisme cote Word (densite
  // "faible" -> police et espacement agrandis ; trop de contenu -> police
  // legerement reduite via optionDebordement) -- jamais lus ici jusque-la,
  // le PDF restait toujours a l'echelle neutre. echelleAuto = ratio par
  // rapport a la meme base que Word (11 -- voir taillePoliceCorps),
  // espacementAuto = espacementExtra tel quel (deja un ratio, 1 =
  // neutre).
  // TACHE (retour utilisateur, bug reel confirme : "espace considerable
  // entre 2 rubriques en PDF -- le Word n'a pas cet ecart aussi
  // important pour le meme CV") : echelleEspacement multipliait par
  // erreur `echelle` (qui contient DEJA echelleAuto, le boost de police)
  // au lieu du seul curseur manuel -- espacementAuto se retrouvait donc
  // compose AVEC echelleAuto (ex. 1.32 x 1.3 ~ 1.7) au lieu de rester
  // INDEPENDANT comme cote Word (taillePoliceCorps et espacementExtra
  // s'appliquent separement, jamais l'un sur l'autre -- voir
  // composeurRender.js). Seul le curseur manuel (opts.echelleContenu)
  // reste partage entre police et espacement -- un vrai "zoom" voulu par
  // la personne doit bien grossir les 2 ensemble, contrairement au boost
  // AUTOMATIQUE qui doit rester decouple.
  var echelleAuto = (composition && composition.taillePoliceCorps) ? (composition.taillePoliceCorps / 11) : 1;
  var espacementAuto = (composition && composition.espacementExtra) || 1;
  var echelleManuelle = opts.echelleContenu || 1;
  var echelle = echelleManuelle * echelleAuto;
  var echelleEspacement = echelleManuelle * espacementAuto;
  var taillesGlobales = _pdfCalculerTaillesRubrique(echelle, echelleEspacement);
  var tailleItem = taillesGlobales.tailleItem;
  var tailleItemStrong = taillesGlobales.tailleItemStrong;
  var tailleTitreRubrique = taillesGlobales.tailleTitreRubrique;
  var tailleCompetence = taillesGlobales.tailleCompetence;
  var margeRubrique = taillesGlobales.margeRubrique;
  var margeItem = taillesGlobales.margeItem;
  // TACHE (retour utilisateur 2026-09-15, bug reel confirme par capture
  // d'ecran : "cette ligne blanche verticale, je ne veux pas la voir") :
  // le "gap" flex entre les 2 <div class="colonne"> laisse apparaitre le
  // fond blanc de la page en dessous -- invisible tant qu'une seule
  // colonne est coloree (fondColonnes 'gauche'/'droite', l'autre colonne
  // est deja blanche, aucun contraste), mais saute aux yeux des que les 2
  // colonnes partagent la MEME couleur (fondColonnes==='lesDeux', que
  // "Style au hasard" peut tirer) : 2 paves colores separes par un
  // liseret blanc, jamais le bloc continu attendu. Gap retire uniquement
  // dans ce cas -- le padding interne de chaque .colonne (14px 16px,
  // inchange) suffit a garder le texte a distance de la jointure.
  var gapCorps = (fondColonnes === 'lesDeux') ? '0px' : Math.round(18 * echelleEspacement) + 'px';
  // TACHE (agrandissement par rubrique) : { cle: echelle } (defaut {}) --
  // port cote panneau (clic sur une rubrique -> mini-barre flottante,
  // cvPdfPanneauReglages.js) d'un agrandissement INDEPENDANT du curseur
  // "Taille du texte" global (echelleContenu ci-dessus) -- les 2 se
  // MULTIPLIENT (une rubrique agrandie a 120% reste 120% plus grande que
  // les autres, meme si le curseur global change ensuite). Genere des
  // regles CSS scopees par attribut [data-rubrique="cle"] (plus bas),
  // jamais une reecriture des fonctions de rendu des rubriques.
  var echellesRubriques = opts.echellesRubriques || {};
  // TACHE (retour utilisateur : "le corps de texte de la rubrique, meme
  // police ou une autre au choix") : { cle: idPolice } (defaut {}) --
  // meme convention que echellesRubriques ci-dessus (port cote panneau,
  // clic sur une rubrique -> mini-barre flottante), mais pour la POLICE :
  // contrairement a la taille (qui doit cibler chaque classe de texte
  // individuellement, la police s'HERITE naturellement en CSS -- une
  // seule regle `font-family` sur le conteneur .groupe-rubrique suffit a
  // couvrir titre ET contenu de cette rubrique (plus bas, meme boucle de
  // generation CSS scopee par [data-rubrique="cle"]).
  var policesRubriques = opts.policesRubriques || {};
  // TACHE (retour utilisateur : "pastille, rectangle ou juste du texte,
  // + couleurs separees fond/texte") : 'pastille' (defaut, comportement
  // inchange) | 'rectangle' | 'texte'. couleurFondCompetences ignore en
  // 'texte' (aucun fond dans ce style). Les 2 couleurs restent malgre tout
  // ECRASEES sur une colonne en degrade (.colonne.degrade-actif plus bas,
  // meme filet de securite contraste deja en place pour le reste du theme
  // -- jamais une couleur illisible sur fond colore, meme mal choisie ici).
  var styleCompetences = opts.styleCompetences || 'pastille';
  var couleurFondCompetences = opts.couleurFondCompetences || '#e9e9e9';
  var couleurTextePuces = opts.couleurTextePuces || '#1b1b1b';
  // TACHE (retour utilisateur : "cliquer sur les competences/bandeau
  // coordonnees pour choisir pastille/rectangle/texte + couleurs juste
  // pour CETTE rubrique") : override par rubrique (cle -> {style,
  // couleurFond, couleurTexte}), pilote depuis la mini-barre flottante
  // (cvPdfPanneauReglages.js) -- vide = suit le reglage global ci-dessus,
  // jamais une 2e source de verite pour le style/couleurs par defaut.
  var stylesPuceRubriques = opts.stylesPuceRubriques || {};
  function _pdfStylePuceEffectif(cle) {
    var o = stylesPuceRubriques[cle];
    return (o && o.style) || styleCompetences;
  }
  // TACHE (retour utilisateur : "cliquer sur le nom/metier/texte de
  // profil pour l'agrandir, lui mettre la couleur, changer la police,
  // changer le style") : override par bloc d'en-tete (cle -> {couleur,
  // gras, italique}), pilote depuis la MEME mini-barre flottante que la
  // taille/police (cvPdfPanneauReglages.js) -- vide = style par defaut du
  // theme (couleur heritee, jamais gras/italique impose).
  var stylesTexteEntete = opts.stylesTexteEntete || {};

  var identite = objetCV.identite || {};
  var permis = objetCV.permis || {};
  var contenu = (composition && composition.contenuRetenu) || {};
  // TACHE (retour utilisateur : "je veux pouvoir choisir l'ordre
  // d'affichage, par date ou par poste") : "pertinence" (defaut) ne trie
  // PAS -- garde l'ordre deja decide par le moteur partage (deja la
  // reponse a "mettre en avant une experience pertinente meme si pas la
  // plus recente"). Copie de `contenu` (jamais de mutation de
  // composition.contenuRetenu, reutilise tel quel par d'autres appelants,
  // ex. l'ajustement automatique de mise en page qui mesure le nombre de
  // lignes).
  var ordreExperiences = opts.ordreExperiences || 'pertinence';
  if (contenu.experiences && contenu.experiences.length && ordreExperiences !== 'pertinence') {
    var experiencesTriees = contenu.experiences.slice();
    var _pdfCleDateExperience = function (e) { return (e && (e.dateDebut || e.dateFin)) || ''; };
    if (ordreExperiences === 'date-desc') { experiencesTriees.sort(function (a, b) { return _pdfCleDateExperience(b).localeCompare(_pdfCleDateExperience(a)); }); }
    else if (ordreExperiences === 'date-asc') { experiencesTriees.sort(function (a, b) { return _pdfCleDateExperience(a).localeCompare(_pdfCleDateExperience(b)); }); }
    else if (ordreExperiences === 'poste-asc') { experiencesTriees.sort(function (a, b) { return (a.poste || '').localeCompare(b.poste || '', 'fr', { sensitivity: 'base' }); }); }
    else if (ordreExperiences === 'poste-desc') { experiencesTriees.sort(function (a, b) { return (b.poste || '').localeCompare(a.poste || '', 'fr', { sensitivity: 'base' }); }); }
    var contenuAvecExperiencesTriees = {};
    Object.keys(contenu).forEach(function (cle) { contenuAvecExperiencesTriees[cle] = contenu[cle]; });
    contenuAvecExperiencesTriees.experiences = experiencesTriees;
    contenu = contenuAvecExperiencesTriees;
  }

  // TACHE (retour utilisateur : "le nom de famille toujours en majuscules,
  // ca evite les confusions avec le prenom -- surtout pour les noms/
  // prenoms etrangers") : convention recrutement -- prenom affiche tel
  // quel (casse deja choisie par la personne), nom de famille TOUJOURS en
  // capitales.
  var nomComplet = [identite.prenom, (identite.nom || '').toUpperCase()].filter(Boolean).join(' ');
  // Lot moteur "La mise en page", sous-lot 4 : le permis est le seul de la
  // liste "Rubriques a afficher / masquer" qui vit dans l'en-tete (pas dans
  // contenuRetenu) -- composition.permisMasque le retire ici, ce qui couvre
  // a la fois la ligne de coordonnees et le bandeau de disponibilite.
  var permisTexte = (permis.possede && !(composition && composition.permisMasque))
    ? ('Permis ' + ((permis.categories || []).join(', ') || 'B') + (permis.vehicule ? ' (véhiculé)' : ''))
    : '';

  // TACHE (retour utilisateur : "email/telephone/permis toujours ensemble,
  // toujours sous mon nom, jamais ailleurs") : regroupes ici, rejoignent le
  // bloc Nom draggable plus bas (blocNom).
  // TACHE (retour utilisateur : "bandeau coordonnees -- je vais mettre
  // adresse mail, telephone, permis et la ville, ville et code postal") :
  // renomme depuis "bandeau telephone/permis" -- quand actif, il regroupe
  // DESORMAIS TOUT (email + telephone + permis + ville/CP), qui ne
  // doivent alors plus apparaitre nulle part ailleurs (jamais de doublon) :
  // ni sous le nom (coordonneesSousNomLignes).
  // TACHE (retour utilisateur, bug reel confirme : "la ville et le code
  // postal, il est separe alors qu'il n'est pas cense l'etre -- il doit
  // faire partie des coordonnees") : ville/CP vivait avant dans un bloc
  // ".coordonnees" A PART, pousse tout a droite de l'en-tete par le flex
  // "space-between" (loin du telephone/email/permis, sous le nom) --
  // rejoint desormais la MEME liste que le reste des coordonnees, jamais
  // plus un 2e bloc isole (aussi bien bandeauDisponibilite actif
  // qu'inactif, comportement DESORMAIS identique dans les 2 cas -- l'ancien
  // bloc ".coordonnees" en haut a droite n'a donc plus de raison d'etre,
  // voir plus bas ou il est retire de enteteHtml).
  var villeCodePostalTexte = [_pdfFormaterVille(identite.ville), identite.codePostal].filter(Boolean).join(', ');
  var coordonneesSousNomLignes = bandeauDisponibilite ? '' :
    [
      { texte: identite.telephone, icone: 'telephone' },
      { texte: identite.email, icone: 'email' },
      { texte: villeCodePostalTexte, icone: 'localisation' },
      { texte: permisTexte, icone: 'permis' }
    ].filter(function (l) { return l.texte; }).map(function (l) { return (iconesCoordonnees ? _pdfIconeSvg(l.icone) : '') + _pdfEscaperHtml(l.texte); }).join('<br>');

  // TACHE (retour utilisateur : "des endroits ou c'est possible de mettre
  // des pastilles ou des rectangles ou juste le texte... ca fait penser
  // notamment aux bandeaux coordonnees") : reutilise EXACTEMENT le meme
  // moteur de style que les Competences (classes .puce-competence/
  // .style-rectangle/.texte-competences, memes couleurs couleurFondCompetences/
  // couleurTextePuces deja pilotables) -- jamais un 2e systeme de style
  // duplique pour ce bandeau.
  var _badgesDispo = [
    identite.email ? ((iconesCoordonnees ? _pdfIconeSvg('email') : '') + _pdfEscaperHtml(identite.email)) : '',
    identite.telephone ? ((iconesCoordonnees ? _pdfIconeSvg('telephone') : '') + _pdfEscaperHtml(identite.telephone)) : '',
    permisTexte ? ((iconesCoordonnees ? _pdfIconeSvg('permis') : '') + _pdfEscaperHtml(permisTexte)) : '',
    villeCodePostalTexte ? ((iconesCoordonnees ? _pdfIconeSvg('localisation') : '') + _pdfEscaperHtml(villeCodePostalTexte)) : ''
  ].filter(Boolean);
  // TACHE (retour utilisateur : "cliquer dessus pour choisir pastille/
  // rectangle/texte + couleurs juste pour ce bandeau") : data-rubrique +
  // classe "bandeau-cliquable" -- meme mini-barre flottante que les
  // rubriques du corps (cvPdfPanneauReglages.js), jamais une 2e UI.
  var stylePuceDispo = _pdfStylePuceEffectif('bandeauDisponibilite');
  var bandeauDispoHtml = (bandeauDisponibilite && _badgesDispo.length)
    ? '<div class="bandeau-disponibilite bandeau-cliquable' + (coinsArrondis ? ' coins-arrondis' : '') + '" data-rubrique="bandeauDisponibilite">' +
      (stylePuceDispo === 'texte'
        ? '<p class="texte-competences">' + _badgesDispo.join(' • ') + '</p>'
        : _badgesDispo.map(function (b) { return '<span class="puce-competence' + (stylePuceDispo === 'rectangle' ? ' style-rectangle' : '') + '">' + b + '</span>'; }).join('')) +
      '</div>'
    : '';

  var photoUrl = (objetCV.photo && objetCV.photo.url) || null;
  // TACHE (retour utilisateur : "photo pas encore repositionnee sur la
  // bande pleine hauteur -- je veux bien") : classe posee plus bas, une
  // fois pleineHauteurGauche/Droite connues (photoHtml lui-meme construit
  // plus bas dans ce fichier, juste apres ces 2 variables -- ne PAS
  // avancer cette construction ici, ces variables n'existent pas encore
  // a ce stade).

  // TACHE (port du Word, "bandeau de competences cles") : puces plein-
  // largeur sous l'en-tete, a la place de la rubrique "Competences"
  // habituelle -- jamais les deux (verifie plus bas : 'competences'
  // retiree des fabricants de rubriques dans ce cas). competencesCles
  // deja selectionnees par COMPOSEUR_REGLE_R006 (cvPdfDonnees.js) :
  // aucune re-decision de contenu ici, uniquement la mise en forme.
  // TACHE (retour utilisateur : "je clique sur les pastilles de
  // competences cles, ca ne fait rien") : ce bandeau avait sa PROPRE
  // classe .puce-competence-cle (couleur d'accent fixe, jamais
  // personnalisable) -- reutilise desormais EXACTEMENT le meme moteur de
  // style que Competences/bandeauDisponibilite (.puce-competence/
  // .style-rectangle/.texte-competences + data-rubrique/bandeau-cliquable),
  // jamais un 2e systeme duplique : pastille/rectangle/texte + couleurs au
  // clic fonctionnent donc desormais ici aussi, gratuitement.
  var stylePuceCles = _pdfStylePuceEffectif('competencesCles');
  var bandeauCompetencesClesHtml = (bandeauCompetencesCles && competencesCles.length)
    ? '<div class="bandeau-competences-cles bandeau-cliquable' + (coinsArrondis ? ' coins-arrondis' : '') + '" data-rubrique="competencesCles">' + _pdfTitreH2('competencesCles', 'Compétences clés', iconesRubriques) +
      (stylePuceCles === 'texte'
        ? '<p class="texte-competences">' + competencesCles.map(function (c) { return _pdfEscaperHtml(c); }).join(' • ') + '</p>'
        : competencesCles.map(function (c) { return '<span class="puce-competence' + (stylePuceCles === 'rectangle' ? ' style-rectangle' : '') + '">' + _pdfEscaperHtml(c) + '</span>'; }).join('')) +
      '</div>'
    : '';

  // Ordre des rubriques : repris TEL QUEL de composition.strategieCV
  // (meme decision que le Word), jamais recalcule ici. Repli sur l'ordre
  // par defaut si aucune strategie n'a ete calculee (ex. appel isole/test).
  // Port du Word (composeurMoteur.js:genererDocxComposeur, parametre
  // sansAccroche) : simple effacement d'affichage du profil, jamais une
  // redecision de contenu -- pas besoin de repasser par construireDonneesPdfCV.
  // Consommee dans l'en-tete (texteAccrocheEntete plus bas), JAMAIS comme
  // rubrique du corps -- voir _pdfFabricantsRubriques ci-dessus.
  var profilTexte = opts.sansAccroche ? '' : ((objetCV.profil && (objetCV.profil.profilIA || objetCV.profil.profilUtilisateur)) || '');
  var ordreRubriques = _pdfEtendreOrdreRubriques((composition && composition.strategieCV && composition.strategieCV.ordreRubriques) || _PDF_ORDRE_RUBRIQUES_PAR_DEFAUT);
  // Port du Word (composeurRender.js:935) : rendu compact des experiences
  // (1 ligne, jamais de puces de missions) quand composition.formatEssentiel
  // est vrai -- deja decide par composeurComposer() en amont, jamais
  // recalcule ici.
  var experiencesCompact = !!(composition && composition.formatEssentiel);
  // Repli sur contenu.competences (fusion existante) si l'appelant ne
  // fournit pas encore les listes separees -- jamais un bloc Competences
  // vide pour un appelant qui n'a pas ete mis a jour (ex. construireHtmlPdfA4,
  // non branche a cvPdfDonnees.js).
  var competencesProfessionnelles = opts.competencesProfessionnelles || contenu.competences;
  var competencesComportementales = opts.competencesComportementales || [];
  // TACHE (retour utilisateur : "souligner le poste, les dates,
  // l'entreprise... et pareil pour l'italique... des que c'est souligne
  // dans le pro, ca l'est aussi dans les autres rubriques") : 3 reglages
  // GLOBAUX (jamais par item individuel, voir _pdfSpanStylePartie plus
  // haut) partages entre experiences pro, experience personnelle et
  // formations -- construits UNE SEULE FOIS ici, jamais recalcules par
  // rubrique.
  var styleParties = {
    poste: { souligne: !!opts.soulignerPoste, italique: !!opts.italiquePoste },
    dates: { souligne: !!opts.soulignerDates, italique: !!opts.italiqueDates },
    entreprise: { souligne: !!opts.soulignerEntreprise, italique: !!opts.italiqueEntreprise }
  };
  var fabricants = _pdfFabricantsRubriques(contenu, iconesRubriques, experiencesCompact, styleCompetences, competencesProfessionnelles, competencesComportementales, _pdfStylePuceEffectif, opts.styleProfessionnel, opts.stylePersonnel, opts.formatExperiences, styleParties);
  // 'competences' est deja affichee via le bandeau ci-dessus dans ce cas
  // -- jamais un doublon dans les colonnes.
  if (bandeauCompetencesCles && competencesCles.length) { delete fabricants.competences; }
  var ordreRubriquesEffectif = _PDF_ORDRE_RUBRIQUES_PAR_DEFAUT.filter(function (r) { return fabricants[r]; });
  var blocsOrdonnesCles = ordreRubriques.filter(function (r) { return fabricants[r]; });
  // Garde-fou : une rubrique geree ici mais absente de l'ordre retourne
  // (ne devrait pas arriver) rejoint quand meme le rendu, jamais perdue.
  ordreRubriquesEffectif.forEach(function (r) {
    if (blocsOrdonnesCles.indexOf(r) === -1) { blocsOrdonnesCles.push(r); }
  });
  // TACHE (glisser-deposer des rubriques) : chaque bloc HTML est enveloppe
  // (data-rubrique + draggable) via _pdfEnvelopperRubriqueDrag -- fait ICI,
  // un seul endroit, jamais duplique pour la branche ordrePersonnalise plus
  // bas (qui reutilise directement blocsParCle).
  var blocsParCle = {};
  // TACHE (chantier "10 nouveaux modeles Créatif", modele "Duo ovale") :
  // encadre les 2 rubriques de competences (jamais les autres -- reprend
  // precisement le CV AFPA de l'utilisateur, qui groupe savoir-faire et
  // savoir-être dans 2 boites distinctes) AVANT l'enveloppe glisser-depose
  // habituelle, pour que le drag&drop continue de deplacer la boite
  // entiere, jamais juste son contenu interne.
  var CLES_COMPETENCES_ENCADREES = { competences: true, competencesComportementales: true };
  blocsOrdonnesCles.forEach(function (r) {
    var html = fabricants[r]();
    if (blocsCompetencesEncadres && CLES_COMPETENCES_ENCADREES[r] && html) {
      html = '<div class="bloc-competence-encadre">' + html + '</div>';
    }
    blocsParCle[r] = _pdfEnvelopperRubriqueDrag(html, r);
  });
  var blocsOrdonnes = blocsOrdonnesCles.map(function (r) { return blocsParCle[r]; }).filter(Boolean);

  // Repartition en 2 "colonnes de contenu" : en 1 colonne, simple
  // moitie/moitie qui, une fois empilee, respecte l'ordre integralement.
  // TACHE (retour utilisateur : "une fenetre hyper chargee, l'autre 3
  // lignes seulement -- il faut une organisation qui se mette en place") :
  // en 2 colonnes, l'ancienne repartition ALTERNEE PAR INDEX (i%2) etait
  // aveugle a la taille reelle de chaque rubrique (une rubrique a 15
  // lignes et une a 2 lignes comptaient chacune pour "1"). Remplacee par
  // un algorithme GLOUTON simple : chaque bloc, dans l'ordre, rejoint la
  // colonne dont le total cumule (proxy = longueur du HTML genere pour ce
  // bloc, pas de mesure DOM reelle ici) est actuellement le plus faible --
  // sans etre une optimisation combinatoire complexe. Ne s'applique QUE
  // quand ordrePersonnalise est absent (voir plus bas) : des qu'une
  // rubrique a ete glissee-deposee manuellement, ce choix explicite prime
  // toujours, ce bloc reste hors de cette repartition automatique.
  var colonneUnHtml, colonneDeuxHtml;
  if (colonnes === 1) {
    var moitie = Math.ceil(blocsOrdonnes.length / 2);
    colonneUnHtml = blocsOrdonnes.slice(0, moitie).join('');
    colonneDeuxHtml = blocsOrdonnes.slice(moitie).join('');
  } else {
    // TACHE (retour utilisateur : "je constate que l'experience
    // professionnelle, elle est toujours seule dans une colonne") :
    // "colonneUn"/"colonneDeux" ici sont des colonnes de CONTENU, pas
    // encore le cote PHYSIQUE gauche/droite (colonnesInversees peut les
    // inverser plus bas) -- rubriquesForceesColonne raisonne lui en cote
    // PHYSIQUE (coherent avec la mesure DOM reelle faite cote panneau,
    // qui regarde toujours .corps .colonne dans l'ordre physique) : on
    // traduit donc ici quelle colonne de CONTENU correspond a quel cote
    // PHYSIQUE avant d'appliquer les forcages.
    // TACHE (retour utilisateur 2026-09-15, bug reel confirme par capture
    // d'ecran : "la petite colonne doit toujours etre a gauche, jamais a
    // droite") : le glouton plus bas assigne toujours le PREMIER bloc
    // traite (poidsColonneUn et poidsColonneDeux demarrent a 0, egalite ->
    // "colonneUn" gagne) -- "Experience professionnelle", generalement en
    // tete de l'ordre par defaut ET generalement la rubrique la plus
    // lourde d'un vrai CV, se retrouve donc quasi systematiquement dans
    // "colonneUn". Mappee jusqu'ici sur le cote GAUCHE par defaut, elle y
    // atterrissait donc de facon deterministe -- jamais un hasard, un vrai
    // biais structurel. Inverse ici (colonneUn -> DROITE par defaut) pour
    // que la colonne la plus legere (generalement colonneDeux) tombe a
    // gauche par defaut, coherent avec le Word (composeurRender.js,
    // meme convention). colonnesInversees continue de tout inverser.
    var cheminPhysiqueColonneUn = colonnesInversees ? 'gauche' : 'droite';
    var poidsColonneUn = 0, poidsColonneDeux = 0;
    var blocsColonneUn = [], blocsColonneDeux = [];
    var clesRestantes = [];
    blocsOrdonnesCles.forEach(function (r) {
      var bloc = blocsParCle[r];
      if (!bloc) { return; }
      var forcage = rubriquesForceesColonne[r];
      if (forcage === cheminPhysiqueColonneUn) { blocsColonneUn.push(bloc); poidsColonneUn += bloc.length; }
      else if (forcage) { blocsColonneDeux.push(bloc); poidsColonneDeux += bloc.length; }
      else { clesRestantes.push(r); }
    });
    // TACHE (retour utilisateur 2026-09-15 : "je veux que l'experience
    // professionnelle reste toujours sur la colonne la plus large, sauf
    // si c'est la personne qui la deplace elle-meme") : jusqu'ici,
    // "experiences" arrivait dans colonneUn par un EFFET DE BORD du
    // glouton (premiere dans blocsOrdonnesCles + egalite de poids au
    // depart -> colonneUn gagne), jamais garanti -- un CV avec assez de
    // contenu ailleurs (formations, loisirs...) pouvait faire basculer
    // "experiences" en colonneDeux (legere) sans qu'aucun choix explicite
    // n'ait ete fait. Sortie ici de clesRestantes (donc du glouton) pour
    // etre assignee DIRECTEMENT a colonneUn -- deterministe, jamais
    // soumis au poids du reste du contenu. Ne s'applique que si
    // "experiences" n'a pas deja ete forcee ailleurs par la personne
    // (rubriquesForceesColonne, deja traite juste au-dessus -- dans ce
    // cas elle n'est plus dans clesRestantes, ce bloc ne fait rien).
    var idxExperiences = clesRestantes.indexOf('experiences');
    if (idxExperiences !== -1 && blocsParCle.experiences) {
      clesRestantes.splice(idxExperiences, 1);
      // TACHE (retour utilisateur 2026-09-15, capture d'ecran : "le bloc
      // d'experience professionnelle est en bas de la page, colore mais
      // entoure de blanc -- tres moche") : unshift (jamais push) -- si
      // une AUTRE rubrique a deja ete forcee physiquement du meme cote par
      // la personne (rubriquesForceesColonne, glisser-depose manuel dans
      // le grand apercu, traite juste au-dessus), elle atterrit dans
      // blocsColonneUn AVANT ce bloc-ci ; un simple push aurait alors
      // laisse "experiences" en 2e position, visuellement plus bas que le
      // haut de la colonne coloree. Garanti desormais TOUJOURS premier,
      // quel que soit un forcage manuel deja present sur cette colonne.
      blocsColonneUn.unshift(blocsParCle.experiences);
      poidsColonneUn += blocsParCle.experiences.length;
    }
    // TACHE (meme retour utilisateur, seuil affine apres test reel : un CV
    // "normal" avec 4 experiences pesait 60% du total -- sous l'ancien
    // seuil de 65%, "Experience professionnelle" restait quand meme
    // isolee) : le SEUIL EXACT auquel le glouton pur isole definitivement
    // une rubrique est mathematique, pas arbitraire -- des qu'un bloc pese
    // a lui seul plus de la MOITIE du poids total restant, il pese forcement
    // plus que TOUS les autres blocs cumules ensemble, et le glouton (qui
    // assigne toujours a la colonne la plus legere) ne peut alors plus
    // jamais faire rejoindre un autre bloc dans sa colonne -- ils vont tous
    // dans l'autre, meme cumules. Lui adjoint d'office la plus petite
    // rubrique restante, dans la meme colonne, AVANT de laisser le glouton
    // traiter le reste normalement -- aucune colonne ne demarre plus seule
    // avec une unique rubrique geante (le reequilibrage par mesure DOM,
    // cvPdfPanneauReglages.js, prend ensuite le relais pour l'ajustement
    // fin, mais ne peut lui jamais "degrouper" une colonne a un seul
    // element, faute de rubrique a en retirer).
    var poidsRestant = clesRestantes.reduce(function (somme, r) { return somme + (blocsParCle[r] || '').length; }, 0);
    var cleDominante = null;
    if (clesRestantes.length > 1) {
      clesRestantes.forEach(function (r) {
        if (poidsRestant > 0 && (blocsParCle[r] || '').length > poidsRestant * 0.5) { cleDominante = r; }
      });
    }
    if (cleDominante) {
      var autresCles = clesRestantes.filter(function (r) { return r !== cleDominante; });
      var clePlusPetite = autresCles.slice().sort(function (a, b) {
        return (blocsParCle[a] || '').length - (blocsParCle[b] || '').length;
      })[0];
      var colonneCible = (poidsColonneUn <= poidsColonneDeux) ? 1 : 2;
      [cleDominante, clePlusPetite].forEach(function (r) {
        if (!r) { return; }
        var bloc = blocsParCle[r];
        if (colonneCible === 1) { blocsColonneUn.push(bloc); poidsColonneUn += bloc.length; }
        else { blocsColonneDeux.push(bloc); poidsColonneDeux += bloc.length; }
      });
      clesRestantes = clesRestantes.filter(function (r) { return r !== cleDominante && r !== clePlusPetite; });
    }
    clesRestantes.forEach(function (r) {
      var bloc = blocsParCle[r];
      if (poidsColonneUn <= poidsColonneDeux) { blocsColonneUn.push(bloc); poidsColonneUn += bloc.length; }
      else { blocsColonneDeux.push(bloc); poidsColonneDeux += bloc.length; }
    });
    colonneUnHtml = blocsColonneUn.join('');
    colonneDeuxHtml = blocsColonneDeux.join('');
  }

  // TACHE (port du Word, "fond des colonnes gauche/droite/les deux") :
  // fondColonnes decrit le cote VISUEL PHYSIQUE reel (jamais lie au
  // contenu Un/Deux), exactement comme composeurRender.js le fait pour
  // l'en-tete ("recalcule en PHYSIQUE, jamais lie a laterale/principale").
  // L'ordre DOM suit deja l'ordre visuel (colonnesInversees plus bas,
  // jamais un flex-direction inverse) : gauche = 1er element du tableau,
  // droite = 2e, TOUJOURS, quel que soit le contenu qui s'y trouve.
  var appliqueFondGauche = fondColonnes === 'gauche' || fondColonnes === 'lesDeux';
  var appliqueFondDroite = fondColonnes === 'droite' || fondColonnes === 'lesDeux';
  var contenuGauche, contenuDroite;
  // TACHE (glisser-deposer des rubriques) : ordrePersonnalise REMPLACE
  // entierement la repartition automatique ci-dessus (colonnesInversees
  // devient sans objet, les 2 colonnes sont deja explicites) -- cles
  // inconnues de blocsParCle (jamais censees arriver, garde-fou seulement)
  // simplement ignorees plutot que de faire echouer tout le rendu.
  if (ordrePersonnalise && (ordrePersonnalise.gauche || ordrePersonnalise.droite)) {
    contenuGauche = (ordrePersonnalise.gauche || []).map(function (r) { return blocsParCle[r]; }).filter(Boolean).join('');
    contenuDroite = (ordrePersonnalise.droite || []).map(function (r) { return blocsParCle[r]; }).filter(Boolean).join('');
  } else {
    // TACHE (retour utilisateur 2026-09-15, meme correctif que
    // cheminPhysiqueColonneUn plus haut) : colonneUn (generalement la
    // colonne la plus lourde, voir son commentaire) va desormais a DROITE
    // par defaut, colonneDeux (generalement la plus legere) a GAUCHE.
    contenuGauche = colonnesInversees ? colonneUnHtml : colonneDeuxHtml;
    contenuDroite = colonnesInversees ? colonneDeuxHtml : colonneUnHtml;
  }
  // TACHE (port du Word, "fondColonnesEffet") : 'fondSeul' remplit tout
  // le fond (degrade, necessite degradeColonnes actif) ; 'titres' ne
  // colore que les titres de rubrique de cette colonne (classe distincte
  // .titres-colores, jamais combinee a .degrade-actif -- un seul effet a
  // la fois par colonne, comme dans le Word).
  var gaucheAvecFondPlein = appliqueFondGauche && degradeColonnes !== 'aucun' && fondColonnesEffet === 'fondSeul';
  var droiteAvecFondPlein = appliqueFondDroite && degradeColonnes !== 'aucun' && fondColonnesEffet === 'fondSeul';
  // TACHE (bande laterale pleine hauteur) : ce cote a un fond plein ET
  // l'option est active ET pas de bandeau d'en-tete colore en meme temps
  // (choix explicite, voir plus haut). La colonne du CORPS recoit alors
  // .fond-transfere (fond transparent, la bande derriere fournit DEJA la
  // couleur sur toute la hauteur -- jamais 2 degrades superposes qui ne
  // s'alignent pas pixel pres, un decoupe sur la hauteur du corps SEUL,
  // l'autre sur la hauteur de la PAGE entiere).
  var pleineHauteurGauche = fondColonnePleineHauteur && !bandeauEnTete && gaucheAvecFondPlein;
  var pleineHauteurDroite = fondColonnePleineHauteur && !bandeauEnTete && droiteAvecFondPlein;
  // TACHE (retour utilisateur : "photo pas encore repositionnee sur la
  // bande pleine hauteur -- je veux bien") : classe dediee, positionnee en
  // absolu dans .entete/.entete-libre (deja position:relative, voir plus
  // haut) -- ne remplace PAS le rendu normal (photo toujours a sa place
  // habituelle) tant que la bande n'est pas active pour ce cote.
  // TACHE (chantier "2 nouveaux modeles Créatif", modele "Médaillon") :
  // meme principe EXACT que pleine-hauteur-gauche/droite juste au-dessus
  // (classe dediee, positionnee en absolu dans .entete/.entete-libre deja
  // position:relative) -- ne s'active que si un bandeau d'en-tete colore
  // existe reellement (rien a chevaucher sinon).
  var photoAMedaillon = photoMedaillon && bandeauEnTete;
  var photoHtml = photoUrl
    ? '<div class="photo-conteneur' + (anneauPhoto ? ' avec-anneau' : '') + (photoForme === 'losange' ? ' photo-losange' : '') +
      (pleineHauteurGauche ? ' pleine-hauteur-gauche' : '') + (pleineHauteurDroite ? ' pleine-hauteur-droite' : '') +
      (photoAMedaillon ? ' medaillon' : '') +
      '"><img class="photo-entete" src="' + _pdfEscaperHtml(photoUrl) + '" alt="Photo"></div>'
    : '';
  // TACHE (meme retour) : nom+coordonnees (deja positionnes a gauche par
  // defaut, voir _PDF_POSITIONS_LIBRES_DEFAUT plus bas) laissent la place
  // a la photo au-dessus d'eux -- SEULEMENT si une photo existe reellement
  // ET que la bande active est bien celle de GAUCHE (meme cote que la
  // position de depart du nom -- si la bande est a droite, aucun conflit,
  // le nom reste ou il est).
  var nomYAvecPhotoPleineHauteur = (photoUrl && pleineHauteurGauche) ? 55 : 38;
  // TACHE (colonnes diagonales) : le bord INTERIEUR (celui qui fait face a
  // l'autre colonne) est decoupe -- gauche = son bord droit, droite = son
  // bord gauche, jamais l'inverse (colonnesInversees ne change que le
  // CONTENU, pas la position physique gauche/droite, voir plus haut).
  var diagonaleColonnesActive = formeColonnes === 'diagonale' && colonnes === 2;
  // TACHE (chantier "CV Créatif") : meme condition exacte que
  // diagonaleColonnesActive juste au-dessus, jamais une 3e regle inventee.
  var vagueColonnesActive = formeColonnes === 'vague' && colonnes === 2;
  // TACHE (retour utilisateur : "quand on a une seule colonne, tous les
  // titres doivent etre pareils -- pour 2 colonnes, garder la colonne de
  // droite un peu plus dense avec ses titres en badge, la gauche sans,
  // pour gagner de l'espace, c'est un choix valable") : appliqueFondGauche/
  // appliqueFondDroite restent scopes gauche/droite meme en 1 colonne (le
  // HTML garde 2 <div class="colonne">, simplement empilees, voir
  // .mode-1-colonne) -- 'titres-colores' se retrouvait donc applique a
  // UNE SEULE des 2 zones empilees, jamais coherent visuellement des lors
  // qu'il n'y a plus de vraie notion de "colonne differente" pour la
  // personne. Uniformise ici les 2 cotes UNIQUEMENT en 1 colonne -- 2
  // colonnes reste inchange (asymetrie deliberee, jamais concernee).
  var titresColoresUniforme1Colonne = (colonnes === 1) && fondColonnesEffet === 'titres' && fondColonnes !== 'aucun';
  var classesGauche = 'colonne' + (gaucheAvecFondPlein ? ' degrade-actif' : '') +
    ((titresColoresUniforme1Colonne || (appliqueFondGauche && fondColonnesEffet === 'titres')) ? ' titres-colores' : '') +
    (diagonaleColonnesActive && gaucheAvecFondPlein ? ' colonne-diagonale-droite' : '') +
    (vagueColonnesActive && gaucheAvecFondPlein ? ' colonne-vague-droite' : '') +
    (pleineHauteurGauche ? ' fond-transfere' : '');
  var classesDroite = 'colonne' + (droiteAvecFondPlein ? ' degrade-actif' : '') +
    ((titresColoresUniforme1Colonne || (appliqueFondDroite && fondColonnesEffet === 'titres')) ? ' titres-colores' : '') +
    (diagonaleColonnesActive && droiteAvecFondPlein ? ' colonne-diagonale-gauche' : '') +
    (vagueColonnesActive && droiteAvecFondPlein ? ' colonne-vague-gauche' : '') +
    (pleineHauteurDroite ? ' fond-transfere' : '');
  // TACHE (retour utilisateur 2026-09-15, "manipulation directe" sur le
  // corps a 2 colonnes) : meme famille que la poignee de hauteur d'en-tete
  // (data-poignee-hauteur-entete) -- ici sur la largeur respective des 2
  // colonnes (reglage existant largeurColonneGauche/regLargeurColonneGauche,
  // jusque-la accessible seulement via le curseur du panneau de reglages).
  // Positionnee exactement au milieu du "gap" entre les 2 colonnes : le
  // bord interieur de la colonne gauche est a X% de la largeur de contenu
  // (curseur bornes 30-70, jamais 0/100), le "gap" est reparti pour moitie
  // de chaque cote (voir flex-basis plus bas) -- le milieu du gap tombe
  // donc exactement sur ce meme point X%, quel que soit gapCorps. Calc()
  // melange % (largeur de .corps, avec son padding lateral 14mm) et mm
  // (le padding lui-meme) pour retomber sur la largeur de CONTENU exacte,
  // jamais une approximation qui desalignerait la poignee du vrai bord.
  // TACHE (retour utilisateur 2026-09-15, bug reel confirme : bouton
  // d'inversion muet + non voulu sur le CV) : le bouton rond
  // "Inverser les 2 colonnes" pose ici a la creation de cette poignee
  // faisait double emploi avec la case a cocher "Colonnes inversees" DEJA
  // presente dans le panneau de reglages (cvPdfPanneauReglages.js) --
  // jamais la bonne place pour ce controle, Denis la veut dans le
  // panneau, pas flottante sur le CV. Retire ; seule la poignee de
  // largeur (glisser, jamais inverser) reste sur le CV.
  var poigneeColonnes = '';
  if (colonnes === 2) {
    var positionFrontiereColonnes = 'calc(14mm + (100% - 28mm) * ' + (largeurColonneGauche / 100) + ')';
    poigneeColonnes =
      '<div class="poignee-redim-largeur-colonnes" data-poignee-largeur-colonnes title="Glisser pour ajuster la largeur des colonnes" ' +
      'style="left:' + positionFrontiereColonnes + ';"></div>';
  }
  var colonnesHtml = '<div class="' + classesGauche + '">' + contenuGauche + '</div>' +
    '<div class="' + classesDroite + '">' + contenuDroite + '</div>' + poigneeColonnes;

  var corpsClasses = 'corps' + (colonnes === 1 ? ' mode-1-colonne' : '') + (separateurColonnes ? ' avec-separateur' : '');
  var corpsHtml = '<div class="' + corpsClasses + '">' + colonnesHtml + '</div>';

  // TACHE (bande laterale pleine hauteur) : meme largeur que la colonne
  // correspondante du corps (largeurColonneGauche), appliquee cette fois
  // a la largeur de la PAGE ENTIERE -- approximation volontaire (ignore
  // le padding lateral 14mm du corps, marge d'erreur visuelle mineure sur
  // une largeur de page de 210mm), jamais un calcul pixel-parfait qui
  // aurait demande de dupliquer toute la geometrie du corps ici.
  var bandeLateraleHtml = '';
  if (pleineHauteurGauche) {
    bandeLateraleHtml += '<div class="bande-laterale-pleine-hauteur bande-gauche" style="width:' + largeurColonneGauche + '%;"></div>';
  }
  if (pleineHauteurDroite) {
    bandeLateraleHtml += '<div class="bande-laterale-pleine-hauteur bande-droite" style="width:' + (100 - largeurColonneGauche) + '%;"></div>';
  }

  var angleColonne = (degradeColonnes === 'clair-fonce') ? '0deg' : '180deg';
  var angleBandeau = (degradeBandeau === 'clair-fonce') ? '0deg' : '180deg';
  var enteteClasses = 'entete' + (bandeauEnTete ? ' bandeau-actif' : '') + (bandeauEnTete && degradeBandeau !== 'aucun' ? ' bandeau-degrade' : '') +
    (bandeauEnTete && formeEnTete === 'diagonale' ? ' forme-diagonale' : '') +
    (bandeauEnTete && formeEnTete === 'coin' ? ' forme-coin' : '') +
    (bandeauEnTete && formeEnTete === 'vague' ? ' forme-vague' : '') +
    (bandeauEnTete && formeEnTete === 'rectangle' && coinsArrondis ? ' coins-arrondis' : '') +
    (photoAMedaillon ? ' medaillon-actif' : '') +
    (enteteCentree ? ' entete-centree' : '') +
    (nomVertical ? ' nom-vertical-actif' : '') +
    // TACHE (bande laterale pleine hauteur) : texte du nom/coordonnees
    // recolore automatiquement (blanc/noir contraste, meme variable
    // --texte-fond que les colonnes) des que ce cote a une bande active --
    // "placement automatique" : la position par defaut du nom (position
    // libre, x:2%) est DEJA alignee sur le cote gauche, voir
    // _PDF_POSITIONS_LIBRES_DEFAUT plus bas -- seule la couleur necessite
    // une adaptation explicite ici. Reste un choix "au mieux" si le nom a
    // ete deplace manuellement ailleurs -- l'override manuel de couleur
    // (mini-barre flottante, deja existant) reste toujours disponible.
    (pleineHauteurGauche ? ' pleine-hauteur-gauche' : '') + (pleineHauteurDroite ? ' pleine-hauteur-droite' : '');
  var corpsRubriquesClasse = (styleTitres === 'bandeau') ? ' style-titres-bandeau' : (styleTitres === 'aucun' ? ' style-titres-aucun' : (styleTitres === 'pastille' ? ' style-titres-pastille' : ''));
  // TACHE (retour utilisateur : "Lecture guidee comme dans Word -- meme
  // couleur et style d'ecriture pour nom, metier vise, experience,
  // formation, pour que le lien saute aux yeux en 7 secondes") : port de
  // l'INTENTION de theme.coloration==='lectureGuidee' (Projet XXL,
  // composeurTheme.js/composeurRender.js -- Projet XXL exclusivement,
  // jamais atteint par le moteur PDF, voir cvPdfDonnees.js), pas une
  // lecture litterale de ce reglage (n'existe pas dans composition ici).
  // Metier vise et titres de rubrique utilisent DEJA l'accent + majuscules
  // de facon inconditionnelle (voir CSS plus bas) -- seul le NOM (h1) n'y
  // etait pas encore rattache. Active ici, le nom rejoint la meme couleur
  // + les memes majuscules : les 3 elements (nom, metier vise, titres de
  // rubrique) partagent alors exactement le meme traitement visuel.
  // Ignore automatiquement des que le bandeau d'en-tete est colore
  // (bandeau-actif, voir CSS : le nom suit alors deja la couleur de
  // lisibilite du fond, jamais l'accent par-dessus un fond de la meme
  // couleur -- toujours lisible avant tout).
  corpsRubriquesClasse += opts.lectureGuidee ? ' lecture-guidee' : '';
  // TACHE (chantier "CV Créatif") : meme convention que lectureGuidee
  // juste au-dessus (classe globale posee sur .page-a4, consommee par du
  // CSS scope plus bas), jamais un chemin de rendu HTML separe.
  corpsRubriquesClasse += opts.pilluleExperiences ? ' pilule-experiences' : '';
  corpsRubriquesClasse += cadrePage ? ' cadre-page' : '';
  corpsRubriquesClasse += nomVertical ? ' nom-vertical-actif' : '';
  var epaisseurEntete = (styleBordures === 'epaisse') ? '6px' : '3px';
  var epaisseurTitre = (styleBordures === 'epaisse') ? '4px' : '2px';

  var css =
'  :root { --degrade-debut: ' + couleurDebut + '; --degrade-fin: ' + couleurFinLisible + '; --fond-accent-debut: ' + fondAccentDebut + '; --fond-accent-fin: ' + fondAccentFin + '; --degrade-angle: ' + angleColonne + '; --degrade-angle-bandeau: ' + angleBandeau + '; --texte-fond: ' + texteFond + '; --texte-fond-attenue: ' + texteFondAttenue + '; --bordure-fond-attenuee: ' + bordureFondAttenuee + '; --fond-titre-bandeau-sur-degrade: ' + fondTitreBandeauSurDegrade + '; --fond-puce-sur-degrade: ' + fondPuceSurDegrade + '; }' +
'  * { box-sizing: border-box; }' +
// TACHE (retour utilisateur, bug reel confirme en comparant l\'apercu a
// l\'ecran et le PDF reellement obtenu : "le fond colore de l\'en-tete a
// disparu, tout est blanc/gris a l\'impression") : sans cette propriete,
// Chrome/Edge/Firefox N\'IMPRIMENT PAS les couleurs de fond par defaut
// (economie d\'encre historique du navigateur, active meme via "Imprimer
// en PDF") -- SEUL un reglage manuel "Graphiques d\'arriere-plan" dans la
// boite de dialogue d\'impression (jamais coche par defaut, quasi personne
// ne le sait) evitait ce bug jusqu\'ici. `print-color-adjust: exact`
// force l\'impression EXACTE des couleurs choisies (degrade d\'en-tete,
// fond des colonnes, pastilles...) -- applique globalement (effet nul en
// dehors de l\'impression, jamais visible a l\'ecran).
'  * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }' +
'  .page-a4 { position: relative; width: ' + largeurPage + '; min-height: ' + hauteurPage + '; margin: 24px auto; background: #fff; box-shadow: 0 4px 18px rgba(0,0,0,0.25); padding: 0; font-family: ' + police + '; color: #1b1b1b; }' +
// TACHE (chantier "10 nouveaux modeles Créatif", modele "Cadre & barre") :
// cadre plein autour de toute la page -- box-sizing:border-box pour que
// la bordure s'ajoute SANS agrandir la page au-dela de largeurPage/
// hauteurPage (sinon debordement sur A4 physique a l'impression).
'  .page-a4.cadre-page { box-sizing: border-box; border: 5px solid var(--degrade-debut); }' +
// TACHE (chantier "10 nouveaux modeles Créatif", modele "Bandeau
// vertical") : bande fixe 12mm, jamais recalculee selon le contenu (une
// simple decoration, pas une colonne) -- .page-a4 en padding-left decale
// TOUT le reste (en-tete + corps) pour ne jamais passer sous la bande,
// jamais un chevauchement comme documente pour d'autres bandes plus haut
// dans ce chantier. h1 masque quand cette bande est active : le nom ne
// doit jamais apparaitre 2 fois (bande + en-tete normal).
'  .page-a4.nom-vertical-actif { padding-left: 12mm; }' +
'  .bande-nom-verticale { position: absolute; top: 0; left: 0; width: 12mm; height: 100%; background: var(--degrade-debut); display: flex; align-items: center; justify-content: center; z-index: 3; }' +
'  .bande-nom-verticale span { writing-mode: vertical-rl; transform: rotate(180deg); color: var(--texte-fond); font-weight: 700; font-size: 13px; letter-spacing: 0.05em; white-space: nowrap; }' +
'  .entete.nom-vertical-actif h1 { display: none; }' +
// TACHE (retour utilisateur : "le fond de colonne, sa couleur, remonter
// jusqu'en haut de la page") : bande verticale position:absolute, du haut
// de .page-a4 (position:relative ci-dessus, sert de repere) jusqu'en bas
// -- z-index:0, PEINTE EN DESSOUS de tout le reste (entete/corps/bandeaux
// ci-dessous recoivent position:relative pour passer devant, comportement
// par defaut de l'ordre de peinture CSS : un element positionne passe
// TOUJOURS devant un frere non-positionne, quel que soit l'ordre DOM).
'  .bande-laterale-pleine-hauteur { position: absolute; top: 0; bottom: 0; z-index: 0; background: linear-gradient(180deg, var(--degrade-debut) 0%, var(--degrade-fin) 100%); }' +
'  .bande-laterale-pleine-hauteur.bande-gauche { left: 0; }' +
'  .bande-laterale-pleine-hauteur.bande-droite { right: 0; }' +
'  .entete, .corps, .bandeau-disponibilite, .bandeau-competences-cles { position: relative; z-index: 1; }' +
// TACHE (retour utilisateur, bug reel confirme en testant : "cette
// colonne pleine hauteur, je ne veux pas qu'elle soit chevauchee... pas
// une couleur plus foncee") : bug trouve en verifiant EXACTEMENT ce point
// -- le nom (h1/coordonnees) est TOUJOURS positionne a GAUCHE (1er enfant
// de .entete en mode fixe, x=2% par defaut en position libre -- jamais
// deplace vers la droite, meme quand la bande pleine hauteur est a
// DROITE) : le forcer en blanc pour .pleine-hauteur-droite le rendait
// INVISIBLE (texte blanc sur fond blanc, verifie : nom entierement hors
// de la bande dans ce cas). Seul .pleine-hauteur-gauche (bande a gauche,
// LA ou le nom se trouve reellement) doit le forcer en blanc. A
// l'inverse, metier/accroche sont eux TYPIQUEMENT a droite (centre/droite
// en 3 colonnes, colonne de droite en 2 colonnes) : c'est .pleine-hauteur-droite
// qui doit desormais les forcer en blanc, jamais .pleine-hauteur-gauche
// (ou ils restent hors bande, texte sombre deja correct).
'  .entete.pleine-hauteur-gauche h1, .entete.pleine-hauteur-gauche .coordonnees-sous-nom { color: var(--texte-fond); }' +
'  .entete.pleine-hauteur-droite .metier-vise, .entete.pleine-hauteur-droite .accroche-entete { color: var(--texte-fond); }' +
'  .entete { display: flex; justify-content: space-between; align-items: center; border-bottom: ' + epaisseurEntete + ' solid var(--degrade-debut); padding: 16mm 14mm 10px 14mm; margin-bottom: 16px; }' +
'  .entete-gauche { display: flex; align-items: center; gap: 14px; }' +
'  .photo-conteneur { position: relative; width: 60px; height: 60px; flex-shrink: 0; }' +
'  .photo-entete { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--degrade-debut); position: relative; z-index: 1; }' +
// TACHE (chantier "10 nouveaux modeles Créatif", modele "Losange &
// bandeau vert") : photo en losange -- clip-path plutot que border-radius,
// meme technique que .colonne-vague-*/.entete.forme-vague plus haut/bas.
// border-radius devient sans effet des qu'un clip-path est actif (les 2
// ne se combinent jamais), retire explicitement pour ne jamais laisser un
// reste de bordure carree visible aux coins.
'  .photo-conteneur.photo-losange .photo-entete { border-radius: 0; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }' +
'  .entete.bandeau-actif .photo-entete { border-color: var(--texte-fond); }' +
'  .photo-conteneur.avec-anneau::before { content: ""; position: absolute; top: 10px; left: 10px; width: 70px; height: 70px; border-radius: 50%; background: var(--degrade-debut); opacity: 0.3; z-index: 0; }' +
'  .entete.bandeau-actif .photo-conteneur.avec-anneau::before { background: var(--texte-fond); opacity: 0.35; }' +
// TACHE (retour utilisateur : "photo pas encore repositionnee sur la
// bande pleine hauteur") : positionnee en absolu pres du haut de la page,
// du meme cote que la bande (gauche/droite) -- .entete est deja
// position:relative (voir plus haut), sert de repere. Bordure recoloree
// comme sur un bandeau d'en-tete colore (meme variable --texte-fond),
// pour rester visible sur la bande.
'  .photo-conteneur.pleine-hauteur-gauche, .photo-conteneur.pleine-hauteur-droite { position: absolute; top: 10mm; z-index: 2; }' +
'  .photo-conteneur.pleine-hauteur-gauche { left: 10mm; }' +
'  .photo-conteneur.pleine-hauteur-droite { right: 10mm; }' +
'  .photo-conteneur.pleine-hauteur-gauche .photo-entete, .photo-conteneur.pleine-hauteur-droite .photo-entete { border-color: var(--texte-fond); }' +
'  .entete h1 { font-size: 24px; margin: 0; }' +
// TACHE (Lecture guidee) : specificite volontairement plus elevee que
// .entete.bandeau-actif h1 (via :not()) -- gagne toujours quel que soit
// l'ordre des regles dans la feuille, mais seulement hors bandeau colore
// (jamais l'accent par-dessus un fond deja de cette couleur, illisible).
// TACHE (retour utilisateur, regression confirmee : "le prenom se
// retrouve en majuscules" -- la convention nom-de-famille-toujours-en-
// capitales/prenom-tel-quel est deja geree cote JS, voir nomComplet plus
// bas) : text-transform:uppercase ici l'ecrasait visuellement pour TOUT
// le h1 (prenom + nom), jamais voulu -- retire, seule la couleur/
// l'espacement de lettres restent propres a Lecture guidee.
// TACHE (retour utilisateur, bug reel confirme en testant -- meme
// symptome "le nom disparait" que le badge corrige plus bas) : chaque
// :not() supplementaire AJOUTE a la specificite CSS de son propre
// selecteur (comme une classe) -- cette regle (3 classes effectives :
// .lecture-guidee, .entete, :not(.bandeau-actif)) battait donc TOUJOURS
// .entete.pleine-hauteur-gauche h1 (seulement 2 classes, plus haut),
// quel que soit l'ordre dans la feuille : le nom recuperait la couleur
// D'ACCENT (var(--degrade-debut)) au lieu du texte blanc/noir contraste
// (var(--texte-fond)) attendu sur une bande laterale pleine hauteur --
// invisible des que la bande partage la meme couleur d'accent (toujours
// le cas, meme variable CSS). :not(.pleine-hauteur-gauche) ajoute ici,
// meme principe que :not(.bandeau-actif) juste au-dessus.
'  .lecture-guidee .entete:not(.bandeau-actif):not(.pleine-hauteur-gauche) h1 { color: var(--degrade-debut); letter-spacing: 0.04em; }' +
'  .entete .metier-vise { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--degrade-debut); margin: 2px 0 0 0; }' +
// TACHE (retour utilisateur : "quand la lecture guidee est activee, le
// nom et le metier vise doivent reprendre la MEME charte graphique que
// les titres du corps -- c'est pour ca qu'on a fait ce mode, guider le
// regard du recruteur du nom au poste puis a chaque rubrique") : jusque-
// la, .lecture-guidee ne faisait que colorer le NOM en accent (regle
// juste au-dessus) -- jamais la MEME forme (badge/soulignement) que
// .rubrique h2 plus bas, et jamais le metier vise. Desormais, quand
// Lecture guidee est active, nom + metier suivent exactement le style
// de titre du corps (styleTitres, deja calcule dans corpsRubriquesClasse
// -- meme convention de classes combinees que .style-titres-bandeau/
// .style-titres-aucun sur .page-a4). Jamais sur un bandeau d\'en-tete
// deja colore (:not(.bandeau-actif), meme garde que ci-dessus -- l\'accent
// par-dessus un fond de cette meme couleur serait illisible).
// TACHE (retour utilisateur, bug reel confirme en testant -- "le nom
// disparait, meme couleur que le fond") : ce badge (fond var(--degrade-
// debut)) ecrasait EXACTEMENT la meme couleur que la bande laterale
// pleine hauteur juste derriere (meme variable CSS des 2 cotes,
// mesure/confirmee identique en pixel) des que "Style aleatoire" combinait
// les deux -- le badge devenait alors litteralement invisible (fondu dans
// la bande), jamais un vrai contraste rompu mais un doublon inutile qui
// masquait le texte. :not(.pleine-hauteur-gauche)/:not(.pleine-hauteur-droite)
// ajoutes ici, meme principe que :not(.bandeau-actif) juste au-dessus :
// h1 (nom, toujours a gauche) et .metier-vise (toujours a droite en 3
// colonnes/pleine hauteur) n'ont jamais besoin de ce badge quand un fond
// colore existe deja derriere eux -- .entete.pleine-hauteur-gauche h1/
// .entete.pleine-hauteur-droite .metier-vise (plus haut) prennent deja le
// relais (texte blanc simple, sans badge).
'  .lecture-guidee.style-titres-bandeau .entete:not(.bandeau-actif):not(.pleine-hauteur-gauche) h1 { ' +
'background: var(--degrade-debut); color: var(--texte-fond); padding: 3px 10px; border-radius: 4px; display: inline-block; margin-top: 4px; }' +
'  .lecture-guidee.style-titres-bandeau .entete:not(.bandeau-actif):not(.pleine-hauteur-droite) .metier-vise { ' +
'background: var(--degrade-debut); color: var(--texte-fond); padding: 3px 10px; border-radius: 4px; display: inline-block; margin-top: 4px; }' +
'  .lecture-guidee:not(.style-titres-bandeau):not(.style-titres-aucun) .entete:not(.bandeau-actif) h1, ' +
'.lecture-guidee:not(.style-titres-bandeau):not(.style-titres-aucun) .entete:not(.bandeau-actif) .metier-vise { ' +
'border-bottom: 2px solid #e0e0e0; padding-bottom: 4px; display: inline-block; }' +
// TACHE (retour utilisateur : "en Word il n'y a pas de rubrique Profil,
// je veux le titre de poste vise et juste en dessous la phrase
// d'accroche") : port de construireBlocObjectif (composeurRender.js,
// Projet XXL) -- accroche toujours juste sous le metier vise, jamais une
// rubrique "Profil" separee (voir _pdfFabricantsRubriques plus haut).
'  .entete .accroche-entete { font-size: 11.5px; font-style: italic; line-height: 1.4; color: var(--degrade-debut); margin: 4px 0 0 0; max-width: 90mm; }' +
// TACHE (retour utilisateur : "email/telephone/permis toujours ensemble,
// toujours sous mon nom") : meme style que l'ancien ".coordonnees" (11px,
// gris) -- ville/CP rejoint desormais cette meme liste (voir plus haut),
// jamais plus un bloc ".coordonnees" a part.
'  .entete .coordonnees-sous-nom { font-size: 11px; line-height: 1.5; color: #555; margin: 4px 0 0 0; }' +
// TACHE (retour utilisateur, bug reel confirme : "quand je decoche
// Position libre, les rubriques sont empilees a gauche -- je ne veux
// JAMAIS voir ca") : disposition FIXE par defaut (position libre
// inactive) -- nom+coordonnees a gauche, metier au centre (aussi grand
// que le nom, meme taille 22px que le mode position libre), accroche a
// droite. `.entete` est deja `display:flex; justify-content:space-between`
// (regle de base plus haut) : les 3 blocs (entete-gauche, metier,
// accroche) se repartissent donc naturellement sur la largeur, jamais
// un 2e display:flex duplique ici.
'  .entete.entete-cote-a-cote { align-items: flex-start; gap: 10px; }' +
'  .entete.entete-cote-a-cote .entete-gauche { flex: 1 1 auto; min-width: 0; }' +
'  .entete.entete-cote-a-cote .entete-bloc-texte[data-entete-bloc="metier"] { flex: 0 0 auto; text-align: center; }' +
'  .entete.entete-cote-a-cote .entete-bloc-texte[data-entete-bloc="accroche"] { flex: 0 0 auto; }' +
'  .entete.entete-cote-a-cote .metier-vise { font-size: 22px; }' +
// TACHE (retour utilisateur : "l'option 2 colonnes -- a gauche nom et
// coordonnees, a droite le metier en haut et l'accroche plus bas sur la
// meme colonne -- si le nom de metier est tres grand, on est sur que le
// metier ET l'accroche vont rentrer") : colonne de droite unique
// (flex-direction:column) englobant metier + accroche, empiles -- chacun
// garde son propre bloc `.entete-bloc-texte` (jamais fusionnes), donc
// individuellement deplacables/redimensionnables des que "Position libre"
// est reactive. Annule le `text-align:center`/largeur en % du bandeau
// entier herites de .entete-cote-a-cote ci-dessus (specificite egale, 3
// classes -- la source order tranche, cette regle est APRES) : le metier
// et l'accroche occupent ici toute la largeur de LEUR colonne, jamais un
// pourcentage du bandeau complet comme en 3 colonnes.
'  .entete.entete-2col .entete-colonne-droite { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 6px; }' +
'  .entete.entete-2col .entete-bloc-texte[data-entete-bloc="metier"] { text-align: left; width: 100%; }' +
'  .entete.entete-2col .entete-bloc-texte[data-entete-bloc="accroche"] { width: 100%; }' +
'  .entete.bandeau-actif { background: var(--fond-accent-debut); border-bottom: none; margin-bottom: 16px; }' +
'  .entete.bandeau-actif.bandeau-degrade { background: linear-gradient(var(--degrade-angle-bandeau), var(--fond-accent-debut) 0%, var(--fond-accent-fin) 100%); }' +
'  .entete.bandeau-actif h1, .entete.bandeau-actif .metier-vise, .entete.bandeau-actif .accroche-entete, .entete.bandeau-actif .coordonnees-sous-nom { color: var(--texte-fond); }' +
// TACHE (chantier "10 nouveaux modeles Créatif") : 2 nouvelles formes
// d'en-tete, meme mecanique clip-path EXACTE que .forme-diagonale
// ci-dessus (deja existante) -- jamais un 4e systeme de forme invente.
// .forme-coin : triangle colore dans le coin superieur gauche seulement
// (le reste du bandeau garde son bord droit) -- utilise un pseudo-element
// plutot que le clip-path de l'entete elle-meme (qui doit rester
// rectangulaire ici, contrairement a .forme-diagonale).
'  .entete.forme-coin { position: relative; overflow: hidden; }' +
'  .entete.forme-coin::before { content: ""; position: absolute; top: 0; left: 0; width: 55%; height: 100%; background: var(--degrade-debut); clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0; }' +
'  .entete.forme-coin > * { position: relative; z-index: 1; }' +
'  .entete.forme-vague { clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%); padding-bottom: 60px; }' +
// TACHE (meme chantier) : en-tete centree (nom/photo au milieu, jamais
// aligne a gauche) -- utilisee par le modele "Cadre & barre", independante
// de bandeauEnTete/formeEnTete (peut se combiner aux 2).
'  .entete.entete-centree { flex-direction: column; text-align: center; align-items: center; gap: 6px; }' +
'  .entete.entete-centree .entete-gauche { align-items: center; }' +
// TACHE (retour utilisateur : "le texte de l'accroche devient invisible
// la ou le bandeau est coupe en diagonale -- fais ce bandeau un peu plus
// large pour que le texte rentre") : marge de securite entre la decoupe
// (34px max, cote gauche) et le padding-bottom qui la compense doublee
// (10px -> 26px) -- jamais un simple copier-coller du chiffre de la
// decoupe, une vraie marge devant rester meme dans les cas les plus
// serres (grand texte via l'agrandissement d'en-tete, descentes de
// caracteres...).
'  .entete.forme-diagonale { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 34px)); padding-bottom: 60px; }' +
'  .entete.coins-arrondis { border-radius: 0 0 18px 18px; }' +
'  .texte-profil { font-size: ' + tailleItem + '; line-height: 1.5; margin: 0; }' +
'  .bandeau-disponibilite { text-align: center; font-size: 11.5px; padding: 6px 14mm; background: #f0f4f8; color: #333; margin-bottom: 16px; }' +
'  .bandeau-disponibilite.coins-arrondis { border-radius: 12px; }' +
'  .corps { position: relative; display: flex; gap: ' + gapCorps + '; padding: 0 14mm 16mm 14mm; }' +
// TACHE (retour utilisateur 2026-09-15) : poignee de largeur des colonnes
// + bouton d'inversion -- meme habillage visuel que les poignees
// existantes (accroche/metier/hauteur-entete, voir plus haut), position
// horizontale posee en style inline (calc(), voir plus haut) car elle
// depend de largeurColonneGauche, jamais un simple centrage CSS.
// TACHE (retour utilisateur 2026-09-15, bug reel confirme par capture
// d'ecran : "une barre", "une ligne de haut en bas qui traverse
// l'integralite du CV") : contrairement a poignee-redim-accroche/-metier
// (scopees a un petit bloc de l'en-tete, peu visibles), celle-ci s'etend
// sur toute la hauteur de .corps (top:0;bottom:0) -- simplement rendue
// INERTE hors grand apercu (cursor:default) au lieu de MASQUEE, elle
// restait visible (son ::after, la barre grise) meme dans le petit
// apercu embarque, ou elle n'a plus aucune fonction. display:none par
// defaut desormais (le bouton d'inversion qui partageait ce sort a ete
// retire depuis, voir poigneeColonnes plus haut -- seule cette poignee
// de largeur subsiste sur le CV).
'  .poignee-redim-largeur-colonnes { position: absolute; top: 0; bottom: 0; width: 12px; margin-left: -6px; cursor: ew-resize; z-index: 5; display: none; }' +
'  .poignee-redim-largeur-colonnes::after { content: ""; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 4px; height: 40px; border-radius: 2px; background: rgba(0,0,0,0.2); }' +
'  body.mode-grand-apercu .poignee-redim-largeur-colonnes { display: block; }' +
// TACHE (retour utilisateur : "grand espace vide apres Formations, la
// colonne s'arrete mais reste etiree jusqu'a la hauteur de l'autre") :
// align-items par defaut (= stretch) etire la colonne la plus courte
// jusqu'a la hauteur de sa voisine, meme quand rien ne justifie cet
// espace -- flex-start supprime ce vide fantome. Exclusion explicite via
// :has() : la ou une colonne porte reellement .fond-transfere (bande
// coloree pleine hauteur, voir pleineHauteurGauche/Droite plus haut dans
// ce fichier), stretch reste NECESSAIRE au rendu (la couleur doit
// remplir toute la hauteur reelle) -- jamais desactive dans ce cas
// precis, uniquement quand aucune colonne n'en a besoin.
'  .corps:not(:has(> .colonne.fond-transfere)) { align-items: flex-start; }' +
// TACHE (retour utilisateur 2026-09-15) : "en 1 colonne je veux un seul
// bloc, sans cet espace entre les rubriques" -- .corps garde 2 <div
// class="colonne"> empilees meme en 1 colonne (voir plus haut,
// titresColoresUniforme1Colonne : necessaire pour que fondColonnes/
// titres-colores restent coherents sur toute la hauteur). Le "gap" flex
// (espace entre les 2 divs) et le padding vertical de chaque .colonne
// (haut ET bas, cumules a la jointure) creaient un blanc bien plus grand
// entre les 2 moities qu'entre 2 rubriques normales de la meme colonne --
// annule ici uniquement a la jointure, jamais sur les bords externes.
'  .corps.mode-1-colonne { flex-direction: column; gap: 0; }' +
'  .corps.mode-1-colonne .colonne { width: 100%; }' +
'  .corps.mode-1-colonne .colonne:first-child { padding-bottom: 0; }' +
'  .corps.mode-1-colonne .colonne:last-child { padding-top: 0; }' +
'  .corps.avec-separateur > .colonne:first-child { border-right: 1px solid rgba(0,0,0,0.15); padding-right: 16px; }' +
'  .colonne { flex: 1; min-width: 0; border-radius: ' + radiusColonne + '; padding: 14px 16px; }' +
// TACHE (largeur des colonnes ajustable) : flex-basis en % du corps,
// gap retire a parts egales des 2 cotes (calc) pour que gauche+droite
// somment exactement 100% du corps, jamais un debordement de la largeur
// du `gap` -- flex-shrink laisse a 1 (valeur par defaut de la propriete
// raccourcie `flex`) pour absorber un arrondi de calc au pixel pres,
// jamais un flex-shrink:0 qui figerait un depassement. Ignore en
// 1 colonne (.mode-1-colonne, regle width:100% ci-dessus, prioritaire).
// TACHE (retour utilisateur 2026-09-15, bug reel confirme et enfin
// isole -- LA cause de tous les ecarts de largeur constates depuis ce
// matin, "j'ai l'impression que ca s'inverse") : :last-child ne
// matchait plus DU TOUT des l'ajout de poigneeColonnes (0b614cc, ce
// matin) -- ce div est ajoute APRES les 2 .colonne dans le DOM
// (colonnesHtml plus haut), donc la 2e .colonne n'est plus le DERNIER
// enfant de .corps, seulement la derniere .colonne. Cette regle ne
// s'appliquait donc plus jamais, son flex-basis retombait a 0% (valeur
// par defaut), et le flex-grow:1 partage sur les 2 colonnes redistribuait
// l'espace restant a parts egales -- melangeant la vraie valeur voulue
// avec une repartition 50/50 fantome, donnant un ratio final ni celui
// demande ni 50/50 (~65/35 au lieu de 35/65 observe -- proche d'un
// INVERSE). :last-of-type (cible le type d'element, insensible aux
// freres non-.colonne ajoutes apres) au lieu de :last-child -- seule la
// regle vraiment cassee, :first-child reste correct (rien n'est ajoute
// AVANT la 1ere colonne). CORRECTIF (suite) : :last-of-type essaye
// d'abord ici ne fonctionne PAS non plus -- ":of-type" ne filtre que sur
// le NOM DE BALISE (div), jamais sur la classe : poigneeColonnes est
// AUSSI un <div>, donc :last-of-type continuait a cibler CE div-la
// plutot que la 2e .colonne, flex-basis retombant toujours a 0%. Seul
// :nth-child(2) cible correctement "le 2e enfant, s'il est .colonne" --
// insensible au nombre et au type des freres ajoutes ensuite, tant que
// les 2 .colonne restent en positions 1 et 2 (toujours vrai, poignee
// et bouton sont toujours ajoutes APRES elles, jamais entre les deux).
'  .corps:not(.mode-1-colonne) > .colonne:nth-child(1) { flex: 1 ' + largeurColonneGauche + '% ; flex-basis: calc(' + largeurColonneGauche + '% - ' + gapCorps + ' / 2); }' +
'  .corps:not(.mode-1-colonne) > .colonne:nth-child(2) { flex: 1 ' + (100 - largeurColonneGauche) + '%; flex-basis: calc(' + (100 - largeurColonneGauche) + '% - ' + gapCorps + ' / 2); }' +
'  .colonne.colonne-diagonale-droite { clip-path: polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%); padding-right: 30px; border-radius: ' + radiusColonne + ' 0 0 ' + radiusColonne + '; }' +
'  .colonne.colonne-diagonale-gauche { clip-path: polygon(26px 0, 100% 0, 100% 100%, 0 100%); padding-left: 30px; border-radius: 0 ' + radiusColonne + ' ' + radiusColonne + ' 0; }' +
// TACHE (chantier "CV Créatif") : meme mecanique que les 2 regles
// diagonale juste au-dessus (clip-path sur le bord INTERIEUR de la
// colonne a fond plein) mais avec 2 renflements au lieu d'une seule ligne
// oblique -- les 2 polygones sont l'un le miroir exact de l'autre (memes
// y, x refletes autour du centre), jamais 2 formes dessinees separement.
'  .colonne.colonne-vague-droite { clip-path: polygon(0 0, 100% 0, 100% 18%, calc(100% - 20px) 32%, 100% 46%, 100% 54%, calc(100% - 20px) 68%, 100% 82%, 100% 100%, 0 100%); padding-right: 26px; border-radius: ' + radiusColonne + ' 0 0 ' + radiusColonne + '; }' +
'  .colonne.colonne-vague-gauche { clip-path: polygon(100% 0, 0 0, 0 18%, 20px 32%, 0 46%, 0 54%, 20px 68%, 0 82%, 0 100%, 100% 100%); padding-left: 26px; border-radius: 0 ' + radiusColonne + ' ' + radiusColonne + ' 0; }' +
'  .colonne.degrade-actif { background: linear-gradient(var(--degrade-angle), var(--fond-accent-debut) 0%, var(--fond-accent-fin) 100%); color: var(--texte-fond); }' +
// .fond-transfere : la colonne du CORPS qui a "cede" son fond a la bande
// laterale (voir pleineHauteurGauche/Droite, plus haut dans ce fichier)
// reste .degrade-actif (pour son texte blanc/noir, ses puces...) mais son
// PROPRE fond devient transparent -- sinon 2 degrades legerement decales
// (l'un sur la hauteur du corps, l'autre sur celle de la page) se
// superposeraient avec une couture visible a la jonction. Placee APRES
// .colonne.degrade-actif (meme specificite -- 2 classes -- la source
// order tranche) : bug reel trouve en testant, cette regle etait avant et
// perdait systematiquement.
'  .colonne.fond-transfere { background: none; }' +
'  .colonne.degrade-actif .rubrique h2 { color: var(--texte-fond); border-bottom-color: var(--bordure-fond-attenuee); }' +
'  .colonne.degrade-actif .rubrique .item, .colonne.degrade-actif .ligne-mission, .colonne.degrade-actif .texte-profil { color: var(--texte-fond-attenue); }' +
'  .rubrique { margin-bottom: ' + margeRubrique + '; }' +
'  .rubrique h2 { font-size: ' + tailleTitreRubrique + '; text-transform: uppercase; letter-spacing: 0.05em; color: var(--degrade-debut); border-bottom: ' + epaisseurTitre + ' solid #e0e0e0; padding-bottom: 4px; margin: 0 0 8px 0; }' +
// TACHE (retour utilisateur : icônes "trait fin" modernes, coordonnées +
// rubriques) : taille/alignement RELATIFS (em) -- suit automatiquement la
// taille de police du contexte (h2 de rubrique, ligne de coordonnees sous
// le nom, badge du bandeau disponibilite...), jamais une taille fixe qui
// desalignerait un de ces 3 contextes. stroke="currentColor" (voir
// _pdfIconeSvg) fait deja tout le travail de couleur -- rien a regler ici.
'  .icone-ligne { width: 0.85em; height: 0.85em; vertical-align: -0.1em; margin-right: 0.32em; flex-shrink: 0; }' +
// TACHE (modele "Pastille") : display:contents par defaut -- ce wrapper
// (voir _pdfTitreH2) reste totalement invisible au rendu normal (l'icone
// a l'interieur se comporte EXACTEMENT comme avant, aucune regression sur
// les 9 modeles existants) ; seul .style-titres-pastille lui donne une
// vraie boite plus bas.
'  .icone-titre { display: contents; }' +
'  .style-titres-pastille .rubrique h2 { display: flex; align-items: center; border-bottom: none; padding-bottom: 0; color: #1b1b1b; }' +
'  .style-titres-pastille .icone-titre { display: inline-flex; align-items: center; justify-content: center; width: 1.7em; height: 1.7em; border-radius: 50%; background: var(--degrade-debut); margin-right: 0.5em; flex: none; }' +
'  .style-titres-pastille .icone-titre .icone-ligne { width: 0.55em; height: 0.55em; margin: 0; stroke: var(--texte-fond); }' +
// TACHE (modele "Pastille") : filet plein largeur en haut de page.
'  .filet-haut { height: 6px; background: var(--degrade-debut); }' +
// TACHE (modele "Médaillon") : cf. .photo-conteneur.pleine-hauteur-gauche/
// droite juste en dessous, meme technique. bottom:0 + translateY(50%)
// place le CENTRE du cercle exactement sur le bord bas de .entete, quelle
// que soit sa hauteur reelle (jamais mesuree a la generation -- voir la
// tache "au fil du texte" plus haut) : translateY(%) se calcule sur la
// hauteur de l\'ELEMENT LUI-MEME, jamais sur celle de son parent.
// TACHE (bug reel mesure en direct : le bas du medaillon, qui deborde de
// 30px sous .entete par construction -- la moitie de ses 60px, voir le
// calcul translateY(50%) plus bas -- chevauchait les premieres lignes de
// la colonne de gauche, .entete ne gardant que ses 16px de margin-bottom
// habituels) : marge bas dediee, 16px + 30px de debordement + une
// respiration de 10px, jamais recalculee dynamiquement (hauteur du
// medaillon fixe, 60px, voir .photo-entete).
'  .entete.medaillon-actif { position: relative; margin-bottom: 56px; }' +
'  .photo-conteneur.medaillon { position: absolute; left: 14mm; bottom: 0; top: auto; transform: translateY(50%); z-index: 4; }' +
'  .photo-conteneur.medaillon .photo-entete { box-shadow: 0 0 0 4px #fff; }' +
// TACHE (medaillon) : nom/metier doivent laisser la place HORIZONTALEMENT
// a la photo (60px + marge) quelle que soit sa position verticale (qui
// straddle le bord du bandeau, jamais alignee avec le texte) -- reserve
// donc une marge gauche fixe sur les 2 blocs, plutot que de recalculer
// leur position.x un par un (voir aussi le positionnement libre dedie,
// _pdfAppliquerRecetteCreatifDOM).
// TACHE (point 19) : coordonnees, desormais un bloc separe de nom (voir
// blocCoordonneesFixe/blocCoordonneesLibre plus bas), doit garder la MEME
// marge que nom pour rester derriere le medaillon -- sinon regression
// visuelle reelle (coordonnees retomberait a sa position par defaut,
// jamais decalee, chevauchant la photo).
'  .entete.medaillon-actif .entete-gauche, .entete.medaillon-actif .entete-bloc-texte[data-entete-bloc="nom"], .entete.medaillon-actif .entete-bloc-texte[data-entete-bloc="coordonnees"] { padding-left: 30mm; }' +
// TACHE (retour utilisateur 2026-09-15, bug reel confirme, reproductible
// sur ~1 tirage "Style au hasard" sur 4 : "le texte qui depasse la
// colonne de couleur") : display:inline-block SANS max-width fait que
// ces 2 titres se dimensionnent sur leur largeur de texte NATURELLE
// (Verdana/Garamond majuscules, "EXPERIENCE PROFESSIONNELLE" est long)
// au lieu de respecter la largeur de la colonne -- ils depassaient donc
// silencieusement des que la police/la largeur de colonne tiree au
// hasard rendait ce texte plus large que la colonne. max-width:100% +
// box-sizing (le padding horizontal 10px de chaque cote doit rester A
// L'INTERIEUR de cette largeur, jamais s'y ajouter) : force le titre a
// repasser sur 2 lignes plutot que deborder, quelle que soit la
// combinaison policeK/largeur tiree -- corrige la CATEGORIE de bug,
// jamais une combinaison particuliere.
'  .style-titres-bandeau .rubrique h2 { background: var(--degrade-debut); color: var(--texte-fond); border-bottom: none; padding: 3px 10px; border-radius: 4px; display: inline-block; max-width: 100%; box-sizing: border-box; }' +
'  .style-titres-bandeau .colonne.degrade-actif .rubrique h2 { background: var(--fond-titre-bandeau-sur-degrade); }' +
'  .style-titres-aucun .rubrique h2 { border-bottom: none; padding-bottom: 0; }' +
'  .colonne.titres-colores .rubrique h2 { background: var(--degrade-debut); color: var(--texte-fond); border-bottom: none; padding: 3px 10px; border-radius: 4px; display: inline-block; max-width: 100%; box-sizing: border-box; }' +
'  .bandeau-competences-cles { padding: 10px 14mm 14px 14mm; margin-bottom: 16px; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; background: #f8fafc; }' +
'  .bandeau-competences-cles.coins-arrondis { border-radius: 12px; }' +
'  .bandeau-competences-cles h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--degrade-debut); margin: 0 0 8px 0; }' +
'  .rubrique .item { font-size: ' + tailleItem + '; margin-bottom: ' + margeItem + '; line-height: 1.4; }' +
'  .rubrique .item strong { display: block; font-size: ' + tailleItemStrong + '; }' +
// TACHE (retour utilisateur : "souligner le poste, les dates,
// l'entreprise... et pareil pour l'italique") : classes neutres
// (n'affectent QUE decoration/style, jamais la couleur/graisse -- le gras
// reste gere par le <strong> englobant, jamais duplique ici).
'  .style-partie-souligne { text-decoration: underline; }' +
'  .style-partie-italique { font-style: italic; }' +
// TACHE (retour utilisateur : "je puisse facilement identifier le poste,
// la date et l'entreprise -- lisible et clair") : formatExperiences
// 'ameliore' -- poste/periode sur une ligne (periode alignee a droite),
// entreprise en couleur d'accent juste en dessous, sur sa propre ligne.
'  .item-experience-ameliore .ligne-titre-experience { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }' +
'  .item-experience-ameliore .poste-experience { font-weight: 700; font-size: ' + tailleItemStrong + '; }' +
'  .item-experience-ameliore .periode-experience { font-size: ' + tailleItem + '; color: #666; white-space: nowrap; flex-shrink: 0; }' +
'  .item-experience-ameliore .entreprise-experience { font-weight: 600; color: var(--degrade-debut); font-size: ' + tailleItem + '; margin: 1px 0 3px 0; }' +
'  .colonne.degrade-actif .item-experience-ameliore .periode-experience { color: var(--texte-fond-attenue); }' +
'  .colonne.degrade-actif .item-experience-ameliore .entreprise-experience { color: var(--texte-fond); }' +
// TACHE (chantier "CV Créatif") : habille SEULEMENT la ligne titre+date de
// formatExperiences='ameliore' (voir juste au-dessus) -- jamais un 3e
// format d'experience invente, juste une decoration en plus par-dessus
// celui qui existe deja. align-items:center (pas baseline comme la regle
// nue ci-dessus) : le fond plein a besoin que poste et date restent
// verticalement centres l'un par rapport a l'autre, baseline les
// desalignerait visuellement avec le padding de la pilule.
'  .pilule-experiences .item-experience-ameliore .ligne-titre-experience { background: var(--degrade-debut); border-radius: 999px; padding: 4px 12px; align-items: center; }' +
'  .pilule-experiences .item-experience-ameliore .poste-experience { color: var(--texte-fond); }' +
'  .pilule-experiences .item-experience-ameliore .periode-experience { color: var(--texte-fond-attenue); }' +
'  .pilule-experiences .colonne.degrade-actif .item-experience-ameliore .ligne-titre-experience { background: var(--fond-titre-bandeau-sur-degrade); }' +
// TACHE (retour utilisateur 2026-09-15, "des petites bulles pour
// chaque nouvelle ligne... pour faciliter la lecture") : chaque mission
// a deja sa PROPRE ligne (.ligne-mission, une par segment de texte,
// voir _pdfRenduMissions) mais sans aucun repere visuel -- juste des
// lignes empilees, difficiles a distinguer d'un paragraphe continu des
// qu'une mission se replie sur 2 lignes. Une puce ("•") par ligne de
// mission ; jamais une puce supplementaire entre 2 experiences
// differentes, qui ont deja leur propre bloc distinct (poste + entreprise
// + dates, voir _pdfBlocExperiences) -- inutile de le repeter ici.
// currentColor (jamais une variable de couleur fixe) : suit
// automatiquement le texte environnant, deja correct sur fond blanc
// COMME sur une colonne coloree (.colonne.degrade-actif .ligne-mission,
// regle plus haut) sans reecrire 2 fois la meme regle.
'  .ligne-mission { font-size: ' + tailleItem + '; line-height: 1.4; position: relative; padding-left: 13px; }' +
'  .ligne-mission::before { content: "\\2022"; position: absolute; left: 0; color: currentColor; }' +
'  .puce-competence { display: inline-block; background: ' + couleurFondCompetences + '; color: ' + couleurTextePuces + '; border-radius: 10px; padding: 2px 9px; font-size: ' + tailleCompetence + '; margin: 0 4px 4px 0; }' +
// TACHE (chantier "10 nouveaux modeles Créatif") : styleCompetences='barre'
// -- soulignement epais decoratif, PLEINE largeur uniforme (voir commentaire
// juste au-dessus de son appel, jamais une longueur variable qui
// suggererait un niveau invente).
'  .bloc-competence-encadre { border: 1.5px solid var(--degrade-debut); border-radius: 18px; padding: 8px 12px; margin-bottom: 10px; }' +
'  .bloc-competence-encadre .rubrique { margin-bottom: 0; }' +
'  .colonne.degrade-actif .bloc-competence-encadre { border-color: var(--texte-fond); }' +
'  .barre-competence { margin: 0 0 6px; }' +
'  .barre-competence span { font-size: ' + tailleCompetence + '; color: ' + couleurTextePuces + '; }' +
'  .barre-trait { height: 3px; background: var(--degrade-debut); border-radius: 2px; margin-top: 2px; }' +
'  .colonne.degrade-actif .barre-trait { background: var(--texte-fond); }' +
'  .puce-competence.style-rectangle { border-radius: 3px; }' +
'  .texte-competences { color: ' + couleurTextePuces + '; font-size: ' + tailleCompetence + '; line-height: 1.5; margin: 0; }' +
'  .colonne.degrade-actif .puce-competence { background: var(--fond-puce-sur-degrade); color: var(--texte-fond); }' +
'  .colonne.degrade-actif .texte-competences { color: var(--texte-fond-attenue); }' +
'  @media print { .page-a4 { margin: 0 auto; box-shadow: none; } .rubrique, .item { break-inside: avoid; } }' +
// TACHE (glisser-deposer des rubriques) : affordance visuelle uniquement
// (le comportement -- dragstart/dragover/drop -- est cable par le panneau,
// cvPdfPanneauReglages.js, jamais ici -- ce fichier ne fait que du HTML/CSS).
// `.groupe-rubrique` reste neutre au repos (aucune marge/bordure propre,
// les .rubrique internes gardent les leurs) pour ne rien changer au rendu
// STATIQUE (export/impression, ou aucun script de drag n'est jamais
// attache) -- seul un survol change le curseur, jamais la mise en page.
'  .groupe-rubrique { cursor: grab; }' +
// TACHE (retour utilisateur : "petit apercu -- on ne doit voir que le
// modele genere") : ces curseurs (grab/move/pointer/ew-resize) annoncent
// une interaction -- desormais reservee au grand apercu (voir
// window.__cvPdfModeGrandApercu, cvPdfPanneauReglages.js) : curseur par
// defaut dans le petit apercu, pour ne jamais laisser croire qu\'un clic
// fera quelque chose qui, precisement, ne fait plus rien.
'  body:not(.mode-grand-apercu) .groupe-rubrique, body:not(.mode-grand-apercu) .entete-bloc-texte, ' +
'  body:not(.mode-grand-apercu) .entete-libre .bloc-libre, body:not(.mode-grand-apercu) .bandeau-cliquable, ' +
'  body:not(.mode-grand-apercu) .poignee-redim-accroche, body:not(.mode-grand-apercu) .poignee-redim-metier { cursor: default; }' +
'  .groupe-rubrique.en-glissement { opacity: 0.4; }' +
'  .colonne.zone-depot-active { outline: 2px dashed var(--degrade-debut); outline-offset: -4px; }' +
'  .groupe-rubrique.indicateur-depot-avant { box-shadow: 0 -3px 0 0 var(--degrade-debut); }' +
'  .groupe-rubrique.indicateur-depot-apres { box-shadow: 0 3px 0 0 var(--degrade-debut); }' +
// TACHE (agrandissement par rubrique) : le bloc identite (nom/metier/
// accroche) se clique aussi pour ouvrir la mini-barre flottante -- meme
// affordance curseur que .groupe-rubrique, jamais une 2e regle dupliquee.
'  .entete-bloc-texte { cursor: grab; }' +
// TACHE (retour utilisateur : "position libre... sur les axes x/y...
// si ca depasse, le cadre devient rouge") : .entete-libre passe en
// position:relative avec une hauteur minimale (les blocs absolus ne
// contribuent pas a la hauteur naturelle du bandeau, sans quoi il
// s'effondrerait a la hauteur de la seule photo, voire 0). Les blocs
// eux-memes passent en position:absolute (voir _pdfStylePositionLibre) --
// curseur "move" pour signaler qu'ils se glissent librement (different du
// "grab" du mode empile, glisser-depose HTML5 classique). ".hors-cadre"
// (classe posee/retiree cote client, cvPdfPanneauReglages.js, jamais ici
// -- calcul de debordement reel non disponible a la generation du CSS)
// signale visuellement un bloc qui deborde du bandeau colore.
// TACHE (point 19, retour utilisateur : "rendre la hauteur de la zone
// d'en-tete redimensionnable a la souris") : min-height pilotee par
// opts.hauteurEntete (poignee dediee, cvPdfPanneauReglages.js) -- 210px
// reste le defaut D'ORIGINE si jamais redimensionne (aucun changement pour
// qui n'utilise pas cette poignee).
'  .entete-libre { position: relative; min-height: ' + (parseInt(opts.hauteurEntete, 10) || 210) + 'px; }' +
'  .entete-libre .bloc-libre { cursor: move; max-width: 65%; }' +
'  .entete-libre .bloc-libre.hors-cadre { outline: 3px solid #dc2626; outline-offset: 2px; background: rgba(220,38,38,0.06); }' +
// TACHE (retour utilisateur : "pas les rubriques d'en-tete empilees les
// unes sur les autres -- le metier en haut au milieu, en grand, aussi
// grand que le nom") : le metier (.metier-vise) restait a sa taille de
// sous-titre habituelle (12px, pensee pour le mode empile ou il est SOUS
// le nom) -- en position libre, ou il devient un bloc autonome mis en
// avant, il passe desormais a la meme taille que le nom (h1, 24px).
// Doit gagner sur `.entete .metier-vise` (meme specificite, 2 classes) :
// place APRES elle dans la feuille de style, jamais un !important.
'  .entete-libre .metier-vise { font-size: 22px; }' +
// TACHE (retour utilisateur, bug reel confirme en testant la nouvelle
// disposition 3 colonnes : "nom+coordonnees / metier au milieu / accroche
// a droite") : le metier (comme nom/accroche) heritait du max-width:65%
// partage de .bloc-libre -- beaucoup trop large pour la colonne du
// milieu, un intitule un peu long (ex. "OUVRIER POLYVALENT DU BATIMENT")
// s\'etendait alors JUSQUE SOUS le rectangle d\'accroche (chevauchement
// non voulu par defaut, meme si tolere par ailleurs -- voir plus haut).
// Largeur propre, alignee sur le tiers de colonne reellement disponible
// entre nom (fini vers 24%) et accroche (debute a 68%) ; centre pour un
// rendu "grand titre au milieu", pas juste aligne a gauche comme nom.
'  .entete-libre .bloc-libre[data-entete-bloc="metier"] { max-width: 32%; text-align: center; }' +
// TACHE (retour utilisateur, bug reel confirme : "le cote gauche c'est
// bien, mais le cote droit pas du tout" -- le rectangle de l'accroche
// s'elargissait (voir blocAccrocheLibre, width inline), mais le texte a
// l'interieur restait cale sur son ancien max-width:90mm FIXE (regle de
// base .entete .accroche-entete plus haut, jamais pensee pour un
// conteneur redimensionnable) -- le texte n'atteignait donc jamais le
// bord droit reel du rectangle. Doit gagner sur la regle de base (meme
// specificite, place APRES elle).
'  .entete-libre .accroche-entete { max-width: 100%; }' +
// TACHE (retour utilisateur : "je puisse avec la souris modifier la
// taille de ce rectangle... le retrecir, l'agrandir") : poignee visible
// sur le bord droit du rectangle d'accroche, glisser-depose souris dedie
// (_pdfActiverRedimensionnementBlocLibre, cvPdfPanneauReglages.js) --
// jamais affichee hors position libre (aucun rectangle a redimensionner
// dans les autres modes).
// TACHE (retour utilisateur : "je veux la meme possibilite pour le
// titre [metier vise]... eviter que l'intitule et le titre se
// chevauchent") : meme poignee, meme mecanisme -- juste un 2e rectangle
// cible (jamais une 2e regle CSS dupliquee, .poignee-redim-metier
// partage exactement les memes styles que .poignee-redim-accroche).
'  .poignee-redim-accroche, .poignee-redim-metier { position: absolute; top: 0; right: -6px; bottom: 0; width: 12px; cursor: ew-resize; }' +
'  .poignee-redim-accroche::after, .poignee-redim-metier::after { content: ""; position: absolute; top: 50%; right: 4px; transform: translateY(-50%); width: 4px; height: 28px; border-radius: 2px; background: rgba(0,0,0,0.2); }' +
'  .entete.bandeau-actif .poignee-redim-accroche::after, .entete.bandeau-actif .poignee-redim-metier::after { background: rgba(255,255,255,0.5); }' +
// TACHE (point 19, retour utilisateur : "rendre la hauteur de la zone
// d'en-tete redimensionnable a la souris") : poignee horizontale sur le
// BORD BAS de .entete-libre (jamais un bloc particulier -- c'est la zone
// entiere qui grandit/retrecit) -- meme esprit visuel que les poignees
// accroche/metier ci-dessus (barre centree), juste orientee pour un
// redimensionnement vertical (ns-resize).
'  .poignee-redim-hauteur-entete { position: absolute; left: 0; right: 0; bottom: -6px; height: 12px; cursor: ns-resize; }' +
'  .poignee-redim-hauteur-entete::after { content: ""; position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); height: 4px; width: 28px; border-radius: 2px; background: rgba(0,0,0,0.2); }' +
'  .entete.bandeau-actif .poignee-redim-hauteur-entete::after { background: rgba(255,255,255,0.5); }' +
// TACHE (retour utilisateur : "cliquer sur le bandeau coordonnees pour
// choisir pastille/rectangle/texte + couleurs") : pointeur (pas grab --
// ce bandeau n'est pas glissable, juste cliquable pour ouvrir la
// mini-barre flottante, voir _pdfActiverClicBandeaux).
'  .bandeau-cliquable { cursor: pointer; }';

  // TACHE (lot moteur "La mise en page", sous-lot 3 -- Alignement) : le corps
  // du CV (missions, texte de profil, competences en texte) passe en
  // justifie quand composition.alignementCorps === 'justifie'. Titres et
  // en-tete non concernes. Meme reglage cote Word (composeurRender.js,
  // AlignmentType.JUSTIFIED sur les memes familles de paragraphes).
  if (composition && composition.alignementCorps === 'justifie') {
    css += ' .rubrique .item, .ligne-mission, .texte-profil, .texte-competences { text-align: justify; }';
  }
  // TACHE (lot moteur "La mise en page", sous-lot 6 -- eviter un titre seul
  // en bas de page) : quand le controle est actif (defaut, ou choix
  // explicite), un titre de rubrique reste colle a son premier contenu
  // (break-after: avoid) et on demande 2 lignes minimum de part et d'autre
  // d'une coupure (orphans / widows). Le "break-inside: avoid" des .rubrique
  // / .item du bloc @media print existant est conserve tel quel.
  if (!composition || composition.controleVeuvesOrphelines !== false) {
    css += ' .rubrique h2 { break-after: avoid; page-break-after: avoid; }' +
      ' .rubrique .item, .ligne-mission { orphans: 2; widows: 2; }';
  }
  // TACHE (lot moteur "La mise en page", sous-lot 2 -- Interligne) : ratio
  // (serre 0.9 / normal 1 / aere 1.15) applique aux line-height du CORPS
  // (profil, items, missions, competences en texte). base 1.45 -> 1.31 en
  // serre, 1.67 en aere. Titres et en-tete non concernes. 1 = neutre.
  if (composition && composition.interligneCorps && composition.interligneCorps !== 1) {
    var _pdfInterligne = (1.45 * composition.interligneCorps).toFixed(2);
    css += ' .texte-profil, .rubrique .item, .ligne-mission, .texte-competences { line-height: ' + _pdfInterligne + '; }';
  }
  // TACHE (lot moteur "La mise en page", sous-lot 2 -- Marges de page) :
  // surcharge la marge laterale (14mm par defaut) des conteneurs de haut
  // niveau. Les decorations Creatif positionnees en absolu (medaillon, bande
  // verticale, losange) gardent leur 14mm litteral -- decalage cosmetique
  // mineur, jamais une perte de donnee. Appende APRES les regles de base,
  // donc gagne par ordre source a specificite egale.
  if (composition && composition.margeLateralePdf && composition.margeLateralePdf !== '14mm') {
    var _pdfMargeLat = composition.margeLateralePdf;
    css += ' .entete { padding-left: ' + _pdfMargeLat + '; padding-right: ' + _pdfMargeLat + '; }' +
      ' .corps { padding-left: ' + _pdfMargeLat + '; padding-right: ' + _pdfMargeLat + '; }' +
      ' .bandeau-disponibilite { padding-left: ' + _pdfMargeLat + '; padding-right: ' + _pdfMargeLat + '; }' +
      ' .bandeau-competences-cles { padding-left: ' + _pdfMargeLat + '; padding-right: ' + _pdfMargeLat + '; }';
  }

  // TACHE (agrandissement par rubrique) : pour chaque rubrique dont
  // l'echelle differe de 1 (reglee via la mini-barre flottante du
  // panneau), une regle CSS scopee par [data-rubrique="cle"] surcharge
  // titre/contenu/marges avec la MEME formule que le global
  // (_pdfCalculerTaillesRubrique), juste appliquee a echelle*echelleLocale
  // -- jamais une 2e logique de taille inventee pour ce cas.
  Object.keys(echellesRubriques).forEach(function (cle) {
    var echelleLocale = echellesRubriques[cle];
    if (!echelleLocale || echelleLocale === 1) { return; }
    // TACHE (retour utilisateur : "pouvoir agrandir/reduire le nom et le
    // poste vise") : formule DEDIEE, distincte de _pdfCalculerTaillesRubrique
    // (qui cible .rubrique h2/.item, inexistants dans l'en-tete) --
    // JAMAIS multipliee par l'echelle globale `echelle` (curseur "Taille du
    // texte"), l'en-tete restant volontairement exclu de ce reglage global
    // (voir plus haut, "l'en-tete ne bouge JAMAIS"). L'accroche suit
    // proportionnellement la taille du poste visé, pas de curseur separe.
    if (cle === 'entete-nom') {
      css += ' .entete-bloc-texte[data-entete-bloc="nom"] h1 { font-size: ' + Math.round(24 * echelleLocale) + 'px; }';
      return;
    }
    // TACHE (retour utilisateur : "position libre... et pareil pour le
    // texte de profil, pareil pour le metier") : metier et accroche sont
    // 2 blocs SEPARES (voir plus bas,
    // positionLibreEntete) -- chacun a donc sa propre echelle, memes
    // formules que ci-dessus, juste scindees.
    if (cle === 'entete-metier') {
      // Base 22px (position libre, voir .entete-libre .metier-vise plus
      // haut), pas 12px comme le mode empile (.entete-bloc-texte[objectif]
      // ci-dessus) -- sinon un agrandissement via la mini-barre flottante
      // RETRECIRAIT le texte des que l'echelle repasse sous ~1.8x.
      css += ' .entete-bloc-texte[data-entete-bloc="metier"] .metier-vise { font-size: ' + Math.round(22 * echelleLocale) + 'px; }';
      return;
    }
    if (cle === 'entete-accroche') {
      css += ' .entete-bloc-texte[data-entete-bloc="accroche"] .accroche-entete { font-size: ' + (11.5 * echelleLocale).toFixed(2) + 'px; }';
      return;
    }
    // TACHE (point 19) : coordonnees, desormais son propre bloc -- meme
    // principe que metier/accroche ci-dessus, base 11px (voir la regle de
    // base .entete .coordonnees-sous-nom plus haut, jamais une 2e valeur
    // inventee).
    if (cle === 'entete-coordonnees') {
      css += ' .entete-bloc-texte[data-entete-bloc="coordonnees"] .coordonnees-sous-nom { font-size: ' + (11 * echelleLocale).toFixed(2) + 'px; }';
      return;
    }
    var t = _pdfCalculerTaillesRubrique(echelle * echelleLocale);
    // TACHE (retour utilisateur, bug reel confirme par capture d'ecran :
    // "Competences cles"/"Bandeau coordonnees" a 75% et 140% -- rendu
    // identique") : ces 2 blocs ne sont PAS enveloppes dans .groupe-rubrique
    // (ce sont des .bandeau-competences-cles/.bandeau-disponibilite a part,
    // voir plus haut) -- le selecteur composait .groupe-rubrique[data-rubrique]
    // ne matchait donc jamais rien pour eux. Attribut SEUL (meme convention
    // que l'override de police juste en dessous) : matche aussi bien les
    // .groupe-rubrique normaux que ces 2 bandeaux, sans rien casser.
    var selecteur = '[data-rubrique="' + cle + '"]';
    css += ' ' + selecteur + ' .rubrique h2 { font-size: ' + t.tailleTitreRubrique + '; }' +
      ' ' + selecteur + ' .rubrique { margin-bottom: ' + t.margeRubrique + '; }' +
      ' ' + selecteur + ' .item { font-size: ' + t.tailleItem + '; margin-bottom: ' + t.margeItem + '; }' +
      ' ' + selecteur + ' .item strong { font-size: ' + t.tailleItemStrong + '; }' +
      ' ' + selecteur + ' .ligne-mission { font-size: ' + t.tailleItem + '; }' +
      ' ' + selecteur + ' .puce-competence { font-size: ' + t.tailleCompetence + '; }' +
      ' ' + selecteur + ' .texte-competences { font-size: ' + t.tailleCompetence + '; }' +
      ' ' + selecteur + ' .texte-profil { font-size: ' + t.tailleItem + '; }';
  });

  // TACHE (retour utilisateur : "corps de texte de la rubrique, meme
  // police ou une autre au choix") : UNE seule regle par rubrique (la
  // police s'herite a tous les descendants, titre inclus -- jamais besoin
  // de cibler chaque classe de texte individuellement comme pour la
  // taille ci-dessus).
  Object.keys(policesRubriques).forEach(function (cle) {
    var idPolice = policesRubriques[cle];
    if (!idPolice) { return; }
    // Selecteur d'attribut SEUL (jamais restreint a .groupe-rubrique) :
    // s'applique aussi bien aux rubriques du corps qu'aux blocs d'en-tete
    // (entete-nom/entete-metier/entete-accroche, meme mini-barre
    // reutilisee, voir plus haut), sans code duplique -- les cles ne se
    // chevauchent jamais.
    css += ' [data-rubrique="' + cle + '"] { font-family: ' + (_PDF_POLICES[idPolice] || _PDF_POLICES.segoe) + '; }';
  });

  // TACHE (retour utilisateur : "cliquer sur les competences/bandeau
  // coordonnees pour choisir leur couleur juste pour CETTE rubrique") :
  // regle CSS scopee par [data-rubrique="cle"] (specificite volontairement
  // MODESTE : 1 attribut + 1 classe) -- reste toujours battue par le filet
  // de securite de contraste existant (.colonne.degrade-actif .puce-competence,
  // 3 classes, plus haut dans ce fichier) : une couleur choisie ici pour
  // UNE rubrique ne casse donc jamais la lisibilite sur une colonne en
  // degrade, exactement comme le reglage global couleurFondCompetences/
  // couleurTextePuces. La FORME (pastille/rectangle/texte) n'est pas geree
  // ici -- deja resolue cote markup, voir _pdfStylePuceEffectif plus haut.
  Object.keys(stylesPuceRubriques).forEach(function (cle) {
    var override = stylesPuceRubriques[cle];
    if (!override) { return; }
    var fondOverride = override.couleurFond || couleurFondCompetences;
    var texteOverride = override.couleurTexte || couleurTextePuces;
    css += ' [data-rubrique="' + cle + '"] .puce-competence { background: ' + fondOverride + '; color: ' + texteOverride + '; }' +
      ' [data-rubrique="' + cle + '"] .texte-competences { color: ' + texteOverride + '; }';
  });

  // TACHE (retour utilisateur : "lui mettre la couleur si je veux,
  // changer la police, changer le style") : couleur + gras/italique par
  // bloc d'en-tete, meme principe de specificite MODESTE que ci-dessus
  // (attribut + classe -- jamais !important).
  var _PDF_SELECTEURS_TEXTE_ENTETE = {
    'entete-nom': ['.entete-bloc-texte[data-entete-bloc="nom"] h1'],
    'entete-metier': ['.entete-bloc-texte[data-entete-bloc="metier"] .metier-vise'],
    'entete-accroche': ['.entete-bloc-texte[data-entete-bloc="accroche"] .accroche-entete'],
    // TACHE (point 19, dissociation Nom/Coordonnees) : coordonnees devenu un
    // bloc independant (voir blocCoordonneesLibre/blocCoordonneesFixe plus
    // bas) -- meme mecanisme couleur/gras/italique que les 3 autres blocs
    // d'en-tete, jamais une 2e logique.
    'entete-coordonnees': ['.entete-bloc-texte[data-entete-bloc="coordonnees"] .coordonnees-sous-nom']
  };
  Object.keys(stylesTexteEntete).forEach(function (cle) {
    var override = stylesTexteEntete[cle];
    var selecteurs = _PDF_SELECTEURS_TEXTE_ENTETE[cle];
    if (!override || !selecteurs) { return; }
    var declarations = (override.couleur ? 'color: ' + override.couleur + ' !important; ' : '') +
      (override.gras ? 'font-weight: bold; ' : '') + (override.italique ? 'font-style: italic; ' : '');
    if (!declarations) { return; }
    // TACHE : !important reserve ICI a la seule couleur -- le nom/metier
    // heritent normalement de l'accent du theme via des regles a FORTE
    // specificite (ex. lecture guidee, bandeau colore) que ce selecteur
    // (attribut+classe) ne battrait pas autrement ; gras/italique n'ont
    // eux aucune regle concurrente a surpasser, jamais besoin d'!important.
    css += selecteurs.map(function (s) { return ' ' + s + ' { ' + declarations + '}'; }).join('');
  });

  // TACHE (retour utilisateur : "pouvoir agrandir/reduire le nom et le
  // poste vise") : data-rubrique en plus de data-entete-bloc -- reutilise
  // TEL QUEL le mecanisme de redimensionnement/style par clic deja
  // existant pour les rubriques du corps (mini-barre flottante,
  // cvPdfPanneauReglages.js/_pdfActiverGlisserEnTete), jamais une 2e UI.
  // Absente du HTML (pas juste masquee) si sansAccroche/pas de profil --
  // meme comportement "soit sous le metier, soit pas du tout" que le Word.
  var texteAccrocheEntete = profilTexte ? '<p class="accroche-entete">' + _pdfEscaperHtml(profilTexte) + '</p>' : '';
  var blocCoordonneesSousNom = coordonneesSousNomLignes ? '<p class="coordonnees-sous-nom">' + coordonneesSousNomLignes + '</p>' : '';
  var innerMetier = '<p class="metier-vise">' + _pdfEscaperHtml(objetCV.objectifProfessionnel || '') + '</p>';
  // TACHE (point 19, retour utilisateur : "dissocier le nom et les
  // coordonnees en 2 blocs independants") : innerNom ne contient plus QUE
  // le h1 -- blocCoordonneesSousNom (deja son propre <p>, voir juste
  // au-dessus) devient un 4e bloc d'en-tete a part entiere (blocCoordonneesLibre/
  // blocCoordonneesFixe plus bas), jamais fusionne avec le nom.
  var innerNom = '<h1>' + _pdfEscaperHtml(nomComplet) + '</h1>';

  // TACHE (retour utilisateur : "l'ideal pour le bandeau d'en haut, ca
  // serait que mon nom avec les coordonnees, le texte de profil et le
  // metier puissent etre en libre... si ca depasse, le cadre devient
  // rouge") : mode alternatif, remplace ENTIEREMENT le rendu par defaut
  // ci-dessous -- 3 blocs independants (nom+coordonnees, accroche, metier),
  // chacun positionne en absolu (%) dans .entete (jamais un mode "en
  // plus", toujours l'un OU l'autre, cf checkbox dediee dans le panneau).
  // Le debordement (cadre rouge) est un constat VISUEL calcule cote
  // client (getBoundingClientRect, cvPdfPanneauReglages.js) -- jamais
  // devinable ici a la generation du HTML/CSS seul.
  var positionLibreEntete = !!opts.positionLibreEntete;
  var positionsEntete = opts.positionsEntete || {};
  // TACHE (retour utilisateur : "pouvoir etirer le rectangle de l'accroche
  // en largeur" + "le meme rectangle... pour le metier, parce que parfois
  // le titre d'un metier peut etre beaucoup plus long") : 2 reglages de
  // largeur independants, actifs dans LES 2 dispositions (libre ET par
  // defaut cote a cote ci-dessous), jamais reserves a la seule position
  // libre.
  var largeurAccrocheLibreBrute = parseInt(opts.largeurAccrocheLibre, 10);
  var largeurAccrocheLibre = isNaN(largeurAccrocheLibreBrute) ? 30 : Math.min(90, Math.max(30, largeurAccrocheLibreBrute));
  var largeurMetierLibreBrute = parseInt(opts.largeurMetierLibre, 10);
  var largeurMetierLibre = isNaN(largeurMetierLibreBrute) ? 32 : Math.min(60, Math.max(20, largeurMetierLibreBrute));
  // TACHE (retour utilisateur, positions initiales revues UNE 2e FOIS :
  // "nom et coordonnees cote a cote AVEC la phrase d'accroche, et au
  // milieu en grand le metier vise") : vraie disposition en 3 COLONNES
  // alignees sur la meme bande horizontale -- nom+coordonnees a gauche,
  // metier centre (grand, voir .entete-libre .metier-vise plus haut),
  // accroche a droite. Purement les positions de DEPART -- reste
  // librement deplacable/redimensionnable ensuite, jamais fige.
  // TACHE (retour utilisateur : "photo pas encore repositionnee sur la
  // bande pleine hauteur") : nom decale plus bas (55% au lieu de 38%)
  // uniquement quand une photo existe ET vient prendre sa place au-dessus
  // de lui sur la bande pleine hauteur gauche (voir nomYAvecPhotoPleineHauteur,
  // calculee plus haut) -- inchange dans tous les autres cas.
  // TACHE (point 19, coordonnees devenu un bloc independant) : position de
  // depart juste sous le nom (meme x, y decale de +12 -- hauteur
  // approximative d'une ligne de h1 en % de .entete-libre), exactement la
  // ou les coordonnees s'affichaient deja quand elles etaient fusionnees
  // dans le meme bloc -- aucun changement visuel par defaut, seulement 2
  // blocs desormais deplacables independamment.
  var _PDF_POSITIONS_LIBRES_DEFAUT = { nom: { x: 2, y: nomYAvecPhotoPleineHauteur }, coordonnees: { x: 2, y: nomYAvecPhotoPleineHauteur + 12 }, metier: { x: 35, y: 20 }, accroche: { x: 68, y: 8 } };
  // TACHE (retour utilisateur : "peut-etre que ca peut etre une tres
  // bonne idee d'avoir aussi l'option 2 colonnes -- a gauche nom et
  // coordonnees, a droite le metier en haut et l'accroche plus bas sur la
  // MEME colonne -- plus coherent si le nom de metier est tres grand, on
  // est sur que le metier ET l'accroche vont rentrer") : 2e jeu de
  // positions de depart pour la position libre -- metier/accroche restent
  // 2 blocs INDEPENDANTS, toujours deplacables separement meme en 2
  // colonnes (jamais fusionnes en un seul bloc), juste empiles au depart
  // sur la meme moitie droite plutot qu'a 3 endroits distincts.
  var _PDF_POSITIONS_LIBRES_DEFAUT_2COLONNES = { nom: { x: 2, y: nomYAvecPhotoPleineHauteur }, coordonnees: { x: 2, y: nomYAvecPhotoPleineHauteur + 12 }, metier: { x: 55, y: 8 }, accroche: { x: 55, y: 38 } };
  var dispositionEntete = (opts.dispositionEntete === '2colonnes') ? '2colonnes' : '3colonnes';
  var positionsLibresDefaut = (dispositionEntete === '2colonnes') ? _PDF_POSITIONS_LIBRES_DEFAUT_2COLONNES : _PDF_POSITIONS_LIBRES_DEFAUT;
  // TACHE (retour utilisateur, bug reel confirme : "je ne veux pas que
  // cette colonne pleine hauteur soit chevauchee") : en position libre,
  // metier/accroche partent par defaut d'un x fixe (35%/55%/68%) qui
  // ignore totalement la largeur REELLE de la bande pleine hauteur
  // (largeurColonneGauche, ajustable 30-70%) -- a fortiori chevauchement
  // frequent verifie en testant. Repousse le point de depart des 2 blocs
  // juste apres la frontiere de la bande (largeurColonneGauche + marge),
  // jamais avant elle, quel que soit le cote colore (gauche : les sort
  // proprement DE la bande, texte deja sombre correct ; droite : les
  // amene proprement DANS la bande, texte blanc desormais correct --
  // voir .pleine-hauteur-droite .metier-vise/.accroche-entete plus haut).
  // Purement une position de DEPART -- reste deplacable ensuite comme le
  // reste de la position libre.
  if (pleineHauteurGauche || pleineHauteurDroite) {
    var _pdfXMinApresBande = largeurColonneGauche + 3;
    // TACHE (retour utilisateur, bug reel confirme sur un PDF reellement
    // telecharge : le metier et l'accroche se retrouvaient exactement
    // superposes, au MEME endroit) : quand la bande est assez large pour
    // que ce minimum depasse aussi le x de depart de l'accroche (pas
    // seulement celui du metier), les 2 Math.max() ci-dessous convergent
    // vers EXACTEMENT la meme valeur -- les 2 blocs partent alors du meme
    // point, cote a cote horizontalement mais sans plus aucun ecart entre
    // eux. Aucun ajustement de taille de texte (voir
    // _pdfAutoAjusterBandeauSiDebordement, cvPdfPanneauReglages.js) ne
    // peut corriger ce cas : la largeur/position des boites ne depend
    // jamais de l'echelle du texte qu'elles contiennent. Repli sur le
    // meme empilement vertical que la disposition 2 colonnes (metier
    // au-dessus, accroche en dessous, meme x) des que ce chevauchement
    // horizontal est detecte -- jamais superposes, quelle que soit la
    // largeur de bande choisie.
    var _pdfMetierXPousse = Math.max(positionsLibresDefaut.metier.x, _pdfXMinApresBande);
    var _pdfAccrocheXPousse = Math.max(positionsLibresDefaut.accroche.x, _pdfXMinApresBande);
    // TACHE (point 19) : coordonnees (comme nom) n'est jamais repousse par
    // la bande pleine hauteur ici -- deja positionne a gauche (x:2), jamais
    // du cote ou la bande apparait. Reporte donc TEL QUEL, jamais oublie
    // (un objet reconstruit sans cette cle ferait planter _pdfStylePositionLibre
    // plus bas, qui suppose positionsLibresDefaut[cle] toujours defini).
    positionsLibresDefaut = (_pdfAccrocheXPousse - _pdfMetierXPousse < largeurMetierLibre)
      ? { nom: positionsLibresDefaut.nom, coordonnees: positionsLibresDefaut.coordonnees, metier: { x: _pdfMetierXPousse, y: 8 }, accroche: { x: _pdfMetierXPousse, y: 38 } }
      : { nom: positionsLibresDefaut.nom, coordonnees: positionsLibresDefaut.coordonnees, metier: { x: _pdfMetierXPousse, y: positionsLibresDefaut.metier.y }, accroche: { x: _pdfAccrocheXPousse, y: positionsLibresDefaut.accroche.y } };
  }
  function _pdfStylePositionLibre(cle) {
    var pos = positionsEntete[cle] || positionsLibresDefaut[cle];
    // `width` ET `max-width` (pas juste max-width) : un bloc absolument
    // positionne sans largeur explicite se comporte en "shrink-to-fit"
    // (retrecit sur son contenu, ne s'etire jamais jusqu'au plafond) --
    // bug reel trouve en testant (max-width seul ne changeait rien au
    // rendu, le texte restait a sa largeur naturelle).
    var largeur = '';
    // TACHE (retour utilisateur : "si le titre est trop grand... comment
    // voir le texte ?") : la largeur du curseur (regLargeurMetierLibre/
    // regLargeurAccrocheLibre, jusqu'a 60%) est plafonnee ICI pour ne
    // jamais depasser le bord DROIT de la page depuis la position `pos.x`
    // -- bug reel confirme en testant (x + largeur pouvait depasser 100%,
    // ex. 73% + 32% = 105%, contenu pousse hors page). 97 (pas 100) :
    // marge de securite de 3%, jamais un chevauchement pixel-pres du bord.
    // Le TEXTE lui-meme ne "deborde" jamais horizontalement au-dela de
    // cette largeur -- un texte trop long RETOMBE sur plusieurs lignes
    // (comportement CSS normal d'un bloc de largeur fixe), il ne s'etale
    // jamais plus large que sa boite.
    if (cle === 'accroche') {
      var largeurAccrocheEffective = Math.min(largeurAccrocheLibre, Math.max(15, 97 - pos.x));
      largeur = ' width:' + largeurAccrocheEffective + '%; max-width:' + largeurAccrocheEffective + '%;';
    } else if (cle === 'metier') {
      var largeurMetierEffective = Math.min(largeurMetierLibre, Math.max(15, 97 - pos.x));
      largeur = ' width:' + largeurMetierEffective + '%; max-width:' + largeurMetierEffective + '%;';
    }
    return ' style="position:absolute;left:' + pos.x + '%;top:' + pos.y + '%;' + largeur + '"';
  }

  var enteteHtml;
  if (positionLibreEntete) {
    // TACHE (retour utilisateur : "je veux que le titre ait la meme
    // possibilite d'etre etire manuellement, pour eviter que l'intitule
    // et le titre se chevauchent") : poignee dediee (data-poignee-metier),
    // meme mecanisme que l'accroche ci-dessous (glisser-depose souris,
    // _pdfActiverRedimensionnementBlocLibre, cvPdfPanneauReglages.js) --
    // le curseur dedie du panneau (regLargeurMetierLibre) reste disponible
    // en plus, jamais retire (les 2 pilotent la MEME valeur, voir
    // _pdfActiverRedimensionnementBlocLibre).
    var blocMetierLibre = '<div class="entete-bloc-texte bloc-libre" data-entete-bloc="metier" data-rubrique="entete-metier"' + _pdfStylePositionLibre('metier') + '>' +
      innerMetier +
      '<div class="poignee-redim-metier" data-poignee-metier></div>' +
      '</div>';
    // TACHE (retour utilisateur : "je puisse avec la souris modifier la
    // taille de ce rectangle") : poignee dediee (data-poignee-accroche),
    // glisser-depose souris cable cote panneau
    // (_pdfActiverRedimensionnementBlocLibre, cvPdfPanneauReglages.js).
    var blocAccrocheLibre = texteAccrocheEntete
      ? '<div class="entete-bloc-texte bloc-libre" data-entete-bloc="accroche" data-rubrique="entete-accroche"' + _pdfStylePositionLibre('accroche') + '>' +
        texteAccrocheEntete +
        '<div class="poignee-redim-accroche" data-poignee-accroche></div>' +
        '</div>'
      : '';
    var blocNomLibre = '<div class="entete-bloc-texte bloc-libre" data-entete-bloc="nom" data-rubrique="entete-nom"' + _pdfStylePositionLibre('nom') + '>' + innerNom + '</div>';
    // TACHE (point 19, retour utilisateur : "dissocier le nom et les
    // coordonnees en 2 blocs independants, chacun deplacable/redimensionnable")
    // : meme mecanisme EXACT que blocNomLibre ci-dessus -- 4e bloc libre,
    // jamais fusionne. Absent du HTML (comme blocAccrocheLibre) si aucune
    // coordonnee a afficher, jamais un bloc vide deplacable pour rien.
    var blocCoordonneesLibre = blocCoordonneesSousNom
      ? '<div class="entete-bloc-texte bloc-libre" data-entete-bloc="coordonnees" data-rubrique="entete-coordonnees"' + _pdfStylePositionLibre('coordonnees') + '>' + blocCoordonneesSousNom + '</div>'
      : '';
    // TACHE (point 19, retour utilisateur : "rendre la hauteur de la zone
    // d'en-tete redimensionnable a la souris") : poignee dediee sur le bord
    // bas de .entete-libre (glisser-depose souris, _pdfActiverRedimensionnementHauteurEntete,
    // cvPdfPanneauReglages.js) -- meme convention que les poignees
    // accroche/metier, jamais affichee hors position libre (aucune zone a
    // redimensionner dans les autres modes, ou l'en-tete suit le flux
    // normal du contenu).
    var poigneeHauteurEntete = '<div class="poignee-redim-hauteur-entete" data-poignee-hauteur-entete></div>';
    enteteHtml = '<div class="' + enteteClasses + ' entete-libre">' +
      photoHtml + blocMetierLibre + blocAccrocheLibre + blocNomLibre + blocCoordonneesLibre + poigneeHauteurEntete +
      '</div>';
  } else {
    // TACHE (retour utilisateur, bug reel confirme : "quand je decoche
    // Position libre, les rubriques sont empilees a gauche -- je ne veux
    // JAMAIS voir ca") : la disposition PAR DEFAUT (position libre
    // inactive) reprend desormais la MEME repartition 3 colonnes que la
    // position libre -- nom+coordonnees a gauche, metier au centre (aussi
    // grand que le nom), accroche a droite -- seule la position devient
    // FIXE (flex, pas d'absolute/draggable) plutot que librement
    // deplacable. L'ancien rendu empile (nom+objectif l'un sous l'autre,
    // tout a gauche) est retire : plus jamais atteignable, meme sans
    // "position libre".
    var blocMetierFixe = '<div class="entete-bloc-texte" data-entete-bloc="metier" data-rubrique="entete-metier" style="width:' + largeurMetierLibre + '%;">' + innerMetier + '</div>';
    var blocAccrocheFixe = texteAccrocheEntete
      ? '<div class="entete-bloc-texte" data-entete-bloc="accroche" data-rubrique="entete-accroche" style="width:' + largeurAccrocheLibre + '%;">' + texteAccrocheEntete + '</div>'
      : '';
    var blocNomFixe = '<div class="entete-bloc-texte" data-entete-bloc="nom" data-rubrique="entete-nom">' + innerNom + '</div>';
    // TACHE (point 19) : meme dissociation qu'en position libre ci-dessus,
    // pour le mode position FIXE -- place juste apres blocNomFixe dans
    // .entete-gauche (voir les 2 assemblages plus bas), exactement la ou
    // les coordonnees s'affichaient deja quand elles etaient fusionnees
    // dans innerNom -- aucun changement visuel par defaut.
    var blocCoordonneesFixe = blocCoordonneesSousNom
      ? '<div class="entete-bloc-texte" data-entete-bloc="coordonnees" data-rubrique="entete-coordonnees">' + blocCoordonneesSousNom + '</div>'
      : '';
    // TACHE (retour utilisateur : "l'option 2 colonnes -- a gauche nom et
    // coordonnees, a droite le metier en haut et l'accroche plus bas sur
    // la meme colonne") : metier/accroche rejoignent une colonne de
    // droite commune (.entete-colonne-droite, flex-direction:column) au
    // lieu d'etre 2 enfants directs de `.entete` -- jamais de largeur en %
    // du bandeau entier ici (blocMetierFixe/blocAccrocheFixe n'ont donc
    // pas de `style="width:...` en 2 colonnes, contrairement au mode 3
    // colonnes juste en dessous) : ils prennent naturellement toute la
    // largeur de LEUR colonne (voir CSS .entete-colonne-droite).
    // TACHE (retour utilisateur, bug reel confirme en testant : "je ne
    // veux pas que cette colonne pleine hauteur soit chevauchee") :
    // bug trouve en verifiant ce point precis -- en 3 colonnes, metier
    // (centre, x theorique ~35-50% selon justify-content:space-between)
    // pouvait chevaucher a moitie la bande pleine hauteur (largeur
    // independante, pilotee par largeurColonneGauche) : le texte devenait
    // illisible sur la moitie qui recoupait la bande. La disposition 2
    // colonnes, elle, cree une frontiere NETTE -- reutilisee ici de force
    // des que la bande pleine hauteur est active (quel que soit le choix
    // "disposition de l'en-tete" de la personne), avec une largeur de
    // colonne gauche ALIGNEE EXACTEMENT sur celle de la bande
    // (largeurColonneGauche, meme variable que .bande-laterale-pleine-hauteur
    // plus haut) : plus aucun chevauchement possible, la frontiere de
    // couleur du texte (voir .pleine-hauteur-gauche/droite plus haut) et
    // la frontiere de mise en page coincident toujours exactement.
    var pleineHauteurActiveEntete = pleineHauteurGauche || pleineHauteurDroite;
    if (dispositionEntete === '2colonnes' || pleineHauteurActiveEntete) {
      var blocMetier2col = '<div class="entete-bloc-texte" data-entete-bloc="metier" data-rubrique="entete-metier">' + innerMetier + '</div>';
      var blocAccroche2col = texteAccrocheEntete
        ? '<div class="entete-bloc-texte" data-entete-bloc="accroche" data-rubrique="entete-accroche">' + texteAccrocheEntete + '</div>'
        : '';
      // TACHE : X% tout court NE SUFFIT PAS -- bug reel confirme en
      // testant (chevauchement partiel persistant a largeurColonneGauche=70,
      // meme apres avoir retranche le gap). Cause racine : .bande-laterale-pleine-hauteur
      // (position:absolute dans .page-a4, SANS padding) calcule son X% par
      // rapport a la largeur TOTALE de la page, alors que .entete-gauche/
      // .entete-colonne-droite (flex, DANS .entete qui a 14mm de padding
      // gauche+droite) calculent leur X% par rapport a la largeur DEJA
      // REDUITE du padding -- 2 references differentes pour le "meme" X%,
      // decalage systematique de l'ordre du padding. Conversion en mm
      // ABSOLUS (meme unite physique que la page 210mm, jamais de %) pour
      // faire coincider les 2 : frontiereBandeMm = position reelle de la
      // frontiere de couleur depuis le bord GAUCHE de la PAGE ; on
      // soustrait ensuite le padding de .entete (14mm) pour obtenir la
      // largeur que .entete-gauche doit occuper dans SA PROPRE largeur
      // utile (deja amputee du padding par le navigateur).
      var largeurPageMm = parseFloat(largeurPage) || 210;
      var paddingEnteteMm = 14;
      var frontiereBandeMm = (largeurColonneGauche / 100) * largeurPageMm;
      var largeurGaucheEnteteMm = Math.max(10, frontiereBandeMm - paddingEnteteMm);
      var largeurDroiteEnteteMm = Math.max(10, (largeurPageMm - 2 * paddingEnteteMm) - largeurGaucheEnteteMm);
      // `calc(Xmm - 5px)` : .entete-cote-a-cote a deja un `gap:10px`
      // (regle partagee, plus haut) qui s'AJOUTE aux 2 flex-basis -- avec
      // flex-shrink:0 (le "0" du milieu de `flex:0 0`, volontaire pour ne
      // jamais bouger l'alignement selon le contenu), les 2 colonnes + le
      // gap depasseraient legerement la largeur utile sans cette
      // retranche -- moitie du gap de chaque cote, somme exacte.
      var styleAlignementBande = pleineHauteurActiveEntete
        ? ' style="flex:0 0 calc(' + largeurGaucheEnteteMm + 'mm - 5px);max-width:calc(' + largeurGaucheEnteteMm + 'mm - 5px);"'
        : '';
      var styleAlignementBandeDroite = pleineHauteurActiveEntete
        ? ' style="flex:0 0 calc(' + largeurDroiteEnteteMm + 'mm - 5px);max-width:calc(' + largeurDroiteEnteteMm + 'mm - 5px);"'
        : '';
      // TACHE (point 19, bug evite en relisant .entete-gauche : "display:flex
      // sans flex-direction" met ses enfants directs en LIGNE, pas en
      // colonne) : nom et coordonnees, desormais 2 blocs separes, doivent
      // rester empiles verticalement comme avant (coordonnees SOUS le nom),
      // jamais cote a cote -- regroupes dans un seul enfant direct de
      // .entete-gauche (bloc normal, empilement vertical natif) plutot que
      // 2 enfants directs qui rejoindraient la ligne flex.
      enteteHtml = '<div class="' + enteteClasses + ' entete-cote-a-cote entete-2col">' +
        '<div class="entete-gauche"' + styleAlignementBande + '>' + photoHtml + '<div class="entete-nom-coordonnees">' + blocNomFixe + blocCoordonneesFixe + '</div></div>' +
        '<div class="entete-colonne-droite"' + styleAlignementBandeDroite + '>' + blocMetier2col + blocAccroche2col + '</div>' +
        '</div>';
    } else {
      enteteHtml = '<div class="' + enteteClasses + ' entete-cote-a-cote">' +
        '<div class="entete-gauche">' + photoHtml + '<div class="entete-nom-coordonnees">' + blocNomFixe + blocCoordonneesFixe + '</div></div>' +
        blocMetierFixe + blocAccrocheFixe +
        '</div>';
    }
  }

  // TACHE (chantier "10 nouveaux modeles Créatif", modele "Bandeau
  // vertical") : bande decorative INDEPENDANTE du systeme de colonnes/
  // en-tete existant (jamais fusionnee avec fondColonnePleineHauteur, qui
  // colore une VRAIE colonne de contenu -- ici, une simple bande vide
  // avec juste le nom pivote). h1 du nom normal masque via CSS
  // (.entete.nom-vertical-actif h1, voir plus haut) pour ne jamais
  // dupliquer le nom deux fois sur la page.
  var bandeNomVerticaleHtml = nomVertical
    ? '<div class="bande-nom-verticale"><span>' + _pdfEscaperHtml(nomComplet) + '</span></div>'
    : '';
  // TACHE (chantier "2 nouveaux modeles Créatif", modele "Pastille") :
  // simple filet plein colore en haut de page, meme principe minimal que
  // bandeNomVerticaleHtml juste au-dessus -- ajoute au flux normal (jamais
  // absolute), pousse le reste de 6px, negligeable sur 297mm de page.
  var filetHautHtml = filetHaut ? '<div class="filet-haut"></div>' : '';
  var pageHtml = '<div class="page-a4' + corpsRubriquesClasse + '">' +
filetHautHtml +
bandeNomVerticaleHtml +
bandeLateraleHtml +
enteteHtml +
bandeauDispoHtml +
bandeauCompetencesClesHtml +
corpsHtml +
'</div>';

  return { css: css, pageHtml: pageHtml, nomComplet: nomComplet, largeurPage: largeurPage, hauteurPage: hauteurPage };
}

// Construit le document HTML COMPLET et autonome (export/impression
// statique, sans panneau de reglages) -- reutilise _pdfConstruireStyleEtPage
// pour ne jamais dupliquer la logique de rendu. Options : voir
// _pdfConstruireStyleEtPage ci-dessus.
function construireHtmlPdfA4(objetCV, composition, options) {
  var resultat = _pdfConstruireStyleEtPage(objetCV, composition, options);
  return '<!DOCTYPE html>' +
'<html lang="fr"><head><meta charset="UTF-8"><title>CV - ' + _pdfEscaperHtml(resultat.nomComplet) + '</title><style>' +
'  body { margin: 0; background: #e9e9e9; }' +
'  .barre-outils { padding: 12px 16px; background: #222; color: #fff; display: flex; gap: 12px; align-items: center; font-size: 14px; }' +
'  .barre-outils button { padding: 8px 14px; border: none; border-radius: 6px; background: #2f6690; color: #fff; cursor: pointer; font-size: 14px; }' +
resultat.css +
'  @media print { @page { size: ' + resultat.largeurPage + ' ' + resultat.hauteurPage + '; margin: 0; } body { background: #fff; } .barre-outils { display: none; } }' +
'</style></head><body>' +
'<div class="barre-outils"><strong>Aperçu CV design (PDF - nouveau, bêta)</strong><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>' +
resultat.pageHtml +
'</body></html>';
}
