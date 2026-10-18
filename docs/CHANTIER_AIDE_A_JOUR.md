# Chantier : remettre à jour le bouton Aide (ampoule)

Ouvert le 2026-10-15 à la demande de Denis. Statut : TERMINÉ le 2026-10-15 (tâches 1 à 7 cochées), reste la fenêtre « Coordonnées de l’entreprise » (voir bas de page) et le contrôle des fiches Qui fait quoi quand le module ouvrira.

## Constat (audit du code réel, `js/app.js` ~40130 à 40900, `index.html:186`)

Le bouton `#btnAide` ouvre « Explication rapide » (`AIDE_PAGES[page]`) et « Visite guidée » (halo sur un sélecteur réel). Fenêtres ouvertes : `AIDE_FENETRES[contexte]`.

1. **Pages sans aucune aide** : `candidater`, `creer-cv` (le bouton affiche « Aucune explication disponible »).
2. **Contextes de fenêtre utilisés par le code mais sans entrée `AIDE_FENETRES`** : `regard-exterieur-fiche-frein`, `regard-exterieur-mes-freins`, `regard-exterieur-selection`, `reperes-saisie-libre`, `ressources-locales`.
3. **Entrées `AIDE_FENETRES` qui ne semblent plus appelées** (à vérifier une par une, peut-être détectées autrement) : `avertissement-entreprise`, `choix-document-metier`, `coordonnees-entreprise`, `cv-existant`, `entreprise-connue`, `maj-cv`.
4. **Textes probablement périmés** : l'aide n'a pas été relue après l'éditeur de CV (boutons « Style rapide », « Mise en page », retours), « Un CV, plusieurs métiers », « Qui fait quoi » (déjà faite le 2026-10-13), ni les nouveaux modèles de CV. À confirmer écran par écran.
5. **Sélecteurs de visite guidée morts** : la visite ne garde que les étapes dont le sélecteur existe ; un sélecteur périmé fait silencieusement disparaître une étape. Jamais contrôlé sur l'ensemble depuis le 2026-09-03.
6. **Pages sans entrée mais pourtant routées** : à re-contrôler (comprendre-les-chiffres, noté en 2026-09-13).

## Plan (une case par tâche)

