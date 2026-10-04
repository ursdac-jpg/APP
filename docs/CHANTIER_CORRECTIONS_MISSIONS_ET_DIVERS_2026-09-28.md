# Corrections diverses (missions IA, panneau mise en page, écrans annexes) - 2026-09-28

> Fichier de suivi interne (Claude). Denis ne veut pas relire un plan ligne à ligne : il veut des
> résultats et que rien ne se perde. Coché au fur et à mesure, un commit par sous-étape.

Point de départ : `git log -1` = `ce7ce85` (chantier P1-P12 clos, 2026-09-28 matin).

---

## PASSATION - reprise sur un autre compte, état au 2026-09-29 au réveil

**Avant toute chose : relire `CLAUDE.md` + `docs/TRAVAILLER_AVEC_DENIS.md` en entier**, comme le
prescrit le protocole (Passation) - ce résumé ne les remplace pas.

### État du dépôt
- `git log -1` = **`ce78ad5`** ("K7 (revu) : bloc photo inline réutilisé + correction navigation
  Régler l'en-tête"). `git status` **propre**, rien en attente de commit.
- `npm test` : **1018/1018 verts** à ce commit.
- Aucun `push` fait (protocole : jamais sans demande explicite de Denis).

### Tout ce qui est FAIT et committé cette nuit (mode nuit, feu vert de Denis)
Groupes J (missions/certifications/équilibrage compétences pro-comportementales/plafond
propositions IA) et K (carte "En-tête de CV", écran de relecture IA retiré, marges 6mm, style des
compétences + style des missions comme leviers d'optimisation, photo inline) - **tous cochés `[x]`
dans ce fichier, chacun avec sa vérification navigateur décrite**. Ne rien refaire de tout ça sans
un fait nouveau concret - relire l'entrée correspondante avant de douter.

### MISE À JOUR 2026-09-29 (session de reprise) : points 1, 2 et 4 FAITS
- **Point 1 (Formations Épuré/Condensé)** : champ canonique `styleFormations` (`reglagesMiseEnPage.js`, PDF seulement, Word l'extrait du rendu), select caché `regStyleFormations` dans l'iframe, rendu dans `missionsFormationHtml` (`cvPdfTemplateMaquette.js`), bouton « Style des missions » dans la carte Formations, gestionnaire `data-mep-missionsformations` (`js/app.js`).
- **Point 2 (Expérience personnelle)** : `missionsHtml` lit `stylePersonnel` pour les missions `em:` (indépendant des Expériences, jusque-là il suivait en silence `styleProfessionnel`). Bouton « Style des missions » ajouté dans la carte (mode Développer).
- **Point 4 (leviers)** : `missionsPerso` et `missionsFormations` branchés dans `_pdfEssayerTasserEspaces` / `_pdfEssayerAererEspaces`. Vérifié en direct : bascule, annulation, persistance canonique.
- **Point 3 (signe séparateur) FAIT** : 6 signes validés par Denis (point-virgule, point médian, rond, carré, losange, barre), champ canonique `separateurMissions`, un seul choix pour les 3 rubriques, visible seulement sous un style Condensé. Vérifié en direct.
- **Photo, option A : FAIT (2026-09-29)**. Denis a validé : original réduit gardé (`dossier.photo.source`, 1000 px) et bouton « Ajuster le cadrage » dans la carte En-tête. Code : `modules/photo-cadrage/photoCadrage.js` (+ `tests/photoCadrage.test.js`), branché dans `ajouterPhotoAuDossier()` ; `souhaitee` n'est plus écrasé à l'ajout d'une photo (bug latent corrigé au passage). Maquette : `docs/MAQUETTE_RECADRAGE_PHOTO_2026-09-29.html`. Vérifié en direct (ajout, annulation, validation, ajuster, clair et sombre). Les photos ajoutées AVANT cette évolution n'ont pas d'original : le bouton « Ajuster » n'apparaît pas pour elles (« Changer la photo » reste possible). `npm test` 1023/1023.
- **Nettoyage B.7 (ancien moteur Word)** : tâche à part, niveau d'effort ÉLEVÉ, sur branche séparée, SEULEMENT après le feu vert explicite de Denis. Lui rappeler l'effort avant de commencer. **Correctif 2026-09-29 (retour Denis « le bouton ne fait rien »)** : le panneau contient DEUX blocs photo aux mêmes ids (carte « En-tête de CV » et « Réglages supplémentaires > Le haut de la page », `_htmlBlocPhotoMiseEnPage`) ; le câblage utilisait `getElementById` et n'atteignait que le premier, donc tous les boutons du second étaient morts. Câblage désormais sur chaque bloc (`_mepPourChaque`). Duplication d'affichage RÉSORBÉE le 2026-09-29 sur décision de Denis : le bloc de « Réglages supplémentaires » et `_htmlBlocPhotoMiseEnPage()` sont supprimés, la photo se gère uniquement dans la carte « En-tête de CV » (le câblage `_mepPourChaque` reste tolérant).
- `npm test` 1018/1018. **Reste (ancienne formulation) : le point 3 (signe séparateur, 5 à 10 options, à proposer à Denis) puis la question de la photo (Denis a choisi l'option A : recadrage avec zoom et déplacement, maquette d'abord).**

### (Historique de la passation initiale) CE QUI RESTE - un seul gros morceau, explicitement reporté par Denis "à la fin"

**Chantier "Style des missions étendu" (regroupe 3 demandes successives de Denis, voir détail
complet dans l'entrée K8 ci-dessous, section "Étape 3/4")** - PAS COMMENCÉ, à traiter ensemble :

1. **Formations : ajouter Épuré/Condensé** - n'existe pas du tout aujourd'hui (ni champ canonique
   `dossier.reglagesMiseEnPageCV.styleFormations` ou équivalent, ni UI dans la carte "Formations",
   ni logique de rendu). À construire de zéro, sur le modèle exact de `styleProfessionnel`.
2. **Expérience personnelle : le champ existe (`stylePersonnel`, UI déjà là) mais le RENDU de la
   galerie ne le lit jamais** - `cvPdfTemplateMaquette.js` ne référence `stylePersonnel` nulle part
   (vérifié par grep), seulement l'ancien `cvPdfTemplateA4.js`. Il faut étendre le rendu de la
   rubrique "Expérience personnelle"/engagements dans `cvPdfTemplateMaquette.js` pour qu'il lise ce
   réglage (actuellement toujours rendu en épuré, quoi qu'on mette dans le `<select>` caché).
3. **Choix du signe séparateur en mode condensé** - actuellement toujours point-virgule en dur
   (`cvPdfTemplateMaquette.js` ~ligne 324, à vérifier l'emplacement exact au moment de reprendre).
   Denis veut un choix parmi 5 à 10 options professionnelles et cohérentes (il a cité : point-virgule,
   rond, carré, triangle) - proposer une liste, PAS improviser une seule option. Doit s'appliquer aux
   3 rubriques (Expériences pro, Expérience personnelle, Formations).
4. **Une fois 1-2-3 prêts** : brancher `missionsPerso` (déjà écrit mais volontairement PAS actif,
   voir K8) + 2 nouveaux leviers Formations dans `_pdfLeviersEspaces()`/`_pdfEssayerTasserEspaces`/
   `_pdfEssayerAererEspaces` (`cvPdfPanneauReglages.js`) - même mécanisme exact que `missionsPro`
   (déjà fait et vérifié fonctionnel, s'en inspirer directement : écrire sur le `<select>` caché de
   l'iframe ET sur `dossier.reglagesMiseEnPageCV` pour la persistance, jamais un seul des deux).

**Piste technique à vérifier avant de coder le point 3 (signe séparateur)** : chercher comment le
mode condensé assemble les missions aujourd'hui (probablement un `.join('; ')` ou équivalent dans
`cvPdfTemplateMaquette.js`/`cvPdfTemplateA4.js`) pour savoir où brancher un séparateur variable au
lieu du point-virgule fixe.

### Question ouverte de Denis, PAS technique, à lui reposer avant de coder quoi que ce soit dessus

Après le point 4 ci-dessus (ou en parallèle si Denis préfère), Denis a soulevé une question sur la
photo (carte "En-tête de CV", bloc photo revu cette nuit, voir K7) : **comment garantir que la photo
importée est à la bonne taille pour le CV, et pouvoir la repositionner/la bouger ?** Aujourd'hui,
`ajouterPhotoAuDossier()` (`js/app.js` ~16346) redimensionne automatiquement en carré 400×400 et
recadre au centre - **aucun contrôle manuel de position ou de zoom pour la personne**. C'est une
vraie question de conception (UI de recadrage ? simple zoom/déplacement ? où ?) - **présenter une
recommandation + les options à Denis avant de coder**, ne pas décider seul, ce n'est pas un simple
bug technique.

### Rappel important (protocole mode nuit)
Avant de reprendre CHAQUE sous-tâche ci-dessus : relire l'état réel des cases cochées dans ce
fichier + `git log`, pas seulement ce résumé (qui peut lui-même dater si une autre session a avancé
entre-temps). Un commit par sous-étape, `npm test` + vérification navigateur à chaque fois, jamais
de `push`.

---

## Cause racine confirmée (Groupe A)

Deux fonctions indépendantes joignent les missions rédigées par l'assistant avec `'. '` (paragraphe)
au lieu de `'\n'` (une par ligne) :
- `joindreMissionsImport` (`js/app.js:32462`) - utilisée par le moteur d'import générique
  (`SPECIFICATION_IMPORT` / `fusionnerDonnees`), déclenché par le parcours "Créer un nouveau CV"
  (confirmé par Denis) et par "Analyser ma candidature" (organisation).
- `_joindreMissionsIA` (`modules/cv-core/moteurDecisionCV.js:413`) - utilisée par les missions IA
  sur Formations / Expérience personnelle / Engagements (chantier "exp perso" 2026-09-27/28).

Le rendu final (CV/PDF/Word, `_pdfDecouperMissions`, `modules/cv-pdf-html/cvPdfTemplateA4.js:193`)
a DÉJÀ un repli qui sait re-découper un paragraphe joint par des points (`split(/\.\s+(?=[A-ZÀ-Ý])/)`)
- c'est pour ça que le rendu final a parfois l'air correct. Mais le PANNEAU d'édition
(`modules/cv-pdf-html/cvPdfCartesMaquette.js`, sections Expériences/Formations/Expérience
personnelle) fait un `.split('\n')` NU, sans ce repli - d'où "1 mission" au lieu de plusieurs.

**Plan de correction (une seule vraie cause, 3 volets) :**
1. `joindreMissionsImport` et `_joindreMissionsIA` : `.join('. ') + '.'` -> `.join('\n')`.
2. `cvPdfCartesMaquette.js` : partout où le panneau fait `texte.split('\n')` sur des missions,
   remplacer par la fonction partagée `_pdfDecouperMissions` (déjà robuste, déjà utilisée par le
   rendu) - une seule source de vérité pour découper des missions, jamais un 2e mécanisme.
3. Vérifier `savoirFaireParExperience` (point 6, "Compétences professionnelles") séparément - piste :
   peut-être un champ voulu comme paragraphe par conception, à confirmer avant d'y toucher.

## Liste des 14 points, groupés

### Groupe A - régression missions (bloc Expériences/Formations/Expérience personnelle)
- [x] A1. Corriger `joindreMissionsImport` (js/app.js:32462) : `\n` au lieu de `. ` - FAIT, vérifié
      navigateur (`joindreMissionsImport([...])` renvoie bien des `\n`)
- [x] A2. Corriger `_joindreMissionsIA` (moteurDecisionCV.js:413) : `\n` au lieu de `. ` - FAIT,
      même correctif, couvert par `tests/moteurDecisionCV.test.js` (1018/1018 verts)
- [x] A3. Panneau : remplacer les `.split('\n')` nus par `_pdfDecouperMissions` partagée
      (cvPdfCartesMaquette.js - sections Expériences [L251], Formations [L396], Expérience
      personnelle [L537], `_htmlEditionExperienceMq` [textarea + diff `segmentsAvant`/`anciensTextes`
      L1290+]) - FAIT, vérifié navigateur : dossier de test avec missions jointes à l'ancien format
      (`"A. B. C."`) affiche maintenant 3/3 (au lieu de 1/1) dans le panneau Expériences ET
      Expérience personnelle, et le textarea d'édition affiche bien 1 mission par ligne.
- [x] A4. Point 6 : TROUVÉ - 3e occurrence du même bug (`moteurDecisionCV.js`, application de
      `savoirFaireParExperience` à `objetDecide.experiences[].missions`, `.join('. ')` corrigé en
      `\n`). "COMPÉTENCES PROFESSIONNELLES" du point 6 est en fait les missions de la VRAIE
      expérience "Éducateur - Capsport", pas une rubrique séparée - corrigée par le même correctif
      que A1/A2/A3. Reste un doute non résolu : si le mode "Par compétences" regroupe encore le
      texte en paragraphe par un mécanisme d'affichage distinct (`competencesGroupeesParTheme`,
      structure différente et non affectée par ce correctif), Denis doit revérifier sur son
      dossier réel - je ne peux pas reproduire son cas exact sans son vrai contenu IA.
- [x] A5. Point 7 : missions décochées qui restent affichées sur le CV - résolu structurellement
      par A3 (panneau et rendu lisent désormais les mêmes segments via `_pdfDecouperMissions`)
- [x] A6. Point 8b : case "Éditer les expériences" peu visible - FAIT, classe `.ck-marque`
      (bordure + fond, mise en évidence quand active), CSS ajoutée avec variante `[data-theme="sombre"]`
      héritée des variables existantes. Le champ Missions vide en édition était réglé par A3.
- [x] A7. Point 9 : clic "Choix personnel" casse la mise en page - FAIT et vérifié navigateur.
      Cause : `.ligne-bloc.ouvert` (pleine largeur) ne dépendait que de la liste de missions
      ouverte, jamais du formulaire d'édition ouvert en même temps - fermer "Choix personnel" en
      laissant l'édition ouverte retombait sur la colonne étroite (300px). Corrigé.
- [x] A8. Point 10 : PRÉCISÉ par Denis (le mode Résumé n'était pas le problème, il marche bien) -
      le vrai bug : le compteur global "Missions par expérience" montait jusqu'à 10 (valeur
      arbitraire), même quand aucune expérience du dossier n'a autant de missions - au-delà du
      vrai maximum, "+" ne changeait plus rien à l'affichage mais le chiffre continuait de
      grimper. FAIT et vérifié : plafond calculé sur la plus longue expérience du dossier
      (`maxMissionsExp`), le bouton "+" se désactive à ce plafond, "Complet" vise ce même maximum
      réel au lieu d'un 10 fixe. Périmètre : uniquement le compteur GLOBAL des Expériences
      professionnelles (Formations/Expérience personnelle utilisent déjà un plafond par item, pas
      de compteur global équivalent, donc pas concernées par ce bug précis).
- [x] A9. Point 11 : bouton "Annuler" à retravailler visuellement - FAIT (classe `.mep-btn` ajoutée
      aux boutons Annuler de Formations/Expérience personnelle, cohérent avec Experiences qui
      l'avait déjà).
- [x] A10. Point 13 : Formations ET Expérience personnelle dotées du même mécanisme de sélection
      par mission (bouton "Missions/Choix personnel" + liste à cocher) qu'Expériences
      professionnelles - FAIT et vérifié (panneau + rendu final PDF, choix précis appliqué
      correctement dans les 2 cas testés). Helper partagé `_mepHtmlMissionsPickerMq` (une seule
      source de vérité pour les 3 cartes). Word non touché : ce réglage n'existait déjà pas côté
      Word pour Formations/Expérience personnelle avant ce correctif (vérifié par grep) - pas une
      régression introduite ici, simple parité PDF/Word pas encore faite pour ces 2 rubriques
      (chantier Word séparé, en cours).

### Groupe B - rubriques qui débordent / positionnement
- [x] B1. Point 5 : Centres d'intérêt mal positionné (flottement au milieu de page) - case restée
      cochée par erreur pendant la rédaction initiale ; il s'agit du même défaut que B2/B3
      (point 5 = 1er signalement, avant les captures plus précises des points 14/20) - résolu par
      le même correctif (Langues + Centres d'intérêt toujours ensemble, toujours en bas de page).
- [x] B2. Point 14 : FAIT et vérifié navigateur (modèle 2 colonnes, celui des captures de Denis).
      Cause : `_PDF_RUBRIQUES_PLEINE_LARGEUR` ne connaissait que 4 rubriques (perso/form/certifs/
      centres) - "langues" en était absente, et le mécanisme ne déplace jamais 2 rubriques
      ensemble. Décision de Denis : toujours en bas de page, peu importe le débordement - donc pas
      une rubrique de plus à équilibrer, une règle fixe. Langues + Centres d'intérêt retirées de la
      colonne normale (par défaut ET Personnaliser) et rendues ensemble (`paire()`) dans une
      nouvelle section pleine largeur, toujours après le corps 2 colonnes. Vérifié : plus de
      doublon nulle part, fonctionne aussi si une ancienne disposition Personnaliser les citait
      encore.
- [x] B3. Point 20 (suite du point 14, capture reçue) : le modèle **1 colonne** ("Deux colonnes"
      décoché) avait le même défaut, non traité au point 14. Centres d'intérêt couplé à Logiciels
      (souvent vide) et Langues à Certifications (toujours vide depuis la fusion Certifications→
      Formations) - chacun seul dans sa paire, d'où le décalage vu par Denis. FAIT et vérifié
      navigateur : Langues + Centres d'intérêt partagent maintenant le même `.paire` dans ce
      modèle aussi, Logiciels sur sa propre ligne. Les modèles de la galerie (Rectangles/Photo/
      Frise, code séparé) pas encore vérifiés - à faire si un cas similaire y est signalé.

### Groupe C - écran "La mise en page", réglages orphelins
- [x] C1. Point 3 : FAIT et vérifié navigateur. Cause : le garde-fou `docActif === 'cv' &&
      !ongletApercu` (js/app.js, `construireContenuApercuFinalisation`) ne vérifiait jamais
      `opts.miseEnPageRefonte` - il s'exécutait AVANT le bon traitement de l'écran unique (plus
      bas dans la même fonction), qui ne fixe jamais explicitement `ongletApercu` par design. Les
      2 grandes cartes Word/PDF s'affichaient donc à chaque rendu au lieu de ne plus jamais
      apparaître. Ajouté `&& !opts.miseEnPageRefonte` à la condition.
- [x] C2. Point 4 : PAS un bug séparé - résolu structurellement par A1-A4 (voir ce groupe). Testé
      en direct avec une expérience à 6 missions réelles : Automatique -> 4, Complet -> 6, Résumé
      -> 1, correctement différencié. Le "aucun effet" constaté par Denis venait du bug des
      missions (chaque expérience n'affichait qu'1 mission à l'époque, donc les 3 modes donnaient
      le même résultat par construction). À reconfirmer par Denis sur son dossier réel.

### Groupe D - écrans indépendants
- [x] D1. Point 1 : FAIT et vérifié navigateur. `CATALOGUE_MISSIONS_FORMATIONS_PAR_SECTEUR`
      (js/app.js) passé de 7 à 19 secteurs, alignés sur `SECTEURS_APP` (data/metiers.js, socle déjà
      utilisé par les 129 fiches métiers - source unique, pas de recherche web nécessaire) - inclut
      Sport/Animation sportive et Animation sociale explicitement demandés. Bouton "Afficher
      d'autres secteurs" ajouté : les 7 secteurs d'origine restent visibles d'emblée, les 12
      nouveaux se déplient au clic (jamais 19 pastilles d'un coup).
- [x] D2. Point 2 : FAIT et vérifié navigateur. Écran identifié : `pageAssistant()` (js/app.js,
      route `#assistant`), 4 accordéons (style d'écriture / choisir l'assistant / importer la
      réponse / choisir ce qui ira sur le CV). Cause : quand aucun des 4 n'est ouvert (retour
      depuis "Vos documents" par ex.), le code rouvrait TOUJOURS le 1er (style d'écriture) sans
      regarder si les étapes précédentes étaient déjà validées. Corrigé : rouvre désormais le
      premier NON validé (reprend où la personne en était), jamais un retour en arrière forcé.
      Testé les 2 cas : état neuf -> ouvre bien l'étape 1 (pas de régression) ; 3 étapes déjà
      validées -> ouvre bien la 4e au lieu de la 1re.

### Groupe E - nouvelle fonctionnalité
- [x] E1. Point 12 : FAIT et vérifié navigateur. Choix "Développer" (défaut, comportement
      inchangé) / "Citer seulement" (une simple énumération des titres sur une ligne, ex.
      "Bricolage, Electricite, Peinture", jamais les missions) ajouté en tête de la carte
      Expérience personnelle. En "Citer", la liste à cocher se simplifie (juste case + titre,
      aucun contrôle de missions). État `_cvPdfExpPersoModeAffichage` (iframe) /
      `dossier.pdfReglages.expPersoModeAffichage`, persistant. **Scope** : PDF uniquement (comme le
      reste du panneau "La mise en page"), Word non touché - convention du projet "PDF d'abord,
      Word ensuite".

## Groupe F - Certifications fusionnées dans Formations + missions partout (audit fait 2026-09-28)

**Décision de Denis (confirmée)** : pas de souci de compatibilité avec les dossiers déjà en cours
(l'appli n'est pas encore en ligne, la mise en ligne se fera sur un autre site, différemment) - la
priorité est la cohérence de ce qui se construit maintenant, pas la préservation de l'existant.

**Audit** : `dossier.certifications` est lu tel quel (simple texte) à une trentaine d'endroits
(Word, lettre, entretien, exports, assistant) - décision d'architecture volontaire du 2026-09-26
(`modules/cv-core/certifications.js`) pour éviter justement ce genre de restructuration. CQP/Titre
professionnel sont déjà dans `dossier.formations` (pas dans `dossier.certifications`) - seules les
"vraies" certifications (SST, HACCP, permis...) sont concernées.

**Approche retenue (scope réduit, risque réduit, même résultat visible)** : fusion **à
l'affichage** dans le panneau "La mise en page" (PDF) uniquement - Certifications rendues avec
Formations, sous un seul bloc, avec missions - **sans changer le format de stockage de
`dossier.certifications`** (reste une liste de textes, les ~30 autres endroits - Word, lettre,
entretien, exports - restent inchangés et non affectés).

- [x] F1+F2. FAIT et vérifié navigateur. Certifications fusionnées dans la carte/le bloc
      "Formations" (panel ET rendu PDF 2 colonnes) : chaque certification devient un objet
      "formation" éphémère (`_pdfFormationDepuisCertification`/`_mepFormationDepuisCertification`,
      via `separerCertification()` déjà existante) - une seule liste, un seul mécanisme (missions,
      "Choix personnel", "Modifier", visibilité individuelle). `dossier.certifications` INCHANGÉ
      (reste un texte simple, les ~30 autres endroits qui le lisent ne sont pas touchés). Pas
      besoin d'un état parallèle séparé (F2) : les certifications réutilisent directement l'état
      Formations existant (`missionsParFormation`/`missionsChoisiesFormation`/`texteParFormation`),
      même clé (intitulé normalisé). Ancienne rubrique "Certifications" retirée du rendu 2 colonnes
      et des réglages ("Rubriques à afficher", "Listes courtes 2 colonnes") - plus de doublon
      possible. La zone "Modifier mes certifications" (Éléments supplémentaires) reste inchangée :
      c'est la source (intitulé/organisme/lieu/date), jamais touchée par ce chantier.
- [x] F3. `prompts/cv.md` : nouveau point 19 (missions pour CHAQUE certification, même règle que
      le point 18), nouveau champ JSON `certificationsAvecMissions`, "neuf exceptions" (au lieu de
      huit) dans les consignes de fiabilité. Point 18 renforcé : établissement/lieu doivent être
      recopiés tels quels, indépendamment des missions, jamais sacrifiés l'un pour l'autre.
- [x] F4. `moteurDecisionCV.js` : `objetDecide.certificationsAvecMissions` ([{certification,
      missions}]), même principe que `engagementsAvecMissions`/`loisirRetenu` (`certifications`
      reste un tableau de chaînes, impossible d'y accrocher `.missions` directement).
      `_pdfFormationDepuisCertification` (cvPdfTemplateA4.js) les rattache par correspondance
      exacte de texte au rendu.
- [x] **Bug réel trouvé et corrigé en vérifiant** : le panneau lisait `dossier.formations`/
      `dossier.certifications` BRUTS, jamais enrichis des missions IA (`formationsAvecMissions`/
      `certificationsAvecMissions`), qui n'étaient appliquées qu'au rendu final - exactement le
      genre de "trou" que Denis avait signalé. Nouveau miroir `window._mepFormationsMoteur`
      (même principe que `_mepExperiencesMoteur`/`_mepExperiencePersoMoteur`, déjà existants pour
      Expériences/Expérience personnelle) posé par `_pdfConstruireResultatCourant`
      (cvPdfPanneauReglages.js). Un 2e bug trouvé en vérifiant CE correctif : l'appel initial à
      `_pdfFormationsEtCertifications` était fait sans le préfixe `window.parent.` requis (cette
      fonction vit dans la fenêtre principale, pas dans l'iframe) - silencieusement retombait sur
      le repli sans jamais planter. Corrigé, revérifié : le panneau affiche maintenant bien "2/2
      missions" pour une formation ET une certification enrichies par l'assistant.
- [x] F5. Vérification navigateur + `npm test` faite à chaque étape (1018/1018 tout du long).

## Ordre d'exécution (historique)
A (1 à 10) -> B -> C -> D -> E (cadrage séparé, pas avant validation du reste) -> F

---

## REPRISE APRÈS COMPACTAGE - état au 2026-09-28, fin d'après-midi/soir

**Dernier commit au moment d'écrire ceci : `3f3f08d`** (`git log -1` pour vérifier que rien n'a
été perdu). Tout ce qui précède (Groupes A à F, points 1-15) est FAIT, testé (`npm test`
1018/1018 à chaque étape) et committé. Point 20 (alignement Langues/Centres, modèles 1 ET 2
colonnes) et point 10 (compteur missions plafonné au vrai max) FAITS aussi (commits `1fda24e`,
`3f3f08d`). **Ne rien refaire de tout ça sans un fait nouveau.**

### Groupe G - Écran "Vos formations et diplômes" (js/app.js, fonction autour de la ligne 11580-11730,
### cherchée via "Modification de la formation sélectionnée") - EN ATTENTE DU FEU VERT EXPLICITE
### DE DENIS, ne pas coder avant qu'il le dise clairement.

Contexte : capture d'écran reçue montrant l'écran d'édition d'une formation existante
("Assistante de vie aux familles"), type "Titre professionnel" choisi mais aucun niveau -- tant
que `nf.niveauRNCP` est `null`, tous les champs (intitulé, année, centre, ville) restent
`disabled` (voir `niveauChoisi = nf.niveauRNCP !== null` ligne ~11700), et le bloc missions
(`contenuMissions`, ligne ~11690) ne s'affiche que si `nf.niveauRNCP !== null && nf.niveauRNCP <=
4` -- donc invisible tant qu'aucun niveau n'est choisi. Denis avait d'abord cru le champ missions
absent (il existe, juste caché derrière le niveau) : le vrai fix retenu est G1 ci-dessous, pas
"toujours tout montrer".

**STATUT : Groupe G FAIT et vérifié navigateur (G1-G4), commit à suivre.**

- [x] G1. **Nouveau bouton "Je ne sais pas"** à côté des pastilles de niveau ("Quel est le niveau
      ?", ligne ~11702 `pastillesNiveau`). Plus visible/plus grand que les pastilles de niveau. Au
      clic : déverrouille intitulé/année/centre/ville/domaine-secteur/missions SANS exiger de
      niveau précis (probablement un flag `nf.niveauInconnu = true`, et `niveauChoisi = nf.niveauRNCP
      !== null || nf.niveauInconnu`). Il faudra aussi adapter `contenuMissions` (ligne ~11690, sa
      condition `nf.niveauRNCP <= 4` doit aussi passer si `nf.niveauInconnu`) et
      `formationBrouillonPeutAjouter()` (ligne ~11418, ne doit plus bloquer sur `nf.niveauRNCP ===
      null` si `nf.niveauInconnu`).
- [x] G2. FAIT et vérifié. Bouton "Annuler" (`bannerEdition`) supprimé. `ajouterFormationBtn` fait
      double fonction : nouvelle fonction `_formationBrouillonModifie(nf, editIndex)` compare le
      brouillon (intitulé/année/centre/lieu/type/niveauRNCP/missions reconstituées) à la formation
      enregistrée - libellé + comportement "Annuler" (jamais désactivé) tant que rien n'a changé,
      "Enregistrer les modifications" dès qu'une différence réelle existe. Testé en direct : état
      neutre -> "Annuler" ; après saisie d'une mission -> "Enregistrer les modifications" (bleu).
- [x] G3. FAIT et vérifié. Flag persistant `dossier.formationPulseIntituleVu` (posé comme effet de
      bord au premier rendu qui montre le pulse, même convention que `_mepSigCarteExperiences`
      ailleurs dans le code) - le pulse ne s'affiche plus qu'une seule fois, jamais aux formations
      suivantes. Testé en direct : 1ère formation vide -> pulse visible + flag posé ; 2ème
      formation vide -> pulse absent.
- [x] G4. Vérifié + corrigé :
      - `prompts/extraction-cv.md` : CONFIRMÉ, demande déjà `etablissement`/`lieu`/`missions` pour
        les formations (ligne ~117), texte d'explication clair (ligne ~23). Rien à changer.
      - `prompts/reformuler-cv.md` : CONFIRMÉ, demande déjà `etablissement`/`lieu` (ligne ~111/132).
      - `_reformulerCvFusionnerFormations` (`data/metiers.js:6427`) : BUG CONFIRMÉ ET CORRIGÉ.
        L'appariement par sous-chaîne de l'intitulé échouait dès que l'assistant reformulait
        l'intitulé différemment (ex. "Assistante de vie aux familles" -> "ADVF - Assistant de vie
        aux familles") - la fiche existante (établissement/lieu compris) était alors dupliquée
        avec les infos perdues sur la copie de l'assistant. Ajout d'un repli : même année ET au
        moins un mot significatif (≥4 lettres) en commun entre les deux intitulés. Testé en
        direct : le cas "ADVF" ci-dessus fusionne désormais correctement (établissement/lieu
        conservés) ; deux formations réellement différentes (années différentes) ne fusionnent
        jamais à tort.
      - `prompts/cv.md` : déjà renforcé plus tôt ce soir (points 18/19, Groupe F).

### Groupe H - Points signalés, priorité basse (Denis : "à la fin")

- [x] H1 (point 18). **INVESTIGUÉ, EXPLIQUÉ ET CORRIGÉ.** Pas un bug : il existe VRAIMENT 2 façons
      de faire une lettre - « Co-construire ma lettre » (carte "Me préparer à candidater", route
      `co-lettre`, prompt `lettre-co.md`, vrai écran de dépôt du CV, en profondeur) et « Préparer
      ma lettre et mon entretien » (carte "Mes documents", mode `pret`, prompt `lettre.md`,
      réutilise le CV automatiquement, volontairement rapide - décision de Denis du 2026-09-03,
      `docs/CHANTIER_L1_CO_LETTRE_MOTIVATION.md`). Denis a pris le 2e sans le savoir, d'où la
      surprise "directement au 2e passage". Le vrai trou : rien ne distinguait les deux avant de
      cliquer. FAIT : (1) l'infobulle de "Co-construire ma lettre" (accueil, `INFOS_CARTE_ACCUEIL`,
      `data/metiers.js`) précise maintenant "En profondeur, avec plusieurs échanges" ; (2) une
      ligne de contexte ajoutée sur le tout premier écran du parcours rapide (`pageResultats()`,
      accordéon "Adaptation au métier", uniquement pour `docActif==='lettre'`) : "Ce parcours
      réutilise directement votre CV... pour une lettre plus approfondie, utilisez plutôt
      « Co-construire ma lettre »". Vérifié en direct (navigateur, capture prise) : texte visible
      au bon endroit, absent pour `docActif==='entretien'` (scope volontairement limité à lettre).
- [x] H2 (point 19). **INVESTIGUÉ, CORRIGÉ ET VÉRIFIÉ (commit 7286220).** Pas le "niveau du
      poste" (GROUPES_STYLE_CV, catégorie, sans rapport) ni `dossier.entretienDirect.poste` (champ
      mort, jamais écrit par aucun écran). Le vrai cas : écran "Candidature" -> "Un métier précis"
      (`banniereMetierCible()`, [js/app.js:8966](js/app.js:8966), champ "Quel métier recherchez-vous ?"
      câblé par `wireRechercheMetierCible()` ~9152) - reste vide après un 1er passage IA (dépôt/
      extraction CV en mode `pret`), alors que `dossier.titreCV` vient d'être rempli par
      l'extraction. `dossier.metierCible` n'est écrit QUE par un clic explicite sur ce champ, jamais
      par l'extraction. Reproduit en direct (navigateur : dossier.titreCV='Vendeuse en boulangerie',
      metierCible=null -> écran Candidature -> champ vide). Décision Denis (2026-09-28) : "je valide
      ta reco" -> pré-remplir uniquement le TEXTE de la barre de recherche avec `dossier.titreCV`
      (si `metierCible`/`secteurCible` vides), rien sélectionné automatiquement - la personne
      clique une suggestion du répertoire ou valide tel quel (Entrée), comme avant. Même mécanisme
      à appliquer côté "domaine" si présent (fonction jumelle `contenuRechercheDomaineCorps`/
      banniere domaine). EN COURS D'IMPLÉMENTATION.
- [x] H3 (point 21). **INVESTIGUÉ, CAUSE RACINE TROUVÉE, REPRODUITE ET CORRIGÉ (avertissement).**
      Fichiers de Denis : `cv (4).docx` (converti en PDF via Word/COM pour le lire) vs
      `CV Josianne BEKONO_2.pdf` - comparés visuellement, écart confirmé : en Word, un immense vide
      blanc apparaît entre l'accroche et "Compétences professionnelles", qui repousse toute la suite
      sur une page 2 inutile (le PDF tient sur 1 page, sans aucun vide).
      **Cause** : le modèle utilisé (galerie "Bandeau diagonal"/`mqDiagonale`, `docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md`)
      avec en-tête en "position libre" (glisser/redimensionner les blocs nom/titre/accroche,
      `enteteLibreMq`) - reproduit en direct en rétrécissant la largeur du bloc accroche jusqu'à ce
      qu'il déborde de sa zone (le panneau prévient déjà visuellement : "Cadre rouge : ce bloc
      dépasse de sa zone"). `WordExtracteur.espacer()` (`modules/cv-word/wordExtracteur.js` ~1030)
      calcule l'espace "avant" un bloc comme `hautReel_du_bloc - curseur`, `curseur` avançant du bas
      mesuré de chaque bloc précédent - pour un bloc d'en-tête en position libre dont la zone visible
      ne correspond plus à son contenu réel (débordement), le bas mesuré ne correspond plus à où le
      corps du CV commence réellement dans le DOM : l'écart devient un immense paragraphe vide
      (`interligneExactPx`, 227px reproduit en test, ~338px chez Denis) inséré avant le tableau
      "Compétences professionnelles" (`w:before` correspondant confirmé dans le XML du .docx réel :
      avant=5068, largement au-dessus des ~15-270 des autres paragraphes).
      **Reproduit en direct** (navigateur, dossier de test + modèle "Bandeau diagonal" + "Régler
      l'en-tête" + accroche rétrécie) : `exporterCvWord(dossier)` puis inspection de `plan.flux`
      confirme un paragraphe vide `interligneExactPx: 227` juste avant le tableau du corps -
      exactement le symptôme visuel de Denis.
      **DÉCISION DENIS (2026-09-28)** : analyse approfondie demandée entre les 2 pistes (corriger
      `espacer()` en profondeur vs avertir/bloquer). Affinage : le déclencheur exact du bug est le
      MÊME chevauchement visuel déjà détecté par le panneau ("Cadre rouge") - `essayerSuperposition()`
      (`wordExtracteur.js` ~802) traite alors le bloc comme un décor superposé (`_flottant`), qui ne
      fait plus avancer le curseur, d'où le vide. Un bloc simplement rétréci SANS chevauchement ne
      déclenche pas le bug (vérifié). Donc avertir au moment du chevauchement = corriger exactement
      la cause, pas un pis-aller. Décision : avertissement (jamais de blocage - "jamais d'écran
      bloqué pour la personne" est une règle déjà établie ailleurs dans l'appli).
      **FAIT ET VÉRIFIÉ** :
      - `modules/cv-word/wordExtracteur.js` (`extraire()`) : nouvelle détection `verifierEnTeteLibreDeborde()`
        - reprend la même géométrie que `_mqVerifierRouge` (débordement de la zone OU chevauchement
        entre blocs `.tete.libre`/`.rc-boxes.libre > .blc`) - pousse un message clair dans
        `avertissements` (déjà retourné par `extraireAsync`, jamais utilisé jusqu'ici).
      - `js/app.js` : `avertissements` transmis de bout en bout (closure `cv.generer`, déballage
        générique dans `genererBlobDocumentActif`) jusqu'aux 2 boutons "Télécharger le Word" (fenêtre
        ERIP et l'autre emplacement) - nouvelle fonction partagée
        `afficherAvertissementsExportDocxSiPresents(resultat)` affiche le message via le toast déjà
        existant (`afficherToast`, 12s au lieu de 4s par défaut - message actionnable).
      Vérifié en direct (navigateur) : avec le bloc accroche en débordement réel, le toast
      "Un bloc de l'en-tête dépasse de sa zone ou en recouvre un autre..." s'affiche après le
      téléchargement ; sans débordement, `avertissements` reste vide (aucune régression, aucun faux
      positif). npm test 1018/1018 (aucun des ~25 tests Word existants cassé).

### Groupe I - Vérifications/limites connues, à traiter si un cas concret est signalé

- [x] I1 (suite point 20). **VÉRIFIÉ - AUCUN BUG.** Lu le code réel de "Rectangles arrondis"
      (`g === 'rectangles'`) et "Photo et frise"/"Colonne et frise" (`g === 'photo'`/`'frise'`,
      `cvPdfTemplateMaquette.js` ~674/~855) : ces 3 modèles ne partagent PAS le mécanisme `paire()`
      qui avait causé les points 14/20 (Langues+Centres forcés dans une même ligne) - chaque rubrique
      (Langues, Certifications, Centres d'intérêt...) y a systématiquement sa propre barre/section
      pleine largeur, jamais partagée avec une autre. Structurellement impossible d'avoir le même bug
      ici. Vérifié en direct (navigateur, CV de test avec Langues + Centres d'intérêt remplis) sur
      "Rectangles arrondis" : les 2 rubriques s'affichent chacune correctement, aucun chevauchement
      ni rubrique manquante.
- [x] I2. **VÉRIFIÉ - BUG RÉEL TROUVÉ ET CORRIGÉ.** Stress-test de `_reformulerCvFusionnerFormations`
      avec 2 formations DIFFÉRENTES de la même année partageant un mot générique ("Formation
      Secourisme (SST)" 2020 vs "Formation Comptabilité générale" 2020) : fusion à tort confirmée -
      la 2de volait l'établissement/lieu de la 1ère juste à cause du mot "formation" en commun.
      Corrigé : liste d'exclusion `_REFORMULER_CV_MOTS_GENERIQUES_FORMATION` (formation/titre/
      professionnel/diplôme/certificat/certification/niveau/brevet) - ces mots ne comptent plus comme
      signal de correspondance. Revérifié : le faux positif ne fusionne plus, le vrai cas (ADVF,
      G4) fusionne toujours correctement. npm test 1018/1018.
- [x] I3. **VÉRIFIÉ - AUCUN BUG.** G4 avait déjà confirmé le PROMPT (`extraction-cv.md` demande bien
      établissement/lieu) mais jamais le CODE qui applique le résultat. Vérifié en direct (navigateur) :
      `SPECIFICATION_IMPORT` (js/app.js:32819, `formations`) déclare bien `etablissement`/`lieu`
      comme n'importe quel autre champ - la chaîne complète testée avec une vraie réponse JSON
      simulée (`analyserReponseImport` -> `comparerDonnees` -> `fusionnerDonnees`) : établissement et
      lieu arrivent intacts dans `dossier.formations[]`, comme `intitule`/`annee`. Rien de spécifique
      à ces 2 champs qui pourrait les perdre - mécanisme générique, aucun bug trouvé.

### Groupe J - Points apportés le 2026-09-28 (2e volet), à traiter APRÈS tout ce qui précède
Denis explicite : "ils seront à corriger une fois qu'on aura fini avec tous les points
précédemment... on finit tout ce qu'on a commencé et après on fait ce deuxième volet." Ne pas
commencer avant d'avoir traité H2/H3/Groupe I (ou obtenu un feu vert explicite contraire).

- [x] J1. **CORRIGÉ ET VÉRIFIÉ (commit 5e6a3f7).** Cause : `construireBrouillonDepuisFormation()`
      (js/app.js:2530) retombe sur `typeCredential='diplome'` dès que ce champ n'est pas déjà
      enregistré sur la formation (cas de toute formation ajoutée AVANT le chantier typeCredential -
      import/extraction CV, catalogue Découverte). Ajout de `_inferTypeCredentialDepuisIntitule()` :
      reconnaît un intitulé commençant par "Titre professionnel" ou "CQP" plutôt que de forcer
      "Diplôme". Vérifié en direct (route `#projet` -> "Vos formations et diplômes") : la formation
      de la capture de Denis rouvre désormais directement sur "Titre professionnel" coché.
- [x] J2. **FAIT ET VÉRIFIÉ.** `contenuMissionsFormationBrouillon()` (js/app.js) : retiré le repli
      "7 visibles + bouton Afficher d'autres secteurs" (`NB_SECTEURS_VISIBLES_DEPART`,
      `tousSecteursVisibles`, `nf.afficherPlusSecteurs`) - les 19 secteurs s'affichent désormais
      tous directement. Câblage du bouton retiré (js/app.js ~7256). Vérifié en direct (navigateur) :
      les 19 secteurs visibles d'un bloc, aucun bouton résiduel.
- [x] J3 (apporté pendant H3, 2026-09-28). **FAIT ET VÉRIFIÉ.**
      **Lieu/organisme/date** : déjà couverts (`prompts/extraction-cv.md` ligne 46, format
      « Intitulé (organisme, lieu, date) », parsé par le module pont existant depuis le 26/09,
      `separerCertification`) - aucun changement nécessaire.
      **Missions** : DÉCISION DENIS ("canal séparé pour les missions", pas de restructuration de
      `dossier.certifications`). Investigation plus poussée : un canal séparé existait déjà
      (`reco.certificationsAvecMissions`, `moteurDecisionCV.js`) mais UNIQUEMENT pour la
      reformulation IA (éphémère, jamais persisté). Denis a confirmé vouloir le chantier complet
      (prompt + import + rendu) plutôt qu'une version réduite. Implémenté :
      - `prompts/extraction-cv.md` : nouveau champ JSON `certificationsAvecMissions` (même forme que
        `cv.md` point 19 : `{certification, missions}`, rapprochement par texte exact).
      - `js/app.js` (`SPECIFICATION_IMPORT`) : nouvelle entrée `certificationsAvecMissions`
        (liste-objets, `champsRapprochement: ['certification']`) - passe par le moteur d'import
        générique existant, aucun code spécifique.
      - `modules/cv-core/normaliserDonneesCV.js` : nouveau champ PERSISTANT
        `dossier.certificationsAvecMissions` exposé sur l'objet CV normalisé (même principe que
        `pointsForts`/`motsCles` juste au-dessus).
      - `modules/cv-core/moteurDecisionCV.js` : fusionne les 2 sources (IA fraîche EN PREMIER,
        donnée d'import PERSISTANTE en repli) avant de les appliquer aux certifications - zéro
        changement dans `_pdfFormationsEtCertifications` (déjà écrit pour lire ce champ).
      **Type Certificat/CQP/Diplôme** : déjà couvert - `extraction-cv.md` classe déjà l'IA dans 2
      tableaux séparés `formations`/`certifications`, aucune détection supplémentaire à coder côté
      application (contrairement à J1, qui concernait spécifiquement le sélecteur de type à la
      RÉOUVERTURE d'une formation, sans équivalent côté Certifications - pas de sélecteur de type là-bas).
      Vérifié en direct (navigateur), chaîne complète : import simulé -> `normaliserDonneesCV` ->
      `appliquerMoteurDecisionCV` -> `_pdfFormationsEtCertifications` -> rendu CV réel (missions
      visibles sous la certification, dans "Formations", exactement comme une vraie formation) ;
      sans donnée de missions, rendu inchangé (aucune régression). npm test 1018/1018.
- [x] J4 (apporté pendant H3, 2026-09-28, capture d'écran "Régler l'en-tête" ; précisé/généralisé
      dans la foulée). Aperçu plein écran du CV (`cvPdfPleinEcranMaquette.js`) : au même titre que
      "Retirer une compétence" (déjà existant, petite croix rouge sur chaque pastille), Denis
      demande de pouvoir retirer directement sur le CV, avec le même mécanisme visuel (petite croix
      rouge) :
      - une RUBRIQUE ENTIÈRE parmi Expérience / Formation / Certification / Loisir (elle part avec
        tout son contenu, ex. une expérience part avec toutes ses missions) - **un seul bouton
        générique** couvrant les 4 types plutôt que 4 boutons séparés ("pour minimiser les
        boutons") ;
      - une MISSION précise, quelle que soit sa source (expérience, formation, expérience
        personnelle/engagement...) - **un seul bouton générique** "Retirer une mission" couvrant
        toutes les sources, pas un bouton par type de rubrique.
      Utilité dite par Denis : pour les personnes plus à l'aise en travaillant directement sur
      l'aperçu du CV que sur les écrans de saisie classiques.
      + Ajout dans la foulée : un mécanisme d'annulation, même esprit que le bouton déjà existant
      "↺ Remettre l'en-tête à sa place" (`mqTRaz`) mais pour tout ce qui a été retiré (compétences/
      rubriques/missions) - DEUX boutons demandés :
      - une flèche courbée simple (↺) : annule le DERNIER retrait seulement (un clic = un retour
        en arrière) ;
      - une double flèche courbée : remet TOUT ce qui a été retiré depuis l'ouverture du plein
        écran (equivalent d'un "tout annuler").
      **FAIT ET VÉRIFIÉ (validé par Denis avant codage).**
      - `modules/cv-pdf-html/cvPdfTemplateMaquette.js` : filtre UNIQUE au niveau des données
        (`contenu`, juste après sa construction, avant la répartition par modèle de galerie) pour
        les rubriques retirées - chaque modèle lit `contenu` ensuite, aucun code par modèle. Filtre
        UNIQUE aussi pour les missions, dans `missionsHtml()` (déjà partagée) et dans une NOUVELLE
        fonction partagée `missionsFormationHtml(f, fi)` - qui a éliminé 4 COPIES IDENTIQUES du même
        bloc de rendu (une par modèle de galerie, trouvées en cherchant où brancher le filtre : vraie
        dette de duplication, corrigée au passage). `data-rub` ajouté (pur additif) à `barreR`/`phH`/
        `phLh`/`<h3>` (modèles "Rectangles arrondis"/"Photo et frise"/"Colonne et frise", qui
        n'avaient pas cet attribut contrairement à `h2[data-rub]` des autres modèles) pour une
        identification uniforme des rubriques, quel que soit le modèle.
      - `modules/cv-pdf-html/cvPdfPanneauReglages.js` : `_cvPdfRubriquesRetirees`/
        `_cvPdfMissionsRetirees` (mêmes principes que `_cvPdfCompetencesRetirees` déjà existant) +
        `_cvPdfHistoriqueRetraits` (ordre chronologique, {type, valeur}) commun aux 3 mécanismes de
        retrait. Nouvelles API `_pdfMqRetirerRubrique`/`_pdfMqRetirerMission`/
        `_pdfMqAnnulerDernierRetrait`/`_pdfMqToutRemettreRetraits`. Persisté dans
        `dossier.pdfReglages` comme le reste (survit à une fermeture/réouverture du plein écran).
      - `modules/cv-pdf-html/cvPdfPleinEcranMaquette.js` : nouveau bouton "Retirer une rubrique ou
        une mission" (mode `retirerRubrique`) + 2 boutons d'annulation, à côté des boutons existants.
        Croix rouges injectées en JS UNIQUEMENT quand ce mode est actif (jamais dans le rendu normal)
        sur `[data-rub]` (rubrique entière) et sur les `<li>` dont la clé `data-ed` correspond à une
        mission (`mi:`/`fm:`/`em:` - même clé que "Modifier le texte", aucune nouvelle convention).
      Vérifié en direct (navigateur, modèle "Bandeau diagonal") : retrait d'une mission seule (la
      formation garde son autre mission) ; retrait d'une rubrique entière (Formations disparaît
      complètement, Centres d'intérêt intact) ; annulation du dernier retrait (la mission revient) ;
      tout remettre (compétences + rubrique + tout revient). npm test 1018/1018.
- [x] J5 (apporté pendant H3, 2026-09-28, règle métier). "Motivation"/"Apprentissage" (savoir-être)
      sont le REPLI PAR DÉFAUT quand la personne n'a renseigné AUCUNE compétence comportementale
      (`js/app.js:3511` : `if (ordre.length === 0 && !decouverteAFourniQuelqueChose) { ['Motivation',
      'Apprentissage'].forEach(ajouter); }`). Denis précise une règle de PRIORITÉ pour un futur
      mécanisme d'équilibrage pro/comportementales (pas encore identifié dans le code - à chercher) :
      si un CV a TROP de compétences (professionnelles + comportementales) et qu'il faut en retirer
      pour tenir sur la page, les compétences comportementales de repli ("Motivation"/"Apprentissage")
      doivent être les TOUTES PREMIÈRES sacrifiées - jamais des compétences comportementales
      réellement saisies par la personne.
      **EN COURS D'INVESTIGATION (2026-09-28 soir, reprise après pause) - Denis a validé la direction
      "J5 puis J7" avant la pause.** Mécanisme trouvé : `_pdfCandidatsEquilibre()`
      (`modules/cv-pdf-html/cvPdfPanneauReglages.js` ~3544, appelé depuis le bouton "Mise en page" /
      `_pdfCalculerSuggestions`). Compare la HAUTEUR du bloc "Compétences professionnelles" (`hPro`)
      et "Compétences comportementales" (`hComp`) ; si `hPro - hComp >= 45` (px), propose :
      - `eq-plus-comp` (~3552-3566) : AJOUTE des comportementales (tirées du réservoir) jusqu'à
        équilibrer - ne RETIRE jamais de comportementales ici ;
      - `eq-moins-pro` (~3570-3585) : réduit les compétences PRO (garde les mieux classées) si le
        pro est trop haut ;
      - `eq-choisir` (~3589-3594) : ouvre "Choisir" pour que la personne trie elle-même les pro.
      **CONFIRMÉ ET CORRIGÉ.** Le sens inverse (comportementales trop hautes) n'existait nulle part -
      `_pdfCandidatsEquilibre()` ne faisait qu'AJOUTER des comportementales ou réduire les pro, jamais
      l'inverse. Ajouté : nouvelle branche `eq-moins-comp` (même fonction, `ecart = hPro - hComp`,
      `if (ecart >= 45) {...branches existantes...} else if (...) {...nouvelle branche...}`), déclenchée
      quand `hComp - hPro >= 45`. Réduit le nombre de comportementales affichées par paliers (plancher
      `Math.max(2, Math.ceil(nComp / 2))`, même principe que `eq-moins-pro`), en revérifiant la hauteur
      à chaque palier. **Priorité de sacrifice appliquée** : la liste affichée est retriée avant
      troncature ("Motivation"/"Apprentissage" toujours en dernier, via `competencesCompChoisies`
      explicite plutôt qu'un simple maximum - la troncature naturelle `slice(0, max)` les aurait gardées
      en premier puisqu'elles arrivent en tête de liste quand elles sont le seul repli). Vérifié par un
      test ciblé exécuté dans le vrai moteur JS du navigateur (4 scénarios : repli présent -> parti en
      premier ; pas de repli -> réduction normale par ordre ; pro trop haut -> ne déclenche pas cette
      branche ; écart faible -> aucune suggestion). `npm test` 1018/1018 (fichier non couvert par les
      tests Node, comme le reste du panneau PDF).
- [ ] J6 (apporté pendant H3, 2026-09-28, capture d'écran plein écran). **GRANDE IDÉE, PAS UN
      CORRECTIF - analyse de faisabilité déjà donnée à Denis en direct, à reprendre avant de coder.**
      "Déplacer les rubriques" : étendre le mécanisme "position libre" (aujourd'hui limité aux 4
      blocs d'en-tête - nom/coordonnées/titre/accroche, `.tete.libre .blc`,
      `cvPdfPleinEcranMaquette.js`) au CORPS du CV (Compétences/Expérience/Formations...), avec
      accrochage à des lignes façon grille (pas un déplacement libre au pixel) - **~70% faisable**,
      extension d'un mécanisme existant mais à refaire pour chacun des 15+ modèles de la galerie et
      pour l'export Word de chacun. + Demande annexe : réagencement automatique intelligent (les
      dates qui "se collent" toutes seules pour laisser la place à une rubrique déplacée par-dessus)
      - **~15-20% faisable tel que décrit** : c'est un vrai moteur de disposition automatique
      (résolution de collisions en temps réel), hors de portée raisonnable ici. SUGGESTION FAITE À
      DENIS (alternative plus accessible) : une grille FIXE par lignes/cases
      (extension du "Côté à côte"/"L'un sous l'autre" déjà existant) où une rubrique s'accroche à une
      case sans jamais pouvoir en recouvrir une autre PAR CONSTRUCTION - pas de moteur de collision
      à inventer. **DENIS VALIDE CETTE DIRECTION (2026-09-28) : "j'aime bien cette idée !"** - grille
      fixe par cases retenue comme approche, PAS ENCORE CONÇUE EN DÉTAIL NI CODÉE (nombre de cases par
      ligne, quels modèles de la galerie concernés en premier, etc. restent à définir - maquette à
      faire avant tout code). POINT DE VIGILANCE donné à Denis : H3 (ce même chantier) vient de révéler que le
      mécanisme position-libre actuel, limité à 4 blocs d'en-tête, crée déjà des bugs Word difficiles
      à détecter (voir H3 ci-dessus) - l'étendre à tout le corps du CV avant d'avoir consolidé
      l'existant multiplierait ce risque. PAS ENCORE INVESTIGUÉ EN PROFONDEUR NI CODÉ - décision de
      Denis attendue sur quelle direction prendre.
- [ ] J7 (apporté pendant J4, 2026-09-28, capture "Réglez le style d'écriture"). Sur `pageAssistant()`,
      l'accordéon "Choisir ce qui ira sur le CV" apparaît EN DESSOUS de "Réglez le style d'écriture"
      mais reste VERROUILLÉ tant que l'étape du dessus n'est pas finie ("Terminez d'abord l'étape...")
      - Denis constate que ce bloc verrouillé, visible mais inutilisable à ce moment précis, n'apporte
      aucune valeur ("valeur ajoutée nulle"). Proposition de Denis : retirer/déplacer ce bloc de cet
      emplacement, et mettre le bouton "Continuer" (actuellement "Ces réglages me conviennent →")
      dans la barre fixe du bas (à côté de Retour/Accueil), menant à l'étape suivante (normalement
      la partie IA/assistant). Avis donné en direct : diagnostic juste (bloc verrouillé = mauvaise
      UX), la barre fixe du bas est un principe déjà utilisé ailleurs dans l'appli (cohérent),
      faisabilité présumée simple mais PAS CONFIRMÉE (code de `pageAssistant()` pas encore ouvert).
      Denis confirme : à refaire une fois tous les points en cours terminés (2e volet).
      **INVESTIGUÉ (mode nuit, 2026-09-28) - AMBIGUÏTÉ RÉELLE TROUVÉE, PAS CODÉ.** `pageAssistant()`
      lu en entier (`js/app.js` ~11040) : l'accordéon "Choisir ce qui ira sur le CV" (`rectangleAssistant`,
      id `relecture-ia`) est un accordéon plat comme les 3 autres - replié, il affiche seulement son
      titre, JAMAIS de texte "Terminez d'abord l'étape..." ni de contenu visible verrouillé. Ce texte
      exact existe ailleurs, déjà repéré ce soir : `pageResultats()` ("Vos documents"), qui bloque "La
      mise en page" tant que "Choisir ce qui ira sur le CV" (même relecture-ia) n'est pas validé - la
      cible exacte du groupe K, pas `pageAssistant()`. Hypothèse la plus probable : Denis a décrit de
      mémoire l'écran de `pageResultats()` en pensant "l'assistant" au sens large (le parcours
      complet), pas la page technique `pageAssistant()` précisément. **NE PAS DEVINER** (garde-fou mode
      nuit) : ce point recoupe très probablement le groupe K (K1 retire précisément cet écran
      "Choisir ce qui ira sur le CV" et son verrou) - laissé de côté tant que Denis n'a pas confirmé
      quel écran il visait ; à revoir une fois K1 fait, le "verrou" qu'il décrit aura peut-être disparu
      de lui-même.
- [x] J8 (apporté pendant J5, 2026-09-28, suite de la discussion équilibrage). Denis remet en cause
      la limite de "5 compétences personnelles maximum" - trop basse face à un bloc "Compétences
      professionnelles" pouvant monter à 15+, alors que les compétences comportementales sont un
      critère de recrutement important. Investigation menée EN DIRECT AVEC DENIS dans le navigateur
      (dossier de démonstration injecté par la console) : **la limite de 5 n'est qu'un texte
      d'indication dans l'écran de relecture des propositions de l'assistant, jamais appliquée par
      le code** - le compteur "Compétences comportementales à afficher" du panneau "La mise en page"
      (`_pdfDefinirCompetencesComportementalesMax`, `modules/cv-pdf-html/cvPdfPanneauReglages.js`)
      n'a aucun plafond figé, il monte jusqu'à la taille du réservoir disponible (`info.pool.comportementales.length`).
      Le vrai goulot est en amont : `prompts/cv.md` (point 10) ne proposait que 3 à 10 compétences
      personnelles. **Décision de Denis** : équilibrer toujours en AJOUTANT des comportementales,
      jamais en retirant des professionnelles (cohérent avec `eq-plus-comp`, J5 ne s'applique qu'au
      cas inverse, rare). **FAIT ET VÉRIFIÉ** :
      - `prompts/cv.md` point 10 : plafond de proposition relevé de 10 à 15, avec consigne explicite
        de viser le haut de la fourchette aussi quand le professionnel est déjà riche (pas seulement
        quand il est pauvre) ; nouvelle consigne de comparaison au « Savoir-être » déjà connu de la
        personne (donné plus haut dans le profil transmis, `js/app.js` ~30247) pour ne jamais
        proposer un doublon, même reformulé.
      - `js/app.js` (`contenuOngletCompetencesPersonnellesIA`) : texte de l'écran de relecture
        changé - retire la mention "5 maximum", explique que ces compétences aident aussi à
        équilibrer le CV, aucun nombre imposé.
      - Aucun changement dans le panneau "La mise en page" : le compteur s'adapte déjà tout seul à
        un réservoir plus riche.
      Vérifié en direct (navigateur) : nouveau texte affiché correctement sur l'écran de relecture.
      Le contenu réel des propositions (respect du plafond 15, non-doublon) dépend du prompt et ne
      peut être vérifié qu'avec un vrai passage assistant, pas en synthétique. `npm test` 1018/1018.

## Groupe K - Écran de relecture IA retiré, "En-tête de CV" (apporté 2026-09-28, tard le soir)

Contexte complet : discussion en direct avec Denis (audit des 9 onglets de l'écran "Choisissez ce
que l'assistant propose" - `ouvrirRevoirPropositionsIA`/`creerBrouillonChoixIACV`, js/app.js).
**Décision de Denis** : la quasi-totalité de cet écran fait doublon avec "La mise en page" (aperçu
en direct, meilleure UX) - à retirer. Seuls 2 blocs gardent une vraie valeur (Profil : points
forts/mots clés, alimente la cohérence CV/lettre/entretien ; Stratégie : intitulés de poste à
rechercher, hors CV) - fonctionnement interne conservé, juste plus d'écran dédié pour l'instant.

- [x] K1. **FAIT (mode nuit, 2026-09-28/29), VÉRIFIÉ NAVIGATEUR, LES 2 CHEMINS.** Écran de relecture
      (9 onglets interactifs, `ouvrirRevoirPropositionsIA`/`ouvrirEcranChoixReponseIACV` pour "Mettre
      à jour"/"Reformuler", `ouvrirRelectureIACV(enPage=true)` pour "Créer un nouveau CV") remplacé
      par une synthèse en lecture seule + un bouton "Continuer" unique, sur les 2 chemins :
      - Nouvelle fonction partagée `_syntheseHtmlPropositionsIA(brouillon)` (`js/app.js`) : titre et
        accroche proposés, points forts, stratégie (type de CV), intitulés de poste à rechercher -
        une seule source de vérité, utilisée par les 2 écrans (jamais 2 textes qui divergent).
      - `contenuRectangleRelectureIA()`/`wireRectangleRelectureIA()` (écran en page, "Créer un nouveau
        CV") : simplifiés - un seul bouton à câbler, `_miseAJourBoutonValiderRelecture()` retirée
        (n'avait plus de sens sans rien à cocher).
      - `ouvrirEcranChoixReponseIACV()` (fenêtre modale, "Mettre à jour"/"Reformuler") : réécrite,
        n'appelle plus `genererEcranChoixReponseIACV`/`wireEcranChoixReponseIACV`.
      **Le contenu appliqué ne change pas** : `creerBrouillonChoixIACV()` met déjà `garder=true` par
      défaut sur toute proposition neuve - valider sans rien décocher donnait déjà exactement ce
      résultat. Seul l'écran de choix disparaît, jamais le mécanisme (points forts/mots clés et
      intitulés de poste continuent d'être générés et appliqués normalement).
      **Dette technique consciente, PAS résorbée ce soir** : `genererEcranChoixReponseIACV`,
      `wireEcranChoixReponseIACV` et `GROUPES_ONGLETS_CHOIX_IA_CV` (+ les fonctions `contenuOnglet*IA`
      qu'il référence) n'ont plus aucun appelant (vérifié par grep) - code mort, mais `wireOngletsValidationImport()`
      (fonction voisine, même famille) reste utilisé ailleurs (lettre/entretien, `genererEcranValidationImport`)
      donc jamais touché. Risque de supprimer sans avoir vérifié un par un chaque `contenuOnglet*IA`
      trop élevé pour une suppression en mode nuit sans supervision - à faire dans un passage dédié,
      jamais à la va-vite. Noté aussi dans `docs/BRIQUES_COMMUNES.md` si besoin de trace supplémentaire.
      Vérifié en direct (navigateur, les 2 chemins) : synthèse affichée, "Continuer" applique
      titreCV/profil et déverrouille la suite, modale se ferme correctement. `npm test` 1018/1018.
- [x] K2. Carte "En-tête de CV" créée (`modules/cv-pdf-html/cvPdfCartesMaquette.js`,
      `_htmlSecEnteteMiseEnPage`), positionnée entre "Organisation du CV" et "Expériences
      professionnelles" (décision explicite de Denis : "on commence par l'en-tête, après on a
      expérience, formation..."). Contient Titre du CV + Phrase d'accroche (+ case "Sans accroche"),
      déplacés depuis "Mise en page et texte" (bloc retiré de cette carte, plus de doublon). Icône
      neutre ajoutée (`_MEP_ICONES_CARTES.entete`, rectangle + 2 lignes, jamais un visage).
      **"Nom à la couleur du métier visé" (lectureGuidee) volontairement PAS déplacé** : vérifié
      piloté par les presets de modèle de la galerie (`cvPdfPanneauReglages.js`), pas un choix libre
      dans l'écran actuel - un contrôle manuel ici risquerait un conflit avec le style choisi, à
      traiter à part si besoin un jour.
- [x] K3. Bouton "Modifier ce texte" à côté du Titre et de l'Accroche : bascule le menu déroulant
      (propositions de l'assistant) vers un champ texte libre pré-rempli avec la proposition retenue,
      + lien "Choisir parmi les propositions" pour revenir au menu. Écrit sur les mêmes champs que le
      menu (`dossier.titreCV`/`dossier.ia.cv.profil`), aucun 2e circuit. État `_mepEditerTitreCV`/
      `_mepEditerAccrocheCV` (module-level, cvPdfCartesMaquette.js).
- [x] K4. Marges de la page : ajout de 6 mm (en plus de 8/10/14) - `_htmlSecTexteSimplifieeMiseEnPage`
      (segmented control) ET `_pdfLeviersEspaces().marge` (levier de l'optimisation automatique
      "Mise en page", `cvPdfPanneauReglages.js`) - les deux mis à jour, une seule liste `[6,8,10,14]`
      à chaque endroit.
- [x] K5. **FAIT (mode nuit, 2026-09-28/29), VÉRIFIÉ NAVIGATEUR.** "Style des compétences"
      (pastille/rectangle/texte) ajouté comme levier de l'optimisation automatique "Mise en page"
      (`_pdfLeviersEspaces().styleCompetences`, utilisé par `_pdfEssayerTasserEspaces`/
      `_pdfEssayerAererEspaces`, `cvPdfPanneauReglages.js`) - bascule vers "texte" (le plus compact)
      pour tasser, revient vers "pastille" pour aérer.
      **Point de vigilance résolu, PAS un bug** : `"texte-seul"` (champ canonique
      `dossier.reglagesMiseEnPageCV.styleCompetences`, panneau) et `"texte"` (convention interne
      `_cvPdfChoixMq`/`opts` côté PDF, presets de la galerie) sont deux noms pour le même réglage,
      reliés par un traducteur dédié et déjà testé
      (`modules/cv-mise-en-page/reglagesTraducteurs.js` ligne ~362, `tests/reglagesTraducteurPdf.test.js`
      "styleCompetences 'texte-seul' -> 'texte'") - aucun décalage réel, le levier utilise la
      convention interne (`"texte"`), cohérente avec le reste de `cvPdfPanneauReglages.js`.
      Vérifié en direct (navigateur, appel direct du levier dans l'iframe) : bascule pastille→texte
      puis retour texte→pastille, rendu réel confirmé (compétences affichées en texte simple séparé
      par des points, sans pastille). `npm test` 1018/1018.
- [x] K6. **FAIT (mode nuit, 2026-09-28/29), VÉRIFIÉ NAVIGATEUR.** Décision de Denis : plutôt que
      construire de nouveaux réglages taille/gras/italique, un pont vers le mécanisme déjà existant
      ("Régler l'en-tête", Aperçu à taille réelle, position libre, `ent.sty`/`ent.ech`/`styBl()`/
      `attrBl()`, `cvPdfTemplateMaquette.js` ~666-673 - gère déjà taille + gras + italique,
      indépendamment, pour nom/coordonnées/titre/accroche). Ajouté dans la carte "En-tête de CV"
      (`cvPdfCartesMaquette.js`, `_htmlSecEnteteMiseEnPage`) : une note + un bouton "Régler l'en-tête,
      dans l'Aperçu →", réutilisant `data-mep-versgrand` (déjà câblé, `js/app.js`) - ouvre l'Aperçu à
      taille réelle, aucun nouveau code de rendu.
      **Réserve "Photo et frise" (pas d'en-tête à régler, nom/coordonnées dans la colonne latérale)
      volontairement PAS traitée par une condition ici** : l'outil masque déjà lui-même son propre
      bouton "Régler l'en-tête" pour ce modèle précis (`cvPdfPleinEcranMaquette.js` ~239,
      `feuille.classList.contains('cv-photo')`) - dupliquer cette détection côté carte (lecture de
      l'iframe au moment du rendu, plus fragile) n'apportait rien : au pire la personne ouvre l'Aperçu
      et ne voit pas ce bouton précis, jamais une action qui échoue silencieusement.
      Vérifié en direct (navigateur) : note et bouton affichés sous "Sans accroche", clic ouvre bien
      l'Aperçu à taille réelle. `npm test` 1018/1018.
- [x] K7. **FAIT (mode nuit, 2026-09-28/29), VÉRIFIÉ NAVIGATEUR - REVU APRÈS RETOUR DE DENIS.**
      1er essai (raccourci "vers Vos informations" à chaque clic) jugé par Denis "régression majeure
      en termes de parcours" - naviguer vers l'écran complet des coordonnées à chaque fois, même pour
      changer une photo déjà là, est trop lourd. **Corrigé en réutilisant un mécanisme déjà existant
      mais orphelin** : `_htmlBlocPhotoMiseEnPage()`/`mepPhotoChanger`/`mepPhotoInput`/
      `mepPhotoInclure`/`mepPhotoRetirer` (`js/app.js` ~18561-19027) faisaient déjà exactement ce que
      Denis demande - navigue vers "Vos informations" SEULEMENT si aucune photo n'existe encore
      (repli, une fois) ; si une photo existe déjà, "Changer"/"Retirer"/"Inclure" agissent directement
      ici, sans quitter l'écran (upload direct, `ajouterPhotoAuDossier()` redimensionne déjà en carré
      400×400 et recadre au centre). Ce bloc vivait dans l'ancien niveau "Simple" (plus jamais rendu
      pour le PDF depuis la refonte "écran unique") - câblage JS resté posé sans rien à cibler.
      Lui redonner un affichage dans "En-tête de CV" (mêmes ids, mêmes classes `.btn-miss`/
      `.ligne-comp`) le réactive tel quel, sans écrire de nouvelle logique de câblage.
      **Question de Denis restée OUVERTE, pas traitée ce soir** : comment garantir que la photo
      importée est à la bonne taille, et pouvoir la repositionner ("il va falloir que je puisse la
      bouger") - le recadrage actuel (`ajouterPhotoAuDossier`) est automatique et centré, aucun
      contrôle manuel de position/zoom pour la personne. À concevoir séparément (voir section
      Passation en tête de ce cahier).
      **Bug réel trouvé et corrigé au passage, app-entière, pas seulement K6/K7** : le bouton "Régler
      l'en-tête" (K6) ouvrait le MAUVAIS écran - vérifié par Denis en direct (capture à l'appui) :
      l'ancien grand aperçu (`ouvrirGrandApercuPdf`, "Style au hasard/Modifier le texte/Pipette...",
      "plus utilisé nulle part" selon Denis) plutôt que l'écran actuel ("Régler l'en-tête/Retirer une
      rubrique ou une mission/Annuler le dernier retrait...", `ouvrirPleinEcranMaquette`). Cause :
      `data-mep-versgrand` (wiring générique, `js/app.js`) ciblait l'id `btnOuvrirGrandApercu`, qui
      **n'existe plus** - retombait donc TOUJOURS sur l'ancien écran en repli, jamais sur le bon
      aiguillage. Corrigé : cible désormais `btnMepOuvrirGrandApercu` (le vrai bouton actuel, déjà
      câblé, choisit lui-même le bon écran selon le modèle). **Corrige aussi les 2 usages
      pré-existants de `data-mep-versgrand`** ("Mise en page et texte", note "Réglages par rubrique")
      qui avaient le même défaut, invisibles jusqu'ici.
      **Mise en page revue** (retour Denis) : texte + bouton sur UNE SEULE ligne par action (jamais
      3 lignes empilées label/texte/bouton) - carte "En-tête de CV" nettement plus compacte.
      Vérifié en direct (navigateur) : clic sur "Régler l'en-tête" ouvre bien l'écran actuel
      (confirmé par capture identique à celle de Denis). `npm test` 1018/1018.
- [x] K8. **FAIT (mode nuit, 2026-09-28/29), VÉRIFIÉ NAVIGATEUR - PARTIELLEMENT.** Retour de Denis :
      "Style des missions" (Épurées/Condensées, déjà existant pour Expériences professionnelles ET
      Expérience personnelle) devrait aussi être un levier de l'optimisation automatique "Mise en
      page" - "un texte condensé prend nettement moins de place".
      **Bug réel trouvé et corrigé en cours de route** : le 1er essai (même mécanisme que K5/marge,
      `_pdfLireTheme`/`_pdfPoserTheme`) n'avait AUCUN effet visuel - vérifié en direct. Cause :
      `_pdfLireOptions()` lit `styleProfessionnel`/`stylePersonnel` depuis les `<select>` CACHÉS de
      l'iframe (`document.getElementById("regStyleProfessionnel"/"regStylePersonnel")`), jamais
      depuis `dossier.reglagesMiseEnPageCV` en direct pendant `_pdfRafraichir()`. Corrigé : le levier
      écrit sur le `<select>` caché (effet immédiat) ET sur `dossier.reglagesMiseEnPageCV`
      (persistance, canal normalement synchronisé par un clic réel sur le panneau) - les deux, jamais
      un seul.
      **`missionsPro` (Expériences professionnelles) : FAIT ET ACTIF** dans
      `_pdfEssayerTasserEspaces`/`_pdfEssayerAererEspaces` - vérifié en direct (navigateur, appel du
      levier + `_pdfRafraichir()`) : bascule épuré → "Surveillance ; Contrôle d'accès ; Rédaction de
      rapports." (condensé, avec points-virgules), undo confirmé.
      **`missionsPerso` (Expérience personnelle) : fonction écrite mais VOLONTAIREMENT PAS BRANCHÉE**
      dans les listes de leviers actifs - vérifié en direct : le `<select>` change bien de valeur mais
      **aucun effet visuel** sur le rendu "Expérience personnelle"/engagements. Cause confirmée par
      grep : `stylePersonnel` n'est référencé NULLE PART dans `cvPdfTemplateMaquette.js` (seulement
      dans l'ancien `cvPdfTemplateA4.js`) - le rendu de cette rubrique dans la galerie ne sait pas
      encore lire ce réglage. **Lié à la demande de Denis d'étendre Épuré/Condensé à Formations
      aussi + un choix de signe séparateur (point-virgule, rond, carré, triangle... au moins 5 à 10
      options) pour toutes les rubriques à missions** - regroupé comme UN SEUL chantier à traiter
      ensemble (reporté explicitement par Denis à la fin de la session, pas ce soir) :
      1. Étendre le rendu de "Expérience personnelle" dans `cvPdfTemplateMaquette.js` pour lire
         `stylePersonnel` (actuellement absent).
      2. Ajouter un réglage équivalent pour "Formations" (n'existe pas du tout aujourd'hui - ni champ
         canonique, ni UI, ni rendu).
      3. Un choix de signe séparateur en mode condensé (actuellement toujours point-virgule en dur,
         `cvPdfTemplateMaquette.js` ~324), configurable, sur les 3 rubriques.
      4. Une fois les 3 rendus prêts, brancher `missionsPerso` + les 2 nouveaux leviers Formations
         dans `_pdfEssayerTasserEspaces`/`_pdfEssayerAererEspaces`.
      **Autre correction en route** : bouton "Régler l'en-tête, dans l'Aperçu" (carte "En-tête de
      CV") re-signalé par Denis comme visuellement incohérent (lien texte souligné au lieu d'un vrai
      bouton bordé, malgré une consigne déjà donnée plus tôt ce soir) - corrigé, classe `.btn-miss`
      dans un conteneur `.ligne-comp`, comme "Modifier". `npm test` 1018/1018 à chaque étape.

### Rappel protocole (CLAUDE.md / TRAVAILLER_AVEC_DENIS.md)
Un commit par sous-étape, `npm test` (1018 verts attendus) + vérification navigateur à chaque
fois, jamais de `push`. Avant de reprendre CHAQUE sous-tâche : relire l'état réel des cases
cochées ICI + `git log` (pas la mémoire de conversation, qui peut avoir été compactée). Le Groupe
G est bloqué tant que Denis n'a pas donné un feu vert explicite ("vas-y", "je valide", etc.) - il
a dit "attends" plusieurs fois d'affilée sur ce point précis, ne pas présumer un feu vert implicite.
