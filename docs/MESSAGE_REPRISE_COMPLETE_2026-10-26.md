# Message de reprise complète (local ou autre compte) : audit de toutes les cartes + Lot 8 éditeur de CV

> Écrit le 26 octobre 2026 à la fin de la séance cloud. Tout ce qui est décrit comme « fait » est **commité et poussé** sur la branche `claude/youthful-fermi-6q9gzu` (rien sur `main`, `master` ni PR). Ce document est le point d'entrée : une session qui le lit n'a besoin de rien d'autre pour reprendre.

## 1. Le message à coller dans la nouvelle session

```
/app Reprends le travail commencé dans le cloud le 26/10/2026. Lis d'abord docs/MESSAGE_REPRISE_COMPLETE_2026-10-26.md (point d'entrée), puis docs/CHANTIER_LOT8_EDITEUR_CV_2026-10-26.md et docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md.

Étape 0 (avant toute chose) : récupère la branche sans rien casser. git status doit être propre. git fetch origin claude/youthful-fermi-6q9gzu, liste les commits (git log --oneline HEAD..origin/claude/youthful-fermi-6q9gzu), essaie-la sur une branche d'essai (git switch -c essai-cloud origin/claude/youthful-fermi-6q9gzu), lance npm test, et dis-moi ce que je dois regarder à l'œil. Ne fusionne dans master que si je te le demande. Jamais deux comptes en même temps.

Étape 1 : annonce le mode et l'effort de chaque tâche, regroupe par niveau d'effort. Commence par la section 4 (ce qui reste, dans l'ordre), en une tâche à la fois, un commit par tâche, npm test vert et la preuve prévue avant chaque commit. Pose-moi mes décisions (section 5) en une seule fois, avec ta recommandation, avant de coder ce qui en dépend.
```

## 2. Ce qui est fait (commits sur la branche)

