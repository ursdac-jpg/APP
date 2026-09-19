/* ============================================================
   modules/carnet/index.js
   ------------------------------------------------------------
   Module « Carnet ». Espace de capture libre, entièrement possédé par
   la personne -- voir modules/carnet/ARCHITECTURE_TECHNIQUE.md (le
   comment) et docs/DOCTRINE_CARNET.md (le pourquoi/quoi, jamais
   dupliqué ici -- voir aussi docs/CHANTIER_CARNET.md pour la conception).

   RÈGLE STRICTE : ce module ne connaît rien de Regard extérieur, dans
   aucun sens (principe 2 de la doctrine). Sa seule dépendance métier
   externe est reperesCreerAvecTexte() (modules/reperes/index.js), pour
   la transformation volontaire d'une note en Repère.

   Étapes d'implémentation (détail complet dans
   modules/carnet/ARCHITECTURE_TECHNIQUE.md, "Étapes d'implémentation") :
   1. Point d'entrée minimal -- capture, liste, sans transformation.
   2. Modifier / supprimer une note.
   3. reperesCreerAvecTexte() côté Repères.
   4. Bouton "Transformer en Repère" côté Carnet.
   5. Icône positionnée dynamiquement, finitions (dont mobile).
   6. Double porte d'entrée révisée -- #btnCarnet ouvre un panneau
      compact SUR PLACE (#panneauCarnet, capture + aperçu des dernières
      notes + lien "Voir tout"), jamais une navigation directe ; seule la
      tuile Boîte à outils (ou le lien du panneau) mène à l'écran complet
      (pageCarnet()). Même principe que #btnJournalParcours/
      #panneauJournalParcours côté Repères -- voir docs/CHANTIER_CARNET.md,
      partie 5 bis (révisée).
   7. Validation centralisée (_carnetTexteValide()) contre les notes
      vides, à la création, l'édition et la transformation.
   Chaque étape vérifiée en navigateur avant la suivante. Module
   fonctionnellement stabilisé -- les prochaines évolutions devront être
   motivées par un usage réel observé, pas par une amélioration théorique.
   ============================================================ */

// ============================================================
// MODÈLE
// ============================================================

function _carnetGenererId() {
  return 'c' + Date.now() + Math.floor(Math.random() * 1000);
}

// Nombre de notes affichées dans le mini-panneau (voir _carnetRenduPanneau()).
// Bascule entre _CARNET_PANNEAU_NB_DEPART et min(10, total) via le bouton
// "Afficher plus"/"Afficher moins" -- jamais persisté, même mécanisme
// exact que _reperesJournalNombreAffiche (modules/reperes/index.js).
var _CARNET_PANNEAU_NB_DEPART = 3;
var _carnetPanneauNombreAffiche = _CARNET_PANNEAU_NB_DEPART;

// Date complète stockée directement, jamais recalculée depuis
// l'identifiant -- voir docs/CHANTIER_CARNET.md, partie 2 : leçon
// tirée du regard critique final de Regard extérieur (r.date, jj/mm
// seul, devenu ambigu après coup), jamais reproduite ici.
// TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : meme
// principe que _reperesExtraitPourTitre() (modules/reperes/index.js) --
// limite en nombre de MOTS (pas de caracteres), jamais un vrai resume
// (aucun assistant disponible localement). 4 mots suffisent pour rester
// reconnaissable dans une liste.
var _CARNET_TITRE_NB_MOTS = 4;
// TACHE (retour utilisateur, 2026-08-25) : jamais de "..." final -- une
// coupe nette a 4 mots suffit a signaler que ce n'est qu'un debut, la
// personne comprend qu'elle peut modifier le titre si besoin. Chaque mot
// est toujours pris en entier, jamais coupe en cours de mot (un mot plus
// long que les autres reste intact).
function _carnetExtraitPourTitre(texte) {
  var t = (texte || '').trim();
  if (!t) { return ''; }
  var mots = t.split(/\s+/);
  return mots.slice(0, _CARNET_TITRE_NB_MOTS).join(' ');
}

// `titre` auto-suggere des la creation (jamais un 2e champ a remplir a
// la capture -- le Carnet doit rester un geste unique, sans friction,
// voir la doctrine en tete de fichier). `titreModifieManuel` : des que
// la personne modifie ce titre elle-meme depuis la liste, il n'est plus
// jamais recalcule automatiquement -- meme regle que Repères.
function _carnetConstruire(texte) {
  return {
    id: _carnetGenererId(),
    horodatage: Date.now(),
    texte: texte,
    titre: _carnetExtraitPourTitre(texte),
    titreModifieManuel: false,
    dejaTransformeeEnRepere: false
  };
}

// ============================================================
// STOCKAGE
// ============================================================

function _carnetListe() {
  if (!dossier.carnet) { dossier.carnet = []; }
  return dossier.carnet;
}

function _carnetTrouver(id) {
  return _carnetListe().filter(function (n) { return n.id === id; })[0] || null;
}

// TACHE (idee E de docs/IDEES_A_RECLASSER.md, ajout Denis 2026-09-09) :
// filet d'annulation de la derniere suppression. La note supprimee et sa
// position d'origine sont gardees EN MEMOIRE ~10 s ; un bandeau discret
// « Note supprimee. Annuler » s'affiche en tete de liste. Passe ce delai,
// ou des qu'une nouvelle note est creee, ou des qu'une autre note est
// supprimee, le filet disparait et la suppression devient definitive.
// Ce n'est jamais une corbeille : rien n'est conserve au-dela de ces
// secondes, rien dans dossier.carnet.
var _carnetSuppressionRecente = null;   // { note, index } | null
var _carnetSuppressionMinuteur = null;
var _CARNET_ANNULATION_DELAI = 10000;

function _carnetSupprimer(id) {
  var liste = _carnetListe();
  var index = -1;
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { index = i; break; } }
  if (index === -1) { return; }
  var note = liste[index];
  dossier.carnet = liste.filter(function (n) { return n.id !== id; });
  // Un seul filet a la fois : une nouvelle suppression ecrase la
  // precedente, qui devient alors definitive.
  _carnetSuppressionRecente = { note: note, index: index };
  if (_carnetSuppressionMinuteur) { clearTimeout(_carnetSuppressionMinuteur); }
  _carnetSuppressionMinuteur = setTimeout(function () {
    _carnetSuppressionRecente = null;
    _carnetSuppressionMinuteur = null;
    _carnetApresModification();
  }, _CARNET_ANNULATION_DELAI);
}

function _carnetOublierAnnulation() {
  _carnetSuppressionRecente = null;
  if (_carnetSuppressionMinuteur) { clearTimeout(_carnetSuppressionMinuteur); _carnetSuppressionMinuteur = null; }
}

