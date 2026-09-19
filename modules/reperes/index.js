/* ============================================================
   modules/reperes/index.js
   ------------------------------------------------------------
   Module « Repères ». Point d'entrée unique et orchestrateur pur du
   module, au même titre que decouverteMoteur.js pour la Découverte des
   compétences -- jamais modules/bilan-candidature/, qui a délibérément
   laissé tout son rendu dans js/app.js (voir
   docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md, "à ne pas reproduire").

   RÈGLE STRICTE : ce module ne connaît RIEN de la structure interne
   d'un autre module d'ERIP (jamais une Recommandation, un Axe, un
   Diagnostic). Tout geste ancré reçoit un contrat de source déjà
   standardisé, `{ libelle }`, construit par le module d'origine
   lui-même. Protocole complet : docs/CONTRAT_ANCRAGE_ERIP.md.

   RÈGLE DE FAÇADE (posée après l'étape 2) : aucune fonction publique
   "au cas où" -- une fonction n'est exposée que lorsqu'un appel réel,
   provenant de l'extérieur du module, existe déjà. Tant qu'un tel
   appel n'existe pas, la fonction reste privée (préfixe `_reperes`),
   même si ARCHITECTURE_TECHNIQUE.md l'anticipe dans le contrat cible.

   Chaque fonction ci-dessous est rangée sous 5 catégories (modèle,
   stockage, rendu, événements, façade), à la demande explicite de
   Denis. Les hésitations de classement sont documentées dans
   docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md plutôt que masquées.

   Statut : V1 fonctionnelle complète (étapes 1 à 7). Le protocole du
   geste ancré (contrat de source, responsabilités, niveau de couplage
   retenu et figé) vit dans docs/CONTRAT_ANCRAGE_ERIP.md, pas ici --
   ce fichier n'en est que la mise en œuvre côté Repères. Hors scope V1 :
   ancrage depuis un mot du lexique ou un axe (voir ARCHITECTURE_TECHNIQUE.md).
   ============================================================ */

// ============================================================
// MODÈLE
// ============================================================

// Taxonomie figée, voir docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md --
// jamais de 5e type. Le texte libre à la création (titre + description)
// a été introduit après un test utilisateur réel : un Repère qui ne
// capture que le type restait trop souvent vide, faute de retour de la
// personne pour le compléter. Décision assumée (voir carnet technique) :
// ne s'applique qu'au geste LIBRE (créé directement depuis l'écran
// Repères ou le panneau Journal), jamais au geste ANCRÉ (déclenché
// depuis un autre module, ex. Lexique) -- celui-ci reste un geste unique
// et silencieux, pour ne jamais interrompre la lecture en cours ailleurs
// dans ERIP. Le champ reste toujours facultatif et sauvegardé en direct,
// jamais bloquant : le Repère existe déjà, complet et valide, dès le
// choix du type.
// TACHE (retour utilisateur, 2026-08-25) : `description` ajoutee -- les 4
// categories restaient peu claires sans explication (juste une icone +
// un mot), affichee en petit sous chaque carte du picker
// (_reperesRenduPicker()). Formulations reprises des propres mots de
// Denis, jamais inventees.
var _REPERES_TYPES = {
  question: { icone: '&#128204;', libelle: 'Question', description: 'Une question à poser à un professionnel, un CIP, un assistant... ou à vous-même.' },
  idee: { icone: '&#128161;', libelle: 'Idée', description: 'Une idée liée à votre recherche d\'emploi, une reconversion, ou au monde professionnel.' },
  approfondir: { icone: '&#128269;', libelle: 'À approfondir', description: 'Un sujet à mieux comprendre : une fiche de paie, une posture professionnelle...' },
  discuter: { icone: '&#128172;', libelle: 'À discuter', description: 'Un sujet à aborder avec un assistant, un professionnel, un CIP.' }
};

function _reperesGenererId() {
  return 'r' + Date.now() + Math.floor(Math.random() * 1000);
}

function _reperesDateAujourdhui() {
  var d = new Date();
  var jj = String(d.getDate()).padStart(2, '0');
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  return jj + '/' + mm;
}

// Extrait tronqué à une frontière de mot, utilisé pour pré-remplir le
// titre à partir du texte tant que la personne n'a pas écrit son propre
// titre -- jamais un vrai résumé (aucune IA disponible localement dans
// ERIP, aucun appel automatique), seulement un début de phrase
// reconnaissable dans la liste des Repères.
// TACHE (retour utilisateur, 2026-08-25) : limite en nombre de mots
// (pas de caracteres) -- sans ca, un Repere ecrit sans titre manuel
// voyait tout son contenu devenir le titre affiche partout (mini-panneau,
// liste). 4 mots suffisent pour rester reconnaissable dans une liste.
var _REPERES_TITRE_NB_MOTS = 4;
// TACHE (retour utilisateur, 2026-08-25) : jamais de "..." final -- une
// coupe nette a 4 mots suffit a signaler que ce n'est qu'un debut, la
// personne comprend qu'elle peut modifier le titre si besoin. Chaque mot
// est toujours pris en entier, jamais coupe en cours de mot (un mot plus
// long que les autres reste intact).
function _reperesExtraitPourTitre(texte) {
  var t = (texte || '').trim();
  if (!t) { return ''; }
  var mots = t.split(/\s+/);
  return mots.slice(0, _REPERES_TITRE_NB_MOTS).join(' ');
}

// Construit un enregistrement Repère -- ne l'enregistre pas (voir
// _reperesEnregistrer, catégorie Stockage, juste en dessous). `source`
// est une chaîne déjà figée (copie, jamais une référence -- voir
// ARCHITECTURE_TECHNIQUE.md, "Copie ou lecture en direct"), ou `null`
// pour un geste libre. Validation défensive à la frontière (voir
// docs/CONTRAT_ANCRAGE_ERIP.md, "Responsabilité de Repères") : ne fait
// jamais confiance aveuglément à contratSource -- ignore tout champ
// autre que libelle, dégrade en geste libre plutôt que d'échouer si
// libelle est absent ou mal formé.
function _reperesConstruire(type, contratSource) {
  var libelle = contratSource && typeof contratSource.libelle === 'string' && contratSource.libelle.trim()
    ? contratSource.libelle
    : null;
  var repere = {
    id: _reperesGenererId(),
    type: type,
    source: libelle,
    date: _reperesDateAujourdhui(),
    titre: '',
    texte: '',
    // TACHE (retour utilisateur, 2026-08-26, architecture Non analysés/
    // Déjà analysés) : jamais mis à jour ici -- passe à `true` uniquement
    // via reperesMarquerAnalyses() (façade publique, plus bas), appelée
    // par Regard extérieur après import RÉUSSI d'une réponse (jamais au
    // simple clic sur "Demander un regard extérieur").
    analyse: false
  };
  // TACHE (chantier "répertoire des freins", étape 5, 2026-08-28) : un
  // Repère peut être né d'un frein identifié dans un rapport Regard
  // extérieur. Il ne stocke QUE le code (`frein`), jamais une copie des
  // pistes/ressources -- celles-ci sont re-rendues à jour à chaque
  // affichage depuis data/freins.js (voir _reperesRenduItem() +
  // regardExterieurRenduFicheFrein()), pour ne jamais figer une version
  // périmée [[LECONS 9.13]]. Validation défensive à la frontière, comme
  // pour `libelle` : on n'accepte qu'une chaîne de lettres (forme d'un
  // code de la liste fermée), tout le reste est ignoré.
  var codeFrein = contratSource && typeof contratSource.frein === 'string' ? contratSource.frein.trim() : '';
  if (/^[a-zA-Z]+$/.test(codeFrein)) { repere.frein = codeFrein; }
  return repere;
}

// ============================================================
// STOCKAGE
// ============================================================

// Initialisation paresseuse et défensive, jamais supposée acquise par
// un seul appel de démarrage. Contrairement à dossier.ia (js/app.js),
// dont le garde-fou "if (!dossier.ia) { dossier.ia = ... }" est répété
// à la main à chaque point de restauration (restaurerSession(), import
// de session...), ce module centralise sa propre défense ICI, une
// seule fois -- app.js n'a donc jamais besoin de connaître, ni de
// répéter, la façon dont dossier.reperes doit être initialisé.
function _reperesListe() {
  if (!dossier.reperes) { dossier.reperes = []; }
  return dossier.reperes;
}

function _reperesEnregistrer(repere) {
  _reperesListe().unshift(repere);
  // Un nouveau geste : le filet d'annulation d'une suppression precedente
  // n'a plus lieu d'etre (et sa position d'origine serait de toute facon
  // decalee par ce unshift).
  _reperesOublierAnnulation();
}

function _reperesTrouver(id) {
  return _reperesListe().filter(function (r) { return r.id === id; })[0] || null;
}

// TACHE (audit de stabilisation, 2026-09-12) : filet d'annulation ~10 s,
// meme mecanisme que Mon Carnet (modules/carnet/index.js, idee E de
// IDEES_A_RECLASSER, Denis 2026-09-09) -- 2e occurrence, non factorisee
// "a chaud" (dette a consigner dans BRIQUES_COMMUNES.md). Jamais une
// corbeille : rien n'est conserve au-dela du delai.
var _reperesSuppressionRecente = null;   // { repere, index } | null
var _reperesSuppressionMinuteur = null;
var _REPERES_ANNULATION_DELAI = 10000;

function _reperesSupprimer(id) {
  var liste = _reperesListe();
  var index = -1;
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) { index = i; break; } }
  if (index === -1) { return; }
  var repere = liste[index];
  dossier.reperes = liste.filter(function (r) { return r.id !== id; });
  // Un seul filet a la fois : une nouvelle suppression ecrase la
  // precedente, qui devient alors definitive.
  _reperesSuppressionRecente = { repere: repere, index: index };
  if (_reperesSuppressionMinuteur) { clearTimeout(_reperesSuppressionMinuteur); }
  _reperesSuppressionMinuteur = setTimeout(function () {
    _reperesSuppressionRecente = null;
    _reperesSuppressionMinuteur = null;
    _reperesRafraichirListe();
  }, _REPERES_ANNULATION_DELAI);
}

function _reperesOublierAnnulation() {
  _reperesSuppressionRecente = null;
  if (_reperesSuppressionMinuteur) { clearTimeout(_reperesSuppressionMinuteur); _reperesSuppressionMinuteur = null; }
}

function _reperesAnnulerDerniereSuppression() {
  if (!_reperesSuppressionRecente) { return; }
  var liste = _reperesListe();
  var pos = Math.min(_reperesSuppressionRecente.index, liste.length);
  liste.splice(pos, 0, _reperesSuppressionRecente.repere);
  _reperesOublierAnnulation();
  if (typeof trackEvenement === 'function') { trackEvenement('repere_suppression_annulee'); }
  _reperesRafraichirListe();
}

// Rendu du filet, en tete de liste, meme raison d'etre que
// _carnetRenduFiletAnnulation() (modules/carnet/index.js). Disparait de
// lui-meme au bout de _REPERES_ANNULATION_DELAI.
function _reperesRenduFiletAnnulation() {
  if (!_reperesSuppressionRecente) { return ''; }
  return '<div class="reperes-annuler-suppression">' +
      '<span><i class="bi bi-trash3" aria-hidden="true"></i> Repère supprimé.</span>' +
      '<button type="button" class="reperes-annuler-suppression-btn" data-reperes-annuler-suppression>' +
        '<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Annuler</button>' +
    '</div>';
}

// TACHE (étape 3, classement hésitant -- voir carnet technique) :
// assemble modèle + stockage + télémétrie. Ne correspond pas
// proprement à une seule des 5 catégories demandées ; rangée ici parce
// que son effet dominant est l'apparition d'un nouvel enregistrement
// stocké. trackEvenement() est un utilitaire transversal déjà utilisé
// par tout le reste de l'application pour des événements significatifs
// (voir docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md, "Discipline des
// dépendances externes") -- pas une logique propre à un autre module,
// mais bel et bien une nouvelle dépendance externe, assumée et
// documentée comme telle.
function _reperesCreer(type, contratSource) {
  var repere = _reperesConstruire(type, contratSource);
  _reperesEnregistrer(repere);
  if (typeof trackEvenement === 'function') {
    // TACHE (validation défensive) : reflète le résultat réel de la
    // construction (repere.source), pas la seule présence de
    // contratSource -- un contratSource mal formé dégrade déjà en
    // geste libre dans _reperesConstruire, la télémétrie doit dire la
    // même chose.
    trackEvenement('repere_cree', { type: type, geste: repere.source ? 'ancre' : 'libre' });
  }
  // TACHE (chantier Journal de parcours, docs/CHANTIER_JOURNAL_DE_PARCOURS.md) :
  // systématique, quel que soit l'endroit où la création a eu lieu
  // (mini-panneau, écran complet, geste ancré) -- conforme à la
  // décision "partout, à chaque création".
  _reperesMettreAJourJournal();
  _reperesDeclencherPulseJournal();
  return repere;
}

// ============================================================
// RENDU
// ============================================================

// Bloc sélecteur de type, réutilisable pour tout geste de création
// (libre aujourd'hui, ancré ensuite) -- seul le conteneur qui l'insère
// change, jamais ce bloc lui-même (déjà décidé en maquette : "seul le
// conteneur change, jamais la logique"). `libelleEchappe`, si fourni,
// porte le libellé d'un geste ancré (déjà échappé pour un attribut
// HTML par l'appelant) -- absent pour un geste libre.
// TACHE (retour utilisateur, 2026-08-25) : `avecAstuceDictee` optionnel --
// seuls les 2 pickers de geste LIBRE (reperesPickerLibre/reperesPickerJournal,
// ou la personne tape vraiment du texte juste apres) l'affichent. Jamais
// pour un geste ANCRE (_reperesRenduBoutonAncre(), meme fonction partagée) :
// ce picker s'insere dans une page d'un AUTRE module, l'astuce y serait
// hors-contexte. L'astuce reste ainsi visible exactement tant que le
// picker l'est (meme bascule CSS .is-open), jamais affichee sur la page
// de liste elle-meme ("n'a rien a faire ici", retour utilisateur).
function _reperesRenduPicker(idPicker, libelleEchappe, avecAstuceDictee) {
  var boutons = Object.keys(_REPERES_TYPES).map(function (cle) {
    var t = _REPERES_TYPES[cle];
    return '<button type="button" class="reperes-type-btn" data-repere-type="' + cle + '">' +
      '<span class="reperes-ic">' + t.icone + '</span><span class="reperes-type-libelle">' + t.libelle + '</span>' +
      '<span class="reperes-type-description">' + t.description + '</span></button>';
  }).join('');
  var attributSource = libelleEchappe ? ' data-repere-source="' + libelleEchappe + '"' : '';
  return '<div class="reperes-type-picker" id="' + idPicker + '"' + attributSource + '">' +
    (avecAstuceDictee ? _reperesRenduAstuceDictee() : '') +
    '<p class="reperes-invite">Quel type de Repère est-ce ?</p>' +
    '<div class="reperes-type-grid">' + boutons + '</div>' +
    // TACHE (retour utilisateur, 2026-08-25, BUG REEL : "Annuler" ressemble
    // a une ligne de texte cliquable, pas a un bouton") : deja un vrai
    // <button>, mais sans classe stylee (aucun CSS n'existait pour
    // .reperes-picker-annuler) -- meme classe bordee que les autres
    // boutons secondaires de l'app (docs/LECONS_A_NE_PAS_REPRODUIRE.md,
    // section 1), jamais un style qui se confond avec un lien. Repris aux
    // 2 endroits qui utilisent ce meme picker (Journal de parcours ET
    // ecran complet Mes Repères) sans code duplique -- une seule fonction.
    '<button type="button" class="btn btn-outline-secondary btn-sm mt-2" data-repere-annuler="' + idPicker + '">Annuler</button>' +
    '</div>' +
    '<div class="reperes-confirmation" data-repere-confirmation="' + idPicker + '">Repère gardé.</div>';
}

// Rendu seul du point d'ancrage (voir docs/CONTRAT_ANCRAGE_ERIP.md) --
// bouton + picker prêts à être insérés dans le rendu d'un AUTRE module.
// Ne fait confiance à rien : un contratSource absent ou mal formé
// donne une chaîne vide plutôt qu'un bouton cassé, jamais une erreur.
function _reperesRenduBoutonAncre(contratSource) {
  var libelle = contratSource && typeof contratSource.libelle === 'string' ? contratSource.libelle.trim() : '';
  if (!libelle) { return ''; }
  var idPicker = 'reperesPickerAncre' + _reperesGenererId();
  // TACHE (audit final) : plus de garde typeof ici -- echapperAttribut()
  // est traitée comme les autres utilitaires transversaux (barreNavigation,
  // naviguerVers, confirmerAction), jamais gardée ailleurs dans ce
  // fichier (voir _reperesRenduGroupe(), _reperesRenduItem()). La garde
  // isolée qui existait ici avant était une incohérence, pas une
  // protection réelle : si echapperAttribut() disparaissait un jour,
  // ces 3 autres appels échoueraient de toute façon.
  var libelleEchappe = echapperAttribut(libelle);
  return '<button type="button" class="btn btn-outline-secondary btn-sm aide-repere-ancre" data-repere-trigger="' + idPicker + '" ' +
    'title="' + echapperAttribut(texteAideRepere()) + '" ' +
    'aria-expanded="false" aria-controls="' + idPicker + '"><i class="bi bi-bookmark-star"></i> Garder comme Repère</button>' +
    _reperesRenduPicker(idPicker, libelleEchappe);
}