| Sujet | Commit(s) | Preuve |
|---|---|---|
| Audit des 6 cartes, 12 familles de « Vos documents », constats C1 à C23 et D1 à D50, plan en lots L0 à L12 | `docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md` et cahiers liés | scripts et références dans `docs/mesures_2026-10-26/` |
| **L0 (C18)** dépôt du CV par texte collé : la suite est celle du fichier | `12efec0` (`data/metiers.js`) | rejeu de bout en bout des deux dépôts, même écran, même barre |
| **L1a (C7)** « Retour » de « Votre profil » vers « Votre parcours » en création | `bb78a2e` (`js/app.js`) | référence des retours mise à jour (2 lignes), matrice des familles identique |
| **L4a (D13, D14, D37)** Mes Repères : bouton du Carnet, champ de recherche, débordement à 375 px | `c2351ce` (`modules/reperes/reperes.css`) | recouvrement 768 px² puis 0, débordement 12 px puis 0 |
| Registre des familles de « Vos documents », étape 0 (module pur, 26 essais) | `a7190bc` (`modules/vos-documents/familles.js`) | pas encore branché sur l'application |
| **Lot 8, clignotement** au changement de modèle de la galerie | `dc2bbd4` (`js/app.js`) | 37 modèles, CV identique, un seul cadre, plus de flash |
| **Lot 8, lisibilité du texte** (garde-fou « seulement si illisible », dates des certifications sous l'intitulé, formes de bandeau dessinées) | `9bd5605`, `0c6d5f9` (`modules/cv-pdf-html/cvPdfLisibilite.js`, `tests/lisibilite.test.js`) | cas illisibles de 74 à environ 3 sur 1 074 combinaisons ; banc de rendu identique à la référence |
| **Lot 8, en-tête « Empilée »** (disposition 5, option du grand aperçu, texte à deux tons sur colonne colorée) | `243929f` (`cvPdfTemplateMaquette.js`, `cvPdfPleinEcranMaquette.js`) | banc de rendu des 39 modèles identique, `npm test` 2055 sur 2056 |

Journal des changements : une ligne par changement visible est notée dans `docs/JOURNAL_DES_CHANGEMENTS.md` (à condenser ensuite dans `data/nouveautes.js`).

## 3. Règles à ne pas oublier (extraits du protocole et des leçons de la séance)

- Français impeccable, jamais de tiret cadratin, jamais « IA » visible, mode sombre pour toute couleur, une seule source de vérité (grep sur tout le dépôt avant de toucher une fonction partagée).
- **Maquette et questions avant tout code d'interface** : les captures avant / après sont ce que Denis juge, pas les mesures. Leçon du 26/10 (`docs/LECONS_A_NE_PAS_REPRODUIRE.md`) : un remède « sans débordement » qui coupe des mots est refusé ; pour un contenu long on règle la disposition.
- `npm test` vert avant chaque commit. **Un seul échec attendu dans le cloud** : « Pont : le dossier est le voisin PROSPECTION/donnees/pont » (le dossier voisin n'existe que sur le poste de Denis). Chez Denis il passe.
- `js/app.js` et `modules/*/ui.js` ne sont pas chargés par les tests Node : test navigateur obligatoire pour tout changement qui les touche.
- Banc de rendu officiel : voir section 7. Dans le cloud, les empreintes Word (`xml`) de tous les modèles diffèrent déjà de la référence avant tout changement (environnement) : seules les empreintes HTML et CSS y sont fiables. En local elles doivent être toutes identiques. `creatif:mqColonne [html]` avait déjà un écart avant mon travail : à regarder en local.
- Un commit par tâche ; ne jamais pousser sur `main`/`master` sans demande de Denis.

## 4. Ce qui reste, dans l'ordre conseillé (étiquettes d'effort)

### A. Éditeur de CV (Lot 8), détail dans `docs/CHANTIER_LOT8_EDITEUR_CV_2026-10-26.md`
1. **[effort : haut] Choix automatique de la disposition « Empilée »** (étape 3 de la décision du 26/10). Quand l'en-tête serait trop grand (plus de 30 % de la page, `_pdfEnteteTropHaut`) ou l'accroche trop étroite (moins de 160 px, `_pdfAccrocheTropEtroite`), et **seulement tant que la personne n'a pas réglé l'en-tête elle-même**, passer à `_cvPdfEnteteLibreMq = { libre: true, modif: true, disp: '5', ... }`. Points d'appui : `_pdfRetirerEnteteDecaleeSiTropEtroite` (`cvPdfPanneauReglages.js`, ligne 6480 environ : aujourd'hui elle revient à l'en-tête d'origine) et `_pdfCorrigerEnteteSiTropEtroit` (utilisée seulement au tirage du dé). Preuve : rejeu de `docs/mesures_2026-10-26/lot8/balayage_options.js` avec `SEULEMENT=…/anomalies_avant.json` (186 réglages anormaux relevés avec un contenu long), banc de rendu identique pour les contenus ordinaires, captures avant / après à montrer à Denis.
2. **[effort : haut] « Éditorial » (en-tête à 40 % de la page avec un contenu long) et « Chrono foncé »** : leurs en-têtes ont une autre structure (nom énorme à gauche, photo à droite). À traiter à part, avec maquette. Sonde : `docs/mesures_2026-10-26/lot8/sonde_entete.js`.
3. **[effort : moyen] Bornes de l'en-tête et des colonnes** (constats L8-12 à L8-16) : accroche qui déborde dans « Colonne » dès le rendu de base avec un texte long, fond de colonne à droite (14 modèles : grille d'en-tête `1.15fr 1fr <largeur>mm` qui sort de la page avec un nom long), largeur de colonne à 70 %, arche, colonnes inversées. **Ne pas couper des mots** (leçon du 26/10) : la disposition empilée du point 1 doit les résorber ; ne garder que ce qui reste.
4. **[effort : moyen] « Style rapide » sans répétition** en Créatif et Sobre (L8-11) : chaque modèle une fois par tour, ordre mélangé, jamais deux modèles de la même famille de suite, plus de bandeaux en Sobre (32 tirages sur 40 sans bandeau aujourd'hui). Code : `_pdfProposerAutreModeleCreatif`, `_pdfProposerVarianteSobreSuivante` (`cvPdfPanneauReglages.js`, lignes 4834 et 4873 environ), tirage des formes `_mepTirerFormesCv` (`js/app.js`). Mesure : `docs/mesures_2026-10-26/lot8/mesure_style_rapide.js`.
5. **[effort : bas] La page refaite deux fois** (L8-2) : un clic sur six sur le dé en Créatif appelle `pageResultats()` deux fois (chemin `_mepTirageFormesEnAttente`). Mesure : `mesure_danse_de.js`.
6. **[effort : moyen] Autres gestes qui font clignoter** (L8-1) : changement d'allure (`data-mep-allure`), « Organisation » (colonnes, réduire, agrandir). Même méthode que la galerie (`_mepConserverApercuPendant` dans `js/app.js`), **avec la preuve par empreintes** (`essai_conservation.js`). Attention : une conservation de l'aperçu ne convient qu'aux gestes qui agissent dans le cadre lui-même.
7. **[effort : bas] Trois cas de texte illisible restants** : « Limoges, 87000 » dans « Colonne claire » avec un bandeau en pointe, demi-ovale ou créneaux (texte à cheval sur le bord, sans texte à deux tons actif). À traiter avec le point 1.
8. **[effort : bas] Balayage complet avec un contenu court et moyen** (décidé le 26/10) : `balayage_options.js` avec `FIXTURE=court` puis `FIXTURE=moyen` (environ une heure et demie de calcul par contenu avec 3 balayages en parallèle). À faire en local ou sur un poste qui peut tourner longtemps.
9. **[effort : moyen] Largeur de colonne propre à chaque modèle** (L8-4) : sept modèles Créatif ont leur largeur dans leur recette (30, 40 ou 50 %) mais l'application remet toujours 35 % (36 % rendus) au changement de modèle ; les vignettes de la galerie montrent la largeur propre. À trancher avec des captures côte à côte (décision de Denis : comportement actuel conservé pour l'instant).
10. **[effort : bas] Mesure finale** après les correctifs (`scan_f27.js` avec `RAPIDE=1 COTES=gauche`, `balayage_options.js`), mise à jour du cahier du Lot 8.

