# Corrections du parcours (retours de Denis, 2026-09-30)

Règle de travail fixée par Denis le 2026-09-30 : il donne les corrections, Claude les **note ici sans rien modifier**, puis corrige **uniquement au feu vert** de Denis. Mode C (effort `low`), à remonter en Mode A si une correction se révèle plus subtile que prévu.

Cases : `[ ]` noté, pas corrigé / `[x]` corrigé, testé, commité.

## C1. « Reformuler mon CV » : la fenêtre « Quelques passages à préciser » remet en cause une qualité correcte

- [x] **CORRIGÉ le 2026-09-30, feu vert de Denis pour l'option (a)** : comparaison tolérante mot par mot dans `pointsQualitesAbsentes`, test « Gestlon », `npm test` 1132 verts, fiche dans `docs/ERREURS_ET_BUGS.md`. Reste le test réel de Denis (rejouer Reformuler avec le CV de Josianne).
- **Constat de Denis** : après le 1er passage de l'assistant, la fenêtre pose la question « Gestion du temps ne figure pas dans votre CV. Voulez-vous la retirer ? ». Denis ne veut ni conserver ni encourager ce comportement.
- **Diagnostic (lecture du code, rien modifié)** : ce n'est pas l'assistant qui remet en cause, c'est l'application. La fonction `pointsQualitesAbsentes` (`data/incoherencesImport.js`, ligne 102, ajoutée le 2026-09-30, commit `6afbd84b`) compare chaque qualité renvoyée par l'assistant au texte du CV, mot pour mot. Le texte lu sur l'image contient « **Gestlon** du temps » (le « i » lu « l »). L'assistant a corrigé l'orthographe (ce que son prompt demande), donc « Gestion du temps » est introuvable dans le texte source, et l'application propose de la retirer. C'est un **faux positif**, voulu pour attraper une qualité inventée, mais qui attrape ici une simple correction de lecture.
- **Le prompt n'est pas en cause** : `savoirEtre` demande bien des qualités « que le CV cite explicitement », recopiées telles quelles.
- **Pistes de correction (à choisir au feu vert)** : (a) comparer avec tolérance à une ou deux lettres d'écart (« Gestlon » proche de « Gestion ») et ne rien demander dans ce cas ; (b) en plus, ne poser la question que si aucun mot du texte source n'est proche de la qualité ; (c) ne plus poser cette question du tout. À l'inscription du correctif : test dans `tests/incoherencesImport.test.js` avec « Gestlon du temps » et fiche dans `docs/ERREURS_ET_BUGS.md`.
- **Autre remarque du même écran** : la question 1 (« ssT » devient « SST ») est le comportement voulu, rien à changer.

## C2. « Vos informations » : toutes les rubriques doivent être ouvertes à l'arrivée