// Écran de saisie -- geste LIBRE uniquement (jamais le geste ancré,
// voir _REPERES_TYPES en tête de fichier pour le raisonnement complet).
// Ouvert automatiquement juste après le choix du type : le Repère
// existe déjà (_reperesCreer() a déjà été appelé par l'écouteur qui
// déclenche cette fonction), cet écran ne fait qu'offrir, tout de suite
// plutôt qu'à la reprise, la possibilité d'y ajouter un titre et un
// texte -- jamais une obligation, fermer cette fenêtre sans rien taper
// laisse un Repère minimal tout aussi valide et complet.
// TACHE (chantier "répertoire des freins", étape 5) : `optionsSaisie`
// optionnel ({ labelTitre?, placeholderTitre? }) -- un Repère né d'un frein
// réutilise tout ce mécanisme tel quel (sauvegarde en direct, "Annuler" qui
// retire le Repère, fermeture-si-vide, pulse Journal) ; seule l'invite du
// champ titre est adaptée, parce que ce champ y sert à préciser le frein
// (« Se déplacer : ... ») et non à inventer un titre libre. Aucun champ
// nouveau : `frein` porte le code, `titre` porte le libellé complété.
function _reperesOuvrirSaisieLibre(id, optionsSaisie) {
  var r = _reperesTrouver(id);
  if (!r) { return; }
  var meta = _REPERES_TYPES[r.type] || _REPERES_TYPES.question;
  var labelTitre = (optionsSaisie && optionsSaisie.labelTitre) || 'Titre du Repère (facultatif)';
  var placeholderTitre = (optionsSaisie && optionsSaisie.placeholderTitre) ||
    'Se remplit automatiquement avec le début de votre texte, modifiable à tout moment.';
  ouvrirFenetreERIP({
    titre: meta.icone + ' ' + meta.libelle,
    aideContexte: 'reperes-saisie-libre',
    contenuHTML:
      '<label class="reperes-saisie-label" for="reperesSaisieTitre">' + labelTitre + '</label>' +
      '<input type="text" class="form-control mb-3" id="reperesSaisieTitre" maxlength="80" ' +
        'placeholder="' + echapperAttribut(placeholderTitre) + '">' +
      '<label class="reperes-saisie-label" for="reperesSaisieTexte">Votre réflexion (facultatif)</label>' +
      _reperesRenduAstuceDictee() +
      '<textarea class="form-control" id="reperesSaisieTexte" rows="6" ' +
        'placeholder="Quelques mots suffisent. Rien n\'est obligatoire."></textarea>' +
      '<div class="text-center mt-3 d-flex gap-2 justify-content-center">' +
      '<button type="button" class="btn btn-outline-secondary" id="reperesSaisieAnnuler">Annuler</button>' +
      '<button type="button" class="btn btn-primary" id="reperesSaisieTerminer">&#10003; C\'est noté</button>' +
      '</div>'
  });

  var champTitre = document.getElementById('reperesSaisieTitre');
  var champTexte = document.getElementById('reperesSaisieTexte');
  if (champTitre) { champTitre.value = r.titre || ''; }
  if (champTexte) { champTexte.value = r.texte || ''; }

  // Auto-suggestion du titre tant que la personne n'a pas elle-même
  // modifié ce champ -- dès qu'elle y écrit directement, son choix est
  // respecté et l'auto-remplissage s'arrête définitivement pour ce
  // Repère (jamais écrasé après coup, même si elle continue à taper le
  // texte ensuite).
  // TACHE (chantier "répertoire des freins", étape 5) : pour un Repère né
  // d'un frein, `baseFrein` est le libellé du frein (« Se déplacer »),
  // déjà validé par la personne (barre de recherche) ou posé par le
  // rapport. Le titre proposé devient « <baseFrein> : <premiers mots du
  // texte> » -- la personne n'a rien à écrire dans le champ titre (limité
  // à 80 caractères), c'est son texte libre qui complète. On force
  // `titreModifieManuel = false` au départ même si `r.titre` est déjà posé
  // (le libellé du frein), sinon l'auto-complétion ne se déclencherait
  // jamais. La personne peut toujours reprendre la main en tapant
  // directement dans le champ titre.
  var baseFrein = r.frein ? String(r.source || r.titre || 'Ce frein').replace(/\s*:.*$/, '').trim() : null;
  var titreModifieManuel = baseFrein ? false : !!(r.titre && r.titre.trim());
  if (champTitre) {
    champTitre.addEventListener('input', function () {
      titreModifieManuel = true;
      var rActuel = _reperesTrouver(id);
      if (rActuel) { rActuel.titre = champTitre.value; }
    });
  }
  if (champTexte) {
    champTexte.addEventListener('input', function () {
      var rActuel = _reperesTrouver(id);
      if (rActuel) { rActuel.texte = champTexte.value; }
      if (!titreModifieManuel && champTitre) {
        var extrait = _reperesExtraitPourTitre(champTexte.value);
        var suggestion = baseFrein
          ? (extrait ? baseFrein + ' : ' + extrait : baseFrein)
          : extrait;
        champTitre.value = suggestion;
        if (rActuel) { rActuel.titre = suggestion; }
      }
    });
    // Curseur immédiatement prêt à recevoir la saisie (clavier ou
    // dictée Win+H) -- point d'ergonomie explicitement demandé, aucun
    // clic supplémentaire nécessaire avant de pouvoir écrire.
    champTexte.focus();
  }

  // TACHE (retour utilisateur, 2026-08-26, "je change d'avis, je ne vais
  // pas réfléchir à aller cliquer ajouter pour l'enlever") : contrairement
  // à la croix/Échap (supprimerSiVide(), qui ne supprime QUE si le Repère
  // est resté totalement vide), "Annuler" supprime toujours, même si la
  // personne a déjà commencé à écrire -- un vrai "je renonce", sans avoir
  // à repasser par la liste et son propre bouton Supprimer.
  var boutonAnnuler = document.getElementById('reperesSaisieAnnuler');
  if (boutonAnnuler) {
    boutonAnnuler.addEventListener('click', function () {
      document.removeEventListener('keydown', surEchapSaisieLibre);
      _reperesSupprimer(id);
      fermerFenetreERIP();
      _reperesRafraichirListe();
      _reperesMettreAJourJournal();
    });
  }
  var boutonTerminer = document.getElementById('reperesSaisieTerminer');
  if (boutonTerminer) {
    // Ne déclenche aucun enregistrement (déjà fait en direct par les
    // écouteurs 'input' ci-dessus) : un simple repère de fin de geste,
    // jamais un bouton "Valider" qui laisserait croire que rien n'est
    // sauvegardé avant d'y cliquer.
    boutonTerminer.addEventListener('click', function () {
      document.removeEventListener('keydown', surEchapSaisieLibre);
      fermerFenetreERIP();
      _reperesRafraichirListe();
      _reperesMettreAJourJournal();
    });
  }

  // TACHE (retour utilisateur : Repère vide fermé par erreur) : fermer
  // cet écran par la croix ou Échap (jamais "C'est noté", géré à part
  // ci-dessus) ET n'avoir rien saisi (ni titre ni texte) signale le plus
  // souvent une catégorie choisie par erreur, pas une volonté de garder
  // un Repère minimal -- le Repère tout juste créé est alors retiré
  // silencieusement. Dès qu'un contenu réel existe (même un seul
  // caractère, dans l'un ou l'autre champ), cette suppression ne se
  // déclenche plus jamais : seule la suppression explicite depuis la
  // liste, avec sa confirmation, reste alors possible -- jamais une
  // perte silencieuse d'un contenu réellement saisi.
  function supprimerSiVide() {
    var rActuel = _reperesTrouver(id);
    if (rActuel && !(rActuel.titre || '').trim() && !(rActuel.texte || '').trim()) {
      _reperesSupprimer(id);
      _reperesRafraichirListe();
      _reperesMettreAJourJournal();
    }
    document.removeEventListener('keydown', surEchapSaisieLibre);
  }
  function surEchapSaisieLibre(e) {
    if (e.key === 'Escape') { supprimerSiVide(); }
  }
  document.addEventListener('keydown', surEchapSaisieLibre);
  var boutonFermerCroix = document.getElementById('fenetreERIPFermerBtn');
  if (boutonFermerCroix) { boutonFermerCroix.addEventListener('click', supprimerSiVide); }
}

// Nombre de Repères affichés dans le mini-panneau Journal de parcours
// (voir _reperesRenduPanneauJournal()). Bascule entre
// _REPERES_JOURNAL_NB_DEPART et min(10, total) via le bouton
// "Afficher plus"/"Afficher moins" -- jamais persisté.
var _REPERES_JOURNAL_NB_DEPART = 3;
var _reperesJournalNombreAffiche = _REPERES_JOURNAL_NB_DEPART;

// TACHE (retour utilisateur, 2026-08-25) : une colonne par type de Repère
// (Question/Idée/À approfondir/À discuter), remplace l'ancien groupement
// par état (Prêts à en parler / Pour moi) -- trop d'espace perdu en
// liste simple, "la page se remplit à une vitesse impressionnante" dès 4
// ou 5 Repères. Ordre chronologique conservé A L'INTÉRIEUR de chaque
// colonne (le plus récent en haut) -- déjà l'ordre naturel de
// _reperesListe() (`.unshift()` à la création), aucun tri à refaire ici.
// TACHE (retour utilisateur, 2026-08-26, "+" rapide par catégorie) :
// bouton dans l'entête de chaque colonne -- la catégorie est déjà connue
// (celle de LA colonne cliquée), inutile de repasser par le sélecteur de
// type générique (_reperesRenduPicker(), qui affiche les 4 catégories).
var _REPERES_LEGENDE_QUICKADD = {
  question: 'Rajouter une question', idee: 'Rajouter une idée',
  approfondir: 'Rajouter un sujet à approfondir', discuter: 'Rajouter un sujet à discuter'
};

function _reperesRenduColonne(cle, liste) {
  var t = _REPERES_TYPES[cle];
  var items = liste.filter(function (r) { return r.type === cle; });
  return '<div class="reperes-colonne">' +
    '<div class="reperes-colonne-titre-ligne">' +
      '<p class="reperes-colonne-titre"><span class="reperes-ic">' + t.icone + '</span>' + t.libelle + ' (' + items.length + ')</p>' +
      '<button type="button" class="reperes-btn-quickadd" data-repere-quickadd="' + cle + '" title="' + _REPERES_LEGENDE_QUICKADD[cle] + '">+</button>' +
    '</div>' +
    (items.length
      ? items.map(_reperesRenduItem).join('')
      : '<p class="reperes-colonne-vide">Aucun pour l’instant.</p>') +
    '</div>';
}

// État "affichage" du contenu d'un Repère (lecture seule + bouton) --
// utilisé au rendu initial ET pour revenir à cet état après un clic sur
// "Annuler"/"Valider" (voir _reperesBrancherModifierContenu()). Texte vide
// : bouton "+ Ajouter quelques mots" (facultatif, jamais un champ vide
// imposé) ; texte existant : contenu visible + "Modifier".
// TACHE (retour utilisateur, 2026-08-26, esthétique) : quand le Repère est
// encore vide, "+ Ajouter quelques mots" (fond jaune clair) et "Supprimer"
// (fond rouge clair) partagent maintenant la même ligne (gauche/droite,
// jamais collés) au lieu d'être empilés pleine largeur -- les 2 boutons
// vivent ICI, dans le même conteneur re-rendu après Annuler/Valider, pour
// rester cohérents entre le premier affichage et un retour après édition
// (voir _reperesBrancherModifierContenu()). Le cas "texte déjà présent"
// (Modifier + Supprimer séparé en dessous) n'a pas été signalé comme
// gênant par Denis et reste inchangé.
function _reperesRenduContenuAffiche(r) {
  if (r.texte) {
    return '<div class="reperes-detail-corps">' + echapperAttribut(r.texte) + '</div>' +
      '<button type="button" class="btn btn-outline-secondary reperes-btn-uniforme mt-2" data-repere-modifier-contenu="' + r.id + '">Modifier</button>';
  }
  // TACHE (garde-fou "Repère vide avant 1er passage", 2026-08-28) : une
  // phrase discrète, pas un bandeau -- un Repère qui n'a qu'un titre ne
  // pourra pas être envoyé à l'analyse tel quel (voir
  // _regardExterieurSyncSelectionItemVide côté Regard extérieur, où la
  // case correspondante est décochée + désactivée).
  return '<p class="reperes-invite-completer">Quelques mots de contexte permettront d’envoyer ce Repère à un Regard Extérieur.</p>' +
    '<div class="reperes-row-actions reperes-row-ajout-supprimer">' +
    '<button type="button" class="btn btn-sm reperes-btn-ajouter-mots" data-repere-modifier-contenu="' + r.id + '">+ Ajouter quelques mots</button>' +
    '<button type="button" class="btn btn-sm reperes-btn-supprimer-clair" data-repere-supprimer="' + r.id + '">&#128465;&#65039; Supprimer</button>' +
    '</div>';
}

// Un item, replié par défaut (voir _reperesBrancherEvenementsListe()
// pour l'ouverture/fermeture). `r.source` est une copie figée depuis
// longtemps (voir "Copie ou lecture en direct") -- jamais un appel
// vers le module d'origine à ce stade.
function _reperesRenduItem(r) {
  var meta = _REPERES_TYPES[r.type] || _REPERES_TYPES.question;
  // TACHE (identite du Repere, retour utilisateur "ils se ressemblent
  // tous") : le titre (geste libre, saisi ou auto-suggere depuis le
  // texte) prime desormais sur la source ancree -- un Repere libre
  // enrichi d'un titre redevient reconnaissable dans la liste. Repli sur
  // la source (geste ancre, jamais de titre) puis sur le texte generique
  // si aucun des deux n'existe (Repere reste minimal).
  // TACHE (chantier "répertoire des freins", étape 5) : un Repère né d'un
  // frein a son libellé dans `titre` -- soit le libellé seul du frein
  // (« Se déplacer »), soit complété depuis le contenu (« Se déplacer :
  // permis suspendu », par l'auto-suggestion ou par l'assistant). On
  // enlève par sécurité un « : » resté seul en fin, et on ajoute un petit
  // repère visuel 🚧 pour le distinguer dans la liste.
  var src;
  if (r.frein) {
    var libelleFrein = String(r.titre || r.source || 'Ce frein').replace(/\s*:\s*$/, '');
    src = '<span class="reperes-frein-tag" title="Né d\'un frein repéré dans un rapport">&#128679;</span> ' + echapperAttribut(libelleFrein);
  } else {
    src = r.titre ? echapperAttribut(r.titre) : (r.source ? echapperAttribut(r.source) : 'Réflexion personnelle');
  }
  // TACHE (retour utilisateur, 2026-08-26) : un Repère ANALYSÉ n'est plus
  // modifiable (le texte a déjà été envoyé tel quel à un assistant, le
  // modifier après coup rendrait le retour obtenu incohérent avec le
  // contenu affiché) -- seul un Repère "non analysé" reste éditable.
  // Ligne d'actions différente selon l'état : 3 boutons de même
  // taille/forme pour un Repère analysé (jamais "Modifier" + "Supprimer"
  // de tailles différentes, signalé par Denis), contre Modifier (dans le
  // contenu) + Supprimer pour un Repère non analysé, inchangé.
  var invite = r.analyse ? 'Cliquez pour consulter ou supprimer' : 'Cliquez pour modifier ou supprimer';
  var corpsContenu = r.analyse
    ? (r.texte ? '<div class="reperes-detail-corps">' + echapperAttribut(r.texte) + '</div>' : '<p class="reperes-detail-vide">Aucun texte.</p>')
    : '<div class="reperes-item-contenu" data-repere-contenu-affiche="' + r.id + '">' + _reperesRenduContenuAffiche(r) + '</div>';
  // TACHE (retour utilisateur, 2026-08-26, chantier "Phase B") : un
  // Repère en "Deuxième regard" (r.approfondi) a les mêmes 3 actions
  // qu'un Repère "analysé", sauf "Repasser" qui recule d'UNE seule étape
  // (vers "Déjà analysés", data-repere-repasser-analyse) -- jamais
  // directement vers "Non analysés", même logique pas-à-pas partout.
  // TACHE (retour utilisateur, 2026-08-26, bouton "Voir le rapport") :
  // visible uniquement si ce Repère apparaît réellement dans au moins un
  // rapport (regardExterieurRapportsPourRepere(), façade -- jamais un
  // accès direct au tableau privé de regard-exterieur). Placé ENTRE
  // Copier et Repasser sur demande explicite, vert clair (même couleur
  // que le bouton "Mes rapports"), jamais bleu (déjà pris par "Voir mon
  // analyse"/"Revoir l'explication").
  var idsRapports = typeof regardExterieurRapportsPourRepere === 'function' ? regardExterieurRapportsPourRepere(r.id) : [];
  var boutonVoirRapport = idsRapports.length
    ? '<button type="button" class="btn btn-sm reperes-btn-analyse-rapport" data-repere-voir-rapport="' + r.id + '">&#128193; Voir le rapport</button>'
    : '';
  var actions = r.approfondi
    ? '<div class="reperes-row-actions">' +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-copier" data-repere-copier-texte="' + r.id + '">&#128203; Copier</button>' +
        boutonVoirRapport +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-repasser" data-repere-repasser-analyse="' + r.id + '">&#128281; Repasser</button>' +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-supprimer" data-repere-supprimer="' + r.id + '">&#128465;&#65039; Supprimer</button>' +
      '</div>'
    : r.analyse
    ? '<div class="reperes-row-actions">' +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-copier" data-repere-copier-texte="' + r.id + '">&#128203; Copier</button>' +
        boutonVoirRapport +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-repasser" data-repere-repasser-non-analyse="' + r.id + '">&#128281; Repasser</button>' +
        '<button type="button" class="btn btn-sm reperes-btn-analyse-supprimer" data-repere-supprimer="' + r.id + '">&#128465;&#65039; Supprimer</button>' +
      '</div>'
    // TACHE (retour utilisateur, 2026-08-26) : quand le Repère est encore
    // vide, "Supprimer" vit déjà à côté de "+ Ajouter quelques mots" dans
    // _reperesRenduContenuAffiche() -- ne jamais le dupliquer ici.
    : (r.texte
      ? '<div class="reperes-row-actions">' +
          '<button type="button" class="btn btn-outline-danger reperes-btn-uniforme" data-repere-supprimer="' + r.id + '">&#128465;&#65039; Supprimer</button>' +
        '</div>'
      : '');
  // TACHE (retour utilisateur, 2026-08-26, nettoyage automatique par IA) :
  // badge visible tant que la personne n'a pas vérifié la compréhension
  // de l'IA sur CE Repère précis (r.interpretationIncertaine, posé par
  // reperesAppliquerNettoyageIA()) -- disparaît définitivement dès
  // "C'est bon, c'est correct" (reperesConfirmerVerification()) ou dès
  // que le Repère est repassé et corrigé à la main.
  var badgeIncertain = r.interpretationIncertaine
    ? '<button type="button" class="reperes-badge-incertain" data-repere-ouvrir-verification="' + r.id + '">&#9888;&#65039; À vérifier</button>'
    : '';
  var blocVerification = (r.interpretationIncertaine && _reperesVerificationOuverteId === r.id)
    ? '<div class="reperes-bloc-verification">' +
        '<h6>L\'assistant n\'était pas sûr d\'avoir bien compris ce Repère</h6>' +
        '<div class="reperes-comparaison-avant-apres">' +
          '<div class="reperes-comparaison-bloc"><b>Ce que vous aviez écrit</b>' + echapperAttribut(r.texteAvantNettoyage || '') + '</div>' +
          '<div class="reperes-comparaison-bloc"><b>Ce que l\'assistant a compris</b>' + echapperAttribut(r.texte || '') + '</div>' +
        '</div>' +
        '<div class="reperes-row-actions">' +
          '<button type="button" class="btn btn-sm reperes-btn-analyse-repasser" data-repere-repasser-non-analyse="' + r.id + '">&#128281; Repasser et corriger</button>' +
          '<button type="button" class="btn btn-sm btn-success" data-repere-verification-ok="' + r.id + '">&#10003; C\'est bon, c\'est correct</button>' +
        '</div>' +
      '</div>'
    : '';
  // TACHE (chantier "répertoire des freins", étape 5) : pour un Repère né
  // d'un frein, on affiche les pistes + ressources À JOUR, re-rendues à
  // chaque ouverture depuis data/freins.js via la façade de Regard
  // extérieur (le Repère ne porte que le code -- jamais une copie figée
  // [[LECONS 9.13]]). Dégradation silencieuse en Repère ordinaire si
  // data/freins.js ou la façade sont absents (code inconnu, module non
  // chargé) : la personne garde son titre et ses notes, sans bloc vide.
  var blocFrein = '';
  if (r.frein && typeof regardExterieurRenduFicheFrein === 'function') {
    var ficheHtml = regardExterieurRenduFicheFrein(r.frein);
    if (ficheHtml) {
      blocFrein = '<div class="reperes-fiche-frein">' +
        '<p class="reperes-fiche-frein-chapeau">Pistes et ressources pour ce frein <span class="reperes-fiche-frein-maj">(mises à jour automatiquement)</span></p>' +
        ficheHtml +
        '</div>';
    }
  }
  return '<div class="reperes-item" data-repere-id="' + r.id + '">' +
    '<button type="button" class="reperes-item-head" data-repere-toggle="' + r.id + '">' +
      '<span class="reperes-ic">' + meta.icone + '</span>' +
      '<span class="reperes-meta">' +
        '<span class="reperes-src">' + src + '</span>' + badgeIncertain +
        '<span class="reperes-date">' + meta.libelle + ' du ' + r.date + '</span>' +
        // TACHE (retour utilisateur, 2026-08-25) : invite discrete, visible
        // seulement tant que ce Repere est ferme (masquee en CSS des que
        // .is-open, voir reperes.css) -- personne ne devine par defaut
        // qu'un clic ouvre modifier/supprimer. Disparait d'elle-meme une
        // fois le geste decouvert, jamais un bloc de texte permanent.
        '<span class="reperes-invite-clic">' + invite + '</span>' +
      '</span>' +
      '<span class="reperes-chevron">&#8250;</span>' +
    '</button>' +
    '<div class="reperes-item-body">' +
      // Fiche frein (à jour) d'abord, puis les mots de la personne :
      // décision Denis (« la fiche s'affiche toujours au-dessus de ses notes »).
      blocFrein +
      // TACHE (retour utilisateur, 2026-08-25) : meme mecanisme Modifier ->
      // Annuler/Valider que _reperesOuvrirDetail()/_carnetOuvrirDetail()
      // (coherence demandee explicitement par Denis) -- le clic sur l'entete
      // (ouvrir/fermer tout le Repere) garde exactement son role actuel,
      // inchange ; ce bouton-ci ne ferme QUE la zone de texte (revient a
      // l'affichage + Modifier), jamais tout le Repere. Ne s'applique
      // qu'aux Repères non analysés (voir ci-dessus).
      corpsContenu +
      blocVerification +
      // TACHE (retour utilisateur, 2026-08-25, BUG REEL DE CONCEPTION) :
      // "prêt à en parler" (etat privé/partagé) et "discuté" ont été
      // retirés -- vérifié dans le code (grep) qu'aucun autre endroit de
      // l'app ne lisait jamais ces 2 champs en dehors de leur propre
      // badge/bouton/filtre : conçus à l'origine pour un partage de
      // session bénéficiaire -> CIP jamais devenu possible techniquement,
      // ils ne servaient plus à rien de concret. Pour un public en
      // fragilité numérique, un bouton sans effet réel visible ailleurs
      // est un vrai coût (confusion, sur-interprétation) et pas un simple
      // ajout neutre -- voir docs/LECONS_A_NE_PAS_REPRODUIRE.md.
      actions +
    '</div>' +
    '</div>';
}