### B. Audit des cartes, détail dans `docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md` (lots, constats, tableau de la section 8)
Faits : L0, L1a, L4a. Restent, **sans décision de Denis d'abord** :
- **[effort : bas] L4b** : deux contrastes du mode sombre (`.metier-resume-nom` 2,5 et `button.pastille-export-docx` 1,2) : variables `[data-theme="sombre"]`.
- **[effort : bas] L3a** : titre automatique d'un Repère ou d'une note du Carnet (D12) coupé au mot entier avec « … ».
- **[effort : moyen] L7 étape 1** : brancher le titre de « Vos documents » sur le registre (`signauxVosDocuments()` puis `familleVosDocuments(...).titre`) ; la matrice de mesure (`docs/mesures_2026-10-26/matrice_vos_documents.js`) ne doit pas bouger.
Restent, **après décision de Denis** (section 5) : L1b (C14), L2 (C1 : le 2e passage de l'assistant pour Reformuler), L3b (le mot « département », D25), L3c (textes : D9, D11, C8, D32), L4c (D38 : boutons flottants à 375 px, maquette, à voir sur un vrai téléphone), L5 (G1 : « Continuer » et barre du bas), L6 (C17 : règle de fin de parcours), L7 suite (registre), L8 (« Revoir la présentation » : une seule brique), L9 (G3 : vocabulaire des barres d'étapes), L10 (G4 : dépôt du CV, brique commune), L11 (G10 : enveloppe commune de l'étape de l'assistant).

## 5. Décisions que Denis doit encore prendre (à lui poser en une fois, avec une recommandation)

