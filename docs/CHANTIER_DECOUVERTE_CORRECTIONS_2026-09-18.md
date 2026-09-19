# Corrections post-chantier "2e passage IA" de Découverte (liste Denis, 2026-09-18)

> **CHANTIER CLOS le 2026-09-19** — les 10 points de la liste de Denis sont faits et
> committés (voir tableau ci-dessous). Seule la question annexe du point 3 (remplacement
> complet de "Compléter mon CV") reste en suspens, à reproposer à Denis, jamais à lancer
> seul. Ce fichier reste comme trace de la discussion et du détail technique.

> Compactage de conversation imminent au moment où ce fichier est écrit — à lire en entier
> avant de reprendre. Le chantier `docs/CHANTIER_DECOUVERTE_2E_PASSAGE_REDACTION.md` est
> clos (8 sous-étapes faites), mais Denis a testé le résultat et a trouvé un vrai bug
> critique + une longue liste de corrections d'interface. Ce fichier documente cette 2e
> liste, l'état exact d'avancement, et ce qu'il reste à faire.

## Contexte

Après la clôture du chantier initial, Denis a testé et été très déçu ("grosse merde",
40 minutes de son budget de session perdues). Deux points distincts :
1. Un **vrai bug fonctionnel** (accroche/titre choisis n'apparaissaient jamais sur le CV) —
   trouvé et corrigé en premier, avant même la liste.
2. Une **liste de 9 corrections d'interface**, donnée point par point par Denis, à traiter
   dans l'ordre, un commit + un test navigateur par point (même discipline que le chantier
   d'origine). Denis a explicitement dit "on ne code rien tant que je n'ai pas donné le feu
   vert" puis, une fois la liste complète donnée : "c'est tout, on peut coder".

**Mode de travail** : Mode B (exécution cadrée) — le quoi/pourquoi sont tranchés par Denis,
j'avance seul sur le comment, je montre le résultat par blocs. Un commit par point, `npm
test` + test navigateur réel à chaque fois (jamais juste "ça devrait marcher").

## Bug corrigé AVANT la liste (déjà committé, `6a71e87`)

`etapeRelectureCV()` (étape 12, "Choisir ce qui ira sur votre CV") écrasait
`_onValiderRelectureIACV` au lieu de l'envelopper. `appliquerBrouillonChoixIACV()` est une
fonction PURE (calcule et renvoie les valeurs, n'écrit jamais dans `dossier` elle-même) —
c'était le handler déjà posé par `wireImportIA()` à l'import réussi qui faisait le vrai
travail d'écriture (`dossier.titreCV`, `dossier.ia.cv.*`). Corrigé : capture le handler déjà
en place, le laisse s'exécuter intégralement, puis enchaîne sur `terminerParcoursDecouverte()`.

## La liste de Denis (10 points, dans l'ordre donné)

1. Remplacer "Ce que vous visez" (section 3 de "Préparer") par l'écran partagé "Votre
   objectif" (`pageObjectif()`, js/app.js) — les 6 cartes `OBJECTIF_CHOIX_CANDIDATURE` +
   `CONFIG_BLOC_CANDIDATURE` + `CONFIG_BLOC_PROJET`. **[FAIT — commit `326693e`]**
2. Un seul bouton Retour par écran (celui du bandeau du bas avec Accueil), avec le
   comportement "recul pas à pas" (celui qu'avait l'ancien bouton dans la page, supprimé).
   **[FAIT — commit `1a8b5c7`]**
3. "Compléter mon CV" : Certifications/Engagement/Savoir-faire personnel ne doivent plus
   ouvrir de fenêtre (`ouvrirFenetreCatalogue`) pour parcourir des exemples — remplacé par un
   menu déroulant en page (option "Recommandée" choisie par Denis, moins riche qu'une vraie
   reconstruction en page de la fenêtre mais beaucoup plus sûr). **[FAIT — commit `482b128`]**
   Un 2e endroit non prévu a été trouvé en testant (clic sur "Oui" ouvrait AUSSI directement
   la fenêtre, en plus du bouton dédié) — corrigé dans le même commit.
   **Question posée par Denis en cours de route, non tranchée** : existe-t-il une page/un
   module déjà fait avec une meilleure présentation visuelle pour remplacer tout
   "Compléter mon CV" (comme le fait `CONFIG_BLOC_PARCOURS`/`CONFIG_BLOC_COMPLEMENTS` de "Vos
   informations", même style que ce qui a été fait pour "Vos expériences" au point 5/6) ?
   Réponse donnée : oui ça existe, mais c'est un chantier à part (le système actuel de
   paliers séquentiels est très travaillé, un vrai swap perdrait ce comportement). Denis a
   répondu "Continue la liste" — donc **reporté, pas tranché, à reproposer après la liste**.
5. Sur "Vos expériences" (étape 9), "Modifier cette expérience" doit rester dans la page,
   jamais une fenêtre. **[FAIT avec le point 6 — commit `f962e6c`]**
6. "Ajoutez vos expériences" ne doit plus faire doublon avec la liste déjà affichée, doit
   être en page. **[FAIT avec le point 5 — commit `f962e6c`]** — solution : les deux points
   sont résolus ENSEMBLE en remplaçant tout le rendu de l'étape 9 par le bloc ERIP partagé
   `CONFIG_BLOC_EXPERIENCES_PRO` (`blocERIP()`/`wireBlocERIP()`, js/app.js), rendu EN PAGE
   (jamais `ouvrirFenetreERIP`) — un seul bloc qui montre déjà liste + modifier + ajouter.
7. Avant le 2e passage IA (avant "Choisissez votre assistant" pour la rédaction), il manque
   l'écran "style d'écriture" (l'équivalent de "Adaptation au métier"), déjà utilisé ailleurs
   dans l'app. **[FAIT — commit `26efdbb`]** Nouvelle étape 10, renumérotation 11/12/13.
8. Sur "Choisir ce qui ira sur votre CV" (relecture), les blocs "Points forts" et "Mots
   clés" sont trop grands / mal agencés (trop d'espace vide). **[FAIT — commit `788fbbf`]**
   Flèches Monter/Descendre côte à côte au lieu d'empilées sur `.reco-liste-grille`
   (bénéficie aussi à compétences/postes recommandés/rubriques à masquer/certifications,
   même composant partagé).
9. Sur la page finale "Vos documents"/"Mon CV", il ne doit plus être possible d'ajouter/voir
   les expériences professionnelles (le bloc `sectionExperiences` est en trop, l'édition des
   expériences est déjà finie à l'étape 9). **[FAIT — commit `c2004de`]** Bloc entièrement
   retiré (plus seulement masqué), câblage mort retiré avec lui.
10. Bug : l'accroche choisie n'apparaissait pas sur le CV. **[CORRIGÉ AVANT LA LISTE, voir
    plus haut, commit `6a71e87`]**

## Point 4 (retirer l'écran récapitulatif de "Compléter mon CV") — FAIT (commit `3c8eeaf`)

Demande de Denis : une fois les 4 rubriques (Mobilité/Formation/Engagement/Savoir-faire)
complétées, il ne veut plus voir l'écran récapitulatif intermédiaire ("Voici ce que vous
avez indiqué...") avant d'arriver sur l'étape suivante — puisqu'on peut déjà tout modifier en
direct dans les onglets (surtout vrai depuis le point 3).

**Piège découvert en creusant le code (important, à ne pas re-perdre)** : l'écran
récapitulatif n'était PAS que cosmétique. C'est en cliquant sur son bouton "Continuer" que
se déclenchait la VRAIE transmission de `infos.formation`/`infos.engagement`/
`infos.savoirFairePerso` (les valeurs tapées dans les champs texte, pas encore dans
`dossier`) vers `dossier.formations`/`dossier.engagements`/`dossier.experiencesPerso`, PUIS
`calculerStrategieSiBesoin()` + `finaliserMappingDossier()` + `afficherEtape(9)`. Simplement
cacher/retirer l'écran sans préserver ce déclenchement aurait fait perdre ces 3 informations
en silence (Mobilité et les catalogues Certifications/Formations, eux, écrivent déjà
directement dans `dossier` à chaque ajout — pas concernés par ce risque).

### Ce qui est DÉJÀ fait (édité mais PAS ENCORE testé ni committé)

Dans `modules/decouverte-competences/decouverteParcours.js`, à l'intérieur de
`etapeMobilite()` :

1. `apresValidationBloc(cle)` : ne pose plus `etat.modeRecapInfoCompl = true` — renvoie
   désormais `true`/`false` (`true` = tous les blocs sont validés).
2. Nouvelle fonction `avancerOuTerminerInfoCompl(cle)` (juste après `apresValidationBloc`) :
   point d'entrée unique — si `apresValidationBloc(cle)` renvoie `true`, appelle
   `transmettreEtTerminerInfoCompl()` ; sinon `afficherEtape(8)` comme avant.
3. Nouvelle fonction `transmettreEtTerminerInfoCompl()` (juste après) : contient la
   transmission complète (extraite telle quelle de l'ancien `onContinuer`, branche "toutes
   validées") — écrit `dossier.formations`/`dossier.engagements`/`dossier.experiencesPerso`
   à partir de `infos.formation`/`infos.engagement`/`infos.savoirFairePerso`, puis
   `calculerStrategieSiBesoin()` + `if (finaliserMappingDossier()) { afficherEtape(9); }`.

### CE QU'IL RESTE À FAIRE (dans l'ordre)

1. **Remplacer les 6 call sites restants** de `apresValidationBloc(cle); afficherEtape(8);`
   (ou variante) par `avancerOuTerminerInfoCompl(cle);` — chercher `apresValidationBloc(`
   dans le fichier, il doit en rester exactement 6 après la définition + le nouvel appel
   dans `avancerOuTerminerInfoCompl` :
   - Le clic sur `[data-valider-bloc]` (bouton centré de chaque onglet) —
     `apresValidationBloc(cleValidee); afficherEtape(8);` → `avancerOuTerminerInfoCompl(cleValidee);`
   - Le clic sur `permisNon` (Mobilité) — `apresValidationBloc('mobilite'); afficherEtape(8);`
     → `avancerOuTerminerInfoCompl('mobilite');`
   - Le `btnNon` générique (boucle `['engagement', 'savoirFairePerso']`) —
     `infos[cle].actif = false; infos[cle].valide = true; apresValidationBloc(cle); afficherEtape(8);`
     → garder les 2 premières affectations, remplacer la fin par `avancerOuTerminerInfoCompl(cle);`
   - Le `keydown` Entrée sur le champ texte (même boucle générique) — même remplacement.
   - Dans `onContinuer` (bouton "Continuer" du bas de page), DEUX occurrences à l'intérieur
     du `if (!(toutesValideesInfoCompl && etat.modeRecapInfoCompl)) { ... }` (voir point 2
     ci-dessous, ce `if` disparaît lui-même) : la branche `confirmerAction(...)` ("Continuer
     quand même") et la branche principale juste après — les deux deviennent
     `avancerOuTerminerInfoCompl(cleActiveContinuer);`.
2. **Supprimer le bloc dupliqué dans `onContinuer`** : après les 2 remplacements ci-dessus,
   tout le code qui suit (l'ancienne branche "toutes validées" — `dossier.informationsNonClassees = ...`
   jusqu'à `if (finaliserMappingDossier()) { afficherEtape(9); }`) est désormais un DOUBLON
   de `transmettreEtTerminerInfoCompl()` et doit être supprimé entièrement. `onContinuer`
   devient beaucoup plus court : calcule `cleActiveContinuer`, gère la confirmation "jamais
   commencé", puis `avancerOuTerminerInfoCompl(cleActiveContinuer)` dans les deux branches.
   Le test `if (!(toutesValideesInfoCompl && etat.modeRecapInfoCompl))` doit disparaître
   complètement (plus besoin, `avancerOuTerminerInfoCompl` gère déjà ce cas en interne).
3. **Supprimer l'écran récapitulatif dans le rendu** (`contenuPrincipalInfoCompl`) : retirer
   la branche `if (toutesValideesInfoCompl && etat.modeRecapInfoCompl) { ...récap... } else { ...onglets... }`
   — ne garder QUE le code des onglets (`bulletBoutons` + `bulletPanneaux`), toujours affiché.
   Retirer aussi le calcul de `toutesValideesInfoCompl` s'il devient inutilisé ailleurs
   (vérifier par grep avant de supprimer).
4. **Retirer `etat.modeRecapInfoCompl`** entièrement :
   - Sa déclaration/initialisation (dans l'objet `etat`, chercher `modeRecapInfoCompl: null,`).
   - Le câblage `[data-modifier-infocompl]` dans `onAfficher()` (bouton "Modifier" de l'écran
     récap, n'existe plus) — à supprimer, vérifier qu'il ne sert à rien d'autre avant.
   - Vérifier si `TITRES_BLOCS` et une éventuelle fonction `resumeBlocInfoCompl` deviennent
     mortes (elles ne servaient peut-être qu'au récap) — grep avant de supprimer, `TITRES_BLOCS`
     sert aussi aux libellés des onglets (`bulletBoutons`), donc probablement à GARDER ;
     `resumeBlocInfoCompl` était peut-être SEULEMENT pour le récap, à vérifier précisément.
5. **Tester au navigateur** : parcours complet des 4 rubriques via les onglets (Mobilité
   Non, Formation "Sans diplôme" + Certifications Non + Formations Non, Engagement avec un
   exemple du menu déroulant + Oui, Savoir-faire avec un exemple), vérifier qu'une fois la
   DERNIÈRE rubrique validée, on atterrit DIRECTEMENT sur l'étape 9 "Vos expériences" sans
   jamais voir d'écran récapitulatif. Vérifier `dossier.formations`/`dossier.engagements`/
   `dossier.experiencesPerso` contiennent bien les entrées saisies (regarder dans la console :
   `JSON.stringify(dossier.engagements)` etc.). Vérifier aussi la non-régression du bouton
   "Continuer" du bas de page sur une rubrique commencée mais incomplète (doit encore avancer
   à la rubrique suivante), et la boîte de confirmation "Continuer sans rien renseigner ?"
   sur une rubrique jamais touchée.
6. `npm test` (931 attendus) + `node -c modules/decouverte-competences/decouverteParcours.js`
   avant de committer.
7. Commit avec message référençant "point 4 de la liste de corrections de Denis (2026-09-18)".

## Points 7, 8, 9 — PAS ENCORE COMMENCÉS

### Point 7 — écran "style d'écriture" avant la rédaction IA

Insérer un nouvel écran entre l'étape 9 (Vos expériences) et l'actuelle étape 10 (Choisissez
votre assistant, rédaction) : réutiliser `contenuRectangleStyleCV(docActif, masquerBoutonValider,
situationObligatoire)` + `wireRectangleStyleCV(docActif, rerender)` (js/app.js, autour des
lignes 10145/10206 — à re-vérifier, le code a pu bouger). C'est le même composant que
"Adaptation au métier" pour "Créer un nouveau CV"/pageResultats/pageAssistant. Options de
style : niveau de poste, niveau de langage, adaptation métier, ton, longueur, + un groupe
facultatif "Votre situation en ce moment".

**Important** : appeler `appliquerDefautsStyleCV(docActif)` (js/app.js, ~ligne 10117) AVANT
le rendu, comme le font `pageAssistant()` et `pageResultats()` — sinon les valeurs par défaut
ne sont jamais posées.

**Renumérotation nécessaire** (comme pour l'ajout des étapes 9-12 dans le chantier d'origine) :
- Nouvelle étape technique 10 = "Réglez le style d'écriture" (nouvelle fonction, ex.
  `etapeStyleEcritureCV()`).
- L'ancienne étape 10 (Choisissez votre assistant) devient 11.
- L'ancienne étape 11 (Collez la réponse) devient 12.
- L'ancienne étape 12 (Relecture) devient 13.
- Mettre à jour `obtenirDefinitionEtape()` (les branches `if (numero === X)`).
- Mettre à jour `_decouverteNavIndex` (table `[null, 0, 0, 0, 1, 2, 3, 3, 4, 5, 5, 5, 5]` —
  ajouter un index pour le numéro 13, tous mappés sur le repère 5 "Rédiger mon CV" comme les
  autres étapes de cette section).
- Étape 9's `onContinuer` doit pointer vers la NOUVELLE étape 10 (déjà le cas si on insère
  proprement — vérifier).
- La nouvelle étape 10 (style) doit avoir son propre `onContinuer: function () { afficherEtape(11); }`.
- Étape 11 (ex-10, choix assistant) : son bouton "Retour" par défaut (numero - 1) ramènera
  maintenant sur la nouvelle étape 10 (style) au lieu de l'étape 9 — comportement cohérent,
  pas de cas spécial à ajouter dans `agirRetourDecouverte()`.

Tester : écran affiché avec les bonnes valeurs par défaut, modification d'un réglage, clic
Continuer → arrive bien sur "Choisissez votre assistant", `dossier.preferencesIAParType.cv`
contient les réglages choisis, aucune régression sur le reste du parcours.

### Point 8 — "Points forts"/"Mots clés" trop grands sur l'écran de relecture

Écran "Choisir ce qui ira sur votre CV" (étape 13 après le point 7). Le contenu vient de
`genererEcranChoixReponseIACV()` (js/app.js) — fonction PARTAGÉE avec pageResultats/
pageAssistant (maj/pret/nouveau). Trouver la portion HTML/CSS qui rend les sections "Points
forts" et "Mots clés" (probablement des `<div>` avec des flèches ▲▼ de réordonnancement, vus
dans un test navigateur précédent) et resserrer l'espacement (moins de padding/margin, peut-
être une disposition plus compacte). **Attention** : c'est un composant PARTAGÉ — vérifier
que la modification profite aussi aux autres parcours (maj/pret/nouveau) sans rien casser
visuellement là-bas (test navigateur sur "Créer un nouveau CV" ou "Mettre à jour mon CV" en
plus de Découverte).

### Point 9 — retirer le bloc "Expérience professionnelle" de la page finale

Dans `js/app.js`, fonction `pageResultats()`, chercher la variable `sectionExperiences`
(autour de la ligne 17390-17410 dans une version antérieure du fichier — a pu bouger).
Actuellement : `if (cvComplet && depuisDecouverte) { ... construit sectionExperiences avec
les cartes + bouton "Ajoutez vos expériences" ... }`. Demande de Denis : ce bloc ne doit plus
apparaître du tout sur cette page finale pour Découverte (l'édition des expériences est déjà
terminée à l'étape 9 du parcours). Solution la plus probable : supprimer purement ce bloc
(ou son affichage) quand `depuisDecouverte` est vrai — vérifier d'abord si `sectionExperiences`
sert à autre chose ailleurs sur cette page avant de le retirer (grep `sectionExperiences`
dans js/app.js). Tester qu'aucun autre parcours (nouveau/maj/pret) n'est affecté (ce bloc est
`if (cvComplet && depuisDecouverte)`, donc a priori scopé à Découverte uniquement — à
confirmer en lisant le code avant de toucher).

## Question en suspens (point 3, non tranchée par Denis)

Denis a demandé s'il existe une meilleure page/un meilleur visuel déjà fait pour remplacer
ENTIÈREMENT "Compléter mon CV" (comme le composant `blocERIP`/`CONFIG_BLOC_PARCOURS`/
`CONFIG_BLOC_COMPLEMENTS` utilisé par "Vos informations", même esprit que ce qui a été fait
pour "Vos expériences" aux points 5/6). Réponse donnée : oui, ça existe, mais le système de
paliers séquentiels actuel de Découverte est très travaillé (nombreux correctifs documentés
dans les commentaires) — un vrai remplacement perdrait ce comportement, à faire comme un
chantier séparé si Denis le souhaite après la liste actuelle. Denis a répondu "Continue la
liste" — donc ne PAS lancer ce chantier de soi-même, seulement si Denis le redemande
explicitement après avoir fini les points 4, 7, 8, 9.

## Discipline à respecter pour la suite (rappel)

- Un commit par point, `npm test` (931 verts attendus) + test navigateur réel avant chaque
  commit — jamais "ça devrait marcher".
- Message de commit en français, sans tiret cadratin, se terminant par la ligne d'attribution
  habituelle (`Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`).
- Denis est déjà très éprouvé par ce chantier (session précédente très longue, frustration
  réelle) — réponses courtes, pas de pavé, annoncer les résultats simplement.
- Une fois les points 4, 7, 8, 9 terminés, redemander à Denis s'il veut rouvrir la question
  du point 3 (remplacement complet de "Compléter mon CV").
