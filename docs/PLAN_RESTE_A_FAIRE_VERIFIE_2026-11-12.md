# Plan du reste à faire, vérifié contre git et le code (12/11/2026)

> Demande de Denis (12/11/2026) : relire tout ce qui est noté « reste à faire », vérifier que ce n'est pas déjà fait (commits et code, pas la mémoire), puis donner la liste réelle, avec le contrôle des régressions, pour finir ce plan et passer à la suite. Ce document remplace, pour le reste à faire, les statuts de `docs/PLAN_DE_REPRISE_SECOND_COMPTE_2026-11-10.md` (qui reste l'historique du 10/11/2026).

## 1. Méthode et limite

**Sources relues** : le plan du 10/11/2026 en entier ; `docs/ETAT_DES_CHANTIERS.md` partie 0 (photo la plus récente) ; les consignes 150 à 262 de `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` (dernier statut de chacune) ; les 46 lignes `[À FAIRE]`, `[EN COURS]`, `[EN ATTENTE]` de `docs/TACHES_VALIDEES.md` ; `docs/ERREURS_ET_BUGS.md` ; `outils/taches_programmees.json` (21 rappels datés).

**Contrôles faits ce jour** : `git log` (108 commits depuis le 10/11/2026), lecture du code concerné (`js/app.js`, `data/metiers.js`, `modules/decouverte-competences/`, `data/problemesCorriges.js`), essais de parcours rejoués (test de fumée, `unCvMetiersPage1` à `3`, `unCvMetiersPage6`, `unCvMetiersRetour`, `unCvPlusieursMetiers` : 0 échec), huit scénarios de reprise à deux largeurs (0 écart), `npm test` (2 701 verts).

**Limite dite clairement** : `docs/IDEES_A_RECLASSER.md` (idées, pas des engagements) et les anciens chantiers clos de `docs/TACHES_VALIDEES.md` (313 entrées `[CLOS]`) n'ont pas été relus ligne à ligne. Le chantier d'intégration du dossier `Cloud/` n'a été vérifié que par ses documents de reprise et l'outil de veille, pas par un audit du contenu.

## 2. Ce qui était noté « à faire » et qui est DÉJÀ FAIT (statuts corrigés aujourd'hui)

