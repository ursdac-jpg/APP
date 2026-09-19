/* ============================================================
   composeurRender.js
   ------------------------------------------------------------
   Moteur "Composeur (Bêta)" — Couche ⑤ : Render Engine.
   Voir architecture-moteur-cv.md §2 (couche ⑤).

   Construit le document Word réel (docx.js), à partir de : l'objetCV
   normalisé, la composition (③) et le thème (④). Principe déjà connu
   (c'est ce que exportDocxNatifCV.js fait pour les 16 modèles existants)
   -- ce fichier est un nouveau code, jamais une modification des
   générateurs existants (isolation, architecture §0.1).
   ============================================================ */

// TACHE (Projet XXL) : en-tête à 2 zones (identité+coordonnées à gauche,
// poste visé+accroche à droite), entièrement isolée dans cette fonction
// dédiée -- jamais mélangée à l'en-tête "classique" ci-dessous, utilisée
// par Sobre/Institutionnel/Moderne. Reprend les mêmes columnWidths que
// la table 2 colonnes du corps du CV ([3400, 6600]) pour rester visuellement
// cohérente -- le document de conception ne précise pas de largeurs
// dédiées pour l'en-tête elle-même.
function _projetxxlConstruireEnTete(docx, objetCV, theme, PRIMAIRE, TEXTE, taillePolice) {
  var Paragraph = docx.Paragraph, TextRun = docx.TextRun, AlignmentType = docx.AlignmentType,
      Table = docx.Table, TableRow = docx.TableRow, TableCell = docx.TableCell,
      WidthType = docx.WidthType, VerticalAlign = docx.VerticalAlign, BorderStyle = docx.BorderStyle,
      ImageRun = docx.ImageRun;

  var identite = objetCV.identite || {};
  var permis = objetCV.permis || {};
  var icones = !!theme.iconesCoordonnees;
  // TACHE (retour utilisateur, port du chantier PDF -- "je veux que les
  // deux [en-tete et corps] grandissent ensemble, mais en commencant
  // toujours par l'en-tete... je prefere avoir les deux qui restent a peu
  // pres equivalentes, peut-etre la tete un peu plus grande") : nom et
  // metier vise etaient jusqu'ici des tailles FIXES (30), jamais liees a
  // la densite du contenu -- theme.enteteBonus (meme circuit exact que
  // theme.tailleBonus, voir js/app.js activerMiseEnFormeUltimeXXL) les
  // rend desormais ajustables. Coefficient 1.15 : coherent avec le bonus
  // corps existant (x1.08, composeurComposition.js) tout en restant
  // strictement superieur, pour que l'en-tete reste visuellement au moins
  // aussi grande que le corps -- jamais une 2e constante arbitraire sans
  // lien avec l'existant. L'accroche (deja couplee a taillePolice, voir
  // plus bas) recoit le meme coefficient pour ne jamais se retrouver plus
  // petite que le corps une fois celui-ci lui-meme agrandi.
  var tailleEnteteNomMetier = theme.enteteBonus ? Math.round(30 * 1.15) : 30;
  var tailleEnteteAccroche = theme.enteteBonus ? Math.round(taillePolice * 1.15) : taillePolice;
  // TACHE (Projet XXL, mode "Lecture guidée") : seul ce mode colore le
  // Nom et le Poste visé de l'en-tête avec l'accent -- "Texte coloré"
  // seul ne colore QUE les titres de section (voir titreSection()),
  // jamais l'en-tête (distinction explicite du document de conception).
  // TACHE (retour utilisateur : "Fond des colonnes", effet "titres") :
  // colore lui aussi le Nom et le Poste visé -- l'en-tête est une table
  // SEPAREE du corps (jamais sur un fond de colonne), aucune collision
  // possible ici, contrairement aux titres de bloc du corps
  // (voir couleurTitrePourColonne(), composeurConstruireDocument).
  // TACHE (retour utilisateur : "couleur entreprise activée mais CV tout
  // blanc" -- bug reel) : theme.couleurPrimaireForcee (composeurTheme.js)
  // leve la suppression normale de l'accent en-tete quand la couleur a
  // ete choisie EXPLICITEMENT (entreprise ou pipette libre) -- jamais
  // pour une simple couleur de palette par defaut, qui reste soumise a
  // la regle "Coloration" habituelle.
  // TACHE (retour utilisateur : "En-tête colorable séparément du corps") :
  // fond posé plus loin (composeurConstruireDocument, enveloppement de
  // enfantsEnTete) -- ICI, uniquement le texte doit rester lisible dessus.
  // couleurLisibleFondTete (blanc/noir selon theme.texteFondColonnes,
  // même logique que couleurLisibleFondColonnes pour les colonnes) prime
  // sur TOUTE autre règle de coloration de l'en-tête dès que ce fond est
  // actif -- jamais un texte de la même couleur que son propre fond.
  var teteColoree = !!theme.fondTete;
  var couleurLisibleFondTete = (theme.texteFondColonnes === 'noir') ? '000000' : 'FFFFFF';
  // TACHE (retour utilisateur : "bande continue de haut en bas, un seul
  // côté de l'en-tête, jamais le bandeau complet") : DISTINCT de
  // teteColoree ci-dessus (qui colore les 2 côtés ensemble) -- ne colore
  // QUE le côté correspondant à "Fond des colonnes" (gauche/droite),
  // jamais les deux, et exclusif de teteColoree (voir le panneau,
  // js/app.js -- ces 2 réglages ne peuvent jamais être actifs ensemble).
  // Recalculé ici en PHYSIQUE (gauche/droite réels), jamais lié à
  // laterale/principale : la zone gauche de l'en-tête (identité) est
  // toujours physiquement à gauche, quelle que soit theme.colonnesInversees
  // (qui ne concerne que le corps du CV, jamais cet en-tête).
  var etendreFondColonneEntete = !!(theme.fondColonneEtendueEntete && !teteColoree && (theme.fondColonnesEffet || 'fondSeul') === 'fondSeul');
  var fondGaucheEnteteActif = etendreFondColonneEntete && (theme.fondColonnes === 'gauche' || theme.fondColonnes === 'lesDeux');
  var fondDroiteEnteteActif = etendreFondColonneEntete && (theme.fondColonnes === 'droite' || theme.fondColonnes === 'lesDeux');
  function couleurAccentZone(zoneColoree) {
    return (teteColoree || zoneColoree)
      ? couleurLisibleFondTete
      : ((theme.coloration === 'lectureGuidee' || theme.fondColonnesEffet === 'titres' || theme.couleurPrimaireForcee) ? PRIMAIRE : TEXTE);
  }
  function couleurContactZone(zoneColoree) { return (teteColoree || zoneColoree) ? couleurLisibleFondTete : TEXTE; }
  var couleurAccentZoneGauche = couleurAccentZone(fondGaucheEnteteActif);
  var couleurContactZoneGauche = couleurContactZone(fondGaucheEnteteActif);
  var couleurAccentZoneDroite = couleurAccentZone(fondDroiteEnteteActif);
  var couleurContactZoneDroite = couleurContactZone(fondDroiteEnteteActif);

  function ligneContact(texte, icone, couleurContact) {
    var prefixe = (icones && icone) ? (icone + ' ') : '';
    return new Paragraph({ spacing: { after: 40 }, children: [ new TextRun({ text: prefixe + texte, size: taillePolice - 2, color: couleurContact, font: theme.police.corps }) ] });
  }

  // ---- Bloc identité : photo + nom + coordonnées + permis. Règle testée
  // et vérifiée (doc de conception) : un champ absent ne pousse JAMAIS de
  // paragraphe vide -- il est simplement omis, le contenu suivant remonte
  // naturellement dans le flux Word. Paramétré en (couleurAccent,
  // couleurContact) -- TACHE (retour utilisateur : "photo à droite ou à
  // gauche, avec tout ce qui est coordonnées et nom -- pas juste la
  // photo seule") : ce bloc entier (photo comprise) peut désormais être
  // placé à gauche OU à droite (theme.enteteInversee, plus bas) -- les
  // couleurs doivent donc suivre la position RÉELLE où il atterrit,
  // jamais "gauche" par principe (voir appel plus bas).
  function construireBlocIdentite(couleurAccent, couleurContact) {
    var bloc = [];
    // TACHE (retour utilisateur : "je veux avoir la possibilité de mettre
    // une photo" -- Projet XXL) : le Composeur (ses 4 thèmes) ne lisait
    // objetCV.photo NULLE PART jusqu'ici -- gap similaire à celui déjà
    // corrigé pour les certifications. Réutilise le mécanisme générique
    // déjà existant et partagé par les 16 modèles classiques
    // (_dnDataUrlVersOctets/_dnTypeImagePhoto, miniCvA5.js -- déjà globales,
    // jamais redéfinies ici) : la case "Inclure ma photo" déjà présente
    // dans le panneau (générique, pas propre au Composeur) pilote déjà
    // objetCV.photo.url -- aucun nouveau réglage nécessaire dans le
    // panneau Projet XXL, seul le rendu manquait. Photo carrée, en haut
    // du bloc (au-dessus du nom), même esprit que les modèles 2 colonnes
    // classiques (Aquarelle, Moderne, etc.) qui la placent en haut de
    // leur colonne latérale. Silencieusement absente si non incluse
    // (comportement identique aux 16 modèles classiques).
    var octetsPhotoXXL = (typeof _dnDataUrlVersOctets === 'function') ? _dnDataUrlVersOctets(objetCV.photo && objetCV.photo.url) : null;
    if (octetsPhotoXXL) {
      bloc.push(new Paragraph({
        spacing: { after: 120 },
        children: [ new ImageRun({ data: octetsPhotoXXL, transformation: { width: 70, height: 70 }, type: _dnTypeImagePhoto(objetCV.photo.url) }) ]
      }));
    }
    // TACHE (retour utilisateur : "le nom de famille toujours en
    // majuscules, ca evite les confusions avec le prenom") : convention
    // recrutement -- prenom affiche tel quel, nom de famille TOUJOURS en
    // capitales. Meme convention que le PDF (cvPdfTemplateA4.js).
    var nomComplet = ((identite.prenom || '') + ' ' + (identite.nom || '').toUpperCase()).trim();
    if (nomComplet) {
      // TACHE (retour utilisateur : "je veux aussi que le nom et le poste
      // visé soient soulignés quand j'active le séparateur, sur 1 ou 2
      // colonnes") : même couleur que les autres soulignements du
      // séparateur (PRIMAIRE) -- ne concerne QUE le trait, jamais la
      // couleur du texte (couleurAccent reste seule maîtresse du texte,
      // comme pour les titres de bloc, voir titreSection).
      bloc.push(new Paragraph({
        spacing: { after: 60 },
        border: theme.separateurColonnes ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: (theme.separateurCouleurHex || PRIMAIRE), space: 2 } } : undefined,
        children: [ new TextRun({ text: nomComplet, bold: true, size: tailleEnteteNomMetier, color: couleurAccent, font: theme.police.titres }) ]
      }));
    }
    var villeCP = [_formaterVille(identite.ville), identite.codePostal ? '(' + identite.codePostal + ')' : ''].filter(Boolean).join(' ');
    // TACHE (retour utilisateur : "bandeau coordonnées -- je vais mettre
    // adresse mail, téléphone, permis et la ville") : renommé depuis
    // "bandeau de disponibilité" -- email et ville rejoignent désormais
    // eux aussi le bandeau (avec téléphone et permis, déjà exclus d'ici),
    // jamais affichés aux deux endroits à la fois.
    if (villeCP && !theme.bandeauDisponibilite) { bloc.push(ligneContact(villeCP, '📍', couleurContact)); }
    if (identite.email && !theme.bandeauDisponibilite) { bloc.push(ligneContact(identite.email, '✉', couleurContact)); }
    if (identite.telephone && !theme.bandeauDisponibilite) { bloc.push(ligneContact(identite.telephone, '☎', couleurContact)); }
    // Lot moteur sous-lot 4 : theme.permisMasque = la personne a masque le
    // permis dans "Ce qui s'affiche" (le permis est le seul de la liste a
    // vivre dans l'en-tete, pas dans contenuRetenu).
    if (permis.possede && !theme.bandeauDisponibilite && !theme.permisMasque) {
      var suffixeVehicule = permis.vehicule ? ' + véhicule' : '';
      bloc.push(ligneContact('Permis ' + (permis.categories || []).join('/') + suffixeVehicule, '🚗', couleurContact));
    }
    if (!bloc.length) { bloc.push(new Paragraph({ children: [] })); } // filet de securite, jamais une cellule Word sans aucun enfant
    return bloc;
  }

  // ---- Bloc objectif : poste visé (grand, centré) + accroche
  // (optionnelle, centrée). Le retrait de l'accroche quand une lettre de
  // motivation accompagne le CV est déjà géré en amont par
  // genererDocxComposeur() (composeurMoteur.js, paramètre sansAccroche/
  // theme.lettreJointe) -- objetCV.profil est alors déjà vide à ce
  // stade, le paragraphe est simplement omis ici, jamais une logique de
  // retrait dupliquée. Paramétré en couleurs, même principe que
  // construireBlocIdentite() ci-dessus. ----
  function construireBlocObjectif(couleurAccent, couleurContact) {
    var bloc = [];
    if (objetCV.objectifProfessionnel) {
      bloc.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 100 },
        border: theme.separateurColonnes ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: (theme.separateurCouleurHex || PRIMAIRE), space: 2 } } : undefined,
        children: [ new TextRun({ text: objetCV.objectifProfessionnel, bold: true, size: tailleEnteteNomMetier, color: couleurAccent, font: theme.police.titres }) ]
      }));
    }
    var texteAccroche = (objetCV.profil && (objetCV.profil.profilIA || objetCV.profil.profilUtilisateur)) || '';
    if (texteAccroche) {
      // TACHE (retour utilisateur : "je veux avoir la possibilité de
      // choisir si la phrase d'accroche est en italique ou pas") : true
      // par defaut (comportement identique a avant ce reglage).
      bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [ new TextRun({ text: texteAccroche, italics: (theme.accrocheItalique !== false), size: tailleEnteteAccroche, color: couleurContact, font: theme.police.corps }) ] }));
    }
    if (!bloc.length) { bloc.push(new Paragraph({ children: [] })); }
    return bloc;
  }

  // TACHE (retour utilisateur : "photo à droite ou à gauche, tout le
  // bloc identité bouge ensemble, l'objectif visé prend la place
  // laissée libre") : bouton INDÉPENDANT de "Permuter les colonnes" du
  // corps (theme.colonnesInversees) -- voir js/app.js (2 réglages
  // séparés, décision explicite : plus de liberté, personne n'a
  // forcément de photo/n'a pas forcément envie de lier les deux). Les
  // couleurs (couleurAccentZoneGauche/Droite, calculées plus haut à
  // partir du fond PHYSIQUE réel) sont passées à CHAQUE bloc selon la
  // position où il atterrit réellement, jamais figées par identité.
  var inverserEntete = !!theme.enteteInversee;
  var zoneGauche = inverserEntete
    ? construireBlocObjectif(couleurAccentZoneGauche, couleurContactZoneGauche)
    : construireBlocIdentite(couleurAccentZoneGauche, couleurContactZoneGauche);
  var zoneDroite = inverserEntete
    ? construireBlocIdentite(couleurAccentZoneDroite, couleurContactZoneDroite)
    : construireBlocObjectif(couleurAccentZoneDroite, couleurContactZoneDroite);

  var AUCUNE_BORDURE_ENTETE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [3400, 6600],
      borders: {
        top: AUCUNE_BORDURE_ENTETE, bottom: AUCUNE_BORDURE_ENTETE, left: AUCUNE_BORDURE_ENTETE,
        right: AUCUNE_BORDURE_ENTETE, insideHorizontal: AUCUNE_BORDURE_ENTETE, insideVertical: AUCUNE_BORDURE_ENTETE
      },
      rows: [ new TableRow({ children: [
        // TACHE (retour utilisateur : "trop d'espace entre les
        // coordonnées et Compétences professionnelles/Expérience
        // professionnelle" -- bug réel diagnostiqué empiriquement, PDF
        // réel converti et inspecté via pdftotext -layout) : la zone
        // gauche (nom + jusqu'à 4 lignes de coordonnées) est presque
        // toujours plus haute que la zone droite (poste visé seul,
        // surtout sans accroche) -- Word calcule la hauteur de la ligne
        // du tableau sur la cellule la PLUS HAUTE, et VerticalAlign.TOP
        // faisait s'accumuler tout l'espace inutilisé de la cellule la
        // plus courte EN BAS, juste avant le corps du CV (mesuré : ~4
        // lignes vides en pdftotext sur un cas sans accroche). CENTER
        // répartit cet espace au-dessus ET en dessous -- ne l'élimine
        // pas totalement (Word ne peut pas faire déborder le contenu
        // d'une cellule courte dans une autre ligne de tableau), mais
        // évite qu'il s'accumule entièrement à la jonction avec le corps.
        // TACHE (retour utilisateur : "bande continue de haut en bas, un
        // seul côté") : shading posé ICI (sur la cellule elle-même),
        // jamais via l'enveloppement plein-largeur utilisé par fondTete --
        // undefined (pas de couleur) si etendreFondColonneEntete est faux,
        // comportement par défaut strictement inchangé.
        new TableCell({ width: { size: 3400, type: WidthType.DXA }, shading: fondGaucheEnteteActif ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: PRIMAIRE } : undefined, margins: { top: 0, bottom: 60, left: 0, right: 200 }, verticalAlign: VerticalAlign.CENTER, children: zoneGauche }),
        new TableCell({ width: { size: 6600, type: WidthType.DXA }, shading: fondDroiteEnteteActif ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: PRIMAIRE } : undefined, margins: { top: 0, bottom: 60, left: 200, right: 0 }, verticalAlign: VerticalAlign.CENTER, children: zoneDroite })
      ] }) ]
    }),
    // TACHE (retour utilisateur : "trop d'espace entre l'en-tête et le
    // corps") : ce paragraphe reste nécessaire tel quel (Word gère mal
    // 2 tableaux directement adjacents sans paragraphe entre les deux) --
    // mais un paragraphe vide hérite par défaut de la hauteur de ligne du
    // style "Normal", un plein interligne pour rien. Un TextRun de taille
    // minuscule (2) réduit cette hauteur au strict minimum tout en
    // gardant son rôle structurel de séparateur -- mesuré et vérifié
    // (PDF réel, pdftotext -bbox) : réduit le vide mesuré de ~44pt à une
    // valeur nettement plus proche des espacements normaux entre blocs.
    // TACHE (retour utilisateur : "modèle Ruban -- ligne horizontale
    // juste sous le titre du cv") : ce même paragraphe de transition
    // porte désormais la ligne horizontale quand le séparateur est actif
    // -- jamais un second paragraphe qui rajouterait de la hauteur.
    new Paragraph({
      spacing: { after: 0, before: 0 },
      border: theme.separateurColonnes
        ? { bottom: { style: BorderStyle.SINGLE, size: 12, color: (theme.separateurCouleurHex || PRIMAIRE), space: 4 } }
        : undefined,
      children: [ new TextRun({ text: '', size: 2 }) ]
    })
  ];
}