function _carnetAnnulerDerniereSuppression() {
  if (!_carnetSuppressionRecente) { return; }
  var liste = _carnetListe();
  var pos = Math.min(_carnetSuppressionRecente.index, liste.length);
  liste.splice(pos, 0, _carnetSuppressionRecente.note);
  _carnetOublierAnnulation();
  if (typeof trackEvenement === 'function') { trackEvenement('carnet_suppression_annulee'); }
  _carnetApresModification();
}

// Règle unique de validité d'un texte de note, réutilisée à chaque
// endroit où une note pourrait devenir vide -- création, édition,
// transformation (voir les 3 appels de cette fonction plus bas).
// Aucune validation de PERTINENCE (doctrine, principe 1) : seule
// l'absence pure et simple de contenu est refusée, jamais son contenu.
// Une seule fonction plutôt qu'une garde répétée à chaque appelant --
// demandé explicitement pour éviter toute divergence future entre les
// points d'application de cette règle.
function _carnetTexteValide(texte) {
  return !!(texte && texte.trim());
}

function _carnetCreer(texte) {
  if (!_carnetTexteValide(texte)) { return null; }
  var texteNettoye = texte.trim();
  var note = _carnetConstruire(texteNettoye);
  _carnetListe().unshift(note);
  // Un nouveau geste : le filet d'annulation d'une suppression precedente
  // n'a plus lieu d'etre (et sa position d'origine serait de toute facon
  // decalee par ce unshift).
  _carnetOublierAnnulation();
  if (typeof trackEvenement === 'function') { trackEvenement('carnet_note_creee'); }
  return note;
}

// ============================================================
// RENDU
// ============================================================

// TACHE (refonte visuelle 2026-09-09) : date en clair (« Gardee le 9
// septembre 2026 ») plutot que « jj/mm » brut -- plus lisible, leve
// l'ambiguite de l'annee. toLocaleDateString gere les mois francais ;
// repli manuel jj/mm/aaaa si l'environnement ne le supporte pas.
function _carnetDateAffichee(horodatage) {
  var d = new Date(horodatage);
  if (isNaN(d.getTime())) { return ''; }
  try {
    return 'Gardée le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    var jj = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return 'Gardée le ' + jj + '/' + mm + '/' + d.getFullYear();
  }
}

// TACHE (refonte visuelle 2026-09-09) : date relative courte pour le
// panneau compact (« aujourd'hui », « hier », « il y a 5 jours »). Jamais
// affichee sur l'ecran complet -- la ou la date exacte compte.
function _carnetDateRelative(horodatage) {
  var d = new Date(horodatage);
  if (isNaN(d.getTime())) { return ''; }
  var jours = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (jours <= 0) { return "aujourd'hui"; }
  if (jours === 1) { return 'hier'; }
  if (jours < 30) { return 'il y a ' + jours + ' jours'; }
  var mois = Math.floor(jours / 30);
  return mois <= 1 ? 'il y a 1 mois' : 'il y a ' + mois + ' mois';
}

// `idTextarea`/`idBouton` explicites, jamais codés en dur : l'écran
// complet ET le panneau compact (voir _carnetRenduPanneau()) rendent
// chacun leur propre zone de capture -- des identifiants distincts
// évitent une collision d'id si les deux sont présents dans le DOM en
// même temps (le panneau vit hors de #app, jamais détruit par un
// changement de page), même raisonnement que les deux pickers distincts
// de Repères (reperesPickerLibre / reperesPickerJournal).
// TACHE (refonte visuelle 2026-09-09) :
// - libelle « + Noter » (le verbe du carnet, aligne sur le placeholder
//   « Notez... » et l'etat vide) au lieu de « + Garder » ;
// - bouton petit, aligne a DROITE sous le champ (patron « champ de
//   message ») plutot que pleine largeur -- moins injonctif pour un geste
//   de capture leger. Cible tactile >= 44px conservee.
// Meme rendu des deux cotes (ecran complet ET panneau compact) : une seule
// fonction, identifiants distincts.
function _carnetRenduCapture(idTextarea, idBouton) {
  return '<div class="carnet-capture">' +
    '<textarea id="' + idTextarea + '" class="form-control" rows="3" ' +
    'placeholder="Notez tout ce qui vous semble utile, sans avoir à choisir quoi en faire tout de suite."></textarea>' +
    '<div class="carnet-capture-action">' +
      '<button type="button" id="' + idBouton + '" class="carnet-btn-noter">+ Noter</button>' +
    '</div>' +
    '</div>';
}

// TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : titre
// toujours affiche comme un champ modifiable (jamais un clic
// supplementaire pour le reveler -- il est court, contrairement au
// contenu). `|| _carnetExtraitPourTitre(n.texte)` : repli pour les
// notes creees avant l'introduction de ce champ (jamais de titre vide
// affiche a l'ecran).
// TACHE (refonte visuelle 2026-09-09) :
// - petite icone d'identite du module devant le champ titre ;
// - date en clair avec picto calendrier ;
// - « Deja transformee en Repere » en pastille dessinee (couleur Repere) ;
// - 3 boutons d'action « pleins doux » avec icone (Modifier = crayon,
//   Transformer = bi-bookmark-star l'icone de Repere, Supprimer = corbeille).
//   « Transformer en Repere » est en teinte violet Repere TANT QUE la note
//   n'est pas transformee ; une fois transformee, il repasse en neutre (comme
//   « Modifier ») -- jamais cache, jamais desactive (doctrine principe 4 :
//   la retransformation delibaree reste toujours possible).
function _carnetRenduItem(n) {
  var titreAffiche = n.titre || _carnetExtraitPourTitre(n.texte);
  var classeTransformer = n.dejaTransformeeEnRepere ? 'carnet-action-neutre' : 'carnet-action-repere';
  return '<div class="carnet-item" data-carnet-id="' + n.id + '">' +
    '<div class="carnet-item-titre-ligne">' +
      '<i class="bi bi-journal-text carnet-item-titre-ic" aria-hidden="true"></i>' +
      '<input type="text" class="carnet-item-titre" data-carnet-titre="' + n.id + '" ' +
        'value="' + echapperAttribut(titreAffiche) + '" aria-label="Titre de la note">' +
    '</div>' +
    '<div class="carnet-item-texte" data-carnet-texte-affiche="' + n.id + '">' + echapperAttribut(n.texte) + '</div>' +
    '<div class="carnet-item-meta">' +
      '<span class="carnet-date"><i class="bi bi-calendar3" aria-hidden="true"></i> ' + _carnetDateAffichee(n.horodatage) + '</span>' +
      (n.dejaTransformeeEnRepere ? '<span class="carnet-chip-transformee"><i class="bi bi-bookmark-star" aria-hidden="true"></i> Déjà transformée en Repère</span>' : '') +
    '</div>' +
    '<div class="carnet-item-actions">' +
      '<button type="button" class="carnet-action carnet-action-neutre" data-carnet-modifier="' + n.id + '"><i class="bi bi-pencil" aria-hidden="true"></i> Modifier</button>' +
      '<button type="button" class="carnet-action ' + classeTransformer + '" data-carnet-transformer="' + n.id + '"><i class="bi bi-bookmark-star" aria-hidden="true"></i> Transformer en Repère</button>' +
      '<button type="button" class="carnet-action carnet-action-danger" data-carnet-supprimer="' + n.id + '"><i class="bi bi-trash3" aria-hidden="true"></i> Supprimer</button>' +
    '</div>' +
    '</div>';
}

