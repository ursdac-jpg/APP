// ============================================================
// apercuDocxIntegre.js
// ------------------------------------------------------------
// TACHE (simplification : DOCX seul + apercu integre) : remplace la
// fenetre popup (window.open, visuellement deconnectee du reste de
// l'application) par un panneau integre DANS la page, avec les memes
// couleurs/police/boutons Bootstrap que le reste de l'app.
//
// Principe cle : affiche le VRAI fichier .docx via la librairie
// docx-preview -- ce n'est pas une deuxieme version qui "ressemble" au
// Word, c'est le meme fichier montre a l'ecran avant telechargement.
// Aucune divergence possible entre l'apercu et le fichier final.
//
// TACHE (traitement DOCX natif etendu a la lettre et l'entretien) :
// generalise pour les 3 types de document (CV, lettre, entretien), voir
// _configApercuDocx() ci-dessous -- un seul panneau, parametre par type,
// au lieu de trois copies presque identiques.
//
// LIMITE ASSUMEE : uniquement les modeles couverts par un generateur
// Word natif pour chaque type (voir MODELES_AVEC_DOCX_NATIF_CV/LETTRE/
// ENTRETIEN dans les fichiers exportDocxNatif*.js correspondants).
//
// PREMIERE VERSION NON TESTEE EN CONDITIONS REELLES POUR LETTRE/ENTRETIEN :
// le CV a ete confirme fonctionnel par un test reel (voir historique) --
// la partie generique de ce fichier est donc deja eprouvee, mais les
// deux nouveaux types n'ont pas encore ete testes chez vous.
// ============================================================

var _promesseLibrairieDocxPreview = null;
function chargerLibrairieDocxPreview() {
  if (_promesseLibrairieDocxPreview) { return _promesseLibrairieDocxPreview; }
  _promesseLibrairieDocxPreview = new Promise(function (resolve, reject) {
    var dejaLa = _obtenirDocxPreview();
    if (dejaLa) { resolve(dejaLa); return; }
    var scriptJsZip = document.createElement('script');
    scriptJsZip.src = 'modules/cv-editor/jszip.min.js';
    scriptJsZip.onload = function () {
      if (!window.JSZip) { reject(new Error('JSZip indisponible apres chargement.')); return; }
      var script = document.createElement('script');
      script.src = 'modules/cv-editor/docx-preview.js';
      script.onload = function () {
        var lib = _obtenirDocxPreview();
        lib ? resolve(lib) : reject(new Error('Librairie docx-preview indisponible ou nom global inattendu.'));
      };
      script.onerror = function () { reject(new Error('Impossible de charger la librairie docx-preview.')); };
      document.head.appendChild(script);
    };
    scriptJsZip.onerror = function () { reject(new Error('Impossible de charger la librairie JSZip.')); };
    document.head.appendChild(scriptJsZip);
  });
  return _promesseLibrairieDocxPreview;
}

function _obtenirDocxPreview() {
  if (window.docxPreview && typeof window.docxPreview.renderAsync === 'function') { return window.docxPreview; }
  if (window.docx && typeof window.docx.renderAsync === 'function') { return window.docx; }
  return null;
}

// ============================================================
// Configuration par type de document -- SEUL endroit a modifier pour
// brancher un futur 4e type de document sur ce meme panneau.
// ============================================================
function _configApercuDocx(type) {
  var configs = {
    cv: {
      titre: 'Aperçu du CV (Word)', nomFichier: 'cv.docx',
      modeles: function () { return typeof MODELES_CV_DISPONIBLES !== 'undefined' ? MODELES_CV_DISPONIBLES : []; },
      modelesNatifs: function () { return typeof MODELES_AVEC_DOCX_NATIF_CV !== 'undefined' ? MODELES_AVEC_DOCX_NATIF_CV : []; },
      // TACHE (format A5) : genererDocxNatifCVFormat() (formatA5CV.js) en
      // priorite si disponible -- gere lui-meme A4 (comportement inchange,
      // via construireObjetCVPourExport) et A5 (contenu recadre + page
      // reduite). Repli sur l'ancien chemin si le fichier n'est pas charge.
      // TACHE (retour utilisateur : "sans accroche") : lu directement ici
      // (etatApercuInline.cv, déjà accessible dans ce fichier) -- jamais
      // ajouté à la signature générique de generer(), partagée avec
      // lettre/entretien qui n'ont pas ce réglage.
      generer: function (modele, couleurId, formatPage) {
        // TACHE (Projet XXL, correction : "l'aperçu en direct ne reflète
        // probablement pas ces réglages avancés") : genererDocxNatifCVFormat()
        // (formatA5CV.js) transmet couleurId TEL QUEL a genererDocxComposeur()
        // pour modele==='composeur' (verifie directement dans formatA5CV.js --
        // aucune manipulation de ce parametre de son cote) -- il suffit donc
        // de resoudre ICI, AVANT l'appel, le theme reel via
        // composeurResoudreThemeGeneration() (app.js, fonction PARTAGEE avec
        // genererBlobDocumentActif() -- jamais deux logiques de construction
        // du theme Projet XXL). Sans effet sur les 16 modeles classiques ni
        // sur Sobre/Institutionnel/Moderne : la fonction retourne alors
        // couleurId inchange (voir sa propre documentation, app.js).
        // TACHE (chantier Mini CV A5 -- migration du panneau riche
        // Composeur) : le Mini CV (A5) est desormais lui aussi genere par
        // le Composeur (modele local vaut 'portrait'/'paysage', jamais
        // 'composeur' pour ce format) -- bug reel confirme, trouve par
        // test direct : sans cet elargissement, couleurId restait une
        // simple chaine pour l'A5, jamais resolue en objet theme complet,
        // donc AUCUN reglage du panneau (couleurs, police, icones, fond
        // des colonnes, separateur, et le rajustement automatique des
        // colonnes) n'atteignait jamais le document reellement genere --
        // seule la couleur de base encodee dans la chaine s'appliquait.
        var estComposeurOuA5 = (modele === 'composeur' || modele === 'portrait' || modele === 'paysage');
        var couleurEffective = (estComposeurOuA5 && typeof composeurResoudreThemeGeneration === 'function')
          ? composeurResoudreThemeGeneration(couleurId, (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv) ? etatApercuInline.cv.reglagesProjetXXL : null)
          : couleurId;
        if (typeof genererDocxNatifCVFormat === 'function') { return genererDocxNatifCVFormat(modele, couleurEffective, formatPage, etatApercuInline.cv.sansAccroche); }
        var promesseObjet = (typeof construireObjetCVPourExport === 'function')
          ? construireObjetCVPourExport(modele)
          : Promise.resolve(normaliserDonneesCV(dossier));
        return promesseObjet.then(function (objetCV) {
          if (typeof genererDocxNatifCVColore === 'function') { return genererDocxNatifCVColore(modele, objetCV, couleurEffective); }
          return genererDocxNatifCV(modele, objetCV);
        });
      }
    },
    lettre: {
      titre: 'Aperçu de la lettre (Word)', nomFichier: 'lettre.docx',
      modeles: function () { return typeof MODELES_LETTRE_DISPONIBLES !== 'undefined' ? MODELES_LETTRE_DISPONIBLES : []; },
      modelesNatifs: function () { return typeof MODELES_AVEC_DOCX_NATIF_LETTRE !== 'undefined' ? MODELES_AVEC_DOCX_NATIF_LETTRE : []; },
      // TACHE (couleurs + formats pour la lettre) : genererDocxNatifLettreFormat()
      // (formatsLettreEntretien.js) si disponible -- gere couleur/format,
      // repli sur l'ancienne fonction sinon (comportement inchange).
      generer: function (modele, couleurId, formatPage) {
        if (typeof genererDocxNatifLettreFormat === 'function') { return genererDocxNatifLettreFormat(modele, couleurId, formatPage); }
        return genererDocxNatifLettre(modele, normaliserDonneesLettre(dossier));
      }
    },
    entretien: {
      titre: "Aperçu de la fiche d'entretien (Word)", nomFichier: 'preparation-entretien.docx',
      modeles: function () { return typeof MODELES_ENTRETIEN_DISPONIBLES !== 'undefined' ? MODELES_ENTRETIEN_DISPONIBLES : []; },
      modelesNatifs: function () { return typeof MODELES_AVEC_DOCX_NATIF_ENTRETIEN !== 'undefined' ? MODELES_AVEC_DOCX_NATIF_ENTRETIEN : []; },
      generer: function (modele, couleurId, formatPage) {
        if (typeof genererDocxNatifEntretienFormat === 'function') { return genererDocxNatifEntretienFormat(modele, couleurId, formatPage); }
        return genererDocxNatifEntretien(modele, normaliserDonneesEntretien(dossier));
      }
    }
  };
  return configs[type] || configs.cv;
}