// TACHE (chantier "exp perso", Phase 4 : engagements structurés) : un
// engagement peut être une chaîne (ancienne donnée, ou saisie manuelle
// via un parcours jamais touché par ce chantier) ou un objet {texte,
// dateDebut, dateFin} (Découverte, depuis cette Phase 4) -- fonction
// utilitaire partagée, jamais dupliquée à chaque endroit qui affiche un
// engagement.
function _texteEngagement(t) {
  if (typeof t === 'string') { return t; }
  return (t && t.texte) || '';
}

// TACHE (retour utilisateur : "sport extrêmes, moto -- majuscule en
// début") : ne touche QUE la 1ère lettre de chaque mot, jamais le reste
// (un sigle correctement écrit, ex. "VTT", reste intact).
// TACHE (retour utilisateur, bug trouvé : "moto reste en minuscule après
// la virgule") : "sports extrêmes, moto" est en réalité UNE SEULE chaîne
// (plusieurs loisirs d'un même fragment joints par ", ", voir
// decouverteMapping.js -- elementsFactuels.join(', ')), jamais deux
// éléments distincts dans le tableau -- capitaliser seulement le tout
// premier caractère de la chaîne entière ratait donc tout ce qui suit
// une virgule. Découpe désormais sur ", ", capitalise CHAQUE segment,
// puis rejoint à l'identique.
function _premiereMajuscule(texte) {
  if (!texte) { return texte; }
  return texte.split(', ').map(function (segment) {
    return segment ? (segment.charAt(0).toUpperCase() + segment.slice(1)) : segment;
  }).join(', ');
}
// TACHE (retour utilisateur : "pour la ville, que la 1ere lettre en
// majuscule, les autres en minuscule") : DISTINCT de _premiereMajuscule
// ci-dessus (qui ne touche jamais le reste du mot, pense pour les sigles)
// -- la ville est le plus souvent saisie tout en majuscules (ex.
// "BEAUPOUYET"), il faut donc explicitement rabaisser le reste.
function _formaterVille(texte) {
  return texte ? (texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase()) : texte;
}

// TACHE (retour utilisateur, bug trouvé : "Épuré -- aucun changement,
// Condensé -- il manque les points entre les missions") : les missions
// venant du parcours Découverte sont UNE SEULE CHAÎNE jointe par « ; »
// (_decouverteConcatenerPreuve, decouverteMapping.js) -- jamais des
// sauts de ligne, à la différence de la saisie manuelle (textarea,
// app.js). Découper uniquement sur \n ratait donc ce format : un seul
// "morceau" reconnu au total, donc aucune puce séparée en Épuré, aucun
// séparateur « · » en Condensé (join sur un tableau à 1 élément ne fait
// rien). Gère désormais les deux formats -- \n en priorité (saisie
// manuelle), repli sur « ; » si un seul morceau en résulte ET que le
// texte contient réellement des « ; » (format Découverte) -- jamais les
// deux à la fois, un texte ne mélange jamais les deux conventions.
function _decouperMissions(missionsTexte) {
  var brut = (missionsTexte || '').trim();
  if (!brut) { return []; }
  var morceaux = brut.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  if (morceaux.length <= 1 && brut.indexOf(';') !== -1) {
    morceaux = brut.split(';').map(function (l) { return l.trim(); }).filter(Boolean);
  }
  // TACHE (retour utilisateur : "est-ce que ce bug affecte aussi les
  // autres parcours ?" -- vérifié, oui) : 3e format trouvé, utilisé par
  // l'écran de validation d'import ET par les missions proposées par
  // l'IA (savoirFaireParExperience, app.js -- .join('. ') dans les deux
  // cas, même mécanisme partagé) -- des phrases jointes par ". " (point-
  // espace), ni saut de ligne ni point-virgule. Découpe sur un point
  // suivi d'un espace ET d'une majuscule (évite de couper à tort une
  // abréviation ou un nombre décimal) -- seulement si aucun des 2 formats
  // précédents n'a donné plus d'un morceau.
  if (morceaux.length <= 1 && /\.\s+[A-ZÀ-Ý]/.test(brut)) {
    morceaux = brut.split(/\.\s+(?=[A-ZÀ-Ý])/).map(function (l) { return l.trim(); }).filter(Boolean);
  }
  return morceaux;
}

// Retire toute ponctuation de fin (point, point-virgule, espaces) d'un
// segment de mission, pour reconstruire proprement soit une puce Épuré
// (avec un point unique ajouté), soit une jointure Condensé (sans aucun
// point, séparée uniquement par « · »).
function _sansPonctuationFinale(segment) {
  return (segment || '').replace(/[;.\s]+$/, '').replace(/^[;.\s]+/, '');
}

// TACHE (retour utilisateur : "si je mets 2016 et que c'est toujours le
// cas... on a du mal à comprendre si c'est une expérience uniquement en
// 2016 ou depuis 2016") : une date de début seule, sans date de fin,
// est ambiguë -- "2016 - en cours" lève l'ambiguïté ("en cours" déjà le
// libellé utilisé pour ce même cas dans les sélecteurs d'année,
// decouverteParcours.js/app.js -- même mot partout, jamais un second
// vocabulaire pour la même idée). Une période complète (les deux dates
// présentes) ou une chaîne vide (aucune des deux) restent inchangées.
// TACHE (retour utilisateur : "je ne veux pas les mois, seulement les
// annees") : dates stockees en AAAA-MM -- seule l'annee (4 premiers
// caracteres) est affichee desormais, jamais le mois. Debut===fin (une
// experience commencee et terminee la meme annee) affiche une seule
// annee, jamais "2020 - 2020" -- meme convention que le PDF
// (_pdfFormaterPeriode, cvPdfTemplateA4.js).
function _anneeSeule(dateAAAAMM) {
  return (dateAAAAMM || '').slice(0, 4);
}
function _formaterPeriode(dateDebut, dateFin) {
  var anneeDebut = _anneeSeule(dateDebut);
  var anneeFin = _anneeSeule(dateFin);
  if (anneeDebut && !anneeFin) { return anneeDebut + ' - en cours'; }
  if (anneeDebut && anneeFin && anneeDebut === anneeFin) { return anneeDebut; }
  return [anneeDebut, anneeFin].filter(Boolean).join(' - ');
}