// TACHE (2026-09-09) : le filet d'annulation, s'il est actif, se rend en
// tete de liste (ecran complet uniquement -- la suppression n'existe que
// la). Il disparait de lui-meme au bout de _CARNET_ANNULATION_DELAI.
function _carnetRenduFiletAnnulation() {
  if (!_carnetSuppressionRecente) { return ''; }
  return '<div class="carnet-annuler-suppression">' +
      '<span><i class="bi bi-trash3" aria-hidden="true"></i> Note supprimée.</span>' +
      '<button type="button" class="carnet-annuler-suppression-btn" data-carnet-annuler-suppression>' +
        '<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Annuler</button>' +
    '</div>';
}

function _carnetRenduListe() {
  var tous = _carnetListe();
  var filet = _carnetRenduFiletAnnulation();
  if (!tous.length) {
    return filet + '<div class="carnet-etat-vide"><i class="bi bi-journal-text carnet-ic"></i>' +
      '<p>Votre carnet est vide pour l’instant. Notez-y ce que vous voulez, sans avoir à savoir tout de suite ce que vous en ferez.</p></div>';
  }
  return filet + tous.map(_carnetRenduItem).join('');
}

// TACHE (retour utilisateur : "Win + H, pour que les gens dictent a la
// place d'ecrire") : meme encart, meme texte, meme style que celui deja
// utilise pour la zone de recit libre de Decouverte des competences
// (modules/decouverte-competences/decouverteParcours.js) -- jamais
// invente ici, repris a l'identique pour rester coherent visuellement.
// Toujours visible (jamais replie derriere un "i"), meme choix que
// Decouverte : une capture rapide, sans decision immediate (doctrine,
// principe 1), doit voir cette astuce sans geste supplementaire.
// TACHE (retour utilisateur : "en mode noir ce message ne se voit pas") :
// fond/bordure/couleur du texte via variables CSS theme-aware.
// TACHE (refonte visuelle 2026-09-09) : styles sortis de l'inline vers la
// classe .carnet-astuce (encart resserre sur une ligne). Emphase reduite
// (retour Denis) : seul « Astuce : utilisez Windows + H » reste en gras,
// le reste de la phrase passe en graisse normale. La copie de Decouverte
// des competences (_carnetRenduAstuceDictee y a un jumeau) n'est PAS
// alignee ici -- decision Denis, chantier separe si besoin.
function _carnetRenduAstuceDictee() {
  return '<p class="carnet-astuce">' +
    '💡 <strong>Astuce : utilisez <span class="carnet-kbd">Windows + H</span></strong> ' +
    'pour dicter votre texte à la voix plutôt que de tout taper au clavier.' +
    '</p>';
}