var _panneauApercuOuvert = false;
var _typeApercuDocxActif = 'cv';

// ============================================================
// Point d'entree public, appele depuis app.js.
// type : 'cv' | 'lettre' | 'entretien' (par defaut 'cv', pour rester
// compatible avec les appels existants ouvrirApercuDocxIntegre(modele)).
// ============================================================
function ouvrirApercuDocxIntegre(typeOuModele, modeleInitialSiType) {
  // Compatibilite : ouvrirApercuDocxIntegre('aquarelle') (1 argument,
  // ancien appel CV) reste valide, en plus du nouveau
  // ouvrirApercuDocxIntegre('cv', 'aquarelle') (2 arguments).
  var type = modeleInitialSiType !== undefined ? typeOuModele : 'cv';
  var modeleInitial = modeleInitialSiType !== undefined ? modeleInitialSiType : typeOuModele;

  var config = _configApercuDocx(type);
  // TACHE (format A5) : idem pour le format de page -- calcule AVANT la
  // verification de couverture ci-dessous, car la liste de modeles a
  // verifier n'est pas la meme selon le format.
  var formatPageInitial = (typeof etatApercuInline !== 'undefined' && etatApercuInline[type] && etatApercuInline[type].formatPage) || 'A4';
  // TACHE (chantier Mini CV A5, bug reel confirme : "Ouvrir le grand
  // aperçu" en A5 ne faisait rien) : config.modelesNatifs() ne couvre que
  // les modeles A4 (MODELES_AVEC_DOCX_NATIF_CV) -- 'portrait'/'paysage'
  // n'y figurent jamais (liste separee, MODELES_AVEC_DOCX_NATIF_A5_CV),
  // donc cette verification echouait TOUJOURS pour l'A5 et bloquait
  // l'ouverture du panneau des le depart (alert + return silencieux).
  var estA5CVOuverture = (type === 'cv' && formatPageInitial === 'A5');
  var modelesNatifsOuverture = (estA5CVOuverture && typeof MODELES_AVEC_DOCX_NATIF_A5_CV !== 'undefined')
    ? MODELES_AVEC_DOCX_NATIF_A5_CV
    : config.modelesNatifs();
  if (modelesNatifsOuverture.indexOf(modeleInitial) === -1) {
    alert('Ce modèle ne dispose pas encore d\'un aperçu Word. Choisissez un autre modèle, ou téléchargez directement le fichier.');
    return;
  }
  // TACHE (refonte "Aperçu et finalisation" : palette de couleurs) :
  // reprend la couleur deja choisie dans l'accordeon (etatApercuInline),
  // pour que le grand apercu s'ouvre coherent avec ce qui etait affiche.
  var couleurInitiale = (typeof etatApercuInline !== 'undefined' && etatApercuInline[type]) ? etatApercuInline[type].couleur : null;
  _typeApercuDocxActif = type;
  _construirePanneauApercuDocx(type, modeleInitial, couleurInitiale, formatPageInitial);
  _rafraichirApercuDocx(type, modeleInitial, null, null, false, couleurInitiale, formatPageInitial);
}

function _construirePanneauApercuDocx(type, modeleInitial, couleurInitiale, formatPageInitial) {
  var panneauExistant = document.getElementById('apercu-docx-panneau');
  if (panneauExistant) {
    // Reutilise le meme panneau pour un autre type -- reconstruit juste
    // le contenu specifique (titre, liste de modeles).
    panneauExistant.style.display = 'flex';
    _reconstruireContenuPanneau(type, modeleInitial, couleurInitiale, formatPageInitial);
    _panneauApercuOuvert = true;
    return;
  }

  var panneau = document.createElement('div');
  panneau.id = 'apercu-docx-panneau';
  panneau.style.cssText = 'position:fixed;inset:0;background:#FFFFFF;z-index:99999;display:flex;flex-direction:column;font-family:"Segoe UI",Roboto,system-ui,sans-serif;';
  document.body.appendChild(panneau);
  _panneauApercuOuvert = true;
  _reconstruireContenuPanneau(type, modeleInitial, couleurInitiale, formatPageInitial);
}

// TACHE (retour utilisateur : coherence, cartes de modeles ici aussi) :
// suit le modele actuellement affiche dans CE panneau (plus de <select> a
// interroger pour le savoir) -- mis a jour au clic sur une carte, lu par
// le bouton Telecharger.
var _modeleActifPanneau = null;
// TACHE (refonte "Aperçu et finalisation" : palette de couleurs) : meme
// principe que _modeleActifPanneau, pour la couleur choisie DANS ce panneau.
var _couleurActifPanneau = null;
// TACHE (format A5) : idem, pour le format de page choisi DANS ce panneau
// ('A4' par defaut, ou 'A5').
var _formatPageActifPanneau = 'A4';