// TACHE (retour utilisateur, 2026-08-26, architecture "Non analysés/Déjà
// analysés") : remplace l'ancien filtre "prêt à en parler" (retiré la
// veille, plus aucun usage réel derrière). Nouvel axe : est-ce que ce
// Repère a déjà été envoyé à un regard extérieur et une réponse obtenue
// (`r.analyse`, jamais mis à jour ici -- voir reperesMarquerAnalyses()).
// Texte explicatif court sous les onglets, demandé explicitement par
// Denis : la personne doit comprendre "qui/quoi/comment" sans avoir à
// deviner.
// TACHE (retour utilisateur, 2026-08-26, chantier "Phase B") : 3e etat
// ajoute, "Deuxieme regard" -- un Repere y arrive apres un 2e passage
// (approfondissement) reussi (voir reperesMarquerApprofondis()), en plus
// de "analyse" (1er passage). Mouvement bidirectionnel a chaque etape :
// Deuxieme regard -> Deja analyses (data-repere-repasser-analyse) ->
// Non analyses (data-repere-repasser-non-analyse), jamais l'inverse en
// un seul clic (une etape a la fois, meme geste que "repasser" deja
// existant). Nom choisi par Denis apres hesitation ("je ne sais pas
// comment lui dire") -- "Creuses"/"Approfondis" ecartes par lui.
var _reperesFiltreActuel = 'non-analyses';

// TACHE (retour utilisateur, 2026-08-26, badge "à vérifier") : id du
// Repère dont la comparaison avant/après nettoyage IA est actuellement
// dépliée (voir _reperesRenduItem()) -- un seul à la fois, même patron
// que les autres bascules de cette page (jamais un état par Repère
// stocké sur le Repère lui-même, qui devrait alors être nettoyé partout).
var _reperesVerificationOuverteId = null;

// TACHE (retour utilisateur, 2026-08-26, recherche) : SÉPARÉE de la
// recherche de "Mes rapports" (_reperesRapportsRecherche) -- deux
// écrans, deux données différentes (Repères vivants vs rapports figés),
// jamais fusionnées en une seule requête (risque de mélanger un Repère
// modifiable et une archive figée dans un même résultat, source de
// confusion déjà signalée par Denis). Même mécanisme et même visuel que
// "Mes rapports" : filtre la liste en place, jamais une 2e zone séparée.
var _reperesRecherche = '';

function _reperesTexteRechercheRepere(r) {
  var acc = [];
  _reperesTexteProfond(r.titre, acc);
  _reperesTexteProfond(r.texte, acc);
  _reperesTexteProfond(r.source, acc);
  return acc.join(' ').toLowerCase();
}

// Repères du dossier appartenant à l'onglet `cle`, AVANT recherche --
// partagée par _reperesRenduListe() (affichage) ET _reperesRenduFiltre()
// (visibilité de la légende des boutons et du bouton "Demander un
// deuxième regard", qui ne dépendent jamais du texte recherché, voir
// _reperesRenduFiltre()) : une seule source de vérité pour "y a-t-il
// quelque chose dans cet onglet ?".
function _reperesReperesDansOnglet(cle) {
  return _reperesListe().filter(function (r) {
    if (cle === 'deuxieme-regard') { return !!r.approfondi; }
    if (cle === 'analyses') { return !!r.analyse && !r.approfondi; }
    return !r.analyse;
  });
}

// ---- Chantier "Phase B" : "Mes rapports" (historique partagé des 3
// types d'analyse -- 1ère analyse, Aller plus loin, Deuxième regard) ----

// TACHE (retour utilisateur, 2026-08-26) : icone ajoutee a chaque badge --
// reprend les icones deja etablies ailleurs dans le module (1ere analyse/
// Regard Exterieur = telescope, Aller plus loin = plus, Deuxieme Regard =
// microscope, nouveau, choisi par Denis).
var _REPERES_RAPPORT_BADGES = {
  '1ere': { libelle: '1ère analyse', icone: '&#128301;', classe: 'reperes-rapport-badge-1ere' },
  'aller-plus-loin': { libelle: 'Aller plus loin', icone: '&#10133;', classe: 'reperes-rapport-badge-approfondir' },
  '2e-regard': { libelle: 'Deuxième Regard', icone: '&#128300;', classe: 'reperes-rapport-badge-2e-regard' }
};

// TACHE (retour utilisateur, 2026-08-26) : bouton sur SA PROPRE ligne,
// au-dessus des 3 onglets -- jamais sur la même barre que "Voir mon
// analyse"/"Demander un deuxième regard" (ce serait laisser croire à une
// continuité de parcours, alors que c'est un accès à des archives).
// Masqué tant qu'aucun rapport n'existe encore (même logique que le
// bouton "Demander un regard extérieur", qui n'apparaît qu'au-delà d'un
// seuil de Repères).
// TACHE (retour utilisateur, 2026-08-26, notification "nouveau rapport") :
// bandeau + pulse tant qu'au moins un rapport n'a jamais été vu
// (rapport.dejaVu, déjà existant, désormais aussi marqué vu à l'ouverture
// d'une carte dans "Mes rapports" -- voir regardExterieurMarquerRapportVu()
// et _reperesBrancherEvenementsRapports()). Couleur --warning (orange
// clair), JAMAIS vert -- deux blocs verts côte à côte (bouton "Mes
// rapports" + bandeau) prêtaient à confusion. Icône 🔔 devant le titre,
// icône 📁 dans la phrase (même icône que le bouton, pour que la personne
// fasse le lien visuellement). Bandeau placé SOUS le bouton, jamais dessus
// (signalé par Denis : conflit visuel avec un autre élément à cet endroit).
function _reperesRenduEnteteRapports() {
  if (typeof regardExterieurTousLesRapports !== 'function') { return ''; }
  var rapports = regardExterieurTousLesRapports();
  if (!rapports.length) { return ''; }
  var nouveauxNonVus = rapports.some(function (r) { return !r.dejaVu; });
  return '<div class="reperes-entete-rapports">' +
    '<button type="button" class="btn reperes-bouton-rapports' + (nouveauxNonVus ? ' reperes-analyse-pulse' : '') + '" data-repere-ouvrir-rapports>&#128193; Mes rapports</button>' +
    (nouveauxNonVus
      ? '<div class="reperes-bandeau-notif"><span class="reperes-bandeau-notif-ic">&#128276;</span><div><strong>Nouveau rapport disponible</strong><p>Un assistant vient de répondre - cliquez sur « &#128193; Mes rapports » pour le consulter.</p></div></div>'
      : '') +
    '<p class="reperes-rapports-caption">Retrouvez ici tous les retours déjà reçus d\'un Regard Extérieur, même après suppression des Repères concernés.</p>' +
    '</div>';
}

function _reperesFormaterDateHeureRapport(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) { return ''; }
  var deux = function (n) { return n < 10 ? '0' + n : '' + n; };
  return deux(d.getDate()) + '/' + deux(d.getMonth() + 1) + '/' + d.getFullYear() + ' à ' + deux(d.getHours()) + 'h' + deux(d.getMinutes());
}

// TACHE (retour utilisateur, 2026-08-26, "rester sur la page") : "Mes
// rapports" n'ouvre plus de fenêtre à part -- ce mode décide si la zone
// #reperesListeConteneur affiche la liste habituelle (filtre + Repères)
// ou la page "Mes rapports" (voir _reperesRenduContenuPrincipal()).
// Remis à 'reperes' à chaque VRAIE entrée sur l'écran (pageReperes()),
// jamais lors d'un simple rafraîchissement interne.
var _reperesModeAffichage = 'reperes';

var _reperesRapportsFiltreActuel = 'tous';

// TACHE (retour utilisateur, 2026-08-26, recherche dans "Mes rapports") :
// texte tapé, partagé par les 4 onglets de type (Tous/1ère analyse/Aller
// plus loin/Deuxième regard) -- filtre la MÊME liste que d'habitude
// (_reperesRenduRapportsListe()), jamais une 2e zone de résultats à côté :
// "même vision, graphiquement pareil" (retour explicite de Denis, qui
// trouvait la 1ère version -- une zone de raccourcis séparée -- confuse).
// Remis à vide à chaque nouvelle ouverture de "Mes rapports".
var _reperesRapportsRecherche = '';

// Empile récursivement toutes les chaînes trouvées dans `valeur` (objet,
// tableau, ou chaîne) -- indifférent à la forme exacte du contenu d'un
// rapport (1ère analyse/Deuxième regard ont un vueParCategorie objet par
// catégorie, "Aller plus loin" un texte direct par catégorie, voir
// _regardExterieurAnalyser1erPassage()/_regardExterieurAnalyser2ePassage()) --
// une seule implémentation qui n'a jamais besoin de connaître cette forme.
function _reperesTexteProfond(valeur, acc) {
  if (valeur === null || valeur === undefined) { return; }
  if (typeof valeur === 'string') { acc.push(valeur); return; }
  if (Array.isArray(valeur)) { valeur.forEach(function (v) { _reperesTexteProfond(v, acc); }); return; }
  if (typeof valeur === 'object') { Object.keys(valeur).forEach(function (k) { _reperesTexteProfond(valeur[k], acc); }); }
}

// TACHE (retour utilisateur, 2026-08-26, "je ne dois pas avoir de repere
// vide") : exclut le texte des Repères qui n'ont PAS contribué à cette
// analyse (rc.contribue === false, voir _regardExterieurCreerRapport())
// -- un mot présent dans un Repère envoyé mais ignoré par l'IA (pas assez
// de matière) ne doit jamais faire remonter ce rapport dans une
// recherche, ce serait laisser croire que l'analyse en parle réellement.
function _reperesRapportTexteRecherche(r) {
  var acc = [];
  _reperesTexteProfond(r.titre, acc);
  _reperesTexteProfond(r.contenu, acc);
  _reperesTexteProfond(r.reponses, acc);
  (r.reperesConcernes || []).forEach(function (rc) {
    if (rc.contribue === false) { return; }
    _reperesTexteProfond(rc, acc);
  });
  return acc.join(' ').toLowerCase();
}

// TACHE (retour utilisateur, 2026-08-26, bouton "Voir le rapport") : id
// du Repère activement recherché depuis ce bouton, ou null en usage
// normal (bouton "Mes rapports" -- voir _reperesOuvrirRapports(), qui le
// remet toujours à null). Relu à CHAQUE rendu de carte (ouverture ET
// changement de filtre ET rafraîchissement après suppression), jamais
// une classe posée une fois pour toutes -- reste donc juste tant que la
// personne garde la fenêtre ouverte, quoi qu'elle y fasse. S'éteint tout
// seul à la fermeture : la fenêtre entière (pulse compris) est détruite
// avec elle, jamais un minuteur à annuler.
var _reperesRapportEnSurbrillance = null;

// TACHE (retour utilisateur, 2026-08-26, precision sur le pulse) : un
// rapport consulte (ouvert au moins une fois pendant CETTE recherche)
// arrete de pulser, MEME SI d'autres rapports lies au meme Repere
// continuent -- jamais tout-ou-rien. Reinitialise a chaque nouvelle
// recherche (_reperesOuvrirRapportsPourRepere()), jamais partage entre
// deux Reperes differents.
var _reperesRapportsVusPendantRecherche = [];

function _reperesRenduUnRapport(r) {
  var badge = _REPERES_RAPPORT_BADGES[r.type] || { libelle: r.type, classe: '' };
  var contenu = typeof regardExterieurRenduContenuRapport === 'function' ? regardExterieurRenduContenuRapport(r) : '';
  var reponses = typeof regardExterieurRenduReponsesRapport === 'function' ? regardExterieurRenduReponsesRapport(r) : '';
  // TACHE (retour utilisateur, 2026-08-26, "je ne dois pas avoir de
  // repere vide") : avertissement EN ROUGE, dans le Repère concerné
  // lui-même, quand ce Repère a bien été envoyé mais n'a pas apporté
  // assez de matière pour être traité (rc.contribue === false) -- le
  // texte d'origine reste consultable juste au-dessus (transparence),
  // seule la recherche l'ignore (voir _reperesRapportTexteRecherche()).
  var reperes = (r.reperesConcernes || []).map(function (rc) {
    var avertissement = rc.contribue === false
      ? '<p class="reperes-rapport-repere-absence">&#9888; ' + echapperAttribut(rc.raisonAbsence) + ' Il faudra l\'enrichir ou donner plus d\'éléments.</p>'
      : '';
    return '<details class="reperes-rapport-repere"><summary>' + echapperAttribut(rc.titre) + '</summary>' +
      '<div class="reperes-rapport-repere-texte">' + echapperAttribut(rc.texte || '') + '</div>' + avertissement + '</details>';
  }).join('');
  var enSurbrillance = _reperesRapportEnSurbrillance
    && _reperesRapportsVusPendantRecherche.indexOf(r.id) === -1
    && (r.reperesConcernes || []).some(function (rc) { return rc.repereId === _reperesRapportEnSurbrillance; });
  // TACHE (retour utilisateur, 2026-08-26, notification "nouveau rapport") :
  // réutilise le même pulse que la mise en évidence par Repère
  // (.reperes-rapport-pulse, déjà là) -- pas une 2e animation. Mention
  // "Nouveau rapport" affichée UNIQUEMENT tant que r.dejaVu est faux,
  // disparaît dès la première ouverture (voir toggle listener,
  // _reperesBrancherEvenementsRapports()) et ne revient jamais.
  var estNouveau = !r.dejaVu;
  return '<details class="reperes-rapport' + ((enSurbrillance || estNouveau) ? ' reperes-rapport-pulse' : '') + '" data-repere-rapport="' + r.id + '">' +
    '<summary>' +
    '<span class="reperes-rapport-badge ' + badge.classe + '">' + badge.icone + ' ' + badge.libelle + '</span>' +
    '<span class="reperes-rapport-titre">' + echapperAttribut(r.titre) + '</span>' +
    '<span class="reperes-rapport-date">' + _reperesFormaterDateHeureRapport(r.dateHeure) + '</span>' +
    '</summary>' +
    // TACHE (retour utilisateur, 2026-08-26, "il faut AUSSI le message qui
    // invite à cliquer, pas l'un OU l'autre") : les 2 coexistent
    // désormais. Le badge "Nouveau rapport" disparaît DÉFINITIVEMENT dès
    // la première ouverture (JS, voir plus bas .remove()). L'invite à
    // cliquer, elle, est purement visuelle (CSS [open] { display:none })
    // -- disparaît à l'ouverture, RÉAPPARAÎT à la fermeture, sur tous les
    // rapports (nouveaux ou non), à chaque fois.
    (estNouveau ? '<p class="reperes-rapport-badge-nouveau">&#128276; Nouveau rapport</p>' : '') +
    '<p class="reperes-rapport-indice">&#128073; Cliquez sur ce rapport pour le consulter en détail.</p>' +
    '<div class="reperes-rapport-contenu">' +
    // TACHE (retour utilisateur, 2026-08-26, "Aller plus loin ne peut pas
    // rester tout en bas, oublié, négligé - c'est une fonction phare") :
    // déplacé en TÊTE du contenu (avant même "Ce qui revient"), pulse
    // bleu calme (même mécanisme que .reperes-analyse-pulse, déjà utilisé
    // pour "Voir mon analyse") à CHAQUE ouverture de ce rapport, jamais
    // seulement la première fois -- voir le toggle listener dans
    // _reperesBrancherPulseRapports(). Toujours accessible ici, jamais
    // forcé juste après l'import -- pour n'importe quel rapport
    // '1ere'/'2e-regard' déjà enregistré, jamais sur 'aller-plus-loin'
    // (pas de questions à approfondir à ce stade, voir
    // regardExterieurLancerApprofondirDepuisRapport()).
    (r.type !== 'aller-plus-loin'
      ? '<div class="reperes-rapport-aller-plus-loin-bloc text-center mb-3">' +
        '<button type="button" class="btn btn-primary" data-repere-rapport-aller-plus-loin="' + r.id + '">&#10133; Aller plus loin</button>' +
        '<p class="small text-muted mt-1 mb-0">Répondez à quelques questions ciblées pour approfondir certains sujets de cette analyse, sans tout refaire.</p>' +
        '</div>'
      : '') +
    reponses + contenu +
    (reperes ? '<div class="reperes-rapport-reperes-concernes"><h6>Repères concernés</h6><p class="text-muted small">Voici les Repères qui ont servi à réaliser cette analyse :</p>' + reperes + '</div>' : '') +
    // TACHE (retour utilisateur, 2026-08-26, "Fermer le rapport" +
    // Supprimer à droite) : le rapport peut être long -- ce bouton évite
    // de remonter tout en haut pour le refermer. Remplace "Aller plus
    // loin" à cet emplacement (monté en tête, voir plus haut).
    '<div class="reperes-rapport-bas">' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" data-repere-rapport-fermer="' + r.id + '">Fermer le rapport</button>' +
    // TACHE (chantier "repertoire des freins", etape 7, 2026-08-28) : "Point
    // sur ma situation" -- apercu avant impression de TOUT le rapport, remis
    // en forme comme un document a emmener chez un conseiller (facade
    // regardExterieurOuvrirPointSituation, modules/regard-exterieur/index.js).
    '<button type="button" class="btn btn-outline-primary btn-sm" data-repere-rapport-point-situation="' + r.id + '">&#128221; Point sur ma situation</button>' +
    '<button type="button" class="btn btn-outline-danger btn-sm" data-repere-rapport-supprimer="' + r.id + '">Supprimer ce rapport</button>' +
    '</div>' +
    '</div>' +
    '</details>';
}

function _reperesRenduRapportsListe() {
  var tous = typeof regardExterieurTousLesRapports === 'function' ? regardExterieurTousLesRapports() : [];
  var filtres = _reperesRapportsFiltreActuel === 'tous' ? tous : tous.filter(function (r) { return r.type === _reperesRapportsFiltreActuel; });
  // TACHE (retour utilisateur, 2026-08-26, recherche) : réduit la MÊME
  // liste (déjà filtrée par onglet de type) au texte tapé -- jamais une
  // 2e liste séparée. Les cartes affichées restent les vraies cartes,
  // ouvrables exactement pareil qu'en dehors d'une recherche.
  var q = _reperesRapportsRecherche.trim().toLowerCase();
  if (q) { filtres = filtres.filter(function (r) { return _reperesRapportTexteRecherche(r).indexOf(q) !== -1; }); }
  if (!filtres.length) {
    return q
      ? '<div class="reperes-etat-vide"><span class="reperes-ic">&#128269;</span><p>Aucun rapport ne correspond à cette recherche.</p></div>'
      : '<div class="reperes-etat-vide"><span class="reperes-ic">&#128193;</span><p>Aucun rapport pour l’instant dans cette catégorie.</p></div>';
  }
  return filtres.map(_reperesRenduUnRapport).join('');
}

// TACHE (retour utilisateur, 2026-08-26, recherche dans "Mes rapports") :
// TACHE (retour utilisateur, 2026-08-26) : rappel de sauvegarde visible
// sur TOUS les onglets de cette page ("il faut les embêter à
// sauvegarder") -- même bandeau, même icône 💾 que partout ailleurs dans
// l'app, régénéré à chaque changement d'onglet (voir _reperesRenduPageRapports()).
// TACHE (chantier "repertoire des freins", etape 9) : bouton "Mes freins
// identifies (N)" -- rendu vide si aucun frein consolide, ou si la facade
// de Regard exterieur n'est pas disponible. Icone clef (jamais l'ancre du
// Carnet, jamais un ton fataliste -- decision Denis).
function _reperesRenduBoutonMesFreins() {
  if (typeof regardExterieurFreinsConsolides !== 'function') { return ''; }
  var n = regardExterieurFreinsConsolides().length;
  if (!n) { return ''; }
  return '<button type="button" class="btn btn-sm reperes-rapports-mesfreins" data-repere-ouvrir-mes-freins>' +
    '&#128477;&#65039; Mes freins identifiés (' + n + ')</button>';
}

