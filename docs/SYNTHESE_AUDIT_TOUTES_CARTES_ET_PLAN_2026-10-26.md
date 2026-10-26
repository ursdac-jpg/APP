# Synthèse de l'audit de toute l'application et plan de corrections groupées (26/10/2026, Mode A, `[effort : haut]`, rien codé)

**Document d'entrée pour la session locale.** Il regroupe ce qui a été trouvé dans les six cartes de l'accueil et propose de ranger les corrections par **cause commune** (une brique corrigée une fois profite à tous les modules), dans un ordre d'exécution avec, pour chaque lot, l'effort, le risque, la preuve de non-régression et la décision éventuelle de Denis.

Documents sources (tous dans `docs/`) :
- `CHANTIER_VOS_DOCUMENTS_COHERENCE_2026-10-26.md` : carte « Mes documents » (constats **C1 à C23**), mesures `mesures_2026-10-26/`.
- `CHANTIER_AUDIT_TOUTES_CARTES_2026-10-26.md` : cartes 2 à 6 (constats **D1 à D31**).
- `CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md` : conception détaillée du registre (lot 5).
- `PLAN_VOS_DOCUMENTS_COHERENCE_2026-10-26.md` : plan initial de « Mes documents » (lots 0 à 7), intégré ci-dessous.
- `MESSAGE_LOCAL_VOS_DOCUMENTS_2026-10-26.md` : message à coller dans la session locale.

