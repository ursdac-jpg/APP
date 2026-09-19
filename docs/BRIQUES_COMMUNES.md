# Briques communes - registre des composants transverses

**Créé le 2026-08-30**, à la demande de Denis, pendant la consolidation du module « Analyser ma candidature ». Constat déclencheur : pour une seule donnée (le contexte de candidature), il existait **~5 implémentations séparées**, chacune avec sa propre version de la vérité - modifier l'une risquait de casser les autres. Objectif : que ça ne se reproduise plus, pour **tout** module (création comme refonte).

## Les 3 règles (à appliquer systématiquement)

1. **Avant de coder un écran / un champ / un composant, chercher s'il existe déjà.** `grep` le nom du champ (`dossier.xxx`), les fonctions candidates, les écrans qui ouvrent la même chose. S'il existe → **réutiliser**, jamais recopier.
2. **Un composant qui sert plusieurs contextes se paramètre (`config`), il ne se duplique pas.** Patron de référence : `htmlChoixAssistantBilanCorps(config)` + `wireChoixAssistantBilanEtapes()` (2026-08-30, bloc 2.2).
3. **Toute duplication qui subsiste est une dette listée ici**, résorbée une par une avec maquette + plan (jamais en fin de session, jamais « vite fait »). **Ce fichier se met à jour dans le même commit que le composant** - sinon il devient une « photo périmée » trompeuse (LECONS 9.23).

**À ouvrir avant tout nouveau module / toute refonte**, avec `LECONS_A_NE_PAS_REPRODUIRE.md`, `TACHES_VALIDEES.md`, `IDEES_A_RECLASSER.md`.

---

## A. Briques réellement uniques - à réutiliser telles quelles

| Brique | Source unique | Consommateurs connus |
|---|---|---|
| Fenêtre modale | `ouvrirFenetreERIP()` / `fermerFenetreERIP()` (`js/app.js`) - une seule à la fois, jamais d'empilement | tout le monde |
| Barre de navigation d'écran | `barreNavigation(precedent, suivant, opts...)` (`js/app.js`) - `onclickPrecedent` pour viser le bon écran précédent | tous les parcours |
| Confirmation | `confirmerAction(titre, texte, ...)` (`js/app.js`) | tout le monde |
| Échappement HTML | `echapperAttribut()` (`js/app.js`) | partout |
| Champs texte standardisés | `activerChampsStandardises(zone)` (`js/app.js`) - majuscule auto, Entrée → champ suivant | tous les formulaires |
| **Jetons de choix (case à cocher / radio)** | `htmlJetons(config)` (`js/app.js`) + CSS `.jeton` / `.jeton--radio` / `.jeton--compact` / `.is-actif` / `.jetons-ligne` (`css/style.css`) - coche/puce `::before`, halo focus, thème clair + sombre. `config` : `champ`, `options` (`[string]` ou `[{val,label}]`), `multiple`, `compact`, `lib`, `valeurs`, `avecTout`/`labelTout`, `extra`. Rendu seul : le câblage reste celui de l'écran (`data-champ`/`data-val` inchangés). | **parcours guidé, étape 6** : Objectif (contrat / temps de travail / j'accepte, via `contenuPastillesChamp` + `contenuAccepte`). Migration écran par écran : 6b « Vos informations », 6c « Assistant ». Voir dette B.6. |
| Liste des assistants | `ASSISTANTS_IA`, `ASSISTANTS_SANS_COMPTE_IA` (`js/app.js`) | page Action, Découverte, Bilan, Cohérence |
| Pastilles d'assistants | `lignePastillesAssistantsIA(liste, fond, bordure, texte, attrData, idActif?)` (`js/app.js`) | page Action, Découverte, Bilan |
| **Corps « Choisissez votre assistant »** | `htmlChoixAssistantBilanCorps(config)` + `wireChoixAssistantBilanEtapes(attrEtape, idDetail)` (`js/app.js`, bloc 2.2) - sans compte/compte + 4 étapes + confidentialité + vidéo. `config` : `idErreur`, `attrAssistant`, `etapes` (`[{titre, detail}]`), `texteConfidentialite` | Bilan (écran plein + modale du lot) ; Découverte ; Cohérence ; **Les mots de votre CV** (ATS, `etapes` propres au module `ATS_ETAPES_CHOIX_IA`) ; **Un regard sur mon CV** (`etapes` = `ETAPES_DETAIL_CHOIX_IA`) |
| Fenêtre « Avant de continuer vers [assistant] » | `ouvrirFenetreAssistantIA(config)` (`js/app.js`) | tous les parcours qui envoient vers un assistant |
| Bannière de transition (décompte / bloqué / ouvert) | `htmlBanniereTransitionIA()` (`js/app.js`) + globales `_etatTransitionIA` / `_intervalleDecompteIA` | page Action, Découverte, Bilan, Les mots de votre CV, **Un regard sur mon CV** |
| Collage de la réponse | `htmlCollageInstantane(suffixe, boutonsApercuHTML?)` + `activerCollageInstantane(config)` (`js/app.js`) - texte jamais visible en mode auto ; bouton **rectangulaire** « Coller la réponse » depuis `f52d81a` | Wizard CV, LettreV1, Entretien, page Action, Bilan, Découverte, Cohérence, Regard extérieur, Les mots de votre CV, **Un regard sur mon CV** |
| Vérification / masquage avant envoi | `htmlVerificationDocument()` / `cablerVerificationDocument()` + `modules/*/collecte/relectureConfidentialite.js` - surlignage tel/email/nom (mode texte) ou canvas + rectangles + `onEnregistre({mode:'image', blob})` (mode image) | Wizard CV/Lettre, Entretien, Bilan, Cohérence ; **Les mots de votre CV** (indirect, via `ouvrirAssistantDepotCV`) ; **Un regard sur mon CV** (écran « Masquer » : mode **texte** ET mode **image** — une image à la fois, depuis un `dataURL` gardé en état) |
| Dépôt d'un document (texte / PDF / Word / photo) | `ouvrirAssistantDepotCV(mode, options)` (`data/metiers.js`) - `options.onDocumentPrepare(res)` : sortie anticipée avec le texte finalisé (anonymisé), pas d'écran de relecture routé à recréer côté module | CV, Lettre, Entretien, Bilan, Cohérence, Les mots de votre CV, **Un regard sur mon CV** (Mode texte uniquement depuis le 2026-09-17 ; le Mode image garde son propre dépôt, dette ci-dessous) |
| Éditeur d'expériences (pro + perso) | `ouvrirFenetreExperiences()` / `ouvrirFenetreModifierExperienceUnique(i, liste)` (`js/app.js`) | Mon projet, Bilan, **Découvrir mes compétences** (étape « Vos expériences », chantier 2e passage IA du 2026-09-18 - appel direct à `construireContenuFenetreExperiences()`/`cablerFenetreExperiences()` avec des callbacks propres à l'étape, jamais `ouvrirFenetreExperiences()` elle-même dont le rerender par défaut est `pageResultats()`, incorrect tant que le parcours n'est pas terminé) |
| **Pipeline « rédaction IA du CV »** | `contenuRectangleChoixIA`/`wireRectangleChoixIA` + `contenuAccordeonImportIA`/`wireImportIA` + `ouvrirRelectureIACV`/`contenuRectangleRelectureIA`/`wireRectangleRelectureIA` + `analyserReponseIACV`/`creerBrouillonChoixIACV`/`appliquerBrouillonChoixIACV` (`js/app.js`) - construit une stratégie de candidature (accroche, missions reformulées, points forts...) à partir de `texteProfil('cv')`. `wireChoixAssistantIA`/`wireRectangleChoixIA` acceptent un `clePromptOverride` facultatif pour changer la clé de prompt sans dupliquer la fonction. Pontage obligatoire avant tout appel hors `pageResultats()` : `etatAccordeon`/`etatAccordeonValide` doivent pointer sur `accordeonPourType('cv')`/`accordeonValidePourType('cv')`, sinon échec silencieux (LECONS section 10). | `pageResultats()` (maj/pret), `pageAssistant()` (nouveau), **Découvrir mes compétences** (étapes 10 à 12, chantier 2e passage IA du 2026-09-18, `docs/CHANTIER_DECOUVERTE_2E_PASSAGE_REDACTION.md` - prompt `decouverteRedaction` via `clePromptOverride`, `_onValiderRelectureIACV` réécrasé pour terminer le parcours au lieu du comportement par défaut de `pageResultats`) |
| Civilité + nom du recruteur / couleur de l'entreprise | `contenuCiviliteRecruteurCandidature()` / `contenuCouleurEntrepriseCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature(rerender)` (`js/app.js`, extrait bloc 2.1 réduit) - écrit dans `dossier.rechercheCandidature` | Mon projet, Bilan, Découverte |
| Ciblage offre / entreprise / type de structure | `bilanCorpsCiblageOffreHTML()` + `bilanCablerCiblageOffre(racine, onChange?)` + `bilanLireCiblageOffre(racine)` (`data/metiers.js`, bloc 3.3) - champs entreprise/site/offre (URL → 2e champ)/type de structure (`BILAN_TYPES_STRUCTURE`, « Autre » → champ libre) ; `bilanLireCiblageOffre` renvoie le `saisieLibre` attendu par `bilanDeposerCandidature()` | Bilan (bloc 4 de `htmlBilanPreparer()`) - la modale `bilanOuvrirCiblageOffreEmploi()` a été retirée ; Cohérence ; Découverte ; **Les mots de votre CV** (bloc 2 de « Préparer », mode référence = offre) ; **Un regard sur mon CV** (bloc 3 de « Préparer » ; valeurs ré-injectées dans les champs au rendu, car `bilanCorpsCiblageOffreHTML()` pré-remplit depuis `dossier`, pas depuis l'état du module) |
| Bouton « Garder comme Repère » | `reperesBoutonAncre(opts)` / `reperesBrancherBoutonAncre()` | Bilan (chaque axe + chaque reco), Cohérence, Regard extérieur, Les mots de votre CV (écran « Ma fiche »), **Un regard sur mon CV** (chaque axe du rapport + chaque point de la fiche) |
| Résolution observations d'un diagnostic Bilan | `bilanResoudreObservations(diagnostic, ids)` (`modules/bilan-candidature/amelioration/selectionAmeliorationManager.js`) | Bilan Carte 1 (bloc 1.3) + Carte 3 |
| Sauvegarde d'un module isolé (disquette) | patron `xxxExporterEtatPourSauvegarde()` / `xxxRestaurerEtatDepuisSauvegarde(etat)` enregistré dans `collecterEtatsModulesPourSauvegarde()` / `restaurerEtatsModules()` (`js/app.js`) - voir LECONS 7ter | Bilan, Cohérence, Regard extérieur, Comparer mes pistes, Les mots de votre CV, **Un regard sur mon CV** |
| Détour / reprise famille 2 | `htmlBandeRepriseModule(bouton, encart)` + `htmlEncartRepriseModule({idContinuer, idRecommencer, pulse})` + `appliquerGelModule(bool)` + `armerFinPulseEncartReprise()` + `noteRevoirModuleDejaVue()` (`js/app.js`) - bouton « Revoir la présentation », encart « Continuer / Recommencer », gel jusqu'au choix, pulse ~10 s | Bilan, Cohérence, Découverte, Comparer mes pistes, Les mots de votre CV, **Un regard sur mon CV**. Piège documenté (LECONS section 2) : « Retour » et « Revoir la présentation » ne partagent JAMAIS la même fonction, sinon boucle infinie présentation ⟷ module. |
| Déclencheur de vidéo de démonstration | `htmlDeclencheurDemoVideo(idGeste)` (`js/app.js`) - indexé par geste, jamais par parcours | tous |
| Territoire / département | `demanderDepartementSiInconnu(cb)` (`js/app.js`) + `localStorage` `CLE_DEPARTEMENT_RESSOURCES` | Ressources, tout contenu dépendant du département |
| Recherche accueil + Lexique | `rechercherBaseConnaissances()` (`data/baseConnaissancesERIP.js`) + `_lexiqueRechercher()` (`modules/lexique/`) - une catégorie = une fonction courte, branchée à la création du contenu | tout contenu trouvable |
| Répertoire freins -> ressources | `FREINS_REPERTOIRE` (`data/freins.js`, 17 codes fermés) + `regardExterieurRenduFicheFrein(code, opts)` - l'assistant classe le frein, le code garantit les ressources (URL jamais générées par l'assistant, LECONS 9.13/9.16) | Regard extérieur / Repères ; **Comparer mes pistes** (étiquette `frein_ou_etape` -> condition sur une piste, 2026-08-31) ; barre de recherche |
| **Réglages de mise en page du CV : modèle canonique + traducteurs** | `modules/cv-mise-en-page/reglagesMiseEnPage.js` (`REGLAGES_MISE_EN_PAGE_CHAMPS` = schéma déclaratif 63 champs, `reglagesMiseEnPageParDefaut()`, `reglageMiseEnPageValide()`, `fusionnerReglagesMiseEnPage()`) + `reglagesTraducteurs.js` (`traduireVersRegPdf` / `lireDepuisRegPdf`, `traduireVersEtatWord` / `lireDepuisReglagesProjetXXL` - fonctions pures, testées Node). État vivant : `dossier.reglagesMiseEnPageCV`. L'UI 3 niveaux + le grand aperçu vivent dans `js/app.js` (`construireMiseEnPageCV`, `_wireCarteSimpleMiseEnPage`, `ouvrirGrandApercuPdf`) et **branchent** ces fonctions. | Rectangle « La mise en page » du CV (`pageResultats`). Lettre / entretien restent sur `construireContenuApercuFinalisation`. Voir dette **B.7**. |