function _reperesRenduPageRapports() {
  return '<button type="button" class="btn btn-sm reperes-bouton-rapports mb-3" data-repere-rapports-retour>&#8592; <i class="bi bi-bookmark-star"></i> Retour à Mes Repères</button>' +
    // TACHE (retour utilisateur, 2026-08-26) : petite légende expliquant
    // que "🔭 1ère analyse" peut être approfondie -- cliquer sur ce
    // rapport, puis "Aller plus loin" en bas de son contenu.
    '<p class="reperes-legende-rapports-approfondir">Toute analyse marquée <span class="reperes-rapport-badge reperes-rapport-badge-1ere">&#128301; 1ère analyse</span> peut être approfondie : cliquez sur ce rapport, puis sur « Aller plus loin ».</p>' +
    '<div class="cv-section" style="background:var(--accent-bg-subtle);border-radius:12px;padding:0.85rem 1.25rem;margin-bottom:1rem;text-align:center;">' +
    '<p class="mb-0">&#128190; Pensez à sauvegarder votre session pour conserver ces rapports.</p></div>' +
    '<div class="reperes-rapports-filtre-ligne">' +
    '<div class="reperes-rapports-filtre">' +
    ['tous', '1ere', 'aller-plus-loin', '2e-regard'].map(function (cle) {
      var libelle = cle === 'tous' ? 'Tous' : _REPERES_RAPPORT_BADGES[cle].libelle;
      return '<button type="button" class="' + (_reperesRapportsFiltreActuel === cle ? 'is-active' : '') + '" data-repere-rapport-filtre="' + cle + '">' + libelle + '</button>';
    }).join('') +
    '</div>' +
    // TACHE (chantier "repertoire des freins", etape 9, 2026-08-28) : le
    // bloc de droite ("Mes freins identifies" + la recherche) reste
    // groupe et pousse a droite (loin des onglets = filtres par type,
    // pres de la recherche = "ce qu'on cherche dans ses rapports",
    // decision Denis). "Mes freins identifies" n'apparait que s'il y a au
    // moins un frein -- jamais un "voici vos problemes" dans le vide.
    '<div class="reperes-rapports-actions-droite">' +
    _reperesRenduBoutonMesFreins() +
    // TACHE (retour utilisateur, 2026-08-26) : recherche partagée par les
    // 4 onglets ci-dessus -- filtre la liste juste en dessous, jamais une
    // zone séparée (voir _reperesRenduRapportsListe()).
    '<input type="search" class="reperes-rapports-recherche-champ" id="reperesRapportsRechercheChamp" ' +
      'placeholder="&#128269; Rechercher dans mes rapports" value="' + echapperAttribut(_reperesRapportsRecherche) + '">' +
    '</div>' +
    '</div>' +
    '<div id="reperesRapportsListe">' + _reperesRenduRapportsListe() + '</div>';
}

// TACHE (retour utilisateur, 2026-08-26, "rester sur la page") : "Mes
// rapports" n'ouvrant plus de fenêtre à part, confirmerAction() (qui,
// elle, ouvre toujours sa propre petite fenêtre pour la confirmation)
// ne rentre plus jamais en conflit avec quoi que ce soit -- la page en
// dessous ne bouge pas pendant que la confirmation est affichée, un
// simple _reperesRafraichirListe() après suppression suffit désormais
// (plus besoin de rouvrir quoi que ce soit, voir l'historique git pour
// l'ancienne version à base de fenêtre).
function _reperesBrancherEvenementsAllerPlusLoinRapport(racine) {
  racine.querySelectorAll('[data-repere-rapport-aller-plus-loin]').forEach(function (btn) {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      var id = btn.getAttribute('data-repere-rapport-aller-plus-loin');
      if (typeof regardExterieurLancerApprofondirDepuisRapport === 'function') { regardExterieurLancerApprofondirDepuisRapport(id); }
    });
  });
}

function _reperesBrancherEvenementsSuppressionRapport(racine) {
  racine.querySelectorAll('[data-repere-rapport-supprimer]').forEach(function (btn) {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      var id = btn.getAttribute('data-repere-rapport-supprimer');
      confirmerAction(
        'Supprimer ce rapport ?',
        'Ce rapport sera définitivement supprimé, il ne sera plus possible de le récupérer.',
        'Supprimer', 'btn-danger',
        function () {
          if (typeof regardExterieurSupprimerRapport === 'function') { regardExterieurSupprimerRapport(id); }
          _reperesRafraichirListe();
        }
      );
    });
  });
}

// TACHE (chantier "repertoire des freins", etape 7, 2026-08-28) : bouton
// "Point sur ma situation" dans le bas de chaque carte de rapport ->
// apercu avant impression de TOUT le rapport (facade de Regard exterieur,
// jamais un acces direct au rendu du rapport depuis ce module).
function _reperesBrancherEvenementsPointSituationRapport(racine) {
  racine.querySelectorAll('[data-repere-rapport-point-situation]').forEach(function (btn) {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      var id = btn.getAttribute('data-repere-rapport-point-situation');
      var rapport = (typeof regardExterieurTousLesRapports === 'function' ? regardExterieurTousLesRapports() : [])
        .filter(function (r) { return r.id === id; })[0];
      if (rapport && typeof regardExterieurOuvrirPointSituation === 'function') {
        regardExterieurOuvrirPointSituation(rapport);
      }
    });
  });
}

function _reperesBrancherRetourRapports(racine) {
  var btn = racine.querySelector('[data-repere-rapports-retour]');
  if (!btn) { return; }
  btn.addEventListener('click', function () {
    _reperesModeAffichage = 'reperes';
    _reperesRafraichirListe();
  });
}

// TACHE (retour utilisateur, 2026-08-26, recherche) : filtre la liste en
// place, comme un onglet de plus -- rebranche les mêmes écouteurs que la
// liste normale (suppression, pulse) puisque ce sont les mêmes vraies
// cartes, jamais une variante.
function _reperesBrancherRechercheRapports(racine) {
  var champ = racine.querySelector('#reperesRapportsRechercheChamp');
  if (!champ) { return; }
  champ.addEventListener('input', function () {
    _reperesRapportsRecherche = champ.value;
    var zone = racine.querySelector('#reperesRapportsListe');
    if (zone) { zone.innerHTML = _reperesRenduRapportsListe(); }
    _reperesBrancherEvenementsSuppressionRapport(racine);
    _reperesBrancherEvenementsPointSituationRapport(racine);
    _reperesBrancherPulseRapports(racine);
    if (typeof regardExterieurBrancherBoutonsGarderRepere === 'function') { regardExterieurBrancherBoutonsGarderRepere(racine); }
    if (typeof regardExterieurBrancherToggleVues === 'function') { regardExterieurBrancherToggleVues(racine); }
  });
}