function composeurConstruireDocument(docx, objetCV, composition, theme) {
  var Document = docx.Document, Paragraph = docx.Paragraph, TextRun = docx.TextRun,
      AlignmentType = docx.AlignmentType, BorderStyle = docx.BorderStyle, LevelFormat = docx.LevelFormat,
      Table = docx.Table, TableRow = docx.TableRow, TableCell = docx.TableCell,
      WidthType = docx.WidthType, VerticalAlign = docx.VerticalAlign, TabStopType = docx.TabStopType;

  var PRIMAIRE = theme.couleurs.primaire, TEXTE = theme.couleurs.texte, SECONDAIRE = theme.couleurs.secondaire;
  var FOND = theme.couleurs.fond || 'FFFFFF';
  var taillePolice = composition.taillePoliceCorps * 2; // docx.js : les tailles s'expriment en demi-points
  var refPuces = 'composeur-puces';
  // TACHE (Projet XXL) : conditionne les branches specifiques a ce theme
  // plus bas (en-tete 2 zones, icones d'en-tete, renommage "Competences
  // comportementales") -- theme.id n'est jamais 'projetxxl' pour
  // Sobre/Institutionnel/Moderne.
  var estProjetXXL = (theme.id === 'projetxxl');

  // TACHE (retour utilisateur : "possibilité de mettre un fond comme
  // Aquarelle sur la colonne de gauche... 3 possibilités") : "Fond des
  // colonnes" -- EXCLUSIF à Projet XXL (theme.fondColonnes n'existe sur
  // aucun des 3 autres thèmes, undefined partout ailleurs -- ces 3
  // variables valent alors toujours null/'fondSeul', structurellement
  // sans effet pour Sobre/Institutionnel/Moderne).
  var FOND_GAUCHE = (theme.fondColonnes === 'gauche' || theme.fondColonnes === 'lesDeux') ? PRIMAIRE : null;
  var FOND_DROITE = (theme.fondColonnes === 'droite' || theme.fondColonnes === 'lesDeux') ? PRIMAIRE : null;
  var effetFondColonnes = theme.fondColonnesEffet || 'fondSeul';
  var couleurLisibleFondColonnes = (theme.texteFondColonnes === 'noir') ? '000000' : 'FFFFFF';
  // TACHE (retour utilisateur : "souligné -- les titres ont la même
  // couleur que le fond, on ne les voit pas") : calculé ICI (au lieu de
  // sa position d'origine, plus bas juste avant envelopperZoneColoree())
  // pour être disponible dans couleurTitrePourColonne() ci-dessous --
  // "Fond des colonnes" en 1 colonne enveloppe TOUT le corps dans une
  // cellule PRIMAIRE (envelopperZoneColoree(), voir plus bas), mais
  // couleurTitrePourColonne() ne connaissait que FOND_LATERALE/
  // FOND_PRINCIPALE (mécanisme à 2 colonnes) -- un titre "souligné" (donc
  // jamais protégé par le cas 'bandeau', qui a sa propre couleur fixe) se
  // retrouvait alors PRIMAIRE sur un fond PRIMAIRE, invisible, bug confirmé
  // en testant "1 colonne + Fond des colonnes + Lecture guidée".
  var corpsColore1Colonne = !!(estProjetXXL && composition.colonnes === 1 && theme.fondColonnes && theme.fondColonnes !== 'aucun');

  // TACHE (retour utilisateur : "permuter la colonne latérale (petite) et
  // la colonne principale (détaillée), esthétique seulement -- mêmes
  // fonctions, même taille, juste le côté qui change") : n'affecte QUE le
  // corps principal 2 colonnes plus bas (repartitionColonnes.laterale/
  // .principale) -- jamais l'A5/A5-paysage, qui réutilisent les MÊMES
  // fonctions couleurTitrePourColonne()/couleurContenuPourColonne() ci-
  // dessous avec leurs propres zones fixes (gaucheA5/droiteA5...), sans
  // rapport avec ce réglage. FOND_GAUCHE/FOND_DROITE restent purement
  // physiques et inchangés (toujours utilisés tels quels par l'A5) ;
  // FOND_LATERALE/FOND_PRINCIPALE ci-dessous suivent le CONTENU logique
  // (laterale/principale), quel que soit son côté physique réel.
  var inverserColonnes = !!(theme.colonnesInversees && composition.formatPage !== 'A5-portrait' && composition.formatPage !== 'A5-paysage');
  var FOND_LATERALE = inverserColonnes ? FOND_DROITE : FOND_GAUCHE;
  var FOND_PRINCIPALE = inverserColonnes ? FOND_GAUCHE : FOND_DROITE;

  // TACHE (retour utilisateur : "texte coloré, nouvelle fonction --
  // colorer tout le contenu des blocs, sans avoir besoin d'un fond de
  // colonne") : DÉCOUPLÉ de "Fond des colonnes" (ci-dessus) -- fonctionne
  // seul, sans FOND_GAUCHE/FOND_DROITE, jamais de collision à résoudre
  // (le texte n'est jamais posé sur un fond de sa propre couleur ici,
  // contrairement à l'ancien mécanisme retiré). Portée choisie par la
  // personne (gauche/droite/les deux) -- en 1 colonne, la portée n'a pas
  // de sens (pas de gauche/droite), tout le contenu est coloré dès que
  // "Texte coloré" est actif.
  // TACHE (bug réel trouvé sur capture d'écran fournie par l'utilisateur,
  // chantier "CV Créatif") : contrairement aux TITRES de bloc
  // (couleurTitrePourColonne, juste plus bas -- déjà protégés), le
  // CONTENU d'une colonne en "Fond des colonnes" effet 'fondSeul' (colonne
  // entière remplie de PRIMAIRE) n'avait jamais de traitement de lisibilité
  // dédié -- restait sur sa couleur par défaut (gris foncé), quasi
  // illisible sur un fond sombre de la même famille. Ajouté ICI (avant
  // même la logique 'texteColore' existante, jamais fusionné avec elle --
  // 2 déclencheurs différents, même sortie) : dès qu'une colonne porte son
  // PROPRE fond plein, son contenu prend automatiquement
  // couleurLisibleFondColonnes, quel que soit l'état de "Texte coloré".
  function couleurContenuPourColonne(colonne) {
    var coteLateralePropre = inverserColonnes ? 'droite' : 'gauche';
    var cotePrincipalePropre = inverserColonnes ? 'gauche' : 'droite';
    var fondPropreActif = effetFondColonnes === 'fondSeul' && (
      (colonne === 'laterale' && ((coteLateralePropre === 'gauche' && FOND_GAUCHE) || (coteLateralePropre === 'droite' && FOND_DROITE))) ||
      (colonne === 'principale' && ((cotePrincipalePropre === 'gauche' && FOND_GAUCHE) || (cotePrincipalePropre === 'droite' && FOND_DROITE)))
    );
    if (fondPropreActif) { return couleurLisibleFondColonnes; }
    if (theme.coloration !== 'texteColore') { return null; }
    if (composition.colonnes === 1) { return PRIMAIRE; }
    var portee = theme.texteColorePortee || 'lesDeux';
    if (portee === 'lesDeux') { return PRIMAIRE; }
    // TACHE (permuter colonnes) : "gauche"/"droite" ici est un choix
    // PHYSIQUE de la personne (portée de "Texte coloré") -- suit donc le
    // côté réel de laterale/principale, inchangé si inverserColonnes est
    // faux (A5 compris, toujours faux pour ce format, voir plus haut).
    var coteLaterale = inverserColonnes ? 'droite' : 'gauche';
    var cotePrincipale = inverserColonnes ? 'gauche' : 'droite';
    if (portee === coteLaterale && colonne === 'laterale') { return PRIMAIRE; }
    if (portee === cotePrincipale && colonne === 'principale') { return PRIMAIRE; }
    return null;
  }

  // Couleur du TITRE de bloc pour une colonne donnée, selon l'effet
  // 'titres' : prend la couleur de l'accent -- sauf collision (le titre
  // repose sur le fond de SA PROPRE colonne, de cette même couleur),
  // auquel cas bascule blanc/noir choisi.
  // TACHE (retour utilisateur : titres de section invisibles dans le
  // .docx réel -- bug confirmé en inspectant le XML d'un export réel :
  // le texte du titre et le fond de sa cellule avaient EXACTEMENT la même
  // couleur BBDDD2) : la garde ci-dessus ne couvrait que l'effet "Fond des
  // colonnes -- titres". Mais en effet "fondSeul", la colonne entière est
  // DEJA remplie de PRIMAIRE (FOND_LATERALE/FOND_PRINCIPALE plus haut) --
  // si le titre prend lui aussi PRIMAIRE (ce qui arrive dès que
  // "Coloration" vaut autre chose que 'aucune'/'texteColore', typiquement
  // "Lecture guidée", ou dès que couleurPrimaireForcee est actif -- voir
  // couleurTitre plus bas, seuls cas où il vaudrait PRIMAIRE), le texte se
  // fond exactement dans son propre fond. Reprend alors la même couleur
  // lisible que le cas "titres" ci-dessus, pour la même raison.
  function couleurTitrePourColonne(colonne) {
    var fondPropre = (colonne === 'laterale') ? FOND_LATERALE : FOND_PRINCIPALE;
    if (effetFondColonnes === 'titres') {
      return fondPropre ? couleurLisibleFondColonnes : PRIMAIRE;
    }
    var titreSeraitPrimaire = (theme.coloration !== 'aucune' && theme.coloration !== 'texteColore') || theme.couleurPrimaireForcee;
    // TACHE (retour utilisateur : titres "souligné" invisibles en 1
    // colonne + "Fond des colonnes") : fondPropre (FOND_LATERALE/
    // FOND_PRINCIPALE) ne couvre que le mécanisme à 2 colonnes -- en 1
    // colonne, c'est corpsColore1Colonne (plus haut) qui enveloppe TOUT
    // le corps dans une cellule PRIMAIRE, sans jamais passer par
    // fondPropre. Même garde que juste en dessous, appliquée en plus.
    if (corpsColore1Colonne && titreSeraitPrimaire) { return couleurLisibleFondColonnes; }
    if (fondPropre && titreSeraitPrimaire) { return couleurLisibleFondColonnes; }
    return null;
  }

  // TACHE (composeur-theme-engine-conception.md, étape A) : câblage réel
  // des propriétés de thème déclarées depuis le début (composeurTheme.js)
  // mais jamais lues jusqu'ici -- styleBordures et separateurs n'avaient
  // aucun effet, icones non plus. Avec le thème par défaut actuel
  // (styleTitres:'souligne', styleBordures:'fine', separateurs:'ligne'),
  // le résultat produit est strictement identique à avant ce câblage --
  // vérifié par construction : 'fine'->8, 'ligne'->BorderStyle.SINGLE,
  // exactement les valeurs qui étaient codées en dur auparavant.
  var STYLE_BORDURE_TAILLE = { fine: 8, epaisse: 20, aucune: 0 };
  var STYLE_SEPARATEUR_DOCX = { ligne: BorderStyle.SINGLE, pointille: BorderStyle.DOTTED };
  // TACHE (retour utilisateur explicite : "icônes rubriques... plus
  // moderne, en lien avec la thématique -- étoile, ça ne parle pas") :
  // meme correction que cote PDF (_PDF_ICONES_SVG, cvPdfTemplateA4.js) --
  // 3 usages de l'etoile generique corriges (professionnelles/clés/A5
  // "Compétences" se confondaient toutes les 3 sous le meme symbole,
  // aucune ne se distinguait des autres) + 🎯 (visait "objectif", pas
  // "loisir") + 🌱 (trop vague pour "competences personnelles"). Word ne
  // peut pas embarquer les memes pictogrammes SVG "trait fin" que le PDF
  // (TextRun docx = texte brut, aucune image vectorielle inline) -- ce
  // sont donc des symboles Unicode, mais choisis pour rester coherents
  // SEMANTIQUEMENT avec le meme jeu d'icones PDF (cle pour "clés", outils
  // pour le savoir-faire technique, bulle pour le savoir-etre).
  var ICONES_PAR_TITRE = {
    'Profil': '👤 ', 'Expérience professionnelle': '💼 ', 'Formation': '🎓 ',
    'Compétences professionnelles': '🛠️ ', 'Compétences clés': '🔑 ', 'Compétences personnelles': '💬 ', 'Langues': '🗣️ ',
    'Centres d’intérêt': '🎨 ', 'Engagements': '🤝 ',
    // TACHE (retour utilisateur : bug de contenu manquant, corrigé) :
    // n'a d'effet que pour Sobre/Institutionnel/Moderne (icones===true) --
    // rubrique 'certifications' séparée, jamais utilisée par Projet XXL
    // (intégrée à "Formation" pour ce thème, jamais son propre titre).
    'Certifications': '📜 ',
    // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
    // symbole Unicode distinct (comme les autres rubriques), jamais un
    // pictogramme dessiné à la main -- n'a d'effet que si theme.iconesRubriques.
    'Logiciels et outils': '💻 ',
    // TACHE (format Mini CV A5) : titres propres à ce format, jamais
    // utilisés par les autres formats -- ajout additif, aucune clé
    // existante modifiée.
    'Formations et diplômes': '🎓 ', 'Compétences': '🛠️ '
  };

  function titreSection(texteTitre, colonne) {
    // TACHE (retour utilisateur : "je ne peux pas ne pas avoir des icônes
    // sur A4 mais me retrouver avec des icônes sur A5 -- le mode aléatoire
    // doit être partagé entre tous les formats") : l'arbitrage Projet XXL
    // resté sans réponse ("jamais tranché si Projet XXL garde les icônes
    // de titre ou non") est tranché ici -- theme.iconesRubriques seul décide,
    // comme pour titreA5() plus bas (déjà demandé explicitement par
    // l'utilisateur pour l'A5) et comme pour Sobre/Institutionnel/Moderne.
    // Unifie enfin le comportement entre A4 et A5 pour un même réglage.
    var afficherIconeTitre = theme.iconesRubriques;
    var texteAffiche = (afficherIconeTitre && ICONES_PAR_TITRE[texteTitre] ? ICONES_PAR_TITRE[texteTitre] : '') + texteTitre.toUpperCase();
    // TACHE (chantier "2 nouveaux modeles Créatif", modele "Pastille") :
    // verifie AVANT le style "bandeau" ci-dessous -- theme.titresPastille
    // est un decorateur INDEPENDANT de theme.styleTitres (garde-fou
    // coloration/lectureGuideeVariante -> styleTitres, "jamais
    // contournable", volontairement jamais touche, voir composeurTheme.js)
    // qui gagne toujours quand actif, quel que soit le styleTitres resolu
    // par ailleurs. Port du principe PDF (icone dans un rond colore,
    // cvPdfTemplateA4.js) -- docx.js n'a aucune forme circulaire (TextRun
    // = texte brut, jamais de vecteur), mais `shading` sur un TextRun
    // donne exactement le meme resultat que les pastilles de competences
    // deja existantes (badgesDisponibilite plus bas dans ce fichier --
    // meme technique, jamais reinventee) : un petit bloc de texte fond
    // plein + texte blanc, suivi du titre en texte normal separe -- 2
    // TextRun distincts dans le MEME paragraphe, jamais fusionnes en une
    // seule chaine (contrairement a texteAffiche plus haut) pour que seul
    // le badge porte la couleur de fond.
    if (theme.titresPastille) {
      var iconeBadge = afficherIconeTitre ? ICONES_PAR_TITRE[texteTitre] : null;
      var enfantsTitrePastille = iconeBadge
        ? [
          new TextRun({
            text: ' ' + iconeBadge.trim() + ' ', bold: true, color: 'FFFFFF', size: 20, font: theme.police.titres,
            shading: { type: docx.ShadingType ? docx.ShadingType.CLEAR : undefined, fill: PRIMAIRE, color: 'auto' }
          }),
          new TextRun({ text: '  ' + texteTitre.toUpperCase(), bold: true, color: TEXTE, size: 20, font: theme.police.titres })
        ]
        : [ new TextRun({ text: texteTitre.toUpperCase(), bold: true, color: TEXTE, size: 20, font: theme.police.titres }) ];
      return new Paragraph({
        spacing: { before: Math.round(180 * espacementExtra), after: Math.round(80 * espacementExtra) },
        keepNext: !!composition.controleVeuvesOrphelines,
        children: enfantsTitrePastille
      });
    }
    if (theme.styleTitres === 'bandeau') {
      // TACHE (retour utilisateur : "en fond coloré, choix blanc/noir pour
      // le texte") : auparavant toujours FOND (blanc, en dur) -- theme.
      // texteBandeau n'existe QUE sur Projet XXL (undefined ailleurs,
      // Object.keys(themeBase) ne le copie donc jamais pour Sobre/
      // Institutionnel/Moderne) -- repli sur FOND si absent, comportement
      // 100% inchange pour les 3 autres themes (seul cas ou 'bandeau'
      // s'applique par defaut est Moderne, qui n'a jamais ce champ).
      var couleurTexteBandeau = FOND;
      if (theme.texteBandeau === 'noir') { couleurTexteBandeau = '000000'; }
      else if (theme.texteBandeau === 'blanc') { couleurTexteBandeau = 'FFFFFF'; }
      // TACHE : mode "bandeau" -- fond coloré pleine largeur derrière le
      // titre, jamais de bordure inférieure (les deux styles ne se
      // combinent pas). styleBordures/separateurs n'ont pas de sens ici,
      // ignorés volontairement pour ce mode.
      return new Paragraph({
        spacing: { before: Math.round(180 * espacementExtra), after: Math.round(80 * espacementExtra) },
        // TACHE (retour utilisateur : "impossible d'imprimer le thème
        // Moderne") : bug réel trouvé -- ShadingType.SOLID n'existe pas
        // dans docx.js (seul CLEAR, DIAGONAL_CROSS, etc. existent),
        // c'est d'ailleurs un piège explicitement documenté dans le
        // guide de la librairie ("use ShadingType.CLEAR, never SOLID").
        // docx.ShadingType.SOLID valait donc undefined, produisant un
        // document invalide qui faisait échouer toute la génération
        // native -- avec repli silencieux vers un ancien chemin HTML
        // inexistant pour le Composeur, d'où le message trompeur
        // "aperçu encore en cours de chargement".
        shading: { type: docx.ShadingType ? docx.ShadingType.CLEAR : undefined, fill: PRIMAIRE },
        keepNext: !!composition.controleVeuvesOrphelines,
        children: [ new TextRun({ text: texteAffiche, bold: true, color: couleurTexteBandeau, size: 20, font: theme.police.titres }) ]
      });
    }
    var epaisseurBordure = STYLE_BORDURE_TAILLE[theme.styleBordures];
    if (epaisseurBordure === undefined) { epaisseurBordure = 8; }
    var styleBordureDocx = STYLE_SEPARATEUR_DOCX[theme.separateurs] || BorderStyle.SINGLE;
    // TACHE (Projet XXL) : 'simple' est le nom public du même style que
    // 'souligne' (fusion Institutionnel+Moderne, doc de conception) --
    // ajout STRICTEMENT additif : aucun thème existant ne vaut jamais
    // 'simple', ce qui garantit un comportement inchangé pour
    // Sobre/Institutionnel/Moderne.
    var estStyleSouligne = (theme.styleTitres === 'souligne' || theme.styleTitres === 'simple');
    var afficherBordure = estStyleSouligne && theme.styleBordures !== 'aucune' && theme.separateurs !== 'espace';
    // TACHE (Projet XXL, mode de coloration "aucune") : titres neutres
    // (couleur de texte standard), jamais l'accent -- theme.coloration
    // n'existe sur AUCUN des 3 autres thèmes (toujours "undefined"),
    // cette condition est donc structurellement sans effet pour eux :
    // couleurTitre vaut alors toujours PRIMAIRE, comportement identique
    // à avant ce changement.
    // TACHE (retour utilisateur : "texte coloré, nouvelle fonction --
    // colore tout le contenu, plus les titres") : "texteColore" ne
    // colore plus les titres du tout (comme "aucune") -- seule "Lecture
    // guidée -- par titre" colore encore les titres (reprend l'ancien
    // rôle de "texte coloré"). "Lecture guidée -- par rectangle" ne
    // passe jamais par cette branche (styleTitres vaut alors 'bandeau',
    // voir plus bas).
    // TACHE (retour utilisateur : "Fond des colonnes", effet "titres") :
    // prioritaire sur la logique "coloration" ci-dessus quand actif --
    // mutuellement exclusifs par construction (composeurTheme.js), jamais
    // les deux en même temps. couleurTitrePourColonne() gère elle-même la
    // collision (titre posé sur le fond de sa propre couleur -> blanc/noir).
    var couleurTitreFondColonnes = couleurTitrePourColonne(colonne);
    // TACHE (retour utilisateur : "couleur entreprise activée mais CV
    // tout blanc" -- meme bug/correctif que couleurAccentEnTete plus
    // haut) : theme.couleurPrimaireForcee leve cette suppression
    // uniquement pour une couleur EXPLICITEMENT choisie -- une couleur de
    // palette par defaut reste soumise a "Coloration" sans changement.
    var estColorationSansTitre = (theme.coloration === 'aucune' || theme.coloration === 'texteColore') && !theme.couleurPrimaireForcee;
    var couleurTitre = couleurTitreFondColonnes || (estColorationSansTitre ? TEXTE : PRIMAIRE);
    // TACHE (retour utilisateur, bug réel confirmé sur un export réel :
    // "EXPÉRIENCE PERSONNELLE" en E2C6CC, rose quasi invisible sur fond
    // blanc) : contrairement au cas "titre posé sur SA PROPRE cellule
    // colorée" (déjà protégé -- couleurTitreFondColonnes renvoie alors
    // couleurLisibleFondColonnes, jamais PRIMAIRE), ce filet couvre TOUTE
    // situation où couleurTitre finit par valoir PRIMAIRE tel quel --
    // que ce soit via le repli ci-dessus (couleurPrimaireForcee) OU via le
    // repli interne de couleurTitrePourColonne() (effet "titres" quand la
    // colonne n'a PAS de fond propre -- "Fond des colonnes" ne couvre pas
    // forcément les 2 colonnes). Dans TOUS ces cas, PRIMAIRE atterrit
    // directement sur la page BLANCHE, sans aucune cellule de fond pour
    // protéger sa lisibilité -- jamais besoin de re-vérifier LEQUEL de ces
    // chemins a été pris, seul le résultat final compte. Même garde-fou
    // WCAG que le style "bandeau" (contrasteWCAG(), composeurTheme.js) --
    // seuil 4,5:1 (texte normal, 20 demi-points/10pt ne qualifie pas comme
    // "grand texte" au sens WCAG, seuil plus strict que le 3:1 du bandeau)
    // -- ne change RIEN si déjà lisible (couleur de palette par défaut,
    // contraste suffisant).
    if (couleurTitre === PRIMAIRE && typeof contrasteWCAG === 'function') {
      var _contrasteTitreDefaut = contrasteWCAG(couleurTitre, 'FFFFFF');
      if (_contrasteTitreDefaut !== null && _contrasteTitreDefaut < 4.5) { couleurTitre = TEXTE; }
    }
    // TACHE (retour utilisateur : "modèle Ruban -- souligner chaque bloc
    // de la même couleur [que le séparateur], sans toucher au texte") :
    // DÉCOUPLÉ de couleurTitre (qui reste exclusivement la couleur du
    // TEXTE) -- le soulignement prend PRIMAIRE quand le séparateur est
    // actif, jamais lié à "Coloration"/"Fond des colonnes" (qui restent
    // seuls maîtres de couleurTitre). Repli sur couleurTitre si le
    // séparateur n'est pas actif -- comportement 100% inchangé dans ce
    // cas (y compris pour Sobre/Institutionnel/Moderne, où
    // theme.separateurColonnes vaut toujours undefined/false).
    var couleurSoulignage = theme.separateurColonnes ? (theme.separateurCouleurHex || PRIMAIRE) : couleurTitre;
    return new Paragraph({
      spacing: { before: Math.round(180 * espacementExtra), after: Math.round(80 * espacementExtra) },
      keepNext: !!composition.controleVeuvesOrphelines,
      border: afficherBordure
        ? { bottom: { color: couleurSoulignage, space: 4, style: styleBordureDocx, size: epaisseurBordure } }
        : undefined,
      children: [ new TextRun({ text: texteAffiche, bold: true, color: couleurTitre, size: 20, font: theme.police.titres }) ]
    });
  }
  // TACHE (retour utilisateur : "si peu de contenu, mieux exploiter
  // l'espace de la page") : multiplicateur calculé par composeurComposition.js
  // (Projet XXL, A4 Détaillé, densité "faible" uniquement -- vaut 1
  // partout ailleurs, donc sans le moindre effet sur les 3 autres thèmes
  // ni les autres formats). Appliqué aux espacements de texteSimple/puce
  // ET de titreSection (déjà modifiée plus haut) -- var hoisted par JS,
  // disponible dans titreSection via fermeture malgré sa position
  // textuelle avant cette déclaration (les fonctions ne s'exécutent
  // qu'au moment de l'appel, jamais à la définition).
  var espacementExtra = composition.espacementExtra || 1;
  // TACHE (lot moteur "La mise en page", sous-lot 3) : alignement du corps.
  // 'justifie' -> AlignmentType.JUSTIFIED sur les paragraphes de texte
  // (missions, accroche, profil). Sans effet sur une ligne courte (le
  // justifie n'agit que multi-lignes). undefined = alignement Word par
  // defaut (gauche).
  var _alignCorps = (composition.alignementCorps === 'justifie') ? AlignmentType.JUSTIFIED : undefined;
  // TACHE (lot moteur "La mise en page", sous-lot 2 -- Interligne) : ratio
  // applique a l'interligne des paragraphes de CORPS uniquement (jamais les
  // titres ni l'en-tete). 1 = neutre -> on ne pose aucune propriete `line`,
  // Word garde son interligne simple par defaut. Sinon `line` en 240emes
  // (240 = simple) avec lineRule "auto".
  var _interligneRatio = (composition.interligneCorps && composition.interligneCorps !== 1)
    ? composition.interligneCorps : 0;
  function _spCorps(apres) {
    var s = { after: apres };
    if (_interligneRatio) { s.line = Math.round(240 * _interligneRatio); s.lineRule = 'auto'; }
    return s;
  }
  function texteSimple(t, o) {
    o = o || {};
    var apresBase = o.after !== undefined ? o.after : 70;
    return new Paragraph({
      alignment: _alignCorps,
      spacing: _spCorps(Math.round(apresBase * espacementExtra)),
      keepLines: !!composition.controleVeuvesOrphelines, // R001 (categorie "Word") : requete, jamais garantie -- voir architecture §4.3
      children: [ new TextRun({ text: t, bold: !!o.bold, italics: !!o.italics, size: o.size || taillePolice, color: o.color || TEXTE, font: theme.police.corps }) ]
    });
  }
  function puce(t, o) {
    o = o || {};
    return new Paragraph({
      alignment: _alignCorps,
      numbering: { reference: refPuces, level: 0 },
      spacing: _spCorps(Math.round(50 * espacementExtra)),
      keepLines: !!composition.controleVeuvesOrphelines,
      children: [ new TextRun({ text: t, size: taillePolice, color: o.color || TEXTE, font: theme.police.corps }) ]
    });
  }
  // TACHE (retour utilisateur : "souligner le poste, les dates,
  // l'entreprise... et pareil pour l'italique", port du Word depuis le
  // PDF) : memes 3 reglages GLOBAUX par TYPE que cvPdfTemplateA4.js/
  // _pdfSpanStylePartie (jamais par item individuel) -- retourne les
  // proprietes a fusionner dans un TextRun existant, jamais un nouveau
  // mecanisme de mise en forme parallele.
  function stylePartie(souligne, italique) {
    var props = {};
    if (souligne) { props.underline = { type: docx.UnderlineType.SINGLE }; }
    if (italique) { props.italics = true; }
    return props;
  }
  // TACHE (port du PDF, mode compact/formations) : variantes de
  // texteSimple()/puce() ci-dessus acceptant une LISTE de segments
  // { text, style } au lieu d'une chaine unique -- necessaire des qu'une
  // ligne fusionne plusieurs parties (poste/entreprise/dates) qui doivent
  // chacune garder leur propre style souligne/italique, jamais une seule
  // chaine echappee comme avant (meme couleur/taille/police que
  // texteSimple()/puce() pour un rendu identique en dehors du style).
  function texteSimpleRuns(segments, o) {
    o = o || {};
    var apresBase = o.after !== undefined ? o.after : 70;
    var couleur = o.color || TEXTE;
    return new Paragraph({
      alignment: _alignCorps,
      spacing: _spCorps(Math.round(apresBase * espacementExtra)),
      keepLines: !!composition.controleVeuvesOrphelines,
      children: segments.map(function (seg) {
        return new TextRun(Object.assign({ text: seg.text, bold: !!o.bold, size: o.size || taillePolice, color: couleur, font: theme.police.corps }, seg.style || {}));
      })
    });
  }
  function puceRuns(segments, o) {
    o = o || {};
    var couleur = o.color || TEXTE;
    return new Paragraph({
      alignment: _alignCorps,
      numbering: { reference: refPuces, level: 0 },
      spacing: _spCorps(Math.round(50 * espacementExtra)),
      keepLines: !!composition.controleVeuvesOrphelines,
      children: segments.map(function (seg) {
        return new TextRun(Object.assign({ text: seg.text, size: taillePolice, color: couleur, font: theme.police.corps }, seg.style || {}));
      })
    });
  }

  var identite = objetCV.identite || {};

  // TACHE (retour utilisateur : "format Mini CV A5 -- portrait, 2
  // colonnes fixes") : mise en page ENTIÈREMENT séparée de la logique
  // 1/2 colonnes habituelle (jamais traversée par A4 Détaillé/Essentiel/
  // Intégral) -- construite ici, avec ses propres tailles de police
  // (plus petites, format compact) et sa propre structure fixe, jamais
  // dérivée de la logique de rubriques/stratégie du reste du fichier.
  if (composition.formatPage === 'A5-portrait' || composition.formatPage === 'A5-paysage') {
    // TACHE (retour utilisateur : "débordement -- les 2 options doivent
    // s'appliquer normalement à l'A5") : option A -- réduction uniforme
    // de la police, même principe que pour A4 (composeurComposition.js,
    // echelle * 0.83) -- appliquée ici puisque les tailles de police A5
    // sont spécifiques à ce format, jamais dérivées de composition.taillePoliceCorps.
    var echelleDebordementA5 = (theme.optionDebordement === 'A' || theme.optionDebordement === 'AB') ? 0.85 : 1;
    // TACHE (retour utilisateur : "le bouton Mise en page doit aussi
    // fonctionner pour le Mini CV A5") : theme.tailleBonus (le levier de
    // CROISSANCE du bouton "Mise en page", deja applique a l'A4 -- voir
    // composeurComposition.js, echelle * 1.08) n'etait jusqu'ici jamais lu
    // ici -- le bouton tentait bien ce levier pour l'A5 aussi (activerMiseEnFormeUltimeXXL,
    // js/app.js, jamais garde par format), mais sans le moindre effet visuel,
    // seul le SENS INVERSE (echelleDebordementA5, reduction) etait cable.
    // Meme ratio EXACT que l'A4 (1.08), jamais un 2e chiffre invente.
    var echelleBonusA5 = theme.tailleBonus ? 1.08 : 1;
    var TAILLE_NOM_A5 = Math.round(26 * echelleDebordementA5 * echelleBonusA5), TAILLE_TITRE_A5 = Math.round(19 * echelleDebordementA5 * echelleBonusA5), TAILLE_CORPS_A5 = Math.round(17 * echelleDebordementA5 * echelleBonusA5);
    // TACHE (retour utilisateur : "les réglages existants doivent
    // s'appliquer normalement à l'A5") : réutilise TELS QUELS les
    // mécanismes déjà construits pour A4 (couleurContenuPourColonne,
    // couleurTitrePourColonne, ICONES_PAR_TITRE, FOND_GAUCHE/FOND_DROITE,
    // effetFondColonnes) -- jamais une seconde logique de coloration/
    // fond dupliquée pour ce format.
    function texteA5(t, o, colonne) {
      o = o || {};
      var couleurContenu = colonne ? couleurContenuPourColonne(colonne) : null;
      return new Paragraph({ spacing: { after: o.after != null ? o.after : 40 },
        children: [ new TextRun({ text: t, size: TAILLE_CORPS_A5, bold: !!o.bold, italics: !!o.italics, color: o.color || couleurContenu || TEXTE, font: theme.police.corps }) ] });
    }
    // TACHE (port du PDF, styleParties -- meme convention que
    // texteSimpleRuns()/puceRuns() plus haut) : variante de texteA5()
    // acceptant une liste de segments { text, style } au lieu d'une
    // chaine unique, pour styler indépendamment poste/dates/entreprise
    // dans une même ligne A5.
    function texteA5Runs(segments, o, colonne) {
      o = o || {};
      var couleurContenu = colonne ? couleurContenuPourColonne(colonne) : null;
      var couleur = o.color || couleurContenu || TEXTE;
      return new Paragraph({ spacing: { after: o.after != null ? o.after : 40 },
        children: segments.map(function (seg) {
          return new TextRun(Object.assign({ text: seg.text, size: TAILLE_CORPS_A5, bold: !!o.bold, color: couleur, font: theme.police.corps }, seg.style || {}));
        }) });
    }
    function titreA5(t, colonne) {
      var couleurTitre = couleurTitrePourColonne(colonne) || PRIMAIRE;
      // TACHE (retour utilisateur : "icônes -- doit s'appliquer
      // normalement") : même table ICONES_PAR_TITRE que le reste du
      // Composeur -- theme.iconesRubriques seul décide, jamais lié à
      // estProjetXXL ici (à la différence de titreSection() plus haut,
      // dont l'arbitrage icônes/Projet XXL reste délibérément non
      // tranché pour les AUTRES formats -- l'utilisateur a explicitement
      // demandé les icônes pour l'A5 spécifiquement).
      // TACHE (retour utilisateur : "pourquoi l'A5 n'a pas le style
      // pastille ?") : meme decorateur INDEPENDANT que titreSection() plus
      // haut (theme.titresPastille, jamais fusionne au styleTitres
      // verrouille de Projet XXL -- voir composeurTheme.js), gagne
      // toujours quand actif, avant meme le calcul texteAvecIcone/bordure
      // habituels.
      if (theme.titresPastille) {
        var iconeBadgeA5 = theme.iconesRubriques ? ICONES_PAR_TITRE[t] : null;
        var enfantsTitreA5Pastille = iconeBadgeA5
          ? [
            new TextRun({
              text: ' ' + iconeBadgeA5.trim() + ' ', bold: true, color: 'FFFFFF', size: TAILLE_TITRE_A5, font: theme.police.titres,
              shading: { type: docx.ShadingType ? docx.ShadingType.CLEAR : undefined, fill: couleurTitre, color: 'auto' }
            }),
            new TextRun({ text: '  ' + t, bold: true, color: TEXTE, size: TAILLE_TITRE_A5, font: theme.police.titres })
          ]
          : [ new TextRun({ text: t, bold: true, color: TEXTE, size: TAILLE_TITRE_A5, font: theme.police.titres }) ];
        return new Paragraph({ spacing: { before: 120, after: 60 }, children: enfantsTitreA5Pastille });
      }
      var texteAvecIcone = (theme.iconesRubriques && ICONES_PAR_TITRE[t]) ? ICONES_PAR_TITRE[t] + t : t;
      return new Paragraph({ spacing: { before: 120, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: (theme.separateurCouleurHex || PRIMAIRE), space: 2 } },
        children: [ new TextRun({ text: texteAvecIcone, bold: true, size: TAILLE_TITRE_A5, color: couleurTitre, font: theme.police.titres }) ] });
    }
    function puceA5(t, colonne) {
      var couleurContenu = colonne ? couleurContenuPourColonne(colonne) : null;
      return new Paragraph({ spacing: { after: 40 }, numbering: { reference: refPuces, level: 0 },
        children: [ new TextRun({ text: t, size: TAILLE_CORPS_A5, color: couleurContenu || TEXTE, font: theme.police.corps }) ] });
    }

    // ---- Bloc identite partage Portrait/Paysage (chantier Mini CV A5) :
    // meme contenu et meme ordre impose par l'utilisateur dans les 2 mises
    // en page -- Metier vise (en grand, avant le nom) -> Nom/Prenom ->
    // Coordonnees -> Permis/vehicule. Seul l'EMPLACEMENT differe cote
    // rendu (bandeau pleine largeur en Portrait, colonne centrale centree
    // verticalement en Paysage) -- jamais une 2e logique de construction
    // du bloc identite dupliquee entre les 2 formats.
    function construireBlocIdentiteA5() {
      var bloc = [];
      var permisA5 = objetCV.permis || {};
      var villeCPA5 = [_formaterVille(identite.ville), identite.codePostal ? '(' + identite.codePostal + ')' : ''].filter(Boolean).join(' ');
      // TACHE (retour utilisateur : "possibilité de mettre une photo") :
      // meme mecanisme deja partage par le Composeur (_projetxxlConstruireEnTete
      // ci-dessus) et les 16 modeles classiques (_dnDataUrlVersOctets/
      // _dnTypeImagePhoto, miniCvA5.js) -- jamais une 2e logique de photo.
      var octetsPhotoA5 = (typeof _dnDataUrlVersOctets === 'function') ? _dnDataUrlVersOctets(objetCV.photo && objetCV.photo.url) : null;
      if (octetsPhotoA5) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [ new docx.ImageRun({ data: octetsPhotoA5, transformation: { width: 60, height: 60 }, type: _dnTypeImagePhoto(objetCV.photo.url) }) ] }));
      }
      if (objetCV.objectifProfessionnel) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
          border: theme.separateurColonnes ? { bottom: { style: BorderStyle.SINGLE, size: 8, color: (theme.separateurCouleurHex || PRIMAIRE), space: 6 } } : undefined,
          children: [ new TextRun({ text: objetCV.objectifProfessionnel.toUpperCase(), bold: true, size: TAILLE_NOM_A5, color: PRIMAIRE, font: theme.police.titres, characterSpacing: 10 }) ] }));
      }
      var nomCompletA5 = ((identite.prenom || '') + ' ' + (identite.nom || '')).trim();
      if (nomCompletA5) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [ new TextRun({ text: nomCompletA5, bold: true, size: TAILLE_NOM_A5 - 2, color: TEXTE, font: theme.police.titres }) ] }));
      }
      [identite.email, identite.telephone, villeCPA5].filter(Boolean).forEach(function (ligne) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [ new TextRun({ text: ligne, size: TAILLE_CORPS_A5, color: SECONDAIRE, font: theme.police.corps }) ] }));
      });
      if (permisA5.possede && !theme.permisMasque) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [ new TextRun({ text: 'Permis ' + (permisA5.categories || []).join('/') + (permisA5.vehicule ? ' + véhicule' : ''), size: TAILLE_CORPS_A5, color: SECONDAIRE, font: theme.police.corps }) ] }));
      }
      if (!bloc.length) { bloc.push(new Paragraph({ children: [] })); }
      return bloc;
    }

    // ---- Portrait UNIQUEMENT : bandeau a 2 zones cote a cote, migration
    // de l'option A4 "en-tete inversee" (theme.enteteInversee, voir
    // _projetxxlConstruireEnTete ci-dessus) -- zone identite (photo+nom+
    // coordonnees+permis, TOUJOURS groupee, jamais la photo seule) et zone
    // objectif (metier vise), permutables gauche/droite. JAMAIS utilise
    // par Paysage : sa colonne centrale (construireBlocIdentiteA5 ci-dessus)
    // reste toujours empilee au meme endroit, sans permutation possible.
    function construireZoneIdentiteA5Portrait() {
      var bloc = [];
      var permisA5 = objetCV.permis || {};
      var villeCPA5 = [_formaterVille(identite.ville), identite.codePostal ? '(' + identite.codePostal + ')' : ''].filter(Boolean).join(' ');
      var octetsPhotoA5 = (typeof _dnDataUrlVersOctets === 'function') ? _dnDataUrlVersOctets(objetCV.photo && objetCV.photo.url) : null;
      if (octetsPhotoA5) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [ new docx.ImageRun({ data: octetsPhotoA5, transformation: { width: 60, height: 60 }, type: _dnTypeImagePhoto(objetCV.photo.url) }) ] }));
      }
      var nomCompletA5 = ((identite.prenom || '') + ' ' + (identite.nom || '')).trim();
      if (nomCompletA5) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [ new TextRun({ text: nomCompletA5, bold: true, size: TAILLE_NOM_A5 - 2, color: TEXTE, font: theme.police.titres }) ] }));
      }
      [identite.email, identite.telephone, villeCPA5].filter(Boolean).forEach(function (ligne) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [ new TextRun({ text: ligne, size: TAILLE_CORPS_A5, color: SECONDAIRE, font: theme.police.corps }) ] }));
      });
      if (permisA5.possede && !theme.permisMasque) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
          children: [ new TextRun({ text: 'Permis ' + (permisA5.categories || []).join('/') + (permisA5.vehicule ? ' + véhicule' : ''), size: TAILLE_CORPS_A5, color: SECONDAIRE, font: theme.police.corps }) ] }));
      }
      if (!bloc.length) { bloc.push(new Paragraph({ children: [] })); }
      return bloc;
    }
    function construireZoneObjectifA5Portrait() {
      var bloc = [];
      if (objetCV.objectifProfessionnel) {
        bloc.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
          children: [ new TextRun({ text: objetCV.objectifProfessionnel.toUpperCase(), bold: true, size: TAILLE_NOM_A5, color: PRIMAIRE, font: theme.police.titres, characterSpacing: 10 }) ] }));
      }
      if (!bloc.length) { bloc.push(new Paragraph({ children: [] })); }
      return bloc;
    }

    // ---- Corps colonnes MOBILES (Portrait : 2 colonnes ; Paysage :
    // gauche/droite autour de la colonne centrale identite) -- partage par
    // les 2 mises en page : composition.colonneGauche/colonneDroite
    // (composeurComposition.js) decident deja QUELLE rubrique va a gauche
    // ou a droite (repartition par hauteur estimee, jamais un emplacement
    // fixe impose par rubrique) -- ce rendu se contente de dessiner, dans
    // l'ordre donne, quelle que soit la colonne.
    var TITRES_RUBRIQUES_A5 = {
      experiences: 'Expérience professionnelle', competences: 'Compétences', formations: 'Formations et diplômes',
      loisirs: 'Centres d’intérêt', langues: 'Langues', engagements: 'Engagements',
      certifications: 'Certifications', competencesPersonnelles: 'Compétences personnelles',
      // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28).
      logiciels: 'Logiciels et outils'
    };
    function texteEngagementA5(item) { return (typeof item === 'string') ? item : ((item && item.texte) || ''); }
    function texteCompetencePersoA5(item) { return (typeof item === 'string') ? item : ((item && item.competence) || ''); }
    function construireRubriqueA5(cle, colonneNom) {
      var enfants = [ titreA5(TITRES_RUBRIQUES_A5[cle], colonneNom) ];
      if (cle === 'experiences') {
        var couleurContenuExp = couleurContenuPourColonne(colonneNom);
        (composition.experiences || []).forEach(function (e) {
          var dates = _formaterPeriode(e.dateDebut, e.dateFin);
          enfants.push(new Paragraph({ spacing: { after: 20 }, children: [
            new TextRun(Object.assign({ text: e.poste, bold: true, size: TAILLE_CORPS_A5, color: couleurContenuExp || TEXTE, font: theme.police.corps }, stylePartie(theme.soulignerPoste, theme.italiquePoste))),
            new TextRun(Object.assign({ text: e.entreprise ? ' - ' + e.entreprise : '', size: TAILLE_CORPS_A5, color: couleurContenuExp || SECONDAIRE, font: theme.police.corps }, stylePartie(theme.soulignerEntreprise, theme.italiqueEntreprise))),
            new TextRun(Object.assign({ text: dates ? '  (' + dates + ')' : '', size: TAILLE_CORPS_A5 - 2, color: couleurContenuExp || SECONDAIRE, font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates)))
          ] }));
          (e.missions ? String(e.missions).split('\n').filter(Boolean) : []).forEach(function (ligneMission) {
            enfants.push(puceA5(ligneMission, colonneNom));
          });
        });
      } else if (cle === 'competences') {
        (composition.competences || []).forEach(function (c) { enfants.push(puceA5(c, colonneNom)); });
      } else if (cle === 'formations') {
        (composition.formations || []).forEach(function (f) {
          // TACHE (retour utilisateur : "jamais BTS (2015) mais plutot
          // BTS - 2015") : tiret simple au lieu de parentheses.
          // TACHE (port du PDF, styleParties -- meme convention que
          // cvPdfTemplateA5.js:_pdfA5ConstruireRubrique) : diplome =
          // equivalent poste, annee = equivalent dates.
          var diplomeA5 = [f.niveau, f.intitule].filter(Boolean).join(' - ');
          var segmentsFormationA5 = [];
          if (diplomeA5) { segmentsFormationA5.push({ text: diplomeA5, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) }); }
          if (f.annee) { segmentsFormationA5.push({ text: (diplomeA5 ? ' - ' : '') + f.annee, style: stylePartie(theme.soulignerDates, theme.italiqueDates) }); }
          if (segmentsFormationA5.length) { enfants.push(texteA5Runs(segmentsFormationA5, { after: 20 }, colonneNom)); }
          var premiereMission = (f.missions ? String(f.missions).split('\n').filter(Boolean)[0] : null);
          if (premiereMission) { enfants.push(texteA5(premiereMission, { after: 30, italics: true }, colonneNom)); }
        });
      } else if (cle === 'loisirs') {
        (composition.loisirs || []).forEach(function (l) { enfants.push(texteA5(_premiereMajuscule(l), { after: 20 }, colonneNom)); });
      } else if (cle === 'langues') {
        (composition.langues || []).forEach(function (l) { enfants.push(texteA5(l.langue + ' - ' + l.niveau, { after: 20 }, colonneNom)); });
      } else if (cle === 'logiciels') {
        // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
        // une ligne par logiciel, même rendu que 'loisirs'/'langues' sur l'A5.
        (composition.logiciels || []).forEach(function (l) { enfants.push(texteA5(l, { after: 20 }, colonneNom)); });
      } else if (cle === 'engagements') {
        (composition.engagements || []).forEach(function (e) { enfants.push(texteA5(texteEngagementA5(e), { after: 20 }, colonneNom)); });
      } else if (cle === 'certifications') {
        enfants.push(texteA5((composition.certifications || []).join(', '), { after: 20 }, colonneNom));
      } else if (cle === 'competencesPersonnelles') {
        (composition.competencesPersonnelles || []).forEach(function (c) { enfants.push(texteA5(texteCompetencePersoA5(c), { after: 20 }, colonneNom)); });
      }
      return enfants;
    }

    // TACHE (retour utilisateur : "Fond des colonnes... Séparateur avec
    // la couleur supplémentaire -- doivent s'appliquer normalement à
    // l'A5") : réutilise FOND_GAUCHE/FOND_DROITE et
    // theme.separateurColonnes/separateurCouleurHex déjà calculés plus
    // haut dans cette fonction, jamais une seconde logique. Partagé par
    // Portrait (ci-dessous) ET Paysage (legacy, plus bas).
    var shadingGaucheA5 = FOND_GAUCHE ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: FOND_GAUCHE } : undefined;
    var shadingDroiteA5 = FOND_DROITE ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: FOND_DROITE } : undefined;
    var bordureSeparateurA5 = theme.separateurColonnes
      ? { right: { style: BorderStyle.SINGLE, size: 24, color: (theme.separateurCouleurHex || PRIMAIRE) } }
      : undefined;
    var bordureAucune = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };

    if (composition.formatPage === 'A5-paysage') {
      // ---- Paysage, 3 colonnes -- colonne CENTRALE : bloc identite
      // partage (construireBlocIdentiteA5), verticalement centre dans la
      // colonne (VerticalAlign.CENTER), jamais tout en haut comme en
      // Portrait -- colonnes gauche/droite : composition.colonneGauche/
      // colonneDroite (meme repartition mobile que Portrait, voir
      // composeurComposition.js), aucun emplacement fixe impose par
      // rubrique.
      var centraleP = construireBlocIdentiteA5();
      var gaucheP = [];
      (composition.colonneGauche || []).forEach(function (cle) { gaucheP = gaucheP.concat(construireRubriqueA5(cle, 'laterale')); });
      var droiteP = [];
      (composition.colonneDroite || []).forEach(function (cle) { droiteP = droiteP.concat(construireRubriqueA5(cle, 'principale')); });

      // TACHE (retour utilisateur : "fond des colonnes... +1 pour
      // format paysage le bouton milieu") : 5e option, exclusive au
      // paysage -- theme.fondColonnes === 'milieu' colore la colonne
      // CENTRALE (jamais gauche/droite en même temps), sans toucher au
      // mécanisme existant (FOND_GAUCHE/FOND_DROITE inchangés).
      var FOND_MILIEU_A5 = (theme.fondColonnes === 'milieu') ? PRIMAIRE : null;
      var shadingCentraleP = FOND_MILIEU_A5 ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: FOND_MILIEU_A5 } : undefined;
      var bordureGaucheP = theme.separateurColonnes ? { right: { style: BorderStyle.SINGLE, size: 24, color: (theme.separateurCouleurHex || PRIMAIRE) } } : undefined;
      var bordureCentraleP = theme.separateurColonnes ? { right: { style: BorderStyle.SINGLE, size: 24, color: (theme.separateurCouleurHex || PRIMAIRE) } } : undefined;

      var enfantsA5 = [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: bordureAucune,
          rows: [ new TableRow({ children: [
            new TableCell({ width: { size: 3400, type: WidthType.DXA }, shading: shadingGaucheA5, borders: bordureGaucheP, margins: { top: 100, bottom: 100, left: 100, right: 150 }, verticalAlign: VerticalAlign.TOP, children: gaucheP }),
            new TableCell({ width: { size: 3400, type: WidthType.DXA }, shading: shadingCentraleP, borders: bordureCentraleP, margins: { top: 100, bottom: 100, left: 150, right: 150 }, verticalAlign: VerticalAlign.CENTER, children: centraleP }),
            new TableCell({ width: { size: 3400, type: WidthType.DXA }, shading: shadingDroiteA5, margins: { top: 100, bottom: 100, left: 150, right: 100 }, verticalAlign: VerticalAlign.TOP, children: droiteP })
          ] }) ]
        })
      ];

      return new Document({
        numbering: { config: [ { reference: refPuces, levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 200, hanging: 150 } } } }
        ] } ] },
        sections: [ {
          properties: { page: { size: { width: 11906, height: 8391 }, margin: { top: 500, bottom: 500, left: 500, right: 500 } } },
          children: enfantsA5
        } ]
      });
    }

    // ---- Format Portrait (refonte, chantier Mini CV A5) : bandeau FIXE
    // en haut, jamais dans les colonnes -- a 2 zones cote a cote (migration
    // de "en-tete inversee", theme.enteteInversee), permutables gauche/
    // droite. La photo reste TOUJOURS groupee avec nom/coordonnees (zone
    // identite), jamais une position independante.
    var inverserEnteteA5Portrait = !!theme.enteteInversee;
    var zoneIdentiteA5Portrait = construireZoneIdentiteA5Portrait();
    var zoneObjectifA5Portrait = construireZoneObjectifA5Portrait();
    var zoneGaucheEnteteA5Portrait = inverserEnteteA5Portrait ? zoneObjectifA5Portrait : zoneIdentiteA5Portrait;
    var zoneDroiteEnteteA5Portrait = inverserEnteteA5Portrait ? zoneIdentiteA5Portrait : zoneObjectifA5Portrait;

    var contenuColonneGauche = [];
    (composition.colonneGauche || []).forEach(function (cle) { contenuColonneGauche = contenuColonneGauche.concat(construireRubriqueA5(cle, 'laterale')); });
    var contenuColonneDroite = [];
    (composition.colonneDroite || []).forEach(function (cle) { contenuColonneDroite = contenuColonneDroite.concat(construireRubriqueA5(cle, 'principale')); });

    var enfantsA5 = [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: bordureAucune,
        rows: [ new TableRow({ children: [
          new TableCell({ width: { size: 3400, type: WidthType.DXA }, margins: { top: 0, bottom: 100, left: 0, right: 150 }, verticalAlign: VerticalAlign.CENTER, children: zoneGaucheEnteteA5Portrait }),
          new TableCell({ width: { size: 6600, type: WidthType.DXA }, margins: { top: 0, bottom: 100, left: 150, right: 0 }, verticalAlign: VerticalAlign.CENTER, children: zoneDroiteEnteteA5Portrait })
        ] }) ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: bordureAucune,
        rows: [ new TableRow({ children: [
          new TableCell({ width: { size: 5000, type: WidthType.DXA }, shading: shadingGaucheA5, borders: bordureSeparateurA5, margins: { top: 100, bottom: 0, left: 100, right: 150 }, verticalAlign: VerticalAlign.TOP, children: contenuColonneGauche }),
          new TableCell({ width: { size: 5000, type: WidthType.DXA }, shading: shadingDroiteA5, margins: { top: 100, bottom: 0, left: 150, right: 100 }, verticalAlign: VerticalAlign.TOP, children: contenuColonneDroite })
        ] }) ]
      })
    ];

    return new Document({
      numbering: { config: [ { reference: refPuces, levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 200, hanging: 150 } } } }
      ] } ] },
      sections: [ {
        properties: { page: { size: { width: 8391, height: 11906 }, margin: { top: 500, bottom: 500, left: 500, right: 500 } } },
        children: enfantsA5
      } ]
    });
  }

  var enfantsEnTete;

  // TACHE (Projet XXL) : en-tête entièrement différente (2 zones) --
  // branche isolée, AUCUNE modification de l'en-tête "classique"
  // ci-dessous (utilisée par Sobre/Institutionnel/Moderne).
  if (estProjetXXL) {
    enfantsEnTete = _projetxxlConstruireEnTete(docx, objetCV, theme, PRIMAIRE, TEXTE, taillePolice);
  } else {
    enfantsEnTete = [];
    // ---- En-tete (variante "classique", seule disponible en V1) ----
    enfantsEnTete.push(new Paragraph({
      spacing: { after: 40 },
      children: [ new TextRun({ text: ((identite.prenom || '') + ' ' + (identite.nom || '')).trim(), bold: true, size: 40, color: PRIMAIRE, font: theme.police.titres }) ]
    }));
    if (objetCV.objectifProfessionnel) {
      enfantsEnTete.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 100 },
        children: [ new TextRun({ text: objetCV.objectifProfessionnel.toUpperCase(), bold: true, size: 28, color: PRIMAIRE, font: theme.police.titres, characterSpacing: 15 }) ]
      }));
    }
    var ligneContact = [identite.telephone, identite.email, _formaterVille(identite.ville)].filter(Boolean).join(' · ');
    if (ligneContact) { enfantsEnTete.push(texteSimple(ligneContact, { size: 18, color: SECONDAIRE, after: 240 })); }
  }

  // ---- Rubriques : une fonction par rubrique, jamais deux fois la même
  // logique de rendu -- TACHE (étape B2, "2 colonnes") : auparavant une
  // simple boucle qui poussait directement dans "enfants" (V1, colonne
  // latérale toujours vide) ; devient une fonction qui RETOURNE un
  // tableau, appelable indépendamment pour composition.repartitionColonnes
  // .principale ET .laterale -- le contenu de chaque rubrique ne change
  // jamais selon la colonne où elle atterrit, seule sa position change. ----
  function dessinerRubrique(rubrique, colonne) {
    // TACHE (retour utilisateur : "Fond des colonnes", effet
    // "texteContenu") : couleur imposée au CONTENU (missions, dates,
    // puces) de cette colonne si l'effet est actif -- null sinon (garde
    // alors la couleur par défaut du texteSimple/puce appelant, jamais
    // touchée). opt() fusionne cette couleur dans les options passées à
    // texteSimple()/puce() SANS écraser une couleur déjà explicitement
    // demandée par l'appelant (ex. SECONDAIRE pour la ligne meta) --
    // cette dernière reste alors prioritaire (voir cas d'usage plus bas,
    // où le choix explicite existant est conservé volontairement).
    var couleurContenu = couleurContenuPourColonne(colonne);
    function opt(o, forcerCouleur) {
      o = o || {};
      var copie = {};
      Object.keys(o).forEach(function (cle) { copie[cle] = o[cle]; });
      if (couleurContenu && (forcerCouleur || !copie.color)) { copie.color = couleurContenu; }
      return copie;
    }
    var enfants = [];
    if (rubrique === 'profil') {
      var texteProfil = (objetCV.profil && (objetCV.profil.profilIA || objetCV.profil.profilUtilisateur)) || '';
      if (texteProfil) {
        enfants.push(titreSection('Profil', colonne));
        enfants.push(texteSimple(texteProfil, opt()));
      }
    } else if (rubrique === 'experiences') {
      // TACHE ("le document fait 4 pages") : composition.contenuRetenu.experiences
      // (deja plafonne par capacites.experiences, voir composeurComposition.js)
      // -- jamais objetCV.experiences directement, qui contient TOUT sans
      // limite.
      var experiences = composition.contenuRetenu.experiences;
      if (experiences.length) {
        enfants.push(titreSection('Expérience professionnelle', colonne));
        // TACHE (retour utilisateur : "A4 Essentiel identique à A4
        // Détaillé") : rendu compact -- une seule ligne par experience
        // (poste — entreprise · lieu · dates : mission courte deja
        // tronquee), meme esprit que les 16 modeles existants en
        // Essentiel.
        // TACHE (étape 3) : la stratégie "Par compétences" réutilise ce
        // même rendu compact (contrat §3 : "jamais de puces de missions
        // détaillées") -- jamais une deuxième version dupliquée de cette
        // logique, juste une condition élargie.
        // TACHE (retour utilisateur : "s'il reste de la place et plus
        // rien à révéler, je veux quand même pouvoir détailler") :
        // theme.detailForceParCompetences (bouton "Optimisation ultime",
        // js/app.js -- dernier recours, jamais activé par défaut) lève
        // cette règle UNIQUEMENT pour ce CV précis, une fois vérifié par
        // mesure réelle que ça tient toujours sur 1 page. N'a aucun effet
        // sur formatEssentiel (compact toujours voulu pour ce format,
        // règle distincte, jamais concernée par ce levier).
        var experiencesEnModeCompact = composition.formatEssentiel ||
          (composition.strategieCV && composition.strategieCV.id === 'parCompetences' && !theme.detailForceParCompetences);
        // TACHE (retour utilisateur : "le message dit 'style épuré
        // réactivé' mais le CV affiche toujours les missions fusionnées
        // sur une seule ligne -- message faux" -- bug réel confirmé) :
        // ce mode compact est déclenché par formatEssentiel/stratégie
        // "Par compétences", INDÉPENDAMMENT de theme.styleProfessionnel
        // (Condensé/Épuré) -- un CV peut donc rester visuellement fusionné
        // même une fois "epure" réactivé. Exposée ici (même convention que
        // _pagesEstimeesCVProjetXXL, js/app.js) pour que l'Optimisation
        // ultime puisse vérifier avant d'annoncer "épuré réactivé" que le
        // rendu réel montrera bien une puce par mission, jamais juste sa
        // propre variable interne qui ne reflète que la moitié du mécanisme.
        if (typeof window !== 'undefined') { window._dernierExperiencesEnModeCompact = experiencesEnModeCompact; }
        if (experiencesEnModeCompact) {
          experiences.forEach(function (e) {
            // TACHE (double points entre les mots, bug réel trouvé) :
            // e.missions est stocké ligne par ligne (séparateur \n, voir
            // composeurComposition.js qui le découpe déjà ainsi pour la
            // troncature) mais un \n brut dans un TextRun docx.js ne
            // produit JAMAIS de saut de ligne réel -- les lignes se
            // retrouvaient collées les unes aux autres. En mode compact
            // (une seule ligne par expérience), les lignes de missions
            // sont rejointes proprement avec « · » au lieu du \n brut.
            var missionsCompactes = _decouperMissions(e.missions).map(_sansPonctuationFinale).filter(Boolean).join(' · ');
            // TACHE (port du PDF, styleParties -- retour utilisateur :
            // "souligner le poste, les dates, l'entreprise... même en
            // Essentiel") : ligne reconstruite en segments (au lieu d'une
            // seule chaîne) pour que poste/entreprise/dates gardent chacun
            // leur propre style, jamais le lieu ni les missions (qui n'ont
            // pas d'équivalent côté PDF) -- concaténation strictement
            // identique à avant quand aucun style n'est actif.
            var segments = [ { text: e.poste, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) } ];
            var infos = [];
            if (e.entreprise) { infos.push({ text: e.entreprise, style: stylePartie(theme.soulignerEntreprise, theme.italiqueEntreprise) }); }
            if (e.lieu) { infos.push({ text: e.lieu, style: {} }); }
            var datesCompact = _formaterPeriode(e.dateDebut, e.dateFin);
            if (datesCompact) { infos.push({ text: datesCompact, style: stylePartie(theme.soulignerDates, theme.italiqueDates) }); }
            infos.forEach(function (seg, idx) {
              segments.push({ text: (idx === 0 ? ' - ' : ' · ') + seg.text, style: seg.style });
            });
            if (missionsCompactes) { segments.push({ text: ' : ' + missionsCompactes, style: {} }); }
            enfants.push(puceRuns(segments, opt()));
          });
        } else {
          // TACHE (retour utilisateur : "je veux que les années soient
          // dans la continuité du métier... pour gagner de l'espace,
          // mais seulement si au moins 2 expériences pro -- pour un CV
          // déjà faible/peu fourni, garder les dates sur leur propre
          // ligne") : Projet XXL uniquement (Sobre/Institutionnel/
          // Moderne gardent leur format à 2 lignes, quel que soit le
          // nombre d'expériences -- jamais demandé pour eux). Seuil basé
          // sur le nombre d'expériences PRO retenues elles-mêmes (pas le
          // total pro+perso de la correction précédente -- énoncé
          // différemment par la personne : "au moins 2 expériences pro").
          var datesEnLigne = estProjetXXL && experiences.length >= 2;
          var LARGEUR_TAB_TWIPS = 6100;
          // TACHE (retour utilisateur : "poste — entreprise trop long
          // pour tenir sur une ligne avec les dates -- réduire légèrement
          // la police de cette ligne précise") : docx.js/Word ne permet
          // aucune mesure réelle du texte au moment de la génération
          // (architecture §4.3) -- estimation calibrée empiriquement
          // (mesure réelle sur PDF converti, LibreOffice : "Travaux" en
          // gras à 15pt mesurait 57.5pt sur 7 caractères, soit ≈8.2pt/
          // caractère, ratio ≈0.55 par point de taille) plutôt qu'une
          // vraie mesure, donc volontairement prudente (marge de
          // sécurité incluse) -- peut réduire une ligne qui tiendrait
          // en réalité de justesse, jamais l'inverse (un débordement réel
          // non anticipé serait pire qu'une réduction légèrement trop
          // prudente).
          function tailleLigneDatesAjustee(posteEntrepriseTxt, datesTxt) {
            var tailleDemiDefaut = taillePolice; // demi-points (docx.js)
            var tailleMinDemi = 24; // 12pt -- plancher dur R003 (composeurRegles.js), jamais franchi
            var tailleDemi = tailleDemiDefaut;
            while (tailleDemi > tailleMinDemi) {
              var taillePt = tailleDemi / 2;
              var largeurPosteEntreprisePt = posteEntrepriseTxt.length * 0.55 * taillePt;
              var largeurDatesPt = datesTxt.length * 0.48 * (taillePt - 2);
              var margeSecuritePt = 12;
              if ((largeurPosteEntreprisePt + largeurDatesPt + margeSecuritePt) <= (LARGEUR_TAB_TWIPS / 20)) { break; }
              tailleDemi -= 2; // reduit d'1pt a chaque iteration
            }
            return tailleDemi;
          }
          // TACHE (retour utilisateur : "récupérer de Trajectoire l'idée
          // d'avoir les dates avant le poste... l'entreprise n'est jamais
          // la chose centrale, toujours une annexe, dans les deux cas") :
          // poste et entreprise sont désormais TOUJOURS deux TextRun
          // distincts (avant, "Poste — Entreprise" formait un seul bloc
          // en gras) -- l'entreprise reste toujours en couleur secondaire,
          // jamais en gras, quel que soit l'ordre choisi. LARGEUR_TAB_DATE_AVANT
          // : largeur réservée à la colonne des dates en mode "dateAvant"
          // (tabulation alignée à GAUCHE, jamais à droite dans ce mode) --
          // calibrée pour une plage de dates typique ("2015 - 2020").
          var LARGEUR_TAB_DATE_AVANT = 1500;
          experiences.forEach(function (e) {
            var dates = _formaterPeriode(e.dateDebut, e.dateFin);
            var posteEntreprise = e.poste + (e.entreprise ? ' - ' + e.entreprise : '');
            if (datesEnLigne && dates) {
              // Poste — entreprise [tabulation] dates (ou l'inverse selon
              // theme.ordreDatesPoste), sur UNE seule ligne -- tabulation
              // alignée à droite de la colonne principale (6600 twips,
              // moins ses marges ≈ 6250 utiles) en mode "posteAvant" ;
              // alignée à gauche, largeur fixe réservée aux dates, en mode
              // "dateAvant". Projet XXL est toujours en 2 colonnes
              // désormais (mode 1 colonne désactivé, voir composeurTheme.js),
              // largeur donc stable.
              var tailleLigne = tailleLigneDatesAjustee(posteEntreprise, dates);
              var runPoste = new TextRun(Object.assign({ text: e.poste, bold: true, size: tailleLigne, color: TEXTE, font: theme.police.corps }, stylePartie(theme.soulignerPoste, theme.italiquePoste)));
              var runEntreprise = new TextRun(Object.assign({ text: e.entreprise ? ' - ' + e.entreprise : '', size: tailleLigne, color: SECONDAIRE, font: theme.police.corps }, stylePartie(theme.soulignerEntreprise, theme.italiqueEntreprise)));
              if (theme.ordreDatesPoste === 'dateAvant') {
                enfants.push(new Paragraph({
                  spacing: { after: Math.round(20 * espacementExtra) },
                  tabStops: [ { type: TabStopType.LEFT, position: LARGEUR_TAB_DATE_AVANT } ],
                  keepLines: !!composition.controleVeuvesOrphelines,
                  children: [
                    new TextRun(Object.assign({ text: dates, size: tailleLigne - 4, color: (couleurContenu || SECONDAIRE), font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates))),
                    new TextRun({ text: '\t', size: tailleLigne }),
                    runPoste, runEntreprise
                  ]
                }));
              } else {
                enfants.push(new Paragraph({
                  spacing: { after: Math.round(20 * espacementExtra) },
                  tabStops: [ { type: TabStopType.RIGHT, position: LARGEUR_TAB_TWIPS } ],
                  keepLines: !!composition.controleVeuvesOrphelines,
                  children: [ runPoste, runEntreprise, new TextRun({ text: '\t', size: tailleLigne }),
                    new TextRun(Object.assign({ text: dates, size: tailleLigne - 4, color: (couleurContenu || SECONDAIRE), font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates))) ]
                }));
              }
              if (e.lieu) { enfants.push(texteSimple(e.lieu, opt({ italics: true, size: tailleLigne - 4, color: SECONDAIRE, after: 60 }, true))); }
            } else {
              enfants.push(new Paragraph({
                spacing: { after: 20 },
                children: [
                  new TextRun(Object.assign({ text: e.poste, bold: true, size: taillePolice, color: TEXTE, font: theme.police.corps }, stylePartie(theme.soulignerPoste, theme.italiquePoste))),
                  new TextRun(Object.assign({ text: e.entreprise ? ' - ' + e.entreprise : '', size: taillePolice, color: SECONDAIRE, font: theme.police.corps }, stylePartie(theme.soulignerEntreprise, theme.italiqueEntreprise)))
                ]
              }));
              // TACHE (port du PDF, styleParties.dates) : lieu et dates
              // etaient auparavant fusionnes en un seul TextRun italique --
              // separes ici pour que seul le segment "dates" suive le
              // reglage souligne/italique dedie, jamais le lieu (qui n'a
              // pas d'equivalent cote PDF).
              if (e.lieu || dates) {
                var couleurMeta = opt({ color: SECONDAIRE }, true).color;
                enfants.push(new Paragraph({
                  spacing: { after: Math.round(60 * espacementExtra) },
                  keepLines: !!composition.controleVeuvesOrphelines,
                  children: [
                    e.lieu ? new TextRun({ text: e.lieu + (dates ? ' · ' : ''), italics: true, size: taillePolice - 4, color: couleurMeta, font: theme.police.corps }) : null,
                    dates ? new TextRun(Object.assign({ text: dates, size: taillePolice - 4, color: couleurMeta, font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates))) : null
                  ].filter(Boolean)
                }));
              }
            }
            // TACHE (retour utilisateur : "Condensé/Épuré -- Épuré, c'est
            // le modèle qu'on a déjà [confirmé par comparaison de 2 CV
            // réels, paragraphe par paragraphe : rendu identique à
            // aujourd'hui, une puce par ligne de mission]. Condensé,
            // c'est la continuité d'une mission sur la ligne de la
            // précédente, jamais un nouveau départ de ligne.") : Projet
            // XXL uniquement (theme.styleProfessionnel n'existe pas pour
            // les 3 autres thèmes, jamais concernés). "epure" (défaut)
            // garde le comportement historique (une puce par ligne,
            // inchangé) -- "condense" fusionne toutes les missions de
            // CETTE expérience en une seule puce, séparées par « · »,
            // jamais un nouveau paragraphe par mission. Volontairement
            // indépendant du mécanisme de débordement A/B (qui, lui,
            // réduit le NOMBRE de missions) -- ici, aucune mission n'est
            // jamais perdue, uniquement la mise en forme change.
            if (estProjetXXL && theme.styleProfessionnel === 'condense') {
              // TACHE (retour utilisateur, précision sur capture d'écran :
              // "à la fin de chaque mission il n'y a pas de point de fin
              // de phrase, la seule chose qui sépare une mission c'est ·
              // avec un espace de chaque côté") : le point final de
              // chaque mission est retiré avant la fusion (jamais
              // laissé, même sur la toute dernière mission) -- seul « · »
              // (espace-point médian-espace) sépare les missions,
              // jamais un point classique nulle part dans le résultat.
              var missionsCondensees = _decouperMissions(e.missions).map(_sansPonctuationFinale).filter(Boolean).join(' · ');
              if (missionsCondensees) { enfants.push(puce(missionsCondensees, opt())); }
            } else {
              // TACHE (retour utilisateur : "je veux le gros point, tel
              // que tu as fait initialement -- le petit point venait
              // d'une altération au copier-coller dans cette fenêtre de
              // dialogue, pas de mon intention réelle") : retour à
              // puce() ("•", comportement historique) -- puceEpure()
              // ("·") retiré, jamais utilisé nulle part au final.
              // TACHE (retour utilisateur, bug trouvé : "Épuré -- aucun
              // changement... chaque mission doit commencer avec la puce
              // et se terminer par un point") : _decouperMissions() gère
              // désormais le format Découverte (« ; ») en plus des sauts
              // de ligne -- un point unique est reconstruit à la fin de
              // chaque mission (jamais laissé tel quel : le texte source
              // peut déjà en avoir un, ou pas du tout selon son origine).
              _decouperMissions(e.missions).forEach(function (segment) {
                var texteMission = _sansPonctuationFinale(segment);
                if (texteMission) { enfants.push(puce(texteMission + '.', opt())); }
              });
            }
          });
        }
      }
    } else if (rubrique === 'formations') {
      var formations = composition.contenuRetenu.formations;
      // TACHE (retour utilisateur : "CACES/titre pro = certification, doit
      // impérativement apparaître... intégrer la partie Formation pour
      // Projet XXL") : certifications dessinées ICI, dans le même bloc
      // "Formation" (jamais un titre séparé) -- UNIQUEMENT pour Projet
      // XXL. Pour les 3 autres thèmes, ce tableau reste vide (voir
      // composeurComposition.js : la rubrique 'certifications' séparée
      // n'est injectée QUE pour eux, jamais pour Projet XXL), donc cette
      // ligne n'a structurellement aucun effet en dehors de Projet XXL.
      var certificationsIntegrees = estProjetXXL ? composition.contenuRetenu.certifications : [];
      // TACHE (retour utilisateur : "CV Complet"/"CV Optimise", harmonisation
      // Word<->PDF) : f.missions n'existe desormais QUE si "CV Optimise" est
      // actif (voir appliquerMoteurDecisionCV(), js/app.js -- la formation
      // retenue par l'IA n'est narrowee/enrichie de missions que dans ce
      // mode). Affichage donc conditionne uniquement a la presence de
      // f.missions, plus jamais au reglage separe "bloc mis en avant"
      // (ancien comportement, retire) -- meme logique EXACTEMENT que le
      // PDF (cvPdfTemplateA4.js, _pdfBlocFormations), qui a toujours affiche
      // les missions sans condition supplementaire des qu'elles existent.
      if (formations.length || certificationsIntegrees.length) {
        enfants.push(titreSection('Formations et diplômes', colonne));
        formations.forEach(function (f) {
          // TACHE (retour utilisateur : "pour la formation je ne veux
          // pas avoir les années -- pas affiché sur le CV en tout cas")
          // : l'année reste dans dossier.formations (utile pour l'IA/un
          // futur usage), simplement plus affichée ici.
          // TACHE (port du PDF, styleParties.poste -- meme convention que
          // cvPdfTemplateA4.js:_pdfBlocFormations : "niveau+intitule =
          // equivalent poste, MEME reglage global que les experiences") :
          // niveau/intitule restent joints en une seule chaine (deja
          // affiches ensemble), style applique au segment entier.
          var ligne = [f.niveau, f.intitule].filter(Boolean).join(' - ');
          if (ligne) { enfants.push(texteSimpleRuns([ { text: ligne, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) } ], opt({ after: 60 }))); }
          if (f.missions) {
            _decouperMissions(f.missions).forEach(function (segment) {
              var texteMission = _sansPonctuationFinale(segment);
              if (texteMission) { enfants.push(puce(texteMission + '.', opt())); }
            });
          }
        });
        // TACHE (retour utilisateur : "je les veux sur la même ligne,
        // pas une certification par ligne -- Certifications : R482
        // R485...") : une seule ligne, jamais une puce par certification.
        if (certificationsIntegrees.length) {
          enfants.push(texteSimple('Certifications : ' + certificationsIntegrees.join(', '), opt({ after: 60 })));
        }
      }
    } else if (rubrique === 'certifications') {
      // TACHE (retour utilisateur : bug de contenu manquant, corrigé) :
      // rubrique EXCLUSIVE aux 3 thèmes non-Projet XXL (jamais injectée
      // pour Projet XXL, voir composeurComposition.js -- intégrée à
      // "Formation" pour ce thème à la place). Section séparée "Certifications",
      // cohérente avec la convention déjà utilisée par le pipeline des 16
      // modèles classiques (exportDocxNatifCV.js et les autres).
      var certificationsSeparees = composition.contenuRetenu.certifications;
      if (certificationsSeparees && certificationsSeparees.length) {
        enfants.push(titreSection('Certifications', colonne));
        certificationsSeparees.forEach(function (c) { enfants.push(puce(c, opt())); });
      }
    } else if (rubrique === 'logiciels') {
      // TACHE (rubrique « Logiciels et outils » dédiée, décision Denis 2026-08-28) :
      // dossier.logiciels (Excel, Canva...) était saisi et transmis à
      // l'assistant lettre/entretien mais n'apparaissait sur aucun CV. Rendu
      // « liste simple » calqué EXACTEMENT sur 'certifications' ci-dessus --
      // même garde-fou : rien affiché (pas même le titre) si la liste est vide.
      var logiciels = composition.contenuRetenu.logiciels;
      if (logiciels && logiciels.length) {
        enfants.push(titreSection('Logiciels et outils', colonne));
        logiciels.forEach(function (l) { enfants.push(puce(l, opt())); });
      }
    } else if (rubrique === 'competencesCles') {
      // TACHE (étape 4) : lit composition.contenuRetenu.competencesCles,
      // déjà sélectionné par R006 (composeurComposition.js) -- ce fichier
      // ne décide jamais quelles compétences afficher, seulement comment
      // les dessiner.
      var competencesCles = composition.contenuRetenu.competencesCles;
      if (competencesCles && competencesCles.length) {
        enfants.push(titreSection('Compétences clés', colonne));
        enfants.push(texteSimple(competencesCles.join('  ·  '), opt({ bold: true, after: 140 })));
      }
    } else if (rubrique === 'competences') {
      // TACHE (étape 3) : lit composition.strategieCV et
      // composition.contenuRetenu.competencesGroupees, tous deux déjà
      // construits par le Composition Engine (composeurComposition.js) --
      // ce fichier ne décide jamais lui-même s'il faut grouper, il
      // dessine ce qu'on lui donne (source unique de vérité).
      var competencesGroupees = composition.contenuRetenu.competencesGroupees;
      if (competencesGroupees && competencesGroupees.length) {
        enfants.push(titreSection('Compétences professionnelles', colonne));
        competencesGroupees.forEach(function (groupe) {
          enfants.push(texteSimple(groupe.theme, opt({ bold: true, after: 40, color: SECONDAIRE }, true)));
          groupe.items.forEach(function (item) {
            // TACHE (étape 5) : item est désormais {texte, illustrePar}
            // (composeurComposition.js) -- ce fichier dessine tel quel,
            // ne décide jamais si "Illustré par" doit apparaître (ça
            // découle uniquement de ce que experiencesQuiDemontrent() a
            // trouvé, déjà tranché en amont).
            enfants.push(puce(item.texte, opt()));
            if (item.illustrePar && item.illustrePar.length) {
              enfants.push(texteSimple('Illustré par : ' + item.illustrePar.join(', '), opt({ italics: true, size: taillePolice - 4, color: SECONDAIRE, after: 100 }, true)));
            }
          });
        });
      } else {
        var toutes = composition.contenuRetenu.competences;
        if (toutes.length) {
          // TACHE (retour utilisateur : "en Essentiel, fusionner pro et
          // comportementales en 1 bloc -- Compétences et qualités") :
          // composition.contenuRetenu.competences porte déjà les 2
          // catégories fusionnées dans ce cas précis (composeurComposition.js,
          // fusionnerCompetencesXXL) -- ce fichier ne fait qu'adapter le
          // TITRE affiché, jamais une seconde logique de fusion. Hors de
          // ce cas exact (Projet XXL + A4 Essentiel), titre inchangé.
          var titreCompetences = (estProjetXXL && composition.formatEssentiel)
            ? 'Compétences et qualités' : 'Compétences professionnelles';
          enfants.push(titreSection(titreCompetences, colonne));
          toutes.forEach(function (t) { enfants.push(puce(t, opt())); });
        }
      }
    } else if (rubrique === 'langues') {
      var langues = composition.contenuRetenu.langues;
      if (langues.length) {
        enfants.push(titreSection('Langues', colonne));
        langues.forEach(function (l) { enfants.push(texteSimple(l.langue + ' - ' + l.niveau, opt({ after: 60 }))); });
      }
    } else if (rubrique === 'loisirsEngagements') {
      var loisirs = composition.contenuRetenu.loisirs, engagements = composition.contenuRetenu.engagements;
      if (loisirs.length) {
        enfants.push(titreSection('Centres d’intérêt', colonne));
        // TACHE (retour utilisateur : "un centre d'intérêt mis en avant --
        // gagné un tournoi, fait le tour du monde -- ça vaut le coup
        // d'être valorisé, il faut aussi lui donner des missions") : le
        // loisir retenu (contenuRetenu.loisirRetenu, cv.md point 16)
        // s'affiche développé avec ses missions -- UNIQUEMENT quand
        // "Centre d'intérêt" est le bloc explicitement choisi comme mis
        // en avant (blocMisEnAvantGauche), jamais par défaut -- même
        // logique que "Formations" (composeurComposition.js/js/app.js).
        // Sinon (ou aucun loisir retenu), comportement inchangé : simple
        // liste, aucune mission jamais affichée.
        var loisirEstMisEnAvant = theme.blocMisEnAvantGauche === 'loisirsEngagements';
        var loisirRetenu = (loisirEstMisEnAvant && composition.contenuRetenu.loisirRetenu) || null;
        loisirs.forEach(function (t) {
          // TACHE (retour utilisateur : "sport extrêmes, moto -- je veux
          // bien voir chaque centre d'intérêt commencer par une majuscule")
          // : la donnée elle-même (elementsFactuels) reste inchangée
          // (jamais reformulée, voir decouverte-competences.md) -- seule
          // la MISE EN FORME à l'affichage ajoute une majuscule en tête,
          // jamais sur le reste du mot (une casse déjà correcte, ex. un
          // sigle "VTT", n'est jamais altérée après la 1ère lettre).
          var texteAffiche = _premiereMajuscule(t);
          if (loisirRetenu && t === loisirRetenu.intitule) {
            enfants.push(texteSimple(texteAffiche, { bold: true, after: 20 }));
            _decouperMissions(loisirRetenu.missions).forEach(function (segment) {
              var texteMission = _sansPonctuationFinale(segment);
              if (texteMission) { enfants.push(puce(texteMission + '.', opt())); }
            });
          } else {
            enfants.push(texteSimple(texteAffiche, opt({ after: 60 })));
          }
        });
      }
      // TACHE (retour utilisateur : "mélange entre loisirs et centre
      // d'intérêt") : pour Projet XXL, "Centre d'intérêt" ne contient plus
      // QUE les activités pratiquées (loisirs) -- les engagements sont
      // desormais dessines ailleurs, dans leur propre rubrique
      // 'experiencesPersonnelles' (voir plus bas), jamais ici. Comportement
      // inchangé pour Sobre/Institutionnel/Moderne (les deux blocs restent
      // affiches l'un a la suite de l'autre, comme avant).
      // TACHE (chantier "exp perso", Phase 4 : engagements structurés) :
      // un engagement peut désormais être soit une chaîne (ancienne
      // donnée, ou saisie manuelle via un autre parcours jamais modifié
      // ici), soit un objet {texte, dateDebut, dateFin} (Découverte,
      // depuis cette Phase 4) -- _texteEngagement() gère les deux formes,
      // jamais un "[object Object]" affiché par erreur.
      if (!estProjetXXL && engagements.length) {
        enfants.push(titreSection('Engagements', colonne));
        engagements.forEach(function (t) { enfants.push(texteSimple(_texteEngagement(t), opt({ after: 60 }))); });
      }
    } else if (rubrique === 'experiencesPersonnelles') {
      // TACHE (retour utilisateur : "combiner experiencesPersonnelles ET
      // engagements") : 2 sources distinctes fusionnées dans le meme
      // bloc, chacune avec son propre style -- objetCV.experiencesPersonnelles
      // (structuré {intitule, detail}, le "vrai" champ dédié, SCHEMA_CV.md)
      // dessiné en premier avec un rendu plus riche (intitulé en gras,
      // détail en second, meme esprit que le rendu 'experiences' plus
      // haut) puisque c'est la source la plus "détaillée" ; engagements
      // (simple liste de phrases, ou désormais d'objets structurés)
      // ensuite, en texte simple comme avant.
      // Rubrique EXCLUSIVE a Projet XXL (jamais injectee pour les 3
      // autres themes, voir composeurComposition.js).
      var experiencesPerso = composition.contenuRetenu.experiencesPersonnelles;
      var engagementsBloc = composition.contenuRetenu.engagements;
      if ((experiencesPerso && experiencesPerso.length) || (engagementsBloc && engagementsBloc.length)) {
        enfants.push(titreSection('Expérience personnelle', colonne));
        // TACHE (retour utilisateur : "Condensé/Épuré... Personnel") :
        // par analogie avec "Professionnel" (missions fusionnées en une
        // seule puce) -- ce bloc n'a pas de "missions" multiples par
        // entrée mais plusieurs ENTRÉES distinctes (experiencesPersonnelles
        // + engagements) -- "condense" fusionne donc les ENTRÉES entre
        // elles en une seule puce, séparées par « · », plutôt que les
        // missions au sein d'une même expérience. Le détail
        // (experiencesPersonnelles[].detail) et les dates inline des
        // engagements sont volontairement simplifiés dans ce mode (juste
        // l'intitulé/texte de chaque entrée) -- un mode condensé sert à
        // gagner de la place, pas à montrer le détail complet.
        if (estProjetXXL && theme.stylePersonnel === 'condense') {
          var entreesCondensees = (experiencesPerso || []).map(function (e) { return e.intitule; })
            .concat((engagementsBloc || []).map(_texteEngagement))
            .filter(Boolean)
            .join(' · ');
          if (entreesCondensees) { enfants.push(puce(entreesCondensees, opt())); }
        } else {
          // TACHE (retour utilisateur : "autres parcours -- pouvoir
          // mettre des dates [aux expériences personnelles], une mère au
          // foyer... je veux valoriser ça") : les variables ci-dessous
          // (seuil, largeur de tabulation, fonction d'ajustement de
          // police) sont désormais déclarées AVANT le rendu des
          // experiencesPersonnelles, pour être réutilisées par les DEUX
          // boucles (experiencesPerso ET engagements) -- même mécanisme
          // EXACT que celui construit pour les engagements (chantier
          // "exp perso", Phase 5), jamais réinventé. Le commentaire
          // précédent ("experiencesPersonnelles n'a lui-même aucune
          // date") est désormais dépassé : ce chantier leur ajoute
          // justement ce champ, via le parcours manuel catalogue
          // (Certifications/Loisirs restent, eux, strictement inchangés).
          var totalItemsExpPerso = (experiencesPerso ? experiencesPerso.length : 0) + (engagementsBloc ? engagementsBloc.length : 0);
          var datesEnLigneEngagement = estProjetXXL && totalItemsExpPerso >= 2;
          var LARGEUR_TAB_ENGAGEMENT = 6100;
          var tailleEngagementAjustee = function (texteEngagementTxt, datesTxt) {
            var tailleDemi = taillePolice;
            var tailleMinDemi = 24; // 12pt -- plancher dur R003, jamais franchi
            while (tailleDemi > tailleMinDemi) {
              var taillePt = tailleDemi / 2;
              var largeurTextePt = texteEngagementTxt.length * 0.5 * taillePt;
              var largeurDatesPt = datesTxt.length * 0.48 * (taillePt - 2);
              if ((largeurTextePt + largeurDatesPt + 12) <= (LARGEUR_TAB_ENGAGEMENT / 20)) { break; }
              tailleDemi -= 2;
            }
            return tailleDemi;
          };
          (experiencesPerso || []).forEach(function (e) {
            var datesExpPerso = _formaterPeriode(e.dateDebut, e.dateFin);
            if (datesEnLigneEngagement && datesExpPerso) {
              var tailleLigneExpPerso = tailleEngagementAjustee(e.intitule, datesExpPerso);
              enfants.push(new Paragraph({
                spacing: { after: Math.round(20 * espacementExtra) },
                tabStops: [ { type: TabStopType.RIGHT, position: LARGEUR_TAB_ENGAGEMENT } ],
                keepLines: !!composition.controleVeuvesOrphelines,
                children: [
                  new TextRun(Object.assign({ text: e.intitule, bold: true, size: tailleLigneExpPerso, color: TEXTE, font: theme.police.corps }, stylePartie(theme.soulignerPoste, theme.italiquePoste))),
                  new TextRun(Object.assign({ text: '\t' + datesExpPerso, size: tailleLigneExpPerso - 4, color: (couleurContenu || SECONDAIRE), font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates)))
                ]
              }));
            } else {
              enfants.push(texteSimpleRuns([ { text: e.intitule, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) } ], { bold: true, after: 20 }));
            }
            if (e.detail) { enfants.push(texteSimple(e.detail, opt({ size: taillePolice - 4, color: SECONDAIRE, after: 60 }, true))); }
            // TACHE (retour utilisateur : "je veux bien que les
            // expériences personnelles aient des missions au même titre
            // que l'expérience professionnelle") : même principe EXACT
            // que pour les engagements plus bas -- une puce par ligne,
            // absente en mode Condensé (déjà simplifié à l'intitulé
            // seul). Alimenté par le parcours manuel (catalogue,
            // ajouterAuCatalogue) -- Découverte, lui, n'alimente jamais
            // experiencesPersonnelles (voir mémoire "exp perso"), donc
            // ce champ reste vide dans ce cas, jamais un plantage.
            if (e.missions) {
              _decouperMissions(e.missions).forEach(function (segment) {
                var texteMission = _sansPonctuationFinale(segment);
                if (texteMission) { enfants.push(puce(texteMission + '.', opt())); }
              });
            }
          });
          // TACHE (chantier "exp perso", Phase 5 : brancher le rendu déjà
          // construit pour les expériences pro sur les engagements,
          // maintenant que leurs dates existent réellement, Phase 4) :
          // même principe EXACT que le rendu 'experiences' plus haut
          // (tabulation alignée à droite, réduction de police ciblée si la
          // ligne est trop longue) -- jamais réinventé, adapté ici au
          // texte seul de l'engagement (pas de poste/entreprise séparés).
          // Seuil "2+ éléments" appliqué au total du bloc (experiencesPerso
          // + engagements), même esprit que "2+ expériences pro" plus haut.
          (engagementsBloc || []).forEach(function (t) {
            var texteEng = _texteEngagement(t);
            var datesEng = (t && typeof t === 'object') ? _formaterPeriode(t.dateDebut, t.dateFin) : '';
            if (datesEnLigneEngagement && datesEng) {
              var tailleLigneEng = tailleEngagementAjustee(texteEng, datesEng);
              enfants.push(new Paragraph({
                spacing: { after: Math.round(60 * espacementExtra) },
                tabStops: [ { type: TabStopType.RIGHT, position: LARGEUR_TAB_ENGAGEMENT } ],
                keepLines: !!composition.controleVeuvesOrphelines,
                children: [
                  new TextRun(Object.assign({ text: texteEng, size: tailleLigneEng, color: TEXTE, font: theme.police.corps }, stylePartie(theme.soulignerPoste, theme.italiquePoste))),
                  new TextRun(Object.assign({ text: '\t' + datesEng, size: tailleLigneEng - 4, color: (couleurContenu || SECONDAIRE), font: theme.police.corps }, stylePartie(theme.soulignerDates, theme.italiqueDates)))
                ]
              }));
            } else {
              // TACHE (retour utilisateur, bug trouvé en testant : "avec 1
              // seul engagement, la date disparaissait complètement") :
              // même repli que pour les expériences pro (ligne séparée,
              // jamais un simple abandon de l'information) -- seul
              // l'alignement en tabulation change selon le seuil, jamais
              // la présence de la date elle-même.
              enfants.push(texteSimpleRuns([ { text: texteEng, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) } ], opt({ after: datesEng ? 20 : 60 })));
              if (datesEng) { enfants.push(texteSimpleRuns([ { text: datesEng, style: stylePartie(theme.soulignerDates, theme.italiqueDates) } ], opt({ size: taillePolice - 4, color: SECONDAIRE, after: 60 }, true))); }
            }
            // TACHE (retour utilisateur : "je veux bien que les
            // expériences personnelles aient des missions au même titre
            // que l'expérience professionnelle... sous le même format et
            // avec les mêmes règles") : une puce par mission, exactement
            // le même principe que le rendu 'experiences' en mode Épuré
            // plus haut -- jamais un second mécanisme dupliqué. Absent en
            // mode Condensé (voir plus haut : ce mode simplifie déjà
            // volontairement à l'intitulé/texte seul).
            // TACHE (retour utilisateur, bug trouvé : "Épuré -- aucun
            // changement") : _decouperMissions() gère désormais le
            // format Découverte (missions jointes par « ; »,
            // _decouverteConcatenerPreuve) en plus des sauts de ligne
            // (saisie manuelle) -- sans ce correctif, un texte Découverte
            // ne formait qu'un seul "morceau", jamais découpé en
            // plusieurs puces.
            if (t && typeof t === 'object' && t.missions) {
              _decouperMissions(t.missions).forEach(function (segment) {
                var texteMission = _sansPonctuationFinale(segment);
                if (texteMission) { enfants.push(puce(texteMission + '.', opt())); }
              });
            }
          });
        }
        // TACHE (retour utilisateur : "en 1 colonne, je vois juste
        // 'engagement associatif' collé après le savoir-faire personnel
        // développé, sans rien pour comprendre que ce sont 2 choses
        // différentes -- un sous-titre serait mieux pour la lecture") :
        // en 2 colonnes, l'élément non retenu part dans sa PROPRE colonne
        // (rubriques savoirFairePersonnelNonRetenu/engagementNonRetenu,
        // voir plus bas) -- pas de colonne latérale en 1 colonne, donc
        // rendu ICI, dans le même bloc, sous un petit sous-titre par type
        // (jamais un titre de section pleine taille, qui ferait doublon
        // avec "Expérience personnelle" juste au-dessus). En dehors du
        // if/else Condensé/Épuré exprès : sinon un CV en Condensé + 1
        // colonne perdrait purement et simplement ces éléments (déjà
        // sortis de experiencesPerso/engagementsBloc par composeurComposition.js,
        // jamais lus par la fusion condensée ci-dessus).
        if (composition.colonnes === 1) {
          var spNonRetenuInline = composition.contenuRetenu.savoirFairePersonnelNonRetenu;
          var engNonRetenuInline = composition.contenuRetenu.engagementNonRetenu;
          if (spNonRetenuInline && spNonRetenuInline.length) {
            enfants.push(texteSimple('Savoir-faire personnel', { bold: true, size: taillePolice - 2, color: SECONDAIRE, after: 20 }));
            spNonRetenuInline.forEach(function (e) { enfants.push(texteSimple(e.intitule, opt({ after: 60 }))); });
          }
          if (engNonRetenuInline && engNonRetenuInline.length) {
            enfants.push(texteSimple('Engagement', { bold: true, size: taillePolice - 2, color: SECONDAIRE, after: 20 }));
            engNonRetenuInline.forEach(function (t) { enfants.push(texteSimple(_texteEngagement(t), opt({ after: 60 }))); });
          }
        }
      }
    } else if (rubrique === 'savoirFairePersonnelNonRetenu') {
      // TACHE (retour utilisateur : separer l'element non retenu de
      // celui developpe avec missions) : mention simple, colonne
      // laterale -- construit par composeurComposition.js (Projet XXL, 2
      // colonnes) uniquement quand un element A ete retenu ailleurs
      // (sinon ce tableau reste vide, rubrique jamais poussee ici).
      var spNonRetenu = composition.contenuRetenu.savoirFairePersonnelNonRetenu;
      if (spNonRetenu && spNonRetenu.length) {
        enfants.push(titreSection('Savoir-faire personnel', colonne));
        spNonRetenu.forEach(function (e) { enfants.push(texteSimple(e.intitule, opt({ after: 60 }))); });
      }
    } else if (rubrique === 'engagementNonRetenu') {
      // TACHE : meme principe que savoirFairePersonnelNonRetenu juste
      // au-dessus -- _texteEngagement() gere deja les 2 formes possibles
      // (chaine ou objet {texte, dateDebut, dateFin}).
      var engNonRetenu = composition.contenuRetenu.engagementNonRetenu;
      if (engNonRetenu && engNonRetenu.length) {
        enfants.push(titreSection('Engagement', colonne));
        engNonRetenu.forEach(function (t) { enfants.push(texteSimple(_texteEngagement(t), opt({ after: 60 }))); });
      }
    } else if (rubrique === 'competencesPersonnelles') {
      // TACHE (retour utilisateur : "compétences personnelles" -- bloc
      // additif, jamais un remplacement des loisirs, voir cv.md point
      // 10) : lit composition.contenuRetenu.competencesPersonnelles,
      // déjà décidé et construit en amont -- ce fichier ne fait que
      // dessiner, jamais décider si le bloc doit apparaître.
      var competencesPersonnelles = composition.contenuRetenu.competencesPersonnelles;
      if (competencesPersonnelles && competencesPersonnelles.length) {
        // TACHE (Projet XXL, renommage acté dans le document de
        // conception) : "Compétences personnelles" -> "Compétences
        // comportementales" pour ce thème uniquement -- le contenu
        // (déjà fusionné avec le savoir-être par composeurComposition.js)
        // ne change pas de forme, seul le libellé affiché change.
        enfants.push(titreSection(estProjetXXL ? 'Compétences comportementales' : 'Compétences personnelles', colonne));
        // TACHE (retour utilisateur : "ne pas marquer dans les () les
        // sources... déjà visible dans Centres d'intérêt") : plus de
        // ligne "Issu de", seulement le texte de la compétence.
        competencesPersonnelles.forEach(function (c) { enfants.push(puce(c.competence, opt())); });
      }
    } else if (rubrique === 'competencesCombinees') {
      // TACHE (retour utilisateur : "1 colonne -- compétences pro et
      // comportementales sur les mêmes lignes pour optimiser l'espace,
      // pas un bloc sous l'autre") : même technique EXACTE que la table
      // 2 colonnes du corps (Table/TableRow/TableCell), appliquée à CE
      // seul bloc -- jamais réinventée. Repli automatique en bloc
      // plein-largeur si un seul côté a du contenu -- jamais un côté
      // vide affiché à côté de l'autre (principe "si un bloc est vide,
      // on ne le met pas, optimiser l'espace").
      var competencesProCombo = composition.contenuRetenu.competences;
      var competencesComportementalesCombo = composition.contenuRetenu.competencesPersonnelles;
      var proPresent = competencesProCombo && competencesProCombo.length;
      var comportementalesPresent = competencesComportementalesCombo && competencesComportementalesCombo.length;
      if (proPresent && comportementalesPresent) {
        var celluleProEnfants = [ titreSection('Compétences professionnelles', colonne) ]
          .concat(competencesProCombo.map(function (t) { return puce(t, opt()); }));
        var celluleComportementalesEnfants = [ titreSection('Compétences comportementales', colonne) ]
          .concat(competencesComportementalesCombo.map(function (c) { return puce(c.competence, opt()); }));
        var AUCUNE_BORDURE_COMBO1 = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
        enfants.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [5000, 5000],
          borders: {
            top: AUCUNE_BORDURE_COMBO1, bottom: AUCUNE_BORDURE_COMBO1, left: AUCUNE_BORDURE_COMBO1,
            right: AUCUNE_BORDURE_COMBO1, insideHorizontal: AUCUNE_BORDURE_COMBO1, insideVertical: AUCUNE_BORDURE_COMBO1
          },
          rows: [ new TableRow({ children: [
            new TableCell({ width: { size: 5000, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 150 }, verticalAlign: VerticalAlign.TOP, children: celluleProEnfants }),
            new TableCell({ width: { size: 5000, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 150, right: 0 }, verticalAlign: VerticalAlign.TOP, children: celluleComportementalesEnfants })
          ] }) ]
        }));
      } else if (proPresent) {
        enfants.push(titreSection('Compétences professionnelles', colonne));
        competencesProCombo.forEach(function (t) { enfants.push(puce(t, opt())); });
      } else if (comportementalesPresent) {
        enfants.push(titreSection('Compétences comportementales', colonne));
        competencesComportementalesCombo.forEach(function (c) { enfants.push(puce(c.competence, opt())); });
      }
    } else if (rubrique === 'formationLangues') {
      // TACHE (retour utilisateur : "même principe côte-à-côte pour
      // Formation + Langues") : même technique que ci-dessus, même repli
      // plein-largeur si un seul côté a du contenu. Certifications
      // toujours intégrées dans le bloc Formation (comme en 2 colonnes,
      // jamais un titre séparé pour Projet XXL).
      var formationsCombo = composition.contenuRetenu.formations;
      var certificationsCombo = estProjetXXL ? composition.contenuRetenu.certifications : [];
      var languesCombo = composition.contenuRetenu.langues;
      var formationPresente = (formationsCombo && formationsCombo.length) || (certificationsCombo && certificationsCombo.length);
      var languesPresentes = languesCombo && languesCombo.length;

      var construireBlocFormationCombo = function () {
        var e = [ titreSection('Formations et diplômes', colonne) ];
        (formationsCombo || []).forEach(function (f) {
          var ligne = [f.niveau, f.intitule].filter(Boolean).join(' - ');
          if (ligne) { e.push(texteSimpleRuns([ { text: ligne, style: stylePartie(theme.soulignerPoste, theme.italiquePoste) } ], opt({ after: 60 }))); }
        });
        if ((certificationsCombo || []).length) {
          e.push(texteSimple('Certifications : ' + certificationsCombo.join(', '), opt({ after: 60 })));
        }
        return e;
      };
      var construireBlocLanguesCombo = function () {
        var e = [ titreSection('Langues', colonne) ];
        (languesCombo || []).forEach(function (l) { e.push(texteSimple(l.langue + ' - ' + l.niveau, opt({ after: 60 }))); });
        return e;
      };

      if (formationPresente && languesPresentes) {
        var AUCUNE_BORDURE_COMBO2 = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
        enfants.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [5000, 5000],
          borders: {
            top: AUCUNE_BORDURE_COMBO2, bottom: AUCUNE_BORDURE_COMBO2, left: AUCUNE_BORDURE_COMBO2,
            right: AUCUNE_BORDURE_COMBO2, insideHorizontal: AUCUNE_BORDURE_COMBO2, insideVertical: AUCUNE_BORDURE_COMBO2
          },
          rows: [ new TableRow({ children: [
            new TableCell({ width: { size: 5000, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 150 }, verticalAlign: VerticalAlign.TOP, children: construireBlocFormationCombo() }),
            new TableCell({ width: { size: 5000, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 150, right: 0 }, verticalAlign: VerticalAlign.TOP, children: construireBlocLanguesCombo() })
          ] }) ]
        }));
      } else if (formationPresente) {
        enfants = enfants.concat(construireBlocFormationCombo());
      } else if (languesPresentes) {
        enfants = enfants.concat(construireBlocLanguesCombo());
      }
    }
    return enfants;
  }

  var enfantsPrincipale = [];
  composition.repartitionColonnes.principale.forEach(function (rubrique) {
    enfantsPrincipale = enfantsPrincipale.concat(dessinerRubrique(rubrique, 'principale'));
  });

  // TACHE (étape B2, "2 colonnes") : construit une vraie table à 2
  // cellules SEULEMENT si le thème le prévoit ET qu'il y a réellement
  // quelque chose à mettre en colonne latérale (repartitionColonnes.
  // laterale, déjà décidée par composeurComposition.js -- ce fichier ne
  // décide jamais de la répartition, seulement du dessin). Même
  // technique que les 16 modèles classiques (_dnConstruireDeuxColonnes,
  // exportDocxNatifCV.js) : une table sans bordures visibles, jamais des
  // "colonnes" Word natives (peu fiables entre versions de Word) --
  // réutilisée, pas réinventée.
  var enfants = enfantsEnTete;
  // TACHE (retour utilisateur : "En-tête colorable séparément du corps") :
  // capture la frontière ici, AVANT tout ajout ultérieur (bandeau,
  // colonnes...) -- permet de re-séparer proprement "enfants" en 2 zones
  // (en-tête / reste) tout à la fin, sans restructurer l'accumulation
  // existante ailleurs dans cette fonction.
  var longueurEnTete = enfantsEnTete.length;

  // TACHE (retour utilisateur : "bandeau coordonnées -- je vais mettre
  // adresse mail, téléphone, permis et la ville, ville et code postal")
  // : renommé depuis "bandeau de disponibilité" (theme.bandeauDisponibilite,
  // nom de champ conservé pour ne pas casser les sessions déjà
  // sauvegardées) -- pleine largeur, entre l'en-tête et le corps --
  // indépendant du nombre de colonnes du corps (1 ou 2), toujours au même
  // endroit. Style "pastille" (fond plein coloré derrière chaque
  // information), même technique que les modèles classiques (_dnPastilles,
  // exportDocxNatifCV_NouveauxModeles.js) -- réutilisée, pas réinventée,
  // recolorée avec l'accent du thème plutôt qu'une couleur fixe. Rien de
  // tout ça si la personne n'a rien à y mettre -- jamais un bandeau vide.
  if (estProjetXXL && theme.bandeauDisponibilite) {
    var identiteBandeau = objetCV.identite || {};
    var permisBandeau = objetCV.permis || {};
    var badgesDisponibilite = [];
    if (identiteBandeau.email) { badgesDisponibilite.push(identiteBandeau.email); }
    if (identiteBandeau.telephone) { badgesDisponibilite.push(identiteBandeau.telephone); }
    // Lot moteur sous-lot 4 : le bandeau de disponibilite reprend permis +
    // langues -- il faut respecter le masquage decide dans "Ce qui s'affiche".
    if (permisBandeau.possede && !(theme.rubriquesMasquees && theme.rubriquesMasquees.permis)) {
      badgesDisponibilite.push('Permis ' + (permisBandeau.categories || []).join('/') + (permisBandeau.vehicule ? ' + véhicule' : ''));
    }
    var villeCPBandeau = [_formaterVille(identiteBandeau.ville), identiteBandeau.codePostal ? '(' + identiteBandeau.codePostal + ')' : ''].filter(Boolean).join(' ');
    if (villeCPBandeau) { badgesDisponibilite.push(villeCPBandeau); }
    // TACHE (audit robustesse, 2026-09-11) : lisait objetCV.langues brut
    // (non plafonne) au lieu de composition.contenuRetenu.langues (deja
    // plafonne selon les capacites du theme, meme source que le reste du
    // document) -- une personne avec beaucoup de langues voyait le
    // bandeau deborder, seul endroit du document a ne pas respecter le
    // plafond.
    var languesBandeau = (theme.rubriquesMasquees && theme.rubriquesMasquees.langues) ? [] : (composition.contenuRetenu.langues || []);
    if (languesBandeau.length) { badgesDisponibilite.push(languesBandeau.map(function (l) { return l.langue; }).join(', ')); }
    if (badgesDisponibilite.length) {
      // TACHE (retour utilisateur : "je veux garder le bandeau
      // coordonnées, mais avec du texte uniquement -- pas de pilules/
      // pastilles -- bien séparer les éléments avec des points") : en
      // mode Sobre (theme.sobreActif, composeurTheme.js), un seul
      // TextRun texte simple (sans fond ni gras ni couleur blanche)
      // joint par ' · ', jamais un badge par info -- même structure/
      // emplacement du bandeau qu'en temps normal, seul le style change.
      // TACHE (retour utilisateur : "ce bandeau, il peut aussi grandir --
      // pour l'instant il est figé -- au moins à la taille du texte de
      // corps, et qu'il suive la mise en page quand il y a de la place")
      // : taille FIXE (18, jamais transmise a "Mise en page") remplacee
      // par `taillePolice` (deja utilisee par TOUT le reste du corps --
      // experiences, formations... -- deja grossie/reduite par le meme
      // mecanisme de remplissage automatique de page, voir composition.
      // taillePoliceCorps plus haut) : le bandeau suit desormais
      // EXACTEMENT le texte de corps, jamais plus fige que le reste.
      var tailleBandeauDisponibilite = taillePolice;
      var runsDisponibilite = theme.sobreActif
        ? [ new TextRun({ text: badgesDisponibilite.join(' · '), size: tailleBandeauDisponibilite, font: theme.police.corps }) ]
        : (function () {
          var runs = [];
          badgesDisponibilite.forEach(function (badge, i) {
            runs.push(new TextRun({
              text: ' ' + badge + ' ', bold: true, size: tailleBandeauDisponibilite, color: 'FFFFFF', font: theme.police.corps,
              shading: { type: docx.ShadingType.CLEAR, fill: PRIMAIRE, color: 'auto' }
            }));
            if (i < badgesDisponibilite.length - 1) { runs.push(new TextRun({ text: '  ', size: tailleBandeauDisponibilite })); }
          });
          return runs;
        })();
      enfants = enfants.concat([ new Paragraph({ spacing: { after: 200 }, children: runsDisponibilite }) ]);
    }
  }
  if (composition.colonnes === 2 && composition.repartitionColonnes.laterale.length) {
    var enfantsLaterale = [];
    composition.repartitionColonnes.laterale.forEach(function (rubrique) {
      enfantsLaterale = enfantsLaterale.concat(dessinerRubrique(rubrique, 'laterale'));
    });
    var AUCUNE_BORDURE_COMPOSEUR = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    // TACHE (retour utilisateur : "possibilité de mettre un fond comme
    // Aquarelle sur la colonne de gauche") : même technique que
    // _dnConstruireDeuxColonnes (exportDocxNatifCV.js) : shading = 
    // ShadingType.CLEAR + fill sur la TableCell entière -- réutilisée,
    // pas réinventée. undefined si pas de fond de ce côté (docx.js
    // n'applique alors aucune couleur, comportement par défaut inchangé).
    var shadingLaterale = FOND_LATERALE ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: FOND_LATERALE } : undefined;
    var shadingPrincipale = FOND_PRINCIPALE ? { type: docx.ShadingType.CLEAR, color: 'auto', fill: FOND_PRINCIPALE } : undefined;
    // TACHE (retour utilisateur : "modèle Ruban -- ligne pour séparer les
    // colonnes") : même technique EXACTE que le modèle Ruban
    // (exportDocxNatifCV.js, optionsCelluleSidebar.borders = { right:
    // {...} }) -- une bordure posée sur la cellule latérale elle-même
    // prime sur le "insideVertical" (aucune bordure) défini au niveau de
    // la table plus bas, sans avoir à le changer pour tout le monde.
    var bordureSeparateur = theme.separateurColonnes
      ? { right: { style: BorderStyle.SINGLE, size: 24, color: (theme.separateurCouleurHex || PRIMAIRE) } }
      : undefined;
    // TACHE (retour utilisateur : "un espace entre les 2 colonnes si ont
    // une couleur, aujourd'hui ça fait comme une page remplie") : sans
    // fond, les marges internes de chaque cellule (150/200 DXA) créent
    // déjà un vrai espace blanc visible entre les 2 colonnes -- mais dès
    // qu'une cellule a un shading, celui-ci remplit TOUTE la cellule y
    // compris ses marges internes, donc les 2 couleurs se touchent
    // directement à la frontière des cellules, sans aucun espace visible
    // (page qui semble "remplie"). Seule une VRAIE cellule intermédiaire,
    // sans shading, insérée entre les 2 colonnes, peut créer un espace
    // blanc réel dans une table Word -- une marge ne suffit jamais entre
    // 2 cellules colorées adjacentes. Ajoutée UNIQUEMENT quand un fond de
    // colonne est actif (jamais de changement de largeur/mise en page
    // quand aucune couleur n'est appliquée, comportement par défaut
    // strictement inchangé) -- largeur prise à parts égales sur les 2
    // colonnes existantes pour garder la largeur totale de page identique.
    var aFondColonneActif = !!(FOND_GAUCHE || FOND_DROITE);
    // TACHE (retour utilisateur : "je veux un petit espace entre les 2
    // colonnes, esthétiquement c'est plus joli" -- redemandé alors que ce
    // mécanisme existe déjà) : 300 DXA (~0,53 cm) semble trop discret pour
    // se remarquer clairement sur un petit aperçu -- élargi légèrement,
    // toujours réparti à parts égales sur les 2 colonnes existantes (voir
    // largeurLaterale/largeurPrincipale plus bas), jamais un changement de
    // largeur totale de page.
    var largeurEspaceur = 450;
    var celluleEspaceur = aFondColonneActif
      ? [ new TableCell({ width: { size: largeurEspaceur, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [ new Paragraph({ children: [] }) ] }) ]
      : [];
    var largeurLaterale = aFondColonneActif ? (3400 - largeurEspaceur / 2) : 3400;
    var largeurPrincipale = aFondColonneActif ? (6600 - largeurEspaceur / 2) : 6600;
    // TACHE (retour utilisateur : permuter colonnes) : la cellule LATERALE
    // (petite) et la cellule PRINCIPALE (détaillée) gardent chacune leur
    // largeur/contenu/fond -- seul leur ordre physique dans la ligne
    // change. La bordure séparatrice (frontière visuelle entre les 2
    // colonnes) et les marges "vers le bord de page"/"vers le centre"
    // suivent donc la position PHYSIQUE (gauche/droite réels), jamais
    // l'identité laterale/principale.
    var celluleContenuLaterale = { width: { size: largeurLaterale, type: WidthType.DXA }, shading: shadingLaterale, verticalAlign: VerticalAlign.TOP, children: enfantsLaterale };
    var celluleContenuPrincipale = { width: { size: largeurPrincipale, type: WidthType.DXA }, shading: shadingPrincipale, verticalAlign: VerticalAlign.TOP, children: enfantsPrincipale };
    var proprietesGauche = inverserColonnes ? celluleContenuPrincipale : celluleContenuLaterale;
    var proprietesDroite = inverserColonnes ? celluleContenuLaterale : celluleContenuPrincipale;
    var celluleGauche = new TableCell(Object.assign({}, proprietesGauche, { borders: bordureSeparateur, margins: { top: 100, bottom: 100, left: 150, right: 200 } }));
    var celluleDroite = new TableCell(Object.assign({}, proprietesDroite, { margins: { top: 100, bottom: 100, left: 200, right: 150 } }));
    enfants = enfants.concat([
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: aFondColonneActif ? [proprietesGauche.width.size, largeurEspaceur, proprietesDroite.width.size] : [proprietesGauche.width.size, proprietesDroite.width.size],
        borders: {
          top: AUCUNE_BORDURE_COMPOSEUR, bottom: AUCUNE_BORDURE_COMPOSEUR, left: AUCUNE_BORDURE_COMPOSEUR,
          right: AUCUNE_BORDURE_COMPOSEUR, insideHorizontal: AUCUNE_BORDURE_COMPOSEUR, insideVertical: AUCUNE_BORDURE_COMPOSEUR
        },
        rows: [ new TableRow({ children: [celluleGauche].concat(celluleEspaceur).concat([celluleDroite]) }) ]
      })
    ]);
  } else {
    enfants = enfants.concat(enfantsPrincipale);
  }

  // TACHE (retour utilisateur : "Fond des colonnes"/"Séparateur" en 1
  // colonne -- "je préfère réinterpréter plutôt que désactiver, pour ne
  // pas appauvrir le côté modulable") : sans 2 colonnes, "Fond des
  // colonnes" n'a plus de cellule à teinter -- réinterprété en "Corps du
  // CV" colorié (tout ce qui suit l'en-tête). Un seul côté suffit à
  // activer le fond en 1 colonne (il n'y a plus de gauche/droite) --
  // n'importe quelle valeur de theme.fondColonnes autre que 'aucun' suffit.
  // TACHE (retour utilisateur : "je veux 3 options -- En-tête seul, Corps
  // seul, toute la page -- avec le même principe qu'en 2 colonnes") :
  // theme.fondTete (En-tête) est désormais INDÉPENDANT de theme.fondColonnes
  // (Corps, en 1 colonne) -- les 2 activés ensemble reproduisent "toute la
  // page" via la fonctionnalité Word native "Couleur de page"
  // (Document({background}), la plus simple et fiable pour couvrir toute
  // la page, marges incluses) ; un seul des 2 enveloppe SEULEMENT sa zone
  // dans une cellule de tableau pleine largeur teintée (même technique que
  // "Fond des colonnes", juste sur 1 seule cellule pleine largeur plutôt
  // que 2). À savoir : certaines versions de Word n'impriment un fond de
  // page que si "Imprimer les couleurs et arrière-plans" est activé côté
  // utilisateur -- limite de Word, pas de ce code.
  // corpsColore1Colonne : déjà calculé plus haut (nécessaire à
  // couleurTitrePourColonne()), jamais recalculé ici.
  var teteColoreePourFond = !!theme.fondTete;
  var AUCUNE_BORDURE_ZONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  function envelopperZoneColoree(enfantsZone) {
    if (!enfantsZone.length) { return enfantsZone; }
    return [ new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: AUCUNE_BORDURE_ZONE, bottom: AUCUNE_BORDURE_ZONE, left: AUCUNE_BORDURE_ZONE,
        right: AUCUNE_BORDURE_ZONE, insideHorizontal: AUCUNE_BORDURE_ZONE, insideVertical: AUCUNE_BORDURE_ZONE
      },
      rows: [ new TableRow({ children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: PRIMAIRE },
          margins: { top: 150, bottom: 150, left: 200, right: 200 },
          children: enfantsZone
        })
      ] }) ]
    }) ];
  }

  var fondPageEntiere;
  if (estProjetXXL && composition.colonnes === 1 && teteColoreePourFond && corpsColore1Colonne) {
    fondPageEntiere = { color: PRIMAIRE };
  } else {
    fondPageEntiere = undefined;
    var enfantsTeteZone = enfants.slice(0, longueurEnTete);
    var enfantsCorpsZone = enfants.slice(longueurEnTete);
    if (teteColoreePourFond) {
      enfantsTeteZone = envelopperZoneColoree(enfantsTeteZone);
      // TACHE (retour utilisateur : "il manque un espace entre le bandeau
      // d'en-tête coloré et le fond de colonne -- ça fait un L moche
      // quand les deux sont activés") : le petit paragraphe de transition
      // existant (_projetxxlConstruireEnTete(), plus haut) est déjà À
      // L'INTÉRIEUR de la zone enveloppée juste au-dessus (donc coloré
      // lui aussi, invisible comme séparateur) -- un vrai espace BLANC,
      // HORS de la zone colorée, est nécessaire ici, entre le bandeau et
      // ce qui suit (corps à 1 ou 2 colonnes, colorées ou non).
      enfantsTeteZone = enfantsTeteZone.concat([
        new Paragraph({ spacing: { after: 120, before: 0 }, children: [ new TextRun({ text: '', size: 2 }) ] })
      ]);
    }
    if (estProjetXXL && composition.colonnes === 1 && corpsColore1Colonne) { enfantsCorpsZone = envelopperZoneColoree(enfantsCorpsZone); }
    enfants = enfantsTeteZone.concat(enfantsCorpsZone);
  }

  // TACHE (chantier "10 nouveaux modeles Créatif", modele "Bandeau
  // vertical") : enveloppe l'INTEGRALITE du document deja construit
  // (quel que soit le nombre de colonnes internes -- jamais besoin de
  // toucher a cette logique) dans une table exterieure a 2 cellules :
  // une bande etroite avec le nom pivote (TextDirection, confirme
  // techniquement disponible dans cette version de docx.js) + une large
  // cellule contenant tout le reste. Meme technique EXACTE que
  // envelopperZoneColoree() plus haut (1 table, bordures neutres), juste
  // 2 cellules au lieu d'1. Dernier traitement avant la construction du
  // Document -- ne modifie jamais enfants avant ce point.
  if (estProjetXXL && theme.nomVertical) {
    var nomCompletVertical = ((identite.prenom || '') + ' ' + (identite.nom || '').toUpperCase()).trim();
    enfants = [ new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: AUCUNE_BORDURE_ZONE, bottom: AUCUNE_BORDURE_ZONE, left: AUCUNE_BORDURE_ZONE,
        right: AUCUNE_BORDURE_ZONE, insideHorizontal: AUCUNE_BORDURE_ZONE, insideVertical: AUCUNE_BORDURE_ZONE
      },
      rows: [ new TableRow({ children: [
        new TableCell({
          width: { size: 700, type: WidthType.DXA },
          shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: PRIMAIRE },
          verticalAlign: VerticalAlign.CENTER,
          textDirection: docx.TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT,
          children: [ new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: nomCompletVertical, bold: true, color: couleurLisibleFondColonnes, size: 30, font: theme.police.titres })
          ] }) ]
        }),
        new TableCell({ width: { size: 9800, type: WidthType.DXA }, children: enfants })
      ] }) ]
    }) ];
  }

  // TACHE (chantier "10 nouveaux modeles Créatif", modele "Cadre &
  // barre") : cadre plein autour de la page -- pgBorders, confirme
  // techniquement disponible avant de s'engager dessus (voir echange
  // avec l'utilisateur). Jamais applique si nomVertical est actif
  // au-dessus (aucun des 2 nouveaux modeles ne combine les 2, mais
  // l'ordre reste defensif : le cadre s'appliquerait sinon a la bande
  // verticale elle-meme plutot qu'a la vraie page).
  var bordurePageXXL;
  if (estProjetXXL && theme.cadrePage) {
    var _bordureCadre = { style: BorderStyle.SINGLE, size: 24, color: PRIMAIRE, space: 24 };
    bordurePageXXL = { pageBorderTop: _bordureCadre, pageBorderBottom: _bordureCadre, pageBorderLeft: _bordureCadre, pageBorderRight: _bordureCadre };
  }

  return new Document({
    background: fondPageEntiere,
    numbering: {
      config: [ { reference: refPuces, levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 260, hanging: 200 } } } }
      ] } ]
    },
    // TACHE ("le document fait 4 pages") : marges explicites -- absentes
    // avant (properties: {} vide), ce qui laissait docx.js appliquer ses
    // marges par defaut (nettement plus genereuses que celles des 16
    // modeles existants, deja a 560-720 twips). Memes valeurs que les
    // modeles generiques (exportDocxNatifCV.js), pour rester coherent.
    // TACHE (lot moteur "La mise en page", sous-lot 2 -- Marges de page) : le
    // reglage fin "Marges" pilote les 4 marges de section (etroites 400 /
    // normales 560 / larges 800). 560 = valeur d'origine, conservee quand le
    // reglage n'a pas ete touche (composition.margesTwips absent).
    sections: [ { properties: { page: { margin: (function () {
      var m = (composition && composition.margesTwips) || 560;
      return { top: m, bottom: m, left: m, right: m };
    })(), borders: bordurePageXXL } }, children: enfants } ]
  });
}

// TACHE (chantier tests) : export CommonJS protege -- n'existe que sous
// Node (node:test), aucun effet sur le chargement navigateur classique
// (balise <script>, ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = {
    _decouperMissions: _decouperMissions,
    _sansPonctuationFinale: _sansPonctuationFinale,
    _formaterPeriode: _formaterPeriode
  };
}