- [x] **CORRIGÉ le 2026-09-30, feu vert de Denis** : les cinq bandeaux sont posés ouverts à l'arrivée dans `js/app.js` (état initial de `pageProjet`), sans condition. Vérifié dans le navigateur : dossier vide, puis dossier avec Compléments et Expériences personnelles remplis, les cinq flèches sont ouvertes, aucune erreur dans la console. `npm test` 1132 verts.
- **Constat de Denis** : à l'arrivée sur la page « Vos informations », tous les bandeaux sont ouverts sauf « Ce que vous avez appris ailleurs qu'au travail » et « Compléments ». Denis veut **les cinq ouverts** à l'arrivée.
- **Diagnostic (lecture du code, rien modifié)** : `js/app.js` lignes 8129 à 8144. À la première ouverture, l'état d'ouverture est posé : Vous, Parcours et Expériences professionnelles toujours ouverts ; « Ce que vous avez appris ailleurs » et « Compléments » ouverts seulement **s'ils sont vides** (`compteur.complet === 0`), donc fermés dès qu'ils contiennent quelque chose (règle du retour de Denis du 2026-09-19, prévue pour qu'on ne rate pas un bandeau vide). Dans le CV de test, ils contiennent déjà des éléments (loisirs, certifications), d'où leur fermeture.
- **Correction prévue (à faire seulement au feu vert de Denis)** : mettre `'experiences-perso': true` et `'complements': true` dans cet état initial, et retirer les deux compteurs devenus inutiles. Test navigateur (Vos informations avec un dossier vide, puis avec un dossier rempli). Mettre à jour le commentaire du code et `docs/TACHES_VALIDEES.md` si la règle du 2026-09-19 y figure (grep à faire).

## C3. « Vos compétences » : « Vos savoirs » reste vide (« Aucune information pour le moment »)

- [ ] **Constat de Denis (capture du 2026-09-30)** : l'encart « Vos compétences » (CV de Josianne, assistante de vie aux familles) affiche 12 compétences : 6 savoir-faire (accompagnement des personnes âgées ou dépendantes, aide à la toilette et à l'habillage, aide aux repas, soutien dans les situations de perte d'autonomie, entretien du logement, service en salle), 6 savoir-être (Créativité, Rigueur, Organisation, Gestion du temps, Écoute, Bienveillance) et **0 savoir** : « Aucune information pour le moment ».
- **Question de Denis** : est-ce normal, pour cette personne et pour ce métier, qu'il n'y ait aucun savoir ? À examiner quand Denis dira d'aller voir. Rien n'est regardé ni modifié pour l'instant.

## C4. « La mise en page » : les suggestions doivent respecter le mode de présentation choisi (et le choix des expériences)

- [ ] **Constat de Denis** : quand il choisit comment présenter ses expériences professionnelles (par exemple « Par compétences » ou « Mixte ») puis clique sur « La mise en page », certaines **suggestions de mise en page le font repasser en mode chronologique**. Comportement jugé anormal.
- **Ce que veut Denis** : toutes les suggestions proposées à ce niveau doivent **rester dans le mode de présentation déjà choisi** (Par compétences reste Par compétences, Mixte reste Mixte). Aucune suggestion ne doit changer ce choix.
- **Question de Denis, à trancher avec lui** : faut-il appliquer la même règle au choix **« toutes les expériences » / « les plus pertinentes »** ? Son souhait : une fois ce choix fait, il reste, et la mise en page s'adapte à ces décisions au lieu de les modifier. Ma lecture de sa demande : oui, même principe, les suggestions ne modifient jamais un choix que la personne a déjà fait. À confirmer avec lui avant de coder.
- **Rien n'est regardé ni modifié pour l'instant** (règle de Denis du 2026-09-30 : on note, puis on va voir et on modifie seulement quand il le dit).
- **Confirmé par Denis le 2026-09-30** : le même principe vaut pour les **expériences affichées** (« toutes les expériences » / « les plus pertinentes »). Une suggestion de mise en page ne modifie jamais le mode de présentation ni le choix des expériences déjà faits par la personne : la mise en page s'adapte à ces choix. Plus de question ouverte sur C4, en attente de l'ordre d'aller voir puis de modifier.

## Suite de C3 et C4 : corrigés le 2026-09-30, feu vert de Denis

- [x] **C3 corrigé.** Cause trouvée : dans `obtenirSavoirs()` (`js/app.js`), les savoirs du métier visé n'étaient lus que si la personne avait déjà rempli le questionnaire ou déposé un CV analysé (`rienEteChoisi()`). Un CV reformulé sans questionnaire avait donc 0 savoir, même avec « Assistant de vie aux familles (ADVF) » comme poste visé (la fiche contient bien « Gestes de premiers secours » et « Manutention des personnes »). Le métier visé est maintenant lu dans tous les cas ; les métiers devinés exigent toujours un profil rempli. Deuxième défaut trouvé en route et corrigé : `metierParNom()` (`data/metiers.js`) ne retrouvait pas la forme féminine (« Assistante de vie aux familles » ne donnait aucune fiche). Il essaie maintenant le masculin si rien n'est trouvé tel quel. Tests : `tests/metierParNomFeminin.test.js`. Vérifié dans le navigateur (masculin, féminin, sans métier ni profil : liste vide comme avant). **Limite connue, non traitée** : le prompt `reformuler-cv.md` ne demande pas de savoirs à l'assistant, donc `savoirsCV` reste vide dans ce parcours ; seuls les savoirs de la fiche métier apparaissent (2 pour ADVF).
- [x] **C4 corrigé.** Cause trouvée : dans `modules/cv-pdf-html/cvPdfPanneauReglages.js`, la liste des suggestions contenait « Passer en présentation chronologique » quand le mode était Mixte ou Par compétences. Cette suggestion est retirée. Vérification : aucune autre suggestion ne change le mode de présentation, et aucune ne modifie le choix « toutes les expériences » / « les plus pertinentes » (`_cvPdfExperiencesTout` n'est jamais touché par une suggestion). Vérifié dans le navigateur : le texte de la suggestion a disparu du panneau, les autres suggestions sont intactes, la syntaxe du script est valide.

## C5. Menus déroulants « type de structure » : agrandir la zone de choix, partout pareil

- [ ] **Constat de Denis (2026-09-30)** : partout où il y a un menu déroulant pour choisir un **type de structure**, le rectangle du menu est plus petit que le bouton voisin et difficile à voir. Denis veut l'**agrandir**.
- **Voulu et général** : le comportement doit s'appliquer à **tous les parcours** où l'on renseigne un type de structure, et être **identique partout** (une seule apparence, jamais une version par écran). Rien n'est regardé ni modifié pour l'instant.

## C6. Bilan : le CV édité à la fin est mauvais (consignes et phrases qui n'ont rien à faire dans le CV)

- [ ] **Constat de Denis (2026-09-30, CV de Josianne BEKONO)** : il vient de faire le Bilan et d'éditer le CV à la fin. Rendu « vraiment pas terrible ». Il n'avait **pas complété les questions posées** pendant le Bilan et se demande si cela change quelque chose. Il a donné la capture du CV obtenu et la réponse complète de l'assistant (JSON : titres, accroches, points forts, recommandations, compétences, `regroupementExperiences`, `competencesGroupeesParTheme`, formations et certifications avec missions). Il précise : « les deux derniers, je ne sais même pas » (à clarifier avec lui : de quoi parle-t-il ?).
- **Défauts visibles sur la capture** (constat lu sur l'image, sans regarder le code) :
  1. Une **consigne de l'assistant apparaît dans le CV**, en gras, dans l'expérience « Entretien chez les particuliers » : « [À compléter avec les tâches réellement effectuées et, si elle en est connue, la fréquence ou le contexte des interventions.] ». Ce texte n'a rien à faire sur un CV.
  2. Le titre de l'expérience « Entretien chez les particuliers » est suivi d'une longue phrase en gras (« réalisation de l'entretien du domicile et adaptation de l'intervention aux besoins du particulier... ») qui ressemble à un morceau de consigne, pas à un intitulé.
  3. « Expression artistique » figure dans les compétences professionnelles, alors qu'elle ne correspond à aucune tâche d'un poste d'assistante de vie.
  4. La **certification SST est rangée sous « Formations »** (« Certification - SST »), sans rubrique Certifications séparée.
  5. L'**expérience personnelle** « Accompagnement de personnes âgées » s'affiche sans aucune mission alors que la réponse de l'assistant en fournit trois.
  6. Les expériences **« Coiffeuse - esthétique » et « Aide Cuisine - serveuse »** n'apparaissent pas dans le CV affiché (l'assistant les avait mises en `regroupementExperiences.groupes`) : à vérifier, une expérience ne doit pas disparaître sans que la personne le sache.
  7. Dans le texte que l'assistant a écrit avant le JSON, un parasite de citation « France Travail+1 » (probablement sans effet, mais à vérifier).
- **Question de Denis** : le fait de ne pas avoir répondu aux questions du Bilan change-t-il le rendu ? À examiner quand Denis dira d'aller voir.
- **Rien n'est regardé ni modifié pour l'instant** (règle de Denis : on note d'abord, on va voir et on modifie seulement sur son ordre).
- **Complément de Denis pour C6 (2026-09-30) : deuxième réponse de l'assistant, les « propositions » du Bilan.** Ce sont quatre propositions (`dem-munz5tva-3` à `-7`) pour renforcer le CV : « Service en salle », « Coiffeuse - esthétique », « Entretien chez les particuliers », le stage au CIAS de Beaumont, et une phrase sur l'écoute et la bienveillance. **Chacune contient dans son texte une consigne entre crochets** du type « [À compléter avec une donnée réelle : ...] » ou « [à compléter avec une situation réellement vécue ...] », suivie d'« actions concrètes » qui demandent de remplacer ce crochet. Trois d'entre elles portent `"action": "creer"`, deux `"pertinent": true`.
- **Rapprochement constaté (lecture de la capture et du texte, pas du code)** : la phrase en gras de l'expérience « Entretien chez les particuliers » du CV, y compris son crochet « [À compléter avec les tâches réellement effectuées et, si elle en est connue, ... ] », est **mot pour mot la proposition `dem-munz5tva-5`**. Le texte de la proposition, crochet compris, a donc été inséré tel quel dans le CV. Les propositions `-3` et `-4` (Service en salle, Coiffeuse) contiennent aussi un crochet : à vérifier si elles se sont retrouvées elles aussi dans le CV ou dans un autre document.
- **Question à examiner quand Denis dira d'aller voir** : un texte d'une proposition qui contient un crochet à compléter peut-il être ajouté au CV sans que la personne l'ait complété ? Et la personne (qui n'avait pas répondu aux questions) a-t-elle été prévenue qu'il restait des passages à compléter ? Rien n'est regardé ni modifié pour l'instant.

## C7. Analyse de candidature, « Recommandations pour le CV » : le bouton « Appliquer à ma lettre de motivation » ne fait rien

- [ ] **Constat de Denis (capture du 2026-09-30, carte « Plusieurs documents », recommandation sur le titre professionnel et la formulation de la lettre)** : le bouton **« Appliquer à ma lettre de motivation »** ne fait rien du tout. Denis pense qu'il devrait ouvrir l'écran de la lettre, avec la possibilité de la modifier (la proposition étant « Titulaire du Titre professionnel Assistante de vie aux familles obtenu en 2026, cette qualification marque une étape importante dans mon orientation vers l'accompagnement des personnes âgées. »).
- Rien n'est regardé ni modifié pour l'instant.

## C8. Analyse de candidature : « Corriger dans le Bilan » mène à une page bloquée, et le nom est mauvais

- [ ] **Constat de Denis** : le bouton **« Corriger dans le Bilan »** mène à une page où il « n'y a pas de continuité » : il faut **revalider le deuxième point (le CV)**, alors qu'il l'avait déjà validé et que le CV n'a pas changé. C'est un raccourci qu'il prend : il ne doit pas avoir à revalider une étape déjà faite pour continuer.
- **Nom à changer** : ce n'est pas un « Bilan » ici, c'est le module **« Analyse de candidature »** (le module a été présenté ainsi à la personne). Le bouton doit s'appeler **« Corriger dans l'analyse de candidature »**, et le même nom doit être repris partout où le module est rappelé sous le nom « Bilan » (à chercher dans tout le dépôt).
- **Autre remarque de la même capture** : le petit texte sous les boutons (« En allant sur le Bilan, vous quittez cette analyse. Pour revenir : Boîte à outils → Cohérence de mon dossier → Reprendre mon analyse... ») utilise lui aussi le mot « Bilan ».
- Rien n'est regardé ni modifié pour l'instant.

## C9. Retirer les rectangles « Garder comme repère » et « Vos documents relus avant l'analyse » (et question : partout ?)

- [ ] **Demande de Denis** : supprimer, sur cet écran, le rectangle **« Garder comme repère »** (« Conservez un point précis du rapport pour y revenir plus tard, seul ou avec votre conseiller. ») et le rectangle **« Vos documents relus avant l'analyse »**. Ils n'ont plus de valeur ajoutée : à une époque ils comblaient des vides dans la page, ce n'est plus nécessaire depuis les pages de présentation de chaque module.
- **Question de Denis, qui attend mon avis** : garder ces rectangles explicatifs partout, ou les enlever de partout ? Argument : chaque module a maintenant sa page de présentation, il y a déjà le module Repères et la page d'accueil qui expliquent le fonctionnement ; un troisième rappel dans chaque écran est peut-être de trop.
- **Avis provisoire de Claude (à confirmer après lecture du code, rien n'est regardé)** : retirer les rectangles qui ne sont **que de l'explication** (ils répètent la page de présentation), les retirer de partout pour que ce soit identique dans tous les modules ; **garder tout ce qui a une fonction** (un bouton, l'affichage des documents masqués, un accès). À vérifier avant de retirer : (a) que « Garder comme repère » n'est pas le seul accès à cette fonction (les boutons « Garder comme Repère » des cartes de recommandation restent, eux) ; (b) que « Vos documents relus avant l'analyse » ne donne pas un accès utile (par exemple voir ce qui a été masqué avant l'envoi), à conserver sous une autre forme si oui ; (c) règle « zéro régression » : toute fonction retirée est écrite dans `docs/TACHES_VALIDEES.md`, aucune ne disparaît sans décision.
- Rien n'est regardé ni modifié pour l'instant.

## Module « Les mots de votre CV (ATS) » : quatre corrections (retours de Denis, 2026-09-30)

## C10. Retirer tout le troisième point « Relire et masquer »

- [ ] **Constat de Denis** : la relecture et le masquage sont déjà faits à la fin du premier point. Le bouton « Revoir la relecture » ne fait que renvoyer au premier point pour remettre le CV : aucune plus-value, il prête à confusion. Denis veut retirer **toute la rubrique du troisième point** (« Relire et masquer »), pas seulement le bouton.
- **À vérifier au moment d'y aller** (zéro régression) : que le masquage des données personnelles (nom, coordonnées, photo) reste bien fait une fois, avant l'envoi à l'assistant, sans le troisième point ; que la barre d'étapes du module, les retours en arrière et l'aide contextuelle ne renvoient plus vers une étape supprimée ; que la numérotation des étapes suivantes reste juste.
- Rien n'est regardé ni modifié pour l'instant.

## C11. Écran « De retour : coller la réponse » : reprendre le bloc commun utilisé ailleurs

- [ ] **Constat de Denis (capture du 2026-09-30)** : au retour du premier passage (dépôt, envoi, retour de ChatGPT), l'écran « **De retour : coller la réponse** » du module est très différent de celui des autres parcours de l'application. Sur la capture : un titre, un texte « Vous revenez de ChatGPT. Sa réponse est dans votre presse-papiers... », les boutons « Coller la réponse » (bleu), « Coller manuellement » (petit, blanc), « Voir la démonstration (20 s) » (gris) et un bouton « Importer » (bleu) sous la démonstration ; barre d'étapes « Préparer, Envoyer, Résultat, Ma fiche ».
- **Ce que veut Denis** : **uniformiser**. Récupérer le **bloc commun** utilisé partout ailleurs pour ce moment du parcours et l'utiliser aussi dans ce module (une seule source de vérité, règle du projet). Pas de version propre au module.
- À faire au moment d'y aller : trouver ce bloc commun (grep sur tout le dépôt), vérifier ce que le module ATS fait de plus ou de moins, puis décider quelles fonctions du bouton « Importer » et de la démonstration sont à garder (zéro régression fonctionnelle). Rien n'est regardé ni modifié pour l'instant.

## C12. Fin du parcours : « Fiche copiée » ne dit ni où elle va, ni comment y accéder

- [ ] **Constat de Denis** : à la fin du parcours, l'écran « **Votre aide-mémoire, vocabulaire** » propose un rectangle où l'on choisit des compétences et où on peut les sauvegarder. Quand il clique sur **« copier la fiche »**, un message s'affiche mais il ne comprend pas **où la fiche est copiée, où elle va, comment y accéder**. C'est « vraiment pas très clair ». « Il va falloir regarder. »
- Rien n'est regardé ni modifié pour l'instant.

## C13. Fin du parcours : le bouton « Imprimer » imprime des pages vides

- [ ] **Constat de Denis** : à côté du bouton de copie, le bouton **« Imprimer »** imprime **des pages vides, vierges**, sans aucun contenu. Anomalie réelle à corriger (défaut de l'application, à inscrire aussi dans `docs/ERREURS_ET_BUGS.md` quand elle sera corrigée).
- Rien n'est regardé ni modifié pour l'instant.

## Lot 1 : fait le 2026-09-30 (feu vert de Denis)

- [x] **C6 (première partie)** `d988e844` : les passages « [À compléter...] » de l'assistant sont retirés avant toute écriture dans le CV (`modules/bilan-candidature/assistance/ecritureRelecture.js`), avec 3 tests. Reste de C6 (SST sous Formations, Expression artistique, expérience personnelle sans mission, expériences qui disparaissent) : lot 3.
- [x] **C7** `ea905fff` : « Appliquer à ma lettre de motivation » ouvre maintenant la lettre à jour, modifiable. Un clic ne peut plus rester sans réponse (message visible si la recommandation n'est plus retrouvée). Cause exacte du « rien ne se passe » non reproduite dans un état propre : le bouton écrivait bien, sans montrer la lettre.
- [x] **C8** `ea905fff` : bouton renommé « Corriger dans l'analyse de candidature » (et son texte de retour) ; le CV déjà déposé, relu et masqué est repris tel quel, le point 2 est « Relu et validé », plus de revalidation. Vérifié dans le navigateur.
- [x] **C9 (cet écran)** `1aaec640` : rectangles « Garder comme repère » et « Vos documents relus avant l'analyse » retirés de « Cohérence de mon dossier » (les boutons « Garder comme Repère » des cartes restent). **Reste** : les mêmes rectangles dans le rapport de l'analyse de candidature (`htmlBilanRapport`, `js/app.js`) et les autres modules : lot 2.
- [x] **C5** : les trois menus « Type de structure » (ciblage de l'analyse, version réduite, Cohérence) ont la classe commune `select-type-structure` (`css/style.css`), à la hauteur et à la taille de texte des boutons (38 px, 16 px).

## Lot 2 : fait le 2026-09-30 (feu vert de Denis) : module « Les mots de votre CV »

- [x] **C10** `a7ff3b8c` : le troisième point « Relire et masquer » est retiré (bloc, verrou, bouton « Revoir la relecture »). Le masquage reste fait une fois, au dépôt du CV (point 1) : le CV déposé est toujours marqué « relu ». Vérifié : l'écran Préparer n'a plus que deux points.
- [x] **C12** `a7ff3b8c` : le message dit maintenant où va la fiche : presse-papiers, rien d'enregistré dans l'application, à coller (Ctrl+V) dans un mail ou un document ; si la copie échoue, message d'erreur visible. **Écart avec ce qui était proposé** : pas de bouton « Mon Carnet », car le Carnet n'offre aucune façade d'ajout depuis un autre module et le geste d'ancrage vers Mes Repères ne garde qu'un libellé, pas la fiche. Idée possible plus tard : bouton « Enregistrer en fichier ».
- [x] **C13** `a7ff3b8c` : « Imprimer » imprime la fiche seule (cadre invisible) au lieu de la page de l'application, cause des pages blanches. Vérifié : le contenu du cadre est la fiche, l'impression est bien appelée. Elle peut être enregistrée en PDF depuis la fenêtre d'impression.
- [x] **C9, balayage** : les deux rectangles « Garder comme repère » et « Vos documents relus avant l'analyse » n'existaient que dans « Cohérence de mon dossier » (retirés au lot 1). Aucun autre écran de l'application ne les contient. Les autres blocs explicatifs éventuels : à signaler par Denis, écran par écran.

## Lot 3 : C11 fait le 2026-09-30

- [x] **C11** : l'écran « Coller la réponse » du module « Les mots de votre CV » utilise le même bloc que le Bilan (carte teintée, « Coller la réponse » / « Coller manuellement », puis Importer et Effacer et recoller). **Cause** de la différence : ce module appelait le composant partagé sans options, ce qui déclenche un ancien rendu de compatibilité ; quinze autres écrans sont dans le même cas (dette B.17 de `docs/BRIQUES_COMMUNES.md`, mise à jour). Vérifié dans le navigateur : boutons présents, collage manuel puis Importer mène au résultat, « Revenir coller la réponse » ramène à l'écran.

## Lot 3 : suite de C6 (2026-09-30)

- [x] **Cause principale trouvée et corrigée** `a95ede50` : pour une expérience **sans aucune mission**, l'extrait cité par l'assistant est le titre du poste ; la proposition (un texte de missions) venait alors **remplacer le titre** dans le CV (d'où la longue phrase en gras sous « Entretien chez les particuliers »). Elle part maintenant dans les missions de l'expérience (`orchestrationAssistance.js`). Le titre répété en tête de la proposition (« Entretien chez les particuliers : ... ») est retiré de la mission (`ecritureRelecture.js`). Avec le retrait des « [À compléter...] » (`d988e844`), les défauts 1 et 2 de C6 sont réglés. 4 tests ajoutés, `npm test` 1141.
- **Réponse à la question de Denis (ne pas avoir répondu aux questions du Bilan)** : oui, cela change le rendu. Sans réponses, l'assistant n'a aucune donnée concrète (durée, fréquence, situation vécue) et écrit des passages « [À compléter avec... ] » à la place, sans rien inventer. Ces passages sont maintenant retirés automatiquement du CV ; les répondre reste le seul moyen d'obtenir un texte plus précis.
- **Défaut 4 (SST sous « Formations »)** : c'est le comportement prévu du moteur du CV (les certifications retenues peuvent être présentées avec les formations, `moteurDecisionCV.js`, `cvPdfTemplateA4.js`). À décider par Denis : garder, ou toujours une rubrique « Certifications » à part.
- **Défaut 3 (« Expression artistique »)** : très probablement déduite par le questionnaire (l'action « Créer » donne « Créativité, Innovation, Expression artistique », `js/app.js` ~831), donc sans rapport avec le métier visé. À décider par Denis : ne plus afficher sur le CV les compétences déduites du questionnaire qui ne sont pas rattachées au métier visé (règle déjà appliquée aux savoirs, « défaut B »).
- **Défauts 5 et 6 (expérience personnelle sans mission, Coiffeuse et Aide cuisine absentes)** : non reproduits, non expliqués par la lecture du code. Il faut soit le fichier de session de Denis (icône disquette) au moment du CV, soit ses étapes exactes. Pas de correction sans cause prouvée.

## Décisions de Denis, 2026-09-30 (fin de séance) : C6, points 3 et 4

- **SST sous « Formations »** : décidé, **on laisse** (choix de présentation du moteur du CV, zéro régression).
- **« Expression artistique » dans les compétences professionnelles** : décidé, **on laisse**. Contexte donné par Denis : l'association loisirs vers compétences (danse, activités artistiques vers « Expression artistique », randonnée vers « médiation corporelle », etc.) est **voulue** : elle sert à valoriser des compétences simples. La règle R.6 du 2026-09-29 (avec un métier visé, une compétence tirée d'un loisir n'est gardée que si la fiche du métier la contient ou si la personne l'a déjà confirmée) fonctionne dans un dossier propre (vérifié dans le navigateur). Pourquoi elle n'a pas filtré dans le parcours du Bilan de Josianne : non établi (aucun métier enregistré à ce moment, ou compétence déjà présente dans le dossier). Pas de fichier de session disponible. **À rouvrir seulement si le cas revient** ; la personne peut retirer la compétence avec sa croix dans « Vos compétences ».
- **Défauts 5 et 6 de C6** (expérience personnelle sans mission, Coiffeuse et Aide cuisine absentes) : restent non expliqués, à rouvrir si le cas revient avec des étapes précises.

## C14. Module « Comparer mes pistes » : réponse illisible, barre de navigation, envoi et retour de l'assistant (retours de Denis, 2026-09-30)

Rien n'est regardé ni modifié pour l'instant. Cinq points, à traiter ensemble le moment venu (même module).

- [ ] **C14-a. Réponse de l'assistant illisible par l'application.** Denis a collé la réponse obtenue pour deux pistes (CAP plomberie, CAP électricité, territoire Dordogne). Elle contient des caractères qui la rendent illisible :
  1. des **barres obliques inverses** devant les tirets bas et les crochets (`en\_quoi\_ca\_consiste`, `\[`, `\]`), typiques d'un texte copié depuis un affichage mis en forme ;
  2. des **étiquettes de sources collées à la fin des textes** (« Onisep », « France Travail+1 », « Onisep+1 ») avec des espaces en trop, ajoutées par l'assistant dans les phrases ;
  3. des valeurs **« null » écrites comme du texte** (`"valeur": "null"`, `"unite": "null"`) au lieu de la valeur vide ;
  4. des chiffres écrits en texte (`"1868-1868"`, `"1064"` sans unité).
  À examiner : le parseur du module doit-il tolérer ces cas (nettoyage avant lecture, comme pour les parasites de lecture d'image), et le prompt doit-il interdire les étiquettes de sources dans les textes ? Le collage automatique évite-t-il le premier problème (barres obliques) ? Rien n'est établi.
- [ ] **C14-b. Barre de retour en double.** Le module a **sa propre barre « Retour » et « Continuer » sur la page du module**, en plus de la barre du bas de l'application. Denis veut **supprimer ce retour supplémentaire** : la barre du bas suffit.
- [ ] **C14-c. Le bouton « Retour » de la barre du bas renvoie à l'accueil** au lieu de la **page précédente**. À corriger : retour à l'écran d'avant. Et **« Continuer » doit aussi être dans la barre du bas** (pas dans la page).
- [ ] **C14-d. Bouton « Accueil » décentré.** Dans la barre de navigation du bas, « Accueil » n'est pas au milieu : plus à gauche qu'à droite. Denis demande de **vérifier si c'est le cas partout** dans l'application et de corriger pour que ce soit identique et centré partout.
- [ ] **C14-e. Envoi à l'assistant : reprendre le parcours commun.** Le prompt est affiché à l'écran : **Denis ne veut pas le voir**. Il veut le **même comportement que partout ailleurs** : un choix d'assistant (fenêtre de choix habituelle, vers ChatGPT, Perplexity et les autres), le prompt **copié automatiquement**, l'assistant s'ouvre. **Particularité de ce module** : mettre **Perplexity** en avant comme assistant recommandé (il peut y faire son compte). Puis, au retour, **la même étape « coller la réponse » que le reste de l'application** (aujourd'hui une fenêtre « très à part »). Lien avec la dette B.17 de `docs/BRIQUES_COMMUNES.md` (Comparer mes pistes est parmi les écrans encore à l'ancien rendu du collage) et avec la règle « une seule source de vérité ».

## C15. Module « Comparer mes pistes » : boutons agrandis et rectangles ouverts (retour de Denis, 2026-09-30)

Rien n'est regardé ni modifié pour l'instant. À traiter avec C14 (même module).

- [ ] **C15-a. Boutons beaucoup plus grands.** Dans le reste de l'application, les boutons ont été agrandis ; ce module a été **oublié**. Denis veut **tout agrandir partout dans ce module** pour que ce soit bien visible, à la même taille que dans le reste de l'application.
- [ ] **C15-b. Tous les rectangles ouverts à l'arrivée**, y compris les rectangles **facultatifs**. **Seule exception : le rectangle à l'ampoule** (l'information indicative) : il peut rester **fermé** quand la personne n'a aucune piste précise, puisque ce n'est qu'à titre indicatif. (Même principe que la page « Vos informations » : tout ouvert à l'arrivée, corrigé en C2.)

## C16. Module « Comparer mes pistes » : le rectangle « Voici comment on va regarder vos pistes » (retour de Denis, 2026-09-30)

Rien n'est regardé ni modifié pour l'instant. À traiter avec C14 et C15 (même module).

- [ ] **Constat de Denis** : le rectangle « Voici comment on va regarder vos pistes » est une bonne idée, mais la phrase **« Pas d'accord avec ce découpage »** n'est pas claire : « quel découpage ? ». Il faut rendre cette partie **plus grande et plus claire**.
- **Ce que veut Denis** :
  1. **Enlever** la phrase « Pas d'accord avec ce découpage ».
  2. La remplacer par une formulation du type **« Voici comment on vous propose de regarder »**.
  3. Y présenter les **critères** retenus. Il y en a **deux aujourd'hui**. **Si possible en ajouter d'autres.**
  4. Envisager aussi **un choix « tous les critères » / regarder l'ensemble ensemble** (la formulation exacte de Denis : « je ne peux pas avoir un critère tout... comme ça on regarde ensemble, ça peut être aussi très bien »).
- **Points à trancher avec Denis le moment venu (Mode A, décision de contenu)** : quels critères supplémentaires proposer (ils doivent rester des critères que le prompt du module sait traiter), si l'option « tous les critères » remplace la sélection ou s'ajoute à elle, et si la personne peut encore refuser le découpage proposé (la phrase retirée en était la porte de sortie : à remplacer par un vrai bouton « Modifier », pas un lien texte, règle du projet).

## C17. Le bouton « Retour » de la barre du bas n'a pas un comportement normal (retour de Denis, 2026-09-30)

- [ ] **Constat de Denis** : le bouton « Retour » n'a pas, actuellement, un comportement normal. Attendu : revenir à **la page précédente** (l'écran d'où l'on vient), pas à l'accueil ni à une page fixe.
- **Ce que l'audit du code montre déjà (sans conclusion générale)** : le composant partagé `barreNavigation()` (`js/app.js` ~4383) envoie « Retour » vers une **destination fixée par la page** (`naviguerVers(<page>)`), ou vers une action propre à chaque module (`options.onclickPrecedent`). Il n'y a donc pas de vraie « page précédente » commune. Cas connu de « Comparer mes pistes » : le « Retour » de la barre du bas renvoie à la présentation puis à l'accueil (correctif de boucle infinie du 2026-09-09) ; le module sait pourtant revenir à l'écran précédent (traité dans C14-c, en cours).
- **À examiner avec Denis, module par module (Mode A)** : où le comportement lui paraît anormal (quels parcours, d'où vers où), avant de décider s'il faut une règle commune (historique de navigation) ou des retours corrects écran par écran. Ne pas toucher au composant commun sans cette liste : risque de régression sur toutes les pages, et de retrouver la boucle infinie de septembre.
- Rien d'autre n'est modifié pour C17 à ce stade.

## Lot A « Comparer mes pistes » : fait le 2026-09-30 (feu vert de Denis), plan dans `docs/CHANTIER_COMPARER_PISTES_2026-09-30.md`

- [x] **A1 / C14-a** `ce6146bf` : les quatre analyseurs du module passent d'abord par la lecture stricte d'avant, puis, si elle échoue, par le lecteur tolérant partagé (antislashs parasites, guillemets courbes, retours à la ligne). Les étiquettes de sources en fin de phrase (« Onisep », « France Travail+1 ») sont retirées des textes de la collecte. Consigne ajoutée à `prompts/comparer-collecte.md`. 4 tests (extrait fidèle de la vraie réponse de Denis), `npm test` 1145.
- [x] **A2 / C14-b et C14-c** `06756c73` : plus de ligne « Retour / Continuer » dans la page. « Retour » (barre du bas) revient à l'écran précédent du module ; depuis le premier écran, il mène toujours à la présentation. « Continuer » est dans la barre du bas, grisé tant que l'écran n'est pas complet. Vérifié : 4 vers 6 (routage), retour 6 vers 3, aucun « Continuer » à l'écran 8.
- [x] **A3 / C14-d** `d344aaaf` : « Accueil » est au centre exact de la barre du bas sur **toutes** les pages (`css/style.css`, trois colonnes). Vérifié sur 4 configurations de boutons. Sur téléphone, un libellé de « Continuer » très long peut encore le décaler (il ne tient pas autrement).
- [x] **A4 / C15-a** `230aa27e` : boutons du module à la taille du reste de l'application (principaux : 46 px, texte 16,8 px ; secondaires : 40 px, texte 15,2 px ; avant : environ 31 px).
- [x] **A5 / C15-b** : tous les rectangles ouverts à l'arrivée, sauf « Et si je n'avais aucune piste précise ? » (ampoule). Vérifié écran par écran. Le rectangle « Se renseigner sur ce point » (aussi une ampoule) est ouvert : à corriger si Denis le veut fermé.
- **C17, précision de Denis** : sur « Comparer mes pistes », le « Retour » menait à la page de présentation du module quel que soit l'écran. Corrigé pour tous les écrans sauf le premier. À trancher avec Denis : depuis le premier écran, « Retour » doit-il aller à la présentation (comportement actuel) ou plus loin ?

## C17, suite : « Retour » du premier écran de « Comparer mes pistes » (2026-09-30)

- [x] **Règle de Denis** : le bouton « Retour » doit **toujours** amener à la page précédente, jamais à la page de présentation du module.
- [x] **Fait pour « Comparer mes pistes »** : l'application mémorise la page d'où la personne arrive sur la présentation (`_pageOrigineAvantAideDecision`, `naviguerVers()` dans `js/app.js`, même patron que `_pageOrigineAvantProjet`). Depuis le premier écran du module, « Retour » y ramène. Le détour « Revoir la présentation » ne remplace pas cette origine. Repli si l'origine est inconnue (après une restauration) : la présentation, comme avant. Vérifié : départ du Lexique, arrivée sur la présentation, entrée dans le module, « Retour » ramène au Lexique.
- [ ] **Reste ouvert (général)** : l'application n'a pas d'historique de navigation commun ; chaque page a sa propre logique de « Retour ». Appliquer la règle « toujours la page précédente » à tous les modules demande une décision de conception (Mode A) et la liste des parcours où Denis constate le défaut. Non commencé.

## C18. « Comparer mes pistes », premier écran : titre du premier point, trois façons repliées, une icône à changer (retour de Denis, 2026-09-30)

Rien n'est regardé ni modifié pour l'instant (règle : on note d'abord, on corrige au feu vert).

- [ ] **C18-a. Texte du premier point à agrandir.** La phrase « Au moins une façon... » et sa consigne « cliquer sur une ligne pour ouvrir » doivent être **nettement plus grandes**.
- [ ] **C18-b. Les trois rubriques « Je raconte », « Je nomme mes pistes », « J'ajoute un texte » : repliées à l'arrivée**, c'est la personne qui les déplie en cliquant. **Attention** : elles ont été ouvertes par C15-b (« tout ouvert ») ; ce nouveau retour les remet **fermées**, ce sont trois façons parmi lesquelles la personne choisit.
- [ ] **C18-c. Deux présentations selon l'état** pour ces trois rubriques : **fermée = fond bleu clair**, **ouverte = fond blanc**.
- [ ] **C18-d. Une icône à remplacer.** Denis parle de « l'icône avec les yeux » sur ce premier écran : à identifier au moment de corriger. La règle du projet interdit toute icône avec un visage ou des yeux : à remplacer par un objet ou un symbole concret.

## C18 : fait le 2026-09-30 (feu vert de Denis)

- [x] **C18-a** : la consigne « Au moins une façon. Cliquez sur une ligne pour l'ouvrir. » passe à 20,8 px en gras (classe `cp-consigne-facons`). Avant : petite ligne grise.
- [x] **C18-b** : « Je raconte », « Je nomme mes pistes » et « J'ajoute un texte » sont repliées à l'arrivée. Le premier point reste ouvert.
- [x] **C18-c** : fermée = fond bleu clair (`--accent-bg-subtle`), ouverte = fond blanc (`--bg-card`, suit le mode sombre). Titres des trois rubriques agrandis. Mesuré dans le navigateur.
- [x] **C18-d** : l'icône « avec les yeux » n'a pas pu être identifiée avec certitude (aucun émoji de visage dans le module). Le seul candidat plausible de cet écran, la bulle de discussion avec ses trois points de « Je raconte » (elle peut évoquer un visage), est remplacée par un microphone (dictée à la voix). **À confirmer par Denis** ; s'il s'agissait d'une autre icône, il suffit de la nommer.

## C19. « Mon ordre » pour les formations (demande de Denis, 2026-09-30, impérative) : FAIT

- [x] **Demande** : pouvoir déplacer les formations à la main quand l'extraction ne les a pas mises dans le bon ordre, dans la mise en page du CV et dans le grand aperçu, comme pour les expériences professionnelles.
- [x] **Fait** (effort `high`) : (1) l'ordre est mémorisé par clé de formation (intitulé normalisé, la même clé que le choix des formations), sauvegardé, restauré et remis à zéro comme l'ordre des expériences (`cvPdfPanneauReglages.js`, `js/app.js`) ; (2) il est appliqué au rendu : les 4 dispositions de modèles, le Mini CV A5 (`cvPdfTemplateA4.js`, `cvPdfTemplateMaquette.js`, `cvPdfTemplateA5.js`) ; les corrections de texte du CV (`fd:0`, `fr:0`...) restent attachées à la formation d'origine, pas à la place ; (3) flèches ▲ ▼ sur chaque formation dans le grand aperçu, mode « Déplacer une expérience ou une formation » (`cvPdfPleinEcranMaquette.js`) ; (4) flèches ▲ ▼ sur chaque ligne de la carte « Formations » du panneau, et bouton « Remettre l'ordre automatique » quand un ordre personnel existe (`cvPdfCartesMaquette.js`, `js/app.js`).
- **Vérifications** : 6 tests (`tests/ordreFormationsMien.test.js`), `npm test` 1151 ; navigateur : ordre appliqué au CV, réinitialisation, flèches du grand aperçu (descendre la première, monter la dernière), lignes du panneau dans l'ordre choisi avec flèches désactivées aux extrémités ; **banc de non-régression sur les 24 modèles : le plan Word et le XML Word sont identiques avant / après pour les 24** ; le HTML du PDF ne change que de 352 octets par modèle (flèches cachées et étiquette), invisibles hors du mode « Déplacer ».
- **Limites** : pas de glisser-déposer (flèches uniquement, comme les expériences) ; l'ancien rendu des modèles « application » (hors modèles de la galerie) n'est pas concerné.

## C20. Mise en page du CV : déplacer à la souris, ordre des formations par critères, position des dates, refus visible d'un déplacement de rubrique (retours de Denis, 2026-09-30, « à traiter en priorité »)

Suite de C19 (flèches sur les formations). Denis abandonne les flèches pour le grand aperçu.

- [ ] **C20-a. Grand aperçu : déplacement LIBRE à la souris, plus de flèches.** Pour les expériences professionnelles, les formations, **et tout type d'élément** : expérience personnelle, engagements, etc. Et aussi **les missions à l'intérieur d'une rubrique** (missions d'une formation, missions d'une expérience personnelle ou d'un savoir-être personnel...) : la personne doit pouvoir les ranger dans l'ordre qu'elle veut. « Très important. »
- [ ] **C20-b. Panneau, carte « Formations » : plus de flèches ligne par ligne** (impraticable avec 9 formations : cela remplit la page). À la place, des **critères d'ordre**, comme la carte des expériences : **du plus récent au plus ancien**, **par pertinence**, **« Mon ordre »** (celui fait à la souris dans le grand aperçu). À voir aussi pour l'expérience personnelle.
- [ ] **C20-c. Position des dates pour les formations et l'expérience personnelle**, alignable comme pour les expériences professionnelles. **Règle voulue par Denis** : une option **toujours intégrée** : par défaut, **les expériences professionnelles donnent le sens des dates à toutes les autres rubriques** (case du type « les autres rubriques s'alignent sur les expériences »). Quand la personne **dissocie** cette case, **chaque rubrique** (formations, expérience personnelle...) a **sa propre position des dates**.
- [ ] **C20-d. Déplacement des rubriques (mode « Déplacer les rubriques ») : dysfonctionnement majeur.** Pour certaines rubriques, le déplacement aboutit à un **panneau intermédiaire bleu avec des lignes**, et **ça ne fonctionne pas** (peut-être parce que les titres sont trop grands). Denis exige : quand un déplacement n'est pas possible, le **rectangle devient rouge** (ou autre signal clair) pour dire que ça ne passe pas. Ce n'était pas le cas.
- [ ] **C20-e. Régression signalée : « j'ai perdu les flèches pour déplacer les expériences professionnelles dans l'aperçu ».** Vérifié le 2026-09-30 sur le modèle par défaut : les flèches des expériences s'affichent bien dans le mode « Déplacer expériences et formations ». **Non reproduit**, à revérifier sur le modèle et le mode qu'utilise Denis. Devient sans objet si les flèches sont remplacées par le déplacement libre (C20-a).
- **Retour de Denis sur C19** : les flèches de C19 (grand aperçu et panneau) sont **à remplacer** (C20-a et C20-b) ; l'ordre par clé de formation (`ordreFormationsMien`) reste utilisable comme « Mon ordre ».

## C20, lot 1 : fait le 2026-09-30 (feu vert de Denis, « comme tu recommandes »)

- [x] **C20-b (formations)** `a4b45459` : le panneau « Formations » n'a plus de flèches ligne par ligne ; un choix **Ordre** : du plus récent au plus ancien, du plus ancien au plus récent, du plus pertinent (ordre proposé, par défaut), **Mon ordre** (fait dans le grand aperçu). L'année de fin d'une période compte (« 2015 - 2017 » = 2017) ; sans année, en dernier ; à égalité, l'ordre habituel. Les corrections de texte restent attachées à la formation. 11 tests, vérifié dans le navigateur (CV et panneau). Un ordre personnel choisi avant ce critère reste appliqué.
- [ ] **C20-b (expérience personnelle)** : **pas encore fait**. Cause : les éléments de l'expérience personnelle sont parfois de simples textes (mode « Citer »), auxquels on ne peut pas attacher de position d'origine comme pour les formations ; les corrections de texte de cette rubrique sont rattachées à leur place dans la liste. À traiter avec C20-a (déplacement libre), qui aura la même difficulté.
- [x] **C20-d (refus visible)** : cause trouvée en reproduisant (simulation de 140 glissements sur un modèle à une colonne puis deux colonnes, aucune erreur, aucun échec silencieux : chaque refus affichait un message). Le défaut visible : l'emplacement « + à côté » refusé restait **bleu** avec un simple liseré rouge (le fond restait bleu sous la souris). Maintenant : emplacement **rouge** (bordure, fond, texte), aperçu de la rubrique tenue **rouge**, message d'aide en **rouge et en gras**, revenu à la normale après le dépôt. Vérifié : glisser « Langues » à côté de l'expérience (refus, « Cette ligne contient une rubrique avec missions ») : fond rgba(192,57,43,0.32), fantôme rouge. **Limite** : je n'ai pas pu reproduire un échec réel « sans aucun message » ; si le défaut de Denis est d'un autre type, il faut le modèle et le geste exacts.

## C20, lot 2 : fait le 2026-09-30 (feu vert de Denis) : déplacement libre à la souris

- [x] **C20-a** : les flèches ▲ ▼ du grand aperçu sont **remplacées** par une poignée ⠿ sur chaque **expérience**, chaque **formation** et chaque **mission** (d'une expérience, d'une formation ou d'une expérience personnelle). On la prend, on la dépose entre deux autres ; une ligne bleue montre où elle ira. Toujours à l'intérieur de son groupe (les missions d'un même élément ne passent pas dans un autre). Le bouton s'appelle « Déplacer expériences, formations et missions ». L'ordre des expériences et des formations réutilise « Mon ordre » (C19 / C20-b) ; **l'ordre des missions est un nouvel état** (`ordreMissions`, par élément, liste de textes de missions), sauvegardé, restauré et remis à zéro comme le reste ; chaque mission garde sa clé (retrait et correction de texte inchangés). Fichiers : `cvPdfPleinEcranMaquette.js`, `cvPdfTemplateA4.js` (`_pdfOrdonnerMissionsMien`), `cvPdfTemplateMaquette.js`, `cvPdfPanneauReglages.js`, `js/app.js`.
- **Vérifications** : 4 tests de plus (`npm test` 1160) ; navigateur : 6 poignées d'éléments et 6 poignées de missions sur le jeu de test, aucune flèche visible ; glisser la première expérience sous la dernière, la première formation sous la dernière, la première mission d'une expérience sous la dernière : l'ordre change, est mémorisé et suit dans le CV ; **banc de non-régression sur les 24 modèles : PDF, Word et XML identiques à l'état commité juste avant**.
- [ ] **Pas encore fait** : (1) l'ordre des **éléments** de l'expérience personnelle (seules leurs missions se déplacent) : ses éléments sont parfois de simples textes, la position d'origine ne peut pas y être attachée comme pour les formations ; (2) le critère d'ordre (plus récent, plus ancien, pertinence) pour l'expérience personnelle, même difficulté ; (3) un vrai test à la souris par Denis (les glissements ont été simulés par des événements du navigateur).

## C20, lot 3 : fait le 2026-09-30 (feu vert de Denis) : position des dates des formations et de l'expérience personnelle

- [x] **C20-c** : dans la carte « Expériences professionnelles », sous « Position des dates », une case **« Les formations et l'expérience personnelle suivent cette position »**, **cochée par défaut**. Cochée : dès que la personne choisit une position pour les expériences (à droite, sous, avant), les formations et l'expérience personnelle l'adoptent. **Décochée** : les cartes « Formations » et « Expérience personnelle » affichent chacune leur propre « Position des dates » (à droite, sous le titre, avant le titre, comme le modèle). Tant que la personne ne choisit rien, **rien ne change** (position d'origine du modèle).
- **Fait dans le rendu** : formations dans les 4 dispositions (colonnes standard, « Colonne et frise », frise, « Photo et frise ») et expérience personnelle (colonnes standard et frise ; dans « Colonne et frise » elle ne montre que des titres, sans dates). Le choix d'un centre en dessous du titre (`formLigne`) est respecté. État sauvegardé, restauré, remis à zéro avec la mise en page. Fichiers : `cvPdfPanneauReglages.js`, `cvPdfTemplateMaquette.js`, `cvPdfCartesMaquette.js`, `js/app.js`.
- **Vérifications** : 4 tests (`npm test` 1164) ; navigateur : par défaut inchangé ; expériences « sous » puis « avant » : les formations suivent ; dissociées : « à droite » propre aux formations ; expérience personnelle : à droite, sous, avant, comme le modèle ; les choix apparaissent dans les cartes quand la case est décochée ; **banc de non-régression sur les 24 modèles : PDF, Word et XML identiques à l'état précédent** (état par défaut).
- **Limites** : les positions n'ont pas été mesurées visuellement sur les 24 modèles un par un (seulement le modèle par défaut) ; le Mini CV A5 n'est pas concerné ; les dates des missions n'ont pas de position propre.