| Noté comme reste | Réalité vérifiée | Preuve |
|---|---|---|
| A.4 : présentation commune des trois entrées de « Mes documents » | Faite pour la présentation : « Créer », « Reprendre » et « Lettre et entretien en version rapide » lisent le même constructeur de bloc | `_htmlVoiePresentation`, `data/metiers.js`, appelé aux lignes 5496, 5513 et 7918 ; commits `5bab9d8a`, `3470c25e` |
| A.5 : vérifier les autres modules | Faite le 10/11/2026 (consigne 206) et rejouée aujourd'hui | test de fumée 0 échec, 8 scénarios × 2 largeurs 0 écart, 5 autres cartes passées au protocole le 11/11 |
| A.9 : statuts du registre en retard | Corrigés aujourd'hui | consignes 192, 195, 196, 199, 203 à 206, 210, 212 à 214, 246, 249 |
| Consigne 192 (page commune de Créer, page propre de la voie 3, titres exacts) | FAITE | commits `5bab9d8a`, `eebb54b2`, `3470c25e` |
| Consigne 195 (« Tout » et un bouton par expérience) | FAITE | commentaire « Consigne 195 » dans `decouverteParcours.js` |
| Consigne 210 (suggestions de réponses en boutons) | FAITE sous la consigne 217 | `decouverteAnalyse.js` garde le mode et 2 à 6 réponses |
| Consignes 212, 213, 214 (complément de CV, années) | FAITES le 10/11/2026 | « Suite » de l'état des chantiers |
| Consigne 246 (ordre des voies, page commune) | FAITE | mêmes commits que 192 |
| Essai « ucpm p6 : on arrive toujours en haut de la page » noté en échec | PASSE : 27 vérifications, 0 échec (l'échec venait de la fenêtre étroite du navigateur de test) | `unCvMetiersPage6` rejoué le 12/11/2026 |
| Tâche « Nouveautés en trois entrées » (en-tête `[À FAIRE]`) | FAITE | consigne 201 TRAITÉE le 10/11/2026 |
| Tâche « onglet Smic et inflation côte à côte » (consigne 117) | FAITE | C.4 et consignes 238 à 241 |
| Halos de tuiles dans les vidéos (consigne 259) | CORRIGÉ : huit vidéos rejouées | commit `386bc1a1` |
| Vidéo d'introduction, diaporama et captures (consigne 261) | FAITS | commit `cac6eeee` |
| B.1 à B.4, C.1 à C.4, A.1 à A.3 | FAITS | voir le plan du 10/11/2026 |

## 3. CE QUI RESTE, par catégorie

### 3.1 À faire par Claude, tout de suite possible

| # | Tâche | Effort | Où on en est vraiment |
|---|---|---|---|
| R1 | **FAIT le 12/11/2026 : rien à mettre à jour.** Les pages de l'Insee (`1893149`, paru le 04/12/2025, et `8581424`, mise à jour du 12/11/2026) donnent toujours le recensement 2022, aucun fichier 2023 par département ; les deux fichiers gardent leurs valeurs, date de vérification passée au 12/11/2026, rappel marqué fait. À revérifier au prochain passage de veille. Ancien libellé : **Recensement 2023 : formation et temps partiel** (`modules/comprendre-les-chiffres/contenu/formation-insee.md` et `temps-partiel-insee.md`, qui utilisent le recensement 2022). Vérifier sur les pages de l'Insee qu'une version 2023 existe, puis mettre à jour. | moyen | Rappel « À FAIRE tout de suite » dans `outils/taches_programmees.json` (id `recensement-2023-formation-temps-partiel`). Fichiers vérifiés pour la dernière fois le 06/11/2026. |
| R2 | **MESURÉ le 12/11/2026 avec un nouvel outil (`scripts/rendu/imprimerReel.js`) : 37 modèles sur 39 s'impriment sur 1 page, seul « Rectangles arrondis » (créatif et sobre) passe sur 2 pages (feuille de 1 173 px au lieu de 1 123, jeu d'essai très rempli). CAUSE ÉTABLIE : pas un défaut du test, un CV très rempli (surtout 4 certifications) déborde de 50 à 76 px même resserré à 9 px, et rien n'avertit la personne avant le clic sur « Mise en page ». Denis a choisi LES DEUX (message visible et compactage du modèle) le 12/11/2026. MAQUETTE FAITE : `docs/maquettes/maquette-cv-rectangles-compact-et-message-2026-11-12.html` (trois dispositions dont l'idée de Denis : liste longue en deux colonnes et savoirs remontés ; message jaune ; mode sombre). PRÉCISION DE DENIS (12/11/2026) : les rectangles se déplacent librement et peuvent se chevaucher ; ce qui compte est que le texte couvert se pousse tout seul pour rester visible. DÉMONSTRATION DÉPLAÇABLE FAITE : `docs/maquettes/maquette-rectangles-deplacables-texte-qui-se-pousse-2026-11-12.html` (faisabilité montrée, rien codé dans l'application). Reste : validation par Denis, puis code (effort haut).** Ancien libellé : **Impression PDF du CV « Vendeuse » sur 2 pages** (`docs/ERREURS_ET_BUGS.md`, trouvé le 07/10/2026, noté NON corrigé). Rejouer d'abord : le défaut existe-t-il encore ? (impression réelle avec Chrome sans interface, `--print-to-pdf`). | bas pour vérifier, haut si encore présent | Aucun commit ne le mentionne depuis. Statut inconnu : c'est la seule façon de le savoir. | **CODÉ le 12/11/2026 (commit ad488afe, consigne 265)** : texte couvert poussé (zone libre et disposition de départ) et message jaune de dépassement avec ses deux boutons ; les 2 modèles imprimés sur 2 pages avec un CV très rempli sont connus, le message prévient désormais. Reste : l'essai de Denis (souris et doigt).
| R3 | **AUDIT FAIT le 12/11/2026 (lecture seule, relevés du protocole `scripts/parcours/protocole/sorties/`, 0 anomalie de fond). Constat : aucun écart de structure entre les trois entrées (titre `h1`, barre d'étapes, bouton « Retour » à gauche, « Accueil » : identiques). Trois petits écarts : (1) le titre « L'assistant en ligne » s'écrivait avec une apostrophe droite dans « Créer » et courbe dans « Reprendre » et « Lettre et entretien » (décision C19 du 31/10/2026 : même titre) : CORRIGÉ le 12/11/2026 (`js/app.js`, entré dans le commit 60c8f4fd de l'autre séance), parcours `creerAssistant` rejoué 0 anomalie, `npm test` 2 714 verts ; (2) la page « Le complément de votre CV » a deux icônes différentes selon la voie (symbole plus dessiné dans `js/app.js` ligne 14112 et 41183, émoji ➕ dans `decouverteParcours.js` ligne 2367) ; (3) la pastille « Voie N » n'existe que dans les pages de présentation, aucun écran de travail ne dit sur quelle voie on est. Les points 2 et 3 attendent la décision de Denis (voir la réponse du 12/11/2026).** Ancien libellé : **A.4, reste : écrans de travail de « Créer »** : pastilles « Voie N » et titres des écrans de travail (le plan A.4 les mentionnait, les pages de présentation les ont déjà). Audit en lecture seule d'abord : comparer l'en-tête de chaque écran de travail des trois entrées. S'il y a un écart, maquette et questions à Denis avant code. | moyen (audit), haut (si maquette) | La pastille « Voie N » n'existe aujourd'hui que dans les pages de présentation (grep sur tout le dépôt). Pas de preuve d'écart visible : l'audit le dira. |
| R4 | **DÉJÀ FAIT, vérifié le 12/11/2026 : sur 486 fiches, 483 ont un second niveau (496 entrées, `checkLexique` : 0 erreur, 0 avertissement). Les dix mots listés comme manquants (RGDU, PASS-IAE, transparence salariale, PUMA, déclaration trimestrielle AAH en Ésat, clause d'exécution ou critère d'attribution, coach, aide matérielle, groupe de pairs, personnes invisibles) et les mots de psychologie ont leur second niveau (commits `2640170b` du 06/11 et `8226e637` du 07/11, consigne 149). Restent trois fiches sans second niveau : Niveau de vie, Médiane, Pouvoir d'achat (créées le 07/11), qui s'expliquent déjà entièrement ; un exemple chiffré serait un chiffre inventé, donc recommandation : les laisser ainsi. Ancien libellé :** **Mots du Lexique sans second niveau** (K.3) : environ 19 restants, dont une quinzaine de psychologie volontairement écartés. Non faits : RGDU, PASS, transparence salariale, PUMA, déclaration trimestrielle AAH en ESAT, clause d'exécution ou critère d'attribution, coach, aide matérielle, groupe de pairs, personnes invisibles. | moyen | Demande des pages officielles lisibles ; sinon on laisse sans second niveau, jamais de texte inventé. |
| R5 | **FAIT le 12/11/2026 (consigne 267) : vidéo de 25 s faite avec des images réelles de ChatGPT sans compte, posée dans les quatre modules qui demandent une recherche web ; vidéo regardée et validée par Denis le 12/11/2026.** Ancien libellé : **Vidéo « activer la recherche web sur l'assistant en ligne »** : l'emplacement existe dans « Comparer mes pistes » (identifiant `comparer-activer-recherche-web`), mais aucun fichier vidéo n'existe dans `videos/` ni `video/`. | moyen à haut | Dépend des sites des assistants (jamais de compte, jamais de fausse copie d'écran). À garder en dernier. |
| R6 | **B.5 : liste « quelle vidéo montre quel écran »** dans `docs/BRIQUES_COMMUNES.md` | bas | Je ne la trouve pas. Recommandation : la **fermer sans la faire**, la règle de fin de chantier inscrite le 12/11/2026 dans `docs/TRAVAILLER_AVEC_DENIS.md` (« Présentations, vidéos et diaporama ») répond au même besoin. Décision de Denis. |

