# Plan de codage : étape « Vos missions et compétences » (14/11/2026)

**Statut : plan VALIDÉ par Denis le 14/11/2026 (six recommandations acceptées, consigne 299). Lot 0 en cours.** Mode recommandé pour le plan : A (décisions d'architecture), effort `high`. Les lots eux-mêmes passent ensuite en mode B (le quoi est tranché par la maquette et ce plan) ; chaque lot porte son étiquette d'effort.

Base : maquette validée (`docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html`), consignes 283 à 297, audit des trois voies (`docs/AUDIT_TROIS_VOIES_ET_ETAPE_MISSIONS_2026-11-14.md`), cahier du prompt (`docs/CAHIER_NOUVEAU_PROMPT_MISSIONS_COMPETENCES_2026-11-14.md`). Audit complémentaire fait le 14/11/2026 sur le code réel (points marqués « vérifié » ci-dessous).

## 0. Les parcours voulus par Denis (14/11/2026, consigne 299)

- **Sans assistant** : l'étape (fiches du ROME, modifiables) est la seule référence de la personne.
- **Avec assistant, deux chemins** : (a) la personne choisit ses missions et compétences dans l'étape et les envoie à l'assistant : nouveau prompt ; (b) comme aujourd'hui, sans aucun changement (`cv.md` intact). Règle proposée : des choix faits dans l'étape donnent le chemin (a), l'étape passée donne le chemin (b). Aucune question de plus à la personne.
- **Nouveau prompt (chemin a)** : tient compte des doublons ; ne remplace JAMAIS les choix de la personne, qui restent visibles ; met en évidence ses compléments, que la personne ajoute ou non ; raccourcit un peu les rares phrases longues. Ses compléments arrivent sur l'écran de choix existant, à cocher.

## 1. Ce que l'audit du code réel montre

**Simple (reprise de l'existant), vérifié**
- Les missions d'une expérience s'écrivent dans `dossier.experiences[i].missions` (texte, une mission par ligne). Le moteur de CV les lit déjà.
- Les compétences ont déjà leurs trois champs plats et leurs fonctions d'écriture : `competencesCV` (savoir-faire ET savoir-être), `savoirEtreCV`, `savoirsCV`, avec `ajouterSavoirFaireCV`, `ajouterSavoirEtreCV`, `ajouterSavoirCV` et leurs `retirer…` (`js/app.js` lignes 3515 à 3545). Le CV et le CV sans assistant les lisent. Aucun format à inventer pour la sortie.
- Les phrases à cocher existent (`mi` pour les missions, `k` pour les activités plus précises, 1 917 fiches), testées. Les compétences courtes (savoir-faire, savoir-être, savoirs) sont dans la base des métiers `baseMetiers` (data/metiers.js) : les fiches écrites à la main d'abord (135), puis les 1 790 fiches générées du ROME ; 1 920 des 1 923 fiches du ROME y ont une entrée (mesuré le 14/11/2026, lot 1).
- Le métier visé est déjà dans le dossier : `dossier.metierCible` (une chaîne), sinon `dossier.secteurCible`. La civilité est déjà dans `dossier.identite.civilite`.
- La recherche de fiche par intitulé existe (`preparerRepertoirePourExperience`, `ficheDeIntituleChoisi`, `chargerRepertoireElargi`, `chargerFicheRome`) ; le prototype de rapprochement par mots a été mesuré sur les 13 843 intitulés du ROME.

**Risqué**
1. **Deux sources de missions quand l'assistant en ligne a répondu (vérifié).** `modules/cv-core/moteurDecisionCV.js` (lignes 797 à 838) : si la réponse de l'assistant contient des missions pour une expérience, elles REMPLACENT toujours le texte du dossier. Une mission cochée par la personne dans la nouvelle étape serait donc écrasée. À corriger dans le moteur (testable en Node).
2. **Les expériences n'ont pas d'identifiant (vérifié, commentaire `js/app.js` ligne 89 à 94).** Le rapprochement se fait par poste et entreprise. Si la personne renomme une expérience après l'étape, le lien avec ses choix peut se perdre. Remède proposé : un identifiant d'étape stable posé sur chaque expérience (à vérifier au lot 1 qu'il ne gêne ni l'import ni la normalisation).
3. **Compétences plates, sans lien avec l'expérience.** La maquette garde le lien (source sous chaque pastille) ; le CV, lui, n'a que des listes. Il faut donc un état propre à l'étape (voir décision 1) et ne retirer du CV que ce que l'étape y a ajouté, jamais une compétence ajoutée ailleurs.
4. **Appariement poste vers fiche.** Mesuré : fiable pour les métiers reconnus (0,85 à 1,00), bruyant pour les intitulés vagues (« Petits boulots », « Aide aux devoirs »). Aucune présélection sous le seuil. Seuils à régler sur des cas réels (décision 5).
5. **Chargement des fiches.** Un fichier par lettre, à la demande (K : 1,44 Mo). Hors réseau ou échec : l'étape reste utilisable en saisie libre, avec un message simple.
6. **Longueur des listes sur téléphone** (tout afficher d'un coup, consigne 285) : à mesurer à chaque lot d'écran.
7. **`js/app.js` (environ 43 000 lignes) et `modules/*/ui.js` ne sont pas chargés par les tests Node** : test navigateur obligatoire sur ordinateur, téléphone et mode sombre à chaque lot d'écran. Pour limiter le risque, la logique va dans un module séparé et testable ; seule la plomberie (routes, barre d'étapes) touche `app.js` et `data/metiers.js`.
8. **Civilité et prompt** : la civilité existe mais je n'ai PAS tracé qu'elle arrive dans le texte envoyé à l'assistant. À vérifier au lot du prompt.

**Bloquant pour ouvrir au public (pas pour coder)** : la relecture des 10 197 missions par Denis (l'échantillon de 100 phrases est prêt). Le module reste donc derrière un interrupteur fermé, comme les autres (`MC_OUVERT = false`), jusqu'aux essais réels de Denis.

## 2. Décisions demandées à Denis (avec recommandation)

1. **Où ranger les choix de la personne.**
   - **A. Un état propre à l'étape + écriture dans les champs existants du CV (recommandé)** : l'étape garde en mémoire, par expérience, la fiche, les missions et compétences cochées (ce que la maquette montre), puis écrit le résultat dans `experiences[i].missions`, `competencesCV`, `savoirEtreCV`, `savoirsCV`. Bénéfice : la maquette est reproduite fidèlement, rien ne change pour le CV ni les autres modules. Risque : un champ nouveau à garder cohérent (suivi de ce que l'étape a ajouté).
   - B. Listes globales seulement : plus simple, mais on perd la source sous chaque pastille et la réouverture fidèle de l'étape.
   - C. Fusion dans les listes de « Votre parcours » : écartée (ce sont des identifiants de catalogue, pas des phrases libres).
2. **Où vont les activités plus précises sur le CV.** Recommandation : dans la liste des compétences, après les autres, non comptées dans le « 8 à 12 », avec un essai visuel sur un vrai CV au lot 3. Risque : phrases longues dans un bloc fait pour des mots courts ; si cela encombre, repli possible vers « sous les missions ». À trancher sur épreuve, pas à l'aveugle.
3. **Priorité quand l'assistant a répondu.** Recommandation : les missions choisies par la personne dans l'étape ne sont jamais remplacées par la réponse de l'assistant. Bénéfice : la personne garde la main (cohérent avec « rien ne s'ajoute sans votre clic »). Risque : une expérience pour laquelle l'assistant aurait mieux écrit garde le choix de la personne ; elle peut toujours décocher pour revenir à la proposition de l'assistant.
4. **Par où commencer.** Recommandation : la création sans assistant d'abord (cœur du parcours, aucune double source), puis le moteur avec assistant, puis les deux voies de reprise. Alternative : la voie 1 (petite surface), mais elle dépend de la double source.
5. **Cas réels pour régler les seuils.** Recommandation : 15 à 20 intitulés de postes réels vus avec le public (dont des vagues et atypiques), fournis par Denis, pour fixer 0,75 et 0,5 ensemble avant le lot 2.
6. **Interrupteur fermé jusqu'aux essais** : recommandé (même habitude que les autres modules).

## 3. Les lots (un commit par lot, `npm test` vert, navigateur à chaque lot d'écran)

**Lot 0 `[effort : bas]`** Préparation : dossier `modules/missions-competences/`, interrupteur `MC_OUVERT` à `false`, entrée dans le cahier d'état. Aucun effet visible.

**Lot 1 `[effort : haut]`** Brique pure, testée en Node, sans écran : à partir des fiches d'un poste, produire missions à cocher, compétences (savoir-faire, savoir-être, savoirs, activités précises), fusion sans doublon entre expériences (ordre : métier visé, partagées entre au moins deux expériences, reste), bilan du métier visé (couvertes, hors expériences, activités précises), comptage de l'onglet « Métier visé », et dérivation vers le dossier (missions en lignes, listes de compétences) avec suivi de ce que l'étape a ajouté. Inclut l'identifiant d'étape des expériences. Tests : fusion, doublons, retrait sans toucher aux ajouts extérieurs, expériences renommées.

**Lot 2 `[effort : haut]`** Recherche de la fiche d'un poste : le rapprochement mesuré en prototype, mis dans le module, avec les trois niveaux (fiche trouvée et présélectionnée, liste de 5 fiches avec priorité aux secteurs des autres expériences, aucun secteur affirmé avec les 21 secteurs). Seuils réglés avec les cas réels de Denis. Testé en Node sur le répertoire réel.

**Lot 3 `[effort : haut]` FAIT le 14/11/2026 en trois sous-lots (3a plomberie, 3b missions, 3c compétences et « Métier visé »), interrupteur fermé ; limites connues : la fiche reconnue (niveau A) n’est pas recalculée si l’intitulé du poste change plus tard (bouton « Ce n’est pas le bon métier ? »), le niveau D ne propose pas encore de secteurs, les expériences personnelles ne sont pas couvertes.**  Écran de création : nouvelle étape entre « Votre parcours » et « Votre profil » (listes d'étapes, deux fonctions d'index et de route, table des routes, liste de la barre de progression, « Continuer » et « Retour », gardes anti-boucle, libellé de suite), derrière l'interrupteur. Écran conforme à la maquette : missions, compétences en liste unique avec filtre, onglets sur deux lignes, onglet « Métier visé » et son bilan, aperçu du CV, « Passer cette étape ». Chargement des fiches à la demande avec repli en saisie libre. Test navigateur ordinateur, téléphone et mode sombre ; essai visuel des activités précises sur un vrai CV (décision 2).

**Lot 4 `[effort : haut]` PARTIELLEMENT FAIT le 14/11/2026 : les choix de la personne ne sont plus remplacés (brouillon de l’assistant, js/app.js `creerBrouillonChoixIACV`), chemin (a)/(b) et fusion dans la brique, tests `tests/missionsCompetencesAssistant.test.js`. Constat : l’écran de choix de l’assistant a été retiré le 31/10/2026 (propositions appliquées dès l’import, synthèse en lecture seule), donc les compléments décochés ne sont montrés nulle part : emplacement tranché par Denis (« Dans La mise en page », consigne 307) et CODÉ le 14/11/2026 : bloc « Propositions de l’assistant en plus » (cvPdfCartesMaquette.js, js/app.js, fonctions de l’aperçu dans cvPdfPanneauReglages.js). Le moteur `moteurDecisionCV.js` n’a pas eu besoin de changer.** CV avec l'assistant : le moteur ne remplace plus les missions choisies par la personne (décision 3), test Node dans `tests/moteurDecisionCV.test.js`, puis essai bout en bout (création avec assistant, aperçu et Word). Ajout (consigne 299) : le choix du chemin (a) ou (b) selon que la personne a fait des choix dans l'étape ; sur l'écran de choix de l'assistant, les choix de la personne restent visibles et cochés, et les compléments de l'assistant sont présentés à part, en évidence, à cocher.

**Lot 5 `[effort : moyen]` FAIT le 14/11/2026 (bouton dans le formulaire de l'expérience, consigne 311)** Voie 1 de la reprise (« Corriger mon CV ») : bouton « Compléter avec la fiche du métier » sur chaque carte d'expérience, visible seulement si une fiche proche est trouvée (consigne 284), missions déjà présentes cochées en haut. Voie 2 : rien (« sans rien y ajouter »).

**Lot 6 `[effort : moyen]` FAIT le 14/11/2026 (consigne 312)** Voie 3 (« Le refaire moi-même ») : même bouton sur la page de vérification, avec une seule fonction de conversion entre la liste de textes de cette voie et le texte à lignes du dossier.

**Lot 7 `[effort : haut]` (FAIT le 14/11/2026 sous la forme d'un bloc ajouté, consigne 313 ; restent les essais réels et l'écran des compléments)** Nouveau prompt dédié (jamais `cv.md`) : doublons, accord homme/femme avec la civilité (après vérification qu'elle arrive au prompt), vérification d'écriture, propositions pour un métier sans fiche (sur l'écran de choix existant). Mode A, essais réels de Denis, rien ne remplace l'existant. Contrat (consigne 299) : l'assistant reçoit les choix de la personne et ne les réécrit pas ; il renvoie seulement les doublons repérés, les compléments à proposer (séparés des choix) et d'éventuelles formulations plus courtes proposées à côté, jamais à la place.

**Lot 8 `[effort : moyen]` (FAIT le 14/11/2026 pour les 119 phrases au-dessus de 25 mots, consigne 314 ; reste la relecture de Denis et, au choix, les phrases de 21 à 25 mots)** Phrases trop longues : piste à choisir avec Denis, jamais de coupure mécanique. Fait nouveau (consigne 299) : sans assistant, personne ne peut raccourcir à la demande ; la réécriture EN AMONT dans les données (comme `phrasesCorrigees.json`) devient donc la piste recommandée, au moins pour les phrases les plus longues (409 missions et 629 activités au-dessus de 20 mots), l'assistant ne faisant que proposer des versions plus courtes à côté sur le chemin (a). Avantage : même résultat avec ou sans assistant. Coût : un travail de relecture des phrases concernées, à faire par lots avec l'œil de Denis.

**Lot 9 `[effort : moyen]`** (FAIT le 15/11/2026, consigne 315 ; reste la ligne « Nouveautés » à l’ouverture) Finitions : recherche (barre d'accueil et Lexique, au fil de l'eau dès le lot 3), pages de présentation et vidéos qui parlent de « six étapes » (à relire), `docs/BRIQUES_COMMUNES.md`, `docs/LECONS_A_NE_PAS_REPRODUIRE.md`, `docs/ETAT_DES_CHANTIERS.md`, ligne du journal des changements. La ligne « Nouveautés » seulement à l'ouverture au public, sur le signal de Denis après ses essais.

## 4. Ordre et dépendances

Lot 0, puis 1, puis 2 (testables sans écran, donc peu risqués), puis 3 (premier écran réel), 4, 5, 6, 7, 8, 9. Les lots 1 et 2 sont indépendants et peuvent se faire dans l'ordre que Denis préfère ; le lot 3 dépend des deux ; le lot 4 dépend du lot 3 ; les lots 5 et 6 dépendent des lots 3 et 4 ; le lot 7 peut démarrer après le lot 3.

## 5. Ce qui est dit franchement

- Aucun point technique ne rend le projet impossible. Le plus délicat est la double source de missions (lot 4) et le lien avec l'expérience (identifiant d'étape).
- Le lot 3 est gros (nouvel écran, plomberie des étapes touchant `app.js` et `data/metiers.js`) : il se fera en plusieurs sous-commits, jamais dans un état à moitié refondu.
- Le comportement exact sur téléphone et le rendu des activités précises sur le CV ne se jugent qu'à l'essai.

## 6. Lot 2 : règles proposées pour la recherche de fiche (14/11/2026, mesure sur 41 intitulés, en attente de l'accord de Denis)

Au lieu d'attendre une liste de Denis, Claude propose lui-même un échantillon de 41 intitulés (22 postes précis, 19 intitulés dits librement ou vagues), mesuré avec le prototype de rapprochement sur les 13 843 intitulés du ROME.

**Quatre niveaux proposés**
- **A, fiche trouvée et présélectionnée (modifiable)** : meilleur score au moins 0,85 ET écart d'au moins 0,10 avec la deuxième fiche (ou intitulé identique après accord masculin/féminin). Mesuré : 24 cas sur 41 (Serveuse, Cariste, Aide-soignante, Caissière, Magasinier, Chauffeur de taxi, Vendanges, Aide au déménagement…).
- **B, plusieurs fiches possibles, aucune présélectionnée** : score au moins 0,75 mais écart inférieur à 0,10 (Auxiliaire de vie : trois fiches à 0,83 à 0,85 ; Agent d'entretien : trois à 0,87 à 0,88). La personne choisit, la liste est courte (5 au plus).
- **C, fiches approchantes** : de 0,5 à 0,75, liste de 5 au plus avec priorité au secteur des autres expériences de la personne (Garde d'enfants le soir, Ménage chez des particuliers, Couturière à domicile, Soins aux chevaux d'un voisin).
- **D, rien d'affirmé** : sous 0,5 ou intitulé vague : aucune fiche, aucun secteur affirmé, saisie libre, les 21 secteurs montrés, les deux ou trois plus probables en tête si le vote est net.

**Quatre défauts du prototype à corriger avant de l'utiliser (constatés dans la mesure)**
1. Le raccourcissement des mots à six lettres crée de fausses rencontres : « Intérim » rapproché d'« Architecte d'intérieur » (0,87), « Commerçant » de « Commercial » (1,00), « Enseignante du primaire » d'« Enseigniste » (0,58). À remplacer par un traitement prudent (pluriel, féminin), sans couper les mots.
2. Les intitulés vagues donnent de fausses fiches (« Bénévolat » : « Animateur de chantier de jeunes bénévoles » à 0,80 ; « Missions diverses » : « Chargé de mission RH diversité handicap » à 0,87). Une liste de mots vagues (intérim, mission, divers, petits boulots, job, saisonnier, bénévolat, stage, travail, emploi) envoie directement au niveau D.
3. Les doubles genres du ROME (« Valet / Femme de chambre ») ne sont pas séparés : « Femme de chambre » ne trouve que 0,49. À séparer en deux formes, au masculin et au féminin.
4. Des mots dérivés ne se rapprochent pas (« Travaux de peinture » et « Peintre en bâtiment » : 0,42). Cela restera au niveau D, avec le secteur Bâtiment par le vote ; accepté comme limite.

## 7. Lot 2 : FAIT (14/11/2026)
Fichier `modules/missions-competences/rechercheFiche.js` (logique pure, chargé par `index.html`, exporté pour Node), tests `tests/missionsCompetencesRecherche.test.js` (9 tests, sur le répertoire réel). Suite complète : 2 808 tests verts. Vérifié dans le navigateur : « Serveuse » donne le niveau A (Serveur), « Soins aux chevaux d'un voisin » le niveau C (4 fiches) ; première recherche environ 0,1 seconde (construction de l'index), suivantes 3 millisecondes.
Résultat sur les 41 intitulés : 25 en A, 5 en B, 4 en C, 7 en D (contre 24 / 2 / 6 / 8 au prototype). Les quatre défauts sont traités : mots non coupés, mots vagues, formes féminines (table de 6 synonymes : femme de chambre, femme de ménage, homme de ménage, nounou, ripeur, vigile), intitulés dits autrement.
**Un ajout par rapport à ce que Denis a validé (à lui dire)** : un rapprochement par « radical » (l'action et celui qui la fait : vendange et vendangeur, distribution et distributeur, déménagement et déménageur) pèse 0,8 au lieu de 1. Sans lui, « Vendanges », « Distribution de prospectus » et « Aide au déménagement » ne trouvaient plus leur fiche, ce qui aurait été une régression par rapport au prototype. Il ne rapproche pas commercial et commerçant, ni enseignant et enseigniste.
Autres règles précisées : un intitulé identique (score 1,00, seul à ce score) est toujours en A ; un secteur ne se déduit que d'un rapprochement qui retrouve au moins la moitié des mots du poste (« Aide aux devoirs » ne propose plus l'agriculture).
Limites connues : « Travaux de peinture » ne trouve pas « Peintre » (C) ; « Vendanges » n'a qu'une fiche proche (B à 0,8, liste d'une seule fiche) ; « Enseignante du primaire » ne trouve pas « Professeur des écoles » (C faible).

## 8. Lot 1 : FAIT (14/11/2026)

Fichier `modules/missions-competences/etape.js` (logique pure, chargé par `index.html` après la recherche, exporté pour Node), tests `tests/missionsCompetencesEtape.test.js` (22 tests, sur les fiches réelles : assistant de vie, aide-soignante, métier visé AES). Suite complète : 2 830 tests verts. Vérifié aussi dans le navigateur (fonctions présentes, compteur « 1/16 » identique à la maquette, aucune erreur).

**Ce que fait la brique** : état de l'étape (sérialisable, remis en forme s'il est abîmé) ; fiche normalisée (missions `mi`, compétences courtes de `baseMetiers`, activités précises `k` avec les tâches du cœur d'abord) ; propositions fusionnées sans doublon entre expériences et rangées (métier visé, puis communes à deux expériences ou plus, puis le reste) ; clic en vue d'ensemble, clic par expérience, compétence écrite par la personne ; bilan, compteur « n/16 » et contenu de l'onglet « Métier visé » (deux rubriques à place stable, les plus courantes d'abord hors expériences) ; écriture dans le dossier avec suivi de ce que l'étape a ajouté (jamais retiré autre chose, idempotent, mission déjà présente non dupliquée, activités précises écrites en dernier) ; identifiant d'étape `idEtape` des expériences (retrouvé par poste et employeur s'il se perd, jamais repris par une nouvelle expérience).

**Audit de l'identifiant (fait)** : l'application copie déjà les expériences clé par clé (`Object.keys(e)` dans la normalisation, le moteur, le composeur, les modèles de CV) : le champ les traverse sans gêne. Les expériences créées par un import n'en ont pas : la brique les relie alors par poste et employeur.

**Constats à connaître pour le lot 3 et suivants** :
- Les compétences courtes viennent de `baseMetiers`, pas des seules fiches générées (133 fiches du ROME, dont Assistant de vie, Employé libre-service et Serveur, sont écrites à la main). 3 fiches du ROME (F1619, M1805, N1210) n'ont aucune compétence courte, et 6 n'ont aucune mission `mi` : l'écran doit gérer une liste vide (saisie libre).
- La brique reçoit les outils d'écriture existants en paramètre (`ajouterSavoirFaireCV` et ses six cousins de `js/app.js`), elle n'en réécrit aucun : à brancher au lot 3.
- Les activités précises ne comptent pas dans le « 8 à 12 compétences » (décision 2 du plan) ; la maquette, elle, les comptait avec les savoir-faire : l'écran du lot 3 suit le plan.
- Le suivi `ajoute` ne retire qu'une compétence écrite par l'étape ; si la personne la retire elle-même ailleurs (« Modifier mon CV »), l'étape ne la remet pas.
- Alias des fiches (`METIERS_ROME_ALIAS`) non repris : 1 920 codes sur 1 923 ont une entrée directe.
