# Chantier : éliminer les fenêtres de dépôt de CV, tout basculer sur la page du module

> Demandé par Denis le 2026-09-04, en prolongement de la dette **B.1** (volet « fenêtre d'import CV »)
> de `docs/BRIQUES_COMMUNES.md`. Audit complet fait le même jour (lecture de code exhaustive). Ce fichier
> est le document de référence du chantier - à relire avant toute reprise.

## Le principe posé par Denis

« Je veux limiter au maximum les fenêtres. [...] Je veux que le CV soit directement mis sur la page et pas
dans une fenêtre à part. » Objectif : un seul comportement pour tous les modules, celui déjà en place sur
« Mes documents » (page « Préparer » dépliante) et le Bilan (page « Preparer » elle aussi dépliante) - jamais
une cascade de fenêtres modales avant d'atteindre le vrai contenu du module.

## Note de méthode (comment `ouvrirAssistantDepotCV` fonctionne réellement)

`ouvrirAssistantDepotCV(mode, options)` (`data/metiers.js`) crée **une seule** fenêtre fixe plein écran,
ré-affichée en interne à chaque étape de son propre mini-wizard (jamais empilée sur elle-même). Elle a deux
modes d'usage bien distincts - important pour ne pas confondre ce qui est déjà correct avec ce qui ne l'est
pas :

- **Mode « léger »** (`options.onDocumentPrepare`) : s'arrête après dépôt + relecture/masquage, rend la main
  à l'appelant via callback. C'est le mécanisme derrière `obtenirOuDeposerTexteCV()` - **une seule** popup,
  ponctuelle, refermée immédiatement. Utilisé correctement aujourd'hui par les 4 modules Pattern A (voir
  plus bas) : dans ces 4 cas, `obtenirOuDeposerTexteCV()` essaie d'abord de lire un CV déjà présent dans
  `dossier` (aucune fenêtre), et n'ouvre `ouvrirAssistantDepotCV()` que s'il n'y a vraiment rien à lire, ou en
  repli pour une photo/scan (lecture de fichier, techniquement impossible à faire autrement qu'une popup).
- **Mode « complet »** (pas de `onDocumentPrepare`, juste `onTerminer`) : poursuit jusqu'à la structuration
  complète en champs, ne referme qu'à la toute fin. C'est le vrai « wizard modal intégral » d'origine.

**Le problème n'est donc jamais l'existence de `ouvrirAssistantDepotCV()` en soi** (son mode léger, ponctuel,
est déjà la bonne brique - jamais à supprimer). Le problème est une **cascade de plusieurs fenêtres
indépendantes** ouvertes les unes après les autres (CV, puis lettre, puis entretien, puis offre...) avant que
le module affiche enfin son vrai contenu - c'est CE patron qui doit disparaître.

## Inventaire complet (audit du 2026-09-04)

### Pattern A - déjà bon, la cible à généraliser

Dépôt de CV inline sur la page du module via `obtenirOuDeposerTexteCV()`, repli modal seulement pour les cas
techniquement inévitables (photo/scan), toujours **une seule** fenêtre ponctuelle dans ce cas.

| Module / carte | Mécanisme | Fichier |
|---|---|---|
| Mes documents -> **Préparer ma lettre et mon entretien** (mode `pret`) | Page dépliante `_prepLERendreDepot()` / `htmlPreparerLettreEntretienDepliante()`, bouton « Déposer » -> `obtenirOuDeposerTexteCV()` | `data/metiers.js:3768-3908` |
| Mes documents -> **Mettre à jour mon CV** (mode `maj`) | Même page dépliante partagée (`_prepLEMode='maj'`) | `data/metiers.js:3405-3693` |
| Mes documents -> **Créer un nouveau CV** (mode `nouveau`) | Parcours guidé par pages routées, **aucun dépôt requis** (construit de zéro) | `data/metiers.js:3703-3742` |
| **Analyser ma candidature** (Bilan de candidature) | Page « Preparer » `htmlBilanPreparer()`, bouton « Déposer mon CV » -> `obtenirOuDeposerTexteCV()`. Commentaire du code confirme : « fin de la cascade de 2 à 4 fenêtres modales » (déjà corrigé par le passé) | `data/metiers.js:4670-4692`, `js/app.js:17014+`, `js/app.js:20967` |

### Pattern B - à corriger, par ordre de complexité croissante (proposé)

| # | Module / carte | Fenêtres empilées | Détail de la cascade | Bundle |
|---|---|---|---|---|
| 1 | **Co-construire ma lettre de motivation** | **4** | `ouvrirDepotLettreV1()` (`data/metiers.js:3296`) : 1) `ouvrirAssistantDepotCV('pret', {onDocumentPrepare})` [CV] -> 2) `ouvrirChoixAssistantLettreV1()` -> `ouvrirFenetreERIP()` [choix assistant] -> 3) `ouvrirFenetreAssistantIA()` -> `ouvrirFenetreERIP()` [écran tampon avant redirection] -> 4) `ouvrirRecuperationLettreV1()` -> `ouvrirFenetreERIP()` [collage réponse + export DOCX] | Rien d'autre (CV seul) |
| 2 | **Cohérence de mon dossier** | **4** | `ctDemarrerCollecte()` (`modules/coherence-transversale/ui.js:305`) : 1) `obtenirOuDeposerTexteCV()` [CV] -> 2) `ctObtenirOuDeposerTexteLettre()` -> `ouvrirAssistantDepotCV('pret')` [lettre] -> 3) `ctObtenirOuDeposerTexteEntretien()` -> `ouvrirAssistantDepotCV('pret')` [entretien, facultatif] -> 4) `ctOuvrirCollecteComplement()` -> `ouvrirFenetreERIP()` [offre/entreprise/questions] | Lettre + entretien (facultatif) + offre/entreprise/type de structure |
| 3 | **Préparer un entretien** | **5** | `ouvrirParcoursEntretien()` (`data/metiers.js:6116`) : 1) `ouvrirDepotEntretien()` -> `ouvrirFenetreERIP()` [dépôt CV obligatoire + lettre facultative, **mécanisme propre à ce module**, pas `ouvrirAssistantDepotCV`] -> 2) `ouvrirVerificationEntretien()` [relecture/masquage] -> 3) `verifierOuDemanderEntrepriseEtPoste()` -> `ouvrirFenetreERIP()` [poste/entreprise, + écran « incitation » optionnel = variante à 3 fenêtres ici] -> 4) `ouvrirChoixIAEntretien()` -> `ouvrirFenetreERIP()` [choix assistant] -> 5) récupération de la réponse | Lettre facultative dès la 1ʳᵉ fenêtre + entreprise/poste. **Mécanisme de dépôt différent des 2 autres** (`ouvrirDepotEntretien`/`analyserDocumentDepose`, pas `ouvrirAssistantDepotCV`/`obtenirOuDeposerTexteCV`) - à remplacer, pas seulement réhabiller |