### 3.2 À faire à une date ou à la publication d'une source (rappels déjà dans l'outil de veille)

| Date | Tâche | Risque à surveiller |
|---|---|---|
| 13/11/2026 | Inflation définitive d'octobre (Insee) ; suivante le 27/11/2026 | Valeurs codées en dur dans `tests/comprendreLesChiffresInflation.test.js` et séries dans `smic-inflation.json` : changer la donnée ET le test dans le même commit |
| 01/12/2026 (A.7) | Smic : hausse annoncée de 1,6 %, à mettre à jour seulement à la publication du décret | Source unique `donnees/smic-inflation.json` ; les textes « Ce que cela veut dire, concrètement » sont calculés (consignes 238 à 241) : ne rien réécrire à la main ; `tests/smicSource.test.js` ; grep sur les fiches, mots du Lexique et chiffres qui citent le Smic |
| Décembre 2026 (C.5) | Taux de chômage localisés du 3e trimestre (région, départements) | Retirer la phrase « Ces trois chiffres sont ceux du 2e trimestre » (`_comprendreLesChiffresNoteNiveaux`) ; garde-fous `outils/veilleGardeTextes.js` et `veilleAppuis.js` ; règle : jamais un département nommé comparé à un autre |
| 04/12/2026, 10/12/2026 | Salaires 2025 par département ; zones d'emploi du 3e trimestre | Mêmes garde-fous |
| À la publication (C.6) | Offres d'emploi (Data Emploi) et emploi salarié (Insee) du 3e trimestre | Chaque carte doit afficher la période réelle de sa donnée |
| 20/01/2027 | `entreprises-departements.md` (BODACC) | Procédure `docs/CONTROLE_ECHANTILLON_BODACC_2026-10-19.md` |
| 28/01/2027 (C.7) | France Travail et Dares, 4e trimestre 2026 | Méthode de relevé du plan du 10/11/2026, section 4.3 (interface de données de la Dares, jamais le contrôle anti-robot) |
| 21/06/2027, 01/10/2027 | Portrait du territoire ; Union européenne | Dates estimées, à confirmer |