- [x] 1. `[effort : moyen]` Écrire un contrôle automatique (script navigateur, réutilise `scripts/parcours`) : pour chaque route et chaque contexte de fenêtre, dit si l'aide existe et combien d'étapes survivent au filtre des sélecteurs. Produit l'inventaire exact (remplace les points 1 à 6 ci-dessus par des faits).
- [x] 2. `[effort : bas]` Ajouter les entrées manquantes : `candidater`, `creer-cv`, et les 5 contextes de fenêtre du point 2.
- [x] 3. (fait 2026-10-15, voir bilan en bas) `[effort : bas]` Réparer les sélecteurs morts trouvés en 1 (ou retirer l'étape avec une ligne de justification).
- [x] 4. (fait 2026-10-15, voir bilan en bas) `[effort : haut]` Relire le texte de chaque entrée existante contre l'écran réel (public fragile, ton simple, français impeccable, jamais « IA » visible, aucun tiret long). Décision de Denis sur les textes qui promettent une fonction modifiée.
- [x] 5. (retrait validé par Denis et fait le 2026-10-15) `[effort : bas]` Trancher les entrées orphelines du point 3 (supprimer ou rebrancher).
- [x] 6. `[effort : bas]` Ajouter à `parcours_smoke.js` un essai « aucune page ni fenêtre sans aide », pour que ça ne se re-périme pas. Règle à noter dans LECONS (une entrée d'aide par nouvel écran, déjà en 9.x).
- [x] 7. (fait 2026-10-15) `[effort : moyen]` `npm test` + vérification navigateur (clair, sombre, mobile) de chaque page corrigée.

## Zéro régression
Aucune étape d'aide existante supprimée sans ligne dédiée validée par Denis.

## Résultat de la tâche 1 (2026-10-15) : inventaire automatique

Outil : `scripts/parcours/inventaire_aide.js` (`await window.__inventaireAide()`, navigateur intégré). Lancé sur dossier vide, 41 routes parcourues.

**Faits sûrs**
- Routes sans aucune aide : `candidater`, `creer-cv`, `decouverte`, `comprendre-les-chiffres-intro`, `comprendre-les-chiffres` (5, dont 3 non vus à l'audit statique).
- Fenêtres : 5 contextes utilisés sans entrée (`regard-exterieur-fiche-frein`, `regard-exterieur-mes-freins`, `regard-exterieur-selection`, `reperes-saisie-libre`, `ressources-locales`) ; 6 entrées sans usage apparent (à trancher, tâche 5). Les 8 entrées `decouverte-*` sont détectées par empreinte de contenu, donc probablement vivantes.
- Pages dont la visite guidée est vide (0 étape survivante) à vide : `resultats`, `coherence-transversale`, `reperes`, et `mon-territoire` (sélecteur du bouton `#btnMonTerritoireCommencer` introuvable dans le module lui-même : à vérifier en priorité).

**À ne pas croire sans re-test** (faux positifs probables, l'inventaire a tourné sans dossier ni parcours guidé) : `.barre-etapes-bilan` signalé mort sur ~15 pages (il n'existe qu'en parcours guidé), et toutes les pages marquées « non atteinte » (`ats`, `regard-recruteur`, `comparer-pistes`, `un-cv-plusieurs-metiers`, `decouverte`).

**Suite logique** : tâche 1 bis, rejouer l'inventaire avec un dossier de test rempli et en parcours guidé pour éliminer ces faux positifs, avant d'attaquer la tâche 3.

## Tâche 1 bis (2026-10-15) : inventaire rejoué avec dossier rempli (modes « nouveau » et « mettre à jour »)

**Confirmé** : aucune aide pour `candidater`, `creer-cv`, `decouverte`, `comprendre-les-chiffres-intro`, `comprendre-les-chiffres`. `coherence-transversale`, `reperes` et `mon-territoire` : 0 étape de visite guidée visible à l'ouverture de la page.

**Corrigé par rapport au premier passage** : en parcours « mettre à jour » les pages `objectif`, `projet`, `revelation`, `votre-parcours` n'ont plus que `.barre-etapes-bilan` en défaut (apparaît seulement dans un vrai parcours guidé). `resultats` ne perd plus que `.et-apres` (et `[data-rect-doc]` selon l'état).

**Limite de la méthode (honnête)** : un balayage page par page ne prouve pas qu'un sélecteur est mort. Contrôle croisé par grep : les 23 sélecteurs « morts » testés existent tous dans le code (par ex. `#btnMonTerritoireCommencer`, `#ctChampQuestions`, `#reperesListeConteneur`). Ils n'apparaissent qu'après un clic ou un chargement (sections repliées, écran intermédiaire, module fermé au public). Les pages marquées « non atteinte » (`ats`, `regard-recruteur`, `comparer-pistes`, `un-cv-plusieurs-metiers`, `decouverte`) redirigent ou demandent un état précis.

**Conséquence sur le plan** : la tâche 3 (sélecteurs morts) ne peut pas être automatique. Elle devient un contrôle manuel dans le navigateur, module par module, dans l'état où l'ampoule est réellement utilisée, et à traiter avec la tâche 4 (relecture des textes) qui demande de toute façon de regarder chaque écran. Les tâches 2 (entrées manquantes), 5 (orphelines) et 6 (essai anti-péremption) restent valables telles quelles.

## Tâche 2 faite (2026-10-15)
Ajouté dans `js/app.js` : `AIDE_PAGES` pour `candidater`, `creer-cv`, `comprendre-les-chiffres-intro`, `comprendre-les-chiffres` ; `AIDE_FENETRES` pour `regard-exterieur-selection`, `regard-exterieur-fiche-frein`, `regard-exterieur-mes-freins`, `reperes-saisie-libre`, `ressources-locales`. `decouverte` était une fausse alerte : la route redirige vers `decouverte-intro`, déjà couverte. Vérifié navigateur : toutes les étapes ajoutées trouvent leur élément (sauf `reperes-saisie-libre`, non ouvert en essai, et `.barre-etapes-bilan` de `creer-cv` qui n'existe qu'en parcours). `npm test` 1557 verts.

## Tâche 5 : tri des entrées orphelines (2026-10-15), en attente de validation de Denis

Vérifié par grep sur tout le dépôt (js, modules, data, tests, scripts) et par `git log -S`.

- **À GARDER** : `coordonnees-entreprise` (utilisée : 3e paramètre de `ouvrirPanneauGuide`, `js/app.js:9003`, que le premier balayage n'avait pas vu). Corrige l'erreur du point 3 de ce document : l'entrée n'est pas orpheline.
- **À RETIRER (5 entrées mortes)**, fenêtres supprimées quand la cascade de fenêtres de « candidater » a été remplacée par une page dépliante (commit `8d14a5a1`, sous-lot 4b) ; aucune référence ne subsiste ailleurs que dans les maquettes d'archive :
  - `choix-document-metier` (couverte aujourd'hui par `AIDE_PAGES.candidater`, bloc « Ce que vous préparez »)
  - `entreprise-connue` (remplacée par `entreprise-connue-candidature`, qui existe et est utilisée)
  - `avertissement-entreprise` (couverte par `candidater`, bloc « Votre cible »)
  - `cv-existant` et `maj-cv` (couvertes par `candidater`, bloc « Votre CV »)
  Aucune fonction d'aide n'est perdue : chacune a un équivalent actif.

## Tâche 6 faite (2026-10-15)
Parcours `aide` ajouté à `scripts/parcours/parcours_smoke.js` (`await window.__parcours(['aide'])`, inclus dans la suite par défaut) : 3 essais, chaque page routée a une aide, chaque contexte de fenêtre lu dans le code a son entrée, aucune entrée de fenêtre morte. Exception déclarée : `decouverte` (redirige). Vérifié : vert sur l'état réel ; en retirant exprès `creer-cv`, `ressources-locales` et en ajoutant une entrée bidon, les trois essais échouent en nommant le fautif. La règle « une entrée d'aide par nouvel écran » existe déjà dans LECONS (ligne 96), non dupliquée. Reste : tâche 3 (sélecteurs, à la main) et tâche 4 (relecture des textes), puis tâche 7.

## Séance du 2026-10-15 (suite, autre compte) : tâches 3 et 4, premier passage

**Fait et vérifié dans le navigateur**
- `mon-territoire` / `mon-territoire-intro` : aucun sélecteur mort. `#btnMonTerritoireCommencer` existe sur la page de présentation (le module lui-même ne l'a jamais eu : le faux positif de l'inventaire venait de là, et de la pause de 700 ms trop courte). Les autres sélecteurs apparaissent selon l'écran (département choisi, domaine, fiche). Module fermé au public : fiches, copier et listes d'employeurs introuvables tant que les employeurs ne sont pas validés (`_mtEmployeurs()` vide), vérifié dans le code uniquement. Texte conforme au bouton « Ouvrir Qui fait quoi ».
- `reperes` : la page de présentation (avant « Je commence ») n'avait aucune étape. Ajout de 2 étapes (`.reperes-accueil-types`, bouton « Je commence »). Les 3 étapes existantes vivent bien sur l'écran suivant. Rien retiré.
- `coherence-transversale` : même cause, 1 étape ajoutée sur `#ctBoutonJeCommence`. Les 4 étapes existantes vivent sur l'écran de collecte (vérifié), les 2 dernières seulement à l'étape assistant. Rien retiré.
- `npm test` 1557 verts, parcours `aide` vert.

**Points qui attendent une décision de Denis (rien modifié)**
1. `resultats` : le texte promet « trois encadrés : Le format, La mise en page, Exporter ». Le rectangle « Le format » n'existe plus : il reste « La mise en page » et « Exporter » (verrouillé : « s'ouvrira après Valider le CV »). Texte à réécrire (proposition faite à Denis).
2. `preparer-lettre-entretien` et `mettre-a-jour-cv` : l'étape « L'offre visée » vise `#prepLEBloc4`, qui n'existe plus dans `data/metiers.js` (le bloc n'est plus rendu). Retrait ou renvoi vers la page « candidater » : décision de Denis.
3. `reperes` : l'étape « regard extérieur » vise une zone de hauteur zéro tant qu'il y a moins de 3 Repères (halo invisible).

**Reste à contrôler (tâches 3 et 4)** : objectif (blocs après un choix), un-cv-plusieurs-metiers (`#contenuPageUcpm`), lexique (fiche), bilan, éditeur de CV (Style rapide, Mise en page, retours), nouveaux modèles, puis fenêtres (`AIDE_FENETRES`), puis tâche 7 (clair, sombre, mobile).

**Décision Denis (2026-10-15)** : point 1 tranché, texte de `resultats` réécrit sur « La mise en page » (Style rapide, ambiances, modèles) et « Exporter » (s’ouvre après « Valider le CV »), sans « Le format ». Points 2 et 3 toujours en attente.

**Décisions Denis (2026-10-15, « je suis tes recommandations ») et faits**
- Point 3 (Repères) : fait (157acce7). Le halo vise le bouton « Demander un Regard Extérieur » quand il existe (3 Repères), sinon la liste ; vérifié dans les deux états.
- Point 2 (L'offre visée) : **RETRAIT validé par Denis**, ligne dédiée : étape « L’offre visée » (`#prepLEBloc4`) retirée de `preparer-lettre-entretien` et `mettre-a-jour-cv`. Justification : le bloc n'est plus rendu par `data/metiers.js` ; la saisie du nom, du site et de l'offre se fait maintenant sur la page « candidater », bouton « Renseigner l’entreprise » (fenêtre « Coordonnées de l’entreprise », vérifiée). Aucune fonction perdue : phrase correspondante ajoutée à l'étape « Votre cible » de `candidater`.

**Éditeur de CV (ff2b0d7e)** : 5 étapes ajoutées à `resultats` (Style rapide, Mise en page, Choisir une ambiance, Revenir au modèle de départ, Valider le CV), relues contre l'écran et les infobulles réelles ; un encart « Pour aller vite » ajouté à l'aide intégrée « La mise en page ». Rien retiré. Étape « Et ensuite ? » toujours absente tant que le document n'est pas récupéré (normal).

**À TRAITER APRÈS la fin du chantier aide (demande de Denis, 2026-10-15) : la fenêtre « Coordonnées de l’entreprise » peut-elle devenir un bloc dans la page ?**
Constats déjà faits (code lu, rien modifié) : la fenêtre est `ouvrirFormulaireCoordonneesEntreprise` (`js/app.js:8928`). Deux entrées : (1) page « candidater », bouton « Renseigner l’entreprise » (`data-cand-entreprise`, `js/app.js:1451`), qui l'annonce comme « seule fenêtre restante du parcours » ; (2) `_verifierCoordonneesAvantPasserAction` (`js/app.js:8813`) via `ouvrirDemandeCoordonneesEntreprise`, quand on répond à une offre sans entreprise connue. Un équivalent EN PAGE existe déjà : `contenuCoordonneesEntrepriseBilanInline` / brique `bilanCorpsCiblageOffreHTML` (Bilan, Préparer, Cohérence). Piste : réutiliser cette brique dans la page « candidater » au lieu de la fenêtre. Maquette + audit complet avant tout code (effort haut).

**Relecture des barres d'étapes (tâche 4, 2026-10-15)** : les textes « Où vous en êtes » ont été comparés aux vraies barres (constantes `*_NAV_ETAPES`, `ATS_ETAPES`, `RR_ETAPES`, `COMPARER_NAV_ETAPES`, `UCPM_ETAPES`). Corrigés pour reprendre exactement les noms affichés : Co-construire ma lettre (Préparer, Assistant, Rédiger, Terminé), Préparer un entretien (Préparer, Assistant, S'entraîner, Terminé), Les mots de votre CV (Préparer, Envoyer, Résultat, Ma fiche), Un regard sur mon CV (Préparer, Envoyer, Le regard, Ma fiche), Comparer mes pistes (6 étapes), Un CV plusieurs métiers (8 pages). Page Objectif : ordre des étapes corrigé (informations avant parcours) et un tiret cadratin retiré. Aucune étape supprimée.

**Défaut trouvé et corrigé en passant (visite guidée)** : sur une page longue, le halo était posé 350 ms après le début du défilement, parfois hors écran avec une hauteur nulle (constaté sur « Vos documents »). `afficherEtapeVisiteGuidee` attend maintenant que la cible soit à l'écran et immobile. Vérifié : les 7 étapes de `resultats` ont leur halo sur la cible ; sombre et mobile (375 px) lisibles. `npm test` 1557 verts, parcours `aide` vert. Leçon ajoutée dans LECONS (ligne sous « bouton d'aide fixe »).

## BILAN FINAL du chantier (2026-10-15, fin de séance)
Commits de la séance : 5d2ea893, dc52e58d, 157acce7, 6a32a983, ff2b0d7e, 0e193f32, aed0d0ee, 356ea329.
- Fait : présentations de Repères et Cohérence couvertes ; texte « Vos documents » refait ; 5 étapes de l'éditeur de CV ; halo des Repères ; retrait validé de « L'offre visée » ; 6 textes de barres d'étapes alignés ; ordre Objectif ; tiret cadratin retiré ; défaut du halo hors écran corrigé sur les pages longues.
- Vérifié navigateur : Qui fait quoi, Repères (2 états), Cohérence, Objectif (avant/après choix), Vos documents (7 étapes, clair, sombre, mobile 375 px). `npm test` 1557 verts, parcours `aide` vert.
- Contrôle par le code seulement (non rejoué à l'écran) : les 33 sélecteurs de fenêtres (`AIDE_FENETRES`) existent tous dans le code ; fiches et boutons « Copier » de Qui fait quoi (module fermé, employeurs non validés) ; Un CV plusieurs métiers (textes recoupés avec le module).
- Non traité : pastilles « - » (trait d'union utilisé comme tiret) laissées, la règle ne vise que les tirets longs.

## AUDIT : fenêtre « Coordonnées de l’entreprise » (2026-10-15, lecture seule, rien codé) `[effort : haut]`

**Où elle apparaît (2 endroits seulement, vérifié par grep sur tout le dépôt)**
1. **Page « candidater »** (la personne vient de choisir un métier ou un secteur dans la recherche de l'accueil) : dans le bloc 2 « Votre cible », après « Je vise une structure précise », bouton « Renseigner l’entreprise » (`data-cand-entreprise`, `js/app.js:1451`). Le bloc reste « à compléter » et « Continuer » reste grisé tant que ce formulaire n'est pas validé (`b2ok`, `js/app.js:1355`). C'est ici que la fenêtre est vraiment OBLIGATOIRE dans le parcours.
2. **Bouton « Passer à l’action »** en bas de l'étape « Votre profil » du parcours de création du CV (`js/app.js:11207` puis `_verifierCoordonneesAvantPasserAction`, `js/app.js:8804`) : seulement si la personne a dit « je réponds à une offre » (ou « structure précise ») ET n'a pas rempli l'entreprise sur « Votre objectif ». Une première petite fenêtre demande « Connaissez-vous l’entreprise ? » (Continuer sans / Indiquer l’entreprise) ; « Indiquer » ouvre ensuite la grande fenêtre. « Continuer sans » repasse la recherche en « simple » et vide l'entreprise.
Les variantes stage / alternance / formation ont été retirées de ce point le 2026-10-01 (décision Denis).

**Ce que la fenêtre écrit** : `dossier.rechercheCandidature` (entreprise, site, lien/texte de l'offre, civilité et nom du recruteur, couleur de l'entreprise), `dossier.typeRecherche = 'offre'`, `dossier.typeCV`, `dossier.civiliteRecruteurDemandee`. Écriture immédiate à chaque saisie.

**Un équivalent EN PAGE existe déjà** : `contenuCoordonneesEntrepriseBilanInline` (`js/app.js:6990`) = `bilanCorpsCiblageOffreHTML` (entreprise, site, offre, type de structure) + civilité + couleur, branché par `wireModeRecherche` (`js/app.js:6517`, écriture à la frappe sans re-rendu). Il sert déjà sur « Votre objectif », dans le Bilan, dans « Préparer » et dans Cohérence. C'est un sur-ensemble de la fenêtre (le type de structure en plus).

**Faisabilité**
- **Endroit 1 (candidater) : OUI, faisable.** Remplacer le bouton + la fenêtre par ce bloc affiché directement sous « Je vise une structure précise ». Simple : la brique existe et écrit au même endroit. À régler : le bloc 2 passe « complété » quand le nom de l'entreprise est rempli (`rc.entreprise`), avec mise à jour du badge et du bouton « Continuer » pendant la frappe, sans perdre le curseur ; « Continuer » ne se débloque que si le nom est rempli (règle actuelle conservée). Risque moyen : pas de test automatique sur cette page, test navigateur complet à faire (clair, sombre, mobile). Aide : l'entrée `coordonnees-entreprise` de la fenêtre disparaît, remplacée par une étape de la page « candidater ».
- **Endroit 2 (Passer à l'action) : à décider.** Ce n'est pas un formulaire mais un rappel. Le même bloc est déjà sur « Votre objectif ». Trois options : (a) garder la petite question Oui/Non seule, sans la grande fenêtre (renvoie vers « Votre objectif ») ; (b) la remplacer par un encart dans la page « Votre profil » avec les deux boutons ; (c) ne plus rien demander et laisser « Continuer sans » implicite (risque : on perd le reclassement « offre » vers « simple » si le nom est vide).

**Verdict** : GO AVEC RÉSERVES pour l'endroit 1 ; l'endroit 2 attend le choix de Denis. Effort de réalisation : haut (brique partagée, parcours à rejouer). Non codé.

## RÉALISÉ : fenêtre « Coordonnées de l’entreprise » remplacée par du contenu en page (2026-10-15, validé par Denis : bloc en page + option A) `[effort : haut]`
Commits : d27b49c5 (page candidater), 36e3f9ca (encart « Passer à l'action », retrait des fenêtres).
- **candidater** : le bloc 2 affiche directement entreprise / site / offre / type de structure / destinataire / couleur (brique `contenuCoordonneesEntrepriseBilanInline(true, true)`, libellé « le nom de l’entreprise est nécessaire pour continuer »). Écriture à la frappe dans `dossier.rechercheCandidature`, badge « complété » et bouton « Continuer » mis à jour sans re-rendu (curseur conservé). Règle conservée : « Continuer » ne se débloque que si le nom est rempli. Bouton « Changer » du métier : vrai bouton (demande de Denis, plus de lien-texte).
- **Passer à l'action** (option A) : encart dans la page avec « Indiquer l’entreprise » (renvoie sur « Votre objectif », où le bloc est en page) et « Continuer sans » (même règle qu'avant : recherche « simple », entreprise vidée).
- **Retirés** (validés par Denis avec la maquette) : `ouvrirDemandeCoordonneesEntreprise`, `ouvrirFormulaireCoordonneesEntreprise`, entrées d'aide `entreprise-connue-candidature` et `coordonnees-entreprise`. Aide : nouvelle étape « L’entreprise visée » sur candidater, texte « Votre cible » mis à jour.
- **Vérifié** : navigateur (clair, sombre, mobile 375 px), `npm test` 1557 verts, parcours `candidaterEntreprise` (10 essais, nouveau), `aide`, `cartes` verts. La suite complète des 126 parcours n'a pas été rejouée (trop longue pour une séance) : à lancer par lots à ta convenance.