function _reperesBrancherEvenementsRapports(racine) {
  racine.querySelectorAll('[data-repere-rapport-filtre]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _reperesRapportsFiltreActuel = btn.getAttribute('data-repere-rapport-filtre');
      racine.querySelectorAll('[data-repere-rapport-filtre]').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var zone = racine.querySelector('#reperesRapportsListe');
      if (zone) { zone.innerHTML = _reperesRenduRapportsListe(); }
      _reperesBrancherEvenementsSuppressionRapport(racine);
      _reperesBrancherEvenementsAllerPlusLoinRapport(racine);
      _reperesBrancherEvenementsPointSituationRapport(racine);
      _reperesBrancherPulseRapports(racine);
      if (typeof regardExterieurBrancherBoutonsGarderRepere === 'function') { regardExterieurBrancherBoutonsGarderRepere(racine); }
      if (typeof regardExterieurBrancherToggleVues === 'function') { regardExterieurBrancherToggleVues(racine); }
    });
  });
  _reperesBrancherEvenementsSuppressionRapport(racine);
  _reperesBrancherEvenementsAllerPlusLoinRapport(racine);
  _reperesBrancherEvenementsPointSituationRapport(racine);
  _reperesBrancherPulseRapports(racine);
  if (typeof regardExterieurBrancherBoutonsGarderRepere === 'function') { regardExterieurBrancherBoutonsGarderRepere(racine); }
  if (typeof regardExterieurBrancherToggleVues === 'function') { regardExterieurBrancherToggleVues(racine); }
  _reperesBrancherRetourRapports(racine);
  _reperesBrancherRechercheRapports(racine);
  // TACHE (chantier "repertoire des freins", etape 9) : le bouton "Mes
  // freins identifies" survit aux changements d'onglet (rendu dans la
  // ligne d'onglets, jamais dans #reperesRapportsListe) -- cable une seule
  // fois ici, avec le reste de la page.
  var btnMesFreins = racine.querySelector('[data-repere-ouvrir-mes-freins]');
  if (btnMesFreins && typeof regardExterieurOuvrirMesFreins === 'function') {
    btnMesFreins.addEventListener('click', regardExterieurOuvrirMesFreins);
  }
  // TACHE (retour utilisateur, 2026-08-26, notification "nouveau rapport") :
  // "Retour à Mes Repères" pulse doucement dès qu'un rapport vient d'être
  // FERMÉ (jamais à l'ouverture) -- invite à revenir une fois la lecture
  // terminée. État purement visuel, jamais persisté (juste pour CETTE
  // visite de la page).
  racine.querySelectorAll('.reperes-rapport').forEach(function (details) {
    details.addEventListener('toggle', function () {
      if (!details.open) {
        var btnRetour = racine.querySelector('[data-repere-rapports-retour]');
        if (btnRetour) { btnRetour.classList.add('reperes-analyse-pulse'); }
        return;
      }
      // TACHE (retour utilisateur, 2026-08-26, "Aller plus loin ne peut
      // pas rester oublié") : pulse bleu calme à CHAQUE ouverture de ce
      // rapport (jamais seulement la première fois) -- même mécanisme
      // que "Voir mon analyse"/"Mes rapports", 10s puis s'arrête tout
      // seul, jamais retiré manuellement.
      var btnAller = details.querySelector('[data-repere-rapport-aller-plus-loin]');
      if (btnAller) {
        btnAller.classList.remove('reperes-analyse-pulse');
        void btnAller.offsetWidth;
        btnAller.classList.add('reperes-analyse-pulse');
      }
    });
  });
  racine.querySelectorAll('[data-repere-rapport-fermer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var details = btn.closest('.reperes-rapport');
      if (details) { details.open = false; details.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

function _reperesOuvrirRapports() {
  _reperesModeAffichage = 'rapports';
  _reperesRapportsFiltreActuel = 'tous';
  _reperesRapportEnSurbrillance = null;
  _reperesRapportsVusPendantRecherche = [];
  _reperesRapportsRecherche = '';
  if (typeof trackEvenement === 'function') { trackEvenement('reperes_rapports_ouverts'); }
  _reperesRafraichirListe();
}

// TACHE (retour utilisateur, 2026-08-26, bouton "Voir le rapport") :
// bascule sur "Mes rapports", filtre "Tous" (un Repère peut apparaître
// dans plusieurs types de rapport à la fois) avec les rapports concernés
// en surbrillance douce -- jamais un filtre pré-appliqué qui masquerait
// un des rapports où ce Repère apparaît. Fait défiler jusqu'au premier
// rapport en surbrillance, la page pouvant être longue.
function _reperesOuvrirRapportsPourRepere(repereId) {
  _reperesModeAffichage = 'rapports';
  _reperesRapportsFiltreActuel = 'tous';
  _reperesRapportEnSurbrillance = repereId;
  _reperesRapportsVusPendantRecherche = [];
  _reperesRapportsRecherche = '';
  if (typeof trackEvenement === 'function') { trackEvenement('reperes_voir_rapport_depuis_repere'); }
  _reperesRafraichirListe();
  var premier = document.querySelector('.reperes-rapport-pulse');
  if (premier && premier.scrollIntoView) { premier.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

// TACHE (retour utilisateur, 2026-08-26) : consulter un rapport EN
// SURBRILLANCE (l'ouvrir, via le <details> natif) l'arrête de pulser
// définitivement pour cette recherche, sans toucher aux autres rapports
// liés au même Repère -- jamais tout-ou-rien. Mémorisé dans
// _reperesRapportsVusPendantRecherche pour survivre à un changement de
// filtre (qui reconstruit la liste depuis zéro).
function _reperesBrancherPulseRapports(racine) {
  racine.querySelectorAll('.reperes-rapport-pulse').forEach(function (details) {
    details.addEventListener('toggle', function () {
      if (!details.open) { return; }
      var id = details.getAttribute('data-repere-rapport');
      if (id && _reperesRapportsVusPendantRecherche.indexOf(id) === -1) { _reperesRapportsVusPendantRecherche.push(id); }
      details.classList.remove('reperes-rapport-pulse');
      // TACHE (retour utilisateur, 2026-08-26, notification "nouveau
      // rapport") : marque le rapport vu quel que soit le chemin
      // d'ouverture (ici : la carte elle-même dans "Mes rapports"),
      // jamais seulement via "Voir mon analyse" -- voir
      // regardExterieurMarquerRapportVu(). Retire aussi la mention
      // "Nouveau rapport", qui ne doit plus jamais réapparaître.
      if (id && typeof regardExterieurMarquerRapportVu === 'function') { regardExterieurMarquerRapportVu(id); }
      var mention = details.querySelector('.reperes-rapport-badge-nouveau');
      if (mention) { mention.remove(); }
    });
  });
}

// TACHE (retour utilisateur, 2026-08-26) : chaque phrase déplacée plus
// bas, calculée seulement une fois `reperesVisiblesOnglet` connu (voir
// plus bas dans cette fonction) -- "⏳ Non Analysés" ne doit apparaître
// que s'il y a réellement au moins un Repère dans cet onglet, jamais
// affichée pour un onglet vide. "🔭 Déjà Analysés" mentionne maintenant
// explicitement où retrouver le résultat (onglet "🔭 Déjà Analysés" pour
// le Repère, "📁 Mes rapports" pour l'analyse complète).
function _reperesRenduFiltre() {
  // TACHE (retour utilisateur, 2026-08-26) : legende des boutons d'un
  // Repere analyse ou en 2e regard (_reperesRenduItem()) -- une seule
  // fois ici, jamais repetee sur chaque Repere ("pas trop grand").
  // Repliee par defaut (<details>), meme mecanisme que les rubriques
  // "En savoir plus" de l'ecran d'accueil. Chaque ligne reprend le MEME
  // fond colore que le vrai bouton qu'elle explique -- reconnaissance
  // par la couleur, pas seulement par le mot lu.
  var libelleRepasser = _reperesFiltreActuel === 'deuxieme-regard'
    ? '<li><span class="reperes-legende-pastille reperes-btn-analyse-repasser">&#128281; Repasser</span> : remet ce Repère dans « Déjà analysés ».</li>'
    : '<li><span class="reperes-legende-pastille reperes-btn-analyse-repasser">&#128281; Repasser</span> : remet ce Repère dans « Non analysés », pour pouvoir l\'envoyer à un nouveau Regard Extérieur plus tard.</li>';
  // TACHE (retour utilisateur, 2026-08-26) : cachée tant que l'onglet
  // (une fois la recherche prise en compte aussi -- une recherche qui ne
  // trouve rien ne doit pas non plus laisser la légende affichée pour des
  // boutons devenus invisibles) n'a réellement rien à expliquer. "On ne
  // va pas submerger avec des informations qui ne répondent pas à un
  // besoin du moment" (retour explicite de Denis).
  var reperesVisiblesOnglet = _reperesReperesDansOnglet(_reperesFiltreActuel);
  var qLegende = _reperesRecherche.trim().toLowerCase();
  if (qLegende) { reperesVisiblesOnglet = reperesVisiblesOnglet.filter(function (r) { return _reperesTexteRechercheRepere(r).indexOf(qLegende) !== -1; }); }
  var explication = '';
  if (_reperesFiltreActuel === 'deuxieme-regard' && reperesVisiblesOnglet.length) {
    explication = '🔬 Ces Repères ont été envoyés une seconde fois, pour aller plus loin sur certains points precis : vous retrouvez ici ce qui vous a été répondu.';
  } else if (_reperesFiltreActuel === 'analyses' && reperesVisiblesOnglet.length) {
    explication = '🔭 Ces Repères ont déjà été traités dans l\'onglet 🔭 Déjà Analysés. Vous retrouverez les rapports de ces analyses dans 📁 Mes rapports.';
  } else if (_reperesFiltreActuel === 'non-analyses' && reperesVisiblesOnglet.length) {
    explication = '⏳ Ces Repères n\'ont pas encore été envoyés à un assistant pour un Regard Extérieur : c\'est vous qui choisissez lesquels envoyer, et quand.';
  }
  var legendeBoutons = (_reperesFiltreActuel === 'analyses' || _reperesFiltreActuel === 'deuxieme-regard') && reperesVisiblesOnglet.length
    ? '<details class="reperes-legende-boutons"><summary>À quoi servent les boutons ?</summary>' +
      '<ul class="reperes-legende-boutons-liste">' +
      '<li><span class="reperes-legende-pastille reperes-btn-analyse-copier">&#128203; Copier</span> : copie le texte de ce Repère, pour pouvoir le récupérer ailleurs.</li>' +
      '<li><span class="reperes-legende-pastille reperes-btn-analyse-rapport">&#128193; Voir le rapport</span> : ouvre « Mes rapports » et met en évidence les rapports où ce Repère a été utilisé.</li>' +
      libelleRepasser +
      '<li><span class="reperes-legende-pastille reperes-btn-analyse-supprimer">&#128465;&#65039; Supprimer</span> : supprime définitivement ce Repère.</li>' +
      '</ul></details>'
    : '';
  // TACHE (retour utilisateur, 2026-08-26, recherche) : même visuel/
  // mécanisme que "Mes rapports" (input#reperesRapportsRechercheChamp),
  // mais SÉPARÉE (voir _reperesRecherche) -- sa propre ligne, entre le
  // bouton "Mes rapports" et les 3 onglets Non analysés/Déjà analysés/
  // Deuxième regard, poussée à droite. Masquée s'il n'y a encore aucun
  // Repère (rien à chercher), même logique que les autres boutons
  // conditionnels de cette page.
  var barreRecherche = _reperesListe().length
    ? '<div class="reperes-recherche-ligne">' +
      '<input type="search" class="reperes-rapports-recherche-champ" id="reperesRechercheChamp" ' +
        'placeholder="&#128269; Rechercher dans mes Repères" value="' + echapperAttribut(_reperesRecherche) + '">' +
      '</div>'
    : '';
  return _reperesRenduEnteteRapports() + barreRecherche + '<div class="reperes-filtre">' +
    '<button type="button" class="' + (_reperesFiltreActuel === 'non-analyses' ? 'is-active' : '') + '" data-repere-filtre="non-analyses">⏳ Non Analysés</button>' +
    '<button type="button" class="' + (_reperesFiltreActuel === 'analyses' ? 'is-active' : '') + '" data-repere-filtre="analyses">🔭 Déjà Analysés</button>' +
    '<button type="button" class="' + (_reperesFiltreActuel === 'deuxieme-regard' ? 'is-active' : '') + '" data-repere-filtre="deuxieme-regard">🔬 Deuxième Regard</button>' +
    '</div>' +
    (explication ? '<p class="reperes-filtre-explication">' + explication + '</p>' : '') +
    legendeBoutons;
}

function _reperesRenduListe() {
  var tous = _reperesListe();
  if (!tous.length) {
    return '<div class="reperes-etat-vide"><i class="bi bi-bookmark-star reperes-ic"></i>' +
      '<p>Vous n’avez pas encore de Repère. Ça viendra naturellement, au fil de vos réflexions.</p></div>';
  }
  var filtres = _reperesReperesDansOnglet(_reperesFiltreActuel);
  // TACHE (retour utilisateur, 2026-08-26, recherche) : réduit la MÊME
  // liste (déjà filtrée par onglet) au texte tapé -- jamais une 2e liste
  // séparée, même principe que _reperesRenduRapportsListe().
  var q = _reperesRecherche.trim().toLowerCase();
  var reperesFiltresParTexte = q ? filtres.filter(function (r) { return _reperesTexteRechercheRepere(r).indexOf(q) !== -1; }) : filtres;
  // TACHE (retour utilisateur, 2026-08-26) : lien vers la dernière analyse
  // obtenue -- apparaît sur les onglets "Déjà analysés" ET "Deuxième
  // regard" (les 2 ont un résultat à consulter), seulement si une
  // analyse a réellement été sauvegardée (voir
  // regardExterieurAAnalyseSauvegardee(), façade de lecture -- jamais un
  // accès direct à une variable privée d'un autre module).
  // TACHE (retour utilisateur, 2026-08-26) : agrandi (n'est plus btn-sm/
  // outline) et pulse en bleu tant que la personne n'a jamais ouvert
  // CETTE analyse depuis ce bouton (regardExterieurAnalyseDejaVue()) --
  // "Voir mon analyse" juste après import, "Revoir ma dernière analyse"
  // une fois déjà ouverte. Doit rester très visible : c'est le seul
  // chemin vers un résultat qui a demandé un vrai effort (copier/coller
  // dans un assistant) pour l'obtenir.
  // TACHE (chantier "Phase B", "Mes rapports") : `typeRapport` distingue
  // désormais l'analyse '1ere' (onglet "Déjà analysés") de '2e-regard'
  // (onglet "Deuxième regard") -- chacune a son propre rapport, jamais
  // mélangées (voir regardExterieurAAnalyseSauvegardee()/
  // regardExterieurAnalyseDejaVue(), façades qui prennent désormais ce
  // paramètre).
  var typeRapport = _reperesFiltreActuel === 'deuxieme-regard' ? '2e-regard' : '1ere';
  var analyseDejaVue = typeof regardExterieurAnalyseDejaVue === 'function' && regardExterieurAnalyseDejaVue(typeRapport);
  var afficherLienAnalyse = (_reperesFiltreActuel === 'analyses' || _reperesFiltreActuel === 'deuxieme-regard')
    && typeof regardExterieurAAnalyseSauvegardee === 'function' && regardExterieurAAnalyseSauvegardee(typeRapport);
  // TACHE (retour utilisateur, 2026-08-26) : petite phrase explicative
  // sous chaque bouton -- jamais partagée entre les deux (chacun explique
  // sa PROPRE action), courte, une seule ligne (voir .reperes-analyse-souscaption).
  var lienRevoirAnalyse = afficherLienAnalyse
    ? '<div class="reperes-analyse-bloc"><button type="button" class="btn btn-primary reperes-bouton-analyse' + (analyseDejaVue ? '' : ' reperes-analyse-pulse') + '" data-repere-revoir-analyse data-repere-type-rapport="' + typeRapport + '">&#128301; ' +
      (analyseDejaVue ? 'Revoir ma dernière analyse' : 'Voir mon analyse') + '</button>' +
      '<p class="reperes-analyse-souscaption">' +
      (analyseDejaVue ? 'Retrouvez le dernier retour de l\'assistant.' : 'Les résultats tout juste reçus de l\'assistant.') +
      '</p></div>'
    : '';
  // TACHE (retour utilisateur, 2026-08-26) : "Demander un Deuxième Regard"
  // visible sur "Déjà analysés" ET "Deuxième regard" désormais (avant :
  // uniquement "Déjà analysés" -- Denis voulait pouvoir choisir une
  // sélection DIFFÉRENTE de Repères depuis l'onglet "Deuxième regard" lui-
  // même, sans devoir repasser par "Déjà analysés"). La condition reste
  // toujours basée sur le VRAI vivier de candidats (Repères analysés pas
  // encore approfondis, `r.analyse && !r.approfondi`) -- jamais sur
  // `filtres`, qui varie selon l'onglet actif et ne représente les bons
  // candidats que sur "Déjà analysés". regardExterieurLancerDeuxiemeRegard()
  // ouvre déjà son propre écran de sélection (cases à cocher parmi ces
  // mêmes candidats) -- rien à construire ici, juste rendre le bouton
  // atteignable depuis les deux onglets. Poussé à l'opposé de "Voir mon
  // analyse"/"Revoir ma dernière analyse" via .reperes-ligne-analyse
  // (justify-content:space-between) -- jamais côte à côte, jamais confondus.
  var candidatsDeuxiemeRegard = _reperesReperesDansOnglet('analyses');
  var boutonDeuxiemeRegard = ((_reperesFiltreActuel === 'analyses' || _reperesFiltreActuel === 'deuxieme-regard') && candidatsDeuxiemeRegard.length)
    ? '<div class="reperes-analyse-bloc"><button type="button" class="btn btn-primary" data-repere-demander-deuxieme-regard>&#128300; Demander un Deuxième Regard</button>' +
      '<p class="reperes-analyse-souscaption">Renvoie ces Repères à l\'assistant tels quels, sans nouvelle question - différent de « Aller plus loin », qui vous pose des questions ciblées.</p></div>'
    : '';
  var ligneAnalyse = (lienRevoirAnalyse || boutonDeuxiemeRegard)
    ? '<div class="reperes-ligne-analyse mb-3">' + lienRevoirAnalyse + boutonDeuxiemeRegard + '</div>'
    : '';
  if (!reperesFiltresParTexte.length) {
    return ligneAnalyse + (q
      ? '<div class="reperes-etat-vide"><span class="reperes-ic">&#128269;</span>' +
        '<p>Aucun Repère ne correspond à cette recherche.</p></div>'
      : _reperesFiltreActuel === 'deuxieme-regard'
      ? '<div class="reperes-etat-vide"><span class="reperes-ic">&#128300;</span>' +
        '<p>Aucun Repère n’a encore fait l’objet d’un Deuxième Regard.</p></div>'
      : _reperesFiltreActuel === 'analyses'
      ? '<div class="reperes-etat-vide"><span class="reperes-ic">&#128301;</span>' +
        '<p>Aucun Repère analysé pour l’instant. Ils apparaîtront ici une fois un Regard Extérieur reçu.</p></div>'
      : '<div class="reperes-etat-vide"><span class="reperes-ic">&#9989;</span>' +
        '<p>Tous vos Repères ont déjà été analysés. Vous les retrouverez dans l\'onglet 🔭 Déjà Analysés, et le rapport de cette analyse dans 📁 Mes rapports.</p></div>');
  }
  return ligneAnalyse + '<div class="reperes-colonnes">' +
    Object.keys(_REPERES_TYPES).map(function (cle) { return _reperesRenduColonne(cle, reperesFiltresParTexte); }).join('') +
    '</div>';
}

// TACHE (retour utilisateur : "Win + H, pour que les gens dictent a la
// place d'ecrire") : meme encart, meme texte, meme style que celui deja
// utilise pour la zone de recit libre de Decouverte des competences
// (modules/decouverte-competences/decouverteParcours.js) et desormais
// pour le Carnet (modules/carnet/index.js) -- jamais mutualisee entre
// modules (chacun garde sa propre copie, meme principe que le reste de
// ce fichier), mais un texte et un style identiques partout. Placee
// sous le titre, avant tout contenu : Repères n'a aucune zone de texte
// libre A LA CREATION (juste un type a choisir) -- le seul champ libre
// est "Ajoutez quelques mots", facultatif, sur un Repère déjà créé.
// Visible dès l'arrivée sur l'écran plutôt que seulement au moment où ce
// champ apparaît : la personne peut ne jamais le déplier, mais découvrir
// l'astuce ici reste utile même si elle ne s'en sert que plus tard.
function _reperesRenduAstuceDictee() {
  return '<p class="mb-2 p-2" style="background:var(--accent-bg-subtle);border:1px solid var(--accent);border-radius:6px;font-size:0.95rem;color:var(--text-strong);">' +
    '💡 <strong>Astuce : utilisez <span style="white-space:nowrap;">Windows + H</span> pour dicter votre texte à la voix</strong> ' +
    'plutôt que de tout taper au clavier.' +
    '</p>';
}

// Écran d'accueil du module -- affiché automatiquement à la toute
// première visite (dossier.reperesIntroVue absent/false), puis
// seulement à la demande via le bouton "Revoir l'explication" de
// l'écran principal (voir _reperesRenduEcran(), pageReperes()).
// TACHE (retour utilisateur, 2026-08-26, maquette discutée puis
// validée) : le texte de chaque rubrique est volontairement DIFFÉRENT
// de celui déjà utilisé à l'intérieur du module (_REPERES_TYPES,
// _reperesRenduAstuceDictee()...) -- "c'est très pauvre" en reprenant
// mot pour mot le texte court déjà présent ailleurs, la plus-value de
// cet écran est justement d'apporter plus d'explications, avec un
// "En savoir plus" dépliable pour qui veut approfondir.
// dossier.reperesIntroVue est une clé PLATE du dossier (jamais une
// propriété posée sur dossier.reperes, qui est un TABLEAU -- une
// propriété custom posée sur un tableau est perdue dès qu'un filter()
// en recrée un nouveau, voir _reperesSupprimer()).
function _reperesRenduAccueil() {
  var estRetour = !!dossier.reperesIntroVue;
  // En detour depuis l'ecran de travail (_reperesForcerAccueil) : bouton
  // partage qui revient exactement la ou on etait, meme place / forme /
  // libelle que tous les modules (chantier "bouton presentation").
  var enDetour = !!_reperesForcerAccueil;
  return '<div class="page-catalogue-contenu">' +
    (enDetour && typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule('btnReperesRevenirModule', 'bi-bookmark-star', 'Revenir au module', true)
      : '') +
    '<div class="reperes-accueil-entete">' +
      // TACHE (retour Denis, 2026-08-31) : une seule icone d'identite du
      // module, celle du titre (en couleur d'accent) -- l'icone "heros"
      // separee juste au-dessus faisait doublon et restait noire.
      '<h1 style="margin:0 0 0.5rem;"><i class="bi bi-bookmark-star"></i> Mes Repères</h1>' +
      '<p class="reperes-accueil-accroche">Un espace pour garder vos réflexions au fil du temps, sans avoir à savoir tout de suite ce que vous allez en faire.</p>' +
    '</div>' +

    // TACHE (intro remise au gabarit commun, Denis 2026-09-09) : meme
    // habillage que _carnetRenduIntro() -- blocs .cv-section, titres <h4>
    // + emoji en casse normale, encarts a fond --accent-bg-subtle, rappels
    // a filet gauche. Contenu inchange (ordre LANGAGE_VISUEL_COMMUN
    // section 5), juste re-range. Journal + Regard Exterieur + Aller plus
    // loin regroupes en un seul bloc (choix Denis). Aucune fonction
    // touchee : "Je commence"/"Je reprends", data-repere-revenir-module,
    // dossier.reperesIntroVue, barre du bas.
    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);text-align:center;">' +
      '<p class="mb-0">On a souvent une pensée juste au mauvais moment (dans le bus, juste après un rendez-vous), et elle file avant qu\'on ait pu en faire quelque chose. <strong>Mes Repères, c\'est l\'endroit où la poser</strong>, en quelques mots, pour la retrouver quand vous en aurez besoin.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#127919; À quoi ça sert</h4>' +
      '<p class="mb-0">Une question qui vous traverse l\'esprit, une idée, un sujet que vous voulez creuser plus tard, quelque chose dont vous aimeriez parler à quelqu\'un : vous le notez ici, en quelques mots. Rien n\'est obligatoire, rien n\'est jugé : c\'est votre espace, pour vous.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#128203; Ce qui va se passer</h4>' +
      '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous notez une réflexion en quelques mots, au moment où elle vous vient. Aucune forme imposée, aucune longueur minimale.</li>' +
        '<li>Si vous le voulez, vous lui donnez un type (une question, une idée, un sujet à approfondir, un sujet à discuter). Sinon, vous la laissez telle quelle.</li>' +
        '<li>Vos Repères restent rangés sur cette page, du plus récent au plus ancien. Vous les relisez, les modifiez ou les supprimez quand vous voulez.</li>' +
      '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#127991;&#65039; Les quatre types de Repère</h4>' +
      '<p>Optionnels : ils servent juste à s\'y retrouver plus tard.</p>' +
      '<div class="reperes-accueil-types">' +
        '<div class="reperes-accueil-type">' +
          '<div class="reperes-accueil-type-nom">&#128204; Question</div>' +
          '<p>Une question qui vous trotte dans la tête, sur un poste, une formation, une démarche à faire... Notez-la, même sans réponse.</p>' +
          '<details class="reperes-accueil-savoir-plus"><summary>En savoir plus</summary>' +
            '<p class="reperes-accueil-detail">Ça peut être une question toute simple ("Comment on calcule les congés payés ?") ou plus personnelle ("Dois-je parler de mon arrêt de travail en entretien ?"). Vous n\'êtes pas obligé(e) de trouver la réponse seul(e) : vous pourrez la reprendre plus tard, la poser à un assistant, ou en parler avec la personne qui vous accompagne.</p>' +
          '</details>' +
        '</div>' +
        '<div class="reperes-accueil-type">' +
          '<div class="reperes-accueil-type-nom">&#128161; Idée</div>' +
          '<p>Une idée liée à votre recherche : un métier à explorer, une entreprise qui vous intéresse, une piste de reconversion...</p>' +
          '<details class="reperes-accueil-savoir-plus"><summary>En savoir plus</summary>' +
            '<p class="reperes-accueil-detail">Les idées viennent souvent au mauvais moment, en dehors de l\'application : notez-les vite, même en quelques mots, pour ne pas les perdre. Certaines ne mèneront à rien, et c\'est normal ; d\'autres pourront devenir un vrai axe de travail.</p>' +
          '</details>' +
        '</div>' +
        '<div class="reperes-accueil-type">' +
          '<div class="reperes-accueil-type-nom">&#128269; À approfondir</div>' +
          '<p>Un sujet que vous ne maîtrisez pas encore et que vous aimeriez mieux comprendre.</p>' +
          '<details class="reperes-accueil-savoir-plus"><summary>En savoir plus</summary>' +
            '<p class="reperes-accueil-detail">Une fiche de paie, un terme de contrat, une posture à adopter en entretien, le fonctionnement de France Travail... Il n\'y a pas de sujet trop simple : le noter ici, c\'est se donner la possibilité d\'y revenir avec les bonnes explications, sans avoir à s\'en souvenir tout(e) seul(e).</p>' +
          '</details>' +
        '</div>' +
        '<div class="reperes-accueil-type">' +
          '<div class="reperes-accueil-type-nom">&#128172; À discuter</div>' +
          '<p>Un sujet que vous préférez aborder avec quelqu\'un plutôt que d\'y répondre seul(e).</p>' +
          '<details class="reperes-accueil-savoir-plus"><summary>En savoir plus</summary>' +
            '<p class="reperes-accueil-detail">Une difficulté, un doute, une situation personnelle qui pèse sur votre recherche... Le noter ici vous permet de ne pas l\'oublier d\'ici votre prochain échange avec un assistant, un CIP, ou toute personne qui vous accompagne.</p>' +
          '</details>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#128683; Ce que ce n\'est pas</h4>' +
      '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vos Repères ne sont <strong>jamais lus ni analysés automatiquement</strong>. Rien n\'est envoyé nulle part sans que vous le demandiez vous-même.</li>' +
        '<li>Ce n\'est pas une liste de tâches. Il n\'y a rien à finir, et rien qui vous soit reproché si vous n\'y revenez pas.</li>' +
        '<li>Personne ne note ni ne juge ce que vous écrivez : ni l\'application, ni la personne qui vous accompagne, sauf si vous choisissez de le lui montrer.</li>' +
      '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#9999;&#65039; Ce que vous pourrez faire ensuite</h4>' +
      '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Retrouver tous vos Repères au même endroit et les parcourir tranquillement, quand vous en avez le temps.</li>' +
        '<li>Ajouter vos propres mots à côté d\'un Repère : le préciser, le nuancer, ou noter où vous en êtes.</li>' +
        '<li>Relire plus tard ce que vous notiez au début de votre recherche : vos Repères gardent une trace de votre cheminement, à votre rythme.</li>' +
      '</ul>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);">' +
      '<h4><i class="bi bi-journals"></i> Le Journal de parcours, et pour aller plus loin</h4>' +
      // TACHE : meme icone que le titre "Journal de parcours" du mini-panneau
      // (_reperesRenduPanneauJournal()) et que le bouton flottant
      // #btnJournalParcours -- jamais une icone differente pour le meme
      // concept (docs/LECONS_A_NE_PAS_REPRODUIRE.md, section 9.9).
      '<p><strong>Le Journal de parcours.</strong> L\'icône que vous croiserez ailleurs dans l\'application est un raccourci direct vers vos Repères : c\'est ce même module. Depuis n\'importe quelle page, il vous permet de garder une réflexion et de revoir vos derniers Repères sans quitter la page où vous êtes.</p>' +
      '<p><strong>&#128301; Regard Extérieur.</strong> Une fois que vous avez gardé quelques Repères, vous pouvez demander à un assistant de votre choix un avis complémentaire : vous choisissez les Repères à soumettre, puis l\'assistant vous propose un premier retour (une vue d\'ensemble, des questions à vous poser, parfois des pistes de ressources). Ce n\'est jamais une vérité ni un jugement, seulement un regard en plus du vôtre, que vous restez libre de suivre ou non.</p>' +
      '<p class="mb-0"><strong>&#10133; Aller plus loin.</strong> Après un premier Regard Extérieur, vous pouvez demander à approfondir seulement les points qui vous intéressent vraiment : pas besoin de tout refaire. L\'assistant complète alors son analyse sur ces sujets précis, sans effacer ce qu\'il avait déjà dit.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#128172; Vous en verrez ailleurs aussi</h4>' +
      '<p class="mb-0">Vous croiserez parfois, dans d\'autres parties de l\'application, un bouton pour garder quelque chose comme Repère. C\'est exactement la même chose qu\'ici : ça met de côté une réflexion pour y revenir plus tard, pour y penser seul(e), en parler avec un assistant, ou avec la personne qui vous accompagne.</p>' +
    '</div>' +

    '<div class="cv-section" style="margin-bottom:1rem;">' +
      '<h4>&#9989; Bon à savoir</h4>' +
      '<div class="cv-section" style="margin-bottom:0.5rem;background:var(--accent-bg-subtle);border-left:3px solid var(--accent);"><p class="mb-0 small">&#128190; <strong>Cette application ne demande jamais de compte ni de mot de passe</strong>, donc rien n\'est conservé automatiquement. Pensez à cliquer sur l\'icône disquette, surtout après avoir noté plusieurs Repères : si vous fermez la page sans avoir sauvegardé, ces informations seront perdues.</p></div>' +
      '<div class="cv-section" style="margin-bottom:0;background:var(--success-bg-subtle);border-left:3px solid var(--success);"><p class="mb-0 small">&#128274; Vos Repères ne quittent jamais votre ordinateur. Rien n\'est envoyé sur Internet, rien n\'est stocké en ligne.</p></div>' +
    '</div>' +

    (typeof htmlEncartMultilingue === 'function' ? htmlEncartMultilingue(true) : '') +

    '<div class="reperes-accueil-zone-cta">' +
      (enDetour
        ? '<button type="button" class="btn btn-primary" data-repere-revenir-module>Revenir au module &#8594;</button>'
        : '<button type="button" class="btn btn-primary" data-repere-accueil-continuer>' + (estRetour ? 'Je reprends' : 'Je commence') + '</button>') +
    '</div>' +
  '</div>' +
    // TACHE (retour utilisateur, 2026-08-26, BUG REEL : "Retour" agissait
    // comme "Accueil") : cet écran est désormais la VRAIE page précédente
    // vue depuis l'écran principal (voir _reperesRenduEcran(), qui affiche
    // cet écran plutôt que de naviguer directement) -- lui donner sa
    // propre barre "Retour"/"Accueil" standard, jamais vue jusqu'ici,
    // pour continuer vers la page réellement précédente (avant même
    // d'être entré dans Repères). Comportement par défaut de
    // barreNavigation() : "Retour" ramene au menu de la Boite a outils
    // (la ou on choisit un module), jamais a l'accueil principal -- retour
    // Denis 2026-08-31, cohérent avec tous les autres modules. Le bouton
    // "Accueil" de la barre reste pour aller a l'accueil.
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null,
      { onclickPrecedent: (enDetour ? 'reperesRevenirDeLaPresentation()' : 'retourVersBoiteAOutils()') }) + '</div>';
}

function _reperesRenduEcran() {
  return '<div class="page-catalogue-contenu">' +
    '<div class="reperes-entete-ecran">' +
      '<button type="button" class="bouton-revoir-explication btn-revoir-module" data-repere-revoir-explication><i class="bi bi-bookmark-star"></i> Revoir la présentation</button>' +
      '<h1 style="margin:0;"><i class="bi bi-bookmark-star"></i> Mes Repères</h1>' +
      '<button type="button" class="btn btn-primary btn-sm" data-repere-trigger="reperesPickerLibre" ' +
        'aria-expanded="false" aria-controls="reperesPickerLibre">+ <i class="bi bi-bookmark-star"></i> Garder une réflexion</button>' +
    '</div>' +
    '<p class="sousTitre">Les réflexions que vous avez choisi de garder, pour les retrouver quand vous en aurez besoin.</p>' +
    // TACHE (implémentation Regard extérieur, étape 1/5, voir
    // modules/regard-exterieur/ARCHITECTURE_TECHNIQUE.md) : ancre
    // générique et vide, sur le même patron que #app -- ce fichier ne
    // sait pas ni n'a besoin de savoir ce qui s'y attache. Vide tant
    // qu'aucun module externe ne la peuple.
    // TACHE (retour utilisateur, 2026-08-25) : remontee en haut de page --
    // etait tout en bas, apres la liste complete, facile a manquer
    // surtout au moment ou elle apparait pour la 1ere fois (voir aussi le
    // pulse a l'apparition, modules/regard-exterieur/index.js).
    '<div id="reperesZoneRegardExterieur"></div>' +
    _reperesRenduPicker('reperesPickerLibre', null, true) +
    // TACHE (retour utilisateur, 2026-08-25) : le filtre "Tous mes Repères"/
    // "Prêts à en parler uniquement" qui vivait ici a ete retire -- l'etat
    // partage/discute qu'il filtrait n'avait plus aucun usage reel ailleurs
    // dans l'app (concu pour un partage bénéficiaire -> CIP jamais devenu
    // possible techniquement), retire au meme moment (voir _reperesRenduItem()).
    // Sera remplace par un futur filtre "Non analyses/Deja analyses" (regard
    // exterieur), pas encore construit. Voir docs/LECONS_A_NE_PAS_REPRODUIRE.md
    // section 9.7 pour la lecon sur l'accumulation d'ecouteurs qui avait
    // motive ce placement a l'interieur de #reperesListeConteneur -- reste
    // valable pour tout futur filtre ajoute ici.
    '<div id="reperesListeConteneur">' + _reperesRenduContenuPrincipal() + '</div>' +
    '</div>' +
    // TACHE (retour utilisateur, 2026-08-26, BUG REEL : "Retour" avait la
    // même fonction que "Accueil") : la VRAIE page précédente, depuis cet
    // écran, est l'écran explicatif de Repères (_reperesRenduAccueil()) --
    // jamais directement la page d'où Repères a été ouvert (celle-ci
    // reste accessible, mais un cran plus loin : "Retour" depuis l'écran
    // explicatif lui-même, voir son propre appel à barreNavigation()).
    // TACHE (correctif boucle Retour, 2026-09-09 -- LECONS section 2,
    // "Variante boucle infinie") : reperesRetour() affiche l'ecran
    // explicatif en mode NORMAL (jamais detour), dont le "Retour" enchaine
    // vers la Boite a outils. AVANT : "_reperesForcerAccueil = true" faisait
    // afficher l'explicatif en mode DETOUR (enDetour = !!_reperesForcerAccueil),
    // dont le "Retour" (reperesRevenirDeLaPresentation) revenait a l'ecran de
    // travail -> boucle explicatif <-> ecran. Le bouton "Revoir la
    // presentation" en tete d'ecran garde, lui, le detour (voir pageReperes()).
    '<div class="barre-navigation-fixe">' + barreNavigation(_reperesPageOrigine || 'cv', null, null, {
      onclickPrecedent: 'reperesRetour()'
    }) + '</div>';
}

// ---- Chantier « Journal de parcours » (docs/CHANTIER_JOURNAL_DE_PARCOURS.md) ----

// Contenu du mini-panneau ouvert depuis #btnJournalParcours. N'est
// rendu que si au moins un Repère existe (voir _reperesMettreAJourJournal()) --
// jamais appelée sur une liste vide.
function _reperesRenduPanneauJournal() {
  var dernier = _reperesListe()[0];
  var metaDernier = _REPERES_TYPES[dernier.type] || _REPERES_TYPES.question;
  var libelleDernier = dernier.titre ? echapperAttribut(dernier.titre) : (dernier.source ? echapperAttribut(dernier.source) : metaDernier.libelle);
  return '<div class="reperes-journal-entete">' +
      '<div class="reperes-journal-entete-titre">' +
        '<h6><i class="bi bi-journals"></i> Journal de parcours</h6>' +
        // TACHE (retour utilisateur, 2026-08-26, "je veux le i à
        // l'intérieur de ce journal", puis "on va faire plus simple" --
        // plus de fenêtre au clic, une bulle au survol/focus à la place,
        // voir .bulle-info-hover, css/style.css) : DANS l'entête du
        // panneau, jamais une icône flottante séparée sur l'écran. Le
        // clic sur #btnJournalParcours (reperesInitialiser()) gère le
        // pulse à la 1ère ouverture réelle.
        '<button type="button" class="reperes-journal-info bulle-info-hover" ' +
          'data-tooltip="Un raccourci pour garder une réflexion (question, idée...) sans quitter votre page. Retrouvez tout dans « Mes Repères », accessible aussi depuis la Boîte à outils." ' +
          'aria-label="À quoi sert le Journal de parcours ? Un raccourci pour garder une réflexion sans quitter votre page. Retrouvez tout dans Mes Repères, accessible aussi depuis la Boîte à outils.">&#8505;</button>' +
      '</div>' +
      // TACHE (retour utilisateur, 2026-08-25) : meme mecanisme que
      // .carnet-panneau-fermer (modules/carnet/index.js/carnet.css) --
      // seul un second clic sur #btnJournalParcours refermait ce panneau
      // jusqu'ici, geste peu evident une fois le regard sur le panneau
      // lui-meme. Meme glyphe (&#10005;) pour rester coherent.
      '<button type="button" class="reperes-journal-fermer" data-repere-fermer-panneau aria-label="Fermer" title="Fermer">&#10005;</button>' +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-sm w-100" data-repere-trigger="reperesPickerJournal" ' +
      'aria-expanded="false" aria-controls="reperesPickerJournal">+ <i class="bi bi-bookmark-star"></i> Garder une réflexion</button>' +
    _reperesRenduPicker('reperesPickerJournal') +
    '<p class="reperes-journal-dernier">Dernier Repère gardé : ' + libelleDernier + '</p>' +
    _reperesRenduApercuDerniers(_reperesJournalNombreAffiche) +
    // TACHE (retour utilisateur, 2026-08-25) : un seul bouton qui bascule
    // entre "Afficher plus" (3 -> 10) et "Afficher moins" (retour a 3) --
    // toujours en bas de la mini-liste, juste au-dessus de "Voir tous mes
    // Reperes". N'apparait que s'il y a plus de _REPERES_JOURNAL_NB_DEPART
    // Reperes au total (rien a reduire/etendre sinon).
    (_reperesListe().length > _REPERES_JOURNAL_NB_DEPART
      ? '<button type="button" class="btn btn-outline-secondary btn-sm w-100 mt-2" data-repere-basculer-historique>' +
        (_reperesJournalNombreAffiche > _REPERES_JOURNAL_NB_DEPART ? 'Afficher moins' : 'Afficher plus') + '</button>'
      : '') +
    // TACHE (retour utilisateur, 2026-08-25, BUG REEL : "moche", meme
    // ligne de texte cliquable que le bouton Annuler ci-dessus, aucun CSS
    // n'existait pour .reperes-lien-tout) : meme famille visuelle que "+
    // Garder une reflexion" juste au-dessus (bordee plutot que remplie,
    // pour rester secondaire), meme icone que le titre "Journal de
    // parcours" (bi-journals) juste au-dessus dans ce meme panneau -- jamais
    // une icone differente pour la meme fonctionnalite.
    '<button type="button" class="btn btn-outline-primary btn-sm w-100 mt-2" data-repere-voir-tout><i class="bi bi-journals"></i> Voir tous mes Repères &#8594;</button>';
}

// Aperçu allégé des `n` Repères les plus récents -- volontairement
// distincte de _reperesRenduItem() : pas d'accordéon, pas d'actions
// (partager/discuté/supprimer), seulement de quoi confirmer visuellement
// ce qui a été gardé. Une fonction séparée plutôt qu'un paramètre
// ajouté à _reperesRenduItem(), pour ne pas faire porter deux
// responsabilités différentes à la même fonction.
// TACHE (retour utilisateur, 2026-08-25) : chaque aperçu est desormais un
// vrai bouton cliquable (jamais une div, voir la regle "toujours un vrai
// bouton" de docs/LECONS_A_NE_PAS_REPRODUIRE.md) -- ouvre le contenu
// complet du Repère dans une fenetre ERIP (voir _reperesOuvrirDetail()).
function _reperesRenduApercuDerniers(n) {
  return _reperesListe().slice(0, n).map(function (r) {
    var meta = _REPERES_TYPES[r.type] || _REPERES_TYPES.question;
    var src = r.titre ? echapperAttribut(r.titre) : (r.source ? echapperAttribut(r.source) : meta.libelle);
    return '<button type="button" class="reperes-apercu-item" data-repere-apercu-id="' + r.id + '">' +
      '<span class="reperes-ic">' + meta.icone + '</span><span class="reperes-src">' + src + '</span></button>';
  }).join('');
}

// Ouvre le contenu complet d'un Repère (titre + texte) dans une fenêtre
// ERIP. Titre toujours directement modifiable. Texte affiché en lecture
// seule avec un bouton -- même mécanisme et même bouton exact que
// _carnetOuvrirDetail() (modules/carnet/index.js, retour utilisateur
// 2026-08-25 : "je veux le même comportement des deux côtés") : le
// bouton "Modifier" ne disparaît jamais au clic -- il fait apparaître le
// texte modifiable et devient lui-même soit "Annuler" (aucun changement
// tapé pour l'instant -- rien à perdre, ferme simplement) soit "Valider"
// (un changement a été tapé -- confirme et ferme), selon la valeur
// actuelle comparée à la valeur de départ.
function _reperesOuvrirDetail(id) {
  var r = _reperesTrouver(id);
  if (!r || typeof ouvrirFenetreERIP !== 'function') { return; }
  var meta = _REPERES_TYPES[r.type] || _REPERES_TYPES.question;
  var overlay = ouvrirFenetreERIP({
    titre: meta.icone + ' ' + meta.libelle,
    contenuHTML:
      '<label class="reperes-detail-label" for="reperesDetailTitre">Titre</label>' +
      '<input type="text" class="reperes-detail-titre" id="reperesDetailTitre" value="' +
        echapperAttribut(r.titre || '') + '" placeholder="Donnez un titre à ce Repère" aria-label="Titre du Repère">' +
      '<label class="reperes-detail-label" for="reperesDetailTexteAffiche">Contenu</label>' +
      (r.texte
        ? '<div class="reperes-detail-corps" id="reperesDetailTexteAffiche">' + echapperAttribut(r.texte) + '</div>'
        : '<p class="reperes-detail-corps reperes-detail-vide" id="reperesDetailTexteAffiche">Aucun contenu ajouté pour l\'instant.</p>') +
      '<div class="mt-2"><button type="button" class="btn btn-outline-secondary btn-sm" id="reperesDetailModifier">Modifier</button></div>'
  });
  if (!overlay) { return; }
  var champTitre = overlay.querySelector('#reperesDetailTitre');
  if (champTitre) {
    champTitre.addEventListener('input', function () {
      var rActuel = _reperesTrouver(id);
      if (rActuel) { rActuel.titre = champTitre.value; }
      _reperesMettreAJourJournal();
      _reperesRafraichirListe();
    });
  }
  var boutonAction = overlay.querySelector('#reperesDetailModifier');
  if (boutonAction) {
    boutonAction.addEventListener('click', function () {
      if (boutonAction.textContent.trim() !== 'Modifier') {
        _reperesMettreAJourJournal();
        _reperesRafraichirListe();
        if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
        return;
      }
      var affichage = overlay.querySelector('#reperesDetailTexteAffiche');
      var rActuel = _reperesTrouver(id);
      if (!rActuel || !affichage) { return; }
      var valeurDepart = rActuel.texte || '';
      var champ = document.createElement('textarea');
      champ.className = 'form-control reperes-detail-corps';
      champ.placeholder = 'Ajoutez quelques mots si vous le souhaitez, c\'est facultatif.';
      champ.value = valeurDepart;
      champ.addEventListener('input', function () {
        var r2 = _reperesTrouver(id);
        if (r2) { r2.texte = champ.value; }
        boutonAction.textContent = champ.value === valeurDepart ? 'Annuler' : 'Valider';
      });
      affichage.replaceWith(champ);
      champ.focus();
      boutonAction.textContent = 'Annuler';
    });
  }
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================

function _reperesFermerTousLesPickers() {
  document.querySelectorAll('.reperes-type-picker.is-open').forEach(function (p) { p.classList.remove('is-open'); });
  document.querySelectorAll('[data-repere-trigger]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
}

function _reperesToggleTousLesPickers(idPicker, btnDeclencheur) {
  var picker = document.getElementById(idPicker);
  if (!picker) { return; }
  var etaitOuvert = picker.classList.contains('is-open');
  _reperesFermerTousLesPickers();
  if (!etaitOuvert) {
    picker.classList.add('is-open');
    btnDeclencheur.setAttribute('aria-expanded', 'true');
  }
}

function _reperesMontrerConfirmation(idPicker) {
  var el = document.querySelector('[data-repere-confirmation="' + idPicker + '"]');
  if (!el) { return; }
  el.classList.add('is-visible');
  setTimeout(function () { el.classList.remove('is-visible'); }, 2400);
}

// Écouteurs scopés aux éléments réinjectés à chaque rendu -- que ce
// rendu vienne de pageReperes() (écran Repères, geste libre) ou du
// rendu d'un AUTRE module qui a inséré un bouton d'ancrage (geste
// ancré, voir docs/CONTRAT_ANCRAGE_ERIP.md). Document-scopé
// volontairement : un picker ancré vit dans le DOM du module source,
// pas dans #app tel que Repères le contrôle. Jamais un écouteur posé
// sur `document` ou `window` lui-même (celui-là s'accumulerait à
// chaque nouvelle visite, aucun mécanisme de nettoyage n'existant
// entre deux rendus) -- seulement sur les éléments concrets trouvés à
// l'instant T, qui disparaissent avec leurs écouteurs au prochain
// remplacement de leur conteneur (`innerHTML =`). Conséquence
// assumée : pas de fermeture au clavier (Échap) pour l'instant -- à
// reconsidérer seulement si un futur besoin réel le justifie.
//
// TACHE (chantier Journal de parcours) : `racine` optionnelle (défaut
// `document`, comportement inchangé pour tous les appels existants).
//
// BUG RÉEL TROUVÉ ET CORRIGÉ (chantier 2, test sur pageRevelation()) :
// #btnJournalParcours/#panneauJournalParcours vivent en dehors de #app,
// donc ne sont JAMAIS détruits/recréés par le remplacement de #app --
// contrairement à un picker ancré ou à l'écran Repères lui-même. Toute
// page qui appelle reperesBrancherBoutonAncre() (donc cette fonction,
// document-large) alors que le panneau du Journal a déjà été peuplé une
// fois rebranchait un 2e écouteur sur son picker déjà existant -- et
// certaines pages (pageRevelation(), qui se re-rend à chaque interaction)
// pouvaient rappeler ce branchement de nombreuses fois de suite,
// accumulant les écouteurs (plusieurs Repères créés pour un seul clic).
// Garde d'idempotence ci-dessous : chaque élément n'est branché qu'une
// seule fois, quel que soit le nombre de fois où cette fonction est
// rappelée dessus -- nécessaire uniquement à cause de ce panneau
// persistant, mais appliquée uniformément (rendre le doute impossible
// plutôt que de raisonner au cas par cas selon la page).
function _reperesBrancherEvenementsPickers(racine) {
  racine = racine || document;
  racine.querySelectorAll('[data-repere-trigger]').forEach(function (btn) {
    if (btn.dataset.reperesLie) { return; }
    btn.dataset.reperesLie = '1';
    btn.addEventListener('click', function () {
      _reperesToggleTousLesPickers(btn.getAttribute('data-repere-trigger'), btn);
    });
  });
  racine.querySelectorAll('[data-repere-annuler]').forEach(function (btn) {
    if (btn.dataset.reperesLie) { return; }
    btn.dataset.reperesLie = '1';
    btn.addEventListener('click', function () { _reperesFermerTousLesPickers(); });
  });
  racine.querySelectorAll('[data-repere-type]').forEach(function (btn) {
    if (btn.dataset.reperesLie) { return; }
    btn.dataset.reperesLie = '1';
    btn.addEventListener('click', function () {
      var picker = btn.closest('.reperes-type-picker');
      var idPicker = picker.id;
      // TACHE (geste ancré) : data-repere-source porte le libellé déjà
      // échappé par _reperesRenduBoutonAncre() -- getAttribute() rend la
      // valeur décodée (le navigateur décode les entités HTML d'un
      // attribut à la lecture), jamais besoin de la ré-échapper ici.
      // Absent pour un geste libre -- _reperesConstruire() dégrade déjà
      // proprement une valeur absente ou mal formée.
      var source = picker.getAttribute('data-repere-source');
      var repere = _reperesCreer(btn.getAttribute('data-repere-type'), source ? { libelle: source } : null);
      _reperesFermerTousLesPickers();
      // TACHE (texte libre à la création, geste libre uniquement) :
      // source absente = geste libre -> l'écran de saisie s'ouvre
      // directement, il porte lui-même sa propre confirmation visuelle
      // (le titre de la fenêtre, meta.icone + meta.libelle). Source
      // présente = geste ancré -> comportement strictement inchangé,
      // confirmation discrète en place, jamais d'écran de saisie qui
      // interromprait la lecture en cours dans le module d'origine.
      if (source) {
        _reperesMontrerConfirmation(idPicker);
      } else {
        _reperesOuvrirSaisieLibre(repere.id);
      }
      // TACHE (étape 4) : sans effet si le conteneur n'existe pas sur
      // l'écran courant (cas du geste ancré, rendu depuis le Bilan CV) --
      // getElementById renvoie null, _reperesRafraichirListe() le gère.
      _reperesRafraichirListe();
    });
  });
}

// ---- Chantier « Journal de parcours » (docs/CHANTIER_JOURNAL_DE_PARCOURS.md) ----

// Fonction pivot : appelée à l'initialisation et après chaque création
// (voir _reperesCreer()). Ajuste la visibilité de #btnJournalParcours
// selon le nombre de Repères existants (décision assumée : le bouton
// se masque à nouveau si la personne supprime tous ses Repères --
// aucun indicateur séparé pour "a déjà été révélé un jour", voir
// ARCHITECTURE_TECHNIQUE.md pour le raisonnement), et rafraîchit le
// contenu du panneau. #btnJournalParcours/#panneauJournalParcours
// absents du DOM (page hors d'ERIP, test isolé...) : ne fait rien.
function _reperesMettreAJourJournal() {
  var bouton = document.getElementById('btnJournalParcours');
  var panneau = document.getElementById('panneauJournalParcours');
  // TACHE (retour utilisateur, 2026-08-25, BUG REEL) : regardExterieurApresNavigation()
  // ne tournait qu'a chaque VRAIE navigation -- le bouton "Demander un
  // regard extérieur" (seuil de 5 Repères) n'apparaissait donc pas tant
  // qu'on restait sur la page "Mes Repères" a creer des Reperes un a un
  // (meme famille de bug que le pulse/positionnement du Journal, deja
  // corrige plus haut ce jour). Reperes ne connait pas Regard exterieur
  // en detail (appel generique, garde typeof, meme precedent que l'appel
  // de Carnet vers reperesCreerAvecTexte()) -- se contente de signaler
  // "la page Reperes vient de changer", exactement ce que cette fonction
  // fait deja a chaque vraie navigation.
  if (typeof regardExterieurApresNavigation === 'function') { regardExterieurApresNavigation('reperes'); }
  if (!bouton || !panneau) { return; }
  var visible = _reperesListe().length > 0;
  var etaitCache = bouton.hidden;
  bouton.hidden = !visible;
  if (!visible) {
    panneau.hidden = true;
    panneau.innerHTML = '';
    return;
  }
  // TACHE (retour utilisateur, 2026-08-25, BUG REEL recidive) : le tout
  // premier Repere cree EN COURS DE SESSION (sans navigation entre-temps,
  // ex. depuis la page "Mes Reperes" elle-meme) revele #btnJournalParcours
  // ICI -- mais tant qu'il etait cache, positionnerIconePersistante()
  // (appelee par ailleurs uniquement via naviguerVers()) refusait
  // toujours de le positionner (garde `if (bouton.hidden) return`), donc
  // aucun style JS n'avait jamais ete pose : le bouton retombait sur le
  // repli CSS statique (152px), qui suppose #btnCarnet a une position par
  // defaut (90px) -- fausse des qu'une page a un <h1>/une barre de
  // progression plus haute que la normale (#btnCarnet est lui-meme
  // repositionne par JS a chaque navigation). D'ou un chevauchement
  // reapparu uniquement dans CE scenario precis (jamais si un
  // naviguerVers() a eu lieu entre-temps, qui repositionne deja tout).
  // Corrige en recalculant explicitement ICI, au moment exact de la
  // revelation -- jamais seulement a la prochaine navigation.
  if (etaitCache) { _reperesPositionnerBoutonJournal(); }
  panneau.innerHTML = _reperesRenduPanneauJournal();
  _reperesBrancherEvenementsPickers(panneau);
  var boutonFermer = panneau.querySelector('[data-repere-fermer-panneau]');
  if (boutonFermer) {
    boutonFermer.addEventListener('click', function () { panneau.hidden = true; });
  }
  var lienTout = panneau.querySelector('[data-repere-voir-tout]');
  if (lienTout) {
    lienTout.addEventListener('click', function () {
      panneau.hidden = true;
      reperesDemarrer();
    });
  }
  var boutonBasculer = panneau.querySelector('[data-repere-basculer-historique]');
  if (boutonBasculer) {
    boutonBasculer.addEventListener('click', function () {
      _reperesJournalNombreAffiche = _reperesJournalNombreAffiche > _REPERES_JOURNAL_NB_DEPART
        ? _REPERES_JOURNAL_NB_DEPART
        : Math.min(10, _reperesListe().length);
      _reperesMettreAJourJournal();
    });
  }
  panneau.querySelectorAll('[data-repere-apercu-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _reperesOuvrirDetail(btn.getAttribute('data-repere-apercu-id'));
    });
  });
}

// Pulse de confirmation, distinct du signal de découverte unique de la
// tuile Boîte à outils (mécanisme déjà existant, jamais réutilisé ici) --
// réaction à un geste que la personne vient de faire, pas une
// sollicitation initiée par le module.
function _reperesDeclencherPulseJournal() {
  var bouton = document.getElementById('btnJournalParcours');
  if (!bouton) { return; }
  bouton.classList.remove('reperes-pulse-confirmation');
  // TACHE : force un reflow pour que le retrait/ré-ajout de la classe
  // relance l'animation CSS même si deux créations arrivent coup sur
  // coup (sinon la 2e ré-ajoute une classe déjà présente, sans effet).
  void bouton.offsetWidth;
  bouton.classList.add('reperes-pulse-confirmation');
  // TACHE (retour utilisateur, 2026-08-25) : allonge de 2s a 10s, en
  // phase avec la duree CSS de .reperes-pulse-confirmation (reperes.css).
  setTimeout(function () { bouton.classList.remove('reperes-pulse-confirmation'); }, 10000);
}

// Re-rend uniquement le conteneur de la liste (id="reperesListeConteneur"),
// jamais l'écran entier -- garde le picker "+ Garder une réflexion" et
// son état ouvert/fermé intacts pendant qu'un Repère est modifié plus
// bas dans la même page. Absent de l'écran courant (ex. geste ancré
// déclenché depuis le Bilan CV) : ne fait simplement rien.
// TACHE (retour utilisateur, 2026-08-25, BUG REEL corrige) : inclut
// desormais _reperesRenduFiltre() (voir commentaire a son appel, plus
// haut) -- les boutons de filtre font maintenant partie de ce conteneur,
// jamais regeneres separement.
// TACHE (retour utilisateur, 2026-08-26, "rester sur la page") : décide
// ce qui occupe #reperesListeConteneur -- la liste habituelle (filtre +
// Repères) ou la page "Mes rapports", selon _reperesModeAffichage.
// TACHE (retour utilisateur, 2026-08-26, recherche) : #reperesListeInterne
// entoure UNIQUEMENT les Repères (jamais les onglets/la recherche
// au-dessus) -- permet à la recherche de ne rafraîchir QUE cette zone à
// chaque frappe, sans jamais reconstruire ni le champ de recherche
// lui-même (perdrait le focus) ni les onglets (voir
// _reperesBrancherRechercheReperes()).
function _reperesRenduContenuPrincipal() {
  return _reperesModeAffichage === 'rapports'
    ? _reperesRenduPageRapports()
    : (_reperesRenduFiletAnnulation() + _reperesRenduFiltre() + '<div id="reperesListeInterne">' + _reperesRenduListe() + '</div>');
}

function _reperesRafraichirListe() {
  var conteneur = document.getElementById('reperesListeConteneur');
  if (!conteneur) { return; }
  conteneur.innerHTML = _reperesRenduContenuPrincipal();
  if (_reperesModeAffichage === 'rapports') {
    _reperesBrancherEvenementsRapports(conteneur);
  } else {
    _reperesBrancherEvenementsListe();
  }
}

// Branche le(s) bouton(s) "Modifier"/"+ Ajouter quelques mots" trouvés
// sous `racine` -- appelée une fois pour toute la liste (racine =
// document, via _reperesBrancherEvenementsListe()) ET une seconde fois,
// scopée à un seul item, après un clic sur "Annuler"/"Valider" (voir plus
// bas) qui vient de recréer SON bouton "Modifier" sans passer par un
// rafraîchissement complet de la liste (qui aurait refermé tous les
// autres Repères ouverts en même temps).
function _reperesBrancherModifierContenu(racine) {
  racine.querySelectorAll('[data-repere-modifier-contenu]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-modifier-contenu');
      var conteneur = document.querySelector('[data-repere-contenu-affiche="' + id + '"]');
      var r = _reperesTrouver(id);
      if (!r || !conteneur) { return; }
      var titreDepart = r.titre || '';
      var texteDepart = r.texte || '';
      // TACHE (retour utilisateur, 2026-08-26, "je dois pouvoir modifier le
      // titre ET le contenu") : avant, cet écran ne modifiait jamais le
      // titre -- seul _reperesOuvrirSaisieLibre() (juste après création) le
      // permettait. Même paire de champs ici, réutilisée pour rester
      // cohérente ; astuce Win+H réaffichée (disparue par erreur de ce
      // parcours-ci, jamais de celui de la création).
      var labelTitre = document.createElement('label');
      labelTitre.className = 'reperes-saisie-label';
      labelTitre.textContent = 'Titre du Repère (facultatif)';
      var champTitre = document.createElement('input');
      champTitre.type = 'text';
      champTitre.className = 'form-control mb-2';
      champTitre.maxLength = 80;
      champTitre.value = titreDepart;
      var labelTexte = document.createElement('label');
      labelTexte.className = 'reperes-saisie-label';
      labelTexte.textContent = 'Votre réflexion (facultatif)';
      var astuce = document.createElement('div');
      astuce.innerHTML = _reperesRenduAstuceDictee();
      var champ = document.createElement('textarea');
      champ.className = 'reperes-detail-corps';
      champ.placeholder = 'Ajoutez quelques mots si vous le souhaitez, c\'est facultatif.';
      champ.value = texteDepart;
      var confirmation = document.createElement('p');
      confirmation.className = 'reperes-confirmation-enregistrement';
      confirmation.style.display = 'none';
      confirmation.textContent = '✓ Modifications enregistrées.';
      var boutonAction = document.createElement('button');
      boutonAction.type = 'button';
      boutonAction.className = 'btn btn-outline-secondary reperes-btn-uniforme mt-2';
      boutonAction.textContent = 'Annuler';
      function verifierChangement() {
        var change = champTitre.value !== titreDepart || champ.value !== texteDepart;
        boutonAction.textContent = change ? 'Valider' : 'Annuler';
        confirmation.style.display = 'none';
      }
      champTitre.addEventListener('input', function () {
        var rActuel = _reperesTrouver(id);
        if (rActuel) { rActuel.titre = champTitre.value; }
        verifierChangement();
      });
      champ.addEventListener('input', function () {
        var rActuel = _reperesTrouver(id);
        if (rActuel) { rActuel.texte = champ.value; }
        verifierChangement();
      });
      boutonAction.addEventListener('click', function () {
        // TACHE : ne referme QUE cette zone de texte (retour à l'affichage +
        // "Modifier"), jamais tout le Repère -- le clic sur l'entête garde
        // seul la responsabilité d'ouvrir/fermer l'ensemble (retour
        // utilisateur explicite : "je veux conserver le comportement qu'on
        // a actuellement"). Umami uniquement si un vrai changement a eu
        // lieu (libellé passé à "Valider").
        if (boutonAction.textContent.trim() === 'Valider') {
          if (typeof trackEvenement === 'function') { trackEvenement('repere_texte_modifie'); }
          // TACHE (retour utilisateur, 2026-08-26, "message rassurant") :
          // confirmation brève avant de refermer, pour que la personne
          // reparte avec la certitude que c'est bien enregistré -- déjà le
          // cas techniquement (écriture directe à chaque frappe), mais
          // jamais confirmé visuellement jusqu'ici.
          confirmation.style.display = 'block';
          setTimeout(function () {
            var rActuel = _reperesTrouver(id);
            conteneur.innerHTML = rActuel ? _reperesRenduContenuAffiche(rActuel) : '';
            _reperesBrancherModifierContenu(conteneur);
          }, 900);
          return;
        }
        var rActuel = _reperesTrouver(id);
        conteneur.innerHTML = rActuel ? _reperesRenduContenuAffiche(rActuel) : '';
        _reperesBrancherModifierContenu(conteneur);
      });
      conteneur.innerHTML = '';
      conteneur.appendChild(labelTitre);
      conteneur.appendChild(champTitre);
      conteneur.appendChild(labelTexte);
      conteneur.appendChild(astuce);
      conteneur.appendChild(champ);
      conteneur.appendChild(confirmation);
      conteneur.appendChild(boutonAction);
      champTitre.focus();
    });
  });
}

