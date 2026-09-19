# État de la refonte du parcours guidé — 2026-09-02 (soir)

> Point de reprise. Tout ce qui suit est **committé** sur `master`.
> Chantier : « Refonte de la carte Mes documents », sous-phase « allègement /
> refonte du parcours guidé Créer un nouveau CV ».
> Point d'entrée : `docs/PLAN_CONSOLIDE_REFONTE_PARCOURS_GUIDE_2026-09-02.md`.
> Aucune ligne de code applicatif écrite : on est en phase **maquettes**.

## Vocabulaire tranché

Barre d'étapes à la 2e personne partout : **Votre objectif · Votre parcours ·
Vos informations · Votre profil · Assistant · Vos documents**. Sweep global
« Mon/Mes → Votre/Vos » du reste de l'app = chantier séparé après.

## Les maquettes (docs/, HTML autonomes, testées navigateur clair + sombre)

| Écran | Fichier | Version | État |
|---|---|---|---|
| Votre objectif (restructurée) | `MAQUETTE_OBJECTIF_RESTRUCTURE_2026-09-02.html` | v5 | **validée Denis** |
| Vos informations (ex-Mon projet) | `MAQUETTE_MES_INFORMATIONS_2026-09-02.html` | v10 | **validée Denis** (v10 = + bloc « Vos expériences professionnelles » rapatrié) |
| Votre profil (ex-Faire le point) | `MAQUETTE_VOTRE_PROFIL_2026-09-02.html` | v9 | **validée Denis** |
| Assistant | `MAQUETTE_ASSISTANT_2026-09-02.html` | v5 | **validée Denis (2026-09-02)** |
| Vos documents | `MAQUETTE_VOS_DOCUMENTS_2026-09-02.html` | v3 | **validée Denis (2026-09-02)** |
| La mise en page (sous-écran de Vos documents) | `MAQUETTE_MISE_EN_PAGE_2026-09-02.html` | v6 | **validée Denis (2026-09-02)** |
| Carte « Vos coordonnées » (haut de Vos documents) | `MAQUETTE_COORDONNEES_2026-09-02.html` | v1 | **validée Denis (2026-09-02)** |

**Les 7 maquettes sont validées. Décisions §9 du plan consolidé : toutes tranchées
(voir `PLAN_CONSOLIDE_...` §9, commit `613daf8`).** Prochaine étape = phase de code,
ordre §8 du plan consolidé.

### Décisions §9 (2026-09-02)
- **§9.2** « Votre profil » : garder les 2 blocs du questionnaire, renommés :
  « Ce qui fait votre valeur » -> « **Ce que vous aimez** » ; « Ce qui pourrait
  vous correspondre » -> « **Des pistes à explorer** ». Affichés en `nouveau`
  seulement (inchangé).
- **§9.3** Parcours `maj` : garder « **Corriger mon CV** » (`MAJ_CV_NAV_ETAPES`
  ~3367 inchangé sur ce libellé).
- **§9.4** Verrou « Votre objectif » -> « Votre profil » : garder
  `etatAccesRevelation()` **tel quel** (choix du mode de recherche seulement ;
  stage/alternance/immersion passent sans rien).
- **§9.5** Sweep « Mon/Mes -> Votre/Vos » sur le reste de l'app : **chantier
  séparé après**, à tracer dans `TACHES_VALIDEES.md`.
- **§9.1 et §9.6** confirmés par les maquettes (refonte du squelette de « Vos
  documents », machinerie interne réemployée ; toutes les maquettes figées avant
  le code).

## Docs d'appui (committés)

- `PLAN_CONSOLIDE_REFONTE_PARCOURS_GUIDE_2026-09-02.md` — plan maître, §9 décisions.
- `PLAN_MES_INFORMATIONS_2026-09-02.md` — détail « Vos informations » + 2 consignes non négociables.
- `ENQUETE_FAIRE_LE_POINT_2026-09-02.md` — enquête « Votre profil ».
- `ENQUETE_VOS_DOCUMENTS_2026-09-02.md` — enquête « Vos documents », §10 = décisions tranchées.
- `INVENTAIRE_REGLAGES_CV_2026-09-02.md` — **audit exhaustif ~120 réglages** (PDF 66 `id="reg*"` + Word ~30 `data-projetxxl-*` + les 2 dés + boutons). Sections : A zéro effort · B panneau PDF · C panneau Word · D fonctions absentes · E structure cible · F comptage · **G regroupement par intention** · **H récap par niveau** · **I manipulation directe (grand aperçu, PDF only)** · **J recommandations** (J.1 dé, J.2 bouton Mise en page, J.3 rubrique Logiciels, J.4 défauts vérifiés, J.5 formats Word, J.6 défauts A5).
- `REVUE_CRITIQUE_REGLAGES_CV_2026-09-02.md` — **revue critique PDF + Word** : incohérences, réglages morts, améliorations, avec solution concrète + priorité chacun. §5 = récap par priorité. 4 points HAUTE : Word « CV Intégral » caché ; onglet « Rubriques à masquer » avec 🙈 (visage) ; le dé efface le travail manuel sans confirmation ; garantir « vignette = grand aperçu » par une seule fonction de rendu.

## Décisions prises (2026-09-02)