// TACHE (generalisation du patron "page d'introduction de module",
// demande Denis 2026-08-31, d'apres docs/MAQUETTE_INTRO_CARNET.html et
// docs/LANGAGE_VISUEL_COMMUN.md) : page de presentation affichee a
// l'entree par la tuile Boite a outils (jamais depuis le panneau compact
// de l'icone persistante -- la personne y est deja). CTA "Ouvrir mon
// Carnet". Comportements de navigation du patron (LANGAGE_VISUEL_COMMUN
// 5bis) : "Retour" d'un ecran de travail repasse par cette page ; un
// bouton permanent "Revoir la presentation" y ramene depuis l'ecran.
function _carnetRenduIntro() {
  return '<div class="page-catalogue-contenu carnet-intro">' +
    // En detour depuis un ecran de travail : bouton partage qui revient
    // exactement la ou on etait (meme place / forme / libelle que partout).
    (_carnetIntroDetour && typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnCarnetRevenirModule', 'bi-journal-text', 'Revenir au module', true)
      : '') +
    // TACHE (refonte visuelle 2026-09-09) : le titre de l'intro est habille
    // en « couverture » de carnet (motif decoratif autour du vrai <h1>).
    '<div class="carnet-couverture carnet-couverture-intro" aria-hidden="false">' +
      '<span class="carnet-couverture-marge" aria-hidden="true"></span>' +
      '<span class="carnet-couverture-lignes" aria-hidden="true"></span>' +
      '<span class="carnet-couverture-signet" aria-hidden="true"></span>' +
      '<h1 class="carnet-couverture-h1"><i class="bi bi-journal-text"></i> Mon Carnet</h1>' +
    '</div>' +
    '<p class="sousTitre carnet-soustitre">Un espace entièrement à vous pour poser ce qui vous vient, sans décider tout de suite ce que vous en ferez.</p>' +

    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);text-align:center;">' +
    '<p class="mb-0"><strong>Rien à préparer, rien à réussir ici.</strong> Beaucoup de choses utiles nous viennent au mauvais moment, puis s’oublient. Le Carnet est l’endroit où vous les posez tout de suite, comme elles viennent.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#127919; À quoi ça sert</h4>' +
    '<p>Garder une trace de ce qui compte pour vous, sans avoir à savoir tout de suite ce que vous en ferez : une idée, un souvenir de travail, une phrase entendue, un numéro, une offre repérée, une chose à ne pas oublier.</p>' +
    '<p class="mb-0">Vous écrivez maintenant. Vous verrez plus tard ce que vous voulez en faire, ou rien du tout. Une note peut rester là aussi longtemps que vous voulez.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128203; Ce qui va se passer</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Vous écrivez ce que vous voulez, quand vous voulez, sans forme imposée et sans catégorie à choisir.</li>' +
    '<li>Chaque note vient s’ajouter à votre liste, la plus récente en haut.</li>' +
    '<li>Un titre court est proposé tout seul à partir de vos premiers mots ; vous pouvez le remplacer.</li>' +
    '<li>Vous pouvez relire, modifier ou supprimer une note à tout moment.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128683; Ce que ce module ne fait pas</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Il ne corrige pas l’orthographe et ne reformule rien.</li>' +
    '<li>Il ne note pas, ne classe pas, ne juge pas ce que vous écrivez.</li>' +
    '<li>Il ne lit jamais vos notes automatiquement : rien n’est analysé sans que vous le demandiez.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#9999;&#65039; Ce que vous pourrez faire ensuite</h4>' +
    '<ul class="mb-0" style="padding-left:1.25rem;">' +
    '<li>Retrouver toutes vos notes au même endroit, et repérer celles que vous avez déjà transformées en Repère.</li>' +
    '<li>Reprendre une note quand vous voulez, pour la compléter ou la corriger.</li>' +
    '<li>Transformer une note en Repère au moment où vous le décidez (voir juste en dessous).</li>' +
    '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);">' +
    '<h4><i class="bi bi-bookmark-star"></i> Mes Repères</h4>' +
    '<p class="mb-1">Quand une note vous semble compter vraiment pour votre parcours, le bouton « Transformer en Repère » en place une <strong>copie</strong> dans Mes Repères, avec vos autres réflexions. La note d’origine ne bouge pas : elle reste dans votre Carnet, telle quelle. Vous pouvez le faire quand vous voulez, autant de fois que vous voulez.</p>' +
    '<p class="mb-0 text-muted small">Le Carnet et Mes Repères restent deux espaces distincts : le Carnet garde tout, sans forme ; Mes Repères garde ce que vous avez déjà reconnu comme important, pour vous en servir.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#128172; Comment ça se passe concrètement</h4>' +
    '<p class="mb-2">Le Carnet est toujours à portée : une icône reste visible sur le côté de l’écran, quelle que soit la page où vous vous trouvez. Un clic ouvre un petit panneau, sans quitter ce que vous étiez en train de faire : vous notez, puis vous refermez. Le bouton « Voir tout mon Carnet » ouvre l’écran complet, avec toutes vos notes.</p>' +
    '<div class="cv-section" style="margin-bottom:0;background:var(--accent-bg-subtle);border-left:3px solid var(--accent);"><p class="mb-0 small">&#128161; Vous pouvez dicter votre note à la voix au lieu de la taper : appuyez en même temps sur <strong><span style="white-space:nowrap;">Windows + H</span></strong>.</p></div>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
    '<h4>&#9989; Bon à savoir</h4>' +
    '<div class="cv-section" style="margin-bottom:0.5rem;background:var(--accent-bg-subtle);border-left:3px solid var(--accent);"><p class="mb-0 small">&#128190; Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir écrit, sinon vos notes seront perdues à la fermeture de la page.</p></div>' +
    '<div class="cv-section" style="margin-bottom:0;background:var(--success-bg-subtle);border-left:3px solid var(--success);"><p class="mb-0 small">&#128274; Votre Carnet ne quitte jamais votre ordinateur. Rien n’est envoyé sur Internet, rien n’est stocké en ligne.</p></div>' +
    '</div>' +

    (typeof htmlEncartMultilingue === 'function' ? htmlEncartMultilingue(true) : '') +

    '<div class="text-center" style="margin-top:1.25rem;">' +
    (_carnetIntroDetour
      ? '<button type="button" id="btnCarnetIntroRevenir" class="btn btn-primary btn-lg">Revenir au module &#8594;</button>'
      : '<button type="button" id="btnCarnetIntroOuvrir" class="btn btn-primary btn-lg">Ouvrir mon Carnet &#8594;</button>') +
    '</div>' +
    '</div>' +
    // TACHE (retour Denis, 2026-08-31) : "Retour" de la presentation a froid
    // ramene au menu de la Boite a outils (la ou on a choisi le module),
    // jamais a l'accueil principal. En detour, "Retour" revient a l'ecran.
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null,
      { onclickPrecedent: (_carnetIntroDetour ? 'carnetRevenirDeLaPresentation()' : 'retourVersBoiteAOutils()') }) + '</div>';
}
function _carnetBrancherEvenementsIntro() {
  var btn = document.getElementById('btnCarnetIntroOuvrir');
  if (btn) {
    btn.addEventListener('click', function () {
      _carnetEcranIntro = false;
      pageCarnet();
    });
  }
  var btnRevenir = document.getElementById('btnCarnetIntroRevenir');
  if (btnRevenir) { btnRevenir.addEventListener('click', carnetRevenirDeLaPresentation); }
  var btnRevenirHaut = document.getElementById('btnCarnetRevenirModule');
  if (btnRevenirHaut) { btnRevenirHaut.addEventListener('click', carnetRevenirDeLaPresentation); }
}

// TACHE (refonte visuelle 2026-09-09) : petit motif decoratif « page de
// carnet » (lignes + marge + marque-page). Purement decoratif, aria-hidden.
// Teinte --accent : le module suit la couleur du site. `libelle` optionnel
// affiche dans le motif (ecran de travail) ; absent = motif nu, plus court.
function _carnetRenduCouverture(libelle) {
  return '<div class="carnet-couverture' + (libelle ? '' : ' carnet-couverture-nue') + '" aria-hidden="true">' +
    '<span class="carnet-couverture-marge"></span>' +
    '<span class="carnet-couverture-lignes"></span>' +
    '<span class="carnet-couverture-signet"></span>' +
    (libelle ? '<span class="carnet-couverture-titre">' + libelle + '</span>' : '') +
    '</div>';
}

function _carnetRenduEcran() {
  return '<div class="page-catalogue-contenu">' +
    // TACHE (chantier "bouton presentation", 2026-09-01) : bouton partage,
    // meme place / forme / libelle que tous les modules -- seule l'icone
    // (logo du module) change.
    (typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnCarnetRevoirIntro', 'bi-journal-text', 'Revoir la présentation')
      : '') +
    '<div class="carnet-entete-ecran"><h1><i class="bi bi-journal-text"></i> Mon Carnet</h1></div>' +
    '<p class="sousTitre carnet-soustitre">Un espace entièrement à vous, jamais lu ni analysé automatiquement.</p>' +
    _carnetRenduCouverture('vos notes, comme elles viennent') +
    // TACHE (refonte 2026-09-09) : ligne calme, sans aucun compteur
    // (doctrine principe 6 : jamais montrer le Carnet comme un espace « a
    // vider »). Rappelle juste ce qu'est l'espace.
    '<p class="carnet-ligne-calme">Vos notes sont gardées ici aussi longtemps que vous voulez. Rien à trier, rien à finir.</p>' +
    _carnetRenduAstuceDictee() +
    _carnetRenduCapture('carnetTexteNouveau', 'btnCarnetGarder') +
    '<div id="carnetListeConteneur">' + _carnetRenduListe() + '</div>' +
    '</div>' +
    // TACHE (patron, LANGAGE_VISUEL_COMMUN 5bis) : "Retour" repasse par la
    // presentation du module, jamais droit a l'accueil. TACHE (correctif
    // boucle, 2026-09-09) : carnetRetour() = presentation en mode NORMAL
    // (pas detour), pour que son "Retour" continue ensuite vers la Boite a
    // outils. carnetRevoirPresentation() (detour) reste sur le seul bouton
    // "Revoir la presentation" (cable dans pageCarnet()).
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: 'carnetRetour()' }) + '</div>';
}