// TACHE (retour utilisateur, 2026-08-26, recherche) : écouteurs des
// ITEMS de la liste (#reperesListeInterne) -- scopés à `racine` pour
// pouvoir être re-bindés SEULS après une frappe dans la recherche, sans
// jamais retoucher aux onglets/au champ lui-même juste au-dessus (voir
// _reperesBrancherEvenementsListe() pour la partie "une seule fois").
function _reperesBrancherEvenementsListeInterne(racine) {
  racine.querySelectorAll('[data-repere-quickadd]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cle = btn.getAttribute('data-repere-quickadd');
      var repere = _reperesCreer(cle, null);
      _reperesOuvrirSaisieLibre(repere.id);
    });
  });
  racine.querySelectorAll('[data-repere-revoir-analyse]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var type = btn.getAttribute('data-repere-type-rapport') || '1ere';
      if (typeof regardExterieurRevoirDerniereAnalyse === 'function') { regardExterieurRevoirDerniereAnalyse(type); }
    });
  });
  racine.querySelectorAll('[data-repere-demander-deuxieme-regard]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeof regardExterieurLancerDeuxiemeRegard === 'function') { regardExterieurLancerDeuxiemeRegard(); }
    });
  });
  racine.querySelectorAll('[data-repere-voir-rapport]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _reperesOuvrirRapportsPourRepere(btn.getAttribute('data-repere-voir-rapport'));
    });
  });
  racine.querySelectorAll('[data-repere-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('.reperes-item').classList.toggle('is-open');
    });
  });
  _reperesBrancherModifierContenu(racine);
  // TACHE (retour utilisateur, 2026-08-26) : 2 des 3 actions du Repère
  // ANALYSÉ (voir _reperesRenduItem()) -- "Supprimer" réutilise
  // l'écouteur déjà existant juste en dessous, même attribut data-.
  racine.querySelectorAll('[data-repere-copier-texte]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-copier-texte');
      var r = _reperesTrouver(id);
      if (!r) { return; }
      copierTexteVersPressePapier(r.texte || '', btn);
      if (typeof trackEvenement === 'function') { trackEvenement('repere_analyse_texte_copie'); }
    });
  });
  racine.querySelectorAll('[data-repere-repasser-non-analyse]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-repasser-non-analyse');
      var r = _reperesTrouver(id);
      if (!r) { return; }
      r.analyse = false;
      // TACHE (chantier "Phase B", 3e etat "Deuxieme regard") : repasser
      // tout en bas (Non analyses) reinitialise aussi la progression au
      // 2e regard -- sinon un futur nouveau 1er passage ferait sauter ce
      // Repere directement en "Deuxieme regard" sans jamais y repasser.
      r.approfondi = false;
      // TACHE (retour utilisateur, 2026-08-26, nettoyage automatique) : la
      // personne repasse ce Repere justement pour le corriger a la main --
      // le badge "a verifier" n'a plus lieu d'etre tant qu'il est en Non
      // analyses (il en recevra un nouveau, ou aucun, au prochain passage).
      r.interpretationIncertaine = false;
      delete r.texteAvantNettoyage;
      if (typeof trackEvenement === 'function') { trackEvenement('repere_repasse_non_analyse'); }
      _reperesRafraichirListe();
    });
  });
  racine.querySelectorAll('[data-repere-ouvrir-verification]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-ouvrir-verification');
      _reperesVerificationOuverteId = (_reperesVerificationOuverteId === id) ? null : id;
      _reperesRafraichirListe();
    });
  });
  racine.querySelectorAll('[data-repere-verification-ok]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-verification-ok');
      _reperesVerificationOuverteId = null;
      reperesConfirmerVerification(id);
      if (typeof trackEvenement === 'function') { trackEvenement('repere_verification_confirmee'); }
    });
  });
  // TACHE (chantier "Phase B", 3e etat "Deuxieme regard") : recule d'UNE
  // seule etape (vers "Deja analyses"), jamais jusqu'a "Non analyses" --
  // meme geste "repasser" mais un cran different, voir _reperesRenduItem().
  racine.querySelectorAll('[data-repere-repasser-analyse]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-repasser-analyse');
      var r = _reperesTrouver(id);
      if (!r) { return; }
      r.approfondi = false;
      if (typeof trackEvenement === 'function') { trackEvenement('repere_repasse_analyse'); }
      _reperesRafraichirListe();
    });
  });
  racine.querySelectorAll('[data-repere-supprimer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-repere-supprimer');
      confirmerAction(
        'Supprimer ce Repère ?',
        'Cette réflexion sera définitivement supprimée.',
        'Supprimer', 'btn-danger',
        function () {
          _reperesSupprimer(id);
          _reperesRafraichirListe();
          // TACHE (chantier Journal de parcours) : réévalue la visibilité
          // du bouton -- se masque si c'était le dernier Repère.
          _reperesMettreAJourJournal();
        }
      );
    });
  });
}