### 3.3 À faire par Denis (rien ne peut être vérifié à sa place)

1. **Essais réels des huit modules** après la consigne 258 (bloc « Reprendre / Recommencer », bouton « Reprendre » à droite), et de « Créer » et « Reprendre » après les consignes 192 et 261.
2. **Essai du récit de bout en bout avec un vrai assistant** : les suggestions de réponses (consignes 210 et 217) arrivent-elles et restent-elles fidèles au récit ? Le complément arrive-t-il avec la vraie réponse ? (consigne 212).
3. **Relire** `data/problemesCorriges.js` (huit lignes aujourd'hui, champ `origine`), les textes des Nouveautés ; **regarder** la vidéo de la disquette, la vidéo d'introduction refaite (3 min 11), et les huit vidéos de modules rejouées.
4. **Essais du module « Un CV, plusieurs métiers »** : prompts des lettres V7, conseils de savoir-être, Word réel (un fichier par CV), parcours complet et aperçu de la feuille en grand.
5. **Test du prompt de la lettre (L1)** sur trois ou quatre vrais CV.
6. **Umami** : l'événement `lexique_recherche_sans_resultat` existe-t-il, combien de fois par mois ?

### 3.4 Décisions ou confirmations de Denis avant tout code

- **TRANCHÉ le 12/11/2026 (consigne 266) : R6 fermée sans être faite ; L1 codée (« Retour » garde le mot tapé, commit 02d21097) ; consigne 194 réglée ; consigne 200 laissée de côté.** Anciens libellés : **Consigne 200** (une autre page « Coller » au-dessus du CV à la reprise du récit) : non reproduite, chemin exact à lui demander.
- **Consigne 194** (l'écran qui bouge) : corrigé sous réserve, confirmation attendue. (Consigne 202 : CLOSE.)
- **L1** : dans le Lexique, « Retour » depuis une fiche ramène à la recherche vide ; garder le mot tapé est-il voulu ?
- **R6** (B.5) : fermer sans le faire ?
- **Consigne 263 (autre séance, 12/11/2026)** : importer les 1 923 fiches du ROME dans une seule base, à deux niveaux de finesse. Plan en cinq phases écrit (`docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md`, commit `4f160257`), **EN ATTENTE du feu vert de Denis pour la phase 1** (générateur et échantillon de 30 fiches à relire). Gros chantier, hors de ce plan : il touche aux listes de « Votre parcours » (consigne 262), à l'assistant, au répertoire des métiers et à tous les modules qui lisent la base. À ne commencer qu'après la fin des petites tâches ci-dessus, avec le protocole complet à chaque phase.
- **Consigne 177 : REPORTÉE À LA FIN par Denis le 12/11/2026 (consigne 268), elle dépend de l'import des compétences du ROME (consigne 263).** Ancien libellé : **Consigne 177** : cinq décisions en attente sur l'allègement des consignes et la dépendance aux assistants (`docs/INVENTAIRE_ALLEGER_PROMPTS_ET_DEPENDANCE_ASSISTANTS_2026-11-08.md`).
- **Questionnaire de retours** : RETIRÉ du plan le 12/11/2026 (Denis l'a très simplifié, consigne 269). Ancien libellé : questionnaire de retours (Google Forms, noté le 27/08/2026), à revoir ensemble.
- **Piste `data.inclusion`** pour « Près de chez moi » : INSTRUITE le 12/11/2026 (mesure sur le vrai fichier, résultat dans `docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md` section 10) ; recommandation : source de propositions validées par Denis, jamais un remplacement du registre ; PILOTE « garde d'enfants » fait le 12/11/2026 : `docs/PILOTE_DATA_INCLUSION_GARDE_ENFANTS_2026-11-12.md` (52 nouvelles crèches joignables, 5 sans contact écartées, fiches souvent anciennes en Haute-Vienne) ; reste à décider si on poursuit.

### 3.5 En dernier (décidé par Denis le 10/09/2026 : après toutes les petites tâches)

- **Accessibilité** : 150 boutons sans nom accessible (réglages de mise en page, pastilles de couleur), mode « accompagné / autonome », option « je ne suis pas francophone », socle typographique.
- **Découpage de `js/app.js`** (environ 30 900 lignes) et dette B.7 (panneau Word du Projet XXL).
- **Message de confirmation pour l'autre compte** (consigne 89) : seulement une fois TOUTE l'intégration du dossier `Cloud/` terminée.

### 3.6 Écartés ou en réserve : ne pas reproposer

Comparaison des salaires avec l'Europe (consigne 239, abandonnée le 10/11/2026) ; page des employeurs qui accueillent des stagiaires (en réserve) ; conseiller titres et formations par secteur (en réserve) ; sauvegarde automatique locale (tranché contre) ; module de courriers administratifs (autre application).

## 4. Régressions : ce que chaque tâche ne doit pas casser

### 4.1 Décisions déjà implémentées que toute tâche doit respecter

| Zone | Décision (consigne) | Contrôle |
|---|---|---|
| Barre du bas | Bouton de gauche toujours « Retour » (251) ; « Reprendre » à droite, sur la même ligne (250, 254, 257) ; « Continuer » toujours dans la barre du bas (208) | `scripts/parcours/protocole/` : `mesureReprise` |
| Reprise d'un module | Même forme que « Reprendre mon CV » dans les huit modules (258) ; « Retour » du premier écran identique partout (256) | 8 scénarios × 2 largeurs |
| Accueil et tuiles | Aucune tuile qui pulse (259), seule la bulle (i) pulse ; « Fiche mise à jour » en violet (260) | essai navigateur, vidéos rejouées |
| Créer un nouveau CV | Trois questions seulement dans « Votre parcours » (261) ; plafonds 16 / 16 / 12 et listes élargies (262) ; langue et permis ne bloquent jamais ; ordre des voies 1 assistant, 2 récit, 3 à la main (246) ; titres des pages = nom exact du module (192) | parcours `creerAssistant`, `creerMain`, smoke |
| Plus de renvoi vers « Votre objectif » ni de fenêtre pour l'entreprise (252, 253) | Parcours « Reprendre » et version rapide | protocole |
| Pages de présentation | Une seule colonne (190) ; tailles de texte 16, 17, 18 px (187) ; « Mots de cette page » en bas (218) ; aucune invitation à lire un mot du Lexique dans « Comprendre les chiffres » (240) | `tests/` (`tailleTexteStandard`, `comprendreLesChiffres*`) |
| Chiffres | Source au survol de chaque chiffre (237) ; jamais un territoire nommé comparé à un autre ; chaque comparaison sur la même période | `tests/comprendreLesChiffresDisposition.test.js`, `veilleGardeTextes.test.js` |
| Règles générales | Jamais le mot « IA » visible, pas de tiret cadratin, accents, mode sombre, source unique | grep avant publication ; `npm test` |

### 4.2 Contrôles à rejouer AVANT et APRÈS chaque tâche de code

1. `npm test` entièrement vert (2 701 aujourd'hui).
2. `node scripts/checkLexique.js` : 0 erreur ET 0 avertissement, dès qu'un mot ou une fiche du Lexique change.
3. Test de fumée ciblé : `node scripts/parcours/lancerEssais.js <identifiants> sortie.json`, lire `echecs`.
4. Pour tout changement de `js/app.js` ou de `modules/*/ui.js` : test navigateur obligatoire, jamais seulement les tests Node.
5. Pour tout changement d'écran : planches d'images et règle « une capture, une vidéo ou une phrase d'introduction montre-t-elle l'écran modifié ? » (`docs/TRAVAILLER_AVEC_DENIS.md`).
6. Avant de toucher une fonction partagée : grep sur tout le dépôt (jamais un seul fichier).

### 4.3 Risque propre à chaque tâche

| Tâche | Risque de régression | Garde-fou précis |
|---|---|---|
| R1 recensement 2023 | Un chiffre change, un texte garde l'ancien : le test échoue (voulu) ; un classement entre territoires nommés peut réapparaître | Mettre à jour `outils/appuis/2026-06.appuis.txt` et les tests dans le même commit ; vérifier les trois niveaux d'affichage, clair et sombre |
| R2 impression 2 pages | Toucher la mise en page d'un modèle de CV peut déplacer tous les autres modèles ; le PDF est la référence, jamais sacrifié pour le Word | Vérifier d'abord, corriger seulement si le défaut existe ; essai qui compare tous les mots avant et après ; impression réelle |
| R3 écrans de travail de « Créer » | Titres alignés (192), boutons de la barre du bas (250 à 258), barre d'étapes, « Vos informations » (255, 261) | Audit en lecture seule d'abord ; si changement : protocole complet (8 scénarios × 2 largeurs) + parcours smoke + `npm test` |
| R4 Lexique | Un mot sans page officielle lisible ne reçoit aucun texte ; règle « aucun chiffre sans source » | `node scripts/checkLexique.js` |
| R5 vidéo recherche web | Dépend de sites externes ; jamais de compte ni de contournement anti-robot | Aucune modification du code de l'application, seulement un fichier vidéo et son emplacement déjà posé |
| A.7 Smic (décret) | Un montant écrit à deux endroits | Une seule source ; `tests/smicSource.test.js` ; les textes calculés suivent seuls |

## 5. Ordre proposé pour finir ce plan

1. **R1** `[effort : moyen]` et **R2** (vérification seulement, `[effort : bas]`) : deux contrôles courts, sans maquette.
2. **R3** `[effort : moyen]` : audit en lecture seule des écrans de travail de « Créer » ; si écart, maquette et questions à Denis avant tout code `[effort : haut]`.
3. **R4** `[effort : moyen]`, au fil des pages officielles lisibles.
4. **Décisions de Denis** de la section 3.4 (la plupart tiennent en une ligne chacune).
5. **R5** en dernier des petites tâches.

**Recommandation honnête sur la fin de ce plan** : les tâches datées (section 3.2) ne peuvent pas être faites avant leur date, la dernière étant le 28/01/2027. Je recommande de **déclarer le plan CLOS** quand R1 à R4 et les décisions de Denis sont faites, et de laisser les tâches datées à l'outil de veille (« Tâches programmées »), où elles ont déjà chacune leur rappel et leur consigne. Le plan reste alors ouvert sur trois dépendances extérieures seulement : les essais de Denis, les dates de publication, et les gros chantiers de fond de la section 3.5.