// ---- Panneau compact (icône persistante) ----
// Aperçu allégé des `n` notes les plus récentes -- volontairement
// distinct de _carnetRenduItem() : pas d'action (modifier/transformer/
// supprimer), seulement de quoi confirmer visuellement ce qui vient
// d'être gardé, même principe que _reperesRenduApercuDerniers()
// (modules/reperes/index.js).
// TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : affiche
// desormais le titre (4 mots max, voir _carnetExtraitPourTitre()) plutot
// qu'un extrait brut de 70 caracteres -- meme principe que
// _reperesRenduApercuDerniers() (modules/reperes/index.js). Repli pour
// les notes creees avant l'introduction de ce champ.
// TACHE (retour utilisateur, 2026-08-25) : chaque aperçu est desormais un
// vrai bouton cliquable (jamais une div, voir la regle "toujours un vrai
// bouton" de docs/LECONS_A_NE_PAS_REPRODUIRE.md) -- ouvre le contenu
// complet de la note dans une fenetre ERIP (voir _carnetOuvrirDetail()).
// TACHE (refonte visuelle 2026-09-09) : chaque apercu affiche le titre
// complet + une date relative discrete (« il y a 5 jours ») a droite --
// jamais tronque a 4 mots ici (c'etait la cause de l'effet « phrase
// coupee » de l'ancien « Derniere note : ... »).
function _carnetRenduApercuDerniers(n) {
  return _carnetListe().slice(0, n).map(function (note) {
    var titre = note.titre || _carnetExtraitPourTitre(note.texte);
    return '<button type="button" class="carnet-apercu-item" data-carnet-apercu-id="' + note.id + '">' +
      '<span class="carnet-apercu-titre">' + echapperAttribut(titre) + '</span>' +
      '<span class="carnet-apercu-quand">' + _carnetDateRelative(note.horodatage) + '</span>' +
      '</button>';
  }).join('');
}

// Ouvre le contenu complet d'une note (titre + texte) dans une fenêtre
// ERIP. Titre toujours directement modifiable. Texte affiché en lecture
// seule avec un bouton -- même mécanisme et même bouton exact que
// _reperesOuvrirDetail() (modules/reperes/index.js, retour utilisateur
// 2026-08-25 : "je veux le même comportement des deux côtés") : le
// bouton "Modifier" ne disparaît jamais au clic -- il fait apparaître le
// texte modifiable et devient lui-même soit "Annuler" (aucun changement
// tapé pour l'instant -- rien à perdre, ferme simplement) soit "Valider"
// (un changement a été tapé -- confirme et ferme), selon la valeur
// actuelle comparée à la valeur de départ. Jamais de disparition
// silencieuse du bouton : philosophie du site, la croix se débarrasse
// sans engagement, ce bouton engage toujours une décision claire.
function _carnetOuvrirDetail(id) {
  var n = _carnetTrouver(id);
  if (!n || typeof ouvrirFenetreERIP !== 'function') { return; }
  var titreAffiche = n.titre || _carnetExtraitPourTitre(n.texte);
  var overlay = ouvrirFenetreERIP({
    titre: '<i class="bi bi-journal-text"></i> Note du Carnet',
    contenuHTML:
      '<label class="carnet-detail-label" for="carnetDetailTitre">Titre</label>' +
      '<input type="text" class="carnet-detail-champ-titre" id="carnetDetailTitre" value="' +
        echapperAttribut(titreAffiche) + '" aria-label="Titre de la note">' +
      '<label class="carnet-detail-label" for="carnetDetailTexteAffiche">Contenu</label>' +
      '<div class="carnet-detail-corps" id="carnetDetailTexteAffiche">' + echapperAttribut(n.texte) + '</div>' +
      '<div class="mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" id="carnetDetailModifier">Modifier</button></div>'
  });
  if (!overlay) { return; }
  var champTitre = overlay.querySelector('#carnetDetailTitre');
  if (champTitre) {
    champTitre.addEventListener('input', function () {
      var note = _carnetTrouver(id);
      if (!note) { return; }
      note.titreModifieManuel = true;
      note.titre = champTitre.value;
      _carnetApresModification();
    });
  }
  var boutonAction = overlay.querySelector('#carnetDetailModifier');
  if (boutonAction) {
    boutonAction.addEventListener('click', function () {
      if (boutonAction.textContent.trim() !== 'Modifier') {
        // TACHE : "Valider" et "Annuler" font tous deux la même chose ici
        // (fermer) -- rien à annuler pour de vrai, le texte est déjà
        // enregistré au fil de la frappe (même convention partout
        // ailleurs dans l'app : jamais un bouton qui laisse croire que
        // rien n'est sauvegardé avant d'y cliquer). Umami uniquement si
        // un vrai changement a eu lieu (label passé à "Valider").
        if (boutonAction.textContent.trim() === 'Valider' && typeof trackEvenement === 'function') {
          trackEvenement('carnet_note_modifiee');
        }
        _carnetApresModification();
        if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
        return;
      }
      var affichage = overlay.querySelector('#carnetDetailTexteAffiche');
      var note = _carnetTrouver(id);
      if (!note || !affichage) { return; }
      var valeurDepart = note.texte;
      var champ = document.createElement('textarea');
      champ.className = 'form-control carnet-detail-corps';
      champ.value = note.texte;
      champ.addEventListener('input', function () {
        var noteActuelle = _carnetTrouver(id);
        if (noteActuelle && _carnetTexteValide(champ.value)) { noteActuelle.texte = champ.value; }
        if (noteActuelle && !noteActuelle.titreModifieManuel) {
          var suggestion = _carnetExtraitPourTitre(champ.value);
          noteActuelle.titre = suggestion;
          if (champTitre) { champTitre.value = suggestion; }
        }
        boutonAction.textContent = champ.value === valeurDepart ? 'Annuler' : 'Valider';
      });
      affichage.replaceWith(champ);
      champ.focus();
      boutonAction.textContent = 'Annuler';
    });
  }
}