function _reconstruireContenuPanneau(type, modeleActif, couleurActive, formatPageActif) {
  var config = _configApercuDocx(type);
  var panneau = document.getElementById('apercu-docx-panneau');
  if (!panneau) { return; }

  // TACHE (retour utilisateur : sélecteur de modèles A5, comme pour A4) :
  // en A5, le CV a sa PROPRE liste de modeles (MODELES_A5_CV_DISPONIBLES),
  // independante de MODELES_CV_DISPONIBLES (A4) -- meme principe que deja
  // applique au selecteur inline de l'accordeon "Aperçu et finalisation".
  var estA5CV = (type === 'cv' && formatPageActif === 'A5');
  var listeModeles = (estA5CV && typeof MODELES_A5_CV_DISPONIBLES !== 'undefined') ? MODELES_A5_CV_DISPONIBLES : config.modeles();
  var listeModelesNatifsIds = (estA5CV && typeof MODELES_AVEC_DOCX_NATIF_A5_CV !== 'undefined') ? MODELES_AVEC_DOCX_NATIF_A5_CV : config.modelesNatifs();
  var modelesNatifs = listeModeles.filter(function (m) { return listeModelesNatifsIds.indexOf(m.id) !== -1; });
  _modeleActifPanneau = modeleActif || (modelesNatifs[0] && modelesNatifs[0].id);
  _couleurActifPanneau = couleurActive || null;
  // TACHE ("Nuances rapides") : repart d'aucune rangee depliee a chaque
  // (re)ouverture du panneau -- _construirePastillesPanneau() la rouvrira
  // elle-meme sur la bonne couleur si _couleurActifPanneau est deja pose.
  _baseCouleurOuvertePanneau = null;
  _formatPageActifPanneau = formatPageActif || 'A4';
  // TACHE (couleurs + formats pour la lettre et l'entretien) : disponible
  // desormais pour les 3 types -- une fonction de verification par type.
  // TACHE (retour utilisateur, bug reel confirme : "cliquer une pastille
  // dans le grand apercu fait retomber le theme sur Sobre") : ce
  // selecteur de pastilles (obtenirPalettesCouleursCV, 11 couleurs a plat)
  // ecrit un id de couleur incompatible avec composeurObtenirTheme(), qui
  // ne le reconnait jamais comme theme Projet XXL valide -- CV en A4
  // (composeur) etait deja exclu (absent de MODELES_AVEC_COULEURS_CV),
  // mais le Mini CV A5 (portrait/paysage) y restait encore expose, alors
  // que les 2 sont desormais generes par le MEME moteur Composeur/Projet
  // XXL (voir formatA5CV.js). Retire entierement pour 'cv' (retour
  // utilisateur explicite : jamais de repli partiel) -- la couleur du CV,
  // A4 comme A5, ne se choisit plus que depuis le petit panneau "Aperçu et
  // finalisation" (construirePaletteCouleurs(), deja Projet-XXL-aware).
  // Lettre/Entretien restent inchanges (pas migres vers Projet XXL).
  var FONCTIONS_SUPPORT_COULEURS_PANNEAU = {
    cv: null,
    lettre: typeof modeleLettreSupporteCouleurs === 'function' ? modeleLettreSupporteCouleurs : null,
    entretien: typeof modeleEntretienSupporteCouleurs === 'function' ? modeleEntretienSupporteCouleurs : null
  };
  var fonctionSupportPanneau = FONCTIONS_SUPPORT_COULEURS_PANNEAU[type];
  var supportecouleurs = !!(fonctionSupportPanneau && fonctionSupportPanneau(_modeleActifPanneau));
  var supporteFormatA5 = true;
  var LIBELLES_MINI_PANNEAU = { cv: 'Mini CV (A5)', lettre: 'Mini lettre (A5)', entretien: 'Fiche compacte (A5)' };

  // TACHE (retour utilisateur 2026-09-15) : pour la lettre et l'entretien,
  // ce grand aperçu ne doit plus rien proposer d'autre que regarder le
  // document, le telecharger, ou fermer -- tous les reglages (modele,
  // format, couleur) vivent desormais UNIQUEMENT dans "La mise en page"
  // (le petit panneau, deja mis a jour : plus de grille de modeles pour
  // ces 2 types, plus de palette pour la lettre, palette reduite pour
  // l'entretien). Garder un 2e endroit pour les memes reglages aurait
  // recree exactement le doublon qu'on vient de retirer ailleurs. Le CV
  // garde son panneau complet, inchange (modeles Mini CV A5, formats,
  // aide/personnalisation).
  panneau.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1.2rem;border-bottom:1px solid #E5E7EB;background:#F8F9FA;flex:none;flex-wrap:wrap;gap:0.6rem;">' +
      (type !== 'cv' ? '<div></div>' :
      '<div style="display:flex;align-items:center;gap:0.6rem;flex:1;min-width:0;">' +
        '<style>#apercu-docx-carrousel-modeles .carte-modele-cv{cursor:pointer;border:2px solid #E5E7EB;border-radius:6px;' +
        'padding:0.2rem;flex:0 0 auto;width:44px;text-align:center;background:#FFFFFF;}' +
        '#apercu-docx-carrousel-modeles .carte-modele-cv:hover{border-color:#93C5FD;}' +
        '#apercu-docx-carrousel-modeles .carte-modele-cv-active{border-color:#2563EB;border-width:3px;}' +
        '#apercu-docx-carrousel-modeles .carte-modele-cv-miniature svg{width:100%;height:auto;display:block;border-radius:2px;}' +
        '#apercu-docx-carrousel-modeles .carte-modele-cv-nom{display:none;}' +
        '.pastille-couleur-apercu{width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid #FFFFFF;' +
        'box-shadow:0 0 0 1px #D1D5DB;display:inline-block;}' +
        '.pastille-couleur-apercu-active{box-shadow:0 0 0 2px #111827;}' +
        '.pastille-nuance-apercu{width:13px;height:13px;border-radius:50%;cursor:pointer;border:1px solid #FFFFFF;' +
        'box-shadow:0 0 0 1px #D1D5DB;display:inline-block;}' +
        '.pastille-nuance-apercu-active{box-shadow:0 0 0 2px #111827;}' +
        '.bouton-format-page{border:1px solid #E5E7EB;background:#FFFFFF;border-radius:999px;padding:0.15rem 0.6rem;font-size:0.78rem;cursor:pointer;}' +
        '.bouton-format-page-active{background:#111827;color:#FFFFFF;border-color:#111827;}</style>' +
        // TACHE (retour utilisateur : "le texte 'Aperçu du CV (Word)' est
        // retire -- deplace les boutons de format a la place de ce texte")
        // : les boutons de format (A4 Détaillé/Essentiel/Mini CV/CV
        // Intégral, construits plus bas dans ce meme fichier -- voir
        // apercu-docx-format-page) sont deplaces ICI, en tout premier
        // (a la place exacte du titre retire juste au-dessus), plutot que
        // de rester apres le carrousel/la bascule A5 -- rien ne change
        // dans leur construction, seul l'ORDRE d'affichage change.
        (supporteFormatA5
          ? '<div id="apercu-docx-format-page" style="display:flex;gap:0.3rem;align-items:center;">' +
            '<button type="button" class="bouton-format-page' + ((_formatPageActifPanneau === 'A4' || !_formatPageActifPanneau) ? ' bouton-format-page-active' : '') + '" data-format-page="A4">A4 Détaillé</button>' +
            '<button type="button" class="bouton-format-page' + (_formatPageActifPanneau === 'A4-essentiel' ? ' bouton-format-page-active' : '') + '" data-format-page="A4-essentiel">A4 Essentiel</button>' +
            '<button type="button" class="bouton-format-page' + (_formatPageActifPanneau === 'A5' ? ' bouton-format-page-active' : '') + '" data-format-page="A5">' + LIBELLES_MINI_PANNEAU[type] + '</button>' +
            '<button type="button" class="bouton-format-page' + (_formatPageActifPanneau === 'A4-integral' ? ' bouton-format-page-active' : '') + '" data-format-page="A4-integral">CV Intégral</button>' +
            '</div>'
          : '') +
        // TACHE (retour utilisateur : "quand j'ouvre le grand aperçu,
        // là-haut, j'ai les anciens modèles et le composeur aussi le
        // dernier, il va falloir tout enlever") : Projet XXL étant
        // désormais l'unique modèle de CV en A4, ce carrousel (modèles
        // classiques + Composeur) n'a plus lieu d'être pour le CV en A4.
        // TACHE (chantier Mini CV A5, retour utilisateur : "en grand
        // apercu A5 je dois voir les CV A5 portrait et paysage") : en A5,
        // le CV garde 2 mises en page reelles (contrairement a l'A4 ou
        // Projet XXL est desormais unique) -- bascule Portrait/Paysage
        // dediee, jamais le carrousel A4 (sans objet) ni un simple message
        // statique (perime, l'A5 a bel et bien un choix a faire).
        (_formatPageActifPanneau === 'A5'
          ? '<div id="apercu-docx-a5-bascule" style="display:flex;gap:0.3rem;align-items:center;">' +
            MODELES_A5_CV_DISPONIBLES.map(function (m) {
              return '<button type="button" class="bouton-format-page' + (_modeleActifPanneau === m.id ? ' bouton-format-page-active' : '') + '" data-modele-a5="' + m.id + '">' + m.nom + '</button>';
            }).join('')
            + '</div>'
          : '') +
        '<div id="apercu-docx-pastilles" style="display:' + (supportecouleurs ? 'flex' : 'none') + ';gap:0.3rem;align-items:center;margin-left:0.4rem;"></div>' +
      '</div>') +
      // TACHE (retour utilisateur : "les boutons sont à peine visibles --
      // on va les mettre entre CV Intégral et Télécharger le Word") :
      // deplaces de flottants (position:fixed, peu visibles a cheval sur
      // 2 fonds) vers de simples boutons DANS la barre du haut, entre le
      // groupe de gauche (titre/carrousel/format de page, se termine par
      // "CV Intégral") et le groupe de droite (Télécharger/Fermer) --
      // uniquement pour le CV (seul type avec un panneau "Personnaliser"
      // Structure/Style visuel/Contenu a expliquer). Jamais dans
      // #apercu-docx-zone (rendu docx-preview REEL) : aucun risque de les
      // voir dans le fichier telecharge.
      (type === 'cv'
        ? '<div style="display:flex;gap:0.4rem;align-items:center;">' +
          // TACHE (retour utilisateur : "ces 2 boutons n'ont pas
          // d'explication -- peu de place ici, mais il faut quand meme
          // signaler leur presence") : court texte noir (fond clair de
          // cette barre, contrairement au panneau PDF sombre) juste devant
          // les 2 icones -- purement informatif, jamais cliquable.
          // TACHE (retour utilisateur : "c'est parfait, juste le mettre en
          // gras pour que ça se voie mieux") : font-weight ajoute, rien
          // d'autre ne change (taille/couleur/texte identiques).
          '<span style="font-size:0.78rem;font-weight:700;color:#111827;white-space:nowrap;">Aide et personnalisation :</span>' +
          '<button type="button" id="btnAideDocx" title="Astuce sur le panneau Personnaliser" aria-label="Astuce" ' +
          'style="width:30px;height:30px;border-radius:50%;border:none;background:#374151;color:#fff;font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;">💡</button>' +
          '<button type="button" id="btnEditionDocx" title="Modifier le texte" aria-label="Modifier le texte" ' +
          'style="width:30px;height:30px;border-radius:50%;border:none;background:#374151;color:#fff;font-size:14px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;">✍️</button>' +
          '</div>'
        : '') +
      '<div>' +
        '<button type="button" id="apercu-docx-btn-telecharger" class="btn btn-primary btn-sm" style="margin-right:0.5rem;">Télécharger le Word</button>' +
        // TACHE (retour utilisateur, 2026-08-22 -- "je valide mon CV" vs
        // "fermer", 2 sorties a intention differente) : "Je valide" marque
        // le document comme version retenue (marquerDocumentEnregistre(),
        // deja utilise partout ailleurs dans l'app pour ce signal -- jamais
        // un 2e mecanisme), PUIS ferme comme "Fermer" -- les 2 boutons
        // ferment techniquement de la meme facon, seule l'intention differe.
        // TACHE (retour utilisateur 2026-09-15) : "Je valide" n'a aucune
        // plus-value pour la lettre/l'entretien (rien d'autre a debloquer
        // ici -- contrairement au CV, ou il marque le document retenu) --
        // retire pour ces 2 types, garde tel quel pour le CV.
        (type === 'cv'
          ? '<button type="button" id="apercu-docx-btn-valider" class="btn btn-success btn-sm" style="margin-right:0.5rem;">✅ Je valide mon CV</button>'
          : '') +
        '<button type="button" id="apercu-docx-btn-fermer" class="btn btn-outline-secondary btn-sm">Fermer</button>' +
      '</div>' +
    '</div>' +
    '<div id="apercu-docx-message" style="padding:1rem;text-align:center;color:#6B7280;flex:none;"></div>' +
    '<div style="flex:1;overflow:auto;background:#F3F4F6;padding:1.5rem;display:flex;justify-content:center;">' +
      '<div id="apercu-docx-zone" style="background:#FFFFFF;box-shadow:0 0 8px rgba(0,0,0,0.12);min-height:200px;width:100%;max-width:850px;"></div>' +
    '</div>' +
    (type === 'cv' ? _htmlPopoversAideDocx() : '');

  if (type === 'cv') { _cablerBoutonsAideDocx(); }

  _construirePastillesPanneau();
  var zoneFormatPage = document.getElementById('apercu-docx-format-page');
  if (zoneFormatPage) {
    zoneFormatPage.querySelectorAll('[data-format-page]').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var valeur = this.dataset.formatPage;
        if (valeur === _formatPageActifPanneau) { return; }
        var formatPageAvant = _formatPageActifPanneau;
        _formatPageActifPanneau = valeur;
        if (typeof etatApercuInline !== 'undefined' && etatApercuInline[_typeApercuDocxActif]) {
          etatApercuInline[_typeApercuDocxActif].formatPage = valeur;
        }
        // TACHE (chantier Mini CV A5, bug reel confirme par l'utilisateur :
        // "en grand apercu je vois le modele A4, pas le A5") : pour le CV,
        // le modele vit dans 2 champs distincts (.modele pour A4,
        // toujours 'composeur' ; .modeleA5 pour A5, 'portrait'/'paysage')
        // -- _modeleActifPanneau doit basculer sur le bon des 2 a CHAQUE
        // changement de format ici, sinon un passage vers/depuis 'A5'
        // garde l'ancien modele (ex. 'composeur' alors qu'on vient de
        // passer en A5), meme bug que celui deja corrige pour le bouton
        // "Ouvrir le grand aperçu" (voir app.js).
        if (_typeApercuDocxActif === 'cv') {
          if (valeur === 'A5') {
            _modeleActifPanneau = (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv.modeleA5) || 'portrait';
          } else if (formatPageAvant === 'A5') {
            _modeleActifPanneau = 'composeur';
          }
        }
        // Reconstruit tout le panneau (plutot qu'un patch partiel) : le
        // passage vers/depuis A5 change aussi la barre superieure elle-meme
        // (carrousel de modeles A4 masque, permutation Portrait/Paysage
        // affichee a la place, voir plus haut) -- jamais coherent avec un
        // simple ravalement des classes actives.
        _reconstruireContenuPanneau(_typeApercuDocxActif, _modeleActifPanneau, _couleurActifPanneau, valeur);
        if (typeof rechargerApercuInline === 'function') { rechargerApercuInline(_typeApercuDocxActif, _modeleActifPanneau); }
        _rafraichirApercuDocx(_typeApercuDocxActif, _modeleActifPanneau, null, null, false, _couleurActifPanneau, valeur);
      });
    });
  }

  function _fermerPanneauApercuDocx() {
    panneau.style.display = 'none';
    _panneauApercuOuvert = false;
    // TACHE (retour utilisateur : clic "Personnaliser" (CV, js/app.js)
    // ouvre desormais ce grand apercu avec le panneau de reglages Projet
    // XXL epingle par-dessus, voir _synchroniserPanneauReglagesXXLGrandApercu()
    // -- ce fichier est GENERIQUE (partage avec lettre/entretien, jamais
    // de dependance directe sur ce panneau CV specifique), mais doit
    // quand meme le desepingler/masquer a la fermeture, sinon il reste
    // visible flottant par-dessus la page principale une fois le grand
    // apercu ferme. Reset du drapeau reserve au CV (personnalisationEnGrandApercu
    // n'existe et n'a de sens que sur etatApercuInline.cv) -- sans effet,
    // jamais d'erreur, si ce grand apercu vient de lettre/entretien.
    if (type === 'cv' && typeof etatApercuInline !== 'undefined' && etatApercuInline.cv) {
      etatApercuInline.cv.personnalisationEnGrandApercu = false;
    }
    if (typeof _synchroniserPanneauReglagesXXLGrandApercu === 'function') { _synchroniserPanneauReglagesXXLGrandApercu(); }
  }
  document.getElementById('apercu-docx-btn-fermer').addEventListener('click', _fermerPanneauApercuDocx);
  // TACHE (retour utilisateur 2026-09-15) : n'existe plus que pour le CV
  // (voir sa construction plus haut) -- garde-fou, jamais d'exception pour
  // lettre/entretien.
  var boutonValiderApercu = document.getElementById('apercu-docx-btn-valider');
  if (boutonValiderApercu) {
    boutonValiderApercu.addEventListener('click', function () {
      if (typeof marquerDocumentEnregistre === 'function') { marquerDocumentEnregistre(type); }
      if (typeof trackEvenement === 'function') { trackEvenement(type + '_valide_grand_apercu'); }
      _fermerPanneauApercuDocx();
    });
  }
  document.getElementById('apercu-docx-btn-telecharger').addEventListener('click', function () {
    var cfg = _configApercuDocx(_typeApercuDocxActif);
    var modele = _modeleActifPanneau;
    var boutonRef = this;
    var texteOriginal = boutonRef.textContent;
    boutonRef.textContent = 'Génération…';
    boutonRef.disabled = true;
    cfg.generer(modele, _couleurActifPanneau, _formatPageActifPanneau).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var lien = document.createElement('a');
      lien.href = url; lien.download = cfg.nomFichier;
      document.body.appendChild(lien); lien.click(); lien.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      boutonRef.textContent = texteOriginal;
      boutonRef.disabled = false;
      // TACHE (bouton "Merci bien, j'ai fini") : ce panneau (ouvert depuis
      // "Aperçu" dans la section Exporter) declenche lui aussi un vrai
      // telechargement -- meme regle que le bouton "Telecharger le Word"
      // de la section Exporter elle-meme (marquerDocumentEnregistre defini
      // dans app.js, scripts classiques partageant le meme scope global).
      // TACHE (retour utilisateur : "je ne comprends pas ce qui se passe
      // ensuite" -- le bouton de fin de parcours doit deja etre visible
      // SANS avoir a passer par l'onglet Exporter) : marquerDocumentEnregistre()
      // (app.js) rafraichit DEJA elle-meme .barre-navigation a chaque appel
      // (voir son propre commentaire : "petite fonction partagee... ET
      // rafraichit tout de suite la barre du bas") -- rien d'autre a
      // ajouter ici, un pageResultats() complet serait redondant (et
      // ecraserait inutilement le reste de la page, ce panneau y compris
      // les etats locaux non lies au dossier).
      if (typeof marquerDocumentEnregistre === 'function') { marquerDocumentEnregistre(_typeApercuDocxActif); }
    }).catch(function () {
      boutonRef.textContent = texteOriginal;
      boutonRef.disabled = false;
      alert('Impossible de générer le fichier Word pour le moment.');
    });
  });

  // TACHE (retour utilisateur : cartes de modeles, coherence CV/Lettre/
  // Entretien) : reutilise integralement genererCartesSelecteurModeles()/
  // genererMiniatureSVG()/obtenirMetaModeleType() (app.js, deja construites
  // pour l'accordeon "Apercu et finalisation"), aucune logique de miniature
  // dupliquee ici.
  var carrousel = document.getElementById('apercu-docx-carrousel-modeles');
  if (carrousel && typeof obtenirMetaModeleType === 'function' && typeof genererCartesSelecteurModeles === 'function') {
    Promise.all(modelesNatifs.map(function (m) { return obtenirMetaModeleType(type, m.id); })).then(function (metas) {
      var metasParModele = {};
      modelesNatifs.forEach(function (m, i) { metasParModele[m.id] = metas[i]; });
      carrousel.innerHTML = genererCartesSelecteurModeles(modelesNatifs, _modeleActifPanneau, metasParModele);
      carrousel.querySelectorAll('[data-modele]').forEach(function (carte) {
        carte.addEventListener('click', function () {
          var id = this.dataset.modele;
          if (id === _modeleActifPanneau) { return; }
          _modeleActifPanneau = id;
          // TACHE (correction bug : divergence carrousel principal / grand
          // apercu) : le choix fait ICI (dans le panneau) doit aussi mettre
          // a jour etatApercuInline[type].modele -- sinon le carrousel de la
          // page (accordeon "Apercu et finalisation") reste bloque sur
          // l'ancien choix, et un futur "Telecharger le Word" depuis LA-BAS
          // utiliserait le mauvais modele. Une seule memoire, dans les deux
          // sens (voir aussi construireCarrouselModeles() dans app.js, qui
          // fait deja le chemin inverse).
          if (typeof etatApercuInline !== 'undefined' && etatApercuInline[type]) {
            // TACHE (retour utilisateur : sélecteur A5, comme pour A4) :
            // en A5, le choix vit dans etatApercuInline.cv.modeleA5 (jamais
            // .modele, reserve au choix A4) -- meme principe que le
            // carrousel inline (construireCarrouselModeles(), app.js).
            if (type === 'cv' && _formatPageActifPanneau === 'A5') {
              etatApercuInline[type].modeleA5 = id;
            } else {
              etatApercuInline[type].modele = id;
            }
            etatApercuInline[type].choisiManuellement = true;
          }
          // Repercute aussi visuellement sur le carrousel de la page, s'il
          // est visible en meme temps que le panneau (evite un carrousel
          // "en retard" tant que la page n'est pas rechargee).
          if (typeof rechargerApercuInline === 'function') { rechargerApercuInline(type, id); }
          carrousel.querySelectorAll('[data-modele]').forEach(function (c) { c.classList.remove('carte-modele-cv-active'); });
          this.classList.add('carte-modele-cv-active');
          // TACHE (refonte "Aperçu et finalisation" : palette de couleurs) :
          // un changement de modele garde la couleur choisie si le nouveau
          // modele la supporte aussi (coherence visuelle), sinon revient a
          // la couleur d'origine du modele.
          // TACHE (retour utilisateur : pastilles couleur retirees du grand
          // apercu pour 'cv', voir FONCTIONS_SUPPORT_COULEURS_PANNEAU
          // plus haut) : ce carrousel classique ne se construit de toute
          // facon plus jamais pour 'cv' (voir plus haut, carousel vide
          // pour ce type) -- coherence uniquement, jamais atteint pour cv.
          var fonctionSupportClic = { cv: null, lettre: typeof modeleLettreSupporteCouleurs === 'function' ? modeleLettreSupporteCouleurs : null, entretien: typeof modeleEntretienSupporteCouleurs === 'function' ? modeleEntretienSupporteCouleurs : null }[type];
          var supporteEncore = !!(fonctionSupportClic && fonctionSupportClic(id));
          if (!supporteEncore) { _couleurActifPanneau = null; }
          var zonePastilles = document.getElementById('apercu-docx-pastilles');
          if (zonePastilles) { zonePastilles.style.display = supporteEncore ? 'flex' : 'none'; }
          _construirePastillesPanneau();
          _rafraichirApercuDocx(_typeApercuDocxActif, id, null, null, false, _couleurActifPanneau, _formatPageActifPanneau);
        });
      });
    });
  }
  // TACHE (chantier Mini CV A5, retour utilisateur : "en grand apercu A5
  // je dois voir les CV A5 portrait et paysage") : bascule dediee (voir
  // sa construction plus haut), meme principe que le carrousel de
  // modeles A4 (met a jour etatApercuInline.cv.modeleA5, repercute sur
  // l'apercu inline via rechargerApercuInline, puis rafraichit ce panneau).
  var zoneBasculeA5 = document.getElementById('apercu-docx-a5-bascule');
  if (zoneBasculeA5) {
    zoneBasculeA5.querySelectorAll('[data-modele-a5]').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var id = this.dataset.modeleA5;
        if (id === _modeleActifPanneau) { return; }
        _modeleActifPanneau = id;
        if (typeof etatApercuInline !== 'undefined' && etatApercuInline.cv) {
          etatApercuInline.cv.modeleA5 = id;
          etatApercuInline.cv.choisiManuellement = true;
        }
        zoneBasculeA5.querySelectorAll('[data-modele-a5]').forEach(function (b) { b.classList.remove('bouton-format-page-active'); });
        this.classList.add('bouton-format-page-active');
        if (typeof rechargerApercuInline === 'function') { rechargerApercuInline('cv', id); }
        _rafraichirApercuDocx(_typeApercuDocxActif, id, null, null, false, _couleurActifPanneau, _formatPageActifPanneau);
      });
    });
  }
  var btnCarrouselGauche = document.getElementById('apercu-docx-carrousel-gauche');
  var btnCarrouselDroite = document.getElementById('apercu-docx-carrousel-droite');
  if (btnCarrouselGauche) { btnCarrouselGauche.onclick = function () { carrousel.scrollBy({ left: -160, behavior: 'smooth' }); }; }
  if (btnCarrouselDroite) { btnCarrouselDroite.onclick = function () { carrousel.scrollBy({ left: 160, behavior: 'smooth' }); }; }
}

