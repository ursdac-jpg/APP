# Corrections "La mise en page" du CV : liste P1 à P12 (retour Denis, 2026-09-27)

Fiche de suivi vivante. **Mise à jour obligatoire à chaque tâche validée** (règle explicite de Denis, 2026-09-27 : anticiper une future compression de conversation, ne jamais perdre la trace de ce qui est fait/pas fait). Ne jamais reconstituer cette liste de mémoire sans relire ce fichier d'abord.

Origine : un retour massif de Denis (plusieurs captures d'écran + texte) listant 12 points numérotés P1 à P12 sur le panneau "La mise en page" du CV. **P2, P8 et P12 ont été perdus lors d'une compression de conversation** (2026-09-27, nuit), introuvables dans la transcription complète - **retrouvés le même soir** grâce à un ancien récapitulatif que Denis avait gardé de son côté (liste 1-12 légèrement décalée : son point 1, "écran PDF/Word encore présent", n'existe pas dans la liste P1-P12 - déjà résolu avant, d'où le décalage d'un cran pour la suite).

---

## État au 2026-09-27 (nuit)

| Point | État | Commit |
|---|---|---|
| P1 | ✅ Fait | `447dfdb` |
| P2 | ✅ Fait (police qui changeait toute seule) | `e34d04c` |
| P3 | ✅ Fait (devenu le chantier "Expérience personnelle", terminé) | voir `docs/CHANTIER_EXPERIENCE_PERSONNELLE_2026-09-27.md` |
| P4 | ✅ Fait | `a9c1529` |
| P5 | ✅ Fait | `8703539` |
| P6 | ✅ Fait | `447dfdb` |
| P7 | ✅ Fait | `447dfdb` |
| P8 | ✅ Vérifié en direct le 2026-09-28 - les 3 réglages fonctionnent ; un bug adjacent trouvé et corrigé au passage | `605426a` |
| P9 | ✅ Déjà couvert par la Phase 1 (mode Par compétences), vérifié le 2026-09-28 | `8c014ff` |
| P10 | ✅ Fait et testé en direct (2 colonnes forcées en Mixte, missions de formation développées par défaut, choix explicite toujours prioritaire) | `5763107` |
| P11 | ✅ Fait et testé en direct | `d6000fe` |
| P12 | ✅ Audit complet fait (PDF + Word) | - |
| Nouveau (2026-09-28) | ✅ Case "Afficher les missions de la formation" déplacée + bouton "Modifier" (titre/missions) + "Cacher sur le CV" (Formations et Expérience personnelle) | `81f1bca` |
| Nouveau (2026-09-28) | ✅ Rubriques qui débordent une colonne (PDF+Word) : maquette validée par Denis (Proposition B) et codée - Formations/Expérience personnelle/Certifications/Centres d'intérêt partent en pleine largeur si l'écart entre colonnes dépasse ~56px | `108757b` |

---

## Contenu exact de chaque point (retrouvé mot pour mot dans la transcription, jamais reformulé)

### P1 - FAIT (`447dfdb`)
Consigne de Denis : *"il faut le corriger et le rendre cohérent avec ce qu'on fait réellement aujourd'hui dans l'application, donc je veux tes reco pour que je puisse décider, analyse tes reco et donne moi la meilleure solution."*
Résolu : "Éditer mon CV" (module ATS) ouvrait l'ancienne fenêtre "Atelier CV" avec son propre choix Word/PDF périmé. Redirige désormais vers l'écran unique "La mise en page", seul point d'entrée partout ailleurs dans l'app.

### P2 - FAIT (`e34d04c`)
Retrouvé via l'ancien récapitulatif de Denis : *"Police qui change avec 'Style aléatoire'."*
Résolu : 3 sources de tirage aléatoire de police supprimées (PDF Standard, 19 recettes Créatif PDF, 9 modèles Créatif Word). La police reste toujours celle déjà en place, seule la personne la change via son propre sélecteur.

### P3 - EN COURS
Consigne de Denis : *"je confirme c'est à faire ensemble pour que tu puisses avancer pendant la nuit."*
Devenu le chantier complet "Expérience personnelle" (nouvelle rubrique CV combinant savoir-faire personnel et engagements). Voir `docs/CHANTIER_EXPERIENCE_PERSONNELLE_2026-09-27.md` pour l'état détaillé - phases 1 et 2 faites, reste la carte de réglages à coder.

### P4 - FAIT (`a9c1529`)
Consigne de Denis : *"à vérifier et à corriger, ce point je pense que tu peux le faire seul en autonomie."*
Résolu : les suggestions de mise en page ne se prévisualisaient pas avant "Appliquer". Choisir une suggestion l'applique désormais tout de suite en aperçu, directement visible sur le CV ; fermer sans appliquer annule l'aperçu.

### P5 - FAIT (`8703539`)
Boutons "Style aléatoire" / "Mise en page" pas assez visibles (se confondaient avec les cartes d'information neutres). Fond plein couleur d'accent, comme les autres boutons primaires de l'app.

### P6 - FAIT (`447dfdb`)
Consigne de Denis : *"à corriger impérativement, le bouton mise en page est une reco pour le modèle qu'on avait lorsqu'on a cliqué sur la mise en page, donc si on change de modèle ou si on tire au hasard, ces reco ne sont plus valables."*
Résolu : le message "Ce que Mise en page a fait" et les suggestions restaient affichés après un tirage au hasard, un choix dans la galerie de modèles, ou un changement d'allure - alors qu'ils décrivaient le modèle d'AVANT ce changement. Effacés dans ces 3 cas désormais.

### P7 - FAIT (`447dfdb`)
Consigne de Denis : *"impérative à vérifier et à corriger, je pense que c'est une tâche que tu pourrais faire en autonomie."*
Bug confirmé : bascule Standard/Personnaliser dans "Organisation du CV" changeait la mise en forme sans action explicite (écrasait "Compétences en haut"/"Formations avant" à un défaut figé à chaque clic). Corrigé.

### P8 - VÉRIFIÉ ET RÉSOLU (`605426a`)
Retrouvé via l'ancien récapitulatif de Denis : *"Options 'Mode de présentation' / 'Expériences à afficher' / 'parenthèses' sans effet réel → confirmé."*

**Audit réel fait le 2026-09-28** (navigateur, clics réels sur les vrais boutons - pas seulement en console) sur les 3 réglages nommés :
- **Mode de présentation** (Chronologique/Mixte) : fonctionne, `COMPÉTENCES EN ACTION` apparaît bien en mode Mixte. Probablement déjà résolu par la refonte "Mode de présentation" de la nuit précédente (commit `8c014ff`).
- **Expériences à afficher** (toutes/pertinentes) + case à cocher par expérience : fonctionne, une expérience décochée disparaît bien du CV.
- **Indiquer l'expérience entre parenthèses** : fonctionne, `(ABC Services)`/`(Capsport)` apparaissent bien à côté des missions en mode Mixte.

**Bug réel trouvé et corrigé au passage** (pas nommément dans P8, mais découvert en testant le même groupe de réglages) : le bouton "−" du compteur "Missions par expérience" ne faisait rien au premier clic dès qu'une expérience avait moins de missions que le réglage global (4 par défaut) - cause : `_pdfDefinirMissionsExperience` recalculait sa base sans connaître le plafond déjà appliqué à l'affichage. Corrigé (`605426a`), vérifié en direct (1 clic = 1 mission de moins, immédiatement).

### P9 - PAS FAIT
Consigne de Denis (texte intégral retrouvé) : *"pour ce point tu dois récupérer les missions qui sont normalement source et base d'une compétence pro et l'afficher dans la rubrique 'Compétences pro' à la place des simples mots, donc il faut garder que les propositions (les missions de ces expériences) les plus pertinentes avec le poste visé et/ou avec l'expérience vécue et aucun doublon - cette démarche on s'assure qu'on ne va pas avoir des doublons des missions et des compétences en double pour des missions/expériences similaires. Sur un regard, on voit directement les missions qui ont permis à la personne d'acquérir les compétences pro, en premier lecture, en haut dans le corps du CV, et par la suite voir la régularité des expériences pro. C'est bien pour un public fragile qui a des petites missions et l'importance de montrer qu'il a toujours travaillé et qu'il n'y a pas de pauses sans travailler, et surtout les compétences qu'il a acquises grâce aux missions qu'il a accomplies dans le cadre de ces expériences (évidemment qu'en activant l'option de mettre les expériences entre parenthèses, elles seront indiquées)."*

**Vérifié en direct le 2026-09-28, confirmé déjà couvert par la Phase 1** ("Par compétences", commit `8c014ff`) :
- "Compétences pro" affiche bien les missions au lieu des simples mots, classées par pertinence, sans doublon (`composeurComposition.js`, mode dégradé de `competencesGroupees`).
- "Voir la régularité des expériences pro" : `EXPÉRIENCE PROFESSIONNELLE` reste affichée en dessous, compactée (poste - entreprise, lieu : dates), sans redondance avec les missions déjà montrées plus haut.
- "L'option de mettre les expériences entre parenthèses" (`data-mep-src-exp`) : testée spécifiquement en mode "Par compétences" (pas seulement Mixte) - fonctionne, `(ABC Services)`/`(Capsport)` apparaissent bien à côté de chaque mission.

**Aucun code supplémentaire nécessaire pour ce point.**

### P10 - PAS FAIT
Consigne de Denis (texte intégral retrouvé) : *"les expériences en mode mixte ont un énorme espace vide, donc je pense qu'il est plus important de mettre plus de missions ou développer d'autres missions dans le cadre de leurs formations/certifications/savoir-faire perso ou même loisirs que de laisser autant d'espace libre. Donc je veux que les compétences soient identifiées mais seront toujours sur deux colonnes, pour rentabiliser l'espace et le grand vide que laisse cette rubrique."*

**Décisions de Denis obtenues le 2026-09-28** (répondu directement en conversation) :
- (a) "Compétences professionnelles"/"Compétences en action" toujours sur 2 colonnes en mode Mixte : *"non c'est pas modifiable, toujours sur 2 colonnes"* - jamais un réglage pour la personne, toujours forcé.
- (b) Quelle(s) rubrique(s) développer en priorité pour combler le vide : Denis a demandé ma reco (*"quels sont tes reco ?"*), j'ai recommandé Formations et Expérience personnelle en priorité (déjà toute l'infrastructure missions/curseur en place), en écartant explicitement Certifications (simples chaînes de texte, rendu artificiel si développé) et Loisirs (mécanisme "loisir retenu" volontairement rare). Denis a répondu : *"Ma recommandation pour P10-2 : je valide tes reco !"*

**Fait et testé en direct le 2026-09-28** (`5763107`) :
1. "Compétences professionnelles" et "Compétences en action" toujours sur 2 colonnes en mode Mixte (classe CSS `themes-2col`/`pills-2col`, jamais un choix de la personne).
2. "Afficher les missions de la formation" passe en tri-état : jamais touché = suit le mode (actif par défaut en Mixte, pour combler le vide), choix explicite de la personne = prioritaire dans tous les modes. Expérience personnelle : déjà sans plafond par défaut, aucun code nécessaire.

Vérifié : passage en Mixte active les 2 colonnes et les missions de formation sans y toucher ; un choix explicite reste actif après un aller-retour de mode ; retour en Chronologique désactive tout (untouched).

### P11 - PAS FAIT
Consigne de Denis (texte intégral retrouvé) : *"il n'y a pas besoin d'une maquette pour cela, ces rectangles on peut les bouger librement dans le panneau 'aperçu' donc, il faut seulement déterminer qui sera sur le 1er plan, 2e plan et 3e plan, le but c'est de pouvoir poser rectangle sur rectangle mais sans cacher le texte d'un des rectangles. Donc c'est une correction toute simple à faire en autonomie. Que je clique sur un rectangle, actuellement j'ai déjà des options, il faut rajouter seulement quel est le plan, 1er, 2e ou 3e, savoir quel rectangle va cacher l'espace vide de l'autre, pouvoir les mettre les uns sur les autres sans pour autant perdre le texte."*

**Fait et testé en direct le 2026-09-28** (`d6000fe`). Le panneau de réglages d'un rectangle (plein écran de la maquette, `cvPdfPleinEcranMaquette.js`) a désormais 3 boutons "Plan 1/2/3" : le z-index de chaque rectangle de compétences (`cvPdfTemplateMaquette.js`), auparavant figé en dur (b1=1, b2=2, b3=3), se choisit maintenant librement. Vérifié : sélectionner "3" applique `z-index:3` sur le vrai style DOM, "Remettre" revient au rang par défaut.

### P12 - Audit fait le 2026-09-28 (première passe)
Retrouvé via l'ancien récapitulatif de Denis : *"Demande d'audit complet PDF/Word avec hypothèses sur la cause (conflit 2 comptes, contamination Word→PDF, ou jamais fait)."*

**Méthode** : clics réels sur les vrais boutons/curseurs du panneau (jamais seulement une manipulation de variable en console), CV rempli avec des données couvrant chaque rubrique (formations avec centre/lieu/missions, langues, certifications, logiciels, loisirs, expérience personnelle, engagements).

**Contrôles testés et confirmés fonctionnels** (carte par carte) :
- **Organisation du CV** : Deux colonnes (classe `corps deux` appliquée correctement).
- **Expériences professionnelles** : Position des dates (droite/sous/avant - les 3 fonctionnent), Style du lieu (normal/italique/gris - vérifié sur la classe CSS réelle), compteur "Missions par expérience" (corrigé cette nuit, voir P8).
- **Formations** : "Afficher les missions de la formation", espacement entre les formations (curseur, valeur réellement appliquée en `margin-bottom`).
- **Éléments supplémentaires** : compteur de compétences professionnelles à afficher (+/-, réduit réellement le nombre affiché sur le CV).
- **Expérience personnelle** (carte neuve de cette nuit) : déjà testée en détail lors de sa construction.

**Deuxième passe faite le 2026-09-28 (soir), carte "Format" + volet Word** :
- **Carte "Format"** : les 5 tuiles (A4 détaillé/complet/essentiel, Mini A5 portrait/paysage) changent bien `dossier.reglagesMiseEnPageCV.format` et se répercutent sur l'aperçu PDF.
- **Volet Word** : découverte importante sur l'architecture avant de conclure - `exporterCvWord()` (`modules/cv-word/wordExport.js`, chantier "le CV en Word repris depuis le PDF") **extrait le Word directement du même rendu que l'aperçu PDF** (`dossier.pdfReglages`), via une page cachée puis `WordExtracteur`/`WordPaquet`. Conséquence testée et confirmée : **tous les réglages construits ce soir (mode Mixte/"Compétences en action", "Modifier" titre+missions Formations et Expérience personnelle, "Cacher sur le CV") se retrouvent déjà correctement dans le vrai fichier .docx généré, sans aucun code supplémentaire** - vérifié en générant un vrai `.docx` (via `exporterCvWord` + `JSZip`) et en cherchant le texte modifié dans `word/document.xml`. Une fausse alerte a été corrigée en cours de route : un premier essai avait donné un résultat "manquant" à cause d'un test à cheval sur deux rechargements de page (état perdu entre-temps), pas d'un vrai défaut - refait proprement dans une seule session, confirmé bon.
- **Limite trouvée sur le Mini CV A5 en Word** : la taille de page du `.docx` généré par `exporterCvWord` reste au format A4 même quand "Mini CV A5" est choisi (au lieu de s'adapter). Ceci correspond à une limite **déjà identifiée et suivie séparément** (`docs/CHANTIER_WORD_A5_DEPUIS_PDF_2026-09-27.md` §7, `docs/ETAT_DES_CHANTIERS.md` ligne 28/39) - pas une découverte nouvelle, pas retouché ici (chantier à part, avec ses propres jalons).
- **"Trait entre les deux colonnes"** (Réglages avancés) : la case écrit bien `dossier.reglagesMiseEnPageCV.separateurColonnes = true` au clic - l'effet visuel exact n'a pas pu être revérifié dans cette session (le mode 2 colonnes ne s'est pas activé comme attendu pendant le test), point mineur à revérifier si Denis retombe dessus.

**Conclusion finale P12** : aucune "contamination Word→PDF" ni trace d'un conflit 2 comptes trouvée - tout fonctionne comme attendu, à l'exception du bug P8 (compteur de missions, déjà corrigé). Le point important découvert ce soir n'est pas un bug mais une confirmation positive : l'architecture "Word extrait du PDF" (chantier séparé, 2026-09-26/27) tient sa promesse - chaque nouveau réglage PDF profite au Word automatiquement, sans double maintenance. Seule limite réelle : le Mini CV A5 en Word, déjà connue et suivie ailleurs.

### Nouveau point (2026-09-28) - Rubriques qui débordent une colonne (PDF + Word)
Consigne de Denis (capture d'écran à l'appui) : *"Quand je choisi 2 colonnes et que j'ai les compétences perso développé, alors cette rubrique sera toujours dans la colonne de droite ! Comment faire pour m'assurer que si jamais je ne peux pas avoir deux rubrique sur la même ligne, alors soit il part sur une nouvelle ligne en s'alignant avec les autres en partant de la droite [...] et ceci est une règle générale qui s'applique pour l'ensemble des options et sur Word et PDF."*

**Audit du code réel fait le 2026-09-28** (`cvPdfTemplateMaquette.js`, `exportDocxNatifCV.js`) : aucun mécanisme de recalcul dynamique n'existe, ni en PDF ni en Word - chaque rubrique a une colonne fixée à l'avance (gabarit ou ordre personnalisé), jamais recalculée selon sa hauteur réelle. Côté Word en particulier, la mise en page se fait par un tableau à largeurs fixes ; c'est Word (sur le poste de la personne) qui pagine réellement à l'ouverture - on ne peut pas mesurer une hauteur avant qu'elle existe, donc un vrai "bascule à la ligne si ça ne rentre pas" identique au PDF **n'est pas faisable côté Word**.

**Précision trouvée en préparant la maquette** : `exporterCvWord()` recopie la position réelle de chaque mot du rendu PDF déjà affiché (mesurée au pixel près) - si le PDF mesure vraiment ses colonnes dans le navigateur et décide où recaser une rubrique, le Word hérite automatiquement de la même décision, sans code Word séparé. Un seul mécanisme à construire, pas deux.

**Maquette faite** : `docs/MAQUETTE_RUBRIQUES_DEBORDANTES_2026-09-28.html` (2 propositions - rejoint la colonne courte / pleine largeur en dessous). **Décision de Denis** : Proposition B (pleine largeur en dessous), + validation des 2 recommandations (rubriques éligibles : Formations, Expérience personnelle, Certifications, Centres d'intérêt ; seuil : 3 à 4 lignes d'écart).

**Codé et testé le 2026-09-28** (`108757b`) : `_pdfEquilibrerColonnes()` (cvPdfPanneauReglages.js) mesure réellement la hauteur des 2 colonnes après chaque rafraîchissement (même principe "injecter, mesurer, ajuster, re-injecter" que `_pdfRaccourcirAutomatiquement`, déjà existant pour le nombre de pages) ; si l'écart dépasse 56px (~3-4 lignes), la rubrique responsable dans la colonne la plus longue part en pleine largeur sous les 2 colonnes (`cvPdfTemplateMaquette.js`, classe `.corps-pleine-largeur`). S'applique à la disposition par défaut ET à "Organisation du CV > Personnaliser". Jamais un réglage pour la personne : recalculé à chaque rafraîchissement, jamais persisté. Limite mineure connue, non bloquante : si la rubrique évincée faisait partie d'une paire (2 rubriques côte à côte) en mode "Personnaliser", l'autre moitié de la paire peut laisser un espace vide à sa place - cas rare (nécessite une personnalisation manuelle ET un déséquilibre réel sur la rubrique en paire), pas rencontré dans les tests, à corriger si Denis retombe dessus.

**Portée** : le gabarit Standard et les variantes Sobre qui utilisent la disposition "2 colonnes" classique (corps deux). Les gabarits à mise en page distincte - Rectangles, Photo, Frise (et leurs versions Sobre) - ont leur propre code de colonnes, non touché dans ce passage : limite à connaître, pas un oubli.

### Nouveau point (2026-09-28) - Livré : espace vide Formations + bouton "Modifier" (`81f1bca`)
Deux retours de Denis pendant qu'il testait la carte Expérience personnelle en direct :
1. *"cela oblige a faire un passage de plus IA [...] On va les appeler ces boutons 'Afficher sur mon cv'"* : le bouton "Modifier dans Vos informations" (navigation) est remplacé par un bouton dans le panneau qui coche/décoche d'un coup toute une source (savoir-faire perso ou engagements). Affiné ensuite en vraie bascule *"Afficher sur mon CV" / "Cacher sur le CV"* (au lieu d'un libellé désactivé).
2. *"comment agencé et optimiser l'espace vide dans les formations ?"* : "Afficher les missions de la formation" déplacée dans l'espace vide sous "Formations à afficher".
3. *"peut-être me bouton qui me permettra de modifier les formations et les missions aussi"* : nouveau bouton "Modifier" par formation ET par expérience personnelle/engagement - titre + missions (une par ligne, ajout libre à la main). Écrit uniquement dans un réglage d'affichage du CV, jamais dans `dossier.formations`/`experiencesPerso`/`engagements` ("Vos informations" reste la seule source).

Testé en navigateur (titre et missions modifiés apparaissent sur le CV, source dossier intacte, bascule Afficher/Cacher vérifiée dans les 2 sens). `npm test` : 1018/1018.

---

## Vérification finale avant usage réel (2026-09-28, demande explicite de Denis : "je dois utiliser l'application aujourd'hui pour faire mon CV, il faut zéro bug")

**Méthode** : dossier de test complet et réaliste (3 expériences, 2 formations, expérience personnelle, engagement, langues, certifications, loisirs, logiciels), passage en revue de tout le parcours réel (clics sur les vrais boutons, jamais seulement une manipulation de variable en console) :

1. **Rendu initial** de "La mise en page" avec dossier complet : toutes les rubriques présentes, aucune erreur console.
2. **"Style rapide" (aléatoire) x 6** - stress test le plus large (couleurs, colonnes, gabarits mélangés au hasard) : aucune erreur, contenu toujours présent et complet après chaque tirage.
3. **"Organisation du CV > Personnaliser"** activé, avec une disposition personnalisée incluant une paire de rubriques côte à côte : aucune erreur, le nouveau correctif "pleine largeur" fonctionne aussi dans ce mode.
4. **Mode Mixte + "Modifier" une formation + correctif colonnes**, tous ensemble : aucune erreur, chaque fonctionnalité de la nuit reste correcte en présence des autres.
5. **"Revenir au modèle de départ"** (remise à zéro complète) : aucune erreur, rendu identique à l'état initial.
6. **Export réel "Télécharger le fichier Word"** (vrai clic sur le vrai bouton, pas la fonction interne) : téléchargement réussi, message de confirmation affiché, contenu vérifié correct (`.docx` réellement ouvert et lu via JSZip).
7. **Export réel "Enregistrer mon CV en PDF"** (vrai clic) : la fenêtre d'impression du navigateur s'ouvre bien (construction du contenu imprimable réussie, aucune erreur avant l'ouverture de cette fenêtre - la fenêtre elle-même est gérée par le système, hors de portée d'un test automatisé).
8. `npm test` : 1018/1018. `node scripts/checkLexique.js` : 0 erreur, 0 avertissement.

**2 erreurs console présentes, non liées à cette nuit** : une requête `modules/cv-editor/templates/composeur/composeur.json` (404) se produit à chaque export Word - fichier de gabarit qui n'existe pas pour le modèle "composeur" (id interne, jamais un vrai dossier de gabarit). N'empêche pas le téléchargement ni le contenu du fichier (vérifié). Présente avant les changements de cette nuit, pas une régression - à corriger un jour pour la propreté de la console, mais non bloquante pour l'usage réel.

**Conclusion** : aucun bug trouvé sur l'ensemble du parcours "La mise en page" testé ce soir, y compris en combinant toutes les fonctionnalités ajoutées cette nuit entre elles. Les deux exports (Word et PDF) fonctionnent de bout en bout avec le vrai bouton.

---

## Prochaine étape (mise à jour 2026-09-28, fin de soirée - CHANTIER CLOS)

**P1 à P12 tous faits et testés. Rien de bloquant ni en attente sur cette fiche.**

Récapitulatif complet de la nuit du 2026-09-27 au 28 :
- P1 à P9, P11 : faits (voir tableau en tête de fiche).
- Chantier "Expérience personnelle" (`docs/CHANTIER_EXPERIENCE_PERSONNELLE_2026-09-27.md`) : fait et testé.
- Chantier "Formations" (4e demande de Denis, même traitement) : fait et testé (`cfd4709`, `de5dc6b`).
- P10 (2 colonnes forcées en Mixte + missions de formation développées) : fait et testé (`5763107`).
- P12 (audit complet PDF + Word) : fait, conclusion positive.
- Retours de Denis en testant en direct : bouton "Modifier" (titre + missions) + "Afficher/Cacher sur le CV" (Formations et Expérience personnelle) : fait et testé (`81f1bca`).
- Rubriques qui débordent une colonne : maquette faite, Proposition B validée par Denis, codée et testée (`108757b`).
- **Vérification finale complète demandée par Denis avant usage réel** : faite, aucun bug trouvé (voir section juste au-dessus).

**Idée mise de côté pour plus tard** (à la demande de Denis) : bouton "Personnaliser" avec placement libre des rubriques (largeur/longueur/position) - voir `docs/IDEES_A_RECLASSER.md`, entrée du 2026-09-28. Pas un chantier en cours, pas de code écrit.

**Pour reprendre sur un autre poste (même compte)** : ce fichier + `docs/ETAT_DES_CHANTIERS.md` (section correspondante) suffisent à eux seuls, sans mémoire de session - tout l'historique, les décisions de Denis et l'état exact du code sont consignés ci-dessus.