// Contenu du panneau ouvert depuis #btnCarnet -- reste sur la page
// courante (voir doctrine, principe 7 révisé : deux chemins, deux vues
// différentes d'un même espace, jamais deux espaces). Capture toujours
// possible même sans aucune note existante ; l'aperçu ne s'affiche que
// s'il y a déjà quelque chose à montrer.
function _carnetRenduPanneau() {
  var tous = _carnetListe();
  return '<div class="carnet-panneau-entete">' +
      '<h6><i class="bi bi-journal-text"></i> Carnet</h6>' +
      // TACHE (retour utilisateur : "la petite croix pour fermer... si la
      // personne change d'avis et ne veut rien marquer") : jusqu'ici, seul
      // un second clic sur #btnCarnet refermait le panneau -- geste peu
      // évident une fois qu'on a déjà le regard sur le panneau lui-même,
      // pas sur l'icône. Même glyphe que la croix des fenêtres ERIP
      // (&#10005;, ouvrirFenetreERIP()), pour rester cohérent.
      '<button type="button" class="carnet-panneau-fermer" data-carnet-fermer-panneau aria-label="Fermer" title="Fermer">&#10005;</button>' +
    '</div>' +
    _carnetRenduAstuceDictee() +
    _carnetRenduCapture('carnetTexteNouveauPanneau', 'btnCarnetGarderPanneau') +
    (tous.length
      ? '<p class="carnet-panneau-dernier">Dernière note : <strong>' +
          echapperAttribut(tous[0].titre || _carnetExtraitPourTitre(tous[0].texte)) +
          '</strong> &middot; ' + _carnetDateRelative(tous[0].horodatage) + '</p>' +
        _carnetRenduApercuDerniers(_carnetPanneauNombreAffiche) +
        // TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : un
        // seul bouton qui bascule entre "Afficher plus" (3 -> 10) et
        // "Afficher moins" (retour a 3) -- meme mecanisme exact que
        // data-repere-basculer-historique (modules/reperes/index.js).
        (tous.length > _CARNET_PANNEAU_NB_DEPART
          ? '<button type="button" class="btn btn-outline-secondary btn-sm w-100 mt-2" data-carnet-basculer-historique>' +
            (_carnetPanneauNombreAffiche > _CARNET_PANNEAU_NB_DEPART ? 'Afficher moins' : 'Afficher plus') + '</button>'
          : '')
      // TACHE (refonte 2026-09-09) : etat vide du panneau -- une ligne calme
      // plutot que rien (l'ancien panneau ne montrait aucun texte a 0 note).
      : '<p class="carnet-panneau-vide">Rien encore. Notez ce qui vous vient, ci-dessus.</p>') +
    // TACHE (retour utilisateur : "je veux que le bouton voir tout mon
    // carnet soit un bouton cliquable") : classes Bootstrap identiques à
    // « + Garder » ci-dessus (mais outline, pour rester secondaire par
    // rapport à la capture, l'action première de ce panneau), plutôt
    // qu'un lien texte -- l'ancien style ne se distinguait pas assez d'un
    // simple texte pour donner envie de cliquer.
    '<button type="button" class="btn btn-outline-primary btn-sm w-100 mt-3" data-carnet-voir-tout>Voir tout mon Carnet &#8594;</button>';
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================

function _carnetRafraichirListe() {
  var conteneur = document.getElementById('carnetListeConteneur');
  if (!conteneur) { return; }
  conteneur.innerHTML = _carnetRenduListe();
  _carnetBrancherEvenementsListe();
}

// Reconstruit le panneau compact s'il est actuellement affiché --
// jamais s'il est masqué : inutile de recalculer un contenu que
// personne ne regarde, et évite de rouvrir silencieusement un panneau
// que la personne avait fermé.
function _carnetRafraichirPanneau() {
  var panneau = document.getElementById('panneauCarnet');
  if (!panneau || panneau.hidden) { return; }
  panneau.innerHTML = _carnetRenduPanneau();
  _carnetBrancherEvenementsPanneau();
}

// Point d'appel unique après toute création/modification/suppression/
// transformation, quel que soit l'endroit d'où le geste vient (écran
// complet ou panneau) -- les deux peuvent être présents dans le DOM en
// même temps (le panneau vit hors de #app), donc les deux doivent
// rester synchronisés, jamais un seul rafraîchi au hasard de l'origine
// du geste.
function _carnetApresModification() {
  _carnetRafraichirListe();
  _carnetRafraichirPanneau();
}

// Écouteurs propres à la liste (étape 2) -- modifier, supprimer. Toujours
// re-bindés après _carnetRafraichirListe() puisque le conteneur est
// entièrement remplacé, même patron que _reperesBrancherEvenementsListe().
function _carnetBrancherEvenementsListe() {
  // TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : des que
  // la personne ecrit elle-meme dans ce champ (meme un seul caractere),
  // le titre ne sera plus jamais recalcule automatiquement pour cette
  // note -- meme regle exacte que le champ titre de Repères.
  document.querySelectorAll('[data-carnet-titre]').forEach(function (champ) {
    champ.addEventListener('input', function () {
      var id = champ.getAttribute('data-carnet-titre');
      var note = _carnetTrouver(id);
      if (!note) { return; }
      note.titreModifieManuel = true;
      note.titre = champ.value;
    });
  });
  document.querySelectorAll('[data-carnet-modifier]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-carnet-modifier');
      var n = _carnetTrouver(id);
      var affichage = document.querySelector('[data-carnet-texte-affiche="' + id + '"]');
      if (!n || !affichage) { return; }
      var champ = document.createElement('textarea');
      champ.className = 'form-control';
      champ.setAttribute('data-carnet-texte', id);
      champ.value = n.texte;
      // TACHE (tracking Umami) : capture la valeur de départ pour ne
      // tracker une modification que si le contenu a réellement changé --
      // ouvrir "Modifier" puis ne rien taper n'est pas une modification.
      var texteInitial = n.texte;
      // N'enregistre que si le contenu reste valide -- même règle qu'à la
      // création (_carnetTexteValide()). Si la personne vide entièrement
      // le champ, la valeur enregistrée n'est PAS écrasée par du vide :
      // elle reste ce qu'elle était, jusqu'à ce qu'un contenu valide soit
      // retapé. Une note qu'on veut réellement faire disparaître passe
      // par « Supprimer », un geste explicite et déjà confirmé -- jamais
      // par un vidage silencieux du champ.
      // TACHE (retour utilisateur, 2026-08-25, parite avec Repères) : tant
      // que la personne n'a pas modifie le titre elle-meme, il continue a
      // se recalculer depuis le contenu -- meme regle exacte que le champ
      // titre de Repères (voir _reperesRenduPicker(), modules/reperes/index.js).
      // Mise a jour directe du champ titre (jamais un re-rendu complet de
      // l'item, qui ferait perdre le focus/curseur de CE champ-ci).
      var champTitre = document.querySelector('[data-carnet-titre="' + id + '"]');
      champ.addEventListener('input', function () {
        var note = _carnetTrouver(id);
        if (note && _carnetTexteValide(champ.value)) { note.texte = champ.value; }
        if (note && !note.titreModifieManuel) {
          var suggestion = _carnetExtraitPourTitre(champ.value);
          note.titre = suggestion;
          if (champTitre) { champTitre.value = suggestion; }
        }
      });
      // TACHE (tracking Umami) : au blur plutôt qu'à chaque frappe -- même
      // raisonnement que le collage en plusieurs morceaux de Regard
      // extérieur (docs/TESTS_REGARD_EXTERIEUR.md) : un événement par
      // geste d'édition complet, jamais un par caractère tapé. Contenu de
      // la note jamais envoyé, seul le fait qu'elle ait changé l'est.
      champ.addEventListener('blur', function () {
        var note = _carnetTrouver(id);
        if (note && note.texte !== texteInitial && typeof trackEvenement === 'function') {
          trackEvenement('carnet_note_modifiee');
        }
      });
      affichage.replaceWith(champ);
      champ.focus();
    });
  });
  document.querySelectorAll('[data-carnet-transformer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-carnet-transformer');
      var n = _carnetTrouver(id);
      // Garde défensive : ne devrait jamais se produire tant que la garde
      // d'édition ci-dessus tient (une note existante ne peut déjà plus
      // devenir vide), mais vérifiée ici aussi -- même fonction, même
      // règle, jamais une logique dupliquée pour ce cas précis.
      if (!n || !_carnetTexteValide(n.texte) || typeof reperesCreerAvecTexte !== 'function') { return; }
      // TACHE (tracking Umami, "passerelle vers Repères") : capturé AVANT
      // l'appel -- dejaTransformeeEnRepere reflète encore l'état d'avant
      // cette transformation précise, seul moment où "est-ce la 1ère
      // fois ?" peut se lire sans recalcul. Longueur arrondie à la
      // dizaine de caractères (même convention que Regard extérieur,
      // _regardExterieurRenduReponse()) : une mesure statistique, jamais
      // une empreinte du texte. Délai calculé uniquement pour une
      // première transformation -- au-delà, "temps depuis la création"
      // ne mesure plus la même chose (une note relue puis retransformée
      // des mois plus tard ne dit rien d'utile sur un délai de décision).
      var premiereTransformation = !n.dejaTransformeeEnRepere;
      var proprietesTransformation = {
        premiereTransformation: premiereTransformation,
        longueur: Math.round(n.texte.length / 50) * 50
      };
      if (premiereTransformation) {
        proprietesTransformation.delaiSecondes = Math.round((Date.now() - n.horodatage) / 1000);
      }
      reperesCreerAvecTexte(n.texte, function () {
        var noteActuelle = _carnetTrouver(id);
        if (!noteActuelle) { return; }
        noteActuelle.dejaTransformeeEnRepere = true;
        if (typeof trackEvenement === 'function') { trackEvenement('carnet_note_transformee', proprietesTransformation); }
        _carnetApresModification();
      });
    });
  });
  document.querySelectorAll('[data-carnet-supprimer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-carnet-supprimer');
      confirmerAction(
        'Supprimer cette note ?',
        'Elle disparaît de votre liste. Vous aurez quelques secondes pour annuler.',
        'Supprimer', 'btn-danger',
        function () {
          _carnetSupprimer(id);
          if (typeof trackEvenement === 'function') { trackEvenement('carnet_note_supprimee'); }
          _carnetApresModification();
        }
      );
    });
  });
  var btnAnnulerSuppression = document.querySelector('[data-carnet-annuler-suppression]');
  if (btnAnnulerSuppression) {
    btnAnnulerSuppression.addEventListener('click', _carnetAnnulerDerniereSuppression);
  }
}

