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
  loisirs: '<circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4z"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="15.5" y1="10.5" x2="20.5" y2="9"/><line x1="14.2" y1="14.5" x2="17.2" y2="18.5"/><line x1="9.8" y1="14.5" x2="6.8" y2="18.5"/><line x1="8.5" y1="10.5" x2="3.5" y2="9"/>',
  engagements: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M15.2 20c.3-2.5 1.9-4.5 4.1-5.3"/>',
  certifications: '<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5"/>',
  competencesCles: '<circle cx="7" cy="15" r="4"/><line x1="10.5" y1="11.5" x2="20" y2="2"/><line x1="16" y1="6" x2="19" y2="9"/><line x1="13" y1="9" x2="15.5" y2="11.5"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/>',
  telephone: '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>',
  localisation: '<path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  permis: '<rect x="2" y="11" width="20" height="6" rx="2"/><path d="M6 11l2-4h8l2 4"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  lien: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  infos: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="12" y1="7.5" x2="12" y2="7.6"/>'
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
// C4 : quand la personne le demande (« Afficher les mois »), une date « AAAA-MM » s'ecrit « sept. 2023 » ; sinon l'annee seule, comme avant.
var _pdfMoisAffiches = false;
function _pdfAnneeSeule(dateAAAAMM) {
  if (_pdfMoisAffiches && typeof formaterDateCourte === 'function' && /^(19|20)\d{2}-\d{2}$/.test(dateAAAAMM || '')) { return formaterDateCourte(dateAAAAMM); }
  return (dateAAAAMM || '').slice(0, 4);
}
// Reglages « Dates » PROPRES a une rubrique (2026-10-04, decision de Denis) : { exp | form | cert | perso : { suit, pos, forme, mois } }, poses a chaque rendu (opts.datesParRubrique).
// `suit` vrai (defaut) = la rubrique suit l'ensemble (case « Dates alignees » et « Afficher les mois » d'Organisation du CV) : rien ne change. Sinon : sa position, sa forme
// (annees = 2019 - 2021, parentheses = (2019 - 2021), fin = 2021) et ses mois a elle. Aucune date n'est inventee : la forme ne fait que reecrire ce qui est capte.
var _pdfDatesParRub = {};
function _pdfReglageDatesRub(rub) {
  var r = (rub && _pdfDatesParRub) ? _pdfDatesParRub[rub] : null;
  return (r && r.suit === false) ? r : null;
}
function _pdfFormeDate(texte, rub, sansParentheses) {
  var r = _pdfReglageDatesRub(rub);
  if (!r || !texte) { return texte; }
  if (r.forme === 'parentheses') { return sansParentheses ? texte : '(' + texte + ')'; }
  if (r.forme === 'fin') { var morceaux = String(texte).split(' - '); return morceaux[morceaux.length - 1]; }
  return texte;
}
function _pdfFormaterPeriode(dateDebut, dateFin, rub, sansParentheses) {
  var r = _pdfReglageDatesRub(rub), moisAvant = _pdfMoisAffiches, texte;
  if (r && typeof r.mois === 'boolean') { _pdfMoisAffiches = r.mois; }
  try {
    var anneeDebut = _pdfAnneeSeule(dateDebut);
    var anneeFin = _pdfAnneeSeule(dateFin);
    if (anneeDebut && !anneeFin) { texte = anneeDebut + ' - en cours'; }
    else if (anneeDebut && anneeFin && anneeDebut === anneeFin) { texte = anneeDebut; }
    else { texte = [anneeDebut, anneeFin].filter(Boolean).join(' - '); }
  } finally { _pdfMoisAffiches = moisAvant; }
  return _pdfFormeDate(texte, rub, sansParentheses);
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
// TACHE (chantier refonte mise en page PDF, phase 3.4, 2026-09-22) : e.lieu
// est saisi sur l'ecran d'edition d'une experience (champ "expLieu",
// js/app.js ~14981) et deja utilise pour le resume texte envoye a
// l'assistant (js/app.js ~27787, ~32248) -- mais JAMAIS affiche dans le
// PDF, perte de contenu silencieuse (Denis : "pour les lieux, c'est pareil
// [que les dates], tres important -- prompt ET code"). Meme convention que
// ces 2 autres usages : entreprise et lieu separes par une virgule, jamais
// un 2e format invente ici. Toujours affiche quand connu -- un reglage
// pour le masquer/le styler viendra avec le panneau (phase 5, maquette
// deja prete : S.lieu / S.lieuStyle).
// TACHE (retour utilisateur : conserve pour les autres appelants
// existants -- texte BRUT, jamais du HTML (voir _pdfSpanStylePartie,
// qui echappe TOUJOURS son entree -- un <span> retourne ici serait donc
// affiche tel quel, echappe, jamais interprete). afficherLieu/styleLieu
// geres a part par _pdfLigneEntrepriseLieu ci-dessous, le seul chemin
// qui a besoin d'un style DIFFERENT sur le lieu que sur l'entreprise.
function _pdfEntrepriseAvecLieu(entreprise, lieu, afficherLieu) {
  var lieuEffectif = (afficherLieu === false) ? '' : lieu;
  return [entreprise, lieuEffectif].filter(Boolean).join(', ');
}
// TACHE (phase 5.4, carte "Experiences professionnelles") : copie
// superficielle de `contenu` (jamais de mutation de composition.contenuRetenu,
// meme regle deja en place pour le tri par ordreExperiences un peu plus
// bas dans ce fichier) avec une nouvelle liste d'experiences.
function _pdfCopierContenuAvecExperiences(contenu, nouvellesExperiences) {
  var copie = {};
  Object.keys(contenu).forEach(function (cle) { copie[cle] = contenu[cle]; });
  copie.experiences = nouvellesExperiences;
  return copie;
}
// TACHE (meme carte) : applique le choix de missions d'UNE experience --
// un choix PRECIS (opts.missionsChoisies[indexBrut], panneau "Choisir")
// prime toujours sur un simple COMPTEUR (opts.missionsParExperience ou
// opts.missionsGlobal, boutons -/+). Ni l'un ni l'autre regle pour cette
// experience : retourne `e` INCHANGEE (comportement automatique du
// moteur, zero regression).
function _pdfAppliquerChoixMissions(e, indexBrut, opts) {
  var choisies = opts.missionsChoisies && opts.missionsChoisies[indexBrut];
  var segments = _pdfDecouperMissions(e.missions);
  if (!segments.length) { return e; }
  var gardees;
  if (choisies && choisies.length) {
    gardees = choisies.map(function (i) { return segments[i]; }).filter(Boolean);
  } else {
    var n = (opts.missionsParExperience && opts.missionsParExperience[indexBrut] != null) ? opts.missionsParExperience[indexBrut]
      : ((opts.missionsAuto && opts.missionsAuto[indexBrut] != null) ? opts.missionsAuto[indexBrut] : (opts.missionsGlobal || opts.missionsDefaut));
    if (!n) { return e; }
    gardees = segments.slice(0, n);
  }
  var copie = {};
  Object.keys(e).forEach(function (cle) { copie[cle] = e[cle]; });
  copie.missions = gardees.join('\n');
  copie.__idxBrut = indexBrut;   // retrouve l'experience d'origine (ordre « Mon ordre », plein ecran de la maquette)
  return copie;
}
// TACHE (phase 5.4, carte "Experiences professionnelles" -- Denis,
// 2026-09-23) : version HTML directe (jamais repassee par
// _pdfSpanStylePartie, qui echapperait un <span> deja construit) --
// entreprise stylee normalement (styleEntreprise, comme avant), lieu
// avec son PROPRE style independant (normal = pas de style visible,
// zero regression par defaut).
function _pdfLigneEntrepriseLieu(entreprise, lieu, styleEntreprise, afficherLieu, styleLieu) {
  var entrepriseHtml = _pdfSpanStylePartie(entreprise, styleEntreprise);
  var lieuEffectif = (afficherLieu === false) ? '' : lieu;
  if (!lieuEffectif) { return entrepriseHtml; }
  var lieuHtml = _pdfEscaperHtml(lieuEffectif);
  if (styleLieu === 'italique') { lieuHtml = '<span style="font-style:italic">' + lieuHtml + '</span>'; }
  else if (styleLieu === 'gris') { lieuHtml = '<span style="color:#6b7684">' + lieuHtml + '</span>'; }
  return [entrepriseHtml, lieuHtml].filter(Boolean).join(', ');
}
// TACHE (meme carte) : positionDates ('droite' defaut, 'sous', 'avant')
// -- seul le format STANDARD (ni compact/Essentiel, ni ameliore, qui ont
// deja chacun leur propre mise en page fixe) en tient compte, meme
// perimetre exact que la maquette (S.dates n'agit que sur son
// equivalent du format standard).
function _pdfBlocExperiences(experiences, iconesActives, compact, styleMissions, formatExperiences, styleParties, afficherLieu, styleLieu, positionDates) {
  if (!experiences || !experiences.length) { return ''; }
  var stylePoste = styleParties && styleParties.poste;
  var styleDates = styleParties && styleParties.dates;
  var styleEntreprise = styleParties && styleParties.entreprise;
  var items = experiences.map(function (e) {
    var periode = _pdfFormaterPeriode(e.dateDebut, e.dateFin, 'exp');
    if (compact) {
      // TACHE (retour utilisateur : "souligner le poste, les dates,
      // l'entreprise... et pareil pour l'italique") : le mode compact
      // (Essentiel) construisait sa ligne en 1 seule chaine echappee d'un
      // bloc -- desormais poste/entreprise/periode passent chacun par
      // _pdfSpanStylePartie AVANT d'etre joints, jamais le reste de la
      // ligne (separateurs, missions) qui n'a pas de "type" a mettre en
      // evidence.
      var posteSpanC = _pdfSpanStylePartie(e.poste, stylePoste);
      var entrepriseSpanC = _pdfLigneEntrepriseLieu(e.entreprise, e.lieu, styleEntreprise, afficherLieu, styleLieu);
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
        ((e.entreprise || (afficherLieu !== false && e.lieu)) ? '<div class="entreprise-experience">' + _pdfLigneEntrepriseLieu(e.entreprise, e.lieu, styleEntreprise, afficherLieu, styleLieu) + '</div>' : '') +
        _pdfRenduMissions(e.missions, styleMissions) +
        '</div>';
    }
    // TACHE (retour utilisateur : "souligner le poste... l'entreprise")
    // : poste/entreprise passent desormais SEPAREMENT par
    // _pdfSpanStylePartie (jamais joints puis echappes comme une seule
    // chaine) pour pouvoir styler l'un sans l'autre -- le separateur
    // ' - ' entre eux reste, lui, toujours neutre.
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
    // TACHE (retour Denis 2026-09-21 : « le gras, c'est le titre du diplome ou
    // le poste, rien de plus ») : seul le POSTE est en gras ; entreprise et
    // periode restent en texte normal. Le conteneur du titre reste UN SEUL
    // element editable (.titre-item-avec-detail) -- le gras vient d'un span
    // neutre (.gras-titre, absent de _PDF_SELECTEUR_EDITABLE), jamais d'un
    // <strong> englobant tout le titre.
    var posteGras = _pdfSpanStylePartie(e.poste, stylePoste);
    var entrepriseTexte = _pdfLigneEntrepriseLieu(e.entreprise, e.lieu, styleEntreprise, afficherLieu, styleLieu);
    var periodeSpan = periode ? _pdfSpanStylePartie(periode, styleDates) : '';
    // TACHE (phase 5.4, "Position des dates" -- Denis, 2026-09-23) :
    // "droite" (defaut, comportement INCHANGE) = periode a la fin de la
    // meme ligne que le poste. "avant" = periode avant le poste, sur la
    // meme ligne. "sous" = periode sur une ligne a part, sous le titre.
    var titreLigne;
    if (positionDates === 'avant' && periodeSpan) {
      titreLigne = periodeSpan + ' - <span class="gras-titre">' + posteGras + '</span>' + (entrepriseTexte ? ' - ' + entrepriseTexte : '');
    } else {
      titreLigne = '<span class="gras-titre">' + posteGras + '</span>' + (entrepriseTexte ? ' - ' + entrepriseTexte : '') +
        (positionDates !== 'sous' && periodeSpan ? ' : ' + periodeSpan : '');
    }
    var ligneDatesSous = (positionDates === 'sous' && periodeSpan)
      ? '<div class="ligne-mission" style="color:#6b7684">' + periodeSpan + '</div>' : '';
    return '<div class="item">' +
      '<div class="titre-item-avec-detail">' + titreLigne + '</div>' +
      ligneDatesSous +
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

// TACHE (phase 5.3, carte "Formations" de la maquette -- oFormMissions/
// rgEspForm, docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html lignes 601-618) :
// `afficherMissions` (defaut false, comme la maquette -- oFormMissions
// n'est PAS coche par defaut) et `espacementFormations` (px, defaut 4
// comme rgEspForm) sont NOUVEAUX ; le reste de la fonction est inchange.
// TACHE (Denis, 2026-09-25) : ce que la personne choisit de montrer pour chaque formation (carte « Formations » de « La mise en page ») :
// centre de formation, annee (montres par defaut, comme avant), lieu (cache par defaut : c'est la personne qui le decide).
// Renvoie { endroit : « centre, lieu », annee }. UNE seule regle pour le rendu de la maquette, l'ancien rendu et la frise.
// Dates d'une formation saisies avec des mois (« Sept. 2023 », « 09/2023 ») : « Afficher les mois » vaut pour toutes les rubriques (retour Denis
// 2026-09-30) ; sans lui, seule l'annee est montree. Une date sans mois, ou un texte libre, reste tel quel.
function _pdfAnneeFormationMois(texte, rub) {
  var t = String(texte || '');
  if (typeof normaliserDateImport !== 'function') { return t; }
  var rg = _pdfReglageDatesRub(rub), moisAffiche = (rg && typeof rg.mois === 'boolean') ? rg.mois : _pdfMoisAffiches;
  var motif = /(?:(?:janv|janvier|f[ée]vr|f[ée]vrier|mars|avr|avril|mai|juin|juil|juillet|ao[uû]t|sept|septembre|oct|octobre|nov|novembre|d[ée]c|d[ée]cembre)\.?\s+|(?:0?[1-9]|1[0-2])[\/.]\s?)(?:19|20)\d{2}/gi;
  return t.replace(motif, function (m) {
    var d = normaliserDateImport(m);
    if (!/^(19|20)\d{2}-\d{2}$/.test(d)) { return m; }
    return moisAffiche && typeof formaterDateCourte === 'function' ? formaterDateCourte(d) : d.slice(0, 4);
  });
}
// Texte du diplome d'une formation : « niveau - intitule ». Retour Denis 2026-09-30 : un « (niveau) » vide recopie du CV d'origine est retire, et
// le niveau n'est pas repete quand il est identique a l'intitule (« Sesame Numerique - Sesame Numerique »).
function _pdfTexteDiplome(f) {
  var nettoie = function (t) { return String(t || '').replace(/\s*\(\s*niveau\s*\)\s*/gi, ' ').replace(/\s{2,}/g, ' ').trim(); };
  var niveau = nettoie(f && f.niveau), intitule = nettoie(f && f.intitule);
  var norm = function (t) { return String(t || '').toLowerCase().replace(/[^a-z0-9à-ÿ]+/g, ' ').trim(); };
  if (niveau && intitule && norm(niveau) === norm(intitule)) { niveau = ''; }
  return [niveau, intitule].filter(Boolean).join(' - ');
}
function _pdfFormationDetails(f, aff) {
  aff = aff || {};
  var centre = (aff.centre !== false) ? (f.etablissement || '') : '';
  // Retour Denis 2026-10-01 : un lieu capte dans le CV s'affiche toujours, sauf si la personne a decoche la case « Lieu » (avant : masque par defaut).
  var lieu = (aff.lieu !== false) ? (f.lieu || '') : '';
  var rubDate = (f && f.__certifOriginale) ? 'cert' : 'form';
  return { endroit: [centre, lieu].filter(Boolean).join(', '), annee: (aff.annee !== false) ? _pdfFormeDate(_pdfAnneeFormationMois(f.annee || '', rubDate), rubDate) : '' };
}
function _pdfBlocFormations(formations, iconesActives, styleParties, afficherMissions, espacementFormations, formationAffiche) {
  if (!formations || !formations.length) { return ''; }
  var styleEspacement = (typeof espacementFormations === 'number' && espacementFormations !== 4) ? ' style="margin-bottom:' + espacementFormations + 'px"' : '';
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
    var diplomeTexte = _pdfTexteDiplome(f);
    // TACHE (retour Denis 2026-09-21 : « le gras, c'est le titre du diplome,
    // rien de plus ») : seul le diplome (type + intitule) est en gras ;
    // etablissement et annee restent en texte normal (meme principe que
    // _pdfBlocExperiences : conteneur editable unique + span .gras-titre).
    var diplomeGras = _pdfSpanStylePartie(diplomeTexte, stylePoste);
    var detailsFormation = _pdfFormationDetails(f, formationAffiche);
    var etablissementTexte = _pdfSpanStylePartie(detailsFormation.endroit, styleEntreprise);
    return '<div class="item"' + styleEspacement + '>' +
      // TACHE (retour utilisateur : "jamais BTS (2015) mais plutot
      // BTS - 2015") : tiret simple au lieu de parentheses, meme
      // convention que les periodes d'experience (_pdfFormaterPeriode).
      // TACHE (retour utilisateur : "Bac bloque en mode edition, mais CAP
      // Maconnerie modifiable" -- bug reel confirme) : classe titre-item-
      // avec-detail (voir _pdfBlocExperiences plus haut, meme correctif)
      // -- sans elle, une formation AVEC missions perdait l'edition de son
      // titre entier, alors qu'une formation SANS mission restait editable.
      '<div class="titre-item-avec-detail"><span class="gras-titre">' + diplomeGras + '</span>' + (etablissementTexte ? ' - ' + etablissementTexte : '') + (detailsFormation.annee ? ' - ' + _pdfSpanStylePartie(detailsFormation.annee, styleDates) : '') + '</div>' +
      (afficherMissions ? _pdfLignesMissions(f.missions) : '') +
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
  var styleEntreprisePerso = styleParties && styleParties.entreprise;
  var htmlItems = items.map(function (item) {
    if (typeof item === 'string') { return '<div class="item">' + _pdfEscaperHtml(item) + '</div>'; }
    var titre = (item && item.intitule) || (item && item.texte) || '';
    var periode = _pdfFormaterPeriode(item && item.dateDebut, item && item.dateFin, 'perso');
    var detail = (item && item.detail) || '';
    // Lot N1 (2026-10-04) : structure (entreprise) et lieu, quand ils sont renseignes (meme convention que les formations : « - structure, lieu »).
    var endroitPerso = [item && item.entreprise, item && item.lieu].filter(Boolean).join(', ');
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
      '<div class="titre-item-avec-detail"><span class="gras-titre">' + _pdfSpanStylePartie(titre, stylePoste) + '</span>' + (endroitPerso ? ' - ' + _pdfSpanStylePartie(endroitPerso, styleEntreprisePerso) : '') + (periode ? ' : ' + _pdfSpanStylePartie(periode, styleDates) : '') + '</div>' +
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
function _pdfFabricantsRubriques(contenu, iconesActives, experiencesCompact, styleCompetences, competencesProfessionnelles, competencesComportementales, resoudreStylePuce, styleProfessionnel, stylePersonnel, formatExperiences, styleParties, afficherLieu, styleLieu, positionDates, afficherMissionsFormation, espacementFormations, formationAffiche) {
  // TACHE (retour utilisateur : "cliquer sur les competences pour choisir
  // pastille/rectangle/texte juste pour CETTE rubrique") : `resoudreStylePuce`
  // (optionnel, voir _pdfStylePuceEffectif plus haut) retombe sur le
  // reglage global si absent -- jamais un 2e defaut duplique ici.
  var resoudre = resoudreStylePuce || function () { return styleCompetences; };
  return {
    experiences: function () { return _pdfBlocExperiences(contenu.experiences, iconesActives, experiencesCompact, styleProfessionnel, formatExperiences, styleParties, afficherLieu, styleLieu, positionDates); },
    formations: function () { return _pdfBlocFormations(contenu.formations, iconesActives, styleParties, afficherMissionsFormation, espacementFormations, formationAffiche); },
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
    infos: function () { return _pdfBlocListeSimple('Informations complémentaires', contenu.infosAffichees, 'infos', iconesActives); },
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
    if (r === 'loisirsEngagements') { etendu.push('loisirs', 'infos', 'engagements', 'certifications'); }
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
var _PDF_ORDRE_RUBRIQUES_PAR_DEFAUT = ['experiences', 'formations', 'competences', 'competencesComportementales', 'logiciels', 'langues', 'loisirs', 'infos', 'engagements', 'certifications'];

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
// TACHE (chantier refonte "La mise en page" du CV, phase 5.2, 6e modele
// de la galerie -- Denis, 2026-09-23 : "tout a ete tranche, tu suis la
// maquette") : port du modele "Colonne et frise"
// (docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html, fonction composerFrise())
// -- inspire du CV d'origine de M. Doumbouya, seul modele de la galerie a
// n'exister QUE dans la maquette jusqu'ici (les 5 autres reprenaient des
// recettes _PDF_CREATIF_RECETTES deja reelles). Grille propre (colonne
// laterale grise + coin colore en diagonale + frise chronologique a
// puces), DELIBEREMENT independante du systeme 1/2 colonnes standard
// (colonnes/fondColonnes/bandeauEnTete... n'ont aucun sens ici, comme
// dans la maquette). Fonction ENTIEREMENT AUTONOME (recalcule ses propres
// identite/contenu/competences/coordonnees plutot que de les recevoir en
// parametre) : _pdfConstruireStyleEtPage() est deja une fonction de 1750
// lignes tres imbriquee (couleurs dependent du format, qui depend des
// colonnes...) -- y greffer une 7e branche structurelle au milieu, plutot
// que de dispatcher AVANT tout ce calcul (meme patron que composer() de
// la maquette, qui appelle composerFrise() en tout premier), aurait ete
// bien plus risque pour un gain de duplication minime (une dizaine de
// lignes de lecture de donnees, deja simples).
// TACHE (cahier § 4 "Sur le modele Colonne et frise : taille, gras et
// couleur seulement -- l'en-tete est dans la colonne et le coin colore") :
// en-tete FIXE ici (nom/metier/accroche non deplacables), comme la
// maquette AVANT son point "8. Colonne et frise a maintenant un en-tete
// libre" -- l'en-tete libre pour ce modele est un vrai sous-chantier a
// part (positions de depart calculees sur la largeur reelle de la
// colonne, classe "tete" en plus de "libre", etc., voir RECOMMANDATIONS_
// PHASE1_MISE_EN_PAGE_PDF_2026-09-21.md points 8/10/11), delibere de ne
// pas construire dans le meme passage que la structure elle-meme.
// TACHE (deplacer une experience ▲▼) : bouton absent ici -- verifie que
// cette fonction n'existe NULLE PART ailleurs dans ce fichier non plus
// (grep fait avant d'ecrire cette fonction) : chantier futur pour TOUS
// les modeles a la fois (plan § 6, phase 5.6), jamais une regression
// propre a la frise.
// (_pdfConstruireFrise : retire le 2026-09-25, « Colonne et frise » est desormais rendu par _pdfConstruireMaquette, cvPdfTemplateMaquette.js)

// TACHE (Denis, 2026-09-25, tranche 2 « feuille et modeles ») : preparation du
// contenu des EXPERIENCES (toutes / pertinentes choisies, nombre et choix de
// missions, ordre), EXTRAITE telle quelle de _pdfConstruireStyleEtPage pour
// etre partagee avec le rendu de la maquette (_pdfConstruireMaquette,
// cvPdfTemplateMaquette.js) : UNE seule source, jamais copiee. Retourne un
// contenu (copie, jamais de mutation de composition.contenuRetenu).
function _pdfPreparerContenuExperiences(contenu, objetCV, opts) {
  // Plafonds des rubriques (formations, langues, loisirs...) : leves dans construireDonneesPdfCV (cvPdfDonnees.js, C2) sauf en A4 essentiel.
  // Informations complementaires : seulement les lignes cochees par la personne.
  contenu = Object.assign({}, contenu, { infosAffichees: (opts.infosCompAffichees || []).filter(function (x) { return (objetCV.informationsComplementaires || []).indexOf(x) !== -1; }) });
  // Chaque experience retient son indice dans la liste BRUTE (__idxBrut), meme quand le moteur partage en a livre une copie :
  // sans cela, « Mon ordre » et le choix des missions ne retrouvaient pas l'experience d'origine.
  var _brutesIdx = objetCV.experiences || [];
  if (contenu.experiences && contenu.experiences.length) {
    contenu = _pdfCopierContenuAvecExperiences(contenu, contenu.experiences.map(function (e) {
      if (e.__idxBrut !== undefined) { return e; }
      var i = _brutesIdx.indexOf(e);
      if (i === -1) {
        for (var k = 0; k < _brutesIdx.length; k++) {
          var r = _brutesIdx[k];
          if ((r.poste || '') === (e.poste || '') && (r.entreprise || '') === (e.entreprise || '') && (r.dateDebut || '') === (e.dateDebut || '') && (r.dateFin || '') === (e.dateFin || '')) { i = k; break; }
        }
      }
      if (i === -1) { return e; }
      var c = {};
      Object.keys(e).forEach(function (cle) { c[cle] = e[cle]; });
      c.__idxBrut = i;
      return c;
    }));
  }
  var experiencesBrutes = objetCV.experiences || [];
  if (opts.experiencesTout === 'toutes') {
    contenu = _pdfCopierContenuAvecExperiences(contenu, experiencesBrutes);
  } else if (opts.experiencesTout === 'pertinentes' && opts.experiencesChoisies) {
    var choisies = opts.experiencesChoisies;
    contenu = _pdfCopierContenuAvecExperiences(contenu, experiencesBrutes.filter(function (e, i) { return choisies.indexOf(i) !== -1; }));
  }
  // TACHE (meme carte) : nombre de missions par experience -- global
  // (opts.missionsGlobal) ou precise par experience (opts.missionsParExperience,
  // opts.missionsChoisies -- un CHOIX precis de missions prime toujours
  // sur un simple compteur). Applique sur les memes indices que ci-dessus
  // (dans objetCV.experiences, jamais contenu.experiences qui vient de
  // changer de sens juste au-dessus) -- seulement si au moins un reglage
  // manuel existe, sinon comportement INCHANGE (le moteur garde son
  // propre choix de troncature automatique).
  if (contenu.experiences && contenu.experiences.length && (opts.missionsGlobal || opts.missionsDefaut || opts.missionsParExperience || opts.missionsChoisies)) {
    contenu = _pdfCopierContenuAvecExperiences(contenu, contenu.experiences.map(function (e) {
      var indexBrut = (e.__idxBrut !== undefined) ? e.__idxBrut : experiencesBrutes.indexOf(e);
      if (indexBrut === -1) { return e; }
      return _pdfAppliquerChoixMissions(e, indexBrut, opts);
    }));
  }
  // TACHE (retour utilisateur : "je veux pouvoir choisir l'ordre
  // d'affichage, par date ou par poste") : "pertinence" (defaut) ne trie
  // PAS -- garde l'ordre deja decide par le moteur partage (deja la
  // reponse a "mettre en avant une experience pertinente meme si pas la
  // plus recente"). Copie de `contenu` (jamais de mutation de
  // composition.contenuRetenu, reutilise tel quel par d'autres appelants,
  // ex. l'ajustement automatique de mise en page qui mesure le nombre de
  // lignes).
  var ordreExperiences = opts.ordreExperiences || 'pertinence';
  if (contenu.experiences && contenu.experiences.length && ordreExperiences === 'mien' && opts.ordreExperiencesMien) {
    // TACHE (Denis, 2026-09-25, tranche 4) : « Mon ordre » = l'ordre choisi a la main avec ▲ ▼ dans le plein ecran ;
    // les experiences absentes de la liste gardent leur ordre et passent apres.
    var ordreMien = opts.ordreExperiencesMien;
    var rangMien = function (e) {
      var i = (e.__idxBrut !== undefined) ? e.__idxBrut : experiencesBrutes.indexOf(e);
      var r = ordreMien.indexOf(i);
      return r === -1 ? 1000 + i : r;
    };
    var experiencesMien = contenu.experiences.slice().sort(function (a, b) { return rangMien(a) - rangMien(b); });
    contenu = _pdfCopierContenuAvecExperiences(contenu, experiencesMien);
  } else if (contenu.experiences && contenu.experiences.length && ordreExperiences !== 'pertinence') {
    var experiencesTriees = contenu.experiences.slice();
    // TACHE (Denis, 2026-09-25, tranche 3) : comme la maquette, « du plus recent au plus ancien » trie sur la date de FIN,
    // puis de DEBUT ; un debut sans fin = « en cours » = le plus recent.
    var _pdfCleDateExperience = function (e) {
      var debut = _pdfAnneeSeule(e && e.dateDebut) || '';
      var fin = _pdfAnneeSeule(e && e.dateFin) || '';
      if (!debut && !fin) { return ''; }
      return (fin || '9999') + '|' + (debut || fin);
    };
    if (ordreExperiences === 'date-desc') { experiencesTriees.sort(function (a, b) { return _pdfCleDateExperience(b).localeCompare(_pdfCleDateExperience(a)); }); }
    else if (ordreExperiences === 'date-asc') { experiencesTriees.sort(function (a, b) { return _pdfCleDateExperience(a).localeCompare(_pdfCleDateExperience(b)); }); }
    else if (ordreExperiences === 'poste-asc') { experiencesTriees.sort(function (a, b) { return (a.poste || '').localeCompare(b.poste || '', 'fr', { sensitivity: 'base' }); }); }
    else if (ordreExperiences === 'poste-desc') { experiencesTriees.sort(function (a, b) { return (b.poste || '').localeCompare(a.poste || '', 'fr', { sensitivity: 'base' }); }); }
    var contenuAvecExperiencesTriees = {};
    Object.keys(contenu).forEach(function (cle) { contenuAvecExperiencesTriees[cle] = contenu[cle]; });
    contenuAvecExperiencesTriees.experiences = experiencesTriees;
    contenu = contenuAvecExperiencesTriees;
  }
  return contenu;
}

// TACHE (chantier "Experience personnelle", 2026-09-27, DECISION DE DENIS :
// "meme comportement, aucune distinction de source" entre savoir-faire
// personnel -- objetCV.experiencesPersonnelles -- et engagements --
// objetCV.engagements) : meme principe EXACT que _pdfPreparerContenuExperiences
// juste au-dessus, mais la cle n'est pas un index (2 tableaux sources
// distincts, jamais un index commun) -- c'est le texte normalise de l'item
// (intitule pour un savoir-faire perso, texte pour un engagement), stable
// tant que la personne ne modifie pas l'intitule dans "Vos informations".
function _pdfCleExpPerso(item) {
  var texte = (typeof item === 'string') ? item : ((item && (item.intitule || item.texte)) || '');
  return normaliserPourComparaison(texte);
}
// Filtre + limite les missions d'UNE liste (experiencesPersonnelles OU
// engagements) -- meme comportement pour les deux, jamais une 2e logique.
function _pdfFiltrerListeExpPerso(brutes, choisies) {
  if (!choisies) { return brutes; }
  return brutes.filter(function (item) { return choisies.indexOf(_pdfCleExpPerso(item)) !== -1; });
}
// TACHE (retour Denis 2026-09-28, point 13 -- "je dois pouvoir choisir
// laquelle mission je garde, pas juste combien") : un choix PRECIS
// (opts.missionsChoisiesExpPerso[cle], panneau "Choix personnel") prime
// toujours sur le simple compteur -- meme principe EXACT que
// _pdfAppliquerChoixMissions (experiences) plus haut.
function _pdfAppliquerMissionsExpPerso(item, opts) {
  var cle = _pdfCleExpPerso(item);
  var choisies = opts.missionsChoisiesExpPerso && opts.missionsChoisiesExpPerso[cle];
  var texteMissions = (typeof item === 'string') ? '' : (item.missions || '');
  var segments = _pdfDecouperMissions(texteMissions);
  if (!segments.length) { return item; }
  var gardees;
  if (choisies && choisies.length) {
    gardees = choisies.map(function (i) { return segments[i]; }).filter(Boolean);
  } else {
    var n = opts.missionsParExpPerso[cle];
    if (n === undefined || n === null) { return item; }
    // n === 0 : "sans mission" (presentation breve), distinct de absent/null
    // (comportement automatique du moteur) -- decision de Denis 2026-09-27.
    gardees = segments.slice(0, n);
  }
  var copie = (typeof item === 'string') ? { texte: item } : (function () { var c = {}; Object.keys(item).forEach(function (k) { c[k] = item[k]; }); return c; })();
  copie.missions = gardees.join('\n');
  return copie;
}
// TACHE (retour Denis 2026-09-28 : bouton "Modifier", changer l'intitule et
// les missions, en ajouter a la main) : ecrase l'affichage CV pour cet item
// UNIQUEMENT -- ne touche jamais objetCV.experiencesPersonnelles/engagements
// (source, "Vos informations"). Missions manuelles = priment sur le curseur
// (deja applique juste avant par _pdfAppliquerMissionsExpPerso).
function _pdfAppliquerTexteExpPerso(item, opts) {
  var texteParItem = opts.texteParExpPerso;
  var override = texteParItem && texteParItem[_pdfCleExpPerso(item)];
  if (!override) { return item; }
  var copie = (typeof item === 'string') ? { texte: item } : (function () { var c = {}; Object.keys(item).forEach(function (k) { c[k] = item[k]; }); return c; })();
  if (override.titre) {
    if (copie.intitule !== undefined) { copie.intitule = override.titre; } else { copie.texte = override.titre; }
  }
  if (override.missions) { copie.missions = override.missions; }
  // Lot N1 : champs corriges pour ce CV seulement (dates, structure, lieu) ; absent = valeur du dossier.
  ['dateDebut', 'dateFin', 'entreprise', 'lieu'].forEach(function (k) { if (typeof override[k] === 'string') { copie[k] = override[k]; } });
  return copie;
}
function _pdfPreparerContenuExperiencePerso(contenu, objetCV, opts) {
  var expPersoBrutes = objetCV.experiencesPersonnelles || [];
  var engagementsBrutes = objetCV.engagements || [];
  var copie = {};
  Object.keys(contenu).forEach(function (cle) { copie[cle] = contenu[cle]; });
  var tout = opts.experiencePersoTout || 'toutes';
  if (tout === 'toutes') {
    copie.experiencesPersonnelles = expPersoBrutes;
    copie.engagements = engagementsBrutes;
  } else if (tout === 'pertinentes' && opts.experiencePersoChoisies) {
    copie.experiencesPersonnelles = _pdfFiltrerListeExpPerso(expPersoBrutes, opts.experiencePersoChoisies);
    copie.engagements = _pdfFiltrerListeExpPerso(engagementsBrutes, opts.experiencePersoChoisies);
  }
  if (opts.missionsParExpPerso) {
    copie.experiencesPersonnelles = (copie.experiencesPersonnelles || []).map(function (item) { return _pdfAppliquerMissionsExpPerso(item, opts); });
    copie.engagements = (copie.engagements || []).map(function (item) { return _pdfAppliquerMissionsExpPerso(item, opts); });
  }
  if (opts.texteParExpPerso) {
    copie.experiencesPersonnelles = (copie.experiencesPersonnelles || []).map(function (item) { return _pdfAppliquerTexteExpPerso(item, opts); });
    copie.engagements = (copie.engagements || []).map(function (item) { return _pdfAppliquerTexteExpPerso(item, opts); });
  }
  // Ordre de l'experience personnelle (retour Denis 2026-09-30, memes choix que les formations) : plus recent, plus ancien, « Mon ordre » (fait dans le
  // grand apercu). Par defaut (« pertinence ») rien n'est touche. Savoir-faire personnels et engagements sont ranges ENSEMBLE (ils s'affichent dans une
  // seule liste), d'ou la liste unique dans experiencesPersonnelles.
  var critereExpPerso = (opts && opts.ordreExpPerso) || ((opts && opts.ordreExpPersoMien && opts.ordreExpPersoMien.length) ? 'mien' : 'pertinence');
  if (critereExpPerso !== 'pertinence') {
    var tousPerso = (copie.experiencesPersonnelles || []).concat(copie.engagements || []);
    if (tousPerso.length > 1) {
      copie.experiencesPersonnelles = _pdfOrdonnerExpPerso(tousPerso, critereExpPerso, opts && opts.ordreExpPersoMien);
      copie.engagements = [];
    }
  }
  return copie;
}
function _pdfOrdonnerExpPerso(liste, critere, ordreMien) {
  var etiquetees = liste.map(function (item, i) { return { item: item, i: i, cle: _pdfCleExpPerso(item) }; });
  if (critere === 'date-desc' || critere === 'date-asc') {
    if (typeof cleChronologiqueExperience !== 'function') { return liste; }
    var sens = (critere === 'date-desc') ? -1 : 1;
    // Les elements sans date passent apres les autres ; a dates egales, l'ordre habituel est conserve.
    return etiquetees.map(function (x) { return { x: x, k: (typeof x.item === 'object' && x.item) ? cleChronologiqueExperience(x.item) : null }; }).sort(function (a, b) {
      if (!a.k && !b.k) { return a.x.i - b.x.i; }
      if (!a.k) { return 1; }
      if (!b.k) { return -1; }
      if (a.k.fin !== b.k.fin) { return sens * (a.k.fin - b.k.fin); }
      if (a.k.debut !== b.k.debut) { return sens * (a.k.debut - b.k.debut); }
      return a.x.i - b.x.i;
    }).map(function (o) { return o.x.item; });
  }
  if (critere === 'mien' && ordreMien && ordreMien.length) {
    var rang = function (x) { var r = ordreMien.indexOf(x.cle); return r === -1 ? 1000 + x.i : r; };
    return etiquetees.slice().sort(function (a, b) { return rang(a) - rang(b); }).map(function (x) { return x.item; });
  }
  return liste;
}

// TACHE (chantier "Formations", 2026-09-28, DECISION DE DENIS : "toutes les
// formations seront visibles et toutes les formations auront des missions",
// meme comportement que la carte "Experience personnelle") : meme principe
// EXACT que _pdfPreparerContenuExperiencePerso juste au-dessus, une seule
// liste source (objetCV.formations) au lieu de deux.
function _pdfCleFormation(f) {
  return normaliserPourComparaison((f && f.intitule) || '');
}
// TACHE (retour Denis 2026-09-28, chantier "Formations regroupent tout" -- decision : "mettre les
// certificats et tout ce qui est certification, CQP, diplome dans la formation... une seule
// rubrique, un seul mecanisme") : une certification (dossier.certifications reste un texte simple
// -- "Intitule (organisme, lieu, date)", cf. modules/cv-core/certifications.js -- AUCUN changement
// la, seul le rendu change) devient ici un objet "formation" ephemere, pour beneficier EXACTEMENT
// du meme mecanisme (missions, choix personnel, affichage) que les vraies formations -- jamais un
// 2e systeme parallele. __certifOriginale garde le texte source, pour ne jamais le reconstruire a
// l'envers (composerCertification) si besoin plus tard.
// TACHE (retour Denis 2026-09-28, cv.md point 19) : les missions IA de la certification
// (objetDecide.certificationsAvecMissions, moteurDecisionCV.js -- objetDecide.certifications
// reste une liste de CHAINES, impossible d'y accrocher .missions directement, meme raison que
// loisirRetenu) sont retrouvees par correspondance EXACTE sur le texte -- moteurDecisionCV.js a
// deja fait le rapprochement flou (correspond()) cote assistant, "certification" y est deja l'un
// des textes exacts de objetDecide.certifications, jamais un texte libre a reflouter ici.
function _pdfFormationDepuisCertification(texteBrut, certificationsAvecMissions) {
  var c = (typeof separerCertification === 'function') ? separerCertification(texteBrut) : { intitule: String(texteBrut || ''), organisme: '', lieu: '', date: '' };
  var propose = (certificationsAvecMissions || []).filter(function (e) { return e && e.certification === texteBrut; })[0];
  return { niveau: 'Certification', intitule: c.intitule, annee: c.date, etablissement: c.organisme, lieu: c.lieu, missions: (propose && propose.missions) || '', __certifOriginale: texteBrut };
}
function _pdfFormationsEtCertifications(objetCV) {
  var certifsCommeFormations = (objetCV.certifications || []).map(function (texte) { return _pdfFormationDepuisCertification(texte, objetCV.certificationsAvecMissions); });
  return (objetCV.formations || []).concat(certifsCommeFormations);
}
// TACHE (retour Denis 2026-09-28) : meme fonction EXACTE que
// _pdfAppliquerTexteExpPerso ci-dessus, pour les formations (cle toujours
// l'intitule, une seule liste source).
function _pdfAppliquerTexteFormation(f, opts) {
  var texteParItem = opts.texteParFormation;
  var override = texteParItem && texteParItem[_pdfCleFormation(f)];
  if (!override) { return f; }
  var c = {};
  Object.keys(f).forEach(function (k) { c[k] = f[k]; });
  if (override.titre) { c.intitule = override.titre; }
  if (override.missions) { c.missions = override.missions; }
  // Lot N1 : champs corriges pour ce CV seulement ; absent = valeur du dossier.
  ['niveau', 'annee', 'etablissement', 'lieu'].forEach(function (k) { if (typeof override[k] === 'string') { c[k] = override[k]; } });
  return c;
}
// Retour Denis 2026-09-30 : « Mon ordre » pour les formations. Chaque formation garde sa cle (intitule normalise, la meme que pour le
// choix des formations) et sa position d'origine : les corrections de texte du CV sont rattachees a cette position (fd:0, fr:0...), elles
// ne changent donc pas de formation quand on deplace une formation. Les formations absentes de l'ordre choisi passent apres, dans
// leur ordre habituel.
// Meme cle que _pdfCleFormation, sans jamais lever d'erreur si la fonction de comparaison n'est pas encore chargee (le rendu ne doit pas
// dependre de cette etiquette).
function _pdfCleFormationSure(f) {
  try { return _pdfCleFormation(f); } catch (e) { return String((f && f.intitule) || '').toLowerCase(); }
}
function _pdfIdxFormation(f, position) {
  return (f && f.__posForm !== undefined) ? f.__posForm : position;
}
// Retour Denis 2026-09-30 : ordre des missions a l'interieur d'une experience, d'une formation ou d'une experience personnelle (glisser a la
// souris dans le grand apercu). Memorise par rubrique-element (prefixe « mi:0 », « fm:1 », « em:0 ») sous forme de liste de textes de missions ;
// une mission absente de la liste passe apres les autres, dans son ordre habituel. Chaque mission garde sa cle (retrait, correction de texte).
function _pdfCleMissionOrdre(t) {
  return String(t == null ? '' : t).replace(/[.\s]+$/, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
function _pdfOrdonnerMissionsMien(segments, prefixe, opts) {
  var ordre = opts && opts.ordreMissions && opts.ordreMissions[prefixe];
  if (!ordre || !ordre.length || !segments || segments.length < 2) { return segments; }
  var rang = function (s, i) {
    var r = ordre.indexOf(_pdfCleMissionOrdre(s.texte));
    return r === -1 ? 1000 + i : r;
  };
  return segments.map(function (s, i) { return { s: s, r: rang(s, i) }; }).sort(function (a, b) { return a.r - b.r; }).map(function (x) { return x.s; });
}
// Annee de fin d'une formation (« 2019 », « 2018-2020 », « 2019 - en cours »...) : la plus grande annee ecrite ; vide si aucune.
function _pdfAnneeFormation(f) {
  var m = String((f && f.annee) || '').match(/(?:19|20)\d{2}/g);
  return m ? Math.max.apply(null, m.map(Number)) : 0;
}
function _pdfOrdonnerFormationsMien(formations, opts) {
  var liste = formations || [];
  // Critere d'ordre (retour Denis 2026-09-30) : 'pertinence' (ordre propose, defaut), 'date-desc', 'date-asc' ou 'mien'. Sans critere ecrit,
  // un ordre personnel deja choisi (avant l'arrivee du critere) reste applique.
  var critere = (opts && opts.ordreFormations) || ((opts && opts.ordreFormationsMien && opts.ordreFormationsMien.length) ? 'mien' : 'pertinence');
  var ordre = (critere === 'mien') ? (opts && opts.ordreFormationsMien) : null;
  var etiquetees = liste.map(function (f, i) {
    var c = {};
    Object.keys(f).forEach(function (k) { c[k] = f[k]; });
    c.__cleForm = (f.__cleForm !== undefined) ? f.__cleForm : _pdfCleFormationSure(f);
    c.__posForm = (f.__posForm !== undefined) ? f.__posForm : i;
    return c;
  });
  if ((critere === 'date-desc' || critere === 'date-asc') && etiquetees.length > 1) {
    // Les formations sans annee passent apres les autres ; a annee egale, l'ordre habituel est conserve.
    var sens = (critere === 'date-desc') ? -1 : 1;
    return etiquetees.slice().sort(function (a, b) {
      var ya = _pdfAnneeFormation(a), yb = _pdfAnneeFormation(b);
      if (!ya && !yb) { return a.__posForm - b.__posForm; }
      if (!ya) { return 1; }
      if (!yb) { return -1; }
      return (ya === yb) ? (a.__posForm - b.__posForm) : sens * (ya - yb);
    });
  }
  if (!ordre || !ordre.length || etiquetees.length < 2) { return etiquetees; }
  var rang = function (f) {
    var r = ordre.indexOf(f.__cleForm);
    return r === -1 ? 1000 + f.__posForm : r;
  };
  return etiquetees.slice().sort(function (a, b) { return rang(a) - rang(b); });
}
function _pdfPreparerContenuFormations(contenu, objetCV, opts) {
  // TACHE (retour Denis 2026-09-28) : formations ET certifications fusionnees en une seule liste
  // ici -- source unique pour tout ce qui suit (tout/pertinentes, missions, texte). Neutralise
  // copie.certifications juste en dessous pour que l'ancien rendu separe (blocCertifs(),
  // cvPdfTemplateMaquette.js) ne les affiche plus une 2e fois.
  var formationsBrutes = _pdfFormationsEtCertifications(objetCV);
  var copie = {};
  Object.keys(contenu).forEach(function (cle) { copie[cle] = contenu[cle]; });
  copie.certifications = [];
  var tout = opts.formationsTout || 'toutes';
  if (tout === 'toutes') {
    copie.formations = formationsBrutes;
  } else if (tout === 'pertinentes' && opts.formationsChoisies) {
    copie.formations = formationsBrutes.filter(function (f) { return opts.formationsChoisies.indexOf(_pdfCleFormation(f)) !== -1; });
  }
  if (Array.isArray(copie.formations)) { copie.formations = _pdfOrdonnerFormationsMien(copie.formations, opts); }
  if (opts.missionsParFormation) {
    // TACHE (retour Denis 2026-09-28, point 13) : un choix PRECIS
    // (opts.missionsChoisiesFormation[cle]) prime toujours sur le simple
    // compteur -- meme principe EXACT que _pdfAppliquerMissionsExpPerso
    // juste au-dessus.
    copie.formations = (copie.formations || []).map(function (f) {
      var cle = _pdfCleFormation(f);
      var segments = _pdfDecouperMissions(f.missions || '');
      if (!segments.length) { return f; }
      var choisies = opts.missionsChoisiesFormation && opts.missionsChoisiesFormation[cle];
      var gardees;
      if (choisies && choisies.length) {
        gardees = choisies.map(function (i) { return segments[i]; }).filter(Boolean);
      } else {
        var n = opts.missionsParFormation[cle];
        if (n === undefined || n === null) { return f; }
        gardees = segments.slice(0, n);
      }
      var c = {};
      Object.keys(f).forEach(function (k) { c[k] = f[k]; });
      c.missions = gardees.join('\n');
      return c;
    });
  }
  if (opts.texteParFormation) {
    copie.formations = (copie.formations || []).map(function (f) { return _pdfAppliquerTexteFormation(f, opts); });
  }
  // « Certifications » : VRAIE RUBRIQUE, avec son titre, juste sous les formations (decision de Denis, 2026-09-30). Automatique des TROIS certifications
  // (les diplomes respirent) ; la personne peut la choisir meme avec une ou deux, ou la refuser (opts.certifsRubrique : true / false, absent = automatique,
  // case « Certifications » des Elements supplementaires). Refusee, chaque certification reste une ligne des formations, avec ses missions.
  // Les modeles a disposition propre (Rectangles, Frise, Photo) affichent deja contenu.certifications ; les autres la placent avec les formations
  // (blocForm, cvPdfTemplateMaquette.js).
  var certifsFormations = (copie.formations || []).filter(function (f) { return f && f.__certifOriginale; });
  var certifsEnRubrique = opts.certifsRubrique === true || (opts.certifsRubrique !== false && certifsFormations.length >= 3);
  if (certifsEnRubrique && certifsFormations.length) {
    copie.formations = copie.formations.filter(function (f) { return !(f && f.__certifOriginale); });
    copie.certifications = certifsFormations.map(function (f) { return f.__certifOriginale; }).filter(Boolean);
  }
  return copie;
}

// TACHE (Denis, 2026-09-25, tranche 2) : quel rendu pour ces reglages ? Renvoie
// l'identifiant de gabarit de la maquette ('' = Standard, 'bandeau', 'sobre-fond'...)
// ou null pour l'ancien rendu (recettes de l'application). opts.gabaritMaquette
// (pose par le choix d'un modele de la galerie) prime ; sans lui, seule l'allure
// Standard (ni Sobre ni Créatif) prend la page de la maquette.
// « Competences en haut » PAR DEFAUT (quand la personne n'a pas touche a la case) : OUI sur tout modele de la maquette, a une comme a deux colonnes
// (decision de Denis, 2026-10-01 : « en tete du CV, competences professionnelles et comportementales, puis l'experience »). Une premiere version de
// la journee les mettait apres les formations sur une colonne : annulee le meme jour. Case cochee ou decochee a la main : toujours respectee.
function _pdfCompetencesEnHautParDefaut(opts) {
  return _pdfGabaritMaquette(opts || {}) !== null;
}
function _pdfGabaritMaquette(opts) {
  // « Colonne et frise » est un modele de la maquette : rendu de la maquette, comme les autres (plein ecran de la maquette compris).
  if (opts.gabaritCreatif === 'frise') { return 'frise'; }
  if (typeof opts.gabaritMaquette === 'string') { return opts.gabaritMaquette; }
  if (!opts.sobreActif && !opts.creatifActif) { return ''; }
  return null;
}

function _pdfConstruireStyleEtPage(objetCV, composition, options) {
  var opts = options || {};
  // TACHE (phase 5.2, 6e modele "Colonne et frise") : meme patron de
  // dispatch que composer() de la maquette (redirige AVANT tout le reste,
  // jamais un cas particulier tisse dans le corps de la fonction standard
  // ci-dessous) -- voir _pdfConstruireFrise() juste au-dessus.
  // TACHE (Denis, 2026-09-25, tranche 2) : Standard et modeles de la maquette =
  // rendu « page de la maquette » (cvPdfTemplateMaquette.js), meme dispatch en
  // tout premier que la frise. (2026-09-26 : tous les modeles, y compris ceux de l'application, sont rendus par la maquette.)
  var gabaritMaquette = _pdfGabaritMaquette(opts);
  if (gabaritMaquette !== null && typeof _pdfConstruireMaquette === 'function') {
    return _pdfConstruireMaquette(objetCV, composition, opts, gabaritMaquette);
  }
  // Ancien rendu de l'application (recettes Creatif et variantes Sobre historiques) supprime le 2026-09-26 : plus aucun modele ne l'utilisait.
  // Repli de securite : tout autre cas (jamais atteint) est rendu comme Standard.
  return _pdfConstruireMaquette(objetCV, composition, opts, '');
}

// Construit le document HTML COMPLET et autonome (export/impression
// statique, sans panneau de reglages) -- reutilise _pdfConstruireStyleEtPage
// pour ne jamais dupliquer la logique de rendu. Options : voir
// _pdfConstruireStyleEtPage ci-dessus.
function construireHtmlPdfA4(objetCV, composition, options) {
  var resultat = _pdfConstruireStyleEtPage(objetCV, composition, options);
  return '<!DOCTYPE html>' +
'<html lang="fr"><head><meta charset="UTF-8"><title>' + _pdfEscaperHtml((typeof nomFichierCV === 'function') ? nomFichierCV((typeof dossier !== 'undefined' && dossier) ? dossier : objetCV) : ('CV - ' + resultat.nomComplet)) + '</title><style>' +
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