## 1. Ce qui a été audité
| Carte | Modules | Profondeur |
|---|---|---|
| Mes documents | Créer (3 parcours), Reprendre (3 voies), Lettre et entretien rapides (2) | **de bout en bout**, vrais clics, clair et sombre |
| Me préparer à candidater | Lettre avec l'assistant, Entretien, Employeurs | de bout en bout (Employeurs : 2 écrans, module fermé au public) |
| Boîte à outils | Mes Repères, Mon Carnet, Lexique | de bout en bout (créer, modifier, supprimer, chercher) |
| Outils d'analyse | Analyser ma candidature, Regard, ATS, Cohérence | **tous de bout en bout** (Bilan : l'étape « Terminé » n'est pas atteignable sur mon chemin, voir D42) |
| Se tenir informé | Comprendre le cadre, Comprendre les chiffres, Qui fait quoi | consultation complète (département, rayon, fiche, chiffres) |
| Vous hésitez encore ? | Comparer mes pistes, Un CV plusieurs métiers | **les deux de bout en bout** (UCPM : 8 pages, 4 passages de l'assistant, vraies réponses archivées) |

Contrôles automatiques appliqués à **chaque écran visité** : tiret cadratin ou demi-cadratin, mot « IA » ou tête de robot, emoji de visage, débordement horizontal, contraste du texte (clair et sombre), chevauchement par un bouton flottant, écran vide.

## 2. Résultats des contrôles automatiques (non-négociables du `CLAUDE.md`)
- **Tiret cadratin / demi-cadratin visible : aucun** sur tous les écrans visités. **Mot « IA » ou tête de robot : aucun. Emoji de visage : aucun.** Aucun écran vide. Aucun débordement horizontal à 1280 px.
- **Mode sombre (défauts réels)** : (1) la pastille du métier choisi (« 🎯 Agent d'accueil », `a.metier-resume-nom`) est **blanche sur bleu clair** (contraste 2,5) ; (2) le bouton « Télécharger le Word » de l'export de l'entretien rapide (`pastille-selection pastille-export-docx`) a un contraste de **1,2** (bleu sur gris) : presque invisible.
- **Chevauchements** : (a) le bouton flottant du **Carnet** recouvre « + Garder une réflexion » dans Mes Repères (1280 px) ; (b) à **375 px** (téléphone) il recouvre le titre de la page d'accueil, des modules et des cartes (voir la section mobile ci-dessous) ; (c) les quatre boutons flottants du haut (aide, nouveautés, préférences, session) recouvrent « Revoir la présentation » et des choix « Oui / Non » dès que la page défile.
- **Mobile (375 px)**, 14 parcours rejoués (`docs/mesures_2026-10-26/anomalies_mobile.jsonl`, 72 relevés) : **aucun problème de texte ni de contraste**, **un seul débordement horizontal** (Mes Repères après « C'est noté » : page de 387 px sur 375, **D37**) et **71 chevauchements** de deux sortes : (a) le bouton flottant du **Carnet** recouvre le titre de la page (« Par où voulez-vous commencer ? ») et un repère de la barre d'étapes (« Vos informations », « Corriger mon CV ») ; (b) les **quatre boutons flottants du haut** (aide, nouveautés, préférences, session) recouvrent des repères de la barre d'étapes (« Assistant », « Réponse ») et, dès qu'on fait défiler, les cartes d'objectif (« Changer de métier », « Plusieurs métiers d'un même domaine ») et les choix « Oui / Non ». **D38** : sur téléphone, la personne ne peut donc pas lire toute sa barre d'étapes ni toucher certains choix sans faire défiler pour dégager les boutons. À traiter dans la grappe G7 (lot L4, effort bas à moyen, essai sur un vrai téléphone ou un émulateur obligatoire).

## 3. Les grappes de corrections (une cause, plusieurs modules)
Chaque grappe porte les constats qu'elle résout. **Effort** : bas, moyen, haut ; **Risque** : régression possible si mal faite ; **Où** : cloud (code + tests + scripts) ou local (décision, maquette, essai).

### G1. Le bouton « Continuer » et la barre du bas (la règle du 19/10/2026 appliquée partout)
Constats : C11, C16, D2, D5, D18, D30, D4, D33 (fin des analyses sans « Merci bien, j'ai fini »), D35 (boutons grisés sans explication), **D41** (étiquettes de Comparer hors de vue), **D45** (Cohérence : « Valider » dans la page), **D47** (UCPM : trois choix d'accroche, message sans dire lesquels), **D49** (UCPM page 8), **D50** (UCPM : deux « Continuer » à la fois). La règle : **un seul bouton principal, dans la barre du bas, nommé « Continuer »** sauf s'il valide (« Valider le CV »). Écarts relevés : « Continuer » dans la page (récit « Découverte de vos compétences », reprise voie 2 « Récupérer votre CV », analyse de candidature « Organiser mon CV », UCPM), deux « Continuer » à la fois (UCPM), le même acte nommé « Valider le CV » / « Valider la lettre » / **« Continuer »** (entretien) / « Valider ma sélection » (analyse), aucun bouton principal tant que les coordonnées manquent (lettre). **Brique** : `data-barre-bas="1"` et `libelleSuivantBarre()` existent déjà (`BRIQUES_COMMUNES.md`, « Bouton Continuer dans la barre du bas ») : la grappe consiste à **marquer** les boutons restants et à **nommer** l'acte « Valider ... » pour les trois documents. Effort moyen, risque moyen (chaque écran touché doit être rejoué), cloud puis essai local.

### G2. Le titre de la page (la personne doit savoir où elle est)
Constats : C13, C19, D22, D29, **D39** (trois écrans « Collecter les informations »), **D42** (« Corriger » sans titre), **D46** (quatre écrans « Mon CV de référence »), D43. Quatre pratiques : nom du module (Lettre, Entretien, Bilan), nom de l'**étape** (« Préparer », « Mon CV », « Ajouter mes pistes »), « Vos documents » pour tout, « Ma lettre de motivation rapide » pour la seule version rapide. **Proposition** : le titre = le nom du **module** sur tous les écrans de travail, et un sous-titre = l'étape quand elle apporte quelque chose. **Décision de Denis** (maquette) ; la mise en œuvre passe par le registre (G9) pour « Vos documents » et par un petit changement de texte ailleurs. Effort bas à moyen.

### G3. La barre d'étapes : un vocabulaire, un dernier repère, une barre par famille
Constats : C1, C2, C10, C21, D20, D27, D31, **D48** (« page 3 » dans le texte, repère « Accroches » dans la barre). Dix à douze barres, quatre noms pour le dernier repère (« Vos documents », « Terminé », « Ma fiche », « Mon CV », « Fin »), des barres de **navigation** (cadre, chiffres, Qui fait quoi) dessinées comme des barres d'**étapes**. **Proposition** : une table unique des vocabulaires (étape d'envoi : « Assistant » ; étape de résultat : « Résultat » ; dernier repère : « Terminé » pour les analyses et la lettre, « Vos documents » pour les CV) et un style distinct pour la navigation. Effort haut (touche les 14 barres), mais **réalisable repère par repère**. Décision de Denis sur le vocabulaire. Le cas Reformuler (C1) est un **défaut** à corriger sans attendre (lot L2).

### G4. Le dépôt du CV : une brique, une règle
Constats : **C18 (défaut)**, D1, D17, D21, C15, C20, C23. Dépôt par fenêtre commune (`ouvrirAssistantDepotCV`) dans six modules, mais : (a) le chemin « texte collé » ne pose pas `dossier.cvAnalyse` → voie 1, lettre rapide et entretien rapide arrivent sur « Votre parcours » avec l'ancienne barre (**C18**) ; (b) l'étiquette dit « texte collé » pour un fichier (D21) ; (c) l'objectif est obligatoire dans certains modules, facultatif dans d'autres (D17) et redemandé à chaque parcours (C20) ; (d) « Vos appuis » est redemandé à chaque passage de l'assistant (C23) ; (e) le blocage de « Continuer » dit « il reste à indiquer... dans Adaptation au métier » sans montrer où (D1). Effort : C18 bas (lot L0) ; le reste moyen à haut, à traiter après le registre.

### G5. « Retour » et fin de parcours
Constats : C7, C12, C14, C17, D6, D7, D3, **D33, D40, D44** (aucun module d'analyse ou d'orientation ne se termine par « Merci bien, j'ai fini » : Regard, ATS, Cohérence, Comparer, UCPM). Le « Retour » a cinq mécanismes (C12) ; « Retour » de « Votre profil » saute « Votre parcours » (C7) ; sans session du module, il ne fait rien (C14). La **fin** : la décision de Denis des 15, 16 et 17/09/2026 (« pas de fenêtre quand la page propose déjà la suite ») n'est appliquée qu'à `nouveau`, Reformuler et la lettre ; les voies 1, 3 et le récit ouvrent « Et maintenant ? » **en doublon** de ce que la page propose déjà (C17). L'entretien rapide parle d'« effacer les informations » (D7). La suite proposée est asymétrique (lettre approfondie → fiche **rapide**, entretien → lettre approfondie : D3, D6). **Correctifs** : C7 et C14 simples (lots L1) ; C17 : appliquer la règle de Denis à tous les CV (lot L6, décision à confirmer) ; le reste passe par le registre (G9).

### G6. Les textes et le français (Non-négociable « Français impeccable » et cohérence)
Constats : D9, D11, D12, D25, D26, D32 (accord de la pastille « recommandé », à vérifier à l'écran), C22, D16, D17 (texte). Majuscules de titre anglaises (« Non Analysés », « Deuxième Regard »), astuce « Windows + H » montrée à tous, titres coupés en plein mot (« Comment présenter mes quatre »), deux mots pour le même verrou (« territoire », « département »), CTA « Ouvrir X → Commencer → » vs « Je commence », libellés d'export différents, intertitre « Ce que l'assistant a repéré » dans le parcours sans assistant (C8). **Corrections simples, à faire en un passage, avec `grep` sur tout le dépôt** ; seul le texte est touché. Effort bas ; risque faible ; à relire par Denis (public cible). Lot L3.

### G7. L'aspect : flottants, contrastes, champs
Constats : D13, D14, D15, deux contrastes en mode sombre, chevauchements mobile. Corrections CSS : **sur téléphone**, laisser une bande réservée en haut (les quatre boutons flottants ne doivent pas recouvrir la barre d'étapes) et déplacer ou replier le bouton du Carnet ; réserver la place du bouton flottant du Carnet (marge droite ou position repliée sur petit écran), élargir le champ de recherche de Mes Repères, corriger deux couleurs en mode sombre (`.metier-resume-nom`, `.pastille-export-docx`), icône distincte pour un des deux thèmes du Lexique. **Rappel du `CLAUDE.md`** : toute variable de couleur a sa valeur `[data-theme="sombre"]`. Effort bas, risque faible (CSS), essai visuel local obligatoire. Lot L4.

### G8. « Revoir la présentation » : une seule brique
Constats : D10, D24. Dix identifiants différents (`btnCoLettreRevoirPres`, `rrBtnRevoirPresentation`, ...), deux classes (`btn-revoir-module`, `bouton-revoir-explication`), des emplacements différents. Effort moyen, risque moyen (un bouton par module à câbler). Lot L8, après G9.

### G10. L'étape de l'assistant : une enveloppe commune (la plus grosse incohérence ressentie)
Constats : D34, C23, D33, C19. Les pièces sont communes (fenêtre « Avant de continuer vers X », « Je suis de retour », « Coller la réponse », pastilles d'assistant) mais **six enveloppes différentes** (page à rectangles, écrans successifs, rectangle dans « Vos documents », « En attente de ... », titre unique, trois écrans pour le Regard) et des identifiants de bouton qui changent entre la première et la deuxième réponse d'un même module. **Proposition** : une fonction d'enveloppe qui prend en paramètre le module, le document attendu et le texte de la consigne, et qui rend la même séquence partout (choisir, aller chez l'assistant, revenir, coller, continuer). Effort **haut**, risque **élevé** (touche une douzaine de modules) ; à faire **après** le registre (L7) et par module, avec la matrice des parcours réels comme filet. Lot L11. Décision de Denis (maquette de la séquence unique).

### G9. Le registre des familles de « Vos documents » (le lot 5 refondu)
Constats : C1, C2, C10, C12, C13, C17, C19 (en partie), D3. Conception complète dans `CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md` : module pur `modules/vos-documents/familles.js`, test pur Node qui **encode la matrice mesurée**, migration en **parité d'abord** (la matrice ne bouge pas) puis décisions une par une. Effort haut, risque moyen, **non apte au mode Nuit**. Lot L7.

## 4. Ordre d'exécution (à faire en local)
Chaque lot : annoncer le mode et l'effort, relire le cahier du lot, **grep sur tout le dépôt**, un commit par sous-étape, `npm test` identique à l'état de départ, scripts de mesure rejoués (`docs/mesures_2026-10-26/`), ligne au `JOURNAL_DES_CHANGEMENTS.md` pour tout changement visible, essai de Denis avant fusion.

| Lot | Contenu | Effort | Décision de Denis | Dépend de |
|---|---|---|---|---|
| **L0** | **C18** : poser `cvAnalyse` au dépôt par texte collé (`data/metiers.js`, ligne 3458 et chemin texte) | bas | non (défaut clair) | |
| **L1** | **C7** (« Retour » de « Votre profil » → « Votre parcours »), **C14** (« Retour » du récit sans session), **C8** (intertitre sans assistant, texte à valider) | bas | texte de C8 | L0 |
| **L2** | **C1** : barre de Reformuler jusqu'au bout (branche `_origineReformuler` dans `afficherProgression`) et question du 2e passage de l'assistant | moyen | **oui** : retirer le 2e passage ? | L1 |
| **L3** | **G6 textes** : D9, D11, D12, D25, D26, C22, C8 (une passe, `grep`) | bas | relecture des textes | |
| **L4** | **G7 aspect** : D13, D14, D15, deux contrastes sombres, chevauchements mobile | bas | essai visuel | |
| **L5** | **G1** : un seul « Continuer » dans la barre, « Valider ... » nommé pareil, message du blocage montrant la section (D1) | moyen | noms des boutons | L1 |
| **L6** | **C17** : fin de parcours (appliquer la règle de Denis à tous les CV) ; D7 : texte de l'entretien | bas | **oui** | L5 |
| **L7** | **G9** : registre des familles (étapes 0 à 7 du fichier de conception ; **l'étape 0 est faite** : `modules/vos-documents/familles.js` et `tests/vosDocumentsFamilles.test.js`, 26 essais verts) | haut | **oui** (vocabulaire, titre, fin) | L1 à L6 |
| **L8** | **G8** : « Revoir la présentation » unique | moyen | non | L7 |
| **L9** | **G3** : vocabulaire des barres, navigation distincte | haut | **oui** | L7 |
| **L12** | **Lot 8 du fichier `MESSAGES_PAR_LOT_RETOURS_2026-10-25.md`** : éditeur de CV (clignotement au changement de modèle, F27, F28), voir section 9 | haut | non pour 1 et 3 ; **oui pour F27 (capture)** | indépendant ; ne pas modifier `pageResultats` en même temps que L7 |
| **L11** | **G10** : une enveloppe commune pour l'étape de l'assistant (module par module) | haut | **oui** (maquette) | L7 |
| **L10** | **G4** (reste) : objectif repris d'un parcours à l'autre, « Vos appuis » une seule fois, récit à 6 cartes | haut | **oui** | L7 |

Les lots **L0, L1, L3, L4** sont petits, sans choix d'interface (sauf textes) et indépendants : ils peuvent être faits dans une seule séance locale, ou dans le cloud avec l'essai de Denis ensuite. Les lots L2, L6, L7, L9, L10 demandent d'abord les décisions de Denis et une maquette.

## 5. Ce qui reste, et pourquoi (cloud ou local)
Mise à jour du 26/10/2026 : **tout ce qui était faisable dans le cloud a été rejoué** (UCPM, Comparer, ATS, Bilan « Corriger », Cohérence « Entretien avancé » compris). Ce qui reste ne peut pas, ou ne doit pas, se faire ici :
| À faire | Pourquoi pas dans le cloud |
|---|---|
| **Essai sur un vrai téléphone** (toucher, clavier, défilement) | le cloud ne simule que la largeur d'écran, pas le tactile |
| **Vrais fichiers PDF et Word** déposés | j'ai déposé un fichier texte et une image fabriqués ; la lecture d'un vrai PDF ou Word dépend de bibliothèques non testées ici |
| **Vrai presse-papiers et vrai onglet de l'assistant** | simulés ici ; seul un vrai navigateur avec une vraie session le prouve |
| **Bilan : l'étape « Terminé »** avec les trois recommandations traitées | mon chemin (une recommandation) retombe sur le rapport ; une réponse de l'assistant complète est nécessaire, à écrire avec Denis |
| **Avis du public cible** (ton, clarté, rythme, ce qui inquiète) | ni le cloud ni moi ne pouvons le juger |
| **Harmonie du mode sombre** de chaque écran | le contrôle automatique ne voit que le contraste du texte |
| **Les 8 décisions** de la section 6 | elles appartiennent à Denis |

## 6. Décisions à demander à Denis (avec recommandation)
1. **2e passage de l'assistant après « Mise en forme » (Reformuler)** : le retirer (reco) ou le garder.
2. **Fin de parcours** : appliquer à tous les CV la règle « pas de fenêtre quand la page propose déjà la suite » (reco) ; garder la fenêtre finale de l'entretien, avec un texte plus rassurant.
3. **Titre des pages de travail** : le nom du module partout (reco), l'étape en sous-titre.
4. **Vocabulaire des barres** : « Assistant » pour l'envoi, « Résultat » pour le résultat, « Terminé » pour les analyses et la lettre, « Vos documents » pour les CV.
5. **Un seul mot pour le verrou du département** : « Choisir mon département » (reco, c'est la fenêtre « Votre département »).
6. **Majuscules** : revenir à la règle française (majuscule au premier mot seulement) dans Mes Repères.
7. **Astuce « Windows + H »** : la dire sans nommer le système (« la dictée vocale de votre appareil »).
8. **Récit « À partir de mon récit »** : passer l'objectif de 3 à 6 cartes (lot L10).

## 7. Procédure locale conseillée
1. `git fetch origin claude/youthful-fermi-6q9gzu` puis `git switch claude/youthful-fermi-6q9gzu` (ne rien fusionner, ne rien pousser sans demande).
2. `npm test` : état de départ du cloud = 2 021 essais, 2 020 verts, 1 échec attendu sur `PROSPECTION` ; noter l'état local.
3. Lancer le serveur par l'outil d'aperçu (`site-v2-python-server`, port 8123), puis rejouer `docs/mesures_2026-10-26/matrice_vos_documents.js` et `parcours_retours_et_barres.js` (Playwright, ou adapter à l'outil d'aperçu) et **comparer aux `*.REFERENCE.json`** : toute différence hors du lot en cours est une régression.
4. Pour un parcours complet : `docs/mesures_2026-10-26/parcours_reels/LISEZMOI.md`.
5. Après chaque lot : essai de Denis sur les écrans touchés (liste donnée par le lot), puis seulement fusion.

## 7 bis. Avancement en fin de séance cloud (26/10/2026)
**Faits et poussés** sur la branche `claude/youthful-fermi-6q9gzu` : **L0** (C18, commit `12efec0`), **L1a** (C7, `bb78a2e`, référence des retours mise à jour), **L4a** (D13, D14, D37, `c2351ce`), registre étape 0 (`a7190bc`), et tout le **Lot 8** décrit dans `docs/CHANTIER_LOT8_EDITEUR_CV_2026-10-26.md`. **Restent** : L4b, L3a (sans décision), puis L1b, L2, L3b, L3c, L4c, L5 à L11 (après les décisions de la section 6). Point d'entrée de la reprise : `docs/MESSAGE_REPRISE_COMPLETE_2026-10-26.md`.

## 8. Ce qui peut être commencé depuis le cloud (mise à jour du 26/10/2026)
Critère : changement **étroit**, **vérifiable ici** (`npm test`, scripts de mesure, captures) et **sans choix d'interface** pour Denis. Chaque ligne se fait en **un commit**, sur la branche, avec le grep de tous les appelants et la comparaison des fichiers `*.REFERENCE.json`. Rien n'est fusionné dans `master` : Denis essaie en local, puis décide.

| # | Lot | Ce qu'on corrige | Effort | Risque | Décision de Denis nécessaire |
|---|---|---|---|---|---|
| 1 | **L0** | **C18** : `dossier.cvAnalyse = true` aussi au dépôt par texte collé (`data/metiers.js`, wizard de dépôt) | bas | faible | non |
| 2 | **L1a** | **C7** : « Retour » de « Votre profil » vers « Votre parcours » pour `nouveau` (`js/app.js`, `pageRevelation`) | bas | faible | non |
| 3 | **L1b** | **C14** : « Retour » du récit sans session du module : ouvrir la présentation du récit au lieu de ne rien faire | bas | faible | cible du retour (reco : présentation `decouverte-intro`) |
| 4 | **L4a** | **D13, D14, D37** : le bouton du Carnet ne recouvre plus « + Garder une réflexion » ; champ de recherche de Mes Repères plus large ; plus de débordement à 375 px | bas | faible (CSS) | non (je montre les captures) |
| 5 | **L4b** | **Contrastes sombres** : `.metier-resume-nom` et `.pastille-export-docx` (variables `[data-theme="sombre"]`) | bas | faible (CSS) | non |
| 6 | **L4c** | **D38** : à 375 px, les boutons flottants ne recouvrent plus la barre d'étapes (bande réservée en haut, bouton du Carnet replié) | moyen | moyen (mise en page globale) | oui (maquette, à voir sur un vrai téléphone) |
| 7 | **L3a** | **D12** : titre automatique d'un Repère ou d'une note du Carnet coupé au mot entier avec « ... » | bas | faible | non |
| 8 | **L3b** | **D25** : un seul mot pour le verrou « Choisir mon département » | bas | faible | oui (le mot) |
| 9 | **L3c** | **D9** (majuscules de Mes Repères), **D11** (astuce « Windows + H »), **C8** (intertitre sans assistant), **D32** | bas | faible | oui (les textes ; « Regard Extérieur » est peut-être un nom propre voulu) |
| 10 | **L7 (étape 1)** | Brancher le **titre** de « Vos documents » sur le registre : `signauxVosDocuments()` dans `js/app.js` puis `familleVosDocuments(...).titre` ; la matrice de mesure ne doit pas bouger | moyen | moyen | non (parité stricte) |

**Ma recommandation pour la suite immédiate** : commencer par les lignes **1 à 5 et 7** (L0, L1a, L4a, L4b, L3a) : ce sont des défauts nets, sans décision de Denis, faciles à annuler (un commit chacun). Les lignes 3, 8, 9 attendent une réponse de Denis sur un mot ou une cible. Les lignes 6 et 10 viennent après.

## 9. Ajout : le Lot 8 de `docs/MESSAGES_PAR_LOT_RETOURS_2026-10-25.md` (éditeur de CV, fin du Lot 1 de la liste du 24/10)
Demande de Denis du 26/10/2026 : intégrer ce lot à la liste. Le message à coller dans la session locale est dans le fichier du Lot 8 ; ce qui suit dit **où il se place dans le plan** et **ce qui peut déjà se préparer dans le cloud**. Règles propres à ce lot (dans le message) : annoncer l'effort (haut) et **attendre que Denis l'ait réglé**, audit du code réel d'abord, **un commit par tâche**, `npm test` vert avant chaque commit, dépôt propre, **ne rien pousser** (consigne de la session locale ; dans le cloud la branche de travail est poussée avec l'accord de Denis).

| Tâche | Sujet | État du code (relevé du 26/10/2026) | Faisable dans le cloud ? |
|---|---|---|---|
| **1** | Clignotement léger au **changement de modèle** : l'aperçu (une iframe) est reconstruit ; la conservation de l'iframe (`moveBefore`, F26) donne une largeur de colonne différente d'une reconstruction | `_mepGarerZoneApercu` (`js/app.js` ligne 18840) et `_mepReprendreZoneVivante` (ligne 18857) ; panneau `modules/cv-pdf-html/cvPdfPanneauReglages.js` ; reste de F26 : « une action refait encore la page 2 fois » | **La mesure : oui.** Mesurer dans le navigateur la largeur de la colonne avant et après un changement de modèle, avec et sans conservation de l'iframe, et compter les rendus. **Le ressenti du clignotement : non**, seul Denis le voit. La correction se vérifie donc par la mesure ici et par l'œil en local. |
| **2** | **F27** : texte blanc hors de la colonne | non reproduit (trois formes de colonne contrôlées à l'œil : diagonale, pointe, carte) | **Non, sans la capture de Denis** (modèle exact, forme de colonne). **À demander à Denis avant de chercher.** Une fois le cas connu, la reproduction est faisable ici (rendu du modèle dans le navigateur sans fenêtre). |
| **3** | **F28** : variété réelle de « Style rapide » (`btnMepDe`) : les tirages se ressemblent trop | tirage dans `_mepAppliquerLook` / `_mepTirageFormesDeco` (lignes 22234 et suivantes) ; F17 a ajouté des refus de tirages illisibles, ce qui peut avoir réduit la variété | **Oui, largement** : lancer 100 tirages, mesurer la diversité (modèle, couleur, forme de bandeau, forme de colonne, police) et la part de tirages refusés, puis régler. La **qualité** perçue de la variété reste à voir par Denis. |

**Où ce lot se place** : indépendant de L0 à L11 (il touche l'aperçu du CV, pas la barre, le titre ni le « Retour »). Deux précautions : (a) ne pas éditer `pageResultats` et la zone d'aperçu en même temps que L7 (registre) ; (b) les scripts `matrice_vos_documents.js` et `parcours_retours_et_barres.js` doivent rester **identiques** après le lot (il ne change aucune famille). À ajouter au lot : un essai de la mesure de la tâche 1 (largeur de colonne stable) et un essai de la tâche 3 (nombre de formes différentes sur N tirages) dans `scripts/parcours/parcours_smoke.js`.