Les 8 décisions de la section 6 de la synthèse (2e passage de l'assistant pour Reformuler, règle de fin de parcours, titres des pages, vocabulaire des barres, mot « département », majuscules de Mes Repères, astuce « Windows + H », récit à 6 cartes), plus :
- Largeur propre à chaque modèle (L8-4) : conserver 36 % partout ou revenir à la largeur de la recette ?
- Échelle de texte au maximum qui dépasse 30 % pour l'en-tête sur 9 modèles (L8-16) : réglage extrême choisi par la personne, priorité basse.
- « Éditorial » et « Chrono foncé » : quelle disposition pour un contenu long ?

## 6. À regarder à l'œil, en local, par Denis (ce que le cloud ne peut pas juger)

- Le grand aperçu : le bouton **« Empilée »** avec de vrais clics (le cloud l'a testé par réglage direct de l'état), sur plusieurs modèles, avec un contenu long et un contenu ordinaire.
- La lisibilité des sept cas de `docs/MAQUETTE_LISIBILITE_TEXTE_2026-10-26.html` et l'absence de clignotement au changement de modèle ; la « danse » et les pauses du dé sur son poste (les pauses mesurées dans le cloud sont faussées par la charge).
- Un vrai PDF et un vrai Word (le garde-fou de lisibilité et l'empilée ne concernent que l'aperçu et le PDF imprimé depuis l'aperçu ; le Word n'est pas touché).
- Mes Repères sur un vrai téléphone.

## 7. Outils et commandes

- Tous les outils de mesure sont dans `docs/mesures_2026-10-26/` (parcours rejoués avec de vrais clics : `parcours_reels/`, éditeur de CV : `lot8/`). Ils pilotent Playwright : `URL_APP=http://localhost:8123` (serveur de développement `serveur_dev.py`). Voir `docs/mesures_2026-10-26/parcours_reels/LISEZMOI.md` et l'en-tête de chaque script.
- **Banc de rendu officiel** (poste de Denis, fenêtre de 738 px de large, stockage vide) : `(0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); window.__rendu.lancer('verifier'); window.__rendu.etat`. Ne pas régénérer le registre sans raison : voir `docs/PLAN_BANC_ET_MINIATURES_2026-10-11.md`. Si un changement de rendu est voulu pour un modèle, mettre à jour **ce modèle seul** (empreinte du registre et miniature `data/miniatures/<famille>_<id>.json`), comme pour « Colonne et frise » le 26/10.
- Scripts du Lot 8 les plus utiles : `scan_f27.js` (texte illisible, trous, hauteur d'en-tête ; options `RAPIDE`, `COTES`, `COMBOS`, `SEULS`, `MODELES`, `APRES`, `PHOTOS`), `balayage_options.js` (toutes les options par modèle ; `FIXTURE`, `TRANCHE`, `MODELES`, `SEULEMENT`), `essai_empilee.js` (l'empilée sur du vrai rendu), `maquette_entete.js` (prototype avant / après), `verifier_banc.js`, `essai_conservation.js`, `mesure_clignotement.js`, `mesure_danse_de.js`, `mesure_style_rapide.js`.
- Matrices de référence à comparer après tout changement de parcours : `docs/mesures_2026-10-26/parcours_retours_et_barres.REFERENCE.json` et `matrice_vos_documents.REFERENCE.json` (rejouer le script du même nom, comparer).

## 8. Pièges connus de la séance

- Dans le cloud, le serveur de développement s'arrête quand l'environnement se réinitialise et il interrompt alors les mesures en cours : le relancer (`serveur_dev.py`, port 8123) et vérifier qu'il répond avant de croire qu'une mesure tourne.
- Ne jamais lancer `pkill -f` ou `kill` avec un motif qui apparaît dans sa propre commande : ça tue le shell.
- Un correctif d'en-tête ne se juge pas aux mesures seules : il faut la capture.
- Récupérer la branche : elle part de la dernière mise à jour de Denis (`3d45783`, 26/10/2026). Si Denis a commité en local depuis, des conflits sont possibles, surtout dans `docs/` : s'arrêter et demander plutôt que de forcer.