// ============================================================
// TACHE (retour utilisateur : "les boutons sont à peine visibles -- on va
// les mettre entre CV Intégral et Télécharger le Word") : 2 boutons ronds
// informatifs (jamais un mode d'édition ici, contrairement au PDF -- le
// Word affiché EST le vrai fichier .docx, l'éditer en place romprait la
// garantie "aucune divergence entre l'aperçu et le fichier final", voir
// l'en-tête de ce fichier), désormais de simples boutons DANS la barre du
// haut (voir _reconstruireContenuPanneau plus haut) au lieu de cercles
// flottants peu visibles. Popovers toujours position:fixed (un popover ne
// peut pas "flotter" dans une barre haute de 40px), mais positionnés au
// CLIC via getBoundingClientRect() du bouton -- jamais un recalcul
// permanent au resize, la barre elle-même ne bouge pas une fois rendue.
// ============================================================
function _htmlPopoversAideDocx() {
  var stylePopover = 'position:fixed;z-index:100002;background:#1a1a1a;color:#fff;border:1px solid #444;border-radius:8px;' +
    'padding:14px 16px;box-shadow:0 6px 20px rgba(0,0,0,0.4);font-size:12.5px;width:270px;display:none;';
  var styleTitreBarre = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:600;font-size:13px;';
  var styleFermer = 'background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;padding:0 4px;';
  return '<div id="popoverAideDocx" style="' + stylePopover + '">' +
      '<div style="' + styleTitreBarre + '"><span>Astuce</span><button type="button" id="btnFermerAideDocx" style="' + styleFermer + '">✕</button></div>' +
      '<ul style="margin:0 0 4px 0;padding-left:18px;line-height:1.5;">' +
        // TACHE (retour utilisateur : "un bouton i qui explique chaque
        // bouton, ça peut être un peu violent pour certains" -- liste
        // complétée pour couvrir tous les boutons réellement présents
        // aujourd'hui, ceux ajoutés depuis la première version de cette
        // liste n'y figuraient pas encore) : Pipette couleur/CV Créatif/
        // CV Complet ajoutés, jamais mentionnés avant.
        '<li>🎲 « Propose-moi un modèle » tire une nouvelle mise en page/couleur au hasard.</li>' +
        '<li>🎨 Les pastilles de couleur changent l’accent du CV sans rien casser.</li>' +
        '<li>💧 « Pipette couleur » récupère une couleur précise que vous avez en tête, où qu’elle apparaisse à l’écran.</li>' +
        '<li>Le bouton « CV Sobre » retire les couleurs vives pour une version plus classique ; « CV Créatif » fait l’inverse (plus visuel, coloré).</li>' +
        '<li>🎓 « CV Complet »/« CV Optimisé » choisit entre garder toutes vos formations/certifications, ou seulement les plus pertinentes.</li>' +
        '<li>« Structure »/« Style visuel »/« Contenu » permettent de tout régler en détail.</li>' +
        '<li>✍️ La main + le stylo explique comment modifier le texte de ce CV.</li>' +
      '</ul>' +
      '<div style="text-align:center;">' + htmlDeclencheurDemoVideo('cv-word-personnaliser', 'Voir la démonstration') + '</div>' +
    '</div>' +
    '<div id="popoverEditionDocx" style="' + stylePopover + '">' +
      '<div style="' + styleTitreBarre + '"><span>Modifier le texte</span><button type="button" id="btnFermerEditionDocx" style="' + styleFermer + '">✕</button></div>' +
      '<p style="margin:0;line-height:1.5;">' +
        'Cet aperçu montre le vrai fichier Word tel qu’il sera téléchargé - le texte ne peut donc pas être modifié directement ici. ' +
        'Une fois le CV <strong>téléchargé sur votre ordinateur</strong>, il est entièrement modifiable dans Word (texte, mise en forme...).' +
      '</p>' +
    '</div>';
}
function _cablerBoutonsAideDocx() {
  function positionnerPopoverSousBouton(bouton, popover) {
    var rect = bouton.getBoundingClientRect();
    popover.style.top = (rect.bottom + 8) + 'px';
    var gauche = Math.min(rect.left, window.innerWidth - popover.offsetWidth - 12);
    popover.style.left = Math.max(12, gauche) + 'px';
  }
  function basculerPopover(idBouton, idPopover, autreIdPopover) {
    var bouton = document.getElementById(idBouton);
    var popover = document.getElementById(idPopover);
    if (!bouton || !popover) { return; }
    bouton.addEventListener('click', function (evt) {
      evt.stopPropagation();
      var autrePopover = document.getElementById(autreIdPopover);
      if (autrePopover) { autrePopover.style.display = 'none'; }
      var afficher = popover.style.display !== 'block';
      popover.style.display = afficher ? 'block' : 'none';
      if (afficher) { positionnerPopoverSousBouton(bouton, popover); }
    });
    // TACHE (correction bug : clic sur "Voir la démonstration" sans effet
    // dans ce popover) : stopPropagation() ci-dessous empêchait TOUT clic
    // interne (y compris le bouton video) d'atteindre l'ecouteur global
    // data-demo-video, attache sur document (voir htmlDeclencheurDemoVideo/
    // ouvrirDemoVideo, js/app.js) -- ce bouton a besoin que son clic
    // remonte jusqu'a document pour fonctionner, exception faite ici.
    popover.addEventListener('click', function (evt) {
      if (evt.target.closest && evt.target.closest('[data-demo-video]')) { return; }
      evt.stopPropagation();
    });
  }
  basculerPopover('btnAideDocx', 'popoverAideDocx', 'popoverEditionDocx');
  basculerPopover('btnEditionDocx', 'popoverEditionDocx', 'popoverAideDocx');
  var btnFermerAide = document.getElementById('btnFermerAideDocx');
  if (btnFermerAide) { btnFermerAide.addEventListener('click', function (evt) { evt.stopPropagation(); document.getElementById('popoverAideDocx').style.display = 'none'; }); }
  var btnFermerEdition = document.getElementById('btnFermerEditionDocx');
  if (btnFermerEdition) { btnFermerEdition.addEventListener('click', function (evt) { evt.stopPropagation(); document.getElementById('popoverEditionDocx').style.display = 'none'; }); }
  document.addEventListener('click', function (evt) {
    ['popoverAideDocx', 'popoverEditionDocx'].forEach(function (id) {
      var popover = document.getElementById(id);
      if (popover && popover.style.display === 'block' && !popover.contains(evt.target)) { popover.style.display = 'none'; }
    });
  });
}

