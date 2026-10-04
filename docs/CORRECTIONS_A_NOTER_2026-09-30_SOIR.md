# Corrections notées (2026-09-30), en attente du feu vert de Denis

Statut : **notées seulement**. Aucun code lu, aucun test navigateur, rien modifié, tant que Denis n'a pas dit d'aller voir puis donné le feu vert.

## N1. Nom et prénom inversés à la détection automatique (panneau « Vous » / « Vos informations »)
- Symptôme : quand nom et prénom sont pré-remplis à partir de l'adresse de courriel, ils sont inversés.
- Cause supposée : la règle (C, point 6 du 2026-09-30) devine l'ordre sans le savoir. Le courriel donne les deux mots, pas leur ordre.
- Décision de Denis : **ne pas retirer la règle, lui ajouter une deuxième couche**. Le courriel identifie les deux mots. Pour l'ordre, on regarde la casse dans le CV : **le nom est en majuscules, le prénom n'a que sa première lettre en majuscule**. Le mot en majuscules est le nom.
- Reste à décider avec Denis (si la casse ne tranche pas : tout en majuscules, tout en minuscules, un seul des deux mots retrouvé) : garder le message « à vérifier » et ne rien inverser d'office.

## N2. « Reformuler mon CV » : barre « Ces réglages me conviennent » au milieu, elle écrase « Accueil »
- Symptôme : sur certains écrans, la barre du bas est en plein milieu et recouvre le bouton « Accueil », qui doit rester à droite.
- À investiguer : quels écrans exactement (lié à `_barreAdopterBoutonEtape` du 2026-09-29 et au centrage d'« Accueil » du C14-d).

## N3. Reprise d'un parcours depuis l'accueil : « Continuer » mène à la fin du parcours
- Symptôme : depuis l'accueil, en reprenant le parcours Reformuler, la question « recommencer ou continuer ? » puis « Continuer » amène tout à la fin, pas là où la personne s'était arrêtée.
- Comportement attendu : reprendre à l'étape où elle en était. À investiguer : quelle étape est mémorisée et où elle est relue.

## N4. Extraction : données pas dans l'ordre chronologique
- Symptôme : les données extraites (expériences, formations, etc.) s'affichent mélangées.
- Règle de Denis : toujours extraites et affichées dans l'ordre chronologique, jamais mélangées.
- À préciser au test : quel ordre (plus récent en premier, comme un CV usuel ?) et quelles listes sont touchées.

## N5. Certifications rangées dans une expérience : poser la question
- Symptôme : des certifications sont affichées à l'intérieur d'une expérience professionnelle.
- Décision de Denis : c'est peut-être légitime (obtenues pendant cette expérience), donc ne pas trancher seul. **Poser la question impérativement** (même mécanisme que les questions sur incohérences d'import, `data/incoherencesImport.js`) : « Ces certifications ont-elles été obtenues pendant cette expérience ? »
- Et vérifier que chaque certification a son **année** ; sinon la demander.
- À prévoir : consigne dans les prompts d'extraction pour signaler le cas, plus la question côté application.

## N6. Parcours « formulaire » : le deuxième point (étape automatique) est-il à retirer ?
- Idée de Denis : ce point se fait tout seul depuis le premier, il n'apporte rien ; pour changer de CV on refait le premier. Avis de Claude : d'accord sous réserve de vérifier qu'il ne porte aucune fonction unique (relire, masquer la photo, corriger). Parcours et point exacts à préciser par Denis. Rien vérifié dans le code.

## N7. Objectif de la candidature : ajouter stage, alternance, immersion, formation (Mode A, à concevoir)
- Idée de Denis : dans le panneau « Candidature » / « Votre objectif », en plus d'un métier précis ou de plusieurs métiers d'un même domaine, proposer stage, alternance, stage d'immersion, formation.
- Points à trancher : la formation n'est pas une candidature d'emploi (prompts et libellés différents) ; plusieurs cibles à la fois (quelle cible lit chaque module) ; `stage`/`alternance`/`pmsmp` existent déjà et ne sont pas exploités (à auditer avant de dupliquer).

## N8. Reformuler mon CV : l'écran « Votre objectif » arrive trop tard, à remonter en début de parcours (Mode A)
- Idée de Denis : on ressaisit ce qu'on a déjà saisi. La motivation (candidature à un métier, stage, alternance, formation) doit être choisie au tout début. Sinon une personne qui vise une formation tombe sur « Choisissez votre métier ou domaine » et se perd.
- Lié à N7 : même choix, à poser une seule fois et à transmettre à tout le parcours.