### Modules sans dépôt de CV (hors périmètre, vérifiés explicitement)

Découvrir mes compétences (construit de zéro, jamais de dépôt), Comparer mes pistes, Regard extérieur
(travaille sur les Repères, aucun rapport avec le CV), Mon Carnet, Lexique, Repères, Comprendre le cadre.

### Modules pas encore construits (à ne pas confondre avec ce qui précède)

ATS (« Les mots de votre CV ») et Regard recruteur : seules des pages de présentation existent
(`pageIntroAts()`, `pageIntroRegardRecruteur()`), CTA désactivé, commentaire explicite « en cours de
préparation ». Aucun mécanisme de dépôt à corriger - à concevoir directement en Pattern A le jour de leur
construction, jamais en Pattern B.

### Trouvé en chemin, à surveiller (pas dans le périmètre demandé, à traiter séparément)

- **« Candidater depuis la recherche »** (`pageCandidaterDepuisRecherche`, atteint depuis la barre de
  recherche de l'accueil) : la page hôte est déjà une page dépliante (Pattern A), mais son bouton final
  (`_candidaterFinaliser()`, `js/app.js:1408`) appelle `ouvrirAssistantDepotCV(..., {onTerminer})` en **mode
  complet** (le vrai wizard modal intégral), pas le mode léger utilisé par « Préparer »/Bilan. Incohérence
  mineure à harmoniser un jour, hors périmètre de ce chantier.
- **Code mort probable** : le handler `[data-action="mode"]` (`data/metiers.js:6172-6183`) ouvre directement
  `ouvrirAssistantDepotCV()` au clic - recherche exhaustive : plus aucun élément HTML/JS actuel ne produit cet
  attribut. Vraisemblablement un vestige d'avant la refonte « Mes documents ». À confirmer avant suppression,
  jamais supposé mort sans vérification, pas urgent.

## Plan proposé

**Recommandation : extraire un composant partagé « page de dépôt de documents », modelé sur la page
« Préparer » dépliante déjà existante (`_prepLERendreDepot()` / `htmlPreparerLettreEntretienDepliante()`,
`data/metiers.js`), puis migrer les 3 modules dessus UN À LA FOIS, dans l'ordre de complexité croissante :
1. Co-construire ma lettre de motivation (le plus simple - CV seul, pas de bundle)
2. Cohérence de mon dossier (CV + lettre + entretien facultatif + offre/entreprise)
3. Préparer un entretien (le plus complexe - mécanisme de dépôt différent à remplacer, pas seulement à
   réhabiller)**

Pourquoi cet ordre et cette méthode :
- **Apport** : un seul composant à construire et à maintenir (au lieu de 3 pages bricolées séparément),
  cohérence garantie entre les 3 modules, et le risque le plus dur (Préparer un entretien, mécanisme
  différent) est traité en dernier, une fois le patron éprouvé sur 2 cas plus simples.
- **Risque limité par la méthode** : chaque module migré, testé en navigateur, commité séparément - jamais un
  seul commit pour les 3 (même méthode que B.1/B.2/B.4/B.5 ce jour, déjà validée par Denis à plusieurs
  reprises cette session).
- Chaque migration nécessitera une **maquette avant code** (non-négociable du projet dès qu'il y a un doute
  d'interface) : le nombre d'écrans/blocs, leur ordre, ce qui reste facultatif, ne doivent pas être supposés.

**Alternative écartée** : construire 3 pages entièrement indépendantes, une par module, sans les faire
partager un composant commun. Bénéfice : chaque module peut coller plus finement à ses propres besoins dès le
départ. Risque : 3 interfaces subtilement différentes à maintenir, et c'est exactement le genre de
duplication que ce projet retire systématiquement ailleurs (registre `BRIQUES_COMMUNES.md`) - non retenue.

### Détail de l'étape 3 (Préparer un entretien) — la plus complexe des 3

Cascade de 5 fenêtres (`ouvrirDepotEntretien` → `ouvrirVerificationEntretien` → `verifierOuDemanderEntrepriseEtPoste`
[formulaire + incitation] → `ouvrirChoixIAEntretien` → `ouvrirRecuperationEntretien`) remplacée par 5 vraies pages
routées (dispatcher `pagePrepaEntretien()`, état `_prepaEntretienEcran`) :

- **Dépôt (`_prepaEntretienRendreDepot()`)** : mécanisme **volontairement inchangé** - `input[type=file]` +
  `analyserDocumentDepose()`, jamais `ouvrirAssistantDepotCV`/`obtenirOuDeposerTexteCV` (ce module a toujours eu
  son propre mécanisme de dépôt, pas de raison d'en changer la logique d'analyse, seulement son conteneur). Bug
  de mode sombre corrigé au passage (`#EFF6FF` figé, jamais theme-aware).
- **Vérification (`_prepaEntretienRendreVerification()`)** : délègue toujours à `htmlVerificationDocument()`/
  `cablerVerificationDocument()` (composant partagé, inchangé - même que le wizard CV et le Bilan). Navigation
  entre CV/lettre préservée. **Point de vigilance retrouvé en migrant** : l'écriture de `dossier.cvTexte`/
  `dossier.lettreMotivation` (pour alimenter `texteProfilEffectif('entretien')` à l'étape assistant) vivait dans
  une closure de l'ancien `ouvrirParcoursEntretien()` - déplacée dans le bouton "Continuer" de cet écran, sans
  quoi elle aurait disparu silencieusement.
- **Entreprise et poste (`_prepaEntretienRendreEntreprise()`)** : reprend le cycle formulaire ↔ incitation
  d'origine via un sous-état (`_prepaEntretienEntrepriseEcran`), skip direct vers le choix d'assistant si
  entreprise et poste déjà connus - comportement inchangé.
- **Choix de l'assistant (`_prepaEntretienRendreChoixAssistant()`)** : `htmlChoixAssistantBilanCorps()` (dette
  B.2) au lieu de pastilles maison en couleurs figées (`stylePastilleInline()`, jamais theme-aware - corrigé
  au passage).
- **Réponse (`_prepaEntretienRendreReponse()`)** : contenu et mécanismes strictement inchangés (décompte,
  popup bloqué, collage instantané, analyse, génération DOCX). « Terminé » navigue vers « Vos documents ».
- **`ouvrirParcoursEntretien()` simplifié** : devient `_prepaEntretienEcran = 'depot'; naviguerVers('prepa-entretien');`
  - conserve son usage en raccourci direct (appelé aussi par `_candidaterFinaliser()`, js/app.js, parcours
  « Candidater depuis la recherche » quand `rg.parcours === 'entretien'`), vérifié fonctionnel depuis n'importe
  quelle page.
- `ouvrirFenetreAssistantIA()` (confirmation brève avant redirection, `demarrerEnvoiIAEntretien()`) **non
  touchée**.
- Retour conforme RC-03 sur les 5 écrans (chacun revient au précédent au sens strict).
- Vérifié navigateur **de bout en bout** : dépôt (CV + lettre simulés), vérification (2 documents, navigation
  + enregistrement de chacun, écriture réelle de `dossier.cvTexte`/`lettreMotivation` confirmée), entreprise
  (cycle formulaire → incitation → choix d'assistant), choix de l'assistant, écran réponse (export DOCX réel
  sur un faux JSON, `dossier.ia.entretien` rempli), « Terminé » → « Vos documents » ; raccourci
  `ouvrirParcoursEntretien()` depuis une autre page ; détour non destructif ; Retour sur plusieurs écrans ;
  clair + sombre ; 0 erreur console tout du long. `npm test` 713 verts.

**Correctifs post-livraison (2026-09-07, retours de Denis en usage réel)** :
- **Bug réel : boucle Retour dépôt ↔ intro** sur Co-construire ma lettre ET Préparer un entretien. L'écran de
  dépôt (premier écran de travail) utilisait le mécanisme de detour (`_coLettreVoirPresentation()`/
  `_prepaEntretienVoirPresentation()`, prévu pour « Revoir la présentation ») au lieu d'afficher l'intro en
  mode normal - l'intro en detour revient elle-même sur le dépôt via son propre bouton, créant une boucle à 2
  écrans au lieu de continuer à reculer vers l'accueil de la carte. Nouvelles fonctions
  `_coLettreRetourIntro()`/`_prepaEntretienRetourIntro()`, même patron que `_prepLERetourIntro()` (« Préparer
  ma lettre et mon entretien ») et `ctRetourDepuisCollecte()` (Cohérence, déjà correct). « Revoir la
  présentation » (bande du haut) garde le mécanisme de detour, inchangé.
- **Ajout demandé : « Ou coller le texte » pour le CV ET la lettre dans Préparer un entretien** - ce module
  n'offrait que le dépôt de fichier, contrairement aux autres modules migrés. Ajouté sans toucher
  `analyserDocumentDepose()` (réservée aux vrais fichiers) : construit directement un résultat d'analyse
  équivalent (`texteDisponible: true`) quand le texte est collé.
- Vérifié navigateur : les 2 boucles ne se reproduisent plus (Retour continue bien vers l'accueil de la
  carte), Cohérence re-vérifiée sans régression, collage CV + lettre testé de bout en bout jusqu'à l'écran de
  vérification, clair + sombre, 0 erreur console. `npm test` 713 verts.
- **Consolidation demandée : les 3 écrans « Préparer un entretien » fusionnés en UNE SEULE page.** Retour de
  Denis : « Je ne veux pas avoir des fenêtres séparées [...] entreprise et poste visé soient sur la même page
  que lorsque je saisis le CV et la lettre de motivation. Tout ça, ça doit être visible sur la même page. »
  Les anciens écrans `depot` (fichier/texte), `verification` (avec flèches précédent/suivant entre documents)
  et `entreprise` (formulaire + incitation) deviennent 3 blocs `<details class="bloc-depli">` successifs
  d'une page unique `_prepaEntretienRendrePreparer()` (même patron que `ctHtmlCollecte()`/Cohérence et
  `htmlPreparerLettreEntretienDepliante()`/« Préparer ma lettre et mon entretien »). Contrainte technique
  respectée : `htmlVerificationDocument()`/`cablerVerificationDocument()` utilisent des ids DOM fixes (une
  seule instance possible à la fois dans toute l'appli) - seul le « document actif »
  (`_prepaEntretienDocActif()`, CV avant lettre) affiche le composant de vérification ; l'autre document, s'il
  est lui aussi en attente, affiche un simple message « en attente », jamais une 2e instance. L'avancement
  d'un bloc au suivant se fait par un re-rendu complet après chaque changement d'état (aucune fonction
  d'avancement dédiée : la logique « quel bloc est actif » est recalculée à chaque appel).
  - État renommé : `_prepaEntretienEtatDepot`/`_prepaEntretienDocuments`/`_prepaEntretienIndexDoc`/
    `_prepaEntretienEntrepriseEcran`/`_prepaEntretienPosteIncitation` → `_prepaEntretienDoc` (`{cv, lettre}`,
    chacun `null` | `'skip'` | objet document) + `_prepaEntretienEntrepriseAutoSkipFait`.
  - Écrans du dispatcher : `'depot'`/`'verification'`/`'entreprise'` fusionnés en `'preparer'`.
  - **Bug réel corrigé avant mise en ligne** : `dossier.entretienDirect` vaut par défaut `{structure:'',
    poste:''}` (js/app.js) - donc TOUJOURS un objet « vrai » (truthy). Une vérification naïve
    `if (dossier.entretienDirect)` aurait affiché le bloc entreprise comme « déjà validé » dès l'ouverture du
    module, sans que rien n'ait été saisi. Nouvelle fonction `_prepaEntretienEntrepriseValidee()` (vérifie un
    poste réellement renseigné) utilisée partout à la place.
  - « Modifier » (bloc entreprise) réinitialise `dossier.entretienDirect = null` sans être aussitôt écrasé par
    le saut automatique - protégé par le drapeau `_prepaEntretienEntrepriseAutoSkipFait` (ne saute qu'une
    seule fois par session).
  - Vérifié navigateur de bout en bout : les 3 blocs visibles sur une seule page dès l'entrée, dépôt CV par
    texte collé → bloc 1 passe en vérification → « Enregistrer » → bloc 2 (lettre, « Je n'en ai pas ») → bloc
    3 (formulaire entreprise/poste, plus de faux « Modifier » au premier passage) → validation → « Choisir mon
    assistant » activé → `dossier.cvTexte`/`cvAnalyse`/`entretienDirect` bien renseignés → transition réelle
    vers l'écran « Choisissez votre assistant ». Retour depuis ce dernier écran ramène bien à la page
    « Préparer » (pas de saut direct à l'intro/l'accueil, conforme RC-03). Retour depuis « Préparer » → intro
    en mode normal → Retour depuis l'intro → accueil de la carte (pas de boucle). « Revoir la présentation »
    (detour) puis « Revenir au module » restituent la page « Préparer » avec l'état intact (non destructif).
    « Modifier » sur le bloc entreprise réinitialise bien sans être ré-écrasé. Clair + sombre (900×1400),
    0 erreur console tout du long. `npm test` 713 verts.
  - **Vérification complémentaire demandée par Denis (dépôt par vrai fichier + clavier)**, faite après coup
    sur la page déjà committée (aucun changement de code, uniquement des tests) :
    - **CV et lettre déposés par vrai fichier** (pas seulement texte collé) : un `.txt` réel (upload via un vrai
      `File`/`DataTransfer`, `input[type=file]` déclenché normalement) est bien lu par `analyserDocumentDepose()`
      / `lireFichierCV()`, bascule le bloc en vérification texte avec le contenu exact, et
      `dossier.cvTexte`/`dossier.lettreMotivation.texte` sont bien renseignés après « Enregistrer ». Un `.png`
      réel bascule bien sur l'éditeur image partagé (rotation + masquage par rectangles glissés à la souris sur
      le canvas, vérifiés dans l'état ET visuellement) pour le CV ET pour la lettre, avec le bon titre dans
      chaque cas (« Vérifier votre CV » / « Vérifier votre lettre de motivation »). « Changer » réinitialise
      bien le bloc après un vrai fichier enregistré.
    - **Formulaire « Entreprise et poste visé » au clavier réel** (pas de simulation JS) : majuscule automatique
      sur les deux champs, Entrée fait avancer de Poste vers Entreprise, Entrée sur le dernier champ déclenche
      la validation (directe si l'entreprise est remplie, incitation sinon), « Compléter maintenant » remet le
      focus sur le champ Entreprise pour une nouvelle saisie + validation par Entrée. Un point d'outillage
      relevé en passant, **pas un bug applicatif** : dans cet environnement de test, une touche Entrée simulée
      sur un `<button>` focus ne déclenche pas son activation native (le clavier physique/un vrai navigateur le
      ferait sans code applicatif, c'est un comportement HTML natif) - vérifié à la place par clic direct.
    - 0 erreur console sur l'ensemble.

**Chantier des 3 modules entièrement terminé.** Les 3 cartes (Co-construire ma lettre, Cohérence de mon
dossier, Préparer un entretien) déposent désormais leurs documents sur de vraies pages, plus aucune fenêtre
modale de saisie de document (les seules fenêtres restantes - confirmation avant redirection vers l'assistant,
repli photo/scan de `ouvrirAssistantDepotCV` - sont des mécanismes déjà partagés et acceptés partout ailleurs
dans l'app, hors périmètre de la demande de Denis).

## Tâche ajoutée par Denis (2026-09-04), APRÈS ces 3 modules

Une fois les 3 modules ci-dessous migrés : audit complet du bouton Retour sur **tous** les modules de
l'app (pas seulement les 3 bugs déjà trouvés par l'audit RC-03 du 2026-09-04), détecter les destinations
encore incohérentes, et les corriger. Denis s'attend à ce qu'il en reste peu (la plupart déjà corrigés).

## État d'avancement

- [x] **Étape 1 : Co-construire ma lettre de motivation — FAIT le 2026-09-04.** Denis a validé le plan tel
  quel et donné autonomie complète (« vas-y, commence par Coécrire... tu fais ça en totale autonomie »),
  sans repasser par une maquette dédiée (« je connais la maquette, je connais la page préparation, c'est
  exactement comme on a sur les autres modules »).
- [x] **Étape 2 : Cohérence de mon dossier — FAIT le 2026-09-04.**
- [x] **Étape 3 : Préparer un entretien — FAIT le 2026-09-04. Chantier des 3 modules TERMINÉ.**

### Détail de l'étape 2 (Cohérence de mon dossier)

`ctDemarrerCollecte()` → `ctOuvrirCollecteComplement()` (cascade de 4 fenêtres : CV → lettre → entretien
facultatif → offre/entreprise/questions) remplacée par UNE page à 4 blocs dépliants (`ctHtmlCollecte()`/
`ctRendreCollecte()`/`ctBrancherCollecte()`), même langage visuel `.bilan-preparer` que « Préparer » :

- **État** : `_ctEnCollecte` (bool), `_ctCollecteEtat` (`{cv, lettre, entretien, questionsPersonne}`),
  persistant tant que le module n'est pas quitté - non détruit par un aller-retour Retour/Je commence.
- Chaque bloc (CV, lettre, entretien) reste indépendant : `obtenirOuDeposerTexteCV()` /
  `ctObtenirOuDeposerTexteLettre()` / `ctObtenirOuDeposerTexteEntretien()` **non touchées** (elles
  vérifient déjà un texte existant avant d'ouvrir quoi que ce soit, une seule fenêtre auto-refermée sinon).
  Bloc entretien gagne un bouton « Je n'en ai pas » (skip direct, sans ouvrir de fenêtre du tout).
  Bloc offre/entreprise/question : `bilanCorpsCiblageOffreHTML()` inline (déjà la brique canonique, dette
  B.1), plus la question libre - identique au contenu de l'ancienne fenêtre.
  « Lancer l'analyse » : logique de soumission strictement inchangée (`ctMemoriserCandidatureAppWide()` puis
  `ctDeposerDossier()`, qui ouvre lui-même en interne l'éventuelle relecture de confidentialité restante -
  toujours une seule fenêtre ponctuelle, jamais une cascade).
- **Bascule vers le dispatcher existant** : `pageCoherenceTransversale()` gagne une branche
  `_ctEnCollecte && !dossierExistant && !diagnostic` (avant la branche intro), auto-suffisante comme la
  branche détour. Une fois le dossier déposé, retombe naturellement sur `ctHtmlEtapeChoixIA()` **déjà
  page-based** (dette B.2/RC-03) - aucun changement nécessaire en aval.
- **Retour, conforme RC-03** : l'écran de collecte n'a qu'un seul état possible en amont (rien n'existe
  encore) - Retour ramène à la présentation, non destructif (`_ctCollecteEtat` préservé).
- **Cas `SaisieInexploitable`** (le diagnostic revient en disant que le CV/la lettre ne sont pas
  exploitables) : le bouton « Revenir au dépôt » vide le dossier/diagnostic (`ctStoreReinitialiser()`) et
  atterrit directement sur une collecte neuve, au lieu de rouvrir `ctDemarrerCollecte()`.
- Vérifié navigateur **de bout en bout** : dépôt CV (fichier collé + relecture/masquage + enregistrer,
  mécanisme interne inchangé), dépôt lettre, « Je n'en ai pas » pour l'entretien, bloc offre affiché, «
  Lancer l'analyse » → dossier réellement créé → atterrit sur l'écran « Choisissez votre assistant »
  existant ; Retour testé (non destructif, CV reste déposé après un aller-retour) ; « Changer de CV » testé ;
  clair + sombre ; 0 erreur console tout du long. `npm test` 713 verts.

### Détail de l'étape 1 (Co-construire ma lettre de motivation)

La cascade de 4 fenêtres (`ouvrirDepotLettreV1` → `ouvrirChoixAssistantLettreV1` → `ouvrirFenetreAssistantIA`
→ `ouvrirRecuperationLettreV1`) est remplacée par 3 vraies pages routées, même patron que Cohérence
transversale (état en variables de module, dispatcher dans `pageCoLettre()`) :

- **État** : `_coLettreEcran` (`'intro'|'depot'|'choix-assistant'|'reponse'`), `_coLettreDetour`,
  `_coLettreDocument` (`{type, valeur}`), `_coLettreReponseEstImage`/`_coLettreReponseTexteCv`.
- **`_coLettreRendreDepot()`** : même langage visuel que le Bloc 1 de la page « Préparer » dépliante
  (`.bilan-preparer`, réutilisée telle quelle - brique visuelle partagée, pas une classe à renommer).
  Bouton « Déposer mon fichier » → **même mécanisme inchangé** `ouvrirAssistantDepotCV('pret', ...)` (une
  seule fenêtre, se referme d'elle-même - ce n'est pas ce qui posait problème), plus une option « Ou coller
  le texte » inline (pas de fenêtre du tout), pour coller au comportement des autres modules comme demandé.
- **`_coLettreRendreChoixAssistant()`** : composant partagé `htmlChoixAssistantBilanCorps()` (dette B.2), au
  lieu d'une liste de boutons maison.
- **`_coLettreRendreReponse()`** : contenu et mécanismes **strictement inchangés** (décompte, popup bloqué,
  « je suis de retour », collage instantané, analyse JSON, génération DOCX) - seul le conteneur change (page
  au lieu de `ouvrirFenetreERIP()`). « Terminé » navigue vers « Vos documents » au lieu de fermer une fenêtre.
- **`ouvrirFenetreAssistantIA()` non touchée** : ce n'est pas une fenêtre de saisie de document, c'est la
  même confirmation brève déjà partagée par les 4 autres parcours (Bilan/Cohérence/Découverte/page Action),
  qui se referme d'elle-même dès le clic sur « Je comprends, continuer ».
- **Retour, conforme RC-03** : chaque écran revient au précédent au sens strict (dépôt ← intro en detour,
  choix-assistant ← dépôt, réponse ← choix-assistant), jamais un saut direct à l'accueil ni un aller-retour.
- **Bug de mode sombre corrigé au passage** : `#EFF6FF` (encart « Copier mon CV ») était déjà figé dans
  l'ancienne fenêtre, jamais theme-aware - passé en `var(--accent-bg-subtle)`.
- Vérifié navigateur **de bout en bout** : intro → dépôt (coller le texte) → choix assistant → écran de
  confirmation (inchangé) → écran réponse (décompte/popup bloqué/collage/export DOCX réel testé avec un faux
  JSON) → « Terminé » → atterrit sur « Vos documents » avec `dossier.ia.lettre` rempli ; Retour testé sur les
  3 écrans ; détour « Revoir la présentation » testé aller-retour (non destructif) ; reprise (« vous avez déjà
  travaillé une lettre ») testée ; clair + sombre sur les 4 écrans ; 0 erreur console tout du long. `npm test`
  713 verts (fichier non couvert par les tests Node, vérification navigateur obligatoire - faite).