---

## Stratégie de migration - résorption de la dette AU FIL DE L'EAU (décision Denis 2026-08-30)

On ne fait **jamais un « big bang »** de migration (remplacer toutes les copies d'un coup = massif et risqué, exactement ce qu'on veut éviter). À la place :

1. **La brique canonique a un nom** (le nom de sa fonction : `htmlPanneauCandidature`, `htmlChoixAssistantBilanCorps`…). C'est **la** version de référence, complète, paramétrable.
2. **Chaque copie (section B) est étiquetée** dans le code, en commentaire, à sa déclaration : `// DETTE (BRIQUES_COMMUNES B.x) : copie de <brique canonique>. A remplacer par elle au prochain passage sur ce module.`
3. **À chaque création ou refonte d'un module**, dans les « 4 fichiers à ouvrir » : on regarde ici quelles copies ce module utilise, et **on les remplace par la brique canonique dans le même passage** - jamais « je verrai plus tard ».
4. Quand la **dernière** copie d'une dette B.x a été remplacée : on ne la supprime **pas** tout de suite. On la **désactive** :
   - retirer **tout point d'entrée** (bouton, route, appel) - la fonction devient inatteignable par le chemin normal ;
   - poser en tête de la fonction un **commentaire-cadenas standard** (même patron que LECONS 9.23) :
     ```
     // ORPHELIN DE L'INTERFACE, LAISSE INTACT VOLONTAIREMENT -- PAS UN OUBLI.
     // Version design alternative de <brique canonique>. Aucun chemin n'y mene.
     // Ne JAMAIS la recabler ni melanger ses elements avec <brique canonique>
     // sans accord explicite de Denis. Verifie par recherche exhaustive le <date>.
     ```
   - l'entrée B.x passe en « désactivée » (puis « résorbée » / Historique quand on décide vraiment de supprimer).
5. **Règle de lecture** : en survol du code (pas en analyse approfondie), si on tombe sur une fonction portant ce cadenas, on **ne la touche pas** et on **ne mélange pas** ses éléments avec la brique canonique. C'est **déjà arrivé** (ex. « choix d'assistant » : une version simple + une version avec explications ont coexisté et se sont mélangées) - à éviter systématiquement.

**Pourquoi désactiver plutôt que supprimer** : certaines de ces versions « design alternatif » reviendront **volontairement** plus tard. Cas connu : le **chantier Accessibilité** aura **2 modèles** - le modèle actuel (complet, avec explications, celui que Denis garde par défaut) et un modèle « fenêtres plus simples » pour un public plus préparé, via une **bascule globale**. D'ici là, **une seule version accessible** par fonction ; toute 2ᵉ version en design pour la même fonction, sans accord de Denis, est un défaut à corriger.

Concrètement : la brique canonique est construite **une fois** (avec maquette si elle est nouvelle), puis elle « avale » ses copies progressivement, module par module, au rythme où on retouche les modules pour d'autres raisons. Zéro passage dédié « migration ».

## B. Dette - duplications connues, à résorber AU FIL DE L'EAU (jamais à chaud, jamais un big bang)

### B.1 - Contexte de candidature : ~5 collecteurs séparés — **RÉSORBÉE 2026-09-04**

Tous écrivent (en partie) `dossier.rechercheCandidature`, mais avec des champs, des libellés et des chemins d'écriture différents. `#1` pilote aussi `dossier.modeRecherche` / `metierCible` qui alimentent **Mon projet → Potentiel → génération CV**.

| # | Fonction | Où | Champs collectés |
|---|---|---|---|
| 1 | `contenuModeRecherche(depuisBilan)` + `wireModeRecherche` | Mon projet, Bilan | **Cœur déjà résorbé** (source unique, paramétrée par `depuisBilan`, rien à dupliquer). **Reliquat interne RÉSORBÉ 2026-09-04** : `contenuCoordonneesEntrepriseBilanInline()` (bloc entreprise/offre en ligne, fenêtre Candidature du Bilan) appelle désormais `bilanCorpsCiblageOffreHTML()` + `bilanCablerCiblageOffre()` + `bilanLireCiblageOffre()` au lieu de ses propres champs (`candBilanEntrepriseNom/Site/Offre`) - gagne le type de structure (absent avant) + la détection de lien. **Bug trouvé et corrigé au passage dans la brique elle-même** : `bilanCablerCiblageOffre()` n'incluait pas le champ libre `#ciblageTypeStructureAutre` dans ses écouteurs `onChange` - invisible pour les 2 autres consommateurs (bloc 4 « Préparer », Cohérence), qui ne passent pas d'`onChange` et relisent tout au clic final, mais bloquant pour ce nouveau consommateur en écriture immédiate. Vérifié navigateur : mode métier ET domaine, écriture des 4+2 champs, « Autre » → texte libre, civilité/couleur, clair + sombre, 0 erreur console. `npm test` 713 verts. **Dette B.1 : les 5 collecteurs sont maintenant résorbés** (le tableau ci-dessous reste comme historique). |
| ~~2~~ | ~~`ouvrirFormulaireCoordonneesEntreprise`~~ | ~~parcours recherche d'accueil~~ | **RÉSORBÉ 2026-09-04** : civilité/nom recruteur + couleur d'entreprise appellent `contenuCiviliteRecruteurCandidature()` / `contenuCouleurEntrepriseCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature(rerender)`, avec re-rendu de la zone dédiée (`#coordZoneCiviliteCouleur`) à chaque interaction. **Changement de comportement assumé (décision Denis 2026-09-04)** : le formulaire entier (entreprise/site/offre compris, ou structure/lien en immersion) passe de « rien n'est écrit avant Valider » à **écriture immédiate**, comme les 3 autres consommateurs de la brique - jamais de saisie perdue si la personne quitte sans valider. Vérifié navigateur : offre + immersion, écriture des 6 champs, bouton Retour, clair + sombre, 0 erreur console. `npm test` 713 verts. |
| ~~3~~ | ~~`bilanOuvrirCiblageOffreEmploi`~~ | ~~Bilan, avant le diagnostic~~ | **DÉJÀ RÉSORBÉ le 2026-08-30** (avant même la création de ce tableau) : la modale a été retirée, ses champs vivent dans `bilanCorpsCiblageOffreHTML()` (bloc 4 de `htmlBilanPreparer()`), déjà table A. Cette ligne était restée périmée jusqu'au 2026-09-04 - corrigée ici sans rien coder. |
| ~~4~~ | ~~`ctOuvrirCollecteComplement`~~ | ~~Cohérence~~ | **RÉSORBÉ 2026-09-04** : offre/entreprise/site/type de structure appellent désormais `bilanCorpsCiblageOffreHTML()` + `bilanCablerCiblageOffre()` + `bilanLireCiblageOffre()` (mêmes fonctions que le bloc 4 du Bilan), au lieu de sa propre copie. Gain au passage (déjà présent côté Bilan, absent avant côté Cohérence) : détection d'URL dans le champ offre (2ᵉ champ pour coller le contenu) + champ libre quand « Autre » est choisi comme type de structure. `questionsPersonne` (propre à Cohérence, hors périmètre de la brique) inchangé. Vérifié navigateur : écriture des 4 champs, priorité contenu collé > lien brut, « Autre » → texte libre, clair + sombre (fond blanc `.form-control` déjà documenté comme problème app-wide pré-existant, pas une régression), 0 erreur console. `npm test` 713 verts. |
| ~~5~~ | ~~`blocRechercheCandidature`~~ | ~~Découvrir mes compétences~~ | **RÉSORBÉ 2026-09-04** : civilité/nom recruteur + couleur d'entreprise appellent désormais directement `contenuCiviliteRecruteurCandidature()` / `contenuCouleurEntrepriseCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature(rerender)` (mêmes fonctions que Mon projet/Bilan). Seuls entreprise/site/lienOffre restent propres à Découverte (hors périmètre de cette brique). Vérifié navigateur (écriture des 6 champs, clair + sombre, 0 erreur console), `npm test` 713 verts. |

**Cible atteinte le 2026-09-04** : civilité/nom recruteur/couleur d'entreprise (`contenuCiviliteRecruteurCandidature()`/`contenuCouleurEntrepriseCandidature()`) et entreprise/site/offre/type de structure (`bilanCorpsCiblageOffreHTML()`) sont chacun une source unique, écrivant toujours dans `dossier.rechercheCandidature`, réutilisée par les 5 modules (Mon projet, Bilan - 2 écrans -, Découverte, recherche d'accueil, Cohérence). Pas de fusion en une seule fonction `htmlPanneauCandidature(config)` unique (chaque module garde son propre habillage/mode de recherche autour), mais plus aucune copie des champs eux-mêmes.

**2026-09-17, 6ᵉ consommateur** : « Co-construire ma lettre » (bloc « Votre candidature », `_coLettreRendreDepot()`) remplace son ancien bloc « L'entreprise et le poste » (champ texte libre + `bilanCorpsCiblageOffreHTML()` seul) par `OBJECTIF_CHOIX_CANDIDATURE` (cartes de type de candidature) + `contenuModeRecherche()`/`contenuCandidature()` - mêmes fonctions que « Votre objectif » (`pageObjectif()`), seul le rerender change. Bug trouvé et corrigé au test navigateur : ce mécanisme inclut déjà sa propre question civilité/nom du recruteur - l'ancien bloc `contenuCiviliteRecruteurCandidature()` séparé qui vivait à côté faisait doublon (« Connaissez-vous la personne... » posée deux fois), retiré.

**Attention : ne pas confondre avec l'autre volet de B.1, toujours ouvert - la fenêtre d'import CV.** Le non-négociable du CLAUDE.md du projet reste en vigueur : « Refonte d'une carte / d'un module qui importe un CV : au passage, remplacer sa fenêtre d'import CV par le composant partagé construit pour le Bilan le 2026-08-30 ». **Signalé par Denis le 2026-09-04, pas encore fait** : les cartes **« Préparer un entretien »**, **« Coécrire ma lettre de motivation »** et **« Cohérence de mon dossier »** (`ctObtenirOuDeposerTexteLettre` / `ctObtenirOuDeposerTexteEntretien`, `modules/coherence-transversale/ui.js`, qui appellent toutes deux `ouvrirAssistantDepotCV()`) ont encore leur propre **fenêtre séparée** pour déposer le CV/la lettre/l'entretien, au lieu de la **page dépliante** partagée (même patron que « Mes documents », `obtenirOuDeposerTexteCV()` intégré à une vraie page, pas une modale). À traiter **une carte à la fois**, jamais deux en même temps (méthode « chantier par chantier » déjà actée) - demande une maquette avant code (interface, pas juste une extraction de fonction comme B.5).