## FAIT le 2026-09-30 (soir, effort medium), N1 à N6 (`npm test` 1170 verts)
- **N1** (`7cdd060a`) : l'ordre nom / prénom est lu par la casse (nom en majuscules) ; même casse = suggestion cliquable, rien de pré-rempli. Tests dans `tests/panneauCandidaturePartage.test.js`.
- **N2** (`1c93dff6`) : le bouton ajouté à la barre du bas (`_barreAdopterBoutonEtape`) remplace la place vide au lieu de s'y ajouter ; « Accueil » reste au centre (décision C14-d) et le bouton à droite. Mesuré dans le navigateur.
- **N3** (`1c93dff6`) : dans Reformuler, « Continuer » reprend à l'étape où la personne en était (`_reformulerEcranReprise`). **Non reproduit tel que décrit** : si ton cas est celui d'un CV DÉJÀ reformulé et passé en « Continuer vers un modèle », l'intro affiche seulement « Voir mon CV » (vers la page finale), sans Continuer ni Recommencer : à me décrire si c'était ça.
- **N4** (`modules/cv-core/dates.js`) : expériences et formations extraites toujours du plus récent au plus ancien (« en cours » en tête, sans date en dernier), à l'import et dans Reformuler.
- **N5** (`data/incoherencesImport.js`) : une certification citée dans une expérience déclenche la question « obtenue pendant cette expérience ? » avec l'année (réponse « Oui, 2022 » ou « Non, 2019 », appliquée à l'expérience et à la rubrique Certifications ; sans réponse exploitable, rien n'est modifié). Posée par le code, pas par le prompt. Limite : détecte les lignes qui sont une attestation connue ou commencent par certificat, certification, habilitation, attestation.
- **N6** : bloc « Relire, vérifier, corriger, masquer » retiré de la page « Préparer » (Reformuler, Mettre à jour, Lettre et entretien à partir d'un CV prêt) ; bouton « Relire à nouveau et masquer » et vidéo déplacés dans le bloc « Votre CV ». Les modules Co-construire ma lettre, Préparer l'entretien, Les mots de votre CV et le Bilan ont encore leur bloc de relecture : NON touchés (à confirmer par Denis).
- **N7 et N8** : pas commencés (mode A, maquette et décisions de Denis d'abord, voir `docs/AUDIT_OBJECTIF_ET_PREPARER_2026-09-30_SOIR.md`).

## FAIT la nuit du 2026-09-30 au 2026-10-01 (autonome, à la demande de Denis)
- **Retour = page d'avant** (`100962c8`, `778ae4d8`) : pile de navigation (`pileNavigation`, `retourPagePrecedente`, `js/app.js`) pour le renvoi par défaut vers l'Accueil ; **deux boucles réelles trouvées et corrigées** : Objectif / Vos informations / Votre parcours (la vraie origine de « Vos informations » était écrasée au retour), et les « Retour » précis qui sautent des pages (la pile se vide maintenant jusqu'à la page où l'on revient). Vérifié sur les parcours nouveau, prêt et Reformuler. **Les modules (Bilan, Cohérence, ATS, Regard recruteur, Repères, Carnet, Comprendre le cadre / les chiffres, Comparer, Co-lettre, Préparer l'entretien, Reformuler) ont chacun leur « Retour » écran par écran, déjà soigné (relu : aucune anomalie visible dans le code) ; je n'ai pas pu les parcourir un par un avec de vraies données.**
- **Disquette** (`ec7fcdb3`) : la progression dans « Vos documents » (`etatAccordeonParType` et `etatAccordeonValideParType`) n'était ni sauvegardée ni restaurée : après un import, la page repartait de la première étape. C'est l'hypothèse la plus probable du défaut « le CV ne marche pas après l'import », **à vérifier par Denis**; sinon il faudra le geste exact.
- **Mode sombre** des nouvelles cartes, boutons du type de stage et champs : contrastes mesurés, tous supérieurs à 4,9 (aucun défaut).
- **Textes d'aide** : les deux aides des cartes de situation parlent maintenant du stage de formation ou d'immersion et de la formation.
- **Fiche Lexique pour « Formation »** : inutile, la recherche de l'accueil trouve déjà « formation » (Comparer mes pistes, etc.).
- **NON fait, volontairement** : (1) migration des quatre écrans de « Comparer mes pistes » vers le choix d'assistant commun : chaque écran a son propre état dans un module de 3400 lignes sans test automatique, je ne peux pas le vérifier sans piloter toute l'interface avec de vraies pistes ; (2) ordre des éléments de l'expérience personnelle (C20-b) : touche le PDF, le Word et l'état du panneau, et exige la preuve « banc B.7 » (zéro régression) avec Word ; (3) décision de Denis sur le bloc de relecture du Bilan ; (4) cas C6 points 5 et 6 (il faut le fichier de session).

## FAIT (2026-10-01) : la disquette de Denis (`session-cv-2026-09-30-13-00.json`) REPRODUIT le défaut, corrigé
- **Cause réelle** : après l'import, « Vos documents » n'affichait que « Choisir ce qui ira sur le CV » et bloquait « La mise en page » (« Terminez d'abord l'étape… »). La validation de cette étape (`_relectureIAValideeParType`) n'était ni sauvegardée ni restaurée. Corrigé : sauvegardée dans la disquette (clé `accordeons.relectureValidee`), et pour une ancienne disquette qui ne la contient pas, déduite du même signal que `pageAssistant()` (le dossier contient déjà des choix de l'assistant). Vérifié avec son vrai fichier : « Reprendre exactement où j'en étais » et « Aller directement à l'aperçu » donnent accès à la mise en page, sans erreur.
- **Ce que ce fichier montre par ailleurs** : (1) nom et prénom inversés (« Nicolas » en nom, « Poirot » en prénom) = le défaut N1, corrigé depuis ; (2) expériences et formations non rangées par date = corrigé depuis pour l'import et Reformuler, pas pour cette ancienne disquette ; (3) cinq certifications sans année = la question est posée depuis ; (4) les expériences personnelles sont en mode « Citer seulement » (`expPersoModeAffichage: citer`, décision de Denis du 2026-09-29) : c'est pour cela que les trois missions proposées par l'assistant ne s'affichent pas ; (5) les expériences personnelles n'ont AUCUNE date : des critères « plus récent / plus ancien » ne serviraient à rien pour elles, seul « Mon ordre » (glisser-déposer) aurait un sens ; (6) Comparer mes pistes : `collecteErreur : « La réponse n'a pas pu être lue »` (la réponse collée n'a pas été lue, je n'ai pas le texte collé).
- **C6 points 5 et 6 (« Coiffeuse », « Aide cuisine »)** : ne sont PAS dans ce fichier (c'est le CV de Nicolas). Point 5 (expérience personnelle sans mission) s'explique par le mode « Citer seulement » (voir ci-dessus). Point 6 toujours sans fichier.