function _carnetBrancherEvenementsEcran() {
  var boutonGarder = document.getElementById('btnCarnetGarder');
  var texteArea = document.getElementById('carnetTexteNouveau');
  if (boutonGarder && texteArea) {
    boutonGarder.addEventListener('click', function () {
      var note = _carnetCreer(texteArea.value);
      if (!note) { return; }
      texteArea.value = '';
      _carnetApresModification();
      _carnetDeclencherPulseIcone();
    });
  }
  _carnetBrancherEvenementsListe();
}

// Écouteurs du panneau compact -- capture directe (même geste que
// l'écran complet, identifiants distincts) et lien vers l'écran complet.
// Toujours re-bindés après (re)rendu du panneau, contenu entièrement
// remplacé à chaque fois (même patron que le reste du module).
function _carnetBrancherEvenementsPanneau() {
  var boutonGarder = document.getElementById('btnCarnetGarderPanneau');
  var texteArea = document.getElementById('carnetTexteNouveauPanneau');
  if (boutonGarder && texteArea) {
    boutonGarder.addEventListener('click', function () {
      var note = _carnetCreer(texteArea.value);
      if (!note) { return; }
      texteArea.value = '';
      _carnetApresModification();
      _carnetDeclencherPulseIcone();
    });
  }
  var lienTout = document.querySelector('[data-carnet-voir-tout]');
  if (lienTout) {
    lienTout.addEventListener('click', function () {
      document.getElementById('panneauCarnet').hidden = true;
      // La personne est deja dans le module -- on saute la presentation.
      carnetDemarrer({ sauterIntro: true });
    });
  }
  // TACHE (retour utilisateur) : ferme sans rien enregistrer -- un brouillon
  // non gardé disparaît simplement (rien n'est stocké tant que "+ Garder"
  // n'a pas été cliqué), aucun état particulier à nettoyer ici.
  var boutonFermer = document.querySelector('[data-carnet-fermer-panneau]');
  if (boutonFermer) {
    boutonFermer.addEventListener('click', function () {
      document.getElementById('panneauCarnet').hidden = true;
    });
  }
  var boutonBasculer = document.querySelector('[data-carnet-basculer-historique]');
  if (boutonBasculer) {
    boutonBasculer.addEventListener('click', function () {
      _carnetPanneauNombreAffiche = _carnetPanneauNombreAffiche > _CARNET_PANNEAU_NB_DEPART
        ? _CARNET_PANNEAU_NB_DEPART
        : Math.min(10, _carnetListe().length);
      _carnetRafraichirPanneau();
    });
  }
  document.querySelectorAll('[data-carnet-apercu-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _carnetOuvrirDetail(btn.getAttribute('data-carnet-apercu-id'));
    });
  });
}

// Réaction brève à un geste que la personne vient de faire, jamais une
// sollicitation initiée par le module -- même mécanisme que
// _reperesDeclencherPulseJournal() (modules/reperes/index.js), même
// justification (doctrine, principe 6 : la confirmation n'est pas
// interdite, seule la sollicitation l'est).
function _carnetDeclencherPulseIcone() {
  var bouton = document.getElementById('btnCarnet');
  if (!bouton) { return; }
  bouton.classList.remove('carnet-pulse-confirmation');
  void bouton.offsetWidth;
  bouton.classList.add('carnet-pulse-confirmation');
  setTimeout(function () { bouton.classList.remove('carnet-pulse-confirmation'); }, 10000);
}

// ============================================================
// FAÇADE PUBLIQUE
// ============================================================

// TACHE (patron page d'introduction, 2026-08-31) : true = afficher la page
// de presentation du module au lieu de l'ecran de travail. Pose par
// carnetDemarrer() (entree par la tuile Boite a outils), efface par le CTA
// "Ouvrir mon Carnet" et par l'entree via le panneau compact ("Voir tout",
// la personne est deja dans le module).
var _carnetEcranIntro = false;

function pageCarnet() {
  if (_carnetEcranIntro) {
    app.innerHTML = _carnetRenduIntro();
    _carnetBrancherEvenementsIntro();
    if (typeof trackEvenement === 'function') { trackEvenement('carnet_intro_affichee'); }
    return;
  }
  app.innerHTML = _carnetRenduEcran();
  _carnetBrancherEvenementsEcran();
  var btnRevoir = document.getElementById('btnCarnetRevoirIntro');
  if (btnRevoir) { btnRevoir.addEventListener('click', carnetRevoirPresentation); }
  if (typeof trackEvenement === 'function') { trackEvenement('carnet_ecran_ouvert'); }
}