// ============================================================
// TACHE (refonte "Aperçu et finalisation" : palette de couleurs) :
// construit les 6 pastilles cliquables du panneau plein ecran. Simple
// rond de couleur (pas de vignette a regenerer), changement de couleur
// = juste un re-rendu du meme modele avec une couleur differente.
// ============================================================
var _baseCouleurOuvertePanneau = null;
function _construirePastillesPanneau() {
  var zone = document.getElementById('apercu-docx-pastilles');
  if (!zone || typeof obtenirPalettesCouleursCV !== 'function') { return; }
  var palettes = obtenirPalettesCouleursCV();
  // TACHE (retour utilisateur : "Nuances rapides", 10 nuances) : meme
  // mecanisme que le selecteur inline (construirePaletteCouleurs, app.js)
  // -- CV uniquement pour l'instant (obtenirNuancesCouleurCV).
  var avecNuances = (_typeApercuDocxActif === 'cv' && typeof obtenirNuancesCouleurCV === 'function');
  if (_baseCouleurOuvertePanneau === null && _couleurActifPanneau) {
    _baseCouleurOuvertePanneau = String(_couleurActifPanneau).split('-')[0];
  }

  function appliquerCouleurPanneau(couleurId) {
    if (couleurId === _couleurActifPanneau) { return; }
    _couleurActifPanneau = couleurId;
    if (typeof etatApercuInline !== 'undefined' && etatApercuInline[_typeApercuDocxActif]) {
      etatApercuInline[_typeApercuDocxActif].couleur = couleurId;
    }
    if (typeof rechargerApercuInline === 'function') { rechargerApercuInline(_typeApercuDocxActif, _modeleActifPanneau); }
    _rafraichirApercuDocx(_typeApercuDocxActif, _modeleActifPanneau, null, null, false, couleurId, _formatPageActifPanneau);
    _construirePastillesPanneau();
  }

  zone.innerHTML = palettes.map(function (p) {
    var estBaseActive = (_baseCouleurOuvertePanneau === p.id);
    var nuances = avecNuances ? obtenirNuancesCouleurCV(p.id) : [];
    var rangeeNuances = (avecNuances && estBaseActive)
      ? '<span class="rangee-nuances-apercu" style="display:inline-flex;gap:0.25rem;margin-left:0.4rem;vertical-align:middle;">' +
        nuances.map(function (n) {
          var actifNuance = (n.id === _couleurActifPanneau) || (_couleurActifPanneau === p.id && n.niveau === 10);
          return '<span class="pastille-nuance-apercu' + (actifNuance ? ' pastille-nuance-apercu-active' : '') + '" ' +
            'data-couleur="' + n.id + '" title="' + n.nom + '" style="background:#' + n.hex + ';"></span>';
        }).join('') + '</span>'
      : '';
    return '<span class="pastille-couleur-apercu' + (estBaseActive ? ' pastille-couleur-apercu-active' : '') + '" ' +
      'data-couleur-base="' + p.id + '" title="' + p.nom + '" style="background:#' + p.hex + ';"></span>' + rangeeNuances;
  }).join('');

  zone.querySelectorAll('[data-couleur-base]').forEach(function (rond) {
    rond.addEventListener('click', function () {
      var baseId = this.dataset.couleurBase;
      if (!avecNuances) { appliquerCouleurPanneau(baseId); return; }
      if (_baseCouleurOuvertePanneau === baseId) { _baseCouleurOuvertePanneau = null; _construirePastillesPanneau(); return; }
      _baseCouleurOuvertePanneau = baseId;
      if (!_couleurActifPanneau || String(_couleurActifPanneau).split('-')[0] !== baseId) {
        appliquerCouleurPanneau(baseId + '-10');
      } else {
        _construirePastillesPanneau();
      }
    });
  });
  zone.querySelectorAll('.pastille-nuance-apercu').forEach(function (pastille) {
    pastille.addEventListener('click', function (e) {
      e.stopPropagation();
      appliquerCouleurPanneau(this.dataset.couleur);
    });
  });
}


