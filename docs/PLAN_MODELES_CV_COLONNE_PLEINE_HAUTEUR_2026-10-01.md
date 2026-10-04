# Plan détaillé : nouveaux modèles de CV (famille « Colonne pleine hauteur » puis Éditorial et Chronologique)

Écrit le 2026-10-01 (Mode A). **Ce fichier est le point de reprise.** Il se met à jour phase par phase (cases à cocher) ; un commit par phase. Rien n'est codé à la date d'écriture.
Contexte : analyse des 17 exemples de Denis dans `docs/ANALYSE_MODELES_CV_EXEMPLES_2026-10-01.md` (familles A à F, ordre recommandé A, B, C).

## 0. Reprise après redémarrage (lire d'abord, dans cet ordre)
1. Ce fichier, puis `docs/ANALYSE_MODELES_CV_EXEMPLES_2026-10-01.md`, puis la passation du 2026-10-01 dans `docs/ETAT_DES_CHANTIERS.md` (partie 0).
2. Règles de Denis : `CLAUDE.md` (français impeccable, jamais de tiret long, jamais le mot « IA » visible, mode sombre, maquette avant code, un commit par sous-étape, `npm test` vert avant commit).
3. Outils (déjà éprouvés) : serveur `site-v2-python-server` via `preview_start` (jamais Bash), `npm test` (1223 verts au 2026-10-01), essais de parcours `scripts/parcours/parcours_smoke.js` (131 essais, `window.__parcours()`), banc de rendu `scripts/word/banc_b7.js` (référence `banc_b7_reference.json`, **comparer à largeur de fenêtre identique**), planche-contact des modèles (voir § 6). Pas de Python dans le PATH : scripts via l'outil Write puis `node`.
4. Mode de travail : Denis est à bout de forces et délègue (mode Nuit possible), mais veut une **maquette validée** avant d'implémenter un nouveau modèle.

## 1. Constats utiles (audit du code, 2026-10-01)
- Un modèle créatif = une **recette** dans `_PDF_CREATIF_RECETTES` (`modules/cv-pdf-html/cvPdfPanneauReglages.js`, ~ligne 1207) : un jeu de réglages (gabarit, couleurs, fond de colonnes, forme, photo, pastilles, etc.). Les modèles de la maquette ont `gabaritMaquette: "<nom>"` (rendu dans `cvPdfTemplateMaquette.js`).
- Galerie : `_PDF_GALERIE_CREATIF_IDS` (même fichier, ligne 55) ; ids lus par le banc via `_pdfIdsModelesCreatif()`. Modèles sobres : variantes `mq-*` choisies par `_pdfChoisirVarianteSobre`.
- **`sidebarVague` utilise déjà le gabarit `"lateral"`** avec `fondColonnePleineHauteur: true`, `fondColonnes: "gauche"`, `colonneVague: true`, `anneauPhoto: true`, `styleTitres: "bandeau"`. La « colonne pleine hauteur » n'est donc pas à inventer : le travail est d'abord une **nouvelle recette du gabarit `lateral`** (bord droit de la colonne droit au lieu de la vague, couleurs foncées ou claires, titres plus sobres), puis d'éventuelles options.
- Réglages de colonnes existants : `regFondColonnes` (droite, gauche, lesDeux, aucun), `regFormeColonnes` (rectangle, diagonale), `regFondColonnePleineHauteur`, `regColonnesInversees`, `regLargeurColonneGauche`, `regFondColonnesEffet`, `regDegradeColonnes`. Sur « Colonne » (`mqColonne`), « fond à gauche » colore la colonne large, pas l'étroite.
- Tâche d'options par modèle : `cvPdfOptionsParModele.js` (fichier généré par l'inventaire `scripts/word/matrice_options.js`, fusion par `scripts/word/matrice_fusion.js`).
- Word : lit la géométrie du rendu PDF (`modules/cv-word/wordExtracteur.js`) ; un fond de colonne foncé avec texte clair existe déjà (Sidebar vague, Bandeau vertical).

## 2. Lot 1 : « Colonne pleine hauteur » (créatif foncé + sobre clair)
Cases à cocher, **un commit par phase**.

