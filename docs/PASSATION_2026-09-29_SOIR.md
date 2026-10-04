# PASSATION du 2026-09-29 (soir) : pour reprendre sur un autre compte

> À lire avec `CLAUDE.md` et `docs/TRAVAILLER_AVEC_DENIS.md` (obligatoire). Denis a atteint 96 % de sa limite d'utilisation : tout est commité, à reprendre à la réinitialisation.
> Vérifier la date système réelle avant d'écrire une date.

## 1. État de git (à lire en premier)
- **`master`** au commit `5399901` : tout est **vérifié** (tests, navigateur, Word) : couleur par zone + barre dans le plein écran, Word A5 (page vide, `NaN`), photo (recadrage), nettoyage B.7 (~3 200 lignes), etc.
- **Branche `travaux-2026-09-29-a-verifier`** : contient TOUT ce qui a été fait ensuite, **committé mais NON vérifié dans le navigateur** (le navigateur était occupé par l'inventaire long). `npm test` : 1037/1037 verts.
  **Ne pas fusionner dans `master` avant d'avoir fait les vérifications de la section 2.** Puis : `git checkout master && git merge travaux-2026-09-29-a-verifier` (rien à pousser sans demande de Denis).

## 2. Ce que contient la branche et COMMENT LE VÉRIFIER (10 secondes chacun)
| # | Contenu | Fichiers | Vérification |
|---|---|---|---|
| 1 | **Petit coin de la frise absent du Word** : l'export empilait les formes dans l'ordre du HTML ; celles à `z-index` positif passent après | `modules/cv-word/wordExtracteur.js` (`decorRectangle`, tri avant `decors.forEach`) | Banc : `scripts/word/banc_b7.js` puis comparer à `scripts/word/banc_b7_reference.json` (champs `pdf` et `xml`) : **seuls les modèles où un décor a un `z-index` positif doivent changer** (frise, peut-être photoFrise) ; ouvrir l'export de « Colonne et frise » dans le vrai Word (outillage `scripts/word/`, Word 16 disponible) : le petit coin sombre en haut à gauche doit apparaître |
| 2 | **Alerte de contraste** dans la barre des couleurs du plein écran (calcul WCAG sur les vrais textes de la zone, dégradé compris) | `cvPdfCouleursZones.js` (`_pdfRatioContraste`...), `cvPdfPleinEcranMaquette.js` (`_mqContrasteZone`, `mqCoulAlerte`), `css/mise-en-page-maquette.css` | Plein écran « Colonne et frise » > clic sur la colonne > choisir le vert : un encart doit avertir que « Langues » etc. seront difficiles à lire ; couleur d'origine : aucun encart |
| 3 | **Bug réel corrigé : les cases « afficher / masquer une rubrique » ne faisaient rien** (Standard : décocher « Afficher les centres d'intérêt » ne masquait rien, vérifié à la main) | `cvPdfPanneauReglages.js` (`_pdfMqRubriqueVisible`), `js/app.js` (`definirRubriqueVisible`, `_MEP_RUBRIQUE_INTITULE`) | Standard : décocher « Afficher les centres d'intérêt », « Logiciels et outils », « Langues » : la rubrique doit disparaître du CV ; recocher : elle revient. `engagements` et `permis` NON reliés (pas de rubrique propre dans le PDF) : à griser |
| 4 | **13 couleurs** dans la carte « Allure » (avant 5) pour combler le vide | `js/app.js` (`_MEP_COULEURS_SIMPLES`), plein écran : plus de doublons | Ouvrir la carte « Allure » : 13 pastilles, elles tiennent ou passent à la ligne proprement ; clic sur une : la couleur change comme avant |
| 5 | **Mécanisme de grisage général des réglages sans effet par modèle** (INACTIF tant que le fichier de données n'existe pas) | `cvPdfCartesMaquette.js` (`_mepGriserElement`, `_mepCleModeleActif`, `_mepGriserSansEffetModele`), appel dans `js/app.js` | **Attention : j'ai refactoré le grisage du Mini CV A5** (l'attribut est devenu `data-sans-effet`, commun) : vérifier qu'en Mini CV A5 les réglages « sans effet » sont toujours grisés (« Deux colonnes », « Blocs courts », etc.) |
| 6 | Outils d'inventaire | `scripts/word/matrice_options.js`, `matrice_rapport.js`, `matrice_partielle_2026-09-29.json` | Voir section 3 |
| 7 | Docs | `docs/CHANTIER_DISPOSITION_PAR_DEFAUT_2026-09-29.md`, `docs/CHANTIER_COULEURS_PAR_ZONE_2026-09-29.md` (corrections), ce fichier | Lire |

## 3. INVENTAIRE « bouton x modèle » : la tâche que Denis veut « IMPÉRATIVEMENT »
**Demande de Denis** : des boutons des options rapides (et des autres cartes) sont cliquables mais **ne font rien** selon le modèle (modèles avec leur propre icône, déjà sur 2 colonnes...). Faire le repérage COMPLET de ce qui fonctionne par modèle ; **griser** ce qui est déjà fait par le modèle ou ne peut pas s'adapter.
- **Outil** : `scripts/word/matrice_options.js` (clique chaque bouton/case de chaque carte, attend que l'aperçu soit stable, mesure si le HTML du CV change, remet l'état ; ~93 contrôles testés par modèle ; **~1,7 min par modèle**). Mode « rapide » : court-circuite `pageResultats()` ; les « sans effet » sont revérifiés en mode « lent » (reconstruction réelle) une fois par contrôle.
- **Résultats partiels sauvegardés** : `scripts/word/matrice_partielle_2026-09-29.json` = **5 modèles sur 25** (standard, sobre mq-bandeau, mq-fond, mq-epure, mq-photo). Reste **20 modèles** : `sobre:mq-rectangles` (incomplet) + les 19 créatifs (`mqBandeau, mqDiagonale, mqColonne, mqCadre, mqPicto, frise, photoFrise, rectangles, sidebarVague, rubanDiagonal, duoOvale, cadreBarre, bandeauVertical, triangleSavoir, vagueMarine, diagonalesContrastees, losangeVert, pastille, medaillon`).
- **Comment reprendre** : serveur de dev (`preview_start` `site-v2-python-server`), recharger la page, puis dans le navigateur :
  `eval(await (await fetch('/scripts/word/banc_b7.js')).text()); eval(await (await fetch('/scripts/word/matrice_options.js')).text());`
  `window.__mat = <résultats partiels>;` (recoller le JSON) puis `window.__lancerMatrice(window.__matModeles().slice(5))` ; suivre `window.__matProgres` ; à la fin, poster `window.__mat` au récepteur (`node scripts/word/recepteur.js <dossier> 8124`, route `POST /json/<nom>`), puis
  `node scripts/word/matrice_rapport.js <matrice.json> docs/INVENTAIRE_OPTIONS_PAR_MODELE_2026-09-29.md modules/cv-pdf-html/cvPdfOptionsParModele.js` : produit le rapport ET le fichier de données qui active le grisage (à ajouter dans `index.html` avant `js/app.js` et dans le test de conservation si besoin).
- **Interprétation** (à faire avec soin) : un réglage « sans effet » partout = soit non relié au rendu (à corriger, comme les rubriques ci-dessus), soit donnée absente du jeu de test, soit effet invisible à l'écran (à expliquer) ; « sans effet » sur certains modèles seulement = à griser sur ceux-là (le fichier généré le fait).
- **Constats déjà faits sur Standard** (46 « sans effet » sur 93) : beaucoup sont propres à des modèles à colonnes (colonnesinv, formecolonnes, fondeffet, fondpleine, bandeau, degradebandeau...) ; à confirmer sur les 25 modèles avant de griser. Le jeu de données du banc a été enrichi (lieu des formations, logiciels, certifications, permis).

## 4. Demandes de Denis en attente (ordre de priorité proposé)
1. Vérifier puis fusionner la branche (section 2).
2. Terminer l'inventaire, corriger les boutons morts (rubriques : fait à vérifier), griser le reste (section 3). **Impératif pour Denis.**
3. Couleur par zone : ce qui reste = modèles à vagues/diagonales (déjà le MÊME plein écran, vérifié ; seules leurs zones manquent : `::before` de la page pour la colonne à vague ; titres et lignes en pastille suivent la couleur générale). Reco donnée sur les modèles à cadre/pictos/losange/pastille : **ne pas ajouter de zones contour** (la couleur générale via un clic sur un titre suffit). Denis n'a pas encore répondu sur cette reco.
4. **Disposition par défaut du CV + regroupement calculé par « Mise en page »** : `docs/CHANTIER_DISPOSITION_PAR_DEFAUT_2026-09-29.md` (Mode A : audit puis maquette et questions AVANT tout code ; Denis a dit de le faire APRÈS les autres tâches).

## 5. Correction d'une erreur de la session (à ne pas répéter)
J'avais affirmé que les modèles à vagues « ouvrent l'ancien plein écran » : **faux**, les 19 modèles créatifs utilisent le même plein écran (`_pdfModeleMaquetteActif()` vrai partout). Corrigé dans le cahier des couleurs.

## 6. Petits rappels
- Le récepteur `scripts/word/recepteur.js` a pu rester lancé en arrière-plan : `Get-CimInstance Win32_Process` filtre `recepteur.js` pour l'arrêter.
- Aucun `push` fait. `npm test` : 1037 verts au moment de cette passation. Effort recommandé : moyen (vérifications), élevé pour le grisage/inventaire.

## 7. Ajout de dernière minute : l'inventaire tourne SEUL en arrière-plan (lancé à la fin de la session)
Le reste de l'inventaire (`sobre:mq-rectangles` + les 19 créatifs, 21 modèles, environ 35 minutes) a été lancé dans la page du navigateur intégré, avec **sauvegarde automatique après chaque modèle** dans
`scripts/word/resultats_matrice/matrice_suite.json` (via `scripts/word/recepteur.js` laissé lancé sur le port 8124). Conditions : la page du navigateur intégré doit rester ouverte, le récepteur aussi.
- **Au retour** : lire ce fichier. Les 5 premiers modèles sont dans `scripts/word/matrice_partielle_2026-09-29.json`. Fusionner les deux JSON (clés = modèles) avant de lancer `matrice_rapport.js`.
- Si le fichier contient moins de 21 modèles, l'inventaire a été interrompu : relancer seulement les modèles manquants (section 3).
- Ce passage mesure le code de la branche `travaux-2026-09-29-a-verifier` (rubriques déjà corrigées : elles devraient apparaître « effet »).
- Ensuite arrêter le récepteur (`Get-CimInstance Win32_Process` filtre `recepteur.js`).

## 8. Reprise du soir (2e session, même jour)
- **Deux comptes sur la même branche** : l'autre compte a commité sur `travaux-2026-09-29-a-verifier` (R8 à R13, LIM-0 à LIM-4, panneau Candidature), en ligne droite après mes commits, sans conflit. `master` est resté à `5399901`. Ce travail est celui de l'autre compte : ne pas y toucher ici.
- **Couleurs sur une seule ligne** : déjà commité (`6903bd9`).
- **Inventaire** : 13 modèles sur 25 dans `scripts/word/resultats_matrice/matrice_suite.json` (+ 5 dans `matrice_partielle_2026-09-29.json`). Restent 12 créatifs : rectangles, sidebarVague, rubanDiagonal, duoOvale, cadreBarre, bandeauVertical, triangleSavoir, vagueMarine, diagonalesContrastees, losangeVert, pastille, medaillon.
- **Banc Word** : les références `banc_b7_reference.json` datent d'avant les commits de l'autre compte (contenus modifiés) : les régénérer avant de comparer, avec puis sans le tri par `z-index` du petit coin.
- Ordre de reprise : `npm test`, vérifications de la section 2, fusion dans `master` (sans push), puis fin de l'inventaire et grisage (effort élevé).

## 9. Inventaire terminé, tri fait (2e session, soir)
- **Inventaire des 25 modèles fait et corrigé** : `docs/INVENTAIRE_OPTIONS_PAR_MODELE_2026-09-29.md` (données : `scripts/word/resultats_matrice/matrice_finale.json`). Le premier passage jugeait 26 réglages morts à tort : le banc ignorait la feuille de style (leçon 9.42). Après correction : **4 réglages sans effet**, 23 partiels.
- **Fait** (commits `e459b3c`, `b42ec0d`) : grisage par modèle (`cvPdfOptionsParModele.js`, GÉNÉRÉ par `matrice_rapport.js`, chargé dans `index.html`), grisage conditionnel (`_mepGriserDependances` : style des missions de formation tant que la case « Afficher les missions » est décochée ; regroupement sans proposition de l'assistant), 3 doublons retirés (lettre jointe, formations mises en avant, copie du style des missions personnelles), règle « titre jamais seul en bas de page » étendue aux gabarits Rectangles / Photo / Frise.
- **Décidé avec Denis** : on garde les fonctions déjà codées et testées ; jamais brancher un bouton mort si cela crée un doublon.
- **Étape « Confort de lecture » (un seul réglage d'espacement)** : proposée puis **remise en question** : interligne, espacement et densité fonctionnent (le banc ne le voyait pas). À trancher avec Denis (reco : ne pas la faire, ce serait un doublon).
- `master` n'a PAS été avancé après `3d5f5ee` (fusion seulement sur demande de Denis). Bench Word/PDF `banc_b7` non relancé sur ces derniers commits (seule la feuille de style change sur 3 gabarits).

## 10. Clôture de séance (2026-09-29, nuit) : ce qui est FINI et ce qui RESTE
**`master` = dernier commit ; branche de travail `travaux-2026-09-29-a-verifier` abandonnée (elle est en retard sur `master`).** Tests : 1080 verts. Rien n'a été poussé.
### Fini et vérifié (navigateur, tests, export Word construit sans erreur)
- Vérifications de la branche : cases de rubriques, 13 couleurs sur une ligne, grisage du Mini CV A5, alerte de contraste (corrigée : n'alerte que si le choix est pire que le départ), petit coin de la frise dans le plan Word.
- **Inventaire « bouton × modèle » (25 modèles) terminé** ; tri fait : réglages grisés par modèle, 3 doublons retirés, 2 réglages grisés selon leur condition ; étape « Confort de lecture » abandonnée (doublon) ; règle « titre jamais seul en bas de page » étendue à Rectangles / Photo / Frise. Leçon 9.42 (le banc doit comparer la feuille de style).
- **Disposition par défaut** : une colonne (Logiciels + Langues + Centres sur une ligne, expérience personnelle bien placée) ; deux colonnes (Langues/Centres/Logiciels à gauche, formations et expérience personnelle à droite, compétences professionnelles à droite s'il y a de la place, expérience personnelle à gauche avant Logiciels sinon) ; « Mise en page » propose les regroupements mesurés.
- **Couleur par zone** : la vague de « Colonne à vague » est cliquable.
- **Panneau d'options** : seule « Organisation du CV » ouverte à l'arrivée ; fermé = fond bleu clair, ouvert = fond blanc + barre.
- **Grand aperçu : déplacer les rubriques à la souris** (poignée, emplacements prédéfinis, expérience professionnelle verrouillée à droite, annuler, retour automatique), 1re version puis 2e version (rubriques côte à côte : 3 par ligne à une colonne, 2 dans la grande colonne ; règle Formations + Expérience personnelle avec avertissement) ; bouton d'accès depuis « Personnaliser » ; outils inapplicables grisés (principe général).
- Incident OneDrive (index git écrasé par des copies en conflit) : réparé, 99 copies supprimées, sauvegardes dans le dossier `Sauvegardes_APP` de ton profil (`C:/Users/Denis/Sauvegardes_APP`).
### Reste à faire (rien de commencé sauf mention)
1. **Tester dans ton vrai Word** (CV + photo) : petit coin de la frise, nouvelles dispositions, lignes côte à côte, couleurs. Tant que non validé, l'ancien moteur Word n'est PAS supprimé.
2. **L'« escalier »** de deux rubriques d'une même ligne : non reproduit (0 px d'écart mesuré sur 19 modèles) : il faut le nom du modèle et le contenu.
3. **Frise, Rectangles, Photo** (construction propre) : hors disposition par défaut et hors déplacement à la souris (outils grisés avec la raison).
4. ~~Couleur par zone : zones contour~~ **TRANCHÉ par Denis (2026-09-29) : on suit la reco, pas de zones contour** pour cadre / pictos / losange / pastille (aucun code).
5. **Mettre le projet à l'abri de OneDrive** (sortir le dépôt de OneDrive, dépôt distant privé pour les deux PC). Règle en attendant : un seul PC à la fois, coche verte de OneDrive avant de changer de PC, « vérifie l'état git » à l'arrivée.
6. **Références du banc B.7** (`scripts/word/banc_b7_reference.json`) périmées : à régénérer avant le prochain nettoyage.
7. **Branche `master-Pc-Denis`** : contient un commit du 2026-09-07 (« Annuaire associatif : 3e lot ») absent de `master` : à décider (fusionner ou abandonner).
8. **Chantiers de l'autre compte** (R2, R11, R8, R9, R13, R6, LIM) : non touchés ici.
9. Optionnel : résidus B.7 (branche `colonneGauche`, paramètre `idParent`, commentaires « Projet XXL ») ; le mode de permission de la session a été passé en manuel (à remettre en « Auto » si souhaité).

## 11. Décisions de Denis sur la liste « Reste à faire » (2026-09-29, fin de séance)
1. Test dans le vrai Word : **Denis le fera à l'occasion** (l'ancien moteur Word reste en repli tant que ce n'est pas validé).
2. « Escalier » de deux rubriques sur une même ligne : **non revu par Denis, en attente** (il faudra le nom du modèle et le contenu du CV).
3. Frise, Rectangles, Photo (construction propre) : **rien à faire**, outils grisés avec la raison ; à ne traiter que si ces modèles sont beaucoup utilisés.
4. OneDrive : **réglé** (Denis).
5. Références du banc B.7 : **tâche de Claude**, à faire avant le prochain nettoyage de code ; Denis n'a rien à faire.
6. Branche `master-Pc-Denis` (commit du 2026-09-07 « Annuaire associatif : 3e lot ») : **abandonnée par Denis** ; la branche n'est pas supprimée.
7. Chantiers de l'autre compte (R2, R11, R8, R9, R13, R6, LIM) : **Denis les finira avec l'autre compte**.

## 12. « Rectangles arrondis » : ordre, contour, puces, colonnes (2026-09-29, fin de séance)
Panneau d'un rectangle de compétences (grand aperçu, « Régler l'en-tête et les rectangles », clic sur un rectangle) : **contour bleu** sur la carte choisie + « Vous réglez : … » ; **pile de trois feuilles** et boutons 1 / 2 / 3 (1 = devant, rangs toujours différents ; on couvre le blanc d'un rectangle par un autre sans cacher son texte) ; **style des puces** (flèche, rond, carré, coche, losange, sans puce) ; **une ou deux colonnes**, par rectangle. Stockage : `ent.plan` (z-index) et `ent.sty[bl].pu / .co` ; rendu : `listeR` dans `cvPdfTemplateMaquette.js`. Vérifié en navigateur, Word construit sans erreur.