// TACHE (page Action, apercu inline reel) : zoneApercuOverride/
// zoneMessageOverride permettent de reutiliser EXACTEMENT ce moteur de
// rendu pour l'accordeon "Apercu et finalisation" de la page Action (voir
// chargerApercuCVInline/Lettre/Entretien dans app.js), sans dupliquer la
// logique de generation + docx-preview. Sans ces arguments, comportement
// inchange (panneau plein ecran de ce fichier).
// TACHE (retour utilisateur : apercu inline plus petit) : reduireEchelle
// (optionnel) redimensionne visuellement le rendu (transform scale) pour
// tenir entierement dans zoneApercuOverride, SANS jamais toucher au
// panneau plein ecran (parametre absent = comportement inchange).
// TACHE (refonte "Aperçu et finalisation" : palette de couleurs) :
// couleurId (optionnel, 6e argument) transmis tel quel a config.generer()
// -- absent/non reconnu = couleur d'origine du modele (comportement
// inchange pour tout appelant qui ne le fournit pas).
// TACHE (format A5) : formatPage (optionnel, 7e argument) transmis tel
// quel a config.generer() -- absent = 'A4' (comportement inchange).
// TACHE (retour utilisateur, bug reel confirme en testant : "je veux bien
// verifier cela" -- un CV avec 10 experiences x 10 missions detaillees,
// donc tres largement au-dela d'une page reelle, restait mesure a 1 seule
// page) : compter les enfants directs de ".apercu-docx-rendu-wrapper"
// (voir plus bas, miseAJourConstatDebordementProjetXXL) supposait que
// docx-preview (breakPages:true) cree un enfant DISTINCT par page
// REELLEMENT affichee -- FAUX en pratique : groupByPageBreaks()
// (docx-preview.js) ne scinde que sur un saut de page EXPLICITE deja
// present dans le XML (pageBreakBefore / <w:br type="page">), jamais par
// un calcul de hauteur reelle -- et composeurRender.js (Projet XXL)
// n'insere JAMAIS un tel saut explicite. Consequence : un CV Projet XXL,
// aussi dense soit-il, restait TOUJOURS mesure a 1 page, rendant inoperant
// le garde-fou "annule si ca deborde" de toute la cascade "Optimisation
// ultime" (activerMiseEnFormeUltimeXXL, js/app.js) -- jamais un probleme
// specifique a un seul levier, un seul point de mesure a corriger ici
// profite automatiquement a tous les leviers qui le lisent.
// Meme piege deja rencontre et corrige pour l'equilibrage colonnes
// (hauteurContenuReelle(), js/app.js:mesurerHauteursColonnesXXL) : chaque
// <section class="apercu-docx-rendu"> recoit un style.minHeight = taille
// de page (createPageElement(), docx-preview.js) -- mesurer la section
// elle-meme ne donnerait donc jamais moins qu'une page pleine, mais peut
// legitimement donner PLUS si le contenu deborde (c'est justement ce
// qu'on veut detecter ici). Mesure donc le DERNIER enfant du <article>
// interne (structure confirmee : createSectionContent(), docx-preview.js
// -- chaque section contient un unique <article>, lui-meme contenant le
// contenu reel) plutot que la section elle-meme.
function _dnEstimerNombrePagesReelXXL(enveloppe) {
  if (!enveloppe || !enveloppe.children || !enveloppe.children.length) { return enveloppe ? enveloppe.children.length : 1; }
  var nbEnfants = enveloppe.children.length;
  // Les sections AVANT la derniere (cas rare d'un saut de page explicite
  // deja present) sont par definition deja "pleines" -- jamais remesurees.
  var pagesPrecedentes = nbEnfants - 1;
  var derniereSection = enveloppe.children[nbEnfants - 1];
  var hauteurPagePx = parseFloat(getComputedStyle(derniereSection).minHeight);
  var article = derniereSection.querySelector('article');
  var enfantsArticle = article ? article.children : null;
  if (!hauteurPagePx || !enfantsArticle || !enfantsArticle.length) { return nbEnfants; } // repli : jamais pire qu'avant
  var dernierEnfant = enfantsArticle[enfantsArticle.length - 1];
  var hauteurContenuReel = dernierEnfant.getBoundingClientRect().bottom - derniereSection.getBoundingClientRect().top;
  // Tolerance de quelques px (meme esprit que le "+2" deja utilise cote
  // PDF, _pdfAjusterMiseEnPage) : un debordement de rendu insignifiant ne
  // doit jamais a lui seul faire basculer le constat sur une page de plus.
  var TOLERANCE_PX = 4;
  return pagesPrecedentes + Math.max(1, Math.ceil((hauteurContenuReel - TOLERANCE_PX) / hauteurPagePx));
}
function _rafraichirApercuDocx(type, modele, zoneApercuOverride, zoneMessageOverride, reduireEchelle, couleurId, formatPage) {
  var config = _configApercuDocx(type);
  var zoneMessage = zoneMessageOverride || document.getElementById('apercu-docx-message');
  var zoneApercu = zoneApercuOverride || document.getElementById('apercu-docx-zone');
  if (!zoneMessage || !zoneApercu) { return; }
  zoneMessage.textContent = 'Génération de l\'aperçu…';
  zoneApercu.innerHTML = '';

  // TACHE (bouton ultime "1 page, lisible") : cette fonction ne retournait
  // jamais sa chaine de promesses (fire-and-forget) -- aucun appelant
  // n'en avait besoin jusqu'ici. Le "return" ajoute ici permet a un futur
  // appelant d'attendre la fin REELLE du rendu (et donc de la mesure de
  // pages, deja effectuee plus bas via miseAJourConstatDebordementProjetXXL)
  // avant de decider s'il faut essayer un reglage plus agressif -- sans
  // rien changer pour les appelants existants, qui ignorent deja cette
  // valeur de retour (fire-and-forget reste un usage valide de ce return).
  return Promise.all([config.generer(modele, couleurId, formatPage), chargerLibrairieDocxPreview()])
    .then(function (resultats) {
      var blob = resultats[0];
      var docxPreview = resultats[1];
      zoneMessage.textContent = '';
      return docxPreview.renderAsync(blob, zoneApercu, undefined, {
        className: 'apercu-docx-rendu',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true
      });
    })
    .then(function () {
      // TACHE (Projet XXL, mecanisme A/B/C -- "C = un simple constat") :
      // mesure REELLE du nombre de pages rendues par docx-preview, jamais
      // une estimation cote code (impossible, voir composeurRegles.js
      // §4.3) -- docx-preview (inWrapper:true, breakPages:true) rend
      // chaque page comme un enfant DIRECT distinct de son enveloppe
      // ("{className}-wrapper", voir plus bas) : compter ces enfants donne
      // le nombre de pages reellement affichees, sans jamais avoir a
      // deviner un format ou une taille. Uniquement pour le CV (seul type
      // concerne par le mecanisme A/B/C, voir composeurComposition.js) --
      // sans effet pour lettre/entretien (miseAJourConstatDebordementProjetXXL
      // n'est jamais appelee pour ces 2 types).
      // TACHE (chantier Mini CV A5 -- migration du panneau riche
      // Composeur) : le Mini CV (A5) est desormais lui aussi genere par
      // le Composeur (modele local vaut 'portrait'/'paysage', jamais
      // 'composeur' pour ce format) -- elargi pour que le constat de
      // debordement (bouton "Mise en page", option A/B/AB) fonctionne
      // aussi pour l'A5, meme mecanisme de comptage de pages docx-preview.
      if (type === 'cv' && (modele === 'composeur' || modele === 'portrait' || modele === 'paysage') && typeof miseAJourConstatDebordementProjetXXL === 'function') {
        var enveloppePourComptage = zoneApercu.querySelector('.apercu-docx-rendu-wrapper');
        if (enveloppePourComptage && enveloppePourComptage.children && enveloppePourComptage.children.length > 0) {
          miseAJourConstatDebordementProjetXXL(_dnEstimerNombrePagesReelXXL(enveloppePourComptage));
        }
      }

      if (!reduireEchelle) { return; }
      // TACHE (correction bug : mauvais element mis a l'echelle) : docx-preview
      // nomme son enveloppe "{className}-wrapper" (ici "apercu-docx-rendu-wrapper",
      // cf. l'option className ci-dessus) -- PAS ".docx-wrapper" comme suppose
      // initialement. Ce mauvais selecteur retombait sur le premier enfant
      // (une balise <style> invisible), scalait un element sans taille
      // visuelle, pendant que le vrai contenu s'affichait en taille reelle et
      // debordait du petit conteneur (overflow:hidden) -- d'ou l'aperçu
      // montrant un morceau agrandi au lieu de la page entiere reduite.
      var enveloppe = zoneApercu.querySelector('.apercu-docx-rendu-wrapper');
      if (!enveloppe) { return; }
      // TACHE : attend une image (mesure exacte impossible avant peinture),
      // reduit uniquement (jamais d'agrandissement) pour que la page entiere
      // tienne dans la hauteur disponible -- la personne voit tout son
      // document d'un coup d'oeil, "Ouvrir le grand aperçu" pour le detail.
      requestAnimationFrame(function () {
        enveloppe.style.transformOrigin = 'top center';
        var hauteurReelle = enveloppe.scrollHeight;
        var hauteurDispo = zoneApercu.clientHeight;
        var echelle = hauteurReelle > 0 ? Math.min(1, hauteurDispo / hauteurReelle) : 1;
        enveloppe.style.transform = 'scale(' + echelle + ')';
      });
    })
    .catch(function (erreur) {
      zoneMessage.textContent = 'Impossible d\'afficher l\'aperçu pour le moment. Vous pouvez tout de même télécharger le fichier Word ci-dessus.';
      console.error('Erreur apercu docx-preview :', erreur);
    });
}