- [ ] **P0 Prototype par recette (effort bas, 1 séance).** Copier la recette `sidebarVague` sous un id provisoire (`prototypeColonne`), passer `colonneVague: false`, essayer couleur foncée (`#1f2a44`), claire (`#e8e8e8`), `anneauPhoto`, `styleTitres: "souligne"`. Produire des **planches-contact** (§ 6) à comparer aux exemples 3, 5, 6, 10, 11, 14, 16. Écrire dans ce fichier la liste exacte de ce qui manque encore (frise ? bandeau haut ? coin diagonal ? pictos ronds ? filet des titres ?). **Aucun commit de code** avant la validation de P1.
- [ ] **P1 Maquette et validation par Denis (Mode A).** Présenter 2 ou 3 planches (foncé, clair, avec ou sans frise) ; Denis tranche : nom, options retenues, ce qu'on écarte. Consigner la décision dans ce fichier. Aucune implémentation avant son accord.
- [ ] **P2 Implémentation de la recette.** Ajouter la recette et, seulement si P0 le montre nécessaire, les options manquantes dans le gabarit `lateral` (`cvPdfTemplateMaquette.js`) : bord droit, frise d'expériences (réutiliser le rendu de la Frise), bandeau haut ou coin, pictos ronds sur les titres, titre avec filet prolongé. Chaque option : un réglage nommé, jamais une duplication de code (règle « une seule source »). Mode sombre vérifié.
- [ ] **P3 Enregistrement.** Id dans `_PDF_GALERIE_CREATIF_IDS`, libellé et vignette, ajout à `scripts/word/banc_b7.js` (déjà bouclé sur `_pdfIdsModelesCreatif()`), `cvPdfOptionsParModele.js` régénéré par `matrice_options.js` puis `matrice_fusion.js` (réglages sans effet grisés).
- [ ] **P4 Variante sobre claire** (crème ou gris, sans décor) : variante `mq-*` ou recette sobre, enregistrée dans les variantes Sobre. Mêmes vérifications.
- [ ] **P5 Word.** Banc B7 (PDF, Word, XML) ; mesure dans un vrai Word avec `word-mesurer.ps1` et `pdf-vers-png.ps1` (récepteur `recepteur.js`, port 8124, base64) : texte clair sur colonne foncée, photo ronde, frise. Rappel : les empreintes Word dépendent de la largeur de la fenêtre.
- [ ] **P6 Tests.** `npm test` vert ; ajouter des essais dans `parcours_smoke.js` (le modèle s'affiche, la colonne couvre la page, les réglages ne cassent rien) ; inventaire « bouton x modèle » sur les nouveaux modèles (0 erreur JavaScript) ; mode sombre ; téléphone étroit ; CV très long (2 pages).
- [ ] **P7 Clôture.** Régénérer `banc_b7_reference.json`, mettre à jour la passation (`ETAT_DES_CHANTIERS.md`), la mémoire, `docs/ANALYSE_MODELES_CV_EXEMPLES_2026-10-01.md` (état), commit.

Risques à garder en tête : texte clair sur fond foncé (contraste, impression en noir et blanc), CV long qui dépasse la colonne, Word qui coupe une colonne pleine hauteur sur deux pages, photo absente (la colonne doit rester propre).

## 3. Lot 2 : sobre « Éditorial » (famille B)
Grand nom en pile, police à empattement, trait vertical (option existante « Trait entre les deux colonnes »), teinte de page, colonne étroite à droite ou à gauche (`colonnesInversees`). Phases : P0 prototype par recette de `mq-epure` ; maquette ; implémentation ; enregistrement dans les variantes Sobre ; Word (en-tête libre à deux blocs) ; tests ; clôture. Point à vérifier : une teinte de page (fond du papier) existe-t-elle déjà côté Word ?

## 4. Lot 3 : sobre « Chronologique » (famille C)
Dates et lieu en marge à gauche de chaque expérience (le modèle Photo le fait déjà), durée en italique, option colonne à droite. Même découpage en phases. Point à vérifier : réutiliser la marge de dates de `mq-photo` plutôt que la recopier.

## 5. Ensuite, si Denis le veut
Famille D « Grille » (cases à filets), famille E « Cartes à fond pâle », famille F (bandeaux noirs inclinés) écartée pour l'instant.

## 6. Planche-contact (outil de comparaison visuelle)
Dans la page « La mise en page » avec un CV rempli (`banc_b7.js`, `await __preparer()`), pour chaque modèle : choisir le modèle, relire `document.querySelector('#zonePdfInlineCV iframe').contentWindow.document` (styles + `#conteneurPage`), puis afficher chaque page dans une `iframe srcdoc` réduite (`transform: scale(.3)`) dans une grille (3 colonnes de 242 px), une capture d'écran par série de 6. Recharger la page ensuite pour tout remettre.

## 7. Estimation honnête
- P0 + P1 : une séance courte (analyse, planches). C'est la seule partie à faire avant toute décision.
- P2 à P7 : effort élevé, en plusieurs séances ; le coût réel dépend de ce que P0 révèle (si une recette du gabarit `lateral` suffit, c'est moyen ; s'il faut une frise ou un bandeau haut dans `lateral`, c'est élevé).
- Lots 2 et 3 : moyens chacun.

## 8. Images de référence (à ne pas perdre)
Les 17 exemples de Denis sont **copiés dans `docs/modeles_exemples/`** (dossier hors Git, voir `.gitignore` : captures de CV de tiers, données personnelles masquées, jamais publiées ; il reste dans OneDrive). Les originaux de la conversation étaient dans un dossier temporaire, qui peut disparaître.
Correspondance avec la numérotation de l'analyse (n° d'analyse : fichier) : 1 : `3.jpg` (développeur, grand nom orange) ; 2 : `4.png` (manager, bandeau foncé et colonne grise) ; 3 : `5.jpg` (illustratrice, colonne marine et frise) ; 4 : `6.png` (étudiant en droit, colonne claire à droite, dates en marge) ; 5 : `7.jpg` (politique européenne, colonne ardoise) ; 6 : `8.png` (technicien bureau d'étude, coin orange et frise) ; 7 : `9.jpg` (lead dev, nom et poste géants) ; 8 : `10.png` (profil frontend, grille violette) ; 9 : `11.jpg` (bandeaux noirs inclinés) ; 10 : `12.png` (technicien informatique, colonne grise et frise) ; 11 : `13.jpg` (ingénieur machine learning, coin diagonal bleu) ; 12 : `14.png` (étudiant école 42, bandeau bordeaux) ; 13 : `15.png` (maçon, cartes pâles) ; 14 : `16.png` (élève ingénieur, filets orange) ; 15 : `17.png` (PFE, cases à filets de couleurs) ; 16 : `18.jpg` (juriste, colonne noire et dates en marge) ; 17 : `19.png` (fabrication 3D, filet orange). Un fichier `1.png` et `2.png` du dossier d'origine sont des captures d'écran de travail, sans rapport.
Si le dossier d'origine a disparu et que les copies aussi, demander à Denis de renvoyer les captures.