**Précision de Denis (2026-09-04, après B.5)** : Cohérence cumule **2 fenêtres modales d'affilée** avant d'arriver au travail réel - pas seulement le dépôt du CV. Après (ou en plus de) la fenêtre de dépôt CV/lettre/entretien (`ouvrirAssistantDepotCV`), le module ouvre aussi `ctOuvrirCollecteComplement()` (`modules/coherence-transversale/ui.js`) - la fenêtre offre/entreprise/type de structure (contenu déjà unifié avec le Bilan via la dette B.1 ci-dessus, mais **reste sa propre fenêtre séparée**, pas encore une page). Denis : « ça fait deux fenêtres d'affilée, ce qui est très lourd pour l'utilisateur ». **Objectif posé par Denis** : intégrer **toute la collecte** (CV/lettre/entretien ET offre/entreprise) **dans la page du module elle-même** - une seule page, pas une chaîne de fenêtres modales.

**Demande élargie par Denis (2026-09-04)** : « fais-moi un audit complet de tous ces modules qui ont encore la fenêtre pour saisir des documents » - portée étendue à TOUTE l'application, pas seulement Cohérence. **Audit fait le même jour, plan de chantier complet** : `docs/CHANTIER_ELIMINATION_FENETRES_DEPOT_CV.md`. Résumé :
- **Pattern A (déjà bon, la cible)** : Mes documents (Préparer ma lettre et mon entretien, Mettre à jour mon CV, Créer un nouveau CV) et Analyser ma candidature (Bilan) - dépôt inline via `obtenirOuDeposerTexteCV()`, popup uniquement en repli technique (photo/scan), toujours ponctuelle.
- **Pattern B (à corriger), par ordre de complexité croissante** : Co-construire ma lettre de motivation (**4 fenêtres** : CV → choix assistant → tampon redirection → récupération réponse), Cohérence de mon dossier (**4 fenêtres** : CV → lettre → entretien facultatif → offre/entreprise), Préparer un entretien (**5 fenêtres**, ET un mécanisme de dépôt CV entièrement différent des 2 autres - `ouvrirDepotEntretien`, pas `ouvrirAssistantDepotCV`/`obtenirOuDeposerTexteCV` - à remplacer, pas seulement réhabiller).
- **Sans dépôt de CV** (vérifiés, hors périmètre) : Découverte, Comparer mes pistes, Regard extérieur, Carnet, Lexique, Repères, Comprendre le cadre.
- **Pas encore construits à cette date (2026-09-04)** : ATS et Un regard sur mon CV (pages d'intro seules, CTA désactivé) - à concevoir directement en Pattern A le jour de leur construction. **Fait depuis** : les deux sont construits et clos (ATS le 2026-09-08, Un regard sur mon CV le 2026-09-08), tous deux en Pattern A dès le départ, confirmé par l'audit de stabilisation du 2026-09-13.
- Plan recommandé : extraire un composant partagé modelé sur la page « Préparer » dépliante déjà existante, migrer les 3 modules Pattern B un à la fois dans l'ordre ci-dessus (le plus simple d'abord, le mécanisme différent de « Préparer un entretien » en dernier). Détail complet, alternative écartée et raisons : voir le fichier de chantier.