// TACHE (retour utilisateur, 2026-08-26, recherche) : filtre la liste en
// place à chaque frappe -- ne touche QUE #reperesListeInterne, jamais les
// onglets ni le champ lui-même (perdrait le focus à chaque caractère
// tapé), même principe que _reperesBrancherRechercheRapports().
function _reperesBrancherRechercheReperes() {
  var champ = document.getElementById('reperesRechercheChamp');
  if (!champ) { return; }
  champ.addEventListener('input', function () {
    _reperesRecherche = champ.value;
    var zone = document.getElementById('reperesListeInterne');
    if (zone) { zone.innerHTML = _reperesRenduListe(); }
    _reperesBrancherEvenementsListeInterne(document);
  });
}

// Écouteurs de l'ÉCRAN (onglets, "Mes rapports", recherche) -- re-bindés
// après _reperesRafraichirListe() puisque #reperesListeConteneur est
// entièrement remplacé (mêmes garanties que _reperesBrancherEvenementsPickers()),
// contrairement à _reperesBrancherEvenementsListeInterne() qui, elle,
// est aussi rebindée seule après une frappe dans la recherche.
function _reperesBrancherEvenementsListe() {
  // TACHE (retour utilisateur, 2026-08-25, LECON section 9.7 : jamais un
  // controle laisse HORS du conteneur qu'on rafraichit) : ce filtre vit
  // A L'INTERIEUR de #reperesListeConteneur (voir son appel), regenere a
  // chaque rafraichissement -- meme precaution que l'ancien filtre
  // "prêt à en parler" qui avait cause le gel du navigateur.
  document.querySelectorAll('[data-repere-filtre]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _reperesFiltreActuel = btn.getAttribute('data-repere-filtre');
      _reperesRafraichirListe();
    });
  });
  document.querySelectorAll('[data-repere-ouvrir-rapports]').forEach(function (btn) {
    btn.addEventListener('click', _reperesOuvrirRapports);
  });
  var btnAnnulerSuppression = document.querySelector('[data-reperes-annuler-suppression]');
  if (btnAnnulerSuppression) { btnAnnulerSuppression.addEventListener('click', _reperesAnnulerDerniereSuppression); }
  _reperesBrancherRechercheReperes();
  _reperesBrancherEvenementsListeInterne(document);
}

// ============================================================
// FAÇADE PUBLIQUE
// ============================================================

// Forcée à true par le bouton "Revoir l'explication" (écran principal),
// remise à false dès que l'accueil est quitté -- jamais persistée, un
// simple aiguillage d'affichage pour la visite EN COURS. La toute
// première visite (dossier.reperesIntroVue absent) s'affiche elle aussi
// sur l'accueil, sans avoir besoin de ce drapeau (voir pageReperes()).
var _reperesForcerAccueil = false;

// TACHE (correctif boucle Retour, 2026-09-09). Drapeau distinct de
// _reperesForcerAccueil : "reculer d'un cran" depuis l'ecran de travail
// vers l'ecran explicatif, mais en mode NORMAL (enDetour reste lie au
// SEUL _reperesForcerAccueil). Consomme et remis a false des la premiere
// lecture par pageReperes(), comme un aiguillage d'affichage a usage
// unique. reperesRetour() est cablee sur la barre du bas de
// _reperesRenduEcran().
var _reperesRetourAccueil = false;
function reperesRetour() {
  _reperesForcerAccueil = false;
  _reperesRetourAccueil = true;
  pageReperes();
}

// Route enregistrée dans `routes` (js/app.js). app.js appelle cette
// fonction sans jamais connaître son contenu.
// TACHE (retour utilisateur, 2026-08-26) : affiche l'écran d'accueil du
// module (_reperesRenduAccueil()) plutôt que la liste, soit à la toute
// première visite, soit sur demande explicite (_reperesForcerAccueil,
// bouton "Revoir l'explication").
function pageReperes() {
  _reperesModeAffichage = 'reperes';
  var versAccueilNormal = _reperesRetourAccueil;
  _reperesRetourAccueil = false;
  if (_reperesForcerAccueil || versAccueilNormal || !dossier.reperesIntroVue) {
    app.innerHTML = _reperesRenduAccueil();
    _reperesBrancherEvenementsAccueil();
    return;
  }
  app.innerHTML = _reperesRenduEcran();
  _reperesBrancherEvenementsPickers();
  _reperesBrancherEvenementsListe();
  // TACHE (retour utilisateur, 2026-08-26, en profitant de la
  // restructuration recherche) : ce bouton vit dans l'ENTÊTE de l'écran
  // (_reperesRenduEcran()), jamais régénéré par _reperesRafraichirListe()
  // (qui ne touche que #reperesListeConteneur) -- le rebinder à chaque
  // rafraîchissement de liste (comme avant) l'aurait fait accumuler un
  // écouteur de plus à chaque changement d'onglet/frappe de recherche.
  // Bindé UNE SEULE fois ici, à la vraie entrée sur l'écran.
  document.querySelectorAll('[data-repere-revoir-explication]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _reperesForcerAccueil = true;
      if (typeof trackEvenement === 'function') { trackEvenement('reperes_accueil_revoir_explication'); }
      pageReperes();
    });
  });
}

// Écouteur du seul bouton de l'écran d'accueil -- marque l'intro comme
// vue (persisté avec le reste du dossier, voir _reperesRenduAccueil()),
// referme l'aiguillage forcé, puis affiche l'écran principal.
function _reperesBrancherEvenementsAccueil() {
  document.querySelectorAll('[data-repere-accueil-continuer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var premiereFois = !dossier.reperesIntroVue;
      dossier.reperesIntroVue = true;
      _reperesForcerAccueil = false;
      if (typeof trackEvenement === 'function') {
        trackEvenement(premiereFois ? 'reperes_accueil_je_commence' : 'reperes_accueil_je_reprends');
      }
      pageReperes();
    });
  });
  // Detour depuis l'ecran de travail : bouton du haut + CTA du bas + "Retour"
  // reviennent tous a l'ecran (chantier "bouton presentation", 2026-09-01).
  document.querySelectorAll('[data-repere-revenir-module], #btnReperesRevenirModule').forEach(function (btn) {
    btn.addEventListener('click', reperesRevenirDeLaPresentation);
  });
}

// Ferme le detour "Revoir la presentation" -- retour exact a l'ecran de
// travail (jamais destructif : _reperesForcerAccueil est un simple
// aiguillage d'affichage).
function reperesRevenirDeLaPresentation() {
  _reperesForcerAccueil = false;
  pageReperes();
}