### Structure générale « Vos documents »
1. **Assistant = une page dédiée** (option B). 6 repères dans la barre.
2. **Format d'abord** dans « Vos documents » : Le format (Word/PDF) → La mise en page → Exporter. Toute la page est accessible (pas de verrou « valider chaque rectangle »).
3. **Comparaison Word/PDF affichée dès le choix** : Word = texte modifiable après téléchargement, présentation plus rigide ; PDF = beaucoup plus de liberté de mise en page mais figé. + ligne « emporter le contenu ailleurs (copier le texte) » si aucun ne convient.
4. Export : le format déjà choisi (un seul bouton) + Copier le texte + **Canva** + **ODT** + « Faire aussi une version [l'autre format] ».
5. **« Et après ? »** (lettre / entretien) : gardé en bas de « Vos documents », toujours visible. Retiré : seulement le lien « ateliers / formations / immersions » (`boutonRessourcesFin`).
5bis. **« La mise en page » n'a plus de réglages dans « Vos documents »** (revue 2026-09-02). Le rectangle affiche un mini aperçu + le résumé des réglages (« A4 Détaillé · 2 colonnes · Segoe ») + un bouton « Régler la mise en page → » qui ouvre l'**écran dédié** (`MAQUETTE_MISE_EN_PAGE`, son propre fil d'Ariane « Assistant · Vos documents · La mise en page »). Plus de grille de modèles ici (contredisait « un seul modèle de base »). Export : « Copier le texte » remonté en bouton principal (filet de sécurité). Icône du rectangle : équerre.

### Page Assistant
6. 4 rectangles dépliables : Réglez le style (défauts : ouvrier qualifié / professionnel / adapté au métier / équilibré / équilibrée ; jamais « facultatif ») → Choisissez votre assistant (composant partagé ; sans compte = ChatGPT, Perplexity ; avec compte = Claude, Gemini, Mistral) → Importer la réponse → **Choisir ce qui ira sur le CV** = les 9 onglets réels de `GROUPES_ONGLETS_CHOIX_IA_CV` (Profil, Intitulé, Accroche, Expériences, Compétences à valoriser, Compétences personnelles, Stratégie de candidature, Rubriques à masquer, Formation/expérience perso/loisir), **dans la page, jamais une fenêtre à part**.
7. « Ce qui sera transmis » n'est plus un bloc : bouton discret « Voir ou modifier le texte transmis ».
8. `ouvrirAssistantDepotCV` : **jamais modifié**.
8bis. **Rectangle 1, défauts (revue 2026-09-02, option B)** : 4 réglages pré-remplis (langage = professionnel, vocabulaire = adapté au métier, ton = équilibré, longueur = équilibrée) ; **le niveau du poste reste à choisir**, pas de valeur par défaut (c'est le réglage qui fausse le plus le résultat). NB : dans le code actuel, `dossier.preferencesIA.cv` = tout `null` et le prompt n'ajoute une consigne que si le champ est renseigné. À l'implémentation : soit pré-remplir *et* transmettre les 4, soit garder null mais afficher les 4 valeurs conseillées. Niveau du poste : 6 options (employé → direction). Onglet « Rubriques à masquer » : icône 🚫, jamais 🙈. Onglet 9 : « Formation, expérience perso **et** loisir » (jamais « & »). Cliquer un assistant : écran d'attente puis nouvel onglet.

### Sous-écran « La mise en page » (le plus travaillé aujourd'hui)
9. **Une seule maquette PDF + Word** (variante dans le panneau de démo), structure identique, seule la **liste** des réglages change.
10. **Un seul modèle de base** (plus de grille de modèles).
11. **Trois niveaux** : Simple (Style au hasard + Mise en page + Sobre/Créatif + Complet/Optimisé) · Je débute (couleurs évoluées = accent + accent clair + pipette + 15 bases + nuances + fond colonnes + dégradé + texte sur fond ; + police, format, densité, colonnes) · Je veux tout régler (6 sections par intention : La page / Les couleurs / Le haut de la page / Le texte / Ce qui s'affiche / Reprendre la main ; « Détails » replié par section).
12. **La manipulation directe du PDF** (déplacer / redimensionner / styliser un bloc, régler une rubrique seule, réordonner au glisser-déposer, écrire dans le CV, pipette, imprimer) = **UNIQUEMENT dans l'Aperçu à taille réelle**, **UNIQUEMENT en PDF**. Le menu n'a qu'un renvoi + bouton « Ouvrir l'Aperçu à taille réelle ». Le grand aperçu garde : Style au hasard, Mise en page, Modifier le texte, Pipette, Imprimer + un encart « sur quoi appuyer » + les outils (3 groupes). **Sobre/Créatif et Complet/Optimisé retirés du grand aperçu** (décisions = menu).
13. **Annuler / Refaire** = vraie pile multi-pas ; **garde toujours le format** (Word reste Word, PDF reste PDF) et ne change pas le niveau affiché. Note code : un reset d'un format ne touche jamais l'autre.
14. **Une seule source de vérité** : le mini aperçu de la page et le grand aperçu = le même CV (même état, même fonction de rendu). Bug historique à ne pas reproduire (deux chemins de code séparés : `etatApercuInline.cv` vs iframe PDF vs thème Composeur).
15. **Recommandations J intégrées** : interligne, **espacement des paragraphes** (nouveau), marges, liste des rubriques à afficher/masquer, ordre des rubriques, Annuler/Refaire multi-pas.
   - Le **dé** varie aussi interligne / espacement / marges. **Jamais** les rubriques (contenu, exclu comme lettre jointe / regroupement).
   - Le bouton **Mise en page** joue aussi sur interligne / espacement / marges pour aérer un CV trop court ou condenser un trop long (messages concrets).
16. **Rubrique « Logiciels »** (`dossier.logiciels`, `js/app.js` ~301/8076 — collectée du CV, avait disparu en silence, chantier fait pour lui donner sa ligne + son titre) → ajoutée à la liste des rubriques à afficher/masquer.
17. **Les 5 formats** (A4 Détaillé / A4 Essentiel / A4 Intégral 2 pages / Mini CV A5 Portrait / Mini CV A5 Paysage) : montrés visuellement (l'aperçu prend la vraie taille — le Mini CV A5 est dessiné à moitié de la feuille A4 « fantôme » en pointillés, portrait ≠ paysage à la forme). **Disponibles en Word aussi** (le code Word les a tous : `formatPage` A4 / A4-essentiel / A4-integral / A5 + `modeleA5` portrait|paysage ; « CV Intégral » y est juste masqué jusqu'à un clic = à corriger). Les réglages fins `regFondColonnesA5` / `regEnteteInverseeA5` / `regRemplirPageA5` restent PDF uniquement.
18. **Défauts alignés au code** (`_PDF_ETAT_DEFAUT`) : police = **Segoe** (pas Calibri) ; largeur rectangle « métier visé » = **32 %** ; « mettre en évidence » (6 cases) = **toutes décochées** ; largAccroche 30 ; échelle rubrique 100 ; fond A5 « droite », en-tête inversée A5 off, remplir page A5 off, échelle A5 11. Reste : conforme.
19. **Rappel du format** en haut de « La mise en page » : plus la longue phrase Word « ce que vous voyez est le fichier… ». Un **rappel court et symétrique** (un par format : Word = « vous pourrez encore modifier le texte après téléchargement, mise en page plus sobre » ; PDF = « beaucoup plus de liberté, mais figé une fois créé, pour changer on en refait un ») avec une **croix ×** : fermé = ne revient plus pour ce CV (dans la maquette, revient si on change de format). La comparaison complète Word/PDF reste sur l'écran « Le format » de « Vos documents ».

## Où on en est très précisément sur `MAQUETTE_MISE_EN_PAGE`

Revue Denis section par section (Mode B, du haut vers le bas). **Faits :**
- **Rappel du format** (item 19) : court, symétrique, fermable. `d35e9ba`.
- **Niveau Simple** : « Genre de CV » -> « Allure générale » (+ aide Sobre/Créatif) ;
  « Contenu affiché » -> « Quelles formations montrer » (mots Complet/Optimisé gardés). `444ebcd`.
- **Niveau Je débute** : resserré à 7 lignes ; reprend Allure générale + Quelles formations
  montrer du niveau Simple ; bloc Couleur allégé (accent + bases + pipette + Fond des
  colonnes ; nuances/accent clair/dégradé/texte sur fond renvoyés à Tout régler) ;
  boutons « mon style » retirés d'ici -> placeholder désactivé « à implémenter » dans
  Reprendre la main. `5014d17`.
- **Tout régler / La page** : sous-bloc « Détails » ajouté (comme les autres sections).
  Visibles : Format, Longueur, Colonnes, Marges, Interligne, Espacement, Taille du texte.
  Détails : Colonnes inversées, Largeur colonne gauche, Forme des colonnes, Séparateur,
  Alignement (reco priorité basse, gardée dans Détails). `c8a4729`.
- **Tout régler / Les couleurs** : les 2 carrés de pastilles rendus comme l'accent, avec
  leur valeur par défaut affichée (#e9e9e9, #1b1b1b). `6798317`.
- **Tout régler / Le haut de la page** : « Permuter l'en-tête » retiré (fonction supprimée
  du code, bug réel). Sous-titre « photo » -> « coordonnées ». `3fa5461`.
- **Tout régler / Le texte** : jeton « Simple » -> « Sans décor » (à aligner au libellé
  « Aucun » du code à l'implémentation). `47befb3`.
- **Tout régler / Ce qui s'affiche** : « Titres de rubrique » (veuves) -> « Éviter un titre
  seul en bas de page » (collision de libellé levée) ; « Bloc mis en avant » en Word
  uniquement ; liste des rubriques alignée au code (retrait « Centres d'intérêt » phantom,
  « Bénévolat » -> « Engagements », ajout « Expériences personnelles ») ; défaut
  `formationsMisesEnAvant: false` explicite. `3c7dc87`.
- **Tout régler / Reprendre la main** : conforme, rien à changer ; « Style au hasard » et
  « Mise en page » gardés dans la section (Denis 2026-09-02).
- **Renvois vers l'Aperçu à taille réelle** (« Le haut de la page », « Le texte ») : points
  de suspension retirés ; le reste validé tel quel. `b17e9dc`.
- **Aperçu à taille réelle (PDF)** : barre (Revenir, Style au hasard, Mise en page,
  Modifier le texte, Pipette, Imprimer), encart 7 puces, 3 groupes d'outils validés.
  Fusion des 2 sélecteurs de bloc d'en-tête (« Bloc à déplacer » + « Styliser ce bloc »)
  en un seul « Bloc de l'en-tête concerné ». `acaed19`.
- **Le dé** : varie bien interligne / espacement / marges ; ne touche pas format /
  longueur / rubriques / ordre / lettre jointe / regroupement / accroche ; + il repart
  d'une ardoise vierge (remise à zéro des retouches du grand aperçu), fidèle au code. `0999494`.
- **Mini CV A5 portrait vs paysage** : vérifié. Portrait = rectangle haut et étroit
  (~70 % de la feuille A4 fantôme, ratio 0,71) ; Paysage = rectangle large et court
  (~96 % de large, ~48 % de haut, ratio 1,41). Même forme en mini aperçu et en grand
  aperçu (invariant respecté). Défauts A5 conformes (`fondColonnesA5` droite,
  `enteteInverseeA5` off, `remplirPageA5` off, `echelleA5` 11). Aucune retouche.

**REVUE `MAQUETTE_MISE_EN_PAGE` TERMINÉE (2026-09-02).** Prête à valider par Denis.

## Phase de code (démarrée le 2026-09-02)

Suivre `PLAN_CONSOLIDE_...` §8. Consignes non négociables : zéro régression
fonctionnelle + fidélité stricte aux maquettes. Un commit par sous-étape,
`npm test` + navigateur `nouveau` / `maj` / `pret` + Découverte à chaque fois.

- **Étape 0 FAITE (`347604a`)** : `docs/INVENTAIRE_ETAPE_0_2026-09-02.md` : grep
  complet des libellés à renommer (in-scope vs sweep séparé), inventaire
  GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI des 5 écrans, checklist §6 des lecteurs
  `dossier.*`. **À trancher avec Denis avant l'étape 1** : le sort de la barre
  de repli `ETAPES` (`js/app.js` 3187-3197), renommer maintenant ou sweep séparé
  (elle ne s'affiche que hors des 3 parcours refondus).
- **Étape 1 FAITE (`d1ea3c3`)** : renommage isolé (aucune logique). 3 constantes
  de barre + copie inline de l'intro `pret` (pointe maintenant la constante) +
  barre de repli `ETAPES` + titres `<h1>` des 4 écrans + bouton nav `pageProjet`
  + renvois textuels + titre/alt vidéo `page-projet` + §9.2
  (`CONFIG_BLOC_CORRESPONDANCE` -> « Des pistes à explorer », accordéon -> « Ce
  que vous aimez »). 646 tests verts, vérifié navigateur (nouveau / maj / pret /
  Découverte). **Laissé pour l'étape 5** : le `<h1>` de `pageResultats` en
  parcours `pret` / `maj` reste « Passons à l'action » (écran hub 3 documents,
  distinct), à unifier avec « Vos documents » à la refonte complète.
- **Étape 2 en cours** (3 sous-commits) :
  - **2a FAIT (`d20db64`)** : le bloc `CONFIG_BLOC_CANDIDATURE` s'affiche aussi sur
    `pageObjectif` (sous les cartes, une fois un objectif choisi). Le clic sur une
    carte re-rend au lieu de naviguer ; bouton « Continuer » conditionné par
    `etatAccesRevelation()` (le verrou suit le bloc). Additif : le bloc reste sur
    `pageProjet`. 646 tests verts, vérifié 4 parcours.
  - **2b FAIT (`667aa1d`)** : `CONFIG_BLOC_PROJET` (id `projet` inchangé) devient
    objectif-dépendant : getters `titre`/`icone` (« Le poste que vous recherchez »
    hors immersion / « Vos disponibilités » pour stage-alternance-pmsmp), `sousSections()`
    filtré (contrat+temps+j'accepte OU disponibilité). `_SOUS_SECTIONS_PROJET` = source
    unique. `definirObjectifCandidature` nettoie aussi contrat/temps/accepte au passage
    à l'immersion. `pageObjectif` affiche le bloc sous Candidature. Reste sur `pageProjet`.
    646 tests verts, vérifié navigateur (offre / stage / switch / pret modeAllege).
  - **2c FAIT (`e8316c2`)** : blocs Candidature + Projet retirés de `pageProjet`.
    `nouveau`/`maj` : Vous / Parcours / Expériences perso / Compléments. `pret`
    (`modeAllege`) : Vous seul. Verrou retiré de `pageProjet` (« Continuer » toujours
    actif) ; le verrou `etatAccesRevelation()` reste sur `pageObjectif`. Le wizard
    `pret`/`maj` ne saute plus « Votre objectif » (`data/metiers.js`
    `naviguerVers('objectif')` toujours). 646 tests verts, vérifié bout-en-bout
    (nouveau / maj / pret / Découverte).
  - **Étape 2 TERMINÉE.** Reste en dette visuelle (à traiter en étape 6 ou passe finale) :
    le message « Merci de bien renseigner » s'affiche sur le bloc facultatif « Le poste
    que vous recherchez » (la maquette montrait un badge « facultatif »).
- **Étape 3 en cours** : « Vos informations » allégé, suivre
  `docs/PLAN_MES_INFORMATIONS_2026-09-02.md` §5. Tester Découverte à chaque sous-étape
  (partage `contenuFormations`).
  - **3.1 FAIT (`1ffe608`)** : renommage des blocs (`Parcours` -> « Vos formations et
    diplômes », `Expériences...` -> « Ce que vous avez appris ailleurs qu'au travail »,
    icônes 🌱 / 🧩) + encart vidéo retiré.
  - **3.2 FAIT (`4cea2e3`)** : **nouveau bloc inline « Vos expériences professionnelles »**
    (`CONFIG_BLOC_EXPERIENCES_PRO`, id `experiences-pro`) sur « Vos informations ».
    Formulaire inline fidèle à la maquette v10, écrit `dossier.experiences` avec la
    forme exacte (`dateFin:''` = en poste). Bilan / composeur CV / Découverte inchangés.
    Décision Denis : la fenêtre `ouvrirFenetreExperiences` / la fenêtre du Bilan
    restent en l'état (écart purement visuel, zéro risque fonctionnel) ; unification
    éventuelle plus tard.
  - **3.3 FAIT (`5b77837`)** : `sectionExperiences` retirée de `pageResultats` pour le
    parcours guidé (`nouveau`/`maj`) ; **conservée pour Découverte** (qui n'a pas
    d'étape « Vos informations »).
  - **3.4 FAIT (`f6cca66`)** : bloc « Vous » / Identité, subset sûr : ordre Prénom
    puis Nom, chiffres seuls Téléphone (15) + Code postal (5), adresse « (facultatif) »
    + phrase. Civilité « Ne pas préciser » : déjà par défaut. Majuscule/Entrée : déjà OK.
  - **3.5 FAIT (`c333476`)** : bloc « Vous » — **« Enregistrer mon identité » + repli
    en résumé** (« ✓ Prénom Nom · tél · courriel · CP Ville » + bouton « Modifier »).
    Nouveau helper `identitePeutEtreEnregistree()` (prénom + nom + tél OU courriel).
    Sous-section `complet` = `dossier.identiteEnregistree` + `fermetureManuelleUniquement`.
    `onResetTout` remet le drapeau à false.
  - **3.6 FAIT (`615fee6`)** : bloc « Vous » — **question photo « Voulez-vous une photo
    sur votre CV ? »** (Oui/Non) en colonne droite ; zone de dépôt seulement si Oui ;
    `dossier.photo.souhaitee` pilote `dossier.photo.inclure` (déduit). Ancienne case
    « Inclure ma photo... » retirée (le contrôle de l'aperçu CV reste indépendant).
    `pageProjet` : blocs empilés pleine largeur (fini la grille 3+3).
  - **3.7 FAIT (`e6a8381`)** : **retrait du bandeau coordonnées** (`boiteCoordonnees`,
    la boîte jaune « aucune coordonnée enregistrée » de l'accordéon « Informations
    transmises à l'assistant » de `pageResultats`) pour le parcours guidé. Conservée
    pour Découverte (`depuisDecouverte`). Doublon du plan §4.6.
  - **« Ne pas préciser » -> « Monsieur » : DÉJÀ FAIT (vérifié)**, aucun code. Le
    prompt (`js/app.js` ~20362) dit déjà « masculin (Monsieur ou non précisé) » pour
    toute civilité != Madame. Accord grammatical du texte généré, jamais un titre
    imprimé sur le CV. Adresse au recruteur séparée (`prompts/lettre-v1.md`).
  - **3.8 FAIT (`93f2af6`)** : sous-section **Langues** (maquette v10) — choix par
    défaut du menu = « Je n'ai pas de langue étrangère à indiquer » (l'ancienne
    pastille séparée retirée) ; barre révélée progressivement ; « Autre langue… » +
    Entrée révèle/focus le niveau, jamais stocké comme langue ; invitation visible ;
    « Je passe à l'étape suivante » toujours actif et pose `languesFrancaisUniquement`.
  - **3.9 FAIT (`0d4fabf`)** : sous-section **Formations** — **intitulé exact + année
    d'obtention obligatoires pour tous les types** (`formationBrouillonPeutAjouter`,
    plan §6.1) ; année = chiffres seuls / maxlength 4 / màj directe du bouton ;
    bouton « Valider » désactivé = `title` + phrase visible en dessous. Navigation
    Entrée déjà en place. `contenuFormations` / missions par secteur inchangés
    (partagés Découverte). Découverte vérifiée OK.
  - **3.10 FAIT (`30f0705`)** : **contexte par élément** (blocs Certifications /
    Loisirs / Engagements / Exp perso), d'après `MAQUETTE_MES_INFORMATIONS` v9,
    mécanisme `avecContexte` réutilisé (pas de 2e nomenclature). (a) bouton d'ajout :
    `labelAjouter` « Voir des idées / Voir des exemples / Explorer des exemples /
    Parcourir la liste » retiré des 4 configs → bouton neutre « ➕ Ajouter » (icône
    📖 → ➕ dans `contenuCatalogueOuiNon`). (b) `contenuCatalogueOuiNon` : la phrase
    discrète devient l'**astuce forte** (verte `--success-strong`, `font-weight:700`,
    💡, texte de la maquette `INCITATION_CTX`), visible dès ≥ 1 élément. (c)
    `blocPastillesEditables` : textarea contexte prend le placeholder maquette
    (« Dans quel cadre ? ... ») + ligne d'aide dictée (touches Windows + H) +
    l'assistant remet en forme + rappel « la croix retire l'élément et son contexte ».
    (d) point « • » (`.pastille-point-contexte`, css) sur une pastille dont le
    contexte est rempli — géré pour le stockage chaîne (Loisirs/Certifications via
    `dossier.detailsCatalogue`) ET objet (Engagements/Exp perso via `item.contexte`).
    (e) `wireCatalogueAjouterEtRetrait` : la croix supprime `dossier.detailsCatalogue[cle][valeur]`
    avant le `splice` pour le stockage chaîne (l'objet part déjà avec le splice).
    `contenuCatalogueOuiNon`/`wireCatalogueOuiNon` ne servent QUE dans `pageProjet`
    (Découverte n'y touche pas). Tests 646 verts, navigateur parcours `nouveau`
    vérifié (label, astuce, point chaîne + objet, croix retire élément + contexte).
    NB : la fenêtre modale `ouvrirFenetreCatalogue` garde sa case « ajouter du
    contexte » à l'ajout (redondance inoffensive, même donnée) — non retirée ici
    (toucherait la brique partagée `wireCatalogueDirect`).
  - **3.11 FAIT (`a93b105`)** : **Mobilité se replie sur un résumé + Modifier**,
    même motif que l'identité. `contenuMobilite(options)` : `options.resumeSiComplet`
    rend `✓ Pas de permis` / `✓ Permis B, C · avec véhicule` + `#btnModifierMobilite`
    quand la sous-section est complète et hors mode édition (`_mobiliteEnEdition`).
    `CONFIG_BLOC_VOUS` mobilité : `fermetureManuelleUniquement` (plus de repli par
    l'accordéon), `contenuHTML` appelle `contenuMobilite({resumeSiComplet:true})`.
    `wireMobilite` : bouton Modifier → `_mobiliteEnEdition=true` ; toute réponse
    (`fermerMobiliteSiComplet`) repasse à `false` ; le clic sur une catégorie ne
    sort pas du mode édition. `resumeOnEditerVous` (pastille « Permis… » du résumé
    du bloc) ouvre le formulaire. **Découverte** appelle `contenuMobilite()` sans
    options → formulaire inchangé, aucun bouton Modifier orphelin (vérifié). Tests
    646 verts, navigateur parcours `nouveau` vérifié + non régression Découverte.
  - **3.12 FAIT (`888e843`)** : **hiérarchie visuelle recommandé / facultatif**.
    `blocERIP` : nouveau `config.niveau` (`'recommande'` | `'facultatif'`), posé
    seulement sur les blocs de `pageProjet`. Quand présent : filet gauche 4px accent
    (recommandé) / gris `--border-strong` (facultatif) ; tag + pastille d'état calme
    « à compléter » → « complété » (verte) **à la place** du compteur X/Y
    rouge/orange ; plus de pulsation ni de message « Merci de bien renseigner… ».
    `CONFIG_BLOC_VOUS` / `PARCOURS` / `EXPERIENCES_PRO` = `recommande` ;
    `EXPERIENCES_PERSO` / `COMPLEMENTS` = `facultatif`. CSS mode sombre vérifié.
    Aucun autre écran n'a `config.niveau` (blocERIP + blocEditionCV inchangés
    ailleurs). Encart vidéo déjà retiré (étape 2c). Accordéon inchangé (un bloc
    ouvert à la fois, plan §7) — « ouverts par défaut » interprété comme « le premier
    bloc recommandé (Vous) ouvert », pas multi-ouverture (hors périmètre §7).
    Tests 646 verts, navigateur OK.
  - **ÉTAPE 3 CLOSE.**
  - **ÉTAPE 4 « Votre profil » (`pageRevelation`)** — réf : `PLAN_CONSOLIDE` §8 étape 4,
    `docs/ENQUETE_FAIRE_LE_POINT_2026-09-02.md` §8.4/§8.5, `docs/MAQUETTE_VOTRE_PROFIL_2026-09-02.html` (v9).
    Découpage : 4.1 structure + 2 cartes fixes · 4.2 compétences 3 familles + retrait
    réversible sur place + compteur + filtrage CV · 4.3 clic compétence → descriptif si
    dispo sinon métiers associés + « Garder comme Repère » · 4.4 cartes métier (3 boutons
    Repère / Comparer / Fiche, retrait de « Choisir ce métier », infobulle « compétences
    en commun ») · 4.5 encart Repère + phrase « et après » + habillage + passe navigateur
    `nouveau`/`maj`/`pret`/`domaine`/Découverte.
    - **Décisions Denis 2026-09-03** : (1) on RETIRE « clic sur un métier suggéré →
      devient la cible » ET le dépliage « Changer le métier visé » (`banniereMetierCible`
      éditable) — le métier se choisit et se change uniquement à « Votre objectif » (la
      contradiction avec l'enquête §8.5 est tranchée en faveur du plan §8) ;
      `verifierAvantPasserAction()` reste le filet « offre sans entreprise ». (2) Clic sur
      une compétence → descriptif court **si disponible** (mini-glossaire à enrichir),
      **sinon on garde l'ouverture « métiers associés » actuelle** (aucune régression).
    - **4.1 FAIT (`00ef45e`)** : `revelationCarteMetierVise()` (carte fixe, récap, sans
      Changer, bouton Fiche France Travail double comportement fiche directe / recherche
      metierscope, gère domaine visé + absence de cible) ; `revelationProfilEnBref()`
      (carte fixe lecture seule, ~12 lignes) ; `banniereMetierCible()` retirée de
      `pageRevelation` (wires laissés sans effet, nettoyage en 4.4) ; blocs existants
      regroupés sous 2 intertitres SANS fusionner les `CONFIG_BLOC_*` ; accordéon « Ce que
      vous aimez » descendu dans la 2e section. CSS `.revelation-*` aligné maquette (clair
      + sombre). Variantes `maj`/`domaine` vérifiées. h1 garde 🧭 (cohérence barre
      d'étapes + renvois), pas le 👤 de la maquette (déjà pris par le bloc « Vous »).
      Tests 646 verts.
    - **4.2 FAIT (`3ced1ed`)** : compétences retirables dans `CONFIG_BLOC_PROFIL`.
      `dossier.competencesProfilRetirees` (clé = nom, réversible, initialisé dans les 2
      définitions du dossier). `contenuCompetencesProfilFamille()` remplace
      `contenuListeCompetences()` (retirée) : pastille colorée par famille + croix ; une
      compétence retirée **reste à sa place**, grisée/barrée, la croix devient
      « ↩ Remettre » (index vérifié inchangé). `competencesProfilParFamille()` dédoublonne
      les 3 sources (un libellé peut être renvoyé par plusieurs). Compteur « X gardées ·
      Y retirées » sinon « N compétences ». `resumeHTML` = intro + légende 3 familles +
      rappel (plus de liste plate cliquable). Sous-sections en `fermetureManuelleUniquement`
      (visibles, ordre savoir-faire / être / savoirs). `texteProfil()` filtre les retirées
      → n'alimentent plus le CV ; `savoirFaireActuels`/`savoirEtreActuels`/`obtenirSavoirs`
      restent pures. Wire retrait/remise dans `pageRevelation`. CSS `.comp-profil*` clair +
      sombre. **NB transitoire** : le nom garde `.badge-cliquable` (loupe) → clic ouvre
      encore « métiers associés » ; 4.3 remplace par le descriptif court.
    - **4.3 FAIT (`63589ad`)** : clic sur une compétence → descriptif court.
      `DESCRIPTIFS_COMPETENCES` (mini-glossaire : tout `categorieCompetence` + 5 savoirs
      courants des fiches métier, une phrase concrète). `descriptifCompetence(nom)`
      recherche souple (`normaliserTexte`). `ouvrirDescriptifCompetence(nom)` = panneau
      ERIP avec le descriptif + bouton partagé « Garder comme Repère ».
      `wireCompetencesCliquablesGlobal` : descriptif si entrée, **sinon**
      `ouvrirPanneauChoixMetiersAssocies` (aucune régression ; s'applique aussi à la page
      Action, même câblage partagé). La pastille perd `.badge-cliquable` (loupe) →
      `title` + soulignement au survol ; rappel du bloc « Cliquez sur une compétence pour
      la comprendre ». Tests 646 verts, navigateur vérifié (descriptif + fallback).
    - **4.4 FAIT (`c27f6cb`)** : cartes métier de « Des métiers à regarder ».
      `carteMetierResumeHTML()` réécrite en `.metier-carte` (nom + secteur + étiquette
      « proche de votre profil » / « même domaine » + croix « retirer »). **Plus de
      « Choisir ce métier »** : nom non cliquable pour cibler. 3 boutons par métier via
      briques partagées : `reperesBoutonAncre` (« Garder comme Repère »),
      `comparerBoutonPanier` (« Comparer cette piste », panier module Comparer + barre
      flottante, handler global déjà installé), lien Fiche France Travail (fiche directe
      si ROME / recherche metierscope sinon). Infobulle « compétences en commun avec
      votre métier visé » (`competencesCommunesAvecMetierVise`, couleur par famille
      d'après la fiche) : survol → ouvre, `mouseleave` → ferme, clic → épingle, clic
      ailleurs → ferme (`wireMetierCarteBulles`, handler document 1×). Pas d'infobulle
      pour le métier visé lui-même. `ouvrirDescriptifMetier()` masque « Choisir ce métier »
      quand `_choixMetierCibleMasque` (posé par `pageRevelation`, retiré par
      `pageObjectif`) → couvre aussi « Pourquoi ces métiers ? ». `wireBanniereMetierCible`
      / `wireRechercheMetierCible` / `wireEvidenceMetierCible` retirés des appels ;
      `wireMetierCarteBulles` ajouté. Code mort `banniereMetierCible` + wires → chip
      `spawn_task` (task_081d97ad). CSS `.metier-carte*` clair + sombre. Tests 646 verts.
    - **4.5 FAIT (`b94c37f`)** : encart Repère en bas de `pageRevelation`
      (`reperesBoutonAncre`, câblé par le `reperesBrancherBoutonAncre` déjà présent) +
      phrase « À l'étape suivante, l'assistant en ligne rédige votre CV à partir de tout
      ceci. ». CSS `.revelation-encart-repere` / `.revelation-et-apres` (clair + sombre).
      Passe navigateur : `nouveau`/`maj`/`pret`/`domaine` sans erreur JS ; `maj`/`pret`
      masquent les blocs questionnaire (inchangé) ; `domaine` masque « Des métiers à
      regarder » + « Des pistes à explorer » ; `pageResultats` (page Action, atteinte par
      Découverte) rend OK, le changement 4.3 n'y casse rien ; **Découverte ne passe pas
      par `pageRevelation`** (vérifié — `naviguerVers('resultats')` direct). Tests 646 verts.
  - **>>> ÉTAPE 4 CLOSE.** Reste hors étape 4 : (a) chip `spawn_task` task_081d97ad —
    retrait du code mort `banniereMetierCible` + wires (~120 lignes, `js/app.js`). (b)
    Question ouverte pour Denis : « Choisir ce métier » du descriptif est aussi masqué
    dans « Pourquoi ces métiers ? » (`_choixMetierCibleMasque`) — cohérent avec sa
    décision « le métier se change à Votre objectif », mais lui confirmer.
  - **ÉTAPE 5 « Assistant » + « Vos documents » — CADRAGE FAIT** :
    `docs/CADRAGE_ETAPE_5_VOS_DOCUMENTS_2026-09-03.md` (frontière + découpage 10
    sous-étapes + questions). Maquettes validées : `MAQUETTE_VOS_DOCUMENTS` v3,
    `MAQUETTE_ASSISTANT` v5, `MAQUETTE_COORDONNEES` v1, `MAQUETTE_MISE_EN_PAGE` v6.
    Option B : 2 routes — `assistant` (`pageAssistant()`, 4 rectangles) + `resultats`
    (« Vos documents » format-first, sans verrous).
    - **Décisions Denis 2026-09-03** : (Q1) `pageAssistant` pour `nouveau` seulement ;
      `maj`/`pret` gardent le wizard `ouvrirAssistantDepotCV`. (Q2) bouton « ODT »
      renvoie au « Copier le texte » + explication LibreOffice ; vrai .odt = tâche
      séparée. (Q3) rectangle « La mise en page » reloge le Composeur/panneau perso
      EXISTANT ; implémenter `MAQUETTE_MISE_EN_PAGE` (3 niveaux) = chantier suivant.
      (Q4) « Choisir ce métier » reste masqué.
    - **5.1 FAIT (`5423a7a`)** : route `assistant` + squelette `pageAssistant()`.
      `_creerCvNavIndex` `case 'assistant': return 4;` ; `routes['assistant']` ;
      `afficherProgression` gère `assistant` pour `nouveau` (routeParIndex i===4) ;
      `verifierAvantPasserAction(routeCible)` param optionnel — `pageRevelation` route
      `nouveau` → `assistant`, autres → `resultats` (wizard `ouvrirAssistantDepotCV`
      inchangé). `pageAssistant()` : filet `modeCreation !== 'nouveau'` → `pageResultats()` ;
      moteur partagé (`etatAccordeon`/`accordeonPourType`/`blocAccordeon`/`wireAccordeon`) ;
      4 rectangles stub (`adaptation-metier` / `choix-ia` / `import-ia` / `relecture-ia`) ;
      barre bas `revelation` ↔ `resultats`. Vérifié : `nouveau` revelation→assistant→
      resultats→Retour→assistant ; `maj` revelation→resultats direct ; barre 6 repères ;
      0 erreur JS. Tests 646 verts.
    - **CONSIGNE DENIS 2026-09-03 (forte) — RÈGLE DE FIDÉLITÉ MAQUETTE, s'applique à
      TOUTES les étapes** :
      1. Le résultat final de CHAQUE écran doit être **identique à sa maquette validée**,
         visuel compris — pas seulement les blocs déplacés. Zéro rendu hybride
         ancien/nouveau : on ne garde QUE la nouvelle version.
      2. La maquette fait autorité **dans les deux sens** : ce qu'elle contient est
         ajouté ; **ce qu'elle ne contient pas est retiré** de l'app réelle quand on
         passe sur cet écran. Les repères visuels de l'ancienne page « Mon projet »
         (6 blocs + sous-blocs) qui n'ont plus lieu d'être avec la dispersion sur
         plusieurs pages doivent disparaître : messages de rappel « Merci de bien
         renseigner les informations de ce bloc », pulses, compteurs X/Y, mises en
         évidence rouges — sauf si la maquette de l'écran les montre.
      3. Si la fidélité visuelle d'un écran est repoussée à une passe dédiée, **le dire
         explicitement** dans le compte rendu.
      **CONSTAT VÉRIFIÉ (2026-09-03)** : `MAQUETTE_OBJECTIF_RESTRUCTURE` v5 montre, pour
      les blocs « Votre candidature » / « Le poste que vous recherchez » / « Vos
      disponibilités », **seulement un badge d'état calme** (« à compléter » → « complété »,
      ou « facultatif ») dans l'en-tête. **Pas** de message « Merci de bien renseigner… »,
      pas de compteur X/Y, pas de pulse. Or `pageObjectif` rend aujourd'hui
      `blocERIP(CONFIG_BLOC_CANDIDATURE)` + `blocERIP(CONFIG_BLOC_PROJET)` SANS
      `config.niveau` → l'ancien compteur + le message d'incomplétude s'affichent encore.
      → À corriger dans la passe de fidélité visuelle (badge calme façon 3.12, pas de
      message, pas de compteur).
      **Décision** : (a) à partir de 5.2, chaque rectangle/écran est construit
      directement au visuel de sa maquette (`.assistant-rect` etc., fait en 5.2 — cf.
      `MAQUETTE_ASSISTANT` v5) ; (b) une **passe de fidélité visuelle** (« étape 5bis »,
      avant la passe finale) couvrira les étapes 1 à 5 ensemble, APRÈS le code
      fonctionnel de l'étape 5, écran par écran contre sa maquette
      (`MAQUETTE_OBJECTIF_RESTRUCTURE` v5, `MAQUETTE_MES_INFORMATIONS` v10,
      `MAQUETTE_VOTRE_PROFIL` v9, `MAQUETTE_ASSISTANT` v5, `MAQUETTE_VOS_DOCUMENTS` v3) :
      pour chacun, liste ce que la maquette AJOUTE et ce qu'elle RETIRE, applique les
      deux, puis extraction de la brique jetons/champs/rectangle commune
      (PLAN_CONSOLIDE §7 / étape 6).
    - **5.2 FAIT (`b78b343`)** : rectangle 1 « Réglez le style d'écriture » + habillage
      maquette (retrofit du squelette 5.1). CSS `.assistant-rect*` / `.assistant-groupe*` /
      `.assistant-jeton*` / `.assistant-btn*` (clair + sombre). `rectangleAssistant()` +
      `wireRectanglesAssistant()` (chrome maquette, `etatAccordeon` partagé, un seul
      ouvert). `pageAssistant` : ajout `etatAccordeonValide = accordeonValidePourType(docActif)`.
      Rectangle 1 : `GROUPES_STYLE_CV` (5 réglages → `dossier.preferencesIAParType[docActif]`,
      défauts appliqués sauf niveau du poste à choisir, jamais « facultatif ») + situation
      facultative `dossier.situationActuelle` (nouveau champ, init ×2, jamais un diagnostic,
      → `texteProfil` seulement si renseignée) + bouton « Ces réglages me conviennent »
      (`avancerEtape` → ouvre `choix-ia`) + résumé au repli. Tests 646 verts, navigateur OK.
    - **5.3 FAIT (`12abb46`)** : rectangle 2 « Choisissez votre assistant » au visuel
      `MAQUETTE_ASSISTANT` v5. `wireChoixAssistantIA(rerender)` + `wireEtapesDetailChoixIA(idDetail)`
      extraits de `brancherEvenementsResultats` (partagés pageResultats + pageAssistant).
      `contenuRectangleChoixIA` : groupes colorés sans-compte (vert) / avec-connexion
      (accent) + pastilles assistants + « Ce qui va se passer » + confidentialité + vidéo
      + **bouton discret** « Voir ou modifier le texte transmis à l'assistant »
      (`ouvrirVerificationInformations` / `profilTexteManuel`). `pageAssistant` ne passe
      plus par `accordeonPourType()` (garde-fou pageResultats) → rectangles à libre
      bascule via `etatAccordeonParType[docActif]`. CSS `.assistant-choix-*` clair +
      sombre. Tests 646 verts, navigateur OK + pageResultats non régressée.
    - **5.4 FAIT (`4580ade`)** : rectangle 3 « Importer la réponse ».
      `contenuAccordeonImportIA(docActif)` (HTML) + `wireImportIA(docActif, rerender,
      idEtapeApres)` (câblage : `activerCollageInstantane` + décompte/ouverture assistant
      + phases + `raisonErreurImport` + parsing CV/lettre/entretien) **extraits tels
      quels** de `pageResultats` / `brancherEvenementsResultats` (~290 lignes). Appels
      `pageResultats()` → `rerender()` ; étape après import réussi = `idEtapeApres`
      (`apercu-document` pour Vos documents, `relecture-ia` pour Assistant).
      `brancherEvenementsResultats` : bloc remplacé par `wireImportIA(docActif,
      pageResultats, 'apercu-document')` (zéro changement maj/pret). Rectangle 4 reste
      un stub. Piège ASI corrigé (`return (` … `)`). Tests 646 verts, navigateur OK
      (bannière transition + décompte, import vide → erreur sans cul-de-sac, maj non
      régressé).
    - **5.5 FAIT (`137a3da`)** : rectangle 4 « Choisir ce qui ira sur le CV » — les
      **9 onglets** de l'écran de relecture **dans la page** (plus de fenêtre ERIP pour
      `nouveau`). `ouvrirRelectureIACV(...enPage...)` aiguille : `nouveau` → stocke
      brouillon + callback (`_brouillonRelectureIACV` / `_onValiderRelectureIACV`),
      `avancerEtape('import-ia','relecture-ia')`, re-rend ; `maj`/`pret` →
      `ouvrirEcranChoixReponseIACV` (inchangé). `contenuRectangleRelectureIA` +
      `wireRectangleRelectureIA` réutilisent `genererEcranChoixReponseIACV` /
      `wireOngletsValidationImport` / `wireEcranChoixReponseIACV`. Bouton « Je valide ces
      choix » → **le callback existant** (écritures `dossier.ia.cv` + optimisation) +
      `_relectureIAValidee=true`. « Continuer vers Vos documents » **désactivé** tant que
      non validé. Normalisation « un seul rectangle ouvert ». Icône onglet
      « Rubriques à masquer » 🙈 → 🚫 (non-négociable visage). Tests 646 verts, navigateur OK.
    - **ÉTAPE 5 — reste** : 5.6 (`pageResultats` = « Vos documents » squelette, retrait
      des accordéons partis + verrous + `sectionExperiences` + « Résumé candidature » +
      `boutonRessourcesFin` ; coordonnées → bandeau si vide) · 5.7 rectangle « Le
      format » · 5.8 rectangle « La mise en page » (reloge le Composeur EXISTANT, Q3) ·
      5.9 rectangle « Exporter » (format choisi + Copier + Canva + ODT=copier, Q2) · 5.10
      variantes `maj`/`pret`/Découverte + passe navigateur. Détail : `docs/CADRAGE_ETAPE_5_VOS_DOCUMENTS_2026-09-03.md` §4.
    - **5.6 FAIT (`3b6db47`)** : `pageResultats` allégée = « Vos documents » (squelette).
      h1 unique « 📄 Vos documents » (tous). Garde-fou : `apercu-document` forcé
      accessible, `exporter-document` atteint (replié). Assemblage : plus de sous-barre
      interne, plus des accordéons `infos-ia`/`choix-ia`/`import-ia`, plus de
      `boutonRessourcesFin`. `accordeonAdaptation` gardé pour `maj`/`pret` seulement,
      retiré pour `nouveau`/Découverte. Coordonnées : plus de formulaire, bandeau de
      renvoi uniquement si `identiteEntierementVide()`. `selecteurDocument` conservé.
      Tests 646 verts, navigateur `nouveau`/`maj`/`pret`/Découverte OK (0 erreur JS).
      **Transitoire** : « Aperçu et finalisation » (le Composeur) s'affiche avec son
      chrome actuel — 5.7/5.8 le structurent en « Le format » + « La mise en page ».
    - **5.7 FAIT (`faf9fa7`)** : rectangle « Le format » (`MAQUETTE_VOS_DOCUMENTS`).
      `dossier.formatCV` (`pdf`/`word`/null). `contenuRectangleFormatCV` : chrome
      `.assistant-rect` + 2 cartes Word/PDF + phrase honnête + note « emporter le
      contenu ». Au choix → replié « Format : PDF — cliquez pour changer », en-tête
      rouvre. `pageResultats` (CV) : « Le format » avant « La mise en page » ; le
      Composeur (`accordeonApercuDoc`) rendu seulement si `dossier.formatCV` choisi,
      sinon message de renvoi. Lettre/entretien inchangés. CSS `.fmt-*` clair + sombre.
      Tests 646 verts, navigateur OK.
    - **5.8 FAIT (`45eca07`)** : « Vos documents » = trois rectangles dépliants
      `rectDoc` (chrome `.assistant-rect`), un seul ouvert à la fois via `_rectDocOuvert`,
      toute la page accessible. Corrige la régression 5.6 (`panneauEtapeAction` ne rendait
      rien pour `etatAccordeon[id] === false` → « Exporter » disparaissait). `rectDoc(id,
      ico, titre, sousTitre, corps)` + `wireRectsDoc(rerender)` (bascule + `[data-format-cv]`).
      CV : « Le format » ouvert tant qu'aucun format choisi ; « La mise en page » (le
      Composeur `construireContenuApercuFinalisation`, relogé tel quel — Q3) et « Exporter »
      affichent alors un renvoi. Lettre/entretien : pas de « Le format », démarrage sur
      « La mise en page » (état résiduel `format` rebasculé). « Et maintenant ? »
      (`suggestionSuivante`) sort des rectangles, toujours visible en bas.
      `btnContinuerApercu` → `_rectDocOuvert = 'exporter'` au lieu d'`avancerEtape`.
      Bouton « Merci bien, j'ai fini » : condition alignée maquette
      (`documentsEnregistres[docActif]` seul, garde-fou `etatAccordeon['exporter-document']`
      retiré ici ET dans `marquerDocumentEnregistre`). Tests 646 verts, navigateur OK
      (CV nouveau Word → mise en page → exporter ; lettre sans rectangle format).
      **Restes de fidélité visuelle (→ étape 5bis)** : « Et maintenant ? » garde le style
      `.cv-section` (rocket + boutons outline) au lieu du `.et-apres` de la maquette ;
      chevron des rectangles à vérifier ; sous-titre « réglages actuels » de « La mise en
      page » vide pour l'instant. Vestiges 5.6 non rendus (`accordeonInfosIA` /
      `accordeonChoixIA` / `accordeonImportIA` construits mais non assemblés,
      `ordreEtapesAction` / normalisation) → nettoyage étape 7.
    - **5.9 FAIT (`5a4558c`)** : rectangle « Exporter » (`contenuRectangleExporter(docActif)`
      + `wireRectExporter(rerender)`, près de `wireRectsDoc`). CV, calqué sur
      `MAQUETTE_VOS_DOCUMENTS` `corpsExport()` : **un seul bouton de téléchargement**
      (`dossier.formatCV`, `data-format-export="docx"` — handler existant réutilisé,
      `etatApercuInline.cv.ongletApercu` aligné sur `dossier.formatCV` au choix ET à chaque
      bascule) · **« Copier le texte »** = vrai presse-papiers (`copierTexteVersPressePapier`
      + `construireObjetCVPourExport` + `genererBlocsTexteCV`, mêmes données que le Word,
      compte comme un export) · **« Envoyer vers Canva »** (`data-format-export="csv-canva"`
      existant) · **« Version ODT (LibreOffice) »** = déplie une explication « copiez le
      texte → LibreOffice / Google Docs → enregistrer en .odt » (Q2, pas de génération .odt)
      · **« Faire aussi une version [autre format] »** (bascule `dossier.formatCV`, rouvre
      « La mise en page »). Lettre/entretien : `construireContenuExportDocument` tel quel.
      Bouton « fait » : label honnête « ↻ Télécharger à nouveau le … » (le flag réel
      `documentsEnregistres.cv` ne dit pas QUEL format/action). CSS `.expo-*` jetons clair +
      sombre. Tests 646 verts, navigateur OK (CV Word → 5 boutons, presse-papiers,
      bascule PDF↔Word, aide ODT, bouton de fin après copie ; lettre inchangée).
      **Reste de fidélité visuelle (→ 5bis)** : sous-titre du rectangle replié
      « N export(s) fait(s) » pas encore fait (flag booléen unique, pas de compteur
      par action).
    - **5.10 FAIT (vérification, pas de code — `5bcefd4` + ce doc)** : passe navigateur
      bout-en-bout des **4 contextes** sur `pageResultats` après 5.1→5.9.
      - **`nouveau`** : `revelation` (« 🧭 Votre profil ») → bouton « 🚀 Passer à l'action »
        → `#assistant` (« 💬 L'assistant en ligne », 4 rectangles) → bouton « Continuer vers
        « Vos documents » » (désactivé tant que `_relectureIAValidee` faux, actif après)
        → `#resultats` (« 📄 Vos documents », 3 rectDoc, « Le format » ouvert). « Retour »
        depuis `resultats` → `#assistant` (pas de double-retour).
      - **`maj`** : `pageAssistant()` redirige bien vers `pageResultats` (`modeCreation !==
        'nouveau'`). h1 « Vos documents », sélecteur CV/Lettre visible, accordéon
        « 🎓 Adaptation au métier » présent (non forké), 3 rectDoc, Exporter = 5 boutons CV.
      - **`pret`** (docActif lettre) : h1 « Vos documents », sélecteur visible, accordéon
        « Adaptation au métier » présent, **2 rectDoc** (pas de « Le format » pour la
        lettre), Exporter = `construireContenuExportDocument` inchangé (Aperçu / Télécharger
        / Texte à copier), suggestion « préparer l'entretien » en bas.
      - **Découverte** : `depuisDecouverte` → h1 « Vos documents », docActif forcé `cv`,
        barre haute = module Découverte (`📝 Préparer 💬 Assistant … 📄 Mon CV`), pas de
        sélecteur, pas d'accordéon Adaptation, 3 rectDoc, Exporter = 5 boutons CV.
      - **Umami** : `trackEvenement` = simple passe-plat `umami.track` (aucun allowlist).
        `cv_telecharge` déjà existant ; nouvelle valeur `format:'copie-texte'` (bouton
        « Copier le texte » du rectangle Exporter) = extension naturelle des valeurs
        `word` / `texte` / `json` / `csv-canva`. Aucun événement perdu.
      - `npm test` : **646 verts**. Console : 0 erreur JS (le seul 404 =
        `cloud.umami.is/script.js`, bloqué hors ligne, sans effet — `trackEvenement`
        garde `typeof umami`).
      - **Note** : le 404 externe et les 3 maquettes non suivies dans `docs/`
        (`MAQUETTE_ATS_PARCOURS`, `MAQUETTE_REGARD_RECRUTEUR_PARCOURS`,
        `MAQUETTE_SE_TENIR_INFORME_PARCOURS`) viennent d'un autre chantier / de l'autre
        compte Claude — non touchées.

  ### étape 5bis — passe de fidélité visuelle sur les 5 écrans — **TERMINÉE (2026-09-03)**
  Étape 5 **fonctionnellement close** (5.1→5.10). Passe « coller à la maquette à
  100 %, dans les deux sens » sur **Objectif / Votre parcours / Vos informations /
  Votre profil / Assistant / Vos documents** : pour chaque écran, ce que la
  maquette **AJOUTE** et ce qu'elle **RETIRE** (fonctions incluses — directive
  Denis répétée : rien qui n'ait été validé en maquette). **Les 6 écrans sont
  passés + la passe finale (typo / emojis / sous-titres / carte `.et-apres`).**
  Reste hors 5bis : le sous-titre « réglages actuels » de « La mise en page »
  (→ chantier `MAQUETTE_MISE_EN_PAGE`) ; le nettoyage des vestiges 5.6 (→ étape 7) ;
  l'extraction de la brique commune jetons/champs/rectangle (→ étape 6).

  **Outil de revue** : `docs/REVUE_5BIS_PARCOURS_GUIDE_2026-09-03.html` (servi par
  le serveur dev, `/docs/…`) — maquette de chaque écran en iframe + état 5bis +
  écarts connus + lien « ouvrir dans l'appli ».

  - **Objectif — FAIT** (`MAQUETTE_OBJECTIF_RESTRUCTURE` v5). Blocs `CANDIDATURE`
    et `PROJET` (utilisés uniquement sur `pageObjectif` depuis 2c) :
    - **bloc 1 (`e37ceff`)** : `niveau: 'recommande'` / `'facultatif'` → filet
      gauche accent/gris + tag + pastille d'état calme (« à compléter » → « complété »).
      Le compteur X/Y rouge, la pulsation et le bandeau « Merci de bien renseigner
      les informations de ce bloc » disparaissent (`afficherMessageIncomplet &&
      !config.niveau`). Mécanisme 3.12, déjà validé sur « Vos informations ».
    - **bloc 2 (`cedfa6a`)** : `masquerReset: true` sur les 2 → plus de croix
      « ✕ tout effacer » en tête (absente de la maquette). Effacement toujours
      possible pastille par pastille via le résumé.
    - **point 1 (`f212d8c`)** : `Candidature` **ouverte par défaut** à l'arrivée
      (`_objectifBlocsAmorces`, ré-amorcé par `naviguerVers('objectif')` et par le
      choix d'un objectif ; les re-rendus internes ne rouvrent pas → état manuel
      respecté). **Auto-fermeture** quand `Candidature` passe complète et qu'elle
      est encore ouverte (`_objectifCandidatureDejaComplete`). `Le poste` ne
      s'ouvre pas tout seul. Repliables/réouvrables ensuite.
    - **point 2 (`ac138f3`)** : **cartes compactes** — grille 3 colonnes,
      `.grille-objectif` / `.carte-objectif` (classe **dédiée**, jamais `.carte` /
      `.objectifs`). CSS clair + sombre, `--actif` = filet + fond accent.
    - **point 3 (`750cebc`)** : **ligne de récap** `resumeObjectifLigne()`
      (« En résumé : … », réutilise `resumeCandidature` / `resumeProjet`), CSS
      `.objectif-recap` (filet pointillé + petit texte).
    - **point 4 (`781f81e`)** : `sansResumeBloc: true` sur `CANDIDATURE` /
      `PROJET` (plus de « Rien renseigné » ni pastilles de bloc) + bannière verte
      « ✅ Ce bloc est complet, merci ! » masquée pour tout `config.niveau`
      (Objectif ET Vos informations) — pendant du « Merci de bien renseigner »
      déjà retiré.
    - **Reste Objectif** : la sous-section garde le chevron `▸` + la pastille
      `○`/`✓` → couvert par **A5** (brique `blocERIP` partagée). Le champ
      « métier précis / domaine » + saisie assistée + encart France Travail =
      **fonctionnel, hors 5bis** (jamais acté en étape 2).
  - **Vos informations — EN COURS** (`MAQUETTE_MES_INFORMATIONS` v10). Inventaire
    AJOUTE / RETIRE fait. Ossature (5 blocs, colonne photo, formations 3 étapes,
    langues, contexte par élément) livrée en étape 3. Retraits « ancienne archi » :
    - **A1 + A2 + A3 (`c20ee0e`)** : croix « ✕ tout effacer » retirée des 5 blocs
      (`masquerReset`) · question « Souhaitez-vous indiquer… ? Oui/Non » retirée
      pour Loisirs / Engagements / Exp. personnelles (flag `sansQuestionOuiNon` sur
      `CONFIG_LOISIRS` / `CONFIG_ENGAGEMENTS` / `CONFIG_EXPERIENCES_PERSO`) — accès
      direct à la liste ; Certifications garde son Oui/Non (dans la maquette) ·
      bouton « Je passe à l'étape suivante → » retiré des 4 catalogues · résumé de
      bloc masqué quand replié. **Borné à `pageProjet`** via
      `_vosInformationsRenduEnCours` : « Modifier mon CV » / Bilan (`blocEditionCV`)
      strictement inchangés.
    - **A3b (`00f9a9a`)** : flag `sansResumeBloc` (remplace `masquerResumeSiFerme`
      sur les 5 blocs) → **aucun résumé de niveau bloc, ni ouvert ni fermé**. Le
      « Rien renseigné pour le moment » / les pastilles vivent uniquement dans les
      sous-sections. Vérifié : chaque élément reste visible + supprimable dans sa
      sous-section. « Votre profil » (partage `masquerResumeSiFerme`) inchangé.
    - **A4 (`1f68f3d`)** — **scopé « Vos informations » seulement** (décision Denis :
      pas global). Flag `config.blocMultiOuvert` sur les 5 configs + map
      `etatBlocsERIPOuverts`. Blocs ouverts/fermés indépendamment ; défaut
      d'arrivée = Vous / Formations / Expériences pro ouverts, Perso / Compléments
      fermés (`_vosInfosBlocsInitialises`, comme la maquette v10) ; boutons
      **« Tout déplier / Tout replier »**. Objectif + Votre profil gardent le
      un-seul-ouvert (`etatBlocERIPOuvert`), non touchés. `verifierTransitions…` :
      plus d'auto-ouverture du bloc suivant pour les blocs multi-ouverts.
    - **A5 (`1ade22e`)** — flag `config.sousSectionsPlates` sur les 5 configs.
      Sous-sections rendues en `.sous-section-plate` (sous-titre + trait, contenu
      **toujours visible**), sans chevron `▸` ni pastille `○`/`✓`. `wireBlocERIP`
      câble toutes les sous-sections plates (plus seulement les « ouvertes ») ;
      CSS masque `.btn-etape-suivante` dedans (couvre Langues / Formations — le
      « Je passe à l'étape suivante » n'a plus de sens à plat). Objectif garde
      ses accordéons `▸` (son 5bis A5 non décidé) ; Votre profil idem (sa
      maquette v9 conserve des dépliables).
    - **Reste « Vos informations »** : titres de bloc en MAJUSCULES → casse
      normale = **passe finale (étape 7)**.
  - **Votre parcours — FAIT** (`MAQUETTE_VOTRE_PARCOURS_FUSION` v3). Structure
    (4 questions repliables, 1re ouverte ; compteurs pastille ; familles fermées
    + « N choix » ; aperçu gris / pastilles bleues ; cartes pastilles ; encart ;
    pas de rectangle récap ; Q2 = 4 familles ; tous les décomptes) déjà conforme
    depuis la fusion (Phase 3b). 5bis (`888ba42`) :
    - RETIRÉ l'accordéon « Compétences déjà identifiées »
      (`afficherCompetencesDetectees('votre-parcours')`) — report des 4 anciens
      écrans, absent de la maquette. `deduireCompetences` reste utilisé en aval.
    - AJOUTÉ la phrase d'état visible sous les questions (« Il reste N
      question(s)… » / « Les 4 questions ont au moins une case cochée. »).
    - Pas de bouton « Revoir la présentation » (pas d'écran de présentation
      pour cette étape — décision Denis).
  - **Votre profil — EN COURS** (`MAQUETTE_VOTRE_PROFIL` v9). Ossature étape 4
    en place (2 cartes fixes, 2 intertitres, cartes métier avec « compétences en
    commun » colorées, **pas de barre de compatibilité** — conforme). Inventaire
    fait : tous les écarts étaient **tranchés dans la maquette v9** (légende
    explicite « la page est complète » avec En bref + métiers + compétences +
    repères), aucune zone oubliée.
    - **lot 1 (`e7575bc`)** : retirés le bloc « Ce qui vous correspond »
      (`CONFIG_BLOC_CORRESPONDANCE`) et l'accordéon « Ce que vous aimez »
      (`construireMessageAime`) — recaps d'affichage, données toujours utilisées
      en aval. `CONFIG_BLOC_PROFIL` renommé « Vos compétences ». `blocMultiOuvert`
      sur `CONFIG_BLOC_METIERS` + `CONFIG_BLOC_PROFIL` (fermés par défaut, pas de
      « Tout déplier » — 2 blocs).
    - **lot 2 (`16d4cbc`)** : « Autres pistes » (`CONFIG_BLOC_PISTES`) **fusionné**
      dans `CONFIG_BLOC_METIERS` → un seul bloc, cartes « proche de votre profil »
      puis « même domaine » (index combiné, `carteMetierResumeHTML` 4e param
      `tagTexteOverride`), `resumeOnSuppression` aiguille par index, « Jobs
      saisonniers » en sous-section dynamique. `CONFIG_BLOC_PISTES` reste défini
      (fonctions réutilisées). Item non-maquette laissé (décision Denis) : la
      croix ✕ « retirer ce métier ».
    - **Passe finale « Votre profil » — FAITE (`10c555b`)** : h1 emoji 🧭 → 👤,
      emoji bloc métiers ⭐ → 💼, sous-titre reformulé (maquette v9). Reste :
      hint « Cliquez pour déplier » sous une entête repliée (mineur).
  - **Assistant — RIEN à faire en 5bis** (`MAQUETTE_ASSISTANT` v5). `pageAssistant`
    a été construite en étape 5 (5.1→5.5) contre cette maquette exacte : 4
    rectangles (« Réglez le style d'écriture » ouvert / « Choisissez votre
    assistant » / « Importer la réponse » / « Choisir ce qui ira sur le CV »),
    1er ouvert, un seul à la fois, « Réglez le style » = 5 groupes + situation
    facultative + intro + « Ces réglages me conviennent », « Continuer vers Vos
    documents » désactivé tant que la relecture n'est pas validée. Aucun bloc
    hors maquette, aucun retrait.
    - **Passe finale « Assistant » — FAITE (`10c555b`)** : icône rectangle 1
      ✏️ → 🎚️ (`&#127898;&#65039;`, vérifié : s'affiche bien, le « tofu » de
      5.2 ne se reproduit pas) ; sous-titre = celui de la maquette v5.
      Gardés (convention app) : « Continuer » désactivé + message (vs caché) ;
      barre d'étapes complète 6 repères (vs vue compacte).
  - **Vos documents — passe finale FAITE (`ceb09ca`)** (`MAQUETTE_VOS_DOCUMENTS`) :
    « Et maintenant ? » passe de `.cv-section` centrée à la carte `.et-apres` (filet +
    ombre, gauche, h3, `.ea-boutons`) ; rectangle « Exporter » replié = sous-titre
    « document récupéré » quand `documentsEnregistres[docActif]`. **Reste** (chantier
    `MAQUETTE_MISE_EN_PAGE`) : le sous-titre « réglages actuels » de « La mise en page »
    (« A4 Détaillé · 2 colonnes · Segoe ») = à produire avec le vrai résumé des réglages.
  ### étape 7 — nettoyage (CLOS 2026-09-03)
  > Bilan : ~446 lignes de code mort retirées en 4 commits, 2 bugs réels
  > corrigés au passage (régression Découverte : saisie expériences ;
  > `maj`/`pret` : « Réglez le style » qui sautait au 2ᵉ rendu). `npm test`
  > 646 verts, parcours complet vérifié navigateur. Hors périmètre (autres
  > chantiers) : `banniereMetierCible` (chip `task_081d97ad`), 4 priorités
  > HAUTE `REVUE_CRITIQUE_REGLAGES_CV` (Composeur).
  - **FAIT (`c30a86c`)** : vestiges 5.6 de `pageResultats` retirés —
    `accordeonInfosIA` (+ `infoObjectifChoisi`), `accordeonChoixIA` (+
    `wireChoixAssistantIA` / `wireEtapesDetailChoixIA` ici), `accordeonImportIA`
    (+ `wireImportIA` ici), `etapeAtteinte()`, handlers `btnContinuerInfosIA` /
    `btnVerifierInfosIA` / `btnRevenirTexteAutoIA` (~183 lignes). **+ correction
    régression 5.6** : `boiteCoordonnees` + `sectionExperiences` (seul point
    d'entrée coordonnées + expériences pro pour **Découverte**, qui n'a pas
    d'étape « Vos informations ») étaient dans `accordeonInfosIA` → ré-assemblés
    dans `pageResultats`, gardés par `depuisDecouverte`.
  - **FAIT (`f19d898`)** : `construireMessageAime()` + objet `CONFIG_BLOC_PISTES`
    retirés (plus d'appelant depuis 5bis lot 1 / lot 2). Fonctions standalone
    `pistesRecommandees` / `contenuMetiersSaisonnierAlimentaire`… conservées
    (réutilisées par le bloc métiers fusionné).
  - **FAIT (`27c04eb`)** : cluster mort `CONFIG_BLOC_CORRESPONDANCE` retiré
    (~175 lignes) — `pointsFortsSynthese`, `ouvrirPanneauMetiersParChampPourCible`,
    `wireCompetencesChampCliquablesGlobal` (+ son appel dans `pageRevelation`),
    `metiersPourSynthese`, `contenuMetiersCorrespondance`,
    `contenuMethodologieCorrespondance`, `resumePointsFortsHTML`, l'objet
    `CONFIG_BLOC_CORRESPONDANCE`. Builders « Ce qui vous correspond » supprimés
    (déjà retirés de « Votre profil » en lot 1).
  - **FAIT (`7414ae4`)** : bloc de normalisation `ordreEtapesAction` retiré de
    `pageResultats` (~24 lignes). **C'était un bug actif** : il tournait *après*
    la construction de `accordeonAdaptation` mais forçait
    `etatAccordeon['adaptation-metier'] = false` dans le tiroir persistant
    `etatAccordeonParType` → le rectangle « Réglez le style » / « Adaptation au
    métier » disparaissait pour `maj`/`pret` au 2ᵉ rendu de « Vos documents ».
    Vérifié corrigé : `PRESENT(true)` sur 4 rendus successifs.
  - **Reporté à d'autres chantiers** : `banniereMetierCible()` /
    `banniereDomaineCible()` (chip `task_081d97ad`) ; 4 priorités HAUTE
    `REVUE_CRITIQUE_REGLAGES_CV` (Composeur).
  - Rappel : `sectionExperiences` de `pageResultats` — voir ci-dessus,
    ré-assemblée pour Découverte.

  ### étape 6 — brique commune jetons / champs (EN COURS depuis 2026-09-03)
  Objectif (`PLAN_CONSOLIDE` §7) : la passe visuelle des jetons (case à cocher /
  radio) et des champs (halo focus, badges, chevrons) présente sur les 3
  maquettes doit devenir **un composant partagé** (entrée `BRIQUES_COMMUNES.md`,
  MAJ même commit), appliqué partout où contrat / dispo / langue / objectif
  apparaissent — jamais un CSS jetable écran par écran.
  - Inventaire : 6+ styles de « pilule » coexistent (`.pastille`, `.pastille-selection`
    inline, `.assistant-jeton`, `.bilan-preparer .preparer-jeton`, overrides
    `.export-jetons` / `.adapt-groupe`, + les maquettes en `.jeton`/`.pastille--radio`).
    Approche validée Denis 2026-09-03 : nom canonique `.jeton` / `.jeton--radio` /
    `.jeton--compact` / `.is-actif` ; périmètre = parcours guidé seul ; coche `::before`
    gardée ; **Bilan hors périmètre** ; migration en 3 sous-lots (6a Objectif, 6b Vos
    informations, 6c Assistant).
  - **6a FAIT (`ffce8b9`)** : brique `htmlJetons()` (`js/app.js`) + CSS `.jeton*`
    (`css/style.css`, clair + sombre, halo focus). `contenuPastillesChamp` +
    `contenuAccepte` réécrits pour l'appeler → Objectif : contrat / temps de travail /
    j'accepte en jetons modernisés (coche visible). `wireContratTemps` inchangé
    (sélecteur `.pastille[data-champ]` → `.jeton[data-champ]`). `BRIQUES_COMMUNES.md`
    table A + dette B.6 (suite : 6b, 6c, puis `.pastille-selection`). Tests 646 verts,
    navigateur OK clair + sombre.
  - **6a-bis FAIT (`d38c905`)** : « Le poste que vous recherchez » aligné sur la
    maquette v5 — `sousSectionsPlates` sur `CONFIG_BLOC_PROJET` (4 rangées à plat,
    visibles d'un coup) ; bouton « Je passe à l'étape suivante » retiré partout
    (HTML + câblage) — plus d'accordéon donc plus de sens ; `fermetureManuelleUniquement`
    retiré des sous-sections contrat / disponibilité (inerte). Rangée « Disponibilité »
    (4 choix) affichée pour **tous** les objectifs (offre / spontanée / reconversion
    inclus ; avant : masquée hors immersion) — décision Denis 2026-09-03.
    `blocDisponibilite` passé à `.jeton` (`data-dispo` inchangé). Immersion inchangée
    (bloc dédié « Vos disponibilités » + dates/heures actées ailleurs).
  - **6a-ter FAIT (`61dfc64`)** : `contenuModeRecherche()` — sur `pageObjectif`
    (`!depuisBilan`), `modeRecherche` (métier / domaine) et `typeRecherche`
    (simple / offre) passés en `.jeton--radio`, une ligne + phrase d'aide
    (structure maquette v5). Câblage `wireModeRecherche` inchangé (attributs
    `data-mode-recherche` / `data-type-recherche`). Fenêtre Candidature du Bilan
    (`depuisBilan`) : rendu 2 colonnes `.pastille` conservé, vérifié identique.
  - **6a-quater FAIT (`e8f733b`)** : `sousSectionsPlates` sur
    `CONFIG_BLOC_CANDIDATURE` → plus d'accordéon interne « Comment souhaitez-vous
    rechercher un emploi ? » (se repliait seul une fois complété) ; contenu
    directement sous l'en-tête, titre-question en `.ss-titre-plate`. Chemin
    immersion (`contenuCandidature` + `wireObjectifDetails`) vérifié OK.
  - **6a-5a FAIT (`39ddaf8`)** : durée / dates / heures d'une immersion déplacés
    du bloc « Candidature » vers « Vos disponibilités » (maquette v5, légende).
    `contenuImmersionCalendrierChamps()` extrait ; rendu inline dans
    `contenuCandidature` uniquement hors écran Objectif (`pageActuelle !== 'objectif'`
    → modales candidature rapide + fenêtre Bilan inchangées) ; sur Objectif, rendu
    par `contenuDisponibilite` sous les 4 jetons. Câblage `wireObjectifDetails`
    inchangé (id document-wide).
  - **6a-5 CLOS à 6a-5a (décision Denis 2026-09-03)** : bloc recruteur + bloc
    couleur d'entreprise renvoyés à la **passe de convergence Bilan**
    (`TACHES_VALIDEES.md`, entrée IMPORTANCE MAJEURE, cible option C). Motif :
    code partagé à 3 endroits + le retrait du recruteur d'Objectif immersion
    exige un point de capture à « Passer à l'action » (structurel).
  - **6b FAIT — « Vos informations » entièrement en jetons** (scoping
    `_vosInformationsRenduEnCours` ; Découverte + « Modifier mon CV » / Bilan
    gardent `.pastille` / `.btn`) :
    - 6b-1 (`291b7c3`) Identité : civilité + « photo sur le CV ? » → `choixRadioVosInfos()`.
    - 6b-2 (`f48ed81`) Mobilité : permis / véhicule Oui-Non (radio) + catégories
      (case à cocher) ; `wireMobilite` `.permis-cat` → `[data-permis]`.
    - 6b-3 (`03e1608`) Formations : type (Diplôme / Titre pro / CQP / Sans diplôme)
      + niveau RNCP → radio.
    - 6b-4 (`caeb7cf`) Missions de formation : secteur (radio) + exemples de
      missions (case à cocher), valeurs échappées.
    - 6b-5 (`52dc737`) Certifications : question Oui / Non → radio
      (`contenuCatalogueOuiNon`, `contexteVosInfos`).
    Vérifié navigateur : 36 jetons sur l'écran, 0 `.pastille` de choix résiduelle,
    0 ancien bouton Oui/Non, 0 erreur JS. Câblages inchangés (sélecteurs
    d'attributs / ids). `npm test` 646 verts.
  - **6c FAIT (`3721a6b`)** : page Assistant — `jetonsGroupeStyleCV()` + jetons
    « Votre situation en ce moment » → `.assistant-jeton` / `.on` remplacés par
    la brique `.jeton--radio` / `.is-actif` (même forme / taille que les 2 autres
    écrans). Comportement inchangé (choix unique par groupe, 2ᵉ clic
    désélectionne). CSS `.assistant-jeton` (mort) retiré. La `MAQUETTE_ASSISTANT`
    v5 montrait un jeton pilule sans coche — écarté au profit du style majoritaire
    (rond + coche, plus lisible), conforme à la demande « même style partout ».
  - **6d FAIT (`d690452`)** : catalogues inline sur « Vos informations » (fin des
    fenêtres). `selectCatalogueInline()` : menu déroulant `<optgroup>` + ligne
    « Autre » directement dans la sous-section pour certifications / loisirs /
    engagements / expériences perso (maquette v10). `ouvrirFenetreCatalogue`
    conservée pour « Modifier mon CV » / Bilan (`contexteVosInfos` faux). Ajout →
    même forme de donnée que la fenêtre ; dates / contexte / missions ensuite via
    le clic sur le chip (`blocPastillesEditables`, inchangé). « Oui » certifications
    ne rouvre plus de fenêtre. Vérifié : 4 selects, ajout liste + « Autre », 0
    fenêtre, éditeur de chip inline OK, scoping OK.
  - **>>> ÉTAPE 6 TERMINÉE** : Objectif + Vos informations + Assistant — jetons
    homogènes (brique `.jeton`) + « Vos informations » sans fenêtre de catalogue.
  - RESTE au fil de l'eau (`BRIQUES_COMMUNES` B.6) : `.pastille-selection` inline
    hors parcours guidé ; passe de convergence Bilan/Découverte/Modifier
    (`TACHES_VALIDEES`, importance majeure).
  - **ÉTAPE 8 FAITE (2026-09-03)** : aide contextuelle / l'ampoule. `AIDE_PAGES` /
    `AIDE_FENETRES` (`js/app.js` ~31685) revues pour les 6 écrans du parcours
    `nouveau` (`objectif`, `votre-parcours` [nouvelle entrée], `projet`,
    `revelation`, `assistant` [nouvelle entrée], `resultats`) : sélecteurs morts
    remplacés (`.objectifs` → `.grille-objectif` ; `.accordeon` → `.bloc-erip` ;
    `.ligne-etapes-action` → `[data-rect-doc]` ; `.resume-bloc-erip
    .pastille-mini-conteneur` → `[data-blocs-tout]` ; `#blocERIP-pistes` retiré),
    entrées ajoutées pour les nouveaux blocs (`#blocERIP-candidature`,
    `#blocERIP-projet`) et le stepper commun (`.barre-etapes-bilan`, « Où vous en
    êtes »). Ménage : `_AIDE_ETAPES_QUESTION_MULTI` +
    `AIDE_FENETRES['candidature-rapide']` supprimés (consommateurs retirés).
    Vérifié navigateur : 0 entrée écartée par le filtre de la visite guidée sur
    les 6 écrans. `npm test` 646 verts.
  - **>>> CHANTIER REFONTE DU PARCOURS GUIDÉ — TERMINÉ CÔTÉ CODE** (étapes 1→8 +
    convergence Bilan + dette B.3 + polissage). Reste : vérification manuelle de
    bout en bout par Denis.
- Intégrer au fil du code les 4 priorités HAUTE de
  `REVUE_CRITIQUE_REGLAGES_CV_2026-09-02.md`.

## Reste à faire (hors code direct)

1. ~~Question « statut / situation »~~ **FAIT (`b78b343`, 2026-09-03, re-vérifié
   navigateur le 2026-09-04)** : champ **facultatif « Votre situation en ce
   moment »** dans le rectangle « Réglez le style » de la page Assistant (pas sur
   « Votre objectif »). Sans défaut, jamais bloquant, jamais un diagnostic.
   Options : En poste / En recherche d'emploi / En études ou en formation / En
   reconversion / Reprise après une pause / Je préfère ne pas préciser.
   `dossier.situationActuelle` (null par défaut, `js/app.js:429`), jetons
   `.jeton--radio` (`contenuRectangleStyleCV`, `js/app.js:9417`), transmis à
   l'assistant seulement si renseigné et différent de « non précisé »
   (`js/app.js:23349`), n'adapte aucun écran en aval. Maquette : `MAQUETTE_ASSISTANT`
   v5, commit `a93694d`. *(Cette ligne disait encore « reste à câbler » dans
   cette photo du 2026-09-02 soir, antérieure à `b78b343` — corrigé ici.)*
2. ~~Sweep séparé « Mon/Mes -> Votre/Vos » sur le reste de l'app (§9.5)~~
   **VÉRIFIÉ FAIT (2026-09-04)** : recherche exhaustive de `Mon projet`,
   `Faire le point`, `Mes informations`, `Mon CV`, `Mes documents` en texte
   visible (hors commentaires de code) dans `js/app.js`, `data/metiers.js` et
   `modules/*/*.js` - **zéro occurrence restante**, toutes les mentions
   trouvées sont des commentaires historiques (`// TACHE (refonte Mon
   projet...)`). Les seuls « Mon »/« Mes » restants sont des **noms propres de
   modules indépendants** (« Mes Repères », « Mon Carnet »), hors périmètre du
   sweep. Tracé dans `TACHES_VALIDEES.md`.
3. ~~Passe de convergence des autres parcours sur les écrans / fenêtres de
   « Vos informations »~~ **TERMINÉE côté code (6conv-1 → 6conv-6, voir
   `TACHES_VALIDEES.md`)** : Bilan (le plus concerné), Découverte (partiel -
   civilité/recruteur/couleur restent `.pastille`, non gênant) et « Modifier
   mon CV » alignés sur la brique `.jeton` + sous-sections à plat + éditeur
   d'expérience en ligne. **Restent, par choix délibéré (résorption chantier
   par chantier, pas un défaut de ce chantier-ci)** : dette **B.1**
   (`BRIQUES_COMMUNES.md`, ~5 collecteurs de contexte de candidature séparés,
   « le plus gros ») et l'alignement complet de Découverte au-delà de
   Formations/Mobilité.

## Contraintes permanentes rappelées

- Français impeccable, accents partout ; **jamais de tiret cadratin ni demi-cadratin** (`—` / `–`) nulle part.
- Jamais le mot « IA » visible, jamais d'icône visage / tête de robot / œil.
- Toute variable de couleur a sa valeur `[data-theme="sombre"]`.
- `js/app.js` / `data/metiers.js` / `modules/*/*.js` non couverts par les tests Node → test navigateur obligatoire.
- Commits directement sur `master` une fois vérifiés ; messages en français sans tiret cadratin ; `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Jamais `git add -A` (fenêtres Claude parallèles).