**Étape 1 FAITE le 2026-09-04 (Co-construire ma lettre de motivation)** : Denis a validé le plan et donné autonomie complète. Cascade de 4 fenêtres remplacée par 3 vraies pages routées (dépôt du CV, choix de l'assistant via `htmlChoixAssistantBilanCorps()`, coller la réponse) - même patron que Cohérence transversale. `ouvrirFenetreAssistantIA()` (confirmation brève avant redirection) non touchée : ce n'est pas une fenêtre de saisie de document. Détail complet, bug de mode sombre corrigé au passage, vérifications : voir le fichier de chantier.

**Étape 2 FAITE le 2026-09-04 (Cohérence de mon dossier)** : `ctDemarrerCollecte()`/`ctOuvrirCollecteComplement()` (cascade de 4 fenêtres) remplacées par une page à 4 blocs dépliants (`ctHtmlCollecte()`), même langage visuel `.bilan-preparer`. Les fonctions de dépôt par document (`obtenirOuDeposerTexteCV`/`ctObtenirOuDeposerTexteLettre`/`ctObtenirOuDeposerTexteEntretien`) et la soumission finale (`ctDeposerDossier`) restent inchangées. Bascule naturellement sur `ctHtmlEtapeChoixIA()`, déjà page-based (dette B.2). Détail complet et vérifications : voir le fichier de chantier.

**Étape 3 FAITE le 2026-09-04 (Préparer un entretien) — la plus complexe des 3, chantier terminé.** Cascade de 5 fenêtres (`ouvrirDepotEntretien` → `ouvrirVerificationEntretien` → `verifierOuDemanderEntrepriseEtPoste` → `ouvrirChoixIAEntretien` → `ouvrirRecuperationEntretien`) remplacée par 5 pages routées. Seul module des 3 à avoir un mécanisme de dépôt différent (`input[type=file]` + `analyserDocumentDepose()`) - laissé inchangé, seul le conteneur change. Choix de l'assistant modernisé sur `htmlChoixAssistantBilanCorps()` (dette B.2). 2 bugs de mode sombre corrigés au passage (`#EFF6FF`, `stylePastilleInline()` jamais theme-aware sur cet écran). Point de vigilance retrouvé et corrigé : l'écriture de `dossier.cvTexte`/`dossier.lettreMotivation` (alimentait le prompt de l'étape assistant) vivait dans une closure de l'ancien code, ré-attachée au bon endroit dans la nouvelle page. `ouvrirParcoursEntretien()` conservé comme raccourci externe (utilisé aussi par « Candidater depuis la recherche »). Détail complet et vérifications : voir le fichier de chantier.

**Dette B.1 (volet fenêtre d'import CV) et le chantier d'élimination des fenêtres de dépôt CV sont désormais entièrement résorbés pour les 3 modules identifiés.** Seules fenêtres restantes dans ces 3 modules : la confirmation brève avant redirection vers l'assistant (`ouvrirFenetreAssistantIA()`) et le repli photo/scan de `ouvrirAssistantDepotCV()` - deux mécanismes déjà partagés et acceptés partout ailleurs dans l'app, hors périmètre de la demande de Denis.

**Méthode de résorption utilisée - DÉCISION DENIS 2026-08-30, confirmée 2026-09-04 : chantier par chantier (4 sessions le même jour), jamais un big bang.** Chaque collecteur a été migré, testé isolément en navigateur, commité séparément - jamais un seul commit pour les 5.

### B.2 - Écran « Choisissez votre assistant » : 3+ implémentations non fusionnées — **RÉSORBÉE 2026-09-04**

`htmlChoixAssistantBilanCorps` (bloc 2.2) est la référence, modernisée le 2026-08-30 (voir ci-dessous). **Corrigé le 2026-09-04** : cette ligne attribuait par erreur `etapeChoixAssistant` à « la page Action » - c'est en réalité la fonction de **Découverte** (`decouverteParcours.js`).

**Modernisé le 2026-08-30 (Bilan)** : M1 `7293b80` (hex → jetons `var(--…)`, mode sombre réparé), M2 `8d9f3e0` (étiquettes empilées, bloc teinté `.bilan-choix-ia`, sous-étiquette « sans compte » / « connexion » sur chaque pastille via le nouveau param `sousLabel` de `lignePastillesAssistantsIA`, les 4 temps dans un `<details class="bloc-depli">` visibles d'un coup → fin du clic-pour-révéler, `wireChoixAssistantBilanEtapes` devient un no-op, `role="alert"`). Sert les 2 écrans du Bilan (plein écran + modale de lot). Maquette : `data-vue="choix-assistant"` (`ac3bf3c` + `de7197e`).

- ~~Découverte (`etapeChoixAssistant`)~~ **DÉJÀ FAIT le 2026-08-31** (retour Denis, point 4) : appelle directement `htmlChoixAssistantBilanCorps()`. Cette ligne du tableau disait encore « non partagé » - périmée, corrigée le 2026-09-04 (re-vérifié dans le code).
- ~~Cohérence (`ctHtmlEtapeChoixIA` + `ctHtmlEtapeChoixIAEntretienAvance`)~~ **RÉSORBÉ 2026-09-04** : les 2 écrans (1ᵉʳ prompt + entretien avancé) migrés vers `htmlChoixAssistantBilanCorps()`, au lieu de 2 copies quasi identiques en couleurs figées (`#DCFCE7`, `#0d6efd`, `#374151`...) - vrai bug de mode sombre corrigé au passage. L'ancien câblage de clic-pour-révéler des étapes (`[data-etape-choixia-coherence]` / `[data-etape-choixia-entretien-avance]`), devenu mort, retiré des deux fonctions de câblage. La note vocale spécifique à l'entretien avancé (micro, conversation continue) conservée après le composant partagé. Vérifié navigateur : les 2 écrans, jetons + accordéon + sous-étiquettes, clic assistant, clair + sombre, 0 erreur console. `npm test` 713 verts.
- ~~Page Assistant (`contenuRectangleChoixIA`)~~ **RÉSORBÉ 2026-09-04**, dernier des 3. Le bouton « Voir ou modifier le texte transmis à l'assistant » n'a finalement pas eu besoin d'arbitrage : c'est une fonctionnalité **légitimement propre à ce parcours** (lui seul compose le texte transmis à partir de champs structurés - `dossier.profilTexteManuel`/`texteProfil()` -, jamais un texte déjà déposé tel quel comme les 3 autres modules), donc **ajoutée après** le composant partagé plutôt qu'arbitrée/absorbée dedans - zéro perte, zéro fusion forcée d'une chose qui n'est pas comparable. Ancien câblage `wireEtapesDetailChoixIA()` devenu mort supprimé (plus aucun appelant). Vérifié navigateur : jetons + accordéon, bouton « voir/modifier le texte » (badge « version personnalisée » compris), clair + sombre, 0 erreur console. `npm test` 713 verts.

**B.2 entièrement résorbée** : les 3 modules (Bilan, Découverte, Cohérence, page Assistant - 4 en comptant Bilan) partagent maintenant `htmlChoixAssistantBilanCorps()`. Seul `lignePastillesAssistantsIA()` était déjà commun avant ce jour ; c'est maintenant l'écran entier.

### B.3 - Éditeur de rubriques CV : `blocERIP` (Mon projet) vs `blocEditionCV` (Bilan) — **RÉSORBÉE 2026-09-03**

Historique : 2 implémentations, contenu de sous-sections déjà partagé (mêmes `CONFIG_BLOC_TITRE_ACCROCHE` / `_VOUS` / `_PARCOURS` / `_COMPLEMENTS` / `_COMPETENCES_CV`), seul le **chrome** différait. Décision Denis 2026-08-25 (D7) : garder 2 impls. **Réévaluée et fusionnée le 2026-09-03** (après que 6conv-2 a rendu la branche accordéon de `blocEditionCV` caduque via `sousSectionsPlates`) : `blocEditionCV` / `wireBlocEditionCV` **retirés** (−231 lignes), « Modifier mon CV » (`bilanOuvrirEditionCV`) tourne sur `blocERIP` / `wireBlocERIP`.
- **B.3-1** (`3c55190`) : hooks `s.apercu` (pastilles « récupéré du CV » + ✕) et `s.revenir` (« Revenir aux informations initiales ») ajoutés à la branche à plat de `blocERIP` + `wireBlocERIP`, **strictement additifs**.
- **B.3-2 + B.3-3** (`4715e0b`) : drapeau `_blocEditionCvBilanEnCours` (rendu) — en-tête de bloc fermé « Cliquez ici… » + « Des éléments ont été récupérés depuis votre CV » ; en-tête ouvert sans compteur/badge ; résumé de bloc supprimé. `wireBlocERIP(config, rerender, opts)` — `opts.editionCvBilan` fait vivre l'ouverture des blocs dans `_editionCvBlocsOuverts` (var DÉDIÉE) : **aucune pollution** de `etatBlocsERIPOuverts` / `etatBlocERIPOuvert` (partagés avec Objectif / Vos informations / Votre profil), aucune restauration à gérer.
- **B.3-4** : vérifié navigateur (5 blocs, à plat, jetons, catalogues inline, aperçu + « Revenir » avec confirmation qui reverte + rouvre la fenêtre, état partagé propre avant/pendant/après, clair + sombre + mobile 375). `npm test` 646 verts.

### B.4 - Barre d'étapes visuelle : une fonction de rendu par module — **RÉSORBÉE 2026-09-04**

`.pastille-etape-action*` / `.chevron-etape-action` (CSS) sont partagées. Référence de style retenue : la barre du Bilan (vert = fait, halo bleu = courant, chevron courant→suivant clignote).

- ~~`bilanBarreEtapes()` (Bilan)~~ **RÉSORBÉ 2026-09-04** : ne garde plus que le calcul Bilan-spécifique de l'index courant (`bilanIndexEtapeCourante`), délègue tout le rendu à `barreEtapesModule()` (js/app.js) - qui avait justement été construite le 2026-08-31 en copiant EXACTEMENT ce rendu, jamais réutilisée depuis par sa propre source.
- ~~`ctHtmlBarreEtapes()` (Cohérence)~~ **RÉSORBÉ 2026-09-04** : même traitement, délègue à `barreEtapesModule()`. Gagne au passage la classe dédiée `.barre-etapes-bilan` (proportions de la maquette validée) à la place d'un simple flex sans classe - harmonisation voulue, pas un effet de bord. La bande « Revoir la présentation » (`ctHtmlBandeReprise()`) reste ajoutée après, inchangée. Vérifié navigateur : les 2 barres, états fait/courant/à venir, intégration réelle dans `pageCoherenceTransversale()`, clair + sombre, 0 erreur console. `npm test` 713 verts.
- **La barre de la page Action (`pastilleEtapeAction`/`ligneEtapesAction`, `js/app.js` ~15877) N'EST PAS une 3ᵉ copie du même rendu - découvert le 2026-09-04, en creusant avant de fusionner.** Différence de fond : ses pastilles sont de **vrais boutons cliquables reliés à un accordéon** (`data-accordeon`, état `etatAccordeon`/`etatAccordeonValide`, triangle `▼` quand le panneau est ouvert) - pas un simple repère de progression en lecture seule comme les 2 autres. Un commentaire déjà présent (2026-08-30) confirme une taille de pastille volontairement différente et conservée (« plus petites que celles de la page Action, qui gardent leur taille »). **Décision Denis 2026-09-04 : exception permanente, ne pas fusionner.** Comme pour le bouton « texte transmis » de B.2 : ce n'est pas une copie paresseuse à supprimer, c'est un mécanisme réellement différent (navigation par accordéon) qui ne correspond pas à ce que fait `barreEtapesModule()` (repère en lecture seule) - étendre la fonction partagée pour l'accordéon exposerait Bilan/Cohérence/Découverte à un risque de régression pour un gain qui ne les concerne pas. Zéro code à toucher.

### B.5 - Page d'introduction : un patron copié, pas une fonction partagée — **RÉSORBÉE 2026-09-04**

`ctHtmlExplication()` (Cohérence) était le patron ; `htmlBilanIntro()` (Bilan, bloc 1.2) et Repères le reprenaient en le recopiant.

**Fait le 2026-09-04 (Cohérence)** : `htmlPageIntroModule(config)` (`js/app.js`) extraite - sections en tableau ordonné (`config.sections[]`, chacune `{fond, centre, corpsHTML}`), pas de slots nommés fixes, pour que chaque module garde son propre ordre (Cohérence a une section « Ce qu'on va vous demander » que Bilan n'a pas, à un endroit qui lui est propre). `ctHtmlExplication()` migrée dessus - texte et logique du bouton du bas (3 conditions `detour || dossier || diagnostic`, pas juste `detour`) préservés à l'identique, vérifié par capture avant/après.

**Fait le 2026-09-04 (Bilan, même jour, 2e passage - « Vas-y, commence par Bilan »)** : `htmlBilanIntro()` migrée à son tour sur `htmlPageIntroModule(config)`. Section « Quelle que soit la forme de votre CV » (propre à Bilan, absente chez Cohérence) placée à son propre endroit dans `config.sections[]`, comme prévu par le design de la brique. Texte intégral, `classeExtra: 'bilan-intro'`, bouton du haut en detour (`htmlBoutonRevoirModule`), logique du bouton du bas (« Analyser mon CV » / « Revenir au module ») et `boutonBasClasse` (`text-center mt-3 mb-2`, différent de celui de Cohérence) préservés à l'identique - **vérifié par capture octet près** de `htmlBilanIntro()` avant/après refonte, pour `_etatBilan.voirIntro` `false` ET `true` (diff Unix `diff` : 0 différence dans les 2 cas). Vérifié aussi navigateur : rendu direct + via `demarrerBilanCandidature()` (page réellement routée), clair + sombre, 0 erreur console. `npm test` 713 verts.

**B.5 entièrement résorbée** : Cohérence et Bilan partagent maintenant `htmlPageIntroModule()`. Repères (mentionné à l'origine comme 3e recopie potentielle) n'a pas été vérifié dans ce chantier - à consulter si un jour retouché.

**Décision Denis 2026-09-04, appliquée dans la même passe** : la **barre d'étapes visuelle ne s'affiche plus sur aucune page d'introduction de module** - elle n'a de sens que sur un écran de travail, une page d'intro est déjà assez chargée d'informations. `htmlPageIntroModule(config)` n'a **pas** de slot `barreEtapesHTML` (règle structurelle, pas un défaut qu'un futur appelant pourrait rétablir par erreur). Même règle appliquée à `htmlPageIntroModuleParcours()` (`data/metiers.js`, 8 pages routées : Co-construire ma lettre, Préparer un entretien, Découverte-intro, ATS, Regard recruteur, Se tenir informé, Comparer mes pistes/Aide à la décision...) qui l'affichait « en sourdine » depuis le 2026-08-31 - décision inversée ce jour. Sur `ctHtmlExplication()`, la barre disparaît mais la **bande de reprise** (`ctHtmlBandeReprise()` - bouton « Revenir au module » / « Revoir la présentation » + encart « Continuer / Recommencer ») reste affichée, ce n'est pas la même chose. Vérifié navigateur : Cohérence (function directe + page routée `coherence`) et Co-construire ma lettre (`co-lettre`), clair + sombre, 0 erreur console. `npm test` 713 verts.

**Point de bascule atteint (2026-08-30)** : des **maquettes HTML** d'intro de module s'accumulent sur un squelette commun `docs/maquettes/_skeleton-intro-module.html` - Mon Carnet (`docs/MAQUETTE_INTRO_CARNET.html`), Lexique (`docs/MAQUETTE_INTRO_LEXIQUE.html`), Co-construire ma lettre (`docs/MAQUETTE_INTRO_LETTRE.html`), Préparer un entretien (en cours). Ce sont des maquettes, pas encore du code.

**Règle de contenu (Denis 2026-08-30)** : le patron **ne contient plus** de bloc « Cet outil travaille avec… » ni aucune recommandation vers un autre module (ça hiérarchise les modules). Voir `TACHES_VALIDEES.md`, section « Équilibrer les pages d'introduction ». Les renvois inter-modules sont l'objet du « chantier futur Cohérence entre les modules », en fin de parcours uniquement.

### B.6 - Jetons de choix : 6+ styles de « pilule » coexistent — **RÉSORBÉE 2026-09-04**

Cible : la brique `htmlJetons()` / `.jeton*` (table A, créée le 2026-09-03, étape 6 de la refonte du parcours guidé). **Fait (2026-09-03)** : parcours guidé — Objectif (`contenuPastillesChamp` / `contenuAccepte` / `blocDisponibilite` / `contenuModeRecherche`), « Vos informations » (identité / mobilité / formations / missions / certifications, via `choixRadioVosInfos()` + helpers, scopés `_vosInformationsRenduEnCours`), Assistant (`jetonsGroupeStyleCV()` + situation, `.assistant-jeton` retiré). Reste à y ramener, **écran par écran, jamais en une fois** :
- ~~`contenuModeRecherche()` : `modeRecherche`/`typeRecherche` en `.pastille` 2 colonnes côté Bilan~~ **DÉJÀ FAIT le 2026-09-03** (`85ec0b0`, 6conv-3a) : `bilanOuvrirFenetreCandidature()` pose `_renduInfosUnifie = true` avant de rendre `contenuModeRecherche(true)` → ligne unique `.jeton`, identique à « Votre objectif » (« Votre recherche porte sur : »). La branche `.pastilles-mode-recherche` 2 colonnes de `contenuModeRecherche()` est donc **déjà morte** (plus aucun appelant ne passe `jetons = false`) - à retirer un jour par nettoyage de code mort, pas urgent. Cette ligne était restée périmée jusqu'au 2026-09-04, re-vérifiée en navigateur ce jour, corrigée ici sans rien coder.
- ~~`.pastille-selection` + `style=` en dur (~10 points)~~ **REVÉRIFIÉ POINT PAR POINT le 2026-09-04 - la liste d'origine était en grande partie périmée** :
  - `.export-jetons` (formats d'export PDF/Word/JSON/CSV) : **déjà fait le 2026-09-02** (refonte visuelle « Exporter »), hex déjà remplacés par `var(--...)`. Cette ligne était fausse, corrigée ici.
  - ~~`blocTypeCV()` (« CV général »/« CV spécifique ») : code mort, aucun appelant~~ **RETIRÉ le 2026-09-10 (`26b50b7`)** : `blocTypeCV()` + `blocPersonnaliserCandidature()` + var `revelerSpecifiqueCandidatureRemplie` + CSS `.type-cv-*`, −66 lignes nettes, vérifié navigateur. `npm test` 780.
  - `.adapt-groupe` (page Action, « Adaptation au métier ») : déjà réaligné sur `.preparer-jeton` le 2026-09-02 (choix assumé, mode sombre déjà couvert via `var(--...)` + `!important`). **Laissé tel quel (décision Denis 2026-09-04)** - fait doublon avec la page Assistant (dette B.2), retravailler ici serait probablement refait lors de la fusion.
  - Étapes cliquables « Ce qui va se passer » (choix de l'assistant, `pastille-etape-choixia`) : **laissées telles quelles (décision Denis 2026-09-04)** - un clic déplie un détail, ce n'est pas une sélection persistante, le style actuel (badge numéroté) dit mieux ce que c'est qu'un jeton à coche.
  - **RÉSORBÉ 2026-09-04** : `stylePastilleInline()` (`js/app.js`) - seule fonction encore réellement en couleurs figées (`#0d6efd`/`#F3F4F6`/`#374151`/`#E5E7EB`) - passée en `var(--accent)`/`var(--bg-subtle)`/`var(--text-strong)`/`var(--border)`. Ses 2 vrais consommateurs restants, « Coller manuellement » (`htmlCollageInstantane`) et « Importer dans... » (`contenuAccordeonImportIA`), sont des **boutons d'action uniques réutilisant ce style par commodité visuelle, pas de vrais choix** - décision Denis : corriger seulement les couleurs (mode sombre), ne jamais les convertir en `.jeton` (pas de coche/sélection pertinente pour un bouton d'action). Sans effet sur `.adapt-groupe` (déjà écrasé par ses propres règles `!important`). Vérifié navigateur clair + sombre, `npm test` 713 verts.
**Clôturée le 2026-09-04** : tous les points traitables sont réglés (ou déjà faits, ou déjà des choix assumés). Les 2 seuls points restants ne sont pas des tâches en attente mais des clauses permanentes :
- `.bilan-preparer .preparer-jeton` (choix de situation du Bilan) → **définitivement hors périmètre** (décision Denis 2026-09-03), pas un reliquat à traiter un jour.
- `.pastille` générique (`css/style.css` ~2885, `#e9ecef` en dur, pas de coche) → **clause d'extinction naturelle** : elle s'éteindra d'elle-même quand les derniers écrans non repris disparaîtront (au fil d'autres chantiers), jamais une action à planifier pour elle-même.

### B.7 - Deux moteurs de rendu du CV + ancien panneau Word « Projet XXL » non supprimé

**Ouverte le 2026-09-03** (chantier « La mise en page » du CV, cadrage
`docs/CADRAGE_MISE_EN_PAGE_2026-09-03.md`, approche « B allégé »).

- Le CV a **deux moteurs de rendu séparés** : PDF (iframe, `modules/cv-pdf-html/`,
  ~66 `reg*` + `_cvPdf*`) et Word (Composeur, `modules/cv-composeur/`, objet
  `etatApercuInline.cv.reglagesProjetXXL`). Le chantier a posé **un** modèle
  canonique (`dossier.reglagesMiseEnPageCV`) + **un traducteur par moteur** ;
  il n'a **pas** fusionné les moteurs (décision : la fusion = le « grand saut »,
  liée au découpage de `js/app.js`).
- **L'ancien panneau Word « Projet XXL »** (`construirePaletteCouleurs`,
  `js/app.js` ~29798-32143, **~2 345 lignes**) **n'est pas supprimé**. Il est
  rendu **masqué** (`.mep-ancien-gauche { display:none }`, branche `colonneGauche`
  de `construireContenuApercuFinalisation` quand `opts.miseEnPageRefonte`) parce
  que 5 macros Word y sont **encloses dans sa fermeture** : `appliquerSobreXXL`,
  `appliquerCreatifXXL` / `_appliquerModeleCreatifXXL`, `tirerModeleAleatoireXXL`,
  et les boutons `btnSobreXXL` / `btnCreatifXXL` / `btnProposerModeleXXL` /
  `btnCvOptimiseXXL` / `btnPipetteLibreXXL` / `btnMiseEnFormeUltimeXXL`. Les
  macros « Allure / Style au hasard / Mise en page / Formations / Pipette » du
  nouveau menu les **déclenchent à distance** via `_mepClicMoteur(...)` (option
  « i » validée Denis). Tant que ces macros ne sont pas **extraites au niveau
  module**, retirer le panneau casse Allure/dé/Mise en page/Optimisé/Pipette en
  Word.
- **Résorption : PAS DE CHANTIER DÉCOUPAGE `js/app.js` À VENIR — décision Denis
  2026-09-13, annule le renvoi ci-dessous.** Le choix du 2026-09-04 (« garder pour
  le découpage ») s'appuyait sur un chantier de découpage qui n'aura finalement
  jamais lieu (risque évalué, ne vaut pas le coup ; le projet continue de
  grossir, seules des mises à jour continues sont prévues). Cette dette doit
  donc être traitée directement le jour où on retouche cet écran, jamais
  reportée sur un filet de sécurité qui n'existera pas. Pas encore planifiée à
  cette date faute d'un passage dédié. Étapes toujours valables : (1) extraire les 5-6
  macros Word hors de la fermeture de `construirePaletteCouleurs` (Sobre
  `btnSobreXXL`, Créatif `btnCreatifXXL`, dé `btnProposerModeleXXL` /
  `tirerModeleAleatoireXXL`, Optimisé `btnCvOptimiseXXL`, Pipette
  `btnPipetteLibreXXL`, Mise en page `btnMiseEnFormeUltimeXXL`) ; (2) rebrancher
  `_mepClicMoteur()` (`js/app.js` ~14321) dessus, plus de `.click()` sur boutons
  cachés ; (3) supprimer `construirePaletteCouleurs` + la branche `colonneGauche`
  du CV (lettre / entretien gardent `construireContenuApercuFinalisation`) ;
  (4) nettoyer les résidus `etatApercuInline.cv.personnalisationOuverte` /
  `personnalisationEnGrandApercu` / `construireBoutonsFormatPage` si orphelins.
  Bilan net attendu : **`app.js` perd ~2 300 lignes** sur le chemin CV. Zéro
  régression fonctionnelle Word obligatoire (Allure / dé / Mise en page pilotent
  le rendu Word via ces macros) ; vérif navigateur Word ET PDF sur `nouveau` /
  `maj` / `pret`.
- Détail des vérifications de non-régression : `docs/AUDIT_ZERO_REGRESSION_CREER_MON_CV.md`.

### B.8 - Socle + ton des prompts de recherche : recopiés de `veille.html` dans le module « Comprendre le cadre »

**Ouverte le 2026-09-06** (chantier « Affiner ma recherche » de Comprendre le cadre).

- `outils/veille.html` définit `socleRecherche()` (date du jour, recherche web
  obligatoire, ne jamais fabriquer une URL / un numéro de texte / une date,
  relais quand un site officiel bloque les robots) et la variable `TON`
  (« écris pour une personne réelle… phrases courtes… jamais condescendant…
  ne conclus jamais à la place de la personne »). `veille.html` est un fichier
  **autonome, utilisable hors ligne** : son JS n'est pas partageable.
- Le module « Comprendre le cadre » a **recopié** ces deux textes dans
  `modules/comprendre-le-cadre/index.js` : `_comprendreLeCadreSocleRecherche()`
  et `COMPRENDRE_LE_CADRE_TON_RECHERCHE`, avec un commentaire « dette de
  duplication → BRIQUES_COMMUNES.md ». Deux ajouts par rapport à la veille :
  « Réponds toujours en français » et la demande de reformulation
  (`[REFORMULATION]…[/REFORMULATION]`).
- Consommateurs actuels du socle/ton : `outils/veille.html` (les 3 prompts de
  veille), `modules/comprendre-le-cadre/index.js` (les 2 textes de « Affiner ma
  recherche »), `modules/comprendre-les-chiffres/index.js` (partie B, portes A
  et B : `COMPRENDRE_LES_CHIFFRES_SOCLE_PROMPT` + le territoire en 3 couches,
  recopiés le 2026-09-06). **3e consommateur atteint.**
- **Résorption : à faire au prochain passage sur l'un des trois.** Créer un
  `data/briquesPromptRecherche.js` exportant `socleRechercheWeb()` /
  `TON_RECHERCHE` / `territoirePourPrompt(dep)` et faire pointer les deux
  modules dessus. `veille.html` garde sa copie tant qu'il doit fonctionner
  hors ligne. Pas un chantier à chaud : au prochain module qui touche à ces
  prompts, ou si Denis le demande.
- Voir `docs/IDEES_A_RECLASSER.md` (section « Comprendre le cadre », point 1).

### B.9 - Graphe SVG « maison » (barres + courbes) et infobulle : 4 implémentations proches

**Ouverte le 2026-09-06** (chantier « Comprendre les chiffres »).

- `outils/veille.html` a `sparkline(serie)` (mini-courbe). `modules/comprendre-les-chiffres/index.js`
  a `_comprendreLesChiffresRenduGraphe(e)` (barres + valeurs + infobulle `data-tip`)
  et `_comprendreLesChiffresRenduGrapheCombine(series)` (courbes multi-séries +
  légende). Toutes reconstruisent à la main : échelle, base du graphe, axe,
  libellés de trimestre, tooltip `position: fixed`. `modules/comprendre-le-cadre`
  n'a pas de graphe.
- **Comptage complété le 2026-09-13** (audit de stabilisation « Se tenir
  informé ») : `_comprendreLesChiffresRenduCourbeAnnuelle()` (courbe
  pluriannuelle du chômage, 4 territoires en bascule) est en réalité une
  **4ᵉ** implémentation, avec sa **propre** infobulle
  (`.comprendre-les-chiffres-courbe-infobulle`, positionnement `left`/`right`
  relatif au SVG + gestion tactile), distincte du singleton
  `#comprendreLesChiffresInfobulle` cité ci-dessus. Probablement justifié
  (interaction multi-séries, plusieurs valeurs à la fois), mais absente du
  recensement d'origine.
- Points communs déjà stabilisés (à ne pas ré-inventer) : base du graphe qui
  n'exagère pas un écart minime ([[LECONS 9.36]]) ; libellé de trimestre
  « Tn 20YY » raccourci en « Tn YY », les autres libellés gardés tels quels ;
  ancrage `start` / `end` pour le 1er et le dernier libellé d'axe ; infobulle
  unique réutilisée (`#comprendreLesChiffresInfobulle`), `onmousemove` sur le SVG.
- **Résorption : AU FIL DE L'EAU.** Pas prioritaire (un seul module a des
  graphes riches). Si un 2e module d'APP a besoin d'un graphe, extraire
  `data/briqueGrapheSVG.js` : `grapheBarres(serie, opts)` /
  `grapheCourbes(series, opts)` + le helper d'infobulle. Jusque-là, garder la
  copie dans `comprendre-les-chiffres` et ne pas dupliquer une 5e fois.

### B.10 - Page unique « choix de l'assistant + collage de la réponse »

**Ouverte le 2026-09-07** (chantier « Reformuler et présenter mon CV »).

- `_reformulerCvRendreEchange()` (`data/metiers.js`) met le **choix de
  l'assistant** (`htmlChoixAssistantBilanCorps`) ET le **collage de la
  réponse** (`htmlBanniereTransitionIA` + `htmlCollageInstantane`) sur **une
  seule page** en deux blocs `<details>`, le 2ᵉ se dépliant quand un
  assistant est choisi. Il n'ouvre **aucune fenêtre** : pas même
  `ouvrirFenetreAssistantIA` (« Avant de continuer vers X »), que Cohérence
  et Co-lettre avaient conservée. Le prompt est copié au clic
  (`copierTexteVersPressePapier`), la bannière partagée gère le décompte /
  l'ouverture d'onglet / le repli si bloqué.
- Cohérence de mon dossier et Co-construire ma lettre ont, elles, **deux
  pages séparées** (`ctHtmlEtapeChoixIA` / `ctHtmlEtapeImportIA`,
  `_coLettreRendreChoixAssistant` / `_coLettreRendreReponse`) + la fenêtre
  `ouvrirFenetreAssistantIA`.
- **Résorption : AU FIL DE L'EAU.** Si un 2ᵉ module veut ce schéma « tout sur
  une page, zéro fenêtre », extraire une brique
  `htmlEchangeAssistantUnePage(config)` + son câblage (décompte / phases /
  collage), et migrer Cohérence + Co-lettre dessus au passage. Jusque-là,
  garder la version dans `_reformulerCvRendreEchange` et ne pas la recopier.
- Décision Denis 2026-09-07 (répétée) : **ce module n'a droit à aucune
  fenêtre modale.** La seule qui reste dans le parcours est le repli
  photo/scan de `ouvrirAssistantDepotCV` (dépôt du CV, bloc 1 de
  « Préparer »), mécanisme partagé accepté partout ailleurs.

### B.11 - Bulle d'info au survol : `.carte-verrou-tooltip` (CSS injecté en ligne) vs `.bulle-info-hover-flottante` (brique partagée)

**Ouverte le 2026-09-12** (audit de stabilisation « Mes documents »).

- `.bulle-info-hover-flottante` (`css/style.css`) est déjà la brique partagée
  officielle (positionnement JS via `initBulleInfoHoverFlottante()`, variables
  `--bg-card`/`--text-strong`/`--border-strong`, toujours visible entièrement).
  Son propre commentaire de correction (2026-08-26) dit s'être inspirée de
  `.carte-verrou-tooltip` sans jamais migrer cette dernière dessus.
- `.carte-verrou-tooltip` (`js/app.js`, fonction `carteDocument()`, écran
  « Vos documents ») reste une 2ᵉ implémentation autonome : un `<style>`
  injecté en ligne, positionnement CSS pur (`::after`, ancré au-dessus,
  jamais recadré s'il sort du panneau). Corrigée le 2026-09-12 (couleurs en
  dur → variables de thème) pour stopper le bug de mode sombre, mais la
  duplication mécanique reste entière.
- **Résorption : AU FIL DE L'EAU.** Migrer `carteDocument()` sur
  `.bulle-info-hover` + `initBulleInfoHoverFlottante()` (même attribut
  `data-tooltip` déjà utilisé des deux côtés, portage direct) la prochaine
  fois que cet écran est retouché. Jusque-là, garder les deux implémentations
  distinctes plutôt qu'une fusion à chaud.

### B.12 - Messages d'erreur/succès en JS : couleur écrite en dur (`message.style.color = '#...'`), jamais theme-aware - **RÉSORBÉE 2026-09-13**

**Ouverte le 2026-09-12** (audit de stabilisation « Me préparer à candidater »).

- Motif très répandu : un `<div id="message...">` vide au départ, rempli au
  clic par `message.style.color = '#b91c1c'` (erreur) ou `'#157347'`
  (succès) + `message.textContent = '...'`. Compté précisément (2026-09-12,
  `grep -rE "\.style\.color\s*=\s*['\"]#"`) : **46 occurrences**, dans 4
  fichiers (`data/metiers.js`, `js/app.js`,
  `modules/coherence-transversale/ui.js`,
  `modules/decouverte-competences/decouverteParcours.js`).
- Le projet a déjà les variables qu'il faut : `var(--danger)` /
  `var(--success-strong)`, toutes deux redéfinies sous
  `[data-theme="sombre"]` (`css/style.css`). Le défaut n'est pas qu'elles
  manquent, c'est que ce motif JS ne les utilise pas : en mode sombre, le
  rouge/vert clair choisi pour le mode clair tombe sous le seuil de
  contraste lisible (~2,3:1 et ~3,2:1 mesurés, sous 4,5:1) sur le fond
  sombre `--bg-page`.
- **Pourquoi pas corrigé au fil de cet audit** : trop large et trop
  transverse (46 occurrences, plusieurs modules) pour un passage
  d'audit ciblé sur 2-3 parcours - risque de correctifs à moitié faits ou
  de régressions si traité à la va-vite écran par écran.
- **Résorption recommandée, EN UN SEUL PASSAGE dédié** (pas AU FIL DE
  L'EAU comme les dettes ci-dessus - ce motif est trop homogène et trop
  répété pour valoir la peine d'un traitement dispersé) : un remplacement
  global `'#b91c1c'` → `getComputedStyle(document.documentElement)
  .getPropertyValue('--danger')` serait fragile (couleur figée au moment
  du calcul, pas réactive à un changement de thème à chaud). Mieux : une
  micro-fonction partagée `messageEtatZone(el, type, texte)` (`type`:
  `'erreur'|'succes'|'neutre'`) qui pose une **classe CSS**
  (`.zone-message-erreur`/`.zone-message-succes`) plutôt qu'une couleur
  inline - les classes, elles, héritent nativement de `[data-theme="sombre"]`
  sans recalcul JS. Un seul chantier de recherche/remplacement sur les 46
  occurrences, testé clair + sombre par échantillonnage sur quelques
  écrans représentatifs.
- **Angle mort de comptage repéré le 2026-09-13** (audit « Outils
  d'analyse ») : le grep ci-dessus ne détecte que les affectations JS
  (`message.style.color = '#...'`). Il existe aussi des couleurs figées
  posées en style inline **statique**, directement dans un gabarit HTML
  (ex. `'<div ... style="display:none;color:#b91c1c;"></div>'`,
  `js/app.js:21760`) : même défaut, invisible au comptage actuel.

**Résorbée le 2026-09-13, passage dédié demandé par Denis.**

- **Approche finalement retenue, plus simple que celle esquissée ci-dessus** : remplacement direct de la couleur en dur par la variable de thème dans l'attribut `style` existant (`message.style.color = 'var(--danger)'` au lieu de `'#b91c1c'`), sans passer par une classe CSS ni une fonction partagée `messageEtatZone()`. Une chaîne `var(--...)` assignée à `element.style.color` est résolue en direct par le navigateur à chaque changement de thème, contrairement à `getComputedStyle().getPropertyValue()` (figée au moment du calcul) déjà écarté ci-dessus : le risque qui justifiait la fonction partagée ne s'appliquait pas à cette forme plus directe. Confirmé être déjà le patron existant ailleurs dans le dépôt (`modules/regard-recruteur/index.js`, `var(--danger, #b91c1c)`), pas une invention de ce passage.
- **56 occurrences corrigées** au total (44 affectations JS + 12 couleurs statiques dans un gabarit HTML, angle mort inclus) dans `data/metiers.js`, `js/app.js`, `modules/coherence-transversale/ui.js`, `modules/decouverte-competences/decouverteParcours.js`.
- **Bug supplémentaire trouvé en cours de route** : `--danger` lui-même n'avait, comme `--success`/`--success-strong` avant lui (2026-08-26), jamais été redéfini pour `[data-theme="sombre"]` (`css/style.css`). Sa valeur claire (`#dc3545`) mesure ~3,7:1 de contraste sur `--bg-page` sombre, sous le seuil de 4,5:1 - convertir les 56 occurrences vers `var(--danger)` sans corriger ce point aurait juste échangé un rouge illisible contre un autre. Corrigé en reprenant la valeur déjà utilisée pour le mode sombre daltonien (`#ff8a42`), même raisonnement que pour `--success` en 2026-08-26 (une seule lisibilité recherchée, peu importe le daltonisme).
- Vérifié : `npm test` (854 verts), `node scripts/checkLexique.js` (0 erreur), test navigateur en direct (message d'erreur réellement déclenché sur Co-lettre, couleur `rgb(255, 138, 66)` confirmée en mode sombre) + vérification statique des 3 autres fichiers touchés.
- **Non retouché, à dessein** : les couleurs `couleurTitre` de `js/app.js` (`#0d6efd`/`#198754`/`#0dcaf0`, 3 rubriques Savoir-faire/Savoir-être/Savoirs) ne sont pas un message d'état erreur/succès mais un code couleur catégoriel à 3 valeurs - hors périmètre de cette dette précise.
- **Reste ouvert, mineur** : les 56 occurrences corrigées utilisent `var(--danger)`/`var(--success-strong)` sans valeur de repli (`var(--danger, #dc3545)`), alors que le patron déjà présent dans `js/app.js`/`regard-recruteur/index.js` inclut systématiquement un repli. Sans risque réel (les variables sont toujours définies à la racine), mais une incohérence de style mineure entre les deux conventions qui coexistent maintenant dans le dépôt.

### B.13 - Filet d'annulation après suppression : Mon Carnet et Mes Repères, deux implémentations identiques

**Ouverte le 2026-09-12** (audit de stabilisation « Boîte à outils »).

- Mon Carnet a un filet d'annulation ~10 s après suppression d'une note
  (idée E de `IDEES_A_RECLASSER.md`, Denis 2026-09-09) : la note
  supprimée reste en mémoire un court instant, un bandeau « Note
  supprimée. Annuler » apparaît en tête de liste. Mes Repères n'avait
  pas ce filet (confirmation seule via `confirmerAction()`), écart
  relevé à l'audit et corrigé en ajoutant le même mécanisme.
- Résultat : deux implémentations quasiment identiques,
  `modules/carnet/index.js` (`_carnetSupprimer`/
  `_carnetAnnulerDerniereSuppression`/`_carnetRenduFiletAnnulation`) et
  `modules/reperes/index.js` (mêmes noms de fonctions préfixés
  `_reperes`), CSS dupliqué (`.carnet-annuler-suppression*` dans
  `carnet.css`, `.reperes-annuler-suppression*` dans `reperes.css`,
  mêmes règles, jetons de thème identiques). Non factorisées « à chaud »
  au moment de l'ajout, comme le veut la règle du projet.
- **Résorption : AU FIL DE L'EAU.** Si un 3ᵉ module a besoin d'un filet
  d'annulation après suppression, extraire une brique partagée
  (`filetAnnulationSuppression(config)` + CSS commun) et migrer Carnet
  et Repères dessus au passage. Jusque-là, garder les deux copies
  distinctes.

### B.14 - Comparer mes pistes : écran « Collecter » avec son propre choix d'assistant, hors brique B.2

**Ouverte le 2026-09-13** (audit de stabilisation « Se tenir informé / Vous hésitez encore »), **dette assumée dès l'ouverture, décision Denis**.

- L'écran « Collecter » (`modules/comparer-pistes/index.js`, `ecran2HTML()`
  ~ligne 1300) prépare son propre texte à copier, avec ses propres
  instructions (« Comment je fais, concrètement ? », vidéo de démo dédiée,
  repli « Je n'ai pas d'assistant en ligne ») au lieu de
  `ouvrirFenetreAssistantIA()` / `htmlChoixAssistantBilanCorps()` (brique
  B.2, résorbée le 2026-09-04, consommée par Bilan/Découverte/Cohérence/
  ATS/Un regard sur mon CV).
- Le module a été construit 3 jours avant la résorption de B.2 et n'a
  jamais été rattaché depuis - écart trouvé à l'audit, pas documenté avant
  cette date.
- **Décision Denis (2026-09-13)** : garder tel quel plutôt que migrer
  maintenant. Ce module a un besoin réellement différent des autres
  consommateurs de B.2 (recherche web **obligatoire** avec instructions
  dédiées pour l'activer, pas un simple choix d'assistant) : une migration
  à la légère risquerait de perdre cette spécificité, un écran déjà
  fonctionnel n'a pas besoin d'être retouché sans nécessité.

### B.15 - Un regard sur mon CV : dépôt d'image resté à part de `ouvrirAssistantDepotCV`

**Ouverte le 2026-09-17** (audit `docs/AUDIT_REGARD_RECRUTEUR_2026-09-17.md`, point 3), **dette assumée dès l'ouverture**.

- Le **Mode texte** de ce module est branché sur `ouvrirAssistantDepotCV('pret', ...)` depuis le
  2026-09-17 (texte/PDF/Word/photo, relecture intégrée) - voir la ligne du tableau ci-dessus.
- Le **Mode image** (le mode principal, `htmlVerificationDocument({mode:'image'})` + `FileReader`/
  `dataUrl` propres au module) reste **hors** de la brique partagée : `ouvrirAssistantDepotCV`,
  en mode image, télécharge le fichier masqué sur le poste et ne garde **aucune** copie en mémoire
  (la personne glisse elle-même le fichier dans la conversation avec l'assistant) - or ce module a
  besoin de garder l'image en mémoire pour son propre outil de masquage par rectangles (dessiner/
  enlever, plusieurs images, rotation), un besoin qu'aucun autre consommateur de la brique n'a.
- **Pas une migration à faire plus tard** : un besoin réellement différent (image en mémoire vs
  fichier téléchargé), pas un oubli. À revoir seulement si `ouvrirAssistantDepotCV` gagne un jour
  un mode qui restitue l'image en mémoire à l'appelant.
- **Résorption : AU FIL DE L'EAU, avec maquette si repris.** Si B.2 est un
  jour retravaillée pour accepter une variante « recherche web
  obligatoire », réexaminer ce module comme candidat à la migration à ce
  moment-là - jamais une migration isolée sans ce prérequis.

### B.15 - Panneau « Adaptation au métier » : 2 implémentations du même réglage de style - **RÉSORBÉE 2026-09-16/17**

Trouvée et corrigée dans la foulée (jamais laissée en dette), sans maquette préalable - retouche ciblée d'un panneau déjà existant, pas une refonte visuelle.

- `contenuRectangleStyleCV(docActif)` + `wireRectangleStyleCV()` (`js/app.js` ~9798) : source d'origine, seule consommatrice `pageAssistant()` (« Créer un nouveau CV ») - groupes de jetons `.jeton--radio`, bloc facultatif « Votre situation en ce moment » (`dossier.situationActuelle`), bouton « Reprendre les réglages » contextuel.
- `pageResultats()` (« Vos documents », parcours pret/maj) avait sa **propre** copie (`groupePreference()` local + `groupesAdaptationHTML`, classes `.adapt-groupe`) - **sans** le bloc « Votre situation en ce moment », jamais ajouté à cette copie. Retour utilisateur 2026-09-16 : bug réel confirmé (situation actuelle absente pour pret/maj).
- **Résorbée** : `pageResultats()` appelle désormais `contenuRectangleStyleCV(docActif)` / `wireRectangleStyleCV(docActif, pageResultats)`, à l'identique - seul le bouton « Reprendre les choix » (propre à pret/maj, copier les réglages d'un autre document déjà préparé) reste en en-tête d'accordéon, géré séparément (`boutonReprendrePreferencesHTML()`, jamais en conflit : les 2 mécanismes de reprise ne s'activent jamais en même temps, l'un dépend de `dossier.modeCreation`, l'autre de `_lettreDepuisFinCv`/`_entretienDepuisFinLettre`).
- **2026-09-17, 3ᵉ consommateur** : « Co-construire ma lettre » (`_coLettreRendreDepot()`, `data/metiers.js`) ajoute ce même panneau (bloc 4, avant le passage assistant - ce parcours n'en avait aucun jusque-là, `dossier.preferencesIAParType.lettre` restait toujours à ses valeurs par défaut). Câblage propre (pas `wireRectangleStyleCV()`, qui appelle `avancerEtape()` - mécanisme d'accordéon `panneauEtapeAction()` étranger à la page dépliante `bloc-depli` de ce module) mais même fonction de rendu, rien recopié.
- Vérifié navigateur (les 3 consommateurs, clair uniquement le 2026-09-17 - à revérifier en sombre au prochain passage sur ce panneau), `npm test` 922 verts.

---

## Historique

- 2026-09-18 (chantier « 2e passage IA obligatoire pour Decouvrir mes compétences », `docs/CHANTIER_DECOUVERTE_2E_PASSAGE_REDACTION.md`) : nouveau **consommateur** du pipeline « rédaction IA du CV » (`contenuRectangleChoixIA`/`wireRectangleChoixIA`, `contenuAccordeonImportIA`/`wireImportIA`, `ouvrirRelectureIACV`/`contenuRectangleRelectureIA`/`wireRectangleRelectureIA`), jusque-là propre à `pageResultats()` (maj/pret) et `pageAssistant()` (nouveau) - voir la nouvelle ligne du tableau A. `wireChoixAssistantIA`/`wireRectangleChoixIA` gagnent un paramètre facultatif `clePromptOverride` pour permettre à Découverte d'imposer sa propre clé de prompt (`decouverteRedaction`, nouveau fichier `prompts/decouverte-redaction.md`, repris de l'essentiel de `prompts/cv.md` - **prochaine modification de `cv.md` : penser à vérifier si `decouverte-redaction.md` doit suivre**, même schéma JSON de sortie à l'octet près) sans dupliquer la fonction ; comportement inchangé pour tous les autres appelants (paramètre omis). Éditeur d'expériences (`ouvrirFenetreExperiences`/`cablerFenetreExperiences`) gagne aussi Découverte comme consommateur explicite (nouvelle étape « Vos expériences »), via l'appel direct déjà établi par l'Atelier CV (callbacks propres, jamais le wrapper par défaut). **Bug trouvé et corrigé en testant** : `wireRectangleRelectureIA()` rappelle toujours son `rerender` après validation - avec une navigation vers une autre étape dans ce `rerender`, ça écrasait la page tout juste affichée par le `onValider` personnalisé ; `rerender` devient un no-op volontaire pour ce nouveau consommateur.
- 2026-09-08 (chantier « Regard recruteur », module indépendant `modules/regard-recruteur/`) : nouveau **consommateur** de briques existantes, aucune nouvelle brique canonique, aucune dette ouverte. Réutilise `barreEtapesModule()` (4 pastilles), `htmlChoixAssistantBilanCorps(config)` (`etapes` = `ETAPES_DETAIL_CHOIX_IA`), `htmlBanniereTransitionIA()` + `_etatTransitionIA` + `_intervalleDecompteIA` (transition assistant, patron `decouverteParcours.js` — écran en page, jamais `ouvrirFenetreAssistantIA`), `htmlCollageInstantane('RegardRecruteur')` / `activerCollageInstantane()`, `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre(racine, onChange)` / `bilanLireCiblageOffre()` (bloc 3 de « Préparer » ; **valeurs ré-injectées au rendu** car la brique pré-remplit depuis `dossier`, pas depuis l'état du module), `htmlVerificationDocument()` / `cablerVerificationDocument()` en mode **texte** ET mode **image** (écran « Masquer » : le masquage image = canvas + rectangles, une image à la fois depuis un `dataURL` gardé en état, `onEnregistre` télécharge la copie masquée ; ajouté le 2026-09-08, décision 4 tranchée par Denis « branche l'outil »), `reperesBoutonAncre()` (chaque axe du rapport + chaque point de la fiche), patron disquette `regardRecruteurExporterEtatPourSauvegarde()` / `regardRecruteurRestaurerEtatDepuisSauvegarde()`, navigation Famille 2 (`htmlBandeRepriseModule` + `htmlEncartRepriseModule` + `appliquerGelModule` + `armerFinPulseEncartReprise` + `noteRevoirModuleDejaVue`). Logique pure isolée dans `modules/regard-recruteur/rapportResponseParser.js` + `promptBuilder.js` (autonomes, testés Node). Prompt dédié `prompts/regard-recruteur.md`. **Piège Retour corrigé et documenté (LECONS section 2)** : `regardRecruteurRetour()` (barre du bas) ≠ `regardRecruteurRetourVersPresentation()` (bouton « Revoir la présentation ») — les confondre créait une boucle infinie présentation ⟷ module.
- 2026-09-08 (chantier « Les mots de votre CV », ex-ATS, module indépendant `modules/ats/`) : nouveau **consommateur** de briques existantes, aucune nouvelle brique canonique, aucune dette ouverte. Réutilise `barreEtapesModule()` (barre d'étapes), `htmlChoixAssistantBilanCorps(config)` (étapes propres `ATS_ETAPES_CHOIX_IA`), `ouvrirFenetreAssistantIA()` + `htmlBanniereTransitionIA()` + `_etatTransitionIA` (transition assistant), `htmlCollageInstantane()` / `activerCollageInstantane()` (collage réponse), `ouvrirAssistantDepotCV('maj', {onDocumentPrepare})` (dépôt CV + relecture/masquage en un seul wizard - **pas d'écran de relecture routé côté module**, décision Denis « option B » 2026-09-08), `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre()` / `bilanLireCiblageOffre()` (ciblage offre, bloc « Préparer »), `reperesBoutonAncre()` (écran « Ma fiche »), patron disquette `atsExporterEtatPourSauvegarde()` / `atsRestaurerEtatDepuisSauvegarde()`, navigation Famille 2 (`appliquerGelModule` + encart reprise + pulse). Logique pure isolée dans `modules/ats/detectionTexteCache.js` + `resultatParser.js` (testés Node). Prompt dédié `prompts/ats.md`. Plan : `docs/PLAN_ATS_2026-09-03.md`.
- 2026-09-06 (chantier « Affiner ma recherche » de Comprendre le cadre) : ouverture de la dette **B.8** - `socleRecherche()` / `TON` de `outils/veille.html` recopiés dans `modules/comprendre-le-cadre/index.js` (`_comprendreLeCadreSocleRecherche()` / `COMPRENDRE_LE_CADRE_TON_RECHERCHE`), `veille.html` étant un fichier autonome hors ligne sans JS partageable. 2 consommateurs pour l'instant : pas de chantier dédié, extraction dans un `data/briquesPromptRecherche.js` au 3e consommateur.
- 2026-08-30 : création. Registre initial rempli à partir de la consolidation du Bilan (blocs 1.x / 2.x / 3.x) et de la lecture du code transverse. Dette B.1 (contexte de candidature) identifiée comme prioritaire, rattachée au bloc 2.1 complet (Lot B).
- 2026-08-30 (bloc 3.3, « Préparer ») : nouvelle brique **Ciblage offre / entreprise / type de structure** (`bilanCorpsCiblageOffreHTML` / `bilanCablerCiblageOffre` / `bilanLireCiblageOffre`, `data/metiers.js`) extraite de la modale `bilanOuvrirCiblageOffreEmploi()`, elle-même retirée. Consommée par le bloc 4 de `htmlBilanPreparer()`. `bilanOuvrirChoixSituation()` retirée aussi (les jetons de situation du bloc 3 réutilisent `OBJECTIF_CHOIX_CANDIDATURE` + `definirObjectifCandidature`).
- 2026-08-30 (maquettes d'intro de module) : B.5 mise à jour - des maquettes HTML d'intro (`MAQUETTE_INTRO_CARNET` / `_LEXIQUE` / `_LETTRE`, squelette `_skeleton-intro-module.html`) s'accumulent ; extraction de `htmlPageIntroModule(config)` à prévoir au moment du passage en code. Règle de contenu posée par Denis : le patron ne porte plus de bloc « Cet outil travaille avec… » ni de recommandation inter-module.
- 2026-09-03 (refonte parcours guidé, étape 6a) : création de la brique **Jetons de choix** `htmlJetons()` + CSS `.jeton*` (coche/puce `::before`, halo focus, thème clair + sombre ; cible visuelle = maquettes du parcours). Premier consommateur : Objectif (contrat / temps de travail / j'accepte), via `contenuPastillesChamp` + `contenuAccepte` réécrits pour l'appeler ; `wireContratTemps` inchangé (sélecteur `.pastille[data-champ]` → `.jeton[data-champ]`). Dette B.6 ouverte pour la suite (6b Vos informations, 6c Assistant, puis `.pastille-selection`). Bilan explicitement hors périmètre.
- 2026-08-30 (modernisation « Choisir l'assistant » M1/M2, « Coller la réponse » M3) : `htmlChoixAssistantBilanCorps` repensé (voir B.2). `lignePastillesAssistantsIA` gagne un 7e param optionnel `sousLabel` (rétrocompatible). Correctif mode sombre (hex → jetons) sur `htmlCollageInstantane` (7 consommateurs, structure identique) et `htmlBanniereTransitionIA` (page Action / Découverte / Bilan). M3+ `f12aa48` : phase `decompte` de `htmlBanniereTransitionIA` refaite en « hero » (gros chiffre en pastille accent - `#compteurDecompteIA` conservé et toujours mis à jour par le câblage des 3 parcours -, piste qui se vide, repli `<details>` « Si l'onglet ne s'ouvre pas »). **Bloc 1.5** `623b76e` : phase `ouvert` de `htmlBanniereTransitionIA` gagne un bouton `#btnRouvrirSiteIA` « Rouvrir le site de [assistant] » + phrase ; câblé dans les 3 parcours sur la même fonction que la phase `bloque` (`ouvrirAssistant*EnAttente`). **M4** `f52d81a` : `htmlCollageInstantane` -- bouton `#btnCollerAuto<suffixe>` passe du rond 96x96 au **rectangle à coins arrondis** libellé « Coller la réponse » (décision Denis : cohérence, l'appli n'a que des boutons rectangulaires). Légende `#texteBtnCollerAuto<suffixe>` vide par défaut. États `.rond-collage-desactive` / `.pulse-collage-retour` insensibles à la forme, aucun câblage changé. Touche tous les consommateurs (Wizard CV/Lettre/Entretien, page Action, Bilan, Découverte, Cohérence, Regard extérieur).
- 2026-09-03 (chantier « La mise en page » du CV, sous-étapes 0-10) : nouvelle brique **Réglages de mise en page du CV** (`modules/cv-mise-en-page/reglagesMiseEnPage.js` + `reglagesTraducteurs.js`) — modèle canonique `dossier.reglagesMiseEnPageCV` + 1 traducteur par moteur existant (PDF iframe, Word Composeur), sans fusionner les moteurs. UI 3 niveaux (Simple / Je débute / Je veux tout régler) + grand aperçu PDF refait au langage de la maquette v6, dans `js/app.js`. Dette **B.7** ouverte : l'ancien panneau Word « Projet XXL » (`construirePaletteCouleurs`, ~2 345 l.) reste rendu **masqué** (5 macros Word encloses, déclenchées à distance par `_mepClicMoteur`) — suppression rattachée au chantier découpage `js/app.js`. Audit fonction par fonction : `docs/AUDIT_ZERO_REGRESSION_CREER_MON_CV.md`.
- 2026-09-04 (chantier « La mise en page » du CV, **lot moteur CLOS**, commits `00341e5` `e359407` `737fbbf` `b8cf094` `7ca4cae`) : les réglages « montrés + expliqués » de l'audit 9bis reçoivent un vrai effet sur les 2 moteurs par **un seul circuit partagé** — `reglagesMiseEnPageCV.<clé>` → `reglagesTraducteurs` → **whitelist** de `composeurResoudreThemeGeneration` (`js/app.js`) → `theme` (`composeurTheme.js`) → `composition` (`composeurComposition.js`) → Word (`composeurRender.js`) **et** PDF (`cvPdfTemplateA4.js`). Couverts : Densité, Alignement (gauche/justifié), Veuves-orphelines, Interligne, Espacement des paragraphes, Marges de page, Liste unique « rubriques à afficher / masquer » (7 clés, `theme.rubriquesMasquees` vide `contenuRetenu` — chokepoint unique — + `permisMasque` pour l'en-tête). **Ordre des rubriques en Word = NON fait, asymétrie assumée (option A, Denis 2026-09-04)** : ordre Word piloté par la stratégie du Composeur, réordonnancement libre seulement en PDF (glisser-déposer du grand aperçu). Tout `reg*` PDF touché est aussi poussé sur l'iframe + `dossier.pdfReglages`. Round-trip traducteurs testé Node (`npm test` 703).
- 2026-09-04 (dette B.4, 2 endroits sur 3) : `bilanBarreEtapes()` et `ctHtmlBarreEtapes()` delegues a `barreEtapesModule()`, deja construite le 2026-08-31 en copiant leur rendu, jamais reutilisee depuis. En creusant le 3e endroit ("la barre de la page Action") avant de fusionner, decouvert que ce n'est PAS une 3e copie du meme rendu : ses pastilles sont de vrais boutons relies a un accordeon (etatAccordeon/etatAccordeonValide, triangle quand ouvert), pas un repere en lecture seule -- fusion pas traitee aujourd'hui, demande une decision avec Denis.
- 2026-09-04 (dette B.2, dernier endroit - **B.2 ENTIEREMENT RESORBEE**) : page Assistant (`contenuRectangleChoixIA`, js/app.js) migree vers `htmlChoixAssistantBilanCorps()`. Le bouton "voir/modifier le texte transmis" (absent des 3 autres modules) n'a pas eu besoin d'arbitrage -- fonctionnalite legitimement propre a ce parcours (seul a composer le texte depuis des champs structures), ajoutee apres le composant partage plutot qu'arbitree dedans. `wireEtapesDetailChoixIA()` devenu mort (0 appelant) supprime.
- 2026-09-04 (dette B.2, 2 endroits sur 3) : en verifiant le tableau avant de coder, decouvert que Decouverte etait deja migree vers `htmlChoixAssistantBilanCorps()` depuis le 2026-08-31 (ligne perimee corrigee) et que "la page Action" citee dans la dette designait en realite Decouverte (erreur d'attribution corrigee). Coherence transversale (2 ecrans : 1er prompt + entretien avance) migree a son tour - couleurs figees remplacees, ancien cablage de clic-pour-reveler retire. Reste seulement la page Assistant du parcours principal, qui a une fonctionnalite en plus (bouton "voir/modifier le texte transmis") a arbitrer avant fusion.
- 2026-09-04 (dette B.6, revue point par point + `stylePastilleInline()`) : les ~10 points de la dette B.6 vérifiés un par un contre le code, à la demande de Denis - la plupart étaient soit déjà faits (`.export-jetons`, 2026-09-02), soit du code mort (`blocTypeCV()`), soit déjà des décisions assumées (`.adapt-groupe`, étapes « Ce qui va se passer »), soit pas de vrais choix (boutons d'action « Coller manuellement »/« Importer dans... »). Seul `stylePastilleInline()` (`js/app.js`) restait réellement en couleurs figées - corrigé en `var(--...)`, sans convertir ses 2 consommateurs en `.jeton` (ce ne sont pas des choix). B.6 reste ouverte pour son point 4 (`.pastille` générique, à retirer au fil de l'eau) et le point explicitement écarté (`.preparer-jeton` du Bilan).
- 2026-09-04 (dette B.1, collecteur #1, dernier - **B.1 ENTIÈREMENT RÉSORBÉE**) : le cœur de `contenuModeRecherche()`/`wireModeRecherche()` était déjà une source unique (Mon projet + Bilan, paramétrée par `depuisBilan`) - rien à faire là. Le reliquat interne (`contenuCoordonneesEntrepriseBilanInline()`, fenêtre Candidature du Bilan) migré vers `bilanCorpsCiblageOffreHTML()` + `bilanCablerCiblageOffre()` + `bilanLireCiblageOffre()`. **Bug trouvé et corrigé dans la brique canonique elle-même** : `bilanCablerCiblageOffre()` (`data/metiers.js`) n'appelait `onChange` que pour entreprise/site/offre/offreContenu/typeStructure - jamais pour le champ libre `#ciblageTypeStructureAutre`, invisible tant que le seul consommateur relisait tout au clic final (bloc 4 « Préparer », Cohérence), bloquant pour ce nouveau consommateur en écriture immédiate (aucun bouton « Valider »). Corrigé une fois pour toutes dans la brique, aucun changement de comportement pour les 2 autres consommateurs (ils ne passent pas d'`onChange`).
- 2026-09-04 (dette B.1, correction + collecteur #4) : en cadrant « le #3 » demandé par Denis, découvert que `bilanOuvrirCiblageOffreEmploi` n'existe plus depuis le 2026-08-30 (retirée le jour même de la création de ce tableau, jamais mise à jour ici) - ligne corrigée, rien à coder pour #3. La vraie duplication restante sur cette brique (entreprise/site/offre/type de structure) était le **collecteur #4** (`ctOuvrirCollecteComplement`, Cohérence transversale, `modules/coherence-transversale/ui.js`) : migré vers `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre()` / `bilanLireCiblageOffre()` (`data/metiers.js`). Textes pédagogiques propres à Cohérence (candidature spontanée, astuce photo) conservés autour du bloc commun ; `questionsPersonne` (hors périmètre de la brique) inchangé. `bilanLireCiblageOffre()` renvoie `typeStructureAutre` séparément de `typeStructure` - mappé côté Cohérence pour ne jamais écrire le mot littéral « Autre » dans `dossier.rechercheCandidature.typeStructure`.
- 2026-09-04 (dette B.1, collecteur #2) : `ouvrirFormulaireCoordonneesEntreprise` (`js/app.js`, fenêtre « Coordonnées de l'entreprise » du parcours « Passer à l'action » et de « Candidater depuis la recherche ») migré vers `contenuCiviliteRecruteurCandidature()` / `contenuCouleurEntrepriseCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature(rerender)`, avec un re-rendu localisé de `#coordZoneCiviliteCouleur` à chaque interaction (jamais de réouverture complète du panneau, pour ne pas rejouer l'animation d'ouverture - voir LECONS 9.5). **Décision Denis 2026-09-04** : tout le formulaire passe en écriture immédiate (entreprise/site/offre ou structure/lien en immersion compris), au lieu d'attendre le clic sur « Valider » - changement de comportement assumé, harmonisé avec les 3 autres consommateurs de la brique. Attention : `contenuCiviliteRecruteurCandidature()`/`contenuCouleurEntrepriseCandidature()` s'appuient sur `choixRadioVosInfos()`, qui ne rend `.jeton` que si `_renduInfosUnifie` est vrai au moment de l'appel (sinon repli `.pastille`) - à remettre à `true`/`false` autour de CHAQUE rendu (initial et re-rendus), piège identifié en cours de route.
- 2026-09-04 (dette B.1, collecteur #5) : `blocRechercheCandidature` (Découvrir mes compétences, `modules/decouverte-competences/decouverteParcours.js`) migré vers `contenuCiviliteRecruteurCandidature()` / `contenuCouleurEntrepriseCandidature()` + `wireCiviliteEtCouleurRecruteurCandidature(rerender)` (`js/app.js`), en lieu et place de sa propre copie (qui ne réutilisait que le jeton visuel `choixRadioVosInfos`, pas la brique complète). Ids `decouverteNomRecruteur`/`decouverteCouleurEntreprise` → `candNomRecruteur`/`candCouleurEntreprise` (répercuté dans `sauvegarderChoixEtape1`). Ordre des jetons civilité légèrement changé (Je ne sais pas / Monsieur / Madame, au lieu de Monsieur / Madame / Je ne sais pas) - accepté, conséquence directe d'une seule source de vérité. Entreprise/site/lienOffre restent propres à Découverte. Résorption **chantier par chantier, jamais en bloc** (décision Denis 2026-08-30) : 4 collecteurs restent (#1-#4).
- 2026-09-04 (dette B.5, Cohérence migrée) : `htmlPageIntroModule(config)` extraite (`js/app.js`), `ctHtmlExplication()` migrée dessus (texte + logique du bouton du bas préservés à l'identique, vérifié par capture avant/après). Dans la foulée, décision Denis : plus aucune barre d'étapes visuelle sur une page d'introduction (revient sur la décision du 2026-08-31 qui l'affichait en sourdine) - retirée de `htmlPageIntroModule()` et de `htmlPageIntroModuleParcours()` (`data/metiers.js`, 8 pages routées). Signalé aussi par Denis en cours de route : la fenêtre d'import CV/lettre/entretien de Cohérence (dette B.1, volet fenêtre d'import) s'ajoute à la liste des cartes à faire passer en page dépliante. `htmlBilanIntro()` reste à migrer, chantier séparé.
- 2026-09-02 (fusion « Votre parcours ») : **`pageSelectionCatalogue(config)` RETIRÉE** (`js/app.js`, commit `9a56874`). C'était le rendu partagé des 4 écrans catalogue Activités / Actions / Environnement / Attentes du parcours « Créer un nouveau CV » ; les 4 wrappers (`pageActivites` / `pageActions` / `pageEnvironnement` / `pageValeurs`) et son état transitoire (`etatSelectionCatalogue`, `etatCatalogue`, `_intervalIntroOnglets`, `LIMITE_ACTIONS`) partent avec. Remplacé par **`pageVotreParcours()`** (route `votre-parcours`), page unique à 4 questions repliables. `trouverItemParId(catalogue, id)` — utilitaire partagé (compétences, `texteProfil`, `extractionConceptsERIP`) — a été **re-déplacée hors de la zone supprimée** (elle y vivait) : à ne pas rechercher dans l'ancien voisinage. Ne concerne QUE le parcours `nouveau` (ni `maj`, ni `pret`, ni Découverte n'utilisaient ces écrans). Plan : `docs/PLAN_FUSION_VOTRE_PARCOURS_2026-09-02.md`.