// TACHE (regard critique final du module Regard extérieur, "taxonomie
// des Repères") : façade minimale, ajoutée conformément à la RÈGLE DE
// FAÇADE en tête de fichier -- un appelant réel existe désormais
// (modules/regard-exterieur/), qui devait sinon dupliquer cette
// taxonomie à la main, un risque de divergence si elle change un jour.
// Retourne une COPIE, jamais _REPERES_TYPES lui-même : aucun appelant
// externe ne doit pouvoir modifier la taxonomie de Repères.
function reperesLibellesTypes() {
  var copie = {};
  Object.keys(_REPERES_TYPES).forEach(function (cle) { copie[cle] = _REPERES_TYPES[cle].libelle; });
  return copie;
}

// TACHE (retour utilisateur, 2026-08-26, panneau de sélection avant
// envoi) : jumelle de reperesLibellesTypes() -- appelant réel désormais
// (modules/regard-exterieur/index.js, _regardExterieurRenduSelection())
// qui veut afficher l'icône devant chaque titre ("mémoire visuelle,
// pas que du texte").
function reperesIconesTypes() {
  var copie = {};
  Object.keys(_REPERES_TYPES).forEach(function (cle) { copie[cle] = _REPERES_TYPES[cle].icone; });
  return copie;
}

// TACHE (retour utilisateur, 2026-08-26, panneau de sélection avant
// envoi) : permet à Regard extérieur de proposer une modification du
// titre ET du texte d'un Repère AVANT de l'envoyer ("j'aimerais bien
// pouvoir modifier les deux"), sans jamais écrire directement dans
// dossier.reperes depuis un autre module (même principe que
// reperesMarquerAnalyses()). `nouveauTitre` peut être null pour ne
// toucher que le texte. Rafraîchit la liste complète si elle est
// affichée derrière le panneau, pour qu'elle ne reste jamais périmée.
function reperesModifierRepere(id, nouveauTitre, nouveauTexte) {
  var r = _reperesTrouver(id);
  if (!r) { return false; }
  if (nouveauTitre !== null && nouveauTitre !== undefined) { r.titre = nouveauTitre.trim(); }
  r.texte = (nouveauTexte || '').trim();
  _reperesRafraichirListe();
  return true;
}

// TACHE (chantier "rapport en accordéons", bouton "Garder comme Repère") :
// façade publique pour Regard extérieur -- crée un Repère DÉJÀ rempli
// (titre + texte connus dès la création, contrairement au geste "+"
// rapide qui ouvre une saisie vide, voir _reperesBrancherEvenementsListeInterne()),
// jamais un accès direct à _reperesCreer()/_reperesConstruire() depuis un
// autre module. `type` doit être une des 4 clés valides (question/idee/
// approfondir/discuter) -- un type invalide dégrade silencieusement en
// Repère non catégorisable plutôt que de faire planter l'appelant, la
// responsabilité de valider `type` reste à Regard extérieur.
function reperesCreerDepuisRegardExterieur(type, titre, texte) {
  var repere = _reperesCreer(type, null);
  reperesModifierRepere(repere.id, titre, texte);
  return repere.id;
}

// TACHE (chantier "répertoire des freins", étape 5, 2026-08-28) : façade
// publique pour Regard extérieur -- garde un frein identifié dans un
// rapport comme Repère. Décisions Denis :
//  - type toujours « À discuter » (un frein se lève avec un accompagnant,
//    jamais seul) -- pas de sélecteur de type, geste direct ;
//  - le Repère ne stocke que le CODE (`frein`), jamais une copie des
//    pistes/ressources : elles sont re-rendues à jour depuis data/freins.js
//    à chaque affichage (voir _reperesRenduItem()) [[LECONS 9.13]] ;
//  - plusieurs Repères pour un même code sont autorisés (un code comme
//    `mobilite` recouvre plusieurs situations : pas de permis, pas de
//    voiture, trajet trop long...) -- ils se distinguent par le complément
//    de titre après « <frein> : », dérivé du CONTENU du Repère (premiers
//    mots du texte, puis formulation de l'assistant si passage en Regard
//    extérieur). La personne n'écrit jamais le titre elle-même : la limite
//    de 80 caractères la contraindrait (décision Denis).
// `titreFrein` est le libellé lisible du frein (« Se déplacer »), fourni
// par Regard extérieur depuis FREINS_REPERTOIRE ; il devient le titre du
// Repère, la saisie habituelle s'ouvre (texte libre) et le titre se
// complète tout seul depuis ce texte.
function reperesGarderFrein(code, titreFrein) {
  var libelle = (typeof titreFrein === 'string' && titreFrein.trim()) ? titreFrein.trim() : 'Ce frein';
  var repere = _reperesCreer('discuter', { libelle: libelle, frein: code });
  // Le titre EST le libellé du frein (« Se déplacer »). La personne n'a
  // rien à écrire dans le champ titre (limité à 80 caractères) : elle
  // décrit sa difficulté dans le texte libre, et le titre se complète tout
  // seul en « Se déplacer : <premiers mots> » (auto-suggestion de
  // _reperesOuvrirSaisieLibre), puis en « Se déplacer : <formulation de
  // l'assistant> » si ce Repère passe un jour en Regard extérieur (voir
  // reperesAppliquerNettoyageIA(), qui PRÉFIXE au lieu de remplacer pour un
  // Repère-frein). Plusieurs Repères d'un même code restent ainsi
  // distincts sans jamais contraindre la personne.
  repere.titre = libelle;
  if (typeof trackEvenement === 'function') {
    trackEvenement('repere_frein_garde', { code: repere.frein || code });
  }
  _reperesOuvrirSaisieLibre(repere.id, {
    placeholderTitre: 'Se complète tout seul avec vos mots ci-dessous -- modifiable si besoin'
  });
  return repere.id;
}

// TACHE (retour utilisateur, 2026-08-26, nettoyage automatique par IA) :
// appelée UNIQUEMENT depuis Regard extérieur, uniquement au 1er passage
// (jamais "Aller plus loin"/"Deuxième regard", qui ne doivent jamais
// écraser) -- écrase titre+texte avec ce que l'IA a compris. Si
// `incertain` est vrai, conserve le texte D'ORIGINE dans
// `texteAvantNettoyage` (jamais perdu tant que la personne n'a pas
// vérifié) et pose `interpretationIncertaine` pour afficher le badge
// « À vérifier » (voir _reperesRenduItem()) ; sinon, aucune trace du
// texte brut n'est gardée (choix explicite de Denis : pas de comparaison
// systématique, seulement quand l'IA elle-même a un doute).
function reperesAppliquerNettoyageIA(id, titreSuggere, syntheseComprise, incertain) {
  var r = _reperesTrouver(id);
  if (!r) { return false; }
  if (incertain) {
    r.texteAvantNettoyage = r.texte;
    r.interpretationIncertaine = true;
  } else {
    delete r.texteAvantNettoyage;
    r.interpretationIncertaine = false;
  }
  if (titreSuggere) {
    // TACHE (chantier "répertoire des freins", étape 5) : pour un Repère né
    // d'un frein (r.frein), on ne REMPLACE pas tout le titre par la
    // proposition de l'assistant -- on GARDE le libellé du frein, déjà
    // reconnu et validé par la personne, et on n'ajoute que le complément
    // après « : » (« Se déplacer : problème de véhicule »). Ainsi plusieurs
    // Repères d'un même code, nés à des moments différents, restent
    // distincts par leur complément tout en partageant leur base. Pour un
    // Repère ordinaire, comportement inchangé (remplacement complet).
    if (r.frein) {
      // Base = le libellé du frein : `r.source` (posé à la création) est la
      // référence la plus stable ; repli sur ce qui précède le premier
      // « : » du titre courant, puis sur la proposition elle-même.
      var base = String(r.source || (r.titre || '').split(':')[0] || titreSuggere).trim();
      var complement = titreSuggere.indexOf(':') !== -1
        ? titreSuggere.split(':').slice(1).join(':').trim()
        : titreSuggere.trim();
      r.titre = complement ? (base + ' : ' + complement) : base;
    } else {
      r.titre = titreSuggere;
    }
  }
  if (syntheseComprise) { r.texte = syntheseComprise; }
  _reperesRafraichirListe();
  return true;
}

// Clic sur "C'est bon, c'est correct" (voir _reperesRenduItem()) : la
// personne a vérifié la compréhension de l'IA et la confirme -- le
// Repère redevient identique aux autres, plus aucune trace du texte
// brut d'origine.
function reperesConfirmerVerification(id) {
  var r = _reperesTrouver(id);
  if (!r) { return false; }
  r.interpretationIncertaine = false;
  delete r.texteAvantNettoyage;
  _reperesRafraichirListe();
  return true;
}

// Rendu du point d'ancrage (voir docs/CONTRAT_ANCRAGE_ERIP.md) --
// retourne du HTML, n'écrit rien dans le DOM elle-même : c'est au
// module source d'insérer ce HTML dans son propre rendu, puis
// d'appeler reperesBrancherBoutonAncre() juste après (paire
// rendu/branchement, même patron que toute page d'ERIP).
function reperesBoutonAncre(contratSource) {
  return _reperesRenduBoutonAncre(contratSource);
}

// Branchement d'événements du/des bouton(s) d'ancrage insérés par un
// AUTRE module. À appeler une fois, juste après avoir inséré le HTML
// de reperesBoutonAncre() dans le DOM (voir docs/CONTRAT_ANCRAGE_ERIP.md).
// Réutilise la même logique de branchement que l'écran Repères
// lui-même -- aucune duplication entre geste libre et geste ancré.
function reperesBrancherBoutonAncre() {
  _reperesBrancherEvenementsPickers();
}

// Contrat frère du geste ancré (docs/CHANTIER_CARNET.md, partie 4) --
// jamais une extension du contrat d'ancrage figé (docs/CONTRAT_ANCRAGE_ERIP.md),
// qui porte une référence vers un moment de l'application, jamais un
// contenu déjà rédigé. Seul appelant prévu : le Carnet
// (modules/carnet/index.js), pour sa transformation volontaire d'une
// note en Repère -- exposée seulement maintenant que cet appelant
// existe réellement (RÈGLE DE FAÇADE, en tête de fichier).
//
// Ouvre le sélecteur de type déjà existant (_reperesRenduPicker(),
// réutilisé tel quel) dans une fenêtre ERIP générique, plutôt que dans
// l'écran courant : reperesCreerAvecTexte() peut être appelée depuis
// n'importe quelle page (le Carnet), dont ce fichier ne connaît rien.
// Au choix du type, construit le Repère avec ce texte déjà rempli
// (source: null, un geste libre, jamais un texte à retaper), puis
// rappelle onCree(repereCree) -- jamais avant, pour que l'appelant ne
// puisse marquer son origine comme transformée qu'après coup réel.
function reperesCreerAvecTexte(texte, onCree) {
  var idPicker = 'reperesPickerTransformation';
  var overlay = ouvrirFenetreERIP({
    titre: 'Transformer en Repère',
    contenuHTML: _reperesRenduPicker(idPicker)
  });
  overlay.querySelectorAll('[data-repere-type]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var repere = _reperesConstruire(btn.getAttribute('data-repere-type'), null);
      repere.texte = texte;
      // TACHE (identite du Repere) : meme extrait auto-suggere que la
      // saisie libre (_reperesOuvrirSaisieLibre()) -- un Repere issu du
      // Carnet a deja un texte connu, autant lui donner tout de suite un
      // titre reconnaissable plutot que de le laisser retomber sur
      // "Reflexion personnelle" comme un Repere reellement vide.
      repere.titre = _reperesExtraitPourTitre(texte);
      _reperesEnregistrer(repere);
      if (typeof trackEvenement === 'function') {
        trackEvenement('repere_cree', { type: repere.type, geste: 'carnet' });
      }
      _reperesMettreAJourJournal();
      _reperesDeclencherPulseJournal();
      fermerFenetreERIP();
      if (typeof onCree === 'function') { onCree(repere); }
    });
  });
  overlay.querySelectorAll('[data-repere-annuler]').forEach(function (btn) {
    btn.addEventListener('click', function () { fermerFenetreERIP(); });
  });
}

// Point d'entrée déclenché depuis la tuile "Mes Repères" de la Boîte à
// outils (data/metiers.js, ouvrirChoixPreparationAccueil()) ET depuis le
// lien "Voir tous mes Repères" du panneau du Journal de parcours (voir
// _reperesMettreAJourJournal()) -- même fonction pour les deux, jamais
// dupliquée. Repères n'a aucune précondition (contrairement au Bilan de
// candidature, qui exige un CV) -- pas de fonction "demarrerReperes" en
// app.js, un appel direct à naviguerVers() suffirait techniquement, mais
// romprait la convention déjà établie par les 4 autres tuiles (chacune
// passe par un point d'entrée dédié, jamais par un naviguerVers() écrit
// en dur dans metiers.js). Ce point d'entrée s'y conforme.
//
// TACHE (chantier Journal de parcours) : capture la page d'origine
// AVANT de naviguer, pour que l'écran complet puisse y ramener au clic
// sur "Retour" plutôt que de revenir systématiquement à l'accueil --
// seul chemin possible jusqu'ici (la Boîte à outils ne s'ouvre que
// depuis 'cv'), mais le Journal de parcours peut être ouvert depuis
// n'importe quelle page.
var _reperesPageOrigine = null;

function reperesDemarrer() {
  _reperesPageOrigine = typeof pageActuelle !== 'undefined' ? pageActuelle : null;
  naviguerVers('reperes');
}

// Façade publique (même esprit que reperesCreerAvecTexte() : Regard
// extérieur appelle ici plutôt que d'écrire directement dans les
// Repères) -- marque une liste de Repères (par id) comme "analysés".
// TACHE (retour utilisateur, 2026-08-26) : appelée UNIQUEMENT après un
// import RÉUSSI d'une réponse (jamais au simple clic sur "Demander un
// regard extérieur", ni si le format de la réponse collée n'a pas pu
// être reconnu) -- voir modules/regard-exterieur/index.js.
function reperesMarquerAnalyses(ids) {
  if (!Array.isArray(ids) || !ids.length) { return; }
  _reperesListe().forEach(function (r) {
    if (ids.indexOf(r.id) !== -1) { r.analyse = true; }
  });
  _reperesRafraichirListe();
  _reperesMettreAJourJournal();
}

// TACHE (chantier "Phase B", 3e etat "Deuxieme regard") : jumelle de
// reperesMarquerAnalyses(), pour le 2e passage (approfondissement) --
// appelee UNIQUEMENT apres une fusion REUSSIE (jamais au simple clic sur
// "Aller plus loin", ni si le format colle n'est pas reconnu), meme
// principe. Un Repere marque ici est forcement deja `analyse` (le 2e
// passage ne part que de Reperes deja envoyes une 1re fois).
function reperesMarquerApprofondis(ids) {
  if (!Array.isArray(ids) || !ids.length) { return; }
  _reperesListe().forEach(function (r) {
    if (ids.indexOf(r.id) !== -1) { r.approfondi = true; }
  });
  _reperesRafraichirListe();
}

// Appelée une seule fois au chargement (DOMContentLoaded, js/app.js),
// même principe que initPreferencesAffichage(). Garantit que
// dossier.reperes existe, initialise la visibilité et le contenu du
// bouton/panneau du Journal de parcours (#btnJournalParcours,
// index.html -- coquille vide, entièrement possédée par ce module),
// et branche son clic. Conservée comme point d'entrée nommé plutôt que
// supprimée, pour rester le seul endroit où une future initialisation
// viendrait s'ajouter, sans jamais toucher à nouveau js/app.js pour ça.
// TACHE (regard critique final du module Regard extérieur, "positionnement
// du bouton Journal de parcours") : remplace une valeur fixe en pixels
// (top:90px), qui entrait en collision avec le <h1> de pratiquement
// toutes les pages. Délègue depuis l'implémentation du module Carnet à
// positionnerIconePersistante() (js/app.js), généralisée dès qu'un
// deuxième bouton persistant en a eu besoin -- ne mesure plus la
// géométrie elle-même ici, un seul endroit porte ce calcul désormais.
// TACHE (retour utilisateur, 2026-08-25) : reference #btnCarnet (jamais
// cache, toujours en premier) plutot que #btnAide -- #btnCarnet etant
// visible en permanence, jamais de risque de lire un rectangle a zero
// (contrairement a l'ancien sens carnet->journal, ou #btnJournalParcours
// pouvait etre encore cache au moment du calcul). #panneauJournalParcours
// repositionne ici aussi, meme principe que _carnetPositionnerPanneau()
// (modules/carnet/index.js) : plus jamais une valeur fixe devinee en CSS.
function _reperesPositionnerBoutonJournal() {
  if (typeof positionnerIconePersistante === 'function') {
    positionnerIconePersistante('btnJournalParcours', 'btnCarnet');
  }
  var bouton = document.getElementById('btnJournalParcours');
  var panneau = document.getElementById('panneauJournalParcours');
  // TACHE (retour utilisateur, 2026-08-26, "je vois toujours les titres
  // des pages où je suis, mais je vois aussi bien la fenêtre") : le
  // panneau, désormais centré horizontalement (reperes.css), se cale
  // maintenant sous le <h1> RÉEL de la page courante -- jamais sous
  // #btnJournalParcours (qui reste, lui, dans la colonne d'icônes à
  // droite, sans rapport avec la position du panneau une fois centré).
  var h1 = document.querySelector('#app h1');
  var basTitre = h1 ? h1.getBoundingClientRect().bottom : 0;
  if (bouton && panneau && !bouton.hidden) {
    panneau.style.top = (basTitre + 16) + 'px';
  }
}

// Façade publique, ajoutée pour cet appelant réel (naviguerVers(),
// js/app.js) -- même patron que regardExterieurApresNavigation(), mais
// sans filtre de route : ce bouton est visible sur toute page, jamais
// une seule.
function reperesApresNavigation() {
  _reperesPositionnerBoutonJournal();
}

// TACHE (retour utilisateur, 2026-08-26) : pulse UNIQUEMENT à la toute
// première ouverture RÉELLE du panneau (jamais à sa fermeture, jamais
// rejoué ensuite) -- même principe qu'un simple drapeau en mémoire, comme
// _regardExterieurSeuilDejaTrack (modules/regard-exterieur/index.js),
// jamais persisté (redevient "première fois" à la session suivante).
var _reperesJournalInfoPulseDejaDeclenche = false;

function reperesInitialiser() {
  _reperesListe();
  // TACHE (chantier Journal de parcours) : icône injectée ici, jamais
  // codée en dur dans index.html -- cette coquille reste une ancre
  // générique, comme #app. Bouton révélé ou non selon les Repères déjà
  // présents (session restaurée, import...), pas seulement pour une
  // session neuve.
  var bouton = document.getElementById('btnJournalParcours');
  var panneau = document.getElementById('panneauJournalParcours');
  if (bouton && panneau) {
    bouton.innerHTML = '<i class="bi bi-journals"></i>';
    bouton.addEventListener('click', function () {
      panneau.hidden = !panneau.hidden;
      // TACHE (retour utilisateur, 2026-08-26) : pulse le bouton "i" DANS
      // l'entête du panneau (déjà rendu à ce stade, voir
      // _reperesMettreAJourJournal()) dès la 1ère ouverture RÉELLE (jamais
      // à la fermeture) -- invite à découvrir "à quoi sert ce raccourci"
      // juste au moment où la personne vient de s'en servir pour la
      // première fois.
      var boutonInfo = panneau.querySelector('.reperes-journal-info');
      if (!panneau.hidden && !_reperesJournalInfoPulseDejaDeclenche && boutonInfo) {
        _reperesJournalInfoPulseDejaDeclenche = true;
        boutonInfo.classList.add('reperes-pulse-confirmation');
        setTimeout(function () { boutonInfo.classList.remove('reperes-pulse-confirmation'); }, 10000);
      }
    });
  }
  _reperesMettreAJourJournal();
  _reperesPositionnerBoutonJournal();
  // TACHE : un redimensionnement peut changer la hauteur du <h1> (retour
  // à la ligne) sans navigation -- même prudence que
  // initHauteurProgressionFixe() (js/app.js) pour --hauteur-progression.
  window.addEventListener('resize', _reperesPositionnerBoutonJournal);
}

// Export CommonJS protege -- tests/reperesLogique.test.js (Node), aucun
// effet sur le chargement navigateur classique (balise <script>, ou
// `module` n'est jamais defini). Logique PURE seulement (aucun DOM).
if (typeof module !== 'undefined') {
  module.exports = {
    _reperesExtraitPourTitre: _reperesExtraitPourTitre,
    _reperesConstruire: _reperesConstruire,
    _reperesTexteRechercheRepere: _reperesTexteRechercheRepere,
    _reperesTexteProfond: _reperesTexteProfond
  };
}