// "Retour" d'un ecran de travail et bouton permanent "Revoir la
// presentation" -- ramenent a la page de presentation du module (jamais
// droit a l'accueil). C'est le "Retour" de la presentation qui va a
// l'origine (voir la barre de _carnetRenduIntro()).
// TACHE (chantier "bouton presentation", 2026-09-01, propagation depuis
// Coherence) : _carnetIntroDetour distingue la presentation vue EN DETOUR
// (depuis un ecran de travail : bouton "Revenir au module", "Retour" et
// CTA reviennent a l'ecran) de la presentation vue a froid (1re entree :
// CTA "Ouvrir mon Carnet", "Retour" vers la Boite a outils).
var _carnetIntroDetour = false;
// TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
// "Variante boucle infinie"). "Retour" de la barre du bas de l'ecran de
// travail : ouvre la presentation en mode NORMAL (jamais detour), dont le
// propre "Retour" enchaine ensuite vers la Boite a outils (voir la barre
// de _carnetRenduIntro()). AVANT ce correctif, "Retour" appelait
// carnetRevoirPresentation() (detour) dont le "Retour" revenait a l'ecran
// de travail -> les deux boutons se pointaient l'un l'autre, plus aucun
// moyen de reculer jusqu'a l'accueil.
function carnetRetour() {
  _carnetEcranIntro = true;
  _carnetIntroDetour = false;
  naviguerVers('carnet');
}
// Reserve au SEUL bouton "Revoir la presentation" (detour de consultation).
function carnetRevoirPresentation() {
  _carnetEcranIntro = true;
  _carnetIntroDetour = true;
  naviguerVers('carnet');
}
function carnetRevenirDeLaPresentation() {
  _carnetEcranIntro = false;
  _carnetIntroDetour = false;
  naviguerVers('carnet');
}

// Capture la page d'origine avant de naviguer, même patron que
// reperesDemarrer() -- pour que "Retour" ramène là d'où on vient, quel
// que soit le point d'entrée (tuile ou lien "Voir tout" du panneau).
// Garde défensive : ne capture PAS 'carnet' comme origine de lui-même --
// sans elle, ouvrir le panneau depuis l'écran complet puis cliquer
// "Voir tout mon Carnet" écraserait la vraie origine, rendant "Retour"
// inopérant (bug réel trouvé lorsque l'icône naviguait encore
// directement, avant l'introduction du panneau compact ci-dessous).
var _carnetPageOrigine = null;

// options.sauterIntro : true quand la personne est deja dans le module
// (lien "Voir tout mon Carnet" du panneau compact) -- on va droit a
// l'ecran de travail. Depuis la tuile Boite a outils (defaut), on passe
// d'abord par la page de presentation.
function carnetDemarrer(options) {
  if (typeof pageActuelle !== 'undefined' && pageActuelle !== 'carnet') {
    _carnetPageOrigine = pageActuelle;
  }
  _carnetEcranIntro = !(options && options.sauterIntro);
  _carnetIntroDetour = false;
  naviguerVers('carnet');
}

// Positionne #panneauCarnet juste sous #btnCarnet -- mesuré au moment de
// l'ouverture plutôt qu'une valeur fixe en CSS (voir positionnerIconePersistante(),
// js/app.js, même raisonnement) : le bouton lui-même est déjà repositionné
// dynamiquement par page, un décalage figé pour le panneau se
// désynchroniserait de lui sur au moins une partie des pages.
function _carnetPositionnerPanneau() {
  var bouton = document.getElementById('btnCarnet');
  var panneau = document.getElementById('panneauCarnet');
  if (!bouton || !panneau) { return; }
  var rect = bouton.getBoundingClientRect();
  panneau.style.top = (rect.bottom + 10) + 'px';
}

// Appelée par naviguerVers() (js/app.js) après chaque navigation, même
// patron que regardExterieurApresNavigation()/reperesApresNavigation().
// Referme le panneau au passage : un panneau resté ouvert d'une page à
// l'autre se retrouverait mal positionné (mesuré pour l'ancienne page)
// et n'a de toute façon plus de sens une fois la page changée.
// TACHE (retour utilisateur, 2026-08-25) : reference #btnAide, jamais
// #btnJournalParcours -- #btnCarnet doit rester la premiere icone de la
// colonne (toujours visible), #btnJournalParcours vient se placer sous
// elle (voir _reperesPositionnerBoutonJournal(), modules/reperes/index.js).
function carnetApresNavigation() {
  var panneau = document.getElementById('panneauCarnet');
  if (panneau) { panneau.hidden = true; }
  if (typeof positionnerIconePersistante === 'function') {
    positionnerIconePersistante('btnCarnet', 'btnAide');
  }
}

// Appelée une seule fois au chargement (DOMContentLoaded, js/app.js).
// Garantit que dossier.carnet existe, branche le clic de l'icône
// persistante -- jamais masquée (docs/CHANTIER_CARNET.md, partie 5),
// contrairement à #btnJournalParcours. Clic = ouvre/ferme un panneau
// compact SUR PLACE (même geste que les icônes préférences/session/aide),
// jamais une navigation directe -- décision révisée du chantier (voir
// docs/CHANTIER_CARNET.md, partie 5 bis) : le premier essai (icône =
// navigation directe vers l'écran complet, identique à la tuile) cassait
// la position de lecture de la personne à chaque clic, et pouvait même
// corrompre la page de retour (voir garde défensive de carnetDemarrer()
// ci-dessus) si l'icône était cliquée deux fois de suite.
function carnetInitialiser() {
  _carnetListe();
  var bouton = document.getElementById('btnCarnet');
  var panneau = document.getElementById('panneauCarnet');
  if (bouton && panneau) {
    bouton.addEventListener('click', function () {
      var ouvrir = panneau.hidden;
      panneau.hidden = !ouvrir;
      if (ouvrir) {
        panneau.innerHTML = _carnetRenduPanneau();
        _carnetBrancherEvenementsPanneau();
        _carnetPositionnerPanneau();
        if (typeof trackEvenement === 'function') { trackEvenement('carnet_panneau_ouvert'); }
      }
    });
  }
}

// Export CommonJS protege -- tests/carnetLogique.test.js (Node), aucun
// effet sur le chargement navigateur classique (balise <script>, ou
// `module` n'est jamais defini). Logique PURE seulement (aucun DOM).
if (typeof module !== 'undefined') {
  module.exports = {
    _carnetExtraitPourTitre: _carnetExtraitPourTitre,
    _carnetConstruire: _carnetConstruire,
    _carnetTexteValide: _carnetTexteValide,
    _carnetDateRelative: _carnetDateRelative
  };
}
